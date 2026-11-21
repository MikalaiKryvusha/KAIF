// bugs145-matcher-red.mjs — the proof of the Kimi hook form (bugs/145; plans/143 KA1), red on the build that shipped the defect.
//   node tools/sandbox/probes/bugs145-matcher-red.mjs [<rev>]       (default rev 9263794 — the fragment with five `matcher = "*"`)
// Expected, named BEFORE the run:
//   A · the fragment of <rev>                              — exactly 5 findings, every one a «*» matcher
//   B · the fragment of this tree                          — 0 findings
//   C · four synthetic entries (unknown key · unknown event · timeout 0 · an unclosed group «(Write») — exactly one finding each
// Read-only: the old fragment comes from `git show`, nothing is written. Exit 0 — all as expected, 1 — any difference (BAD lines name it).
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kimiHookFindings } from '../../lib/kimi-hooks-form.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FRAGMENT = 'framework/hooks/kimi-config-fragment.toml';
const rev = process.argv[2] || '9263794';
let bad = 0;
const check = (cond, what, got) => { console.log(`${cond ? 'OK ' : 'BAD'} ${what}${cond ? '' : ` — got ${JSON.stringify(got)}`}`); if (!cond) bad++; };

const old = execFileSync('git', ['show', `${rev}:${FRAGMENT}`], { cwd: ROOT, encoding: 'utf8' });
const a = kimiHookFindings(old);
check(a.length === 5 && a.every((f) => /matcher «\*»/.test(f.problem)), `A · ${rev}: 5 findings, all «*»`, a);

const b = kimiHookFindings(readFileSync(join(ROOT, FRAGMENT), 'utf8'));
check(b.length === 0, 'B · this tree: 0 findings', b);

const entry = (body) => `[[hooks]]\n${body}\n`;
const cases = [
  ['unknown key', entry('event = "Stop"\ncommand = "x"\nmatch = "a"'), /the key «match»/],
  ['unknown event', entry('event = "PostToolCall"\ncommand = "x"'), /the event «PostToolCall»/],
  ['timeout 0', entry('event = "Stop"\ncommand = "x"\ntimeout = 0'), /timeout «0»/],
  ['unclosed group', entry('event = "PreToolUse"\nmatcher = "(Write"\ncommand = "x"'), /matcher «\(Write» is not a regular expression/],
];
for (const [name, text, want] of cases) {
  const f = kimiHookFindings(text);
  check(f.length === 1 && want.test(f[0].problem), `C · ${name}: one finding`, f);
}
console.log(bad ? `bugs145-matcher-red: ${bad} BAD` : 'bugs145-matcher-red: all as named');
process.exit(bad ? 1 : 0);
