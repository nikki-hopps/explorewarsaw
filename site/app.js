(function () {
  const site = window.SITE || {};
  const data = window.EVENTS || { weekendLabel: "", events: [] };
  const $ = (id) => document.getElementById(id);

  // Build elements with textContent only, so nothing in the data files can inject HTML.
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const child of children || []) if (child) node.appendChild(child);
    return node;
  }

  // Only allow http(s) links from the data files.
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
    } catch {
      return "";
    }
  }

  // ---------- Events ----------
  let filter = "all";

  function dayLabel(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  function eventCard(ev) {
    const tags = el("div", { class: "tags" }, [
      ev.english ? el("span", { class: "tag en", text: "In English" }) : null,
      ev.free ? el("span", { class: "tag", text: "Free" }) : null,
    ]);
    const link = safeUrl(ev.link || "");
    return el("article", { class: "event" }, [
      tags,
      el("h4", { text: ev.title }),
      el("p", { text: "🕒 " + ev.time }),
      el("p", { text: "📍 " + ev.venue }),
      el("p", { text: "🎟️ " + ev.price }),
      link ? el("a", { class: "more", href: link, target: "_blank", rel: "noopener", text: "Details & tickets →" }) : null,
    ]);
  }

  function renderEvents() {
    const root = $("event-days");
    root.replaceChildren();
    const shown = data.events.filter((ev) =>
      filter === "english" ? ev.english : filter === "free" ? ev.free : true
    );
    if (!shown.length) {
      root.appendChild(el("p", { class: "empty", text: "Nothing matches that filter this weekend." }));
      return;
    }
    const byDay = new Map();
    for (const ev of shown) {
      if (!byDay.has(ev.date)) byDay.set(ev.date, []);
      byDay.get(ev.date).push(ev);
    }
    for (const date of [...byDay.keys()].sort()) {
      root.appendChild(
        el("div", { class: "day" }, [
          el("h3", { text: dayLabel(date) }),
          el("div", { class: "event-list" }, byDay.get(date).map(eventCard)),
        ])
      );
    }
  }

  $("weekend-label").textContent = data.weekendLabel ? "· " + data.weekendLabel : "";
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
      renderEvents();
    });
  });
  renderEvents();

  // ---------- Book ----------
  const book = site.book || {};
  $("book-title").textContent = book.title || "";
  $("book-subtitle").textContent = book.subtitle || "";
  $("book-blurb").textContent = book.blurb || "";
  $("book-price").textContent = book.price || "";
  $("book-format").textContent = book.format || "";
  (book.highlights || []).forEach((h) => $("book-highlights").appendChild(el("li", { text: h })));

  const cover = $("book-cover");
  if (book.cover) cover.appendChild(el("img", { src: book.cover, alt: "Cover of " + (book.title || "the book") }));
  else cover.textContent = book.title || "Your book";

  const buy = $("buy-btn");
  const payLink = safeUrl(book.stripePaymentLink || "");
  if (payLink) {
    buy.href = payLink;
  } else {
    buy.textContent = "Coming soon";
    buy.classList.add("disabled");
    buy.setAttribute("aria-disabled", "true");
  }

  // ---------- Projects ----------
  const cards = $("project-cards");
  for (const p of site.projects || []) {
    const link = safeUrl(p.link || "");
    cards.appendChild(
      el("div", { class: "card" }, [
        el("h3", { text: p.title }),
        el("p", { text: p.text }),
        link
          ? el("a", { href: link, target: "_blank", rel: "noopener", text: (p.linkLabel || "Learn more") + " →" })
          : el("span", { class: "soon", text: p.linkLabel || "Coming soon" }),
      ])
    );
  }

  // ---------- Room link: only shown once the room picture has been added ----------
  const roomProbe = new Image();
  roomProbe.onload = () => { $("room-link").hidden = false; };
  roomProbe.src = "assets/room-autumn-dusk.jpg";

  // ---------- Footer & links ----------
  const ig = safeUrl(site.instagram || "");
  if (ig) $("ig-btn").href = ig;
  if (site.email) $("mail-link").href = "mailto:" + site.email;
  $("year").textContent = new Date().getFullYear();
})();
