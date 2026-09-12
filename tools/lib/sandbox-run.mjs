// sandbox-run.mjs — помощник песочных сводов: команда, чей результат не судит ни один ассерт.
// [TESTED: 2026-08-09 · исполняется каждым сводом полигона; прогон зелёный — «all 14 suites green»]
// [TESTED: 2026-09-13 · quietEnv (bugs/116): селфтест — тихий ребёнок не находит и не запускает cmd.exe · powershell.exe
//  («cmd.exe=ENOENT powershell.exe=ENOENT», 01:11); проба безвредна и на СЛОМАННОЙ тишине — копии скретчпада: реальный PATH
//  → «cmd.exe=FOUND powershell.exe=FOUND» без запуска, ✗; реальный PATH без поиска → «cmd.exe=ran powershell.exe=ran»
//  (скрыто, exit 0), ✗; СТАРЫЙ генератор 2.6 в тихом окружении с незнакомым ему `--check` напечатал «NO WINDOW OPENED»,
//  «beeps failed (no PowerShell?)», «system voice — engine not installed» и умер по вахте тишины за ~1 с; своды s22
//  и s12 зелёные в тихом окружении]
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
import { execSync, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
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

// ── Тишина дочернего процесса: песочница не дотягивается до человека (bugs/116) ─────────────────
// Генератор интерактивного контура — машинерия, обращённая к ЧЕЛОВЕКУ: по умолчанию он поднимает окно
// (`cmd /c start msedge --app=…`, `open`, `xdg-open`) и зовёт голосом (`powershell.exe`, `say`). Своды
// гоняют его и против СТАРЫХ ядер (шов KAIF_DIST — красное доказательство), а старое ядро не знает
// новых флагов (`--check`, `--mark-implemented`) и на них делает действие по умолчанию — показывает
// страницу владельцу и зовёт его. Ночью 2026-09-12 так четыре прогона (22:57 · 23:09 · 23:54 · 00:09)
// подняли у владельца тестовую страницу «fresh · Interview #052 — проба» с системным голосом, и он
// отвечал в неё трижды. Флаг тишину не гарантирует (старое ядро флаг не знает) — гарантирует ОКРУЖЕНИЕ:
// PATH, в котором нет ни одной программы, так что ни окно, ни звук стартовать не могут на ЛЮБОЙ версии;
// голосовой инструмент (KAIF_VOICE_TOOL — абсолютный путь) вычеркнут; вахта тишины сжата, так что
// страница без клиента умирает за секунды, а жёсткий срок вызова убивает всё, что всё же ждёт.
// Node запускается абсолютным путём (process.execPath), поэтому своду PATH не нужен.
export const QUIET_TIMEOUT_MS = 30000;
// Каталога нет — и в нём нет ничего; он НЕ во временном каталоге (не общий ресурс по фиксированному имени, bugs/59)
// и никогда не создаётся: PATH указывает в пустоту рядом с самим node.
const QUIET_PATH = join(dirname(process.execPath), 'kaif-quiet-path-holds-no-programs');
const QUIET_DROP = new Set(['PATH', 'KAIF_VOICE_TOOL', 'KAIF_VOICE']);
export function quietEnv(extra = {}) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!QUIET_DROP.has(k.toUpperCase())) env[k] = v; // Windows: Path/PATH — любой регистр
  return { ...env, PATH: QUIET_PATH, KAIF_CONTOUR_TICK_MS: '300', KAIF_CONTOUR_SILENCE_MS: '900', ...extra };
}

const execFileSyncQuiet = (code) => {
  try { return execFileSync(process.execPath, ['-e', code], { env: quietEnv(), stdio: 'pipe', timeout: 15000 }).toString(); }
  catch (e) { return String(e.stdout || '') + String(e.stderr || '') + ' [child failed: ' + e.message + ']'; }
};

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
  // bugs/116: a child started with quietEnv() cannot start the programs a window or a voice needs — on ANY core version.
  // The names are exactly what the generator spawns BY NAME (framework/tools/contour/review.mjs → openWindow, beep,
  // voice): Windows — `cmd.exe` (every window: `cmd /c start … msedge|chrome --app=`) and `powershell.exe` (beep,
  // voice); macOS — `open`, `say`; Linux — the four Chromium names and `xdg-open`.
  // The probe must stay harmless even when quietEnv is BROKEN — a guard that fires the incident it guards against is
  // the incident (the first probe spawned `msedge /c exit 0`: a browser would have taken the arguments for addresses,
  // and `say` would have spoken on a Mac). So nothing that can show or sound is ever run: every name is first LOOKED UP
  // on the child's own PATH and working directory (the spawn search order) without running it; only the two Windows
  // shells are then really spawned, hidden (`windowsHide`), with an argument that exits at once — there ENOENT is the
  // proof from the spawn machinery itself, and a run would be invisible.
  const humanFacing = process.platform === 'win32' ? ['cmd.exe', 'powershell.exe']
    : process.platform === 'darwin' ? ['open', 'say'] : ['google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge', 'xdg-open'];
  const probe = "const {spawnSync}=require('child_process');const {existsSync}=require('fs');const {join,delimiter}=require('path');" +
    "const exts=process.platform==='win32'?['','.exe','.com'].concat((process.env.PATHEXT||'').toLowerCase().split(';').filter(Boolean)):[''];" +
    "const dirs=[process.cwd()].concat((process.env.PATH||'').split(delimiter).filter(Boolean));" +
    "const found=(e)=>dirs.some((d)=>exts.some((x)=>existsSync(join(d,e+x))));" +
    "const shells={'cmd.exe':['/d','/c','exit','0'],'powershell.exe':['-NoProfile','-NonInteractive','-Command','exit 0']};" +
    "const r=" + JSON.stringify(humanFacing) + ".map((e)=>{if(found(e))return e+'=FOUND';if(!shells[e])return e+'=UNRESOLVABLE';" +
    "const x=spawnSync(e,shells[e],{timeout:3000,windowsHide:true,stdio:'ignore'});return e+'='+(x.error?x.error.code:'ran')});console.log(r.join(' '))";
  const q = execFileSyncQuiet(probe);
  ok(humanFacing.every((e) => q.includes(e + '=ENOENT') || q.includes(e + '=UNRESOLVABLE')),
    'quietEnv: a child can neither find nor start ' + humanFacing.join(' · ') + ' (' + q.trim() + ')');
  ok(!('KAIF_VOICE_TOOL' in quietEnv({})) && quietEnv({}).PATH === QUIET_PATH && !existsSync(QUIET_PATH), 'quietEnv: no voice tool, PATH is a directory that holds nothing');
  rmSync(root, { recursive: true, force: true });
  if (bad) { console.error(`✖ sandbox-run selftest: ${bad} failed`); process.exit(1); }
  console.log('✅ sandbox-run selftest OK — forensic runner proves both answers');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && process.argv.includes('--selftest')) selftest();
