#!/usr/bin/env node
// tools/build-framework.mjs
// ---------------------------------------------------------------------------
// Assembles the self-extracting core KAIF.md from:
//   - framework/_intro.md   (the narrative spine, with {{...}} markers)
//   - framework/*.md         (the four guidance-doc templates)
//   - framework/skills/**    (the twelve skill templates)
//
// Single source of truth: the templates live ONCE in framework/. This tool
// inlines them into KAIF.md so the document is genuinely self-extracting
// (everything needed to recreate the structure is inside one file). This is
// itself an example of the framework's "build your own tooling" principle.
//
// It also emits the SECOND artifact — KAIF-SLIM.md (idea 07): the one-file Slim
// variant that IS the framework in place (no unpacking). Source: framework/KAIF-SLIM.md.
//
// Usage:  node tools/build-framework.mjs
// Re-run after editing framework/_intro.md or any template. Never hand-edit KAIF.md.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mapFile, validateOverrides } from './module-map-lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FW = join(ROOT, 'framework');

// A 6-backtick fence safely wraps template content that itself uses up to
// 3-backtick code fences (and nested examples), so nothing leaks out.
const FENCE = '``````';

// Read the project version (X.Y — major.minor only) from version.json, defaulting to 1.0.
// KAIF versions are two-digit semver (see idea 05 / plan 06): no patch, no date in the name.
function version() {
  const vf = join(ROOT, 'version.json');
  if (existsSync(vf)) {
    try {
      const v = JSON.parse(readFileSync(vf, 'utf8'));
      return `${v.major}.${v.minor}`;
    } catch { /* fall through */ }
  }
  return '1.0';
}

