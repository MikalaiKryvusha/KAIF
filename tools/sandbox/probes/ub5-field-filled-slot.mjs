// tools/sandbox/probes/ub5-field-filled-slot.mjs — a PROBE (not a polygon suite): the field differential of step UB5 of KAIF version 2.10
// (epic UB). UB5 changed the text of the closing skills' commit slot; a deployment whose agent FILLED that slot (and the co-author line
// next to it) gets the module «Commit and push» kept for it and handed over with a module diff — and `update-verify` used to demand the
// co-author line's placeholders back (the UB5 judge, session 102: 7 of 8 field deployments of version 2.9 — research
// researches/38_kaif_2.10_scope_recon/judge-ub5.md, claim 4; this probe is that judge's script made permanent).
//   subjects — two fixtures (a v2.9 install from the tag and an install of the pre-UB5 build 3057175, each with the commit slot of
//              both closing skills filled by the project's own line) and every <deployment> argument (default: every sibling folder
//              of this repository whose `.kaif/kaif.json` says 2.9) as a git CLONE in the OS temp folder, the files a clone lacks
//              copied from the disk; the source is only read — HEAD, `git status`, the carried files and the closing skills by sha,
//              before and after.
//   route    — each subject is updated TWICE from the same starting copy: by THIS build and by the build 3057175 (before UB5), both
//              labelled 2.10, `--baseline` = dist of the tag v2.9; `update` by the deployed core, then `update-verify` and `check` by the
//              fresh one; no agent merge. Judged: «promised upstream line not found» lines naming a closing skill.
//   verdict  — BAD when this build names a «not found» in a closing skill of a line that skill already held at PRE_REV (since session
//              103: a line new in the template since then — bugs/140's farewell — is a merge, printed as a count, not this class). The total per subject and the files where it differs from
//              3057175 are printed as INFO (paths only): a module this build really changed — /release step 6 — is handed over with a
//              diff on a deployment that rewrote it, and `update-verify` then lists every template line of that module the deployment's
//              own flow does not carry (old lines included — the re-judgment of UB5, finding 5); the builder note 2.10 tells the field.
//              Deployments are printed by number, never by name; no text of a deployment's file is printed.
// The voice is silenced by the environment (empty KAIF_VOICE_TOOL); git identity — by the environment only (bugs/124). Run it alone
// (≈ 10 s per subject). The temp folder holds clones of the owner's projects: it is removed on OK and kept only on BAD (path printed).
// usage: node tools/sandbox/probes/ub5-field-filled-slot.mjs [<v2.9 deployment>…]
// [TESTED: 2026-11-17 20:51–20:53 +03:00 · two fixtures + git clones of eight v2.9 field deployments of this machine: 0 BAD on this build;
//  with KAIF_DIST = a copy of this dist whose core lacks the placeholder pattern — exactly 7 BAD (deployments #1–#7, one «not found» in the
//  closing skills each), as the UB5 judge saw; report testcases/reports/2026-11-17_ub5-no-sweeping-stage.md]
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, cpSync, readdirSync, rmSync, mkdtempSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PRE_REV = '3057175';
const RUN_TIMEOUT_MS = 600000;
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-ub5-field-'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-probe', GIT_AUTHOR_EMAIL: 'probe@localhost', GIT_COMMITTER_NAME: 'kaif-probe', GIT_COMMITTER_EMAIL: 'probe@localhost' };
delete ENV.KAIF_VOICE;
const git = (cwd, ...a) => { const r = spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8', maxBuffer: 1 << 26 }); return { code: r.status, out: (r.stdout || '').trim() }; };
const core = (cwd, args) => { const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 }); return { code: r.status, all: (r.stdout || '') + (r.stderr || '') }; };
const read = (p) => { try { return readFileSync(p); } catch { return null; } };
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK   ' : 'BAD  ') + line); };

