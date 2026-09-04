// s18-update-symmetries.mjs — свод эпика US 2.5 «Симметрии обновления» (plans/86; issues #27,
// [NOT-TESTED] — свод написан ДО фиксов (EXP-0016/0017): на HEAD-ядре 9c2fe5e он ОБЯЗАН быть
// КРАСНЫМ ровно в стражах, названных ниже; в tools/sandbox-suite.mjs вписывается ВМЕСТЕ с фиксами,
// когда зеленеет (шаг US6 плана).
// #28 §2 R1–R5, #31, #32 R-A–R-D, KAGO R2; входы — researches/23 §2а, researches/24 §2).
//
// Предсказания до первого прогона (2026-09-04, сессия 49):
//   U1 (P2 — #27 R1b + KAGO R2) КРАСНЫЙ — baseline старой версии БЕЗ молитвы (v1-манифест +
//        --baseline), H1-модуль диверджен локальной правкой, апстрим 9.9 несёт модуль молитвы →
//        в дерево приезжает `KAIF:PRAYER:END` без `KAIF:PRAYER:BEGIN` (маркер BEGIN живёт в
//        неприменённом H1-модуле). Страж: каждая пара маркеров KAIF:X сбалансирована.
//   U2 (P1 — #27 R1, печать решения) КРАСНЫЙ — лог update не печатает вердикт по файлу-кандидату
//        с числами: `<файл>: baseFound N of M, ceiling K → frozen|merged`.
//   U3 (P1 — детерминизм) ЗЕЛЁНЫЙ ПО ПОСТРОЕНИЮ на HEAD — страж регрессии: два `diff --source`
//        по одной копии печатают одно и то же (красное доказательство — мутант в US3).
//   U4 (#31) КРАСНЫЙ — дерево без клеймов старой версии → пункта `stale-claims` в задании нет
//        вовсе; после фикса пункт есть с телом `no lines found`.
//   U5 (срез U2, п. 4 plans/73) КРАСНЫЙ — пин старой версии в `package.json` scripts не попадает в
//        `stale-claims` (walk сканирует только *.md).
//   U6 (P3 / #32 R-C, срез U2 п. 2) КРАСНЫЙ ×2 — language: ru, апстрим привёз НОВЫЙ навык
//        по-английски → задание молчит (нет пункта `language-arrivals`), `check` не печатает
//        `language mix`.
//   U7 (H10) КРАСНЫЙ — LF-файл с ОДНОЙ CRLF-строкой после механической замены становится CRLF
//        целиком (`writeMatchingEol` судит по наличию, не по доминированию).
//   U8 (срез U2, п. 1 plans/73) КРАСНЫЙ — пункт задания о wholesale-файле не даёт ГОТОВОЙ команды
//        диффа (`kaif-core.mjs diff --source …`).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../lib/temp-root.mjs';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59): mkdtemp через tempRoot, явный путь — аргументом.
const ROOT = tempRoot('symmetries', process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-400)));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = (cwd, args) => {
  try { return { code: 0, out: execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const FENCE = '`'.repeat(6);
const blockRe = (filePath) => new RegExp('(^> \\*\\*FILE: `' + filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
  '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
// Правка ОДНОГО модуля внутри блока бандла — тот же приём, что в s02/s07.
function editBundleModule(bundleText, filePath, pick, mutate) {
  const m = bundleText.match(blockRe(filePath));
  if (!m) throw new Error('block not found: ' + filePath);
  const mods = splitModules(m[2] + '\n');
  const idx = typeof pick === 'number' ? pick : mods.findIndex((x) => pick.test(x.signature));
  if (idx < 0) throw new Error('module not found in ' + filePath);
  mutate(mods[idx]);
  return bundleText.replace(blockRe(filePath), m[1] + joinModules(mods).replace(/\n$/, '') + m[3]);
}
// Замена ВСЕГО текста блока бандла (для baseline-бандла «старой» версии без молитвы).
function replaceBundleBlock(bundleText, filePath, transform) {
  const m = bundleText.match(blockRe(filePath));
  if (!m) throw new Error('block not found: ' + filePath);
  return bundleText.replace(blockRe(filePath), m[1] + transform(m[2]) + m[3]);
}
const writeSource = (dir, bundleText, version) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'KAIF-CORE-BUNDLE.md'), bundleText);
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, 'KAIF-CORE.mjs'));
  const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
  man.version = version;
  man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(dir, 'KAIF-CORE-BUNDLE.md')));
  writeFileSync(join(dir, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
};
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;   // «старая» версия = текущая сборка

// ---------------------------------------------------------------- апстрим v9.9: правки модулей + НОВЫЙ английский навык
const bundle0 = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
let bundle99 = bundle0;
bundle99 = editBundleModule(bundle99, '.claude/skills/check-backlog/SKILL.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (check-backlog)'));
bundle99 = editBundleModule(bundle99, 'TESTING_FRAMEWORK.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (testing)'));
bundle99 = editBundleModule(bundle99, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (philosophy)'));
bundle99 += '\n> **FILE: `.claude/skills/new-skill/SKILL.md`** — a NEW skill of 9.9 (English by construction)\n\n' +
  FENCE + 'md\n---\nname: new-skill\ndescription: A NEW skill arriving in 9.9 — English by construction.\n---\n\n' +
  '# /new-skill — a new skill\n\n## What it does\n\nEnglish body of the new skill.\n' + FENCE + '\n';
const SRC99 = join(ROOT, 'src-9.9');
writeSource(SRC99, bundle99, '9.9');

// Baseline «старой» версии для U1: тот же бандл, но AGENT_GUIDE.md БЕЗ символа веры и молитвы —
// форма развёртывания до 2.4 (Prompt Modding: 1.6 → 2.4). Версия meta = FROM (проверка baseline).
const stripPrayer = (t) => t.replace(/<!-- KAIF:CREED:BEGIN -->[\s\S]*?<!-- KAIF:PRAYER:END -->\n?/, '');
const OLD = join(ROOT, 'baseline-old');
writeSource(OLD, replaceBundleBlock(bundle0, 'AGENT_GUIDE.md', stripPrayer), FROM);

// ---------------------------------------------------------------- U1: якорный блок приезжает целиком или не приезжает
console.log('\n=== U1 (P2): END без BEGIN — якорная пара неделима ===');
const T1 = join(ROOT, 'u1'); mkdirSync(T1); seed(T1);
must(run, T1, 'install');
const AG1 = join(T1, 'AGENT_GUIDE.md');
const ag1 = stripPrayer(readFileSync(AG1, 'utf8'));
ok(!/KAIF:PRAYER/.test(ag1), 'U1 фикстура: развёрнутый гайд приведён к форме без молитвы (как до 2.4)');
// локальная правка ВНУТРИ H1-модуля — модуль диверджен, апстримный H1 (с маркерами) не применится
writeFileSync(AG1, ag1.replace(/\n/, '\n\nLocal owner line inside the H1 module.\n'));
const dm1p = join(T1, '.kaif', 'deploy-manifest.json');
const dm1 = JSON.parse(readFileSync(dm1p, 'utf8'));
delete dm1.templateShas; delete dm1.moduleShas; delete dm1.templateTexts; dm1.manifestVersion = 1;   // развёртывание 1.x: снимков нет
writeFileSync(dm1p, JSON.stringify(dm1, null, 2) + '\n');
let r = run(T1, `update --source ${SRC99} --baseline ${OLD}`);
ok(r.code === 0, 'U1 update →9.9 с baseline без молитвы: exit 0', r.out);
const agAfter = readFileSync(AG1, 'utf8');
const markers = {};
for (const m of agAfter.matchAll(/<!-- KAIF:([A-Z-]+):(BEGIN|END) -->/g)) { markers[m[1]] = markers[m[1]] || { BEGIN: 0, END: 0 }; markers[m[1]][m[2]]++; }
const unbalanced = Object.entries(markers).filter(([, c]) => c.BEGIN !== c.END).map(([n, c]) => `${n} BEGIN=${c.BEGIN} END=${c.END}`);
ok(unbalanced.length === 0, 'U1: каждая пара маркеров KAIF:X сбалансирована (END без BEGIN в дерево не приезжает)', unbalanced.join('; ') || JSON.stringify(markers));
ok(agAfter.includes('Local owner line inside the H1 module.'), 'U1: локальная правка H1-модуля цела');
const task1 = existsSync(join(T1, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(T1, 'KAIF_UPDATE_TASK.md'), 'utf8') : '';
ok(/KAIF:PRAYER|prayer|anchored block|якорн/i.test(task1) || /KAIF:PRAYER:BEGIN/.test(agAfter),
   'U1: молитва либо приехала целиком (BEGIN+END), либо названа в задании как неделимый блок', task1.slice(0, 300));

// ---------------------------------------------------------------- U2/U3/U4/U8: переведённый навык, печать вердикта, детерминизм, stale-claims
console.log('\n=== U2 (P1): вердикт wholesale печатается с числами · U3: детерминизм · U4 (#31): stale-claims безусловный · U8: команда диффа ===');
const T2 = join(ROOT, 'u2'); mkdirSync(T2); seed(T2);
must(run, T2, 'install --lang ru');
const CB = join(T2, '.claude/skills/check-backlog/SKILL.md');
const cbOrig = readFileSync(CB, 'utf8');
const cbPre = cbOrig.slice(0, cbOrig.search(/^# /m));
writeFileSync(CB, cbPre +
  '# /check-backlog — ревизия беклога\n\nПройтись по bugs/ и plans/, найти всё открытое.\n\n' +
  '## Что делать\n\nШаги ревизии по-русски.\n\n## Заметки\n\nЗаметки по-русски.\n');
// U3 — до update: два «сухих» прогона diff по одной копии
const d1 = run(T2, `diff --source ${SRC99}`); const d2 = run(T2, `diff --source ${SRC99}`);
const scrub = (s) => s.replace(/\d{4}-\d{2}-\d{2}T[^\s]+/g, '<t>').replace(/\b\d+ ?ms\b/g, '<ms>');
ok(d1.code === 0 && d2.code === 0 && scrub(d1.out) === scrub(d2.out), 'U3: два diff --source по байт-идентичной копии печатают одно и то же', scrub(d1.out).slice(-300));
r = run(T2, `update --source ${SRC99}`);
ok(r.code === 0, 'U2 update →9.9 (ru, переведённый навык) exit 0', r.out);
ok(/check-backlog\/SKILL\.md: baseFound \d+ of \d+, ceiling \d+ → frozen/.test(r.out),
   'U2: лог печатает решение по файлу-кандидату с числами (`baseFound N of M, ceiling K → frozen`)', r.out.split('\n').filter((l) => /check-backlog/.test(l)).join(' | '));
ok(!/^# \/check-backlog — [A-Za-z]/m.test(readFileSync(CB, 'utf8')), 'U2: переведённый файл не удвоен английским шаблоном (K1 держится)');
const task2 = readFileSync(join(T2, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/\*\*stale-claims\*\*/.test(task2), 'U4 (#31): пункт stale-claims есть в задании даже без клеймов', task2.split('\n').filter((l) => /\*\*[a-z-]+\*\*/.test(l)).map((l) => l.slice(0, 40)).join(' | '));
ok(/stale-claims[^]*no lines found/.test(task2), 'U4 (#31): пустой скан назван телом `no lines found`');
ok(/kaif-core\.mjs diff --source[^\n]*check-backlog\/SKILL\.md|check-backlog\/SKILL\.md[^\n]*kaif-core\.mjs diff --source/.test(task2),
   'U8 (U2 п. 1): пункт о wholesale-файле даёт ГОТОВУЮ команду диффа (`kaif-core.mjs diff --source …`)');

// ---------------------------------------------------------------- U5: пин старой версии в package.json scripts
console.log('\n=== U5 (U2 п. 4): stale-claims сканирует скрипты проекта ===');
const T3 = join(ROOT, 'u5'); mkdirSync(T3); seed(T3);
writeFileSync(join(T3, 'package.json'), '{\n  "name": "sbx-symmetries",\n  "scripts": {\n' +
  `    "kaif:pin-check": "node tools/pin.mjs --require \\"KAIF ${FROM}\\""\n  }\n}\n`);
must(run, T3, 'install');
// U7-фикстура: файл, который апстрим МЕНЯЕТ (заменится механически) — LF с ОДНОЙ CRLF-строкой
const TF = join(T3, 'TESTING_FRAMEWORK.md');
const tfLines = readFileSync(TF, 'utf8').replace(/\r\n/g, '\n').split('\n');
tfLines[2] = tfLines[2] + '\r';           // одна CRLF-строка в LF-файле: доминирует LF
writeFileSync(TF, tfLines.join('\n'));
r = run(T3, `update --source ${SRC99}`);
ok(r.code === 0, 'U5 update →9.9 exit 0', r.out);
const task3 = readFileSync(join(T3, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/stale-claims[^]*package\.json/.test(task3), 'U5: пин старой версии в package.json scripts назван в stale-claims', task3.split('\n').filter((l) => /stale-claims|package\.json/.test(l)).join(' | ').slice(0, 300));
// ---------------------------------------------------------------- U7: EOL по доминированию
console.log('\n=== U7 (H10): механическая замена сохраняет ДОМИНИРУЮЩУЮ конвенцию концов строк ===');
const tfAfter = readFileSync(TF, 'utf8');
const crlf = (tfAfter.match(/\r\n/g) || []).length, lf = (tfAfter.match(/\n/g) || []).length - crlf;
ok(tfAfter.includes('UPSTREAM ADDITION 9.9 (testing)'), 'U7 фикстура: файл действительно заменён апстримом');
ok(crlf <= lf, `U7: доминирующая конвенция (LF) сохранена после замены (CRLF ${crlf} · LF ${lf})`);

// ---------------------------------------------------------------- U6: новый английский навык на ru-развёртывании
console.log('\n=== U6 (P3 / #32 R-C, U2 п. 2): английские новинки названы в задании; check считает языковую смесь ===');
const T4 = join(ROOT, 'u6'); mkdirSync(T4); seed(T4);
must(run, T4, 'install --lang ru');
r = run(T4, `update --source ${SRC99}`);
ok(r.code === 0, 'U6 update →9.9 (ru) exit 0', r.out);
ok(existsSync(join(T4, '.claude/skills/new-skill/SKILL.md')), 'U6 фикстура: новый навык приехал');
const task4 = readFileSync(join(T4, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/\*\*language-arrivals\*\*[^\n]*new-skill/.test(task4), 'U6: задание называет пункт `language-arrivals` с новым английским навыком', task4.split('\n').filter((l) => /\*\*[a-z-]+\*\*/.test(l)).map((l) => l.slice(0, 40)).join(' | '));
r = run(T4, 'check');
ok(/language mix: \d+ of \d+ skills are English/.test(r.out), 'U6: `check` печатает счёт языковой смеси (`language mix: N of M skills are English`)', r.out.slice(-300));

// ---------------------------------------------------------------- U9: check краснит непарный маркер (критерий 2, вторая половина)
console.log('\n=== U9 (P2, check): END без BEGIN — структурно невалидный документ, check красный ===');
const T5 = join(ROOT, 'u9'); mkdirSync(T5); seed(T5);
must(run, T5, 'install');
r = run(T5, 'check');
ok(r.code === 0, 'U9 фикстура: свежая установка — check зелёный до порчи', r.out.slice(-200));
writeFileSync(join(T5, 'PHILOSOPHY.md'), readFileSync(join(T5, 'PHILOSOPHY.md'), 'utf8') + '\n<!-- KAIF:TEST:END -->\n');
r = run(T5, 'check');
ok(r.code !== 0 && /unpaired anchor block KAIF:TEST[^\n]*PHILOSOPHY\.md/.test(r.out),
   'U9: check красный на END без BEGIN и называет документ и имя пары', r.out.slice(-300));
// маркер внутри code fence — не маркер: ложной тревоги нет
writeFileSync(join(T5, 'PHILOSOPHY.md'), readFileSync(join(T5, 'PHILOSOPHY.md'), 'utf8').replace('\n<!-- KAIF:TEST:END -->\n', '\n```\n<!-- KAIF:TEST:END -->\n```\n'));
r = run(T5, 'check');
ok(r.code === 0, 'U9: маркер внутри code fence не считается — check снова зелёный', r.out.slice(-200));

console.log(failures ? `\n❌ s18: ${failures} red` : '\n✅ s18: all green');
process.exit(failures ? 1 : 0);