// Release date (YYYY-MM-DD) from version.json — KAIF stamps each version with its release date.
function released() {
  try { return JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8')).released || ''; } catch { return ''; }
}

// Release codename from version.json — the ONE source the template notes and release rituals
// quote. Bug 10 (field, 6 of 8 reports): the 1.6 bundle shipped notes signed "KAIF 1.5 — Tested
// KAIF" because the codename lived hardcoded in prose; now the build computes it and the
// self-check refuses to ship notes that name a different version.
function codename() {
  try { return JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8')).codename || ''; } catch { return ''; }
}

// Skill count, COMPUTED from framework/skills (the bugs/09 class: a hand-written counter rots
// the moment the set grows — a computed one cannot; "22 in all" shipped in the core until 2.0).
function skillCount() {
  const dir = join(FW, 'skills');
  return readdirSync(dir).filter((n) => existsSync(join(dir, n, 'SKILL.md'))).length;
}

// Embed one template file as a labelled fenced block, telling the agent which
// file to create in the target project and how to treat it. The fence language
// follows the file extension (markdown templates vs. the .mjs unpacker script).
function embedFile(relPath, destLabel, note) {
  // \r\n → \n: source files may sit CRLF in old checkouts; every generated artifact must be
  // pure LF so its bytes (and the sha256 in kaif-manifest.json) match the committed blob and
  // what raw.githubusercontent serves (bug 04 — the real root cause).
  const content = readFileSync(join(ROOT, relPath), 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
  const header = `> **FILE: \`${destLabel}\`**${note ? ' — ' + note : ''}\n\n`;
  // Fence language follows the extension: .mjs → js, .json → json, everything else → md.
  const lang = relPath.endsWith('.mjs') ? 'js' : relPath.endsWith('.json') ? 'json' : 'md';
  return header + FENCE + lang + '\n' + content + FENCE + '\n';
}

// Destination label + guidance note for each embedded template (key docs + directory READMEs).
const DOC_TARGETS = {
  // The mechanical unpacker (bug 01): the ONE file an agent writes by hand, then runs.
  'framework/kaif-unpack.mjs':         ['kaif-unpack.mjs',         'project root — write this ONE file verbatim FIRST, then run `node kaif-unpack.mjs KAIF.md` (deleted after injection, together with KAIF.md)'],
  // Guidance docs
  'framework/AGENT_GUIDE.md':          ['AGENT_GUIDE.md',          "project root — replace every `<PLACEHOLDER>` with the project's real values"],
  'framework/PHILOSOPHY.md':           ['PHILOSOPHY.md',           'project root — universal, write verbatim'],
  'framework/BUG_FIXING_FRAMEWORK.md': ['BUG_FIXING_FRAMEWORK.md', 'project root — universal, write verbatim'],
  'framework/TESTING_FRAMEWORK.md':    ['TESTING_FRAMEWORK.md',    'project root — universal, write verbatim'],
  // The requirements canon added in 2.2 (epic N): goal vector + acceptance criteria + stop-word dictionary
  'framework/REQUIREMENTS_FRAMEWORK.md': ['REQUIREMENTS_FRAMEWORK.md', 'project root — universal, write verbatim'],
  'framework/STATUS.md':               ['STATUS.md',               "project root — seed with the project's current real state"],
  // The chronicle added in 2.1 (epic H): STATUS stays a summary of NOW, closed work moves here
  'framework/PROJECT_HISTORY.md':      ['PROJECT_HISTORY.md',      'project root — seed this template; closed STATUS entries move here verbatim (the bonsai trim)'],
  // Experience log added in 1.4 (grows on its own; living reference)
  'framework/EXPERIENCE.md':           ['EXPERIENCE.md',           'project root — seed this template; the agent grows it (skill: /experience)'],
  // Key docs added in 1.1
  'framework/GOAL.md':                 ['GOAL.md',                 'project root — owner-filled; if empty, seed this template and ask the owner'],
  'framework/MASTER_PLAN.md':          ['MASTER_PLAN.md',          'project root — derive from GOAL.md (skill: /revision)'],
  'framework/PROJECT_STRUCTURE_EXTERNAL_MAP.md':    ['PROJECT_STRUCTURE_EXTERNAL_MAP.md',    'project root — the external map, from your inspection'],
  'framework/PROJECT_ARCHITECTURE_INTERNAL_MAP.md': ['PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'project root — the internal map, adapted to the sphere'],
  'framework/KAIF_FRAMEWORK.md':       ['KAIF_FRAMEWORK.md',       'project root — write AFTER a successful injection (see §10)'],
  'framework/KAIF_REFERENCE.md':       ['.kaif/KAIF_REFERENCE.md', 'the complete framework reference — verbatim; /help-kaif reads and cites it'],
  // Directory READMEs
  'framework/readmes/plans.md':        ['plans/README.md',        'create the directory and drop this README'],
  'framework/readmes/ideas.md':        ['ideas/README.md',        'create the directory and drop this README'],
  'framework/readmes/bugs.md':         ['bugs/README.md',         'create the directory and drop this README'],
  'framework/readmes/researches.md':   ['researches/README.md',   'create the directory and drop this README'],
  'framework/readmes/interviews.md':   ['interviews/README.md',   'create the directory and drop this README'],
  'framework/readmes/homeworks.md':    ['homeworks/README.md',    'create the directory and drop this README'],
  'framework/readmes/reports.md':      ['reports/README.md',      'create the directory and drop this README'],
};

// Embed all skills in a sensible, documented order.
function embedSkills() {
  const dir = join(FW, 'skills');
  const order = ['resume', 'pause', 'autoloop', 'dayloop', 'nightloop', 'refresh-context',
                 'check-backlog', 'experience', 'report-bug', 'bug-research', 'propose-idea', 'interview',
                 'revision', 'fix-vision', 'what-next', 'help-kaif', 'release'];
  const names = readdirSync(dir).filter((n) => existsSync(join(dir, n, 'SKILL.md')));
  names.sort((a, b) => ((order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999)));
  const note = "replace the command placeholders (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) with the project's real commands";
  return names
    .map((n) => `### \`.claude/skills/${n}/SKILL.md\`\n\n` +
                embedFile(`framework/skills/${n}/SKILL.md`, `.claude/skills/${n}/SKILL.md`, note))
    .join('\n');
}

// --- assemble ---------------------------------------------------------------
let out = readFileSync(join(FW, '_intro.md'), 'utf8').replace(/\r\n/g, '\n');

// Drop the authoring comment at the top of _intro.md; replace with a "generated" banner.
// (\r?\n — the working tree may be CRLF on Windows checkouts; the regex must strip the comment
// on both platforms, otherwise the {{EMBED:...}} example inside it leaks into marker processing.)
out = out.replace(/^<!--[\s\S]*?-->\r?\n/, '');
out = '<!-- GENERATED FILE — do not edit by hand. Built from framework/_intro.md + framework/* by ' +
      'tools/build-framework.mjs. Edit the sources and re-run the tool. -->\n' + out;

// {{VERSION}} · {{SKILL_COUNT}}
out = out.replaceAll('{{VERSION}}', version()).replaceAll('{{RELEASED}}', released())
         .replaceAll('{{SKILL_COUNT}}', String(skillCount()));

// {{EMBED:framework/...}}
out = out.replace(/\{\{EMBED:([^}]+)\}\}/g, (_, p) => {
  const key = p.trim();
  const t = DOC_TARGETS[key];
  return t ? embedFile(key, t[0], t[1]) : embedFile(key, key);
});

// {{EMBED_SKILLS}}
out = out.replace('{{EMBED_SKILLS}}', embedSkills());

// Since 1.5 (Tested KAIF) the ROOT KAIF.md is the THIN entry point (written below,
// together with dist/) — the classic full core lives on as the offline release asset
// dist/KAIF-FULL.md. The Slim variant is retired (interview 002 Q7); its source
// remains in git history.
console.log(`✅ full core assembled — ${out.split('\n').length} lines, v${version()} (${released()}) → dist/KAIF-FULL.md`);

// --- Thin KAIF (1.5) + installer machinery → dist/ ---------------------------
// Four artifacts of the "Thin KAIF" install path (plan 13, Phase 2). Until the 1.5
// release the root KAIF.md stays the classic full core; dist/ carries the new path:
//   dist/KAIF.md              — the thin entry point (bootstrap + embedded loader)
//   dist/KAIF-CORE.mjs        — the heavy installer machinery (fetched by the loader)
//   dist/KAIF-CORE-BUNDLE.md  — every deployable file as FILE: blocks + a manifest block
//   dist/kaif-manifest.json   — version + sha256 of the two fetched artifacts
//   dist/KAIF-FULL.md         — the classic self-contained core (offline fallback asset)
const DIST = join(ROOT, 'dist');
mkdirSync(DIST, { recursive: true });

// 1) thin KAIF.md from the bootstrap narrative (embeds the loader verbatim)
let thin = readFileSync(join(FW, 'installer', '_thin-intro.md'), 'utf8').replace(/\r\n/g, '\n');
thin = thin.replace(/^<!--[\s\S]*?-->\n/, '');
thin = '<!-- GENERATED FILE — do not edit by hand. Built from framework/installer/_thin-intro.md by ' +
       'tools/build-framework.mjs. Edit the source and re-run the tool. -->\n' + thin;
thin = thin.replaceAll('{{VERSION}}', version()).replaceAll('{{RELEASED}}', released())
           .replaceAll('{{SKILL_COUNT}}', String(skillCount()));
thin = thin.replace(/\{\{EMBED:([^}]+)\}\}/g, (_, p) => embedFile(p.trim(), 'KAIF-LOADER.mjs',
  'project root — write this ONE file verbatim, then run it (removed again by verify-final)'));
writeFileSync(join(DIST, 'KAIF.md'), thin);
writeFileSync(join(ROOT, 'KAIF.md'), thin);   // since 1.5 the root entry point IS the thin core

// The reference is a ROOT document of the source repo too (owner decision, 2026-07-28): a
// generated verbatim copy of framework/KAIF_REFERENCE.md — same rule as the root KAIF.md
// (framework/ stays the single source; the root copy cannot drift: the build rewrites it and
// check-framework diffs it against the source — the bugs/09 class must not reopen here).
const refSrc = readFileSync(join(FW, 'KAIF_REFERENCE.md'), 'utf8').replace(/\r\n/g, '\n');
writeFileSync(join(ROOT, 'KAIF_REFERENCE.md'),
  '<!-- GENERATED COPY — do not edit. Source: framework/KAIF_REFERENCE.md (edit there, then run ' +
  'tools/build-framework.mjs). Deployed projects receive this document at .kaif/KAIF_REFERENCE.md. -->\n'
  + refSrc);

// 2) the core machinery, copied verbatim (LF-normalized; it reads version data from the bundle manifest)
const coreSrc = readFileSync(join(FW, 'installer', 'KAIF-CORE.mjs'), 'utf8').replace(/\r\n/g, '\n');
writeFileSync(join(DIST, 'KAIF-CORE.mjs'), coreSrc);

// 3) the bundle: manifest block + every deployable file as a FILE: block.
//    Contents: the key docs + directory READMEs (from DOC_TARGETS, minus the legacy
//    unpacker), every skill (with its references/), and the sphere libraries
//    (deployed to .kaif/spheres/ so fable-method/judge can read the project's sphere).
// Template news, KEPT BY VERSION (plan 21 §3.4; field gap T2: single-release notes left a
// 1.2→1.6 jumper seeing one release's news out of four). The update task prints the UNION of
// every version in the (from, to] interval. RELEASE RITUAL (/release checks this; the
// self-check enforces the codename line): add THIS release's entry every time — stale notes
// were the single most-reported field defect (bug 10: six of eight 1.6 reports misled).
const TEMPLATE_NOTES_BY_VERSION = {
  '1.5': [
    'fable family vendored: /fable-method, /fable-loop, /fable-judge, /fable-domain (execution discipline; judge pass MANDATORY in the loops and /release)',
    'NEW key doc TESTING_FRAMEWORK.md: the 7 testing principles + [NOT-TESTED]/[TESTED: …] trust markers (false [TESTED] is a judge-hunted fraud)',
    'Spheres carry execution discipline: binding minimum evidence set, authority order, verification by observation, fraud table (deployed to .kaif/spheres/)',
  ],
  '1.6': [
    'AGENT_GUIDE: canon rules — recon-before-code (recon docs in researches/), quote-the-plan while coding, non-negotiable git hygiene (diff --stat before commit, ignore-first, owner originals verbatim), write-gate + [AI]…[/AI]/[AI-ed]…[/AI-ed] provenance marks on owner canon artifacts, canonical ordering for anything diffed/cached',
    'PHILOSOPHY: new principles — "Observation over guessing" and "The three-doors rule" (a gap is never solved by invention; invented numbers are worse than missing ones)',
    'BUG_FIXING_FRAMEWORK: close the CLASS, not the instance (inventory first); guards — every fix births a check, and the check is proven on a broken version; findings are not findings until verified (script before LLM judgment)',
    'Knowledge formats: closing any idea/bug/plan requires a "Decisions made without the owner" section; EXPERIENCE entries carry Repro:/Not for: fields and trigger tags that must be QUOTED before a task',
    '/fable-judge vendored skill gained the guardrail hunts (KAIF patch 3); judge pass now required before EVERY push/deploy, not only before "done"; /release gained the 5-gate deploy checklist',
    // frozen literal: a dynamic version()/codename() here would rename HISTORY on the next bump
    'Release codename for this version: KAIF 1.6 — Homeostatic KAIF',
  ],
  '2.0': [
    'NEW key doc .kaif/KAIF_REFERENCE.md — the complete framework reference (§1–16: terminology, marker/manifest/receipt schemas, the full mechanics); /help-kaif reads and CITES it. Added mechanically; nothing to merge',
    'Updates are now MODULAR machinery, not agent judgment: deploy-manifest v2 keeps template shas apart from disk shas (only a template-sha match authorizes replacement), files merge PER MODULE from the disk order, your localized/adapted modules survive updates, diffs reach the update task only where upstream actually changed. If your old manifest is v1 — run `node .kaif/kaif-core.mjs adopt-current` once after this update to upgrade provenance',
    'Update proof: .kaif/last-update.json receipt (verifiedAt stamp) + history in the marker; `diff` (audit + per-module preview), `adopt-current` (manual migrations stop killing the mechanical path), synthetic baseline for legacy/anonymous deployments (--baseline), checkpoints now EXECUTE their checks; deprecated artifacts are removed mechanically when untouched',
    'Optional tool modules land in .kaif/tools/ (added mechanically; wiring is opt-in): kaif-provenance.mjs — the [AI]…[/AI] provenance gate over declared canonArtifacts with an acceptance registry; kaif-canon-lint.mjs — forbidden wordings / guarded lines with a selftest that proves every guard can fire',
    'Skills: /pause is now a SOFT PARK (the chat continues later); NEW /end-chat — the full wrap-up with a handoff baton; NEW /derive-styleguide — extract the owner\'s style guide from their own sample before writing into their canon. If your adapted skill copies diverged, merge these semantics by hand',
    'AGENT_GUIDE: strictness modes (draft vs canon pipeline) + the any-model/strong-model split on task steps; the write-gate now names the mechanized gates (provenance check + canon lint)',
    'Release codename for this version: KAIF 2.0 — Excellent KAIF',
  ],
  '2.1': [
    'NEW key doc PROJECT_HISTORY.md — the append-only chronicle of closed sessions/phases/releases (13th key doc; added mechanically, outside /resume and the required minimum). STATUS.md is now the living SUMMARY of the present (~200-line soft target, warning-mode guard). MIGRATION — agent work, not machinery: move the overgrown history out of your STATUS into PROJECT_HISTORY (machinery cannot judge what counts as history; do it once, by the /end-chat rules)',
    'NEW skills (6): /plan-task + /plan-epic (the planning ladder — heavy work climbs recon → research doc → meta-plan → operational plan of the NEXT phase only), /guarded-loop (autonomous loop under an external watchdog: wake-ups every N minutes, a work-proving heartbeat file, a restart policy with an escalation cap), /code-revision (periodic READING revision by the strongest model: reviewers armed with the project\'s paid-for failure classes, verbatim quote per finding, adversarial skeptic defaulting to "not a defect"), /owner-voice (stylometric portrait of the owner\'s written voice; the skeleton ships mechanically as .kaif/_owner-voice-template.md), /owner-reviews (optional review contour: interviews/drafts as local HTML pages, decisions recorded with by/at, send-side fail-closed approval gate)',
    'AGENT_GUIDE canon — the place-of-questions HARD RULE: everything the agent wants FROM the owner (fork, review, approval, answer) lives ONLY in interviews/ (the one pointed task-level chat question stays legal); an adopted practice keeps a mechanical guard and an executable violation-showing command; an answer\'s force does not depend on transport (HTML = md = chat), recorded with by/at — /interview gained the optional render step and autonomous-loop queueing',
    'AGENT_GUIDE canon — judgment boundaries: the TASTE class (acceptance criterion is a perception adjective ⇒ the agent produces a MOCK-UP and files homework, never concludes; all candidates on ONE material, blind labels) and action-permission ≠ identity-authorship (naming, codenames, brand strings are never the agent\'s decision under any breadth of approval)',
    'AGENT_GUIDE canon — planning-discipline ladder; document & text hygiene incl. the truth↔mirror pairs registry (a mirrored/generated surface is edited at its source and rebuilt, never patched in place) and text-through-files (owner/canon text never passes through CLI string arguments); recon artifacts now name the canon map and the parity inventory; EXPERIENCE entries: Repro is REQUIRED, Trigger tags quoted before tasks, a repeating lesson gets mechanized',
    'fable patches (vendored skills): /fable-method Step 5 gained the CRAFT SLOTS (TWINS-MECH mechanism-not-string grep, the removal table for moved logic, AFTER-WORK, BOTH-WAYS, the deleted-text sweep, craft questions by diff type); /fable-judge gained the hunts identity-without-an-author, timer-fed heartbeat, mutation addressivity (a guard proven by mutation names its addressees BEFORE the run); spheres gained Craft recipes + Owner\'s voice sections + the "Voice without a corpus" fraud row',
    'Update machinery hardened by the 2.0 field reports: translated deployments ("i18n": "translated") merge correctly, the first-update prediction is honest, CRLF-resaved cores unpack, a missing owner-seeded doc re-seeds on update, the stale-claims scan skips chronicles; the sandbox polygon grew suite s07',
    // frozen literal: a dynamic version()/codename() here would rename HISTORY on the next bump
    'Release codename for this version: KAIF 2.1 — Strong KAIF',
  ],
  // INERT until the release bump: newsInterval prints (from, meta.version] and meta.version is 2.1,
  // and the codename gate reads only the CURRENT version's notes (check-framework.mjs). Phase R
  // APPENDS to this array and adds the frozen 2.2 codename line — it never recreates the key.
  '2.2': [
    'The owner\'s voice portrait now has a CANONICAL name: AUTHOR_STYLOMETRY.md in the project root — an OPTIONAL canon document (it exists only where a portrait was actually taken; a deployment without one never reddens `check`). The skeleton still ships to .kaif/_owner-voice-template.md and is COPIED to that name, never filled in place. The skeleton gained a corpus-registry module, an append-only PORTRAIT JOURNAL (date+time · what changed · source · who asked; supersede-style, never edited backdated) and an anchored-module rule, so re-synthesising one module leaves its neighbours untouched; feeding a NEW owner source is the standard /owner-voice procedure — one more analyst pass plus a re-synthesis of the affected modules and a journal row, never a restart. MIGRATION — agent work, not machinery: if your project already keeps a portrait under a name of its own, rename that FILE with your VCS rename (so the history follows), re-point every reference to it (grep the whole tree, scripts and pipeline prompts included) and pull a corpus registry that lives OUTSIDE the portrait into the registry module; the portrait\'s CONTENT is not touched and nothing is re-synthesized. KAIF never renames it for you — the portrait is an owner-class artifact, and only a template-sha match authorizes the machinery to replace a file. No portrait taken? Nothing to do',
  ],
};
// Flat notes for the CURRENT version stay in the meta for older cores reading a newer bundle.
const TEMPLATE_NOTES = TEMPLATE_NOTES_BY_VERSION[version()] || [];

// Artifacts RETIRED by this release that earlier releases deployed (plan 21 §3.5, field gap
// T10 — a mechanism that replaces another owns the cleanup of its predecessor). Each entry:
// { path, reason }. The core removes untouched instances mechanically and lists edited ones
// in the update task. Empty is the normal state.
const DEPRECATIONS = [];

// POLICY changes, by version (Reference §10.6; field gap 04-§6: 1.6 changed the language POLICY
// and the change dissolved into an ordinary diff — the owner learned about it on an audit).
// A rule change of the previous version is declared here and the update task surfaces it in a
// separate "decisions for the OWNER" section — never merged silently.
const POLICY_CHANGES_BY_VERSION = {
  '1.6': ['Language policy: agent-facing documents are English by default; the owner\'s language covers owner-facing documents and chat (a wholesale-translated wrapper declares "i18n": "translated" in the marker instead of fighting this rule).'],
  '2.2': [
    'CLI safety (bug 33): a bare or flags-only `kaif-core.mjs` run prints help and touches NOTHING (the old default was `install` — it once overwrote a live update task in the field); unknown commands, flags and stray arguments now REFUSE instead of being silently ignored. Scripts relying on the old default must name `install` and its flags explicitly.',
    'Guard exit semantics (bug 34): unconfigured optional guards — kaif-canon-lint without rules, kaif-provenance without a canonArtifacts key — exit 3 "SKIPPED" instead of 0. CI that treats any non-zero exit as failure must handle 3 as "not configured, nothing proven".',
    'NEW key doc REQUIREMENTS_FRAMEWORK.md (the 14th) — the requirements canon: goal vector + acceptance criteria FIRST in every target document, the ten quality criteria (ISO/IEC/IEEE 29148 anchor), EARS patterns, fit criterion (Scale/Meter/Target), the stop-word dictionary. Universal, added mechanically; nothing to merge. Its executable form is the NEW optional tool module .kaif/tools/kaif-requirements-lint.mjs (check | selftest; advisory — a linter and a judge rubric, never a Definition-of-Ready turnstile; SKIPPED=3 when nothing to scan).',
    'AGENT_GUIDE canon — CONTEXT REFRESH: the re-read core is RE-READ, not remembered, at four triggers (the hour · before a heavy task · after compaction/pause · ritual points), and a refresh is a verifiable action with a two-part witness — the machine-readable marker .kaif/refresh-marker.json (ignored by git, like the other session state) plus a quote-acceptance in the chat; a marker without the quote is judge-hunted fraud of the false-[TESTED] class. Woven into 7 ritual skills by reference. NEW optional module .kaif/hooks/ makes it mechanical where the agent system has lifecycle hooks: session-start-refresh (order to re-read after compaction/clear), prompt-refresh-timer (marker older than 60 min → order; silent while fresh), stop-status-guard (work happened while STATUS went stale → ONE soft block per session), plus settings-fragment.json — the ready config sample. DECISION FOR THE OWNER: the files arrive mechanically, but ACTIVATION is yours — KAIF never edits your settings.json; merge the fragment into .claude/settings.json only if you want the hooks. A deployment without them never reddens: the markdown ritual is the complete contour on its own.',
    'AGENT_GUIDE canon — the ENVIRONMENT DOSSIER: a section the agent FILLS by probing its machine (six axes: OS/hardware · shells and encodings · toolchain incl. what tar/curl/find actually resolve to per shell · VCS policies · package managers · links to paid-for lessons), as a fact → value → probe table whose header carries the date taken, the regeneration command and the staleness rule (facts older than four weeks are hypotheses). The collection procedure is a step in /refresh-context — probe in EVERY shell separately, since the difference between shells is the point. MIGRATION — agent work: the section deploys with `— not probed yet —` values; run the probes once and fill it (a missing fact is honest, an invented one is a defect).',
  ],
};

// Every (src → dest) pair that lands in the bundle is recorded here as a side effect of
// bundleBlocks() — the module map (plan 21 §3.1) is built from EXACTLY the same set, so the
// map can never cover a different tree than the bundle ships.
const BUNDLE_ENTRIES = [];
function embedBundle(src, dest, note) {
  BUNDLE_ENTRIES.push({ src, dest });
  return embedFile(src, dest, note);
}

function bundleBlocks() {
  const blocks = [];
  // Class overrides ship in the meta block so KAIF-CORE classifies modules with the SAME
  // exceptions the build used (underscore keys are documentation, not data).
  const ovPath = join(FW, 'module-classes.json');
  const ovRaw = existsSync(ovPath) ? JSON.parse(readFileSync(ovPath, 'utf8').replace(/^﻿/, '')) : {};
  const moduleClasses = Object.fromEntries(Object.entries(ovRaw).filter(([k]) => !k.startsWith('_')));
  const meta = { framework: 'KAIF', version: version(), released: released(), templateNotes: TEMPLATE_NOTES,
    templateNotesByVersion: TEMPLATE_NOTES_BY_VERSION, deprecations: DEPRECATIONS,
    policyChanges: POLICY_CHANGES_BY_VERSION, moduleClasses };
  blocks.push(`> **FILE: \`kaif-bundle-manifest.json\`** — bundle metadata (data for KAIF-CORE, never written to disk)\n\n` +
    FENCE + 'json\n' + JSON.stringify(meta, null, 2) + '\n' + FENCE + '\n');
  for (const [src, [dest, note]] of Object.entries(DOC_TARGETS)) {
    if (src === 'framework/kaif-unpack.mjs') continue; // legacy unpacker: lives only in the full core
    blocks.push(embedBundle(src, dest, note));
  }
  const skillsDir = join(FW, 'skills');
  for (const n of readdirSync(skillsDir)) {
    if (!existsSync(join(skillsDir, n, 'SKILL.md'))) continue;
    blocks.push(embedBundle(`framework/skills/${n}/SKILL.md`, `.claude/skills/${n}/SKILL.md`,
      "replace the command placeholders with the project's real commands"));
    const refDir = join(skillsDir, n, 'references');
    if (existsSync(refDir)) for (const r of readdirSync(refDir).filter((f) => f.endsWith('.md')))
      blocks.push(embedBundle(`framework/skills/${n}/references/${r}`, `.claude/skills/${n}/references/${r}`, 'verbatim'));
  }
  for (const s of readdirSync(join(FW, 'spheres')).filter((f) => f.endsWith('.md')))
    blocks.push(embedBundle(`framework/spheres/${s}`, `.kaif/spheres/${s}`, 'sphere library — verbatim'));
  // optional tool modules (owner decision #19: separate optional modules, never core weight)
  const toolsDir = join(FW, 'tools');
  if (existsSync(toolsDir)) for (const t of readdirSync(toolsDir).filter((f) => f.endsWith('.mjs')))
    blocks.push(embedBundle(`framework/tools/${t}`, `.kaif/tools/${t}`, 'optional tool module — verbatim'));
  // optional refresh-hooks module (epic O, 2.2): scripts + sample config + wiring README →
  // .kaif/hooks/. Same optionality as the tool modules: the files DEPLOY, activation is an
  // explicit owner step (KAIF never edits the project's settings.json — see the README).
  // File filter mirrors the tool modules: a stray directory or editor temp file in the module
  // must be ignored, never crash the build with EISDIR (and check-framework counts the same way).
  const hooksDir = join(FW, 'hooks');
  if (existsSync(hooksDir)) for (const h of readdirSync(hooksDir).filter((f) => statSync(join(hooksDir, f)).isFile()))
    blocks.push(embedBundle(`framework/hooks/${h}`, `.kaif/hooks/${h}`,
      'optional refresh-hooks module — verbatim; activation is an explicit owner opt-in (.kaif/hooks/README.md)'));
  // the owner-voice portrait skeleton (epic C, 2.1): bundle-only like the tools — an OPTIONAL
  // methodology template; a deployment without an owner's artifact never reddens for lacking it.
  // Dest is .kaif/ (NOT .kaif/spheres/ — it would be read as a sphere library; field report 22).
  if (existsSync(join(FW, 'templates', '_owner-voice-template.md')))
    blocks.push(embedBundle('framework/templates/_owner-voice-template.md', '.kaif/_owner-voice-template.md',
      'the owner-voice portrait skeleton — optional; /owner-voice copies it to AUTHOR_STYLOMETRY.md and fills the copy'));
  // language packs: owner-facing doc overrides + skill trigger aliases per language.
  // Data for KAIF-CORE (never written to disk as-is): the chosen language's files
  // override their destination paths; others are ignored.
  const langRoot = join(FW, 'templates', 'languages');
  if (existsSync(langRoot)) {
    const walk = (dir, rel) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        const r = rel ? `${rel}/${n}` : n;
        if (statSync(p).isDirectory()) { walk(p, r); continue; }
        blocks.push(embedBundle(`framework/templates/languages/${r}`, `templates/languages/${r}`,
          'language pack — data for KAIF-CORE, applied only for the chosen --lang'));
      }
    };
    walk(langRoot, '');
  }
  return blocks;
}

