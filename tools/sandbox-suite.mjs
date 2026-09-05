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
//   s20 — kaif-core delivery (epic OQ 2.6, plan 90): the delivery VECTOR from SYSTEMS_REGISTRY.md +
//         open bugs by Kind: — exit 3 until the registry exists, six numbers, --json deterministic,
//         draft suffix, header-named parsing; red proven on the HEAD core before OQ2 via KAIF_DIST
//   s21 — update on the real route (epic UR 2.6, plan 91; origin #42 ×3 · #48 R2/R3 · #44 · #41 wish 3 ·
//         court RL 2.5 E-H3): `--rehearsal` reaches the bootstrap route and the loader refuses an unknown
//         flag BEFORE any download, the auto record is consumed on that route too, the preview and the
//         update count ONE candidate set; hand-filled slots are DERIVED from the disk — "template + fills"
//         is untouched (mechanical replace with the fills kept, mechanical deprecation, no false
//         "promised upstream line", `fills` cached in the manifest), a module already equal to the
//         incoming template is not "upstream changed it"; `stale-claims` sees ANY version older than the
//         one being installed (`gt` defined once); the bootstrap task renders −/+ from the old texts
//         and names English arrivals; red proven on the HEAD core before UR via KAIF_DIST / KAIF_LOADER
// Usage: node tools/sandbox-suite.mjs   (npm run test:core)
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFixedTempNames, selfProof } from './lib/temp-root.mjs';
import { scanSuite } from './sandbox-mute-guard.mjs';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), 'sandbox');
const REPO = resolve(HERE, '..', '..');
const SUITES = ['s01-field-fixes.mjs', 's02-modular-update.mjs', 's03-receipts-tools.mjs', 's04-anon-legacy.mjs',
                's05-provenance.mjs', 's06-canon-lint.mjs', 's07-translated.mjs', 's08-l2-faces.mjs',
                's09-l3-cli-safety.mjs', 's10-l4-audit-noise.mjs', 's11-l5-remaining.mjs',
                's12-k5-contour-canon.mjs', 's13-requirements-lint.mjs', 's14-refresh-hooks.mjs',
                's15-guard-lint.mjs', 's16-doc-budgets.mjs', 's17-report.mjs',
                's18-update-symmetries.mjs', 's19-scenario-lint.mjs', 's20-delivery.mjs', 's21-update-route.mjs',
                's22-contour-shipped.mjs', 's23-ranking-lint.mjs'];
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
console.log(`✅ preflight: run roots are unique by construction · no assertion that can never fail · no mute command · every machinery file carries a test-status marker (${SUITES.length} suites)`);

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
