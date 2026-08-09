#!/usr/bin/env node
// tools/build-story-card.mjs — карточка метрик 9:16 для сторис, JPEG 1080×1920.
//
// ЗАЧЕМ. Таблица 6 витрины хороша на экране ноутбука и нечитаема в телефоне: тридцать с лишним
// строк в три колонки. Для сторис нужен другой носитель — вертикальный кадр с девятью числами
// крупным кеглем. Просьба владельца, 2026-08-09: «нужно будет эту таблицу 6 срендерить красиво в
// 9:16 для сториз в социальных сетях, чтобы на мобильном телефоне было читаемо».
//
// ГЛАВНОЕ РЕШЕНИЕ: числа НЕ дублируются в этом файле, а ЧИТАЮТСЯ из Таблицы 6 `README.md` по
// названию строки. Карточка — зеркало витрины, и зеркало, переписанное руками, разъезжается с
// истиной на первом же пересчёте (`bugs/09`, `bugs/49`, EXP-0025). Не нашлась строка — прогон
// падает и называет её, вместо того чтобы молча нарисовать пустоту.
//
// ЧТО ЗДЕСЬ ВСЁ-ТАКИ РЕШАЕТ ЧЕЛОВЕК: ОТБОР девяти строк из тридцати с лишним и их порядок. Это
// класс «вкус» (`AGENT_GUIDE.md`), поэтому отбор вынесен в константу ниже и правится одной
// строкой, а вердикт «красиво» выносит владелец, а не прогон.
//
// Использование:
//   node tools/build-story-card.mjs                # обе половины: assets/story-2.2-ru.jpg и -en.jpg
//   node tools/build-story-card.mjs --lang ru      # только русская
//   node tools/build-story-card.mjs --open         # собрать и ОТКРЫТЬ результат (показ — действие)
//
// [NOT-TESTED] — ЗАГОТОВКА, НИ РАЗУ НЕ ЗАПУСКАННАЯ. Слово владельца 2026-08-09: «рендер —
// отдельная работа», поэтому файл заведён и остановлен здесь, до первого прогона. Что обязано
// произойти, прежде чем маркер сменится: прогон, ГЛАЗА владельца на готовом JPEG в телефоне
// (класс «вкус» — вердикт его), и отбор девяти строк, утверждённый им же.

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README = join(ROOT, 'README.md');
const OUT_DIR = join(ROOT, 'assets');

// Кадр сторис: 1080×1920 — базовый вертикальный формат площадок.
const WIDTH = 1080;
const HEIGHT = 1920;

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

// ОТБОР — вкусовое решение, вынесенное в одно место. Ключ — начало названия строки Таблицы 6.
const PICK = {
  ru: [
    'Время работы над версией',
    'Время активной работы тандема',
    'Строк добавлено',
    'Слов прозы написано руками',
    'Токенов израсходовано моделями всего',
    'Если бы версию KAIF 2.2 писали живые люди',
    'Сколько работы людей приходится на один час работы тандема',
    'Заплачено по подписке',
    'Стоила бы вся работа',
  ],
  en: [
    'Time spent on the version',
    'Active working time of the human',
    'Lines added',
    'Words of prose written by hand',
    'Tokens spent by the models in total',
    'If living people had written KAIF 2.2',
    'How much human work falls on one hour',
    'Paid by subscription',
    'What all the work would cost',
  ],
};

const TITLE = {
  ru: { top: 'KAIF 2.2 — Yolden KAIF', sub: 'Во что обошлась версия', foot: 'Двое суток · 07–09.08.2026' },
  en: { top: 'KAIF 2.2 — Yolden KAIF', sub: 'What this version cost', foot: 'Two days · 7–9 Aug 2026' },
};

/** Разметка markdown прочь: карточку рисует CSS, а не звёздочки. */
const plain = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

/**
 * Строки Таблицы 6 нужной половины README. Половины разделяет якорь `<a id="russian">`;
 * таблица опознаётся по своей шапке, а не по номеру строки — номера плывут при каждой правке.
 */
