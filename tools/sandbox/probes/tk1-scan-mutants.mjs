// tools/sandbox/probes/tk1-scan-mutants.mjs — mutants of tk1-wait-call-scan.mjs (version KAIF 2.10, epic TK, criterion 20 of plans/136):
// each copies the probe to the OS temp with ONE line removed and runs its --selftest; the addressee case — and only it — must go red.
//   M1 the stopped-task line removed  → T4s red (session 92: a task stopped by TaskStop read as live — a false red of the measure)
//   M2 the subagent-launch line removed → T4g red (session 93, judge TK7c hunt 5: background subagents were invisible to the measure)
//   M3 launches read from text again    → T4q red (session 93: a grep output quoting launch lines was counted as 5 launches)
//   M4 a report after the turn end counts → T4L red · M5 a dry run is a call → T3d red · M6 any text naming `--call` is a call → T3d, T3g
//   red · M7 the `queued_command` prompt unread → T4m red (session 94, judge of epic TK hunt 1)
// A mutation that does not apply is BAD, not OK. usage: node tools/sandbox/probes/tk1-scan-mutants.mjs   (≈ 1 s, read-only)
// [TESTED: 2026-10-23 14:37 · control 0 red · M1 exactly T4s · M2 exactly T4g · M3 exactly T4q — report
//  testcases/reports/2026-10-23_tk7e-scan-subagents.md]
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROBE = join(dirname(fileURLToPath(import.meta.url)), 'tk1-wait-call-scan.mjs');
const text = readFileSync(PROBE, 'utf8');
const MUTANTS = [
  { name: 'control', line: null, red: [] },
  { name: 'M1 stopped task not a report', line: /^.*Successfully stopped task: \(\\w\+\).*\n/m, red: ['T4s'] },
  { name: 'M2 subagent launch unseen', line: /^.*u\.status === 'async_launched'.*\n/m, red: ['T4g'] },
  { name: 'M3 launches read from text', line: /^.*typeof u\.backgroundTaskId === 'string'.*\n/m,
    to: "    for (const m of body.matchAll(/running in background with ID: (\\w+)|agentId: (\\w+)/g)) launched.add(m[1] ?? m[2]);\n", red: ['T4q'] },
  // TK7f (session 94, judge of epic TK hunt 1)
  { name: 'M4 a report after the turn end counts', line: /^.*reported\.get\(id\) < lastAssistant.*\n/m,
    to: '  const open = [...launched].filter((id) => !reported.has(id));\n', red: ['T4L'] },
  { name: 'M5 a dry run is a call', line: /^.*CALL_SEGMENT\.test\(seg\) && !\/--dry-run.*\n/m,
    to: "const isCall = (command) => String(command).split(/&&|\\|\\||[;|\\n]/).some((seg) => CALL_SEGMENT.test(seg));\n", red: ['T3d'] },
  { name: 'M6 any text naming --call is a call', line: /^.*CALL_SEGMENT\.test\(seg\) && !\/--dry-run.*\n/m,
    to: 'const isCall = (command) => /review\\.mjs[^\\n]*--call\\b|--call\\s+"/.test(String(command));\n', red: ['T3d', 'T3g'] },
  { name: 'M7 queued_command prompt unread', line: /^.*const body = flat\(.*\n/m,
    to: "    const body = flat(x.message?.content ?? x.attachment ?? x.content ?? '');\n", red: ['T4m'] },
];

let bad = 0;
for (const m of MUTANTS) {
  if (m.line && !m.line.test(text)) { bad++; console.log(`BAD ${m.name}: mutation not applied`); continue; }
  const dir = mkdtempSync(join(tmpdir(), 'kaif-tk1-mut-'));
  const copy = join(dir, 'probe.mjs');
  writeFileSync(copy, m.line ? text.replace(m.line, () => m.to ?? '') : text);
  const r = spawnSync(process.execPath, [copy, '--selftest'], { encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  const fails = (r.stdout || '').split('\n').filter((l) => l.startsWith('FAIL'));
  const ok = fails.length === m.red.length && m.red.every((c) => fails.some((f) => f.includes(`«${c} `) || f.includes(`«${c}»`)));
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'BAD'} ${m.name}: ${fails.length} red${fails.length ? ` — ${fails.map((f) => f.replace(/^FAIL\s+/, '')).join(' · ')}` : ''}`);
}
console.log(bad ? `tk1 scan mutants: ${bad} BAD` : `tk1 scan mutants: all ${MUTANTS.length} OK`);
process.exit(bad ? 1 : 0);
