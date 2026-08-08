#!/usr/bin/env node
// tools/showcase-lint.mjs — страж ВИТРИНЫ (README + релиз-ноты), фаза Q, лекарства Q1–Q3.
//
// ЗАЧЕМ. Владелец за один проход глазами нашёл на витрине 2.2 двадцать с лишним дефектов, и его же
// диагноз объяснил почти всю волну: «такое ощущение, что ты пишешь английский, но русскими
// словами». Ни один инструмент проекта этот класс не ловил: `voice-lint` судит голос по портрету,
// `counters-guard` — числа, `doc-header-lint` — шапки рабочих документов. Витрину не судил никто, а
// именно её читает посторонний человек.
//
// ГРАНИЦА ОТ СОСЕДЕЙ, названная вслух:
//   · `voice-lint` отвечает на вопрос «похоже ли на голос владельца» по правилам портрета;
//     этот страж — на вопрос «написано ли это ДЛЯ ЧИТАТЕЛЯ, а не для судьи и не для себя»;
//   · он судит ТОЛЬКО файлы витрины (README.md, reports/RELEASE_NOTES_*.md). В рабочих документах
//     мета-приписки, внутренний словарь и провенанс чисел законны и полезны — там их читает агент;
//   · он не судит вкус. Красный означает «правило волны нарушено», а «красиво/не красиво» остаётся
//     вердиктом владельца (`AGENT_GUIDE.md` → «Класс "вкус"»).
//
// Использование:
//   node tools/showcase-lint.mjs                      # README.md + все reports/RELEASE_NOTES_*.md
//   node tools/showcase-lint.mjs <файл.md> [ещё…]     # явный список
//   node tools/showcase-lint.mjs --selftest           # красный на каждом классе И молчание на чистом
//
// [TESTED: 2026-08-09 · --selftest: каждый жёсткий класс доказан ОБОИМИ ответами — красный на
//  подсунутом нарушении и молчание на чистой фикстуре (EXP-0059); формы взяты дословно из волны
//  владельца, разобранной в plans/67 и plans/68.]

import fs from 'node:fs';
import path from 'node:path';

const HARD = 'HARD';
const SOFT = 'SOFT';

// ── Классы правил ──────────────────────────────────────────────────────────────────────────────
// Каждая запись: id · уровень · человеческое имя · формы · строка «что делать».
// Формы записаны так, как они звучали в волне, — не как обобщение по памяти: обобщённое правило
// ловит воздух, а дословная форма ловит рецидив (EXP-0070 — грепи по ПОНЯТИЮ, но проверяй по факту).

