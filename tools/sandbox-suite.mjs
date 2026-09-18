#!/usr/bin/env node
// [TESTED: 2026-08-21 · прогон npm run test:core: преполёты зелёные, «all 14 suites green»;
//  именование упавшего свода доказано красным на копии сюиты с подложным всегда-красным сводом —
//  «✖ s99-always-red.mjs FAILED (exit 1)» + имена в итоговой строке (bugs/61, рецидив 2026-08-21)]
// tools/sandbox-suite.mjs — the PERMANENT sandbox polygon of the update machinery (plan 21 §5.6).
// Runs every core sandbox suite end-to-end in the OS temp dir. Mandatory before a release and
// after any change to framework/installer/* or tools/build-framework.mjs — verification that
// lives only in a session scratchpad dies with the session (the exact class the plan-21 review
// flagged for the splitter pin).
//
// The suites cover the FIELD PROFILE MATRIX of researches/07 §1 (eight real 1.6-update reports),
// plus the optional tool modules of plan 20 phase 5:
//   s01 — fresh/anonymous/legacy installs, ignore-first, honest logs   (profiles 03, 06; GH #1)
//         + T4: портрет владельца — опциональный канон-файл (скелет едет, его удаление = MISSING;
//           AUTHOR_STYLOMETRY.md не едет никогда и переживает update побайтно)
//   s02 — modular update: NDim two-cycle localization, KPOT merges, i18n, splitter pin (05, 03)
//   s03 — receipts/history, adopt-current (manual migration), diff, executing checkpoints (07, 04)
//   s04 — anonymous mechanical bootstrap, synthetic legacy baseline, news interval (01, 02, 06, 08)
//   s05 — kaif-provenance: mark pairing, canon scope, accept registry, quoted-docs immunity
//   s06 — kaif-canon-lint: forbidden/required guards, selftest, CRLF/BOM tolerance
//   s07 — translated-wholesale deployment (ndim 2.0 report, K1/K2) + K3 diff-on-v1 + K4/K5 (plan 23)
//   s08 — the three 2.1-update field faces (NDim/KLAS/KrinikCam): translation vs insertion,
//         share-based wholesale ceiling, auto-i18n, real template deltas in the task,
//         frontmatter pseudo-module, two-headed-skill check guard (plan 41, phase L2)
//   s09 — CLI safety & green lies (plan 42, phase L3): bare run = help, argv whitelists,
//         task never clobbered checkpoint-less, SKIPPED/3 for unconfigured guards, localized
//         provenance marks, executing checkpoints, --verdict-file, write-counting counters
//   s10 — audit noise & honesty (plan 43, phase L4): stale-claims precision on the field
//         fixture (adjacency, quotes/journals/mirrors/owner docs, file cap "shown N of M",
//         item order after review-news), translated module audit (localized ≠ ABSENT),
//         declared-sphere-only placeholder scope, the STATUS soft-length warning guard
//   s11 — L5 remaining field asks (plan 44): placeholder items name REAL addresses (declared
//         sphere included, foreign spheres excluded), sphere-sync/local-inventories scopes,
//         canonical project-name (command + executing checkpoint + fill-map healing),
//         honest route label (bootstrap vs legacy-bootstrap), language-pack honesty line,
//         pre-update backup tree, owner-lines warning on merge items
//   s12 — K5 interactive-contour canon (plan 48): the vendored-contract layer roster
//         (I/P/G/T/C/QA/DEF) present in the dist skill section AND the RU wrapper mirror,
//         M8/red-proof anchors, roster red-proof by mutation, contour tool selftests
//   s13 — kaif-requirements-lint (epic N, plan 38): the stop-word dictionary as a guard —
//         red proven on unverifiable wording, green on measurable fit criteria, quotes/❌/
//         code/justifications legal, requirement-section scope, SKIPPED=3 when nothing to scan
//   s14 — refresh-hooks module (epic O, plan 57): deploy WITH the module (files land in
//         .kaif/hooks/, three hooks obey the live Claude Code contract: order after compaction,
//         marker-age timer silent-while-fresh, once-per-session STATUS guard) and deploy
//         WITHOUT WIRING (no settings.json → every gate green: optionality is ACTIVATION, not
//         file presence; deleted module files stay an honest MISSING, as for the tool modules)
//   s15 — kaif-guard-lint (epic CN 2.5, plan 83; origin issue #35): the guard-declaration block
//         as a guard — red on @guard without GAP and @forensic DURABLE-AT: close, green on the
//         declared block (NOT YET visible in the summary), SKIPPED=3 on a tree without markers
//   s16 — doc size budgets (epic CN 2.5, plan 83 step CN6; field request 09): `check` warns
//         above the per-document line budget of the re-read core — silent on a fresh deploy,
//         warning names the bloated document and its budget, STATUS keeps its bonsai hint,
//         exit stays 0 (advisory, never a failure)
//   s17 — kaif-core report (epic SG 2.5, plan 84; field: the delivery step as prose is blocked
//         by an agent-system classifier): a stand-in `gh` on the KAIF_GH seam (the polygon never
//         performs an outward action) — delivery writes the URL into the ticket, dry-run calls
//         nothing, refusals named (anonymous · no gh · not a ticket · gh refused), idempotent on
//         a delivered ticket, TIMEOUT is "outcome unknown" (exit 3), never a refusal
//   s18 — update symmetries (epic US 2.5, plan 86; origin issues #27/#31/#32, KAGO R2): an
//         anchored pair (creed, prayer) arrives whole or goes to the task as one item — never an
//         END without its BEGIN; a new module never lands INSIDE a pair open on disk; the
//         wholesale verdict prints its numbers; two `diff --source` runs print the same; the
//         `stale-claims` item is unconditional (`no lines found`) and scans the project's
//         scripts (package.json pin); English arrivals on a ru deployment are named in the task
//         and counted by `check`; EOL by dominance; a ready `git diff v<from> v<to>` per
//         wholesale file; `check` reddens an unpaired anchor (fence-aware); the rehearsal is
//         BINDING (`diff --source` records verdicts, a mismatching live verdict freezes the
//         file, `verdict-mismatch` item + receipt); deprecations name their successor and the
//         kept ones are counted; `project-name` guidance precedes the act (file form named, a
//         mangled argv name refused); one placeholder-surface predicate for the gate and the
//         task item; the anonymous → origin switch names kept anonymity-conditioned files
//
//   s19 — kaif-scenario-lint (epic SF 2.5, plan 88; origin issue #39): the four-line scenario form
//         of an acceptance criterion (Situation · Action · Result · Check) keeps its shape — seven
//         rules as data, red on a broken fixture in both shipped languages, green on a clean one,
//         an empty Check is a warning, SKIPPED on a tree without scenarios, fenced templates invisible
//   s21 — update on the real route (epic UR 2.6, plan 91; origin #42 ×3 · #48 R2/R3 · #44 · #41 wish 3 ·
//         court RL 2.5 E-H3): `--rehearsal` reaches the bootstrap route and the loader refuses an unknown
//         flag BEFORE any download, the auto record is consumed on that route too, the preview and the
//         update count ONE candidate set; hand-filled slots are DERIVED from the disk — "template + fills"
//         is untouched (mechanical replace with the fills kept, mechanical deprecation, no false
//         "promised upstream line", `fills` cached in the manifest), a module already equal to the
//         incoming template is not "upstream changed it"; `stale-claims` sees ANY version older than the
//         one being installed (`gt` defined once); the bootstrap task renders −/+ from the old texts
//         and names English arrivals; red proven on the HEAD core before UR via KAIF_DIST / KAIF_LOADER
//   s25 — kaif-testrun-lint + the `check` axis "/resume covers the re-read core" (epic TR 2.7, plan 104;
//         origin issue #59 "THERE WAS NO TESTING"): the seven-field run report keeps its shape — selftest in
//         both languages, a clean catalog green, six mutations red by name, SKIPPED without a reports/
//         catalog, the home read from the marker; on a deployed copy the template and the module arrive,
//         a /resume that lost the GOAL.md bullet makes `check` warn by name (still exit 0), an unfilled
//         template copy reddens; red proven on the 2.6 core via KAIF_DIST (`git show v2.6:dist/…`)
//   s26 — kaif-voice-lint (epic VC 2.7, plan 105; origin issue #61 "how many times did you compare this text with
//         my stylometry?" — zero): the portrait's §8 TABLE is the single source of patterns — selftest in both
//         languages, a hit named `file:line — «fragment» → hint` (exit 1) on an EN and a RU project, a clean file
//         green, `--warn` exit 0, a fence invisible, a prose §8 / no portrait / placeholder-only table SKIPPED (3),
//         the portrait path read from the marker, no files → usage (2); on a deployed copy the module and the
//         skeleton with the table form arrive, the unfilled skeleton copy is SKIPPED and one filled row fires;
//         red proven on the 2.6 core via KAIF_DIST
//   s27 — the version's RENAME MAP (epic HO 2.7, plan 106; origin issue #57 "that is not a baton — the
//         industry calls it a HANDOVER"): a renamed module heading is REPLACED, never duplicated — an
//         untouched module lands under the new heading and the log SAYS "renamed: …", a module the owner
//         EDITED keeps his text with ONE heading and a task item naming the rename (the duplicate this
//         closes), a rename whose old anchor is absent is named in the log and does not fail the update;
//         plus the live 2.7 pair declared as DATA in the builder and shipped in the bundle meta. Grown
//         from probe ho-rename-duplicate (red before the fix: 2 of 8 on build 538)
// Usage: node tools/sandbox-suite.mjs   (npm run test:core)
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFixedTempNames, selfProof } from './lib/temp-root.mjs';
import { scanSuite } from './sandbox-mute-guard.mjs';
import { distFreshness } from './lib/source-tree-sha.mjs'; // LP (2.7): refuse a STALE dist before the first suite

