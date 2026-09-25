// tools/sandbox/probes/ow4-call-mutants.mjs — a PROBE (not a polygon suite): the OW4 selftest cases of the shipped contour (2.8, origin
// issues #95 · #98 — the call names the calling session), proved on COPIES of framework/tools/contour/ in the OS temp dir (never the
// tree, EXP-0077). Each mutant must redden exactly its own case, and only it.   usage: node tools/sandbox/probes/ow4-call-mutants.mjs
// [TESTED: 2026-09-25 20:20:21, again 20:26:49 on the final selftest · three mutants red exactly on their named cases; report testcases/reports/2026-09-25_ow4-call-names-session.md]
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SRC = 'framework/tools/contour';
const M = [
  ['the name removed from the call (the #98 threat)', 'review.mjs', '  if (!cfg.session) return phrase;', '  return phrase;', ['call phrase: «<owner>, this is dev two']],
  ['the workspace not read (a linked workspace unnamed)', 'core.mjs', '  if (st.isFile()) {', '  if (false) {', ['session name: a linked workspace']],
  ['the window title without the session', 'review.mjs', "(cfg.session ? ' · ' + esc(cfg.session) : '') + '</title>'", "'</title>'", ['page window title']],
];
let bad = 0;
for (const [name, file, from, to, exp] of M) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-ow4-mut-'));
  cpSync(SRC, dir, { recursive: true });
  const f = join(dir, file);
  const s = readFileSync(f, 'utf8');
  if (s.split(from).length !== 2) { console.log(`BAD ${name}: anchor did not apply (${s.split(from).length - 1}x)`); bad++; rmSync(dir, { recursive: true, force: true }); continue; }
  writeFileSync(f, s.replace(from, () => to));
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { encoding: 'utf8', cwd: dir, timeout: 180000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const red = out.split(/\r?\n/).filter((l) => /^\s*x /.test(l));
  const died = !/SELFTEST RED: \d+ of \d+|contour selftest green/.test(out);   // EXP-0158: a mutant that kills the run proves nothing
  const good = !died && r.status !== 0 && red.length === exp.length && exp.every((a) => red.some((l) => l.includes(a)));
  if (!good) bad++;
  console.log(`${good ? 'OK ' : 'BAD'} ${name} — exit ${r.status}, red lines: ${red.length}${died ? ' · DIED (no summary line)' : ''}`);
  for (const l of red) console.log('    ' + l.trim().slice(0, 150));
  rmSync(dir, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : `✅ ${M.length} mutants red exactly on their named cases, and only on them`);
process.exit(bad ? 1 : 0);
