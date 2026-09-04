// s19-scenario-lint.mjs — песочница линтера сценарной формы критериев (2.5, эпик SF, plans/88;
// тикет origin #39). Оба ответа на фикстурах: selftest модуля зелёный (правило N ← ровно сценарий N,
// EN и RU) · плохая фикстура (семь сценариев ×2 языка, по одному правилу на сценарий) → exit 1 с
// именами всех семи правил · чистая фикстура → exit 0 со счётом сценариев · пустая «Check» — ⚠ при
// exit 0 · дерево без сценариев → SKIPPED (exit 3, класс bugs/34: «не сканировано» ≠ «чисто») ·
// шаблон в code-fence и ❌-пример невидимы.
// [TESTED: 2026-09-04 · отдельный прогон — 15 проверок свода ✅ (selftest 33 кейса · плохая 14/14 адресно ·
//  чистая 2 сценария + 1 ⚠ · шаблон и пустое дерево SKIPPED); в составе полигона — см. лог сессии 51]
import { writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('scenariolint', process.argv[2]);
for (const d of ['.kaif/tools', 'bad', 'good', 'empty', 'templ']) mkdirSync(join(ROOT, d), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-scenario-lint.mjs')} ${args} 2>&1`, { cwd: ROOT, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: ROOT, args: args }); }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-scenario-lint.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-scenario-lint.mjs'));

// --- selftest: каждое правило красное ровно на своей мутации и молчит на чистом наборе, EN + RU
let r = run('selftest');
ok(r.code === 0 && /selftest OK/.test(r.out), 's19 selftest — правила доказаны обоими ответами в двух языках', r.out);
ok(/7 rules × 2 languages/.test(r.out), 's19 selftest — семь правил × два языка сосчитаны', r.out);

// --- КРАСНЫЙ ДОКАЗАН: плохая фикстура — семь сценариев EN + семь RU, по одному правилу на сценарий
const RULES = ['order', 'one-action', 'vague-result', 'implementation-leak', 'first-person', 'no-command', 'no-concrete-value'];
writeFileSync(join(ROOT, 'bad', 'criteria.md'), `# Bad criteria

**R1 — order.**
- Situation. The hero has Wisdom 70.
- Action. The player rolls.
- Check. \`node x\` prints \`2\`.

**R2 — one action.**
- Situation. The hero has Wisdom 70.
- Action. The player rolls the chain and then equips the sword.
- Result. Chain length L = 2.
- Check. \`node x\` prints \`2\`.

**R3 — vague.**
- Situation. The hero has Wisdom 70.
- Action. The player rolls the chain.
- Result. The chain is computed correctly.
- Check. \`node x\` prints \`2\`.

**R4 — leak.**
- Situation. The \`players\` array holds 2 objects.
- Action. The player rolls the chain.
- Result. Chain length L = 2.
- Check. \`node x\` prints \`2\`.

**R5 — person.**
- Situation. The hero has Wisdom 70.
- Action. I roll the chain.
- Result. Chain length L = 2.
- Check. \`node x\` prints \`2\`.

**R6 — command.**
- Situation. The hero has Wisdom 70.
- Action. The player rolls the chain.
- Result. Chain length L = 2.
- Check. Verify by hand.

**R7 — value.**
- Situation. The hero has high Wisdom.
- Action. The player rolls the chain.
- Result. Chain length L = 2.
- Check. \`node x\` prints \`2\`.

**П1 — порядок.**
- Ситуация. У героя Мудрость 70.
- Действие. Игрок бросает.
- Проверка. \`node x\` печатает \`2\`.

**П2 — одно действие.**
- Ситуация. У героя Мудрость 70.
- Действие. Игрок бросает цепочку и затем надевает меч.
- Результат. Длина цепочки L = 2.
- Проверка. \`node x\` печатает \`2\`.

**П3 — расплывчато.**
- Ситуация. У героя Мудрость 70.
- Действие. Игрок бросает цепочку.
- Результат. Цепочка считается правильно.
- Проверка. \`node x\` печатает \`2\`.

**П4 — реализация.**
- Ситуация. Массив игроков держит 2 объекта.
- Действие. Игрок бросает цепочку.
- Результат. Длина цепочки L = 2.
- Проверка. \`node x\` печатает \`2\`.

**П5 — лицо.**
- Ситуация. У героя Мудрость 70.
- Действие. Я бросаю цепочку.
- Результат. Длина цепочки L = 2.
- Проверка. \`node x\` печатает \`2\`.

**П6 — команда.**
- Ситуация. У героя Мудрость 70.
- Действие. Игрок бросает цепочку.
- Результат. Длина цепочки L = 2.
- Проверка. Проверить вручную.

**П7 — значение.**
- Ситуация. У героя высокая Мудрость.
- Действие. Игрок бросает цепочку.
- Результат. Длина цепочки L = 2.
- Проверка. \`node x\` печатает \`2\`.
`);
r = run('check bad');
ok(r.code === 1, 's19 плохая фикстура — линтер КРАСНЫЙ (exit 1)', r.out);
ok(/14 finding\(s\) in 14 scenario\(s\)/.test(r.out), 's19 плохая — 14 находок в 14 сценариях (по одной на сценарий, адресно)', r.out);
for (const id of RULES) ok((r.out.match(new RegExp(`— ${id}:`, 'g')) || []).length === 2, `s19 плохая — правило ${id} названо ровно дважды (EN + RU)`, r.out);

// --- ЗЕЛЁНЫЙ: чистая фикстура с двумя сценариями и одной пустой «Check» (⚠, не находка)
writeFileSync(join(ROOT, 'good', 'criteria.md'), `# Good criteria

**R1 — the chain.**
- Situation. The hero has Wisdom 70; the dice fall 17, 31, 62.
- Action. The player rolls the chain link by link.
- Result. Chain length L = 2; the game log shows three rolls: 17, 31, 62.
- Check. \`node tools/chain.mjs --rolls 17,31,62 --wisdom 70\` prints \`2\`.

**П2 — комната (написано владельцем, «Проверка» пустая).**
- Ситуация. В комнате 7 два игрока — «Аня» и «Боб».
- Действие. Аня нажимает «Старт».
- Результат. На доске раунд 1, ход у Ани.
- Проверка.
`);
r = run('check good');
ok(r.code === 0 && /scenario-lint OK — 1 file\(s\), 2 scenario\(s\), 0 findings, 1 warning\(s\)/.test(r.out), 's19 чистая фикстура — линтер ЗЕЛЁНЫЙ, два сценария, одно предупреждение', r.out);
ok(/empty-check/.test(r.out), 's19 чистая — пустая «Проверка» названа предупреждением, не находкой', r.out);

// --- Невидимость: шаблон в code-fence и ❌-пример сценариями не считаются → SKIPPED
writeFileSync(join(ROOT, 'templ', 'template.md'), '# Template\n\n```\n- Situation. <state>\n- Action. <one action>\n- Result. <seen>\n- Check. <command>\n```\n\n❌ Result. Works correctly.\n');
r = run('check templ');
ok(r.code === 3 && /SKIPPED/.test(r.out), 's19 шаблон в code-fence и ❌-пример — невидимы: SKIPPED (exit 3)', r.out);

// --- Дерево без сценариев — SKIPPED (exit 3), не ложный зелёный
r = run('check empty');
ok(r.code === 3 && /SKIPPED/.test(r.out), 's19 дерево без сценариев — SKIPPED (exit 3), не ложный зелёный', r.out);

if (failures) { console.log(`\n❌ s19: ${failures} failure(s)`); process.exit(1); }
console.log('\n✅ s19 scenario-lint: all green');
