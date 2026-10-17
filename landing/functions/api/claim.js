import { getCheckoutSession, isEbookSale } from "../_lib/stripe.js";
import { issueToken } from "../_lib/token.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

// The thank-you page calls this with the Checkout Session id from the URL to show the link instantly.
// The session id is unguessable and only the buyer's browser receives it. The email is the backup.
export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get("session_id");
  const session = await getCheckoutSession(id, env.STRIPE_READ_KEY);
  if (!isEbookSale(session, env)) return json({ error: "not_found" }, 404);
  const { token, expires } = await issueToken(env.DOWNLOAD_SIGNING_SECRET, session.id);
  return json({ url: `${env.SITE_URL}/api/download?t=${token}`, expires });
}
