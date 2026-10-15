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
  index.html        the page
  styles.css        design (Warsaw tram red & yellow)
  app.js            renders events, book and projects from the data files
  thanks.html       shown after a successful Stripe payment
  data/site.js      book details, Stripe link, projects, Instagram/email  ← edit this
  data/events.js    this weekend's events                               ← replace weekly
  assets/           put your book cover image here
```

To preview it, open `site/index.html` in a browser.

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

### Hosting (free)

- **GitHub Pages:** it can only serve from the repo root or `/docs`, so rename `site/` to `docs/`, then go to repo Settings → Pages → deploy from branch `main`, folder `/docs`.
- **Netlify or Cloudflare Pages:** connect this repo, set the publish directory to `site`, no build command. A custom domain (e.g. explorewarsaw.com) can be added in their settings.
