#!/usr/bin/env node
// tools/canon-inventory.mjs — ИНВЕНТАРЬ ОБЯЗАТЕЛЬСТВ канон-документа, его РАЗНОСТЬ между двумя версиями и МЕТР ГОЛОСА
// (2.8, эпик CK, шаги CK2 и CK3.1 `plans/118`; критерий 1 `plans/117`: «инвентарь ПОСЛЕ равен инвентарю ДО — или каждое снятое
// обязательство названо строкой с новым адресом»; метод — `researches/33` §6 и §8).
//
// ЗАЧЕМ. Шаблон руководства агента худеет с 1200 строк: свидетельства о рождении правил уезжают, правила остаются. Сжатие без
// инвентаря теряет обязательства молча, и полевой замер (#93 §2.3) показал, КАК: команды и номера уцелели все, а оговорка
// вокруг команды пропала у 19 из ≈ 480 обязательств — «The mechanical inventory was green while these were missing». Поэтому
// ключ обязательства здесь — ВЕСЬ пункт (нормализованный текст), а не команда внутри него. А сжатый без метра текст становится
// телеграфом (#93 R6) — поэтому та же разность меряет и средний колон.
//
// ЧТО СЧИТАЕТСЯ ОБЯЗАТЕЛЬСТВОМ (форма обязательства по канону — команда · шаг · чекбокс, `AGENT_GUIDE.md` → «Форма
// обязательства»; проза только объясняет):
//   step      — пункт нумерованного списка (в том числе внутри огороженного блока — чек-лист «перед каждой задачей»);
//   bullet    — пункт маркированного списка; checkbox — пункт с `[ ]` / `[x]`;
//   row       — строка таблицы (кроме разделителя `|---|`);
//   code      — строка огороженного блока вне списка (копируемая строка: команда, слот `<BUILD_COMMAND>`, строка блока
//               `@guard`); комментарий `#`/`//` и строка схемы или примера со стрелками обязательством не считаются;
//   sentence  — предложение прозы (и цитат-блока `>`, и HTML-комментария), в котором есть модальное слово (must · should ·
//               never · always · only · every · обязан · должен · нужно · следует · только · кажд… — словарь MODAL_RE), клетка
//               ☑/☐, команда в код-спане, или которое НАЧИНАЕТСЯ с повелительного глагола из словаря IMPERATIVE.
// Продолжение пункта (строки с отступом под ним) — часть пункта. Предложение прозы без всего этого обязательством не считается:
// его удаление — законный вынос обоснования, ради которого эпик и существует.
//
// ИСХОДЫ РАЗНОСТИ (старый пункт → новая версия):
//   kept      — тот же текст под тем же заголовком того же файла (перенумерация пунктов не меняет ключа);
//   moved     — тот же текст под другим заголовком или в другом файле ПРОВЕРЯЕМОГО набора (адрес печатается);
//   moved-out — тот же текст нашёлся только в файле ВНЕ набора (`--with`): правило ушло из канона — ОТКАЗ, пока не объявлено
//               (так ловится правило, уехавшее в информативный раздел «почему» пояснительной записки);
//   changed   — текст иной, но пункт узнаётся: сходство слов ≥ SIM_CHANGED с пунктом набора, либо в наборе есть НЕЗАНЯТЫЙ пункт,
//               несущий все его команды («clause at risk» — класс #93); НЕ отказ, а список на смысловой аудит (CK3) — печатается
//               участок, где тексты расходятся, целиком;
//   declared  — снятие объявлено строкой реестра `--declared <файл>`: `- «<начало текста пункта>» → <новый адрес или причина>`;
//   lost      — ничего из этого: обязательство пропало молча → код 1.
//   new       — пункт новой версии без пары в старой (печатается счётом).
// МЕТР ГОЛОСА — средний колон (отрезок между , ; : — ( ) и концом предложения, `AUTHOR_STYLOMETRY.md` С2) по прозе и пунктам;
// в `--diff` файл, чей колон упал ниже METER_FLOOR × своей базы, — отказ (телеграф, #93 R6).
//
// Команды:
//   node tools/canon-inventory.mjs --list [--ref <ref>] [файл…]              — счёт обязательств по видам (--verbose — пункты)
//   node tools/canon-inventory.mjs --meter [--ref <ref>] [файл…]             — метр голоса: колонов · средний · медиана
//   node tools/canon-inventory.mjs --diff <ref> [файл…] [--with <файл>]… [--declared <файл>] [--verbose]
//        старая версия — `git show <ref>:<файл>`, новая — рабочее дерево; --with — файлы ВНЕ набора, где ищется переезд
//   node tools/canon-inventory.mjs --old <путь> --new <путь> [--with <путь>]… [--declared <файл>]   — явные файлы (мутанты)
//   node tools/canon-inventory.mjs --selftest                                 — все исходы на фикстурах в памяти
// Файлы по умолчанию — два шаблона поставки и две корневые русские копии: framework/AGENT_GUIDE.md ·
// framework/TESTING_FRAMEWORK.md · AGENT_GUIDE.md · TESTING_FRAMEWORK.md.
// Коды: 0 — lost 0, moved-out 0, метр в пороге · 1 — иначе · 2 — ошибка вызова. Окон и звука не поднимает.
//
// @guard canon-inventory
// THREAT:         сжатие канона молча теряет обязательство — чаще всего оговорку вокруг уцелевшей команды (#93: 4 % при зелёном
//                 механическом счёте) — или уводит правило в информативный текст, и шаблон уезжает полю с дырой
// PROVED-AGAINST: копия шаблона `framework/AGENT_GUIDE.md` тега v2.7, мутанты `tools/sandbox/probes/canon-inventory-mutants.mjs`
//                 (удалён шаг · переезд · переименованный заголовок · срезанная оговорка у `git mv` · пункт без команды · правило
//                 удалено целиком, а его команда живёт в другом месте · правило перенесено в файл вне набора · телеграф) и
//                 селфтест; первая редакция отдавала «правило удалено целиком» как changed с кодом 0 — найдено судьёй CK2;
//                 замер уязвимости той же пробы (каждый пункт v2.7 удалён по одному): копия с веткой первой редакции — 119 из 774
//                 удалений мимо `lost`, инструмент — 0 из 774 (≈ 2026-09-24 21:45 +03:00)
// GAP:            обязательство прозой без модального слова, без команды и не с повелительного глагола не видно по построению —
//                 судья CK2 насчитал ≈ 19 % таких на выборке 330 строк ДО расширения словарей; остаток после расширения закрывает
//                 только смысловой аудит, читающий оба текста целиком (CK3.3); сходство слов — эвристика (число, изменённое
//                 внутри правила, приходит changed, а не kept, — и печатается участок расхождения)
// ON-REAL-PATH:   2026-09-24 — CK3 (`--diff v2.7` после сжатия шаблонов, testcases/reports/2026-09-24_ck3-guide-slice.md) и каждый срез
//                 канона с тех пор (исправлено 2026-09-26 06:01 +03:00 по суду RL1, A-F4: стояло «NOT YET»)
//
// [TESTED: 2026-09-24 — Гигиена: селфтест и мутанты на копии v2.7 (отчёт testcases/reports/2026-09-24_ck2-canon-inventory.md);
//                Функциональный прогон: `--diff v2.7` по сжатому шаблону в CK3 (testcases/reports/2026-09-24_ck3-guide-slice.md)]
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DEFAULT_FILES = ['framework/AGENT_GUIDE.md', 'framework/TESTING_FRAMEWORK.md', 'AGENT_GUIDE.md', 'TESTING_FRAMEWORK.md'];
const SIM_CHANGED = 0.5;       // сходство слов (Жаккар), с которого переписанный пункт узнаётся как changed, а не lost
const MIN_TOKEN = 3;           // слова короче в сходство не идут (предлоги, артикли, союзы) — кроме чисел и отрицаний
const CONTEXT = 40;            // знаков контекста вокруг участка расхождения в печати changed
const RAW_SHOWN = 150;         // сколько знаков исходного пункта печатать в списках lost / moved / new
const LEDGER_MIN_PREFIX = 12;  // короче начало в реестре снятий не принимается — иначе одна строка «объявит» полфайла
const METER_FLOOR = 0.9;       // `plans/118` CK3.1 `[ИИ]`: средний колон после сжатия — не ниже 0,9 базы (#93 R6: телеграф 3,52 при базе 4,24)

