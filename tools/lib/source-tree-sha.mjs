// tools/lib/source-tree-sha.mjs — ONE fingerprint of everything that feeds `dist/` (epic LP 2.7, plans/111 step LP4;
// root cause of bugs/116 in the shipment: a polygon run against a STALE dist ran the OLD contour generator, which did
// not know a new flag, raised the page and called the owner by voice — five times in one night).
//
// The builder writes the fingerprint into dist/kaif-manifest.json (`sourceTree`); the polygon recomputes it before
// the first suite and REFUSES when they differ: "dist is stale — rebuild". The same function on both sides, so the
// two can never disagree about what "the sources" are. Inputs: every file under framework/ (the payload), the
// builder itself, the module-map library it shares with the validator, and version.json (the version line in the
// bundle header). Bytes as on disk — both sides read the same working tree on the same machine, so EOL never differs.
// ONE exception, paid for on the day the gate was born: version.json enters WITHOUT its `build` counter. tools/commit.mjs bumps
// `build` on every commit and the builder never reads it (it reads major · minor · released · codename) — hashed by bytes, the
// file made dist read as stale after EVERY commit, and the rebuild that cured it dirtied the tree for the next one.
//
// @guard sandbox-dist-fresh
// THREAT:         `npm run test:core` (or a probe) runs the contour generator of a dist older than framework/ —
//                 an old generator that does not know the flag under test and shows a page to the owner instead
// PROVED-AGAINST: `--selftest`: a fixture tree with a manifest carrying its own fingerprint → fresh; one byte
//                 changed in a source file → stale, named; a manifest without the field → stale, named
// GAP:            a dist rebuilt from a DIFFERENT checkout with byte-identical sources reads as fresh (correct by
//                 definition); files outside the input set that change the build (node itself, tools/lib helpers the
//                 builder imports beyond module-map-lib) are not fingerprinted — add them here when the builder does;
//                 version.json is projected (every key except `build`), so a field the builder starts reading from
//                 `build` would be invisible — it reads none today (grep "version.json" tools/build-framework.mjs)
// ON-REAL-PATH:   2026-09-18 09:07 +03:00 — the origin's own tree made stale on purpose (a probe file under framework/, no
//                 rebuild): `npm run test:core` refused before the first suite, naming both fingerprints; probe removed → green
// [TESTED: 2026-09-18 · the polygon gate observed on a REAL stale tree of the origin — a probe file dropped under
//  framework/ without a rebuild → `npm run test:core` refused before the first suite ("dist is stale — rebuild …
//  203 input file(s), fingerprint 21095775bd3f… ≠ built 20df56a6a775…"); the probe removed → the gate passes; the
//  --selftest below (fresh / one changed byte / field-less manifest / missing manifest) is the hygiene beside it —
//  testcases/reports/2026-09-18_contour-close-survive.md]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';

/** The input set, relative to the repo root — kept as data so both sides and the selftest read the same list. */
export const SOURCE_DIRS = ['framework'];
export const SOURCE_FILES = ['tools/build-framework.mjs', 'tools/module-map-lib.mjs', 'version.json'];

function walk(dir, out) {
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

/** Keys of version.json the fingerprint ignores: counters the commit tool bumps and the builder never reads. */
export const VERSION_JSON_IGNORED_KEYS = ['build'];

/** The bytes a file contributes: as on disk, except version.json — a canonical projection without the ignored keys. */
function inputBytes(root, rel) {
  const raw = readFileSync(join(root, rel));
  if (rel !== 'version.json') return raw;
  try {
    const j = JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, ''));
    const keys = Object.keys(j).filter((k) => !VERSION_JSON_IGNORED_KEYS.includes(k)).sort();
    return Buffer.from(JSON.stringify(keys.map((k) => [k, j[k]])), 'utf8');
  } catch { return raw; } // an unreadable version.json is hashed as it is — the builder will fail loudly on it anyway
}

/** sha256 over `relpath\0bytes\0` for every input file in sorted path order (forward slashes, repo-relative). */
export function sourceTreeSha(repoRoot) {
  const root = resolve(repoRoot);
  const files = [];
  for (const d of SOURCE_DIRS) if (existsSync(join(root, d))) walk(join(root, d), files);
  for (const f of SOURCE_FILES) if (existsSync(join(root, f))) files.push(join(root, f));
  const rel = files.map((p) => relative(root, p).replace(/\\/g, '/')).sort();
  const h = createHash('sha256');
  for (const r of rel) { h.update(r); h.update('\0'); h.update(inputBytes(root, r)); h.update('\0'); }
  return { sha256: h.digest('hex'), files: rel.length };
}

