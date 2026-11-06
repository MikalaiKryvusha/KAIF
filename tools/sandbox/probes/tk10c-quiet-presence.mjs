// TK10 (c), origin #193 — functional run through both shipped pieces: a fresh deployment whose quiet hours surround NOW; the clock hook
// gets the owner's prompt on stdin and writes the presence mark; a real `--call` (not a dry run) in quietEnv — sound is impossible by the
// environment — prints «Quiet hours (I6) lifted …»; the same call with the mark aged 61 minutes prints «… suppressed»; a background
// task's notification writes no mark. Run: node tools/sandbox/probes/tk10c-quiet-presence.mjs
import { mkdirSync, writeFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';
import { tempRoot } from '../../lib/temp-root.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const root = tempRoot('tk10c');
let ok = true; const say = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) ok = false; };
const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
try {
  mkdirSync(join(root, '.kaif', 'tools'), { recursive: true });
  cpSync(join(REPO, 'framework', 'tools', 'contour'), join(root, '.kaif', 'tools', 'contour'), { recursive: true });
  const now = new Date();
  writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.10', language: 'en',
    contour: { quietFrom: hhmm(new Date(now - 3600e3)), quietTo: hhmm(new Date(+now + 3600e3)), callName: 'Ann' } }));
  const hook = (prompt) => spawnSync(process.execPath, [join(REPO, 'framework', 'hooks', 'clock-now.mjs')],
    { input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', cwd: root, prompt }), env: { ...quietEnv(), CLAUDE_PROJECT_DIR: '' }, encoding: 'utf8', timeout: 30000 });
  const mark = join(root, '.kaif', 'owner-presence.json');
  hook('<task-notification><task-id>x</task-id></task-notification>');
  say(!existsSync(mark), 'a background task notification writes no presence mark');
  const h = hook('trouble with the login — call me by voice');
  say(h.status === 0 && existsSync(mark), 'the owner\'s prompt → .kaif/owner-presence.json written by the clock hook');
  const call = () => spawnSync(process.execPath, [join(root, '.kaif', 'tools', 'contour', 'review.mjs'), '--call', 'the login needs you'],
    { cwd: root, env: quietEnv(), encoding: 'utf8', timeout: 60000 });
  const a = call(), ao = (a.stdout || '') + (a.stderr || '');
  say(/Quiet hours \(I6\) lifted — the owner wrote 0 min ago/.test(ao) && !/beeps and voice suppressed/.test(ao), 'quiet hours + a fresh mark → «' + ((ao.match(/Quiet hours[^\n]*/) || [''])[0]).slice(0, 110) + '»');
  writeFileSync(mark, JSON.stringify({ at: new Date(+now - 61 * 60e3).toISOString() }));
  const b = call(), bo = (b.stdout || '') + (b.stderr || '');
  say(/Quiet hours \(I6\) — beeps and voice suppressed/.test(bo) && !/lifted/.test(bo), 'the mark aged 61 min → «' + ((bo.match(/Quiet hours[^\n]*/) || [''])[0]).slice(0, 110) + '»');
} finally { rmSync(root, { recursive: true, force: true }); }
process.exit(ok ? 0 : 1);
