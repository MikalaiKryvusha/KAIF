// tools/sandbox/probes/contour-answer-survives/probe.mjs — PROBE (not a polygon suite), researches/31 · issue #66:
// localStorage under a HARD kill after N ms (argv[2]); headless, no window, no sound.
//   node tools/sandbox/probes/contour-answer-survives/probe.mjs 6000
// [TESTED: 2026-09-13 · session 64 on Edge 153.0.4234.32 — testcases/reports/2026-09-13_probe-contour-answer-survives-kill.md]
// Probe: does a Chromium (Edge) page's localStorage land on disk in a --user-data-dir we choose,
// survive a HARD kill of the browser, and read back by a second (headless) browser run?
// Fully headless: no window, no sound. ASCII-only argv.
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tempRoot } from '../../../lib/temp-root.mjs';

const HERE = tempRoot('probe-contour-probe');
const prof = mkdtempSync(join(HERE, 'prof-'));
const VALUE = '\u041e\u0442\u0432\u0435\u0442 \u0432\u043b\u0430\u0434\u0435\u043b\u044c\u0446\u0430 ' + Date.now(); // Cyrillic text
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);

let got = {};
const page = (mode) => `<!doctype html><meta charset=utf-8><script>
${mode === 'write'
  ? `localStorage.setItem('owner-review:doc.md:comment', ${JSON.stringify(VALUE)}); fetch('/written');`
  : `fetch('/read',{method:'POST',body:localStorage.getItem('owner-review:doc.md:comment')||'<null>'});`}
</script>`;
let mode = 'write';
const srv = http.createServer((req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(page(mode)); }
  let b = ''; req.setEncoding('utf8'); req.on('data', (c) => (b += c));
  req.on('end', () => { got[req.url] = b || true; log('hit', req.url, b ? JSON.stringify(b) : ''); res.end('ok'); });
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (k, ms) => { for (let t = 0; t < ms; t += 100) { if (got[k]) return true; await wait(100); } return false; };
const launch = () => spawn(EDGE, ['--headless=new', '--user-data-dir=' + prof, '--no-first-run', '--disable-gpu', url], { stdio: 'ignore' });

log('profile', prof, 'url', url, 'edge exists', existsSync(EDGE));
let p = launch();
log('write run pid', p.pid, 'written:', await until('/written', 20000));
const FLUSH_MS = Number(process.argv[2] || 1500);
await wait(FLUSH_MS);
log('HARD kill after', FLUSH_MS, 'ms:', spawnSync('taskkill', ['/F', '/T', '/PID', String(p.pid)]).status);
await wait(1500);

const lsDir = join(prof, 'Default', 'Local Storage', 'leveldb');
const needle = Buffer.from(VALUE, 'utf16le');
let found = [];
if (existsSync(lsDir)) for (const f of readdirSync(lsDir)) { const buf = readFileSync(join(lsDir, f)); if (buf.includes(needle)) found.push(f); }
log('leveldb dir exists', existsSync(lsDir), 'files', existsSync(lsDir) ? readdirSync(lsDir).join(',') : '-', '| value bytes found in', found.join(',') || 'NONE');

mode = 'read';
p = launch();
log('read run pid', p.pid, 'read:', await until('/read', 20000));
log('READBACK equal:', got['/read'] === VALUE);
spawnSync('taskkill', ['/F', '/T', '/PID', String(p.pid)]);
srv.close();
