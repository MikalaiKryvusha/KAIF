// tools/sandbox/probes/hc8-live-test-hook.mjs — a PROBE (not a polygon suite): the functional run of criterion 28 (version KAIF 2.10, epic
// HC, step HC8; origin #175 · #176) with a LIVE agent session — the real Claude Code CLI, headless, reading the project's own
// .claude/settings.json, so the testing hook is fired by the harness, not by a test.
//   route — a fresh git project with src/app.mjs → KAIF installed by THIS build's core (or KAIF_DIST of an older release) → `wire-hooks` →
//   per run a fresh copy and ONE live prompt, two scenarios:
//     1 (edit)   — «add double(x) to src/app.mjs» (no word about running). MECHANISM: the hook's order «you wrote code — RUN it» is in the
//                  stream after the edit; BEHAVIOUR: after the first edit the session itself runs the file (`node … app.mjs`) and no
//                  debt is left. Control — KAIF_DIST=<dist of v2.9>: the same prompt without the hook (the share of runs the model makes
//                  on its own; the hook earns its place only by the difference).
//     2 (forbid) — the same change «… and do not run anything»: the session ends WITHOUT a run, so the debt stands at the stop.
//                  MECHANISM: the hook's Stop answer — a block whose reason names src/app.mjs — is in the stream; the session still
//                  ends (exit 0 — a repeated stop passes, no endless loop).
//   The model is not deterministic: RUNS runs per scenario, the verdict is a share.
// Cost: RUNS short sessions of `--model haiku`. The child gets no CLAUDE* variables of this session. Run it alone.
// usage: node tools/sandbox/probes/hc8-live-test-hook.mjs [--runs N] [--keep]
// [TESTED: 2026-11-06 16:24:24 → 16:26:28 this build — edit 3/3 · 3/3, forbid 3/3 · 3/3; 16:26:28 → 16:27:21 the v2.9 dist — the hook
//  absent, the file run 0/3; the first version (16:22:33, one scenario) judged «the stop refused» where the session had already run the
//  file after the order — a predicate that needed a failure, replaced by the two scenarios; after the light judge's fixes of the hook
//  16:41:21 → 16:44:11 — edit 3/3 · 3/3, forbid 3/3 · 3/3; report testcases/reports/2026-11-06_s98-hc8-testing-hook.md]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, copyFileSync, rmSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const KEEP = process.argv.includes('--keep');
const RUNS = Number((process.argv.join(' ').match(/--runs\s+(\d+)/) || [])[1]) || 2;
const CLAUDE_EXE = process.env.KAIF_CLAUDE_EXE || join(process.env.APPDATA || '', 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-hc8-live-'));
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
for (const k of Object.keys(ENV)) if (/^CLAUDE/i.test(k)) delete ENV[k];
const git = (cwd, ...a) => spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8' });
const core = (cwd, args) => { const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: 300000, maxBuffer: 1 << 26 }); return { code: r.status, all: (r.stdout || '') + (r.stderr || '') }; };
const PROMPTS = { edit: 'In src/app.mjs add an exported function double(x) that returns x * 2. Make only that change.',
  forbid: 'In src/app.mjs add an exported function double(x) that returns x * 2. Make only that change and do not run anything.' };
