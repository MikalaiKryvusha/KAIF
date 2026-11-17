// tools/sandbox/probes/bugs141-mutants.mjs — a PROBE (not a polygon suite): mutants of the bugs/141 fix (origin issue #199 — the decision
// record and the page lock named by the document's BARE file name). Each mutant breaks ONE part of the fix in a COPY of
// framework/tools/contour/ (the source is only read) and runs the copy's --selftest in quietEnv() (no window, no sound); the addressee is
// named BEFORE the run and must be exactly the red cases.
//   N1 — the bare name is always taken (the qualified name only when it already exists)  → «keep their own answers» · «keeps its
//        qualified record» (b never got one) · «--close of b»
//   N2 — the write over another document's record is no longer refused                    → «a write over another document's record»
//   N3 — readDecision returns another document's record                                    → the same case
//   N4 — the page lock is named by the bare file name again                                → «--close of b»
//   N5 — a taken qualified name is forgotten when the bare record is gone                  → «keeps its qualified record»
// A mutation that does not apply is BAD (never a green), a selftest that dies is BAD (EXP-0158).
// usage: node tools/sandbox/probes/bugs141-mutants.mjs   (≈ 3 min, alone: the selftest raises local pages)
import { cpSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const SRC = join(REPO, 'framework', 'tools', 'contour');
const OWN = 'bugs/141 #199: a/compare.webp and b/compare.webp keep their own answers';
const OVER = 'bugs/141 #199: a write over another document\'s record';
const CLOSE = 'bugs/141 #199: --close of b/compare.webp';
const KEPT = 'bugs/141 #199: b keeps its qualified record';
const MUTANTS = [
  ['N1', 'core.mjs', "  return holder !== null && holder !== me ? qualified : stem;", '  return stem;', [OWN, KEPT, CLOSE]],
  ['N2', 'core.mjs', "  if (holder !== null && holder !== docKeyOf(root, docPath)) {\n    throw", "  if (false) {\n    throw", [OVER]],
  ['N3', 'core.mjs', "  return holder !== null && holder !== docKeyOf(root, docPath) ? null : readJson(p);", '  return readJson(p);', [OVER]],
  ['N4', 'review.mjs', '  return owned === stem ? base : owned + ext;', '  return base;', [CLOSE]],
  ['N5', 'core.mjs', '  if (existsSync(join(dir, qualified + ext))) return qualified;', '  if (false) return qualified;', [KEPT]],
];
let bad = 0;
for (const [name, file, from, to, addressee] of MUTANTS) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-bugs141-mut-'));
  try {
    cpSync(SRC, dir, { recursive: true });
    const f = join(dir, file);
    const src = readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
    if (src.split(from).length !== 2) { bad++; console.log('BAD ' + name + ': the mutation did not apply'); continue; }
    writeFileSync(f, src.replace(from, () => to));
    const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { cwd: REPO, env: quietEnv({ KAIF_VOICE_TOOL: '' }), encoding: 'utf8', timeout: 600000 });
    const red = ((r.stdout || '') + (r.stderr || '')).split('\n').filter((l) => /^\s+x /.test(l)).map((l) => l.trim());
    const only = red.length === addressee.length && addressee.every((a) => red.some((l) => l.includes(a)));
    if (r.status === null || !only) bad++;
    console.log((only && r.status !== null ? 'OK  ' : 'BAD ') + name + ': exit ' + r.status + ' · red ' + red.length + ' — ' + (red.map((l) => l.slice(2, 90)).join(' | ') || 'none'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
console.log(bad ? `✖ ${bad} BAD` : '✅ every mutant is red on exactly its named case');
process.exit(bad ? 1 : 0);
