// Loads a single built station page directly (not through the shell) and
// reports console/page errors after bridge.js + station-configs.js run.
// Optionally runs a small interaction script passed as JS source via --act.
import { chromium } from 'playwright';

const nn = String(process.argv[2]).padStart(2, '0');
const shotPath = process.argv[3];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto(`http://localhost:5173/stations/${nn}/index.html`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(300);

console.log(`station ${nn} load errors:`, errors.length ? errors.join(' | ') : 'none');

if (shotPath) await page.screenshot({ path: shotPath });

globalThis.__page = page;
globalThis.__browser = browser;