// Модальные слова — признак обязательства в прозе. Слева и справа не буква: \b в JS не видит кириллицу.
const W = (alts) => `(?<![\\p{L}\\p{N}])(?:${alts})(?![\\p{L}\\p{N}])`;
const MODAL_RE = new RegExp([
  W("must|shall|should|never|always|only|every|each|required|requires?|needs? to|has to|have to|mandatory|forbidden|do not|don't|is not allowed|may not"),
  W('обязан\\p{L}*|обязательн\\p{L}*|должн\\p{L}*|никогда|всегда|запрещ\\p{L}*|нельзя|не допуска\\p{L}*|нужно|надо|следует|только|кажд\\p{L}*'),
  '[☑☐]',
].join('|'), 'iu');
// Предложение, которое НАЧИНАЕТСЯ с повелительного глагола, — правило формы «делай X» (план CK2), даже без модального слова.
const IMPERATIVE = new Set(('read re-read run write keep put name record commit stop update use check verify grep open start finish ask say cite quote ' +
  'prove mark add remove move file copy walk derive design execute land plan prefer treat fix refresh load narrate comment reflect capture ' +
  'edit answer show leave take give make set test count compare name close raise reply print pass wait call bring find search look report ' +
  'прочитай перечитай запусти пиши напиши держи назови запиши закоммить коммить остановись обнови используй проверь грепни открой начни ' +
  'заверши спроси скажи цитируй процитируй докажи отметь добавь убери перенеси заведи скопируй пройди выведи исполни положи планируй ' +
  'предпочитай считай почини освежи загрузи рассказывай комментируй фиксируй правь ответь покажи оставь возьми дай сделай поставь ' +
  'тестируй сверь сверься сними веди ищи найди подними закрой называй пометь стереги').split(/\s+/));
