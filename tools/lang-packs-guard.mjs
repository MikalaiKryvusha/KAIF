#!/usr/bin/env node
// tools/lang-packs-guard.mjs — страж ЗАМОРОЗКИ языковых пакетов (решения №56/№57; семейство
// bugs/92 №2–№5). До него поставка пакетов была слепа четырьмя осями: пакет можно было
// выпотрошить заглушкой (92.4), потерять файл из одного пакета из девяти (92.3), потерять пакет
// целиком (92.5) — и все гейты оставались зелёными, а «покрытие» выводилось из НАЙДЕННОГО на
// диске, не из ДОЛЖНОГО (92.5); протухание ru-алиасов при переписанном EN-описании навыка не
// стерёг никто (92.2). Заморозка №56 делает должное ЯВНЫМ: восемь пакетов запинены ПОБАЙТНО
// (EOL-нормализовано — CRLF-чекаут не имеет права красить, класс bug 12), живой ru стережётся
// составом и полом объёма, EN-описания навыков — пинами против тихого протухания алиасов.
//
//   node tools/lang-packs-guard.mjs                # сверка против tools/lang-packs.lock.json
//   node tools/lang-packs-guard.mjs --write-lock   # СОЗНАТЕЛЬНАЯ регенерация всего лока
//                                                  # (замороженные sha двигаются ТОЛЬКО словом владельца)
//   node tools/lang-packs-guard.mjs --update-pins  # передвинуть только пины EN-описаний
//                                                  # (после сверки ru-алиасов глазами)
//   node tools/lang-packs-guard.mjs --selftest     # красный доказан фикстурами, дерево не тронуто
//
// Гоняется в /end-chat-soft и /release (реестр пар: «замороженные пакеты ↔ лок»).
// [TESTED: 2026-08-21 · --selftest: шесть мутаций красные, чистая фикстура молчит; живой лок
//  сгенерирован и сверка зелёная]
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from './lib/temp-root.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK_PATH = join(ROOT, 'tools', 'lang-packs.lock.json');
const args = process.argv.slice(2);

// Пол объёма живого перевода: файл ru короче 40 % своего EN-исходника — это заглушка или
// обрубок, а не перевод (92.4). Порог консервативный: честные переводы ходят вокруг 100 %.
const RU_FLOOR_RATIO = 0.4;

const sha = (t) => createHash('sha256').update(String(t).replace(/\r\n/g, '\n')).digest('hex');
const lines = (t) => String(t).split(/\r?\n/).length;
const listFiles = (dir, prefix = '') => {
  const out = [];
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    if (n.isDirectory()) out.push(...listFiles(join(dir, n.name), `${prefix}${n.name}/`));
    else out.push(`${prefix}${n.name}`);
  }
  return out.sort();
};
const descLineOf = (skillMd) => (String(skillMd).split(/\r?\n/).find((l) => l.startsWith('description:')) || '');

