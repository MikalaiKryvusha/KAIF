#!/usr/bin/env node
// Kimi Code hook dispatcher — one user-level entry point for every KAIF hook (plans/143 KA2 of the origin).
// Kimi reads hooks only from the user-level ~/.kimi-code/config.toml and runs each command through the shell from the SESSION folder,
// not the git root. A project-relative command (`node .kaif/hooks/x.mjs`) therefore fails with a warning in every folder that is not a
// KAIF project and finds nothing from a subfolder of one. `wire-hooks --kimi` copies this file to <Kimi home>/kaif/kimi-hook.mjs and
// wires `node "<that path>" <script.mjs> <args…>`; the dispatcher:
//   1. reads the hook input from stdin and takes its `cwd` (Kimi sends it; the process folder otherwise);
//   2. walks up to the nearest .kaif/kaif.json — none, or "hooks": "off" in it (the owner's opt-out) → exit 0, silent;
//   3. runs that project's own .kaif/hooks/<script.mjs> (in the KAIF origin's source tree — framework/hooks/) with the same stdin, from
//      the project root, and returns its stdout, stderr and exit code (2 = block, as Kimi reads it); no such script → exit 0, silent.
// It carries no hook logic and no version: the project's scripts decide, so one copy serves every KAIF project of the machine.
// [TESTED: 2026-11-22 · selftest plus a live Kimi Stop continuation; testcases/reports/2026-11-22_kimi-stop-alive.md]
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MARKER = join('.kaif', 'kaif.json');
const SCRIPT_NAME_RE = /^[\w.-]+\.mjs$/;       // a bare file name: no folder, no way out of the hooks folder
const ORIGIN_SIGN = join('framework', 'installer', 'KAIF-CORE.mjs'); // the KAIF origin keeps its hook sources in framework/hooks/

