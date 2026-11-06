// PT (2.10), origin #188 — functional run of the context-window hook on a REAL transcript: the default thresholds (80 / 85) and the
// project's own (contextWindow in a fresh deployment's kaif.json). The hook never blocks; the probe prints what the agent would read.
// Run: node tools/sandbox/probes/pt6-context-window.mjs <transcript.jsonl> [warnPct closePct]
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../../lib/temp-root.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const [TR, W, C] = process.argv.slice(2);
if (!TR) { console.error('usage: pt6-context-window.mjs <transcript.jsonl> [warnPct closePct]'); process.exit(2); }
const root = tempRoot('pt6');
try {
  mkdirSync(join(root, '.kaif'), { recursive: true });
  const run = (cw) => {
    writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.10', ...(cw ? { contextWindow: cw } : {}) }));
    rmSync(join(root, '.kaif', 'context-window.json'), { force: true });
    const r = spawnSync(process.execPath, [join(REPO, 'framework', 'hooks', 'context-window.mjs')],
      { input: JSON.stringify({ hook_event_name: 'PostToolUse', session_id: 'pt6', cwd: root, transcript_path: resolve(TR) }), env: { ...process.env, CLAUDE_PROJECT_DIR: root }, encoding: 'utf8', timeout: 30000 });
    let line = ''; try { line = JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch { /* silence */ }
    return { status: r.status, line };
  };
  const d = run(null);
  console.log('defaults 80/85: exit ' + d.status + ' · ' + (d.line || '(silence)'));
  if (W) { const o = run({ warnPct: Number(W), closePct: Number(C) }); console.log('project ' + W + '/' + C + ': exit ' + o.status + ' · ' + (o.line || '(silence)')); }
} finally { rmSync(root, { recursive: true, force: true }); }
