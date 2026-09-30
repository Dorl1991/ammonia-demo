// Shared bridge injected into every station page. Responsibilities:
//  1. Wire the Stitch-drawn nav buttons ("המשך"/"הקודם"/"בואו נתחיל"/
//     "סיים ובדוק"/"סיום השיעור") to postMessage the parent shell instead of
//     doing nothing (they are static <button>/<a> in the original markup).
//  2. Forward swipe gestures to the parent shell, except while a pointer
//     interaction started inside a drag/slider widget.
//  3. Run this station's specific interaction init (see station-configs.js),
//     which resets any "answered example" demo state to neutral and wires
//     real answer validation reusing each station's own visual language.
import { STATION_INIT } from '/station-configs.js';

const STATION_NUM = window.__STATION_NUM__;

function postToParent(msg) {
  try { window.parent.postMessage(msg, window.location.origin); } catch (e) { /* noop */ }
}

// ---- Nav button wiring -----------------------------------------------
// Advance/back buttons exist in two places across the 48 screens: a fixed
// <footer><nav> bar (most screens) or inline buttons inside <main> (station
// 1's hero, station 48's footer too). We match by visible text so it works
// regardless of markup shape, and we don't touch their existing onclick
// (history.back() in an iframe with no history is a harmless no-op).
const ADVANCE_TEXTS = ['המשך לתחנה הבאה', 'המשך', 'בואו נתחיל', 'סיים ובדוק', 'סיום השיעור'];
const BACK_TEXTS = ['הקודם', 'חזרה'];

function textOf(el) {
  return (el.innerText || el.textContent || '').trim();
}

function wireNavButtons() {
  const clickable = [...document.querySelectorAll('button, a')];
  for (const el of clickable) {
    const t = textOf(el);
    if (!t) continue;
    if (BACK_TEXTS.includes(t) && el.closest('header')) continue; // top-bar "back" = decorative in this demo, not station-back
    if (ADVANCE_TEXTS.some(a => t === a || t.startsWith(a))) {
      el.addEventListener('click', () => postToParent({ type: 'nav', dir: 'next', station: STATION_NUM }), { capture: false });
    } else if (BACK_TEXTS.includes(t)) {
      el.addEventListener('click', () => postToParent({ type: 'nav', dir: 'prev', station: STATION_NUM }), { capture: false });
    }
  }
}

// Station 1's CTA dispatches a custom 'course:start' event instead of using
// plain text matched above (it's inside a <div>, text is "בואו נתחיל" so the
// generic matcher above already covers it, this listener is a defensive
// backup in case that element's text ever fails to match).
window.addEventListener('course:start', () => postToParent({ type: 'nav', dir: 'next', station: STATION_NUM }));

// ---- Swipe gesture passthrough ----------------------------------------
// Any element the station itself makes draggable/interactive should own the
// gesture; we only forward a swipe to the parent when it did NOT start on
// one of those elements.
const DRAG_WIDGET_SELECTOR = [
  '#compare-widget-card', '[draggable="true"]', '.drag-item', '#drag-container',
  '#sequence-list', '#source-tray', '[data-drop-zone]', '[data-chip]',
  '.flip-card-inner', '.hotspot-node', '.accordion-item', 'input', 'textarea', 'button', 'label', 'a'
].join(', ');

let touchStartX = null, touchStartY = null, touchStartedOnWidget = false;
document.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX; touchStartY = t.clientY;
  touchStartedOnWidget = !!e.target.closest(DRAG_WIDGET_SELECTOR);
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (touchStartX === null || touchStartedOnWidget) { touchStartX = null; return; }
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  touchStartX = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    // RTL: swipe left (negative dx) = next (המשך is "forward" visually to the left);
    // swipe right (positive dx) = prev. Matches the arrow_back_ios chevrons used
    // for "המשך" throughout the Stitch screens (pointing left).
    postToParent({ type: 'swipe', dir: dx < 0 ? 'next' : 'prev', station: STATION_NUM });
  }
}, { passive: true });

// ---- Shared small helpers used by station-configs.js -------------------
export function setClass(el, classString) {
  if (el) el.className = classString;
}
export function enableButton(btn, on) {
  if (!btn) return;
  btn.disabled = !on;
  btn.classList.toggle('opacity-50', !on);
  btn.classList.toggle('cursor-not-allowed', !on);
}

// ---- Boot ---------------------------------------------------------------
function boot() {
  wireNavButtons();
  const init = STATION_INIT[STATION_NUM];
  if (typeof init === 'function') {
    try { init(); } catch (e) { console.error('station init error', STATION_NUM, e); }
  }
  postToParent({ type: 'ready', station: STATION_NUM });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
