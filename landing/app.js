(function () {
  const $ = (id) => document.getElementById(id);
  const cfg = window.LANDING || {};

  // Only follow http(s) links (the Stripe link comes from the HTML).
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" ? u.href : "";
    } catch { return ""; }
  }

  // ---------- Photos: hide a missing image so the placeholder shows ----------
  function watchImage(img) {
    const miss = () => { img.hidden = true; };
    img.addEventListener("error", miss);
    if (img.complete && img.naturalWidth === 0) miss();
  }
  document.querySelectorAll(".frame img").forEach(watchImage);

  // ---------- Gallery ----------
  const stageImg = $("g-img");
  if (stageImg) {
    const ph = $("g-ph");
    const show = (src, alt) => {
      stageImg.hidden = false;
      stageImg.alt = alt;
      stageImg.src = src;
    };
    stageImg.addEventListener("error", () => { stageImg.hidden = true; });
    stageImg.addEventListener("load", () => { stageImg.hidden = false; });
    const thumbs = [...document.querySelectorAll(".thumb")];
    thumbs.forEach((t) => t.addEventListener("click", () => {
      thumbs.forEach((o) => o.setAttribute("aria-pressed", String(o === t)));
      show(t.dataset.src, t.dataset.alt);
    }));
    thumbs[0] && show(thumbs[0].dataset.src, thumbs[0].dataset.alt);
  }

  // ---------- Editions and checkout ----------
  const form = $("buy-form");
  if (form) {
    const radios = [...form.querySelectorAll('input[name="edition"]')];
    const total = $("total"), btn = $("checkout");
    function update() {
      const r = radios.find((x) => x.checked) || radios[0];
      total.textContent = r.dataset.price;
      const link = safeUrl(r.dataset.link || "");
      if (link) {
        btn.href = link; btn.removeAttribute("aria-disabled"); btn.textContent = "Checkout with Stripe";
        btn.target = "_self"; btn.rel = "noopener";
      } else {
        btn.href = "#buy"; btn.setAttribute("aria-disabled", "true"); btn.textContent = "Checkout opens soon";
      }
    }
    form.addEventListener("submit", (e) => e.preventDefault());
    radios.forEach((r) => r.addEventListener("change", update));
    update();
    const lowest = Math.min(...radios.map((r) => parseFloat(r.dataset.price)));
    const cur = (radios[0].dataset.price.match(/[A-Za-z]+$/) || ["PLN"])[0];
    const hp = $("hero-price");
    if (hp && isFinite(lowest)) hp.textContent = `from ${lowest} ${cur}`;
  }

  // ---------- Footer bits ----------
  const y = $("year"); if (y) y.textContent = new Date().getFullYear();
  const mail = $("mail"), fm = $("faq-mail");
  if (mail && fm) { fm.href = mail.href; fm.textContent = mail.textContent; }

  // ---------- Cookie banner ----------
  // Essential storage only by default. Optional analytics (config.js) loads only after "Accept".
  const KEY = "ew-consent";
  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch { /* ignore */ } };

  function loadAnalytics() {
    if (!cfg.analyticsSrc || document.querySelector("script[data-ew-analytics]")) return;
    const s = document.createElement("script");
    s.src = cfg.analyticsSrc; s.setAttribute("data-ew-analytics", "");
    for (const [k, v] of Object.entries(cfg.analyticsAttrs || {})) s.setAttribute(k, v);
    document.head.appendChild(s);
  }

  const banner = document.createElement("div");
  banner.className = "consent"; banner.hidden = true;
  banner.setAttribute("role", "dialog"); banner.setAttribute("aria-label", "Cookie settings");
  const text = document.createElement("p");
  text.append(
    cfg.analyticsSrc
      ? "We use essential storage to remember this choice. With your permission we also measure visits to improve the page. "
      : "This site sets no tracking cookies. We only remember this choice on your device. Stripe may set its own cookies at checkout. ",
    Object.assign(document.createElement("a"), { href: "privacy.html", textContent: "Privacy policy" }),
    "."
  );
  const row = document.createElement("div"); row.className = "row";
  const ok = Object.assign(document.createElement("button"), { type: "button", className: "btn", textContent: cfg.analyticsSrc ? "Accept" : "Got it" });
  row.appendChild(ok);
  if (cfg.analyticsSrc) {
    const no = Object.assign(document.createElement("button"), { type: "button", className: "btn quiet", textContent: "Essential only" });
    no.addEventListener("click", () => { save("essential"); banner.hidden = true; });
    row.appendChild(no);
  }
  ok.addEventListener("click", () => { save("all"); banner.hidden = true; loadAnalytics(); });
  banner.append(text, row);
  document.body.appendChild(banner);

  const choice = read();
  if (choice === "all") loadAnalytics();
  if (!choice) banner.hidden = false;
  document.querySelectorAll("#cookie-settings").forEach((b) => b.addEventListener("click", () => { banner.hidden = false; ok.focus(); }));
})();
