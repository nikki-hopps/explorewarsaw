(function () {
  const $ = (id) => document.getElementById(id);
  const cfg = window.LANDING || {};

  // ---------- Footer year ----------
  const y = $("year"); if (y) y.textContent = new Date().getFullYear();

  // ---------- Top bar highlights the section you are in; sticky "Shop" bar on phones ----------
  if ("IntersectionObserver" in window) {
    const links = {};
    document.querySelectorAll("[data-nav]").forEach((a) => { links[a.dataset.nav] = a; });
    const nav = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) Object.keys(links).forEach((k) => links[k].setAttribute("aria-current", String(k === e.target.id)));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["top", "story", "buy", "proof"].forEach((id) => { const el = $(id); if (el) nav.observe(el); });

    const sticky = $("sticky"), cta = document.querySelector(".hero-cta .btn"), cards = document.querySelector(".cards");
    if (sticky && cta && cards) {
      let heroOut = false, shopIn = false;
      const sync = () => { sticky.hidden = !(heroOut && !shopIn); };
      new IntersectionObserver((e) => { heroOut = !e[0].isIntersecting; sync(); }).observe(cta);
      new IntersectionObserver((e) => { shopIn = e[0].isIntersecting; sync(); }).observe(cards);
    }
  }

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
    const no = Object.assign(document.createElement("button"), { type: "button", className: "btn ghost", textContent: "Essential only" });
    no.addEventListener("click", () => { save("essential"); banner.hidden = true; });
    row.appendChild(no);
  }
  ok.addEventListener("click", () => { save("all"); banner.hidden = true; loadAnalytics(); });
  banner.append(text, row);
  document.body.appendChild(banner);
  // While the banner is open it replaces the sticky Shop bar on phones.
  const syncBanner = () => document.documentElement.classList.toggle("consent-open", !banner.hidden);
  new MutationObserver(syncBanner).observe(banner, { attributes: true, attributeFilter: ["hidden"] });

  const choice = read();
  if (choice === "all") loadAnalytics();
  if (!choice) banner.hidden = false;
  syncBanner();
  document.querySelectorAll("#cookie-settings").forEach((b) => b.addEventListener("click", () => { banner.hidden = false; ok.focus(); }));
})();
