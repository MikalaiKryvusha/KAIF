// tools/sandbox/probes/ck56-field-forecast.mjs — a PROBE (not a polygon suite): the functional run of step CK5.6 (2.8, epic CK;
// N12 of the 2.8 scope recon) over a REAL field deployment, on BOTH update routes. The field deployment is only READ: each route
// clones its committed state into the OS temp dir, and the source's HEAD and `git status` are compared before and after. The clone
// is updated from this repository's dist presented as the next release (manifest version --to, default 2.8), with the previous
// release's own artifacts as the old texts (`git show v<from>:dist/…` — hermetic, no network: origin bug 109).
//   route update    — `node .kaif/kaif-core.mjs update`: the DEPLOYED (older) core writes the task, the fresh core is swapped in at
//                     the end; the forecast comes from `checkpoint recheck`, which the fresh core runs (the hand-over);
//   route bootstrap — the fresh core and bundle are put into .kaif/ and `install` runs over the existing deployment (what the thin
//                     KAIF.md loader does); the forecast is the task's closing-gates item.
// On each clone the probe then runs the REAL closing gates — the budget door, the lesson-journal lint, the attribution lint — and
// compares each forecast verdict with the gate's own exit code: STOPS ⇔ exit 1; passes / open / not judged ⇔ exit 0 or 3.
// usage: node tools/sandbox/probes/ck56-field-forecast.mjs <field-deployment-dir> [--from 2.7] [--to 2.8] [--keep]
// Needs a FRESH dist (rebuild first). Raises no window and no sound. A field deployment may have its own LIVE session: its
// `git status` can change during the run for reasons of its own — the probe issues only read commands on the source, and says so.
// [TESTED: 2026-09-25 09:09–09:10 +03:00 · run over KUMM, NDim, KAGO and Unliminium (all on 2.7): both routes exit 0, forecast = real
//  gate 24 of 24; the first edition found that the update route's task carries no closing-gates item (the outgoing core writes it)
//  — the hand-over at `checkpoint recheck` followed; testcases/reports/2026-09-25_ck56-closing-gates-forecast.md]
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
  console.error('usage: node tools/sandbox/probes/ck56-field-forecast.mjs <field-deployment-dir> [--from 2.7] [--to 2.8] [--keep] — the directory must be a KAIF deployment');
  process.exit(2);
}
const FROM = flag('--from', '2.7'), TO = flag('--to', '2.8');
// GIT_OPTIONAL_LOCKS=0: `git status` on the source never takes index.lock — a field deployment may have its own live session.
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
const before = { head: git(SRC, 'rev-parse', 'HEAD'), status: git(SRC, 'status', '--porcelain') };

