import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

function walk(dir, out=[]) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (/\.(vue|ts)$/.test(f.name)) out.push(p);
  }
  return out;
}
for (const file of walk('./src')) {
  const txt = readFileSync(file,'utf8');
  if (/ion-tab-bar|ion-tabs/.test(txt)) {
    console.log('>>', file);
    (txt.match(/.*(ion-tab-bar|ion-tabs).*/g)||[]).forEach(l=>console.log('   ', l.trim()));
  }
}
