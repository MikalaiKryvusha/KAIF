// s21-update-route.mjs — свод эпика UR 2.6 «Обновление на реальном маршруте» (plans/91; origin issues
// #42 ×3 · #48 R2/R3 · #44 · #41 wish 3 · каверза E-H3 суда RL 2.5). Поле платило на КАЖДОМ интервале:
// репетиция недостижима на bootstrap-маршруте (флаг знал только `update`, загрузчик писал ядро ДО
// отказа, авто-запись не потреблялась, наборы кандидатов превью и обновления расходились) · файлы
// «шаблон + заполнения плейсхолдеров» шли в ручной мердж и ручную депрекацию, а `update-verify` звал
// вернуть литерал слота · окно `stale-claims` шириной в одну версию · дифф отсутствующего модуля на
// bootstrap из одних `+`. Красный доказывается ШВАМИ KAIF_DIST / KAIF_LOADER: тот же свод против
// HEAD-сборки до UR (прецедент s20) — без правки кода свода.
// [TESTED: 2026-09-05 · 41 проверки ✅ в составе полигона — «sandbox suite: all 21 suites green»
//  (npm run test:core, сессия 55); КРАСНЫЙ доказан швами против HEAD-сборки cb42039 (2.5, build 467;
//  `git show cb42039:dist/*` + старый загрузчик): 20 из 41 красные — A1 ×3 · A2 · A3 ×3 · B1 · B2 ×3 ·
//  B3 · B4 · B5 · B6 · C1 ×2 · C2 · D1, ровно по предсказаниям ниже; зелёные на HEAD — фикстуры,
//  exit-коды и D2 (покрытие). КАВЕРЗА: половина A4 «документ владельца — не кандидат превью» на HEAD
//  зелёная — старое ядро в этой фикстуре не доходит до вердикта по MASTER_PLAN.md (три диагностических
//  прогона не объяснили почему: печать ДО первого `continue` есть, после — нет при истинных условиях);
//  полевое 16 vs 15 (#42) не воспроизведено, предикат остаётся DRY-правкой с зелёным
//  ассертом-регрессией «наборы равны» на обеих сборках. Первая редакция matchFills выучила мусор
//  из литеральных слотов и сопоставляла только с новым шаблоном — поймано этим сводом и соседями
//  (s03 S10c, s11 U1) на первом прогоне, EXP-0112]
//
// [TESTED: 2026-09-26 02:22:17 +03:00 · 2.8 (эпик UP и починки суда UP6): 61 проверка зелёная; на v2.7 — 12 красных поимённо (B7 ·
//  N1 ×2 · N2 · E-фикстура · E · E2 · N3 · N4 ×2 · A2b · A5); B8 и B6b на 2.7 зелёные по построению — их красный — мутанты M11 и M12
//  пробы up-mutants; случаи #92 названы N1/N2 (D1/D2 — случаи bootstrap 2.6 ниже); отчёты testcases/reports/2026-09-26_up-update-loses-nothing.md ·
//  testcases/reports/2026-09-26_up6-judge-fixes.md]
//
// Предсказания до первого прогона (2026-09-05, сессия 55) — красные на ядре cb42039 (2.5, build 467):
//   A1 загрузчик с `--rehearsal <receipt>` на bootstrap → exit 0, «rehearsal verdicts loaded from <receipt>
//      (1 file(s))», маркер 9.9 (HEAD: `unknown flag for install: --rehearsal`, exit 1, маркер прежний)
//   A2 авто-запись .kaif/update-rehearsal.json ПОТРЕБЛЕНА bootstrap-ом (HEAD: файл переживает обновление)
//   A3 неизвестный флаг отвергнут ЗАГРУЗЧИКОМ до скачивания: ядро на диске побайтно прежнее, строки
//      «machinery … verified» нет (HEAD: ядро источника записано, отказ приходит от ядра)
//   A4 `diff --source` и `update` считают ОДИН набор кандидатов (HEAD: превью считает MASTER_PLAN.md —
//      документ владельца, — квитанция нет: 16 vs 15 из #42)
//   B1 заполнения выведены с диска: лог «hand-filled slots recognized (2): <BUILD_COMMAND>, <TEST_HARNESS>»
//   B2 /autoloop «шаблон + заполнения» заменён механически С заполнениями: нет в задании, апстримная
//      правка приехала, `npm run build` ровно один раз, литерала слота нет (HEAD: merge-modules с диффом)
//   B3 упразднённый /dayloop «шаблон + заполнения» убран машинерией (HEAD: kept «carries local edits»)
//   B4 update-verify не печатает «promised upstream line … <BUILD_COMMAND>» (HEAD: печатает)
//   B5 манифест несёт `fills` (HEAD: ключа нет)
//   B6 (#48 R3) модуль идентичности, уже равный новому ЗАПОЛНЕННОМУ шаблону, не назван «upstream changed it»
//   C1 (#44) бейдж README:22 на версии двумя интервалами старше назван в stale-claims с версией
//      (HEAD: фильтр требует fromVersion в строке — молчит)
//   C2 `const gt = ` — одно объявление модульной области в ядре (HEAD: два локальных замыкания)
//   D1 (#41 wish 3) bootstrap с `--baseline`: дифф отсутствующего на диске модуля несёт строки `- `
//      старого шаблона (HEAD: одни `+`)
//   D2 (E-H3) bootstrap `--lang ru` с новым английским навыком → пункт language-arrivals в задании
//      (зелёный и на HEAD — это ПОКРЫТИЕ каверзы суда, не фикс)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../lib/temp-root.mjs';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must, coreRunner, failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// KAIF_DIST / KAIF_LOADER — швы для доказательства красного: свод против ЧУЖОЙ сборки (HEAD до фикса).
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const LOADER = process.env.KAIF_LOADER ? resolve(process.env.KAIF_LOADER) : join(REPO, 'framework', 'installer', 'KAIF-LOADER.mjs');
// Корень прогона УНИКАЛЕН по построению (bugs/59): mkdtemp через tempRoot, явный путь — аргументом.
const ROOT = tempRoot('update-route', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-400)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = coreRunner(ROOT);
// Загрузчик запускается из cwd развёртывания — ровно так его запускает агент по тонкому KAIF.md.
const runLoader = (cwd, flags) => {
  try { return { code: 0, out: execSync(`node ${LOADER} ${flags} 2>&1`, { cwd, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args: `KAIF-LOADER ${flags}` }); }
};
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const FENCE = '`'.repeat(6);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const blockRe = (p) => new RegExp('(^> \\*\\*FILE: `' + esc(p) + '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
// Правка ОДНОГО модуля внутри блока бандла — тот же приём, что в s02/s07/s18.
function editBundleModule(text, p, pick, mutate) {
  const m = text.match(blockRe(p));
  if (!m) throw new Error('block not found: ' + p);
  const mods = splitModules(m[2] + '\n');
  const idx = typeof pick === 'number' ? pick : mods.findIndex((x) => pick.test(x.signature));
  if (idx < 0) throw new Error('module not found in ' + p);
  mutate(mods[idx]);
  return text.replace(blockRe(p), m[1] + joinModules(mods).replace(/\n$/, '') + m[3]);
}
const dropBlock = (text, p) => text.replace(new RegExp('^> \\*\\*FILE: `' + esc(p) + '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n[\\s\\S]*?\\n' + FENCE + '\\n?', 'm'), '');
// Замена ВСЕГО текста блока бандла (как в s18): для документа владельца, чей входящий шаблон не несёт письменности владельца.
function replaceBundleBlock(text, p, transform) {
  const m = text.match(blockRe(p));
  if (!m) throw new Error('block not found: ' + p);
  return text.replace(blockRe(p), m[1] + transform(m[2]) + m[3]);
}
// Источник «релиза» для --source / --baseline: бандл + ядро + манифест с пересчитанными sha; ядро
// можно ПОМЕТИТЬ хвостом (A3: подмена ядра на диске видна по sha только если ядро источника иное).
const writeSource = (dir, bundleText, version, coreSuffix = '') => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'KAIF-CORE-BUNDLE.md'), bundleText);
  writeFileSync(join(dir, 'KAIF-CORE.mjs'), readFileSync(join(DIST, 'KAIF-CORE.mjs'), 'utf8') + coreSuffix);
  const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
  man.version = version;
  man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(dir, 'KAIF-CORE-BUNDLE.md')));
  man.sha256['KAIF-CORE.mjs'] = sha256(readFileSync(join(dir, 'KAIF-CORE.mjs')));
  writeFileSync(join(dir, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
};
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;   // «старая» версия = текущая сборка
const CB = '.claude/skills/check-backlog/SKILL.md';
// Кандидат wholesale: тело И заголовки check-backlog переведены → вердикт frozen (фикстура s18 U2).
const translateCB = (dir) => {
  const p = join(dir, CB); const t = readFileSync(p, 'utf8'); const pre = t.slice(0, t.search(/^# /m));
  writeFileSync(p, pre + '# /check-backlog — ревизия беклога\n\nПройтись по bugs/ и plans/, найти всё открытое.\n\n## Что делать\n\nШаги ревизии по-русски.\n\n## Заметки\n\nЗаметки по-русски.\n');
};
const readTask = (dir) => (existsSync(join(dir, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(dir, 'KAIF_UPDATE_TASK.md'), 'utf8') : '');
const marker = (dir) => JSON.parse(readFileSync(join(dir, '.kaif', 'kaif.json'), 'utf8'));

// ---------------------------------------------------------------- апстрим v9.9
const bundle0 = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
let bundle99 = bundle0.replace(/"version": "[^"]+"/, '"version": "9.9"');   // мета-блок: версию install читает отсюда (s18 U13)
bundle99 = editBundleModule(bundle99, CB, 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (check-backlog)'));
bundle99 = editBundleModule(bundle99, '.claude/skills/autoloop/SKILL.md', /^## The cycle/, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (autoloop)'));
bundle99 = editBundleModule(bundle99, '.claude/skills/nightloop/SKILL.md', /^## 🔁 The cycle/, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (nightloop)'));
bundle99 = editBundleModule(bundle99, 'TESTING_FRAMEWORK.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (testing)'));
bundle99 += '\n> **FILE: `.claude/skills/new-skill/SKILL.md`** — a NEW skill of 9.9 (English by construction)\n\n' +
  FENCE + 'md\n---\nname: new-skill\ndescription: A NEW skill arriving in 9.9 — English by construction.\n---\n\n' +
  '# /new-skill — a new skill\n\n## What it does\n\nEnglish body of the new skill.\n' + FENCE + '\n';
// /dayloop упразднён в 9.9 с преемником (по образцу s04 S14d / s18 U10: ЗАМЕНА ключа deprecations в мете)
const depKeyRe = /"deprecations": \[[\s\S]*?\],/;
if (!depKeyRe.test(bundle99)) throw new Error('s21 fixture: ключ deprecations не найден в мете бандла');
bundle99 = bundle99.replace(depKeyRe, '"deprecations": [{"path": ".claude/skills/dayloop/SKILL.md", "reason": "retired in test", "successor": "/guarded-loop (.claude/skills/guarded-loop/SKILL.md)"}],');
bundle99 = dropBlock(bundle99, '.claude/skills/dayloop/SKILL.md');
const SRC99 = join(ROOT, 'src-9.9'); writeSource(SRC99, bundle99, '9.9');
const SRC99M = join(ROOT, 'src-9.9-marked'); writeSource(SRC99M, bundle99, '9.9', '\n// s21: marked core of 9.9\n');
// A4: входящий шаблон MASTER_PLAN.md БЕЗ кириллицы — только так документ владельца, переведённый целиком, читается
// «локализованным» против шаблона (все восемь английских шаблонов owner-документов несут строки-подсказки
// кириллицей, и на ru-развёртывании вердикт по ним недостижим; полевое 16 vs 15 родилось на шаблонах старой эры)
const SRC99A = join(ROOT, 'src-9.9-owner-doc-latin');
writeSource(SRC99A, replaceBundleBlock(bundle99, 'MASTER_PLAN.md', (t) => t.split('\n').filter((l) => !/[А-Яа-яЁё]/.test(l)).join('\n')), '9.9');
// Артефакт «старого релиза» для --baseline (тексты старого шаблона; мета несёт FROM — так проверяет buildSyntheticBaseline)
const OLD = join(ROOT, 'baseline-old'); writeSource(OLD, bundle0, FROM);

// ================================================================ A (#42 ×3): репетиция на bootstrap-маршруте
console.log('\n=== A (#42 ×3): репетиция на bootstrap-маршруте — флаг · потребление · отказ ДО скачивания · один набор кандидатов ===');
const TA = join(ROOT, 'a1'); mkdirSync(TA); seed(TA);
must(run, TA, 'install --lang ru');
translateCB(TA);
const REC = join(ROOT, 'copy-receipt.json');   // расписка «песочной копии» — форма last-update.json: from · to · verdicts
writeFileSync(REC, JSON.stringify({ from: FROM, to: '9.9', route: 'bootstrap', verdicts: { [CB]: { baseFound: 0, baseN: 3, ceiling: 0, outcome: 'frozen' } } }, null, 2) + '\n');
let r = runLoader(TA, `--lang ru --source ${SRC99} --baseline ${OLD} --rehearsal ${REC}`);
ok(r.code === 0, 'A1 (критерий 1): загрузчик с --rehearsal <receipt> на bootstrap — exit 0 (флаг известен и загрузчику, и install)', r.out.slice(-500));
ok(/rehearsal verdicts loaded from \S*copy-receipt\.json \(1 file\(s\)\)/.test(r.out), 'A1: лог называет расписку копии и число вердиктов', r.out.split('\n').filter((l) => /rehearsal/.test(l)).join(' | ').slice(0, 400));
ok(existsSync(REC), 'A1: явная расписка — владельца, не тронута');
ok(!existsSync(join(TA, '.kaif', 'update-rehearsal.json')), 'A1: авто-записи на диске нет');
ok(marker(TA).version === '9.9', 'A1: маркер — 9.9 (bootstrap прошёл как обновление)', marker(TA).version);
ok(!/verdict-mismatch/.test(readTask(TA)), 'A1: вердикт копии (frozen) совпал с боевым — пункта verdict-mismatch нет');

const TA2 = join(ROOT, 'a2'); mkdirSync(TA2); seed(TA2);
must(run, TA2, 'install --lang ru');
const REH2 = join(TA2, '.kaif', 'update-rehearsal.json');
// 2.8 (эпик UP, N17): запись подписана отпечатком ядра, которое проведёт bootstrap (ядро источника, строки LF) — неподписанную новое
// ядро называет и игнорирует; фикстура изображает запись ТОГО ЖЕ ядра, как её пишет `diff --source`
const CORE_SIG = createHash('sha256').update(readFileSync(join(SRC99, 'KAIF-CORE.mjs'), 'utf8').replace(/\r\n/g, '\n'), 'utf8').digest('hex');
writeFileSync(REH2, JSON.stringify({ from: FROM, to: '9.9', source: 'sandbox', core: CORE_SIG, verdicts: {} }, null, 2) + '\n');
r = runLoader(TA2, `--lang ru --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0 && /rehearsal verdicts loaded from \.kaif\/update-rehearsal\.json \(0 file\(s\)\)/.test(r.out), 'A2 фикстура: авто-запись по дефолтному пути подхвачена bootstrap-ом', r.out.split('\n').filter((l) => /rehearsal/.test(l)).join(' | ').slice(0, 300));
ok(!existsSync(REH2), 'A2 (критерий 1): авто-запись ПОТРЕБЛЕНА обновлением, которое репетировала — одноразовая и на этом маршруте');

const TA3 = join(ROOT, 'a3'); mkdirSync(TA3); seed(TA3);
must(run, TA3, 'install');
const coreBefore = sha256(readFileSync(join(TA3, '.kaif', 'kaif-core.mjs')));
r = runLoader(TA3, `--lang ru --source ${SRC99M} --rehearsa ${REC}`);
ok(r.code !== 0 && /unknown flag: --rehearsa/.test(r.out), 'A3 (критерий 1): неизвестный флаг — ЗАГРУЗЧИК отказывает и называет флаг', r.out.slice(-400));
ok(sha256(readFileSync(join(TA3, '.kaif', 'kaif-core.mjs'))) === coreBefore, 'A3: ядро на диске побайтно прежнее — отказ ДО скачивания и записи (дерево не version-skewed)');
ok(!/machinery \S+ verified/.test(r.out) && !/handing over/.test(r.out), 'A3: ни скачивания, ни передачи руля ядру');
ok(marker(TA3).version === FROM, 'A3: маркер не тронут', marker(TA3).version);

const TA4 = join(ROOT, 'a4'); mkdirSync(TA4); seed(TA4);
must(run, TA4, 'install --lang ru');   // вердикт wholesale существует только у развёртывания с письменностью владельца
translateCB(TA4);
// MASTER_PLAN.md — документ ВЛАДЕЛЬЦА (OWNER_SEEDED), переведённый целиком (как в поле: NDim, 16 vs 15):
// превью 2.5 считало его кандидатом wholesale, обновление — никогда
const MP = join(TA4, 'MASTER_PLAN.md');
{ const mods = splitModules(readFileSync(MP, 'utf8').replace(/\r\n/g, '\n'));
  const h1 = mods.find((m) => /^# /.test(m.signature));
  writeFileSync(MP, (h1 ? h1.signature : '# План') + '\n\n## Видение\n\nВладелец ведёт план по-русски: цель, этапы, решения.\n\n' +
    '## Этапы\n\n1. Первый этап — основа.\n2. Второй этап — рост.\n\n## Журнал решений\n\n| № | Вопрос | Решение |\n|---|---|---|\n| 1 | Язык | Русский |\n'); }
must(run, TA4, `diff --source ${SRC99A} --baseline ${OLD}`);
const reh4 = JSON.parse(readFileSync(join(TA4, '.kaif', 'update-rehearsal.json'), 'utf8'));
r = run(TA4, `update --source ${SRC99A} --baseline ${OLD}`);
ok(r.code === 0, 'A4 update →9.9 exit 0', r.out.slice(-400));
const rec4 = JSON.parse(readFileSync(join(TA4, '.kaif', 'last-update.json'), 'utf8'));
const k1 = Object.keys(reh4.verdicts || {}).sort(), k2 = Object.keys(rec4.verdicts || {}).sort();
ok(k1.includes(CB), 'A4 фикстура: превью записало вердикт по переведённому check-backlog', k1.join(','));
ok(JSON.stringify(k1) === JSON.stringify(k2), 'A4 (критерий 1): наборы кандидатов превью и обновления РАВНЫ — один предикат', `diff: [${k1}]  update: [${k2}]`);
ok(!k1.includes('MASTER_PLAN.md'), 'A4: документ владельца — не кандидат превью (как и обновления)');

// ================================================================ B (#48 R2/R3): заполнения плейсхолдеров
console.log('\n=== B (#48 R2/R3): «шаблон + заполнения» = нетронут — механическая замена, депрекация, update-verify, fills в манифесте ===');
const TB = join(ROOT, 'b1'); mkdirSync(TB); seed(TB);
must(run, TB, 'install');   // без package.json: <BUILD_COMMAND>/<TEST_HARNESS> остаются литералами — их заполняет рука в задании адаптации
const AL = join(TB, '.claude/skills/autoloop/SKILL.md'), DL = join(TB, '.claude/skills/dayloop/SKILL.md'), NL = join(TB, '.claude/skills/nightloop/SKILL.md');
ok(readFileSync(AL, 'utf8').includes('<BUILD_COMMAND>'), 'B фикстура: слот <BUILD_COMMAND> литералом в /autoloop после установки без scripts');
const fillByHand = (p) => writeFileSync(p, readFileSync(p, 'utf8').split('<BUILD_COMMAND>').join('npm run build').split('<TEST_HARNESS>').join('npm test'));
fillByHand(AL); fillByHand(DL); fillByHand(NL);
// заполнения + правка владельца ВНУТРИ модуля, который апстрим 9.9 меняет → реальный конфликт (правка в
// модуле, который апстрим не трогал, пункта не рождает по построению — bugs/32 «ноль дельты = ноль пунктов»)
{ const mods = splitModules(readFileSync(NL, 'utf8').replace(/\r\n/g, '\n'));
  const i = mods.findIndex((m) => /^## 🔁 The cycle/.test(m.signature));
  mods[i].lines.splice(1, 0, '', 'Local owner line inside the cycle module.');
  writeFileSync(NL, joinModules(mods)); }
r = run(TB, `update --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0, 'B update →9.9 exit 0', r.out.slice(-400));
ok(/hand-filled slots recognized \(2\): <BUILD_COMMAND>, <TEST_HARNESS>/.test(r.out), 'B1: лог называет заполнения, ВЫВЕДЕННЫЕ с диска (2: <BUILD_COMMAND>, <TEST_HARNESS>)', r.out.split('\n').filter((l) => /hand-filled/.test(l)).join(' | ').slice(0, 300));
const taskB = readTask(TB);
ok(!/autoloop\/SKILL\.md/.test(taskB), 'B2 (критерий 2 — `fills: /autoloop kept out of merge-modules`): /autoloop «шаблон + заполнения» НЕ в задании', taskB.split('\n').filter((l) => /autoloop/.test(l)).join(' | ').slice(0, 300));
const alAfter = readFileSync(AL, 'utf8');
ok(alAfter.includes('UPSTREAM ADDITION 9.9 (autoloop)'), 'B2: апстримная правка /autoloop приехала механически');
ok((alAfter.match(/npm run build/g) || []).length === 1 && !alAfter.includes('<BUILD_COMMAND>'), 'B2: заполнение сохранено ровно один раз, литерала слота нет', `npm run build ×${(alAfter.match(/npm run build/g) || []).length}`);
ok(/replaced \.claude\/skills\/autoloop\/SKILL\.md \(fills kept\)/.test(r.out), 'B2: лог — «replaced … (fills kept)»', r.out.split('\n').filter((l) => /autoloop/.test(l)).join(' | ').slice(0, 300));
ok(!existsSync(DL) && /retired \.claude\/skills\/dayloop\/SKILL\.md/.test(r.out), 'B3: упразднённый /dayloop «шаблон + заполнения» убран МАШИНЕРИЕЙ, не «carries local edits»', r.out.split('\n').filter((l) => /dayloop|deprecated/.test(l)).join(' | ').slice(0, 300));
ok(/nightloop\/SKILL\.md/.test(taskB), 'B фикстура: /nightloop с правкой владельца — в задании (реально диверджен, дифф на руку)');
const manB = JSON.parse(readFileSync(join(TB, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(manB.fills && manB.fills['<BUILD_COMMAND>'] === 'npm run build' && manB.fills['<TEST_HARNESS>'] === 'npm test', 'B5: манифест несёт `fills` (кэш выведенного; отсутствие = вывести заново)', JSON.stringify(manB.fills));
r = run(TB, 'update-verify');
ok(!/promised upstream line not found[^\n]*(<BUILD_COMMAND>|<TEST_HARNESS>)/.test(r.out), 'B4: update-verify не зовёт вернуть литерал слота — нет «promised upstream line … <BUILD_COMMAND>»', r.out.split('\n').filter((l) => /promised/.test(l)).join(' | ').slice(0, 400));

// B7 (2.8, эпик UP, тикет origin #73): заполнение со СКОБКАМИ — команда с собственным плейсхолдером аргумента («-PackDir <pack>»).
// До 2.8 захват исключал `<` и `>`: заполнение не выводилось, навык шёл ручным слиянием каждый интервал.
const TB7 = join(ROOT, 'b7'); mkdirSync(TB7); seed(TB7);
must(run, TB7, 'install');
const AL7 = join(TB7, '.claude/skills/autoloop/SKILL.md');
const PACK_FILL = 'pwsh tools/build.ps1 -PackDir <pack>';
writeFileSync(AL7, readFileSync(AL7, 'utf8').split('<BUILD_COMMAND>').join(PACK_FILL).split('<TEST_HARNESS>').join('npm test'));
const packBefore = (readFileSync(AL7, 'utf8').match(/-PackDir <pack>/g) || []).length;
r = run(TB7, `update --source ${SRC99} --baseline ${OLD}`);
const al7 = readFileSync(AL7, 'utf8');
const man7 = JSON.parse(readFileSync(join(TB7, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(r.code === 0 && /replaced \.claude\/skills\/autoloop\/SKILL\.md \(fills kept\)/.test(r.out) && al7.includes('UPSTREAM ADDITION 9.9 (autoloop)')
   && (al7.match(/-PackDir <pack>/g) || []).length === packBefore && packBefore > 0 && !al7.includes('<BUILD_COMMAND>') && !/autoloop\/SKILL\.md/.test(readTask(TB7))
   && man7.fills && man7.fills['<BUILD_COMMAND>'] === PACK_FILL,
   'B7 (#73): заполнение со скобками («-PackDir <pack>») выведено — /autoloop заменён механически, заполнение цело, в задании его нет, fills в манифесте',
   r.out.split('\n').filter((l) => /autoloop|hand-filled/.test(l)).join(' | ').slice(0, 400));

// N1 (2.8, эпик UP, тикет origin #92 · Q-R4 · K-R2a · суд F-F2): update-verify сверяет КАЖДЫЙ раздел, новый в выпуске, с диском — не только
// то, что несло задание. Раздел доехал — тишина; раздела нет на диске — КРАСНЫЙ поимённо (прежний шаблон его не имел — это не удаление владельца).
const AUTOLOOP = '.claude/skills/autoloop/SKILL.md';
const NEW_SEC = '## A section new in 9.9';
const bundle99n = editBundleModule(bundle99, AUTOLOOP, /^## The cycle/, (m) => m.lines.push('', NEW_SEC, '', 'The body of the section new in 9.9.'));
const SRC99N = join(ROOT, 'src-9.9n'); writeSource(SRC99N, bundle99n, '9.9');
const TD1 = join(ROOT, 'up-d1'); mkdirSync(TD1); seed(TD1);
must(run, TD1, 'install');
r = run(TD1, `update --source ${SRC99N} --baseline ${OLD}`);
ok(r.code === 0, 'N1 update →9.9 (с новым разделом) exit 0', r.out.slice(-300));
const d1Arrived = readFileSync(join(TD1, AUTOLOOP), 'utf8').includes(NEW_SEC);
const rc1 = JSON.parse(readFileSync(join(TD1, '.kaif', 'last-update.json'), 'utf8'));
let v1 = run(TD1, 'update-verify');
const issuesOf = (o) => Number((String(o).match(/FAILED: (\d+) issues/) || [])[1] || 0);   // the gate's own count (court UP6, F6)
const v1Issues = issuesOf(v1.out);
ok(r.code === 0 && d1Arrived && (rc1.newModules || {})[AUTOLOOP]?.includes(NEW_SEC) && !/section of this release did not arrive/.test(v1.out),
   'N1 (#92): раздел, новый в 9.9, доехал; квитанция называет его в newModules; update-verify о нём молчит', v1.out.split('\n').filter((l) => /section/.test(l)).join(' | ').slice(0, 300));
writeFileSync(join(TD1, AUTOLOOP), joinModules(splitModules(readFileSync(join(TD1, AUTOLOOP), 'utf8').replace(/\r\n/g, '\n')).filter((m) => m.signature !== NEW_SEC)));
v1 = run(TD1, 'update-verify');
ok(v1.code !== 0 && issuesOf(v1.out) === v1Issues + 1 && v1.out.includes('a section of this release did not arrive: ' + AUTOLOOP + ' :: ' + NEW_SEC),
   'N1 (#92): раздела, нового в 9.9, на диске нет — update-verify КРАСНЫЙ (счёт провалов +1) и называет файл и раздел', v1.out.split('\n').filter((l) => /section|✖/.test(l)).join(' | ').slice(0, 400));
// N2 (#92): модуль, ПРЕДЛОЖЕННЫЙ прошлым обновлением и не влитый, следующее читало как «удалил владелец» — теперь предлагает снова по квитанции.
const pickMod = (dir) => splitModules(readFileSync(join(dir, AUTOLOOP), 'utf8').replace(/\r\n/g, '\n')).find((m) => /^## /.test(m.signature) && !/^## The cycle/.test(m.signature));
const TD2 = join(ROOT, 'up-d2'); mkdirSync(TD2); seed(TD2);
must(run, TD2, 'install');
const prop = pickMod(TD2);
ok(!!prop, 'N2 фикстура: в /autoloop есть раздел, который 9.9 не меняет', prop && prop.signature);
const dropProp = (dir) => writeFileSync(join(dir, AUTOLOOP), joinModules(splitModules(readFileSync(join(dir, AUTOLOOP), 'utf8').replace(/\r\n/g, '\n')).filter((m) => m.signature !== prop.signature)));
dropProp(TD2);
writeFileSync(join(TD2, '.kaif', 'last-update.json'), JSON.stringify({ from: '0.0', to: FROM, route: 'core-update', divergedModules: { [AUTOLOOP]: [prop.signature] } }, null, 2) + '\n');
r = run(TD2, `update --source ${SRC99} --baseline ${OLD}`);
const taskD2 = readTask(TD2);
ok(r.code === 0 && taskD2.includes('proposed by the PREVIOUS update and never merged') && taskD2.includes(prop.signature),
   'N2 (#92): модуль, предложенный прошлым обновлением и не влитый, предложен СНОВА (по квитанции), а не прочитан удалением владельца', taskD2.split('\n').filter((l) => /PREVIOUS|autoloop/.test(l)).join(' | ').slice(0, 300));
const TD3 = join(ROOT, 'up-d3'); mkdirSync(TD3); seed(TD3);
must(run, TD3, 'install');
dropProp(TD3);
r = run(TD3, `update --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0 && !readTask(TD3).includes('proposed by the PREVIOUS update'),
   'N2 контроль: без записи прошлой квитанции отсутствующий неизменённый модуль остаётся удалением владельца (не предлагается)', readTask(TD3).split('\n').filter((l) => /PREVIOUS/.test(l)).join(' | ').slice(0, 200));

// E (2.8, эпик UP, критерий 14 — мандат №125, ideas/30 п. 4): обновление ЯДРОМ ПРЕДЫДУЩЕГО ВЫПУСКА — так его запускает поле (EXP-0157).
// Установка из артефактов релиза v2.7 (git show v2.7:dist/…), `update` делает ядро 2.7, `update-verify` — доставленное ядро: на целом
// дереве молчит о разделах, новых с 2.7; раздел, которого проход старого ядра не принёс, — КРАСНЫЙ поимённо (квитанция старого ядра
// о нём не знает — список несёт мета бандла, `sectionsNew`). Нет git или тега → случай назван пропущенным (не зелёный молча).
{
  const gitShow = (p) => { try { return execFileSync('git', ['show', 'v2.7:' + p], { cwd: REPO, stdio: 'pipe', maxBuffer: 1 << 27 }); } catch { return null; } };
  const b27 = gitShow('dist/KAIF-CORE-BUNDLE.md'), c27 = gitShow('dist/KAIF-CORE.mjs');
  const metaNow = JSON.parse(readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8').match(blockRe('kaif-bundle-manifest.json'))[2]);
  const sn = metaNow.sectionsNew || { files: {} };
  const snPaths = Object.keys(sn.files || {});
  if (!b27 || !c27) console.log('⏭ E: SKIPPED — git или тег v2.7 недоступны (артефакты релиза не извлечь)');
  else {
    const gitLines = (...a) => { try { return execFileSync('git', a, { cwd: REPO, stdio: 'pipe' }).toString().split('\n').map((x) => x.trim()).filter(Boolean); } catch { return []; } };
    const ownTags = new Set(gitLines('tag', '--points-at', 'HEAD'));
    const wantPrev = gitLines('tag', '--list', 'v*', '--sort=-v:refname').filter((t) => /^v\d+\.\d+$/.test(t) && !ownTags.has(t))[0];
    ok(sn.prev === wantPrev && snPaths.length > 0, 'E фикстура: мета бандла несёт sectionsNew против старшего тега выпуска, не своего (' + wantPrev + ', ' + snPaths.length + ' файл(ов))', JSON.stringify(sn).slice(0, 200));
    const TE = join(ROOT, 'e27'); mkdirSync(join(TE, '.kaif', 'install'), { recursive: true });
    writeFileSync(join(TE, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), b27); writeFileSync(join(TE, '.kaif', 'kaif-core.mjs'), c27);
    must(run, TE, 'install');
    const SRC_NOW = join(ROOT, 'src-now-9.9'); writeSource(SRC_NOW, replaceBundleBlock(readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8'), 'kaif-bundle-manifest.json', (j) => { const m = JSON.parse(j); m.version = '9.9'; return JSON.stringify(m, null, 2); }), '9.9');
    r = run(TE, `update --source ${SRC_NOW}`);   // run by the 2.7 core deployed above
    const rcE = existsSync(join(TE, '.kaif', 'last-update.json')) ? JSON.parse(readFileSync(join(TE, '.kaif', 'last-update.json'), 'utf8')) : {};
    ok(r.code === 0 && rcE.from === '2.7' && !rcE.newModules, 'E: update 2.7 → 9.9 провело ЯДРО 2.7 (его квитанция без newModules)', r.out.slice(-300));
    let vE = run(TE, 'update-verify');
    const vEIssues = issuesOf(vE.out);
    ok(!/section of this release did not arrive/.test(vE.out), 'E: доставленное ядро в update-verify молчит о разделах, новых с 2.7, — проход старого ядра их принёс', vE.out.split('\n').filter((l) => /section/.test(l)).join(' | ').slice(0, 300));
    const pE = snPaths.find((p) => existsSync(join(TE, p)) && /\.claude\/skills\//.test(p)) || snPaths.find((p) => existsSync(join(TE, p)));
    const sE = pE ? sn.files[pE][0] : null;
    if (pE && sE) writeFileSync(join(TE, pE), joinModules(splitModules(readFileSync(join(TE, pE), 'utf8').replace(/\r\n/g, '\n')).filter((m) => m.signature !== sE)));
    vE = run(TE, 'update-verify');
    ok(!!pE && vE.code !== 0 && issuesOf(vE.out) === vEIssues + 1 && vE.out.includes('a section of this release did not arrive: ' + pE + ' :: ' + sE),
       'E: раздела, нового с 2.7, на диске нет — доставленное ядро КРАСНОЕ поимённо (счёт провалов +1), хотя квитанцию писало старое ядро', vE.out.split('\n').filter((l) => /section|✖/.test(l)).join(' | ').slice(0, 400));
    // E2 (суд UP6, F7): то же на ПЕРЕВЕДЁННОМ развёртывании — квитанция ядра 2.7 не знает translatedFiles, и английский файл судится сам
    // (шаблон выпуска против текста на диске): недоехавший раздел в нём — КРАСНЫЙ, а не «проверь руками (файл переведён)»
    const TE2 = join(ROOT, 'e27-tr'); mkdirSync(join(TE2, '.kaif', 'install'), { recursive: true });
    writeFileSync(join(TE2, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), b27); writeFileSync(join(TE2, '.kaif', 'kaif-core.mjs'), c27);
    must(run, TE2, 'install');
    { const mk = JSON.parse(readFileSync(join(TE2, '.kaif', 'kaif.json'), 'utf8')); mk.i18n = 'translated'; writeFileSync(join(TE2, '.kaif', 'kaif.json'), JSON.stringify(mk, null, 2) + '\n'); }
    r = run(TE2, `update --source ${SRC_NOW}`);
    ok(r.code === 0, 'E2 update 2.7 → 9.9 (ядро 2.7, переведённое развёртывание) exit 0', r.out.slice(-300));
    if (pE && sE) writeFileSync(join(TE2, pE), joinModules(splitModules(readFileSync(join(TE2, pE), 'utf8').replace(/\r\n/g, '\n')).filter((m) => m.signature !== sE)));
    const vE2 = run(TE2, 'update-verify');
    ok(r.code === 0 && !!pE && vE2.out.includes('a section of this release did not arrive: ' + pE + ' :: ' + sE) && !vE2.out.includes('check it by hand (the file is translated; its English signature cannot be matched): ' + pE),
       'E2 (F7): переведённое развёртывание, квитанция ядра 2.7 — английский файл без нового раздела КРАСНЫЙ, не «проверь руками»', vE2.out.split('\n').filter((l) => /section|✖|⚠/.test(l)).join(' | ').slice(0, 400));
  }
}

// N3 (court UP6, R2 — the #92 incident): on a TRANSLATED deployment an ENGLISH file with an unmerged module diff is judged like any
// other — the gate used to skip every promised line on an i18n deployment, whatever the file.
{
  const TN3 = join(ROOT, 'up-n3'); mkdirSync(TN3); seed(TN3);
  must(run, TN3, 'install');
  const mk = JSON.parse(readFileSync(join(TN3, '.kaif', 'kaif.json'), 'utf8')); mk.i18n = 'translated';
  writeFileSync(join(TN3, '.kaif', 'kaif.json'), JSON.stringify(mk, null, 2) + '\n');
  const TFW = join(TN3, 'TESTING_FRAMEWORK.md');
  const tfMods = splitModules(readFileSync(TFW, 'utf8').replace(/\r\n/g, '\n'));
  tfMods[1].lines.push('', 'An owner line inside the module upstream changes.');   // a local edit — the module diff goes to the task
  writeFileSync(TFW, joinModules(tfMods));
  r = run(TN3, `update --source ${SRC99} --baseline ${OLD}`);
  ok(r.code === 0 && readTask(TN3).includes('UPSTREAM ADDITION 9.9 (testing)'), 'N3 фикстура: английский файл на переведённом развёртывании — дифф модуля в задании', r.out.slice(-300));
  const v3 = run(TN3, 'update-verify');
  ok(/promised upstream line not found on disk \(unmerged\?\): TESTING_FRAMEWORK\.md :: UPSTREAM ADDITION 9\.9 \(testing\)/.test(v3.out),
     'N3 (R2): английский файл на переведённом развёртывании — невлитая строка апстрима НАЗВАНА (флаг развёртывания больше не судья)', v3.out.split('\n').filter((l) => /promised|TESTING/.test(l)).join(' | ').slice(0, 300));
}

// N4 (court UP6, R3 — K-R2a): `diff --source <x> --render <file>` prints the file exactly as `install` of <x> writes it HERE — language
// override, trigger aliases, fills: rendered against the release this ru deployment was installed from, it equals the untouched disk.
{
  const TN4 = join(ROOT, 'up-n4'); mkdirSync(TN4); seed(TN4);
  must(run, TN4, 'install --lang ru');
  const render = (file) => { try { return execFileSync(process.execPath, [join(TN4, '.kaif', 'kaif-core.mjs'), 'diff', '--source', DIST, '--render', file, '--baseline', join(ROOT, 'no-network-baseline')], { cwd: TN4, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString(); } catch (e) { return 'FAILED: ' + String(e.stderr || e.message).slice(0, 200); } };
  const same = (file) => render(file).replace(/\r\n/g, '\n') === readFileSync(join(TN4, file), 'utf8').replace(/\r\n/g, '\n');
  const files = ['GOAL.md', CB, 'AGENT_GUIDE.md'];
  const bad = files.filter((f) => !same(f));
  ok(!bad.length, 'N4 (R3): рендер файла (обзор языка ru · навык с алиасами · руководство с заполнениями) побайтно равен тому, что записала установка', bad.join(', ') + ' :: ' + render(bad[0] || files[0]).slice(0, 160));
  const miss = render('no/such-file.md');
  ok(miss.startsWith('FAILED') && miss.includes('does not ship this file'), 'N4: рендер файла, которого выпуск не везёт, — отказ с именем', miss.slice(0, 200));
}

// A2b (court UP6, F4 — the field shape of #42 A2): the deployed core rehearsed (a 2.7 core writes an UNSIGNED record), the new core runs the
// bootstrap — the record is named, ignored AND removed: left on disk it binds nothing, and every field agent deleted it by hand.
{
  const TA2b = join(ROOT, 'a2b'); mkdirSync(TA2b); seed(TA2b);
  must(run, TA2b, 'install --lang ru');
  const REH = join(TA2b, '.kaif', 'update-rehearsal.json');
  writeFileSync(REH, JSON.stringify({ from: FROM, to: '9.9', source: 'sandbox', verdicts: {} }, null, 2) + '\n');
  r = runLoader(TA2b, `--lang ru --source ${SRC99} --baseline ${OLD}`);
  ok(r.code === 0 && /did not sign it \(before 2\.8\) — ignored and removed/.test(r.out) && !existsSync(REH),
     'A2b (F4): авто-запись репетиции, не подписанная этим ядром, названа, отброшена И убрана с диска', r.out.split('\n').filter((l) => /rehearsal/.test(l)).join(' | ').slice(0, 300));
}

// A5 (court UP6, F5): a named --rehearsal that another core SIGNED is refused on the bootstrap route BEFORE the backup and the crash journal —
// a refusal used to leave a journal that blocked the next update as "died mid-flight"
{
  const TA5 = join(ROOT, 'a5'); mkdirSync(TA5); seed(TA5);
  must(run, TA5, 'install');
  const RC5 = join(ROOT, 'a5-foreign-receipt.json');
  writeFileSync(RC5, JSON.stringify({ from: FROM, to: '9.9', source: 'sandbox', core: 'f'.repeat(64), verdicts: {} }, null, 2) + '\n');
  writeFileSync(join(TA5, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), bundle99);
  r = run(TA5, `install --bundle .kaif/install/KAIF-CORE-BUNDLE.md --rehearsal ${RC5} --baseline ${OLD}`);
  ok(r.code !== 0 && /written by another core/.test(r.out) && !existsSync(join(TA5, '.kaif', 'update-journal.json')),
     'A5 (F5): чужая подписанная запись на bootstrap — отказ ДО копии дерева: журнала обновления нет', r.out.slice(-300));
}

// B8 (court UP6, F15): the exact garbage guard of fill derivation — a "fill" that carries a KNOWN slot token is a template line, not a hand
// fill: it is never recorded (the autoloop line keeps the literal <TEST_HARNESS> inside what would otherwise read as the fill of <BUILD_COMMAND>)
{
  const TB8 = join(ROOT, 'b8'); mkdirSync(TB8); seed(TB8);
  must(run, TB8, 'install');
  const AL8 = join(TB8, AUTOLOOP);
  const t8 = readFileSync(AL8, 'utf8');
  writeFileSync(AL8, t8.replace('<BUILD_COMMAND>', 'run <TEST_HARNESS> first'));
  r = run(TB8, `update --source ${SRC99} --baseline ${OLD}`);
  const man8 = JSON.parse(readFileSync(join(TB8, '.kaif', 'deploy-manifest.json'), 'utf8'));
  ok(r.code === 0 && !((man8.fills || {})['<BUILD_COMMAND>'] || '').includes('<TEST_HARNESS>'),
     'B8 (F15): «заполнение», несущее известный токен слота, НЕ записано заполнением', JSON.stringify(man8.fills || {}).slice(0, 200));
}

const TB2 = join(ROOT, 'b2'); mkdirSync(TB2); seed(TB2);
must(run, TB2, 'install');
const techId = JSON.parse(readFileSync(join(TB2, '.kaif', 'deploy-manifest.json'), 'utf8')).values['<PROJECT_NAME>'];
must(run, TB2, 'project-name "Proper Name"');
const AG2 = join(TB2, 'AGENT_GUIDE.md');
// агент исполнил указание задания — поправил строки идентичности на каноническое имя (H1 намеренно оставлен: bug 26 держит его отдельно)
writeFileSync(AG2, readFileSync(AG2, 'utf8')
  .replace('| **Name / brand** | `' + techId + '` |', '| **Name / brand** | `Proper Name` |')
  .replace('| **Short name** | `' + techId + '` |', '| **Short name** | `Proper Name` |'));
ok(readFileSync(AG2, 'utf8').includes('| **Name / brand** | `Proper Name` |'), 'B6 фикстура: модуль идентичности на диске несёт каноническое имя', techId);
r = run(TB2, `update --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0, 'B6 update exit 0', r.out.slice(-400));
ok(!/Project identity/.test(readTask(TB2)), 'B6 (#48 R3): модуль, уже равный новому заполненному шаблону, НЕ назван «carries local edits AND upstream changed it»', readTask(TB2).split('\n').filter((l) => /identity/.test(l)).join(' | ').slice(0, 300));
// B6b (суд UP6, F8): H1 несёт имя проекта — записанное каноническое имя не «раздел, новый в выпуске»; update-verify не зовёт вернуть
// заголовок `# <имя> — …` (совет дал бы документ с двумя H1)
{ const vB6 = run(TB2, 'update-verify');
  ok(!/a section of this release did not arrive: AGENT_GUIDE\.md :: # /.test(vB6.out), 'B6b (F8): имя проекта в H1 — не «недоехавший раздел» (update-verify молчит о H1)', vB6.out.split('\n').filter((l) => /did not arrive/.test(l)).join(' | ').slice(0, 300)); }

// ================================================================ C (#44): окно stale-claims
console.log('\n=== C (#44): stale-claims видит ЛЮБУЮ версию старше устанавливаемой; `gt` — одно объявление ===');
const TC = join(ROOT, 'c1'); mkdirSync(TC); seed(TC);
must(run, TC, 'install');
const readme = [...Array(21)].map((_, i) => `line ${i + 1}`);
readme.push('[![Framework](https://img.shields.io/badge/Framework-KAIF%202.2-7F52FF.svg)](https://github.com/x/KAIF)');   // :22 — бейдж на версии двумя интервалами старше
readme.push(`This project runs KAIF ${FROM}.`);                          // :23 — только что заменяемая версия — клейм как прежде
readme.push('> Owner quote: we started on KAIF 2.2.');                   // :24 — цитата владельца — изъятие
readme.push('2026-08-14 — updated to KAIF 2.2 (journal row).');          // :25 — датированная — изъятие
writeFileSync(join(TC, 'README.md'), readme.join('\n') + '\n');
r = run(TC, `update --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0, 'C update exit 0', r.out.slice(-400));
const taskC = readTask(TC);
const staleC = (() => { const ls = taskC.split('\n'); const i = ls.findIndex((l) => /\*\*stale-claims\*\*/.test(l)); if (i < 0) return '';
  const j = ls.slice(i + 1).findIndex((l) => /^- \*\*[a-z-]+\*\*/.test(l)); return ls.slice(i, j < 0 ? undefined : i + 1 + j).join('\n'); })();
ok(/README\.md:22 —[^\n]*\(asserts 2\.2\)/.test(staleC), 'C1 (критерий 3): бейдж README.md:22 на 2.2 назван в stale-claims — с номером строки и версией', staleC.slice(0, 500));
ok(/README\.md:23/.test(staleC), 'C1: клейм только что заменённой версии назван как прежде');
ok(!/README\.md:24/.test(staleC) && !/README\.md:25/.test(staleC), 'C1: цитата и датированная строка — изъятия как прежде (шум не вырос)');
ok(/assert an OLD version \(older than 9\.9/.test(staleC), 'C1: текст пункта — «an OLD version (older than <to>)», не «the OLD version (<from>)»');
const coreSrc = readFileSync(join(DIST, 'KAIF-CORE.mjs'), 'utf8');
ok((coreSrc.match(/^const gt = /gm) || []).length === 1 && !/^\s+const gt = /m.test(coreSrc), 'C2 (критерий 3): `gt` — одно объявление модульной области в ядре, локальных дублей нет', `module-level ${(coreSrc.match(/^const gt = /gm) || []).length} · local ${(coreSrc.match(/^\s+const gt = /gm) || []).length}`);

// ================================================================ D (#41 wish 3 · E-H3): baseline текстов и language-arrivals на bootstrap
console.log('\n=== D (#41 wish 3 · E-H3): bootstrap — дифф отсутствующего модуля несёт старые строки; английские новинки названы ===');
const TD = join(ROOT, 'd1'); mkdirSync(TD); seed(TD);
must(run, TD, 'install --lang ru');
// владелец удалил из TESTING_FRAMEWORK.md ровно тот модуль, который апстрим 9.9 меняет → в задании дифф этого модуля
const TF = join(TD, 'TESTING_FRAMEWORK.md');
const tfMods = splitModules(readFileSync(TF, 'utf8').replace(/\r\n/g, '\n'));
const dropped = tfMods[1].signature;
writeFileSync(TF, joinModules(tfMods.filter((_, i) => i !== 1)));
r = runLoader(TD, `--lang ru --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0, 'D bootstrap →9.9 (ru, --baseline) exit 0', r.out.slice(-400));
const taskD = readTask(TD);
const modBlock = (() => { const i = taskD.indexOf(dropped); if (i < 0) return ''; const s = taskD.indexOf('```diff', i); if (s < 0) return taskD.slice(i, i + 600);
  const e = taskD.indexOf('\n```\n', s + 7); return taskD.slice(i, e < 0 ? undefined : e); })();
ok(modBlock.length > 0, 'D1 фикстура: удалённый модуль назван в задании bootstrap-маршрута', dropped);
// со старым текстом в руках дифф показывает модуль КОНТЕКСТОМ («  строка») и только добавленное — `+`;
// без него (HEAD) каждая строка модуля — `+` (lineDiff('', new))
const plusN = (modBlock.match(/^\+ .+/gm) || []).length, ctxN = (modBlock.match(/^  \S.*/gm) || []).length;
ok(ctxN >= 5 && plusN <= 3, 'D1 (критерий 5 — baseline на bootstrap): дифф несёт СТАРЫЙ шаблон контекстом, `+` — только добавленное (не одни `+`)', `context ${ctxN} · plus ${plusN}`);
ok(/\*\*language-arrivals\*\*[^\n]*new-skill/.test(taskD), 'D2 (E-H3): bootstrap --lang ru с новым английским навыком → пункт language-arrivals в задании', taskD.split('\n').filter((l) => /\*\*[a-z-]+\*\*/.test(l)).map((l) => l.slice(0, 40)).join(' | '));

console.log(failures ? `\n❌ s21: ${failures} red` : '\n✅ s21: all green');
process.exit(failures ? 1 : 0);
