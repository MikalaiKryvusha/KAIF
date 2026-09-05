// s23-ranking-lint.mjs — свод эпика WN 2.6 «Свежее слово — не топ приоритета» (plans/94 критерии 2 и 4;
// тикет origin #53: полевой агент процитировал правило «свежая боль — не приоритет» и тем же ответом
// поставил слова владельца дня выше главной фазы и 87 багов; №102). Оба ответа на развёрнутой копии:
// tool-модуль `.kaif/tools/kaif-ranking-lint.mjs` приезжает установкой · `selftest` зелёный и называет
// фикстуру #53 красной · черновик ответа из инцидента #53 (мессенджер первым, `moves: —`, без `METRIC:`)
// → exit 1 с именами правил · исправленный ответ (серия трафика первой, метрика и фаза, полка, строка
// долга) → exit 0 · документ без ответа `/what-next` → SKIPPED (exit 3, класс bugs/34: «не сканировано» ≠
// «чисто») · `update` с «9.9» привозит модуль и мета бандла несёт записи 2.6 о `/what-next` без «спросите
// владельца». Красный доказан на мутациях селфтеста (правило N ← ровно ответ N) и на фикстуре #53.
// [TESTED: 2026-09-05 · стоя — все проверки зелёные (установка · selftest · #53 → exit 1 с пятью находками · исправленный → 0 ·
//  чужой → SKIPPED 3 · usage · мета бандла 2.6); красный наблюдён ДО правки сборки: 13 проверок красные при отсутствующем
//  модуле (сборка упала на апострофе в записи 2.6 — модуль не доехал); в составе полигона — см. STATUS сессии 56]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { must, coreRunner, failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const ROOT = tempRoot('rankinglint', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const run = coreRunner(ROOT);
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const runLint = (cwd, args) => {
  try { return { code: 0, out: execFileSync(process.execPath, [join(cwd, '.kaif', 'tools', 'kaif-ranking-lint.mjs'), ...args], { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args: 'ranking-lint ' + args.join(' ') }); }
};
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  writeFileSync(join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md')));
  writeFileSync(join(dir, '.kaif', 'kaif-core.mjs'), readFileSync(join(DIST, 'KAIF-CORE.mjs')));
};

// ---------------------------------------------------------------- A: свежая установка привозит модуль
console.log('\n=== s23 A: свежая установка → .kaif/tools/kaif-ranking-lint.mjs на месте, selftest зелёный ===');
const P = join(ROOT, 'fresh'); seed(P);
must(run, P, 'install --lang ru');
const MOD = join(P, '.kaif', 'tools', 'kaif-ranking-lint.mjs');
ok(existsSync(MOD), 's23 A: модуль приехал установкой');
let r = runLint(P, ['selftest']);
ok(r.code === 0 && /selftest OK/.test(r.out), 's23 A: selftest зелёный', r.out);
ok(/#53 fixture[^\n]*RED/.test(r.out) && /7 rules × 2 languages/.test(r.out), 's23 A: selftest называет фикстуру #53 красной и семь правил × два языка', r.out);

// ---------------------------------------------------------------- B: черновик из инцидента #53 → exit 1; исправленный → 0; чужой → 3
console.log('\n=== s23 B: черновик #53 красный, исправленный зелёный, чужой документ SKIPPED ===');
mkdirSync(join(P, 'drafts'), { recursive: true });
writeFileSync(join(P, 'drafts', 'what-next-53.md'), [
  '# Что дальше — черновик из инцидента #53', '',
  '| шаг | moves | closes | трудоёмкость |', '|---|---|---|---|',
  '| 1. MVP мессенджера (владелец сказал сегодня) | — | — | 2 чата |',
  '| 2. Перепись условий (владелец сказал вчера) | — | — | 1 чат |',
  '| 3. Серия трафика: индексация каталога | complete +1 | bugs/12 | 0,5 чата |', '',
].join('\n'));
r = runLint(P, ['check', 'drafts/what-next-53.md']);
ok(r.code === 1, 's23 B: черновик #53 → exit 1', 'exit ' + r.code + ': ' + r.out.slice(-300));
for (const id of ['no-metric', 'no-main-phase', 'recency-first', 'no-shelf', 'no-debt'])
  ok(new RegExp('— ' + id + ':').test(r.out), 's23 B: находка «' + id + '» названа', r.out.slice(-400));
writeFileSync(join(P, 'drafts', 'what-next-fixed.md'), [
  '# Что дальше', '',
  'METRIC: DELIVERY: systems 9 · complete 86 % (31 of 36) · integrated 100 % (7 of 7) · holes 0 · contradictions 0 · bugs 23 (2026-09-05)',
  'MAIN PHASE: Фаза 2 — Охват (v2) — пометки «ГЛАВНОЕ СЕЙЧАС» нет, взята первая незакрытая фаза MASTER_PLAN.md', '',
  '| шаг | moves | closes | трудоёмкость |', '|---|---|---|---|',
  '| 1. Серия трафика: индексация каталога | complete +1 (Каталог) | bugs/12 | 0,5 чата |',
  '| 2. Верификация Яндекса | integrated +1 | — | 0,25 чата |',
  '| 3. Каталог: пустые карточки | — | bugs/30 | 0,5 чата |', '',
  'Свежие слова владельца — не ранжированы метрикой (→ /fix-vision): «MVP мессенджера» (сегодня), «перепись условий» (вчера).',
  'Техдолг: открытых багов 87 · красных 30 · разъехавшихся пар 0.', '',
].join('\n'));
r = runLint(P, ['check', 'drafts/what-next-fixed.md']);
ok(r.code === 0 && /ranking-lint OK/.test(r.out), 's23 B: исправленный ответ → exit 0', r.out.slice(-300));
writeFileSync(join(P, 'drafts', 'plan.md'), '# План\n\nПроза без ответа /what-next.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n');
r = runLint(P, ['check', 'drafts/plan.md']);
ok(r.code === 3 && /SKIPPED/.test(r.out), 's23 B: документ без ответа → SKIPPED (exit 3), не «чисто»', 'exit ' + r.code + ': ' + r.out.slice(-200));
r = runLint(P, ['check']);
ok(r.code === 1 && /usage/.test(r.out), 's23 B: check без путей — usage, exit 1 (посторонний вызов не молчит)', r.out.slice(-200));

// ---------------------------------------------------------------- C: мета бандла — записи 2.6 о /what-next без «спросите владельца»
console.log('\n=== s23 C: мета бандла несёт policy-change/notes 2.6 о форме /what-next и линте ===');
const bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
const metaStart = bundle.indexOf('\n{\n'), metaEnd = bundle.indexOf('\n}\n', metaStart);
let meta = null;
try { meta = JSON.parse(bundle.slice(metaStart + 1, metaEnd + 2)); } catch { /* судится ниже */ }
ok(meta !== null, 's23 C: мета-блок бандла читается как JSON');
const pol26 = meta && meta.policyChanges && meta.policyChanges['2.6'] ? meta.policyChanges['2.6'].join('\n') : '';
const tn26 = meta && meta.templateNotesByVersion && meta.templateNotesByVersion['2.6'] ? meta.templateNotesByVersion['2.6'].join('\n') : '';
ok(/what-next/.test(pol26) && /METRIC:/.test(pol26) && /kaif-ranking-lint/.test(pol26), 's23 C: policy-change 2.6 называет /what-next, METRIC: и линт', pol26.slice(0, 300));
ok(/kaif-ranking-lint/.test(tn26), 's23 C: template-notes 2.6 называют модуль', tn26.slice(0, 200));
ok(!/ask the (project )?owner/i.test(pol26 + tn26) || /never ask/i.test(pol26 + tn26), 's23 C: записи не велят «спросить владельца»');

if (failures) { console.error(`s23: ${failures} checks FAILED · корень ${ROOT}`); process.exit(1); }
console.log('s23 ranking lint: all checks green (install · selftest · #53 red · fixed green · SKIPPED · bundle meta 2.6)');
