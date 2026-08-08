// s06-canon-lint.mjs — песочница опционального линтера канона (план 20 Фаза 5, ideas/15 §2.6):
// запрещённые формулировки, стерегомые полные строки, selftest «страж умеет краснеть».
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('canonlint', process.argv[2]);
mkdirSync(join(ROOT, '.kaif', 'tools'), { recursive: true });
mkdirSync(join(ROOT, 'rules'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-250)));
  if (!cond) failures++;
};
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-canon-lint.mjs')} ${args} 2>&1`, { cwd: ROOT, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-canon-lint.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-canon-lint.mjs'));

// правила: одно отменённое решение (запрещённая формулировка) + одна стерегомая строка
const RULES = {
  forbidden: [{ pattern: 'урон удваивается при крите', files: 'rules/', message: 'решение отменено интервью 004 (тест)', example: 'теперь урон удваивается при крите всегда' }],
  required: [{ line: 'Критический удар добавляет +50 к урону (решение владельца).', file: 'rules/combat.md', message: 'принятое решение о крите (тест)' }],
};
writeFileSync(join(ROOT, '.kaif', 'canon-lint-rules.json'), JSON.stringify(RULES, null, 2) + '\n');
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\n\nКритический удар добавляет +50 к урону (решение владельца).\n');

let r = run('check');
ok(r.code === 0, 's06 check зелёный на здоровом каноне', r.out);
r = run('selftest');
ok(r.code === 0, 's06 selftest зелёный (стражи доказаны)', r.out);

// отменённая формулировка вернулась → красный
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\n\nКритический удар добавляет +50 к урону (решение владельца).\n\nА ещё урон удваивается при крите.\n');
r = run('check');
ok(r.code !== 0 && /forbidden in rules\/combat\.md/.test(r.out), 's06 возврат отменённой формулировки — красный', r.out);

// стерегомая строка потеряна → красный
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\n\nКрит теперь по-другому.\n');
r = run('check');
ok(r.code !== 0 && /guarded line MISSING/.test(r.out), 's06 потеря стерегомой строки — красный', r.out);

// selftest ловит слепого стража: короткая строка и паттерн, не матчащий свой пример
const BAD = { forbidden: [{ pattern: 'x{40}', files: 'rules/', message: 'слепой', example: 'этот пример паттерну не соответствует' }],
              required: [{ line: '= 50', file: 'rules/combat.md', message: 'короткое вхождение' }] };
writeFileSync(join(ROOT, '.kaif', 'canon-lint-rules.json'), JSON.stringify(BAD, null, 2) + '\n');
r = run('selftest');
ok(r.code !== 0 && /too short/.test(r.out) && /does NOT match its own example/.test(r.out),
   's06 selftest ловит слепых стражей (короткая строка + несрабатывающий паттерн)', r.out);

// CRLF-чекаут (git autocrlf на Windows — задокументированный профиль проекта, EXP-0005/0007):
// стерегомая строка НЕ теряется ложно, а якорённый ($) запрет НЕ зеленеет ложно
const CRLF_RULES = {
  forbidden: [{ pattern: 'урон удваивается при крите$', files: 'rules/', message: 'отменено (тест, якорь $)', example: 'урон удваивается при крите' }],
  required: [{ line: 'Критический удар добавляет +50 к урону (решение владельца).', file: 'rules/combat.md', message: 'принятое решение (тест)' }],
};
writeFileSync(join(ROOT, '.kaif', 'canon-lint-rules.json'), JSON.stringify(CRLF_RULES, null, 2) + '\n');
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\r\n\r\nКритический удар добавляет +50 к урону (решение владельца).\r\n');
r = run('check');
ok(r.code === 0, 's06 CRLF: стерегомая строка найдена (ложного MISSING нет)', r.out);
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\r\n\r\nКритический удар добавляет +50 к урону (решение владельца).\r\nА теперь урон удваивается при крите\r\n');
r = run('check');
ok(r.code !== 0 && /forbidden/.test(r.out), 's06 CRLF: якорённый ($) запрет срабатывает и с \\r (ложного зелёного нет)', r.out);

// BOM (PS5.1 Out-File): стерегомая строка первой строкой BOM-файла находится
writeFileSync(join(ROOT, 'rules', 'combat.md'), '﻿Критический удар добавляет +50 к урону (решение владельца).\n');
r = run('check');
ok(r.code === 0, 's06 BOM-файл: стерегомая строка первой строкой находится', r.out);

// невалидный regex в правиле — внятный красный, не сырой стек-трейс
writeFileSync(join(ROOT, '.kaif', 'canon-lint-rules.json'), JSON.stringify({
  forbidden: [{ pattern: '(', message: 'битый паттерн (тест)' }] }, null, 2) + '\n');
r = run('check');
ok(r.code !== 0 && /invalid regex/.test(r.out) && !/at new RegExp/.test(r.out),
   's06 невалидный паттерн — внятная ошибка, не стек-трейс', r.out);

// страж, указывающий в НИКУДА, не может сработать — selftest обязан краснеть на required-правиле
// с отсутствующим файлом (находка судьи L3: раньше молча пропускался вопреки собственному
// обещанию «every required line is verified findable»; check-половина пары краснела и до фикса)
writeFileSync(join(ROOT, '.kaif', 'canon-lint-rules.json'), JSON.stringify({
  required: [{ line: 'эта стерегомая строка достаточно длинная', file: 'canon/absent-file.md', message: 'тест' }] }, null, 2) + '\n');
r = run('selftest');
ok(r.code !== 0 && /required-line file missing/.test(r.out),
   's06 selftest КРАСЕН на правиле с отсутствующим файлом (судья L3)', r.out);

// «не сконфигурирован» ≠ «проверено и зелено» (bugs/34, фаза L3 2.2 — ПЕРЕСМОТР компромисса
// bug 30.2 по полевой цене: три проекта независимо получили «вечнозелёный гейт» — exit 0 без
// конфигурации читался как успех в CI). Новая семантика: SKIPPED с отдельным кодом 3 —
// «ничего не доказано»; exit 1 остаётся настоящим провалом стража, exit 0 — прогнанным правилам.
rmSync(join(ROOT, '.kaif', 'canon-lint-rules.json'));
r = run('selftest');
ok(r.code === 3 && /SKIPPED/.test(r.out), 's06 без rules-файла — SKIPPED с кодом 3, не зелёный ноль (bugs/34)', r.out);
r = run('check');
ok(r.code === 3 && /SKIPPED/.test(r.out), 's06 check без rules-файла — тот же SKIPPED/3', r.out);

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница canon-lint зелёная'}`);
process.exit(failures ? 1 : 0);