// s09 doctrine for this runner too (court RL 2.6, findings A-F1 / C-F7: `--help` used to start the FULL polygon):
// the runner takes NO arguments — `--help`/`-h` print usage and exit 0, anything else is refused with usage and
// exit 1; one suite runs directly: node tools/sandbox/sNN-<name>.mjs. [TESTED: 2026-09-06 · --help → 0, --bogus → 1, bare run → polygon]
if (process.argv.length > 2) {
  const help = process.argv.includes('--help') || process.argv.includes('-h');
  const usage = 'usage: npm run test:core   (= node tools/sandbox-suite.mjs, no arguments — the full polygon)\n' +
                '       node tools/sandbox/sNN-<name>.mjs   (one suite, directly)\n';
  if (help) { console.log(usage); process.exit(0); }
  console.error('sandbox-suite: unknown argument(s) ' + process.argv.slice(2).join(' ') + '\n' + usage); process.exit(1);
}

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), 'sandbox');
const REPO = resolve(HERE, '..', '..');
const SUITES = ['s01-field-fixes.mjs', 's02-modular-update.mjs', 's03-receipts-tools.mjs', 's04-anon-legacy.mjs',
                's05-provenance.mjs', 's06-canon-lint.mjs', 's07-translated.mjs', 's08-l2-faces.mjs',
                's09-l3-cli-safety.mjs', 's10-l4-audit-noise.mjs', 's11-l5-remaining.mjs',
                's12-k5-contour-canon.mjs', 's13-requirements-lint.mjs', 's14-refresh-hooks.mjs',
                's15-guard-lint.mjs', 's16-doc-budgets.mjs', 's17-report.mjs',
                's18-update-symmetries.mjs', 's19-scenario-lint.mjs', 's21-update-route.mjs',
                's22-contour-shipped.mjs', 's23-ranking-lint.mjs', 's24-attribution-lint.mjs',
                's25-testrun-lint.mjs', 's26-voice-lint.mjs', 's27-rename-map.mjs'];
