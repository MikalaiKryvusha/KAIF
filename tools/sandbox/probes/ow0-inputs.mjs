// tools/sandbox/probes/ow0-inputs.mjs — a PROBE (not a polygon suite): step OW0 of plans/119 (2.8, epic OW) — every input the epic
// builds on, re-located at HEAD. The recon (researches/32 §2б–§2г, §2ж) and the field tickets (#100 #101 #104) cite LINE addresses;
// a line address rots with every edit, a SIGNATURE (a unique fragment of the line) does not. For each input the probe finds the
// signature's current line(s) and prints one table row: matched (inside the cited range) · moved → new line · absent.
// Mode `count` judges a claimed number of hits instead (a recon line of the form «grep … → N»).
// usage: node tools/sandbox/probes/ow0-inputs.mjs          (read-only; prints a markdown table; exit 1 when an input is ABSENT)
// [TESTED: 2026-09-25 14:34 +03:00 · session 74: 29 inputs located at HEAD c969e35 — verdicts matched · moved → N · moved: N hit(s) ·
//  present all observed; ABSENT proved on a COPY with input 1's signature spoiled (14:35:10 — ABSENT, exit 1; the copy removed);
//  report testcases/reports/2026-09-25_ow0-inputs.md]
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const C = 'framework/tools/contour/';
const G = 'framework/AGENT_GUIDE.md';
const S = (n) => `framework/skills/${n}/SKILL.md`;
const GUIDE_CEILING = 1080; // tools/check-framework.mjs guard 5j: 0.9 × the 1200 budget of the guide template

