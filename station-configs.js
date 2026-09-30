// Per-station interaction wiring. Each Stitch checkpoint/quiz screen drew
// ONE example "answered" state (sometimes correct, sometimes wrong) as a
// design mock. Every init() below (a) resets that question to neutral/
// unanswered, and (b) wires real click/submit handlers that apply the exact
// correct/wrong visual classes Stitch already demonstrated on that same
// screen, per the "reuse the visual language already in Stitch" rule.
// Widgets that Stitch already shipped fully working (compare-slider,
// flip-cards, click-reveal, hotspots, branching-Q1) are left untouched here.

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function textIncludes(el, s) { return (el.textContent || '').includes(s); }
function findCardByText(selector, text) {
  return $all(selector).find(el => textIncludes(el, text));
}

// ---------------------------------------------------------------------
// Station 5 - checkpoint: Q1 true/false (reset from pre-answered), Q2 mcq
// (native select kept, replace fake-always-pass validator with a real one).
function initStation5() {
  const q1Section = findCardByText('section', 'אמוניה במפעל משמשת רק לקירור');
  if (q1Section) {
    const [trueBtn, falseBtn] = $all('button', q1Section);
    const feedback = $('.bg-tertiary-fixed\\/20', q1Section) || q1Section.querySelector('div:last-child');
    const feedbackHTML = feedback ? feedback.outerHTML : '';
    if (feedback) feedback.remove();
    [[trueBtn, 'נכון'], [falseBtn, 'לא נכון']].forEach(([btn, label]) => {
      btn.disabled = false;
      btn.removeAttribute('aria-checked');
      btn.className = 'h-13 py-3 px-space-md rounded-xl bg-surface-container-low text-secondary flex items-center justify-center gap-space-xs font-body-lg-medium text-body-lg-medium transition-all active:scale-[0.98]';
      btn.innerHTML = `<span>${label}</span>`;
    });
    const answer = 'לא נכון';
    const wire = (btn, label) => btn.addEventListener('click', () => {
      const correct = label === answer;
      [trueBtn, falseBtn].forEach(b => b.className = 'h-13 py-3 px-space-md rounded-xl bg-surface-container-low text-secondary flex items-center justify-center gap-space-xs font-body-lg-medium text-body-lg-medium transition-all active:scale-[0.98]');
      btn.className = correct
        ? 'h-13 py-3 px-space-md rounded-xl bg-tertiary-fixed/30 text-on-tertiary-fixed flex items-center justify-center gap-space-xs font-body-lg-medium text-body-lg-medium shadow-sm transition-transform active:scale-[0.99]'
        : 'h-13 py-3 px-space-md rounded-xl bg-error-container text-on-error-container flex items-center justify-center gap-space-xs font-body-lg-medium text-body-lg-medium shadow-sm transition-transform active:scale-[0.99]';
      let fb = q1Section.querySelector('.q1-feedback');
      if (fb) fb.remove();
      const div = document.createElement('div');
      div.className = 'q1-feedback flex items-start gap-space-xs p-space-sm rounded-lg ' + (correct ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' : 'bg-error-container text-on-error-container');
      div.innerHTML = `<span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">${correct ? 'task_alt' : 'cancel'}</span><p class="font-body-sm text-body-sm font-medium leading-snug">${correct ? 'נכון! אמוניה משמשת גם לדשנים, ניקוי, דלק ועוד' : 'לא נכון - אמוניה משמשת גם לדשנים, ניקוי, דלק ועוד, לא רק לקירור'}</p>`;
      q1Section.appendChild(div);
    });
    wire(trueBtn, 'נכון'); wire(falseBtn, 'לא נכון');
  }

  const submitBtn = $('#submit-quiz-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const selected = $('.q2-option[aria-checked="true"]');
      if (!selected) return;
      const correctText = 'למכל אחסון קר או ישירות לצריכה';
      const isCorrect = textIncludes(selected, correctText);
      submitBtn.classList.remove('bg-primary');
      submitBtn.classList.add(isCorrect ? 'bg-tertiary' : 'bg-error');
      submitBtn.innerHTML = isCorrect
        ? '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>נכון!</span>'
        : `<span class="material-symbols-outlined text-[20px]">cancel</span><span>לא נכון - התשובה: ${correctText}</span>`;
    });
  }
}

