#!/usr/bin/env node
// kaif-provenance.mjs — the OPTIONAL provenance module for the owner's canon artifacts
// (KAIF 2.0, plan 20 phase 5; owner decision #19: a separate optional module, not core).
// Deployed to .kaif/tools/kaif-provenance.mjs by the installer; does nothing until the project
// declares its canon artifacts.
//
// The convention it mechanizes (AGENT_GUIDE, shipped since 1.6): everything an AI writes into
// the OWNER'S canon artifacts (rulebooks, lore, brand texts — where the owner's word IS the
// content) carries visible paired marks [AI]…[/AI] (AI-written) / [AI-ed]…[/AI-ed] (owner text
// edited by AI). A mark is the acceptance queue: ONLY the owner's word removes it. The field
// asked for this exact cheap gate first: "without tooling the convention rots first, and agents
// start marking everything" (QA field report, 1.6).
//
// Declare the canon in .kaif/kaif.json:   "canonArtifacts": ["rules/", "lore/canon.md"]
//   (a path ending in "/" declares a directory subtree; otherwise an exact file path)
//
// Commands:
//   node .kaif/tools/kaif-provenance.mjs report            # where AI text awaits acceptance
//   node .kaif/tools/kaif-provenance.mjs check             # the GATE (wire into your checks/CI):
//                                                          #   · every mark is correctly paired
//                                                          #   · marks live ONLY in declared canon
//                                                          # exit 1 on violations
//   node .kaif/tools/kaif-provenance.mjs accept <file>     # THE OWNER ACCEPTED this file's blocks:
//                                                          # move them to the acceptance registry
//                                                          # (.kaif/provenance-accepted.json) and
//                                                          # strip the marks. An agent must NEVER
//                                                          # run this without the owner's word.
//
// Roadmap (plan 17 §2.1): a git-baseline token-F1 pass (--mark: find and mark unmarked AI text
// mechanically) ships as the second stage; this grep stage is complete and useful on its own.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CMD = process.argv[2] || 'report';
const ARG = process.argv[3];
const KAIF_JSON = '.kaif/kaif.json';
const REGISTRY = '.kaif/provenance-accepted.json';
const OPEN = ['[AI]', '[AI-ed]'];
const CLOSE = { '[AI]': '[/AI]', '[AI-ed]': '[/AI-ed]' };

const log = (s) => console.log(s);
const die = (s) => { console.error('✖ ' + s); process.exit(1); };
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

function canonDecl() {
  if (!existsSync(KAIF_JSON)) die('no .kaif/kaif.json — KAIF is not deployed here');
  const j = JSON.parse(readFileSync(KAIF_JSON, 'utf8').replace(/^﻿/, ''));
  return Array.isArray(j.canonArtifacts) ? j.canonArtifacts : [];
}
const inCanon = (p, decl) => decl.some((d) => (d.endsWith('/') ? p.startsWith(d) : p === d));

// Parse one file into mark blocks; returns { blocks, errors }. A block: { kind, text, line }.
function parseMarks(path) {
  const text = readFileSync(path, 'utf8');
  const blocks = [];
  const errors = [];
  let open = null; // { kind, line, start }
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const tag of [...OPEN, '[/AI]', '[/AI-ed]']) {
      let idx = -1;
      while ((idx = lines[i].indexOf(tag, idx + 1)) !== -1) {
        // longest-match guard: "[AI]" also matches inside "[AI-ed]" — skip those hits
        if (tag === '[AI]' && lines[i].slice(idx, idx + 7) === '[AI-ed]') continue;
        if (tag === '[/AI]' && lines[i].slice(idx, idx + 8) === '[/AI-ed]') continue;
        if (OPEN.includes(tag)) {
          if (open) { errors.push(`${path}:${i + 1} — ${tag} opened while ${open.kind} from line ${open.line} is still open (nesting is not allowed)`); }
          else open = { kind: tag, line: i + 1, buf: [] };
        } else {
          const wanted = open ? CLOSE[open.kind] : null;
          if (!open) errors.push(`${path}:${i + 1} — stray ${tag} with no open mark`);
          else if (tag !== wanted) errors.push(`${path}:${i + 1} — ${tag} closes ${open.kind} from line ${open.line} (expected ${wanted})`);
          else { blocks.push({ kind: open.kind, line: open.line, text: open.buf.join('\n') }); open = null; }
        }
      }
    }
    if (open) open.buf.push(lines[i]);
  }
  if (open) errors.push(`${path}:${open.line} — ${open.kind} never closed`);
  return { blocks, errors };
}

