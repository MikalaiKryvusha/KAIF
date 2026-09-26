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
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, cpSync } from 'node:fs';
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
// OW9 (2.8, тикет #104): скелет страницы объяснения картинкой приезжает установкой и не делает ни одного запроса с машины
const EXPL = join(P, '.kaif', '_explain-page-template.html');
const explT = existsSync(EXPL) ? readFileSync(EXPL, 'utf8') : '';
ok(explT.includes('<h3>Comparison</h3>') && explT.includes('<h3>Sequence in time</h3>') && explT.includes('<h3>Fork of outcomes</h3>') && explT.includes('dl class="scenario"')
   && !/(?:src|href)\s*=\s*["']?\s*(?:https?:)?\/\//i.test(explT) && !/url\(\s*["']?\s*(?:https?:)?\/\//i.test(explT) && !/@import|<link\b|<script\b/i.test(explT),
   's22 A: скелет страницы объяснения приехал (.kaif/_explain-page-template.html): сравнение · лента времени · дерево исходов · сценарий подписью; ни одного запроса наружу (OW9, #104)', explT ? explT.slice(0, 120) : 'нет файла');
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
// OW3 (2.8, #86 S1): долг агента — все вопросы отвечены, статус не закрыт, ответу 11 дней — назван ПЕРВЫМ поимённо, без отсечки по
// возрасту (поле: решение владельца пролежало 11 дней за счётчиком «исторический долг»); код очереди прежний — это долг агента, не ворота показа.
writeFileSync(join(P, 'interviews', 'interview_054_probe.md'), '# Interview #054 — отвечено, не внесено\n\n> Status: **🟡 awaiting**\n> Created: 2026-09-01\n\n### Q1. Берём?\n\n- **A)** да\n- **B)** нет\n\n**Answer:** A\n');
writeFileSync(join(P, 'interviews', 'decisions', 'interview_054_probe.decision.json'), JSON.stringify({ kind: 'interview', document: 'interviews/interview_054_probe.md', at: new Date(Date.now() - 11 * 86400000).toISOString(), answers: { Q1: { choice: 'A' } } }));
r = runGen(P, ['--queue', '--list']);
const firstLine = (r.out.split(/\r?\n/).find((l) => l.trim()) || '');
ok(r.code === 0 && /РЕШЕНИЯ ВЛАДЕЛЬЦА ЖДУТ ВНЕСЕНИЯ — 1/.test(firstLine) && /interviews\/interview_054_probe\.md — отвечено 11 дн\. назад/.test(r.out),
   's22 B: ответ 11-дневной давности, статус не закрыт — первой строкой «РЕШЕНИЯ ВЛАДЕЛЬЦА ЖДУТ ВНЕСЕНИЯ», документ назван с возрастом ответа (OW3, #86)', r.out.slice(0, 400));
rmSync(join(P, 'interviews', 'interview_054_probe.md'), { force: true });
rmSync(join(P, 'interviews', 'decisions', 'interview_054_probe.decision.json'), { force: true });
// OW7 (2.8, #100): файл очереди чужой формы (свой, более ранний контур проекта хранит `{ items: [...] }` под тем же именем) — одна строка
// «очередь у проекта своя», код не 1, без трассы ошибки; запись в него отказана, файл проекта байт в байт (близнец, найденный чтением кода).
const QF = join(P, 'interviews', 'decisions', 'queue.json');
const ourQ = existsSync(QF) ? readFileSync(QF) : null;
writeFileSync(QF, '{"items":[]}\n');
r = runGen(P, ['--queue', '--list']);
ok(r.code !== 1 && /очередь у проекта своя/.test(r.out) && !/TypeError|at pendingDocs/.test(r.out),
   's22 B: файл очереди чужой формы {"items":[]} → код не 1, строка «очередь у проекта своя», без трассы (OW7, #100)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = runGen(P, ['--enqueue', 'interviews/interview_052_probe.md']);
ok(r.code === 1 && /не записано/.test(r.out) && readFileSync(QF, 'utf8') === '{"items":[]}\n',
   's22 B: --enqueue в чужую очередь — отказ кодом 1, файл проекта байт в байт (OW7, близнец)', 'exit ' + r.code + ': ' + r.out.slice(-300));
if (ourQ) writeFileSync(QF, ourQ); else rmSync(QF, { force: true });
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
// находки ПРОЧИТАНЫ (с 2.8 OW5 «read: none» при находках отказывается первым) — случай стережёт своё правило, «prior» не назван
r = aqCheck(aqHead('2026-09-18') + aqQ(AQ_ATT.replace('0 hits', '5 hits').replace('read: none', 'read: plans/03_shop.md')));
ok(r.code === 3 && /5 hits and `prior: none`/.test(r.out),
   's22 E: аттестация с «→ 5 hits» и «prior: none» → код 3 (поиск нашёл, прошлый ответ не назван)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = aqCheck(aqHead('2026-09-18') + aqQ('', ' A) кристаллы'));
ok(r.code === 0, 's22 E: ОТВЕЧЕННЫЙ вопрос без аттестации → код 0 (владельцу больше ничего не должны)', 'exit ' + r.code + ': ' + r.out.slice(-300));
r = aqCheck(aqHead('2026-09-01') + aqQ(''));
ok(r.code === 0 && /(не судится|not judged)/.test(r.out) && /2026-09-01/.test(r.out),
   's22 E: дата шапки ДО порога → код 0, и дверь говорит вслух «не судится — дата шапки …» (история поля не краснеет)', 'exit ' + r.code + ': ' + r.out.slice(-300));
// OW5 (2.8, тикеты #74 · #82): поиск прошлого ответа — при ЛЮБОМ транспорте вопроса. Дверь ищет сама (Node, без шелла и локали):
// заглавная кириллица находится; аттестация «N hits · read: none» — поиск нашёл, ничего не прочитано — отказ кодом 3.
// «prior: unrelated» законен — отказать может ТОЛЬКО правило «ничего не прочитано» (на v2.7 та же фикстура — код 0)
r = aqCheck(aqHead('2026-09-18') + aqQ(AQ_ATT.replace('0 hits', '5 hits').replace('prior: none', 'prior: unrelated — находки про магазин')));
ok(r.code === 3 && /5 hits and `read: none`/.test(r.out),
   's22 E: аттестация «→ 5 hits · read: none · prior: unrelated» → код 3 — поиск нашёл, ничего не прочитано (OW5, #74)', 'exit ' + r.code + ': ' + r.out.slice(-300));
writeFileSync(join(P, 'interviews', 'interview_055_prior.md'), '# Interview #055\n\n> Status: answered\n\n### Q1. ВИТРИНА — какой первый экран?\n\n**Answer:** A\n');
r = runGen(P, ['--search', 'Витрина или репозиторий?']);
ok(r.code === 0 && /interview_055_prior\.md:5: .*ВИТРИНА/.test(r.out) && /→ [1-9]\d* hits/.test(r.out) && /attest: <!-- archaeology:/.test(r.out),
   's22 E: --search «Витрина или репозиторий?» → код 0, находка с ЗАГЛАВНОЙ кириллицей названа файлом и строкой, готова строка аттестации (OW5, #74)', 'exit ' + r.code + ': ' + r.out.slice(-400));
rmSync(join(P, 'interviews', 'interview_055_prior.md'), { force: true });
rmSync(join(P, AQ_DOC), { force: true });

// ================================================================ F: зов называет зовущую сессию (OW4, тикеты #95 · #98)
console.log('\n=== s22 F: два рабочих места одного проекта — зов из каждого называет своё, одно рабочее место — никого ===');
{
  const W1 = join(ROOT, 'callws'), W2 = join(ROOT, 'callws-team-dev2');
  for (const w of [W1, W2]) cpSync(join(P, '.kaif'), join(w, '.kaif'), { recursive: true });
  mkdirSync(join(W1, '.git', 'worktrees', 'callws-team-dev2'), { recursive: true }); // the main copy: .git is a directory listing the other workspace
  writeFileSync(join(W2, '.git'), 'gitdir: ../callws/.git/worktrees/callws-team-dev2\n');  // the linked workspace: .git is a file
  const r1 = runGen(W1, ['--call', 'нужен пароль от тестового телефона', '--dry-run']);
  ok(r1.code === 0 && /CALL · main \(dry run, no sound\): .+, это мейн\. Нужен пароль от тестового телефона/.test(r1.out),
     's22 F: --call --dry-run из основной копии (её .git/worktrees называет другое место) — «…, это мейн.», баннер «CALL · main» (OW4, #98)', 'exit ' + r1.code + ': ' + r1.out.slice(-200));
  const r2 = runGen(W2, ['--call', 'нужен пароль от тестового телефона', '--dry-run']);
  ok(r2.code === 0 && /CALL · dev2 \(dry run, no sound\): .+, это дев два\. Нужен пароль от тестового телефона/.test(r2.out),
     's22 F: --call --dry-run из рабочего места «callws-team-dev2» — «…, это дев два.», баннер «CALL · dev2» (OW4, #98)', 'exit ' + r2.code + ': ' + r2.out.slice(-200));
  const r0 = runGen(P, ['--call', 'нужен пароль от тестового телефона', '--dry-run']);
  ok(r0.code === 0 && /^CALL \(dry run, no sound\): .+, нужен пароль от тестового телефона/m.test(r0.out) && !/это (мейн|дев)/.test(r0.out),
     's22 F: развёртывание с одним рабочим местом — зов без имени сессии (называть некого), звука нет (OW4)', 'exit ' + r0.code + ': ' + r0.out.slice(-200));
}

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
{ const kj = join(D, '.kaif', 'kaif.json'); const m = JSON.parse(readFileSync(kj, 'utf8').replace(/^\uFEFF/u, '')); m.contour = { ...(m.contour || {}), closeQuietMs: 4000 }; writeFileSync(kj, JSON.stringify(m, null, 2) + '\n'); }
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
  // RL D-F2 (суд версии 2.7): окно владельца — ОКНО --app (display-mode: standalone), как его поднимает контур; только в нём
  // страница обещает забор. Прежде свод цеплял страницу ВКЛАДКОЙ — и тем самым стерёг обещание забора из вкладки, то есть дефект.
  const page = await headlessPage(url2, { profileDir: prof, app: true, extraArgs: ['--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun'] });
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
  // (6) RL D-F2 (суд версии 2.7, форма — проба судьи D): страница ВКЛАДКОЙ на ЧУЖОМ профиле (рабочий браузер владельца) при
  //     мёртвом сервере НЕ обещает «агент заберёт» — это хранилище агент не читает никогда; она показывает кольцо спасения с
  //     текстом ответа и оставляет кнопки живыми («Повторить запись» после перезапуска контура). До починки вкладка писала
  //     «сохранён на этом компьютере … агент его заберёт» и клала ответ туда, откуда забора нет.
  const DOC_TAB = 'interviews/interview_067_probe.md';
  writeFileSync(join(D, DOC_TAB), GOOD_052.replace('#052', '#067'));
  const foreign = join(ROOT, 'foreign-browser-profile');
  const gen3 = spawnGen(D, [DOC_TAB, '--no-open', '--silent'], { KAIF_CONTOUR_SILENCE_MS: '20000' });
  const url3 = await gen3.url;
  const tab = await headlessPage(url3, { profileDir: foreign, extraArgs: ['--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun'] });
  const TEXT3 = 'Ответ во вкладке ' + Date.now();
  await tab.evaluate("(function(){var t=document.getElementsByName('text:" + DOC_TAB + ":Q1')[0];t.value=" + JSON.stringify(TEXT3) + ";t.dispatchEvent(new Event('input',{bubbles:true}));return t.value})()");
  gen3.child.kill(); await wait(1000);
  const st3 = await tab.evaluate("(function(){document.querySelector('#save').click();return new Promise(function(res){var t0=Date.now();(function poll(){var ring=document.querySelector('#rescue');" +
    "if((ring.style.display==='block'&&document.querySelector('#rescuetext').value)||/сохранён/.test(document.querySelector('#status').textContent)||Date.now()-t0>7000){res(JSON.stringify({status:document.querySelector('#status').textContent,banner:document.querySelector('#banner').textContent," +
    "ring:ring.style.display,ringText:document.querySelector('#rescuetext').value,submitted:!!localStorage.getItem('owner-review:" + DOC_TAB + ":__submitted'),saveEnabled:!document.querySelector('#save').disabled," +
    "tabnote:document.querySelector('#tabnote').style.display}))}else setTimeout(poll,200)})()})})()");
  const s3 = JSON.parse(st3);
  ok(!/сохранён на этом компьютере|заберёт/.test(s3.status + s3.banner) && /НЕ уйдёт/.test(s3.status) && s3.ring === 'block' && s3.ringText.includes(TEXT3) && !s3.submitted && s3.saveEnabled && s3.tabnote === 'block',
     's22 D: ВКЛАДКА на чужом профиле, сервер убит, «Записать» → «ответ НЕ уйдёт», кольцо спасения с текстом ответа, кнопки живы, __submitted нет, жёлтая полоса вкладки — ни слова «сохранён на этом компьютере»/«заберёт» (RL D-F2)', st3.slice(0, 500));
  await tab.closeGracefully();
  rmSync(join(D, 'interviews', 'decisions', 'interview_067_probe.lock'), { force: true });

  { // (7) OW6 (2.8, слово владельца №126 — ответы записываются по одному во всех проектах; зазор редакции соседнего полевого проекта):
  //     настоящий генератор и страница окном --app на профиле проекта, три вопроса, сторож --wait рядом. Q1 → «Осталось вопросов: 2»,
  //     процесс жив, сторож 0; Q2 → decision.json сливает Q1 и Q2; агент переписал Q3, пока вкладка открыта → запись Q3 отказана (409),
  //     текст на странице, решение без Q3; «Открыть новую редакцию» → черновик переписанного Q3 — блоком «Черновик прошлой редакции»;
  //     ответ на Q3 в новой редакции — контур завершается кодом 0. На v2.7 первая же запись закрывает контур — раздел красный.
  const DOC_P = 'interviews/interview_068_partial.md';
  const qP = (k, text) => ['### Q' + k + '. ' + text, '', '- **A)** первый', '- **B)** второй', '', '**Answer:**', ''].join('\n');
  writeFileSync(join(D, DOC_P), ['# Interview #068 — частичная запись', '', '> Topic: проба', "> Status: **🟡 awaiting the owner's answers**", '',
    qP(1, 'Первый вопрос?'), qP(2, 'Второй вопрос?'), qP(3, 'Третий вопрос?')].join('\n'));
  const DEC_P = join(D, 'interviews', 'decisions', 'interview_068_partial.decision.json');
  const decP = () => (existsSync(DEC_P) ? JSON.parse(readFileSync(DEC_P, 'utf8')) : {});
  const spawnWait = () => {
    const c = spawn(process.execPath, [join(D, '.kaif', 'tools', 'contour', 'review.mjs'), '--wait', DOC_P], { cwd: D, env: quietEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let o = ''; c.stdout.on('data', (d) => { o += d; }); c.stderr.on('data', (d) => { o += d; });
    return new Promise((res) => { c.on('exit', (code) => res({ code, out: o })); setTimeout(() => { try { c.kill(); } catch { /* gone */ } res({ code: 'timeout', out: o }); }, 20000); });
  };
  const gen4 = spawnGen(D, [DOC_P, '--no-open', '--silent'], { KAIF_CONTOUR_SILENCE_MS: '120000' });
  const url4 = await gen4.url;
  // the owner's window size — the contour launches its --app window at 1100×900; the overlap of the banner's button with the floating
  // Save block was found by looking at a real frame and depends on the width
  const page4 = await headlessPage(url4, { profileDir: prof, app: true, extraArgs: ['--window-size=1100,900', '--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun'] });
  const ev = async (js) => { try { return await page4.evaluate(js); } catch { return null; } }; // the window may be gone (v2.7 closes it after the first save)
  const until = async (expr, ms = 12000) => { const t0 = Date.now(); for (;;) { try { const v = await ev(expr); if (v) return v; } catch { /* the page is navigating */ } if (Date.now() - t0 > ms) return null; await wait(200); } };
  const pick = (q, v) => ev("(function(){var r=document.getElementsByName('choice:" + DOC_P + ":" + q + "');for(var i=0;i<r.length;i++)if(r[i].value==='" + v + "'){r[i].checked=true;saveDraft(r[i]);return true}return false})()");
  const clickSave = () => ev("(function(){document.querySelector('#save').click();return true})()");
  const statusOf = (re) => until("(function(){var s=document.querySelector('#status');return s&&" + re + ".test(s.textContent)?s.textContent:''})()");
  // the owner's profile carries a draft of the OLD form (a key without the question's fingerprint — a page before 2.8): it is shown as a
  // draft of a previous revision with its text and never placed onto a question by number (on v2.7 it lands in Q2 — red)
  await ev("(function(){localStorage.setItem(CFG.draftKey+':text:" + DOC_P + ":Q2','старый черновик без отпечатка');location.reload();return true})()");
  const legacy = await until("(function(){var t=document.querySelector('section.qcard.danger textarea');return t?t.value:''})()", 8000);
  const q2text = await ev("(function(){var t=document.getElementsByName('text:" + DOC_P + ":Q2')[0];return t?t.value:null})()");
  ok(legacy && legacy.includes('старый черновик без отпечатка') && q2text === '',
     's22 D: черновик СТАРОГО образца (ключ без отпечатка вопроса, страница до 2.8) — блоком «Черновик прошлой редакции» с текстом, на Q2 по номеру НЕ сел (OW6, реальный мир: черновики в профиле владельца)',
     'legacy «' + String(legacy).slice(0, 80) + '» q2 «' + q2text + '»');
  // #106 (2.8): the page in the owner's window renders at 1.7x the browser base and the Save button at 1.5x — read from the REAL window
  // (computed style), not from the page source; on v2.7 the page has no zoom — red
  const zoomed = await ev("(function(){var h=parseFloat(getComputedStyle(document.documentElement).zoom),s=parseFloat(getComputedStyle(document.getElementById('save')).zoom);return JSON.stringify({h:h,s:s})})()");
  const zm = (() => { try { return JSON.parse(zoomed); } catch { return {}; } })();
  ok(Math.abs(zm.h - 1.7) < 0.01 && (Math.abs(zm.h * zm.s - 1.5) < 0.03 || Math.abs(zm.s - 1.5) < 0.03),
     's22 D: страница в окне владельца — масштаб 1,7 от базового размера браузера, кнопка «Записать» — 1,5 (#106)', 'zoom ' + zoomed);
  // Q1
  const w1 = spawnWait(); await wait(500);
  await pick('Q1', 'A'); await clickSave();
  const st1 = await statusOf('/Осталось вопросов: 2/');
  const r1 = await w1;
  const fold1 = await until("(function(){var d=document.querySelector('details.archive');return d&&!d.open&&/Q1/.test(d.textContent)?'folded':''})()", 5000);
  ok(st1 && gen4.exit() === null && r1.code === 0 && /Recorded: interviews\/interview_068_partial\.md — Q1 = A · questions left: 2/.test(r1.out) && decP().answers && decP().answers.Q1,
     's22 D: ответ на Q1 из трёх → страница перечитана и говорит «Осталось вопросов: 2», процесс ЖИВ, сторож --wait завершился кодом 0 с «Q1 = A · questions left: 2» (OW6, критерий 20)',
     'status «' + st1 + '» gen ' + gen4.exit() + ' wait ' + r1.code + ': ' + r1.out.slice(-200));
  ok(fold1 === 'folded', 's22 D: отвеченный Q1 свёрнут в «архив решённого», живые вопросы — первыми (OW6)', String(fold1));
  // Q2
  const w2 = spawnWait(); await wait(500);
  await pick('Q2', 'B'); await clickSave();
  const st2 = await statusOf('/Осталось вопросов: 1/');
  const r2 = await w2;
  const d2 = decP();
  ok(st2 && r2.code === 0 && d2.answers && d2.answers.Q1 && d2.answers.Q2 && d2.records === 2 && gen4.exit() === null,
     's22 D: ответ на Q2 → «Осталось вопросов: 1», decision.json СЛИВАЕТ Q1 и Q2 (records 2), сторож 0, процесс жив (OW6)', JSON.stringify(d2).slice(0, 300));
  // the stale tab: the agent rewrites Q3 while the page is open; the owner saves Q3 from the old revision
  await pick('Q3', 'A');
  writeFileSync(join(D, DOC_P), readFileSync(join(D, DOC_P), 'utf8').replace('Третий вопрос?', 'Третий вопрос, переписанный агентом?'));
  await clickSave();
  const st3j = await until("(function(){var b=document.querySelector('#banner');if(!b||b.style.display!=='block'||!/ИЗМЕНЁН/.test(b.textContent))return '';" +
    "var bt=b.querySelector('button'),rc=bt?bt.getBoundingClientRect():null;" +
    "return JSON.stringify({banner:b.textContent,ring:document.querySelector('#rescue').style.display,text:document.querySelector('#rescuetext').value,saveOff:document.querySelector('#save').disabled," +
    "btnFree:!!(bt&&(function(){var fb=document.querySelector('.fab').getBoundingClientRect();return rc.right<=fb.left||rc.left>=fb.right||rc.bottom<=fb.top||rc.top>=fb.bottom})())})})()");
  const s3 = st3j ? JSON.parse(st3j) : {};
  const md3 = readFileSync(join(D, DOC_P), 'utf8');
  ok(s3.ring === 'block' && /"Q3"/.test(s3.text || '') && s3.saveOff && s3.btnFree && !(decP().answers || {}).Q3 && /переписанный агентом\?\n\n- \*\*A\)\*\* первый\n- \*\*B\)\*\* второй\n\n\*\*Answer:\*\*\n/.test(md3.replace(/\r\n/g, '\n')),
     's22 D: СТАРАЯ вкладка — агент переписал Q3, владелец жмёт «Записать» → полоса «Документ ИЗМЕНЁН», кнопка «Открыть новую редакцию» не пересекается с плавающим блоком «Записать» (окно 1100×900 — размер окна владельца), текст ответа в кольце спасения, запись выключена; в решении и в документе Q3 НЕТ (OW6, зазор редакции)',
     String(st3j).slice(0, 300));
  // the new revision: the draft of the rewritten Q3 comes back as a draft of a previous revision, never onto the rewritten question
  await ev("(function(){document.querySelector('#banner button').click();return true})()");
  const orph = await until("(function(){var t=document.querySelector('section.qcard.danger textarea');return t?t.value:''})()");
  const q3checked = await ev("(function(){var r=document.getElementsByName('choice:" + DOC_P + ":Q3');for(var i=0;i<r.length;i++)if(r[i].checked)return true;return false})()");
  ok(orph && orph.includes('choice:' + DOC_P + ':Q3') && q3checked === false,
     's22 D: «Открыть новую редакцию» → черновик переписанного Q3 — блоком «Черновик прошлой редакции» с текстом, на новый Q3 он НЕ сел (OW6, отпечаток вопроса)', String(orph).slice(0, 200));
  // the last answer ends the contour
  await pick('Q3', 'B'); await clickSave();
  for (let i = 0; i < 60 && gen4.exit() === null; i++) await wait(200);
  const md4 = readFileSync(join(D, DOC_P), 'utf8');
  ok(gen4.exit() === 0 && (decP().answers || {}).Q3 && (md4.match(/owner-review: by/g) || []).length === 3,
     's22 D: ответ на Q3 в новой редакции — ПОСЛЕДНИЙ → контур завершился кодом 0; в документе три записанных ответа (OW6, I8)', 'gen ' + gen4.exit() + ' ' + JSON.stringify(decP()).slice(0, 200));
  try { await page4.closeGracefully(); } catch { /* the window is already gone */ }
  rmSync(join(D, 'interviews', 'decisions', 'interview_068_partial.lock'), { force: true });
  } // (7)

  { // (8) bugs/125 (2.8): the queue ENTRY page opened as a TAB (the owner's case, 2026-09-26 07:52) — a focused tab fires `focus` after each
  //     load; the page used to reload on EVERY focus and looped (90 loads in 3 s on the probe), and the contour ended as "page closed".
  //     Now focus asks the pulse and the page reloads only when the queue changed: no change → one load; one document answered in
  //     another window → exactly one more load, one card fewer; the contour lives. On the dist before the fix — red.
  const qd = (n) => ['# Interview #' + n + ' — очередь вкладкой', '', '> Topic: проба', "> Status: **🟡 awaiting the owner's answers**", '',
    '### Q1. Вопрос?', '', '- **A)** первый', '- **B)** второй', '', '**Answer:**', ''].join('\n');
  const DOC_Q1 = 'interviews/interview_069_queue_tab.md';
  writeFileSync(join(D, DOC_Q1), qd('069'));
  writeFileSync(join(D, 'interviews', 'interview_070_queue_tab.md'), qd('070'));
  const gen5 = spawnGen(D, ['--queue', '--no-open', '--silent'], { KAIF_CONTOUR_SILENCE_MS: '60000' });
  const url5 = await gen5.url;
  const tab5 = await headlessPage(url5, { profileDir: join(ROOT, 'queue-tab-profile'), extraArgs: ['--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun'] });
  const rd = async (js) => { for (let i = 0; i < 40; i++) { try { return await tab5.evaluate(js); } catch { await wait(75); } } return null; };
  await tab5.addInitScript("try{sessionStorage.setItem('loads',String((+sessionStorage.getItem('loads')||0)+1))}catch(e){}"
    + "window.addEventListener('load',function(){setTimeout(function(){window.dispatchEvent(new Event('focus'))},30)});");
  await rd("sessionStorage.setItem('loads','0');setTimeout(function(){location.reload()},10);1");
  await wait(3000);
  const loadsA = await rd("+sessionStorage.getItem('loads')");
  const cardsA = await rd("document.querySelectorAll('a.card').length");
  ok(loadsA === 1 && cardsA >= 2, 's22 D: список очереди ВКЛАДКОЙ, фокус после каждой загрузки, очередь не менялась → одна загрузка за 3 с, без петли (bugs/125)',
     'loads ' + loadsA + ', cards ' + cardsA);
  const core5 = await import(pathToFileURL(join(D, '.kaif', 'tools', 'contour', 'core.mjs')).href);
  const dec5 = await (await fetch(url5 + 'decide', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc: DOC_Q1, answers: { Q1: { choice: 'A' } }, comment: '', rev: core5.bodyHash(readFileSync(join(D, DOC_Q1), 'utf8')) }) })).json();
  await rd("window.dispatchEvent(new Event('focus'));1");
  await wait(3000);
  const loadsB = await rd("+sessionStorage.getItem('loads')");
  const cardsB = await rd("document.querySelectorAll('a.card').length");
  ok(dec5.ok === true && loadsB === 2 && cardsB === cardsA - 1 && gen5.exit() === null,
     's22 D: документ отвечен в другом окне, владелец вернулся на список → список обновился ОДИН раз, карточкой меньше, контур жив (bugs/125)',
     'decide ' + dec5.ok + ', loads ' + loadsB + ', cards ' + cardsA + ' → ' + cardsB + ', gen ' + gen5.exit());
  await tab5.closeGracefully();
  try { await fetch(url5 + 'closed', { method: 'POST', body: 'index:unsaved' }); } catch { /* already ended */ }
  for (let i = 0; i < 40 && gen5.exit() === null; i++) await wait(200);
  if (gen5.exit() === null) gen5.child.kill();
  rmSync(join(D, 'interviews', 'decisions', '_queue.lock'), { force: true });
  } // (8)
}

