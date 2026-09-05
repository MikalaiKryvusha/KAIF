#!/usr/bin/env node
// core.mjs — the CORE of the shipped interactive contour (KAIF 2.6, epic IC; plans/93 IC3).
// [TESTED: 2026-09-05 · `review.mjs --selftest` 45 checks green (parse rules, pre-flight red on #051 / green on
//  list · table · declared free field · answered, records in three places, follow-up never overwrites); pre-flight over
//  the origin's live corpus (27 interviews + homework) — 0 red; polygon `all 22 suites green` (s12 + s22)]
//
// A generalisation of the origin's contour core (tools/lib/review-core.mjs, 534 lines, field-proven
// since 2.2) — the same functions, minus the origin's constants: every project parameter is READ at
// runtime from `.kaif/kaif.json` (owner rule #97 — a mechanic ships only complete, it never asks the
// owner for its parameters). Zero dependencies. One library for BOTH sides (the page and any
// sending gate): "four faces — one hash", `checkApproval` is one for all.
//
// Contract lines living here (the long form is the /owner-reviews skill; the one-page executable
// contract is .kaif/INTERACTIVE_CONTOUR_SPEC.md):
//   C3  — normalize: BOM → CRLF/CR to LF → trailing blanks cut → exactly one final newline;
//         hash = sha256(normalize). Four faces of one text give ONE hash.
//   C4  — five parsing rules of a living text (a `---` rule closes the block · a counter-question is
//         not an answer · an option is multi-line · closedness is the document STATUS · \p{L} with u).
//   C6/I2 — the answer is written to THREE places with derived names; the owner's answer is
//         untouchable — new text only as a dated follow-up; a whole-document comment — a dated block.
//   C7/I4 — checkApproval: refuses on any doubt, never throws; the gate is fail-closed.
//   I6  — quiet hours with a window ACROSS midnight.
//   I22/I23 — provenance in two forms (ISO for the machine · local time in words for the human).
//   I24 — the renderer strips HTML comments OUTSIDE code blocks (inside fenced they are content).
//   P8  — markdown mini-renderer, zero dependencies, escaping is the FIRST action.
//   §2 of the spec — PRE-FLIGHT: a question with no options in list/table form and no declared free
//         field must not open (the #51 defect: options typed as paragraphs → a page without radios).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { PARSER, texts } from './texts.mjs';

// ── Defaults (named, never magic) ─────────────────────────────────────────────────────────────
export const DEFAULT_DECISIONS_DIR = 'interviews/decisions';   // canon of /owner-reviews
export const DEFAULT_OWNER = 'owner';                           // when no identity row is found
export const DEFAULT_LANGUAGE = 'en';
export const KAIF_JSON = '.kaif/kaif.json';
export const AGENT_GUIDE = 'AGENT_GUIDE.md';
export const MIN_OPTIONS = 2;                                   // spec §2: fewer = not a fork
const HEAD_LINES = 30;                                          // the document head the status line lives in
const ARCHIVE_SUBDIR = 'archive';

const stripBom = (s) => String(s).replace(/^﻿/, '');
const readJson = (p) => { try { return JSON.parse(stripBom(readFileSync(p, 'utf8'))); } catch { return null; } };

// ── Configuration — read, derived, never asked (#97) ──────────────────────────────────────────
/**
 * Owner name from the identity table of AGENT_GUIDE.md: the row whose first cell is the owner label
 * (both scripts). The cell is cleaned of bold marks; a "·"-separated list keeps its first entry.
 */
