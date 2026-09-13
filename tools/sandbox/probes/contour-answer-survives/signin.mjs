// tools/sandbox/probes/contour-answer-survives/signin.mjs — PROBE (not a polygon suite), researches/31 · issue #66:
// does a NEW Edge profile silently sign into the Windows account? prints account_info of Default/Preferences.
//   node tools/sandbox/probes/contour-answer-survives/signin.mjs headless [--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun]
//   `visible` as argv[2] RAISES A WINDOW ON THE OWNER'S SCREEN — announce it in the chat first, never from the polygon.
// [TESTED: 2026-09-13 · session 64 on Edge 153.0.4234.32 — testcases/reports/2026-09-13_probe-contour-answer-survives-kill.md]
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tempRoot } from '../../../lib/temp-root.mjs';
const HERE = tempRoot('probe-contour-signin');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const visible = process.argv[2] === 'visible';
const extra = process.argv.slice(3);
const prof = mkdtempSync(join(HERE, 'sig-'));
const args = [visible ? '--app=data:text/html,<title>KAIF probe</title>KAIF sign-in probe' : '--headless=new', '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', ...extra, visible ? '--window-size=700,400' : 'about:blank'];
const p = spawn(EDGE, args, { stdio: 'ignore', detached: visible }); if (visible) p.unref();
await new Promise((r) => setTimeout(r, 12000));
let shot = '';
if (visible) { spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(HERE, 'shot.ps1')]); shot = 'screenshot taken'; }
const ps = join(HERE, 'kill.ps1');
spawnSync('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${prof.split(/[\/]/).pop()}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`]);
await new Promise((r) => setTimeout(r, 1500));
const count = (f) => { try { const s = readFileSync(f, 'latin1'); return [/account_info"\s*:\s*\[\s*\{/.test(s) ? 'account_info:yes' : 'account_info:no', (s.match(/@/g) || []).length + ' at-signs']; } catch { return ['missing']; } };
console.log(visible ? 'VISIBLE' : 'HEADLESS', extra.join(' ') || '(no extra flags)', '| Preferences', count(join(prof, 'Default', 'Preferences')).join(' '), '| Local State', count(join(prof, 'Local State')).join(' '), shot);
rmSync(prof, { recursive: true, force: true });
