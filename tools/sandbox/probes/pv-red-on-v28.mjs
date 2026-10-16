// tools/sandbox/probes/pv-red-on-v28.mjs — a PROBE (not a polygon suite): the four cases of epic PV (2.9, criterion 19 of plans/126 —
// the authorship linter keeps the private out of the shared commit) run at the COMMAND LINE in a temporary git repository, once with
// the module of the tag v2.8 and once with this build's framework/tools/kaif-attribution-lint.mjs. Prediction, written before the
// first run: v2.8 — 4 red (the ignored root file is read and its key lands in the baseline · the baseline carries the text · a write
// limited to plans/ erases the debt of ideas/ · a third identical line exits 0); this build — 0 red.
// usage: node tools/sandbox/probes/pv-red-on-v28.mjs [--keep]   ·   ≈ 5 s
// [TESTED: 2026-10-16 14:47:38 +03:00 · «the four PV cases are red on v2.8 and green on this build» — v2.8 4 red, this build 0; report
//  testcases/reports/2026-10-16_pv-private-stays-out.md]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-pv-red-'));
const old = spawnSync('git', ['show', 'v2.8:framework/tools/kaif-attribution-lint.mjs'], { cwd: REPO, encoding: 'utf8' });
if (old.status !== 0) { console.log('BAD: the v2.8 module is not readable from the tag'); process.exit(1); }
const OLD = join(ROOT, 'v28-attribution-lint.mjs'); writeFileSync(OLD, old.stdout);
const NEW = join(REPO, 'framework', 'tools', 'kaif-attribution-lint.mjs');
const BL = 'base.json';

function tree(name) {
  const d = join(ROOT, name); mkdirSync(join(d, 'plans'), { recursive: true }); mkdirSync(join(d, 'ideas'), { recursive: true });
  spawnSync('git', ['init', '-q'], { cwd: d });
  writeFileSync(join(d, '.gitignore'), 'NOTES.md\n' + BL + '\n');
  writeFileSync(join(d, 'NOTES.md'), '# Notes\n\nThe owner decided to keep the recipe of his grandmother here.\n');
  writeFileSync(join(d, 'plans', '01.md'), '# P\n\nThe owner decided to drop it.\n\n\n\n\nThe owner decided to drop it.\n');
  writeFileSync(join(d, 'ideas', '02.md'), '# I\n\nThe owner decided to keep it.\n');
  return d;
}
const run = (mod, d, args) => spawnSync(process.execPath, [mod, 'check', ...args, '--baseline', BL], { cwd: d, encoding: 'utf8' });
function cases(mod, label) {
  const d = tree(label);
  const red = [];
  run(mod, d, ['--write-baseline']);
  const base = readFileSync(join(d, BL), 'utf8');
  if (/NOTES\.md/.test(base)) red.push('(1) the ignored root file was read — its key is in the baseline');
  if (/decided|recipe|drop it|keep it/.test(base)) red.push('(2) the baseline carries the text of a finding');
  run(mod, d, ['plans', '--write-baseline']);
  if (!/ideas\/02\.md/.test(readFileSync(join(d, BL), 'utf8'))) red.push('(3) a write limited to plans/ erased the debt of ideas/');
  writeFileSync(join(d, 'plans', '01.md'), readFileSync(join(d, 'plans', '01.md'), 'utf8') + '\n\n\n\n\nThe owner decided to drop it.\n');
  const r = run(mod, d, ['plans']);
  if (r.status === 0) red.push('(4) a third identical line beside two recorded exited 0 — swallowed as debt');
  return red;
}
const r28 = cases(OLD, 'v28'), rNew = cases(NEW, 'this');
console.log(`v2.8: ${r28.length} red`); for (const l of r28) console.log('   ' + l);
console.log(`this build: ${rNew.length} red`); for (const l of rNew) console.log('   ' + l);
const ok = r28.length === 4 && rNew.length === 0;
if (process.argv.includes('--keep') || !ok) console.log(`kept: ${ROOT}`); else rmSync(ROOT, { recursive: true, force: true });
console.log(ok ? 'the four PV cases are red on v2.8 and green on this build' : 'BAD — the prediction (v2.8 4 red · this build 0) did not hold');
process.exit(ok ? 0 : 1);
