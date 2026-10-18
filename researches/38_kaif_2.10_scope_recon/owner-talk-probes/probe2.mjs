// probe 2 — the v2.9 contour core over a READ-ONLY COPY of a field deployment's interviews (Unliminium, ru), owner-talk recon.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docStatus, referenceProblems, parseQuestions } from './framework/tools/contour/core.mjs';

const dir = join(process.cwd(), 'unl');
const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
const VYSHE = /(?<!\p{L})выше(?!\p{L})/iu;
let refTotal = 0, refVyshe = 0, liveDocs = 0;
console.log('| file | docStatus | questions | open | ref problems (of them «выше») | status line (first 70) |');
for (const f of files) {
  const md = readFileSync(join(dir, f), 'utf8');
  const qs = parseQuestions(md);
  const open = qs.filter((q) => !q.answered).length;
  const st = docStatus(md);
  const probs = referenceProblems(md);
  const vy = probs.filter((p) => VYSHE.test(p)).length;
  refTotal += probs.length; refVyshe += vy;
  if (open > 0 || st === 'waiting') liveDocs++;
  const sl = (md.split('\n').slice(0, 30).find((l) => /Статус|Status/u.test(l)) || '').trim().slice(0, 70);
  console.log('| ' + f.slice(0, 40) + ' | ' + st + ' | ' + qs.length + ' | ' + open + ' | ' + probs.length + ' (' + vy + ') | ' + sl + ' |');
}
console.log('docs the 2.9 pendingDocs predicate would list (open > 0 || waiting): ' + liveDocs + ' of ' + files.length);
console.log('reference problems total: ' + refTotal + ' · of them on a line with «выше»: ' + refVyshe);

console.log('\n=== interview_133 refusals, verbatim (first 160 chars each) ===');
const m133 = readFileSync(join(dir, files.find((f) => f.startsWith('interview_133'))), 'utf8');
for (const p of referenceProblems(m133)) console.log('  ' + p.slice(0, 160));

console.log('\n=== visible size per question: title + stem/options up to the answer field, HTML comments removed ===');
for (const f of files.filter((x) => /^interview_13[1-4]/.test(x))) {
  const md = readFileSync(join(dir, f), 'utf8');
  const qs = parseQuestions(md);
  const size = (q) => {
    const end = q.answers.length ? q.answers[0].line : q.body.length;
    return [q.title, ...q.body.slice(0, end)].join('\n').replace(/<!--[\s\S]*?-->/g, '').trim().length;
  };
  const all = qs.map(size), openQ = qs.filter((q) => !q.answered).map(size);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const max = (a) => (a.length ? Math.max(...a) : 0);
  console.log(f.slice(0, 40) + ' · questions ' + qs.length + ' · total ' + sum(all) + ' chars · per question ' + (qs.length ? Math.round(sum(all) / qs.length) : 0)
    + ' · max ' + max(all) + ' · open ' + openQ.length + ' · over 750: ' + all.filter((n) => n > 750).length);
}
