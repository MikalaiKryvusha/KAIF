#!/usr/bin/env node
// KAIF-CORE.mjs — the heavy KAIF installer machinery (KAIF 1.5 "Thin KAIF").
// Downloaded by KAIF-LOADER.mjs from the origin repo; does EVERYTHING mechanizable
// about deploying KAIF so the AI agent's cognitive work shrinks to one short final
// adaptation task. Successor of kaif-unpack.mjs (which stays embedded in the
// offline KAIF-FULL.md); this file lives on at .kaif/kaif-core.mjs after install
// and backs the kaif:* npm handles (version/check).
//
// Commands:
//   node kaif-core.mjs install --bundle <KAIF-CORE-BUNDLE.md> [options]
//   node kaif-core.mjs check                       # validate the deployed manifest (bundle must still exist)
//   node kaif-core.mjs verify-final                # checkpoints done? then self-clean the install artifacts
//   node kaif-core.mjs version                     # report the deployed version from .kaif/kaif.json
//
// Install options:
//   --lang <code>       owner's working language (default: en). Owner-facing docs come from the
//                       bundle's language templates when present; otherwise English + a translation
//                       item in the adaptation task.
//   --mode <m>          standard (default) | anonymous — anonymous skips origin-tied skills and
//                       writes no origin field (anonymity by design; no prose scrubbing needed).
//   --agents <list>     comma list to narrow the target systems (default: all five:
//                       claude-code,codex,grok-build,cline,zoo-code). AGENTS.md is always written.
//   --force             overwrite existing non-empty files.
//
// Exit code 0 = the step is 100% satisfied; non-zero = incomplete (fix and re-run).
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';

// ---------------------------------------------------------------------------- CLI
const args = process.argv.slice(2);
const CMD = args[0] && !args[0].startsWith('--') ? args[0] : 'install';
const val = (f) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : null; };
const has = (f) => args.includes(f);

const BUNDLE = val('--bundle') || '.kaif/install/KAIF-CORE-BUNDLE.md';
const LANG = (val('--lang') || 'en').toLowerCase();
const MODE = (val('--mode') || 'standard').toLowerCase();
const ANON = MODE === 'anonymous';
const FORCE = has('--force');
const ALL_AGENTS = ['claude-code', 'codex', 'grok-build', 'cline', 'zoo-code'];
const AGENTS = (val('--agents') || ALL_AGENTS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);

const ORIGIN = 'https://github.com/MikalaiKryvusha/KAIF';
// Skills skipped on anonymous installs. kaif-version included since 1.5: its template
// references the origin repo, and anonymity is BY DESIGN now — the version stays readable
// in .kaif/kaif.json directly.
const ORIGIN_TIED = ['kaif-update', 'kaif-switch-origin', 'kaif-fork', 'kaif-version'];
// Author identity tokens: anonymous installs strip marked regions, de-expand the brand
// acronym, and verify-final greps the deployed tree for these before declaring success.
const AUTHOR_TOKENS = ['Kryvusha', 'KRINIK', 'Krinik', 'MikalaiKryvusha', 'Кривуша', 'Криник'];
const ACRONYM_EXPANSIONS = ['KAIF (Krinik AI Framework)', 'Krinik AI Framework (KAIF)', 'Krinik AI Framework'];
const KAIF_JSON = '.kaif/kaif.json';
const DEPLOY_MANIFEST = '.kaif/deploy-manifest.json'; // persisted path list — `check` works after the bundle is cleaned
const TASK_FILE = 'KAIF_ADAPTATION_TASK.md';
const FENCE = '`'.repeat(6);

// The 8 canonical deploy-time placeholders (KAIF.md §11). CORE fills what it can
// detect mechanically; the rest lands in the adaptation task for the agent.
const PLACEHOLDERS = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>',
                      '<LICENSE>', '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
                      '<OWNER_LANGUAGE>'];

const log = (s) => console.log(s);
const die = (s) => { console.error('✖ ' + s); process.exit(1); };
const okOnDisk = (p) => existsSync(p) && statSync(p).size > 0;
const sh = (cmd) => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
// JSON reader tolerant of a UTF-8 BOM (Windows tools like PowerShell 5 write one).
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));