// Код-спан, похожий на команду: исполнимая строка или вызов навыка.
const COMMAND_RE = /^(?:node|npm|npx|git|gh|grep|cp|mv|rm|date|wc|ls|cat|sed|curl|mkdir|export|pwsh|powershell|LC_ALL=\S+)(?:\s|$)|^\/[a-z][\w-]*/;
const DIAGRAM_RE = /[←↑↓→⇒─│┌┐└┘├┤┬┴┼═║]/;  // строка схемы или примера в огороженном блоке — рисунок, а не копируемая строка
const LIST_RE = /^(\s*)(?:(\d+)\.|[-*+])\s+(\[[ xX]\]\s+)?(.*)$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const TABLE_SEP_RE = /^\|?\s*:?-{3,}/;
// Сокращения, после точки которых предложение не кончается («e.g.», «т. е.»): точка заменяется на время разбора.
const ABBREV_RE = /(?<![\p{L}])(e\.g|i\.e|etc|vs|cf|т\.\s?е|т\.\s?д|т\.\s?п|т\.\s?к|напр|см|ср|др)\./giu;
const DOT = '․';           // ONE DOT LEADER — временная замена точки сокращения, возвращается после разбора

// Нормализация ключа: разметка выделения, кавычки и тире разных видов, регистр и хвостовая пунктуация ключа не меняют.
export function norm(s) {
  return s.replace(/<!--|-->/g, ' ').replace(/\*\*|__/g, '').replace(/`/g, '').split(DOT).join('.')
    .replace(/[«»“”„"]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ').trim().toLowerCase().replace(/[\s.;:,]+$/, '');
}
const normHeading = (h) => norm(h.replace(/^#+\s*/, '').replace(/^\d+(?:\.\d+)*\.?\s+/, ''));
const commandsOf = (raw) => [...raw.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()).filter((c) => COMMAND_RE.test(c)).map(norm);
const NEGATION = new Set(['no', 'not', 'nor', 'never', 'не', 'ни', 'нет']);
const tokens = (text) => new Set(text.split(/[^\p{L}\p{N}_\-./]+/u).filter((t) => t.length >= MIN_TOKEN || /^\d+$/.test(t) || NEGATION.has(t)));
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}
function startsImperative(s) {
  const first = s.replace(/^[^\p{L}]+/u, '').split(/[^\p{L}'-]+/u)[0];
  return Boolean(first) && IMPERATIVE.has(first.toLowerCase());
}
const isObligationSentence = (s) => MODAL_RE.test(s) || commandsOf(s).length > 0 || startsImperative(s);

// Разбор документа в список обязательств. Один проход по строкам; пункт копит продолжения, абзац прозы — строки до пустой.
export function inventory(text, file) {
  const units = [];
  let heading = '(top)';
  let item = null;          // открытый пункт списка: { kind, raw, line }
  let para = null;          // открытый абзац прозы: { parts: [{ text, line }] }
  let fence = false;
  const push = (kind, raw, line) => {
    const t = norm(raw);
    if (t) units.push({ file, heading, kind, text: t, raw: raw.split(DOT).join('.').replace(/\s+/g, ' ').trim(), commands: commandsOf(raw), line });
  };
  const closeItem = () => { if (item) push(item.kind, item.raw, item.line); item = null; };
  const closePara = () => {
    if (!para) return;
    // Склеиваем строки абзаца, помня, с какого знака начинается каждая, — адрес предложения есть его собственная строка.
    let joined = '';
    const starts = [];
    for (const p of para.parts) { starts.push({ at: joined.length ? joined.length + 1 : 0, line: p.line }); joined = joined ? joined + ' ' + p.text : p.text; }
    const protectedText = joined.replace(ABBREV_RE, (m) => m.slice(0, -1) + DOT);
    let offset = 0;
    // Конец предложения — точка, за которой может стоять закрывающее выделение или скобка («…OWNER.** Three steps»).
    for (const s of protectedText.split(/(?<=[.!?…][*_»")\]]*)\s+(?=[\p{Lu}«"(`*\[])/u)) {
      const at = protectedText.indexOf(s, offset);
      offset = at + s.length;
      const line = starts.filter((x) => x.at <= at).pop().line;
      if (isObligationSentence(s)) push('sentence', s, line);
    }
    para = null;
  };
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const n = i + 1;
    let line = lines[i];
    if (/^\s*```/.test(line)) { closeItem(); closePara(); fence = !fence; continue; }
    const quoted = /^\s*>/.test(line);
    if (quoted) line = line.replace(/^\s*(?:>\s?)+/, '');
    if (!line.trim()) { closeItem(); closePara(); continue; }
    const h = !fence && !quoted && line.match(HEADING_RE);
    if (h) { closeItem(); closePara(); heading = normHeading(h[2]); continue; }
    const li = line.match(LIST_RE);
    if (li) {
      closeItem(); closePara();
      item = { kind: li[3] ? 'checkbox' : li[2] ? 'step' : 'bullet', raw: li[4], line: n };
      continue;
    }
    if (item && (/^\s/.test(lines[i]) || fence || quoted)) {  // продолжение пункта: отступ, строка блока или цитаты под ним
      item.raw += ' ' + line.trim();
      continue;
    }
    closeItem();
    // В блоке обязательство — копируемая строка; комментарий и схема со стрелками — не оно.
    if (fence) { if (!/^\s*(?:#|\/\/)/.test(line) && !DIAGRAM_RE.test(line)) push('code', line, n); continue; }
    if (/^\s*\|/.test(line)) { closePara(); if (!TABLE_SEP_RE.test(line.trim().replace(/^\|\s*/, '|'))) push('row', line, n); continue; }
    if (para) para.parts.push({ text: line.trim(), line: n }); else para = { parts: [{ text: line.trim(), line: n }] };
  }
  closeItem(); closePara();
  return units;
}

// Метр голоса: колон — отрезок между двумя ближайшими разделителями (, ; : — – ( ) и конец предложения), в словах. Строки
// одного абзаца или пункта склеиваются: колон не кончается на переносе строки. Блоки, таблицы, заголовки, комментарии и
// код-спаны — не проза.
export function meter(text) {
  const blocks = [];
  let cur = null, fence = false;
  const flush = () => { if (cur) blocks.push(cur); cur = null; };
  for (let line of text.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { flush(); fence = !fence; continue; }
    if (fence) continue;
    line = line.replace(/^\s*(?:>\s?)+/, '');
    if (!line.trim() || /^\s*\|/.test(line) || /^\s*#{1,6}\s/.test(line) || /^\s*<!--/.test(line)) { flush(); continue; }
    const li = line.match(LIST_RE);
    if (li) { flush(); cur = li[4]; continue; }
    cur = cur ? cur + ' ' + line.trim() : line.trim();
  }
  flush();
  const lens = [];
  for (const b of blocks) {
    const prose = b.replace(/`[^`]*`/g, ' ').replace(/\*\*|__/g, '').replace(ABBREV_RE, (m) => m.slice(0, -1));
    for (const piece of prose.split(/[,;:—–()]|[.!?…](?=\s|$)/u)) {
      const k = (piece.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length;
      if (k) lens.push(k);
    }
  }
  lens.sort((a, b) => a - b);
  return { colons: lens.length, mean: lens.reduce((s, x) => s + x, 0) / (lens.length || 1), median: lens.length ? lens[Math.floor(lens.length / 2)] : 0 };
}

