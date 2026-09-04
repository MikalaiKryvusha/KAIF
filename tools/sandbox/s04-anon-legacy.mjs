// sandboxes4.mjs — песочницы Фазы 5.5: анонимный путь становится механическим
// [TESTED: 2026-08-09 · зелёный в составе полигона — «sandbox suite: all 14 suites green» (npm run test:core)]
// (манифест переживает самоочистку → bootstrap-update классифицирует), легаси без манифеста
// получает синтетический слепок из релизного артефакта старой версии (--baseline).
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, readdirSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must, coreRunner } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// текущая версия репо — из dist, не из головы (хардкод «1.6» ломал полигон на бампе 2.0)
const CUR = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('anon-legacy', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-350)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = coreRunner(ROOT);
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
// апстрим 9.9: правка static-модуля PHILOSOPHY.md [2]
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (anon/legacy)'));
// мета-блок бандла: install-путь читает версию отсюда. Патч ОБЯЗАН исполниться —
// молчаливый no-op replace и был причиной трёх красных сводов на релизном бампе
const bundlePatched = bundle.replace(`"version": "${CUR}"`, '"version": "9.9"');
if (bundlePatched === bundle) throw new Error(`bundle meta version patch was a NO-OP — expected "version": "${CUR}" in the bundle meta`);
bundle = bundlePatched;
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');

const PH = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>', '<LICENSE>',
  '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  "<YOUR AGENT'S noreply EMAIL>", '<OWNER_LANGUAGE>'];   // email-слот виден гейту с bug 28
const fillAll = (dir) => {
  const fill = (p) => { let t = readFileSync(p, 'utf8'); for (const ph of PH) t = t.split(ph).join('X'); writeFileSync(p, t); };
  fill(join(dir, 'AGENT_GUIDE.md'));
  for (const n of readdirSync(join(dir, '.claude', 'skills'))) {
    const p = join(dir, '.claude', 'skills', n, 'SKILL.md');
    if (existsSync(p)) fill(p);
  }
  if (existsSync(join(dir, '.kaif', 'spheres'))) for (const n of readdirSync(join(dir, '.kaif', 'spheres')))
    if (n.endsWith('.md')) fill(join(dir, '.kaif', 'spheres', n));
};

// ---------------------------------------------------------------- S13: анонимный цикл целиком
console.log('\n=== S13: anonymous — манифест переживает самоочистку, bootstrap-update механический ===');
const S13 = join(ROOT, 's13'); mkdirSync(S13); seed(S13);
// собственный скрипт владельца с «кайфовым» именем — самоочистка обязана его пощадить
writeFileSync(join(S13, 'package.json'), JSON.stringify({ name: 's13', scripts: { 'kaif:check': 'echo OWNER-OWN-SCRIPT' } }, null, 2) + '\n');
let r = run(S13, 'install --mode anonymous');
ok(r.code === 0, 'S13 install --mode anonymous exit 0', r.out);
fillAll(S13);
must(run, S13, 'sync');   // раскатка зеркал — установочный шаг; свой ассерт у `sync` ниже, после самоочистки
// L5/bugs/41: чекпоинт project-name исполняет гейт — канонное имя сначала записывается командой
must(run, S13, 'project-name "S13 Sandbox"');
// M3 (plans/50, критерии 4 и 6, красным-вперёд): задание адаптации ставит отчёт об установке
// (скелет шаблона D — researches/18 §8) той же механикой чекпоинта; анонимный профиль — отчёт
// ЛОКАЛЬНЫЙ, пункт не тянется к origin (инвариант §2 п. 7 researches/18; риск 2 плана 50).
const at13 = readFileSync(join(S13, 'KAIF_ADAPTATION_TASK.md'), 'utf8');
const fr13s = at13.indexOf('- **field-report**');
const fr13e = at13.indexOf('When done, run:', fr13s);
const fr13 = fr13s >= 0 && fr13e > fr13s ? at13.slice(fr13s, fr13e) : '';
ok(fr13.includes('reports/KAIF_UPDATES/') && fr13.includes('_INSTALL_REPORT.md'),
   'S13-M3 задание адаптации несёт пункт field-report (скелет шаблона D)');
ok(fr13 !== '' && !/origin|github|issues?\b|\bgh\b/i.test(fr13),
   'S13-M3 анонимный профиль: пункт отчёта НЕ тянется к origin');
const v13 = JSON.parse(readFileSync(join(S13, '.kaif', 'kaif.json'), 'utf8')).version;
mkdirSync(join(S13, 'reports', 'KAIF_UPDATES'), { recursive: true });
writeFileSync(join(S13, 'reports', 'KAIF_UPDATES', `S13_KAIF_${v13}_INSTALL_REPORT.md`),
  '# Field report: KAIF install sandbox\n\n## 4. Final state and judge verdict\nVERIFIED\n');