// ---------------------------------------------------------------------------- bundle parsing
// The bundle uses the proven KAIF.md block format: `> **FILE: \`path\`** …` + 6-backtick fence.
// One special block, FILE: `kaif-bundle-manifest.json`, carries per-file metadata
// (audience/adaptation notes) and the version stamp — it is data, never written to disk.
function parseBundle(src) {
  if (!existsSync(src)) die(`bundle not found: ${src} (pass --bundle <path>)`);
  const text = readFileSync(src, 'utf8');
  const re = new RegExp('^> \\*\\*FILE: `([^`]+)`\\*\\*[^\\n]*\\r?\\n\\r?\\n' + FENCE + '\\w*\\r?\\n([\\s\\S]*?)\\r?\\n' + FENCE + '\\s*$', 'gm');
  const files = [];
  for (let m; (m = re.exec(text)); ) files.push({ path: m[1], content: m[2].replace(/\r\n/g, '\n') + '\n' });
  if (!files.length) die('no FILE: blocks found — is this a KAIF-CORE-BUNDLE.md?');
  const metaBlock = files.find((f) => f.path === 'kaif-bundle-manifest.json');
  if (!metaBlock) die('bundle manifest block (kaif-bundle-manifest.json) missing');
  const meta = JSON.parse(metaBlock.content);
  return { files: files.filter((f) => f.path !== 'kaif-bundle-manifest.json'), meta };
}

const skillName = (p) => (p.match(/^\.claude\/skills\/([^/]+)\/SKILL\.md$/) || [])[1] || null;
const isSkippedAnon = (p) => ANON && ORIGIN_TIED.includes(skillName(p) || '');

// Language templates live in the bundle under templates/languages/<lang>/<dest-path>.
// For the chosen language they OVERRIDE the English default at <dest-path> (owner-facing
// docs: GOAL.md, KAIF_FRAMEWORK.md, the directory READMEs). A special member,
// templates/languages/<lang>/skill-triggers.json, maps skill → localized trigger aliases:
// the machinery appends them to each skill's `description:` line so the agent keeps
// matching commands in the owner's language while the skills stay English.
function applyLanguage(files) {
  // Case-insensitive prefix match: --lang is normalized to lowercase, but pack
  // directories may carry canonical casing (zh-Hans). Verified by the zh sandbox.
  const prefix = `templates/languages/${LANG}/`.toLowerCase();
  const overrides = new Map();
  let triggers = null;
  for (const f of files) {
    const lower = f.path.toLowerCase();
    if (!lower.startsWith(prefix)) continue;
    if (lower === prefix + 'skill-triggers.json') { try { triggers = JSON.parse(f.content); } catch { die(`bad JSON in ${f.path}`); } }
    else overrides.set(f.path.slice(prefix.length), f.content);
  }
  const out = [];
  for (const f of files) {
    if (f.path.startsWith('templates/languages/')) continue;          // templates are inputs, not outputs
    let entry = overrides.has(f.path) ? { path: f.path, content: overrides.get(f.path) } : { ...f };
    const skill = skillName(entry.path);
    if (skill && triggers && triggers[skill])
      entry.content = entry.content.replace(/^(description:[^\n]*?)(\s*)$/m,
        (_, d) => `${d.replace(/\s+$/, '')} Trigger aliases (${LANG}): ${triggers[skill]}`);
    out.push(entry);
  }
  return { deploy: out, translated: overrides.size, aliased: triggers ? Object.keys(triggers).length : 0 };
}

// ---------------------------------------------------------------------------- placeholder autofill
// Detect real project values mechanically. Undetected placeholders stay literal and
// are listed in the adaptation task (they are the agent's cognitive work, not ours).
function detectValues() {
  let pkg = null;
  try { pkg = readJson('package.json'); } catch { /* none */ }
  const dir = process.cwd().replace(/\\/g, '/').split('/').filter(Boolean).pop() || 'project';
  const name = (pkg && pkg.name) || dir;
  const licenseFile = existsSync('LICENSE') ? readFileSync('LICENSE', 'utf8').split(/\r?\n/, 1)[0].trim() : '';
  return {
    '<PROJECT_NAME>': name,
    '<SHORT_NAME>': name,
    '<AUTHOR>': sh('git config user.name') || null,
    '<REPO_URL>': sh('git remote get-url origin') || null,
    '<LOCAL_PATH>': process.cwd(),
    '<LICENSE>': (pkg && pkg.license) || licenseFile || null,
    '<BUILD_COMMAND>': pkg && pkg.scripts && pkg.scripts.build ? 'npm run build' : null,
    '<TEST_HARNESS>': pkg && pkg.scripts && pkg.scripts.test ? 'npm test' : null,
    '<COMMIT_COMMAND>': 'git add -A && git commit -m "<msg>" && git push',
    '<YOUR AGENT/MODEL>': null, // depends on the running agent — always the agent's to fill
    '<OWNER_LANGUAGE>': LANG,   // the language-policy note in AGENT_GUIDE (idea 12: two audiences, two languages)
  };
}