const live = (cwd, label, prompt) => {
  const r = spawnSync(CLAUDE_EXE, ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--include-hook-events', '--setting-sources', 'project',
    '--model', 'haiku', '--allowedTools', 'Read', 'Edit', 'Write', 'Bash', 'Glob', 'Grep'], { cwd, env: ENV, encoding: 'utf8', timeout: 400000, maxBuffer: 1 << 26 });
  writeFileSync(join(ROOT, `live-${label}.jsonl`), (r.stdout || '') + '\n--- stderr ---\n' + (r.stderr || ''));
  const ev = (r.stdout || '').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  // the testing hook's Stop answer: a hook response whose output carries the block and names the file
  const out = (e) => String(e.output || e.stdout || '');
  const ordered = ev.some((e) => e.subtype === 'hook_response' && e.hook_event === 'PostToolUse' && /KAIF testing: you wrote code/.test(out(e)));
  const blocked = ev.some((e) => e.subtype === 'hook_response' && /test-after-code|KAIF testing/.test(String(e.output || e.stdout || '') + String(e.hook_name || ''))
    && /"decision"\s*:\s*"block"/.test(String(e.output || e.stdout || '')) && /src\/app\.mjs/.test(String(e.output || e.stdout || '')));
  const calls = ev.filter((e) => e.type === 'assistant').flatMap((e) => (e.message && e.message.content) || []).filter((c) => c && c.type === 'tool_use')
    .map((c) => ({ name: c.name, file: String((c.input && c.input.file_path) || '').split('\\').join('/'), cmd: String((c.input && c.input.command) || '') }));
  const edit = calls.findIndex((c) => ['Edit', 'Write', 'MultiEdit'].includes(c.name) && /src\/app\.mjs$/.test(c.file));
  const ran = edit >= 0 && calls.slice(edit + 1).some((c) => c.name === 'Bash' && /\bnode\b[^\n]*app\.mjs/.test(c.cmd.split('\\').join('/')) && !/--check|--help/.test(c.cmd));
  return { code: r.status, ordered, blocked, ran, edited: edit >= 0 };
};
if (!existsSync(CLAUDE_EXE)) { console.log(`REFUSED: the Claude Code CLI is not at ${CLAUDE_EXE} — no live session, no verdict`); process.exit(2); }

const T = join(ROOT, 'template'); mkdirSync(join(T, '.kaif', 'install'), { recursive: true });
writeFileSync(join(T, 'README.md'), '# demo\n\nA small project.\n');
mkdirSync(join(T, 'src'), { recursive: true });
writeFileSync(join(T, 'src', 'app.mjs'), '// app: tiny helpers\nexport function inc(x) { return x + 1; }\nif (process.argv[1] && process.argv[1].endsWith(\'app.mjs\')) console.log(\'inc(1) =\', inc(1));\n');
git(T, 'init', '-q'); git(T, 'add', '-A'); git(T, 'commit', '-qm', 'init');
copyFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(T, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
copyFileSync(join(DIST, 'KAIF-CORE.mjs'), join(T, '.kaif', 'kaif-core.mjs'));
let r = core(T, ['install', '--agents', 'claude-code']);
console.log((r.code === 0 ? 'OK  ' : 'BAD ') + 'install by this build exits ' + r.code);
r = core(T, ['wire-hooks']);
const settings = existsSync(join(T, '.claude', 'settings.json')) ? readFileSync(join(T, '.claude', 'settings.json'), 'utf8') : '';
console.log((/test-after-code\.mjs/.test(settings) ? 'OK  ' : 'BAD ') + 'wire-hooks wires test-after-code.mjs');
let all = true;
for (const sc of ['edit', 'forbid']) {
  let m = 0, b = 0;
  for (let i = 1; i <= RUNS; i++) {
    const P = join(ROOT, `${sc}-${i}`); cpSync(T, P, { recursive: true });
    const s = live(P, `${sc}-${i}`, PROMPTS[sc]);
    const st = existsSync(join(P, '.kaif', 'test-debt.json')) ? JSON.parse(readFileSync(join(P, '.kaif', 'test-debt.json'), 'utf8')) : null;
    const debt = st ? Object.keys(st.debt || {}).length : null;
    const mech = s.code === 0 && (sc === 'edit' ? s.ordered : s.blocked);
    const beh = sc === 'edit' ? (s.edited && s.ran && debt === 0) : (s.edited && !s.ran && s.code === 0);
    if (mech) m++; if (beh) b++;
    console.log(`    ${sc} run ${i}: exit ${s.code} · edited ${s.edited ? 'yes' : 'no'} · order after the edit ${s.ordered ? 'yes' : 'no'} · stop refused ${s.blocked ? 'yes' : 'no'} · ran the file ${s.ran ? 'yes' : 'no'} · debt left ${debt === null ? 'no state' : debt}`);
  }
  if (m !== RUNS) all = false;
  const what = sc === 'edit' ? 'the order after the edit · behaviour: ran the file itself, no debt left' : 'the stop refused with the list · behaviour: no run, the session still ended';
  console.log(`${m === RUNS ? 'OK  ' : 'BAD '}scenario ${sc}: mechanism ${m}/${RUNS} · behaviour ${b}/${RUNS} — ${what}`);
}
if (!KEEP) rmSync(ROOT, { recursive: true, force: true }); else console.log('kept: ' + ROOT);
process.exit(all ? 0 : 1);
