// tools/sandbox/probes/tk7z-tk9-contour-mutants.mjs — a PROBE (not a polygon suite): mutants of the shipped contour for steps TK7z and TK9
// of version KAIF 2.10 (plans/137). Each mutant breaks ONE part of the fix in a COPY of framework/tools/contour/ (the source is only read)
// and runs the copy's --selftest in quietEnv() (no window, no sound); the addressee is named BEFORE the run and must be exactly the red cases.
//   J1 — the real page answers /whoami with a foreign id (the judge's mutant of hunt 2)   → «TK7z #169: a REAL page answers /whoami»
//   CL — --close no longer asks the port who it is before sending the token               → «TK7z #169: --close against a stranger»
//   MS — the CLI branch of --mark-shown bypasses the resolver (#178)                       → «TK9 #178: the real CLI»
//   MF — the resolver takes any value of the flag as the document (#178)                   → both TK9 cases (the CLI calls the resolver)
// A mutation that does not apply is BAD (never a green), a selftest that dies is BAD (EXP-0158).
// usage: node tools/sandbox/probes/tk7z-tk9-contour-mutants.mjs   (≈ 4 min, alone: the selftest raises local pages)
import { cpSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const SRC = join(REPO, 'framework', 'tools', 'contour');
const MUTANTS = [
  ['J1', "ok({ kaif: 'contour', id: pageIdOf(closeToken) })", "ok({ kaif: 'contour', id: pageIdOf('not-this-page') })", ['TK7z #169: a REAL page answers /whoami']],
  ['CL', 'const isPage = !lock.closeToken || await pageListens(lock);', 'const isPage = true;', ['TK7z #169: --close against a stranger']],
  ['MS', "const target = markShownTarget(root, opt('--mark-shown'), docPath);", "const target = { doc: opt('--mark-shown') };", ['TK9 #178: the real CLI']],
  ['MF', "  const pick = value && !String(value).startsWith('--') ? value : positional;\n  if (!pick)",
    "  const pick = value;\n  if (pick) return { doc: pick };\n  if (!pick)", ['TK9 #178: --mark-shown takes the named file', 'TK9 #178: the real CLI']],
];
let bad = 0;
for (const [name, from, to, addressee] of MUTANTS) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-tk7z-mut-'));
  try {
    cpSync(SRC, dir, { recursive: true });
    const f = join(dir, 'review.mjs');
    const src = readFileSync(f, 'utf8');
    if (src.split(from).length !== 2) { bad++; console.log('BAD ' + name + ': the mutation did not apply'); continue; }
    writeFileSync(f, src.replace(from, () => to));
    const r = spawnSync(process.execPath, [f, '--selftest'], { cwd: REPO, env: quietEnv({ KAIF_VOICE_TOOL: '' }), encoding: 'utf8', timeout: 600000 });
    const red = ((r.stdout || '') + (r.stderr || '')).split('\n').filter((l) => /^\s+x /.test(l)).map((l) => l.trim());
    const only = red.length === addressee.length && addressee.every((a) => red.some((l) => l.includes(a)));
    if (r.status === null || !only) bad++;
    console.log((only && r.status !== null ? 'OK  ' : 'BAD ') + name + ': exit ' + r.status + ' · red ' + red.length + ' — ' + (red.map((l) => l.slice(2, 80)).join(' | ') || 'none'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
console.log(bad ? `✖ ${bad} BAD` : '✅ every mutant is red on exactly its named case');
process.exit(bad ? 1 : 0);
