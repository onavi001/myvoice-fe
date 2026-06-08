# AdSense setup (web)

## Variables (Netlify)

```env
VITE_ADSENSE_CLIENT=ca-pub-9321092696086358
VITE_ADSENSE_SLOT=4111146727
VITE_ADSENSE_ENABLED=false
```

Do **not** remove the AdSense script or `google-adsense-account` meta from `index.html` — Google needs them in `<head>` to verify site ownership. Actual ad units still render only via `WebAdBanner` on content pages when `VITE_ADSENSE_ENABLED=true`.

During review keep `VITE_ADSENSE_ENABLED=false` in Netlify until the site status is **Listo** (Ready).

## Public landing

`/` serves `Landing.tsx` with real text for crawlers and reviewers. Logged-in users are redirected to `/home`.

Static fallbacks:

- `index.html` `<noscript>` block with summary + links
- `public/privacy-policy.html` — includes AdSense, cookies, and contact
- `public/robots.txt`

## ads.txt

File: `public/ads.txt`

Content (must match Google’s standard certification ID):

```txt
google.com, pub-9321092696086358, DIRECT, f08c47fec0942fa0
```

`netlify.toml` serves `/ads.txt`, `/app-ads.txt`, and `/privacy-policy.html` as static files before the SPA fallback.

After deploy, verify:

- https://myvoice-fit.netlify.app/ads.txt
- https://myvoice-fit.netlify.app/privacy-policy.html
- View page source on `/` — script + meta in `<head>`

In AdSense: **Sitios** → your site → **Verificar propiedad** (meta tag method should pass after deploy).

## When ads appear

AdSense site status must be **Listo**. While **Preparando** or **Requiere revisión**, Google does not serve ads even with correct code.

After approval set `VITE_ADSENSE_ENABLED=true` in Netlify and redeploy.

## Checklist

1. Deploy FE with this commit
2. AdSense → verify site (meta tag)
3. AdSense → check ads.txt (can take up to 24–48 h)
4. Ensure privacy policy URL is reachable from landing footer and login
5. When **Listo**, enable `VITE_ADSENSE_ENABLED=true`
