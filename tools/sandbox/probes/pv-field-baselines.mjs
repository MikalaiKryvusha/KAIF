// tools/sandbox/probes/pv-field-baselines.mjs — a PROBE (not a polygon suite): the functional run of epic PV (2.9, criterion 19) on the
// REAL state of field deployments. For each deployment: a git CLONE in a temporary folder, plus the root *.md the source keeps but git
// ignores (a clone never has them — they are copied in, the source is only read: HEAD and `git status` compared before and after); then
// the authorship linter of v2.8 (from the tag) and of this build run `check` over the same tree, and this build writes the baseline.
// Judged: this build does not read an ignored root file (v2.8 does — named) · the deployment's committed baseline reads as before (the
// same debt; nothing recorded is lost on the first closing after the update) · after this build's write the baseline holds no text and a
// second `check` is green with the same debt. Deployments are labelled #1…#N, never by name; texts of findings are never printed.
// usage: node tools/sandbox/probes/pv-field-baselines.mjs <deployment> … [--keep]
// [TESTED: 2026-10-16 14:48:20 → 14:49:11 +03:00 · «ALL OK — 11 deployment(s)»: five carried an ignored root *.md that v2.8 reads and
//  this build skips; every committed baseline read as the same debt; after the write fingerprints and counts only; report
//  testcases/reports/2026-10-16_pv-private-stays-out.md]
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const NEW = join(REPO, 'framework', 'tools', 'kaif-attribution-lint.mjs');
const BL = '.kaif/attribution-lint.baseline.json';
const RUN_TIMEOUT_MS = 180000;   // method constant: the linter over a large field tree takes seconds
const srcs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!srcs.length) { console.log('usage: node tools/sandbox/probes/pv-field-baselines.mjs <deployment> … [--keep]'); process.exit(2); }
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-pv-field-'));
const old = spawnSync('git', ['show', 'v2.8:framework/tools/kaif-attribution-lint.mjs'], { cwd: REPO, encoding: 'utf8' });
const OLD = join(ROOT, 'v28.mjs'); writeFileSync(OLD, old.stdout);
const quiet = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };
const git = (cwd, args) => spawnSync('git', args, { cwd, encoding: 'utf8', env: quiet });
const state = (d) => git(d, ['rev-parse', 'HEAD']).stdout.trim() + '\n' + git(d, ['status', '--porcelain']).stdout;
const lint = (mod, d, args = []) => { const r = spawnSync(process.execPath, [mod, 'check', ...args], { cwd: d, encoding: 'utf8', timeout: RUN_TIMEOUT_MS }); return { code: r.status, out: String(r.stdout || '') + String(r.stderr || '') }; };
const summary = (out) => { const m = /(\d+) file\(s\) scanned, new (\d+)(?: · debt (\d+))?|(\d+) NEW finding\(s\) in (\d+) file\(s\)(?: · debt (\d+))?/.exec(out); return m ? { scanned: +(m[1] || m[5]), fresh: +(m[2] || m[4] || 0), debt: +(m[3] || m[6] || 0) } : null; };
let bad = 0;
const say = (ok, line) => { if (!ok) bad++; console.log(`${ok ? 'OK ' : 'BAD'} ${line}`); };
srcs.forEach((src, i) => {
  const L = `#${i + 1}`;
  const before = state(src);
  const d = join(ROOT, String(i + 1));
  if (git(ROOT, ['clone', '--no-hardlinks', '-q', src, d]).status !== 0) { say(false, `${L}: clone failed`); return; }
  const hidden = readdirSync(src).filter((n) => /\.md$/i.test(n) && git(src, ['check-ignore', '-q', n]).status === 0);
  for (const n of hidden) copyFileSync(join(src, n), join(d, n));
  const hadBase = existsSync(join(d, BL));
  const o = lint(OLD, d), n0 = lint(NEW, d);
  const so = summary(o.out), sn = summary(n0.out);
  console.log(`${L}: hidden root *.md ${hidden.length} · committed baseline ${hadBase ? 'yes' : 'no'} · v2.8 ${so ? `${so.scanned} files, new ${so.fresh}, debt ${so.debt}` : 'no summary'} · this build ${sn ? `${sn.scanned} files, new ${sn.fresh}, debt ${sn.debt}` : 'no summary'}`);
  if (!so || !sn) { say(false, `${L}: a linter printed no summary line`); return; }
  say(sn.scanned === so.scanned - hidden.length, `${L}: this build skips exactly the ${hidden.length} ignored root file(s) v2.8 reads (${so.scanned} → ${sn.scanned})`);
  const oldHits = hidden.filter((h) => o.out.includes(h + ':')), newHits = hidden.filter((h) => n0.out.includes(h + ':'));
  if (oldHits.length) console.log(`    v2.8 names findings in ${oldHits.length} ignored root file(s) — the leak of #111 on the real state`);
  say(newHits.length === 0, `${L}: this build names no finding in an ignored root file`);
  if (hadBase) say(sn.debt + sn.fresh <= so.debt + so.fresh && sn.fresh <= so.fresh, `${L}: the committed baseline reads as before — debt ${so.debt} → ${sn.debt}, new ${so.fresh} → ${sn.fresh} (only ignored-file findings may leave)`);
  const w = lint(NEW, d, ['--write-baseline', ...(sn.fresh ? ['--adopt-new'] : [])]);
  const base = existsSync(join(d, BL)) ? readFileSync(join(d, BL), 'utf8') : '';
  let entries = {}; try { entries = JSON.parse(base).entries || {}; } catch { entries = null; }
  say(w.code === 0 && entries && Object.values(entries).every((v) => typeof v === 'number'), `${L}: after the write the baseline holds fingerprints and counts only (${entries ? Object.keys(entries).length : '?'} entries)`);
  const n1 = summary(lint(NEW, d).out);
  say(!!n1 && n1.fresh === 0 && n1.debt === sn.debt + sn.fresh, `${L}: a second check is green with the same debt (${n1 ? n1.debt : '?'})`);
  if (state(src) !== before) console.log(`    note ${L}: the SOURCE changed during the run (HEAD or git status) — a live session there; this probe writes only inside its clone`);
});
if (process.argv.includes('--keep') || bad) console.log(`kept: ${ROOT} (clones of the owner's projects — remove after reading)`); else rmSync(ROOT, { recursive: true, force: true });
console.log(bad ? `${bad} BAD` : `ALL OK — ${srcs.length} deployment(s)`);
process.exit(bad ? 1 : 0);
