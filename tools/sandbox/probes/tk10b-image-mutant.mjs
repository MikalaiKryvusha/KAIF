// TK10 (b), origin #187 — mutant proof on a COPY (EXP-0077): the contour without the picture rule in inline() must turn the selftest
// case «#187 image» red, and only cases of #187; the control copy stays green. Quiet environment: no window, no sound.
// Run: node tools/sandbox/probes/tk10b-image-mutant.mjs
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = join(REPO, 'framework', 'tools', 'contour');
const RULE = '(code ? code : imageHtml(alt, p))';   // the picture rule since the code-span fix (8992c43)
const run = (mutate) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-tk10b-'));
  try {
    cpSync(SRC, join(d, 'contour'), { recursive: true });
    if (mutate) {
      const f = join(d, 'contour', 'core.mjs'), t = readFileSync(f, 'utf8');
      if (!t.includes(RULE)) return { err: 'rule not found' };
      writeFileSync(f, t.split('\n').filter((l) => !l.includes(RULE)).join('\n'));
    }
    const r = spawnSync(process.execPath, [join(d, 'contour', 'review.mjs'), '--selftest'], { env: quietEnv(), encoding: 'utf8', timeout: 200000 });
    const xs = (r.stdout || '').split('\n').filter((l) => l.startsWith('  x '));
    return { status: r.status, xs };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(false), m = run(true);
console.log('control: exit ' + c.status + ', red ' + (c.xs || []).length);
console.log('mutant «picture as text»: exit ' + m.status + ', red ' + (m.xs || []).length + (m.err ? ' · ' + m.err : ''));
for (const x of m.xs || []) console.log('   ' + x.slice(0, 160));
const good = c.status === 0 && (c.xs || []).length === 0 && m.status !== 0 && m.xs.length >= 1 && m.xs.every((x) => /#187/.test(x));
console.log(good ? '✅ the #187 cases are red exactly on the mutant' : '❌ mutant proof failed');
process.exit(good ? 0 : 1);
