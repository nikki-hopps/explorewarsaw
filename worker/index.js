// Cloudflare Worker entry. The site itself is served as static assets (free, no code runs).
// Only the three /api/ paths reach this file; each one calls the same handler the Netlify wrappers use.
import { onRequestGet as download } from "../landing/functions/api/download.js";
import { onRequestGet as claim } from "../landing/functions/api/claim.js";
import { onRequestPost as stripeWebhook } from "../landing/functions/api/stripe-webhook.js";

const ROUTES = {
  "GET /api/download": download,
  "GET /api/claim": claim,
  "POST /api/stripe-webhook": stripeWebhook,
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const handler = ROUTES[`${request.method} ${pathname}`];
    if (handler) return handler({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    if (pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
