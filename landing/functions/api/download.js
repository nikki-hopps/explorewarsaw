import { verifyToken } from "../_lib/token.js";

const MAX_DOWNLOADS = 10; // per purchase, so a leaked link cannot be shared around forever
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TYPES = { pdf: "application/pdf", epub: "application/epub+zip" };
const page = (body, status = 200) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download</title><body style="font:17px/1.6 system-ui;max-width:32rem;margin:15vh auto;padding:0 20px">${body}`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const t = url.searchParams.get("t");
  const valid = await verifyToken(env.DOWNLOAD_SIGNING_SECRET, t);
  if (!valid) return page("<h1>This link has expired</h1><p>Download links work for 72 hours. Reply to your order email and we will send a new one.</p>", 410);

  // Which files exist is decided here, never by the visitor.
  const files = { pdf: env.EBOOK_PDF_KEY, epub: env.EBOOK_EPUB_KEY };
  const format = url.searchParams.get("f");

  if (!format) {
    const when = new Date(valid.expires * 1000).toUTCString();
    const links = Object.keys(files).filter((f) => files[f]).map((f) => `<p><a href="?t=${encodeURIComponent(t)}&f=${f}">Download ${f.toUpperCase()}</a></p>`).join("");
    return page(`<h1>Your e-book</h1>${links}<p style="color:#666;font-size:.9rem">This page works until ${escapeHtml(when)}.</p>`);
  }
  if (!Object.hasOwn(TYPES, format) || !files[format]) return page("<h1>Not found</h1>", 404);

  if (env.DELIVERIES) {
    const k = `dl:${valid.sessionId}`;
    const used = Number(await env.DELIVERIES.get(k)) || 0;
    if (used >= MAX_DOWNLOADS) return page("<h1>Download limit reached</h1><p>Reply to your order email and we will help.</p>", 429);
    await env.DELIVERIES.put(k, String(used + 1), { expirationTtl: 60 * 60 * 24 * 14 });
  }

  const object = await env.EBOOKS.get(files[format]);
  if (!object) return page("<h1>Not found</h1>", 404);
  return new Response(object.body, {
    headers: {
      "Content-Type": TYPES[format],
      "Content-Disposition": `attachment; filename="explore-warsaw.${format}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