const root = mkdtempSync(join(tmpdir(), 'kaif-ck56-field-'));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const REL = join(root, `rel-${TO}`), OLD = join(root, `rel-${FROM}`);
mkdirSync(REL, { recursive: true }); mkdirSync(OLD, { recursive: true });
cpSync(join(REPO, 'dist', 'KAIF-CORE.mjs'), join(REL, 'KAIF-CORE.mjs'));
// The bundle's meta block names its version too (the bootstrap route takes it from there): the next release, whole.
const bundle = readFileSync(join(REPO, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
const vAt = bundle.indexOf('"version": "');
if (vAt < 0 || vAt > 2000) { console.error('✖ the bundle meta block carries no "version" near its top — the probe cannot present the next release'); process.exit(2); }
writeFileSync(join(REL, 'KAIF-CORE-BUNDLE.md'), bundle.slice(0, vAt) + bundle.slice(vAt).replace(/"version": "[^"]*"/, `"version": "${TO}"`));
const man = JSON.parse(readFileSync(join(REPO, 'dist', 'kaif-manifest.json'), 'utf8'));
man.version = TO;
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = sha(join(REL, f));
writeFileSync(join(REL, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'kaif-manifest.json'])
  writeFileSync(join(OLD, f), execFileSync('git', ['show', `v${FROM}:dist/${f}`], { cwd: REPO, maxBuffer: 1 << 28 }));

const node = (cwd, args) => { const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 }); return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}` }; };
const CORE = join('.kaif', 'kaif-core.mjs');
let disagree = 0;
for (const route of ['update', 'bootstrap']) {
  const T = join(root, `field-${route}`);
  git(root, 'clone', '--quiet', '--no-hardlinks', resolve(SRC), T);
  let run;
  if (route === 'update') run = node(T, [CORE, 'update', '--source', REL, '--baseline', OLD]);
  else {
    mkdirSync(join(T, '.kaif', 'install'), { recursive: true });
    cpSync(join(REL, 'KAIF-CORE.mjs'), join(T, CORE));
    cpSync(join(REL, 'KAIF-CORE-BUNDLE.md'), join(T, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
    run = node(T, [CORE, 'install', '--baseline', OLD]);
  }
  console.log(`\n# ${SRC} (HEAD ${before.head.slice(0, 7)}) — route ${route}, ${FROM} → ${TO}: exit ${run.code}`);
  if (run.code !== 0) { console.log(run.out.slice(-3000)); disagree++; continue; }
  const task = existsSync(join(T, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(T, 'KAIF_UPDATE_TASK.md'), 'utf8') : '';
  const item = (task.match(/^- \*\*closing-gates\*\* — [\s\S]*?(?=^- \*\*|^## )/m) || [''])[0];
  let source = 'the task item', text = item;
  if (!item) {   // the task was written by the deployed older core — the fresh core names the gates at `checkpoint recheck`
    const tick = node(T, [CORE, 'checkpoint', 'recheck']);
    source = `\`checkpoint recheck\` of the fresh core (exit ${tick.code})`;
    text = tick.out.slice(tick.out.indexOf('ℹ closing gates'));
    if (tick.out.indexOf('ℹ closing gates') < 0) text = '';
  }
  console.log(`## forecast — ${source}, verbatim\n${text.split(/\r?\n/).filter((l) => /^(ℹ closing gates|- \*\*closing-gates|    · )/.test(l)).join('\n') || '(none)'}`);
  const lines = text.split(/\r?\n/).filter((l) => l.startsWith('    · '));
  const real = [
    ['budget door', 'check --gate-budgets', node(T, [CORE, 'check', '--gate-budgets'])],
    ['lesson journal', 'kaif-experience-lint.mjs check', node(T, [join('.kaif', 'tools', 'kaif-experience-lint.mjs'), 'check'])],
    ['decision attribution', 'kaif-attribution-lint.mjs check', node(T, [join('.kaif', 'tools', 'kaif-attribution-lint.mjs'), 'check'])],
  ];
  console.log('## forecast vs the real gate on the same clone');
  for (const [name, cmd, r] of real) {
    const mine = lines.filter((l) => l.includes(cmd));
    const saysStop = mine.some((l) => / — STOPS: /.test(l));
    const agree = mine.length > 0 && saysStop === (r.code === 1);
    if (!agree) disagree++;
    console.log(`${agree ? 'AGREE   ' : 'DISAGREE'} ${name}: forecast ${mine.length ? (saysStop ? 'STOPS' : 'no stop') : 'ABSENT'} · real exit ${r.code}`);
    const red = r.out.split(/\r?\n/).filter((l) => /^(✖|↳)/.test(l));
    for (const l of red.slice(0, 3)) console.log('    real: ' + l.slice(0, 200));
    if (red.length > 3) console.log(`    real: … ${red.length - 3} more`);
  }
}
const after = { head: git(SRC, 'rev-parse', 'HEAD'), status: git(SRC, 'status', '--porcelain') };
const untouched = after.head === before.head && after.status === before.status;
console.log(`\nsource untouched: ${untouched ? 'yes' : 'NO'} (HEAD and git status compared before and after)`);
if (!untouched) {   // name WHAT changed, so a live session of the field deployment is told apart by its own files (the judge's finding 7)
  const b = new Set(before.status.split('\n')), a = new Set(after.status.split('\n'));
  const diff = [...[...a].filter((l) => l && !b.has(l)).map((l) => `+ ${l}`), ...[...b].filter((l) => l && !a.has(l)).map((l) => `- ${l}`)];
  console.log(`  HEAD ${before.head.slice(0, 7)} → ${after.head.slice(0, 7)}; status lines that differ (${diff.length}):`);
  for (const l of diff.slice(0, 12)) console.log('    ' + l);
  console.log('  the probe issues only read commands on the source (clone · rev-parse · status with GIT_OPTIONAL_LOCKS=0) — check these paths against that deployment\'s own session');
}
if (argv.includes('--keep')) console.log(`clones kept: ${root}`); else rmSync(root, { recursive: true, force: true });
console.log(disagree || !untouched ? `\n✖ ${disagree} disagreement(s) between forecast and real gate${untouched ? '' : ' · the source changed'}` : '\n✅ on both routes every forecast verdict agrees with its real gate');
process.exit(disagree || !untouched ? 1 : 0);
