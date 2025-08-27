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

// ---------- encrypt / decrypt ----------
export async function encryptPayload(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = enc.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    v: E2E_VERSION,
    iv: b64(iv.buffer),
    ct: b64(ct),
  };
}

export async function decryptPayload(key, pkg) {
  const iv = ubuf(pkg.iv);
  const ct = ubuf(pkg.ct);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, ct);
  return JSON.parse(dec.decode(pt));
}

// ---------- packing into your existing "text" field ----------
export function packToText(pkg) {
  // e2e1:<base64ct>:<base64iv>
  return `${pkg.v}:${pkg.ct}:${pkg.iv}`;
}

export function tryUnpackFromText(text) {
  if (!text || typeof text !== "string") return null;
  if (!text.startsWith(`${E2E_VERSION}:`)) return null;
  const [_v, ct, iv] = text.split(":");
  return { v: E2E_VERSION, ct, iv };
}