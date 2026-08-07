#!/usr/bin/env node
// review.mjs — страница вычитки, сервер, сигнал, очередь (фаза K5, plans/48 шаги 2–3; роль C1 «review»).
// [TESTED: 2026-08-07 · живой пилот + QA-прогон verify-contour]
//
// ⚠️ T7 (ловушка платформы): внутри шаблонных строк этого файла НЕ ДОЛЖНО БЫТЬ обратных
// кавычек — бэктик в теле страницы роняет модуль синтаксической ошибкой В ДРУГОМ месте.
// JS страницы написан одинарными кавычками и конкатенацией; в текстах — только «ёлочки».
//
// Инварианты контракта, живущие здесь:
//   I1  — md источник, HTML производное; I5 — сигнал ПОСЛЕ поднявшейся страницы;
//   I6  — тихие часы поверх всего (autoloop → тихие часы → настройка), окно через полночь;
//   I7  — очередь — ФАЙЛ СОСТОЯНИЯ (queue.json), живые документы не переносятся;
//   I8  — записанное решение ЗАВЕРШАЕТ контур; очередь не пуста → перезапуск пачки — долг АГЕНТА;
//   I9  — ожидание без таймаута (дефолт 0; --timeout N — только автоматизация, терпимая ТИШИНА);
//   I10/I11/I12/I13 — громкий отказ · спасательный круг · черновик в браузере · пульс /alive;
//   I14 — обратный пульс: маячок /closed (быстрый путь) + тишина-вахта 3 мин, два страйка (T5);
//   I25 — три исхода в логе; I26/I27 — окно --app=, автозакрытие — попытка; I29/I30 — замок/порт;
//   I31 — запускать ОТСЛЕЖИВАЕМОЙ фоновой задачей; I32 — зов не блокирует контур (async-цепочка);
//   I33/I34 — писки 880/660/990 через звуковую карту ПЕРВЫМИ, доставка не доказывается exit-кодом;
//   I35/I36 — голос честно падает на системный; текст в синтезатор ФАЙЛОМ, команда ASCII;
//   M8  — рендер без показа печатает «RENDER IS NOT YET A SHOW» + готовую команду открытия.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { join, resolve, basename, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';
import {
  PROJECT_NAME, DECISIONS_DIR, normalize, bodyHash, provenance, inQuietHours,
  parseMetaBlock, parseQuestions, docStatus, renderMd, recordDecision,
} from './lib/review-core.mjs';

// ── Константы (канонические дефолты DEF; конверт владельца — отступать только его словом) ──
const ALIVE_INTERVAL_MS = 15000;      // DEF4: пульс страница→сервер, конверт 10–60 с
const AUTOCLOSE_DELAY_MS = 2000;      // DEF2: попытка window.close() после записи
const AUTOCLOSE_RESERVE_MS = 2000;    // DEF2: запас на отказ закрытия → честная просьба
const SERVER_DEATH_MS = 2500;         // DEF3: смерть сервера после записи (окно успевает уйти)
const BEACON_RELOAD_GRACE_MS = 3000;  // DEF6/T3: ~3 с после маячка — отличить перезагрузку от закрытия
const SILENCE_THRESHOLD_MS = 180000;  // DEF6: порог тишины 3 мин (фон-вкладки троттлятся, T4)
const SILENCE_TICK_MS = 15000;        // DEF5: вахта тишины тикает каждые 15 с
const SILENCE_STRIKES_TO_DIE = 2;     // DEF6/T5: два страйка против сна машины
const BEEP_DEADLINE_MS = 8000;        // DEF7: жёсткий срок дочернего вызова писка
const VOICE_TIMEOUT_MS = 60000;       // DEF7: таймаут голоса (первый холодный зов ~11 с — писки прикрывают)
// Голос — ВЫНЕСЕННЫЙ вердикт владельца (не переспрашивается): движок Silero v5 ru, голос eugene —
// «звучит по-человечески, а не роботом» (вердикт зафиксирован в NDim tools/review.mjs, движок —
// общий «рот» МАШИНЫ в KLAS, I36: тяжёлый TTS принадлежит машине, проект зовёт готовую команду).
const VOICE_TOOL = process.env.KAIF_VOICE_TOOL || 'F:\\KLAS\\tools\\voice-say.mjs';
const VOICE_NAME = process.env.KAIF_VOICE || 'eugene';
const SAPI_VOICE = process.env.KAIF_SAPI_VOICE || 'Microsoft Irina Desktop'; // фолбэк-голос доноров (NDim/Unliminium)
const WINDOW_SIZE = '1100,900';       // DEF8
const EXIT_DECIDED = 0, EXIT_CLOSED = 2, EXIT_INTERRUPTED = 130; // I25: три исхода
const QUEUE_FILE = 'interviews/decisions/queue.json'; // I7: очередь — файл состояния
const TMP_DIR = 'tools/.review-tmp';

