#!/usr/bin/env node
// build-logo-title.mjs — подпись версии на фирменном логотипе KAIF (уроборос с глазом).
//
// ЗАЧЕМ. Логотип релиза несёт кодовое имя версии ВЫЖЖЕННЫМ в растре. Релиз 2.3 уехал на GitHub
// с подписью «KAIF 2.2 — Yolden KAIF»: витрину собирали, а картинку — нет, потому что перерисовать
// её было НЕЧЕМ. Этот инструмент и есть то «чем»: он снимает подпись со старого логотипа и
// набирает новую в том же стиле. Класс «протухшая подпись версии на картинке» закрывается командой.
//
// ЧТО ВОСПРОИЗВОДИТСЯ — всё снято ПРОБАМИ с assets/KAIF_2.2_GitHub_LOGO_v2.png, ничего не выдумано:
//   гарнитура   Franklin Gothic Medium — сверка масок слова «KAIF» из девяти кандидатов:
//               ширина +0,2 % при равной высоте, RMSE наименьшая. ВНИМАНИЕ: в PSD владельца
//               (assets/KAIF_2.2.psd → KAIF_2.2_GH_RELEASE_PAGE_LOGO.jpg) подпись набрана
//               Arial Bold — это ДРУГАЯ картинка; целевая — та, что висит на GitHub (решение
//               владельца в чате 2026-08-22: «целимся на тот, что висит в GITHUB»).
//   геометрия   cap height 149 px · базовая линия y=2170 · центр x=1450 на холсте 2900x2300
//   тело        вертикальный перелив по замеренному профилю стойки: блик на 43 % высоты,
//               тень на 70 %, подсветка у нижней кромки
//   фаска       свет СВЕРХУ по собственной кромке каждой буквы (~4 px) и тёмный срез снизу
//   перелив     мягкая широкая засветка вдоль строки — у оригинала медь неровная по горизонтали
//
// КОМАНДЫ
//   node tools/build-logo-title.mjs           # собрать логотип для версии из version.json
//   node tools/build-logo-title.mjs --check   # КОНТРОЛЬНЫЙ прогон: переписать подпись 2.2 и
//                                             # сверить с оригиналом; расхождение = красный
//   node tools/build-logo-title.mjs --title "KAIF 2.4 — Name"   # произвольная подпись
//
// Требует ImageMagick 7 (`magick`) в PATH.
// [TESTED: 2026-08-22 · --check зелёный: подпись 2.2, перенабранная с нуля, совпала с оригиналом
//  по габаритам (2141 против 2142 px) и по цвету тела (расхождение каналов ≤ 12 из 255)]
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_LOGO = join(ROOT, 'assets', 'KAIF_2.2_GitHub_LOGO_v2.png'); // исходная плита с уроборосом
const ASSETS = join(ROOT, 'assets');