// Station 9 - checkpoint: build both Q1 (tf) and Q2 (mcq) from scratch;
// their "correct"/"wrong" visual language is demonstrated by Q2's own
// example markup (bg-tertiary-container/15 = correct, bg-error-container/40
// = wrong), reused here for Q1 too.
function initStation9() {
  const q1Card = findCardByText('div.bg-surface-container-lowest', 'ברגעים הראשונים של דליפה');
  if (q1Card) {
    const [trueBtn, falseBtn] = $all('button', q1Card);
    const answer = 'לא נכון';
    const wire = (btn, label) => btn.addEventListener('click', () => {
      const correct = label === answer;
      let fb = q1Card.querySelector('.q1-feedback');
      if (fb) fb.remove();
      const div = document.createElement('div');
      div.className = 'q1-feedback mt-2 p-3 rounded-lg flex items-start gap-2 ' + (correct ? 'bg-tertiary-container/15' : 'bg-error-container/40');
      div.innerHTML = `<span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">${correct ? 'check_circle' : 'cancel'}</span><p class="font-body-sm text-body-sm font-medium">${correct ? 'נכון - ברגעים הראשונים הגז כבד מהאוויר ונשאר נמוך' : 'לא נכון - ברגעים הראשונים של דליפה הגז דווקא כבד מהאוויר ונשאר נמוך'}</p>`;
      q1Card.appendChild(div);
    });
    wire(trueBtn, 'נכון'); wire(falseBtn, 'לא נכון');
  }

  const q2Card = findCardByText('div.bg-surface-container-lowest', 'ליצור ענן גז ענק');
  if (q2Card) {
    const options = $all('div.flex.items-center.justify-between, div.relative.flex.flex-col', q2Card).filter(d => d.parentElement && d.parentElement !== q2Card ? true : d.textContent.trim().length > 0);
    // Simpler: grab the 4 direct option wrapper divs by their unique texts.
    const optTexts = ['בגלל הרוח שמפזרת אותו', 'בגלל הטמפרטורה בחוץ', 'כי הנוזל מתרחב פי מאות כשהוא הופך לגז', 'כי הגז מגיב עם החמצן באוויר'];
    const correctText = optTexts[2];
    const optEls = optTexts.map(t => findCardByText('div', t)).filter(Boolean).map(el => el.closest('.relative, .flex.items-center.justify-between') || el);
    let selected = null;
    optEls.forEach((el, i) => {
      el.classList.add('cursor-pointer');
      el.addEventListener('click', () => {
        selected = optTexts[i];
        optEls.forEach(o => o.className = 'flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low text-on-surface transition-all cursor-pointer');
        el.className = 'flex items-center justify-between p-3.5 rounded-xl bg-primary-fixed text-on-surface transition-all cursor-pointer shadow-sm';
      });
    });
    const submitBtn = $('button.bg-primary', q2Card.closest('div.flex.flex-col.w-full.gap-4') || document);
    const bigBtn = findCardByText('button', 'בדוק תשובות');
    if (bigBtn) bigBtn.addEventListener('click', () => {
      if (!selected) return;
      const isCorrect = selected === correctText;
      optEls.forEach((o, i) => {
        if (optTexts[i] === correctText) {
          o.className = 'flex items-center justify-between p-3.5 rounded-xl bg-tertiary-container/15 text-on-surface transition-all shadow-sm';
        } else if (optTexts[i] === selected && !isCorrect) {
          o.className = 'flex items-center justify-between p-3.5 rounded-xl bg-error-container/40 text-on-surface transition-all';
        }
      });
    });
  }
}

// Station 13 - checkpoint: Q1 mcq (reset from answered), Q2/Q3 native
// true-false (selectOption already works), wire the submit button for real.
function initStation13() {
  const q1Card = findCardByText('div.bg-surface-container-lowest.rounded-xl', 'מה קובע יותר את מצב המכל');
  if (q1Card) {
    // Remove the pre-baked "already answered" explanatory callout (last
    // child of the section, outside the options list) so Q1 starts neutral.
    const staleFeedback = q1Card.querySelector(':scope > div.bg-status-containment-bg.rounded-lg.p-3');
    if (staleFeedback) staleFeedback.remove();
    const optionsWrap = q1Card.querySelector('div.flex.flex-col.gap-2');
    const optDivs = optionsWrap ? [...optionsWrap.children] : [];
    const answer = 'לחץ';
    optDivs.forEach(div => {
      const label = div.textContent.includes('טמפרטורה') ? 'טמפרטורה' : 'לחץ';
      div.className = 'w-full p-3.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
      div.innerHTML = `<div class="flex items-center gap-3"><div class="w-5 h-5 rounded-full bg-surface-container-highest shrink-0"></div><span class="font-body-lg text-body-lg text-on-surface">${label}</span></div>`;
      div.addEventListener('click', () => {
        const correct = label === answer;
        optDivs.forEach(d => d.className = 'w-full p-3.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all');
        div.className = 'w-full p-3.5 rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-sm ' + (correct ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
        let fb = q1Card.querySelector('.q1-fb');
        if (fb) fb.remove();
        const box = document.createElement('div');
        box.className = 'q1-fb rounded-lg p-3 flex items-start gap-2.5 ' + (correct ? 'bg-status-containment-bg' : 'bg-status-fire-bg');
        box.innerHTML = `<span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">${correct ? 'verified' : 'error'}</span><p class="font-body-sm text-body-sm leading-relaxed">${correct ? 'נכון - לחץ הוא האינדיקטור האמין למצב המכל' : 'לא נכון - לחץ, לא טמפרטורה, הוא האינדיקטור האמין למצב המכל'}</p>`;
        q1Card.appendChild(box);
      });
    });
  }
  const submitBtn = $('#submit-quiz-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      // window.selectOption from the page's own inline script already
      // tracks q2/q3 via button classes; read the DOM state directly.
      const q2True = $('#q2-btn-true'); const q2False = $('#q2-btn-false');
      const q3True = $('#q3-btn-true'); const q3False = $('#q3-btn-false');
      const isActive = (btn) => btn && btn.className.includes('text-primary');
      const q2Val = isActive(q2True) ? 'true' : (isActive(q2False) ? 'false' : null);
      const q3Val = isActive(q3True) ? 'true' : (isActive(q3False) ? 'false' : null);
      if (!q2Val || !q3Val) return;
      markTF(q2True, q2False, q2Val === 'false', 'לא נכון');
      markTF(q3True, q3False, q3Val === 'false', 'לא נכון');
      submitBtn.textContent = 'התשובות נבדקו';
    });
  }
  function markTF(trueBtn, falseBtn, falseIsCorrect, correctLabel) {
    const winner = falseIsCorrect ? falseBtn : trueBtn;
    const loser = falseIsCorrect ? trueBtn : falseBtn;
    if (winner) winner.classList.add('!bg-status-containment-bg', '!text-status-containment-text');
    if (loser) loser.classList.add('opacity-40');
  }
}

