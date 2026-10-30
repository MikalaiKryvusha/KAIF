// tools/sandbox/probes/pt2-subagent-preamble.mjs — a PROBE (not a polygon suite): the acceptance of step PT2 of plans/142 (version KAIF 2.10,
// epic PT, criterion 25; origin tickets #166 · #168), written BEFORE the code like pt1-clock-now.mjs. It runs the hook as Claude Code runs it —
// an event JSON on stdin, the project root as cwd — in a temporary project and reads stdout, the exit code and the journal file:
//   (1) a subagent launch (`Agent`) with a task → `updatedInput` whose `prompt` is the marked preamble FOLLOWED BY the task byte for byte;
//       every other input field kept; no `permissionDecision` anywhere (the launch keeps the permission it had — researches/41);
//   (2) the preamble's reading list is step 1 of `/resume` READ from `.claude/skills/resume/SKILL.md` — files that exist only; the chronicle
//       and the reference never (the field's lesson: a subagent of eight small tasks read 16 documents first);
//   (3) the preamble asks for one quoted canon line bearing on the task and names the brief's bounds a task may lack: no nested subagents,
//       no commit and no push;
//   (4) a second pass over the rewritten task changes nothing (idempotent by the marker) — silence;
//   (5) the alias `Task` is a subagent launch too;  (6) any other tool — silence;  (7) a launch without a task — silence;
//   (8) each firing appends one JSON line to `.kaif/subagent-preamble.jsonl` (exactly two after (1) and (5));
//   (9) unreadable stdin → exit 0, silence (a hook never breaks the session);
//  (10) the owner-language copy of the skill (`## Шаг 1.`) gives the same list as the English one (`## Step 1.`).
// usage: node tools/sandbox/probes/pt2-subagent-preamble.mjs [<hook.mjs>]   (default framework/hooks/subagent-preamble.mjs; no hook → code 2;
//        ≈ 2 s, temporary directories only)
// [NOT-TESTED]
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const HOOK = resolve(process.argv[2] || join(REPO, 'framework', 'hooks', 'subagent-preamble.mjs'));
if (!existsSync(HOOK)) { console.log(`no hook at ${HOOK} — the acceptance waits for the code (code 2)`); process.exit(2); }

const PRESENT = ['STATUS.md', 'AGENT_GUIDE.md', 'PHILOSOPHY.md', 'GOAL.md', 'HOUSE_RULES.md', 'EXPERIENCE.md', 'PROJECT_HISTORY.md', 'KAIF_REFERENCE.md'];
const MUST_LIST = ['STATUS.md', 'AGENT_GUIDE.md', 'PHILOSOPHY.md', 'GOAL.md', 'HOUSE_RULES.md', 'EXPERIENCE.md'];
const MUST_NOT = ['MASTER_PLAN.md' /* named by step 1, absent here */, 'PROJECT_HISTORY.md', 'KAIF_REFERENCE.md'];
const TASK = 'Count the files in tools/ and report the number.\nSecond line: «кириллица» stays byte for byte.';

function project(skillSource) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-pt2-'));
  mkdirSync(join(dir, '.claude', 'skills', 'resume'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'resume', 'SKILL.md'), readFileSync(skillSource));
  mkdirSync(join(dir, '.kaif'), { recursive: true });
  for (const n of PRESENT) writeFileSync(join(dir, n), `# ${n}\n`);
  return dir;
}
const run = (dir, input) => spawnSync(process.execPath, [HOOK], { cwd: dir, input, encoding: 'utf8' });
const event = (dir, tool, toolInput) => JSON.stringify({ hook_event_name: 'PreToolUse', cwd: dir, tool_name: tool, tool_input: toolInput });
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };

let bad = 0;
const ok = (good, line) => { if (!good) bad++; console.log((good ? 'ok   ' : 'FAIL ') + line); };

const dir = project(join(REPO, 'framework', 'skills', 'resume', 'SKILL.md'));
const launch = { description: 'count files', prompt: TASK, subagent_type: 'general-purpose', run_in_background: true };
const r1 = run(dir, event(dir, 'Agent', launch));
const o1 = parse(r1.stdout);
const u1 = o1?.hookSpecificOutput?.updatedInput;
const pre = u1 && typeof u1.prompt === 'string' && u1.prompt.endsWith(TASK) ? u1.prompt.slice(0, -TASK.length) : '';
ok(r1.status === 0 && o1?.hookSpecificOutput?.hookEventName === 'PreToolUse' && !!pre, '(1) Agent → updatedInput, the task is the prompt\'s tail byte for byte');
ok(!!u1 && u1.description === launch.description && u1.subagent_type === launch.subagent_type && u1.run_in_background === true,
  '(1) every other input field kept');
ok(!/permissionDecision/.test(r1.stdout || ''), '(1) no permissionDecision in the answer');
ok(MUST_LIST.every((n) => pre.includes(n)) && MUST_NOT.every((n) => !pre.includes(n)),
  `(2) the list is /resume step 1, existing files only — listed: ${MUST_LIST.filter((n) => pre.includes(n)).length}/${MUST_LIST.length}, ` +
  `wrongly listed: ${MUST_NOT.filter((n) => pre.includes(n)).join(', ') || 'none'}`);
ok(/quot/i.test(pre) && /sub-?agent/i.test(pre) && /commit/i.test(pre) && /push/i.test(pre), '(3) quote a canon line · no nested subagents · no commit, no push');
const r2 = run(dir, event(dir, 'Agent', u1 || launch));
ok(r2.status === 0 && !(r2.stdout || '').trim(), '(4) a second pass changes nothing — silence');
const r5 = run(dir, event(dir, 'Task', { description: 'x', prompt: 'Do x.' }));
ok(parse(r5.stdout)?.hookSpecificOutput?.updatedInput?.prompt?.endsWith('Do x.') === true, '(5) the alias Task is a launch too');
const r6 = run(dir, event(dir, 'Bash', { command: 'ls' }));
ok(r6.status === 0 && !(r6.stdout || '').trim(), '(6) another tool — silence');
const r7 = run(dir, event(dir, 'Agent', { description: 'no task' }));
ok(r7.status === 0 && !(r7.stdout || '').trim(), '(7) a launch without a task — silence');
const log = join(dir, '.kaif', 'subagent-preamble.jsonl');
const lines = existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean) : [];
ok(lines.length === 2 && lines.every((l) => parse(l)), `(8) one JSON journal line per firing — ${lines.length} (want 2)`);
const r9 = run(dir, '{ not json');
ok(r9.status === 0 && !(r9.stdout || '').trim(), '(9) unreadable stdin → exit 0, silence');
rmSync(dir, { recursive: true, force: true });

const ruSkill = join(REPO, '.claude', 'skills', 'resume', 'SKILL.md');
const dirRu = project(ruSkill);
const pRu = parse(run(dirRu, event(dirRu, 'Agent', { prompt: TASK })).stdout)?.hookSpecificOutput?.updatedInput?.prompt || '';
ok(MUST_LIST.every((n) => pRu.includes(n)) && MUST_NOT.every((n) => !pRu.includes(n)), '(10) the owner-language skill (Шаг 1.) gives the same list');
rmSync(dirRu, { recursive: true, force: true });

console.log(bad ? `pt2 acceptance: ${bad} FAIL` : 'pt2 acceptance: all ok');
process.exit(bad ? 1 : 0);
