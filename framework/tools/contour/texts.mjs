#!/usr/bin/env node
// texts.mjs — the LOCALIZED DATA of the shipped interactive contour (KAIF 2.6, epic IC; plans/93 IC3).
// [TESTED: 2026-09-05 · `review.mjs --selftest`: RU/EN dictionaries resolve, an unknown language falls back to EN and
//  is announced; s22 on a ru deployment: page lang=ru, button «Записать решение», chip «рекомендую», queue line
//  «НИ РАЗУ НЕ ПОКАЗАН»; check-framework guard 5d green with this file named as a data carrier]
//
// This file is a DATA CARRIER: every string an owner reads on the page or hears in the call, every
// label the parser must recognise in the owner's documents (answer labels, comment labels, status
// words, option letters), and the month names of the human-readable provenance — for each language
// the contour ships. Nothing here executes; the generator (`review.mjs`) and its core (`core.mjs`)
// stay free of any non-Latin script, so the payload guard (check-framework 5d) keeps judging them
// as machinery and excuses THIS file by name as data (like kaif-scenario-lint's RU keywords).
//
// Language is READ from the deployment marker (`.kaif/kaif.json` → `language`, owner rule #97:
// parameters are never asked); a language without a dictionary here falls back to English, which
// the page then says out loud in its header so the owner knows why the texts are not theirs.
//
// Adding a language = adding one object below with the same keys as `en`; `texts()` fills any
// missing key from `en`, so a partial dictionary never breaks the page — it only mixes languages.

// ── Parser vocabulary — what the owner's documents may say (both scripts, all languages) ─────────
// The parser reads a project's living documents. Labels are recognised in BOTH the shipped
// languages at once (a project may hold RU interviews and EN homework side by side), so these are
// alternations, not per-language switches. Unicode letter classes, never \b (JS \b is ASCII-only).
export const PARSER = {
  // option letters in list form `- **A)** …` and table form `| **A** | … |`
  letters: 'A-ZА-Я',
  // question heading prefixes: `### Q1.` (EN) · `### В1.` (RU)
  questionPrefixes: 'Q|В',
  // the answer field label: `**Answer:**` · `**Ответ:**` · `**Ответ владельца:**`
  answerLabels: 'Answer|Ответ(?:\\s+владельца)?',
  // a counter-question is NOT an answer (contract C4 rule 2)
  counterQuestion: 'встречн\\p{L}*\\s+вопрос|counter-?question',
  // an owner's comment under an empty answer is NOT the answer text (pilot 008)
  commentLabels: 'Комментарий\\s+владельца|Owner\'?s\\s+comment',
  // where the answer goes back to (may list several addressees, one per line)
  targetLabels: 'Адресат\\s+ответа|Answer\\s+target|Addressee',
  // the agent's recommendation in prose — its letter is shown ON the option as a chip
  recommendLabels: 'Рекомендация\\s+агента|Agent\'?s?\\s+recommendation',
  // status line of the document head (`> Status:` / `> **Статус:**`)
  statusLabels: 'Status|Статус',
  statusClosed: '✅|🟢|STATUS:\\s*DONE|ANSWERS\\s+RECEIVED|ОТВЕЧЕНО',
  statusWaiting: '🟡|awaiting|ждёт\\s+ответ|ожидает\\s+ответ',
  // negation outranks the tick (bugs/70): «пока НЕ отвечено», "no answers yet", "not answered"
  statusNegation: '(?<!\\p{L})не\\s*отвечен|неотвечен|(?<!\\p{L})пока\\s+не(?!\\p{L})|(?<!\\p{L})ещё\\s+не(?!\\p{L})|\\bno\\b[^.]{0,40}\\byet\\b|\\bnot\\b[^.]{0,40}\\banswer',
  // the declared free field of a question with no options (naming / taste questions)
  freeFieldMarker: '<!--\\s*(?:questions-guard:no-scenario|contour:free-field)\\s+\\S',
  // the owner row of the identity table in AGENT_GUIDE.md — default for `contour.ownerName`
  identityOwnerLabels: 'Author\\s*/\\s*owner|Автор\\s*/\\s*владелец',
  // headings of the questions section, dropped from the prose render (cards are the only form)
  questionsSectionHeadings: 'QUESTIONS|Вопросы',
};

