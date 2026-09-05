// s17-report.mjs — песочница команды `kaif-core report` (2.5, эпик SG, plans/84; поле: шаг доставки
// /report-bug ПРОЗОЙ дважды не записался на диск — классификатор агентской системы реагирует на
// предмет, не на слова). Живой `gh` полигон НЕ зовёт (внешних действий у полигона нет): на швe
// KAIF_GH стоит подменный скрипт, который пишет argv в журнал и отвечает по режиму GH_SHIM_MODE.
// Оба ответа на развёрнутой копии: доставка → URL в строке `Delivered upstream:` тикета, заголовок
// issue = H1, тело несёт трейлер авторства · dry-run — ни одного вызова · четыре отказа названы
// (anonymous · нет gh · не тикет · gh отказал) · повтор на доставленном — идемпотентен · таймаут —
// «исход неизвестен» (exit 3), тикет не тронут. Красный доказан на HEAD-ядре до SG1:
// `unknown command: report` (наблюдение в plans/84).
// [TESTED: 2026-09-04 · зелёный в составе полигона — 25 проверок свода ✅, «sandbox suite: all 17 suites
//  green» (npm run test:core); КРАСНЫЙ доказан на копии: тот же свод против HEAD-ядра до SG1
//  (git show HEAD:dist/KAIF-CORE.mjs в scratch-dist) → exit 1, 17 проверок красные (+ строка-итог
//  `17 failure(s)`; 10 из них — словами «unknown command: report», остальные производные) — число
//  пересчитано судом RL 2.5 (2026-09-04, C-H1: прежние «18» считали строку-итог проверкой)]
// [TESTED: 2026-09-05 · 2.6 UR4 (#40) + C-H3: 32 проверки свода ✅ в составе полигона «all 21 suites
//  green»; КРАСНЫЙ доказан швом KAIF_DIST против HEAD-сборки cb42039 (2.5, до UR4): ровно четыре
//  новых ассерта UR4 красные (строчный «not yet» → exit 1 · `#37` на строке → exit 1 · `#37` на
//  строке-продолжении → exit 1 · отказ без обеих форм), C-H3 зелёный на обеих (правка формулы Reference,
//  не кода); шов KAIF_DIST добавлен в этот свод тем же шагом — до него красное доказательство было
//  невозможно без правки кода свода]
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// KAIF_DIST — шов для доказательства красного: свод против ЧУЖОЙ сборки (HEAD до фикса) без правки кода (прецедент s20).
const DIST = process.env.KAIF_DIST ? resolve(process.env.KAIF_DIST) : join(REPO, 'dist');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('report', process.argv[2]);
const S = join(ROOT, 'deploy');
mkdirSync(join(S, '.kaif', 'install'), { recursive: true });
mkdirSync(join(S, 'bugs', 'KAIF'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// stderr сливается в out и на зелёном коде тоже (bugs/61: результат каждой команды судится в ok(...)).
const SHIM = join(ROOT, 'gh-shim.mjs');
const CALLS = join(ROOT, 'gh-calls.log');
const run = (args, env = {}) => {
  const e = { ...process.env, KAIF_GH: SHIM, GH_SHIM_LOG: CALLS, ...env };
  try { return { code: 0, out: execSync(`node ${join(S, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd: S, stdio: 'pipe', env: e }).toString() }; }
  catch (err) { return failed(err, { root: ROOT, cwd: ROOT, args: args }); }
};
const calls = () => (existsSync(CALLS) ? readFileSync(CALLS, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const setTracking = (tracking) => {
  const p = join(S, '.kaif', 'kaif.json');
  const j = JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));
  if (tracking === 'anonymous') { j.tracking = 'anonymous'; delete j.origin; }
  else { j.tracking = 'origin'; j.origin = 'https://github.com/example-owner/example-kaif'; }
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
};
const TICKET = 'bugs/KAIF/07_fixture_ticket.md';
const ticketText = (delivered) => `# KAIF improvement request: fixture ticket for s17

kaif-fp: sandbox :: fixture :: v2.5
**Delivered upstream:** ${delivered}
**Autocapture** (from \`.kaif/kaif.json\`): KAIF 2.5 · project fixture · tracking origin

## Gap
A fixture body with a Cyrillic line — кириллическая строка — to prove the body travels as bytes.
`;
const writeTicket = (delivered = 'NOT YET — awaiting delivery') => writeFileSync(join(S, TICKET), ticketText(delivered));
const ticketLine = () => (readFileSync(join(S, TICKET), 'utf8').match(/^\*\*Delivered upstream:\*\*[^\n]*$/m) || [''])[0];

// Подменный gh: пишет argv строкой JSON в журнал, отвечает по режиму.
writeFileSync(SHIM, `import { appendFileSync, readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const mode = process.env.GH_SHIM_MODE || 'ok';
appendFileSync(process.env.GH_SHIM_LOG, JSON.stringify({ args, mode }) + '\\n');
if (args[0] === 'auth') { if (mode === 'hang-auth') { setTimeout(() => process.exit(0), 4000); } else process.exit(mode === 'noauth' ? 1 : 0); }
else if (mode === 'hang') { setTimeout(() => process.exit(0), 4000); }
else if (mode === 'refuse') { console.error('GraphQL: Could not resolve to a Repository (createIssue)'); process.exit(1); }
else {
  const repo = args[args.indexOf('--repo') + 1];
  const body = readFileSync(args[args.indexOf('--body-file') + 1], 'utf8');
  appendFileSync(process.env.GH_SHIM_LOG, JSON.stringify({ body }) + '\\n');
  console.log('https://github.com/' + repo + '/issues/999');
}
`);

// ---------------------------------------------------------------- деплой
console.log('\n=== s17: kaif-core report — канал сигналов машинерией ===');
cpSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(S, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
cpSync(join(DIST, 'KAIF-CORE.mjs'), join(S, '.kaif', 'kaif-core.mjs'));
let r = run('install');
ok(r.code === 0, 's17 install exit 0', r.out.slice(-400));
r = run('help');
ok(/^\s*report\s+⚠/m.test(r.out), 's17 help называет команду report (мутирующая)', r.out);

// ---------------------------------------------------------------- отказы, каждый своей фикстурой
writeTicket();
setTracking('anonymous');
r = run(`report ${TICKET}`);
ok(r.code === 2 && /stays LOCAL/.test(r.out), 's17 tracking: anonymous — отказ exit 2, «сигнал остаётся локальным»', r.out);
ok(calls().length === 0, 's17 anonymous — gh не вызывался вовсе');
setTracking('origin');

r = run(`report ${TICKET}`, { KAIF_GH: join(ROOT, 'no-such-gh-binary') });
ok(r.code === 2 && /not on PATH/.test(r.out), 's17 gh отсутствует — отказ exit 2 с лечением (install + gh auth login)', r.out);

r = run(`report ${TICKET}`, { GH_SHIM_MODE: 'noauth' });
ok(r.code === 2 && /gh auth status/.test(r.out), 's17 gh не авторизован — отказ exit 2 называет gh auth status', r.out);

writeFileSync(join(S, 'bugs', 'KAIF', 'not_a_ticket.md'), '# Just a note\n\nNo delivery line here.\n');
r = run('report bugs/KAIF/not_a_ticket.md');
ok(r.code === 1 && /not a KAIF ticket/.test(r.out), 's17 файл без строки Delivered upstream — «не тикет KAIF», exit 1', r.out);

r = run('report bugs/KAIF/missing.md');
ok(r.code === 1 && /ticket not found/.test(r.out), 's17 несуществующий путь — exit 1, названо', r.out);

// ---------------------------------------------------------------- dry-run: ни одного вызова
const before = calls().length;
r = run(`report ${TICKET} --dry-run`);
ok(r.code === 0 && /DRY-RUN: would run `gh issue create --repo example-owner\/example-kaif --title "KAIF improvement request: fixture ticket for s17"/.test(r.out),
   's17 --dry-run — печатает репозиторий и заголовок H1, exit 0', r.out);
ok(calls().length === before, 's17 --dry-run — gh не вызывался');
ok(/NOT YET/.test(ticketLine()), 's17 --dry-run — тикет не тронут');

// ---------------------------------------------------------------- доставка
r = run(`report ${TICKET}`);
ok(r.code === 0 && /✔ delivered: https:\/\/github\.com\/example-owner\/example-kaif\/issues\/999/.test(r.out), 's17 доставка — exit 0, URL напечатан', r.out);
ok(ticketLine() === '**Delivered upstream:** https://github.com/example-owner/example-kaif/issues/999', 's17 доставка — URL вписан в строку Delivered upstream тикета', ticketLine());
const create = calls().find((c) => c.args && c.args[0] === 'issue' && c.args[1] === 'create');
ok(Boolean(create) && create.args[create.args.indexOf('--repo') + 1] === 'example-owner/example-kaif', 's17 доставка — gh issue create с --repo из origin маркера', JSON.stringify(create));
ok(Boolean(create) && create.args[create.args.indexOf('--title') + 1] === 'KAIF improvement request: fixture ticket for s17', 's17 доставка — заголовок issue = H1 тикета');
const sent = calls().find((c) => c.body);
ok(Boolean(sent) && /standing authorization \(origin issue #15\)/.test(sent.body) && /кириллическая строка/.test(sent.body),
   's17 доставка — тело несёт трейлер авторства (#15) и кириллицу тикета без потерь', sent && sent.body.slice(-200));
ok(Boolean(sent) && /\*\*Delivered upstream:\*\* \(this issue\)/.test(sent.body), 's17 доставка — в теле issue строка NOT YET заменена на «(this issue)»');
ok(Boolean(calls().find((c) => c.args && c.args[0] === 'auth')), 's17 доставка — gh auth status проверен до создания');

// ---------------------------------------------------------------- идемпотентность
const afterDelivery = calls().length;
r = run(`report ${TICKET}`);
ok(r.code === 0 && /already delivered: https:\/\/github\.com\/example-owner\/example-kaif\/issues\/999/.test(r.out), 's17 повтор на доставленном — «already delivered», exit 0', r.out);
ok(calls().length === afterDelivery, 's17 повтор — второго issue нет (gh не вызывался)');

// ---------------------------------------------------------------- gh отказал → NOT YET остаётся
writeTicket();
r = run(`report ${TICKET}`, { GH_SHIM_MODE: 'refuse' });
ok(r.code === 2 && /gh refused \(exit 1\): GraphQL: Could not resolve/.test(r.out), 's17 gh отказал — exit 2 словами самого gh', r.out);
ok(/NOT YET/.test(ticketLine()), 's17 gh отказал — тикет остаётся NOT YET');

// ---------------------------------------------------------------- таймаут → исход НЕИЗВЕСТЕН, не отказ
r = run(`report ${TICKET}`, { GH_SHIM_MODE: 'hang', KAIF_GH_TIMEOUT_MS: '800' });
ok(r.code === 3 && /OUTCOME UNKNOWN/.test(r.out) && /gh issue list --repo example-owner\/example-kaif/.test(r.out),
   's17 таймаут gh — exit 3 «OUTCOME UNKNOWN» с командой ручной проверки, не «отказ»', r.out);
ok(!/refused/.test(r.out), 's17 таймаут — слово «refused» не произнесено');
ok(/NOT YET/.test(ticketLine()), 's17 таймаут — тикет не тронут');

// ---------------------------------------------------------------- 2.6 UR4 (origin #40): формы контракта `Delivered upstream:`
// Поле: три тикета 2.2–2.4 писали «not yet» строчными, четвёртый — доставленный рукой — нёс `origin **#37**`
// на строке-продолжении (перенос на 100 колонок); все четыре получали один отказ, не называвший ни одной
// законной формы. Красный на HEAD-ядре до UR4: (1) exit 1 · (2) exit 1 · (3) exit 1 · (4) в отказе нет «#NN».
console.log('\n=== 2.6 UR4 (#40): «not yet» в любом регистре · #NN = доставлено · контракт абзацем · отказ называет обе формы ===');
writeTicket('not yet — awaiting the field report');
r = run(`report ${TICKET} --dry-run`);
ok(r.code === 0 && /DRY-RUN/.test(r.out), 's17/UR4 (критерий 4): «not yet» строчными — законная недоставленная форма, dry-run проходит', r.out);
writeTicket('✅ sent 2026-08-30 by hand — origin #37');
r = run(`report ${TICKET} --dry-run`);
ok(r.code === 0 && /already delivered: #37/.test(r.out), 's17/UR4 (критерий 4): `#NN` на строке = доставлено — идемпотентность, не отказ и не дубль', r.out);
writeFileSync(join(S, TICKET), ticketText('✅ this issue — sent 2026-08-30 immediately on filing, per the rule this')
  .replace('**Autocapture**', 'project records in origin **#37**.\n**Autocapture**'));
r = run(`report ${TICKET} --dry-run`);
ok(r.code === 0 && /already delivered: #37/.test(r.out), 's17/UR4: контракт читается АБЗАЦЕМ — `#37` на строке-продолжении (перенос на 100 колонок) = доставлено', r.out);
writeTicket('later maybe');
r = run(`report ${TICKET} --dry-run`);
ok(r.code !== 0 && /NOT YET — <why it waits>/.test(r.out) && /<issue URL or #NN>/.test(r.out), 's17/UR4 (критерий 4): нераспознанная строка — отказ называет ОБЕ законные формы и точную правку', r.out);
// C-H3 (суд RL 2.5): зависший `gh auth status` — честный «not ready» (exit 2: ничего не отправлялось, дубля быть
// не может); «OUTCOME UNKNOWN» exit 3 — только для `issue create`. Формула Reference §10.7 уточнена в 2.6.
writeTicket();
r = run(`report ${TICKET}`, { GH_SHIM_MODE: 'hang-auth', KAIF_GH_TIMEOUT_MS: '800' });
ok(r.code === 2 && /gh is not ready/.test(r.out) && !/OUTCOME UNKNOWN/.test(r.out), 's17/C-H3: таймаут gh auth status — exit 2 «not ready», не «исход неизвестен» (ничего не отправлялось)', r.out);
ok(/NOT YET/.test(ticketLine()), 's17/C-H3: тикет не тронут');

if (failures) { console.error(`\n❌ s17: ${failures} failure(s)`); process.exit(1); }
console.log('\n✅ s17 report: all green');
