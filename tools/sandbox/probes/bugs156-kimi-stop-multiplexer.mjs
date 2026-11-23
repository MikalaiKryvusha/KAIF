// bugs156-kimi-stop-multiplexer.mjs — regression for Kimi's parallel Stop producers and first-reason-only delivery.
// The legacy control runs the real four Stop handlers and chooses the first exit 2 in config order, as Kimi does. The fixed path
// must return STATUS + testing + context-window reasons together; a later ordinary Stop after only STATUS is resolved must still
// refuse the unresolved test debt. Usage: node tools/sandbox/probes/bugs156-kimi-stop-multiplexer.mjs [hooks-directory]
// [NOT-TESTED]
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, utimesSync, readdirSync, cpSync } from 'node:fs';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const HOOKS = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'framework', 'hooks');
const P = mkdtempSync(join(tmpdir(), 'kaif-b156-'));
const HOME = join(P, 'kimi-home');
const sessionIds = ['bugs156-legacy', 'bugs156-multiplexed'];
let bad = 0;
const check = (condition, name, detail = '') => {
  console.log(`${condition ? 'OK ' : 'BAD'} ${name}${condition || !detail ? '' : ` — ${JSON.stringify(detail).slice(0, 700)}`}`);
  if (!condition) bad++;
};
const runAsync = (script, event, args = ['--kimi']) => new Promise((resolveRun) => {
  const child = spawn(process.execPath, [join(HOOKS, script), ...args], {
    cwd: P, env: { ...process.env, KIMI_CODE_HOME: HOME }, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true,
  });
  let stdout = '', stderr = '';
  child.stdout.on('data', (b) => { stdout += b; });
  child.stderr.on('data', (b) => { stderr += b; });
  const timer = setTimeout(() => child.kill(), 20000);
  child.on('error', (error) => { clearTimeout(timer); resolveRun({ status: null, stdout, stderr: stderr + String(error) }); });
  child.on('close', (status) => { clearTimeout(timer); resolveRun({ status, stdout, stderr }); });
  child.stdin.end(JSON.stringify(event));
});
const runSync = (script, event) => spawnSync(process.execPath, [join(HOOKS, script), '--kimi'], {
  input: JSON.stringify(event), cwd: P, env: { ...process.env, KIMI_CODE_HOME: HOME }, encoding: 'utf8', timeout: 20000,
});
const state = () => JSON.parse(readFileSync(join(P, '.kaif', 'test-debt.json'), 'utf8'));

