import { chromium } from 'playwright';
const browser = await chromium.launch();
function report(name, ok, detail) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`); }

async function load(nn) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://localhost:5173/stations/${nn}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  return { page, errors };
}

// 10: compare-slider drag
{
  const { page, errors } = await load('10');
  const before = await page.locator('#refrig-clip-layer').evaluate(el => el.style.clipPath);
  const card = page.locator('#compare-widget-card');
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 50, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const after = await page.locator('#refrig-clip-layer').evaluate(el => el.style.clipPath);
  report('10 compare-slider drag changes clip-path', before !== after, `${before} -> ${after}`);
  report('10 no errors', errors.length === 0, errors.join(' | '));
  await page.close();
}

// 19: flip-cards
{
  const { page, errors } = await load('19');
  const firstCardInner = page.locator('.flip-card-inner').first();
  const before = await firstCardInner.evaluate(el => el.classList.contains('rotate-y-180'));
  await page.locator('[onclick="toggleFlip(this)"]').first().click();
  await page.waitForTimeout(150);
  const after = await firstCardInner.evaluate(el => el.classList.contains('rotate-y-180'));
  report('19 flip-card toggles on click', before !== after, `${before} -> ${after}`);
  const card6Inner = page.locator('.flip-card-inner').nth(5);
  const card6State = await card6Inner.evaluate(el => el.classList.contains('rotate-y-180'));
  report('19 card6 stays pre-flipped (widget keeps drawn state)', card6State === true);
  report('19 no errors', errors.length === 0, errors.join(' | '));
  await page.close();
}

// 27: click-reveal accordion
{
  const { page, errors } = await load('27');
  const firstButton = page.locator('.accordion-item button').first();
  await firstButton.click();
  await page.waitForTimeout(300);
  const maxHeight = await page.locator('.accordion-item .accordion-content').first().evaluate(el => el.style.maxHeight);
  report('27 accordion expands on click', maxHeight !== '0px', maxHeight);
  report('27 no errors', errors.length === 0, errors.join(' | '));
  await page.close();
}

// 37: hotspots
{
  const { page, errors } = await load('37');
  const titleBefore = await page.locator('#card-title').innerText();
  await page.locator('#node-1').click();
  await page.waitForTimeout(150);
  const titleAfter = await page.locator('#card-title').innerText();
  report('37 hotspot click changes detail card', titleBefore !== titleAfter, `${titleBefore} -> ${titleAfter}`);
  report('37 no errors', errors.length === 0, errors.join(' | '));
  await page.close();
}

// 32: branching Q1 native selection still works post-bridge
{
  const { page, errors } = await load('32');
  const btn = page.getByText('לגשת לבדוק').locator('..').locator('..');
  await page.getByText('לגשת לבדוק').click();
  await page.waitForTimeout(150);
  const ringCount = await page.locator('.ring-2.ring-primary-container').count();
  report('32 branching option gets ring on select', ringCount > 0);
  report('32 no errors', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();
