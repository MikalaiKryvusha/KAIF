// s14-refresh-hooks.mjs — песочница опционального модуля refresh-hooks (2.2, эпик O, фаза O3,
// [TESTED: 2026-08-09 · зелёный в составе полигона — «sandbox suite: all 14 suites green» (npm run test:core)]
// план 57 критерии 1–2). Проверяет ОБА плеча опциональности (инвариант §9 п. 10
// researches/15 — «развёртывание без новых режимов не краснеет»):
// (а) деплой С модулем — файлы доезжают в .kaif/hooks/ и работают по живому контракту Claude
//     Code (JSON на stdin → hookSpecificOutput/decision на stdout);
// (б) деплой БЕЗ ПОДКЛЮЧЕНИЯ — settings.json нет, ни один гейт не требует wiring: всё зелено.
// Опциональность здесь = АКТИВАЦИЯ, а не отсутствие файлов: УДАЛЕНИЕ развёрнутых файлов даёт
// честный MISSING — ровно как у tool-модулей (прецедент проверен: rm kaif-provenance.mjs →
// тот же MISSING). Обе половины ассертятся ниже.
// Поведение хуков проверяется на РАЗВЁРНУТЫХ копиях, не на исходниках (EXP-0010: у производной
// поверхности проверяется то же свойство, что у оригинала).
// Красный доказан против HEAD-бандла ДО поставки модуля (в нём FILE-блоков .kaif/hooks нет —
// деплой-ассерты падали; наблюдение зафиксировано в plans/57).
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, utimesSync, readdirSync } from 'node:fs';
import { execSync, execFileSync, spawnSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// KAIF_DIST — шов для доказательства красного: свод против ЧУЖОЙ сборки (ядро 2.6 без четвёртого хука,
// мутант с сломанным предикатом), без правки кода (соглашение s22).
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('hooks', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-250)));
  if (!cond) failures++;
};
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args}`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: cwd, args: args }); }
};
// Запуск хука как его запускает агентская система: JSON на stdin, JSON (или тишина) на stdout.
// Терпим к отсутствию/крашу скрипта: свод досчитывает все ассерты (EXP-0027 — краш затирает счёт)
const runHook = (cwd, script, input) => {
  try { return execFileSync(process.execPath, [join(cwd, '.kaif', 'hooks', script)], { input: JSON.stringify(input), cwd }).toString(); }
  catch (e) { return `<HOOK-CRASH: ${String(e.message).slice(0, 120)}>`; }
};
// Терпимый парс stdout хука: не-JSON читается как пустой объект, ассерты честно краснеют
const parseHook = (s) => { try { return JSON.parse(s); } catch { return {}; } };

// ---------------------------------------------------------------- деплой С модулем
console.log('\n=== s14: деплой с модулем refresh-hooks ===');
const S = join(ROOT, 'with-hooks'); mkdirSync(join(S, '.kaif', 'install'), { recursive: true });
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
let r = run(S, 'install');
ok(r.code === 0, 's14 install exit 0', r.out.slice(-400));
const HOOK_FILES = ['session-start-refresh.mjs', 'prompt-refresh-timer.mjs', 'stop-status-guard.mjs',
                    'prompt-resume-word.mjs', // 2.7, эпик RS: первое слово промпта resume → приказ /resume
                    'pretool-owner-word.mjs', // 2.8, эпик OW: слово владельца посреди хода без ТЕКСТА в ответ → вызов отказан (bugs/123)
                    'settings-fragment.json', 'README.md',
                    // фаза O5: образцы под остальные системы с ПОДТВЕРЖДЁННЫМ живым контрактом
                    'sample-codex-hooks.json', 'sample-cursor-hooks.json',
                    'sample-copilot-hooks.json', 'sample-antigravity-hooks.json'];
for (const f of HOOK_FILES)
  ok(existsSync(join(S, '.kaif', 'hooks', f)), `s14 деплой: .kaif/hooks/${f} доехал`);
r = run(S, 'check');
ok(r.code === 0, 's14 check зелёный при развёрнутом модуле', r.out.slice(-400));

// образец конфига: валидный JSON, три события, matcher сжатия, пути на все три скрипта
// (терпимое чтение: на красном прогоне без файла свод обязан ДОСЧИТАТЬ остальные ассерты,
// а не крашнуться — краш затирает честный счёт провалов, EXP-0027)
let frag = {};
try { frag = JSON.parse(readFileSync(join(S, '.kaif', 'hooks', 'settings-fragment.json'), 'utf8')); } catch { /* ассерты ниже честно красные */ }
ok(!!(frag.hooks && frag.hooks.SessionStart && frag.hooks.UserPromptSubmit && frag.hooks.Stop),
   's14 фрагмент конфига: три события SessionStart/UserPromptSubmit/Stop');
ok(frag.hooks && frag.hooks.SessionStart?.[0]?.matcher === 'compact|clear',
   's14 фрагмент конфига: SessionStart с matcher compact|clear');
const fragTxt = JSON.stringify(frag);
ok(HOOK_FILES.slice(0, 5).every((f) => fragTxt.includes(`.kaif/hooks/${f}`)) && frag.hooks && Array.isArray(frag.hooks.PreToolUse),
   's14 фрагмент конфига: команды указывают на все четыре развёрнутых скрипта (четвёртый — resume-word, 2.7)');

// ---------------------------------------------------------------- поведение: SessionStart
console.log('\n=== s14: поведение хуков (живой контракт: stdin JSON → stdout JSON) ===');
let out = runHook(S, 'session-start-refresh.mjs', { hook_event_name: 'SessionStart', source: 'compact', cwd: S });
let js = parseHook(out);
ok(js.hookSpecificOutput?.hookEventName === 'SessionStart',
   's14 SessionStart: hookSpecificOutput.hookEventName корректен (вложенная форма контракта)');
const ctx = js.hookSpecificOutput?.additionalContext || '';
ok(/re-read core/.test(ctx) && /refresh-marker\.json/.test(ctx) && /quote/.test(ctx),
   's14 SessionStart: приказ несёт ядро перечитывания + маркер + цитату-приёмку (не тела документов)');
ok(ctx.length > 0 && ctx.length < 10000, 's14 SessionStart: впрыск под капом 10 000 символов', String(ctx.length));
ok(/"trigger": "compaction"/.test(ctx), 's14 SessionStart: после сжатия приказан trigger "compaction"');
// матчер ловит и /clear — приказанный триггер обязан следовать СОБЫТИЮ, а не быть жёстким
// (находка судьи фазы O3: маркер после /clear стампился бы как "compaction")
const clearCtx = parseHook(runHook(S, 'session-start-refresh.mjs',
  { hook_event_name: 'SessionStart', source: 'clear', cwd: S })).hookSpecificOutput?.additionalContext || '';
ok(/"trigger": "ritual:\/clear"/.test(clearCtx) && /cleared/.test(clearCtx),
   's14 SessionStart: после /clear приказан trigger "ritual:/clear", не "compaction"', clearCtx.slice(0, 200));

// ---------------------------------------------------------------- поведение: таймер освежения
// нет маркера → приказ; свежий маркер → ТИШИНА; протухший (2 ч) → приказ с возрастом;
// битый JSON при свежем mtime → тишина (фолбэк на mtime работает)
const marker = join(S, '.kaif', 'refresh-marker.json');
rmSync(marker, { force: true });
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(/no refresh witness/.test(out) && /UserPromptSubmit/.test(out),
   's14 таймер: маркера нет — приказ освежиться (сессия ни разу не освежалась)');
writeFileSync(marker, JSON.stringify({ at: new Date().toISOString(), docs: [], trigger: 'ritual:/resume' }));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(out === '', 's14 таймер: свежий маркер — ТИШИНА (предикат-антишум; молчание — норма)', out.slice(0, 120));
writeFileSync(marker, JSON.stringify({ at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), docs: [], trigger: 'hour' }));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(/last refresh 1\d\d min ago/.test(out), 's14 таймер: маркер протух (2 ч) — приказ называет возраст', out.slice(0, 160));
writeFileSync(marker, 'not json at all');
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(out === '', 's14 таймер: битый JSON при свежем mtime — тишина (фолбэк на mtime файла)', out.slice(0, 120));
// bugs/121 F11: маркер `[TESTED]` таймера называл свидетелем ЭТОТ свод и перечислял свойство
// «malformed+old speaks», которого свод хуку ни разу не подавал (битый маркер шёл только со свежим
// mtime). Адресат мутанта назван заранее (EXP-0059): `if (Number.isNaN(at)) { statSync(markerPath);
// at = Date.now(); }` краснит ровно этот ассерт; удаление фолбэка целиком — другой мутант (краснит и соседа).
const twoHoursAgoSec = (Date.now() - 2 * 3600 * 1000) / 1000;
utimesSync(marker, twoHoursAgoSec, twoHoursAgoSec);
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(/last refresh 1\d\d min ago/.test(out), 's14 таймер: битый JSON при СТАРОМ mtime (2 ч) — приказ называет возраст по mtime (bugs/121 F11)', out.slice(0, 160));
// bugs/119 №3, половина МАРКЕРА: маркер с BOM (так пишет `Set-Content -Encoding UTF8`) читается по СВОЕМУ
// `at`, а не съезжает молча на mtime: `at` двухчасовой давности при СВЕЖЕМ mtime обязан дать приказ с возрастом.
// BOM — БАЙТАМИ, а не символом в исходнике: невидимый символ внутри кода не виден ни глазу, ни диффу (bugs/122).
const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);
writeFileSync(marker, Buffer.concat([BOM, Buffer.from(JSON.stringify({ at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), docs: [], trigger: 'hour' }), 'utf8')]));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(/last refresh 1\d\d min ago/.test(out), 's14 таймер: маркер с BOM читается по своему `at` (2 ч), а не по свежему mtime (bugs/119 №3)', out.slice(0, 160));