function readTable(lang) {
  const text = readFileSync(README, 'utf8');
  const split = text.indexOf('<a id="russian">');
  const half = lang === 'ru' ? text.slice(split) : text.slice(0, split);
  const head = lang === 'ru' ? '| Что измерено | Значение | Чему это равно |'
                             : '| What was measured | Value | What it equals |';
  const at = half.indexOf(head);
  if (at < 0) throw new Error(`Таблица 6 (${lang}) не найдена по шапке — витрина изменилась`);

  const rows = new Map();
  for (const line of half.slice(at).split(/\r?\n/).slice(2)) {
    if (!line.startsWith('|')) break;                       // таблица кончилась
    const cells = line.split('|').slice(1, -1).map((c) => plain(c));
    if (cells.length < 3) continue;
    rows.set(cells[0], { label: cells[0], value: cells[1], equals: cells[2] });
  }
  return rows;
}

/** Выбранные строки в объявленном порядке. Ненайденная — красный с адресом, не пустая клетка. */
function pickRows(rows, lang) {
  const out = [];
  for (const key of PICK[lang]) {
    const hit = [...rows.keys()].find((k) => k.startsWith(key));
    if (!hit) throw new Error(`строка Таблицы 6 не найдена: «${key}» (${lang}) — поправь PICK или витрину`);
    out.push(rows.get(hit));
  }
  return out;
}

/** HTML кадра. Кегль подобран так, чтобы читалось с телефона в ленте: значение — 64px. */
function html(lang, rows) {
  const t = TITLE[lang];
  const items = rows.map((r) => `
    <div class="row">
      <div class="label">${r.label}</div>
      <div class="value">${r.value}</div>
      ${r.equals && r.equals !== '—' ? `<div class="equals">${r.equals}</div>` : ''}
    </div>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:${WIDTH}px; height:${HEIGHT}px; background:${C.bg}; color:${C.text};
    font-family:"Segoe UI","Inter",system-ui,sans-serif; -webkit-font-smoothing:antialiased;
    display:flex; flex-direction:column; padding:64px 56px;
  }
  .brand { font-size:38px; font-weight:700; letter-spacing:.5px; color:${C.pink}; }
  .sub { font-size:52px; font-weight:700; margin-top:10px; line-height:1.15; }
  .rule { height:5px; width:120px; background:${C.blue}; margin:26px 0 10px; border-radius:3px; }
  .list { flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:8px 0; }
  .row { border-bottom:2px solid ${C.line}; padding:16px 0 14px; }
  .row:last-child { border-bottom:none; }
  .label { font-size:26px; color:${C.dim}; line-height:1.25; }
  .value { font-size:64px; font-weight:800; line-height:1.05; margin:4px 0 2px; color:${C.text}; }
  .equals { font-size:26px; color:${C.green}; line-height:1.3; }
  .foot { display:flex; justify-content:space-between; align-items:baseline;
          font-size:26px; color:${C.dim}; border-top:2px solid ${C.line}; padding-top:22px; }
  .foot .url { color:${C.blue}; font-weight:600; }
  </style></head><body>
    <div class="brand">${t.top}</div>
    <div class="sub">${t.sub}</div>
    <div class="rule"></div>
    <div class="list">${items}</div>
    <div class="foot"><span>${t.foot}</span><span class="url">github.com/MikalaiKryvusha/KAIF</span></div>
  </body></html>`;
}

async function render(lang) {
  const rows = pickRows(readTable(lang), lang);
  const out = join(OUT_DIR, `story-2.2-${lang}.jpg`);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(html(lang, rows), { waitUntil: 'load' });
    await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
  } finally {
    await browser.close();
  }
  const kb = Math.round(statSync(out).size / 1024);
  console.log(`✅ ${out} — ${WIDTH}×${HEIGHT} JPEG, ${kb} КБ, строк ${rows.length}`);
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
