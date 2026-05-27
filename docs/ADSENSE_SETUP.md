# AdSense setup (web)

## Variables (Netlify)

```env
VITE_ADSENSE_CLIENT=ca-pub-9321092696086358
VITE_ADSENSE_SLOT=4111146727
```

Script in `index.html` (site verification) is already committed.

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
