// s14-refresh-hooks.mjs — песочница опционального модуля refresh-hooks (2.2, эпик O, фаза O3,
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
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, utimesSync } from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
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
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
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
ok(HOOK_FILES.slice(0, 3).every((f) => fragTxt.includes(`.kaif/hooks/${f}`)),
   's14 фрагмент конфига: команды указывают на все три развёрнутых скрипта');

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
  ['Codex', 'sample-codex-hooks.json', null,
   ['session-start-refresh.mjs', 'prompt-refresh-timer.mjs'], ['stop-status-guard.mjs']],
  ['Cursor', 'sample-cursor-hooks.json', '--emit cursor',
   ['session-start-refresh.mjs'], ['prompt-refresh-timer.mjs', 'stop-status-guard.mjs']],
  ['Copilot', 'sample-copilot-hooks.json', '--emit copilot',
   ['session-start-refresh.mjs'], ['prompt-refresh-timer.mjs', 'stop-status-guard.mjs']],
  ['Antigravity', 'sample-antigravity-hooks.json', '--emit antigravity',
   ['prompt-refresh-timer.mjs'], ['session-start-refresh.mjs', 'stop-status-guard.mjs']],
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
console.log('\n=== s14: деплой без ПОДКЛЮЧЕНИЯ хуков — инвариант §9.10 ===');
ok(!existsSync(join(S, '.claude', 'settings.json')) && !existsSync(join(S, '.claude', 'settings.local.json')),
   's14 без подключения: settings.json в песочнице НЕТ — хуки развёрнуты, но не активированы');
r = run(S, 'check');
ok(r.code === 0, 's14 без подключения: check зелёный — ни один гейт не требует wiring хуков', r.out.slice(-400));
rmSync(join(S, '.kaif', 'hooks'), { recursive: true, force: true });
r = run(S, 'check');
ok(r.code !== 0 && /MISSING or empty: \.kaif\/hooks\//.test(r.out),
   's14 контраст: УДАЛЕНИЕ файлов модуля — честный MISSING (целостность поставки, как у tool-модулей)', r.out.slice(-300));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница refresh-hooks зелёная (деплой с модулем и без · 3 хука по живому контракту)'}`);
process.exit(failures ? 1 : 0);
