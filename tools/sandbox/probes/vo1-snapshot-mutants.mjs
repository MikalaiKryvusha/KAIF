// tools/sandbox/probes/vo1-snapshot-mutants.mjs — a PROBE (not a polygon suite): step VO1 of plans/120 (2.8, epic VO). Proves that every
// new check of the 2.x layout in tools/stylometry-snapshot.mjs can FAIL: each mutant disables one defence in a COPY of the generator
// (placed next to the original — it imports ./lib/temp-root.mjs relatively; removed after the run) and runs its --selftest against a
// 2.x core; the named addressee must turn red, the others stay as they are. Addressees are named BEFORE the run.
// usage: node tools/sandbox/probes/vo1-snapshot-mutants.mjs [<core 2.x AUTHOR_STYLOMETRY.md>]   (default: the generator's default
//        source; the private layers must lie next to the core — the generator refuses without them)
// Expected: every mutant RED on its addressee (exit 0 of the probe = all six proved); the unmutated copy GREEN.
// [TESTED: 2026-09-25 15:14 и 15:17 +03:00 · session 74: on a copy of core 2.2 and on the default source (core 2.2 after fast-forward) —
//  base copy green, 6 of 6 mutants red on their addressee; report testcases/reports/2026-09-25_vo1-snapshot-core22.md]
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TOOL = join(REPO, 'tools', 'stylometry-snapshot.mjs');
const COPY = join(REPO, 'tools', 'stylometry-snapshot.mutant-tmp.mjs');
const source = process.argv[2] ? ['--source', resolve(process.argv[2])] : [];
const orig = readFileSync(TOOL, 'utf8');

const MUTANTS = [
  { id: 'M1 образцы не судятся блоком', addressee: 'K16', from: 'const sampleHit = cfg.layout === 2 && line.match(SAMPLE_OPEN);', to: 'const sampleHit = false;' },
  { id: 'M2 слой как источник не отказывает', addressee: 'K17', from: 'if (PRIVATE_LAYER_H1.test(src[0] || \'\') || PRIVATE_LAYER_FILES.includes(basename(sourcePath))) {', to: 'if (false) {' },
  { id: 'M3 ось приватных слоёв снята', addressee: 'K18', from: '  if (layers.length) {\n    const bw = wordsOf(body);', to: '  if (false) {\n    const bw = wordsOf(body);' },
  { id: 'M4 белый список 2.x не читается', addressee: 'K19', from: '...(v2.allowSpans || []).map((a) => a.span), ...publicSpans.map(([span]) => span)],', to: '],' },
  { id: 'M5 публичность без проверки файлом', addressee: 'K20', from: '    if (!existsSync(full) || !normWords(readFileSync(full, \'utf8\')).includes(normWords(span))) {', to: '    if (false) {' },
  { id: 'M6 утечка рядом не судится', addressee: 'K21', from: '    if (files.length) failures.push(', to: '    if (false) failures.push(' },
];

const run = () => spawnSync(process.execPath, [COPY, ...source, '--selftest'], { cwd: REPO, encoding: 'utf8', timeout: 120000 });
const redIds = (out) => out.split('\n').filter((l) => l.startsWith('❌ селфтест: ')).map((l) => l.slice('❌ селфтест: '.length).split(/[-—\s]/)[0]);
let bad = 0;
try {
  writeFileSync(COPY, orig);
  const base = run();
  console.log(`base copy: exit ${base.status}, red ${JSON.stringify(redIds(base.stdout + base.stderr))}`);
  if (base.status !== 0) { console.log('BAD — the unmutated copy is not green; mutants prove nothing'); bad++; }
  for (const m of MUTANTS) {
    if (orig.split(m.from).length !== 2) { console.log(`${m.id}: anchor not found once — BAD`); bad++; continue; }
    writeFileSync(COPY, orig.replace(m.from, m.to));
    const r = run();
    const reds = redIds(r.stdout + r.stderr);
    const died = r.status !== 0 && r.status !== 1;
    const good = r.status === 1 && reds.includes(m.addressee);
    if (!good) bad++;
    console.log(`${good ? 'RED ✓' : 'NOT RED ✗'} ${m.id} → exit ${r.status}${died ? ' (DIED — not a proof, EXP-0158)' : ''}, red ${JSON.stringify(reds)} (addressee ${m.addressee})`);
  }
} finally { rmSync(COPY, { force: true }); }
console.log(bad ? `BAD — ${bad} mutant(s) not proved` : `GOOD — ${MUTANTS.length} of ${MUTANTS.length} mutants red on their addressee`);
process.exit(bad ? 1 : 0);
