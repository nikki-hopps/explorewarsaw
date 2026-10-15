# Explore Warsaw

Resources, prompts and the website for curating expat-friendly weekend events in Warsaw.

## Contents

| Path | Description |
|------|-------------|
| [`site/`](site/) | The Explore Warsaw website: weekend events, the book (Stripe checkout), and projects for expats |
| [`prompts/weekend-events-prompt.md`](prompts/weekend-events-prompt.md) | Claude prompt for finding & formatting upcoming Warsaw weekend events as Instagram Reels captions |
| [`prompts/website-events-prompt.md`](prompts/website-events-prompt.md) | Follow-up prompt that turns the same events into `site/data/events.js` for the website |

## The website

Plain HTML, CSS and JavaScript. No build step, no server, no secret keys.

```
site/
  room.html         the clickable room (front door): objects open events, book, projects
  room.js/.css      the room's hotspots, panels and time-of-day logic
  index.html        the plain list version of the site
  styles.css        design (Warsaw tram red & yellow)
  app.js            renders events, book and projects from the data files
  thanks.html       shown after a successful Stripe payment
  data/site.js      book details, Stripe link, projects, Instagram/email  ← edit this
  data/events.js    this weekend's events                               ← replace weekly
  assets/           room pictures and the book cover (see assets/README.md)
```

To preview it, open `site/room.html` (the room) or `site/index.html` (the plain list) in a browser.

### The room

`room.html` shows a picture of the room. Tap an object to open its panel: laptop → this weekend's events, book → the book and checkout, armchair → projects, lamp → Instagram. The picture changes with the Warsaw season and time of day once you add the matching files (see `site/assets/README.md`). Add `?debug` to the address to see the hotspot outlines and read click coordinates for adjusting them in `room.js`.

### Weekly routine

1. Run `prompts/weekend-events-prompt.md` in Claude → Instagram captions.
2. In the same chat, run `prompts/website-events-prompt.md` → paste the result into `site/data/events.js`.

### Selling the book with Stripe

The site uses a **Stripe Payment Link**: Stripe hosts the checkout page, so card data never touches this site and no API keys live in the repo.

1. In the Stripe Dashboard, create a **Product** for the book with its price in PLN.
2. Create a **Payment Link** for it:
   - Paperback: turn on *Collect customers' addresses → shipping*, and limit countries as you like.
   - Under *After payment*, choose *Don't show confirmation page → Redirect* and enter `https://YOUR-DOMAIN/thanks.html`.
   - Enable the payment methods you want (cards, BLIK, Przelewy24, Apple/Google Pay).
3. Paste the link into `stripePaymentLink` in `site/data/site.js`. Until then, the button says "Coming soon".

E-book note: a Payment Link alone does not deliver a file. Either email the file manually from Stripe's payment notifications, or use Stripe's digital-delivery integrations. Don't put a direct download link on `thanks.html`, because anyone could open that page without paying.

### Hosting (free): GitHub Pages

`.github/workflows/pages.yml` publishes the `site/` folder to GitHub Pages every time `site/` changes on `main`.

1. Merge this branch into `main`.
2. In the repo, go to Settings → Pages → Build and deployment → Source, and choose **GitHub Actions**.
3. The site goes live at `https://nikki-hopps.github.io/explorewarsaw/`. A first run can be started by hand from the Actions tab (Deploy site to GitHub Pages → Run workflow).
4. Custom domain (e.g. explorewarsaw.com): add it in Settings → Pages.

Netlify or Cloudflare Pages also work: connect the repo, set the publish directory to `site`, no build command.
