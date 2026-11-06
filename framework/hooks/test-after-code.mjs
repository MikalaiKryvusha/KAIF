#!/usr/bin/env node
// test-after-code.mjs — the "you wrote code — run it" hook (KAIF 2.10, epic HC, step HC8; origin tickets #175 · #176; optional
// refresh-hooks module, deployed to .kaif/hooks/). Claude Code events: PostToolUse (writes · shell) · Stop.
//
// What it does: every write of a file that changes the product the user runs becomes a TEST DEBT; only a RUN of its own kind clears it;
// the stop of a turn with debt is refused ONCE with the order and the list (a repeated stop with nothing new written passes — no endless
// loop, in this turn or a later one; the debt stays — in `--status` and in the line of the next write). Two field deployments of one owner converged on this shape (recon — origin researches/43);
// the owner's word there, rendered: «the agent wrote code → the hook ORDERS it tested» · «the agent does not ask the owner's permission».
//   PostToolUse Write · Edit · MultiEdit · NotebookEdit of a product file → the file enters the debt {path: {kind, at}}; the first entry
//     after a clean debt carries the full order (the steps of TESTING_FRAMEWORK.md), later ones a short line with the count;
//   PostToolUse Bash · PowerShell → a command that is a RUN of a kind clears that kind's debt; hygiene (`--check`, `--help`, `--version`,
//     `py_compile`, `compileall`, a linter, a build) never clears; the body of a heredoc is data, never a command (field: a test case
//     appended by heredoc named the game launcher and cleared the debt); a deploy command is debt of its own kind;
//   Stop with debt → {"decision":"block","reason": …} once per debt signature; the same signature again — in this turn or a later one → silence.
//   A RUN of the default kind: an interpreter in the command and the file as the first word after its flags; the file's name elsewhere
//   (`git add`, `cat`, `grep`, a commit tool's `--only`) is not a run.
// Kinds and patterns are the PROJECT's data (`.kaif/kaif.json` → `testHook`, shape below); the mechanism is the framework's. Without data
// one kind `code`: a source file of the project (the extensions of the knowledge hook, configs excluded) cleared by a command that RUNS
// the file — its name in the command, the command not hygiene.
//   "testHook": { "kinds": { "<kind>": { "files": ["<regex on the path from the root>", …], "runs": ["<regex on a segment of the command>", …] } },
//                 "hygiene": ["<regex>", …], "deploys": ["<regex on a segment of the command>", …], "deployKind": "<kind a deploy is debt of>" }
// A run that does not match the project's own self-tests is the project's job: keep `runs` disjoint from them (field: a guards self-test
// matched the game-run pattern and cleared a deploy debt).
//   node .kaif/hooks/test-after-code.mjs                    # a Claude Code event on stdin
//   node .kaif/hooks/test-after-code.mjs --status            # the debt now
//   node .kaif/hooks/test-after-code.mjs --waive "<why>"     # no run is possible (no device): the debt is dropped WITH the reason, kept for the judge
//   node .kaif/hooks/test-after-code.mjs --selftest
// State — `.kaif/test-debt.json` (ignore-first: never in the project tree's history). Any internal error → exit 0 silently.
// The lines are English on purpose: the agent reads them, not the owner.
// GAP: the hook sees that a run HAPPENED, not that it checked what was written or that its result was read — that is the judge and the
// run report; code written past the write tools (a heredoc into a file) is not seen; a file name in a command is a sign of a run, not
// proof of one.
// [TESTED: 2026-11-06 16:24:24 → 16:26:28 · functional — tools/sandbox/probes/hc8-live-test-hook.mjs, 6 live headless sessions (claude -p
//  --model haiku, KAIF installed by this build, hooks wired): «add double(x)» — the order after the edit 3/3, the session ran the file
//  itself 3/3, no debt left; the same with «do not run anything» — the stop refused with the list 3/3, the session still ended 3/3 (two
//  waived with the owner's reason, one ended with the debt standing — the repeated stop passed); control on the v2.9 dist
//  (16:26:28 → 16:27:21): no hook, the session ran the file 0/3; after the light judge's fixes (a run = the file as an interpreter's
//  script; once per debt signature) the same probe 16:41:21 → 16:44:11 — 3/3 · 3/3 in both scenarios; hygiene — --selftest 20 cases, seven
//  mutants (tools/sandbox/probes/hc8-test-hook-mutant.mjs), s14, polygon 28/28 (16:44:11 → 16:53:41); ON THE ORIGIN'S REAL PATH — wired
//  in session 98, it ordered runs after the session's own edits and counted the runs; it also showed a defect there (≈ 17:03: a chain
//  «node --check x && node x» was read as hygiene whole) — hygiene is judged per segment since, continuation lines joined first, a
//  deploy judged per segment (light judge, s98) — these three fixes are proven by hygiene only (--selftest 22 cases, eight mutants),
//  the live probe above ran on the hook before them; report testcases/reports/2026-11-06_s98-hc8-testing-hook.md]
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute, basename, sep } from 'node:path';
import { tmpdir } from 'node:os';

