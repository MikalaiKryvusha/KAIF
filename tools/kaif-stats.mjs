#!/usr/bin/env node
// tools/kaif-stats.mjs — счётчик ЛЕТОПИСНОЙ статистики релиза: сколько стоила версия.
//
// Зачем (слово владельца, 2026-08-08 23:40 +03:00): «подними всю статистику, посчитай экономику,
// трудозатраты в человеко часах. электроэнергию. Будет интересно это всё собрать в Интересные
// факты по версии 2.2» — блок «Интересные факты» на витрине и в релиз-нотах (задача T11).
//
// ПОЧЕМУ ЭТО ИНСТРУМЕНТ, А НЕ АБЗАЦ ПРОЗЫ. Класс «протухший счётчик прозы» проект уже оплатил
// дважды (bugs/09, bugs/49, урок EXP-0025): число, вписанное руками, врёт со следующего коммита.
// Витринные числа тем более: их читает посторонний человек, и проверить их он не может.
// Поэтому каждое число здесь СЧИТАЕТСЯ из наблюдаемого источника — git, файлы репозитория,
// транскрипты сессий, — а прайс и энергия объявлены константами с указанием источника.
//
// ЧТО ИЗМЕРЕНО, А ЧТО ОЦЕНЕНО — граница проведена явно и печатается в выводе:
//   · ИЗМЕРЕНО: коммиты, файлы, строки, документы, токены, время активной работы;
//   · ОЦЕНЕНО ПО ПУБЛИЧНОМУ ПРАЙСУ: деньги (это НЕ счёт владельца — он на подписке);
//   · ЧУЖАЯ ОЦЕНКА: энергия (Anthropic не публикует Вт·ч на токен — цифра взята из
//     рецензируемых работ по ДРУГИМ моделям и другому железу; диапазон, а не число).
//
// Использование:
//   node tools/kaif-stats.mjs --since 2026-08-07T00:00:00+03:00   # ← ПРАВИЛЬНЫЙ способ для релиза
//   node tools/kaif-stats.mjs                 # от прошлого релизного тега (см. предупреждение ниже)
//   node tools/kaif-stats.mjs --from v2.0     # от другого тега
//   node tools/kaif-stats.mjs --all           # за всю историю проекта
//   node tools/kaif-stats.mjs --json          # машинный вывод
//
// ⚠️ ТЕГ ПРОШЛОГО РЕЛИЗА — НЕ НАЧАЛО РАБОТ НАД СЛЕДУЮЩИМ. Между релизом и стартом следующей
// версии живёт полевая работа: обновления парка проектов, отчёты, разбор обратной связи. Дефолт
// «от прошлого тега» удобен, но для витринного числа он ЗАВЫШАЕТ срок разработки — и ровно на
// этом инструмент соврал в день рождения: он показал «8,5 суток» для 2.2, тогда как владелец
// начал работу в 00:00 07.08.2026 и реальный срок вдвое короче. Считаешь срок релиза — спроси
// у владельца дату старта и передай её `--since`, а не выводи из тега.
//
// [TESTED: 2026-08-08 · прогон по репозиторию; числа сверены с ручными командами git и wc]

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const ROOT = process.cwd();

// ── Прайс-лист (источник: навык claude-api, кэш справочника 2026-06-24) ─────────
// Цены за 1 млн токенов. Кэш: чтение ≈0.1× входной цены; запись 2× при TTL 1 час
// (в этих сессиях действует часовой TTL). Прайс — ПУБЛИЧНЫЙ API-прайс; работа шла по
// подписке, поэтому это оценка «во что обошлась бы та же работа через API», а не счёт.
const PRICE = {
  'claude-fable-5': { in: 10, out: 50 },
  'claude-opus-5': { in: 5, out: 25 },
  'claude-sonnet-5': { in: 3, out: 15 },
  'claude-haiku-4-5': { in: 1, out: 5 },
};
const CACHE_READ_FACTOR = 0.1;
const CACHE_WRITE_FACTOR = 2; // TTL 1 час

