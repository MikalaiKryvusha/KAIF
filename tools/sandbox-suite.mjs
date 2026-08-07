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
//
// Usage: node tools/sandbox-suite.mjs   (npm run test:core)
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), 'sandbox');
const SUITES = ['s01-field-fixes.mjs', 's02-modular-update.mjs', 's03-receipts-tools.mjs', 's04-anon-legacy.mjs',
                's05-provenance.mjs', 's06-canon-lint.mjs', 's07-translated.mjs', 's08-l2-faces.mjs',
                's09-l3-cli-safety.mjs'];
let failed = 0;
for (const s of SUITES) {
  console.log(`\n━━━━━━ ${s} ━━━━━━`);
  try { execFileSync(process.execPath, [join(HERE, s)], { stdio: 'inherit' }); }
  catch { failed++; }
}
if (failed) { console.error(`\n❌ sandbox suite: ${failed} of ${SUITES.length} suites FAILED`); process.exit(1); }
console.log(`\n✅ sandbox suite: all ${SUITES.length} suites green`);
