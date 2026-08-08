#!/usr/bin/env node
// tools/revert-guard.mjs — страж КЛАССА «рабочая копия откатилась к старой ревизии» (bugs/45).
//
// ЗАЧЕМ. Дважды подряд файл `plans/26_kaif_2.2.md` терял на диске свою САМУЮ СВЕЖУЮ правку посреди
// живой сессии, которая этот файл только читала (2026-08-07 и 2026-08-09). Оба раза откат поймал
// ритуал «`git diff --stat` перед каждым коммитом», и оба раза он держался на внимании агента.
// Внимание — не механизм: сессия, которая правит десять файлов, читает свой дифф глазами и видит
// в нём то, что ожидает увидеть. Второе наблюдение класса по канону EXPERIENCE означает механизм.
//
// ПРИМЕТА — узкая по построению, и в этом вся её ценность. Откат отличается от правки тем, что
// рабочая копия становится ПОБАЙТНО РАВНА какой-то прошлой ревизии этого же файла. Обычное
// редактирование такого не даёт: чтобы случайно совпасть с ревизией месячной давности до
// последнего байта, надо её воспроизвести. Поэтому страж сравнивает не строки, а хеши блобов:
//
//   рабочая копия == blob любой НЕ-HEAD ревизии этого файла  →  КРАСНЫЙ, это откат
//   рабочая копия != ни одной прошлой ревизии                →  молчание, это правка
//
// Ложных срабатываний у приметы два законных вида, и оба названы вслух:
//   · намеренный откат руками (`git checkout <hash> -- файл`) — он и есть возврат к ревизии;
//     страж говорит это прямо и снимается флагом `--allow <файл>`;
//   · файл, отредактированный «туда и обратно» в одной сессии, — но тогда diff против HEAD пуст,
//     и файл в список изменённых вообще не попадает.
//
// Использование:
//   node tools/revert-guard.mjs                 # проверить все изменённые файлы; exit 1 при откате
//   node tools/revert-guard.mjs --allow a.md    # признать откат a.md намеренным
//   node tools/revert-guard.mjs --selftest      # доказать красный на откате И молчание на правке
//
// Страж стоит преполётом в `tools/commit.mjs`: откат не может уехать в коммит молча.
//
// [TESTED: 2026-08-09 · --selftest на одноразовом git-репозитории во временном корне: откат файла
//  к первой ревизии даёт красный с адресом ревизии; обычная правка того же файла — молчание.]

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { tempRoot } from './lib/temp-root.mjs';

/** Тонкая обёртка над git: текст на stdout, пустая строка вместо падения на ожидаемых ошибках. */
function git(args, cwd = process.cwd(), { tolerant = false } = {}) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
                                       stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    if (tolerant) return '';
    throw e;
  }
}

// Хеш блоба СЧИТАЕТ САМ GIT, а не мы. Считать sha1 от байтов с диска — ровно та ловушка, ради
// которой существует EXP-0005: на этом репозитории `core.autocrlf=true`, файл лежит с CRLF, а в
// объектах git хранится с LF. Самодельный хеш не совпал бы НИ С ОДНОЙ ревизией, и страж молчал бы
// всегда — зелёный по построению, то есть худший из возможных исходов. `git hash-object` применяет
// те же фильтры, что применил бы коммит, поэтому сравнение идёт в одной системе координат.
function blobShaOf(repo, file) {
  return git(['hash-object', '--', file], repo, { tolerant: true }).trim();
}

/**
 * Проверка одного файла: совпадает ли его рабочая копия побайтно с какой-либо НЕ-HEAD ревизией.
 * Возвращает { reverted, commit, date } — адрес ревизии нужен, чтобы человек увидел, КУДА откатило.
 */
function checkFile(repo, file) {
  const abs = path.join(repo, file);
  if (!fs.existsSync(abs)) return { reverted: false };            // удаление — другой класс
  const sha = blobShaOf(repo, file);
  if (!sha) return { reverted: false };

  // История этого файла, свежайшая первой. HEAD пропускаем: равенство с HEAD означает «не изменён».
  const revs = git(['log', '--format=%H %cI', '--', file], repo, { tolerant: true })
    .split('\n').map((s) => s.trim()).filter(Boolean);

  for (let i = 0; i < revs.length; i++) {
    const [commit, date] = revs[i].split(' ');
    if (i === 0 && commit === git(['rev-parse', 'HEAD'], repo).trim()) continue;
    const past = git(['rev-parse', `${commit}:${file}`], repo, { tolerant: true }).trim();
    if (past && past === sha) return { reverted: true, commit, date };
  }
  return { reverted: false };
}

