#!/usr/bin/env node
// build-team-logo.mjs — логотип релиза 2.4: арт владельца v2 + подпись фирменным стилем 2.3.
//
// ЗАЧЕМ. Первая сборка логотипа 2.4 (словными полосами из caption старого арта) забракована
// владельцем по двум пунктам (`bugs/107`): гарнитура не 2.3 и имя версии не заказанное. Эта
// версия инструмента собирает логотип по его плану починки: арт v2 владельца остаётся
// НЕТРОНУТЫМ ПОБАЙТНО, вокруг него — чёрные поля, внизу — подпись
// «KAIF 2.4 — Teamed Up KAIF» (имя — слово владельца 2026-08-28 11:19 +03:00, решение №82),
// НАБРАННАЯ механикой build-logo-title.mjs — тем же Franklin Gothic Medium, медью и фаской,
// что на логотипах 2.2/2.3 (стиль снят пробами с плиты GitHub; его верность стережёт
// `node tools/build-logo-title.mjs --check`).
//
// ГЕОМЕТРИЯ — ВСЯ композиция это плита 2.3, масштабированная ОДНИМ коэффициентом
// s = W_арта_v2 / W_арта_2.3 (арт-зона плиты — bbox 1542x1571+679+164; арт v2 — 3609 шириной):
// поля сверху/слева/справа, воздух арт→строка, кегль и полоса подписи — всё ×s. Выбор владельца
// на сравнительном листе из трёх панелей (2.3 · подпись малая · подпись как в 2.3), чат
// 2026-08-28: «Вариант B» — после двух его вердиктов на показах («добавь чёрных отступов
// сверху, справа, слева, а то слишком близко медальон к краю, не так, как в старом лого»;
// «посмотри, сколько воздуха было в старом лого!»). Числа плиты сняты пробами
// identify/threshold/bbox 2026-08-28, ничего не выдумано.
//
// КОМАНДЫ
//   node tools/build-team-logo.mjs           # собрать: PNG (размер печатает прогон) + лёгкая WEBP
//   node tools/build-team-logo.mjs --check   # проверить СОБРАННЫЙ артефакт: размер холста ·
//                                            # арт владельца в выходе побайтно равен исходнику ·
//                                            # поля как у 2.3 · подпись есть, отцентрована и
//                                            # МЕДНАЯ (не серебро) · углы полосы чисто чёрные.
//
// Требует ImageMagick 7 (`magick`) в PATH. [TESTED: 2026-08-28 · --check красный на подсунутом
// браке v1 (все оси) и зелёный на сборке; стиль подписи отдельно доказан зелёным
// build-logo-title --check; тон меди сверен замером с 2.3; показ владельцу — до коммита]
import { execFileSync } from 'node:child_process';
import { statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { renderTitle } from './build-logo-title.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Исходник по слову владельца в чате 2026-08-28 ~12:19 +03:00: «сделал логотип v2, и там есть
// версия увеличенная через ультрамикс - её бери».
const ART_SRC = join(ROOT, 'assets', 'KAIF 2.4 - Teamed Up KAIF v2 logo_upscayl_3x_ultramix-balanced-4x.png');
// Подпись — `--title "KAIF X.Y — Name"` (2.5, решение №89: «логотип оставляем от 2.4 версии, только
// меняем текст-подпись»); без флага — подпись 2.4 (решение №82). Имя выходного файла — от версии
// в подписи, как в build-logo-title: артефакт с версией в имени не перезаписывает соседнюю версию.
const titleIdx = process.argv.indexOf('--title');
const TITLE = titleIdx >= 0 && process.argv[titleIdx + 1] ? process.argv[titleIdx + 1] : 'KAIF 2.4 — Teamed Up KAIF';
const TITLE_VER = (TITLE.match(/^KAIF (\d+\.\d+)/) || [])[1];
if (!TITLE_VER) { console.error(`✖ подпись должна начинаться с "KAIF X.Y": ${TITLE}`); process.exit(1); }
const OUT_PNG = join(ROOT, 'assets', `KAIF_${TITLE_VER}_GitHub_LOGO.png`);
const OUT_WEBP = join(ROOT, 'assets', `KAIF_${TITLE_VER}_GitHub_LOGO.webp`);

// ── Плита 2.3 (донор геометрии; все числа — пробы 2026-08-28, шапка выше) ────────────────────
const PLATE_W = 2900, PLATE_H = 2300;
const PLATE_ART_BOTTOM = 1735;  // низ уробороса: bbox арта без полосы подписи (164+1571)
const PLATE_BAND_TOP = 1960;    // ниже — зона подписи (TITLE_BAND_TOP донора)
const PLATE_ART_W = 1542;       // арт-зона плиты: bbox 1542x1571+679+164
const PLATE_ART_SIDE = 679;     //   боковое поле (слева и справа симметрично)
const PLATE_ART_TOP = 164;      //   верхнее поле
// ── Арт v2 (пробы 2026-08-28: identify + threshold-bbox 3609x3555+74+43) ─────────────────────
const ART_FILE_W = 3762, ART_FILE_H = 3762; // размер ФАЙЛА владельца
const ART_BOX_X = 74, ART_BOX_Y = 43;       // где в файле живёт содержимое…
const ART_BOX_W = 3609, ART_BOX_H = 3555;   // …и каков его габарит
// ── Ручки вкуса — калибровка владельца поверх пропорций 2.3 (показ, чат 2026-08-28) ──────────
// После выбора варианта B владелец дал три поправки, каждая — своя ручка; значения подобраны
// показом и меняются ТОЛЬКО его словом:
const TUNE_MARGIN = 0.85;   // «а медальон наоборот станет чуть-чуть больше» → поля чуть меньше
const TUNE_CAPTION = 0.85;  // «и текст чуть-чуть уменьши»
const TUNE_GAP = 0.55;      // «но текст подними выше к медальону»
// ── Производные композиции: плита 2.3 × s, поправленная ручками вкуса ────────────────────────
const S_ART = ART_BOX_W / PLATE_ART_W;      // 2.3405…: единый масштаб «плита 2.3 → холст 2.4»
const S_CAP = S_ART * TUNE_CAPTION;         // 1.9894…: масштаб блока подписи
const MARGIN_SIDE = Math.round(PLATE_ART_SIDE * S_ART * TUNE_MARGIN); // 1351: чёрное поле по бокам
const MARGIN_TOP = Math.round(PLATE_ART_TOP * S_ART * TUNE_MARGIN);   // 326: чёрное поле сверху
const ART_X = MARGIN_SIDE - ART_BOX_X;      // 1277: файл кладётся так, чтобы СОДЕРЖИМОЕ…
const ART_Y = MARGIN_TOP - ART_BOX_Y;       // 283:  …легло ровно на расчётные поля
const CANVAS_W = MARGIN_SIDE * 2 + ART_BOX_W;           // 6311
const ART_BOTTOM = ART_Y + ART_BOX_Y + ART_BOX_H;       // 3881: низ медальона на холсте
const GAP = Math.round((PLATE_BAND_TOP - PLATE_ART_BOTTOM) * S_ART * TUNE_GAP); // 290
const BAND_H_SRC = PLATE_H - PLATE_BAND_TOP;            // 340: полоса подписи на плите
const BAND_W = Math.round(PLATE_W * S_CAP); // 5769: полоса подписи в масштабе S_CAP
const BAND_H = Math.round(BAND_H_SRC * S_CAP);          // 676
const BAND_X = Math.round((CANVAS_W - BAND_W) / 2);     // 271: полоса по центру холста
const BAND_Y = ART_BOTTOM + GAP;                        // 4171
const CANVAS_H = BAND_Y + BAND_H;                       // 4847
const WEBP_SIDE = 2000;         // витринная webp (README width=560): вписывается в 2000x2000
const WEBP_QUALITY = 82;        // ориентир лёгкости — webp 2.3 (463 КБ); чёрный жмётся отлично
const CHECK_RMSE_MAX = 0;       // арт владельца в выходе — ПОБАЙТНО исходник, без допуска
const CENTER_TOLERANCE = 4;     // px: центр подписи против центра холста (AA-кромки дрожат на ±1)
const MARGIN_TOLERANCE = 2;     // px: поля выхода против расчётных (порог 12% дрожит на кромке)
// Медь, не серебро: средний тон чернил подписи обязан быть тёплым, как у 2.3 (замер эталона:
// 20.8/12.2/6.1). Ось оплачена живым дефектом этой же сессии: PNG-писатель схлопнул чёрную
// плиту в grayscale, подпись вышла R=G=B 21/21/21 — и остальные оси остались зелёными.
const COPPER_MIN_RG = 4;        // r − g чернил не меньше этого (у серебра 0)
const COPPER_MIN_GB = 3;        // g − b чернил не меньше этого

const mg = (args) => execFileSync('magick', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
// Снимает метки времени: один вход обязан давать одни байты (канон детерминизма сравниваемого).
const DETERMINISTIC = ['-define', 'png:exclude-chunk=time',
  '+set', 'date:create', '+set', 'date:modify', '+set', 'date:timestamp'];

function build() {
  const tmp = mkdtempSync(join(tmpdir(), 'kaif-team-logo-'));
  try {
    // 1. Подпись родным масштабом стиля 2.3 на чистой чёрной плите. Формат PNG24 ОБЯЗАТЕЛЕН:
    //    PNG-писатель ImageMagick схлопывает полностью чёрный холст в grayscale ПРИ ЗАПИСИ
    //    (проба: даже с `-set colorspace sRGB -type TrueColor` на диске Gray PseudoClass),
    //    финальный composite renderTitle наследует пространство плиты — и медь подписи молча
    //    обесцвечивается в серебро. PNG24 запрещает редукцию по построению.
    const plate = join(tmp, 'black-plate.png');
    mg(['-size', `${PLATE_W}x${PLATE_H}`, 'canvas:black', `PNG24:${plate}`]);
    const caption = join(tmp, 'caption.png');
    renderTitle({ scratch: tmp, title: TITLE, plate, out: caption });

    // 2. Полоса подписи → масштаб f (Lanczos: тот же фильтр, что в доноре).
    const band = join(tmp, 'band.png');
    mg([caption, '-crop', `${PLATE_W}x${BAND_H_SRC}+0+${PLATE_BAND_TOP}`, '+repage',
      '-filter', 'Lanczos', '-resize', `${BAND_W}x${BAND_H}!`, band]);

    // 3. Холст: чёрное поле по расчёту 2.3, арт владельца нетронутым, полоса — по центру снизу.
    //    -alpha off обязателен: арт srgba, и альфа при наивном composite травит статистику
    //    проверок (урок v1-сборки).
    mg(['-size', `${CANVAS_W}x${CANVAS_H}`, 'canvas:black',
      '(', ART_SRC, '-alpha', 'off', ')', '-geometry', `+${ART_X}+${ART_Y}`, '-compose', 'Over', '-composite',
      band, '-geometry', `+${BAND_X}+${BAND_Y}`, '-compose', 'Over', '-composite',
      ...DETERMINISTIC, `PNG24:${OUT_PNG}`]);

    // 4. Лёгкая витринная webp с чистым чёрным фоном.
    mg([OUT_PNG, '-filter', 'Lanczos', '-resize', `${WEBP_SIDE}x${WEBP_SIDE}`,
      '-quality', String(WEBP_QUALITY), '-define', 'webp:method=6', ...DETERMINISTIC, OUT_WEBP]);

    const mb = (p) => (statSync(p).size / 1048576).toFixed(2);
    console.log(`✅ подпись «${TITLE}» набрана стилем 2.3 (build-logo-title), поля — по плите 2.3`);
    console.log(`   холст ${CANVAS_W}x${CANVAS_H} · поля бок ${MARGIN_SIDE} / верх ${MARGIN_TOP} · воздух арт→полоса ${GAP}px · полоса ${BAND_W}x${BAND_H} @+${BAND_X}+${BAND_Y}`);
    console.log(`   → ${OUT_PNG} (${mb(OUT_PNG)} МБ) · ${OUT_WEBP} (${mb(OUT_WEBP)} МБ)`);
    console.log('   Рендер судят ГЛАЗА владельца (класс «вкус»): показ ДО коммита — bugs/107.');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/** Проверки собранного артефакта; красный — process.exit(1) с причиной. */
function check() {
  let bad = 0;
  const fail = (m) => { console.error(`❌ ${m}`); bad++; };
  const okay = (m) => console.log(`✅ ${m}`);

  const dims = mg(['identify', '-format', '%wx%h', OUT_PNG]).trim();
  if (dims !== `${CANVAS_W}x${CANVAS_H}`) fail(`холст ${dims}, ожидался ${CANVAS_W}x${CANVAS_H}`);
  else okay(`холст ${dims}`);

  const tmp = mkdtempSync(join(tmpdir(), 'kaif-team-logo-check-'));
  try {
    // Арт владельца в выходе — побайтно исходник (пиксели, RMSE строго 0).
    const artCrop = join(tmp, 'art.png');
    mg([OUT_PNG, '-crop', `${ART_FILE_W}x${ART_FILE_H}+${ART_X}+${ART_Y}`, '+repage', artCrop]);
    let rmse = '0 (0)';
    try {
      execFileSync('magick', ['compare', '-metric', 'RMSE', ART_SRC, artCrop, 'null:'],
        { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) { rmse = String(e.stderr).trim(); }
    const val = parseFloat(rmse);
    if (!(val <= CHECK_RMSE_MAX)) fail(`арт владельца изменён: RMSE ${rmse} (допуск ${CHECK_RMSE_MAX})`);
    else okay(`арт владельца в выходе побайтно равен исходнику (RMSE ${rmse})`);

    // Подпись в полосе есть и отцентрована; порог 12% — как во всех пробах этой пары артов.
    let capLeft = null;
    const bbox = mg([OUT_PNG, '-crop', `${CANVAS_W}x${BAND_H}+0+${BAND_Y}`, '+repage',
      '-threshold', '12%', '-format', '%@', 'info:']).trim();
    const m = bbox.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
    if (!m) fail(`полоса подписи пуста (bbox: ${bbox})`);
    else {
      const [, bw, , bx] = m.map(Number);
      capLeft = bx;
      const center = bx + bw / 2, want = CANVAS_W / 2;
      if (Math.abs(center - want) > CENTER_TOLERANCE)
        fail(`подпись не отцентрована: центр ${center}, ожидался ${want}±${CENTER_TOLERANCE}`);
      else okay(`подпись в полосе: ширина ${bw}px, центр ${center} (холст ${want})`);
      if (bw < BAND_W * 0.5 || bw > BAND_W * 0.95)
        fail(`ширина подписи ${bw}px вне разумного коридора [50%..95%] полосы ${BAND_W}`);
    }

    // Поля как заказано: верхнее — строго поле арта; левую кромку общего bbox задаёт либо арт,
    // либо подпись — та из них, что шире (ось — вердикты владельца о воздухе на показах).
    const full = mg([OUT_PNG, '-threshold', '12%', '-format', '%@', 'info:']).trim();
    const fm = full.match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
    if (!fm) fail(`bbox выхода не читается: ${full}`);
    else {
      const [, , , fx, fy] = fm.map(Number);
      const wantFx = capLeft === null ? MARGIN_SIDE : Math.min(MARGIN_SIDE, capLeft);
      if (Math.abs(fx - wantFx) > MARGIN_TOLERANCE || Math.abs(fy - MARGIN_TOP) > MARGIN_TOLERANCE)
        fail(`поля выхода +${fx}+${fy}, расчёт +${wantFx}+${MARGIN_TOP} (±${MARGIN_TOLERANCE})`);
      else okay(`поля: содержимое начинается на +${fx}+${fy} (арт: бок ${MARGIN_SIDE}, верх ${MARGIN_TOP})`);
    }

    // Медь, не серебро: тон чернил подписи тёплый, как у стиля 2.3.
    const ink = mg([OUT_PNG, '-crop', `${CANVAS_W}x${BAND_H}+0+${BAND_Y}`, '+repage',
      '-fuzz', '10%', '-transparent', 'black',
      '-format', '%[fx:mean.r*255] %[fx:mean.g*255] %[fx:mean.b*255]', 'info:'])
      .trim().split(/\s+/).map(Number);
    const [ir, ig, ib] = ink;
    if (ir - ig < COPPER_MIN_RG || ig - ib < COPPER_MIN_GB)
      fail(`подпись не медная: тон чернил ${ir.toFixed(1)}/${ig.toFixed(1)}/${ib.toFixed(1)} ` +
        `(нужно r−g ≥ ${COPPER_MIN_RG} и g−b ≥ ${COPPER_MIN_GB}; серебро даёт R=G=B)`);
    else okay(`подпись медная: тон чернил ${ir.toFixed(1)}/${ig.toFixed(1)}/${ib.toFixed(1)} (эталон 2.3: 20.8/12.2/6.1)`);

    // Углы полосы — чисто чёрные: композиция не принесла мусора.
    for (const [x, y] of [[0, BAND_Y], [CANVAS_W - 40, CANVAS_H - 40]]) {
      const mean = parseFloat(mg([OUT_PNG, '-crop', `40x40+${x}+${y}`, '+repage',
        '-format', '%[fx:mean*255]', 'info:']).trim());
      if (mean > 1) fail(`угол полосы +${x}+${y} не чёрный (mean ${mean.toFixed(2)})`);
    }
    if (!bad) okay('углы полосы подписи чисто чёрные');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (bad) { console.error(`\n❌ --check КРАСНЫЙ: расхождений ${bad}`); process.exit(1); }
  console.log('\n✅ --check зелёный. Стиль подписи отдельно стережёт build-logo-title --check; красоту судит владелец.');
}

if (process.argv.includes('--check')) check();
else build();
