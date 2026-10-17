import test from "node:test";
import assert from "node:assert/strict";
import { issueToken, verifyToken, TTL_SECONDS } from "../_lib/token.js";
import { verifyStripeSignature, isEbookSale } from "../_lib/stripe.js";
import { onRequestPost as webhook } from "../api/stripe-webhook.js";
import { onRequestGet as claim } from "../api/claim.js";
import { onRequestGet as download } from "../api/download.js";

const SECRET = "test-signing-secret";
const WH = "whsec_test";
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
async function sign(body, secret = WH, t = Math.floor(Date.now() / 1000)) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return `t=${t},v1=${hex(await crypto.subtle.sign("HMAC", k, enc.encode(`${t}.${body}`)))}`;
}
const kv = () => { const m = new Map(); return { get: async (k) => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); }, m }; };
const env = (extra = {}) => ({ DOWNLOAD_SIGNING_SECRET: SECRET, STRIPE_WEBHOOK_SECRET: WH, STRIPE_READ_KEY: "rk_test", EBOOK_PAYMENT_LINK_ID: "plink_ebook", SITE_URL: "https://www.explorewarsaw.com", EMAIL_API_KEY: "re_test", MAIL_FROM: "Explore Warsaw <orders@explorewarsaw.com>", EBOOK_PDF_KEY: "book.pdf", EBOOK_EPUB_KEY: "book.epub", ...extra });
const paid = (over = {}) => ({ id: "cs_test_abc123", payment_status: "paid", payment_link: "plink_ebook", customer_details: { email: "reader@example.com" }, ...over });
const event = (session, type = "checkout.session.completed") => JSON.stringify({ id: "evt_1", type, data: { object: session } });
const req = async (body) => new Request("https://x/api/stripe-webhook", { method: "POST", body, headers: { "stripe-signature": await sign(body) } });

test("token: valid for 71h, dead after 73h, tamper-proof", async () => {
  const now = Date.now();
  const { token, expires } = await issueToken(SECRET, "cs_test_abc123", now);
  assert.equal(expires, Math.floor(now / 1000) + TTL_SECONDS);
  assert.equal((await verifyToken(SECRET, token, now + 71 * 3600e3)).sessionId, "cs_test_abc123");
  assert.equal(await verifyToken(SECRET, token, now + 73 * 3600e3), null);
  assert.equal(await verifyToken("other-secret", token, now), null);
  const [p, s] = token.split(".");
  const forged = btoa(JSON.stringify({ s: "cs_test_abc123", e: 9999999999 })).replace(/=+$/, "");
  assert.equal(await verifyToken(SECRET, `${forged}.${s}`, now), null);
  assert.equal(await verifyToken(SECRET, "garbage", now), null);
  assert.equal(await verifyToken(SECRET, `${p}.`, now), null);
});

test("stripe signature: accepts good, rejects wrong secret, stale and tampered", async () => {
  const body = '{"a":1}';
  assert.equal(await verifyStripeSignature(body, await sign(body), WH), true);
  assert.equal(await verifyStripeSignature(body, await sign(body, "whsec_other"), WH), false);
  assert.equal(await verifyStripeSignature(body, await sign(body, WH, Math.floor(Date.now() / 1000) - 3600), WH), false);
  assert.equal(await verifyStripeSignature(body + " ", await sign(body), WH), false);
  assert.equal(await verifyStripeSignature(body, null, WH), false);
});

test("webhook: bad signature is refused, paper sale is ignored", async () => {
  const body = event(paid());
  const bad = new Request("https://x", { method: "POST", body, headers: { "stripe-signature": "t=1,v1=00" } });
  assert.equal((await webhook({ request: bad, env: env() })).status, 400);
  const paperback = event(paid({ payment_link: "plink_paperback" }));
  const r = await webhook({ request: await req(paperback), env: env() });
  assert.equal(await r.text(), "Not an e-book sale");
});

test("webhook: e-book sale emails one 72h link, and a retry does not email again", async () => {
  const sent = [];
  globalThis.fetch = async (url, init) => { sent.push({ url, body: JSON.parse(init.body) }); return new Response("{}", { status: 200 }); };
  const e = env({ DELIVERIES: kv() });
  const body = event(paid());
  assert.equal(await (await webhook({ request: await req(body), env: e })).text(), "Sent");
  assert.equal(await (await webhook({ request: await req(body), env: e })).text(), "Already sent");
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].body.to, ["reader@example.com"]);
  assert.match(sent[0].body.text, /https:\/\/www\.explorewarsaw\.com\/api\/download\?t=/);
  assert.match(sent[0].body.text, /72 hours/);
});

test("webhook: if the email provider fails, Stripe is told to retry", async () => {
  globalThis.fetch = async () => new Response("no", { status: 500 });
  const r = await webhook({ request: await req(event(paid())), env: env({ DELIVERIES: kv() }) });
  assert.equal(r.status, 502);
});

test("claim: gives a link for a paid e-book session, nothing for others", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify(paid()), { status: 200 });
  const ok = await claim({ request: new Request("https://x/api/claim?session_id=cs_test_abc123"), env: env() });
  const data = await ok.json();
  assert.match(data.url, /^https:\/\/www\.explorewarsaw\.com\/api\/download\?t=/);
  globalThis.fetch = async () => new Response(JSON.stringify(paid({ payment_status: "unpaid" })), { status: 200 });
  assert.equal((await claim({ request: new Request("https://x/api/claim?session_id=cs_test_abc123"), env: env() })).status, 404);
  assert.equal((await claim({ request: new Request("https://x/api/claim?session_id=../../etc"), env: env() })).status, 404);
});

test("download: serves the file for a valid token, refuses expired, forged and path tricks", async () => {
  const objects = { "book.pdf": "PDFDATA", "book.epub": "EPUBDATA" };
  const e = env({ EBOOKS: { get: async (k) => (objects[k] ? { body: objects[k] } : null) }, DELIVERIES: kv() });
  const { token } = await issueToken(SECRET, "cs_test_abc123");
  const get = (q) => download({ request: new Request(`https://x/api/download?${q}`), env: e });

  const menu = await get(`t=${token}`);
  assert.equal(menu.status, 200);
  assert.match(await menu.text(), /Download PDF/);

  const pdf = await get(`t=${token}&f=pdf`);
  assert.equal(pdf.headers.get("content-type"), "application/pdf");
  assert.match(pdf.headers.get("content-disposition"), /attachment/);
  assert.equal(await pdf.text(), "PDFDATA");

  assert.equal((await get(`t=${token}&f=../../secret`)).status, 404);
  assert.equal((await get(`t=${token}x&f=pdf`)).status, 410);
  const old = (await issueToken(SECRET, "cs_test_abc123", Date.now() - 80 * 3600e3)).token;
  assert.equal((await get(`t=${old}&f=pdf`)).status, 410);

  for (let i = 0; i < 12; i++) await get(`t=${token}&f=epub`);
  assert.equal((await get(`t=${token}&f=epub`)).status, 429);
});
