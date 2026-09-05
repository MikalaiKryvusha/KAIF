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
    'NEW knowledge directory `reports/` with its own README — the feedback loop of the framework made a place, not a habit: field install and update reports live in `reports/KAIF_UPDATES/` (owner decision #66), audit output in `reports/KAIF_AUDIT/`. MIGRATION — agent work: if your project already keeps agent reports somewhere else, move them with your VCS rename so the history follows, then re-point references. The mandatory field report is now required BY THE DELIVERED VERSION, not by the task text: `update-verify` refuses without `reports/KAIF_UPDATES/*_KAIF_<version>_UPDATE_REPORT.md`, even when the task that drove your update was written by an older core that never listed the item.',
    'AGENT_GUIDE canon — the META-HEADER of knowledge documents: every working document in plans/ideas/researches/homeworks opens with an H1 and a blockquote header carrying four linted labels (Created · Parent · Status · Outward). `bugs/` and `interviews/` keep their already-canonical dialects. MIGRATION: advisory, not a turnstile — the header linter consults and never blocks the start of work, so existing documents can be brought to the norm as you touch them.',
    'AGENT_GUIDE canon — the INTERACTIVE CONTOUR: the place for questions is `interviews/` and nowhere else, showing is an ACTION rather than a link, and a question is SELF-SUFFICIENT — the subject of the decision is quoted INSIDE the question, never addressed by reference. The optional sugar on top is the /owner-reviews skill (HTML pages, one-click decisions, a send gate). MIGRATION: the rules bind immediately; the tooling is opt-in, and a project without it is not red.',
    'OPTIONAL module `.kaif/hooks/` — the mechanical half of context refresh for agent systems with lifecycle hooks (3 scripts by a live vendor contract). It SHIPS but is never activated for you: the machinery does not edit anyone else\'s settings.json, and a deployment without wiring never reddens. Wiring is the owner\'s explicit opt-in — the module README carries the exact steps.',
    // frozen literal: a dynamic version()/codename() here would rename HISTORY on the next bump
    'Release codename for this version: KAIF 2.2 — Yolden KAIF',
  ],
  // Same INERT rule as above: this key is read by the codename gate only once version() says 2.4.
  // The frozen codename line is APPENDED by the release phase (epic RL), never pre-created here.
  '2.4': [
    'Skill /end-chat is SPLIT into a pair (owner request, ideas/26 pp. 4–5 of the origin): NEW /end-chat-force — the urgent right-now closure that captures only what must not be lost (status + baton), commits AND pushes, and records the skipped ceremonies as an explicit debt line in STATUS.md; NEW /end-chat-soft — the advance-order closure: acknowledge in one line, finish the current work to a natural cut WITHOUT rushing, then run the full unhurried ceremonies (the old /end-chat body lives here). Phrases like "wrap up when you\'re done" are a SOFT order, never a command to drop the work now. The old /end-chat is RETIRED (see deprecations: an untouched copy is removed mechanically; an edited one becomes your task item). MIGRATION — agent work: if your wrapper documents or local skills reference /end-chat by name, re-point them to the pair.',
    'AGENT_GUIDE canon — WORKING UNTIL A NAMED TIME: a named end time for autonomous work ("work until 11", "for an hour", any loop duration) bounds the WORKING, not the closing — normal pace with no early finish out of deadline fear until the named time, and AT the named time START /end-chat-soft (natural cut, then full ceremonies). All four loop skills (/autoloop, /dayloop, /nightloop, /guarded-loop) defer to this rule.',
    'AGENT_GUIDE canon — THE CREED AND THE PRAYER (owner request, canonized from two field deployments): the guide now OPENS with two recite-aloud blocks between HTML markers — KAIF:CREED (believe in the product and the owner\'s vision; the deploying agent fills <AUTHOR> and renders it in the owner\'s language) and KAIF:PRAYER (16 thinking principles of PHILOSOPHY.md in prayer form + one boundary: Occam and Pareto never economize on what the owner sees). The agent says both in the chat on session entry, before any non-trivial task and on every context refresh; /resume carries the step. A prayer is an axiom: no attributions or justifications inside the blocks (owner\'s word).',
    'NEW optional skill /team-deployment (the version-defining feature of 2.4): design and deploy a TEAM of AI agents for a project — analyze the work profile, suggest an evidence-informed composition (roles, archetype, sizing — owner approves before anything deploys), then materialize it as isolated workspaces (git worktree reference) under a generated Team Constitution and a shared status board. Ships with three reference templates inside the skill (constitution with nine invariant sections, status board with the board-tool CONTRACT, roles library: 5 role contracts + 2 web-product archetypes). Methodology only — no orchestrator machinery: the project\'s agent builds the board/workplace tools to the contracts, same rule as /owner-reviews. Distilled from a live six-role field team; purely additive, nothing to merge, a deployment that never calls it never changes.',
    'Four field fixes from the 2.3 update reports, all mechanical: merge/replace preserves the FILE\'s end-of-line convention instead of silently rewriting it; step 4 of /report-bug is rephrased so an agent system\'s own safety classifier passes it; legitimately old version mentions can carry an inline justification marker for the stale-claims scan; the merge lines of `update` output name the module signatures they touch. Plus /owner-reviews hardening (owner requests): the contour\'s NAMED NEURAL VOICE is part of its identity — deploying the contour includes downloading the concrete speech engine and pinning ONE owner-chosen voice, the stock system voice is only a degraded fallback that announces itself in every call and leaves a recorded debt; multiple-choice questions to the owner ALWAYS render as radio buttons.',
    // frozen literal: a dynamic version()/codename() here would rename HISTORY on the next bump
    'Release codename for this version: KAIF 2.4 — Teamed Up KAIF',
  ],
  // INERT until version() says 2.5 (epic CN, 2026-09-04): the codename line is appended by epic RL.
  '2.5': [
    'AGENT_GUIDE canon — the authorization gate names its ONE carve-out inline (origin issue #37): a ticket about a defect of KAIF itself, filed to the framework\'s own origin, is delivered under the KAIF owner\'s standing authorization and does NOT wait for an AUTH: line — filed and delivered in the same motion, ahead of the work that found it. /report-bug step 4 says the same; templates A/B gain a `Delivered upstream:` line, and NOT YET is legal only on tracking: anonymous.',
    'PHILOSOPHY canon — THE FOURTH DOOR (origin issue #36, the owner\'s word: a fork is NOT the agent\'s to decide alone): an engineering fork (≥ 2 options + a non-zero price of error) is closed by recon of the domain\'s authorities or by the owner, never by the agent\'s own reasoning alone. AGENT_GUIDE adds the forced artifact at the decision point — `FORK: options · price of error · consulted` — and the recon-doc rule gains the fork as its second trigger; /fable-judge gains the fork-without-recon hunt.',
    'TESTING canon — gate 5 gains its SECOND HALF (origin issue #35, four field guards proved against the convenient fixture, none against the threat; the owner\'s machine hung): the broken version a guard is reddened against is NAMED with its distance from the threat — every guard declares `@guard` THREAT · PROVED-AGAINST · GAP · ON-REAL-PATH, a recorder declares `@forensic` EXPLAINS · DURABLE-AT (close / exit / trip-only rejected), and a guard is DONE only when observed on the real path. BUG_FIXING → Guards points to the block. NEW optional tool module .kaif/tools/kaif-guard-lint.mjs (check | selftest; advisory, fires only on explicit markers, SKIPPED=3 without any).',
    '/guarded-loop — the boundary is WRITTEN and CHECKED (origin issue #30: a run closed 25 minutes early under a fulfilled-looking pulse): the first pulse reads `armed until <ISO>`, .kaif/guarded-loop.json carries { "until" }, and Step 5 opens with the forced artifact `BOUNDARY: now · armed until · pool` — ceremony time is spent AFTER the boundary, never reserved before it; /fable-judge gains the early-finish hunt.',
    '/owner-reviews — I35 binds the voice to the LANGUAGE first, timbre second (origin issue #38): the route selects a voice whose culture matches .kaif/kaif.json → language, the system default only when it already matches, and drops to beeps + banner rather than speaking an unintelligible sentence; I36 names the fallback\'s own phrase normalization.',
    'DELIVERY ACCOUNTING (field request: 54 honest, green sessions moved the product 11 of 389 — no instrument asked whether work moved the owner\'s acceptance): MASTER_PLAN names ONE delivery metric; /end-chat-soft, /end-chat-force and the four loops open their report with the forced line `DELIVERY: <metric> X → Y; moved by: … | blocker: …`; /what-next ranks FIRST by the metric or a scarce-resource unblock — the newest pain is not a priority claim; /fable-judge gains the delivery-line hunt.',
    'BUG_FIXING canon — THE SEVERITY LADDER (field request: 65 % of 68 bug documents were defects OF the protection machinery): S1 harmed hardware / data / trust → the full package; S2 a run or an hour lost → document + guard, no epic, no new canon; S3 everything else → one EXPERIENCE line, no bug document; an incident never opens an epic by itself (the delivery test decides); a mechanized lesson collapses to one line + pointer.',
    'SIZE BUDGETS of the re-read core + PRAYER CADENCE (field request: a 5.8k-line core re-read hourly, STATUS at 6× its target): `check` now warns above a per-document line budget for all nine re-read-core documents (STATUS ~200 as before; the table lives in the core, advisory, never a failure); the prayer directive in AGENT_GUIDE carries the cadence as an owner setting — full text before every task (default) or once per session on entry.',
    'NEW machinery command `kaif-core report <ticket>` (epic SG; field: the delivery step of /report-bug as PROSE was refused twice by an agent-system classifier, which reacts to the subject, not the wording): delivers a bugs/KAIF ticket to the origin through `gh` under the KAIF owner\'s standing authorization (origin issue #15), appends the authorship trailer, writes the issue URL into the ticket\'s `Delivered upstream:` line; refusals named (tracking: anonymous · no gh · not a ticket · gh refused), a timeout is OUTCOME UNKNOWN never a refusal, --dry-run calls nothing. /report-bug step 4 now says "run it".',
    '/team-deployment — THE TEAM IN THE FIELD (epic TM; two live teams returned their gaps): an ADOPT path for an already-live team — NEW reference `team-adopt.md` (inventory against the invariants → matches / bring-to-canon / better-than-canon → the owner\'s decision → apply without overwriting the owner\'s words; two owner\'s words on one parameter → the project owner\'s wins, as a FORK:); the naming invariant states its one exception — the manager\'s seat IS the main copy; a third archetype `hardware-lab-small` (one physical singleton under test); the board knows FOUR states as roles (free · busy · blocked · offline) and its tool contract gains item 7 `audit-waiting` (a blocked row whose addressee is not working is an alarm, exit ≠ 0); the board LIVES OUTSIDE GIT (ignore-first, a snapshot travels to the retrospective, named opt-out); the stop ritual releases locks and waits; the retrospective also fires on dormancy; NEW reference `team-ci-template.md` — CI SHIPS WITH THE TEAM (the owner\'s order, origin issue #29): one job, three cheap gates read from the project\'s own commands, red blocks the merge, a non-GitHub remote gets the same job as a pre-push script.',
    'UPDATE SYMMETRIES (epic US; origin issues #27, #28, #31, #32; a second field team\'s ticket): an anchored block (the creed, the prayer — `<!-- KAIF:NAME:BEGIN/END -->`) arrives WHOLE or goes to the task as one `(anchored block KAIF:NAME)` item with the diff of all its carriers — never an END without its BEGIN, and a new module never lands inside a pair open on disk; `check` reddens a document carrying an unpaired anchor (a tree the 2.4 merge left with END-without-BEGIN turns red after this update — that red is the signal, restore the block by hand from the task diff); the wholesale verdict of every localized candidate prints WITH its numbers (`baseFound N of M, ceiling K → frozen | merged`) and `diff --source` RECORDS them in .kaif/update-rehearsal.json — the next update over that tree (or one given `--rehearsal <copy receipt>`) freezes any file whose live verdict differs (task item `verdict-mismatch`, both number sets; the receipt carries `verdicts`); the `stale-claims` item is UNCONDITIONAL on a version change (an empty scan says `no lines found`) and scans the project\'s own scripts (package.json, *.mjs/js/ts/sh/ps1/py/yml/toml; lock files excluded); a translated-wholesale file names its upstream path and a ready `git diff v<from> v<to> -- <src>`; NEW English files on a non-English deployment are listed (`language-arrivals`) and `check` counts the language mix of the skills (advisory); every deprecation names its SUCCESSOR and the kept ones are counted; `project-name` guidance precedes the act (the file form `--name-file` is named in both task items; a name that arrived mangled by the shell is refused before anything is recorded); the `placeholders` item names only the surfaces the final gate judges; an anonymous → origin switch names the kept files that still carry the anonymous wording (`mode-switch`); EOL convention is judged by dominance, not presence.',
    'THE SCENARIO FORM of an acceptance criterion (epic SF; origin issue #39 — the owner\'s word: "this is what I lacked in all my KAIF projects"): REQUIREMENTS_FRAMEWORK gains the optional four-line form — Situation · Action · Result · Check — the owner\'s language for a requirement, whose fourth line is the runnable test; Given/When/Then plus the machine check the agent era adds; EARS maps onto it (WHILE/WHEN → Situation/Action, "shall" → Result), Scale · Meter · Target live in the Check line; seven rules of form (three with ❌/✅ pairs; rules 1–6 and the line order are linted, rule 7 is the judge\'s); an owner-written Check may be empty (the agent fills it), an agent-edited Check during execution is judged like a weakened test. The four lines stand in /plan-task\'s criteria block and are named in /plan-epic, /propose-idea, /report-bug; /interview explains a mechanic scenario-first. NEW optional tool module .kaif/tools/kaif-scenario-lint.mjs (check | selftest; rules as data, keywords per language, SKIPPED=3 without a scenario). The form stays a project\'s choice — the canon never requires it.',
    // frozen literal (same rule as 2.3): the name is the owner's word — decision #87, interview #021 Q1, 2026-09-04 13:37 +03:00
    'Release codename for this version: KAIF 2.5 — Experienced KAIF',
  ],
  // INERT until version() says 2.6 (epic OQ, 2026-09-05): the codename line is appended by epic RL.
  '2.6': [
    'NEW optional canon document SYSTEMS_REGISTRY.md (skeleton .kaif/_systems-registry-template.md, bundle-only, the agent copies and drafts it) + the NEW non-mutating core command `delivery` — the delivery VECTOR: systems · complete % with its fraction · integrated % · holes · contradictions · bugs, every number derived from the tree (`--json` deterministic, `--system <name>` one system\'s fraction; exit 3 with the copy-the-skeleton instruction until the registry exists). The DELIVERY: line moved to the vector form in AGENT_GUIDE (the fable loop), MASTER_PLAN (Delivery vector block), the four loops, both closing ceremonies, /what-next and the /fable-judge call point, with a new `owed questions:` slot fed by the project\'s queue command; /report-bug: `Kind:` line (hole | contradiction | bug) in the bug-doc header; KAIF_REFERENCE §5 and §10.7 describe both.',
    'CONFUSION IS A RESEARCH TRIGGER, NOT A VERDICT (epic FK; origin issue #50, the owner\'s word): an owner\'s proposal that confuses the agent is a proposal not yet understood — never a wrong one. AGENT_GUIDE (both layers) and PHILOSOPHY (next to the three doors) carry the order the owner set — web search for what he most likely meant → a measurement over his own data → a question in interviews/ as a scenario; a message "your proposal breaks X / cannot / impossible / contradicts" is not sendable without a `Recon:` block (query · found · measurement); rolling back owner-ordered work because a guard went red is a fork in interviews/ with the guard\'s output quoted, never a report line, and the guard is not disarmed; the owner\'s term enters the rule as the worked example (the Cyrillic spelling of RPG is RPG, not a third tag). /interview gains step 3b (the pre-flight and the `Recon:` block); /fable-judge gains the hunt "confusion delivered as verdict".',
    'UPDATE ON THE REAL ROUTE (epic UR; origin issues #42 ×3, #48, #44, #40, #41): the rehearsal binding now reaches the BOOTSTRAP route — `install` accepts `--rehearsal <receipt>` (so `node KAIF-LOADER.mjs --lang <code> --rehearsal <copy>/.kaif/last-update.json` works), the loader validates every flag BEFORE it downloads anything (an unknown flag leaves the tree untouched — no more new core under an old marker), the auto record `.kaif/update-rehearsal.json` is consumed on that route too, and `diff --source` and `update` count ONE candidate set (owner-seeded documents excluded from both). HAND-FILLED SLOTS are DERIVED from the disk (`<BUILD_COMMAND>`, `<TEST_HARNESS>`, `<YOUR AGENT/MODEL>` … filled in the adaptation task): a file or module equal to "template + fills" is untouched — replaced mechanically with the fills kept, retired mechanically when deprecated; `update-verify` judges promised lines with the fills folded in; the map is cached in the deploy manifest as `fills`; a module already equal to the incoming template is never "upstream changed it". `stale-claims` sees ANY version older than the one being installed (a line stuck on an earlier version names it: `(asserts 2.2)`). `report` reads the `Delivered upstream:` line as a paragraph: `not yet` in any case, a URL or `#NN` = delivered (idempotent), a refusal names both legal forms. The bootstrap task renders module diffs with the OLD template texts (`−`/`+`), fetched from the previous release\'s artifact (`--baseline <dir>` offline). /kaif-update: the bootstrap route is MANDATORY for anchored pairs under a core older than 2.5; assets downloaded once for both runs (`--source <dir>`); `core.longpaths` on Windows.',
  ],
  // Same INERT rule as above: this key is read by the codename gate only once version() says 2.3.
  '2.3': [
    'The canon now speaks in COMMANDS (epic X, field issue #22): every obligation of a canon document carries one of three executable forms — a command to run, a numbered step with an exit condition, or a checkbox a ritual ticks — prose stays as the rationale UNDER the carrier and never carries an obligation alone; a new PROHIBITION enters the canon only rephrased as positive guidance or moved into a guard that reddens itself. MIGRATION: the rule binds the templates as they arrive; your local wrapper documents adopt it as you touch them.',
    'TESTING_FRAMEWORK rebuilt around the testing-activities chain (field issue #21): basis → named design techniques → written test documentation → execution with statuses → defect form; a [TESTED] mark on a FEATURE is legal only next to a written case set (one observation switches one CASE, never a feature); NEW delivery template .kaif/_testcases-template.md — copy it into your test-docs home (default testcases/) per feature. REQUIREMENTS_FRAMEWORK gained the writing checklist as its executable carrier.',
    '/experience now OPENS with the mechanization question (field issue #14): can this trap be removed or guarded instead of remembered? Every new entry carries one of three outcomes (mechanized: <tool> · no cheap mechanization because <reason> · subject-domain lesson); a trap-shaped lesson without the answer does not pass. A repeating lesson is a lesson that FAILED as text — two repeats mean a mechanism, there is no third reminder.',
    'Update machinery is CRASH-SAFE (field issues #19/#15): `update` writes a journal before its first mutation, a run killed mid-flight leaves a traceable tree, and the NEW `resume` command finishes what the dead run started; wiring kaif:* scripts SPLICES your package.json byte-exact instead of reserializing it (#16); the anonymous→origin transition is an explicit recorded step (#8); a bare github.com/owner/repo in --source resolves to release assets (#10); --lang Russian gets a code hint instead of a silent English tree (#3); the final install line counts what landed on DISK, not what the plan promised (#20); after the first network call the machinery never hard-exits — one error, not a libuv assertion on top (#10).',
    'The adaptation task now INSTALLS the owner-voice portrait decision (field issue #4): an owner-voice item with an EXECUTING checkpoint stands BEFORE goal-plan — the portrait question is settled before the first owner-facing text; the legal "none" outcome is the recorded `no voice portrait` line in AGENT_GUIDE. Language routing is now by AUDIENCE, never by directory (#6): "does the OWNER read this?" — epic meta-plans, MASTER_PLAN/STATUS, everything in interviews/ are owner-side; recon and executor detail stay English.',
    // frozen literal: a dynamic version()/codename() here would rename HISTORY on the next bump
    'Release codename for this version: KAIF 2.3 — Subjected KAIF',
  ],
};
// Flat notes for the CURRENT version stay in the meta for older cores reading a newer bundle.
const TEMPLATE_NOTES = TEMPLATE_NOTES_BY_VERSION[version()] || [];

