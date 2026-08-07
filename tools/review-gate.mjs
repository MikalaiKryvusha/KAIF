#!/usr/bin/env node
// review-gate.mjs — гейт отправки, fail-closed (фаза K5, plans/48 шаг 2; роль C1 «review-gate»).
// [TESTED: 2026-08-07 · QA-прогон verify-contour: отказ до одобрения, проход после, дрейф рушит]
//
// C7/I4: одна функция checkApproval — из ядра, та же, что зовёт отправитель. Гейт стоит на
// СТОРОНЕ ОТПРАВКИ: отказ ненулевым кодом на «нет решения / не approved / артефакт не объявлен /
// тело отсутствует / хеш уплыл / любая неожиданность». Запрос никогда не самоодобряется таймаутом.

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkApproval } from './lib/review-core.mjs';

export function gate(root, docPath, artifactId, log = console.log) {
  const verdict = checkApproval(root, docPath, artifactId);
  log((verdict.ok ? 'ГЕЙТ ПРОЙДЕН: ' : 'ГЕЙТ ОТКАЗАЛ: ') + verdict.reason +
    ' [' + docPath + ' · ' + artifactId + ']');
  return verdict;
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) { // T9
  const [docPath, artifactId] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!docPath || !artifactId) {
    console.error('usage: node tools/review-gate.mjs <черновик.md> <artifact-id>');
    process.exit(1);
  }
  process.exit(gate(process.cwd(), docPath, artifactId).ok ? 0 : 1);
}
