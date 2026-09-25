// tools/sandbox/probes/ck59b-load-field.mjs — a PROBE (not a polygon suite): the FUNCTIONAL RUN of step CK5.9 (b) (2.8, epic CK;
// criterion 21 of plans/117; origin issue #99 p. 3) — `kaif-voice-lint load` walked the way a writing agent walks it, over COPIES of
// real voice portraits. For every portrait named: the copy goes into a fresh temp project as AUTHOR_STYLOMETRY.md, then
//   (1) a bare `load` — the printed body must equal the WRITING selection recomputed HERE by an independent cut (the head before the
//       first H2 plus the H2 sections numbered 0 · 2 · 5 · 6 · 7 with their lettered or dotted subsections — the rule as the module's
//       header states it; the recon's first rule, 0 · 2 · 2-C · 5 · 6 · 7 with a Latin letter only, missed a field «2-С» typed in
//       Cyrillic and a field «6Б» of more pairs — this probe's first run found both), and the summary's lines and tokens must equal
//       the recount;
//   (2) every "not loaded" line — one per left-out H2, none missing — and its ready `--sections` regex is RUN: it must load its own
//       section, plus exactly as many more as the line says;
//   (3) `load --all` must print the whole portrait.
// The source portraits are only READ: their sha-256 is taken before and after, and a change is BAD. The module under test is
// framework/tools/kaif-voice-lint.mjs, or the file named by KAIF_VOICE_LINT (the red proof: a 2.7 module has no writing selection).
// usage: node tools/sandbox/probes/ck59b-load-field.mjs <portrait.md>…     (no argument → usage, exit 2; a BAD portrait → exit 1)
// [TESTED: 2026-09-25 · over copies of eight real portraits (the origin, the shipped skeleton, three deployments of one field project,
//  two more field projects, the owner's private voice core): 8 of 8 OK, 142 printed regexes run and exact, sources unchanged; its
//  first run found a field portrait's «6Б» that the module then read wrong and a lexicon «2-С» that the recon's rule missed; red with
//  KAIF_VOICE_LINT=<the 2.7 module> — 2 of 2 BAD; report testcases/reports/2026-09-25_ck59b-portrait-writing-sections.md]
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LINT = process.env.KAIF_VOICE_LINT ? resolve(process.env.KAIF_VOICE_LINT) : join(REPO, 'framework', 'tools', 'kaif-voice-lint.mjs');
const WRITING = ['0', '2', '5', '6', '7'];
const ASCII_CHARS_PER_TOKEN = 2.5, OTHER_CHARS_PER_TOKEN = 1.9;     // the rates of the core's entry-cost line
const tok = (s) => { let a = 0, o = 0; for (const ch of s) { if (ch.charCodeAt(0) < 128) a++; else o++; } return a / ASCII_CHARS_PER_TOKEN + o / OTHER_CHARS_PER_TOKEN; };
const k = (t) => (t < 1000 ? `~${Math.round(t)}` : `~${Math.round(t / 1000)}k`);
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node tools/sandbox/probes/ck59b-load-field.mjs <portrait.md>…'); process.exit(2); }