/** Прогон по всем файлам, изменённым относительно HEAD (и staged, и нет). */
function run(repo, allow = []) {
  const changed = [...new Set(
    git(['diff', '--name-only', 'HEAD'], repo, { tolerant: true }).split('\n')
      .map((s) => s.trim()).filter(Boolean),
  )];

  const hits = [];
  for (const file of changed) {
    if (allow.includes(file)) continue;
    const r = checkFile(repo, file);
    if (r.reverted) hits.push({ file, ...r });
  }
  return { changed, hits };
}

// ── Селфтест: одноразовый репозиторий, откат и правка — обоими ответами (EXP-0059) ──────────────
function selftest() {
  const root = tempRoot('revert-guard-selftest');
  const repo = path.join(root, 'repo');
  fs.mkdirSync(repo, { recursive: true });

  const g = (...a) => git(a, repo);
  g('init', '-q');
  g('config', 'user.email', 'selftest@example.invalid');
  g('config', 'user.name', 'selftest');
  // Оба положения autocrlf проверяются ниже отдельным кругом; здесь фиксируем true — то, что
  // стоит на этой машине, и то, на чём самодельный sha1 дал бы вечный зелёный.
  g('config', 'core.autocrlf', 'true');

  const doc = path.join(repo, 'doc.md');
  const other = path.join(repo, 'other.md');

  fs.writeFileSync(doc, 'first revision\n');
  fs.writeFileSync(other, 'untouched\n');
  g('add', '-A'); g('commit', '-q', '-m', 'r1');

  fs.writeFileSync(doc, 'first revision\nsecond revision\n');
  g('add', '-A'); g('commit', '-q', '-m', 'r2');

  let bad = 0;

  // 1. МОЛЧАНИЕ на обычной правке: содержимое новое, ни одной прошлой ревизии не равно.
  fs.writeFileSync(doc, 'first revision\nsecond revision\nthird, edited now\n');
  const edited = run(repo);
  const silent = edited.hits.length === 0;
  console.log(`${silent ? '✅' : '❌'} обычная правка: откатов ${edited.hits.length} (ждали 0)`);
  if (!silent) bad++;

  // 2. КРАСНЫЙ на откате — и сразу в САМОМ ЗЛОМ виде: откаченный файл записан с CRLF, как его
  // записал бы редактор на Windows, а ревизия r1 лежит в объектах git с LF. Самодельный sha1 от
  // байтов диска здесь бы промолчал; `git hash-object` нормализует по `core.autocrlf` и находит.
  fs.writeFileSync(doc, 'first revision\r\n');
  const reverted = run(repo);
  const fired = reverted.hits.find((h) => h.file === 'doc.md');
  console.log(`${fired ? '✅' : '❌'} откат к прошлой ревизии: ${fired ? `страж покраснел (${fired.commit.slice(0, 7)})` : 'СТРАЖ НЕ ЗАМЕТИЛ'}`);
  if (!fired) bad++;

  // 3. АДРЕСНОСТЬ: соседний файл, которого откат не касался, в находки не попадает.
  const onlyOne = reverted.hits.length === 1;
  console.log(`${onlyOne ? '✅' : '❌'} адресность: находок ${reverted.hits.length} (ждали 1 — только откаченный файл)`);
  if (!onlyOne) bad++;

  // 4. Флаг --allow снимает намеренный откат.
  const allowed = run(repo, ['doc.md']);
  const quiet = allowed.hits.length === 0;
  console.log(`${quiet ? '✅' : '❌'} --allow doc.md: находок ${allowed.hits.length} (ждали 0)`);
  if (!quiet) bad++;

  fs.rmSync(root, { recursive: true, force: true });
  console.log(bad ? `\n❌ selftest FAILED — ${bad}` : '\n✅ selftest OK — красный на откате, молчание на правке');
  process.exit(bad ? 1 : 0);
}

// ── Точка входа ────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv.includes('--selftest')) selftest();

const allow = [];
for (let i = 0; i < argv.length; i++) if (argv[i] === '--allow' && argv[i + 1]) allow.push(argv[++i]);

const { changed, hits } = run(process.cwd(), allow);

if (!hits.length) {
  console.log(`✅ revert-guard: изменённых файлов ${changed.length}, откатов к прошлым ревизиям нет`);
  process.exit(0);
}

console.log('❌ revert-guard: рабочая копия побайтно равна ПРОШЛОЙ ревизии — это откат, а не правка\n');
for (const h of hits) {
  console.log(`   ${h.file}`);
  console.log(`      равен ревизии ${h.commit.slice(0, 7)} от ${h.date}`);
}
console.log('\n   Что делать: восстановить свежую версию — `git checkout -- <файл>` — и перенести');
console.log('   свою правку заново. Откат намеренный? Повтори прогон с `--allow <файл>`.');
console.log('   Класс и криминалистика — bugs/45.');
process.exit(1);
