// s13-requirements-lint.mjs — песочница опционального линтера требований (2.2, эпик N, фаза N1;
// REQUIREMENTS_FRAMEWORK.md § «The stop-word dictionary», план 38 критерий 4):
// стоп-словарь непроверяемых слов КАК СТРАЖ — красный доказан на плохой фикстуре
// («гибкий/удобный/as appropriate/etc.»), зелёный на чистой (измеримые fit-критерии),
// цитаты/❌/код/оправдания легальны по построению, скоуп — секции требований,
// SKIPPED (exit 3) когда сканировать нечего (класс bugs/34).
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

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница requirements-lint зелёная'}`);
process.exit(failures ? 1 : 0);
