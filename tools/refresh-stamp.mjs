#!/usr/bin/env node
// tools/refresh-stamp.mjs — записать свидетельство освежения контекста (`.kaif/refresh-marker.json`).
//
// ЗАЧЕМ. Маркер существует ровно для того, чтобы факт освежения был ПРОВЕРЯЕМ позже (`AGENT_GUIDE.md`
// → «Освежение контекста»). Пока его писал агент руками, поле `at` было такой же выдумкой, как
// любая другая метка: в `bugs/78` два маркера подряд получили правдоподобное, но неверное время —
// и охота судьи «refresh-witness» на них не сработала бы, потому что формально они безупречны.
//
// ФОРМА, ЗАКРЫВАЮЩАЯ КЛАСС: момент берёт САМ ИНСТРУМЕНТ у системных часов, и у сессии нет способа
// его назвать. Свидетельство, которое можно выдумать, свидетельством не является.
//
// Использование:
//   node tools/refresh-stamp.mjs --trigger hour --docs "STATUS.md" "AGENT_GUIDE.md" [--note "…"]
//   node tools/refresh-stamp.mjs --show          # напечатать текущий маркер и его возраст
//
// [TESTED: 2026-08-09 · все три режима наблюдены живьём — запись напечатала момент 12:18:32 +03:00,
//  `--show` прочитал его обратно с возрастом 0 мин, пустой `--docs` отвергнут кодом 1 с готовым
//  верным ходом. Момент в маркере совпал с системными часами, а не с памятью сессии.]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = join(ROOT, '.kaif', 'refresh-marker.json');
// Канон освежения называет ровно четыре триггера — список закрытый, чтобы «освежился просто так»
// не стало пятым (AGENT_GUIDE → «Освежение контекста»).
const TRIGGERS = ['hour', 'heavy-task', 'compaction'];
const RITUAL_PREFIX = 'ritual:';

/** Локальный ISO 8601 со смещением зоны — конвенция квитанций машинерии (канон T8). */
function localStamp(d = new Date()) {
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(off / 60)}:${pad(off % 60)}`;
}

const argv = process.argv.slice(2);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};

if (argv.includes('--show')) {
  if (!existsSync(MARKER)) { console.log('маркера нет — освежения в этой сессии не было'); process.exit(0); }
  const m = JSON.parse(readFileSync(MARKER, 'utf8'));
  const ageMin = Math.round((Date.now() - Date.parse(m.at)) / 60000);
  console.log(`маркер: ${m.at} · возраст ${ageMin} мин · триггер ${m.trigger}`);
  console.log(`перечитано: ${(m.docs || []).join(' · ') || '—'}`);
  process.exit(0);
}

const trigger = valueOf('--trigger');
if (!trigger || !(TRIGGERS.includes(trigger) || trigger.startsWith(RITUAL_PREFIX))) {
  console.error(`usage: node tools/refresh-stamp.mjs --trigger <${TRIGGERS.join('|')}|${RITUAL_PREFIX}<имя>> --docs <док> [док…] [--note "…"]`);
  process.exit(1);
}
// Список перечитанного — всё после `--docs` до следующего флага. Пустой список запрещён:
// маркер без него утверждает освежение, не называя ЧТО освежено, а это и есть ложный [TESTED].
const docsIdx = argv.indexOf('--docs');
const docs = docsIdx < 0 ? [] : argv.slice(docsIdx + 1).filter((a) => !a.startsWith('--'));
if (!docs.length) {
  console.error('✋ --docs пуст: маркер обязан НАЗЫВАТЬ перечитанное — иначе он утверждает освежение, не свидетельствуя о нём');
  process.exit(1);
}

const at = localStamp();
mkdirSync(dirname(MARKER), { recursive: true });
writeFileSync(MARKER, JSON.stringify({
  at, docs, trigger,
  note: valueOf('--note') ||
    'Момент снят САМИМ инструментом у системных часов — сессия его назвать не может (bugs/78).',
}, null, 2) + '\n');
console.log(`✅ маркер освежения переписан: ${at} · триггер ${trigger} · перечитано ${docs.length}`);
console.log('   Цитата-приёмка в чате обязательна — маркер делает факт проверяемым, цитата доказывает, что чтение дошло до задачи.');
