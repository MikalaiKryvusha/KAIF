// sandboxes.mjs — песочницы Фазы 1 KAIF 2.0 (полевые фиксы). Zero-deps, Node >=18.
// Сценарии: S1 свежая установка · S2 анонимный check при живом бандле (репро GH#1)
// · S3 легаси: наследование agents, честный контекст, повторный прогон · S4 update:
// ignore-first + честный лог ядра. Каждый ассерт печатает ✅/❌; ненулевой exit при провале.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { must } from '../lib/sandbox-run.mjs';

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
  } catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
// Первый запуск (ядра ещё нет в песочнице) — из dist
const runDist = (cwd, args) => {
  try {
    const out = execSync(`node ${join(DIST, 'KAIF-CORE.mjs')} ${args}`, { cwd, stdio: 'pipe' });
    return { code: 0, out: out.toString() };
  } catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
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

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ все песочницы зелёные'}`);
process.exit(failures ? 1 : 0);
