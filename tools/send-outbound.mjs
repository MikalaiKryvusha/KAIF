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

import { readFileSync, existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { checkApproval, parseMetaBlock, bodyHash, DECISIONS_DIR } from './lib/review-core.mjs';
import { tempRoot } from './lib/temp-root.mjs';

const GH_TIMEOUT_MS = 60000; // жёсткий срок дочернего вызова (C9)

// Три ИСХОДА дочернего вызова, а не два (круг R2, ось A). `spawnSync` при отсутствии бинаря и
// при истечении срока возвращает `status: null` и ПУСТЫЕ потоки — прежняя редакция схлопывала обе
// ситуации в «gh отказал: нет вывода», а сам факт неудачи объявляла ОТКЛОНЁННОЙ отправкой.
// Для таймаута это не просто невнятно, а опасно: срок мог истечь ПОСЛЕ того, как комментарий
// уже опубликован, и «отклонено» приглашает оператора отправить второй раз. Поэтому исход
// «неизвестно» назван отдельным словом и НИКОГДА не называется отказом.
const SPAWN_FAILURES = {
  ENOENT: 'команда `gh` не найдена в PATH — установи GitHub CLI и выполни `gh auth status`',
  ETIMEDOUT: null, // особый случай: разбирается ниже, потому что это НЕ отказ
};

export function sendOutbound(root, docPath, artifactId,
  { apply = false, log = console.log, spawn = spawnSync } = {}) {
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
    // Длина в БАЙТАХ, а не в кодовых единицах строки: тело владельца кириллическое, и `.length`
    // занижал его почти вдвое — число, названное «байт», обязано быть байтами.
    log('DRY-RUN (без --apply): одобрено, ушло бы в issue #' + issue[1] + ' телом ' + art.body_file +
      ' (' + Buffer.byteLength(readFileSync(bodyPath, 'utf8'), 'utf8') + ' байт).');
    return { ok: true, dryRun: true };
  }
  const r = spawn('gh', ['issue', 'comment', issue[1], '--body-file', bodyPath],
    { cwd: root, encoding: 'utf8', timeout: GH_TIMEOUT_MS });

  // Исход 1 — процесс не состоялся вовсе (бинаря нет, срок истёк, сигнал).
  if (r.error || r.status === null) {
    const code = (r.error && r.error.code) || (r.signal ? 'SIGNAL:' + r.signal : 'UNKNOWN');
    if (code === 'ETIMEDOUT' || r.signal === 'SIGTERM') {
      // ИСХОД НЕИЗВЕСТЕН. Комментарий мог уже уйти — молчаливое «отклонено» здесь рождает дубль.
      const reason = 'срок ' + GH_TIMEOUT_MS + ' мс истёк — ИСХОД НЕИЗВЕСТЕН: комментарий мог быть ' +
        'опубликован. ПРОВЕРЬ вручную (`gh issue view ' + issue[1] + ' --json comments`) ПРЕЖДЕ ЧЕМ ' +
        'повторять отправку — повтор вслепую оставит в тикете дубль от имени владельца';
      log('ОТПРАВКА НЕ ПОДТВЕРЖДЕНА: ' + reason);
      return { ok: false, unknown: true, reason };
    }
    return refuse(log, SPAWN_FAILURES[code] || ('дочерний процесс не состоялся (' + code + ')'));
  }
  // Исход 2 — процесс отработал и отказал: у него ЕСТЬ что сказать, и это говорится.
  if (r.status !== 0) return refuse(log, 'gh отказал (код ' + r.status + '): ' +
    ((r.stderr || r.stdout || 'нет вывода').trim()));
  // Исход 3 — опубликовано.
  log('ОТПРАВЛЕНО в issue #' + issue[1] + ' от имени владельца: ' + (r.stdout || '').trim());
  return { ok: true, sent: true };
}
const refuse = (log, reason) => { log('ОТПРАВКА ОТКЛОНЕНА: ' + reason); return { ok: false, reason }; };

