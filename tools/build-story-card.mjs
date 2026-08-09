#!/usr/bin/env node
// tools/build-story-card.mjs — карточка Таблицы 6 в формате 9:16 для социальных сетей, PNG.
//
// ЗАЧЕМ. Таблица 6 витрины хороша на экране ноутбука и нечитаема в телефоне: два десятка строк
// в три колонки. Для сторис нужен другой носитель — вертикальный кадр, где каждая величина стоит
// крупно и отдельно. Просьба владельца, 2026-08-09: «нужно будет эту таблицу 6 срендерить красиво
// в 9:16 для сториз в социальных сетях, чтобы на мобильном телефоне было читаемо», уточнённая
// тем же вечером: «теперь всю Таблицу 6 с заголовком нужно срендерить в красивый строгий 9:16 PNG
// для социальной сети · большим текстом, чтобы было читаемо · обратить внимание на переносы слов,
// единиц измерений - чтобы не было некрасивых переносов».
//
// ТРИ РЕШЕНИЯ, КОТОРЫЕ ЗДЕСЬ ЗАЩИЩЕНЫ КОДОМ:
//
// 1. ЧИСЛА НЕ ДУБЛИРУЮТСЯ. Строки читаются из Таблицы 6 живого `README.md` по шапке таблицы, а не
//    переписываются сюда: зеркало, набранное руками, разъезжается с истиной на первом пересчёте
//    (`bugs/09`, `bugs/49`, EXP-0025). Пропала таблица — прогон падает и говорит об этом.
//
// 2. КЕГЛЬ ПОДБИРАЕТСЯ ЗАМЕРОМ, А НЕ НА ГЛАЗ. «Большим текстом» и «влезает целиком» — требования
//    конфликтующие, и разрешает их измерение: страница рендерится с пробным масштабом, её高 высота
//    замеряется в браузере, масштаб пересчитывается — и так до самого крупного кегля, который ещё
//    помещается в кадр. Никакой подгонки константами вручную.
//
// 3. ПЕРЕНОСЫ ЛЕЧАТСЯ ТИПОГРАФИКОЙ, А НЕ НАДЕЖДОЙ. Перед версткой текст проходит `typo()`:
//    неразрывный пробел между числом и единицей, после коротких предлогов и союзов, вокруг «≈»
//    и внутри диапазонов. Значение вдобавок запрещено переносить средствами CSS. Правило то же,
//    что стережёт витрину классом NBSP в `showcase-lint`, — здесь оно применяется к кадру.
//
// Использование:
//   node tools/build-story-card.mjs                # обе половины: assets/story-2.2-ru.png и -en.png
//   node tools/build-story-card.mjs --lang ru      # только русская
//   node tools/build-story-card.mjs --open         # собрать и ОТКРЫТЬ результат (показ — действие)
//
// [TESTED: 2026-08-09 · прогон обеих половин: PNG 2160×3840 собраны, высота содержимого замерена
//  браузером и уложена в кадр (масштаб печатается в отчёте), результат открыт и просмотрен.]

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
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

// Палитра бренда — те же цвета, что на бейджах витрины.
const C = {
  bg: '#0D1117',
  card: '#161B22',
  line: '#21262D',
  text: '#E6EDF3',
  dim: '#8B949E',
  pink: '#FF1A8C',
  blue: '#2C7BE5',
  green: '#3DDC84',
};

const TITLE = {
  ru: { top: 'KAIF 2.2 — Yolden KAIF', sub: 'Таблица 6 — Метрики версии KAIF 2.2',
        foot: 'Трое суток · 07–09.08.2026' },
  en: { top: 'KAIF 2.2 — Yolden KAIF', sub: 'Table 6 — Metrics of KAIF 2.2',
        foot: 'Three days · 7–9 Aug 2026' },
};

