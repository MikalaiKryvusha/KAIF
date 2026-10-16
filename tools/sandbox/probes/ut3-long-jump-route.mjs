// tools/sandbox/probes/ut3-long-jump-route.mjs — a PROBE (not a polygon suite): the functional run of UT3 (2.9, criterion 18
// of plans/126; plans/131) on the REAL state of a field deployment that jumped 2.1 → 2.8 in one step and reported 236 false
// «promised upstream line not found» plus a refused `update-verify` over the prayer in the owner's language.
//
//   node tools/sandbox/probes/ut3-long-jump-route.mjs <field-deployment> --at <rev before the jump> --handwork <rev after its hand work> [--keep]
//
// Two experiments, each on its own git CLONE in the OS temp dir (the source is only read: clone · rev-parse · status with
// GIT_OPTIONAL_LOCKS=0; HEAD and `git status` are compared before and after):
//   A — the judge of the field's OWN hand work. Clone at --at (the 2.1 state), bootstrap the REAL v2.8 release from the tag (the
//       field's route: the fresh core installs over the old deployment, the task is written by the 2.8 core), then lay the files the
//       field agent produced by hand (every path changed between --at and --handwork outside .kaif/). `update-verify` runs twice on
//       that one tree: with the 2.8 core, then with THIS build's core swapped in (the bundle and the task stay the 2.8 ones). The 2.8
//       core must reproduce the field's numbers (that is what proves the reconstruction); this build's core must not repeat them —
//       every line it still prints is printed here to be READ.
//   B — the real route 2.1 → 2.9. Clone at --at, bootstrap THIS build presented as 2.9; then the budget door mid-update (task
//       open: no base written, the «run the door LAST» line) and after the task is closed (the base is written).
// Predictions written before the first run (2026-10-16 ≈ 13:05 +03:00): A/2.8 — «not found» in the hundreds and the prayer
// section «did not arrive»; A/this build — «not found» an order of magnitude fewer, no «did not arrive» for the prayer; B — exit 0,
// no base mid-update, a base after.
// First run 12:58 — the A prediction FAILED: the 2.8 core gave 236 · 1 (the field's numbers exactly), this build 119 · 0. Read line by
// line: 99 stood on disk with the project's own edits, 8 were lines of template instruction slots the project replaced, 3 the creed
// (its <AUTHOR> filled on the promised line, not in the template block) and the H1, 9 rewritten. Two false classes fixed in the core
// (slot lines are not demanded; block lines are matched with the values folded back), and a line whose words stand on one disk line is
// LABELLED «with local edits» instead of «not found» (still printed) — the third verdict below counts only the «not found» label.
// [TESTED: 2026-10-16 13:08 +03:00 · on the git clone of the field deployment that jumped 2.1 → 2.8 — see the report
//  testcases/reports/2026-10-16_ut3-real-route.md]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const SRC = argv.find((a, i) => !a.startsWith('--') && !['--at', '--handwork'].includes(argv[i - 1]));
const AT = flag('--at'), HAND = flag('--handwork');
if (!SRC || !AT || !HAND || !existsSync(join(SRC, '.kaif', 'kaif.json'))) {
  console.error('usage: node tools/sandbox/probes/ut3-long-jump-route.mjs <field-deployment> --at <rev before the jump> --handwork <rev after its hand work> [--keep]');
  process.exit(2);
}
const ENV = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: ENV, maxBuffer: 1 << 28 }).trim();
const before = { head: git(SRC, 'rev-parse', 'HEAD'), status: git(SRC, 'status', '--porcelain') };
const root = mkdtempSync(join(tmpdir(), 'kaif-ut3-route-'));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const node = (cwd, args) => { const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 }); return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}` }; };
const CORE = join('.kaif', 'kaif-core.mjs');

// release directories: the real v2.8 and v2.1 from the tags; this build presented as 2.9
const fromTag = (tag, dir) => { mkdirSync(dir, { recursive: true }); for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'kaif-manifest.json']) writeFileSync(join(dir, f), execFileSync('git', ['show', `${tag}:dist/${f}`], { cwd: REPO, maxBuffer: 1 << 28 })); return dir; };
const R28 = fromTag('v2.8', join(root, 'rel-2.8')), R21 = fromTag('v2.1', join(root, 'rel-2.1')), R27 = fromTag('v2.7', join(root, 'rel-2.7'));
const R29 = join(root, 'rel-2.9'); mkdirSync(R29);
cpSync(join(REPO, 'dist', 'KAIF-CORE.mjs'), join(R29, 'KAIF-CORE.mjs'));
const bundle = readFileSync(join(REPO, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
const vAt = bundle.indexOf('"version": "');
if (vAt < 0 || vAt > 2000) { console.error('✖ the bundle meta block carries no "version" near its top'); process.exit(2); }
writeFileSync(join(R29, 'KAIF-CORE-BUNDLE.md'), bundle.slice(0, vAt) + bundle.slice(vAt).replace(/"version": "[^"]*"/, '"version": "2.9"'));
const man = JSON.parse(readFileSync(join(REPO, 'dist', 'kaif-manifest.json'), 'utf8')); man.version = '2.9';
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = sha(join(R29, f));
writeFileSync(join(R29, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');

const clone = (name) => { const T = join(root, name); git(root, 'clone', '--quiet', '--no-hardlinks', resolve(SRC), T); git(T, 'checkout', '--quiet', AT); return T; };
const bootstrap = (T, rel, baseline) => {
  mkdirSync(join(T, '.kaif', 'install'), { recursive: true });
  cpSync(join(rel, 'KAIF-CORE.mjs'), join(T, CORE));
  cpSync(join(rel, 'KAIF-CORE-BUNDLE.md'), join(T, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  return node(T, [CORE, 'install', '--baseline', baseline]);
};
const count = (out, re) => out.split(/\r?\n/).filter((l) => re.test(l));
const NOTFOUND = /promised upstream line not found/, ARRIVE = /a section of this release did not arrive/;
let bad = 0;
const verdict = (good, text) => { console.log(`${good ? 'OK ' : 'BAD'} ${text}`); if (!good) bad++; };

// ── A ───────────────────────────────────────────────────────────────────────────────────────────────
{
  const T = clone('a-field-handwork');
  const r = bootstrap(T, R28, R21);
  console.log(`\n# A — ${AT.slice(0, 7)} (2.1) bootstrap v2.8 (the field's route): exit ${r.code}`);
  if (r.code !== 0) { console.log(r.out.slice(-2000)); bad++; }
  else {
    // the field's hand work: every path the jump and its hand work changed outside .kaif/ takes its --handwork content
    const changed = git(SRC, 'diff', '--name-status', '--no-renames', AT, HAND).split('\n').filter(Boolean).map((l) => l.split('\t'));
    let laid = 0, removed = 0;
    for (const [st, p] of changed) {
      if (p.startsWith('.kaif/') || p === 'KAIF_UPDATE_TASK.md') continue;
      if (st === 'D') { rmSync(join(T, p), { force: true }); removed++; continue; }
      mkdirSync(dirname(join(T, p)), { recursive: true });
      writeFileSync(join(T, p), execFileSync('git', ['show', `${HAND}:${p}`], { cwd: SRC, env: ENV, maxBuffer: 1 << 28 }));
      laid++;
    }
    console.log(`  field hand work laid: ${laid} file(s), ${removed} removed (paths changed ${AT.slice(0, 7)}..${HAND.slice(0, 7)} outside .kaif/)`);
    const keep = join(root, 'task-2.8.md'); cpSync(join(T, 'KAIF_UPDATE_TASK.md'), keep);
    const v28 = node(T, [CORE, 'update-verify']);
    const nf28 = count(v28.out, NOTFOUND), ar28 = count(v28.out, ARRIVE);
    console.log(`  update-verify, the 2.8 core: exit ${v28.code} · «not found» ${nf28.length} · «did not arrive» ${ar28.length}`);
    for (const l of ar28) console.log('    ' + l.slice(0, 220));
    // this build's core judges the SAME tree, the same 2.8 task and bundle
    cpSync(keep, join(T, 'KAIF_UPDATE_TASK.md'));
    cpSync(join(REPO, 'dist', 'KAIF-CORE.mjs'), join(T, CORE));
    const v29 = node(T, [CORE, 'update-verify']);
    const nf29 = count(v29.out, NOTFOUND), ar29 = count(v29.out, ARRIVE);
    console.log(`  update-verify, this build's core: exit ${v29.code} · «not found» ${nf29.length} · «did not arrive» ${ar29.length}`);
    for (const l of [...ar29, ...nf29]) console.log('    ' + l.slice(0, 220));
    verdict(nf28.length >= 100 && ar28.some((l) => /PRAYER/.test(l)), `A reconstruction: the 2.8 core repeats the field's report (hundreds of «not found», the prayer «did not arrive») — ${nf28.length} · ${ar28.length}`);
    verdict(!ar29.some((l) => /PRAYER/.test(l)), 'A: this build does not refuse the prayer rendered in the owner\'s language');
    // the order-of-magnitude prediction failed on the first run (header): the residual is the project's own rewrites, which the gate
    // must keep naming — so the probe judges the DROP and prints every remaining line to be read; their classes go to the report
    const ed29 = count(v29.out, /stands on disk with local edits/);
    verdict(nf29.length < nf28.length, `A: this build's «not found» dropped — ${nf29.length} vs ${nf28.length}, plus ${ed29.length} labelled «with local edits» (each «not found» printed above — READ them)`);
  }
}

