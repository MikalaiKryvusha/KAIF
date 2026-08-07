// s13-requirements-lint.mjs — песочница линтера требований (2.2, эпик N; payload-модуль —
// фаза N1, план 38 критерий 4; обвязочная композиция — фаза N5, план 55 критерии 1–3):
// стоп-словарь непроверяемых слов КАК СТРАЖ — красный доказан на плохой фикстуре
// («гибкий/удобный/as appropriate/etc.»), зелёный на чистой (измеримые fit-критерии),
// цитаты/❌/код/оправдания легальны по построению (включая ПОЛОВИНКИ многострочных
// «…»-цитат — bugs/48), скоуп — секции требований, SKIPPED (exit 3) когда сканировать
// нечего (класс bugs/34). Обвязочная половина (N5): tools/doc-header-lint.mjs — селфтест с
// предсказанными находками, блок «Вектор цели»/«Критерии приёмки» нормо-эпохи через --root,
// консультативная формулировка в выводе (антипаттерн DoR — критерий эпика 7).
import { writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-reqlint'));
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(ROOT, '.kaif', 'tools'), { recursive: true });
mkdirSync(join(ROOT, 'plans'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-250)));
  if (!cond) failures++;
};
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-requirements-lint.mjs')} ${args} 2>&1`, { cwd: ROOT, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-requirements-lint.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-requirements-lint.mjs'));

// --- selftest: каждый класс словаря обязан матчить свой ❌-пример (RU и EN) и молчать на чистых
let r = run('selftest');
ok(r.code === 0 && /selftest OK/.test(r.out), 's13 selftest — 6 классов матчят свои ❌ и молчат на чистых ✅', r.out);

// --- КРАСНЫЙ ДОКАЗАН: плохой план — стоп-слова четырёх классов в секции критериев приёмки
writeFileSync(join(ROOT, 'plans', '01_bad.md'), `# План 01 — тест

## Готово, когда (критерии приёмки)

1. Интерфейс удобный и гибкий.
2. Система должна работать быстро; настройки применяются as appropriate.
3. Форма содержит имя, email и т.д.
4. Формат экспорта уточняется.
`);
r = run('check');
ok(r.code === 1, 's13 плохая фикстура — линтер КРАСНЫЙ (exit 1)', r.out);
// одна находка НА КЛАСС на строку (строку переписывают один раз) — потому стережём по одному
// слову РАЗНЫХ классов, а не оба слова одного класса с одной строки
ok(/удобн/i.test(r.out) && /быстр/i.test(r.out), 's13 плохая — perception и unbounded находки названы', r.out);
ok(/as appropriate/.test(r.out) && /и т\.\s?д\./.test(r.out) && /уточняется/.test(r.out),
  's13 плохая — escape/open-ended/placeholder найдены', r.out);

// --- ЗЕЛЁНЫЙ НА ЧИСТОЙ: те же секции, но fit-критерии измеримы (Scale/Meter/Target)
writeFileSync(join(ROOT, 'plans', '01_bad.md'), `# План 01 — тест

## Готово, когда (критерии приёмки)

1. Время отклика поиска — не более 200 мс при нагрузке до 500 RPS.
2. Покупка оформляется не более чем за 3 клика от корзины.
`);
r = run('check');
ok(r.code === 0 && /0 findings/.test(r.out), 's13 чистая фикстура — зелёный (exit 0, 0 находок)', r.out);

// --- ЛЕГАЛЬНОСТЬ ПО ПОСТРОЕНИЮ: цитаты, ❌-примеры, код, «…», (оправдано: …) не флагуются
writeFileSync(join(ROOT, 'plans', '02_legal.md'), `# План 02 — легальные упоминания

## Критерии приёмки

> В цитате: система должна быть удобной.

- ❌ Плохо: интерфейс должен быть гибким.
- Строка про «удобный и быстрый» словарь стоп-слов.
- Ключ \`flexible\` в конфиге переименован.
- Достаточно 3 ретраев (оправдано: потолок задан политикой рестартов G4).
`);
r = run('check');
ok(r.code === 0, 's13 легальные формы — цитата/❌/«…»/код-спан/(оправдано:) не флагуются', r.out);

