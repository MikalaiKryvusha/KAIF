// tools/sandbox/probes/ut5-field-check-lines.mjs — a PROBE (not a polygon suite): the functional run of step UT5 (2.9, epic UT — the
// reference knows every line `check` prints). The path of a field agent: `check` of THIS build runs over a real deployment, prints its
// lines, and the agent looks each one up in the `check` entry of the reference the update delivers (framework/KAIF_REFERENCE.md §10.7).
// For every deployment named: a git CLONE in a temporary folder (the source is only read — HEAD and `git status` compared before and
// after), `node dist/KAIF-CORE.mjs check` there, both streams read (EXP-0181), every ⚠ / ✖ / ℹ line matched to a pair of
// tools/check-line-words.json (every fixed piece of the pair's line, between its `${…}`, in order — the most specific pair wins) and the
// pair's word looked up in the entry. A printed line with no pair,
// or with a word the entry lacks, is BAD. Each distinct line is printed for reading. Deployments are labelled #1…#N, never by name.
// usage: node tools/sandbox/probes/ut5-field-check-lines.mjs <deployment> … [--keep]
// [TESTED: 2026-10-16 14:29:29 → 14:29:56 +03:00 · «ALL OK — 38 printed line(s) over 11 deployment(s)»; the first run (14:27:15) was
//  7 BAD — the closing «✖ INCOMPLETE: N artifacts missing», printed by die(), sat outside the guard's scan; fixed; report
//  testcases/reports/2026-10-16_ut5-check-lines-known.md. Re-proved after the NT light judge's F2 (empty fragment): 2026-10-16 16:10 +03:00 ·
//  `--selftest` OK (the HEAD matcher paired the unknown line with pair 31) · eleven deployments: 56 lines, each with its own pair, none
//  «[no pair]»; «✖ INCOMPLETE» found its pair; one BAD — deployment #7's own session changed its tree during the run (source guard). Court RL E-F4
//  (unclosed `${` tail, word boundary): ≈ 2026-10-16 16:53 +03:00 · `--selftest` OK — 5 lines — report testcases/reports/2026-10-16_rl-court-fixes.md]
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
// light judge of epic NT, F2: a pair's line is the SOURCE literal, `${…}` kept; the printed line has them expanded. The first form of this
// probe matched the text up to the first `${` — a pair whose line OPENS with `${X}` (31, 37) had an empty fragment and matched every line,
// so an unknown line was never «[no pair]». Now every fixed piece of the pair must stand in the printed line in order; of several pairs
// that match, the one with the most fixed text wins; a pair with no fixed text at all stops the probe.
// court RL 2.9, E-F4: a pair's line may end in an UNCLOSED `${` (pair 27, «: own lines ${») — that tail is cut; a piece that opens with a
// letter must start a word («nor … found» is not a place inside «minor drift found»)
const pieces = (line) => line.replace(/\$\{[^}]*$/, '').split(/\$\{[^}]*\}/);
const piece = (s) => (/^\p{L}/u.test(s) ? '(?<![\\p{L}\\d])' : '') + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pairs = DATA.pairs.map((p) => ({ ...p, fixed: pieces(p.line).join('').length,
  re: new RegExp(pieces(p.line).map(piece).join('[\\s\\S]*?'), 'u') }));
const blind = pairs.filter((p) => !pieces(p.line).join('').trim());
if (blind.length) { console.log('BAD: pair(s) with no fixed text match every line — ' + blind.map((p) => p.line).join(' | ')); process.exit(1); }
const pairOf = (l) => pairs.filter((x) => x.re.test(l)).sort((a, b) => b.fixed - a.fixed)[0];
// --selftest: the matcher over three made-up printed lines, no clone — an unknown line must come out «[no pair]» (the empty-fragment
// matcher paired it with 31), and the two lines that open with an expanded `${…}` must find their own pairs
if (process.argv.includes('--selftest')) {
  const cases = [['⚠ zeta axis drifted somewhere unheard of', null], ['✖ .kaif/deploy-manifest.json is unreadable as JSON', 31],
    ['⚠ .kaif/budget-baseline.json is unreadable — the door stops', 37],
    ['⚠ STATUS.md: own lines 412 of budget ~300 (your text only)', 27], ['⚠ minor drift found in the hooks', null]];
  const fails = cases.filter(([l, i]) => (i === null ? pairOf(l) !== undefined : pairOf(l) !== pairs[i]));
  for (const [l, i] of fails) console.log(`BAD selftest: «${l}» → ${pairOf(l) ? '[' + pairOf(l).word + ']' : '[no pair]'}, expected ${i === null ? '[no pair]' : '[' + pairs[i].word + ']'}`);
  console.log(fails.length ? `${fails.length} BAD` : `selftest OK — ${cases.length} lines matched as expected (an unknown line has no pair)`);
  process.exit(fails.length ? 1 : 0);
}
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
    const p = pairOf(l);
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
