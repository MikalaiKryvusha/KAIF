#!/usr/bin/env node
// tools/guarded-watchdog.mjs — ВНЕШНИЙ сторож защищённого автономного цикла (/guarded-loop, дефер G4).
//
// ЗАЧЕМ. Процесс, исполняющий работу, не может быть единственным судьёй собственного здоровья:
// зависший агент не выполнит свой же self-check. Поэтому пульс пишет АГЕНТ (по факту завершённого
// шага — .kaif/heartbeat.log), а свежесть пульса проверяет ЧУЖОЙ процесс, запускаемый планировщиком
// ОС. Этот файл — тот чужой процесс.
//
// ЧЕСТНАЯ ГРАНИЦА, названная вслух (иначе сторож — театр). Внешний процесс НЕ МОЖЕТ воскресить
// зависший чат агента: у сессии нет внешней ручки «продолжай». Поэтому лестница эскалации здесь
// заканчивается ГРОМКИМ СИГНАЛОМ ВЛАДЕЛЬЦУ, а не рестартом. Всё, что сторож обещает, он делает;
// того, чего он не может, он не обещает.
//
// КОНТРАКТ (каждая строка — из канона навыка /guarded-loop):
//   · single-instance guard  — lock-файл с pid: два сторожа не устраивают двойных тревог;
//   · дебаунс               — тревога только после M протухших проверок ПОДРЯД; M берётся из
//                             ИЗМЕРЕННОГО самого долгого шага проекта, не с потолка;
//   · пульс = работа        — сторож судит ПОСЛЕДНЮЮ СТРОКУ heartbeat, а не mtime файла: mtime
//                             подделывается любым касанием, строка — нет;
//   · потолок эскалации     — N тревог без НОВОЙ строки пульса → финальная тревога и саморазвод;
//   · саморазвод по сроку   — прогон кончился → сторож снимается сам. Сторож, оставленный после
//                             прогона, — мина (канон навыка запрещает его оставлять).
//
// РЕЖИМЫ:
//   --arm --minutes N --debounce M --hours H   взвести (пишет состояние; регистрацию в планировщике
//                                              ОС делает вызывающий — см. AGENT_GUIDE)
//   --check                                    ОДНА проверка; это то, что зовёт планировщик ОС
//   --status                                   что сейчас со сторожем и пульсом
//   --disarm                                   снять взвод
//   --selftest                                 доказать ДВА свойства: краснеет на протухшем пульсе
//                                              И молчит на свежем (EXP-0059 — второй ответ бесплатен)
//
// [TESTED: 2026-08-08 23:40 +03:00 · node tools/guarded-watchdog.mjs --selftest → 9/9 на НАСТОЯЩЕЙ
//  check() против фикстуры (корень подменяется, копии логики нет): молчание на свежем пульсе ·
//  дебаунс держит одиночный пропуск · тревога на протухшем · тревога легла в журнал · свежий mtime
//  не спасает старую строку · потолок эскалации разводит сторожа · после потолка снят · саморазвод
//  по истёкшему сроку · второй экземпляр не берёт замок.
//  ⚠️ Что селфтестом НЕ доказано и проверяется только полевым прогоном: попап действительно виден
//  владельцу (в селфтесте он подавлен --quiet) и планировщик ОС действительно зовёт --check.]

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
// Корень — ПЕРЕМЕННАЯ, а не константа: селфтест подменяет его на фикстуру и гоняет НАСТОЯЩУЮ
// check(), а не её копию. Страж, проверенный копией своей логики, мерит прокси, не свойство
// (класс bugs/55): копия расходится с оригиналом молча, и селфтест остаётся зелёным.
let root = REPO;

// ── Именованные константы: магических значений в инструментах не бывает (AGENT_GUIDE → стиль) ──
const KAIF_DIR = '.kaif';
const HEARTBEAT = 'heartbeat.log';
const STATE = 'watchdog-state.json';
const LOCK = 'watchdog.lock';
const ALERTS = 'watchdog-alert.log';
const POPUP_BODY = 'watchdog-popup.txt';      // текст для попапа: не-ASCII едет ФАЙЛОМ, не argv
const DEFAULT_INTERVAL_MIN = 10;              // дефолт навыка /guarded-loop
const DEFAULT_DEBOUNCE = 3;                   // перекрывается измеренной длительностью шага
const DEFAULT_HOURS = 1;                      // дефолт навыка для голого «защищённый цикл»
const ESCALATION_CAP = 3;                     // тревог без нового пульса → саморазвод
const POPUP_SECONDS = 20;                     // попап сам закрывается: сторож не блокирует машину
const LOCK_STALE_MS = 5 * 60 * 1000;          // lock старше этого — от мёртвого процесса