// The independent cut: the rule written again here (not imported from the module under test) — the leading number of the label.
function cut(text) {
  const head = [], secs = [];
  for (const l of text.split(/\r?\n/)) {
    const m = /^## (.+)$/.exec(l);
    if (m) secs.push({ title: m[1].trim(), lines: [l], num: (/^([0-9]+)(?:-?[A-Za-zА-Яа-яЁё]|\.[0-9]+)*[.)]\s/u.exec(m[1].trim()) || [])[1] });
    else (secs.length ? secs[secs.length - 1].lines : head).push(l);
  }
  return { head, secs };
}
const body = (out) => out.split('\n✅ voice-lint load')[0].replace(/\s*$/, '');
const h2s = (s) => s.split(/\r?\n/).filter((l) => /^## /.test(l)).map((l) => l.slice(3).trim());
const run = (cwd, args) => {
  try { return { code: 0, out: execFileSync(process.execPath, [LINT, 'load', ...args], { cwd, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { code: e.status, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

let bad = 0;
for (const src of files) {
  if (!existsSync(src)) { bad++; console.log(`BAD ${src}: missing`); continue; }
  const before = sha(src);
  const dir = mkdtempSync(join(tmpdir(), 'kaif-ck59b-load-'));
  const why = [];
  try {
    const text = readFileSync(src, 'utf8').replace(/^\uFEFF/, '');
    writeFileSync(join(dir, 'AUTHOR_STYLOMETRY.md'), text);
    const whole = text.replace(/\s*$/, '');
    const { head, secs } = cut(text);
    const kept = secs.filter((s) => WRITING.includes(s.num)), left = secs.filter((s) => !WRITING.includes(s.num));
    const expect = head.concat(...kept.map((s) => s.lines)).join('\n').replace(/\s*$/, '');
    // (1) the bare load
    const r = run(dir, []);
    if (r.code !== 0) why.push(`bare load exit ${r.code}`);
    if (body(r.out) !== expect) why.push(`bare load body differs from the independent writing cut (${body(r.out).split('\n').length} vs ${expect.split('\n').length} lines)`);
    const nExp = expect.split('\n').length, nAll = whole.split('\n').length;
    const want = `(${nExp} of ${nAll} line(s), sections: writing`;
    if (!r.out.includes(want)) why.push(`the summary does not say «${want}»`);
    if (!r.out.includes(`; ${k(tok(expect))} of ${k(tok(whole))} tokens)`)) why.push(`the summary does not say «${k(tok(expect))} of ${k(tok(whole))} tokens»`);
    // (2) every left-out section named once, and its regex run
    const lines = r.out.split(/\r?\n/).filter((l) => /tokens  «.*» — --sections "/.test(l));
    if (lines.length !== left.length) why.push(`${lines.length} "not loaded" line(s) for ${left.length} left-out section(s)`);
    let verified = 0;
    for (const l of lines) {
      const m = /«(.*)» — --sections "([^"]*)"(?: \(loads (\d+) more)?/.exec(l);
      if (!m) { why.push(`unparsed line: ${l.slice(0, 80)}`); continue; }
      const [, title, sel, more] = m;
      if (!/^[\x20-\x7e]+$/.test(sel)) why.push(`a non-ASCII regex for «${title}»`);
      const one = run(dir, ['--sections', sel]);
      const got = h2s(body(one.out));
      if (one.code === 0 && got.includes(title) && got.length === 1 + Number(more || 0)) verified++;
      else why.push(`--sections "${sel}" for «${title}» loaded ${got.length} section(s): ${got.join(' | ').slice(0, 120)}`);
    }
    // (3) --all
    const all = run(dir, ['--all']);
    if (all.code !== 0 || body(all.out) !== whole) why.push(`--all did not print the whole portrait (exit ${all.code})`);
    if (sha(src) !== before) why.push('THE SOURCE PORTRAIT CHANGED — the probe must only read it');
    const x = tok(whole) / tok(expect);
    if (why.length) { bad++; console.log(`BAD ${src}`); for (const w of why) console.log(`    ${w}`); }
    else console.log(`OK  ${src}: writing ${nExp} of ${nAll} lines, ${k(tok(expect))} of ${k(tok(whole))} tokens (${x.toFixed(1)}× smaller) · ${left.length} left-out section(s), ${verified} ready regex(es) run and exact · --all whole · source sha unchanged`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
console.log(bad ? `\n❌ ${bad} of ${files.length} portrait(s) BAD` : `\n✅ ${files.length} portrait(s): the bare load is the writing cut, every left-out section is named and its regex loads it, --all is whole`);
process.exit(bad ? 1 : 0);
