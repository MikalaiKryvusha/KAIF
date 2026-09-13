// tools/sandbox/probes/contour-answer-survives/visible.mjs — PROBE (not a polygon suite), researches/31 · issue #66:
// RAISES A VISIBLE Edge WINDOW ON THE OWNER'S SCREEN (≈ 10 s, no sound) — announce it in the chat BEFORE running;
//   never from the polygon or a judge. Screenshots land in the temp root; KAIF_TMP_KEEP=1 keeps them.
//   node tools/sandbox/probes/contour-answer-survives/visible.mjs
// [TESTED: 2026-09-13 · session 64 on Edge 153.0.4234.32 — testcases/reports/2026-09-13_probe-contour-answer-survives-kill.md]
// Functional probe on the owner's real path: a VISIBLE Edge --app window with its own profile,
// text typed by real input events (CDP Input.insertText), the page persists to IndexedDB, the browser
// is HARD-killed, then a headless run with the same profile recovers the text. Screenshots read the screen.
// Announced to the owner before launch (chat 2026-09-13 12:25). No sound. ASCII-only argv.
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tempRoot } from '../../../lib/temp-root.mjs';

const HERE = tempRoot('probe-contour-visible');
const prof = mkdtempSync(join(HERE, 'vis-'));
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const TEXT = 'Ответ владельца: страница убита, текст обязан выжить ' + Date.now();
const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const PAGE_WRITE = `<!doctype html><meta charset=utf-8><title>KAIF · проба окна контура</title>
<body style="font:16px system-ui;margin:24px"><h2>KAIF · проба окна контура</h2>
<p>Агент проверяет, что набранный текст переживает убийство окна. Ничего делать не нужно — окно закроется само.</p>
<textarea id=t rows=5 cols=60></textarea><p id=s></p>
<script>
var db;var r=indexedDB.open('contour',1);r.onupgradeneeded=function(){r.result.createObjectStore('d')};
r.onsuccess=function(){db=r.result;fetch('/loaded')};
document.getElementById('t').addEventListener('input',function(e){var v=e.target.value;
 var tx=db.transaction('d','readwrite');tx.objectStore('d').put(v,'comment');
 tx.oncomplete=function(){document.getElementById('s').textContent='записано: '+v.length;fetch('/written',{method:'POST',body:String(v.length)})}});
</script>`;
const PAGE_READ = `<!doctype html><meta charset=utf-8><script>
var r=indexedDB.open('contour',1);r.onupgradeneeded=function(){r.result.createObjectStore('d')};
r.onsuccess=function(){var g=r.result.transaction('d').objectStore('d').get('comment');
g.onsuccess=function(){fetch('/read',{method:'POST',body:g.result||'<null>'})}};</script>`;

let mode = 'write'; const got = {};
const srv = http.createServer((req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(mode === 'write' ? PAGE_WRITE : PAGE_READ); }
  let b = ''; req.setEncoding('utf8'); req.on('data', (c) => (b += c));
  req.on('end', () => { got[req.url] = b || true; log('hit', req.url, b.length > 80 ? b.slice(0, 80) + '…' : b); res.end('ok'); });
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const until = async (k, ms) => { for (let t = 0; t < ms; t += 100) { if (got[k]) return true; await wait(100); } return false; };

function shot(name) {
  const ps = join(HERE, 'shot.ps1'), out = join(HERE, name);
  writeFileSync(ps, `Add-Type -AssemblyName System.Windows.Forms,System.Drawing
$b=[System.Windows.Forms.SystemInformation]::VirtualScreen
$bmp=New-Object System.Drawing.Bitmap $b.Width,$b.Height
$g=[System.Drawing.Graphics]::FromImage($bmp);$g.CopyFromScreen($b.Left,$b.Top,0,0,$bmp.Size)
$bmp.Save('${out.replace(/'/g, "''")}',[System.Drawing.Imaging.ImageFormat]::Png)`);
  const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps]);
  log('screenshot', name, 'exit', r.status, existsSync(out));
}
function killProfile() {
  const ps = join(HERE, 'kill.ps1');
  writeFileSync(ps, `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${prof.split(/[\\/]/).pop()}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }`);
  const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps], { encoding: 'utf8' });
  log('hard kill of probe-profile processes:', r.stdout.trim().split(/\s+/).length, 'pids, exit', r.status);
}

log('profile', prof, 'url', url);
spawn(EDGE, ['--app=' + url, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun', '--window-size=900,600', '--remote-debugging-port=0'], { stdio: 'ignore', detached: true }).unref();
log('loaded:', await until('/loaded', 30000));
await wait(1500);
shot('shot1_window.png');

// CDP: real input into the textarea
const portFile = join(prof, 'DevToolsActivePort');
for (let t = 0; t < 50 && !existsSync(portFile); t++) await wait(100);
const dport = readFileSync(portFile, 'utf8').split(/\r?\n/)[0];
const targets = await (await fetch('http://127.0.0.1:' + dport + '/json/list')).json();
const page = targets.find((x) => x.type === 'page' && x.url.startsWith(url));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const call = (method, params = {}) => new Promise((res) => { const my = ++id;
  const h = (ev) => { const m = JSON.parse(ev.data); if (m.id === my) { ws.removeEventListener('message', h); res(m); } };
  ws.addEventListener('message', h); ws.send(JSON.stringify({ id: my, method, params })); });
await call('Runtime.evaluate', { expression: "document.getElementById('t').focus()" });
for (const word of TEXT.split(/(?<= )/)) { await call('Input.insertText', { text: word }); await wait(120); }
log('typed; last write reported:', await until('/written', 5000), 'chars', got['/written']);
await wait(500);
shot('shot2_typed.png');
killProfile();
await wait(1500);
shot('shot3_after_kill.png');

mode = 'read';
const p = spawn(EDGE, ['--headless=new', '--user-data-dir=' + prof, '--no-first-run', '--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun', '--disable-gpu', url], { stdio: 'ignore' });
log('recover read:', await until('/read', 30000));
log('RECOVERED equal to typed text:', got['/read'] === TEXT, '| typed', TEXT.length, 'recovered', String(got['/read']).length);
spawnSync('taskkill', ['/F', '/T', '/PID', String(p.pid)]);
killProfile();
srv.close(); process.exit(0);
