// s20-delivery.mjs — песочница команды `kaif-core delivery` (2.6, эпик OQ, plans/90 критерии 5 и 7;
// поле: строка DELIVERY: 2.5 велела «назвать ОДНУ метрику владельцу» — агенты четырёх обновившихся
// проектов пошли спрашивать владельцев, чем мерить; №97 «механика отгружается только полной»,
// №99 «вектор по системам, по пояснению владельца в поле»). Оба ответа на развёрнутой копии:
// без реестра — exit 3 с командой копирования шаблона · реестр из трёх систем → строка из шести
// чисел (проценты с дробью) · `--json` детерминирован (два прогона — побайтно равны) и несёт
// isolated · `[x]`/`[ ]`, CRLF и лишняя колонка читаются так же (парсер по заголовкам, не по
// позициям) · черновик → суффикс «registry: draft» · `--system` — дробь одной системы · неизвестная
// потребность и нечитаемая клетка — отказ, называющий строку и колонку · help называет команду
// немутирующей · мета бандла несёт policy-change 2.6 без «спросите владельца» (критерий 7: ключ
// '2.6' инертен, пока version() = 2.5 — интервальный ассерт по KAIF_UPDATE_TASK.md взводится бампом
// версии в RL; здесь стережётся ТЕКСТ записи). Красный доказан на HEAD-ядре до OQ2:
// `KAIF_DIST=<scratch с git show HEAD:dist/*>` → `unknown command: delivery`, exit 1.
// [TESTED: 2026-09-05 · зелёный в составе полигона — 32 проверки свода ✅, «sandbox suite: all 20 suites
//  green» (npm run test:core); КРАСНЫЙ доказан на копии: тот же свод против HEAD-ядра до OQ2
//  (KAIF_DIST=<scratch с git show HEAD:dist/KAIF-CORE.mjs и бандлом> — ядро e67aea7) → exit 1,
//  28 проверок красные (15 из них словами «unknown command: delivery», остальные производные), зелёными
//  остались ровно четыре, не адресующие команду: install · «без пометки draft» · мета-блок читается ·
//  «никто не велит спросить владельца о метрике»]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// KAIF_DIST — шов для доказательства красного: свод против ЧУЖОЙ сборки (HEAD до фикса) без правки кода.
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('delivery', process.argv[2]);
const S = join(ROOT, 'deploy');
mkdirSync(join(S, '.kaif', 'install'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// stderr сливается в out и на зелёном коде тоже (bugs/61: результат каждой команды судится в ok(...)).
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd: S, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd: ROOT, args: args }); }
};
const REG = join(S, 'SYSTEMS_REGISTRY.md');
const HEADER = '| # | System | Own action | Own state | Needs (feeds from) | Specified | Accepted | Implemented | Verified in use | Lives in |\n|---|---|---|---|---|---|---|---|---|---|\n';
// Фикстура критерия 5 plans/90: у первой ☑☑☐☐ и потребность во второй (☑☑☑☐), третья ☐☐☐☐ без потребностей.
const ROWS = [
  '| 1 | Health | hit points rise and fall | current HP | Trade | ☑ | ☑ | ☐ | ☐ | src/health |',
  '| 2 | Trade | buy and sell | inventory prices | — | ☑ | ☑ | ☑ | ☐ | src/trade |',
  '| 3 | Caves | generate a cave | seed and layout | — | ☐ | ☐ | ☐ | ☐ | src/caves |',
];
const registry = (rows = ROWS, status = '**Status:** approved 2026-09-05', header = HEADER) =>
  `# Systems registry — fixture\n\n${status}\n\n## Registry\n\n${header}${rows.join('\n')}\n\n## Boundary notes\n\nnone\n`;
const EXPECTED = 'DELIVERY: systems 3 · complete 42 % (5 of 12) · integrated 100 % (1 of 1) · holes 1 · contradictions 0 · bugs 1';

// ---------------------------------------------------------------- деплой
console.log('\n=== s20: kaif-core delivery — вектор доставки без вопроса владельцу ===');
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
let r = run('install');
ok(r.code === 0, 's20 install exit 0', r.out.slice(-400));
r = run('help');
ok(/^\s*delivery\s+(?!⚠)\S/m.test(r.out), 's20 help называет команду delivery НЕмутирующей', r.out);
ok(existsSync(join(S, '.kaif', '_systems-registry-template.md')) && /Systems registry/.test(readFileSync(join(S, '.kaif', '_systems-registry-template.md'), 'utf8')),
   's20 шаблон реестра развёрнут в .kaif/_systems-registry-template.md');

// ---------------------------------------------------------------- без реестра: exit 3 + команда копирования шаблона
r = run('delivery');
ok(r.code === 3, 's20 без реестра — exit 3 («нечего мерить», не отказ и не зелёный)', r.out);
ok(/systems registry not built yet — draft it: cp \.kaif\/_systems-registry-template\.md SYSTEMS_REGISTRY\.md/.test(r.out),
   's20 без реестра — сообщение несёт команду копирования шаблона', r.out);
