// probe 5 - the matched refBack alternative on every refused line (v2.9), field corpus copy.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PARSER } from './framework/tools/contour/texts.mjs';
import { referenceProblems, parseQuestions } from './framework/tools/contour/core.mjs';
const RE = new RegExp(PARSER.refBack, 'iu');
const dir = join(process.cwd(), 'unl');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(join(dir, f), 'utf8');
  const ids = new Set(referenceProblems(md).map((p) => p.split(':')[0]));
  for (const q of parseQuestions(md)) {
    if (!ids.has(q.id)) continue;
    const answerAt = q.answers.length ? q.answers[0].line : q.body.length;
    const end = q.firstOptionLine >= 0 ? Math.min(q.firstOptionLine, answerAt) : answerAt;
    for (const line of [q.title, ...q.body.slice(0, end)]) {
      const clean = line.replace(/<!--[\s\S]*?-->/g, '');
      const m = clean.match(RE);
      if (m) console.log(f.slice(10, 13) + ' ' + q.id + ' | ' + JSON.stringify(m[0]) + ' | ...' + clean.slice(Math.max(0, m.index - 40), m.index + 30) + '...');
    }
  }
}
