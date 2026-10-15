# Warsaw Weekend Events – Website Update Prompt

## Purpose

Companion to [`weekend-events-prompt.md`](weekend-events-prompt.md). That prompt writes the Instagram captions. This one turns the same weekend's events into `site/data/events.js`, so the website updates with one copy-paste.

Run it in the same conversation, right after the captions prompt.

---

## Prompt

Now take the exact same events you just listed (same facts, same order, nothing added or changed) and output them as a JavaScript file in exactly this shape. Output only the code block, nothing else.

```js
window.EVENTS = {
  weekendLabel: "Mar 14–15, 2026",
  events: [
    {
      date: "2026-03-14",            // YYYY-MM-DD of the event (first day if it runs both days)
      title: "Event name",
      english: true,                 // true only if the source says it is in English
      time: "3:00PM",                // as in the caption, without the 🕒 emoji
      venue: "Venue (Street 12)",    // as in the caption, without the 📍 emoji
      price: "FREE admission",       // as in the caption, without the 🎟️ emoji
      free: true,                    // true if entry is free
      link: "https://..."            // booking/info URL from the source, or "" if none
    }
  ]
};
```

Rules:
- Every value must come from the source website. If a value is unknown, use "" (or `false` for true/false fields). Never guess.
- Keep the emojis out of the fields. The website adds its own icons.
- Do not include the "(in English)" note in the title; set `english: true` instead.

---

## How to publish

1. Copy the code block.
2. Open `site/data/events.js` in GitHub (pencil icon → edit), select everything, paste, and commit.
3. The site updates automatically once it's deployed (see the README).