function fillPlaceholders(content, values, unresolved) {
  let out = content;
  for (const [ph, v] of Object.entries(values)) {
    if (!out.includes(ph)) continue;
    if (v) out = out.split(ph).join(v);
    else unresolved.add(ph);
  }
  return out;
}

// Anonymous install: strip marked author regions and de-expand the brand acronym —
// mechanically, so no cognitive "scrubbing" pass is needed (anonymity by design).
function anonymize(content) {
  let out = content.replace(/<!-- KAIF:AUTHOR-NOTE:BEGIN[\s\S]*?KAIF:AUTHOR-NOTE:END -->\n?/g, '');
  for (const exp of ACRONYM_EXPANSIONS) out = out.split(exp).join('KAIF');
  return out;
}

// ---------------------------------------------------------------------------- agent systems wiring
// Verified conventions (adapters catalog; Grok Build web-verified 2026-07-16):
//   claude-code: .claude/skills/<n>/SKILL.md (canonical layout) + CLAUDE.md context file
//   codex:       .agents/skills/<n>/SKILL.md (Agent Skills standard, copy as-is) + native AGENTS.md
//   grok-build:  .grok/skills/<n>/SKILL.md (SKILL.md standard; also auto-reads .claude/ + AGENTS.md)
//   cline:       .cline/skills/<n>/SKILL.md (≥3.48; also reads .claude/skills/) + .clinerules/kaif.md
//   zoo-code:    .roo/commands/<n>.md (drop `name:`; filename = command) + .roo/rules/kaif.md
const CONTEXT_POINTER =
  '# Agent rules\n\nThis project is KAIF-wrapped. Before every task read `AGENT_GUIDE.md` (the canon) and ' +
  '`STATUS.md` (current state); think per `PHILOSOPHY.md`; debug per `BUG_FIXING_FRAMEWORK.md`; execute ' +
  'tasks per the fable loop (`/fable-method`, `/fable-judge`).\n';

function writeIfNew(path, content) {
  if (okOnDisk(path) && !FORCE) { log(`= kept existing ${path}`); return; }
  mkdirSync(dirname(path) || '.', { recursive: true });
  writeFileSync(path, content);
  log(`+ wrote ${path}`);
}

function deployAgentSystems(skillFiles, refFiles) {
  const copies = { codex: '.agents/skills', 'grok-build': '.grok/skills', cline: '.cline/skills' };
  for (const [sys, base] of Object.entries(copies)) {
    if (!AGENTS.includes(sys)) continue;
    for (const { path, content } of skillFiles) writeIfNew(`${base}/${skillName(path)}/SKILL.md`, content);
    // skill reference files (e.g. fable-method/references/*) travel with their skill
    for (const { path, content } of refFiles) writeIfNew(path.replace('.claude/skills', base), content);
  }
  if (AGENTS.includes('zoo-code')) {
    for (const { path, content } of skillFiles)
      writeIfNew(`.roo/commands/${skillName(path)}.md`, content.replace(/^name:[^\n]*\n/m, ''));
    writeIfNew('.roo/rules/kaif.md', '# KAIF\n\nRead `AGENT_GUIDE.md` before every task; keep `STATUS.md` current. ' +
      'Skills live in `.roo/commands/` (one `/command` per KAIF skill).\n');
  }
  if (AGENTS.includes('cline')) writeIfNew('.clinerules/kaif.md', CONTEXT_POINTER);
  if (AGENTS.includes('claude-code')) writeIfNew('CLAUDE.md', CONTEXT_POINTER);
  writeIfNew('AGENTS.md', CONTEXT_POINTER); // universal fallback, always
}

// Expected per-system artifact list for validation (mirrors deployAgentSystems).
function expectedAgentArtifacts(skillNames) {
  const want = ['AGENTS.md'];
  const per = { codex: (n) => `.agents/skills/${n}/SKILL.md`, 'grok-build': (n) => `.grok/skills/${n}/SKILL.md`,
                cline: (n) => `.cline/skills/${n}/SKILL.md`, 'zoo-code': (n) => `.roo/commands/${n}.md` };
  for (const sys of AGENTS) if (per[sys]) for (const n of skillNames) want.push(per[sys](n));
  if (AGENTS.includes('zoo-code')) want.push('.roo/rules/kaif.md');
  if (AGENTS.includes('cline')) want.push('.clinerules/kaif.md');
  if (AGENTS.includes('claude-code')) want.push('CLAUDE.md');
  return want;
}

