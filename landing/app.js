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

  // ---------- Photo strip ----------
  // Swipe, drag or use the arrows. It also drifts slowly on its own, and stops while you hover, touch, focus or press pause.
  const sc = $("scroller");
  if (sc) {
    const strip = sc.closest(".strip"), track = sc.querySelector(".track"), pauseBtn = strip.querySelector('[data-act="pause"]');
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const originals = [...track.children];
    for (let k = 0; k < 2; k++) originals.forEach((f) => {
      const c = f.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelector("img").alt = ""; track.appendChild(c);
    });
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    let W = (track.scrollWidth + gap) / 3;               // width of one copy of the photos
    window.addEventListener("resize", () => { W = (track.scrollWidth + gap) / 3; });
    const wrap = () => { if (sc.scrollLeft < W * 0.5) sc.scrollLeft += W; else if (sc.scrollLeft > W * 1.5) sc.scrollLeft -= W; };
    sc.scrollLeft = W;

    let userPaused = calm, hovering = false, focused = false, touching = false, visible = true, holdUntil = 0, dragging = null;
    const setPaused = (p) => {
      userPaused = p; pauseBtn.setAttribute("aria-pressed", String(p));
      pauseBtn.setAttribute("aria-label", p ? "Play the moving photos" : "Pause the moving photos");
    };
    setPaused(calm);
    const hold = (ms) => { holdUntil = performance.now() + ms; };

    strip.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovering = true; });
    strip.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hovering = false; });
    strip.addEventListener("focusin", () => { focused = true; });
    strip.addEventListener("focusout", () => { focused = false; });
    sc.addEventListener("touchstart", () => { touching = true; }, { passive: true });
    sc.addEventListener("touchend", () => { touching = false; hold(4000); }, { passive: true });
    sc.addEventListener("touchcancel", () => { touching = false; hold(4000); }, { passive: true });

    // After any scroll settles, jump back into the middle copy (it looks identical, so there is no visible jump).
    let settle;
    sc.addEventListener("scroll", () => { clearTimeout(settle); settle = setTimeout(() => { if (!touching && !dragging) wrap(); }, 160); }, { passive: true });

    // Mouse: click and drag. Touch and trackpad use normal scrolling.
    sc.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = { x: e.clientX, left: sc.scrollLeft }; sc.setPointerCapture(e.pointerId);
    });
    sc.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragging.x;
      if (Math.abs(dx) > 3) sc.classList.add("dragging");
      sc.scrollLeft = dragging.left - dx;
    });
    const endDrag = () => { if (dragging) { dragging = null; sc.classList.remove("dragging"); hold(800); } };
    sc.addEventListener("pointerup", endDrag); sc.addEventListener("pointercancel", endDrag);

    strip.querySelectorAll(".ctl").forEach((b) => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "pause") { setPaused(!userPaused); return; }
      hold(1800);
      sc.scrollBy({ left: (act === "next" ? 1 : -1) * Math.max(240, sc.clientWidth * 0.8), behavior: calm ? "auto" : "smooth" });
    }));

    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(strip);
    const SPEED = 28; // pixels per second: slow on purpose
    let last = performance.now(), pos = sc.scrollLeft;
    const tick = (now) => {
      const dt = Math.min(64, now - last); last = now;
      if (!userPaused && !hovering && !focused && !touching && !dragging && visible && !document.hidden && now > holdUntil) {
        pos += SPEED * dt / 1000; sc.scrollLeft = pos; wrap(); if (Math.abs(sc.scrollLeft - pos) > 2) pos = sc.scrollLeft;
      } else pos = sc.scrollLeft;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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