// M5 (plans/51, критерий 3): эвал-ловушка дедупа — симулированный дефект с СУЩЕСТВУЮЩИМ
// fingerprint. Семантика документированной процедуры (/report-bug: совпадение surface +
// symptom-class = тот же сигнал → «+1 наблюдение»; версия НЕ в ключе): существующий класс
// обязан находиться, чужой класс — нет (иначе наблюдение клеилось бы к чужому тикету).
// Анонимный профиль: дедуп ТОЛЬКО локальный (режим 8.2) — фикстура не тянется к origin.
mkdirSync(join(S13, 'bugs', 'KAIF'), { recursive: true });

// ── Ловушка меряет ПОСТАВЛЕННУЮ процедуру, а не саму себя (bugs/65 №3) ─────────────────────
// БЫЛО: `dedupScan` объявлялся здесь же замыканием и читал каталог, созданный этим же тестом
// тремя строками выше. Продукт в проверку не входил вовсе: вырезание ВСЕГО KAIF-ветвления
// навыка /report-bug из бандла (4503 символа — дедуп, fingerprint, шаблоны A/B, гейт
// отправителя) оставляло оба ассерта зелёными. Классический «страж мерит прокси, а не свойство».
// СТАЛО: контракт читается из РАЗВЁРНУТОГО навыка, а формат отпечатка ВЫВОДИТСЯ из него же —
// поэтому потеря контракта в поставке красит ловушку, а смена формата ведёт её за собой.
const deployedSkill = join(S13, '.claude', 'skills', 'report-bug', 'SKILL.md');
ok(existsSync(deployedSkill), 'S13-M5 навык /report-bug развёрнут установкой (носитель процедуры дедупа)');
const skillText = existsSync(deployedSkill) ? readFileSync(deployedSkill, 'utf8') : '';

// Полные уникальные строки контракта — короткое вхождение зеленело бы от случайного совпадения
// (`BUG_FIXING_FRAMEWORK.md` → Стражи).
const DEDUP_RULE = 'A match on surface + symptom-class (the version is NOT part of the key) = the SAME signal';
const FP_TEMPLATE = 'kaif-fp: <surface> :: <symptom-class> :: v<major.minor>';
ok(skillText.includes(DEDUP_RULE),
   'S13-M5 поставка НЕСЁТ правило дедупа (совпадение surface+class = тот же сигнал, версия не в ключе)');
ok(skillText.includes(FP_TEMPLATE),
   'S13-M5 поставка НЕСЁТ формат отпечатка kaif-fp');

// Разделитель полей ВЫВОДИТСЯ из шаблона поставки, а не зашивается в тест.
const sepMatch = FP_TEMPLATE.match(/<surface>(.*?)<symptom-class>/);
const SEP = skillText.includes(FP_TEMPLATE) && sepMatch ? sepMatch[1] : ' :: ';
const FP_PREFIX = FP_TEMPLATE.slice(0, FP_TEMPLATE.indexOf('<surface>'));   // «kaif-fp: »
const fpLine = (surface, cls, ver) => `${FP_PREFIX}${surface}${SEP}${cls}${SEP}v${ver}`;

writeFileSync(join(S13, 'bugs', 'KAIF', '01_stale_claims_noise.md'),
  '# KAIF bug: stale-claims scanner noise on dated journal lines\n\n' +
  fpLine('installer/KAIF-CORE.mjs::stale-claims', 'stale-claims-noise', '2.1') + '\n');

// Сама процедура: та же, что описана в поставке — grep по surface, затем по symptom-class.
const dedupScan = (surface, cls) => readdirSync(join(S13, 'bugs', 'KAIF'))
  .filter((f) => f.endsWith('.md'))
  .filter((f) => { const t = readFileSync(join(S13, 'bugs', 'KAIF', f), 'utf8'); return t.includes(surface) && t.includes(cls); });
ok(dedupScan('installer/KAIF-CORE.mjs::stale-claims', 'stale-claims-noise').length === 1,
   'S13-M5 эвал-ловушка дедупа: существующий fingerprint НАЙДЕН по surface+class («+1 наблюдение», не новый тикет)');
ok(dedupScan('installer/KAIF-CORE.mjs::stale-claims', 'scanner-false-green').length === 0,
   'S13-M5 эвал-ловушка дедупа: чужой symptom-class НЕ матчится (негативный контроль — новый сигнал = новый тикет)');
const adaptIds = [...new Set([...readFileSync(join(S13, 'KAIF_ADAPTATION_TASK.md'), 'utf8').matchAll(/kaif-core\.mjs checkpoint ([a-z-]+)/g)].map((m) => m[1]))];
// U′3 issue #4: гейт owner-voice объективен — «нет портрета» фиксируется канонической строкой
writeFileSync(join(S13, 'AGENT_GUIDE.md'),
  readFileSync(join(S13, 'AGENT_GUIDE.md'), 'utf8') + '\nno voice portrait (sandbox owner said none, 2026-08-21)\n');
