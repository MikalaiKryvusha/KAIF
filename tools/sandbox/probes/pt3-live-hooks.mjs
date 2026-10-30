// tools/sandbox/probes/pt3-live-hooks.mjs — a PROBE (not a polygon suite): the functional run of step PT3 of plans/142 (version KAIF 2.10,
// epic PT, criteria 24 · 25; origin tickets #170 · #172 · #166 · #168). Suite s14 proves both PT hooks on a deployed copy by feeding them
// events; this probe walks the field route with a LIVE agent session — the real Claude Code CLI, headless, reading the project's own
// .claude/settings.json — so the hooks are fired by the harness, not by a test (the pattern of wh5-live-first-prompt.mjs).
//   route — a fresh git project → KAIF installed by THIS build's core (`install`) → `wire-hooks` (the task's item) →
//     (a) a live session asked to WRITE a file whose text holds the DATE placeholder → the file read back holds the clock's date, no
//         placeholder; the session ran with `--permission-mode acceptEdits` (the probe's own grant — the hook makes no permission decision);
//     (b) a live session asked to launch ONE subagent whose task is to report the first heading of STATUS.md → one line in
//         `.kaif/subagent-preamble.jsonl`; the PreToolUse hook response carries the preamble's marker; the subagent's report (the Agent tool
//         result in the stream) carries a line quoted from a document of the reading list (≥ 25 characters, verbatim).
//   observation — `claude -p … --output-format stream-json --verbose --include-hook-events --setting-sources project --model haiku`.
//   red proof — `KAIF_DIST=<dist of v2.9>`: no clock hook and no preamble hook are wired — (a) and (b) BAD by construction.
// The live sessions cost two short model calls and one subagent (HOUSE_RULES.md §7: at most two subagents at once). The child gets no
// CLAUDE* variables of this session. Git identity — by the environment only (bugs/124). The run folder is removed on OK and kept (path
// printed) on BAD. Run it alone (≈ 2–4 min). The placeholder is spelled here only as escapes (the clock hook, where wired, would fill it).
// usage: node tools/sandbox/probes/pt3-live-hooks.mjs [--keep]
// [NOT-TESTED]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const KEEP = process.argv.includes('--keep');
const RUN_TIMEOUT_MS = 300000;
const LIVE_TIMEOUT_MS = 300000;
const LIVE_MODEL = 'haiku';
const PH_DATE = '\u27E6DATE\u27E7';
const MARKER = '[KAIF subagent preamble v1]';
const QUOTE_MIN = 25;
const QUOTE_HEAD = 40;
const CLAUDE_EXE = process.env.KAIF_CLAUDE_EXE
  || join(process.env.APPDATA || '', 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-pt3-live-'));
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
for (const k of Object.keys(ENV)) if (/^CLAUDE/i.test(k)) delete ENV[k];

let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const info = (line) => console.log('    ' + line);
const tail = (s, n = 6) => String(s).split(/\r?\n/).filter(Boolean).slice(-n).join(' | ').slice(0, 600);
const git = (cwd, ...a) => spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8' });
const core = (cwd, args) => {
  const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return { code: r.status, all: (r.stdout || '') + (r.stderr || '') };
};
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

// One live prompt in the project; the stream is kept beside the run for reading
const live = (cwd, label, prompt, extra = []) => {
  const r = spawnSync(CLAUDE_EXE, ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--include-hook-events',
    '--setting-sources', 'project', '--model', LIVE_MODEL, ...extra], { cwd, env: ENV, encoding: 'utf8', timeout: LIVE_TIMEOUT_MS, maxBuffer: 1 << 26 });
  writeFileSync(join(ROOT, `live-${label}.jsonl`), (r.stdout || '') + '\n--- stderr ---\n' + (r.stderr || ''));
  const events = (r.stdout || '').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  return { code: r.status, err: r.stderr || '', events };
};
const flat = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join('\n') : v && typeof v === 'object' ? flat(v.text ?? v.content ?? '') : '');

if (!existsSync(CLAUDE_EXE)) { console.log(`REFUSED: the Claude Code CLI is not at ${CLAUDE_EXE} (KAIF_CLAUDE_EXE names another) — no live session, no verdict`); process.exit(2); }
info(`build under test: ${DIST}`);

