#!/usr/bin/env node
// tools/sandbox-suite.mjs — the PERMANENT sandbox polygon of the update machinery (plan 21 §5.6).
// Runs every core sandbox suite end-to-end in the OS temp dir. Mandatory before a release and
// after any change to framework/installer/* or tools/build-framework.mjs — verification that
// lives only in a session scratchpad dies with the session (the exact class the plan-21 review
// flagged for the splitter pin).
//
// The suites cover the FIELD PROFILE MATRIX of researches/07 §1 (eight real 1.6-update reports):
//   s01 — fresh/anonymous/legacy installs, ignore-first, honest logs   (profiles 03, 06; GH #1)
//   s02 — modular update: NDim two-cycle localization, KPOT merges, i18n, splitter pin (05, 03)
//   s03 — receipts/history, adopt-current (manual migration), diff, executing checkpoints (07, 04)
//   s04 — anonymous mechanical bootstrap, synthetic legacy baseline, news interval (01, 02, 06, 08)
//
// Usage: node tools/sandbox-suite.mjs   (npm run test:core)
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), 'sandbox');
const SUITES = ['s01-field-fixes.mjs', 's02-modular-update.mjs', 's03-receipts-tools.mjs', 's04-anon-legacy.mjs',
                's05-provenance.mjs', 's06-canon-lint.mjs'];
let failed = 0;
for (const s of SUITES) {
  console.log(`\n━━━━━━ ${s} ━━━━━━`);
  try { execFileSync(process.execPath, [join(HERE, s)], { stdio: 'inherit' }); }
  catch { failed++; }
}
if (failed) { console.error(`\n❌ sandbox suite: ${failed} of ${SUITES.length} suites FAILED`); process.exit(1); }
console.log(`\n✅ sandbox suite: all ${SUITES.length} suites green`);