// ---------------------------------------------------------------------------- adaptation task
// The ONE cognitive deliverable left to the AI agent. Every item ends in a forced
// checkpoint line (the fable-method lesson: weak models follow rules at decision
// points, not rules in lists) that verify-final greps for mechanically.
function writeAdaptationTask(unresolved, translated, meta) {
  const needTranslate = LANG !== 'en' && translated === 0;
  const items = [];
  items.push(['study', 'Study the project gradually and record findings (what it is, build/test commands, architecture) — this replaces the old KAIF_DEPLOYMENT_PLAN.md.']);
  if (unresolved.size) items.push(['placeholders', `Fill the remaining placeholders everywhere they occur (grep each): ${[...unresolved].join(' ')}`]);
  items.push(['maps', 'Fill PROJECT_STRUCTURE_EXTERNAL_MAP.md and PROJECT_ARCHITECTURE_INTERNAL_MAP.md from your inspection.']);
  items.push(['goal-plan', 'If GOAL.md is empty, seed it and ask the owner; derive MASTER_PLAN.md from GOAL.md (skill: /revision).']);
  items.push(['sphere', 'Confirm the project\'s sphere: pick a library from .kaif/spheres/ (or author one from _template.md), apply its terminology where the docs need it, record `sphere` in .kaif/kaif.json.']);
  if (needTranslate) items.push(['language', `Translate the owner-facing docs (GOAL.md, KAIF_FRAMEWORK.md, the directory READMEs) into "${LANG}" — no bundled template for this language yet. Keep agent-only docs in English.`]);
  items.push(['kaif-framework', 'Write KAIF_FRAMEWORK.md from its template: "KAIF, deployed here" + the deployment record (version, date, language, sphere, agents, mode).']);
  items.push(['verify', 'Run `node .kaif/kaif-core.mjs verify-final` — it checks these checkpoints and self-cleans the installer. Then commit `chore: deploy KAIF`.']);

  const lines = [
    '# KAIF adaptation task — the final (and only) cognitive step',
    '',
    '> Machinery has deployed everything mechanical. What remains is understanding — yours.',
    `> For each finished item: tick its checkbox AND append its checkpoint line at the bottom, verbatim.`,
    `> Then run \`node .kaif/kaif-core.mjs verify-final\` (it greps the checkpoints; missing = not done).`,
    '',
    ...items.map(([id, text]) => `- [ ] **${id}** — ${text}\n  Checkpoint when done: \`KAIF-ADAPT: ${id} done\``),
    '',
    `Install parameters: version ${meta.version} · lang ${LANG} · mode ${MODE} · agents ${AGENTS.join(',')}`,
    '',
    '## Checkpoints (append below as you finish items)',
    '',
  ];
  writeFileSync(TASK_FILE, lines.join('\n'));
  log(`+ wrote ${TASK_FILE} (${items.length} items)`);
  return items.map(([id]) => id);
}

