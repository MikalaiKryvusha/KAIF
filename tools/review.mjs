#!/usr/bin/env node
// review.mjs — страница вычитки, сервер, окно (фаза K5, plans/48 шаг 2; роль C1 «review»).
// [TESTED: 2026-08-07 · живой пилот + QA-прогон verify-contour]
//
// ⚠️ T7 (ловушка платформы): внутри шаблонных строк этого файла НЕ ДОЛЖНО БЫТЬ обратных
// кавычек — бэктик в теле страницы роняет модуль синтаксической ошибкой В ДРУГОМ месте.
// JS страницы написан одинарными кавычками и конкатенацией; в текстах — только «ёлочки».
//
// Инварианты контракта, живущие здесь:
//   I1  — md источник, HTML производное (страница строится из документа, руками не правится);
//   I5  — сигнал зовётся ПОСЛЕ поднявшейся страницы (цепочка — в review-signal, шаг 3);
//   I8  — записанное решение ЗАВЕРШАЕТ контур: агент узнаёт о событии завершением процесса;
//   I9  — ожидание человека без таймаута (дефолт 0; --timeout N — только автоматизация);
//   I10/I11/I12/I13 — громкий отказ · спасательный круг · черновик в браузере · пульс /alive;
//   I25 — ровно три исхода, все видимы в логе процесса;
//   I26/I27 — отдельное окно --app=, автозакрытие — ПОПЫТКА с честным «закройте меня»;
//   I29/I30 — один документ = одно окно (замок с pid и адресом); свободный порт listen(0);
//   I31 — запускать как ОТСЛЕЖИВАЕМУЮ фоновую задачу (голый & харнесс не отслеживает);
//   M8  — рендер без показа печатает «RENDER IS NOT YET A SHOW» + готовую команду открытия.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { join, resolve, basename, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  PROJECT_NAME, OWNER_NAME, DECISIONS_DIR, normalize, bodyHash, provenance,
  parseMetaBlock, parseQuestions, docStatus, renderMd, recordDecision,
} from './lib/review-core.mjs';

// ── Константы (канонические дефолты DEF; конверт владельца — отступать только его словом) ──
const ALIVE_INTERVAL_MS = 15000;      // DEF4: пульс страница→сервер, конверт 10–60 с
const AUTOCLOSE_DELAY_MS = 2000;      // DEF2: попытка window.close() после записи
const AUTOCLOSE_RESERVE_MS = 2000;    // DEF2: запас на случай отказа закрытия → честная просьба
const SERVER_DEATH_MS = 2500;         // DEF3: смерть сервера после записи (окно успевает уйти)
const BEACON_RELOAD_GRACE_MS = 3000;  // DEF6/T3: ~3 с после маячка — отличить перезагрузку от закрытия
const WINDOW_SIZE = '1100,900';       // DEF8
const EXIT_DECIDED = 0, EXIT_CLOSED = 2, EXIT_INTERRUPTED = 130; // I25: три исхода

