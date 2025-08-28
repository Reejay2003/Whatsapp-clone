// Minimal E2EE helper: ECDH P-256 + AES-GCM + simple password-protected backup
import { axiosInstance } from "./axios";

// ---------- small utils ----------
const enc = new TextEncoder();
const dec = new TextDecoder();

export const E2E_VERSION = "e2e1";       // protocol marker
const CURVE = "P-256";

const LS_PRIV = "e2e_priv_jwk_v1";
const LS_PUB  = "e2e_pub_jwk_v1";


// ---------- device keypair (browser only) ----------
export async function ensureDeviceKeypair() {
  const havePriv = localStorage.getItem(LS_PRIV);
  const havePub  = localStorage.getItem(LS_PUB);

  if (havePriv && havePub) return JSON.parse(havePub);

  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: CURVE },
    true,
    ["deriveKey", "deriveBits"]
  );

  const privJwk = await crypto.subtle.exportKey("jwk", privateKey);
  const pubJwk  = await crypto.subtle.exportKey("jwk", publicKey);

  localStorage.setItem(LS_PRIV, JSON.stringify(privJwk));
  localStorage.setItem(LS_PUB, JSON.stringify(pubJwk));

  return pubJwk;
}

export async function getPrivateKey() {
  const jwkRaw = localStorage.getItem(LS_PRIV);
  if (!jwkRaw) throw new Error("No private key in localStorage");
  const jwk = JSON.parse(jwkRaw);
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: CURVE }, false, ["deriveKey","deriveBits"]);
}

export async function getPublicJwk() {
  const jwkRaw = localStorage.getItem(LS_PUB);
  return jwkRaw ? JSON.parse(jwkRaw) : null;
}

// ---------- publish / fetch peer pubkeys ----------
export async function publishMyPublicKey() {
  const publicJwk = await ensureDeviceKeypair();
  await axiosInstance.put("/auth/dhkey", { publicJwk });
}

export async function fetchPeerPublicKey(userId) {
  const { data } = await axiosInstance.get(`/auth/dhkey/${userId}`);
  if (!data?.publicJwk) throw new Error("Peer has no E2E key");
  const pubKey = await crypto.subtle.importKey(
    "jwk",
    data.publicJwk,
    { name: "ECDH", namedCurve: CURVE },
    true,
    []
  );
  return pubKey;
}

// ---------- derive shared AES key ----------
export async function deriveConversationKey(peerPublicKey) {
  const myPriv = await getPrivateKey();
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPublicKey },
    myPriv,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ---------- fingerprint (for UI verification) ----------
export async function publicKeyFingerprintHex(jwk) {
  const bytes = enc.encode(JSON.stringify(jwk));
  const hash  = await crypto.subtle.digest("SHA-256", bytes);
  const hex   = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,"0")).join("");
  return hex.match(/.{1,8}/g).join("-");
}

// ---------- encrypt / decrypt payload ----------
export async function encryptPayload(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM 96-bit IV
  const pt = enc.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, pt);
  return { v: E2E_VERSION, iv: toB64Url(iv.buffer), ct: toB64Url(ct) };
}

export async function decryptPayload(key, pkg) {
  if (!pkg?.iv || !pkg?.ct) throw new Error("Missing iv/ct");
  const ivBuf = fromB64Url(pkg.iv);
  if (new Uint8Array(ivBuf).byteLength !== 12) throw new Error("Bad IV size");
  const ctBuf = fromB64Url(pkg.ct);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuf) },
    key,
    ctBuf
  );
  return JSON.parse(dec.decode(pt));
}

// ---------- packing into your existing "text" field ----------
export function packToText(pkg) {
  // e2e1:<base64url_ct>:<base64url_iv>
  return `${pkg.v}:${pkg.ct}:${pkg.iv}`;
}

// safer split (only into 3 parts)
export function tryUnpackFromText(text) {
  if (typeof text !== "string" || !text.startsWith(`${E2E_VERSION}:`)) return null;
  const first = text.indexOf(":");
  const second = text.indexOf(":", first + 1);
  if (first === -1 || second === -1) return null;
  const v = text.slice(0, first);
  const ct = text.slice(first + 1, second).replace(/\s+/g, "");
  const iv = text.slice(second + 1).replace(/\s+/g, "");
  return { v, ct, iv };
}

// ---------- SIMPLE BACKUP (password-protected private key) ----------
export async function exportPrivateJwkPlain() {
  const jwk = localStorage.getItem(LS_PRIV);
  return jwk ? JSON.parse(jwk) : null;
}

export async function importPrivateJwkPlain(jwk) {
  localStorage.setItem(LS_PRIV, JSON.stringify(jwk));
  return true;
}

async function deriveKeyFromPassword(password, saltB64, iters) {
  const salt = new Uint8Array(fromB64Url(saltB64));
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: iters },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt","decrypt"]
  );
}

export async function createEncryptedKeyBackup(password) {
  const jwk = await exportPrivateJwkPlain();
  if (!jwk) throw new Error("No private key to back up");
  const iters = 200_000; // adjust for UX
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const k    = await deriveKeyFromPassword(password, toB64Url(salt.buffer), iters);
  const pt   = enc.encode(JSON.stringify(jwk));
  const ct   = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, pt);
  return {
    v: "kb1",
    kdf: "PBKDF2-SHA256",
    iters,
    salt: toB64Url(salt.buffer),
    iv: toB64Url(iv.buffer),
    ct: toB64Url(ct),
  };
}

export async function restorePrivateKeyFromBackup(password, backup) {
  const { iters, salt, iv, ct } = backup || {};
  if (!iters || !salt || !iv || !ct) throw new Error("Invalid backup");
  const k  = await deriveKeyFromPassword(password, salt, iters);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(fromB64Url(iv)) },
    k,
    fromB64Url(ct)
  );
  const jwk = JSON.parse(dec.decode(pt));
  await importPrivateJwkPlain(jwk);
  return jwk;
}

// ---------- server calls for backup ----------
export async function uploadKeyBackup(backupObj) {
  await axiosInstance.put("/auth/keybackup", backupObj);
}
export async function fetchMyKeyBackup() {
  const { data } = await axiosInstance.get("/auth/keybackup");
  return data?.backup || null;
}

// Safe, chunked Base64URL encode/decode for big ArrayBuffers

function toB64Url(buf) {
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000; // 32 KB per chunk to avoid call stack overflow
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64Url(s) {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}