// Artifacts RETIRED by this release that earlier releases deployed (plan 21 §3.5, field gap
// T10 — a mechanism that replaces another owns the cleanup of its predecessor). Each entry:
// { path, reason }. The core removes untouched instances mechanically and lists edited ones
// in the update task. Empty is the normal state.
const DEPRECATIONS = [
  { path: '.claude/skills/end-chat/SKILL.md',
    reason: 'split in 2.4 into /end-chat-force (urgent, no ceremonies, explicit debt line) + /end-chat-soft (advance order, full ceremonies at a natural cut)',
    // 2.5 (epic US, #32 R-D): every deprecation NAMES its successor — "retired" without "use X instead" sent a field agent hunting.
    successor: '/end-chat-soft (.claude/skills/end-chat-soft/SKILL.md) + /end-chat-force (.claude/skills/end-chat-force/SKILL.md)' },
];

// POLICY changes, by version (Reference §10.6; field gap 04-§6: 1.6 changed the language POLICY
// and the change dissolved into an ordinary diff — the owner learned about it on an audit).
// A rule change of the previous version is declared here and the update task surfaces it in a
// separate "decisions for the OWNER" section — never merged silently.
const POLICY_CHANGES_BY_VERSION = {
  // INERT until version() says 2.6 (epic OQ, 2026-09-05): read by the policy gate only on the 2.5→2.6 interval.
  '2.6': [
    'The delivery line is a DERIVED vector, never a question to the owner (2.6, epic OQ; origin owner decisions #97/#99 — the 2.5 line sent the agents of four freshly updated projects to their owners to learn what to measure): `DELIVERY:` now prints six numbers from `SYSTEMS_REGISTRY.md` — systems · complete % (always with its fraction) · integrated % · holes · contradictions · bugs — computed by the new non-mutating command `node .kaif/kaif-core.mjs delivery` (`--json`, `--system <name>`; exit 3 until the registry exists). The registry is the AGENT\'s job: copy `.kaif/_systems-registry-template.md` to `SYSTEMS_REGISTRY.md`, draft the product\'s logically separate systems from GOAL.md, MASTER_PLAN.md and both maps, print the vector from the draft at once; the owner approves the list as vision when ready. If this deployment opened an interview or a homework after 2.5 that puts the delivery metric to the owner as a question — CLOSE it and build the registry instead: the owner is never sent to define what the framework can derive. Bug documents gain an optional `**Kind:** hole | contradiction | bug` header line (no line = bug) so the three counters are yours to classify; the DELIVERY: line in AGENT_GUIDE, MASTER_PLAN, the four loops, both closing ceremonies, /what-next and the judge call point moved to the vector form, with a new `owed questions:` slot fed by the project\'s queue command.',
    'Confusion at a fork is a RESEARCH TRIGGER, never a verdict (2.6, epic FK; origin issue #50 — the owner\'s own rule): when the owner\'s proposal seems to break a model, a rule or a test you hold, the canon now orders web search → a measurement over the owner\'s data → a question in interviews/ — and a message "your proposal breaks X / cannot / impossible / contradicts" without a `Recon:` block (query · found · measurement) is a judge-hunted finding; rolling back owner-ordered work because a guard went red goes to interviews/ as a fork with the guard\'s output quoted, never into a report line. Your local canon may already carry a house rule of this shape — keep it; the shipped rule adds the order and the block form.',
    'Update machinery changed FOUR behaviours on the real route (2.6, epic UR; origin issues #42, #48, #44, #40): (1) the loader REFUSES an unknown flag before it downloads anything, and `install` takes `--rehearsal <receipt>` — a sandbox receipt binds the bootstrap route the same way it binds `update`; the auto record is consumed on both routes; (2) files that differ from their template ONLY by hand-filled slots (`<BUILD_COMMAND>`, `<TEST_HARNESS>`, the co-author line) are UNTOUCHED — they are replaced mechanically with the fills kept and retired mechanically when deprecated, so the three hand merges and one hand deprecation you did on every interval stop appearing in the task; the fills are derived from your disk and cached in `.kaif/deploy-manifest.json` as `fills`; (3) the `stale-claims` item lists lines asserting ANY version older than the one being installed — expect lines that three green updates never showed you (a badge stuck two releases back), each naming the version it asserts; (4) `report` accepts `not yet` in any case and a `#NN` as "delivered" — a hand-delivered pre-2.5 ticket no longer refuses, and a refusal names both legal forms.',
  ],
  // INERT until version() says 2.5 (epic CN, 2026-09-04): read by the policy gate only on the 2.4→2.5 interval.
  '2.5': [
    'Authorization gate carve-out: a ticket about a defect of KAIF ITSELF to the framework\'s own origin no longer waits for the owner\'s AUTH: line — it is delivered under the KAIF owner\'s standing authorization in the same motion as it is filed (origin issue #37). Every other outward action (releases, deploys, sends, force-pushes, deletions) still waits for the owner\'s quoted words.',
    'Forks are no longer the agent\'s to decide alone (origin issue #36, the fourth door): a choice with ≥ 2 options and a non-zero price of error carries a `FORK:` line at the decision point whose `consulted` slot names a domain authority, a recon doc or the owner — the agent\'s own reasoning alone is a judge-hunted finding. Variable names and the order of two lines are not forks.',
    'Gate 5 second half (origin issue #35): a guard is DONE only when it declares THREAT · PROVED-AGAINST · GAP · ON-REAL-PATH and has been observed on the path the owner actually runs; forensic recorders declare DURABLE-AT, and durability only at a clean ending is rejected. Advisory linter: .kaif/tools/kaif-guard-lint.mjs (opt-in, fires only on explicit markers).',
    'Guarded loops may not close before their armed boundary with a non-empty pool (origin issue #30): the BOUNDARY: line is printed before any closing ceremony and the clock decides, not the agent\'s estimate of the ceremonies.',
    'Incident response is SIZED (2.5, field request): the severity ladder S1 / S2 / S3 in BUG_FIXING_FRAMEWORK replaces "the full package for every defect" — S3 defects get one EXPERIENCE line and no bug document, S2 gets no epic and no new canon section, and an incident alone never opens an epic. Every session close and loop report now carries a DELIVERY: line against ONE owner metric named in MASTER_PLAN.md — fill that line in, or the judge hunts its absence. The prayer cadence is an owner setting in the AGENT_GUIDE directive (default unchanged: full text before every task).',
    'Delivery of KAIF-defect tickets is a MACHINERY command (2.5, epic SG): `node .kaif/kaif-core.mjs report <ticket>` performs the outward `gh issue create` under the standing authorization of origin issue #15 — allowlist that ONE command in your agent system\'s permission layer once; the skill text no longer carries the delivery procedure, only "run it". On tracking: anonymous the command refuses and the ticket stays local.',
    'Team deployments changed two defaults (2.5, epic TM): the status board `TEAM_STATUS.md` is session state OUTSIDE git — operation 3 adds it to .gitignore in the same motion (a tracked board is a named opt-out with its price stated in the constitution § 4); and CI ships with the team (origin issue #29) — a red `team-ci.yml` run on a role branch blocks the merge like a missing verifier\'s verdict. A live team is ADOPTED through the new adopt path, never overwritten by the templates.',
    'Update machinery changed FOUR behaviours (2.5, epic US): (1) `check` REDDENS a document whose anchored block is unpaired (END without BEGIN or the reverse — a tree that the 2.4 merge left broken turns red after this update: restore the block from the task diff; the weight of a two-headed document); (2) the `stale-claims` task item is UNCONDITIONAL on every version change and now scans the project\'s own scripts (package.json and script files) — a pin of the old version in a script is a task item, not a CI surprise; (3) a rehearsal BINDS the live run: what `diff --source` (or a sandbox copy\'s receipt via `--rehearsal`) recorded as `frozen` can no longer be merged live — a mismatch freezes the file and names both number sets (`verdict-mismatch`); (4) `project-name` refuses a name that ARRIVED mangled through the shell (replacement characters / question marks only) instead of recording it — use `--name-file` for non-ASCII names.',
  ],
  '1.6': ['Language policy: agent-facing documents are English by default; the owner\'s language covers owner-facing documents and chat (a wholesale-translated wrapper declares "i18n": "translated" in the marker instead of fighting this rule).'],
  '2.2': [
    'CLI safety (bug 33): a bare or flags-only `kaif-core.mjs` run prints help and touches NOTHING (the old default was `install` — it once overwrote a live update task in the field); unknown commands, flags and stray arguments now REFUSE instead of being silently ignored. Scripts relying on the old default must name `install` and its flags explicitly.',
    'Guard exit semantics (bug 34): unconfigured optional guards — kaif-canon-lint without rules, kaif-provenance without a canonArtifacts key — exit 3 "SKIPPED" instead of 0. CI that treats any non-zero exit as failure must handle 3 as "not configured, nothing proven".',
    'NEW key doc REQUIREMENTS_FRAMEWORK.md (the 14th) — the requirements canon: goal vector + acceptance criteria FIRST in every target document, the ten quality criteria (ISO/IEC/IEEE 29148 anchor), EARS patterns, fit criterion (Scale/Meter/Target), the stop-word dictionary. Universal, added mechanically; nothing to merge. Its executable form is the NEW optional tool module .kaif/tools/kaif-requirements-lint.mjs (check | selftest; advisory — a linter and a judge rubric, never a Definition-of-Ready turnstile; SKIPPED=3 when nothing to scan).',
    'AGENT_GUIDE canon — CONTEXT REFRESH: the re-read core is RE-READ, not remembered, at four triggers (the hour · before a heavy task · after compaction/pause · ritual points), and a refresh is a verifiable action with a two-part witness — the machine-readable marker .kaif/refresh-marker.json (ignored by git, like the other session state) plus a quote-acceptance in the chat; a marker without the quote is judge-hunted fraud of the false-[TESTED] class. Woven into 7 ritual skills by reference. NEW optional module .kaif/hooks/ makes it mechanical where the agent system has lifecycle hooks: session-start-refresh (order to re-read after compaction/clear), prompt-refresh-timer (marker older than 60 min → order; silent while fresh), stop-status-guard (work happened while STATUS went stale → ONE soft block per session), plus settings-fragment.json — the ready config sample. DECISION FOR THE OWNER: the files arrive mechanically, but ACTIVATION is yours — KAIF never edits your settings.json; merge the fragment into .claude/settings.json only if you want the hooks. A deployment without them never reddens: the markdown ritual is the complete contour on its own.',
    'AGENT_GUIDE canon — the ENVIRONMENT DOSSIER: a section the agent FILLS by probing its machine (six axes: OS/hardware · shells and encodings · toolchain incl. what tar/curl/find actually resolve to per shell · VCS policies · package managers · links to paid-for lessons), as a fact → value → probe table whose header carries the date taken, the regeneration command and the staleness rule (facts older than four weeks are hypotheses). The collection procedure is a step in /refresh-context — probe in EVERY shell separately, since the difference between shells is the point. MIGRATION — agent work: the section deploys with `— not probed yet —` values; run the probes once and fill it (a missing fact is honest, an invented one is a defect).',
  ],
  '2.3': [
    'Language packs FROZEN (owner decision #56, declared, not silent): only `ru` and `en` are maintained; the other eight packs (zh-Hans, es, hi, ar, pt, fr, de, ja) are frozen byte-exact at their 2.2 state — version, state and reason declared on the README, in the reference and in the install line itself; a frozen-language deployment keeps working exactly as in 2.2 and revives on community request. Nothing to merge; if your deployment uses one of the eight, expect English arrivals for anything new.',
  ],
  '2.4': [
    'Closure ceremonies changed shape: /end-chat no longer exists — /end-chat-soft is the default full closure (an advance order finishes the current work to a natural cut first), /end-chat-force is the urgent capture-and-go with a declared ceremonies debt. Scripts, docs or habits invoking /end-chat must switch to the pair.',
    'Timed autonomous runs changed contract: a named end time now means "work at NORMAL pace until the time, then START /end-chat-soft" — never "guarantee everything finished before the time". Agents used to finish early out of deadline fear; that early finish is now declared a violation of the order.',
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
  const renderMeta = (m) => `> **FILE: \`kaif-bundle-manifest.json\`** — bundle metadata (data for KAIF-CORE, never written to disk)\n\n` +
    FENCE + 'json\n' + JSON.stringify(m, null, 2) + '\n' + FENCE + '\n';
  blocks.push(renderMeta(meta));   // re-rendered at the end of this function, once every entry is known
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
  // the test-cases template (epic X 2.3, issue #21): same delivery shape as the portrait skeleton —
  // an artifact class with no shipped shape does not get written; the agent COPIES it into the
  // project's test-doc home (default testcases/), never fills it in place.
  if (existsSync(join(FW, 'templates', '_testcases-template.md')))
    blocks.push(embedBundle('framework/templates/_testcases-template.md', '.kaif/_testcases-template.md',
      'the test-cases template — TESTING_FRAMEWORK activities chain copies it into the project test-doc home and fills the copy'));
  // the systems-registry skeleton (2.6, epic OQ; owner decisions #97/#99): the delivery vector is
  // DERIVED from SYSTEMS_REGISTRY.md by `kaif-core delivery` and never asked of the owner — the
  // agent copies this skeleton to the project root and drafts the registry; same delivery shape as
  // the two skeletons above (bundle-only, optional; a deployment without a registry stays green).
  // the interactive-contour CONTRACT page (2.6, epic IC; owner decision №101 — origin issues #19/#38/#47/#51):
  // one page a session verifies in a minute before opening an owner-facing page; bundle-only, like the
  // other .kaif/_* skeletons — the long-form canon stays in the /owner-reviews skill
  if (existsSync(join(FW, 'templates', '_interactive-contour-spec.md')))
    blocks.push(embedBundle('framework/templates/_interactive-contour-spec.md', '.kaif/INTERACTIVE_CONTOUR_SPEC.md',
      'interactive-contour contract page — verbatim; the shipped generator implements it, a project contour is checked against it'));
  if (existsSync(join(FW, 'templates', '_systems-registry-template.md')))
    blocks.push(embedBundle('framework/templates/_systems-registry-template.md', '.kaif/_systems-registry-template.md',
      'the systems-registry skeleton — the agent copies it to SYSTEMS_REGISTRY.md and drafts the registry; `kaif-core delivery` prints the delivery vector from it'));
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
  // dest → src map (2.5, epic US): the update task names a translated-wholesale file's UPSTREAM
  // path and a ready `git diff v<from> v<to> -- <src>` against the origin — for i18n deployments
  // the diffs are the whole delivery, and "find the upstream file yourself" was work per file.
  // Sorted keys: the meta block is diffed and cached downstream (the canonical-ordering rule).
  meta.sources = Object.fromEntries(BUNDLE_ENTRIES.map(({ src, dest }) => [dest, src]).sort((a, b) => a[0].localeCompare(b[0])));
  blocks[0] = renderMeta(meta);
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
