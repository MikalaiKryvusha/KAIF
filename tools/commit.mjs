#!/usr/bin/env node
// tools/commit.mjs
// Bump the build number in version.json, commit all changes with the project's
// commit style + Co-Authored-By trailer, and push. Usage:
//   node tools/commit.mjs "fix: <ASCII-only message>"
//   node tools/commit.mjs --msg-file <path>   ← ОБЯЗАТЕЛЕН для сообщений с не-ASCII
// [TESTED: 2026-08-07 · страж argv красный на кириллице (наблюдение); --msg-file — сообщение
// в git log побайтно чистое (фикс-коммит bugs/46 прочитан обратно)]
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Два режима входа. Страж класса «текст-через-CLI» (bugs/46, AGENT_GUIDE → Гигиена, симптом 5):
// не-ASCII/слэши в argv коверкаются шелл-слоями ДО программы (git-bash/MSYS2 конвертирует
// «/»→«\», «:»→«;», «/Word»→«C:\Program Files\Git\Word»; PowerShell/cmd портят кодировкой) —
// такое сообщение обязано ехать ФАЙЛОМ, argv-режим его отвергает с готовым решением.
let msg;
const fileIdx = process.argv.indexOf('--msg-file');
if (fileIdx >= 0) {
  const p = process.argv[fileIdx + 1];
  if (!p) {
    console.error('usage: node tools/commit.mjs --msg-file <path>');
    process.exit(1);
  }
  msg = readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim(); // BOM-терпимо (EXP-0007)
} else {
  msg = process.argv.slice(2).join(' ').trim();
  if (/[^\x00-\x7F]/.test(msg)) {
    console.error('✋ non-ASCII commit message via argv — shell layers corrupt it (bugs/46).');
    console.error('   Fix: write the message to a UTF-8 file and run:');
    console.error('   node tools/commit.mjs --msg-file <path>');
    process.exit(1);
  }
}
if (!msg) {
  console.error('usage: node tools/commit.mjs "<ASCII message>"  |  --msg-file <path>');
  process.exit(1);
}

// Bump the internal build counter, preserving every other field of version.json.
// (The version shown anywhere is major.minor only — `build` is an internal counter.)
const vf = join(ROOT, 'version.json');
const v = JSON.parse(readFileSync(vf, 'utf8'));
v.build = (v.build || 0) + 1;
writeFileSync(vf, JSON.stringify(v, null, 2) + '\n');

// Со-авторский трейлер несёт ФАКТИЧЕСКОЕ имя работающей модели — решение владельца №54
// (интервью №012, Q1 = B, 2026-08-08 06:48 +03:00): «по git log видно, кто что делал».
// Имя приходит ИЗВНЕ — от сессии, которая одна его и знает: `--as "<имя>"` или KAIF_AGENT_MODEL.
// Зашитой константы больше нет по построению: имя модели протухает, а зашитое протухает молча
// (тот же механизм, что вскрыла T1 на счётчиках, EXP-0044).
// Имени не дали — трейлер НЕ ПИШЕТСЯ и инструмент говорит об этом вслух: выдуманное авторство
// хуже отсутствующего (PHILOSOPHY → правило трёх дверей: пробел не закрывается правдоподобной
// выдумкой). Коммит при этом проходит — гейт авторства не должен останавливать работу.
const asIdx = process.argv.indexOf('--as');
const agentName = (asIdx >= 0 ? process.argv[asIdx + 1] : process.env.KAIF_AGENT_MODEL || '').trim();
const trailer = agentName ? `Co-Authored-By: ${agentName} <noreply@anthropic.com>` : '';
const run = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });

run('git add -A');
// Сообщение идёт через `git commit -F <файл>` — текст вообще не попадает в argv/шелл
// (лекарство класса bugs/46; -m с не-ASCII запрещён по построению).
const tmpMsg = join(tmpdir(), `kaif-commit-msg-${process.pid}.txt`);
// Трейлер идемпотентен по КЛАССУ, а не по одной строке: сообщение, уже несущее ЛЮБОЙ
// Co-Authored-By, не получает второго (bugs/47 закрыл «тот же трейлер дважды», bugs/50 — соседний
// случай: трейлер с ДРУГИМ именем модели проскакивал мимо `includes` и коммит уходил с двумя
// со-авторами, один из которых работу не делал).
// [TESTED: 2026-08-08 · коммит bugs/50 нёс трейлер «Claude Opus 5» — в git log он один]
if (!trailer && !/^Co-Authored-By:/mi.test(msg)) {
  console.error('⚠️  имя модели не передано — коммит уйдёт БЕЗ Co-Authored-By (решение №54: пишем ' +
    'фактическое имя, выдумывать запрещено). Передай: --as "<имя модели>" или KAIF_AGENT_MODEL=<имя>.');
}
writeFileSync(tmpMsg, (/^Co-Authored-By:/mi.test(msg) || !trailer) ? msg + '\n' : msg + '\n\n' + trailer + '\n');
try {
  run(`git commit -F "${tmpMsg}"`);
} finally {
  rmSync(tmpMsg, { force: true }); // finally — нетеряющая уборка (EXP-0027)
}
try {
  run('git push');
} catch {
  console.error('⚠️  push failed — try: gh auth setup-git ; git pull --rebase ; git push');
  process.exit(1);
}
console.log(`✅ committed & pushed (build ${v.build})`);
