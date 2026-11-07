#!/usr/bin/env node
// hc4-anon-real-identity.mjs — ПРОБА шага HC4 (bugs/130, вторая половина; интервью №048, Q1 = A, №157): обезличенная установка ядром сборки
// (`dist/` или `KAIF_DIST=<каталог>`) в свежий git-проект во временном каталоге ОС — с НАСТОЯЩЕЙ личностью git этой машины (без подмены): ни одно
// слово git-имени не стоит ни в одном файле дерева, символ веры руководства — «THE PROJECT OWNER'S VISION». Имя в вывод не печатается —
// только счёт файлов. Без git-имени на машине — код 2 (не судит). Код 0 — зелёный, 1 — красный. ≈ 5 с.
// [TESTED: 2026-11-07 · зелёная на этой сборке, красная на HEAD до №157 (2 файла) — testcases/reports/2026-11-07_hc4-anon-owner-name.md]
import { spawnSync, execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, cpSync, readdirSync, statSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const DIST = resolve(process.env.KAIF_DIST || join(import.meta.dirname, '..', '..', '..', 'dist'));
let name = '';
try { name = execSync('git config user.name', { encoding: 'utf8' }).trim(); } catch { /* none */ }
if (!name) { console.log('SKIPPED — this machine has no git user.name; nothing to judge'); process.exit(2); }
const words = name.split(/\s+/).filter((w) => w.length >= 3);
const d = mkdtempSync(join(tmpdir(), 'kaif-hc4-real-'));
let bad = 0;
try {
  spawnSync('git', ['init', '-q'], { cwd: d });
  mkdirSync(join(d, '.kaif', 'install'), { recursive: true });
  cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(d, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(DIST, 'KAIF-CORE.mjs'), join(d, '.kaif', 'kaif-core.mjs'));
  const r = spawnSync(process.execPath, [join(d, '.kaif', 'kaif-core.mjs'), 'install', '--mode', 'anonymous'], { cwd: d, encoding: 'utf8', timeout: 120000 });
  console.log('  · install --mode anonymous → exit ' + r.status);
  const hits = new Map();
  const walk = (p) => { for (const n of readdirSync(p)) { if (n === '.git') continue; const f = join(p, n);
    if (statSync(f).isDirectory()) walk(f); else { const t = readFileSync(f, 'utf8'); for (const w of words) if (t.includes(w)) hits.set(f.slice(d.length + 1), (hits.get(f.slice(d.length + 1)) || 0) + 1); } } };
  walk(d);
  const guide = existsSync(join(d, 'AGENT_GUIDE.md')) ? readFileSync(join(d, 'AGENT_GUIDE.md'), 'utf8') : '';
  const creedOk = guide.includes("THE PROJECT OWNER'S VISION");
  // the install machinery itself is TRANSIENT until the anonymous self-clean (Reference §11.3): the bundle goes, the core is anonymized by
  // value — sandbox s04 S13 judges the tree AFTER verify-final; here they are printed, not judged
  const TRANSIENT = new Set([join('.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), join('.kaif', 'kaif-core.mjs')]);
  const judged = [...hits.keys()].filter((f) => !TRANSIENT.has(f)), transient = [...hits.keys()].filter((f) => TRANSIENT.has(f));
  console.log('  · deployed files carrying a word of the machine\'s git name: ' + judged.length + (judged.length ? ' — ' + judged.join(', ') : ''));
  console.log('  · transient install machinery carrying it (until the self-clean; s04 S13 judges after it): ' + (transient.join(', ') || 'none'));
  console.log('  · the creed reads «THE PROJECT OWNER\'S VISION»: ' + creedOk);
  if (r.status !== 0 || judged.length || !creedOk) bad = 1;
} finally { rmSync(d, { recursive: true, force: true }); }
console.log(bad ? '✖ hc4-anon-real-identity: red' : '✔ hc4-anon-real-identity: green');
process.exit(bad);
