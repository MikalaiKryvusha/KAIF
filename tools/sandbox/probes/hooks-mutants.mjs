// tools/sandbox/probes/hooks-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of the four axes that
// suite s14 gained on 2026-09-18 (origin bugs 118 #1 · 119 #3 · 121). Each mutant is applied to a COPY of dist/ in the OS
// temp dir (never to the tree — EXP-0077), the suite runs against the copy through the KAIF_DIST seam, and the red assert
// lines are compared with addressees NAMED BEFORE the run (EXP-0059): mutant M → exactly these asserts go red, and only they.
// A mutant that DID NOT APPLY is a refusal, never a green: that rule is what caught origin bug 122 — the needle was the
// ASCII escape of a byte-order mark, while the bundle carried the REAL invisible character an edit tool had decoded.
// Run it after touching framework/hooks/* or s14:   node tools/sandbox/probes/hooks-mutants.mjs
// Raises no window and no sound (s14 starts hidden shells with a closed stdin); needs a FRESH dist (rebuild first);
// runs the suite once per mutant (the closing line prints how many — a count written here went stale: it said thirty-one at
// forty-one) — run it ALONE, not beside the polygon (origin bug 109).
// [TESTED: 2026-09-25 22:08:57 +03:00 · ELEVEN mutants after the owner-word gate (M11 reasoning counted as an answer): «11 mutants red
//  exactly on their named addressees, and only on them»; report testcases/reports/2026-09-25_ow10-judge-fixes-owner-word-gate.md]
// [TESTED: 2026-09-25 17:43 +03:00 · TEN mutants after OW2 (M8 the imperative before the word dropped · M9 the heading exclusion dropped · M10 the stop
//  branch dropped): «10 mutants red exactly on their named addressees, and only on them»; report testcases/reports/2026-09-25_ow2-owner-word-mid-turn.md]
// [TESTED: 2026-09-18 12:12 +03:00 · run on the origin after the fix — four mutants, each red exactly on its named
//  addressees (2 · 1 · 1 · 1) and green elsewhere (85/86 of 87); the first run at 12:09 refused M4 with "mutation did not
//  apply" — report testcases/reports/2026-09-18_hooks-optin-smoke.md, runs 7 and 9.
//  2026-09-18 14:44 +03:00 · FIVE mutants after the session judge's finding F1 (M5 is the judge's own mutant, which the
//  suite had passed 87/87): red 2 · 1 · 1 · 1 · 1, green 86/87 of 88 — the same report, run 16]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FENCE = '``````';                                   // the bundle wraps every embedded file in a six-backtick fence
const BOM_ESCAPE = String.fromCharCode(92) + 'uFEFF';     // built from code points: no tool layer can decode it on the way here

/** Replace inside ONE embedded FILE block of the bundle; throws when the block or the needle is not there. */
function mutateBlock(bundle, dest, fn) {
  const head = bundle.indexOf('> **FILE: `' + dest + '`**');
  if (head < 0) throw new Error('block not found: ' + dest);
  const open = bundle.indexOf(FENCE, head);
  const close = bundle.indexOf('\n' + FENCE, open + FENCE.length);
  const body = bundle.slice(open, close);
  const next = fn(body);
  if (next === body) throw new Error('mutation did not apply: ' + dest);
  return bundle.slice(0, open) + next + bundle.slice(close);
}
const swap = (s, a, b) => s.split(a).join('@@SWAP@@').split(b).join(a).split('@@SWAP@@').join(b);

