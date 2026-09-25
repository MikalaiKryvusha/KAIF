// tools/sandbox/probes/ow5-archaeology-mutants.mjs — a PROBE (not a polygon suite): the OW5 selftest cases of the shipped contour (2.8,
// origin issues #74 · #82 — the search for a prior answer in ANY transport), proved on COPIES of framework/tools/contour/ in the OS temp dir
// (never the tree, EXP-0077): the door's own search loses its case-insensitivity (the #74 threat: a capital Cyrillic letter not found) ·
// `N hits · read: none` is accepted again. Each mutant must redden exactly its own case, and only it.
// usage: node tools/sandbox/probes/ow5-archaeology-mutants.mjs
// [TESTED: 2026-09-25 ≈ 19:09 · two mutants red exactly on their named cases; report testcases/reports/2026-09-25_ow5-archaeology-any-transport.md]
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SRC = 'framework/tools/contour';
const M = [
  ['search case-sensitive (the #74 threat)', 'core.mjs', ".join('|'), 'iu');", ".join('|'), 'u');", ['finds a CAPITAL Cyrillic word']],
  ['unread hits accepted', 'core.mjs', "    if (a.hits > 0 && a.readNone) out.problems.push({ id: q.id, kind: 'hits-unread', hits: a.hits, grep });",
    "    if (false) out.problems.push({ id: q.id, kind: 'hits-unread', hits: a.hits, grep });", ['`N hits · read: none` → exit 3']],
  // judge OW10 H3: the search's ready line pasted unfilled passed as «attested» — the placeholder rule, removed, must redden exactly its case
  ['template placeholders accepted (judge OW10 H3)', 'core.mjs', '  if (ARCHAEOLOGY_PLACEHOLDER_RE.test(m[1])) return { present: true, formOk: false, placeholder: true };',
    '  if (false) return { present: true, formOk: false, placeholder: true };', ['pasted UNFILLED']],
];
let bad = 0;
for (const [name, file, from, to, exp] of M) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-ow5-mut-'));
  cpSync(SRC, dir, { recursive: true });
  const f = join(dir, file);
  const s = readFileSync(f, 'utf8');
  if (s.split(from).length !== 2) { console.log(`BAD ${name}: anchor did not apply`); bad++; rmSync(dir, { recursive: true, force: true }); continue; }
  writeFileSync(f, s.replace(from, () => to));
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { encoding: 'utf8', cwd: dir });
  const out = (r.stdout || '') + (r.stderr || '');
  const red = out.split(/\r?\n/).filter((l) => /^\s*x /.test(l));
  const died = !/SELFTEST RED: \d+ of \d+/.test(out);    // EXP-0158: a mutant that kills the run proves nothing
  const good = !died && r.status !== 0 && red.length === exp.length && exp.every((a) => red.some((l) => l.includes(a)));
  if (!good) bad++;
  console.log(`${good ? 'OK ' : 'BAD'} ${name} — exit ${r.status}, red lines: ${red.length}${died ? ' · DIED (no SELFTEST line)' : ''}`);
  for (const l of red) console.log('    ' + l.trim().slice(0, 150));
  rmSync(dir, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : `✅ ${M.length} mutants red exactly on their named cases, and only on them`);
process.exit(bad ? 1 : 0);
