// s18-update-symmetries.mjs — свод эпика US 2.5 «Симметрии обновления» (plans/86; issues #27,
// [TESTED: 2026-09-04 · свод написан ДО фиксов (EXP-0016/0017): красный прогон на HEAD-ядре 9c2fe5e —
// 9 красных ровно по предсказаниям (лог s18-red1.log сессии 49); последние три стража доказаны
// красными на ядре 095c1c4 в сессии 50 (U1 `PRAYER BEGIN=0 END=1` · U1б `END@5036 NEW@726` — новый
// модуль ВНУТРИ пары · U5 `package.json` не в скане), зелёными — на ядре с US2б/US5г; в составе
// полигона — «sandbox suite: all 18 suites green»]
// #28 §2 R1–R5, #31, #32 R-A–R-D, KAGO R2; входы — researches/23 §2а, researches/24 §2).
//
// Предсказания до первого прогона (2026-09-04, сессия 49):
//   U1 (P2 — #27 R1b + KAGO R2) КРАСНЫЙ — baseline старой версии БЕЗ молитвы (v1-манифест +
//        --baseline), H1-модуль диверджен локальной правкой, апстрим 9.9 несёт модуль молитвы →
//        в дерево приезжает `KAIF:PRAYER:END` без `KAIF:PRAYER:BEGIN` (маркер BEGIN живёт в
//        неприменённом H1-модуле). Страж: каждая пара маркеров KAIF:X сбалансирована.
//   U1б (KAGO R2; добавлен в сессии 50 вместе с фиксом) КРАСНЫЙ на ядре 095c1c4 — пара на диске
//        сбалансирована, но открыта на месте «после H1» (заголовок молитвы переведён, END уехал в
//        модуль владельца ниже); НОВЫЙ модуль апстрима вставляется «после ближайшего соседа по
//        шаблону» = после H1 → ВНУТРЬ пары. Страж: новый модуль стоит ЗА закрывающим модулем.
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
//   Стражи, добавленные в сессии 50 вместе со своими фиксами (каждый доказан красным на ядре
//   ДО фикса циклом «stash истока → сборка → свод → pop → сборка», EXP-0104):
//   U3б (P1, обязывающая репетиция) КРАСНЫЙ на 46a5ba7 ×8 — `diff --source` не печатал вердиктов
//        и не писал репетицию; подделанная запись «frozen» не мешала боевому мержу.
//   U10 (#32 R-D) КРАСНЫЙ на 5ed5baa ×5 — deprecation без преемника, неубранные не считались.
//   U11 (P5) КРАСНЫЙ ×3 — пункты project-name без файловой формы; имя «???» записывалось в маркер.
//   U12 (KAGO 10) КРАСНЫЙ ×1 — цитата слота в летописи называлась местом заполнения.
//   U13 (P4) КРАСНЫЙ ×2 — переход anonymous→origin не называл удержанные файлы анонимной формулировки.
//   Дописано судом RL 2.5 (2026-09-04, находка E-H2 — двух стражей в этой шапке не было):
//   U9 (P2, `check` краснит непарный якорь) КРАСНЫЙ ×1 — мутация на копии: снять `missing++` в
//        `check` (ядро 4958dd1) → красен ровно U9 (улика судьи 4, лог s18-M3-anchorcheck.log).
//   U14 (bugs/100, одно дерево в двух папках) КРАСНЫЙ на ядре build 434 — `A: baseFound 5 of 29 →
//        merged` / `B: 4 of 29 → frozen`; мутация «H1 обратно в счёт» на 4958dd1 → красен ровно U14.
//   U5б (суд RL 2.5, E-H1) КРАСНЫЙ ×2 на ядре 4958dd1 — `BLOCKERS.md` и `lockstep.mjs` с клеймом
//        старой версии пропущены фильтром `/lock/i` по имени (лог s18-red-E-H1.log скретчпада суда).
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
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
// U3б: апстрим меняет H1-модуль навыка, у которого на диске переведено ТЕЛО одного раздела (заголовки целы → merged)
bundle99 = editBundleModule(bundle99, '.claude/skills/propose-idea/SKILL.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (propose-idea)'));
bundle99 += '\n> **FILE: `.claude/skills/new-skill/SKILL.md`** — a NEW skill of 9.9 (English by construction)\n\n' +
  FENCE + 'md\n---\nname: new-skill\ndescription: A NEW skill arriving in 9.9 — English by construction.\n---\n\n' +
  '# /new-skill — a new skill\n\n## What it does\n\nEnglish body of the new skill. Run the tests with `<TEST_HARNESS>` first.\n' + FENCE + '\n';   // <TEST_HARNESS>: слот, который машинерия не заполнит без scripts.test — пункт placeholders (U12)
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

