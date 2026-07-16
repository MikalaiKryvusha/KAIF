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

const fwPath = join(ROOT, 'KAIF.md');
if (!existsSync(fwPath)) {
  console.error('❌ KAIF.md not found — run `node tools/build-framework.mjs` first.');
  process.exit(1);
}
const fw = readFileSync(fwPath, 'utf8');

// Expected embedded files = key-doc templates + directory-README templates + skill templates.
const docNames = ['AGENT_GUIDE.md', 'PHILOSOPHY.md', 'BUG_FIXING_FRAMEWORK.md', 'TESTING_FRAMEWORK.md',
                  'STATUS.md', 'EXPERIENCE.md', 'GOAL.md', 'MASTER_PLAN.md',
                  'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md',
                  'KAIF_FRAMEWORK.md'];
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
    const wantBundle = 1 + docs.length + readmes.length + skills.length + refs + spheres + langFiles;
    if (bundleBlocks !== wantBundle)
      errors.push(`bundle FILE blocks: found ${bundleBlocks}, expected ${wantBundle} (1 manifest + ${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${refs} refs + ${spheres} spheres + ${langFiles} lang-pack files)`);
    const man = JSON.parse(dread('kaif-manifest.json'));
    for (const n of ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md'])
      if (man.sha256[n] !== dsha(n)) errors.push(`kaif-manifest.json sha256 stale for ${n} — re-run the build`);
    distNote = ` · dist OK (bundle ${bundleBlocks} blocks, sha256 fresh)`;
  }
}

if (errors.length) {
  console.error('❌ check-framework FAILED:');
  for (const e of errors) console.error('   - ' + e);
  process.exit(1);
}
console.log(`✅ check-framework OK — ${fileBlocks} embedded files (${docs.length} docs + ${readmes.length} readmes + ${skills.length} skills + ${tools.length} tools), fences balanced, no stray markers${distNote}`);
