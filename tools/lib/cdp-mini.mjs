// tools/lib/cdp-mini.mjs — a zero-dependency mini CDP client for polygon suites (epic LP 2.7, plans/111 step LP5):
// launch a Chromium HEADLESS on a given profile, attach a page, evaluate JS, kill the browser. Extracted from the
// pattern tools/verify-contour.mjs and the probes under tools/sandbox/probes/contour-answer-survives/ carry inline
// (the QA runner keeps its own copy with console/network collectors — a TWIN by design until it migrates here).
// Headless only: nothing here can raise a window on the owner's screen (the flag is not a parameter).
// [TESTED: 2026-09-18 · s22 D (epic LP) drives the REAL shipped contour page through it on the project profile: a headless
//  Edge on `.kaif/contour-window`, text typed by an input event, the server killed, Save → the local store, a graceful
//  Browser.close, and the generator's own headless recovery read the answer back byte-equal — "all checks green";
//  a hard kill 1.5 s after a localStorage write lost it (probe 2026-09-13 run 1), hence closeGracefully —
//  testcases/reports/2026-09-18_contour-close-survive.md]
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { platform } from 'node:os';

const IS_WIN = platform() === 'win32';
export const STEP_TIMEOUT_MS = 10000;   // C9: a hard deadline per CDP call — a hung call is red, never an eternal wait
export const LAUNCH_TIMEOUT_MS = 15000; // C9: the browser must print its DevTools endpoint within this
export const BROWSER_EXES = IS_WIN
  ? ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
     'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
  : platform() === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'];
export const findBrowser = () => BROWSER_EXES.find((p) => existsSync(p)) || null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('WS timeout')), STEP_TIMEOUT_MS);
      ws.onopen = () => { clearTimeout(t); res(); };
      ws.onerror = () => { clearTimeout(t); rej(new Error('WS error')); };
    });
    const c = new CDP(ws);
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { res, rej } = c.pending.get(msg.id);
        c.pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      }
    };
    return c;
  }
  send(method, params = {}, sessionId = undefined) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('CDP timeout: ' + method)); } }, STEP_TIMEOUT_MS);
    });
  }
}

/** Kill the browser and its children; `taskkill` by absolute path so a quiet (empty-PATH) environment still works. */
export function killBrowser(proc) {
  if (!proc) return;
  try {
    if (IS_WIN) {
      const tk = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
      if (existsSync(tk)) { spawnSync(tk, ['/F', '/T', '/PID', String(proc.pid)], { stdio: 'ignore' }); return; }
    }
    proc.kill();
  } catch { /* already gone */ }
}

/**
 * Launch a HEADLESS Chromium on `profileDir` (its own `--user-data-dir`), attach one page at `url`,
 * return { proc, evaluate(js) → value, close() }. `extraArgs` — e.g. the three sign-in-off flags.
 */
