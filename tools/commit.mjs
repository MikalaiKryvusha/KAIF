#!/usr/bin/env node
// tools/commit.mjs
// Bump the build number in version.json, commit all changes with the project's
// commit style + Co-Authored-By trailer, and push. Usage:
//   node tools/commit.mjs "fix: <ASCII-only message>"
//   node tools/commit.mjs --msg-file <path>   ← ОБЯЗАТЕЛЕН для сообщений с не-ASCII
// [TESTED: 2026-08-07 · страж argv красный на кириллице (наблюдение); --msg-file — сообщение
// в git log побайтно чистое (фикс-коммит bugs/46 прочитан обратно)]
import { execSync, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ── Гейт неожиданного файла (bugs/79) ────────────────────────────────────────────────────────
// Намерение вызывающего — это `--only`. Когда его нет, намерением считаются уже ОТСЛЕЖИВАЕМЫЕ
// файлы (правки самой сессии; их отдельно стережёт revert-guard), а НОВЫЙ файл в дереве не
// является намерением никогда: ровно так в origin уехали два чужих ассета, появившихся за минуту
// до коммита, под чужим сообщением. Новый файл проходит, только если его НАЗВАЛИ — поимённо
// (`--only <путь>`) или разом (`--with-new`).
// Функция чистая, поэтому её и доказывает `--selftest`: гейт судится синтетическим вводом за
// миллисекунды, без временного репозитория, без сети и без единого коммита (страж, который ни
// разу не краснел, ничего не доказывает — BUG_FIXING_FRAMEWORK → Стражи).
// Ось запускается ТОЛЬКО в режиме подметания (`git add -A`) — там, где живёт риск. При `--only`
// набор объявлен целиком и стейджится поимённо, поэтому посторонний файл не может уехать по
// определению, и предупреждение о нём было бы шумом; шумный гейт первым идёт под нож.
const newFilesOutsideIntent = (porcelainZ, { only, withNew }) => {
  if (withNew || only.length) return [];
  return porcelainZ.split('\0').filter(Boolean)
    .filter((e) => e.startsWith('?? '))
    .map((e) => e.slice(3));
};

// Известные флаги: имя → берёт ли значение. Всё остальное в режиме `--msg-file` — ПОСТОРОННИЙ
// аргумент, и он ОСТАНАВЛИВАЕТ прогон (bugs/79, вторая половина класса). Канон установщика
// (bugs/33) требует этого дословно — «stray arguments REFUSE instead of being silently ignored»,
// — а этот инструмент восемь путей `--only` проглотил молча: `--only` берёт ОДИН путь на флаг,
// и вызов с девятью путями уехал с тремя файлами. Поймала печать набора; молчаливое проглатывание
// закрывается здесь. В argv-режиме проверка не запускается: там позиционные слова И ЕСТЬ сообщение.
const FLAGS = { '--msg-file': true, '--as': true, '--only': true, '--allow-revert': true,
                '--with-new': false, '--selftest': false, '--no-push': false };
// ── Преполёт 1c: когда звать стража приватных имён (EXP-0159, пункт CK6 plans/118) ───────────────
// Прежнее условие — «коммит несёт путь поставки» (framework/ · dist/ · KAIF.md · README · AUTHOR_STYLOMETRY) — было ВТОРОЙ
// копией зон стража, и она разошлась с первой: страж судит и reports/KAIF_AUDIT, и ноты релизов, а бриф судьи с приватными
// именами двух проектов ушёл в origin молча (290dbbb), следом молча прошёл коммит одного HOUSE_RULES.md (a80df20). Пару
// «зоны стража ↔ триггер гейта» лучше убрать, чем за ней следить: страж стоит 0,6 с и сам знает свои зоны, поэтому он зовётся
// на КАЖДОМ коммите, который что-то несёт. Функция чистая — её доказывает `--selftest`.
// [TESTED: 2026-09-25 · сессия 74: `--selftest` — формы 290dbbb и a80df20 зовут стража, пустой набор — нет; на копии инструмента с
//  прежним условием обе формы красные («2 провалов»); функциональный прогон tools/sandbox/probes/commit-1c-leak-run.mjs — коммит
//  документа с приватным именем в reports/KAIF_AUDIT во временном репозитории остановлен (код 1, HEAD на месте), инструмент 5dab517
//  его закоммитил; отчёт testcases/reports/2026-09-25_ck6-private-names-every-commit.md]
const privateNamesGateNeeded = (stagedNameStatus) => stagedNameStatus.length > 0;
// ── Преполёт 1d: непубличные фразы владельца не едут коммитом (утечка 19e19ff, находка 5 судьи VO4) ─────────────────────────
// Ось 5 генератора слепка стояла только в его собственном прогоне: утечка двух непубличных фраз в НОВЫХ файлах ушла в origin
// коммитом и была найдена случайно. Здесь она гейт каждого непустого коммита: индекс + сообщение коммита. Код генератора →
// решение: 0 — дальше · 3 — SKIPPED вслух (на машине нет приватного ядра — схлопывать нечего) и дальше · всё прочее — стоп
// (приёмка личного падает ЗАКРЫТО: сломанная ось не зелёная). Функция чистая — её доказывает `--selftest`.
// [TESTED: 2026-09-25 17:07 +03:00 · --selftest (четыре случая 1d); функциональный прогон tools/sandbox/probes/commit-1d-leak-run.mjs — фраза в новом
//  файле и в сообщении — стоп, HEAD на месте, чистый коммит проходит, текста фразы в выводе нет; отчёт testcases/reports/2026-09-25_vo4-epic-judge-fixes.md]
const leakGateAction = (status) => (status === 0 ? 'pass' : status === 3 ? 'skip' : 'stop');
// Преполёт 0 (bugs/124): личность — тестовая, когда её адрес в зарезервированном домене. Функция чистая — её доказывает `--selftest`.
// [TESTED: 2026-09-26 03:00:57 +03:00 · `--selftest` — четыре случая (форма подмены, два тестовых домена, личность владельца и похожие
//  настоящие домены); живьём — локальная `user.email=probe@example.invalid` отказала коммит (код 1, version.json не тронут); bugs/124]
const RESERVED_ID = /@(?:[^\s>@]+\.)?(?:invalid|example|test|localhost)>?$|@example\.(?:com|org|net)>?$/i;
const testIdentity = (ident) => RESERVED_ID.test(String(ident).trim());

const strayArgs = (argv) => {
  const stray = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!(a in FLAGS)) { stray.push(a); continue; }
    if (FLAGS[a]) i++;                              // значение флага — не посторонний аргумент
  }
  return stray;
};