// Реестр объявленных снятий: `- «<начало текста пункта>» → <новый адрес или причина>`.
export function parseLedger(text) {
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*«([^»]+)»\s*→\s*(.+)$/);
    if (m && norm(m[1]).length >= LEDGER_MIN_PREFIX) out.push({ prefix: norm(m[1]), to: m[2].trim() });
  }
  return out;
}

const addr = (u) => `${u.file}:${u.line} § ${u.heading}`;

// Разность: каждому старому пункту — ровно один исход; новые пункты набора без пары считаются отдельно.
// newUnits — пункты набора (inSet: true) и файлов вне набора (inSet: false, только для поиска переезда).
export function diff(oldUnits, newUnits, ledger = []) {
  const res = { kept: [], moved: [], movedOut: [], changed: [], declared: [], lost: [], added: [] };
  const used = new Set();
  const byText = new Map();
  newUnits.forEach((u, i) => { if (!byText.has(u.text)) byText.set(u.text, []); byText.get(u.text).push(i); });
  const rank = (o, u) => (u.inSet ? 0 : 4) + (u.file === o.file ? 0 : 2) + (u.heading === o.heading ? 0 : 1);
  const pending = [];
  for (const o of oldUnits) {
    const cands = (byText.get(o.text) || []).filter((i) => !used.has(i) && newUnits[i].inSet);
    if (cands.length) {
      const best = cands.sort((a, b) => rank(o, newUnits[a]) - rank(o, newUnits[b]) || a - b)[0];
      used.add(best);
      (rank(o, newUnits[best]) === 0 ? res.kept : res.moved).push({ old: o, now: newUnits[best] });
      continue;
    }
    pending.push(o);
  }
  for (const o of pending) {
    const decl = ledger.find((d) => o.text.startsWith(d.prefix));
    if (decl) { res.declared.push({ old: o, to: decl.to }); continue; }
    const out = (byText.get(o.text) || []).find((i) => !newUnits[i].inSet);
    if (out !== undefined) { res.movedOut.push({ old: o, now: newUnits[out] }); continue; }
    const ot = tokens(o.text);
    let best = -1, bestSim = 0;
    newUnits.forEach((u, i) => {
      if (used.has(i) || !u.inSet) return;
      const s = jaccard(ot, tokens(u.text));
      if (s > bestSim) { bestSim = s; best = i; }
    });
    if (best >= 0 && bestSim >= SIM_CHANGED) {
      used.add(best);
      res.changed.push({ old: o, now: newUnits[best], why: `similarity ${bestSim.toFixed(2)}` });
      continue;
    }
    // «Clause at risk» (класс #93): только если в наборе есть НЕЗАНЯТЫЙ пункт, несущий ВСЕ команды старого. Команда, живущая в
    // уже сохранённом пункте, ничего не говорит о судьбе удалённого правила — такое правило пропало (находка судьи CK2).
    const k = o.commands.length ? newUnits.findIndex((u, i) => !used.has(i) && u.inSet && o.commands.every((c) => u.commands.includes(c))) : -1;
    if (k >= 0) { used.add(k); res.changed.push({ old: o, now: newUnits[k], why: 'clause at risk — every command survived, the item text did not' }); continue; }
    res.lost.push({ old: o });
  }
  newUnits.forEach((u, i) => { if (!used.has(i) && u.inSet) res.added.push(u); });
  return res;
}

