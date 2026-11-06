// HC8 (version KAIF 2.10, epic HC, criterion 28; origin tickets #175 · #176) — mutant proofs of the testing hook on COPIES (EXP-0077):
// each mutant breaks ONE part of framework/hooks/test-after-code.mjs and must turn red exactly the selftest cases named for it BEFORE
// the run; the control copy stays green; a mutation whose text is not found prints DIED and fails (EXP-0158).
//   M1 «debt not written»        — a write of src/app.mjs enters no debt (criterion 28: the mutant named in its Check)
//   M2 «hygiene clears»          — a build / a linter / --check counts as a run
//   M3 «heredoc body is a command» — a test case appended by heredoc that names the file clears its debt (field, #176)
//   M4 «stop refused forever»    — the repeated stop with nothing new written is refused again (an endless loop)
//   M5 «name anywhere clears»    — the file's name anywhere in a command counts as a run (`git add`, `cat`, a commit tool) — light judge s98
//   M6 «stop needs stop_hook_active» — a later turn with the same old debt is refused again — light judge s98
// Run: node tools/sandbox/probes/hc8-test-hook-mutant.mjs   (≈ 2 s)
// [TESTED: ≈ 2026-11-06 16:40 (after the light judge) · control 0 red; six mutants each red exactly on its named cases
//  (13 · 1 · 1 · 3 · 1 · 1); report testcases/reports/2026-11-06_s98-hc8-testing-hook.md]
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HOOK = process.env.KAIF_HC8_HOOK || resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'framework', 'hooks', 'test-after-code.mjs');
const MUTANTS = [
  { name: 'debt not written', from: '    s.debt[rel] = { kind, at: now };\n', to: '\n',
    // every case that needs a WRITTEN debt; the deploy cases write their debt by another line and stay green
    addressees: ['criterion 28: an edit of src/app.mjs', 'a second file', 'hygiene', 'a heredoc body', 'criterion 28: the stop with debt', 'criterion 28: a repeated stop',
      'a run of the file itself', 'a NEW write', 'project kinds', "the project's guards", 'a game run clears the game kind',
      "the file's name in a command", 'a later turn', 'a continued line'] },
  { name: 'hygiene clears', from: "const segments = segmentsOf(command).filter((s) => !rules.hygiene.some((r) => r.test(s)));", to: "const segments = segmentsOf(command);", addressees: ['hygiene', 'a continued line'] },
  { name: 'heredoc body is a command', from: "withoutHeredocBodies(String(command || '').replace(", to: "((x) => x)(String(command || '').replace(", addressees: ['a heredoc body'] },
  // light judge of session 98: a continued line («node x \\ ⏎ --help») split into a run and a lone --help
  { name: 'continuations not joined', from: ".replace(/[\\\\`][^\\S\\n]*\\r?\\n/g, ' ')", to: "", addressees: ['a continued line'] },
  // origin session 98, live: a chain «node --check x && node x» was read as hygiene whole — its run did not count
  { name: 'hygiene judged on the whole chain', from: "const segments = segmentsOf(command).filter((s) => !rules.hygiene.some((r) => r.test(s)));",
    to: "const segments = segmentsOf(command).filter((s) => !rules.hygiene.some((r) => r.test(command)));", addressees: ['a chain «check && run»'] },
  { name: 'stop refused forever', from: 'if (s.lastStop === sig) return { out: null, state: s };', to: 'if (false) return { out: null, state: s };',
    addressees: ['criterion 28: a repeated stop', 'a NEW write', 'a later turn'] },
  // light judge of session 98: the file's name anywhere in a command counted as a run; a later turn with the old debt was refused again
  { name: 'name anywhere clears', from: "(!key.startsWith('deploy:') && runsFile(seg, key))", to: "(!key.startsWith('deploy:') && seg.includes(basename(key)))",
    addressees: ["the file's name in a command"] },
  { name: 'stop needs stop_hook_active', from: 'if (s.lastStop === sig) return { out: null, state: s };', to: 'if (ev.stop_hook_active && s.lastStop === sig) return { out: null, state: s };',
    addressees: ['a later turn'] },
];
const run = (mut) => {
  const d = mkdtempSync(join(tmpdir(), 'kaif-hc8m-'));
  try {
    const f = join(d, 'hook.mjs'); copyFileSync(HOOK, f);
    if (mut) { const t = readFileSync(f, 'utf8'); if (!t.includes(mut.from)) return { err: 'mutation text not found' }; writeFileSync(f, t.split(mut.from).join(mut.to)); }
    const r = spawnSync(process.execPath, [f, '--selftest'], { encoding: 'utf8', timeout: 60000 });
    const out = r.stdout || '';
    return { status: r.status, xs: out.split('\n').filter((l) => l.startsWith('  x ')), done: /selftest: /.test(out) };
  } finally { rmSync(d, { recursive: true, force: true }); }
};
const c = run(null);
let ok = c.status === 0 && c.xs.length === 0 && c.done;
console.log(`${ok ? 'OK  ' : 'BAD '}control: exit ${c.status}, red ${c.xs.length}`);
for (const m of MUTANTS) {
  const r = run(m);
  if (r.err || !r.done) { ok = false; console.log(`DIED ${m.name}: ${r.err || 'the selftest did not finish (exit ' + r.status + ')'} — proves nothing`); continue; }
  const hitAll = m.addressees.every((a) => r.xs.some((x) => x.includes(a))), onlyThem = r.xs.every((x) => m.addressees.some((a) => x.includes(a)));
  const good = r.status !== 0 && hitAll && onlyThem;
  if (!good) ok = false;
  console.log(`${good ? 'OK  ' : 'BAD '}${m.name}: exit ${r.status}, red ${r.xs.length}${hitAll ? '' : ' · an addressee stayed green'}${onlyThem ? '' : ' · a case outside the addressees went red'}`);
  for (const x of r.xs) console.log('     ' + x.slice(0, 140));
}
console.log(ok ? '✅ each mutant red on exactly its named cases' : '❌ mutant proof failed');
process.exit(ok ? 0 : 1);
