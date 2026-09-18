// s22-contour-shipped.mjs — свод эпика IC 2.6 «Интерактивный контур поставкой» (plans/93 критерии 2–4;
// issue #51 Unliminium: «открыл сломанный интерактивный контур без радиокнопок… нужно, чтобы KAIF имел в
// поставке готовый интерактивный контур»; интервью №024 Q1 = B, №101 — пересмотр №34). Три ответа на
// развёрнутой копии: (A) свежая установка привозит контракт `.kaif/INTERACTIVE_CONTOUR_SPEC.md` и генератор
// `.kaif/tools/contour/` (три модуля), `--selftest` зелёный и называет красную фикстуру; (B) предполёт —
// случай #051 «варианты абзацами» → exit 3 с «Q1» и формой `- **A)**`, канонический документ → `--no-serve`
// exit 0, рендер несёт радиокнопки и `header { position:static` (слово владельца), «RENDER IS NOT YET A SHOW»
// (M8), `--mark-shown` пишет `shown.json`, `--queue --list` — код 2 до показа и 0 после (I41/I42);
// (C) маршрут обновления: развёртывание «старого релиза» БЕЗ блоков контура (дропнуты из текущего бандла) со
// СВОИМ `tools/review.mjs` → `update --source 9.9` → файлы контура на месте, свой инструмент побайтно прежний
// (машинерия пишет только под `.kaif/`), мета бандла несёт policy-change/notes 2.6 о контуре без «спросите
// владельца». Красное доказательство — тело пробы `probes/ic3-contour-generator.mjs` до IC3 (3 ✓ / 1 ✗ «генератор
// отсутствует», 21:25 сессии 55) + мутация на копии HTML: страница без радиокнопок роняет самопроверку
// `selfCheck` отгружаемого модуля.
// (E) эпик AQ 2.7 (plans/115; тикет #70 — 13 вопросов принесены владельцу, хотя его прошлые ответы их уже решили, один —
//     через 44 дня): ВТОРАЯ ось той же двери — АРХЕОЛОГИЯ живого вопроса. Живой вопрос документа с датой шапки ≥ порога без
//     строки аттестации → `--check` код 3 и НАПЕЧАТАННАЯ команда грепа; с аттестацией → 0; `N hits` > 0 при `prior: none`
//     → 3; отвеченный вопрос и дата шапки до порога → 0 (историю поля не красим). Красное — шов `KAIF_DIST` на ядре 2.6
//     (ассерты «код 3» красные по имени) и мутант порога на копии `dist`.
// (D) эпик IW 2.7 (plans/108; тикет #64 — контур поднят вкладкой, черновик потерян): замок мёртвого процесса на свободном
//     порту → перезапуск на ТОМ ЖЕ порту и «reused from the previous run»; на ЗАНЯТОМ → свежий порт и «taken … NOT visible
//     here»; рендер несёт самопроверку окна (display-mode: standalone · #tabnote · POST /tab). Красный — пробы IW0 до кода и
//     шов KAIF_DIST на ядре 2.6 (три ассерта красные, свод доходит до вердикта).
// [TESTED: 2026-09-05 · зелёный стоя и в составе полигона — «sandbox suite: all 22 suites green» (npm run test:core,
//  сессия 56); красный до IC3 — проба-предшественник 3 ✓ / 1 ✗ «генератор отсутствует» (21:25 сессии 55); мутация
//  на копии HTML (радиокнопки вырезаны) роняет selfCheck отгружаемого модуля — ассерт «КРАСНАЯ на копии»;
//  2026-09-12 · IW: «all checks green» стоя, на ядре 2.6 (KAIF_DIST) три ассерта IW красные — отчёт
//  testcases/reports/2026-09-12_polygon-2.7-IW.md]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync, execSync, spawn } from 'node:child_process';
import { createServer as createNetServer } from 'node:net';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../lib/temp-root.mjs';
import { must, coreRunner, failed, quietEnv, QUIET_TIMEOUT_MS } from '../lib/sandbox-run.mjs';
import { findBrowser, headlessPage } from '../lib/cdp-mini.mjs'; // LP (2.7): the headless recovery run drives the real page

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// KAIF_DIST — шов для доказательства красного: свод против ЧУЖОЙ сборки (HEAD до IC3), без правки кода.
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const ROOT = tempRoot('contour-shipped', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-400)));
  if (!cond) failures++;
};
const run = coreRunner(ROOT);
// Генератор запускается из cwd развёртывания — ровно так его зовут навыки; результат ВСЕГДА судится ok(...).
// ТИХО (bugs/116): под швом KAIF_DIST здесь работает СТАРЫЙ генератор, который не знает новых флагов и на них
// показывает страницу владельцу и зовёт его голосом — так ночью 2026-09-12 четыре прогона подняли у владельца
// «fresh · Interview #052 — проба». Окружение без программ в PATH делает окно и звук невозможными на любой
// версии; жёсткий срок убивает страницу, которая всё же ждёт. Страж — преполёт полигона (tools/sandbox-suite.mjs).
const runGen = (cwd, args) => {
  try { return { code: 0, out: execFileSync(process.execPath, [join(cwd, '.kaif', 'tools', 'contour', 'review.mjs'), ...args], { cwd, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024, env: quietEnv(), timeout: QUIET_TIMEOUT_MS }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args: 'contour ' + args.join(' ') }); }
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const seed = (dir, bundle = join(DIST, 'KAIF-CORE-BUNDLE.md')) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(bundle, join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const CONTOUR_FILES = ['.kaif/tools/contour/core.mjs', '.kaif/tools/contour/review.mjs', '.kaif/tools/contour/texts.mjs', '.kaif/INTERACTIVE_CONTOUR_SPEC.md'];
const BAD_051 = ['# Interview #051 — проба', '', '> Topic: проба формы', '> Status: **🟡 awaiting the owner\'s answers**', '',
  '### Q1. Что выбрать?', '', '**A. Первый вариант** — абзацем, не списком.', '', '**B. Второй вариант** — тоже абзацем.', '', '**Answer:**', ''].join('\n');
const GOOD_052 = ['# Interview #052 — проба', '', '> Topic: проба формы', '> Status: **🟡 awaiting the owner\'s answers**', '',
  '### Q1. Что выбрать?', '', 'Рекомендация агента: B', '', '- **A)** первый вариант', '- **B)** второй вариант', '- **C)** свой вариант', '', '**Answer:**', ''].join('\n');

// ================================================================ A: свежая установка (ru) привозит контракт и генератор
console.log('\n=== s22 A: свежая установка из бандла — контракт + генератор трёх лиц на месте, селфтест зелёный ===');
const P = join(ROOT, 'fresh'); seed(P);
must(run, P, 'install --lang ru');
for (const f of CONTOUR_FILES) ok(existsSync(join(P, f)), 's22 A: приехал ' + f);
// CL (2.7, #63): отгружаемый генератор называет границу собственного заявления у каждого поднятого окна —
// «the launcher returned 0; whether a window is on the owner's screen this line does not verify»
ok(existsSync(join(P, '.kaif', 'tools', 'contour', 'review.mjs')) && /this line does not verify/.test(readFileSync(join(P, '.kaif', 'tools', 'contour', 'review.mjs'), 'utf8')),
   's22 A: генератор несёт честную строку окна «this line does not verify» (заявление не шире наблюдения, эпик CL #63)');
ok(readFileSync(join(P, '.kaif', 'INTERACTIVE_CONTOUR_SPEC.md'), 'utf8').split('\n').length <= 120, 's22 A: контракт ≤ 120 строк (критерий 1)');
let r = runGen(P, ['--selftest']);
ok(r.code === 0, 's22 A: --selftest на развёрнутой копии зелёный (exit 0)', r.out);
ok(/paragraph/i.test(r.out) && /three faces/i.test(r.out), 's22 A: селфтест называет красную фикстуру «варианты абзацами» и три лица', r.out.slice(-300));
ok(!/[А-Яа-яЁё]/.test(readFileSync(join(P, '.kaif', 'tools', 'contour', 'review.mjs'), 'utf8') + readFileSync(join(P, '.kaif', 'tools', 'contour', 'core.mjs'), 'utf8')),
   's22 A: генератор и ядро без кириллицы (гард 5d) — тексты живут в texts.mjs по языку развёртывания');

// ================================================================ B: предполёт, рендер, показ (критерии 2–3)
console.log('\n=== s22 B: предполёт красный на #051, канонический документ рендерится с радиокнопками, факт показа ===');
mkdirSync(join(P, 'interviews'), { recursive: true });
writeFileSync(join(P, 'interviews', 'interview_051_probe.md'), BAD_051);
writeFileSync(join(P, 'interviews', 'interview_052_probe.md'), GOOD_052);
r = runGen(P, ['interviews/interview_051_probe.md', '--no-open']);
ok(r.code === 3, 's22 B: #051 «варианты абзацами» → предполёт отказывает открывать, exit 3 (критерий 2)', 'exit ' + r.code + ': ' + r.out.slice(-300));
ok(/Q1/.test(r.out) && /\*\*A\)\*\*/.test(r.out) && /radio/i.test(r.out), 's22 B: отказ называет вопрос Q1, форму «- **A)**» и слово «radio»', r.out.slice(-300));
// QL1 (2.7, #56): --check — the form door on the deployed copy: exit 3/0, no page, no call, no shown.json
r = runGen(P, ['interviews/interview_051_probe.md', '--check']);
ok(r.code === 3 && /Q1/.test(r.out) && /radio/i.test(r.out) && !/Page is up|CALL:|Shown recorded/.test(r.out),
   's22 B: --check на #051 → exit 3, называет Q1 и radio; ни «Page is up», ни «CALL:», ни факта показа (QL1, #56)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = runGen(P, ['interviews/interview_052_probe.md', '--check']);
ok(r.code === 0 && /Q1/.test(r.out) && /(узнано|recognised) 1/.test(r.out) && !/Page is up|CALL:|Shown recorded/.test(r.out) && !existsSync(join(P, 'interviews', 'decisions', 'shown.json')),
   's22 B: --check на #052 → exit 0, «блоков 1, узнано 1: Q1», страницы и зова нет, shown.json не появился', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = runGen(P, ['interviews/interview_051_probe.md', '--no-serve']);
ok(r.code === 3, 's22 B: предполёт стоит и перед --no-serve (рендер сломанной страницы не выдаётся)', r.out.slice(-200));
r = runGen(P, ['interviews/interview_052_probe.md', '--no-serve']);
ok(r.code === 0 && /RENDER IS NOT YET A SHOW/.test(r.out), 's22 B: канонический документ → --no-serve exit 0 + «RENDER IS NOT YET A SHOW» (M8)', r.out.slice(-300));
const rendered = join(P, '.kaif', '.contour-tmp', 'interview_052_probe.html');
ok(existsSync(rendered), 's22 B: рендер лежит под .kaif/.contour-tmp/ (машинерия пишет только под .kaif/)');
const html = existsSync(rendered) ? readFileSync(rendered, 'utf8') : '';
ok((html.match(/type="radio"/g) || []).length === 3 && (html.match(/name="choice:interviews\/interview_052_probe\.md:Q1"/g) || []).length === 3,
   's22 B: три радиокнопки одной группы у Q1 (критерий 3: «радиогрупп = вопросов»)');
ok(/header \{ position:static;/.test(html), 's22 B: шапка скроллится со страницей — header { position:static } (слово владельца)');
ok(/\.fab \{ position:fixed; top:12px; right:16px/.test(html) && !/bottom:0/.test(html) && !/class="bar"/.test(html) && html.includes('<div class="fab"><button id="save"'),
   's22 B: кнопка записи — плавающая справа сверху (position:fixed; top; right), нижней панели на странице нет (QL4, #60)');
ok(html.includes('<html lang="ru">') && html.includes('Записать решение') && html.includes('рекомендую'), 's22 B: страница на языке развёртывания (ru): lang, кнопка, чип рекомендации');
ok(html.includes(' · interview_052_probe.md') === false && html.includes('<span class="project">fresh</span>'), 's22 B: имя проекта в шапке выведено из имени каталога (kaif.json без projectName — #97, без вопроса)');
// IW (2.7, #64, I26): страница сама проверяет, окно она или ВКЛАДКА — display-mode: standalone (правда снята с Chrome:
// true только в окне --app), жёлтая полоса владельцу + POST /tab серверу; на ядре 2.6 этого нет — красный швом KAIF_DIST
ok(/display-mode: standalone/.test(html) && html.includes('id="tabnote"') && html.includes("'/tab'"),
   's22 B: рендер несёт самопроверку окна — display-mode: standalone · #tabnote · POST /tab (IW, #64, I26)');
// IW (2.7, #64, I29): ЗАМОК ПЕРЕЖИВАЕТ смерть процесса — перезапуск того же документа берёт ПРЕЖНИЙ порт (черновик в его
// origin восстанавливается сам); занятый порт → свежий порт + предупреждение поимённо. Красный доказан пробой IW0 до кода
// («relaunch came up on: <новый порт>», ни слова о черновике) и швом KAIF_DIST на ядре 2.6.
const freePort = () => new Promise((res) => { const s = createNetServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const LOCK = join(P, 'interviews', 'decisions', 'interview_052_probe.lock');
mkdirSync(join(P, 'interviews', 'decisions'), { recursive: true });
const p0 = await freePort();
writeFileSync(LOCK, JSON.stringify({ pid: 999999, url: 'http://127.0.0.1:' + p0 + '/', startedAt: '2026-09-12T23:00:00+03:00' }) + '\n');
r = runGen(P, ['interviews/interview_052_probe.md', '--no-open', '--silent', '--timeout', '1']);
ok(new RegExp('Page is up: http://127\\.0\\.0\\.1:' + p0 + '/').test(r.out) && /reused from the previous run/.test(r.out),
   's22 B: замок мёртвого процесса на свободном порту ' + p0 + ' → перезапуск на ТОМ ЖЕ порту и «reused from the previous run» (IW, #64, I29)', 'exit ' + r.code + ': ' + r.out.slice(-300));
const p1 = await freePort();
const squatter = createNetServer(); await new Promise((res) => squatter.listen(p1, '127.0.0.1', res));
writeFileSync(LOCK, JSON.stringify({ pid: 999999, url: 'http://127.0.0.1:' + p1 + '/', startedAt: '2026-09-12T23:00:00+03:00' }) + '\n');
r = runGen(P, ['interviews/interview_052_probe.md', '--no-open', '--silent', '--timeout', '1']);
ok(/is taken by another process/.test(r.out) && /NOT visible here/.test(r.out) && /Page is up: /.test(r.out) && !new RegExp('Page is up: http://127\\.0\\.0\\.1:' + p1 + '/').test(r.out),
   's22 B: замок на ЗАНЯТОМ порту ' + p1 + ' → свежий порт и предупреждение «taken … NOT visible here» (IW, #64, I29)', 'exit ' + r.code + ': ' + r.out.slice(-300));
squatter.close(); rmSync(LOCK, { force: true });
// IW (2.7, #64, I26 — СЕРВЕРНАЯ половина самопроверки окна): страница-вкладка шлёт POST /tab, генератор пишет ОДНУ строку
// лога агенту. Браузера нет: клиент один раз шлёт POST, как только страница поднялась; контрольный запуск не шлёт ничего
// и строки не получает — строка, печатаемая безусловно, прошла бы первый ассерт впустую. Тихое окружение, жёсткий срок;
// страница заканчивается своей вахтой тишины.
const launchTab = (postTab) => new Promise((resolveP) => {
  const child = spawn(process.execPath, [join(P, '.kaif', 'tools', 'contour', 'review.mjs'), 'interviews/interview_052_probe.md', '--no-open', '--silent', '--timeout', '1'],
    { cwd: P, env: quietEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; let posted = false;
  const onData = (d) => {
    out += d;
    const m = /Page is up: (http:\/\/127\.0\.0\.1:\d+\/)/.exec(out);
    if (m && postTab && !posted) { posted = true; fetch(m[1] + 'tab', { method: 'POST' }).catch((e) => { out += '\n[POST /tab failed: ' + e.message + ']'; }); }
  };
  child.stdout.on('data', onData); child.stderr.on('data', onData);
  const deadline = setTimeout(() => child.kill(), QUIET_TIMEOUT_MS);
  child.on('exit', (code) => { clearTimeout(deadline); resolveP({ code, out, posted }); });
});
const tabRun = await launchTab(true);
const tabLines = (tabRun.out.match(/Window check: the page reports it is NOT in an app window \(display-mode: browser\)/g) || []).length;
ok(tabRun.posted && tabLines === 1,
   's22 B: POST /tab от страницы-вкладки → ровно одна строка лога «Window check: … NOT in an app window» (IW, #64, I26 — серверная половина, клиент без браузера)',
   'posted ' + tabRun.posted + ', lines ' + tabLines + ': ' + tabRun.out.slice(-300));
const quietRun = await launchTab(false);
ok(/Page is up: /.test(quietRun.out) && !/Window check:/.test(quietRun.out),
   's22 B: контроль — страница поднята, POST /tab не было → строки «Window check:» нет (строка не печатается безусловно)', quietRun.out.slice(-300));
rmSync(LOCK, { force: true });
// Красное доказательство мутацией на копии: страница без радиокнопок роняет самопроверку отгружаемого модуля.
const gen = await import(pathToFileURL(join(P, '.kaif', 'tools', 'contour', 'review.mjs')).href);
const page = gen.buildPage(P, 'interviews/interview_052_probe.md');
ok(gen.selfCheck(page).ok && gen.selfCheck({ ...page, html: page.html.replace(/<input type="radio"[^>]*>/g, '') }).ok === false,
   's22 B: самопроверка зелёная на живой странице и КРАСНАЯ на копии без радиокнопок (мутация на копии)');
// I40–I42: очередь без браузера — код 2, пока ждущий документ ни разу не показан; --mark-shown → 0.
r = runGen(P, ['--queue', '--list']);
ok(r.code === 2 && /НИ РАЗУ НЕ ПОКАЗАН/.test(r.out) && /interview_052_probe/.test(r.out), 's22 B: --queue --list → код 2, «НИ РАЗУ НЕ ПОКАЗАН» по-русски (I41/I42)', r.out.slice(-300));
r = runGen(P, ['--mark-shown', 'interviews/interview_052_probe.md', '--transport', 'чат']);
ok(r.code === 0 && existsSync(join(P, 'interviews', 'decisions', 'shown.json')), 's22 B: --mark-shown пишет interviews/decisions/shown.json (I40)', r.out.slice(-200));
r = runGen(P, ['--mark-shown', 'interviews/interview_051_probe.md', '--transport', 'чат']);
ok(r.code === 0, 's22 B: факт показа записан и для #051 (вопрос задан в чате после отказа предполёта)', r.out.slice(-200));
// I44/I45 (QL2, #54): четвёртый факт «внесено» на развёрнутой копии — запись · отказ очереди · отказ показа
r = runGen(P, ['--mark-implemented', 'interviews/interview_052_probe.md', 'Q1', '--where', 'commit abc123']);
ok(r.code === 0 && existsSync(join(P, 'interviews', 'decisions', 'implemented.json')) && /abc123/.test(readFileSync(join(P, 'interviews', 'decisions', 'implemented.json'), 'utf8')),
   's22 B: --mark-implemented пишет interviews/decisions/implemented.json с адресом (I44, QL2 #54)', r.out.slice(-200));
r = runGen(P, ['--queue', '--list']);
ok(r.code === 2 && /внесено, но открыто/.test(r.out) && /interview_052_probe\.md Q1/.test(r.out), 's22 B: очередь не поднимает внесённое — «внесено, но открыто: … Q1», код 2 (I45)', r.out.slice(-300));
r = runGen(P, ['interviews/interview_052_probe.md', '--no-serve']);
ok(r.code === 2 && /внесено, но открыто/.test(r.out) && !/RENDER IS NOT YET A SHOW/.test(r.out), 's22 B: показ внесённого документа отказан кодом 2 — рендера нет (I45)', r.out.slice(-200));
r = runGen(P, ['--mark-implemented', 'interviews/interview_052_probe.md', 'Q9', '--where', 'x']);
ok(r.code === 1 && /Q9/.test(r.out), 's22 B: --mark-implemented на несуществующий вопрос — отказ кодом 1 с именами известных', r.out.slice(-200));
rmSync(join(P, 'interviews', 'decisions', 'implemented.json'), { force: true });
// QL3 (#54): фикстура «пять отвеченных с таблицами + один живой» — над живым вопросом ≤ 1 % видимого текста страницы
const qa53 = (i) => '### Q' + i + '. Вопрос ' + i + '?\n\n| Вариант | Что означает | Цена |\n|---|---|---|\n| **A** | раз — длинное пояснение на строку | низкая |\n| **B** | два — ещё одно длинное пояснение | высокая |\n\n**Answer:** A — берём раз <!-- owner-review: by owner · 1 сентября 2026 -->\n\n';
writeFileSync(join(P, 'interviews', 'interview_053_probe.md'), '# Interview #053 — архив\n\n> Status: **🟡 awaiting**\n\nДлинный контекст на много строк.\n\n' + qa53(1) + qa53(2) + qa53(3) + qa53(4) + qa53(5) + '### Q6. Живой?\n\n- **A)** раз\n- **B)** два\n\n**Answer:**\n');
r = runGen(P, ['interviews/interview_053_probe.md', '--no-serve']);
const html53 = r.code === 0 ? readFileSync(join(P, '.kaif', '.contour-tmp', 'interview_053_probe.html'), 'utf8') : '';
const vis = (s) => s.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const mainAt = html53.indexOf('<main>'), liveAt = html53.indexOf('<strong>Q6.</strong>');
const above = liveAt > mainAt && mainAt >= 0 ? vis(html53.slice(mainAt, liveAt)).length : Infinity, total = vis(html53).length;
ok(r.code === 0 && liveAt > 0 && above <= total * 0.01 && html53.indexOf('<details class="archive">') > liveAt && (html53.match(/<section class="qcard/g) || []).length === 6,
   's22 B: #054-фикстура — над живым Q6 ' + above + ' знаков из ' + total + ' (≤ 1 %), архив решённого ниже, все 6 карточек на месте (QL3)', 'exit ' + r.code + ' above=' + above + ' total=' + total);
rmSync(join(P, 'interviews', 'interview_053_probe.md'), { force: true });
r = runGen(P, ['--queue', '--list']);
ok(r.code === 0 && !/НИ РАЗУ/.test(r.out), 's22 B: после факта показа очередь — код 0 (I42)', r.out.slice(-300));
// Лица «вычитка» и «макет» рендерятся без браузера.
mkdirSync(join(P, 'docs'), { recursive: true });
writeFileSync(join(P, 'docs', 'DRAFT.md'), '# Черновик\n\nПервый абзац.\n\nВторой абзац.\n');
writeFileSync(join(P, 'docs', 'mock.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));
r = runGen(P, ['docs/DRAFT.md', '--proofread', '--no-serve']);
const pr = existsSync(join(P, '.kaif', '.contour-tmp', 'DRAFT.html')) ? readFileSync(join(P, '.kaif', '.contour-tmp', 'DRAFT.html'), 'utf8') : '';
ok(r.code === 0 && (pr.match(/name="para:docs\/DRAFT\.md:p\d"/g) || []).length === 3 && pr.includes('Готово'), 's22 B: лицо «вычитка» — поле у каждого из трёх абзацев и кнопка «Готово»', r.out.slice(-200));
r = runGen(P, ['docs/mock.png', '--mockup', '--no-serve']);
const mk = existsSync(join(P, '.kaif', '.contour-tmp', 'mock.html')) ? readFileSync(join(P, '.kaif', '.contour-tmp', 'mock.html'), 'utf8') : '';
ok(r.code === 0 && mk.includes('<img src="data:image/png;base64,') && mk.includes('name="doccomment:docs/mock.png"'), 's22 B: лицо «отсмотр макета» — картинка и поле замечаний', r.out.slice(-200));

// ================================================================ E: АРХЕОЛОГИЯ живого вопроса (AQ 2.7, тикет #70)
console.log('\n=== s22 E: дверь --check судит АРХЕОЛОГИЮ живого вопроса — код 3 без аттестации с напечатанной командой, 0 с ней ===');
// Фикстуры несут таблицу вариантов и дату шапки СТРОКОЙ `Created` (порог оси — дата шапки; строка `Created`
// сильнее любой другой даты головы, иначе дата ОТВЕТА старила бы документ вперёд).
const AQ_DOC = 'interviews/interview_054_archaeology.md';
const aqHead = (date) => '# Interview #054 — проба археологии\n\n> Status: **🟡 awaiting**\n> Created: ' + date + '\n\n';
const aqQ = (att, answer) => '### Q1. Как назвать валюту игры?\n\n' + att
  + '| Вариант | Что означает |\n|---|---|\n| **A** | кристаллы |\n| **B** | монеты |\n\n**Answer:**' + (answer || '') + '\n';
const AQ_ATT = '<!-- archaeology: grep -rniE "назва|валю|игры" interviews/ GOAL.md MASTER_PLAN.md plans/ → 0 hits · read: none · prior: none -->\n\n';
const aqCheck = (body) => { writeFileSync(join(P, AQ_DOC), body); return runGen(P, [AQ_DOC, '--check']); };

r = aqCheck(aqHead('2026-09-18') + aqQ(''));
ok(r.code === 3 && /no archaeology line/.test(r.out) && /grep -rniE/.test(r.out) && /Q1/.test(r.out) && !/Page is up|CALL:|Shown recorded/.test(r.out),
   's22 E: живой вопрос с датой шапки от порога БЕЗ аттестации → --check код 3, отказ несёт Q1 и ГОТОВУЮ команду грепа; ни страницы, ни зова (AQ, #70)', 'exit ' + r.code + ': ' + r.out.slice(-400));
r = aqCheck(aqHead('2026-09-18') + aqQ(AQ_ATT));
ok(r.code === 0 && /(археология|archaeology): (аттестовано 1 из 1|1 of 1)/.test(r.out),
   's22 E: та же фикстура С аттестацией → код 0, и дверь печатает «археология: аттестовано 1 из 1»', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = aqCheck(aqHead('2026-09-18') + aqQ(AQ_ATT.replace('0 hits', '5 hits')));
ok(r.code === 3 && /5 hits and `prior: none`/.test(r.out),
   's22 E: аттестация с «→ 5 hits» и «prior: none» → код 3 (поиск нашёл, прошлый ответ не назван)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = aqCheck(aqHead('2026-09-18') + aqQ('', ' A) кристаллы'));
ok(r.code === 0, 's22 E: ОТВЕЧЕННЫЙ вопрос без аттестации → код 0 (владельцу больше ничего не должны)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = aqCheck(aqHead('2026-09-01') + aqQ(''));
ok(r.code === 0 && /(не судится|not judged)/.test(r.out) && /2026-09-01/.test(r.out),
   's22 E: дата шапки ДО порога → код 0, и дверь говорит вслух «не судится — дата шапки …» (история поля не краснеет)', 'exit ' + r.code + ': ' + r.out.slice(-300));
rmSync(join(P, AQ_DOC), { force: true });

// ================================================================ C: маршрут обновления (критерий 4)
console.log('\n=== s22 C: «старый релиз» без контура + свой tools/review.mjs → update → контур приехал, свой инструмент нетронут ===');
const FENCE = '`'.repeat(6);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const dropBlock = (text, p) => text.replace(new RegExp('^> \\*\\*FILE: `' + escRe(p) + '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n[\\s\\S]*?\\n' + FENCE + '\\n?', 'm'), '');
const bundle0 = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
let bundleOld = bundle0;
for (const f of CONTOUR_FILES) bundleOld = dropBlock(bundleOld, f);
ok(CONTOUR_FILES.every((f) => !bundleOld.includes('FILE: `' + f + '`')) && CONTOUR_FILES.every((f) => bundle0.includes('FILE: `' + f + '`')),
   's22 C: текущий бандл несёт четыре FILE-блока контура; «старый» бандл — ни одного (фикстура честная)');
const writeSource = (dir, bundleText, version) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'KAIF-CORE-BUNDLE.md'), bundleText);
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, 'KAIF-CORE.mjs'));
  const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
  man.version = version;
  man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(dir, 'KAIF-CORE-BUNDLE.md')));
  man.sha256['KAIF-CORE.mjs'] = sha256(readFileSync(join(dir, 'KAIF-CORE.mjs')));
  writeFileSync(join(dir, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
};
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
const OLD = join(ROOT, 'baseline-old'); writeSource(OLD, bundleOld, FROM);
const SRC99 = join(ROOT, 'src-9.9'); writeSource(SRC99, bundle0.replace(/"version": "[^"]+"/, '"version": "9.9"'), '9.9');
// Проект «на 2.5 со своим контуром»: установка из старого бандла + собственный tools/review.mjs.
const U = join(ROOT, 'upd'); seed(U, join(OLD, 'KAIF-CORE-BUNDLE.md'));
must(run, U, 'install --lang ru');
ok(CONTOUR_FILES.every((f) => !existsSync(join(U, f))), 's22 C: до обновления файлов контура нет (развёртывание старого релиза)');
mkdirSync(join(U, 'tools'), { recursive: true });
const OWN = '// the project\'s own contour, built by a neighbour — must stay byte-identical after update\nconsole.log("own review");\n';
writeFileSync(join(U, 'tools', 'review.mjs'), OWN);
r = run(U, `update --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0, 's22 C: update → 9.9 exit 0', r.out.slice(-400));
for (const f of CONTOUR_FILES) ok(existsSync(join(U, f)), 's22 C: обновление привезло ' + f);
ok(readFileSync(join(U, 'tools', 'review.mjs'), 'utf8') === OWN, 's22 C: собственный tools/review.mjs побайтно прежний — машинерия пишет только под .kaif/');
ok(CONTOUR_FILES.every((f) => sha256(readFileSync(join(U, f))) === sha256(readFileSync(join(P, f)))), 's22 C: файлы контура после update побайтно равны файлам свежей установки');
r = runGen(U, ['--selftest']);
ok(r.code === 0, 's22 C: --selftest зелёный на обновлённом развёртывании', r.out.slice(-300));
// Мета бандла: policy-change и notes 2.6 называют контур поставкой без «спросите владельца» (ключ '2.6' взводится бампом версии — RL).
const metaStart = bundle0.indexOf('\n{\n'), metaEnd = bundle0.indexOf('\n}\n', metaStart);
let meta = null;
try { meta = JSON.parse(bundle0.slice(metaStart + 1, metaEnd + 2)); } catch { /* судится ниже */ }
ok(meta !== null, 's22 C: мета-блок бандла читается как JSON');
const pol26 = meta && meta.policyChanges && meta.policyChanges['2.6'] ? meta.policyChanges['2.6'].join('\n') : '';
const tn26 = meta && meta.templateNotesByVersion && meta.templateNotesByVersion['2.6'] ? meta.templateNotesByVersion['2.6'].join('\n') : '';
ok(/\.kaif\/tools\/contour\//.test(pol26) && /INTERACTIVE_CONTOUR_SPEC\.md/.test(pol26), 's22 C: policy-change 2.6 называет генератор и контракт контура', pol26.slice(0, 300));
ok(!/ask the (project )?owner/i.test(pol26 + tn26) || /never ask/i.test(pol26 + tn26), 's22 C: записи 2.6 не велят «спросить владельца» о параметрах контура (#97)', (pol26 + tn26).slice(0, 300));
ok(/contour/i.test(tn26), 's22 C: template-notes 2.6 называют контур', tn26.slice(0, 200));
const task = existsSync(join(U, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(U, 'KAIF_UPDATE_TASK.md'), 'utf8') : '';
ok(/contour/i.test(task), 's22 C: задание обновления 2.5 → 9.9 называет контур (интервал policy-changes захватил 2.6)', task.slice(0, 300));

// ================================================================ D: эпик LP 2.7 (plans/111; тикет #66) — живая страница
// Тикет #66 (Unliminium; слово владельца проекта: «закрылся контур и я не дал на него ответы, а я ПИСАЛ В ЭТОТ МОМЕНТ»)
// и слово владельца истока Q2 интервью №032 («JS сам пишет файл на компьютер в папку проекта»). Три критерия 18–20
// plans/100: (18) живую страницу закрывает ТОЛЬКО `--close`, и он отказывает при свежем вводе или незаписанном черновике;
// (19) ответ переживает смерть сервера — профиль окна в папке проекта, «Записать» при мёртвом сервере кладёт ответ туда,
// агент забирает его безоконно на том же порту; (20) незнакомый флаг — отказ ДО страницы и зова (на 2.6 — страница и зов:
// красное доказательство швом KAIF_DIST). Всё — в тихом окружении; браузер здесь только HEADLESS, по абсолютному пути.
console.log('\n=== s22 D: LP — незнакомый флаг отказывает до страницы · --close читает замок · ответ переживает сервер ===');
const D = join(ROOT, 'lp'); seed(D);
must(run, D, 'install --lang ru');
mkdirSync(join(D, 'interviews', 'decisions'), { recursive: true });
// the owner's parameter `contour.closeQuietMs` — 4 s here so the suite can observe both refusals and a close within seconds
// (the default is 180 s); a page YOUNGER than the threshold or typed into within it is never closed without --force
{ const kj = join(D, '.kaif', 'kaif.json'); const m = JSON.parse(readFileSync(kj, 'utf8').replace(/^﻿/u, '')); m.contour = { ...(m.contour || {}), closeQuietMs: 4000 }; writeFileSync(kj, JSON.stringify(m, null, 2) + '\n'); }
const CLOSE_QUIET_MS = 4000;
const DOC = 'interviews/interview_066_probe.md';
writeFileSync(join(D, DOC), GOOD_052.replace('#052', '#066'));
const DLOCK = join(D, 'interviews', 'decisions', 'interview_066_probe.lock');
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
// (1) LP4 / критерий 20: незнакомый флаг — отказ кодом 1 ДО страницы, звука и зова (2.6 поднимала страницу и звала)
r = runGen(D, [DOC, '--wat']);
ok(r.code === 1 && /unknown flag: --wat/.test(r.out) && !/Page is up|CALL:|Shown recorded/.test(r.out),
   's22 D: незнакомый флаг → код 1 «unknown flag: --wat»; ни «Page is up», ни «CALL:» (LP4, критерий 20; на 2.6 — страница и зов)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = runGen(D, [DOC, '--close']);
ok(r.code === 0 && /no live page for/.test(r.out) && !/Page is up|CALL:/.test(r.out),
   's22 D: --close без замка → «no live page … nothing to close», код 0, страница не поднята', 'exit ' + r.code + ': ' + r.out.slice(-300));
// (2) LP2 / критерий 18: замок с ЖИВЫМ pid (дочерний процесс-держатель) и вводом 12 с назад → ОТКАЗ кодом 4; порт · pid · заголовок
// the holder is a tiny contour-LIKE server: `--close` never kills a pid from a file — it asks the page's own server to end
// (POST /close?t=<token from the lock>); a page that does not answer is NOT killed without --force (judge Н7)
const pHold = await freePort();
const holder = spawn(process.execPath, ['-e', "var h=require('http');h.createServer(function(q,r){if(q.method==='POST'&&q.url.indexOf('/close?t=tok')===0){r.end('{}');setTimeout(function(){process.exit(0)},50)}else{r.statusCode=404;r.end()}}).listen(" + pHold + ",'127.0.0.1')"], { stdio: 'ignore' });
let holderExit = null; holder.on('exit', (c, s) => { holderExit = c ?? s ?? 'gone'; });
await wait(600); // the holder's server is listening
const lockObj = (extra) => JSON.stringify({ pid: holder.pid, url: 'http://127.0.0.1:' + pHold + '/', startedAt: '2026-09-18T09:00:00+03:00',
  doc: DOC, title: 'Interview #066 — проба', closeToken: 'tok', ...extra }) + '\n';
// (2а) the DEFAULT threshold is 180 s — observed in a deployment with NO contour.closeQuietMs (section A's tree); a mutant
// "default = 0" was invisible while this suite set the parameter everywhere (judge Н15)
{ const PL = join(P, 'interviews', 'decisions', 'interview_052_probe.lock');
  writeFileSync(PL, JSON.stringify({ pid: holder.pid, url: 'http://127.0.0.1:' + pHold + '/', startedAt: new Date().toISOString(), doc: 'interviews/interview_052_probe.md', title: 'Interview #052 — проба', closeToken: 'tok' }) + '\n');
  r = runGen(P, ['interviews/interview_052_probe.md', '--close']);
  ok(r.code === 4 && /younger than the quiet threshold \(180 s\)/.test(r.out) && holderExit === null,
     's22 D: развёртывание БЕЗ параметра — порог по умолчанию 180 с («younger than the quiet threshold (180 s)»), процесс жив', 'exit ' + r.code + ': ' + r.out.slice(-300));
  rmSync(PL, { force: true }); }
writeFileSync(DLOCK, lockObj({ lastInputAt: Date.now() - 2000, draftFields: 1, saved: false }));
r = runGen(D, [DOC, '--close']);
ok(r.code === 4 && /last input [0-3] s ago — the owner is typing; not closed/.test(r.out) &&
   new RegExp('port ' + pHold + ' · pid ' + holder.pid + ' · title "Interview #066').test(r.out),
   's22 D: ввод 2 с назад (порог 4 с) → --close ОТКАЗ кодом 4 «the owner is typing; not closed»; порт · pid · заголовок напечатаны (LP2, критерий 18)', 'exit ' + r.code + ': ' + r.out.slice(-300));
ok(holderExit === null, 's22 D: процесс страницы ЖИВ после отказа (--close ничего не убил)');
// (2б) страница МОЛОЖЕ порога и без единого ввода → тоже отказ (живой прогон 09:10: закрыли через 3 с после первого нажатия)
writeFileSync(DLOCK, JSON.stringify({ pid: holder.pid, url: 'http://127.0.0.1:' + pHold + '/', startedAt: new Date().toISOString(), doc: DOC, title: 'Interview #066 — проба' }) + '\n');
r = runGen(D, [DOC, '--close']);
ok(r.code === 4 && /the page came up [0-3] s ago — younger than the quiet threshold/.test(r.out) && holderExit === null,
   's22 D: страница поднята 0–3 с назад, ввода ещё не было → отказ кодом 4 «younger than the quiet threshold» — владелец может читать', 'exit ' + r.code + ': ' + r.out.slice(-300));
// (3) ввод старше порога, но черновик не записан → отказ; --force без слова владельца → отказ кодом 1; записано → закрыто
writeFileSync(DLOCK, lockObj({ lastInputAt: Date.now() - 400000, draftFields: 2, saved: false }));
r = runGen(D, [DOC, '--close']);
ok(r.code === 4 && /draft of 2 field\(s\) not saved/.test(r.out) && holderExit === null,
   's22 D: ввод старше порога, черновик не записан → отказ кодом 4 «draft of 2 field(s) not saved», процесс жив', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = runGen(D, [DOC, '--close', '--force']);
ok(r.code === 1 && /refusing --force: it needs --owner-word/.test(r.out) && holderExit === null,
   's22 D: --force без --owner-word → отказ кодом 1 (слово соседа — не улика), процесс жив', 'exit ' + r.code + ': ' + r.out.slice(-300));
// (3а) a page that does NOT answer the close request is NOT killed: the lock names a LIVE pid (this suite's own) and a dead port
{ const pDead = await freePort();
  writeFileSync(DLOCK, JSON.stringify({ pid: process.pid, url: 'http://127.0.0.1:' + pDead + '/', startedAt: '2026-09-18T09:00:00+03:00', doc: DOC, title: 'Interview #066 — проба', closeToken: 'tok', lastInputAt: Date.now() - 400000, draftFields: 0, saved: true }) + '\n');
  r = runGen(D, [DOC, '--close']);
  ok(r.code === 4 && /was NOT killed: a pid from a file may belong to another process/.test(r.out),
     's22 D: страница по адресу замка не отвечает → --close НЕ убивает pid из файла (код 4; свод жив — он и был этим pid)', 'exit ' + r.code + ': ' + r.out.slice(-300)); }
writeFileSync(DLOCK, lockObj({ lastInputAt: Date.now() - 400000, draftFields: 0, saved: true }));
r = runGen(D, [DOC, '--close']);
await wait(800);
ok(r.code === 0 && /^closed interviews\/interview_066_probe\.md \(port /m.test(r.out) && /its own server ended it/.test(r.out) && holderExit === 0 && !existsSync(DLOCK),
   's22 D: ввод старше порога, ответ записан → «closed <док> … its own server ended it»: сервер завершился САМ (код 0 держателя), замок снят', 'exit ' + r.code + ' holder ' + holderExit + ': ' + r.out.slice(-300));
try { holder.kill(); } catch { /* already gone */ }
// (4) LP1: настоящий генератор — пульс несёт состояние ввода, замок его хранит, --close из ДРУГОГО процесса читает
const spawnGen = (cwd, args, extra = {}) => {
  const child = spawn(process.execPath, [join(cwd, '.kaif', 'tools', 'contour', 'review.mjs'), ...args],
    { cwd, env: quietEnv(extra), stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; let exitCode = null;
  child.on('exit', (c, s) => { exitCode = c ?? s ?? 'gone'; });
  const url = new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('no «Page is up» within the deadline: ' + out.slice(-300))), QUIET_TIMEOUT_MS);
    const on = (d) => { out += d; const m = /Page is up: (http:\/\/127\.0\.0\.1:\d+\/)/.exec(out); if (m) { clearTimeout(t); res(m[1]); } };
    child.stdout.on('data', on); child.stderr.on('data', on);
  });
  return { child, url, out: () => out, exit: () => exitCode };
};
const gen1 = spawnGen(D, [DOC, '--no-open', '--silent'], { KAIF_CONTOUR_SILENCE_MS: '20000' }); // 20 s of tolerated silence — the page has no pulse here
const url1 = await gen1.url;
await fetch(url1 + 'alive?i=1000&d=1&s=0');
await wait(300);
const lock1 = JSON.parse(readFileSync(DLOCK, 'utf8'));
ok(lock1.pid === gen1.child.pid && lock1.doc === DOC && typeof lock1.lastInputAt === 'number' && lock1.draftFields === 1 && lock1.saved === false && /Interview #066/.test(lock1.title),
   's22 D: пульс /alive?i=1000&d=1&s=0 → замок несёт pid · doc · title · lastInputAt · draftFields · saved (LP1)', JSON.stringify(lock1));
r = runGen(D, [DOC, '--close']);
ok(r.code === 4 && /the owner is typing; not closed/.test(r.out) && gen1.exit() === null,
   's22 D: настоящий генератор: --close из другого процесса читает замок и ОТКАЗЫВАЕТ при вводе 1 с назад', 'exit ' + r.code + ': ' + r.out.slice(-300));
await wait(CLOSE_QUIET_MS + 500); // the page grows older than the threshold
await fetch(url1 + 'alive?i=500000&d=0&s=1');
await wait(300);
r = runGen(D, [DOC, '--close']);
await wait(1500);
ok(r.code === 0 && /^closed interviews\/interview_066_probe\.md/m.test(r.out) && gen1.exit() === 2 && /closed by the checked command/.test(gen1.out()) && !existsSync(DLOCK),
   's22 D: пульс «ввода не было 500 с, записано» → --close закрывает: генератор завершился САМ кодом 2 («closed by the checked command»), замок снят', 'exit ' + r.code + ' gen ' + gen1.exit() + ': ' + r.out.slice(-300));
// (5) LP3 / критерий 19: ответ переживает смерть сервера — headless-страница на ПРОФИЛЕ ПРОЕКТА печатает ответ, сервер убит,
//     «Записать» → локальная запись; браузер убит; `--queue --list` забирает ответ безоконно на том же порту → decision.json
const exe = findBrowser();
if (!exe) {
  console.log('s22 D: SKIPPED — no Chromium at a known path on this machine: the headless recovery run (criterion 19) is NOT judged here — said out loud, not green');
} else {
  const prof = join(D, '.kaif', 'contour-window');
  const gen2 = spawnGen(D, [DOC, '--no-open', '--silent'], { KAIF_CONTOUR_SILENCE_MS: '20000' });
  const url2 = await gen2.url;
  const page = await headlessPage(url2, { profileDir: prof, extraArgs: ['--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun'] });
  const TEXT = 'Ответ владельца пережил сервер ' + Date.now(); // «Ответ владельца пережил сервер N» — кириллица кодами (EXP-0135)
  const typed = await page.evaluate("(function(){var t=document.getElementsByName('text:" + DOC + ":Q1')[0];t.value=" + JSON.stringify(TEXT) + ";t.dispatchEvent(new Event('input',{bubbles:true}));return t.value})()");
  ok(typed === TEXT, 's22 D: headless-страница на профиле проекта — текст введён в поле Q1 (событие input → черновик в localStorage)', String(typed).slice(0, 80));
  gen2.child.kill(); await wait(1000); // сервер мёртв — как в тикете #66
  ok(gen2.exit() !== null && existsSync(DLOCK), 's22 D: сервер убит, замок остался (stale — порт помнит origin)', 'gen ' + gen2.exit());
  const st = await page.evaluate("(function(){document.querySelector('#save').click();return new Promise(function(r){setTimeout(function(){r(document.querySelector('#status').textContent+'|'+(localStorage.getItem('owner-review:" + DOC + ":__submitted')?'submitted':'none'))},700)})})()");
  ok(/сохранён на этом компьютере/.test(st) && /\|submitted$/.test(st),
     's22 D: «Записать» при мёртвом сервере → «сохранён на этом компьютере», ответ лежит в localStorage профиля проекта (__submitted), без диалога (LP3, критерий 19)', st);
  // (5а) the browser STILL holds the profile (the owner's window is open): recovery is DEFERRED — a second Chromium on a held
  // profile would hand its page to the live window, i.e. onto the owner's screen (judge Н5)
  r = runGen(D, ['--queue', '--list']);
  ok(/recovery deferred: a browser still holds the project profile/.test(r.out) && !existsSync(join(D, 'interviews', 'decisions', 'interview_066_probe.decision.json')) && existsSync(DLOCK),
     's22 D: окно ещё держит профиль → забор ОТЛОЖЕН («recovery deferred»), записи нет, замок на месте', 'exit ' + r.code + ': ' + r.out.slice(-300));
  // (5б) a HARD kill ~2 s after Save — a browser crash, not a polite close: localStorage alone loses the write (flush ≈ 5 s,
  // measured in the recon and by this suite's first build), IndexedDB — the durable carrier — keeps it (judge Н4)
  page.close();
  await wait(2000);
  r = runGen(D, ['--queue', '--list']);
  const dec = join(D, 'interviews', 'decisions', 'interview_066_probe.decision.json');
  ok(/answer recovered from the owner's machine: interviews\/interview_066_probe\.md — 1 answer\(s\)/.test(r.out) && /from indexedDB/.test(r.out) && existsSync(dec),
     's22 D: после ЖЁСТКОГО убийства браузера --queue --list забрал ответ безоконно ИЗ IndexedDB: «answer recovered … from indexedDB», decision.json есть', 'exit ' + r.code + ': ' + r.out.slice(-400));
  const decJ = existsSync(dec) ? JSON.parse(readFileSync(dec, 'utf8')) : {};
  ok(decJ.recovered === true && decJ.answers && decJ.answers.Q1 && decJ.answers.Q1.text === TEXT,
     's22 D: запись несёт recovered: true, текст ответа ПОБАЙТНО равен введённому', JSON.stringify(decJ).slice(0, 300));
  const md2 = readFileSync(join(D, DOC), 'utf8');
  ok(md2.includes(TEXT) && /забран с компьютера владельца/.test(md2),
     's22 D: ответ вписан в документ; комментарий провенанса называет «забран с компьютера владельца»', md2.slice(-300));
  ok(!existsSync(DLOCK), 's22 D: замок снят после забора');
  r = runGen(D, ['--queue', '--list']);
  ok(r.code === 0 && !/recovered|recovery:/.test(r.out), 's22 D: повторный --queue --list — забирать нечего, ни строки о забое, браузер не поднимался', r.out.slice(-200));
}

// ================================================================ итог
if (failures) { console.error(`s22: ${failures} checks FAILED · корень ${ROOT}`); process.exit(1); }
console.log('s22 contour shipped: all checks green (fresh install · pre-flight #051 · three faces · shown fact · update route · LP: unknown flag · --close · answer survives the server)');
