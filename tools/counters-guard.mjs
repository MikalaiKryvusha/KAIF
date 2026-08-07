#!/usr/bin/env node
// tools/counters-guard.mjs — страж КЛАССА «протухший счётчик прозы» (bugs/49; прародитель —
// bugs/09, урок EXP-0025 «число в тексте = цитата вывода инструмента»).
//
// Зачем: у факта «сколько чего в поставке» ЧЕТЫРЕ зеркала — строка счётчиков в AGENT_GUIDE,
// английская и русская половины README, и число сводов полигона (тоже в обеих половинах).
// Прежний страж реестра пар стерёг РОВНО ОДНО из них грепом по AGENT_GUIDE — и три остальных
// молча разошлись с реальностью (README утверждал 662 модуля при фактических 666).
// Этот инструмент сверяет ЖИВЫЕ числа со ВСЕМИ зеркалами разом.
//
// Живые источники (никакой арифметики в голове — только чтение артефактов):
//   встроенные файлы — framework/ (ключевые доки + README директорий + навыки + распаковщик),
//                      той же формулой, что и check-framework;
//   блоки бандла     — число `> **FILE:` в dist/KAIF-CORE-BUNDLE.md;
//   модули карты     — число записей в dist/kaif-module-map.json;
//   своды полигона   — длина списка SUITES в tools/sandbox-suite.mjs.
//
// Использование:
//   node tools/counters-guard.mjs              # сверка; exit 1 при расхождении
//   node tools/counters-guard.mjs --selftest   # ДОКАЗАТЬ, что страж умеет краснеть
//
// Гоняется в /end-chat и /release вместе с остальным реестром пар.
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.argv.includes('--root')
  ? process.argv[process.argv.indexOf('--root') + 1] : join(HERE, '..'));

