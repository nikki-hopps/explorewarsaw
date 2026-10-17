// Signed, expiring download tokens. Web Crypto only, so it runs on Cloudflare, Netlify, Vercel and Node.
const enc = new TextEncoder();
export const TTL_SECONDS = 72 * 60 * 60; // links die after 72 hours

const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const key = (secret, usage) => crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);

// Returns { token, expires } where expires is a Unix time in seconds.
export async function issueToken(secret, sessionId, now = Date.now(), ttl = TTL_SECONDS) {
  const expires = Math.floor(now / 1000) + ttl;
  const payload = b64u(enc.encode(JSON.stringify({ s: sessionId, e: expires })));
  const sig = await crypto.subtle.sign("HMAC", await key(secret, "sign"), enc.encode(payload));
  return { token: `${payload}.${b64u(sig)}`, expires };
}

// Returns { sessionId, expires } for a valid, unexpired token, otherwise null.
export async function verifyToken(secret, token, now = Date.now()) {
  if (typeof token !== "string" || token.length > 1000) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret, "verify"), fromB64u(parts[1]), enc.encode(parts[0]));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64u(parts[0])));
    if (typeof data.s !== "string" || typeof data.e !== "number" || data.e * 1000 < now) return null;
    return { sessionId: data.s, expires: data.e };
  } catch {
    return null;
  }
}