function* walkMd(dir = '.') {
  for (const n of readdirSync(dir)) {
    const p = (dir === '.' ? '' : dir + '/') + n;
    if (['.git', 'node_modules', '.kaif'].includes(n)) continue;
    if (statSync(p).isDirectory()) { yield* walkMd(p); continue; }
    if (/\.md$/i.test(n)) yield p;
  }
}

function cmdCheck() {
  const decl = canonDecl();
  let issues = 0;
  for (const p of walkMd()) {
    const { blocks, errors } = parseMarks(p);
    for (const e of errors) { console.error('✖ ' + e); issues++; }
    if (blocks.length && !inCanon(p, decl)) {
      console.error(`✖ ${p} carries ${blocks.length} provenance mark block(s) but is NOT a declared canon artifact — marks live only in canonArtifacts (declare it in .kaif/kaif.json, or remove the marks: agents must not mark everything)`);
      issues++;
    }
  }
  if (issues) die(`provenance check FAILED: ${issues} issue(s)`);
  log(`✅ provenance check OK${decl.length ? '' : ' (no canonArtifacts declared — only mark hygiene was checked)'}`);
}

function cmdReport() {
  const decl = canonDecl();
  if (!decl.length) { log('no canonArtifacts declared in .kaif/kaif.json — nothing to report'); return; }
  let total = 0;
  for (const p of walkMd()) {
    if (!inCanon(p, decl)) continue;
    const { blocks, errors } = parseMarks(p);
    for (const e of errors) console.error('⚠ ' + e);
    if (!blocks.length) continue;
    log(`${p} — ${blocks.length} block(s) awaiting the owner's acceptance:`);
    for (const b of blocks) log(`  · line ${b.line} ${b.kind} ${b.text.trim().split('\n')[0].slice(0, 80)}`);
    total += blocks.length;
  }
  log(total ? `${total} block(s) total — acceptance is the OWNER'S word, then: kaif-provenance accept <file>` : '✅ no AI text awaits acceptance in the declared canon');
}

function cmdAccept() {
  if (!ARG) die('usage: kaif-provenance accept <file>   — run ONLY after the owner said the file is accepted');
  if (!existsSync(ARG)) die(`no such file: ${ARG}`);
  const { blocks, errors } = parseMarks(ARG);
  if (errors.length) { for (const e of errors) console.error('✖ ' + e); die('fix mark pairing before accepting'); }
  if (!blocks.length) die(`${ARG} carries no provenance marks — nothing to accept`);
  const reg = existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, 'utf8')) : { accepted: [] };
  const date = new Date().toISOString().slice(0, 10);
  for (const b of blocks) reg.accepted.push({ file: ARG, date, kind: b.kind, sha: sha(b.text), excerpt: b.text.trim().split('\n')[0].slice(0, 80) });
  writeFileSync(REGISTRY, JSON.stringify(reg, null, 2) + '\n');
  let text = readFileSync(ARG, 'utf8');
  for (const tag of ['[AI-ed]', '[/AI-ed]', '[AI]', '[/AI]']) text = text.split(tag).join('');
  writeFileSync(ARG, text);
  log(`✔ accepted ${blocks.length} block(s) in ${ARG} — marks stripped, registry updated (${REGISTRY}). This action carries the owner's word.`);
}

({ check: cmdCheck, report: cmdReport, accept: cmdAccept }[CMD] ||
  (() => die(`unknown command: ${CMD} (report | check | accept <file>)`)))();