// --- живые числа ------------------------------------------------------------
// Ключевые доки поставки: тот же список, что у check-framework (хардкод-список ключевых —
// осознанный: их состав и есть решение владельца, а не содержимое каталога).
const DOC_NAMES = ['AGENT_GUIDE.md', 'PHILOSOPHY.md', 'BUG_FIXING_FRAMEWORK.md', 'TESTING_FRAMEWORK.md',
                   'REQUIREMENTS_FRAMEWORK.md', 'STATUS.md', 'PROJECT_HISTORY.md', 'EXPERIENCE.md',
                   'GOAL.md', 'MASTER_PLAN.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md',
                   'PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'KAIF_FRAMEWORK.md', 'KAIF_REFERENCE.md'];

function liveNumbers() {
  const fw = join(ROOT, 'framework');
  const docs = DOC_NAMES.filter((d) => existsSync(join(fw, d))).length;
  const readmes = readdirSync(join(fw, 'readmes')).filter((n) => n.endsWith('.md')).length;
  const skillsDir = join(fw, 'skills');
  const skills = readdirSync(skillsDir).filter((n) => existsSync(join(skillsDir, n, 'SKILL.md'))).length;
  const unpackers = existsSync(join(fw, 'kaif-unpack.mjs')) ? 1 : 0;
  const embedded = docs + readmes + skills + unpackers;

  const bundle = readFileSync(join(ROOT, 'dist', 'KAIF-CORE-BUNDLE.md'), 'utf8');
  const blocks = (bundle.match(/^> \*\*FILE:/gm) || []).length;

  const map = JSON.parse(readFileSync(join(ROOT, 'dist', 'kaif-module-map.json'), 'utf8'));
  // карта — объект { <dest>: [модули…] } либо { modules: […] }; считаем атомы, как печатает сборка
  const modules = Array.isArray(map.modules) ? map.modules.length
    : Object.values(map.files || map).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);

  const suite = readFileSync(join(ROOT, 'tools', 'sandbox-suite.mjs'), 'utf8');
  const suitesBlock = suite.match(/const SUITES = \[([\s\S]*?)\];/);
  const suites = suitesBlock ? (suitesBlock[1].match(/'s\d+/g) || []).length : 0;

  return { docs, readmes, skills, unpackers, embedded, blocks, modules, suites };
}

// --- зеркала ----------------------------------------------------------------
// Каждое зеркало: имя · файл · регэксп по НОРМАЛИЗОВАННОМУ тексту (переносы строк схлопнуты —
// проза врапается, и врап не должен ослеплять стража) · какие живые числа обязаны совпасть.
const flat = (s) => s.replace(/\r?\n>?\s*/g, ' ').replace(/\s+/g, ' ');

const MIRRORS = [
  { name: 'AGENT_GUIDE — строка счётчиков', file: 'AGENT_GUIDE.md',
    re: /= (\d+); бандл (\d+) блок\S* карта — (\d+) модул\S*/, keys: ['embedded', 'blocks', 'modules'] },
  { name: 'README EN — строка счётчиков', file: 'README.md',
    re: /= (\d+) embedded files; (\d+) bundle blocks; (\d+) modules/, keys: ['embedded', 'blocks', 'modules'] },
  { name: 'README RU — строка счётчиков', file: 'README.md',
    re: /= (\d+) встроенных файлов; (\d+) блок\S* бандла; (\d+) модул\S*/, keys: ['embedded', 'blocks', 'modules'] },
  { name: 'README EN — число сводов полигона', file: 'README.md',
    re: /sandbox polygon \((\d+) suites\)/, keys: ['suites'] },
  { name: 'README RU — число сводов полигона', file: 'README.md',
    re: /полигон \((\d+) свод\S*\)/, keys: ['suites'] },
];

function check() {
  const live = liveNumbers();
  const findings = [];
  for (const m of MIRRORS) {
    const path = join(ROOT, m.file);
    if (!existsSync(path)) { findings.push(`${m.name}: файла нет — ${m.file}`); continue; }
    const hit = flat(readFileSync(path, 'utf8')).match(m.re);
    if (!hit) { findings.push(`${m.name}: строка счётчиков НЕ НАЙДЕНА в ${m.file} (переформулирована? — страж ослеп, почини паттерн)`); continue; }
    m.keys.forEach((k, i) => {
      const found = Number(hit[i + 1]);
      if (found !== live[k]) findings.push(`${m.name} (${m.file}): ${k} — ожидалось ${live[k]}, найдено ${found}`);
    });
  }
  console.log(`counters: ${live.embedded} embedded (${live.docs} docs + ${live.readmes} readmes + ` +
              `${live.skills} skills + ${live.unpackers} tools) · bundle ${live.blocks} blocks · ` +
              `${live.modules} modules · polygon ${live.suites} suites`);
  for (const f of findings) console.error('✖ ' + f);
  if (findings.length) {
    console.error(`\n❌ counters-guard: ${findings.length} расхождений — числа в прозе обязаны быть ЦИТАТОЙ вывода инструментов (EXP-0025, bugs/49)`);
    return 1;
  }
  console.log(`✅ counters OK — ${MIRRORS.length} зеркал сверены с живыми числами`);
  return 0;
}

// --- selftest: страж, который ни разу не краснел, ничего не доказывает -------
// Копируем ровно то, что читает страж, портим ОДНО число в README и требуем красного.
function selftest() {
  const SBX = join(tmpdir(), 'kaif-counters-guard-selftest');
  rmSync(SBX, { recursive: true, force: true });
  mkdirSync(join(SBX, 'tools'), { recursive: true });
  for (const rel of ['framework', 'dist']) cpSync(join(ROOT, rel), join(SBX, rel), { recursive: true });
  cpSync(join(ROOT, 'tools', 'sandbox-suite.mjs'), join(SBX, 'tools', 'sandbox-suite.mjs'));
  cpSync(join(ROOT, 'AGENT_GUIDE.md'), join(SBX, 'AGENT_GUIDE.md'));
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const live = liveNumbers();

  const guide = readFileSync(join(ROOT, 'AGENT_GUIDE.md'), 'utf8');
  const run = () => {
    try { execFileSync(process.execPath, [join(HERE, 'counters-guard.mjs'), '--root', SBX], { stdio: 'pipe' }); return 0; }
    catch (e) { return e.status ?? 1; }
  };
  // Мутация обязана НАЙТИ свою цель: молча не совпавший replace оставил бы копию чистой, и
  // «красный» зачёлся бы там, где ничего не ломали (страж, проверяющий сам себя, — тоже страж).
  const mutate = (file, from, to) => {
    const src = file === 'README.md' ? readme : guide;
    if (!src.includes(from)) { console.log(`❌ selftest: цель мутации не найдена в ${file}: "${from}"`); return false; }
    writeFileSync(join(SBX, file), src.split(from).join(to));
    return true;
  };
  const restore = () => { writeFileSync(join(SBX, 'README.md'), readme); writeFileSync(join(SBX, 'AGENT_GUIDE.md'), guide); };

  // (1) нетронутая копия — зелёный
  restore();
  const clean = run();
  // (2) испорченное число модулей в README EN — обязан покраснеть
  const hitEn = mutate('README.md', `${live.modules} modules`, `${live.modules + 4} modules`);
  const brokenEn = run(); restore();
  // (3) испорченное число сводов в README RU — обязан покраснеть
  const hitRu = mutate('README.md', `полигон (${live.suites} сводов)`, `полигон (${live.suites - 1} сводов)`);
  const brokenRu = run(); restore();
  // (4) испорченное число блоков в AGENT_GUIDE — зеркало, РАДИ которого страж и писался
  //     (находка судьи O3: selftest доказывал 2 зеркала из 5 и заявлял «на обоих»)
  const hitGuide = mutate('AGENT_GUIDE.md', `бандл ${live.blocks} блоков`, `бандл ${live.blocks + 7} блоков`);
  const brokenGuide = run(); restore();

  const results = [
    [clean === 0, 'чистая копия — зелёный'],
    [hitEn && brokenEn === 1, 'испорченные modules в README EN — КРАСНЫЙ'],
    [hitRu && brokenRu === 1, 'испорченное число сводов в README RU — КРАСНЫЙ'],
    [hitGuide && brokenGuide === 1, 'испорченное число блоков в AGENT_GUIDE — КРАСНЫЙ'],
  ];
  for (const [pass, name] of results) console.log(`${pass ? '✅' : '❌'} selftest: ${name}`);
  const ok = results.every(([p]) => p);
  console.log(ok ? '✅ counters-guard selftest OK — страж умеет краснеть на трёх зеркалах (обе половины README + AGENT_GUIDE)'
                 : '❌ counters-guard selftest ПРОВАЛЕН');
  return ok ? 0 : 1;
}

process.exit(process.argv.includes('--selftest') ? selftest() : check());
