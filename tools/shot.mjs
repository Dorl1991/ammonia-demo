import { chromium } from 'playwright';

const nn = process.argv[2];
const out = process.argv[3] || `check-${nn}.png`;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  offline: false // first load needs to fetch nothing external anyway; we verify via request interception below
});
const page = await context.newPage();

let externalRequests = [];
page.on('request', req => {
  const url = req.url();
  if (!url.startsWith('http://localhost:5173')) externalRequests.push(url);
});

await page.goto(`http://localhost:5173/stations/${nn}/index.html`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(300);
await page.screenshot({ path: out });
console.log('saved', out);
console.log('external requests:', externalRequests.length ? externalRequests : 'NONE (fully offline-capable)');
await browser.close();