export function ownerFromIdentityTable(root) {
  const p = resolve(root, AGENT_GUIDE);
  if (!existsSync(p)) return null;
  const re = new RegExp('^\\|\\s*\\*{0,2}(?:' + PARSER.identityOwnerLabels + ')\\*{0,2}\\s*\\|\\s*([^|]+)\\|', 'imu');
  const m = stripBom(readFileSync(p, 'utf8')).match(re);
  if (!m) return null;
  const cell = m[1].replace(/\*\*/g, '').replace(/`/g, '').split(' · ')[0].trim();
  return cell && !/^<[A-Z_]+>$/.test(cell) ? cell : null; // an unfilled `<AUTHOR>` placeholder is not a name
}

/**
 * The contour configuration of a project root. Every field has a derived default; `.kaif/kaif.json`
 * may override any of them under `contour: { … }`. Nothing here asks a human.
 */
export function loadContourConfig(root) {
  const marker = readJson(resolve(root, KAIF_JSON)) || {};
  const c = (marker.contour && typeof marker.contour === 'object') ? marker.contour : {};
  const language = String(c.language || marker.language || DEFAULT_LANGUAGE).toLowerCase().slice(0, 2);
  const projectName = String(c.projectName || marker.projectName || basename(resolve(root))).trim();
  const ownerName = String(c.ownerName || ownerFromIdentityTable(root) || DEFAULT_OWNER).trim();
  const decisionsDir = String(c.decisionsDir || DEFAULT_DECISIONS_DIR).replace(/\\/g, '/').replace(/\/+$/, '');
  return {
    root: resolve(root), language, projectName, ownerName,
    callName: String(c.callName || ownerName).trim(),        // how the voice addresses the owner
    decisionsDir, archiveDir: decisionsDir + '/' + ARCHIVE_SUBDIR,
    quietFrom: c.quietFrom || null, quietTo: c.quietTo || null, // I6: none by default
    markerFound: existsSync(resolve(root, KAIF_JSON)),
  };
}

// ── C3: normalisation and hash — one function for both sides ──────────────────────────────────
export function normalize(s) {
  return stripBom(s)
    .replace(/\r\n?/g, '\n')       // CRLF and lone CR → LF
    .replace(/[ \t\n]+$/, '')      // trailing whitespace garbage and blank lines
    + '\n';                        // exactly one final newline
}
export const bodyHash = (s) => createHash('sha256').update(normalize(s), 'utf8').digest('hex');
export const sha256hex = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

// ── I22/I23: provenance in two representations ────────────────────────────────────────────────
export function provenance(now = new Date(), language = DEFAULT_LANGUAGE) {
  const T = texts(language);
  const pad = (n) => String(n).padStart(2, '0');
  const offMin = -now.getTimezoneOffset();
  const off = (offMin >= 0 ? '+' : '-') + pad(Math.floor(Math.abs(offMin) / 60)) + ':' + pad(Math.abs(offMin) % 60);
  const atHuman = now.getDate() + ' ' + T.months[now.getMonth()] + ' ' + now.getFullYear() + ', ' +
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ' (' + off + ')'; // local time in words — for the human
  return { at: now.toISOString(), atHuman };
}

// ── I6: quiet hours — the window may cross midnight ───────────────────────────────────────────
export function inQuietHours(now = new Date(), from = null, to = null) {
  if (!from || !to) return false; // no window — no quiet hours
  const mins = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
  const n = now.getHours() * 60 + now.getMinutes();
  const f = mins(from), t = mins(to);
  return f <= t ? (n >= f && n < t) : (n >= f || n < t); // second branch — across midnight
}

// ── Document metadata (name contract): a fenced block at the head of the document ─────────────
// ```owner-review\n title: … \n kind: … \n artifacts:\n  - id: …\n    target: …\n    format: …\n    body_file: …\n```
export function parseMetaBlock(md) {
  const m = normalize(md).match(/^```owner-review\n([\s\S]*?)\n```/m);
  if (!m) return null;
  const meta = { artifacts: [] };
  let cur = null;
  for (const raw of m[1].split('\n')) {
    const art = raw.match(/^\s*-\s+id:\s*(.+)$/u);
    if (art) { cur = { id: art[1].trim() }; meta.artifacts.push(cur); continue; }
    const kv = raw.match(/^(\s*)([\w_]+):\s*(.*)$/u);
    if (!kv) continue;
    if (kv[1].length > 0 && cur) cur[kv[2]] = kv[3].trim();
    else if (kv[2] !== 'artifacts') meta[kv[2]] = kv[3].trim();
  }
  return meta;
}

// ── Document status (C4 rule 4: closedness is the STATUS, not the fullness of fields) ─────────
// The marker is looked for ONLY in the status line (markup, never a bare word); a document is
// LIVE by default — only explicit markup without a negation closes it (bugs/70 of the origin).
const STATUS_LINE_RE = new RegExp('^\\s*>?\\s*\\*{0,2}(?:' + PARSER.statusLabels + ')\\s*:?\\*{0,2}\\s*(.*)$', 'imu');
const STATUS_CLOSED_RE = new RegExp(PARSER.statusClosed, 'iu');
const STATUS_WAITING_RE = new RegExp(PARSER.statusWaiting, 'iu');
const STATUS_NEGATION_RE = new RegExp(PARSER.statusNegation, 'iu');

export function docStatus(md) {
  const head = normalize(md).split('\n').slice(0, HEAD_LINES).join('\n');
  const m = head.match(STATUS_LINE_RE);
  if (!m) return 'none';                                 // no status line — the document is LIVE
  const line = m[1];
  if (STATUS_NEGATION_RE.test(line)) return 'waiting';   // negation outranks the tick
  if (STATUS_CLOSED_RE.test(line)) return 'closed';
  if (STATUS_WAITING_RE.test(line)) return 'waiting';
  return 'none';
}

// ── C4: parsing the questions of a living text ────────────────────────────────────────────────
const L = PARSER.letters;
const QUESTION_HEADING_RE = new RegExp('^(#{2,4})\\s+((?:' + PARSER.questionPrefixes + ')\\d+)\\.?\\s*(.*)$', 'u');
// the modifier bracket allows ONE level of nesting: "(follow-up, 8 August 2026, 06:48 (+03:00))"
const ANSWER_LABEL_RE = new RegExp('^\\s*\\*{0,2}(?:' + PARSER.answerLabels + ')\\s*(?:\\((?<mod>(?:[^()]|\\([^()]*\\))*)\\))?\\s*:\\*{0,2}\\s*(?<rest>.*)$', 'iu');
const COUNTER_LABEL_RE = new RegExp(PARSER.counterQuestion, 'iu');      // rule 2: a counter-question is NOT an answer
const COMMENT_LABEL_RE = new RegExp('^\\s*\\*{0,2}(?:' + PARSER.commentLabels + ')', 'iu');
const TARGET_LABEL_RE = new RegExp('^\\s*\\*{0,2}(?:' + PARSER.targetLabels + ')\\s*:?\\*{0,2}\\s*(.*)$', 'iu');
const RECOMMEND_RE = new RegExp('(?:' + PARSER.recommendLabels + ')\\s*[:—–-]?\\s*\\*{0,2}([' + L + '])(?![\\p{L}\\d])', 'u');
// FIRST legal option form — a list item `- **A)** …` (a note in brackets after the letter is legal)
export const OPTION_START_RE = new RegExp('^\\s*-\\s+\\*\\*([' + L + '])\\)', 'u');
// SECOND legal form — a TABLE ROW `| **A** | … |` (bugs/51 of the origin): a one-letter cell (bold
// optional, dot/bracket optional, a bracketed note on either side of the bold) + at least one
// content cell to the right. A header row and the `---` separator do not match and drop out.
export const OPTION_ROW_RE = new RegExp('^\\s*\\|\\s*\\*{0,2}([' + L + '])[.)]?(?:\\s*\\([^)]*\\))?\\*{0,2}(?:\\s*\\([^)]*\\))?\\s*\\|(.+)$', 'u');
const FREE_FIELD_RE = new RegExp(PARSER.freeFieldMarker, 'u');
const isOptionLine = (line) => OPTION_START_RE.test(line) || OPTION_ROW_RE.test(line);

export function parseQuestions(md) {
  const lines = normalize(md).split('\n');
  const closed = docStatus(md) === 'closed';
  const questions = [];
  let cur = null, curLevel = 0, inFence = false;
  const flush = () => { if (cur) { finishQuestion(cur, closed); questions.push(cur); cur = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; if (cur) cur.body.push(line); continue; }
    if (inFence) { if (cur) cur.body.push(line); continue; }
    const qh = line.match(QUESTION_HEADING_RE);
    const anyHeading = line.match(/^(#{1,6})\s/);
    if (/^---\s*$/.test(line)) { flush(); continue; }             // rule 1: a rule closes the block
    if (qh) { flush(); cur = { id: qh[2], title: qh[3].trim(), line: i + 1, body: [] }; curLevel = qh[1].length; continue; }
    if (anyHeading && anyHeading[1].length <= curLevel) { flush(); continue; }
    if (cur) cur.body.push(line);
  }
  flush();
  return questions;
}

// Option tables are parsed BEFORE the line loop — one decision for the whole block, so the radios
// and the card prose see the same thing (rows that became options leave the prose). The threshold
// "≥ 2 option rows in one contiguous block" filters out a data table whose first cell is a letter.
function scanOptionTables(body) {
  const lines = new Set();
  const options = [];
  let run = [];
  const flushRun = () => {
    const rows = run.filter((r) => r.m);
    if (rows.length >= MIN_OPTIONS) {
      for (const r of run) lines.add(r.j);                    // the whole block, header and separator included
      for (const r of rows) {
        const cells = r.m[2].replace(/\|\s*$/, '').split('|').map((c) => c.trim()).filter(Boolean);
        options.push({ letter: r.m[1], lines: [], row: cells });
      }
    }
    run = [];
  };
  for (let j = 0; j < body.length; j++) {
    if (/^\s*\|/.test(body[j])) { run.push({ j, m: body[j].match(OPTION_ROW_RE) }); continue; }
    flushRun();
  }
  flushRun();
  return { lines, options };
}

function finishQuestion(q, docClosed) {
  const table = scanOptionTables(q.body);
  q.optionTableLines = table.lines;   // the page card reads it too — one parse for all
  q.options = [...table.options];
  q.answers = [];
  q.target = null;
  q.freeField = q.body.some((l) => FREE_FIELD_RE.test(l)); // spec §1: a declared free field
  let curOpt = null;
  let targetOpen = false;
  for (let j = 0; j < q.body.length; j++) {
    const line = q.body[j];
    const opt = line.match(OPTION_START_RE);
    if (opt) { curOpt = { letter: opt[1], lines: [line] }; q.options.push(curOpt); continue; } // rule 3: multi-line
    if (q.optionTableLines.has(j)) { curOpt = null; continue; }
    if (curOpt && /^\s{2,}\S/.test(line)) { curOpt.lines.push(line); continue; }
    curOpt = null;
    const t = line.match(TARGET_LABEL_RE);                 // several addressees accumulate, never overwrite
    if (t) { const v = t[1].trim(); q.target = q.target ? q.target + '\n' + v : v; targetOpen = true; continue; }
    if (targetOpen && /^\s{2,}\S/.test(line)) { q.target += '\n' + line.trim(); continue; }
    targetOpen = false;
    const a = line.match(ANSWER_LABEL_RE);
    if (a && !COUNTER_LABEL_RE.test(line)) {
      let text = (a.groups.rest || '').trim();
      if (!text) { // the answer text may sit on the first non-empty line below the label
        for (let k = j + 1; k < q.body.length; k++) {
          const nl = q.body[k].trim();
          if (!nl) continue;
          if (ANSWER_LABEL_RE.test(q.body[k]) || TARGET_LABEL_RE.test(q.body[k]) ||
              isOptionLine(q.body[k]) || COMMENT_LABEL_RE.test(q.body[k])) break; // an owner's comment is NOT the answer
          text = nl; break;
        }
      }
      q.answers.push({ line: j, text, followUp: Boolean(a.groups.mod) });
    }
  }
  for (const o of q.options) {
    if (o.row) { // table form: the LETTER MUST STAY in the option text (the human picks by name)
      o.label = o.letter + ')';
      o.text = '**' + o.letter + ')** ' + o.row.join(' — ');
      continue;
    }
    const full = o.lines.join('\n');
    const label = full.match(/\*\*([^*]+)\*\*/u);
    o.label = label ? label[1].trim() : o.letter + ')';
    o.text = full.replace(/^\s*-\s+/, '');
  }
  // the recommended letter is taken from the prose OUTSIDE the options and hung on the option itself
  const proseLines = q.body.filter((l, j) => !q.optionTableLines.has(j) && !OPTION_START_RE.test(l));
  const rec = proseLines.join('\n').match(RECOMMEND_RE);
  q.recommended = rec && q.options.some((o) => o.letter === rec[1]) ? rec[1] : null;
  q.answered = docClosed || q.answers.some((a) => a.text); // rule 4
}

// ── Spec §2: PRE-FLIGHT — the form of every open question, judged before any page opens ───────
/**
 * Problems of a document's question form. Empty = the page may open. Each problem names the
 * question and the fix (the #51 defect: options typed as paragraphs `**A. …**` are NOT options).
 * Answered questions are exempt (they render grey, no radios needed); a declared free field is legal.
 */
export function preflight(md) {
  const problems = [];
  for (const q of parseQuestions(md)) {
    if (q.answered || q.freeField) continue;
    if (q.options.length < MIN_OPTIONS)
      problems.push(q.id + ': ' + q.options.length + ' option(s) in list form and no declared free field' +
        ' — the page would open without radio buttons; fix the form: - **A)** … (or a table row | **A** | … |),' +
        ' or declare a free field: <!-- questions-guard:no-scenario <reason> -->');
  }
  return problems;
}

// ── P8 + I24: markdown mini-renderer (escaping is the FIRST action) ───────────────────────────
export const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, (_, c) => '<code>' + c + '</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\p{L}\d])\*([^*]+)\*(?!\*)/gu, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
export function renderMd(md) {
  const src = normalize(md).split('\n');
  const out = [];
  let inFence = false, fenceBuf = [], listOpen = false, quoteOpen = false, tableBuf = [];
  const closeList = () => { if (listOpen) { out.push('</ul>'); listOpen = false; } };
  const closeQuote = () => { if (quoteOpen) { out.push('</blockquote>'); quoteOpen = false; } };
  const flushTable = () => {
    if (!tableBuf.length) return;
    const rows = tableBuf.map((r) => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim()));
    let html = '<table>';
    rows.forEach((cells, ri) => {
      if (ri === 1 && cells.every((c) => /^:?-{2,}:?$/.test(c))) return;
      const tag = ri === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map((c) => '<' + tag + '>' + inline(escapeHtml(c)) + '</' + tag + '>').join('') + '</tr>';
    });
    out.push(html + '</table>');
    tableBuf = [];
  };
  for (const raw of src) {
    if (/^\s*```/.test(raw)) {
      if (inFence) { out.push('<pre><code>' + escapeHtml(fenceBuf.join('\n')) + '</code></pre>'); fenceBuf = []; }
      inFence = !inFence;
      continue;
    }
    if (inFence) { fenceBuf.push(raw); continue; } // inside fenced, comments are content (I24)
    const line = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/[ \t]+$/, ''); // I24: comments outside code are cut
    if (/^\s*\|.*\|\s*$/.test(line)) { closeList(); closeQuote(); tableBuf.push(line); continue; }
    flushTable();
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { closeList(); closeQuote(); out.push('<h' + h[1].length + '>' + inline(escapeHtml(h[2])) + '</h' + h[1].length + '>'); continue; }
    if (/^---+\s*$/.test(line)) { closeList(); closeQuote(); out.push('<hr>'); continue; }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { closeList(); if (!quoteOpen) { out.push('<blockquote>'); quoteOpen = true; } out.push('<p>' + inline(escapeHtml(q[1])) + '</p>'); continue; }
    closeQuote();
    const li = line.match(/^\s*[-*+]\s+(.*)$/);
    if (li) { if (!listOpen) { out.push('<ul>'); listOpen = true; } out.push('<li>' + inline(escapeHtml(li[1])) + '</li>'); continue; }
    closeList();
    if (line.trim()) out.push('<p>' + inline(escapeHtml(line)) + '</p>');
  }
  flushTable(); closeList(); closeQuote();
  return out.join('\n');
}