// ---- a fresh git project, KAIF installed by this build's core, hooks wired by the task's command
const P = join(ROOT, 'proj'); mkdirSync(join(P, '.kaif', 'install'), { recursive: true });
writeFileSync(join(P, 'README.md'), '# demo\n\nA small project the probe installs KAIF into.\n');
git(P, 'init', '-q'); git(P, 'add', '-A'); git(P, 'commit', '-qm', 'init');
copyFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(P, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
copyFileSync(join(DIST, 'KAIF-CORE.mjs'), join(P, '.kaif', 'kaif-core.mjs'));
let r = core(P, ['install', '--agents', 'claude-code']);
say(r.code === 0, `install by this build's core exits 0 — ${tail(r.all, 2)}`);
r = core(P, ['wire-hooks']);
const settings = existsSync(join(P, '.claude', 'settings.json')) ? readFileSync(join(P, '.claude', 'settings.json'), 'utf8') : '';
say(r.code === 0 && /clock-now\.mjs/.test(settings) && /subagent-preamble\.mjs/.test(settings),
  `wire-hooks wires the clock hook and the subagent hook into .claude/settings.json — ${tail(r.all, 2)}`);

// ---- (a) a live write with the DATE placeholder
const NOTE = join(P, 'note.md');
let s = live(P, 'clock', `Use the Write tool exactly once to create the file note.md with exactly this content (one line): date: ${PH_DATE}\n` +
  'Copy the characters exactly as given, including the bracketed word — it is a placeholder a hook of this project fills; do NOT replace ' +
  'it with a date yourself. Do nothing else and do not read the file back. Then reply with the single word: done', ['--permission-mode', 'acceptEdits']);
const pre = s.events.filter((e) => e.subtype === 'hook_response' && e.hook_event === 'PreToolUse');
info(`clock session: exit ${s.code} · PreToolUse hook responses ${pre.length}${s.code ? ' · ' + tail(s.err, 3) : ''}`);
const note = existsSync(NOTE) ? readFileSync(NOTE, 'utf8') : '';
// the model knows today's date from its system prompt and may write it ITSELF (red run on v2.9, 16:54: the file held the date with no hook
// wired) — so the hook is judged only when the model's own Write input (the stream records it before any hook) carries the placeholder
const writes = s.events.flatMap((e) => (e.type === 'assistant' && Array.isArray(e.message?.content) ? e.message.content : []))
  .filter((c) => c.type === 'tool_use' && c.name === 'Write').map((c) => String(c.input?.content ?? ''));
say(writes.some((w) => w.includes(PH_DATE)), `(a) the model wrote the placeholder itself (else this run cannot judge the hook) — Write inputs: ${writes.length}`);
say(note.includes(`date: ${today()}`) && !note.includes(PH_DATE) && pre.some((e) => e.exit_code === 0 && /updatedInput/.test(String(e.output || e.stdout || ''))),
  `(a) the clock hook answered the write with updatedInput and the file holds the clock's date ${today()} — read back: ${JSON.stringify(note.slice(0, 60))}`);

// ---- (b) a live subagent launch
const LOG = join(P, '.kaif', 'subagent-preamble.jsonl');
// the task has nothing to do with the canon, so a canon quote in the report can only come from the preamble (first run, 16:41: the task
// "report the first heading of STATUS.md" made its answer look like a quote); the subagent runs on sonnet — haiku received the preamble
// and read one document of twelve (first run) — the probe judges the HOOK's delivery and a capable model's compliance, not haiku's
s = live(P, 'subagent', 'Use the Agent tool exactly once (subagent_type: general-purpose, model: sonnet, not in the background) with this ' +
  'task: "Count the lines of README.md and report the number." Then reply with exactly what the subagent reported, verbatim.');
const preB = s.events.filter((e) => e.subtype === 'hook_response' && e.hook_event === 'PreToolUse');
info(`subagent session: exit ${s.code} · PreToolUse hook responses ${preB.length}${s.code ? ' · ' + tail(s.err, 3) : ''}`);
const lines = existsSync(LOG) ? readFileSync(LOG, 'utf8').split('\n').filter(Boolean) : [];
say(lines.length === 1, `(b) one journal line of the preamble hook — ${lines.length}`);
say(preB.some((e) => String(e.output || e.stdout || '').includes(MARKER) && e.exit_code === 0),
  '(b) the PreToolUse hook response carries the preamble marker, exit 0');
// the subagent's report — the tool result of the Agent call in the stream
const agentIds = new Set();
for (const e of s.events) for (const c of (e.type === 'assistant' && Array.isArray(e.message?.content) ? e.message.content : []))
  if (c.type === 'tool_use' && (c.name === 'Agent' || c.name === 'Task')) agentIds.add(c.id);
let report = '';
for (const e of s.events) for (const c of (e.type === 'user' && Array.isArray(e.message?.content) ? e.message.content : []))
  if (c.type === 'tool_result' && agentIds.has(c.tool_use_id)) report += flat(c.content) + '\n';
const body = report.replace(/^[\s\S]*?The report follows:\s*/, '');   // the subagent's words, without the harness's hand-back frame
const listed = (() => { try { const m = /in this order: (.*?)\. Open your report/.exec(preB.map((e) => String(e.output || e.stdout || '')).join('\n')); return m ? m[1].split(' · ') : []; } catch { return []; } })();
const canonLines = listed.filter((n) => existsSync(join(P, n))).flatMap((n) => readFileSync(join(P, n), 'utf8').split(/\r?\n/))
  .map((l) => l.trim()).filter((l) => l.length >= QUOTE_MIN);
// a quote is usually a FRAGMENT of a canon line (run 2: «A CLAIM IS NEVER WIDER THAN THE OBSERVATION BEHIND IT.» — the tail of a longer
// line), so the direction is: every quoted span of the report (in «» or "" quotes, ≥ QUOTE_MIN chars) is searched verbatim in the canon text
// the words must be the canon's, word for word; case and markdown emphasis are not words (run 3: «Observation over guessing. I don't
// recall — I look.» against `**OBSERVATION OVER GUESSING.** I don't recall — I look.`)
const norm = (t) => t.replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const canonText = norm(canonLines.join('\n'));
const spans = [...body.matchAll(/["“«]([^"”»\n]{25,})["”»]/g)].map((m) => norm(m[1]));
// the first QUOTE_HEAD characters of a quoted span must stand in the canon: a quote runs on across a wrapped line and may re-type the
// inner quotation marks (run 4: «… a source instead of 'it should work.'» against `… a source instead` + a new line with other marks)
const quoted = spans.find((q) => q.length >= QUOTE_MIN && canonText.includes(q.slice(0, QUOTE_HEAD))) || canonLines.find((l) => body.includes(l));
info(`subagent report (${body.length} chars): ${JSON.stringify(body.replace(/\s+/g, ' ').slice(0, 200))}`);
// the thing itself, not the hook's answer: the subagent's OWN transcript opens with the preamble — the harness writes it under
// ~/.claude/projects/<the project path, encoded>/<session>/subagents/agent-<id>.jsonl; the id is printed in the hand-back
const agentId = (/agentId: (\w+)/.exec(report) || [])[1];
const findAgent = (dir, depth = 0) => {
  if (!agentId || depth > 3 || !existsSync(dir)) return null;
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, n.name);
    if (n.isFile() && n.name === `agent-${agentId}.jsonl`) return p;
    if (n.isDirectory()) { const f = findAgent(p, depth + 1); if (f) return f; }
  }
  return null;
};
const PROJECTS = join(homedir(), '.claude', 'projects');
const projDir = existsSync(PROJECTS) ? readdirSync(PROJECTS).find((n) => n.toLowerCase().endsWith(P.replace(/[^A-Za-z0-9]/g, '-').toLowerCase().slice(-40))) : null;
const agentFile = projDir ? findAgent(join(PROJECTS, projDir)) : null;
const agentRecs = agentFile ? readFileSync(agentFile, 'utf8').split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
const firstUser = agentRecs.find((x) => x.type === 'user');
const firstText = firstUser ? flat(firstUser.message?.content) : '';
say(firstText.startsWith(MARKER) && firstText.includes('Count the lines of README.md'),
  `(b) the subagent's own transcript opens with the preamble and keeps the task after it — ${agentFile ? 'transcript found' : 'transcript NOT found'}`);
const reads = agentRecs.flatMap((x) => (x.type === 'assistant' && Array.isArray(x.message?.content) ? x.message.content : []))
  .filter((c) => c.type === 'tool_use' && c.name === 'Read').map((c) => String(c.input?.file_path || '').split(/[\\/]/).pop());
info(`documents of the reading list the subagent read: ${listed.filter((n) => reads.includes(n)).length} of ${listed.length}`);
say(agentIds.size === 1 && !!quoted, `(b) the subagent's report quotes a canon line of the reading list — ${quoted ? JSON.stringify(quoted.slice(0, 80)) : 'none found'}`);

console.log(bad ? `\nFAILED: ${bad} BAD — the run folder is kept: ${ROOT}` : '\nALL OK — in live sessions the clock fills the written date and a subagent enters the project by the canon');
if (!bad && !KEEP) rmSync(ROOT, { recursive: true, force: true }); else if (!bad) console.log(`kept: ${ROOT}`);
process.exit(bad ? 1 : 0);