const p = (name) => path.join(root, KAIF_DIR, name);
const localIso = (d = new Date()) => {
  // Локальное время владельца с явным смещением — канон меток (AGENT_GUIDE → метка несёт И ДАТУ, И ВРЕМЯ).
  // Действует и на КВИТАНЦИИ машинерии: одна конвенция, две записи. UTC-метка рядом с локальными
  // читается вразрез и заставляет читателя считать смещение в голове.
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const pad = (n) => String(Math.abs(n)).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(off / 60 | 0)}:${pad(off % 60)}`;
};
const nowIso = () => localIso();

// ── Пульс: судим ПОСЛЕДНЮЮ СТРОКУ, а не mtime файла ────────────────────────────────────────────
// mtime врёт при любом касании файла; строка несёт метку момента, поставленную самим агентом.
function readPulse(hbPath) {
  if (!fs.existsSync(hbPath)) return null;
  const lines = fs.readFileSync(hbPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return null;
  const last = lines[lines.length - 1];
  const stamp = last.split('|')[0].trim();
  const t = Date.parse(stamp);
  return Number.isNaN(t) ? null : { at: t, line: last, count: lines.length };
}

const readState = () => (fs.existsSync(p(STATE)) ? JSON.parse(fs.readFileSync(p(STATE), 'utf8')) : null);
const writeState = (s) => fs.writeFileSync(p(STATE), JSON.stringify(s, null, 2) + '\n');

// ── single-instance guard ──────────────────────────────────────────────────────────────────────
function takeLock() {
  const lock = p(LOCK);
  if (fs.existsSync(lock)) {
    const age = Date.now() - fs.statSync(lock).mtimeMs;
    if (age < LOCK_STALE_MS) return false;      // живой сосед — второй экземпляр уходит молча
    fs.rmSync(lock, { force: true });           // мёртвый lock: процесс умер, не убрав за собой
  }
  fs.writeFileSync(lock, String(process.pid));
  return true;
}
const releaseLock = () => fs.rmSync(p(LOCK), { force: true });

// ── Тревога: файл + попап владельцу. Не-ASCII в попап едет ФАЙЛОМ (AGENT_GUIDE → текст через файлы) ──
function raiseAlert(state, pulse, reason, quiet) {
  const line = `${nowIso()} | ALERT #${state.alerts + 1} | ${reason} | последний пульс: ${pulse ? pulse.line : 'ПУЛЬСА НЕТ ВООБЩЕ'}`;
  fs.appendFileSync(p(ALERTS), line + '\n');
  if (!quiet && process.platform === 'win32') {
    const body = [
      'KAIF: защищённый цикл потерял пульс.',
      '',
      reason,
      '',
      pulse ? `Последний завершённый шаг: ${pulse.line}` : 'Пульса нет вообще.',
      '',
      'Внешний процесс не может продолжить чат за агента — нужен твой пинок: /kaif-go.',
    ].join('\r\n');
    fs.writeFileSync(p(POPUP_BODY), body, 'utf8');
    try {
      // Читаем текст из UTF-8 файла внутри PowerShell: в argv не уезжает ни один не-ASCII символ.
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        `$t=[IO.File]::ReadAllText('${p(POPUP_BODY).replace(/'/g, "''")}',[Text.Encoding]::UTF8);` +
        `(New-Object -ComObject Wscript.Shell).Popup($t,${POPUP_SECONDS},'KAIF guarded-loop',48)|Out-Null`,
      ], { stdio: 'ignore', timeout: (POPUP_SECONDS + 10) * 1000 });
    } catch { /* попап — сигнал, а не гейт: его падение не должно ронять сторожа */ }
  }
  return line;
}