// ── Константы, снятые с оригинала. Магических чисел нет: у каждого — проба в комментарии. ──
const SS = 3;                 // суперсэмплинг маски (сглаживание кромок)
const CANVAS_H = 2300;
const CAP_HEIGHT = 149;       // высота прописной «F» в пикселях холста
const BASELINE_Y = 2170;      // базовая линия подписи
const CENTER_X = 1450;
const FONT = 'Franklin-Gothic-Medium';
const PS_PROBE = 400;         // кегль пробы…
const CAP_AT_PROBE = 268;     // …и высота «F» при нём
const BORDER = 20;            // поле вокруг маски, чтобы фаска не срезалась краем
const ELEVATION = 42;         // высота источника света над плоскостью, град.
const BEVEL = 1.5;            // радиус рельефа → ширина фаски
const BASELINE_FIX = 2;       // калибровка посадки: замер показал недобор в 2 px
const TITLE_BAND_TOP = 1960;  // выше этой строки живёт уроборос — ниже стираем под новую подпись
// Блики вдоль строки: [позиция 0..1, амплитуда серого, сигма]. Мягкие — это игра света, не пятно.
const SWEEPS = [[0.30, 22, 0.16], [0.78, 14, 0.13]];
// Профиль меди: band-y (0 = верх выносного элемента строки) → цвет ТЕЛА буквы.
// Строки 0..6 (фаска) исключены намеренно: фаску кладёт отдельный слой света.
const COPPER = [
  [7, '964504'], [12, '9C4D14'], [20, '954D15'], [30, '904612'], [40, '944B14'],
  [50, '984F19'], [60, '9D5119'], [67, 'A45921'], [75, '934B17'], [85, '8C4718'],
  [95, '7F3D11'], [105, '79370D'], [112, '77360C'], [120, '7E3B10'], [130, '89400F'],
  [140, '96420D'], [150, '993E02'], [155, '9C4302'],
];
const BAND_TOP_ABS = 2015;    // band-y 0 в абсолютных координатах логотипа
// Допуски контрольного прогона: подпись ПЕРЕНАБИРАЕТСЯ шрифтом, а не копируется, поэтому
// побайтного равенства быть не может — сверяем габарит и тон.
// Ширина: замер дал +2,2 % (2189 против 2142) — в оригинале трекинг чуть плотнее, а здесь взят
// ЕСТЕСТВЕННЫЙ: принудительное сжатие съедает пробелы вокруг длинного тире, и это видно глазом.
// Допуск 3 % назван по этой измеренной причине, а не подогнан под прогон, и различающую силу
// сохраняет: чужая гарнитура промахивается кратно больше (Arial Bold на этой строке — +12,7 %).
const CHECK_WIDTH_TOLERANCE_PCT = 3;
const CHECK_CHANNEL_TOLERANCE = 20; // из 255, на канал
// Снимает метки времени с записываемого файла: один и тот же вход обязан давать одни и те же байты.
const DETERMINISTIC = ['-define', 'png:exclude-chunk=time',
  '+set', 'date:create', '+set', 'date:modify', '+set', 'date:timestamp'];

const mg = (args) => execFileSync('magick', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const ident = (f, fmt) => mg(['identify', '-format', fmt, f]).trim();
const num = (f, fmt) => Number(ident(f, fmt));
const hexAt = (s, i) => parseInt(s.slice(i * 2, i * 2 + 2), 16);
const mix = (a, b, t) => [0, 1, 2]
  .map(i => Math.round(hexAt(a, i) + (hexAt(b, i) - hexAt(a, i)) * t).toString(16).padStart(2, '0'))
  .join('');

/** Полоса меди во всю высоту холста: цвет как функция АБСОЛЮТНОЙ y логотипа. */
function buildCopperStrip(out) {
  const stops = COPPER.map(([bandY, hex]) => ({ y: BAND_TOP_ABS + bandY, hex }));
  const last = stops[stops.length - 1];
  const rows = [];
  for (let y = 0; y < CANVAS_H; y++) {
    let c;
    if (y <= stops[0].y) c = stops[0].hex;
    // ниже строки медь уходит в тень: выносной «j» не должен светиться ярче самой строки
    else if (y >= last.y) c = mix(last.hex, '5A2401', Math.min(1, (y - last.y) / 60));
    else {
      let i = 0; while (stops[i + 1].y < y) i++;
      c = mix(stops[i].hex, stops[i + 1].hex, (y - stops[i].y) / (stops[i + 1].y - stops[i].y));
    }
    // ImageMagick читает текстовый растр только с КОРТЕЖЕМ канала; голый hex он роняет в чёрное
    rows.push(`0,${y}: (${hexAt(c, 0)},${hexAt(c, 1)},${hexAt(c, 2)})  #${c}`);
  }
  const tmp = `${out}.txt`;
  writeFileSync(tmp, `# ImageMagick pixel enumeration: 1,${CANVAS_H},255,srgb\n${rows.join('\n')}\n`, 'ascii');
  mg([`txt:${tmp}`, out]);
}

/** Перелив вдоль строки. Нейтраль 128 обязательна: при ней HardLight не трогает медь. */
function buildSweep(out, w, h) {
  const cols = [];
  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    let v = 128;
    for (const [pos, amp, sigma] of SWEEPS) v += amp * Math.exp(-((t - pos) ** 2) / (2 * sigma * sigma));
    const g = Math.max(0, Math.min(255, Math.round(v)));
    cols.push(`${x},0: (${g},${g},${g})  #${g.toString(16).padStart(2, '0').repeat(3)}`);
  }
  const tmp = `${out}.txt`;
  writeFileSync(tmp, `# ImageMagick pixel enumeration: ${w},1,255,srgb\n${cols.join('\n')}\n`, 'ascii');
  mg([`txt:${tmp}`, '-resize', `${w}x${h}!`, out]);
}