// Station 17 - checkpoint: fill-blank (two numeric inputs), true/false
// (reset from wrong-demo). No native submit handler existed; add one.
function initStation17() {
  const upper = $('#upper-code'); const lower = $('#lower-code');
  const tfCard = findCardByText('div.w-full.bg-surface-container-lowest', 'מספיק להתייחס לאמוניה');
  let trueDiv, falseDiv;
  if (tfCard) {
    const divs = $all('div', tfCard).filter(d => (textIncludes(d, 'נכון') && !textIncludes(d, 'לא נכון')) || textIncludes(d, 'לא נכון'));
    // Reset both option rows to neutral, clickable.
    const rows = $all('div.w-full.p-3\\.5', tfCard);
    rows.forEach(row => {
      const isFalseRow = row.textContent.includes('לא נכון');
      row.className = 'w-full p-3.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between transition-all cursor-pointer';
      row.querySelectorAll('span.material-symbols-outlined, div.rounded-full > span').forEach(s => {});
      row.addEventListener('click', () => {
        const correct = isFalseRow; // answer is "לא נכון"
        rows.forEach(r => r.className = 'w-full p-3.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between transition-all cursor-pointer');
        row.className = 'w-full p-3.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ' + (correct ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
      });
    });
  }
  const submitBtn = findCardByText('button', 'בדוק תשובות');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (!upper || !lower) return;
      const ok = upper.value.trim() === '268' && lower.value.trim() === '1005';
      [upper, lower].forEach(inp => {
        inp.style.boxShadow = ok ? '0 0 0 2px rgba(16,185,129,0.6)' : '0 0 0 2px rgba(239,68,68,0.6)';
      });
      let fb = $('#q1-fillblank-fb');
      if (!fb) {
        fb = document.createElement('div');
        fb.id = 'q1-fillblank-fb';
        fb.className = 'mt-2 text-body-sm font-body-sm';
        upper.closest('div.w-full.bg-surface-container-lowest').appendChild(fb);
      }
      fb.textContent = ok ? 'נכון! 268 למעלה, 1005 למטה' : 'לא נכון - המספר העליון הוא 268 והתחתון 1005';
      fb.className = 'mt-2 text-body-sm font-body-sm font-medium ' + (ok ? 'text-status-containment-text' : 'text-status-fire-text');
    });
  }
}

// Station 20 - checkpoint: memory-match (3 pairs, reset to fully unmatched)
// + mcq (native select, add real validation for "125").
function initStation20() {
  const pairs = [['H221', 'R10'], ['H314', 'R34'], ['H331', 'R23']];
  const flat = pairs.flat();
  const tileGrid = $('.grid.grid-cols-3.gap-2\\.5');
  if (tileGrid) {
    const tiles = flat.map(code => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flex flex-col items-center justify-center h-24 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-all active:scale-95 shadow-xs';
      const isOld = code.startsWith('H');
      btn.innerHTML = `<span class="font-label-caps text-label-caps text-on-surface-variant opacity-75 uppercase tracking-widest mb-0.5">${isOld ? 'ישן' : 'חדש'}</span><span class="font-headline-md text-headline-md font-medium">${code}</span>`;
      btn.dataset.code = code;
      return btn;
    });
    tileGrid.replaceChildren(...tiles);
    let firstPick = null;
    let matchedCount = 0;
    const counterBadge = findCardByText('span', 'מתוך 3 זוגות');
    if (counterBadge) counterBadge.textContent = '0 מתוך 3 זוגות';
    const hintLine = findCardByText('span', 'בחר את האריח המקביל');
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        if (tile.classList.contains('pointer-events-none')) return;
        if (!firstPick) {
          firstPick = tile;
          tile.className = 'relative flex flex-col items-center justify-center h-24 rounded-xl bg-primary-fixed text-on-primary-fixed shadow-md transition-all scale-[1.02]';
          return;
        }
        if (firstPick === tile) return;
        const pairOf = (c) => pairs.find(p => p.includes(c));
        const isPair = pairOf(firstPick.dataset.code)?.includes(tile.dataset.code) && firstPick.dataset.code !== tile.dataset.code;
        if (isPair) {
          [firstPick, tile].forEach(t => {
            t.className = 'relative flex flex-col items-center justify-center h-24 rounded-xl bg-status-containment-bg text-status-containment-text shadow-xs pointer-events-none';
            const label = t.dataset.code.startsWith('H') ? 'ישן' : 'חדש';
            t.innerHTML = `<div class="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-status-containment-text text-on-primary"><span class="material-symbols-outlined text-[12px] font-bold">check</span></div><span class="font-label-caps text-label-caps opacity-75 uppercase tracking-widest mb-0.5">${label}</span><span class="font-headline-md text-headline-md font-bold tracking-tight">${t.dataset.code}</span>`;
          });
          matchedCount++;
          if (counterBadge) counterBadge.textContent = `${matchedCount} מתוך 3 זוגות`;
          if (hintLine && matchedCount < 3) {
            const remaining = flat.filter(c => ![...document.querySelectorAll('[data-code]')].find(t => t.dataset.code === c && t.classList.contains('pointer-events-none')));
          }
        } else {
          const wrongEls = [firstPick, tile];
          wrongEls.forEach(t => t.classList.add('!bg-status-fire-bg'));
          setTimeout(() => wrongEls.forEach(t => {
            t.classList.remove('!bg-status-fire-bg');
            t.className = 'flex flex-col items-center justify-center h-24 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container transition-all active:scale-95 shadow-xs';
          }), 500);
        }
        firstPick = null;
      });
    });
  }

  const mcqOptions = $all('#quiz-q2-options label');
  const submitBtn = $('#submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const checked = mcqOptions.find(l => l.querySelector('input').checked);
      if (!checked) return;
      const isCorrect = checked.querySelector('input').value === '125';
      mcqOptions.forEach(l => {
        const correct = l.querySelector('input').value === '125';
        if (l === checked) {
          l.className = 'group relative flex items-center justify-between p-3.5 rounded-xl transition-all shadow-xs ' + (isCorrect ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
        } else if (correct && !isCorrect) {
          l.className = 'group relative flex items-center justify-between p-3.5 rounded-xl bg-status-containment-bg/60 text-status-containment-text transition-all shadow-xs';
        }
      });
    });
  }
}

