#!/usr/bin/env node
// [TESTED: 2026-08-09 · --selftest: «все 6 мутаций сбылись по предсказанию»]
// sandbox-mute-guard.mjs — страж КЛАССА «немая команда песочного свода» (bugs/61).
//
// ПРАВИЛО (одно): результат каждой команды свода обязан ДОЙТИ ДО АССЕРТА. Команда, чей результат
// не видит ни один `ok(...)`, — немая: когда она упадёт, красным станет чужой ассерт про симптом,
// а причину назвать будет нечем. Именно так родился bugs/61 — красный «история не выросла»
// вместо «второй update отказал и вот почему»; он не воспроизвёлся ни за 108 итераций изолята,
// ни за 12 полных прогонов свода, потому что улику никто не сохранил.
//
// Два законных хода у автора свода, оба видны в исходнике:
//   1. результат СУДИТСЯ — переменная команды упомянута внутри `ok(...)` (условием или уликой);
//   2. это установочный шаг — обёртка `must(run, …)` из `tools/lib/sandbox-run.mjs`, которая
//      останавливает свод на упавшей команде и печатает её имя, код и полный вывод.
// Третьего хода нет: «команда, которая просто выполняется» — это и есть класс.
//
// ДОЛГ НУЛЕВОЙ ПО ПОСТРОЕНИЮ. В отличие от стража места вопросов (там ratchet по унаследованному
// долгу), здесь весь долг закрыт в момент рождения стража — все 30 немых команд переведены на
// два законных хода. Поэтому страж — ГЕЙТ, а не советчик: любое новое немое место красит преполёт
// `npm run test:core`.
//
// Команды:
//   node tools/sandbox-mute-guard.mjs             — проверить своды (exit 1 при находках)
//   node tools/sandbox-mute-guard.mjs --selftest  — доказать, что страж УМЕЕТ КРАСНЕТЬ
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SUITES = join(REPO, 'tools', 'sandbox');
// Файл — И страж, И модуль: `scanSuite` переиспользуется инструментами (правка сводов, будущие
// проверки). Поэтому CLI исполняется ТОЛЬКО при прямом запуске — иначе импорт стража молча
// прогонял бы весь гейт и убивал импортёра своим `process.exit` (поймано при первой же правке).
const IS_CLI = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

// Имя команды: любой хелпер вида run/runTool/runHook/… Определения хелперов пропускаются —
// страж ищет ВЫЗОВЫ-ОПЕРАЦИИ, а не объявления.
const CALL_RE = /^\s*(?:(?:const|let|var)\s+(\w+)\s*=\s*|(\w+)\s*=\s*)?(run\w*)\(/;
const DECL_RE = /^\s*(?:const|let|var)\s+run\w*\s*=/;

// Разбирает исходник свода в список команд с вердиктом по каждой.
export function scanSuite(text) {
  const lines = text.split(/\r?\n/);
  const calls = [];
  lines.forEach((l, i) => {
    if (DECL_RE.test(l)) return;
    // `must(run, …)` — законный ход 2; вызов внутри обёртки командой-операцией не считается
    if (/^\s*must\(/.test(l)) return;
    const m = l.match(CALL_RE);
    if (m) calls.push({ line: i + 1, varName: m[1] || m[2] || null, src: l.trim() });
  });
  const findings = [];
  for (let k = 0; k < calls.length; k++) {
    const c = calls[k];
    // Окно — до следующей команды: судить результат позже неё уже поздно, состояние сменилось.
    const until = k + 1 < calls.length ? calls[k + 1].line - 1 : lines.length;
    const win = lines.slice(c.line - 1, until).join('\n');
    const reaches = c.varName && new RegExp(`ok\\([\\s\\S]*?\\b${c.varName}\\b`).test(win);
    if (!reaches) findings.push({ line: c.line, kind: c.varName ? 'результат не доходит до ассерта' : 'результат выброшен', src: c.src.slice(0, 90) });
  }
  return { total: calls.length, findings };
}

// --selftest: страж обязан покраснеть на СЛОМАННОЙ версии — иначе его зелёное ничего не значит
// (BUG_FIXING_FRAMEWORK → Стражи). Мутации бьют по обеим формам класса И по обоим законным ходам.
const MUTATIONS = [
  { name: 'выброшенный результат (форма 1)', red: true,
    src: `const ok = (c, n) => {};\nconst run = (d, a) => ({ code: 0, out: '' });\nrun(S, 'install');\nok(true, 'x');\n` },
  { name: 'результат присвоен, но ассерт судит побочный эффект (форма 2 — шкура bugs/61)', red: true,
    src: `const ok = (c, n) => {};\nconst run = (d, a) => ({ code: 0, out: '' });\nlet r = run(S, 'update');\nok(readFileSync(p).includes('x'), 'y');\n` },
  { name: 'законный ход 1 — результат дошёл до ассерта условием', red: false,
    src: `const ok = (c, n, e) => {};\nconst run = (d, a) => ({ code: 0, out: '' });\nlet r = run(S, 'update');\nok(r.code === 0, 'y', r.out);\n` },
  { name: 'законный ход 1 — результат дошёл до ассерта УЛИКОЙ (условие про артефакт)', red: false,
    src: `const ok = (c, n, e) => {};\nconst run = (d, a) => ({ code: 0, out: '' });\nlet r = run(S, 'update');\nok(readFileSync(p).includes('x'), 'y', r.out);\n` },
  { name: 'законный ход 2 — установочный шаг обёрнут must', red: false,
    src: `const ok = (c, n) => {};\nconst run = (d, a) => ({ code: 0, out: '' });\nmust(run, S, 'install');\nok(true, 'x');\n` },
  { name: 'определение хелпера командой не считается', red: false,
    src: `const ok = (c, n) => {};\nconst run = (d, a) => ({ code: 0, out: '' });\nok(true, 'x');\n` },
];

if (IS_CLI && process.argv.includes('--selftest')) {
  let bad = 0;
  for (const m of MUTATIONS) {
    const red = scanSuite(m.src).findings.length > 0;
    const okRes = red === m.red;
    console.log(`${okRes ? '✅' : '❌'} ${m.name} — ожидали ${m.red ? 'КРАСНЫЙ' : 'зелёный'}, получили ${red ? 'КРАСНЫЙ' : 'зелёный'}`);
    if (!okRes) bad++;
  }
  console.log(bad ? `\n❌ selftest: ${bad} мутаций не сбылись` : `\n✅ selftest: все ${MUTATIONS.length} мутаций сбылись по предсказанию`);
  process.exit(bad ? 1 : 0);
}

if (IS_CLI) {
  let total = 0, mute = 0;
  for (const f of readdirSync(SUITES).filter((n) => /^s\d\d.*\.mjs$/.test(n)).sort()) {
    const { total: t, findings } = scanSuite(readFileSync(join(SUITES, f), 'utf8'));
    total += t;
    for (const x of findings) { mute++; console.log(`✗ tools/sandbox/${f}:${x.line} — ${x.kind}\n    ${x.src}`); }
  }
  if (mute) {
    console.log(`\n❌ немых команд: ${mute} из ${total}. Два законных хода: судить результат ассертом` +
                ' (упомянуть переменную внутри `ok(...)` — условием или уликой) ИЛИ обернуть установочный' +
                ' шаг в `must(run, …)` из `tools/lib/sandbox-run.mjs`.');
    process.exit(1);
  }
  console.log(`✅ немых команд нет — все ${total} команд полигона либо судятся ассертом, либо обёрнуты must (bugs/61)`);
}
