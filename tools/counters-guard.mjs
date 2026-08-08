#!/usr/bin/env node
// tools/counters-guard.mjs — страж КЛАССА «протухший счётчик прозы» (bugs/49; прародитель —
// bugs/09, урок EXP-0025 «число в тексте = цитата вывода инструмента»).
//
// Зачем: у факта «сколько чего в поставке» ЧЕТЫРЕ зеркала — строка счётчиков в AGENT_GUIDE,
// английская и русская половины README, и число сводов полигона (тоже в обеих половинах).
// Прежний страж реестра пар стерёг РОВНО ОДНО из них грепом по AGENT_GUIDE — и три остальных
// молча разошлись с реальностью (README утверждал 662 модуля при фактических 666).
// Этот инструмент сверяет ЖИВЫЕ числа со ВСЕМИ зеркалами разом.
//
// Живые источники (никакой арифметики в голове — только чтение артефактов):
//   встроенные файлы — framework/ (ключевые доки + README директорий + навыки + распаковщик),
//                      той же формулой, что и check-framework;
//   блоки бандла     — число `> **FILE:` в dist/KAIF-CORE-BUNDLE.md;
//   модули карты     — число записей в dist/kaif-module-map.json;
// ⚠️ РУССКОЕ ЗЕРКАЛО НЕСЁТ СКЛОНЯЕМОЕ СУЩЕСТВИТЕЛЬНОЕ: «691 модуль», но «689 модулей». Приметы
// стража нарочно терпимы к окончанию (`модул\S*`), поэтому механическая замена одного числа на
// другое оставляет зелёный прогон при ИСПОРЧЕННОЙ грамматике. Поменял число — прочитай строку
// вслух: согласование числительного машина не проверяет и не должна.
//   своды полигона   — длина списка SUITES в tools/sandbox-suite.mjs.
//
// Использование:
//   node tools/counters-guard.mjs              # сверка; exit 1 при расхождении
//   node tools/counters-guard.mjs --selftest   # ДОКАЗАТЬ, что страж умеет краснеть
//
// Гоняется в /end-chat и /release вместе с остальным реестром пар.
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from './lib/temp-root.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.argv.includes('--root')
  ? process.argv[process.argv.indexOf('--root') + 1] : join(HERE, '..'));

