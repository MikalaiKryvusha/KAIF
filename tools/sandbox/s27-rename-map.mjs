// s27-rename-map.mjs — свод эпика HO 2.7 (plans/106, шаг HO4; issue #57, вторая половина).
//
// РОДОСЛОВНАЯ. Тело этого свода родилось ПРОБОЙ `tools/sandbox/probes/ho-rename-duplicate.mjs`,
// написанной ДО кода и красной по построению (2 из 8 на ядре build 538 — прогон 1 отчёта
// `testcases/reports/2026-09-12_polygon-2.7-HO.md`). Проба СНЯТА после переезда сюда (судья
// эпика: её шапка обещала красный, который она показать не могла — без шва `KAIF_DIST` она была
// зелёной 14/14 и дублировала этот свод; DRY: пару лучше убрать, чем за ней следить). Красный
// класса показывает ЭТОТ свод швом `KAIF_DIST` на ядре 2.6.
//
//   @guard rename-map-no-duplicate
//   THREAT:         релиз переименовал заголовок модуля — у каждого полевого дерева, где этот
//                   раздел правлен владельцем, появляются ДВА раздела с одним содержанием, молча,
//                   при exit 0
//   PROVED-AGAINST: ветка B этого свода на ядре build 538 (до HO3) — «старых 1, новых 1»; ветка A
//                   там же — лог без слова «renamed»
//   GAP:            свод судит ОДИН путь и одну пару за прогон; интервал из нескольких
//                   переименований одного заголовка (A→B→C) покрыт только логикой `renameInterval`
//                   и не переисполняется здесь
//   ON-REAL-PATH:   гоняется каждым `npm run test:core`; живая пара 2.7 судится ассертом D по
//                   данным сборщика и по мета-блоку отгружаемого бандла
//
// КЛАСС. Переименование ЗАГОЛОВКА модуля в шаблоне поставки. Модуль адресуется сигнатурным
// якорем — полной строкой заголовка (`module-map-lib.splitModules`), — поэтому для машинерии
// обновления переименование неотличимо от «старый модуль удалён + новый добавлен».
//
// КРАСНЫЙ ДО ФИКСА (наблюдение, 2026-09-12 15:48 +03:00, ядро build 538 — ДО HO3): **2 из 8**
// проверок красные, и предсказание плана оказалось шире правды. У слияния три ветки:
//   A — модуль НЕ ТРОНУТ: старых 0, новых 1 — итог УЖЕ верный (снят как «апстрим удалил» и
//       вставлен как «новый в релизе»), но лог НЕ говорит слова «renamed» → красный ассерт 4;
//   B — модуль ПРАВЛЕН владельцем: старых 1, новых 1 — **ДУБЛЬ**, настоящий класс → красный ассерт 6;
//   C — старого якоря нет вовсе: старых 0, новых 1, обновление не падает — зелёный.
// Поэтому карта переименований нужна ветке B (не дать вставить новый модуль рядом с правленым
// старым) и ЛОГУ всех веток (владелец не может отличить переименование от пары «удалили +
// добавили»); A и C механически уже правы — карта их только НАЗЫВАЕТ.
//
// ПОЧЕМУ ПАРА В ФИКСТУРЕ СВОЯ, А НЕ ЖИВАЯ ПАРА 2.7. Карта версии действует на интервале
// `(from, to]`, как политики: живая пара `baton → handover` ИНЕРТНА, пока `version.json` говорит
// 2.6, и протухнет, как только выйдет 2.8. Проба объявляет СВОЮ пару в мета-блоке синтетического
// апстрима 9.9 — так стережётся МЕХАНИЗМ, который переживёт все версии; живая пара 2.7 судится
// отдельным дешёвым ассертом по данным сборщика (D).
//
// [TESTED: 2026-09-12 · «all 17 checks green» на свежем dist; КРАСНЫЙ доказан ДВАЖДЫ — пробой на
//  ядре build 538 до фикса (2 из 8: лог ветки A и дубль ветки B) и швом
//  `KAIF_DIST=<git show v2.6:dist/…> node tools/sandbox/s27-rename-map.mjs` → «6 из 17 проверок
//  красные» (дубль B, три молчащих лога, немое сломанное объявление E, карта не доехала в
//  мета-блок), свод доходит до вердикта, не падает; отчёт прогона
//  testcases/reports/2026-09-12_polygon-2.7-HO.md, прогоны 16 и 23]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../lib/temp-root.mjs';
import { splitModules, joinModules } from '../module-map-lib.mjs';
import { must, coreRunner } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Шов KAIF_DIST: свод разворачивает копию из dist; подставь СТАРЫЙ dist — и красный доказан на
// ядре, которое карты переименований не знает (`git show v2.6:dist/…`), как в s25/s26.
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
const ROOT = tempRoot("s27-rename", process.argv[2]);
mkdirSync(ROOT, { recursive: true });

