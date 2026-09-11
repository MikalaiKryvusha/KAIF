// s24-attribution-lint.mjs — песочница линтера авторства решений (2.7, эпик AW, plans/101; тикет
// origin #55). Оба ответа на фикстурах: selftest модуля зелёный (RU + EN, оба ответа на каждой
// фикстуре, базовая линия) · плохая фикстура (полевая строка без цитаты + EN-двойник) → exit 1 с обоими
// файлами поимённо · чистая фикстура (цитата · адрес интервью · подпись [ИИ] · маркер) → exit 0 ·
// базовая линия глотает старый долг (exit 0, долг напечатан) и краснеет ТОЛЬКО на новой строке ·
// дерево без markdown → SKIPPED (exit 3, класс bugs/34: «не сканировано» ≠ «чисто»).
// [TESTED: 2026-09-12 · отдельный прогон — см. лог сессии 58; в составе полигона — all 24 suites green]
import { writeFileSync, readFileSync, mkdirSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../lib/temp-root.mjs';
import { failed } from '../lib/sandbox-run.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Корень прогона УНИКАЛЕН по построению (bugs/59) — через tempRoot, никогда фиксированным именем.
const ROOT = tempRoot('attributionlint', process.argv[2]);
for (const d of ['.kaif/tools', 'bad/plans', 'good/plans', 'empty', 'base/plans']) mkdirSync(join(ROOT, d), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-300)));
  if (!cond) failures++;
};
// Результат каждой команды судится внутри ok(...) — немых команд в своде нет (bugs/61).
const run = (args, cwd = ROOT) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-attribution-lint.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe' }).toString() }; }
  catch (e) { return failed(e, { root: ROOT, cwd, args }); }
};
cpSync(join(REPO, 'framework', 'tools', 'kaif-attribution-lint.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-attribution-lint.mjs'));

// --- selftest: оба ответа на каждой фикстуре в двух языках + базовая линия
let r = run('selftest');
ok(r.code === 0 && /selftest OK/.test(r.out), 's24 selftest — оба ответа на каждой фикстуре, RU + EN, базовая линия', r.out);

// --- КРАСНЫЙ ДОКАЗАН: полевая строка без цитаты и EN-двойник → exit 1, оба файла названы
const FIELD_LINE = '* ⚡ Ш5 — ОЖИДАНИЕ РАСПИСКИ РУКИ 2. Решение владельца П1 (plans/81 §3): ЖДАТЬ, порога не заводить.';
writeFileSync(join(ROOT, 'bad', 'plans', '81_fuse.md'), `# План 81\n\n${FIELD_LINE}\n\nДальше текст.\n`);
writeFileSync(join(ROOT, 'bad', 'plans', '82_en.md'), `# Plan 82\n\nThe owner's decision P1: wait, no threshold.\n`);
r = run('check', join(ROOT, 'bad'));
ok(r.code === 1 && /81_fuse\.md:3/.test(r.out) && /82_en\.md:3/.test(r.out) && /2 NEW finding/.test(r.out),
   's24 плохая фикстура — exit 1, обе строки (RU и EN) названы файлом и строкой', r.out);

// --- ЗЕЛЁНЫЙ: цитата · адрес интервью · подпись [ИИ] · маркер → exit 0
writeFileSync(join(ROOT, 'good', 'plans', '81_fuse.md'), [
  '# План 81', '',
  FIELD_LINE, 'Слово владельца дословно: «давай как ты считаешь» (2026-08-22).', '',
  'Решение владельца о пороге — интервью №031, Q1.', '',
  '[ИИ] по мандату — «давай как ты считаешь»: ждать расписки.', '',
  'Решение владельца П1: ждать. <!-- attribution-ok: plans/81 §3 -->', '',
  '## Решения, принятые агентом без владельца', '', '1. По решению владельца порог не заводился — нет, это выбор агента.', '',
].join('\n') + '\n');
r = run('check', join(ROOT, 'good'));
ok(r.code === 0 && /attribution-lint OK/.test(r.out) && /new 0/.test(r.out), 's24 чистая фикстура — exit 0 (цитата · адрес · подпись · маркер · секция без владельца)', r.out);

// --- БАЗОВАЯ ЛИНИЯ: старый долг проглочен (exit 0, долг напечатан), новая строка — exit 1 и только она
writeFileSync(join(ROOT, 'base', 'plans', '81.md'), `# П\n\n${FIELD_LINE}\n`);
r = run('check --write-baseline --baseline base.json', join(ROOT, 'base'));
ok(r.code === 0 && /baseline written/.test(r.out) && /1 finding/.test(r.out), 's24 базовая линия записана с одним долгом', r.out);
r = run('check --baseline base.json', join(ROOT, 'base'));
ok(r.code === 0 && /new 0/.test(r.out) && /debt 1/.test(r.out), 's24 повторный прогон — старый долг проглочен, new 0, debt 1', r.out);
writeFileSync(join(ROOT, 'base', 'plans', '81.md'), `# П\n\n${FIELD_LINE}\n\nВладелец велел убрать порог.\n`);
r = run('check --baseline base.json', join(ROOT, 'base'));
ok(r.code === 1 && /1 NEW finding/.test(r.out) && /велел/.test(r.out) && !/П1 \(plans/.test(r.out.split('\n').filter((l) => l.startsWith('✖ ')).join('\n')),
   's24 новая строка — exit 1, названа только она (старая — долг)', r.out);

// --- БАЗОВАЯ ЛИНИЯ ТОЛЬКО УБЫВАЕТ (каверза судьи F6): повторный --write-baseline при НОВОЙ находке —
//     ОТКАЗ (exit 1), файл базовой линии не тронут; рост — только явным --adopt-new с напечатанным числом
const baseBefore = readFileSync(join(ROOT, 'base', 'base.json'), 'utf8');
r = run('check --write-baseline --baseline base.json', join(ROOT, 'base'));
ok(r.code === 1 && /baseline NOT rewritten: 1 NEW finding/.test(r.out) && /велел/.test(r.out) && readFileSync(join(ROOT, 'base', 'base.json'), 'utf8') === baseBefore,
   's24 повторный --write-baseline с новой строкой — ОТКАЗ, базовая линия не переписана (только убывает)', r.out);
r = run('check --write-baseline --adopt-new --baseline base.json', join(ROOT, 'base'));
ok(r.code === 0 && /2 finding\(s\) recorded as debt \(1 adopted as NEW on purpose/.test(r.out),
   's24 --adopt-new — рост базовой линии явный и напечатан числом', r.out);

// --- SKIPPED: дерево без markdown
r = run('check', join(ROOT, 'empty'));
ok(r.code === 3 && /SKIPPED/.test(r.out), 's24 пустое дерево — SKIPPED (exit 3), «не сканировано» ≠ «чисто»', r.out);

if (failures) { console.error(`s24: ${failures} failure(s)`); process.exit(1); }
console.log('s24 attribution-lint: all checks green');
