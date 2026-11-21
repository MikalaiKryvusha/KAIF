// kimi-hook-mutants.mjs — mutants of the Kimi hook dispatcher framework/hooks/kimi-hook.mjs (plans/143 KA2).
//   node tools/sandbox/probes/kimi-hook-mutants.mjs
// Each mutant is a copy of the dispatcher in a temp folder with ONE change; its selftest must go red on exactly the cases named here:
//   D1 «no walk-up to the project marker»            → «from a subfolder», «the stdin cwd decides»
//   D2 «the owner's "hooks": "off" ignored»           → «"hooks": "off" in the project marker»
//   D3 «the process folder instead of the stdin cwd»  → «the stdin cwd decides»
//   D4 «any project's framework/hooks/ is run»        → «a plain project's own framework/hooks/ folder is never run»
//   D5 «the hook's exit code is not passed back»      → «from a subfolder», «the stdin cwd decides», «the KAIF origin»
// A mutation that does not apply, or a selftest that dies, is BAD (EXP-0158). Exit 0 — every mutant red on exactly its cases.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = readFileSync(join(ROOT, 'framework', 'hooks', 'kimi-hook.mjs'), 'utf8');
const SUB = 'from a subfolder', STDIN = 'the stdin cwd decides', OFF = '"hooks": "off" in the project marker',
  PLAIN = "a plain project's own framework/hooks/ folder is never run", ORIGIN = 'the KAIF origin';
const MUTANTS = [
  ['D1', '    dir = parent;\n', '    return null;\n', [SUB, STDIN]],
  ['D2', 'if (!root || optedOut(root)) return 0;', 'if (!root) return 0;', [OFF]],
  ['D3', 'projectRoot(cwdOf(raw) || process.cwd())', 'projectRoot(process.cwd())', [STDIN]],
  ['D4', 'return existsSync(join(root, ORIGIN_SIGN)) && existsSync(source) ? source : null;', 'return existsSync(source) ? source : null;', [PLAIN]],
  ['D5', "return typeof r.status === 'number' ? r.status : 0;", 'return 0;', [SUB, STDIN, ORIGIN]],
];
let bad = 0;
const run = (text) => {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-kimi-hook-mut-'));
  try {
    const f = join(dir, 'kimi-hook.mjs'); writeFileSync(f, text);
    const r = spawnSync(process.execPath, [f, '--selftest'], { encoding: 'utf8', timeout: 120000 });
    // case lines only: «x <case>»; the summary «x N case(s) failed» is not a case
    return { status: r.status, red: (r.stdout || '').split('\n').filter((l) => /^x /.test(l) && !/case\(s\) failed/.test(l)).map((l) => l.trim()) };
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
console.log(bad ? `kimi-hook-mutants: ${bad} BAD` : 'kimi-hook-mutants: every mutant red on exactly its cases');
process.exit(bad ? 1 : 0);
