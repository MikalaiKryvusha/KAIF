// sandboxes4.mjs — песочницы Фазы 5.5: анонимный путь становится механическим
// (манифест переживает самоочистку → bootstrap-update классифицирует), легаси без манифеста
// получает синтетический слепок из релизного артефакта старой версии (--baseline).
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, readdirSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
// текущая версия репо — из dist, не из головы (хардкод «1.6» ломал полигон на бампе 2.0)
const CUR = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-anon-legacy'));
rmSync(ROOT, { recursive: true, force: true });
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
const seed = (dir, srcDir = DIST) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  cpSync(join(srcDir, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(join(srcDir, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
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
// апстрим 9.9: правка static-модуля PHILOSOPHY.md [2]
const SRC = join(ROOT, 'src-9.9'); mkdirSync(SRC);
let bundle = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (anon/legacy)'));
// мета-блок бандла: install-путь читает версию отсюда. Патч ОБЯЗАН исполниться —
// молчаливый no-op replace и был причиной трёх красных сводов на релизном бампе
const bundlePatched = bundle.replace(`"version": "${CUR}"`, '"version": "9.9"');
if (bundlePatched === bundle) throw new Error(`bundle meta version patch was a NO-OP — expected "version": "${CUR}" in the bundle meta`);
bundle = bundlePatched;
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');

const PH = ['<PROJECT_NAME>', '<SHORT_NAME>', '<AUTHOR>', '<REPO_URL>', '<LOCAL_PATH>', '<LICENSE>',
  '<BUILD_COMMAND>', '<TEST_HARNESS>', '<COMMIT_COMMAND>', '<YOUR AGENT/MODEL>',
  "<YOUR AGENT'S noreply EMAIL>", '<OWNER_LANGUAGE>'];   // email-слот виден гейту с bug 28
const fillAll = (dir) => {
  const fill = (p) => { let t = readFileSync(p, 'utf8'); for (const ph of PH) t = t.split(ph).join('X'); writeFileSync(p, t); };
  fill(join(dir, 'AGENT_GUIDE.md'));
  for (const n of readdirSync(join(dir, '.claude', 'skills'))) {
    const p = join(dir, '.claude', 'skills', n, 'SKILL.md');
    if (existsSync(p)) fill(p);
  }
  if (existsSync(join(dir, '.kaif', 'spheres'))) for (const n of readdirSync(join(dir, '.kaif', 'spheres')))
    if (n.endsWith('.md')) fill(join(dir, '.kaif', 'spheres', n));
};

// ---------------------------------------------------------------- S13: анонимный цикл целиком
console.log('\n=== S13: anonymous — манифест переживает самоочистку, bootstrap-update механический ===');
const S13 = join(ROOT, 's13'); mkdirSync(S13); seed(S13);
// собственный скрипт владельца с «кайфовым» именем — самоочистка обязана его пощадить
writeFileSync(join(S13, 'package.json'), JSON.stringify({ name: 's13', scripts: { 'kaif:check': 'echo OWNER-OWN-SCRIPT' } }, null, 2) + '\n');
let r = run(S13, 'install --mode anonymous');
ok(r.code === 0, 'S13 install --mode anonymous exit 0', r.out);
fillAll(S13);
r = run(S13, 'sync');
const adaptIds = [...new Set([...readFileSync(join(S13, 'KAIF_ADAPTATION_TASK.md'), 'utf8').matchAll(/kaif-core\.mjs checkpoint ([a-z-]+)/g)].map((m) => m[1]))];
for (const id of adaptIds) run(S13, `checkpoint ${id}${id === 'judge' ? ' --verdict "VERIFIED: sandbox"' : ''}`);
r = run(S13, 'verify-final');
ok(r.code === 0, 'S13 verify-final exit 0 (полный анонимный install)', r.out);
ok(existsSync(join(S13, '.kaif', 'deploy-manifest.json')), '🔴 S13 обезличенный манифест ПЕРЕЖИЛ самоочистку');
// bug 29 (третий 2.0-отчёт): ядро больше НЕ удаляется — остаётся анонимизированным, механика
// 2.0 (check/sync/diff/adopt-current) доступна анониму; origin и аккаунт вырезаны по значению.
ok(existsSync(join(S13, '.kaif', 'kaif-core.mjs')), 'S13 ядро СОХРАНЕНО анонимизированным (bug 29)');
const core13 = readFileSync(join(S13, '.kaif', 'kaif-core.mjs'), 'utf8');
ok(!core13.includes('MikalaiKryvusha'), 'S13 в оставленном ядре нет origin-аккаунта');
r = run(S13, 'sync');
ok(r.code === 0, 'S13 sync РАБОТАЕТ после анонимной самоочистки (поле аудитило 96 зеркал своим скриптом)', r.out);
const dm13 = JSON.parse(readFileSync(join(S13, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(!JSON.stringify(dm13).includes('MikalaiKryvusha') && !JSON.stringify(dm13).includes('github.com'),
   'S13 манифест не несёт origin/автора');
const pkg13 = JSON.parse(readFileSync(join(S13, 'package.json'), 'utf8'));
ok(pkg13.scripts && pkg13.scripts['kaif:check'] === 'echo OWNER-OWN-SCRIPT',
   '🔴 S13 одноимённый скрипт ВЛАДЕЛЬЦА пережил самоочистку (снятие по значению, не по имени)');
// bootstrap 9.9: свежий тонкий вход — симулируем работу лоадера (кладём ядро+бандл 9.9)
seed(S13, SRC);
r = run(S13, 'install --mode anonymous');
ok(r.code === 0, 'S13 bootstrap-update 9.9 exit 0', r.out);
ok(r.out.includes('classified against the surviving deploy manifest'),
   '🔴 S13 классификация против выжившего манифеста (не adopt-everything)', r.out);
ok(readFileSync(join(S13, 'PHILOSOPHY.md'), 'utf8').includes('UPSTREAM ADDITION 9.9'),
   '🔴 S13 апстримный модуль ВЛИТ МЕХАНИЧЕСКИ (отчёт 08: «механика двигала только штамп» — мёртв)');
const mk13 = JSON.parse(readFileSync(join(S13, '.kaif', 'kaif.json'), 'utf8'));
ok(mk13.version === '9.9' && mk13.tracking === 'anonymous', 'S13 маркер продвинут, tracking цел');
r = run(S13, 'update');
ok(r.code !== 0 && /surviving deploy manifest makes that pass mechanical/.test(r.out),
   'S13 cmdUpdate для anonymous — честный отказ с новой формулировкой');

// ---------------------------------------------------------------- S14: легаси без манифеста + синтетический слепок
console.log('\n=== S14: легаси без манифеста — синтетический слепок из артефакта старой версии ===');
const S14 = join(ROOT, 's14'); mkdirSync(S14); seed(S14);
r = run(S14, 'install');
ok(r.code === 0, `S14 install (${CUR}) exit 0`, r.out);
unlinkSync(join(S14, '.kaif', 'deploy-manifest.json')); // «древний» проект: снапшотов нет
// локализация модуля PHILOSOPHY [1] (заголовок цел, тело русское) — должна пережить слепок
const P14 = join(S14, 'PHILOSOPHY.md');
const p14 = splitModules(readFileSync(P14, 'utf8'));
p14[1].lines = [p14[1].lines[0], '', 'Русская локализация модуля — обязана пережить слепочный апдейт.', ''];
writeFileSync(P14, joinModules(p14));
seed(S14, SRC); // bootstrap 9.9
r = run(S14, `install --baseline ${DIST}`);
ok(r.code === 0, 'S14 легаси-bootstrap с --baseline exit 0', r.out);
ok(r.out.includes('synthetic baseline'), '🔴 S14 синтетический слепок построен (легаси-путь не слеп)');
ok(r.out.includes('classified against a synthetic baseline'), 'S14 классификация против слепка');
const p14txt = readFileSync(P14, 'utf8');
ok(p14txt.includes('Русская локализация модуля'), '🔴 S14 локализованный модуль пережил слепочный апдейт');
ok(p14txt.includes('UPSTREAM ADDITION 9.9'), '🔴 S14 апстримный модуль влит механически при ПУСТОМ манифесте');
const dm14 = JSON.parse(readFileSync(join(S14, '.kaif', 'deploy-manifest.json'), 'utf8'));
ok(dm14.manifestVersion === 2 && dm14.templateShas, 'S14 манифест регенерирован в v2 — дальше проект живёт штатно');
// недоступный baseline → честный фолбэк на классику
const S14b = join(ROOT, 's14b'); mkdirSync(S14b); seed(S14b);
run(S14b, 'install');
unlinkSync(join(S14b, '.kaif', 'deploy-manifest.json'));
seed(S14b, SRC);
r = run(S14b, `install --baseline ${join(ROOT, 'no-such-dir')}`);
ok(r.code === 0 && /no baseline artifact reachable/.test(r.out) && /adopt-everything/.test(r.out),
   'S14b недоступный слепок → честный фолбэк на классический легаси-путь', r.out);

// ---------------------------------------------------------------- S14c: конфликт на bootstrap-пути + интервал новостей
console.log('\n=== S14c: конфликтный модуль на слепочном пути → дифф в задаче; новости интервалом ===');
const S14c = join(ROOT, 's14c'); mkdirSync(S14c); seed(S14c);
run(S14c, 'install');
unlinkSync(join(S14c, '.kaif', 'deploy-manifest.json'));
// маркер прикидываемся 1.4 — интервал (1.4, 9.9] обязан напечатать И 1.5, И 1.6 блоки новостей
const mk14c = JSON.parse(readFileSync(join(S14c, '.kaif', 'kaif.json'), 'utf8'));
mk14c.version = '1.4';
writeFileSync(join(S14c, '.kaif', 'kaif.json'), JSON.stringify(mk14c, null, 2) + '\n');
// проектный документ, утверждающий СТАРУЮ версию, — П9: машинерия обязана его найти
writeFileSync(join(S14c, 'PROJECT_NOTES.md'), '# Наш проект\n\nМы работаем на KAIF 1.4 и довольны.\n');
// локальная правка В ТОМ ЖЕ модуле [2], который меняет апстрим 9.9 → конфликт
const P14c = join(S14c, 'PHILOSOPHY.md');
const p14c = splitModules(readFileSync(P14c, 'utf8'));
p14c[2].lines.push('', 'LOCAL BOOTSTRAP CONFLICT EDIT');
writeFileSync(P14c, joinModules(p14c));
seed(S14c, SRC);
r = run(S14c, `install --baseline ${DIST}`);
ok(r.code === 0, 'S14c bootstrap exit 0', r.out);
const p14cTxt = readFileSync(P14c, 'utf8');
ok(p14cTxt.includes('LOCAL BOOTSTRAP CONFLICT EDIT') && !p14cTxt.includes('UPSTREAM ADDITION 9.9'),
   'S14c конфликтный модуль сохранён, апстрим не наложен молча');
const task14c = readFileSync(join(S14c, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task14c.includes('merge-modules') && task14c.includes('```diff') && task14c.includes('+ UPSTREAM ADDITION 9.9'),
   '🔴 S14c bootstrap-задача несёт по-модульный дифф (классификация дошла до задачи)');
ok(task14c.includes('bootstrap update 1.4 → 9.9, classified mechanically'),
   'S14c контекст-строка честная с counters');
ok(task14c.includes('**1.5:**') && task14c.includes('**1.6:**'),
   '🔴 S14c новости напечатаны ИНТЕРВАЛОМ (1.4 → 9.9 показывает и 1.5, и 1.6)');
ok(task14c.includes('stale-claims') && task14c.includes('PROJECT_NOTES.md'),
   '🔴 S14c протухшее утверждение «KAIF 1.4» в проектном доке найдено машинерией (П9)');

// ---------------------------------------------------------------- S14d: deprecations — упразднение артефактов прошлых релизов
console.log('\n=== S14d: deprecations — нетронутое удаляется механически, правленное уходит в задачу ===');
const SRCD = join(ROOT, 'src-9.9-dep'); mkdirSync(SRCD);
let bundleD = readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), 'utf8');
// заменяем СУЩЕСТВУЮЩИЙ ключ меты (сборка кладёт "deprecations": []) — второй ключ JSON.parse
// молча перекрыл бы наш тестовый (поймано этим же тестом)
bundleD = bundleD.replace('"deprecations": [],',
  '"deprecations": [{"path": ".claude/skills/what-next/SKILL.md", "reason": "retired in test"}, {"path": ".claude/skills/help-kaif/SKILL.md", "reason": "retired in test"}],');
// упразднённые файлы не должны ехать в новом бандле (иначе классификация их снова напишет)
const dropBlock = (text, p) => text.replace(new RegExp('^> \\*\\*FILE: `' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
  '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n[\\s\\S]*?\\n' + FENCE + '\\n?', 'm'), '');
bundleD = dropBlock(bundleD, '.claude/skills/what-next/SKILL.md');
bundleD = dropBlock(bundleD, '.claude/skills/help-kaif/SKILL.md');
writeFileSync(join(SRCD, 'KAIF-CORE-BUNDLE.md'), bundleD);
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(SRCD, 'KAIF-CORE.mjs'));
const manD = JSON.parse(readFileSync(join(SRC, 'kaif-manifest.json'), 'utf8'));
manD.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRCD, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRCD, 'kaif-manifest.json'), JSON.stringify(manD, null, 2) + '\n');
const S14d = join(ROOT, 's14d'); mkdirSync(S14d); seed(S14d);
run(S14d, 'install');
// help-kaif правим локально (должен уцелеть и попасть в задачу), what-next не трогаем (должен удалиться)
const HK = join(S14d, '.claude/skills/help-kaif/SKILL.md');
writeFileSync(HK, readFileSync(HK, 'utf8') + '\nLOCAL EDIT ON DEPRECATED\n');
r = run(S14d, `update --source ${SRCD}`);
ok(r.code === 0, 'S14d update с deprecations exit 0', r.out);
ok(!existsSync(join(S14d, '.claude/skills/what-next/SKILL.md')) && /retired .*what-next/.test(r.out),
   '🔴 S14d нетронутый упразднённый артефакт УДАЛЁН механически (T10 мёртв)');
ok(existsSync(HK) && readFileSync(HK, 'utf8').includes('LOCAL EDIT ON DEPRECATED'),
   'S14d правленный упразднённый — НЕ удалён');
const task14d = readFileSync(join(S14d, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task14d.includes('deprecations') && task14d.includes('help-kaif'),
   'S14d правленный упразднённый вынесен пунктом задачи');

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ все песочницы 5.5 зелёные'}`);
process.exit(failures ? 1 : 0);