// ── Сборка страницы (I1: только из документа) ──────────────────────────────────────────────
export function buildPage(root, docPath) {
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const meta = parseMetaBlock(md);
  const rel = relative(root, resolve(root, docPath)).replace(/\\/g, '/');
  const kind = (meta && meta.kind) ||
    (rel.startsWith('interviews/') ? 'интервью' : rel.startsWith('homeworks/') ? 'домашка' : 'документ');
  const title = (meta && meta.title) || (normalize(md).match(/^#\s+(.+)$/m) || [])[1] || basename(docPath);
  const questions = parseQuestions(md).map((q) => ({
    id: q.id, title: q.title, answered: q.answered,
    options: q.options.map((o) => ({ letter: o.letter, html: renderMd(o.text) })),
    existing: q.answers.filter((a) => a.text).map((a) => a.text),
  }));
  const docHash = bodyHash(md);
  const body = renderMd(md);
  return { html: pageHtml({ kind, title, rel, body, questions, docHash }), questions, docHash, kind, title };
}

function pageHtml({ kind, title, rel, body, questions, docHash }) {
  const qjson = JSON.stringify(questions).replace(/</g, '\\u003c');
  const cfg = JSON.stringify({ docHash, rel, aliveMs: ALIVE_INTERVAL_MS, closeMs: AUTOCLOSE_DELAY_MS, reserveMs: AUTOCLOSE_RESERVE_MS })
    .replace(/</g, '\\u003c');
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
    padding:10px 20px; display:flex; gap:12px; align-items:baseline; z-index:5 }
  header .project { font-weight:700; color:var(--accent) } header .kind { color:var(--muted) }
  main { max-width:900px; margin:0 auto; padding:16px 20px 120px }
  .doc { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:8px 22px; overflow-x:auto }
  .doc pre { background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px; overflow-x:auto }
  .doc code { background:var(--bg); padding:1px 4px; border-radius:4px }
  .doc table { border-collapse:collapse; margin:8px 0 } .doc th,.doc td { border:1px solid var(--line); padding:4px 8px }
  .doc blockquote { border-left:3px solid var(--line); margin:8px 0; padding:2px 12px; color:var(--muted) }
  .qcard { background:var(--card); border:1px solid var(--line); border-left:5px solid var(--wait);
    border-radius:10px; padding:12px 16px; margin:14px 0 } /* P1: полоса состояния 5px */
  .qcard.done { border-left-color:var(--done) }
  .tag { font-size:12px; padding:2px 8px; border-radius:99px; color:#fff } /* P2 */
  .tag.wait { background:var(--wait) } .tag.done { background:var(--done) } .tag.you { background:var(--you) }
  .opt { display:flex; gap:8px; align-items:flex-start; margin:6px 0 }
  textarea, input[type=text] { width:100%; background:var(--bg); color:var(--ink);
    border:1px solid var(--line); border-radius:8px; padding:8px; font:inherit }
  .bar { position:fixed; bottom:0; left:0; right:0; background:var(--card); border-top:1px solid var(--line);
    padding:10px 20px; display:flex; gap:14px; align-items:center }
  button { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:9px 18px;
    font:inherit; cursor:pointer } button:disabled { opacity:.5; cursor:default }
  button.ghost { background:transparent; color:var(--accent); border:1px solid var(--accent) }
  #status { flex:1 } .err { color:var(--danger); font-weight:600 } .okmsg { color:var(--done); font-weight:600 }
  #rescue { display:none; border:2px solid var(--danger); border-radius:10px; padding:12px; margin:14px 0 }
  #banner { display:none; position:sticky; top:46px; background:var(--danger); color:#fff;
    padding:8px 20px; font-weight:600; z-index:6 }`;

  // JS страницы — одинарные кавычки и конкатенация, НИ ОДНОГО бэктика (T7).
  const js = [
    "var CFG=" + cfg + ";var QS=" + qjson + ";",
    "var $=function(s){return document.querySelector(s)};",
    "function status(msg,cls){var s=$('#status');s.textContent=msg;s.className=cls||''}",
    // I12: черновик в браузере — каждое поле в localStorage, восстановление с заметкой
    "var DK='owner-review:'+CFG.rel+':';",
    "function saveDraft(el){try{localStorage.setItem(DK+el.name,el.type==='radio'?(el.checked?el.value:''):el.value)}catch(e){}}",
    "function restoreDraft(){var n=0;var els=document.querySelectorAll('[data-draft]');",
    " for(var i=0;i<els.length;i++){var el=els[i];var v=null;try{v=localStorage.getItem(DK+el.name)}catch(e){}",
    "  if(v===null||v==='')continue;",
    "  if(el.type==='radio'){if(el.value===v&&!el.checked){el.checked=true;n++}}else if(!el.value){el.value=v;n++}}",
    " if(n>0)status('Подхвачен черновик: '+n+' полей(я) восстановлено из браузера','okmsg')}",
    // P3: радио, очищаемое вторым кликом — состояние на mousedown, события label пропускаем
    "document.addEventListener('mousedown',function(e){if(e.target&&e.target.type==='radio')e.target.dataset.was=e.target.checked?'1':'0'},true);",
    "document.addEventListener('click',function(e){var t=e.target;if(!t||t.type!=='radio')return;",
    " if(t.dataset.was==='1'){t.checked=false;saveDraft(t)}else{saveDraft(t)}delete t.dataset.was},true);",
    "document.addEventListener('input',function(e){if(e.target&&e.target.hasAttribute&&e.target.hasAttribute('data-draft'))saveDraft(e.target)});",
    // Сбор ответов
    "function collect(){var answers={};for(var i=0;i<QS.length;i++){var q=QS[i];if(q.answered)continue;",
    " var chosen='';var rs=document.getElementsByName('choice:'+q.id);",
    " for(var j=0;j<rs.length;j++)if(rs[j].checked)chosen=rs[j].value;",
    " var own=($('[name=\"text:'+q.id+'\"]')||{}).value||'';var com=($('[name=\"comment:'+q.id+'\"]')||{}).value||'';",
    " if(chosen||own.trim()||com.trim())answers[q.id]={choice:chosen,text:own.trim(),comment:com.trim()}}",
    " return {answers:answers,comment:($('#doccomment')||{}).value||''}}",
    // I10/I11: громкий отказ + спасательный круг; кнопка снова активна, текст возвращается человеку
    "function rescue(payload,msg){status('ОШИБКА ЗАПИСИ: '+msg,'err');var r=$('#rescue');r.style.display='block';",
    " $('#rescuetext').value=JSON.stringify(payload,null,2);$('#save').disabled=false}",
    "function doSave(){var p=collect();",
    " if(Object.keys(p.answers).length===0&&!p.comment.trim()){status('Нечего записывать: ни ответа, ни комментария','err');return}",
    " $('#save').disabled=true;status('Записываю…');",
    " fetch('/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})",
    " .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})",
    " .then(function(res){if(!res.ok||!res.j.ok){rescue(p,res.j.reason||('HTTP '+res.j.status));return}",
    "  saved=true;status('Записано: '+res.j.written+'. Окно закроется само…','okmsg');",
    "  try{var ks=Object.keys(localStorage);for(var i=0;i<ks.length;i++)if(ks[i].indexOf(DK)===0)localStorage.removeItem(ks[i])}catch(e){}",
    // I27/DEF2: автозакрытие — ПОПЫТКА; отказ → честное «закройте меня»; отменяется pagehide
    "  setTimeout(function(){window.close();closeTimer=setTimeout(function(){",
    "   status('Браузер не дал закрыть окно — закройте его, пожалуйста, сами','err')},CFG.reserveMs)},CFG.closeMs)})",
    " .catch(function(e){rescue(p,String(e))})}",
    "var saved=false,closeTimer=null;",
    "$('#save').addEventListener('click',doSave);",
    "$('#retry').addEventListener('click',doSave);",
    "$('#copybtn').addEventListener('click',function(){var t=$('#rescuetext');t.select();",
    " try{document.execCommand('copy');status('Скопировано в буфер','okmsg')}catch(e){status('Выделите и скопируйте вручную','err')}});",
    // I13/DEF4: пульс страница→сервер — о смерти сервера человек узнаёт СРАЗУ и вслух
    "function pulse(){fetch('/alive').then(function(r){if(!r.ok)throw 0;$('#banner').style.display='none'})",
    " .catch(function(){var b=$('#banner');b.style.display='block';",
    "  b.textContent='СЕРВЕР КОНТУРА НЕДОСТУПЕН — ответ НЕ уйдёт. Черновик сохранён в браузере; скопируйте текст (кнопка ниже) или перезапустите контур.';",
    "  var r=$('#rescue');r.style.display='block';$('#rescuetext').value=JSON.stringify(collect(),null,2);$('#save').disabled=false})}",
    "setInterval(pulse,CFG.aliveMs);",
    // I14/DEF6: закрытие страницы — СОБЫТИЕ для сервера (быстрый путь — маячок)
    "window.addEventListener('pagehide',function(){if(closeTimer)clearTimeout(closeTimer);",
    " try{navigator.sendBeacon('/closed',saved?'saved':'unsaved')}catch(e){}});",
    "restoreDraft();",
  ].join('\n');

  const qcards = questions.map((q) => {
    const tag = q.answered ? '<span class="tag done">answered</span>'
      : '<span class="tag wait">unanswered</span> <span class="tag you">awaits you</span>';
    const opts = q.answered ? '' : q.options.map((o) =>
      '<label class="opt"><input type="radio" data-draft name="choice:' + q.id + '" value="' + o.letter + '">' +
      '<div>' + o.html + '</div></label>').join('');
    const existing = q.existing.map((t) => '<p><strong>Ответ:</strong> ' + t.replace(/</g, '&lt;') + '</p>').join('');
    const inputs = q.answered ? '' :
      '<p><input type="text" data-draft name="text:' + q.id + '" placeholder="Свой вариант / текст ответа (D)"></p>' +
      '<p><textarea data-draft name="comment:' + q.id + '" rows="2" placeholder="Комментарий к вопросу (P7)"></textarea></p>';
    return '<section class="qcard' + (q.answered ? ' done' : '') + '" id="card-' + q.id + '">' +
      '<div><strong>' + q.id + '.</strong> ' + q.title.replace(/</g, '&lt;') + ' ' + tag + '</div>' +
      existing + opts + inputs + '</section>';
  }).join('\n');

  return '<!doctype html>\n<html lang="ru"><head><meta charset="utf-8">' +
    '<title>' + PROJECT_NAME + ' · ' + title.replace(/</g, '&lt;') + '</title>' +
    '<link rel="icon" href="data:,"><style>' + css + '</style></head><body>' +
    '<header><span class="project">' + PROJECT_NAME + '</span>' + // P9: имя проекта в шапке
    '<span class="kind">' + kind + '</span><span>' + title.replace(/</g, '&lt;') + '</span></header>' +
    '<div id="banner"></div><main>' +
    '<div class="doc">' + body + '</div>' +
    '<h2>Вопросы</h2>' + (qcards || '<p>Вопросов в документе нет — можно оставить общий комментарий.</p>') +
    '<div id="rescue"><p class="err">Спасательный круг (I11): запись не прошла — ваш текст ниже, он не потерян.</p>' +
    '<textarea id="rescuetext" rows="8"></textarea>' +
    '<p><button class="ghost" id="copybtn" type="button">Скопировать</button> ' +
    '<button class="ghost" id="retry" type="button">Повторить запись</button></p></div>' +
    '<h2>Комментарий по документу целиком</h2>' + // P7: легитимный исход вычитки сам по себе
    '<p><textarea id="doccomment" data-draft name="doccomment" rows="3" ' +
    'placeholder="Можно без ответов — просто сказать (запишется датированным блоком в конец документа)"></textarea></p>' +
    '</main><div class="bar"><button id="save" type="button">Записать решение</button>' +
    '<div id="status">Ответы уйдут в документ, решение — в ' + DECISIONS_DIR + '/</div></div>' +
    '<script>' + js + '</script></body></html>';
}

// ── Окно (DEF8: Edge → Chrome → вкладка с честной просьбой) ────────────────────────────────
function openWindow(url) {
  const tryApp = (exe) => {
    const r = spawnSync('cmd.exe', ['/c', 'start', '', exe, '--app=' + url, '--window-size=' + WINDOW_SIZE],
      { stdio: 'ignore', timeout: 8000 });
    return r.status === 0;
  };
  if (tryApp('msedge')) return 'edge --app';
  if (tryApp('chrome')) return 'chrome --app';
  spawnSync('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', timeout: 8000 });
  console.log('Окно-приложение поднять не удалось — открыл обычной вкладкой; закройте её, пожалуйста, сами (DEF8).');
  return 'tab';
}

// ── Замок «один документ — одно окно» (I29) ────────────────────────────────────────────────
function lockPath(root, docPath) {
  return resolve(root, DECISIONS_DIR, basename(docPath).replace(/\.md$/u, '') + '.lock');
}
function checkLock(root, docPath) {
  const p = lockPath(root, docPath);
  if (!existsSync(p)) return null;
  try {
    const lock = JSON.parse(readFileSync(p, 'utf8'));
    process.kill(lock.pid, 0); // жив ли процесс (не убивает)
    return lock;
  } catch { rmSync(p, { force: true }); return null; } // протухший замок — снимаем
}

// ── Сервер: поднять → показать → ждать → записать → умереть (I8) ───────────────────────────
export function serveDoc(root, docPath, { open = true, log = console.log } = {}) {
  return new Promise((resolveP) => {
    const page = buildPage(root, docPath);
    const held = checkLock(root, docPath);
    if (held) {
      log('Документ уже открыт этим контуром: ' + held.url + ' (pid ' + held.pid + ') — второе окно не поднимаю (I29).');
      resolveP({ outcome: 'already-open', url: held.url, exitCode: EXIT_DECIDED });
      return;
    }
    let outcome = null, beaconTimer = null, lastAlive = Date.now();
    const server = createServer((req, res) => {
      const ok = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildPage(root, docPath).html); // I1: всегда свежая сборка из md
      } else if (req.method === 'GET' && req.url === '/alive') {
        lastAlive = Date.now();
        if (beaconTimer) { clearTimeout(beaconTimer); beaconTimer = null; } // страница вернулась (T3)
        ok({ ok: true, docHash: page.docHash });
      } else if (req.method === 'POST' && req.url === '/decide') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          try { // I10: любой отказ — громкий, с причиной на страницу
            const payload = JSON.parse(body);
            const record = recordDecision(root, docPath, {
              kind: page.kind, answers: payload.answers, comment: payload.comment,
            });
            const nAns = Object.keys(record.answers || {}).length;
            ok({ ok: true, written: 'md + decision.json + архив (' + nAns + ' ответ(ов))' });
            outcome = 'decision recorded';
            log('Исход: решение записано (' + nAns + ' ответов, by ' + record.by + ') — завершаю контур (I8).');
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
          // T3: перезагрузка тоже шлёт pagehide — ждём, вернётся ли страница
          if (beaconTimer) clearTimeout(beaconTimer);
          beaconTimer = setTimeout(() => {
            outcome = 'page closed without an answer';
            log('Исход: страница закрыта без ответа — завершаю контур (I14, быстрый путь маячка).');
            finish(EXIT_CLOSED);
          }, BEACON_RELOAD_GRACE_MS);
        });
      } else { res.writeHead(404); res.end(); }
    });
    const finish = (code) => {
      rmSync(lockPath(root, docPath), { force: true });
      server.close(() => resolveP({ outcome, exitCode: code, docHash: page.docHash }));
      setTimeout(() => resolveP({ outcome, exitCode: code, docHash: page.docHash }), 1000).unref();
    };
    process.once('SIGINT', () => { // I25: третий исход — прерван человеком
      outcome = 'interrupted by the human';
      log('Исход: прерван человеком (SIGINT).');
      finish(EXIT_INTERRUPTED);
    });
    server.listen(0, '127.0.0.1', () => { // I30: свободный порт, никогда фиксированный
      const url = 'http://127.0.0.1:' + server.address().port + '/';
      mkdirSync(resolve(root, DECISIONS_DIR), { recursive: true });
      writeFileSync(lockPath(root, docPath), JSON.stringify({ pid: process.pid, url, startedAt: provenance().at }) + '\n', 'utf8');
      log('Страница поднята: ' + url + ' (' + page.title + ')');
      if (open) log('Окно: ' + openWindow(url)); // показ — действие агента (I15); сигнал — ПОСЛЕ (I5, шаг 3)
      serveDoc._onUp && serveDoc._onUp(url); // хук для QA-прогона
    });
  });
}

// ── Точка входа (T9) ───────────────────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) {
  const args = process.argv.slice(2);
  const docPath = args.find((a) => !a.startsWith('--'));
  if (!docPath) {
    console.error('usage: node tools/review.mjs <документ.md> [--no-serve] [--no-open]');
    process.exit(1);
  }
  const root = process.cwd();
  if (args.includes('--no-serve')) { // C9: обязательный флаг «собрать и выйти» — иначе QA виснет
    const page = buildPage(root, docPath);
    const outDir = resolve(root, 'tools/.review-tmp');
    mkdirSync(outDir, { recursive: true });
    const out = join(outDir, basename(docPath).replace(/\.md$/u, '') + '.html');
    writeFileSync(out, page.html, 'utf8');
    console.log('Рендер записан: ' + out);
    console.log('RENDER IS NOT YET A SHOW'); // M8: напоминание в точке соблазна отдать путь
    console.log('Показ — действие: node tools/review.mjs ' + docPath);
    process.exit(0);
  }
  serveDoc(root, docPath, { open: !args.includes('--no-open') }).then((r) => process.exit(r.exitCode));
}