// ── Энергия: ЧУЖАЯ ОЦЕНКА, не наш замер и не данные Anthropic ──────────────────
// Anthropic Вт·ч на токен не публикует, поэтому ставка берётся из публичных измерений
// инференса на других моделях и другом железе.
// СТАВКА СВЕДЕНА К ОДНОМУ ЧИСЛУ по слову владельца (2026-08-09 ≈00:45 +03:00: «мне не нравятся
// такие сильные разбросы! Нужно уточнить в сети интернет, если ты не уверен, свести к примерно
// одному числу»). Прежняя вилка 0,0001–0,002 давала разброс в двадцать раз — это признание
// незнания, а не оценка.
// ЯКОРЬ: медианный замер GPT-4o — около 0,3 Вт·ч на запрос, что даёт ≈3·10⁻⁴ Вт·ч на токен
// (обзор эмпирических измерений инференса, 2025–2026: arxiv.org/abs/2505.09598 «How Hungry is
// AI?», Joule «Energy use of AI inference, efficiency pathways, and test-time scaling»).
// Крайние значения оставлены В КОДЕ как границы чувствительности — на витрину едет одно число.
const WH_PER_TOKEN = 0.0003;
const WH_PER_TOKEN_LOW = 0.0001;   // нижняя граница чувствительности (мелкие модели, оптимизированный движок)
const WH_PER_TOKEN_HIGH = 0.002;   // верхняя (крупные reasoning-модели с длинной генерацией)

// Порог простоя для «активного времени»: пауза длиннее — человек отошёл, а не работает.
const IDLE_GAP_MINUTES = 5;

// ── Человеко-часы «а сколько бы это заняло без агента» — ОЦЕНКА С ВИДИМЫМИ ДОПУЩЕНИЯМИ ──
// Это не измерение и не притязание на точность: это арифметика по объёму, где обе ставки
// названы явно, чтобы читатель мог подставить свои и получить свой ответ. Скрытая ставка
// внутри красивого числа — то же самое, что выдуманное число; видимая — проверяемая оценка.
// СТАВКИ СВЕДЕНЫ К ОДНОМУ ЧИСЛУ КАЖДАЯ, и обе взяты из отраслевых источников, а не из головы
// (слово владельца — там же, где про энергию). Прежние вилки 200–500 слов/час и 20–50 строк/час
// были догадкой агента и давали разброс в 2,5 раза.
// ПРОЗА: отраслевой ориентир технического писателя — около 1 000 слов средней сложности за
// восьмичасовой день (allthingsdocs.com, «Productivity metrics for technical writers»), то есть
// 125 слов в час с обдумыванием, правкой и вычиткой. Столько же дают общие обзоры ставок
// технического письма; «500–1 500 слов в час» из тех же обзоров относится к ЧЕРНОВОМУ письму без
// проверки, а здесь считается сдаваемый текст.
const WORDS_PER_HOUR = 125;
// КОД: Кейперс Джонс по многим методологиям — 325–750 строк в месяц на разработчика, то есть
// 16–38 строк за рабочий день; берётся середина 27 строк в день при восьмичасовом дне.
// Цифра ПОЛНОГО цикла: она включает проектирование, отладку, ревью и тесты, а не только набор.
const CODE_LINES_PER_DAY = 27;
const WORK_HOURS_PER_DAY = 8;
// Объём считается ТОЛЬКО по рукописному: генераты (`dist/`, корневые копии) исключены —
// иначе одна пересборка добавляла бы «человеко-месяцы», которых никто не работал.
const GENERATED_EXCLUDES = [':(exclude)dist/*', ':(exclude)KAIF.md', ':(exclude)KAIF_REFERENCE.md'];

// ── Переводы «в бытовую реальность» — чтобы миллиарды и киловатт-часы стали представимы ──
// Каждая константа названа вместе с источником: витринное число без источника — баг по
// определению (`PHILOSOPHY.md` → правило трёх дверей), а «понятный обывателю» пересчёт
// подставного числа врёт вдвойне — он ещё и запоминается.
const HUMAN = {
  // Средняя цена Big Mac в США, 2026 — по данным более чем 13 500 ресторанов (bigmacindex).
  burgerUsd: 5.91,
  // Зарплата инженера-программиста — ЧИСЛО ВЛАДЕЛЬЦА (его слово, 2026-08-08): 3000 $/мес.
  salaryUsdMonth: 3000,
  workHoursMonth: 168, // 21 рабочий день × 8 часов
  // Средний дом ЕС: 3,6 МВт·ч в год ≈ 9,9 кВт·ч в сутки (Eurostat / ODYSSEE-MURE).
  householdKwhDay: 9.9,
  // Роман среднего объёма — 80 000 слов; в русском тексте ≈2 токена на слово,
  // то есть книга ≈160 000 токенов. Обе величины — объявленные допущения, не замер.
  bookWords: 80000,
  tokensPerWord: 2,
  // ФАКТИЧЕСКАЯ подписка владельца — его слово (2026-08-09): Claude Max, 250 $/мес.
  // Именно она, а не API-прайс, была реально оплачена. Разница между двумя числами —
  // не ошибка расчёта, а СОДЕРЖАНИЕ факта: столько стоила бы та же работа по токенам.
  subscriptionUsdMonth: 250,
  subscriptionPlan: 'Claude Max',
};

