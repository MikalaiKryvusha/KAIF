// tools/sandbox/probes/canon-inventory-mutants.mjs — a PROBE (not a polygon suite): gate 5 for tools/canon-inventory.mjs on a
// COPY of the real delivery template `framework/AGENT_GUIDE.md` at tag v2.7 (epic CK 2.8, steps CK2 and CK3.1). Each mutant is
// one edit of the kind the slimming of CK3 will make; the probe runs the tool's explicit mode (`--old <copy> --new <mutant>
// [--with <out-of-set file>]`) and checks the printed counts AND the exit code. The control (an untouched copy) must be all kept,
// exit 0 — a tool that reddens on nothing is a broken tool (TESTING_FRAMEWORK, gate 6: prove there was something to measure).
// The second edition adds the four holes the CK2 judge found: a rule deleted whole while its command lives in a kept rule
// (came out `changed`, exit 0), a rule moved out of the canon set (passed as `moved`), a gate sentence inverted, and telegraphese.
// Run:   node tools/sandbox/probes/canon-inventory-mutants.mjs          (writes only into the OS temp dir; no window, no sound)
// [NOT-TESTED] — Hygiene of the tool it proves; the probe itself is judged by its control case and the tool's selftest.
import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const TOOL = 'tools/canon-inventory.mjs';
const { inventory } = await import(pathToFileURL(TOOL).href);
const src = execFileSync('git', ['show', 'v2.7:framework/AGENT_GUIDE.md'], { encoding: 'utf8', maxBuffer: 64 << 20 });
// How many obligations live under "## Commits" — the rename mutant must move exactly those, not a number typed by hand.
const underCommits = inventory(src, 'x').filter((u) => u.heading === 'commits').length;
const dir = mkdtempSync(join(tmpdir(), 'ck2-mutants-'));
const oldPath = join(dir, 'old.md');
writeFileSync(oldPath, src);
const lines = src.split('\n');
const at = (re, l = lines) => { const i = l.findIndex((x) => re.test(x)); if (i < 0) throw new Error(`anchor not found: ${re}`); return i; };
const replaceText = (a, b) => { if (!src.includes(a)) throw new Error(`text not found: ${a.slice(0, 60)}`); return src.replace(a, b).split('\n'); };
// The bullet "Ignore first, then the tool." with its continuation lines — the rule a mutant moves out of the canon set.
const ignoreAt = at(/^- \*\*Ignore first, then the tool\.\*\*/);
let ignoreEnd = ignoreAt + 1;
while (ignoreEnd < lines.length && /^\s+\S/.test(lines[ignoreEnd])) ignoreEnd++;
const ignoreBullet = lines.slice(ignoreAt, ignoreEnd).join('\n');

