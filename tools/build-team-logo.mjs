#!/usr/bin/env node
// build-team-logo.mjs — бронзовая подпись версии на арте владельца «Team KAIF» (2.4).
//
// ЗАЧЕМ. Финальный логотип 2.4 собирается из ДВУХ файлов владельца: оригинал 1254×1254 несёт
// выжженную подпись «KAIF 2.4 — TEAM DEPLOYMENT», а AI-апскейл 4000×4000 — тот же медальон БЕЗ
// подписи (проба глазами 2026-08-28: нижняя полоса апскейла пуста). Рабочее имя версии —
// Team KAIF (слово владельца при открытии 2.4; финальное подтверждение — AUTH-шаг /release).
// Класс «протухшая подпись версии на картинке» уже стоил релиза 2.3 — лечится инструментом.
//
// МЕТОД — ПЕРЕСБОРКА СЛОВНЫМИ ПОЛОСАМИ ИЗ ОРИГИНАЛА (по образцу build-logo-title.mjs, но БЕЗ
// подбора гарнитуры и БЕЗ побуквенной сегментации): новый текст «KAIF 2.4 — TEAM KAIF» = полоса
// «KAIF 2.4 — TEAM» (первые слова старой подписи НЕПРЕРЫВНЫМ куском — родные интервалы
// сохраняются по построению) + словный зазор (измерен) + полоса «KAIF» (первое слово). Гарнитура
// оригинала — инскрипционный серифный капс класса Trajan, которого нет среди 339 шрифтов машины
// (проба `magick -list font`); ближайший системный был бы ПОДМЕНОЙ гарнитуры — ровно класс,
// против которого написан build-logo-title (его шапка: в PSD Arial, на GitHub Franklin Gothic).
// Побуквенная сегментация ОТБРОШЕНА осознанно: при кегле 88px засечки соседних букв слипаются
// (проба: «TEAM DEPLOY…» шла кластером 166–518px при любых порогах), а словные зазоры чисты.
// Буквы — те же пиксели бронзы автора; цена метода — мягкость кромок ресайза ×3.19 (Lanczos),
// на чёрном поле малозаметная; вердикт вкуса — владелец на приёмке витрины (класс «вкус»).
//
// КОМАНДЫ
//   node tools/build-team-logo.mjs            # собрать: PNG (4000²) + лёгкая WEBP
//   node tools/build-team-logo.mjs --check    # самопроверка: пересобрать СТАРЫЙ текст из его же
//                                             # словных полос на исходных местах (1:1) и сверить
//                                             # RMSE с полосой оригинала; расхождение = красный
//
// Требует ImageMagick 7 (`magick`) в PATH. [TESTED: 2026-08-28 · --check зелёный; сборка 2.4
// сверена глазами; webp с чистым чёрным фоном]
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GLYPH_SRC = join(ROOT, 'assets', 'KAIF 2.4 - Team KAIF.png');                     // 1254², подпись есть
const CANVAS_SRC = join(ROOT, 'assets', 'KAIF 2.4 - Team KAIF_upscayl_3x_ultramix-balanced-4x.png'); // 4000², подписи нет
const OUT_PNG = join(ROOT, 'assets', 'KAIF_2.4_GitHub_LOGO.png');
const OUT_WEBP = join(ROOT, 'assets', 'KAIF_2.4_GitHub_LOGO.webp');

// ── Константы, снятые пробами 2026-08-28 (identify/threshold/bbox/свипы; сессия чата 2) ──────
const ORIG_W = 1254, CANVAS_W = 4000;
const SCALE = CANVAS_W / ORIG_W;      // 3.1898…: апскейл владельца геометрически = оригинал × SCALE
const BAND_Y = 1128;                  // верх полосы подписи в ОРИГИНАЛЕ (bbox текста: 916×88 @ y1134)
const BAND_H = 112;                   // полоса: текст 88 px + запас; низ медальона выше BAND_Y
const OLD_WORDS = ['KAIF', '2.4', '— TEAM', 'DEPLOYMENT']; // словные блоки как их видит сегментация
                                      // (зазор «—»↔«TEAM» уже словного порога — они один блок)
