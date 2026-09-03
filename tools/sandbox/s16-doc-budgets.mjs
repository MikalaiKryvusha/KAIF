// s16-doc-budgets.mjs — песочница бюджетов размера ядра перечитывания (2.5, эпик CN, шаг CN6;
// запрос поля 09: ритуал контекста стоит O(канона), а канон только растёт — STATUS в 6× от цели
// и «предупредить некому»). Оба ответа на развёрнутой копии: свежий деплой — `check` о бюджетах
// молчит · раздутые AGENT_GUIDE (бюджет 1200) и STATUS (бюджет 200) → предупреждения называют
// документ, число строк и бюджет, STATUS сохраняет подсказку про стрижку бонсая, код выхода
// остаётся 0 (совет, не отказ) · раздутый документ ВНЕ ядра перечитывания — тишина.
// Поведение проверяется на РАЗВЁРНУТОЙ копии, не на исходнике (EXP-0010).
// [TESTED: 2026-09-04 · зелёный в составе полигона — одиннадцать проверок свода ✅, «sandbox suite: all 16
//  suites green» (npm run test:core); КРАСНЫЙ доказан на копии: мутант ядра с отключённым предупреждением
//  (`if (false && n > budget)`) в scratch-dist → exit 1, красны ровно три адресованных ассерта (AGENT_GUIDE ·
//  STATUS · «ровно два предупреждения»), остальные восемь зелёные]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('budgets', process.argv[2]);
const S = join(ROOT, 'deploy');
mkdirSync(join(S, '.kaif', 'install'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// stderr сливается в out и на зелёном коде тоже — предупреждения бюджетов идут в stderr (bugs/61:
// немых команд в своде нет, результат каждой судится внутри ok(...)).
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd: S, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const lines = (doc) => readFileSync(join(S, doc), 'utf8').replace(/\r?\n$/, '').split(/\r?\n/).length;
const bloat = (doc, extra) => {
  const p = join(S, doc);
  const cur = readFileSync(p, 'utf8').replace(/\r?\n$/, '');
  writeFileSync(p, cur + '\n' + Array.from({ length: extra }, (_, i) => `filler line ${i + 1} — fixture bloat`).join('\n') + '\n');
};

// ---------------------------------------------------------------- свежий деплой: тишина
console.log('\n=== s16: бюджеты размера ядра перечитывания ===');
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
let r = run('install');
ok(r.code === 0, 's16 install exit 0', r.out.slice(-400));
r = run('check');
ok(r.code === 0, 's16 свежий деплой — check зелёный', r.out.slice(-400));
ok(!/against its budget/.test(r.out), 's16 свежий деплой — ни одного предупреждения о бюджете (поставка внутри своих бюджетов)', r.out);
for (const doc of ['AGENT_GUIDE.md', 'STATUS.md'])
  ok(existsSync(join(S, doc)), `s16 фикстура: ${doc} развёрнут (иначе раздувать нечего)`);

// ---------------------------------------------------------------- раздутое ядро: предупреждение, не отказ
// AGENT_GUIDE до > 1200 строк, STATUS до > 200: бюджеты из таблицы DOC_BUDGETS ядра (одно место).
bloat('AGENT_GUIDE.md', Math.max(0, 1200 - lines('AGENT_GUIDE.md')) + 100);
bloat('STATUS.md', Math.max(0, 200 - lines('STATUS.md')) + 50);
const agLines = lines('AGENT_GUIDE.md'), stLines = lines('STATUS.md');
// документ ВНЕ ядра перечитывания — раздуваем сильнее любого бюджета, предупреждения быть не должно
const outside = ['PROJECT_HISTORY.md', 'EXPERIENCE.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md'].find((d) => existsSync(join(S, d)));
ok(Boolean(outside), 's16 фикстура: есть развёрнутый документ вне ядра перечитывания', 'ни один из PROJECT_HISTORY / EXPERIENCE / INTERNAL_MAP не развёрнут');
if (outside) bloat(outside, 1500);
r = run('check');
ok(r.code === 0, 's16 раздутое ядро — check остаётся зелёным (совет, не отказ)', r.out.slice(-400));
ok(new RegExp(`⚠ AGENT_GUIDE\\.md: ${agLines} lines against its budget of ~1200 — move content OUT`).test(r.out),
   `s16 раздутый AGENT_GUIDE (${agLines}) — предупреждение называет документ, число и бюджет 1200`, r.out);
ok(new RegExp(`⚠ STATUS\\.md: ${stLines} lines against its budget of ~200 — time for a bonsai trim`).test(r.out),
   `s16 раздутый STATUS (${stLines}) — предупреждение с подсказкой про стрижку бонсая сохранено`, r.out);
ok(!(outside && new RegExp(`${outside.replace('.', '\\.')}: \\d+ lines against`).test(r.out)),
   `s16 документ вне ядра (${outside}) раздут до > 1500 — предупреждения нет: бюджеты только у девятки`, r.out);
ok((r.out.match(/lines against its budget/g) || []).length === 2, 's16 ровно два предупреждения — по одному на раздутый документ ядра', r.out);

if (failures) { console.error(`\n❌ s16: ${failures} failure(s)`); process.exit(1); }
console.log('\n✅ s16 doc-budgets: all green');
