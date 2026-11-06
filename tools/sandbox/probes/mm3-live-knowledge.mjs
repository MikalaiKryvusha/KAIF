// tools/sandbox/probes/mm3-live-knowledge.mjs — a PROBE (not a polygon suite): the functional run of epic MM (2.10, origin #160 · #159 ·
// #186; criteria 9 · 10 · 30 of plans/136) with a LIVE agent session — the real Claude Code CLI, headless, reading the project's own
// .claude/settings.json, so the knowledge hook is fired by the harness, not by a test.
//   route — a fresh git project → KAIF installed by THIS build's core → `wire-hooks` → per scenario a fresh copy and ONE live prompt:
//     1 (new)   — src/billing/invoice.mjs exists, the project's maps say nothing about it; the prompt asks what it computes;
//     2 (stale) — PROJECT_ARCHITECTURE_INTERNAL_MAP.md says «tax rate 10 %», the code applies 20 %; the prompt asks the tax rate;
//     3 (notes) — src/billing/NOTES.md (the component's notes) exists; the prompt asks to make the rounding go to whole cents.
//   observation, two halves kept apart — MECHANISM: the stream's hook responses carry the knowledge hook's line («KAIF knowledge: …»;
//     for 3 — «read src/billing/NOTES.md before you change it»); BEHAVIOUR, each predicate no wider than the words it prints (judge of
//     epics MM · TK10, session 97, hunt 1): (1) one of the two MAPS — not STATUS or EXPERIENCE — has a line on the invoice component it did not have before;
//     (2) the internal map still carries a line on the invoice tax, that line says 20 % and none says 10 % (deleting the section does not
//     pass); (3) in the session's own tool calls a Read of src/billing/NOTES.md comes before the first Edit/Write of invoice.mjs, and the
//     notes file grew. The model is not deterministic: each scenario runs RUNS times, the verdict is a share, never one outcome.
//   KAIF_DIST=<dist of an older release> runs the same route on that build — the red of criterion 9 (2.9 ships no knowledge hook).
// Cost: RUNS × 3 short sessions of `--model haiku`. The child gets no CLAUDE* variables of this session. Run it alone.
// usage: node tools/sandbox/probes/mm3-live-knowledge.mjs [--runs N] [--keep]
// [TESTED: 2026-11-06 15:54:25 → 15:56:36 · functional — this build, the final hook, narrowed predicates: 9 of 9 live sessions behaved (a map has a line on the invoice component ·
//  the tax line says 20 % · NOTES.md read before the first code edit, appended); the v2.9 dist (15:56:36 → 15:57:52) — mechanism 0/3, behaviour 0/3 in each of the three; predicate 2
//  false on a stale, a deleted and an unspaced «10%» map; report testcases/reports/2026-11-06_s98-judge-debt-mm-tk10.md]
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
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-mm3-live-'));
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
for (const k of Object.keys(ENV)) if (/^CLAUDE/i.test(k)) delete ENV[k];
const git = (cwd, ...a) => spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8' });
const core = (cwd, args) => { const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: 300000, maxBuffer: 1 << 26 }); return { code: r.status, all: (r.stdout || '') + (r.stderr || '') }; };
const live = (cwd, prompt, label) => {
  const r = spawnSync(CLAUDE_EXE, ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--include-hook-events', '--setting-sources', 'project',
    '--model', 'haiku', '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep'], { cwd, env: ENV, encoding: 'utf8', timeout: 300000, maxBuffer: 1 << 26 });
  writeFileSync(join(ROOT, `live-${label}.jsonl`), (r.stdout || '') + '\n--- stderr ---\n' + (r.stderr || ''));
  const ev = (r.stdout || '').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const said = ev.filter((e) => e.subtype === 'hook_response').map((e) => String(e.output || e.stdout || '')).filter((o) => /KAIF knowledge/.test(o));
  // the session's tool calls in stream order — name + the file they touch, slashes normalised (Windows paths arrive with backslashes)
  const calls = ev.filter((e) => e.type === 'assistant').flatMap((e) => (e.message && e.message.content) || [])
    .filter((c) => c && c.type === 'tool_use')
    .map((c) => ({ name: c.name, file: String((c.input && (c.input.file_path || c.input.path)) || '').split('\\').join('/') }));
  return { code: r.status, said, calls };
};
if (!existsSync(CLAUDE_EXE)) { console.log(`REFUSED: the Claude Code CLI is not at ${CLAUDE_EXE} — no live session, no verdict`); process.exit(2); }

// ---- the template project: KAIF installed by this build, hooks wired, the billing component
const T = join(ROOT, 'template'); mkdirSync(join(T, '.kaif', 'install'), { recursive: true });
writeFileSync(join(T, 'README.md'), '# demo shop\n\nA small project.\n');
mkdirSync(join(T, 'src', 'billing'), { recursive: true });
writeFileSync(join(T, 'src', 'billing', 'invoice.mjs'),
  '// invoice total: the sum of the lines, plus tax\nexport const TAX_RATE = 0.20;\n' +
  'export function total(lines) {\n  const net = lines.reduce((s, l) => s + l.price * l.qty, 0);\n  return Math.round(net * (1 + TAX_RATE) * 10) / 10;   // rounds to 10 cents\n}\n');
