// kimi-window-mutants.mjs — mutants of the Kimi branch of framework/hooks/context-window.mjs (plans/143 KA3; decision №164, D1).
//   node tools/sandbox/probes/kimi-window-mutants.mjs
// Each mutant is a copy of the hook in a temp folder with ONE change; its selftest must go red on exactly the cases named here, before the run:
//   K1 «the steps count against the whole window again» (win = full)       → closure/compaction and escalation cases
//   K3 «a pending step is not said on the next prompt»                       → «after a compaction … next prompt»
//   K4 «the closing demand is one-time again»                                → closure latch · new owner prompt · force escalation
//   K5 «a new owner prompt does not re-arm the closure»                      → «a new owner prompt re-arms»
//   K6 «soft satisfies force again»                                          → soft-to-force escalation only
//   K7 «force entry opens ordinary work again»                               → post-force contour only
//   K8 «main-wire records again require agentId»                              → old/new main-wire shapes only
//   K9 «rebase recovery is removed»                                           → handover allow cases only
//   K10 «the old prefix predicate returns»                                    → handover and refusal cases
// A mutation that does not apply, or a selftest that dies, is BAD (EXP-0158). Exit 0 — every mutant red on exactly its cases.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = readFileSync(join(ROOT, 'framework', 'hooks', 'context-window.mjs'), 'utf8');
const C1 = 'Kimi closure latch at 85 %', C2 = 'Kimi after a compaction', C3 = 'Kimi Stop at 85 % of the point';
const C4 = 'Kimi closure latch: a new owner prompt re-arms', C5 = 'Kimi closure latch at 92 %';
const C6 = 'Kimi soft-to-force escalation', C7 = 'Kimi post-force contour';
const C8 = 'Kimi main-wire shapes (bugs/153)', C9 = 'post-force Bash handover (bugs/154)', C10 = 'post-force Bash refusals (bugs/154)';
const MUTANTS = [
  ['K1', 'const win = kimiCompactionPoint(full, configText);', 'const win = full;', [C1, C2, C3, C4, C5, C6, C7]],
  ['K3', "if (!d && !demand && st.pending && evn === 'UserPromptSubmit')", 'if (false)', [C2]],
  ['K4', "else if (demand && evn === 'PreToolUse') block = demand;", 'else if (false) {}', [C1, C4, C5, C6]],
  ['K5', "if (evn === 'UserPromptSubmit') delete st.closing;", '', [C4]],
  ['K6', 'const demand = required && !closureSatisfied(required, st.closing)', 'const demand = required && !st.closing', [C6]],
  ['K7', "const forceRestriction = st.closing === 'force' && evn === 'PreToolUse' && !closing && !forceClosureTool(ev);", 'const forceRestriction = false;', [C7]],
  ['K8', "if (r.agentId !== undefined && r.agentId !== 'main') continue;", "if (r.agentId !== 'main') continue;", [C8]],
  ['K9', '|git pull --rebase|node tools\\/commit\\.mjs', '|node tools\\/commit\\.mjs', [C9, C7]],
  ['K10', "const raw = String(input.command || '');\n  if (!raw.trim() || /[\\x00-\\x1F\\x7F;&|`$<>]/.test(raw)) return false;\n  const command = raw.trim();\n  return /^(?:git status(?: --short)?|git diff(?: --cached)?(?: --stat)?|git log(?: --oneline -[1-9]\\d*)?|git (?:add|commit|push)(?: .+)?|git pull --rebase|node tools\\/commit\\.mjs(?: .+)?|date(?: .+)?)$/.test(command);",
    "const command = String(input.command || '').trim();\n  if (!command || /[;&|]/.test(command)) return false;\n  return /^(?:git\\s+(?:status|diff|log|add|commit|push)(?:\\s|$)|node\\s+tools\\/commit\\.mjs(?:\\s|$)|date(?:\\s|$))/.test(command);", [C9, C10, C7]],
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
