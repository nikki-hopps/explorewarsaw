const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Checks the Stripe-Signature header against the raw request body.
export async function verifyStripeSignature(rawBody, header, secret, now = Date.now(), toleranceSeconds = 300) {
  if (!header || !secret) return false;
  let t = null;
  const sigs = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=");
    if (k === "t") t = v; else if (k === "v1" && v) sigs.push(v);
  }
  if (!t || !sigs.length || !/^\d+$/.test(t)) return false;
  if (Math.abs(now / 1000 - Number(t)) > toleranceSeconds) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = hex(await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`)));
  return sigs.some((s) => safeEqual(s, mac));
}

// Only these two events mean "the money arrived".
export const PAID_EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];

// A session counts as an e-book sale only if it is paid and came from the e-book Payment Link.
export function isEbookSale(session, env) {
  return !!session && session.payment_status === "paid" && !!env.EBOOK_PAYMENT_LINK_ID && session.payment_link === env.EBOOK_PAYMENT_LINK_ID;
}

export async function getCheckoutSession(id, apiKey) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id || "")) return null;
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  return res.ok ? res.json() : null;
}
