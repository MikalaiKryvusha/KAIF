// kimi-stop-mutants.mjs — mutation proof for framework/hooks/kimi-stop.mjs on COPIES (bugs/156).
// Each mutant must redden exactly the selftest cases named before the run; a mutation that does not apply or crashes is BAD.
//   M1 stop at the first block       — the old loss shape: later producers and observation are skipped
//   M2 deliver only the first reason  — all producers run, but testing/window orders are lost
//   M3 skip observation-only farewell — a blocking producer must not suppress a non-blocking handler
//   M4 reverse producer order         — aggregation and side effects lose deterministic config order
//   M5 swallow the aggregate exit 2   — reasons on stderr without Kimi's block contract
// [NOT-TESTED]
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const HOOKS = join(ROOT, 'framework', 'hooks');
const SRC = readFileSync(join(HOOKS, 'kimi-stop.mjs'), 'utf8');
const ALL = 'all exit-2 reasons aggregate', ONCE = 'every handler runs once', REPLAY = 'a replay whose one-shot blocks are spent';
const MUTANTS = [
  ['M1 stop at the first block', 'if (reason) reasons.push(reason);', 'if (reason) { reasons.push(reason); break; }', [ALL, ONCE, REPLAY]],
  ['M2 deliver only the first reason', "reasons.join('\\n\\n') + '\\n'", "reasons.slice(0, 1).join('\\n\\n') + '\\n'", [ALL]],
  ['M3 skip observation-only farewell', "    const script = scriptOf(root, name);", "    if (name === 'stop-farewell-capture.mjs') continue;\n    const script = scriptOf(root, name);", [ONCE, REPLAY]],
  ['M4 reverse producer order', "export const STOP_HANDLERS = ['stop-status-guard.mjs', 'stop-farewell-capture.mjs', 'test-after-code.mjs', 'context-window.mjs'];",
    "export const STOP_HANDLERS = ['context-window.mjs', 'test-after-code.mjs', 'stop-farewell-capture.mjs', 'stop-status-guard.mjs'];", [ALL, ONCE]],
  ['M5 swallow the aggregate exit 2', 'code: reasons.length ? 2 : 0', 'code: 0', [ALL]],
];
let bad = 0;
const run = (text) => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-kimi-stop-mut-'));
  try {
    writeFileSync(join(dir, 'kimi-stop.mjs'), text);
    writeFileSync(join(dir, 'kimi-hook.mjs'), readFileSync(join(HOOKS, 'kimi-hook.mjs'), 'utf8'));
    const r = spawnSync(process.execPath, [join(dir, 'kimi-stop.mjs'), '--selftest'], { encoding: 'utf8', timeout: 120000 });
    return { status: r.status, red: (r.stdout || '').split('\n').filter((l) => /^x /.test(l) && !/case\(s\) failed/.test(l)).map((l) => l.trim()) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
};
const control = run(SRC);
if (control.status !== 0 || control.red.length) { console.log(`BAD control: status ${control.status}, red ${JSON.stringify(control.red)}`); bad++; }
else console.log('OK  control: 0 red');
for (const [id, from, to, want] of MUTANTS) {
  if (!SRC.includes(from)) { console.log(`BAD ${id}: the mutation does not apply`); bad++; continue; }
  const r = run(SRC.replace(from, to));
  const hit = want.every((w) => r.red.some((l) => l.includes(w)));
  const extra = r.red.filter((l) => !want.some((w) => l.includes(w)));
  const good = r.status === 1 && hit && !extra.length;
  console.log(`${good ? 'OK ' : 'BAD'} ${id}: red ${r.red.length} (want ${want.length})${good ? '' : ` — ${JSON.stringify(r.red).slice(0, 500)}`}`);
  if (!good) bad++;
}
console.log(bad ? `kimi-stop-mutants: ${bad} BAD` : 'kimi-stop-mutants: every mutant red on exactly its cases');
process.exit(bad ? 1 : 0);
