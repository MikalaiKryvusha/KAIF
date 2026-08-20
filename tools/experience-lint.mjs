#!/usr/bin/env node
// tools/experience-lint.mjs — страж механизации уроков (эпик X 2.3; issue #14 истока).
//
// Класс дефекта: журнал опыта становится сливом по умолчанию — вопрос «можно ли сделать урок
// ненужным, и во сколько это обойдётся?» не задаётся при ПЕРВОЙ записи, и цена механизации
// назначается ВТОРЫМ ожогом (полевой замер issue #14: 281 запись в трёх проектах, механизировано
// 7 — 2,5 %; здесь на дату рождения стража: 83 записи, поле механизации — 0).
//
// Страж делает поле И1 проверяемым: у каждой НОВОЙ записи ровно одно из трёх полей —
//   mechanized: <инструмент>   · механизировано: <инструмент>   (урок устранён/застережён кодом)
//   none-cheap: <почему>       · механизации нет: <почему>      (дёшево невозможно, причина названа)
//   subject-lesson             · урок о предмете                (журнал ему и место)
// И4: запись с триггер-фразой «ловушки по форме» («сначала … потом», «не забудь», «перед тем
// как», first … then, don't forget) обязана нести mechanized/none-cheap — «урок о предмете» ей
// недоступен: текст, сводящийся к порядку действий, — кандидат в устранимые ловушки.
//
// Унаследованный долг живёт в baseline (tools/experience-lint.baseline.json) и только УМЕНЬШАЕТСЯ:
// вечно красный страж приучает себя игнорировать (оплаченный урок KAIF — прецедент
// doc-header-lint.stamp-baseline). Красятся ТОЛЬКО записи вне baseline.
//
// Запуск: node tools/experience-lint.mjs            — суд журнала (exit 1 на новых нарушениях)
//         node tools/experience-lint.mjs --write-baseline — переснять baseline (только руками,
//             с пересмотром глазами: baseline растить нельзя, команда печатает дельту)
//         node tools/experience-lint.mjs --selftest  — красный доказан мутацией, чистое молчит
// [TESTED: 2026-08-21 · --selftest зелёный: красный на записи без поля и на И4-ловушке с
//  «уроком о предмете», молчание на чистой записи и на baseline-долге]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JOURNAL = join(ROOT, 'EXPERIENCE.md');
const BASELINE = join(ROOT, 'tools', 'experience-lint.baseline.json');