const mutants = [
  { name: 'control — untouched copy', edit: (l) => l, expect: { lost: 0, moved: 0, changed: 0, 'moved-out': 0, new: 0, code: 0 } },
  { name: 'a checklist step deleted ("3. git status")', edit: (l) => l.filter((_, i) => i !== at(/^3\. git status/)), expect: { lost: 1, code: 1 } },
  { name: 'one rule bullet moved under another heading', edit: (l) => {
      const i = at(/^- \*\*The owner's originals are inviolable\.\*\*/);
      const block = [l[i], l[i + 1]];                        // the bullet and its one continuation line
      const rest = l.filter((_, k) => k !== i && k !== i + 1);
      rest.splice(at(/^## Commits/, rest) + 1, 0, '', ...block);
      return rest;
    }, expect: { lost: 0, moved: 1, code: 0 } },
  { name: 'a section heading renamed (its items move)', edit: (l) => l.map((x) => (/^## Commits$/.test(x) ? '## Commit messages' : x)), expect: { lost: 0, moved: underCommits, code: 0 } },
  // The #93 class needs a COMMAND in a code span inside the item: the command survives, the clause around it is cut.
  { name: 'command kept, the clause around it cut (#93 class)', edit: (l) => l.map((x) => (/^- Use `git mv` \(preserves history\)\. Don't change the number\./.test(x) ? '- `git mv`.' : x)), expect: { lost: 0, changed: 1, new: 0, code: 0 } },
  // An item with no command in a code span, cut to its bold lead: nothing of it survives by key — the safe side, LOST.
  { name: 'a rule without a command cut to its lead', edit: (l) => l.map((x) => (/^1\. \*\*A command\*\* — /.test(x) ? '1. **A command**.' : x)), expect: { lost: 1, code: 1 } },
  // CK2 judge, M4: the whole sentence goes; its command `/fable-judge` lives on in many KEPT rules — the first edition said changed/0.
  { name: 'a rule deleted whole while its command lives in kept rules', edit: () => replaceText('`/fable-judge` hunts a claim wider than the run that backs it (the\nclaim-wider-than-observation hunt). ', ''), expect: { lost: 1, code: 1 } },
  // CK2 judge, M12: the AUTH gate inverted. The first edition said kept/0 (the gate sentence was not an obligation to it). Now
  // the gate IS one ("requires"), and the inverted text carries no modal word — the rule leaves the inventory: LOST, exit 1.
  { name: 'the AUTH gate sentence inverted', edit: () => replaceText("still requires\n> the owner's quoted words (an `AUTH:` line).", 'needs\n> no owner words at all.'), expect: { lost: 1, code: 1 }, printed: /still requires the owner's quoted words/ },
  // The same gate softened but still a rule ("must only … when") — must reach the audit as `changed` with the divergence printed.
  { name: 'the AUTH gate sentence softened', edit: () => replaceText("still requires\n> the owner's quoted words (an `AUTH:` line).", "still requires\n> the owner's word when it is convenient (an `AUTH:` line)."), expect: { lost: 0, changed: 1, code: 0 }, printed: /⟦quoted words⟧|⟦.*convenient/ },
  // CK2 judge, finding 8: a rule moved into a file OUTSIDE the canon set (the informative "why" section) is not a legal move.
  { name: 'a rule moved out of the canon set', edit: (l) => l.filter((_, i) => i < ignoreAt || i >= ignoreEnd), withText: ignoreBullet, expect: { lost: 0, 'moved-out': 1, code: 1 } },
  // Telegraphese (#93 R6): the same rules with every colon chopped — the voice meter must stop it.
  { name: 'telegraphese — colons chopped', edit: () => src.replace(/ (the|a|and|or|of|to) /g, ', $1 ').split('\n'), expect: { code: 1 }, printed: /voice meter below the floor/ },
];

let failed = 0;
for (const m of mutants) {
  const p = join(dir, 'new.md');
  writeFileSync(p, m.edit([...lines]).join('\n'));
  const args = [TOOL, '--old', oldPath, '--new', p];
  if (m.withText) { const w = join(dir, 'out-of-set.md'); writeFileSync(w, `# Why the canon says so\n\n${m.withText}\n`); args.push('--with', w); }
  const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
  const out = r.stdout;
  const tail = out.trim().split('\n').filter((x) => /^kept \d+/.test(x)).pop() || '';
  const num = (k) => Number((tail.match(new RegExp(`${k} (\\d+)`)) || [])[1]);
  const got = { code: r.status };
  for (const k of ['lost', 'moved', 'changed', 'moved-out', 'new']) got[k] = num(k);
  const ok = Object.entries(m.expect).every(([k, v]) => got[k] === v) && (!m.printed || m.printed.test(out));
  if (!ok) failed++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${m.name} — ${tail} · exit ${r.status}${ok ? '' : ` · expected ${JSON.stringify(m.expect)}${m.printed ? ` and ${m.printed}` : ''}`}`);
}
console.log(failed ? `\n${failed} of ${mutants.length} mutant(s) FAILED (traces: ${dir})` : `\nall ${mutants.length} mutants behaved (traces: ${dir})`);
process.exit(failed ? 1 : 0);
