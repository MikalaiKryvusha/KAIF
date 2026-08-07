#!/usr/bin/env node
// verify-contour.mjs — QA-прогон интерактивного контура в ЖИВОМ браузере
// (фаза K5, plans/48 шаг 4; роль C1 «verify-<contour>»; таблица C10 — одиннадцать блоков).
// [TESTED: 2026-08-07 · прогон на этой машине: headless-блоки + --visible (QA2) + --selfcheck (QA5)]
//
// Ноль внешних зависимостей: браузером управляет мини-CDP-клиент на глобальном WebSocket
// (Node ≥22). Правила построения проверок:
//   G5  — правила гоняются на ФИКСТУРЕ во временном корне; живым документам — только инварианты;
//   G7  — счёт вариантов сверяется с ЗАМОРОЖЕННЫМ эталоном (verify-contour.etalon.json),
//         пересмотренным глазами; новый живой документ НАМЕРЕННО валит прогон до пересмотра (QA4);
//   G11 — считаем, не смотрим: строки-кандидаты (независимая примета) == разобранные варианты;
//   G12 — фикстура вёрстки несёт И короткий, И длинный вариант;
//   T2  — headless доказывает НЕ ТО про поведение окна: автозакрытие — только --visible (QA2);
//   C9  — каждый дочерний вызов и каждый шаг CDP несёт жёсткий срок;
//   C11 — никаких «|| true»: упавшая проверка КРАСНАЯ; --selfcheck доказывает, что падать умеем (QA5).
//
// Запуск:  node tools/verify-contour.mjs             — headless-прогон (блоки 1–11 + QA3 + QA7)
//          node tools/verify-contour.mjs --visible   — QA2: поведение окна на ВИДИМОМ окне
//          node tools/verify-contour.mjs --selfcheck — QA5: сломанный разбор ОБЯЗАН уронить прогон

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import {
  normalize, bodyHash, parseQuestions, recordDecision, readDecision, checkApproval,
} from './lib/review-core.mjs';
import { serveContour, enqueue, readQueue, pendingNotices } from './review.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ETALON_PATH = join(ROOT, 'tools', 'verify-contour.etalon.json');
const BROWSERS = [ // DEF8-порядок; пути стандартные, поверх — PATH
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const STEP_TIMEOUT_MS = 10000;   // C9: жёсткий срок каждого шага CDP
const LAUNCH_TIMEOUT_MS = 15000; // C9: срок старта браузера
const OPTION_LINE_RE = /^\s*-\s+\*\*[A-ZА-Я]\)/u; // G7: независимая примета счёта вариантов

// ── Счётчик проверок ───────────────────────────────────────────────────────────────────────
let PASS = 0, FAIL = 0;
const check = (name, cond, detail = '') => {
  if (cond) { PASS++; console.log('  ✓ ' + name); }
  else { FAIL++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
  return cond;
};
const block = (title) => console.log('\n[' + title + ']');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Мини-CDP-клиент (WebSocket из Node ≥22) ────────────────────────────────────────────────
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = []; }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('WS timeout')), STEP_TIMEOUT_MS);
      ws.onopen = () => { clearTimeout(t); res(); };
      ws.onerror = (e) => { clearTimeout(t); rej(new Error('WS error')); };
    });
    const c = new CDP(ws);
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { res, rej } = c.pending.get(msg.id);
        c.pending.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      } else if (msg.method) for (const fn of c.listeners) fn(msg);
    };
    return c;
  }
  send(method, params = {}, sessionId = undefined) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      setTimeout(() => { // C9: жёсткий срок; зависший вызов — красный, не вечное ожидание
        if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('CDP timeout: ' + method)); }
      }, STEP_TIMEOUT_MS);
    });
  }
  on(fn) { this.listeners.push(fn); }
}

async function launchBrowser({ headless = true, url = 'about:blank', app = false, profileDir }) {
  const exe = BROWSERS.find((p) => existsSync(p));
  if (!exe) throw new Error('браузер не найден по стандартным путям (DEF8)');
  const args = ['--remote-debugging-port=0', '--user-data-dir=' + profileDir, '--no-first-run',
    '--no-default-browser-check', '--disable-sync', '--disable-extensions'];
  if (headless) args.push('--headless=new');
  args.push(app ? '--app=' + url : url);
  const proc = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((res, rej) => {
    let buf = '';
    const t = setTimeout(() => rej(new Error('браузер не отдал DevTools ws за ' + LAUNCH_TIMEOUT_MS + ' мс')), LAUNCH_TIMEOUT_MS);
    proc.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { clearTimeout(t); res(m[1]); }
    });
    proc.on('exit', () => rej(new Error('браузер умер на старте')));
  });
  const cdp = await CDP.connect(wsUrl);
  return { proc, cdp, exe };
}