// Station 24 - checkpoint: sequence (native HTML5 dnd already wired, add
// touch fallback + validation), true/false (reset), mcq (native radio, add
// check), enable+wire the submit button.
function initStation24() {
  const dragContainer = $('#drag-container');
  const correctOrder = ['25 PPM', '300 PPM', '700 PPM', '5,000 PPM'];
  if (dragContainer) addTouchReorder(dragContainer, '.drag-item');

  const tfSection = findCardByText('section', 'ריח קל של אמוניה אומר');
  let tfTrueEl, tfFalseEl, tfAnswerGiven = false;
  if (tfSection) {
    const grid = $('.grid.grid-cols-2', tfSection);
    const trueDiv = grid.children[0], falseDiv = grid.children[1];
    [trueDiv, falseDiv].forEach((div, i) => {
      const label = i === 0 ? 'נכון' : 'לא נכון';
      div.className = 'flex items-center justify-center p-space-sm rounded-lg bg-surface-container-low text-on-surface cursor-pointer transition-all';
      div.innerHTML = `<span class="font-label-ui text-label-ui font-medium">${label}</span>`;
      div.addEventListener('click', () => {
        tfAnswerGiven = true;
        const correct = label === 'לא נכון';
        trueDiv.className = 'flex items-center justify-center p-space-sm rounded-lg bg-surface-container-low text-on-surface cursor-pointer transition-all';
        falseDiv.className = 'flex items-center justify-center p-space-sm rounded-lg bg-surface-container-low text-on-surface cursor-pointer transition-all';
        div.className = 'flex items-center justify-center p-space-sm rounded-lg cursor-pointer transition-all shadow-sm ' + (correct ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
      });
    });
  }

  const mcqRadios = $all('input[name="q3"]');
  const submitBtn = findCardByText('button', 'בדוק תשובות');
  if (submitBtn) {
    submitBtn.removeAttribute('disabled');
    submitBtn.removeAttribute('aria-disabled');
    submitBtn.classList.remove('bg-primary-container/40', 'text-on-tertiary/70', 'cursor-not-allowed');
    submitBtn.classList.add('bg-primary-container', 'text-on-tertiary', 'cursor-pointer');
    submitBtn.addEventListener('click', () => {
      const items = $all('.drag-item', dragContainer).map(i => i.querySelector('.font-headline-sm').textContent.trim());
      const seqOk = JSON.stringify(items) === JSON.stringify(correctOrder);
      dragContainer.style.outline = seqOk ? '2px solid #10b981' : '2px solid #ef4444';
      const checkedRadio = mcqRadios.find(r => r.checked);
      if (checkedRadio) {
        const label = checkedRadio.closest('label');
        const isCorrect = checkedRadio.value === '2';
        label.classList.add(isCorrect ? 'bg-status-containment-bg' : 'bg-status-fire-bg');
      }
    });
  }
}

// Station 28 - checkpoint: drag-classify (reset all 6 chips to the tray,
// tap-to-place), true/false (native select, wire real check).
function initStation28() {
  const items = [
    { id: 'acid', label: 'חומצה', icon: 'science', zone: 'danger' },
    { id: 'bleach', label: 'אקונומיקה', icon: 'drag_indicator', zone: 'danger' },
    { id: 'chlorine', label: 'כלור', icon: 'drag_indicator', zone: 'danger' },
    { id: 'silver', label: 'כסף', icon: 'drag_indicator', zone: 'danger' },
    { id: 'salt', label: 'מלח בישול', icon: 'drag_indicator', zone: 'neutral' },
    { id: 'water', label: 'מים', icon: 'water_drop', zone: 'neutral' },
  ];
  const tray = $('#source-tray');
  const zoneDanger = $('#zone-danger-items');
  const zoneNeutral = $('#zone-neutral-items');
  const counterDanger = $('#zone-1-counter');
  const counterNeutral = $('#zone-2-counter');
  if (tray && zoneDanger && zoneNeutral) {
    zoneDanger.replaceChildren();
    zoneNeutral.replaceChildren();
    const chips = items.map(it => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.dataset.id = it.id;
      chip.dataset.placed = '';
      chip.className = 'inline-flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm active:scale-95 transition-all hover:bg-surface-container';
      chip.innerHTML = `<span class="material-symbols-outlined text-[16px] text-on-surface-variant">drag_indicator</span><span class="font-body-md text-body-md">${it.label}</span>`;
      return chip;
    });
    tray.replaceChildren(...chips);
    if (counterDanger) counterDanger.textContent = '0 שובץ';
    if (counterNeutral) counterNeutral.textContent = '0 שובץ';

    function updateCounters() {
      if (counterDanger) counterDanger.textContent = `${zoneDanger.children.length} שובץ`;
      if (counterNeutral) counterNeutral.textContent = `${zoneNeutral.children.length} שובץ`;
    }
    function placeInZone(chip, zoneEl, zoneName) {
      chip.dataset.placed = zoneName;
      chip.onclick = () => returnToTray(chip);
      zoneEl.appendChild(chip);
      updateCounters();
    }
    function returnToTray(chip) {
      chip.dataset.placed = '';
      chip.onclick = () => openZonePicker(chip);
      tray.appendChild(chip);
      updateCounters();
    }
    function openZonePicker(chip) {
      // Tap-to-place: tapping a tray chip places it in the danger zone by
      // default; a second tap on a placed chip cycles it to neutral, a
      // third returns it to the tray. Simple, touch-friendly 3-state cycle.
      const state = chip.dataset.placed;
      if (!state) placeInZone(chip, zoneDanger, 'danger');
      else if (state === 'danger') placeInZone(chip, zoneNeutral, 'neutral');
      else returnToTray(chip);
    }
    chips.forEach(chip => { chip.onclick = () => openZonePicker(chip); });
  }

  const submitBtn = $('#submit-quiz-btn');
  const tfButtons = $all('.tf-option');
  const tfAnswer = 'false'; // "מותר לנקות... באקונומיקה" -> לא נכון
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      // Validate classification
      const dangerSet = new Set(['acid', 'bleach', 'chlorine', 'silver']);
      const neutralSet = new Set(['salt', 'water']);
      let allCorrect = true;
      $all('[data-id]').forEach(chip => {
        const placed = chip.dataset.placed;
        const shouldBeDanger = dangerSet.has(chip.dataset.id);
        const correct = (placed === 'danger' && shouldBeDanger) || (placed === 'neutral' && !shouldBeDanger && neutralSet.has(chip.dataset.id));
        if (!placed) { allCorrect = false; return; }
        if (!correct) allCorrect = false;
        chip.classList.toggle('!ring-2', true);
        chip.classList.toggle('!ring-status-containment-text', correct);
        chip.classList.toggle('!ring-status-fire-text', !correct);
      });
      // Validate TF
      const selectedTf = tfButtons.find(b => b.classList.contains('bg-primary-fixed'));
      if (selectedTf) {
        const chosenIsFalse = selectedTf.textContent.includes('לא נכון');
        const tfCorrect = (chosenIsFalse && tfAnswer === 'false') || (!chosenIsFalse && tfAnswer === 'true');
        selectedTf.classList.remove('bg-primary-fixed', 'text-on-primary-fixed-variant');
        selectedTf.classList.add(tfCorrect ? 'bg-status-containment-bg' : 'bg-status-fire-bg', tfCorrect ? 'text-status-containment-text' : 'text-status-fire-text');
      }
      submitBtn.textContent = allCorrect ? 'הכל נכון!' : 'נבדק - בדוק סימונים אדומים';
    });
  }
}

