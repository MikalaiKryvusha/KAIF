// tools/sandbox/probes/nt-judge-f1-multiline-answer.mjs — a PROBE (not a polygon suite), written by the light judge of epic NT (2.9,
// session 84; reports/KAIF_AUDIT/2026-10-16_nt_light_judge_verdict.md, finding F1): a two-line own answer written into Q1 of an interview
// with Q1 and Q2, for each continuation line that LOOKS like markdown structure (an option, a label, a rule, a heading, a fence, a table
// row), in LF and CRLF files; prints what the parse reads back. Before the fix of F1: the fence swallows Q2, an option line adds an option,
// a heading makes a phantom Q2, a rule or a table row cuts the answer, a label line reads as a second answer.
// usage: node tools/sandbox/probes/nt-judge-f1-multiline-answer.mjs   ·   ≈ 1 s, read the printed lines
// [NOT-TESTED] as a guard — a diagnostic; the fix of F1 turns it into selftest cases of the contour
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const core = await import(pathToFileURL(join(REPO, 'framework', 'tools', 'contour', 'core.mjs')).href);
const { recordDecision, parseQuestions, loadContourConfig } = core;
const cases = {
  option: 'my pick\n- **A)** actually this',
  label: 'first\n**Answer:** sneaky',
  comment: 'first\n**Comment:** x',
  rule: 'first\n---\nafter rule',
  heading: 'first\n### Q2. fake',
  fence: 'first\n```\ncode',
  indent: 'first\n    indented',
  table: 'first\n| **A** | x |',
  crlfInput: 'first\r\nsecond',
};
for (const eol of ['\n', '\r\n']) for (const [name, text] of Object.entries(cases)) {
  const root = mkdtempSync(join(tmpdir(), 'kaif-nt-f1-'));
  mkdirSync(join(root, 'interviews'), { recursive: true });
  const ML = 'interviews/interview_053_x.md';
  const src = ['# Interview #053', '', '> Status: awaiting', '', '### Q1. Pick?', '', '<!-- archaeology: n/a -->', '', '- **A)** one', '- **B)** two', '', '**Answer:**', '', '### Q2. Other?', '', '- **A)** x', '- **B)** y', '', '**Answer:**', ''].join(eol);
  writeFileSync(join(root, ML), src);
  const cfg = loadContourConfig(root);
  recordDecision(root, ML, { answers: { Q1: { choice: '', text, comment: '' } } }, cfg, new Date(2026, 8, 5, 22, 2));
  const after = readFileSync(join(root, ML), 'utf8');
  const qs = parseQuestions(after);
  const q1 = qs.find((q) => q.id === 'Q1');
  const mixed = /\r\n/.test(after) && /[^\r]\n/.test(after);
  console.log(JSON.stringify(eol), name.padEnd(9), '| qs:', qs.map((q) => q.id + (q.answered ? '+' : '-') + 'o' + q.options.length).join(','), '| q1 text:', JSON.stringify(q1 && q1.answers.map((a) => a.text)), mixed ? 'MIXED-EOL' : '');
  rmSync(root, { recursive: true, force: true });
}
