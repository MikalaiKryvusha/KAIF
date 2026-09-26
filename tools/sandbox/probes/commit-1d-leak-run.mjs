// tools/sandbox/probes/commit-1d-leak-run.mjs — a PROBE (not a polygon suite): the FUNCTIONAL RUN of pre-flight 1d of tools/commit.mjs on
// the user's own path — a commit (2.8, epic VO, step VO4; finding 5 of the VO4 judge: the leak axis of the snapshot generator ran only
// when the generator ran, and the leak of 19e19ff — two non-public phrases of the owner in NEW files — reached origin by a commit). In a
// THROWAWAY detached worktree of this repository at HEAD it puts the tools under test (tools/commit.mjs, tools/stylometry-snapshot.mjs
// from the working tree) and the ignored private list, takes ONE span the snapshot collapses (the generator's own `--report`, written
// to the OS temp dir, never printed), and commits with --no-push three times:
//   A — the span in a NEW file (the form of 19e19ff) → expected: refused, HEAD unchanged;
//   B — the span only in the COMMIT MESSAGE → expected: refused, HEAD unchanged;
//   C — a clean new file and message (the control: the gate must not stop everything) → expected: committed, HEAD moves.
// The tool's output is checked to carry no span text (the axis names a span by sha). The worktree is removed at the end.
// usage: node tools/sandbox/probes/commit-1d-leak-run.mjs      Needs the owner's private voice core on this machine — without it the
// axis is SKIPPED by design and the probe says so (exit 2).
// [TESTED: 2026-09-26 03:00:05 +03:00 · the identity now travels in the environment of the probe's own calls (bugs/124): A and B refused,
//  C committed — and after the run `git config --local --list` of the repository carries no user.* (0)]
// [TESTED: 2026-09-25 17:07 +03:00 · session 74: A — refused by 1d, HEAD unchanged; B — refused; C — committed; no span text in the output;
//  report testcases/reports/2026-09-25_vo4-epic-judge-fixes.md]
import { readFileSync, writeFileSync, mkdirSync, cpSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const tmp = mkdtempSync(join(tmpdir(), 'kaif-leak-1d-'));
const wt = join(tmp, 'wt');
const gitR = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
// the probe's identity lives in the ENVIRONMENT of its own calls (bugs/124): a linked worktree shares .git/config with the repository,
// and `git config user.*` here once rewrote the owner's identity — 31 commits went to origin as «probe» before a judge noticed
const ID_ENV = { ...process.env, GIT_AUTHOR_NAME: 'probe', GIT_AUTHOR_EMAIL: 'probe@example.invalid', GIT_COMMITTER_NAME: 'probe', GIT_COMMITTER_EMAIL: 'probe@example.invalid' };
const git = (...a) => execFileSync('git', a, { cwd: wt, encoding: 'utf8', env: ID_ENV }).trim();
const node = (args) => { try { return { code: 0, out: execFileSync(process.execPath, args, { cwd: wt, encoding: 'utf8', stdio: 'pipe', maxBuffer: 1 << 26, env: ID_ENV }) }; } catch (e) { return { code: e.status, out: String(e.stdout || '') + String(e.stderr || '') }; } };
let bad = 0;
const say = (good, text) => { if (!good) bad++; console.log(`${good ? 'OK ' : 'BAD'} ${text}`); };
try {
  gitR('worktree', 'add', '--detach', '--quiet', wt, 'HEAD');
  for (const f of ['tools/commit.mjs', 'tools/stylometry-snapshot.mjs']) cpSync(join(REPO, f), join(wt, f));
  if (existsSync(join(REPO, '.kaif', 'private-names.json'))) cpSync(join(REPO, '.kaif', 'private-names.json'), join(wt, '.kaif', 'private-names.json'));
  git('add', 'tools/commit.mjs', 'tools/stylometry-snapshot.mjs');
  git('commit', '-q', '--allow-empty', '-m', 'probe: tools under test');   // the tools may equal HEAD — never «nothing to commit» (SC4 F12)
  const report = join(tmp, 'spans.txt');
  const g = node(['tools/stylometry-snapshot.mjs', '--check', '--report', report]);
  if (!existsSync(report)) { console.log(`no span report — is the owner's private core on this machine? generator exit ${g.code} (exit 2)`); process.exit(2); }
  const span = (readFileSync(report, 'utf8').match(/^«([^»]+)»$/gm) || []).map((l) => l.slice(1, -1)).find((s) => s.trim().split(/\s+/).length >= 3);
  if (!span) { console.log('the report carries no span of three words or more — nothing to plant (exit 2)'); process.exit(2); }
  console.log(`a collapsed span of ${span.trim().split(/\s+/).length} words taken from the generator's report (text not printed)`);
  mkdirSync(join(wt, 'notes'), { recursive: true });
  const commit = (file, body, message) => {
    writeFileSync(join(wt, 'notes', file), body);
    writeFileSync(join(tmp, 'msg.txt'), message);
    const before = git('rev-parse', 'HEAD');
    const r = node(['tools/commit.mjs', '--msg-file', join(tmp, 'msg.txt'), '--only', `notes/${file}`, '--no-push']);
    const moved = git('rev-parse', 'HEAD') !== before;
    if (!moved) { try { git('reset', '-q'); } catch { /* nothing staged */ } rmSync(join(wt, 'notes', file), { force: true }); }
    return { ...r, moved, printed: r.out.includes(span) };
  };
  const A = commit('a.md', `# Notes\n\nThe owner once wrote: ${span}.\n`, 'docs: notes a\n');
  say(A.code !== 0 && !A.moved && /преполётом 1d/.test(A.out) && !A.printed, `A — the span in a NEW file: refused by 1d (exit ${A.code}), HEAD ${A.moved ? 'MOVED' : 'unchanged'}, span text in the output: ${A.printed ? 'YES' : 'no'}`);
  const B = commit('b.md', '# Notes\n\nNothing private here.\n', `docs: notes b — quoting ${span}\n`);
  say(B.code !== 0 && !B.moved && /преполётом 1d/.test(B.out) && !B.printed, `B — the span only in the commit message: refused by 1d (exit ${B.code}), HEAD ${B.moved ? 'MOVED' : 'unchanged'}, span text in the output: ${B.printed ? 'YES' : 'no'}`);
  const C = commit('c.md', '# Notes\n\nNothing private here.\n', 'docs: notes c\n');
  say(C.code === 0 && C.moved && /ось утечки: ни одна/.test(C.out), `C — clean file and message (control): committed (exit ${C.code}), HEAD ${C.moved ? 'moved' : 'UNCHANGED'}, the axis line green`);
  for (const l of A.out.split(/\r?\n/).filter((l) => /ось утечки|1d/.test(l))) console.log('  A: ' + l.slice(0, 180));
} finally {
  try { gitR('worktree', 'remove', '--force', wt); } catch { /* already gone */ }
  try { gitR('worktree', 'prune'); } catch { /* nothing */ }
  rmSync(tmp, { recursive: true, force: true });
}
console.log(bad ? `\n✖ ${bad} BAD` : '\n✅ pre-flight 1d stops a non-public phrase in a new file and in the message, lets a clean commit through, prints no phrase');
process.exit(bad ? 1 : 0);