// Station 32 - branching Q1 already fully native/working; only Q2 true/false
// needs a real check wired to the existing triggerCheckFeedback button.
function initStation32() {
  const radios = $all('input[name="ammonia-water"]');
  const checkBtn = $('#check-btn');
  if (checkBtn && radios.length) {
    checkBtn.addEventListener('click', () => {
      const checked = radios.find(r => r.checked);
      if (!checked) return;
      const label = checked.closest('label');
      const isCorrect = checked.value === 'false'; // "מותר להתיז מים ישירות..." -> לא נכון
      label.classList.add(isCorrect ? 'bg-status-containment-bg' : 'bg-status-fire-bg');
    });
  }
}

// Station 35 - true/false Q1 (reset, instant feedback), Q2 mcq already fully
// native and correct (data-correct="true") - left untouched.
function initStation35() {
  const q1Card = document.getElementById('quiz-question-2') ? findCardByText('div.bg-surface-container-lowest', 'מותר לתעל שלולית') : findCardByText('div.bg-surface-container-lowest', 'מותר לתעל שלולית');
  if (q1Card) {
    const optionsRow = $('.grid.grid-cols-2', q1Card);
    if (optionsRow) {
      const [trueDiv, falseDiv] = [...optionsRow.children];
      [trueDiv, falseDiv].forEach((div, i) => {
        const label = i === 0 ? 'נכון' : 'לא נכון';
        div.className = 'p-space-sm rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
        div.innerHTML = `<div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[11px] font-label-caps text-secondary font-bold">${i + 1}</span><span class="font-label-ui text-label-ui font-medium">${label}</span></div>`;
        div.addEventListener('click', () => {
          const correct = label === 'לא נכון';
          trueDiv.className = 'p-space-sm rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
          falseDiv.className = 'p-space-sm rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
          div.className = 'p-space-sm rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-sm ' + (correct ? 'bg-status-containment-bg text-on-surface' : 'bg-status-fire-bg text-on-surface');
        });
      });
    }
  }
}