// Сессия вкладки: attach + enable доменов + сборщики консоли и сети
async function attachPage(cdp, url) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const events = { console: [], requests: [] };
  cdp.on((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type))
      events.console.push(msg.params.args.map((a) => a.value || a.description || '').join(' '));
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error')
      events.console.push(msg.params.entry.text);
    if (msg.method === 'Network.requestWillBeSent')
      events.requests.push(msg.params.request.url);
  });
  for (const d of ['Page', 'Runtime', 'Network', 'Log']) await cdp.send(d + '.enable', {}, sessionId);
  await cdp.send('Page.navigate', { url }, sessionId);
  await sleep(700); // страница локальная и самодостаточная — рендер мгновенный
  const evaluate = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  };
  return { targetId, sessionId, events, evaluate };
}

// ── Фикстура (G5): временный корень с интервью и исходящим черновиком ──────────────────────
function makeFixtureRoot() {
  const root = join(tmpdir(), 'kaif-verify-contour');
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, 'interviews'), { recursive: true });
  mkdirSync(join(root, 'drafts', 'bodies'), { recursive: true });
  // G12: вёрстка несёт И короткий, И длинный вариант; Q2 уже отвечен словом владельца (неприкосновенно).
  writeFileSync(join(root, 'interviews', 'interview_101_fixture.md'), [
    '# Interview #101 — фикстура QA-прогона',
    '',
    '> Status: **🟡 awaiting the owner\'s answers**',
    '',
    '| колонка | смысл |', '|---|---|', '| таблица | рендерится |',
    '',
    '### Q1. Какой вариант берём?',
    '',
    '- **A) (Рекомендовано)** короткий',
    '- **B)** очень длинный вариант, специально растянутый на изрядную ширину, чтобы вёрстка',
    '  прижала соседний элемент и дефект сжатия мог воспроизвестись на длинном соседе',
    '',
    '**Answer:**',
    '',
    '### Q2. Уже решённый вопрос?',
    '',
    '- **A)** да', '- **B)** нет',
    '',
    '**Answer:** B — слово владельца дословно, трогать запрещено',
    '',
  ].join('\n'), 'utf8');
  writeFileSync(join(root, 'drafts', 'bodies', 'msg1.md'), 'Тело исходящего сообщения для гейта.\n', 'utf8');
  writeFileSync(join(root, 'drafts', 'reply_fixture.md'), [
    '```owner-review',
    'title: Черновик ответа (фикстура)',
    'kind: outbound draft',
    'artifacts:',
    '  - id: msg1',
    '    target: github · issue 999',
    '    format: markdown',
    '    body_file: drafts/bodies/msg1.md',
    '```',
    '',
    '# Черновик ответа',
    '',
    'Согласуемое тело лежит ССЫЛКОЙ (body_file), не копипастой.',
    '',
  ].join('\n'), 'utf8');
  return root;
}

// Заполнить поля Q1 и нажать «Записать» — реальная механика страницы (pointerdown-активация P3)
const FILL_AND_SAVE_JS = [
  "(function(){",
  " var radio=document.querySelector('input[name=\"choice:interviews/interview_101_fixture.md:Q1\"][value=\"A\"]');",
  // черновик мог уже подхватить выбор (I12, тот же origin) — клик по ВЫБРАННОМУ радио честно
  // снял бы его (P3); кликаем только если не выбрано — как человек, который видит страницу
  " if(!radio.checked)radio.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));",
  " var txt=document.getElementsByName('text:interviews/interview_101_fixture.md:Q1')[0];",
  " txt.value='и свой текст';txt.dispatchEvent(new Event('input',{bubbles:true}));",
  " document.querySelector('#save').click();return true})()",
].join('');

