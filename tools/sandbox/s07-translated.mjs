// s07-translated.mjs — свод эпика B (план 23, Фаза B0): «обновление против ЦЕЛИКОМ переведённого
// [TESTED: 2026-08-09 · зелёный в составе полигона — «sandbox suite: all 14 suites green» (npm run test:core)]
// развёртывания» + мелкие классы отчёта ndim 1.6→2.0 (ideas/ai_agents_reports/23, K1–K5).
//
// ⚠️ Дисциплина стражей (EXP-0017): свод написан ДО фиксов и обязан быть КРАСНЫМ на текущем коде
// ровно в стражах K1/K2/K3/K4/K5 (красный прогон — доказательство, зафиксирован в bugs/20–23).
// В tools/sandbox-suite.mjs свод вписывается в Фазе B1 ВМЕСТЕ с фиксами, когда зеленеет.
//
// Сценарии:
//   T1 (K1, bugs/20)  — файл переведён ВМЕСТЕ с заголовками → модульное слияние не должно
//                       удваивать документ английским шаблоном; файл идёт в diverged с пометкой.
//   T4 (K5, bugs/23)  — журналы прошлого (researches/, EXPERIENCE, «Предыдущее…» в STATUS)
//                       не попадают в stale-claims. (Фикстура живёт в песочнице T1.)
//   T2 (K2, bugs/20)  — i18n: translated: замен нет, но per-module диффы В ЗАДАНИИ есть;
//                       нетронутый чисто-EN файл под флагом ВСЁ РАВНО обновляется механически.
//   T3 (K4, bugs/22)  — package.json с уже вшитыми хендлами и CRLF не переписывается.
//   T5 (K3, bugs/21)  — diff --source на v1-манифесте не рапортует пустой ноль (hollow green),
//                       а строит синтетическую базу (--baseline) и показывает реальную дельту.
import { readFileSync, writeFileSync, mkdirSync, rmSync, appendFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must, coreRunner } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('translated', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
// Полный вывод УПАВШЕЙ команды пишется файлом рядом с корнем прогона (сессия 50: два флейка
// `update` с exit≠0 в этом своде — T1, затем T2 — оставили после себя только хвост 400 символов
// строки `ok()`, и причина осталась неназванной; `e.status` undefined = убит сигналом/буфером).
const run = coreRunner(ROOT, { maxBuffer: 64 * 1024 * 1024 });
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const copy = (a, b) => writeFileSync(b, readFileSync(a));

// ---- апстрим v9.9: правки модулей внутри блоков бандла (тот же приём, что в s02) --------------
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
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, '.claude/skills/check-backlog/SKILL.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (check-backlog)'));
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (philosophy)'));
bundle = editBundleModule(bundle, 'TESTING_FRAMEWORK.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (testing)', '', 'Historical note: this discipline entered the canon in KAIF 2.0.'));
bundle = editBundleModule(bundle, 'bugs/README.md', 0, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (bugs-readme)'));
bundle = editBundleModule(bundle, 'AGENT_GUIDE.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (agent-guide)'));
// Д3 (bugs/28): апстрим-правка привозит НОВЫЙ незаполняемый слот в модуль end-chat-soft —
// update-задание обязано получить пункт placeholders (а не узнать о нём падением финального гейта)
bundle = editBundleModule(bundle, '.claude/skills/end-chat-soft/SKILL.md', 1, (m) => m.lines.push('', 'Sign as <YOUR AGENT/MODEL>.'));
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
copy(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
// v9.10 поверх 9.9 (тот же контент, версия выше) — для гейта незавершённого задания (bugs/25)
const SRC2 = join(ROOT, 'src-9.10'); mkdirSync(SRC2);
copy(join(SRC, 'KAIF-CORE-BUNDLE.md'), join(SRC2, 'KAIF-CORE-BUNDLE.md'));
copy(join(SRC, 'KAIF-CORE.mjs'), join(SRC2, 'KAIF-CORE.mjs'));
writeFileSync(join(SRC2, 'kaif-manifest.json'), JSON.stringify({ ...man, version: '9.10' }, null, 2) + '\n');
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version; // «старая» версия = текущая сборка

// ---------------------------------------------------------------- T1+T4: перевод с заголовками
console.log('\n=== T1 (K1): файл переведён вместе с заголовками — слияние не удваивает документ ===');
const T1 = join(ROOT, 't1'); mkdirSync(T1); seed(T1);
let r = run(T1, 'install --lang ru');
ok(r.code === 0, 'T1 install --lang ru exit 0', r.out);
const CB = join(T1, '.claude/skills/check-backlog/SKILL.md');
const cbOrig = readFileSync(CB, 'utf8');
// «перевод целиком»: фронтматтер (преамбула) сохранён байт в байт, все заголовки и тексты — русские
const cbPre = cbOrig.slice(0, cbOrig.search(/^# /m));
writeFileSync(CB, cbPre +
  '# /check-backlog — ревизия беклога\n\nПройтись по bugs/ и plans/, найти всё открытое.\n\n' +
  '## Что делать\n\nШаги ревизии по-русски.\n\n' +
  '## Заметки\n\nЗаметки по-русски.\n');
const cbLenBefore = statSync(CB).size;
// H (эпик H 2.1): летопись — 13-й ключевой документ, owner-seeded
ok(existsSync(join(T1, 'PROJECT_HISTORY.md')), 'H: PROJECT_HISTORY.md едет со свежей установкой');
writeFileSync(join(T1, 'PROJECT_HISTORY.md'), '# Летопись\n\nOWNER CHRONICLE — MUST SURVIVE\n');
// T4-фикстура (K5): журналы прошлого, честно упоминающие старую версию
mkdirSync(join(T1, 'researches'), { recursive: true });
writeFileSync(join(T1, 'researches', '15_kaif_20_note.md'), `# Отчёт\n\nЭтот документ ПРО KAIF ${FROM} и его механику — история, не протухание.\n`);
appendFileSync(join(T1, 'EXPERIENCE.md'), `\nEXP-0001 · обновление KAIF ${FROM} прошло зелёным (журнал прошлого).\n`);
appendFileSync(join(T1, 'STATUS.md'), `\nПредыдущее обновление: KAIF ${FROM}.\n`);

r = run(T1, `update --source ${SRC}`);
ok(r.code === 0, 'T1 update →9.9 exit 0', r.out);
const cbTxt = readFileSync(CB, 'utf8');
ok(!/^# \/check-backlog — [A-Za-z]/m.test(cbTxt), 'K1: английский H1 шаблона НЕ вставлен рядом с русским (нет удвоения)');
ok(cbTxt.includes('ревизия беклога'), 'K1: русский текст владельца цел');
ok(statSync(CB).size <= cbLenBefore * 1.5, `K1: файл не разбух (${cbLenBefore} → ${statSync(CB).size} байт)`);
ok(!new RegExp('merged \\d+ module\\(s\\) into \\.claude/skills/check-backlog').test(r.out), 'K1: лог не рапортует «merged» на переведённом файле');
const task1 = readFileSync(join(T1, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/check-backlog\/SKILL\.md/.test(task1) && /translated wholesale/.test(task1), 'K1: задание называет файл «translated wholesale» в diverged');
console.log('\n=== T4 (K5): журналы прошлого не считаются протухшими утверждениями ===');
ok(!task1.includes('researches/15_kaif_20_note.md'), 'K5: researches/ не в stale-claims');
ok(!/stale-claims[^]*EXPERIENCE\.md/.test(task1), 'K5: EXPERIENCE.md не в stale-claims');
ok(!/stale-claims[^]*Предыдущее обновление/.test(task1), 'K5: строка «Предыдущее обновление» STATUS пропущена');
ok(!/stale-claims[^]*TESTING_FRAMEWORK\.md/.test(task1),
   'Д4: файл, байт-в-байт равный текущему шаблону, не может нести протухшее утверждение ПРОЕКТА');
ok(readFileSync(join(T1, 'PROJECT_HISTORY.md'), 'utf8').includes('OWNER CHRONICLE — MUST SURVIVE'),
   'H: летопись — owner-seeded, update её не трогает');

// ---------------------------------------------------------------- T2: i18n translated — диффы есть, EN-файлы живут
console.log('\n=== T2 (K2): i18n translated — не слепота, а «не заменять, но анализировать» ===');
const T2 = join(ROOT, 't2'); mkdirSync(T2); seed(T2);
must(run, T2, 'install --lang ru');
const mk = JSON.parse(readFileSync(join(T2, '.kaif', 'kaif.json'), 'utf8'));
mk.i18n = 'translated';
writeFileSync(join(T2, '.kaif', 'kaif.json'), JSON.stringify(mk, null, 2) + '\n');
// ЛОКАЛИЗОВАННАЯ локальная правка в ТОМ ЖЕ модуле PHILOSOPHY, что меняет апстрим
// (заголовки целы — EN; тело правки — русское: файл «несёт письменность владельца»)
const P2 = join(T2, 'PHILOSOPHY.md');
const p2 = splitModules(readFileSync(P2, 'utf8'));
p2[2].lines.push('', 'Локальная правка по-русски в том же модуле, что менял апстрим.');
writeFileSync(P2, joinModules(p2));
const tfShaBefore = sha256(readFileSync(join(T2, 'TESTING_FRAMEWORK.md')));
r = run(T2, `update --source ${SRC}`);
ok(r.code === 0 && r.out.includes('i18n: translated'), 'T2 update exit 0, флаг признан', r.out);
ok(!readFileSync(P2, 'utf8').includes('UPSTREAM ADDITION'), 'K2: локализованный файл — ни одной молчаливой замены (dry-run)');
const task2 = readFileSync(join(T2, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task2.includes('## Module diffs') && task2.includes('+ UPSTREAM ADDITION 9.9 (philosophy)'),
   'K2: обещанные per-module диффы ЕСТЬ в задании (лог/доки перестали врать)');
ok(readFileSync(join(T2, 'TESTING_FRAMEWORK.md'), 'utf8').includes('UPSTREAM ADDITION 9.9 (testing)'),
   'K2: нетронутый чисто-EN файл обновлён механически несмотря на флаг',
   'sha до=' + tfShaBefore.slice(0, 12));
ok(readFileSync(join(T2, '.claude/skills/check-backlog/SKILL.md'), 'utf8').includes('UPSTREAM ADDITION 9.9 (check-backlog)'),
   'K2: EN-навык с машинными алиасами — не «перевод», под флагом обновляется механически');

// ---------------------------------------------------------------- T9: незавершённое задание не затирается (bugs/25)
// В T2 живёт неотработанное KAIF_UPDATE_TASK.md с Module diffs — второй update обязан отказать,
// а не молча потерять невлитую дельту (двух-хоповая потеря воспроизведена судьёй на до-фиксном коде).
console.log('\n=== T9 (bugs/25): update поверх незавершённого задания — честный отказ ===');
r = run(T2, `update --source ${SRC2}`);
ok(r.code !== 0 && r.out.includes('KAIF_UPDATE_TASK.md') && r.out.includes('never verified'),
   'bugs/25: update отказал — предыдущее задание не отработано (fail-closed)', r.out.slice(-200));
rmSync(join(T2, 'KAIF_UPDATE_TASK.md'));
r = run(T2, `update --source ${SRC2}`);
ok(r.code === 0, 'bugs/25: после СОЗНАТЕЛЬНОГО удаления задания update проходит', r.out);
const rc2 = JSON.parse(readFileSync(join(T2, '.kaif', 'last-update.json'), 'utf8'));
ok(String(rc2.source || '').includes('src-9.10'), 'B4: расписка хранит source обновления (дельта пересчитываема)');

// ---------------------------------------------------------------- T6: сетка НЕ душит владельческие добавки (находка F1 судьи)
// Файл с крошечной базой (1 модуль: README директории) + владелец ДОБАВИЛ кириллическую секцию
// при script-языке БЕЗ языкового пакета (uk): заголовки базы целы — это НЕ перевод, и апстримная
// правка обязана влиться механически, а сетка «translated wholesale» — молчать.
console.log('\n=== T6 (F1): владельческая добавка в 1-модульный файл ≠ «переведён целиком» ===');
const T6 = join(ROOT, 't6'); mkdirSync(T6); seed(T6);
r = run(T6, 'install --lang uk');
ok(r.code === 0, 'T6 install --lang uk exit 0', r.out);
const BR = join(T6, 'bugs', 'README.md');
appendFileSync(BR, '\n## Власні нотатки\n\nВласний текст українською — додана секція власника.\n');
r = run(T6, `update --source ${SRC}`);
ok(r.code === 0, 'T6 update exit 0', r.out);
const brTxt = readFileSync(BR, 'utf8');
ok(brTxt.includes('UPSTREAM ADDITION 9.9 (bugs-readme)'), 'F1: апстримная правка влита механически (файл не заморожен сеткой)');
ok(brTxt.includes('Власні нотатки'), 'F1: добавленная секция владельца цела');
ok(!/bugs\/README\.md \(translated wholesale/.test(readFileSync(join(T6, 'KAIF_UPDATE_TASK.md'), 'utf8')),
   'F1: задание не лжёт про «translated wholesale» на файле с целыми заголовками базы');

// ---------------------------------------------------------------- T3: package.json не переписывается зря
console.log('\n=== T3 (K4): package.json с вшитыми хендлами и CRLF не трогается ===');
const T3 = join(ROOT, 't3'); mkdirSync(T3); seed(T3);
const pkgText = '{\r\n  "name": "sbx-project",\r\n  "scripts": {\r\n    "kaif:version": "node .kaif/kaif-core.mjs version",\r\n    "kaif:check": "node .kaif/kaif-core.mjs check",\r\n    "kaif:update": "node .kaif/kaif-core.mjs update"\r\n  }\r\n}\r\n';
writeFileSync(join(T3, 'package.json'), pkgText);
r = run(T3, 'install');
ok(r.code === 0, 'T3 install exit 0', r.out);
ok(readFileSync(join(T3, 'package.json'), 'utf8') === pkgText, 'K4: package.json байт в байт не тронут (хендлы уже были)');

// ---------------------------------------------------------------- T5: diff --source на v1-манифесте
console.log('\n=== T5 (K3): первое обновление не слепо — diff работает и на v1-манифесте ===');
const T5 = join(ROOT, 't5'); mkdirSync(T5); seed(T5);
must(run, T5, 'install');
const dmPath = join(T5, '.kaif', 'deploy-manifest.json');
const dm = JSON.parse(readFileSync(dmPath, 'utf8'));
delete dm.templateShas; delete dm.moduleShas; dm.manifestVersion = 1;   // симуляция развёртывания 1.x
writeFileSync(dmPath, JSON.stringify(dm, null, 2) + '\n');
r = run(T5, `diff --source ${SRC} --baseline ${DIST}`);
ok(r.code === 0, 'T5 diff --source exit 0', r.out);
ok(!/diff vs 9\.9: 0 file\(s\)/.test(r.out) && /[1-9]\d* file\(s\) carry upstream/.test(r.out),
   'K3: на v1-манифесте diff показывает РЕАЛЬНУЮ дельту (синтетическая база), а не пустой ноль', r.out);

// ---------------------------------------------------------------- T7: дрейф значений плейсхолдеров (bugs/26, Д1)
// Деплой БЕЗ package.json (имя = каталог 't7'), затем появился package.json с ДРУГИМ именем —
// апдейт не должен дописывать дубликат H1 с новым именем в конец канона.
console.log('\n=== T7 (Д1): дрейф <PROJECT_NAME> — дубликата H1 в конце канона не бывает ===');
const T7 = join(ROOT, 't7'); mkdirSync(T7); seed(T7);
r = run(T7, 'install');
ok(r.code === 0, 'T7 install (без package.json) exit 0', r.out);
// проект живой: локальная правка в AGENT_GUIDE (как в поле) — файл разойдётся и пойдёт через
// модульный merge, где дрейф сигнатуры H1 и даёт дубликат
const AG7 = join(T7, 'AGENT_GUIDE.md');
const ag7 = splitModules(readFileSync(AG7, 'utf8'));
ag7[2].lines.push('', 'LOCAL PROJECT EDIT (agent guide)');
writeFileSync(AG7, joinModules(ag7));
// …и дрейф значения <PROJECT_NAME>: package.json переименован после деплоя
writeFileSync(join(T7, 'package.json'), JSON.stringify({ name: 'renamed-project', scripts: { 'kaif:version': 'node .kaif/kaif-core.mjs version', 'kaif:check': 'node .kaif/kaif-core.mjs check', 'kaif:update': 'node .kaif/kaif-core.mjs update' } }, null, 2) + '\n');
// H: развёртывание БЕЗ летописи (до-2.1) — update обязан досеять недостающий owner-док из шаблона
rmSync(join(T7, 'PROJECT_HISTORY.md'), { force: true });
r = run(T7, `update --source ${SRC}`);
ok(r.code === 0, 'T7 update exit 0', r.out);
const agTxt = readFileSync(join(T7, 'AGENT_GUIDE.md'), 'utf8');
const h1Count = (agTxt.match(/^# /gm) || []).length;
ok(h1Count === 1, `Д1: в AGENT_GUIDE.md ровно один H1 (найдено ${h1Count}) — дубликат не дописан`);
ok(/^# t7 — /.test(agTxt), 'Д1: H1 развёртывания ЦЕЛ и стоит ПЕРВОЙ строкой (не удалён как «убранный апстримом»)');
ok(!agTxt.includes('renamed-project'), 'Д1: дрейфнувшее имя не просочилось в канон ни в каком виде');
ok(agTxt.includes('UPSTREAM ADDITION 9.9 (agent-guide)'), 'Д1: апстримная правка соседнего модуля влита механически');
const dm7 = JSON.parse(readFileSync(join(T7, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(dm7.values && dm7.values['<PROJECT_NAME>'] === 't7', 'Д1: снимок values живёт в манифесте (имя развёртывания зафиксировано)');
// Д3: пункт placeholders в задании (новый слот приехал апстрим-правкой end-chat-soft)
const task7 = readFileSync(join(T7, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/\*\*placeholders\*\*/.test(task7) && task7.includes('<YOUR AGENT/MODEL>'),
   'Д3: update-задание несёт пункт placeholders с непроставленным слотом');
ok(/the framework changed \d+ of \d+ shipped files/.test(task7),
   'B4: задание называет честный размер работы (N из M файлов)');
ok(existsSync(join(T7, 'PROJECT_HISTORY.md')) && readFileSync(join(T7, 'PROJECT_HISTORY.md'), 'utf8').includes('chronicle'),
   'H: недостающий owner-док (летопись) досеян апдейтом из шаблона');

// ---------------------------------------------------------------- T8: порядок гейтов и слепой слот (bugs/27, 28)
console.log('\n=== T8 (Д2+Д3): re-sync зеркал ДО гейта плейсхолдеров; слот email не слепой ===');
const T8 = join(ROOT, 't8'); mkdirSync(T8); seed(T8);
r = run(T8, 'install');
ok(r.code === 0, 'T8 install exit 0', r.out);
// агент заполняет ВСЕ слоты в КАНОНЕ (как велит адаптационное задание), зеркала остаются
// несинхронизированными — ровно полевой сценарий bug 27
const PH_ALL = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>', '<LICENSE>',
  '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  "<YOUR AGENT'S noreply EMAIL>", '<OWNER_LANGUAGE>'];
const fillCanon = (dir, skipPh = []) => {
  const fill = (p) => { let t = readFileSync(p, 'utf8'); for (const ph of PH_ALL) { if (skipPh.includes(ph)) continue; t = t.split(ph).join('X'); } writeFileSync(p, t); };
  for (const doc of ['AGENT_GUIDE.md', 'PHILOSOPHY.md', 'BUG_FIXING_FRAMEWORK.md', 'TESTING_FRAMEWORK.md'])
    if (existsSync(join(dir, doc))) fill(join(dir, doc));
  for (const n of readdirSync(join(dir, '.claude', 'skills')))
    if (existsSync(join(dir, '.claude', 'skills', n, 'SKILL.md'))) fill(join(dir, '.claude', 'skills', n, 'SKILL.md'));
  if (existsSync(join(dir, '.kaif', 'spheres')))
    for (const n of readdirSync(join(dir, '.kaif', 'spheres')))
      if (n.endsWith('.md')) fill(join(dir, '.kaif', 'spheres', n));
};
fillCanon(T8);
// проставить все чекпоинты адаптационного задания (механика, не суждение);
// L5/bugs/41: чекпоинт project-name исполняет гейт — канонное имя сначала записывается командой
must(run, T8, 'project-name "T8 Sandbox"');
// M3 (plans/50): чекпоинт field-report исполняет проверку файла отчёта — фикстуре нужен файл
// (сам гейт стережётся в s03/s04; здесь — только поддержка потока)
const v8 = JSON.parse(readFileSync(join(T8, '.kaif', 'kaif.json'), 'utf8')).version;
mkdirSync(join(T8, 'reports', 'KAIF_UPDATES'), { recursive: true });
writeFileSync(join(T8, 'reports', 'KAIF_UPDATES', `T8_KAIF_${v8}_INSTALL_REPORT.md`), '# Field report: KAIF install sandbox\n');
// U′3 issue #4: гейт owner-voice объективен — «нет портрета» фиксируется канонической строкой
writeFileSync(join(T8, 'AGENT_GUIDE.md'),
  readFileSync(join(T8, 'AGENT_GUIDE.md'), 'utf8') + '\nno voice portrait (sandbox owner said none, 2026-08-21)\n');
const taskIds = [...new Set([...readFileSync(join(T8, 'KAIF_ADAPTATION_TASK.md'), 'utf8')
  .matchAll(/kaif-core\.mjs checkpoint ([a-z-]+)/g)].map((m) => m[1]))];
for (const id of taskIds) run(T8, `checkpoint ${id}${id === 'judge' ? ' --verdict "sandbox: mechanical tick"' : ''}`);
// K6/bugs/24: задание ПЕРЕСОХРАНЕНО с CRLF (Windows-редактор) уже С чекпоинтами — $-якоря
// гейта обязаны узнавать записанные чекпоинты и после этого (класс ndim: «нет фронтматтера» ×15)
const AT8 = join(T8, 'KAIF_ADAPTATION_TASK.md');
writeFileSync(AT8, readFileSync(AT8, 'utf8').replace(/\r?\n/g, '\r\n'));
r = run(T8, 'verify-final');
ok(r.code === 0, 'Д2+K6: CRLF-задание с чекпоинтами; verify ресинкает зеркала и ЗЕЛЕНЕЕТ', r.out);
// Д3, слепой слот: свежая установка, заполнен ТОЛЬКО <YOUR AGENT/MODEL> — гейт обязан краснеть на email-слоте
const T8b = join(ROOT, 't8b'); mkdirSync(T8b); seed(T8b);
must(run, T8b, 'install');
fillCanon(T8b, ["<YOUR AGENT'S noreply EMAIL>"]);   // всё заполнено, КРОМЕ email-слота
must(run, T8b, 'project-name "T8b Sandbox"');   // L5/bugs/41: гейт project-name требует записанного имени
// M3: файл отчёта для чекпоинта field-report (гейт стережётся в s03/s04)
const v8b = JSON.parse(readFileSync(join(T8b, '.kaif', 'kaif.json'), 'utf8')).version;
mkdirSync(join(T8b, 'reports', 'KAIF_UPDATES'), { recursive: true });
writeFileSync(join(T8b, 'reports', 'KAIF_UPDATES', `T8b_KAIF_${v8b}_INSTALL_REPORT.md`), '# Field report: KAIF install sandbox\n');
// U′3 issue #4: та же каноническая запись для гейта owner-voice
writeFileSync(join(T8b, 'AGENT_GUIDE.md'),
  readFileSync(join(T8b, 'AGENT_GUIDE.md'), 'utf8') + '\nno voice portrait (sandbox owner said none, 2026-08-21)\n');
const idsB = [...new Set([...readFileSync(join(T8b, 'KAIF_ADAPTATION_TASK.md'), 'utf8')
  .matchAll(/kaif-core\.mjs checkpoint ([a-z-]+)/g)].map((m) => m[1]))];
for (const id of idsB) run(T8b, `checkpoint ${id}${id === 'judge' ? ' --verdict "sandbox: mechanical tick"' : ''}`);
r = run(T8b, 'verify-final');
ok(r.code !== 0 && r.out.includes("<YOUR AGENT'S noreply EMAIL>"),
   'Д3: незаполненный email-слот ЛОВИТСЯ гейтом (раньше был слеп)', r.out.slice(-300));

// ---------------------------------------------------------------- T10 (K6/bugs/24): распаковщик терпит CRLF
console.log('\n=== T10 (K6): kaif-unpack на CRLF-пересохранённом ядре находит блоки ===');
const T10 = join(ROOT, 't10'); mkdirSync(T10);
writeFileSync(join(T10, 'KAIF-FULL-CRLF.md'), readFileSync(join(DIST, 'KAIF-FULL.md'), 'utf8').replace(/\r?\n/g, '\r\n'));
let unp;
try { unp = { code: 0, out: execSync(`node ${join(REPO, 'framework', 'kaif-unpack.mjs')} KAIF-FULL-CRLF.md 2>&1`, { cwd: T10, stdio: 'pipe' }).toString() }; }
catch (e) { unp = { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
ok(unp.code === 0 && !/no FILE: blocks/.test(unp.out), 'K6: CRLF-ядро распаковано (блоки найдены; красное доказательство — HEAD-версия: exit 1 «no FILE: blocks»)', unp.out.slice(-200));
ok(existsSync(join(T10, 'AGENT_GUIDE.md')) && !readFileSync(join(T10, 'AGENT_GUIDE.md'), 'utf8').includes('\r'),
   'K6: распакованное из CRLF-ядра нормализовано в LF');

// ------------------------------------------------- T11 (bugs/66 №3): ЛАТИНСКИЙ язык под защитой
// Четыре латинских пакета (de/es/fr/pt) ОТГРУЖАЮТСЯ, а строки в таблице письменностей у них не
// было — значит немецкое развёртывание не имело защиты ВООБЩЕ: ни сетки «переведён целиком», ни
// per-file заморозки, ни авто-флага i18n. Таблицу для них не дописать (письменность у них —
// латиница), поэтому свойство МЕРИТСЯ: доля слов диска, встречающихся во входящем шаблоне.
// Свод судит ОБА ответа (EXP-0059): перевод обязан быть узнан, а сосед, оставшийся английским,
// обязан обновиться механически — иначе «защита» была бы просто заморозкой всего подряд.
console.log('\n=== T11 (bugs/66 №3): латинский язык (de) — перевод узнан, английский сосед обновлён ===');
const T11 = join(ROOT, 't11'); mkdirSync(T11); seed(T11);
r = run(T11, 'install --lang de');
ok(r.code === 0, 'T11 install --lang de exit 0', r.out);
const CB11 = join(T11, '.claude/skills/check-backlog/SKILL.md');
const cb11 = readFileSync(CB11, 'utf8');
// «перевод целиком» по-немецки: преамбула байт в байт, все заголовки и тексты — немецкие
writeFileSync(CB11, cb11.slice(0, cb11.search(/^# /m)) +
  '# /check-backlog — Durchsicht des Rückstands\n\nGehe durch bugs/ und plans/ und finde alles Offene.\n\n' +
  '## Vorgehen\n\nSchritte der Durchsicht auf Deutsch beschrieben.\n\n' +
  '## Hinweise\n\nHinweise auf Deutsch für die nächste Sitzung.\n');
const cb11Before = statSync(CB11).size;
const tf11Before = sha256(readFileSync(join(T11, 'TESTING_FRAMEWORK.md')));
r = run(T11, `update --source ${SRC}`);
ok(r.code === 0, 'T11 update →9.9 exit 0', r.out);
const cb11Txt = readFileSync(CB11, 'utf8');
ok(!/^# \/check-backlog — [A-Z][a-z]+ the/m.test(cb11Txt) && !cb11Txt.includes('UPSTREAM ADDITION 9.9 (check-backlog)'),
   'bugs/66 №3: немецкий перевод НЕ затёрт английским шаблоном (латиница больше не слепая зона)');
ok(cb11Txt.includes('Durchsicht des Rückstands'), 'bugs/66 №3: немецкий текст владельца цел');
ok(statSync(CB11).size <= cb11Before * 1.5, `bugs/66 №3: файл не удвоен (${cb11Before} → ${statSync(CB11).size} байт)`);
ok(/translated wholesale/.test(readFileSync(join(T11, 'KAIF_UPDATE_TASK.md'), 'utf8')),
   'bugs/66 №3: задание называет немецкий файл «translated wholesale»');
ok(String(JSON.parse(readFileSync(join(T11, '.kaif', 'kaif.json'), 'utf8')).i18n || '').toLowerCase() === 'translated',
   'bugs/66 №3: маркер записал i18n: translated для латинского развёртывания');
ok(readFileSync(join(T11, 'TESTING_FRAMEWORK.md'), 'utf8').includes('UPSTREAM ADDITION 9.9 (testing)'),
   'bugs/66 №3: английский сосед в том же de-развёртывании обновлён МЕХАНИЧЕСКИ (защита не заморозка)',
   'sha до=' + tf11Before.slice(0, 12));

// ---------------------------------------------------------------- Freeze (№56, U′5): замороженный пакет объявляет статус при развёртывании
// Заморозка восьми пакетов легальна, только если она НЕ МОЛЧИТ (формула №56: версия · состояние ·
// причина · оживление по запросу): владелец, ставящий --lang de, узнаёт статус из САМОЙ установки,
// а не из документации, которую он не открывал. Живой ru строку заморозки не несёт.
// [TESTED: 2026-08-21 · красный доказан прогоном против dist ДО пересборки: строки FROZEN нет]
console.log('\n=== Freeze (№56): honesty-строка замороженного пакета ===');
const FZ = join(ROOT, 'freeze-de'); mkdirSync(FZ); seed(FZ);
let rf = run(FZ, 'install --lang de --mode anonymous');
ok(rf.code === 0, 'Freeze: установка замороженным пакетом (de) остаётся легальной, exit 0', rf.out.slice(-300));
ok(/FROZEN at its KAIF 2\.2 state/.test(rf.out) && /revived on community demand/.test(rf.out),
   'Freeze: строка статуса — состояние 2.2 названо, оживление по запросу названо (формула №56)', rf.out.slice(-400));
const FZR = join(ROOT, 'freeze-ru'); mkdirSync(FZR); seed(FZR);
rf = run(FZR, 'install --lang ru --mode anonymous');
ok(rf.code === 0 && !/FROZEN/.test(rf.out), 'Freeze: живой пакет ru строку заморозки НЕ несёт', rf.out.slice(-300));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ s07: все стражи зелёные'}`);
process.exit(failures ? 1 : 0);
