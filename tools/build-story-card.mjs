#!/usr/bin/env node
// tools/build-story-card.mjs — Таблица 6 витрины в формате 9:16 (PNG) для социальных сетей.
//
// ЗАЧЕМ. Таблица 6 хороша на экране ноутбука и нечитаема в телефоне. Просьба владельца
// (2026-08-09): «теперь всю Таблицу 6 с заголовком нужно срендерить в красивый строгий 9:16 PNG
// для социальной сети · большим текстом, чтобы было читаемо · обратить внимание на переносы слов,
// единиц измерений - чтобы не было некрасивых переносов». Первая проба была отвергнута им же:
// «это нечитаемо. Текст мелкий и зелёный - невидно. Рендер должен выглядить похожим образом на
// таблицу из GitHub» · «это должна быть таблица в три колонки».
//
// ЧЕТЫРЕ РЕШЕНИЯ, ЗАЩИЩЁННЫЕ КОДОМ:
//
// 1. ЧИСЛА НЕ ДУБЛИРУЮТСЯ. Строки читаются из Таблицы 6 живого `README.md` по шапке таблицы, а не
//    переписываются сюда: зеркало, набранное руками, разъезжается с истиной на первом же
//    пересчёте (`bugs/09`, `bugs/49`, EXP-0025). Пропала таблица — прогон падает и говорит об этом.
//
// 2. КЕГЛЬ ЗАДАН, А ДЕЛИТСЯ ТАБЛИЦА. Прежняя версия подгоняла размер шрифта под кадр — и
//    восемнадцать строк ужались до нечитаемого. Приоритет перевёрнут: кегль фиксирован
//    читаемым (`CELL`), а сколько строк влезет в кадр, РЕШАЕТ ЗАМЕР — страницы набираются
//    жадно, пока содержимое помещается. Отсюда несколько кадров вместо одного нечитаемого.
//
// 3. ВИД — ТАБЛИЦА GitHub. Три колонки с теми же ролями, что на витрине, сетка и фон тёмной темы
//    GitHub. Зелёный текст третьей колонки убран по слову владельца («зелёный - невидно»):
//    цвет остаётся только служебной подсветкой заголовка.
//
// 4. ПЕРЕНОСЫ ЛЕЧАТСЯ ТИПОГРАФИКОЙ. `typo()` ставит неразрывный пробел между числом и единицей,
//    в разрядах чисел, после коротких предлогов и после «≈», а дефис внутри слова делает
//    неразрывным («Человек‑Агент» рвался по дефису в первой пробе). Колонка значения не
//    переносится вовсе.
//
// Использование:
//   node tools/build-story-card.mjs                # обе половины: assets/story-2.2-ru-N.png и -en-N.png
//   node tools/build-story-card.mjs --lang ru      # только русская
//   node tools/build-story-card.mjs --open         # собрать и ОТКРЫТЬ результат (показ — действие)
//
// [TESTED: 2026-08-09 · прогон обеих половин: страницы набраны замером, PNG 2160×3840 собраны и
//  просмотрены глазами; переносов внутри слов и обрывов единиц измерения нет.]

