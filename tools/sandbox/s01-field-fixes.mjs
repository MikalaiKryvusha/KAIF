// sandboxes.mjs — песочницы Фазы 1 KAIF 2.0 (полевые фиксы). Zero-deps, Node >=18.
// Сценарии: S1 свежая установка · S2 анонимный check при живом бандле (репро GH#1)
// · S3 легаси: наследование agents, честный контекст, повторный прогон · S4 update:
// ignore-first + честный лог ядра. Каждый ассерт печатает ✅/❌; ненулевой exit при провале.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, rmSync, existsSync, cpSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { must, failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// текущая версия репо — ЧИТАЕТСЯ из dist, не хардкодится: захардкоженная «1.6» ломала
// полигон на релизном бампе 2.0 при нуле продуктовых дефектов
const CUR = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
// абсолютный корень: аргумент node внутри execSync резолвится от cwd песочницы
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('field', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + extra));
  if (!cond) failures++;
};
// Запуск ядра в песочнице: возвращает { code, out }
const run = (cwd, args) => {
  try {
    const out = execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args}`, { cwd, stdio: 'pipe' });
    return { code: 0, out: out.toString() };
  } catch (e) { return failed(e, { root: ROOT, cwd: cwd, args: args }); }
};
// Первый запуск (ядра ещё нет в песочнице) — из dist
const runDist = (cwd, args) => {
  try {
    const out = execSync(`node ${join(DIST, 'KAIF-CORE.mjs')} ${args}`, { cwd, stdio: 'pipe' });
    return { code: 0, out: out.toString() };
  } catch (e) { return failed(e, { root: ROOT, cwd: cwd, args: args }); }
};
const seedBundle = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};

// ---------------------------------------------------------------- S1: свежая установка (standard)
console.log('\n=== S1: свежая установка (standard) ===');
const S1 = join(ROOT, 's1'); mkdirSync(S1); seedBundle(S1);
let r = run(S1, 'install');
ok(r.code === 0, 'S1 install exit 0', r.out.slice(-400));
const gi1 = existsSync(join(S1, '.gitignore')) ? readFileSync(join(S1, '.gitignore'), 'utf8') : '';
ok(gi1.includes('.kaif/install/') && gi1.includes('KAIF_UPDATE_TASK.md') && gi1.includes('KAIF_ADAPTATION_TASK.md'),
   'S1 ignore-first: транзиенты в .gitignore ДО работы');
r = run(S1, 'check');
ok(r.code === 0, 'S1 check зелёный', r.out.slice(-400));
// M2 (plans/49): свежая установка создаёт канон-директорию reports/ с README;
// README описывает поддиректории KAIF_UPDATES/KAIF_AUDIT (сами поддиректории — лениво,
// первым отчётом: git пустых директорий не хранит)
const repReadme = join(S1, 'reports', 'README.md');
ok(existsSync(repReadme), 'S1 reports/: свежая установка создаёт README');
const repTxt = existsSync(repReadme) ? readFileSync(repReadme, 'utf8') : '';
ok(repTxt.includes('KAIF_UPDATES') && repTxt.includes('KAIF_AUDIT'),
   'S1 reports/README: назван состав (KAIF_UPDATES + KAIF_AUDIT)');
// N1 (plans/38): свежая установка кладёт 14-й ключевой документ — канон требований — в корень;
// красный доказан против HEAD-бандла до поставки (в нём FILE-блока REQUIREMENTS_FRAMEWORK нет)
const reqFw = join(S1, 'REQUIREMENTS_FRAMEWORK.md');
ok(existsSync(reqFw), 'S1 REQUIREMENTS_FRAMEWORK: свежая установка кладёт 14-й ключевой документ');
ok(existsSync(reqFw) && readFileSync(reqFw, 'utf8').includes('goal vector'),
   'S1 REQUIREMENTS_FRAMEWORK: несёт дисциплину goal vector + acceptance criteria');
// T5 (plans/26 §4, решение владельца №53): ДЕФОЛТНАЯ УСТАНОВКА = ORIGIN.
// Факт кода («--mode standard (default)» → tracking origin) задачу не закрывает — закрывает
// СТРАЖ: без него следующая правка машинерии уводит дефолт в анонимность молча, и поле теряет
// обновления, отчёты и петлю обратной связи из коробки. Стережём НАБЛЮДАЕМЫЙ результат
// (маркер после установки без единого флага), а не строку помощи: помощь — проза, маркер — поведение.
// [TESTED: 2026-08-08 · красный доказан мутацией дефолта `val('--mode') || 'anonymous'` в
//  framework/installer/KAIF-CORE.mjs → оба ассерта S1 красные, S2 остаётся зелёным]
const mkT5 = JSON.parse(readFileSync(join(S1, '.kaif', 'kaif.json'), 'utf8'));
ok(mkT5.tracking === 'origin', 'S1 T5: установка БЕЗ флагов даёт tracking=origin (дефолт не анонимный)',
   `tracking=${mkT5.tracking}`);
ok(mkT5.origin === 'https://github.com/MikalaiKryvusha/KAIF',
   'S1 T5: маркер несёт адрес origin (обновления и петля обратной связи работают из коробки)',
   `origin=${mkT5.origin}`);
// схема маркера (Reference §12.1): битое поле — красный, восстановление — зелёный
const mkPath = join(S1, '.kaif', 'kaif.json');
const mk0 = readFileSync(mkPath, 'utf8');
const mkBad = JSON.parse(mk0); mkBad.agents = 'claude-code'; // не массив
writeFileSync(mkPath, JSON.stringify(mkBad, null, 2) + '\n');
r = run(S1, 'check');
ok(r.code !== 0 && /marker schema: agents/.test(r.out), 'S1 схема маркера: битое поле agents — красный', r.out.slice(-300));
writeFileSync(mkPath, mk0);
r = run(S1, 'check');
ok(r.code === 0, 'S1 схема маркера: восстановлено — зелёный');

// ── T4 (2.2): портрет владельца — ОПЦИОНАЛЬНЫЙ канон-файл AUTHOR_STYLOMETRY.md ──────────────
// Критерий 2 плана 34: «отсутствие не краснит check — подтвердить сводом». Стережём ТРИ вещи
// порознь: имя доезжает до поля поставкой · машинерия портрет НЕ рождает · снятый вручную
// портрет не краснит check. Четвёртый ассерт — КОНТРАСТ: скелет ПОСТАВКИ обязателен, и его
// пропажу check видит; без него первые три зеленели бы и на сломанной поставке.
// [TESTED: 2026-08-08 · красный доказан мутацией назначения эмбеда скелета на AUTHOR_STYLOMETRY.md]
const skelPath = join(S1, '.kaif', '_owner-voice-template.md');
const skel0 = readFileSync(skelPath, 'utf8');
ok(skel0.includes('AUTHOR_STYLOMETRY.md')
   && readFileSync(join(S1, '.claude', 'skills', 'owner-voice', 'SKILL.md'), 'utf8').includes('AUTHOR_STYLOMETRY.md'),
   'S1 T4: канон-имя портрета доехало до поля — и в скелете, и в навыке');
ok(!existsSync(join(S1, 'AUTHOR_STYLOMETRY.md')),
   'S1 T4: машинерия портрет НЕ рождает (портрет — owner-класс, его пишут владелец с агентом)');
// портрет, снятый вручную: намеренно ДВА H1 и НИ ОДНОГО токена версии «KAIF x.y» —
// иначе скан протухших утверждений втянет владельческий файл в задание обновления (S4)
writeFileSync(join(S1, 'AUTHOR_STYLOMETRY.md'),
  '# Owner voice portrait\n\n# Register CODEX\n\n### R1. A rule with its quote\n');
r = run(S1, 'check');
ok(r.code === 0, 'S1 T4: снятый вручную портрет не краснит check (опциональный канон-документ)', r.out.slice(-300));
rmSync(skelPath);
r = run(S1, 'check');
ok(r.code !== 0 && /_owner-voice-template\.md/.test(r.out),
   'S1 T4 КОНТРАСТ: пропажа СКЕЛЕТА поставки — красный (файл поставки обязателен, портрет — нет)', r.out.slice(-300));
writeFileSync(skelPath, skel0);  // побайтно: иначе template-sha разойдётся и S4 объявит модуль расходящимся
r = run(S1, 'check');
ok(r.code === 0, 'S1 T4: скелет восстановлен побайтно — снова зелёный');

// ---------------------------------------------------------------- S2: анонимный check при живом бандле (GH#1)
console.log('\n=== S2: анонимная установка — check без флага при живом бандле ===');
const S2 = join(ROOT, 's2'); mkdirSync(S2); seedBundle(S2);
r = run(S2, 'install --mode anonymous');
ok(r.code === 0, 'S2 install --mode anonymous exit 0', r.out.slice(-400));
ok(existsSync(join(S2, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md')), 'S2 бандл жив (окно issue #1)');
r = run(S2, 'check'); // БЕЗ --mode — репро issue #1: старый код давал MISSING по origin-tied
ok(r.code === 0, 'S2 check БЕЗ --mode зелёный (ANON выведен из маркера) — фикс GH#1', r.out.slice(-600));
r = run(S2, 'check --mode standard'); // явный CLI-override побеждает — ожидаемо красный
ok(r.code !== 0 && /MISSING/.test(r.out), 'S2 check --mode standard красный (явный флаг сильнее маркера — контраст)');
// T5 (plans/26 §4): анонимность — ОСОЗНАННЫЙ ВЫБОР по явной просьбе, вторая половина стража.
// Ассерт «origin по умолчанию» без этой пары доказывает только полдела: дефолт мог бы стать
// origin оттого, что анонимный путь сломан. Здесь стережём, что явный флаг всё ещё работает
// и что поля origin в анонимном маркере НЕТ (анонимность по построению, не подчисткой прозы).
const mkT5anon = JSON.parse(readFileSync(join(S2, '.kaif', 'kaif.json'), 'utf8'));
ok(mkT5anon.tracking === 'anonymous', 'S2 T5: --mode anonymous даёт tracking=anonymous (явная просьба работает)',
   `tracking=${mkT5anon.tracking}`);
ok(!('origin' in mkT5anon), 'S2 T5: анонимный маркер НЕ несёт origin (анонимность по построению)');
// И обновление НЕ переводит режим молча: анонимное развёртывание отказывается обновляться
// по сети и называет причину — режим существующего проекта менять может только владелец.
r = run(S2, 'update');
ok(r.code !== 0 && /anonymous install tracks no origin/.test(r.out),
   'S2 T5: update на анонимном развёртывании отказывается (режим не меняется молча)', r.out.slice(-300));
// сфера без библиотеки → громкое предупреждение (оно в stderr — сливаем потоки)
must(run, S2, 'sphere game-design');
r = run(S2, 'check 2>&1');
ok(r.code === 0 && r.out.includes('sphere "game-design" has no library'),
   'S2 предупреждение о несуществующей библиотеке сферы', r.out.slice(-400));

// ---------------------------------------------------------------- S3: легаси-путь
console.log('\n=== S3: легаси 1.4 — наследование agents, честный контекст, повторный прогон ===');
const S3 = join(ROOT, 's3'); mkdirSync(S3); seedBundle(S3);
mkdirSync(join(S3, '.kaif'), { recursive: true });
writeFileSync(join(S3, '.kaif', 'kaif.json'), JSON.stringify({
  framework: 'KAIF', version: '1.4', released: '2026-07-08', origin: 'https://github.com/MikalaiKryvusha/KAIF',
  tracking: 'origin', sphere: 'programming', agent: 'claude-code', agentsSupported: ['claude-code'], language: 'en',
}, null, 2) + '\n');
// --baseline в несуществующую директорию: тест ДЕТЕРМИНИРОВАН (без сети за реальным v1.4)
// и покрывает именно классический adopt-everything фолбэк; классифицированный путь — S13/S14.
r = run(S3, `install --baseline ${join(ROOT, 'no-baseline-here')}`);
ok(r.code === 0, 'S3 легаси-install exit 0', r.out.slice(-400));
ok(r.out.includes('inherited from the existing marker'), 'S3 agents унаследованы из маркера (лог явный)');
ok(!existsSync(join(S3, '.agents')) && !existsSync(join(S3, '.grok')) && !existsSync(join(S3, '.roo')),
   'S3 лишние системы НЕ развёрнуты (было: все пять молча)');
const task3 = readFileSync(join(S3, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task3.includes(`legacy update 1.4 → ${CUR}`) && task3.includes('pre-1.5 deployments never wrote them'),
   'S3 контекстная строка честная (без хардкода «1.5 news», причина из состояния)');
ok(!/merge the 1\.5 template news/.test(task3), 'S3 хардкод «merge the 1.5 template news» исчез');
const marker3 = JSON.parse(readFileSync(join(S3, '.kaif', 'kaif.json'), 'utf8'));
ok(!('agent' in marker3) && !('agentsSupported' in marker3) && JSON.stringify(marker3.agents) === '["claude-code"]',
   'S3 маркер: устаревшие поля сняты, agents наследован');
// повторный прогон не стирает чекпоинты
must(run, S3, 'checkpoint review-news');
r = run(S3, `install --baseline ${join(ROOT, 'no-baseline-here')}`);
const task3b = readFileSync(join(S3, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task3b.includes('KAIF-UPDATE: review-news done'), 'S3 повторный bootstrap НЕ стёр чекпоинты');
ok(r.out.includes('carries recorded checkpoints'), 'S3 лог сообщает о сохранении задачи');

// ---------------------------------------------------------------- S4: update — ignore-first + честный лог ядра
console.log('\n=== S4: update со свежей установки (ядро не менялось между релизами) ===');
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
for (const n of ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md']) cpSync(join(DIST, n), join(SRC, n));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9'; // выше — иначе no-op; sha те же: файлы не менялись
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
r = run(S1, `update --source ${SRC}`);
ok(r.code === 0, 'S4 update exit 0', r.out.slice(-600));
ok(r.out.includes('unchanged in this release'), 'S4 лог честный: ядро «unchanged», а не ложное «replaced»');
ok(!r.out.includes('replaced .kaif/kaif-core.mjs'), 'S4 ложного «replaced the machinery» нет');
const gi4 = readFileSync(join(S1, '.gitignore'), 'utf8');
ok((gi4.match(/\.kaif\/install\//g) || []).length === 1, 'S4 ignore-first идемпотентен (нет дублей строк)');
const marker4 = JSON.parse(readFileSync(join(S1, '.kaif', 'kaif.json'), 'utf8'));
ok(marker4.version === '9.9', 'S4 версия маркера продвинута');
// T4 (2.2): портрет — owner-класс, вне манифеста. Update не имеет права его тронуть: право
// механической замены даёт ТОЛЬКО совпадение template-sha, а у портрета шаблона нет вовсе.
ok(readFileSync(join(S1, 'AUTHOR_STYLOMETRY.md'), 'utf8')
     === '# Owner voice portrait\n\n# Register CODEX\n\n### R1. A rule with its quote\n',
   'S4 T4: портрет пережил update ПОБАЙТНО — машинерия owner-файл не переписывает и не переименовывает');
ok(existsSync(join(S1, 'KAIF_UPDATE_TASK.md')), 'S4 update-задача написана');

// ---------------------------------------------------------------- S5: проводка kaif:* — сплайс, не пересериализация (issue #16)
// Полевой дефект (KUMM): проводка читала package.json, дописывала scripts и писала обратно
// JSON.stringify(pkg, null, 2) — 24 диффа чужого форматирования под сообщением «+ wired kaif:*»
// (компактные bin/engines/keywords развёрнуты построчно, добавлен финальный перевод строки).
// Стережём ИНВАРИАНТ, а не конкретные байты вставки: результат = исходник с РОВНО ОДНОЙ
// непрерывной вставкой (общий префикс + общий суффикс покрывают исходник целиком).
// [TESTED: 2026-08-21 · красный доказан прогоном против dist ДО пересборки (старый код
//  пересериализации): оба инварианта S5a/S5b красные; после node tools/build-framework.mjs — зелёные]
console.log('\n=== S5: проводка kaif:* в package.json — сплайс (issue #16) ===');
const onePointInsertion = (before, after) => {
  let p = 0; while (p < before.length && before[p] === after[p]) p++;
  let s = 0; while (s < before.length - p && s < after.length - p
    && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
  return after.length > before.length && p + s >= before.length;
};
// S5a: рукописный компактный манифест КЛАССА полевого (одно-строчные значения, БЕЗ финального
// перевода строки, ключа scripts нет вовсе) — переживает проводку байт-в-байт вне вставки.
const S5a = join(ROOT, 's5a'); mkdirSync(S5a); seedBundle(S5a);
const pkgA0 = [
  '{',
  '  "name": "kumm",',
  '  "version": "1.0.0",',
  '  "bin": { "kumm": "kumm.mjs" },',
  '  "engines": { "node": ">=22" },',
  '  "license": "MIT",',
  '  "keywords": ["nexusmods", "mods", "modding", "cdp", "cli"],',
  '  "files": ["kumm.mjs", "README.md", "LICENSE"]',
  '}',
].join('\n');                                   // намеренно НЕТ '\n' в конце файла
writeFileSync(join(S5a, 'package.json'), pkgA0);
r = run(S5a, 'install');
ok(r.code === 0, 'S5a install exit 0', r.out.slice(-400));
const pkgA1 = readFileSync(join(S5a, 'package.json'), 'utf8');
ok(onePointInsertion(pkgA0, pkgA1),
   'S5a манифест пережил проводку байт-в-байт вне вставки scripts (одна непрерывная вставка)');
ok(!pkgA1.endsWith('\n'), 'S5a отсутствовавший финальный перевод строки НЕ добавлен');
const pkgA = JSON.parse(pkgA1);
ok(pkgA.scripts && pkgA.scripts['kaif:version'] === 'node .kaif/kaif-core.mjs version'
   && pkgA.scripts['kaif:check'] === 'node .kaif/kaif-core.mjs check'
   && pkgA.scripts['kaif:update'] === 'node .kaif/kaif-core.mjs update',
   'S5a все три kaif:* дописаны и валидны');
ok(pkgA1.includes('"bin": { "kumm": "kumm.mjs" },') && pkgA1.includes('"keywords": ["nexusmods", "mods", "modding", "cdp", "cli"],'),
   'S5a компактные строки владельца стоят дословно (не развёрнуты построчно)');
// повторный прогон: ничего добавлять — файл не трогается вовсе
r = run(S5a, 'install');
ok(r.out.includes('kaif:* handles already wired — package.json untouched')
   && readFileSync(join(S5a, 'package.json'), 'utf8') === pkgA1,
   'S5a повторная проводка: файл не тронут байт-в-байт');
// S5b: живой ключ scripts + CRLF — вставка внутрь scripts, стиль концов строк сохранён.
const S5b = join(ROOT, 's5b'); mkdirSync(S5b); seedBundle(S5b);
const pkgB0 = [
  '{',
  '  "name": "acme",',
  '  "scripts": {',
  '    "test": "node test.mjs"',
  '  },',
  '  "files": ["a.mjs"]',
  '}',
  '',
].join('\r\n');
writeFileSync(join(S5b, 'package.json'), pkgB0);
r = run(S5b, 'install');
ok(r.code === 0, 'S5b install exit 0', r.out.slice(-400));
const pkgB1 = readFileSync(join(S5b, 'package.json'), 'utf8');
ok(onePointInsertion(pkgB0, pkgB1), 'S5b вставка внутрь живого scripts — одна и непрерывная');
const pkgB = JSON.parse(pkgB1);
ok(pkgB.scripts.test === 'node test.mjs' && pkgB.scripts['kaif:update'] === 'node .kaif/kaif-core.mjs update',
   'S5b чужой script уцелел, kaif:* дописаны');
ok(!/[^\r]\n/.test(pkgB1.slice(1)), 'S5b стиль CRLF сохранён и во вставке');

// ---------------------------------------------------------------- S6: фаза U′3 — канон поставки (issues #4, #6, #3)
// #4: задание адаптации никогда не устанавливало портрет голоса — README поля был написан ДО
// прибытия голоса, владелец вмешивался дважды («и стилометрию НУЖНО установить, это моя прямая
// команда»). #6: язык документов роутился ДИРЕКТОРИЕЙ — мета-план эпика уезжал английским у
// русскоязычного владельца («Я по-русски разговариваю вообще-то»). #3: строка <BUILD_COMMAND>
// пункта placeholders не называла библиотеку сфер, которую гейт после `sphere <name>` сканирует.
// [TESTED: 2026-08-21 · красный доказан прогоном против dist ДО пересборки: пункта owner-voice
//  нет, роутинг директорийный, аннотации сферы нет]
console.log('\n=== S6 (U′3): owner-voice в задании · язык по аудитории · сфера в строке placeholders ===');
// собственная песочница с ОДНОЙ установкой (S5a ставился дважды — re-run сносит адаптационное
// задание по норме bugs/33) и package.json БЕЗ build-скрипта: слот <BUILD_COMMAND> остаётся жив
const S6 = join(ROOT, 's6'); mkdirSync(S6); seedBundle(S6);
writeFileSync(join(S6, 'package.json'), '{\n  "name": "s6",\n  "version": "1.0.0"\n}\n');
r = run(S6, 'install');
ok(r.code === 0, 'S6 install exit 0', r.out.slice(-300));
const taskS6 = readFileSync(join(S6, 'KAIF_ADAPTATION_TASK.md'), 'utf8');
// #4: пункт существует и стоит ДО goal-plan (первого owner-текста прохода)
ok(taskS6.includes('**owner-voice**') && taskS6.includes('checkpoint owner-voice'),
   'S6 (#4): задание несёт пункт owner-voice с чекпоинтом');
ok(taskS6.indexOf('**owner-voice**') > -1 && taskS6.indexOf('**owner-voice**') < taskS6.indexOf('**goal-plan**'),
   'S6 (#4): owner-voice стоит ДО goal-plan — портрет решается раньше первого owner-текста');
// #6: развёрнутый AGENT_GUIDE роутит язык ВОПРОСОМ аудитории (читаем ДО дописывания записи ниже)
const agS6 = readFileSync(join(S6, 'AGENT_GUIDE.md'), 'utf8');
ok(agS6.includes('routed by AUDIENCE, never by directory') && agS6.includes('does the OWNER read this?'),
   'S6 (#6): язык роутится вопросом «читает ли это владелец?», не списком директорий');
ok(agS6.includes('epic meta-plans (`plans/NN_EPIC_*`)') && agS6.includes('`MASTER_PLAN.md` · `STATUS.md`')
   && agS6.includes('everything in `interviews/`'),
   'S6 (#6): таблица аудиторий называет мета-планы, MASTER_PLAN/STATUS и interviews на стороне владельца');
ok(agS6.includes('Promotion rewrites') && agS6.includes('Recon and executor detail stay English'),
   'S6 (#6): обе границы правила названы (промоушен переписывает · разведка остаётся английской)');
// #4: гейт объективен — голая галочка без портрета и без записи ОТКАЗЫВАЕТ
r = run(S6, 'checkpoint owner-voice');
ok(r.code !== 0 && /owner-voice REFUSED/.test(r.out),
   'S6 (#4): checkpoint owner-voice без портрета и записи — отказ, не самоаттестация', r.out.slice(-250));
writeFileSync(join(S6, 'AGENT_GUIDE.md'),
  readFileSync(join(S6, 'AGENT_GUIDE.md'), 'utf8') + '\nno voice portrait (sandbox owner said none, 2026-08-21)\n');
r = run(S6, 'checkpoint owner-voice');
ok(r.code === 0 && /no voice portrait` recorded/.test(r.out),
   'S6 (#4): каноническая запись `no voice portrait` в AGENT_GUIDE удовлетворяет гейт', r.out.slice(-250));
