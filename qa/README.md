# QA folder

Visual-QA artifacts from the 2026-08-26 photography replacement pass.

## Reproducible V4 QA

```bash
npm ci
npx playwright install chromium
npm run qa
```

`npm run qa` starts its own temporary local server and verifies the V4 liquid-glass controls,
keyboard menu behavior, the 320px navbar boundary, drawer accessibility, image loading, and
browser console health. The older scripts below remain as focused regression/provenance checks.

- `screenshots/contact-sheet.jpg` — all 12 site photographs in one grid
- `screenshots/{desktop-1440,tablet-768,mobile-390,mobile-320}-full.png` — full-page captures
- `shoot.js`, `a11y_test.js`, `nav_check.js` — Playwright scripts (require `playwright`)

Retained intentionally for provenance; not linked from the site.
