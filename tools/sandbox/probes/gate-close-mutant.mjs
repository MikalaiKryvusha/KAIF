#!/usr/bin/env node
// PROBE — the closing gate of the context-window hook (version KAIF 2.10, session 100: the source closed «by the window» at 53 % by feeling;
// the owner: «Ты закрыл чат неправильно … чини и у себя и в поставке KAIF»). Copies framework/hooks/context-window.mjs into an OS temp dir,
// applies ONE mutation per run and runs the copy's --selftest. Addressees named BEFORE the run; a mutation that does not apply is BAD.
// Control — 0 red; G1 «the gate never denies» — exactly the two «denied» cases; G2 «the owner's word is not read» — exactly the «pass» case;
// G3 «the hand measurement always says may close» (session 101, bugs/138) — exactly the «measure: 53 %» case; after the judge of session 101:
// G4 «the raw skill name» — exactly the «/end-chat-soft» case; G5 «<synthetic> counts» — exactly its case; G6 «hooks always run» — the alive case.
// [TESTED: 2026-11-17 · see testcases/reports/2026-11-17_close-gate.md]
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SRC = join(resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), 'framework', 'hooks', 'context-window.mjs');
const RUNS = [
  { name: 'control', from: null, to: null, want: [] },
  { name: 'G1 the gate never denies', from: 'if (pct >= closePct) return null;', to: 'return null;',
    // the judge's name forms read the same «denied» predicate (EXP-0169)
    want: ['gate: /end-chat-soft at 53 %', 'gate: /end-chat-force below the level', 'gate: «/end-chat-soft», a padded name'] },
  { name: 'G2 the owner\'s word is not read', from: "|| OWNER_WORD.test(`${ti.args || ''} ${rest.join(' ')}`)", to: '',
    want: ['gate: the owner\'s word in the args', 'gate: «/end-chat-soft», a padded name'] },
  // session 101 (bugs/138): the hand measurement the closing step 0 runs where hooks are withheld — «may close» at any share
  { name: 'G3 the hand measurement always says «may close»', from: 'may = pct >= closePct;', to: 'may = true;',
    want: ['measure: 53 % — too early'] },
  // judge of session 101: the name as Claude Code runs it · a <synthetic> record is no answer · wired is not running (bugs/138)
  { name: 'G4 the raw skill name is matched', from: ".trim().replace(/^\\/+/, '').split(", to: '.split(',
    want: ['gate: «/end-chat-soft», a padded name'] },
  { name: 'G5 a <synthetic> record counts as the answer', from: "r.message.model !== '<synthetic>' && usedOf(r.message.usage) > 0", to: 'true',
    want: ['measure: a `<synthetic>` zero-usage record'] },
  { name: 'G6 the hooks always «run»', from: 'if (state && state[id]) return { code: 0',
    to: "return { code: 0, line: 'KAIF hooks: running in this session' }; if (state && state[id]) return { code: 0",
    want: ['alive: this session recorded'] },
  // session 103 (bugs/142): presence came only with a measurement — the first tool call of a session read «NOT running»
  { name: 'G7 presence only with a measurement', from: "} else if (ev.hook_event_name === 'PreToolUse') process.exit(0);   // nothing to measure",
    to: '} else process.exit(0);   // nothing to measure', want: ['alive from the first prompt (bugs/142)'] },
  { name: 'G8 a subagent\'s event records the session', from: "&& ev.session_id && !fromSubagent(ev)) {", to: '&& ev.session_id) {',
    want: ['alive from the first prompt (bugs/142)'] },
];
let bad = 0;
for (const run of RUNS) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-gate-'));
  try {
    let src = readFileSync(SRC, 'utf8');
    if (run.from) { if (!src.includes(run.from)) { console.log(`BAD ${run.name}: the mutation did not apply`); bad++; continue; } src = src.split(run.from).join(run.to); }
    const p = join(dir, 'context-window.mjs'); writeFileSync(p, src, 'utf8');
    const r = spawnSync(process.execPath, [p, '--selftest'], { encoding: 'utf8', timeout: 60000 });
    const reds = String(r.stdout || '').split(/\r?\n/).filter((l) => /^\s*x\s/.test(l)).map((l) => l.replace(/^\s*x\s+/, ''));
    const okRun = /\bv\s/.test(r.stdout || '') && reds.length === run.want.length && run.want.every((w) => reds.some((x) => x.startsWith(w)));
    console.log(`${okRun ? 'OK ' : 'BAD'} ${run.name}: red ${reds.length} (named ${run.want.length})${okRun ? '' : ' · ' + reds.join(' | ')}`);
    if (!okRun) bad++;
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
console.log(bad ? `❌ ${bad} run(s) off their addressees` : '✅ every mutant red exactly on its named cases, control green');
process.exit(bad ? 1 : 0);
