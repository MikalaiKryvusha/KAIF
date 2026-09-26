#!/usr/bin/env node
// contour-index-focus-loop.mjs — repro and acceptance of bugs/125: the queue ENTRY page (the list of documents) went into an endless
// reload after the owner answered the first document; the contour then ended as "page closed" and the second document could not open.
//
// Model: the list is opened as a browser TAB (the owner's case — `display-mode: browser`); a script run in every new document counts the
// loads (sessionStorage) and fires `focus` right after `load` — what a focused tab does when its document loads. The page used to reload
// itself on EVERY focus, so the model loops at once. Three cases, read from the page and the server:
//   A — no change in the queue: one reload started by the probe → exactly 1 load in 3 s (a loop gives many);
//   B — the first document is answered, the owner returns to the list (one `focus`): the list updates ONCE (loads +1, one card left);
//   C — the server is alive after both (`/alive` answers) and its log has no "ending the contour".
//
// Usage: node tools/sandbox/probes/contour-index-focus-loop.mjs [<contour dir>]   (default framework/tools/contour; pass a copy of an
// older revision to see it red). Exit: 0 GOOD · 1 BAD (a case failed) · 2 could not run (no browser, the page never came up).
// Quiet by construction: the contour runs in-process with open:false and signal:false (no window, no voice); the browser is headless.
// [TESTED: 2026-09-26 · BAD on the contour of ddca251 (08:32:37: 90 loads in 3 s, 92 → 189 after one focus), GOOD on the fix (08:35:12:
//  1 load, 1 → 2, one card left, the contour alive); report testcases/reports/2026-09-26_contour-queue-reload-and-badge-dates.md]
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tempRoot } from '../../lib/temp-root.mjs';
import { headlessPage, findBrowser } from '../../lib/cdp-mini.mjs';

const WATCH_MS = 3000;      // the loop showed within a second in the owner's tab; 3 s is also the server's beacon grace
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dir = resolve(process.argv[2] || 'framework/tools/contour');
if (!findBrowser()) { console.log('SKIPPED: no Chromium at a known path'); process.exit(2); }
const mod = await import(pathToFileURL(join(dir, 'review.mjs')).href);
const core = await import(pathToFileURL(join(dir, 'core.mjs')).href);

const root = tempRoot('probe-index-focus');
mkdirSync(join(root, 'interviews'), { recursive: true });
const hdr = (n) => `# Interview #${n} — фикстура очереди ${n}\n\n> Topic: форма очереди.\n> Status: **🟡 WAITING FOR OWNER**\n\n`;
const qq = (id) => `## ${id}. Вопрос ${id}?\n\n| Вариант | Что означает |\n|---|---|\n| **A** | первый |\n| **B** | второй |\n\n`;
writeFileSync(join(root, 'interviews', 'interview_201_a.md'), hdr(201) + qq('Q1'));
writeFileSync(join(root, 'interviews', 'interview_202_b.md'), hdr(202) + qq('Q1'));

const logs = [];
let url = null;
mod.serveContour._onUp = (u) => { url = u; };
mod.serveContour(root, { batch: true }, { open: false, signal: false, log: (l) => logs.push(String(l)) });
for (let i = 0; !url && i < 100; i++) await sleep(50);
if (!url) { console.log('BAD RUN: the contour did not come up'); process.exit(2); }
const base = url.replace(/\/$/, '');

let page = null;
const results = [];
const ok = (name, cond, detail) => { results.push({ name, cond, detail }); console.log((cond ? '✅ ' : '❌ ') + name + (detail ? ' — ' + detail : '')); };
// an evaluate that lands in the middle of a reload loses its context; retry until the page answers
const read = async (js) => { for (let i = 0; i < 40; i++) { try { return await page.evaluate(js); } catch { await sleep(75); } } return null; };
try {
  page = await headlessPage(base + '/', { profileDir: join(root, 'profile') });
  await page.addInitScript("try{sessionStorage.setItem('loads',String((+sessionStorage.getItem('loads')||0)+1))}catch(e){}"
    + "window.addEventListener('load',function(){setTimeout(function(){window.dispatchEvent(new Event('focus'))},30)});");
  await read("sessionStorage.setItem('loads','0');setTimeout(function(){location.reload()},10);1");
  await sleep(WATCH_MS);
  const loadsA = await read("+sessionStorage.getItem('loads')");
  ok('A: no change in the queue — the list loads once after a reload (no loop)', loadsA === 1, 'loads in ' + WATCH_MS + ' ms: ' + loadsA);

  const docA = 'interviews/interview_201_a.md';
  const rev = core.bodyHash(readFileSync(join(root, docA), 'utf8'));
  const r = await (await fetch(base + '/decide', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc: docA, answers: { Q1: { choice: 'A' } }, comment: '', rev }) })).json();
  ok('B0: the first document is recorded, one left in the queue', r.ok === true && r.more === 1, JSON.stringify({ ok: r.ok, more: r.more }));
  const before = await read("+sessionStorage.getItem('loads')");
  await read("window.dispatchEvent(new Event('focus'));1");
  await sleep(WATCH_MS);
  const after = await read("+sessionStorage.getItem('loads')");
  const cards = await read("document.querySelectorAll('a.card').length");
  ok('B: the owner returns to the list — it updates ONCE, one card left', after === before + 1 && cards === 1,
    'loads ' + before + ' → ' + after + ', cards ' + cards);

  let alive = false;
  try { alive = (await fetch(base + '/alive')).ok; } catch { alive = false; }
  const ended = logs.find((l) => /ending the contour/.test(l));
  ok('C: the contour is alive and did not end as "page closed"', alive && !ended, ended || '');
} catch (e) {
  console.log('BAD RUN: ' + e.message);
  if (page) page.close();
  process.exit(2);
}
if (page) await page.closeGracefully();
try { await fetch(base + '/closed', { method: 'POST', body: 'index:unsaved' }); } catch { /* the contour may be gone already */ }
await sleep(300);
try { rmSync(root, { recursive: true, force: true }); } catch { /* the browser profile may still be locked — the OS temp cleans it */ }
const bad = results.filter((x) => !x.cond).length;
console.log(bad ? 'BAD — ' + bad + ' case(s) failed (bugs/125)' : 'GOOD — the list does not reload on its own; it updates once after an answer');
process.exit(bad ? 1 : 0);