// (9) 2.8: the «shown» and «applied» badges print the LOCAL day of a stored UTC moment — the first ten characters of a UTC moment are
//     yesterday between midnight and the zone's offset (a night answer at 01:30 +03:00 read as the day before; on the dist before the fix
//     — red). Judged only east of UTC: elsewhere the shift cannot show, and that is said out loud, not green.
if (new Date().getTimezoneOffset() >= 0) {
  console.log('s22 (9): SKIPPED — this zone is at or west of UTC; the night-date shift cannot show here — said out loud, not green');
} else {
  const rv9 = await import(pathToFileURL(join(D, '.kaif', 'tools', 'contour', 'review.mjs')).href);
  const DOC9 = 'interviews/interview_071_badge_date.md';
  writeFileSync(join(D, DOC9), ['# Interview #071 — значки даты', '', '> Topic: проба', "> Status: **🟡 awaiting the owner's answers**", '',
    '### Q1. Вопрос?', '', '- **A)** первый', '- **B)** второй', '', '**Answer:**', '', '### Q2. Второй?', '', '- **A)** да', '- **B)** нет', '', '**Answer:**', ''].join('\n'));
  const night9 = new Date(2026, 8, 26, 1, 30).toISOString();   // 01:30 LOCAL on 2026-09-26
  const decDir9 = join(D, 'interviews', 'decisions');
  const readJ = (f) => (existsSync(join(decDir9, f)) ? JSON.parse(readFileSync(join(decDir9, f), 'utf8')) : {});
  const shown9 = readJ('shown.json'), impl9 = readJ('implemented.json');
  writeFileSync(join(decDir9, 'shown.json'), JSON.stringify({ ...shown9, [DOC9]: { at: night9, transport: 'page' } }, null, 2));
  writeFileSync(join(decDir9, 'implemented.json'), JSON.stringify({ ...impl9, [DOC9]: { Q1: { at: night9, where: 'badge-where-071' } } }, null, 2));
  const listed9 = rv9.listQueue(D, { now: new Date(2026, 8, 26, 9, 0) });
  const line9 = (Array.isArray(listed9) ? listed9 : [].concat(listed9.lines || [])).join('\n').split('\n').filter((l) => l.includes(DOC9)).join('\n');
  const badge9 = (rv9.buildPage(D, DOC9).html.match(/badge-where-071[^<]{0,120}/) || [''])[0];
  ok(line9.includes('2026-09-26') && !line9.includes('2026-09-25') && badge9.includes('2026-09-26') && !badge9.includes('2026-09-25'),
     's22 (9): отметки «показан» и «внесено» в 01:30 по местному → в очереди и на странице дата 2026-09-26, не вчерашняя 2026-09-25 (2.8)',
     'queue «' + line9.slice(0, 160) + '» badge «' + badge9.slice(0, 120) + '»');
  writeFileSync(join(decDir9, 'shown.json'), JSON.stringify(shown9, null, 2));
  writeFileSync(join(decDir9, 'implemented.json'), JSON.stringify(impl9, null, 2));
}

// ================================================================ итог
if (failures) { console.error(`s22: ${failures} checks FAILED · корень ${ROOT}`); process.exit(1); }
console.log('s22 contour shipped: all checks green (fresh install · pre-flight #051 · three faces · shown fact · update route · LP: unknown flag · --close · answer survives the server)');
