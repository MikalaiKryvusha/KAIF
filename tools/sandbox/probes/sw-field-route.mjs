// tools/sandbox/probes/sw-field-route.mjs — a PROBE (not a polygon suite): the functional run of epic SW (2.9, plans/130 SW6, J-SW2) —
// the FIELD route of an update 2.8 → 2.9 walked the way a field agent walks it, on this machine, over a v2.8 deployment that carries the
// owner's OWN entries in .claude/settings.json. The cloud session 76 walked it once with a scratchpad script that died with the scratchpad
// (EXP-0016; report testcases/reports/2026-09-29_sw-delivered-wired.md, runs 11–12); this probe lives in the repository.
//   subjects — the fixture (always): a git project, KAIF v2.8 installed by the v2.8 core from the tag (`--agents claude-code`), the
//              owner's own .claude/settings.json (a permission and a PreToolUse hook of his; CRLF, two-space indent), committed;
//            — every <deployment> argument: a git CLONE of a real v2.8 deployment in the OS temp folder; the source is only read — its
//              HEAD, `git status` and the sha of its settings files are compared before and after; the files a clone does not carry
//              or carries older (the settings files, the deployed core and bundle, the marker, the deploy manifest) are copied from the
//              disk, so the owner's accumulated world is the stand (TESTING_FRAMEWORK: the agent's stand is not the owner's world).
//   route    — `update --source <this build labelled 2.9> --baseline <v2.8>` run by the DEPLOYED 2.8 core (the default field route;
//              EXP-0157: the task is written by the outgoing core) → the task → `check` and `checkpoint recheck` BEFORE wiring (the
//              fresh core must name the delivered hooks that are not wired) → `wire-hooks` → a repeat `wire-hooks` → every wired KAIF
//              command fired as Claude Code fires it (`node` + args with ${CLAUDE_PROJECT_DIR} substituted, the event on stdin, from a
//              SUBFOLDER) → `checkpoint recheck` → `check` → the contour's write paths → `git status` and `git check-ignore`.
//   Predictions, written before the first run (2026-10-14, session 79): every line below is OK except, probably, «recheck before
//   wiring names the unwired hooks» — `checkpoint recheck` prints only check's STDOUT and `check` names unwired hooks on STDERR.
// The voice is silenced by the environment (empty KAIF_VOICE_TOOL — EXP-0132); no command here raises a page. Git identity — by the
// environment only (bugs/124). Run it alone (≈ 1 min per subject).
// usage: node tools/sandbox/probes/sw-field-route.mjs [<v2.8 deployment>…]
// [TESTED: 2026-10-14 11:26:30 · the fixture and git clones of five live v2.8 deployments of the origin machine (Windows 11): 165 OK on
//  this build; against the build before the fix (KAIF_DIST = dist of 41c6c7d) exactly the 8 BAD predicted before the run — «recheck before
//  wiring names …» ×6 and «a pure addition» on the two files in the shipped sample's style; report testcases/reports/2026-10-14_sw-field-route.md]
// [TESTED: 2026-10-16 11:40:52 → 11:41:43 · session 82, UT1: the fixture and git clones of six live v2.8 deployments — 190 OK; the fresh
//  core's `recheck` names 0 · 13 · 1 · 2 · 0 · 0 · 11 places that still build on a retired feature or a moved section, none in a record;
//  report testcases/reports/2026-10-16_ut1-withdrawn-places.md]
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, copyFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// KAIF_DIST — the seam of the suites: the build that plays «this build» (the red proof runs the probe against a build before the fix)
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const TAG = 'v2.8';
const TO = '2.9';
const RUN_TIMEOUT_MS = 600000;
const HOOK_TIMEOUT_MS = 20000;
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-sw-field-'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const info = (line) => console.log('    ' + line);
const git = (cwd, ...a) => { const r = spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8', maxBuffer: 1 << 26 }); return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() }; };
const core = (cwd, args) => {
  const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '', all: (r.stdout || '') + (r.stderr || '') };
};
const show = (p) => execFileSync('git', ['show', TAG + ':' + p], { cwd: REPO, maxBuffer: 1 << 27 });
const read = (p) => { try { return readFileSync(p); } catch { return null; } };
const statusLines = (P) => git(P, 'status', '--porcelain', '--untracked-files=all').out.split(/\r?\n/).filter(Boolean);
const tail = (s, n = 6) => s.split(/\r?\n/).filter(Boolean).slice(-n).join(' | ').slice(0, 600);