// ── Owner-facing dictionaries ────────────────────────────────────────────────────────────────
const EN = {
  lang: 'en',
  months: ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'],
  // written back into the source md (the next session reads it; the parser recognises both scripts)
  wb: {
    followUp: (atHuman) => 'Answer (follow-up, ' + atHuman + '):',
    ownerComment: (atHuman) => "Owner's comment (" + atHuman + '):',
    proofread: (atHuman) => "Owner's proofreading comments (" + atHuman + '):',
  },
  kind: { interview: 'interview', homework: 'homework', document: 'document', notice: 'notice',
    queue: 'queue', proofread: 'proofreading', mockup: 'mockup review' },
  tag: { answered: 'answered', unanswered: 'no answer', you: 'waits for you', allAnswered: 'all answered',
    answeredN: (n) => 'answered ' + n, waitN: (n) => 'waiting for you ' + n, rec: 'recommended',
    noAnswerNote: 'no answer owed', noBody: 'no body', outbound: 'outbound' },
  head: { questions: 'Questions', noQuestions: 'The document has no questions — you can leave a comment on the whole.',
    outbound: 'Outbound — your decision is needed', docComment: 'Comment on the document as a whole',
    optComment: 'Comment (optional)', paragraphs: 'Paragraphs — a comment field under each',
    mockup: 'Mockup — your comments', noticeGroup: 'Notices — no answer owed',
    accumulated: 'Accumulated', queueEmpty: 'The queue is empty — nothing to answer.',
    noPending: 'No unanswered questions — the document waits by status.',
    langFallback: (lang) => 'texts in English — no dictionary for "' + lang + '" ships yet' },
  count: { docs: (n) => n + ' document(s)', questions: (n) => n + ' unanswered question(s)',
    notices: (n) => n + ' unread notice(s)', pendingQ: (n) => n + ' question(s) without an answer',
    waitsByStatus: 'waits by status', unread: 'unread', open: 'open →' },
  ph: { own: 'Your own option or the answer text', comment: 'Comment', addComment: 'Add a comment — your answer stays as it is',
    docComment: 'You may leave no answers — just say it', noticeComment: (btn) => 'You may write nothing — the "' + btn + '" mark is enough',
    paragraph: 'Comment on this paragraph', mockup: 'What to change on the mockup',
    artComment: 'What to fix (when rejecting — by meaning, or the agent will not know what to change)' },
  btn: { save: 'Save decision', saveDoc: 'Save decisions for this document', read: 'OK, read', done: 'Done',
    copy: 'Copy', retry: 'Retry saving', approve: '<strong>Approve</strong> — send as is',
    reject: '<strong>Reject</strong> — do not send' },
  art: { goesOut: 'Goes out', missing: (file) => 'File <code>' + file + '</code> not found — nothing to approve. This is a defect, not your choice.',
    bytes: 'bytes' },
  st: { draft: (n) => 'Draft picked up: ' + n + ' field(s) restored from the browser', saving: 'Saving…',
    saved: (w) => 'Saved: ' + w + '. The window will close by itself…', nothing: 'Nothing to save: no answer, no comment',
    needArt: 'A decision on the outbound is needed: approve or reject', err: (m) => 'SAVE ERROR: ' + m,
    serverGone: 'THE CONTOUR SERVER IS UNREACHABLE — the answer will NOT be sent. The draft is kept in the browser; copy the text (button below) or restart the contour.',
    closeYourself: 'The browser refused to close the window — please close it yourself',
    copied: 'Copied to the clipboard', copyManually: 'Select and copy by hand',
    rescue: 'Saving failed — your text is below, it is not lost.', noticeHint: 'Without the mark the notice comes back.',
    selfcheck: (r, q) => 'PAGE SELF-CHECK FAILED: ' + r + ' radio group(s) for ' + q + ' question(s) — the form is broken, do not answer here; tell the agent.' },
  // the call — the human decides "go now or after" BEFORE reading the page, so it names class and numbers
  call: {
    notice: (o, p, title) => o + ', a ' + p + ' notice: "' + title + '" — no answer owed, just read it. The page is open.',
    batch: (o, p, parts) => o + ', accumulated in ' + p + ': ' + parts.join(', ') + '. The page is open.',
    interview: (o, p, kind, title, nWait) => o + ', ' + p + ' ' + kind + ' "' + title + '" awaits your review' +
      (nWait ? ': questions without an answer ' + nWait : '') + '. The page is open.',
    proofread: (o, p, title) => o + ', ' + p + ' asks for proofreading: "' + title + '". The page is open.',
    mockup: (o, p, title) => o + ', ' + p + ' asks you to look at a mockup: "' + title + '". The page is open.',
    parts: { docs: (n) => 'documents ' + n, questions: (n) => 'questions without an answer ' + n, notices: (n) => 'unread notices ' + n },
  },
  // the queue without a browser (`--queue --list`) — read by the agent, quoted by the rituals
  list: { waits: (d) => 'waiting ' + d + ' d', shown: (date, ago, t) => 'shown: ' + date + ' — ' + ago + ' d ago (' + t + ')',
    never: 'NEVER SHOWN — the owner does not know this question exists', empty: "The owner's queue is empty — no waiting documents.",
    gate: (n) => 'GATE (I42): never shown — ' + n + '. Printing the queue is not delivering the question; showing is the agent\'s action.',
    how: (cmd) => 'Raise it as a page: ' + cmd + ' --queue · asked it pointedly in chat — record the fact: ' + cmd + ' --mark-shown <doc> --transport chat',
    dead: 'A dead document with nothing to show → close it by status and it leaves the queue.' },
  transport: { page: 'page', batch: 'batch', chat: 'chat' },
};

