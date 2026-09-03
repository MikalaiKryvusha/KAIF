// s15-guard-lint.mjs — песочница линтера объявления стражей (2.5, эпик CN, шаг CN3; issue #35 поля:
// страж доказан против фикстуры, а не против угрозы). Оба ответа на фикстурах: selftest модуля
// зелёный · плохой блок (@guard без GAP, @forensic с DURABLE-AT: close) → exit 1 с названными полями
// · чистый блок → exit 0 · дерево без маркеров → SKIPPED (exit 3, класс bugs/34: «не сканировано»
// никогда не читается как «чисто»).
// [TESTED: 2026-09-04 · зелёный в составе полигона — семь проверок свода ✅, «sandbox suite: all 15 suites
//  green» (npm run test:core); красный линтера наблюдён на плохой фикстуре в том же прогоне]
import { writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('guardlint', process.argv[2]);
mkdirSync(join(ROOT, '.kaif', 'tools'), { recursive: true });
mkdirSync(join(ROOT, 'src'), { recursive: true });
mkdirSync(join(ROOT, 'empty'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-250)));
  if (!cond) failures++;
};
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-guard-lint.mjs')} ${args} 2>&1`, { cwd: ROOT, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-guard-lint.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-guard-lint.mjs'));

// --- selftest: каждое правило красное на своей фикстуре и молчит на чистом блоке
let r = run('selftest');
ok(r.code === 0 && /selftest OK/.test(r.out), 's15 selftest — правила доказаны обоими ответами', r.out);

// --- КРАСНЫЙ ДОКАЗАН: страж без GAP и самописец с DURABLE-AT: close — класс issue #35
writeFileSync(join(ROOT, 'src', 'fuse.mjs'), `// @guard fuse-deadman
// THREAT:         machine freeze during the descent
// PROVED-AGAINST: killing the burn PROCESS on the digital twin
// ON-REAL-PATH:   NOT YET
export const fuse = 1;

/* @forensic fuse-ring
 * EXPLAINS:   the judge's behaviour at the moment of the machine's death
 * DURABLE-AT: close
 */
export const ring = [];
`);
r = run('check src');
ok(r.code === 1, 's15 плохая фикстура — линтер КРАСНЫЙ (exit 1)', r.out);
ok(/fuse-deadman: missing GAP/.test(r.out), 's15 плохая — пропущенное поле GAP названо по имени стража', r.out);
ok(/fuse-ring: DURABLE-AT: "close" is a rejected value/.test(r.out), 's15 плохая — DURABLE-AT: close отвергнут', r.out);

// --- ЗЕЛЁНЫЙ НА ЧИСТОЙ: те же блоки с названным зазором и долговечной лентой; NOT YET виден в итоге
writeFileSync(join(ROOT, 'src', 'fuse.mjs'), `// @guard fuse-deadman
// THREAT:         machine freeze during the descent
// PROVED-AGAINST: killing the burn PROCESS on the digital twin
// GAP:            the twin cannot freeze its host — the class is NOT proved
// ON-REAL-PATH:   NOT YET
export const fuse = 1;

/* @forensic fuse-ring
 * EXPLAINS:   the judge's behaviour at the moment of the machine's death
 * DURABLE-AT: every-second
 */
export const ring = [];
`);
r = run('check src');
ok(r.code === 0 && /guard-lint OK — 2 declared block/.test(r.out), 's15 чистая фикстура — линтер ЗЕЛЁНЫЙ, два блока сосчитаны', r.out);
ok(/1 guard\(s\) still ON-REAL-PATH: NOT YET/.test(r.out), 's15 чистая — «NOT YET» виден в итоге: объявлен, не DONE', r.out);

// --- SKIPPED: дерево без маркеров — exit 3, слово SKIPPED, не «чисто»
r = run('check empty');
ok(r.code === 3 && /SKIPPED/.test(r.out), 's15 дерево без маркеров — SKIPPED (exit 3), не ложный зелёный', r.out);

if (failures) { console.error(`\n❌ s15: ${failures} failure(s)`); process.exit(1); }
console.log('\n✅ s15 guard-lint: all green');
