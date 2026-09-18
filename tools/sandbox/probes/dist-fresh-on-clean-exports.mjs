// tools/sandbox/probes/dist-fresh-on-clean-exports.mjs — a PROBE (not a polygon suite): the freshness fingerprint of `dist/`
// (tools/lib/source-tree-sha.mjs) must reproduce from the COMMIT, not from one working tree. It reads the gate in three places
// with NO rebuild: this working tree · a `git archive HEAD` export (repository bytes) · a detached worktree checkout (what a
// clone gets under core.autocrlf) — all three must say "fresh" with ONE fingerprint. Born from two defects of that gate in one
// day (2026-09-18, epic LP 2.7): hashed as-on-disk, the committed fingerprint reproduced in no other tree (the origin's tree
// held 153 LF · 42 CRLF · 5 mixed inputs), and a clone, a CI job and every subagent worktree were refused by the polygon.
// Run it after touching the gate, the builder's input set or .gitattributes:   node tools/sandbox/probes/dist-fresh-on-clean-exports.mjs
// Needs a COMMITTED tree (it exports HEAD): uncommitted source edits make the two exports disagree with the working tree by design.
// Raises no window and no sound; temporary exports live in the OS temp dir and are removed, the worktree is unregistered.
// [TESTED: 2026-09-18 11:06 +03:00 · run on the origin at HEAD d5e2e65 — working tree, git-archive export and clean worktree
//  all "fresh", one fingerprint ed07a4d6f238…; before the EOL normalisation the judge's clean checkout read "stale" —
//  testcases/reports/2026-09-18_contour-close-survive.md, runs 28–30]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const git = (args, opts = {}) => execFileSync('git', args, { cwd: REPO, maxBuffer: 1 << 30, ...opts });
// bsdtar by absolute path on Windows: GNU tar of git-bash reads `C:` as a remote host (HOUSE_RULES.md §4, the dossier)
const TAR = process.platform === 'win32' ? join(process.env.SystemRoot || 'C:/Windows', 'System32', 'tar.exe') : 'tar';

/** The gate's answer and fingerprint for the tree at `dir`, computed by THAT tree's own copy of the library. */
function probe(dir) {
  const lib = pathToFileURL(join(dir, 'tools', 'lib', 'source-tree-sha.mjs')).href;
  const code = `import(${JSON.stringify(lib)}).then((m) => { const d = ${JSON.stringify(dir)}; ` +
    `console.log(JSON.stringify({ ...m.distFreshness(d), sha: m.sourceTreeSha(d).sha256.slice(0, 12) })); })`;
  return JSON.parse(execFileSync(process.execPath, ['-e', code], { encoding: 'utf8' }).trim());
}

const head = git(['rev-parse', '--short', 'HEAD']).toString().trim();
const dirty = git(['status', '--short', '--', 'framework', 'tools/build-framework.mjs', 'tools/module-map-lib.mjs', 'version.json', 'dist']).toString().trim();
if (dirty) console.log('⚠ uncommitted changes in the gate\'s inputs or in dist/ — the exports of HEAD will legitimately differ from this tree:\n' + dirty);

const results = [['working tree', probe(REPO)]];
const A = mkdtempSync(join(tmpdir(), 'kaif-sha-archive-'));
const W = mkdtempSync(join(tmpdir(), 'kaif-sha-worktree-'));
rmSync(W, { recursive: true, force: true }); // `git worktree add` wants to create the directory itself
let worktreeAdded = false;
try {
  const tarball = join(A, 'head.tar');
  writeFileSync(tarball, git(['archive', '--format=tar', 'HEAD']));
  execFileSync(TAR, ['-xf', tarball, '-C', A], { stdio: 'pipe' });
  results.push(['git archive HEAD', probe(A)]);
  git(['worktree', 'add', '--detach', W, 'HEAD'], { stdio: 'pipe' }); worktreeAdded = true;
  results.push(['clean worktree', probe(W)]);
} finally {
  if (worktreeAdded) { try { git(['worktree', 'remove', '--force', W], { stdio: 'pipe' }); } catch { /* reported below by git worktree list */ } }
  rmSync(A, { recursive: true, force: true });
}

console.log('HEAD ' + head);
for (const [name, r] of results) console.log(`${r.fresh ? '✅' : '❌'} ${name.padEnd(16)} fresh=${r.fresh} · fingerprint ${r.sha}… · ${r.reason}`);
const shas = new Set(results.map(([, r]) => r.sha));
const ok = results.every(([, r]) => r.fresh) && shas.size === 1;
console.log(ok ? '✅ the fingerprint reproduces from the commit: three trees, one fingerprint, no rebuild'
  : '❌ the fingerprint does NOT reproduce from the commit — a clone or a subagent worktree will be refused by the polygon');
process.exitCode = ok ? 0 : 1;