// ---------------------------------------------------------------- поведение: слово resume — приказ (2.7, эпик RS)
// Первое слово промпта — resume / /resume / резюм… → приказ исполнить /resume ЦЕЛИКОМ до работы над
// остальным сообщением; промпт без слова, то же слово НЕ первым (проза — граница пинка), событие без
// поля prompt → ТИШИНА (предикат-антишум; молчание — норма). Красный доказан швом KAIF_DIST: на ядре
// 2.6 файла нет (ассерт «доехал» и три «приказа» красные), на мутанте с сломанным предикатом три
// «приказа» красные при зелёных «тишинах» (plans/110, RS6).
console.log('\n=== s14: хук prompt-resume-word — первое слово владельца (эпик RS 2.7) ===');
const resumeHook = (prompt) => runHook(S, 'prompt-resume-word.mjs',
  prompt === undefined ? { hook_event_name: 'UserPromptSubmit', cwd: S }
                       : { hook_event_name: 'UserPromptSubmit', cwd: S, prompt });
const isResumeOrder = (o) => {
  const j = parseHook(o); const c = j.hookSpecificOutput?.additionalContext || '';
  return j.hookSpecificOutput?.hookEventName === 'UserPromptSubmit' && /\/resume/.test(c) && /IN FULL/.test(c) && c.length < 10000;
};
ok(isResumeOrder(resumeHook('resume\nделаем эпик LP')), 's14 resume-word: «resume» первым словом, задача ниже — приказ исполнить /resume целиком (под капом)');
ok(isResumeOrder(resumeHook('Резюм. Продолжаем версию 2.7')), 's14 resume-word: «Резюм.» первым словом (кириллица, регистр, точка) — приказ');
ok(isResumeOrder(resumeHook('/resume')), 's14 resume-word: «/resume» — приказ');
ok(resumeHook('делаем эпик LP') === '', 's14 resume-word: промпт без слова — ТИШИНА', resumeHook('делаем эпик LP').slice(0, 120));
ok(resumeHook('продолжай читать resume.log и скажи, что видишь') === '', 's14 resume-word: слово не первым (проза, граница пинка) — ТИШИНА');
ok(resumeHook(undefined) === '', 's14 resume-word: событие без поля prompt — ТИШИНА (предикат по тексту не угадывается)');
// [TESTED: 2026-09-25 17:43 +03:00 · +7 случаев OW2 — 95 проверок зелёные; на dist v2.7 — «ПРОВАЛОВ: 5», ровно пять новых поведений («resume:» и «стопка» — прежнее
//  поведение, зелёные по построению); мутанты M8–M10 tools/sandbox/probes/hooks-mutants.mjs — на адресатах; отчёт testcases/reports/2026-09-25_ow2-owner-word-mid-turn.md]
// 2.8, эпик OW, шаг OW2 (критерий 5 plans/117; находки D-F4 суда 2.7 и Q-R7 разведки 2.8): повелительный глагол перед словом — всё
// ещё приказ (так открывались две полевые сессии, и хук молчал); существительное заголовком — «Резюме: …» с двоеточием — проза.
// Ведущее «стоп» — приказ остановиться (усилитель правила «слово владельца посреди хода»; «стопка» — не слово «стоп»).
const isStopOrder = (o) => {
  const j = parseHook(o); const c = j.hookSpecificOutput?.additionalContext || '';
  return j.hookSpecificOutput?.hookEventName === 'UserPromptSubmit' && /OPENS with the word "stop"/.test(c) && /Stop NOW/.test(c) && !/\/resume/.test(c);
};
ok(isResumeOrder(resumeHook('выполни resume\nпродолжаем делать версию 2.8')), 's14 resume-word: «выполни resume» — повелительный глагол перед словом, приказ (Q-R7)');
ok(resumeHook('Резюме: за сессию закрыто три шага') === '', 's14 resume-word: «Резюме: …» — существительное заголовком, ТИШИНА (D-F4)', resumeHook('Резюме: за сессию закрыто три шага').slice(0, 120));
ok(isResumeOrder(resumeHook('resume: continue the plan')), 's14 resume-word: английское «resume:» — по-прежнему приказ (граница — русское существительное)');
ok(isStopOrder(resumeHook('стоп')), 's14 stop-word: «стоп» первым словом — приказ остановиться в этом ходу');
ok(isStopOrder(resumeHook('СТОП! статус и стоп')), 's14 stop-word: «СТОП!» (регистр, знак) — приказ остановиться');
ok(isStopOrder(resumeHook('stop, why did you publish it?')), 's14 stop-word: «stop, …» — приказ остановиться (цена несимметрична: стоп и ответ)');
ok(resumeHook('стопка книг на столе') === '', 's14 stop-word: «стопка» — не слово «стоп», ТИШИНА');
ok(resumeHook('Стоп-слова в линтере надо расширить') === '', 's14 stop-word: «Стоп-слова …» — составное слово через дефис, не приказ, ТИШИНА (суд RL1, B-F6)');

