// TK10 (b), origin #187 — mutant proof on a COPY (EXP-0077): each mutant breaks ONE part of the picture rule in inline() of the contour's
// core.mjs, and the selftest must turn red exactly on the cases named for it BEFORE the run; the control copy stays green.
//   M1 «picture as text»           — the picture rule removed            → «#187 image»
//   M2 «picture inside a code span» — the code-span branch of the picture rule removed → «#187 image in a code span stays text»
//   M3 «link inside a code span»    — the code-span branch of the link rule removed    → «#187 image in a code span stays text»
//     (the case quotes «![cap](assets/pic.png)» in backticks: without the branch its «[cap](…)» half becomes a link)
// A mutation whose text is not found, or a selftest that dies without its case lines, prints DIED and fails the proof — a dead
// mutant proves nothing (EXP-0158; judge of epics MM · TK10, session 97: this probe died silently after 8992c43 rewrote the rule).
// Quiet environment: no window, no sound. Run: node tools/sandbox/probes/tk10b-image-mutant.mjs   (≈ 1 min, alone)
// [TESTED: ≈ 2026-11-06 15:12 · control 0 red, M1 · M2 · M3 — one red each, on its addressee; report testcases/reports/2026-11-06_s98-judge-debt-mm-tk10.md]
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(REPO, 'framework', 'tools', 'contour');
const PIC_RULE = '(code ? code : imageHtml(alt, p))';   // the picture rule since the code-span fix (8992c43)
const MUTANTS = [
  { id: 'M1', name: 'picture as text', from: PIC_RULE, drop: true, addressees: ['#187 image:'] },
  // M2/M3: the code-span branch keeps matching the span, but now renders the picture / link INSIDE it — the behaviour before the fix
  { id: 'M2', name: 'picture inside a code span', from: PIC_RULE,
    to: '(code ? code.replace(/!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)/g, (_, a, q) => imageHtml(a, q)) : imageHtml(alt, p))',
    addressees: ['#187 image in a code span stays text'] },
  { id: 'M3', name: 'link inside a code span', from: "(code ? code : '<a href=\"' + href",
    to: "(code ? code.replace(/\\[([^\\]]+)\\]\\(([^)\\s]+)\\)/g, '<a href=\"$2\">$1</a>') : '<a href=\"' + href",
    addressees: ['#187 image in a code span stays text'] },
];
const run = (mut) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-tk10b-'));
  try {
    cpSync(SRC, join(d, 'contour'), { recursive: true });
    if (mut) {
      const f = join(d, 'contour', 'core.mjs'); let t = readFileSync(f, 'utf8');
      for (const [a, b] of [...(mut.pre ? [mut.pre] : []), ...(mut.drop ? [] : [[mut.from, mut.to]])]) {
        if (!t.includes(a)) return { err: 'mutation text not found: ' + a.slice(0, 60) };
        t = t.split(a).join(b);
      }
      if (mut.drop) { if (!t.includes(mut.from)) return { err: 'rule not found' }; t = t.split('\n').filter((l) => !l.includes(mut.from)).join('\n'); }
      writeFileSync(f, t);
    }
    const r = spawnSync(process.execPath, [join(d, 'contour', 'review.mjs'), '--selftest'], { env: quietEnv(), encoding: 'utf8', timeout: 200000 });
    const out = r.stdout || '';
    const xs = out.split('\n').filter((l) => l.startsWith('  x '));
    // the selftest got as far as the #187 cases at all — else a red count of 0 or 1 says nothing
    const reached = /#187 missing image warns/.test(out);
    return { status: r.status, xs, reached };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(null);
let good = c.status === 0 && c.xs.length === 0 && c.reached;
console.log(`${good ? 'OK  ' : 'BAD '}control: exit ${c.status}, red ${c.xs.length}${c.reached ? '' : ' · the #187 cases were not reached'}`);
for (const mut of MUTANTS) {
  const m = run(mut);
  if (m.err || !m.reached) { good = false; console.log(`DIED ${mut.id} «${mut.name}»: ${m.err || 'the selftest did not reach the #187 cases (exit ' + m.status + ')'} — this mutant proves nothing`); continue; }
  const hit = (a) => m.xs.some((x) => x.includes(a));
  const ok = m.status !== 0 && mut.addressees.every(hit) && m.xs.every((x) => mut.addressees.some((a) => x.includes(a)));
  if (!ok) good = false;
  console.log(`${ok ? 'OK  ' : 'BAD '}${mut.id} «${mut.name}»: exit ${m.status}, red ${m.xs.length} · addressees ${mut.addressees.join(' · ')}`);
  for (const x of m.xs) console.log('     ' + x.slice(0, 160));
}
console.log(good ? '✅ every mutant is red exactly on its named cases' : '❌ mutant proof failed');
process.exit(good ? 0 : 1);
