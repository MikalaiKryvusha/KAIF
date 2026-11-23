// bugs146-kimi-path-red.mjs — Kimi's Write / Edit name the file `path` (relative to the session folder), not Claude's `file_path`
// (bugs/146; live wire of 2026-11-21: {"path":"src/app.mjs","content":…}). Named BEFORE the run:
//   A · test-after-code of this tree, a Kimi PostToolUse Write {path: src/app.mjs}         — a debt for src/app.mjs
//   B · the same hook of <rev> (default HEAD before the fix: 8ef671e)                        — no debt (the blind spot)
//   C · clock-now of this tree, a Kimi PreToolUse Write {path: notes.md}, a placeholder only in a code span — exit 0 (markdown seen)
//   D · clock-now of <rev>, the same write — exit 2 (the path unread: markdown taken for code) · E — a plain placeholder: both exit 2
//   F · bugs/156 replacement contract: the fragment has exactly one Stop entry, the sequential kimi-stop.mjs multiplexer.
// Each hook runs as Kimi runs it (`--kimi`, the event on stdin, cwd a temp KAIF project). Exit 0 — all as named, 1 — any difference.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const rev = process.argv[2] || '8ef671e';
const P = mkdtempSync(join(tmpdir(), 'kaif-b146-'));
let bad = 0;
const check = (c, what, got) => { console.log(`${c ? 'OK ' : 'BAD'} ${what}${c ? '' : ` — got ${JSON.stringify(got).slice(0, 300)}`}`); if (!c) bad++; };
try {
  mkdirSync(join(P, '.kaif'), { recursive: true }); writeFileSync(join(P, '.kaif', 'kaif.json'), '{}');
  const old = join(P, 'old'); mkdirSync(old);
  for (const f of ['test-after-code.mjs', 'clock-now.mjs']) writeFileSync(join(old, f), execFileSync('git', ['show', `${rev}:framework/hooks/${f}`], { cwd: ROOT, encoding: 'utf8' }));
  const run = (script, ev) => spawnSync(process.execPath, [script, '--kimi'], { cwd: P, input: JSON.stringify(ev), encoding: 'utf8', timeout: 20000 });
  const debt = () => { try { return Object.keys(JSON.parse(readFileSync(join(P, '.kaif', 'test-debt.json'), 'utf8')).debt || {}); } catch { return []; } };
  const write = { hook_event_name: 'PostToolUse', session_id: 's146', cwd: P, tool_name: 'Write', tool_input: { path: 'src/app.mjs', content: "console.log('ok');" } };
  run(join(ROOT, 'framework', 'hooks', 'test-after-code.mjs'), write);
  check(debt().includes('src/app.mjs'), 'A · this tree: a Kimi Write {path} is a debt', debt());
  rmSync(join(P, '.kaif', 'test-debt.json'), { force: true });
  run(join(old, 'test-after-code.mjs'), write);
  check(!debt().includes('src/app.mjs'), `B · ${rev}: no debt (the blind spot)`, debt());
  // built from code points: a placeholder typed here is filled by the source's own clock hook on write (it happened — EXP-0218)
  const ph = String.fromCodePoint(0x27e6) + 'NOW' + String.fromCodePoint(0x27e7);
  // a markdown file is markdown under Kimi too: a placeholder only inside a code span stays a letter (the rule of the hook); without the
  // path the old hook took the file for code and refused it; a plain placeholder is refused by both (Kimi has no updatedInput)
  const pre = (content) => ({ hook_event_name: 'PreToolUse', session_id: 's146', cwd: P, tool_name: 'Write', tool_input: { path: 'notes.md', content } });
  const span = pre('The form is `' + ph + '` in a code span.\n'), plain = pre(`Created: ${ph}\n`);
  const c = run(join(ROOT, 'framework', 'hooks', 'clock-now.mjs'), span);
  check(c.status === 0, 'C · this tree: notes.md is markdown — a placeholder inside a code span passes untouched', { status: c.status, err: c.stderr });
  const d = run(join(old, 'clock-now.mjs'), span);
  check(d.status === 2, `D · ${rev}: the path unread, notes.md taken for code — the code-span placeholder refused`, { status: d.status, err: d.stderr });
  const e = run(join(ROOT, 'framework', 'hooks', 'clock-now.mjs'), plain), f = run(join(old, 'clock-now.mjs'), plain);
  check(e.status === 2 && f.status === 2, 'E · a plain placeholder: refused by both, with the cure', { e: e.status, f: f.status });
  const fragment = readFileSync(join(ROOT, 'framework', 'hooks', 'kimi-config-fragment.toml'), 'utf8');
  const stops = fragment.split(/^\[\[hooks\]\]\s*$/m).slice(1).filter((entry) => /event = "Stop"/.test(entry));
  check(stops.length === 1 && stops[0].includes('kimi-stop.mjs --kimi'),
    'F · bugs/156 replacement contract: Kimi has one sequential Stop multiplexer, so the Write debt reason cannot be hidden behind STATUS', stops);
} finally { rmSync(P, { recursive: true, force: true }); }
console.log(bad ? `bugs146-kimi-path-red: ${bad} BAD` : 'bugs146-kimi-path-red: all as named');
process.exit(bad ? 1 : 0);