// --- живые числа ------------------------------------------------------------
// Ключевые доки поставки: тот же список, что у check-framework (хардкод-список ключевых —
// осознанный: их состав и есть решение владельца, а не содержимое каталога).
const DOC_NAMES = ['AGENT_GUIDE.md', 'PHILOSOPHY.md', 'BUG_FIXING_FRAMEWORK.md', 'TESTING_FRAMEWORK.md',
                   'REQUIREMENTS_FRAMEWORK.md', 'STATUS.md', 'PROJECT_HISTORY.md', 'EXPERIENCE.md',
                   'GOAL.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md',
                   'PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'KAIF_FRAMEWORK.md', 'KAIF_REFERENCE.md'];

function liveNumbers() {
  const fw = join(ROOT, 'framework');
  const docs = DOC_NAMES.filter((d) => existsSync(join(fw, d))).length;
  const readmes = readdirSync(join(fw, 'readmes')).filter((n) => n.endsWith('.md')).length;
  const skillsDir = join(fw, 'skills');
  // ИМЕНА, не только счёт (bugs/55 F1): переименование навыка счёт не меняет, поэтому страж,
  // знающий лишь длину списка, зеленеет на витрине, документирующей мёртвую команду.
  const skillNames = readdirSync(skillsDir).filter((n) => existsSync(join(skillsDir, n, 'SKILL.md'))).sort();
  const skills = skillNames.length;
  const unpackers = existsSync(join(fw, 'kaif-unpack.mjs')) ? 1 : 0;
  const embedded = docs + readmes + skills + unpackers;

  const bundle = readFileSync(join(ROOT, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
  const blocks = (bundle.match(/^> \*\*FILE:/gm) || []).length;

  const map = JSON.parse(readFileSync(join(ROOT, 'dist', 'kaif-module-map.json'), 'utf8'));
  // карта — объект { <dest>: [модули…] } либо { modules: […] }; считаем атомы, как печатает сборка
  const modules = Array.isArray(map.modules) ? map.modules.length
    : Object.values(map.files || map).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);

  // Инвентарь поставки, который витрина перечисляет ПРОЗОЙ в §8.2 (задача T11): адаптеры и
  // языковые пакеты. Их числа жили в тексте рукописными и разошлись молча — «девять адаптеров»
  // при десяти файлах, «шесть README директорий» при семи. Оба берутся из каталога, как всё
  // остальное на этой оси: счётчик прозы имеет право быть только ЦИТАТОЙ артефакта.
  // Контуры и принципы: числа с ВИТРИННЫХ бейджей (просьба владельца 2026-08-09). Живые источники —
  // инвентарь контуров во внутренней карте и заголовки принципов в PHILOSOPHY; бейдж с рукописным
  // числом протух бы первым, потому что его никто не перечитывает.
  const mapText = readFileSync(join(ROOT, 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md'), 'utf8');
  const contours = (mapText.match(/^\| \*\*[^*]*онтур[^*]*\*\*/gm) || [])
    .filter((l) => !/\| \*\*Контур\*\*/.test(l)).length;   // строка-заголовок таблицы не контур
  // Принципы: прайм-директива простоты (KISS + Оккам) плюс заголовки расширенного набора.
  const principles = (readFileSync(join(ROOT, 'PHILOSOPHY.md'), 'utf8').match(/^### /gm) || []).length + 1;

  const adaptersDir = join(fw, 'adapters');
  const adapters = readdirSync(adaptersDir)
    .filter((n) => n.endsWith('.md') && !n.startsWith('_')).length;   // _index/_template — не адаптеры
  const langs = readdirSync(join(fw, 'templates', 'languages'), { withFileTypes: true })
    .filter((e) => e.isDirectory()).length;

  const suite = readFileSync(join(ROOT, 'tools', 'sandbox-suite.mjs'), 'utf8');
  const suitesBlock = suite.match(/const SUITES = \[([\s\S]*?)\];/);
  const suites = suitesBlock ? (suitesBlock[1].match(/'s\d+/g) || []).length : 0;

  return { docs, readmes, skills, skillNames, unpackers, embedded, blocks, modules, suites, adapters, langs, contours, principles };
}

// --- зеркала ----------------------------------------------------------------
// Каждое зеркало: имя · файл · регэксп по НОРМАЛИЗОВАННОМУ тексту (переносы строк схлопнуты —
// проза врапается, и врап не должен ослеплять стража) · какие живые числа обязаны совпасть.
const flat = (s) => s.replace(/\r?\n>?\s*/g, ' ').replace(/\s+/g, ' ');

const MIRRORS = [
  { name: 'AGENT_GUIDE — строка счётчиков', file: 'AGENT_GUIDE.md',
    re: /= (\d+); бандл (\d+) блок\S* карта — (\d+) модул\S*/, keys: ['embedded', 'blocks', 'modules'] },
  { name: 'README EN — строка счётчиков', file: 'README.md',
    re: /= (\d+) embedded files; (\d+) bundle blocks; (\d+) modules/, keys: ['embedded', 'blocks', 'modules'] },
  { name: 'README RU — строка счётчиков', file: 'README.md',
    re: /= (\d+) встроенных файлов; (\d+) блок\S* бандла; (\d+) модул\S*/, keys: ['embedded', 'blocks', 'modules'] },
  { name: 'README EN — число сводов полигона', file: 'README.md',
    re: /sandbox polygon \((\d+) suites\)/, keys: ['suites'] },
  { name: 'README RU — число сводов полигона', file: 'README.md',
    re: /полигон \((\d+) свод\S*\)/, keys: ['suites'] },
  // STATUS сам объявляет себя зеркалом («цифры печатает сборка — не переписывай руками»), но до
  // плана 62 его не сверял никто: строка спокойно простояла на 671 модуле при фактических 672.
  // §8.2 раскладки репозитория — ОБЕ половины. Числа здесь переведены в цифры намеренно:
  // прописью их пришлось бы стеречь словарём на двух языках, а цифра сверяется одним регэкспом.
  // Это дешевле и честнее — зеркало, которое трудно проверить, не проверяют вовсе.
  // Бейджи витрины: число стоит В URL картинки, поэтому паттерн ловит его там.
  { name: 'README EN — бейдж контуров', file: 'README.md', re: /badge\/Contours-(\d+)-/, keys: ['contours'] },
  { name: 'README RU — бейдж контуров', file: 'README.md', re: /badge\/Контуров-(\d+)-/, keys: ['contours'] },
  { name: 'README EN — бейдж принципов', file: 'README.md', re: /badge\/Principles-(\d+)-/, keys: ['principles'] },
  { name: 'README RU — бейдж принципов', file: 'README.md', re: /badge\/Принципов-(\d+)-/, keys: ['principles'] },
  { name: 'README EN — §8.2 README директорий', file: 'README.md',
    re: /(\d+) directory READMEs/, keys: ['readmes'] },
  { name: 'README RU — §8.2 README директорий', file: 'README.md',
    re: /(\d+) README директорий/, keys: ['readmes'] },
  { name: 'README EN — §8.2 адаптеры систем', file: 'README.md',
    re: /(\d+) agent-system adapters/, keys: ['adapters'] },
  { name: 'README RU — §8.2 адаптеры систем', file: 'README.md',
    re: /(\d+) адаптер\S* агентских систем/, keys: ['adapters'] },
  { name: 'README EN — §8.2 языковые пакеты', file: 'README.md',
    re: /(\d+) language packs/, keys: ['langs'] },
  { name: 'README RU — §8.2 языковые пакеты', file: 'README.md',
    re: /(\d+) языков\S* пакет\S*/, keys: ['langs'] },
  { name: 'STATUS — строка «актуальная сборка»', file: 'STATUS.md',
    re: /\*\*(\d+) навы[а-я]*\*\* \/ (\d+) блок[а-я]* FULL \/ \*\*(\d+) бандла\*\* \/ \*\*(\d+) модул[а-я]*\*\*/,
    keys: ['skills', 'embedded', 'blocks', 'modules'] },
];

// --- ось «сколько НАВЫКОВ» (план 62 / задача T1) -----------------------------
// Тот же класс, что bugs/49, но по ДРУГОЙ оси: число навыков живёт не только в строке счётчиков,
// а ещё в alt-текстах обеих половин README, в SVG-генераторе, в прописи и — главное — в САМОМ
// ЧИСЛЕ СТРОК Таблицы 3. До T1 это были восемь рукописных «34», которые не стерёг никто:
// добавление навыка требовало вспомнить все восемь, а забытое место зеленело молча.
const SKILL_MIRRORS = [
  { name: 'README EN — alt-текст ритуалов', file: 'README.md', re: /Commands \((\d+) repeatable rituals/ },
  { name: 'README RU — alt-текст ритуалов', file: 'README.md', re: /Команды \((\d+) повторяем\S+ ритуал\S*/ },
  { name: 'SVG — счётчик ритуалов (генератор)', file: 'assets/layers-en-light.svg', re: /(\d+) repeatable rituals/ },
  { name: 'AGENT_GUIDE — навыки в строке счётчиков', file: 'AGENT_GUIDE.md', re: /(\d+) навык\S* \+ 1 распаковщик/ },
  { name: 'README EN — навыки в строке счётчиков', file: 'README.md', re: /(\d+) skills \+ 1 unpacker/ },
  { name: 'README RU — навыки в строке счётчиков', file: 'README.md', re: /(\d+) навык\S* \+ 1 распаковщик/ },
  // Седьмое и восьмое зеркала, найденные при письме витрины 2.2 (задача T11): раскладка репозитория
  // в §8.2 ОБЕИХ половин («skills/ NN шаблонов навыков»). Они прожили весь план 62 непокрытыми и
  // молча врали «34» при живых 35 — ровно то, ради чего эта ось существует. Урок класса: инвентарь
  // зеркал, собранный грепом по ЧИСЛУ, пропускает вхождения, где число стоит в другой формулировке;
  // ищи по ПОНЯТИЮ («навык», «skill»), а не по цифре.
  { name: 'README EN — §8.2 шаблоны навыков в раскладке', file: 'README.md', re: /(\d+) skill templates/ },
  { name: 'README RU — §8.2 шаблоны навыков в раскладке', file: 'README.md', re: /(\d+) шаблон\S* навыков/ },
];

// Таблица 3 — по строке на навык В КАЖДОЙ половине README. Пропущенную строку не видит НИ ОДИН
// счётчик прозы: числа сойдутся, а навыка в таблице не будет. Поэтому строки пересчитываются.
//
// СЧЁТА МАЛО (bugs/55 F1). Мощность множества — ПРОКСИ, а свойство — ТОЖДЕСТВО множеств: после
// переименования навыка строк остаётся столько же, и обе половины витрины документируют мёртвую
// команду при зелёном страже. Поэтому слаг ЗАХВАЧЕН группой и сверяется поимённо — по КАЖДОЙ
// половине отдельно (дубль в одной половине и пропажа в другой дают ту же сумму). Ширина
// паттерна не менялась: группа добавлена внутрь уже существовавшего класса символов.
const TABLE_ROW_RE = /^\| \**`\/([a-z-]+)`\**\s*\|/;
// Половины витрины (EN, затем RU) разделяются разрывом в номерах строк: внутри таблицы строки
// идут подряд, между таблицами лежит весь остальной README.
const HALF_GAP_LINES = 10;
const HALF_LABELS = ['EN', 'RU'];

/** Слаги строк Таблицы 3, разложенные по половинам витрины. */
function tableRowSlugs(readmeText) {
  const hits = [];
  readmeText.split(/\r?\n/).forEach((line, i) => {
    const m = TABLE_ROW_RE.exec(line);
    if (m) hits.push({ line: i + 1, slug: m[1] });
  });
  const halves = [[]];
  hits.forEach((h, i) => {
    if (i > 0 && h.line - hits[i - 1].line > HALF_GAP_LINES) halves.push([]);
    halves[halves.length - 1].push(h.slug);
  });
  return { total: hits.length, halves: hits.length ? halves : [] };
}

/** Симметрическая разность двух ростеров навыков — поимённо, обе стороны. */
function rosterDiff(where, actual, expected, findings) {
  const dupes = new Set(actual.filter((s, i) => actual.indexOf(s) !== i));
  for (const d of dupes) findings.push(`${where}: «/${d}» встречается дважды`);
  for (const s of actual) if (!expected.includes(s)) findings.push(`${where}: строка без навыка — /${s} (в framework/skills/ такого нет)`);
  for (const s of expected) if (!actual.includes(s)) findings.push(`${where}: навык без строки — /${s}`);
}

// Пропись — четыре места («Thirty-five skills» в README EN и KAIF_REFERENCE; «тридцать пять
// навыков» в README RU и AGENT_GUIDE). Карта намеренно узкая: ВНЕ диапазона страж honestly
// сообщает, что пропись не стережётся, — молчаливое зелёное здесь хуже отсутствия проверки.
const WORDS = {
  33: ['Thirty-three skills', 'тридцать три навыка'],
  34: ['Thirty-four skills', 'тридцать четыре навыка'],
  35: ['Thirty-five skills', 'тридцать пять навыков'],
  36: ['Thirty-six skills', 'тридцать шесть навыков'],
  37: ['Thirty-seven skills', 'тридцать семь навыков'],
  38: ['Thirty-eight skills', 'тридцать восемь навыков'],
  39: ['Thirty-nine skills', 'тридцать девять навыков'],
  40: ['Forty skills', 'сорок навыков'],
};
const WORD_FILES = [['README.md', 'en'], ['README.md', 'ru'],
                    ['framework/KAIF_REFERENCE.md', 'en'], ['AGENT_GUIDE.md', 'ru']];

function checkSkillAxis(live, findings) {
  for (const m of SKILL_MIRRORS) {
    const path = join(ROOT, m.file);
    if (!existsSync(path)) { findings.push(`${m.name}: файла нет — ${m.file}`); continue; }
    const hit = flat(readFileSync(path, 'utf8')).match(m.re);
    if (!hit) { findings.push(`${m.name}: счётчик навыков НЕ НАЙДЕН в ${m.file} (переформулирован? — страж ослеп, почини паттерн)`); continue; }
    const found = Number(hit[1]);
    if (found !== live.skills) findings.push(`${m.name} (${m.file}): skills — ожидалось ${live.skills}, найдено ${found}`);
  }

  // строки Таблицы 3 — обе половины README: сначала СЧЁТ (ловит дубли), затем ИМЕНА (ловит
  // переименование, которое счёт пропускает). Проверка имён ДОБАВЛЕНА к счёту, а не заменила его.
  const { total: rows, halves } = tableRowSlugs(readFileSync(join(ROOT, 'README.md'), 'utf8'));
  if (rows !== live.skills * 2) {
    findings.push(`README — строк Таблицы 3: ожидалось ${live.skills * 2} (${live.skills} × две половины), найдено ${rows} — у навыка нет строки в одной из таблиц`);
  }
  if (halves.length !== HALF_LABELS.length) {
    findings.push(`README — Таблица 3: ожидалось ${HALF_LABELS.length} половины витрины, найдено кластеров строк — ${halves.length} (страж ослеп: почини разбиение или паттерн)`);
  } else {
    halves.forEach((half, i) => rosterDiff(`README ${HALF_LABELS[i]} — Таблица 3`, half, live.skillNames, findings));
  }

  // пропись
  const words = WORDS[live.skills];
  if (!words) {
    console.log(`⚠️  пропись числа навыков НЕ СТЕРЕЖЁТСЯ при ${live.skills}: расширь карту WORDS в tools/counters-guard.mjs`);
    return;
  }
  const wrong = Object.entries(WORDS).filter(([n]) => Number(n) !== live.skills);
  for (const [file, lang] of WORD_FILES) {
    const path = join(ROOT, file);
    if (!existsSync(path)) { findings.push(`пропись (${file}): файла нет`); continue; }
    const text = flat(readFileSync(path, 'utf8'));
    const want = lang === 'en' ? words[0] : words[1];
    if (!text.includes(want)) findings.push(`пропись (${file}, ${lang}): не найдено «${want}»`);
    for (const [n, w] of wrong) {
      const stale = lang === 'en' ? w[0] : w[1];
      if (text.includes(stale)) findings.push(`пропись (${file}, ${lang}): протухшая пропись «${stale}» (число навыков — ${live.skills}, не ${n})`);
    }
  }
}

// --- ось ЯЗЫКОВЫХ ПАКЕТОВ (bugs/55, третье вхождение класса) -------------------
// Пара реестра «состав навыков ↔ ключи 9 языковых пакетов» сверялась однострочником, который
// сравнивал ГОЛЫЙ СЧЁТ ключей. Тот же прокси, что F1: переименование навыка счёт не меняет, а
// пакет остаётся с алиасами мёртвой команды. `check-framework` §5f эти файлы намеренно пропускает
// («машинерия алиасов, не локализация шаблона») — значит по именам их не сверял никто.
const LANG_ROOT = ['framework', 'templates', 'languages'];
const TRIGGERS_FILE = 'skill-triggers.json';

function checkLanguagePacks(live, findings) {
  const root = join(ROOT, ...LANG_ROOT);
  if (!existsSync(root)) { findings.push(`языковые пакеты: каталога нет — ${LANG_ROOT.join('/')}`); return 0; }
  const langs = readdirSync(root).filter((l) => existsSync(join(root, l, TRIGGERS_FILE)));
  if (!langs.length) { findings.push(`языковые пакеты: ни одного ${TRIGGERS_FILE} — страж ослеп`); return 0; }
  for (const lang of langs) {
    let keys;
    try { keys = Object.keys(JSON.parse(readFileSync(join(root, lang, TRIGGERS_FILE), 'utf8'))); }
    catch (e) { findings.push(`языковой пакет ${lang}: ${TRIGGERS_FILE} не читается — ${e.message}`); continue; }
    rosterDiff(`языковой пакет ${lang}`, keys, live.skillNames, findings);
  }
  return langs.length;
}

function check() {
  const live = liveNumbers();
  const findings = [];
  for (const m of MIRRORS) {
    const path = join(ROOT, m.file);
    if (!existsSync(path)) { findings.push(`${m.name}: файла нет — ${m.file}`); continue; }
    const hit = flat(readFileSync(path, 'utf8')).match(m.re);
    if (!hit) { findings.push(`${m.name}: строка счётчиков НЕ НАЙДЕНА в ${m.file} (переформулирована? — страж ослеп, почини паттерн)`); continue; }
    m.keys.forEach((k, i) => {
      const found = Number(hit[i + 1]);
      if (found !== live[k]) findings.push(`${m.name} (${m.file}): ${k} — ожидалось ${live[k]}, найдено ${found}`);
    });
  }
  checkSkillAxis(live, findings);
  const langs = checkLanguagePacks(live, findings);
  console.log(`counters: ${live.embedded} embedded (${live.docs} docs + ${live.readmes} readmes + ` +
              `${live.skills} skills + ${live.unpackers} tools) · bundle ${live.blocks} blocks · ` +
              `${live.modules} modules · polygon ${live.suites} suites`);
  for (const f of findings) console.error('✖ ' + f);
  if (findings.length) {
    console.error(`\n❌ counters-guard: ${findings.length} расхождений — числа в прозе обязаны быть ЦИТАТОЙ вывода инструментов (EXP-0025, bugs/49)`);
    return 1;
  }
  // Зеркала считаются, а не пишутся прозой: языковые пакеты приходят из каталога, поэтому
  // заморозка или оживление пакета (решения №56/№57) сдвинет число само.
  const mirrorCount = MIRRORS.length + SKILL_MIRRORS.length + 1 /* строки Таблицы 3 */ + WORD_FILES.length + langs;
  console.log(`✅ counters OK — ${mirrorCount} зеркал сверены с живыми числами (в т.ч. ось навыков ПОИМЁННО: alt-тексты, SVG, пропись, строки Таблицы 3 обеих половин, ключи ${langs} языковых пакетов)`);
  return 0;
}

// --- selftest: страж, который ни разу не краснел, ничего не доказывает -------
// Копируем ровно то, что читает страж, портим ОДНО число в README и требуем красного.
function selftest() {
  // Корень УНИКАЛЕН по построению (bugs/59): `--selftest` рядом с обычным прогоном — ровно тот
  // сценарий, в котором фиксированное имя в общем OS-temp давало ложный красный.
  const SBX = tempRoot('counters-guard-selftest');
  mkdirSync(join(SBX, 'tools'), { recursive: true });
  // assets/ нужен оси навыков: SVG-генератор — одно из её зеркал (без копии страж
  // отчитался бы «файла нет» и красный зачёлся бы там, где ничего не ломали)
  for (const rel of ['framework', 'dist', 'assets']) cpSync(join(ROOT, rel), join(SBX, rel), { recursive: true });
  cpSync(join(ROOT, 'tools', 'sandbox-suite.mjs'), join(SBX, 'tools', 'sandbox-suite.mjs'));
  // ЧИТАЕМЫЕ СТРАЖЕМ КОРНЕВЫЕ ФАЙЛЫ — список один на всю песочницу и растёт вместе с осями.
  // Оси бейджей (контуры, принципы) добавили сюда внутреннюю карту и PHILOSOPHY, а копия — нет:
  // селфтест валился на `ENOENT` внутри первой же проверки «чистая копия — зелёный», то есть
  // страж перестал уметь доказывать свой красный, и заметил это не он сам, а прогон соседней
  // задачи. Отсюда правило: завёл живой источник — впиши файл СЮДА тем же движением.
  const ROOT_FILES = ['AGENT_GUIDE.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'PHILOSOPHY.md'];
  for (const f of ROOT_FILES) cpSync(join(ROOT, f), join(SBX, f));
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const live = liveNumbers();

  const guide = readFileSync(join(ROOT, 'AGENT_GUIDE.md'), 'utf8');
  // Оригиналы всех мутируемых зеркал в одном месте: страж читает три файла, значит все три
  // обязаны существовать в песочнице — иначе «чистая копия» покраснела бы от отсутствия файла.
  // Плюс один языковой пакет — ось ключей мутируется тем же механизмом (bugs/55, вхождение 3).
  const PACK_REL = 'framework/templates/languages/ru/skill-triggers.json';
  const ORIGINALS = { 'README.md': readme, 'AGENT_GUIDE.md': guide,
                      'STATUS.md': readFileSync(join(ROOT, 'STATUS.md'), 'utf8'),
                      [PACK_REL]: readFileSync(join(ROOT, PACK_REL), 'utf8') };
  const run = () => {
    try { execFileSync(process.execPath, [join(HERE, 'counters-guard.mjs'), '--root', SBX], { stdio: 'pipe' }); return 0; }
    catch (e) { return e.status ?? 1; }
  };
  // Мутация обязана НАЙТИ свою цель: молча не совпавший replace оставил бы копию чистой, и
  // «красный» зачёлся бы там, где ничего не ломали (страж, проверяющий сам себя, — тоже страж).
  const mutate = (file, from, to) => {
    const src = ORIGINALS[file];
    if (!src.includes(from)) { console.log(`❌ selftest: цель мутации не найдена в ${file}: "${from}"`); return false; }
    writeFileSync(join(SBX, file), src.split(from).join(to));
    return true;
  };
  const restore = () => { for (const [f, src] of Object.entries(ORIGINALS)) writeFileSync(join(SBX, f), src); };

  // Цель мутации в РУССКОЙ прозе берётся ИЗ ТЕКСТА тем же паттерном, каким её ищет сверка, а не
  // собирается конкатенацией с угаданным окончанием: числительное согласуется («161 блок», но
  // «157 блоков»), и зашитая форма молча разъезжается с текстом при переходе через 1/2–4/5–20 —
  // селфтест начинает падать на «цель мутации не найдена» там, где ничего не ломали (bugs/60).
  // Мутируется ЧИСЛО, словоформа сохраняется дословно.
  const retarget = (text, re) => text.match(re);
  const g = retarget(guide, /бандл (\d+) (блок\S*)/);
  const rSuites = retarget(readme, /полигон \((\d+) (свод\S*)\)/);
  const sModules = retarget(ORIGINALS['STATUS.md'], /\*\*(\d+) (модул\S*)\*\*/);

  // (1) нетронутая копия — зелёный
  restore();
  const clean = run();
  // (2) испорченное число модулей в README EN — обязан покраснеть
  const hitEn = mutate('README.md', `${live.modules} modules`, `${live.modules + 4} modules`);
  const brokenEn = run(); restore();
  // (3) испорченное число сводов в README RU — обязан покраснеть
  const hitRu = Boolean(rSuites) && mutate('README.md', rSuites[0], `полигон (${live.suites - 1} ${rSuites[2]})`);
  const brokenRu = run(); restore();
  // (4) испорченное число блоков в AGENT_GUIDE — зеркало, РАДИ которого страж и писался
  //     (находка судьи O3: selftest доказывал 2 зеркала из 5 и заявлял «на обоих»)
  const hitGuide = Boolean(g) && mutate('AGENT_GUIDE.md', g[0], `бандл ${live.blocks + 7} ${g[2]}`);
  const brokenGuide = run(); restore();
  // (5) ось НАВЫКОВ, зеркало 1 — alt-текст ритуалов в README EN (план 62 / T1)
  const hitAlt = mutate('README.md', `Commands (${live.skills} repeatable rituals`,
                                     `Commands (${live.skills + 1} repeatable rituals`);
  const brokenAlt = run(); restore();
  // (6) ось НАВЫКОВ, зеркало 2 — выломанная строка Таблицы 3: ЕДИНСТВЕННАЯ проверка, ловящая
  //     «навык есть, а строки в таблице нет» (числа прозы при этом сходятся)
  const hitRow = mutate('README.md', '| `/what-next` | Rank', '| WHAT-NEXT | Rank');
  const brokenRow = run(); restore();
  // (7) ось НАВЫКОВ, зеркало 3 — протухшая ПРОПИСЬ: цифра сойдётся, а слово соврёт
  const w = WORDS[live.skills], wPrev = WORDS[live.skills - 1];
  const hitWord = Boolean(w && wPrev) && mutate('AGENT_GUIDE.md', w[1], wPrev[1]);
  const brokenWord = run(); restore();
  // (8) STATUS — зеркало, которое до плана 62 не сверялось ничем и успело протухнуть по-настоящему
  const hitStatus = Boolean(sModules) && mutate('STATUS.md', sModules[0], `**${live.modules - 8} ${sModules[2]}**`);
  const brokenStatus = run(); restore();
  // (9) ось НАВЫКОВ, зеркало 4 — ПЕРЕИМЕНОВАННЫЙ навык (bugs/55 F1). Единственный кейс, который
  //     ловит расхождение ИМЁН: строк остаётся столько же, все числа сходятся, а обе половины
  //     витрины документируют мёртвую команду. Ломаем ОДНУ половину — счёт при этом честно 70.
  const hitRename = mutate('README.md', '| `/what-next` | Rank', '| `/whats-next` | Rank');
  const brokenRename = run(); restore();
  // (10) ось НАВЫКОВ, зеркало 5 — ключ языкового пакета (bugs/55, третье вхождение класса):
  //      реестр сверял голый счёт ключей, и переименование навыка проходило мимо всех девяти.
  const hitPack = mutate(PACK_REL, '"what-next"', '"whats-next"');
  const brokenPack = run(); restore();

  const results = [
    [clean === 0, 'чистая копия — зелёный'],
    [hitEn && brokenEn === 1, 'испорченные modules в README EN — КРАСНЫЙ'],
    [hitRu && brokenRu === 1, 'испорченное число сводов в README RU — КРАСНЫЙ'],
    [hitGuide && brokenGuide === 1, 'испорченное число блоков в AGENT_GUIDE — КРАСНЫЙ'],
    [hitAlt && brokenAlt === 1, 'испорченный alt-текст ритуалов в README EN — КРАСНЫЙ'],
    [hitRow && brokenRow === 1, 'выломанная строка Таблицы 3 — КРАСНЫЙ'],
    [hitWord && brokenWord === 1, 'протухшая пропись числа навыков в AGENT_GUIDE — КРАСНЫЙ'],
    [hitStatus && brokenStatus === 1, 'испорченное число модулей в STATUS — КРАСНЫЙ'],
    [hitRename && brokenRename === 1, 'ПЕРЕИМЕНОВАННЫЙ навык в Таблице 3 (счёт сходится) — КРАСНЫЙ'],
    [hitPack && brokenPack === 1, 'ПЕРЕИМЕНОВАННЫЙ ключ языкового пакета (счёт сходится) — КРАСНЫЙ'],
  ];
  for (const [pass, name] of results) console.log(`${pass ? '✅' : '❌'} selftest: ${name}`);
  const ok = results.every(([p]) => p);
  console.log(ok ? `✅ counters-guard selftest OK — страж доказан красным на ${results.length - 1} зеркалах: README EN/RU + AGENT_GUIDE + STATUS (ось поставки) и alt-текст + строка Таблицы 3 + пропись + ПЕРЕИМЕНОВАНИЕ навыка в витрине и в языковом пакете (ось навыков — счёт И имена)`
                 : '❌ counters-guard selftest ПРОВАЛЕН');
  return ok ? 0 : 1;
}

process.exit(process.argv.includes('--selftest') ? selftest() : check());