// #4: позитивная ветка — портрет на диске удовлетворяет гейт без записи (S5b ставился один раз)
writeFileSync(join(S5b, 'AUTHOR_STYLOMETRY.md'), '# Owner voice portrait\n\nsandbox portrait\n');
r = run(S5b, 'checkpoint owner-voice');
ok(r.code === 0 && /portrait on disk/.test(r.out),
   'S6 (#4): портрет на диске удовлетворяет гейт (вторая ветка контракта)', r.out.slice(-250));
// #3: строка <BUILD_COMMAND> пункта placeholders называет БУДУЩЕГО члена — объявляемую сферу
ok(/BUILD_COMMAND[^\n]*\.kaif\/spheres\/<sphere>\.md — YOUR declared library joins/.test(taskS6),
   'S6 (#3): список пункта placeholders называет библиотеку сферы, которая войдёт в охват гейта');

// ---------------------------------------------------------------- S7: sha256-гейт ЛОАДЕРА (долг L5, линза 3 №3)
// Суд эпика L назвал дыру ПОСТОЯННОГО покрытия: sha256-гейт лоадера не стерёг ни один свод —
// tamper доказывался только сессионными стендами (1.5, L5), и следующая правка лоадера могла
// снять гейт молча. Тест ГЕРМЕТИЧЕН: --source локальный каталог, сети нет; tamper — на КОПИЯХ
// артефактов (bugs/62), dist не трогается.
// [TESTED: 2026-08-21 · красный доказан мутацией на копии лоадера с выключенным сравнением
//  (`got !== want` → `false`): tamper-набор прошёл, «handing over» напечатан, дерево родилось —
//  все три tamper-ассерта S7 стали бы красными; twin-компаратор S8 доказан красным порчей
//  одного файла между слепками — mismatch назван поимённо]
console.log('\n=== S7: sha256-гейт ЛОАДЕРА — подменённый артефакт не исполняется ===');
const LOADER = join(REPO, 'framework', 'installer', 'KAIF-LOADER.mjs');
const runLoader = (cwd, src) => {
  try {
    const out = execSync(`node ${LOADER} --source ${src} --mode anonymous`, { cwd, stdio: 'pipe' });
    return { code: 0, out: out.toString() };
  } catch (e) { return failed(e, { root: ROOT, cwd: cwd, args: src }); }
};
const LOADER_SET = ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md', 'kaif-manifest.json'];
const seedSource = (dir) => { mkdirSync(dir); for (const n of LOADER_SET) cpSync(join(DIST, n), join(dir, n)); };
// контраст: чистый набор проходит гейт, руль передан ядру, дерево родилось — без него
// tamper-красные доказывали бы лишь то, что лоадер не работает вовсе
const SRC_OK = join(ROOT, 's7-src-ok'); seedSource(SRC_OK);
const S7A = join(ROOT, 's7-clean'); mkdirSync(S7A);
r = runLoader(S7A, SRC_OK);
ok(r.code === 0 && /sha256 ok/.test(r.out) && /handing over/.test(r.out),
   'S7 контраст: чистый набор — гейт зелёный, руль передан ядру', r.out.slice(-400));
