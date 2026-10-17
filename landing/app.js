(function () {
  const $ = (id) => document.getElementById(id);
  const cfg = window.LANDING || {};

  // Only follow https links (the Stripe links come from the HTML).
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" ? u.href : "";
    } catch { return ""; }
  }

  // ---------- Hero photo: use assets/hero.jpg once it exists, otherwise the drawn skyline ----------
  const heroBg = $("hero-bg");
  if (heroBg) {
    const probe = new Image();
    probe.onload = () => heroBg.style.setProperty("--hero-img", `url("${probe.src}")`);
    probe.src = "assets/hero.jpg";
  }

  // ---------- Photos: hide a missing image so the placeholder shows ----------
  document.querySelectorAll(".frame img").forEach((img) => {
    const miss = () => { img.hidden = true; };
    img.addEventListener("error", miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });

  // ---------- Edition, price and checkout ----------
  const form = $("buy-form");
  if (form) {
    const radios = [...form.querySelectorAll('input[name="edition"]')];
    const total = $("total"), note = $("note"), btn = $("checkout");
    function update() {
      const r = radios.find((x) => x.checked) || radios[0];
      total.textContent = r.dataset.price;
      note.textContent = r.dataset.note || "";
      const link = safeUrl(r.dataset.link || "");
      if (link) {
        btn.href = link; btn.removeAttribute("aria-disabled"); btn.textContent = "Checkout";
        btn.target = "_self"; btn.rel = "noopener";
      } else {
        btn.href = "#top"; btn.setAttribute("aria-disabled", "true"); btn.textContent = "Opens soon";
      }
    }
    form.addEventListener("submit", (e) => e.preventDefault());
    radios.forEach((r) => r.addEventListener("change", update));
    update();
  }

  // ---------- Footer bits ----------
  const y = $("year"); if (y) y.textContent = new Date().getFullYear();

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
  banner.className = "consent" + (cfg.analyticsSrc ? " two" : ""); banner.hidden = true;
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
  // On phones the card sits at the bottom of the first screen: leave room while the banner is open.
  const syncBanner = () => document.documentElement.classList.toggle("consent-open", !banner.hidden);
  new MutationObserver(syncBanner).observe(banner, { attributes: true, attributeFilter: ["hidden"] });

  const choice = read();
  if (choice === "all") loadAnalytics();
  if (!choice) banner.hidden = false;
  syncBanner();
  document.querySelectorAll("#cookie-settings").forEach((b) => b.addEventListener("click", () => { banner.hidden = false; ok.focus(); }));
})();
