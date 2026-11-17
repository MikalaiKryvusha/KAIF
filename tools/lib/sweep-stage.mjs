// tools/lib/sweep-stage.mjs — the ONE form of a «stage everything» INSTRUCTION (version KAIF 2.10, epic UB, step UB5; origin bugs/79 — a
// sweeping `git add -A` after the `git diff --stat` check carried two owner files into origin under the agent's message). Read by the
// build guard 5y (tools/check-framework.mjs) and the suite s01 (case «S9 UB5»); the probe tools/sandbox/probes/ub5-sweep-red.mjs proves
// both answers on copies of the tree. The first form of 5y caught 3 of 15 plausible forms (the UB5 judge, finding 4); the second read
// any «no/not/don't» within 30 characters before the command as a negation and missed 14 forms of 14 (the re-judgment, finding 3 —
// «If the project has no commit tool: `git add -A`, then …» among them).
//   SWEEP          — a command that stages everything: `git add -A` · `--all` · `-u` · `--update` · `.` (before a space, a quote, a
//                    backtick, a comma, a colon, a closing bracket or the end) · `git commit` with `-a`/`-am` (any short-flag cluster
//                    carrying `a`) or `--all` anywhere in the command; `git commit --amend` and `git add .gitignore` are not ones.
//   sweepInSkill() — a SKILL line carries SWEEP as an order: any occurrence — except one with a negation RIGHT before it («never
//                    `git add -A`», «not git add -A»). In a skill, name a sweep only in that form: a skill is read as orders.
//   sweepInDoc()   — a DOCUMENTATION line (the slot table of the core's narrative): only the instruction forms — SWEEP followed by a
//                    sequencing word (`, then` · `then` · `&&` · `;`), or a code span carrying SWEEP together with a commit or push; a
//                    sentence ABOUT the defect («a sweeping `git add -A` written into a skill is…») stays legal.
// [TESTED: 2026-11-17 · probe tools/sandbox/probes/ub5-sweep-red.mjs — control 0, the texts of 3057175 exactly 5, fourteen injected
//  orders exactly 14 and four legal lines 0, the documentation forms 1 of 2; report testcases/reports/2026-11-17_ub5-no-sweeping-stage.md]
export const SWEEP = /git\s+add\s+(?:-A\b|--all\b|-u\b|--update\b|\.(?=[\s`'",:)]|$))|git\s+commit\b[^\n`;&|]*?\s(?:-[a-zA-Z]*a[a-zA-Z]*\b|--all\b)/;
const NEGATION_RIGHT_BEFORE = /\b(?:never|not)\s*[`(]?\s*$/i;
// the source is GROUPED before the tail: a bare concatenation binds the tail to SWEEP's last alternative only (caught on the first build)
const SEQUENCED = new RegExp('(?:' + SWEEP.source + ')[`\'"]?\\s*(?:,\\s*)?(?:then\\b|&&|;)');

export function sweepInSkill(line) {
  const m = SWEEP.exec(line);
  if (!m) return false;
  return !NEGATION_RIGHT_BEFORE.test(line.slice(0, m.index));
}

export function sweepInDoc(line) {
  if (SEQUENCED.test(line)) return true;
  return (line.match(/`[^`]+`/g) || []).some((s) => SWEEP.test(s) && /git\s+(?:commit|push)/.test(s.replace(SWEEP, '')));
}