ok(existsSync(join(S7A, 'AGENT_GUIDE.md')) && existsSync(join(S7A, '.kaif', 'kaif.json')),
   'S7 контраст: установка ЧЕРЕЗ лоадер родила дерево');
// tamper ядра: подменённый исполняемый артефакт — отказ ДО записи, ядро не исполняется
const SRC_TC = join(ROOT, 's7-src-tampered-core'); seedSource(SRC_TC);
appendFileSync(join(SRC_TC, 'KAIF-CORE.mjs'), '\n// tampered byte\n');
const S7B = join(ROOT, 's7-tamper-core'); mkdirSync(S7B);
r = runLoader(S7B, SRC_TC);
ok(r.code !== 0 && /sha256 mismatch for KAIF-CORE\.mjs/.test(r.out),
   'S7 tamper ядра: гейт красный и называет артефакт', r.out.slice(-300));
ok(!existsSync(join(S7B, '.kaif', 'kaif-core.mjs')),
   'S7 tamper ядра: подменённое ядро НЕ записано (отказ раньше записи)');
ok(!/handing over/.test(r.out) && !existsSync(join(S7B, 'AGENT_GUIDE.md')),
   'S7 tamper ядра: руль не передан, установка не родилась');
// tamper бандла: ядро (валидное) уже записано — это штатно; установка всё равно не стартует
const SRC_TB = join(ROOT, 's7-src-tampered-bundle'); seedSource(SRC_TB);
appendFileSync(join(SRC_TB, 'KAIF-CORE-BUNDLE.md'), '\ntampered\n');
const S7C = join(ROOT, 's7-tamper-bundle'); mkdirSync(S7C);
r = runLoader(S7C, SRC_TB);
ok(r.code !== 0 && /sha256 mismatch for KAIF-CORE-BUNDLE\.md/.test(r.out),
   'S7 tamper бандла: гейт красный и называет артефакт', r.out.slice(-300));
