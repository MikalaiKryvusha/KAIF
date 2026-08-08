#!/usr/bin/env node
// tools/neutrality-guard.mjs — страж НЕЙТРАЛЬНОСТИ ПОСТАВКИ.
//
// Зачем (слово владельца, 2026-08-08 23:20 +03:00): «KAIF поставляется в нейтральном виде, чтобы и
// другие люди могли им пользоваться. Стилометрия Николая - это уже моя и твоя модификация поверх…
// Будет нехорошо, если ссылки на мою стилометрию просочатся в KAIF и будут поставлены другим людям -
// мой голос попадёт в их проекты - этого нужно избежать».
//
// Класс дефекта, который стережём: ЛИЧНОЕ ИЗ ОБВЯЗКИ ПРОТЕКАЕТ В ПОЛЕЗНУЮ НАГРУЗКУ. Репозиторий
// фрактален (`AGENT_GUIDE.md`): в корне живёт портрет голоса ВЛАДЕЛЬЦА KAIF — законно, это
// dogfooding; в `framework/` живёт то, что разворачивается в ЧУЖИЕ проекты — и туда его правила
// попасть не должны никогда. Граница между слоями держится дисциплиной, а дисциплина без стража
// живёт до первой торопливой правки.
//
// ЧТО НЕ ЯВЛЯЕТСЯ УТЕЧКОЙ — названо явно, чтобы страж не воевал с законным:
//   · авторство KAIF (Mikalai Kryvusha / KOT KRINIK, MIT, история рождения фреймворка) — это
//     атрибуция открытого проекта, она в поставке уместна; её анонимность стережёт ДРУГОЙ
//     механизм — `anonLeakScan` в `KAIF-CORE.mjs` для анонимных установок;
//   · канон-ИМЯ файла `AUTHOR_STYLOMETRY.md` и пустой СКЕЛЕТ портрета — это контракт фреймворка
//     («если у владельца проекта есть портрет, он лежит под этим именем»), а не чей-то голос.
// Утечка — это СОДЕРЖИМОЕ конкретного портрета и адреса приватного хранилища.
//
// Использование:
//   node tools/neutrality-guard.mjs             # проверить поставку (красный = утечка)
//   node tools/neutrality-guard.mjs --selftest  # доказать, что страж умеет краснеть
//
// [TESTED: 2026-08-08 · прогон по поставке (чисто) + --selftest: мутация краснеет по всем четырём осям]

import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();

// ПОЛЕЗНАЯ НАГРУЗКА — то, что уезжает в чужие проекты. Обвязка (корневые доки, tools/, bugs/…)
// намеренно НЕ сканируется: там личное владельца KAIF законно.
const PAYLOAD_DIRS = ['framework', 'dist'];
const PAYLOAD_FILES = ['KAIF.md'];

// Ось 1 — адреса приватного хранилища голоса. Ни один не имеет права оказаться в поставке.
const PRIVATE_TOKENS = [
  'krinik_voice',
  'krinik-stylometry',
  'voice-round',
  'voice-raw.json',
  'corpus/stihi_proza',
  'stihi.ru',
];

// Ось 3 — скелет портрета обязан остаться СКЕЛЕТОМ (плейсхолдеры на месте, содержимого нет).
const SKELETON = 'framework/templates/_owner-voice-template.md';
const SKELETON_REQUIRED = ['<OWNER>', '<PROJECT_NAME>'];

// Ось 2 — длина отпечатка правила. Берём начало формулировки: 40 символов уникальны по построению
// (случайное совпадение сорокасимвольной строки с чужим текстом невозможно на практике), а
// короткий отпечаток радостно совпал бы с общей лексикой (BUG_FIXING_FRAMEWORK → «стереги полными
// уникальными строками, не короткими вхождениями»).
const FINGERPRINT_LEN = 40;
const SNAPSHOT = 'AUTHOR_STYLOMETRY.md';

/** Все файлы поставки, которые имеет смысл читать. */
function payloadFiles(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries.sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(md|mjs|js|json|txt)$/i.test(name)) out.push(full);
    }
  };
  for (const d of PAYLOAD_DIRS) walk(join(root, d));
  for (const f of PAYLOAD_FILES) {
    const full = join(root, f);
    if (existsSync(full)) out.push(full);
  }
  return out;
}

