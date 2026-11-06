// HC7 (version KAIF 2.10, epic HC, criterion 27; origin ticket #161 — bugs/135): red-proof of «the run line as a list item counts».
// A COPY of the shipped linter with the optional list marker emptied — the v2.9 behaviour — must turn red EXACTLY the two cases
// «the line as a list item counts» (en · ru); every other case, the listed NONE under pass included, stays green; the control copy is
// green. A marker line not found prints DIED and fails (EXP-0158). Run: node tools/sandbox/probes/hc7-list-line-red.mjs   (≈ 1 s)
// [TESTED: 2026-11-06, between 16:00 and 16:03 (minute not logged) · control 0 red; the v2.9 behaviour red exactly on the two list-item cases (en · ru); the first run died on
//  reading stdout only — the failed summary goes to stderr (EXP-0181), fixed]
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LINT = join(REPO, 'framework', 'tools', 'kaif-testrun-lint.mjs');
const TEMPLATE = join(REPO, 'framework', 'templates', '_testrun-report-template.md');
const FROM = "const LIST_MARK = '(?:(?:[-*+]|\\\\d+[.)])[^\\\\S\\\\n]+)?';";
const ADDRESSEE = /the line as a list item counts/;
const run = (old) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-hc7-'));
  try {
    mkdirSync(join(d, 'tools')); copyFileSync(TEMPLATE, join(d, '_testrun-report-template.md'));
    const src = readFileSync(LINT, 'utf8');
    if (old && !src.includes(FROM)) return { err: 'the LIST_MARK line was not found' };
    writeFileSync(join(d, 'tools', 'lint.mjs'), old ? src.split(FROM).join("const LIST_MARK = '';") : src);
    const r = spawnSync(process.execPath, [join(d, 'tools', 'lint.mjs'), 'selftest'], { encoding: 'utf8', timeout: 60000 });
    // both streams (EXP-0181): the summary of a FAILED selftest goes to stderr, of a green one — to stdout
    const all = (r.stdout || '') + (r.stderr || '');
    return { status: r.status, xs: (r.stdout || '').split('\n').filter((l) => l.startsWith('  ✗')), done: /testrun-lint selftest/.test(all) };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(false), o = run(true);
let good = c.status === 0 && c.xs.length === 0 && c.done;
console.log(`${good ? 'OK  ' : 'BAD '}control: exit ${c.status}, red ${c.xs.length}`);
if (o.err || !o.done) { good = false; console.log(`DIED v2.9 behaviour: ${o.err || 'the selftest did not finish'} — proves nothing`); }
else {
  const ok = o.status !== 0 && o.xs.length === 2 && o.xs.every((x) => ADDRESSEE.test(x)) && o.xs.some((x) => /en:/.test(x)) && o.xs.some((x) => /ru:/.test(x));
  if (!ok) good = false;
  console.log(`${ok ? 'OK  ' : 'BAD '}v2.9 behaviour (no list marker): exit ${o.status}, red ${o.xs.length} — addressees «as a list item counts» en · ru`);
  for (const x of o.xs) console.log('     ' + x.slice(0, 150));
}
console.log(good ? '✅ red exactly on the list-item cases, green otherwise' : '❌ red-proof failed');
process.exit(good ? 0 : 1);
