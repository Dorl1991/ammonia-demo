// Downloads every woff2 referenced in public/fonts/*.css and rewrites the CSS
// to point at the local copy, so the fonts work fully offline.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, '..', 'public', 'fonts');
const filesDir = join(fontsDir, 'files');
mkdirSync(filesDir, { recursive: true });

const cssFiles = ['rubik.css', 'material-symbols.css'];

for (const file of cssFiles) {
  const path = join(fontsDir, file);
  let css = readFileSync(path, 'utf8');
  const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]);
  const unique = [...new Set(urls)];
  console.log(`${file}: ${unique.length} font files`);
  for (const url of unique) {
    const name = url.split('/').pop();
    const localPath = join(filesDir, name);
    if (!existsSync(localPath)) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`fetch failed ${url}: ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(localPath, buf);
      console.log('  downloaded', name, buf.length, 'bytes');
    }
    css = css.split(url).join(`./files/${name}`);
  }
  writeFileSync(path, css);
  console.log(`${file}: rewritten to local paths`);
}
console.log('done');
