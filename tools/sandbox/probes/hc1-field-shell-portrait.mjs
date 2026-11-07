#!/usr/bin/env node
// hc1-field-shell-portrait.mjs — ПРОБА шага HC1 версии KAIF 2.10 (#116): функциональный прогон `kaif-voice-lint` по КОПИИ настоящего портрета
// поля «оболочка жанров + слепок» (два раздела §8 — у оболочки старая таблица без колонок паттерна/подсказки, у слепка правильная).
// Портрет копируется во временный каталог ОС (источник только читается, sha до и после), рядом — одна строка текста; `load`, затем
// `check`. Печатаются только коды выхода и строка счёта правил — текст портрета никогда. Модуль — этой сборки или `KAIF_VOICE_LINT=<файл>`.
// Использование: node tools/sandbox/probes/hc1-field-shell-portrait.mjs <портрет>  · код 0 — check судит (0 или 1, не 3), 1 — SKIPPED, 2 — нет портрета.
// [TESTED: 2026-11-07 · эта сборка — 21 стоп-правило, check 0; модуль HEAD — SKIPPED, код 3 — testcases/reports/2026-11-07_hc1-voice-lint-every-s8.md]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const SRC = process.argv[2] ? resolve(process.argv[2]) : '';
if (!SRC || !existsSync(SRC)) { console.log('usage: hc1-field-shell-portrait.mjs <portrait> — no portrait given or found'); process.exit(2); }
const LINT = process.env.KAIF_VOICE_LINT ? resolve(process.env.KAIF_VOICE_LINT) : resolve(import.meta.dirname, '..', '..', '..', 'framework', 'tools', 'kaif-voice-lint.mjs');
const sha = () => createHash('sha256').update(readFileSync(SRC)).digest('hex');
const sha0 = sha();
const d = mkdtempSync(join(tmpdir(), 'kaif-hc1-'));
const run = (...a) => { try { return { code: 0, out: execFileSync(process.execPath, [LINT, ...a], { cwd: d, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { code: e.status, out: String(e.stdout || '') + String(e.stderr || '') }; } };
let verdict = 1;
try {
  copyFileSync(SRC, join(d, 'AUTHOR_STYLOMETRY.md'));
  const l = run('load');
  writeFileSync(join(d, 'text.md'), '# Note\n\nThe build is green.\n');   // AFTER the load — a text written before it is «written past the portrait»
  const c = run('check', 'text.md');
  const scope = (c.out.match(/against AUTHOR_STYLOMETRY\.md §8 \([^)]*\)/) || [''])[0];
  const skipped = /SKIPPED/.test(c.out);
  console.log('  · module: ' + LINT);
  // the exit code is read with its reason (EXP-0205): exit 1 is either a rule's hit or the load witness — say which
  const witness = /written past the portrait/.test(c.out);
  const hits = (c.out.match(/(\d+) finding\(s\)/) || [, '0'])[1];
  console.log('  · load → exit ' + l.code + ' · check → exit ' + c.code + (skipped ? ' · SKIPPED' : '') + (scope ? ' · ' + scope : '')
    + ' · findings ' + hits + (witness ? ' (the load witness — not a rule)' : ''));
  verdict = c.code === 3 || skipped ? 1 : 0;
} finally { rmSync(d, { recursive: true, force: true }); }
console.log('  · source untouched: ' + (sha() === sha0));
console.log(verdict ? '✖ hc1: the portrait\'s §8 rules were not applied (SKIPPED)' : '✔ hc1: check judged the text against the portrait\'s §8 table');
process.exit(verdict);
