# AdSense setup (web)

## Variables (Netlify)

```env
VITE_ADSENSE_CLIENT=ca-pub-9321092696086358
VITE_ADSENSE_SLOT=4111146727
```

Do **not** disable the AdSense script in `index.html` — Google needs it in `<head>` to verify site ownership. Actual ad units still load only via `WebAdBanner` on content pages when `VITE_ADSENSE_ENABLED=true`.

During review set `VITE_ADSENSE_ENABLED=false` in Netlify until the site status is **Listo**.

## Public landing

`/` serves `Landing.tsx` with real text for crawlers and reviewers. Logged-in users are redirected to `/home`.

## ads.txt

File: `public/ads.txt`

Content:

```txt
google.com, pub-9321092696086358, DIRECT, f08c47e55868027ed
```

After deploy, verify:

- https://myvoice-fit.netlify.app/ads.txt

## When ads appear

AdSense site status must be **Listo** (Ready). While **Preparando**, Google does not serve ads even with correct code.
