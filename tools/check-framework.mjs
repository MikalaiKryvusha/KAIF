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
import { readFileSync, readdirSync, existsSync, statSync as statSyncTop, cpSync, appendFileSync, writeFileSync as writeFileSyncTop, mkdirSync as mkdirSyncTop } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from './lib/temp-root.mjs';
import { scanText as scanInvisible, label as invisibleLabel } from './lib/invisible-chars.mjs';
import { readBudgets } from './budget-gate.mjs';
import { walkerDrift, WALKER_COPIES, CORE_PATH as WALKER_CORE } from './sync-walker.mjs';

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
  'tools/kaif-scenario-lint.mjs',      // the RU keywords, rule word lists and selftest fixtures of the scenario form (2.5)
  'installer/KAIF-CORE.mjs',           // SCRIPTS (the writing-system regexes) + AUTHOR_TOKEN_CLUSTERS, as data
  'tools/contour/texts.mjs',           // the RU dictionary of the shipped contour (page texts, call phrases, parser labels) — 2.6 IC3; core.mjs/review.mjs stay judged
  'tools/kaif-ranking-lint.mjs',       // the RU anchors of the /what-next answer form (shelf, debt line) + RU selftest fixtures (2.6, WN)
  'tools/kaif-testrun-lint.mjs',       // the RU field keywords of the run report (Работа · Контур · …) + RU selftest fixtures (2.7, TR)
  'tools/kaif-attribution-lint.mjs',   // the RU attribution patterns ("решение владельца", "по слову владельца") + the RU field line of #55 as a selftest fixture (2.7, AW)
  'tools/kaif-voice-lint.mjs',         // the RU §8 heading and column keywords of the voice portrait (паттерн · класс · подсказка · исключение) + RU selftest fixtures (2.7, VC)
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

// 5h. Invisible characters inside SOURCE bodies (bugs/122). An agent types the escape of a byte-order mark (or of NUL,
//     BEL, a zero-width space) into the parameter of an edit tool; the tool layer decodes the four-hex-digit escape BEFORE
//     the write, and the file receives the REAL character. Inside a regex or a string it WORKS exactly like the escape
//     would, so no suite reddens — while the eye, a diff and a review read `replace(/^<it>/, '')` as `replace(/^/, '')`,
//     and whoever retypes the line "as seen" silently turns the behaviour off. On 2026-09-18 that was how EVERY byte-order-
//     mark strip of the project was written: 39 source sites, 25 of them shipped. The set of code points and the scanner
//     live in tools/lib/invisible-chars.mjs (shared with the probe that carries the ready move, `--fix`).
//     @guard invisible-characters
//     THREAT:         a control or format character typed as an escape lands in a source body as the real character; a
//                     later hand edit drops it and a strip, a separator or a terminal bell silently stops working
//     PROVED-AGAINST: the NAMED broken version — the origin's own tree at 39c9988 (39 sites in framework/ and tools/) —
//                     judged by this function: red, every file named with its code points; `--selftest`: a synthetic
//                     tree with the character inside a .mjs body and inside a .md body is red by name, the same tree
//                     with a byte-order mark at offset 0 only, and the clean tree, stay silent
//     GAP:            the SET of code points was chosen by the session, not taken from an authority (delta judge of f4915af):
//                     outside it stay U+2066-U+2069 (the other half of the bidirectional controls), U+2028/U+2029, and the
//                     look-alikes U+00A0 and U+2011 — thirteen living sites of those two sit in literals of tools/ today;
//                     widening the set means normalising them in the same move (registry of 2.8, ideas/30 item 21);
//                     documents outside framework/ and tools/ are not judged (bugs/, plans/, the journal — there the
//                     probe reports and a human fixes by meaning); a character somebody WANTS in a body has no exemption
//                     on purpose — write it as an escape or build it from its code
//     ON-REAL-PATH:   2026-09-18 — the path every session walks is the origin's build, whose LAST step runs this validator
//                     and exits with its code. The VALIDATOR was seen REFUSING at 12:57 +03:00 on the living tree before the
//                     normalisation (twenty files named; the whole build was not started at that moment); the whole BUILD
//                     was seen green at 14:27 and 14:44 after it; on a
//                     copy of the tree with the character put back into the shipped core and into one tool — exit 1 and
//                     the two sites named (report testcases/reports/2026-09-18_invisible-characters.md, runs 1, 10, 12)
const INVISIBLE_ZONES = ['framework', 'tools'];
function scanInvisibleCharacters(root) {
  const found = [];
  const walk = (dir) => {
    for (const n of readdirSync(dir).sort()) {
      const p = join(dir, n);
      if (statSyncTop(p).isDirectory()) { if (n !== 'node_modules') walk(p); continue; }
      if (!/\.(mjs|js|json|md)$/i.test(n)) continue;
      const hits = scanInvisible(readFileSync(p, 'utf8'));
      if (!hits.length) continue;
      const rel = relative(root, p).split('\\').join('/');
      const kinds = [...new Set(hits.map((h) => invisibleLabel(h.code)))].join(' · ');
      const move = /\.(mjs|js)$/i.test(n) ? `node tools/sandbox/probes/invisible-characters.mjs --fix ${rel}` : 'a document — fix it by hand, by meaning';
      // The line opens with the form the bug document promised — `<code point> at <file>:<line>` — so a grep for it lands.
      found.push(`invisible character inside a source body (bugs/122): ${invisibleLabel(hits[0].code)} at ${rel}:${hits[0].line} (column ${hits[0].col}) — ${hits.length} in this file (${kinds}) — the ready move: ${move}`);
    }
  };
  for (const z of INVISIBLE_ZONES) if (existsSync(join(root, z))) walk(join(root, z));
  return found;
}
function selfProofInvisible() {
  const fails = [];
  const sandbox = tempRoot('check-5h');
  const BOM = String.fromCharCode(0xFEFF), NUL = String.fromCharCode(0);
  const put = (rel, text) => { const p = join(sandbox, ...rel.split('/')); mkdirSyncTop(dirname(p), { recursive: true }); writeFileSyncTop(p, text); };
  put('framework/clean.mjs', "const s = 'plain';\n");
  put('tools/file-level-bom.mjs', BOM + "const s = 'a byte-order mark at offset 0 is a file property';\n");
  let got = scanInvisibleCharacters(sandbox);
  if (got.length) fails.push(`чистое дерево и BOM в нулевой позиции покраснели: ${got[0]}`);
  put('framework/strip.mjs', "const t = s.replace(/^" + BOM + "/, '');\n");
  put('tools/key.md', 'a key separator typed as an escape: [' + NUL + ']\n');
  got = scanInvisibleCharacters(sandbox);
  if (!got.some((e) => e.includes('U+FEFF at framework/strip.mjs:1 ') && e.includes('--fix framework/strip.mjs'))) fails.push('символ внутри регулярного выражения .mjs НЕ назван формой «кодовая точка at файл:строка» с готовым ходом');
  if (!got.some((e) => e.includes('U+0000 at tools/key.md:1 ') && e.includes('by hand'))) fails.push('NUL в документе НЕ назван формой «кодовая точка at файл:строка» или предложен машинный ход');
  if (got.length !== 2) fails.push(`ожидалось ровно две находки, получено ${got.length}`);
  return fails;
}