const CLASSES = [
  {
    id: 'META',
    level: HARD,
    name: 'описание устройства собственного текста (АП30)',
    fix: 'удали предложение: читателю не нужен рассказ о том, как устроен документ, который он читает',
    forms: [
      /отведен[аоы]?\s+(сво[йяею]|отдельн\S+)\s+(строка|раздел|колонка|место)/giu,
      /настоящ(?:ий|ее|его|ем)\s+(?:документ|руководств\S*)/giu,
      /в\s+руководстве\s+(?:описан\S*|перечислен\S*|приведен\S*)/giu,
      /\bthis\s+(?:document|manual)\s+(?:is|describes|counts|lists)\b/gi,
      /\bthe\s+manual\s+(?:counts|lists|describes)\b/gi,
      /\ba\s+(?:row|line|section)\s+of\s+its\s+own\b/gi,
    ],
  },
  {
    id: 'EXCUSE',
    level: HARD,
    name: 'оправдание числа припиской (АП29)',
    fix: 'вычеркни приписку: провенанс живёт в рабочем документе, на витрине стоит число',
    forms: [
      /\((?:измерено|замер|замерено|подсчитано|посчитано|по\s+данным\s+прогона)[^)]*\)/giu,
      /явля\S*\s+цитат\S+\s+(?:этого\s+)?прогона/giu,
      /числа?\s+(?:в\s+не[ий]\s+)?печатает\s+(?:сама\s+)?сборка/giu,
      /каждое\s+число\s+(?:ниже|выше)/giu,
      /\((?:measured|counted|computed|taken)\s+[^)]*\)/gi,
      /\bis\s+a\s+quote\s+of\s+(?:this|the)\s+run\b/gi,
      /\bthe\s+build\s+prints\s+(?:these|the)\s+numbers?\b/gi,
    ],
  },
  {
    id: 'BACKSTAGE',
    level: HARD,
    name: 'намёк на второй уровень вне текста (АП31)',
    fix: 'пиши прямой констатацией: что есть, то и названо, закулисья у витрины нет',
    forms: [
      /(?<![А-Яа-яЁё-])в\s+действительности(?![А-Яа-яЁё-])/giu,
      /(?<![А-Яа-яЁё-])на\s+самом\s+деле(?![А-Яа-яЁё-])/giu,
      /(?<![А-Яа-яЁё-])строго\s+говоря(?![А-Яа-яЁё-])/giu,
      /\bin\s+reality\b/gi,
      /\bstrictly\s+speaking\b/gi,
      /\bin\s+fact\b/gi,
    ],
  },
  {
    id: 'DENIAL',
    level: HARD,
    name: 'отрицание, подрывающее только что названное число (АП32)',
    fix: 'убери отрицание: условие уже стоит в названии строки, два факта рядом сильнее пояснения',
    forms: [
      /эт(?:и|о)\s+деньги\s+(?:НЕ|не)\s+плат\S+/giu,
      /(?:и|а)\s+(?:эти\s+)?(?:деньги|часы|токены)\s+не\s+(?:плат\S+|трат\S+|расходов\S+)/giu,
      /\bthis\s+money\s+was\s+(?:NOT|not)\s+paid\b/gi,
      /\bwas\s+never\s+(?:paid|spent)\b/gi,
    ],
  },
  {
    id: 'CALQUE',
    level: HARD,
    name: 'калька: английская фраза русскими словами (АП27)',
    fix: 'скажи ту же мысль по-русски заново, не глядя на первый вариант',
    forms: [
      // «ships as a knowledge directory» → «едет директорией знаний»: глагол доставки, которым
      // по-русски не доставляют. В рабочих документах это наш жаргон, на витрине — калька.
      /(?<![А-Яа-яЁё-])ед(?:ет|ут)\s+(?:директорией|поставкой|отдельным|в\s+поставк\S+|на\s+фолбэке|обычной)/giu,
      // «a question a human cannot click» → «вопрос, которому нечем нажать».
      /которому\s+нечем\s+нажать/giu,
      /(?<![А-Яа-яЁё-])нечем\s+нажать(?![А-Яа-яЁё-])/giu,
      // «becomes five prescribed steps» → «становится пятью предписанными шагами».
      /становится\s+(?:двумя|тремя|четырьмя|пятью|шестью)\s+\S+ми(?![А-Яа-яЁё-])/giu,
    ],
  },
  {
    id: 'PASSIVE',
    level: HARD,
    name: 'безличный залог вместо обращения к читателю в инструкции',
    fix: 'перепиши повелительным наклонением: «Положите», «Скажите», «Одобрите», «Заполните»',
    // Класс назван владельцем 2026-08-09 дословно: «в каком-то залоге "говорится" "делается" —
    // это уже не правила, а руководство по установке, это обращение меня к пользователю».
    // Правило запускается ТОЛЬКО в секциях-инструкциях: в описательных разделах возвратный залог
    // законен («обновление выполняется механически» — там актор машина, а не читатель).
    sectionOnly: /порядок|установк|процедур|как\s+начать|installation|procedure|getting\s+started/i,
    forms: [
      /(?<![А-Яа-яЁё-])(?:помещается|говорится|даются|заполняется|запрашивается|кладётся|кладется|спрашивается|берётся|берется|выполняются|производится)(?![А-Яа-яЁё-])/giu,
    ],
  },
];

// Словарь витрины (Q3): внутреннее слово, поставленное НАЗВАНИЕМ строки таблицы, — ярлык, который
// посторонний человек не разворачивает. Проверка нарочно узкая: слово судится только в позиции
// названия (первая клетка строки таблицы) и только когда название состоит из одного-двух слов.
// В прозе те же слова законны — там рядом стоит объяснение.
// Слово владельца: «Что значит Календарь? Который бля на стене висит? Или что? Пиши понятно, не
// сжимай смыслы!» · «Что "Токены"? ЧТО??? ПОТРАЧЕНО? СПИЗЖЕНО? КУПЛЕНО???»
const JARGON_LABELS = [
  'календарь', 'токены', 'сжатие', 'пара', 'контур', 'свод', 'ось', 'зеркало', 'витрина',
  'стражи', 'полигон', 'бандл',
  'calendar', 'tokens', 'compression', 'pair', 'contour', 'suite', 'mirror', 'showcase',
];

// ── Разбор документа ───────────────────────────────────────────────────────────────────────────

