// Phase 1 build: for each of the 48 Stitch source screens, harvest the
// Tailwind-CDN-compiled CSS (needs network, one-time), localize remote
// images, strip the CDN script + Google Fonts links, and write a
// self-contained page to public/stations/NN/index.html that references only
// local files (/fonts/fonts.css, /assets/..., /bridge.js, /station-configs.js).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const stitchDir = join(root, 'source', 'stitch');
const stationMap = JSON.parse(readFileSync(join(root, 'source', 'station-map.json'), 'utf8'));
const assetsDir = join(root, 'public', 'assets');
const stationsOutDir = join(root, 'public', 'stations');
mkdirSync(assetsDir, { recursive: true });

const only = process.argv[2] ? process.argv.slice(2).map(Number) : null;

const browser = await chromium.launch();

for (const st of stationMap.stations) {
  if (only && !only.includes(st.n)) continue;
  const nn = String(st.n).padStart(2, '0');
  const srcPath = join(stitchDir, nn, 'screen.html');
  let html = readFileSync(srcPath, 'utf8');

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(srcPath).href, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);

  const harvestedCss = await page.$$eval('style', els => els.map(e => e.textContent).join('\n\n'));

  // Localize remote images (googleusercontent CDN illustrations), both
  // plain <img src="..."> and CSS background-image: url('...') forms.
  const srcUrls = [...html.matchAll(/src="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g)].map(m => m[1]);
  const bgUrls = [...html.matchAll(/url\(['"]?(https:\/\/lh3\.googleusercontent\.com\/[^'")]+)['"]?\)/g)].map(m => m[1]);
  const imgUrls = [...srcUrls, ...bgUrls];
  let imgIndex = 0;
  for (const url of [...new Set(imgUrls)]) {
    imgIndex++;
    const localName = `${nn}-img-${imgIndex}.jpg`;
    const localPath = join(assetsDir, localName);
    if (!existsSync(localPath)) {
      const res = await fetch(url);
      if (!res.ok) { errors.push(`image fetch failed ${url}: ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(localPath, buf);
    }
    // Replace both quoted-src and url(...) occurrences of this exact URL.
    html = html.split(`"${url}"`).join(`"../../assets/${localName}"`);
    html = html.split(url).join(`../../assets/${localName}`);
  }

  await page.close();

  // Strip Tailwind CDN script + inline config script
  html = html.replace(/<script[^>]*src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/, '');
  html = html.replace(/<script id="tailwind-config"[^>]*>[\s\S]*?<\/script>/, '');

  // Strip existing <style> blocks (their content is already inside harvestedCss)
  html = html.replace(/<style>[\s\S]*?<\/style>/g, '');

  // Strip Google Fonts preconnect + stylesheet links, replace with local fonts.css
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/g, '');
  html = html.replace(
    /<\/head>/,
    `<link rel="stylesheet" href="../../fonts/fonts.css">\n<style>${harvestedCss}</style>\n</head>`
  );

  // Inject station number + bridge script before </body>
  html = html.replace(
    /<\/body>/,
    `<script>window.__STATION_NUM__ = ${st.n};</script>\n<script type="module" src="../../bridge.js"></script>\n</body>`
  );

  const outDir = join(stationsOutDir, nn);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);

  console.log(`station ${nn}: css=${harvestedCss.length}chars images=${imgIndex} errors=${errors.length}`);
  if (errors.length) console.log('  ', errors.join(' | '));
}

await browser.close();
console.log('build-stations done');
