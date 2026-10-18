// Sends the download email through Resend (https://resend.com): a branded HTML version plus a plain-text version.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const CONTACT = "contactexplorewarsaw@gmail.com";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

export function buildDownloadEmail({ url, expires, kind = "ebook", site = "https://www.explorewarsawguide.com", contact = CONTACT }) {
  const when = new Date(expires * 1000).toUTCString().replace("GMT", "UTC");
  const bundle = kind === "bundle";
  const subject = "Your Warsaw Viewpoints e-book is ready";
  const preheader = "Thank you for your order. Your download link works for 72 hours.";

  const shipText = bundle ? "\nYour hardcover\nIt is being prepared and ships across Europe in 2 to 3 days.\n" : "";
  const text = `Thank you for your order!

Your e-book "Warsaw Viewpoints: 50 views of Warsaw loved by locals" is ready.

Download it here:
${url}

This link works for 72 hours (until ${when}) and can be used up to 10 times. The file is large, so we suggest downloading on Wi-Fi. If the link expires, just reply to this email and we will send a new one.
${shipText}
Payment receipt and invoice
Stripe sends your payment receipt in a separate email. If you need an invoice, reply to this email with your name or company name, address and VAT number (if you have one), and we will send it to you.

Questions? Just reply to this email, or write to ${contact}.

Enjoy exploring Warsaw!
Nikol, explore.warsaw

${site}
Instagram: https://www.instagram.com/explore.warsaw/
TikTok: https://www.tiktok.com/@explore.warsaw
`;

  const row = (inner) => `<tr><td style="padding:0 36px 22px 36px;font:15px/1.6 ${FONT};color:#2b2b2b">${inner}</td></tr>`;
  const h = (t) => `<div style="font:600 12px/1.4 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:#8a8a85;margin:0 0 6px">${t}</div>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f7f6f3">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f7f6f3">${esc(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f6f3"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e4dd">
  <tr><td align="center" style="padding:34px 36px 10px 36px">
    <a href="${esc(site)}" style="text-decoration:none"><img src="${esc(site)}/assets/img/logo.png" width="72" height="72" alt="explore.warsaw" style="display:block;border-radius:50%;border:0"></a>
  </td></tr>
  <tr><td align="center" style="padding:6px 36px 6px 36px">
    <div style="display:inline-block;width:46px;height:46px;border-radius:50%;background:#1e9e57;color:#ffffff;font:700 26px/46px ${FONT};text-align:center">&#10003;</div>
  </td></tr>
  <tr><td align="center" style="padding:10px 36px 6px 36px"><h1 style="margin:0;font:400 32px/1.15 ${SERIF};color:#121212">Thank you for your order!</h1></td></tr>
  <tr><td align="center" style="padding:6px 36px 26px 36px;font:16px/1.55 ${FONT};color:#55554f">Your e-book <strong style="color:#121212">Warsaw Viewpoints</strong> is ready.</td></tr>

  <tr><td align="center" style="padding:0 36px 12px 36px">
    <a href="${esc(url)}" style="display:inline-block;background:#121212;color:#ffffff;text-decoration:none;font:600 14px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;padding:18px 34px;border-radius:99px">Download your e-book</a>
  </td></tr>
  <tr><td align="center" style="padding:0 36px 28px 36px;font:13px/1.55 ${FONT};color:#77776f">This link works for 72 hours, until <strong>${esc(when)}</strong>.<br>The file is large, so we suggest downloading on Wi-Fi.</td></tr>

  ${bundle ? `<tr><td style="padding:0 36px 22px 36px"><div style="background:#f7f6f3;border-radius:14px;padding:18px 20px;font:15px/1.55 ${FONT};color:#2b2b2b">${h("Your hardcover")}It is being prepared and ships across Europe in <strong>2 to 3 days</strong>.</div></td></tr>` : ""}

  ${row(`${h("Payment receipt and invoice")}Stripe sends your payment receipt in a separate email. If you need an invoice, reply to this email with your name or company name, address and VAT number (if you have one), and we will send it to you.`)}
  ${row(`${h("The link expired, or something is wrong?")}Reply to this email and we will sort it out. You can also write to <a href="mailto:${esc(contact)}" style="color:#121212">${esc(contact)}</a>.`)}

  <tr><td style="padding:6px 36px 30px 36px;font:15px/1.6 ${FONT};color:#2b2b2b">Enjoy exploring Warsaw!<br><span style="font:italic 17px/1.6 ${SERIF}">Nikol, explore.warsaw</span></td></tr>

  <tr><td align="center" style="background:#f7f6f3;padding:22px 36px;font:13px/1.7 ${FONT};color:#77776f;border-top:1px solid #e7e4dd">
    <a href="${esc(site)}" style="color:#121212;font-weight:600;text-decoration:none">www.explorewarsawguide.com</a><br>
    <a href="https://www.instagram.com/explore.warsaw/" style="color:#77776f">Instagram</a> &nbsp;&middot;&nbsp; <a href="https://www.tiktok.com/@explore.warsaw" style="color:#77776f">TikTok</a> &nbsp;&middot;&nbsp; @explore.warsaw
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { subject, text, html };
}

export async function sendDownloadEmail({ env, to, url, expires, kind }) {
  const { subject, text, html } = buildDownloadEmail({ url, expires, kind, site: env.SITE_URL || undefined, contact: env.REPLY_TO || CONTACT });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [to],
      reply_to: env.REPLY_TO || CONTACT, // replies reach a real mailbox, not the no-reply sending address
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300); // the provider says why (wrong key, unverified sender, ...)
    throw new Error(`Email provider returned ${res.status}: ${detail}`);
  }
}
