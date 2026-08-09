#!/usr/bin/env node
// tools/check-framework.mjs — KAIF self-check (idea 01).
// Validates the generated KAIF.md so a silent breakage never ships a broken installer.
// Atomic: run any time via `npm test` (or `npm run kaif:check`); also invoked at the end of the build.
//
// Checks:
//   1. The number of embedded `> **FILE:` blocks == (guidance docs in framework/) + (skills in framework/skills/).
//   2. The 6-backtick fences are balanced, one pair per embedded block.
//   3. No unreplaced build markers ({{...}}) remain.
//   4. Every skill in framework/skills/ is embedded in KAIF.md.
import { readFileSync, readdirSync, existsSync, statSync as statSyncTop, cpSync, appendFileSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from './lib/temp-root.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

// ── Guard 5d — the owner's script must not live in EN payload BODIES ──────────────────────────
// §9.11 (bug 31): author examples inside pause/kaif-remove blinded the translated-wholesale net in
// three field projects at once (the net demands "no owner script in the incoming template body";
// the per-file translation test judges bodies the same way — KAIF-CORE.mjs `localizedAgainst`).
//
// COVERAGE IS COMPUTED, NOT ENUMERATED (bugs/66 finding №2). The previous form walked a FIXED LIST
// of three directories (`hooks`, `spheres`, `adapters`) written on the guard's birthday, so every
// surface born after it was blind: the narrative spines (`_intro.md`, `installer/_thin-intro.md`),
// the portrait skeleton, the audit-report template and the three fable-method references — seven
// addresses in which a Cyrillic line kept the build green. The walk below covers `framework/**`
// and a surface leaves coverage ONLY through a named exclusion with a reason, so a directory added
// tomorrow is guarded on the day it appears instead of on the day someone remembers the list.
const CYR = /[А-Яа-яЁё]/;
// Owner-seeded doc templates — the author's own voice lives there legitimately (KAIF_FRAMEWORK's
// birth note); the project fills them with its own state on deployment.
const OWNER_SEEDED_TPL = ['GOAL.md', 'STATUS.md', 'PROJECT_HISTORY.md', 'EXPERIENCE.md', 'MASTER_PLAN.md',
  'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'KAIF_FRAMEWORK.md'];
// Machinery whose Cyrillic IS data rather than leaked prose. Named FILE BY FILE on purpose:
// excusing "every .mjs" would silently un-guard each script the payload grows next.
const CYRILLIC_DATA_CARRIERS = [
  'tools/kaif-provenance.mjs',         // the RU analogues of the [AI]/[AI-ed] marks, as config examples
  'tools/kaif-requirements-lint.mjs',  // the RU half of the requirements stop-word dictionary
  'installer/KAIF-CORE.mjs',           // SCRIPTS (the writing-system regexes) + AUTHOR_TOKEN_CLUSTERS, as data
];
// The author's own name is an ATTRIBUTION, not a leaked example — it must stay in the bylines of
// the narrative spines. Exempted as FULL phrases: a bare token ("Кот") would excuse whole sentences.
const AUTHOR_NAME_RU = ['Николай Кривуша', 'Кот Криник'];
const stripFrontmatter = (t) => t.replace(/^---\r?\n[^]*?\r?\n---\r?\n/, '');

/** Every payload surface under `fwRoot` that guard 5d judges, as [relativePath, body] pairs. */
function payloadBodies(fwRoot) {
  const out = [];
  const walk = (dir) => {
    for (const n of readdirSync(dir).sort()) {          // sorted: findings must be order-stable
      const p = join(dir, n);
      if (statSyncTop(p).isDirectory()) { walk(p); continue; }
      const rel = relative(fwRoot, p).split('\\').join('/');
      // The localized halves themselves — there the owner's script IS the payload.
      if (rel.startsWith('templates/languages/')) continue;
      if (OWNER_SEEDED_TPL.includes(rel)) continue;
      if (CYRILLIC_DATA_CARRIERS.includes(rel)) continue;
      out.push([rel, stripFrontmatter(readFileSync(p, 'utf8'))]);
    }
  };
  walk(fwRoot);
  return out;
}

/** Findings of guard 5d over a framework root. Frontmatter is exempt (localized trigger phrases
 *  in `description:` are the trigger contract, and the body-based tests never judge the preamble). */
function scanPayloadCyrillic(fwRoot) {
  const found = [];
  for (const [rel, body] of payloadBodies(fwRoot)) {
    const lines = body.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      for (const name of AUTHOR_NAME_RU) line = line.split(name).join('');
      if (!CYR.test(line)) continue;
      found.push(`Cyrillic in an EN payload BODY: framework/${rel} (body-relative line ${i + 1}) — move the example to a language pack or rephrase (invariant §9.11, bug 31: it blinds the translation net)`);
      break;                                            // one finding per file: the fix is the file
    }
  }
  return found;
}

// A bilingual document is checked HALF BY HALF (bugs/65 №2). "The token occurs somewhere in the
// file" is a proxy: the pairs registry below literally promises BOTH halves, yet deleting the name
// from the Russian half alone left the lint green — a reader of that half is routed nowhere. Which
// documents have halves is COMPUTED from the `<a id="russian">` anchor (the same landmark
// showcase-lint and build-story-card split on), so a bilingual file added to the registry later
// gets the per-half check without anyone remembering to flag it, and a single-language file keeps
// being read as one whole.
const RU_ANCHOR = '<a id="russian">';
const segmentsOf = (body) => {
  const i = body.indexOf(RU_ANCHOR);
  return i < 0 ? [['', body]] : [[' (EN half)', body.slice(0, i)], [' (RU half)', body.slice(i)]];
};
/** Tokens absent from `body`, each labelled with the half it is missing from. */
function missingTokens(body, tokens) {
  const out = [];
  for (const [where, text] of segmentsOf(body))
    for (const t of tokens) if (!text.includes(t)) out.push({ where, token: t });
  return out;
}

// `--selftest`: a guard that never reddened proves nothing (BUG_FIXING_FRAMEWORK → Guards), and a
// guard nobody selftests rots by the very drift it watches (EXP-0075). Both answers are demanded
// (EXP-0059): red on the defect AND silence on what must not be touched. The mutation runs on a
// COPY in a unique temp root — never in the working tree (EXP-0077), and the canary text comes
// from this file's BODY, never through argv (AGENT_GUIDE → text travels through files).
const CANARY = 'Пример из личного черновика владельца — эта строка ослепляет сеть переводов.';
const CANARY_AUTHOR_ONLY = '> **Author:** Mikalai Kryvusha aka Николай Кривуша aka Кот Криник · MIT';
const CANARY_AUTHOR_PLUS = '> **Author:** Николай Кривуша — и его личный пример прозы внутри шаблона.';
// The seven addresses the fixed list could not see (bugs/66 Forensics row 2). Each must redden.
const FORMERLY_BLIND = [
  '_intro.md',
  'installer/_thin-intro.md',
  'templates/_owner-voice-template.md',
  'skills/code-revision/references/audit-report-template.md',
  'skills/fable-method/references/examples.md',
  'skills/fable-method/references/failure-modes.md',
  'skills/fable-method/references/flowcharts.md',
];
// …and what must STAY silent, or the guard would redden on its own payload.
const MUST_STAY_SILENT = ['templates/languages/ru/GOAL.md', 'GOAL.md', 'tools/kaif-requirements-lint.mjs'];

function selfProofPayloadCyrillic() {
  const fails = [];
  const sandbox = join(tempRoot('check-5d'), 'framework');
  cpSync(join(ROOT, 'framework'), sandbox, { recursive: true });

  const clean = scanPayloadCyrillic(sandbox);
  if (clean.length) fails.push(`чистая копия покраснела (${clean.length}): ${clean[0]}`);

  const mutate = (rel, text) => {
    const p = join(sandbox, ...rel.split('/'));
    const before = readFileSync(p, 'utf8');
    appendFileSync(p, `\n${text}\n`);
    const hit = scanPayloadCyrillic(sandbox).filter((e) => e.includes(`framework/${rel} `));
    cpSync(join(ROOT, 'framework', ...rel.split('/')), p);   // restore from the pristine source
    if (readFileSync(p, 'utf8') !== before) fails.push(`восстановление копии не побайтное: ${rel}`);
    return hit.length;
  };

  for (const rel of FORMERLY_BLIND) {
    if (mutate(rel, CANARY) !== 1) fails.push(`бывшая слепая зона НЕ покраснела: ${rel}`);
  }
  for (const rel of MUST_STAY_SILENT) {
    const p = join(sandbox, ...rel.split('/'));
    const before = readFileSync(p, 'utf8');
    appendFileSync(p, `\n${CANARY}\n`);
    const hit = scanPayloadCyrillic(sandbox).filter((e) => e.includes(`framework/${rel} `));
    cpSync(join(ROOT, 'framework', ...rel.split('/')), p);
    if (readFileSync(p, 'utf8') !== before) fails.push(`восстановление копии не побайтное: ${rel}`);
    if (hit.length) fails.push(`объявленное изъятие покраснело: ${rel}`);
  }
  // The author-name exemption is a FORM, not a licence: the byline stays silent, the same byline
  // with an owner sentence glued to it reddens.
  if (mutate('_intro.md', CANARY_AUTHOR_ONLY) !== 0) fails.push('подпись автора ошибочно покраснела');
  if (mutate('_intro.md', CANARY_AUTHOR_PLUS) !== 1) fails.push('изъятие имени автора извинило целое предложение');
  return fails;
}

// The per-half proof for guard 5e (bugs/65 №2). The mutation lives in a STRING read from the real
// README — the file is never written, so there is nothing to restore and nothing to lose
// (EXP-0077). Both sides are separate fixtures: a name deleted from one half must be named by the
// half it left, and the very rename the field produced (AUTHOR_STYLOMETRY.md → OWNER_VOICE.md,
// same owner, two deployments) is what gets applied.
const HALF_TOKEN = 'AUTHOR_STYLOMETRY.md';
function selfProofHalves() {
  const fails = [];
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const i = readme.indexOf(RU_ANCHOR);
  if (i < 0) { fails.push('README потерял якорь половин — ось ослепла по построению'); return fails; }
  if (missingTokens(readme, [HALF_TOKEN]).length) fails.push('чистый README покраснел');
  const en = readme.slice(0, i), ru = readme.slice(i);
  const strip = (s) => s.split(HALF_TOKEN).join('OWNER_VOICE.md');
  const goneFromEn = missingTokens(strip(en) + ru, [HALF_TOKEN]);
  const goneFromRu = missingTokens(en + strip(ru), [HALF_TOKEN]);
  if (!(goneFromEn.length === 1 && goneFromEn[0].where.includes('EN')))
    fails.push(`вымарывание из EN-половины не названо ею: ${JSON.stringify(goneFromEn)}`);
  if (!(goneFromRu.length === 1 && goneFromRu[0].where.includes('RU')))
    fails.push(`вымарывание из RU-половины не названо ею: ${JSON.stringify(goneFromRu)}`);
  // …и второй ответ (EXP-0059): одноязычный документ читается ЦЕЛИКОМ, ось не удваивает на нём
  // ни находки, ни молчание.
  if (missingTokens(`no anchor here, routes to ${HALF_TOKEN}`, [HALF_TOKEN]).length)
    fails.push('одноязычный документ с токеном ложно покраснел');
  if (missingTokens('no anchor here, no token', [HALF_TOKEN]).length !== 1)
    fails.push('одноязычный документ БЕЗ токена не покраснел');
  return fails;
}

if (process.argv.includes('--selftest')) {
  const fails = selfProofPayloadCyrillic();
  for (const f of fails) console.error('✖ selfproof 5d: ' + f);
  const halfFails = selfProofHalves();
  for (const f of halfFails) console.error('✖ selfproof 5e (bugs/65 №2): ' + f);
  if (fails.length || halfFails.length) {
    console.error(`\n❌ check-framework --selftest: ${fails.length + halfFails.length} провалов (гард 5d — bugs/66 №2, гард 5e — bugs/65 №2)`);
    process.exit(1);
  }
  const covered = payloadBodies(join(ROOT, 'framework')).length;
  console.log(`✅ гард 5d: охват ВЫЧИСЛЯЕТСЯ — ${covered} поверхностей поставки; ${FORMERLY_BLIND.length} бывших слепых зон краснеют, ${MUST_STAY_SILENT.length} изъятия молчат, подпись автора не извиняет предложение`);
  console.log(`✅ гард 5e: половины судятся ПОРОЗНЬ — вымарывание «${HALF_TOKEN}» краснеет из КАЖДОЙ половины README поимённо, одноязычный документ читается целиком`);
  process.exit(0);
}

// Since 1.5 the root KAIF.md is the THIN entry point; the full self-extracting core
// (whose embedded blocks these checks validate) is the offline asset dist/KAIF-FULL.md.
const fwPath = join(ROOT, 'dist', 'KAIF-FULL.md');
if (!existsSync(fwPath)) {
  console.error('❌ dist/KAIF-FULL.md not found — run `node tools/build-framework.mjs` first.');
  process.exit(1);
}
const fw = readFileSync(fwPath, 'utf8');

// The root thin entry point: exactly ONE embedded FILE block (the loader), no build markers.
const rootThinPath = join(ROOT, 'KAIF.md');
if (!existsSync(rootThinPath)) errors.push('root KAIF.md (thin entry point) missing');
else {
  const thinRoot = readFileSync(rootThinPath, 'utf8');
  const b = (thinRoot.match(/^> \*\*FILE:/gm) || []).length;
  if (b !== 1) errors.push(`root thin KAIF.md must embed exactly 1 FILE block (the loader), found ${b}`);
  if (thinRoot.match(/\{\{[^}]+\}\}/)) errors.push('unreplaced build markers in root KAIF.md');
}

