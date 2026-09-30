import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const file = join(process.cwd(), 'source', 'stitch', '01', 'screen.html');
const url = pathToFileURL(file).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('console', m => console.log('PAGE LOG:', m.text()));
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(500);

const styleCount = await page.$$eval('style', els => els.length);
const totalLen = await page.$$eval('style', els => els.map(e => e.textContent).join('\n').length);
console.log('style tags:', styleCount, 'total css chars:', totalLen);

// Check a known tailwind-generated class actually has rules
const hasRule = await page.evaluate(() => {
  const el = document.querySelector('.bg-surface-container-lowest');
  if (!el) return 'no element with that class found';
  const cs = getComputedStyle(el);
  return cs.backgroundColor;
});
console.log('computed bg for .bg-surface-container-lowest:', hasRule);

await browser.close();
