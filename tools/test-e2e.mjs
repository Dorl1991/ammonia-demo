import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://localhost:5173/#/1', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

// Forward through all 48 via keyboard (Left = next, RTL-aware).
for (let i = 1; i < 48; i++) {
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(120);
}
await page.waitForTimeout(200);
const hashAt48 = await page.evaluate(() => location.hash);
console.log('after 47 ArrowLeft presses from #/1, hash =', hashAt48, hashAt48 === '#/48' ? 'PASS' : 'FAIL');

// Backward through all 48 via keyboard (Right = prev).
for (let i = 48; i > 1; i--) {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
}
await page.waitForTimeout(200);
const hashAt1 = await page.evaluate(() => location.hash);
console.log('after 47 ArrowRight presses back, hash =', hashAt1, hashAt1 === '#/1' ? 'PASS' : 'FAIL');

// State persistence: answer Q1 on station 5, navigate away, come back.
await page.evaluate(() => { location.hash = '#/5'; });
await page.waitForTimeout(400);
let frame5 = page.frames().find(f => f.url().includes('/stations/05/'));
await frame5.getByText('לא נכון', { exact: true }).first().click();
await page.waitForTimeout(200);
const feedbackBefore = await frame5.locator('.q1-feedback').count();
console.log('station5 feedback present before nav-away:', feedbackBefore);

await page.evaluate(() => { location.hash = '#/10'; });
await page.waitForTimeout(400);
await page.evaluate(() => { location.hash = '#/5'; });
await page.waitForTimeout(400);
frame5 = page.frames().find(f => f.url().includes('/stations/05/'));
const feedbackAfter = await frame5.locator('.q1-feedback').count();
console.log('station5 feedback still present after navigating away and back:', feedbackAfter, feedbackAfter > 0 ? 'PASS (state persisted)' : 'FAIL (state lost)');

console.log('\nerrors during full run:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