if (process.argv.includes('--selftest')) {
  const fails = [];
  const T = (name, cond) => { if (!cond) fails.push(name); };
  const Z = (...e) => e.join('\0') + '\0';
  const owner = 'assets/poster.png', mine = 'tools/x.mjs';
  // Красный: в режиме подметания чужой новый файл называется — ровно полевой инцидент.
  T('чужой новый файл назван, когда набор подметается',
    newFilesOutsideIntent(Z(`?? ${owner}`, ` M ${mine}`), { only: [], withNew: false })[0] === owner);
  T('названы ВСЕ новые, а не первый',
    newFilesOutsideIntent(Z(`?? ${owner}`, '?? assets/b.webp'), { only: [], withNew: false }).length === 2);
  // Молчание там, где риска нет (второй ответ мутанта, EXP-0059).
  T('правки отслеживаемых файлов гейт не трогает',
    newFilesOutsideIntent(Z(` M ${mine}`, 'A  tools/y.mjs'), { only: [], withNew: false }).length === 0);
  T('объявленное намерение (--only) снимает ось — подметания нет',
    newFilesOutsideIntent(Z(`?? ${owner}`), { only: [mine], withNew: false }).length === 0);
  T('--with-new берёт новые разом',
    newFilesOutsideIntent(Z(`?? ${owner}`), { only: [], withNew: true }).length === 0);
  T('путь с пробелами и кириллицей не рвётся (порционный -z, без кавычек)',
    newFilesOutsideIntent(Z('?? assets/КАИФ постер — копия.png'), { only: [], withNew: false })[0]
      === 'assets/КАИФ постер — копия.png');
  // Посторонний аргумент — и ровно тот, что увёл этот инструмент: пути после первого --only.
  T('пути после первого --only названы посторонними',
    strayArgs(['n', 'c', '--msg-file', 'm.txt', '--only', 'a.mjs', 'b.mjs', 'c.mjs']).join(',') === 'b.mjs,c.mjs');
  T('корректный вызов посторонних не имеет',
    strayArgs(['n', 'c', '--msg-file', 'm.txt', '--as', 'Model X', '--only', 'a.mjs', '--only', 'b.mjs']).length === 0);
  T('опечатка флага не проглатывается',
    strayArgs(['n', 'c', '--msg-file', 'm.txt', '--onlyy', 'a.mjs']).includes('--onlyy'));
  // Преполёт 1c: форма утечки 290dbbb (коммит несёт ТОЛЬКО документ в reports/KAIF_AUDIT) и форма a80df20 (только HOUSE_RULES.md)
  // обязаны звать стража — прежнее условие по путям поставки на обеих молчало; пустой набор стража не зовёт.
  T('1c: коммит одного брифа в reports/KAIF_AUDIT зовёт стража приватных имён (форма утечки 290dbbb)',
    privateNamesGateNeeded(['A\treports/KAIF_AUDIT/2026-09-25_ck6_epic_judge_brief.md']) === true);
  T('1c: коммит одного HOUSE_RULES.md зовёт стража (форма a80df20)',
    privateNamesGateNeeded(['M\tHOUSE_RULES.md']) === true);
  T('1c: пустой набор стража не зовёт', privateNamesGateNeeded([]) === false);
  T('1d: ось утечки зелёная — коммит идёт', leakGateAction(0) === 'pass');
  T('1d: приватного ядра нет на машине (SKIPPED=3) — коммит идёт, строка печатается', leakGateAction(3) === 'skip');
  T('1d: утечка (1) — стоп', leakGateAction(1) === 'stop');
  T('1d: ось не исполнилась (2, иное) — стоп, приёмка личного падает закрыто', leakGateAction(2) === 'stop' && leakGateAction(null) === 'stop');
  // Преполёт 0 (bugs/124): тестовая личность — зарезервированный домен; настоящая — нет (оба ответа)
  T('0: «probe <probe@example.invalid>» — тестовая (форма подмены bugs/124)', testIdentity('probe <probe@example.invalid>') === true);
  T('0: «sbx <sbx@test>» и «x <x@example.com>» — тестовые', testIdentity('sbx <sbx@test>') && testIdentity('x <x@example.com>'));
  T('0: личность владельца — не тестовая', testIdentity('Mikalai Kryvusha <kotkrinik@yandex.ru>') === false);
  T('0: похожий, но настоящий домен («examples.com», «testing.io») — не тестовый', !testIdentity('a <a@examples.com>') && !testIdentity('b <b@testing.io>'));
  for (const f of fails) console.error('✖ selftest commit-gate: ' + f);
  if (fails.length) { console.error(`\n❌ commit --selftest: ${fails.length} провалов (bugs/79)`); process.exit(1); }
  console.log('✅ commit --selftest: гейт неожиданного файла краснеет на чужом новом файле и молчит на ' +
              'названном; посторонний аргумент назван поимённо (bugs/79); преполёт 1c зовёт стража приватных имён на любом ' +
              'непустом коммите — и на форме утечки 290dbbb (EXP-0159)');
  process.exit(0);
}

