// tools/sandbox/probes/field-install-summary.mjs — a PROBE (not a polygon suite): the functional run of two install-summary lines of 2.9
// (plans/132 «Следом»; origin tickets #145 §2.3 · #143 §2.1) on the REAL pre-KAIF state of the two field projects that reported them:
//   <tribit> — a git repository whose own pre-KAIF .gitignore line `tools/` hid the shipped `.kaif/tools/` (#145): it is CLONED into the
//              OS temp folder and checked out at <tribit-commit> (the last commit before `chore: deploy KAIF`) — the owner's world as the
//              install met it; the summary of `install` must name the hidden `.kaif/tools/…` files with the rule and the cure.
//   <kartun> + <kartun-commit> — a greenfield project that held only the owner's GOAL.md and NO git (#143): the GOAL.md of that commit is
//              exported into an empty folder (no `.git`); the summary must say `git init` and the order of the commits.
// Each subject is installed by THIS build's core (`install --agents claude-code` — the step the loader hands over to). The sources are
// only read (GIT_OPTIONAL_LOCKS=0; HEAD and `git status --porcelain` compared before and after). KAIF_DIST — the seam: the build before
// the fix must be red on both lines. Git identity — by the environment only (bugs/124). The run folder is removed on OK, kept on BAD.
// usage: node tools/sandbox/probes/field-install-summary.mjs <tribit> <tribit-commit> <kartun> <kartun-commit>
// [TESTED: 2026-10-16 11:16:52 → 11:16:54 · this build, the two field projects of the origin machine at their pre-KAIF commits: ALL OK —
//  the summary names 13 hidden .kaif/tools/ files (the ticket's own count) and says `git init` for the greenfield GOAL.md; against the
//  build before the fix (KAIF_DIST = dist of d5342b3, 11:16:54 → 11:16:56) — 3 BAD on exactly those lines; sources untouched;
//  report testcases/reports/2026-10-16_field-hook-complaints-rest.md]
import { writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const [TRIBIT, TRIBIT_AT, KARTUN, KARTUN_AT] = process.argv.slice(2);
if (!KARTUN_AT) { console.log('usage: node tools/sandbox/probes/field-install-summary.mjs <tribit> <tribit-commit> <kartun> <kartun-commit>'); process.exit(2); }
const RUN_TIMEOUT_MS = 300000;
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-field-summary-'));
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const git = (cwd, ...a) => { const r = spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8', maxBuffer: 1 << 26 }); return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() }; };
const install = (P) => {
  mkdirSync(join(P, '.kaif', 'install'), { recursive: true });
  copyFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(P, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copyFileSync(join(DIST, 'KAIF-CORE.mjs'), join(P, '.kaif', 'kaif-core.mjs'));
  const r = spawnSync(process.execPath, [join(P, '.kaif', 'kaif-core.mjs'), 'install', '--agents', 'claude-code'], { cwd: P, env: ENV, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return { code: r.status, all: (r.stdout || '') + (r.stderr || '') };
};
const sourceState = (src) => `${git(src, 'rev-parse', 'HEAD').out} | ${git(src, 'status', '--porcelain').out}`;
const before = { tribit: sourceState(TRIBIT), kartun: sourceState(KARTUN) };

// ---- #145: the live project's own `tools/` line at the commit before the deploy
const T = join(ROOT, 'tribit');
const cl = git(ROOT, 'clone', '-q', '--no-checkout', resolve(TRIBIT), T);
const co = git(T, 'checkout', '-q', TRIBIT_AT);
const gi = existsSync(join(T, '.gitignore')) ? git(T, 'show', `${TRIBIT_AT}:.gitignore`).out : '';
say(cl.code === 0 && co.code === 0 && /^tools\/?$/m.test(gi), `#145 subject: a clone at ${TRIBIT_AT}, its own .gitignore carries the line «tools/»`);
let r = install(T);
const hidden = (r.all.match(/⚠ deployed artifact is git-ignored by \.gitignore:\d+ «tools\/?»: \.kaif\/tools\/[^\s]+/g) || []);
say(r.code === 0 && /⚠ \d+ deployed file\(s\) are git-ignored by this project's rules — the first commit would leave them out/.test(r.all) && hidden.length > 0,
    `#145: the install summary names ${hidden.length} hidden .kaif/tools/ file(s) with the rule «tools/» and the cure`);
const ignoredNow = git(T, 'check-ignore', '--no-index', '.kaif/tools/kaif-voice-lint.mjs').code === 0;
say(ignoredNow === (hidden.length > 0), `#145: git itself agrees — .kaif/tools/kaif-voice-lint.mjs is ${ignoredNow ? '' : 'NOT '}ignored in the clone`);

// ---- #143: the greenfield project — only the owner's GOAL.md, no git
const K = join(ROOT, 'kartun'); mkdirSync(K);
const goal = spawnSync('git', ['show', `${KARTUN_AT}:GOAL.md`], { cwd: KARTUN, env: ENV, maxBuffer: 1 << 26 });
writeFileSync(join(K, 'GOAL.md'), goal.stdout || '');
say(goal.status === 0 && (goal.stdout || []).length > 0 && !existsSync(join(K, '.git')) && git(K, 'rev-parse', '--is-inside-work-tree').out !== 'true',
    `#143 subject: the owner's GOAL.md of ${KARTUN_AT} (${(goal.stdout || []).length} bytes) in a folder with no git`);
r = install(K);
say(r.code === 0 && /⚠ this folder is not a git repository, and the deploy ends with a commit — run `git init` now; commit the owner's own files first/.test(r.all),
    '#143: the install summary says `git init` and the order of the commits');

// ---- the sources were only read
say(sourceState(TRIBIT) === before.tribit && sourceState(KARTUN) === before.kartun, 'the field projects are untouched (HEAD and git status equal before and after)');
console.log(bad ? `\nFAILED: ${bad} BAD — the run folder is kept: ${ROOT}` : '\nALL OK — both install-summary lines read on the real pre-KAIF state of the two field projects');
if (!bad) rmSync(ROOT, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
