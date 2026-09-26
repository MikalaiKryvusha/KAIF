#!/usr/bin/env node
// tools/sandbox/probes/old-core-own-scan.mjs — a PROBE (not a polygon suite): template lines of THIS build that the PREVIOUS release's
// stale-claims scan would name (court RL 2.8, E-F1). On the field route the update task — its stale-claims item included — is written by
// the OUTGOING core (EXP-0157: everything `update` writes has two authors). The 2.7 scan strips only parentheses that open AND close on
// one line; a parenthesized attribution wrapped onto the next line — «(KAIF 2.6; origin issue #52; the» ⏎ «field owner …)» — reads to it as
// a claim, while the 2.8 scan (N4 · K-R4) and the build's guard 5m read it correctly. The 2.7 core has no `stale-claims` command (the scan
// runs inside its `update`), so this probe reproduces the one rule that differs, on the deployed files of this build's bundle, every face:
// a line where the framework word and an older version sit inside a parenthesis that does not close on that line.
// usage: node tools/sandbox/probes/old-core-own-scan.mjs [<target version>]   (default: the version this build ships — the update target)
// exit: 0 — no such line · 1 — N lines (printed with their file and face)
// [TESTED: 2026-09-26 · RED on the build of e609749 — exactly the three lines the court named (AGENT_GUIDE · owner-reviews · report-bug;
//  five before the 2.7 skips were modelled), GREEN after the fix; report testcases/reports/2026-09-26_rl2-field-report-delivery-and-wrapped-attributions.md]
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const vj = JSON.parse(readFileSync(join(REPO, 'version.json'), 'utf8'));
const target = process.argv[2] || `${vj.major}.${vj.minor + 1}`;
const gt = (a, b) => { const [x, y] = a.split('.').map(Number), [p, q] = b.split('.').map(Number); return x > p || (x === p && y > q); };
const bundle = readFileSync(join(REPO, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
const BLOCK_RE = /^> \*\*FILE: `([^`]+)`\*\*[^\n]*\r?\n\r?\n``````\w*\r?\n([\s\S]*?)\r?\n``````\s*$/gm;
const hits = [];
// the 2.7 scan's own skips (v2.7:dist/KAIF-CORE.mjs, SKIP_DIRS and the blockquote rule): directories it never walks, quoted lines
const OLD_SKIP_DIRS = ['.git', 'node_modules', '.kaif', 'researches', 'interviews', 'homeworks', 'bugs', 'ideas', 'reports', '.agents', '.grok', '.cline', '.roo'];
for (const [, path, body] of bundle.matchAll(BLOCK_RE)) {
  if (!/\.md$/i.test(path) || path.split('/').some((s) => OLD_SKIP_DIRS.includes(s))) continue;
  body.split(/\r?\n/).forEach((line, i) => {
    if (line.includes(target) || /^\s*>/.test(line)) return;
    // the part of the line inside a parenthesis that opens here and does not close on this line
    const open = line.replace(/\([^)]*\)/g, '').lastIndexOf('(');
    if (open < 0) return;
    const tail = line.replace(/\([^)]*\)/g, '').slice(open);
    const m = tail.match(/(?:kaif|каиф)[^\n]{0,16}?(?<!\d)(\d+\.\d+)(?!\d|\.\d)/i);
    if (m && gt(target, m[1])) hits.push(`${path}:${i + 1} — ${line.trim().slice(0, 110)}`);
  });
}
for (const h of hits) console.log('  ' + h);
console.log(hits.length
  ? `RED — ${hits.length} template line(s) carry an older KAIF version inside a parenthesis wrapped onto the next line: the ${vj.major}.${vj.minor} scan reads them, the previous release's names them in the update task`
  : 'GREEN — no template line wraps a parenthesis with an older KAIF version');
process.exit(hits.length ? 1 : 0);