// Expected embedded files = key-doc templates + directory-README templates + skill templates.
const docNames = ['AGENT_GUIDE.md', 'PHILOSOPHY.md', 'BUG_FIXING_FRAMEWORK.md', 'TESTING_FRAMEWORK.md',
                  'REQUIREMENTS_FRAMEWORK.md',
                  'STATUS.md', 'PROJECT_HISTORY.md', 'EXPERIENCE.md', 'GOAL.md', 'MASTER_PLAN.md',
                  'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md',
                  'KAIF_FRAMEWORK.md', 'KAIF_REFERENCE.md'];
const docs = docNames.filter((d) => existsSync(join(ROOT, 'framework', d)));
const readmesDir = join(ROOT, 'framework', 'readmes');
const readmes = existsSync(readmesDir)
  ? readdirSync(readmesDir).filter((n) => n.endsWith('.md')).map((n) => n.replace(/\.md$/, ''))
  : [];
const skillsDir = join(ROOT, 'framework', 'skills');
const skills = existsSync(skillsDir)
  ? readdirSync(skillsDir).filter((n) => existsSync(join(skillsDir, n, 'SKILL.md')))
  : [];
// Embedded tool files (the mechanical unpacker, added in 1.2).
const tools = ['kaif-unpack.mjs'].filter((t) => existsSync(join(ROOT, 'framework', t)));
const expected = docs.length + readmes.length + skills.length + tools.length;