// ── Сигнал (C8/I33): писк → консоль → голос; тихие часы поверх всего (I6) ──────────────────
export function signalCall(root, rawPhrase, { quiet = inQuietHours(), log = console.log } = {}) {
  // Звено «баннер» = строка в консоли (без OS-уведомлений) — принято владельцем: интервью №008, Q2.
  log('СИГНАЛ: ' + rawPhrase); // C8: простой текст в консоль — exit-код не доказывает, что человек услышал
  // Разметка в голос не уходит (урок KLAS bugs/14: markdown утекал в речь).
  const phrase = rawPhrase.replace(/[*_`#>[\]()«»]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (quiet) { log('Тихие часы (I6) — писк и голос подавлены; страница поднята молча.'); return; }
  // Писки — через звуковую карту (I34), команда ASCII, жёсткий срок DEF7; затем — голос.
  const beep = spawn('powershell.exe',
    ['-NoProfile', '-Command', '[console]::beep(880,160);[console]::beep(660,160);[console]::beep(990,260)'],
    { stdio: 'ignore', timeout: BEEP_DEADLINE_MS });
  beep.on('exit', () => {
    // Голос: сначала Silero (вердикт владельца — eugene; node-argv без шелла, кодировка не
    // искажается), при недоступности «рта» машины — честный фолбэк на системный SAPI (I35).
    const sapiFallback = () => {
      const dir = resolve(root, TMP_DIR);
      mkdirSync(dir, { recursive: true });
      const phraseFile = join(dir, 'call-phrase.txt');
      writeFileSync(phraseFile, '﻿' + phrase, 'utf8'); // UTF-8 с BOM — PS5.1 читает кодировку по BOM
      spawn('powershell.exe', ['-NoProfile', '-Command',
        'Add-Type -AssemblyName System.Speech; ' +
        '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
        "try { $s.SelectVoice('" + SAPI_VOICE.replace(/'/g, "''") + "') } catch {}; " +
        "$s.Speak([IO.File]::ReadAllText('" + phraseFile.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'))"],
        { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS }).on('error', () => {});
    };
    try {
      const silero = spawn(process.execPath, [VOICE_TOOL, phrase, '--play', '--voice', VOICE_NAME],
        { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS });
      silero.on('exit', (code) => { if (code !== 0) sapiFallback(); });
      silero.on('error', sapiFallback);
    } catch { sapiFallback(); }
  });
  beep.on('error', () => {}); // сигнал никогда не роняет контур (I32)
}

// ── Очередь (I7): файл состояния; живые документы остаются на местах ───────────────────────
export function readQueue(root) {
  const p = resolve(root, QUEUE_FILE);
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return []; }
}
export function writeQueue(root, items) {
  mkdirSync(resolve(root, DECISIONS_DIR), { recursive: true });
  writeFileSync(resolve(root, QUEUE_FILE), JSON.stringify(items, null, 2) + '\n', 'utf8');
}
export function enqueue(root, docPath) {
  const items = readQueue(root);
  const rel = relative(root, resolve(root, docPath)).replace(/\\/g, '/');
  if (!items.some((i) => i.doc === rel)) {
    items.push({ doc: rel, addedAt: provenance().at });
    writeQueue(root, items);
  }
  return items;
}

// Все документы с неотвеченными вопросами: скан interviews/ (живые документы на местах) + очередь.
export function pendingDocs(root) {
  const seen = new Set();
  const out = [];
  const push = (rel) => {
    if (seen.has(rel) || !existsSync(resolve(root, rel))) return;
    seen.add(rel);
    const md = readFileSync(resolve(root, rel), 'utf8');
    const unanswered = parseQuestions(md).filter((q) => !q.answered);
    if (unanswered.length > 0 || docStatus(md) === 'waiting') out.push({ doc: rel, unanswered: unanswered.length });
  };
  const ivDir = resolve(root, 'interviews');
  if (existsSync(ivDir))
    for (const f of readdirSync(ivDir).filter((x) => /^interview_\d+.*\.md$/.test(x)).sort())
      push('interviews/' + f);
  for (const item of readQueue(root)) push(item.doc);
  return out;
}

// ── Сборка страниц (I1: только из документов) ──────────────────────────────────────────────
export function buildPage(root, docPath) {
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const meta = parseMetaBlock(md);
  const rel = relative(root, resolve(root, docPath)).replace(/\\/g, '/');
  const kind = (meta && meta.kind) ||
    (rel.startsWith('interviews/') ? 'интервью' : rel.startsWith('homeworks/') ? 'домашка' : 'документ');
  const title = (meta && meta.title) || (normalize(md).match(/^#\s+(.+)$/m) || [])[1] || basename(docPath);
  const parsed = parseQuestions(md);
  // Карточка несёт ВСЁ тело вопроса (расширенная мета: происхождение, что питает/блокирует —
  // слово владельца, пилот 008), кроме вариантов и полей ответа — те интерактивны.
  const proseOf = (q) => {
    const keep = [];
    let inOpt = false;
    for (const line of q.body) {
      if (/^\s*-\s+\*\*[A-ZА-Я]\)/u.test(line)) { inOpt = true; continue; }
      if (inOpt && /^\s{2,}\S/.test(line)) continue;
      inOpt = false;
      if (/^\s*\*{0,2}(?:Answer|Ответ(?:\s+владельца)?)\s*(?:\([^)]*\))?\s*:/iu.test(line)) continue;
      if (/^\s*\*{0,2}Адресат\s+ответа\s*:/iu.test(line)) continue; // уходит в мета-строку
      keep.push(line);
    }
    return renderMd(keep.join('\n'));
  };
  const questions = parsed.map((q) => ({
    doc: rel, id: q.id, title: q.title, answered: q.answered, target: q.target,
    bodyHtml: proseOf(q),
    options: q.options.map((o) => ({ letter: o.letter, html: renderMd(o.text) })),
    // I24 в узле показа (класс NDim bug 112 — «просочились некрасивые комментарии», пилот 008):
    // провенанс-маркер живёт в md, но НИКОГДА не показывается человеку.
    existing: q.answers.filter((a) => a.text)
      .map((a) => a.text.replace(/<!--[\s\S]*?-->/g, '').trim()).filter(Boolean),
  }));
  const docHash = bodyHash(md);
  // Полевые правки пилота 008 (слово владельца, 2026-08-07):
  // 1) блоки вопросов ВЫРЕЗАЮТСЯ из текстового рендера — интерактивные карточки ниже
  //    остаются единственной формой вопросов (дубль текстом сбивал с толку);
  // 2) шапка несёт наглядную сводку «отвечено / ждут вас».
  const normLines = normalize(md).split('\n');
  const drop = new Set();
  for (const q of parsed)
    for (let i = q.line - 1; i <= q.line - 1 + q.body.length && i < normLines.length; i++) drop.add(i);
  normLines.forEach((l, i) => { if (/^#{1,3}\s+(QUESTIONS|Вопросы)\b/iu.test(l)) drop.add(i); });
  const body = renderMd(normLines.filter((_, i) => !drop.has(i)).join('\n'));
  const nAns = questions.filter((q) => q.answered).length;
  const nWait = questions.length - nAns;
  const summary = questions.length
    ? ' <span class="tag done">отвечено ' + nAns + '</span>' +
      (nWait ? ' <span class="tag you">ждут вас ' + nWait + '</span>' : ' <span class="tag done">все отвечены</span>')
    : '';
  const html = pageShell({
    title, kind,
    heading: '<span class="kind">' + kind + '</span><span>' + esc(title) + '</span>' + summary,
    main: '<div class="doc">' + body + '</div><h2>Вопросы</h2>' +
      (questions.map((q) => qCard(q)).join('\n') ||
        '<p>Вопросов в документе нет — можно оставить общий комментарий.</p>') +
      docCommentBlock(rel),
    questions,
  });
  return { html, questions, docHash, kind, title, rel };
}

// Пачечная страница «Накопилось N» (I7): карточка на документ, ссылка = имя документа;
// запись по ОДНОМУ документу закрывает контур (I8) — остаток пачки перезапускает агент.
export function buildQueuePage(root, docs) {
  const groups = docs.map(({ doc }) => {
    const page = buildPage(root, doc);
    const pending = page.questions.filter((q) => !q.answered);
    return { doc, title: page.title, kind: page.kind, pending };
  });
  const total = groups.reduce((s, g) => s + g.pending.length, 0);
  const main = groups.map((g) =>
    '<section class="group"><h2>' + esc(g.title) + ' <small class="kind">' + esc(g.doc) + '</small></h2>' +
    (g.pending.map((q) => qCard(q)).join('\n') || '<p>Неотвеченных вопросов нет — документ ждёт статусом.</p>') +
    docCommentBlock(g.doc) +
    '<p><button type="button" class="savedoc" data-doc="' + esc(g.doc) + '">Записать решения по этому документу</button></p>' +
    '</section>').join('\n<hr>\n');
  const questions = groups.flatMap((g) => g.pending);
  const html = pageShell({
    title: 'Накопилось: ' + docs.length + ' документ(ов), ' + total + ' вопрос(ов)',
    kind: 'очередь',
    heading: '<span class="kind">очередь</span><span>Накопилось: ' + docs.length +
      ' документ(ов) · ' + total + ' неотвеченных вопрос(ов)</span>',
    main, questions, batch: true,
  });
  return { html, questions, total };
}

const esc = (s) => String(s).replace(/</g, '&lt;');
const docCommentBlock = (rel) =>
  '<h3>Комментарий по документу целиком</h3>' + // P7: легитимный исход вычитки сам по себе
  '<p><textarea data-draft data-doc="' + esc(rel) + '" name="doccomment:' + esc(rel) + '" rows="3" ' +
  'placeholder="Можно без ответов — просто сказать (запишется датированным блоком в конец документа)"></textarea></p>';

function qCard(q) {
  // Язык интерфейса = язык владельца (слово владельца, пилот 008): интервью на русском —
  // чипсы состояний на русском; английские метки поверх русского текста — не user-friendly.
  const tag = q.answered ? '<span class="tag done">отвечено</span>'
    : '<span class="tag wait">без ответа</span> <span class="tag you">ждёт вас</span>';
  // Закрытые вопросы НЕ сворачиваются: варианты остаются полностью, как были, карточка
  // уводится в серый (слово владельца, пилот 008); выбранный вариант помечен, поля выключены.
  const chosenLetter = q.answered && q.existing[0]
    ? (q.existing[0].match(/^([A-ZА-Я])\)/u) || [])[1] || null : null;
  const opts = q.options.map((o) =>
    '<label class="opt"><input type="radio" ' +
    (q.answered ? 'disabled' + (o.letter === chosenLetter ? ' checked' : '')
      : 'data-draft') +
    ' name="choice:' + esc(q.doc) + ':' + q.id + '" value="' + o.letter + '">' +
    '<div>' + o.html + '</div></label>').join('');
  const existing = q.existing.map((t) => '<p><strong>Ответ:</strong> ' + esc(t) + '</p>').join('');
  const inputs = q.answered ? '' :
    '<p><input type="text" data-draft name="text:' + esc(q.doc) + ':' + q.id + '" placeholder="Свой вариант / текст ответа (D)"></p>' +
    '<p><textarea data-draft name="comment:' + esc(q.doc) + ':' + q.id + '" rows="2" placeholder="Комментарий к вопросу (P7)"></textarea></p>';
  const meta = q.target
    ? '<div class="qmeta">Адресат ответа: ' + esc(q.target).replace(/`/g, '') + '</div>' : '';
  return '<section class="qcard' + (q.answered ? ' done' : '') + '">' +
    '<div><strong>' + q.id + '.</strong> ' + esc(q.title) + ' ' + tag + '</div>' +
    (q.bodyHtml ? '<div class="qbody">' + q.bodyHtml + '</div>' : '') + meta +
    existing + opts + inputs + '</section>';
}

function pageShell({ title, kind, heading, main, questions, batch = false }) {
  const qjson = JSON.stringify(questions).replace(/</g, '\\u003c');
  const cfg = JSON.stringify({
    batch, aliveMs: ALIVE_INTERVAL_MS, closeMs: AUTOCLOSE_DELAY_MS, reserveMs: AUTOCLOSE_RESERVE_MS,
    draftKey: 'owner-review:' + (batch ? 'queue' : (questions[0] && questions[0].doc) || title),
  }).replace(/</g, '\\u003c');
  // P5: обе темы через prefers-color-scheme, цвета — переменные; контраст заложен в парах.
  const css = `
  :root { --bg:#f7f7f5; --card:#ffffff; --ink:#1d1d1f; --muted:#6b6b70; --line:#d9d9de;
    --wait:#d97706; --done:#16a34a; --you:#2563eb; --danger:#dc2626; --accent:#2563eb; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#17171a; --card:#212126; --ink:#ececf0; --muted:#a0a0a8; --line:#3a3a42;
      --wait:#f59e0b; --done:#22c55e; --you:#60a5fa; --danger:#f87171; --accent:#60a5fa; } }
  * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.55 system-ui, "Segoe UI", sans-serif; }
  header { position:sticky; top:0; background:var(--card); border-bottom:1px solid var(--line);
    padding:10px 20px; display:flex; gap:12px; align-items:baseline; z-index:5; flex-wrap:wrap }
  header .project { font-weight:700; color:var(--accent) } .kind { color:var(--muted) }
  main { max-width:900px; margin:0 auto; padding:16px 20px 120px }
  .doc { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:8px 22px; overflow-x:auto }
  .doc pre { background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px; overflow-x:auto }
  .doc code { background:var(--bg); padding:1px 4px; border-radius:4px }
  .doc table { border-collapse:collapse; margin:8px 0 } .doc th,.doc td { border:1px solid var(--line); padding:4px 8px }
  .doc blockquote { border-left:3px solid var(--line); margin:8px 0; padding:2px 12px; color:var(--muted) }
  .qcard { background:var(--card); border:1px solid var(--line); border-left:5px solid var(--wait);
    border-radius:10px; padding:12px 16px; margin:14px 0 } /* P1: полоса состояния 5px */
  .qcard.done { border-left-color:var(--done); opacity:.72 } /* закрытый вопрос виден целиком, но в сером */
  .tag { font-size:12px; padding:2px 8px; border-radius:99px; color:#fff } /* P2 */
  .tag.wait { background:var(--wait) } .tag.done { background:var(--done) } .tag.you { background:var(--you) }
  /* Полевые правки пилота 008: радио большие и выразительные; текст варианта на одной линии
     с кнопкой (маргины абзацев внутри флекса роняли текст ниже кнопки — «вёрстка разъехалась») */
  .opt { display:flex; gap:12px; align-items:flex-start; margin:10px 0; cursor:pointer }
  .opt input[type=radio] { width:22px; height:22px; flex:0 0 auto; margin-top:0;
    accent-color:var(--accent); cursor:pointer }
  .opt div p { margin:2px 0 }
  .qbody p { margin:6px 0 }
  .qmeta { font-size:13px; color:var(--muted); margin:6px 0 }
  textarea, input[type=text] { width:100%; background:var(--bg); color:var(--ink);
    border:1px solid var(--line); border-radius:8px; padding:8px; font:inherit }
  .bar { position:fixed; bottom:0; left:0; right:0; background:var(--card); border-top:1px solid var(--line);
    padding:10px 20px; display:flex; gap:14px; align-items:center; justify-content:center;
    text-align:center } /* центрировано — слово владельца, пилот 008 (2026-08-07) */
  .bar #status { flex:0 1 auto }
  button { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:9px 18px;
    font:inherit; cursor:pointer } button:disabled { opacity:.5; cursor:default }
  button.ghost { background:transparent; color:var(--accent); border:1px solid var(--accent) }
  #status { flex:0 1 auto } .err { color:var(--danger); font-weight:600 } .okmsg { color:var(--done); font-weight:600 }
  #rescue { display:none; border:2px solid var(--danger); border-radius:10px; padding:12px; margin:14px 0 }
  #banner { display:none; position:sticky; top:46px; background:var(--danger); color:#fff;
    padding:8px 20px; font-weight:600; z-index:6 }`;

  // JS страницы — одинарные кавычки и конкатенация, НИ ОДНОГО бэктика (T7).
  const js = [
    "var CFG=" + cfg + ";var QS=" + qjson + ";",
    "var $=function(s){return document.querySelector(s)};",
    "function status(msg,cls){var s=$('#status');s.textContent=msg;s.className=cls||''}",
    // I12: черновик в браузере — каждое поле в localStorage, восстановление с заметкой
    "var DK=CFG.draftKey+':';",
    "function saveDraft(el){try{localStorage.setItem(DK+el.name,el.type==='radio'?(el.checked?el.value:''):el.value)}catch(e){}}",
    "function restoreDraft(){var n=0;var els=document.querySelectorAll('[data-draft]');",
    " for(var i=0;i<els.length;i++){var el=els[i];var v=null;try{v=localStorage.getItem(DK+el.name)}catch(e){}",
    "  if(v===null||v==='')continue;",
    "  if(el.type==='radio'){if(el.value===v&&!el.checked){el.checked=true;n++}}else if(!el.value){el.value=v;n++}}",
    " if(n>0)status('Подхвачен черновик: '+n+' полей(я) восстановлено из браузера','okmsg')}",
    // P3: радио, очищаемое вторым кликом. ПОЛЕВОЙ БАГ пилота 008 («тысячу раз чинили»):
    // нативная активация label-обёртки ДУБЛИРУЕТ click — второй клик снимал и тут же ставил
    // обратно. Лечение по классу: активацию берём на себя на pointerdown с preventDefault —
    // нативной активации (и дубля) не существует вовсе. Клик по самому полю переключает
    // (второй СНИМАЕТ); клик по тексту выбирает, но не снимает (label-target skipped).
    "document.addEventListener('pointerdown',function(e){var lab=e.target&&e.target.closest?e.target.closest('label.opt'):null;",
    " if(!lab)return;var inp=lab.querySelector('input[type=radio]');if(!inp||inp.disabled)return;",
    " e.preventDefault();var was=inp.checked;",
    " if(e.target===inp){inp.checked=!was}else if(!was){inp.checked=true}",
    " saveDraft(inp)});",
    "document.addEventListener('input',function(e){if(e.target&&e.target.hasAttribute&&e.target.hasAttribute('data-draft'))saveDraft(e.target)});",
    // Сбор ответов по документу (пачка шлёт свой doc; одиночная страница — единственный)
    "function fieldVal(name){var el=document.getElementsByName(name)[0];return el?el.value:''}",
    "function collect(doc){var answers={};for(var i=0;i<QS.length;i++){var q=QS[i];",
    " if(q.answered||q.doc!==doc)continue;",
    " var chosen='';var rs=document.getElementsByName('choice:'+doc+':'+q.id);",
    " for(var j=0;j<rs.length;j++)if(rs[j].checked)chosen=rs[j].value;",
    " var own=fieldVal('text:'+doc+':'+q.id);var com=fieldVal('comment:'+doc+':'+q.id);",
    " if(chosen||own.trim()||com.trim())answers[q.id]={choice:chosen,text:own.trim(),comment:com.trim()}}",
    " return {doc:doc,answers:answers,comment:fieldVal('doccomment:'+doc)}}",
    // I10/I11: громкий отказ + спасательный круг; кнопка снова активна, текст возвращается человеку
    "function rescue(payload,msg){status('ОШИБКА ЗАПИСИ: '+msg,'err');var r=$('#rescue');r.style.display='block';",
    " $('#rescuetext').value=JSON.stringify(payload,null,2);enableButtons(true)}",
    "function enableButtons(on){var bs=document.querySelectorAll('button');",
    " for(var i=0;i<bs.length;i++)bs[i].disabled=!on}",
    "var saved=false,closeTimer=null,lastPayload=null;",
    "function doSave(doc){var p=collect(doc);lastPayload=p;",
    " if(Object.keys(p.answers).length===0&&!(p.comment||'').trim()){status('Нечего записывать: ни ответа, ни комментария','err');return}",
    " enableButtons(false);status('Записываю…');",
    " fetch('/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})",
    " .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})",
    " .then(function(res){if(!res.ok||!res.j.ok){rescue(p,res.j.reason||'сервер отказал');return}",
    "  saved=true;status('Записано: '+res.j.written+'. Окно закроется само…','okmsg');",
    "  try{var ks=[];for(var i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));",
    "   for(var k=0;k<ks.length;k++)if(ks[k].indexOf(DK)===0)localStorage.removeItem(ks[k])}catch(e){}",
    // I27/DEF2: автозакрытие — ПОПЫТКА; отказ → честное «закройте меня»; отменяется pagehide
    "  setTimeout(function(){window.close();closeTimer=setTimeout(function(){",
    "   status('Браузер не дал закрыть окно — закройте его, пожалуйста, сами','err')},CFG.reserveMs)},CFG.closeMs)})",
    " .catch(function(e){rescue(p,String(e))})}",
    "document.addEventListener('click',function(e){var t=e.target;",
    " if(t&&t.classList&&t.classList.contains('savedoc'))doSave(t.getAttribute('data-doc'));",
    " if(t&&t.id==='retry'&&lastPayload)doSave(lastPayload.doc)});",
    "var single=$('#save');if(single)single.addEventListener('click',function(){doSave(single.getAttribute('data-doc'))});",
    "var cp=$('#copybtn');if(cp)cp.addEventListener('click',function(){var t=$('#rescuetext');t.select();",
    " try{document.execCommand('copy');status('Скопировано в буфер','okmsg')}catch(e){status('Выделите и скопируйте вручную','err')}});",
    // I13/DEF4: пульс страница→сервер — о смерти сервера человек узнаёт СРАЗУ и вслух
    "function pulse(){fetch('/alive').then(function(r){if(!r.ok)throw 0;$('#banner').style.display='none'})",
    " .catch(function(){var b=$('#banner');b.style.display='block';",
    "  b.textContent='СЕРВЕР КОНТУРА НЕДОСТУПЕН — ответ НЕ уйдёт. Черновик сохранён в браузере; скопируйте текст (кнопка ниже) или перезапустите контур.';",
    "  var r=$('#rescue');r.style.display='block';",
    "  if(lastPayload)$('#rescuetext').value=JSON.stringify(lastPayload,null,2);enableButtons(true)})}",
    "setInterval(pulse,CFG.aliveMs);pulse();",
    // I14/DEF6: закрытие страницы — СОБЫТИЕ для сервера (быстрый путь — маячок)
    "window.addEventListener('pagehide',function(){if(closeTimer)clearTimeout(closeTimer);",
    " try{navigator.sendBeacon('/closed',saved?'saved':'unsaved')}catch(e){}});",
    "restoreDraft();",
  ].join('\n');

  const singleDoc = !batch && questions[0] ? questions[0].doc : null;
  const saveBar = batch
    ? '<div class="bar"><div id="status">Кнопка записи — у каждого документа своя; запись закрывает контур, остаток пачки агент поднимет снова (I8).</div></div>'
    : '<div class="bar"><button id="save" type="button" data-doc="' + esc(singleDoc || '') + '">Записать решение</button>' +
      '<div id="status">Ответы уйдут в документ, решение — в ' + DECISIONS_DIR + '/</div></div>';

  return '<!doctype html>\n<html lang="ru"><head><meta charset="utf-8">' +
    '<title>' + PROJECT_NAME + ' · ' + esc(title) + '</title>' +
    '<link rel="icon" href="data:,"><style>' + css + '</style></head><body>' +
    '<header><span class="project">' + PROJECT_NAME + '</span>' + heading + '</header>' + // P9
    '<div id="banner"></div><main>' + main +
    '<div id="rescue"><p class="err">Спасательный круг (I11): запись не прошла — ваш текст ниже, он не потерян.</p>' +
    '<textarea id="rescuetext" rows="8"></textarea>' +
    '<p><button class="ghost" id="copybtn" type="button">Скопировать</button> ' +
    '<button class="ghost" id="retry" type="button">Повторить запись</button></p></div>' +
    '</main>' + saveBar + '<script>' + js + '</script></body></html>';
}

// ── Окно (DEF8: Edge → Chrome → вкладка с честной просьбой) ────────────────────────────────
function openWindow(url) {
  const tryApp = (exe) => spawnSync('cmd.exe',
    ['/c', 'start', '', exe, '--app=' + url, '--window-size=' + WINDOW_SIZE],
    { stdio: 'ignore', timeout: BEEP_DEADLINE_MS }).status === 0;
  if (tryApp('msedge')) return 'edge --app';
  if (tryApp('chrome')) return 'chrome --app';
  spawnSync('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', timeout: BEEP_DEADLINE_MS });
  console.log('Окно-приложение поднять не удалось — открыл обычной вкладкой; закройте её, пожалуйста, сами (DEF8).');
  return 'tab';
}

