// tools/sandbox/probes/ow3-contour-mutants.mjs — a PROBE (not a polygon suite): the selftest cases of the shipped contour added by the OW
// epic of 2.8, proved on COPIES of framework/tools/contour/ in the OS temp dir (never the tree, EXP-0077). OW3 (#86): the debt matcher finds
// nothing · the stale documents go silent again; OW7 (#100): the queue is read without its shape check · a write lands over a foreign queue.
// Each mutant must redden exactly its own case, and only it.   usage: node tools/sandbox/probes/ow3-contour-mutants.mjs
// [TESTED: 2026-09-25 18:26 +03:00 · four mutants red exactly on their named cases (the read-without-shape mutant on both OW7 cases, named after an honest
//  BAD); report testcases/reports/2026-09-25_ow3-ow7-owner-debt-foreign-queue.md]
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SRC = 'framework/tools/contour';
const M = [
  ['matcher finds nothing', "  return pendingDocs(root).filter((d) => d.questions > 0 && d.unanswered === 0 && d.implementedOpen.length === 0)", "  return pendingDocs(root).filter(() => false)", 'the agent\'s debt named FIRST'],
  ['stale silent again', "  for (const d of stale) lines.push('! ' + t.list.stale(d.doc, d.days, STALE_QUEUE_DAYS, CLI_NAME));", "", 'a stale queue document is NAMED'],
  ['queue read without its shape check', "return Array.isArray(v) ? v : []; }", "return v; }", ['a queue file of another shape', 'a write into the foreign queue is REFUSED']],   // the write path reads the object too
  ['write over a foreign queue', "  if (queueShape(root, cfg) === 'foreign') throw new ForeignQueueError(", "  if (false) throw new ForeignQueueError(", 'a write into the foreign queue is REFUSED'],
];
let bad = 0;
for (const [name, from, to, addressee] of M) {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-ow3-mut-'));
  cpSync(SRC, dir, { recursive: true });
  const f = join(dir, 'review.mjs');
  const s = readFileSync(f, 'utf8');
  if (s.split(from).length !== 2) { console.log(`BAD ${name}: anchor did not apply`); bad++; continue; }
  writeFileSync(f, s.replace(from, to));
  const r = spawnSync(process.execPath, [f, '--selftest'], { encoding: 'utf8', cwd: dir });
  const out = (r.stdout || '') + (r.stderr || '');
  const red = out.split(/\r?\n/).filter((l) => /^\s*x /.test(l) || /^\s*✗/.test(l) || /FAIL/.test(l));
  const exp = Array.isArray(addressee) ? addressee : [addressee];
  const reds = red.filter((l) => !/selftest|checks/.test(l));
  const good = r.status !== 0 && reds.length === exp.length && exp.every((a) => reds.some((l) => l.includes(a)));
  if (!good) bad++;
  console.log(`${good ? 'OK ' : 'BAD'} ${name} — exit ${r.status}, red lines: ${red.length}`);
  for (const l of red) console.log('    ' + l.trim().slice(0, 150));
  rmSync(dir, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : `✅ ${M.length} mutants red exactly on their named cases, and only on them`);
process.exit(bad ? 1 : 0);
