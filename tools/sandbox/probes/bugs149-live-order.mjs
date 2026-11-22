#!/usr/bin/env node
// [TESTED: 2026-11-22 · PASS on the real Kimi wire: stages at 1690/1819/1989, close at 1997, no compaction; testcases/reports/2026-11-22_bugs149-context-window-live.md]
import { readFileSync } from 'node:fs';

const wire = process.argv[2];
if (!wire) throw new Error('usage: node bugs149-live-order.mjs <wire.jsonl>');
const lines = readFileSync(wire, 'utf8').trim().split(/\r?\n/);
const found = { stages: {}, close: null, compactions: [] };

for (let i = 0; i < lines.length; i++) {
  let record;
  try { record = JSON.parse(lines[i]); } catch { continue; }
  if (record.type === 'context.apply_compaction') found.compactions.push({ line: i + 1, time: record.time });
  const event = record.event;
  if (event?.type === 'tool.result') {
    const output = event.result?.output || '';
    if (!output.startsWith('KAIF context:')) continue;
    for (const level of [75, 80, 85]) {
      const delivered = level === 75 ? output.includes('A WARNING only') : output.includes(`The step of ${level} %`);
      if (delivered) found.stages[level] ||= { line: i + 1, time: record.time, output: output.slice(0, 500) };
    }
  }
  if (event?.type === 'tool.call' && event.name === 'Skill' && event.args?.skill === 'end-chat-soft') {
    found.close ||= { line: i + 1, time: record.time };
  }
}

const ok = [75, 80, 85].every((level) => found.stages[level])
  && found.close && found.close.line > found.stages[85].line
  && !found.compactions.some((item) => item.line < found.close.line);
console.log(JSON.stringify({ verdict: ok ? 'PASS' : 'FAIL', ...found }, null, 2));
process.exit(ok ? 0 : 1);
