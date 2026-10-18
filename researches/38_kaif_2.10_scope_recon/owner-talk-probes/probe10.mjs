// probe 10 - the TICKET's own proposed fix (#147), modelled: "vyshe" is legal also when (a) "chem" stands within the 4 words before it in
// the same sentence, or (b) it closes the clause ([.!?;:)»] after it) and the word before it is not a document noun / pointing verb.
// Measured on the field corpus copy lines that the shipped v2.9 door refuses with "vyshe". Not shipped code.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PARSER } from './framework/tools/contour/texts.mjs';
import { referenceProblems, parseQuestions } from './framework/tools/contour/core.mjs';
const SHIPPED = new RegExp(PARSER.refBack, 'iu');
const c = JSON.parse(readFileSync('cases.json', 'utf8'));
const DOCWORD = new RegExp('^(?:' + c.noun + '|' + c.verb + ')', 'iu');
const V = new RegExp('(?<!\\p{L})' + c.v + '(?!\\p{L})', 'giu');
const RIGHT_LEGAL = /^\s*,?\s*(?:чем(?!\p{L})|[\d~≈<>]|на\s+\d|в\s+\d)/iu;
const occurrenceIsRef = (line, idx) => {
  const after = line.slice(idx + c.v.length);
  if (RIGHT_LEGAL.test(after)) return false;                         // shipped exception
  const before = line.slice(0, idx).split(/[.!?]/).pop();             // same sentence
  const words = before.split(/[^\p{L}\d]+/u).filter(Boolean);
  if (words.slice(-4).some((w) => /^чем$/iu.test(w))) return false;   // (a) "chem" within 4 words before
  const prev = words[words.length - 1] || '';
  if (/^\s*[.!?;:)»]/u.test(after) && !DOCWORD.test(prev)) return false; // (b) clause-final after a non-document word
  return true;
};
const dir = join(process.cwd(), 'unl');
let total = 0, still = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(join(dir, f), 'utf8');
  const ids = new Set(referenceProblems(md).map((p) => p.split(':')[0]));
  for (const q of parseQuestions(md)) {
    if (!ids.has(q.id)) continue;
    const answerAt = q.answers.length ? q.answers[0].line : q.body.length;
    const end = q.firstOptionLine >= 0 ? Math.min(q.firstOptionLine, answerAt) : answerAt;
    for (const line of [q.title, ...q.body.slice(0, end)]) {
      const clean = line.replace(/<!--[\s\S]*?-->/g, '');
      const m = clean.match(SHIPPED);
      if (!m || !/выше/iu.test(m[0])) continue;
      total++;
      const refs = [...clean.matchAll(V)].filter((x) => occurrenceIsRef(clean, x.index));
      if (refs.length) { still++; const i = refs[0].index; console.log('still refused: ' + f.slice(10, 13) + ' ' + q.id + ' | ...' + clean.slice(Math.max(0, i - 35), i + 25) + '...'); }
    }
  }
}
console.log('field lines refused by "vyshe": ' + total + ' -> still refused under the ticket fix: ' + still);