ok(!/handing over/.test(r.out) && !existsSync(join(S7C, 'AGENT_GUIDE.md')),
   'S7 tamper бандла: руль не передан, установка не родилась');

// ---------------------------------------------------------------- S8: twin-run — установка детерминирована (долг L5)
// Вторая половина того же долга: byte-exact twin-run стенда L5 (147 файлов, 0 расхождений) жил
// только в сессии. Вход выравнивается ЦЕЛИКОМ — второй прогон идёт В ТОТ ЖЕ абсолютный путь
// (машинерия законно печатает имя и путь проекта в развёрнутые документы; twin в двух разных
// каталогах сравнивал бы разные ВХОДЫ и краснел на честной параметризации — проверено пробой
// 2026-08-21). Поэтому исключений в сравнении НЕТ: любой mismatch — недетерминизм машинерии
// (дата, рандом, порядок ключей) и потому красный.
console.log('\n=== S8: twin-run — повторная установка в тот же путь побайтно идентична ===');
const snapTree = (dir) => {
  const out = new Map();
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.set(relative(dir, p).replaceAll('\\', '/'), createHash('sha256').update(readFileSync(p)).digest('hex'));
    }
  };
  walk(dir);
  return out;
};
const S8 = join(ROOT, 's8-twin'); mkdirSync(S8); seedBundle(S8);
must(run, S8, 'install');
const snap1 = snapTree(S8);
rmSync(S8, { recursive: true, force: true }); mkdirSync(S8); seedBundle(S8);
must(run, S8, 'install');
const snap2 = snapTree(S8);
const only1 = [...snap1.keys()].filter((k) => !snap2.has(k));
const only2 = [...snap2.keys()].filter((k) => !snap1.has(k));
const twinDiffs = [...snap1.keys()].filter((k) => snap2.has(k) && snap1.get(k) !== snap2.get(k));
ok(only1.length === 0 && only2.length === 0,
   `S8 twin-run: состав деревьев идентичен (${snap1.size} файлов)`,
   `только в №1: ${only1.slice(0, 5).join(', ') || '—'}; только в №2: ${only2.slice(0, 5).join(', ') || '—'}`);
ok(twinDiffs.length === 0,
   `S8 twin-run: все ${snap1.size} файлов побайтно равны — установка детерминирована`,
   'разошлись: ' + twinDiffs.slice(0, 5).join(', '));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ все песочницы зелёные'}`);
process.exit(failures ? 1 : 0);
