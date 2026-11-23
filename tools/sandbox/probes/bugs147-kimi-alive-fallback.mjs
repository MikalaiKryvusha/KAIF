#!/usr/bin/env node
// bugs/147: without an agent session env var, --alive/--measure must not read an older Claude session as the live Kimi one.
// This build: the newer Kimi session is judged. --rev <revision>: the broken hook is taken from git and the defect must reproduce.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const revIndex = process.argv.indexOf('--rev');
const rev = revIndex >= 0 ? process.argv[revIndex + 1] : '';
const work = mkdtempSync(join(tmpdir(), 'kaif-bugs147-'));
let code = 1;
try {
  const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const hook = join(work, 'context-window.mjs');
  writeFileSync(hook, rev ? execFileSync('git', ['show', `${rev}:framework/hooks/context-window.mjs`], { cwd: source }) : readFileSync(join(source, 'framework', 'hooks', 'context-window.mjs')));
  const home = join(work, 'home'), kimiHome = join(home, '.kimi-code'), project = join(work, 'project');
  mkdirSync(join(project, '.kaif'), { recursive: true });
  mkdirSync(join(project, '.claude'), { recursive: true });
  writeFileSync(join(project, '.kaif', 'kaif.json'), JSON.stringify({ agents: ['claude-code', 'kimi-code'] }));
  writeFileSync(join(project, '.claude', 'settings.json'), JSON.stringify({ hooks: { PostToolUse: [{ hooks: [{ command: 'node context-window.mjs' }] }] } }));
  mkdirSync(kimiHome, { recursive: true });
  writeFileSync(join(kimiHome, 'config.toml'), 'default_model = "kimi-code/k3.1-pro"\n[models."kimi-code/k3.1-pro"]\nmax_context_size = 1048576\n[[hooks]]\nevent = "PostToolUse"\ncommand = "node kimi-hook.mjs context-window.mjs --kimi"\n', { recursive: true });

  const slug = resolve(project).replace(/[^A-Za-z0-9]/g, '-');
  const claude = join(home, '.claude', 'projects', slug, 'claude_old.jsonl');
  mkdirSync(dirname(claude), { recursive: true });
  writeFileSync(claude, JSON.stringify({ type: 'assistant', message: { model: 'claude-opus-5-5', usage: { input_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }) + '\n');
  const state = join(project, '.kaif', 'context-window.json');
  writeFileSync(state, JSON.stringify({ claude_old: { said: [], seen: 10, at: '2026-11-21T15:00:00.000Z' } }));

  const session = 'session_kimi_live';
  const wire = join(kimiHome, 'sessions', 'wd_test', session, 'agents', 'main', 'wire.jsonl');
  mkdirSync(dirname(wire), { recursive: true });
  writeFileSync(wire, JSON.stringify({ type: 'usage.record', agentId: 'main', model: 'kimi-code/k3.1-pro', usage: { inputOther: 500000, inputCacheRead: 0, inputCacheCreation: 0 } }) + '\n');
  writeFileSync(join(kimiHome, 'sessions', 'wd_test', session, 'state.json'), JSON.stringify({ id: session, cwd: project }));
  utimesSync(claude, new Date('2026-11-21T15:00:00Z'), new Date('2026-11-21T15:00:00Z'));
  utimesSync(wire, new Date('2026-11-21T16:00:00Z'), new Date('2026-11-21T16:00:00Z'));

  const run = (arg, extraEnv = {}, cwd = project) => spawnSync(process.execPath, [hook, arg], { cwd, encoding: 'utf8', timeout: 20000,
    env: { ...process.env, HOME: home, USERPROFILE: home, KIMI_CODE_HOME: kimiHome, CLAUDE_PROJECT_DIR: project, KIMI_CODE_SESSION_ID: '', CLAUDE_CODE_SESSION_ID: '', ...extraEnv } });
  const from = (cwd, arg = '--measure') => run(arg, { CLAUDE_PROJECT_DIR: '' }, cwd);
  const before = run('--alive');
  writeFileSync(state, JSON.stringify({ claude_old: { said: [], seen: 10, at: '2026-11-21T15:00:00.000Z' }, [session]: { said: [], seen: 500000, at: '2026-11-21T16:00:00.000Z' } }));
  const after = run('--alive');
  const measured = run('--measure');

  // bugs/158: a session opened below the project root routes by its nearest KAIF marker, not by exact cwd text.
  const deep = join(project, 'src', 'deep');
  mkdirSync(deep, { recursive: true });
  writeFileSync(join(kimiHome, 'sessions', 'wd_test', session, 'state.json'), JSON.stringify({ id: session, cwd: deep }));
  const deepRootAlive = run('--alive'), deepRootMeasure = run('--measure');
  const deepLocalAlive = from(deep, '--alive'), deepLocalMeasure = from(deep);
  writeFileSync(join(kimiHome, 'sessions', 'wd_test', session, 'state.json'), JSON.stringify({ id: session, cwd: project }));

  // A newer session of a nested project must not capture the outer root; from inside, the nested session wins.
  const nested = 'session_kimi_nested', inner = join(project, 'nested'), innerDeep = join(inner, 'src', 'deep');
  mkdirSync(join(inner, '.kaif'), { recursive: true });
  mkdirSync(innerDeep, { recursive: true });
  writeFileSync(join(inner, '.kaif', 'kaif.json'), JSON.stringify({ agents: ['kimi-code'] }));
  writeFileSync(join(inner, '.kaif', 'context-window.json'), JSON.stringify({ [nested]: { said: [], seen: 510000, at: '2026-11-21T16:30:00.000Z' } }));
  const nestedWire = join(kimiHome, 'sessions', 'wd_nested', nested, 'agents', 'main', 'wire.jsonl');
  mkdirSync(dirname(nestedWire), { recursive: true });
  writeFileSync(nestedWire, JSON.stringify({ type: 'usage.record', agentId: 'main', model: 'kimi-code/k3.1-pro', usage: { inputOther: 510000, inputCacheRead: 0, inputCacheCreation: 0 } }) + '\n');
  writeFileSync(join(kimiHome, 'sessions', 'wd_nested', nested, 'state.json'), JSON.stringify({ id: nested, cwd: innerDeep }));
  utimesSync(nestedWire, new Date('2026-11-21T16:30:00Z'), new Date('2026-11-21T16:30:00Z'));
  const outerWithNested = run('--measure'), innerAlive = from(innerDeep, '--alive'), innerMeasure = from(innerDeep);

  const explicitOlderAlive = run('--alive', { CLAUDE_CODE_SESSION_ID: 'claude_old' });
  const explicitOlderMeasure = run('--measure', { CLAUDE_CODE_SESSION_ID: 'claude_old' });
  const claudeNew = join(home, '.claude', 'projects', slug, 'claude_new.jsonl');
  writeFileSync(claudeNew, JSON.stringify({ type: 'assistant', message: { model: 'claude-opus-5-5', usage: { input_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }) + '\n');
  writeFileSync(state, JSON.stringify({ claude_new: { said: [], seen: 20, at: '2026-11-21T17:00:00.000Z' }, [session]: { said: [], seen: 500000, at: '2026-11-21T16:00:00.000Z' } }));
  utimesSync(claudeNew, new Date('2026-11-21T17:00:00Z'), new Date('2026-11-21T17:00:00Z'));
  const reverseAlive = run('--alive'), reverseMeasure = run('--measure');
  const explicitAlive = run('--alive', { CLAUDE_CODE_SESSION_ID: 'claude_new' });
  const explicitMeasure = run('--measure', { CLAUDE_CODE_SESSION_ID: 'claude_new' });
  writeFileSync(join(project, '.kaif', 'kaif.json'), JSON.stringify({ agents: ['kimi-code'] }));
  const kimiOnlyAlive = run('--alive'), kimiOnlyMeasure = run('--measure');
  console.log(`hook: ${rev || 'this build'}`);
  console.log(`Kimi newer than Claude, no Kimi presence: alive exit ${before.status} · ${String(before.stdout).trim()}`);
  console.log(`Kimi presence recorded: alive exit ${after.status} · ${String(after.stdout).trim()}`);
  console.log(`measure exit ${measured.status} · ${String(measured.stdout).trim()}`);
  console.log(`Session cwd deep, lookup root: alive ${deepRootAlive.status}; measure ${deepRootMeasure.status} · ${String(deepRootMeasure.stdout).trim()}`);
  console.log(`Session cwd deep, lookup deep: alive ${deepLocalAlive.status}; measure ${deepLocalMeasure.status} · ${String(deepLocalMeasure.stdout).trim()}`);
  console.log(`Nested routing: outer ${outerWithNested.status} · ${String(outerWithNested.stdout).trim()}`);
  console.log(`Nested routing: inner alive ${innerAlive.status}; measure ${innerMeasure.status} · ${String(innerMeasure.stdout).trim()}`);
  console.log(`Claude newer than Kimi: alive exit ${reverseAlive.status} · ${String(reverseAlive.stdout).trim()}`);
  console.log(`Claude newer than Kimi: measure exit ${reverseMeasure.status} · ${String(reverseMeasure.stdout).trim()}`);
  console.log(`Explicit Claude id: alive exit ${explicitAlive.status}; measure exit ${explicitMeasure.status} · ${String(explicitMeasure.stdout).trim()}`);
  console.log(`Explicit older Claude id with newer Kimi: alive exit ${explicitOlderAlive.status} · ${String(explicitOlderAlive.stdout).trim()}; measure exit ${explicitOlderMeasure.status}`);
  console.log(`Kimi-only marker, Claude newer: alive exit ${kimiOnlyAlive.status}; measure exit ${kimiOnlyMeasure.status}`);
  const reverseRefused = reverseAlive.status === 2 && reverseMeasure.status === 2 && /ambiguous/.test(reverseAlive.stdout) && /ambiguous/.test(reverseMeasure.stdout)
    && /session_kimi_live/.test(reverseAlive.stdout) && /claude_new/.test(reverseAlive.stdout);
  const explicitClaude = explicitAlive.status === 0 && /claude_new/.test(explicitAlive.stdout)
    && explicitMeasure.status === 1 && /20 of 1000000/.test(explicitMeasure.stdout);
  const explicitOlderClaude = explicitOlderAlive.status === 0 && /claude_old/.test(explicitOlderAlive.stdout) && !/Kimi session/.test(explicitOlderAlive.stdout)
    && explicitOlderMeasure.status === 1 && /10 of 1000000/.test(explicitOlderMeasure.stdout);
  const kimiOnlyRefused = kimiOnlyAlive.status === 2 && kimiOnlyMeasure.status === 2;
  const baseFixed = before.status === 1 && /session_kimi_live/.test(before.stdout) && /reload|new session/.test(before.stdout)
    && after.status === 0 && /session_kimi_live/.test(after.stdout) && /500000 of 891289/.test(measured.stdout) && reverseRefused && explicitClaude && explicitOlderClaude && kimiOnlyRefused;
  const routingFixed = deepRootAlive.status === 0 && deepLocalAlive.status === 0
    && /500000 of 891289/.test(deepRootMeasure.stdout) && /500000 of 891289/.test(deepLocalMeasure.stdout)
    && /500000 of 891289/.test(outerWithNested.stdout) && /session_kimi_live/.test(outerWithNested.stdout)
    && innerAlive.status === 0 && /session_kimi_nested/.test(innerAlive.stdout)
    && /510000 of 891289/.test(innerMeasure.stdout) && /session_kimi_nested/.test(innerMeasure.stdout);
  const fixed = baseFixed && routingFixed;
  const broken147 = before.status === 0 && /claude_old/.test(before.stdout) && /10 of 1000000/.test(measured.stdout)
    && reverseAlive.status === 0 && /claude_new/.test(reverseAlive.stdout) && /20 of 1000000/.test(reverseMeasure.stdout)
    && explicitClaude && explicitOlderClaude && kimiOnlyAlive.status === 0 && kimiOnlyMeasure.status === 1;
  const broken158 = /claude_old/.test(deepRootAlive.stdout) && /10 of 1000000/.test(deepRootMeasure.stdout)
    && !/510000 of 891289/.test(innerMeasure.stdout);
  code = rev ? ((broken147 || broken158) ? 1 : 0) : (fixed ? 0 : 1);
  console.log(rev ? ((broken147 || broken158) ? `RED reproduced: ${broken147 ? 'cross-agent false greens' : 'exact-cwd subfolder rejection and nested routing failure'}` : 'NOT reproduced')
    : (fixed ? 'PASS: no-id ambiguity is refused; root/deep/nested routing and explicit Claude ids stay valid' : 'FAIL: the Kimi fallback is wrong'));
} finally {
  rmSync(work, { recursive: true, force: true });
}
process.exit(code);
