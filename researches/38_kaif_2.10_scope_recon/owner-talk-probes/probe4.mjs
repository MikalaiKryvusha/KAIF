// probe 4 — which alternative of PARSER.refBack (v2.9) matched on each NON-«выше» refusal of the field corpus copy.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PARSER } from './framework/tools/contour/texts.mjs';
import { referenceProblems } from './framework/tools/contour/core.mjs';

const RE = new RegExp(PARSER.refBack, 'iu');
const VYSHE = /(?<!\p{L})выше(?!\p{L})/iu;
const dir = join(process.cwd(), 'unl');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
  for (const p of referenceProblems(readFileSync(join(dir, f), 'utf8'))) {
    const m = p.match(/«([\s\S]*)»\. Put/u); const text = m ? m[1] : p;
    if (VYSHE.test(text)) continue;
    const hit = text.match(RE);
    const at = hit ? hit.index : -1;
    console.log(f.slice(10, 13) + ' ' + p.split(':')[0] + ' · matched «' + (hit ? hit[0] : '?') + '» · …' + (at >= 0 ? text.slice(Math.max(0, at - 40), at + 30) : '').replace(/\n/g, ' ') + '…');
  }
}