// 5i. Reference §17 «Why the canon says so» (2.8, epic CK, step CK3.2; researches/33 §7 (а)). The canon keeps each rule short and
//     moves its birth certificate into this INFORMATIVE section, one entry per canon section, keyed `### \`<FILE>\` → <heading>`.
//     An entry whose heading no longer exists in framework/<FILE> is a reason that outlived its rule (or a key that never matched):
//     red, the key named. Declared here with its self-proof (`--selftest`), invoked in the numbered checks after 5c.
// @guard reference-why-keys
// THREAT:         a slimmed canon section is renamed or dropped and its «why» entry stays behind, pointing at nothing — the next
//                 session reads a reason for a rule that is gone, or cannot find the reason for the rule that is there
// PROVED-AGAINST: `--selftest` fixture — one entry keyed to an existing heading (silent), one keyed to a heading the canon does
//                 not carry (named), one naming a file that does not exist (named), and a Reference without §17 (named)
// GAP:            the guard checks that the KEY resolves, not that the entry's text still explains the rule — that is the judge's
// ON-REAL-PATH:   NOT YET — first real entries land with CK3.3 (the testing canon's slice)
const WHY_SECTION_RE = /^## 17\. Why the canon says so/m;
const WHY_KEY_RE = /^### `([^`]+)` → (.+?)\s*$/;
function danglingWhyKeys(refText, readCanon) {
  const at = refText.search(WHY_SECTION_RE);
  if (at < 0) return ['Reference §17 "Why the canon says so" is missing — the canon points there for the reason behind its rules (epic CK 2.8)'];
  const rest = refText.slice(at);
  const next = rest.slice(3).search(/^## /m);
  const body = next < 0 ? rest : rest.slice(0, next + 3);
  const found = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(WHY_KEY_RE);
    if (!m) continue;
    const canon = readCanon(m[1]);
    if (canon === null) { found.push(`Reference §17 entry "${m[1]} → ${m[2]}" names a file the payload does not carry`); continue; }
    const has = canon.split(/\r?\n/).some((l) => /^#{2,6} /.test(l) && l.replace(/^#{2,6} /, '').trim() === m[2]);
    if (!has) found.push(`Reference §17 entry "${m[1]} → ${m[2]}" is dangling — framework/${m[1]} has no section with that heading (rename the key with the section, or move the reason with the rule)`);
  }
  return found;
}
function selfProofWhyKeys() {
  const fails = [];
  const canon = { 'T.md': '# T\n\n## The live section\n\ntext\n' };
  const read = (f) => (f in canon ? canon[f] : null);
  const ref = '# R\n\n## 16. Where\n\nx\n\n## 17. Why the canon says so (informative)\n\n### `T.md` → The live section\n\nwhy\n\n' +
    '### `T.md` → The renamed section\n\nwhy\n\n### `Gone.md` → Anything\n\nwhy\n';
  const got = danglingWhyKeys(ref, read);
  if (got.length !== 2) fails.push(`ожидалось ровно две находки §17, получено ${got.length}: ${got.join(' | ')}`);
  if (!got.some((e) => e.includes('"T.md → The renamed section" is dangling'))) fails.push('висячий ключ §17 НЕ назван');
  if (!got.some((e) => e.includes('"Gone.md → Anything" names a file'))) fails.push('ключ §17 на несуществующий файл НЕ назван');
  if (got.some((e) => e.includes('The live section'))) fails.push('живой ключ §17 назван висячим');
  if (!danglingWhyKeys('# R\n\n## 16. Where\n', read).some((e) => e.includes('is missing'))) fails.push('записка без §17 НЕ названа');
  return fails;
}

// 5j. The delivery templates of the re-read core stay under budget × (100 − TEMPLATE_RESERVE_PCT) % (2.8, epic CK, step CK5.1;
//     plans/117 criterion 1; the reserve — researches/33 §7 (б), revised twice on 2026-09-25). A template ON its budget leaves a
//     deployment translated wholesale — where the budget gate counts every line as the project's own — no room for the project's
//     adaptation of the method modules, and its first closing after the update stops. The budgets come from ONE place, `DOC_BUDGETS`
//     of the delivery core, read by `readBudgets()` of the origin's budget door (tools/budget-gate.mjs) — no copy of a number here.
// @guard template-ceiling
// THREAT:         a delivery template grows back to its budget (the guide: 356 lines in 1.6 → 1200 in 2.7, exactly ON 1200) and every
//                 deployment translated wholesale stops on its first closing after the update
// PROVED-AGAINST: `--selftest` — a 1200-line guide against budget 1200 (the v2.7 shape) → named with its lines, ceiling and budget; the
//                 guide at its ceiling → silent; a missing template → named; a budget table read short (eight rows) → named
// GAP:            lines of the TEMPLATE, not of a translation — the ratio is measured on the origin's own pairs (×0.99–1.04) and the
//                 eight frozen language packs are unmeasured; the reserve is sized by the two field shapes the probe measured (+56 and
//                 +58 after the 2.8 moves), a heavier deployment is left to the budget gate, which names the move-out
// ON-REAL-PATH:   NOT YET — the path is the first field closing after an update to 2.8 on a deployment translated wholesale
const TEMPLATE_RESERVE_PCT = 10;   // source: researches/33 §7 (б), «Пересмотрено второй раз» — the field probe
                                   // tools/sandbox/probes/ck50-field-guide-growth.mjs: at 90 % the two measured shapes keep 19 and 21 lines
const CORE_DOC_COUNT = 9;          // the re-read core (AGENT_GUIDE → Document taxonomy, tier 1)
const templateCeiling = (budget) => Math.floor((budget * (100 - TEMPLATE_RESERVE_PCT)) / 100);   // integer arithmetic, no 0.9 drift
function templatesOverCeiling(budgets, lineCountOf) {
  if (budgets.length !== CORE_DOC_COUNT)
    return [`template ceiling (CK 2.8): the budget table read ${budgets.length} row(s) of ${CORE_DOC_COUNT} from framework/installer/KAIF-CORE.mjs — fix readBudgets() in tools/budget-gate.mjs (a guard that cannot read its numbers never passes)`];
  const found = [];
  for (const { doc, budget } of budgets) {
    const n = lineCountOf(doc);
    const ceiling = templateCeiling(budget);
    if (n === null) found.push(`template ceiling (CK 2.8): framework/${doc} is missing — a template of the re-read core is not in the payload`);
    else if (n > ceiling) found.push(`template ceiling (CK 2.8): framework/${doc} is ${n} lines, above its ceiling ${ceiling} (budget ${budget} less the ${TEMPLATE_RESERVE_PCT} % reserve) — move content out (the rationale to KAIF_REFERENCE.md §17, project facts to the house-rules skeleton); never raise the budget`);
  }
  return found;
}
function selfProofTemplateCeiling() {
  const fails = [];
  const docs = ['STATUS.md', 'GOAL.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PHILOSOPHY.md', 'TESTING_FRAMEWORK.md',
    'BUG_FIXING_FRAMEWORK.md', 'REQUIREMENTS_FRAMEWORK.md', 'AGENT_GUIDE.md'];
  const budgets = docs.map((doc) => ({ doc, budget: doc === 'AGENT_GUIDE.md' ? 1200 : 300 }));
  const sizes = (guide) => (doc) => (doc === 'AGENT_GUIDE.md' ? guide : 200);
  let got = templatesOverCeiling(budgets, sizes(1200));
  if (got.length !== 1 || !got[0].includes('framework/AGENT_GUIDE.md is 1200 lines, above its ceiling 1080 (budget 1200'))
    fails.push(`мутант «руководство в 1200 строк» (форма v2.7) не назван как ожидалось: ${got.join(' | ') || 'молчание'}`);
  if (templatesOverCeiling(budgets, sizes(1080)).length) fails.push('руководство ровно на потолке 1080 названо — потолок включительный');
  got = templatesOverCeiling(budgets, (doc) => (doc === 'GOAL.md' ? null : 200));
  if (!got.some((e) => e.includes('framework/GOAL.md is missing'))) fails.push('пропавший шаблон ядра НЕ назван');
  if (!templatesOverCeiling(budgets.slice(1), sizes(200)).some((e) => e.includes('read 8 row(s) of 9'))) fails.push('таблица бюджетов, прочитанная не целиком, НЕ названа');
  return fails;
}

// 5k. One price of a token, two copies (2.8, epic CK, step CK5.9 (b)): `kaif-voice-lint load` prints what a portrait costs at the
//     rates the core's `check` prints the entry cost with, and a deployed tool module cannot import the core — so the module carries
//     a COPY of the two rates, and this guard judges the pair by VALUE (both files name both constants, the numbers agree).
// @guard token-rates-pair
// THREAT:         the core's entry-cost rates are recalibrated (a second measurement) and `load` goes on pricing the portrait at the
//                 old rates — two tools of one delivery tell a field agent two prices for the same characters
// PROVED-AGAINST: `--selftest` — equal rates → silent; the module's non-ASCII rate changed → named with both pairs of numbers; a
//                 rate constant missing from the module → named
// GAP:            the VALUES only — how each file counts characters (for…of, code unit < 128) is the same by reading, not by this guard
// ON-REAL-PATH:   NOT YET — the path is the first recalibration of the core's rates
const TOKEN_RATE_NAMES = ['ASCII_CHARS_PER_TOKEN', 'OTHER_CHARS_PER_TOKEN'];
function tokenRatesDisagree(coreText, voiceText) {
  const rates = (body) => TOKEN_RATE_NAMES.map((k) => (new RegExp(`\\b${k} = ([0-9.]+)`).exec(body) || [])[1] || '?');
  const core = rates(coreText), voice = rates(voiceText);
  if (core.every((v, i) => v !== '?' && v === voice[i])) return [];
  return [`token rates (CK 2.8): framework/tools/kaif-voice-lint.mjs prices ${voice.join(' / ')} characters per token (ASCII / other), the core's entry-cost line framework/installer/KAIF-CORE.mjs ${core.join(' / ')} — one price, two copies: make them agree`];
}
function selfProofTokenRates() {
  const fails = [];
  const core = 'const ASCII_CHARS_PER_TOKEN = 2.5, OTHER_CHARS_PER_TOKEN = 1.9, MODEL_WINDOW_TOKENS = 1000000;';
  if (tokenRatesDisagree(core, 'const ASCII_CHARS_PER_TOKEN = 2.5, OTHER_CHARS_PER_TOKEN = 1.9;').length) fails.push('равные ставки названы расхождением');
  const moved = tokenRatesDisagree(core, 'const ASCII_CHARS_PER_TOKEN = 2.5, OTHER_CHARS_PER_TOKEN = 2.1;');
  if (moved.length !== 1 || !moved[0].includes('2.5 / 2.1') || !moved[0].includes('2.5 / 1.9')) fails.push(`сдвинутая ставка модуля не названа с обеими парами чисел: ${moved.join(' | ') || 'молчание'}`);
  if (!tokenRatesDisagree(core, 'const OTHER_CHARS_PER_TOKEN = 1.9;').some((e) => e.includes('? / 1.9'))) fails.push('пропавшая константа ставки в модуле НЕ названа');
  return fails;
}

// 5l. One tree walker, seven copies (2.8, epic SC; origin #77 · Q-R1′): the core's KAIF-WALK block is the source, and each tool
//     module that walks the tree carries a byte-identical copy (a deployed module cannot import the core — the 5k reason).
// @guard walker-copies
// THREAT:         the walker is fixed in the core (a new skip, a new failure branch) and one module keeps the old copy — that
//                 scanner goes back to "no findings" over a tree it could not see, the #77 class returned through one door
// PROVED-AGAINST: `--selftest` — equal blocks → silent; one changed line in a copy → that copy named; a copy without the block →
//                 named; a core without the block → named
// GAP:            the modules' USE of the walker (which files each keeps, how it prints the notes) is the modules' own — the
//                 polygon's s29 judges that behaviour, this guard only the text of the copies
// ON-REAL-PATH:   NOT YET — the path is the first change of the walker after 2.8
function selfProofWalkerCopies() {
  const fails = [];
  const blk = '// ── KAIF-WALK:BEGIN — x\nfunction kaifWalk() { return 1; }\n// ── KAIF-WALK:END';
  const core = `const a = 1;\n${blk}\nconst b = 2;`;
  if (walkerDrift(core, { 'm.mjs': `import x;\n${blk}\n` }).length) fails.push('равная копия названа расхождением');
  const drifted = walkerDrift(core, { 'm.mjs': `import x;\n${blk.replace('return 1', 'return 2')}\n` });
  if (drifted.length !== 1 || !drifted[0].includes('m.mjs') || !drifted[0].includes('drifted')) fails.push(`изменённая копия не названа: ${drifted.join(' | ') || 'молчание'}`);
  const missing = walkerDrift(core, { 'm.mjs': 'import x;\n' });
  if (missing.length !== 1 || !missing[0].includes('no KAIF-WALK block')) fails.push(`копия без блока не названа: ${missing.join(' | ') || 'молчание'}`);
  if (!walkerDrift('const a = 1;', { 'm.mjs': blk }).some((e) => e.includes('source of the one tree walker is gone'))) fails.push('ядро без блока НЕ названо');
  return fails;
}

// A bilingual document is checked HALF BY HALF (bugs/65 №2). "The token occurs somewhere in the
// file" is a proxy: the pairs registry below literally promises BOTH halves, yet deleting the name
// from the Russian half alone left the lint green — a reader of that half is routed nowhere. Which
// documents have halves is COMPUTED from the `<a id="russian">` anchor (the same landmark
// showcase-lint and build-story-card split on), so a bilingual file added to the registry later
// gets the per-half check without anyone remembering to flag it, and a single-language file keeps
// being read as one whole.
const RU_ANCHOR = '<a id="russian">';
// The landmark is a LINE that BEGINS with the anchor. A document that only QUOTES the anchor inside its prose is
// single-language: the origin's journal does exactly that (a lesson about this very axis), and an `indexOf` split cut it
// into an "EN half" and an "RU half" at the quote — every header token then read as missing from the second one
// (found 2026-09-18 by the first pair ever registered on EXPERIENCE.md, epic EL).
const ruAnchorAt = (body) => { const m = /^<a id="russian">/m.exec(body); return m ? m.index : -1; };
const segmentsOf = (body) => {
  const i = ruAnchorAt(body);
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
  'templates/_testcases-template.md',
  'templates/_testrun-report-template.md',
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
  const i = ruAnchorAt(readme);
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
  // …и третий: документ, который ЦИТИРУЕТ якорь в прозе (обратные кавычки, середина строки), — одноязычный; токен из его
  // шапки не объявляется потерянным «во второй половине».
  const quoting = `header carries ${HALF_TOKEN}\nprose: the halves are computed from the anchor \`${RU_ANCHOR}\` — a quote, not a landmark\ntail`;
  if (missingTokens(quoting, [HALF_TOKEN]).length)
    fails.push('документ, цитирующий якорь в прозе, ложно разрезан на половины');
  return fails;
}

// ── Guard 5f: a heading that VANISHED from a template without a record (2.7, epic HO; issue #57) ──
//
//   @guard vanished-heading-undeclared
//   THREAT:         a release renames a module heading and forgets to declare it, so every field
//                   tree that carries local edits in that section ends up with TWO sections of the
//                   same content — silently, at exit 0 (measured: probe ho-rename-duplicate, branch B)
//   PROVED-AGAINST: a fixture pair of module maps where one signature disappears with no rename and
//                   no deprecation behind it (`--selftest`), plus the inverse pair that stays silent
//   GAP:            it cannot tell a DELIBERATE removal from a forgotten rename — that is why it
//                   WARNS by name instead of failing the build; a genuine removal is answered by
//                   adding a DEPRECATIONS entry or by reading the line and moving on
//   ON-REAL-PATH:   every build of this repo runs it against the previous release's shipped map
//
// The comparison is against what the PREVIOUS RELEASE shipped (`git show v<prev>:dist/kaif-module-map.json`),
// because that is the map field trees were deployed from. No git, no tag, no map in the tag → SKIPPED,
// said aloud: a guard that goes quiet when its evidence is missing would read as "nothing vanished".
function vanishedHeadings(oldFiles, newFiles, renamesByVersion, deprecations) {
  const declared = new Set();
  for (const perPath of Object.values(renamesByVersion || {}))
    for (const [path, pairs] of Object.entries(perPath || {}))
      for (const [o] of pairs) declared.add(path + '\u0000' + o);
  const retiredPaths = new Set((deprecations || []).map((d) => d.path));
  const out = [];
  for (const [path, mods] of Object.entries(oldFiles || {})) {
    if (retiredPaths.has(path)) continue;              // the whole artifact is retired — its headings go with it
    const now = newFiles[path];
    if (!now) continue;                                // the path itself is gone: a different class (deprecations)
    const live = new Set(now.map((m) => m.signature));
    for (const m of mods) {
      if (live.has(m.signature) || declared.has(path + '\u0000' + m.signature)) continue;
      if (/^# /.test(m.signature)) continue;           // an H1 carries deploy-time values — its drift is bug 26, not a rename
      out.push(`${path} :: ${m.signature}`);
    }
  }
  return out;
}

// Guard 5g — the other half of the same declaration (judge of epic HO, E4/E4b; bugs/114): a rename
// pair is only worth anything if BOTH its halves are real. A typo in the NEW half makes the merge
// drop the pair silently (the duplicate returns at exit 0) and makes 5f silent too (it keys on the
// OLD half only). So every pair declared for a version AFTER the previous release must have its
// new heading in the CURRENT map and its old heading in the PREVIOUS release's map — else the
// build FAILS (an error, not a warning: a broken declaration is never a deliberate choice).
// Older pairs are history and are not re-judged: their old headings are legitimately gone.
function brokenRenames(oldFiles, newFiles, renamesByVersion, prevVersion, gtFn) {
  const out = [];
  for (const [v, perPath] of Object.entries(renamesByVersion || {})) {
    if (prevVersion && !gtFn(v, prevVersion)) continue;
    for (const [path, pairs] of Object.entries(perPath || {})) {
      const now = new Set((newFiles[path] || []).map((m) => m.signature));
      const was = new Set((oldFiles[path] || []).map((m) => m.signature));
      for (const [o, n] of pairs) {
        if (!now.has(n)) out.push(`${path} :: new heading not in the current template — "${n}"`);
        if (oldFiles[path] && !was.has(o)) out.push(`${path} :: old heading was not in release ${prevVersion} — "${o}"`);
      }
    }
  }
  return out;
}

// Both answers, on fixtures — the guard must redden on a vanished heading and stay silent when the
// same disappearance is DECLARED (a rename) or explained (a retired artifact).
function selfProofVanished() {
  const fails = [];
  const oldF = { 'a/S.md': [{ signature: '## Alpha' }, { signature: '## Beta' }], 'b/S.md': [{ signature: '## Gone' }] };
  const newF = { 'a/S.md': [{ signature: '## Alpha2' }, { signature: '## Beta' }], 'b/S.md': [{ signature: '## Other' }] };
  const bare = vanishedHeadings(oldF, newF, {}, []);
  if (!bare.includes('a/S.md :: ## Alpha')) fails.push('исчезнувший заголовок БЕЗ записи не покраснел');
  if (!bare.includes('b/S.md :: ## Gone')) fails.push('второй исчезнувший заголовок не назван');
  const declaredOk = vanishedHeadings(oldF, newF, { '9.9': { 'a/S.md': [['## Alpha', '## Alpha2']] } }, [{ path: 'b/S.md' }]);
  if (declaredOk.length) fails.push('объявленное переименование и депрекация всё равно краснеют: ' + declaredOk.join(' · '));
  const untouched = vanishedHeadings(oldF, oldF, {}, []);
  if (untouched.length) fails.push('неизменная карта покраснела: ' + untouched.join(' · '));
  // 5g — both halves of a declared pair (E4): a typo in the NEW half, an OLD half that never existed,
  // a pair from an older release that is history and must stay silent.
  const gtV = (a, b) => parseFloat(a) > parseFloat(b);
  const typo = brokenRenames(oldF, newF, { '9.9': { 'a/S.md': [['## Alpha', '## Alpha2-TYPO']] } }, '9.8', gtV);
  if (!typo.some((s) => s.includes('new heading not in the current template'))) fails.push('5g: опечатка в НОВОЙ половине пары не покраснела');
  const ghost = brokenRenames(oldF, newF, { '9.9': { 'a/S.md': [['## Never', '## Alpha2']] } }, '9.8', gtV);
  if (!ghost.some((s) => s.includes('old heading was not in release'))) fails.push('5g: несуществующий СТАРЫЙ заголовок не покраснел');
  const fine = brokenRenames(oldF, newF, { '9.9': { 'a/S.md': [['## Alpha', '## Alpha2']] } }, '9.8', gtV);
  if (fine.length) fails.push('5g: верная пара покраснела: ' + fine.join(' · '));
  const history = brokenRenames(oldF, newF, { '9.7': { 'a/S.md': [['## Long-gone', '## Also-gone']] } }, '9.8', gtV);
  if (history.length) fails.push('5g: пара прошлого релиза (история) покраснела: ' + history.join(' · '));
  return fails;
}

if (process.argv.includes('--selftest')) {
  const vFails = selfProofVanished();
  for (const f of vFails) console.error('✖ selfproof 5f (HO, issue #57): ' + f);
  if (vFails.length) { console.error(`\n❌ check-framework --selftest: гард 5f — ${vFails.length} провалов`); process.exit(1); }
  console.log('✅ гард 5f: исчезнувший заголовок БЕЗ записи краснеет ПОИМЁННО; объявленное переименование и депрекация молчат');
  console.log('✅ гард 5g: объявленная пара с опечаткой в НОВОЙ половине или с несуществующей СТАРОЙ — красная; верная пара и пара прошлого релиза молчат');
  const iFails = selfProofInvisible();
  for (const f of iFails) console.error('✖ selfproof 5h (bugs/122): ' + f);
  if (iFails.length) { console.error(`\n❌ check-framework --selftest: гард 5h — ${iFails.length} провалов`); process.exit(1); }
  console.log('✅ гард 5h: невидимый символ в теле .mjs и в теле .md назван ПОИМЁННО (файл · кодовая точка · готовый ход); BOM в нулевой позиции файла и чистое дерево молчат');
  const cFails = selfProofTemplateCeiling();
  for (const f of cFails) console.error('✖ selfproof 5j (CK 2.8): ' + f);
  if (cFails.length) { console.error(`\n❌ check-framework --selftest: гард 5j — ${cFails.length} провалов`); process.exit(1); }
  console.log('✅ гард 5j: шаблон в 1200 строк при бюджете 1200 назван с потолком; шаблон на потолке молчит; пропавший шаблон и неполная таблица названы');
  const tFails = selfProofTokenRates();
  for (const f of tFails) console.error('✖ selfproof 5k (CK 2.8): ' + f);
  if (tFails.length) { console.error(`\n❌ check-framework --selftest: гард 5k — ${tFails.length} провалов`); process.exit(1); }
  console.log('✅ гард 5k: ставка токенов модуля голоса, сдвинутая от ставки ядра, названа обеими парами чисел; пропавшая константа названа; равные ставки молчат');
  const lFails = selfProofWalkerCopies();
  for (const f of lFails) console.error('✖ selfproof 5l (SC 2.8): ' + f);
  if (lFails.length) { console.error(`\n❌ check-framework --selftest: гард 5l — ${lFails.length} провалов`); process.exit(1); }
  console.log('✅ гард 5l: копия обходчика, разошедшаяся с блоком ядра, названа; копия без блока и ядро без блока названы; равные копии молчат');
  const wFails = selfProofWhyKeys();
  for (const f of wFails) console.error('✖ selfproof 5i (CK 2.8): ' + f);
  if (wFails.length) { console.error(`\n❌ check-framework --selftest: гард 5i — ${wFails.length} провалов`); process.exit(1); }
  console.log('✅ гард 5i: висячий ключ §17 записки и ключ на несуществующий файл названы ПОИМЁННО; живой ключ молчит; записка без §17 названа');
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
// 5i. Reference §17 keys resolve to live canon headings — declared with its self-proof near the top.
errors.push(...danglingWhyKeys(readFileSync(join(ROOT, 'framework', 'KAIF_REFERENCE.md'), 'utf8'),
  (f) => { const p = join(ROOT, 'framework', f); return existsSync(p) ? readFileSync(p, 'utf8') : null; }));
// 5j. The delivery templates of the re-read core stay under their ceiling — declared with its self-proof near the top.
errors.push(...templatesOverCeiling(readBudgets(readFileSync(join(ROOT, 'framework', 'installer', 'KAIF-CORE.mjs'), 'utf8')),
  (doc) => { const p = join(ROOT, 'framework', doc); if (!existsSync(p)) return null;
    const l = readFileSync(p, 'utf8').split(/\r?\n/); if (l[l.length - 1] === '') l.pop(); return l.length; }));
// 5k. The voice module's token rates equal the core's — declared with its self-proof near the top.
errors.push(...tokenRatesDisagree(readFileSync(join(ROOT, 'framework', 'installer', 'KAIF-CORE.mjs'), 'utf8'),
  readFileSync(join(ROOT, 'framework', 'tools', 'kaif-voice-lint.mjs'), 'utf8')));
// 5l. Every copy of the one tree walker equals the core's block — declared with its self-proof near the top.
errors.push(...walkerDrift(readFileSync(join(ROOT, WALKER_CORE), 'utf8'),
  Object.fromEntries(WALKER_COPIES.map((p) => [p, existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : null]))));

// 5d. The owner's script in EN payload bodies — the scan itself lives at the top of this file
//     (constants, walk and `--selftest` together), because its coverage is COMPUTED and the
//     selftest that proves it has to run before the dist artifacts are read. Here it is only
//     invoked, so that the ordering of the numbered checks stays readable.
errors.push(...scanPayloadCyrillic(join(ROOT, 'framework')));
// 5h. Invisible characters inside source bodies of framework/ and tools/ (bugs/122) — declared at the top, invoked here.
errors.push(...scanInvisibleCharacters(ROOT));

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
    // VC (2.7, origin issue #61): the same three surfaces also carry the COMMAND of the machine minute —
    // a voice gate that names no command is prose, and prose under load is not executed
    ['portrait canon name ↔ /owner-voice (payload) + the load and check commands', 'framework/skills/owner-voice/SKILL.md',
      ['AUTHOR_STYLOMETRY.md', 'kaif-voice-lint.mjs load', 'kaif-voice-lint.mjs check']],
    ['portrait canon name ↔ /owner-voice (wrapper) + the load and check commands', '.claude/skills/owner-voice/SKILL.md',
      ['AUTHOR_STYLOMETRY.md', 'kaif-voice-lint.mjs load', 'kaif-voice-lint.mjs check']],
    ['portrait canon name ↔ the shipped skeleton header + the load and check commands', 'framework/templates/_owner-voice-template.md',
      ['AUTHOR_STYLOMETRY.md', 'kaif-voice-lint.mjs load', 'kaif-voice-lint.mjs check']],
    ['portrait canon name ↔ AGENT_GUIDE router (payload)', 'framework/AGENT_GUIDE.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ AGENT_GUIDE router (wrapper)', 'AGENT_GUIDE.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ KAIF_REFERENCE', 'framework/KAIF_REFERENCE.md',
      ['AUTHOR_STYLOMETRY.md']],
    ['portrait canon name ↔ README (both halves)', 'README.md',
      ['AUTHOR_STYLOMETRY.md']],
    // TR (2.7, origin issue #59): the run-report norm is a promise of the 2.7 notes — BOTH halves are pinned:
    // the canon carries the copy command that produces the report, the judge carries the hunt for a claim without one
    ['run report ↔ TESTING_FRAMEWORK carries the copy command (truth side)', 'framework/TESTING_FRAMEWORK.md',
      ['cp .kaif/_testrun-report-template.md testcases/reports/']],
    ['run report ↔ /fable-judge hunts the claim without one', 'framework/skills/fable-judge/SKILL.md',
      ['**Tested without a run report (KAIF 2.7).**']],
    // VC (2.7, origin issue #61): the voice gate is a COMMAND at the fable loop's call point and in the
    // show rule (truth side), and the judge hunts owner text shown without it
    ['voice contract ↔ AGENT_GUIDE fable-loop call point carries the three steps and the command (payload)', 'framework/AGENT_GUIDE.md',
      ['node .kaif/tools/kaif-voice-lint.mjs load', 'node .kaif/tools/kaif-voice-lint.mjs check <file…>', 'Write BY the portrait — with it in your working context.', 'Check INDEPENDENTLY by the same portrait.', 'owner-text-past-the-portrait hunt']],
    ['voice contract ↔ AGENT_GUIDE fable-loop call point carries the three steps and the command (wrapper)', 'AGENT_GUIDE.md',
      ['kaif-voice-lint.mjs load', 'kaif-voice-lint.mjs check <файл…>', 'Пиши ПО портрету — с ним в своём рабочем контексте.', 'Проверь НЕЗАВИСИМО по тому же портрету.']],
    ['voice contract ↔ /fable-judge hunts owner text past the portrait', 'framework/skills/fable-judge/SKILL.md',
      ['**Owner text past the portrait (KAIF 2.7).**']],
    // CL (2.7, origin issues #62/#63): the word "test" is DEFINED and the run report carries TWO lines — the canon
    // of both layers, the template and the closing status of a bug say the same words, the linter judges the
    // second line, the contour says the boundary of its own claim, and the judge hunts both skins of the class
    // (hygiene reported as "tested"; a claim wider than the observation)
    ['test defined ↔ TESTING_FRAMEWORK carries the definition and the two lines (payload)', 'framework/TESTING_FRAMEWORK.md',
      ['## What the word "test" means', 'Hygiene:', 'Functional run:', 'inadmissible to production']],
    ['test defined ↔ TESTING_FRAMEWORK (wrapper)', 'TESTING_FRAMEWORK.md',
      ['## Что значит слово «тест»', 'Гигиена:', 'Функциональный прогон:', 'в продакшен не допускается']],
    ['test defined ↔ the run-report template carries the two lines', 'framework/templates/_testrun-report-template.md',
      ['Hygiene:', 'Functional run:']],
    ['test defined ↔ /report-bug closing status carries the two lines (payload)', 'framework/skills/report-bug/SKILL.md',
      ['Hygiene:', 'Functional run:']],
    ['test defined ↔ /report-bug closing status carries the two lines (wrapper)', '.claude/skills/report-bug/SKILL.md',
      ['Гигиена:', 'Функциональный прогон:']],
    ['test defined ↔ kaif-testrun-lint judges the second line in both languages', 'framework/tools/kaif-testrun-lint.mjs',
      ["'pass-without-functional-run'", "functional: 'Functional run'", "functional: 'Функциональный прогон'"]],
    ['claim ↔ AGENT_GUIDE fable-loop call point carries the fifth obligation (payload)', 'framework/AGENT_GUIDE.md',
      ['A CLAIM IS NEVER WIDER THAN THE OBSERVATION BEHIND IT', 'claim-wider-than-observation hunt', 'tested-on-hygiene-alone hunt']],
    ['claim ↔ AGENT_GUIDE fable-loop call point carries the fifth obligation (wrapper)', 'AGENT_GUIDE.md',
      ['ЗАЯВЛЕНИЕ НЕ ШИРЕ НАБЛЮДЕНИЯ']],
    ['claim ↔ the shipped contour says the boundary at every window it raises', 'framework/tools/contour/review.mjs',
      ['this line does not verify']],
    ['claim ↔ /fable-judge hunts both skins of the class', 'framework/skills/fable-judge/SKILL.md',
      ['**Claim wider than the observation (KAIF 2.7).**', '**Tested on hygiene alone (KAIF 2.7).**']],
    // IW (2.7, origin issue #64): the contour's window invariants got a MACHINE — the generator reuses the previous
    // run's port and the page reports a tab; the skill ships the launch as a command in both layers; the contract
    // names both; the judge hunts a contour raised outside its window.
    ['contour window ↔ the generator reuses the previous port and the page reports a tab', 'framework/tools/contour/review.mjs',
      ['reused from the previous run', 'display-mode: standalone', "req.url === '/tab'"]],
    ['contour window ↔ the page texts carry the tab note (EN + RU)', 'framework/tools/contour/texts.mjs',
      ['tabnote:']],
    ['contour window ↔ /owner-reviews ships the launch command (payload)', 'framework/skills/owner-reviews/SKILL.md',
      ['run_in_background: true', '.kaif/contour.log', "PREVIOUS run's port"]],
    ['contour window ↔ /owner-reviews ships the launch command (wrapper)', '.claude/skills/owner-reviews/SKILL.md',
      ['run_in_background: true', '.kaif/contour.log']],
    ['contour window ↔ the contract names the previous port and the tab check', 'framework/templates/_interactive-contour-spec.md',
      ['previous run', 'display-mode: standalone']],
    ['contour window ↔ /fable-judge hunts a contour raised outside its window', 'framework/skills/fable-judge/SKILL.md',
      ['**Contour raised outside its window (KAIF 2.7).**']],
    // SD (2.7, origin issue #65 — a recurrence of #37): the AUTH carve-out stands IN THE GATE'S LINE in both layers,
    // /report-bug files and delivers in one step in both layers, the core's check names an undelivered signal with
    // the ready command, the judge hunts a signal filed and not delivered.
    ['signal ↔ AGENT_GUIDE carries the carve-out in the AUTH line (payload)', 'framework/AGENT_GUIDE.md',
      ['the one carve-out of the `AUTH:` gate', 'kaif-core.mjs report']],
    ['signal ↔ AGENT_GUIDE carries the carve-out in the AUTH line (wrapper)', 'AGENT_GUIDE.md',
      ['единственное исключение из ворот `AUTH:`', 'kaif-core.mjs report']],
    ['signal ↔ /report-bug files and delivers in one step (payload)', 'framework/skills/report-bug/SKILL.md',
      ['File AND deliver', 'kaif-core.mjs report bugs/KAIF/NN_*.md']],
    ['signal ↔ /report-bug files and delivers in one step (wrapper)', '.claude/skills/report-bug/SKILL.md',
      ['Заведение и доставка — ОДИН шаг', 'kaif-core.mjs report bugs/KAIF/NN_*.md']],
    ['signal ↔ the core names an undelivered signal', 'framework/installer/KAIF-CORE.mjs',
      ['undelivered KAIF signal', '@guard undelivered-signal']],
    // The axis is an ALLOWLIST read by the one function `report` shares: the field's own tickets carried the class
    // in four forms (NOT YET · translated field name · a promise · no line), and a NOT-YET-only denylist saw one.
    ['signal ↔ the core reads delivery by positive evidence, one reading for report and check', 'framework/installer/KAIF-CORE.mjs',
      ['function deliveryState(text)', 'no readable delivery state', 'const ds = deliveryState(text);']],
    ['signal ↔ /report-bug keeps the machine-read field name verbatim (payload)', 'framework/skills/report-bug/SKILL.md',
      ['the field name stays verbatim (English, bold, its own line) in any', '(`NOT YET`, a promise, a missing or translated line)']],
    ['signal ↔ /report-bug keeps the machine-read field name verbatim (wrapper)', '.claude/skills/report-bug/SKILL.md',
      ['остаётся дословным — по-английски, жирным, отдельной строкой', '(`NOT YET`, обещание, строка пропущена или']],
    ['signal ↔ /fable-judge hunts a signal filed, not delivered', 'framework/skills/fable-judge/SKILL.md',
      ['**Signal filed, not delivered (KAIF 2.7).**']],
    // HO (2.7, origin issue #57): the rule "a term absurd in the owner's language is checked against
    // the skill's trigger aliases" is only true while the alias it cites is REALLY in the ru pack —
    // the field defect was exactly this pair drifting apart (the canon said `baton`, the aliases said
    // «эстафета»). Both layers carry the rule; the ru pack carries the alias that proves it.
    ['Languages ↔ the localization rule cites the trigger aliases (payload)', 'framework/AGENT_GUIDE.md',
      ['trigger aliases', 'skill-triggers.json']],
    ['Languages ↔ the localization rule cites the trigger aliases (wrapper)', 'AGENT_GUIDE.md',
      ['ТРИГГЕР-АЛИАСАМИ', 'skill-triggers.json']],
    ['Languages ↔ the ru pack really carries the alias the rule cites', 'framework/templates/languages/ru/skill-triggers.json',
      ['передай эстафету']],
    // O5 criterion 5, TWO outcomes only (bugs/72): a hook contract is either CONFIRMED against a
    // live vendor doc or it says "not verified" — "probably works" is the retired third outcome.
    // Grok Build runs our config and its NATIVE contract calls these events passive, so the
    // injection half is unverified; both tables that a field owner reads must SAY so, in the cell
    // he scans and not in prose twelve lines below it. The retired ✅ form is forbidden below.
    ['Grok Build injection caveat ↔ hooks module README', 'framework/hooks/README.md',
      ['injection not verified']],
    ['Grok Build injection caveat ↔ adapters index', 'framework/adapters/_index.md',
      ['injection not verified']],
    // 2.7, epic RS — the leading-word rule (the origin owner's word 2026-09-18: "resume" at the top of
    // a message is an ORDER): the rule in the guide of both layers, the aliases in the skill of both
    // layers and the ru pack, the installer's context pointer, the hook, its sample wiring, the judge.
    ['leading word rule ↔ AGENT_GUIDE (payload)', 'framework/AGENT_GUIDE.md',
      ['### A leading skill word is an order']],
    ['leading word rule ↔ AGENT_GUIDE (origin, ru)', 'AGENT_GUIDE.md',
      ['### Первое слово сообщения владельца — команда']],
    ['leading word rule ↔ /resume description (payload)', 'framework/skills/resume/SKILL.md',
      ['FIRST word of the human\'s message']],
    ['leading word rule ↔ /resume description (origin, ru)', '.claude/skills/resume/SKILL.md',
      ['ПЕРВЫМ словом сообщения владельца']],
    ['leading word rule ↔ ru language pack aliases', 'framework/templates/languages/ru/skill-triggers.json',
      ['«resume», «резюм», «резюме»']],
    ['leading word rule ↔ installer context pointer', 'framework/installer/KAIF-CORE.mjs',
      ['is an ORDER to run ']],
    ['leading word rule ↔ hooks module README', 'framework/hooks/README.md',
      ['prompt-resume-word.mjs', 'prompt field not verified']],
    ['leading word rule ↔ hooks sample config', 'framework/hooks/settings-fragment.json',
      ['.kaif/hooks/prompt-resume-word.mjs']],
    ['leading word rule ↔ judge hunt', 'framework/skills/fable-judge/SKILL.md',
      ['Resume word ignored (KAIF 2.7)']],
    // SF (2.7, origin issue #67): the retraction procedure stands in the canon of BOTH layers, the closing rituals ask
    // for the class by name, the sphere libraries name a retraction command per outward channel, and the judge hunts a
    // claim the session itself refuted and left standing.
    ['falsehood ↔ AGENT_GUIDE carries the sixth obligation with its command (payload)', 'framework/AGENT_GUIDE.md',
      ['A FALSEHOOD IS CORRECTED WHERE IT STANDS', 'a **standing falsehood**', 'git grep -n "<the phrase>"']],
    ['falsehood ↔ AGENT_GUIDE carries the sixth obligation with its command (wrapper)', 'AGENT_GUIDE.md',
      ['ЛОЖЬ ИСПРАВЛЯЕТСЯ ТАМ, ГДЕ ОСТАВЛЕНА', '**стоячая ложь**', 'git grep -n "<фраза>"']],
    ['falsehood ↔ /end-chat-soft asks for the class by name (payload)', 'framework/skills/end-chat-soft/SKILL.md',
      ['`Standing falsehood: none`', 'which statement of this session']],
    ['falsehood ↔ /end-chat-soft asks for the class by name (wrapper)', '.claude/skills/end-chat-soft/SKILL.md',
      ['`Стоячая ложь: нет`', 'какое утверждение этой сессии']],
    ['falsehood ↔ /end-chat-force keeps the line in force mode (payload)', 'framework/skills/end-chat-force/SKILL.md',
      ['The standing falsehood line', 'Standing falsehood: none']],
    ['falsehood ↔ /end-chat-force keeps the line in force mode (wrapper)', '.claude/skills/end-chat-force/SKILL.md',
      ['Строка стоячей лжи', 'Стоячая ложь: нет']],
    ['falsehood ↔ the sphere template carries the retraction slot', 'framework/spheres/_template.md',
      ['## Outward write channels → retraction command']],
    ['falsehood ↔ the reference sphere fills the retraction slot with commands', 'framework/spheres/programming.md',
      ['## Outward write channels → retraction command', 'gh issue comment <N> --edit-last --body-file <file>']],
    ['falsehood ↔ /fable-judge hunts a standing falsehood', 'framework/skills/fable-judge/SKILL.md',
      ['**Standing falsehood (KAIF 2.7).**']],
    // FR (2.7, origin issue #68): the obligation is a RULE of its own in both layers, the board row carries the
    // request, the constitution is in the seat's re-read core, the core compares a generated constitution against
    // the template, and the judge hunts both halves (the idle seat, and the seat refreshed without the document).
    ['free seat ↔ the constitution template carries the rule with its exit condition (payload)',
      'framework/skills/team-deployment/references/team-constitution-template.md',
      ['**A free seat asks for work.**', 'ONE message to the Manager', 'idling that the owner had to end is a defect']],
    ['free seat ↔ the constitution template carries the rule with its exit condition (wrapper)',
      '.claude/skills/team-deployment/references/team-constitution-template.md',
      ['**Свободное место просит работу.**', 'ОДНО сообщение', 'простой, который пришлось прервать']],
    ['free seat ↔ the constitution template puts the board row and the re-read core in writing (payload)',
      'framework/skills/team-deployment/references/team-constitution-template.md',
      ['carries the request in the SAME write', 'RE-READ CORE', 'name it in the refresh marker\'s']],
    ['free seat ↔ the board row carries the request and the tool contract asks (payload)',
      'framework/skills/team-deployment/references/team-status-board-template.md',
      ['the row carries the REQUEST', '`--free --asking "<candidates>"`']],
    ['free seat ↔ the board row carries the request and the tool contract asks (wrapper)',
      '.claude/skills/team-deployment/references/team-status-board-template.md',
      ['строка несёт ЗАПРОС', '`--free --asking "<кандидаты>"`']],
    ['free seat ↔ /team-deployment runs check after generation (payload)',
      'framework/skills/team-deployment/SKILL.md',
      ['node .kaif/kaif-core.mjs check', 'A finished seat announces itself FREE, naming candidates']],
    ['free seat ↔ /team-deployment runs check after generation (wrapper)',
      '.claude/skills/team-deployment/SKILL.md',
      ['node .kaif/kaif-core.mjs check', 'Закончившее место объявляет себя СВОБОДНЫМ, называя кандидатов']],
    ['free seat ↔ the core compares a generated constitution against its template',
      'framework/installer/KAIF-CORE.mjs',
      ['@guard constitution-keeps-obligations', 'lost ${lost.length} obligation(s) of the template',
       'cannot match translated anchors']],
    ['free seat ↔ /fable-judge hunts the idle seat and the seat refreshed without the constitution',
      'framework/skills/fable-judge/SKILL.md',
      ['**Idle seat ended by the owner (KAIF 2.7).**',
       '**Team seat refreshed without the constitution (KAIF 2.7).**']],
    // LP (2.7, origin issue #66 + the origin owner's word on interview 032): the close command, the input state in the
    // lock, the project profile and the recovery live in the shipped generator; the contract, /owner-reviews and the guide
    // of both layers name them; the machinery ignores the profile first; the polygon refuses a stale dist; the judge hunts.
    ['live page ↔ the generator closes only by the checked command and refuses an unknown flag', 'framework/tools/contour/review.mjs',
      ['export async function closeContour(', 'was NOT killed: a pid from a file may belong to another process', 'the owner is typing; not closed', 'younger than the quiet threshold', 'const KNOWN_FLAGS = [', 'refusing BEFORE any page, sound or call']],
    ['live page ↔ the answer survives the server: the project profile, the local store, the recovery', 'framework/tools/contour/review.mjs',
      ["const WINDOW_PROFILE_DIR = '.kaif/contour-window';", 'export function recoverFromWindow(', 'answer recovered from the owner', "localStorage.setItem(DK+'__submitted'", "indexedDB.open('kaif-contour'", 'recovery deferred: a browser still holds the project profile']],
    ['live page ↔ the record says the answer was picked up', 'framework/tools/contour/core.mjs',
      ['recovered: true', 'closeQuietMs']],
    ['live page ↔ the one-page contract names the close command, the profile and the unknown-flag refusal', 'framework/templates/_interactive-contour-spec.md',
      ['**A live owner page is closed only by `<doc> --close`**', '**The answer survives the server**', '**An unknown flag REFUSES before any page, sound or call — exit 1**']],
    ['live page ↔ /owner-reviews carries I46 and I47 (payload)', 'framework/skills/owner-reviews/SKILL.md',
      ['**I46. A live owner page is closed ONLY by `<doc> --close`', '**I47. The answer survives the server', 'One number space, I1–I47.', 'The 47 invariants below']],
    ['live page ↔ /owner-reviews carries I46 and I47 (wrapper)', '.claude/skills/owner-reviews/SKILL.md',
      ['**I46. Живую страницу владельца закрывает ТОЛЬКО `<док> --close`', '**I47. Ответ переживает сервер', 'Единое пространство номеров I1–I47.', '47 инвариантов ниже']],
    ['live page ↔ AGENT_GUIDE: un-showing is a checked action (payload)', 'framework/AGENT_GUIDE.md',
      ['is CLOSED only by the command that checks', 'review.mjs <doc> --close` (KAIF 2.7, origin issue #66']],
    ['live page ↔ AGENT_GUIDE: un-showing is a checked action (wrapper)', 'AGENT_GUIDE.md',
      ['ЗАКРЫВАЕТ только команда, которая её проверяет', 'снятие показа — проверенное действие.']],
    ['live page ↔ the machinery ignores the window profile FIRST', 'framework/installer/KAIF-CORE.mjs',
      ["'.kaif/contour-window/',"]],
    ['live page ↔ /fable-judge hunts a page closed past its command', 'framework/skills/fable-judge/SKILL.md',
      ['**Live page closed past its command (KAIF 2.7).**']],
    // AQ (2.7, origin issue #70): the archaeology axis lives in the shipped core, the door prints the command,
    // both layers of /interview carry the five steps, the contract page has the article, and the judge hunts it.
    ['archaeology ↔ the shipped core refuses a live question with no attestation and prints the grep',
      'framework/tools/contour/core.mjs',
      ['ARCHAEOLOGY_SINCE', 'no archaeology line', 'hits and `prior: none`', 'archaeology: n/a']],
    ['archaeology ↔ the door reports both answers of the axis (payload texts, both languages)',
      'framework/tools/contour/texts.mjs',
      ['live question(s) attested', 'not judged — header date', 'archaeologyStopWords']],
    ['archaeology ↔ /interview carries the five steps (payload)',
      'framework/skills/interview/SKILL.md',
      ['### Step 3d. Archaeology BEFORE the question', 'READ the hits', 'prior: unrelated']],
    ['archaeology ↔ /interview carries the five steps (wrapper)',
      '.claude/skills/interview/SKILL.md',
      ['### Шаг 3г. Археология ДО вопроса', 'ПРОЧИТАЙ попадания', 'prior: unrelated']],
    ['archaeology ↔ the contour contract page has the article',
      'framework/templates/_interactive-contour-spec.md',
      ['Second axis of the same door — ARCHAEOLOGY', 'is an honest attestation']],
    ['archaeology ↔ /fable-judge hunts a question asked past its archaeology',
      'framework/skills/fable-judge/SKILL.md',
      ['**Question asked past its archaeology (KAIF 2.7).**']],
    // EL (2.7, origin issue #69): the class is the unit of recurrence in both layers, the module carries the
    // deadline and both fates, the closing ritual runs it, the journal template ships the starter class list,
    // and the judge hunts the repeated class.
    ['lesson repeat ↔ the shipped module carries the deadline and both fates',
      'framework/tools/kaif-experience-lint.mjs',
      ['@guard experience-lesson-repeat', 'name the guard in the entry', 'class-ok: ${k}',
       'recurrence of a class cannot be counted']],
    ['lesson repeat ↔ /experience carries the class field (payload)',
      'framework/skills/experience/SKILL.md',
      ['class: <slug>', 'the **unit of recurrence**', 'kaif-experience-lint.mjs check']],
    ['lesson repeat ↔ /experience carries the class field (wrapper)',
      '.claude/skills/experience/SKILL.md',
      ['класс: <слаг>', 'единица счёта повтора', 'tools/experience-lint.mjs']],
    ['lesson repeat ↔ the closing ritual runs the deadline (payload)',
      'framework/skills/end-chat-soft/SKILL.md',
      ['node .kaif/tools/kaif-experience-lint.mjs check', 'never by writing a third record']],
    ['lesson repeat ↔ the closing ritual runs the deadline (wrapper)',
      '.claude/skills/end-chat-soft/SKILL.md',
      ['node tools/experience-lint.mjs', 'третья запись судьбой не является']],
    ['lesson repeat ↔ the journal template ships the class field and the starter list',
      'framework/EXPERIENCE.md',
      ['class: <slug from the class list below', '<!-- classes: question-already-answered',
       'The deadline is RUN, not remembered']],
    ['lesson repeat ↔ the origin eats its own shipment through a wrapper',
      'tools/experience-lint.mjs',
      ['framework/tools/kaif-experience-lint.mjs', '--write-baseline']],
    ['lesson repeat ↔ the origin journal carries the classes and the declared prices',
      'EXPERIENCE.md',
      ['<!-- классы: escaping-layer', '<!-- class-ok: guard-not-proven-against-threat',
       'Крайний срок ПРОГОНЯЕТСЯ, а не вспоминается']],
    ['lesson repeat ↔ /fable-judge hunts the class repeated without a mechanism',
      'framework/skills/fable-judge/SKILL.md',
      ['**Lesson repeated without a mechanism (KAIF 2.7).**',
       'lesson-repeated-without-a-mechanism']],
    // CR (2.7, the owner's word #113): the skill rewritten by its executor was then RUN, and the seven places where the
    // executor stopped were fixed in both layers — the payload and the origin's translated copy move together.
    ['code-revision ↔ the seven fixes of the functional run (payload skill)',
      'framework/skills/code-revision/SKILL.md',
      ['WHOSE SCOPE CROSSES THE ZONE', 'in units the executor CAN measure', 'IN THE AUDIT CARD always',
       'it is never read as green', 'an invented number is worse than none']],
    ['code-revision ↔ the seven fixes of the functional run (wrapper skill)',
      '.claude/skills/code-revision/SKILL.md',
      ['ЧЕЙ ОХВАТ ПЕРЕСЕКАЕТ ЗОНУ', 'УМЕЕТ измерить', 'В КАРТОЧКЕ АУДИТА всегда', 'улика ОТСУТСТВИЯ',
       'выдуманное число хуже отсутствующего']],
    ['code-revision ↔ audit files are indexed by date (payload reference)',
      'framework/skills/code-revision/references/audit-report-template.md',
      ['the index of a file is its DATE, not a running number']],
    ['code-revision ↔ audit files are indexed by date (wrapper reference)',
      '.claude/skills/code-revision/references/audit-report-template.md',
      ['индекс файла — ДАТА, а не порядковый номер']],
    // CB (2.7, origin issues #43/#45/#71): the budget counts the project's own lines and names the address,
    // the flag makes it a door, the mix is judged by token share, the pack note follows the success line,
    // both layers of the closing ritual run the flag, and the Reference describes all of it.
    ['canon budget ↔ the shipped core counts OWN lines and names the address',
      'framework/installer/KAIF-CORE.mjs',
      ['function ownLines(doc)', 'arrived with KAIF and are not counted', 'MOVE_OUT_ADDRESS',
       'owner-seeded document whose shipped skeleton']],
    ['canon budget ↔ the shipped core turns the budget into a door',
      'framework/installer/KAIF-CORE.mjs',
      ['--gate-budgets', 'raising a budget is not the cure', '@guard doc-budgets']],
    ['canon budget ↔ the shipped core judges the language mix by token share',
      'framework/installer/KAIF-CORE.mjs',
      ['LANGUAGE_MIX_FOREIGN_SHARE', 'stripCodeSpans', 'skills are a MIX']],
    ['canon budget ↔ the pack note follows the success line and says what to report',
      'framework/installer/KAIF-CORE.mjs',
      ['function packHonesty', 'WHAT TO REPORT', 'is not a defect']],
    ['canon budget ↔ the closing ritual runs the door (payload)',
      'framework/skills/end-chat-soft/SKILL.md',
      ['node .kaif/kaif-core.mjs check --gate-budgets', 'Raising a budget is not the cure']],
    ['canon budget ↔ the closing ritual runs the door (wrapper)',
      '.claude/skills/end-chat-soft/SKILL.md',
      ['node .kaif/kaif-core.mjs check --gate-budgets', 'node tools/budget-gate.mjs']],
    // The origin cannot run the shipped door (it holds the SOURCE, not a deployment), so its closing ritual runs
    // its own: the wrapper reads the numbers from the ONE place they live — the shipped core's table.
    ['canon budget ↔ the origin door reads the shipped table, never a copy of its numbers',
      'tools/budget-gate.mjs',
      ['const DOC_BUDGETS = {', '@guard origin-budget-gate', 'raising a budget is not the cure']],
    ['canon budget ↔ the Reference describes the new check',
      'framework/KAIF_REFERENCE.md',
      ['own lines N of budget ~M', 'OWNER-SEEDED document whose shipped skeleton', '--gate-budgets']],
    ['canon budget ↔ /fable-judge hunts a budget raised instead of content moved',
      'framework/skills/fable-judge/SKILL.md',
      ['**Budget raised instead of content moved (KAIF 2.7).**',
       'budget-raised-instead-of-content-moved']],
    // CK (2.8, origin issue #90): the own-work step of the checklist is judged — the hunt and its declaration in the header
    ['own work ↔ /fable-judge hunts re-derived own work',
      'framework/skills/fable-judge/SKILL.md',
      ['**Re-derived own work (KAIF 2.8).**', 're-derived-own-work', 'eight marked KAIF patches']],
    // CK4.5 (2.8, origin issues #89/#90): tier 4 has a FILE — the skeleton carries the rule form of an owner's standing
    // rule, the canon and /fix-vision carry the command that produces the copy, /resume reads the copy at entry
    ['house rules ↔ the skeleton carries the copy command and the owner-rule form', 'framework/templates/_house-rules-template.md',
      ['cp .kaif/_house-rules-template.md HOUSE_RULES.md', '[OWNER] <date and time> · <where the verbatim lives']],
    ['house rules ↔ AGENT_GUIDE taxonomy tier 4 names the file and the copy command', 'framework/AGENT_GUIDE.md',
      ['cp .kaif/_house-rules-template.md HOUSE_RULES.md']],
    ['house rules ↔ /fix-vision step 3 copies the skeleton', 'framework/skills/fix-vision/SKILL.md',
      ['cp .kaif/_house-rules-template.md HOUSE_RULES.md']],
    ['house rules ↔ /resume Step 1 reads the copy when it exists', 'framework/skills/resume/SKILL.md',
      ['- **If the project has one:** `HOUSE_RULES.md` — ']],
    ['house rules ↔ AGENT_GUIDE taxonomy tier 4 names the file and the copy command (wrapper)', 'AGENT_GUIDE.md',
      ['cp .kaif/_house-rules-template.md HOUSE_RULES.md']],
    ['house rules ↔ /fix-vision step 3 copies the skeleton (wrapper)', '.claude/skills/fix-vision/SKILL.md',
      ['cp .kaif/_house-rules-template.md HOUSE_RULES.md']],
    ['house rules ↔ /resume Step 1 reads the copy when it exists (wrapper)', '.claude/skills/resume/SKILL.md',
      ['- **Если он есть:** `HOUSE_RULES.md` — ']],
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
    // The creed's English carrier once said "WE KEEP TRYING" and field deployments back-translated
    // it as «продолжаем пытаться»; the owner's word is «стараемся» — "we strive" (bugs/110). The
    // retired wording is forbidden so the creed cannot drift back to "trying".
    [/KEEP(?:S)? TRYING/, 'the retired creed wording "keep trying" — the owner\'s word is «стараемся» = "strive" (bugs/110)'],
    // The hooks module README once claimed a universal — "every hook carries a predicate and a cooldown" —
    // while its own table said "none" for one predicate and a shipped script's header said "No cooldown"
    // (bugs/121 F10). The observed wording replaced it; the retired universal is forbidden so it cannot
    // come back the next time a hook is added. Whitespace-tolerant: the original wrapped mid-phrase. Case-insensitive since 2.8 (epic OW):
    // KAIF_REFERENCE carried it capitalized at a sentence start and the case-sensitive pattern never saw it — found when the fifth hook
    // (the owner-word gate, no cooldown at all) made the sentence false twice over.
    [/every hook carries a\s+predicate and a\s+cooldown/i, 'the retired universal about the hooks module ("every hook carries a predicate and a cooldown") — one suppression window exists, on `Stop`; say what each hook does (bugs/121 F10)'],
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
    // mirrors the build's recursive walk (2.6, epic IC: tool modules may live in subdirectories such as
    // framework/tools/contour/) — a subdirectory the build ships and this count misses would fail the pin
    const countToolMods = (dir) => readdirSync(dir).reduce((n, f) => {
      const p = join(dir, f);
      return n + (statSyncTop(p).isDirectory() ? countToolMods(p) : (f.endsWith('.mjs') ? 1 : 0));
    }, 0);
    const toolMods = existsSync(toolsDir2) ? countToolMods(toolsDir2) : 0;
    // the optional refresh-hooks module (epic O, 2.2): every FILE in framework/hooks/ ships to
    // .kaif/hooks/ (the filter mirrors the build's — a stray directory is ignored by both sides)
    const hooksDir = join(ROOT, 'framework', 'hooks');
    const hookFiles = existsSync(hooksDir)
      ? readdirSync(hooksDir).filter((f) => statSyncTop(join(hooksDir, f)).isFile()).length : 0;
    // root-level framework/templates/*.md are embedded as .kaif/ payloads (e.g. the owner-voice
    // portrait skeleton); languages/ underneath is counted separately as lang-pack files
    const tmplDir = join(ROOT, 'framework', 'templates');
    // 2.8 (epic OW, OW9): the explanation-page skeleton is an .html template — the count sees what the build ships
    const tmpls = existsSync(tmplDir) ? readdirSync(tmplDir).filter((f) => /\.(md|html)$/.test(f)).length : 0;
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
    const vjson = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8').replace(/^\uFEFF/, ''));
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

    // 10. ONE flag list, two carriers (2.6, UR1; origin issue #42): the loader validates the flags it
    //     hands to `install` BEFORE it downloads the core — so the list must live in the loader too,
    //     and the two copies must be EQUAL: loader INSTALL_FLAGS == core COMMANDS.install.flags minus
    //     --bundle (the loader supplies that one itself). Read from the SOURCES, compared as sets of
    //     (flag, takes-a-value). Red proven by removing one flag from the loader's copy (2026-09-05).
    {
      const coreSrc = readFileSync(join(ROOT, 'framework', 'installer', 'KAIF-CORE.mjs'), 'utf8');
      const loaderSrc = readFileSync(join(ROOT, 'framework', 'installer', 'KAIF-LOADER.mjs'), 'utf8');
      const flagsOf = (src, re, label) => {
        const m = src.match(re);
        if (!m) { errors.push(`install-flag pair: ${label} not found — the guard cannot read it`); return null; }
        return Object.fromEntries([...m[1].matchAll(/'(--[a-z-]+)':\s*(true|false)/g)].map((x) => [x[1], x[2] === 'true']));
      };
      const coreFlags = flagsOf(coreSrc, /\n\s*install:\s*\{[^\n]*?flags:\s*\{([^}]*)\}/, 'COMMANDS.install.flags in KAIF-CORE.mjs');
      const loaderFlags = flagsOf(loaderSrc, /const INSTALL_FLAGS = \{([^}]*)\}/, 'INSTALL_FLAGS in KAIF-LOADER.mjs');
      if (coreFlags && loaderFlags) {
        delete coreFlags['--bundle'];
        const a = JSON.stringify(Object.entries(coreFlags).sort()), b = JSON.stringify(Object.entries(loaderFlags).sort());
        if (a !== b) errors.push(`install-flag pair DRIFT: loader INSTALL_FLAGS ${b} ≠ core install flags minus --bundle ${a} — an unknown flag would again be refused only AFTER the core is written (origin #42)`);
        else distNote += ' · loader↔core install flags paired';
      }
    }

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
      // Guard 5f (2.7, epic HO): headings that vanished since the PREVIOUS RELEASE without a rename
      // or a deprecation behind them. A warning, never a failure — see the @guard block above.
      try {
        const { execFileSync } = await import('node:child_process');
        const git = (args) => execFileSync('git', args, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
        const prev = git(['tag', '--list', 'v*', '--sort=-v:refname']).split('\n').map((s) => s.trim()).filter(Boolean)[0];
        if (!prev) console.log('ℹ гард 5f (исчезнувшие заголовки): SKIPPED — в репозитории нет тега релиза, сверять не с чем');
        else {
          const oldMap = JSON.parse(git(['show', `${prev}:dist/kaif-module-map.json`]));
          const metaBlock = readFileSync(join(distDir, 'KAIF-CORE-BUNDLE.md'), 'utf8')
            .match(/^> \*\*FILE: `kaif-bundle-manifest\.json`\*\*[^\n]*\n\n`{6}\w*\n([\s\S]*?)\n`{6}/m);
          const meta = metaBlock ? JSON.parse(metaBlock[1]) : {};
          const gone = vanishedHeadings(oldMap.files || {}, mm.files || {}, meta.renamesByVersion, meta.deprecations);
          if (gone.length) {
            console.log(`⚠ гард 5f: с релиза ${prev} исчезли заголовки БЕЗ записи в renamesByVersion или DEPRECATIONS — ${gone.length}:`);
            for (const g of gone) console.log('   · ' + g);
            console.log('   Переименование? → объяви парой в RENAMES_BY_VERSION (build-framework.mjs). Удаление по делу? → эта строка просто прочитана.');
          } else distNote += ` · 5f: со ${prev} необъявленных исчезновений нет`;
          // 5g (bugs/114): a declared pair must be real on BOTH halves — an ERROR, because a typo here
          // silently returns the duplicate in every field tree AND silences 5f.
          const prevVer = prev.replace(/^v/, '');
          const broken = brokenRenames(oldMap.files || {}, mm.files || {}, meta.renamesByVersion, prevVer, (a, b) => parseFloat(a) > parseFloat(b));
          for (const b of broken) errors.push(`гард 5g: объявленная пара переименования не сходится с шаблонами — ${b}`);
          if (!broken.length) distNote += ' · 5g: объявленные пары сходятся';
        }
      } catch (e) {
        console.log('ℹ гард 5f (исчезнувшие заголовки): SKIPPED — ' + String(e.message || e).split('\n')[0].slice(0, 140));
      }
    }
  }
}

if (errors.length) {
  console.error('❌ check-framework FAILED:');
  for (const e of errors) console.error('   - ' + e);
  process.exit(1);
}
console.log(`✅ check-framework OK — ${fileBlocks} embedded files (${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${tools.length} tools), fences balanced, no stray markers${distNote}`);
