// tools/module-map-lib.mjs — the module-map core shared by build-framework.mjs (generation)
// and check-framework.mjs (validation). ONE splitter, ONE classifier — two copies would drift
// (plan 21 §3.1; the spike proved the algorithm: 124 files → 517 modules, byte-identical rejoin).
//
// A MODULE is a logical section of a template: everything from one heading line (#/##/###,
// outside code fences) to the next. The text before the first heading is the <preamble> module
// (for skills that is the YAML frontmatter — the adaptive `description:` line lives there).
// The module's ADDRESS is its signature anchor: the full unique heading line (owner decision #16) —
// nothing is added to the documents; line numbers are derived and recomputed on every build.
import { createHash } from 'node:crypto';

// The canonical deploy-time placeholders — mirrors PLACEHOLDERS in framework/installer/KAIF-CORE.mjs
// (kept in two files deliberately small; the module map itself exposes drift: an adaptive module
// with no placeholder in it would be visible in the emitted map).
export const PLACEHOLDERS = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>',
  '<LICENSE>', '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  '<OWNER_LANGUAGE>'];

// Deploy destinations owned by the OWNER after deploy — every module of these is class `owner`
// (mirrors OWNER_SEEDED in KAIF-CORE.mjs).
export const OWNER_SEEDED_DESTS = ['GOAL.md', 'STATUS.md', 'EXPERIENCE.md', 'MASTER_PLAN.md',
  'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'KAIF_FRAMEWORK.md'];

export const MODULE_CLASSES = ['static', 'adaptive', 'owner'];

// Split one template into modules. Heading lines inside code fences are NOT anchors
// (the spike caught real cases). Returns [{ signature, lines: [..] }] in document order;
// joining all lines with '\n' reproduces the input byte-for-byte (guarded by the caller).
export function splitModules(content) {
  const lines = content.split('\n');
  const modules = [];
  let cur = { signature: '<preamble>', lines: [] };
  let inFence = false;
  for (const line of lines) {
    if (/^(`{3,}|~{3,})/.test(line.trim())) inFence = !inFence;
    if (!inFence && /^#{1,3} /.test(line)) {
      modules.push(cur);
      cur = { signature: line, lines: [] };
    }
    cur.lines.push(line);
  }
  modules.push(cur);
  // an empty preamble (file starts with a heading) is dropped — it carries zero bytes
  return modules.filter((m) => m.signature !== '<preamble>' || m.lines.join('').length > 0);
}

export const joinModules = (mods) => mods.flatMap((m) => m.lines).join('\n');

// Computed default class for a module (plan 21 §3.1). `overrides` come from
// framework/module-classes.json: { "<dest>": { "default": "...", "modules": { "<signature>": "..." } } }.
// Classification runs on the EFFECTIVE destination: a language-pack override of GOAL.md is
// classified as GOAL.md.
export function classifyModule(dest, mod, overrides = {}) {
  const eff = dest.replace(/^templates\/languages\/[^/]+\//, '');
  const o = overrides[eff] || overrides[dest];
  if (o && o.modules && o.modules[mod.signature]) return o.modules[mod.signature];
  if (o && o.default) return o.default;
  if (OWNER_SEEDED_DESTS.includes(eff)) return 'owner';
  const text = mod.lines.join('\n');
  if (PLACEHOLDERS.some((ph) => text.includes(ph))) return 'adaptive';
  // a skill's frontmatter is adaptive: the machinery injects trigger aliases into `description:`
  if (mod.signature === '<preamble>' && /^\.claude\/skills\//.test(eff) && /^description:/m.test(text)) return 'adaptive';
  return 'static';
}

// EOL-normalized like the core's normSha — the two implementations must hash identically
// even on a CRLF-tainted input (symmetry; the behavioral pin in check-framework enforces it).
const sha256 = (s) => createHash('sha256').update(String(s).replace(/\r\n/g, '\n')).digest('hex');

// Build the map entry for one deployable md file. Throws on a duplicate signature —
// signature anchors must stay unique per file (guard; the 1.6 canon has zero duplicates).
export function mapFile(dest, content, overrides = {}) {
  const mods = splitModules(content);
  if (joinModules(mods) !== content)
    throw new Error(`module split/join not byte-identical for ${dest} — the splitter contract is broken`);
  const seen = new Set();
  let lineNo = 1;
  return mods.map((m) => {
    if (m.signature !== '<preamble>') {
      if (seen.has(m.signature)) throw new Error(`duplicate signature anchor in ${dest}: "${m.signature}" — rename one heading (addresses must be unique)`);
      seen.add(m.signature);
    }
    const entry = { signature: m.signature, class: classifyModule(dest, m, overrides),
                    sha256: sha256(m.lines.join('\n')), lines: [lineNo, lineNo + m.lines.length - 1] };
    lineNo += m.lines.length;
    return entry;
  });
}

// Validate the overrides file itself: every referenced dest/signature must exist in the mapped
// set — a stale override (renamed heading, removed file) must fail the build, not rot silently.
export function validateOverrides(overrides, mapped) {
  const errors = [];
  for (const [dest, o] of Object.entries(overrides)) {
    if (dest.startsWith('_')) continue; // _readme etc.
    const entry = mapped[dest];
    if (!entry) { errors.push(`module-classes.json: override for unknown file "${dest}"`); continue; }
    if (o.default && !MODULE_CLASSES.includes(o.default)) errors.push(`module-classes.json: bad default class "${o.default}" for ${dest}`);
    for (const [sig, cls] of Object.entries(o.modules || {})) {
      if (!MODULE_CLASSES.includes(cls)) errors.push(`module-classes.json: bad class "${cls}" for ${dest} :: ${sig}`);
      if (!entry.some((m) => m.signature === sig)) errors.push(`module-classes.json: override for unknown signature in ${dest}: "${sig}"`);
    }
  }
  return errors;
}
