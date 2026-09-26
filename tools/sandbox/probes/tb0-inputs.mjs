// tools/sandbox/probes/tb0-inputs.mjs — a PROBE (not a polygon suite): step TB0 of plans/124 (2.8, epic TB) — every input the epic builds
// on, located at HEAD by SIGNATURE (the method of up0/sc0-inputs). The ticket (origin #105) cites the canon by section, not by line.
// usage: node tools/sandbox/probes/tb0-inputs.mjs          (read-only; prints a markdown table; exit 1 when an input is ABSENT)
// [TESTED: 2026-09-26 03:30:34 +03:00 · 7 inputs located at HEAD 25d67fb; red on a spoiled copy (03:30:47, exit 1; the copy removed);
//  report testcases/reports/2026-09-26_tb0-inputs.md]
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const T = 'framework/TESTING_FRAMEWORK.md';
const S = 'framework/skills/report-bug/SKILL.md';
// [ticket, what the ticket says, file, signature, expected count | null (present)]
const INPUTS = [
  ['#105', 'step 6 names the defect shape only as a list of words, no sections', T, /^6\. \*\*File defects in the defined shape\.\*\* Steps to reproduce · expected vs actual/, 1],
  ['#105', 'the RU root layer carries the same step 6', 'TESTING_FRAMEWORK.md', /^6\. \*\*Оформляй дефекты в заданной форме\.\*\*/, 1],
  ['#105', 'no step «Hunt the reproduction» in the canon', T, /Hunt the reproduction/, 0],
  ['#105', '/report-bug ships only templates A and B (KAIF ticket, improvement)', S, /^### Template [ABC] — /, 2],
  ['#105', 'no tester\'s report template (Description · Steps to reproduce · Expected · Actual)', S, /^## (Description|Steps to reproduce|Expected result|Actual result)$/, 0],
  ['#105', 'no section check for a tester\'s report in the run-report linter', 'framework/tools/kaif-testrun-lint.mjs', /Steps to reproduce|Шаги воспроизведения/, 0],
  ['budget', 'the delivery testing canon sits at its ceiling (0.9 × 300 = 270 lines; guard 5j)', T, null, null],
];
const lines = (f) => readFileSync(join(REPO, f), 'utf8').split(/\r?\n/);
let absent = 0;
console.log('| # | source | input | at HEAD | verdict |');
console.log('|---|---|---|---|---|');
INPUTS.forEach(([src, what, file, re, want], i) => {
  if (!existsSync(join(REPO, file))) { absent++; console.log(`| ${i + 1} | ${src} | ${what} | \`${file}\` — no such file | ABSENT |`); return; }
  const L = lines(file);
  if (!re) { const n = L[L.length - 1] === '' ? L.length - 1 : L.length; console.log(`| ${i + 1} | ${src} | ${what} | \`${file}\` — ${n} lines | measured |`); return; }
  const hits = L.map((l, n) => (re.test(l) ? n + 1 : 0)).filter(Boolean);
  const ok = want === null ? hits.length > 0 : hits.length === want;
  if (!ok && want !== 0) absent++;
  console.log(`| ${i + 1} | ${src} | ${what} | \`${file}\`${hits.length ? ':' + hits.slice(0, 4).join(',') : ''} | ${ok ? `matched (${hits.length})` : `DIFFERS: ${hits.length}, expected ${want}`} |`);
});
console.log(absent ? `BAD — ${absent} input(s) absent or different` : `GOOD — every input located (${INPUTS.length})`);
process.exit(absent ? 1 : 0);
