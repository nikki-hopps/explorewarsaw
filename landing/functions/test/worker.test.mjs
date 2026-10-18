import test from "node:test";
import assert from "node:assert/strict";
import worker from "../../../worker/index.js";

const ctx = { waitUntil() {} };
const env = { DOWNLOAD_SIGNING_SECRET: "x".repeat(32), ASSETS: { fetch: async (r) => new Response("asset:" + new URL(r.url).pathname) } };

test("pages are served by the assets binding", async () => {
  const res = await worker.fetch(new Request("https://site.test/privacy.html"), env, ctx);
  assert.equal(await res.text(), "asset:/privacy.html");
});
test("download without a valid token is refused", async () => {
  const res = await worker.fetch(new Request("https://site.test/api/download?t=bad"), env, ctx);
  assert.equal(res.status, 410);
});
test("webhook only accepts POST and rejects a bad signature", async () => {
  assert.equal((await worker.fetch(new Request("https://site.test/api/stripe-webhook"), env, ctx)).status, 404);
  const res = await worker.fetch(new Request("https://site.test/api/stripe-webhook", { method: "POST", body: "{}" }), env, ctx);
  assert.equal(res.status, 400);
});
test("unknown api paths are 404", async () => {
  assert.equal((await worker.fetch(new Request("https://site.test/api/other"), env, ctx)).status, 404);
});