/** Все проверки на заданных корнях. Возвращает список провалов (пустой = зелёный). */
export function runChecks(roots, lock) {
  const { langRoot, skillsRoot, enCounterpartOf } = roots;
  const fails = [];
  const expect = new Set([...(lock.maintained || []), ...Object.keys(lock.frozen || {})]);
  const onDisk = new Set(existsSync(langRoot) ? readdirSync(langRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);
  for (const p of expect) if (!onDisk.has(p)) fails.push(`пакет ПОТЕРЯН целиком: ${p} (92.5 — ожидание задаёт лок, не диск)`);
  for (const p of onDisk) if (!expect.has(p)) fails.push(`неучтённый пакет на диске: ${p} — внеси в лок сознательно (--write-lock) или убери`);

  // Замороженные: состав поимённо + побайтный (EOL-норм) пин каждого файла.
  for (const [pack, files] of Object.entries(lock.frozen || {})) {
    const dir = join(langRoot, pack);
    if (!existsSync(dir)) continue; // уже названо выше
    const disk = new Set(listFiles(dir));
    for (const [rel, want] of Object.entries(files)) {
      if (!disk.has(rel)) { fails.push(`замороженный пакет ${pack}: файл потерян — ${rel} (92.3)`); continue; }
      const got = sha(readFileSync(join(dir, rel), 'utf8'));
      if (got !== want) fails.push(`замороженный пакет ${pack}: файл ИЗМЕНЁН — ${rel} (заморозка №56: правки восьми пакетов идут только словом владельца; sha ${got.slice(0, 12)}… ≠ лок ${want.slice(0, 12)}…)`);
    }
    for (const rel of disk) if (!(rel in files)) fails.push(`замороженный пакет ${pack}: посторонний файл — ${rel} (состав запинен поимённо, 92.3)`);
  }

  // Живой ru: состав поимённо + пол объёма против EN-исходника (92.4 для живой пары).
  for (const pack of lock.maintained || []) {
    const dir = join(langRoot, pack);
    if (!existsSync(dir)) continue;
    const comp = lock[`${pack}Composition`] || [];
    const disk = new Set(listFiles(dir));
    for (const rel of comp) if (!disk.has(rel)) fails.push(`живой пакет ${pack}: файл потерян — ${rel} (92.3)`);
    for (const rel of disk) if (!comp.includes(rel)) fails.push(`живой пакет ${pack}: файл вне зафиксированного состава — ${rel} (внеси в лок сознательно)`);
    for (const rel of comp) {
      if (!disk.has(rel) || rel.endsWith('.json')) continue;   // ключи triggers стережёт counters-guard поимённо
      const en = enCounterpartOf(rel);
      if (!en || !existsSync(en)) continue;
      const ruLines = lines(readFileSync(join(dir, rel), 'utf8'));
      const enLines = lines(readFileSync(en, 'utf8'));
      if (ruLines < enLines * RU_FLOOR_RATIO)
        fails.push(`живой пакет ${pack}: ${rel} подозрительно КОРОТОК (${ruLines} строк против ${enLines} у EN-исходника, пол ${RU_FLOOR_RATIO * 100} %) — заглушка вместо перевода? (92.4)`);
    }
  }

  // Пины EN-описаний навыков: переписанное описание = протухшие ru-алиасы, пока их не сверили (92.2).
  const pins = lock.enDescriptionPins || {};
  const skillsOnDisk = existsSync(skillsRoot) ? readdirSync(skillsRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
  for (const s of skillsOnDisk) {
    const p = join(skillsRoot, s, 'SKILL.md');
    if (!existsSync(p)) continue;
    const got = sha(descLineOf(readFileSync(p, 'utf8')));
    if (!(s in pins)) { fails.push(`навык без пина описания: ${s} — ru-алиасы для него не сверялись (92.2); сверь skill-triggers.json и передвинь пины: --update-pins`); continue; }
    if (pins[s] !== got) fails.push(`EN-описание навыка ПЕРЕПИСАНО: ${s} — ru-алиасы могли протухнуть (92.2); сверь framework/templates/languages/ru/skill-triggers.json ГЛАЗАМИ и передвинь пины: --update-pins`);
  }
  for (const s of Object.keys(pins)) if (!skillsOnDisk.includes(s)) fails.push(`пин без навыка: ${s} — навык исчез, а его пин остался (передвинь пины: --update-pins)`);

  return fails;
}

const liveRoots = () => ({
  langRoot: join(ROOT, 'framework', 'templates', 'languages'),
  skillsRoot: join(ROOT, 'framework', 'skills'),
  enCounterpartOf: (rel) => {
    if (rel === 'GOAL.md' || rel === 'KAIF_FRAMEWORK.md') return join(ROOT, 'framework', rel);
    const m = rel.match(/^([^/]+)\/README\.md$/);
    return m ? join(ROOT, 'framework', 'readmes', `${m[1]}.md`) : null;
  },
});

function buildLock(roots, { maintained }) {
  const { langRoot, skillsRoot } = roots;
  const lock = { _comment: 'Заморозка языковых пакетов (решения №56/№57; bugs/92 №2–№5). frozen: побайтные (EOL-норм) sha256 восьми пакетов состояния 2.2 — двигаются ТОЛЬКО словом владельца (--write-lock). maintained + <pack>Composition: живые пакеты, состав поимённо, объём стережёт пол против EN-исходника. enDescriptionPins: sha строки description каждого EN-навыка — переписал описание → сверь ru-алиасы глазами и передвинь пины (--update-pins).', frozenAt: '2.2', maintained, frozen: {}, enDescriptionPins: {} };
  for (const d of readdirSync(langRoot, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const files = {};
    for (const rel of listFiles(join(langRoot, d.name))) files[rel] = sha(readFileSync(join(langRoot, d.name, rel), 'utf8'));
    if (maintained.includes(d.name)) lock[`${d.name}Composition`] = Object.keys(files);
    else lock.frozen[d.name] = files;
  }
  for (const s of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!s.isDirectory()) continue;
    const p = join(skillsRoot, s.name, 'SKILL.md');
    if (existsSync(p)) lock.enDescriptionPins[s.name] = sha(descLineOf(readFileSync(p, 'utf8')));
  }
  return lock;
}

// ── селфтест: фикстуры в temp, дерево проекта не тронуто ────────────────────
if (args.includes('--selftest')) {
  const root = tempRoot('lang-packs-guard');
  const L = join(root, 'languages');
  const S = join(root, 'skills');
  const mk = (p, t) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, t); };
  mk(join(L, 'aa', 'GOAL.md'), 'frozen goal aa\nline2\n');
  mk(join(L, 'aa', 'plans', 'README.md'), 'frozen plans aa\n');
  mk(join(L, 'ru', 'GOAL.md'), 'цель\nстрока\nстрока\nстрока\n');
  mk(join(S, 's1', 'SKILL.md'), '---\nname: s1\ndescription: does a thing. Trigger aliases (ru): раз, два\n---\n');
  const enGoal = join(root, 'en', 'GOAL.md');
  mk(enGoal, 'goal\nline\nline\nline\nline\n');
  const roots = { langRoot: L, skillsRoot: S, enCounterpartOf: (rel) => (rel === 'GOAL.md' ? enGoal : null) };
  const lock = buildLock(roots, { maintained: ['ru'] });
  let red = 0;
  const okCase = (cond, name) => { console.log((cond ? '✅ ' : '❌ ') + 'selftest: ' + name); if (!cond) red += 1; };
  okCase(runChecks(roots, lock).length === 0, 'чистая фикстура — молчание');
  writeFileSync(join(L, 'aa', 'GOAL.md'), 'frozen goal aa MUTATED\nline2\n');
  okCase(runChecks(roots, lock).some((f) => f.includes('ИЗМЕНЁН')), 'мутация байта замороженного файла — красный');
  mk(join(L, 'aa', 'GOAL.md'), 'frozen goal aa\nline2\n');
  rmSync(join(L, 'aa', 'plans'), { recursive: true, force: true });
  okCase(runChecks(roots, lock).some((f) => f.includes('файл потерян')), 'потеря файла замороженного пакета — красный (92.3)');
  mk(join(L, 'aa', 'plans', 'README.md'), 'frozen plans aa\n');
  mk(join(L, 'aa', 'EXTRA.md'), 'stray\n');
  okCase(runChecks(roots, lock).some((f) => f.includes('посторонний файл')), 'посторонний файл в замороженном — красный (92.3)');
  rmSync(join(L, 'aa', 'EXTRA.md'), { force: true });
  writeFileSync(join(L, 'ru', 'GOAL.md'), 'заглушка\n');
  okCase(runChecks(roots, lock).some((f) => f.includes('КОРОТОК')), 'выпотрошенный живой перевод — красный (92.4)');
  writeFileSync(join(L, 'ru', 'GOAL.md'), 'цель\nстрока\nстрока\nстрока\n');
  writeFileSync(join(S, 's1', 'SKILL.md'), '---\nname: s1\ndescription: REWRITTEN thing entirely\n---\n');
  okCase(runChecks(roots, lock).some((f) => f.includes('ПЕРЕПИСАНО')), 'переписанное EN-описание — красный (92.2)');
  writeFileSync(join(S, 's1', 'SKILL.md'), '---\nname: s1\ndescription: does a thing. Trigger aliases (ru): раз, два\n---\n');
  rmSync(join(L, 'ru'), { recursive: true, force: true });
  okCase(runChecks(roots, lock).some((f) => f.includes('ПОТЕРЯН целиком')), 'потеря пакета целиком — красный (92.5, ожидание из лока)');
  if (red) { console.error(`❌ lang-packs-guard selftest: ${red} провал(ов); корень оставлен: ${root}`); process.exit(1); }
  rmSync(root, { recursive: true, force: true });
  console.log('✅ lang-packs-guard selftest: шесть мутаций красные, чистая фикстура молчит');
  process.exit(0);
}