git(T, 'init', '-q'); git(T, 'add', '-A'); git(T, 'commit', '-qm', 'init');
copyFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(T, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
copyFileSync(join(DIST, 'KAIF-CORE.mjs'), join(T, '.kaif', 'kaif-core.mjs'));
let r = core(T, ['install', '--agents', 'claude-code']);
console.log((r.code === 0 ? 'OK  ' : 'BAD ') + 'install by this build exits ' + r.code);
r = core(T, ['wire-hooks']);
const settings = existsSync(join(T, '.claude', 'settings.json')) ? readFileSync(join(T, '.claude', 'settings.json'), 'utf8') : '';
console.log((/knowledge-moment\.mjs/.test(settings) ? 'OK  ' : 'BAD ') + 'wire-hooks wires knowledge-moment.mjs');
const MAP = 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md';
const mapsText = (p) => [MAP, 'PROJECT_STRUCTURE_EXTERNAL_MAP.md']
  .map((f) => existsSync(join(p, f)) ? readFileSync(join(p, f), 'utf8') : '').join('\n');
// (2): the internal map's lines on the invoice tax — a percent or a 0.NN rate on a line that names the invoice or the tax
const taxLines = (p) => readFileSync(join(p, MAP), 'utf8').split(/\r?\n/).filter((l) => /invoice|tax/i.test(l) && /\d\s*%|\b0\.\d/.test(l));
// (3): index of the first tool call of one of `names` on a file matching `re` — -1 when none
const firstAt = (calls, names, re) => calls.findIndex((c) => names.includes(c.name) && re.test(c.file));

const SC = [
  { id: 1, name: 'new', prompt: 'Read src/billing/invoice.mjs and tell me in one sentence what it computes.',
    prep: () => {}, mech: (s) => s.said.length > 0,
    beh: (p, s, before) => /invoice/i.test(mapsText(p)) && !/invoice/i.test(before), want: 'a map has a line on the invoice component' },   // the maps write «invoice» / «Invoice», not the file name (judge s98)
  { id: 2, name: 'stale', prompt: 'What tax rate does the invoice code apply? Check the code, not the docs.',
    prep: (p) => writeFileSync(join(p, MAP), readFileSync(join(p, MAP), 'utf8') + '\n\n## Billing\n\n- `src/billing/invoice.mjs` — invoice total; tax rate 10 %.\n'),
    mech: (s) => s.said.length > 0,
    beh: (p) => { const t = taxLines(p); return t.some((l) => /\b20\s*%|\b0\.20?\b/.test(l)) && !t.some((l) => /\b10\s*%|\b0\.10?\b/.test(l)); },
    want: 'the map line on the tax says 20 %' },
  { id: 3, name: 'notes', prompt: 'In src/billing/invoice.mjs make the total round to whole cents instead of 10 cents.',
    prep: (p) => writeFileSync(join(p, 'src', 'billing', 'NOTES.md'), '# Notes — billing\n\n- total() applies TAX_RATE after summing the lines.\n'),
    mech: (s) => s.said.some((o) => /src\/billing\/NOTES\.md before you change it/.test(o)),
    beh: (p, s) => {
      const rd = firstAt(s.calls, ['Read'], /src\/billing\/NOTES\.md$/), ed = firstAt(s.calls, ['Edit', 'Write', 'MultiEdit'], /src\/billing\/invoice\.mjs$/);
      return rd >= 0 && ed >= 0 && rd < ed && readFileSync(join(p, 'src', 'billing', 'NOTES.md'), 'utf8').split('\n').filter(Boolean).length > 2; },
    want: 'notes read before the first edit of the code, appended' },
];
let allMech = true;
for (const sc of SC) {
  let m = 0, b = 0;
  for (let i = 1; i <= RUNS; i++) {
    const P = join(ROOT, `s${sc.id}-${i}`); cpSync(T, P, { recursive: true }); sc.prep(P);
    const before = mapsText(P);
    const s = live(P, sc.prompt, `s${sc.id}-${i}`);
    const mech = s.code === 0 && sc.mech(s), beh = sc.beh(P, s, before);
    if (mech) m++; if (beh) b++;
    console.log(`    scenario ${sc.id} (${sc.name}) run ${i}: exit ${s.code} · hook lines ${s.said.length} · mechanism ${mech ? 'yes' : 'no'} · behaviour ${beh ? 'yes' : 'no'}`);
  }
  if (m !== RUNS) allMech = false;
  console.log(`${m === RUNS ? 'OK  ' : 'BAD '}scenario ${sc.id} (${sc.name}): mechanism ${m}/${RUNS} · behaviour ${b}/${RUNS}${b === RUNS ? ` — scenario ${sc.id} (${sc.name}): ${sc.want}` : ''}`);
}
console.log(allMech ? '✅ the knowledge hook spoke in every live session' : '❌ the hook did not speak in every session');
if (!KEEP) rmSync(ROOT, { recursive: true, force: true }); else console.log('kept: ' + ROOT);
process.exit(allMech ? 0 : 1);
