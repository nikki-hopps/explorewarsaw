# Book landing page

A single-page, no-build site for selling the book at www.explorewarsawguide.com. Plain HTML, CSS and a little JavaScript. Fonts are hosted on the site itself, with no trackers and no third-party requests except Stripe at checkout.

```
landing/
  index.html      the page (edit the text directly)
  privacy.html    privacy policy (paste your existing text)
  terms.html      terms of sale and returns (paste your existing text)
  styles.css      the design (night skyline, one glass card; Jost font in assets/fonts)
  thanks.html     where buyers land after paying (shows the e-book link)
  shipping.html, returns.html, terms.html, privacy.html   legal pages to fill in
  app.js          gallery, edition picker, checkout button, cookie banner
  config.js       optional analytics
  assets/         your photos (see assets/README.md)
```

Preview: open `landing/index.html` in a browser.

## Connect Stripe checkout

The page uses **Stripe Payment Links**, so no server and no secret keys are needed to take payments. You need **three** links, one per edition: *Hardcover + e-book* (27,99 €), *Hardcover* (19,99 €) and *E-book* (19,99 €).

For each one, in the Stripe Dashboard:

1. **Product catalogue, Add product.** Name (for example "Warsaw Viewpoints, hardcover"), description, a photo, and a **one-time** price in **EUR**.
2. **Payment links, New.** Pick the product. Then set:
   - *Collect customers' addresses: Billing and shipping* for the hardcover and the bundle, with the countries you ship to. Add a **shipping rate** (for example free, or a flat fee) under *Shipping options*.
   - Nothing to collect for the e-book except the email address.
   - *Collect tax automatically* if you use Stripe Tax, or set the tax rate to match your accountant's advice. The page says prices include VAT.
   - *Let customers adjust quantity* if you want people to buy several copies.
   - *Require customers to accept your terms*: add the link to your terms page in Stripe settings first.
3. **After payment:** choose *Don't show confirmation page* and redirect to `https://www.explorewarsawguide.com/thanks.html?session_id={CHECKOUT_SESSION_ID}` (type `{CHECKOUT_SESSION_ID}` exactly like that). Use the same address for all three links.
4. **Create link.** Copy the `https://buy.stripe.com/...` address.
5. Open the link's detail page. The address bar contains its id, `plink_...`. Note it for the e-book and the bundle (see the e-book delivery section).
6. Paste each `buy.stripe.com` address into `data-link` of the matching `<input name="edition">` in `index.html`, and check that `data-price` and the visible price match Stripe.

Test in **Stripe test mode** first (the toggle in the Dashboard): create the links in test mode, pay with the card `4242 4242 4242 4242`, then repeat in live mode. Until a link is pasted, the button reads "Checkout opens soon".

The gift card on your old shop is not on this page. It needs its own way to deliver a code, so tell me if you want it.

## Automatic e-book delivery (72-hour link)

How it works: the buyer pays through the e-book Payment Link, Stripe calls the webhook function, which checks Stripe's signature and emails a signed link that works for 72 hours. The thank-you page shows the same link at once. The files live in private storage and are served only through the download function (10 downloads per purchase).

The core code is in `landing/functions/` and has automated tests (`npm test` inside `landing/`, Node 20 or newer). Small wrappers in `netlify/` run it on **Netlify** (Functions + Blobs). The same code also runs on Cloudflare Pages Functions (R2 + KV).

### Set up on Netlify

1. Netlify: Add new site, Import from GitHub, choose this repo. `netlify.toml` already sets the publish folder (`landing`) and the functions folder. Netlify installs `@netlify/blobs` automatically.
2. Put the e-book files in the private Blobs store named `ebooks` (Netlify CLI: `netlify blobs:set ebooks book.pdf --input ./book.pdf`, and the same for the EPUB; run `netlify blobs:set --help` if the flags differ).
3. In Stripe, create the e-book Payment Link. Under *After payment* use `https://www.explorewarsawguide.com/thanks.html?session_id={CHECKOUT_SESSION_ID}`. Note its id (`plink_...`).
4. In Stripe, add a webhook endpoint `https://www.explorewarsawguide.com/api/stripe-webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy its signing secret.
5. Create a **restricted Stripe key** that can only read Checkout Sessions.
6. Sign up with an email sender such as Resend and verify your domain with the DNS records it gives you.
7. In Netlify: Site configuration, Environment variables. Never commit these:

| Variable | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | the webhook signing secret (`whsec_...`) |
| `STRIPE_READ_KEY` | the restricted key (`rk_...`) |
| `EBOOK_PAYMENT_LINK_IDS` | the ids of the Payment Links that include the e-book: the e-book and the bundle, comma separated (`plink_aaa,plink_bbb`) |
| `DOWNLOAD_SIGNING_SECRET` | a long random string, e.g. `openssl rand -hex 32` |
| `SITE_URL` | `https://www.explorewarsawguide.com` (no trailing slash) |
| `EMAIL_API_KEY` | your email provider key |
| `MAIL_FROM` | e.g. `Explore Warsaw <orders@explorewarsawguide.com>` |
| `EBOOK_PDF_KEY` / `EBOOK_EPUB_KEY` | the key names you used in step 2 |

8. Test in Stripe **test mode** first: a test purchase, the email, the thank-you page, the 72-hour expiry and the download limit. Then switch Stripe to live mode.

### Domain: www.explorewarsawguide.com

Buy it at Netlify Domains (simplest: DNS and HTTPS are automatic) or at any registrar and point it at Netlify. In Netlify Domain management, make `www.explorewarsawguide.com` the primary domain so the bare `explorewarsaw.com` redirects to it. Turn on two-factor login on the registrar.

## Privacy policy, terms and cookie banner

- The banner is built in. By default the page sets no tracking cookies, and the banner only records the choice on the visitor's device. If you add analytics in `config.js`, it loads only after the visitor accepts, and the banner shows Accept and Essential only.
- "Cookie settings" in the footer reopens the banner.
- `privacy.html` and `terms.html` contain headings and clearly marked placeholders. Paste the texts from your current site and have them reviewed before launch. The wording must match what the page actually does.

## Mobile

The page is designed phone-first. Checked at 320, 360, 375, 390 and 412 px wide, a 768 px tablet and a landscape phone: no sideways scrolling, 44 px minimum tap targets for buttons and navigation, a compact cookie banner, a swipeable photo gallery, and a sticky "Order" bar that appears once the main button has scrolled away and disappears when the checkout panel is on screen.

Phone data is the limit, so keep photos small: JPEG, about 80 percent quality, under 400 KB each, and no wider than 2000 px. Gallery photos below the first screen load lazily.

## Before launch

- [ ] Add the real photos (see `assets/README.md`) and check the copy, prices and links in `index.html`
- [ ] Confirm the Instagram and TikTok links and the contact email
- [ ] Add photos to `assets/`
- [ ] Paste both Stripe Payment Links
- [ ] Paste the privacy policy and terms of sale
- [ ] Set your real contact email (footer in all three pages)
- [ ] Point www.explorewarsawguide.com to the host you choose
