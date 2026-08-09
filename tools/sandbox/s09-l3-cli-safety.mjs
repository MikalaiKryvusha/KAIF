// s09-l3-cli-safety.mjs — свод фазы L3 эпика L 2.2 (план 42): «CLI-безопасность и зелёная ложь».
// [TESTED: 2026-08-09 · зелёный в составе полигона — «sandbox suite: all 14 suites green» (npm run test:core)]
// Баг-доки: bugs/33 (голый запуск деструктивен, help не команда, аргументы глотаются),
// bugs/34 (стражи зелёные без конфигурации, счётчики считают намерение, чекпоинты-галочки,
// слепой провенанс), bugs/39 (вердикт судьи только CLI-аргументом).
//
// ⚠️ Дисциплина стражей (EXP-0016/0017): свод написан ДО фиксов и обязан быть КРАСНЫМ на
// текущем коде ровно в помеченных стражах. Предсказания до первого прогона (2026-08-07):
//   G1/G1b КРАСНЫЕ — THE полевой инцидент (KCam Г1, единственная потеря работы за 4 отчёта):
//          голый запуск и same-version `install` ПЕРЕЗАПИСЫВАЮТ незавершённое задание без
//          чекпоинтов (регенерация теряет модульные диффы и новости релиза).
//   G2a/G2b/G2c КРАСНЫЕ — `help`, голый запуск и `--help` не справка: unknown command exit 1
//          или деструктивный install-дефолт (NDim гр.5, Unlim Г4, KCam Г9а).
//   G3 КРАСНЫЙ — `sync --dry-run`: флаг молча игнорируется, гоняется РЕАЛЬНАЯ синхронизация
//          (KCam Г10).
//   G4 КРАСНЫЙ — `diff PHILOSOPHY.md`: позиционный аргумент проглатывается, печатается полный
//          аудит exit 0 (Unlim Г3, KLAS).
//   G5 КРАСНЫЙ — `update --sourse <дир>` (опечатка): флаг молча игнорируется, команда идёт в
//          release-канал вместо отказа с именем флага.
//   G6a/G6b КРАСНЫЕ — canon-lint check/selftest без rules-файла → exit 0 («доказательство…
//          отсутствует, но выглядит как успех» — Unlim Г9, KLAS D4, KCam Г8); ждём SKIPPED/3.
//   G7a КРАСНЫЙ — свежий маркер не сеет "canonArtifacts": [] (мёртвая инструкция
//          /derive-styleguide — Unlim §3.2, KLAS D4 хвост).
//   G7b/G7c КРАСНЫЕ — provenance check и report при ОТСУТСТВУЮЩЕМ ключе canonArtifacts
//          расходятся и оба зелёные (KCam Г7); ждём согласованные SKIPPED/3.
//   G8a/G8b КРАСНЫЕ — локализованные марки [ИИ] из маркера невидимы: report «no AI text
//          awaits» при блоке, ждущем приёмки; check зелёный на утечке в не-канон (Unlim Г8).
//   G9 КРАСНЫЙ — транзиент KAIF_UPDATE_TASK.md с парными марками красит check (Unlim Г7);
//          ждём исключение транзиентов.
//   G10 КРАСНЫЙ — счётчик «N skills trigger-aliased» считает ключи пакета (намерение), а не
//          применённые алиасы: 2 фантомных ключа завышают счёт (KLAS D3: «34» при 23).
//   G11 КРАСНЫЙ — `checkpoint placeholders` ставит галочку при ЛИТЕРАЛЬНОМ плейсхолдере на
//          диске — сканер существует, но не исполняется (KLAS D5, Unlim §2.12-3).
//   G12a/G12b КРАСНЫЕ — `--verdict-file` не существует: многострочный кириллический вердикт
//          невозможно передать по норме «текст через файлы» (Unlim Г12, KCam Г6).
//   G13 КРАСНЫЙ — `checkpoint recheck` не закрывает окно дрейфа зеркал: check только warning,
//          зеркало остаётся протухшим (KCam Г11 + суд.1; решение фазы: recheck зовёт sync).
//   G14 КРАСНЫЙ — `checkpoint stale-claims` не перезапускает существующий сканер — галочка
//          при живых протухших строках без единого слова (KLAS D5).
// Инварианты (зелёные и до, и после): explicit install работает; голый sync синхронизирует;
// голый diff печатает аудит; checkpoint recheck тикается.
//
// Стражи находок судьи фазы (G15–G18): красное доказательство — исполненные репро судейской
// панели L3 (воркфлоу 4 линз, зафиксировано в plans/42): G15 — адаптационное задание с
// чекпоинтами безусловно сносилось bootstrap'ом (unlinkSync без keep/superseded, «CHECKPOINT
// LOST» воспроизведён судьёй дважды); G16 — опечатка ЗНАЧЕНИЯ --channel молча падала в
// release; G17 — aiMarks-не-массив молча ослеплял провенанс над ждущим [ИИ]-блоком;
// G18 — `help install` молча глотал аргумент.
//
// В tools/sandbox-suite.mjs свод вписывается ВМЕСТЕ с фиксами, когда зеленеет.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, appendFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59): каталог с фиксированным именем в общем
// OS-temp — разделяемый ресурс без владельца, и два одновременных прогона сносили его друг у
// друга, давая ЛОЖНЫЙ КРАСНЫЙ в главном гейте проекта. Явный путь аргументом по-прежнему жив.
const ROOT = tempRoot('l3-cli', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const runTool = (cwd, tool, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'tools', tool)} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const readMarker = (dir) => JSON.parse(readFileSync(join(dir, '.kaif', 'kaif.json'), 'utf8'));
const writeMarker = (dir, j) => writeFileSync(join(dir, '.kaif', 'kaif.json'), JSON.stringify(j, null, 2) + '\n');