const NB = ' ';
const SHY_WORDS = /(^|[\s(«"])([А-Яа-яЁёA-Za-z]{1,3})\s+/g;   // короткие слова не остаются в конце строки

/**
 * Типографика кадра: то, что на витрине лечится неразрывным пробелом, в картинке ещё и не
 * подлежит правке читателем — поэтому правила применяются жёстче, чем в тексте.
 */
function typo(s) {
  return s
    .replace(/\s*\|\s*$/, '')
    .replace(/[*`]/g, '')
    .replace(/≈\s*/g, `≈${NB}`)                       // знак приближения не отрывается от числа
    .replace(/(\d)\s+(?=[$%€₽])/g, `$1${NB}`)          // символьные единицы
    .replace(/(\d)\s+(?=\d{3}(?!\d))/g, `$1${NB}`)     // разряды числа
    .replace(/(\p{L})-(\p{L})/gu, '$1‑$2')       // дефис внутри слова не рвётся: «Человек‑Агент»
    .replace(SHY_WORDS, (m, pre, w) => `${pre}${w}${NB}`)
    .replace(/(\d)\s+(?=[А-Яа-яA-Za-z])/g, `$1${NB}`)  // число и следующее за ним слово-единица
    .trim();
}

/**
 * Строки Таблицы 6 нужной половины README — ВСЕ, в порядке витрины. Половины разделяет якорь
 * `<a id="russian">`; таблица опознаётся по своей шапке, а не по номеру строки — номера плывут.
 */
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
    rows.push({ label: typo(cells[0]), value: typo(cells[1]), equals: typo(cells[2]) });
  }
  if (!rows.length) throw new Error(`Таблица 6 (${lang}) пуста — проверь разметку витрины`);
  return rows;
}

/** HTML кадра. Все кегли выражены через множитель `--k`, который подбирает замер. */
function html(lang, rows, k) {
  const t = TITLE[lang];
  const items = rows.map((r) => `
    <div class="row">
      <div class="head"><span class="label">${r.label}</span><span class="value">${r.value}</span></div>
      ${r.equals && r.equals !== '—' ? `<div class="equals">${r.equals}</div>` : ''}
    </div>`).join('');

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  :root { --k:${k}; }
  body {
    width:${WIDTH}px; min-height:${HEIGHT}px; background:${C.bg}; color:${C.text};
    font-family:"Segoe UI","Inter",system-ui,sans-serif; -webkit-font-smoothing:antialiased;
    display:flex; flex-direction:column; padding:calc(56px * var(--k)) calc(48px * var(--k));
    hyphens:none; overflow-wrap:normal; word-break:normal;
  }
  .brand { font-size:calc(34px * var(--k)); font-weight:700; letter-spacing:.5px; color:${C.pink}; }
  .sub   { font-size:calc(46px * var(--k)); font-weight:800; margin-top:calc(8px * var(--k)); line-height:1.12; }
  .rule  { height:calc(5px * var(--k)); width:calc(120px * var(--k)); background:${C.blue};
           margin:calc(22px * var(--k)) 0 calc(6px * var(--k)); border-radius:3px; }
  .list  { flex:1; display:flex; flex-direction:column; justify-content:space-between;
           padding:calc(6px * var(--k)) 0; }
  .row   { border-bottom:2px solid ${C.line}; padding:calc(13px * var(--k)) 0 calc(11px * var(--k)); }
  .row:last-child { border-bottom:none; }
  .head  { display:flex; align-items:baseline; justify-content:space-between; gap:calc(20px * var(--k)); }
  .label { font-size:calc(25px * var(--k)); color:${C.dim}; line-height:1.22; flex:1; }
  .value { font-size:calc(42px * var(--k)); font-weight:800; line-height:1.05; color:${C.text};
           white-space:nowrap; }        /* величина не переносится никогда */
  .equals{ font-size:calc(24px * var(--k)); color:${C.green}; line-height:1.28;
           margin-top:calc(5px * var(--k)); }
  .foot  { display:flex; justify-content:space-between; align-items:baseline; gap:calc(16px * var(--k));
           font-size:calc(24px * var(--k)); color:${C.dim}; border-top:2px solid ${C.line};
           padding-top:calc(18px * var(--k)); margin-top:calc(10px * var(--k)); }
  .foot .url { color:${C.blue}; font-weight:600; white-space:nowrap; }
  </style></head><body>
    <div class="brand">${t.top}</div>
    <div class="sub">${t.sub}</div>
    <div class="rule"></div>
    <div class="list">${items}</div>
    <div class="foot"><span>${t.foot}</span><span class="url">github.com/MikalaiKryvusha/KAIF</span></div>
  </body></html>`;
}

async function render(lang) {
  const rows = readTable(lang);
  const out = join(OUT_DIR, `story-2.2-${lang}.png`);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  let k = 1;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });

    // ПОДБОР КЕГЛЯ ЗАМЕРОМ: три итерации сжимают/растягивают множитель по фактической высоте
    // содержимого. Замер берётся у браузера, а не из головы, — это тот же принцип, по которому
    // сборка печатает счётчики вместо того, чтобы им верить.
    for (let i = 0; i < 6; i++) {
      await page.setContent(html(lang, rows, k), { waitUntil: 'load' });
      const h = await page.evaluate(() => document.body.scrollHeight);
      const ratio = HEIGHT / h;
      if (h <= HEIGHT && ratio < 1.02) break;          // влезло и запас меньше 2 % — это максимум
      k = +(k * Math.min(ratio, 1.25)).toFixed(4);     // шаг ограничен, чтобы не проскочить
    }
    await page.setContent(html(lang, rows, k), { waitUntil: 'load' });
    const finalH = await page.evaluate(() => document.body.scrollHeight);
    if (finalH > HEIGHT) throw new Error(`содержимое не влезло: ${finalH}px против ${HEIGHT}px — таблица выросла, нужен другой макет`);
    await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  } finally {
    await browser.close();
  }
  const kb = Math.round(statSync(out).size / 1024);
  console.log(`✅ ${out} — ${WIDTH * SCALE}×${HEIGHT * SCALE} PNG, ${kb} КБ, строк ${rows.length}, кегль ×${k}`);
  return out;
}

const argv = process.argv.slice(2);
const langIdx = argv.indexOf('--lang');
const langs = langIdx >= 0 ? [argv[langIdx + 1]] : ['ru', 'en'];

const made = [];
for (const lang of langs) made.push(await render(lang));

// Показ — ДЕЙСТВИЕ, а не ссылка (`AGENT_GUIDE.md`): агент открывает результат сам.
if (argv.includes('--open')) {
  for (const f of made) {
    try { execFileSync('cmd', ['/c', 'start', '', f], { stdio: 'ignore' }); }
    catch { console.log(`(открыть не удалось — файл здесь: ${f})`); }
  }
}