/** Строки файла с номерами, с вырезанными блоками кода: в них правила языка не действуют. */
function lines(text) {
  const out = [];
  let inCode = false;
  text.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*```/.test(line)) { inCode = !inCode; return; }
    out.push({ n: i + 1, text: inCode ? '' : line, raw: line });
  });
  return out;
}

/** Ближайший сверху заголовок для каждой строки — нужен классам с `sectionOnly`. */
function withSections(ls) {
  let section = '';
  return ls.map((l) => {
    const h = l.text.match(/^#{1,6}\s+(.*)$/);
    if (h) section = h[1];
    return { ...l, section };
  });
}

/** Названия строк таблиц: первая клетка каждой строки, кроме шапки и разделителя. */
function tableLabels(ls) {
  const out = [];
  for (const l of ls) {
    const m = l.text.match(/^\|\s*([^|]+?)\s*\|/);
    if (!m) continue;
    if (/^[-: ]+$/.test(m[1])) continue;                      // разделитель шапки
    out.push({ n: l.n, label: m[1].replace(/[*`]/g, '').trim() });
  }
  return out;
}

// ── Проверки ───────────────────────────────────────────────────────────────────────────────────
function checkText(text) {
  const ls = withSections(lines(text));
  const hits = [];

  for (const cls of CLASSES) {
    for (const l of ls) {
      if (!l.text) continue;
      if (cls.sectionOnly && !cls.sectionOnly.test(l.section)) continue;
      for (const re of cls.forms) {
        re.lastIndex = 0;
        for (const m of l.text.matchAll(re)) {
          hits.push({ level: cls.level, id: cls.id, name: cls.name, fix: cls.fix, n: l.n,
                      quote: l.text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).trim() });
        }
      }
    }
  }

  // Вилка шире источника — признание незнания, а не оценка (АП35). Владелец: «мне не нравятся
  // такие сильные разбросы! Нужно уточнить в сети интернет, если ты не уверен, свести к примерно
  // одному числу». Порог ×3 выбран так, чтобы обычная погрешность («18–20 %») проходила, а вилки
  // «5,9–118» и «813–2 034» краснели. Годы («2025–2026») исключены: это не оценка, а период.
  for (const l of ls) {
    if (!l.text) continue;
    for (const m of l.text.matchAll(/(\d[\d  ]*(?:[.,]\d+)?)\s*[–—-]\s*(\d[\d  ]*(?:[.,]\d+)?)/g)) {
      const toNum = (s) => Number(s.replace(/[  ]/g, '').replace(',', '.'));
      const a = toNum(m[1]);
      const b = toNum(m[2]);
      if (!a || !b || b <= a) continue;
      if (/^\d{4}$/.test(m[1].trim()) && /^\d{4}$/.test(m[2].trim())) continue;   // период лет
      if (b / a <= 3) continue;
      hits.push({ level: HARD, id: 'RANGE', name: 'вилка оценки шире, чем позволяет источник (АП35)',
                  fix: 'найди отраслевую ставку и сведи к одному числу; крайние значения оставь в коде',
                  n: l.n, quote: m[0] });
    }
  }

  for (const { n, label } of tableLabels(ls)) {
    const words = label.split(/\s+/).filter(Boolean);
    if (words.length > 2) continue;                            // развёрнутое название — уже не ярлык
    if (!JARGON_LABELS.includes(label.toLowerCase())) continue;
    hits.push({ level: HARD, id: 'JARGON', name: 'внутренний ярлык в названии строки таблицы (АП33)',
                fix: 'разверни в полное название, понятное человеку, который пришёл впервые',
                n, quote: `| ${label} |` });
  }

  return hits;
}

/**
 * Симметрия половин README (дефекты волны №3 и №4: логотип версии пропал из русского блока,
 * портрет голоса пропал из Таблицы 1). Половины обязаны совпадать по СКЕЛЕТУ: столько же
 * подразделов, столько же картинок, столько же строк в каждой одноимённой таблице. Содержание
 * половин различается по языку — скелет различаться не имеет права.
 */
