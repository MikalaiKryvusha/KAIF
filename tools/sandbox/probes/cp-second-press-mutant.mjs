// tools/sandbox/probes/cp-second-press-mutant.mjs — a PROBE (not a polygon suite): criterion 6 of plans/126 (epic CP, origin #128 — the
// owner, in two projects: "the radio buttons do not clear on a second tap"), proved RED on the v2.8 page behaviour in a live browser.
// The cloud session 76 proved it with an experiment in its own scratchpad, which died with it (EXP-0016); this probe is the re-runnable
// proof the CP7 judge asked for (plans/129 CP7).
// How: two COPIES of the tracked files that `tools/verify-contour.mjs` reads (tools/ · framework/tools/ · interviews/ · .kaif/kaif.json) in
// the OS temp dir — never the tree (EXP-0077). Control copy: untouched, must give 0 red. Mutant copy: the page script loses the capture
// `click` listener that swallows the click of the same press (the v2.8 behaviour: pointerdown clears, the click re-checks); it must redden
// exactly the two named addressees — mouse and touch «second press clears» — and nothing else (EXP-0169). A run without the closing
// «ИТОГ QA-прогона» line is DIED, not green (EXP-0158).
// Quiet by environment, not by flags (EXP-0132): quietEnv() — no programs in PATH (no beep, no system voice), KAIF_VOICE_TOOL empty (the
// origin wrapper would put its voice default back); the browser is found by absolute path, so it still starts — headless, no window.
// usage: node tools/sandbox/probes/cp-second-press-mutant.mjs        (≈ 2 × the time of one verify-contour run; run it alone)
// [TESTED: 2026-10-14 09:15:55 · control copy 233/0, the v2.8 press red exactly on its two named cases · report testcases/reports/2026-10-14_cp7-second-press-judge.md]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const PATHS = ['tools', 'framework/tools', 'interviews', '.kaif/kaif.json'];
const PAGE = 'framework/tools/contour/review.mjs';
const RUN_TIMEOUT_MS = 600000;   // one full verify-contour run; a hang is a failure, not a wait
// The two lines of the capture listener (CP1, 2.9) — removing them gives back the v2.8 press: pointerdown clears, the click re-checks.
const CUT = [
  `"document.addEventListener('click',function(e){if(!pdLab||Date.now()-pdAt>" + CLICK_OF_PRESS_MS + ")return;",`,
  `" var lab=e.target&&e.target.closest?e.target.closest('label.opt'):null;if(lab!==pdLab)return;pdLab=null;e.preventDefault()},true);",`,
];
const ADDRESSEES = ['мышь: второе нажатие СНИМАЕТ выбор', 'касание: второе нажатие СНИМАЕТ выбор'];

const ls = spawnSync('git', ['ls-files', '-z', '--', ...PATHS], { encoding: 'utf8' });
if (ls.status !== 0) { console.log('BAD: git ls-files failed — ' + ls.stderr); process.exit(2); }
const files = ls.stdout.split('\0').filter(Boolean);
// only tracked files are copied, so an untracked file (this probe before its commit) is not a difference
const dirty = spawnSync('git', ['status', '--porcelain', '--untracked-files=no', '--', ...PATHS], { encoding: 'utf8' }).stdout.trim();
if (dirty) console.log('NOTE: the copied paths differ from HEAD — the copies carry the working tree:\n' + dirty);

function copyTree() {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-cp7-'));
  for (const f of files) { mkdirSync(dirname(join(dir, f)), { recursive: true }); copyFileSync(f, join(dir, f)); }
  return dir;
}
function run(dir) {
  const env = quietEnv({ KAIF_VOICE_TOOL: '' });
  delete env.KAIF_CONTOUR_TICK_MS; delete env.KAIF_CONTOUR_SILENCE_MS;   // verify-contour sets its own where a block needs them
  const t0 = new Date().toISOString();
  const r = spawnSync(process.execPath, [join(dir, 'tools', 'verify-contour.mjs')], { cwd: dir, env, encoding: 'utf8', timeout: RUN_TIMEOUT_MS });
  const out = (r.stdout || '') + (r.stderr || '');
  const total = (out.match(/ИТОГ QA-прогона: (\d+) зелёных, (\d+) красных/u) || []).slice(1).map(Number);
  const red = out.split(/\r?\n/).filter((l) => /^\s*✗ /u.test(l)).map((l) => l.trim());
  return { status: r.status, out, red, died: total.length !== 2, total, t0, t1: new Date().toISOString() };
}

let bad = 0;
// control — the copy itself must be green, or the mutant's reds prove nothing about the mutation
const cDir = copyTree();
const c = run(cDir);
const cGood = !c.died && c.status === 0 && c.red.length === 0;
if (!cGood) bad++;
console.log(`${cGood ? 'OK ' : 'BAD'} control (untouched copy) — exit ${c.status}, ${c.died ? 'DIED (no ИТОГ line)' : c.total[0] + ' green, ' + c.total[1] + ' red'} · ${c.t0} → ${c.t1}`);
for (const l of c.red) console.log('    ' + l.slice(0, 160));
if (c.died) console.log(c.out.split(/\r?\n/).slice(-15).join('\n'));
rmSync(cDir, { recursive: true, force: true });

// mutant — the v2.8 press
const mDir = copyTree();
const page = join(mDir, PAGE);
let s = readFileSync(page, 'utf8');
for (const line of CUT) {
  if (s.split(line).length !== 2) { console.log(`BAD mutant: anchor did not apply (${s.split(line).length - 1}x): ${line.slice(0, 60)}…`); bad++; s = null; break; }
  s = s.replace(line, () => '');
}
if (s !== null) {
  writeFileSync(page, s);
  const m = run(mDir);
  const hit = ADDRESSEES.every((a) => m.red.some((l) => l.includes(a)));
  const mGood = !m.died && m.status !== 0 && m.red.length === ADDRESSEES.length && hit;
  if (!mGood) bad++;
  console.log(`${mGood ? 'OK ' : 'BAD'} mutant: the capture click listener removed (v2.8 press) — exit ${m.status}, ${m.died ? 'DIED (no ИТОГ line)' : m.total[0] + ' green, ' + m.total[1] + ' red'} · ${m.t0} → ${m.t1}`);
  for (const l of m.red) console.log('    ' + l.slice(0, 160));
  if (m.died) console.log(m.out.split(/\r?\n/).slice(-15).join('\n'));
}
rmSync(mDir, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : `✅ control green; the v2.8 press red exactly on its ${ADDRESSEES.length} named cases, and only on them`);
process.exit(bad ? 1 : 0);