// ---- the release artifacts: v2.8 from the tag (the baseline) and this build labelled 2.9 (the source of the update)
const DIST_FILES = ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'KAIF-FULL.md', 'KAIF.md', 'kaif-manifest.json', 'kaif-module-map.json'];
const OLD = join(ROOT, 'v2.8'); mkdirSync(OLD);
for (const f of DIST_FILES) writeFileSync(join(OLD, f), show('dist/' + f));
const SRC = join(ROOT, 'src-' + TO); mkdirSync(SRC);
const META_RE = /(^> \*\*FILE: `kaif-bundle-manifest\.json`\*\*[^\n]*\n\n`{6}\w*\n)([\s\S]*?)(\n`{6})/m;
const bundleNow = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
const metaMatch = bundleNow.match(META_RE);
if (!metaMatch) { console.log('✖ the bundle meta block is not found in dist/KAIF-CORE-BUNDLE.md — rebuild first'); process.exit(2); }
const meta = JSON.parse(metaMatch[2]); meta.version = TO;
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundleNow.replace(META_RE, (_, a, __, c) => a + JSON.stringify(meta, null, 2) + c));
copyFileSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = TO;
for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = sha(readFileSync(join(SRC, f)));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
const FRESH_CORE_SHA = sha(readFileSync(join(SRC, 'KAIF-CORE.mjs')));
const TAG_CORE_SHA = sha(readFileSync(join(OLD, 'KAIF-CORE.mjs')));
const FRAGMENT = JSON.parse(readFileSync(join(REPO, 'framework', 'hooks', 'settings-fragment.json'), 'utf8')).hooks;
const scriptOf = (h) => { const m = /([\w.-]+\.mjs)/.exec([h && h.command, ...(h && Array.isArray(h.args) ? h.args : [])].join(' ')); return m ? m[1] : null; };
const KAIF_SCRIPTS = Object.entries(FRAGMENT).flatMap(([ev, gs]) => gs.flatMap((g) => g.hooks.map((h) => `${ev} → ${scriptOf(h)}`)));
// 2.9, epic WH (origin ticket #144): the hooks KAIF retired — the route must REMOVE their wiring; written here, not read from the core
const RETIRED = ['pretool-owner-word.mjs', 'stop-owner-answer.mjs'];
const retiredOf = (o) => Object.entries((o && o.hooks) || {}).flatMap(([ev, gs]) => (gs || []).flatMap((g) => (g.hooks || []).filter((h) => RETIRED.includes(scriptOf(h))).map((h) => `${ev} → ${scriptOf(h)}`)));
function withoutRetired(o) {
  const n = JSON.parse(JSON.stringify(o));
  for (const ev of Object.keys(n.hooks || {})) {
    const gs = n.hooks[ev] || [];
    const kept = gs.flatMap((g) => { if (!(g.hooks || []).some((h) => RETIRED.includes(scriptOf(h)))) return [g]; const hs = g.hooks.filter((h) => !RETIRED.includes(scriptOf(h))); return hs.length ? [{ ...g, hooks: hs }] : []; });
    if (kept.length) n.hooks[ev] = kept; else if (gs.length) delete n.hooks[ev];
  }
  return n;
}
// a line of a retired entry: its script name or the bare JSON skeleton of a hook entry
const RETIRED_LINE_RE = new RegExp(`(${RETIRED.map((r) => r.replace(/[.]/g, '[.]')).join('|')})|^\\s*(\\{|\\}|\\[|\\]|"hooks": \\[|"(PreToolUse|Stop)": \\[|"type": "command"|"command": "node"|"timeout": \\d+|"args": \\[)\\s*$`);