// --- The module map (plan 21 §3.1) ------------------------------------------
// Cuts every deployable md of the bundle into modules by signature anchors (full unique heading
// lines — owner decision #16), classifies each (computed defaults + framework/module-classes.json
// overrides) and emits dist/kaif-module-map.json. Deterministic: bundle order, document order
// (the canonical-ordering rule — the map gets diffed and cached downstream).
// [TESTED: 2026-07-27 · spike 5.1: 124 files → 517 modules, rejoin byte-identical, 0 duplicate signatures]
function buildModuleMap() {
  const overridesPath = join(FW, 'module-classes.json');
  const overrides = existsSync(overridesPath) ? JSON.parse(readFileSync(overridesPath, 'utf8').replace(/^﻿/, '')) : {};
  const files = {};
  for (const { src, dest } of BUNDLE_ENTRIES) {
    if (!dest.endsWith('.md')) continue; // .mjs machinery and json data carry no prose modules
    const content = readFileSync(join(ROOT, src), 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '') + '\n';
    files[dest] = mapFile(dest, content, overrides); // throws on duplicate signature / broken rejoin
  }
  const errors = validateOverrides(overrides, files);
  if (errors.length) { for (const e of errors) console.error('❌ ' + e); process.exit(1); }
  const moduleCount = Object.values(files).reduce((a, m) => a + m.length, 0);
  const map = { framework: 'KAIF', version: version(), released: released(), moduleCount, files };
  writeFileSync(join(DIST, 'kaif-module-map.json'), JSON.stringify(map, null, 2) + '\n');
  return moduleCount;
}
const bundleHeader = '<!-- GENERATED FILE — the KAIF installer bundle. Built by tools/build-framework.mjs; ' +
  'fetched and parsed by KAIF-CORE.mjs. Never edit or deploy by hand. -->\n# KAIF-CORE-BUNDLE · v' +
  version() + ` (${released()})\n\n`;
