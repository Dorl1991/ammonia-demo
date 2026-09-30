// Renders every built station page, checks for JS errors / external network
// calls / horizontal overflow, and saves a screenshot for visual review.
// Run: node tools/verify.mjs [stationNumbers...]
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const stationMap = JSON.parse(readFileSync(join(root, 'source', 'station-map.json'), 'utf8'));
const shotsDir = join(root, 'verify-shots');
mkdirSync(shotsDir, { recursive: true });

const only = process.argv[2] ? process.argv.slice(2).map(Number) : null;
const base = process.env.BASE_URL || 'http://localhost:5173';

const browser = await chromium.launch();
const results = [];

for (const st of stationMap.stations) {
  if (only && !only.includes(st.n)) continue;
  const nn = String(st.n).padStart(2, '0');
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('request', req => { if (!req.url().startsWith(base)) external.push(req.url()); });

  let loadOk = true;
  try {
    await page.goto(`${base}/stations/${nn}/index.html`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(250);
  } catch (e) {
    loadOk = false;
    errors.push('goto failed: ' + e.message);
  }

  let hOverflow = false;
  let bodyText = '';
  if (loadOk) {
    hOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    bodyText = await page.evaluate(() => document.body.innerText.slice(0, 60));
    await page.screenshot({ path: join(shotsDir, `${nn}.png`) });
  }

  results.push({ n: st.n, title: st.title, loadOk, errors, external, hOverflow, bodyText });
  await context.close();
}

await browser.close();

let report = '# Verify results\n\n';
let failCount = 0;
for (const r of results) {
  const ok = r.loadOk && r.errors.length === 0 && r.external.length === 0 && !r.hOverflow;
  if (!ok) failCount++;
  report += `## ${String(r.n).padStart(2, '0')} ${r.title}\n`;
  report += `- loadOk: ${r.loadOk}\n`;
  report += `- jsErrors: ${r.errors.length ? r.errors.join(' | ') : 'none'}\n`;
  report += `- externalRequests: ${r.external.length ? r.external.join(' | ') : 'none'}\n`;
  report += `- horizontalOverflow: ${r.hOverflow}\n`;
  report += `- bodyTextSample: ${JSON.stringify(r.bodyText)}\n\n`;
}
report += `\nTOTAL: ${results.length} checked, ${failCount} with issues\n`;
writeFileSync(join(root, 'verify-report.md'), report);
console.log(report.split('\n').slice(-3).join('\n'));
console.log('full report: verify-report.md, screenshots: verify-shots/');