// --- МНОГОСТРОЧНАЯ «…»-ЦИТАТА: половинки кавычек (открытие и закрытие на РАЗНЫХ строках)
// легальны, как и однострочная пара, — цитата владельца не есть требование (bugs/48: ложные
// срабатывания N5 на живых plans/34:35 и plans/53:10, где «…» переносится через строку)
writeFileSync(join(ROOT, 'plans', '03_multiline_quote.md'), `# План 03 — многострочная цитата

## Критерии приёмки

Слово владельца дословно: «пусть будет гибкий
и удобный инструмент, работает быстро» — вкус-вердикт, фиксируем дословно.

1. Время открытия страницы — не более 800 мс на референс-ноутбуке.
`);
r = run('check');
ok(r.code === 0, 's13 многострочная «…»-цитата — половинки кавычек легальны (exit 0)', r.out);
rmSync(join(ROOT, 'plans', '03_multiline_quote.md'), { force: true });

// --- СКОУП: стоп-слово ВНЕ секции требований молчит по дефолту, ловится с --all
writeFileSync(join(ROOT, 'plans', '02_legal.md'), `# План 02 — скоуп

Вводная проза: хотим удобный и быстрый инструмент.

## Критерии приёмки

1. Сборка проходит за ≤ 60 с на референс-машине CI.
`);
r = run('check');
ok(r.code === 0, 's13 скоуп — смелл в прозе ВНЕ секции требований по дефолту не флагуется', r.out);
r = run('check --all');
ok(r.code === 1 && /удобн/i.test(r.out), 's13 скоуп — тот же смелл виден с --all (exit 1)', r.out);

// --- SKIPPED: сканировать нечего → exit 3, не зелёный ноль (класс bugs/34)
rmSync(join(ROOT, 'plans'), { recursive: true, force: true });
r = run('check');
ok(r.code === 3 && /SKIPPED/.test(r.out), 's13 пустая песочница — SKIPPED с кодом 3, не зелёный ноль (bugs/34)', r.out);

// ═══ Обвязочная половина (N5, план 55): tools/doc-header-lint.mjs — линтер целевых документов ═══
const WRAPPER_LINT = join(REPO, 'tools', 'doc-header-lint.mjs');
const runWrapper = (args) => {
  try { return { code: 0, out: execSync(`node ${WRAPPER_LINT} ${args} 2>&1`, { stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};

// --- селфтест обвязочного линтера: красный доказан предсказанными находками (шапка + блок
// вектора + bugs-диалект Fix accepted when) и композиция со словарём находит стоп-слово
r = runWrapper('--selftest');
ok(r.code === 0 && /selftest: ok — 12 предсказанных/.test(r.out) && /композиция со словарём находит стоп-слово/.test(r.out),
  's13 обвязочный линтер — селфтест: 12 предсказанных находок + композиция со словарём', r.out);

// --- нормо-эпохный план БЕЗ блока: красный, обе находки названы, вывод КОНСУЛЬТИРУЕТ
const FX2 = join(ROOT, 'wrapper-fx');
mkdirSync(join(FX2, 'plans'), { recursive: true });
const FX2_HEADER = '> **Создан:** 2026-08-07. **Родитель:** `plans/30`. **Статус:** в работе. **Вовне:** —.\n';
writeFileSync(join(FX2, 'plans', '30_probe.md'), '# План 30 — без блока требований\n\n' + FX2_HEADER + '\nтело\n');
r = runWrapper(`--root ${FX2}`);
ok(r.code === 1 && /нет блока «Вектор цели»/.test(r.out) && /нет блока «Критерии приёмки»/.test(r.out),
  's13 обвязочный — нормо-эпохный план без блока: красный, обе находки названы', r.out);
ok(/консультативно: поправь или оправдай на месте, старт работы не блокируется/.test(r.out),
  's13 обвязочный — вывод консультирует, антипаттерн DoR-шлюза не воспроизводится (критерий эпика 7)', r.out);

// --- тот же план С блоком и измеримыми критериями: зелёный целиком (exit 0)
writeFileSync(join(FX2, 'plans', '30_probe.md'), '# План 30 — с блоком требований\n\n' + FX2_HEADER +
  '\n## Вектор цели\n\nДостичь X, наблюдаемого прогоном Y (Achieve).\n' +
  '\n## Критерии приёмки (готово, когда)\n\n1. Сборка проходит за ≤ 60 с на референс-машине CI.\n');
r = runWrapper(`--root ${FX2}`);
ok(r.code === 0 && /findings 0 — all headers green/.test(r.out) && /0 findings/.test(r.out),
  's13 обвязочный — блок присутствует, словарь чист: зелёный целиком (exit 0)', r.out);

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница requirements-lint зелёная (payload-модуль + обвязочный линтер)'}`);
process.exit(failures ? 1 : 0);