// ── Замок «один документ — одно окно» (I29) ────────────────────────────────────────────────
const lockPath = (root, key) => resolve(root, DECISIONS_DIR, key.replace(/\.md$/u, '') + '.lock');
function checkLock(root, key) {
  const p = lockPath(root, key);
  if (!existsSync(p)) return null;
  try {
    const lock = JSON.parse(readFileSync(p, 'utf8'));
    process.kill(lock.pid, 0); // жив ли процесс (не убивает)
    return lock;
  } catch { rmSync(p, { force: true }); return null; } // протухший замок — снимаем
}

// ── Сервер: поднять → показать → позвать → ждать → записать → умереть (I8) ─────────────────
export function serveContour(root, { docPath = null, batch = false }, opts = {}) {
  const { open = true, signal = true, timeoutMs = 0, log = console.log } = opts; // I9: дефолт 0 — без таймаута
  return new Promise((resolveP) => {
    const build = () => batch ? buildQueuePage(root, pendingDocs(root)) : buildPage(root, docPath);
    const first = build();
    const lockKey = batch ? '_queue' : basename(docPath);
    const held = checkLock(root, lockKey);
    if (held) {
      log('Уже открыто этим контуром: ' + held.url + ' (pid ' + held.pid + ') — второе окно не поднимаю (I29).');
      resolveP({ outcome: 'already-open', url: held.url, exitCode: EXIT_DECIDED });
      return;
    }
    let outcome = null, beaconTimer = null, lastAlive = Date.now(), strikes = 0;
    const startedAt = Date.now();
    const server = createServer((req, res) => {
      const ok = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(build().html); // I1: всегда свежая сборка из md
      } else if (req.method === 'GET' && req.url === '/alive') {
        lastAlive = Date.now(); strikes = 0;
        if (beaconTimer) { clearTimeout(beaconTimer); beaconTimer = null; } // страница вернулась (T3)
        ok({ ok: true });
      } else if (req.method === 'POST' && req.url === '/decide') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          try { // I10: любой отказ — громкий, с причиной на страницу
            const payload = JSON.parse(body);
            const doc = batch ? payload.doc : relative(root, resolve(root, docPath)).replace(/\\/g, '/');
            const record = recordDecision(root, doc, { answers: payload.answers, comment: payload.comment });
            const nAns = Object.keys(record.answers || {}).length;
            ok({ ok: true, written: doc + ' + decision.json + архив (' + nAns + ' ответ(ов))' });
            outcome = 'decision recorded';
            const rest = batch ? pendingDocs(root).filter((d) => d.unanswered > 0).length : 0;
            log('Исход: решение записано (' + doc + ', ' + nAns + ' ответов, by ' + record.by + ') — завершаю контур (I8).' +
              (rest > 0 ? ' В очереди осталось документов: ' + rest + ' — перезапуск пачки за агентом.' : ''));
            setTimeout(finish, SERVER_DEATH_MS, EXIT_DECIDED); // DEF3: окно успевает закрыться
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, reason: String(e.message || e) }));
            log('ОШИБКА записи решения (страница показала спасательный круг): ' + e.message);
          }
        });
      } else if (req.method === 'POST' && req.url === '/closed') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          ok({ ok: true });
          if (outcome) return; // уже записано — смерть по расписанию DEF3
          if (beaconTimer) clearTimeout(beaconTimer);
          beaconTimer = setTimeout(() => { // T3: ~3 с — вернётся ли страница после перезагрузки
            outcome = 'page closed without an answer';
            log('Исход: страница закрыта без ответа — завершаю контур (I14, быстрый путь маячка).');
            finish(EXIT_CLOSED);
          }, BEACON_RELOAD_GRACE_MS);
        });
      } else { res.writeHead(404); res.end(); }
    });
    // I14/DEF6: тишина-вахта — терпение живо, пока жива страница; два страйка против сна (T5)
    const watch = setInterval(() => {
      if (outcome) return;
      if (Date.now() - lastAlive > SILENCE_THRESHOLD_MS) {
        strikes += 1; // первый страйк — только подозрение; решает второй, тиком позже
        if (strikes >= SILENCE_STRIKES_TO_DIE) {
          outcome = 'page closed without an answer';
          log('Исход: страница молчит дольше порога (' + (SILENCE_THRESHOLD_MS / 60000) + ' мин, два страйка) — завершаю контур (I14, тишина-вахта).');
          finish(EXIT_CLOSED);
        }
      } else strikes = 0;
      if (timeoutMs > 0 && Date.now() - startedAt > timeoutMs) { // DEF5: только автоматизация
        outcome = 'page closed without an answer';
        log('Исход: терпимая ТИШИНА исчерпана (--timeout, только для автоматизации; это не дедлайн на раздумья) — завершаю.');
        finish(EXIT_CLOSED);
      }
    }, SILENCE_TICK_MS);
    const finish = (code) => {
      clearInterval(watch);
      rmSync(lockPath(root, lockKey), { force: true });
      server.close(() => resolveP({ outcome, exitCode: code }));
      setTimeout(() => resolveP({ outcome, exitCode: code }), 1000).unref();
    };
    process.once('SIGINT', () => { // I25: третий исход — прерван человеком
      outcome = 'interrupted by the human';
      log('Исход: прерван человеком (SIGINT).');
      finish(EXIT_INTERRUPTED);
    });
    server.listen(0, '127.0.0.1', () => { // I30: свободный порт, никогда фиксированный
      const url = 'http://127.0.0.1:' + server.address().port + '/';
      mkdirSync(resolve(root, DECISIONS_DIR), { recursive: true });
      writeFileSync(lockPath(root, lockKey), JSON.stringify({ pid: process.pid, url, startedAt: provenance().at }) + '\n', 'utf8');
      log('Страница поднята: ' + url + (batch ? ' (очередь)' : ' (' + first.title + ')'));
      if (open) log('Окно: ' + openWindow(url)); // показ — действие агента (I15)
      if (signal) { // I5: зов — ПОСЛЕ поднявшейся страницы; I32: не блокирует контур
        // Фраза называет тип, имя и ЧИСЛО вопросов без ответа (урок KLAS: человек решает
        // «идти сейчас или после дела» ДО чтения страницы).
        const nWait = first.questions ? first.questions.filter((q) => !q.answered).length : 0;
        const phrase = batch
          ? 'Криник, накопились вопросы КАИФ: документов ' + pendingDocs(root).length +
            ', вопросов без ответа ' + (first.total || 0) + '. Страница открыта.'
          : 'Криник, ' + first.kind + ' «' + first.title + '» ждёт вычитки' +
            (nWait ? ': вопросов без ответа ' + nWait : '') + '. Страница открыта.';
        signalCall(root, phrase, { log });
      }
      serveContour._onUp && serveContour._onUp(url); // хук для QA-прогона
    });
  });
}

