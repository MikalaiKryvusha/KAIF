// tools/sandbox/probes/contour-badge-date.mjs — a PROBE (not a polygon suite): the repro of a contour date defect, red by construction
// until it is fixed. The owner's queue prints the date of «shown» and «applied» badges as the first ten characters of a UTC moment
// (`.at.slice(0, 10)` in framework/tools/contour/review.mjs): between 00:00 and 03:00 local time (+03:00) that is YESTERDAY. The receipt's
// own human label (`atHuman` of provenance()) is correct — the pool item that blamed it was probed and rewritten (STATUS, pool).
// usage: node tools/sandbox/probes/contour-badge-date.mjs      (reads only; no window, no sound)
// [TESTED: 2026-09-26 05:32 +03:00 · a local 2026-09-26 01:30 gives at 2026-09-25T22:30:00.000Z, atHuman «26 сентября 2026, 01:30
//  (+03:00)», badge «2026-09-25»; the fix is due in daylight — a contour change needs the full verify-contour]
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const REVIEW = join(REPO, 'framework', 'tools', 'contour', 'review.mjs');
const { provenance } = await import(pathToFileURL(join(REPO, 'framework', 'tools', 'contour', 'core.mjs')).href);
const night = new Date(2026, 8, 26, 1, 30);   // 01:30 LOCAL on 2026-09-26
const p = provenance(night, 'en');
const localDate = `${night.getFullYear()}-${String(night.getMonth() + 1).padStart(2, '0')}-${String(night.getDate()).padStart(2, '0')}`;
console.log(`local ${localDate} 01:30 · at ${p.at} · atHuman «${p.atHuman}» · a badge by .at.slice(0, 10) prints ${p.at.slice(0, 10)}`);
const sites = readFileSync(REVIEW, 'utf8').split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /\.at\)?\.slice\(0, 10\)/.test(l));
for (const [n, l] of sites) console.log(`  site framework/tools/contour/review.mjs:${n} — ${l.trim().slice(0, 120)}`);
const shifted = p.at.slice(0, 10) !== localDate && new Date().getTimezoneOffset() < 0;
if (sites.length && shifted) { console.log(`RED — ${sites.length} badge site(s) print the UTC date; a night moment reads as the day before`); process.exit(1); }
console.log(sites.length ? 'GREEN on this zone — the shift needs a zone east of UTC' : 'GREEN — no badge prints a UTC date');
