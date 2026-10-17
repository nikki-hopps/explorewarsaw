import { verifyStripeSignature, PAID_EVENTS, isEbookSale } from "../_lib/stripe.js";
import { issueToken } from "../_lib/token.js";
import { sendDownloadEmail } from "../_lib/mail.js";

const reply = (body, status = 200) => new Response(body, { status });

export async function onRequestPost({ request, env }) {
  const raw = await request.text(); // the signature covers the exact raw bytes
  if (!(await verifyStripeSignature(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET))) return reply("Bad signature", 400);

  let event;
  try { event = JSON.parse(raw); } catch { return reply("Bad payload", 400); }
  if (!PAID_EVENTS.includes(event.type)) return reply("Ignored");

  const session = event.data && event.data.object;
  if (!isEbookSale(session, env)) return reply("Not an e-book sale");

  const to = session.customer_details && session.customer_details.email;
  if (!to) return reply("No customer email", 422);

  // Stripe retries on errors, so make sure one order never sends two emails.
  const sentKey = `sent:${session.id}`;
  if (env.DELIVERIES && (await env.DELIVERIES.get(sentKey))) return reply("Already sent");

  const { token, expires } = await issueToken(env.DOWNLOAD_SIGNING_SECRET, session.id);
  try {
    await sendDownloadEmail({ env, to, url: `${env.SITE_URL}/api/download?t=${token}`, expires });
  } catch {
    return reply("Email failed", 502); // tell Stripe to retry later
  }
  if (env.DELIVERIES) await env.DELIVERIES.put(sentKey, "1", { expirationTtl: 60 * 60 * 24 * 14 });
  return reply("Sent");
}
