// tools/sandbox/probes/contour-badge-date.mjs — a PROBE (not a polygon suite): the repro of a contour date defect. The owner's queue
// printed the date of «shown» and «applied» badges as the first ten characters of a UTC moment (`.at.slice(0, 10)` in
// framework/tools/contour/review.mjs): between 00:00 and 03:00 local time (+03:00) that is YESTERDAY. The receipt's own human label
// (`atHuman` of provenance()) was correct.
// Behaviour, not text: a fixture queue with a document SHOWN at 01:30 local and a question APPLIED at 01:30 local; the probe reads the
// line of `listQueue` and the badge on the document page and names the date each one prints. It also lists the source sites that still
// cut a UTC moment. Needs a zone east of UTC (this machine: +03:00) — elsewhere the shift cannot show and the probe says so.
// usage: node tools/sandbox/probes/contour-badge-date.mjs [<contour dir>]   (default framework/tools/contour; reads only; no window, no sound)
// exit: 0 GREEN · 1 RED · 2 could not judge (zone at or west of UTC)
// [TESTED: 2026-09-26 05:32 +03:00 · red before the fix: at 2026-09-25T22:30:00.000Z, badge «2026-09-25»; the behavioural form — see
//  testcases/reports/2026-09-26_contour-queue-reload-and-badge-dates.md]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tempRoot } from '../../lib/temp-root.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const dir = resolve(process.argv[2] || join(REPO, 'framework', 'tools', 'contour'));
const mod = await import(pathToFileURL(join(dir, 'review.mjs')).href);
if (new Date().getTimezoneOffset() >= 0) { console.log('CANNOT JUDGE — this zone is at or west of UTC: a night moment keeps its date'); process.exit(2); }

const night = new Date(2026, 8, 26, 1, 30);   // 01:30 LOCAL on 2026-09-26
const local = '2026-09-26', utc = night.toISOString();
console.log(`local ${local} 01:30 · stored at ${utc} · the UTC cut would print ${utc.slice(0, 10)}`);

const root = tempRoot('probe-badge-date');
const DOC = 'interviews/interview_301_badge.md';
mkdirSync(join(root, 'interviews', 'decisions'), { recursive: true });
const q = (k) => ['### Q' + k + '. Вопрос ' + k + '?', '', '- **A)** первый', '- **B)** второй', '', '**Answer:**', ''].join('\n');
writeFileSync(join(root, DOC), ['# Interview #301 — значки даты', '', '> Topic: проба', "> Status: **🟡 awaiting the owner's answers**", '', q(1), q(2)].join('\n'));
writeFileSync(join(root, 'interviews', 'decisions', 'shown.json'), JSON.stringify({ [DOC]: { at: utc, transport: 'page' } }, null, 2));
writeFileSync(join(root, 'interviews', 'decisions', 'implemented.json'), JSON.stringify({ [DOC]: { Q1: { at: utc, where: 'probe-where' } } }, null, 2));

let bad = 0;
const judge = (name, text) => {
  const hasLocal = text.includes(local), hasUtc = text.includes(utc.slice(0, 10));
  const good = hasLocal && !hasUtc;
  if (!good) bad++;
  console.log((good ? '✅ ' : '❌ ') + name + ' — prints ' + (hasLocal ? local : '') + (hasUtc ? utc.slice(0, 10) : '') + (hasLocal || hasUtc ? '' : '(no date found)'));
};
try {
  const listed = mod.listQueue(root, { now: new Date(2026, 8, 26, 9, 0) });
  const lines = Array.isArray(listed) ? listed.join('\n') : String(listed.lines ? listed.lines.join('\n') : listed.text || JSON.stringify(listed));
  judge('the queue line «shown …» of a document shown at 01:30 local', lines.split('\n').filter((l) => l.includes(DOC)).join('\n'));
  const page = mod.buildPage(root, DOC).html;
  const badge = (page.match(/probe-where[^<]{0,120}/) || [''])[0];
  judge('the «applied» badge of a question applied at 01:30 local', badge);
} finally {
  try { rmSync(root, { recursive: true, force: true }); } catch { /* the OS temp cleans it */ }
}
const sites = readFileSync(join(dir, 'review.mjs'), 'utf8').split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /\.at\)?\.slice\(0, 10\)/.test(l));
for (const [n, l] of sites) console.log(`  source site review.mjs:${n} still cuts a UTC moment — ${l.trim().slice(0, 110)}`);
console.log(bad ? `RED — ${bad} badge(s) print the UTC date; a night moment reads as the day before` : 'GREEN — the badges print the local day');
process.exit(bad ? 1 : 0);
