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
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, rmSync, existsSync, cpSync, utimesSync, readdirSync } from 'node:fs';
import { execSync, execFileSync, spawnSync, spawn } from 'node:child_process';
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
                    // 2.9, эпик WH (тикет #144): pretool-owner-word (2.8) и stop-owner-answer сняты словом владельца — их нет в поставке
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
ok(HOOK_FILES.slice(0, 4).every((f) => fragTxt.includes(`.kaif/hooks/${f}`)),
   's14 фрагмент конфига: команды указывают на все четыре развёрнутых скрипта (четвёртый — resume-word, 2.7)');
// 2.9, эпик WH (тикет #144, слово владельца «Убрать это!!!! ИЗ КАИФ НАХУЙ УБРАТ!»): снятых хуков нет ни в образце, ни на диске развёртывания
ok(!/pretool-owner-word|stop-owner-answer/.test(fragTxt) && !frag.hooks?.PreToolUse
   && !existsSync(join(S, '.kaif', 'hooks', 'pretool-owner-word.mjs')) && !existsSync(join(S, '.kaif', 'hooks', 'stop-owner-answer.mjs')),
   's14 WH: снятые хуки (pretool-owner-word · stop-owner-answer) не поставляются и не подключаются образцом', fragTxt.slice(0, 200));

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
// 2.9 (№143 — владелец: «неправильно навык тебе говорит»; сессия ответила на «сколько осталось?» и сама взялась за следующий пункт плана):
// приказ называет объём — текст под словом; на вопрос — ответ, выбранное ПРЕДЛАГАЕТСЯ; работу начинает только голое resume.
// 2.9 WH (тикет #144): строка «⏩» ушла из канона вместе с хуками, которые её читали, — приказ её больше не называет.
{
  const c = parseHook(resumeHook('выполни RESUME\nсколько осталось делать до выпуска?')).hookSpecificOutput?.additionalContext || '';
  ok(/it sets the scope/.test(c) && /a question is answered/.test(c) && /OFFERED, never taken/.test(c) && !/⏩/.test(c) && /only a bare "resume"/.test(c),
     's14 resume-word (№143): приказ говорит, что объём задаёт текст под словом — на вопрос ответ без работы сверх него; «⏩» не названа (#144)', c.slice(-420));
}
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

// ---------------------------------------------------------------- 2.9, эпик HK: корень проекта, а не `cwd` события (#94, bugs/119 №1–№2, bugs/120)
// Агент сделал `cd src` — `cwd` события уехал в подкаталог, а маркер и STATUS.md живут в корне: таймер отвечал каждому промпту «no refresh
// witness» при свежем маркере корня, страж STATUS молчал (#94 — два поля, две ОС). Корень теперь — ближайший предок `cwd` с `.kaif/kaif.json`;
// приказы называют маркер и STATUS.md полным путём. Метка маркера из будущего — не свидетель (bugs/119 №2); приказ старта сессии и причина
// стража говорят то, что наблюдено (bugs/120). На ядре v2.8 красны все случаи раздела, кроме одного контрольного (помечен).
console.log('\n=== s14: корень проекта из подпапки, метка из будущего, слова приказов по наблюдению (эпик HK 2.9) ===');
const DEEP = join(S, 'src', 'deep'); mkdirSync(DEEP, { recursive: true });
const fullMarker = join(S, '.kaif', 'refresh-marker.json');
const ctxOf = (o) => parseHook(o).hookSpecificOutput?.additionalContext || '';
writeFileSync(marker, JSON.stringify({ at: new Date().toISOString(), docs: [], trigger: 'hour' }));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: DEEP });
ok(out === '', 's14 HK таймер: событие из `src/deep` при свежем маркере корня — ТИШИНА, как из корня (#94)', out.slice(0, 160));
writeFileSync(marker, JSON.stringify({ at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), docs: [], trigger: 'hour' }));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: DEEP });
ok(/last refresh 1\d\d min ago/.test(out), 's14 HK таймер: из `src/deep` протухший маркер корня (2 ч) — приказ называет возраст, не «no refresh witness»', out.slice(0, 160));
ok(ctxOf(out).includes(fullMarker), 's14 HK таймер: приказ называет маркер ПОЛНЫМ путём в корне — агент штампует его там, где хук читает', ctxOf(out).slice(0, 220));
writeFileSync(marker, JSON.stringify({ at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), docs: [], trigger: 'hour' }));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(/in the future/.test(out) && /UserPromptSubmit/.test(out),
   's14 HK таймер: `at` на 30 мин в будущем при свежем mtime — приказ «in the future», не тишина (bugs/119 №2)', out.slice(0, 160));