const bundleBody = bundleBlocks();
writeFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), bundleHeader + bundleBody.join('\n'));

// 4) the loader's integrity manifest (sha256 over the two fetched artifacts).
//    `assets` names every release artifact and its role — a field auditor took KAIF-FULL.md
//    (44 blocks) for the complete set and got a silently wrong diff (bug 19.4): the asset
//    composition must be machine-readable, not tribal knowledge.
const sha256 = (p) => createHash('sha256').update(readFileSync(join(DIST, p))).digest('hex');
writeFileSync(join(DIST, 'kaif-manifest.json'), JSON.stringify({
  framework: 'KAIF', version: version(), released: released(), codename: codename(),
  sha256: { 'KAIF-CORE.mjs': sha256('KAIF-CORE.mjs'), 'KAIF-CORE-BUNDLE.md': sha256('KAIF-CORE-BUNDLE.md') },
  assets: {
    'KAIF.md': 'thin entry point (bootstrap + embedded loader); transient in the target project',
    'KAIF-CORE.mjs': 'installer machinery; lives on as .kaif/kaif-core.mjs',
    'KAIF-CORE-BUNDLE.md': 'the COMPLETE deployable set (docs + skills + spheres + optional tool modules + language packs) as FILE: blocks',
    'kaif-manifest.json': 'this file — version, codename, sha256 pins, asset roles',
    'KAIF-FULL.md': 'offline fallback core — a SUBSET (no language packs/spheres/references); not an authoritative diff baseline (last-resort synthetic-baseline candidate only)',
  },
}, null, 2) + '\n');

// 5) the offline fallback: the classic full core under its release-asset name
writeFileSync(join(DIST, 'KAIF-FULL.md'), out);

// 6) the module map — generated from EXACTLY the bundle's entry set (plan 21 §3.1)
const moduleCount = buildModuleMap();
console.log(`✅ dist/ generated — thin KAIF.md (${thin.split('\n').length} lines) · KAIF-CORE.mjs · ` +
  `KAIF-CORE-BUNDLE.md (${bundleBody.length} file blocks) · kaif-manifest.json · KAIF-FULL.md · ` +
  `kaif-module-map.json (${moduleCount} modules)`);

// Self-check the generated installer (idea 01): fail loudly if it is malformed.
try {
  execSync('node ' + JSON.stringify(join(ROOT, 'tools', 'check-framework.mjs')), { stdio: 'inherit' });
} catch {
  process.exit(1);
}
