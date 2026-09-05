// tools/sandbox/probes/ic3-contour-generator.mjs — ПРОБА (не свод полигона): исполнимая приёмка шага IC3
// эпика IC (plans/93 критерии 2–4; интервью №024 Q1 = B, №101) — генератор интерактивного контура едет
// поставкой в `.kaif/tools/contour/` и краснеет на случае #051 «варианты абзацами».
//   node tools/sandbox/probes/ic3-contour-generator.mjs            # свежая установка из dist → проверки ниже
// Проба КРАСНАЯ ПО ПОСТРОЕНИЮ до появления генератора: она написана раньше кода, чтобы «готово» IC3
// судилось командой, а не словом сессии (TESTING_FRAMEWORK → «работа производит средство своей проверки»);
// после IC3 её тело переезжает в свод s22 полигона (IC4), а проба остаётся как запускаемое repro.
// [TESTED: 2026-09-05 · прогон до IC3 на сборке 783 модулей: контракт .kaif/INTERACTIVE_CONTOUR_SPEC.md
//  на месте (зелёный), генератора нет → проба красная с именованной причиной, exit 1 — как и положено пробе
//  до фикса]
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tempRoot } from '../../lib/temp-root.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = join(REPO, 'dist');
const ROOT = tempRoot('ic3-contour-probe', process.argv.slice(2).find((a) => !a.startsWith('--')));
mkdirSync(ROOT, { recursive: true });

let PASS = 0, FAIL = 0;
const ok = (name, cond, detail = '') => { if (cond) { PASS++; console.log('  ✓ ' + name); } else { FAIL++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); } };
// запуск node-скрипта в развёрнутом дереве; результат ВСЕГДА судится ok(...) ниже (страж немых команд)
const runNode = (cwd, script, args = []) => {
  try { return { code: 0, out: execFileSync(process.execPath, [script, ...args], { cwd, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

// ── 1. свежая установка из бандла dist (маршрут install --bundle, ru-развёртывание) ──────────────
const P = join(ROOT, 'proj'); mkdirSync(P, { recursive: true });
const core = join(DIST, 'KAIF-CORE.mjs');
const inst = runNode(P, core, ['install', '--lang', 'ru', '--bundle', join(DIST, 'KAIF-CORE-BUNDLE.md')]);
ok('install --lang ru --bundle → exit 0', inst.code === 0, inst.out.slice(-400));

// ── 2. критерий 1 (уже отгружен IC2): контракт контура на месте ─────────────────────────────────
const SPEC = join(P, '.kaif', 'INTERACTIVE_CONTOUR_SPEC.md');
ok('.kaif/INTERACTIVE_CONTOUR_SPEC.md приехал установкой', existsSync(SPEC));
ok('контракт ≤ 120 строк', existsSync(SPEC) && readFileSync(SPEC, 'utf8').split('\n').length <= 120);

// ── 3. критерии 2–3 (IC3): генератор поставки и его предполёт ───────────────────────────────────
const GEN = join(P, '.kaif', 'tools', 'contour', 'review.mjs');
ok('.kaif/tools/contour/review.mjs приехал установкой (IC3)', existsSync(GEN), 'генератор отсутствует — IC3 не исполнен');
if (existsSync(GEN)) {
  const st = runNode(P, GEN, ['--selftest']);
  ok('--selftest зелёный (exit 0)', st.code === 0, st.out.slice(-400));
  ok('--selftest называет красную фикстуру «варианты абзацами»', /абзац|paragraph/i.test(st.out));
  // фикстура #051: варианты набраны абзацами `**A. …**` — страница открылась бы без радиокнопок
  mkdirSync(join(P, 'interviews'), { recursive: true });
  const bad = join(P, 'interviews', 'interview_051_probe.md');
  writeFileSync(bad, ['# Interview #051 — проба', '', '> Topic: проба формы', '> Status: **🟡 awaiting the owner\'s answers**', '',
    '### Q1. Что выбрать?', '', '**A. Первый вариант** — абзацем, не списком.', '', '**B. Второй вариант** — тоже абзацем.', '', '**Answer:**', ''].join('\n'));
  const pre = runNode(P, GEN, [bad, '--no-open']);
  ok('предполёт отказывает открывать #051: exit 3', pre.code === 3, 'exit ' + pre.code + ': ' + pre.out.slice(-300));
  ok('предполёт называет вопрос и форму: «Q1» и «- **A)**»', /Q1/.test(pre.out) && /\*\*A\)\*\*/.test(pre.out));
  // канонический документ: варианты списком — рендер без сервера проходит
  const good = join(P, 'interviews', 'interview_052_probe.md');
  writeFileSync(good, ['# Interview #052 — проба', '', '> Topic: проба формы', '> Status: **🟡 awaiting the owner\'s answers**', '',
    '### Q1. Что выбрать?', '', '- **A)** первый вариант', '- **B)** второй вариант', '- **C)** свой вариант', '', '**Answer:**', ''].join('\n'));
  const ren = runNode(P, GEN, [good, '--no-serve']);
  ok('канонический документ рендерится (--no-serve, exit 0)', ren.code === 0, ren.out.slice(-300));
  ok('рендер без показа честен: «RENDER IS NOT YET A SHOW»', /RENDER IS NOT YET A SHOW/.test(ren.out));
  // факт показа записывается рукой (I40) — параметры из kaif.json, вопросов к владельцу нет
  const ms = runNode(P, GEN, ['--mark-shown', 'interviews/interview_052_probe.md', '--transport', 'chat']);
  ok('--mark-shown пишет shown.json (exit 0)', ms.code === 0 && existsSync(join(P, 'interviews', 'decisions', 'shown.json')), ms.out.slice(-200));
}

console.log(`\nic3-contour-probe: ${PASS} зелёных, ${FAIL} красных · корень ${ROOT}`);
process.exit(FAIL ? 1 : 0);
