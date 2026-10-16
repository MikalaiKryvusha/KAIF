// tools/sandbox/probes/ut5-field-check-lines.mjs — a PROBE (not a polygon suite): the functional run of step UT5 (2.9, epic UT — the
// reference knows every line `check` prints). The path of a field agent: `check` of THIS build runs over a real deployment, prints its
// lines, and the agent looks each one up in the `check` entry of the reference the update delivers (framework/KAIF_REFERENCE.md §10.7).
// For every deployment named: a git CLONE in a temporary folder (the source is only read — HEAD and `git status` compared before and
// after), `node dist/KAIF-CORE.mjs check` there, both streams read (EXP-0181), every ⚠ / ✖ / ℹ line matched to a pair of
// tools/check-line-words.json (the fragment up to its first `${`) and the pair's word looked up in the entry. A printed line with no pair,
// or with a word the entry lacks, is BAD. Each distinct line is printed for reading. Deployments are labelled #1…#N, never by name.
// usage: node tools/sandbox/probes/ut5-field-check-lines.mjs <deployment> … [--keep]
// [TESTED: 2026-10-16 14:29:29 → 14:29:56 +03:00 · «ALL OK — 38 printed line(s) over 11 deployment(s)»; the first run (14:27:15) was
//  7 BAD — the closing «✖ INCOMPLETE: N artifacts missing», printed by die(), sat outside the guard's scan; fixed; report
//  testcases/reports/2026-10-16_ut5-check-lines-known.md]
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CORE = join(REPO, 'dist', 'KAIF-CORE.mjs');
const DATA = JSON.parse(readFileSync(join(REPO, 'tools', 'check-line-words.json'), 'utf8'));
const RUN_TIMEOUT_MS = 180000;   // method constant: `check` over a large field tree takes seconds; a hung one must not hang the probe
const LINE_SHOWN = 170;          // method constant: characters of a printed line quoted for reading
const ref = readFileSync(join(REPO, 'framework', 'KAIF_REFERENCE.md'), 'utf8').replace(/\r\n/g, '\n');
const s = ref.indexOf('· `check` ('), e = s < 0 ? -1 : ref.indexOf(' · `version`', s);
if (s < 0 || e < 0) { console.log('BAD: the reference carries no `check` entry'); process.exit(1); }
const entry = ref.slice(s, e).replace(/\s+/g, ' ');
const pairs = DATA.pairs.map((p) => ({ ...p, frag: p.line.split('${')[0] }));
const srcs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!srcs.length) { console.log('usage: node tools/sandbox/probes/ut5-field-check-lines.mjs <deployment> … [--keep]'); process.exit(2); }

const quiet = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };
const git = (cwd, args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: quiet });
const state = (d) => git(d, ['rev-parse', 'HEAD']).stdout.trim() + '\n' + git(d, ['status', '--porcelain']).stdout;
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-ut5-field-'));
let bad = 0, total = 0;
srcs.forEach((src, i) => {
  const label = `#${i + 1}`;
  const before = state(src);
  const d = join(ROOT, String(i + 1));
  const c = git(ROOT, ['clone', '--no-hardlinks', '-q', src, d]);
  if (c.status !== 0) { bad++; console.log(`BAD ${label}: the clone failed — ${String(c.stderr).trim().slice(0, 200)}`); return; }
  const r = spawnSync(process.execPath, [CORE, 'check'], { cwd: d, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, env: { ...quiet, KAIF_VOICE_TOOL: '' } });
  if (r.error) { bad++; console.log(`BAD ${label}: check DIED (${r.error.message})`); return; }
  const lines = (String(r.stdout || '') + '\n' + String(r.stderr || '')).split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[⚠✖ℹ] /.test(l));
  let unknown = 0;
  console.log(`${label}: check exit ${r.status}, ${lines.length} line(s) ⚠/✖/ℹ`);
  for (const l of lines) {
    total++;
    const p = pairs.find((x) => l.includes(x.frag));
    const known = p && entry.includes(p.word);
    if (!known) unknown++;
    console.log(`  ${known ? 'ok ' : 'BAD'} ${p ? `[${p.word}]` : '[no pair]'} ${l.slice(0, LINE_SHOWN)}`);
  }
  if (unknown) bad++;
  if (state(src) !== before) { bad++; console.log(`BAD ${label}: the SOURCE changed during the run (HEAD or git status)`); }
});
if (process.argv.includes('--keep') || bad) console.log(`clones kept: ${ROOT} (they hold the owner's projects — remove after reading)`);
else rmSync(ROOT, { recursive: true, force: true });
console.log(bad ? `${bad} BAD` : `ALL OK — ${total} printed line(s) over ${srcs.length} deployment(s), each found in the check entry of §10.7`);
process.exit(bad ? 1 : 0);