let failures = 0;
let checks = 0;
const ok = (cond, name, extra = '') => {
  checks++;
  // The "reason" of a red assert is the RELEVANT part of the log — the rename lines, the skill's
  // own lines and any error — never the last 600 bytes of a 300-line update log (judge of epic HO:
  // "— oo/commands/revision.md" told the next reader nothing).
  const relevant = (s) => String(s).split('\n').filter((l) => /renam|Step 1\.|end-chat-soft|❌|Error|✖/.test(l)).slice(0, 8).join(' ⏎ ');
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + (relevant(extra) || String(extra).slice(-300))));
  if (!cond) failures++;
};
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const run = coreRunner(ROOT);
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};

// ── Швы бандла (тот же приём, что в s18/s02/s07) ──────────────────────────────────────────────
const FENCE = '`'.repeat(6);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const blockRe = (filePath) => new RegExp('(^> \\*\\*FILE: `' + esc(filePath) +
  '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
function editBundleModule(bundleText, filePath, pick, mutate) {
  const m = bundleText.match(blockRe(filePath));
  if (!m) throw new Error('block not found: ' + filePath);
  const mods = splitModules(m[2] + '\n');
  const idx = typeof pick === 'number' ? pick : mods.findIndex((x) => pick.test(x.signature));
  if (idx < 0) throw new Error('module not found in ' + filePath);
  mutate(mods[idx]);
  return bundleText.replace(blockRe(filePath), m[1] + joinModules(mods).replace(/\n$/, '') + m[3]);
}
// Правка МЕТА-БЛОКА бандла: объявление переименования — данные версии, ровно как депрекации.
function editBundleMeta(bundleText, mutate) {
  const m = bundleText.match(blockRe('kaif-bundle-manifest.json'));
  if (!m) throw new Error('meta block not found');
  const meta = JSON.parse(m[2]);
  mutate(meta);
  return bundleText.replace(blockRe('kaif-bundle-manifest.json'), m[1] + JSON.stringify(meta, null, 2) + m[3]);
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

const SKILL = '.claude/skills/end-chat-soft/SKILL.md';
// Заголовок БЕРЁТСЯ ИЗ БАНДЛА, а не пишется константой: под швом `KAIF_DIST` на ядре 2.6 тот же
// раздел называется словом `baton`, и константа уронила бы свод ИСКЛЮЧЕНИЕМ вместо вердикта
// (урок EXP-0127: красный обязан быть ассертом). Слово роли не играет — свод судит МЕХАНИЗМ.
const bundle0 = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
const STEP1 = /^### Step 1\. Record status & the \w+ in STATUS\.md$/;
const step1Mod = (() => {
  const m = bundle0.match(blockRe(SKILL));
  if (!m) return null;
  return splitModules(m[2] + '\n').find((x) => STEP1.test(x.signature)) || null;
})();
ok(!!step1Mod, `фикстура: в бандле найден модуль «${STEP1}» файла ${SKILL}`,
  'без него свод судить нечего — проверь, не переименован ли раздел без записи в RENAMES_BY_VERSION');
if (!step1Mod) {
  console.log(`\n❌ s27 rename-map: ${failures} из ${checks} проверок красные — фикстуры нет (корень прогона оставлен: ${ROOT})`);
  process.exit(1);
}
const OLD_SIG = step1Mod.signature;
const NEW_SIG = OLD_SIG.replace('Record status', 'Write down status');

// Апстрим 9.9: тот же модуль под НОВЫМ заголовком + объявление переименования в мета-блоке.
let bundle99 = editBundleModule(bundle0, SKILL, new RegExp('^' + esc(OLD_SIG) + '$'), (m) => {
  m.signature = NEW_SIG;
  m.lines[0] = NEW_SIG;
  m.lines.push('', 'A line the release added along with the rename.');
});
bundle99 = editBundleMeta(bundle99, (meta) => {
  // The bundle's OWN version moves too — the interval ceiling is `meta.version`, so a map entry for
  // a release the bundle does not claim to be stays INERT (which is exactly why the live 2.7 pair
  // does nothing until version.json says 2.7). Patching only the manifest would leave the fixture
  // lying about what it ships.
  meta.version = '9.9';
  meta.renamesByVersion = { ...(meta.renamesByVersion || {}), '9.9': { [SKILL]: [[OLD_SIG, NEW_SIG]] } };
});
const SRC = join(ROOT, 'src-9.9');
writeSource(SRC, bundle99, '9.9');

const heads = (file) => {
  const t = readFileSync(file, 'utf8');
  const count = (sig) => (t.match(new RegExp('^' + esc(sig) + '$', 'gm')) || []).length;
  return { old: count(OLD_SIG), neu: count(NEW_SIG) };
};

// ── A: модуль НЕ ТРОНУТ на диске ──────────────────────────────────────────────────────────────
console.log('\n=== A: нетронутый модуль — заголовок заменён, переименование НАЗВАНО ===');
const TA = join(ROOT, 'a'); mkdirSync(TA); seed(TA);
must(run, TA, 'install');
const fileA = join(TA, SKILL);
const rA = run(TA, `update --source ${SRC}`);
ok(rA.code === 0, 'A update →9.9: exit 0', rA.out);
const hA = heads(fileA);
ok(hA.old === 0, `A старого заголовка нет (найдено ${hA.old})`, rA.out);
ok(hA.neu === 1, `A новый заголовок ровно один (найдено ${hA.neu})`, rA.out);
ok(rA.out.includes(`renamed: ${SKILL} :: ${OLD_SIG} → ${NEW_SIG}`), 'A лог называет переименование поимённо', rA.out);

// ── B: модуль ПРАВЛЕН владельцем ──────────────────────────────────────────────────────────────
console.log('\n=== B: правленый модуль — правка цела, дубля нет, пункт задания называет переименование ===');
const TB = join(ROOT, 'b'); mkdirSync(TB); seed(TB);
must(run, TB, 'install');
const fileB = join(TB, SKILL);
const OWNER_LINE = 'Owner line inside the module that upstream renames.';
writeFileSync(fileB, readFileSync(fileB, 'utf8').replace(OLD_SIG + '\n', OLD_SIG + '\n\n' + OWNER_LINE + '\n'));
const rB = run(TB, `update --source ${SRC}`);
ok(rB.code === 0, 'B update →9.9: exit 0', rB.out);
const hB = heads(fileB);
ok(hB.old + hB.neu === 1, `B заголовок ОДИН, дубля нет (старых ${hB.old}, новых ${hB.neu})`, rB.out);
ok(readFileSync(fileB, 'utf8').includes(OWNER_LINE), 'B правка владельца цела', rB.out);
const taskB = readFileSync(join(TB, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(taskB.includes('renamed upstream to') && taskB.includes(NEW_SIG),
  'B задание называет переименование и новый заголовок', taskB.slice(0, 600));

// ── C: старого якоря на диске нет ─────────────────────────────────────────────────────────────
console.log('\n=== C: старый якорь удалён руками — строка лога поимённо, обновление не падает ===');
const TC = join(ROOT, 'c'); mkdirSync(TC); seed(TC);
must(run, TC, 'install');
const fileC = join(TC, SKILL);
writeFileSync(fileC, joinModules(splitModules(readFileSync(fileC, 'utf8')).filter((m) => m.signature !== OLD_SIG)));
const rC = run(TC, `update --source ${SRC}`);
ok(rC.code === 0, 'C update →9.9: exit 0 (ненайденный якорь не валит обновление)', rC.out);
const hC = heads(fileC);
ok(hC.old === 0 && hC.neu <= 1, `C дубля нет (старых ${hC.old}, новых ${hC.neu})`, rC.out);
ok(rC.out.includes(`rename anchor not found on disk: ${SKILL} :: ${OLD_SIG}`), 'C лог называет ненайденный якорь поимённо', rC.out);

// ── E: объявление СЛОМАНО — новый заголовок в шаблоне не тот (bugs/114, каверза судьи E4) ──────
// Опечатка в новой половине пары раньше молча роняла объявление, и дубль возвращался при exit 0.
// Починить опечатку обновление не может — но обязано СКАЗАТЬ о ней поимённо (сборка истока такую
// пару отказывается отгружать — гард 5g; это ассерт на вторую линию обороны, у дерева поля).
console.log('\n=== E: сломанное объявление — названо поимённо, а не проглочено ===');
let bundleBroken = editBundleMeta(bundle99, (meta) => {
  meta.renamesByVersion = { ...(meta.renamesByVersion || {}), '9.9': { [SKILL]: [[OLD_SIG, NEW_SIG + ' (typo)']] } };
});
const SRC_BROKEN = join(ROOT, 'src-9.9-broken');
writeSource(SRC_BROKEN, bundleBroken, '9.9');
const TE = join(ROOT, 'e'); mkdirSync(TE); seed(TE);
must(run, TE, 'install');
const fileE = join(TE, SKILL);
writeFileSync(fileE, readFileSync(fileE, 'utf8').replace(OLD_SIG + '\n', OLD_SIG + '\n\n' + OWNER_LINE + '\n'));
const rE = run(TE, `update --source ${SRC_BROKEN}`);
ok(rE.code === 0, 'E update →9.9 со сломанным объявлением: exit 0 (обновление не падает)', rE.out);
ok(rE.out.includes(`rename declaration broken: ${SKILL} :: ${OLD_SIG} → ${NEW_SIG} (typo)`),
  'E лог называет сломанное объявление поимённо (старый → объявленный новый)', rE.out);

// ── D: живая карта 2.7 объявлена в сборщике ───────────────────────────────────────────────────
console.log('\n=== D: пара 2.7 объявлена данными (не угадывается) ===');
const builder = readFileSync(join(REPO, 'tools', 'build-framework.mjs'), 'utf8');
ok(/RENAMES_BY_VERSION\s*=\s*\{[\s\S]*?'2\.7'/.test(builder), 'D сборщик несёт RENAMES_BY_VERSION со строкой 2.7');
ok(builder.includes("['### Step 1. Record status & the baton in STATUS.md', '### Step 1. Record status & the handover in STATUS.md']"),
  'D пара end-chat-soft объявлена дословно');
const metaLive = JSON.parse(readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8').match(blockRe('kaif-bundle-manifest.json'))[2]);
ok(!!(metaLive.renamesByVersion && metaLive.renamesByVersion['2.7'] && metaLive.renamesByVersion['2.7'][SKILL]),
  'D карта доехала в мета-блок бандла');

console.log(failures
  ? `\n❌ s27 rename-map: ${failures} из ${checks} проверок красные — класс открыт (корень прогона оставлен: ${ROOT})`
  : `\n✅ s27 rename-map: all ${checks} checks green — переименование заголовка обрабатывается как переименование`);
process.exit(failures ? 1 : 0);
