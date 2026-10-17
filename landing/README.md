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

## Automatic e-book delivery (72-hour link)

How it works: the buyer pays through the e-book Payment Link, Stripe calls `functions/api/stripe-webhook.js`, which checks Stripe's signature and emails a signed link that works for 72 hours. The thank-you page shows the same link at once. The files live in private storage and are only served through `functions/api/download.js` (10 downloads per purchase).

This needs a host that runs functions. The code is written for **Cloudflare Pages** (Functions, R2 storage, KV).

1. Create a Cloudflare Pages project from this repo. Build command: none. Output directory: `landing`.
2. Create an **R2 bucket** (private) and upload the e-book as PDF and EPUB. Bind it to the project as `EBOOKS`.
3. Create a **KV namespace** and bind it as `DELIVERIES`. It stops duplicate emails and counts downloads.
4. In Stripe, create the e-book Payment Link. Under *After payment* use `https://YOUR-DOMAIN/thanks.html?session_id={CHECKOUT_SESSION_ID}`. Note its id (`plink_...`).
5. In Stripe, add a webhook endpoint `https://YOUR-DOMAIN/api/stripe-webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy its signing secret.
6. Create a **restricted Stripe key** that can only read Checkout Sessions.
7. Sign up with an email sender such as Resend and verify your domain (this needs DNS access).
8. Add these as encrypted environment variables in the Pages project. Never commit them:

| Variable | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | the webhook signing secret (`whsec_...`) |
| `STRIPE_READ_KEY` | the restricted key (`rk_...`) |
| `EBOOK_PAYMENT_LINK_ID` | the e-book link id (`plink_...`) |
| `DOWNLOAD_SIGNING_SECRET` | a long random string, e.g. `openssl rand -hex 32` |
| `SITE_URL` | `https://explorewarsaw.guide` (no trailing slash) |
| `EMAIL_API_KEY` | your email provider key |
| `MAIL_FROM` | e.g. `Explore Warsaw <orders@explorewarsaw.guide>` |
| `EBOOK_PDF_KEY` / `EBOOK_EPUB_KEY` | the file names in the R2 bucket |

9. Test with Stripe **test mode** first: make a test purchase, check the email, the thank-you page, the 72-hour expiry and the download limit. Then switch to live mode.

Run the automated checks with `npm test` in `landing/` (needs Node 20 or newer).

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
