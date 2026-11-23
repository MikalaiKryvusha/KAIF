#!/usr/bin/env node
// bugs/155: deterministically overlap Kimi PostToolUse and PreToolUse at the state rename.
// The first process waits after writing its temp file; the second is then started. A fixed shared temp makes the second rename fail,
// while a lock or unique temp preserves the PreToolUse refusal. A separate forced rename fault proves persistence cannot swallow denial.
// [TESTED: 2026-11-23 · direct copied-hook events; HEAD red and this build green; evidence bugs/155]
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const revIndex = process.argv.indexOf('--rev');
const rev = revIndex >= 0 ? process.argv[revIndex + 1] : '';
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const work = mkdtempSync(join(tmpdir(), 'kaif-bugs155-'));
const waitFor = async (path, timeout = 30000) => {
  const until = Date.now() + timeout;
  while (!existsSync(path) && Date.now() < until) await new Promise((resolveWait) => setTimeout(resolveWait, 10));
  return existsSync(path);
};
let code = 1;
try {
  const original = rev
    ? execFileSync('git', ['show', `${rev}:framework/hooks/context-window.mjs`], { cwd: sourceRoot, encoding: 'utf8' })
    : readFileSync(join(sourceRoot, 'framework', 'hooks', 'context-window.mjs'), 'utf8');
  const importAnchor = "import { fileURLToPath } from 'node:url';";
  const instrumented = original.replace('renameSync,', 'renameSync as renameSyncRaw,').replace(importAnchor, `${importAnchor}
function renameSync(from, to) {
  if (process.env.KAIF_FAIL_STATE_RENAME && String(to).endsWith('context-window.json')) throw new Error('forced state rename failure');
  const barrier = process.env.KAIF_OVERLAP_BARRIER, role = process.env.KAIF_OVERLAP_ROLE;
  if (barrier && String(from).includes('context-window.json')) {
    writeFileSync(barrier + '.' + role + '.ready', 'ready');
    const until = Date.now() + 5000;
    while (!existsSync(barrier + '.' + role + '.go') && Date.now() < until)
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
  }
  return renameSyncRaw(from, to);
}
`);
  if (instrumented === original || !instrumented.includes('renameSync as renameSyncRaw')) throw new Error('rename instrumentation did not apply');
  const hook = join(work, 'context-window.mjs');
  writeFileSync(hook, instrumented);
  const home = join(work, 'kimi-home'), root = join(work, 'project');
  mkdirSync(join(root, '.kaif'), { recursive: true });
  mkdirSync(home, { recursive: true });
  writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ agents: ['kimi-code'], contextWindow: { tokens: 1048576 } }));
  writeFileSync(join(home, 'config.toml'), 'default_model = "kimi-code/k3.1-pro"\n[models."kimi-code/k3.1-pro"]\nmax_context_size = 1048576\n');
  const env = { ...process.env, KIMI_CODE_HOME: home, KIMI_CODE_SESSION_ID: '', CLAUDE_CODE_SESSION_ID: '' };
  const usage = { inputOther: 760000, inputCacheRead: 0, inputCacheCreation: 0 };
  const event = (hook_event_name) => JSON.stringify({ hook_event_name, session_id: 'session_overlap', cwd: root, tool_name: 'Read', usage });
  const start = (role, barrier) => {
    const child = spawn(process.execPath, [hook, '--kimi'], { env: { ...env, KAIF_OVERLAP_BARRIER: barrier, KAIF_OVERLAP_ROLE: role }, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const done = new Promise((resolveDone) => child.on('close', (status) => resolveDone({ status, stdout, stderr })));
    child.stdin.end(event(role === 'post' ? 'PostToolUse' : 'PreToolUse'));
    return { child, done };
  };

  const barrier = join(work, 'overlap');
  const post = start('post', barrier);
  if (!await waitFor(barrier + '.post.ready')) {
    writeFileSync(barrier + '.post.go', 'go');
    const early = await post.done;
    throw new Error(`PostToolUse did not reach the state rename: ${JSON.stringify({ ...early, readyAfter: existsSync(barrier + '.post.ready'), readyPath: barrier + '.post.ready' })}`);
  }
  const pre = start('pre', barrier);
  const preOverlapped = await waitFor(barrier + '.pre.ready', 400);
  writeFileSync(barrier + '.post.go', 'go');
  const postResult = await post.done;
  if (!await waitFor(barrier + '.pre.ready')) throw new Error('PreToolUse did not reach the state rename');
  writeFileSync(barrier + '.pre.go', 'go');
  const preResult = await pre.done;
  const statePath = join(root, '.kaif', 'context-window.json');
  let state = null;
  try { state = JSON.parse(readFileSync(statePath, 'utf8')); } catch { /* the assertion below reports invalid state */ }
  const overlapOK = postResult.status === 0 && postResult.stdout === '' && preResult.status === 2
    && /\/skill:end-chat-soft/.test(preResult.stderr) && state && state.session_overlap && Object.keys(state).length <= 20;

  const failedPersistence = spawnSync(process.execPath, [hook, '--kimi'], {
    input: event('PreToolUse'), env: { ...env, KAIF_FAIL_STATE_RENAME: '1' }, encoding: 'utf8', timeout: 20000,
  });
  const persistenceOK = failedPersistence.status === 2 && /\/skill:end-chat-soft/.test(failedPersistence.stderr);
  for (let i = 0; i < 25; i++) {
    spawnSync(process.execPath, [hook, '--kimi'], {
      input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', session_id: `session_retention_${i}`, cwd: root }),
      env, encoding: 'utf8', timeout: 20000,
    });
  }
  let retained = null;
  try { retained = JSON.parse(readFileSync(statePath, 'utf8')); } catch { /* the assertion below reports invalid state */ }
  const retentionOK = retained && Object.keys(retained).length === 20;
  let unrelated = instrumented.replace('const all = readJson(join(root, STATE)) || {};',
    "throw new Error('forced unrelated internal error');\n    const all = readJson(join(root, STATE)) || {};");
  if (unrelated === instrumented) unrelated = instrumented.replace('const id = ev.session_id, all = readJson(join(root, STATE)) || {};',
    "const id = ev.session_id; throw new Error('forced unrelated internal error');\n    const all = readJson(join(root, STATE)) || {};");
  if (unrelated === instrumented) throw new Error('unrelated-error instrumentation did not apply');
  writeFileSync(hook, unrelated);
  const unrelatedResult = spawnSync(process.execPath, [hook, '--kimi'], { input: event('PreToolUse'), env, encoding: 'utf8', timeout: 20000 });
  const failOpenOK = unrelatedResult.status === 0 && unrelatedResult.stderr === '';
  const pass = Boolean(overlapOK && persistenceOK && retentionOK && failOpenOK);
  code = pass ? 0 : 1;
  console.log(`hook: ${rev || 'this build'}; second writer reached rename before release: ${preOverlapped}`);
  console.log(`overlap: PostToolUse exit ${postResult.status}, stdout ${JSON.stringify(postResult.stdout)}; PreToolUse exit ${preResult.status}, stderr ${JSON.stringify(preResult.stderr.slice(0, 180))}`);
  console.log(`state: ${state ? `valid JSON, ${Object.keys(state).length} session(s)` : 'INVALID OR MISSING'}; forced persistence failure: exit ${failedPersistence.status}, stderr ${JSON.stringify(failedPersistence.stderr.slice(0, 180))}`);
  console.log(`retention after 25 more sessions: ${retained ? Object.keys(retained).length : 'INVALID'} (expected 20); unrelated internal error: exit ${unrelatedResult.status}, stderr ${JSON.stringify(unrelatedResult.stderr)}`);
  console.log(pass ? 'PASS: denials survive overlap/persistence faults; retention stays at 20 and unrelated errors fail open' : 'FAIL: denial, state validity, retention, or unrelated fail-open regressed');
} catch (error) {
  console.log(`FAIL harness: ${error.message}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
process.exit(code);
