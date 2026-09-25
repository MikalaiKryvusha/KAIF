// tools/sandbox/probes/ow8-import-silence.mjs — a PROBE (not a polygon suite): the executable acceptance of step OW8 of plans/119
// (2.8, epic OW; criterion 24 of plans/117; origin ticket #101), written BEFORE the fix. A project tool that imports a shipped module
// to reuse its exported grammar must get the exports and NOTHING else — no usage line, no project-wide check run as a side effect.
// For every shipped module with at least one `export` (framework/tools/*.mjs and framework/tools/contour/*.mjs, or the directory given)
// it imports the module from an EMPTY temporary directory in the quiet environment (tools/lib/sandbox-run.mjs quietEnv — no program
// on PATH, so no window and no sound can start on any version, bugs/116) and reads the WHOLE output, not its last line: the ticket's
// twin check printed only the last line and so counted 4 of 7, because a module whose own `check` output came first still ended
// with `imported`.
// usage: node tools/sandbox/probes/ow8-import-silence.mjs [<tools dir>]   (default: framework/tools of this repo;
//        a deployed project: <project>/.kaif/tools; the 2.7 delivery: extract dist and pass its tools dir)
// Expected after OW8: every module SILENT (exit 0). Before OW8: the modules with a top-level command dispatch are LOUD (exit 1).
// [TESTED: 2026-09-25 14:34 +03:00 · session 74: HEAD c969e35 and v2.7 — BAD 7 of 10 (seven lint modules LOUD, exit 1–3, the import
//  never resolves), three contour modules SILENT — both verdicts observed; report testcases/reports/2026-09-25_ow0-inputs.md]
import { readdirSync, readFileSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TOOLS = resolve(process.argv[2] || join(REPO, 'framework', 'tools'));
const IMPORT_TIMEOUT_MS = 20000;
const IMPORTED = 'KAIF-PROBE-IMPORTED';
const EXPORT_RE = /^export\s/m;

const modules = [];
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.mjs') && EXPORT_RE.test(readFileSync(p, 'utf8'))) modules.push(p);
  }
};
walk(TOOLS);

const empty = mkdtempSync(join(tmpdir(), 'kaif-import-silence-'));
let loud = 0;
console.log(`tools dir: ${TOOLS} · modules with exports: ${modules.length} · cwd of every import: an empty temporary directory`);
console.log('| module | verdict | what the import printed (first line) |');
console.log('|---|---|---|');
try {
  for (const m of modules) {
    const code = `import(${JSON.stringify(pathToFileURL(m).href)}).then(() => console.log(${JSON.stringify(IMPORTED)}))`;
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: empty, env: quietEnv(), encoding: 'utf8', timeout: IMPORT_TIMEOUT_MS });
    const out = String(r.stdout || '').split(/\r?\n/).filter((l) => l.trim() !== '');
    const err = String(r.stderr || '').split(/\r?\n/).filter((l) => l.trim() !== '');
    const side = [...out.filter((l) => l !== IMPORTED), ...err];
    const silent = r.status === 0 && out.includes(IMPORTED) && side.length === 0;
    if (!silent) loud++;
    const first = side.length ? side[0].slice(0, 110).replace(/\|/g, '/') : (r.error ? String(r.error.message).slice(0, 110) : '—');
    const tag = silent ? 'SILENT' : `LOUD (exit ${r.status}, ${side.length} line(s)${out.includes(IMPORTED) ? '' : ', the import never resolved'})`;
    console.log(`| ${relative(TOOLS, m).replace(/\\/g, '/')} | ${tag} | ${first} |`);
  }
} finally { rmSync(empty, { recursive: true, force: true }); }
console.log(loud ? `BAD — ${loud} of ${modules.length} module(s) run something on import` : `GOOD — all ${modules.length} module(s) import silently`);
process.exit(loud ? 1 : 0);