const STATE = join('.kaif', 'test-debt.json');
const DEPLOYMENT = join('.kaif', 'kaif.json');
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);
const LIST_MAX = 6;                    // files named in a line; the rest are counted
// the default kind: the source extensions of the knowledge hook (configs are not code — judge of session 97, finding 5)
const CODE_EXT = /\.(?:m?[jt]sx?|cjs|py|go|rs|java|kt|cs|c|cc|cpp|h|hpp|rb|php|swift|sh|ps1|sql|vue|svelte|html|css)$/i;
const NOT_PROJECT = /^(?:\.kaif|\.claude|\.git|node_modules|dist|build|vendor)\//;
const HYGIENE = [/--check\b/, /--help\b/, /--version\b/, /py_compile/, /-m\s+compileall/, /\b(?:eslint|tsc|prettier|ruff|flake8|pylint)\b/,
  /\bnpm\s+run\s+(?:build|lint)\b/, /\bdotnet\s+build\b/, /\bcargo\s+(?:build|check|clippy)\b/, /\bgo\s+(?:build|vet)\b/];

export const LINES = {
  full: (files) => `KAIF testing: you wrote code — RUN it before you stop or say "done"; the owner is not asked (origin #175). Not run: ${files}. ` +
    'Steps, yourself: 1) TESTING_FRAMEWORK.md — "What the word "test" means" and "The testing activities"; 2) what the code must do and ' +
    'the result you EXPECT — cases in the project\'s test documents; 3) a run on the real product by the user\'s path, its output READ; ' +
    '4) expected against actual; 5) a defect — fix it and run again. A build, a linter, --check are hygiene, not a run. No run possible ' +
    '(no device) or the owner forbade running it — `node .kaif/hooks/test-after-code.mjs --waive "<why>"`.',
  short: (n, files) => `KAIF testing: code not run yet — ${n} (${files}); run it before you stop or say "done".`,
  cleared: (done, left) => `KAIF testing: a run counted for ${done}; read its result and compare it with the expected` +
    (left ? `; still not run: ${left}.` : '; no code is waiting for a run.'),
};

function projectRoot(cwd) {
  for (let d = resolve(cwd || '.'); ;) {
    if (existsSync(join(d, DEPLOYMENT))) return d;
    const up = dirname(d);
    if (up === d) return resolve(cwd || '.');
    d = up;
  }
}
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
const re = (s) => { try { return new RegExp(s, 'i'); } catch { return null; } };

