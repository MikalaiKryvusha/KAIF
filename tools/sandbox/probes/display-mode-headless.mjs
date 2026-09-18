#!/usr/bin/env node
// tools/sandbox/probes/display-mode-headless.mjs — MEASUREMENT (RL D-F2, KAIF 2.7): what does the contour page see as its
// display mode when a HEADLESS Chromium opens it as an `--app` window versus as a TAB? The page promises "the agent will
// pick your answer up" only when it observes `display-mode: standalone` (the app window the contour raises on the
// project profile); a suite that models the owner's window must therefore open an app window, and it can only do that
// headless if headless reports standalone for `--app`. Nothing here can reach the owner: headless only, temp profiles
// (deleted), the three sign-in-off flags of EXP-0134, a local server on 127.0.0.1:0.
// Usage: node tools/sandbox/probes/display-mode-headless.mjs  → two lines "app: standalone=<bool>" · "tab: standalone=<bool>"
// [TESTED: 2026-09-18 ≈ 16:53 +03:00 · Edge on Windows, headless=new: "app: standalone=true browser=false" ·
//  "tab: standalone=false browser=true", exit 0 — the page can tell the window from a tab without a visible window;
//  s22 D now drives the owner's page as an --app window and a tab on a foreign profile (RL D-F2)]
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { headlessPage, findBrowser } from '../../lib/cdp-mini.mjs';

const SIGNIN_OFF = ['--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun'];
const PAGE = '<!doctype html><title>dm</title><p>display-mode probe</p>';

if (!findBrowser()) { console.log('SKIPPED — no Chromium at a known path'); process.exit(3); }
const server = createServer((q, s) => { s.writeHead(200, { 'Content-Type': 'text/html' }); s.end(PAGE); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + server.address().port + '/';
const EXPR = "JSON.stringify({standalone: matchMedia('(display-mode: standalone)').matches, browser: matchMedia('(display-mode: browser)').matches})";
let code = 0;
for (const app of [true, false]) {
  const prof = mkdtempSync(join(tmpdir(), 'kaif-dm-'));
  try {
    const page = await headlessPage(url, { profileDir: prof, extraArgs: SIGNIN_OFF, app });
    const v = JSON.parse(await page.evaluate(EXPR));
    console.log((app ? 'app' : 'tab') + ': standalone=' + v.standalone + ' browser=' + v.browser);
    await page.closeGracefully();
  } catch (e) { console.log((app ? 'app' : 'tab') + ': ERROR ' + e.message); code = 1; }
  try { rmSync(prof, { recursive: true, force: true }); } catch { /* the browser may still hold a file for a moment */ }
}
server.close();
process.exit(code);
