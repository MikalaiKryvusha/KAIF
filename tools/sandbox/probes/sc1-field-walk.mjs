// tools/sandbox/probes/sc1-field-walk.mjs — a PROBE (not a polygon suite): the functional run of SC1 (plans/123, criterion 16) on REAL
// deployed trees, READ-ONLY. For each root it walks the tree twice and prints numbers only (roots are labelled, never named — a field
// project's name is private):
//   old — the 2.7 stale-claims walk as it was (readdirSync recursion, the scan's hand list of skipped directories, a bare statSync
//         inside one try/catch around the whole walk): how many files it reached, how many of them sit under .claude/worktrees,
//         and whether it DIED (and at which depth) — the "no lines found" of origin #77;
//   new — the KAIF-WALK block of framework/installer/KAIF-CORE.mjs: files, files under .claude/worktrees (must be 0), skipped
//         (named), failed.
// Nothing is written anywhere; the block is evaluated with the real node:fs and child_process.
// usage: node tools/sandbox/probes/sc1-field-walk.mjs <root> [<root>…]
// [TESTED: 2026-09-26 01:46:09 +03:00 · four field trees, read-only: the old walk reached 184973 files of worktree copies in one of
//  them, the new one 0; report testcases/reports/2026-09-26_sc1-one-safe-walker.md]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const core = readFileSync(join(REPO, 'framework', 'installer', 'KAIF-CORE.mjs'), 'utf8').replace(/\r\n/g, '\n');
const a = core.indexOf('// ── KAIF-WALK:BEGIN'), b = core.indexOf('// ── KAIF-WALK:END');
if (a < 0 || b < a) { console.error('✖ the core carries no KAIF-WALK block'); process.exit(2); }
const { kaifWalk } = new Function('readdirSync', 'statSync', 'spawnSync', core.slice(a, b) + '\nreturn { kaifWalk };')(readdirSync, statSync, spawnSync);

const OLD_SKIP = ['.git', 'node_modules', '.kaif', 'researches', 'interviews', 'homeworks', 'bugs', 'ideas', 'reports', '.agents', '.grok', '.cline', '.roo'];
function oldWalk() {
  const files = [];
  let died = null;
  const walk = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = (dir === '.' ? '' : dir + '/') + n;
      if (OLD_SKIP.includes(n)) continue;
      if (statSync(p).isDirectory()) { walk(p); continue; }
      files.push(p);
    }
  };
  try { walk('.'); } catch (e) { died = `${e.code || e.message}`; }
  return { files, died };
}
const under = (fs) => fs.filter((p) => /(^|\/)\.claude\/worktrees\//.test(p)).length;
const roots = process.argv.slice(2);
if (!roots.length) { console.error('usage: node tools/sandbox/probes/sc1-field-walk.mjs <root> [<root>…]'); process.exit(2); }
console.log('| root | old: files · under worktrees · died | new: files · under worktrees · skipped · failed |');
console.log('|---|---|---|');
const here = process.cwd();
roots.forEach((r, i) => {
  process.chdir(resolve(here, r));
  const o = oldWalk();
  const n = kaifWalk(['.']);
  const oldSkipped = n.files.filter((p) => p.split('/').some((s) => OLD_SKIP.includes(s)));
  console.log(`| root ${i + 1} | ${o.files.length} · ${under(o.files)} · ${o.died ? 'DIED ' + o.died : 'no'} | ${n.files.length} (${n.files.length - oldSkipped.length} outside the scan's skipped dirs) · ${under(n.files)} · ${n.skipped.length}${n.skipped.length ? ' (' + n.skipped.slice(0, 3).join(', ') + ')' : ''} · ${n.failed.length} |`);
  process.chdir(here);
});
