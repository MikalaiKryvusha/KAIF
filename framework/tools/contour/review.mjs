#!/usr/bin/env node
// review.mjs — the SHIPPED interactive contour generator: three faces (interview · proofreading ·
// mockup review) + notice + queue, one page shell, one server, one call (KAIF 2.6, epic IC; plans/93
// IC3; owner decision #101 revising #34: the contour ships, projects run it — they do not build it).
// [TESTED: 2026-09-05 · `--selftest` 45 checks green; acceptance probe tools/sandbox/probes/ic3-contour-generator.mjs
//  11/11 on a fresh install from the bundle (#051 → exit 3 naming Q1 and `- **A)**`, canonical doc → --no-serve exit 0
//  + RENDER IS NOT YET A SHOW, --mark-shown writes shown.json); suite s22 (fresh install · pre-flight · three faces ·
//  shown fact · update route with the project's own tools/review.mjs untouched); polygon `all 22 suites green`.
//  NOT observed yet: a live browser window (origin's verify-contour — step IC5), the macOS/Linux fallbacks]
//
//   node .kaif/tools/contour/review.mjs <doc.md>                 # interview: radio per option, free field, Save
//   node .kaif/tools/contour/review.mjs <doc.md> --notice        # something to TELL — "OK, read" is the outcome
//   node .kaif/tools/contour/review.mjs <doc.md> --proofread     # a comment field under every paragraph, Done
//   node .kaif/tools/contour/review.mjs <image>  --mockup        # the image + a comment field, Done
//   node .kaif/tools/contour/review.mjs --queue [--include-stale] | --queue --list | --enqueue <doc> [--notice]
//   node .kaif/tools/contour/review.mjs --mark-shown <doc> --transport chat | <doc> --no-serve | --selftest
//   flags: --no-open (serve, do not open a window) · --silent (no call) · --timeout N (seconds; automation only)
//
// Parameters are READ from .kaif/kaif.json (`language`, `projectName`, optional `contour.*`) — never
// asked (owner rule #97). The one-page contract this file implements: .kaif/INTERACTIVE_CONTOUR_SPEC.md.
//
// ⚠️ T7 (platform trap): NO backtick may appear inside the template strings of this file — a backtick
// in the page body breaks the module with a syntax error SOMEWHERE ELSE. Page JS is written with
// single quotes and concatenation; page texts come from texts.mjs by the deployment language.
//
// Exit codes (spec §5): 0 decision recorded (or notice read) · 2 page closed without an answer ·
// 130 interrupted · 3 pre-flight refused to open (a question without options in list/table form
// and no declared free field — the #51 defect) or the page self-check failed (radio groups ≠ questions).
//
// Contract lines living here: I1 md source / HTML derived · I5 call AFTER the page is up · I6 quiet
// hours · I7 queue is a STATE file · I8 the recorded decision ENDS the process · I9 infinite patience
// · I10–I13 loud refusal, rescue ring, browser draft, /alive pulse · I14 /closed beacon + silence
// watch · I25 three outcomes · I26/I27 app window, auto-close is an attempt · I29/I30 lock / free
// port · I32 the call never blocks · I33/I34 beeps first · I35/I36 voice by language, honest
// fallback · I37/I38 notice class · I39 stale queue · I40–I42 the fact of SHOWING · M8 render ≠ show.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { join, resolve, basename, relative, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  loadContourConfig, normalize, bodyHash, provenance, inQuietHours, parseMetaBlock, parseQuestions,
  docStatus, renderMd, splitParagraphs, recordDecision, preflight, escapeHtml, tmpDirOf, TMP_DIR,
} from './core.mjs';
import { texts, PARSER } from './texts.mjs';

// ── Constants (canonical defaults DEF; the owner's envelope — depart only by the owner's word) ─
const ALIVE_INTERVAL_MS = 15000;      // DEF4: page→server pulse, envelope 10–60 s
const AUTOCLOSE_DELAY_MS = 2000;      // DEF2: window.close() attempt after the save
const AUTOCLOSE_RESERVE_MS = 2000;    // DEF2: reserve for a refused close → an honest request
const SERVER_DEATH_MS = 2500;         // DEF3: server death after the save (the window has time to go)
const BEACON_RELOAD_GRACE_MS = 3000;  // DEF6/T3: ~3 s after the beacon — reload vs close
// Silence-watch thresholds may be TIGHTENED by the environment — and only tightened.
const stricterMs = (envName, canon) => {
  const v = Number(process.env[envName]);
  return Number.isFinite(v) && v > 0 && v < canon ? v : canon;
};
const SILENCE_THRESHOLD_MS = stricterMs('KAIF_CONTOUR_SILENCE_MS', 180000); // DEF6: 3 min (background tabs throttle)
const SILENCE_TICK_MS = stricterMs('KAIF_CONTOUR_TICK_MS', 15000);          // DEF5: watch tick
const SILENCE_STRIKES_TO_DIE = 2;     // DEF6/T5: two strikes against a sleeping machine
const BEEP_DEADLINE_MS = 8000;        // DEF7: hard deadline of the beep child
const VOICE_TIMEOUT_MS = 60000;       // DEF7: voice timeout (a cold first call may take seconds)
const WINDOW_SIZE = '1100,900';       // DEF8
const EXIT_DECIDED = 0, EXIT_CLOSED = 2, EXIT_INTERRUPTED = 130, EXIT_PREFLIGHT = 3; // I25 + spec §2
const EXIT_NEVER_SHOWN = 2;           // I42: a never-shown waiting document reddens `--queue --list`
const STALE_QUEUE_DAYS = Number(process.env.KAIF_STALE_QUEUE_DAYS) > 0 ? Number(process.env.KAIF_STALE_QUEUE_DAYS) : 14; // I39
const DAY_MS = 86400000;
const QUEUE_FILE = 'queue.json';      // under decisionsDir (I7)
const SHOWN_FILE = 'shown.json';      // under decisionsDir (I40)
const KIND_NOTICE = 'notice';
const FACES = ['interview', 'proofread', 'mockup'];
const IMAGE_MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const IS_WIN = platform() === 'win32', IS_MAC = platform() === 'darwin';
const CLI_NAME = 'node .kaif/tools/contour/review.mjs'; // how the rituals call it

// ── Configuration per root (cached: AGENT_GUIDE is read once per process) ─────────────────────
const CFG_CACHE = new Map();
export function cfgOf(root) {
  const key = resolve(root);
  if (!CFG_CACHE.has(key)) CFG_CACHE.set(key, loadContourConfig(key));
  return CFG_CACHE.get(key);
}
export const T = (cfg) => texts(cfg.language);
const stripBom = (s) => String(s).replace(/^﻿/, '');
const readJsonOr = (p, dflt) => { if (!existsSync(p)) return dflt; try { return JSON.parse(stripBom(readFileSync(p, 'utf8'))); } catch { return dflt; } };
const relDoc = (root, docPath) => relative(root, resolve(root, docPath)).replace(/\\/g, '/');
const decisionsAbs = (root, cfg = cfgOf(root)) => resolve(root, cfg.decisionsDir);
const esc = (s) => String(s).replace(/</g, '&lt;');

// ── The call phrase — a PURE function (its content is judged by the selftest, not by ear) ─────
export function callPhrase(ctx, cfg) {
  const t = T(cfg), o = cfg.callName, p = cfg.spokenProjectName; // the voice says the spoken form
  if (ctx.notice) return t.call.notice(o, p, ctx.title);
  if (ctx.batch) {
    const parts = [t.call.parts.docs(ctx.nDocs), t.call.parts.questions(ctx.nQuestions)];
    if (ctx.nNotices > 0) parts.push(t.call.parts.notices(ctx.nNotices));
    return t.call.batch(o, p, parts);
  }
  if (ctx.face === 'proofread') return t.call.proofread(o, p, ctx.title);
  if (ctx.face === 'mockup') return t.call.mockup(o, p, ctx.title);
  return t.call.interview(o, p, ctx.kind, ctx.title, ctx.nWait);
}

