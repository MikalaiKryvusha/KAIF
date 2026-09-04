#!/usr/bin/env node
// tools/grant-permissions.mjs — добавить правила `permissions.allow` в `.claude/settings.local.json`
// (идемпотентно, чужие ключи файла сохраняются).
//
// ЗАЧЕМ. Агент не может расширить собственные права: классификатор авторежима Claude Code блокирует
// ему и внешнюю команду (`gh issue close`), и навык /update-config, и правку самого файла настроек —
// проба 2026-09-04 (сессия 52) по слову владельца «нужно расширить твои права, чтобы ты мог сам
// закрывать их. Ты же разработчик KAIF». Граница правильная: права выдаёт владелец. Этот скрипт —
// его рука: одна команда вместо ручной правки JSON.
//
// Использование (запускает ВЛАДЕЛЕЦ из корня репозитория):
//   node tools/grant-permissions.mjs                      # набор по умолчанию: закрыть/комментировать issues
//   node tools/grant-permissions.mjs "Bash(gh pr merge:*)" # любые свои правила, по одному аргументу
//   node tools/grant-permissions.mjs --file <путь>        # другой файл настроек (селфтест на копии)
// Файл `.claude/settings.local.json` — в .gitignore: права локальны для этой машины и в origin не едут.
// Если команда агента всё ещё блокируется после записи — перезапусти сессию агента: настройки
// читаются при старте.
//
// [TESTED: 2026-09-04 · на копии во временной папке: первый прогон добавил два правила и сохранил
//  чужой ключ `hooks`, повторный прогон — «уже есть», файл не изменился; свой файл прав скрипт
//  агентом не запускался — по построению]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Набор по умолчанию — ровно те действия, что разработчик KAIF совершает после релиза по тикету
// (№84/№92): ответ в issue и его закрытие. Шире не даём: каждое новое правило — слово владельца.
const DEFAULT_RULES = ['Bash(gh issue close:*)', 'Bash(gh issue comment:*)'];
const DEFAULT_FILE = '.claude/settings.local.json';

const args = process.argv.slice(2);
const fileIdx = args.indexOf('--file');
const file = resolve(fileIdx >= 0 && args[fileIdx + 1] ? args[fileIdx + 1] : DEFAULT_FILE);
const rules = args.filter((a, i) => a !== '--file' && !(fileIdx >= 0 && i === fileIdx + 1));
const wanted = rules.length ? rules : DEFAULT_RULES;

let settings = {};
if (existsSync(file)) {
  const raw = readFileSync(file, 'utf8');
  try {
    settings = raw.trim() ? JSON.parse(raw) : {};
  } catch (e) {
    console.error(`✗ ${file}: не JSON (${e.message}) — почини файл руками, скрипт ничего не перезаписал`);
    process.exit(1);
  }
}
if (typeof settings.permissions !== 'object' || settings.permissions === null) settings.permissions = {};
const allow = Array.isArray(settings.permissions.allow) ? settings.permissions.allow : [];

const added = [];
const kept = [];
for (const rule of wanted) (allow.includes(rule) ? kept : added).push(rule);

if (added.length) {
  settings.permissions.allow = [...allow, ...added];
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(settings, null, 2) + '\n'); // остальные ключи файла сохранены как были
}
for (const rule of added) console.log(`+ ${rule}`);
for (const rule of kept) console.log(`= ${rule} (уже есть)`);
console.log(added.length
  ? `✅ ${file}: правил allow теперь ${settings.permissions.allow.length}. Если команда агента всё ещё блокируется — перезапусти его сессию.`
  : `✅ ${file}: все правила уже стояли — файл не тронут.`);