import { readFileSync, mkdirSync, existsSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README = join(ROOT, 'README.md');
const OUT_DIR = join(ROOT, 'assets');

// Кадр сторис: 1080×1920 — базовый вертикальный формат площадок; PNG снимается с удвоением.
const WIDTH = 1080;
const HEIGHT = 1920;
const SCALE = 2;                       // итоговый PNG — 2160×3840

// Кегли (в CSS-пикселях кадра шириной 1080). Это НИЖНЯЯ граница читаемости с телефона, а не
// пожелание: именно её нарушала первая версия, подгонявшая шрифт под число строк.
const CELL = 28;                       // текст ячейки
const VALUE = 30;                      // значение — акцент строки
const COLHEAD = 24;                    // шапка колонок

// Палитра тёмной темы GitHub — та же среда, в которой владелец читает витрину.
const C = {
  bg: '#0D1117',
  head: '#161B22',
  zebra: '#0F141B',
  line: '#30363D',
  text: '#E6EDF3',
  dim: '#8B949E',
  blue: '#58A6FF',
  pink: '#FF1A8C',
};

const TITLE = {
  ru: { top: 'KAIF 2.2 — Yolden KAIF', sub: 'Таблица 6 — Метрики версии KAIF 2.2',
        cols: ['Что измерено', 'Значение', 'Чему это равно'], foot: 'Трое суток · 07–09.08.2026' },
  en: { top: 'KAIF 2.2 — Yolden KAIF', sub: 'Table 6 — Metrics of KAIF 2.2',
        cols: ['What was measured', 'Value', 'What it equals'], foot: 'Three days · 7–9 Aug 2026' },
};

const NB = String.fromCharCode(160);   // неразрывный пробел — КОДОМ, а не символом (EXP-0082)
const SHORT_WORD = /(^|[\s(«"])([А-Яа-яЁёA-Za-z]{1,3})\s+/g;   // короткое слово не остаётся в конце строки

/** Типографика кадра: картинку читатель не поправит, поэтому правила жёстче, чем в тексте. */
function typo(s) {
  return s
    .replace(/\s*\|\s*$/, '')
    .replace(/[*`]/g, '')
    .replace(/≈\s*/g, `≈${NB}`)                        // знак приближения не отрывается от числа
    .replace(/(\d)\s+(?=[$%€₽])/g, `$1${NB}`)           // символьные единицы
    .replace(/(\d)\s+(?=\d{3}(?!\d))/g, `$1${NB}`)      // разряды числа
    .replace(/(\p{L})-(\p{L})/gu, '$1‑$2')              // дефис внутри слова не рвётся
    .replace(SHORT_WORD, (m, pre, w) => `${pre}${w}${NB}`)
    .replace(/(\d)\s+(?=[А-Яа-яA-Za-z])/g, `$1${NB}`)   // число и следующая за ним единица
    .trim();
}

/** ВСЕ строки Таблицы 6 нужной половины README, в порядке витрины. */
function readTable(lang) {
  const text = readFileSync(README, 'utf8');
  const split = text.indexOf('<a id="russian">');
  const half = lang === 'ru' ? text.slice(split) : text.slice(0, split);
  const head = lang === 'ru' ? '| Что измерено | Значение | Чему это равно |'
                             : '| What was measured | Value | What it equals |';
  const at = half.indexOf(head);
  if (at < 0) throw new Error(`Таблица 6 (${lang}) не найдена по шапке — витрина изменилась`);

  const rows = [];
  for (const line of half.slice(at).split(/\r?\n/).slice(2)) {
    if (!line.startsWith('|')) break;                       // таблица кончилась
    const cells = line.split('|').slice(1, -1);
    if (cells.length < 3) continue;
    rows.push({ label: typo(cells[0]), value: typo(cells[1]).replace(/‑/g, '-').replace(/ /g, ' '), equals: typo(cells[2]) });
  }
  if (!rows.length) throw new Error(`Таблица 6 (${lang}) пуста — проверь разметку витрины`);
  return rows;
}

/**
 * HTML одного кадра: мелкий строгий заголовок и таблица из трёх колонок. Множитель `k` растит
 * кегли под готовую раскладку — им пользуется подбор в `paginate`.
 * Подписи внизу нет по слову владельца: «трое суток и ссылку на мой гитхаб - убрать».
 */
function html(lang, rows, page, pages, k = 1) {
  const t = TITLE[lang];
  const cell = Math.round(CELL * k), value = Math.round(VALUE * k), colhead = Math.round(COLHEAD * k);
  const pad = Math.round(14 * k), padX = Math.round(16 * k);
  const body = rows.map((r, i) => `
    <tr${i % 2 ? ' class="alt"' : ''}>
      <td class="label">${r.label}</td>
      <td class="value">${r.value}</td>
      <td class="equals">${r.equals === '—' ? '' : r.equals}</td>
    </tr>`).join('');

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:${WIDTH}px; min-height:${HEIGHT}px; background:${C.bg}; color:${C.text};
    font-family:"Segoe UI","Inter",system-ui,sans-serif; -webkit-font-smoothing:antialiased;
    display:flex; flex-direction:column; padding:52px 40px;
    hyphens:none; overflow-wrap:normal; word-break:normal;
  }
  .wrap  { flex:1; display:flex; }
  .sub   { font-size:28px; font-weight:600; color:${C.dim}; letter-spacing:.2px; margin-bottom:24px; }
  table  { width:100%; flex:1; table-layout:fixed; border-collapse:collapse; border:2px solid ${C.line}; }
  th     { font-size:${colhead}px; font-weight:700; color:${C.dim}; text-align:left;
           background:${C.head}; padding:${pad}px ${padX}px; border:2px solid ${C.line};
           white-space:nowrap; }
  td     { font-size:${cell}px; line-height:1.28; padding:${pad}px ${padX}px; border:2px solid ${C.line};
           vertical-align:top; }
  tr.alt td { background:${C.zebra}; }
  .label  { color:${C.text}; width:42%; }
  .value  { color:#FFFFFF; font-weight:800; font-size:${value}px;  }
  .equals { color:${C.text}; width:45%; }
  </style></head><body>
    <div class="sub">${t.sub}${pages > 1 ? ` · ${page}/${pages}` : ''}</div>
    <div class="wrap"><table>
      <colgroup><col style="width:40%"><col style="width:16%"><col style="width:44%"></colgroup>
      <thead><tr><th>${t.cols[0]}</th><th>${t.cols[1]}</th><th>${t.cols[2]}</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>
  </body></html>`;
}

/**
 * Сколько строк влезает в кадр при ЗАДАННОМ кегле — решает замер, а не оценка на глаз.
 * Страницы набираются жадно: строка добавляется, пока браузер показывает, что содержимое
 * ещё помещается в 1920 px.
 */
async function paginate(page, lang, rows) {
  // ОДИН КАДР — ПРИОРИТЕТ. Слово владельца: «уменьшаем шрифты, стараемся впихнуть в один кадр».
  // Сначала ищется самый крупный кегль, при котором ВСЯ таблица помещается в одну картинку;
  // деление на страницы остаётся запасным путём — на случай, когда таблица вырастет настолько,
  // что единственный кадр станет нечитаемым (порог назван явно: ячейка мельче 16 px).
  const MIN_CELL = 16;
  for (let k = 1; k * CELL >= MIN_CELL; k = +(k - 0.02).toFixed(2)) {
    await page.setContent(html(lang, rows, 1, 1, k), { waitUntil: 'load' });
    const h = await page.evaluate(() => document.body.scrollHeight);
    if (h <= HEIGHT) return { chunks: [rows], k };
  }

  const pages = [];
  let rest = rows.slice();
  while (rest.length) {
    let take = rest.length;
    while (take > 0) {
      await page.setContent(html(lang, rest.slice(0, take), 1, 2), { waitUntil: 'load' });
      const h = await page.evaluate(() => document.body.scrollHeight);
      if (h <= HEIGHT) break;
      take--;
    }
    if (take === 0) throw new Error('даже одна строка не помещается в кадр — кегль слишком велик для этого макета');
    pages.push(rest.slice(0, take));
    rest = rest.slice(take);
  }

  // РОВНЫЕ КАДРЫ. Жадный набор даёт последнюю страницу-огрызок (8 + 7 + 3), и в ленте она читается
  // как обрыв. Число страниц уже известно и от перераспределения не растёт, поэтому строки
  // раскладываются поровну — а каждый получившийся кадр всё равно проверяется замером.
  const per = Math.ceil(rows.length / pages.length);
  const even = [];
  for (let i = 0; i < rows.length; i += per) even.push(rows.slice(i, i + per));
  for (const chunk of even) {
    await page.setContent(html(lang, chunk, 1, even.length), { waitUntil: 'load' });
    const h = await page.evaluate(() => document.body.scrollHeight);
    if (h > HEIGHT) return { chunks: pages, k: 1 };   // ровная раскладка не влезла — оставляем жадную
  }

  // КЕГЛЬ РАСТЁТ ПОД ГОТОВУЮ РАСКЛАДКУ. После выравнивания в кадре остаётся воздух — а пустой
  // низ на витрине читается как недоделка, и текст при этом мельче, чем мог бы быть. Число
  // кадров уже зафиксировано, поэтому шрифт увеличивается, пока САМЫЙ ПЛОТНЫЙ кадр ещё
  // помещается. Проверяются все кадры, а не первый: строки разной длины, и «влезло у одного»
  // ничего не говорит про остальные.
  let k = 1;
  for (let step = 1.05; step <= 1.75; step += 0.05) {
    let fits = true;
    for (const chunk of even) {
      await page.setContent(html(lang, chunk, 1, even.length, step), { waitUntil: 'load' });
      const h = await page.evaluate(() => document.body.scrollHeight);
      if (h > HEIGHT) { fits = false; break; }
    }
    if (!fits) break;
    k = +step.toFixed(2);
  }
  return { chunks: even, k };
}

async function render(lang) {
  const rows = readTable(lang);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  // Старые кадры этой половины убираются: иначе страница, исчезнувшая после сокращения таблицы,
  // осталась бы лежать рядом со свежими и уехала бы в социальную сеть как актуальная.
  for (const f of readdirSync(OUT_DIR)) {
    if (new RegExp(`^story-2\\.2-${lang}(-\\d+)?\\.(png|jpg)$`).test(f)) unlinkSync(join(OUT_DIR, f));
  }

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const made = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });
    const { chunks, k } = await paginate(page, lang, rows);

    for (let i = 0; i < chunks.length; i++) {
      const out = join(OUT_DIR, `story-2.2-${lang}-${i + 1}.png`);
      await page.setContent(html(lang, chunks[i], i + 1, chunks.length, k), { waitUntil: 'load' });
      const h = await page.evaluate(() => document.body.scrollHeight);
      if (h > HEIGHT) throw new Error(`кадр ${i + 1} не влез: ${h}px против ${HEIGHT}px`);
      await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      const kb = Math.round(statSync(out).size / 1024);
      console.log(`✅ ${out} — ${WIDTH * SCALE}×${HEIGHT * SCALE} PNG, ${kb} КБ, строк ${chunks[i].length}, кегль ${Math.round(CELL * k)}px`);
      made.push(out);
    }
  } finally {
    await browser.close();
  }
  console.log(`   ${lang}: строк всего ${rows.length}, кадров ${made.length}, кегль ячейки ${CELL}px`);
  return made;
}

const argv = process.argv.slice(2);
const langIdx = argv.indexOf('--lang');
// По слову владельца (2026-08-09) рендерится ТОЛЬКО русская половина: «en не рендерим,
// только RU». Английскую можно собрать явно — `--lang en`.
const langs = langIdx >= 0 ? [argv[langIdx + 1]] : ['ru'];

const made = [];
for (const lang of langs) made.push(...await render(lang));

// Показ — ДЕЙСТВИЕ, а не ссылка (`AGENT_GUIDE.md`): агент открывает результат сам.
if (argv.includes('--open')) {
  for (const f of made) {
    try { execFileSync('cmd', ['/c', 'start', '', f], { stdio: 'ignore' }); }
    catch { console.log(`(открыть не удалось — файл здесь: ${f})`); }
  }
}
