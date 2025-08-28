// Minimal E2EE helper: ECDH P-256 + AES-GCM
import { axiosInstance } from "./axios";

// ---------- small utils ----------
const enc = new TextEncoder();
const dec = new TextDecoder();

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const ubuf = (b64s) => Uint8Array.from(atob(b64s), c => c.charCodeAt(0)).buffer;

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
  const jwk = JSON.parse(localStorage.getItem(LS_PRIV));
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: CURVE }, false, ["deriveKey","deriveBits"]);
}

export async function getPublicJwk() {
  return JSON.parse(localStorage.getItem(LS_PUB));
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
  // derive AES-GCM key
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
  // group for readability
  return hex.match(/.{1,8}/g).join("-");
}

// ---------- packing into your existing "text" field ----------
export function packToText(pkg) {
  // e2e1:<base64ct>:<base64iv>
  return `${pkg.v}:${pkg.ct}:${pkg.iv}`;
}

function toB64Url(buf) {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64Url(s) {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
}

export async function encryptPayload(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM 96-bit IV
  const pt = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, pt);
  return { v: "e2e1", iv: toB64Url(iv.buffer), ct: toB64Url(ct) };
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
  return JSON.parse(new TextDecoder().decode(pt));
}

// safer split (only into 3 parts)
export function tryUnpackFromText(text) {
  if (typeof text !== "string" || !text.startsWith("e2e1:")) return null;
  const first = text.indexOf(":");
  const second = text.indexOf(":", first + 1);
  if (first === -1 || second === -1) return null;
  const v = text.slice(0, first);
  const ct = text.slice(first + 1, second).replace(/\s+/g, "");
  const iv = text.slice(second + 1).replace(/\s+/g, "");
  return { v, ct, iv };
}