// the nearest folder at or above `start` that holds .kaif/kaif.json, or null
export function projectRoot(start) {
  for (let dir = resolve(start || '.'); ;) {
    if (existsSync(join(dir, MARKER))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// the hook script a project runs for `name`: its deployed copy, or the origin's source; null when it has none
export function scriptOf(root, name) {
  const deployed = join(root, '.kaif', 'hooks', name);
  if (existsSync(deployed)) return deployed;
  const source = join(root, 'framework', 'hooks', name);
  return existsSync(join(root, ORIGIN_SIGN)) && existsSync(source) ? source : null;
}

const stripBom = (s) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);   // a byte-order mark before JSON (bugs/119 of the origin)
const readStdin = () => { try { return readFileSync(0); } catch { return Buffer.alloc(0); } };
function cwdOf(raw) {
  try { const ev = JSON.parse(stripBom(raw.toString('utf8')) || '{}'); return typeof ev.cwd === 'string' && ev.cwd ? ev.cwd : null; } catch { return null; }
}
const optedOut = (root) => { try { return JSON.parse(stripBom(readFileSync(join(root, MARKER), 'utf8'))).hooks === 'off'; } catch { return false; } };

function dispatch(argv) {
  const [name, ...args] = argv;
  if (!name || !SCRIPT_NAME_RE.test(name)) {
    process.stderr.write(`KAIF kimi-hook: expected a hook script name (like context-window.mjs) as the first argument, got ${JSON.stringify(name ?? '')}\n`);
    return 1;                                   // Kimi: neither 0 nor 2 = allowed, one warning per session
  }
  const raw = readStdin();
  const root = projectRoot(cwdOf(raw) || process.cwd());
  if (!root || optedOut(root)) return 0;        // not a KAIF project, or its owner turned the hooks off
  const script = scriptOf(root, name);
  if (!script) return 0;                        // this project's KAIF has no such hook (older version, module not deployed)
  const r = spawnSync(process.execPath, [script, ...args], { input: raw, cwd: root, stdio: ['pipe', 'inherit', 'inherit'] });
  return typeof r.status === 'number' ? r.status : 0; // killed or failed to start → allow (Kimi's own fail-open rule)
}

function selftest() {
  let bad = 0;
  const ok = (cond, name, detail = '') => { console.log(`${cond ? 'v' : 'x'} ${name}${cond || !detail ? '' : ' — ' + detail}`); if (!cond) bad++; };
  const self = fileURLToPath(import.meta.url);
  const tmp = mkdtempSync(join(tmpdir(), 'kaif-kimi-hook-'));
  try {
    const run = (cwd, input, args) => spawnSync(process.execPath, [self, ...args], { input: JSON.stringify(input), cwd, encoding: 'utf8', timeout: 20000 });
    // a hook that reports where it ran and what it got, then blocks (exit 2 + stderr) — the shape of KAIF's Stop and PreToolUse gates
    const probe = "import { readFileSync } from 'node:fs'; const stripBom = (s) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s); const ev = JSON.parse(stripBom(readFileSync(0, 'utf8'))); " +
      "console.log(JSON.stringify({ at: process.cwd(), cwd: ev.cwd, args: process.argv.slice(2) })); process.stderr.write('blocked by probe'); process.exit(2);";
    const plain = join(tmp, 'plain'); mkdirSync(join(plain, 'src'), { recursive: true });
    const proj = join(tmp, 'proj'); mkdirSync(join(proj, '.kaif', 'hooks'), { recursive: true }); mkdirSync(join(proj, 'src', 'deep'), { recursive: true });
    writeFileSync(join(proj, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', agents: ['kimi-code'] }));
    writeFileSync(join(proj, '.kaif', 'hooks', 'probe.mjs'), probe);

    let x = run(join(plain, 'src'), { hook_event_name: 'Stop', cwd: join(plain, 'src') }, ['probe.mjs']);
    ok(x.status === 0 && x.stdout === '' && x.stderr === '', 'outside a KAIF project: exit 0, no output', JSON.stringify(x));

    x = run(join(proj, 'src', 'deep'), { hook_event_name: 'Stop', cwd: join(proj, 'src', 'deep') }, ['probe.mjs', '--kimi']);
    let seen = {}; try { seen = JSON.parse(x.stdout); } catch { /* the case below is red */ }
    ok(x.status === 2 && x.stderr.includes('blocked by probe') && resolve(seen.at || '') === resolve(proj) && seen.cwd === join(proj, 'src', 'deep')
      && JSON.stringify(seen.args) === '["--kimi"]', 'from a subfolder: the project\'s hook runs at the root with the same stdin and args; its exit 2 and stderr come back', JSON.stringify(x));

    x = run(tmp, { hook_event_name: 'Stop', cwd: join(proj, 'src') }, ['probe.mjs']);
    ok(x.status === 2, 'the stdin cwd decides, not the process folder (Kimi sends the session folder)', JSON.stringify(x));

    x = run(join(proj, 'src'), { hook_event_name: 'Stop', cwd: join(proj, 'src') }, ['absent.mjs']);
    ok(x.status === 0 && x.stdout === '' && x.stderr === '', 'a hook this project does not have: exit 0, silent', JSON.stringify(x));

    x = run(join(proj, 'src'), { hook_event_name: 'Stop', cwd: join(proj, 'src') }, ['../kaif.json']);
    ok(x.status === 1 && /expected a hook script name/.test(x.stderr), 'a name with a folder in it is refused (exit 1, the reason on stderr)', JSON.stringify(x));

    const off = join(tmp, 'off'); mkdirSync(join(off, '.kaif', 'hooks'), { recursive: true });
    writeFileSync(join(off, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', hooks: 'off' }));
    writeFileSync(join(off, '.kaif', 'hooks', 'probe.mjs'), probe);
    x = run(off, { hook_event_name: 'Stop', cwd: off }, ['probe.mjs']);
    ok(x.status === 0 && x.stdout === '', '"hooks": "off" in the project marker: exit 0, the hook does not run', JSON.stringify(x));

    const origin = join(tmp, 'origin'); mkdirSync(join(origin, '.kaif'), { recursive: true });
    mkdirSync(join(origin, 'framework', 'hooks'), { recursive: true }); mkdirSync(join(origin, 'framework', 'installer'), { recursive: true });
    writeFileSync(join(origin, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF' }));
    writeFileSync(join(origin, 'framework', 'installer', 'KAIF-CORE.mjs'), '// sign');
    writeFileSync(join(origin, 'framework', 'hooks', 'probe.mjs'), probe);
    x = run(origin, { hook_event_name: 'Stop', cwd: origin }, ['probe.mjs']);
    ok(x.status === 2, 'the KAIF origin: its framework/hooks/ source runs when .kaif/hooks/ has no copy', JSON.stringify(x));
    rmSync(join(origin, 'framework', 'installer'), { recursive: true, force: true });
    x = run(origin, { hook_event_name: 'Stop', cwd: origin }, ['probe.mjs']);
    ok(x.status === 0 && x.stdout === '', 'a plain project\'s own framework/hooks/ folder is never run', JSON.stringify(x));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  console.log(bad ? `x ${bad} case(s) failed` : 'v kimi-hook selftest: all ok');
  return bad ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = process.argv[2] === '--selftest' ? selftest() : dispatch(process.argv.slice(2));
}