// 1. FILE blocks
const fileBlocks = (fw.match(/^> \*\*FILE:/gm) || []).length;
if (fileBlocks !== expected) {
  errors.push(`embedded FILE blocks: found ${fileBlocks}, expected ${expected} (${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${tools.length} tools)`);
}

// 2. 6-backtick fences balanced, one pair per block
const fences = (fw.match(/^``````/gm) || []).length;
if (fences % 2 !== 0) errors.push(`6-backtick fences unbalanced (odd count: ${fences})`);
else if (fences / 2 !== expected) errors.push(`fence pairs ${fences / 2} != embedded blocks ${expected}`);

// 3. no unreplaced build markers
const markers = fw.match(/\{\{[^}]+\}\}/g);
if (markers) errors.push(`unreplaced build markers: ${[...new Set(markers)].join(', ')}`);

// 4. every skill embedded
for (const s of skills) {
  if (!fw.includes(`.claude/skills/${s}/SKILL.md`)) errors.push(`skill not embedded in KAIF.md: ${s}`);
}

// 5. every directory README embedded
for (const r of readmes) {
  if (!fw.includes(`${r}/README.md`)) errors.push(`directory README not embedded in KAIF.md: ${r}/README.md`);
}

// 5b. [TESTED: 2026-07-27 · both tripwires proven red on deliberately broken templates, green after restore]
//     Template contract tripwires (bug 19 — a closed defect leaves a guard):
//     <COMMIT_COMMAND> is never used with an appended message argument (its filled value
//     carries the <msg> slot); the /release template names the PROJECT, not the KAIF brand.
for (const s of skills) {
  const t = readFileSync(join(skillsDir, s, 'SKILL.md'), 'utf8');
  if (/<COMMIT_COMMAND>\s+"/.test(t))
    errors.push(`skill ${s}: <COMMIT_COMMAND> used with an appended argument — the contract is a <msg> slot inside the filled value (bug 19.1)`);
}
if (skills.includes('release')) {
  const relTpl = readFileSync(join(skillsDir, 'release', 'SKILL.md'), 'utf8');
  if (relTpl.includes('"what KAIF is"'))
    errors.push('release template leaks the KAIF brand ("what KAIF is") — must say "what <PROJECT_NAME> is" (bug 19.2)');
}

// 5c. [TESTED: 2026-07-28 · proven red on a deliberately edited root copy, green after rebuild]
//     Root KAIF_REFERENCE.md is a GENERATED verbatim copy of framework/KAIF_REFERENCE.md
//     (owner decision 2026-07-28: the reference is a root document of the source repo too).
//     Guard: banner + byte-identical body — a drifted copy is the bugs/09 class reborn.
{
  const rootRef = join(ROOT, 'KAIF_REFERENCE.md');
  if (!existsSync(rootRef)) {
    errors.push('root KAIF_REFERENCE.md missing — run the build (it generates the copy of framework/KAIF_REFERENCE.md)');
  } else {
    const body = readFileSync(rootRef, 'utf8').replace(/\r\n/g, '\n').replace(/^<!--[^]*?-->\n/, '');
    const src = readFileSync(join(ROOT, 'framework', 'KAIF_REFERENCE.md'), 'utf8').replace(/\r\n/g, '\n');
    if (body !== src)
      errors.push('root KAIF_REFERENCE.md diverged from framework/KAIF_REFERENCE.md — never edit the root copy; edit the source and rebuild');
  }
}

// 5d. The owner's script in EN payload bodies — the scan itself lives at the top of this file
//     (constants, walk and `--selftest` together), because its coverage is COMPUTED and the
//     selftest that proves it has to run before the dist artifacts are read. Here it is only
//     invoked, so that the ordering of the numbered checks stays readable.
errors.push(...scanPayloadCyrillic(join(ROOT, 'framework')));

// 5e. [TESTED: 2026-08-07 · proven red against the pre-fix HEAD blobs (23 findings across the
//     8 KLAS-D10 desync rows) and green after the content fixes — see bugs/38]
//     The BUNDLE lint (bugs/38): the truth↔mirror pairs registry, applied to the bundle itself.
//     The 2.1 field audit (KLAS D10) found eight desyncs INSIDE one shipped delivery: a doc
//     introduced a norm its leading skill never learned, the canon didn't know a new entity,
//     the source repo's internal backlog numbers leaked downstream, release notes promised a
//     clause no template carried. One row per guarded pair; drift is caught only by checking
//     pairs — never by reading one file. A new release-note promise adds its row HERE.
{
  const readT = (p) => readFileSync(join(ROOT, ...p.split('/')), 'utf8');
  // "document/notes norm → the file that must carry it" — tokens are FULL unique strings
  // (a short pattern happily matches someone else's line and stays green while truth rots)
  const PAIRS = [
    // BOTH sides of the leading pair are pinned (judge finding: a one-sided lint reads only
    // the mirror — editing the TRUTH doc would leave a dead pair green)
    ['EXPERIENCE.md norms (truth side)', 'framework/EXPERIENCE.md',
      ['REQUIRED since 2.1', '**Trigger:**', 'mechanized: <the tool>']],
    ['EXPERIENCE.md norms ↔ /experience skill', 'framework/skills/experience/SKILL.md',
      ['REQUIRED since 2.1', '**Trigger:**', 'mechanized: <the tool>']],
    ['re-read list ↔ TESTING_FRAMEWORK (KLAS D10: the doc ships but the list forgot it)', 'framework/AGENT_GUIDE.md',
      ['    - TESTING_FRAMEWORK.md']],
    ['canon ↔ PROJECT_HISTORY (the chronicle the update task demands migration into)', 'framework/AGENT_GUIDE.md',
      ['PROJECT_HISTORY.md']],
    ['2.1 notes ↔ pairs-registry rebuild clause', 'framework/AGENT_GUIDE.md',
      ['never patched in place']],
    ['help-kaif "go deeper" ↔ the authoritative reference', 'framework/skills/help-kaif/SKILL.md',
      ['**Where to go deeper.** Point to `.kaif/KAIF_REFERENCE.md`']],
    ['task-choice entry points ↔ the planning ladder', 'framework/skills/refresh-context/SKILL.md',
      ['/plan-task', '/plan-epic']],
    ['task-choice entry points ↔ the planning ladder', 'framework/skills/what-next/SKILL.md',
      ['/plan-task', '/plan-epic']],
    ['autonomy entry point ↔ /guarded-loop (2.1 skill must stay wired)', 'framework/AGENT_GUIDE.md',
      ['/guarded-loop']],
    // T4 (2.2, owner decision #39): the portrait's canonical filename must be reachable from EVERY
    // surface that routes an agent to it — a nameless portrait shipped twice in the field under two
    // different names (nikolai_stylometry.md and OWNER_VOICE.md, same owner, two deployments)
    ['portrait canon name ↔ /owner-voice (payload)', 'framework/skills/owner-voice/SKILL.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ /owner-voice (wrapper)', '.claude/skills/owner-voice/SKILL.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ the shipped skeleton header', 'framework/templates/_owner-voice-template.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ AGENT_GUIDE router (payload)', 'framework/AGENT_GUIDE.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ AGENT_GUIDE router (wrapper)', 'AGENT_GUIDE.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ KAIF_REFERENCE', 'framework/KAIF_REFERENCE.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ README (both halves)', 'README.md',
      ['AUTHOR_STYLOMETRY.md']],
    // O5 criterion 5, TWO outcomes only (bugs/72): a hook contract is either CONFIRMED against a
    // live vendor doc or it says "not verified" — "probably works" is the retired third outcome.
    // Grok Build runs our config and its NATIVE contract calls these events passive, so the
    // injection half is unverified; both tables that a field owner reads must SAY so, in the cell
    // he scans and not in prose twelve lines below it. The retired ✅ form is forbidden below.
    ['Grok Build injection caveat ↔ hooks module README', 'framework/hooks/README.md',
      ['injection not verified']],
    ['Grok Build injection caveat ↔ adapters index', 'framework/adapters/_index.md',
      ['injection not verified']],
    // The RECON MAP ↔ the DELIVERY (bugs/72 №5). The map promised Antigravity "two of three" with
    // a STATUS guard, while the sample deliberately ships one hook and suite s14 asserts the guard
    // is ABSENT — a map read as a promise sends a field owner looking for a hook we refused to
    // write. Guarded from the map's side, because the delivery's side is already asserted by s14.
    ['recon map ↔ delivery (Antigravity STATUS guard is NOT shipped)',
      'researches/19_epic_O_refresh_mechanisms_and_env_dossier.md',
      ['блокирующее значение не верифицировано']],
  ];
  // Per-half judging (bugs/65 №2) — `missingTokens`/`segmentsOf` and their `--selftest` live at
  // the top of this file, so the proof runs before any dist artifact is read.
  for (const [pair, file, tokens] of PAIRS) {
    let body; try { body = readT(file); } catch { errors.push(`bundle lint: ${file} unreadable (pair "${pair}")`); continue; }
    for (const { where, token } of missingTokens(body, tokens))
      errors.push(`bundle lint (bugs/38): pair "${pair}" broken — ${file}${where} does not carry "${token}"`);
  }
  // T4, the NEGATIVE half of criterion 1 ("a grep of the old nameless description = 0"). Kept out
  // of FORBIDDEN on purpose: that sweep walks framework/** only, while the nameless formula also
  // lives in the wrapper. Full literal strings, not short patterns — the routers must NAME the file.
  const NAMELESS = [
    ['framework/AGENT_GUIDE.md', ['portrait if one is taken', 'portrait, if one is taken']],
    ['AGENT_GUIDE.md', ['портрет голоса владельца, если он снят', 'портрет голоса владельца, если снят']],
  ];
  for (const [file, olds] of NAMELESS) {
    let body; try { body = readT(file); } catch { errors.push(`T4 lint: ${file} unreadable`); continue; }
    for (const o of olds) if (body.includes(o))
      errors.push(`T4 (plans/34): ${file} still carries the NAMELESS portrait formula "${o}" — the router must name AUTHOR_STYLOMETRY.md`);
  }
  // The source repo's internal coordinates must not leak downstream: a backlog number or a
  // superseded path is a dangling reference in every deployed project (KLAS D10).
  const FORBIDDEN = [
    [/\(idea \d+ §\d+\)|\(drive-by, idea \d+/, "the source repo's internal backlog numbering"],
    [/plans\/homework_/, 'the pre-homeworks/ homework path (superseded by the homeworks/ directory)'],
    // A retired decision becomes a FORBIDDEN formulation (BUG_FIXING_FRAMEWORK → Guards). This one
    // read "✅ same path" in two capability tables and told a field owner that Grok Build's context
    // injection is confirmed, while the research it came from records the opposite as an open
    // question (bugs/72). The positive half — the literal "injection not verified" — is a guarded
    // pair above; this is its negative half, so the row cannot quietly go back to a ✅.
    [/✅ same path/, 'the retired third outcome for an unverified hook contract ("probably works" — O5 criterion 5, bugs/72)'],
  ];
  // the sweep walks the WHOLE payload (judge finding: docs+readmes+skills alone left spheres/
  // adapters/templates/installer unguarded — a future leak there would ship silently)
  const { statSync: statS, readdirSync: readdirS } = await import('node:fs');
  const payloadBodies = [];
  const walkPayload = (dir) => {
    for (const n of readdirS(join(ROOT, dir))) {
      const rel = `${dir}/${n}`;
      if (statS(join(ROOT, rel)).isDirectory()) { walkPayload(rel); continue; }
      if (/\.(md|mjs)$/i.test(n)) payloadBodies.push([rel, readFileSync(join(ROOT, rel), 'utf8')]);
    }
  };
  walkPayload('framework');
  for (const [name, body] of payloadBodies)
    for (const [re, why] of FORBIDDEN)
      if (re.test(body)) errors.push(`bundle lint (bugs/38): ${name} leaks ${why} (${re})`);
  // Order guard: in /check-backlog the "Decisions made without the owner" precondition must be
  // WRITTEN BEFORE the `git mv` action — a weak model executes in written order (KLAS D10).
  try {
    const cb = readT('framework/skills/check-backlog/SKILL.md');
    const iPre = cb.indexOf('Decisions made without the owner');
    const iAct = cb.indexOf('git mv bugs/13');
    if (iPre < 0 || iAct < 0 || iPre > iAct)
      errors.push('bundle lint (bugs/38): /check-backlog states the DONE-tag precondition AFTER the git mv action (or not at all) — a weak model renames before checking');
  } catch { errors.push('bundle lint: framework/skills/check-backlog/SKILL.md unreadable'); }
}

// 5f. The pack-staleness guard (bugs/44, решение №44): реестр пар «истина↔зеркало»,
//     применённый к языковым пакетам. Файл пакета — ЛОКАЛИЗАЦИЯ EN-шаблона; когда EN-сторона
//     меняется, дрейф раньше не ловил никто (поле: «абзац Taste-class есть в английском
//     homeworks/README.md и отсутствует во ВСЕХ ДЕВЯТИ языковых пакетах»). Sha EN-истоков
//     ПИНУЮТСЯ в framework/templates/_lang-pack-source-shas.json (ВНЕ languages/ — всё под
//     languages/ встраивается в бандл, а пин-реестр — внутренность истока, не поставка);
//     изменившийся EN-шаблон краснит сборку, пока пакеты не ресинканы (или пин сознательно
//     передвинут ТЕМ ЖЕ коммитом — та самая «сознательная» правка, которой требует доктрина
//     реестра пар). Пер-файловые пары без порогов — вырожденных N не существует (EXP-0019).
{
  const { createHash: ch5f } = await import('node:crypto');
  const { statSync: st5f } = await import('node:fs');
  const langRoot5f = join(ROOT, 'framework', 'templates', 'languages');
  const PIN_PATH = join(ROOT, 'framework', 'templates', '_lang-pack-source-shas.json');
  const normSha5f = (p) => ch5f('sha256').update(readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
  const srcOf = (dest) => dest.endsWith('/README.md') ? `readmes/${dest.slice(0, -'/README.md'.length)}.md` : dest;
  const destLangs = new Map();   // dest (pack-relative) → [langs carrying it]
  if (existsSync(langRoot5f)) {
    for (const lang of readdirSync(langRoot5f)) {
      const ldir = join(langRoot5f, lang);
      if (!st5f(ldir).isDirectory()) continue;
      const walk = (dir, rel) => {
        for (const n of readdirSync(dir)) {
          const p = join(dir, n);
          const r = rel ? `${rel}/${n}` : n;
          if (st5f(p).isDirectory()) { walk(p, r); continue; }
          if (r === 'skill-triggers.json') continue;   // машинерия алиасов, не локализация шаблона
          if (!destLangs.has(r)) destLangs.set(r, []);
          destLangs.get(r).push(lang);
        }
      };
      walk(ldir, '');
    }
  }
  if (destLangs.size) {
    let pins = null;
    if (!existsSync(PIN_PATH)) errors.push('pack-staleness (bugs/44): framework/templates/_lang-pack-source-shas.json missing — pin the EN sources of every localized template');
    else { try { pins = JSON.parse(readFileSync(PIN_PATH, 'utf8')); } catch { errors.push('pack-staleness: _lang-pack-source-shas.json is not valid JSON'); } }
    if (pins) {
      for (const [dest, inLangs] of [...destLangs.entries()].sort()) {
        const src = srcOf(dest);
        const srcAbs = join(ROOT, 'framework', ...src.split('/'));
        if (!existsSync(srcAbs)) { errors.push(`pack-staleness: pack file "${dest}" has no EN source at framework/${src}`); continue; }
        const sha = normSha5f(srcAbs);
        if (!pins[dest]) errors.push(`pack-staleness (bugs/44): no pin for "${dest}" — sync its ${inLangs.length} pack file(s), then add to _lang-pack-source-shas.json: "${dest}": "${sha}"`);
        else if (pins[dest] !== sha)
          errors.push(`pack-staleness (bugs/44): EN template framework/${src} changed since the packs were last synced — re-sync its localization in ${inLangs.length} pack(s) [${inLangs.join(', ')}] (or consciously re-pin) and update _lang-pack-source-shas.json in the SAME commit: "${dest}": "${sha}"`);
      }
      for (const k of Object.keys(pins)) if (!destLangs.has(k))
        errors.push(`pack-staleness: orphan pin "${k}" in _lang-pack-source-shas.json — no pack carries this file anymore`);
    }
  }
}

// 6. dist/ — the Thin-KAIF install artifacts (1.5+). Validated when present (the build
//    always emits them; a checkout missing dist/ predates 1.5 and skips cleanly).
const distDir = join(ROOT, 'dist');
let distNote = '';
if (existsSync(distDir)) {
  const { createHash } = await import('node:crypto');
  const dread = (n) => readFileSync(join(distDir, n), 'utf8');
  const dsha = (n) => createHash('sha256').update(readFileSync(join(distDir, n))).digest('hex');
  for (const n of ['KAIF.md', 'KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md', 'kaif-manifest.json', 'KAIF-FULL.md'])
    if (!existsSync(join(distDir, n))) errors.push(`dist artifact missing: dist/${n}`);
  if (!errors.some((e) => e.startsWith('dist artifact'))) {
    const thin = dread('KAIF.md');
    const thinBlocks = (thin.match(/^> \*\*FILE:/gm) || []).length;
    if (thinBlocks !== 1) errors.push(`thin dist/KAIF.md must embed exactly 1 FILE block (the loader), found ${thinBlocks}`);
    if (thin.match(/\{\{[^}]+\}\}/)) errors.push('unreplaced build markers in dist/KAIF.md');
    const bundle = dread('KAIF-CORE-BUNDLE.md');
    const bundleBlocks = (bundle.match(/^> \*\*FILE:/gm) || []).length;
    // manifest block + (docs − unpacker) + readmes + skills + skill references + spheres
    const refs = skills.reduce((a, n) => {
      const rd = join(skillsDir, n, 'references');
      return a + (existsSync(rd) ? readdirSync(rd).filter((f) => f.endsWith('.md')).length : 0);
    }, 0);
    const spheres = readdirSync(join(ROOT, 'framework', 'spheres')).filter((f) => f.endsWith('.md')).length;
    const { statSync } = await import('node:fs');
    const langRoot = join(ROOT, 'framework', 'templates', 'languages');
    const countFiles = (dir) => existsSync(dir) ? readdirSync(dir).reduce((a, n) => {
      const p = join(dir, n);
      return a + (statSync(p).isDirectory() ? countFiles(p) : 1);
    }, 0) : 0;
    const langFiles = countFiles(langRoot);
    const toolsDir2 = join(ROOT, 'framework', 'tools');
    const toolMods = existsSync(toolsDir2) ? readdirSync(toolsDir2).filter((f) => f.endsWith('.mjs')).length : 0;
    // the optional refresh-hooks module (epic O, 2.2): every FILE in framework/hooks/ ships to
    // .kaif/hooks/ (the filter mirrors the build's — a stray directory is ignored by both sides)
    const hooksDir = join(ROOT, 'framework', 'hooks');
    const hookFiles = existsSync(hooksDir)
      ? readdirSync(hooksDir).filter((f) => statSyncTop(join(hooksDir, f)).isFile()).length : 0;
    // root-level framework/templates/*.md are embedded as .kaif/ payloads (e.g. the owner-voice
    // portrait skeleton); languages/ underneath is counted separately as lang-pack files
    const tmplDir = join(ROOT, 'framework', 'templates');
    const tmpls = existsSync(tmplDir) ? readdirSync(tmplDir).filter((f) => f.endsWith('.md')).length : 0;
    const wantBundle = 1 + docs.length + readmes.length + skills.length + refs + spheres + toolMods + hookFiles + tmpls + langFiles;
    if (bundleBlocks !== wantBundle)
      errors.push(`bundle FILE blocks: found ${bundleBlocks}, expected ${wantBundle} (1 manifest + ${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${refs} refs + ${spheres} spheres + ${toolMods} tool modules + ${hookFiles} hook files + ${tmpls} templates + ${langFiles} lang-pack files)`);
    const man = JSON.parse(dread('kaif-manifest.json'));
    for (const n of ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md'])
      if (man.sha256[n] !== dsha(n)) errors.push(`kaif-manifest.json sha256 stale for ${n} — re-run the build`);

    // 7. [TESTED: 2026-07-27 · guard proven on a broken version: wrong codename → exit 1 with the
    //    right reason; restored → exit 0]
    //    The release asserts its OWN version (bug 10 — six of eight field reports were misled
    //    by 1.6 shipping notes/headers that said "KAIF 1.5 — Tested KAIF"):
    //    (a) templateNotes in the bundle manifest must name the current version+codename and
    //        must not name any OTHER version's codename line;
    //    (b) the machinery sources (CORE/LOADER) must stay version-NEUTRAL — no baked-in
    //        "KAIF X.Y — Codename" header that goes stale the moment a release ships.
    // BOM-tolerant read: Windows tools (PowerShell 5 Out-File) prepend a BOM (EXP-0007).
    const vjson = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8').replace(/^﻿/, ''));
    const expectCodenameLine = `KAIF ${vjson.major}.${vjson.minor} — ${vjson.codename}`;
    if (!vjson.codename) errors.push('version.json has no "codename" — the release codename must live there (single source)');
    const metaMatch = bundle.match(/> \*\*FILE: `kaif-bundle-manifest\.json`\*\*[^\n]*\r?\n\r?\n``````json\r?\n([\s\S]*?)\r?\n``````/);
    if (!metaMatch) errors.push('bundle manifest block not found for the template-notes check');
    else {
      const notes = (JSON.parse(metaMatch[1]).templateNotes || []).join('\n');
      if (!notes.includes(expectCodenameLine))
        errors.push(`templateNotes do not name the current release ("${expectCodenameLine}") — rewrite TEMPLATE_NOTES in tools/build-framework.mjs for THIS release`);
      const foreign = [...notes.matchAll(/KAIF \d+\.\d+ — [^\n(]+/g)].map((m) => m[0].trim()).filter((s) => s !== expectCodenameLine);
      if (foreign.length) errors.push(`templateNotes name a different release's codename: ${foreign.join(' · ')}`);
    }
    for (const [src, label] of [['framework/installer/KAIF-CORE.mjs', 'KAIF-CORE.mjs'],
                                ['framework/installer/KAIF-LOADER.mjs', 'KAIF-LOADER.mjs']]) {
      const head = readFileSync(join(ROOT, src), 'utf8').split(/\r?\n/).slice(0, 5).join('\n');
      const stale = head.match(/KAIF \d+\.\d+ — /);
      if (stale) errors.push(`${label} header bakes in a version-codename ("${stale[0]}…") — machinery headers must be version-neutral`);
    }
    distNote = ` · dist OK (bundle ${bundleBlocks} blocks, sha256 fresh, notes name ${expectCodenameLine})`;

    // 8. The module map (plan 21 §3.1): present, COMPLETE (every md block of the bundle mapped),
    //    FRESH (signatures + sha match a re-split of the bundle's own content), classes valid.
    //    The splitter comes from the same lib the build uses — one algorithm, no drift.
    if (!existsSync(join(distDir, 'kaif-module-map.json'))) {
      errors.push('dist artifact missing: dist/kaif-module-map.json — re-run the build');
    } else {
      const { splitModules, MODULE_CLASSES } = await import('./module-map-lib.mjs');
      const mm = JSON.parse(dread('kaif-module-map.json'));
      // \r?\n throughout: an LF-only regex silently matched ZERO blocks on a CRLF-mangled bundle
      // and the whole section reported a hollow green (review-caught) — hence also the
      // zero-blocks tripwire below.
      const blockRe = /^> \*\*FILE: `([^`]+)`\*\*[^\n]*\r?\n\r?\n``````\w*\r?\n([\s\S]*?)\r?\n``````/gm;
      let mdBlocks = 0, staleFiles = 0;
      for (let m; (m = blockRe.exec(bundle)); ) {
        const [, p, body] = m;
        if (!p.endsWith('.md') || p === 'kaif-bundle-manifest.json') continue;
        mdBlocks++;
        const entry = (mm.files || {})[p];
        if (!entry) { errors.push(`module map: bundle file not mapped: ${p}`); continue; }
        const mods = splitModules(body.replace(/\r\n/g, '\n') + '\n');
        if (mods.length !== entry.length) { staleFiles++; continue; }
        for (let i = 0; i < mods.length; i++) {
          const actualSha = createHash('sha256').update(mods[i].lines.join('\n')).digest('hex');
          if (mods[i].signature !== entry[i].signature || actualSha !== entry[i].sha256) { staleFiles++; break; }
          if (!MODULE_CLASSES.includes(entry[i].class))
            errors.push(`module map: invalid class "${entry[i].class}" for ${p} :: ${entry[i].signature}`);
        }
      }
      if (mdBlocks === 0) errors.push('module map check saw ZERO md blocks — the bundle is unreadable to the block regex (a hollow green is not a pass)');
      if (staleFiles) errors.push(`module map STALE: ${staleFiles} of ${mdBlocks} md files diverge from the bundle — re-run the build`);
      const mappedNotInBundle = Object.keys(mm.files || {}).length -
        [...bundle.matchAll(blockRe)].filter(([, p]) => p.endsWith('.md') && p !== 'kaif-bundle-manifest.json' && (mm.files || {})[p]).length;
      if (mappedNotInBundle > 0) errors.push(`module map: ${mappedNotInBundle} mapped file(s) do not exist in the bundle (ghost entries)`);

      // 9. Behavioral pin: the CORE'S VENDORED splitter/classifier must equal the build library —
      //    executed, not eyeballed. Without this gate a silent drift of the vendored copy shipped
      //    green until someone manually re-ran the sandbox pin (review-caught).
      try {
        const { execFileSync } = await import('node:child_process');
        const coreOut = JSON.parse(execFileSync(process.execPath,
          [join(ROOT, 'framework', 'installer', 'KAIF-CORE.mjs'), 'modules', '--bundle', join(distDir, 'KAIF-CORE-BUNDLE.md')],
          { stdio: 'pipe' }).toString());
        let pinBad = coreOut.moduleCount !== mm.moduleCount ? 1 : 0;
        for (const [p, mods] of Object.entries(mm.files || {})) {
          const c = (coreOut.files || {})[p];
          if (!c || c.length !== mods.length) { pinBad++; continue; }
          for (let i = 0; i < mods.length; i++)
            if (c[i].signature !== mods[i].signature || c[i].sha256 !== mods[i].sha256 || c[i].class !== mods[i].class) { pinBad++; break; }
        }
        for (const p of Object.keys(coreOut.files || {})) if (!(mm.files || {})[p]) pinBad++;
        if (pinBad) errors.push(`vendored core splitter DRIFTED from the build library: ${pinBad} file-level mismatch(es) in the behavioral pin`);
      } catch (e) {
        errors.push('behavioral pin failed to run (core `modules` command errored): ' + String(e.message || e).slice(0, 200));
      }
      if (!errors.some((e) => e.startsWith('module map') || e.startsWith('vendored core')))
        distNote += ` · module map OK (${mm.moduleCount} modules / ${mdBlocks} md files, core pin ok)`;
    }
  }
}

if (errors.length) {
  console.error('❌ check-framework FAILED:');
  for (const e of errors) console.error('   - ' + e);
  process.exit(1);
}
console.log(`✅ check-framework OK — ${fileBlocks} embedded files (${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${tools.length} tools), fences balanced, no stray markers${distNote}`);