/**
 * Paragraph blocks of a document for the proofreading face: each block is a run of non-empty lines
 * outside fences (a fenced block is one paragraph). Ids are `p<N>` in document order.
 */
export function splitParagraphs(md) {
  const lines = normalize(md).split('\n');
  const paras = [];
  let buf = [], inFence = false;
  const flush = () => { if (buf.length) { paras.push({ id: 'p' + (paras.length + 1), text: buf.join('\n') }); buf = []; } };
  for (const line of lines) {
    if (/^\s*```/.test(line)) { if (!inFence) flush(); buf.push(line); if (inFence) flush(); inFence = !inFence; continue; }
    if (inFence) { buf.push(line); continue; }
    if (!line.trim()) { flush(); continue; }
    buf.push(line);
  }
  flush();
  return paras;
}

// ── C6/I2: the decision is written to THREE places with derived names ─────────────────────────
const docBase = (docPath) => basename(docPath).replace(/\.[^.]+$/u, '');
export function decisionPaths(root, docPath, cfg = loadContourConfig(root)) {
  const base = docBase(docPath);
  return {
    decision: resolve(root, cfg.decisionsDir, base + '.decision.json'),
    archive: (at) => resolve(root, cfg.archiveDir, base + '--' + at.replace(/[:.]/g, '-') + '.json'),
  };
}

/**
 * Record a decision. `payload`: { kind, by, comment, answers: { Q1: { choice, text, comment } },
 * artifacts, comments: { p1: text } (proofreading), read (notice) }. Place 1 is the source md —
 * only when the source IS markdown and there is something to write (an empty rewrite would strip
 * a BOM and stamp the owner's file's mtime); places 2 and 3 are the decision file and its archive.
 */
export function recordDecision(root, docPath, payload, cfg = loadContourConfig(root), now = new Date()) {
  const T = texts(cfg.language);
  const { at, atHuman } = provenance(now, cfg.language);
  const abs = resolve(root, docPath);
  const record = {
    kind: payload.kind || 'interview',
    document: docPath.replace(/\\/g, '/'),
    by: payload.by || cfg.ownerName,
    at, atHuman,
    comment: payload.comment || '',
    ...(payload.answers ? { answers: payload.answers } : {}),
    ...(payload.artifacts ? { artifacts: payload.artifacts } : {}),
    ...(payload.comments ? { comments: payload.comments } : {}),
  };
  const isMd = extname(abs).toLowerCase() === '.md';
  if (isMd) {
    const src = readFileSync(abs, 'utf8');
    const eol = /\r\n/.test(src) ? '\r\n' : '\n';
    const lines = stripBom(src).split(/\r?\n/);
    const questions = parseQuestions(src);
    const prov = '<!-- owner-review: by ' + record.by + ' · ' + atHuman + ' -->';
    let touched = false;
    // questions are processed BOTTOM-UP: a splice never shifts positions still to be processed above
    const entries = Object.entries(payload.answers || {})
      .map(([qid, ans]) => ({ qid, ans, q: questions.find((x) => x.id === qid) }))
      .filter((e) => e.q)
      .sort((a, b) => b.q.line - a.q.line);
    for (const { ans, q } of entries) {
      const answerText = [ans.choice ? ans.choice + ')' : '', ans.text || ''].filter(Boolean).join(' — ').trim();
      const qStart = q.line; // 1-based line of the question heading
      if (ans.comment) { // the comment FIRST (end of block): a splice below the answer line does not shift it
        lines.splice(qStart + q.body.length, 0, '', '**' + T.wb.ownerComment(atHuman) + '** ' + ans.comment + ' ' + prov, '');
        touched = true;
      }
      if (!answerText) continue; // "comment only" is NOT an answer — the question stays open
      const emptyAns = q.answers.find((a) => !a.text);
      touched = true;
      if (emptyAns !== undefined) {
        lines[qStart + emptyAns.line] = lines[qStart + emptyAns.line].replace(/\s*$/, '') + ' ' + answerText + ' ' + prov;
      } else { // the owner's answer is UNTOUCHABLE: new text only as a dated follow-up (I2)
        const lastAns = q.answers[q.answers.length - 1];
        const insertAt = lastAns ? qStart + lastAns.line + 1 : qStart + q.body.length;
        lines.splice(insertAt, 0, '', '**' + T.wb.followUp(atHuman) + '** ' + answerText + ' ' + prov);
      }
    }
    const tail = [];
    if (record.comments && Object.keys(record.comments).length) { // proofreading: a dated block at the END
      tail.push('**' + T.wb.proofread(atHuman) + '** ' + prov, '');
      for (const [pid, text] of Object.entries(record.comments)) if (String(text).trim()) tail.push('- **' + pid + '** — ' + String(text).trim());
    }
    if (record.comment) tail.push(...(tail.length ? [''] : []), '**' + T.wb.ownerComment(atHuman) + '** ' + record.comment + ' ' + prov);
    if (tail.length) {
      while (lines.length && lines[lines.length - 1] === '') lines.pop();
      lines.push('', '---', '', ...tail, '');
      touched = true;
    }
    if (touched) writeFileSync(abs, lines.join(eol), 'utf8');
  }
  const p = decisionPaths(root, docPath, cfg);
  mkdirSync(resolve(root, cfg.archiveDir), { recursive: true });
  writeFileSync(p.decision, JSON.stringify(record, null, 2) + '\n', 'utf8');      // place 2
  writeFileSync(p.archive(at), JSON.stringify(record, null, 2) + '\n', 'utf8');   // place 3 — never rewritten
  return record;
}

export function readDecision(root, docPath, cfg = loadContourConfig(root)) {
  const p = decisionPaths(root, docPath, cfg).decision;
  if (!existsSync(p)) return null;
  return readJson(p);
}

// ── C7/I4: the sending gate — one function for both sides, never throws ───────────────────────
export function checkApproval(root, docPath, artifactId, cfg = loadContourConfig(root)) {
  try {
    const decision = readDecision(root, docPath, cfg);
    if (!decision) return { ok: false, reason: 'no decision — the review has not taken place' };
    const art = (decision.artifacts || {})[artifactId];
    if (!art) return { ok: false, reason: 'artifact "' + artifactId + '" is not declared in the decision' };
    if (art.status !== 'approved') return { ok: false, reason: 'artifact status is "' + art.status + '", not approved' };
    const meta = parseMetaBlock(readFileSync(resolve(root, docPath), 'utf8'));
    const decl = (meta && meta.artifacts.find((a) => a.id === artifactId)) || null;
    if (!decl || !decl.body_file) return { ok: false, reason: 'artifact not declared in the document meta block, or without body_file' };
    const bodyPath = resolve(root, decl.body_file);
    if (!existsSync(bodyPath)) return { ok: false, reason: 'artifact body is missing: ' + decl.body_file };
    const actual = bodyHash(readFileSync(bodyPath, 'utf8'));
    if (actual !== art.sha256) return { ok: false, reason: 'the text changed after approval — the approval is VOID (I3)' };
    return { ok: true, reason: 'approved, hash matches' };
  } catch (e) {
    return { ok: false, reason: 'unexpected error while checking: ' + e.message }; // any doubt = refusal
  }
}

// ── Where the temporary renders of this contour live (ignored by git BEFORE the tool exists) ──
export const TMP_DIR = '.kaif/.contour-tmp';
export const tmpDirOf = (root) => join(resolve(root), ...TMP_DIR.split('/'));
