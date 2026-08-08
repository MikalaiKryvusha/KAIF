#!/usr/bin/env node
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
//
// Usage: node tools/sandbox-suite.mjs   (npm run test:core)
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), 'sandbox');
const SUITES = ['s01-field-fixes.mjs', 's02-modular-update.mjs', 's03-receipts-tools.mjs', 's04-anon-legacy.mjs',
                's05-provenance.mjs', 's06-canon-lint.mjs', 's07-translated.mjs', 's08-l2-faces.mjs',
                's09-l3-cli-safety.mjs', 's10-l4-audit-noise.mjs', 's11-l5-remaining.mjs',
                's12-k5-contour-canon.mjs', 's13-requirements-lint.mjs', 's14-refresh-hooks.mjs'];
let failed = 0;
for (const s of SUITES) {
  console.log(`\n━━━━━━ ${s} ━━━━━━`);
  try { execFileSync(process.execPath, [join(HERE, s)], { stdio: 'inherit' }); }
  catch { failed++; }
}
if (failed) { console.error(`\n❌ sandbox suite: ${failed} of ${SUITES.length} suites FAILED`); process.exit(1); }
console.log(`\n✅ sandbox suite: all ${SUITES.length} suites green`);