const THRESH = 60;                    // порог «чернила/фон»: ниже — AA-мостики склеивают блоки
const WORD_GAP_MIN = 10;              // зазор ≥ этого — граница СЛОВ (свип: ровно 4 блока)
const PAD = 4;                        // паддинг полос по x: AA-пиксели тусклее порога не режутся
const WEBP_QUALITY = 82;              // «лёгкая webp»: ориентир 2.3 — 463 КБ; чёрный жмётся отлично
const WEBP_SIDE = 2000;               // webp — витринный (README width=560): 2000² хватает и на ретину;
                                      // полный 4000² остаётся в PNG

// -alpha off ОБЯЗАТЕЛЕН на каждом чтении артов: оба PNG — srgba, и альфа-канал отравляет
// Gray-статистику (полоса читалась полусерой, сегментация слипалась в один блоб).
const run = (args) => execFileSync('magick', args, { stdio: ['ignore', 'pipe', 'pipe'] });

/** Полоса подписи оригинала серым PGM → { w, h, data } (P5, maxval 255). */
function readBand(tmp) {
  const pgm = join(tmp, 'band.pgm');
  run([GLYPH_SRC, '-alpha', 'off', '-crop', `${ORIG_W}x${BAND_H}+0+${BAND_Y}`, '+repage',
    '-colorspace', 'Gray', '-depth', '8', pgm]);
  const buf = readFileSync(pgm);
  let p = 0, fields = [];
  while (fields.length < 4) {
    while (buf[p] === 0x23) { while (buf[p] !== 0x0a) p++; p++; }
    let s = '';
    while (buf[p] !== 0x20 && buf[p] !== 0x0a && buf[p] !== 0x0d && buf[p] !== 0x09) s += String.fromCharCode(buf[p++]);
    while (buf[p] === 0x20 || buf[p] === 0x0a || buf[p] === 0x0d || buf[p] === 0x09) p++;
    fields.push(s);
  }
  const [magic, w, h] = [fields[0], +fields[1], +fields[2]];
  if (magic !== 'P5') throw new Error(`ожидался P5, получен ${magic}`);
  return { w, h, data: buf.subarray(buf.length - w * h) };
}

/** Словные блоки полосы: колонки с чернилами, разрезанные зазорами ≥ WORD_GAP_MIN. */
function segmentWords(band) {
  const { w, h, data } = band;
  const col = new Array(w).fill(0);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[y * w + x] > THRESH) col[x]++;
  const blocks = [];
  let x = 0;
  while (x < w) {
    while (x < w && col[x] === 0) x++;
    if (x >= w) break;
    let x0 = x, gap = 0, xEnd = x;
    while (x < w && gap < WORD_GAP_MIN) {
      if (col[x] > 0) { xEnd = x; gap = 0; } else gap++;
      x++;
    }
    blocks.push({ x0, x1: xEnd, w: xEnd - x0 + 1 });
  }
  return blocks;
}

/** Аргументы вырезки словной полосы (полная высота полосы; паддинг по x в чёрные зазоры). */
const stripCrop = (x0, x1) =>
  [`${x1 - x0 + 1 + 2 * PAD}x${BAND_H}+${x0 - PAD}+${BAND_Y}`];

