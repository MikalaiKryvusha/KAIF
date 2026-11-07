// polygon-lock.mjs — замок живого полигона (EXP-0206, сессия 99): `npm run test:core` держит `.kaif/polygon.lock` (pid + момент), пока идёт;
// `node tools/build-framework.mjs` отказывает, пока владелец замка жив, — сборка посреди прогона меняет `dist` под ним, и прогон перестаёт
// быть уликой (сессия 99: «17 of 28 suites FAILED» на одной общей причине замера). Замок в рабочей копии, не в общем OS-temp: у каждой копии
// свой полигон (bugs/59 — фиксированное имя в общем каталоге запрещено). Замок умершего процесса не держит никого.
// Обход — `KAIF_BUILD_UNDER_POLYGON=1` (осознанно, например сборка в копии дерева).
// [TESTED: 2026-11-07 · selftest 5/5; a live polygon → the build refused naming pid 37340, after the run → built — testcases/reports/2026-11-07_polygon-lock.md]
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LOCK = join('.kaif', 'polygon.lock');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
// Кто держит полигон этой рабочей копии: { pid, at } — или null (замка нет, он нечитаем или его процесс умер).
export function polygonRunning(repo) {
  const p = join(resolve(repo), LOCK);
  if (!existsSync(p)) return null;
  let l = null;
  try { l = JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
  return l && Number.isInteger(l.pid) && l.pid !== process.pid && alive(l.pid) ? l : null;
}
// Взять замок на время прогона; снимается на выходе процесса (и только свой).
export function takePolygonLock(repo) {
  const p = join(resolve(repo), LOCK);
  mkdirSync(join(resolve(repo), '.kaif'), { recursive: true });
  writeFileSync(p, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }) + '\n');
  process.on('exit', () => { try { if (JSON.parse(readFileSync(p, 'utf8')).pid === process.pid) rmSync(p, { force: true }); } catch { /* gone */ } });
}

function selftest() {
  let bad = 0;
  const ok = (c, n) => { console.log((c ? '  v ' : '  x ') + n); if (!c) bad++; };
  const r = mkdtempSync(join(tmpdir(), 'kaif-polylock-'));
  try {
    ok(polygonRunning(r) === null, 'no lock → nobody runs the polygon');
    mkdirSync(join(r, '.kaif'), { recursive: true });
    writeFileSync(join(r, LOCK), JSON.stringify({ pid: process.ppid, at: 'x' }));
    ok(polygonRunning(r) && polygonRunning(r).pid === process.ppid, 'a lock of a live process (the parent) → the polygon runs');
    writeFileSync(join(r, LOCK), JSON.stringify({ pid: 2147483646, at: 'x' }));
    ok(polygonRunning(r) === null, 'a lock of a dead process → nobody');
    writeFileSync(join(r, LOCK), '{broken');
    ok(polygonRunning(r) === null, 'an unreadable lock → nobody');
    writeFileSync(join(r, LOCK), JSON.stringify({ pid: process.pid, at: 'x' }));
    ok(polygonRunning(r) === null, 'one\'s own lock does not stop oneself');
  } finally { rmSync(r, { recursive: true, force: true }); }
  console.log(bad ? '✖ polygon-lock selftest: ' + bad + ' red' : '✔ polygon-lock selftest: green');
  process.exit(bad ? 1 : 0);
}
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href && process.argv.includes('--selftest')) selftest();
export const POLYGON_LOCK_FILE = fileURLToPath(import.meta.url);
