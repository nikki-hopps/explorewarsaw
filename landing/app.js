(function () {
  const $ = (id) => document.getElementById(id);
  const cfg = window.LANDING || {};
  document.documentElement.classList.add("js"); // lets CSS animate things in only when scripting works

  // Only follow https links (the Stripe links come from the HTML).
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" ? u.href : "";
    } catch { return ""; }
  }

  // ---------- Hero photo: use assets/hero.jpg once it exists, otherwise the skyline drawing ----------
  const heroBg = $("hero-bg");
  if (heroBg) {
    const probe = new Image();
    probe.onload = () => { heroBg.style.setProperty("--hero-img", `url("${probe.src}")`); heroBg.classList.add("has-photo"); };
    probe.src = "assets/hero.jpg";
  }

  // ---------- Photos: hide a missing image so the placeholder shows ----------
  function watchImage(img) {
    const miss = () => { img.hidden = true; };
    img.addEventListener("error", miss);
    if (img.complete && img.naturalWidth === 0) miss();
  }
  document.querySelectorAll(".frame img").forEach(watchImage);

  // ---------- Gallery ----------
  let selectPhoto = () => {};
  const stageImg = $("g-img");
  if (stageImg) {
    const show = (src, alt) => { stageImg.hidden = false; stageImg.alt = alt; stageImg.src = src; };
    stageImg.addEventListener("error", () => { stageImg.hidden = true; });
    stageImg.addEventListener("load", () => { stageImg.hidden = false; });
    const thumbs = [...document.querySelectorAll(".thumb")];
    let current = Math.max(0, thumbs.findIndex((t) => t.getAttribute("aria-pressed") === "true"));
    selectPhoto = (i, scroll) => {
      current = (i + thumbs.length) % thumbs.length;
      thumbs.forEach((o, n) => o.setAttribute("aria-pressed", String(n === current)));
      show(thumbs[current].dataset.src, thumbs[current].dataset.alt);
      if (scroll) thumbs[current].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    };
    thumbs.forEach((t, i) => t.addEventListener("click", () => selectPhoto(i, false)));
    // Phones: swipe the big photo left or right
    const stage = $("g-stage");
    let x0 = null;
    stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) selectPhoto(current + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    thumbs.length && show(thumbs[current].dataset.src, thumbs[current].dataset.alt);
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
    radios.forEach((r) => r.addEventListener("change", () => {
      update();
      if (r.dataset.photo !== undefined) selectPhoto(Number(r.dataset.photo), true); // show the picture of the chosen edition
    }));
    update();
    // "from 19,99 €" for the sticky bar (prices may use a decimal comma)
    const num = (r) => parseFloat(r.dataset.price.replace(",", "."));
    const cheapest = radios.reduce((a, b) => (num(b) < num(a) ? b : a), radios[0]);
    const sp = $("sticky-price");
    if (sp && isFinite(num(cheapest))) sp.textContent = `from ${cheapest.dataset.price}`;
  }

  // ---------- Footer bits ----------
  const y = $("year"); if (y) y.textContent = new Date().getFullYear();
  const mail = $("mail"), fm = $("faq-mail");
  if (mail && fm) { fm.href = mail.href; fm.textContent = mail.textContent; }

  // ---------- Fade in on scroll ----------
  const reveals = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
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

  // ---------- Phones: a sticky "Shop" bar once the hero button has scrolled away ----------
  const sticky = $("sticky-buy");
  if (sticky) {
    const heroBtn = document.querySelector(".hero-cta .btn"), buyPanel = $("buy-form");
    let heroOut = false, buyIn = false;
    const sync = () => { sticky.hidden = !(heroOut && !buyIn && banner.hidden); };
    const watch = (el, set) => { if (el) new IntersectionObserver(([e]) => { set(e.isIntersecting); sync(); }).observe(el); };
    watch(heroBtn, (v) => { heroOut = !v; });
    watch(buyPanel, (v) => { buyIn = v; });
    new MutationObserver(sync).observe(banner, { attributes: true, attributeFilter: ["hidden"] });
    sync();
  }
})();