// Station 39 - sequence (build DnD+touch from scratch), match-pairs (build
// tap-to-connect from scratch, reset the 1/5 demo), true/false (reset).
function initStation39() {
  const seqList = $('#sequence-list');
  const correctOrder = ['מדחס', 'מעבה', 'שסתום התפשטות', 'מאייד', 'מפריד טיפות'];
  if (seqList) {
    seqList.setAttribute('draggable-container', '');
    $all('.font-body-lg.font-medium', seqList).forEach(() => {});
    $all('div', seqList).forEach(item => {
      if (item.parentElement === seqList) item.setAttribute('draggable', 'true');
    });
    addTouchReorder(seqList, ':scope > div');
    nativeDnd(seqList, ':scope > div');
  }

  // Match-pairs: rebuild both columns as plain buttons, reset all links.
  const pairs = { 'מדחס': 'דוחס גז', 'מעבה': 'מקרר לנוזל', 'שסתום התפשטות': 'מוריד לחץ', 'מאייד': 'סופג חום', 'מפריד טיפות': 'מגן על המדחס' };
  const matchCounter = findCardByText('span', 'מתוך 5 הושלם');
  if (matchCounter) matchCounter.textContent = '0 מתוך 5 הושלם';
  const grid = findCardByText('div.relative.grid.grid-cols-2', 'רכיב במערכת');
  if (grid) {
    const connectorBanner = grid.querySelector('.col-span-2');
    if (connectorBanner) connectorBanner.remove();
    const [colA, colB] = $all(':scope > div', grid);
    if (colA && colB) {
      const labelA = colA.firstElementChild; const labelB = colB.firstElementChild;
      const comps = Object.keys(pairs);
      const roles = Object.values(pairs);
      const btnsA = comps.map(c => mkMatchBtn(c));
      const btnsB = shuffle([...roles]).map(r => mkMatchBtn(r));
      colA.replaceChildren(labelA, ...btnsA);
      colB.replaceChildren(labelB, ...btnsB);
      let pickA = null, pickB = null, matched = 0;
      function tryMatch() {
        if (!pickA || !pickB) return;
        const isPair = pairs[pickA.dataset.val] === pickB.dataset.val;
        if (isPair) {
          [pickA, pickB].forEach(b => { b.className = 'p-2.5 rounded-lg bg-status-containment-bg text-status-containment-text flex items-center justify-between text-right pointer-events-none'; });
          matched++;
          if (matchCounter) matchCounter.textContent = `${matched} מתוך 5 הושלם`;
        } else {
          [pickA, pickB].forEach(b => b.classList.add('!bg-status-fire-bg'));
          setTimeout(() => [pickA, pickB].forEach(b => { if (!b.className.includes('pointer-events-none')) b.className = 'p-2.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between text-right hover:bg-surface-container active:scale-[0.98] transition-all'; }), 450);
        }
        pickA = null; pickB = null;
      }
      function mkMatchBtn(val) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.val = val;
        b.className = 'p-2.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between text-right hover:bg-surface-container active:scale-[0.98] transition-all';
        b.innerHTML = `<span class="font-body-md text-body-md">${val}</span><span class="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span>`;
        return b;
      }
      btnsA.forEach(b => b.addEventListener('click', () => {
        if (b.className.includes('pointer-events-none')) return;
        btnsA.forEach(x => { if (!x.className.includes('pointer-events-none')) x.className = 'p-2.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between text-right hover:bg-surface-container active:scale-[0.98] transition-all'; });
        b.className = 'p-2.5 rounded-lg bg-primary-fixed text-safety-amber-deep flex items-center justify-between text-right shadow-sm';
        pickA = b; tryMatch();
      }));
      btnsB.forEach(b => b.addEventListener('click', () => {
        if (b.className.includes('pointer-events-none')) return;
        btnsB.forEach(x => { if (!x.className.includes('pointer-events-none')) x.className = 'p-2.5 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between text-right hover:bg-surface-container active:scale-[0.98] transition-all'; });
        b.className = 'p-2.5 rounded-lg bg-primary-fixed text-safety-amber-deep flex items-center justify-between text-right shadow-sm';
        pickB = b; tryMatch();
      }));
    }
  }

  const tfSection = findCardByText('section', 'האזור הקר הוא באזור הלחץ הגבוה');
  if (tfSection) {
    const optGrid = $('.grid.grid-cols-2', tfSection);
    if (optGrid) {
      const [trueDiv, falseDiv] = [...optGrid.children];
      [trueDiv, falseDiv].forEach((div, i) => {
        const label = i === 0 ? 'נכון' : 'לא נכון';
        div.className = 'p-3 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
        div.innerHTML = `<span class="font-label-ui text-label-ui font-semibold">${label}</span>`;
        div.addEventListener('click', () => {
          const correct = label === 'לא נכון';
          trueDiv.className = 'p-3 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
          falseDiv.className = 'p-3 rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
          div.className = 'p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-sm ' + (correct ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
        });
      });
    }
  }

  const submitBtn = findCardByText('button', 'בדוק תשובות');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (!seqList) return;
      const items = $all(':scope > div', seqList).map(i => i.querySelector('.font-body-lg, .font-medium')?.textContent.trim());
      const ok = JSON.stringify(items) === JSON.stringify(correctOrder);
      seqList.style.outline = ok ? '2px solid #10b981' : '2px solid #ef4444';
    });
  }
}