function checkHalves(text) {
  const idx = text.indexOf('<a id="russian">');
  if (idx < 0) return [];                                      // не двухполовинный документ
  const halves = { EN: text.slice(0, idx), RU: text.slice(idx) };
  const hits = [];

  const count = (s, re) => (s.match(re) || []).length;
  const axes = [
    ['подразделов «###»', /^### /gm],
    ['разделов «##»', /^## /gm],
    ['картинок', /<img\s/g],
  ];
  for (const [what, re] of axes) {
    const en = count(halves.EN, re);
    const ru = count(halves.RU, re);
    if (en !== ru) {
      hits.push({ level: HARD, id: 'HALVES', name: 'половины витрины разошлись по скелету',
                  fix: `выровняй: ${what} — EN ${en}, RU ${ru}`, n: 0,
                  quote: `${what}: EN ${en} ≠ RU ${ru}` });
    }
  }

  // Строки таблиц: считаем по КАЖДОЙ таблице половины по порядку. Разошлась одна — назван её номер.
  const rowsPerTable = (s) => {
    const res = [];
    let cur = null;
    for (const line of s.split(/\r?\n/)) {
      if (/^\|/.test(line)) {
        if (/^\|[-: |]+\|?\s*$/.test(line)) continue;          // разделитель шапки
        if (cur === null) cur = 0;
        cur++;
      } else if (cur !== null) { res.push(cur - 1); cur = null; } // минус шапка
    }
    if (cur !== null) res.push(cur - 1);
    return res;
  };
  const en = rowsPerTable(halves.EN);
  const ru = rowsPerTable(halves.RU);
  if (en.length !== ru.length) {
    hits.push({ level: HARD, id: 'HALVES', name: 'половины витрины разошлись по числу таблиц',
                fix: `выровняй: таблиц EN ${en.length}, RU ${ru.length}`, n: 0,
                quote: `таблиц: EN ${en.length} ≠ RU ${ru.length}` });
  } else {
    en.forEach((rows, i) => {
      if (rows !== ru[i]) {
        hits.push({ level: HARD, id: 'HALVES', name: 'таблица половин разошлась по числу строк',
                    fix: `выровняй таблицу №${i + 1}: строк EN ${rows}, RU ${ru[i]}`, n: 0,
                    quote: `таблица №${i + 1}: EN ${rows} строк ≠ RU ${ru[i]} строк` });
      }
    });
  }
  return hits;
}

// ── Отчёт ──────────────────────────────────────────────────────────────────────────────────────
function report(file, text) {
  const hits = [...checkText(text), ...checkHalves(text)];
  const hard = hits.filter((h) => h.level === HARD);
  const soft = hits.filter((h) => h.level === SOFT);

  console.log(`\n── ${file} ──`);
  if (!hits.length) console.log('  ✅ нарушений правил витрины нет');

  const byClass = new Map();
  for (const h of hits) {
    if (!byClass.has(h.id)) byClass.set(h.id, { name: h.name, fix: h.fix, items: [] });
    byClass.get(h.id).items.push(h);
  }
  for (const [id, group] of byClass) {
    const mark = group.items[0].level === HARD ? '❌' : '⚠️ ';
    console.log(`  ${mark} ${id} — ${group.name} (${group.items.length})`);
    for (const h of group.items) console.log(`      ${h.n ? 'стр. ' + h.n + ': ' : ''}…${h.quote}…`);
    console.log(`      → ${group.fix}`);
  }
  return { hard: hard.length, soft: soft.length };
}

// ── Селфтест: каждый жёсткий класс — красным И молчанием (EXP-0059) ────────────────────────────
function selftest() {
  // Чистая фикстура: витринный русский текст, проходящий все классы. Двухполовинности нет, поэтому
  // проверка симметрии на ней не запускается — её красный доказывается отдельной мутацией ниже.
  const clean = [
    '## 2. Установка',
    '',
    '### 2.2. Порядок установки',
    '',
    '1. Положите файл в корень проекта.',
    '2. Скажите агенту: разверни фреймворк.',
    '3. Заполните документ цели.',
    '',
    '## 3. Метрики',
    '',
    '| Что измерено | Значение |',
    '|---|---|',
    '| Время работы над версией | 2,0 суток |',
    '| Токенов израсходовано моделями | 3 011 949 062 |',
  ].join('\n');

  const mutations = [
    ['META', clean + '\n\nКаждому навыку отведена своя строка Таблицы 3.'],
    ['EXCUSE', clean + '\n\nОбъём поставки вырос (измерено в эпике 1.5 по точным размерам).'],
    ['BACKSTAGE', clean + '\n\nЗаплачено владельцем в действительности 16,89 доллара.'],
    ['DENIAL', clean + '\n\nТа же работа стоила бы 3 418 долларов, и эти деньги не платились.'],
    ['CALQUE', clean + '\n\nКаталог отчётов едет директорией знаний вместе с поставкой.'],
    ['PASSIVE', clean.replace('1. Положите файл в корень проекта.', '1. Файл помещается в корень проекта.')],
    ['JARGON', clean.replace('| Время работы над версией | 2,0 суток |', '| Календарь | 2,0 суток |')],
    ['RANGE', clean + '\n\n| Электроэнергии израсходовано | 5,9–118 кВт·ч |'],
  ];

  let bad = 0;

  // 1. МОЛЧАНИЕ на чистой фикстуре.
  const cleanHits = checkText(clean).filter((h) => h.level === HARD);
  const silent = cleanHits.length === 0;
  console.log(`${silent ? '✅' : '❌'} чистая фикстура: жёстких нарушений ${cleanHits.length} (ждали 0)`);
  if (!silent) { bad++; cleanHits.forEach((h) => console.log(`      лишнее — ${h.id}: …${h.quote}…`)); }

  // 2. КРАСНЫЙ на каждом классе + АДРЕСНОСТЬ: сработал ровно тот класс, ради которого мутация.
  for (const [id, text] of mutations) {
    const all = checkText(text).filter((h) => h.level === HARD);
    const fired = all.some((h) => h.id === id);
    const others = [...new Set(all.filter((h) => h.id !== id).map((h) => h.id))];
    console.log(`${fired ? '✅' : '❌'} мутация ${id}: ${fired ? 'страж покраснел' : 'СТРАЖ НЕ ЗАМЕТИЛ'}` +
                (others.length ? ` (заодно сработали ${others.join(', ')} — адресность неточна)` : ''));
    if (!fired || others.length) bad++;
  }

  // 2b. Границы класса RANGE: узкая вилка и период лет проходят молча — иначе страж потребовал бы
  // выбросить из таблицы законные диапазоны и период разработки.
  const narrow = clean + '\n\nОбзор эмпирических измерений 2025–2026 даёт разброс 18–20 процентов.';
  const narrowHits = checkText(narrow).filter((h) => h.id === 'RANGE');
  const narrowOk = narrowHits.length === 0;
  console.log(`${narrowOk ? '✅' : '❌'} граница RANGE: «2025–2026» и «18–20» молчат (находок ${narrowHits.length}, ждали 0)`);
  if (!narrowOk) bad++;

  // 3. Класс PASSIVE НЕ запускается вне секции-инструкции: возвратный залог в описательном разделе
  // законен, и страж, который этого не знает, заставил бы переписать здоровый текст.
  const descriptive = '## 6. Обновление\n\nОбновление выполняется механически и уважает каждую правку.';
  const outside = checkText(descriptive).filter((h) => h.id === 'PASSIVE');
  const scoped = outside.length === 0;
  console.log(`${scoped ? '✅' : '❌'} граница PASSIVE: вне секции-инструкции молчит (нарушений ${outside.length}, ждали 0)`);
  if (!scoped) bad++;

  // 4. Симметрия половин: красный на потерянной картинке и молчание на ровных половинах.
  const halvesOk = '# EN\n\n## 1. General\n\n<img src="a.png">\n\n<a id="russian">\n\n# RU\n\n## 1. Общее\n\n<img src="a.png">\n';
  const halvesBad = '# EN\n\n## 1. General\n\n<img src="a.png">\n\n<a id="russian">\n\n# RU\n\n## 1. Общее\n';
  const symOk = checkHalves(halvesOk).length === 0;
  const symBad = checkHalves(halvesBad).length > 0;
  console.log(`${symOk ? '✅' : '❌'} симметрия половин: ровные половины молчат`);
  console.log(`${symBad ? '✅' : '❌'} симметрия половин: потерянная в русской половине картинка краснеет`);
  if (!symOk) bad++;
  if (!symBad) bad++;

  console.log(bad ? `\n❌ selftest FAILED — ${bad}` : '\n✅ selftest OK — каждый класс доказан красным И молчанием');
  process.exit(bad ? 1 : 0);
}

// ── Точка входа ────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv.includes('--selftest')) selftest();

// Дефолт — вся витрина: то, что публикуется как есть и не несёт пометок провенанса (решение №65).
let files = argv.filter((a) => !a.startsWith('--'));
if (!files.length) {
  files = ['README.md'];
  const reports = 'reports';
  if (fs.existsSync(reports)) {
    for (const f of fs.readdirSync(reports).sort()) {
      if (/^RELEASE_NOTES_.*\.md$/.test(f)) files.push(path.join(reports, f));
    }
  }
}

let hard = 0;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`❌ файла нет — ${f}`); hard++; continue; }
  hard += report(f, fs.readFileSync(f, 'utf8')).hard;
}

console.log(hard
  ? `\n❌ showcase-lint: ${hard} нарушений правил витрины (фаза Q, plans/67)`
  : '\n✅ showcase-lint: витрина чиста по правилам волны. ⚠️ Красота этим НЕ доказана — вкус судит владелец.');
process.exit(hard ? 1 : 0);
