import stationMap from './station-titles.js';

const viewport = document.getElementById('station-viewport');
const jumpSelect = document.getElementById('station-jump');

const TOTAL = 48;
const iframes = new Map(); // n -> iframe element, created lazily and kept alive
let current = null;
let transitioning = false;

function stationNN(n) { return String(n).padStart(2, '0'); }

function getOrCreateIframe(n) {
  if (iframes.has(n)) return iframes.get(n);
  const iframe = document.createElement('iframe');
  iframe.src = `./stations/${stationNN(n)}/index.html`;
  iframe.setAttribute('title', stationMap[n] || `תחנה ${n}`);
  iframe.style.display = 'none';
  viewport.appendChild(iframe);
  iframes.set(n, iframe);
  return iframe;
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function goTo(n, { fromDir } = {}) {
  n = Math.max(1, Math.min(TOTAL, n));
  if (n === current) return;
  if (transitioning) return;
  const prevN = current;
  const nextIframe = getOrCreateIframe(n);
  const prevIframe = prevN ? iframes.get(prevN) : null;

  jumpSelect.value = String(n);
  window.location.hash = `#/${n}`;
  current = n;

  const motion = !reducedMotion();
  // RTL slide: "next" enters from the left (per spec 4).
  const dir = fromDir || (prevN && n > prevN ? 'next' : 'prev');

  nextIframe.style.display = 'block';
  if (motion) {
    nextIframe.style.transition = 'none';
    nextIframe.style.transform = dir === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
    // force reflow
    void nextIframe.offsetWidth;
    nextIframe.style.transition = '';
  } else {
    nextIframe.style.transform = 'translateX(0)';
  }

  transitioning = true;
  requestAnimationFrame(() => {
    nextIframe.style.transform = 'translateX(0)';
    if (prevIframe && motion) {
      prevIframe.style.transform = dir === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
    }
  });

  const cleanup = () => {
    if (prevIframe) {
      prevIframe.style.display = 'none';
      prevIframe.style.transform = 'translateX(0)';
    }
    transitioning = false;
  };
  if (motion) {
    setTimeout(cleanup, 240);
  } else {
    cleanup();
  }
}

// ---- postMessage bridge from station iframes ----------------------------
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'nav') {
    if (msg.dir === 'next') goTo(current + 1, { fromDir: 'next' });
    else if (msg.dir === 'prev') goTo(current - 1, { fromDir: 'prev' });
  } else if (msg.type === 'swipe') {
    if (msg.dir === 'next') goTo(current + 1, { fromDir: 'next' });
    else if (msg.dir === 'prev') goTo(current - 1, { fromDir: 'prev' });
  } else if (msg.type === 'finish') {
    goTo(1, { fromDir: 'prev' });
  }
});

// ---- Keyboard nav (RTL-aware: Right = prev, Left = next) ----------------
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(current + 1, { fromDir: 'next' });
  else if (e.key === 'ArrowRight') goTo(current - 1, { fromDir: 'prev' });
});

// ---- Hash routing ---------------------------------------------------------
function parseHash() {
  const m = window.location.hash.match(/#\/(\d+)/);
  return m ? Number(m[1]) : 1;
}
window.addEventListener('hashchange', () => {
  const n = parseHash();
  if (n !== current) goTo(n);
});

// ---- Desktop jump-to-station select ---------------------------------------
for (let n = 1; n <= TOTAL; n++) {
  const opt = document.createElement('option');
  opt.value = String(n);
  opt.textContent = `${n} - ${stationMap[n] || ''}`;
  jumpSelect.appendChild(opt);
}
jumpSelect.addEventListener('change', () => goTo(Number(jumpSelect.value)));

// ---- Boot -------------------------------------------------------------
const startN = parseHash();
current = null;
goTo(startN, { fromDir: 'next' });