const MUTANTS = [
  { name: 'M1 fragment: prompt-resume-word <-> stop-status-guard swapped (bug 118 #1)',
    dest: '.kaif/hooks/settings-fragment.json',
    fn: (b) => swap(b, 'prompt-resume-word.mjs', 'stop-status-guard.mjs'),
    // 2.9 WH: the retirement fixture is BUILT from the shipped sample, so a broken sample breaks it too — the same predicate (EXP-0169)
    expect: ['s14 ось пар settings-fragment.json:', 's14 ось пар: мутация фрагмента', 's14 WH фикстура', 's14 WH: `check` называет', 's14 WH: wire-hooks — чистое снятие'] },
  { name: 'M2 timer: a malformed marker falls back to NOW instead of the file mtime (bug 121 #3)',
    dest: '.kaif/hooks/prompt-refresh-timer.mjs',
    fn: (b) => b.replace('if (Number.isNaN(at)) at = statSync(markerPath).mtimeMs;', 'if (Number.isNaN(at)) { statSync(markerPath); at = Date.now(); }'),
    expect: ['s14 таймер: битый JSON при СТАРОМ mtime'] },
  { name: 'M3 README: the POSIX redirect offered to the PowerShell reader again (bug 121 #1)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace("'' | node .kaif/hooks/prompt-refresh-timer.mjs", 'node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null'),
    expect: ['s14 проба README [powershell] строка 1:'], platform: 'win32' }, // the suite runs the powershell block only on Windows
  { name: 'M4 resume-word: the byte-order-mark strip removed from ONE hook (bug 119 #3)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace("readFileSync(0, 'utf8').replace(/^" + BOM_ESCAPE + "/, '')", "readFileSync(0, 'utf8')"),
    expect: ['s14 BOM resume-word:'] },
  // M5 — the mutant the session-67 judge ran (J1) and the suite could NOT see: with a closed stdin the hook gets EOF at
  // once, so a line that lost its empty stdin still answers in the hidden run. Only the static assert reads the TEXT.
  { name: 'M5 README: the empty stdin dropped from the first line of BOTH blocks (bug 121 #1, judge finding F1)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => {
      const sh = 'node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null', ps = "'' | node .kaif/hooks/prompt-refresh-timer.mjs";
      if (!b.includes(sh) || !b.includes(ps)) return b;          // one needle missing → "mutation did not apply"
      return b.replace(sh, 'node .kaif/hooks/prompt-refresh-timer.mjs').replace(ps, 'node .kaif/hooks/prompt-refresh-timer.mjs');
    },
    expect: ['s14 проба README: каждая строка каждого блока даёт хуку stdin'] },
  // M6 and M7 — the two bypasses the delta judge of f4915af found in the FIRST edition of that static assert: a line that
  // looks like it feeds stdin and does not. The assert is now tied to the hook call itself; these two keep it so.
  { name: 'M6 README: the feed is COMMENTED OUT in the sh block (delta judge, finding 2)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace('node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null', 'node .kaif/hooks/prompt-refresh-timer.mjs # < /dev/null'),
    expect: ['s14 проба README: каждая строка каждого блока даёт хуку stdin'] },
  { name: 'M7 README: the hook stands on the LEFT of the pipe in the powershell block (delta judge, finding 2)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace("'' | node .kaif/hooks/prompt-refresh-timer.mjs", 'node .kaif/hooks/prompt-refresh-timer.mjs | node -e "process.stdin.pipe(process.stdout)"'),
    expect: ['s14 проба README: каждая строка каждого блока даёт хуку stdin'] },
  // 2.8, epic OW, OW2 (criterion 5 of plans/117): the three new predicates of the leading-word hook.
  { name: 'M8 resume-word: the imperative before the word dropped ("execute resume" silent again — recon Q-R7)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('(?:(?:run|do|execute|start|\\u0432\\u044b\\u043f\\u043e\\u043b\\u043d\\u0438|\\u0437\\u0430\\u043f\\u0443\\u0441\\u0442\\u0438|\\u0441\\u0434\\u0435\\u043b\\u0430\\u0439|\\u043d\\u0430\\u0447\\u043d\\u0438)\\s+)?', ''),
    // 2.9 (№143, session 78): the scope case opens with the owner's real "выполни RESUME" — the same predicate, a lawful red (EXP-0169)
    expect: ['s14 resume-word: «выполни resume»', 's14 resume-word (№143)'] },
  { name: 'M9 resume-word: the heading exclusion dropped (the Russian noun with a colon fires again — court D-F4)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('(?!\\s*:)', ''),
    expect: ['s14 resume-word: «Резюме: …»'] },
  { name: 'M10 stop-word: the stop branch dropped (a leading stop reaches the model with no order)',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('if (prompt !== null && LEADING_STOP.test(prompt)) {', 'if (false) {'),
    expect: ['s14 stop-word: «стоп» первым словом', 's14 stop-word: «СТОП!»', 's14 stop-word: «stop, …»'] },
  // 2.9, epic WH (origin ticket #144): the owner-word gate M11–M13 and the end-of-turn hook M14–M21 · M32 · M33 left with their hooks.
  // 2.9, epic HK — the project root, the future stamp, the honest words, the suite judging the truth (ticket #94, bugs 118-120)
  { name: 'M22 timer: the marker read in the event cwd again (ticket #94 — "no refresh witness" after one `cd src`)',
    dest: '.kaif/hooks/prompt-refresh-timer.mjs',
    fn: (b) => b.replace('const markerPath = join(projectRoot(cwd), MARKER);', 'const markerPath = join(cwd, MARKER);'),
    expect: ['s14 HK таймер: событие из `src/deep`', 's14 HK таймер: из `src/deep` протухший', 's14 HK таймер: приказ называет маркер ПОЛНЫМ путём'] },
  { name: 'M23 timer: a marker stamped in the future trusted again (bug 119 no. 2 — silence until that moment)',
    dest: '.kaif/hooks/prompt-refresh-timer.mjs',
    fn: (b) => b.replace('const future = ageMin < -FUTURE_TOLERANCE_MIN;', 'const future = false;'),
    expect: ['s14 HK таймер: `at` на 30 мин в будущем'] },
  { name: 'M24 session-start: every source but clear told "compacted" again (bug 120 no. 1)',
    dest: '.kaif/hooks/session-start-refresh.mjs',
    fn: (b) => b.replace('Object.prototype.hasOwnProperty.call(WORDING, source) ? WORDING[source] : SESSION_START', 'WORDING[source] || WORDING.compact'),
    expect: ['s14 HK SessionStart startup', 's14 HK SessionStart resume', 's14 HK SessionStart без поля source'] },
  { name: 'M25 session-start: the root search dropped — the marker named under the event cwd',
    dest: '.kaif/hooks/session-start-refresh.mjs',
    fn: (b) => b.replace('if (existsSync(join(d, DEPLOYMENT))) return d;', 'if (false) return d;'),
    expect: ['s14 HK SessionStart compact из `src/deep`'] },
  { name: 'M26 resume-word: the root search dropped — the /resume order names a marker no hook reads',
    dest: '.kaif/hooks/prompt-resume-word.mjs',
    fn: (b) => b.replace('if (existsSync(join(d, DEPLOYMENT))) return d;', 'if (false) return d;'),
    expect: ['s14 HK resume-word'] },
  { name: 'M27 STATUS guard: STATUS.md and git read in the event cwd again (ticket #94 — the guard silent from a subfolder)',
    dest: '.kaif/hooks/stop-status-guard.mjs',
    fn: (b) => b.replace('const root = projectRoot(cwd);', 'const root = cwd;'),
    expect: ['s14 HK страж STATUS: событие из `src/deep`', 's14 HK страж STATUS: причина называет наблюдение'] },
  { name: 'M28 STATUS guard: the reason claims the session\'s work again (bug 120 no. 2)',
    dest: '.kaif/hooks/stop-status-guard.mjs',
    fn: (b) => b.replace("observed = 'the worktree has uncommitted changes'", "observed = 'this session changed the tree'"),
    expect: ['s14 HK страж STATUS: причина называет наблюдение'] },
  { name: 'M29 README: the Cursor "Hourly timer" cell flipped to a tick the sample does not carry (bug 118 no. 3)',
    dest: '.kaif/hooks/README.md',
    fn: (b) => b.replace('| ❌ `beforeSubmitPrompt` cannot inject agent context |', '| ✅ `beforeSubmitPrompt` cannot inject agent context |'),
    expect: ['s14/O5 таблица README ↔ sample-cursor-hooks.json'] },
  { name: 'M30 Cursor sample: a shape the script does not have (`--emit cursorX`) passed the substring check (bug 118 no. 2)',
    dest: '.kaif/hooks/sample-cursor-hooks.json',
    fn: (b) => b.split('--emit cursor').join('--emit cursorX'),
    expect: ['s14/O5 Cursor: каждая команда образца'] },
  { name: 'M31 Cursor sample: an extra `--emit` in front of the required one (the first flag wins) (bug 118 no. 2)',
    dest: '.kaif/hooks/sample-cursor-hooks.json',
    fn: (b) => b.split('--emit cursor').join('--emit copilot --emit cursor'),
    expect: ['s14/O5 Cursor: каждая команда образца'] },
  // 2.9, epic SW, step SW2 (origin issue #115): `wire-hooks` lives in the CORE, not in a bundle block — these mutate the dist core
  // copy (`core: true`, from → to, one exact anchor), and s14 section SW2 names each one before the run.
  { name: 'W1 wire-hooks: the owner\'s opt-out ignored ("hooks": "off" wired anyway)', core: true,
    from: "  if (marker.hooks === 'off') return { state: 'off', retired: retiredOf(HOOK_SETTINGS), retiredLocal };", to: '',
    expect: ['s14 SW2: "hooks": "off"', 's14 WH: "hooks": "off"'] },
  { name: 'W2 wire-hooks: the personal settings.local.json not read (a hook wired there is wired twice)', core: true,
    from: 'const have = new Set([...hookScriptsIn(project.obj, event), ...hookScriptsIn(local.obj, event)]);', to: 'const have = new Set([...hookScriptsIn(project.obj, event)]);',
    expect: ['s14 SW2: хуки уже в settings.local.json'] },
  { name: 'W3 wire-hooks: the byte-order mark of the owner\'s file dropped on write', core: true,
    from: "  if (raw != null && raw.startsWith('" + BOM_ESCAPE + "')) text = '" + BOM_ESCAPE + "' + text;\n", to: '',
    expect: ['s14 SW2: файл с BOM и CRLF'] },
  { name: 'W4 check: a delivered hook that is not wired goes unnamed', core: true,
    from: "    if (hw.state === 'missing' && hw.missing.length) console.error(", to: '    if (false) console.error(',
    expect: ['s14 SW2: поставленные хуки не подключены'] },
  { name: 'W5 checkpoint: the wire-hooks gate dropped (a tick with nothing wired and no refusal recorded)', core: true,
    from: "  if (id === 'wire-hooks') {", to: '  if (false) {',
    expect: ['s14 SW2: `checkpoint wire-hooks` без подключения', 's14 SW2: отказ харнесса', 's14 WH: `checkpoint wire-hooks` при подключённом снятом'] },
  { name: 'W6 wire-hooks: a deployment without Claude Code wired anyway', core: true,
    from: "  if (!agents.some((a) => HOOK_SYSTEMS.includes(a))) return { state: 'no-system', agents };\n", to: '',
    expect: ['s14 SW2: развёртывание только под Codex'] },
  { name: 'W7 wire-hooks: the owner\'s indent replaced by two spaces', core: true,
    from: "  const indent = indentM ? (indentM[1].includes('\\t') ? '\\t' : indentM[1].length) : 2;", to: '  const indent = 2;',
    expect: ['s14 SW2: wire-hooks — чужой PreToolUse'] },
  { name: 'W8 wire-hooks: an unparseable settings file read as empty (the owner\'s file overwritten)', core: true,
    from: "  try { obj = JSON.parse(raw.replace(/^" + BOM_ESCAPE + "/, '')); } catch (e) { return { raw, error: 'not parseable JSON (' + e.message + ')' }; }",
    to: "  try { obj = JSON.parse(raw.replace(/^" + BOM_ESCAPE + "/, '')); } catch (e) { obj = {}; }",
    expect: ['s14 SW2: settings.json с комментарием'] },
  // 2.9, epic SW judge J-SW2 (the functional run of the field route 2.8 → 2.9, 2026-10-14): `checkpoint recheck` printed check's STDOUT
  // only, and `check` names unwired hooks on STDERR — the mutant restores the stdout-only form. Its addressee lives in s01 S9 (the case
  // needs an UPDATE task, which carries the recheck item; s14 copies carry the install task) — `suite` names the suite to run.
  { name: 'W9 checkpoint recheck: check\'s stderr dropped on a green run (the unwired hooks go unnamed)', core: true, suite: 's01-field-fixes.mjs',
    from: '    if (chk.stderr) process.stderr.write(chk.stderr);\n', to: '',
    expect: ['S9 SW2: отметка recheck называет поставленные'] },
  // the same functional run over clones of five real v2.8 deployments: an owner's file in the shipped sample's style (arrays of strings on
  // one line) was rewritten whole by a bare JSON.stringify — the mutant drops the fold-back
  { name: 'W10 wire-hooks: the owner\'s one-line arrays unfolded (six rewritten hunks around one added hook)', core: true,
    from: '  if (!inline.size) return text;\n', to: '  return text;\n',
    // 2.9 WH: the removal in the sample's style is judged byte for byte — the same fold-back (EXP-0169); the SW2 addition case left with
    // the hook it added (the 2.9 sample adds nothing to a 2.8 owner's file — it removes)
    expect: ['s14 WH: wire-hooks — чистое снятие'] },
  // 2.9, epic WH (origin ticket #144): the update REMOVES the wiring of a retired hook, and `check` names one left
  { name: 'W11 wire-hooks: the retired entries kept (the field keeps a hook whose script is gone — a hook-error notice at every call)', core: true,
    from: '  const base = st.retired.length ? withoutRetired(orig) : orig;', to: '  const base = orig;',
    expect: ['s14 WH: wire-hooks — чистое снятие', 's14 WH: повторный wire-hooks после снятия', 's14 WH: после снятия `check` молчит', 's14 WH: свой PreToolUse владельца'] },
  { name: 'W12 check: a retired hook still wired goes unnamed', core: true,
    from: '    if ((hw.retired || []).length) console.error(', to: '    if (false) console.error(',
    expect: ['s14 WH: `check` называет подключённые снятые', 's14 WH: "hooks": "off"'] },
  // 2.9 (origin tickets #143 · #145): the study item's tick checks the refresh witness — the wired timer fired at the owner's first prompt
  { name: 'W13 checkpoint study: the refresh-witness gate dropped (the timer fires at the owner\'s first prompt after install)', core: true,
    from: "  if (id === 'study') {", to: '  if (false) {',
    expect: ['s14 study: отметка без маркера освежения', 's14 study: маркер полуторачасовой давности'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-hooks-mutants-'));
let bad = 0, skipped = 0;
for (const m of MUTANTS) {
  // a mutant whose addressee the suite runs on one platform only is NOT proven elsewhere — named, never counted as red (2.9, epic OA)
  if (m.platform && m.platform !== process.platform) { skipped++; console.log(`SKIP ${m.name}\n    its addressee runs on ${m.platform} only — not provable on ${process.platform}`); continue; }
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  if (m.core) {   // the dist core copy — one exact anchor, or the mutant is refused as not applied
    const c = join(dist, 'KAIF-CORE.mjs'), src = readFileSync(c, 'utf8'), hits = src.split(m.from).length - 1;
    if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply; re-anchor it to the current core`); continue; }
    writeFileSync(c, src.replace(m.from, m.to));
    // the manifest pins the core by sha256 — a build that SHIPS this core pins it too; without the re-pin a suite that installs through the
    // loader (s01) reds on «core tampered», not on the mutant (W9's first run: 10 red of 1 named — S4 · S7 · S9)
    const mp = join(dist, 'kaif-manifest.json'), man = JSON.parse(readFileSync(mp, 'utf8'));
    man.sha256['KAIF-CORE.mjs'] = createHash('sha256').update(readFileSync(c)).digest('hex');
    writeFileSync(mp, JSON.stringify(man, null, 2) + '\n');
  } else {
    const p = join(dist, 'KAIF-CORE-BUNDLE.md');
    writeFileSync(p, mutateBlock(readFileSync(p, 'utf8'), m.dest, m.fn));
  }
  let out = '';
  const suite = m.suite || 's14-refresh-hooks.mjs';
  try { out = execFileSync(process.execPath, [join(REPO, 'tools', 'sandbox', suite)], { env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe' }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const lines = out.split(/\r?\n/);
  // s14 names every case «s14 …»; another suite's red line is any «❌ » but its closing tally (a died setup step is red too — EXP-0158)
  const red = m.suite ? lines.filter((l) => l.startsWith('❌ ') && !/^❌ ПРОВАЛОВ/.test(l)) : lines.filter((l) => l.startsWith('❌ s14'));
  const green = lines.filter((l) => (m.suite ? l.startsWith('✅ ') : l.startsWith('✅ s14'))).length;
  const verdict = red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    red ${red.length} (named before the run: ${m.expect.length}) · green ${green}`);
  for (const r of red) console.log('      ' + r.slice(0, 170));
}
rmSync(root, { recursive: true, force: true });
const proven = MUTANTS.length - skipped;
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${proven}` : `\n✅ ${proven} mutants red exactly on their named addressees, and only on them` + (skipped ? ` · ${skipped} not provable on this platform (named above)` : ''));
process.exit(bad ? 1 : 0);