// Участок расхождения двух строк: общий префикс и суффикс срезаются, середина печатается целиком (с контекстом).
export function divergence(a, b) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  // контекст ДО участка · ⟦участок⟧ · контекст ПОСЛЕ — середина печатается ровно один раз
  const cut = (x) => `${p > CONTEXT ? '…' : ''}${x.slice(Math.max(0, p - CONTEXT), p)}⟦${x.slice(p, x.length - s)}⟧${x.slice(x.length - s, x.length - s + CONTEXT)}${s > CONTEXT ? '…' : ''}`;
  return { was: cut(a), now: cut(b) };
}

function countByKind(units) {
  const c = {};
  for (const u of units) c[u.kind] = (c[u.kind] || 0) + 1;
  return Object.entries(c).sort().map(([k, v]) => `${k} ${v}`).join(' · ');
}

function printDiff(res, verbose) {
  const line = (label, list, f) => { if (list.length) { console.log(`\n${label} ${list.length}:`); for (const x of list) console.log('  ' + f(x)); } };
  line('LOST', res.lost, (x) => `${addr(x.old)} — «${x.old.raw.slice(0, RAW_SHOWN)}»`);
  line('MOVED OUT OF THE CANON SET (declare or restore)', res.movedOut, (x) => `${addr(x.old)} → ${addr(x.now)}`);
  line('CHANGED (to the semantic audit)', res.changed, (x) => {
    const d = divergence(x.old.raw, x.now.raw);
    return `${addr(x.old)} → ${addr(x.now)} · ${x.why}\n      was: ${d.was}\n      now: ${d.now}`;
  });
  line('MOVED', res.moved, (x) => `${addr(x.old)} → ${addr(x.now)}`);
  line('DECLARED', res.declared, (x) => `${addr(x.old)} → ${x.to}`);
  if (verbose) line('NEW', res.added, (u) => `${addr(u)} — «${u.raw.slice(0, RAW_SHOWN)}»`);
  console.log(`\nkept ${res.kept.length} · moved ${res.moved.length} · changed ${res.changed.length} · declared ${res.declared.length} · moved-out ${res.movedOut.length} · lost ${res.lost.length} · new ${res.added.length}`);
}