const RU = {
  lang: 'ru',
  months: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  wb: {
    followUp: (atHuman) => 'Answer (дополнение, ' + atHuman + '):',
    ownerComment: (atHuman) => 'Комментарий владельца (' + atHuman + '):',
    proofread: (atHuman) => 'Замечания владельца по вычитке (' + atHuman + '):',
  },
  kind: { interview: 'интервью', homework: 'домашка', document: 'документ', notice: 'сообщение',
    queue: 'очередь', proofread: 'вычитка', mockup: 'отсмотр макета' },
  tag: { answered: 'отвечено', unanswered: 'без ответа', you: 'ждёт вас', allAnswered: 'все отвечены',
    answeredN: (n) => 'отвечено ' + n, waitN: (n) => 'ждут вас ' + n, rec: 'рекомендую',
    noAnswerNote: 'ответа не ждёт', noBody: 'тела нет', outbound: 'исходящее' },
  head: { questions: 'Вопросы', noQuestions: 'Вопросов в документе нет — можно оставить общий комментарий.',
    outbound: 'Исходящее — нужно ваше решение', docComment: 'Комментарий по документу целиком',
    optComment: 'Комментарий (по желанию)', paragraphs: 'Абзацы — поле замечания под каждым',
    mockup: 'Макет — ваши замечания', noticeGroup: 'Сообщения — ответа не ждут',
    accumulated: 'Накопилось', queueEmpty: 'Очередь пуста — отвечать нечего.',
    noPending: 'Неотвеченных вопросов нет — документ ждёт статусом.',
    langFallback: (lang) => 'тексты по-английски — словаря для «' + lang + '» в поставке пока нет' },
  count: { docs: (n) => n + ' документ(ов)', questions: (n) => n + ' неотвеченных вопрос(ов)',
    notices: (n) => n + ' непрочитанных сообщени(й)', pendingQ: (n) => n + ' вопрос(ов) без ответа',
    waitsByStatus: 'ждёт статусом', unread: 'не прочитано', open: 'открыть →' },
  ph: { own: 'Свой вариант или текст ответа', comment: 'Комментарий', addComment: 'Дополнить комментарием — ваш ответ останется как есть',
    docComment: 'Можно без ответов — просто сказать', noticeComment: (btn) => 'Можно ничего не писать — достаточно пометки «' + btn + '»',
    paragraph: 'Замечание к этому абзацу', mockup: 'Что поправить на макете',
    artComment: 'Что поправить (при отклонении — обязательно по смыслу, иначе агент не знает, что менять)' },
  btn: { save: 'Записать решение', saveDoc: 'Записать решения по этому документу', read: 'ОК, прочитано', done: 'Готово',
    copy: 'Скопировать', retry: 'Повторить запись', approve: '<strong>Одобряю</strong> — отправить как есть',
    reject: '<strong>Отклоняю</strong> — не отправлять' },
  art: { goesOut: 'Уйдёт наружу', missing: (file) => 'Файл <code>' + file + '</code> не найден — одобрять нечего. Это дефект, а не ваш выбор.',
    bytes: 'байт' },
  st: { draft: (n) => 'Подхвачен черновик: ' + n + ' полей(я) восстановлено из браузера', saving: 'Записываю…',
    saved: (w) => 'Записано: ' + w + '. Окно закроется само…', nothing: 'Нечего записывать: ни ответа, ни комментария',
    needArt: 'Нужно решение по исходящему: одобряю или отклоняю', err: (m) => 'ОШИБКА ЗАПИСИ: ' + m,
    serverGone: 'СЕРВЕР КОНТУРА НЕДОСТУПЕН — ответ НЕ уйдёт. Черновик сохранён в браузере; скопируйте текст (кнопка ниже) или перезапустите контур.',
    closeYourself: 'Браузер не дал закрыть окно — закройте его, пожалуйста, сами',
    copied: 'Скопировано в буфер', copyManually: 'Выделите и скопируйте вручную',
    rescue: 'Запись не прошла — ваш текст ниже, он не потерян.', noticeHint: 'Без пометки сообщение придёт снова.',
    selfcheck: (r, q) => 'САМОПРОВЕРКА СТРАНИЦЫ НЕ ПРОШЛА: радиогрупп ' + r + ' на ' + q + ' вопрос(ов) — форма сломана, здесь не отвечайте; скажите агенту.' },
  call: {
    notice: (o, p, title) => o + ', сообщение ' + p + ': «' + title + '» — ответа не ждёт, только прочитать. Страница открыта.',
    batch: (o, p, parts) => o + ', накопилось в ' + p + ': ' + parts.join(', ') + '. Страница открыта.',
    interview: (o, p, kind, title, nWait) => o + ', ' + kind + ' ' + p + ' «' + title + '» ждёт вычитки' +
      (nWait ? ': вопросов без ответа ' + nWait : '') + '. Страница открыта.',
    proofread: (o, p, title) => o + ', ' + p + ' просит вычитку: «' + title + '». Страница открыта.',
    mockup: (o, p, title) => o + ', ' + p + ' просит отсмотреть макет: «' + title + '». Страница открыта.',
    parts: { docs: (n) => 'документов ' + n, questions: (n) => 'вопросов без ответа ' + n, notices: (n) => 'сообщений непрочитанных ' + n },
  },
  list: { waits: (d) => 'ждёт ' + d + ' дн.', shown: (date, ago, t) => 'показан: ' + date + ' — ' + ago + ' дн. назад (' + t + ')',
    never: 'НИ РАЗУ НЕ ПОКАЗАН — владелец не знает, что этот вопрос существует', empty: 'Очередь владельца пуста — ждущих документов нет.',
    gate: (n) => 'ГЕЙТ (I42): ни разу не показанных — ' + n + '. Напечатать очередь ≠ донести вопрос; показ — действие агента.',
    how: (cmd) => 'Подними страницей: ' + cmd + ' --queue · задал точечно в чате — запиши факт: ' + cmd + ' --mark-shown <док> --transport чат',
    dead: 'Документ мёртв и показывать нечего → закрой его статусом, и он уйдёт из очереди.' },
  transport: { page: 'страница', batch: 'пачка', chat: 'чат' },
};

const DICTS = { en: EN, ru: RU };
export const SHIPPED_LANGUAGES = Object.keys(DICTS);

/** Deep-fill `partial` from `base` so a partial dictionary never leaves a hole on the page. */
function fill(base, partial) {
  const out = {};
  for (const k of Object.keys(base)) {
    const b = base[k], p = partial ? partial[k] : undefined;
    out[k] = (b && typeof b === 'object' && !Array.isArray(b) && typeof b !== 'function')
      ? fill(b, p) : (p === undefined ? b : p);
  }
  return out;
}

/**
 * The dictionary for a deployment language. Unknown language → English, with `fallbackFrom` set
 * so the page can say so in its header (an honest degradation, never a silent one — I36 spirit).
 */
export function texts(language) {
  const lang = String(language || 'en').toLowerCase().slice(0, 2);
  if (DICTS[lang]) return { ...fill(EN, DICTS[lang]), fallbackFrom: null };
  return { ...fill(EN, EN), fallbackFrom: lang };
}