// ── Основной headless-прогон ───────────────────────────────────────────────────────────────
async function main() {
  const fixtureRoot = makeFixtureRoot();
  const profile = join(tmpdir(), 'kaif-verify-profile');
  rmSync(profile, { recursive: true, force: true });
  let browser = null;
  const logSilent = () => {};

  try {
    block('1. Селфтесты ядра и стража (C10-блок 1)');
    const core = spawnSync(process.execPath, [join(ROOT, 'tools/lib/review-core.mjs'), '--selftest'],
      { encoding: 'utf8', timeout: STEP_TIMEOUT_MS });
    check('селфтест ядра зелёный', core.status === 0, (core.stdout || '').split('\n').find((l) => l.includes('✗')) || '');
    const guard = spawnSync(process.execPath, [join(ROOT, 'tools/questions-guard.mjs'), '--selftest'],
      { encoding: 'utf8', timeout: STEP_TIMEOUT_MS });
    check('селфтест стража (мутации G1/G3/I20) зелёный', guard.status === 0);

    block('2. ДО клика: ответа нет НИ в одном из трёх мест (C10-блок 2)');
    const fxDoc = 'interviews/interview_101_fixture.md';
    const q1 = parseQuestions(readFileSync(join(fixtureRoot, fxDoc), 'utf8')).find((q) => q.id === 'Q1');
    check('Q1 в md не отвечен', !q1.answered);
    check('decision.json отсутствует', readDecision(fixtureRoot, fxDoc) === null);
    check('архив решений пуст', !existsSync(join(fixtureRoot, 'interviews/decisions/archive')));

    block('3. Гейт ДО одобрения (C10-блок 3)');
    const draft = 'drafts/reply_fixture.md';
    check('checkApproval отказывает без решения', !checkApproval(fixtureRoot, draft, 'msg1').ok);
    const sendTry = spawnSync(process.execPath, [join(ROOT, 'tools/send-outbound.mjs'), draft, 'msg1', '--apply'],
      { cwd: fixtureRoot, encoding: 'utf8', timeout: STEP_TIMEOUT_MS });
    check('отправитель отказывает и под --apply (exit != 0)', sendTry.status !== 0);

    // Поднимаем контур фикстуры (in-process; окно/сигнал выключены — headless сам навигируется)
    let pageUrl = null;
    serveContour._onUp = (u) => { pageUrl = u; };
    const servePromise = serveContour(fixtureRoot, { docPath: fxDoc }, { open: false, signal: false, log: logSilent });
    while (!pageUrl) await sleep(50);

    browser = await launchBrowser({ headless: true, profileDir: profile });

    block('4. Страница × 2 темы × 2 ширины (C10-блок 4)');
    for (const scheme of ['light', 'dark']) {
      for (const width of [1100, 500]) {
        const page = await attachPage(browser.cdp, pageUrl);
        await browser.cdp.send('Emulation.setEmulatedMedia',
          { features: [{ name: 'prefers-color-scheme', value: scheme }] }, page.sessionId);
        await browser.cdp.send('Emulation.setDeviceMetricsOverride',
          { width, height: 900, deviceScaleFactor: 1, mobile: false }, page.sessionId);
        await sleep(200);
        const probe = await page.evaluate([
          "(function(){var card=document.querySelector('.qcard');var done=document.querySelector('.qcard.done');",
          " var cs=getComputedStyle(card);var csd=getComputedStyle(done);var body=getComputedStyle(document.body);",
          " function lum(c){var m=c.match(/\\d+/g).map(Number);var a=m.slice(0,3).map(function(v){v/=255;",
          "  return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]}",
          " var l1=lum(body.color),l2=lum(body.backgroundColor);var contrast=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);",
          " return {cards:document.querySelectorAll('.qcard').length,opts:document.querySelectorAll('.opt input').length,",
          "  optsEnabled:document.querySelectorAll('.opt input:not([disabled])').length,",
          "  tables:document.querySelectorAll('.doc table').length,stripe:cs.borderLeftWidth,",
          "  stripeDiff:cs.borderLeftColor!==csd.borderLeftColor,contrast:contrast,",
          "  overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}})()",
        ].join(''));
        const tag = scheme + '/' + width;
        // Закрытый вопрос показывает варианты ЦЕЛИКОМ выключенными радио (пилот 008):
        // всего 4 радио (2 активных Q1 + 2 выключенных Q2), активных — 2.
        check(tag + ': карточки и варианты на месте (в т.ч. серые закрытого)',
          probe.cards === 2 && probe.opts === 4 && probe.optsEnabled === 2,
          'cards=' + probe.cards + ' opts=' + probe.opts + ' enabled=' + probe.optsEnabled);
        check(tag + ': таблица отрендерена', probe.tables >= 1);
        check(tag + ': полоса состояния 5px и цветом различает wait/done (P1)',
          probe.stripe === '5px' && probe.stripeDiff);
        check(tag + ': контраст текста ≥ 4.5', probe.contrast >= 4.5, 'фактически ' + probe.contrast.toFixed(2));
        check(tag + ': нет горизонтального переполнения', !probe.overflow);
        check(tag + ': консоль чистая', page.events.console.length === 0, page.events.console[0]);
        await browser.cdp.send('Target.closeTarget', { targetId: page.targetId });
      }
    }

    block('5. Выбор: клик · второй клик снимает · третий ставит · сосед гасит (C10-блок 5)');
    {
      const page = await attachPage(browser.cdp, pageUrl);
      const sel = await page.evaluate([
        "(function(){var rs=document.querySelectorAll('input[name=\"choice:interviews/interview_101_fixture.md:Q1\"]');",
        " function pd(el){el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}))}",
        " var out=[];pd(rs[0]);out.push(rs[0].checked);",                     // клик выделяет
        " pd(rs[0]);out.push(!rs[0].checked);",                               // второй снимает (P3)
        " pd(rs[0]);out.push(rs[0].checked);",                                // третий снова ставит
        " pd(rs[1]);out.push(rs[1].checked&&!rs[0].checked);",                // сосед гасит прежний
        " pd(rs[0]);var div=rs[0].closest('label').querySelector('div');",    // текст-клик по выбранному
        " pd(div);out.push(rs[0].checked);",                                  // не снимает (skipped)
        " try{localStorage.clear()}catch(e){}",                               // тест-черновик не должен утечь в блок 6
        " return out})()",
      ].join(''));
      check('клик выделяет', sel[0] === true);
      check('второй клик СНИМАЕТ выбор (P3, полевой баг пилота 008)', sel[1] === true);
      check('третий клик снова выделяет', sel[2] === true);
      check('сосед гасит прежний', sel[3] === true);
      check('клик по ТЕКСТУ выбирает, но не снимает (label-target skipped)', sel[4] === true);
      await browser.cdp.send('Target.closeTarget', { targetId: page.targetId });
    }

    block('6–7. Ответ в один клик → три места · провенанс · ответ владельца цел · ПОБУДКА (C10-блоки 6–7)');
    {
      const page = await attachPage(browser.cdp, pageUrl);
      await page.evaluate(FILL_AND_SAVE_JS);
      const served = await Promise.race([servePromise, sleep(8000).then(() => null)]);
      check('контур ЗАВЕРШИЛСЯ САМ после записи (I8)', served !== null && served.outcome === 'decision recorded',
        served ? served.outcome : 'не завершился за 8 с');
      const mdAfter = readFileSync(join(fixtureRoot, fxDoc), 'utf8');
      const qs = parseQuestions(mdAfter);
      check('место 1: ответ в исходном md', qs.find((q) => q.id === 'Q1').answered);
      check('провенанс by/at в md', /owner-review: by .+ · \d+ /u.test(mdAfter));
      const dec = readDecision(fixtureRoot, fxDoc);
      check('место 2: decision.json с by/at/answers', dec && dec.by && dec.at && dec.answers.Q1.choice === 'A',
        dec ? 'answers=' + JSON.stringify(dec.answers) : 'decision.json не прочитан');
      const archive = join(fixtureRoot, 'interviews/decisions/archive');
      check('место 3: архивная копия существует', existsSync(archive) && readdirSync(archive).length === 1);
      check('ответ владельца в Q2 НЕ затёрт (байт-в-байт)',
        mdAfter.includes('**Answer:** B — слово владельца дословно, трогать запрещено'));
      // Дополнение отдельным полем: повторное решение по уже отвеченному Q2
      recordDecision(fixtureRoot, fxDoc, { answers: { Q2: { choice: 'A', text: 'передумал' } } });
      const md3 = readFileSync(join(fixtureRoot, fxDoc), 'utf8');
      check('follow-up — ОТДЕЛЬНЫМ датированным полем, оригинал цел',
        md3.includes('**Answer (дополнение,') && md3.includes('слово владельца дословно'));
      await browser.cdp.send('Target.closeTarget', { targetId: page.targetId }).catch(() => {});
    }

    block('8. Гейт ПОСЛЕ одобрения: проходит · дрейф рушит · CRLF+BOM не рушит (C10-блок 8)');
    {
      const bodyPath = join(fixtureRoot, 'drafts/bodies/msg1.md');
      const body = readFileSync(bodyPath, 'utf8');
      mkdirSync(join(fixtureRoot, 'interviews/decisions'), { recursive: true });
      writeFileSync(join(fixtureRoot, 'interviews/decisions/reply_fixture.decision.json'), JSON.stringify({
        kind: 'outbound draft', document: draft, by: 'QA', at: new Date().toISOString(),
        artifacts: { msg1: { status: 'approved', sha256: bodyHash(body) } },
      }, null, 2), 'utf8');
      check('после одобрения гейт проходит', checkApproval(fixtureRoot, draft, 'msg1').ok);
      writeFileSync(bodyPath, body + 'дрейф после одобрения\n', 'utf8');
      const drifted = checkApproval(fixtureRoot, draft, 'msg1');
      check('дрейф текста ДЕЛАЕТ одобрение недействительным (I3)', !drifted.ok && /I3|изменился/u.test(drifted.reason));
      writeFileSync(bodyPath, '﻿' + body.replace(/\n/g, '\r\n') + '\n\n', 'utf8');
      check('CRLF+BOM+хвост НЕ рушат одобрение (C3: четыре лица — один хеш)',
        checkApproval(fixtureRoot, draft, 'msg1').ok);
    }

    block('9. Счётная сверка вариантов по ВСЕМ живым документам против замороженного эталона (C10-блок 9, G7/G11/QA4)');
    {
      const live = liveOptionCounts();
      const etalon = existsSync(ETALON_PATH) ? JSON.parse(readFileSync(ETALON_PATH, 'utf8')) : null;
      check('эталон существует (заморожен и пересмотрен глазами)', etalon !== null);
      if (etalon) {
        for (const [file, c] of Object.entries(live)) {
          const e = etalon[file];
          check('эталон: ' + file, Boolean(e) && e.candidateLines === c.candidateLines &&
            e.parsedOptions === c.parsedOptions && e.questions === c.questions,
            e ? ('живое ' + JSON.stringify(c) + ' ≠ эталон ' + JSON.stringify(e))
              : 'НОВЫЙ живой документ — намеренный красный до пересмотра эталона (G7)');
        }
        for (const file of Object.keys(etalon))
          check('эталонный файл жив: ' + file, Boolean(live[file]), 'исчез с диска');
        const mism = Object.values(live).filter((c) => c.candidateLines !== c.parsedOptions);
        check('строки-кандидаты == разобранные варианты (G11, молча съеденный вариант невозможен)',
          mism.length === 0, JSON.stringify(mism));
      }
    }

    block('10. Живой документ: реальное интервью, ноль внешних загрузок (C10-блок 10)');
    {
      let liveUrl = null;
      serveContour._onUp = (u) => { liveUrl = u; };
      const livePromise = serveContour(ROOT, { docPath: 'interviews/interview_007_kaif_2.2.md' },
        { open: false, signal: false, log: logSilent });
      while (!liveUrl) await sleep(50);
      const page = await attachPage(browser.cdp, liveUrl);
      const probe = await page.evaluate(
        "(function(){return {title:document.title,cards:document.querySelectorAll('.qcard').length}})()");
      check('живое интервью 007 отрендерено (заголовок с именем проекта, P9)', probe.title.startsWith('KAIF'));
      check('карточки вопросов живого документа на месте', probe.cards === 15, 'фактически ' + probe.cards);
      const foreign = page.events.requests.filter((u) => !u.startsWith(liveUrl) && !u.startsWith('data:'));
      check('ноль внешних загрузок', foreign.length === 0, foreign[0]);
      check('консоль живой страницы чистая', page.events.console.length === 0, page.events.console[0]);
      await browser.cdp.send('Target.closeTarget', { targetId: page.targetId });
      // I25: третий исход — прерывание. НЕ process.kill(pid,'SIGINT'): на Windows libuv не
      // эмулирует сигнал, а УБИВАЕТ процесс (T-класс ловушка, поймана этим прогоном) —
      // поднимаем слушателей в процессе без участия ОС.
      process.emit('SIGINT');
      const r = await Promise.race([livePromise, sleep(3000).then(() => null)]);
      check('живой контур завершён прерыванием (исход в логе, I25)', r !== null && r.outcome === 'interrupted by the human');
    }

    block('10н. Класс «сообщение» в ЖИВОМ браузере: пометка КЛИКОМ (I37/I38, задача T10)');
    {
      // Ветка страничного JS, которую нельзя снять прямым POST: у сообщения нет ни одного
      // заполненного поля, и проверка «нечего записывать» обязана НЕ сработать — доказать это
      // может только настоящий клик по настоящей кнопке.
      const noticeRel = 'reports/notice_qa.md';
      mkdirSync(join(fixtureRoot, 'reports'), { recursive: true });
      const noticeBody = '# Отчёт для QA-прогона\n\nТело сообщения, которое человек читает.\n';
      writeFileSync(join(fixtureRoot, noticeRel), noticeBody, 'utf8');
      enqueue(fixtureRoot, noticeRel, { kind: 'notice' });
      let noticeUrl = null;
      serveContour._onUp = (u) => { noticeUrl = u; };
      const noticePromise = serveContour(fixtureRoot, { docPath: noticeRel, notice: true },
        { open: false, signal: false, log: logSilent });
      while (!noticeUrl) await sleep(50);
      const page = await attachPage(browser.cdp, noticeUrl);
      const probe = await page.evaluate([
        "(function(){var b=document.querySelector('#save');return {",
        " radios:document.querySelectorAll('input[type=radio]').length,",
        " btn:b?b.textContent:null, chip:!!document.querySelector('.tag.notice'),",
        " body:document.body.textContent.indexOf('Тело сообщения')>=0,",
        " commentEmpty:document.querySelector('textarea[data-draft]').value===''}})()",
      ].join(''));
      check('на странице сообщения НЕТ ни одной радиокнопки', probe.radios === 0, 'найдено ' + probe.radios);
      check('кнопка пометки — «ОК, прочитано»', probe.btn === 'ОК, прочитано', 'фактически «' + probe.btn + '»');
      check('чип класса «ответа не ждёт» на месте', probe.chip);
      check('тело сообщения человеку видно', probe.body);
      check('поле комментария пустое — пометка обязана пройти и без него', probe.commentEmpty);
      await page.evaluate("(function(){document.querySelector('#save').click();return true})()");
      const served = await Promise.race([noticePromise, sleep(8000).then(() => null)]);
      check('КЛИК по кнопке дал ШТАТНЫЙ исход «прочитано» (I37, а не «закрыто без ответа»)',
        served !== null && served.outcome === 'notice read', served ? served.outcome : 'не завершился за 8 с');
      check('исход несёт код успеха (0), как у записанного решения', served !== null && served.exitCode === 0);
      check('пометка доказуема полем readAt в очереди (I38)',
        readQueue(fixtureRoot).some((i) => i.doc === noticeRel && i.readAt));
      check('прочитанное сообщение ушло из очереди повторной доставки',
        pendingNotices(fixtureRoot).every((i) => i.doc !== noticeRel));
      const dec = readDecision(fixtureRoot, noticeRel);
      check('запись решения помечена классом notice', dec !== null && dec.kind === 'notice',
        dec ? 'kind=' + dec.kind : 'записи нет');
      check('документ владельца НЕ тронут побайтно (писать было нечего)',
        readFileSync(join(fixtureRoot, noticeRel), 'utf8') === noticeBody);
      check('консоль страницы сообщения чистая', page.events.console.length === 0, page.events.console[0]);
      await browser.cdp.send('Target.closeTarget', { targetId: page.targetId }).catch(() => {});
    }

    block('QA3. Оба сценария «страница ушла»: перезагрузка — ЖИВЁТ, закрытие — УМИРАЕТ');
    {
      rmSync(join(fixtureRoot, 'interviews/decisions'), { recursive: true, force: true });
      let url2 = null;
      serveContour._onUp = (u) => { url2 = u; };
      const p2 = serveContour(fixtureRoot, { docPath: fxDoc }, { open: false, signal: false, log: logSilent });
      while (!url2) await sleep(50);
      let p2Settled = false;
      p2.finally(() => { p2Settled = true; });
      const page = await attachPage(browser.cdp, url2);
      await browser.cdp.send('Page.reload', {}, page.sessionId);
      await sleep(4500); // грейс маячка 3 с + запас: перезагрузка НЕ должна убить сервер (T3)
      check('перезагрузка: контур ЖИВ (T3 — pagehide был, но страница вернулась)', !p2Settled);
      await browser.cdp.send('Target.closeTarget', { targetId: page.targetId });
      const closed = await Promise.race([p2, sleep(6000).then(() => null)]);
      check('закрытие: контур УМЕР быстрым путём маячка (I14)',
        closed !== null && closed.outcome === 'page closed without an answer', closed ? closed.outcome : 'жив спустя 6 с');
    }

    block('QA7. Мёртвый сервер headless: пять эталонных true');
    try {
      makeFixtureRoot(); // свежая фикстура: Q1 снова не отвечен (блок 6 уже записал ответ в старую)
      // Отдельный ПРОЦЕСС сервера — убиваем его внезапно, страница остаётся в браузере
      const child = spawn(process.execPath, [join(ROOT, 'tools/review.mjs'), 'interviews/interview_101_fixture.md',
        '--no-open', '--silent'], { cwd: fixtureRoot, stdio: ['ignore', 'pipe', 'ignore'] });
      const url3 = await new Promise((res, rej) => {
        let buf = '';
        const t = setTimeout(() => rej(new Error('child не поднялся')), LAUNCH_TIMEOUT_MS);
        child.stdout.on('data', (d) => {
          buf += d;
          const m = buf.match(/(http:\/\/127\.0\.0\.1:\d+\/)/);
          if (m) { clearTimeout(t); res(m[1]); }
        });
      });
      const page = await attachPage(browser.cdp, url3);
      child.kill('SIGKILL'); // сервер умирает ВНЕЗАПНО, унося RAM-состояние
      await sleep(500);
      await page.evaluate([ // действия человека: набрал ответ, нажал «Записать»
        "(function(){",
        " var txt=document.getElementsByName('text:interviews/interview_101_fixture.md:Q1')[0];",
        " txt.value='ответ в мёртвый сервер';txt.dispatchEvent(new Event('input',{bubbles:true}));",
        " pulse();document.querySelector('#save').click();return true})()",
      ].join(''));
      // Отказ проявляется НЕ мгновенно: Chrome переиспользует keep-alive-сокет убитого сервера
      // и ждёт TCP-таймаут — опрашиваем DOM до дедлайна, как ждал бы человек у экрана.
      const PROBE_JS = [
        "(function(){var draft=null;try{draft=localStorage.getItem(CFG.draftKey+':text:interviews/interview_101_fixture.md:Q1')}catch(e){}",
        " return {rescueShown:document.querySelector('#rescue').style.display==='block',",
        "  saveEnabled:!document.querySelector('#save').disabled,",
        "  answerInOutput:(document.querySelector('#rescuetext').value||'').indexOf('ответ в мёртвый сервер')>=0",
        "   ||(document.querySelector('#banner').textContent||'').length>0,",
        "  draftPersisted:draft==='ответ в мёртвый сервер',",
        "  statusHonest:/ОШИБКА|НЕДОСТУПЕН|не уйдёт/i.test((document.querySelector('#status').textContent||'')+(document.querySelector('#banner').textContent||''))}})()",
      ].join('');
      const DEAD_SERVER_DEADLINE_MS = 25000;
      let dom = null;
      const t0 = Date.now();
      while (Date.now() - t0 < DEAD_SERVER_DEADLINE_MS) {
        dom = await page.evaluate(PROBE_JS);
        if (dom.rescueShown && dom.saveEnabled) break;
        await sleep(500);
      }
      console.log('  (отказ проявился за ' + ((Date.now() - t0) / 1000).toFixed(1) + ' с)');
      check('спасательный блок показан = true', dom.rescueShown === true);
      check('кнопка записи снова активна = true', dom.saveEnabled === true);
      check('ответ присутствует в выводе = true', dom.answerInOutput === true);
      check('черновик подхвачен (localStorage) = true', dom.draftPersisted === true);
      check('статус честный = true', dom.statusHonest === true);
      await browser.cdp.send('Target.closeTarget', { targetId: page.targetId });
    } catch (e) {
      check('QA7 исполнился', false, e.message); // причина падения — в строку, не в маску
    }
  } finally {
    block('11. Уборка (C10-блок 11, QA6)');
    if (browser) { browser.proc.kill('SIGKILL'); check('браузер погашен', true); }
    await sleep(800); // Windows отпускает файлы убитого браузера не мгновенно
    rmTolerant(fixtureRoot);
    rmTolerant(profile);
    // Считаем только СВОИ замки (фикстура/очередь): замок живого документа, открытого
    // владельцу параллельно с QA, — не мусор прогона (пилот 008).
    const locks = existsSync(join(ROOT, 'interviews/decisions'))
      ? readdirSync(join(ROOT, 'interviews/decisions'))
        .filter((f) => f.endsWith('.lock') && /interview_101_fixture|_queue/.test(f)) : [];
    check('след убран: фикстура и профиль удалены, замков QA-прогона в репо нет',
      !existsSync(fixtureRoot) && !existsSync(profile) && locks.length === 0, 'остались замки: ' + locks.join(','));
  }
}

