# Room pictures

`room.html` loads one picture of the room, chosen from the current Warsaw time and month.

## Required

- `room-autumn-dusk.jpg`: the fallback, always used if a more specific picture is missing.

## Optional (add as you make them)

Name them `room-<season>-<phase>.jpg`:

- season: `winter`, `spring`, `summer`, `autumn`
- phase: `day` (9:00–16:00), `dusk` (6:00–9:00 and 16:00–20:00), `night` (20:00–6:00)

For example `room-winter-night.jpg`. Every picture should be the same 16:9 framing of the same room, so the hotspots line up.

Preview any combination without waiting for the real time: `room.html?season=winter&phase=night`.

Also put the book cover here (e.g. `book-cover.jpg`) and set it in `site/data/site.js`.
