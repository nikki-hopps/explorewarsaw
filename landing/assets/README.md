# Assets

`img/` holds the photos used on the page (all processed for the web):

| File | Where it appears |
|---|---|
| `hands.webp`, `phone.webp` | Transparent cut-outs of the hardcover in hands and the e-book on a phone: the hero and the product cards |
| `strip-*.jpg` | The slowly moving photo strip under the hero (cover, plane, two page spreads, gift wrapping, coffee table) |
| `og.jpg` | The 1200 x 630 card shown when the link is shared on social media |

To add or swap a strip photo, export it at 480 px tall (any width), JPEG at about 80 percent quality, and add a `<figure>` for it in `index.html`. Each photo appears twice in the markup (the second copy has `class="dup"` and an empty `alt`) so the loop is seamless.

`fonts/` holds the self-hosted typefaces, Fraunces and DM Sans (SIL Open Font License). Leave them as they are.

## Colours

Colours are variables at the top of `styles.css`. The default is "Gallery" (off-white and black). To try another, add `data-theme="navy"`, `"forest"` or `"sky"` to the `<html>` tag in `index.html`, and change the `theme-color` meta in the page heads to match.