// ── Точка входа (T9) ───────────────────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const args = process.argv.slice(2);
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  const docPath = args.find((a) => !a.startsWith('--') && a !== opt('--timeout'));
  const root = process.cwd();
  const opts = {
    open: !args.includes('--no-open'),
    signal: !args.includes('--silent'),
    timeoutMs: Number(opt('--timeout') || 0) * 1000, // I9: дефолт 0 — терпение машины бесконечно
  };
  if (args.includes('--enqueue')) { // I7: очередь — файл состояния; документ остаётся на месте
    if (!docPath) { console.error('usage: node tools/review.mjs --enqueue <документ.md>'); process.exit(1); }
    const items = enqueue(root, docPath);
    console.log('В очереди: ' + items.length + ' поз. — покажется пачкой: node tools/review.mjs --queue');
    process.exit(0);
  }
  if (args.includes('--queue')) { // пачечная страница «Накопилось N» — зов ОДИН раз на пачку (I7)
    const docs = pendingDocs(root);
    if (docs.length === 0) { console.log('Неотвеченных вопросов нет — очередь пуста, страница не нужна.'); process.exit(0); }
    serveContour(root, { batch: true }, opts).then((r) => process.exit(r.exitCode));
  } else if (args.includes('--no-serve')) { // C9: «собрать и выйти» — иначе синхронный вызывающий виснет
    if (!docPath) { console.error('usage: node tools/review.mjs <документ.md> --no-serve'); process.exit(1); }
    const page = buildPage(root, docPath);
    const outDir = resolve(root, TMP_DIR);
    mkdirSync(outDir, { recursive: true });
    const out = join(outDir, basename(docPath).replace(/\.md$/u, '') + '.html');
    writeFileSync(out, page.html, 'utf8');
    console.log('Рендер записан: ' + out);
    console.log('RENDER IS NOT YET A SHOW'); // M8: напоминание в точке соблазна отдать путь
    console.log('Показ — действие: node tools/review.mjs ' + docPath);
    process.exit(0);
  } else if (docPath) {
    serveContour(root, { docPath }, opts).then((r) => process.exit(r.exitCode));
  } else {
    console.error('usage: node tools/review.mjs <документ.md> [--no-serve|--silent|--no-open|--timeout N]\n' +
      '       node tools/review.mjs --queue | --enqueue <документ.md>\n' +
      'Запускать ОТСЛЕЖИВАЕМОЙ фоновой задачей (I31): голый & харнесс не отслеживает — уведомление не придёт.');
    process.exit(1);
  }
}
