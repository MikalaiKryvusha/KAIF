// tools/sandbox/probes/sc0-inputs.mjs — a PROBE (not a polygon suite): step SC0 of plans/123 (2.8, epic SC) — every input the epic builds
// on, re-located at HEAD by SIGNATURE (the method of up0-inputs / ch0-inputs). The recon (researches/32 §2б and the Q-R1′ · K-R4 rows)
// cited line addresses at 6af0dad; a signature survives edits. Mode `count` re-proves a claimed number of hits.
// usage: node tools/sandbox/probes/sc0-inputs.mjs          (read-only; prints a markdown table; exit 1 when an input is ABSENT)
// [TESTED: 2026-09-26 01:26:14 +03:00 · 17 inputs located at HEAD 4e67be5 (4 matched · 9 moved · 3 present · 1 count moved — the one
//  build hit is a 2.5 note text, not a guard); ABSENT proved on a spoiled copy (01:27:07, exit 1; the copy removed);
//  report testcases/reports/2026-09-26_sc0-inputs.md]
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const K = 'framework/installer/KAIF-CORE.mjs';
const T = (n) => `framework/tools/${n}.mjs`;

// [ticket/finding, citation (at 6af0dad), file, signature, cited line range | expected count | null, mode]
const INPUTS = [
  ['#77', 'KAIF-CORE.mjs:1020 — the stale-claims walk swallows every error: `try { walk(\'.\'); } catch {}`', K, /try \{ walk\('\.'\); \} catch \{ \/\* best-effort scan \*\/ \}/, [1020, 1020]],
  ['#77', 'KAIF-CORE.mjs:931–933 — a hand list of skipped directories, no nested copies', K, /const SKIP_DIRS = \['\.git', 'node_modules', '\.kaif', 'researches'/, [931, 933]],
  ['#77', 'KAIF-CORE.mjs — `.claude/worktrees` is skipped nowhere', K, /worktrees/, 0, 'count'],
  ['#77', 'KAIF-CORE.mjs — `git ls-files` is never called', K, /ls-files/, 0, 'count'],
  ['#77', 'KAIF-CORE.mjs:969 — SKIP_FILES compared by the full path (a copy of a journal passes)', K, /if \(SKIP_DIRS\.includes\(n\) \|\| SKIP_FILES\.includes\(p\)\) continue;/, [969, 969]],
  ['Q-R1′', 'KAIF-CORE.mjs:2226 — the anonymity scan walks with a bare statSync', K, /if \(\['\.git', 'node_modules'\]\.includes\(n\) \|\| TRANSIENT\.some/, [2226, 2226]],
  ['Q-R1′', 'kaif-provenance — a bare statSync in walkMd (a broken link = a stack trace, exit 1)', T('kaif-provenance'), /if \(statSync\(p\)\.isDirectory\(\)\) \{ yield\* walkMd\(p\); continue; \}/, null],
  ['Q-R1′', 'kaif-canon-lint:60 — the same bare statSync', T('kaif-canon-lint'), /if \(statSync\(p\)\.isDirectory\(\)\) \{ yield\* walkMd\(p\); continue; \}/, [60, 60]],
  ['Q-R1′', 'kaif-requirements-lint:116 — the same bare statSync', T('kaif-requirements-lint'), /if \(statSync\(p\)\.isDirectory\(\)\) \{ yield\* walkMd\(p\); continue; \}/, [116, 116]],
  ['Q-R1′', 'kaif-attribution-lint:190 — the same bare statSync', T('kaif-attribution-lint'), /if \(statSync\(p\)\.isDirectory\(\)\) \{ yield\* walkMd\(p, root\); continue; \}/, [190, 190]],
  ['Q-R1′', 'kaif-guard-lint:103 — the one protected walk (skips a broken link SILENTLY — no counter)', T('kaif-guard-lint'), /let st; try \{ st = statSync\(p\); \} catch \{ continue; \}/, [103, 103]],
  ['(new)', 'kaif-scenario-lint — a sixth walker, not in the recon list (bare statSync)', T('kaif-scenario-lint'), /const st = statSync\(p\);/, null],
  ['#75', 'KAIF-CORE.mjs:1002 — any dated line is skipped (the deployment record lied four intervals)', K, /if \(\/\\b\\d\{4\}-\\d\{2\}\/\.test\(line\)\) continue;/, [1002, 1002]],
  ['#91', 'KAIF-CORE.mjs:960 — one 16-char adjacency window for prose AND code', K, /\[\^\\\\n\]\{0,16\}/, [960, 960]],
  ['N4 · K-R4', 'KAIF-CORE.mjs:1010 — parentheses stripped line by line (a bracket wrapped onto the next line survives)', K, /scan\.replace\(\/\(\?<!\\\]\)\\\(\[\^\)\]\*\\\)\/g, ''\)/, [1010, 1011]],
  ['K-R4', 'KAIF-CORE.mjs — KAIF-VERSION-OK only on the line or right above it', K, /KAIF-VERSION-OK\/i\.test\(lines\[i - 1\]\)/, null],
  ['K-R4', 'build-framework.mjs — no guard scans the shipped templates with the next version', 'tools/build-framework.mjs', /scanStaleClaims|stale-claims.*template/i, 0, 'count'],
];

const linesOf = (f) => readFileSync(join(REPO, f), 'utf8').split(/\r?\n/);
let absent = 0;
console.log('| # | source | input (as the recon cites it) | at HEAD | verdict |');
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
console.log(absent ? `BAD — ${absent} input(s) ABSENT at HEAD` : `GOOD — every input located (${INPUTS.length})`);
process.exit(absent ? 1 : 0);
