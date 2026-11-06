// tools/sandbox/probes/mm3-live-knowledge.mjs — a PROBE (not a polygon suite): the functional run of epic MM (2.10, origin #160 · #159 ·
// #186; criteria 9 · 10 · 30 of plans/136) with a LIVE agent session — the real Claude Code CLI, headless, reading the project's own
// .claude/settings.json, so the knowledge hook is fired by the harness, not by a test.
//   route — a fresh git project → KAIF installed by THIS build's core → `wire-hooks` → per scenario a fresh copy and ONE live prompt:
//     1 (new)   — src/billing/invoice.mjs exists, the project's maps say nothing about it; the prompt asks what it computes;
//     2 (stale) — PROJECT_ARCHITECTURE_INTERNAL_MAP.md says «tax rate 10 %», the code applies 20 %; the prompt asks the tax rate;
//     3 (notes) — src/billing/NOTES.md (the component's notes) exists; the prompt asks to make the rounding go to whole cents.
//   observation, two halves kept apart — MECHANISM: the stream's hook responses carry the knowledge hook's line («KAIF knowledge: …»;
//     for 3 — «read src/billing/NOTES.md before you change it»); BEHAVIOUR: after the session the project documents (maps, STATUS.md,
//     EXPERIENCE.md, HOUSE_RULES.md, the notes) carry a line about the billing component (1), no longer say «10 %» (2), the notes file
//     grew (3). The model is not deterministic: each scenario runs RUNS times, the verdict is a share, never one outcome.
// Cost: RUNS × 3 short sessions of `--model haiku`. The child gets no CLAUDE* variables of this session. Run it alone.
// usage: node tools/sandbox/probes/mm3-live-knowledge.mjs [--runs N] [--keep]
// [NOT-TESTED]
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
  return { code: r.status, said };
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
const docsText = (p) => ['PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'STATUS.md', 'EXPERIENCE.md', 'HOUSE_RULES.md']
  .map((f) => existsSync(join(p, f)) ? readFileSync(join(p, f), 'utf8') : '').join('\n');

const SC = [
  { id: 1, name: 'new', prompt: 'Read src/billing/invoice.mjs and tell me in one sentence what it computes.',
    prep: () => {}, mech: (s) => s.said.length > 0,
    beh: (p, before) => /billing|invoice/i.test(docsText(p)) && !/billing|invoice/i.test(before), want: 'map line added' },
  { id: 2, name: 'stale', prompt: 'What tax rate does the invoice code apply? Check the code, not the docs.',
    prep: (p) => writeFileSync(join(p, MAP), readFileSync(join(p, MAP), 'utf8') + '\n\n## Billing\n\n- `src/billing/invoice.mjs` — invoice total; tax rate 10 %.\n'),
    mech: (s) => s.said.length > 0, beh: (p) => !/tax rate 10 %/.test(readFileSync(join(p, MAP), 'utf8')), want: 'map line corrected' },
  { id: 3, name: 'notes', prompt: 'In src/billing/invoice.mjs make the total round to whole cents instead of 10 cents.',
    prep: (p) => writeFileSync(join(p, 'src', 'billing', 'NOTES.md'), '# Notes — billing\n\n- total() applies TAX_RATE after summing the lines.\n'),
    mech: (s) => s.said.some((o) => /src\/billing\/NOTES\.md before you change it/.test(o)),
    beh: (p) => readFileSync(join(p, 'src', 'billing', 'NOTES.md'), 'utf8').split('\n').filter(Boolean).length > 2, want: 'notes read before the first edit, appended' },
];
let allMech = true;
for (const sc of SC) {
  let m = 0, b = 0;
  for (let i = 1; i <= RUNS; i++) {
    const P = join(ROOT, `s${sc.id}-${i}`); cpSync(T, P, { recursive: true }); sc.prep(P);
    const before = docsText(P);
    const s = live(P, sc.prompt, `s${sc.id}-${i}`);
    const mech = s.code === 0 && sc.mech(s), beh = sc.beh(P, before);
    if (mech) m++; if (beh) b++;
    console.log(`    scenario ${sc.id} (${sc.name}) run ${i}: exit ${s.code} · hook lines ${s.said.length} · mechanism ${mech ? 'yes' : 'no'} · behaviour ${beh ? 'yes' : 'no'}`);
  }
  if (m !== RUNS) allMech = false;
  console.log(`${m === RUNS ? 'OK  ' : 'BAD '}scenario ${sc.id} (${sc.name}): mechanism ${m}/${RUNS} · behaviour ${b}/${RUNS}${b === RUNS ? ` — scenario ${sc.id} (${sc.name}): ${sc.want}` : ''}`);
}
console.log(allMech ? '✅ the knowledge hook spoke in every live session' : '❌ the hook did not speak in every session');
if (!KEEP) rmSync(ROOT, { recursive: true, force: true }); else console.log('kept: ' + ROOT);
process.exit(allMech ? 0 : 1);
