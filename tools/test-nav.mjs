import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://localhost:5173/#/1', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
console.log('start hash:', await page.evaluate(() => location.hash));

// Click the CTA inside the iframe (station 1's "בואו נתחיל")
const frame1 = page.frames().find(f => f.url().includes('/stations/01/'));
await frame1.click('#launch-course-btn');
await page.waitForTimeout(500);
console.log('after CTA click, hash:', await page.evaluate(() => location.hash));

await page.screenshot({ path: process.argv[2] || 'nav-test.png' });
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await browser.close();