// Уборка, терпимая к меллящему Windows (файлы убитого браузера отпускаются не сразу)
const rmTolerant = (p) => { try { rmSync(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* остаток поймает check уборки */ } };

// Счёт вариантов по всем живым интервью (G11): независимая примета — строка-кандидат
function liveOptionCounts() {
  const out = {};
  const dir = join(ROOT, 'interviews');
  for (const f of readdirSync(dir).filter((x) => /^interview_\d+.*\.md$/.test(x)).sort()) {
    const md = readFileSync(join(dir, f), 'utf8');
    let candidateLines = 0, inFence = false;
    for (const line of normalize(md).split('\n')) {
      if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
      if (!inFence && OPTION_LINE_RE.test(line)) candidateLines++;
    }
    const qs = parseQuestions(md);
    out['interviews/' + f] = {
      questions: qs.length,
      parsedOptions: qs.reduce((s, q) => s + q.options.length, 0),
      candidateLines,
    };
  }
  return out;
}

// ── QA2 (--visible): поведение окна на ВИДИМОМ окне (T2 — headless доказывает не то) ───────
async function visibleRun() {
  const fixtureRoot = makeFixtureRoot();
  const profile = join(tmpdir(), 'kaif-verify-profile-visible');
  rmSync(profile, { recursive: true, force: true });
  let url = null;
  serveContour._onUp = (u) => { url = u; };
  const servePromise = serveContour(fixtureRoot, { docPath: 'interviews/interview_101_fixture.md' },
    { open: false, signal: false, log: () => {} });
  while (!url) await sleep(50);
  block('QA2. ВИДИМОЕ окно --app: запись → автозакрытие (I26/I27/DEF2)');
  const browser = await launchBrowser({ headless: false, app: true, url, profileDir: profile });
  try {
    // Вкладку не создаём — цепляемся к окну --app
    const targets = await browser.cdp.send('Target.getTargets');
    const pageT = targets.targetInfos.find((t) => t.type === 'page');
    const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId: pageT.targetId, flatten: true });
    await browser.cdp.send('Runtime.enable', {}, sessionId);
    await sleep(1200); // окно видимо реальному глазу
    const r = await browser.cdp.send('Runtime.evaluate',
      { expression: FILL_AND_SAVE_JS, returnByValue: true }, sessionId);
    check('клик по записи на видимом окне прошёл', r.result.value === true);
    const served = await Promise.race([servePromise, sleep(8000).then(() => null)]);
    check('контур завершился сам (I8)', served !== null && served.outcome === 'decision recorded');
    await sleep(AUTOCLOSE_WAIT_MS);
    let windowClosed = true;
    try {
      const after = await browser.cdp.send('Target.getTargets');
      windowClosed = !after.targetInfos.some((t) => t.type === 'page' && t.url.startsWith('http'));
    } catch { windowClosed = true; } // браузер сам ушёл вместе с последним окном
    check('окно --app закрылось САМО после записи (I27 на ВИДИМОМ окне, T2)', windowClosed);
  } finally {
    browser.proc.kill('SIGKILL');
    rmSync(fixtureRoot, { recursive: true, force: true });
    rmSync(profile, { recursive: true, force: true });
    console.log('  (уборка QA6: окно и профиль погашены)');
  }
}
const AUTOCLOSE_WAIT_MS = 5500; // DEF2: 2000 попытка + 2000 запас + люфт

