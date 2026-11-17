// tools/sandbox/probes/issue194-sibling-cwd.mjs — a PROBE (not a polygon suite): origin #194 — the refresh timer named a marker in the WRONG
// folder when the event's cwd was a SIBLING working folder of the session (no ancestor holds `.kaif/kaif.json`, the fallback was cwd itself).
// The field's repro, run as Claude Code runs the hook: a temporary project with a FRESH refresh marker, a sibling folder, the event
// `{ cwd: <sibling> }` on stdin and CLAUDE_PROJECT_DIR = the project. This build → silence (the marker is fresh); `--rev <rev>` (the hook of
// that revision, by `git show`) → the order naming «<sibling>/.kaif/refresh-marker.json» — the defect (exit 1). Plus the subagent preamble's
// witness: it must land in the PROJECT's `.kaif/`, never in the sibling's.
// usage: node tools/sandbox/probes/issue194-sibling-cwd.mjs [--rev <git revision>]   (≈ 2 s)
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const at = process.argv.indexOf('--rev'), rev = at > 0 ? process.argv[at + 1] : null;
const work = mkdtempSync(join(tmpdir(), 'kaif-issue194-'));
let bad = 0;
try {
  const hookOf = (n) => {
    if (!rev) return join(REPO, 'framework', 'hooks', n);
    const s = spawnSync('git', ['show', rev + ':framework/hooks/' + n], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 24 });
    const p = join(work, rev + '-' + n); writeFileSync(p, s.stdout); return p;
  };
  const proj = join(work, 'project'), sib = join(work, 'sibling');
  mkdirSync(join(proj, '.kaif'), { recursive: true }); mkdirSync(sib, { recursive: true });
  writeFileSync(join(proj, '.kaif', 'kaif.json'), '{}');
  writeFileSync(join(proj, '.kaif', 'refresh-marker.json'), JSON.stringify({ at: new Date().toISOString(), docs: ['STATUS.md'], trigger: 'hour' }));
  // the preamble reads its list from the project's /resume step 1 — a minimal skill file is the project's own
  mkdirSync(join(proj, '.claude', 'skills', 'resume'), { recursive: true });
  writeFileSync(join(proj, '.claude', 'skills', 'resume', 'SKILL.md'), '# /resume\n\n## Step 1. Read\n\n- `STATUS.md` — state\n- `AGENT_GUIDE.md` — canon\n\n## Step 2. Go\n');
  for (const d of ['STATUS.md', 'AGENT_GUIDE.md']) writeFileSync(join(proj, d), '# ' + d + '\n');   // the list keeps only documents that exist
  const env = { ...process.env, CLAUDE_PROJECT_DIR: proj };
  const t = spawnSync(process.execPath, [hookOf('prompt-refresh-timer.mjs')], { input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', cwd: sib, prompt: 'go' }),
    env, encoding: 'utf8', timeout: 20000 });
  const out = String(t.stdout || '');
  const timerOk = !out.includes('sibling') && !/re-stamp/.test(out);
  if (!timerOk) bad++;
  console.log((timerOk ? 'OK  ' : 'BAD ') + 'refresh timer, cwd = a sibling folder, the project marker fresh: ' + (out.trim() ? out.trim().slice(0, 140) : '(silence)'));
  const pre = spawnSync(process.execPath, [hookOf('subagent-preamble.mjs')], { input: JSON.stringify({ hook_event_name: 'PreToolUse', cwd: sib, tool_name: 'Agent',
    tool_input: { description: 'x', prompt: 'do x' } }), env, encoding: 'utf8', timeout: 20000 });
  const preOk = pre.status === 0 && !existsSync(join(sib, '.kaif')) && existsSync(join(proj, '.kaif', 'subagent-preamble.jsonl'));
  if (!preOk) bad++;
  console.log((preOk ? 'OK  ' : 'BAD ') + 'subagent preamble, cwd = a sibling folder: its witness in the project ' + existsSync(join(proj, '.kaif', 'subagent-preamble.jsonl'))
    + ' · a `.kaif/` created in the sibling ' + existsSync(join(sib, '.kaif')));
  console.log('hooks: ' + (rev ? 'revision ' + rev : 'this build'));
} finally { rmSync(work, { recursive: true, force: true }); }
console.log(bad ? `✖ ${bad} BAD (origin #194)` : '✅ a sibling working folder is not taken for the project');
process.exit(bad ? 1 : 0);
