// tools/sandbox/probes/mutants-of.mjs — a PROBE runner (not a polygon suite): every mutant probe that mutates one of the named files, run.
// Why (EXPERIENCE EXP-0169, and its repeat in session 103): a new selftest case that reads the same predicate as an old mutant changes that
// mutant's red set — its list of addressees becomes false — and nothing says so until someone runs the mutant probe. Session 103 added a
// case reading `fromSubagent` to framework/hooks/context-window.mjs, committed, and pt6-context-window-mutant.mjs stood BAD («red 3, named 2»)
// until the next step ran it by chance. This runner finds the probes by the file's name in their source (`*mutant*.mjs` under this folder
// that name the file's path tail or its base name next to a mutation table) and runs each; any non-zero exit is reported and the run is red.
// usage: node tools/sandbox/probes/mutants-of.mjs <file> …   (minutes: each probe runs its own selftests; alone — some raise local pages)
// [TESTED: 2026-11-18 01:36 · this tree: framework/hooks/context-window.mjs → gate-close-mutant · pt6-context-window-mutant, both OK; a
//  temporary worktree of 76801dd (pt6 stood BAD there after bugs/142) → «BAD pt6-context-window-mutant.mjs — exit 1», exit 1;
//  report testcases/reports/2026-11-18_bugs143-clock-placeholder.md]
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, basename, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const HERE = resolve(new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const REPO = resolve(HERE, '..', '..', '..');
const files = process.argv.slice(2).map((f) => relative(REPO, resolve(f)).replace(/\\/g, '/'));
if (!files.length) { console.log('usage: mutants-of.mjs <file> …'); process.exit(2); }
const probes = readdirSync(HERE).filter((f) => /mutant/i.test(f) && f.endsWith('.mjs') && f !== basename(new URL(import.meta.url).pathname)).sort();
// a probe names its target by a path tail ('hooks', 'context-window.mjs') or by a join(...) of the parts — match the base name and the folder
const names = (f) => { const parts = f.split('/'); return { base: parts[parts.length - 1], dir: parts[parts.length - 2] || '' }; };
const hits = probes.filter((p) => {
  const src = readFileSync(join(HERE, p), 'utf8');
  return files.some((f) => { const { base, dir } = names(f); return src.includes(base) && (!dir || src.includes(dir)); });
});
if (!hits.length) { console.log('no mutant probe names ' + files.join(', ') + ' — nothing to run'); process.exit(0); }
let bad = 0;
for (const p of hits) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [join(HERE, p)], { cwd: REPO, encoding: 'utf8', timeout: 900000 });
  const tail = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-1)[0] || '';
  if (r.status !== 0) bad++;
  console.log((r.status === 0 ? 'OK  ' : 'BAD ') + p + ' — exit ' + r.status + ' · ' + Math.round((Date.now() - t0) / 1000) + ' s · ' + tail.slice(0, 120));
}
console.log(bad ? `✖ ${bad} of ${hits.length} mutant probe(s) BAD` : `✅ ${hits.length} mutant probe(s) of ${files.join(', ')} — every one on its addressees`);
process.exit(bad ? 1 : 0);
