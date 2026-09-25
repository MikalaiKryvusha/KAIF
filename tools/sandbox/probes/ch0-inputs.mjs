// tools/sandbox/probes/ch0-inputs.mjs — a PROBE (not a polygon suite): step CH0 of plans/121 (2.8, epic CH) — every input the epic
// builds on, re-located at HEAD by SIGNATURE (a unique fragment of the line), the same method as ow0-inputs.mjs (a line address rots
// with every edit, a signature does not). Mode `count` judges a claimed number of hits (a recon line «grep … → N», 0 included: the
// epic adds what is ABSENT today, and the probe re-proves the absence at the moment the epic starts).
// usage: node tools/sandbox/probes/ch0-inputs.mjs          (read-only; prints a markdown table; exit 1 when an input is ABSENT)
// [TESTED: 2026-09-25 22:37:18 +03:00 · session 74: 17 inputs located at HEAD 433b89b — matched 13 · moved 1 · present 3; ABSENT proved on a
//  COPY with input 1's signature spoiled (22:37:26 — ABSENT, exit 1; the copy removed); report testcases/reports/2026-09-25_ch0-inputs.md]
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const C = 'framework/tools/contour/';
const G = 'framework/AGENT_GUIDE.md';
const S = (n) => `framework/skills/${n}/SKILL.md`;
const GUIDE_CEILING = 1080; // tools/check-framework.mjs guard 5j: 0.9 × the 1200 budget of the guide template

// [ticket/source, citation (researches/32 or plans/121 CH0), file, signature, cited line range | expected count | null, mode]
const INPUTS = [
  ['#78', 'reports.md:14 — «A report stays LOCAL until the owner says otherwise»', 'framework/readmes/reports.md', /A report stays LOCAL until the owner says otherwise/, [14, 14]],
  ['#78', 'kaif-update:89,101 — the `field-report` item (write, never «deliver»)', S('kaif-update'), /field-report|field report/, [89, 101]],
  ['#78', 'KAIF-CORE.mjs ≈3628 — `report` refuses a file without H1 and `**Delivered upstream:**`', 'framework/installer/KAIF-CORE.mjs', /is not a KAIF ticket: it needs an H1 title/, [3620, 3636]],
  ['#78', 'KAIF-CORE.mjs — the «undelivered signal» axis reads only the delivery line of a signal', 'framework/installer/KAIF-CORE.mjs', /undelivered KAIF signal: /, null],
  ['#97', 'end-chat-soft:130 — `Standing falsehood: none` verbatim (recon cited 106–108)', S('end-chat-soft'), /`Standing falsehood: none`/, [130, 130]],
  ['#97', 'end-chat-force:21–22 — the standing falsehood line «one phrase, verbatim»', S('end-chat-force'), /Standing falsehood: none/, [21, 22]],
  ['#97', 'fable-judge — the standing-falsehood hunt (which forms it accepts)', S('fable-judge'), /[Ss]tanding falsehood/, null],
  ['#96', '`grep -c "%H:%M %z" framework/AGENT_GUIDE.md` → 0 (no clock-probe rule in the payload)', G, /%H:%M %z/, 0, 'count'],
  ['#96', '`BOUNDARY` in /end-chat-soft → 0', S('end-chat-soft'), /BOUNDARY/, 0, 'count'],
  ['#96', '`BOUNDARY` in /dayloop → 0', S('dayloop'), /BOUNDARY/, 0, 'count'],
  ['#96', '`BOUNDARY` in /nightloop → 0 (twin)', S('nightloop'), /BOUNDARY/, 0, 'count'],
  ['#96', '`BOUNDARY` in /autoloop → 0 (twin)', S('autoloop'), /BOUNDARY/, 0, 'count'],
  ['#96', '`BOUNDARY` in /guarded-loop — the model the others follow', S('guarded-loop'), /BOUNDARY/, null],
  ['N10', '`grep -i withdraw` contour review.mjs → 0 (no «question withdrawn» form)', C + 'review.mjs', /withdraw/i, 0, 'count'],
  ['N10', '`grep -i withdraw` contour core.mjs → 0', C + 'core.mjs', /withdraw/i, 0, 'count'],
  ['N10', 'build-framework.mjs — the DELIVERY retirement note (recon cited :286)', 'tools/build-framework.mjs', /DELIVERY ACCOUNTING IS REMOVED/, [286, 286]],
  ['N10', 'build-framework.mjs — a `search:` field in any retirement/policy note → 0', 'tools/build-framework.mjs', /\bsearch:\s*\[/, 0, 'count'],
];

const linesOf = (f) => readFileSync(join(REPO, f), 'utf8').split(/\r?\n/);
let absent = 0;
console.log('| # | source | input (as the recon/plan cites it) | at HEAD | verdict |');
console.log('|---|---|---|---|---|');
INPUTS.forEach(([src, cite, file, re, want, mode], i) => {
  if (!existsSync(join(REPO, file))) { absent++; console.log(`| ${i + 1} | ${src} | ${cite} | \`${file}\` — no such file | ABSENT |`); return; }
  const hits = linesOf(file).map((l, n) => (re.test(l) ? n + 1 : 0)).filter(Boolean);
  let verdict;
  if (mode === 'count') verdict = hits.length === want ? `matched (${hits.length})` : `moved: ${hits.length} hit(s), cited ${want}`;
  else if (!hits.length) { verdict = 'ABSENT'; absent++; }
  else if (!want) verdict = 'present';
  else verdict = hits.some((n) => n >= want[0] && n <= want[1]) ? 'matched' : `moved → ${hits.join(', ')}`;
  const at = hits.length ? `\`${file}:${hits.slice(0, 4).join(',')}\`` : `\`${file}\` — 0 lines`;
  console.log(`| ${i + 1} | ${src} | ${cite.replace(/\|/g, '/')} | ${at} | ${verdict} |`);
});
const guide = linesOf(G).length - 1; // the file ends with a newline — `wc -l` counts newlines
console.log(`\n${G}: ${guide} lines · ceiling ${GUIDE_CEILING} · free ${GUIDE_CEILING - guide}`);
console.log(absent ? `BAD — ${absent} input(s) ABSENT at HEAD` : `GOOD — every input located (${INPUTS.length})`);
process.exit(absent ? 1 : 0);
