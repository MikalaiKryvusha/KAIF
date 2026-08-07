#!/usr/bin/env node
// send-outbound.mjs — реальный потребитель гейта (фаза K5, plans/48 шаг 2; роль C1 «send-outbound»).
// [TESTED: 2026-08-07 · QA-прогон: отказ под --apply без одобрения; live-отправка — Фаза R (issue #2)]
//
// Реальная рутина ИСТОКА: ответ владельца в issue ЭТОГО репозитория от его имени (`gh`).
// Ближайший живой адресат — issue #2 (закрывается в Фазе R зонтика plans/26 §8 ЧЕРЕЗ этот
// инструмент). C7/I4: отправитель зовёт ТУ ЖЕ checkApproval, что и гейт, и отказывает
// ненулевым кодом ДАЖЕ под явным --apply, если решения нет / rejected / текст уплыл.
// Без --apply — честный dry-run (печатает, ЧТО ушло бы и куда). Тело едет ФАЙЛОМ
// (--body-file), не аргументом — канон гигиены текста.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { checkApproval, parseMetaBlock } from './lib/review-core.mjs';

const GH_TIMEOUT_MS = 60000; // жёсткий срок дочернего вызова (C9)

export function sendOutbound(root, docPath, artifactId, { apply = false, log = console.log } = {}) {
  const verdict = checkApproval(root, docPath, artifactId); // та же функция, что в гейте (C7)
  if (!verdict.ok) {
    log('ОТПРАВКА ОТКЛОНЕНА' + (apply ? ' (и под --apply)' : '') + ': ' + verdict.reason);
    return { ok: false, reason: verdict.reason };
  }
  const meta = parseMetaBlock(readFileSync(resolve(root, docPath), 'utf8'));
  const art = meta.artifacts.find((a) => a.id === artifactId);
  const issue = (art.target || '').match(/issue\s*#?\s*(\d+)/iu);
  if (!issue) return refuse(log, 'адресат артефакта не github-issue: «' + (art.target || '(пусто)') + '»');
  const bodyPath = resolve(root, art.body_file);
  if (!existsSync(bodyPath)) return refuse(log, 'тело исчезло между гейтом и отправкой: ' + art.body_file);

  if (!apply) {
    log('DRY-RUN (без --apply): одобрено, ушло бы в issue #' + issue[1] + ' телом ' + art.body_file +
      ' (' + readFileSync(bodyPath, 'utf8').length + ' байт).');
    return { ok: true, dryRun: true };
  }
  const r = spawnSync('gh', ['issue', 'comment', issue[1], '--body-file', bodyPath],
    { cwd: root, encoding: 'utf8', timeout: GH_TIMEOUT_MS });
  if (r.status !== 0) return refuse(log, 'gh отказал: ' + ((r.stderr || r.stdout || 'нет вывода').trim()));
  log('ОТПРАВЛЕНО в issue #' + issue[1] + ' от имени владельца: ' + (r.stdout || '').trim());
  return { ok: true, sent: true };
}
const refuse = (log, reason) => { log('ОТПРАВКА ОТКЛОНЕНА: ' + reason); return { ok: false, reason }; };

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) { // T9
  const args = process.argv.slice(2);
  const [docPath, artifactId] = args.filter((a) => !a.startsWith('--'));
  if (!docPath || !artifactId) {
    console.error('usage: node tools/send-outbound.mjs <черновик.md> <artifact-id> [--apply]');
    process.exit(1);
  }
  process.exit(sendOutbound(process.cwd(), docPath, artifactId, { apply: args.includes('--apply') }).ok ? 0 : 1);
}