// ---------------------------------------------------------------- U1б (KAGO R2): точка вставки внутри открытой на диске пары уходит за закрывающий модуль
console.log('\n=== U1б (KAGO R2): НОВЫЙ модуль апстрима не приезжает ВНУТРЬ локализованной пары ===');
// апстрим 9.9б: НОВЫЙ модуль сразу за модулем молитвы (в порядке шаблона — уже ПОСЛЕ END пары)
const bundle99b = editBundleModule(bundle99, 'AGENT_GUIDE.md', /^## 🙏/, (m) => m.lines.push('', '## NEW SECTION 9.9', '', 'English upstream section arriving right after the prayer.'));
const SRC99B = join(ROOT, 'src-9.9b');
writeSource(SRC99B, bundle99b, '9.9');
const T1b = join(ROOT, 'u1b'); mkdirSync(T1b); seed(T1b);
must(run, T1b, 'install');
const AG1b = join(T1b, 'AGENT_GUIDE.md');
// пара «по-KAGO»: заголовок молитвы переведён (модуль стал владельческим), END уехал в отдельный
// модуль владельца ниже — на диске пара сбалансирована, но открыта на месте вставки «после H1»
let ag1b = readFileSync(AG1b, 'utf8').replace(/\r\n/g, '\n');
ag1b = ag1b.replace(/^## 🙏 [^\n]*$/m, '## 🙏 Молитва перед работой').replace('<!-- KAIF:PRAYER:END -->\n', '');
const nextH2 = ag1b.indexOf('\n## ', ag1b.indexOf('## 🙏 Молитва') + 1);
ag1b = ag1b.slice(0, nextH2) + '\n## Граница пары (владелец)\n\n<!-- KAIF:PRAYER:END -->\n' + ag1b.slice(nextH2);
writeFileSync(AG1b, ag1b);
ok(ag1b.indexOf('<!-- KAIF:PRAYER:BEGIN -->') < ag1b.indexOf('## 🙏 Молитва') && ag1b.indexOf('## 🙏 Молитва') < ag1b.indexOf('<!-- KAIF:PRAYER:END -->'),
   'U1б фикстура: BEGIN в H1 · переведённая молитва · END в модуле владельца ниже');
r = run(T1b, `update --source ${SRC99B}`);
ok(r.code === 0, 'U1б update →9.9б exit 0', r.out);
const ag1bAfter = readFileSync(AG1b, 'utf8');
ok(ag1bAfter.includes('## NEW SECTION 9.9'), 'U1б фикстура: новый модуль апстрима приехал', r.out.slice(-300));
const iEnd = ag1bAfter.indexOf('<!-- KAIF:PRAYER:END -->'), iNew = ag1bAfter.indexOf('## NEW SECTION 9.9');
ok(iEnd >= 0 && iNew > iEnd, 'U1б: новый модуль вставлен ЗА закрывающим модулем пары, а не внутрь неё', `END@${iEnd} NEW@${iNew}`);
ok(/^## 🙏 Молитва перед работой$/m.test(ag1bAfter) && !/^## 🙏 THE PRAYER/m.test(ag1bAfter), 'U1б: локализованный модуль молитвы цел, английский не воскрешён');

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
// U3б-фикстура: второй навык переведён ТОЛЬКО телом одного раздела (заголовки целы) — кандидат с вердиктом merged
const PI = join(T2, '.claude/skills/propose-idea/SKILL.md');
const piMods = splitModules(readFileSync(PI, 'utf8').replace(/\r\n/g, '\n'));
ok(piMods.length > 2 && /^## /.test(piMods[2].signature), 'U3б фикстура: у propose-idea есть H2-раздел для перевода тела', piMods.map((m) => m.signature).join(' | '));
piMods[2].lines = [piMods[2].signature, '', 'Русский текст владельца вместо английского тела раздела — заголовок оставлен.', ''];
writeFileSync(PI, joinModules(piMods));
// U3 — до update: два «сухих» прогона diff по одной копии
const d1 = run(T2, `diff --source ${SRC99}`); const d2 = run(T2, `diff --source ${SRC99}`);
const scrub = (s) => s.replace(/\d{4}-\d{2}-\d{2}T[^\s]+/g, '<t>').replace(/\b\d+ ?ms\b/g, '<ms>');
ok(d1.code === 0 && d2.code === 0 && scrub(d1.out) === scrub(d2.out), 'U3: два diff --source по байт-идентичной копии печатают одно и то же', scrub(d1.out).slice(-300));
// ---------------------------------------------------------------- U3б (P1): репетиция записана, расхождение замораживает файл
console.log('\n=== U3б (P1): diff --source записывает вердикты; update замораживает файл при расхождении с репетицией ===');
const REH = join(T2, '.kaif', 'update-rehearsal.json');
ok(/check-backlog\/SKILL\.md: baseFound \d+ of \d+, ceiling \d+ → frozen/.test(d2.out) && /propose-idea\/SKILL\.md: baseFound \d+ of \d+, ceiling \d+ → merged/.test(d2.out),
   'U3б: diff --source печатает вердикт по каждому кандидату (check-backlog → frozen · propose-idea → merged)', d2.out.split('\n').filter((l) => /baseFound/.test(l)).join(' | '));
ok(existsSync(REH), 'U3б: репетиция записана в .kaif/update-rehearsal.json');
const reh = existsSync(REH) ? JSON.parse(readFileSync(REH, 'utf8')) : { verdicts: {} };
ok(reh.from === FROM && reh.to === '9.9' && reh.verdicts['.claude/skills/check-backlog/SKILL.md']?.outcome === 'frozen' && reh.verdicts['.claude/skills/propose-idea/SKILL.md']?.outcome === 'merged',
   'U3б: запись репетиции несёт from/to и вердикты с исходами', JSON.stringify(reh).slice(0, 300));
// подмена: «репетиция сказала frozen» для файла, который боевой прогон сольёт — ровно полевой P1 (#27 R1)
// (на ядре без репетиции запись подделывается целиком — стражи ниже краснеют чисто, а не падают)
reh.from = FROM; reh.to = '9.9';
reh.verdicts['.claude/skills/propose-idea/SKILL.md'] = { ...(reh.verdicts['.claude/skills/propose-idea/SKILL.md'] || { baseFound: 0, baseN: 0, ceiling: 0 }), outcome: 'frozen' };
writeFileSync(REH, JSON.stringify(reh, null, 2) + '\n');
r = run(T2, `update --source ${SRC99}`);
ok(r.code === 0, 'U2 update →9.9 (ru, переведённый навык) exit 0', r.out);
ok(/propose-idea\/SKILL\.md: the rehearsal said frozen[^\n]*this run says merged → FROZEN/.test(r.out), 'U3б: лог называет расхождение и заморозку с обоими наборами чисел', r.out.split('\n').filter((l) => /propose-idea/.test(l)).join(' | ').slice(0, 400));
const piAfter = readFileSync(PI, 'utf8');
ok(!piAfter.includes('UPSTREAM ADDITION 9.9 (propose-idea)') && piAfter.includes('Русский текст владельца вместо английского тела'), 'U3б: файл с расхождением НЕ слит (апстримная правка не приехала, перевод владельца цел)');
ok(/\*\*verdict-mismatch\*\*[^\n]*propose-idea\/SKILL\.md \(rehearsal: frozen — baseFound \d+ of \d+, ceiling \d+; this run: merged — baseFound \d+ of \d+/.test(readFileSync(join(T2, 'KAIF_UPDATE_TASK.md'), 'utf8')),
   'U3б: задание несёт пункт verdict-mismatch с обоими наборами чисел');
const receipt2 = JSON.parse(readFileSync(join(T2, '.kaif', 'last-update.json'), 'utf8'));
ok(receipt2.verdicts?.['.claude/skills/check-backlog/SKILL.md']?.outcome === 'frozen' && receipt2.verdicts?.['.claude/skills/propose-idea/SKILL.md']?.outcome === 'frozen' && receipt2.verdicts['.claude/skills/propose-idea/SKILL.md'].mismatch,
   'U3б: квитанция несёт вердикты с числами; замороженный по расхождению помечен mismatch', JSON.stringify(receipt2.verdicts || {}).slice(0, 300));
ok(!existsSync(REH), 'U3б: запись репетиции потреблена обновлением (одноразовая)');
ok(/check-backlog\/SKILL\.md: baseFound \d+ of \d+, ceiling \d+ → frozen/.test(r.out),
   'U2: лог печатает решение по файлу-кандидату с числами (`baseFound N of M, ceiling K → frozen`)', r.out.split('\n').filter((l) => /check-backlog/.test(l)).join(' | '));
ok(!/^# \/check-backlog — [A-Za-z]/m.test(readFileSync(CB, 'utf8')), 'U2: переведённый файл не удвоен английским шаблоном (K1 держится)');
const task2 = readFileSync(join(T2, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/\*\*stale-claims\*\*/.test(task2), 'U4 (#31): пункт stale-claims есть в задании даже без клеймов', task2.split('\n').filter((l) => /\*\*[a-z-]+\*\*/.test(l)).map((l) => l.slice(0, 40)).join(' | '));
ok(/stale-claims[^]*no lines found/.test(task2), 'U4 (#31): пустой скан назван телом `no lines found`');
ok(/check-backlog\/SKILL\.md \(translated wholesale[^\n]*git diff v\S+ v9\.9 -- framework\/skills\/check-backlog\/SKILL\.md/.test(task2),
   'U8 (U2 п. 1): пункт о wholesale-файле называет путь апстрима и ГОТОВУЮ команду диффа (`git diff v<from> v<to> -- <src>`)',
   task2.split('\n').filter((l) => /merge-diverged/.test(l)).join(' | ').slice(0, 400));

// ---------------------------------------------------------------- U5: пин старой версии в package.json scripts
console.log('\n=== U5 (U2 п. 4): stale-claims сканирует скрипты проекта ===');
const T3 = join(ROOT, 'u5'); mkdirSync(T3); seed(T3);
writeFileSync(join(T3, 'package.json'), '{\n  "name": "sbx-symmetries",\n  "scripts": {\n' +
  `    "kaif:pin-check": "node tools/pin.mjs --require \\"KAIF ${FROM}\\""\n  }\n}\n`);
// U5б-фикстура (суд RL 2.5, E-H1): проза и скрипт со словом «lock» В ИМЕНИ несут тот же клейм —
// фильтр lock-файлов обязан судить lock-ФАЙЛЫ (pnpm-lock.yaml), а не любое имя с «lock».
writeFileSync(join(T3, 'BLOCKERS.md'), `# Blockers\n\nThis project requires KAIF ${FROM} exactly.\n`);
writeFileSync(join(T3, 'lockstep.mjs'), `if (v !== 'KAIF ${FROM}') throw 1;\n`);
must(run, T3, 'install');
// U7-фикстура: файл, который апстрим МЕНЯЕТ (заменится механически) — LF с ОДНОЙ CRLF-строкой
const TF = join(T3, 'TESTING_FRAMEWORK.md');
const tfLines = readFileSync(TF, 'utf8').replace(/\r\n/g, '\n').split('\n');
tfLines[2] = tfLines[2] + '\r';           // одна CRLF-строка в LF-файле: доминирует LF
writeFileSync(TF, tfLines.join('\n'));
// U12-фикстура (KAGO 10): летопись ЦИТИРУЕТ слот дословно — это история, не место заполнения
appendFileSync(join(T3, 'PROJECT_HISTORY.md'), '\n2026-01-01 — chronicle: the adaptation filled `<TEST_HARNESS>` back then (verbatim quote, not a slot).\n');
r = run(T3, `update --source ${SRC99}`);
ok(r.code === 0, 'U5 update →9.9 exit 0', r.out);
const task3 = readFileSync(join(T3, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/stale-claims[^]*package\.json/.test(task3), 'U5: пин старой версии в package.json scripts назван в stale-claims', task3.split('\n').filter((l) => /stale-claims|package\.json/.test(l)).join(' | ').slice(0, 300));
// Тело ОДНОГО пункта stale-claims: от его строки до следующего пункта задания (`- **имя**`).
const staleItem = (() => { const ls = task3.split('\n'); const i = ls.findIndex((l) => /\*\*stale-claims\*\*/.test(l)); if (i < 0) return '';
  const j = ls.slice(i + 1).findIndex((l) => /^- \*\*[a-z-]+\*\*/.test(l)); return ls.slice(i, j < 0 ? undefined : i + 1 + j).join('\n'); })();
ok(/BLOCKERS\.md:3/.test(staleItem), 'U5б (суд RL 2.5, E-H1): проза со словом lock в имени (BLOCKERS.md) названа в stale-claims', staleItem.slice(0, 400));
ok(/lockstep\.mjs:1/.test(staleItem), 'U5б (суд RL 2.5, E-H1): скрипт со словом lock в имени (lockstep.mjs) назван в stale-claims', staleItem.slice(0, 400));
// ---------------------------------------------------------------- U11 (P5 / #28 R4): guidance ДО акта — пункт называет файловую форму; искажённое имя отвергается
console.log('\n=== U11 (P5): пункт project-name называет --name-file; искажённое argv-имя отвергается ДО записи ===');
ok(/\*\*project-name\*\*[^\n]*--name-file <path>/.test(task3), 'U11: пункт project-name задания обновления называет файловую форму рядом с argv', task3.split('\n').find((l) => /\*\*project-name\*\*/.test(l))?.slice(0, 200));
const adapt3 = join(T3, 'KAIF_ADAPTATION_TASK.md');
ok(existsSync(adapt3) && /\*\*project-name\*\*[^\n]*--name-file <path>/.test(readFileSync(adapt3, 'utf8')), 'U11: пункт project-name задания установки тоже называет файловую форму');
const nameBefore = JSON.parse(readFileSync(join(T3, '.kaif', 'kaif.json'), 'utf8')).projectName;
r = run(T3, 'project-name "???"');
const nameAfter = JSON.parse(readFileSync(join(T3, '.kaif', 'kaif.json'), 'utf8')).projectName;
ok(r.code !== 0 && /MANGLED[^\n]*--name-file/.test(r.out) && nameAfter === nameBefore, 'U11: имя из одних «?» (след искажения argv) отвергнуто до записи, маркер не тронут', r.out.slice(-200));
// ---------------------------------------------------------------- U12 (KAGO 10): один предикат поверхностей у пункта placeholders и у гейта
console.log('\n=== U12 (KAGO 10): пункт placeholders называет ТОЛЬКО поверхности гейта — цитата летописи не место заполнения ===');
const phLine = task3.split('\n').find((l) => /\*\*placeholders\*\*/.test(l)) || '';
ok(/<TEST_HARNESS>[^\n]*new-skill\/SKILL\.md/.test(phLine), 'U12: пункт placeholders называет новый навык с незаполненным слотом (поверхность гейта)', phLine.slice(0, 300));
ok(phLine && !/PROJECT_HISTORY\.md/.test(phLine), 'U12: дословная цитата слота в летописи НЕ названа местом заполнения (инструкция = гейт)', phLine.slice(0, 300));
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

// ---------------------------------------------------------------- U10 (#32 R-D): deprecation называет преемника; неубранные СЧИТАЮТСЯ
console.log('\n=== U10 (#32 R-D): преемник в deprecation (лог · пункт задания) · счёт неубранных (контекст-строка · квитанция) ===');
// по образцу s04 S14d: ЗАМЕНА существующего ключа `deprecations` в мете бандла (второй ключ JSON.parse перекрыл бы тихо)
const depKeyRe = /"deprecations": \[[\s\S]*?\],/;
if (!depKeyRe.test(bundle99)) throw new Error('U10 fixture: ключ deprecations не найден в мете бандла');
let bundleDep = bundle99.replace(depKeyRe,
  '"deprecations": [{"path": ".claude/skills/what-next/SKILL.md", "reason": "retired in test", "successor": "/next-thing (.claude/skills/next-thing/SKILL.md)"}, ' +
  '{"path": ".claude/skills/help-kaif/SKILL.md", "reason": "retired in test", "successor": "/help-thing (.claude/skills/help-thing/SKILL.md)"}],');
const dropBlock = (text, p) => text.replace(new RegExp('^> \\*\\*FILE: `' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
  '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n[\\s\\S]*?\\n' + FENCE + '\\n?', 'm'), '');
bundleDep = dropBlock(dropBlock(bundleDep, '.claude/skills/what-next/SKILL.md'), '.claude/skills/help-kaif/SKILL.md');
const SRCDEP = join(ROOT, 'src-9.9-dep');
writeSource(SRCDEP, bundleDep, '9.9');
const T6 = join(ROOT, 'u10'); mkdirSync(T6); seed(T6);
must(run, T6, 'install');
const HK = join(T6, '.claude/skills/help-kaif/SKILL.md');
writeFileSync(HK, readFileSync(HK, 'utf8') + '\nLOCAL EDIT ON DEPRECATED\n');   // правленный — остаётся и считается
r = run(T6, `update --source ${SRCDEP}`);
ok(r.code === 0, 'U10 update →9.9 с deprecations exit 0', r.out);
ok(/retired \.claude\/skills\/what-next\/SKILL\.md \([^)]*\) → successor: \/next-thing/.test(r.out), 'U10: лог удаления называет преемника', r.out.split('\n').filter((l) => /retired|deprecated/.test(l)).join(' | ').slice(0, 300));
ok(/1 deprecated artifact\(s\) kept/.test(r.out), 'U10: лог считает неубранные (1 kept)', r.out.split('\n').filter((l) => /deprecated/.test(l)).join(' | ').slice(0, 300));
const task6 = readFileSync(join(T6, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/\*\*deprecations\*\*[^\n]*help-kaif\/SKILL\.md[^\n]*successor: \/help-thing/.test(task6), 'U10: пункт задания называет преемника у правленного упразднённого');
ok(/^> [^\n]*1 deprecated artifact\(s\) retired; 1 deprecated artifact\(s\) KEPT with local edits/m.test(task6), 'U10: контекст-строка задания считает и убранные, и неубранные', task6.split('\n').find((l) => /^> /.test(l)));
const receipt6 = JSON.parse(readFileSync(join(T6, '.kaif', 'last-update.json'), 'utf8'));
ok(receipt6.deprecations && receipt6.deprecations.retired === 1 && receipt6.deprecations.kept === 1, 'U10: квитанция несёт счёт deprecations {retired: 1, kept: 1}', JSON.stringify(receipt6.deprecations));

// ---------------------------------------------------------------- U13 (P4 / #28 R3): переход anonymous → origin называет удержанные файлы с анонимной формулировкой
console.log('\n=== U13 (P4): anonymous → origin — удержанный файл с анонимной формулировкой назван в задании ===');
const T7 = join(ROOT, 'u13'); mkdirSync(T7); seed(T7);
must(run, T7, 'install --mode anonymous');
// файл, чей текст анонимизатор МЕНЯЕТ: сравниваем анонимную установку со стандартной (T5 — u9), берём первый различающийся навык
const T7std = join(ROOT, 'u13-std'); mkdirSync(T7std); seed(T7std);
must(run, T7std, 'install');
const conditioned = ['KAIF_FRAMEWORK.md', '.claude/skills/report-bug/SKILL.md', '.claude/skills/help-kaif/SKILL.md', 'AGENT_GUIDE.md']
  .find((p) => existsSync(join(T7, p)) && existsSync(join(T7std, p)) && readFileSync(join(T7, p), 'utf8') !== readFileSync(join(T7std, p), 'utf8'));
ok(!!conditioned, 'U13 фикстура: найден файл, чей текст зависит от режима (анонимная ≠ стандартная установка)', conditioned || 'none');
if (conditioned) writeFileSync(join(T7, conditioned), readFileSync(join(T7, conditioned), 'utf8') + '\nLOCAL EDIT UNDER ANONYMOUS MODE\n');
// bootstrap на 9.9 с явным --mode standard: бандл новой версии кладётся туда, откуда его читает install;
// версию install берёт из МЕТА-БЛОКА бандла (первое `"version"` в файле), а не из манифеста — патчим её
writeFileSync(join(T7, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), bundle99.replace(/"version": "[^"]+"/, '"version": "9.9"'));
r = run(T7, 'install --mode standard');
ok(r.code === 0 && /tracking anonymous → origin/.test(r.out), 'U13: переход anonymous → origin выполнен и назван в логе', r.out.slice(-300));
const marker7 = JSON.parse(readFileSync(join(T7, '.kaif', 'kaif.json'), 'utf8'));
ok(marker7.tracking === 'origin' && marker7.version === '9.9', 'U13: маркер — tracking origin, версия 9.9', JSON.stringify({ tracking: marker7.tracking, version: marker7.version }));
const task7 = existsSync(join(T7, 'KAIF_UPDATE_TASK.md')) ? readFileSync(join(T7, 'KAIF_UPDATE_TASK.md'), 'utf8') : '';
ok(conditioned && new RegExp('\\*\\*mode-switch\\*\\*[^\\n]*' + conditioned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(task7),
   'U13: пункт mode-switch задания называет удержанный файл с анонимной формулировкой', task7.split('\n').filter((l) => /\*\*[a-z-]+\*\*/.test(l)).map((l) => l.slice(0, 40)).join(' | '));
ok(/kept file\(s\) were deployed with the anonymous wording/.test(r.out), 'U13: лог считает удержанные файлы анонимной формулировки', r.out.split('\n').filter((l) => /anonymous/.test(l)).join(' | ').slice(0, 300));

// ---------------------------------------------------------------- U14 (bugs/100): одно дерево в двух папках → один вердикт wholesale
console.log('\n=== U14 (bugs/100, P1 причина): то же дерево под другим именем папки даёт ТОТ ЖЕ вердикт wholesale ===');
// проба живёт отдельным файлом (запускаемый repro бага); здесь она — страж: exit 0 = один вердикт в обеих папках
let probe;
try { probe = { code: 0, out: execSync(`node ${join(REPO, 'tools', 'sandbox', 'probes', 'bugs-100-two-folders.mjs')} --no-package ${join(ROOT, 'u14')} 2>&1`, { stdio: 'pipe' }).toString() }; }
catch (e) { probe = { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
ok(probe.code === 0 && /ОДИН вердикт/.test(probe.out), 'U14: дерево без package.json в папках alpha-project/beta-project — один вердикт (H1 вне счёта wholesale)', probe.out.split('\n').filter((l) => /baseFound|вердикт/.test(l)).join(' | ').slice(-400));

console.log(failures ? `\n❌ s18: ${failures} red` : '\n✅ s18: all green');
process.exit(failures ? 1 : 0);