// контрольный (зелёный и на v2.8): допуск назван константой и не равен нулю — `at` на 30 с впереди ещё свидетель
writeFileSync(marker, JSON.stringify({ at: new Date(Date.now() + 30 * 1000).toISOString(), docs: [], trigger: 'hour' }));
out = runHook(S, 'prompt-refresh-timer.mjs', { hook_event_name: 'UserPromptSubmit', cwd: S });
ok(out === '', 's14 HK таймер (контроль): `at` на 30 с впереди — в допуске, ТИШИНА', out.slice(0, 160));
const resumeDeep = runHook(S, 'prompt-resume-word.mjs', { hook_event_name: 'UserPromptSubmit', cwd: DEEP, prompt: 'resume\nплан дня' });
ok(isResumeOrder(resumeDeep) && ctxOf(resumeDeep).includes(fullMarker),
   's14 HK resume-word: приказ из `src/deep` называет маркер корня полным путём', ctxOf(resumeDeep).slice(-260));
const startCtx = (source) => ctxOf(runHook(S, 'session-start-refresh.mjs',
  source === undefined ? { hook_event_name: 'SessionStart', cwd: DEEP } : { hook_event_name: 'SessionStart', source, cwd: DEEP }));
for (const source of ['startup', 'resume', undefined]) {
  const c = startCtx(source);
  ok(/\(re\)started/.test(c) && /"trigger": "ritual:session-start"/.test(c) && !/compacted/.test(c) && !/"trigger": "compaction"/.test(c),
     `s14 HK SessionStart ${source || 'без поля source'}: «(re)started» и trigger "ritual:session-start" — не «compacted» (bugs/120 №1)`, c.slice(0, 200));
}
const compactCtx = startCtx('compact');
ok(/compacted/.test(compactCtx) && /"trigger": "compaction"/.test(compactCtx) && compactCtx.includes(fullMarker),
   's14 HK SessionStart compact из `src/deep`: «compacted», trigger "compaction", маркер корня полным путём', compactCtx.slice(0, 220));