function main() {
  const check = process.argv.includes('--check');
  const tmp = mkdtempSync(join(tmpdir(), 'kaif-team-logo-'));
  try {
    const blocks = segmentWords(readBand(tmp));
    if (blocks.length !== OLD_WORDS.length)
      throw new Error(`словных блоков ${blocks.length}, ожидалось ${OLD_WORDS.length} ` +
        `(${OLD_WORDS.join(' | ')}); блоки: ${blocks.map((b) => `${b.x0}..${b.x1}`).join(' ')} — пороги требуют пересъёма`);

    const [wKaif, , wTeamTail] = [blocks[0], blocks[1], blocks[2]];
    const wordGap = blocks[1].x0 - blocks[0].x1 - 1; // измеренный словный пробел «KAIF»→«2.4»

    if (check) {
      // Самопроверка 1:1: полосы [блок1..блок3] и [блок4] на исходных местах чёрного поля = оригинал.
      const rebuilt = join(tmp, 'rebuilt.png'), orig = join(tmp, 'orig.png');
      run(['-size', `${ORIG_W}x${BAND_H}`, 'canvas:black',
        '(', GLYPH_SRC, '-alpha', 'off', '-crop', ...stripCrop(blocks[0].x0, blocks[2].x1), '+repage', ')',
        '-geometry', `+${blocks[0].x0 - PAD}+0`, '-composite',
        '(', GLYPH_SRC, '-alpha', 'off', '-crop', ...stripCrop(blocks[3].x0, blocks[3].x1), '+repage', ')',
        '-geometry', `+${blocks[3].x0 - PAD}+0`, '-composite',
        rebuilt]);
      run([GLYPH_SRC, '-alpha', 'off', '-crop', `${ORIG_W}x${BAND_H}+0+${BAND_Y}`, '+repage', orig]);
      let rmse = '';
      try { execFileSync('magick', ['compare', '-metric', 'RMSE', orig, rebuilt, 'null:'], { stdio: ['ignore', 'pipe', 'pipe'] }); rmse = '0 (0)'; }
      catch (e) { rmse = String(e.stderr).trim(); }
      const val = parseFloat(rmse);
      if (!(val >= 0) || val > 655) { console.error(`✗ --check: RMSE ${rmse} — пересборка старого текста разошлась с оригиналом`); process.exit(1); }
      console.log(`✅ --check: пересборка старого текста словными полосами совпала с оригиналом (RMSE ${rmse}, порог 655/65535 = 1%)`);
      return;
    }

    // Новая строка: [KAIF 2.4 — TEAM] + словный зазор + [KAIF], центр — центр старой подписи.
    const wA = blocks[2].x1 - blocks[0].x0 + 1;
    const wB = blocks[0].w;
    const total = wA + wordGap + wB;
    const center = Math.round((blocks[0].x0 + blocks[3].x1) / 2);
    const xA = center - Math.round(total / 2);
    const xB = xA + wA + wordGap;
    const sw = (v) => Math.round(v * SCALE);

    run([CANVAS_SRC, '-alpha', 'off', '-filter', 'Lanczos',
      '(', GLYPH_SRC, '-alpha', 'off', '-crop', ...stripCrop(blocks[0].x0, blocks[2].x1), '+repage',
      '-resize', `${sw(wA + 2 * PAD)}x${sw(BAND_H)}!`, ')',
      '-geometry', `+${sw(xA - PAD)}+${sw(BAND_Y)}`, '-composite',
      '(', GLYPH_SRC, '-alpha', 'off', '-crop', ...stripCrop(blocks[0].x0, blocks[0].x1), '+repage',
      '-resize', `${sw(wB + 2 * PAD)}x${sw(BAND_H)}!`, ')',
      '-geometry', `+${sw(xB - PAD)}+${sw(BAND_Y)}`, '-composite',
      OUT_PNG]);
    run([OUT_PNG, '-filter', 'Lanczos', '-resize', `${WEBP_SIDE}x${WEBP_SIDE}`, '-quality', String(WEBP_QUALITY), OUT_WEBP]);
    const mb = (p) => (statSync(p).size / 1048576).toFixed(2);
    console.log(`✅ подпись «KAIF 2.4 — TEAM KAIF» собрана словными полосами оригинала ×${SCALE.toFixed(4)}`);
    console.log(`   полоса A «KAIF 2.4 — TEAM» ${wA}px @${xA} · зазор ${wordGap}px · полоса B «KAIF» ${wB}px @${xB} (координаты 1254)`);
    console.log(`   → ${OUT_PNG} (${mb(OUT_PNG)} МБ) · ${OUT_WEBP} (${mb(OUT_WEBP)} МБ)`);
    console.log('   Открой PNG глазами: пересборка судится взглядом, не только числами (EXP-0071).');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main();
