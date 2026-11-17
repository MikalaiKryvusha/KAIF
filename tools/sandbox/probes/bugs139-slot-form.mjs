// tools/sandbox/probes/bugs139-slot-form.mjs — a PROBE (not a polygon suite): the inventory of instruction slots NOT in the core's form
// (bugs/139 · ideas/32 p. 14; the form — tools/lib/slot-form.mjs). Lists every finding of every SKILL.md under the given root's
// framework/skills (default: this repository), or of the files named. Exit 0 — none; 1 — findings; read-only.
// usage: node tools/sandbox/probes/bugs139-slot-form.mjs [<repo root> | <file> …]
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { slotFindings } from '../../lib/slot-form.mjs';

const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const args = process.argv.slice(2);
const root = args.length === 1 && existsSync(args[0]) && statSync(args[0]).isDirectory() ? resolve(args[0]) : REPO;
const files = args.length && root === REPO ? args.map((a) => resolve(a)) : readdirSync(join(root, 'framework', 'skills'))
  .map((n) => join(root, 'framework', 'skills', n, 'SKILL.md')).filter((f) => existsSync(f)).sort();
let n = 0;
for (const f of files) for (const x of slotFindings(readFileSync(f, 'utf8'))) { n++; console.log(relative(root, f).replace(/\\/g, '/') + ':' + x.line + ' — ' + x.kind); }
console.log(n ? `✖ ${n} slot(s) not in the core's form` : '✅ every instruction slot is in the core\'s form');
process.exit(n ? 1 : 0);
