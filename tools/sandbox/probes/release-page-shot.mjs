#!/usr/bin/env node
// tools/sandbox/probes/release-page-shot.mjs — a HEADLESS screenshot of a published page (by default the GitHub release
// page of a tag) for the `/release` gate 6.9 "read the first screen with your eyes" WITHOUT raising a window on the
// owner's screen (`gh release view --web` opens his browser — wrong when the owner said the showcase is not to be shown,
// word №123). The agent then reads the PNG itself.
//
// Usage: node tools/sandbox/probes/release-page-shot.mjs <tag | url> <out.png> [width] [height]
// Headless Edge/Chrome at an absolute path, a throw-away profile (mkdtemp, deleted), the three sign-in-off flags of
// EXP-0134; nothing here can show a window or make a sound.
// [TESTED: 2026-09-18 17:32 +03:00 · session 69, THIS file, tag v2.7: exit 0, a 396 680-byte PNG at 1280×1400, read by the
//  agent — title and Latest badge, "released this 8 minutes ago", the logo with its caption, the release date, paragraphs
//  whole, ticket links rendered as links (its scratchpad twin took the gate-6.9 shot at ≈ 17:25).
//  Report: testcases/reports/2026-09-18_release-2.7.md, run 19]
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { findBrowser } from '../../lib/cdp-mini.mjs';

const [what, outArg, w = '1280', h = '1800'] = process.argv.slice(2);
if (!what || !outArg) { console.error('usage: release-page-shot.mjs <tag | url> <out.png> [width] [height]'); process.exit(1); }
const url = /^https?:\/\//.test(what) ? what : 'https://github.com/MikalaiKryvusha/KAIF/releases/tag/' + what;
const out = resolve(outArg);
const exe = findBrowser();
if (!exe) { console.log('SKIPPED — no Chromium at a known path'); process.exit(3); }
const prof = mkdtempSync(join(tmpdir(), 'kaif-shot-'));
const r = spawnSync(exe, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + prof,
  '--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun', '--hide-scrollbars',
  '--window-size=' + w + ',' + h, '--virtual-time-budget=8000', '--screenshot=' + out, url], { timeout: 60000, stdio: 'pipe' });
try { rmSync(prof, { recursive: true, force: true }); } catch { /* the browser may hold a file for a moment */ }
const ok = existsSync(out) && statSync(out).size > 0;
console.log('exit ' + r.status + ' · ' + (ok ? statSync(out).size + ' bytes → ' + out + ' — now READ it: the gate is the eyes, not this line' : 'NO SCREENSHOT'));
process.exit(ok ? 0 : 1);
