// TK10 (a) functional run, #190: a deployment WITHOUT contour.callName, the identity table holds «Ann Lee (ACE)» → the dry-run call
// addresses «Ann». Runs the shipped generator from dist/ against a fresh temp project; quiet (dry run, no sound, no page).
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { quietEnv } from '../../lib/sandbox-run.mjs';
const REPO = process.argv[2];
const root = mkdtempSync(join(tmpdir(), 'kaif-tk10a-'));
try {
  mkdirSync(join(root, '.kaif', 'tools'), { recursive: true });
  cpSync(join(REPO, 'framework', 'tools', 'contour'), join(root, '.kaif', 'tools', 'contour'), { recursive: true });
  writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.10', language: 'en' }));
  writeFileSync(join(root, 'AGENT_GUIDE.md'), '# Guide\n\n| Field | Value |\n|---|---|\n| **Author / owner** | Ann Lee (ACE) |\n');
  for (const text of ['the phone needs unlocking', 'Ann, the phone needs unlocking']) {
    const r = spawnSync(process.execPath, [join(root, '.kaif', 'tools', 'contour', 'review.mjs'), '--call', text, '--dry-run'], { cwd: root, env: quietEnv(), encoding: 'utf8', timeout: 30000 });
    console.log('exit ' + r.status + ' · ' + (r.stdout || '').split('\n')[0] + ' ' + (r.stderr || '').slice(0, 200));
  }
} finally { rmSync(root, { recursive: true, force: true }); }
