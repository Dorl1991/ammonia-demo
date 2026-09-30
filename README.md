# ammonia-demo

A pixel-faithful, fully interactive demo app built from the 48-station Stitch
project "midAmo" — a Hebrew (RTL) mobile safety-training lesson about ammonia
in a factory refrigeration system.

**Live demo:** https://dorl1991.github.io/ammonia-demo/
(source: https://github.com/Dorl1991/ammonia-demo, deployed free via GitHub
Pages from the `gh-pages` branch; `main` holds the editable source. To
redeploy after a change: `npm run build`, then copy `dist/` onto the
`gh-pages` branch and push.)

## How to run (Windows / PowerShell)

```powershell
cd "C:\Users\dorle\OneDrive\Desktop\Interactive learning\ammonia-demo"
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`) in a
browser. That's it — no backend, no accounts, no build step needed for local
use. Once `npm install` has run once, the app works fully **offline** (every
font, icon, and image is bundled locally; verified with zero external network
requests across all 48 stations — see `tools/verify.mjs`).

To produce a static production build: `npm run build` → output in `dist/`.
`npm run preview` serves that build locally to double-check it before
deploying `dist/` anywhere (e.g. as a static site).

### ⚠️ OneDrive note

This project lives inside a OneDrive-synced folder. `node_modules/` (created
by `npm install`) is ~40MB of thousands of small files, which OneDrive will
try to sync — slow and pointless for reproducible dependencies. Recommended:
right-click `ammonia-demo/node_modules` in Explorer → **"Always keep on this
device"** is the opposite of what you want; instead use **Settings → Sync and
backup → Advanced settings → excluded folders**, or simply add `node_modules`
to OneDrive's ignore list. Alternatively, move the whole project to a
non-synced path (e.g. `C:\dev\ammonia-demo`) if OneDrive sync lag becomes
annoying — nothing here depends on the current path. `.gitignore` already
excludes `node_modules/` and `dist/`.

## How it's organized

```
ammonia-demo/
  index.html            the app shell page (phone frame / full-viewport host)
  src/
    main.js             router, iframe pool, keyboard/swipe/hash nav
    shell.css            phone-frame + responsive layout
    station-titles.js    n -> Hebrew title, generated from station-map.json
  public/
    stations/NN/index.html   one self-contained, offline page per station
                              (harvested Tailwind CSS inlined, local fonts,
                              local images, bridge.js injected)
    bridge.js             shared engine: nav-button wiring, swipe passthrough,
                           calls this station's init from station-configs.js
    station-configs.js    one init() per station that needs real interaction
                           logic (checkpoints, quizzes, widgets built from
                           scratch); stations without an entry here are pure
                           content and only get free prev/next navigation
    fonts/                 Rubik + Material Symbols Outlined, self-hosted
    assets/                 the 8 remote illustration images, self-hosted
  source/
    stitch/NN/screen.html + screenshot.png   the original Stitch export per
                                              station, kept for reference/diff
    station-map.json       n -> Stitch screen id -> title
    notes-inventory.md      Phase-0 working notes (header defects, interaction
                             patterns found, the station-1 duplicate decision)
  tools/                    Node/Playwright scripts used to build and verify
                             (see below) — not needed to just run the app
  INVENTORY.md             Phase-0 per-station inventory (required deliverable)
  REPORT.md                final report (required deliverable)
```

### How a station page works

Each `public/stations/NN/index.html` is the **original Stitch markup**,
untouched except for:
1. The `cdn.tailwindcss.com` script + its inline config are replaced by one
   `<style>` block containing the exact CSS Tailwind would have compiled at
   runtime (harvested once via a headless browser in `tools/build-stations.mjs`).
2. Google Fonts `<link>`s are replaced by one `<link href="/fonts/fonts.css">`.
3. Any remote `googleusercontent.com` image is rewritten to a local
   `/assets/...` copy.
4. Two script tags are appended before `</body>`: one sets
   `window.__STATION_NUM__`, the other loads `/bridge.js`.

Nothing else changes — no text, colors, layout, or class names were edited.
Where a station needed real interactivity Stitch hadn't fully wired (a
checkpoint drawn in an "already answered" example state, a widget with no
JS at all), `station-configs.js` adds it in place, reusing the exact
correct/wrong visual classes Stitch already used elsewhere on that same
screen.

The app shell (`src/main.js`) keeps **all 48 iframes mounted simultaneously**
(one `<iframe>` per station, created lazily on first visit, hidden via
`display:none` when inactive rather than destroyed). This is what makes
"going back shows what you answered" work with zero extra state-serialization
code — the iframe's own DOM just keeps existing.

### How to add or edit a station

- **Change existing content/copy**: edit the matching file directly in
  `source/stitch/NN/screen.html`, then re-run
  `node tools/build-stations.mjs NN` to regenerate `public/stations/NN/index.html`
  (needs network, to re-harvest Tailwind CSS and any new images).
- **Add/change interactivity for a station**: edit `public/station-configs.js`
  — add or edit an `initStationNN()` function and register it in the
  `STATION_INIT` map at the bottom of the file. No rebuild needed, it's
  served directly.
- **Add a brand-new station**: append an entry to `source/station-map.json`,
  drop its Stitch `screen.html` under `source/stitch/NN/`, run
  `node tools/build-stations.mjs NN`, and bump `TOTAL` in `src/main.js` (and
  the `תחנה N מתוך 48` captions inside the new page, if you want them
  accurate — the demo doesn't recompute them, per the fidelity rule that
  governs the other 47).

## Verification tooling (`tools/`)

- `build-stations.mjs [n...]` — the localization/compile pipeline described
  above. Run with no arguments to (re)build all 48.
- `localize-fonts.mjs` — one-time font download (already run; only needed
  again if Google's font URLs change).
- `verify.mjs [n...]` — loads every built station, checks for JS console
  errors, external network requests, and horizontal overflow; writes
  `verify-report.md` and screenshots to `verify-shots/`.
- `test-interactions.mjs` — 35 targeted checks across the 14 stations with
  custom interaction logic (click the right option, submit, assert the
  correct/wrong class or feedback text appears).
- `test-widgets.mjs` — checks the 5 natively-functional Stitch widgets
  (compare-slider, flip-cards, click-reveal, hotspots, branching) still work
  after `bridge.js` is injected.
- `test-e2e.mjs` — full keyboard navigation across all 48 stations forward
  and back, plus a state-persistence check (answer a question, navigate away,
  navigate back, confirm the answer is still shown).
- `test-shell.mjs`, `test-nav.mjs`, `shot.mjs` — smaller one-off scripts used
  during development; safe to ignore or delete.

Run any of them with the dev server already running (`npm run dev` in
another terminal), e.g.:

```powershell
node tools/verify.mjs
node tools/test-interactions.mjs
```