// ---------------------------------------------------------------------------- commands
function cmdInstall() {
  const { files, meta } = parseBundle(BUNDLE);
  const { deploy, translated, aliased } = applyLanguage(files);
  const values = detectValues();
  const unresolved = new Set();

  // 1) write every deployable file (placeholder-filling the text ones; anonymizing on --mode anonymous)
  for (const f of deploy) {
    if (isSkippedAnon(f.path)) { log(`⊘ anonymous — skipped ${f.path}`); continue; }
    let content = f.path.endsWith('.mjs') ? f.content : fillPlaceholders(f.content, values, unresolved);
    if (ANON && !f.path.endsWith('.mjs')) content = anonymize(content);
    writeIfNew(f.path, content);
  }

  // 2) skills for all target agent systems (from the canonical .claude/skills/ set)
  const skillFiles = deploy.filter((f) => skillName(f.path) && !isSkippedAnon(f.path));
  const refFiles = deploy.filter((f) => /^\.claude\/skills\/[^/]+\/references\//.test(f.path));
  deployAgentSystems(skillFiles, refFiles);

  // 3) wiring: deploy marker + npm handles (respectful: existing scripts untouched)
  mkdirSync('.kaif', { recursive: true });
  const marker = { framework: 'KAIF', version: meta.version, released: meta.released,
                   ...(ANON ? { tracking: 'anonymous' } : { origin: ORIGIN, tracking: 'origin' }),
                   sphere: 'TODO', agents: AGENTS, language: LANG };
  writeFileSync(KAIF_JSON, JSON.stringify(marker, null, 2) + '\n');
  log(`+ wrote ${KAIF_JSON}`);
  // Respectful wiring: NEVER clobber an existing package.json we cannot parse —
  // an unreadable file means "skip the handles and say so", not "overwrite the user's file".
  // Anonymous installs get no kaif:* handles at all (they point at the origin-carrying core,
  // which verify-final removes) — the version stays readable in .kaif/kaif.json.
  let pkg = null;
  if (ANON) { /* no handles by design */ }
  else if (existsSync('package.json')) {
    try { pkg = readJson('package.json'); }
    catch { console.error('⚠ package.json exists but is not parseable JSON — kaif:* handles NOT wired (add them by hand)'); }
  } else pkg = {};
  if (pkg) {
    pkg.name = pkg.name || values['<PROJECT_NAME>'].toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    pkg.scripts = pkg.scripts || {};
    const handles = { 'kaif:version': 'node .kaif/kaif-core.mjs version', 'kaif:check': 'node .kaif/kaif-core.mjs check' };
    for (const [k, v] of Object.entries(handles)) if (!pkg.scripts[k]) pkg.scripts[k] = v;
    writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    log('+ wired kaif:* handles into package.json');
  }

  // 4) persist the deploy manifest so `check` outlives the bundle's cleanup
  const deployedPaths = deploy.filter((f) => !isSkippedAnon(f.path)).map((f) => f.path);
  const agentPaths = expectedAgentArtifacts(skillFiles.map((f) => skillName(f.path)));
  writeFileSync(DEPLOY_MANIFEST, JSON.stringify({ paths: deployedPaths, agents: agentPaths }, null, 2) + '\n');

  // 5) the final cognitive task for the agent
  writeAdaptationTask(unresolved, translated, meta);

  // 6) validate what we just did
  const bad = validate(deploy, skillFiles);
  if (bad) die(`install INCOMPLETE: ${bad} artifacts missing — re-run, or fix and \`check\``);
  log(`\n✅ KAIF ${meta.version} deployed mechanically (lang ${LANG}${translated ? ` · ${translated} owner docs templated` : ''}${aliased ? ` · ${aliased} skills trigger-aliased` : ''}, mode ${MODE}, agents ${AGENTS.join(',')}).`);
  log(`➡ ONE cognitive step remains — open ${TASK_FILE} and work it, then run: node .kaif/kaif-core.mjs verify-final`);
}

function validate(deploy, skillFiles) {
  let missing = 0;
  for (const f of deploy) {
    if (isSkippedAnon(f.path)) continue;
    if (!okOnDisk(f.path)) { console.error(`✖ MISSING or empty: ${f.path}`); missing++; }
  }
  for (const p of expectedAgentArtifacts(skillFiles.map((f) => skillName(f.path))))
    if (!okOnDisk(p)) { console.error(`✖ MISSING agent artifact: ${p}`); missing++; }
  for (const p of [KAIF_JSON, TASK_FILE]) if (!okOnDisk(p)) { console.error(`✖ MISSING: ${p}`); missing++; }
  return missing;
}

function cmdCheck() {
  // Prefer the live bundle (pre-cleanup); after verify-final fall back to the persisted manifest.
  let paths, agents;
  if (existsSync(BUNDLE)) {
    const { files } = parseBundle(BUNDLE);
    const { deploy } = applyLanguage(files);
    paths = deploy.filter((f) => !isSkippedAnon(f.path)).map((f) => f.path);
    agents = expectedAgentArtifacts(deploy.filter((f) => skillName(f.path) && !isSkippedAnon(f.path)).map((f) => skillName(f.path)));
  } else if (okOnDisk(DEPLOY_MANIFEST)) {
    ({ paths, agents } = readJson(DEPLOY_MANIFEST));
  } else die(`neither ${BUNDLE} nor ${DEPLOY_MANIFEST} found — is KAIF deployed here?`);
  let missing = 0;
  for (const p of [...paths, ...agents, KAIF_JSON])
    if (!okOnDisk(p)) { console.error(`✖ MISSING or empty: ${p}`); missing++; }
  if (missing) die(`INCOMPLETE: ${missing} artifacts missing`);
  log(`✅ manifest satisfied: ${paths.length} files + ${agents.length} agent artifacts present`);
}

function cmdVerifyFinal() {
  if (!okOnDisk(TASK_FILE)) die(`${TASK_FILE} not found — run install first (or it was already cleaned)`);
  const task = readFileSync(TASK_FILE, 'utf8');
  const ids = [...task.matchAll(/`KAIF-ADAPT: ([a-z-]+) done`/g)].map((m) => m[1]);
  let missing = 0;
  for (const id of ids) {
    const line = new RegExp(`^KAIF-ADAPT: ${id} done$`, 'm');
    if (!line.test(task)) { console.error(`✖ checkpoint missing: KAIF-ADAPT: ${id} done`); missing++; }
  }
  if (/^- \[ \]/m.test(task)) { console.error('✖ unticked checkboxes remain in the task file'); missing++; }
  // placeholder scan on the canon + skills (GOAL/maps may legitimately hold template slots for the owner)
  const scan = ['AGENT_GUIDE.md', ...(existsSync('.claude/skills') ?
    readdirSync('.claude/skills').map((n) => `.claude/skills/${n}/SKILL.md`).filter(existsSync) : [])];
  for (const p of scan) {
    const t = readFileSync(p, 'utf8');
    for (const ph of PLACEHOLDERS) if (t.includes(ph)) { console.error(`✖ placeholder ${ph} still in ${p}`); missing++; }
  }
  // anonymous installs: grep the deployed tree for author identity BEFORE cleanup —
  // transient installer files (removed below) are excluded from the scan.
  const anonInstall = okOnDisk(KAIF_JSON) && readJson(KAIF_JSON).tracking === 'anonymous';
  const TRANSIENT = ['KAIF.md', 'KAIF-LOADER.mjs', TASK_FILE, '.kaif/install', '.kaif/kaif-core.mjs', KAIF_JSON.replace('kaif.json', 'deploy-manifest.json')];
  if (anonInstall) {
    const leaks = [];
    const walk = (dir) => {
      for (const n of readdirSync(dir)) {
        const p = (dir === '.' ? '' : dir + '/') + n;
        if (['.git', 'node_modules'].includes(n) || TRANSIENT.some((t) => p === t || p.startsWith(t + '/'))) continue;
        if (statSync(p).isDirectory()) { walk(p); continue; }
        if (!/\.(md|json|txt|mjs|js)$/i.test(n)) continue;
        const t = readFileSync(p, 'utf8');
        for (const tok of AUTHOR_TOKENS) if (t.includes(tok)) { leaks.push(`${p} → "${tok}"`); break; }
      }
    };
    walk('.');
    if (leaks.length) { for (const l of leaks) console.error(`✖ anonymity leak: ${l}`); missing += leaks.length; }
  }
  if (missing) die(`verify-final FAILED: ${missing} issues — finish them and re-run`);

  // self-clean: the install is done; the project is driven by the skills from here on.
  for (const p of ['KAIF.md', 'KAIF-LOADER.mjs', TASK_FILE]) if (existsSync(p)) { unlinkSync(p); log(`- removed ${p}`); }
  if (existsSync('.kaif/install')) { rmSync('.kaif/install', { recursive: true, force: true }); log('- removed .kaif/install/'); }
  if (anonInstall) {
    // the core itself and its manifest carry the origin URL — an anonymous project keeps neither,
    // nor the kaif:* handles that point at them (version stays readable in .kaif/kaif.json).
    for (const p of ['.kaif/kaif-core.mjs', DEPLOY_MANIFEST]) if (existsSync(p)) { unlinkSync(p); log(`- removed ${p} (anonymous)`); }
    try {
      const pkg = readJson('package.json');
      if (pkg.scripts) { delete pkg.scripts['kaif:version']; delete pkg.scripts['kaif:check']; }
      writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
      log('- unwired kaif:* handles (anonymous)');
    } catch { /* no package.json — nothing to unwire */ }
  }
  log('✅ verify-final passed — KAIF install is complete and self-cleaned. Commit: chore: deploy KAIF');
}

function cmdVersion() {
  if (!okOnDisk(KAIF_JSON)) die('no .kaif/kaif.json — KAIF is not deployed here');
  const j = JSON.parse(readFileSync(KAIF_JSON, 'utf8'));
  log(`KAIF ${j.version} (released ${j.released}) · tracking: ${j.tracking} · lang: ${j.language} · agents: ${(j.agents || []).join(',')}`);
}

({ install: cmdInstall, check: cmdCheck, 'verify-final': cmdVerifyFinal, version: cmdVersion }[CMD] ||
  (() => die(`unknown command: ${CMD} (install | check | verify-final | version)`)))();