// страж STATUS: фикстура-проект с маркером развёртывания, событие из подкаталога; затем коммит — чистое дерево и свежий коммит,
// ДРУГАЯ сессия того же проекта (cooldown ключён по session_id, bugs/119 «обратный ассерт»)
const G2 = join(ROOT, 'git-root-fx'); seedHooks(G2);
writeFileSync(join(G2, '.kaif', 'kaif.json'), '{}');       // маркер развёртывания — его каталог и есть корень
mkdirSync(join(G2, 'src', 'deep'), { recursive: true });
const git2 = (...a) => execFileSync('git', a, { cwd: G2, stdio: 'pipe' });
git2('init', '-q'); git2('config', 'user.email', 'sbx@sbx'); git2('config', 'user.name', 'sbx');
writeFileSync(join(G2, 'STATUS.md'), '# status'); writeFileSync(join(G2, 'src', 'deep', 'a.txt'), 'a');
git2('add', '.'); git2('commit', '-qm', 'seed');
utimesSync(join(G2, 'STATUS.md'), oldSec, oldSec);          // STATUS «не тронут» 5 часов
writeFileSync(join(G2, 'work.txt'), 'w');                   // незакоммиченная правка
out = runHook(G2, 'stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: join(G2, 'src', 'deep'), session_id: sid + '-hk-a' });
js = parseHook(out);
ok(js.decision === 'block' && (js.reason || '').includes(join(G2, 'STATUS.md')),
   's14 HK страж STATUS: событие из `src/deep` — тот же мягкий блок, что из корня; STATUS.md назван полным путём (#94)', out.slice(0, 220));
ok(/uncommitted changes/.test(js.reason || '') && !/this session changed the tree/.test(js.reason || ''),
   's14 HK страж STATUS: причина называет наблюдение — незакоммиченные правки, не «this session changed the tree» (bugs/120 №2)', (js.reason || '').slice(0, 200));
git2('add', '.'); git2('commit', '-qm', 'work');
out = runHook(G2, 'stop-status-guard.mjs', { hook_event_name: 'Stop', cwd: G2, session_id: sid + '-hk-b' });
js = parseHook(out);
ok(js.decision === 'block' && /a commit landed within the last 3 h/.test(js.reason || ''),
   's14 HK страж STATUS: чистое дерево и свежий коммит, другая сессия — блок, причина называет коммит (bugs/120 №2)', out.slice(0, 220));

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
// система → [файл образца, форма вывода]. ВОЗМОЖНОСТИ систем (какой хук образец обязан нести, какого — нет) здесь больше не копия:
// единственный источник — таблица README модуля «System × Canon after compaction · Hourly timer · STATUS guard», разобранная ниже
// (bugs/118 №3, 2.9 HK: три рукописные копии без связи — мутант ячейки ❌ → ✅ проходил сборку, пары и свод зелёными).
const SAMPLES = [
  ['Codex', 'sample-codex-hooks.json', null],   // Codex читает форму Claude Code дословно — флага формы у него быть НЕ должно
  ['Cursor', 'sample-cursor-hooks.json', 'cursor'],
  ['Copilot', 'sample-copilot-hooks.json', 'copilot'],
  ['Antigravity', 'sample-antigravity-hooks.json', 'antigravity'],
];
// Хуки только Claude Code: поле prompt и запись сессии чужих событий с доки не сняты — образцы их не обещают (README модуля)
const CLAUDE_ONLY = ['prompt-resume-word.mjs'];
// bugs/118 №2 (2.9 HK): форма вывода судится ТОКЕНАМИ команды, а не подстрокой — у каждой команды, зовущей скрипт модуля, ровно один
// `--emit` ровно с этим значением (`--emit cursorX` и лишний `--emit cursor` ПЕРЕД требуемым проходили `includes`).
const emitsOf = (cmd) => { const t = cmd.split(/\s+/); return t.flatMap((w, i) => (w === '--emit' ? [t[i + 1] ?? ''] : [])); };
for (const [sys, file, shape] of SAMPLES) {
  const json = readJson(join(S, '.kaif', 'hooks', file));
  ok(json !== null, `s14/O5 ${sys}: образец ${file} — валидный JSON`);
  const txt = sampleTxt(file);
  ok(CLAUDE_ONLY.every((m) => !txt.includes(`.kaif/hooks/${m}`)),
     `s14/O5 ${sys}: образец НЕ обещает хуки только Claude Code (${CLAUDE_ONLY.join(', ')})`);
  const calls = commandsOf(json).filter((c) => /\.kaif\/hooks\/[\w-]+\.mjs/.test(c));
  const bad = calls.filter((c) => { const e = emitsOf(c); return shape ? !(e.length === 1 && e[0] === shape) : e.length !== 0; });
  ok(calls.length > 0 && bad.length === 0,
     `s14/O5 ${sys}: каждая команда образца ${shape ? `несёт ровно один --emit ${shape}` : 'без --emit (контракт референса)'} (bugs/118 №2)`, bad.join(' · ') || 'команд нет');
}
// Таблица возможностей README → что образец обязан и не должен нести. Ячейка ✅ — скрипт колонки в образце есть, ❌ — его нет; строка с
// образцом, пропавшая из таблицы, и ячейка без ✅/❌ — красные. Разбор по неэкранированной `|` (в ячейках бывает `\|`).
const CAP_COLUMNS = [['Canon after compaction', 'session-start-refresh.mjs'], ['Hourly timer', 'prompt-refresh-timer.mjs'], ['STATUS guard', 'stop-status-guard.mjs']];
const tableCells = (line) => line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
const capRows = (() => {
  const lines = readmeTxt.split(/\r?\n/);
  const h = lines.findIndex((l) => /^\|\s*System\s*\|\s*Sample\s*\|/.test(l));
  if (h < 0) return [];
  const head = tableCells(lines[h]);
  const rows = [];
  for (let i = h + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    const cells = tableCells(lines[i]);
    rows.push(Object.fromEntries(head.map((k, j) => [k, cells[j] || ''])));
  }
  return rows;
})();
const sampleOfRow = (r) => (String(r.Sample || '').match(/`([\w.-]+\.json)`/) || [])[1];
const SAMPLE_FILES = ['settings-fragment.json', ...SAMPLES.map((s) => s[1])];
const tableRows = capRows.filter((r) => SAMPLE_FILES.includes(sampleOfRow(r)));
ok(tableRows.length === SAMPLE_FILES.length,
   `s14/O5 таблица README: строка на каждый образец модуля (${tableRows.length} из ${SAMPLE_FILES.length}; bugs/118 №3)`);
for (const r of tableRows) {
  const file = sampleOfRow(r);
  const txt = file === 'settings-fragment.json' ? fragTxt : sampleTxt(file);
  const diff = CAP_COLUMNS.flatMap(([col, script]) => {
    const cell = String(r[col] || ''); const has = txt.includes(`.kaif/hooks/${script}`);
    const want = cell.startsWith('✅') ? true : cell.startsWith('❌') ? false : null;
    return want === has ? [] : [`«${col}» = ${cell.slice(0, 40) || '<пусто>'}, а ${script} в образце ${has ? 'есть' : 'нет'}`];
  });
  ok(diff.length === 0, `s14/O5 таблица README ↔ ${file}: три ячейки возможностей совпадают с тем, что образец несёт (bugs/118 №3)`, diff.join(' · '));
}

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
  'settings-fragment.json':        ['SessionStart', 'Stop', 'UserPromptSubmit'], // researches/19 §Claude Code (таблица событий); PreToolUse (2.8) ушло с хуком pretool-owner-word — 2.9 WH, тикет #144
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
  ok(JSON.stringify(fragPairs) === JSON.stringify(HOOK_FILES.slice(0, 4).sort()),
     's14 ось пар: фрагмент подключает ровно четыре развёрнутых скрипта, каждый один раз (2.9 WH: два хука слова владельца сняты)', fragPairs.join(', '));
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
// ---------------------------------------------------------------- SW2: поставленное ПОДКЛЮЧЕНО (2.9, тикет #115)
// Слово владельца KAIF в поле: всё, что KAIF приносит в поставке, подключать без вопроса владельцу проекта. Команда
// машинерии `wire-hooks` вливает фрагмент в .claude/settings.json АДДИТИВНО: записи владельца и их порядок живы, повтор —
// побайтно тот же файл, отступ · CRLF · BOM файла сохранены, битый файл не тронут (выход 1), ключ "hooks": "off" — ничего
// не пишется, хук, уже подключённый в settings.local.json, не дублируется; `check` называет поставленный, но не подключённый
// хук (предупреждение, выход 0), схема маркера знает ключ; чекпоинт `wire-hooks` исполняет свой гейт. Каждый случай — на
// СВОЕЙ копии развёрнутого S (до того, как свод ниже снимет модуль). Красный — на сборке 2.8 (шов KAIF_DIST): команды нет.
console.log('\n=== s14: SW2 — поставленные хуки подключает wire-hooks (2.9, #115) ===');
// stdout и stderr вместе: предупреждения `check` идут в stderr при выходе 0, а `run` выше читает только stdout успеха
const runAll = (cwd, args) => {
  const p = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { code: p.status, out: `${p.stdout || ''}${p.stderr || ''}` };
};
const BOM_CHAR = String.fromCharCode(0xfeff);
const scriptOfCmd = (h) => ([h.command, ...(h.args || [])].join(' ').match(/hooks[\\/]([\w.-]+\.mjs)/) || [])[1];
const scriptsOf = (hooksObj) => Object.entries(hooksObj || {}).flatMap(([ev, groups]) =>
  (Array.isArray(groups) ? groups : []).flatMap((g) => (g.hooks || []).map((h) => `${ev}:${scriptOfCmd(h)}`)).filter((s) => !s.endsWith(':undefined')));
const FRAG = readJson(join(S, '.kaif', 'hooks', 'settings-fragment.json')) || {};
const WANT = scriptsOf(FRAG.hooks).sort();
ok(WANT.length === 4, 's14 SW2: фрагмент несёт четыре хука — эталон для случаев ниже (2.9 WH: два сняты)', WANT.join(' · '));
let wcase = 0;
const wcopy = (settings, local) => {
  const d = join(ROOT, `wire-${++wcase}`);
  cpSync(S, d, { recursive: true });
  mkdirSync(join(d, '.claude'), { recursive: true });
  if (settings != null) writeFileSync(join(d, '.claude', 'settings.json'), settings);
  if (local != null) writeFileSync(join(d, '.claude', 'settings.local.json'), local);
  return d;
};
const setMarker = (d, patch) => {
  const p = join(d, '.kaif', 'kaif.json');
  writeFileSync(p, JSON.stringify({ ...readJson(p), ...patch }, null, 2) + '\n');
};
const settingsOf = (d) => { try { return readFileSync(join(d, '.claude', 'settings.json'), 'utf8'); } catch { return null; } };
// Файл владельца: свой PreToolUse-страж, права, отступ в четыре пробела — всё это обязано пережить вливание
const OWNER_OBJ = { permissions: { allow: ['Bash(ls:*)'] }, hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo owner-guard' }] }] } };
const OWNER_SETTINGS = JSON.stringify(OWNER_OBJ, null, 4) + '\n';

// (1) не подключено → `check` называет, выход 0
let W = wcopy(null, null), wr = runAll(W, ['check']);
ok(wr.code === 0 && new RegExp(`${WANT.length} delivered hook\\(s\\) not wired`).test(wr.out) && /wire-hooks/.test(wr.out),
   's14 SW2: поставленные хуки не подключены → `check` называет их числом и командой, выход 0 (предупреждение, не отказ)', wr.out.slice(-300));

// (2) файл владельца с чужим хуком → свои записи живы и первыми, наши четыре добавлены, отступ файла сохранён
W = wcopy(OWNER_SETTINGS, null); wr = runAll(W, ['wire-hooks']);
let wj = null; try { wj = JSON.parse(settingsOf(W)); } catch { /* ассерт ниже честно красный */ }
ok(wr.code === 0 && wj && JSON.stringify(wj.permissions) === JSON.stringify(OWNER_OBJ.permissions)
   && JSON.stringify(wj.hooks.PreToolUse[0]) === JSON.stringify(OWNER_OBJ.hooks.PreToolUse[0])
   && WANT.every((s) => scriptsOf(wj.hooks).includes(s)) && /\n {4}"permissions"/.test(settingsOf(W) || ''),
   's14 SW2: wire-hooks — чужой PreToolUse владельца и его права сохранены и стоят первыми, четыре хука KAIF добавлены, отступ 4 сохранён', `${wr.out.slice(-300)} | ${String(settingsOf(W)).slice(0, 200)}`);
const wiredOnce = settingsOf(W);
wr = runAll(W, ['wire-hooks']);
ok(wr.code === 0 && settingsOf(W) === wiredOnce && /already wired/.test(wr.out),
   's14 SW2: повторный wire-hooks — побайтно тот же файл («already wired»)', wr.out.slice(-200));
wr = runAll(W, ['check']);
ok(wr.code === 0 && !/not wired/.test(wr.out), 's14 SW2: после вливания `check` молчит о подключении', wr.out.slice(-300));
// (2b) J-SW2 (функциональный прогон по клонам пяти живых развёртываний 2.8, 2026-10-14): владельцы скопировали ОБРАЗЕЦ поставки — массивы
// строк в одну строку (`"args": ["…"]`) — и голый JSON.stringify разворачивал каждый. 2.9 WH (тикет #144): на пути поля 2.8 → 2.9 в
// таком файле стоит снятый хук 2.8 `pretool-owner-word` (событие PreToolUse), у сборок с main — ещё и `stop-owner-answer` в группе Stop
// рядом со стражем STATUS. Фикстура — сам образец поставки, в который вставлены обе записи в его однострочной форме, плюс свой
// многострочный список прав (форма смешанная, как у одного из пяти). `wire-hooks` обязан дать ЧИСТОЕ СНЯТИЕ: файл после — побайтно
// образец с правами владельца (строки владельца на месте и в порядке, массивы в его форме), снятые записи названы поимённо.
const RETIRED_PRE = '    "PreToolUse": [\n      {\n        "hooks": [\n          {\n            "type": "command",\n            "command": "node",\n'
  + '            "args": ["${CLAUDE_PROJECT_DIR}/.kaif/hooks/pretool-owner-word.mjs"],\n            "timeout": 10\n          }\n        ]\n      }\n    ],\n';
const RETIRED_STOP = ',\n          {\n            "type": "command",\n            "command": "node",\n'
  + '            "args": ["${CLAUDE_PROJECT_DIR}/.kaif/hooks/stop-owner-answer.mjs"],\n            "timeout": 10\n          }';
{
  const sample = readFileSync(join(S, '.kaif', 'hooks', 'settings-fragment.json'), 'utf8').replace(/\r\n/g, '\n');
  const withPerms = sample.replace(/^\{\n/, '{\n  "permissions": {\n    "allow": [\n      "Bash(npm test:*)",\n      "Bash(git status:*)"\n    ]\n  },\n');
  const guardTail = 'stop-status-guard.mjs"],\n            "timeout": 15\n          }';
  const owner28 = withPerms.replace('    "Stop": [\n', RETIRED_PRE + '    "Stop": [\n').replace(guardTail, guardTail + RETIRED_STOP);
  ok(/pretool-owner-word/.test(owner28) && /stop-owner-answer/.test(owner28) && JSON.parse(owner28).hooks.Stop[0].hooks.length === 2,
     's14 WH фикстура: образец поставки + снятые записи 2.8/2.9-pre в его однострочной форме + список прав владельца', owner28.slice(0, 200));
  W = wcopy(owner28, null); wr = runAll(W, ['check']);
  ok(wr.code === 0 && /still runs 2 hook\(s\) KAIF retired in 2\.9: PreToolUse → pretool-owner-word\.mjs · Stop → stop-owner-answer\.mjs/.test(wr.out) && /wire-hooks/.test(wr.out),
     's14 WH: `check` называет подключённые снятые хуки поимённо и команду, выход 0', wr.out.slice(-400));
  wr = runAll(W, ['checkpoint', 'wire-hooks']);
  ok(wr.code !== 0 && /retired, still wired: PreToolUse → pretool-owner-word\.mjs/.test(wr.out),
     's14 WH: `checkpoint wire-hooks` при подключённом снятом хуке — отказ, хук назван', wr.out.slice(-300));
  wr = runAll(W, ['wire-hooks']);
  const after = (settingsOf(W) || '').replace(/\r\n/g, '\n');
  ok(wr.code === 0 && after === withPerms && /removed PreToolUse → pretool-owner-word\.mjs/.test(wr.out) && /removed Stop → stop-owner-answer\.mjs/.test(wr.out)
     && /2 entries of retired KAIF hooks removed/.test(wr.out) && !/re-serialized/.test(wr.out),
     's14 WH: wire-hooks — чистое снятие: файл после — побайтно образец с правами владельца, страж STATUS в группе Stop на месте, снятые названы',
     `${wr.out.slice(-300)} | ${after === withPerms ? '' : 'первая разница с позиции ' + [...after].findIndex((c, i) => c !== withPerms[i])}`);
  const removedOnce = settingsOf(W);
  wr = runAll(W, ['wire-hooks']);
  ok(wr.code === 0 && settingsOf(W) === removedOnce && /already wired/.test(wr.out), 's14 WH: повторный wire-hooks после снятия — побайтно тот же файл', wr.out.slice(-200));
  wr = runAll(W, ['check']);
  ok(wr.code === 0 && !/retired/.test(wr.out) && !/not wired/.test(wr.out), 's14 WH: после снятия `check` молчит о проводке', wr.out.slice(-300));
  // владелец сам держит свой PreToolUse-страж рядом со снятым: его группа остаётся, снимается только запись KAIF
  const ownerPre = JSON.parse(owner28);
  ownerPre.hooks.PreToolUse.unshift(OWNER_OBJ.hooks.PreToolUse[0]);
  W = wcopy(JSON.stringify(ownerPre, null, 2) + '\n', null); wr = runAll(W, ['wire-hooks']);
  let pj = null; try { pj = JSON.parse(settingsOf(W)); } catch { /* ассерт ниже честно красный */ }
  ok(wr.code === 0 && pj && pj.hooks.PreToolUse?.length === 1 && JSON.stringify(pj.hooks.PreToolUse[0]) === JSON.stringify(OWNER_OBJ.hooks.PreToolUse[0])
     && !/pretool-owner-word|stop-owner-answer/.test(settingsOf(W) || ''),
     's14 WH: свой PreToolUse владельца рядом со снятым — его группа на месте, ушла только запись KAIF', `${wr.out.slice(-200)} | ${String(settingsOf(W)).slice(0, 300)}`);
  // личный settings.local.json KAIF не правит никогда: снятый хук там назван, файл побайтно нетронут
  const localWithRetired = JSON.stringify({ hooks: { PreToolUse: JSON.parse(owner28).hooks.PreToolUse } }, null, 2) + '\n';
  W = wcopy(withPerms, localWithRetired); wr = runAll(W, ['wire-hooks']);
  const localAfter = readFileSync(join(W, '.claude', 'settings.local.json'), 'utf8');
  const wck2 = runAll(W, ['check']);
  ok(wr.code === 0 && localAfter === localWithRetired && /settings\.local\.json \(personal, never edited by KAIF\) still runs a hook KAIF retired: PreToolUse → pretool-owner-word\.mjs/.test(wr.out)
     && /settings\.local\.json still runs 1 hook\(s\) KAIF retired/.test(wck2.out),
     's14 WH: снятый хук в settings.local.json — назван (wire-hooks и check), личный файл побайтно нетронут', `${wr.out.slice(-300)} | ${wck2.out.slice(-200)}`);
  // "hooks": "off": KAIF файл не пишет и при снятом хуке — называет его и говорит снять руками
  W = wcopy(owner28, null); setMarker(W, { hooks: 'off' });
  wr = runAll(W, ['wire-hooks']); const wck3 = runAll(W, ['check']);
  ok(wr.code === 0 && settingsOf(W) === owner28 && /remove that entry by hand/.test(wr.out) && /KAIF retired in 2\.9/.test(wck3.out),
     's14 WH: "hooks": "off" — файл побайтно нетронут, снятые хуки названы с ходом «руками»', `${wr.out.slice(-200)} | ${wck3.out.slice(-200)}`);
}

// 2.9 (тикеты origin #143 · #145): подключённый таймер освежения стрелял на ПЕРВОМ промпте владельца после установки — свидетеля
// освежения не писал никто; полевой агент обошёл это, перечитав ядро на пункте study и записав маркер. Пункт теперь говорит это, а его
// отметка исполняет гейт: маркер на диске, называет перечитанное, моложе часа (интервал самого таймера). Красный — на сборке a81cc95.
{
  const MK = (d) => join(d, '.kaif', 'refresh-marker.json');
  const task = (d) => readFileSync(join(d, 'KAIF_ADAPTATION_TASK.md'), 'utf8');
  W = wcopy(null, null); rmSync(MK(W), { force: true });
  ok(/stamp the refresh witness `\.kaif\/refresh-marker\.json`/.test(task(W)), 's14 study: пункт задания установки велит записать свидетеля освежения', task(W).slice(0, 200));
  wr = runAll(W, ['checkpoint', 'study']);
  ok(wr.code !== 0 && /refresh-marker\.json is missing/.test(wr.out) && !/study done/.test(task(W)), 's14 study: отметка без маркера освежения — отказ, свидетель назван', wr.out.slice(-300));
  writeFileSync(MK(W), JSON.stringify({ at: new Date(Date.now() - 90 * 60000).toISOString(), docs: ['STATUS.md'], trigger: 'ritual:install' }) + '\n');
  wr = runAll(W, ['checkpoint', 'study']);
  ok(wr.code !== 0 && /is 90 min old/.test(wr.out), 's14 study: маркер полуторачасовой давности — отказ, возраст назван', wr.out.slice(-300));
  writeFileSync(MK(W), JSON.stringify({ at: new Date().toISOString(), docs: ['STATUS.md', 'AGENT_GUIDE.md'], trigger: 'ritual:install' }) + '\n');
  wr = runAll(W, ['checkpoint', 'study']);
  ok(wr.code === 0 && /KAIF-ADAPT: study done/.test(task(W)), 's14 study: свежий маркер с перечитанным — отметка записана', wr.out.slice(-300));
}

// (3) чекпоинт задания исполняет гейт: не подключено → отказ с командой; подключено → записан
W = wcopy(null, null); wr = runAll(W, ['checkpoint', 'wire-hooks']);
ok(wr.code !== 0 && /NOT wired/.test(wr.out) && /--verdict/.test(wr.out),
   's14 SW2: `checkpoint wire-hooks` без подключения — отказ, названы команда и запись отказа харнесса', wr.out.slice(-300));
wr = runAll(W, ['wire-hooks']);   // результат судится до следующей команды (страж немых команд, bugs/61)
ok(wr.code === 0 && /4 of 4 KAIF hooks added/.test(wr.out), 's14 SW2: wire-hooks на свежей копии — четыре из четырёх добавлены', wr.out.slice(-200));
const wck = runAll(W, ['checkpoint', 'wire-hooks']);
ok(wck.code === 0 && /wire-hooks done/.test(readFileSync(join(W, 'KAIF_ADAPTATION_TASK.md'), 'utf8')),
   's14 SW2: после wire-hooks чекпоинт записан в задании установки', wck.out.slice(-200));
// отказ харнесса не обходится — записывается его словами (researches/37): чекпоинт с --verdict пишет строку «NOT wired»
W = wcopy(null, null); wr = runAll(W, ['checkpoint', 'wire-hooks', '--verdict', 'harness refused the write']);
ok(wr.code === 0 && /wire-hooks NOT wired \(.*\): harness refused the write/.test(readFileSync(join(W, 'KAIF_ADAPTATION_TASK.md'), 'utf8')),
   's14 SW2: отказ харнесса — `checkpoint wire-hooks --verdict` записывает «NOT wired» с его словами', wr.out.slice(-200));

// (4) ключ отказа владельца: файл побайтно нетронут, `check` молчит; чужое значение ключа — находка схемы
W = wcopy(OWNER_SETTINGS, null); setMarker(W, { hooks: 'off' }); wr = runAll(W, ['wire-hooks']);
const wchk = runAll(W, ['check']);
ok(wr.code === 0 && settingsOf(W) === OWNER_SETTINGS && /opted out/.test(wr.out) && !/not wired/.test(wchk.out),
   's14 SW2: "hooks": "off" — settings.json побайтно нетронут, `check` о подключении молчит', `${wr.out.slice(-200)} | ${wchk.out.slice(-200)}`);
setMarker(W, { hooks: 'on' }); wr = runAll(W, ['check']);
ok(wr.code !== 0 && /marker schema: hooks is "on"/.test(wr.out), 's14 SW2: "hooks": "on" — находка схемы маркера (законно только "off")', wr.out.slice(-300));

// (5) BOM и CRLF файла владельца переживают вливание
W = wcopy(BOM_CHAR + OWNER_SETTINGS.replace(/\n/g, '\r\n'), null); wr = runAll(W, ['wire-hooks']);
const wraw = settingsOf(W) || '';
let wbom = null; try { wbom = JSON.parse(wraw.slice(1)); } catch { /* ассерт ниже */ }
ok(wr.code === 0 && wraw.startsWith(BOM_CHAR) && !/[^\r]\n/.test(wraw) && wbom && WANT.every((s) => scriptsOf(wbom.hooks).includes(s)),
   's14 SW2: файл с BOM и CRLF — влито, BOM и концы строк CRLF сохранены', `${wr.out.slice(-200)} | ${JSON.stringify(wraw.slice(0, 40))}`);

// (6) файл, который нельзя разобрать без догадки (комментарий), — не тронут, выход 1, причина названа
const BROKEN = '{\n  // my notes\n  "permissions": {}\n}\n';
W = wcopy(BROKEN, null); wr = runAll(W, ['wire-hooks']);
ok(wr.code === 1 && settingsOf(W) === BROKEN && /not parseable JSON/.test(wr.out),
   's14 SW2: settings.json с комментарием — выход 1, файл побайтно нетронут, причина названа', wr.out.slice(-300));

// (7) хуки уже подключены в личном settings.local.json → проектный файл не создаётся, дубля нет
W = wcopy(null, JSON.stringify({ hooks: FRAG.hooks }, null, 2) + '\n'); wr = runAll(W, ['wire-hooks']);
ok(wr.code === 0 && settingsOf(W) === null && /already wired/.test(wr.out),
   's14 SW2: хуки уже в settings.local.json — settings.json не создан, дубля нет', wr.out.slice(-200));

// (8) среди систем развёртывания нет той, что читает .claude/settings.json → писать нечего
W = wcopy(null, null); setMarker(W, { agents: ['codex'] }); wr = runAll(W, ['wire-hooks']);
ok(wr.code === 0 && settingsOf(W) === null && /nothing to wire/.test(wr.out),
   's14 SW2: развёртывание только под Codex — settings.json не создан («nothing to wire»)', wr.out.slice(-200));

console.log('\n=== s14: деплой без ПОДКЛЮЧЕНИЯ хуков — инвариант §9.10 ===');
ok(!existsSync(join(S, '.claude', 'settings.json')) && !existsSync(join(S, '.claude', 'settings.local.json')),
   's14 без подключения: settings.json в песочнице НЕТ — хуки развёрнуты, но не активированы');
r = run(S, 'check');
ok(r.code === 0, 's14 без подключения: check зелёный — ни один гейт не требует wiring хуков', r.out.slice(-400));
rmSync(join(S, '.kaif', 'hooks'), { recursive: true, force: true });
r = run(S, 'check');
ok(r.code !== 0 && /MISSING or empty: \.kaif\/hooks\//.test(r.out),
   's14 контраст: УДАЛЕНИЕ файлов модуля — честный MISSING (целостность поставки, как у tool-модулей)', r.out.slice(-300));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница refresh-hooks зелёная (деплой с модулем и без · 4 хука по живому контракту · снятые хуки сняты с проводки)'}`);
process.exit(failures ? 1 : 0);