// ---- the three builds: v2.9 (baseline), this build and the pre-UB5 build, the last two labelled 2.10
const DIST_FILES = ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'KAIF-FULL.md', 'KAIF.md', 'kaif-manifest.json', 'kaif-module-map.json'];
const fromRev = (rev, dir) => { mkdirSync(dir, { recursive: true }); for (const f of DIST_FILES) writeFileSync(join(dir, f), execFileSync('git', ['show', `${rev}:dist/${f}`], { cwd: REPO, maxBuffer: 1 << 27 })); return dir; };
const V29 = fromRev('v2.9', join(ROOT, 'v2.9'));
const PRE = fromRev(PRE_REV, join(ROOT, 'pre'));
const META_RE = /(^> \*\*FILE: `kaif-bundle-manifest\.json`\*\*[^\n]*\n\n`{6}\w*\n)([\s\S]*?)(\n`{6})/m;
function labelled(dist, name, ver) {
  const S = join(ROOT, name); mkdirSync(S);
  const b = readFileSync(join(dist, 'KAIF-CORE-BUNDLE.md'), 'utf8'); const m = b.match(META_RE); const meta = JSON.parse(m[2]); meta.version = ver;
  writeFileSync(join(S, 'KAIF-CORE-BUNDLE.md'), b.replace(META_RE, (_, a, __, c) => a + JSON.stringify(meta, null, 2) + c));
  copyFileSync(join(dist, 'KAIF-CORE.mjs'), join(S, 'KAIF-CORE.mjs'));
  const man = JSON.parse(readFileSync(join(dist, 'kaif-manifest.json'), 'utf8')); man.version = ver;
  for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = sha(readFileSync(join(S, f)));
  writeFileSync(join(S, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
  return S;
}
// KAIF_DIST — the seam for the red proof: «this build» taken from another dist (e.g. a copy whose core lacks the placeholder pattern)
const NEW_DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const SRC = { NEW: labelled(NEW_DIST, 'src-new', '2.10'), OLD: labelled(PRE, 'src-pre', '2.10') };

// ---- fixtures: the project's own line in the commit slot of both closing skills
const FILL = 'This project commits with its own tool: `node tools/commit.mjs "<msg>"` — it prints the set, stages it by name, commits and pushes.';
function fillSlot(P) {
  for (const n of ['end-chat-soft', 'end-chat-force']) {
    const f = join(P, '.claude', 'skills', n, 'SKILL.md'); const crlf = /\r\n/.test(readFileSync(f, 'utf8'));
    const L = readFileSync(f, 'utf8').replace(/\r\n/g, '\n').split('\n');
    const s = L.findIndex((l) => l.trim().startsWith('`<Use your commit tool/flow')); if (s < 0) continue;
    let e = s; while (e < L.length && !L[e].trim().endsWith('>`')) e++;
    L.splice(s, e - s + 1, FILL); writeFileSync(f, L.join(crlf ? '\r\n' : '\n'));
  }
}
function fixture(name, dist) {
  const P = join(ROOT, 'base-' + name); mkdirSync(P); git(P, 'init', '-q');
  writeFileSync(join(P, 'README.md'), '# An owner project\n'); mkdirSync(join(P, 'tools')); writeFileSync(join(P, 'tools', 'commit.mjs'), 'process.exit(0);\n');
  mkdirSync(join(P, '.kaif', 'install'), { recursive: true });
  copyFileSync(join(dist, 'KAIF-CORE-BUNDLE.md'), join(P, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copyFileSync(join(dist, 'KAIF-CORE.mjs'), join(P, '.kaif', 'kaif-core.mjs'));
  const r = core(P, ['install', '--agents', 'claude-code']);
  fillSlot(P); git(P, 'add', '-A'); git(P, 'commit', '-qm', 'owner project with its own commit flow');
  say(r.code === 0, `fixture ${name}: install exit ${r.code}`);
  return P;
}

// ---- field clones
const CARRY = ['.claude/settings.json', '.claude/settings.local.json', '.kaif/kaif-core.mjs', '.kaif/install/KAIF-CORE-BUNDLE.md', '.kaif/kaif.json', '.kaif/deploy-manifest.json', '.kaif/last-update.json'];
const markerOf = (d) => { try { return JSON.parse(readFileSync(join(d, '.kaif', 'kaif.json'), 'utf8')).version; } catch { return null; } };
const args = process.argv.slice(2);
const deployments = args.length ? args.map((a) => resolve(a))
  : readdirSync(dirname(REPO)).map((d) => join(dirname(REPO), d)).filter((d) => resolve(d) !== REPO && markerOf(d) === '2.9');
const stateOf = (dep) => JSON.stringify({ head: git(dep, 'rev-parse', 'HEAD').out, st: git(dep, 'status', '--porcelain').out,
  f: CARRY.map((f) => { const b = read(join(dep, f)); return b ? sha(b) : '-'; }), s: ['end-chat-soft', 'end-chat-force'].map((n) => sha(read(join(dep, '.claude/skills', n, 'SKILL.md')) || '')) });
function fieldClone(dep, k) {
  const P = join(ROOT, 'base-field' + k);
  const c = git(ROOT, 'clone', '-q', '--no-hardlinks', dep, P);
  for (const f of CARRY) { const b = read(join(dep, f)); if (!b) continue; const h = read(join(P, f)); if (h && sha(h) === sha(b)) continue; mkdirSync(dirname(join(P, f)), { recursive: true }); writeFileSync(join(P, f), b); }
  // the closing skills as they stand on the owner's disk (a fill not yet committed is still his deployment)
  for (const n of ['end-chat-soft', 'end-chat-force']) { const b = read(join(dep, '.claude/skills', n, 'SKILL.md')); if (b) writeFileSync(join(P, '.claude/skills', n, 'SKILL.md'), b); }
  return c.code === 0 ? P : null;
}

// ---- one walk: update → update-verify, count «not found»
const CLOSING = /end-chat-(soft|force)/;
// Session 103: the false class this probe judges is a «not found» of a line the closing skills ALREADY HELD at PRE_REV (the co-author line
// with a filled placeholder). A line NEW in the template since then — bugs/140's farewell lines (66a6b5c) — is a real merge for a deployment
// whose closing skills went to «Module diffs», and the old criterion «no not-found at all» read it as BAD on deployment #8 from 66a6b5c on.
// The core prints the first 78 characters of the promised line; whitespace is flattened on both sides.
// Judge of session 103 (finding 1, REFUTED «the criterion still judges them»): the first edition counted a line as «held at PRE» by its
// printed text — but the printed co-author line carries the deployment's FILLED value, so it never matched the PRE template's placeholder
// and 4 of 7 false lines were waved through as «a merge». Now the merge is identified POSITIVELY: a printed line is new only when it is the
// head of a template line of this build's closing skills that the PRE_REV skills did not hold; anything else stays BAD.
const flatWs = (s) => String(s).replace(/\s+/g, ' ').trim();
const skillLines = (rev) => ['end-chat-soft', 'end-chat-force'].flatMap((n) => (rev
  ? execFileSync('git', ['show', rev + ':framework/skills/' + n + '/SKILL.md'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 })
  : readFileSync(join(REPO, 'framework', 'skills', n, 'SKILL.md'), 'utf8')).split(/\r?\n/).map(flatWs).filter(Boolean));
const PRE_LINES = new Set(skillLines(PRE_REV));
const NEW_ONLY = skillLines(null).filter((l) => !PRE_LINES.has(l));
const heldAtPre = (l) => { const m = l.match(/ :: (.+)$/); const head = m ? flatWs(m[1]) : ''; return !(head && NEW_ONLY.some((t) => t.startsWith(head))); };
function walk(label, base, srcName, baseline) {
  const P = join(ROOT, `${label.replace(/[^a-z0-9]+/gi, '-')}-${srcName}`); cpSync(base, P, { recursive: true });
  const u = core(P, ['update', '--source', SRC[srcName], '--baseline', baseline]);
  const v = core(P, ['update-verify']);
  const nf = v.all.split(/\r?\n/).filter((l) => /promised upstream line not found on disk/.test(l));
  // per file, by path only (the path is the template's; the line itself may carry the deployment's own values — never printed)
  const byFile = {};
  for (const l of nf) { const m = l.match(/\(unmerged\?\): (\S+) ::/); const f = m ? m[1] : '?'; byFile[f] = (byFile[f] || 0) + 1; }
  return { u: u.code, total: nf.length, closing: nf.filter((l) => CLOSING.test(l)), byFile };
}
function judge(label, base, baseline = V29) {
  const a = walk(label, base, 'NEW', baseline), b = walk(label, base, 'OLD', baseline);
  say(a.u === 0 && b.u === 0, `${label}: update exit ${a.u} (this build) · ${b.u} (${PRE_REV})`);
  const falseNf = a.closing.filter(heldAtPre), newNf = a.closing.length - falseNf.length;
  say(falseNf.length === 0, `${label}: «not found» in the closing skills of a line they held at ${PRE_REV} — ${falseNf.length} (this build) · `
    + `${b.closing.length} (${PRE_REV})` + (newNf ? ` · ${newNf} line(s) new in the template since ${PRE_REV} — a merge, not this class` : ''));
  for (const l of falseNf) console.log('       ' + l.replace(/Co-Authored-By: [^<]*</, 'Co-Authored-By: …<').slice(0, 200));
  // INFO, not a verdict: a module this build really changed (/release step 6) is handed over with a diff, and on a deployment that
  // rewrote it every template line its own flow lacks stands «not found» — a listing for the merge, not the false class judged above
  const delta = [...new Set([...Object.keys(a.byFile), ...Object.keys(b.byFile)])].sort()
    .filter((f) => (a.byFile[f] || 0) !== (b.byFile[f] || 0)).map((f) => `${f} ${b.byFile[f] || 0}→${a.byFile[f] || 0}`);
  console.log(`INFO ${label}: «not found» in total — ${a.total} (this build) · ${b.total} (${PRE_REV})${delta.length ? '; differs in: ' + delta.join(' · ') : ''}`);
}

const t0 = new Date();
try {
  judge('fixture v2.9', fixture('v29', V29));
  judge(`fixture ${PRE_REV}`, fixture('pre', PRE), PRE);
  deployments.forEach((dep, i) => {
    const k = i + 1; const s0 = stateOf(dep);
    const P = fieldClone(dep, k);
    if (!P) { say(false, `deployment #${k}: git clone failed`); return; }
    judge(`deployment #${k}`, P);
    const same = stateOf(dep) === s0;
    console.log(`${same ? 'OK   ' : 'WARN '}deployment #${k}: the source ${same ? 'untouched' : 'CHANGED between the reads (a live session there? this probe writes nothing into it) — re-run it'}`);
  });
} finally {
  if (bad) console.log(`kept for the analysis (holds clones of the owner's projects — delete after): ${ROOT}`);
  else rmSync(ROOT, { recursive: true, force: true });
}
console.log(`run ${t0.toISOString()} → ${new Date().toISOString()} · subjects: 2 fixtures + ${deployments.length} deployment(s)`);
console.log(bad ? `❌ ${bad} BAD` : '✅ no false «not found» in the closing skills on any subject');
process.exit(bad ? 1 : 0);