// ---------------------------------------------------------------- поведение: страж STATUS
// git-фикстура: работа в сессии есть (грязное дерево) И STATUS.md старше 3 ч → мягкий блок;
// повторный Stop той же сессии → тишина (cooldown раз/сессию); свежий STATUS → тишина;
// не-git директория → тишина (страж не краснеет там, где не может наблюдать)
// терпимое копирование развёрнутых хуков в фикстуру (на красном прогоне их нет — EXP-0027)
const seedHooks = (dst) => {
  mkdirSync(join(dst, '.kaif', 'hooks'), { recursive: true });
  for (const f of HOOK_FILES) { try { cpSync(join(S, '.kaif', 'hooks', f), join(dst, '.kaif', 'hooks', f)); } catch { /* ассерты честно красные */ } }
};
const G = join(ROOT, 'git-fx'); mkdirSync(G, { recursive: true });
seedHooks(G);
const git = (...a) => execFileSync('git', a, { cwd: G, stdio: 'pipe' });
git('init', '-q'); git('config', 'user.email', 'sbx@sbx'); git('config', 'user.name', 'sbx');
writeFileSync(join(G, 'STATUS.md'), '# status');
git('add', '.'); git('commit', '-qm', 'seed');
const oldSec = (Date.now() - 5 * 3600 * 1000) / 1000;
utimesSync(join(G, 'STATUS.md'), oldSec, oldSec);          // STATUS «не тронут» 5 часов
writeFileSync(join(G, 'work.txt'), 'w');                    // работа сессии есть — дерево грязное
const sid = `sbx-${process.pid}-${Date.now()}`;
out = runHook(G, 'stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: G, session_id: sid });
js = parseHook(out);
ok(js.decision === 'block' && /STATUS\.md/.test(js.reason || ''),
   's14 страж STATUS: работа есть + STATUS протух — мягкий блок с причиной');
out = runHook(G, 'stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: G, session_id: sid });
ok(out === '', 's14 страж STATUS: повторный Stop той же сессии — тишина (cooldown раз/сессию)', out.slice(0, 120));
const nowSec = Date.now() / 1000;
utimesSync(join(G, 'STATUS.md'), nowSec, nowSec);
out = runHook(G, 'stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: G, session_id: sid + '-b' });
ok(out === '', 's14 страж STATUS: STATUS свежий — тишина', out.slice(0, 120));
const NG = join(ROOT, 'no-git'); seedHooks(NG);
writeFileSync(join(NG, 'STATUS.md'), '# s'); utimesSync(join(NG, 'STATUS.md'), oldSec, oldSec);
out = runHook(NG, 'stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: NG, session_id: sid + '-c' });
ok(out === '', 's14 страж STATUS: не-git проект — тишина (не краснеет там, где не наблюдает)', out.slice(0, 120));

// ---------------------------------------------------------------- ось BOM: событие в двух лицах (bugs/119 №3)
// Windows PowerShell 5.1 на консоли UTF-8 ставит три байта EF BB BF перед ЛЮБОЙ строкой, поданной в
// native-команду; `JSON.parse` на них падал, и хук МОЛЧА съезжал на дефолты: приказ `/resume` пропадал,
// `clear` штамповался как `compaction`, таймер и страж теряли `cwd` события. Событие подаётся БАЙТАМИ
// (Buffer, не строкой в argv — EXP-0121) в двух лицах, с BOM и без; вывод обязан совпасть побайтно.
// Каждая пара РАЗЛИЧАЮЩАЯ (EXP-0059): процесс хука стоит в ROOT, где нет ни маркера, ни STATUS.md, а `cwd`
// события указывает на фикстуру — хук, потерявший событие, отвечает иначе, чем прочитавший его.
// Адресаты красного названы заранее: на сборке до фикса (шов KAIF_DIST) красные ровно эти четыре пары.
console.log('\n=== s14: событие с BOM читается как событие без него (bugs/119 №3) ===');
const hookBytes = (script, event, withBom) => {
  const body = Buffer.from(JSON.stringify(event) + '\r\n', 'utf8'); // хвост CRLF — так строку подаёт PowerShell
  try { return execFileSync(process.execPath, [join(S, '.kaif', 'hooks', script)], { input: withBom ? Buffer.concat([BOM, body]) : body, cwd: ROOT }).toString(); }
  catch (e) { return `<HOOK-CRASH: ${String(e.message).slice(0, 120)}>`; }
};
const bomTwins = (script, clean, bommed) => ({ clean: hookBytes(script, clean, false), bom: hookBytes(script, bommed || clean, true) });
let tw = bomTwins('prompt-resume-word.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S, prompt: 'resume\nplan the day' });
ok(isResumeOrder(tw.clean) && tw.bom === tw.clean, 's14 BOM resume-word: событие с BOM даёт ТОТ ЖЕ приказ /resume, побайтно', `без BOM ${tw.clean.length} симв. · с BOM ${tw.bom.length} симв.`);
tw = bomTwins('session-start-refresh.mjs', { hook_event_name: 'SessionStart', source: 'clear', cwd: S });
ok(/ritual:\/clear/.test(tw.clean) && tw.bom === tw.clean, 's14 BOM SessionStart: `clear` с BOM приказывает trigger "ritual:/clear", а не дефолтный "compaction"', tw.bom.slice(0, 200));
const TF = join(ROOT, 'timer-fx'); mkdirSync(join(TF, '.kaif'), { recursive: true });
writeFileSync(join(TF, '.kaif', 'refresh-marker.json'), JSON.stringify({ at: new Date().toISOString(), docs: [], trigger: 'hour' }));
tw = bomTwins('prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: TF });
ok(tw.clean === '' && tw.bom === tw.clean, 's14 BOM таймер: `cwd` события с BOM прочитан — свежий маркер фикстуры даёт тишину в обоих лицах', tw.bom.slice(0, 160));
utimesSync(join(G, 'STATUS.md'), oldSec, oldSec);           // STATUS фикстуры снова «не тронут» 5 часов
tw = bomTwins('stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: G, session_id: sid + '-bom-a' },
                                       { hook_event_name: 'Stop', cwd: G, session_id: sid + '-bom-b' }); // cooldown раз/сессию → два id
ok(parseHook(tw.clean).decision === 'block' && tw.bom === tw.clean, 's14 BOM страж STATUS: `cwd` и `session_id` события с BOM прочитаны — тот же мягкий блок, побайтно', tw.bom.slice(0, 160));

// ---------------------------------------------------------------- ось «инструкция исполнима адресатом» (bugs/121 F9)
// README модуля — единственный документ, по которому ЧЕЛОВЕК подключает хуки, и его командные строки не
// исполнял никто: проба была записана POSIX-синтаксисом (`< /dev/null`, `printf`), а на оболочке владельца
// (Windows PowerShell 5.1) первая строка — ошибка разбора, второй команды нет вовсе. Теперь README несёт по
// блоку на оболочку (```sh · ```powershell), а свод ИСПОЛНЯЕТ каждую строку каждого блока в ЕЁ оболочке на
// развёрнутой копии и читает вывод. Ожидания — ПО ПОЗИЦИИ строки: новая строка в README краснит счёт, пока
// её ожидание не выписано здесь (тот же ход, что у оси имён: конфиг без названного контракта падает).
// Строка кладётся в ФАЙЛ сценария и запускается по пути — не через argv оболочки (EXP-0121, EXP-0034).
// Окон и звука нет: оболочки запускаются скрыто (`windowsHide`), stdin оболочки закрыт, срок вызова жёсткий.
// ЧЕГО ЭТОТ ЗАПУСК НЕ ВИДИТ (судья сессии 67, мутант J1): закрытый stdin отдаёт хуку EOF мгновенно, поэтому строка,
// потерявшая свой пустой stdin (`< /dev/null`, `'' |`), здесь не зависает и НЕ краснеет — 87 из 87 зелёных. Прежняя
// редакция этого комментария утверждала обратное («строка, ждущая терминала, краснеет») о проверке, которой не было.
// Грабля README — хук, запущенный руками БЕЗ stdin, ждёт терминал — ловится только по ТЕКСТУ строки: статический
// ассерт ниже требует, чтобы каждая строка каждого блока давала хуку stdin перенаправлением или конвейером.
console.log('\n=== s14: проба из README исполняется в оболочке адресата (bugs/121 F9) ===');
const readmeTxt = (() => { try { return readFileSync(join(S, '.kaif', 'hooks', 'README.md'), 'utf8'); } catch { return ''; } })();
const smokeBlocks = (lang) => [...readmeTxt.matchAll(new RegExp('^[ \\t]*```' + lang + '[ \\t]*\\r?\\n([\\s\\S]*?)^[ \\t]*```[ \\t]*$', 'gm'))]
  .map((m) => m[1].split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
const SMOKE_EXPECT = [
  ['приказ таймера (маркера нет)', (o) => /no refresh witness/.test(o) && parseHook(o).hookSpecificOutput?.hookEventName === 'UserPromptSubmit'],
  ['приказ исполнить /resume', (o) => isResumeOrder(o)],
  ['тишина', (o) => o === ''],
];
const shBlocks = smokeBlocks('sh'), psBlocks = smokeBlocks('powershell');
ok(shBlocks.length === 1 && psBlocks.length === 1, 's14 проба README: по ОДНОМУ блоку на оболочку — ```sh и ```powershell', `sh: ${shBlocks.length} · powershell: ${psBlocks.length}`);
ok((shBlocks[0] || []).length === SMOKE_EXPECT.length && (psBlocks[0] || []).length === SMOKE_EXPECT.length,
   `s14 проба README: в каждом блоке ровно ${SMOKE_EXPECT.length} строки — у каждой выписано ожидание по позиции`,
   `sh: ${(shBlocks[0] || []).length} · powershell: ${(psBlocks[0] || []).length}`);
// Статическая половина оси (F1 судьи сессии 67). Пустой набор строк — красный, а не пустая истина: на сборке без блоков
// ассерт обязан упасть вместе с остальными, иначе он зеленеет тем охотнее, чем меньше README обещает.
// Обе ветки привязаны к САМОМУ ХУКУ, хвост после « #» срезается (находка 2 лёгкого судьи дельты f4915af: строки
// `node <хук> # < /dev/null` и `node <хук> | node -e …` проходили 88/0 — первая редакция видела форму текста, а не то,
// что stdin получает ХУК).
const HOOK_CALL = 'node\\s+\\.kaif/hooks/\\S+';
const FED_BY_REDIRECT = new RegExp(HOOK_CALL + '\\s*<\\s*/dev/null\\s*$');
const FED_BY_PIPE = new RegExp('\\|\\s*' + HOOK_CALL + '\\s*$');
const feedsStdin = (line) => { const code = line.replace(/\s#.*$/, ''); return FED_BY_REDIRECT.test(code) || FED_BY_PIPE.test(code); };
const smokeLines = [...(shBlocks[0] || []).map((l) => ['sh', l]), ...(psBlocks[0] || []).map((l) => ['powershell', l])];
const starving = smokeLines.filter(([, l]) => !feedsStdin(l));
ok(smokeLines.length > 0 && starving.length === 0,
   's14 проба README: каждая строка каждого блока даёт хуку stdin (перенаправление или конвейер) — запущенный руками без него хук ждёт терминал',
   smokeLines.length ? (starving.map(([t, l]) => `[${t}] ${l}`).join(' · ') || `все ${smokeLines.length} строк кормят stdin`) : 'в README нет ни одной строки пробы');
// POSIX-оболочка на Windows — ТОЛЬКО bash из поставки Git: `bash.exe` из PATH может оказаться WSL, а это другой мир файлов.
const gitBash = (() => {
  if (process.platform !== 'win32') return '/bin/sh';
  try {
    const cand = resolve(execFileSync('git', ['--exec-path'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(), '..', '..', '..', 'bin', 'bash.exe');
    return existsSync(cand) ? cand : null;
  } catch { return null; }
})();
const SHELLS = [
  { tag: 'sh', ext: 'sh', exe: gitBash, args: [], lines: shBlocks[0] || [], why: 'POSIX-оболочка не найдена (на Windows ищется bash поставки Git)' },
  { tag: 'powershell', ext: 'ps1', exe: process.platform === 'win32' ? 'powershell.exe' : null,
    args: ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File'], lines: psBlocks[0] || [],
    why: 'Windows PowerShell есть только на Windows — блок ```powershell на этой платформе не исполнялся' },
];
const SM = join(ROOT, 'smoke-fx'); seedHooks(SM);             // развёрнутые хуки, маркера НЕТ — как велит README
for (const sh of SHELLS) {
  if (!sh.exe) { console.log(`⚪ SKIPPED [${sh.tag}]: ${sh.why}`); continue; }
  const outs = sh.lines.map((line, i) => {
    const file = join(SM, `smoke-${sh.tag}-${i + 1}.${sh.ext}`);
    writeFileSync(file, line + '\n');
    try { return execFileSync(sh.exe, [...sh.args, file], { cwd: SM, stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000, windowsHide: true }).toString().trim(); }
    catch (e) { return `<SHELL-FAILED: ${String(e.message).slice(0, 160)}>`; }
  });
  SMOKE_EXPECT.forEach(([what, judge], i) => ok(judge(outs[i] ?? '<строки нет>'),
    `s14 проба README [${sh.tag}] строка ${i + 1}: ${what}`, `${sh.lines[i] || '<строки нет>'} → ${String(outs[i]).slice(0, 140)}`));
}

// ---------------------------------------------------------------- O5: образцы под другие системы
// Фаза O5 (план 60): у каждой системы с ПОДТВЕРЖДЁННЫМ живым контрактом — свой образец конфига.
// Стережём три класса, каждый из которых уже ронял поставки в поле:
//   (1) образец — валидный JSON и адресует РЕАЛЬНО развёрнутые скрипты (битая ссылка выглядит
//       поставкой и молча не работает);
//   (2) образец называет свою форму вывода явно (--emit), а не полагается на автоопределение;
//   (3) ОБРАТНАЯ проверка честности: образец НЕ ссылается на хук, который система не тянет —
//       иначе таблица README обещает одно, а файл делает другое.
console.log('\n=== s14: образцы конфигов под другие агентские системы (фаза O5) ===');
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
// Ассерты смотрят на ИСПОЛНЯЕМЫЕ строки, а не на весь файл: образцы несут пояснительные ключи
// `_readme`/`_why_…`, где имена скриптов и флаги упоминаются ПРОЗОЙ. Первый прогон этого свода
// покраснел ровно на этом (проза Codex объясняет, почему --emit не нужен, — и текстовый греп
// счёл это флагом). Собираем значения ключей command/bash/powershell рекурсивно — то, что
// система реально запустит.
const CMD_KEYS = new Set(['command', 'bash', 'powershell', 'commandWindows']);
const commandsOf = (node, acc = []) => {
  if (Array.isArray(node)) node.forEach((n) => commandsOf(n, acc));
  else if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) {
      if (CMD_KEYS.has(k) && typeof v === 'string') acc.push(v);
      else commandsOf(v, acc);
    }
  return acc;
};
const sampleTxt = (f) => commandsOf(readJson(join(S, '.kaif', 'hooks', f))).join('\n');
// система → [файл образца, требуемый флаг формы, скрипты которые ОБЯЗАНЫ быть, скрипты которых быть НЕ ДОЛЖНО]
const SAMPLES = [
  // prompt-resume-word.mjs (2.7) — ТОЛЬКО Claude Code: поле prompt чужих событий с доки не снято,
  // образцы его не обещают (README модуля: «prompt field not verified»)
  ['Codex', 'sample-codex-hooks.json', null,
   ['session-start-refresh.mjs', 'prompt-refresh-timer.mjs'], ['stop-status-guard.mjs', 'prompt-resume-word.mjs']],
  ['Cursor', 'sample-cursor-hooks.json', '--emit cursor',
   ['session-start-refresh.mjs'], ['prompt-refresh-timer.mjs', 'stop-status-guard.mjs', 'prompt-resume-word.mjs']],
  ['Copilot', 'sample-copilot-hooks.json', '--emit copilot',
   ['session-start-refresh.mjs'], ['prompt-refresh-timer.mjs', 'stop-status-guard.mjs', 'prompt-resume-word.mjs']],
  ['Antigravity', 'sample-antigravity-hooks.json', '--emit antigravity',
   ['prompt-refresh-timer.mjs'], ['session-start-refresh.mjs', 'stop-status-guard.mjs', 'prompt-resume-word.mjs']],
];
for (const [sys, file, emit, must, mustNot] of SAMPLES) {
  ok(readJson(join(S, '.kaif', 'hooks', file)) !== null, `s14/O5 ${sys}: образец ${file} — валидный JSON`);
  const txt = sampleTxt(file);
  ok(must.every((m) => txt.includes(`.kaif/hooks/${m}`)),
     `s14/O5 ${sys}: образец адресует развёрнутые скрипты (${must.join(', ')})`);
  ok(mustNot.every((m) => !txt.includes(`.kaif/hooks/${m}`)),
     `s14/O5 ${sys}: образец НЕ обещает хук, который система не тянет (${mustNot.join(', ')})`);
  if (emit) ok(txt.includes(emit), `s14/O5 ${sys}: образец называет форму вывода явно (${emit})`);
}
// Codex — единственный, кто читает форму Claude Code дословно: флага формы у него быть НЕ должно
ok(!sampleTxt('sample-codex-hooks.json').includes('--emit'),
   's14/O5 Codex: флага формы нет — контракт совпадает с референсом дословно');

// ------------------------------------------------- ОСЬ ИМЁН СОБЫТИЙ (bugs/66 №4)
// Критерий 3 плана 60 — «имена событий совпадают с подтверждённым контрактом» — не стерёг НИКТО.
// Все ассерты выше читают ЗНАЧЕНИЯ ключей command/bash/powershell, то есть ЧЕМ хук запускается, и
// ни один не читает КЛЮЧИ, то есть КОГДА он запускается. Подмена регистра `sessionStart` →
// `SessionStart` у Cursor и подмена события `PreInvocation` → `PreToolUse` у Antigravity проходили
// зелёными — а конфиг с чужим именем события НЕ СРАБОТАЕТ НИКОГДА, причём молча, неотличимо от
// неподключённого модуля.
//
// Охват ВЫЧИСЛЯЕТСЯ: судятся все образцы, найденные в развёрнутом модуле, и образец без
// названного контракта ПАДАЕТ, а не пропускается, — новый образец краснеет ровно до тех пор, пока
// его события не выписаны. Ожидаемые имена взяты из `researches/19` (контракт снят живым fetch
// 2026-08-07), а НЕ из самих образцов: проверка, читающая проверяемое, делит с ним слепое пятно
// (EXP-0047, и ровно этот механизм породил вхождение №1 этого же бага).
console.log('\n=== s14/O5: имена событий образцов против подтверждённого контракта (bugs/66 №4) ===');
const EVENT_CONTRACT = {
  // bugs/118 F1: фрагмент Claude Code — ЕДИНСТВЕННЫЙ конфиг, который владелец мержит себе руками, — в ось
  // не попадал: охват брался по паттерну имени `sample-*.json`. Теперь судится каждый `*.json` модуля.
  'settings-fragment.json':        ['PreToolUse', 'SessionStart', 'Stop', 'UserPromptSubmit'], // researches/19 §Claude Code (таблица событий); PreToolUse — 2.8, живой fetch 2026-09-25 code.claude.com/docs/en/hooks.md («Before a tool call executes. Can block it»)
  'sample-codex-hooks.json':       ['SessionStart', 'UserPromptSubmit'],  // researches/19 §OpenAI Codex
  'sample-cursor-hooks.json':      ['sessionStart'],                      // researches/19 §Cursor
  'sample-copilot-hooks.json':     ['sessionStart'],                      // researches/19 §GitHub Copilot
  'sample-antigravity-hooks.json': ['PreInvocation'],                     // researches/19 §Google Antigravity
};
// `hooks` — структурный контейнер конфигов формы Claude Code, никогда не имя события.
const CONTAINER_KEYS = new Set(['hooks']);
const eventNamesOf = (node, acc = new Set()) => {
  if (Array.isArray(node)) { node.forEach((n) => eventNamesOf(n, acc)); return acc; }
  if (!node || typeof node !== 'object') return acc;
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('_')) continue;                        // пояснительные ключи образца — проза
    if (!CONTAINER_KEYS.has(k) && Array.isArray(v) && v.length && v.every((e) => e && typeof e === 'object')) acc.add(k);
    eventNamesOf(v, acc);
  }
  return acc;
};
const contractDiff = (file, json) => {
  const want = [...(EVENT_CONTRACT[file] || [])].sort();
  const got = [...eventNamesOf(json)].sort();
  return { want, got, extra: got.filter((e) => !want.includes(e)), missing: want.filter((e) => !got.includes(e)) };
};
// Охват — СОСТАВ модуля, а не паттерн имени (bugs/118 F1): конфиг с любым именем либо несёт названный
// контракт, либо краснит ось. Терпимое чтение каталога: на красном прогоне без модуля свод досчитывает остальное.
const samplesOnDisk = (() => { try { return readdirSync(join(S, '.kaif', 'hooks')).filter((n) => /\.json$/.test(n)).sort(); } catch { return []; } })();
ok(samplesOnDisk.includes('settings-fragment.json') && samplesOnDisk.length > 1,
   `s14/O5 ось имён: конфиги найдены в развёрнутом модуле, фрагмент Claude Code среди них (${samplesOnDisk.length})`, samplesOnDisk.join(', '));
for (const f of samplesOnDisk) {
  if (!EVENT_CONTRACT[f]) {
    ok(false, `s14/O5 ось имён: у образца ${f} НЕ НАЗВАН контракт событий — выпиши его из researches/19`);
    continue;
  }
  const d = contractDiff(f, readJson(join(S, '.kaif', 'hooks', f)));
  ok(d.extra.length === 0 && d.missing.length === 0,
     `s14/O5 ось имён ${f}: события совпадают с контрактом (${d.want.join(', ')})`,
     `лишние: [${d.extra.join(', ')}] · недостающие: [${d.missing.join(', ')}]`);
}
// Мутационное доказательство живёт В СВОДЕ, а не в сессии: смертный скретчпад = смертная
// верификация (EXP-0016). Адресаты названы ДО прогона (EXP-0059) — обе формы из bugs/66 Repro п. 4:
// подмена РЕГИСТРА и подмена на ЧУЖОЕ СУЩЕСТВУЮЩЕЕ событие той же системы. Мутируем разобранную
// КОПИЮ в памяти — файл образца не трогается (EXP-0077).
for (const [f, from, to] of [['sample-cursor-hooks.json', 'sessionStart', 'SessionStart'],
                             ['sample-antigravity-hooks.json', 'PreInvocation', 'PreToolUse']]) {
  const p = join(S, '.kaif', 'hooks', f);
  const bytesBefore = readFileSync(p);
  const mutated = JSON.parse(JSON.stringify(readJson(p)).split(`"${from}"`).join(`"${to}"`));
  const d = contractDiff(f, mutated);
  ok(d.extra.includes(to) && d.missing.includes(from),
     `s14/O5 ось имён: мутация ${f} (${from} → ${to}) КРАСНАЯ — ось читает ключи, а не значения`,
     `лишние: [${d.extra.join(', ')}] · недостающие: [${d.missing.join(', ')}]`);
  ok(Buffer.compare(bytesBefore, readFileSync(p)) === 0,
     `s14/O5 ось имён: доказательство не тронуло сам образец ${f} (побайтная сверка до/после)`);
}

// ------------------------------------------------- ОСЬ ПАР «скрипт ↔ событие» (bugs/118 F1)
// Ось имён судит, КАКИЕ события названы, и не судит, КАКОЙ скрипт под каким стоит: мутант, где
// `prompt-resume-word.mjs` и `stop-status-guard.mjs` поменяны местами, проходил свод 68/68 зелёным — а приказ
// `/resume` на `Stop` не приходит никогда, и оба хука умирают молча, неотличимо от неподключённого модуля.
// Ожидаемая пара берётся из ШАПКИ самого развёрнутого скрипта (`Claude Code event: <Имя>`) — не из конфига
// и не из таблицы в этом своде: третьей рукописной копии того же факта ось НЕ заводит (класс bugs/118 —
// страж судит копию истины). Судятся конфиги формы Claude Code — фрагмент и образец Codex (README модуля:
// «same field names»); у остальных образцов один скрипт на одно событие, их пару держат ось имён и матрица
// `must`/`mustNot` вместе. Адресат мутанта назван заранее (EXP-0059): обмен двух скриптов во фрагменте
// краснит ровно ассерт пар фрагмента — ось имён и текстовый ассерт «адресует все четыре» остаются зелёными.
console.log('\n=== s14: каждый скрипт стоит под СВОИМ событием (bugs/118 F1) ===');
const PAIR_AXIS = ['settings-fragment.json', 'sample-codex-hooks.json'];
const headerEventOf = (script) => {
  try { return (readFileSync(join(S, '.kaif', 'hooks', script), 'utf8').match(/Claude Code event: (\w+)/) || [])[1] || null; } catch { return null; }
};
const stringsOf = (node, acc = []) => {
  if (typeof node === 'string') acc.push(node);
  else if (Array.isArray(node)) node.forEach((n) => stringsOf(n, acc));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) if (!k.startsWith('_')) stringsOf(v, acc);
  return acc;
};
// [скрипт, событие] обходом КЛЮЧЕЙ события (тот же признак события, что у `eventNamesOf`), а не текста файла
const pairsOf = (json) => {
  const acc = [];
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_')) continue;
      const isEvent = !CONTAINER_KEYS.has(k) && Array.isArray(v) && v.length && v.every((e) => e && typeof e === 'object');
      if (isEvent) { for (const s of stringsOf(v)) for (const m of s.matchAll(/\.kaif\/hooks\/([\w-]+\.mjs)/g)) acc.push([m[1], k]); }
      else walk(v);
    }
  };
  walk(json);
  return acc;
};
const pairDiff = (json) => pairsOf(json).filter(([script, event]) => headerEventOf(script) !== event)
  .map(([script, event]) => `${script} стоит под ${event}, а его шапка называет ${headerEventOf(script)}`);
for (const f of PAIR_AXIS) {
  const json = readJson(join(S, '.kaif', 'hooks', f));
  const pairs = json ? pairsOf(json) : [];
  const bad = json ? pairDiff(json) : ['конфиг не читается'];
  ok(pairs.length > 0 && bad.length === 0, `s14 ось пар ${f}: каждый скрипт стоит под событием из своей шапки (${pairs.length} пар)`, bad.join(' · '));
}
{
  const fragPairs = pairsOf(readJson(join(S, '.kaif', 'hooks', 'settings-fragment.json')) || {}).map(([s]) => s).sort();
  ok(JSON.stringify(fragPairs) === JSON.stringify(HOOK_FILES.slice(0, 5).sort()),
     's14 ось пар: фрагмент подключает ровно пять развёрнутых скриптов, каждый один раз (пятый — pretool-owner-word, 2.8)', fragPairs.join(', '));
  // Мутационное доказательство живёт В СВОДЕ (EXP-0016): обмен двух скриптов в разобранной КОПИИ (EXP-0077).
  const p = join(S, '.kaif', 'hooks', 'settings-fragment.json');
  const bytesBefore = (() => { try { return readFileSync(p); } catch { return Buffer.alloc(0); } })();
  const swapped = JSON.parse(JSON.stringify(readJson(p))
    .split('prompt-resume-word.mjs').join('@@SWAP@@').split('stop-status-guard.mjs').join('prompt-resume-word.mjs').split('@@SWAP@@').join('stop-status-guard.mjs'));
  const bad = swapped ? pairDiff(swapped) : [];
  ok(bad.length === 2 && bad.some((b) => b.startsWith('prompt-resume-word.mjs стоит под Stop')) && bad.some((b) => b.startsWith('stop-status-guard.mjs стоит под UserPromptSubmit')),
     's14 ось пар: мутация фрагмента (resume-word ↔ stop-status-guard) КРАСНАЯ и называет обе пары', bad.join(' · '));
  ok(bytesBefore.length > 0 && Buffer.compare(bytesBefore, (() => { try { return readFileSync(p); } catch { return Buffer.alloc(0); } })()) === 0,
     's14 ось пар: доказательство не тронуло сам фрагмент (побайтная сверка до/после)');
}

// поведение форм: один приказ, четыре конверта (проверяется на РАЗВЁРНУТЫХ копиях)
const emitOut = (script, args, input) => {
  try { return execFileSync(process.execPath, [join(S, '.kaif', 'hooks', script), ...args], { input: JSON.stringify(input), cwd: S }).toString(); }
  catch (e) { return `<HOOK-CRASH: ${String(e.message).slice(0, 120)}>`; }
};
const cursorJs = parseHook(emitOut('session-start-refresh.mjs', ['--emit', 'cursor'], { source: 'clear', cwd: S }));
ok(typeof cursorJs.additional_context === 'string' && /re-read core/.test(cursorJs.additional_context),
   's14/O5 форма cursor: плоское additional_context (snake_case) с тем же приказом');
ok(cursorJs.hookSpecificOutput === undefined, 's14/O5 форма cursor: конверта Claude Code НЕТ');
const copilotJs = parseHook(emitOut('session-start-refresh.mjs', ['--emit', 'copilot'], { source: 'compact', cwd: S }));
ok(typeof copilotJs.additionalContext === 'string' && /re-read core/.test(copilotJs.additionalContext),
   's14/O5 форма copilot: плоское additionalContext (camelCase)');
rmSync(marker, { force: true }); // маркера нет → таймер обязан говорить
const agJs = parseHook(emitOut('prompt-refresh-timer.mjs', ['--emit', 'antigravity'], { cwd: S }));
ok(Array.isArray(agJs.injectSteps) && typeof agJs.injectSteps[0]?.ephemeralMessage === 'string'
   && /re-read core/.test(agJs.injectSteps[0].ephemeralMessage),
   's14/O5 форма antigravity: injectSteps — МАССИВ ОБЪЕКТОВ с ephemeralMessage, не строк');
// неизвестная форма — конверт референса, НИКОГДА не тишина (опечатка в образце обязана быть видна)
const junkJs = parseHook(emitOut('session-start-refresh.mjs', ['--emit', 'no-such-shape'], { source: 'clear', cwd: S }));
ok(junkJs.hookSpecificOutput?.additionalContext?.length > 0,
   's14/O5 неизвестная форма: фолбэк на конверт референса, не молчание');

// ---------------------------------------------------------------- деплой БЕЗ хуков не краснеет
// Инвариант §9.10 в семантике машинерии: опциональность = АКТИВАЦИЯ, не наличие файлов.
// (1) Хуки НЕ ПОДКЛЮЧЕНЫ — в песочнице нет ни .claude/settings.json, ни какого-либо гейта,
//     требующего wiring, — check зелёный (первый check выше уже это доказал; здесь явно).
// (2) Контраст целостности: УДАЛЕНИЕ файлов модуля — MISSING, ровно как у tool-модулей
//     (прецедент проверен живьём: rm .kaif/tools/kaif-provenance.mjs → check exit 1 MISSING).
// 2.8 (эпик OW; bugs/123 и его рецидив 2026-09-25 19:32 — 18 вызовов, ответ составлен в размышлении и не выведен; хук — по слову
// владельца истока того же вечера): перед каждым вызовом главного потока хук читает запись сессии; последнее сообщение владельца,
// пришедшее посреди хода, без ТЕКСТОВОГО блока агента после него — вызов отказан (код 2), причина несёт его слова. На v2.7 файла нет —
// все случаи красны.
console.log('\n=== s14: хук pretool-owner-word — слово владельца посреди хода без ответа текстом (эпик OW 2.8, bugs/123) ===');
{
  const TR = join(ROOT, 'transcripts'); mkdirSync(TR, { recursive: true });
  const J = (o) => JSON.stringify(o);
  const mid = (text, kind = 'human') => J({ type: 'attachment', timestamp: '2026-09-25T16:32:07.936Z', attachment: { type: 'queued_command', prompt: text, origin: { kind } } });
  const asst = (...blocks) => J({ type: 'assistant', timestamp: '2026-09-25T16:32:35.977Z', message: { role: 'assistant', content: blocks } });
  const think = { type: 'thinking', thinking: '' }, tool = { type: 'tool_use', name: 'Bash', input: {} }, say = (t) => ({ type: 'text', text: t });
  // the gate's own refusal as the transcript records it (observed live 2026-09-25 23:27): an is_error tool_result carrying its reason
  const refused = (w) => J({ type: 'user', timestamp: '2026-09-25T16:32:40.000Z', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', is_error: true,
    content: 'PreToolUse:Bash hook error: [node .kaif/hooks/pretool-owner-word.mjs]: KAIF: the owner wrote while you were working (2026-09-25T16:32:07Z) and there is no TEXT answer after it yet: «' + w + '». …' }] } });
  const HOOK = join(S, '.kaif', 'hooks', 'pretool-owner-word.mjs');
  const gate = (name, lines, extra = {}) => {
    const p = join(TR, name + '.jsonl'); writeFileSync(p, lines.join('\n') + '\n');
    const r = spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', cwd: S, tool_name: 'Bash', transcript_path: p, ...extra }), encoding: 'utf8' });
    return { code: r.status, err: String(r.stderr || '') };
  };
  let g = gate('unanswered', [asst(think, tool), mid('ну что, сколько процентов версии 2.8 сделано?'), asst(think, tool)]);
  ok(g.code === 2 && /сколько процентов версии 2\.8/.test(g.err) && /AS TEXT/.test(g.err) && /CONTINUE/.test(g.err) && /final text of the turn/.test(g.err),
     's14 owner-word: сообщение владельца посреди хода без ТЕКСТА после него → вызов отказан (код 2), причина несёт его слова, «AS TEXT», «CONTINUE» и «повтори итоговым текстом хода»', 'code ' + g.code + ': ' + g.err.slice(0, 160));
  g = gate('reasoning-only', [mid('стоп'), asst(think, think, tool), asst(think, think, tool)]);
  ok(g.code === 2, 's14 owner-word: после сообщения — только размышления и вызовы (форма рецидива 19:32) → отказ', 'code ' + g.code);
  g = gate('answered', [mid('стоп'), asst(think, say('Остановился: на шаге сборки.'), tool)]);
  ok(g.code === 0 && g.err === '', 's14 owner-word: ответ ТЕКСТОМ после сообщения → вызов пропущен, тишина', 'code ' + g.code + ': ' + g.err.slice(0, 120));
  g = gate('newer-unanswered', [mid('старый вопрос'), asst(say('ответ на старый'), tool), mid('новый вопрос'), asst(think, tool)]);
  ok(g.code === 2 && /новый вопрос/.test(g.err), 's14 owner-word: старое сообщение отвечено, новое — нет → отказ по НОВОМУ (судится последнее)', 'code ' + g.code);
  g = gate('refused-once', [mid('стоп'), asst(think, tool), refused('стоп'), asst(think, tool)]);
  ok(g.code === 0, 's14 owner-word: один отказ по сообщению доставлен → следующий вызов проходит, работа не встаёт (слово владельца 23:28)', 'code ' + g.code + ': ' + g.err.slice(0, 120));
  g = gate('refused-then-new', [mid('первый'), asst(think, tool), refused('первый'), asst(think, tool), mid('второй'), asst(think, tool)]);
  ok(g.code === 2 && /второй/.test(g.err), 's14 owner-word: отказ по старому сообщению не покрывает новое → отказ по новому', 'code ' + g.code + ': ' + g.err.slice(0, 120));
  g = gate('peer', [mid('сведения соседней сессии', 'peer'), asst(think, tool)]);
  ok(g.code === 0, 's14 owner-word: сообщение соседней сессии — не слово владельца → тишина', 'code ' + g.code);
  g = gate('subagent', [mid('стоп'), asst(think, tool)], { agent_id: 'a1b2' });
  ok(g.code === 0, 's14 owner-word: вызов субагента (agent_id) пропущен — владельцу отвечает главный поток', 'code ' + g.code);
  g = gate('quiet', [asst(think, tool), asst(say('работаю'), tool)]);
  ok(g.code === 0, 's14 owner-word: сообщений посреди хода нет → тишина', 'code ' + g.code);
  const gm = spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', cwd: S, transcript_path: join(TR, 'missing.jsonl') }), encoding: 'utf8' });
  ok(gm.status === 0, 's14 owner-word: записи сессии нет → тишина (хук никогда не ломает сессию)', 'code ' + gm.status);
}

console.log('\n=== s14: деплой без ПОДКЛЮЧЕНИЯ хуков — инвариант §9.10 ===');
ok(!existsSync(join(S, '.claude', 'settings.json')) && !existsSync(join(S, '.claude', 'settings.local.json')),
   's14 без подключения: settings.json в песочнице НЕТ — хуки развёрнуты, но не активированы');
r = run(S, 'check');
ok(r.code === 0, 's14 без подключения: check зелёный — ни один гейт не требует wiring хуков', r.out.slice(-400));
rmSync(join(S, '.kaif', 'hooks'), { recursive: true, force: true });
r = run(S, 'check');
ok(r.code !== 0 && /MISSING or empty: \.kaif\/hooks\//.test(r.out),
   's14 контраст: УДАЛЕНИЕ файлов модуля — честный MISSING (целостность поставки, как у tool-модулей)', r.out.slice(-300));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница refresh-hooks зелёная (деплой с модулем и без · 5 хуков по живому контракту)'}`);
process.exit(failures ? 1 : 0);