// [ticket/source, recon citation, file, signature, cited line range or null, mode]
const INPUTS = [
  ['#74', 'core.mjs:351 — the door prints `grep -rniE`', C + 'core.mjs', /return words\.length \? 'grep -rniE "'/, [351, 351]],
  ['#74', 'core.mjs:390 — `N hits · prior: none` refused only with hits', C + 'core.mjs', /kind: 'hits-without-prior'/, [390, 390]],
  ['#82', 'core.mjs:372–378 — the door judges a DOCUMENT by its header date', C + 'core.mjs', /judged: Boolean\(date\) && date >= ARCHAEOLOGY_SINCE/, [372, 378]],
  ['#82', '`grep -i archaeolog framework/AGENT_GUIDE.md` → 1 (the history line only)', G, /archaeolog/i, 1, 'count'],
  ['#86', 'AGENT_GUIDE.md:883–894 — «Owner\'s drive-by notes mid-task» paragraph', G, /\*\*Owner's drive-by notes mid-task go to the backlog/, [883, 894]],
  ['#86', '/what-next — the shelf of owner words holds 48 h only', S('what-next'), /words of the last 48 h/, null],
  ['#86', 'contour/review.mjs:310–313 — `implStateOf` only among the unanswered', C + 'review.mjs', /^export function implStateOf/, [310, 313]],
  ['#88', 'AGENT_GUIDE.md:889–890 — «explicit "switch to this" → switch»', G, /explicit "switch to this" → switch/, [889, 890]],
  ['#88', 'dayloop:18–20 — the same switch without parking', S('dayloop'), /classify before you switch/, [18, 20]],
  ['#88', 'nightloop:23–24 — the same', S('nightloop'), /classify before you switch/, [23, 24]],
  ['#88', 'autoloop:93 — «explicit "stop/switch" interrupts»', S('autoloop'), /explicit "stop\/switch" interrupts/, [93, 93]],
  ['#95', 'contour/review.mjs:140 — `signalCall` exists, no CLI door', C + 'review.mjs', /^export function signalCall\(/, [140, 140]],
  ['#95', '/owner-reviews I5 — the call follows an opened page only', S('owner-reviews'), /^- \*\*I5\. The signal follows a successfully opened page/, null],
  ['#95', '/owner-reviews C8 — the signal strictly after the page', S('owner-reviews'), /^- \*\*C8\. The signal:/, null],
  ['#98', 'contour/texts.mjs:131–137 — the call phrase names owner and project, not the session', C + 'texts.mjs', /awaits your review/, [131, 137]],
  ['#98', '/owner-reviews I28 — «voice call by name» = the owner\'s name', S('owner-reviews'), /^- \*\*I28\. The voice call by name/, null],
  ['#98', '/team-deployment — not a line about the call (hits of call|voice|signal are about other things)', S('team-deployment'), /call|voice|signal/i, 2, 'count'],
  ['№126', 'contour/review.mjs:771–774 — a write closes the page', C + 'review.mjs', /setTimeout\(function\(\)\{window\.close\(\)/, [771, 774]],
  ['№126', 'contour/review.mjs:1016–1019 — the batch page stays', C + 'review.mjs', /the batch does NOT end on the first document/, [1016, 1019]],
  ['№126', 'contour/review.mjs:1021–1022 — the process exits (I8)', C + 'review.mjs', /ending the contour \(I8\)/, [1021, 1022]],
  ['№126', 'core.mjs:609 — decision.json overwritten, no merge', C + 'core.mjs', /writeFileSync\(p\.decision, /, [609, 609]],
  ['№126', '_interactive-contour-spec.md:77 — «Saving TERMINATES the process»', 'framework/templates/_interactive-contour-spec.md', /Saving TERMINATES the process/, [77, 77]],
  ['№126', 'owner-reviews SKILL.md:92–96 — I8 «Any recorded decision terminates the contour»', S('owner-reviews'), /^- \*\*I8\. Saving wakes the waiter/, [92, 96]],
  ['bugs/123', 'the hook of the first word — framework/hooks/prompt-resume-word.mjs', 'framework/hooks/prompt-resume-word.mjs', /resume/, null],
  ['#100', 'v2.7 review.mjs:242 — `readQueue(...).filter` in pendingDocs (the TypeError)', C + 'review.mjs', /readQueue\(root\)\.filter\(/, [242, 242]],
  ['#100', 'readQueue reads queue.json with fallback [] — no shape check', C + 'review.mjs', /^export function readQueue\(root, cfg = cfgOf\(root\)\) \{ return readJsonOr\(/, null],
  ['#104', '«Showing is an action, not a link» — the neighbour of the new rule', G, /^\*\*Showing is an action, not a link\.\*\*/, null],
  ['#104', '/interview step 3a — the scenario of what the owner will see', S('interview'), /^### Step 3a\. Every question and every option — a scenario/, null],
  ['#104', 'REQUIREMENTS_FRAMEWORK — «The scenario form»', 'framework/REQUIREMENTS_FRAMEWORK.md', /^### The scenario form/, null],
];

const linesOf = (f) => readFileSync(join(REPO, f), 'utf8').split(/\r?\n/);
let absent = 0;
console.log('| # | source | input (as the recon/ticket cites it) | at HEAD | verdict |');
console.log('|---|---|---|---|---|');
INPUTS.forEach(([src, cite, file, re, want, mode], i) => {
  if (!existsSync(join(REPO, file))) { absent++; console.log(`| ${i + 1} | ${src} | ${cite} | \`${file}\` — no such file | ABSENT |`); return; }
  const hits = linesOf(file).map((l, n) => (re.test(l) ? n + 1 : 0)).filter(Boolean);
  let verdict;
  if (mode === 'count') verdict = hits.length === want ? `matched (${hits.length})` : `moved: ${hits.length} hit(s), cited ${want}`;
  else if (!hits.length) { verdict = 'ABSENT'; absent++; }
  else if (!want) verdict = 'present';
  else verdict = hits.some((n) => n >= want[0] && n <= want[1]) ? 'matched' : `moved → ${hits.join(', ')}`;
  const at = hits.length ? `\`${file}:${hits.slice(0, 4).join(',')}\`` : `\`${file}\` — 0 lines`;
  console.log(`| ${i + 1} | ${src} | ${cite.replace(/\|/g, '/')} | ${at} | ${verdict} |`);
});
const guide = linesOf(G).length - 1; // the file ends with a newline — `wc -l` counts newlines
console.log(`\n${G}: ${guide} lines · ceiling ${GUIDE_CEILING} · free ${GUIDE_CEILING - guide}`);
console.log(absent ? `BAD — ${absent} input(s) ABSENT at HEAD` : `GOOD — every input located (${INPUTS.length})`);
process.exit(absent ? 1 : 0);