/** Отпечатки правил портрета — берём из СЛЕПКА, если он есть в этом развёртывании. */
function ruleFingerprints(root) {
  const snap = join(root, SNAPSHOT);
  if (!existsSync(snap)) return [];
  const prints = [];
  for (const line of readFileSync(snap, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^###\s+[A-ZА-ЯЁ]{1,2}\d+\.\s*(.+)$/);
    if (!m) continue;
    const body = m[1].replace(/[«»⚠️*`]/g, '').trim();
    if (body.length >= FINGERPRINT_LEN) prints.push(body.slice(0, FINGERPRINT_LEN));
  }
  return [...new Set(prints)];
}

/** Собственно проверка. Возвращает список нарушений. */
function check(root) {
  const violations = [];
  const files = payloadFiles(root);
  const prints = ruleFingerprints(root);

  for (const file of files) {
    const rel = relative(root, file).split(sep).join('/');
    const text = readFileSync(file, 'utf8');

    // Ось 1 — адреса приватного хранилища.
    for (const token of PRIVATE_TOKENS) {
      if (text.includes(token)) {
        violations.push({ axis: 'приватный адрес', file: rel, detail: token });
      }
    }

    // Ось 2 — содержимое портрета (формулировки правил).
    for (const print of prints) {
      if (text.includes(print)) {
        violations.push({ axis: 'правило портрета', file: rel, detail: `${print}…` });
      }
    }

    // Ось 4 — слепок не встраивается FILE-блоком в артефакты поставки.
    if (text.includes(`FILE: \`${SNAPSHOT}\``)) {
      violations.push({ axis: 'слепок встроен в поставку', file: rel, detail: SNAPSHOT });
    }
  }

  // Ось 3 — скелет остался скелетом.
  const skeletonPath = join(root, SKELETON);
  if (existsSync(skeletonPath)) {
    const sk = readFileSync(skeletonPath, 'utf8');
    for (const marker of SKELETON_REQUIRED) {
      if (!sk.includes(marker)) {
        violations.push({ axis: 'скелет заполнен', file: SKELETON, detail: `пропал плейсхолдер ${marker}` });
      }
    }
  }

  return { violations, filesScanned: files.length, fingerprints: prints.length };
}

/**
 * Селфтест: страж, который ни разу не краснел, ничего не доказывает
 * (`BUG_FIXING_FRAMEWORK.md` → Стражи). Проверяем ОБА свойства: краснеет на дефекте И молчит на
 * чистой поставке (второй вопрос бесплатен и почти никем не задаётся — EXP-0059).
 */
function selftest() {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-neutrality-'));
  const failures = [];
  try {
    // Минимальная синтетическая поставка.
    const fw = join(dir, 'framework', 'templates');
    cpSync(join(ROOT, SKELETON), join(fw, '_owner-voice-template.md'), { recursive: false, force: true, errorOnExist: false, mode: 0 });
    writeFileSync(join(dir, 'framework', 'AGENT_GUIDE.md'), '# Guide\n\nПортрет владельца — `AUTHOR_STYLOMETRY.md`, когда он есть.\n', 'utf8');
    writeFileSync(join(dir, 'KAIF.md'), '# KAIF\n\nAuthor: Mikalai Kryvusha (KOT KRINIK). MIT.\n', 'utf8');
    writeFileSync(
      join(dir, SNAPSHOT),
      '# Слепок\n\n### С1. Пиши РАСПРЕДЕЛЕНИЕМ, а не средним, и держи медиану на десяти словах.\n',
      'utf8'
    );

    // (1) чистая поставка — страж обязан МОЛЧАТЬ.
    const clean = check(dir);
    if (clean.violations.length) {
      failures.push(`ложная тревога на чистой поставке: ${clean.violations.map((v) => v.axis).join(', ')}`);
    }
    if (clean.fingerprints !== 1) failures.push(`отпечатки правил не собраны: ${clean.fingerprints}`);

    // (2) мутация оси 1 — приватный адрес в поставке.
    writeFileSync(join(dir, 'framework', 'AGENT_GUIDE.md'), '# Guide\n\nПортрет лежит в d:/work/krinik_voice/AUTHOR_STYLOMETRY.md\n', 'utf8');
    if (!check(dir).violations.some((v) => v.axis === 'приватный адрес')) failures.push('ось 1 не покраснела');
    writeFileSync(join(dir, 'framework', 'AGENT_GUIDE.md'), '# Guide\n', 'utf8');

    // (3) мутация оси 2 — формулировка правила портрета уехала в поставку.
    writeFileSync(
      join(dir, 'framework', 'PHILOSOPHY.md'),
      '# Ф\n\nПиши РАСПРЕДЕЛЕНИЕМ, а не средним, и держи медиану на десяти словах.\n',
      'utf8'
    );
    if (!check(dir).violations.some((v) => v.axis === 'правило портрета')) failures.push('ось 2 не покраснела');
    rmSync(join(dir, 'framework', 'PHILOSOPHY.md'));

    // (4) мутация оси 3 — скелет заполнили вместо копии.
    writeFileSync(join(fw, '_owner-voice-template.md'), '# Портрет Николая\n\nБез плейсхолдеров.\n', 'utf8');
    if (!check(dir).violations.some((v) => v.axis === 'скелет заполнен')) failures.push('ось 3 не покраснела');
    cpSync(join(ROOT, SKELETON), join(fw, '_owner-voice-template.md'));

    // (5) мутация оси 4 — слепок встроили FILE-блоком.
    writeFileSync(join(dir, 'KAIF.md'), '# KAIF\n\n> **FILE: `AUTHOR_STYLOMETRY.md`**\n', 'utf8');
    if (!check(dir).violations.some((v) => v.axis === 'слепок встроен в поставку')) failures.push('ось 4 не покраснела');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  if (failures.length) {
    console.error('SELFTEST FAILED:');
    for (const f of failures) console.error(`  · ${f}`);
    process.exit(1);
  }
  console.log('selftest ok — четыре оси краснеют на мутации, чистая поставка молчит');
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv.includes('--selftest')) {
  selftest();
} else {
  const { violations, filesScanned, fingerprints } = check(ROOT);
  console.log(
    `нейтральность поставки: файлов просканировано ${filesScanned} · отпечатков правил портрета ${fingerprints} · ` +
      `запрещённых адресов ${PRIVATE_TOKENS.length}`
  );
  if (!violations.length) {
    console.log('✅ поставка НЕЙТРАЛЬНА — ни правил портрета, ни адресов приватного хранилища, скелет пуст');
    console.log('   (авторство KAIF в поставке законно и этим стражем не судится — анонимные установки чистит anonLeakScan)');
  } else {
    console.error(`\n❌ УТЕЧКА ЛИЧНОГО В ПОСТАВКУ — нарушений ${violations.length}:`);
    for (const v of violations.slice(0, 30)) console.error(`  · [${v.axis}] ${v.file} — ${v.detail}`);
    if (violations.length > 30) console.error(`  … ещё ${violations.length - 30}`);
    process.exit(1);
  }
}
