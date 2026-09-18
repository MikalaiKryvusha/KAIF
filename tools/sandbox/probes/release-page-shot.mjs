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
//  2026-09-18 17:47 +03:00 · after the stale-file fix: v2.7 → exit 0, 396 686 bytes; a dead URL (https://127.0.0.1:9/…) ALSO
//  exits 0 with a 28 876-byte shot of the browser's own error page («Не удается открыть эту страницу», ERR_UNSAFE_PORT) — read
//  by the agent. So exit 0 proves only that a picture was taken; the check is reading it.
//  Report: testcases/reports/2026-09-18_release-2.7.md, runs 19 and 21]
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
// A stale PNG at the same path must not pass for a fresh shot (judge of session 69, finding 4): remove it first, and
// require the browser's own exit code 0 as well as a non-empty file.
rmSync(out, { force: true });
const prof = mkdtempSync(join(tmpdir(), 'kaif-shot-'));
const r = spawnSync(exe, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + prof,
  '--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun', '--hide-scrollbars',
  '--window-size=' + w + ',' + h, '--virtual-time-budget=8000', '--screenshot=' + out, url], { timeout: 60000, stdio: 'pipe' });
try { rmSync(prof, { recursive: true, force: true }); } catch { /* the browser may hold a file for a moment */ }
const ok = r.status === 0 && existsSync(out) && statSync(out).size > 0;
console.log('exit ' + r.status + ' · ' + (ok ? statSync(out).size + ' bytes → ' + out + ' — now READ it: the gate is the eyes, not this line' : 'NO SCREENSHOT'));
process.exit(ok ? 0 : 1);
