#!/usr/bin/env node
// [TESTED: 2026-11-22 · live ACP PermissionRequest PASS, session_476e0bc5; testcases/reports/2026-11-22_ki-ka9-live-hooks.md]
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { tempRoot } from '../../lib/temp-root.mjs';

const root = tempRoot('ka9-acp-permission');
const core = join(process.cwd(), 'dist', 'KAIF-CORE.mjs');
const run = (command, args) => {
  const r = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 60000 });
  if (r.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${r.status}):\n${r.stdout}${r.stderr}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (predicate, ms, label) => {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const value = predicate();
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`timeout waiting for ${label}`);
};

run('git', ['init', '-q']);
run(process.execPath, [core, 'install', '--bundle', join(process.cwd(), 'dist', 'KAIF-CORE-BUNDLE.md'), '--mode', 'standard', '--agents', 'kimi-code']);

const kimi = join(homedir(), 'AppData', 'Roaming', 'npm', 'node_modules', '@moonshot-ai', 'kimi-code', 'dist', 'main.mjs');
const child = spawn(process.execPath, [kimi, 'acp'], { cwd: root, env: process.env, stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
const approvals = [];
let nextId = 0;
let buffer = '';
let stderr = '';
let sessionId = '';
let promptDone = null;

child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
child.on('error', (error) => { stderr += `\n${error.message}`; });
child.on('close', (code) => {
  for (const { reject } of pending.values()) reject(new Error(`ACP exited ${code}:\n${stderr}`));
  pending.clear();
});
child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  for (;;) {
    const cut = buffer.indexOf('\n');
    if (cut < 0) break;
    const line = buffer.slice(0, cut).trim();
    buffer = buffer.slice(cut + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
      continue;
    }
    if (msg.method === 'session/request_permission') {
      approvals.push(msg.params);
      const options = msg.params.options || [];
      const option = options.find((x) => x.optionId === 'plan_approve') || options.find((x) => x.kind === 'allow_once');
      if (!option) throw new Error(`no approval option in ${line}`);
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: msg.id, result: { outcome: { outcome: 'selected', optionId: option.optionId } } })}\n`);
    }
  }
});

const request = (method, params) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
});
const wireOf = (id) => {
  const base = join(homedir(), '.kimi-code', 'sessions');
  for (const wd of readdirSync(base)) {
    const path = join(base, wd, id, 'agents', 'main', 'wire.jsonl');
    if (existsSync(path)) return path;
  }
  return '';
};

try {
  await request('initialize', { protocolVersion: 1, clientCapabilities: {}, clientInfo: { name: 'kaif-acp-probe', version: '1.0.0' } });
  const created = await request('session/new', { cwd: root, mcpServers: [] });
  sessionId = created.sessionId;
  await request('session/set_mode', { sessionId, modeId: 'plan' });
  promptDone = request('session/prompt', {
    sessionId,
    prompt: [{ type: 'text', text: 'Write one sentence in the host-provided plan file, then call ExitPlanMode immediately. Do not call any other tool.' }],
  });
  await waitFor(() => approvals.length > 0, 120000, 'PermissionRequest');
  await promptDone;
  const wire = await waitFor(() => {
    const path = wireOf(sessionId);
    if (!path) return '';
    const text = readFileSync(path, 'utf8');
    return text.includes('"type":"interaction.request"') && text.includes('"kind":"approval"')
      && text.includes('"type":"permission.record_approval_result"') ? path : '';
  }, 10000, 'permission events in the session wire');
  const voiceDir = join(root, 'voice');
  const voiceFiles = await waitFor(() => {
    if (!existsSync(voiceDir)) return null;
    const files = readdirSync(voiceDir).filter((name) => name.includes('permission-request'));
    return files.length ? files : null;
  }, 10000, 'the KAIF permission voice file');
  console.log(JSON.stringify({ verdict: 'PASS', sessionId, wire, approvals: approvals.length, voiceFiles }, null, 2));
  await request('session/close', { sessionId }).catch(() => null);
} catch (error) {
  console.error(`FAIL: ${error.stack || error}`);
  if (stderr) console.error(`ACP stderr:\n${stderr.slice(-12000)}`);
  process.exitCode = 1;
} finally {
  child.kill();
}
