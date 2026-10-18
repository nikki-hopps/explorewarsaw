// Sends the download email through Resend (https://resend.com). Plain text only, so there is nothing to inject into.
export async function sendDownloadEmail({ env, to, url, expires }) {
  const when = new Date(expires * 1000).toUTCString();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [to],
      subject: "Your Warsaw Viewpoints e-book download",
      text: `Thank you for your order.\n\nDownload your e-book here:\n${url}\n\nThis link works until ${when} (72 hours after your purchase). If it expires, reply to this email and we will send a new one.\n`,
    }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300); // the provider says why (wrong key, unverified sender, ...)
    throw new Error(`Email provider returned ${res.status}: ${detail}`);
  }
}
