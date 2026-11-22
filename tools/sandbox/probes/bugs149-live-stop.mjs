#!/usr/bin/env node
// [TESTED: 2026-11-22 · live Kimi Stop continuation and PASS; testcases/reports/2026-11-22_kimi-stop-alive.md]
import { readFileSync } from 'node:fs';

const file = 'tools/sandbox/probes/bugs149-live-stop.mjs';
const state = JSON.parse(readFileSync('.kaif/test-debt.json', 'utf8'));
const debt = state.debt?.[file];
const stopped = String(state.lastStop || '').startsWith(`${file}@`);

if (!debt && !stopped) {
  console.error(`FAIL: no live Stop evidence recorded for ${file}`);
  process.exit(1);
}

console.log(debt
  ? `PASS: Kimi Stop opened a continuation; live debt recorded for ${file} at ${debt.at}`
  : `PASS: live Stop debt for ${file} was recorded and its run cleared it (${state.lastStop})`);