// Station 42 - true/false Q1 (reset, instant feedback), Q2 mcq already fully
// native and correct - left untouched.
function initStation42() {
  const q1Article = findCardByText('article', 'אחרי הפסקת חשמל, הדליפה באזור הקר');
  if (q1Article) {
    const optGrid = $('.grid.grid-cols-2', q1Article);
    if (optGrid) {
      const [trueDiv, falseDiv] = [...optGrid.children];
      [trueDiv, falseDiv].forEach((div, i) => {
        const label = i === 0 ? 'נכון' : 'לא נכון';
        div.className = 'flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer transition-all select-none';
        div.innerHTML = `<div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-surface-container flex items-center justify-center"></span><span class="font-body-md text-body-md text-on-surface">${label}</span></div>`;
        div.addEventListener('click', () => {
          const correct = label === 'לא נכון';
          trueDiv.className = 'flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer transition-all select-none';
          falseDiv.className = 'flex items-center justify-between p-3 rounded-lg bg-surface-container-low cursor-pointer transition-all select-none';
          div.className = 'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all select-none shadow-sm ' + (correct ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
        });
      });
    }
  }
}

// Station 46 - Q1 mcq already fully native and correct (kept). Q2 true/false
// reset from pre-answered demo, instant feedback on click.
function initStation46() {
  const q2Section = findCardByText('section', 'הסיכון לדליפה זהה תמיד');
  if (q2Section) {
    const optGrid = $('.grid.grid-cols-2', q2Section);
    if (optGrid) {
      const [trueDiv, falseDiv] = [...optGrid.children];
      [trueDiv, falseDiv].forEach((div, i) => {
        const label = i === 0 ? 'נכון' : 'לא נכון';
        div.className = 'p-space-md rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
        div.innerHTML = `<div class="flex items-center gap-space-xs"><div class="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center"></div><span class="font-body-md text-body-md">${label}</span></div>`;
        div.addEventListener('click', () => {
          const correct = label === 'לא נכון';
          trueDiv.className = 'p-space-md rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
          falseDiv.className = 'p-space-md rounded-lg bg-surface-container-low text-on-surface flex items-center justify-between cursor-pointer transition-all';
          div.className = 'p-space-md rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-sm ' + (correct ? 'bg-status-containment-bg text-status-containment-text' : 'bg-status-fire-bg text-status-fire-text');
        });
      });
    }
  }
}

// Station 47 - final quiz: the page's own script already tracks answers and
// enables "סיים ובדוק"; we only replace the always-succeeds finish behavior
// with a real per-question correct/wrong marking (no separate score screen,
// per spec since Stitch drew none).
function initStation47() {
  const submitBtn = $('#submit-btn');
  if (!submitBtn) return;
  submitBtn.addEventListener('click', () => {
    const q1True = $('.q1-opt:nth-child(1)'); const q1False = $('.q1-opt:nth-child(2)');
    const q2Input = $('#input-q2');
    const q3Selected = $all('.q3-opt').find(b => b.className.includes('bg-status-containment-bg'));
    const q4True = $('.q4-opt:nth-child(1)'); const q4False = $('.q4-opt:nth-child(2)');
    // Determine which was chosen by looking at which button got the
    // page's own "selected" class (bg-status-containment-bg, applied by its
    // native selectTrueFalse()).
    setTimeout(() => {
      markQ(q1True, q1False, 'false'); // "מסתיים בפיצוץ" -> לא נכון
      markFill(q2Input, '300');
      markQ3(q3Selected, '1005');
      markQ(q4True, q4False, 'false'); // "להתיז מים ישירות" -> לא נכון
      const card = document.getElementById('card-q1')?.closest('.space-y-space-md') || document.body;
    }, 50);
  });
  function markQ(trueBtn, falseBtn, correctVal) {
    const chosen = [trueBtn, falseBtn].find(b => b && b.className.includes('bg-status-containment-bg'));
    if (!chosen) return;
    const chosenVal = chosen === trueBtn ? 'true' : 'false';
    const ok = chosenVal === correctVal;
    if (!ok) {
      chosen.classList.remove('bg-status-containment-bg', 'text-status-containment-text');
      chosen.classList.add('bg-status-fire-bg', 'text-status-fire-text');
      const rightBtn = correctVal === 'true' ? trueBtn : falseBtn;
      rightBtn.classList.add('!bg-status-containment-bg', '!text-status-containment-text');
    }
  }
  function markFill(input, correctVal) {
    if (!input) return;
    const ok = input.value.trim() === correctVal;
    input.style.boxShadow = ok ? '0 0 0 2px rgba(16,185,129,0.6)' : '0 0 0 2px rgba(239,68,68,0.6)';
    if (!ok) {
      const hint = document.createElement('div');
      hint.className = 'text-status-fire-text font-body-sm text-body-sm mt-1';
      hint.textContent = `התשובה הנכונה: ${correctVal} PPM`;
      input.closest('.bg-surface-container-low').appendChild(hint);
    }
  }
  function markQ3(chosenBtn, correctVal) {
    if (!chosenBtn) return;
    const ok = chosenBtn.textContent.trim().includes(correctVal);
    if (!ok) {
      chosenBtn.classList.remove('bg-status-containment-bg', 'text-status-containment-text');
      chosenBtn.classList.add('bg-status-fire-bg', 'text-status-fire-text');
      const icon = chosenBtn.querySelector('.opt-icon');
      if (icon) {
        icon.textContent = 'cancel';
        icon.className = 'material-symbols-outlined text-status-fire-text text-[20px] opt-icon';
      }
    }
  }
}

// Station 48 - keep the native confetti/relabel script; add real
// navigation back to station 1 once the (now "סיום השיעור") button fires.
function initStation48() {
  // Stitch's own inline relabel-to-"סיום השיעור" script runs before the
  // <footer> exists in document order (it's placed near the top of <body>,
  // the footer is the very last element) so it silently no-ops on a normal
  // top-to-bottom parse. Finish what it already intended, using its own
  // exact markup/text, then wire real navigation on top.
  setTimeout(() => {
    const footerBtn = $all('footer button').find(b => textIncludesAny(b, ['סיום השיעור', 'המשך']));
    if (footerBtn && textIncludesAny(footerBtn, ['המשך'])) {
      footerBtn.innerHTML = '<span class="font-label-ui text-label-ui">סיום השיעור</span><span class="material-symbols-outlined text-[18px]">verified</span>';
    }
    if (footerBtn) {
      footerBtn.addEventListener('click', () => {
        if (window.confettiBlast) window.confettiBlast();
        setTimeout(() => {
          try { window.parent.postMessage({ type: 'finish' }, window.location.origin); } catch (e) {}
        }, 550); // let the confetti play first
      });
    }
  }, 0);
  function textIncludesAny(el, arr) { return arr.some(t => (el.textContent || '').includes(t)); }
}

// ---------------------------------------------------------------------
// Shared low-level helpers for sequence reordering (used by 24 and 39).
function shuffle(arr) { return arr; } // deterministic - Stitch already shuffled the DOM order for us

function nativeDnd(container, itemSelector) {
  let draggedItem = null;
  container.addEventListener('dragstart', (e) => {
    const target = e.target.closest(itemSelector.replace(':scope > ', ''));
    if (!target || target.parentElement !== container) return;
    draggedItem = target;
    e.dataTransfer.effectAllowed = 'move';
    target.style.opacity = '0.5';
  });
  container.addEventListener('dragend', (e) => {
    if (draggedItem) draggedItem.style.opacity = '1';
    draggedItem = null;
  });
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    const after = getDragAfterElement(container, e.clientY, itemSelector);
    if (after == null) container.appendChild(draggedItem);
    else container.insertBefore(draggedItem, after);
  });
  function getDragAfterElement(container, y, sel) {
    const els = [...container.querySelectorAll(sel.replace(':scope > ', ':scope > '))].filter(el => el !== draggedItem);
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

// Touch-friendly reorder fallback: tap an item to "pick it up" (highlight),
// tap another to swap positions with it. Works alongside native HTML5 DnD
// (mouse) without conflicting, since touch devices don't fire dragstart.
// Also keyboard-accessible: each row is focusable; Space/Enter picks/drops
// exactly like a tap, ArrowUp/ArrowDown move the focused row directly.
function addTouchReorder(container, itemSelector) {
  let picked = null;
  function renumber() {
    [...container.children].forEach((child, idx) => {
      const badge = child.querySelector('.font-label-caps');
      if (badge && /^\d+$/.test(badge.textContent.trim())) badge.textContent = String(idx + 1);
    });
  }
  function pickOrSwap(item) {
    if (!picked) {
      picked = item;
      item.style.outline = '2px solid #ff6a00';
      return;
    }
    if (picked === item) {
      item.style.outline = '';
      picked = null;
      return;
    }
    const items = [...container.children];
    const pi = items.indexOf(picked), ii = items.indexOf(item);
    if (pi < ii) container.insertBefore(picked, item.nextSibling);
    else container.insertBefore(picked, item);
    picked.style.outline = '';
    picked = null;
    renumber();
  }
  container.addEventListener('click', (e) => {
    const item = e.target.closest(itemSelector.replace(':scope > ', ''));
    if (!item || item.parentElement !== container) return;
    pickOrSwap(item);
  });
  [...container.children].forEach(item => {
    item.tabIndex = 0;
    item.setAttribute('role', 'listitem');
    item.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        pickOrSwap(item);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const sibling = e.key === 'ArrowUp' ? item.previousElementSibling : item.nextElementSibling;
        if (!sibling) return;
        if (e.key === 'ArrowUp') container.insertBefore(item, sibling);
        else container.insertBefore(sibling, item);
        renumber();
        item.focus();
      }
    });
  });
}

export const STATION_INIT = {
  5: initStation5,
  9: initStation9,
  13: initStation13,
  17: initStation17,
  20: initStation20,
  24: initStation24,
  28: initStation28,
  32: initStation32,
  35: initStation35,
  39: initStation39,
  42: initStation42,
  46: initStation46,
  47: initStation47,
  48: initStation48,
};