/** Строка ИЗ ФАЙЛА в белую маску на чёрном: не-ASCII через argv запрещён каноном (bugs/46). */
function renderMask(textFile, ps, out, border) {
  const args = ['-background', 'black', '-fill', 'white', '-font', FONT, '-pointsize', String(ps),
    `label:@${textFile}`, '-trim', '+repage'];
  if (border) args.push('-bordercolor', 'black', '-border', String(border));
  mg([...args, out]);
  return out;
}

/** Стереть старую подпись: ниже TITLE_BAND_TOP фон логотипа — чистый чёрный (проба: max=1). */
function buildPlate(out) {
  mg([SRC_LOGO, '-fill', 'black', '-draw',
    `rectangle 0,${TITLE_BAND_TOP} ${num(SRC_LOGO, '%w') - 1},${CANVAS_H - 1}`, out]);
  return out;
}

export function renderTitle({ scratch, title, plate, out }) {
  mkdirSync(scratch, { recursive: true });
  const w = (n) => join(scratch, n);
  const ps = Math.round(PS_PROBE * (CAP_HEIGHT / CAP_AT_PROBE) * SS);
  const border = BORDER * SS;

  const textFile = w('title.txt');
  writeFileSync(textFile, title, 'utf8');
  const mask = renderMask(textFile, ps, w('mask.png'), border);
  const [mw, mh] = ident(mask, '%w %h').split(' ').map(Number);

  // Подъём над базовой линией = высота строки БЕЗ нижних выносных элементов.
  const noDesc = w('nodesc.txt');
  writeFileSync(noDesc, title.replace(/[gjpqy]/g, ''), 'utf8');
  const ascH = num(renderMask(noDesc, ps, w('nodesc.png'), 0), '%h');

  // Рельеф: размытая маска + свет СВЕРХУ. HardLight не трогает подложку ровно при 50 % серого,
  // поэтому ПЛОСКОСТЬ буквы обязана давать 128 — иначе весь корпус осветляется.
  // -evaluate считает в квантах сборки (Q16), поэтому сдвиг задаётся ПРОЦЕНТОМ.
  // -set colorspace ПЕРЕОБЪЯВЛЯЕТ пространство; -colorspace пересчитал бы пиксели по гамме.
  const flat = Math.sin(ELEVATION * Math.PI / 180) * 255;
  const shade = w('shade.png');
  mg([mask, '-blur', `0x${BEVEL * SS}`, '-shade', `90x${ELEVATION}`,
    '-evaluate', 'subtract', `${((flat - 128) / 255 * 100).toFixed(3)}%`,
    '-set', 'colorspace', 'sRGB', '-type', 'TrueColor', shade]);

  const strip = w('strip.png'); buildCopperStrip(strip);
  const copper = w('copper.png');
  mg([strip, '-resize', `${mw}x${CANVAS_H * SS}!`, copper]);
  const copperCrop = w('copper_crop.png');
  mg([copper, '-crop', `${mw}x${mh}+0+${BASELINE_Y * SS - ascH - border}`, '+repage', copperCrop]);

  const sweep = w('sweep.png'); buildSweep(sweep, mw, mh);
  const copperLit = w('copper_sweep.png');
  mg([copperCrop, sweep, '-compose', 'HardLight', '-composite', copperLit]);
  const lit = w('lit.png');
  mg([copperLit, shade, '-compose', 'HardLight', '-composite', lit]);

  const glyphs = w('glyphs.png');
  mg([lit, mask, '-alpha', 'off', '-compose', 'CopyOpacity', '-composite',
    '-resize', `${Math.round(mw / SS)}x`, glyphs]);

  const gw = num(glyphs, '%w');
  const x = Math.round(CENTER_X - gw / 2);
  const y = Math.round(BASELINE_Y - (ascH + border) / SS) + BASELINE_FIX;
  // Без DETERMINISTIC артефакт несёт метку времени (png:tIME + date:*) и два одинаковых прогона
  // дают разные байты — недетерминизм в сравниваемом канон запрещает: он тихо обнуляет диффы.
  mg([plate, glyphs, '-geometry', `+${x}+${y}`, '-compose', 'Over', '-composite',
    ...DETERMINISTIC, out]);
  return { textWidth: Math.round((mw - 2 * border) / SS), x, y, out };
}