ok(/DELIVERY: registry not built yet/.test(r.out), 's20 без реестра — названа форма строки «registry not built yet»', r.out);

// ---------------------------------------------------------------- фикстура критерия 5: три системы + три класса находок
mkdirSync(join(S, 'bugs', 'KAIF'), { recursive: true });
writeFileSync(join(S, 'bugs', '01_hole.md'), '# Bug 01 — rules are silent on death\n\n**Status:** 🔴 OPEN\n**Kind:** hole\n\n## Symptom\nnothing\n');
writeFileSync(join(S, 'bugs', '02_plain.md'), '# Bug 02 — no Kind line at all\n\n**Status:** 🔴 OPEN\n\n## Symptom\nnothing\n');
writeFileSync(join(S, 'bugs', '03_DONE_old.md'), '# Bug 03 — closed contradiction\n\n**Status:** ✅ DONE\n**Kind:** contradiction\n');
writeFileSync(join(S, 'bugs', 'KAIF', '04_ticket.md'), '# KAIF bug: framework ticket, not a product finding\n\n**Kind:** hole\n');
writeFileSync(REG, registry());
r = run('delivery');
ok(r.code === 0, 's20 реестр из 3 систем — exit 0', r.out);
ok(r.out.trim() === EXPECTED, `s20 строка = «${EXPECTED}»`, r.out);
ok(!/draft/.test(r.out), 's20 утверждённый реестр — без пометки draft');

// ---------------------------------------------------------------- --json: шесть чисел + isolated, детерминизм
r = run('delivery --json');
let j = null;
try { j = JSON.parse(r.out); } catch { /* судится ниже */ }
ok(r.code === 0 && j !== null, 's20 --json — валидный JSON, exit 0', r.out.slice(-300));
ok(j && j.systems === 3 && j.complete.done === 5 && j.complete.total === 12 && j.complete.percent === 42,
   's20 --json — systems 3, complete 42 % (5 of 12)', JSON.stringify(j && j.complete));
ok(j && j.integrated.closed === 1 && j.integrated.declared === 1 && j.integrated.percent === 100,
   's20 --json — integrated 100 % (1 of 1)', JSON.stringify(j && j.integrated));
ok(j && j.holes === 1 && j.contradictions === 0 && j.bugs === 1,
   's20 --json — holes 1 · contradictions 0 · bugs 1 (DONE и bugs/KAIF не считаются; без Kind — bug)', JSON.stringify(j && [j.holes, j.contradictions, j.bugs]));
ok(j && j.isolated === 2, 's20 --json — isolated 2 (системы без потребностей — диагностика, не седьмое число)', j && j.isolated);
ok(j && j.line === EXPECTED, 's20 --json — поле line равно печатной строке');
const again = run('delivery --json');
ok(again.code === 0 && again.out === r.out, 's20 --json ×2 — побайтно равны (детерминизм; реестр отсортирован по имени)');
ok(j && j.registry.map((x) => x.name).join(',') === 'Caves,Health,Trade', 's20 --json — registry в каноническом порядке имён', j && j.registry.map((x) => x.name).join(','));

// ---------------------------------------------------------------- владельческая правка таблицы: [x]/[ ], CRLF, лишняя колонка
const HEADER2 = '| # | System | Owner note | Own action | Own state | Needs (feeds from) | Specified | Accepted | Implemented | Verified in use | Lives in |\r\n|---|---|---|---|---|---|---|---|---|---|---|\r\n';
const ROWS2 = [
  '| 1 | Health | keep | hit points rise and fall | current HP | Trade | [x] | [x] | [ ] | [ ] | src/health |',
  '| 2 | Trade | keep | buy and sell | inventory prices | — | [x] | [x] | [x] | [ ] | src/trade |',
  '| 3 | Caves | later | generate a cave | seed and layout | — | [ ] | [ ] | [ ] | [ ] | src/caves |',
];
writeFileSync(REG, registry(ROWS2, '**Status:** approved 2026-09-05', HEADER2).replace(/\n/g, '\r\n'));
r = run('delivery');
ok(r.code === 0 && r.out.trim() === EXPECTED, 's20 [x]/[ ] + CRLF + лишняя колонка «Owner note» — та же строка (парсер по заголовкам)', r.out);

// ---------------------------------------------------------------- черновик: суффикс draft, вектор всё равно печатается
writeFileSync(REG, registry(ROWS, '**Status:** draft — awaiting the owner\'s approval'));
r = run('delivery');
ok(r.code === 0 && r.out.trim() === `${EXPECTED} · registry: draft (3 systems, awaiting the owner's approval)`,
   's20 черновик реестра — вектор печатается С суффиксом «registry: draft (3 systems, awaiting the owner\'s approval)»', r.out);
