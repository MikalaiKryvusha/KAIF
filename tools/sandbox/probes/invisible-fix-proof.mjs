// tools/sandbox/probes/invisible-fix-proof.mjs — a PROBE (not a polygon suite): the proof of the READY MOVE that the build
// guard of origin bug 122 names — `node tools/sandbox/probes/invisible-characters.mjs --fix <file.mjs> …`. A guard that
// hands a weaker session a command must know what that command does on the sites it was NOT written for, so the move is
// proved ON COPIES in a unique OS-temp root, never on the tree:
//   case 1  a copy of a real source with a site      → rewritten · 0 characters left · the visible escape stands inside
//                                                      the regex literal · the tool says the file still parses
//   case 2  the character in BARE CODE (a byte-order mark is whitespace there; its escape is a syntax error)
//                                                    → exit 1 · "REFUSED and RESTORED" · the original bytes are back
//   case 3  a document                               → refused, untouched (a document is fixed by hand, by meaning)
//   case 4  the literal MEANS the same before and after: /^<char>/ against /^<escape>/ on five probe strings;
//           '<char>' === '<escape>' for U+FEFF and U+0007; a module exporting a string with U+0000 exports the same
//           value before and after the fix
// Every invisible character here is built from its NUMBER: this file holds none of them and no escape of them.
// Run:   node tools/sandbox/probes/invisible-fix-proof.mjs          (exit 0 = all green; raises no window and no sound)
// [TESTED: 2026-09-18 14:15 +03:00 · 14 of 14 green on the origin (run 3 of the report), beside the move applied to the
//  tree itself: 39 characters in 20 sources → 0 in source zones, every file "still parses" (run 4); four addressed mutants
//  of the move redden exactly their named lines (run 8) — report testcases/reports/2026-09-18_invisible-characters.md]
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PROBE = join(REPO, 'tools', 'sandbox', 'probes', 'invisible-characters.mjs');
const dir = mkdtempSync(join(tmpdir(), 'kaif-invisible-fix-proof-'));
const BACKSLASH = String.fromCharCode(92);
const BOM = String.fromCharCode(0xFEFF);
const escapeText = (cp) => BACKSLASH + 'u' + cp.toString(16).toUpperCase().padStart(4, '0');
const fix = (...files) => spawnSync(process.execPath, [PROBE, '--fix', ...files], { encoding: 'utf8', windowsHide: true });
const parses = (file) => spawnSync(process.execPath, ['--check', file], { windowsHide: true }).status === 0;
let bad = 0;
const ok = (cond, label) => { console.log((cond ? 'OK   ' : 'FAIL ') + label); if (!cond) bad++; };

// case 1 — a real source. The shipped contour core carried one site on 2026-09-18; after the tree was normalised the copy
// is given its site back from a number, so the case keeps proving the REWRITE and not an empty run.
const real = join(dir, 'core-copy.mjs');
copyFileSync(join(REPO, 'framework', 'tools', 'contour', 'core.mjs'), real);
const visible = 'replace(/^' + escapeText(0xFEFF) + '/';
const seeded = readFileSync(real, 'utf8').split(visible).join('replace(/^' + BOM + '/');
writeFileSync(real, seeded, 'utf8');
const sitesBefore = [...seeded.slice(1)].filter((c) => c === BOM).length;
ok(sitesBefore >= 1, `case 1: the copy carries ${sitesBefore} site(s) before the fix`);
const r1 = fix(real);
const after1 = readFileSync(real, 'utf8');
ok(r1.status === 0, 'case 1: exit 0');
ok(!after1.slice(1).includes(BOM), 'case 1: no real character left in the body');
ok(after1.includes(visible), 'case 1: the visible escape stands inside the regex literal');
ok(/still parses/.test(r1.stdout), 'case 1: the tool says the file still parses');

// case 2 — bare code
const bare = join(dir, 'bare.mjs');
const bareSrc = 'const a = 1;' + BOM + 'const b = 2;\nexport default a + b;\n';
writeFileSync(bare, bareSrc, 'utf8');
ok(parses(bare), 'case 2: the fixture parses BEFORE (the mark is whitespace in code)');
const r2 = fix(bare);
ok(r2.status === 1, 'case 2: exit 1');
ok(/REFUSED and RESTORED/.test(r2.stdout), 'case 2: the tool names the refusal');
ok(readFileSync(bare, 'utf8') === bareSrc, 'case 2: the original bytes are back');

// case 3 — a document
const doc = join(dir, 'note.md');
const docSrc = 'A soft' + String.fromCharCode(0x00AD) + 'hyphen inside a word.\n';
writeFileSync(doc, docSrc, 'utf8');
const r3 = fix(doc);
ok(r3.status === 1 && /not a JavaScript source/.test(r3.stdout), 'case 3: a document is refused');
ok(readFileSync(doc, 'utf8') === docSrc, 'case 3: the document is untouched');

// case 4 — same meaning
const reReal = new Function('return /^' + BOM + '/')();
const reEsc = new Function('return /^' + escapeText(0xFEFF) + '/')();
const samples = [BOM + 'abc', 'abc', BOM, '', 'x' + BOM];
ok(samples.every((s) => s.replace(reReal, '') === s.replace(reEsc, '')), 'case 4: /^<char>/ and /^<escape>/ strip the same thing on five probes');
const sameString = (cp) => new Function("return '" + String.fromCharCode(cp) + "'")() === new Function("return '" + escapeText(cp) + "'")();
ok([0xFEFF, 0x0007].every(sameString), "case 4: '<char>' === '<escape>' for U+FEFF and U+0007");
const nulFile = join(dir, 'nul.mjs');
writeFileSync(nulFile, "export const a = 'x" + String.fromCharCode(0) + "y';\n", 'utf8');
const nulBefore = (await import(pathToFileURL(nulFile).href + '?v=1')).a;
const r4 = fix(nulFile);
const nulAfter = (await import(pathToFileURL(nulFile).href + '?v=2')).a;
ok(r4.status === 0 && nulBefore === nulAfter && nulAfter.charCodeAt(1) === 0, 'case 4: a string with U+0000 exports the same value before and after the fix');

console.log(bad ? `\nFAILED: ${bad} — the root is kept for the inquest: ${dir}` : '\nall green');
if (!bad) { try { rmSync(dir, { recursive: true, force: true }); } catch { /* a foreign handle on Windows: litter in temp is harmless */ } }
process.exit(bad ? 1 : 0);
