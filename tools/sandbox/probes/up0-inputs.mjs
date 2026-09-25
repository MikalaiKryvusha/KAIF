// tools/sandbox/probes/up0-inputs.mjs — a PROBE (not a polygon suite): step UP0 of plans/122 (2.8, epic UP) — every input the epic builds
// on, re-located at HEAD by SIGNATURE (the method of ow0-inputs / ch0-inputs). The recon (researches/32 §2а) cited line addresses at
// 6af0dad; a signature survives edits. Mode `count` re-proves a claimed number of hits.
// usage: node tools/sandbox/probes/up0-inputs.mjs          (read-only; prints a markdown table; exit 1 when an input is ABSENT)
// [TESTED: 2026-09-26 00:39:54 +03:00 · 10 inputs located at HEAD 876caae (3 matched · 6 moved · 1 present); ABSENT proved on a spoiled copy
//  (00:40:01, exit 1; the copy removed); report testcases/reports/2026-09-26_up0-inputs.md]
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const K = 'framework/installer/KAIF-CORE.mjs';
const S = (n) => `framework/skills/${n}/SKILL.md`;

// [ticket/source, citation (researches/32 §2а at 6af0dad), file, signature, cited line range | expected count | null, mode]
const INPUTS = [
  ['#72', 'KAIF-CORE.mjs:1431 — a declared rename binds only when the OLD heading is on disk (onDisk.has(o))', K, /for \(const \[o, n\] of declared\) if \(onDisk\.has\(o\)/, [1431, 1431]],
  ['#72', 'KAIF-CORE.mjs:1757 — «the section arrives as new» logged for every renameMissing', K, /the section arrives as new/, [1757, 1757]],
  ['#72', 's27 — no case «renamed in advance» (the new heading already on disk)', 'tools/sandbox/s27-rename-map.mjs', /renamed in advance|переименовано заранее/i, 0, 'count'],
  ['#73', 'KAIF-CORE.mjs:584 — the slot value capture excludes < and >', K, /\[\^\\\\n<>\]\+\?/, [584, 584]],
  ['#81', 'kaif-update:48–51 — «matched the sandbox byte for byte», no autocrlf condition', S('kaif-update'), /byte for byte/, [48, 51]],
  ['#81', 'kaif-update — no «autocrlf» in the rehearsal recipe', S('kaif-update'), /autocrlf/, 0, 'count'],
  ['#92', 'KAIF-CORE.mjs:1536–1537 — a module absent on disk with no upstream change is skipped (continue)', K, /if \(oldEIns && oldEIns\.sha256 === normSha\(modText\(nm\)\)\) continue;/, [1536, 1537]],
  ['#92', 'KAIF-CORE.mjs:1967 — the receipt writes divergedModules', K, /if \(delta\.length\) divergedModules\[f\.path\] = delta;/, [1967, 1967]],
  ['#92', 'KAIF-CORE.mjs:2404 — update-verify checks the unmerged only when NOT i18n-translated', K, /if \(!i18nTranslated && task\.includes\('## Module diffs'\)\)/, [2404, 2404]],
  ['N17', 'the rehearsal record .kaif/update-rehearsal.json — read by the next update', K, /update-rehearsal\.json/, null],
];

const linesOf = (f) => readFileSync(join(REPO, f), 'utf8').split(/\r?\n/);
let absent = 0;
console.log('| # | source | input (as the recon cites it) | at HEAD | verdict |');
console.log('|---|---|---|---|---|');
INPUTS.forEach(([src, cite, file, re, want, mode], i) => {
  if (!existsSync(join(REPO, file))) {
    if (mode === 'count' && want === 0) { console.log(`| ${i + 1} | ${src} | ${cite} | \`${file}\` — no such file | matched (0: file absent) |`); return; }
    absent++; console.log(`| ${i + 1} | ${src} | ${cite} | \`${file}\` — no such file | ABSENT |`); return;
  }
  const hits = linesOf(file).map((l, n) => (re.test(l) ? n + 1 : 0)).filter(Boolean);
  let verdict;
  if (mode === 'count') verdict = hits.length === want ? `matched (${hits.length})` : `moved: ${hits.length} hit(s), cited ${want}`;
  else if (!hits.length) { verdict = 'ABSENT'; absent++; }
  else if (!want) verdict = 'present';
  else verdict = hits.some((n) => n >= want[0] && n <= want[1]) ? 'matched' : `moved → ${hits.join(', ')}`;
  const at = hits.length ? `\`${file}:${hits.slice(0, 4).join(',')}\`` : `\`${file}\` — 0 lines`;
  console.log(`| ${i + 1} | ${src} | ${cite.replace(/\|/g, '/')} | ${at} | ${verdict} |`);
});
console.log(absent ? `BAD — ${absent} input(s) ABSENT at HEAD` : `GOOD — every input located (${INPUTS.length})`);
process.exit(absent ? 1 : 0);