// Два режима входа. Страж класса «текст-через-CLI» (bugs/46, AGENT_GUIDE → Гигиена, симптом 5):
// не-ASCII/слэши в argv коверкаются шелл-слоями ДО программы (git-bash/MSYS2 конвертирует
// «/»→«\», «:»→«;», «/Word»→«C:\Program Files\Git\Word»; PowerShell/cmd портят кодировкой) —
// такое сообщение обязано ехать ФАЙЛОМ, argv-режим его отвергает с готовым решением.
let msg;
const fileIdx = process.argv.indexOf('--msg-file');
if (fileIdx >= 0) {
  const p = process.argv[fileIdx + 1];
  if (!p) {
    console.error('usage: node tools/commit.mjs --msg-file <path>');
    process.exit(1);
  }
  const stray = strayArgs(process.argv);
  if (stray.length) {
    console.error(`✋ посторонние аргументы (${stray.length}): ${stray.join(' ')}`);
    console.error('   Молча проглоченный аргумент — самый дорогой вид прогона: он выглядит удавшимся.');
    console.error('   `--only` берёт ОДИН путь на флаг — повтори флаг: --only <путь> --only <путь> …');
    process.exit(1);
  }
  msg = readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim(); // BOM-терпимо (EXP-0007)
} else {
  msg = process.argv.slice(2).join(' ').trim();
  if (/[^\x00-\x7F]/.test(msg)) {
    console.error('✋ non-ASCII commit message via argv — shell layers corrupt it (bugs/46).');
    console.error('   Fix: write the message to a UTF-8 file and run:');
    console.error('   node tools/commit.mjs --msg-file <path>');
    process.exit(1);
  }
}
if (!msg) {
  console.error('usage: node tools/commit.mjs "<ASCII message>"  |  --msg-file <path>');
  process.exit(1);
}