try {
  mkdirSync(join(P, '.kaif'), { recursive: true });
  cpSync(HOOKS, join(P, '.kaif', 'hooks'), { recursive: true }); // the multiplexer must resolve the PROJECT'S deployed handlers
  mkdirSync(HOME, { recursive: true });
  writeFileSync(join(P, '.kaif', 'kaif.json'), JSON.stringify({ contextWindow: { tokens: 200000 } }));
  writeFileSync(join(P, 'STATUS.md'), '# status\n');
  const git = (...args) => execFileSync('git', args, { cwd: P, stdio: 'pipe' });
  git('init', '-q'); git('config', 'user.email', 'sbx@sbx'); git('config', 'user.name', 'sbx');
  git('add', '.'); git('commit', '-qm', 'seed');
  const oldSec = (Date.now() - 5 * 3600000) / 1000;
  utimesSync(join(P, 'STATUS.md'), oldSec, oldSec);
  writeFileSync(join(P, 'work.txt'), 'dirty\n');
  const post = runSync('test-after-code.mjs', {
    hook_event_name: 'PostToolUse', session_id: 'bugs156-setup', cwd: P,
    tool_name: 'Write', tool_input: { file_path: join(P, 'src', 'app.mjs') },
  });
  check(post.status === 0 && state().debt['src/app.mjs'], 'setup: the real testing hook records src/app.mjs debt', { status: post.status, stderr: post.stderr });

  const usage = { inputOther: 128000, inputCacheRead: 0, inputCacheCreation: 0 };
  const legacyEvent = { hook_event_name: 'Stop', session_id: sessionIds[0], cwd: P, usage };
  const producers = ['stop-status-guard.mjs', 'stop-farewell-capture.mjs', 'test-after-code.mjs', 'context-window.mjs'];
  const results = await Promise.all(producers.map((script) => runAsync(script, legacyEvent)));
  const delivered = results.find((r) => r.status === 2) || { stderr: '' };
  check(delivered.stderr.includes('KAIF STATUS guard') && !delivered.stderr.includes('KAIF testing') && !delivered.stderr.includes('/skill:end-chat-soft')
    && Boolean(state().lastStop), 'legacy control: only STATUS is delivered although testing lastStop and the window block were produced',
  { delivered: delivered.stderr, all: results.map((r) => ({ status: r.status, stderr: r.stderr })), lastStop: state().lastStop });

  const mux = join(HOOKS, 'kimi-stop.mjs');
  check(existsSync(mux), 'fixed path: kimi-stop.mjs exists', { mux });
  if (existsSync(mux)) {
    // Keep the debt, clear only the one-shot delivery memories, and use a fresh STATUS cooldown id.
    writeFileSync(join(P, '.kaif', 'test-debt.json'), JSON.stringify({ ...state(), lastStop: '' }));
    rmSync(join(P, '.kaif', 'context-window.json'), { force: true });
    const event = { ...legacyEvent, session_id: sessionIds[1] };
    const first = await runAsync('kimi-stop.mjs', event);
    const reason = first.stderr || '';
    check(first.status === 2 && reason.includes('KAIF STATUS guard') && reason.includes('KAIF testing')
      && reason.includes('/skill:end-chat-soft'), 'multiplexer: simultaneous STATUS + testing + window debt returns one exit 2 with ALL reasons',
    { status: first.status, stderr: reason });
    check(reason.indexOf('KAIF STATUS guard') >= 0 && reason.indexOf('KAIF STATUS guard') < reason.indexOf('KAIF testing')
      && reason.indexOf('KAIF testing') < reason.indexOf('/skill:end-chat-soft'), 'multiplexer: reasons retain deterministic producer order', reason);

    const nowSec = Date.now() / 1000;
    utimesSync(join(P, 'STATUS.md'), nowSec, nowSec);
    rmSync(join(P, 'work.txt'), { force: true });
    const second = await runAsync('kimi-stop.mjs', event);
    check(second.status === 2 && !second.stderr.includes('KAIF STATUS guard') && second.stderr.includes('KAIF testing')
      && second.stderr.includes('/skill:end-chat-soft'), 'later ordinary Stop: resolving only STATUS leaves testing and window debt blocked',
    { status: second.status, stderr: second.stderr });

    const ran = runSync('test-after-code.mjs', {
      hook_event_name: 'PostToolUse', session_id: sessionIds[1], cwd: P,
      tool_name: 'Bash', tool_input: { command: 'node src/app.mjs' },
    });
    check(ran.status === 0 && !state().debt['src/app.mjs'], 'setup: running src/app.mjs clears its debt', { status: ran.status, stderr: ran.stderr });
    const replay = await runAsync('kimi-stop.mjs', { ...event, usage: { inputOther: 1000, inputCacheRead: 0, inputCacheCreation: 0 } });
    check(replay.status === 0 && replay.stderr === '', 'replay without debt: exit 0, silent (no Stop loop)', { status: replay.status, stderr: replay.stderr });
  }
} catch (error) {
  check(false, 'probe completed without an exception', String(error && error.stack || error));
} finally {
  rmSync(P, { recursive: true, force: true });
  for (const name of readdirSync(tmpdir())) {
    if (sessionIds.some((id) => name === `kaif-status-guard-${id}`)) rmSync(join(tmpdir(), name), { force: true });
  }
}
console.log(bad ? `bugs156-kimi-stop-multiplexer: ${bad} BAD` : 'bugs156-kimi-stop-multiplexer: all as named');
process.exit(bad ? 1 : 0);
