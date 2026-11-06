// MM3 (2.10), origin #160 — mutant proofs of the knowledge hook on COPIES (EXP-0077): each mutant must turn exactly its own selftest case
// red; the control copy stays green. (1) «agent-message not excluded» — a subagent's hand-back read as the owner (live finding of session
// 97); (2) «a subagent's call judged» — the guard of the judge of session 97 removed. Run: node tools/sandbox/probes/mm3-knowledge-mutant.mjs
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HOOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'framework', 'hooks', 'knowledge-moment.mjs');
const MUTANTS = [
  ['agent-message not excluded', '|system-reminder|agent-message)', '|system-reminder)', /a subagent hand-back/],
  ['a subagent\'s call judged', "catch { /* torn line */ }\n  }\n  return false;", "catch { /* torn line */ }\n  }\n  return true;", /a subagent's tool call/],
];
const run = (mut) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-mm3m-'));
  try {
    const f = join(d, 'hook.mjs'); copyFileSync(HOOK, f);
    if (mut) { const t = readFileSync(f, 'utf8'); if (!t.includes(mut[1])) return { err: 'mutation anchor not found' }; writeFileSync(f, t.split(mut[1]).join(mut[2])); }
    const r = spawnSync(process.execPath, [f, '--selftest'], { encoding: 'utf8', timeout: 60000 });
    return { status: r.status, xs: (r.stdout || '').split('\n').filter((l) => l.startsWith('  x ')) };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
let ok = true;
const c = run(null); console.log('control: exit ' + c.status + ', red ' + c.xs.length); if (c.status !== 0 || c.xs.length) ok = false;
for (const m of MUTANTS) {
  const r = run(m);
  const good = !r.err && r.status !== 0 && r.xs.length === 1 && m[3].test(r.xs[0]);
  console.log((good ? 'OK  ' : 'BAD ') + m[0] + ': exit ' + r.status + ', red ' + (r.xs || []).length + (r.err ? ' · ' + r.err : '') + (r.xs && r.xs[0] ? ' · ' + r.xs[0].slice(4, 90) : ''));
  if (!good) ok = false;
}
console.log(ok ? '✅ each mutant red on exactly its case' : '❌ mutant proof failed');
process.exit(ok ? 0 : 1);
