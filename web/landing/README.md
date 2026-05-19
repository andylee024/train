# Train landing page

Pure static site. Hosted on Vercel. One CTA: text the Train number.

## Files

- `index.html` — single-scroll page: hero with tap-to-text CTA, who-it's-for, what-you-get, how-it-works, CTA repeat, footer
- `styles.css` — coach-voice dark theme (orange accent)
- `vercel.json` — security headers, clean URLs

No JavaScript. No form. No backend proxy. The CTA is an `sms:` link that
opens the user's Messages app with `start` pre-filled in the draft.

## Phone number — single place to change

The Train SMS number appears in two `<a class="btn-cta">` blocks in
`index.html` (search for `+14155550100`). When Linq Number B is provisioned,
swap both — the `href` (E.164, no spaces) and the visible label.

## Local dev

```bash
cd web/landing
npx serve .         # http://localhost:3000
```

## Deploy

Already linked to Vercel project `train-landing` (.vercel/ at repo root).
Future deploys:

```bash
vercel --prod
```

Production URL: <https://train-landing-pi.vercel.app>
