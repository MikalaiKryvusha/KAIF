// s11-l5-remaining.mjs — свод фазы L5 эпика L 2.2 (план 44): «остальные запросы + судья».
// Баг-доки: bugs/40 (задание лжёт адресами плейсхолдеров и молчит про сферы/локальные
// валидаторы), bugs/41 (имя проекта из каталога, а не из канона — «klas» в заголовках),
// bugs/42 (ложная метка маршрута legacy-bootstrap при живом манифесте), bugs/44 (языковые
// пакеты неполны молча — решение №44: честная печать + страж протухания; сам страж живёт в
// tools/check-framework.mjs и доказывается на temp-копии репо, не этим сводом).
//
// ⚠️ Дисциплина стражей (EXP-0016/0017): свод написан ДО фиксов и обязан быть КРАСНЫМ на
// текущем dist ровно в помеченных стражах. Предсказания до первого прогона (2026-08-07):
//   T1 КРАСНЫЙ — пункт placeholders задания адаптации не несёт НИ ОДНОГО реального пути
//      (статический текст «grep each»); после фикса — «слот → реальные файлы на диске»,
//      каждый названный файл существует и буквально несёт слот; чужие сферы НЕ названы.
//   T1b КРАСНЫЙ — пункт placeholders задания ОБНОВЛЕНИЯ шлёт «в .claude/skills/ copy», хотя
//      единственный живой слот лежит в ОБЪЯВЛЕННОЙ сфере (KCam суд.2: .kaif/spheres/
//      programming.md); после фикса пункт называет файл сферы.
//   T2 КРАСНЫЙ — локальная сфера + изменившийся шаблон сферы: пункта sphere-sync нет
//      (Unlim §3.2: секции 2.1 не доехали до game-design молча); после фикса пункт называет
//      локальную сферу и _template.md.
//   T3 КРАСНЫЙ — состав скиллов изменился в интервале: пункта local-inventories нет
//      (Unlim §4.8: локальный валидатор «знал 12 документов и 26 скиллов» — второй случай);
//      после фикса пункт называет добавленный скилл и машиночитаемый инвентарь
//      (deploy-manifest → paths — закрывает и NDim N6).
//   T4 КРАСНЫЙ — <PROJECT_NAME> из package.json («klas») без пункта project-name, команды
//      project-name нет, чекпоинт неизвестен; после фикса: пункт в задании, команда пишет
//      canonical в маркер + ЛЕЧИТ карту values манифеста, чекпоинт-гейт отказывает до записи,
//      обновление заполняет заголовки канонной формой («KLAS» в строке идентичности).
//   T5 КРАСНЫЙ — bootstrap при ЖИВОМ манифесте пишет route: 'legacy-bootstrap' (NDim гр.6);
//      после фикса — 'bootstrap' (и в квитанции, и в history), classified: true.
//   T5b ИНВАРИАНТ (зелёный и до, и после) — синтетический baseline честно остаётся
//      'legacy-bootstrap'.
//   T6 КРАСНЫЙ — install --lang ru молчит о границе пакета; после фикса печатает честную
//      неполноту (список EN-документов + все тела скиллов; решение №44, формулировка KLAS §4.7).
//   T7 КРАСНЫЙ — обновление не делает backup-копий (KLAS D13); после фикса
//      .kaif/backup-<from>-<to>/ несёт ДО-апдейтные копии (PHILOSOPHY без апстримной строки),
//      .gitignore прикрывает backup-директории (ignore-first).
//   T8 КРАСНЫЙ — merge-пункты задания не предупреждают, что чек-листы могут нести строки
//      владельца; после фикса предупреждение в тексте merge-diverged/merge-modules.
// Инварианты (зелёные и до, и после): en-install не печатает строку пакета; при полностью
// заполненном дереве пункта placeholders нет; shipped-сфера без изменений шаблона не рождает
// sphere-sync; неизменный состав скиллов не рождает local-inventories.
//
// В tools/sandbox-suite.mjs свод вписывается ВМЕСТЕ с фиксами, когда зеленеет.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, readdirSync, unlinkSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
const CUR = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-l5-remaining'));
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const seed = (dir, srcDir = DIST) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  cpSync(join(srcDir, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(srcDir, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const FENCE = '`'.repeat(6);
function editBundleModule(bundleText, filePath, moduleIndex, mutate) {
  const re = new RegExp('(^> \\*\\*FILE: `' + filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
  const m = bundleText.match(re);
  if (!m) throw new Error('block not found: ' + filePath);
  const mods = splitModules(m[2] + '\n');
  mutate(mods[moduleIndex]);
  return bundleText.replace(re, m[1] + joinModules(mods).replace(/\n$/, '') + m[3]);
}
// Общий «релиз 9.9»: правка static-модуля PHILOSOPHY.md (как в s04) + бамп версии в мете и манифесте.
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (l5-remaining)'));
const bundlePatched = bundle.replace(`"version": "${CUR}"`, '"version": "9.9"');
if (bundlePatched === bundle) throw new Error('bundle meta version patch was a NO-OP');
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundlePatched);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');

const PH = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>', '<LICENSE>',
  '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  "<YOUR AGENT'S noreply EMAIL>", '<OWNER_LANGUAGE>'];
const fill = (p) => { if (!existsSync(p)) return; let t = readFileSync(p, 'utf8'); for (const ph of PH) t = t.split(ph).join('X'); writeFileSync(p, t); };
const fillCanon = (dir, { spheres = false } = {}) => {
  fill(join(dir, 'AGENT_GUIDE.md'));
  if (existsSync(join(dir, '.claude', 'skills'))) for (const n of readdirSync(join(dir, '.claude', 'skills')))
    fill(join(dir, '.claude', 'skills', n, 'SKILL.md'));
  if (spheres && existsSync(join(dir, '.kaif', 'spheres'))) for (const n of readdirSync(join(dir, '.kaif', 'spheres')))
    if (n.endsWith('.md')) fill(join(dir, '.kaif', 'spheres', n));
};
// Вынуть текст пункта задания по id (однострочный item в списке «- **id** — …»)
const taskItem = (dir, file, id) => {
  const t = readFileSync(join(dir, file), 'utf8');
  const m = t.match(new RegExp('^- \\*\\*' + id + '\\*\\* — ([\\s\\S]*?)(?=\\n- \\*\\*|\\n\\n)', 'm'));
  return m ? m[1] : null;
};
const readReceipt = (dir) => JSON.parse(readFileSync(join(dir, '.kaif', 'last-update.json'), 'utf8'));
const readMarker = (dir) => JSON.parse(readFileSync(join(dir, '.kaif', 'kaif.json'), 'utf8'));

// ══════════════════ T1: свежая установка — адреса плейсхолдеров реальны ══════════════════
console.log('\n=== T1: пункт placeholders задания адаптации — реальные пути, чужие сферы вне списка ===');
const T1 = join(ROOT, 't1'); mkdirSync(T1); seed(T1);
let r = run(T1, 'install');
ok(r.code === 0, 'T1 install exit 0', r.out);
const t1item = taskItem(T1, 'KAIF_ADAPTATION_TASK.md', 'placeholders');
ok(!!t1item, 'T1 пункт placeholders существует (слоты BUILD/TEST/REPO не заполнены — нет package.json/remote)');
// 🔴 КРАСНЫЙ ДО ФИКСА: пункт не называет ни одного реального пути
const t1paths = t1item ? [...t1item.matchAll(/(?:\.claude\/skills\/[\w-]+\/SKILL\.md|AGENT_GUIDE\.md|\.kaif\/spheres\/[\w-]+\.md)/g)].map((m) => m[0]) : [];
ok(t1paths.length > 0, '🔴 T1 пункт называет РЕАЛЬНЫЕ пути слотов (а не «grep each» без адресов)', t1item || '(нет пункта)');
let t1real = t1paths.length > 0;
for (const p of new Set(t1paths)) {
  if (!existsSync(join(T1, p))) { t1real = false; ok(false, `T1 названный путь существует: ${p}`); }
}
ok(t1real, 'T1 каждый названный путь существует на диске');
ok(!t1paths.some((p) => p.startsWith('.kaif/spheres/')), 'T1 чужие сферы (сфера не объявлена) НЕ названы в адресах');
ok(!r.out.includes('INCOMPLETE BY DESIGN'), 'T1 инвариант: en-установка не печатает строку неполноты пакета');

// ══════════════════ T1b/T7/T8: обновление — слот в объявленной сфере; backup; чек-листы ══════════════════
console.log('\n=== T1b/T7/T8: update — адрес в объявленной сфере · backup-дерево · предупреждение про чек-листы ===');
const U1 = join(ROOT, 'u1'); mkdirSync(U1); seed(U1);
r = run(U1, 'install');
ok(r.code === 0, 'U1 install exit 0', r.out);
fillCanon(U1);                                     // канон и скиллы заполнены; сферы — нет
run(U1, 'sphere programming');                     // объявленная сфера несёт литеральный <BUILD_COMMAND>
unlinkSync(join(U1, 'KAIF_ADAPTATION_TASK.md'));   // адаптация «завершена» — задание не мешает update
// Диверженция для merge-пункта — в ТОМ ЖЕ модуле PHILOSOPHY, который меняет 9.9 (индекс 2):
// правка чужого модуля или файла с неизменным шаблоном пункта не рождает по построению
// (bugs/32 «ноль дельты = ноль пунктов» + помодульная семантика plan 21).
{ const pPhil = join(U1, 'PHILOSOPHY.md');
  const mods = splitModules(readFileSync(pPhil, 'utf8').replace(/\r\n/g, '\n'));
  mods[2].lines.push('', 'OWNER LOCAL EDIT (u1) — конфликт в модуле апстрима');
  writeFileSync(pPhil, joinModules(mods)); }
r = run(U1, `update --source ${SRC}`);
ok(r.code === 0, 'U1 update → 9.9 exit 0', r.out);
const u1ph = taskItem(U1, 'KAIF_UPDATE_TASK.md', 'placeholders');
ok(!!u1ph, 'U1 пункт placeholders существует (живой слот в объявленной сфере)');
// 🔴 КРАСНЫЙ ДО ФИКСА: пункт шлёт в .claude/skills/, а слот живёт в .kaif/spheres/programming.md
ok(!!u1ph && u1ph.includes('.kaif/spheres/programming.md'),
   '🔴 T1b пункт называет РЕАЛЬНЫЙ адрес слота — файл объявленной сферы (KCam суд.2)', u1ph || '(нет пункта)');
// 🔴 T7: backup-дерево до правок (KLAS D13)
const bak = join(U1, '.kaif', `backup-${CUR}-9.9`);
ok(existsSync(bak), '🔴 T7 .kaif/backup-<from>-<to>/ существует после update');
ok(existsSync(join(bak, 'PHILOSOPHY.md')) && !readFileSync(join(bak, 'PHILOSOPHY.md'), 'utf8').includes('UPSTREAM ADDITION 9.9')
   && readFileSync(join(bak, 'PHILOSOPHY.md'), 'utf8').includes('OWNER LOCAL EDIT (u1)'),
   '🔴 T7 backup несёт ДО-апдейтную копию (правка владельца есть, апстримной строки нет)');
// конфликтный модуль ХРАНИТСЯ на диске (правка владельца жива), апстримная строка едет ДИФФОМ в задании
ok(readFileSync(join(U1, 'PHILOSOPHY.md'), 'utf8').includes('OWNER LOCAL EDIT (u1)'),
   'T7 контроль: правка владельца пережила update (конфликтный модуль не перезаписан)');
ok(readFileSync(join(U1, 'KAIF_UPDATE_TASK.md'), 'utf8').includes('+ UPSTREAM ADDITION 9.9'),
   'T7 контроль: апстримная строка доставлена диффом в задании');
ok(existsSync(join(U1, '.gitignore')) && readFileSync(join(U1, '.gitignore'), 'utf8').includes('.kaif/backup-'),
   '🔴 T7 .gitignore прикрывает backup-директории (ignore-first)');
// 🔴 T8: предупреждение про строки владельца в чек-листах — правка хвоста файла легла в
// последний модуль, поэтому фикстура рождает merge-modules; предупреждение обязано жить на
// ОБОИХ merge-пунктах — читаем тот, что есть.
const u1md = taskItem(U1, 'KAIF_UPDATE_TASK.md', 'merge-modules') || taskItem(U1, 'KAIF_UPDATE_TASK.md', 'merge-diverged');
ok(!!u1md && /checklist/i.test(u1md) && /OWNER/i.test(u1md),
   '🔴 T8 merge-пункт предупреждает: чек-листы могут нести строки ВЛАДЕЛЬЦА', u1md || '(нет пункта)');

// ══════════════════ T2/T3: update — sphere-sync и local-inventories ══════════════════
console.log('\n=== T2/T3: update — локальная сфера при изменённом шаблоне · изменившийся состав скиллов ===');
const U2 = join(ROOT, 'u2'); mkdirSync(U2); seed(U2);
r = run(U2, 'install');
ok(r.code === 0, 'U2 install exit 0', r.out);
fillCanon(U2, { spheres: true });                 // всё заполнено — пункта placeholders быть не должно
run(U2, 'sphere game-design');
writeFileSync(join(U2, '.kaif', 'spheres', 'game-design.md'), '# Sphere: game-design (local)\n\nlocally authored.\n');
unlinkSync(join(U2, 'KAIF_ADAPTATION_TASK.md'));
{ // хирургия манифеста: (а) шаблон сферы «менялся в интервале»; (б) старый деплой не знал скилл experience
  const mp = join(U2, '.kaif', 'deploy-manifest.json');
  const m2 = JSON.parse(readFileSync(mp, 'utf8'));
  if (!m2.templateShas['.kaif/spheres/_template.md']) throw new Error('fixture: _template.md not in templateShas');
  m2.templateShas['.kaif/spheres/_template.md'] = '0'.repeat(64);
  m2.paths = m2.paths.filter((p) => p !== '.claude/skills/experience/SKILL.md');
  writeFileSync(mp, JSON.stringify(m2, null, 2) + '\n');
}
r = run(U2, `update --source ${SRC}`);
ok(r.code === 0, 'U2 update → 9.9 exit 0', r.out);
const u2task = readFileSync(join(U2, 'KAIF_UPDATE_TASK.md'), 'utf8');
// 🔴 КРАСНЫЕ ДО ФИКСА: пунктов sphere-sync/local-inventories не существует
const u2ss = taskItem(U2, 'KAIF_UPDATE_TASK.md', 'sphere-sync');
ok(!!u2ss && u2ss.includes('game-design') && u2ss.includes('_template.md'),
   '🔴 T2 пункт sphere-sync называет локальную сферу и шаблон сферы (Unlim §3.2)', u2ss || '(нет пункта)');
const u2li = taskItem(U2, 'KAIF_UPDATE_TASK.md', 'local-inventories');
ok(!!u2li && u2li.includes('experience') && u2li.includes('deploy-manifest.json'),
   '🔴 T3 пункт local-inventories называет добавленный скилл и машиночитаемый инвентарь (Unlim §4.8, NDim N6)', u2li || '(нет пункта)');
ok(!taskItem(U2, 'KAIF_UPDATE_TASK.md', 'placeholders'), 'T2 инвариант: всё заполнено → пункта placeholders нет');
// Инварианты: U1 (shipped-сфера, шаблон не менялся; состав скиллов тот же) — пунктов нет
ok(!taskItem(U1, 'KAIF_UPDATE_TASK.md', 'sphere-sync'), 'T2 инвариант: shipped-сфера без изменений шаблона → пункта sphere-sync нет');
ok(!taskItem(U1, 'KAIF_UPDATE_TASK.md', 'local-inventories'), 'T3 инвариант: состав скиллов не менялся → пункта local-inventories нет');

// ══════════════════ T4: имя проекта из канона (bugs/41) ══════════════════
console.log('\n=== T4: <PROJECT_NAME> — фолбэк с пунктом project-name, команда, лечение карты, KLAS в заголовке ===');
const T4 = join(ROOT, 't4'); mkdirSync(T4); seed(T4);
writeFileSync(join(T4, 'package.json'), JSON.stringify({ name: 'klas' }, null, 2) + '\n');
r = run(T4, 'install');
ok(r.code === 0, 'T4 install exit 0', r.out);
// 🔴 КРАСНЫЕ ДО ФИКСА: пункта project-name нет, команды project-name нет
const t4pn = taskItem(T4, 'KAIF_ADAPTATION_TASK.md', 'project-name');
ok(!!t4pn && t4pn.includes('"klas"'),
   '🔴 T4 задание несёт пункт project-name с честной пометкой фолбэка («klas» — технический идентификатор)', t4pn || '(нет пункта)');
r = run(T4, 'checkpoint project-name');
ok(r.code !== 0 && r.out.includes('projectName'),
   '🔴 T4 чекпоинт project-name ОТКАЗЫВАЕТ, пока canonical не записан (гейт исполняющий)', r.out);
r = run(T4, 'project-name "KLAS"');
ok(r.code === 0, '🔴 T4 команда project-name существует и отработала', r.out);
ok(readMarker(T4).projectName === 'KLAS', '🔴 T4 маркер несёт projectName: KLAS');
{ const m4 = JSON.parse(readFileSync(join(T4, '.kaif', 'deploy-manifest.json'), 'utf8'));
  ok(m4.values['<PROJECT_NAME>'] === 'KLAS' && m4.values['<SHORT_NAME>'] === 'KLAS',
     '🔴 T4 карта values манифеста ВЫЛЕЧЕНА (PROJECT_NAME и SHORT_NAME = KLAS)', JSON.stringify(m4.values)); }
r = run(T4, 'checkpoint project-name');
ok(r.code === 0, '🔴 T4 чекпоинт project-name после записи — зелёный', r.out);
// обновление заполняет заголовки канонной формой (карта чинится при обновлении — критерий 2)
seed(T4, SRC);
r = run(T4, 'install');
ok(r.code === 0, 'T4 bootstrap-update 9.9 exit 0', r.out);
ok(readFileSync(join(T4, 'AGENT_GUIDE.md'), 'utf8').includes('| **Name / brand** | `KLAS` |'),
   '🔴 T4 строка идентичности AGENT_GUIDE после обновления несёт «KLAS», не «klas» (слот в шаблоне обёрнут бэктиками)');

// ══════════════════ T5/T5b: честная метка маршрута (bugs/42) ══════════════════
console.log('\n=== T5/T5b: route — bootstrap при живом манифесте; legacy-bootstrap на синтетике ===');
const T5 = join(ROOT, 't5'); mkdirSync(T5); seed(T5);
r = run(T5, 'install');
ok(r.code === 0, 'T5 install exit 0', r.out);
fillCanon(T5);
seed(T5, SRC);
r = run(T5, 'install');
ok(r.code === 0, 'T5 bootstrap-update 9.9 exit 0', r.out);
ok(r.out.includes('classified against the surviving deploy manifest'), 'T5 классификация шла по ЖИВОМУ манифесту', r.out);
{ const rc = readReceipt(T5);
  // 🔴 КРАСНЫЙ ДО ФИКСА: route = 'legacy-bootstrap' при живом манифесте
  ok(rc.route === 'bootstrap' && rc.classified === true,
     '🔴 T5 квитанция: route «bootstrap» при классификации живым манифестом (NDim гр.6)', JSON.stringify(rc).slice(0, 160));
  const hist = readMarker(T5).history || [];
  ok(hist.length && hist[hist.length - 1].route === 'bootstrap',
     '🔴 T5 history маркера: последний переход — «bootstrap»', JSON.stringify(hist)); }
const T5b = join(ROOT, 't5b'); mkdirSync(T5b); seed(T5b);
r = run(T5b, 'install');
ok(r.code === 0, 'T5b install exit 0', r.out);
fillCanon(T5b);
unlinkSync(join(T5b, '.kaif', 'deploy-manifest.json'));      // манифест утрачен → синтетический baseline
seed(T5b, SRC);
r = run(T5b, `install --baseline ${DIST}`);
ok(r.code === 0, 'T5b bootstrap-update 9.9 (--baseline) exit 0', r.out);
ok(r.out.includes('synthetic baseline'), 'T5b классификация шла по СИНТЕТИЧЕСКОМУ baseline', r.out);
ok(readReceipt(T5b).route === 'legacy-bootstrap',
   'T5b инвариант: синтетика честно остаётся «legacy-bootstrap»', JSON.stringify(readReceipt(T5b)).slice(0, 160));

// ══════════════════ T6: честная неполнота языкового пакета (bugs/44, решение №44) ══════════════════
console.log('\n=== T6: install --lang ru печатает границу пакета ===');
const T6 = join(ROOT, 't6'); mkdirSync(T6); seed(T6);
r = run(T6, 'install --lang ru');
ok(r.code === 0, 'T6 install --lang ru exit 0', r.out);
// 🔴 КРАСНЫЙ ДО ФИКСА: никакой печати границы пакета
ok(r.out.includes('INCOMPLETE BY DESIGN'), '🔴 T6 печать «INCOMPLETE BY DESIGN» существует', r.out.slice(-600));
ok(r.out.includes('AGENT_GUIDE.md') && /skill bodies/.test(r.out),
   '🔴 T6 печать называет EN-документы и тела скиллов (формулировка KLAS §4.7)', r.out.slice(-600));

console.log(failures ? `\n❌ s11: ${failures} guard(s) red` : '\n✅ s11: all green');
process.exit(failures ? 1 : 0);