// ---- subject 1: the fixture project — v2.8 installed by its own core, the owner's own settings, committed
function fixture() {
  const P = join(ROOT, 'fixture'); mkdirSync(P);
  git(P, 'init', '-q');
  writeFileSync(join(P, 'README.md'), '# An owner project\n');
  mkdirSync(join(P, 'src')); writeFileSync(join(P, 'src', 'app.js'), 'console.log("app");\n');
  mkdirSync(join(P, 'scripts')); writeFileSync(join(P, 'scripts', 'owner-guard.mjs'), 'process.exit(0);\n');
  mkdirSync(join(P, '.claude'));
  const own = { permissions: { allow: ['Bash(npm test:*)'] }, hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node scripts/owner-guard.mjs' }] }] } };
  writeFileSync(join(P, '.claude', 'settings.json'), JSON.stringify(own, null, 2).replace(/\n/g, '\r\n') + '\r\n');
  mkdirSync(join(P, '.kaif', 'install'), { recursive: true });
  copyFileSync(join(OLD, 'KAIF-CORE-BUNDLE.md'), join(P, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copyFileSync(join(OLD, 'KAIF-CORE.mjs'), join(P, '.kaif', 'kaif-core.mjs'));
  const r = core(P, ['install', '--agents', 'claude-code']);
  say(r.code === 0, `fixture: KAIF ${TAG} installed by the ${TAG} core — exit ${r.code}`);
  if (r.code !== 0) info(tail(r.all));
  git(P, 'add', '-A');
  const c = git(P, 'commit', '-qm', 'an owner project on KAIF 2.8');
  say(c.code === 0, `fixture: the owner commits the deployment — exit ${c.code}`);
  return { P, label: 'fixture', sub: join(P, 'src') };
}

// ---- subject 2..n: a git clone of a real deployment; the source is only read
const CARRY = ['.claude/settings.json', '.claude/settings.local.json', '.kaif/kaif-core.mjs', '.kaif/install/KAIF-CORE-BUNDLE.md', '.kaif/kaif.json', '.kaif/deploy-manifest.json', '.kaif/last-update.json'];
const sourceState = (dep) => ({ head: git(dep, 'rev-parse', 'HEAD').out, status: git(dep, 'status', '--porcelain').out,
  files: CARRY.map((f) => { const b = read(join(dep, f)); return f + ':' + (b ? sha(b) : '-'); }).join(' ') });
function cloneOf(dep, k) {
  const P = join(ROOT, 'field-' + k);
  const c = git(ROOT, 'clone', '-q', '--no-hardlinks', dep, P);
  say(c.code === 0, `field #${k}: git clone into the OS temp folder — exit ${c.code}`);
  const carried = [];
  for (const f of CARRY) {
    const b = read(join(dep, f));
    if (!b) continue;
    const have = read(join(P, f));
    if (have && sha(have) === sha(b)) continue;
    mkdirSync(dirname(join(P, f)), { recursive: true }); writeFileSync(join(P, f), b); carried.push(f + (have ? ' (newer on disk)' : ' (not in git)'));
  }
  info(`carried from the disk: ${carried.length ? carried.join(' · ') : 'nothing — the clone holds it all'}`);
  const coreSha = sha(readFileSync(join(P, '.kaif', 'kaif-core.mjs')));
  info(`deployed core: ${coreSha === TAG_CORE_SHA ? 'the ' + TAG + ' release core' : 'NOT the ' + TAG + ' release core (sha ' + coreSha.slice(0, 12) + ') — the core this deployment runs is used'}`);
  const sub = readdirSync(P).map((d) => join(P, d)).find((d) => statSync(d).isDirectory() && !/[\\/]\.(git|kaif)$/.test(d)) || join(P, '.kaif');
  return { P, label: 'field #' + k, sub };
}

// ---- the route
function walk({ P, label, sub }) {
  console.log(`\n=== ${label}: update ${TAG} → ${TO} by the deployed core, then the task, wiring, recheck, check, git ===`);
  const settingsPath = join(P, '.claude', 'settings.json');
  const set0 = read(settingsPath);
  const gi0 = (read(join(P, '.gitignore')) || '').toString();
  const marker0 = JSON.parse(readFileSync(join(P, '.kaif', 'kaif.json'), 'utf8'));
  const st0 = new Set(statusLines(P));
  info(`before: marker ${marker0.version} · agents ${(marker0.agents || []).join(',')} · settings.json ${set0 ? set0.length + ' bytes' : 'absent'} · git status lines ${st0.size}`);

  const u = core(P, ['update', '--source', SRC, '--baseline', OLD]);
  say(u.code === 0, `${label}: \`update\` run by the deployed core — exit ${u.code}`);
  if (u.code !== 0) { info(tail(u.all, 12)); return; }
  const nowCore = sha(readFileSync(join(P, '.kaif', 'kaif-core.mjs')));
  say(nowCore === FRESH_CORE_SHA, `${label}: the update swapped in the fresh core (.kaif/kaif-core.mjs = this build's core)`);
  const marker1 = JSON.parse(readFileSync(join(P, '.kaif', 'kaif.json'), 'utf8'));
  say(marker1.version === TO, `${label}: the marker reads ${marker1.version}`);

  const task = (read(join(P, 'KAIF_UPDATE_TASK.md')) || '').toString();
  const policyHook = /delivered refresh hooks are WIRED/.test(task) && /kaif-core\.mjs wire-hooks/.test(task);
  say(policyHook, `${label}: the task written by the outgoing core carries the 2.9 rule line «the delivered refresh hooks are WIRED — run wire-hooks»`);
  info(`the task's own item «wire-hooks»: ${/- \*\*wire-hooks\*\*/.test(task) ? 'present' : 'absent (the outgoing core has no such item — the rule line is the hand-over)'}`);
  const askLine = task.split(/\r?\n/).find((l) => /delivered refresh hooks are WIRED/.test(l)) || '';
  info(`the rule line in the task: ${askLine.slice(0, 160)}…`);

  const c0 = core(P, ['check']);
  // 2.9 WH: the wiring WORK is named — a delivered hook not wired, or a retired one still wired (a live 2.8 tree has all four wired)
  const WORK_RE = /delivered hook\(s\) not wired|hook\(s\) KAIF retired in 2\.9/;
  const names0 = WORK_RE.test(c0.all);
  say(names0, `${label}: \`check\` (fresh core) before wiring names the wiring work (not wired · retired still wired) — exit ${c0.code}`);
  const r0 = core(P, ['checkpoint', 'recheck']);
  say(WORK_RE.test(r0.all), `${label}: \`checkpoint recheck\` before wiring names the wiring work (not wired · retired still wired) — exit ${r0.code}`);
  if (!WORK_RE.test(r0.all)) info('recheck said: ' + tail(r0.all, 4));
  // UT1 (2.9, criterion 16; session 82): the fresh core names the places of the project's own texts that still build on a feature
  // retired in the interval — the hooks of #144 for every 2.8 deployment. Prediction, written before the run: untouched guide modules
  // were replaced mechanically and are not places; places stand where the owner or a translation kept the old text (a Russian guide,
  // an EXPERIENCE «mechanized:» line), never in the chronicle.
  const wp = /withdrawn phrases \([^)]*\) — places left now:(?: The machinery found (\d+) place\(s\)[^\n]*\n((?:\s+· [^\n]*\n?)*)| none| The machinery scanned)/.exec(r0.all);
  say(!!wp && !/PROJECT_HISTORY\.md:|reports\/KAIF_UPDATES\//.test(wp[2] || ''), `${label}: \`checkpoint recheck\` names the places that still build on a retired feature — ${wp ? (wp[1] || 0) + ' place(s)' : 'no withdrawn-phrases line'}`);
  for (const l of (wp && wp[2] ? wp[2].split('\n').filter(Boolean).slice(0, 12) : [])) info(l.trim().slice(0, 200));

  const w1 = core(P, ['wire-hooks']);
  say(w1.code === 0, `${label}: \`wire-hooks\` — exit ${w1.code}`);
  info(tail(w1.all, 4));
  const set1 = read(settingsPath);
  let s1 = null; try { s1 = JSON.parse(set1.toString().replace(/^\uFEFF/, '')); } catch { s1 = null; }
  say(!!s1, `${label}: .claude/settings.json parses after wiring`);
  if (!s1) return;
  const wired = new Set(Object.entries(s1.hooks || {}).flatMap(([ev, gs]) => (gs || []).flatMap((g) => (g.hooks || []).map((h) => `${ev} → ${scriptOf(h)}`))));
  let local = {}; try { local = JSON.parse((read(join(P, '.claude', 'settings.local.json')) || '{}').toString().replace(/^\uFEFF/, '')); } catch { local = {}; }
  const wiredLocal = new Set(Object.entries(local.hooks || {}).flatMap(([ev, gs]) => (gs || []).flatMap((g) => (g.hooks || []).map((h) => `${ev} → ${scriptOf(h)}`))));
  const missing = KAIF_SCRIPTS.filter((k) => !wired.has(k) && !wiredLocal.has(k));
  say(missing.length === 0, `${label}: all ${KAIF_SCRIPTS.length} KAIF hooks of the fragment are wired (settings.json or settings.local.json)${missing.length ? ' — missing: ' + missing.join(' · ') : ''}`);
  const left = retiredOf(s1);
  say(left.length === 0, `${label}: no entry of a retired hook is left in settings.json (2.9 WH)${left.length ? ' — left: ' + left.join(' · ') : ''}`);
  const gone = RETIRED.filter((f) => existsSync(join(P, '.kaif', 'hooks', f)));
  if (gone.length) info(`a retired hook script is still on disk: ${gone.join(' · ')} — kept by the update only when it carries the owner's edits (the task names it)`);
  if (set0) {
    let s0 = null; try { s0 = JSON.parse(set0.toString().replace(/^\uFEFF/, '')); } catch { s0 = null; }
    if (s0) {
      const otherKeys = Object.keys(s0).filter((k) => k !== 'hooks');
      say(otherKeys.every((k) => JSON.stringify(s0[k]) === JSON.stringify(s1[k])), `${label}: the owner's other keys are unchanged (${otherKeys.join(', ') || 'none'})`);
      const retired0 = retiredOf(s0), base0 = withoutRetired(s0);
      if (retired0.length) info(`retired hooks wired before: ${retired0.join(' · ')} — wire-hooks must remove them`);
      const ownFirst = Object.entries(base0.hooks || {}).every(([ev, gs]) => JSON.stringify((s1.hooks[ev] || []).slice(0, gs.length)) === JSON.stringify(gs));
      say(ownFirst, `${label}: the owner's own hook groups stay, first in their events (${Object.keys(s0.hooks || {}).join(', ') || 'none of his own'})`);
      const crlf0 = /\r\n/.test(set0.toString()), crlf1 = /\r\n/.test(set1.toString()), lf1 = /(^|[^\r])\n/.test(set1.toString());
      say(crlf0 ? crlf1 && !lf1 : !crlf1, `${label}: the line ends are kept (${crlf0 ? 'CRLF' : 'LF'})`);
      const indent = (b) => ((b.toString().split(/\r?\n/)[1] || '').match(/^\s*/) || [''])[0];
      say(indent(set0) === indent(set1), `${label}: the indent is kept («${indent(set0).replace(/\t/g, '\\t')}»)`);
      say(set0[0] === 0xef ? set1[0] === 0xef : set1[0] !== 0xef, `${label}: the byte-order mark is kept as it was (${set0[0] === 0xef ? 'BOM' : 'no BOM'})`);
      // the owner's diff: wiring is a PURE ADDITION — every line of his file stays, in order (a comma before an added entry is not an edit);
      // the first run found two of five field files rewritten whole (their one-line arrays — the shipped sample's style — unfolded)
      const lines = (t) => t.toString().replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/,\s*$/, ''));
      const a = lines(set0), b = lines(set1);
      // 2.9 WH: the lines of a retired entry may go — every OTHER line of his file stays, in order
      // the lines of his file the result keeps — a longest common subsequence (a greedy walk misaligns on a skeleton line: run 1, #2)
      const dp = Array.from({ length: a.length + 1 }, () => new Int32Array(b.length + 1));
      for (let x = a.length - 1; x >= 0; x--) for (let y = b.length - 1; y >= 0; y--) dp[x][y] = a[x] === b[y] ? dp[x + 1][y + 1] + 1 : Math.max(dp[x + 1][y], dp[x][y + 1]);
      const lost = []; let j = 0;
      for (let x = 0, y = 0; x < a.length;) { if (y < b.length && a[x] === b[y]) { x++; y++; j++; } else if (y < b.length && dp[x][y + 1] >= dp[x + 1][y]) y++; else { lost.push(a[x]); x++; } }
      j += lost.length;   // every line of his file is accounted for: kept or lost
      const lostOwn = lost.filter((l) => !RETIRED_LINE_RE.test(l));
      say(j === a.length && lostOwn.length === 0 && (retired0.length === 0) === (lost.length === 0),
        `${label}: wiring adds the delivered hooks and removes ONLY the retired entries — his other ${a.length - lost.length} lines stay, in order${retired0.length ? ` (${lost.length} line(s) of ${retired0.length} retired entr${retired0.length === 1 ? 'y' : 'ies'} removed)` : ''}${lostOwn.length ? ' — the first own line lost: ' + JSON.stringify(lostOwn[0]).slice(0, 120) : ''}`);
    }
  } else info('no settings.json before — wire-hooks created it');
  const w2 = core(P, ['wire-hooks']);
  const set2 = read(settingsPath);
  say(w2.code === 0 && set2 && sha(set2) === sha(set1), `${label}: a repeat \`wire-hooks\` changes nothing — exit ${w2.code}, the file byte for byte the same`);

  // fire every wired KAIF command as Claude Code fires it: `node` + args, ${CLAUDE_PROJECT_DIR} substituted, the event on stdin, from a subfolder
  const transcript = join(ROOT, 'empty-transcript.jsonl'); writeFileSync(transcript, '');
  const events = { SessionStart: { source: 'compact' }, UserPromptSubmit: { prompt: 'resume\nprobe task' }, PreToolUse: { tool_name: 'Read', tool_input: { file_path: 'README.md' } }, Stop: { stop_hook_active: false, last_assistant_message: 'probe' } };
  // a hook script that carries the OWNER's local edits is kept by the update and named by the task's merge-diverged item: until the agent
  // merges it, its words are the owner's — such a hook is judged by its exit and the absence of a crash only (found on a field clone)
  const keptLine = task.split(/\r?\n/).find((l) => /^- \*\*merge-diverged\*\*/.test(l)) || '';
  for (const [ev, gs] of Object.entries(s1.hooks || {})) for (const g of gs || []) for (const h of g.hooks || []) {
    const args = (h.args || []).map((a) => a.replace(/\$\{CLAUDE_PROJECT_DIR\}/g, P));
    if (!args.some((a) => /[\\/]\.kaif[\\/]hooks[\\/]/.test(a))) continue;
    const kept = keptLine.includes('.kaif/hooks/' + basename(args[args.length - 1]));
    const ev0 = { session_id: 'probe', transcript_path: transcript, cwd: sub, hook_event_name: ev, ...(events[ev] || {}) };
    const r = spawnSync(h.command, args, { cwd: sub, env: { ...ENV, CLAUDE_PROJECT_DIR: P }, input: JSON.stringify(ev0), encoding: 'utf8', timeout: HOOK_TIMEOUT_MS });
    const out = (r.stdout || '') + (r.stderr || '');
    // a hook answers with JSON: its text (a Windows path among it) is read DECODED — the raw stdout doubles every backslash
    let said = out; try { const j = JSON.parse(r.stdout); said = [j.reason, j.systemMessage, j.hookSpecificOutput && j.hookSpecificOutput.additionalContext].filter(Boolean).join(' '); } catch { /* plain text */ }
    const crashed = /\n\s+at \S+ \(|Error: Cannot find module|SyntaxError/.test(out);
    let extra = '';
    if (/prompt-resume-word/.test(args.join(' '))) extra = /\/resume/.test(said) ? ' · the order names /resume' : ' · NO order on «resume»';
    if (/prompt-refresh-timer/.test(args.join(' '))) extra = said.includes(join(P, '.kaif', 'refresh-marker.json')) ? ' · names the marker under the project root' : ' · does NOT name the marker under the project root';
    if (kept) extra = ' · kept with the owner\'s local edits, the task\'s merge-diverged item names it — its words are the owner\'s until the merge';
    say(r.status === 0 && !crashed && !/NO order|does NOT/.test(extra), `${label}: fired ${ev} → ${basename(args[args.length - 1])} from a subfolder — exit ${r.status}${extra}`);
    if (r.status !== 0 || crashed) info(tail(out, 4));
  }

  const r1 = core(P, ['checkpoint', 'recheck']);
  say(r1.code === 0 && /check ran green/.test(r1.all), `${label}: \`checkpoint recheck\` after wiring — exit ${r1.code}`);
  if (r1.code !== 0) info(tail(r1.all, 8));
  const c1 = core(P, ['check']);
  say(c1.code === 0 && !/not wired/.test(c1.all), `${label}: \`check\` after wiring — exit ${c1.code}, no unwired hook named`);
  if (c1.code !== 0) info(tail(c1.all, 8));

  // the contour's write paths (its render, its call phrase, its window lock) and the deployed paths against git
  const dd = (marker1.contour && marker1.contour.decisionsDir) || 'interviews/decisions';
  const service = ['.kaif/.contour-tmp/page.html', '.kaif/.contour-tmp/call-phrase.txt', dd.replace(/\/$/, '') + '/interview_probe.lock'];
  for (const f of service) { mkdirSync(dirname(join(P, f)), { recursive: true }); writeFileSync(join(P, f), 'probe'); }
  const st1 = statusLines(P);
  const leaked = st1.filter((l) => service.some((f) => l.endsWith(f)) || /KAIF_UPDATE_TASK\.md$|(^|\s|\/)KAIF\.md$|KAIF-LOADER\.mjs$/.test(l));
  say(leaked.length === 0, `${label}: git status shows none of the contour's files, the task, KAIF.md or the loader${leaked.length ? ' — ' + leaked.join(' · ') : ''}`);
  let deployed = [];
  try { deployed = Object.keys(JSON.parse(readFileSync(join(P, '.kaif', 'deploy-manifest.json'), 'utf8')).shas || {}); } catch { deployed = []; }
  const ci = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], { cwd: P, env: ENV, input: deployed.join('\n') + '\n', encoding: 'utf8' });
  const ignored = (ci.stdout || '').split(/\r?\n/).filter(Boolean);
  // a deployed path hidden by KAIF's OWN line is a defect (`check` says ✖); one hidden by the owner's own rule is his choice, and `check`
  // names it with its remedy (⚠ … add `!<path>`) — seen on a field clone: the owner's own `AGENTS.md` line
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const byKaif = ignored.filter((p) => new RegExp("deployed artifact is git-ignored by KAIF's own line[^\\n]*: " + esc(p) + '( |$)', 'm').test(c1.all));
  const unnamed = ignored.filter((p) => !new RegExp('⚠ deployed artifact is git-ignored by [^\\n]*: ' + esc(p) + ' — [^\\n]*add `!' + esc(p) + '`').test(c1.all));
  say(deployed.length > 0 && byKaif.length === 0 && unnamed.length === 0, `${label}: no deployed path (of ${deployed.length}) is hidden by KAIF's own .gitignore line; ${ignored.length ? ignored.length + ' hidden by the owner\'s own rule, each named by `check` with its remedy: ' + ignored.slice(0, 6).join(' · ') : 'none hidden at all'}${byKaif.length ? ' — by KAIF: ' + byKaif.join(' · ') : ''}${unnamed.length ? ' — NOT named: ' + unnamed.join(' · ') : ''}`);
  const gi1 = (read(join(P, '.gitignore')) || '').toString();
  const lost = gi0.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !gi1.split(/\r?\n/).some((m) => m.trim() === l || m.trim() === '/' + l.replace(/^\//, '')));
  say(lost.length === 0, `${label}: every .gitignore line of the owner is kept (anchored or as it was)${lost.length ? ' — lost: ' + lost.join(' · ') : ''}`);
  const fresh = st1.filter((l) => !st0.has(l));
  info(`git status after the route: ${st1.length} lines, ${fresh.length} new — ${fresh.filter((l) => l.startsWith('??')).length} untracked, ${fresh.filter((l) => !l.startsWith('??')).length} modified`);
  info(`ignore-first lines now: ${gi1.split(/\r?\n/).filter((l) => /KAIF|\.kaif\/\.contour-tmp|\.lock/.test(l)).join(' · ')}`);
}

// ---- run
const subjects = [fixture()];
const deps = process.argv.slice(2).map((d) => resolve(d));
const before = deps.map(sourceState);
deps.forEach((d, i) => subjects.push(cloneOf(d, i + 1)));
for (const s of subjects) { try { walk(s); } catch (e) { say(false, `${s.label}: the probe itself failed — ${e.message}`); } }
deps.forEach((d, i) => { const now = sourceState(d); say(JSON.stringify(now) === JSON.stringify(before[i]), `field #${i + 1}: the source deployment is untouched (HEAD, git status, settings and KAIF files by sha)`); });
if (!bad) rmSync(ROOT, { recursive: true, force: true }); else console.log(`\n(the run folder is kept for forensics: ${ROOT})`);
console.log(bad ? `\n✖ ${bad} BAD` : `\n✅ the field route 2.8 → 2.9 holds on every subject: the hooks wired over the owner's own, fired, recheck and check green, git clean of KAIF's service files`);
process.exit(bad ? 1 : 0);
