// TK10 (a), origin #191 — mutant proof on a COPY (EXP-0077): each mutant breaks ONE part of «the owner's name once» in callDoor() of the
// contour's review.mjs, and the selftest must turn red exactly on the cases named for it BEFORE the run; the control copy stays green.
//   M1 «prefix always»        — the leading name is never dropped («Jane, Jane, …» of the field)  → «#191 name once» · «#191 owner's own name once»
//   M2 «callName only»        — the owner's own first name is not an address («Kit, Mark, …» — judge of session 97, finding 7)
//                                                                                                   → «#191 owner's own name once»
// A mutation whose text is not found, or a selftest that dies before the #191 cases, prints DIED and fails the proof (EXP-0158).
// Quiet environment: no window, no sound. Run: node tools/sandbox/probes/tk10a-name-mutant.mjs   (≈ 2 min, alone)
// [TESTED: ≈ 2026-11-06 15:38 · on the invented-name fixture («Kit», «Mark Lee»): control 0 red, M1 — both addressees, M2 — its one
//  (the first run, ≈ 15:17, was on a fixture with the author's real names — replaced, see EXP-0200); report testcases/reports/2026-11-06_s98-judge-debt-mm-tk10.md]
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(REPO, 'framework', 'tools', 'contour');
const ONCE = '#191 name once', OWN = "#191 owner's own name once";
const MUTANTS = [
  { id: 'M1', name: 'prefix always', from: "(lead ? body.replace(lead, '') : body)", to: 'body', addressees: [ONCE, OWN] },
  { id: 'M2', name: 'callName only', from: '[cfg.callName, shortName(cfg.ownerName)]', to: '[cfg.callName]', addressees: [OWN] },
];
const run = (mut) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-tk10a-'));
  try {
    cpSync(SRC, join(d, 'contour'), { recursive: true });
    if (mut) {
      const f = join(d, 'contour', 'review.mjs'), t = readFileSync(f, 'utf8');
      if (!t.includes(mut.from)) return { err: 'mutation text not found: ' + mut.from };
      writeFileSync(f, t.split(mut.from).join(mut.to));
    }
    const r = spawnSync(process.execPath, [join(d, 'contour', 'review.mjs'), '--selftest'], { env: quietEnv(), encoding: 'utf8', timeout: 200000 });
    const out = r.stdout || '';
    return { status: r.status, xs: out.split('\n').filter((l) => l.startsWith('  x ')), reached: out.includes(OWN) };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(null);
let good = c.status === 0 && c.xs.length === 0 && c.reached;
console.log(`${good ? 'OK  ' : 'BAD '}control: exit ${c.status}, red ${c.xs.length}${c.reached ? '' : ' · the #191 cases were not reached'}`);
for (const x of c.xs) console.log('     ' + x.slice(0, 160));
for (const mut of MUTANTS) {
  const m = run(mut);
  if (m.err || !m.reached) { good = false; console.log(`DIED ${mut.id} «${mut.name}»: ${m.err || 'the selftest did not reach the #191 cases (exit ' + m.status + ')'} — this mutant proves nothing`); continue; }
  const ok = m.status !== 0 && mut.addressees.every((a) => m.xs.some((x) => x.includes(a))) && m.xs.every((x) => mut.addressees.some((a) => x.includes(a)));
  if (!ok) good = false;
  console.log(`${ok ? 'OK  ' : 'BAD '}${mut.id} «${mut.name}»: exit ${m.status}, red ${m.xs.length} · addressees ${mut.addressees.join(' · ')}`);
  for (const x of m.xs) console.log('     ' + x.slice(0, 160));
}
console.log(good ? '✅ every mutant is red exactly on its named cases' : '❌ mutant proof failed');
process.exit(good ? 0 : 1);