// ── Селфтест: КАЖДЫЙ исход дочернего вызова доказан отдельно (круг R2, ось A) ───────────────
// Инструмент до сих пор наблюдался ТОЛЬКО отказом гейта — то есть ветка после `spawn` не
// исполнялась ни разу ни одной проверкой. Она и разошлась с заявленным поведением. Здесь она
// исполняется вся: `spawn` подменяется, потому что настоящий `gh` не умеет по требованию
// исчезнуть из PATH и зависнуть — а именно эти два ответа и надо доказать.
function selftest() {
  let n = 0, bad = 0;
  const ok = (cond, name, why) => {
    n++;
    if (cond) console.log('✓ ' + name);
    else { bad++; console.log('✗ ' + name + (why ? ' — ' + why : '')); }
  };

  const root = tempRoot('send-outbound-selftest');
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, 'drafts', 'bodies'), { recursive: true });
  mkdirSync(join(root, DECISIONS_DIR), { recursive: true });
  // Тело — КИРИЛЛИЧЕСКОЕ намеренно: на нём и разошлись «символы» с «байтами».
  const body = 'Ответ владельца в тикет.\nВторая строка.\n';
  writeFileSync(join(root, 'drafts', 'bodies', 'msg1.md'), body, 'utf8');
  writeFileSync(join(root, 'drafts', 'reply.md'), [
    '```owner-review', 'title: Черновик', 'kind: outbound draft', 'artifacts:',
    '  - id: msg1', '    target: github · issue 999', '    format: markdown',
    '    body_file: drafts/bodies/msg1.md', '```', '', '# Черновик', '',
  ].join('\n'), 'utf8');
  writeFileSync(join(root, DECISIONS_DIR, 'reply.decision.json'), JSON.stringify({
    artifacts: { msg1: { status: 'approved', sha256: bodyHash(body) } },
  }), 'utf8');

  const run = (spawn, apply = true) => {
    const out = [];
    const res = sendOutbound(root, 'drafts/reply.md', 'msg1',
      { apply, spawn, log: (s) => out.push(s) });
    return { res, out: out.join('\n') };
  };

  // 1. Успех — единственный исход, который вправе вернуть ok.
  const good = run(() => ({ status: 0, stdout: 'https://github.com/o/r/issues/999#c1', stderr: '' }));
  ok(good.res.ok === true && good.res.sent === true, 'успех: ok=true, sent=true');
  ok(/ОТПРАВЛЕНО/.test(good.out), 'успех: печатает ОТПРАВЛЕНО', good.out);

  // 2. `gh` отработал и отказал — код и его слова попадают в вывод.
  const bad2 = run(() => ({ status: 1, stdout: '', stderr: 'gh: issue not found' }));
  ok(bad2.res.ok === false, 'отказ gh: ok=false');
  ok(/код 1/.test(bad2.out) && /issue not found/.test(bad2.out),
    'отказ gh: НАЗВАН код возврата и сказаны слова gh', bad2.out);

  // 3. Бинаря нет — прежде это читалось как «gh отказал: нет вывода».
  const enoent = run(() => ({ status: null, stdout: null, stderr: null,
    error: Object.assign(new Error('spawnSync gh ENOENT'), { code: 'ENOENT' }) }));
  ok(enoent.res.ok === false, 'ENOENT: ok=false');
  ok(/не найдена в PATH/.test(enoent.out), 'ENOENT: назван ИМЕННО отсутствующий gh, а не «нет вывода»', enoent.out);
  ok(!/нет вывода/.test(enoent.out), 'ENOENT: старая невнятная формулировка не воспроизводится', enoent.out);

  // 4. Таймаут — САМАЯ дорогая ветка: исход неизвестен, и отказом он не называется.
  const tmo = run(() => ({ status: null, stdout: null, stderr: null, signal: 'SIGTERM',
    error: Object.assign(new Error('spawnSync ETIMEDOUT'), { code: 'ETIMEDOUT' }) }));
  ok(tmo.res.ok === false && tmo.res.unknown === true, 'таймаут: ok=false И unknown=true');
  ok(/ИСХОД НЕИЗВЕСТЕН/.test(tmo.out), 'таймаут: исход назван неизвестным', tmo.out);
  ok(!/ОТПРАВКА ОТКЛОНЕНА/.test(tmo.out),
    'таймаут НЕ называется отклонением (иначе повтор вслепую даёт дубль у владельца)', tmo.out);
  ok(/ПРОВЕРЬ вручную/.test(tmo.out), 'таймаут: назван следующий шаг оператора', tmo.out);

  // 5. Dry-run считает БАЙТЫ. Кириллица в UTF-8 — два байта на букву, поэтому число
  //    обязано превысить длину строки; равенство означало бы возврат прежнего дефекта.
  const dry = run(() => { throw new Error('dry-run не имеет права звать gh'); }, false);
  const printed = Number((dry.out.match(/\((\d+) байт\)/) || [])[1]);
  ok(dry.res.dryRun === true, 'dry-run: gh не зовётся вовсе');
  ok(printed === Buffer.byteLength(body, 'utf8'), 'dry-run: печатает БАЙТЫ тела (' + printed + ')', dry.out);
  ok(printed > body.length, 'dry-run: на кириллице байт БОЛЬШЕ, чем символов (' + printed + ' > ' + body.length + ')');

  // 6. Гейт не обойдён подменой spawn: без одобрения отправки нет ни при каком дочернем процессе.
  writeFileSync(join(root, 'drafts', 'bodies', 'msg1.md'), body + 'правка после одобрения\n', 'utf8');
  const tampered = run(() => ({ status: 0, stdout: 'ушло', stderr: '' }));
  ok(tampered.res.ok === false && /одобрени/i.test(tampered.out),
    'текст изменён после одобрения — отправки нет (I3)', tampered.out);

  rmSync(root, { recursive: true, force: true });
  console.log(bad === 0
    ? `\n✅ send-outbound selftest: ${n}/${n} — все четыре исхода дочернего вызова доказаны`
    : `\n❌ send-outbound selftest: ${bad} из ${n} провалены`);
  return bad === 0;
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) { // T9
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) process.exit(selftest() ? 0 : 1);
  const [docPath, artifactId] = args.filter((a) => !a.startsWith('--'));
  if (!docPath || !artifactId) {
    console.error('usage: node tools/send-outbound.mjs <черновик.md> <artifact-id> [--apply] | --selftest');
    process.exit(1);
  }
  process.exit(sendOutbound(process.cwd(), docPath, artifactId, { apply: args.includes('--apply') }).ok ? 0 : 1);
}
