// sandboxes3.mjs — песочницы Фазы 5.4: расписка last-update + история маркера ·
// adopt-current (ручная миграция не убивает машинный путь) · diff (аудит и превью) ·
// исполняющие чекпоинты + judge-вердикт + полный update-verify c самоочисткой.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// текущая версия репо — из dist, не из головы (хардкод «1.6» ломал полигон на бампе 2.0)
const CUR = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('receipts', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-350)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
// апстрим 9.9: правка одного static-модуля PHILOSOPHY.md (готовим как в sandboxes2)
const FENCE = '`'.repeat(6);
function editBundleModule(bundleText, filePath, moduleIndex, mutate) {
  const re = new RegExp('(^> \\*\\*FILE: `' + filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
  const m = bundleText.match(re);
  if (!m) throw new Error('block not found: ' + filePath);
  const mods = splitModules(m[2] + '\n');
  mutate(mods[moduleIndex]);
  return bundleText.replace(re, m[1] + joinModules(mods).replace(/\n$/, '') + m[3]);
}
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9'));
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
const SRC2 = join(ROOT, 'src-9.10'); mkdirSync(SRC2);
for (const n of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) cpSync(join(SRC, n), join(SRC2, n));
writeFileSync(join(SRC2, 'kaif-manifest.json'), JSON.stringify({ ...man, version: '9.10' }, null, 2) + '\n');

// ---------------------------------------------------------------- S9: расписка + история
console.log('\n=== S9: last-update.json + marker.history ===');
const S9 = join(ROOT, 's9'); mkdirSync(S9); seed(S9);
must(run, S9, 'install');
let r = run(S9, `update --source ${SRC}`);
ok(r.code === 0, 'S9 update →9.9 exit 0', r.out);
const rc1 = JSON.parse(readFileSync(join(S9, '.kaif', 'last-update.json'), 'utf8'));
ok(rc1.from === CUR && rc1.to === '9.9' && rc1.route === 'core-update' && rc1.date && rc1.counters,
   'S9 расписка: from/to/route/date/counters', JSON.stringify(rc1).slice(0, 200));
// T8 (plans/26 §7, решение владельца №49): штамп квитанции — МОМЕНТ, а не день. Голая дата не
// отвечает, какое из двух обновлений одного дня доказывает эта расписка. Форма — полный
// локальный ISO 8601 со смещением зоны (часы владельца, не UTC: расписку читает человек, чей
// это день). Стережём ФОРМУ, а не конкретное значение — время прогона недетерминировано.
const ISO_MOMENT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
ok(ISO_MOMENT_RE.test(rc1.date || ''),
   'S9 T8: дата расписки — момент (локальный ISO 8601 со смещением), не голый день', `date=${rc1.date}`);
let mk = JSON.parse(readFileSync(join(S9, '.kaif', 'kaif.json'), 'utf8'));
ok(Array.isArray(mk.history) && mk.history.length === 1 && mk.history[0].to === '9.9',
   'S9 история маркера: 1 запись после первого update');
ok(ISO_MOMENT_RE.test(mk.history[0]?.date || ''),
   'S9 T8: дата записи истории — тот же момент-формат (одна конвенция на обе квитанции)',
   `date=${mk.history[0]?.date}`);
// Сознательный сброс задания №1: с bugs/25 update отказывает поверх неотработанного задания;
// этот свод стережёт расписку и историю, дисциплину заданий стережёт s07/T9.
rmSync(join(S9, 'KAIF_UPDATE_TASK.md'), { force: true });
r = run(S9, `update --source ${SRC2}`);
// bugs/61: у ПЕРВОГО update код возврата судился ассертом, у второго — нет, и его падение
// вылезало красным СОСЕДА («история не выросла») с выброшенным выводом. Симметрия восстановлена:
// причина называется первой же строкой, следствие судится следующей.
ok(r.code === 0, 'S9 второй update →9.10 exit 0', r.out);
mk = JSON.parse(readFileSync(join(S9, '.kaif', 'kaif.json'), 'utf8'));
ok(mk.history.length === 2 && mk.history[1].from === '9.9' && mk.history[1].to === '9.10',
   'S9 история растёт: 2 записи после второго update', `code=${r.code} · ${r.out.slice(-500)}`);

// ---------------------------------------------------------------- S10: adopt-current
console.log('\n=== S10: ручная миграция → adopt-current → машинный путь жив ===');
const S10 = join(ROOT, 's10'); mkdirSync(S10); seed(S10);
must(run, S10, 'install');
// «ручная миграция»: владелец руками переписал модуль PHILOSOPHY (тот самый [2]) и весь TESTING_FRAMEWORK
const P10 = join(S10, 'PHILOSOPHY.md');
const p10 = splitModules(readFileSync(P10, 'utf8'));
p10[2].lines.push('', 'MANUAL MIGRATION EDIT — must survive the next update');
writeFileSync(P10, joinModules(p10));
writeFileSync(join(S10, 'TESTING_FRAMEWORK.md'), '# TESTING\n\nFULLY REWRITTEN BY HAND\n');
r = run(S10, 'adopt-current');
ok(r.code === 0 && /2 newly adopted|adopted \(manual change recorded\)/.test(r.out), 'S10 adopt-current отработал', r.out);
const dm10 = JSON.parse(readFileSync(join(S10, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(dm10.kept.includes('PHILOSOPHY.md') && dm10.kept.includes('TESTING_FRAMEWORK.md'),
   'S10 ручные правки усыновлены (kept)');
r = run(S10, `update --source ${SRC}`);
ok(r.code === 0, 'S10 update после adopt-current exit 0', r.out);
const p10txt = readFileSync(P10, 'utf8');
ok(p10txt.includes('MANUAL MIGRATION EDIT'), 'S10 ручная правка НЕ затёрта update-ом');
ok(readFileSync(join(S10, 'TESTING_FRAMEWORK.md'), 'utf8').includes('FULLY REWRITTEN BY HAND'),
   'S10 переписанный файл цел');
const task10 = readFileSync(join(S10, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task10.includes('merge-modules') && /PHILOSOPHY\.md/.test(task10) && task10.includes('```diff'),
   'S10 конфликтный модуль (правка + апстрим) — дифф в задаче');

// ---------------------------------------------------------------- S10c: adopt-current на v1-манифесте (блокер ревью)
console.log('\n=== S10c: adopt-current на v1-манифесте — правки усыновляются ДО пересъёмки sha ===');
const S10c = join(ROOT, 's10c'); mkdirSync(S10c); seed(S10c);
must(run, S10c, 'install');
// деградируем манифест до v1: убираем templateShas/moduleShas/manifestVersion
const dmPath = join(S10c, '.kaif', 'deploy-manifest.json');
const dmv1 = JSON.parse(readFileSync(dmPath, 'utf8'));
delete dmv1.templateShas; delete dmv1.moduleShas; delete dmv1.manifestVersion;
writeFileSync(dmPath, JSON.stringify(dmv1, null, 2) + '\n');
writeFileSync(join(S10c, 'PHILOSOPHY.md'), readFileSync(join(S10c, 'PHILOSOPHY.md'), 'utf8') + '\nMANUAL V1 EDIT\n');
r = run(S10c, 'adopt-current');
ok(r.code === 0, 'S10c adopt-current на v1 exit 0', r.out);
const dm10c = JSON.parse(readFileSync(dmPath, 'utf8'));
ok(dm10c.kept.includes('PHILOSOPHY.md'), 'S10c v1: ручная правка усыновлена (не «противоположное назначению»)');
r = run(S10c, `update --source ${SRC}`);
// Улика команды приложена к ассерту (bugs/61): ассерт судит ПОБОЧНЫЙ ЭФФЕКТ update — содержимое
// файла, — и без вывода самого update его красный не отличить от «update вообще не отработал».
ok(readFileSync(join(S10c, 'PHILOSOPHY.md'), 'utf8').includes('MANUAL V1 EDIT'),
   'S10c v1: следующий update НЕ затёр ручную правку', `update exit=${r.code} · ${r.out.slice(-300)}`);
// bugs/55 F5: здесь стоял ассерт, дизъюнкция которого заканчивалась КОНСТАНТНОЙ ИСТИНОЙ, то есть
// была истинной при любых операндах — движок даже не вычислял проверку. А это ЕДИНСТВЕННОЕ место
// полигона, где `diff` вообще гоняется на
// ПОСТ-АПГРЕЙДНОМ манифесте (s11 — только на чистом v2, s07/T5 — на замороженном v1), и его
// поломка уезжала бы в релиз под зелёным ✅. Прокси заменён наблюдаемым утверждением по образцу
// S11: после `update --source` манифест уже v2, а на диске лежит MANUAL V1 EDIT, значит `diff`
// обязан выйти 0 и НАЗВАТЬ разошедшийся файл. Число снято прогоном (1), не выведено из головы.
r = run(S10c, 'diff');
ok(r.code === 0 && /1 diverged file/.test(r.out) && r.out.includes('≠ PHILOSOPHY.md'),
   'S10c diff после апгрейда манифеста: ровно один разошедшийся файл НАЗВАН', r.out);

// ---------------------------------------------------------------- S11: diff
console.log('\n=== S11: diff — аудит и превью ===');
const S11 = join(ROOT, 's11'); mkdirSync(S11); seed(S11);
must(run, S11, 'install');
const P11 = join(S11, 'PHILOSOPHY.md');
writeFileSync(P11, readFileSync(P11, 'utf8') + '\nLOCAL AUDIT EDIT\n');
r = run(S11, 'diff');
ok(r.code === 0 && /1 diverged file/.test(r.out) && r.out.includes('≠ PHILOSOPHY.md'),
   'S11 аудит: ровно один разошедшийся файл назван', r.out);
r = run(S11, `diff --source ${SRC}`);
ok(r.code === 0 && /diff vs 9\.9/.test(r.out) && /Δ PHILOSOPHY\.md — 1 static module/.test(r.out),
   'S11 превью: апстримная дельта видна по-модульно', r.out);
ok(r.out.split('\n').filter((l) => l.includes('Δ')).length === 1,
   'S11 превью: ровно одна Δ-строка (ложных дельт нет)', r.out);

// ---------------------------------------------------------------- S12: чекпоинты + полный update-verify
console.log('\n=== S12: исполняющие чекпоинты, judge-вердикт, полный update-verify ===');
const S12 = join(ROOT, 's12'); mkdirSync(S12); seed(S12);
must(run, S12, 'install');
r = run(S12, `update --source ${SRC}`);
ok(r.code === 0, 'S12 update exit 0', r.out);
r = run(S12, 'checkpoint judge');
ok(r.code !== 0 && /requires --verdict/.test(r.out), 'S12 judge без вердикта — отказ');
r = run(S12, 'update-verify');
ok(r.code !== 0, 'S12 update-verify до чекпоинтов — красный');
// заполняем плейсхолдеры в каноне (роль адаптации) и раскатываем зеркала штатной командой sync
const PH = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>', '<LICENSE>',
  '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  "<YOUR AGENT'S noreply EMAIL>", '<OWNER_LANGUAGE>'];   // email-слот виден гейту с bug 28
const fill = (p) => { let t = readFileSync(p, 'utf8'); for (const ph of PH) t = t.split(ph).join('X'); writeFileSync(p, t); };
fill(join(S12, 'AGENT_GUIDE.md'));
for (const n of readdirSync(join(S12, '.claude', 'skills'))) {
  const p = join(S12, '.claude', 'skills', n, 'SKILL.md');
  if (existsSync(p)) fill(p);
}
if (existsSync(join(S12, '.kaif', 'spheres'))) for (const n of readdirSync(join(S12, '.kaif', 'spheres')))
  if (n.endsWith('.md')) fill(join(S12, '.kaif', 'spheres', n));
r = run(S12, 'sync');
ok(r.code === 0, 'S12 sync раскатал зеркала из канона', r.out);
const taskIds = [...new Set([...readFileSync(join(S12, 'KAIF_UPDATE_TASK.md'), 'utf8').matchAll(/kaif-core\.mjs checkpoint ([a-z-]+)/g)].map((m) => m[1]))];
ok(!taskIds.includes('for'), 'S12 сканер чекпоинтов не ловит прозу («checkpoint for you»)', taskIds.join(','));
// фиктивный id из прозы должен отвергаться и командой
r = run(S12, 'checkpoint for');
ok(r.code !== 0 && /unknown item id/.test(r.out), 'S12 checkpoint for — отвергнут (якорь на командную форму)');
// L5/bugs/41: пункт project-name обязателен с 2.2 — его чекпоинт ИСПОЛНЯЕТ гейт и отказывает,
// пока канонное имя не записано; честный поток записывает имя командой (иначе тик — самоаттестация)
r = run(S12, 'project-name "S12 Sandbox"');
ok(r.code === 0, 'S12 канонное имя записано командой project-name (новый шаг потока 2.2)', r.out);
// M3 (plans/50, критерий 3, красным-вперёд): задание несёт пункт field-report, а его чекпоинт
// ИСПОЛНЯЕТ проверку файла отчёта в reports/KAIF_UPDATES/ — тик без файла невозможен; файл под
// ЧУЖУЮ версию не засчитывается (пин на версию расписки); с файлом под целевую — записывается.
const t12m3 = readFileSync(join(S12, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(t12m3.includes('- **field-report**'), 'S12-M3 задание update несёт пункт field-report');
r = run(S12, 'checkpoint field-report');
ok(r.code !== 0 && /field-report REFUSED/.test(r.out), 'S12-M3 checkpoint field-report БЕЗ файла — отказ (исполняющий гейт)', r.out);
mkdirSync(join(S12, 'reports', 'KAIF_UPDATES'), { recursive: true });
writeFileSync(join(S12, 'reports', 'KAIF_UPDATES', 'SBX_KAIF_1.0_UPDATE_REPORT.md'), '# Field report: wrong version\n');
r = run(S12, 'checkpoint field-report');
ok(r.code !== 0 && /field-report REFUSED/.test(r.out), 'S12-M3 файл под ЧУЖУЮ версию (1.0) не засчитан — отказ', r.out);
writeFileSync(join(S12, 'reports', 'KAIF_UPDATES', 'SBX_KAIF_9.9_UPDATE_REPORT.md'),
  '# Field report: KAIF update sandbox\n\n## 5. Final state and judge verdict\nVERIFIED\n');
r = run(S12, 'checkpoint field-report');
ok(r.code === 0 && /field report on disk/.test(r.out), 'S12-M3 checkpoint field-report С файлом под 9.9 — записан', r.out);
for (const id of taskIds) {
  const extra = id === 'judge' ? ' --verdict "VERIFIED: sandbox pass, gates observed green"' : '';
  r = run(S12, `checkpoint ${id}${extra}`);
  ok(r.code === 0, `S12 checkpoint ${id} записан${id === 'recheck' ? ' (check исполнен самим чекпоинтом)' : ''}`, r.out);
}
// ремонт judge-дедлока (ревью): тик judge дописан «руками» БЕЗ вердикта → команда с --verdict
// обязана ДОПИСАТЬ вердикт, а не ответить «already recorded» (иначе гейт красный навсегда)
const taskP12 = join(S12, 'KAIF_UPDATE_TASK.md');
const t12 = readFileSync(taskP12, 'utf8');
if (!/^KAIF-UPDATE: judge done$/m.test(t12)) throw new Error('test invariant: judge already ticked');
writeFileSync(taskP12, t12.replace(/^KAIF-UPDATE: judge verdict: [^\n]*\n/m, '')); // симулируем «голый тик»
r = run(S12, 'update-verify');
ok(r.code !== 0 && /judge checkpoint has no verdict/.test(r.out), 'S12c голый judge-тик — гейт красный с внятной командой');
r = run(S12, 'checkpoint judge --verdict "VERIFIED: re-recorded after bare tick"');
ok(r.code === 0 && /verdict recorded for the already-ticked/.test(r.out), 'S12c вердикт ДОПИСАН к уже стоящему тику (дедлок мёртв)');
r = run(S12, 'update-verify');
ok(r.code === 0, 'S12 update-verify зелёный (полный путь)', r.out);
ok(/module audit: \d+ files match/.test(r.out), 'S12 update-verify печатает модульный аудит (предложение A третьего отчёта)', r.out.slice(-300));
ok(!existsSync(join(S12, 'KAIF_UPDATE_TASK.md')) && !existsSync(join(S12, '.kaif', 'install')),
   'S12 самоочистка отработала');
const rc12 = JSON.parse(readFileSync(join(S12, '.kaif', 'last-update.json'), 'utf8'));
ok(rc12.verifiedAt, 'S12 расписка проштампована verifiedAt и пережила самоочистку');
// T8: verifiedAt — третья квитанция машинерии, и она подчиняется той же конвенции момента.
ok(ISO_MOMENT_RE.test(rc12.verifiedAt || ''),
   'S12 T8: verifiedAt — момент (локальный ISO 8601 со смещением)', `verifiedAt=${rc12.verifiedAt}`);

// ------------------------------- S12b: bugs/58 — собственный навык проекта и зеркала многосистемного развёртывания
// `resyncCopies` писала зеркала СЫРЫМ writeFileSync без mkdir, а каталог зеркала заводит только
// `deployAgentSystems` — и только для навыков ИЗ БАНДЛА. Проект, заведший собственный навык (канон
// прямо это предписывает: KAIF_REFERENCE §7.3), получал необработанный ENOENT из `sync`, обоих
// чек-поинтов и ОБОИХ финальных гейтов: установку было НЕЧЕМ закрыть при нормальном дереве.
console.log('\n=== S12b: собственный навык проекта не роняет зеркала и финальный гейт (bugs/58) ===');
const S12b = join(ROOT, 's12b'); mkdirSync(S12b); seed(S12b);
r = run(S12b, 'install');          // дефолт --agents = все пять систем: профиль многосистемный
ok(r.code === 0, 'S12b install (все пять систем) exit 0', r.out.slice(-400));
const OWN = 'my-project-skill';
mkdirSync(join(S12b, '.claude', 'skills', OWN), { recursive: true });
writeFileSync(join(S12b, '.claude', 'skills', OWN, 'SKILL.md'),
  `---\nname: ${OWN}\ndescription: a skill authored by the project itself\n---\n\n# Own skill\n`);
r = run(S12b, 'sync');
ok(r.code === 0 && /re-synced \d+ system skill copies/.test(r.out),
   '🔴 S12b sync с собственным навыком проекта — код 0 и зеркала раскатаны', r.out.slice(-400));
ok(!/ENOENT/.test(r.out), '🔴 S12b sync не выбрасывает сырой ENOENT наружу', r.out.slice(-400));
// зеркало заведено В КАЖДОЙ системе маркера, включая плоскую zoo-code-ветку
for (const [sys, p] of [['codex', `.agents/skills/${OWN}/SKILL.md`], ['grok-build', `.grok/skills/${OWN}/SKILL.md`],
                        ['cline', `.cline/skills/${OWN}/SKILL.md`], ['zoo-code', `.roo/commands/${OWN}.md`]])
  ok(existsSync(join(S12b, p)), `🔴 S12b зеркало собственного навыка заведено для ${sys} (${p})`);
// и главное: финальный гейт ДОХОДИТ до своей диагностики вместо стектрейса Node
r = run(S12b, 'verify-final');
ok(!/ENOENT/.test(r.out) && /verify-final (FAILED|OK)/.test(r.out),
   '🔴 S12b verify-final доходит до собственного вердикта, а не падает стектрейсом', r.out.slice(-400));
// чек-поинт recheck зовёт тот же resyncCopies первым делом — он тоже обязан пережить свой навык
r = run(S12b, 'checkpoint recheck');
ok(!/ENOENT/.test(r.out), '🔴 S12b checkpoint recheck переживает собственный навык проекта', r.out.slice(-400));
// ВТОРАЯ половина фикса bugs/58 — лечение самого семейства 12, а не симптома: отказ, которому
// mkdir помочь НЕ МОЖЕТ, обязан назвать путь и команду восстановления, а не улететь стектрейсом
// Node из финального гейта. Ставим на место зеркала каталог: writeFileSync по нему невозможен.
rmSync(join(S12b, '.agents', 'skills', OWN, 'SKILL.md'), { force: true });
mkdirSync(join(S12b, '.agents', 'skills', OWN, 'SKILL.md'), { recursive: true });
r = run(S12b, 'sync');
ok(r.code === 0 && !/Node\.js v/.test(r.out),
   '🔴 S12b непочинимая запись зеркала НЕ роняет команду сырым стектрейсом', r.out.slice(-400));
ok(new RegExp(`system skill cop\\w+ could not be written[\\s\\S]*\\.agents/skills/${OWN}/SKILL\\.md`).test(r.out)
   && /re-run `node \.kaif\/kaif-core\.mjs sync`/.test(r.out),
   '🔴 S12b отказ называет ПУТЬ и КОМАНДУ восстановления (семейство 12)', r.out.slice(-400));
ok(existsSync(join(S12b, '.grok', 'skills', OWN, 'SKILL.md')),
   'S12b отказ на одном зеркале не отменил остальные', r.out.slice(-300));

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ все песочницы 5.4 зелёные'}`);
process.exit(failures ? 1 : 0);
