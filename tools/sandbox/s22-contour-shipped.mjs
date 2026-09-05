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
// [TESTED: 2026-09-05 · зелёный стоя и в составе полигона — «sandbox suite: all 22 suites green» (npm run test:core,
//  сессия 56); красный до IC3 — проба-предшественник 3 ✓ / 1 ✗ «генератор отсутствует» (21:25 сессии 55); мутация
//  на копии HTML (радиокнопки вырезаны) роняет selfCheck отгружаемого модуля — ассерт «КРАСНАЯ на копии»]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../lib/temp-root.mjs';
import { must, coreRunner, failed } from '../lib/sandbox-run.mjs';

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
const runGen = (cwd, args) => {
  try { return { code: 0, out: execFileSync(process.execPath, [join(cwd, '.kaif', 'tools', 'contour', 'review.mjs'), ...args], { cwd, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString() }; }
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
ok(html.includes('<html lang="ru">') && html.includes('Записать решение') && html.includes('рекомендую'), 's22 B: страница на языке развёртывания (ru): lang, кнопка, чип рекомендации');
ok(html.includes(' · interview_052_probe.md') === false && html.includes('<span class="project">fresh</span>'), 's22 B: имя проекта в шапке выведено из имени каталога (kaif.json без projectName — #97, без вопроса)');
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

// ================================================================ итог
if (failures) { console.error(`s22: ${failures} checks FAILED · корень ${ROOT}`); process.exit(1); }
console.log('s22 contour shipped: all checks green (fresh install · pre-flight #051 · three faces · shown fact · update route)');
