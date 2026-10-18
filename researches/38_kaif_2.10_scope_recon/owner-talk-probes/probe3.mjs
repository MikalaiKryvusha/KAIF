// probe 3 — classify the «выше» refusals of the field corpus copy; open-only sizes of interviews 131–134 (v2.9 core).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { referenceProblems, parseQuestions } from './framework/tools/contour/core.mjs';

const dir = join(process.cwd(), 'unl');
const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const VYSHE = /(?<!\p{L})выше(?!\p{L})/iu;
for (const f of files) {
  const md = readFileSync(join(dir, f), 'utf8');
  for (const p of referenceProblems(md)) {
    const m = p.match(/«([\s\S]*)»\. Put/u);
    const text = m ? m[1] : p;
    const i = text.search(VYSHE);
    const tag = i >= 0 ? 'VYSHE' : 'other';
    const ctx = i >= 0 ? text.slice(Math.max(0, i - 45), i + 25) : text.slice(0, 70);
    console.log(tag + ' · ' + f.slice(10, 13) + ' ' + p.split(':')[0] + ' · …' + ctx.replace(/\n/g, ' ') + '…');
  }
}
console.log('');
for (const f of files.filter((x) => /^interview_13[1-4]/.test(x))) {
  const qs = parseQuestions(readFileSync(join(dir, f), 'utf8')).filter((q) => !q.answered);
  const size = (q) => {
    const end = q.answers.length ? q.answers[0].line : q.body.length;
    return [q.title, ...q.body.slice(0, end)].join('\n').replace(/<!--[\s\S]*?-->/g, '').trim().length;
  };
  const s = qs.map(size); const sum = s.reduce((a, b) => a + b, 0);
  console.log(f.slice(0, 36) + ' · OPEN questions ' + qs.length + ' · total ' + sum + ' · per question ' + (qs.length ? Math.round(sum / qs.length) : 0) + ' · over 750: ' + s.filter((n) => n > 750).length);
}