const TRANSCRIPTS = join(homedir(), '.claude', 'projects', 'd--work-ai-sandbox-KAIF');
const KNOWLEDGE_DIRS = ['plans', 'bugs', 'ideas', 'researches', 'interviews', 'homeworks', 'reports'];

// maxBuffer поднят намеренно: полный дифф релиза — десятки мегабайт, и дефолтный буфер
// node (1 МБ) роняет инструмент исключением ровно на самом крупном релизе, ради которого он и нужен.
const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 512 * 1024 * 1024 }).trim();
const num = (s) => Number(String(s).replace(/[^\d]/g, '')) || 0;

/** Предыдущий релизный тег — точка отсчёта по умолчанию. */
function previousTag() {
  const tags = git('tag', '-l', '--sort=-creatordate').split('\n').filter(Boolean);
  return tags[0] || null;
}

/** Статистика git за окно: коммиты, файлы, строки, авторы-модели. */
function repoStats(from) {
  const range = from ? `${from}..HEAD` : '';
  const commits = num(range ? git('rev-list', range, '--count') : git('rev-list', 'HEAD', '--count'));
  const shortstat = range ? git('diff', '--shortstat', range) : '';
  const files = num((shortstat.match(/(\d+) files? changed/) || [])[1]);
  const insertions = num((shortstat.match(/(\d+) insertions?/) || [])[1]);
  const deletions = num((shortstat.match(/(\d+) deletions?/) || [])[1]);
  const created = range
    ? git('diff', '--name-status', range).split('\n').filter((l) => l.startsWith('A')).length
    : 0;

  // Кто коммитил — по со-авторскому трейлеру (решение №54: имя работающей модели).
  const byModel = {};
  const body = range ? git('log', range, '--format=%b') : git('log', '--format=%b');
  for (const m of body.matchAll(/Co-Authored-By:\s*([^<\n]+?)\s*</g)) {
    const name = m[1].trim();
    byModel[name] = (byModel[name] || 0) + 1;
  }

  const first = range ? git('log', range, '--format=%cI', '--reverse').split('\n')[0] : git('log', '--format=%cI', '--reverse').split('\n')[0];
  const last = git('log', '-1', '--format=%cI');

  // Рукописный объём: проза и код отдельно, генераты исключены.
  let proseLines = 0;
  let proseWords = 0;
  let codeLines = 0;
  if (range) {
    const proseStat = git('diff', '--shortstat', range, '--', '*.md', ...GENERATED_EXCLUDES);
    proseLines = num((proseStat.match(/(\d+) insertions?/) || [])[1]);
    const proseDiff = git('diff', range, '--', '*.md', ...GENERATED_EXCLUDES);
    proseWords = proseDiff
      .split('\n')
      .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const codeStat = git('diff', '--shortstat', range, '--', '*.mjs');
    codeLines = num((codeStat.match(/(\d+) insertions?/) || [])[1]);
  }

  const days = (Date.parse(last) - Date.parse(first)) / 86400000;
  return { commits, files, insertions, deletions, created, byModel, first, last, proseLines, proseWords, codeLines, days };
}

