#!/usr/bin/env node
// tools/release-body-guard.mjs — страж КЛАССА «опубликованное тело релиза разошлось с файлом нот»
// (bugs/98 №2). Полевой случай: страница релиза v2.2 несла нотацию разрядов, отвергнутую
// владельцем дважды, и обычные пробелы вместо неразрывных — ровно в восьми строках, которые он
// правил, при четырёх зелёных инструментах по ИСХОДНИКУ. Проверка исходника не является
// проверкой публикации (EXP-0071): этот страж сверяет то, что РЕАЛЬНО опубликовано
// (`gh release view --json body`), с файлом-исходником нот, построчно.
//
// Использование:
//   node tools/release-body-guard.mjs                # тег из version.json → vMAJOR.MINOR
//   node tools/release-body-guard.mjs --tag v2.2     # явный тег (файл нот выводится из тега)
//   node tools/release-body-guard.mjs --selftest     # красный доказан фикстурами, БЕЗ сети
//
// Гоняется шагом 6.9 навыка /release — механическая половина гейта публикации, ПОСЛЕ публикации,
// рядом с чтением страницы глазами. Глаза он НЕ заменяет: рендер (врап, картинки, ссылки) судят
// глаза; страж судит ТЕКСТ. Известная законная разница: GitHub может добавить пустой хвост телу —
// хвостовые пустые строки не считаются расхождением (так записано и в bugs/98 №2).
// [TESTED: 2026-08-21 · --selftest: красный на подмене нотации и на потере NBSP, молчание на
//  чистой копии и на пустом хвосте; живой прогон против v2.2 — совпадение]
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : null; };

const die = (s) => { console.error('✖ ' + s); process.exit(1); };

/**
 * Сравнение опубликованного тела с файлом нот. Возвращает список расхождений (пустой = совпало).
 * Нормализация — ровно та, что в улике bugs/98 №2: CRLF → LF, хвостовые ПУСТЫЕ строки не в счёт.
 */
export function compareBodies(pageText, fileText) {
  const norm = (t) => {
    const lines = String(t).replace(/\r\n/g, '\n').split('\n');
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    return lines;
  };
  const page = norm(pageText);
  const file = norm(fileText);
  const out = [];
  const n = Math.max(page.length, file.length);
  for (let i = 0; i < n; i += 1) {
    const p = page[i];
    const f = file[i];
    if (p === f) continue;
    out.push({ line: i + 1, page: p === undefined ? '(нет строки)' : p, file: f === undefined ? '(нет строки)' : f });
  }
  // NBSP — отдельная ось той же улики: страница v2.2 потеряла все неразрывные пробелы файла.
  const nbsp = (t) => (String(t).match(/ /g) || []).length;
  return { diffs: out, nbspPage: nbsp(pageText), nbspFile: nbsp(fileText) };
}

function report(tag, notesPath, r) {
  if (!r.diffs.length && r.nbspPage === r.nbspFile) {
    console.log(`✅ release-body-guard: опубликованное тело ${tag} совпадает с ${notesPath} построчно (NBSP ${r.nbspFile}/${r.nbspPage})`);
    return 0;
  }
  console.error(`✖ release-body-guard: опубликованное тело ${tag} РАСХОДИТСЯ с ${notesPath}:`);
  if (r.nbspPage !== r.nbspFile) console.error(`  · NBSP: в файле ${r.nbspFile}, на странице ${r.nbspPage} — неразрывные пробелы потерялись при публикации`);
  for (const d of r.diffs.slice(0, 10)) {
    console.error(`  · строка ${d.line}:`);
    console.error(`      файл:     ${d.file.slice(0, 120)}`);
    console.error(`      страница: ${d.page.slice(0, 120)}`);
  }
  if (r.diffs.length > 10) console.error(`  … ещё ${r.diffs.length - 10} строк`);
  console.error('  Лечение: перепубликуй тело из файла — gh release edit <tag> --notes-file <файл> — и перечитай страницу глазами (шаг 6.9).');
  return 1;
}

// ── селфтест: красный доказан фикстурами, без сети ──────────────────────────
if (args.includes('--selftest')) {
  const file = ['# Notes', '', '- **316,764 handwritten words** of prose', '- **316 764 рукописных слова** прозы', ''].join('\n');
  let red = 0;
  const okCase = (cond, name) => { console.log((cond ? '✅ ' : '❌ ') + 'selftest: ' + name); if (!cond) red += 1; };
  // 1. Чистая копия — молчание (страж, который не умеет молчать, — генератор шума, EXP-0064).
  let r = compareBodies(file, file);
  okCase(!r.diffs.length && r.nbspPage === r.nbspFile, 'чистая копия — совпадение');
  // 2. Пустой хвост страницы — НЕ расхождение (законная разница носителя, bugs/98 №2).
  r = compareBodies(file + '\n\n', file);
  okCase(!r.diffs.length, 'пустой хвост тела — не расхождение');
  // 3. Подмена нотации разрядов (полевая улика: запятая → пробел) — красный.
  r = compareBodies(file.replace('316,764', '316 764'), file);
  okCase(r.diffs.length === 1 && r.diffs[0].line === 3, 'подмена нотации разрядов — красный на своей строке');
  // 4. Потеря неразрывного пробела (вторая ось той же улики) — красный.
  r = compareBodies(file.replace(' ', ' '), file);
  okCase(r.diffs.length === 1 && r.nbspPage === 0 && r.nbspFile === 1, 'потеря NBSP — красный, ось названа');
  if (red) { console.error(`❌ selftest: ${red} провал(ов)`); process.exit(1); }
  console.log('✅ release-body-guard selftest: красный доказан обеими осями, чистая копия молчит');
  process.exit(0);
}

// ── боевой прогон ────────────────────────────────────────────────────────────
let tag = val('--tag');
if (!tag) {
  const v = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8'));
  tag = `v${v.major}.${v.minor}`;
}
const ver = tag.replace(/^v/, '');
const notesPath = join(ROOT, 'reports', `RELEASE_NOTES_${ver}.md`);
if (!existsSync(notesPath)) die(`файла нот нет: ${notesPath} — нечего сверять (назови тег с существующими нотами: --tag vX.Y)`);

let body;
try {
  body = execFileSync('gh', ['release', 'view', tag, '--json', 'body', '-q', '.body'], { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
} catch (e) {
  die(`gh release view ${tag} не отработал (${(e.stderr || e.message || '').toString().trim().slice(0, 160)}) — страница не прочитана, сверка НЕ выполнена (это не зелёный)`);
}
process.exit(report(tag, `reports/RELEASE_NOTES_${ver}.md`, compareBodies(body, readFileSync(notesPath, 'utf8'))));
