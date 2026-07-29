# secure-signed

Secure CDN proxy built with Nuxt and deployed to Cloudflare Pages.

## Scripts

```bash
npm install
npm run dev
npm run build
```

The Nuxt build uses the `cloudflare-pages` Nitro preset and outputs assets to `.output/public`, matching `wrangler.toml`.

## Cloudflare bindings

- `DB`: D1 database for generated download links.
- `VALIDITY`: Link lifetime, for example `30m`, `1h`, or `1d`.
