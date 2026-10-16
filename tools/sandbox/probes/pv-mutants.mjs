// tools/sandbox/probes/pv-mutants.mjs — a PROBE (not a polygon suite): mutants of epic PV (2.9) on a COPY of
// framework/tools/kaif-attribution-lint.mjs; the module's own `selftest` must fail EXACTLY the named case (EXP-0169: a red elsewhere,
// a missing red or a mutation that does not apply is BAD).
//   M1 — a path-limited write carries out-of-scope entries verbatim again (the finding of the PV judge: 2.8 text survives) →
//        «PV: a path-limited write drops the 2.8 text of the entries it carries over».
// usage: node tools/sandbox/probes/pv-mutants.mjs   ·   ≈ 2 s
// [TESTED: 2026-10-16 15:11 +03:00 · M1 red exactly on its case (first run from the session scratchpad, then moved here); report
//  testcases/reports/2026-10-16_pv-private-stays-out.md]
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(REPO, 'framework', 'tools', 'kaif-attribution-lint.mjs');
const MUTANTS = [
  { id: 'M1', from: "entries[k] = typeof v === 'number' ? v : LEGACY_VALUE;", to: 'entries[k] = v;',
    addressee: 'PV: a path-limited write drops the 2.8 text of the entries it carries over' },
];
const dir = mkdtempSync(join(tmpdir(), 'kaif-pv-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const t = readFileSync(SRC, 'utf8');
  if (t.split(m.from).length !== 2) { bad++; console.log(`BAD ${m.id}: the mutation does not apply once`); continue; }
  const p = join(dir, `${m.id}.mjs`); writeFileSync(p, t.replace(m.from, () => m.to));
  const r = spawnSync(process.execPath, [p, 'selftest'], { encoding: 'utf8' });
  const failed = (String(r.stdout) + String(r.stderr)).split(/\r?\n/).filter((l) => l.startsWith('❌'));
  const ok = failed.length === 1 && failed[0].includes(m.addressee);
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'BAD'} ${m.id}: ${failed.length} red${ok ? ' — exactly its addressee' : ': ' + failed.map((l) => l.slice(0, 120)).join(' | ')}`);
}
rmSync(dir, { recursive: true, force: true });
console.log(bad ? `${bad} BAD` : `${MUTANTS.length} mutant(s) red exactly on their addressees`);
process.exit(bad ? 1 : 0);