// ── запись лока (сознательные движения) ─────────────────────────────────────
if (args.includes('--write-lock')) {
  const lock = buildLock(liveRoots(), { maintained: ['ru'] });
  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + '\n');
  const nFrozen = Object.keys(lock.frozen).length;
  console.log(`✅ лок записан: ${LOCK_PATH} — заморожено пакетов: ${nFrozen}, живых: ${lock.maintained.join(', ')}, пинов описаний: ${Object.keys(lock.enDescriptionPins).length}`);
  console.log('⚠ Движение замороженных sha — решение ВЛАДЕЛЬЦА (№56: оживление по запросу сообщества), не рутина.');
  process.exit(0);
}
if (args.includes('--update-pins')) {
  if (!existsSync(LOCK_PATH)) { console.error('✖ лока нет — сначала --write-lock'); process.exit(1); }
  const lock = JSON.parse(readFileSync(LOCK_PATH, 'utf8'));
  lock.enDescriptionPins = buildLock(liveRoots(), { maintained: lock.maintained }).enDescriptionPins;
  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + '\n');
  console.log(`✅ пины EN-описаний передвинуты (${Object.keys(lock.enDescriptionPins).length}) — это заявление «ru-алиасы сверены глазами», не формальность`);
  process.exit(0);
}

// ── боевой прогон ────────────────────────────────────────────────────────────
if (!existsSync(LOCK_PATH)) { console.error(`✖ лока нет: ${LOCK_PATH} — заморозка не зафиксирована (node tools/lang-packs-guard.mjs --write-lock)`); process.exit(1); }
const fails = runChecks(liveRoots(), JSON.parse(readFileSync(LOCK_PATH, 'utf8')));
if (fails.length) {
  console.error(`✖ lang-packs-guard: ${fails.length} расхождение(й) с заморозкой №56:`);
  for (const f of fails.slice(0, 20)) console.error('  · ' + f);
  process.exit(1);
}
const lk = JSON.parse(readFileSync(LOCK_PATH, 'utf8'));
console.log(`✅ lang-packs-guard OK — заморожено ${Object.keys(lk.frozen).length} пакетов (состояние ${lk.frozenAt}, побайтно), живые: ${lk.maintained.join(', ')} (состав + пол объёма), пинов EN-описаний: ${Object.keys(lk.enDescriptionPins).length}`);
