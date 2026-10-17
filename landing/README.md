# Book landing page

A single-page, no-build site for selling the book at explorewarsaw.guide. Plain HTML, CSS and a little JavaScript. No web fonts, no trackers, no third-party requests except Stripe at checkout.

```
landing/
  index.html      the page (edit the text directly)
  privacy.html    privacy policy (paste your existing text)
  terms.html      terms of sale and returns (paste your existing text)
  styles.css      the design
  app.js          gallery, edition picker, checkout button, cookie banner
  config.js       optional analytics
  assets/         your photos (see assets/README.md)
```

Preview: open `landing/index.html` in a browser.

## Connect Stripe checkout

The page uses **Stripe Payment Links**, so no server and no secret keys are needed.

1. In the Stripe Dashboard, create a Product for each edition (paperback, e-book) with its price in PLN.
2. For each, create a **Payment Link**. For the paperback, turn on shipping address collection and choose the countries you ship to. Turn on automatic tax if you use Stripe Tax.
3. Under *After payment*, redirect to your thank-you page (or show Stripe's confirmation).
4. In `index.html`, paste each link into the `data-link` of the matching `<input name="edition">`, and set `data-price` and the visible price to match Stripe.

Until a link is pasted, the button reads "Checkout opens soon".

E-book delivery: a Payment Link alone does not send a file. Either send the files by email from the payment notification, or use a Stripe-connected delivery tool. Never link to the file from a public page.

## Privacy policy, terms and cookie banner

- The banner is built in. By default the page sets no tracking cookies, and the banner only records the choice on the visitor's device. If you add analytics in `config.js`, it loads only after the visitor accepts, and the banner shows Accept and Essential only.
- "Cookie settings" in the footer reopens the banner.
- `privacy.html` and `terms.html` contain headings and clearly marked placeholders. Paste the texts from your current site and have them reviewed before launch. The wording must match what the page actually does.

## Before launch

- [ ] Replace the placeholder title, price, copy and author text in `index.html`
- [ ] Add photos to `assets/`
- [ ] Paste both Stripe Payment Links
- [ ] Paste the privacy policy and terms of sale
- [ ] Set your real contact email (footer in all three pages)
- [ ] Point explorewarsaw.guide to the host you choose