// ── Preflight guard (bugs/59): no tool may take a scratch dir under a FIXED name in the shared
// OS temp. A fixed name is a shared resource with no owner: two concurrent runs (two agent
// sessions, the polygon next to a single suite, `--selftest` next to a plain run, CI next to a
// local run) delete it from under each other and the main gate goes FALSELY red. A false alarm is
// worse than a miss — it teaches the operator to re-run instead of looking. The guard proves
// itself red on a synthetic mutation first: a check that never failed proves nothing.
const proofFails = selfProof();
const fixedNames = auditFixedTempNames(REPO);
for (const f of proofFails) console.error('✖ temp-root selfproof: ' + f);
for (const v of fixedNames) console.error('✖ fixed temp name (bugs/59): ' + v);
if (proofFails.length || fixedNames.length) {
  console.error(`\n❌ preflight: ${proofFails.length} selfproof failures, ${fixedNames.length} fixed temp names — take the root via tools/lib/temp-root.mjs`);
  process.exit(1);
}
// Preflight guard (bugs/55 F5): no suite may carry an assertion whose disjunction ends in a
// CONSTANT TRUE — such an assert is true for any operands, so the engine never even evaluates the
// check, and the suite prints ✅ over a broken path. The project already WROTE this rule as prose
// (tools/verify-contour.mjs C11) and then broke it in a neighbouring tool; prose does not enforce.
// The needle is assembled from parts on purpose, so this guard is not its own violation and the
// acceptance grep of bugs/55 F5 stays literally green across every file it scans.
const TAUTOLOGY = ['||', 'true'].join(' ');
const tautologies = [];
for (const s of [...SUITES.map((n) => join(HERE, n)), fileURLToPath(import.meta.url)]) {
  readFileSync(s, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (line.includes(TAUTOLOGY)) tautologies.push(`${basename(s)}:${i + 1} — ${line.trim()}`);
  });
}
for (const t of tautologies) console.error('✖ tautological assert (bugs/55 F5): ' + t);
if (tautologies.length) {
  console.error(`\n❌ preflight: ${tautologies.length} assertion(s) that can never be false — a check that cannot fail proves nothing`);
  process.exit(1);
}
// Preflight guard (bugs/61): no suite may carry a MUTE command — one whose result reaches no
// assert at all. A suite is commands (which bring the tree to a state) plus asserts (which judge
// the state); when a mute command fails, the red belongs to a NEIGHBOUR assert and speaks about
// the symptom ("history did not grow") while the cause — the exit code and output of the command
// that actually failed — is discarded. That is literally how bugs/61 was born: a red that could
// not be reproduced in 108 isolated iterations or 12 full suite runs, because nothing kept the
// evidence. Two legal moves, both visible in the source: judge the result inside `ok(...)`, or
// wrap the setup step in `must(run, …)` from tools/lib/sandbox-run.mjs. Debt is ZERO by
// construction — all 30 sites were converted the day the guard was born, so this is a GATE.
const mute = [];
for (const s of SUITES) {
  const { findings } = scanSuite(readFileSync(join(HERE, s), 'utf8'));
  for (const x of findings) mute.push(`${s}:${x.line} — ${x.kind}: ${x.src}`);
}
for (const m of mute) console.error('✖ mute command (bugs/61): ' + m);
if (mute.length) {
  console.error(`\n❌ preflight: ${mute.length} command(s) whose result no assert ever sees — judge the result` +
                ' inside ok(...), or wrap the setup step in must(run, …) from tools/lib/sandbox-run.mjs');
  process.exit(1);
}
// Preflight guard (bugs/71 №3): every machinery file carries a TEST-STATUS MARKER. The canon has
// demanded this since 2.0 (AGENT_GUIDE checklist, step 10: raw work is `[NOT-TESTED]`, work
// verified by observation is `[TESTED: date · how]`) — and 20 files out of 44 carried neither,
// precisely the ones edited most often. A rule that only lives in a checklist is a rule the
// checklist reader believes is already satisfied: that is the `[TESTED]` fraud one level up, at
// the rule rather than the artifact. Debt is ZERO by construction — all 20 were marked BY
// OBSERVATION the day this gate was born (one of them honestly `[NOT-TESTED]`, because its
// toolchain is not installed in this tree) — so this is a GATE, not an adviser.
const MARKER_RE = /\[TESTED:|\[NOT-TESTED\]/;
const unmarked = [];
{
  const dirs = [['tools', REPO], ['tools/lib', REPO], ['tools/sandbox', REPO]];
  for (const [rel] of dirs) {
    const dir = join(REPO, rel);
    if (!existsSync(dir)) continue;
    for (const n of readdirSync(dir)) {
      if (!n.endsWith('.mjs')) continue;
      const p = join(dir, n);
      if (statSync(p).isDirectory()) continue;
      if (!MARKER_RE.test(readFileSync(p, 'utf8'))) unmarked.push(`${rel}/${n}`);
    }
  }
}
for (const u of unmarked) console.error('✖ no test-status marker (bugs/71): ' + u);
if (unmarked.length) {
  console.error(`\n❌ preflight: ${unmarked.length} machinery file(s) without a test-status marker — add` +
                ' `[TESTED: <date> · <what was observed>]` or an honest `[NOT-TESTED]`; never stamp one without a run');
  process.exit(1);
}
// Preflight guard (bugs/116): a suite or probe that starts the interactive-contour GENERATOR as a child process
// runs it QUIET — `env: quietEnv()` from tools/lib/sandbox-run.mjs, a PATH with no programs on it. The generator
// is the one piece of machinery that faces the HUMAN (a window, beeps, a voice), and a suite may run an OLD
// generator (the KAIF_DIST seam) that does not know the new flags and does its default instead: on the night of
// 2026-09-12 four red-proof runs raised the fixture page "fresh · Interview #052 — проба" on the owner's screen
// with a system voice, and he answered into it three times. A flag cannot promise silence to a version that
// does not know it; the environment can. Debt is ZERO by construction (s12, s22 and probe ic3 converted the day
// the guard was born), so this is a GATE.
// @guard sandbox-quiet-child
// THREAT:         a sandbox run of the contour generator reaches the owner's screen and ears (window + voice)
// PROVED-AGAINST: the synthetic source below — a generator path + a child-process call without quietEnv →
//                 flagged; the same source with quietEnv → clean (selfproof, every polygon run); the quiet env
//                 itself proven by tools/lib/sandbox-run.mjs --selftest (the names the generator spawns by name —
//                 cmd.exe · powershell.exe on Windows — neither found on the quiet child's PATH nor startable:
//                 ENOENT; red on copies with the real PATH, and the probe never runs anything that can show or sound)
// GAP:            a generator started through a helper that hides the path (a variable built elsewhere) is not
//                 recognised by this text scan; the scan clears a WHOLE FILE by one `quietEnv(` call, so a second
//                 launch in the same file without it passes; an in-process `import()` of the generator (s22 renders
//                 with buildPage/selfCheck) is not a child process and runs with the parent's PATH — safe only while
//                 the imported calls are pure render and check, never serveContour/openWindow; tools outside
//                 tools/sandbox (verify-contour --visible) open a window BY DESIGN and are out of scope — their runs
//                 are announced to the owner first
// ON-REAL-PATH:   2026-09-13 — the old 2.6 generator run quietly with a flag it does not know printed "NO WINDOW
//                 OPENED" and no voice (plans/108 · bugs/116)
const GEN_PATH_RE = /contour['"]?\s*,\s*['"]review\.mjs|contour\/review\.mjs/;
const CHILD_RE = /\b(?:execFileSync|execSync|spawnSync|spawn)\s*\(/;
const quietViolation = (src) => GEN_PATH_RE.test(src) && CHILD_RE.test(src) && !/\bquietEnv\s*\(/.test(src);
const quietProof = [];
if (!quietViolation("execFileSync(process.execPath, [join(P, '.kaif', 'tools', 'contour', 'review.mjs'), '--check'])")) quietProof.push('a generator run without quietEnv was NOT flagged');
if (quietViolation("execFileSync(process.execPath, [join(P, '.kaif', 'tools', 'contour', 'review.mjs')], { env: quietEnv() })")) quietProof.push('a quiet generator run WAS flagged');
const loud = [];
{
  const files = [...SUITES.map((n) => join(HERE, n)), ...(existsSync(join(HERE, 'probes')) ? readdirSync(join(HERE, 'probes')).filter((n) => n.endsWith('.mjs')).map((n) => join(HERE, 'probes', n)) : [])];
  for (const f of files) if (quietViolation(readFileSync(f, 'utf8'))) loud.push(f.slice(REPO.length + 1).replace(/\\/g, '/'));
}
for (const p of quietProof) console.error('✖ quiet-child selfproof (bugs/116): ' + p);
for (const l of loud) console.error('✖ contour generator started without quietEnv() (bugs/116): ' + l);
if (quietProof.length || loud.length) {
  console.error(`\n❌ preflight: ${loud.length} sandbox file(s) start the contour generator where it can reach the owner — pass env: quietEnv() (tools/lib/sandbox-run.mjs)`);
  process.exit(1);
}
// ── Preflight gate (LP 2.7, plans/111 LP4; the root of bugs/116 in the shipment): the polygon runs the REPO's dist
// only when that dist was built from the sources on disk. A stale dist ran the OLD contour generator against a flag
// it did not know and raised the owner's page — the quiet child (above) stops the window, this stops the CAUSE.
// The KAIF_DIST seam (a red proof against an old release) is exempt by design: that dist is old on purpose.
// @guard sandbox-dist-fresh — the declaration with THREAT · PROVED-AGAINST · GAP · ON-REAL-PATH lives beside the
// function in tools/lib/source-tree-sha.mjs (one fingerprint, both sides, one selftest).
if (!process.env.KAIF_DIST) {
  const fr = distFreshness(REPO);
  if (!fr.fresh) {
    console.error(`\n❌ preflight: dist is stale — rebuild: node tools/build-framework.mjs (${fr.reason}). Not one suite ran: a stale dist runs the OLD generator against NEW flags (bugs/116).`);
    process.exit(1);
  }
}
console.log(`✅ preflight: run roots are unique by construction · no assertion that can never fail · no mute command · every machinery file carries a test-status marker · the contour generator never reaches the owner from a sandbox run · dist is fresh against framework/ (${SUITES.length} suites)`);

// Упавший свод называется ПОИМЁННО с кодом/сигналом (bugs/61, наблюдение 2026-08-21): прежний
// catch глотал имя, и транзиентный красный оставил ровно «1 of 14 FAILED» — какой из четырнадцати,
// восстановить было не по чему. Красная строка самого свода видна через stdio:inherit, но свод,
// умерший БЕЗ неё (краш, сигнал, немой exit), безымянным быть не имеет права.
let failed = 0;
const failedNames = [];
for (const s of SUITES) {
  console.log(`\n━━━━━━ ${s} ━━━━━━`);
  try { execFileSync(process.execPath, [join(HERE, s)], { stdio: 'inherit' }); }
  catch (e) {
    failed++;
    failedNames.push(s);
    console.error(`✖ ${s} FAILED (${e.status != null ? 'exit ' + e.status : 'signal ' + (e.signal || '?')})`);
  }
}
if (failed) { console.error(`\n❌ sandbox suite: ${failed} of ${SUITES.length} suites FAILED — ${failedNames.join(', ')}`); process.exit(1); }
console.log(`\n✅ sandbox suite: all ${SUITES.length} suites green`);
