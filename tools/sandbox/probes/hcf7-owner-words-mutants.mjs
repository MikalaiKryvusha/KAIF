#!/usr/bin/env node
// PROBE — HC judge finding 7 (version KAIF 2.10, decision №157): the neutral owner words of an anonymous deployment are not a name in
// either script. Copies framework/tools/contour/ into an OS temp dir, applies ONE mutation per run to core.mjs and runs the copy's
// --selftest under quietEnv() (no window, no sound). Addressees are named BEFORE the run; a mutation that does not apply is BAD, a run
// that dies is BAD (EXP-0158). Control — 0 red; M1 (the 2.10-before-fix filter: English words only) — exactly the Cyrillic case;
// M2 (no neutral filter) — exactly both cases. ≈ 2 min, run alone.  [TESTED: 2026-11-17 · control 0 red, M1 1, M2 2 — testcases/reports/2026-11-17_hc-judge-findings-7-8.md]
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(ROOT, 'framework', 'tools', 'contour');
const FIX = '!neutral.test(cell)';
const CASE_EN = 'HC #157 neutral owner words are not a name: «the project owner»';
const CASE_RU = 'HC #157 neutral owner words are not a name: «Владелец проекта»';
const RUNS = [
  { name: 'control', patch: null, want: [] },
  { name: 'M1 English words only', patch: "!/^the project owner$/i.test(cell)", want: [CASE_RU] },
  { name: 'M2 no neutral filter', patch: 'true', want: [CASE_EN, CASE_RU] },
];

let bad = 0;
for (const run of RUNS) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-hcf7-'));
  try {
    cpSync(SRC, dir, { recursive: true });
    if (run.patch) {
      const p = join(dir, 'core.mjs');
      const src = readFileSync(p, 'utf8');
      if (!src.includes(FIX)) { console.log(`BAD ${run.name}: the mutation did not apply`); bad++; continue; }
      writeFileSync(p, src.split(FIX).join(run.patch), 'utf8');
    }
    const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { env: quietEnv({ KAIF_VOICE_TOOL: '' }), encoding: 'utf8', timeout: 600000 });
    const out = String(r.stdout || '') + String(r.stderr || '');
    const reds = out.split(/\r?\n/).filter((l) => /^\s*x\s/.test(l)).map((l) => l.replace(/^\s*x\s+/, '').trim());
    const ran = /\bv\s/.test(out);
    const got = reds.filter((l) => l.startsWith('HC #157'));
    const other = reds.filter((l) => !l.startsWith('HC #157'));
    const okRun = ran && other.length === 0 && got.length === run.want.length && run.want.every((w) => got.some((g) => g.startsWith(w)));
    console.log(`${okRun ? 'OK ' : 'BAD'} ${run.name}: red ${reds.length} (named ${run.want.length})${other.length ? ' · other red: ' + other.slice(0, 3).join(' | ') : ''}${ran ? '' : ' · DIED: no selftest lines'}`);
    if (!okRun) bad++;
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
console.log(bad ? `❌ ${bad} run(s) off their addressees` : '✅ every mutant red exactly on its named cases, control green');
process.exit(bad ? 1 : 0);