// The project's data → the rules: kinds [{ name, files: [RegExp], runs: [RegExp] }], hygiene, deploys, deployKind
export function rulesOf(cfg = {}) {
  const kinds = Object.entries((cfg && cfg.kinds) || {}).map(([name, k]) => ({ name,
    files: (k.files || []).map(re).filter(Boolean), runs: (k.runs || []).map(re).filter(Boolean) })).filter((k) => k.files.length);
  return { kinds, hygiene: [...HYGIENE, ...((cfg && cfg.hygiene) || []).map(re).filter(Boolean)],
    deploys: ((cfg && cfg.deploys) || []).map(re).filter(Boolean), deployKind: String((cfg && cfg.deployKind) || (kinds[0] && kinds[0].name) || 'code') };
}
// The kind of a written file (path from the root, forward slashes), or null — the project's kinds first, else the default `code`
export function kindOf(rel, rules) {
  if (!rel || rel.startsWith('..') || NOT_PROJECT.test(rel)) return null;
  for (const k of rules.kinds) if (k.files.some((r) => r.test(rel))) return k.name;
  return rules.kinds.length ? null : (CODE_EXT.test(rel) ? 'code' : null);
}
// A heredoc body is data: keep the line with «<<TAG» and everything after the closing TAG
export function withoutHeredocBodies(cmd) {
  const lines = String(cmd || '').split('\n'), out = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    const m = lines[i].match(/<<-?\s*['"]?(\w+)['"]?/);
    if (!m) continue;
    while (i + 1 < lines.length && lines[i + 1].trim() !== m[1]) i++;
    i++;
  }
  return out.join('\n');
}
// The segments of a shell command: continuation lines joined FIRST (a trailing `\` in bash, a trailing backtick in PowerShell — one
// line; light judge of session 98: `node x.mjs \` ⏎ `--help` split into a «run» and a lone «--help»), heredoc bodies dropped, slashes
// normalised, then cut at `;` · `&&` · `||` · a newline
export const segmentsOf = (command) => withoutHeredocBodies(String(command || '').replace(/[\\`][^\S\n]*\r?\n/g, ' '))
  .split('\\').join('/').split(/;|&&|\|\||\n/).filter((s) => s.trim());
// The debt keys a command clears, from the debt as it stands
export function cleared(command, debt, rules) {
  // hygiene is judged per SEGMENT of a chained command: `node --check x && node x` is a check AND a run (origin session 98, live —
  // the whole chain was read as hygiene and the real run in its second half did not count)
  const segments = segmentsOf(command).filter((s) => !rules.hygiene.some((r) => r.test(s)));
  const out = [];
  for (const [key, d] of Object.entries(debt)) {
    const k = rules.kinds.find((x) => x.name === d.kind);
    const hit = (seg) => (k && k.runs.length) ? k.runs.some((r) => r.test(seg)) : (!key.startsWith('deploy:') && runsFile(seg, key));
    if (segments.some(hit)) out.push(key);   // a deploy debt clears only by its kind's runs; a source file without runs — by running it
  }
  return out;
}
// A command RUNS the file when an interpreter stands in it and the first word after the interpreter's flags IS the file — its path from
// the root, a path ending with it, or its bare name (run from its folder). The file's name elsewhere in a command — `git add`, `cat`,
// `grep`, a commit tool's `--only`, another script with the same name in another folder — is not a run (light judge of session 98).
const RUNNER = /(?:^|[\s;&|(])(?:node|python3?|py|bash|sh|zsh|pwsh|powershell(?:\.exe)?|deno(?:\s+run)?|bun|ruby|php|tsx|ts-node|go\s+run)(?=\s)/i;
const FLAG_WITH_VALUE = /^-(?:X|W|r|-require|-import|-loader)$/;   // a flag whose next word is its value, never the script
export function runsFile(cmd, rel) {
  for (const seg of String(cmd || '').split(/;|&&|\|\||\||\n/)) {
    const m = seg.match(RUNNER);
    if (!m) continue;
    const words = (seg.slice(m.index + m[0].length).trim().match(/"[^"]*"|'[^']*'|\S+/g) || []).map((w) => w.replace(/^["']|["']$/g, ''));
    let i = 0;
    while (i < words.length && words[i].startsWith('-')) i += FLAG_WITH_VALUE.test(words[i]) ? 2 : 1;
    const w = (words[i] || '').replace(/^\.\//, '');
    if (w && (w === rel || w.endsWith('/' + rel) || w === basename(rel))) return true;
  }
  return false;
}
const listOf = (debt) => { const ks = Object.keys(debt); return ks.slice(0, LIST_MAX).join(', ') + (ks.length > LIST_MAX ? ` and ${ks.length - LIST_MAX} more` : ''); };
const signature = (debt) => { const ks = Object.keys(debt).sort(); return ks.join('|') + '@' + ks.map((k) => debt[k].at).sort().pop(); };

// The decision — (event, state, root, rules, now) → { out | null, state }; pure apart from the clock passed in
export function handle(ev, st, root, rules, now) {
  const s = { debt: { ...((st && st.debt) || {}) }, waivers: [...((st && st.waivers) || [])], lastStop: (st && st.lastStop) || '' };
  const name = String(ev.hook_event_name || ''), tool = String(ev.tool_name || '');
  if (name === 'Stop') {
    if (!Object.keys(s.debt).length) { s.lastStop = ''; return { out: null, state: s }; }
    const sig = signature(s.debt);
    // asked already for this very debt — in this turn or an earlier one — and nothing new written: pass (criterion 28 «a repeated stop
    // with nothing new written passes»; a turn that only answers the owner is not refused again by an old debt — light judge, session 98)
    if (s.lastStop === sig) return { out: null, state: s };
    s.lastStop = sig;
    return { out: { decision: 'block', reason: LINES.full(listOf(s.debt)) }, state: s };
  }
  if (name !== 'PostToolUse') return { out: null, state: s };
  const say = (text) => ({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } });
  if (WRITE_TOOLS.has(tool)) {
    const file = (ev.tool_input || {}).file_path || (ev.tool_input || {}).notebook_path;
    if (!file) return { out: null, state: s };
    const rel = relative(root, resolve(root, file)).split(sep).join('/');
    if (isAbsolute(rel)) return { out: null, state: s };
    const kind = kindOf(rel, rules);
    if (!kind) return { out: null, state: s };
    const first = !Object.keys(s.debt).length;
    s.debt[rel] = { kind, at: now };
    const n = Object.keys(s.debt).length;
    return { out: say(first ? LINES.full(listOf(s.debt)) : LINES.short(n, listOf(s.debt))), state: s };
  }
  if (SHELL_TOOLS.has(tool)) {
    const command = String((ev.tool_input || {}).command || '');
    const done = cleared(command, s.debt, rules);
    for (const k of done) delete s.debt[k];
    // a deploy is judged per segment too (`npm run build && pwsh deploy.ps1` deploys); the key names what was deployed — the matched
    // text of the command, never the pattern
    const deployed = [...new Set(segmentsOf(command).filter((seg) => !rules.hygiene.some((r) => r.test(seg)))
      .flatMap((seg) => rules.deploys.map((r) => r.exec(seg)).filter(Boolean).map((m) => 'deploy:' + m[0].trim())))];
    if (deployed.length) {
      const first = !Object.keys(s.debt).length;
      for (const k of deployed) s.debt[k] = { kind: rules.deployKind, at: now };
      return { out: say(first ? LINES.full(listOf(s.debt)) : LINES.short(Object.keys(s.debt).length, listOf(s.debt))), state: s };
    }
    if (!done.length) return { out: null, state: s };
    return { out: say(LINES.cleared(done.join(', '), Object.keys(s.debt).length ? listOf(s.debt) : '')), state: s };
  }
  return { out: null, state: s };
}

function load(root) { return readJson(join(root, STATE)) || {}; }
function save(root, s) {
  const p = join(root, STATE); mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p + '.tmp', JSON.stringify(s, null, 1) + '\n'); renameSync(p + '.tmp', p);
}
const configOf = (root) => { const m = readJson(join(root, DEPLOYMENT)) || {}; return (m.testHook && typeof m.testHook === 'object') ? m.testHook : {}; };

const argv = process.argv.slice(2);
if (argv[0] === '--selftest') {
  let bad = 0; const ok = (c, n) => { if (!c) { bad++; console.log('  x ' + n); } else console.log('  v ' + n); };
  const R = mkdtempSync(join(tmpdir(), 'kaif-test-after-code-'));
  try {
    const T = '2026-11-06T12:00:00.000Z', T2 = '2026-11-06T12:05:00.000Z';
    // every case starts from its own state (one case — one predicate: a mutant reddens its own cases, not a cascade)
    const session = (rules) => {
      let st = {};
      const step = (ev, at = T) => { const r = handle(ev, st, R, rules, at); st = r.state; return r.out; };
      return { get debt() { return st.debt || {}; },
        edit: (p, at) => step({ hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: join(R, p) } }, at),
        sh: (c) => step({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: c } }),
        stop: (active) => step({ hook_event_name: 'Stop', stop_hook_active: active }) };
    };
    const ctx = (o) => (o && o.hookSpecificOutput && o.hookSpecificOutput.additionalContext) || '';
    const D = rulesOf({});
    let s = session(D);
    ok(s.edit('README.md') === null && s.edit('package.json') === null && Object.keys(s.debt).length === 0, 'a document and a config are not test debt');
    s = session(D); const a = ctx(s.edit('src/app.mjs'));
    ok(/RUN it before you stop/.test(a) && /TESTING_FRAMEWORK\.md/.test(a) && /owner is not asked/.test(a) && s.debt['src/app.mjs'] && s.debt['src/app.mjs'].kind === 'code',
      'criterion 28: an edit of src/app.mjs → debt and the full order');
    s = session(D); s.edit('src/app.mjs');
    ok(/code not run yet — 2/.test(ctx(s.edit('src/lib/util.py'))), 'a second file → the short line with the count');
    s = session(D); s.edit('src/app.mjs');
    ok(['node --check src/app.mjs', 'npm run build', 'npx eslint src/app.mjs', 'node src/app.mjs --help'].every((c) => s.sh(c) === null) && s.debt['src/app.mjs'],
      'hygiene (--check · build · linter · --help) never clears');
    s = session(D); s.edit('src/app.mjs');
    ok(s.sh("cat >> testcases/TC_x.md <<'EOF'\nrun: node src/app.mjs\nEOF") === null && s.debt['src/app.mjs'], 'a heredoc body naming the file is data, not a run');
    s = session(D); s.edit('src/app.mjs'); s.edit('src/lib/util.py');
    const b = s.stop(false);
    ok(b && b.decision === 'block' && /src\/app\.mjs/.test(b.reason) && /src\/lib\/util\.py/.test(b.reason), 'criterion 28: the stop with debt is refused with the list of what was not run');
    s = session(D); s.edit('src/app.mjs'); s.stop(false);
    ok(s.stop(true) === null && s.debt['src/app.mjs'], 'criterion 28: a repeated stop with nothing new written passes; the debt stays');
    s = session(D); s.edit('src/app.mjs'); s.edit('src/lib/util.py');
    const c = ctx(s.sh('node src/app.mjs --in fixtures/a.json'));
    ok(/run counted for src\/app\.mjs/.test(c) && /still not run: src\/lib\/util\.py/.test(c) && !s.debt['src/app.mjs'] && s.debt['src/lib/util.py'], 'a run of the file itself clears its own debt only');
    s = session(D); s.edit('src/app.mjs'); s.edit('src/build.mjs');
    ok(['git add src/app.mjs', 'cat src/app.mjs', 'grep -n inc src/app.mjs', 'node tools/commit.mjs --only src/app.mjs', 'node tools/build.mjs'].every((c) => s.sh(c) === null)
      && s.debt['src/app.mjs'] && s.debt['src/build.mjs'], 'the file\'s name in a command that does not run it (git add · cat · grep · a commit tool · another build.mjs) is not a run');
    s = session(D); s.edit('src/app.mjs'); s.sh('cd src && node app.mjs');
    ok(!s.debt['src/app.mjs'], 'a run from the file\'s own folder (`node app.mjs`) counts');
    s = session(D); s.edit('src/app.mjs'); s.sh('node --check src/app.mjs && node src/app.mjs');
    ok(!s.debt['src/app.mjs'], 'a chain «check && run» counts its run — hygiene is judged per segment (origin session 98, live)');
    s = session(D); s.edit('src/app.mjs'); s.sh('node src/app.mjs \\\n  --help'); s.sh('node src/app.mjs `\n  --help');
    ok(s.debt['src/app.mjs'], 'a continued line (`\\` · PowerShell backtick) is ONE segment: «node src/app.mjs ⏎ --help» is --help, not a run (light judge, s98)');
    s = session(D); s.edit('src/app.mjs'); s.stop(false);
    ok(s.stop(false) === null && s.debt['src/app.mjs'], 'a later turn with the same debt is not refused again (once per debt signature); the debt stays');
    s = session(D);
    ok(s.stop(false) === null, 'no debt → the stop passes');
    s = session(D); s.edit('src/app.mjs'); s.stop(false); s.stop(true); s.edit('src/app.mjs', T2);
    ok(s.stop(true) && s.stop(true) === null, 'a NEW write after a passed stop → refused once more, then passes');
    // the project's own kinds and runs (the field shape), a deploy, the self-test that is not a run
    const P = rulesOf({ kinds: { game: { files: ['^game/.*\\.(cs|tscn)$', '(^|/)modpack\\.json$'], runs: ['tools/run-game\\.mjs', 'tools/test-(?!guards)[\\w-]+\\.mjs'] },
      engine: { files: ['^src/.*\\.cs$'], runs: ['dotnet test'] } }, deploys: ['deploy-pack\\.ps1(?!.*-DryRun)'], deployKind: 'game' });
    s = session(P); s.edit('game/Viewer.cs'); s.edit('src/Rules/Day.cs'); s.edit('game/modpack.json');
    ok(Object.values(s.debt).map((d) => d.kind).sort().join() === 'engine,game,game' && s.edit('docs/x.md') === null, 'project kinds: code and build data by the project\'s patterns; a document is not debt');
    s = session(P); s.edit('game/Viewer.cs');
    ok(s.sh('node tools/test-guards.mjs') === null && s.debt['game/Viewer.cs'], 'the project\'s guards self-test is not a game run (field: it cleared a deploy debt)');
    s = session(P); s.edit('game/Viewer.cs'); s.edit('src/Rules/Day.cs');
    s.sh('node tools/run-game.mjs --scene viewer');
    ok(!s.debt['game/Viewer.cs'] && s.debt['src/Rules/Day.cs'], 'a game run clears the game kind, not the engine');
    s = session(P);
    ok(s.sh('pwsh deploy-pack.ps1 -DryRun') === null && /RUN it/.test(ctx(s.sh('pwsh deploy-pack.ps1 -Target live'))) && s.debt['deploy:deploy-pack.ps1']
      && s.debt['deploy:deploy-pack.ps1'].kind === 'game', 'a real deploy is debt of its kind; a dry run is not');
    s = session(P); s.sh('npm run build && pwsh deploy-pack.ps1 -Target live');
    ok(s.debt['deploy:deploy-pack.ps1'], 'a deploy chained after a build is debt — a deploy is judged per segment too (light judge, s98)');
    s = session(P); s.sh('pwsh deploy-pack.ps1 -Target live'); s.sh('node tools/run-game.mjs');
    ok(Object.keys(s.debt).length === 0, 'a game run after the deploy clears it');
    ok(kindOf('.kaif/hooks/x.mjs', D) === null && kindOf('node_modules/a/b.js', D) === null, 'KAIF\'s own files and dependencies are not the product');
  } finally { rmSync(R, { recursive: true, force: true }); }
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}
if (argv[0] === '--status' || argv[0] === '--waive') {
  const root = projectRoot(process.cwd()), s = load(root), keys = Object.keys(s.debt || {});
  if (argv[0] === '--status') { console.log(keys.length ? `test debt: ${keys.length} — ${keys.map((k) => `${k} [${s.debt[k].kind}]`).join(', ')}` : 'test debt: none'); process.exit(0); }
  const why = argv.slice(1).join(' ').trim();
  if (!why) { console.log('--waive needs a reason: why this code cannot be run (no device, …)'); process.exit(1); }
  save(root, { ...s, debt: {}, waivers: [...(s.waivers || []), { at: new Date().toISOString(), files: keys, why }] });
  console.log(`waived ${keys.length} file(s): ${why}`); process.exit(0);
}
try {
  const ev = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  if (!ev.agent_id) {   // a subagent's events reach the hook under the parent's session (observed, origin session 97) — the main agent's debt only
    const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(ev.cwd);
    const r = handle(ev, load(root), root, rulesOf(configOf(root)), new Date().toISOString());
    save(root, r.state);
    if (r.out) process.stdout.write(JSON.stringify(r.out));
  }
} catch { /* a hook never breaks the session */ }
process.exit(0);