// ── Одна проверка. Это то, что зовёт планировщик ОС ────────────────────────────────────────────
function check({ quiet = false, repoState = null } = {}) {
  const state = repoState || readState();
  if (!state || !state.armed) return { verdict: 'disarmed' };

  // Саморазвод по сроку: прогон кончился — сторож снимает себя, чтобы не остаться миной.
  if (Date.parse(state.runEndsAt) < Date.now()) {
    state.armed = false;
    state.disarmedAt = nowIso();
    state.disarmedReason = 'срок прогона истёк';
    writeState(state);
    return { verdict: 'disarmed-by-schedule' };
  }

  const pulse = readPulse(p(HEARTBEAT));
  const thresholdMs = state.intervalMin * 60 * 1000;
  const fresh = pulse && Date.now() - pulse.at < thresholdMs;

  if (fresh) {
    // Свежий пульс обнуляет серию — иначе один долгий шаг накопил бы тревогу задним числом.
    state.staleStreak = 0;
    state.lastCheck = nowIso();
    state.lastSeenPulseCount = pulse.count;
    writeState(state);
    return { verdict: 'alive', pulse };
  }

  state.staleStreak = (state.staleStreak || 0) + 1;
  state.lastCheck = nowIso();
  if (state.staleStreak < state.debounce) {
    // Дебаунс: долгая сборка законно молчит пульсом. Порог — из измеренного самого долгого шага.
    writeState(state);
    return { verdict: 'stale-debounced', streak: state.staleStreak, pulse };
  }

  // Потолок эскалации считается по НОВЫМ строкам пульса: тревоги без продвижения — crash-шторм.
  const progressed = pulse && pulse.count !== state.lastAlertPulseCount;
  if (!progressed && state.alerts >= ESCALATION_CAP) {
    const line = raiseAlert(state, pulse, `потолок эскалации: ${ESCALATION_CAP} тревоги без нового пульса — сторож снимается`, quiet);
    state.armed = false;
    state.disarmedAt = nowIso();
    state.disarmedReason = 'потолок эскалации';
    writeState(state);
    return { verdict: 'escalation-cap', line };
  }

  const line = raiseAlert(state, pulse, `пульс протух: ${state.staleStreak} проверки подряд без завершённого шага (порог ${state.intervalMin} мин)`, quiet);
  state.alerts = (state.alerts || 0) + 1;
  state.lastAlertPulseCount = pulse ? pulse.count : 0;
  state.staleStreak = 0;                        // серия перезапускается: следующая тревога — за новую тишину
  writeState(state);
  return { verdict: 'alert', line };
}

// ── Взвод / развод / статус ────────────────────────────────────────────────────────────────────
function arm(argv) {
  const num = (flag, dflt) => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : dflt;
  };
  const intervalMin = num('--minutes', DEFAULT_INTERVAL_MIN);
  const debounce = num('--debounce', DEFAULT_DEBOUNCE);
  const hours = num('--hours', DEFAULT_HOURS);
  const state = {
    armed: true,
    armedAt: nowIso(),
    intervalMin,
    debounce,
    runEndsAt: localIso(new Date(Date.now() + hours * 3600 * 1000)),
    staleStreak: 0,
    alerts: 0,
    lastAlertPulseCount: 0,
    note: 'Сторож НЕ перезапускает чат агента (внешней ручки у сессии нет) — он зовёт владельца.',
  };
  writeState(state);
  console.log(`✅ сторож взведён: проверка каждые ${intervalMin} мин · дебаунс ${debounce} (тревога после ${intervalMin * debounce} мин тишины) · прогон до ${state.runEndsAt}`);
  console.log(`   пульс: ${KAIF_DIR}/${HEARTBEAT} · тревоги: ${KAIF_DIR}/${ALERTS}`);
  console.log(`   планировщик ОС должен звать: node tools/guarded-watchdog.mjs --check`);
}

function status() {
  const s = readState();
  const pulse = readPulse(p(HEARTBEAT));
  if (!s) return console.log('сторож никогда не взводился');
  const ageMin = pulse ? Math.round((Date.now() - pulse.at) / 60000) : null;
  console.log(`сторож: ${s.armed ? 'ВЗВЕДЁН' : 'снят'}${s.disarmedReason ? ` (${s.disarmedReason})` : ''} · проверка ${s.intervalMin} мин · дебаунс ${s.debounce} · до ${s.runEndsAt}`);
  console.log(`тревог: ${s.alerts || 0} · серия тишины: ${s.staleStreak || 0}`);
  console.log(pulse ? `пульс: ${ageMin} мин назад · ${pulse.line}` : 'пульса нет');
}

function disarm() {
  const s = readState() || {};
  s.armed = false;
  s.disarmedAt = nowIso();
  s.disarmedReason = s.disarmedReason || 'снят вручную';
  writeState(s);
  releaseLock();
  console.log('✅ сторож снят');
}