// ── QA5 (--selfcheck): сломанный разбор ОБЯЗАН уронить счётную сверку ──────────────────────
function selfcheck() {
  block('QA5. Самопроверка падучести: сломанный разбор должен разойтись со счётом кандидатов');
  const md = readFileSync(join(ROOT, 'interviews', 'interview_007_kaif_2.2.md'), 'utf8');
  const qs = parseQuestions(md);
  const real = qs.reduce((s, q) => s + q.options.length, 0);
  // Мутация А (донорская, «однострочный разбор»): на НАШЕМ корпусе ВЫЖИВАЕТ — жирная метка
  // варианта закрывается в той же строке. Печатаем честно: выжившая мутация — тоже знание (G10:
  // «две мутации сперва выжили — это стоит помнить»); дискриминирующей выбрана мутация Б.
  let single = 0, inFence = false;
  for (const line of normalize(md).split('\n')) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (!inFence && OPTION_LINE_RE.test(line) && /\*\*[A-ZА-Я]\)[^*]*\*\*/u.test(line)) single++;
  }
  console.log('  мутация А (однострочный разбор): ' + single + ' == ' + real +
    (single === real ? ' — ВЫЖИЛА на этом корпусе (метки закрываются в строке); знание записано' : ''));
  // Мутация Б (наш класс G5: счёт привязан к мутабельному состоянию — только неотвеченные вопросы).
  // Предсказание: 007 закрыто целиком → сломанный счёт даст 0 против 45 у приметы-кандидата.
  const broken = qs.filter((q) => !q.answered).reduce((s, q) => s + q.options.length, 0);
  console.log('  мутация Б (варианты только неотвеченных): ' + broken + ' против настоящих ' + real);
  check('мутация Б ДАЁТ РАСХОЖДЕНИЕ по предсказанию (проверка умеет краснеть)', broken !== real,
    'мутация выжила — проверка не способна упасть (C11)');
}

// ── Точка входа (T9) ───────────────────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const args = process.argv.slice(2);
  const finish = () => {
    console.log('\nИТОГ QA-прогона: ' + PASS + ' зелёных, ' + FAIL + ' красных' +
      (FAIL ? ' — КОНТУР НЕ ПРИНЯТ' : ' — все проверки прогона зелёные'));
    process.exit(FAIL ? 1 : 0);
  };
  if (args.includes('--selfcheck')) { selfcheck(); finish(); }
  else if (args.includes('--visible')) { visibleRun().then(finish).catch((e) => { console.error('ПРОГОН УПАЛ: ' + e.message); process.exit(1); }); }
  else if (args.includes('--write-etalon')) { // G7: снять эталон → пересмотреть ГЛАЗАМИ → закоммитить
    writeFileSync(ETALON_PATH, JSON.stringify(liveOptionCounts(), null, 2) + '\n', 'utf8');
    console.log('Эталон снят → ' + ETALON_PATH + ' — пересмотри числа глазами до коммита (G7).');
  } else { main().then(finish).catch((e) => { console.error('ПРОГОН УПАЛ: ' + e.message); FAIL++; finish(); }); }
}