export async function headlessPage(url, { profileDir, extraArgs = [], exe = findBrowser(), app = false } = {}) {
  if (!exe) throw new Error('no Chromium at a known path — headless run impossible');
  // `app: true` — the page IS an `--app` window (display-mode: standalone), the way the contour raises it on the owner's
  // screen; default — a TAB opened next to about:blank (display-mode: browser). RL D-F2 (2.7): the page promises "the
  // agent will pick it up" only in the app window, so a suite modelling the owner's window must open one.
  const args = ['--remote-debugging-port=0', '--user-data-dir=' + profileDir, '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--headless=new', ...extraArgs, app ? '--app=' + url : 'about:blank'];
  const proc = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => { killBrowser(proc); rej(new Error('the browser did not print its DevTools endpoint within ' + LAUNCH_TIMEOUT_MS + ' ms')); }, LAUNCH_TIMEOUT_MS);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
    proc.on('exit', () => { clearTimeout(t); rej(new Error('the browser died on start')); });
  });
  const cdp = await CDP.connect(wsUrl);
  let targetId = null;
  if (app) { // the --app window is already the page: find its target instead of opening a tab beside it
    const until = Date.now() + LAUNCH_TIMEOUT_MS;
    while (!targetId && Date.now() < until) {
      const { targetInfos } = await cdp.send('Target.getTargets');
      const t = targetInfos.find((x) => x.type === 'page' && x.url.startsWith(url));
      if (t) targetId = t.targetId; else await sleep(100);
    }
    if (!targetId) { try { cdp.ws.close(); } catch { /* closed */ } killBrowser(proc); throw new Error('the --app window did not appear within ' + LAUNCH_TIMEOUT_MS + ' ms'); }
  } else ({ targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' }));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  for (const d of ['Page', 'Runtime']) await cdp.send(d + '.enable', {}, sessionId);
  if (!app) await cdp.send('Page.navigate', { url }, sessionId);
  await sleep(700); // a local self-contained page renders at once
  const evaluate = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('eval: ' + ((r.exceptionDetails.exception || {}).description || 'exception'));
    return r.result.value;
  };
  // The --app window starts on about:blank and navigates by itself (observed: first evaluate saw about:blank with no
  // fields, the next one 500 ms later the page) — wait until the document at `url` is complete before handing it over.
  if (app) {
    const until = Date.now() + LAUNCH_TIMEOUT_MS;
    const expr = 'location.href.indexOf(' + JSON.stringify(url) + ')===0&&document.readyState===\'complete\'';
    while (!(await evaluate(expr))) {
      if (Date.now() > until) { try { cdp.ws.close(); } catch { /* closed */ } killBrowser(proc); throw new Error('the --app window did not load ' + url + ' within ' + LAUNCH_TIMEOUT_MS + ' ms'); }
      await sleep(100);
    }
  }
  const close = () => { try { cdp.ws.close(); } catch { /* closed */ } killBrowser(proc); };
  // A GRACEFUL close (Browser.close) flushes localStorage to disk — a hard kill within ~5 s of a write loses it
  // (probe run 1 of 2026-09-13: kill after 1500 ms → "READBACK equal: false"). The owner closes his window normally;
  // a suite that models him must not kill it. Falls back to the hard kill when the browser does not exit in time.
  const closeGracefully = async (graceMs = 5000) => {
    const exited = new Promise((res) => proc.once('exit', () => res(true)));
    try { await cdp.send('Browser.close'); } catch { /* the browser may already be going down */ }
    const done = await Promise.race([exited, sleep(graceMs).then(() => false)]);
    try { cdp.ws.close(); } catch { /* closed */ }
    if (!done) killBrowser(proc);
    return done;
  };
  // OW9 (2.8, origin issue #104): a frame of the page as the owner would see it — a PNG (base64) for an explanation page; `full` takes
  // the whole scroll height. [TESTED: 2026-09-25 20:39–20:50 · the frames of the shipped contour page and the full frame of the explanation
  // mockup were taken with it and READ — a covered button was found on one; report testcases/reports/2026-09-25_ow9-explain-with-picture.md]
  const screenshot = async ({ full = false } = {}) => {
    let clip;
    if (full) {
      const m = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
      const size = m.cssContentSize || m.contentSize;
      clip = { x: 0, y: 0, width: Math.ceil(size.width), height: Math.ceil(size.height), scale: 1 };
    }
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) }, sessionId);
    return r.data;
  };
  // bugs/125 (2.8): a script run in EVERY new document of this page before its own scripts — models what the browser does on each
  // load (a probe counts loads in sessionStorage and fires `focus` after `load`, as a focused tab does). [TESTED: 2026-09-26 08:32–08:43 ·
  // the probe contour-index-focus-loop.mjs and s22 (8) counted the loads of the queue page with it: 90 and 80 on the build before the fix,
  // 1 → 2 after it; report testcases/reports/2026-09-26_contour-queue-reload-and-badge-dates.md]
  const addInitScript = (source) => cdp.send('Page.addScriptToEvaluateOnNewDocument', { source }, sessionId);
  return { proc, evaluate, close, closeGracefully, screenshot, exe, addInitScript };
}
