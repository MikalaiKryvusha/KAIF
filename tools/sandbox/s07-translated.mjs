// s07-translated.mjs — свод эпика B (план 23, Фаза B0): «обновление против ЦЕЛИКОМ переведённого
// развёртывания» + мелкие классы отчёта ndim 1.6→2.0 (ideas/ai_agents_reports/23, K1–K5).
//
// ⚠️ Дисциплина стражей (EXP-0017): свод написан ДО фиксов и обязан быть КРАСНЫМ на текущем коде
// ровно в стражах K1/K2/K3/K4/K5 (красный прогон — доказательство, зафиксирован в bugs/20–23).
// В tools/sandbox-suite.mjs свод вписывается в Фазе B1 ВМЕСТЕ с фиксами, когда зеленеет.
//
// Сценарии:
//   T1 (K1, bugs/20)  — файл переведён ВМЕСТЕ с заголовками → модульное слияние не должно
//                       удваивать документ английским шаблоном; файл идёт в diverged с пометкой.
//   T4 (K5, bugs/23)  — журналы прошлого (researches/, EXPERIENCE, «Предыдущее…» в STATUS)
//                       не попадают в stale-claims. (Фикстура живёт в песочнице T1.)
//   T2 (K2, bugs/20)  — i18n: translated: замен нет, но per-module диффы В ЗАДАНИИ есть;
//                       нетронутый чисто-EN файл под флагом ВСЁ РАВНО обновляется механически.
//   T3 (K4, bugs/22)  — package.json с уже вшитыми хендлами и CRLF не переписывается.
//   T5 (K3, bugs/21)  — diff --source на v1-манифесте не рапортует пустой ноль (hollow green),
//                       а строит синтетическую базу (--baseline) и показывает реальную дельту.
import { readFileSync, writeFileSync, mkdirSync, rmSync, appendFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { splitModules, joinModules } from '../module-map-lib.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(REPO, 'dist');
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-translated'));
rmSync(ROOT, { recursive: true, force: true });
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
const seed = (dir) => {
  mkdirSync(join(dir, '.kaif', 'install'), { recursive: true });
  copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs'));
};
const copy = (a, b) => writeFileSync(b, readFileSync(a));

// ---- апстрим v9.9: правки модулей внутри блоков бандла (тот же приём, что в s02) --------------
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
bundle = editBundleModule(bundle, '.claude/skills/check-backlog/SKILL.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (check-backlog)'));
bundle = editBundleModule(bundle, 'PHILOSOPHY.md', 2, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (philosophy)'));
bundle = editBundleModule(bundle, 'TESTING_FRAMEWORK.md', 1, (m) => m.lines.push('', 'UPSTREAM ADDITION 9.9 (testing)'));
writeFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md'), bundle);
copy(join(DIST, 'KAIF-CORE.mjs'), join(SRC, 'KAIF-CORE.mjs'));
const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
man.version = '9.9';
man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(SRC, 'KAIF-CORE-BUNDLE.md')));
writeFileSync(join(SRC, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version; // «старая» версия = текущая сборка

// ---------------------------------------------------------------- T1+T4: перевод с заголовками
console.log('\n=== T1 (K1): файл переведён вместе с заголовками — слияние не удваивает документ ===');
const T1 = join(ROOT, 't1'); mkdirSync(T1); seed(T1);
let r = run(T1, 'install --lang ru');
ok(r.code === 0, 'T1 install --lang ru exit 0', r.out);
const CB = join(T1, '.claude/skills/check-backlog/SKILL.md');
const cbOrig = readFileSync(CB, 'utf8');
// «перевод целиком»: фронтматтер (преамбула) сохранён байт в байт, все заголовки и тексты — русские
const cbPre = cbOrig.slice(0, cbOrig.search(/^# /m));
writeFileSync(CB, cbPre +
  '# /check-backlog — ревизия беклога\n\nПройтись по bugs/ и plans/, найти всё открытое.\n\n' +
  '## Что делать\n\nШаги ревизии по-русски.\n\n' +
  '## Заметки\n\nЗаметки по-русски.\n');
const cbLenBefore = statSync(CB).size;
// T4-фикстура (K5): журналы прошлого, честно упоминающие старую версию
mkdirSync(join(T1, 'researches'), { recursive: true });
writeFileSync(join(T1, 'researches', '15_kaif_20_note.md'), `# Отчёт\n\nЭтот документ ПРО KAIF ${FROM} и его механику — история, не протухание.\n`);
appendFileSync(join(T1, 'EXPERIENCE.md'), `\nEXP-0001 · обновление KAIF ${FROM} прошло зелёным (журнал прошлого).\n`);
appendFileSync(join(T1, 'STATUS.md'), `\nПредыдущее обновление: KAIF ${FROM}.\n`);

r = run(T1, `update --source ${SRC}`);
ok(r.code === 0, 'T1 update →9.9 exit 0', r.out);
const cbTxt = readFileSync(CB, 'utf8');
ok(!/^# \/check-backlog — [A-Za-z]/m.test(cbTxt), 'K1: английский H1 шаблона НЕ вставлен рядом с русским (нет удвоения)');
ok(cbTxt.includes('ревизия беклога'), 'K1: русский текст владельца цел');
ok(statSync(CB).size <= cbLenBefore * 1.5, `K1: файл не разбух (${cbLenBefore} → ${statSync(CB).size} байт)`);
ok(!new RegExp('merged \\d+ module\\(s\\) into \\.claude/skills/check-backlog').test(r.out), 'K1: лог не рапортует «merged» на переведённом файле');
const task1 = readFileSync(join(T1, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(/check-backlog\/SKILL\.md/.test(task1) && /translated wholesale/.test(task1), 'K1: задание называет файл «translated wholesale» в diverged');
console.log('\n=== T4 (K5): журналы прошлого не считаются протухшими утверждениями ===');
ok(!task1.includes('researches/15_kaif_20_note.md'), 'K5: researches/ не в stale-claims');
ok(!/stale-claims[^]*EXPERIENCE\.md/.test(task1), 'K5: EXPERIENCE.md не в stale-claims');
ok(!/stale-claims[^]*Предыдущее обновление/.test(task1), 'K5: строка «Предыдущее обновление» STATUS пропущена');

// ---------------------------------------------------------------- T2: i18n translated — диффы есть, EN-файлы живут
console.log('\n=== T2 (K2): i18n translated — не слепота, а «не заменять, но анализировать» ===');
const T2 = join(ROOT, 't2'); mkdirSync(T2); seed(T2);
run(T2, 'install --lang ru');
const mk = JSON.parse(readFileSync(join(T2, '.kaif', 'kaif.json'), 'utf8'));
mk.i18n = 'translated';
writeFileSync(join(T2, '.kaif', 'kaif.json'), JSON.stringify(mk, null, 2) + '\n');
// локальная правка в ТОМ ЖЕ модуле PHILOSOPHY, что меняет апстрим (заголовки целы — EN)
const P2 = join(T2, 'PHILOSOPHY.md');
const p2 = splitModules(readFileSync(P2, 'utf8'));
p2[2].lines.push('', 'LOCAL EDIT in the SAME module upstream changes');
writeFileSync(P2, joinModules(p2));
const tfShaBefore = sha256(readFileSync(join(T2, 'TESTING_FRAMEWORK.md')));
r = run(T2, `update --source ${SRC}`);
ok(r.code === 0 && r.out.includes('i18n: translated'), 'T2 update exit 0, флаг признан', r.out);
ok(!readFileSync(P2, 'utf8').includes('UPSTREAM ADDITION'), 'K2: локализованный проект — ни одной молчаливой замены правленного');
const task2 = readFileSync(join(T2, 'KAIF_UPDATE_TASK.md'), 'utf8');
ok(task2.includes('## Module diffs') && task2.includes('+ UPSTREAM ADDITION 9.9 (philosophy)'),
   'K2: обещанные per-module диффы ЕСТЬ в задании (лог/доки перестали врать)');
ok(readFileSync(join(T2, 'TESTING_FRAMEWORK.md'), 'utf8').includes('UPSTREAM ADDITION 9.9 (testing)'),
   'K2: нетронутый чисто-EN файл обновлён механически несмотря на флаг',
   'sha до=' + tfShaBefore.slice(0, 12));

// ---------------------------------------------------------------- T3: package.json не переписывается зря
console.log('\n=== T3 (K4): package.json с вшитыми хендлами и CRLF не трогается ===');
const T3 = join(ROOT, 't3'); mkdirSync(T3); seed(T3);
const pkgText = '{\r\n  "name": "sbx-project",\r\n  "scripts": {\r\n    "kaif:version": "node .kaif/kaif-core.mjs version",\r\n    "kaif:check": "node .kaif/kaif-core.mjs check",\r\n    "kaif:update": "node .kaif/kaif-core.mjs update"\r\n  }\r\n}\r\n';
writeFileSync(join(T3, 'package.json'), pkgText);
r = run(T3, 'install');
ok(r.code === 0, 'T3 install exit 0', r.out);
ok(readFileSync(join(T3, 'package.json'), 'utf8') === pkgText, 'K4: package.json байт в байт не тронут (хендлы уже были)');

// ---------------------------------------------------------------- T5: diff --source на v1-манифесте
console.log('\n=== T5 (K3): первое обновление не слепо — diff работает и на v1-манифесте ===');
const T5 = join(ROOT, 't5'); mkdirSync(T5); seed(T5);
run(T5, 'install');
const dmPath = join(T5, '.kaif', 'deploy-manifest.json');
const dm = JSON.parse(readFileSync(dmPath, 'utf8'));
delete dm.templateShas; delete dm.moduleShas; dm.manifestVersion = 1;   // симуляция развёртывания 1.x
writeFileSync(dmPath, JSON.stringify(dm, null, 2) + '\n');
r = run(T5, `diff --source ${SRC} --baseline ${DIST}`);
ok(r.code === 0, 'T5 diff --source exit 0', r.out);
ok(!/diff vs 9\.9: 0 file\(s\)/.test(r.out) && /[1-9]\d* file\(s\) carry upstream/.test(r.out),
   'K3: на v1-манифесте diff показывает РЕАЛЬНУЮ дельту (синтетическая база), а не пустой ноль', r.out);

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ s07: все стражи зелёные'}`);
process.exit(failures ? 1 : 0);
