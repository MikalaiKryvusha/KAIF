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
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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

// Embed one template file as a labelled fenced block, telling the agent which
// file to create in the target project and how to treat it. The fence language
// follows the file extension (markdown templates vs. the .mjs unpacker script).
function embedFile(relPath, destLabel, note) {
  const content = readFileSync(join(ROOT, relPath), 'utf8').replace(/\s+$/, '') + '\n';
  const header = `> **FILE: \`${destLabel}\`**${note ? ' — ' + note : ''}\n\n`;
  const lang = relPath.endsWith('.mjs') ? 'js' : 'md';
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
  'framework/STATUS.md':               ['STATUS.md',               "project root — seed with the project's current real state"],
  // Experience log added in 1.4 (grows on its own; living reference)
  'framework/EXPERIENCE.md':           ['EXPERIENCE.md',           'project root — seed this template; the agent grows it (skill: /experience)'],
  // Key docs added in 1.1
  'framework/GOAL.md':                 ['GOAL.md',                 'project root — owner-filled; if empty, seed this template and ask the owner'],
  'framework/MASTER_PLAN.md':          ['MASTER_PLAN.md',          'project root — derive from GOAL.md (skill: /revision)'],
  'framework/PROJECT_STRUCTURE_EXTERNAL_MAP.md':    ['PROJECT_STRUCTURE_EXTERNAL_MAP.md',    'project root — the external map, from your inspection'],
  'framework/PROJECT_ARCHITECTURE_INTERNAL_MAP.md': ['PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'project root — the internal map, adapted to the sphere'],
  'framework/KAIF_FRAMEWORK.md':       ['KAIF_FRAMEWORK.md',       'project root — write AFTER a successful injection (see §10)'],
  // Directory READMEs
  'framework/readmes/plans.md':        ['plans/README.md',        'create the directory and drop this README'],
  'framework/readmes/ideas.md':        ['ideas/README.md',        'create the directory and drop this README'],
  'framework/readmes/bugs.md':         ['bugs/README.md',         'create the directory and drop this README'],
  'framework/readmes/researches.md':   ['researches/README.md',   'create the directory and drop this README'],
  'framework/readmes/interviews.md':   ['interviews/README.md',   'create the directory and drop this README'],
  'framework/readmes/homeworks.md':    ['homeworks/README.md',    'create the directory and drop this README'],
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
let out = readFileSync(join(FW, '_intro.md'), 'utf8');

// Drop the authoring comment at the top of _intro.md; replace with a "generated" banner.
out = out.replace(/^<!--[\s\S]*?-->\n/, '');
out = '<!-- GENERATED FILE — do not edit by hand. Built from framework/_intro.md + framework/* by ' +
      'tools/build-framework.mjs. Edit the sources and re-run the tool. -->\n' + out;

// {{VERSION}}
out = out.replaceAll('{{VERSION}}', version()).replaceAll('{{RELEASED}}', released());

// {{EMBED:framework/...}}
out = out.replace(/\{\{EMBED:([^}]+)\}\}/g, (_, p) => {
  const key = p.trim();
  const t = DOC_TARGETS[key];
  return t ? embedFile(key, t[0], t[1]) : embedFile(key, key);
});

// {{EMBED_SKILLS}}
out = out.replace('{{EMBED_SKILLS}}', embedSkills());

writeFileSync(join(ROOT, 'KAIF.md'), out);
console.log(`✅ KAIF.md generated — ${out.split('\n').length} lines, v${version()} (${released()})`);

// --- Slim KAIF (idea 07) ----------------------------------------------------
// The Slim variant is a SECOND artifact: one file that IS the framework in place
// (no unpacking). It is self-contained prose — no {{EMBED}} markers — so the build
// only strips the authoring comment, stamps the version, and copies it to the root.
let slim = readFileSync(join(FW, 'KAIF-SLIM.md'), 'utf8');
slim = slim.replace(/^<!--[\s\S]*?-->\n/, '');
slim = '<!-- GENERATED FILE — do not edit by hand. Built from framework/KAIF-SLIM.md by ' +
       'tools/build-framework.mjs. Edit the source and re-run the tool. -->\n' + slim;
slim = slim.replaceAll('{{VERSION}}', version()).replaceAll('{{RELEASED}}', released());
writeFileSync(join(ROOT, 'KAIF-SLIM.md'), slim);
console.log(`✅ KAIF-SLIM.md generated — ${slim.split('\n').length} lines, v${version()} (${released()})`);

// Self-check the generated installer (idea 01): fail loudly if it is malformed.
try {
  execSync('node ' + JSON.stringify(join(ROOT, 'tools', 'check-framework.mjs')), { stdio: 'inherit' });
} catch {
  process.exit(1);
}
