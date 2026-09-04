// sandbox-run.mjs — помощник песочных сводов: команда, чей результат не судит ни один ассерт.
// [TESTED: 2026-08-09 · исполняется каждым сводом полигона; прогон зелёный — «all 14 suites green»]
//
// ПОЧЕМУ ЭТО СУЩЕСТВУЕТ (bugs/61). Свод состоит из двух разных вещей: КОМАНД, приводящих дерево
// в нужное состояние, и АССЕРТОВ, судящих получившееся состояние. Между ними была дыра: у
// 30 команд из 229 результат не доходил ни до одного `ok()` — либо выбрасывался целиком
// (`run(S9, 'install');`), либо присваивался и не читался, пока соседний ассерт судил ПОБОЧНЫЙ
// ЭФФЕКТ команды. Когда такая команда падает, красным становится чужой ассерт про симптом
// («история не выросла»), а причина — код возврата и вывод упавшей команды — выбрасывается.
// Ровно так родился bugs/61: красный, который не воспроизвёлся ни за 108 итераций изолята, ни за
// 12 полных прогонов свода, потому что назвать его было НЕЧЕМ.
//
// ФОРМА, а не дисциплина: установочный шаг оборачивается в `must`, и упавший шаг останавливает
// свод НА СЕБЕ, назвав команду, код возврата и полный вывод. Класс стережёт
// `tools/sandbox-mute-guard.mjs` при НУЛЕВОМ долге — новая немая команда красит преполёт
// `npm run test:core` до того, как успеет стать чьим-то необъяснимым красным.
//
// Зелёный вывод свода этот помощник НЕ меняет: на успехе `must` молчит и возвращает результат
// как обычный вызов (доказано побайтным сравнением вывода всех 14 сводов до и после).

// Обёртка установочного шага. Вызывается формой `must(run, S9, 'install')`, а не
// `must(run(S9, 'install'))`: так помощник знает АРГУМЕНТЫ и может назвать команду в отказе —
// обёртка вокруг готового результата назвать её уже не может (EXP-0008: ошибка инструмента
// несёт готовое решение, никогда — обход).
export function must(runner, ...args) {
  const res = runner(...args);
  if (res && res.code === 0) return res;
  const cmd = args.filter((a) => typeof a === 'string').join(' ');
  console.log(`❌ УСТАНОВОЧНЫЙ ШАГ УПАЛ: \`${cmd}\` — exit ${res ? res.code : '?'}`);
  console.log('   Это не ассерт: свод останавливается здесь, потому что всё, что он проверял бы');
  console.log('   дальше, судило бы дерево, приведённое в состояние НЕ ТОЙ командой.');
  console.log(`   --- полный вывод команды ---\n${res ? res.out : '(результата нет)'}`);
  process.exit(1);
}

// ── Форензика упавшей команды (bugs/109) ─────────────────────────────────────────────────────
// Второй класс той же дыры: команда ПОПАЛА в ассерт, но упала, и свод показал 300–400 символов
// хвоста её stdout — а `status/signal/code`, stderr и всё, что команда напечатала до смерти,
// выбросил. Так три флейка `update` за день (s07 ×2, s10 ×1) остались без причины: обрыв после
// строки версии, и назвать его нечем. Форма, а не дисциплина: раннер пишет ПОЛНЫЙ вывод и
// заголовок упавшего вызова файлом `run-fail-N.log` в корень прогона (красный прогон корень
// ОСТАВЛЯЕТ — tools/lib/temp-root.mjs), а строка ассерта получает путь к нему. Зелёный вывод
// не меняется (та же командная строка, тот же `2>&1`).
//   @forensic polygon-run-fail
//   EXPLAINS:   смерть команды ядра/модуля внутри свода — команда · cwd · status/signal/code · полный вывод
//   DURABLE-AT: возврат из execSync с ошибкой — файл записан ДО того, как свод решит, что делать дальше
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

let runFails = 0;
/** Результат упавшего вызова + файл форензики; вызывается из `catch` любого раннера свода. */
export function failed(e, { root, cwd, args }) {
  const out = (e.stdout || '').toString() + (e.stderr || '').toString();
  const dump = join(root, `run-fail-${++runFails}.log`);
  try {
    writeFileSync(dump, `# ${args}\n# cwd ${cwd}\n# status ${e.status} signal ${e.signal} code ${e.code} message ${e.message}\n\n${out}`);
  } catch { /* best-effort forensics: a failed dump must not hide the original failure */ }
  return { code: e.status ?? 1, out: out + `\n[full output of the failed run → ${dump}]` };
}
/** Стандартный раннер команд ядра свода: `run(cwd, args)` → `{ code, out }`, stderr слит в out. */
export function coreRunner(root, { maxBuffer = 64 * 1024 * 1024 } = {}) {
  return (cwd, args) => {
    try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe', maxBuffer }).toString() }; }
    catch (e) { return failed(e, { root, cwd, args }); }
  };
}

// --selftest: оба ответа — красная команда оставляет файл с заголовком и выводом, зелёная —
// ничего не оставляет, и её вывод побайтно равен прямому вызову.
function selftest() {
  const root = join(tmpdir(), `kaif-sandbox-run-${process.pid}`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, '.kaif'), { recursive: true });
  const core = join(root, '.kaif', 'kaif-core.mjs');
  let bad = 0;
  const ok = (c, name) => { console.log((c ? '  ✓ ' : '  ✗ ') + name); if (!c) bad++; };
  writeFileSync(core, "console.log('line one'); console.error('boom'); process.exit(3);\n");
  const run = coreRunner(root);
  const r = run(root, 'update --x');
  const dump = join(root, 'run-fail-1.log');
  ok(r.code === 3 && existsSync(dump), 'red command: exit code kept, run-fail-1.log written');
  const d = existsSync(dump) ? readFileSync(dump, 'utf8') : '';
  ok(/^# update --x\n# cwd /.test(d) && /# status 3 /.test(d) && /line one/.test(d) && /boom/.test(d), 'dump carries the command, cwd, status and the full stdout+stderr');
  ok(/\[full output of the failed run → /.test(r.out), 'the assert line points at the dump');
  writeFileSync(core, "console.log('green'); console.error('note');\n");
  const g = run(root, 'check');
  const direct = execSync(`node ${core} check 2>&1`, { cwd: root, stdio: 'pipe' }).toString();
  ok(g.code === 0 && g.out === direct && !existsSync(join(root, 'run-fail-2.log')), 'green command: output equals the direct call byte for byte, no dump');
  rmSync(root, { recursive: true, force: true });
  if (bad) { console.error(`✖ sandbox-run selftest: ${bad} failed`); process.exit(1); }
  console.log('✅ sandbox-run selftest OK — forensic runner proves both answers');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && process.argv.includes('--selftest')) selftest();
