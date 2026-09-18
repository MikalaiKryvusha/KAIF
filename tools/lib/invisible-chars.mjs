// tools/lib/invisible-chars.mjs — ОДНО место, где названо, какие символы в теле исходника считаются невидимыми, и один
// сканер на стража сборки (`tools/check-framework.mjs`) и пробу (`tools/sandbox/probes/invisible-characters.mjs`).
//
// КЛАСС (bugs/122). Агент набирает в параметре инструмента правки escape-последовательность вида «обратная косая + u +
// четыре шестнадцатеричные цифры» — слой инструмента декодирует её ДО записи, и в файл ложится НАСТОЯЩИЙ символ. Символ
// внутри регулярного выражения или строки РАБОТАЕТ так же, как работал бы escape, поэтому ни один свод не краснеет; а
// глаз, дифф и ревью читают `replace(/^<символ>/, '')` как `replace(/^/, '')` — и первый, кто перепишет строку «как
// видит», молча выключает поведение. На 2026-09-18 так было записано ВСЁ снятие BOM проекта — 39 мест исходников.
//
// Набор собран ИЗ ЧИСЕЛ: в этом файле нет ни одного символа, на который он охотится, и ни одной escape-последовательности,
// которую слой инструмента мог бы раскрыть.
// [TESTED: 2026-09-18 12:23 +03:00 · тем же набором и тем же обходом (тогда — телом пробы) снят инвентарь дерева истока:
//  877 файлов, 66 вхождений, 39 в зонах исходников; после нормализации шести мест сессии счёт упал ровно на шесть —
//  testcases/reports/2026-09-18_hooks-optin-smoke.md, прогоны 8 и 11.
//  2026-09-18 14:13 → 14:57 +03:00 · `normalizeSource` на двадцати реальных файлах истока: 39 символов → escape, после
//  пересборки `scanText` по 886 файлам — ноль; тем же сканером гард 5h сборки красный на дереве ДО нормализации (20
//  файлов, 12:57) и на копии с возвращённым символом (две названные строки, 14:27) —
//  testcases/reports/2026-09-18_invisible-characters.md, прогоны 1, 4, 11, 12]

// U+FEFF · пробелы и соединители нулевой ширины · метки направления · word joiner · мягкий перенос · встраивания и
// переопределения направления · DEL · и управляющие C0, которые исходнику не нужны (всё ниже U+0020, кроме TAB, LF, CR).
const C0_CONTROLS = Array.from({ length: 32 }, (_, c) => c).filter((c) => c !== 0x09 && c !== 0x0A && c !== 0x0D);
export const CODE_POINTS = new Set([0xFEFF, 0x200B, 0x200C, 0x200D, 0x200E, 0x200F, 0x2060, 0x00AD,
  0x202A, 0x202B, 0x202C, 0x202D, 0x202E, 0x7F, ...C0_CONTROLS]);

export const label = (c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0');
/** Видимая запись символа для исходника JavaScript: шесть ASCII-знаков, собранных из кодов. */
export const escapeOf = (c) => String.fromCharCode(92) + 'u' + c.toString(16).toUpperCase().padStart(4, '0');

/** Все вхождения в тексте: [{ line, col, code, text }]; BOM в нулевой позиции файла — свойство файла, не находка. */
export function scanText(text) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (let k = 0; k < line.length; k++) {
      const c = line.charCodeAt(k);
      if (!CODE_POINTS.has(c) || (c === 0xFEFF && i === 0 && k === 0)) continue;
      hits.push({ line: i + 1, col: k + 1, code: c,
        text: [...line].map((ch) => (CODE_POINTS.has(ch.charCodeAt(0)) ? '<' + label(ch.charCodeAt(0)) + '>' : ch)).join('').trim().slice(0, 120) });
    }
  });
  return hits;
}

/** Текст, где каждое вхождение заменено своей escape-записью (только для исходников JavaScript — см. пробу, `--fix`). */
export function normalizeSource(text) {
  const head = text.charCodeAt(0) === 0xFEFF ? text[0] : '';
  let n = 0;
  const body = [...text.slice(head.length)].map((ch) => { const c = ch.charCodeAt(0); if (ch.length === 1 && CODE_POINTS.has(c)) { n++; return escapeOf(c); } return ch; }).join('');
  return { text: head + body, replaced: n };
}
