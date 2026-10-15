(function () {
  const site = window.SITE || {};
  const data = window.EVENTS || { weekendLabel: "", events: [] };
  const $ = (id) => document.getElementById(id);

  // ---------- Hotspots ----------
  // Positions are percentages of the room picture (x, y = top-left corner, w, h = size).
  // Open the page with ?debug to see the outlines and click the picture to read coordinates.
  const HOTSPOTS = [
    { id: "events",   label: "This weekend's events", x: 29, y: 46, w: 19, h: 24 }, // laptop
    { id: "book",     label: "The book",              x: 19, y: 70, w: 15, h: 13 }, // red book on the desk
    { id: "projects", label: "More for expats",       x: 66, y: 42, w: 30, h: 56 }, // armchair
    { id: "follow",   label: "Follow on Instagram",   x: 49, y: 28, w: 12, h: 34 }, // green lamp
  ];

  // ---------- Helpers ----------
  // Elements are built with textContent only, so nothing in the data files can inject HTML.
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const child of children || []) if (child) node.appendChild(child);
    return node;
  }
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch {
      return "";
    }
  }

  // ---------- Warsaw time -> which picture to show ----------
  function warsawNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Warsaw", hour: "numeric", month: "numeric", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => Number(parts.find((p) => p.type === t).value);
    return { hour: get("hour"), month: get("month") };
  }
  function seasonOf(month) {
    if (month === 12 || month <= 2) return "winter";
    if (month <= 5) return "spring";
    if (month <= 8) return "summer";
    return "autumn";
  }
  // Rough phases for now: a later version can use real sunrise/sunset times.
  function phaseOf(hour) {
    if (hour >= 9 && hour < 16) return "day";
    if ((hour >= 6 && hour < 9) || (hour >= 16 && hour < 20)) return "dusk";
    return "night";
  }

  const q = new URLSearchParams(location.search);
  const now = warsawNow();
  const season = q.get("season") || seasonOf(now.month);
  const phase = q.get("phase") || phaseOf(now.hour);

  // Try the exact picture first, then fall back to the one picture that always exists.
  const candidates = [`assets/room-${season}-${phase}.jpg`, "assets/room-autumn-dusk.jpg"];
  const img = $("room-img");
  (function load(i) {
    if (i >= candidates.length) return;
    const probe = new Image();
    probe.onload = () => { img.src = probe.src; img.classList.add("ready"); };
    probe.onerror = () => load(i + 1);
    probe.src = candidates[i];
  })(0);

  // ---------- Panels ----------
  const panel = $("panel");
  const body = $("panel-body");

  function eventCard(ev) {
    const link = safeUrl(ev.link || "");
    return el("article", { class: "event" }, [
      el("div", { class: "tags" }, [
        ev.english ? el("span", { class: "tag en", text: "In English" }) : null,
        ev.free ? el("span", { class: "tag", text: "Free" }) : null,
      ]),
      el("h4", { text: ev.title }),
      el("p", { text: "🕒 " + ev.time }),
      el("p", { text: "📍 " + ev.venue }),
      el("p", { text: "🎟️ " + ev.price }),
      link ? el("a", { class: "more", href: link, target: "_blank", rel: "noopener", text: "Details & tickets →" }) : null,
    ]);
  }

  const PANELS = {
    events() {
      const byDay = new Map();
      for (const ev of data.events) {
        if (!byDay.has(ev.date)) byDay.set(ev.date, []);
        byDay.get(ev.date).push(ev);
      }
      const days = [...byDay.keys()].sort().map((date) => {
        const label = new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
        return el("div", { class: "day" }, [
          el("h3", { text: label }),
          el("div", { class: "event-list" }, byDay.get(date).map(eventCard)),
        ]);
      });
      return [
        el("h2", { id: "panel-title", text: "This weekend in Warsaw" }),
        el("p", { class: "muted", text: data.weekendLabel || "" }),
        ...days,
      ];
    },
    book() {
      const b = site.book || {};
      const pay = safeUrl(b.stripePaymentLink || "");
      const buy = pay
        ? el("a", { class: "btn primary", href: pay, text: "Buy now" })
        : el("span", { class: "btn primary disabled", "aria-disabled": "true", text: "Coming soon" });
      const cover = el("div", { class: "book-cover" });
      if (b.cover) cover.appendChild(el("img", { src: b.cover, alt: "Cover of " + (b.title || "the book") }));
      else cover.textContent = b.title || "Your book";
      return [
        el("p", { class: "eyebrow", text: "The book" }),
        el("div", { class: "book-panel" }, [
          cover,
          el("div", {}, [
            el("h2", { id: "panel-title", text: b.title || "" }),
            el("p", { class: "muted", text: b.subtitle || "" }),
            el("p", { text: b.blurb || "" }),
            el("ul", { class: "ticks" }, (b.highlights || []).map((h) => el("li", { text: h }))),
            el("div", { class: "buy" }, [el("span", { class: "price", text: b.price || "" }), buy]),
            el("p", { class: "muted small", text: b.format || "" }),
            el("p", { class: "muted small", text: "Secure checkout by Stripe." }),
          ]),
        ]),
      ];
    },
    projects() {
      const cards = (site.projects || []).map((p) => {
        const link = safeUrl(p.link || "");
        return el("div", { class: "card" }, [
          el("h3", { text: p.title }),
          el("p", { text: p.text }),
          link
            ? el("a", { href: link, target: "_blank", rel: "noopener", text: (p.linkLabel || "Learn more") + " →" })
            : el("span", { class: "soon", text: p.linkLabel || "Coming soon" }),
        ]);
      });
      return [el("h2", { id: "panel-title", text: "More for expats" }), el("div", { class: "cards" }, cards)];
    },
    follow() {
      const ig = safeUrl(site.instagram || "");
      return [
        el("h2", { id: "panel-title", text: "Never miss a weekend" }),
        el("p", { class: "muted", text: "New picks every week on Instagram." }),
        ig ? el("a", { class: "btn primary", href: ig, target: "_blank", rel: "noopener", text: "Follow @explorewarsaw" }) : null,
      ];
    },
  };

  function openPanel(id) {
    body.replaceChildren(...PANELS[id]().filter(Boolean));
    panel.scrollTop = 0;
    if (!panel.open) panel.showModal();
  }
  $("panel-close").addEventListener("click", () => panel.close());
  panel.addEventListener("click", (e) => { if (e.target === panel) panel.close(); }); // click on the backdrop

  // ---------- Build the hotspots ----------
  const scene = $("scene");
  for (const h of HOTSPOTS) {
    const btn = el("button", {
      class: "hotspot", type: "button", "aria-label": h.label,
      style: `--x:${h.x}%;--y:${h.y}%;--w:${h.w}%;--h:${h.h}%`,
    }, [el("span", { class: "pin" }), el("span", { class: "tip", text: h.label })]);
    btn.addEventListener("click", () => openPanel(h.id));
    scene.appendChild(btn);
  }

  // ---------- Narrow screens: start centred on the window with the Palace ----------
  const FOCUS_X = 0.38; // horizontal position of the Palace in the picture (0 = left edge, 1 = right edge)
  const viewport = $("viewport");
  viewport.scrollLeft = viewport.scrollWidth * FOCUS_X - viewport.clientWidth / 2;

  // ---------- Debug: ?debug shows outlines and click coordinates ----------
  if (q.has("debug")) {
    document.body.classList.add("debug");
    const out = el("div", { class: "coords", text: "Click the picture to read x / y (%)" });
    document.body.appendChild(out);
    scene.addEventListener("click", (e) => {
      if (e.target.closest(".hotspot")) return;
      const r = scene.getBoundingClientRect();
      out.textContent = `x ${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%   y ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`;
    });
  }
})();
