// Shows the right order summary for what was bought, with the matching product picture.
// For e-book orders the download link is shown straight away (it is also emailed, so nothing is lost if this fails).
(function () {
  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get("session_id");
  if (!id) return;

  const TITLES = { ebook: "E-book", bundle: "Hardcover + e-book", book: "Hardcover" };
  const LEAD = {
    ebook: "Your payment went through. Your e-book is ready.",
    bundle: "Your payment went through. Your e-book is ready, and your hardcover is on its way.",
    book: "Your payment went through. Your hardcover is on its way.",
  };
  // [done?, text]
  const STEPS = (kind, mailed) => {
    const s = [[true, "Payment received. Stripe has emailed you the receipt."]];
    if (kind !== "book") s.push([true, "Your e-book is ready: download it below." + (mailed ? " We have also emailed you the link." : "")]);
    if (kind !== "ebook") s.push([false, "Your hardcover is being prepared."], [false, "We dispatch it within 2 business days, and DHL delivers it in 2 to 4 business days."]);
    return s;
  };

  fetch("/api/claim?session_id=" + encodeURIComponent(id))
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !TITLES[d.kind]) return; // keep the neutral message
      $("msg").textContent = LEAD[d.kind];
      $("o-title").textContent = TITLES[d.kind];
      const list = $("next");
      list.textContent = "";
      STEPS(d.kind, !!d.url).forEach(([done, text]) => {
        const li = document.createElement("li");
        li.className = done ? "done" : "todo";
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.setAttribute("aria-hidden", "true");
        const t = document.createElement("span");
        t.textContent = text;
        li.append(dot, t);
        list.appendChild(li);
      });
      if (d.url) {
        $("dl-link").href = d.url;
        $("dl").hidden = false;
        $("dl-note").hidden = false;
        $("dl-note").textContent = "This link works until " + new Date(d.expires * 1000).toLocaleString() + ".";
      }
      const order = $("order");
      order.dataset.kind = d.kind;
      order.hidden = false;
    })
    .catch(() => {});
})();