/** The gate: `{ fresh, reason }` — never throws; a missing manifest or field is "stale" with the reason named. */
export function distFreshness(repoRoot, distDir = join(resolve(repoRoot), 'dist')) {
  const manPath = join(distDir, 'kaif-manifest.json');
  if (!existsSync(manPath)) return { fresh: false, reason: 'no ' + manPath };
  let man;
  try { man = JSON.parse(readFileSync(manPath, 'utf8')); } catch (e) { return { fresh: false, reason: 'unreadable manifest: ' + e.message }; }
  if (!man.sourceTree || !man.sourceTree.sha256) return { fresh: false, reason: 'the manifest carries no sourceTree fingerprint (built before KAIF 2.7 LP)' };
  const now = sourceTreeSha(repoRoot);
  if (now.sha256 !== man.sourceTree.sha256) return { fresh: false, reason: 'sources changed since the build: ' + now.files + ' input file(s), fingerprint ' + now.sha256.slice(0, 12) + '… ≠ built ' + String(man.sourceTree.sha256).slice(0, 12) + '…' };
  return { fresh: true, reason: 'fingerprint matches (' + now.files + ' input files)' };
}

// ── selftest: red on a changed byte and on a manifest without the field; green on a matching fixture ──────────
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/source-tree-sha.mjs') && process.argv.includes('--selftest')) {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const R = mkdtempSync(join(tmpdir(), 'kaif-srcsha-'));
  const fails = [];
  const ok = (c, name) => { if (!c) fails.push(name); };
  try {
    mkdirSync(join(R, 'framework', 'skills'), { recursive: true }); mkdirSync(join(R, 'tools'), { recursive: true }); mkdirSync(join(R, 'dist'), { recursive: true });
    writeFileSync(join(R, 'framework', 'A.md'), 'a\n'); writeFileSync(join(R, 'framework', 'skills', 'B.md'), 'b\n');
    writeFileSync(join(R, 'tools', 'build-framework.mjs'), '// b\n'); writeFileSync(join(R, 'version.json'), '{"major":1}\n');
    const s1 = sourceTreeSha(R);
    ok(s1.files === 4, 'input set counts framework/** + builder + version.json (4)');
    writeFileSync(join(R, 'dist', 'kaif-manifest.json'), JSON.stringify({ sourceTree: s1 }));
    ok(distFreshness(R).fresh === true, 'fresh on a matching manifest');
    writeFileSync(join(R, 'version.json'), '{"major":1,"build":77}\n');
    ok(distFreshness(R).fresh === true, 'fresh after the commit tool bumped ONLY the build counter of version.json');
    writeFileSync(join(R, 'version.json'), '{"major":2,"build":77}\n');
    const fv = distFreshness(R);
    ok(fv.fresh === false && /sources changed/.test(fv.reason), 'stale when a field the builder reads (major) changed');
    writeFileSync(join(R, 'version.json'), '{"major":1}\n');
    ok(distFreshness(R).fresh === true, 'fresh again with the version restored');
    writeFileSync(join(R, 'framework', 'skills', 'B.md'), 'b!\n');
    const f2 = distFreshness(R);
    ok(f2.fresh === false && /sources changed/.test(f2.reason), 'stale on one changed byte, reason names it');
    writeFileSync(join(R, 'dist', 'kaif-manifest.json'), JSON.stringify({ version: '2.6' }));
    const f3 = distFreshness(R);
    ok(f3.fresh === false && /no sourceTree/.test(f3.reason), 'stale on a manifest without the field (pre-LP dist), reason names it');
    rmSync(join(R, 'dist', 'kaif-manifest.json'));
    ok(distFreshness(R).fresh === false, 'stale on a missing manifest');
  } finally { rmSync(R, { recursive: true, force: true }); }
  if (fails.length) { console.error('❌ source-tree-sha --selftest:\n  · ' + fails.join('\n  · ')); process.exit(1); }
  console.log('✅ source-tree-sha --selftest: fresh on a matching fixture and after a build-counter bump, red on a changed byte, on a changed version field, on a field-less manifest and on a missing one');
}
