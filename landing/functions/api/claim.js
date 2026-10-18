import { getCheckoutSession, isEbookSale, orderKind } from "../_lib/stripe.js";
import { issueToken } from "../_lib/token.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

// The thank-you page calls this with the Checkout Session id from the URL, so it can show the right message
// ("ebook", "bundle" or "book") and, for e-book orders, the download link at once.
// The session id is unguessable and only the buyer's browser receives it. The email is the backup.
export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get("session_id");
  const session = await getCheckoutSession(id, env.STRIPE_READ_KEY);
  if (!session || session.payment_status !== "paid") return json({ error: "not_found" }, 404);
  if (!isEbookSale(session, env)) return json({ kind: "book" }); // hardcover only: nothing to download
  const { token, expires } = await issueToken(env.DOWNLOAD_SIGNING_SECRET, session.id);
  return json({ kind: orderKind(session, env), url: `${env.SITE_URL}/api/download?t=${token}`, expires });
}
