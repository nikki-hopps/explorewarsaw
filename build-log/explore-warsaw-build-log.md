---
title: Explore Warsaw – build log
tags: [explorewarsaw, build-log, ai, portfolio]
started: 2026-10-15
status: in-progress
---

# Explore Warsaw – build log

A running journal of building the Explore Warsaw website with Claude, kept so it can become a post or portfolio piece. Newest entries go at the bottom. Include the failures too: they are the interesting part.

## The idea

- Started as "make me a portfolio/resume like Felix Rieseberg's" ([How to be more ambitious](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/)).
- Pivoted to a real product site: weekend events for expats, my book with Stripe checkout, and other expat projects.
- Felix-style hook: the site is a **room overlooking the Palace of Culture and Science (PKiN)**. Objects in the room open the content.
- Planned live behaviour: the view follows the real **Warsaw time of day and month** (day/night, seasons), with subtle traffic outside.

## What I learned about ambition (from Felix's four types)

- **Altitude:** ask what the site is *for*, not just "make a site".
- **Depth:** aim for the best version in the field, then test it on real people.
- **Range:** borrow a format from elsewhere (a room, a city guide, a tram map).
- Do not let the model judge its own work. Use an outside judge.

## Timeline

### 1. Plain site first (a mistake worth noting)
Claude built a working static site before we had a plan: events with English/Free filters, a book section with a Stripe Payment Link, project cards. It worked, but I said "wait, do we even have a plan?" The room is the front door and this site sits behind it. **Lesson:** plan the concept before building.

### 2. Picking the scene
Options discussed: flat overlooking PKiN, a Ruch kiosk, a bar mleczny, a Praga courtyard. Chose the flat overlooking PKiN.

### 3. Blender vs AI image
Blender (free 3D software, what Felix used) would be photorealistic but needs a computer and time. Chose an **AI-generated image** for speed, with a "must be realistic" requirement.

### 4. Iterating the room (each step: one change at a time, same camera)
| Step | Change | Notes |
|---|---|---|
| v1 | First realistic room | [image](https://www.canva.com/M/MAHYGx3-TOA) |
| v2 | Cozier, leather, minimal | Preferred v1, so went back |
| v3 | Autumn, warmer colours | [image](https://www.canva.com/M/MAHYG0z7Xw0) |
| v4 | More luxurious, minimal, desk at window | [image](https://www.canva.com/M/MAHYG_yrRC8) |
| v5 | Beige and light wood instead of dark brown | [image](https://www.canva.com/M/MAHYGzvCd6Q) |
| v6 | Modern 21st-century furniture, green banker's lamp, lighting matched to the sky | [image](https://www.canva.com/M/MAHYG-iaHF4) |
| v7 | Cozier armchair with armrests | [image](https://www.canva.com/M/MAHYG6IQENM) |
| v8 | Square minimalist armchair | [image](https://www.canva.com/M/MAHYG5-uUyY) |
| v9 | Taller backrest | [image](https://www.canva.com/M/MAHYGxXC9Ls) |
| v10 | Minimalist Hotel Ritz style bergère armchair | [image](https://www.canva.com/M/MAHYG_A-3eY) |

Season/time-of-day experiment (from the v4 room): winter, spring, summer dusk and autumn day/night.
- Winter dusk: [image](https://www.canva.com/M/MAHYG7cRP5E)
- Spring dusk: [image](https://www.canva.com/M/MAHYG1TZadI)
- Summer dusk: [image](https://www.canva.com/M/MAHYGwyZUbw)
- Autumn day: [image](https://www.canva.com/M/MAHYG0sANgo)
- Autumn night: [image](https://www.canva.com/M/MAHYG4fuiSI)

**Finding:** the daytime image drifted (furniture moved, a plant appeared). AI image variants do not keep a room identical.

### 5. The big honest problem: the view is not real
I pointed out the window view still felt AI generated. Correct: the buildings around PKiN are plausible, not real, and a Warsaw local would notice. Decision: the window needs a **real photograph from one real vantage point**.

Options researched: own photos (best), licensed stock, paid timelapses (e.g. Kurator, Envato Elements). Free photos with the right high window angle were not found. Licensing for each source must be checked before use.

### 6. Planned architecture
- Room image fixed; only the window view changes (real photos or timelapse behind a window cutout).
- Page reads the Europe/Warsaw clock and the month, fades between the right view, switches the lamp on at dusk.
- Subtle overlay animation for tram and car lights.
- Clickable hotspots: book opens checkout, corkboard opens events, tram map opens projects.
- Phones: wide room scrolls sideways, with a plain list as fallback.

### 7. Decisions on the window
- Looked at real sources: Google Maps imagery is off-limits (copyright and terms), free photos (Pexels, Wikimedia Commons) have no confirmed high-window angle, paid timelapses cost money.
- **Decision:** keep the AI-generated window for now. Real photo stays an option for later.

### 8. The clickable room (first version)
- `site/room.html`: 16:9 room picture, tap hotspots (laptop → events, book → checkout, armchair → projects, lamp → Instagram), panels use the native `<dialog>`.
- Picture chosen from the Warsaw season and hour, with a fallback to autumn dusk.
- Phones: the room scrolls sideways and opens centred on the Palace.
- Tested with Playwright on desktop and phone sizes: all four hotspots open the right panel.
- **Gotcha:** the room images available to Claude's session were 199×112 previews. The full-size file must be downloaded from Canva and added to `site/assets/`.

### 9. Pivot: a lightweight book landing page for explorewarsaw.guide
- Goal: drop Ecwid, keep product views and checkout, add a cookie banner and legal pages, make it minimal and cozy. Stripe Payment Links for checkout, no web fonts or trackers.
- Requirement added: **automatic e-book delivery with a 72-hour expiring link.** That needs a small backend, so the page got Cloudflare Pages Functions: a Stripe webhook (signature verified), a signed expiring token, a private R2 bucket and a download endpoint with a 10-download cap.
- 7 automated tests cover the token expiry, tamper checks, the Stripe signature, duplicate emails and path tricks.
- Constraint found: the domain is registered through Ecwid, so DNS and transfer must be sorted before launch.

### 10. Mobile pass (most traffic will be phones)
- Audited the landing page at seven phone and tablet sizes with Playwright. Found: sideways overflow at 320 px, header and footer links and FAQ rows under 44 px, a cookie banner covering the main button, and awkward gallery thumbnails.
- Fixed: compact header with a pill "Buy", bigger tap targets, a smaller cookie banner, a scrollable and swipeable gallery, hero text and button before the photo, and a sticky "Order" bar.
- Lesson: the first sticky-bar version hid as soon as the top of the buy section peeked in. It now tracks the checkout panel itself.

## Prompts that worked
- Keep the same room, camera angle and composition; change only one thing at a time.
- Describe lighting physically: cool dusk light from the window, warm pool of light from the lamp, matching shadows.
- Style references by name ("Hotel Ritz bergère") plus constraints ("minimalistic, not ornate").

## Problems and blockers
- GitHub push blocked (403): the Claude GitHub App needed access to the repo. Reconnect at claude.ai/connect-github.
- Preview thumbnails are small, so details (carving, leather, snow, blossoms) could not be verified without opening full-size images.

## Open questions
- Which real vantage point and photo source for the window?
- Book: printed, e-book or both? (E-book delivery with Stripe needs extra setup.)
- Domain name and Stripe Payment Link.

## Material for the post
- Before/after: plain site vs the room.
- The v1 → v10 room progression grid.
- The seasons/time-of-day set.
- The "AI view vs real view" lesson. It makes the post credible.
