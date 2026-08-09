// s08-l2-faces.mjs — свод фазы L2 эпика L 2.2 (план 41): «класс перевода и настоящие диффы
// [TESTED: 2026-08-09 · зелёный в составе полигона — «sandbox suite: all 14 suites green» (npm run test:core)]
// задания» — три полевых лица обновления 2.1 (NDim / KLAS / KrinikCam) + frontmatter-мерж.
// Баг-доки: bugs/31 (вставка EN-модулей в переведённые файлы), bugs/32 (диффы задания не от
// предыдущего релиза), bugs/43 (мерж модулей не трогает frontmatter).
//
// ⚠️ Дисциплина стражей (EXP-0016/0017): свод написан ДО фиксов и обязан быть КРАСНЫМ на
// текущем коде ровно в помеченных стражах. Предсказания до первого прогона (2026-08-07);
// ФАКТ первого красного прогона — 12 ❌ (поимённая сверка судьёй фазы: F3c оказался ЗЕЛЁНЫМ
// до фикса — файл попадал в задание через листинг merge-modules, страж остаётся как инвариант
// листинга; F1c — КРАСНЫМ, в исходных предсказаниях не назван; счёт 12 совпал):
//   F1a/F1b/F1c КРАСНЫЕ — pause (i18n=translated, шаблон БЕЗ дельты) получает EN-вставки,
//           лживый лог «merged N module(s)» и ложный пункт задания: кириллица в теле
//           EN-шаблона pause ослепляет и сеть translatedWholesale, и file-level
//           localizedAgainst (bugs/31, причина 3; NDim гр.1).
//   F2a КРАСНЫЙ — для wholesale-файла PHILOSOPHY с РЕАЛЬНОЙ дельтой шаблона задание не несёт
//           ни одного диффа (KLAS D12: «Module diffs» пуст; Unliminium Г1).
//   F2b КРАСНЫЙ — wholesale-файл BUG_FIXING_FRAMEWORK.md БЕЗ дельты шаблона числится в
//           merge-diverged (пустой пункт; bugs/32: 35 % пунктов KCam пустые).
//   F3a КРАСНЫЙ — перевод с 2 выжившими сигнатурами из 21 (KISS/DRY — термины не переводят)
//           пролетает мимо сети (абсолютный порог ≤1) → ~19 EN-вставок (KLAS D1).
//   F3b КРАСНЫЙ — маркер без ключа i18n не получает «translated» автоматически (KLAS D2).
//   F4a КРАСНЫЙ — kaif-remove переведён целиком, но кириллица в теле EN-шаблона ослепляет
//           сеть → EN-модули вставлены рядом с русскими (KCam Г2).
//   F4b КРАСНЫЙ — `check` зелёный на «двухголовом» SKILL.md (>1 H1; критерий эпика №2).
//   F5a КРАСНЫЙ при ЗЕЛЁНОМ F5b — легаси-bootstrap с дрейфом алиас-хвоста: тело навыка
//           перемержено (F5b), а description остался старым (bugs/43, KCam — /dayloop).
//
// ИЗОЛИРУЮЩИЕ стражи (находка судьи фазы: эшелонированная защита маскирует поломку ОДНОГО
// слоя — каждый слой фикса обязан иметь стража, краснеющего при его одиночном реверсе):
//   F3d — порог-доля сети: с абсолютным потолком «≤1» задание перестаёт называть PHILOSOPHY
//         «translated wholesale» (сеть промахивается — прочие слои дожимают, но факт сети
//         виден только здесь).
//   F6a/F6b — телесный тест перевода (bodyLocalized): навык с RU-правкой тела под флагом НЕ
//         обновляется на диске (дифф — в задание); слепой whole-file тест (алиасы с обеих
//         сторон) провёл бы механический мерж.
//   F7a/F7b — гейт вставки: модуль, УДАЛЁННЫЙ владельцем (шаблон его не менял), не
//         воскрешается; соседняя апстрим-правка при этом мержится.
//   F8a/F8b — новый файл релиза × существующий файл владельца: владельческий цел, задание
//         несёт пункт «(new file in this release)» с полным '+'-диффом шаблона.
//   F4c — двухголовый КОРНЕВОЙ док (повреждение KLAS) виден check'ом (детектор расширен
//         с навыков на все не-owner .md поставки).
// Доказательство «красный на сломанном» для изоляторов: env KAIF_SBX_CORE=<путь к ядру с
// одним реверснутым слоем> подменяет ядро в seed(); прогоны зафиксированы в plans/41.
//
// В tools/sandbox-suite.mjs свод вписывается ВМЕСТЕ с фиксами, когда зеленеет.
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync, existsSync, appendFileSync } from 'node:fs';
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
const ROOT = tempRoot('l2-faces', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const modText = (m) => m.lines.join('\n');
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
// KAIF_SBX_CORE — подмена ядра для доказательств «красный на сломанном» (судья L2): свод
// гоняется против ядра с одним реверснутым слоем фикса и обязан краснеть в своём изоляторе.
const CORE_OVERRIDE = process.env.KAIF_SBX_CORE || null;
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(CORE_OVERRIDE || join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const copy = (a, b) => writeFileSync(b, readFileSync(a));

// «Перевод целиком» полевого образца: заголовки и тела — русские, frontmatter/преамбула и
// явно перечисленные модули (keep) — байт в байт. Возвращает переведённые EN-сигнатуры:
// ни одна из них не имеет права ВЕРНУТЬСЯ в файл после обновления (появление = вставка).
function translateWholesale(path, { keep = [], h1 = '# Перевод — документ' } = {}) {
  const txt = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const mods = splitModules(txt);
  const out = [];
  const enSigs = [];
  let i = 0;
  for (const m of mods) {
    if (m.signature === '<preamble>' || keep.includes(m.signature)) { out.push(modText(m)); continue; }
    i++;
    enSigs.push(m.signature);
    const level = (m.signature.match(/^#+/) || ['##'])[0];
    const head = level === '#' ? h1 : `${level} Раздел ${i} — по-русски`;
    out.push(`${head}\n\nРусское содержание раздела ${i} — перевод владельца.`);
  }
  writeFileSync(path, out.join('\n') + '\n');
  return enSigs;
}
const hasAnySig = (path, sigs) => {
  const t = readFileSync(path, 'utf8');
  return sigs.filter((s) => t.includes(s));
};

// ---- апстрим v9.9: правки модулей внутри блоков бандла (приём s02/s07) ------------------------
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
// дельта апстрима: PHILOSOPHY (для F2a/F3c), kaif-remove (для F4a — дельта нужна, чтобы файл не
// отсеялся фильтром нулевой дельты), what-next: description + тело (для F5 — противоречие
// «тело перемержено, description старый»). pause и BUG_FIXING_FRAMEWORK НЕ трогаем — нулевая дельта.
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (philosophy)'));
bundle = editBundleModule(bundle, '.claude/skills/kaif-remove/SKILL.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (kaif-remove)'));
bundle = editBundleModule(bundle, '.claude/skills/what-next/SKILL.md', 0, (m) => {
  m.lines = m.lines.map((l) => l.startsWith('description:') ? l.replace(/\s*$/, '') + ' UPDATED DESCRIPTION 9.9 (what-next).' : l);
});
bundle = editBundleModule(bundle, '.claude/skills/what-next/SKILL.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (what-next body)'));
// изоляторы F6/F7: правки для навыка с RU-телом под флагом и для файла с владельческим удалением
bundle = editBundleModule(bundle, '.claude/skills/check-backlog/SKILL.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (check-backlog)'));
bundle = editBundleModule(bundle, 'AGENT_GUIDE.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (agent-guide)'));
// изолятор F8: НОВЫЙ файл релиза (в прошлом релизе его не было)
bundle += `\n> **FILE: \`NEW_DOC_9.9.md\`**\n\n${FENCE}\n# New doc shipped in 9.9\n\nUPSTREAM NEW FILE CONTENT 9.9.\n${FENCE}\n`;
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
copy(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');

// ================================================================ A: лица NDim + KLAS-D12 (i18n: translated)
console.log('\n=== A (NDim/Unlim): i18n=translated — нулевая дельта не трогается, реальная дельта приходит диффом ===');
const A = join(ROOT, 'a'); mkdirSync(A); seed(A);
let r = run(A, 'install --lang ru');
ok(r.code === 0, 'A install --lang ru exit 0', r.out);
const mkA = JSON.parse(readFileSync(join(A, '.kaif', 'kaif.json'), 'utf8'));
mkA.i18n = 'translated';
writeFileSync(join(A, '.kaif', 'kaif.json'), JSON.stringify(mkA, null, 2) + '\n');
const PAUSE = join(A, '.claude/skills/pause/SKILL.md');
const pauseSigs = translateWholesale(PAUSE, { h1: '# /pause — мягкая парковка' });
const pauseSize = statSync(PAUSE).size;
const philASigs = translateWholesale(join(A, 'PHILOSOPHY.md'), { h1: '# Философия проекта' });
const bffSigs = translateWholesale(join(A, 'BUG_FIXING_FRAMEWORK.md'), { h1: '# Как здесь чинят дефекты' });
// F6-фикстура (изолятор bodyLocalized): НАВЫК с русской правкой ТЕЛА при целых EN-заголовках —
// слепой whole-file тест видит алиасы с обеих сторон и считает файл «не переводом»
const CBA = join(A, '.claude/skills/check-backlog/SKILL.md');
const cbaMods = splitModules(readFileSync(CBA, 'utf8').replace(/\r\n/g, '\n'));
cbaMods[2].lines.push('', 'Русская локальная правка тела навыка — файл несёт письменность владельца.');
writeFileSync(CBA, cbaMods.map(modText).join('\n') + '\n');
r = run(A, `update --source ${SRC} --baseline ${DIST}`);
ok(r.code === 0, 'A update →9.9 exit 0', r.out);
const pauseBack = hasAnySig(PAUSE, pauseSigs);
ok(pauseBack.length === 0, `F1a (bugs/31): в переведённый pause не вставлен ни один EN-модуль (вернулось: ${pauseBack.length})`, pauseBack.join(' · '));
ok(statSync(PAUSE).size <= pauseSize * 1.3, `F1a: pause не разбух (${pauseSize} → ${statSync(PAUSE).size} байт)`);
ok(!/merged \d+ module\(s\) into \.claude\/skills\/pause/.test(r.out), 'F1b (NDim гр.1): лог не рапортует «merged» на переведённом файле с нулевой дельтой');
const taskA = readFileSync(join(A, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(!taskA.includes('.claude/skills/pause/SKILL.md'), 'F1c (bugs/32): файл с НУЛЕВОЙ дельтой шаблона не появляется в задании вовсе');
ok(/### PHILOSOPHY\.md/.test(taskA) && taskA.includes('+ UPSTREAM ADDITION 9.9 (philosophy)'),
   'F2a (KLAS D12): wholesale-файл с реальной дельтой получает НАСТОЯЩИЙ дифф шаблонов в задании');
ok(!taskA.includes('BUG_FIXING_FRAMEWORK.md'), 'F2b (bugs/32): wholesale-файл без дельты шаблона не числится в merge-diverged');
const philABack = hasAnySig(join(A, 'PHILOSOPHY.md'), philASigs);
ok(philABack.length === 0 && !readFileSync(join(A, 'PHILOSOPHY.md'), 'utf8').includes('UPSTREAM ADDITION'),
   'F2c: переведённая PHILOSOPHY на диске не тронута (ни вставок, ни молчаливого мержа)');
const cbaTxt = readFileSync(CBA, 'utf8');
ok(!cbaTxt.includes('UPSTREAM ADDITION 9.9 (check-backlog)') && cbaTxt.includes('Русская локальная правка'),
   'F6a (изолятор bodyLocalized): навык с RU-телом под флагом НЕ обновлён на диске (телесный тест, не whole-file)');
ok(taskA.includes('+ UPSTREAM ADDITION 9.9 (check-backlog)'),
   'F6b: апстрим-правка этого навыка приходит диффом в задание');

// ================================================================ B: лица KLAS-D1/D2 + KCam Г2 (без ключа i18n)
console.log('\n=== B (KLAS/KCam): выжившие термины и кириллица в теле EN-шаблона не ломают защиту ===');
const B = join(ROOT, 'b'); mkdirSync(B); seed(B);
r = run(B, 'install --lang ru');
ok(r.code === 0, 'B install --lang ru exit 0', r.out);
const PHIL_B = join(B, 'PHILOSOPHY.md');
const philBMods = splitModules(readFileSync(PHIL_B, 'utf8').replace(/\r\n/g, '\n'));
// KLAS D1: реальный перевод оставляет ТЕРМИНЫ — выживают ровно 2 сигнатуры из 21 (KISS и DRY)
const keepB = [philBMods[3].signature, philBMods[10].signature];
const philBSigs = translateWholesale(PHIL_B, { keep: keepB, h1: '# Философия' });
const philBSize = statSync(PHIL_B).size;
const KR = join(B, '.claude/skills/kaif-remove/SKILL.md');
const krSigs = translateWholesale(KR, { h1: '# /kaif-remove — уважительное удаление' });
// F7-фикстура (изолятор гейта вставки): владелец УДАЛИЛ модуль из AGENT_GUIDE (шаблон этого
// модуля апстрим не менял) — обновление не должно воскресить удалённое
const AGB = join(B, 'AGENT_GUIDE.md');
const agbMods = splitModules(readFileSync(AGB, 'utf8').replace(/\r\n/g, '\n'));
const deletedSig = agbMods[3].signature;
writeFileSync(AGB, agbMods.filter((_, i) => i !== 3).map(modText).join('\n') + '\n');
// F8-фикстура: у владельца УЖЕ есть файл с именем нового файла релиза
writeFileSync(join(B, 'NEW_DOC_9.9.md'), '# Мой собственный документ\n\nВладельческий контент — обязан пережить обновление.\n');
// --baseline указывает в пустоту НАМЕРЕННО: полигон офлайн-детерминирован, а сценарий B
// проверяет ЧЕСТНУЮ ДЕГРАДАЦИЮ — дельта шаблонов детектится по sha из манифеста и без текстов.
r = run(B, `update --source ${SRC} --baseline ${join(ROOT, 'no-baseline-here')}`);
ok(r.code === 0, 'B update →9.9 exit 0 (baseline недостижим — путь честной деградации)', r.out);
const philBBack = hasAnySig(PHIL_B, philBSigs);
ok(philBBack.length === 0, `F3a (KLAS D1): 2 выживших сигнатуры из 21 — сеть распознала перевод, EN-вставок нет (вернулось: ${philBBack.length})`, philBBack.slice(0, 3).join(' · '));
ok(statSync(PHIL_B).size <= philBSize * 1.4, `F3a: PHILOSOPHY не разбухла (${philBSize} → ${statSync(PHIL_B).size} байт)`);
ok(hasAnySig(PHIL_B, keepB).length === 2, 'F3a: выжившие EN-термины (KISS/DRY) целы');
const mkB = JSON.parse(readFileSync(join(B, '.kaif', 'kaif.json'), 'utf8'));
ok(String(mkB.i18n || '').toLowerCase() === 'translated', 'F3b (KLAS D2): маркер БЕЗ ключа i18n получил «translated» автоматически (language=ru + сеть сработала)');
const taskB = readFileSync(join(B, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(taskB.includes('PHILOSOPHY.md'), 'F3c (bugs/32): замороженный сетью файл с реальной дельтой шаблона ЧИСЛИТСЯ в задании (не потерян молча)');
ok(/PHILOSOPHY\.md \(translated wholesale/.test(taskB),
   'F3d (изолятор порога-доли): задание называет PHILOSOPHY «translated wholesale» — сеть сработала на 2 выживших из 21');
const krBack = hasAnySig(KR, krSigs);
ok(krBack.length === 0, `F4a (KCam Г2): kaif-remove переведён целиком — EN-модули не вставлены (вернулось: ${krBack.length})`, krBack.slice(0, 3).join(' · '));
ok(readFileSync(KR, 'utf8').includes('Русское содержание'), 'F4a: русский текст владельца в kaif-remove цел');
// F7: удалённое владельцем не воскресло, соседняя апстрим-правка влилась
const agbTxt = readFileSync(AGB, 'utf8');
ok(!agbTxt.includes(deletedSig), `F7a (изолятор гейта вставки): удалённый владельцем модуль не воскрешён («${deletedSig.slice(0, 60)}»)`);
ok(agbTxt.includes('UPSTREAM ADDITION 9.9 (agent-guide)'), 'F7b: соседняя апстрим-правка AGENT_GUIDE влита механически (мерж жив)');
// F8: коллизия нового файла релиза с владельческим
const ndTxt = readFileSync(join(B, 'NEW_DOC_9.9.md'), 'utf8');
ok(ndTxt.includes('Владельческий контент') && !ndTxt.includes('UPSTREAM NEW FILE CONTENT'),
   'F8a: владельческий файл с именем нового файла релиза цел (не перезаписан)');
ok(/### NEW_DOC_9\.9\.md/.test(taskB) && taskB.includes('(new file in this release)') && taskB.includes('+ UPSTREAM NEW FILE CONTENT 9.9.'),
   'F8b: задание несёт пункт «(new file in this release)» с полным «+»-диффом шаблона (не пустой пункт)');
// F4b/F4c: «двухголовые» файлы — check обязан краснеть (детектор >1 H1; критерий эпика №2);
// F4c — КОРНЕВОЙ док (повреждение KLAS: два документа в одной PHILOSOPHY) — находка судьи L2
appendFileSync(join(B, '.claude/skills/report-bug/SKILL.md'), '\n# /report-bug — duplicate English head\n\nEnglish procedure inserted by a broken merge.\n');
r = run(B, 'check');
ok(r.code !== 0 && /report-bug/.test(r.out), 'F4b: check КРАСЕН на двухголовом SKILL.md и называет файл', r.out.slice(-200));
appendFileSync(join(B, 'PHILOSOPHY.md'), '\n# Duplicate English head (root doc)\n\nSecond document left by a broken merge.\n');
r = run(B, 'check');
ok(r.code !== 0 && /two-headed document[^\n]*PHILOSOPHY\.md/.test(r.out),
   'F4c: check КРАСЕН и на двухголовом КОРНЕВОМ доке (детектор не ограничен навыками)', r.out.slice(-300));

// ================================================================ C: лицо KCam Г12 (bugs/43) — frontmatter при легаси-bootstrap
console.log('\n=== C (KCam, bugs/43): дрейф алиас-хвоста — description обновляется вместе с телом ===');
const C = join(ROOT, 'c'); mkdirSync(C); seed(C);
r = run(C, 'install --lang ru');
ok(r.code === 0, 'C install --lang ru exit 0', r.out);
const WN = join(C, '.claude/skills/what-next/SKILL.md');
// полевое состояние: алиас-хвост на диске отличается от того, что построит синтетический
// baseline (пакет прошлой версии ≠ пакет текущей) — преамбула «вечно diverged»
writeFileSync(WN, readFileSync(WN, 'utf8').replace(/Trigger aliases \(ru\): [^\n]*/, 'Trigger aliases (ru): что-дальше, старый-набор-алиасов'));
rmSync(join(C, '.kaif', 'deploy-manifest.json'), { force: true });   // до-2.0 развёртывание: снапшотов нет
copy(join(SRC, 'KAIF-CORE-BUNDLE.md'), join(C, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
copy(join(SRC, 'KAIF-CORE.mjs'), join(C, '.kaif', 'kaif-core.mjs'));
r = run(C, `install --baseline ${DIST}`);
ok(r.code === 0, 'C легаси-bootstrap 9.9 с --baseline exit 0', r.out);
const wnTxt = readFileSync(WN, 'utf8');
ok(wnTxt.includes('UPSTREAM ADDITION 9.9 (what-next body)'), 'F5b: тело навыка перемержено механически (контраст к F5a)');
ok(wnTxt.includes('UPDATED DESCRIPTION 9.9 (what-next)'), 'F5a (bugs/43): description обновлён вместе с телом — файл не противоречит сам себе');
ok(/Trigger aliases \(ru\): /.test(wnTxt), 'F5c: алиас-хвост описания жив (локализация не затёрта обновлением)');

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ s08: все стражи зелёные'}`);
process.exit(failures ? 1 : 0);