// ---- апстрим v9.9 (для сценария D1 — update-эра с диффами и протухшей строкой) ----------------
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
// правка целого FILE-блока (для G10 — фантомные ключи в skill-triggers.json)
function editBundleFile(bundleText, filePath, transform) {
  const re = new RegExp('(^> \\*\\*FILE: `' + filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
  const m = bundleText.match(re);
  if (!m) throw new Error('block not found: ' + filePath);
  return bundleText.replace(re, m[1] + transform(m[2]) + m[3]);
}
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (philosophy)'));
// ВНУТРЕННИЙ манифест-блок бандла тоже 9.9: G1b гоняет same-version re-run через install,
// а install берёт версию из блока (не из внешнего манифеста) — рассинхрон читался бы даунгрейдом
bundle = editBundleFile(bundle, 'kaif-bundle-manifest.json', (json) => {
  const m9 = JSON.parse(json); m9.version = '9.9'; return JSON.stringify(m9, null, 2);
});
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
copy(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;

// ================================================================ D0: CLI-безопасность + стражи без конфигурации
console.log('\n=== D0 (bugs/33 + 34): голый запуск, help, вайтлист, SKIPPED-семантика, провенанс ===');
const D0 = join(ROOT, 'd0'); mkdirSync(D0); seed(D0);
let r = run(D0, 'install');
ok(r.code === 0, 'D0 install exit 0 (инвариант: явный install работает)', r.out);
ok(existsSync(join(D0, 'KAIF_ADAPTATION_TASK.md')), 'D0 адаптационное задание создано');

r = run(D0, 'help');
ok(r.code === 0 && r.out.includes('install') && r.out.includes('update') && r.out.includes('checkpoint'),
   'G2a (bugs/33): `help` — команда: exit 0 + список команд', r.out.slice(-200));
const taskD0Before = readFileSync(join(D0, 'KAIF_ADAPTATION_TASK.md'));
r = run(D0, '');
ok(r.code === 0 && !r.out.includes('deployed mechanically') && r.out.includes('update'),
   'G2b (KCam Г1 корень): ГОЛЫЙ запуск — справка, не деструктивный install', r.out.slice(-200));
// existsSync-щит: до фикса голый запуск УНИЧТОЖАЕТ адаптационное задание (bootstrap-ветка
// сносит TASK_FILE) — сверка обязана краснеть, а не ронять свод ENOENT'ом
ok(existsSync(join(D0, 'KAIF_ADAPTATION_TASK.md')) && readFileSync(join(D0, 'KAIF_ADAPTATION_TASK.md')).equals(taskD0Before),
   'G2b: голый запуск не тронул задание ни байтом');
r = run(D0, '--help');
ok(r.code === 0 && r.out.includes('install') && !r.out.includes('deployed mechanically'),
   'G2c (NDim гр.5): `--help` — справка, не install', r.out.slice(-200));

r = run(D0, 'diff PHILOSOPHY.md');
ok(r.code !== 0 && /PHILOSOPHY\.md/.test(r.out),
   'G4 (Unlim Г3/KLAS): `diff <файл>` — отказ с именем аргумента, не молчаливый полный аудит', r.out.slice(-200));
r = run(D0, 'diff');
ok(r.code === 0 && /diff \(audit/.test(r.out), 'G4-инвариант: голый diff печатает аудит как прежде', r.out.slice(-200));

r = run(D0, `update --sourse ${SRC}`);
ok(r.code !== 0 && /sourse/.test(r.out),
   'G5 (bugs/33): опечатка `--sourse` — отказ с именем флага, не молчаливый уход в release-канал', r.out.slice(-250));
r = run(D0, 'update --channel nigthly');
ok(r.code !== 0 && /unknown channel/.test(r.out) && /release/.test(r.out),
   'G16 (судья L3): опечатка ЗНАЧЕНИЯ --channel — отказ со списком каналов, не тихий release', r.out.slice(-250));
r = run(D0, 'help install');
ok(r.code !== 0 && /install/.test(r.out),
   'G18 (судья L3): `help install` — отказ, а не общая справка под видом справки по install', r.out.slice(-250));

// G3: sync --dry-run — до фикса флаг игнорируется и синхронизация РЕАЛЬНАЯ
const MIRROR = join(D0, '.agents', 'skills', 'resume', 'SKILL.md');
writeFileSync(MIRROR, 'JUNK MIRROR CONTENT\n');
r = run(D0, 'sync --dry-run');
ok(r.code !== 0 && /dry-run/.test(r.out), 'G3 (KCam Г10): неизвестный флаг `--dry-run` у sync — отказ', r.out.slice(-200));
ok(readFileSync(MIRROR, 'utf8') === 'JUNK MIRROR CONTENT\n', 'G3: отказ означает НОЛЬ действий — зеркало не синхронизировано');
r = run(D0, 'sync');
ok(r.code === 0 && readFileSync(MIRROR, 'utf8') === readFileSync(join(D0, '.claude', 'skills', 'resume', 'SKILL.md'), 'utf8'),
   'G3-инвариант: голый sync синхронизирует как прежде');

// G6: canon-lint без конфигурации — SKIPPED с кодом 3, не зелёный ноль
r = runTool(D0, 'kaif-canon-lint.mjs', 'check');
ok(r.code === 3 && /SKIPPED/.test(r.out), 'G6a (Unlim Г9/KLAS D4): canon-lint check без rules — SKIPPED, код 3', `code=${r.code} ` + r.out.slice(-200));
r = runTool(D0, 'kaif-canon-lint.mjs', 'selftest');
ok(r.code === 3 && /SKIPPED/.test(r.out), 'G6b (KCam Г8): canon-lint selftest без rules — SKIPPED, код 3', `code=${r.code} ` + r.out.slice(-200));

// G7: провенанс — сеяние ключа + согласованные SKIPPED при его отсутствии
const mk0 = readMarker(D0);
ok(Array.isArray(mk0.canonArtifacts), 'G7a (KLAS D4 хвост): свежий маркер сеет "canonArtifacts": [] — инструкция /derive-styleguide жива');
const mk0NoKey = { ...mk0 }; delete mk0NoKey.canonArtifacts; delete mk0NoKey.aiMarks;
writeMarker(D0, mk0NoKey);
r = runTool(D0, 'kaif-provenance.mjs', 'check');
ok(r.code === 3 && /SKIPPED/.test(r.out), 'G7b (KCam Г7): provenance check БЕЗ ключа canonArtifacts — SKIPPED, код 3', `code=${r.code} ` + r.out.slice(-200));
r = runTool(D0, 'kaif-provenance.mjs', 'report');
ok(r.code === 3 && /SKIPPED/.test(r.out), 'G7c (KCam Г7): report согласован с check — тот же SKIPPED, код 3', `code=${r.code} ` + r.out.slice(-200));
writeMarker(D0, { ...mk0NoKey, canonArtifacts: [] });
r = runTool(D0, 'kaif-provenance.mjs', 'check');
ok(r.code === 0, 'G7-инвариант: объявленный ПУСТЫМ канон — осознанное состояние, check зелёный', `code=${r.code} ` + r.out.slice(-200));

// G8: локализованные марки из маркера развёртывания (Unlim Г8: [ИИ] невидимы)
writeMarker(D0, { ...mk0NoKey, canonArtifacts: ['rules/'], aiMarks: ['[ИИ]', '[ИИ-ред]'] });
mkdirSync(join(D0, 'rules'), { recursive: true });
writeFileSync(join(D0, 'rules', 'canon.md'), '# Канон\n\n[ИИ]Правило, написанное ИИ и ждущее приёмки владельца.[/ИИ]\n');
r = runTool(D0, 'kaif-provenance.mjs', 'report');
ok(r.code === 0 && /rules\/canon\.md/.test(r.out) && /awaiting|ждут|1 block/.test(r.out),
   'G8a (Unlim Г8): report ВИДИТ локализованный блок [ИИ] в каноне (очередь приёмки не пуста)', r.out.slice(-300));
writeFileSync(join(D0, 'leak.md'), '# Утечка\n\n[ИИ]ИИ-текст вне канона.[/ИИ]\n');
r = runTool(D0, 'kaif-provenance.mjs', 'check');
ok(r.code !== 0 && /leak\.md/.test(r.out),
   'G8b: check КРАСЕН на локализованной марке вне канона (марки живут только в canonArtifacts)', r.out.slice(-300));
rmSync(join(D0, 'leak.md'));

// G9: транзиенты машинерии исключены из провенанс-скана (Unlim Г7)
writeFileSync(join(D0, 'KAIF_UPDATE_TASK.md'), '# task\n\nnew in 2.x: the [AI] ... [/AI] convention ships as a gate.\n');
r = runTool(D0, 'kaif-provenance.mjs', 'check');
ok(r.code === 0, 'G9 (Unlim Г7): транзиент KAIF_UPDATE_TASK.md с марками НЕ красит гейт (исключён из скана)', `code=${r.code} ` + r.out.slice(-300));
rmSync(join(D0, 'KAIF_UPDATE_TASK.md'));
// G17: КРИВОЙ aiMarks (строка вместо массива) — громкий отказ, не молчаливое ослепление
writeMarker(D0, { ...mk0NoKey, canonArtifacts: ['rules/'], aiMarks: '[ИИ]' });
r = runTool(D0, 'kaif-provenance.mjs', 'check');
ok(r.code !== 0 && /aiMarks/.test(r.out),
   'G17 (судья L3): malformed aiMarks — отказ с именем ключа (объявленную конвенцию нельзя молча отбросить)', `code=${r.code} ` + r.out.slice(-250));
writeMarker(D0, { ...mk0NoKey, canonArtifacts: ['rules/'], aiMarks: ['[ИИ]', '[ИИ-ред]'] });
// G15 (судья L3, ПОСЛЕДНИМ в D0 — мутирует сценарий): адаптация В ПРОЦЕССЕ (чекпоинты
// записаны) не сносится bootstrap'ом бесследно — превращается в superseded-копию
appendFileSync(join(D0, 'KAIF_ADAPTATION_TASK.md'), 'KAIF-ADAPT: study done\n');
r = run(D0, 'install');
ok(r.code === 0 && existsSync(join(D0, 'KAIF_ADAPTATION_TASK.superseded.md'))
   && readFileSync(join(D0, 'KAIF_ADAPTATION_TASK.superseded.md'), 'utf8').includes('KAIF-ADAPT: study done'),
   'G15 (судья L3): адаптационное задание с чекпоинтами пережило bootstrap superseded-копией (CHECKPOINT LOST мёртв)', r.out.slice(-300));

// ================================================================ G10: счётчик алиасов считает ЗАПИСЬ, не намерение
console.log('\n=== G10 (KLAS D3 + bugs/65 №1): «N skills trigger-aliased» — навыки НА ДИСКЕ, не ключи и не план ===');
const D10 = join(ROOT, 'd10'); mkdirSync(D10);
mkdirSync(join(D10, '.kaif', 'install'), { recursive: true });
let b10 = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
b10 = editBundleFile(b10, 'templates/languages/ru/skill-triggers.json', (json) => {
  const t = JSON.parse(json);
  t['phantom-skill-one'] = 'фантом'; t['phantom-skill-two'] = 'фантом'; // ключи без навыков — намерение без записи
  return JSON.stringify(t, null, 2);
});
writeFileSync(join(D10, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), b10);
copy(join(DIST, 'KAIF-CORE.mjs'), join(D10, '.kaif', 'kaif-core.mjs'));
r = run(D10, 'install --lang ru');
// Ожидание снимается С ДИСКА ПЕСОЧНИЦЫ. Прежде оно бралось из бандла — и это был ПРОКСИ: бандл
// есть ПЛАН установки, он совпадает с диском ровно до первого фильтра между планом и записью.
// Фильтр существует (`--mode anonymous` не пишет навыки, привязанные к origin), и на нём ассерт
// «счётчик == навыки в бандле» зеленел, пока установка печатала 35 при 31 на диске — bugs/65 №1.
// Зашивать число тоже нельзя: «34» было ещё одним незамеченным зеркалом счётчика (план 62/T1).
const aliasedOnDisk = (dir, lang) => {
  const sk = join(dir, '.claude', 'skills');
  if (!existsSync(sk)) return 0;
  return readdirSync(sk).filter((n) => {
    const p = join(sk, n, 'SKILL.md');
    return existsSync(p) && readFileSync(p, 'utf8').includes(`Trigger aliases (${lang}):`);
  }).length;
};
const loggedAliased = (out) => { const m = out.match(/(\d+) skills trigger-aliased/); return m ? Number(m[1]) : null; };
const SKILLS_IN_BUNDLE = (readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8')
  .match(/^> \*\*FILE: `\.claude\/skills\/[^/]+\/SKILL\.md`/gm) || []).length;
const disk10 = aliasedOnDisk(D10, 'ru');
ok(r.code === 0 && disk10 > 0 && loggedAliased(r.out) === disk10,
   `G10: standard — счётчик == ${disk10} навыков С АЛИАСОМ НА ДИСКЕ (2 фантомных ключа пакета в счёт не идут; лог: ${loggedAliased(r.out)})`, r.out.slice(-200));

// G10b/G10c — тот же счётчик в режиме, где план и запись РАСХОДЯТСЯ. Список привязанных к origin
// навыков ВЫЧИСЛЯЕТСЯ из самой машинерии, а не перечисляется здесь: перечень в своде стал бы
// вторым зеркалом, которое некому сверять (класс bugs/49).
const ORIGIN_TIED = ((readFileSync(join(DIST, 'KAIF-CORE.mjs'), 'utf8')
  .match(/^const ORIGIN_TIED = \[([^\]]*)\]/m) || [, ''])[1])
  .split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const tiedAliased = ORIGIN_TIED.filter((n) => {
  const p = join(D10, '.claude', 'skills', n, 'SKILL.md');
  return existsSync(p) && readFileSync(p, 'utf8').includes('Trigger aliases (ru):');
}).length;
const D10a = join(ROOT, 'd10a'); mkdirSync(D10a); seed(D10a);
const rAnon = run(D10a, 'install --lang ru --mode anonymous');
const diskA = aliasedOnDisk(D10a, 'ru');
ok(rAnon.code === 0 && diskA > 0 && loggedAliased(rAnon.out) === diskA,
   `G10b (bugs/65 №1): anonymous — счётчик == ${diskA} навыков на диске (лог: ${loggedAliased(rAnon.out)})`, rAnon.out.slice(-200));
// Ассерт выше не был бы доказательством, если бы диск и бандл совпадали и в анонимном режиме:
// эта строка требует, чтобы разрыв БЫЛ и был равен числу изъятых навыков — иначе прежняя
// зелёная ложь («== навыки в бандле») прошла бы и здесь.
ok(tiedAliased > 0 && SKILLS_IN_BUNDLE > diskA && diskA === disk10 - tiedAliased,
   `G10c (bugs/65 №1): разрыв план↔диск ДОКАЗАН — бандл ${SKILLS_IN_BUNDLE}, диск ${diskA}, изъято ${tiedAliased} (${ORIGIN_TIED.join(',')})`,
   `disk10=${disk10} diskA=${diskA} tied=${tiedAliased}`);

// G10d/G10e — негативный контроль ЗАПИСАН ФИКСТУРОЙ, а не прогоном сессии: свод сам возвращает
// прежнюю, ПЛАНОВУЮ форму счётчика в копию машинерии и требует, чтобы она разошлась с диском.
// Однажды показанный в чате красный умирает вместе с сессией; здесь ось доказывает, что
// различает две формы, на КАЖДОМ прогоне. Мутируется копия внутри песочницы — рабочее дерево
// и dist/ не трогаются вовсе (EXP-0077).
const D10c = join(ROOT, 'd10c'); mkdirSync(D10c); seed(D10c);
const CORE_C = join(D10c, '.kaif', 'kaif-core.mjs');
const coreSrc = readFileSync(CORE_C, 'utf8');
const DISK_SIDE = 'const aliased = countAliasedOnDisk();';
const PLAN_SIDE = 'const aliased = deploy.filter((f) => skillName(f.path) && /Trigger aliases \\(/.test(f.content)).length;';
ok(coreSrc.includes(DISK_SIDE),
   'G10d (bugs/65 №1): машинерия несёт ДИСКОВЫЙ счётчик — иначе мутировать нечего и G10e ничего не доказывает');
writeFileSync(CORE_C, coreSrc.replace(DISK_SIDE, PLAN_SIDE));
const rMut = run(D10c, 'install --lang ru --mode anonymous');
const diskC = aliasedOnDisk(D10c, 'ru');
const logC = loggedAliased(rMut.out);
ok(rMut.code === 0 && logC !== null && diskC > 0 && logC !== diskC,
   `G10e (bugs/65 №1): плановая форма счётчика РАСХОДИТСЯ с диском (лог ${logC} ≠ диск ${diskC}) — ровно то, на чём G10b обязан краснеть`,
   rMut.out.slice(-200));

// ================================================================ D1: update-эра — защита задания, чекпоинты-исполнители, вердикт файлом
console.log('\n=== D1 (bugs/33 Г1 + 34 D5 + 39): задание неприкосновенно, чекпоинты исполняют, вердикт файлом ===');
const D1 = join(ROOT, 'd1'); mkdirSync(D1); seed(D1);
r = run(D1, 'install');
ok(r.code === 0, 'D1 install exit 0', r.out);
// протухшая строка (для пункта stale-claims) + локальная правка в модуле, который меняет 9.9 (диффы в задание)
appendFileSync(join(D1, 'AGENT_GUIDE.md'), `\nThis deployment runs KAIF ${FROM} and its pipeline.\n`);
const P1 = join(D1, 'PHILOSOPHY.md');
const p1 = splitModules(readFileSync(P1, 'utf8').replace(/\r\n/g, '\n'));
p1[2].lines.push('', 'LOCAL EDIT in the same module');
writeFileSync(P1, joinModules(p1));
r = run(D1, `update --source ${SRC} --baseline ${DIST}`);
ok(r.code === 0, 'D1 update →9.9 exit 0', r.out);
const TASK1 = join(D1, 'KAIF_UPDATE_TASK.md');
const task1 = readFileSync(TASK1, 'utf8');
ok(task1.includes('```diff') && /stale-claims/.test(task1) && /checkpoint judge/.test(task1),
   'D1: задание несёт диффы + пункты stale-claims и judge (фикстура полна)');

// G1: THE инцидент KCam Г1 — СТРОГО до первого чекпоинта: защита «not overwritten» не смеет
// зависеть от галочек (поле потеряло ровно ЧЕКПОИНТ-ЛЕССОВОЕ задание)
const taskBytes = readFileSync(TASK1);
r = run(D1, '');
ok(r.code === 0 && existsSync(TASK1) && readFileSync(TASK1).equals(taskBytes),
   'G1 (KCam Г1): ГОЛЫЙ запуск при незавершённом задании БЕЗ чекпоинтов — справка; задание цело байт-в-байт', r.out.slice(-250));
r = run(D1, 'install');
ok(existsSync(TASK1) && readFileSync(TASK1).equals(taskBytes),
   'G1b (KCam Г1): same-version `install` НЕ регенерирует незавершённое задание (диффы = поставка)', r.out.slice(-250));

// G14: тик stale-claims ПЕРЕЗАПУСКАЕТ сканер (видимость, не гейт — «state why» легален)
r = run(D1, 'checkpoint stale-claims');
ok(r.code === 0 && /stale/i.test(r.out) && /scan|assert/i.test(r.out),
   'G14 (KLAS D5): checkpoint stale-claims исполняет сканер и показывает остаток', r.out.slice(-300));

// G11: тик placeholders ОТКАЗЫВАЕТ при литеральном плейсхолдере на диске
r = run(D1, 'checkpoint placeholders');
ok(r.code !== 0 && /placeholder/.test(r.out),
   'G11 (Unlim §2.12-3): checkpoint placeholders ОТКАЗАН — сканер исполнен, слоты не заполнены', r.out.slice(-300));

// G12: вердикт судьи файлом — норма «текст через файлы» в собственном API
const VF = join(D1, '.kaif', 'install', 'verdict.md');
writeFileSync(VF, '﻿ВЕРДИКТ: ПОДТВЕРЖДЕНО — «полигон зелёный», стражи наблюдались красными → зелёными\nВторая строка улик: 8/8 сводов · реестр пар 6/6.\n');
r = run(D1, `checkpoint judge --verdict-file ${VF}`);
ok(r.code === 0, 'G12a (bugs/39): checkpoint judge --verdict-file принят (кириллица, ёлочки, BOM, многострочник)', r.out.slice(-250));
const task1b = readFileSync(TASK1, 'utf8');
ok(/^KAIF-UPDATE: judge verdict: ВЕРДИКТ: ПОДТВЕРЖДЕНО/m.test(task1b),
   'G12a: первая строка вердикта легла чекпоинт-строкой в задание');
const rec1 = JSON.parse(readFileSync(join(D1, '.kaif', 'last-update.json'), 'utf8'));
ok(String(rec1.judgeVerdict || '').includes('Вторая строка улик'),
   'G12b (решение №42): ПОЛНЫЙ вердикт уехал в коммитимую квитанцию');

// G19 (bugs/75): КАНОНИЧЕСКОЕ ИМЯ ПРОЕКТА — тоже человеческий текст, и до фикса оно ехало через
// argv без прикрытия. У соседа по классу (`checkpoint --verdict`) были и предупреждение, и
// файловый вариант; у `project-name` — ни того, ни другого, при том что её собственная справка
// называет значение владельческим. Искажённое имя здесь не теряется, а ЗАПИСЫВАЕТСЯ: в маркер, в
// карту подстановок и во всё, что из неё засеяно. Свод судит ОБЕ стороны класса.
console.log('\n=== G19 (bugs/75): имя проекта — человеческий текст, у него есть файловый носитель ===');
// (а) не-ASCII в argv ПРЕДУПРЕЖДАЕТ (но не отвергает: ASCII-поток поля остаётся рабочим).
// Кириллица идёт в дочерний процесс через ФАЙЛ-обёртку своего же теста? Нет — здесь она ОБЯЗАНА
// пройти argv, потому что проверяется ровно argv-путь; строка живёт в ТЕЛЕ этого свода, не в его
// собственных аргументах (правило про argv связывает вызывающего, и вызывающий здесь — свод).
const CYR_NAME = 'Йолден КАИФ';
r = run(D1, `project-name "${CYR_NAME}"`);
ok(r.code === 0 && /non-ASCII text in the name argument/.test(r.out),
   'G19a: не-ASCII имя в argv ПРЕДУПРЕЖДАЕТ вслух и не отвергается', r.out.slice(-250));
// (б) файловый носитель доезжает ПОБАЙТНО — то, ради чего правило и существует.
const NF = join(D1, '.kaif', 'install', 'name.txt');
writeFileSync(NF, '﻿Йолден КАИФ\n');          // с BOM: путь обязан быть BOM-терпимым
r = run(D1, `project-name --name-file ${NF}`);
const marker14 = JSON.parse(readFileSync(join(D1, '.kaif', 'kaif.json'), 'utf8'));
ok(r.code === 0 && marker14.projectName === CYR_NAME,
   'G19b: --name-file довёз имя ПОБАЙТНО (BOM снят, значение в маркере совпало)', `в маркере: ${marker14.projectName}`);
ok(!/non-ASCII text in the name argument/.test(r.out),
   'G19c: файловый путь НЕ предупреждает — предупреждать не о чем, текст ехал файлом');
// (в) два источника одной истины — отказ: расхождение между ними и есть класс дрейфа.
r = run(D1, `project-name "${CYR_NAME}" --name-file ${NF}`);
ok(r.code !== 0 && /not both/.test(r.out),
   'G19d: argv и --name-file вместе — отказ (два источника одной истины расходятся)', r.out.slice(-200));

// G13: recheck закрывает окно дрейфа зеркал (KCam Г11: решение фазы — recheck зовёт sync)
const MIR1 = join(D1, '.agents', 'skills', 'resume', 'SKILL.md');
writeFileSync(MIR1, 'JUNK MIRROR CONTENT\n');
r = run(D1, 'checkpoint recheck');
ok(r.code === 0 && readFileSync(MIR1, 'utf8') === readFileSync(join(D1, '.claude', 'skills', 'resume', 'SKILL.md'), 'utf8'),
   'G13 (KCam Г11): checkpoint recheck сперва синхронизирует зеркала, потом гоняет check', r.out.slice(-250));

// ── G20: у репозитория ОДИН коммит-маршрут — тот, на котором стоит гейт (круг R2) ──────────
//
// Гейт неожиданного файла живёт ВНУТРИ `tools/commit.mjs`: новый файл в дереве останавливает
// подметающий прогон и называет себя. Но навык `/pause` предписывал дословно
// `git add -A && git commit …` — то есть ВТОРОЙ маршрут, где гейта нет вовсе. На нём полевой
// инцидент `bugs/79` (два файла владельца уехали в origin под сообщением агента через минуту
// после того, как он положил их в дерево) воспроизводится один в один. Хуже места не придумать:
// парковка зовётся чаще закрытия и всегда в спешке.
//
// Примета узкая и по существу: подметающая СТАНОВКА в исполняемой строке навыка обвязки.
// Разговор О правиле законен — канон обязан называть дефектную форму, чтобы её узнавали, —
// поэтому строки с обратными кавычками вокруг всей команды и строки-запреты не считаются.
{
  const skillsDir = join(REPO, '.claude', 'skills');
  const offenders = [];
  for (const name of readdirSync(skillsDir)) {
    const f = join(skillsDir, name, 'SKILL.md');
    if (!existsSync(f)) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (!/git\s+add\s+-A/.test(line)) return;
      if (/ЗАПРЕЩЁН|запрещ|никогда|never|forbidden/i.test(line)) return;  // это ЗАПРЕТ, а не предписание
      offenders.push(`${name}/SKILL.md:${i + 1}`);
    });
  }
  ok(offenders.length === 0,
     'G20: ни один навык обвязки не предписывает подметающий `git add -A` в обход гейта (bugs/79)',
     offenders.join(', '));
  // Негативный контроль: примета обязана СРАБАТЫВАТЬ — иначе зелёный ничего не значит.
  const probe = 'сделай коммит: git add -A && git commit -m "wip"';
  ok(/git\s+add\s+-A/.test(probe) && !/ЗАПРЕЩЁН/.test(probe),
     'G20 контроль: примета опознаёт предписывающую строку (проверка умеет краснеть)');
}

// G21: у парковки есть законный ход ВНУТРИ гейта — локальный коммит без пуша.
ok(readFileSync(join(REPO, 'tools', 'commit.mjs'), 'utf8').includes("'--no-push'"),
   'G21: `commit.mjs` несёт `--no-push` — парковке не нужно обходить инструмент ради «без пуша»');

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ s09: все стражи зелёные'}`);
process.exit(failures ? 1 : 0);
