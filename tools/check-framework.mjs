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
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

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
                  'STATUS.md', 'EXPERIENCE.md', 'GOAL.md', 'MASTER_PLAN.md',
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
    const wantBundle = 1 + docs.length + readmes.length + skills.length + refs + spheres + toolMods + langFiles;
    if (bundleBlocks !== wantBundle)
      errors.push(`bundle FILE blocks: found ${bundleBlocks}, expected ${wantBundle} (1 manifest + ${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${refs} refs + ${spheres} spheres + ${toolMods} tool modules + ${langFiles} lang-pack files)`);
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