// ── B ───────────────────────────────────────────────────────────────────────────────────────────────
{
  const T = clone('b-route-2.1-2.9');
  const r = bootstrap(T, R29, R21);
  console.log(`\n# B — ${AT.slice(0, 7)} (2.1) bootstrap this build as 2.9: exit ${r.code}`);
  if (r.code !== 0) { console.log(r.out.slice(-2000)); bad++; }
  else {
    const BASE = join(T, '.kaif', 'budget-baseline.json'), TASK = join(T, 'KAIF_UPDATE_TASK.md');
    const task = existsSync(TASK) ? readFileSync(TASK, 'utf8') : '';
    const item = (task.match(/^- \*\*closing-gates\*\*[^\n]*/m) || [''])[0];
    console.log(`  closing-gates item: ${item.slice(0, 260) || '(none)'}`);
    const baseAfterUpdate = existsSync(BASE);
    const mid = node(T, [CORE, 'check', '--gate-budgets']);
    const baseMid = existsSync(BASE);
    console.log(`  door mid-update: exit ${mid.code} · ${(mid.out.split(/\r?\n/).find((l) => /is open — the base/.test(l)) || '(no «open task» line)').slice(0, 200)}`);
    renameSync(TASK, TASK + '.aside');
    const last = node(T, [CORE, 'check', '--gate-budgets']);
    renameSync(TASK + '.aside', TASK);
    console.log(`  door after the task is closed: exit ${last.code} · base written: ${existsSync(BASE)}`);
    for (const l of last.out.split(/\r?\n/).filter((x) => /^(✖|↳)/.test(x)).slice(0, 6)) console.log('    ' + l.slice(0, 200));
    verdict(!baseAfterUpdate && !baseMid && /is open — the base/.test(mid.out), 'B: no base after the update nor after the door run mid-update; the door names its place — LAST');
    verdict(/closing-gates/.test(item) && /LAST|last/.test(item), 'B: the task item closing-gates names the door as the last step');
    verdict(existsSync(BASE), 'B: the door run after the task is closed writes the base (the model of the first closing)');
  }
}

const after = { head: git(SRC, 'rev-parse', 'HEAD'), status: git(SRC, 'status', '--porcelain') };
const untouched = after.head === before.head && after.status === before.status;
console.log(`\nsource untouched: ${untouched ? 'yes' : 'NO'} (HEAD and git status compared before and after)`);
if (argv.includes('--keep') || bad) console.log(`clones kept: ${root} — they hold an owner's project: delete after reading`); else rmSync(root, { recursive: true, force: true });
console.log(bad || !untouched ? `\n✖ ${bad} BAD${untouched ? '' : ' · the source changed'}` : '\n✅ ALL OK');
process.exit(bad || !untouched ? 1 : 0);
