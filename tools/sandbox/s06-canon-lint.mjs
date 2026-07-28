// s06-canon-lint.mjs — песочница опционального линтера канона (план 20 Фаза 5, ideas/15 §2.6):
// запрещённые формулировки, стерегомые полные строки, selftest «страж умеет краснеть».
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-canonlint'));
rmSync(ROOT, { recursive: true, force: true });
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

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница canon-lint зелёная'}`);
process.exit(failures ? 1 : 0);