for (const id of adaptIds) run(S13, `checkpoint ${id}${id === 'judge' ? ' --verdict "VERIFIED: sandbox"' : ''}`);
r = run(S13, 'verify-final');
ok(r.code === 0, 'S13 verify-final exit 0 (полный анонимный install)', r.out);
ok(existsSync(join(S13, '.kaif', 'deploy-manifest.json')), '🔴 S13 обезличенный манифест ПЕРЕЖИЛ самоочистку');
// bug 29 (третий 2.0-отчёт): ядро больше НЕ удаляется — остаётся анонимизированным, механика
// 2.0 (check/sync/diff/adopt-current) доступна анониму; origin и аккаунт вырезаны по значению.
ok(existsSync(join(S13, '.kaif', 'kaif-core.mjs')), 'S13 ядро СОХРАНЕНО анонимизированным (bug 29)');
const core13 = readFileSync(join(S13, '.kaif', 'kaif-core.mjs'), 'utf8');
ok(!core13.includes('MikalaiKryvusha'), 'S13 в оставленном ядре нет origin-аккаунта');
r = run(S13, 'sync');
ok(r.code === 0, 'S13 sync РАБОТАЕТ после анонимной самоочистки (поле аудитило 96 зеркал своим скриптом)', r.out);
const dm13 = JSON.parse(readFileSync(join(S13, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(!JSON.stringify(dm13).includes('MikalaiKryvusha') && !JSON.stringify(dm13).includes('github.com'),
   'S13 манифест не несёт origin/автора');
const pkg13 = JSON.parse(readFileSync(join(S13, 'package.json'), 'utf8'));
ok(pkg13.scripts && pkg13.scripts['kaif:check'] === 'echo OWNER-OWN-SCRIPT',
   '🔴 S13 одноимённый скрипт ВЛАДЕЛЬЦА пережил самоочистку (снятие по значению, не по имени)');
// bootstrap 9.9: свежий тонкий вход — симулируем работу лоадера (кладём ядро+бандл 9.9)
seed(S13, SRC);
r = run(S13, 'install --mode anonymous');
ok(r.code === 0, 'S13 bootstrap-update 9.9 exit 0', r.out);
ok(r.out.includes('classified against the surviving deploy manifest'),
   '🔴 S13 классификация против выжившего манифеста (не adopt-everything)', r.out);
ok(readFileSync(join(S13, 'PHILOSOPHY.md'), 'utf8').includes('UPSTREAM ADDITION 9.9'),
   '🔴 S13 апстримный модуль ВЛИТ МЕХАНИЧЕСКИ (отчёт 08: «механика двигала только штамп» — мёртв)');
const mk13 = JSON.parse(readFileSync(join(S13, '.kaif', 'kaif.json'), 'utf8'));
ok(mk13.version === '9.9' && mk13.tracking === 'anonymous', 'S13 маркер продвинут, tracking цел');
r = run(S13, 'update');
ok(r.code !== 0 && /surviving deploy manifest makes that pass mechanical/.test(r.out),
   'S13 cmdUpdate для anonymous — честный отказ с новой формулировкой');

// ---------------------------------------------------------------- S14: легаси без манифеста + синтетический слепок
console.log('\n=== S14: легаси без манифеста — синтетический слепок из артефакта старой версии ===');
const S14 = join(ROOT, 's14'); mkdirSync(S14); seed(S14);
r = run(S14, 'install');
ok(r.code === 0, `S14 install (${CUR}) exit 0`, r.out);
unlinkSync(join(S14, '.kaif', 'deploy-manifest.json')); // «древний» проект: снапшотов нет
// локализация модуля PHILOSOPHY [1] (заголовок цел, тело русское) — должна пережить слепок
const P14 = join(S14, 'PHILOSOPHY.md');
const p14 = splitModules(readFileSync(P14, 'utf8'));
p14[1].lines = [p14[1].lines[0], '', 'Русская локализация модуля — обязана пережить слепочный апдейт.', ''];
writeFileSync(P14, joinModules(p14));
seed(S14, SRC); // bootstrap 9.9
r = run(S14, `install --baseline ${DIST}`);
ok(r.code === 0, 'S14 легаси-bootstrap с --baseline exit 0', r.out);
ok(r.out.includes('synthetic baseline'), '🔴 S14 синтетический слепок построен (легаси-путь не слеп)');
ok(r.out.includes('classified against a synthetic baseline'), 'S14 классификация против слепка');
const p14txt = readFileSync(P14, 'utf8');
ok(p14txt.includes('Русская локализация модуля'), '🔴 S14 локализованный модуль пережил слепочный апдейт');
ok(p14txt.includes('UPSTREAM ADDITION 9.9'), '🔴 S14 апстримный модуль влит механически при ПУСТОМ манифесте');
const dm14 = JSON.parse(readFileSync(join(S14, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(dm14.manifestVersion === 2 && dm14.templateShas, 'S14 манифест регенерирован в v2 — дальше проект живёт штатно');
// недоступный baseline → честный фолбэк на классику
const S14b = join(ROOT, 's14b'); mkdirSync(S14b); seed(S14b);
must(run, S14b, 'install');
unlinkSync(join(S14b, '.kaif', 'deploy-manifest.json'));
seed(S14b, SRC);
r = run(S14b, `install --baseline ${join(ROOT, 'no-such-dir')}`);
ok(r.code === 0 && /no baseline artifact reachable/.test(r.out) && /adopt-everything/.test(r.out),
   'S14b недоступный слепок → честный фолбэк на классический легаси-путь', r.out);

// ---------------------------------------------------------------- S14c: конфликт на bootstrap-пути + интервал новостей
console.log('\n=== S14c: конфликтный модуль на слепочном пути → дифф в задаче; новости интервалом ===');
const S14c = join(ROOT, 's14c'); mkdirSync(S14c); seed(S14c);
must(run, S14c, 'install');
unlinkSync(join(S14c, '.kaif', 'deploy-manifest.json'));
// маркер прикидываемся 1.4 — интервал (1.4, 9.9] обязан напечатать И 1.5, И 1.6 блоки новостей
const mk14c = JSON.parse(readFileSync(join(S14c, '.kaif', 'kaif.json'), 'utf8'));
mk14c.version = '1.4';
writeFileSync(join(S14c, '.kaif', 'kaif.json'), JSON.stringify(mk14c, null, 2) + '\n');
// проектный документ, утверждающий СТАРУЮ версию, — П9: машинерия обязана его найти
writeFileSync(join(S14c, 'PROJECT_NOTES.md'), '# Наш проект\n\nМы работаем на KAIF 1.4 и довольны.\n');
// NDim R2 (эпик FP 2.4): ТА ЖЕ форма утверждения, но с постоянным маркером оправдания
// KAIF-VERSION-OK строкой выше — скан обязан промолчать (иначе оправданная строка
// переподсвечивается на каждом интервале навсегда); PROJECT_NOTES.md выше — контроль,
// что скан при этом не ослеп.
writeFileSync(join(S14c, 'PROJECT_NOTES_OK.md'), '# Наш проект\n\n<!-- KAIF-VERSION-OK: правило приехало этой версией, упоминание историческое -->\nМы работаем на KAIF 1.4 и довольны.\n');
// bugs/54: портрет голоса владельца — owner-класс, и он ЛЕГАЛЬНО несёт токены версий (реестр
// корпусов называет версии источников, журнал истории — версии, в которых портрет менялся).
// Фикстура ставит портрет в ТОЧНО ТУ ЖЕ позицию, что и PROJECT_NOTES выше: строка-утверждение
// «KAIF 1.4» без даты и не в blockquote — то есть скан обязан найти её у соседа и промолчать здесь.
writeFileSync(join(S14c, 'AUTHOR_STYLOMETRY.md'),
  '# Портрет голоса владельца\n\n## Журнал истории\n\nПортрет снят на KAIF 1.4 по первому корпусу.\n');
// локальная правка В ТОМ ЖЕ модуле [2], который меняет апстрим 9.9 → конфликт
const P14c = join(S14c, 'PHILOSOPHY.md');
const p14c = splitModules(readFileSync(P14c, 'utf8'));
p14c[2].lines.push('', 'LOCAL BOOTSTRAP CONFLICT EDIT');
writeFileSync(P14c, joinModules(p14c));
seed(S14c, SRC);
r = run(S14c, `install --baseline ${DIST}`);
ok(r.code === 0, 'S14c bootstrap exit 0', r.out);
const p14cTxt = readFileSync(P14c, 'utf8');
ok(p14cTxt.includes('LOCAL BOOTSTRAP CONFLICT EDIT') && !p14cTxt.includes('UPSTREAM ADDITION 9.9'),
   'S14c конфликтный модуль сохранён, апстрим не наложен молча');
const task14c = readFileSync(join(S14c, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task14c.includes('merge-modules') && task14c.includes('```diff') && task14c.includes('+ UPSTREAM ADDITION 9.9'),
   '🔴 S14c bootstrap-задача несёт по-модульный дифф (классификация дошла до задачи)');
ok(task14c.includes('bootstrap update 1.4 → 9.9, classified mechanically'),
   'S14c контекст-строка честная с counters');
ok(task14c.includes('**1.5:**') && task14c.includes('**1.6:**'),
   '🔴 S14c новости напечатаны ИНТЕРВАЛОМ (1.4 → 9.9 показывает и 1.5, и 1.6)');
// T4 (2.2): нота миграции — тоже работа, и у неё обязано быть средство проверки в ТОМ ЖЕ шаге
// (TESTING_FRAMEWORK → «работа производит и средство своей проверки»). Интервал (1.4 → 9.9]
// уже включает 2.2, поэтому доезд ноты наблюдаем СЕЙЧАС, до релизного бампа версии.
// Примета — фраза, уникальная для САМОЙ НОТЫ. Голое 'AUTHOR_STYLOMETRY.md' зеленело бы мимо неё:
// имя приезжает в задание ещё и диффами модулей AGENT_GUIDE (поймано мутацией 2026-08-08).
ok(task14c.includes('**2.2:**')
   && task14c.includes('The owner\'s voice portrait now has a CANONICAL name'),
   '🔴 S14c нота 2.2 доехала до задания: канон-имя портрета названо полю');
ok(task14c.includes('stale-claims') && task14c.includes('PROJECT_NOTES.md'),
   '🔴 S14c протухшее утверждение «KAIF 1.4» в проектном доке найдено машинерией (П9)');
// NDim R2: помеченная маркером строка НЕ в хитах (примета — форма хита «· <файл>:», как в
// ассерте bugs/54 ниже: голое имя файла зеленело бы мимо, попав в задание другой дорогой)
ok(!task14c.includes('· PROJECT_NOTES_OK.md:'),
   '🔴 S14c (NDim R2): строка с маркером KAIF-VERSION-OK оправдана НАВСЕГДА — скан молчит');
// bugs/54: тот же скан обязан ПРОМОЛЧАТЬ о владельческом портрете. Примета — ФОРМА хита
// «· <файл>:<строка> — », уникальная для раздела протухших утверждений; голое имя файла зеленело
// бы мимо неё, потому что нота 2.2 называет портрет прозой (ассерт выше) — тот же способ подмены
// стража чужой строкой, что мутация поймала в T4.
ok(!task14c.includes('· AUTHOR_STYLOMETRY.md:'),
   '🔴 S14c владельческий портрет НЕ предложен к правке: скан протухших утверждений его пропускает (bugs/54)');

// ---------------------------------------------------------------- S14d: deprecations — упразднение артефактов прошлых релизов
console.log('\n=== S14d: deprecations — нетронутое удаляется механически, правленное уходит в задачу ===');
const SRCD = join(ROOT, 'src-9.9-dep'); mkdirSync(SRCD);
let bundleD = readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), 'utf8');
// заменяем СУЩЕСТВУЮЩИЙ ключ меты — второй ключ JSON.parse молча перекрыл бы наш тестовый
// (поймано этим же тестом). С 2.4 сборка кладёт НЕПУСТОЙ массив (упразднён end-chat), поэтому
// фикстура заменяет ВЕСЬ массив по регэкспу, а не пустой литерал: no-op replace тихо оставлял
// боевые упразднения вместо тестовых, и ассерт про what-next краснел на чужих данных — ровно
// так свод упал в день рождения записи 2.4. Несовпадение — ошибка фикстуры, не молчание.
const depKeyRe = /"deprecations": \[[\s\S]*?\],/;
if (!depKeyRe.test(bundleD)) throw new Error('S14d fixture: ключ deprecations не найден в мете бандла');
bundleD = bundleD.replace(depKeyRe,
  '"deprecations": [{"path": ".claude/skills/what-next/SKILL.md", "reason": "retired in test"}, {"path": ".claude/skills/help-kaif/SKILL.md", "reason": "retired in test"}],');
// упразднённые файлы не должны ехать в новом бандле (иначе классификация их снова напишет)
const dropBlock = (text, p) => text.replace(new RegExp('^> \\*\\*FILE: `' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
  '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n[\\s\\S]*?\\n' + FENCE + '\\n?', 'm'), '');
bundleD = dropBlock(bundleD, '.claude/skills/what-next/SKILL.md');
bundleD = dropBlock(bundleD, '.claude/skills/help-kaif/SKILL.md');
writeFileSync(join(SRCD, 'KAIF-CORE-BUNDLE.md'), bundleD);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRCD, 'KAIF-CORE.mjs'));
const manD = JSON.parse(readFileSync(join(SRC, 'kaif-manifest.json'), 'utf8'));
manD.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRCD, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRCD, 'kaif-manifest.json'), JSON.stringify(manD, null, 2) + '\n');
const S14d = join(ROOT, 's14d'); mkdirSync(S14d); seed(S14d);
must(run, S14d, 'install');
// help-kaif правим локально (должен уцелеть и попасть в задачу), what-next не трогаем (должен удалиться)
const HK = join(S14d, '.claude/skills/help-kaif/SKILL.md');
writeFileSync(HK, readFileSync(HK, 'utf8') + '\nLOCAL EDIT ON DEPRECATED\n');
r = run(S14d, `update --source ${SRCD}`);
ok(r.code === 0, 'S14d update с deprecations exit 0', r.out);
ok(!existsSync(join(S14d, '.claude/skills/what-next/SKILL.md')) && /retired .*what-next/.test(r.out),
   '🔴 S14d нетронутый упразднённый артефакт УДАЛЁН механически (T10 мёртв)');
ok(existsSync(HK) && readFileSync(HK, 'utf8').includes('LOCAL EDIT ON DEPRECATED'),
   'S14d правленный упразднённый — НЕ удалён');
const task14d = readFileSync(join(S14d, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task14d.includes('deprecations') && task14d.includes('help-kaif'),
   'S14d правленный упразднённый вынесен пунктом задачи');

// ------------------------------------------------- S14e: bugs/57 — ДВА интервала bootstrap подряд
// Ветка «задача несёт чек-поинты — не перезаписываем» (bugs/14) была завязана на НАЛИЧИЕ
// чек-поинтов, а не на интервал версий: прерванный bootstrap на 2.2 с одним чек-поинтом делал
// следующий bootstrap на 2.3 МОЛЧАЛИВОЙ потерей — задача оставалась от 2.2, поставка интервала
// 2.3 (policy-changes, новости, диффы конфликтных модулей) не писалась НИКУДА, а маркер,
// расписка и history уже переезжали на 2.3, после чего update-verify зеленел по ЧУЖОМУ
// чек-листу. Для анонимных и pre-1.5 развёртываний bootstrap — единственная дорога обновления.
console.log('\n=== S14e: два интервала bootstrap подряд — чек-поинт прошлого не съедает поставку нового (bugs/57) ===');
// два синтетических апстрима с РАЗНЫМИ приметами: примета обязана быть уникальной для СВОЕГО
// интервала, иначе ассерт «поставка доехала» зеленел бы на новостях соседа
const mkSrcE = (ver, marker) => {
  const d = join(ROOT, 'src-e-' + ver); mkdirSync(d);
  let b = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
  b = editBundleModule(b, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', marker));
  const patched = b.replace(`"version": "${CUR}"`, `"version": "${ver}"`);
  if (patched === b) throw new Error(`bundle meta version patch was a NO-OP for ${ver}`);
  writeFileSync(join(d, 'KAIF-CORE-BUNDLE.md'), patched);
  cpSync(join(DIST, 'KAIF-CORE.mjs'), join(d, 'KAIF-CORE.mjs'));
  return d;
};
const SRC_E1 = mkSrcE('9.6', 'UPSTREAM-NEWS-E1');
const SRC_E2 = mkSrcE('9.7', 'UPSTREAM-NEWS-E2');
const S14e = join(ROOT, 's14e'); mkdirSync(S14e); seed(S14e);
must(run, S14e, 'install');
// законная дивергенция владельца в том же модуле, который меняет апстрим → конфликт в обоих интервалах
const P14e = join(S14e, 'PHILOSOPHY.md');
const p14e = splitModules(readFileSync(P14e, 'utf8'));
p14e[2].lines.push('', 'LOCAL OWNER EDIT (S14e)');
writeFileSync(P14e, joinModules(p14e));
seed(S14e, SRC_E1);
r = run(S14e, 'install');
ok(r.code === 0, 'S14e bootstrap → 9.6 exit 0', r.out);
const taskE1 = readFileSync(join(S14e, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(taskE1.includes('UPSTREAM-NEWS-E1'), 'S14e поставка первого интервала доехала до задачи');
r = run(S14e, 'checkpoint review-news');
ok(r.code === 0, 'S14e чек-поинт записан (сессия прервалась ровно здесь)', r.out);
// второй интервал приезжает поверх ПРЕРВАННОЙ задачи
seed(S14e, SRC_E2);
r = run(S14e, 'install');
ok(r.code === 0, 'S14e bootstrap → 9.7 exit 0', r.out);
const taskE2 = readFileSync(join(S14e, 'KAIF_UPDATE_TASK.md'), 'utf8');
// критерий приёмки bugs/57, исход A. Примета — H1 задачи И поставка интервала В ЗАДАЧЕ:
// голый grep по дереву зеленел бы мимо фикса, потому что бандл-источник в .kaif/install/
// несёт ту же строку по построению (поймано замером ДО правки)
ok(taskE2.split('\n')[0].includes('finish the update to 9.7'),
   '🔴 S14e задача перегенерирована под НОВЫЙ интервал (H1 говорит 9.7, не 9.6)', taskE2.split('\n')[0]);
ok(taskE2.includes('UPSTREAM-NEWS-E2'),
   '🔴 S14e поставка ВТОРОГО интервала доехала до задачи (была потеряна молча)');
// и ничего не потеряно из первого: чек-поинт и его поставка живут в superseded-копии
const asideE = join(S14e, 'KAIF_UPDATE_TASK.superseded.md');
ok(existsSync(asideE), '🔴 S14e прерванная задача сохранена superseded-копией');
const asideTxt = existsSync(asideE) ? readFileSync(asideE, 'utf8') : '';
ok(asideTxt.includes('KAIF-UPDATE: review-news done') && asideTxt.includes('UPSTREAM-NEWS-E1'),
   '🔴 S14e superseded-копия несёт И записанный чек-поинт, И поставку первого интервала');
ok(/WITH recorded checkpoints/.test(r.out),
   'S14e лог называет РОД сохранённого — задача с записанными чек-поинтами, а не просто «unfinished»', r.out.slice(-400));
const mkE = JSON.parse(readFileSync(join(S14e, '.kaif', 'kaif.json'), 'utf8'));
const luE = JSON.parse(readFileSync(join(S14e, '.kaif', 'last-update.json'), 'utf8'));
ok(mkE.version === '9.7' && luE.to === '9.7' && luE.from === '9.6',
   'S14e маркер и расписка согласны с задачей (9.6 → 9.7)', `${mkE.version} · ${luE.from}→${luE.to}`);
// «не трогать» соседей: re-run ТОЙ ЖЕ версии с чек-поинтами обязан сохранять задачу побайтно
const beforeRerun = readFileSync(join(S14e, 'KAIF_UPDATE_TASK.md'));
must(run, S14e, 'checkpoint recheck');
const withTick = readFileSync(join(S14e, 'KAIF_UPDATE_TASK.md'));
seed(S14e, SRC_E2);
r = run(S14e, 'install');
ok(r.out.includes('carries recorded checkpoints') && readFileSync(join(S14e, 'KAIF_UPDATE_TASK.md')).equals(withTick),
   '🔴 S14e «не трогать»: re-run ТОЙ ЖЕ версии по-прежнему сохраняет задачу побайтно (bugs/14)',
   r.out.slice(-300));
ok(!beforeRerun.equals(withTick), 'S14e контроль фикстуры: чек-поинт действительно изменил задачу');

// ---------------------------------------------------------------- S15: issue #8 — явный --mode на легаси-ветке
// Полевой дефект (QA_Engineer): update-by-bootstrap АНОНИМНОГО 1.6 с явным --mode standard
// разворачивал файлы как standard, а маркер наследовал tracking: anonymous без origin — один
// флаг, два поведения, и все потребители маркера верили маркеру (version отвечал anonymous,
// update отказывал, петля сигналов оставалась локальной). Явный флаг обязан либо ДВИНУТЬ маркер
// (anonymous → origin, с переходом в логе), либо отказать ДО первой записи; неявный дефолт
// по-прежнему наследует маркер (S2-инвариант bug 11 не трогаем).
// [TESTED: 2026-08-21 · красный доказан прогоном против dist ДО пересборки (три ассерта S15/S15c)]
console.log('\n=== S15: issue #8 — явный --mode на легаси-ветке ===');
const LEGACY_ANON_16 = { framework: 'KAIF', version: '1.6', released: '2026-07-24',
  tracking: 'anonymous', sphere: 'programming', agents: ['claude-code'], language: 'en' };
const S15 = join(ROOT, 's15'); mkdirSync(S15); seed(S15);
writeFileSync(join(S15, '.kaif', 'kaif.json'), JSON.stringify(LEGACY_ANON_16, null, 2) + '\n');
r = run(S15, `install --mode standard --agents claude-code --baseline ${join(ROOT, 'no-baseline-s15')}`);
ok(r.code === 0, 'S15 install --mode standard exit 0', r.out.slice(-400));
const mk15 = JSON.parse(readFileSync(join(S15, '.kaif', 'kaif.json'), 'utf8'));
ok(mk15.tracking === 'origin' && mk15.origin === 'https://github.com/MikalaiKryvusha/KAIF',
   'S15 маркер: переход anonymous → origin ЗАПИСАН (tracking + адрес origin)',
   `tracking=${mk15.tracking} origin=${mk15.origin || '(нет)'}`);
ok(/tracking anonymous → origin/.test(r.out), 'S15 переход назван в логе прогона', r.out.slice(-400));
ok(existsSync(join(S15, '.claude', 'skills', 'kaif-update', 'SKILL.md')),
   'S15 дерево standard: origin-tied навык развёрнут — файлы и маркер говорят одно');
// контроль: БЕЗ явного флага анонимное легаси остаётся анонимным (наследование — не переход)
const S15b = join(ROOT, 's15b'); mkdirSync(S15b); seed(S15b);
writeFileSync(join(S15b, '.kaif', 'kaif.json'), JSON.stringify(LEGACY_ANON_16, null, 2) + '\n');
r = run(S15b, `install --agents claude-code --baseline ${join(ROOT, 'no-baseline-s15')}`);
ok(r.code === 0, 'S15b install без --mode exit 0', r.out.slice(-400));
const mk15b = JSON.parse(readFileSync(join(S15b, '.kaif', 'kaif.json'), 'utf8'));
ok(mk15b.tracking === 'anonymous' && !mk15b.origin,
   'S15b без явного флага маркер остаётся anonymous (наследование не подменено переходом)',
   `tracking=${mk15b.tracking}`);
// отказ: явный --mode anonymous поверх ОТСЛЕЖИВАЕМОГО маркера — стоп ДО первой записи
const S15c = join(ROOT, 's15c'); mkdirSync(S15c); seed(S15c);
writeFileSync(join(S15c, '.kaif', 'kaif.json'), JSON.stringify({ ...LEGACY_ANON_16,
  tracking: 'origin', origin: 'https://github.com/MikalaiKryvusha/KAIF' }, null, 2) + '\n');
r = run(S15c, 'install --mode anonymous --agents claude-code');
ok(r.code !== 0 && /--mode anonymous contradicts the deployed marker/.test(r.out),
   'S15c отказ: явный --mode anonymous против tracking origin — стоп с объяснением', r.out.slice(-400));
ok(!existsSync(join(S15c, 'AGENT_GUIDE.md')) && !existsSync(join(S15c, '.gitignore')),
   'S15c отказ случился ДО первой записи в дерево');

// ---------------------------------------------------------------- S16 (bugs/99 №1/№2): счётчики финальной строки считают ДИСК
// 99.1: `translated` брался как размер языкового пакета В БАНДЛЕ — установка поверх живых
// владельческих GOAL.md/KAIF_FRAMEWORK.md печатала «8 owner docs templated» при 6 записанных
// (между числом и диском стоят writeIfNew и OWNER_SEEDED). 99.2: logPackHonesty считал по
// списку НАМЕРЕНИЯ без фильтра анонимности — «all 35 skill bodies» строкой выше честного
// «31 skills trigger-aliased» одного и того же прогона. Доктрина одна — bugs/65: счётчик
// сводки читает диск, никогда план.
// [TESTED: 2026-08-21 · красный доказан прогоном против dist ДО пересборки: «8 owner docs
//  templated» при 6 записанных; bodies=35 при aliased=31]
console.log('\n=== S16 (99.1/99.2): счётчики установки — диск, не план ===');
const S16 = join(ROOT, 's16'); mkdirSync(S16); seed(S16);
writeFileSync(join(S16, 'GOAL.md'), '# OWNER GOAL\n\nThis is the owner. Not a template.\n');
writeFileSync(join(S16, 'KAIF_FRAMEWORK.md'), '# OWNER FRAMEWORK\n\nOwner text.\n');
r = run(S16, 'install --lang ru --mode anonymous');
ok(r.code === 0, 'S16 install exit 0', r.out.slice(-300));
ok(/= kept existing GOAL\.md/.test(r.out) && /= kept existing KAIF_FRAMEWORK\.md/.test(r.out),
   'S16 фикстура: оба владельческих файла оставлены как есть');
ok(/6 owner docs templated/.test(r.out) && !/8 owner docs templated/.test(r.out),
   'S16 (99.1): «owner docs templated» называет ЗАПИСАННОЕ на диск (6), не размер пакета (8)', r.out.slice(-400));
const mBodies = r.out.match(/all (\d+) skill bodies/);
const mAliased = r.out.match(/(\d+) skills trigger-aliased/);
ok(!!mBodies && !!mAliased && mBodies[1] === mAliased[1],
   'S16 (99.2): «skill bodies» и «skills trigger-aliased» называют ОДНО число (диск, анонимный фильтр учтён)',
   `bodies=${mBodies && mBodies[1]} aliased=${mAliased && mAliased[1]}`);
// контроль: чистая установка — все 8 документов пакета реально записаны, счёт не занижен
const S16b = join(ROOT, 's16b'); mkdirSync(S16b); seed(S16b);
r = run(S16b, 'install --lang ru --mode anonymous');
ok(/8 owner docs templated/.test(r.out),
   'S16b контроль: чистая установка называет 8 — дисковый счёт не занижает', r.out.slice(-300));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ все песочницы 5.5 зелёные'}`);
process.exit(failures ? 1 : 0);