// ── The signal (C8/I33): beeps → console → voice; quiet hours on top (I6) ─────────────────────
// The rich voice engine is a MACHINE resource reached through the environment (KAIF_VOICE_TOOL — a
// node script taking `<phrase> --play --voice <name>`; KAIF_VOICE; KAIF_SAPI_VOICE) — never a path
// inside the project. Without it the contour drops to the system voice of the deployment language
// (Windows SAPI by culture · macOS `say`), and without that — to beeps + banner, saying so.
export function signalCall(root, rawPhrase, { quiet = null, log = console.log } = {}) {
  const cfg = cfgOf(root);
  const isQuiet = quiet === null ? inQuietHours(new Date(), cfg.quietFrom, cfg.quietTo) : quiet;
  log('CALL: ' + rawPhrase); // C8: plain text to the console — an exit code does not prove a human heard it
  const phrase = rawPhrase.replace(/[*_`#>[\]()«»"]/g, ' ').replace(/\s{2,}/g, ' ').trim(); // no markup in speech
  if (isQuiet) { log('Quiet hours (I6) — beeps and voice suppressed; the page is up silently.'); return; }
  const voice = () => {
    const lang = cfg.language;
    const systemVoice = () => {
      if (IS_WIN) {
        const dir = tmpDirOf(root);
        mkdirSync(dir, { recursive: true });
        const phraseFile = join(dir, 'call-phrase.txt');
        writeFileSync(phraseFile, '﻿' + phrase, 'utf8'); // UTF-8 with BOM — PowerShell reads the encoding by BOM
        const pref = process.env.KAIF_SAPI_VOICE || '';
        const ps = spawn('powershell.exe', ['-NoProfile', '-Command',
          'Add-Type -AssemblyName System.Speech; ' +
          '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
          "$c = '" + lang + "'; $pref = '" + pref.replace(/'/g, "''") + "'; " +
          '$vs = @($s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name.ToLower().StartsWith($c) }); ' +
          'if ($vs.Count -eq 0) { exit 3 }; ' +
          '$v = @($vs | Where-Object { $_.VoiceInfo.Name -eq $pref }); if ($v.Count -eq 0) { $v = $vs }; ' +
          '$s.SelectVoice($v[0].VoiceInfo.Name); ' +
          "$s.Speak([IO.File]::ReadAllText('" + phraseFile.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'))"],
          { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS });
        ps.on('exit', (code) => { if (code === 3) log('CALL: no system voice of culture "' + lang + '" on this machine — the phrase was not spoken; beeps and banner did the call (I35).'); });
        ps.on('error', () => log('CALL: system voice — engine not installed; beeps and banner did the call (I36).'));
        return;
      }
      if (IS_MAC) {
        const say = spawn('say', [phrase], { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS });
        say.on('error', () => log('CALL: system voice — engine not installed; beeps and banner did the call (I36).'));
        return;
      }
      log('CALL: system voice — engine not installed on this platform; beeps and banner did the call (I36).');
    };
    const tool = process.env.KAIF_VOICE_TOOL;
    if (!tool) { log('CALL: voice — system voice of culture "' + lang + '" (no KAIF_VOICE_TOOL in the environment, I35).'); systemVoice(); return; }
    try {
      log('CALL: voice — ' + (process.env.KAIF_VOICE || 'default') + ' via KAIF_VOICE_TOOL; fallback — system voice of culture "' + lang + '" (I35).');
      const rich = spawn(process.execPath, [tool, phrase, '--play', '--voice', process.env.KAIF_VOICE || 'default'],
        { stdio: 'ignore', timeout: VOICE_TIMEOUT_MS });
      rich.on('exit', (code) => { if (code !== 0) systemVoice(); });
      rich.on('error', systemVoice);
    } catch { systemVoice(); }
  };
  // Beeps — through the sound card (I34), ASCII command, hard deadline DEF7; then the voice.
  if (IS_WIN) {
    const beep = spawn('powershell.exe',
      ['-NoProfile', '-Command', '[console]::beep(880,160);[console]::beep(660,160);[console]::beep(990,260)'],
      { stdio: 'ignore', timeout: BEEP_DEADLINE_MS });
    beep.on('exit', voice);
    beep.on('error', () => { log('CALL: beeps failed (no PowerShell?) — voice next.'); voice(); }); // the signal never drops the contour (I32)
  } else {
    try { process.stdout.write(''); } catch { /* no terminal — nothing to ring */ }
    log('CALL: no sound-card beep on this platform — terminal bell only; voice next.');
    voice();
  }
}

// ── The queue (I7): a state file; living documents stay where they are ───────────────────────
export function readQueue(root, cfg = cfgOf(root)) { return readJsonOr(join(decisionsAbs(root, cfg), QUEUE_FILE), []); }
export function writeQueue(root, items, cfg = cfgOf(root)) {
  mkdirSync(decisionsAbs(root, cfg), { recursive: true });
  writeFileSync(join(decisionsAbs(root, cfg), QUEUE_FILE), JSON.stringify(items, null, 2) + '\n', 'utf8');
}
export const isNoticeItem = (item) => item.kind === KIND_NOTICE; // items without kind are questions (legacy)

export function enqueue(root, docPath, { kind = 'question' } = {}) {
  const items = readQueue(root);
  const rel = relDoc(root, docPath);
  const found = items.find((i) => i.doc === rel);
  if (found) {
    if (kind === KIND_NOTICE) { // a repeated notice on the same document is a NEW delivery (I38)
      found.kind = KIND_NOTICE; delete found.readAt; found.addedAt = provenance().at;
      writeQueue(root, items);
    }
    return items;
  }
  items.push({ doc: rel, kind, addedAt: provenance().at });
  writeQueue(root, items);
  return items;
}

// I38: the "read" mark is the ONLY proof of delivery; it lives in the state file, not in the document.
export function markNoticeRead(root, docPath, now = new Date()) {
  const items = readQueue(root);
  const item = items.find((i) => i.doc === relDoc(root, docPath) && isNoticeItem(i));
  if (!item) return false;
  item.readAt = provenance(now).at;
  writeQueue(root, items);
  return true;
}

export function pendingNotices(root) {
  return readQueue(root)
    .filter((i) => isNoticeItem(i) && !i.readAt && existsSync(resolve(root, i.doc)))
    .map((i) => ({ doc: i.doc, addedAt: i.addedAt }));
}

// Every document with unanswered QUESTIONS: a scan of interviews/ (living documents in place) + the queue.
export function pendingDocs(root) {
  const noticeDocs = new Set(readQueue(root).filter(isNoticeItem).map((i) => i.doc));
  const seen = new Set();
  const out = [];
  const push = (rel) => {
    if (seen.has(rel) || noticeDocs.has(rel) || !existsSync(resolve(root, rel))) return;
    seen.add(rel);
    const md = readFileSync(resolve(root, rel), 'utf8');
    const qs = parseQuestions(md);
    const unanswered = qs.filter((q) => !q.answered);
    if (unanswered.length > 0 || docStatus(md) === 'waiting')
      out.push({ doc: rel, unanswered: unanswered.length, questions: qs.length });
  };
  const ivDir = resolve(root, 'interviews');
  if (existsSync(ivDir))
    for (const f of readdirSync(ivDir).filter((x) => /^interview_\d+.*\.md$/.test(x)).sort()) push('interviews/' + f);
  for (const item of readQueue(root)) if (!isNoticeItem(item)) push(item.doc);
  return out;
}

// ── I39: stale queue positions — the agent's debt, not the owner's page ───────────────────────
export function queueDocAgeDays(root, rel, now = new Date()) {
  const item = readQueue(root).find((i) => i.doc === rel && i.addedAt);
  let at = item ? Date.parse(item.addedAt) : NaN;
  if (Number.isNaN(at)) {
    const p = resolve(root, rel);
    if (!existsSync(p)) return 0;
    const head = stripBom(readFileSync(p, 'utf8')).split(/\r?\n/).slice(0, 30).join('\n');
    const m = head.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    at = m ? Date.parse(m[1] + 'T00:00:00Z') : NaN;
  }
  return Number.isNaN(at) ? 0 : Math.floor((now.getTime() - at) / DAY_MS);
}
export function staleQueueDocs(root, docs, now = new Date()) {
  return docs.map((d) => ({ ...d, days: queueDocAgeDays(root, d.doc, now) })).filter((d) => d.days > STALE_QUEUE_DAYS);
}
// The owner's showcase: what waits for HIM — fully answered documents leave; "waits by status" stays; stale leaves.
export function ownerDocs(root, { includeStale = false, now = new Date() } = {}) {
  const live = pendingDocs(root).filter((d) => !(d.questions > 0 && d.unanswered === 0));
  if (includeStale) return live;
  const stale = new Set(staleQueueDocs(root, live, now).map((d) => d.doc));
  return live.filter((d) => !stale.has(d.doc));
}

// ── I40–I42: the fact of SHOWING, the queue with ages, the gate by exit code ──────────────────
export function readShown(root, cfg = cfgOf(root)) { return readJsonOr(join(decisionsAbs(root, cfg), SHOWN_FILE), {}); }
// Written AT THE MOMENT of showing (window open / question asked in chat) — not when the agent remembered.
export function recordShown(root, rels, transport, now = new Date()) {
  const map = readShown(root);
  for (const r of rels) map[String(r).replace(/\\/g, '/')] = { at: now.toISOString(), transport };
  mkdirSync(decisionsAbs(root), { recursive: true });
  writeFileSync(join(decisionsAbs(root), SHOWN_FILE), JSON.stringify(map, null, 2) + '\n', 'utf8');
  return map;
}
export function listQueue(root, { now = new Date(), includeStale = false } = {}) {
  const t = T(cfgOf(root));
  const shown = readShown(root);
  const docs = ownerDocs(root, { includeStale, now }).map((d) => {
    const s = shown[d.doc] || null;
    const shownDays = s ? Math.floor((now.getTime() - Date.parse(s.at)) / DAY_MS) : null;
    return { ...d, waitDays: queueDocAgeDays(root, d.doc, now), shown: s, shownDays };
  });
  docs.sort((a, b) => (a.shown ? 1 : 0) - (b.shown ? 1 : 0) || (b.shownDays ?? 0) - (a.shownDays ?? 0) || a.doc.localeCompare(b.doc));
  const never = docs.filter((d) => !d.shown);
  const lines = docs.map((d) => (d.shown ? '🟡 ' : '⛔ ') + d.doc + ' — ' + t.list.waits(d.waitDays) +
    (d.shown ? ' · ' + t.list.shown(d.shown.at.slice(0, 10), d.shownDays, d.shown.transport) : ' · ' + t.list.never));
  if (!docs.length) lines.push(t.list.empty);
  if (never.length) {
    lines.push('🔴 ' + t.list.gate(never.length));
    lines.push('   ' + t.list.how(CLI_NAME));
    lines.push('   ' + t.list.dead);
  }
  return { docs, never, lines, exitCode: never.length ? EXIT_NEVER_SHOWN : 0 };
}

// ── Building pages (I1: only from documents) ──────────────────────────────────────────────────
const docTitle = (md, docPath, meta = parseMetaBlock(md)) =>
  (meta && meta.title) || (normalize(md).match(/^#\s+(.+)$/m) || [])[1] || basename(docPath);
const docKind = (root, rel, meta) => {
  const t = T(cfgOf(root));
  return (meta && meta.kind) || (rel.startsWith('interviews/') ? t.kind.interview : rel.startsWith('homeworks/') ? t.kind.homework : t.kind.document);
};
const ANSWER_LINE_RE = new RegExp('^\\s*\\*{0,2}(?:' + PARSER.answerLabels + ')\\s*(?:\\([^)]*\\))?\\s*:', 'iu');
const TARGET_LINE_RE = new RegExp('^\\s*\\*{0,2}(?:' + PARSER.targetLabels + ')\\s*:', 'iu');
const OPTION_LINE_RE = new RegExp('^\\s*-\\s+\\*\\*[' + PARSER.letters + ']\\)', 'u');
const QSECTION_RE = new RegExp('^#{1,3}\\s+(?:' + PARSER.questionsSectionHeadings + ')(?![\\p{L}\\d])', 'iu');

export function buildPage(root, docPath) {
  const cfg = cfgOf(root), t = T(cfg);
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const meta = parseMetaBlock(md);
  const rel = relDoc(root, docPath);
  const kind = docKind(root, rel, meta);
  const title = docTitle(md, docPath, meta);
  const parsed = parseQuestions(md);
  // The card carries the WHOLE question body except the options and the answer fields — those are interactive.
  const proseOf = (q) => {
    const keep = [];
    let inOpt = false;
    for (let j = 0; j < q.body.length; j++) {
      const line = q.body[j];
      if (q.optionTableLines && q.optionTableLines.has(j)) { inOpt = false; continue; }
      if (OPTION_LINE_RE.test(line)) { inOpt = true; continue; }
      if (inOpt && /^\s{2,}\S/.test(line)) continue;
      inOpt = false;
      if (ANSWER_LINE_RE.test(line)) continue;
      if (TARGET_LINE_RE.test(line)) continue;
      keep.push(line);
    }
    return renderMd(keep.join('\n'));
  };
  const questions = parsed.map((q) => ({
    doc: rel, id: q.id, title: q.title, answered: q.answered, target: q.target,
    bodyHtml: proseOf(q), recommended: q.recommended,
    options: q.options.map((o) => ({ letter: o.letter, html: renderMd(o.text), recommended: o.letter === q.recommended })),
    existing: q.answers.filter((a) => a.text).map((a) => a.text.replace(/<!--[\s\S]*?-->/g, '').trim()).filter(Boolean),
  }));
  const docHash = bodyHash(md);
  // question blocks are CUT from the prose render — the cards below are the only form of questions
  const normLines = normalize(md).split('\n');
  const drop = new Set();
  for (const q of parsed) for (let i = q.line - 1; i <= q.line - 1 + q.body.length && i < normLines.length; i++) drop.add(i);
  normLines.forEach((l, i) => { if (QSECTION_RE.test(l)) drop.add(i); });
  if (meta) { // the meta block is machine markup — never shown to a human
    for (let i = 0; i < normLines.length; i++) {
      if (!/^```owner-review\s*$/.test(normLines[i])) continue;
      for (let j = i; j < normLines.length; j++) { drop.add(j); if (j > i && /^```\s*$/.test(normLines[j])) break; }
      break;
    }
  }
  const body = renderMd(normLines.filter((_, i) => !drop.has(i)).join('\n'));
  // outbound artifacts: the SERVER hashes the body — what is approved is a concrete text (I3)
  const artifacts = ((meta && meta.artifacts) || []).map((a) => {
    const abs = a.body_file ? resolve(root, a.body_file) : null;
    const exists = !!(abs && existsSync(abs));
    const text = exists ? readFileSync(abs, 'utf8') : '';
    return { doc: rel, id: a.id, target: a.target || '', format: a.format || '', bodyFile: a.body_file || '',
      exists, sha256: exists ? bodyHash(text) : null, bodyHtml: exists ? renderMd(text) : '', bytes: exists ? Buffer.byteLength(text, 'utf8') : 0 };
  });
  const nAns = questions.filter((q) => q.answered).length;
  const nWait = questions.length - nAns;
  const summary = questions.length
    ? ' <span class="tag done">' + t.tag.answeredN(nAns) + '</span>' +
      (nWait ? ' <span class="tag you">' + t.tag.waitN(nWait) + '</span>' : ' <span class="tag done">' + t.tag.allAnswered + '</span>')
    : '';
  const artSection = artifacts.length ? '<h2>' + t.head.outbound + '</h2>' + artifacts.map((a) => aCard(a, t)).join('\n') : '';
  const qSection = questions.length
    ? '<h2>' + t.head.questions + '</h2>' + questions.map((q) => qCard(q, t)).join('\n')
    : (artifacts.length ? '' : '<h2>' + t.head.questions + '</h2><p>' + t.head.noQuestions + '</p>');
  const html = pageShell(cfg, {
    title, kind, heading: '<span class="kind">' + esc(kind) + '</span><span>' + esc(title) + '</span>' + summary,
    main: '<div class="doc">' + body + '</div>' + artSection + qSection + docCommentBlock(rel, t),
    questions, artifacts, face: 'interview',
  });
  return { html, questions, artifacts, docHash, kind, title, rel, face: 'interview' };
}

// I37: the NOTICE page — the whole document, an optional comment, the EXPLICIT "read" mark.
export function buildNoticePage(root, docPath) {
  const cfg = cfgOf(root), t = T(cfg);
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const rel = relDoc(root, docPath);
  const title = docTitle(md, docPath);
  const html = pageShell(cfg, {
    title, kind: t.kind.notice,
    heading: '<span class="kind">' + t.kind.notice + '</span><span>' + esc(title) + '</span> <span class="tag notice">' + t.tag.noAnswerNote + '</span>',
    main: '<div class="doc">' + renderMd(md) + '</div>' + noticeCommentBlock(rel, t),
    questions: [], notices: [rel], noticeDoc: rel, face: 'notice',
  });
  return { html, questions: [], docHash: bodyHash(md), kind: t.kind.notice, title, rel, face: 'notice' };
}

// The PROOFREADING face (new in 2.6, owner scenario B of interview #024): every paragraph of the
// document with a comment field under it and one Done button. Record: kind "proofread", comments { p<N> }.
export function buildProofreadPage(root, docPath) {
  const cfg = cfgOf(root), t = T(cfg);
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const rel = relDoc(root, docPath);
  const title = docTitle(md, docPath);
  const paras = splitParagraphs(md);
  const cards = paras.map((p) =>
    '<section class="pcard" id="' + p.id + '"><div class="pid">' + p.id + '</div><div class="ptext">' + renderMd(p.text) + '</div>' +
    '<p><textarea data-draft data-doc="' + esc(rel) + '" name="para:' + esc(rel) + ':' + p.id + '" rows="2" placeholder="' + esc(t.ph.paragraph) + '"></textarea></p></section>').join('\n');
  const html = pageShell(cfg, {
    title, kind: t.kind.proofread,
    heading: '<span class="kind">' + t.kind.proofread + '</span><span>' + esc(title) + '</span> <span class="tag you">' + t.tag.you + '</span>',
    main: '<h2>' + t.head.paragraphs + ' (' + paras.length + ')</h2>' + cards + docCommentBlock(rel, t),
    questions: [], face: 'proofread', faceDoc: rel, paragraphs: paras.map((p) => p.id),
  });
  return { html, questions: [], docHash: bodyHash(md), kind: t.kind.proofread, title, rel, paragraphs: paras.length, face: 'proofread' };
}

// The MOCKUP face (new in 2.6): the image embedded as a data URI (works with --no-serve too) + one
// comment field + Done. Record: kind "mockup". First version — no region markup; field tickets extend it.
export function buildMockupPage(root, imagePath) {
  const cfg = cfgOf(root), t = T(cfg);
  const abs = resolve(root, imagePath);
  const rel = relDoc(root, imagePath);
  const mime = IMAGE_MIME[extname(abs).toLowerCase()];
  if (!mime) throw new Error('not an image for the mockup face (png/jpg/gif/webp/svg): ' + rel);
  const data = readFileSync(abs);
  const src = 'data:' + mime + ';base64,' + data.toString('base64');
  const title = basename(imagePath);
  const html = pageShell(cfg, {
    title, kind: t.kind.mockup,
    heading: '<span class="kind">' + t.kind.mockup + '</span><span>' + esc(title) + '</span> <span class="tag you">' + t.tag.you + '</span>',
    main: '<h2>' + t.head.mockup + '</h2><div class="mock"><img src="' + src + '" alt="' + esc(title) + '"></div>' +
      '<p><textarea data-draft data-doc="' + esc(rel) + '" name="doccomment:' + esc(rel) + '" rows="5" placeholder="' + esc(t.ph.mockup) + '"></textarea></p>',
    questions: [], face: 'mockup', faceDoc: rel,
  });
  return { html, questions: [], docHash: bodyHash(data.toString('base64')), kind: t.kind.mockup, title, rel, face: 'mockup' };
}

// The batch page "N accumulated" (I7): a card per document; notices go STRICTLY UNDER the questions.
export function buildQueuePage(root, docs, notices = pendingNotices(root)) {
  const cfg = cfgOf(root), t = T(cfg);
  const groups = docs.map(({ doc }) => {
    const page = buildPage(root, doc);
    return { doc, title: page.title, kind: page.kind, pending: page.questions.filter((q) => !q.answered) };
  });
  const total = groups.reduce((s, g) => s + g.pending.length, 0);
  const questionsMain = groups.map((g) =>
    '<section class="group"><h2>' + esc(g.title) + ' <small class="kind">' + esc(g.doc) + '</small></h2>' +
    (g.pending.map((q) => qCard(q, t)).join('\n') || '<p>' + t.head.noPending + '</p>') + docCommentBlock(g.doc, t) +
    '<p><button type="button" class="savedoc" data-doc="' + esc(g.doc) + '">' + t.btn.saveDoc + '</button></p></section>').join('\n<hr>\n');
  const noticesMain = notices.length
    ? '\n<hr>\n<h2 class="noticehead">' + t.head.noticeGroup + ' (' + notices.length + ')</h2>\n' +
      notices.map(({ doc }) => {
        const md = readFileSync(resolve(root, doc), 'utf8');
        return '<section class="group notice"><h3>' + esc(docTitle(md, doc)) + ' <small class="kind">' + esc(doc) + '</small></h3>' +
          '<div class="doc">' + renderMd(md) + '</div>' + noticeCommentBlock(doc, t) +
          '<p><button type="button" class="savedoc" data-doc="' + esc(doc) + '">' + t.btn.read + '</button></p></section>';
      }).join('\n<hr>\n')
    : '';
  const questions = groups.flatMap((g) => g.pending);
  const counts = t.count.docs(docs.length + notices.length) + ' · ' + t.count.questions(total) + (notices.length ? ' · ' + t.count.notices(notices.length) : '');
  const html = pageShell(cfg, {
    title: t.head.accumulated + ': ' + counts, kind: t.kind.queue,
    heading: '<span class="kind">' + t.kind.queue + '</span><span>' + t.head.accumulated + ': ' + esc(counts) + '</span>',
    main: questionsMain + noticesMain, questions, batch: true, notices: notices.map((n) => n.doc), face: 'interview',
  });
  return { html, questions, total, notices: notices.length };
}

// The ENTRY page of the queue: cards only; each opens its document in a separate window (/d/<rel>).
export function buildIndexPage(root, docs, notices = []) {
  const cfg = cfgOf(root), t = T(cfg);
  const card = (rel, kindLabel, pendingLabel, cls) => {
    const md = readFileSync(resolve(root, rel), 'utf8');
    return '<a class="card ' + cls + '" href="/d/' + encodeURIComponent(rel) + '" target="_blank" rel="noopener">' +
      '<span class="ckind">' + esc(kindLabel) + '</span><span class="ctitle">' + esc(docTitle(md, rel)) + '</span>' +
      '<span class="cmeta">' + esc(rel) + '</span><span class="cpend">' + esc(pendingLabel) + '</span><span class="cgo">' + t.count.open + '</span></a>';
  };
  const qCards = docs.map((d) => card(d.doc, t.kind.interview, d.unanswered > 0 ? t.count.pendingQ(d.unanswered) : t.count.waitsByStatus, 'wait'));
  const nCards = notices.map((n) => card(n.doc, t.kind.notice, t.count.unread, 'notice'));
  const total = docs.reduce((s, d) => s + d.unanswered, 0);
  const counts = t.count.docs(docs.length + notices.length) + ' · ' + t.count.questions(total) + (notices.length ? ' · ' + t.count.notices(notices.length) : '');
  const main = '<div class="cards">' + qCards.join('\n') +
    (nCards.length ? '<h2 class="noticehead">' + t.head.noticeGroup + ' (' + nCards.length + ')</h2>' + nCards.join('\n') : '') + '</div>' +
    (qCards.length + nCards.length === 0 ? '<p>' + t.head.queueEmpty + '</p>' : '');
  const html = pageShell(cfg, {
    title: t.head.accumulated + ': ' + counts, kind: t.kind.queue,
    heading: '<span class="kind">' + t.kind.queue + '</span><span>' + t.head.accumulated + ': ' + esc(counts) + '</span>',
    main, questions: [], index: true, face: 'interview',
  });
  return { html, questions: [], total, notices: notices.length };
}

// ── Spec §2 second half: the page SELF-CHECK — radio groups == questions with options ─────────
/** Distinct radio groups of the interview form in a rendered page (the same name = one group). */
export function radioGroupsOf(html) {
  const names = new Set();
  const re = /<input type="radio"[^>]*name="(choice:[^"]+)"/g;
  let m; while ((m = re.exec(html))) names.add(m[1]);
  return names.size;
}
/** { ok, groups, expected } — expected = questions that carry options (answered ones keep theirs, disabled). */
export function selfCheck(page) {
  const expected = page.questions.filter((q) => q.options && q.options.length > 0).length;
  const groups = radioGroupsOf(page.html);
  return { ok: groups === expected, groups, expected };
}

const docCommentBlock = (rel, t) =>
  '<h3>' + t.head.docComment + '</h3>' +
  '<p><textarea data-draft data-doc="' + esc(rel) + '" name="doccomment:' + esc(rel) + '" rows="3" placeholder="' + esc(t.ph.docComment) + '"></textarea></p>';
const noticeCommentBlock = (rel, t) =>
  '<h3>' + t.head.optComment + '</h3>' +
  '<p><textarea data-draft data-doc="' + esc(rel) + '" name="doccomment:' + esc(rel) + '" rows="3" placeholder="' + esc(t.ph.noticeComment(t.btn.read)) + '"></textarea></p>';

function qCard(q, t) {
  const tag = q.answered ? '<span class="tag done">' + t.tag.answered + '</span>'
    : '<span class="tag wait">' + t.tag.unanswered + '</span> <span class="tag you">' + t.tag.you + '</span>';
  const letterRe = new RegExp('^([' + PARSER.letters + '])\\)', 'u');
  const chosenLetter = q.answered && q.existing[0] ? (q.existing[0].match(letterRe) || [])[1] || null : null;
  const opts = q.options.map((o) =>
    '<label class="opt' + (o.recommended ? ' rec' : '') + '"><input type="radio" ' +
    (q.answered ? 'disabled' + (o.letter === chosenLetter ? ' checked' : '') : 'data-draft') +
    ' name="choice:' + esc(q.doc) + ':' + q.id + '" value="' + o.letter + '">' +
    '<div>' + (o.recommended ? '<span class="tag rec">' + t.tag.rec + '</span> ' : '') + o.html + '</div></label>').join('');
  const existing = q.existing.map((x) => '<p><strong>' + t.tag.answered + ':</strong> ' + esc(x) + '</p>').join('');
  const inputs = q.answered
    ? '<p class="addcomment"><textarea data-draft name="comment:' + esc(q.doc) + ':' + q.id + '" rows="2" placeholder="' + esc(t.ph.addComment) + '"></textarea></p>'
    : '<p><input type="text" data-draft name="text:' + esc(q.doc) + ':' + q.id + '" placeholder="' + esc(t.ph.own) + '"></p>' +
      '<p><textarea data-draft name="comment:' + esc(q.doc) + ':' + q.id + '" rows="2" placeholder="' + esc(t.ph.comment) + '"></textarea></p>';
  const meta = q.target ? '<div class="qmeta">' + esc(q.target).replace(/`/g, '') + '</div>' : '';
  return '<section class="qcard' + (q.answered ? ' done' : '') + '">' +
    '<div><strong>' + q.id + '.</strong> ' + esc(q.title) + ' ' + tag + '</div>' +
    (q.bodyHtml ? '<div class="qbody">' + q.bodyHtml + '</div>' : '') + meta + existing + opts + inputs + '</section>';
}

// The card of an OUTBOUND artifact: "reject" is one click, like "approve" — silence is never a decision.
function aCard(a, t) {
  const where = a.target ? '<span class="tag you">' + esc(a.target).replace(/`/g, '') + '</span>' : '';
  if (!a.exists) {
    return '<section class="qcard danger"><div><strong>' + esc(a.id) + '.</strong> ' + where + ' <span class="tag wait">' + t.tag.noBody + '</span></div>' +
      '<p>' + t.art.missing(esc(a.bodyFile)) + '</p></section>';
  }
  const opt = (val, label, cls) =>
    '<label class="opt' + (cls ? ' ' + cls : '') + '"><input type="radio" data-draft name="art:' + esc(a.doc) + ':' + esc(a.id) + '" value="' + val + '"><div>' + label + '</div></label>';
  return '<section class="qcard"><div><strong>' + esc(a.id) + '.</strong> ' + t.art.goesOut + ' ' + where + ' <span class="tag wait">' + t.tag.you + '</span></div>' +
    '<div class="qmeta">' + esc(a.format || 'markdown') + ' · ' + a.bytes + ' ' + t.art.bytes + ' · ' + esc(a.bodyFile) + '</div>' +
    '<div class="qbody outbox">' + a.bodyHtml + '</div>' + opt('approved', t.btn.approve, 'rec') + opt('rejected', t.btn.reject) +
    '<p><textarea data-draft name="artcomment:' + esc(a.doc) + ':' + esc(a.id) + '" rows="2" placeholder="' + esc(t.ph.artComment) + '"></textarea></p></section>';
}

function pageShell(cfg, { title, kind, heading, main, questions, artifacts = [], batch = false, notices = [], noticeDoc = null,
  index = false, face = 'interview', faceDoc = null, paragraphs = [] }) {
  const t = T(cfg);
  const qjson = JSON.stringify(questions).replace(/</g, '\\u003c');
  const singleDoc = batch ? null : ((questions[0] && questions[0].doc) || (artifacts[0] && artifacts[0].doc) || noticeDoc || faceDoc || null);
  const cfgJson = JSON.stringify({
    batch, index, face, aliveMs: ALIVE_INTERVAL_MS, closeMs: AUTOCLOSE_DELAY_MS, reserveMs: AUTOCLOSE_RESERVE_MS,
    notices, paragraphs,
    artifacts: artifacts.map((a) => ({ doc: a.doc, id: a.id, exists: a.exists, sha256: a.sha256 })),
    expectRadioGroups: questions.filter((q) => q.options && q.options.length > 0).length, // spec §2 self-check
    draftKey: 'owner-review:' + (singleDoc || (index ? 'index' : title)), // per DOCUMENT, never per batch
    txt: { draft: t.st.draft(0).replace('0', '{n}'), saving: t.st.saving, saved: t.st.saved('{w}'), nothing: t.st.nothing,
      needArt: t.st.needArt, err: t.st.err('{m}'), serverGone: t.st.serverGone, closeYourself: t.st.closeYourself,
      copied: t.st.copied, copyManually: t.st.copyManually, selfcheck: t.st.selfcheck('{r}', '{q}') },
  }).replace(/</g, '\\u003c');
  // P5: both themes via prefers-color-scheme; colours are variables; contrast is built into the pairs.
  const css = `
  :root { --bg:#f7f7f5; --card:#ffffff; --ink:#1d1d1f; --muted:#6b6b70; --line:#d9d9de;
    --wait:#d97706; --done:#16a34a; --you:#2563eb; --danger:#dc2626; --accent:#2563eb;
    --tagink:#0b1020; --tagwait:#fbbf24; --tagdone:#4ade80; --tagyou:#93c5fd; --tagrec:#86efac; --recbg:rgba(22,163,74,.10); }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#17171a; --card:#212126; --ink:#ececf0; --muted:#a0a0a8; --line:#3a3a42;
      --wait:#f59e0b; --done:#22c55e; --you:#60a5fa; --danger:#f87171; --accent:#60a5fa;
      --tagink:#0b1020; --tagwait:#f59e0b; --tagdone:#22c55e; --tagyou:#60a5fa; } }
  * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.55 system-ui, "Segoe UI", sans-serif; }
  /* The header SCROLLS WITH THE PAGE — the owner's word (2026-09-05): not sticky. Only the emergency banner may pin. */
  header { position:static; background:var(--card); border-bottom:1px solid var(--line); padding:10px 20px; display:flex; gap:12px; align-items:baseline; z-index:5; flex-wrap:wrap }
  header .project { font-weight:700; color:var(--accent) } .kind { color:var(--muted) } .langnote { font-size:12px; color:var(--muted) }
  main { max-width:900px; margin:0 auto; padding:16px 20px 120px }
  .doc { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:8px 22px; overflow-x:auto }
  .doc pre { background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px; overflow-x:auto }
  .doc code { background:var(--bg); padding:1px 4px; border-radius:4px }
  .doc table { border-collapse:collapse; margin:8px 0 } .doc th,.doc td { border:1px solid var(--line); padding:4px 8px }
  .doc blockquote { border-left:3px solid var(--line); margin:8px 0; padding:2px 12px; color:var(--muted) }
  .qcard { background:var(--card); border:1px solid var(--line); border-left:5px solid var(--wait); border-radius:10px; padding:12px 16px; margin:14px 0 }
  .qcard.done { border-left-color:var(--done) } .qcard.done > * { opacity:.72 } .qcard.done .addcomment { opacity:1 }
  .tag { font-size:12px; padding:2px 8px; border-radius:99px; color:var(--tagink); font-weight:600 }
  .tag.wait { background:var(--tagwait) } .tag.done { background:var(--tagdone) } .tag.you { background:var(--tagyou) } .tag.rec { background:var(--tagrec) }
  .opt.rec { background:var(--recbg); border-radius:10px; padding:6px 10px; margin-left:-10px }
  .tag.notice { background:var(--muted) }
  .noticehead { margin-top:28px; padding-top:10px; border-top:2px solid var(--line) }
  .group.notice { border-left:5px solid var(--muted); border-radius:10px; padding-left:14px }
  .cards { display:grid; gap:14px }
  .card { display:grid; gap:6px; padding:18px 20px; background:var(--card); border:1px solid var(--line); border-left:6px solid var(--wait); border-radius:12px; text-decoration:none; color:var(--ink) }
  .card:hover { border-color:var(--accent); border-left-color:var(--accent) } .card.notice { border-left-color:var(--you) }
  .ckind { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted) } .ctitle { font-size:19px; font-weight:600; line-height:1.35 }
  .cmeta { font-size:13px; color:var(--muted); font-family:ui-monospace,Consolas,monospace } .cpend { font-size:14px; color:var(--wait); font-weight:600 }
  .card.notice .cpend { color:var(--you) } .cgo { font-size:14px; color:var(--accent) }
  .opt { display:flex; gap:12px; align-items:flex-start; margin:10px 0; cursor:pointer }
  .opt input[type=radio] { width:22px; height:22px; flex:0 0 auto; margin-top:0; accent-color:var(--accent); cursor:pointer }
  .opt div p { margin:2px 0 } .qbody p { margin:6px 0 } .qmeta { font-size:13px; color:var(--muted); margin:6px 0 }
  .outbox { background:var(--bg); border:1px solid var(--line); border-radius:10px; padding:10px 14px; margin:10px 0; max-height:60vh; overflow:auto }
  .qcard.danger { border-left-color:var(--danger) }
  /* proofreading: paragraph cards with their id in the margin; mockup: the image at page width */
  .pcard { background:var(--card); border:1px solid var(--line); border-left:5px solid var(--you); border-radius:10px; padding:10px 16px; margin:12px 0 }
  .pid { font-size:12px; color:var(--muted); font-family:ui-monospace,Consolas,monospace } .ptext p { margin:6px 0 }
  .mock { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px; margin:10px 0; text-align:center }
  .mock img { max-width:100%; height:auto }
  textarea, input[type=text] { width:100%; background:var(--bg); color:var(--ink); border:1px solid var(--line); border-radius:8px; padding:8px; font:inherit }
  .bar { position:fixed; bottom:0; left:0; right:0; background:var(--card); border-top:1px solid var(--line); padding:10px 20px; display:flex; gap:14px; align-items:center; justify-content:center; text-align:center }
  .bar #status { flex:0 1 auto }
  button { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:9px 18px; font:inherit; cursor:pointer } button:disabled { opacity:.5; cursor:default }
  button.ghost { background:transparent; color:var(--accent); border:1px solid var(--accent) }
  .err { color:var(--danger); font-weight:600 } .okmsg { color:var(--done); font-weight:600 }
  #rescue { display:none; border:2px solid var(--danger); border-radius:10px; padding:12px; margin:14px 0 }
  #banner { display:none; position:sticky; top:0; background:var(--danger); color:#fff; padding:8px 20px; font-weight:600; z-index:6 }`;

  // Page JS — single quotes and concatenation, NOT ONE backtick (T7). Texts come from CFG.txt.
  const js = [
    "var CFG=" + cfgJson + ";var QS=" + qjson + ";",
    "var $=function(s){return document.querySelector(s)};var TX=CFG.txt;",
    "function fmt(s,o){for(var k in o)s=s.replace('{'+k+'}',o[k]);return s}",
    "function status(msg,cls){var s=$('#status');s.textContent=msg;s.className=cls||''}",
    // I12: the browser draft — every field in localStorage, restored with a note
    "var DK=CFG.draftKey+':';",
    "function saveDraft(el){try{localStorage.setItem(DK+el.name,el.type==='radio'?(el.checked?el.value:''):el.value)}catch(e){}}",
    "function restoreDraft(){var n=0;var els=document.querySelectorAll('[data-draft]');",
    " for(var i=0;i<els.length;i++){var el=els[i];var v=null;try{v=localStorage.getItem(DK+el.name)}catch(e){}",
    "  if(v===null||v==='')continue;",
    "  if(el.type==='radio'){if(el.value===v&&!el.checked){el.checked=true;n++}}else if(!el.value){el.value=v;n++}}",
    " if(n>0)status(fmt(TX.draft,{n:n}),'okmsg')}",
    // P3: a radio cleared by a second click; activation taken over on pointerdown (no native double click)
    "document.addEventListener('pointerdown',function(e){var lab=e.target&&e.target.closest?e.target.closest('label.opt'):null;",
    " if(!lab)return;var inp=lab.querySelector('input[type=radio]');if(!inp||inp.disabled)return;",
    " e.preventDefault();var was=inp.checked;",
    " if(e.target===inp){inp.checked=!was}else if(!was){inp.checked=true}",
    " saveDraft(inp)});",
    "document.addEventListener('input',function(e){if(e.target&&e.target.hasAttribute&&e.target.hasAttribute('data-draft'))saveDraft(e.target)});",
    "function fieldVal(name){var el=document.getElementsByName(name)[0];return el?el.value:''}",
    "function collect(doc){var answers={};for(var i=0;i<QS.length;i++){var q=QS[i];",
    " if(q.doc!==doc)continue;",
    " var com=fieldVal('comment:'+doc+':'+q.id);",
    " if(q.answered){if(com.trim())answers[q.id]={choice:'',text:'',comment:com.trim()};continue}", // an answered question yields only its extra comment
    " var chosen='';var rs=document.getElementsByName('choice:'+doc+':'+q.id);",
    " for(var j=0;j<rs.length;j++)if(rs[j].checked)chosen=rs[j].value;",
    " var own=fieldVal('text:'+doc+':'+q.id);",
    " if(chosen||own.trim()||com.trim())answers[q.id]={choice:chosen,text:own.trim(),comment:com.trim()}}",
    " var arts={};var A=CFG.artifacts||[];",
    " for(var k=0;k<A.length;k++){var a=A[k];if(a.doc!==doc||!a.exists)continue;",
    "  var st='';var ars=document.getElementsByName('art:'+doc+':'+a.id);",
    "  for(var m=0;m<ars.length;m++)if(ars[m].checked)st=ars[m].value;",
    "  var ac=fieldVal('artcomment:'+doc+':'+a.id).trim();",
    "  if(st||ac)arts[a.id]={status:st,sha256:a.sha256,comment:ac}}", // a remark without a status is kept too (I10)
    " var p={doc:doc,answers:answers,comment:fieldVal('doccomment:'+doc),face:CFG.face};",
    " for(var z in arts){p.artifacts=arts;break}",
    // proofreading: one comment per paragraph, empty ones dropped
    " if(CFG.face==='proofread'){var cm={};for(var pi=0;pi<CFG.paragraphs.length;pi++){var pid=CFG.paragraphs[pi];var pv=fieldVal('para:'+doc+':'+pid).trim();if(pv)cm[pid]=pv}p.comments=cm}",
    " return p}",
    // I10/I11: loud refusal + rescue ring; buttons active again, the text returns to the human
    "function rescue(payload,msg){status(fmt(TX.err,{m:msg}),'err');var r=$('#rescue');r.style.display='block';",
    " $('#rescuetext').value=JSON.stringify(payload,null,2);enableButtons(true)}",
    "function enableButtons(on){var bs=document.querySelectorAll('button');for(var i=0;i<bs.length;i++)bs[i].disabled=!on}",
    "var saved=false,closeTimer=null,lastPayload=null;",
    "function isNotice(doc){var n=CFG.notices||[];for(var i=0;i<n.length;i++)if(n[i]===doc)return true;return false}",
    "function hasArtifacts(doc){var A=CFG.artifacts||[];for(var i=0;i<A.length;i++)if(A[i].doc===doc&&A[i].exists)return true;return false}",
    "function hasComments(p){for(var k in (p.comments||{}))return true;return false}",
    "function doSave(doc){var p=collect(doc);if(isNotice(doc))p.read=true;lastPayload=p;",
    " if(!p.read&&CFG.face!=='mockup'&&Object.keys(p.answers).length===0&&!(p.comment||'').trim()&&!p.artifacts&&!hasComments(p)){",
    "  status(hasArtifacts(doc)?TX.needArt:TX.nothing,'err');return}",
    " if(CFG.face==='mockup'&&!(p.comment||'').trim()){status(TX.nothing,'err');return}",
    " enableButtons(false);status(TX.saving);",
    " fetch('/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})",
    " .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})",
    " .then(function(res){if(!res.ok||!res.j.ok){rescue(p,res.j.reason||'server refused');return}",
    "  saved=true;status(fmt(TX.saved,{w:res.j.written}),'okmsg');",
    "  try{var ks=[];for(var i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));",
    "   for(var k=0;k<ks.length;k++)if(ks[k].indexOf(DK)===0)localStorage.removeItem(ks[k])}catch(e){}",
    // I27/DEF2: auto-close is an ATTEMPT; a refusal → an honest request; cancelled by pagehide
    "  setTimeout(function(){window.close();closeTimer=setTimeout(function(){status(TX.closeYourself,'err')},CFG.reserveMs)},CFG.closeMs)})",
    " .catch(function(e){rescue(p,String(e))})}",
    "document.addEventListener('click',function(e){var t=e.target;",
    " if(t&&t.classList&&t.classList.contains('savedoc'))doSave(t.getAttribute('data-doc'));",
    " if(t&&t.id==='retry'&&lastPayload)doSave(lastPayload.doc)});",
    "var single=$('#save');if(single)single.addEventListener('click',function(){doSave(single.getAttribute('data-doc'))});",
    "var cp=$('#copybtn');if(cp)cp.addEventListener('click',function(){var t=$('#rescuetext');t.select();",
    " try{document.execCommand('copy');status(TX.copied,'okmsg')}catch(e){status(TX.copyManually,'err')}});",
    // I13/DEF4: page→server pulse — the human learns of a dead server AT ONCE and out loud
    "function pulse(){fetch('/alive').then(function(r){if(!r.ok)throw 0;if(!selfBroken)$('#banner').style.display='none'})",
    " .catch(function(){var b=$('#banner');b.style.display='block';b.textContent=TX.serverGone;",
    "  var r=$('#rescue');r.style.display='block';",
    "  if(lastPayload)$('#rescuetext').value=JSON.stringify(lastPayload,null,2);enableButtons(true)})}",
    "setInterval(pulse,CFG.aliveMs);pulse();",
    // I14/DEF6: closing the page is an EVENT for the server (fast path — the beacon names the window role)
    "window.addEventListener('pagehide',function(){if(closeTimer)clearTimeout(closeTimer);",
    " try{navigator.sendBeacon('/closed',(CFG.index?'index':'doc')+':'+(saved?'saved':'unsaved'))}catch(e){}});",
    "if(CFG.index)window.addEventListener('focus',function(){location.reload()});",
    // spec §2: the page SELF-CHECK — radio groups == questions with options; a mismatch is LOUD, never silent
    "var selfBroken=false;(function(){if(CFG.face!=='interview'||CFG.index)return;var rs=document.querySelectorAll('input[type=radio]');var names={};",
    " for(var i=0;i<rs.length;i++)if(rs[i].name.indexOf('choice:')===0)names[rs[i].name]=1;var n=Object.keys(names).length;",
    " if(n!==CFG.expectRadioGroups){selfBroken=true;var b=$('#banner');b.style.display='block';b.textContent=fmt(TX.selfcheck,{r:n,q:CFG.expectRadioGroups});enableButtons(false)}})();",
    "restoreDraft();",
  ].join('\n');

  const saveLabel = face === 'proofread' || face === 'mockup' ? t.btn.done : t.btn.save;
  const saveBar = index
    ? '<div class="bar" style="display:none"><div id="status"></div></div>'
    : noticeDoc
      ? '<div class="bar"><button id="save" type="button" data-doc="' + esc(noticeDoc) + '">' + t.btn.read + '</button><div id="status">' + t.st.noticeHint + '</div></div>'
      : '<div class="bar"><button id="save" type="button" data-doc="' + esc(singleDoc || '') + '">' + saveLabel + '</button><div id="status"></div></div>';
  const langNote = t.fallbackFrom ? '<span class="langnote">' + esc(t.head.langFallback(t.fallbackFrom)) + '</span>' : '';

  return '<!doctype html>\n<html lang="' + esc(cfg.language) + '"><head><meta charset="utf-8">' +
    '<title>' + esc(cfg.projectName) + ' · ' + esc(title) + '</title>' +
    '<link rel="icon" href="data:,"><style>' + css + '</style></head><body>' +
    '<header><span class="project">' + esc(cfg.projectName) + '</span>' + heading + langNote + '</header>' + // P9
    '<div id="banner"></div><main>' + main +
    '<div id="rescue"><p class="err">' + t.st.rescue + '</p><textarea id="rescuetext" rows="8"></textarea>' +
    '<p><button class="ghost" id="copybtn" type="button">' + t.btn.copy + '</button> <button class="ghost" id="retry" type="button">' + t.btn.retry + '</button></p></div>' +
    '</main>' + saveBar + '<script>' + js + '</script></body></html>';
}

// ── The window (DEF8): an app window when a Chromium browser is found, else the default browser,
// else an honest "open it yourself: URL" — the contour never pretends a window opened. ───────
function openWindow(url, log = console.log) {
  const tryCmd = (cmd, args) => { try { return spawnSync(cmd, args, { stdio: 'ignore', timeout: BEEP_DEADLINE_MS }).status === 0; } catch { return false; } };
  if (IS_WIN) {
    const tryApp = (exe) => tryCmd('cmd.exe', ['/c', 'start', '', exe, '--app=' + url, '--window-size=' + WINDOW_SIZE]);
    if (tryApp('msedge')) return 'edge --app';
    if (tryApp('chrome')) return 'chrome --app';
    if (tryCmd('cmd.exe', ['/c', 'start', '', url])) { log('Could not raise an app window — opened a plain tab; please close it yourself (DEF8).'); return 'tab'; }
  } else if (IS_MAC) {
    if (tryCmd('open', ['-na', 'Google Chrome', '--args', '--app=' + url, '--window-size=' + WINDOW_SIZE])) return 'chrome --app';
    if (tryCmd('open', [url])) { log('Could not raise an app window — opened the default browser; please close it yourself (DEF8).'); return 'browser'; }
  } else {
    for (const exe of ['google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge'])
      if (tryCmd(exe, ['--app=' + url, '--window-size=' + WINDOW_SIZE])) return exe + ' --app';
    if (tryCmd('xdg-open', [url])) { log('Could not raise an app window — opened the default browser; please close it yourself (DEF8).'); return 'browser'; }
  }
  log('NO WINDOW OPENED — open it yourself: ' + url + ' (no browser found on this machine; the page is served until you answer or close it).');
  return 'none';
}

// ── The lock "one document — one window" (I29) ────────────────────────────────────────────────
const lockPath = (root, key) => join(decisionsAbs(root), key.replace(/\.[^.]+$/u, '') + '.lock');
function checkLock(root, key) {
  const p = lockPath(root, key);
  if (!existsSync(p)) return null;
  try { const lock = JSON.parse(readFileSync(p, 'utf8')); process.kill(lock.pid, 0); return lock; }
  catch { rmSync(p, { force: true }); return null; } // a stale lock is removed
}

// ── The server: raise → show → call → wait → record → die (I8) ───────────────────────────────
export function serveContour(root, { docPath = null, batch = false, notice = false, face = 'interview' }, opts = {}) {
  const cfg = cfgOf(root), t = T(cfg);
  const { open = true, signal = true, timeoutMs = 0, log = console.log, includeStale = false } = opts; // I9: default 0 — no timeout
  // A single document with no recognised questions and no outbound is served as a NOTICE automatically
  // (a page where no action is legal is a defect — origin bugs/105); the interview face only.
  if (docPath && !batch && !notice && face === 'interview') {
    try {
      const mdAuto = readFileSync(resolve(root, docPath), 'utf8');
      const metaAuto = parseMetaBlock(mdAuto);
      if (parseQuestions(mdAuto).length === 0 && !(metaAuto && metaAuto.artifacts && metaAuto.artifacts.length)) {
        notice = true;
        log('The document has no recognised questions and no outbound — showing it as a notice (I37).');
      }
    } catch { /* an unreadable document fails below with its own voice */ }
  }
  return new Promise((resolveP) => {
    const forOwner = () => ownerDocs(root, { includeStale });
    const build = () => batch ? buildIndexPage(root, forOwner(), pendingNotices(root))
      : notice ? buildNoticePage(root, docPath)
        : face === 'proofread' ? buildProofreadPage(root, docPath)
          : face === 'mockup' ? buildMockupPage(root, docPath) : buildPage(root, docPath);
    const buildDoc = (rel) => (readQueue(root).some((i) => i.doc === rel && isNoticeItem(i)) ? buildNoticePage(root, rel) : buildPage(root, rel));
    const first = build();
    const lockKey = batch ? '_queue' : basename(docPath);
    const held = checkLock(root, lockKey);
    if (held) {
      log('Already open by this contour: ' + held.url + ' (pid ' + held.pid + ') — not raising a second window (I29).');
      resolveP({ outcome: 'already-open', url: held.url, exitCode: EXIT_DECIDED });
      return;
    }
    let outcome = null, beaconTimer = null, lastAlive = Date.now(), strikes = 0;
    const startedAt = Date.now();
    const noticeMode = notice && !batch;
    const unreadOutcome = () => (noticeMode ? 'notice left unread' : 'page closed without an answer');
    const unreadSuffix = noticeMode ? ' The notice is NOT delivered (no "' + t.btn.read + '" mark, I38) — it repeats in the next batch.' : '';
    const server = createServer((req, res) => {
      const ok = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(build().html); // I1: always a fresh build from the source
      } else if (req.method === 'GET' && batch && req.url.startsWith('/d/')) {
        const rel = decodeURIComponent(req.url.slice('/d/'.length)); // only documents of the current queue
        const allowed = pendingDocs(root).some((d) => d.doc === rel) || pendingNotices(root).some((n) => n.doc === rel);
        if (!allowed) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not in the queue: ' + rel); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildDoc(rel).html);
      } else if (req.method === 'GET' && req.url === '/alive') {
        lastAlive = Date.now(); strikes = 0;
        if (beaconTimer) { clearTimeout(beaconTimer); beaconTimer = null; } // the page came back (T3)
        ok({ ok: true });
      } else if (req.method === 'POST' && req.url === '/decide') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          try { // I10: any refusal is loud, with the reason on the page
            const payload = JSON.parse(body);
            const doc = batch ? payload.doc : relDoc(root, docPath);
            const hasAnswers = payload.answers && Object.keys(payload.answers).length > 0;
            // NON-EMPTY ANSWERS OUTRANK ANY CLASSIFICATION (origin bugs/106): the owner's work is never dropped.
            const asNotice = !hasAnswers && ((notice && !batch) || readQueue(root).some((i) => i.doc === doc && isNoticeItem(i)));
            if (asNotice) { // I37: the "read" mark is a NORMAL outcome, exit 0
              const record = recordDecision(root, doc, { kind: KIND_NOTICE, comment: payload.comment }, cfg);
              markNoticeRead(root, doc); // I38: delivery is proven by the mark, and only by it
              const withComment = record.comment ? ' + comment' : '';
              ok({ ok: true, written: t.kind.notice + ' — ' + doc + withComment });
              outcome = 'notice read';
              const restN = pendingNotices(root).length;
              log('Outcome: notice read (' + doc + ', by ' + record.by + withComment + ') — ending the contour (I8).' +
                (restN > 0 ? ' Unread notices left: ' + restN + ' — restarting the batch is the agent\'s duty.' : ''));
              setTimeout(finish, SERVER_DEATH_MS, EXIT_DECIDED);
              return;
            }
            if (!batch && (face === 'proofread' || face === 'mockup')) {
              const record = recordDecision(root, doc, { kind: face, comment: payload.comment, comments: payload.comments }, cfg);
              const n = Object.keys(record.comments || {}).length;
              ok({ ok: true, written: doc + ' + decision.json + archive (' + (face === 'proofread' ? n + ' paragraph comment(s)' : 'mockup comment') + ')' });
              outcome = 'decision recorded';
              log('Outcome: ' + face + ' recorded (' + doc + ', ' + (face === 'proofread' ? n + ' paragraph comments' : 'comment') + ', by ' + record.by + ') — ending the contour (I8).');
              setTimeout(finish, SERVER_DEATH_MS, EXIT_DECIDED);
              return;
            }
            const record = recordDecision(root, doc, { answers: payload.answers, comment: payload.comment, artifacts: payload.artifacts }, cfg);
            const nAns = Object.keys(record.answers || {}).length;
            const arts = Object.entries(record.artifacts || {});
            const nApproved = arts.filter(([, a]) => a.status === 'approved').length;
            const rest = batch ? pendingDocs(root).filter((d) => d.unanswered > 0).length : 0;
            const artWord = arts.length ? ', outbound decided ' + arts.length + ' (approved ' + nApproved + ')' : '';
            ok({ ok: true, written: doc + ' + decision.json + archive (' + nAns + ' answer(s)' + artWord + ')', more: rest, doc });
            outcome = 'decision recorded';
            const answersWord = Object.entries(record.answers || {}).map(([q, a]) => q + ' = ' + (a.choice || (a.text ? 'text' : 'comment'))).join(', ');
            if (arts.length) log('Outbound decision: ' + arts.map(([id, a]) => id + ' — ' + a.status).join(', ') + '. Sending is a separate agent step through a gate that calls the same checkApproval.');
            if (rest > 0) { // the batch does NOT end on the first document (origin bugs/52)
              log('Recorded: ' + doc + ' (' + answersWord + ', by ' + record.by + '). Documents left in the queue: ' + rest + ' — the page STAYS open, the contour waits.');
              outcome = null;
              return;
            }
            log('Outcome: decision recorded (' + doc + ': ' + (answersWord || 'comment only') + ', by ' + record.by + ') — ending the contour (I8).');
            setTimeout(finish, SERVER_DEATH_MS, EXIT_DECIDED); // DEF3: the window has time to close
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, reason: String(e.message || e) }));
            log('SAVE ERROR (the page shows the rescue ring): ' + e.message);
          }
        });
      } else if (req.method === 'POST' && req.url === '/closed') {
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          ok({ ok: true });
          if (outcome) return; // already recorded — death on schedule (DEF3)
          if (batch && !String(body).startsWith('index')) { log('A document window closed — the queue entry page stays, the contour waits.'); return; }
          if (beaconTimer) clearTimeout(beaconTimer);
          beaconTimer = setTimeout(() => { // T3: ~3 s — does the page come back after a reload?
            outcome = unreadOutcome();
            log('Outcome: page closed without an answer — ending the contour (I14, beacon fast path).' + unreadSuffix);
            finish(EXIT_CLOSED);
          }, BEACON_RELOAD_GRACE_MS);
        });
      } else { res.writeHead(404); res.end(); }
    });
    // I14/DEF6: the silence watch — patience lives while the page lives; two strikes against sleep (T5)
    const watch = setInterval(() => {
      if (outcome) return;
      if (Date.now() - lastAlive > SILENCE_THRESHOLD_MS) {
        strikes += 1;
        if (strikes >= SILENCE_STRIKES_TO_DIE) {
          outcome = unreadOutcome();
          log('Outcome: the page has been silent longer than ' + (SILENCE_THRESHOLD_MS / 60000) + ' min (two strikes) — ending the contour (I14, silence watch).' + unreadSuffix);
          finish(EXIT_CLOSED);
        }
      } else strikes = 0;
      if (timeoutMs > 0 && Date.now() - startedAt > timeoutMs) { // DEF5: automation only
        outcome = unreadOutcome();
        log('Outcome: tolerated SILENCE exhausted (--timeout, automation only; not a deadline for thinking) — ending.' + unreadSuffix);
        finish(EXIT_CLOSED);
      }
    }, SILENCE_TICK_MS);
    const finish = (code) => {
      clearInterval(watch);
      rmSync(lockPath(root, lockKey), { force: true });
      server.close(() => resolveP({ outcome, exitCode: code }));
      setTimeout(() => resolveP({ outcome, exitCode: code }), 1000).unref();
    };
    process.once('SIGINT', () => { // I25: the third outcome — interrupted by the human
      outcome = 'interrupted by the human';
      log('Outcome: interrupted by the human (SIGINT).');
      finish(EXIT_INTERRUPTED);
    });
    server.listen(0, '127.0.0.1', () => { // I30: a free port, never a fixed one
      const url = 'http://127.0.0.1:' + server.address().port + '/';
      mkdirSync(decisionsAbs(root), { recursive: true });
      writeFileSync(lockPath(root, lockKey), JSON.stringify({ pid: process.pid, url, startedAt: provenance().at }) + '\n', 'utf8');
      log('Page is up: ' + url + (batch ? ' (queue)' : ' (' + first.title + ')'));
      if (open) log('Window: ' + openWindow(url, log)); // showing is the agent's action (I15)
      if (open) { // I40: the fact of showing — at the moment of the open window
        const shownRels = batch ? forOwner().map((d) => d.doc) : [relDoc(root, docPath)];
        recordShown(root, shownRels, batch ? t.transport.batch : t.transport.page);
        log('Shown recorded (I40): ' + shownRels.length + ' doc(s) → ' + cfg.decisionsDir + '/' + SHOWN_FILE);
      }
      if (signal) { // I5: the call — AFTER the page is up; I32: it never blocks the contour
        const nWait = first.questions ? first.questions.filter((q) => !q.answered).length : 0;
        signalCall(root, callPhrase({
          batch, notice: noticeMode, face, kind: first.kind, title: first.title, nWait,
          nDocs: batch ? forOwner().length + (first.notices || 0) : 1, nQuestions: first.total || 0, nNotices: first.notices || 0,
        }, cfg), { log });
      }
      serveContour._onUp && serveContour._onUp(url); // hook for a QA run
    });
  });
}

