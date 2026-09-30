import { chromium } from 'playwright';

const browser = await chromium.launch();
const results = [];

async function loadStation(nn) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto(`http://localhost:5173/stations/${nn}/index.html`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(250);
  return { page, errors };
}

function report(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`);
}

// --- Station 5: TF reset + click, MCQ submit validates correctly ---
{
  const { page, errors } = await loadStation('05');
  const disabledCount = await page.locator('button[disabled]').count();
  report('05 load', errors.length === 0, errors.join(' | '));
  report('05 tf-buttons-enabled-after-reset', disabledCount === 0, `disabled count=${disabledCount}`);
  // Click "לא נכון" (correct) on Q1 - find by text
  await page.getByText('לא נכון', { exact: true }).first().click();
  await page.waitForTimeout(150);
  const hasCorrectFeedback = await page.locator('text=נכון! אמוניה משמשת').count();
  report('05 q1-correct-feedback-shown', hasCorrectFeedback > 0);
  // Q2: click correct option then submit
  await page.getByText('למכל אחסון קר או ישירות לצריכה').click();
  await page.locator('#submit-quiz-btn').click();
  await page.waitForTimeout(150);
  const q2btnText = await page.locator('#submit-quiz-btn').innerText();
  report('05 q2-submit-shows-result', q2btnText.includes('נכון'), q2btnText);
  await page.close();
}

// --- Station 9: build-from-scratch TF + MCQ ---
{
  const { page, errors } = await loadStation('09');
  report('09 load', errors.length === 0, errors.join(' | '));
  await page.getByText('לא נכון', { exact: true }).first().click();
  await page.waitForTimeout(150);
  const fb = await page.locator('.q1-feedback').count();
  report('09 q1-feedback-appears', fb > 0);
  await page.getByText('כי הנוזל מתרחב פי מאות').click();
  await page.getByText('בדוק תשובות').click();
  await page.waitForTimeout(150);
  const correctHighlighted = await page.locator('.bg-tertiary-container\\/15').count();
  report('09 q2-correct-highlighted-on-submit', correctHighlighted > 0);
  await page.close();
}

// --- Station 13: mcq + 2x tf + submit ---
{
  const { page, errors } = await loadStation('13');
  report('13 load', errors.length === 0, errors.join(' | '));
  await page.getByText('לחץ', { exact: true }).first().click();
  await page.waitForTimeout(100);
  const q1fb = await page.locator('.q1-fb').count();
  report('13 q1-feedback', q1fb > 0);
  await page.locator('#q2-btn-false').click();
  await page.locator('#q3-btn-false').click();
  await page.waitForTimeout(100);
  const submitEnabled = await page.locator('#submit-quiz-btn').isEnabled();
  report('13 submit-enabled-after-both-tf', submitEnabled);
  await page.locator('#submit-quiz-btn').click();
  await page.waitForTimeout(150);
  const submitText = await page.locator('#submit-quiz-btn').innerText();
  report('13 submit-clicked-ok', submitText.length > 0, submitText);
  await page.close();
}

// --- Station 17: fill-blank + tf ---
{
  const { page, errors } = await loadStation('17');
  report('17 load', errors.length === 0, errors.join(' | '));
  await page.fill('#upper-code', '268');
  await page.fill('#lower-code', '1005');
  await page.getByText('בדוק תשובות').click();
  await page.waitForTimeout(150);
  const fbText = await page.locator('#q1-fillblank-fb').innerText().catch(() => '');
  report('17 fillblank-feedback', fbText.includes('נכון'), fbText);
  await page.close();
}

// --- Station 20: memory-match + mcq ---
{
  const { page, errors } = await loadStation('20');
  report('20 load', errors.length === 0, errors.join(' | '));
  const tileCount = await page.locator('[data-code]').count();
  report('20 tiles-rebuilt', tileCount === 6, `count=${tileCount}`);
  await page.locator('[data-code="H221"]').click();
  await page.locator('[data-code="R10"]').click();
  await page.waitForTimeout(150);
  const matchedCount = await page.locator('[data-code].pointer-events-none').count();
  report('20 pair-matched', matchedCount === 2, `matched=${matchedCount}`);
  await page.close();
}

// --- Station 24: sequence + tf + mcq ---
{
  const { page, errors } = await loadStation('24');
  report('24 load', errors.length === 0, errors.join(' | '));
  const submitEnabled = await page.locator('button:has-text("בדוק תשובות")').isEnabled();
  report('24 submit-enabled-free-nav', submitEnabled);
  await page.close();
}

// --- Station 28: drag-classify tap-to-place + tf ---
{
  const { page, errors } = await loadStation('28');
  report('28 load', errors.length === 0, errors.join(' | '));
  const trayCount = await page.locator('#source-tray [data-id]').count();
  report('28 tray-has-6-chips', trayCount === 6, `count=${trayCount}`);
  await page.locator('[data-id="acid"]').click();
  await page.waitForTimeout(100);
  const placedDanger = await page.locator('#zone-danger-items [data-id="acid"]').count();
  report('28 tap-places-chip-in-danger', placedDanger === 1);
  await page.close();
}

// --- Station 32: branching (native) + tf ---
{
  const { page, errors } = await loadStation('32');
  report('32 load', errors.length === 0, errors.join(' | '));
  await page.getByText('לדווח ולהמתין').click();
  await page.locator('label:has-text("לא נכון")').click();
  await page.locator('#check-btn').click();
  await page.waitForTimeout(150);
  const feedbackVisible = await page.locator('#feedback-alert:not(.hidden)').count();
  report('32 feedback-shown-after-check', feedbackVisible > 0);
  await page.close();
}

// --- Station 35: tf reset + native mcq ---
{
  const { page, errors } = await loadStation('35');
  report('35 load', errors.length === 0, errors.join(' | '));
  await page.getByText('להתייעץ עם איש אחזקה או מהנדס קירור').click();
  await page.getByText('בדוק תשובות').click();
  await page.waitForTimeout(150);
  const correctShown = await page.locator('text=מדויק! זו הפעולה המקצועית').count();
  report('35 native-mcq-still-works', correctShown > 0);
  await page.close();
}

// --- Station 39: sequence + match-pairs + tf ---
{
  const { page, errors } = await loadStation('39');
  report('39 load', errors.length === 0, errors.join(' | '));
  const matchButtons = await page.locator('button[data-val]').count();
  report('39 match-pairs-rebuilt', matchButtons === 10, `count=${matchButtons}`);
  await page.locator('button[data-val="מדחס"]').click();
  await page.locator('button[data-val="דוחס גז"]').click();
  await page.waitForTimeout(150);
  const matched = await page.locator('button[data-val].pointer-events-none').count();
  report('39 pair-connects', matched === 2, `matched=${matched}`);
  await page.close();
}

// --- Station 42: tf reset + native mcq ---
{
  const { page, errors } = await loadStation('42');
  report('42 load', errors.length === 0, errors.join(' | '));
  await page.getByText('מפריד טיפות', { exact: true }).first().click();
  await page.getByText('בדוק תשובות').click();
  await page.waitForTimeout(150);
  const correctShown = await page.locator('text=תשובה נכונה!').count();
  report('42 native-mcq-still-works', correctShown > 0);
  await page.close();
}

// --- Station 46: native mcq + tf reset ---
{
  const { page, errors } = await loadStation('46');
  report('46 load', errors.length === 0, errors.join(' | '));
  await page.getByText('כשל ציוד', { exact: true }).click();
  await page.getByText('בדוק תשובות').click();
  await page.waitForTimeout(150);
  const correctShown = await page.locator('text=נכון ומאושר').count();
  report('46 native-mcq-still-works', correctShown > 0);
  await page.close();
}

// --- Station 47: final quiz native tracking + our correctness marking ---
{
  const { page, errors } = await loadStation('47');
  report('47 load', errors.length === 0, errors.join(' | '));
  await page.locator('.q1-opt', { hasText: 'לא נכון' }).click();
  await page.fill('#input-q2', '300');
  await page.locator('.q3-opt', { hasText: '1005' }).click();
  await page.locator('.q4-opt', { hasText: 'לא נכון' }).click();
  await page.waitForTimeout(150);
  const submitEnabled = await page.locator('#submit-btn').isEnabled();
  report('47 submit-enabled-all-answered', submitEnabled);
  await page.locator('#submit-btn').click();
  await page.waitForTimeout(700);
  await page.close();
}

// --- Station 48: confetti + finish navigation ---
{
  const { page, errors } = await loadStation('48');
  report('48 load', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\nTOTAL: ${results.length} checks, ${failed.length} failed`);
if (failed.length) process.exitCode = 1;
