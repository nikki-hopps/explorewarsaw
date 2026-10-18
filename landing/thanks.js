// Shows the right message for what was bought, and for e-book orders the download link straight away.
// The same link is also emailed, so nothing is lost if this fails.
(function () {
  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get("session_id");
  if (!id) return;
  const SHIP = "Your hardcover is being prepared and ships across Europe in 2 to 3 days. Stripe has emailed you the receipt.";
  fetch("/api/claim?session_id=" + encodeURIComponent(id))
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d) return; // keep the neutral message
      const physical = d.kind === "book" || d.kind === "bundle";
      if (d.url) {
        $("dl-link").href = d.url;
        $("dl").hidden = false;
        $("dl-note").hidden = false;
        $("dl-note").textContent = "This link works until " + new Date(d.expires * 1000).toLocaleString() + ". We have also emailed it to you.";
        $("msg").textContent = "Your payment went through. Your e-book is ready.";
      }
      if (physical) {
        $("ship").textContent = d.url ? "Your hardcover is on its way too: it ships across Europe in 2 to 3 days." : SHIP;
        $("ship").hidden = false;
        if (!d.url) $("msg").textContent = "Your payment went through.";
      }
    })
    .catch(() => {});
})();