// ── Селфтест: доказываем ОБА свойства — краснеет на дефекте И молчит на «не трогать» (EXP-0059) ──
function selftest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kaif-watchdog-'));
  const kd = path.join(tmp, KAIF_DIR);
  fs.mkdirSync(kd, { recursive: true });
  const hb = path.join(kd, HEARTBEAT);
  const stamp = (msAgo) => {
    const d = new Date(Date.now() - msAgo);
    const off = -d.getTimezoneOffset();
    const pad = (n) => String(Math.abs(n)).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off >= 0 ? '+' : '-'}${pad(off / 60 | 0)}:${pad(off % 60)}`;
  };

  // Селфтест работает на ФИКСТУРЕ в своём temp-корне: настоящий пульс прогона не трогается
  // (правило «документ, по которому поднята страница, не трогать» — тот же класс: не мутируй
  // живое состояние ради доказательства, мутируй копию).
  const results = [];

  const t = (name, got, want) => {
    const ok = got === want;
    results.push({ name, ok, got, want });
    console.log(`${ok ? '✅' : '❌'} ${name}: ${got}${ok ? '' : ` (ждали ${want})`}`);
  };

  // Корень подменён на фикстуру → дальше зовём НАСТОЯЩИЕ check()/readState()/writeState().
  const realRoot = root;
  root = tmp;
  const armFixture = (over = {}) => {
    writeState({
      armed: true, armedAt: nowIso(), intervalMin: 10, debounce: 3,
      runEndsAt: localIso(new Date(Date.now() + 3600 * 1000)),
      staleStreak: 0, alerts: 0, lastAlertPulseCount: 0, ...over,
    });
  };
  // Тревоги в селфтесте БЕЗ попапа: доказываем логику, а не дёргаем владельца шестью окнами.
  const probe = () => check({ quiet: true }).verdict;

  // 1. Пульс свежий → сторож МОЛЧИТ. Это второй вопрос мутационной проверки, который почти никто
  //    не задаёт (EXP-0059): страж обязан не только краснеть на дефекте, но и молчать на норме.
  fs.writeFileSync(hb, `${stamp(2 * 60000)} | свежий шаг | done | next: y\n`);
  armFixture();
  t('молчание на свежем пульсе', probe(), 'alive');

  // 2. Пульс протух ОДИН раз → дебаунс держит: долгая сборка законно молчит пульсом.
  fs.writeFileSync(hb, `${stamp(12 * 60000)} | давний шаг | done | next: z\n`);
  armFixture();
  t('дебаунс держит одиночный пропуск', probe(), 'stale-debounced');

  // 3. Дебаунс исчерпан → тревога, и она РЕАЛЬНО легла в журнал тревог.
  armFixture({ staleStreak: 2 });
  t('тревога на протухшем пульсе', probe(), 'alert');
  t('тревога записана в журнал', fs.existsSync(p(ALERTS)) && /ALERT #1/.test(fs.readFileSync(p(ALERTS), 'utf8')) ? 'да' : 'нет', 'да');

  // 4. Свежий mtime НЕ спасает старую строку: файл только что записан, а работа стоит час.
  //    Именно этим пульс = работа отличается от пульса = таймер (судья охотится на второй).
  fs.writeFileSync(hb, `${stamp(90 * 60000)} | час назад | done | next: q\n`);
  armFixture({ staleStreak: 2 });
  t('свежий mtime не спасает старую строку', probe(), 'alert');

  // 5. Потолок эскалации: тревоги без НОВОЙ строки пульса разводят сторожа, а не длятся вечно.
  armFixture({ staleStreak: 2, alerts: ESCALATION_CAP, lastAlertPulseCount: 1 });
  t('потолок эскалации разводит сторожа', probe(), 'escalation-cap');
  t('после потолка сторож снят', readState().armed === false ? 'снят' : 'взведён', 'снят');

  // 6. Саморазвод по сроку: прогон кончился — сторож снимает себя, чтобы не остаться миной.
  armFixture({ runEndsAt: localIso(new Date(Date.now() - 1000)) });
  t('саморазвод по истёкшему сроку', probe(), 'disarmed-by-schedule');

  // 7. single-instance guard: пока жив lock соседа, второй экземпляр не берёт замок.
  fs.writeFileSync(p(LOCK), '99999');
  t('второй экземпляр не берёт замок', takeLock() ? 'взял' : 'не взял', 'не взял');
  fs.rmSync(p(LOCK), { force: true });

  root = realRoot;
  fs.rmSync(tmp, { recursive: true, force: true });
  const bad = results.filter((r) => !r.ok).length;
  console.log(bad ? `\n❌ selftest FAILED — ${bad} из ${results.length}` : `\n✅ selftest OK — ${results.length}/${results.length}`);
  process.exit(bad ? 1 : 0);
}

// ── Точка входа ───────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
fs.mkdirSync(path.join(root, KAIF_DIR), { recursive: true });

if (argv.includes('--selftest')) selftest();
else if (argv.includes('--arm')) arm(argv);
else if (argv.includes('--disarm')) disarm();
else if (argv.includes('--status')) status();
else if (argv.includes('--check')) {
  if (!takeLock()) process.exit(0);             // сосед уже проверяет — тихо уходим
  try {
    const r = check({ quiet: argv.includes('--quiet') });
    console.log(`${nowIso()} | ${r.verdict}${r.streak ? ` streak=${r.streak}` : ''}`);
  } finally { releaseLock(); }
} else {
  console.log('usage: node tools/guarded-watchdog.mjs --arm [--minutes N] [--debounce M] [--hours H] | --check | --status | --disarm | --selftest');
}