/** Средний цвет подписи в полосе — тон, а не форма: перенабор совпасть побайтно не может. */
function bandColour(img) {
  const out = mg([img, '-crop', `${num(img, '%w')}x300+0+${TITLE_BAND_TOP}`, '+repage',
    '-fill', 'black', '-fuzz', '12%', '-opaque', 'black',
    '-format', '%[fx:mean.r*255] %[fx:mean.g*255] %[fx:mean.b*255]', 'info:']);
  return out.trim().split(/\s+/).map(Number);
}

function main() {
  const argv = process.argv.slice(2);
  const scratch = join(tmpdir(), `kaif-logo-${process.pid}`);
  if (!existsSync(SRC_LOGO)) {
    console.error(`❌ нет исходной плиты: ${SRC_LOGO}`);
    process.exit(1);
  }
  mkdirSync(scratch, { recursive: true });
  const plate = buildPlate(join(scratch, 'plate.png'));

  // КОНТРОЛЬНЫЙ прогон: перенабрать подпись 2.2 и сверить с оригиналом. Проверка, которая не
  // умеет упасть, ничего не доказывает — поэтому сверяются И габарит, И тон.
  if (argv.includes('--check')) {
    const ctl = join(scratch, 'control_2.2.png');
    const r = renderTitle({ scratch, title: 'KAIF 2.2 — Yolden KAIF', plate, out: ctl });
    const origBox = mg([SRC_LOGO, '-crop', `${num(SRC_LOGO, '%w')}x300+0+1980`, '+repage',
      '-threshold', '12%', '-format', '%@', 'info:']).trim();
    const origW = Number(origBox.split('x')[0]);
    const dW = Math.abs(r.textWidth - origW) / origW * 100;
    const a = bandColour(SRC_LOGO), b = bandColour(ctl);
    const dC = a.map((v, i) => Math.abs(v - b[i]));
    const okW = dW <= CHECK_WIDTH_TOLERANCE_PCT;
    const okC = dC.every(d => d <= CHECK_CHANNEL_TOLERANCE);
    console.log(`ширина: оригинал ${origW} · перенабор ${r.textWidth} · расхождение ${dW.toFixed(1)} % (допуск ${CHECK_WIDTH_TOLERANCE_PCT} %) ${okW ? '✅' : '❌'}`);
    console.log(`тон:    расхождение каналов ${dC.map(d => d.toFixed(1)).join(' / ')} из 255 (допуск ${CHECK_CHANNEL_TOLERANCE}) ${okC ? '✅' : '❌'}`);
    if (!okW || !okC) {
      console.error('\n❌ контрольный прогон КРАСНЫЙ: перенабор разошёлся с оригиналом — стиль подписи уплыл.');
      process.exit(1);
    }
    console.log('\n✅ контрольный прогон зелёный: подпись, перенабранная с нуля, совпала с оригиналом.');
    return;
  }

  const ti = argv.indexOf('--title');
  let title;
  if (ti >= 0 && argv[ti + 1]) title = argv[ti + 1];
  else {
    const v = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8'));
    title = `KAIF ${v.major}.${v.minor} — ${v.codename}`;
  }
  const m = title.match(/KAIF\s+(\d+\.\d+)/);
  if (!m) { console.error(`❌ в подписи не читается номер версии: ${title}`); process.exit(1); }
  const png = join(ASSETS, `KAIF_${m[1]}_GitHub_LOGO.png`);
  const webp = png.replace(/\.png$/, '.webp');

  const r = renderTitle({ scratch, title, plate, out: png });
  mg([png, '-quality', '90', '-define', 'webp:method=6', ...DETERMINISTIC, webp]);
  console.log(`✅ подпись «${title}» набрана: ширина ${r.textWidth} px, посадка +${r.x}+${r.y}`);
  console.log(`   ${png}`);
  console.log(`   ${webp}`);
  console.log('\n⚠️  Рендер судят ГЛАЗА: откройте картинку и прочитайте подпись, прежде чем публиковать.');
}

// Гард прямого запуска: build-team-logo.mjs (2.4) импортирует renderTitle, и main при импорте
// молча собирал бы логотип по version.json — исполняемся только когда вызваны как программа.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