function selftest() {
  const base = [
    '# Guide', '', '## Before every task', '', '1. Read STATUS.md', '2. Run the build: `node tools/build-framework.mjs` before a commit', '   and read its last line.',
    '- [ ] Stamp the refresh marker', '', 'Prose that explains why the rule exists, born from ticket #1.', '',
    'The agent must commit the original verbatim first.', 'Update the status after every significant task.', '', '## Router', '', '| Task | Read |', '|---|---|', '| Bug | BUG_FIXING_FRAMEWORK.md |', '',
    '```', 'node tools/commit.mjs --msg-file <path>', 'a.md → b.md', '```', '', '## Tail', '', '- Keep the prose clear and concrete in every document of the canon.',
    '- Rename a closed file only with `git mv` so the history survives.',
    '', 'A rule sentence, e.g. this one, must not split at the abbreviation.', '', 'Run `git mv` when you rename a closed file.',
    '', '**A bold rule must end here.** Keep the next sentence its own unit.',
    'Cadence is the owner\'s setting: ☑ full text before every task · ☐ once per session.',
  ].join('\n');
  const inv = inventory(base, 'g.md');
  const set = (text, file = 'g.md') => inventory(text, file).map((u) => ({ ...u, inSet: true }));
  const cases = [];
  const run = (name, mutate, expect, ledgerText = '', extraOut = '') => {
    const lines = base.split('\n');
    const now = set(mutate(lines).join('\n'));
    if (extraOut) now.push(...inventory(extraOut, 'ref.md').map((u) => ({ ...u, inSet: false })));
    const r = diff(inv, now, parseLedger(ledgerText));
    const got = { lost: r.lost.length, moved: r.moved.length, changed: r.changed.length, declared: r.declared.length, movedOut: r.movedOut.length, added: r.added.length };
    const ok = Object.entries(expect).every(([k, v]) => got[k] === v);
    cases.push(ok);
    console.log(`${ok ? '✅' : '✖'} ${name} — ${JSON.stringify(got)}${ok ? '' : ` expected ${JSON.stringify(expect)}`}`);
  };
  // 2 шага · 1 чекбокс · 7 предложений (must · update — повелительный · e.g.-правило · run `git mv` · ☑/☐ · жирное правило с
  // точкой внутри выделения · следующее за ним «Keep…» — ОТДЕЛЬНО) · 2 строки таблицы · 1 команда блока (строка-пример со стрелкой —
  // не она) · 2 пункта списка = 15; объясняющая проза — не обязательство
  const kinds = countByKind(inv);
  const invOk = inv.length === 15 && /bullet 2/.test(kinds) && /step 2/.test(kinds) && /checkbox 1/.test(kinds) && /row 2/.test(kinds)
    && /code 1/.test(kinds) && /sentence 7/.test(kinds) && inv.some((u) => u.text.includes('e.g. this one, must not split'))
    && inv.some((u) => u.text === 'a bold rule must end here') && inv.some((u) => u.text === 'keep the next sentence its own unit');
  cases.push(invOk);
  console.log(`${invOk ? '✅' : '✖'} inventory — ${inv.length} obligation(s): ${kinds}; «e.g.» does not split a sentence; the explaining prose is not one`);
  const lineOk = inv.find((u) => u.text.startsWith('update the status')).line === 13;
  cases.push(lineOk);
  console.log(`${lineOk ? '✅' : '✖'} a sentence is addressed by its own line, not by its paragraph's first`);
  run('identical text', (l) => l, { lost: 0, moved: 0, changed: 0, added: 0 });
  run('renumbered steps only', (l) => l.map((x) => x.replace(/^1\. /, '3. ').replace(/^2\. /, '4. ')), { lost: 0, changed: 0, moved: 0 });
  run('explaining prose removed', (l) => l.filter((x) => !x.startsWith('Prose that')), { lost: 0, changed: 0 });
  run('a step deleted', (l) => l.filter((x) => !x.startsWith('1. Read')), { lost: 1 });
  run('a rule moved under another heading', (l) => { const i = l.findIndex((x) => x.startsWith('- Keep')); const [m] = l.splice(i, 1); l.splice(l.indexOf('## Router') + 1, 0, '', m); return l; }, { lost: 0, moved: 1 });
  run('command survived, clause lost (#93)', (l) => l.map((x) => (x.startsWith('2. Run') ? '2. `node tools/build-framework.mjs`' : x)).filter((x) => !x.startsWith('   and read')), { lost: 0, changed: 1, added: 0 });
  // Находка судьи CK2: команда живёт в УЖЕ СОХРАНЁННОМ пункте — это не «оговорка срезана», а правило пропало.
  run('a rule deleted whole, its command lives in a kept rule', (l) => l.filter((x) => !x.startsWith('Run `git mv`')), { lost: 1, changed: 0 });
  // А команда в НОВОМ, короче переписанном пункте — законный класс #93: на аудит, не отказ.
  run('a rule rewritten shorter around the same command', (l) => l.map((x) => (x.startsWith('Run `git mv`') ? '`git mv` it.' : x)), { lost: 0, changed: 1, added: 0 });
  run('a rule reworded a little', (l) => l.map((x) => (x.startsWith('- Keep') ? '- Keep the prose clear and concrete in each document of the canon.' : x)), { lost: 0, changed: 1 });
  run('a MUST sentence removed', (l) => l.filter((x) => !x.startsWith('The agent must')), { lost: 1 });
  run('an imperative sentence removed', (l) => l.filter((x) => !x.startsWith('Update the status')), { lost: 1 });
  run('a table row removed', (l) => l.filter((x) => !x.startsWith('| Bug')), { lost: 1 });
  run('a fenced command removed', (l) => l.filter((x) => !x.startsWith('node tools/commit')), { lost: 1 });
  run('a rule moved OUT of the canon set', (l) => l.filter((x) => !x.startsWith('- Keep')), { lost: 0, movedOut: 1 }, '', '- Keep the prose clear and concrete in every document of the canon.');
  run('a move out of the set, declared', (l) => l.filter((x) => !x.startsWith('- Keep')), { lost: 0, movedOut: 0, declared: 1 }, '- «Keep the prose clear and concrete» → the reference, on purpose', '- Keep the prose clear and concrete in every document of the canon.');
  run('a removal declared in the ledger', (l) => l.filter((x) => !x.startsWith('1. Read')), { lost: 0, declared: 1 }, '- «Read STATUS.md» → HOUSE_RULES.md § Reading order');
  run('a too-short ledger prefix is ignored', (l) => l.filter((x) => !x.startsWith('1. Read')), { lost: 1, declared: 0 }, '- «Read» → anywhere');
  const d = divergence('a'.repeat(200) + ' within 60 minutes ' + 'b'.repeat(50), 'a'.repeat(200) + ' within 90 minutes ' + 'b'.repeat(50));
  // точная форма: 40 знаков контекста, участок ОДИН раз, 40 знаков после (первая редакция печатала середину дважды)
  const divOk = d.was === `…${'a'.repeat(32)} within ⟦6⟧0 minutes ${'b'.repeat(30)}…` && d.now.includes('⟦9⟧') && d.was.split('within').length === 2;
  cases.push(divOk);
  console.log(`${divOk ? '✅' : '✖'} a change past character 150 is printed at the place it happened (${d.was.slice(-40)})`);
  const m1 = meter('One two three four five, six seven eight nine ten.\n\n- Short, list, item.');
  const meterOk = m1.colons === 5 && Math.abs(m1.mean - 2.6) < 1e-9 && m1.median === 1;
  cases.push(meterOk);
  console.log(`${meterOk ? '✅' : '✖'} meter — ${m1.colons} colon(s), mean ${m1.mean} (5 · 5 · 1 · 1 · 1 words; a list item is its own block)`);
  const failed = cases.filter((x) => !x).length;
  console.log(failed ? `\n✖ selftest: ${failed} of ${cases.length} case(s) failed` : `\n✅ selftest: ${cases.length} of ${cases.length} green`);
  process.exit(failed ? 1 : 0);
}

