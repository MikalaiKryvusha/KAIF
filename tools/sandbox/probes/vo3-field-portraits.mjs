// tools/sandbox/probes/vo3-field-portraits.mjs — a PROBE (not a polygon suite): the functional run of step VO3 of plans/120 (2.8, epic
// VO; origin issue #103 — the owner's word: every project working by KAIF takes the new voice core on the 2.8 update, «не мержем, а
// заменой») over REAL field deployments, on BOTH update routes. The field deployment is only READ: each route clones its committed state
// into the OS temp dir; the source's HEAD and `git status` are compared before and after. The clone is updated from this repository's
// dist presented as the next release (--to, default 2.8), with the previous release's own artifacts as the old texts (hermetic).
//   route update    — the DEPLOYED (older) core writes the task, so it has no owner-voice-core item; the FRESH core's `checkpoint
//                     recheck` must refuse while the derived portrait is not the release snapshot (the hand-over), and pass after it;
//   route bootstrap — the fresh core writes the task: the owner-voice-core item must stand, and its checkpoint must refuse before the
//                     replacement and pass after it.
// The replacement is done the way the instruction says: the local part — the lines ABOVE the portrait's first `# ` heading (a project
// preamble) — is kept and this repository's snapshot follows it byte for byte (the release URL of a tag that does not exist yet is not
// fetched). `--foreign` also runs the update route over a clone whose portrait is replaced by another owner's: no refusal, no item,
// the file byte for byte as it was.
// usage: node tools/sandbox/probes/vo3-field-portraits.mjs <field-deployment-dir> [--from 2.7] [--to 2.8] [--foreign] [--keep]
// Needs a FRESH dist (rebuild first). Raises no window and no sound.
// [TESTED: 2026-09-25 15:55 +03:00 · session 74 over clones of three deployments: one with a local preamble (12 lines kept) and one genre
//  shell — every check OK on both routes, the foreign portrait untouched; the third deployment's portrait is untracked, the clone has none (the
//  probe's named gap); sources untouched; report testcases/reports/2026-09-25_vo3-portrait-replace.md]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const SRC = argv.find((a, i) => !a.startsWith('--') && !['--from', '--to'].includes(argv[i - 1]));
if (!SRC || !existsSync(join(SRC, '.kaif', 'kaif.json'))) {
  console.error('usage: node tools/sandbox/probes/vo3-field-portraits.mjs <field-deployment-dir> [--from 2.7] [--to 2.8] [--foreign] [--keep] — a KAIF deployment');
  process.exit(2);
}
const FROM = flag('--from', '2.7'), TO = flag('--to', '2.8');
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
const before = { head: git(SRC, 'rev-parse', 'HEAD'), status: git(SRC, 'status', '--porcelain') };
const root = mkdtempSync(join(tmpdir(), 'kaif-vo3-field-'));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const lfSha = (t) => createHash('sha256').update(String(t).replace(/\r\n/g, '\n'), 'utf8').digest('hex');
const REL = join(root, `rel-${TO}`), OLD = join(root, `rel-${FROM}`);
mkdirSync(REL, { recursive: true }); mkdirSync(OLD, { recursive: true });
cpSync(join(REPO, 'dist', 'KAIF-CORE.mjs'), join(REL, 'KAIF-CORE.mjs'));
const bundle = readFileSync(join(REPO, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
const vAt = bundle.indexOf('"version": "');
writeFileSync(join(REL, 'KAIF-CORE-BUNDLE.md'), bundle.slice(0, vAt) + bundle.slice(vAt).replace(/"version": "[^"]*"/, `"version": "${TO}"`));
const man = JSON.parse(readFileSync(join(REPO, 'dist', 'kaif-manifest.json'), 'utf8'));
man.version = TO;
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = sha(join(REL, f));
writeFileSync(join(REL, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'kaif-manifest.json'])
  writeFileSync(join(OLD, f), execFileSync('git', ['show', `v${FROM}:dist/${f}`], { cwd: REPO, maxBuffer: 1 << 28 }));
const SNAP = readFileSync(join(REPO, 'AUTHOR_STYLOMETRY.md'), 'utf8').replace(/\r\n/g, '\n');
const HEAD_LINE = SNAP.split('\n', 1)[0];

const node = (cwd, args) => { const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 }); return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}` }; };
const CORE = join('.kaif', 'kaif-core.mjs');
const P = 'AUTHOR_STYLOMETRY.md';
const replaceLikeTheInstruction = (T) => {   // keep the lines above the first `# ` heading (a local preamble), then the snapshot byte for byte
  const lines = readFileSync(join(T, P), 'utf8').replace(/\r\n/g, '\n').split('\n');
  const h = lines.findIndex((l) => l.startsWith('# '));
  const local = h > 0 ? lines.slice(0, h).join('\n') + '\n' : '';
  writeFileSync(join(T, P), local + SNAP);
  return local.split('\n').filter(Boolean).length;
};
let bad = 0;
const say = (good, text) => { if (!good) bad++; console.log(`${good ? 'OK ' : 'BAD'} ${text}`); };
const routes = ['update', 'bootstrap', ...(argv.includes('--foreign') ? ['foreign'] : [])];
for (const route of routes) {
  const T = join(root, `field-${route}`);
  git(root, 'clone', '--quiet', '--no-hardlinks', resolve(SRC), T);
  const hasPortrait = existsSync(join(T, P));
  if (route === 'foreign') writeFileSync(join(T, P), '# Portrait of another owner\n\nrule one of that owner\n');
  const was = hasPortrait || route === 'foreign' ? readFileSync(join(T, P), 'utf8') : null;
  let run;
  if (route === 'bootstrap') {
    mkdirSync(join(T, '.kaif', 'install'), { recursive: true });
    cpSync(join(REL, 'KAIF-CORE.mjs'), join(T, CORE));
    cpSync(join(REL, 'KAIF-CORE-BUNDLE.md'), join(T, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
    run = node(T, [CORE, 'install', '--baseline', OLD]);
  } else run = node(T, [CORE, 'update', '--source', REL, '--baseline', OLD]);
  console.log(`\n# ${SRC} (HEAD ${before.head.slice(0, 7)}) — route ${route}, ${FROM} → ${TO}: exit ${run.code}; portrait ${was ? (was.split('\n', 1)[0].slice(0, 70)) : 'none'}`);
  if (run.code !== 0) { console.log(run.out.slice(-2000)); bad++; continue; }
  const voiceLog = run.out.split(/\r?\n/).filter((l) => /voice portrait:/.test(l));
  for (const l of voiceLog) console.log(`   log: ${l.trim().slice(0, 170)}`);
  const task = existsSync(join(T, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(T, 'KAIF_UPDATE_TASK.md'), 'utf8') : '';
  const item = (task.match(/^- \*\*owner-voice-core\*\* — [^\n]*/m) || [''])[0];
  if (route === 'foreign') {
    const tick = node(T, [CORE, 'checkpoint', 'recheck']);
    say(!item && !/had no owner-voice-core item/.test(tick.out) && readFileSync(join(T, P), 'utf8') === was,
      `foreign portrait: no item, no refusal from recheck, the file byte for byte as it was (recheck exit ${tick.code})`);
    continue;
  }
  if (!was) { say(!item, 'no portrait in this deployment — no item'); continue; }
  if (route === 'update') {
    say(!item, 'route update: the task was written by the deployed older core — no owner-voice-core item (the hand-over is at recheck)');
    const t1 = node(T, [CORE, 'checkpoint', 'recheck']);
    const refused = t1.code !== 0 && /had no owner-voice-core item/.test(t1.out);
    say(refused && t1.out.includes(`«${HEAD_LINE}»`), `route update: recheck of the fresh core refuses with the instruction before the replacement (exit ${t1.code})`);
    const kept = replaceLikeTheInstruction(T);
    const t2 = node(T, [CORE, 'checkpoint', 'recheck']);
    say(!/had no owner-voice-core item/.test(t2.out), `route update: after the replacement (local part ${kept} line(s) kept) the voice refusal is gone (recheck exit ${t2.code}${t2.code ? ' — for other reasons: ' + (t2.out.split(/\r?\n/).filter((l) => /REFUSED|✖/.test(l))[0] || '').slice(0, 120) : ''})`);
  } else {
    say(Boolean(item) && item.includes(`«${HEAD_LINE}»`), `route bootstrap: the fresh core wrote the owner-voice-core item${item ? ' — ' + ((item.match(/the core it carries: [^)]*/) || [''])[0]) : ''}`);
    const c1 = node(T, [CORE, 'checkpoint', 'owner-voice-core']);
    say(c1.code !== 0, `route bootstrap: checkpoint owner-voice-core refuses before the replacement (exit ${c1.code})`);
    const kept = replaceLikeTheInstruction(T);
    const c2 = node(T, [CORE, 'checkpoint', 'owner-voice-core']);
    say(c2.code === 0 && lfSha(readFileSync(join(T, P), 'utf8').split('\n').slice(kept).join('\n')) === lfSha(SNAP),
      `route bootstrap: after the replacement (local part ${kept} line(s) kept) the checkpoint accepts it (exit ${c2.code})`);
  }
}
const after = { head: git(SRC, 'rev-parse', 'HEAD'), status: git(SRC, 'status', '--porcelain') };
const untouched = after.head === before.head && after.status === before.status;
console.log(`\nsource untouched: ${untouched ? 'yes' : 'NO'} (HEAD and git status compared before and after)`);
if (argv.includes('--keep')) console.log(`clones kept: ${root}`); else rmSync(root, { recursive: true, force: true });
console.log(bad || !untouched ? `\n✖ ${bad} BAD${untouched ? '' : ' · the source changed'}` : '\n✅ both routes: the derived portrait is replaced by the release snapshot, checked by bytes');
process.exit(bad || !untouched ? 1 : 0);
