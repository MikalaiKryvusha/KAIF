// s28-experience-lint.mjs — песочница модуля поставки `kaif-experience-lint` (2.7, эпик EL, plans/114;
// тикет origin #69 — аудит журнала полевого проекта: «14 из 15 классов провалов повторились ПОСЛЕ записи
// урока, пять уроков записаны по 6–17 раз разными словами, механизировано 5,8 %»). Две половины, оба
// ответа на каждой:
// (1) МОДУЛЬ на фикстурах: селфтест зелёный (7 правил × 2 языка) · два ❌ одного класса без
//     `mechanized:` → exit 1, строка называет КЛАСС и ОБА номера · тот же класс с одной механизированной
//     записью → exit 0 · журнал без единого `class:` → SKIPPED (exit 3, класс bugs/34: «не судилось» ≠
//     «чисто») · `mechanized:` с несуществующим путём → ПРЕДУПРЕЖДЕНИЕ при коде 0 · путь из `.gitignore`
//     предупреждения не даёт (runtime-файл — не висячий страж) · слаг вне списка шапки → предупреждение ·
//     объявление `<!-- class-ok: слаг — причина -->` гасит РОВНО свой класс, пустое объявление красное ·
//     `--shrink` без `--yes` только ПОКАЗЫВАЕТ (файл побайтно тот же), с `--yes` оставляет одну строку с
//     указателем на страж, а на записи без `mechanized:` отказывает.
// (2) РАЗВЁРНУТАЯ копия (EXP-0010): модуль приехал в `.kaif/tools/`, шаблон журнала приехал в корень с
//     полем `class:` и списком классов-заготовок, развёрнутый модуль даёт те же вердикты на фикстурах, а
//     на СВЕЖЕМ журнале развёртывания (шаблон, ни одного заполненного класса) — SKIPPED вслух.
// Красный доказан на ядре 2.6 швом KAIF_DIST (`git show v2.6:dist/…`): модуля и поля там нет — ассерты
// адресно красные; мутанты оси `repeat` — на КОПИИ dist, скретчпад `el-mutants.mjs` (отчёт прогона).
// [TESTED: 2026-09-18 · «✅ s28 experience-lint: all 34 checks green» (счёт печатает сам свод);
//  KAIF_DIST=<dist 2.6> → «❌ s28: 9 of 34 check(s) failed» — красные адресованы отсутствующим модулю,
//  полю `class:` шаблона и вердиктам развёрнутой копии; отчёт прогона
//  testcases/reports/2026-09-18_experience-lint.md]
import { writeFileSync, readFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Шов KAIF_DIST: свод судит РАЗВЁРНУТУЮ копию из dist; подставь старый dist — красный доказан (s23:21).
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('explint', process.argv[2]);
for (const d of ['fix', 'fix/tools', 'deploy/.kaif/install']) mkdirSync(join(ROOT, d), { recursive: true });

let failures = 0, asserts = 0;   // счёт ассертов печатает сам свод — число в отчёте есть цитата (EXP-0025)
const ok = (cond, name, extra = '') => {
  asserts++;
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const MOD = join(REPO, 'framework', 'tools', 'kaif-experience-lint.mjs');
const run = (args, cwd = ROOT, bin = MOD) => {
  try { return { code: 0, out: execSync(`node ${bin} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args }); }
};

// ---------------------------------------------------------------- фикстуры журнала
const FIX = join(ROOT, 'fix');
const HEAD = (classes = true) => `# EXPERIENCE\n\n${classes ? '<!-- classes: shown-as-link, escaping-layer -->\n\n' : ''}## Entries\n\n`;
const entry = (id, mark, klass, mech) =>
  `### ${id} · 2026-01-01 · ${mark} · #x\n${klass ? `class: ${klass}\n` : ''}` +
  `**Lesson:** the showing was replaced by a link.\n**Repro:** \`node tools/showcase-lint.mjs\`\n` +
  `**Mechanization:** ${mech || 'subject-lesson'}\n\n`;
const write = (name, text) => { writeFileSync(join(FIX, name), text, 'utf8'); return join(FIX, name); };
// фикстура критерия 24: две записи ❌ ОДНОГО класса, ни у одной нет `mechanized:`
const PAIR = write('pair.md', HEAD() + entry('EXP-0002', '❌', 'shown-as-link') + entry('EXP-0001', '❌', 'shown-as-link'));
const HEALED = write('healed.md', HEAD() + entry('EXP-0002', '❌', 'shown-as-link', 'mechanized: `tools/showcase-lint.mjs`') + entry('EXP-0001', '❌', 'shown-as-link'));
const NOCLASS = write('noclass.md', HEAD(false) + entry('EXP-0002', '❌', null) + entry('EXP-0001', '❌', null));
const DANGLING = write('dangling.md', HEAD() + entry('EXP-0001', '❌', 'shown-as-link', 'mechanized: `tools/no-such-guard.mjs`'));
const IGNORED = write('ignored.md', HEAD() + entry('EXP-0001', '❌', 'shown-as-link', 'mechanized: `tools/state/runtime.json` in the ignore list'));
const UNLISTED = write('unlisted.md', HEAD() + entry('EXP-0001', '❌', 'brand-new-class', 'mechanized: `tools/showcase-lint.mjs`'));
const DECLARED = write('declared.md', HEAD() + '<!-- class-ok: shown-as-link — the price was re-checked: the class is a human judgement -->\n\n' +
  entry('EXP-0002', '❌', 'shown-as-link') + entry('EXP-0001', '❌', 'shown-as-link'));
const DECL_EMPTY = write('declared-empty.md', HEAD() + '<!-- class-ok: shown-as-link -->\n\n' + entry('EXP-0001', '❌', 'shown-as-link', 'mechanized: `tools/showcase-lint.mjs`'));
const SHRINK = write('shrink.md', HEAD() + entry('EXP-0002', '❌→✅', 'shown-as-link', 'mechanized: `tools/showcase-lint.mjs`') + entry('EXP-0001', '❌', 'shown-as-link'));
// дерево фикстур обязано выглядеть проектом (иначе адреса стражей не проверяются — граница вслух)
writeFileSync(join(FIX, 'package.json'), JSON.stringify({ name: 'fixture', scripts: { known: 'node tools/showcase-lint.mjs' } }), 'utf8');
writeFileSync(join(FIX, 'tools', 'showcase-lint.mjs'), '// fixture guard\n', 'utf8');
writeFileSync(join(FIX, '.gitignore'), 'tools/state/\n', 'utf8');
const BASELINE = join(FIX, 'baseline.json');
writeFileSync(BASELINE, JSON.stringify({ ids: ['EXP-0001', 'EXP-0002'] }), 'utf8');

console.log('\n=== s28: модуль поставки — ось повтора класса, SKIPPED, предупреждения, --shrink ===');
let r = run('selftest');
ok(r.code === 0 && /selftest OK/.test(r.out), 's28 селфтест модуля — каждое правило красное ровно на своей мутации, EN + RU', r.out);
ok(/7 rules × 2 languages/.test(r.out), 's28 селфтест — семь правил × два языка сосчитаны', r.out);
ok(/✓ en: the repeat finding names the class and BOTH entries/.test(r.out) && /✓ ru: the repeat finding names the class and BOTH entries/.test(r.out),
   's28 селфтест — строка повтора называет класс и оба номера на обоих языках', r.out);

r = run(`check ${PAIR}`);
ok(r.code === 1, 's28 два ❌ одного класса без mechanized — КРАСНЫЙ (exit 1)', r.out);
ok(/repeat: class shown-as-link: EXP-0002, EXP-0001/.test(r.out), 's28 строка повтора называет КЛАСС и ОБА номера (критерий 24)', r.out);
ok(/name the guard in the entry/.test(r.out) && /never a third record/.test(r.out), 's28 строка повтора называет починку — страж, а не третья запись', r.out);
r = run(`check ${HEALED}`);
ok(r.code === 0 && /experience-lint OK/.test(r.out), 's28 тот же класс с одной механизированной записью — ЗЕЛЁНЫЙ (exit 0)', r.out);
r = run(`check ${NOCLASS}`);
ok(r.code === 3 && /SKIPPED/.test(r.out) && /"not judged" is not "clean"/.test(r.out), 's28 журнал без единого class: — SKIPPED (exit 3) с границей вслух', r.out);
r = run(`check ${DANGLING}`);
ok(r.code === 0 && /⚠ dangling: EXP-0001[^\n]*tools\/no-such-guard\.mjs/.test(r.out),
   's28 mechanized: с несуществующим путём — ПРЕДУПРЕЖДЕНИЕ поимённо при коде 0 (совет, не отказ)', r.out);
r = run(`check ${IGNORED}`);
ok(r.code === 0 && !/dangling/.test(r.out), 's28 путь из .gitignore (runtime-файл) висячим стражем НЕ считается', r.out);
r = run(`check ${UNLISTED}`);
ok(r.code === 0 && /⚠ unlisted-class: class brand-new-class/.test(r.out), 's28 слаг вне списка шапки — предупреждение (новый класс законен)', r.out);
r = run(`check ${DECLARED}`);
ok(r.code === 0 && /1 class\(es\) declared price-re-checked/.test(r.out) && !/repeat:/.test(r.out),
   's28 объявление class-ok с причиной гасит свой класс и печатается в сводке (список только убывает)', r.out);
r = run(`check ${DECL_EMPTY}`);
ok(r.code === 1 && /class-ok-without-reason/.test(r.out), 's28 пустое объявление class-ok — КРАСНОЕ само (не выключатель)', r.out);
// базовая линия гасит долг ПОЛЕЙ и не гасит повтор класса
r = run(`check ${PAIR} --baseline ${BASELINE}`);
ok(r.code === 1 && /repeat: class shown-as-link/.test(r.out) && /inherited field debt 2/.test(r.out),
   's28 базовая линия гасит долг полей и НЕ гасит повтор класса — у пары обязана быть судьба', r.out);

// --- --shrink: показ без записи, запись только с --yes, отказ без mechanized
const before = readFileSync(SHRINK, 'utf8');
r = run(`--shrink EXP-0002 ${SHRINK}`);
ok(r.code === 0 && /shown, NOT written/.test(r.out) && readFileSync(SHRINK, 'utf8') === before,
   's28 --shrink без --yes — ПОКАЗ, файл побайтно тот же', r.out);
r = run(`--shrink EXP-0001 ${SHRINK}`);
ok(r.code === 1 && /carries no `mechanized:`/.test(r.out), 's28 --shrink на записи без mechanized — отказ с причиной', r.out);
r = run(`--shrink EXP-0002 ${SHRINK} --yes`);
const after = existsSync(SHRINK) ? readFileSync(SHRINK, 'utf8') : '';
ok(r.code === 0 && /shrunk in/.test(r.out), 's28 --shrink --yes — запись состоялась', r.out);
// тело схлопнутой записи судится ВНУТРИ её собственной секции (между её заголовком и следующим)
const shrunk = (after.split('### EXP-0002')[1] || '').split('### EXP-')[0];
ok(/\*\*Lesson → guard:\*\*/.test(shrunk) && /git log -p -S "EXP-0002"/.test(shrunk) && !/\*\*Lesson:\*\*/.test(shrunk) && /class: shown-as-link/.test(shrunk),
   's28 схлопнутая запись — строка класса плюс одна строка «урок → страж» с указателем на репро и git-историю, прежнего тела нет', shrunk.slice(0, 400));
ok(/### EXP-0001[\s\S]*Lesson:/.test(after), 's28 --shrink тронул РОВНО свою запись — соседняя цела', after.slice(-300));

// ---------------------------------------------------------------- развёрнутая копия
console.log('\n=== s28: развёрнутая копия — модуль и шаблон журнала приехали установкой ===');
const S = join(ROOT, 'deploy');
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
try { r = { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} install 2>&1`, { cwd: S, stdio: 'pipe' }).toString() }; }
catch (e) { r = failed(e, { root: ROOT, cwd: S, args: 'install' }); }
ok(r.code === 0, 's28 install exit 0', r.out.slice(-300));
const DEPLOYED = join(S, '.kaif', 'tools', 'kaif-experience-lint.mjs');
ok(existsSync(DEPLOYED), 's28 модуль приехал: .kaif/tools/kaif-experience-lint.mjs');
const JOURNAL = join(S, 'EXPERIENCE.md');
const journalText = existsSync(JOURNAL) ? readFileSync(JOURNAL, 'utf8') : '';
ok(/^class: /m.test(journalText) || /class: <slug/.test(journalText), 's28 шаблон журнала приехал с полем class: в формате записи', journalText.slice(0, 200));
ok(/<!-- classes:/.test(journalText) && /question-already-answered/.test(journalText),
   's28 шаблон журнала несёт СПИСОК классов-заготовок (из замера тикета #69)', journalText.slice(0, 200));
ok(/kaif-experience-lint\.mjs/.test(journalText), 's28 шаблон журнала называет команду крайнего срока', journalText.slice(0, 200));
// развёрнутый модуль даёт те же вердикты
r = run(`check ${PAIR}`, S, DEPLOYED);
ok(r.code === 1 && /repeat: class shown-as-link: EXP-0002, EXP-0001/.test(r.out), 's28 РАЗВЁРНУТЫЙ модуль — тот же красный с классом и обоими номерами', r.out);
r = run(`check ${HEALED}`, S, DEPLOYED);
ok(r.code === 0, 's28 РАЗВЁРНУТЫЙ модуль — зелёный на починенной паре', r.out);
r = run('selftest', S, DEPLOYED);
ok(r.code === 0 && /selftest OK/.test(r.out), 's28 РАЗВЁРНУТЫЙ модуль — селфтест зелёный в копии', r.out);
// свежий журнал развёртывания (шаблон): классов ещё нет — «не судилось» вслух, не «чисто»
r = run(`check ${JOURNAL}`, S, DEPLOYED);
ok(r.code === 3 && /SKIPPED/.test(r.out), 's28 свежий журнал развёртывания (шаблон) — SKIPPED (exit 3), не зелёный', r.out);
// проводка команды: строка крайнего срока стоит в развёрнутом /end-chat-soft
const CLOSING = join(S, '.claude', 'skills', 'end-chat-soft', 'SKILL.md');
const closing = existsSync(CLOSING) ? readFileSync(CLOSING, 'utf8') : '';
ok(/kaif-experience-lint\.mjs check/.test(closing), 's28 развёрнутый /end-chat-soft несёт команду крайнего срока', closing.slice(0, 200));
const CAPTURE = join(S, '.claude', 'skills', 'experience', 'SKILL.md');
const capture = existsSync(CAPTURE) ? readFileSync(CAPTURE, 'utf8') : '';
ok(/^\s*class: <slug>/m.test(capture) && /class-ok:/.test(capture), 's28 развёрнутый /experience несёт поле class: и объявленную цену класса', capture.slice(0, 200));

if (failures) { console.error(`\n❌ s28: ${failures} of ${asserts} check(s) failed`); process.exit(1); }
console.log(`\n✅ s28 experience-lint: all ${asserts} checks green`);
