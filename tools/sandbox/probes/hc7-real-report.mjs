// HC7 (version KAIF 2.10, criterion 27; origin #161 — bugs/135) — the FUNCTIONAL run: a real run report of the origin, written the way a
// session writes it — the two Checks lines as list items («- Гигиена: …», «- Функциональный прогон: …», verdict pass) — checked by the
// REAL linter of tag v2.9 (`git show v2.9:framework/tools/kaif-testrun-lint.mjs`) and by this build's, each `check <home>` on a copy in a
// temporary home; v2.9 must say pass-without-functional-run, this build — 0 findings. The source report is only read.
// Run: node tools/sandbox/probes/hc7-real-report.mjs [<report.md>]   (≈ 1 s; default — the session-98 report, the one that hit it live)
// [TESTED: 2026-11-06, between 16:00 and 16:03 (minute not logged) · functional — the session-98 report with its lines listed: the v2.9 linter exit 1 pass-without-functional-run,
//  this build's linter exit 0, 0 findings]
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = resolve(process.argv[2] || join(REPO, 'testcases', 'reports', '2026-11-06_s98-judge-debt-mm-tk10.md'));
if (!existsSync(SRC)) { console.log('REFUSED: no report at ' + SRC); process.exit(2); }
// the report as a session writes it: the two lines as list items
const listed = readFileSync(SRC, 'utf8').split('\n').map((l) => (/^(?:Гигиена|Функциональный прогон|Hygiene|Functional run):/.test(l) ? '- ' + l : l)).join('\n');
if (!/^- (?:Функциональный прогон|Functional run):/m.test(listed)) { console.log('REFUSED: the report has no Functional run line to list'); process.exit(2); }
const d = mkdtempSync(join(tmpdir(), 'kaif-hc7-real-'));
try {
  mkdirSync(join(d, 'home', 'reports'), { recursive: true });
  writeFileSync(join(d, 'home', 'reports', basename(SRC)), listed);
  writeFileSync(join(d, 'old-lint.mjs'), execFileSync('git', ['show', 'v2.9:framework/tools/kaif-testrun-lint.mjs'], { cwd: REPO, encoding: 'utf8' }));
  const check = (lint) => { const r = spawnSync(process.execPath, [lint, 'check', join(d, 'home')], { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
  const old = check(join(d, 'old-lint.mjs')), now = check(join(REPO, 'framework', 'tools', 'kaif-testrun-lint.mjs'));
  const oldRed = old.code !== 0 && /pass-without-functional-run/.test(old.out), nowGreen = now.code === 0 && /0 findings/.test(now.out);
  console.log(`${oldRed ? 'OK  ' : 'BAD '}v2.9 linter on the listed report: exit ${old.code}${oldRed ? ' · pass-without-functional-run' : ''}`);
  console.log(`${nowGreen ? 'OK  ' : 'BAD '}this build's linter on the same report: exit ${now.code}${nowGreen ? ' · 0 findings' : ' · ' + now.out.slice(0, 160)}`);
  console.log(oldRed && nowGreen ? '✅ the listed line counts now, and did not on v2.9' : '❌ functional run failed');
  process.exit(oldRed && nowGreen ? 0 : 1);
} finally { rmSync(d, { recursive: true, force: true }); }