// Поле И1 — русские и английские написания равноправны (журнал обвязки русский, канон-строки EN).
// БЕЗ \b: граница слова в JS слепа к кириллице (EXP-0082) — «механизировано» с \b не матчится.
const FIELD_MECH = /(mechanized|механизировано)\s*:/i;
const FIELD_NONE = /(none-cheap|механизации нет)\s*:/i;
const FIELD_SUBJ = /(subject-lesson|урок о предмете)/i;
// И4 — ловушка по форме. Паттерны узкие (в пределах строки), чтобы не красить обычную прозу.
const TRAP_FORM = /(сначала [^\n]{0,60}(?:потом|затем)|не забудь|перед тем как|всегда [^\n]{0,40}перед|first [^\n]{0,60}then|don'?t forget|before running)/i;

// Разбор журнала: записи открываются строкой `### EXP-NNNN · …`.
function parseEntries(text) {
  const entries = [];
  const re = /^### (EXP-\d+)[^\n]*\n/gm;
  let m, prev = null;
  while ((m = re.exec(text))) {
    if (prev) entries.push({ id: prev.id, body: text.slice(prev.end, m.index) });
    prev = { id: m[1], end: re.lastIndex };
  }
  if (prev) entries.push({ id: prev.id, body: text.slice(prev.end) });
  return entries;
}

// Суд: у записи ровно один законный исход И1; ловушка по форме сужает выбор до mechanized/none-cheap.
function judge(entries, baselineIds) {
  const inherited = [], fresh = [], mech = [];
  for (const e of entries) {
    const kind = FIELD_MECH.test(e.body) ? 'mech'
      : FIELD_NONE.test(e.body) ? 'none'
      : FIELD_SUBJ.test(e.body) ? 'subj' : null;
    if (kind === 'mech') mech.push(e.id);
    const trap = TRAP_FORM.test(e.body);
    const ok = trap ? (kind === 'mech' || kind === 'none') : kind !== null;
    if (ok) continue;
    (baselineIds.has(e.id) ? inherited : fresh).push({ id: e.id, trap });
  }
  return { inherited, fresh, mech };
}

function loadBaseline() {
  if (!existsSync(BASELINE)) return null;
  return new Set(JSON.parse(readFileSync(BASELINE, 'utf8')).ids);
}

// --selftest: страж, который ни разу не краснел, ничего не доказывает — оба ответа обязаны
// демонстрироваться (красный на дефекте И молчание на чистом), мутация — на синтетическом
// журнале в памяти, рабочее дерево не трогается.
function selftest() {
  const fixture = [
    '### EXP-0001 · 2026-01-01 · ❌ · #old',
    '**Lesson:** старая запись без поля — унаследованный долг.',
    '### EXP-0002 · 2026-01-02 · ✅ · #clean',
    '**Lesson:** чистая запись. урок о предмете',
    '### EXP-0003 · 2026-01-03 · ❌ · #fresh',
    '**Lesson:** новая запись без поля — обязана краснеть.',
    '### EXP-0004 · 2026-01-04 · ❌ · #trap',
    '**Lesson:** сначала прогони e2e, потом снимай кадры. урок о предмете',
  ].join('\n');
  const baseline = new Set(['EXP-0001']);
  const v = judge(parseEntries(fixture), baseline);
  const fails = [];
  if (v.inherited.length !== 1 || v.inherited[0].id !== 'EXP-0001')
    fails.push('baseline-долг не опознан долгом');
  if (!v.fresh.some((f) => f.id === 'EXP-0003'))
    fails.push('запись без поля НЕ покраснела');
  if (!v.fresh.some((f) => f.id === 'EXP-0004' && f.trap))
    fails.push('И4: ловушка по форме с «уроком о предмете» НЕ покраснела');
  if (v.fresh.some((f) => f.id === 'EXP-0002'))
    fails.push('чистая запись покраснела ложно');
  // Мутация-починка: поле none-cheap снимает красный — страж различает исходы, а не просто кричит.
  const healed = fixture.replace('обязана краснеть.', 'обязана краснеть. механизации нет: чинится только глазами.');
  if (judge(parseEntries(healed), baseline).fresh.some((f) => f.id === 'EXP-0003'))
    fails.push('починенная запись осталась красной');
  if (fails.length) { console.error('❌ experience-lint --selftest:\n  · ' + fails.join('\n  · ')); process.exit(1); }
  console.log('✅ experience-lint --selftest: красный доказан (без поля · И4-ловушка), чистое и baseline молчат, починка снимает красный');
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const entries = parseEntries(readFileSync(JOURNAL, 'utf8'));
  if (args.includes('--write-baseline')) {
    const prev = loadBaseline();
    const ids = entries.map((e) => e.id);
    writeFileSync(BASELINE, JSON.stringify({
      note: 'унаследованный долг механизации уроков (issue #14): только УМЕНЬШАЕТСЯ, новые записи сюда не вписываются',
      capturedAt: new Date().toISOString(),
      ids,
    }, null, 2) + '\n', 'utf8');
    console.log(`baseline переснят: ${ids.length} записей${prev ? ` (было ${prev.size})` : ''} — пересмотри дельту глазами, растить baseline нельзя`);
    return;
  }
  const baseline = loadBaseline();
  if (!baseline) {
    console.error('❌ experience-lint: нет tools/experience-lint.baseline.json — снять руками: node tools/experience-lint.mjs --write-baseline (с пересмотром глазами)');
    process.exit(1);
  }
  const v = judge(entries, baseline);
  console.log(`experience-lint: записей ${entries.length} · механизировано ${v.mech.length} · долг baseline ${v.inherited.length} (обязан убывать) · новых нарушений ${v.fresh.length}`);
  if (v.fresh.length) {
    for (const f of v.fresh) console.error(`  🔴 ${f.id}: ${f.trap ? 'триггер-фраза ловушки по форме — нужен mechanized/none-cheap' : 'нет поля механизации (mechanized/none-cheap/subject-lesson · механизировано/механизации нет/урок о предмете)'}`);
    process.exit(1);
  }
}

main();
