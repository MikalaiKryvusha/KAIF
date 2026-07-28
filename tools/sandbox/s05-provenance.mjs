// s05-provenance.mjs — песочница опционального модуля kaif-provenance (план 20 Фаза 5,
// решение владельца №19). Проверяет grep-гейт: парность пометок, «пометки живут только в
// объявленных канон-артефактах», report, accept с реестром; красные исходы доказаны.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-provenance'));
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(ROOT, '.kaif', 'tools'), { recursive: true });
mkdirSync(join(ROOT, 'rules'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-250)));
  if (!cond) failures++;
};
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-provenance.mjs')} ${args} 2>&1`, { cwd: ROOT, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};

cpSync(join(REPO, 'framework', 'tools', 'kaif-provenance.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-provenance.mjs'));
writeFileSync(join(ROOT, '.kaif', 'kaif.json'), JSON.stringify({
  framework: 'KAIF', version: '2.0', tracking: 'origin', canonArtifacts: ['rules/'] }, null, 2) + '\n');

// 1) чистое состояние: канон с корректной парой — check зелёный, report видит блок
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\n\nТекст владельца.\n\n[AI]\nНовая механика от ИИ — ждёт приёмки.\n[/AI]\n\nЕщё текст владельца.\n');
let r = run('check');
ok(r.code === 0, 's05 check зелёный на корректных пометках', r.out);
r = run('report');
ok(r.code === 0 && r.out.includes('rules/combat.md') && r.out.includes('1 block'),
   's05 report видит блок, ждущий приёмки', r.out);

// 2) пометка ВНЕ объявленного канона → красный
writeFileSync(join(ROOT, 'notes.md'), '[AI]\nмаркировать всё подряд нельзя\n[/AI]\n');
r = run('check');
ok(r.code !== 0 && /NOT a declared canon artifact/.test(r.out),
   's05 пометка вне канона — гейт красный (агенты не метят всё подряд)', r.out);
rmSync(join(ROOT, 'notes.md'));

// 3) непарная пометка → красный с внятной строкой
writeFileSync(join(ROOT, 'rules', 'broken.md'), '[AI]\nоткрыто и не закрыто\n');
r = run('check');
ok(r.code !== 0 && /never closed/.test(r.out), 's05 незакрытая пометка — красный', r.out);
writeFileSync(join(ROOT, 'rules', 'broken.md'), 'x\n[/AI-ed]\n');
r = run('check');
ok(r.code !== 0 && /stray/.test(r.out), 's05 закрытие без открытия — красный', r.out);
rmSync(join(ROOT, 'rules', 'broken.md'));

// 4) accept: реестр пополнен, пометки сняты, файл цел по содержанию
r = run('accept rules/combat.md');
ok(r.code === 0 && /accepted 1 block/.test(r.out), 's05 accept отработал', r.out);
const combat = readFileSync(join(ROOT, 'rules', 'combat.md'), 'utf8');
ok(!combat.includes('[AI]') && combat.includes('Новая механика от ИИ'),
   's05 пометки сняты, СОДЕРЖИМОЕ блока сохранено');
const reg = JSON.parse(readFileSync(join(ROOT, '.kaif', 'provenance-accepted.json'), 'utf8'));
ok(reg.accepted.length === 1 && reg.accepted[0].file === 'rules/combat.md' && reg.accepted[0].sha,
   's05 реестр принятых: файл, дата, sha блока');
r = run('check');
ok(r.code === 0, 's05 после приёмки гейт снова зелёный');
// accept без пометок → честный отказ
r = run('accept rules/combat.md');
ok(r.code !== 0 && /nothing to accept/.test(r.out), 's05 повторный accept — честный отказ');

// 5) [AI-ed] не путается с [AI] (longest-match)
writeFileSync(join(ROOT, 'rules', 'edited.md'), '[AI-ed]\nправка ИИ поверх текста владельца\n[/AI-ed]\n');
r = run('check');
ok(r.code === 0, 's05 [AI-ed] парится корректно (не путается с [AI])', r.out);

// 6) развёрнутый комплект KAIF сам цитирует конвенцию (код-спаны и фенсы) — гейт обязан
//    оставаться зелёным из коробки (полевой блокер: check краснел на собственных доках поставки)
writeFileSync(join(ROOT, 'AGENT_GUIDE.md'),
  '# Guide\n\nПометки провенанса — `[AI]…[/AI]` / `[AI-ed]…[/AI-ed]` (канонические строки).\n\n```\n[AI]\nпример в фенсе — не пометка\n[/AI]\n```\n');
writeFileSync(join(ROOT, 'PHILOSOPHY.md'),
  'Всё, что ИИ пишет в канон, несёт пометку (`[AI]…[/AI]`), пока владелец не примет.\n');
r = run('check');
ok(r.code === 0, 's05 доки, цитирующие конвенцию (код-спаны/фенсы), НЕ краснят гейт', r.out);

// 7) две пары на одной строке — обрабатываются по позициям, а не по типам тегов
writeFileSync(join(ROOT, 'rules', 'inline.md'), 'Правка: [AI-ed]новый текст[/AI-ed] и [AI]добавка[/AI].\n');
r = run('check');
ok(r.code === 0, 's05 пары на одной строке парсятся по позициям — зелёный', r.out);
r = run('report');
ok(r.code === 0 && /inline\.md — 2 block/.test(r.out), 's05 report видит обе однострочные пары', r.out);

// 8) accept однострочных пар: путь нормализован, реестр несёт СОДЕРЖИМОЕ, теги сняты чисто
r = run('accept rules\\inline.md');
ok(r.code === 0 && /accepted 2 block/.test(r.out), 's05 accept однострочных пар отработал', r.out);
const reg2 = JSON.parse(readFileSync(join(ROOT, '.kaif', 'provenance-accepted.json'), 'utf8'));
const last2 = reg2.accepted.slice(-2);
ok(last2.every((e) => e.file === 'rules/inline.md'),
   's05 путь в реестре нормализован (rules/inline.md)', JSON.stringify(last2));
ok(last2.some((e) => e.excerpt.includes('новый текст')) && last2.some((e) => e.excerpt.includes('добавка')),
   's05 реестр фиксирует содержимое блоков, а не «[AI]»', JSON.stringify(last2));
ok(readFileSync(join(ROOT, 'rules', 'inline.md'), 'utf8').includes('Правка: новый текст и добавка.'),
   's05 однострочные теги сняты чисто, текст цел');

// 9) без canonArtifacts — только гигиена пар (обещание шапки инструмента), но битая пара красная
writeFileSync(join(ROOT, '.kaif', 'kaif.json'), JSON.stringify({
  framework: 'KAIF', version: '2.0', tracking: 'origin' }, null, 2) + '\n');
r = run('check');
ok(r.code === 0 && /only mark hygiene/.test(r.out), 's05 без canonArtifacts — только гигиена пар, зелёный', r.out);
writeFileSync(join(ROOT, 'rules', 'broken2.md'), '[AI]\nне закрыто\n');
r = run('check');
ok(r.code !== 0 && /never closed/.test(r.out), 's05 без canonArtifacts битая пара всё равно красная', r.out);
rmSync(join(ROOT, 'rules', 'broken2.md'));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница provenance зелёная'}`);
process.exit(failures ? 1 : 0);
