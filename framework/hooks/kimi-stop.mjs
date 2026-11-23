#!/usr/bin/env node
// kimi-stop.mjs — Kimi's ONE Stop entry: run the project's Stop handlers sequentially, with the same event, and aggregate every exit-2
// reason into the single continuation Kimi delivers. Kimi runs matching hooks in parallel and chooses only the first block in config order;
// independent producers therefore consumed one-shot state for reasons the agent never saw (bugs/156). Claude keeps its own wiring unchanged.
// Order is the former fragment order: STATUS, farewell observation, testing debt, context window. StopFailure remains a separate farewell entry.
// Kimi permits only one Stop continuation per agent turn (researches/50 §14): unresolved debt may block a later ordinary Stop again without
// creating an infinite continuation loop. Any missing/failed handler fails open, as the dispatcher and the individual hooks do.
// [NOT-TESTED]
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot, scriptOf } from './kimi-hook.mjs';

export const STOP_HANDLERS = ['stop-status-guard.mjs', 'stop-farewell-capture.mjs', 'test-after-code.mjs', 'context-window.mjs'];

export function runStop(raw, root) {
  const reasons = [];
  let stdout = '', stderr = '';
  for (const name of STOP_HANDLERS) {
    const script = scriptOf(root, name);
    if (!script) continue;                 // an older project may not carry a newer optional handler
    const r = spawnSync(process.execPath, [script, '--kimi'], { input: raw, cwd: root, encoding: 'utf8' });
    stdout += r.stdout || '';
    if (r.status === 2) {
      const reason = String(r.stderr || '').trim();
      if (reason) reasons.push(reason);
    } else stderr += r.stderr || '';       // fail-open diagnostics stay visible; only exit 2 is a block
  }
  return { code: reasons.length ? 2 : 0, stdout, stderr: reasons.length ? reasons.join('\n\n') + '\n' : stderr };
}

function dispatch() {
  const raw = readFileSync(0);
  let event = {};
  try { event = JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, '') || '{}'); } catch { /* the handlers fail open on bad input too */ }
  const root = projectRoot(typeof event.cwd === 'string' && event.cwd ? event.cwd : process.cwd());
  if (!root) return 0;
  const r = runStop(raw, root);
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.code;
}

function selftest() {
  let bad = 0;
  const ok = (condition, name, detail = '') => { console.log(`${condition ? 'v' : 'x'} ${name}${condition || !detail ? '' : ' — ' + detail}`); if (!condition) bad++; };
  const tmp = mkdtempSync(join(tmpdir(), 'kaif-kimi-stop-'));
  const self = fileURLToPath(import.meta.url);
  try {
    const root = join(tmp, 'project'), hooks = join(root, '.kaif', 'hooks'), log = join(tmp, 'calls.jsonl');
    mkdirSync(hooks, { recursive: true });
    writeFileSync(join(root, '.kaif', 'kaif.json'), '{}');
    const handler = (name, reason = '') => {
      const seen = join(tmp, `${name}-seen`);
      writeFileSync(seen, '0');
      return `import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';\n` +
        `const raw = readFileSync(0, 'utf8'); appendFileSync(${JSON.stringify(log)}, JSON.stringify({ name: ${JSON.stringify(name)}, event: JSON.parse(raw) }) + '\\n');\n` +
        (reason ? `const seen = ${JSON.stringify(seen)}; const n = Number(readFileSync(seen, 'utf8') || 0); writeFileSync(seen, String(n + 1));\n` +
          `if (!n) { process.stderr.write(${JSON.stringify(reason)}); process.exit(2); }\n` : '');
    };
    writeFileSync(join(hooks, 'stop-status-guard.mjs'), handler('status', 'STATUS reason'));
    writeFileSync(join(hooks, 'stop-farewell-capture.mjs'), handler('farewell'));
    writeFileSync(join(hooks, 'test-after-code.mjs'), handler('testing', 'TESTING reason'));
    writeFileSync(join(hooks, 'context-window.mjs'), handler('window', 'WINDOW reason'));
    const event = { hook_event_name: 'Stop', session_id: 'kimi-stop-selftest', cwd: root, usage: { inputOther: 7 } };
    const run = () => spawnSync(process.execPath, [self, '--kimi'], { input: JSON.stringify(event), cwd: root, encoding: 'utf8', timeout: 30000 });
    let r = run();
    const calls = () => readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const first = calls();
    ok(r.status === 2 && r.stderr === 'STATUS reason\n\nTESTING reason\n\nWINDOW reason\n', 'all exit-2 reasons aggregate in deterministic order with one exit 2', JSON.stringify(r));
    ok(JSON.stringify(first.map((c) => c.name)) === JSON.stringify(['status', 'farewell', 'testing', 'window'])
      && first.every((c) => JSON.stringify(c.event) === JSON.stringify(event)), 'every handler runs once, sequentially, with the identical event; observation-only farewell is not skipped', JSON.stringify(first));
    r = run();
    const second = calls().slice(4);
    ok(r.status === 0 && r.stderr === '' && second.length === 4 && second.filter((c) => c.name === 'farewell').length === 1,
      'a replay whose one-shot blocks are spent is silent; observation-only farewell runs exactly once again', JSON.stringify({ r, second }));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  console.log(bad ? `x ${bad} case(s) failed` : 'v kimi-stop selftest: all ok');
  return bad ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = process.argv[2] === '--selftest' ? selftest() : dispatch();
}