// ПРЕПОЛЁТ: страж отката рабочей копии (bugs/45, два наблюдения — 2026-08-07 и 2026-08-09).
// Файл, чья рабочая копия побайтно равна ПРОШЛОЙ ревизии, потерял свою свежую правку на диске, и
// коммит увековечил бы потерю. Ритуал «git diff --stat перед коммитом» этот класс ловит, но
// держится на внимании сессии; здесь он становится гейтом. Намеренный откат проходит флагом
// `--allow-revert` — он же передаётся стражу пофайлово (`--allow`).
{
  const allowIdx = process.argv.indexOf('--allow-revert');
  const allowed = [];
  for (let i = allowIdx; i >= 0 && i + 1 < process.argv.length; i++) {
    if (process.argv[i] === '--allow-revert') allowed.push(process.argv[i + 1]);
  }
  const guard = join(ROOT, 'tools', 'revert-guard.mjs');
  const args = allowed.flatMap((f) => ['--allow', f]);
  try {
    execFileSync(process.execPath, [guard, ...args], { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('\n✋ коммит остановлен преполётом revert-guard (bugs/45). Разбери находки выше.');
    process.exit(1);
  }
}

// ПРЕПОЛЁТ 1b: гейт неожиданного файла (bugs/79) — новый файл, которого нет в намерении,
// останавливает коммит и НАЗЫВАЕТ СЕБЯ. Стоит ДО первого побочного эффекта: отказ после бампа
// version.json оставил бы в дереве поднятый номер сборки без коммита — тот же класс «проверка и
// действие смотрят на разные множества», ради которого гейт и написан. Ошибка несёт готовый верный
// ход (EXP-0008): в этот момент ходов ровно три, и все три законны.
const only = [];
for (let i = 0; i < process.argv.length - 1; i++) {
  if (process.argv[i] === '--only') only.push(process.argv[i + 1]);
}
{
  const unexpected = newFilesOutsideIntent(
    execFileSync('git', ['status', '--porcelain', '-z', '--untracked-files=all'], { cwd: ROOT, encoding: 'utf8' }),
    { only, withNew: process.argv.includes('--with-new') });
  if (unexpected.length) {
    console.error(`✋ в дереве ${unexpected.length} новых файл(ов) вне намерения коммита:`);
    for (const p of unexpected) console.error('   ?? ' + p);
    console.error('   Молчаливый `git add -A` уводил такие файлы в origin под чужим сообщением (bugs/79).');
    console.error('   Верные ходы: --only <путь> (каждый своим флагом) · --with-new (взять все) · оставить в дереве.');
    process.exit(1);
  }
}

// ПРЕПОЛЁТ 0: чьим именем коммит уйдёт в историю (сессия 74, bugs/124 — 31 коммит ушёл в origin как «probe <probe@example.invalid>»:
// проба 1d писала личность через `git config` внутри СВЯЗАННОГО worktree, а он делит .git/config с репозиторием, и подмена жила
// девять часов молча). Коммит, который уйдёт в origin, не подписывается тестовой личностью — адресом зарезервированного домена
// (RFC 2606/6761: .invalid · .example · .test · .localhost · example.com/org/net); с `--no-push` (пробы в песочнице) страж молчит.
// Проверка стоит ДО поднятия номера сборки: отказ не оставляет правки version.json.
if (!process.argv.includes('--no-push')) {
  const ids = ['GIT_AUTHOR_IDENT', 'GIT_COMMITTER_IDENT'].map((k) => {
    try { return execFileSync('git', ['var', k], { cwd: ROOT, encoding: 'utf8' }).trim().replace(/ \d+ [+-]\d{4}$/, ''); } catch { return ''; }
  });
  const bad = ids.filter(testIdentity);
  if (bad.length) {
    let where = '';
    try { where = execFileSync('git', ['config', '--show-origin', '--get', 'user.email'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { /* from the environment */ }
    console.error(`✋ преполёт 0: коммит ушёл бы в origin под ТЕСТОВОЙ личностью: ${[...new Set(bad)].join(' · ')}${where ? ` (источник: ${where})` : ' (источник: переменные GIT_AUTHOR_* / GIT_COMMITTER_*)'}`);
    console.error('   Так 31 коммит ушёл под «probe» (bugs/124). Сними подмену: git config --local --unset user.name && git config --local --unset user.email');
    process.exit(1);
  }
}

// Bump the internal build counter, preserving every other field of version.json.
// (The version shown anywhere is major.minor only — `build` is an internal counter.)
const vf = join(ROOT, 'version.json');
const v = JSON.parse(readFileSync(vf, 'utf8'));
v.build = (v.build || 0) + 1;
writeFileSync(vf, JSON.stringify(v, null, 2) + '\n');

// Со-авторский трейлер несёт ФАКТИЧЕСКОЕ имя работающей модели — решение владельца №54
// (интервью №012, Q1 = B, 2026-08-08 06:48 +03:00): «по git log видно, кто что делал».
// Имя приходит ИЗВНЕ — от сессии, которая одна его и знает: `--as "<имя>"` или KAIF_AGENT_MODEL.
// Зашитой константы больше нет по построению: имя модели протухает, а зашитое протухает молча
// (тот же механизм, что вскрыла T1 на счётчиках, EXP-0044).
// Имени не дали — трейлер НЕ ПИШЕТСЯ и инструмент говорит об этом вслух: выдуманное авторство
// хуже отсутствующего (PHILOSOPHY → правило трёх дверей: пробел не закрывается правдоподобной
// выдумкой). Коммит при этом проходит — гейт авторства не должен останавливать работу.
const asIdx = process.argv.indexOf('--as');
const agentName = (asIdx >= 0 ? process.argv[asIdx + 1] : process.env.KAIF_AGENT_MODEL || '').trim();
const trailer = agentName ? `Co-Authored-By: ${agentName} <noreply@anthropic.com>` : '';
const run = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });

// ПРЕПОЛЁТ 2: набор файлов НАЗЫВАЕТСЯ ВСЛУХ до коммита (bugs/79). Правило канона —
// «`git diff --stat` перед каждым коммитом; всё, чего ты не намеревался менять, — СТОП» — было
// НЕИСПОЛНИМО, пока `git add -A` расширял набор ПОСЛЕ проверки: агент смотрел один индекс,
// коммит уносил другой. В поле это увело в origin два чужих файла, появившихся в дереве за минуту
// до коммита, под чужим сообщением. Лечится не бдительностью, а формой:
//   • `--only <путь> [--only <путь>…]` — коммитим ровно названное, ничего сверх;
//   • без `--only` набор берётся весь (прежнее поведение), но ПЕЧАТАЕТСЯ построчно, всегда:
//     агент не видит того, о чём инструмент промолчал.
{
  if (only.length) {
    // version.json приписывается всегда: его номер сборки поднял САМ инструмент шагом выше —
    // забыть его в списке значило бы оставить в дереве правку без автора.
    try {
      execFileSync('git', ['add', '--', ...only, 'version.json'], { cwd: ROOT, stdio: 'inherit' });
    } catch {
      // Несуществующий путь в намерении — обычная опечатка или уже переименованный файл (после
      // `git mv` старого имени на диске нет, а переименование уже в индексе). Стек-трейс Node
      // здесь ничего не сообщает; git выше уже назвал конкретный pathspec.
      console.error('✋ `git add` отверг один из путей `--only` (см. строку git выше).');
      console.error('   Частая причина: файл уже переименован через `git mv` — называй только НОВОЕ имя.');
      process.exit(1);
    }
  } else {
    run('git add -A');
  }
  // Что реально уедет: имена из ИНДЕКСА после стейджинга — то самое множество, а не прошлое.
  const staged = execFileSync('git', ['diff', '--cached', '--name-status'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
  console.log(`— коммит несёт ${staged.length} файл(ов)${only.length ? ' (--only)' : ''}:`);
  for (const l of staged) console.log('   ' + l);
  if (!only.length && staged.length) {
    console.log('   (не то множество? → node tools/commit.mjs --only <путь> … — уедет ровно названное)');
  }
  // ПРЕПОЛЁТ 1c: приватные имена не едут наружу (находка W2-1 суда W1, 2026-08-21).
  // Класс: шаг ритуала (/end-chat-soft, private-names-guard) держится на внимании сессии — утечка U′2
  // пережила закрытие эпика именно так. Здесь шаг становится гейтом на каждом коммите, который что-то
  // несёт: зоны знает сам страж (поставка, витрина, слепок, ноты, реестры суда) — копии зон здесь нет (EXP-0159).
  if (privateNamesGateNeeded(staged)) {
    try {
      execFileSync(process.execPath, [join(ROOT, 'tools', 'private-names-guard.mjs')], { cwd: ROOT, stdio: 'inherit' });
    } catch {
      console.error('\n✋ коммит остановлен преполётом 1c: private-names-guard красный — приватное имя едет в поставку, витрину или отчёт суда. Алиасы — .kaif/private-names.json.');
      process.exit(1);
    }
  }
  // ПРЕПОЛЁТ 1d (см. leakGateAction выше): индекс и сообщение коммита против фраз, которые слепок схлопнул.
  if (staged.length) {
    const leakMsg = join(tmpdir(), `kaif-commit-leak-${process.pid}.txt`);
    writeFileSync(leakMsg, msg, 'utf8');
    const lr = spawnSync(process.execPath, [join(ROOT, 'tools', 'stylometry-snapshot.mjs'), '--leak-only', '--also', leakMsg], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
    rmSync(leakMsg, { force: true });
    const action = leakGateAction(lr.status);
    process.stdout.write((lr.stdout || '') + (lr.stderr || ''));
    if (action === 'stop') {
      console.error('\nкоммит остановлен преполётом 1d: непубличная фраза владельца едет этим коммитом (или ось утечки не исполнилась) — перепиши место описанием, не цитатой (решение №60).');
      process.exit(1);
    }
  }
}
// Сообщение идёт через `git commit -F <файл>` — текст вообще не попадает в argv/шелл
// (лекарство класса bugs/46; -m с не-ASCII запрещён по построению).
const tmpMsg = join(tmpdir(), `kaif-commit-msg-${process.pid}.txt`);
// Трейлер идемпотентен по КЛАССУ, а не по одной строке: сообщение, уже несущее ЛЮБОЙ
// Co-Authored-By, не получает второго (bugs/47 закрыл «тот же трейлер дважды», bugs/50 — соседний
// случай: трейлер с ДРУГИМ именем модели проскакивал мимо `includes` и коммит уходил с двумя
// со-авторами, один из которых работу не делал).
// [TESTED: 2026-08-08 · коммит bugs/50 нёс трейлер «Claude Opus 5» — в git log он один]
if (!trailer && !/^Co-Authored-By:/mi.test(msg)) {
  console.error('⚠️  имя модели не передано — коммит уйдёт БЕЗ Co-Authored-By (решение №54: пишем ' +
    'фактическое имя, выдумывать запрещено). Передай: --as "<имя модели>" или KAIF_AGENT_MODEL=<имя>.');
}
writeFileSync(tmpMsg, (/^Co-Authored-By:/mi.test(msg) || !trailer) ? msg + '\n' : msg + '\n\n' + trailer + '\n');
try {
  run(`git commit -F "${tmpMsg}"`);
} finally {
  rmSync(tmpMsg, { force: true }); // finally — нетеряющая уборка (EXP-0027)
}
// `--no-push` — локальный коммит без отправки. Заведён ради `/pause`: мягкая парковка обязана
// сохранить работу, но пуш там запрещён намеренно («пуш — акт закрытия сессии, он принадлежит
// `/end-chat-soft`»). Прежде эту потребность закрывал голый `git add -A` прямо в тексте навыка — то
// есть ВТОРОЙ коммит-маршрут репозитория, на котором гейта неожиданного файла нет вовсе и
// полевой инцидент `bugs/79` воспроизводится один в один. Флаг убирает причину обходить
// инструмент: у парковки теперь есть свой законный ход ВНУТРИ гейта.
if (process.argv.includes('--no-push')) {
  console.log(`✅ committed locally, NOT pushed (build ${v.build}) — пуш принадлежит /end-chat-soft (или /end-chat-force)`);
} else {
  try {
    run('git push');
  } catch {
    console.error('⚠️  push failed — try: gh auth setup-git ; git pull --rebase ; git push');
    process.exit(1);
  }
  console.log(`✅ committed & pushed (build ${v.build})`);
}
