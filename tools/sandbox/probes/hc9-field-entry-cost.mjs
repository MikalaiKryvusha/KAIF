#!/usr/bin/env node
// PROBE — step HC9 of version KAIF 2.10 (criterion 31, #179; HC judge finding 8: the field-clone run had no probe in probes/).
// Functional run of the `ℹ entry cost` line on git CLONES of real deployments: clone into an OS temp dir (the source is only read —
// GIT_OPTIONAL_LOCKS=0, HEAD and `git status` compared before and after), run `node <this build>/dist/KAIF-CORE.mjs check` in the clone
// (or `KAIF_DIST=<dir>` — another build), read BOTH streams, and judge: every `- \`NAME.md\`` bullet of the clone's `/resume` step 1 that
// exists on disk (EXPERIENCE.md is grepped, not read — skipped) is counted by the line, and the skill itself is named. Prints only the
// line's counts and the deployment's ordinal; document names of the field are printed only with --names. Clones are removed (kept on BAD).
// Usage: node tools/sandbox/probes/hc9-field-entry-cost.mjs <deployment> … [--names]   ≈ 10 s per deployment.
// [TESTED: 2026-11-17 · 14 field clones, this build against 455352f — testcases/reports/2026-11-17_hc-judge-findings-7-8.md]
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(ROOT, 'dist');
const args = process.argv.slice(2);
const names = args.includes('--names');
const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) { console.log('usage: hc9-field-entry-cost.mjs <deployment> … [--names]'); process.exit(2); }
const gitEnv = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };
const git = (cwd, ...a) => spawnSync('git', a, { cwd, env: gitEnv, encoding: 'utf8' });
const SKILL = join('.claude', 'skills', 'resume', 'SKILL.md');
const BULLET = /^- (?:\*\*[^`]*)?`([^`/]+\.md)`/; // `- \`NAME.md\` …` and `- **If it exists:** \`NAME.md\` …`
// the nine re-read core documents — the line counts them as a group, not by name
const CORE = new Set(['GOAL.md', 'AGENT_GUIDE.md', 'PHILOSOPHY.md', 'REQUIREMENTS_FRAMEWORK.md', 'TESTING_FRAMEWORK.md', 'BUG_FIXING_FRAMEWORK.md',
  'STATUS.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md']);

let bad = 0, skipped = 0;
targets.forEach((src, i) => {
  const tag = `deployment ${i + 1}`;
  const before = [git(src, 'rev-parse', 'HEAD').stdout.trim(), git(src, 'status', '--porcelain').stdout];
  const dir = mkdtempSync(join(tmpdir(), 'kaif-hc9-'));
  let keep = false;
  try {
    const cl = git(dir, 'clone', '--quiet', '--no-hardlinks', resolve(src), 'c');
    const c = join(dir, 'c');
    if (cl.status !== 0 || !existsSync(join(c, SKILL))) { console.log(`BAD ${tag}: clone failed or no ${SKILL}`); bad++; keep = true; return; }
    const step1 = readFileSync(join(c, SKILL), 'utf8').split(/\r?\n/).map((l) => (l.match(BULLET) || [])[1]).filter(Boolean);
    const onDisk = [...new Set(step1)].filter((n) => n !== 'EXPERIENCE.md' && existsSync(join(c, n)));
    const check = () => { const r = spawnSync(process.execPath, [join(DIST, 'KAIF-CORE.mjs'), 'check'], { cwd: c, encoding: 'utf8', env: { ...process.env, KAIF_VOICE_TOOL: '' } }); return String(r.stdout || '') + String(r.stderr || ''); };
    const out = check();
    // an INCOMPLETE deployment (`✖ INCOMPLETE`, e.g. artifacts git-ignored by KAIF's own .gitignore line, so the clone lacks them)
    // makes `check` stop before the entry-cost line by design — the deployment's state, not criterion 31: SKIP with the reason
    if (!out.includes('entry cost') && out.includes('INCOMPLETE')) {
      console.log(`SKIP ${tag}: check stopped — deployment INCOMPLETE (${(out.match(/✖/g) || []).length} ✖ line(s)); the entry-cost line is printed only for a complete one`);
      skipped++; return;
    }
    const line = out.split(/\r?\n/).find((l) => l.includes('entry cost') && l.includes('ℹ')) || '';
    const warns = out.split(/\r?\n/).filter((l) => l.includes('⚠ entry cost'));
    const missing = onDisk.filter((n) => !CORE.has(n) && !line.includes(n)); // the core nine are counted as a group, the rest by name
    const tokens = (line.match(/~\s*([\d.,]+k)\s*tokens/) || [])[1] || '?';
    const skillNamed = /the skill itself/.test(line);
    const okRun = Boolean(line) && missing.length === 0 && skillNamed;
    console.log(`${okRun ? 'OK ' : 'BAD'} ${tag}: step-1 docs on disk ${onDisk.length} · line counts ${tokens} tokens · skill named ${skillNamed} · ⚠ lines ${warns.length}`
      + (missing.length ? ` · NOT counted: ${names ? missing.join(', ') : missing.length}` : '') + (line ? '' : ' · no entry-cost line'));
    if (names && line) console.log('    ' + line.trim());
    if (!okRun) { bad++; keep = true; }
  } finally {
    const after = [git(src, 'rev-parse', 'HEAD').stdout.trim(), git(src, 'status', '--porcelain').stdout];
    if (after[0] !== before[0] || after[1] !== before[1]) console.log(`note ${tag}: the source changed during the run (a live session?) — HEAD or status differ`);
    if (keep) console.log(`    kept: ${dir}`); else rmSync(dir, { recursive: true, force: true });
  }
});
console.log((bad ? `❌ ${bad} deployment(s) with step-1 documents the line does not count` : '✅ the entry-cost line counts every step-1 document on disk')
  + (skipped ? ` · ${skipped} skipped (INCOMPLETE deployment)` : ''));
process.exit(bad ? 1 : 0);
