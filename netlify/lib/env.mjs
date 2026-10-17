// Adapts Netlify to the small interface the delivery code expects:
//   env.EBOOKS.get(key)      -> { body } or null   (private file storage, Netlify Blobs "ebooks")
//   env.DELIVERIES.get/put   -> tiny key-value store (Netlify Blobs "deliveries")
import { getStore } from "@netlify/blobs";

const NAMES = ["STRIPE_WEBHOOK_SECRET", "STRIPE_READ_KEY", "EBOOK_PAYMENT_LINK_IDS", "DOWNLOAD_SIGNING_SECRET", "SITE_URL",
  "EMAIL_API_KEY", "MAIL_FROM", "EBOOK_PDF_KEY", "EBOOK_EPUB_KEY"];

export function makeEnv() {
  const env = {};
  for (const n of NAMES) env[n] = process.env[n];
  const files = getStore("ebooks");
  const log = getStore("deliveries");
  env.EBOOKS = { get: async (key) => { const body = await files.get(key, { type: "stream" }); return body ? { body } : null; } };
  env.DELIVERIES = { get: (k) => log.get(k), put: (k, v) => log.set(k, v) }; // Blobs has no expiry option, so options are ignored
  return env;
}
