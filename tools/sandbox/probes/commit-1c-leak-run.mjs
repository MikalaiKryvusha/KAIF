// tools/sandbox/probes/commit-1c-leak-run.mjs — a PROBE (not a polygon suite): the FUNCTIONAL RUN of pre-flight 1c of tools/commit.mjs
// on the user's own path — a commit (2.8, epic CK, item CK6 "the leak" of plans/118; EXP-0159: a judge brief with private names went
// to origin in 290dbbb because 1c called the guard only for delivery paths). In a THROWAWAY git repository it assembles the commit
// tool under test, revert-guard, private-names-guard with its lib, version.json and the origin's private list (ignored there as
// here), plants ONE private name — taken from the list the way the guard reads it, never printed — into reports/KAIF_AUDIT/brief.md
// and commits exactly that file with --only and --no-push. Prints the tool's exit code and whether HEAD moved (names masked).
// usage: node tools/sandbox/probes/commit-1c-leak-run.mjs [<commit.mjs to test>]   (default: this repo's tools/commit.mjs)
//        the old condition: git show 5dab517:tools/commit.mjs > <tmp>/commit-old.mjs && node … <tmp>/commit-old.mjs
// Expected: the current tool REFUSES (exit 1, HEAD unchanged); a tool with the pre-2.8 condition commits the leak (HEAD moves).
// Needs .kaif/private-names.json (ignored by git): without it the guard judges nothing — the probe says so and exits 2.
// [TESTED: 2026-09-25 11:14 +03:00 · session 74: the current tool — exit 1, «HEAD did NOT move», the guard red and «✋ коммит
//  остановлен преполётом 1c»; the tool of 5dab517 — exit 0, «HEAD MOVED — the document was committed»; report
//  testcases/reports/2026-09-25_ck6-private-names-every-commit.md]
import { readFileSync, writeFileSync, mkdirSync, cpSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const tool = resolve(process.argv[2] || join(REPO, 'tools', 'commit.mjs'));
if (!existsSync(join(REPO, '.kaif', 'private-names.json'))) { console.log('no .kaif/private-names.json — the guard would judge nothing; the probe cannot plant a name (exit 2)'); process.exit(2); }
const dir = mkdtempSync(join(tmpdir(), 'kaif-leak-run-'));
const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' }).trim();
let verdict = 1;
try {
  git('init', '-q'); git('config', 'user.email', 'probe@example.invalid'); git('config', 'user.name', 'probe'); git('config', 'core.autocrlf', 'false');
  for (const d of ['tools/lib', '.kaif', 'reports/KAIF_AUDIT']) mkdirSync(join(dir, d), { recursive: true });
  cpSync(tool, join(dir, 'tools', 'commit.mjs'));
  for (const f of ['tools/revert-guard.mjs', 'tools/private-names-guard.mjs', 'tools/lib/temp-root.mjs', 'version.json', '.kaif/private-names.json']) cpSync(join(REPO, f), join(dir, f));
  writeFileSync(join(dir, '.gitignore'), '.kaif/private-names.json\n');
  git('add', '-A'); git('commit', '-q', '-m', 'base');
  const list = JSON.parse(readFileSync(join(dir, '.kaif', 'private-names.json'), 'utf8'));
  const name = Object.keys(list.names || {})[0];                      // the guard's own reading of the list (loadList)
  if (!name) throw new Error('the private list names nobody — nothing to plant');
  console.log(`zones the list declares: ${(list.scanned || []).length}; reports/KAIF_AUDIT among them: ${(list.scanned || []).some((z) => /KAIF_AUDIT/.test(z))}`);
  writeFileSync(join(dir, 'reports', 'KAIF_AUDIT', 'brief.md'), `# Brief\n\nThe field deployment ../${name} is read only.\n`);
  writeFileSync(join(dir, 'msg.txt'), 'docs: judge brief\n');
  const before = git('rev-parse', 'HEAD');
  let out = '', code = 0;
  try { out = execFileSync(process.execPath, ['tools/commit.mjs', '--msg-file', 'msg.txt', '--only', 'reports/KAIF_AUDIT/brief.md', '--no-push'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' }); }
  catch (e) { code = e.status; out = String(e.stdout || '') + String(e.stderr || ''); }
  const moved = git('rev-parse', 'HEAD') !== before;
  const mask = (s) => s.split(name).join('<private name>');
  console.log(`tool: ${tool}\nexit ${code} · HEAD ${moved ? 'MOVED — the document was committed' : 'did NOT move — nothing committed'}`);
  for (const l of mask(out).split(/\r?\n/).filter((l) => /private-names|1c|приватн|✋|committed/.test(l))) console.log('  ' + l.slice(0, 200));
  verdict = moved ? 1 : 0;                                            // 0 = the leak was stopped
} finally { rmSync(dir, { recursive: true, force: true }); }
process.exit(verdict);