// ── Pre-flight + self-check as one gate (spec §2), used by the CLI before any page opens ───────
/** Returns null when the document may open, else the lines to print before exit 3. */
export function gateForOpen(root, docPath) {
  const md = readFileSync(resolve(root, docPath), 'utf8');
  const problems = preflight(md);
  if (problems.length) return ['PRE-FLIGHT REFUSED TO OPEN (spec §2, exit 3):', ...problems.map((p) => '  ' + p)];
  const meta = parseMetaBlock(md);
  if (parseQuestions(md).length === 0 && !(meta && meta.artifacts && meta.artifacts.length)) return null; // notice class, no radios owed
  const page = buildPage(root, docPath);
  const sc = selfCheck(page);
  if (!sc.ok) return ['PAGE SELF-CHECK FAILED (spec §2, exit 3): radio groups ' + sc.groups + ' for ' + sc.expected + ' question(s) with options — a broken page is never shown silently.'];
  return null;
}

// ── Selftest (no browser): pre-flight red on the "options as paragraphs" fixture, green on the
// canonical forms; the three faces render; records land in three places; the fact of showing ────
export function selftest(log = console.log) {
  let n = 0, bad = 0;
  const ok = (cond, name) => { n++; if (!cond) { bad++; log('  x ' + name); } else log('  v ' + name); };
  const root = mkdtempSync(join(tmpdir(), 'kaif-contour-'));
  mkdirSync(join(root, '.kaif'), { recursive: true });
  mkdirSync(join(root, 'interviews'), { recursive: true });
  mkdirSync(join(root, 'docs'), { recursive: true });
  // parameters are READ (#97): language + project name from the marker, owner from the identity table
  writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.6', language: 'en', projectName: 'Probe Project' }) + '\n');
  writeFileSync(join(root, 'AGENT_GUIDE.md'), '# Guide\n\n| Field | Value |\n|---|---|\n| **Author / owner** | Jane Owner aka **JO** · second form |\n');
  const cfg = cfgOf(root);
  ok(cfg.projectName === 'Probe Project' && cfg.ownerName === 'Jane Owner aka JO' && cfg.language === 'en' && cfg.decisionsDir === 'interviews/decisions',
    'config is read, never asked: project name from kaif.json, owner from the identity table, canon decisions dir');
  ok(texts('de').fallbackFrom === 'de' && texts('ru').lang === 'ru' && texts('ru').btn.save !== texts('en').btn.save,
    'texts: RU and EN ship, an unknown language falls back to EN and says so');

  // C3: four faces — one hash
  const base = 'Line one\nLine two\n';
  const faces = ['﻿' + base, base.replace(/\n/g, '\r\n'), base + '\n\n', base.replace(/\n$/, '')];
  ok(new Set(faces.map(bodyHash)).size === 1 && bodyHash('other') !== bodyHash(base), 'normalisation: four faces (BOM/CRLF/tail/no newline) — one hash');
  // I6: quiet hours across midnight
  const at = (h, m) => new Date(2026, 7, 7, h, m);
  ok(inQuietHours(at(23, 30), '23:00', '09:00') && inQuietHours(at(3, 0), '23:00', '09:00') && !inQuietHours(at(12, 0), '23:00', '09:00'),
    'quiet hours: 23:30 and 03:00 inside 23:00–09:00, noon outside');
  ok(!inQuietHours(at(3, 0), null, null), 'quiet hours: no window — never quiet');

  // C4: parsing rules
  const fx = '# Interview #099\n\n> Status: awaiting\n\n### Q1. Which?\n\n- **A) (Recommended)** first line\n  second line of the option\n- **B)** short\n\n**Answer:**\n\n---\ntail after the rule\n\n### Q2. Second?\n\n**Counter-question:** why?\n\n**Answer:** A\n';
  const qs = parseQuestions(fx);
  ok(qs.length === 2 && qs[0].options.length === 2 && qs[0].options[0].text.includes('second line'), 'parse: two questions, a multi-line option (rule 3)');
  ok(!qs[0].answered && qs[1].answered && qs[1].answers.length === 1, 'parse: empty Answer is open, the rule closed the block, a counter-question is not an answer (rules 1–2)');
  ok(parseQuestions(fx.replace('awaiting', 'ANSWERS RECEIVED'))[0].answered, 'parse: a closed status closes an empty question too (rule 4)');
  ok(!parseQuestions('# I\n\n> Status: awaiting\n\n### Q1. Q?\n\n**Answer:**\n\n**Owner\'s comment (today):** a thought, not an answer\n')[0].answered,
    'parse: an owner comment under an empty Answer is NOT the answer');
  const fxTable = '# I\n\n> Status: awaiting\n\n### Q1. Q?\n\n| Option | Meaning | Price |\n|---|---|---|\n| **A (Recommended)** | note inside bold | a |\n| **B** (note) | note after bold | b |\n| **C** | bare letter | c |\n\n**Answer:**\n';
  ok(parseQuestions(fxTable)[0].options.map((o) => o.letter).join('') === 'ABC', 'parse: table rows are options, notes in brackets on either side of the bold');
  ok(parseQuestions('# I\n\n### Q1. Q?\n\n| System | State |\n|---|---|\n| **Antigravity** | alive |\n| **Basis** | alive |\n\n**Answer:**\n')[0].options.length === 0,
    'parse: a data table with bold words is NOT a fork');
  ok(docStatus('> Status: not answered yet') !== 'closed' && docStatus('> Status: no ANSWERS RECEIVED yet') !== 'closed' && docStatus('> Status: DONE, ANSWERS RECEIVED') === 'closed',
    'status: a negation outranks the tick; markup, not a bare word');
  ok(docStatus('# I\n\n### Q1. Q?\n') === 'none', 'status: no status line — the document is LIVE by default');
  const html = renderMd('# Title <b>\n\ntext <!-- secret --> on\n\n```\ninside <!-- content -->\n```\n');
  ok(html.includes('&lt;b&gt;') && !html.includes('secret') && html.includes('inside &lt;!-- content --&gt;'), 'render: escaping first, comments cut outside code and kept inside (I24)');

  // spec §2: PRE-FLIGHT — the #51 fixture "options as paragraphs" is RED (exit 3 in the CLI)
  const BAD = 'interviews/interview_051_paragraphs.md';
  writeFileSync(join(root, BAD), '# Interview #051 — the field defect\n\n> Status: awaiting the owner\n\n### Q1. Which one?\n\n**A. First option** — typed as a paragraph, not a list item.\n\n**B. Second option** — also a paragraph.\n\n**Answer:**\n');
  const pre = preflight(readFileSync(join(root, BAD), 'utf8'));
  ok(pre.length === 1 && /^Q1: 0 option/.test(pre[0]) && pre[0].includes('- **A)**'), 'pre-flight is RED on the "options as paragraphs" fixture (#051): Q1 named, the fix form printed (exit 3)');
  const gate = gateForOpen(root, BAD);
  ok(Array.isArray(gate) && gate[0].includes('exit 3'), 'the open gate refuses the #051 fixture before any page');
  const GOOD = 'interviews/interview_052_canonical.md';
  writeFileSync(join(root, GOOD), '# Interview #052 — canonical\n\n> Status: awaiting the owner\n\n### Q1. Which one?\n\nAgent\'s recommendation: B\n\n- **A)** first\n- **B)** second\n- **C)** your own answer\n\n**Answer:**\n\n### Q2. Name it?\n\n<!-- questions-guard:no-scenario naming question, taste -->\n\n**Answer:**\n');
  ok(preflight(readFileSync(join(root, GOOD), 'utf8')).length === 0, 'pre-flight is GREEN on list options and on a declared free field');
  ok(preflight(fxTable).length === 0, 'pre-flight is GREEN on table options');
  ok(preflight(fx.replace('awaiting', 'ANSWERS RECEIVED').replace(/- \*\*[AB]\)[^\n]*\n(  [^\n]*\n)?/g, '')).length === 0, 'pre-flight exempts answered questions (closed document)');

  // the interview page: a radio per option, the recommended chip, header static, self-check green
  const page = buildPage(root, GOOD);
  ok(radioGroupsOf(page.html) === 1 && (page.html.match(/type="radio"/g) || []).length === 3, 'interview page: one radio group of three for Q1, none for the free-field Q2');
  ok(selfCheck(page).ok && gateForOpen(root, GOOD) === null, 'self-check: radio groups == questions with options → the gate opens');
  ok(!selfCheck({ ...page, html: page.html.replace(/<input type="radio"[^>]*>/g, '') }).ok, 'self-check goes RED on a page whose radios were stripped (mutation on a copy)');
  ok(/header \{ position:static;/.test(page.html) && page.html.includes('<html lang="en">') && page.html.includes('Probe Project'), 'page: header scrolls with the page (position:static), lang and project name from the marker');
  ok(page.html.includes('class="tag rec"') && page.html.includes('id="rescue"') && page.html.includes("localStorage") && page.html.includes("'/alive'"), 'page: recommendation chip, rescue ring, browser draft, /alive pulse');
  ok(!/`/.test(page.html.slice(page.html.indexOf('<script>'))), 'T7: no backtick in the page script');

  // C6/I2: the decision lands in THREE places; the owner's answer is written back; by = owner from the table
  const rec = recordDecision(root, GOOD, { answers: { Q1: { choice: 'B', text: '', comment: 'fine' } }, comment: 'overall ok' }, cfg, new Date(2026, 8, 5, 22, 0));
  const after = readFileSync(join(root, GOOD), 'utf8');
  ok(/\*\*Answer:\*\* B\) <!-- owner-review: by Jane Owner aka JO/.test(after) && after.includes("Owner's comment (5 September 2026, 22:00"), 'record: the answer and the dated comment are written back into the md, by the owner from the table');
  ok(existsSync(join(root, 'interviews', 'decisions', 'interview_052_canonical.decision.json')) && readdirSync(join(root, 'interviews', 'decisions', 'archive')).length === 1 && rec.by === 'Jane Owner aka JO',
    'record: decision.json + one archive copy');
  ok(parseQuestions(after)[0].answered && buildPage(root, GOOD).html.includes('disabled checked'), 'after the record the question is answered and the page shows the chosen radio, disabled');
  const rec2 = recordDecision(root, GOOD, { answers: { Q1: { choice: 'A', text: '', comment: '' } } }, cfg, new Date(2026, 8, 5, 22, 1));
  ok(readFileSync(join(root, GOOD), 'utf8').includes('**Answer (follow-up, 5 September 2026, 22:01') && rec2.at !== rec.at, 'a second answer never overwrites the first — a dated follow-up (I2)');

  // I37/I38: the notice class — state machine, page form, batch order
  const NOTICE = 'docs/report.md';
  writeFileSync(join(root, NOTICE), '﻿# Night report\r\n\r\nThree backlog items closed.\r\n');
  const beforeN = readFileSync(join(root, NOTICE), 'utf8');
  enqueue(root, NOTICE, { kind: KIND_NOTICE });
  ok(pendingNotices(root).length === 1 && !pendingDocs(root).some((d) => d.doc === NOTICE), 'notice: registered in its own group, never among the questions');
  const np = buildNoticePage(root, NOTICE);
  ok(np.html.includes(texts('en').btn.read) && !np.html.includes('type="radio"') && np.html.includes('Three backlog items'), 'notice page: the read mark, no radios, the body rendered');
  recordDecision(root, NOTICE, { kind: KIND_NOTICE, comment: '' }, cfg);
  ok(readFileSync(join(root, NOTICE), 'utf8') === beforeN, 'a read mark without a comment does NOT touch the owner\'s document (BOM and CRLF intact)');
  ok(markNoticeRead(root, NOTICE) && pendingNotices(root).length === 0, 'the read mark is the proof of delivery — the notice leaves the redelivery queue (I38)');
  writeFileSync(join(root, 'interviews', 'interview_053_open.md'), '# Interview #053\n\n> Status: awaiting\n\n### Q1. Q?\n\n- **A)** one\n- **B)** two\n\n**Answer:**\n');
  enqueue(root, NOTICE, { kind: KIND_NOTICE });
  const qp = buildQueuePage(root, pendingDocs(root));
  ok(qp.html.lastIndexOf('class="qcard') < qp.html.indexOf(texts('en').head.noticeGroup) && qp.total === 3 && qp.notices === 1, 'batch page: the notice group sits UNDER the last question card; both classes counted apart (three open questions across three documents, one notice)');
  const ip = buildIndexPage(root, ownerDocs(root), pendingNotices(root));
  ok((ip.html.match(/class="card /g) || []).length === 4 && ip.html.includes('/d/interviews%2Finterview_053_open.md'), 'entry page: one card per document (three interviews + one notice), each opening in its own window');

  // the PROOFREADING face: a comment field under every paragraph; the record carries comments { p<N> }
  const DRAFT = 'docs/DRAFT.md';
  writeFileSync(join(root, DRAFT), '# Draft\n\nFirst paragraph.\n\nSecond paragraph\nstill second.\n\n```\ncode block\n```\n\nFourth.\n');
  const pp = buildProofreadPage(root, DRAFT);
  ok(pp.paragraphs === 5 && (pp.html.match(/name="para:docs\/DRAFT\.md:p\d"/g) || []).length === 5 && pp.html.includes(texts('en').btn.done) && !pp.html.includes('type="radio"'),
    'proofreading page: five paragraphs (heading, two prose, one fenced block, one more), a field under each, Done, no radios');
  const pr = recordDecision(root, DRAFT, { kind: 'proofread', comments: { p2: 'tighten', p5: 'drop' }, comment: '' }, cfg, new Date(2026, 8, 5, 22, 2));
  ok(pr.kind === 'proofread' && pr.comments.p2 === 'tighten' && /- \*\*p2\*\* — tighten/.test(readFileSync(join(root, DRAFT), 'utf8')) && existsSync(join(root, 'interviews', 'decisions', 'DRAFT.decision.json')),
    'proofreading record: kind proofread, comments by paragraph id, a dated block at the end of the md');

  // the MOCKUP face: the image embedded, one comment field; the record never touches the image
  const PNG = 'docs/mock.png';
  const pngBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  writeFileSync(join(root, PNG), pngBytes);
  const mp = buildMockupPage(root, PNG);
  ok(mp.html.includes('<img src="data:image/png;base64,') && mp.html.includes('name="doccomment:docs/mock.png"') && mp.html.includes(texts('en').btn.done), 'mockup page: the image as a data URI, a comment field, Done');
  const mr = recordDecision(root, PNG, { kind: 'mockup', comment: 'move the logo left' }, cfg);
  ok(mr.kind === 'mockup' && readFileSync(join(root, PNG)).equals(pngBytes) && existsSync(join(root, 'interviews', 'decisions', 'mock.decision.json')), 'mockup record: kind mockup, the image byte-identical, decision.json named after the image');
  let threw = false; try { buildMockupPage(root, DRAFT); } catch { threw = true; }
  ok(threw, 'mockup face refuses a non-image loudly');

  // I40–I42: the fact of showing, never-shown first, the gate by exit code
  const now = new Date('2026-09-05T12:00:00Z');
  const lq1 = listQueue(root, { now, includeStale: true });
  ok(lq1.exitCode === EXIT_NEVER_SHOWN && lq1.never.length >= 1 && lq1.lines[0].startsWith('⛔'), 'queue without a browser: a never-shown waiting document → ⛔ first, exit 2 (I41/I42)');
  recordShown(root, lq1.never.map((d) => d.doc), texts('en').transport.chat, now);
  const lq2 = listQueue(root, { now, includeStale: true });
  ok(lq2.exitCode === 0 && lq2.lines.every((l) => !l.includes(texts('en').list.never)) && readShown(root)[lq1.never[0].doc].transport === 'chat', 'after the fact of showing: exit 0, the transport is kept per document (I40)');
  // I39: a stale position is the agent's debt, not the owner's page
  const OLD = 'interviews/interview_002_old.md';
  writeFileSync(join(root, OLD), '# Interview #002\n\n> Status: awaiting\n> Created: 2026-01-01\n\n### Q1. Q?\n\n- **A)** one\n- **B)** two\n\n**Answer:**\n');
  ok(queueDocAgeDays(root, OLD, now) > STALE_QUEUE_DAYS && !ownerDocs(root, { now }).some((d) => d.doc === OLD) && ownerDocs(root, { now, includeStale: true }).some((d) => d.doc === OLD),
    'stale queue position leaves the owner\'s showcase; --include-stale brings it back on purpose (I39)');

  // the call phrase names the class and the numbers; the owner is addressed by callName
  ok(callPhrase({ notice: true, title: 'Report' }, cfg).startsWith('Jane Owner aka JO, a Probe Project notice') && callPhrase({ batch: true, nDocs: 2, nQuestions: 1, nNotices: 1 }, cfg).includes('unread notices 1'),
    'call phrase: the owner\'s name, the project, the class and both numbers');
  ok(!callPhrase({ batch: true, nDocs: 1, nQuestions: 3, nNotices: 0 }, cfg).includes('notices'), 'call phrase: no notices — no mention of them');

  rmSync(root, { recursive: true, force: true });
  log(bad ? 'SELFTEST RED: ' + bad + ' of ' + n : 'contour selftest green: ' + n + ' checks (pre-flight red on the "options as paragraphs" fixture, three faces, records, showing)');
  if (bad) process.exit(1);
}

// ── Entry point (T9: executes only when run directly; `main` is exported so an origin wrapper can run
// the very same CLI in-process — the origin eats its own shipment, plans/93 IC5) ──────────────────
export function main(args = process.argv.slice(2), root = process.cwd()) {
  const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  const valueFlags = ['--timeout', '--transport', '--mark-shown'];
  const docPath = args.find((a, i) => !a.startsWith('--') && !valueFlags.includes(args[i - 1]));
  const opts = {
    open: !args.includes('--no-open'),
    signal: !args.includes('--silent'),
    timeoutMs: Number(opt('--timeout') || 0) * 1000, // I9: default 0 — the machine's patience is infinite
    includeStale: args.includes('--include-stale'),
  };
  const asNotice = args.includes('--notice');
  const face = args.includes('--proofread') ? 'proofread' : args.includes('--mockup') ? 'mockup' : 'interview';
  const usage = () => {
    console.error('usage: ' + CLI_NAME + ' <doc.md> [--no-serve|--no-open|--silent|--timeout N]\n' +
      '       ' + CLI_NAME + ' <doc.md> --notice        (something to tell; "read" is the outcome)\n' +
      '       ' + CLI_NAME + ' <doc.md> --proofread     (a comment field under every paragraph)\n' +
      '       ' + CLI_NAME + ' <image> --mockup         (the image + comments)\n' +
      '       ' + CLI_NAME + ' --queue [--include-stale] | --queue --list | --enqueue <doc.md> [--notice] | --selftest\n' +
      '       ' + CLI_NAME + ' --mark-shown <doc.md> [--transport chat]\n' +
      'Exit codes: 0 recorded · 2 closed without an answer · 130 interrupted · 3 pre-flight refused (fix the form).\n' +
      'Run it as a TRACKED background task (I31). Contract: .kaif/INTERACTIVE_CONTOUR_SPEC.md');
    process.exit(1);
  };
  const cfg = cfgOf(root);
  if (!cfg.markerFound) console.log('note: no .kaif/kaif.json here — defaults in use (project "' + cfg.projectName + '", owner "' + cfg.ownerName + '", language ' + cfg.language + ').');
  if (args.includes('--selftest')) { selftest(); process.exit(0); }
  if (args.includes('--enqueue')) {
    if (!docPath) usage();
    const items = enqueue(root, docPath, { kind: asNotice ? KIND_NOTICE : 'question' });
    console.log('Queued: ' + items.length + ' position(s)' + (asNotice ? ' (notice)' : '') + ' — shown as a batch by: ' + CLI_NAME + ' --queue');
    process.exit(0);
  }
  if (args.includes('--mark-shown')) { // I40: the question was asked pointedly in chat — the agent's hand records the fact
    const doc = opt('--mark-shown');
    if (!doc) usage();
    const transport = opt('--transport') || T(cfg).transport.chat;
    recordShown(root, [doc], transport);
    console.log('Shown recorded (I40): ' + doc + ' · ' + transport + ' → ' + cfg.decisionsDir + '/' + SHOWN_FILE);
    process.exit(0);
  }
  if (args.includes('--queue') && args.includes('--list')) {
    const r = listQueue(root, { includeStale: opts.includeStale });
    for (const l of r.lines) console.log(l);
    process.exit(r.exitCode);
  }
  if (args.includes('--queue')) {
    const stale = opts.includeStale ? [] : staleQueueDocs(root, ownerDocs(root, { includeStale: true }));
    for (const d of stale) console.log('! stale in the queue (' + d.days + ' d > ' + STALE_QUEUE_DAYS + '): ' + d.doc + ' — NOT shown; close it by status or show it on purpose: --include-stale');
    const docs = ownerDocs(root, opts);
    const notices = pendingNotices(root);
    if (docs.length === 0 && notices.length === 0) { console.log('No unanswered questions and no unread notices — the queue is empty, no page needed.'); process.exit(0); }
    for (const d of docs) { // spec §2: a batch never carries a page that would open without radios
      const g = gateForOpen(root, d.doc);
      if (g) { for (const l of g) console.log(l); console.log('  in: ' + d.doc); process.exit(EXIT_PREFLIGHT); }
    }
    serveContour(root, { batch: true }, opts).then((r) => process.exit(r.exitCode));
  } else if (!docPath) {
    usage();
  } else if (asNotice) {
    enqueue(root, docPath, { kind: KIND_NOTICE });
    serveContour(root, { docPath, notice: true }, opts).then((r) => process.exit(r.exitCode));
  } else {
    if (face === 'interview') { // spec §2: pre-flight + self-check BEFORE any page opens
      const g = gateForOpen(root, docPath);
      if (g) { for (const l of g) console.log(l); process.exit(EXIT_PREFLIGHT); }
    }
    if (args.includes('--no-serve')) { // C9: "build and exit" — a synchronous caller must not hang
      const page = face === 'proofread' ? buildProofreadPage(root, docPath) : face === 'mockup' ? buildMockupPage(root, docPath) : buildPage(root, docPath);
      const outDir = tmpDirOf(root);
      mkdirSync(outDir, { recursive: true });
      const out = join(outDir, basename(docPath).replace(/\.[^.]+$/u, '') + '.html');
      writeFileSync(out, page.html, 'utf8');
      console.log('Render written: ' + out);
      console.log('RENDER IS NOT YET A SHOW'); // M8: the reminder at the point of temptation to hand over a path
      console.log('Showing is an action: ' + CLI_NAME + ' ' + docPath + (face === 'interview' ? '' : ' --' + face));
      process.exit(0);
    }
    serveContour(root, { docPath, face }, opts).then((r) => process.exit(r.exitCode));
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) main();