// ---------------------------------------------------------------- CLI (только при запуске файлом — модуль можно импортировать)
function gitShow(ref, file) {
  try { return execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
}
const readTree = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : null);

function main() {
  const argv = process.argv.slice(2);
  const flag = (name) => argv.includes(name);
  const values = (name) => argv.flatMap((a, i) => (a === name && argv[i + 1] ? [argv[i + 1]] : []));
  const VALUE_FLAGS = new Set(['--ref', '--diff', '--with', '--declared', '--old', '--new']);
  const positional = argv.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.has(argv[i - 1]));
  const die = (msg) => { console.error('✖ ' + msg); process.exit(2); };

  if (flag('--selftest')) selftest();
  const ledgerPath = values('--declared')[0];
  const ledger = ledgerPath ? (existsSync(ledgerPath) ? parseLedger(readFileSync(ledgerPath, 'utf8')) : die(`no ledger file ${ledgerPath}`)) : [];
  const ref = values('--ref')[0];
  const fileSet = positional.length ? positional : DEFAULT_FILES;

  if (flag('--list') || flag('--meter')) {
    for (const f of fileSet) {
      const t = ref ? gitShow(ref, f) : readTree(f);
      if (t === null) { console.log(`${f}: absent${ref ? ` at ${ref}` : ''}`); continue; }
      if (flag('--meter')) { const m = meter(t); console.log(`${f}${ref ? ` @ ${ref}` : ''}: colons ${m.colons} · mean ${m.mean.toFixed(2)} · median ${m.median}`); continue; }
      const u = inventory(t, f);
      console.log(`${f}${ref ? ` @ ${ref}` : ''}: obligations ${u.length} — ${countByKind(u)}`);
      if (flag('--verbose')) for (const x of u) console.log(`  ${x.line} [${x.kind}] § ${x.heading} — «${x.raw.slice(0, RAW_SHOWN)}»`);
    }
    process.exit(0);
  }

  const oldUnits = [], newUnits = [];
  const meterFails = [];
  const judgeMeter = (label, oldText, newText) => {
    const a = meter(oldText), b = meter(newText);
    const low = a.mean > 0 && b.mean < METER_FLOOR * a.mean;
    if (low) meterFails.push(label);
    console.log(`  voice meter: mean colon ${a.mean.toFixed(2)} → ${b.mean.toFixed(2)}${low ? ` ✖ below ${METER_FLOOR} of the base — telegraphese (#93 R6)` : ''}`);
  };
  if (values('--diff').length) {
    const base = values('--diff')[0];
    for (const f of fileSet) {
      const o = gitShow(base, f), n = readTree(f);
      const ou = o === null ? [] : inventory(o, f), nu = n === null ? [] : inventory(n, f);
      console.log(`${f}: obligations ${o === null ? `absent at ${base}` : ou.length} → ${n === null ? 'absent in the tree' : nu.length}${o !== null && n !== null ? ` · lines ${o.split('\n').length - 1} → ${n.split('\n').length - 1}` : ''}`);
      if (o !== null && n !== null) judgeMeter(f, o, n);
      oldUnits.push(...ou); newUnits.push(...nu.map((u) => ({ ...u, inSet: true })));
    }
  } else if (values('--old').length && values('--new').length) {
    const [o] = values('--old');
    const ot = readTree(o) ?? die(`no file ${o}`);
    oldUnits.push(...inventory(ot, o));
    // Явный режим: старый и новый файл — ОДИН документ под разными путями, поэтому новый получает имя старого (иначе каждый
    // пункт вышел бы «переехавшим в другой файл»); дальнейшие --new — другие файлы НАБОРА.
    values('--new').forEach((p, i) => { const t = readTree(p) ?? die(`no file ${p}`); newUnits.push(...inventory(t, i === 0 ? o : p).map((u) => ({ ...u, inSet: true }))); if (i === 0) judgeMeter(o, ot, t); });
    console.log(`${o}: obligations ${oldUnits.length} → ${newUnits.length} (with ${values('--new').length} new file(s) in the set)`);
  } else {
    die('usage: --list|--meter [--ref <ref>] [file…] | --diff <ref> [file…] [--with <file>]… [--declared <file>] | --old <path> --new <path>… [--with <file>]… | --selftest');
  }
  for (const w of values('--with')) { const t = readTree(w); if (t === null) die(`no file ${w}`); newUnits.push(...inventory(t, w).map((u) => ({ ...u, inSet: false }))); }
  const res = diff(oldUnits, newUnits, ledger);
  printDiff(res, flag('--verbose'));
  if (meterFails.length) console.log(`✖ voice meter below the floor: ${meterFails.join(' · ')}`);
  process.exit(res.lost.length || res.movedOut.length || meterFails.length ? 1 : 0);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
