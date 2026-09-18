#!/usr/bin/env node
// tools/experience-lint.mjs — ОБЁРТКА истока над ОТГРУЖАЕМЫМ модулем `framework/tools/kaif-experience-lint.mjs`
// (2.7, эпик EL, шаг EL3 plans/114: «исток ест свою поставку», прецедент `tools/review.mjs` → контур; #69 —
// механизация #14 не уехала полем и жила только в обвязке). Разбор записей, поля И1/И4, ось повтора класса,
// `dangling`, `--shrink` и селфтест живут в поставке — ровно в том файле, который едет проектам как
// `.kaif/tools/kaif-experience-lint.mjs`. Здесь — только то, что принадлежит ИСТОКУ:
//   · адрес журнала и БАЗОВАЯ ЛИНИЯ унаследованного долга полей (`tools/experience-lint.baseline.json`) —
//     она ТОЛЬКО УМЕНЬШАЕТСЯ (вечно красный страж приучает себя игнорировать; прецедент doc-header-lint);
//   · команда `--write-baseline` — переснять линию РУКАМИ, с пересмотром дельты глазами (в поставку не едет).
// Команды: `node tools/experience-lint.mjs` (суд журнала) · `--selftest` · `--shrink EXP-NNNN [--yes]` · `--write-baseline`.
// [TESTED: 2026-09-18 · функциональный прогон по РЕАЛЬНОМУ журналу истока (136 записей, размеченных классами):
//  14 красных классов и одно поле прочитаны построчно и получили судьбу, повторный прогон зелёный (0 находок) —
//  отчёт testcases/reports/2026-09-18_experience-lint.md; селфтест модуля 68 кейсов; свод s28 30/30]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JOURNAL = join(ROOT, 'EXPERIENCE.md');
const BASELINE = join(ROOT, 'tools', 'experience-lint.baseline.json');
const MODULE = join(ROOT, 'framework', 'tools', 'kaif-experience-lint.mjs');
const argv = process.argv.slice(2);

if (argv.includes('--write-baseline')) {
  const prev = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')).ids : null;
  const ids = (readFileSync(JOURNAL, 'utf8').match(/^### +(EXP-\d+)/gm) || []).map((h) => h.replace(/^### +/, ''));
  writeFileSync(BASELINE, JSON.stringify({
    note: 'унаследованный долг ПОЛЕЙ механизации (issue #14): только УМЕНЬШАЕТСЯ, новые записи сюда не вписываются; повтор класса (эпик EL, #69) базовой линией не гасится — у пары записей обязана быть судьба',
    capturedAt: new Date().toISOString(), ids,
  }, null, 2) + '\n', 'utf8');
  console.log(`baseline переснят: ${ids.length} записей${prev ? ` (было ${prev.length})` : ''} — пересмотри дельту глазами, растить baseline нельзя`);
  process.exit(0);
}

const args = argv.includes('--selftest') || argv.includes('selftest') ? ['selftest']
  : argv.includes('--shrink') ? [...argv, JOURNAL]
  : ['check', JOURNAL, '--baseline', BASELINE];
try { execFileSync(process.execPath, [MODULE, ...args], { cwd: ROOT, stdio: 'inherit' }); }
catch (e) { process.exit(typeof e.status === 'number' ? e.status : 1); }
