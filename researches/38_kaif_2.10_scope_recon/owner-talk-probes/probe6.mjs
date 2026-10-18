// probe 6 - a CANDIDATE (not shipped) whitelist form of the Russian back-reference: "vyshe" is a reference only after a
// document-object noun, a pointing verb or "sm."; measured against the field corpus copy and the synthetic cases. v2.9 core.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PARSER } from './framework/tools/contour/texts.mjs';
import { referenceProblems, parseQuestions } from './framework/tools/contour/core.mjs';
const SHIPPED = new RegExp(PARSER.refBack, 'iu');
const lines = JSON.parse(readFileSync('cases.json', 'utf8'));
const NOUN = lines.noun, VERB = lines.verb;
const CAND_V = new RegExp('(?<!\\p{L})(?:(?:' + NOUN + ')\\p{L}*(?:\\s+\\d+)?|(?:' + VERB + ')\\p{L}*|' + lines.sm + ')\\s+' + lines.v + '(?!\\p{L})|(?<!\\p{L})' + lines.v + '\\s+(?:' + VERB + ')', 'iu');
const VY = new RegExp('(?<!\\p{L})' + lines.v + '(?!\\p{L})', 'iu');
const judge = (s) => VY.test(s) ? CAND_V.test(s) : SHIPPED.test(s);
let agree = 0, n = 0;
for (const [want, s] of lines.synthetic) { n++; const got = judge(s) ? 'REF' : 'ok'; if (got === want) agree++; console.log((got === want ? 'PASS' : 'FAIL') + ' want ' + want + ' got ' + got + ' | ' + s); }
console.log('synthetic: ' + agree + '/' + n);
const dir = join(process.cwd(), 'unl');
let shipped = 0, cand = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(join(dir, f), 'utf8');
  const ids = new Set(referenceProblems(md).map((p) => p.split(':')[0]));
  for (const q of parseQuestions(md)) {
    if (!ids.has(q.id)) continue;
    const answerAt = q.answers.length ? q.answers[0].line : q.body.length;
    const end = q.firstOptionLine >= 0 ? Math.min(q.firstOptionLine, answerAt) : answerAt;
    for (const line of [q.title, ...q.body.slice(0, end)]) {
      const clean = line.replace(/<!--[\s\S]*?-->/g, '');
      if (!SHIPPED.test(clean)) continue;
      shipped++;
      if (judge(clean)) { cand++; const m = clean.match(VY.test(clean) ? CAND_V : SHIPPED); console.log('still refused: ' + f.slice(10, 13) + ' ' + q.id + ' | ...' + clean.slice(Math.max(0, m.index - 30), m.index + 30) + '...'); }
    }
  }
}
console.log('field corpus refused lines: shipped ' + shipped + ' -> candidate ' + cand);
