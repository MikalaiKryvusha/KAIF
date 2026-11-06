// TK10 (c), origin #193 — mutant proof on a COPY (EXP-0077): the contour that IGNORES the owner's presence (quietNow never lifts) must turn
// the selftest case «quiet + owner 5 min ago → voice» red, and only cases of #193; the control copy stays green. Quiet environment.
// Run: node tools/sandbox/probes/tk10c-presence-mutant.mjs
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LIFT = "return ago >= 0 && ago < mins ? { quiet: false, lifted: true, ago: Math.round(ago), mins } : { quiet: true, lifted: false };";
const run = (mutate) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-tk10c-'));
  try {
    cpSync(join(REPO, 'framework', 'tools', 'contour'), join(d, 'contour'), { recursive: true });
    if (mutate) {
      const f = join(d, 'contour', 'core.mjs'), t = readFileSync(f, 'utf8');
      if (!t.includes(LIFT)) return { err: 'lift line not found' };
      writeFileSync(f, t.split(LIFT).join("return { quiet: true, lifted: false };"));
    }
    const r = spawnSync(process.execPath, [join(d, 'contour', 'review.mjs'), '--selftest'], { env: quietEnv(), encoding: 'utf8', timeout: 200000 });
    return { status: r.status, xs: (r.stdout || '').split('\n').filter((l) => l.startsWith('  x ')) };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(false), m = run(true);
console.log('control: exit ' + c.status + ', red ' + (c.xs || []).length);
console.log('mutant «presence ignored»: exit ' + m.status + ', red ' + (m.xs || []).length + (m.err ? ' · ' + m.err : ''));
for (const x of m.xs || []) console.log('   ' + x.slice(0, 160));
const good = c.status === 0 && c.xs.length === 0 && m.status !== 0 && m.xs.length >= 1 && m.xs.every((x) => /#193|owner .*min ago/.test(x));
console.log(good ? '✅ the #193 case is red exactly on the mutant' : '❌ mutant proof failed');
process.exit(good ? 0 : 1);
