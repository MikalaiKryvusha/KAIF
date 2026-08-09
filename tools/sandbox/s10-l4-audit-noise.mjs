// s10-l4-audit-noise.mjs — свод фазы L4 эпика L 2.2 (план 43): «шум и честность аудита».
// Баг-доки: bugs/35 (stale-claims — точность ≈19 %, цитаты владельца/журналы/зеркала/кап),
// bugs/36 (переведённое развёртывание красно ПО ПОСТРОЕНИЮ: MODULE ABSENT ×218/290/216,
// плейсхолдеры чужих сфер), bugs/37 (warning-guard длины STATUS не существует — 1647/1928
// строк «предупреждать было некому»). Линт бандла bugs/38 живёт в tools/check-framework.mjs
// (5e) и доказывается сборкой на HEAD, не этим сводом.
//
// ⚠️ Дисциплина стражей (EXP-0016/0017): свод написан ДО фиксов и обязан быть КРАСНЫМ на
// текущем коде ровно в помеченных стражах. Предсказания до первого прогона (2026-08-07):
//   S1 КРАСНЫЙ — точность stale-claims на полевой фикстуре: кап 40 хитов съедается зеркалами
//      .agents/* (KCam Г4), README-бейдж — единственный публичный клейм — ПРОПУЩЕН; после
//      фикса точность ≥ 50 % (родительский критерий №6, замер числом печатает свод), цитата
//      владельца в blockquote (Unlim Г5), журнальные строки с датами (Unlim Г5), GOAL.md
//      (NDim гр.3), летописные строки с датами (NDim гр.4) и зеркала — ВНЕ выдачи.
//   S1cap КРАСНЫЙ — кап по хитам, не по файлам: 25 файлов с настоящими клеймами показываются
//      все подряд без честного «shown N of M» (KCam: «кап не по числу хитов, а по числу
//      файлов, и с явным "показаны N из M"»).
//   S2 КРАСНЫЙ — в задании обновления пункт stale-claims идёт ДО review-news, а миграцию
//      летописи предписывают именно новости (NDim гр.4: «скан идёт ДО миграции»).
//   S3 КРАСНЫЙ — module audit на i18n:translated печатает «MODULE ABSENT» для переведённого
//      файла как дефект (218/290/216 в трёх полевых проектах; KCam Г13: «отличить от
//      РЕАЛЬНОЙ потери модуля по выводу невозможно»); после фикса переведённый файл честно
//      классифицируется localized, а РЕАЛЬНАЯ потеря модуля в EN-файле остаётся видимой.
//   S4 КРАСНЫЙ — placeholder-гейт красен на <BUILD_COMMAND> в библиотеке ЧУЖОЙ сферы
//      (Unlim Г11: «<BUILD_COMMAND> в файле чужой сферы блокировал приёмку»); после фикса
//      сканируется только ОБЪЯВЛЕННАЯ сфера, и незаполненная объявленная остаётся красной
//      (KCam: слот в .kaif/spheres/programming.md).
//   S5 КРАСНЫЙ — `check` молчит на STATUS.md в 260 строк (KLAS D9: 1928 строк, «предупреждать
//      было некому»; Unlim Г10: единственный «guard» — фраза в шаблоне); после фикса —
//      предупреждение с числом строк и мягкой целью ~200 (решение №27), exit 0 (warning).
// Инварианты (зелёные и до, и после): checkpoint stale-claims тикается при любых хитах;
// update-verify зелёный на чистой заполненной фикстуре; короткий STATUS не предупреждает.
//
// В tools/sandbox-suite.mjs свод вписывается ВМЕСТЕ с фиксами, когда зеленеет.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
const CUR = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('l4-noise', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  writeFileSync(join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md')));
  writeFileSync(join(dir, '.kaif', 'kaif-core.mjs'), readFileSync(join(DIST, 'KAIF-CORE.mjs')));
};
const readMarker = (dir) => JSON.parse(readFileSync(join(dir, '.kaif', 'kaif.json'), 'utf8'));
const writeMarker = (dir, j) => writeFileSync(join(dir, '.kaif', 'kaif.json'), JSON.stringify(j, null, 2) + '\n');
// Плейсхолдеры канона — заполнение играет роль адаптации (как s03/S12)
const PH = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>', '<LICENSE>',
  '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  "<YOUR AGENT'S noreply EMAIL>", '<OWNER_LANGUAGE>'];
const fill = (p) => { if (!existsSync(p)) return; let t = readFileSync(p, 'utf8'); for (const ph of PH) t = t.split(ph).join('X'); writeFileSync(p, t); };
const fillCanon = (dir, { spheres = true } = {}) => {
  fill(join(dir, 'AGENT_GUIDE.md'));
  if (existsSync(join(dir, '.claude', 'skills'))) for (const n of readdirSync(join(dir, '.claude', 'skills')))
    fill(join(dir, '.claude', 'skills', n, 'SKILL.md'));
  if (spheres && existsSync(join(dir, '.kaif', 'spheres'))) for (const n of readdirSync(join(dir, '.kaif', 'spheres')))
    if (n.endsWith('.md')) fill(join(dir, '.kaif', 'spheres', n));
};
// Минимальное задание обновления: ровно один пункт-чекпоинт (для checkpoint stale-claims)
// или ноль пунктов (для голого update-verify) + секция чекпоинтов.
const writeTask = (dir, ids = []) => writeFileSync(join(dir, 'KAIF_UPDATE_TASK.md'), [
  `# KAIF update task — finish the update to ${CUR}`, '',
  '> sandbox-crafted minimal task.',
  ...ids.map((id) => `- **${id}** — sandbox item. When done, run: \`node .kaif/kaif-core.mjs checkpoint ${id}\``),
  '', '## Checkpoints (append below as you finish items)', '',
].join('\n'));

// ══════════════════ S1: точность stale-claims на полевой фикстуре 4 отчётов ══════════════════
console.log(`\n=== S1: stale-claims — полевая фикстура (NDim/Unlim/KLAS/KCam), замер точности числом ===`);
const S1 = join(ROOT, 's1'); mkdirSync(S1); seed(S1);
must(run, S1, 'install');   // полный деплой: зеркала всех систем существуют, templateShas сняты

// —— полевые строки; from=1.6, to=CUR. Классы дословно из отчётов (реестр plans/36). ——
// ИСТИННЫЕ клеймы (обязаны быть в выдаче после фикса):
appendFileSync(join(S1, 'AGENT_GUIDE.md'),
  '\nОбвязка проекта: фреймворк KAIF 1.6, машинерия в .kaif/kaif-core.mjs.\n' +          // TRUE: клейм в прозе (KLAS D11)
  '> работаем на русском языке. то, что каиф 1.6 требует инглиш — игнорируем, главное взять суть.\n' + // FALSE: цитата владельца в blockquote (Unlim Г5)
  '**Правило одного шага (KAIF 1.6):** одна правка — одна сборка, никаких пакетных правок.\n' +       // FALSE: атрибуция правила (KCam Г4: «менять НЕЛЬЗЯ»)
  'Цель квартала: выпустить Space 1.6 — новую версию продукта; KAIF дисциплинирует агента.\n');       // FALSE: версия ПРОДУКТА в СКАНИРУЕМОМ файле (NDim гр.3 — окно смежности; находка судьи L4)
appendFileSync(join(S1, 'MASTER_PLAN.md'),
  '\n| 2026-07-25 | **KAIF обновлён 1.4 → 1.6** (Homeostatic KAIF) уважительной миграцией |\n');      // FALSE: журнал решений (Unlim Г5)
appendFileSync(join(S1, 'GOAL.md'),
  '\nЦель года: выпустить Space 1.6 — новую версию продукта; KAIF дисциплинирует агента.\n');          // FALSE: версия ПРОДУКТА в документе владельца (NDim гр.3)
appendFileSync(join(S1, 'STATUS.md'),
  '\nПроект обвязан KAIF 1.6 (см. AGENT_GUIDE).\n' +                                                   // TRUE: живой клейм состояния
  '- 2026-07-25 — обновление KAIF 1.4 → 1.6 прошло чисто, задание закрыто.\n');                        // FALSE: летописная запись с датой (NDim гр.4)
writeFileSync(join(S1, 'README.md'),
  '# Sandbox project\n\n[![Framework: KAIF 1.6](https://img.shields.io/badge/Framework-KAIF%201.6-6E56CF.svg)](docs)\n'); // TRUE: публичный бейдж (KCam Г4 — пропущенный класс)
appendFileSync(join(S1, 'KAIF_FRAMEWORK.md'),
  '\n| **Версия KAIF** | 1.6 «Homeostatic KAIF» |\n');                                                 // TRUE: таблица версии (NDim — настоящее устаревание)
// Шум зеркал (KCam Г4: 44 из 46 — атрибуции в зеркалах): ≥40 хитов в .agents/* съедают кап ДО README
const agentsSkills = join(S1, '.agents', 'skills');
let mirrored = 0;
if (existsSync(agentsSkills)) for (const n of readdirSync(agentsSkills)) {
  const p = join(agentsSkills, n, 'SKILL.md');
  if (existsSync(p) && mirrored < 25) { appendFileSync(p, '\n**Правило одного шага (KAIF 1.6):** одна правка — одна сборка.\n**Правило двух глаз (KAIF 1.6):** дифф читается построчно.\n'); mirrored++; }
}
writeFileSync(join(S1, '.kaif', 'last-update.json'),
  JSON.stringify({ from: '1.6', to: CUR, route: 'core-update', date: '2026-08-07', counters: {} }, null, 2) + '\n');
writeTask(S1, ['stale-claims']);

let r = run(S1, 'checkpoint stale-claims');
ok(r.code === 0, 'S1 checkpoint stale-claims тикается (контракт «state why» — хиты не блокируют)', r.out);
// точность считается ПО СТРОКАМ, не по файлам (находка судьи L4: ложная строка внутри
// «истинного» файла не должна прятаться за его именем) — каждый хит классифицируется текстом
const hitLines = [...r.out.matchAll(/·\s+(\S+?):\d+ — ([^\n]+)/g)].map((m) => ({ path: m[1].replace(/\\/g, '/'), text: m[2] }));
const hits = hitLines.map((h) => h.path);
const TRUE_HITS = ['README.md', 'KAIF_FRAMEWORK.md', 'AGENT_GUIDE.md', 'STATUS.md'];
const TRUE_LINES = ['Обвязка проекта: фреймворк KAIF 1.6', 'Проект обвязан KAIF 1.6', 'Framework: KAIF 1.6', '**Версия KAIF** | 1.6'];
const falseHits = hitLines.filter((h) => !TRUE_LINES.some((t) => h.text.includes(t)));
const precision = hitLines.length ? (hitLines.length - falseHits.length) / hitLines.length : 0;
console.log(`   ЗАМЕР: ${hitLines.length} хитов-строк, полезных ${hitLines.length - falseHits.length}, точность ${(precision * 100).toFixed(0)} % (гейт ≥ 50 %); ложные: ${[...new Set(falseHits.map((h) => h.path))].slice(0, 5).join(', ') || 'нет'}`);
ok(hits.includes('README.md'), 'S1 README-бейдж — единственный публичный клейм — НАЙДЕН (KCam Г4: кап больше не съедается зеркалами)', r.out.slice(-400));
ok(hits.includes('KAIF_FRAMEWORK.md') && hits.includes('AGENT_GUIDE.md') && hits.includes('STATUS.md'),
   'S1 настоящие клеймы (таблица версии · проза · статус) — все в выдаче', hits.join(','));
ok(!hits.some((p) => p.startsWith('.agents/') || p.startsWith('.grok/') || p.startsWith('.cline/') || p.startsWith('.roo/')),
   'S1 зеркала агентских систем — ВНЕ выдачи (производные, машинерия их сама пересинхронизирует)', hits.join(','));
ok(!hits.includes('GOAL.md'), 'S1 GOAL.md (документ владельца, версия продукта) — ВНЕ выдачи (NDim гр.3)', hits.join(','));
ok(!hits.includes('MASTER_PLAN.md'), 'S1 журнал решений с датами — ВНЕ выдачи (Unlim Г5)', hits.join(','));
ok(!/каиф 1\.6 требует инглиш/.test(r.out), 'S1 дословная цитата владельца в blockquote — ВНЕ выдачи (Unlim Г5)');
ok(!/Правило одного шага/.test(r.out), 'S1 атрибуции правил «(KAIF 1.6)» — ВНЕ выдачи (KCam Г4: история, не устаревание)');
ok(!/Space 1\.6/.test(r.out), 'S1 версия ПРОДУКТА в СКАНИРУЕМОМ файле — ВНЕ выдачи (окно смежности стережётся; находка судьи L4)');
ok(!/1\.4 → 1\.6 прошло чисто/.test(r.out), 'S1 летописная строка STATUS с датой — ВНЕ выдачи (NDim гр.4)');
ok(precision >= 0.5, `S1 точность ${(precision * 100).toFixed(0)} % ≥ 50 % — родительский критерий №6, замер числом`, `хиты: ${hits.join(', ')}`);

// ══════════════════ S1cap: кап по ФАЙЛАМ с честным «shown N of M» ══════════════════
console.log(`\n=== S1cap: кап по файлам, «shown N of M» (KCam Г4) ===`);
const S1C = join(ROOT, 's1cap'); mkdirSync(S1C); seed(S1C);
must(run, S1C, 'install --agents claude-code');
mkdirSync(join(S1C, 'docs'));
for (let i = 1; i <= 25; i++)
  writeFileSync(join(S1C, 'docs', `claim-${String(i).padStart(2, '0')}.md`), `# doc ${i}\n\nПроект обвязан KAIF 1.6.\n`);
writeFileSync(join(S1C, '.kaif', 'last-update.json'),
  JSON.stringify({ from: '1.6', to: CUR, route: 'core-update', date: '2026-08-07', counters: {} }, null, 2) + '\n');
writeTask(S1C, ['stale-claims']);
r = run(S1C, 'checkpoint stale-claims');
const capFiles = new Set([...r.out.matchAll(/·\s+(\S+?):\d+/g)].map((m) => m[1].replace(/\\/g, '/')).filter((p) => p.startsWith('docs/')));
ok(capFiles.size === 20 && /20 of 25 file/.test(r.out),
   'S1cap 25 файлов с клеймами → показаны ровно 20 + честная строка «20 of 25 file(s)»', `${capFiles.size} файлов; ${r.out.slice(-250)}`);

// ══════════════════ S2: порядок пунктов задания — stale-claims ПОСЛЕ review-news ══════════════════
console.log(`\n=== S2: порядок пунктов — миграция летописи (news) ДО скана (NDim гр.4) ===`);
// апстрим 9.9 из текущего бандла (как s03): правка одного static-модуля PHILOSOPHY
const FENCE = '`'.repeat(6);
const editBundleModule = (bundleText, filePath, moduleIndex, mutate) => {
  const re = new RegExp('(^> \\*\\*FILE: `' + filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
  const m = bundleText.match(re);
  if (!m) throw new Error('block not found: ' + filePath);
  const mods = splitModules(m[2] + '\n');
  mutate(mods[moduleIndex]);
  return bundleText.replace(re, m[1] + joinModules(mods).replace(/\n$/, '') + m[3]);
};
const { createHash } = await import('node:crypto');
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9'));
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
writeFileSync(join(SRC, 'KAIF-CORE.mjs'), readFileSync(join(DIST, 'KAIF-CORE.mjs')));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = createHash('sha256').update(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'))).digest('hex');
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');

const S2 = join(ROOT, 's2'); mkdirSync(S2); seed(S2);
must(run, S2, 'install --agents claude-code');
appendFileSync(join(S2, 'STATUS.md'), `\nПроект обвязан KAIF ${CUR}.\n`);   // живой клейм → пункт stale-claims появится
r = run(S2, `update --source ${SRC}`);
ok(r.code === 0, 'S2 update → 9.9 exit 0', r.out);
const task2 = readFileSync(join(S2, 'KAIF_UPDATE_TASK.md'), 'utf8');
const iNews = task2.indexOf('**review-news**'), iStale = task2.indexOf('**stale-claims**');
ok(iStale > 0 && iNews > 0 && iStale > iNews,
   'S2 пункт stale-claims идёт ПОСЛЕ review-news (миграция летописи из новостей — до скана)',
   `review-news@${iNews}, stale-claims@${iStale}`);

// ══════════════════ S3: module audit на i18n:translated — localized ≠ ABSENT ══════════════════
console.log(`\n=== S3: module audit — переведённый файл честно localized, реальная потеря видна (KCam Г13) ===`);
const S3 = join(ROOT, 's3'); mkdirSync(S3); seed(S3);
must(run, S3, 'install --lang ru --agents claude-code');
// переведённый целиком PHILOSOPHY (заголовки + тело на русском — как в трёх полевых проектах)
writeFileSync(join(S3, 'PHILOSOPHY.md'), [
  '# ФИЛОСОФИЯ — как агент мыслит', '',
  '## Ключевая идея', '', 'Просто — значит правильно. KISS и бритва Оккама.', '',
  '## Правило, когда застрял', '', 'Три попытки — стоп, переосмысли задачу.', '',
].join('\n'));
// РЕАЛЬНАЯ потеря модуля в непереведённом EN-файле: сносим последний модуль TESTING_FRAMEWORK
const tfPath = join(S3, 'TESTING_FRAMEWORK.md');
const tfMods = splitModules(readFileSync(tfPath, 'utf8'));
writeFileSync(tfPath, joinModules(tfMods.slice(0, -1)));
const mk3 = readMarker(S3); mk3.i18n = 'translated'; writeMarker(S3, mk3);
fillCanon(S3);
writeTask(S3, []);
r = run(S3, 'update-verify');
ok(r.code === 0, 'S3 update-verify exit 0 (аудит информационный, приёмку не жжёт)', r.out);
ok(!/MODULE ABSENT: PHILOSOPHY\.md/.test(r.out),
   'S3 переведённый файл НЕ печатается дефектом «MODULE ABSENT» (не красный по построению — критерий №7)', r.out.slice(-400));
ok(/localized/.test(r.out) && /PHILOSOPHY\.md/.test(r.out),
   'S3 переведённый файл честно назван localized (сверка по сигнатуре неприменима)', r.out.slice(-400));
ok(/MODULE ABSENT: TESTING_FRAMEWORK\.md/.test(r.out),
   'S3 РЕАЛЬНАЯ потеря модуля в EN-файле осталась видимой (честность не куплена слепотой)', r.out.slice(-400));

// ═════════ S3de (bugs/66 №3): то же самое для ЛАТИНСКОГО языка, у которого письменности нет ════
// Классификация `localized` опиралась на таблицу письменностей, а у четырёх ОТГРУЖАЕМЫХ пакетов
// (de/es/fr/pt) строки в ней нет и быть не может: письменность у них — латиница. Аудит немецкого
// развёртывания печатал переведённый файл как дефект «MODULE ABSENT» — ровно тот шум, ради
// которого написан S3. У аудита нет входящего шаблона, поэтому вместо письменности он мерит ФОРМУ
// пропажи: перевод теряет ВСЕ сигнатуры шаблона по построению, повреждённый английский файл —
// часть. Свод судит обе стороны: перевод назван localized, реальная потеря осталась видимой.
console.log(`\n=== S3de (bugs/66 №3): аудит латинского развёртывания — перевод localized, потеря видна ===`);
const S3de = join(ROOT, 's3de'); mkdirSync(S3de); seed(S3de);
must(run, S3de, 'install --lang de --agents claude-code');
writeFileSync(join(S3de, 'PHILOSOPHY.md'), [
  '# PHILOSOPHIE — wie der Agent denkt', '',
  '## Der Kerngedanke', '', 'Einfach heißt richtig. KISS und Ockhams Rasiermesser.', '',
  '## Die Regel beim Feststecken', '', 'Drei Versuche, dann halte an und überdenke die Aufgabe.', '',
].join('\n'));
const tfDePath = join(S3de, 'TESTING_FRAMEWORK.md');
const tfDeMods = splitModules(readFileSync(tfDePath, 'utf8'));
writeFileSync(tfDePath, joinModules(tfDeMods.slice(0, -1)));   // РЕАЛЬНАЯ потеря в EN-файле
const mkDe = readMarker(S3de); mkDe.i18n = 'translated'; writeMarker(S3de, mkDe);
fillCanon(S3de);
writeTask(S3de, []);
r = run(S3de, 'update-verify');
ok(r.code === 0, 'S3de update-verify exit 0', r.out);
ok(!/MODULE ABSENT: PHILOSOPHY\.md/.test(r.out),
   'bugs/66 №3: немецкий перевод НЕ печатается дефектом «MODULE ABSENT»', r.out.slice(-400));
ok(/localized/.test(r.out) && /PHILOSOPHY\.md/.test(r.out),
   'bugs/66 №3: немецкий перевод честно назван localized (письменности нет — судится форма пропажи)', r.out.slice(-400));
ok(/MODULE ABSENT: TESTING_FRAMEWORK\.md/.test(r.out),
   'bugs/66 №3: реальная потеря модуля в EN-файле осталась видимой (честность не куплена слепотой)', r.out.slice(-400));

// ══════════════════ S4: плейсхолдеры — только объявленная сфера ══════════════════
console.log(`\n=== S4: placeholder-гейт — чужая сфера не блокирует, объявленная стережётся (Unlim Г11 · KCam) ===`);
const S4 = join(ROOT, 's4'); mkdirSync(S4); seed(S4);
must(run, S4, 'install --agents claude-code');
const mk4 = readMarker(S4); mk4.sphere = 'programming'; writeMarker(S4, mk4);
fillCanon(S4, { spheres: false });
fill(join(S4, '.kaif', 'spheres', 'programming.md'));    // объявленная сфера заполнена
writeFileSync(join(S4, '.kaif', 'spheres', 'game-design.md'),
  '# Game design sphere\n\nBuild: <BUILD_COMMAND>\n');   // ЧУЖАЯ сфера с литеральным слотом
writeTask(S4, []);
r = run(S4, 'update-verify');
ok(r.code === 0, 'S4 чужая сфера с <BUILD_COMMAND> НЕ блокирует приёмку (библиотеки чужих сфер — справочники)', r.out.slice(-400));
// …а незаполненная ОБЪЯВЛЕННАЯ сфера остаётся красной (KCam: слот в programming.md)
appendFileSync(join(S4, '.kaif', 'spheres', 'programming.md'), '\nBuild: <BUILD_COMMAND>\n');
writeTask(S4, []);
r = run(S4, 'update-verify');
ok(r.code !== 0 && /programming\.md/.test(r.out),
   'S4 литеральный слот в ОБЪЯВЛЕННОЙ сфере — красный (гейт не ослеп)', r.out.slice(-300));

// ══════════════════ S5: warning-guard длины STATUS в check ══════════════════
console.log(`\n=== S5: check предупреждает о разросшемся STATUS (KLAS D9 · Unlim Г10, решение №27) ===`);
const S5 = join(ROOT, 's5'); mkdirSync(S5); seed(S5);
must(run, S5, 'install --agents claude-code');
const longStatus = ['# STATUS', ''];
for (let i = 1; i <= 258; i++) longStatus.push(`- запись ${i}: строка летописи, которой место в PROJECT_HISTORY.`);
writeFileSync(join(S5, 'STATUS.md'), longStatus.join('\n') + '\n');
r = run(S5, 'check');
ok(r.code === 0, 'S5 check exit 0 (страж — warning, не отказ; решение №27)', r.out.slice(-300));
ok(/STATUS\.md: 260 lines/.test(r.out) && /~200/.test(r.out),
   'S5 warning существует: число строк + мягкая цель ~200 (обещание релиза 2.1 стало кодом)', r.out.slice(-300));
writeFileSync(join(S5, 'STATUS.md'), longStatus.slice(0, 150).join('\n') + '\n');
r = run(S5, 'check');
ok(!/lines .*~200|~200 .*lines/.test(r.out), 'S5 короткий STATUS — без предупреждения (тишина по умолчанию)', r.out.slice(-200));

console.log(failures ? `\n❌ s10: ${failures} guard(s) failed` : '\n✅ s10: all green');
process.exit(failures ? 1 : 0);