const jd = run('delivery --json');
ok(jd.code === 0 && /"draft": true/.test(jd.out), 's20 черновик — --json несёт draft: true');

// ---------------------------------------------------------------- --system: дробь одной системы; неизвестная — отказ с перечнем
writeFileSync(REG, registry());
r = run('delivery --system Trade');
ok(r.code === 0 && /^Trade: complete 75 % \(3 of 4\) · parts: Specified ☑ · Accepted ☑ · Implemented ☑ · Verified in use ☐ · needs 0 \(closed 0\)$/m.test(r.out),
   's20 --system Trade — «complete 75 % (3 of 4)» + четыре части', r.out);
r = run('delivery --system health');
ok(r.code === 0 && /^Health: complete 50 % \(2 of 4\) .* needs 1 \(closed 1\): Trade$/m.test(r.out), 's20 --system без учёта регистра — Health 50 % (2 of 4), потребность закрыта', r.out);
r = run('delivery --system Nope');
ok(r.code === 1 && /no system "Nope"/.test(r.out) && /known: Caves, Health, Trade/.test(r.out), 's20 --system Nope — exit 1, известные системы перечислены', r.out);

// ---------------------------------------------------------------- отказы парсера: называют строку и колонку
writeFileSync(REG, registry(['| 1 | Health | hit | HP | Magic | ☑ | ☑ | ☐ | ☐ | src |']));
r = run('delivery');
ok(r.code === 1 && /line 9 \(System "Health"\): needs "Magic" — no such system row/.test(r.out), 's20 неизвестная потребность — exit 1, строка и имя названы', r.out);
writeFileSync(REG, registry(['| 1 | Health | hit | HP | — | ☑ | maybe | ☐ | ☐ | src |']));
r = run('delivery');
ok(r.code === 1 && /line 9 \(System "Health"\), column "Accepted": "maybe" is not a checkbox/.test(r.out), 's20 нечитаемая клетка — exit 1, строка и колонка названы', r.out);
writeFileSync(REG, '# Systems registry\n\nno table here\n');
r = run('delivery');
ok(r.code === 1 && /no table with a "System" column/.test(r.out), 's20 файл без таблицы — exit 1, назван отсутствующий заголовок', r.out);

// ---------------------------------------------------------------- пустой реестр (только строка-плейсхолдер шаблона)
writeFileSync(REG, registry(['| 1 | <System name> | <what it does> | <what it keeps> | <other systems by name, or —> | ☐ | ☐ | ☐ | ☐ | <module> |']));
r = run('delivery');
ok(r.code === 0 && /^DELIVERY: systems 0 · complete n\/a \(no systems yet\) · integrated n\/a \(no needs declared\) · holes 1 · contradictions 0 · bugs 1$/m.test(r.out),
   's20 только плейсхолдер шаблона — systems 0, n/a с причиной, находки считаются', r.out);

// ---------------------------------------------------------------- критерий 7: policy-change 2.6 в мете бандла — без вопроса владельцу
const bundle = readFileSync(join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'), 'utf8').replace(/\r\n/g, '\n');
const metaStart = bundle.indexOf('\n{\n'), metaEnd = bundle.indexOf('\n}\n', metaStart);
let meta = null;
try { meta = JSON.parse(bundle.slice(metaStart + 1, metaEnd + 2)); } catch { /* судится ниже */ }
ok(meta !== null, 's20 мета-блок бандла читается как JSON');
const pol26 = meta && meta.policyChanges && meta.policyChanges['2.6'] ? meta.policyChanges['2.6'].join('\n') : '';
ok(/SYSTEMS_REGISTRY\.md/.test(pol26) && /kaif-core\.mjs delivery/.test(pol26), 's20 policy-change 2.6 называет реестр и команду delivery', pol26.slice(0, 200));
ok(/CLOSE it and build the registry/.test(pol26), 's20 policy-change 2.6 велит ЗАКРЫТЬ заведённое интервью «назовите метрику»');
ok(!/ask the owner[^.]*metric/i.test(pol26) && !/ask the owner[^.]*metric/i.test(readFileSync(join(S, '.kaif', 'kaif-core.mjs'), 'utf8')),
   's20 ни policy-change, ни ядро не велят «спросить владельца о метрике»');
const tn26 = meta && meta.templateNotesByVersion && meta.templateNotesByVersion['2.6'] ? meta.templateNotesByVersion['2.6'].join('\n') : '';
ok(/delivery/.test(tn26) && /SYSTEMS_REGISTRY\.md/.test(tn26), 's20 template-notes 2.6 называют delivery и реестр', tn26.slice(0, 200));

if (failures) { console.error(`\n❌ s20: ${failures} failure(s)`); process.exit(1); }
console.log('\n✅ s20 delivery: all green');
