// tools/sandbox/probes/nt1-contour-mutants.mjs — a PROBE (not a polygon suite): mutants of step NT1 (2.9, criterion 25 of plans/126,
// origin issue #139 — the owner's own answer on the question page was a one-line field). framework/tools/contour/*.mjs is copied into a
// temporary folder, ONE edit of NT1 is undone in the copy, and the copy's `--selftest` must fail EXACTLY the named cases (EXP-0169).
//   M1 — the own-answer field is a one-line <input> again (the 2.8 markup) → «NT1 #139».
//   M2 — the write-back puts a multi-line answer on the label line as one piece again → «NT1 #139» and «NT F1».
//   M3 — (light judge of NT, F1) the writer no longer escapes a continuation line that reads as structure → «NT F1».
//   M4 — (the same) the reader no longer takes the escape off → «NT F1».
// Silence: the selftest opens no window and plays no sound; the environment is quiet anyway (no voice tool).
// usage: node tools/sandbox/probes/nt1-contour-mutants.mjs   ·   ≈ 30 s, alone
// [TESTED: 2026-10-16 15:27:32 +03:00 · «2 mutants red exactly on their addressee» (quietEnv); first run 15:26:53 with a hand-made quiet env
//  gave the same — report testcases/reports/2026-10-16_nt-four-field-tickets.md; M2 moved to the new write line and M3 · M4 added for
//  the NT light judge's F1: 2026-10-16 16:09:13 +03:00 · «4 mutants red exactly on their addressees»]
import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(REPO, 'framework', 'tools', 'contour');
const MUTANTS = [
  { id: 'M1', file: 'review.mjs',
    from: `'<p><textarea data-draft name="text:' + esc(q.doc) + ':' + q.id + '" rows="2" placeholder="' + esc(t.ph.own) + '"></textarea></p>'`,
    to: `'<p><input type="text" data-draft name="text:' + esc(q.doc) + ':' + q.id + '" placeholder="' + esc(t.ph.own) + '"></p>'`,
    addressees: ['NT1 #139'] },
  { id: 'M2', file: 'core.mjs',
    from: 'const [first, ...rest] = marked(answerText);',
    to: "const first = answerText + ' ' + prov, rest = [];", addressees: ['NT1 #139', 'NT F1'] },
  { id: 'M3', file: 'core.mjs',
    from: "const escapeStructure = (l) => (readsAsStructure(l) ? l.replace(/^\\s*/, (indent) => indent + '\\\\') : l);",
    to: 'const escapeStructure = (l) => l;', addressees: ['NT F1'] },
  { id: 'M4', file: 'core.mjs',
    from: 'const nl = noComment(unescapeStructure(raw));', to: 'const nl = noComment(raw);', addressees: ['NT F1'] },
];
const quiet = quietEnv();   // the contour generator in a probe runs only in the quiet environment (bugs/116)
let bad = 0;
for (const m of MUTANTS) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-nt1-mutant-'));
  for (const f of readdirSync(SRC)) cpSync(join(SRC, f), join(dir, f), { recursive: true });
  const p = join(dir, m.file), t = readFileSync(p, 'utf8');
  if (t.split(m.from).length !== 2) { bad++; console.log(`BAD ${m.id}: the mutation does not apply once in ${m.file}`); rmSync(dir, { recursive: true, force: true }); continue; }
  writeFileSync(p, t.replace(m.from, () => m.to));
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { encoding: 'utf8', env: quiet, timeout: 300000 });
  const out = String(r.stdout || '') + String(r.stderr || '');
  const red = out.split(/\r?\n/).filter((l) => /^\s+x /.test(l));
  const ok = red.length === m.addressees.length && m.addressees.every((a) => red.some((l) => l.includes(a)));
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'BAD'} ${m.id}: ${red.length} red${ok ? ' — exactly its addressees (' + m.addressees.join(', ') + ')' : ': ' + red.map((l) => l.trim().slice(0, 110)).join(' | ') || ' (selftest ' + (r.error ? 'died' : 'exit ' + r.status) + ')'}`);
  rmSync(dir, { recursive: true, force: true });
}
console.log(bad ? `${bad} BAD` : `${MUTANTS.length} mutants red exactly on their addressees`);
process.exit(bad ? 1 : 0);
