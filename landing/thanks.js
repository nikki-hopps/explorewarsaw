// Shows the e-book link straight away. The same link is also emailed, so nothing is lost if this fails.
(function () {
  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get("session_id");
  if (!id) return;
  fetch("/api/claim?session_id=" + encodeURIComponent(id))
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.url) return; // a paperback order, or the link is only in the email
      $("dl-link").href = d.url;
      $("dl").hidden = false;
      $("dl-note").hidden = false;
      $("dl-note").textContent = "This link works until " + new Date(d.expires * 1000).toLocaleString() + ". We have also emailed it to you.";
      $("msg").textContent = "Your payment went through. Your e-book is ready.";
    })
    .catch(() => {});
})();
