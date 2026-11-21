// kimi-window-mutants.mjs — mutants of the Kimi branch of framework/hooks/context-window.mjs (plans/143 KA3; decision №164, D1).
//   node tools/sandbox/probes/kimi-window-mutants.mjs
// Each mutant is a copy of the hook in a temp folder with ONE change; its selftest must go red on exactly the cases named here, before the run:
//   K1 «the steps count against the whole window again» (win = full)       → the three Kimi turn cases: «85 % … PreToolUse block»,
//                                                                            «after a compaction … next prompt», «Kimi Stop at 85 % of the point»
//   K2 «no delivery by a one-time PreToolUse block»                          → «85 % … PreToolUse block»
//   K3 «a pending step is not said on the next prompt»                       → «after a compaction … next prompt»
// A mutation that does not apply, or a selftest that dies, is BAD (EXP-0158). Exit 0 — every mutant red on exactly its cases.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = readFileSync(join(ROOT, 'framework', 'hooks', 'context-window.mjs'), 'utf8');
const C1 = "85 % of Kimi's own compaction point waits after PostToolUse", C2 = 'Kimi after a compaction', C3 = 'Kimi Stop at 85 % of the point';
const MUTANTS = [
  ['K1', 'const win = kimiCompactionPoint(full, configText);', 'const win = full;', [C1, C2, C3]],
  ['K2', "if (!d && st.pending && evn === 'PreToolUse')", 'if (false)', [C1]],
  ['K3', "if (!d && st.pending && evn === 'UserPromptSubmit')", 'if (false)', [C2]],
];
let bad = 0;
const run = (text) => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-kimi-mut-'));
  try {
    const f = join(dir, 'context-window.mjs'); writeFileSync(f, text);
    const r = spawnSync(process.execPath, [f, '--selftest'], { encoding: 'utf8', timeout: 120000 });
    return { status: r.status, red: (r.stdout || '').split('\n').filter((l) => /^\s*x /.test(l)).map((l) => l.trim()) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
};
const control = run(SRC);
if (control.status !== 0 || control.red.length) { console.log(`BAD control: status ${control.status}, red ${JSON.stringify(control.red)}`); bad++; }
else console.log('OK  control: 0 red');
for (const [id, from, to, want] of MUTANTS) {
  if (!SRC.includes(from)) { console.log(`BAD ${id}: the mutation does not apply`); bad++; continue; }
  const r = run(SRC.replace(from, to));
  const hit = want.every((w) => r.red.some((l) => l.includes(w))), extra = r.red.filter((l) => !want.some((w) => l.includes(w)));
  const okk = r.status === 1 && hit && !extra.length;
  console.log(`${okk ? 'OK ' : 'BAD'} ${id}: red ${r.red.length} (want ${want.length})${okk ? '' : ` — ${JSON.stringify(r.red).slice(0, 400)}`}`);
  if (!okk) bad++;
}
console.log(bad ? `kimi-window-mutants: ${bad} BAD` : 'kimi-window-mutants: every mutant red on exactly its cases');
process.exit(bad ? 1 : 0);