/** Документы знаний и канон-артефакты — считаем файлы, а не помним числа. */
function docStats() {
  const dirs = {};
  for (const d of KNOWLEDGE_DIRS) {
    const p = join(ROOT, d);
    dirs[d] = existsSync(p) ? readdirSync(p).filter((f) => f.endsWith('.md') && f !== 'README.md').length : 0;
  }
  const bugsDone = existsSync(join(ROOT, 'bugs'))
    ? readdirSync(join(ROOT, 'bugs')).filter((f) => /DONE/.test(f)).length
    : 0;
  const decisions = (readFileSync(join(ROOT, 'MASTER_PLAN.md'), 'utf8').match(/^\|\s*\d+\s*\|/gm) || []).length;
  const lessons = (readFileSync(join(ROOT, 'EXPERIENCE.md'), 'utf8').match(/^### EXP-/gm) || []).length;
  const skills = existsSync(join(ROOT, 'framework', 'skills'))
    ? readdirSync(join(ROOT, 'framework', 'skills')).length
    : 0;
  return { dirs, bugsDone, decisions, lessons, skills };
}

/**
 * Токены и активное время из транскриптов сессий.
 *
 * Активное время — сумма пауз между соседними записями, НЕ превышающих порог простоя.
 *
 * ⚠️ ЧТО ЭТО ЗА ЧАСЫ, ТОЧНО. Это время, когда шла РАБОТА — человеком, агентом или обоими, —
 * а НЕ «часы за клавиатурой». Границы величины названы свидетельством владельца, а не догадкой
 * по карте. Его слово дословно про день 2026-08-07: «я был на работе дома, удалённо. Я и работал
 * по моей основной работе, и работал над KAIF. Агент работал, но я был рядом». То есть часы
 * шли, работа была совместной — но это не часы полной занятости одним делом. Сон, наоборот,
 * виден дырой (5,2 ч в ночь на 08-08) и в зачёт не идёт по построению.
 * (Первая редакция объявила тот день автономной работой агента — догадка по форме графика,
 * поправлена владельцем. Карта показывает, ЧТО работа шла; ЧЬЯ она и какой ценой — знает
 * только он, и это спрашивается, а не выводится.)
 */
function sessionStats(sinceISO) {
  if (!existsSync(TRANSCRIPTS)) return null;
  const files = readdirSync(TRANSCRIPTS).filter((f) => f.endsWith('.jsonl'));
  const byModel = {};
  let requests = 0;
  const stampsBySession = new Map();

  for (const f of files) {
    let lines;
    try {
      lines = readFileSync(join(TRANSCRIPTS, f), 'utf8').split('\n');
    } catch {
      continue;
    }
    for (const line of lines) {
      if (!line.includes('"timestamp"')) continue;
      let j;
      try {
        j = JSON.parse(line);
      } catch {
        continue;
      }
      if (!j.timestamp) continue;
      if (sinceISO && j.timestamp < sinceISO) continue;

      // Отметки времени — для активного времени (любая запись, не только запрос к модели).
      if (!stampsBySession.has(f)) stampsBySession.set(f, []);
      stampsBySession.get(f).push(Date.parse(j.timestamp));

      const u = j.message && j.message.usage;
      if (!u) continue;
      const model = (j.message && j.message.model) || '(не указана)';
      byModel[model] = byModel[model] || { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, requests: 0 };
      const a = byModel[model];
      a.input += u.input_tokens || 0;
      a.output += u.output_tokens || 0;
      a.cacheRead += u.cache_read_input_tokens || 0;
      a.cacheWrite += u.cache_creation_input_tokens || 0;
      a.requests += 1;
      requests += 1;
    }
  }

  let activeMs = 0;
  const gapLimit = IDLE_GAP_MINUTES * 60 * 1000;
  for (const stamps of stampsBySession.values()) {
    stamps.sort((a, b) => a - b);
    for (let i = 1; i < stamps.length; i += 1) {
      const gap = stamps[i] - stamps[i - 1];
      if (gap > 0 && gap <= gapLimit) activeMs += gap;
    }
  }

  const totals = Object.values(byModel).reduce(
    (s, a) => ({
      input: s.input + a.input,
      output: s.output + a.output,
      cacheRead: s.cacheRead + a.cacheRead,
      cacheWrite: s.cacheWrite + a.cacheWrite,
    }),
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  );
  totals.all = totals.input + totals.output + totals.cacheRead + totals.cacheWrite;

  let cost = 0;
  const costByModel = {};
  for (const [model, a] of Object.entries(byModel)) {
    const p = PRICE[model];
    if (!p) continue;
    const c =
      (a.input * p.in + a.output * p.out + a.cacheRead * p.in * CACHE_READ_FACTOR + a.cacheWrite * p.in * CACHE_WRITE_FACTOR) /
      1e6;
    costByModel[model] = c;
    cost += c;
  }

  // Энергия считается по СЧИТАННЫМ токенам (выход + вход + запись кэша): чтение кэша
  // пропускает основную часть вычислений, поэтому в базу не входит — это занижает оценку
  // осознанно, чтобы не раздувать чужую и без того широкую вилку.
  const computeTokens = totals.input + totals.output + totals.cacheWrite;

  return {
    requests,
    byModel,
    totals,
    cost,
    costByModel,
    activeHours: activeMs / 3.6e6,
    sessions: stampsBySession.size,
    energyWh: {
      value: computeTokens * WH_PER_TOKEN,
      low: computeTokens * WH_PER_TOKEN_LOW,
      high: computeTokens * WH_PER_TOKEN_HIGH,
      base: computeTokens,
    },
  };
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const all = args.includes('--all');
const fromIdx = args.indexOf('--from');
const sinceIdx = args.indexOf('--since');

let from = null;
let sinceISO = null;

if (all) {
  // вся история
} else if (sinceIdx >= 0 && args[sinceIdx + 1]) {
  // ДАТА СТАРТА РАБОТ, названная владельцем. Границей диффа становится РОДИТЕЛЬ первого
  // коммита, попавшего в окно: сам первый коммит — часть работы и должен войти в замер.
  sinceISO = args[sinceIdx + 1];
  const firstInWindow = git('log', `--since=${sinceISO}`, '--format=%H', '--reverse').split('\n').filter(Boolean)[0];
  if (!firstInWindow) {
    console.error(`в окне с ${sinceISO} нет коммитов`);
    process.exit(1);
  }
  from = `${firstInWindow}^`;
} else {
  from = fromIdx >= 0 ? args[fromIdx + 1] : previousTag();
  sinceISO = git('show', '-s', '--format=%cI', from);
}

const repo = repoStats(from);
const docs = docStats();
const sess = sessionStats(sinceISO);

if (args.includes('--json')) {
  console.log(JSON.stringify({ from, sinceISO, repo, docs, sessions: sess }, null, 2));
} else {
  const f = (n) => n.toLocaleString('ru-RU');
  const window = all
    ? 'вся история проекта'
    : sinceIdx >= 0
      ? `с ${sinceISO} — ДАТА СТАРТА РАБОТ, названная владельцем`
      : `после тега ${from} (${sinceISO}) — ⚠️ тег релиза ≠ начало работ над следующей версией`;
  console.log(`ОКНО: ${window} → HEAD (${repo.last})`);
  console.log('');
  console.log('— ИЗМЕРЕНО: репозиторий —');
  console.log(`  коммитов ${f(repo.commits)} · файлов затронуто ${f(repo.files)} · строк +${f(repo.insertions)} / −${f(repo.deletions)} · создано файлов ${f(repo.created)}`);
  for (const [m, n] of Object.entries(repo.byModel).sort((a, b) => b[1] - a[1])) {
    console.log(`  коммитов с трейлером «${m}»: ${f(n)}`);
  }
  console.log('');
  console.log(`  РУКОПИСНОГО (генераты исключены): прозы ${f(repo.proseLines)} строк / ${f(repo.proseWords)} слов · кода ${f(repo.codeLines)} строк`);
  console.log(`  календарных суток: ${repo.days.toFixed(1)}`);
  console.log('');
  console.log('— ИЗМЕРЕНО: документы (текущее состояние репозитория) —');
  console.log(`  ${Object.entries(docs.dirs).map(([d, n]) => `${d} ${n}`).join(' · ')}`);
  console.log(`  багов закрыто (тег DONE): ${docs.bugsDone} · решений владельца: ${docs.decisions} · уроков опыта: ${docs.lessons} · навыков: ${docs.skills}`);
  console.log('');
  if (!sess) {
    console.log('— транскрипты сессий недоступны на этой машине: токены, деньги, время и энергия не считаются —');
  } else {
    console.log('— ИЗМЕРЕНО: работа моделей —');
    console.log(`  сессий ${sess.sessions} · запросов к модели ${f(sess.requests)}`);
    console.log(`  токенов ВСЕГО ${f(sess.totals.all)} (вход ${f(sess.totals.input)} · выход ${f(sess.totals.output)} · чтение кэша ${f(sess.totals.cacheRead)} · запись кэша ${f(sess.totals.cacheWrite)})`);
    for (const [m, a] of Object.entries(sess.byModel).sort((x, y) => y[1].output - x[1].output)) {
      console.log(`    ${m}: запросов ${f(a.requests)} · выход ${f(a.output)} · чтение кэша ${f(a.cacheRead)}`);
    }
    console.log('');
    console.log('— ИЗМЕРЕНО: время —');
    console.log(`  активной работы ${sess.activeHours.toFixed(1)} ч (сумма пауз между записями не длиннее ${IDLE_GAP_MINUTES} мин)`);
    console.log('');
    console.log('— ОЦЕНКА ПО ПУБЛИЧНОМУ API-ПРАЙСУ (не счёт владельца: работа шла по подписке) —');
    for (const [m, c] of Object.entries(sess.costByModel).sort((x, y) => y[1] - x[1])) {
      console.log(`  ${m}: $${c.toFixed(2)}`);
    }
    console.log(`  ИТОГО: $${sess.cost.toFixed(2)}`);
    console.log('');
    // Фактически оплаченное за окно: подписка — фикс за месяц, делим по календарю окна.
    const paidActual = (HUMAN.subscriptionUsdMonth / 30) * repo.days;
    console.log('— ФАКТИЧЕСКИ ОПЛАЧЕНО ВЛАДЕЛЬЦЕМ (подписка, а не API) —');
    console.log(`  ${HUMAN.subscriptionPlan}: $${HUMAN.subscriptionUsdMonth}/мес → за ${repo.days.toFixed(1)} суток окна ≈ $${paidActual.toFixed(2)}`);
    console.log(`  та же работа по API-прайсу: $${sess.cost.toFixed(0)} — это ×${Math.round(sess.cost / paidActual)} от доли подписки за тот же срок`);
    console.log('  ⚠️ это НЕ «экономия»: подписка ограничена недельными лимитами и не даёт гарантий API.');
    console.log('     Правильное чтение: столько работы было сделано, если мерить её токенами по публичной цене.');
    console.log('');
    // ОДНО число на каждую ставку (см. константы выше): отраслевой ориентир техписателя и
    // Кейперс Джонс по коду. Обе ставки печатаются рядом с результатом — читатель подставит свои.
    const hProse = repo.proseWords / WORDS_PER_HOUR;
    const hCode = (repo.codeLines / CODE_LINES_PER_DAY) * WORK_HOURS_PER_DAY;
    const humanHours = hProse + hCode;
    console.log('— ОЦЕНКА ПО ОТРАСЛЕВЫМ СТАВКАМ: столько же работы руками людей —');
    console.log(`  ставки: проза ${WORDS_PER_HOUR} слов/час (1 000 слов за 8-часовой день, ориентир техписателя) · код ${CODE_LINES_PER_DAY} строк за рабочий день (Кейперс Джонс, 325–750 строк в месяц)`);
    console.log(`  проза: ${Math.round(hProse)} ч · код: ${Math.round(hCode)} ч`);
    console.log(`  ИТОГО ≈ ${Math.round(humanHours)} человеко-часов ≈ ${Math.round(humanHours / 8)} рабочих дней ≈ ${(humanHours / 168).toFixed(1)} человеко-месяцев`);
    console.log(`  фактически парой «человек + агент»: ${sess.activeHours.toFixed(1)} ч активной работы за ${repo.days.toFixed(1)} суток`);
    console.log('');
    // ── МЕТРИКА ЭФФЕКТИВНОСТИ ──
    // Два знаменателя, и подменять один другим нельзя: календарь включает сон и паузы,
    // активные часы — только время за работой. Календарный множитель СКРОМНЕЕ и потому честнее
    // как витринное число; активный отвечает на другой вопрос — «во сколько раз плотнее час».
    const calendarHours = repo.days * 24;
    const kCal = humanHours / calendarHours;
    const kAct = humanHours / sess.activeHours;
    console.log('— ЭФФЕКТИВНОСТЬ: пара «человек + агент» против команды людей —');
    console.log('  ⚠️ «активные часы» = время, когда ШЛА РАБОТА (человек, агент или оба вместе),');
    console.log('     а не часы полной занятости человека: сон исключён дырой, а дневные часы');
    console.log('     2026-08-07 владелец вёл параллельно со своей основной работой (его слово).');
    console.log(`  по КАЛЕНДАРЮ (${calendarHours.toFixed(0)} ч, включая сон и паузы): ×${kCal.toFixed(0)} — это ${Math.round(kCal * 100)} % производительности человеческой команды`);
    console.log(`  по АКТИВНЫМ ЧАСАМ (${sess.activeHours.toFixed(1)} ч, когда шла работа): ×${kAct.toFixed(0)} — ${Math.round(kAct * 100)} %`);
    console.log('  ⚠️ читается так: столько ЧЕЛОВЕКО-часов работы сжато в один календарный/активный час.');
    console.log('     Это сжатие ТРУДОЗАТРАТ, а не заявление «модель в N раз умнее человека»:');
    console.log('     объём считается по написанному, а качество написанного меряют гейты и ревизии, не эта метрика.');
    console.log('');
    console.log('— ЧУЖАЯ ОЦЕНКА: энергия (Anthropic Вт·ч на токен НЕ публикует) —');
    console.log(`  база: ${f(sess.energyWh.base)} вычисленных токенов (чтение кэша исключено намеренно)`);
    console.log(`  ≈ ${(sess.energyWh.value / 1000).toFixed(1)} кВт·ч при ставке ${WH_PER_TOKEN} Вт·ч на токен (медианный замер GPT-4o, ≈0,3 Вт·ч на запрос)`);
    console.log(`  границы чувствительности ставки: ${(sess.energyWh.low / 1000).toFixed(1)}–${(sess.energyWh.high / 1000).toFixed(0)} кВт·ч — на витрину едет одно число`);
    console.log('  источник вилки — публичные измерения инференса ДРУГИХ моделей на другом железе;');
    console.log('  выдавать это за наш замер или за данные Anthropic нельзя.');

    // ── Переводы в бытовую реальность ──
    const bookTokens = HUMAN.bookWords * HUMAN.tokensPerWord;
    const burgers = sess.cost / HUMAN.burgerUsd;
    const salaryHour = HUMAN.salaryUsdMonth / HUMAN.workHoursMonth;
    const payrollUsd = humanHours * salaryHour;
    const teamDays = humanHours / 8 / 5; // пятеро инженеров по 8 часов
    const homeDays = sess.energyWh.value / 1000 / HUMAN.householdKwhDay;

    console.log('');
    console.log('— ПЕРЕВОД В БЫТОВУЮ РЕАЛЬНОСТЬ (константы названы выше в исходнике) —');
    console.log(`  ДЕНЬГИ: $${sess.cost.toFixed(0)} ≈ ${Math.round(burgers)} гамбургеров ($${HUMAN.burgerUsd} за штуку) — ` +
      `или ${(sess.cost / HUMAN.salaryUsdMonth).toFixed(1)} месячных зарплаты инженера`);
    console.log(`  ТРУД: ${Math.round(humanHours)} человеко-часов — это команда из ПЯТИ инженеров, ` +
      `работающая ${Math.round(teamDays)} рабочих дней подряд`);
    console.log(`  ФОНД ОПЛАТЫ той же работы при ${HUMAN.salaryUsdMonth} $/мес: ` +
      `$${payrollUsd.toFixed(0)} (${(payrollUsd / 1000).toFixed(1)} тыс. долларов)`);
    console.log(`  ЭНЕРГИЯ: ≈ ${(sess.energyWh.value / 1000).toFixed(1)} кВт·ч — ` +
      `столько обычная квартира тратит за ${homeDays.toFixed(1)} суток ` +
      `(${HUMAN.householdKwhDay} кВт·ч в сутки)`);
    console.log(`  ТОКЕНЫ: ${f(sess.totals.all)} ≈ ${Math.round(sess.totals.all / bookTokens)} романов по ${f(HUMAN.bookWords)} слов, ` +
      `прочитанных и написанных заново`);
    console.log(`    из них НАПИСАНО моделью: ${f(sess.totals.output)} токенов ≈ ${Math.round(sess.totals.output / bookTokens)} романа(ов)`);
    console.log(`  ПРОЗА В РЕПОЗИТОРИИ: ${f(repo.proseWords)} слов ≈ ${(repo.proseWords / HUMAN.bookWords).toFixed(1)} романа — ` +
      `написано за ${repo.days.toFixed(1)} суток`);
    console.log(`  ТЕМП: ${Math.round(repo.proseWords / sess.activeHours)} слов в час активной работы ` +
      `(человек столько пишет за ${(repo.proseWords / sess.activeHours / WORDS_PER_HOUR).toFixed(1)} часа)`);
  }
}
