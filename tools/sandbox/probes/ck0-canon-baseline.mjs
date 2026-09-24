// tools/sandbox/probes/ck0-canon-baseline.mjs — a PROBE (not a polygon suite): the BEFORE baseline of epic CK 2.8
// (plans/118, step CK0). For each git ref and each of the four canon files the epic slims (the two delivery templates
// and their two root Russian copies) it prints lines and words the way `git show <ref>:<file> | wc -lw` counts them,
// and the number of PROVENANCE lines — lines carrying a "birth certificate" of a rule instead of the rule itself.
// The provenance classes are the four the plan names (researches/32 §2д Q-§2 — the recon's own regex was never
// written down, so its 12 -> 33 is NOT reproduced one-to-one; these patterns are the ones measured from now on), plus
// two INFORMATIONAL columns that are not in the sum: decision numbers (№NN) and dated moments (YYYY-MM-DD).
// A line is counted once in `prov` however many classes it hits; the per-class columns may overlap.
// Also prints the nine re-read core templates of the delivery against the core's DOC_BUDGETS (lines vs budget).
// Run:   node tools/sandbox/probes/ck0-canon-baseline.mjs [ref …]        default refs: v2.4 v2.7 HEAD
// Reads git objects only; writes nothing; raises no window and no sound.
// WORDS: runs of ASCII-whitespace-delimited text — equal to `LC_ALL=C.UTF-8 wc -w`, except that `wc` skips a token made
// only of non-printable symbols (4 such tokens in the root AGENT_GUIDE.md at v2.7: 12889 here, 12885 there). Plain
// `wc -w` in Git Bash WITHOUT the locale over-counts Russian text: it splits the Cyrillic "Р" (bytes D0 A0) on its second
// byte, 0xA0, a no-break space in a single-byte locale — 13086 for the same file (class of EXP-0151).
// [TESTED: ≈ 2026-09-24 20:12 +03:00 · run on v2.4 v2.7 HEAD, exit 0; lines equal `git show <ref>:<file> | wc -l` for all
//  twelve rows; words equal plain `wc -w` for the two English templates and `LC_ALL=C.UTF-8 wc -w` for the Russian
//  TESTING_FRAMEWORK.md (3131), 4 off on the Russian AGENT_GUIDE.md (reason above); report testcases/reports/2026-09-24_ck-light-canon.md]
import { execFileSync } from 'node:child_process';

const FILES = ['framework/AGENT_GUIDE.md', 'framework/TESTING_FRAMEWORK.md', 'AGENT_GUIDE.md', 'TESTING_FRAMEWORK.md'];
const CORE_NINE = ['GOAL.md', 'AGENT_GUIDE.md', 'PHILOSOPHY.md', 'REQUIREMENTS_FRAMEWORK.md', 'TESTING_FRAMEWORK.md',
  'BUG_FIXING_FRAMEWORK.md', 'STATUS.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md'];
// Not a letter or digit on the left — JS \b is ASCII-only and would never fire before a Cyrillic word.
const L = '(?<![\\p{L}\\p{N}])';
const CLASSES = {
  issue: new RegExp(`${L}(?:issues?|тикет\\p{L}*|issue)\\s+#\\d+`, 'iu'),
  epic: new RegExp(`${L}(?:epic|эпик\\p{L}*)\\s+[A-Z]{1,3}\\d?(?![\\p{L}\\p{N}])`, 'u'),
  version: new RegExp(`${L}KAIF\\s+\\d\\.\\d`, 'u'),
  ownerWord: new RegExp(`owner['’]s word|word of the owner|${L}слов\\p{L}{0,2}\\s+владельца`, 'iu'),
};
const INFO = {
  decisionNo: /№\s?\d+/u,
  dated: /(?<!\d)20\d\d-\d\d-\d\d(?!\d)/u,
};

function show(ref, file) {
  try { return execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
}
// wc -l counts newline characters; wc -w counts runs of non-whitespace. ASCII whitespace only, as in the C locale.
const wcL = (s) => (s.match(/\n/g) || []).length;
const wcW = (s) => (s.match(/[^ \t\n\r\f\v]+/g) || []).length;

function coreBudgets(ref) {
  const core = show(ref, 'framework/installer/KAIF-CORE.mjs');
  const out = {};
  if (!core) return out;
  const block = core.match(/const DOC_BUDGETS = \{([\s\S]*?)\n\};/);
  if (!block) return out;
  for (const m of block[1].matchAll(/'([^']+)':\s*\{\s*budget:\s*(\d+)/g)) out[m[1]] = Number(m[2]);
  return out;
}

const refs = process.argv.slice(2).length ? process.argv.slice(2) : ['v2.4', 'v2.7', 'HEAD'];
console.log('| ref | file | lines | words | prov | issue | epic | version | ownerWord | prov/100 lines | info: №NN | info: dated |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const ref of refs) for (const file of FILES) {
  const text = show(ref, file);
  if (text === null) { console.log(`| ${ref} | ${file} | — absent at this ref — |||||||||`); continue; }
  const lines = text.split('\n');
  const per = Object.fromEntries(Object.keys(CLASSES).map((k) => [k, 0]));
  const info = Object.fromEntries(Object.keys(INFO).map((k) => [k, 0]));
  let prov = 0;
  for (const line of lines) {
    let hit = false;
    for (const [k, re] of Object.entries(CLASSES)) if (re.test(line)) { per[k]++; hit = true; }
    for (const [k, re] of Object.entries(INFO)) if (re.test(line)) info[k]++;
    if (hit) prov++;
  }
  const n = wcL(text);
  console.log(`| ${ref} | ${file} | ${n} | ${wcW(text)} | ${prov} | ${per.issue} | ${per.epic} | ${per.version} | ${per.ownerWord} | ${(100 * prov / n).toFixed(1)} | ${info.decisionNo} | ${info.dated} |`);
}

console.log('\n| ref | template | lines | budget (DOC_BUDGETS of that ref) | headroom |');
console.log('|---|---|---|---|---|');
for (const ref of refs) {
  const budgets = coreBudgets(ref);
  for (const doc of CORE_NINE) {
    const text = show(ref, `framework/${doc}`);
    const n = text === null ? null : wcL(text);
    const b = budgets[doc];
    console.log(`| ${ref} | framework/${doc} | ${n ?? '—'} | ${b ?? '—'} | ${n !== null && b ? b - n : '—'} |`);
  }
}
