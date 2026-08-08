#!/usr/bin/env node
// tools/private-names-guard.mjs — страж КЛАССА «приватное имя проекта владельца в публичной
// поставке» (фаза Q, лекарство Q6; волна владельца, дефект 15).
//
// ЗАЧЕМ. `neutrality-guard` стережёт утечку личных текстов в слепок стилометрии, а имена рабочих
// проектов владельца не стерёг никто: они разошлись по комментариям машинерии и по описаниям
// навыков как честная атрибуция полевых находок — «field-caught on <проект>». Атрибуция полезна
// внутри репозитория и недопустима в поставке: файл едет в чужие проекты, и вместе с ним уезжает
// список того, над чем владелец работает.
//
// ГДЕ ЖИВЁТ СПИСОК. `.kaif/private-names.json`, и он В IGNORE: список приватных имён сам является
// приватными данными, поэтому в поставку и в историю git он не едет. Отсюда следует честная
// граница: БЕЗ ФАЙЛА СТРАЖ НЕ СУДИТ. Он говорит это вслух и завершается нулём — выдумывать
// список имён владельца агент не вправе (`PHILOSOPHY.md` → правило трёх дверей), а молчаливый
// зелёный при отсутствующем списке был бы ложью о проверке.
//
// ПСЕВДОНИМ ВМЕСТО ВЫЧЁРКИВАНИЯ. Замена «KLAS» → «field project C» сохраняет то, ради чего имя
// стояло в комментарии: что подтверждений было ДВА и они пришли из РАЗНЫХ проектов. Вычеркнув имя
// совсем, поставка потеряла бы силу свидетельства вместе с приватностью.
//
// Использование:
//   node tools/private-names-guard.mjs             # проверить зоны поставки; exit 1 при находке
//   node tools/private-names-guard.mjs --selftest  # красный на утечке, молчание на чистой зоне
//
// [TESTED: 2026-08-09 · --selftest доказывает оба ответа на синтетических файлах во временном
//  корне; на живой поставке прогон зелёный после чистки framework/ и пересборки dist/.]

import fs from 'node:fs';
import path from 'node:path';
import { tempRoot } from './lib/temp-root.mjs';

const LIST = '.kaif/private-names.json';

// Расширения, которые вообще стоит читать: бинарь и картинки имён не несут, а чтение их замедляет
// прогон и засоряет вывод ложными совпадениями по байтам.
const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.json', '.txt', '.yml', '.yaml']);

/** Рекурсивный обход зоны: файлы, а не директории. */
function walk(target, out = []) {
  if (!fs.existsSync(target)) return out;
  const st = fs.statSync(target);
  if (st.isFile()) {
    if (TEXT_EXT.has(path.extname(target))) out.push(target);
    return out;
  }
  for (const name of fs.readdirSync(target).sort()) walk(path.join(target, name), out);
  return out;
}

/** Поиск имён в одном тексте. Имя ищется как ЦЕЛОЕ слово, чтобы «klasse» не выдавала «KLAS». */
function findIn(text, names) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const name of names) {
      const re = new RegExp(`(?<![\\p{L}\\d])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\d])`, 'giu');
      for (const m of line.matchAll(re)) {
        hits.push({ n: i + 1, name, quote: line.slice(Math.max(0, m.index - 40), m.index + name.length + 40).trim() });
      }
    }
  });
  return hits;
}

function loadList(root = process.cwd()) {
  const p = path.join(root, LIST);
  if (!fs.existsSync(p)) return null;
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    names: Object.keys(cfg.names || {}),
    aliases: cfg.names || {},
    scanned: cfg.scanned || ['framework', 'dist'],
  };
}

// ── Селфтест: оба ответа (EXP-0059) ────────────────────────────────────────────────────────────
function selftest() {
  const root = tempRoot('private-names-selftest');
  fs.mkdirSync(path.join(root, '.kaif'), { recursive: true });
  fs.mkdirSync(path.join(root, 'framework'), { recursive: true });
  fs.writeFileSync(path.join(root, '.kaif', 'private-names.json'), JSON.stringify({
    names: { NDim: 'field project A', KLAS: 'field project C' }, scanned: ['framework'],
  }));

  let bad = 0;
  const list = loadList(root);

  // 1. МОЛЧАНИЕ на чистой зоне — включая слово, которое лишь ПОХОЖЕ на приватное имя.
  const cleanText = '// field-caught on field project A; the German word klasse stays intact.\n';
  const cleanHits = findIn(cleanText, list.names);
  console.log(`${cleanHits.length === 0 ? '✅' : '❌'} чистая зона: находок ${cleanHits.length} (ждали 0)`);
  if (cleanHits.length) { bad++; cleanHits.forEach((h) => console.log(`      лишнее — ${h.name}: ${h.quote}`)); }

  // 2. КРАСНЫЙ на утечке.
  const leak = '// field-caught on NDim, which trapped the bundle in history (bug 33 / KLAS D3).\n';
  const leakHits = findIn(leak, list.names);
  const both = new Set(leakHits.map((h) => h.name));
  const fired = both.has('NDim') && both.has('KLAS');
  console.log(`${fired ? '✅' : '❌'} утечка: ${fired ? `страж покраснел на ${[...both].join(', ')}` : 'СТРАЖ НЕ ЗАМЕТИЛ'}`);
  if (!fired) bad++;

  // 3. Границы: слово внутри другого слова не ловится (klasse, Zoo Code рядом с KLAS).
  const near = 'Klassenzimmer und klasse; Zoo Code adapter.\n';
  const nearHits = findIn(near, list.names);
  console.log(`${nearHits.length === 0 ? '✅' : '❌'} граница слова: «klasse»/«Klassenzimmer» молчат (находок ${nearHits.length}, ждали 0)`);
  if (nearHits.length) bad++;

  // 4. Без списка страж НЕ СУДИТ и говорит об этом.
  const noList = loadList(path.join(root, 'framework'));
  console.log(`${noList === null ? '✅' : '❌'} без списка: страж честно молчит вместо ложного зелёного`);
  if (noList !== null) bad++;

  fs.rmSync(root, { recursive: true, force: true });
  console.log(bad ? `\n❌ selftest FAILED — ${bad}` : '\n✅ selftest OK — красный на утечке, молчание на похожем слове');
  process.exit(bad ? 1 : 0);
}

// ── Точка входа ────────────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--selftest')) selftest();

const list = loadList();
if (!list) {
  console.log(`⚪ private-names-guard: списка ${LIST} нет — судить нечем, и выдумывать имена владельца запрещено.`);
  console.log('   Заведи файл (он в ignore) по образцу из шапки этого инструмента, если проект держит приватные имена.');
  process.exit(0);
}

let bad = 0;
for (const zone of list.scanned) {
  for (const file of walk(zone)) {
    const hits = findIn(fs.readFileSync(file, 'utf8'), list.names);
    if (!hits.length) continue;
    console.log(`❌ ${file}`);
    for (const h of hits.slice(0, 5)) {
      console.log(`      стр. ${h.n}: ${h.name} → ${list.aliases[h.name]}`);
      console.log(`         …${h.quote}…`);
    }
    if (hits.length > 5) console.log(`      … и ещё ${hits.length - 5}`);
    bad += hits.length;
  }
}

console.log(bad
  ? `\n❌ private-names-guard: ${bad} вхождений приватных имён в поставке — замени на псевдоним из ${LIST}`
  : `\n✅ private-names-guard: приватных имён в поставке нет (зоны: ${list.scanned.join(' · ')})`);
process.exit(bad ? 1 : 0);
