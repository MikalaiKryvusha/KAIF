// probe 7 - does the CANDIDATE form refuse any line the shipped v2.9 door lets through? All live question stems of the corpus copy.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PARSER } from './framework/tools/contour/texts.mjs';
import { parseQuestions, headerDate, REFERENCES_SINCE } from './framework/tools/contour/core.mjs';
const SHIPPED = new RegExp(PARSER.refBack, 'iu');
const c = JSON.parse(readFileSync('cases.json', 'utf8'));
const CAND_V = new RegExp('(?<!\\p{L})(?:(?:' + c.noun + ')\\p{L}*(?:\\s+\\d+)?|(?:' + c.verb + ')\\p{L}*|' + c.sm + ')\\s+' + c.v + '(?!\\p{L})|(?<!\\p{L})' + c.v + '\\s+(?:' + c.verb + ')', 'iu');
const VY = new RegExp('(?<!\\p{L})' + c.v + '(?!\\p{L})', 'iu');
const judge = (s) => VY.test(s) ? CAND_V.test(s) : SHIPPED.test(s);
const dir = join(process.cwd(), 'unl');
let all = 0, judged = 0, extra = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(join(dir, f), 'utf8');
  const d = headerDate(md);
  for (const q of parseQuestions(md)) {
    if (q.answered || q.freeField) continue;
    const answerAt = q.answers.length ? q.answers[0].line : q.body.length;
    const end = q.firstOptionLine >= 0 ? Math.min(q.firstOptionLine, answerAt) : answerAt;
    for (const line of [q.title, ...q.body.slice(0, end)]) {
      const clean = line.replace(/<!--[\s\S]*?-->/g, '');
      all++; if (d && d >= REFERENCES_SINCE) judged++;
      if (judge(clean) && !SHIPPED.test(clean)) { extra++; console.log('NEW refusal: ' + f.slice(10, 13) + ' ' + q.id + ' | ' + clean.slice(0, 100)); }
    }
  }
}
console.log('live stem lines: ' + all + ' (in documents judged by date: ' + judged + ') · new refusals by the candidate: ' + extra);
