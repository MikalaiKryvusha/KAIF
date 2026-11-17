# Research 169 — auto-relay: автономная работа с автоматической сменой чатов (Claude Code в VS Code, Windows 11)

> **Created:** 2026-11-17 10:38 +03:00 · main · по просьбе владельца: оформить стек «чат переполняется → закрывается → открывается новый →
> работа продолжается» как навык со слеш-командой для агентов на Windows 11 в расширении VS Code.
> **Status:** код проверен на macOS (Node): самотест 17/17, сквозной тест 15/15, мутант защиты от зацикливания краснеет.
> На Windows не запускался — первый прогон под присмотром (раздел 6).
> **Outbound:** личка владельца в Slack (файлом).

## 1. Что это и когда включать

Длинная автономная задача не помещается в один чат: контекст растёт, а у предела Claude Code сжимает историю и теряет детали.
Навык `/auto-relay` делает смену чата рутиной самого агента:

1. хук после каждого ответа модели считает, насколько заполнен контекст;
2. у порога агент доводит шаг до чистого среза и пишет передачу `.claude/auto-relay/HANDOVER.md`;
3. когда старый чат заканчивает ход, Stop-хук открывает НОВЫЙ чат в том же окне VS Code и отправляет туда `auto-relay continue`;
4. новый чат читает передачу и продолжает работу со «Следующего шага».

Цепочка идёт до выполнения критериев готовности, до лимита чатов (`--max`, по умолчанию 10) или до `stop`.

Включается только явно. Владелец пишет, например:
`/auto-relay работай автономно с созданием новых чатов автоматически: <задача>`.
Обычные чаты проекта хуки не трогают: всё молчит, пока `state.json` не включён.

## 2. Как устроено

```
 чат N                                                   чат N+1
 ─────                                                   ───────
 работа ── хук: «контекст 71 %: ПЕРЕДАВАЙ ЭСТАФЕТУ»
   │
   ├─ шаг до среза, коммит
   ├─ HANDOVER.md переписан, коммит
   ├─ relay.mjs ready  (state.json: handoverReady, id сессии)
   └─ конец хода ──► Stop-хук ──► open-chat.ps1 ──► code -r <папка>
                                                    vscode://anthropic.claude-code/open?prompt=auto-relay%20continue
                                                    Enter (только если впереди VS Code этого проекта)
                                                         │
                                                         ▼
                                                 «auto-relay continue» ── хук: «ПРИКАЗ: запусти навык»
                                                 relay.mjs continue → HANDOVER.md → работа
```

| Часть | Файл | Что делает |
|---|---|---|
| Состояние | `.claude/auto-relay/relay.mjs` | `start` · `continue` · `ready` · `stop` · `status` · `--check`; один файл `state.json` |
| Датчик и эстафета | `.claude/hooks/relay-hook.mjs` | UserPromptSubmit и PreToolUse — размер контекста по `usage` последнего ответа; Stop — открыть следующий чат или один раз подтолкнуть «работай дальше» |
| Открывашка | `.claude/auto-relay/open-chat.ps1` | новый чат через диплинк расширения и Enter |
| Навык | `.claude/skills/auto-relay/SKILL.md` | протокол агента: старт, работа, передача, продолжение, финал |
| Передача | `.claude/auto-relay/HANDOVER.md` | единственная память между чатами; коммитится |
| Самопроверка | `.claude/auto-relay/e2e.mjs` | сквозной прогон цепочки на копиях файлов во временной папке |

Почему так:
- **Размер контекста** берётся из транскрипта: Claude Code передаёт хуку `transcript_path`, а в каждом ответе модели лежит `usage`.
  Контекст считается как `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`, основная доля в `cache_read`.
  Ответы субагентов (`isSidechain`) пропускаются.
- **Порог.** На окне 1M автосжатие наблюдалось на ≈ 89 %, порог передачи 85 %. На окне 200k резерв занимает большую долю окна,
  поэтому порог по умолчанию 70 % (на 200k не замерялся, взят с запасом). Предупреждение срабатывает за 5 % до порога.
- **Новый чат.** У расширения есть обработчик ссылки `vscode://anthropic.claude-code/open?prompt=<текст>[&session=<id>]`. Он вызывает команду
  `claude-vscode.primaryEditor.open` и открывает чат во вкладке редактора. Текст при этом вставляется, но не отправляется
  (проверено в коде расширения 2.1.325 и вживую на macOS 2026-11-11). Поэтому открывашка жмёт Enter сама, и только если на переднем плане окно
  VS Code этого проекта: Enter в чужое окно опаснее, чем не отправленный текст.
- **Новый чат открывается из Stop-хука, а не командой агента.** Так он появляется только после того, как старый чат закончил ход,
  и два агента не работают одновременно. Передачу открывает только тот чат, который выполнил `ready`: в `state.json` записан его id.
- **Агент не бросает работу на середине.** Пока прогон включён и передача не готова, Stop-хук один раз возвращает
  `decision: block` с напоминанием продолжать по HANDOVER.md. Повторный стоп (`stop_hook_active`) проходит, поэтому зацикливания нет.
  Подталкивается только чат прогона (его id в `state.json`): посторонний чат, открытый владельцем в том же проекте, хук не трогает.

## 3. Что нужно на машине

- Windows 11, VS Code с расширением Claude Code (Anthropic).
- Node.js 18 или новее в PATH (`node -v`).
- Команда `code` в PATH. Её ставит установщик VS Code, проверка: `code -v`.
- PowerShell 5.1, он встроен в Windows.
- Git в проекте желателен: коммиты служат точками отката между чатами.
- Экран не блокируется на время прогона. На заблокированном экране нажатие Enter не доходит до VS Code.

## 4. Развёртывание — шаги агента

Агент выполняет шаги в корне проекта. Каждый файл создаётся ровно с текстом из блока.

### 4.1. `.claude/auto-relay/relay.mjs`

```js
#!/usr/bin/env node
// auto-relay — state of a long autonomous run that hops from chat to chat (Claude Code, VS Code extension).
// One state file: .claude/auto-relay/state.json (put it in .gitignore). The skill /auto-relay drives it with these commands:
//   node .claude/auto-relay/relay.mjs start --task "<one line>" [--max 10] [--window 200000] [--close 70]
//   node .claude/auto-relay/relay.mjs continue      # first command of every new chat of the run
//   node .claude/auto-relay/relay.mjs ready         # HANDOVER.md written and committed — the Stop hook may open the next chat
//   node .claude/auto-relay/relay.mjs stop --reason "<why>"
//   node .claude/auto-relay/relay.mjs status
//   node .claude/auto-relay/relay.mjs --check       # self-test of the decisions, no files touched
import { readFileSync, writeFileSync, statSync, mkdirSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR = dirname(fileURLToPath(import.meta.url));
export const STATE = join(DIR, 'state.json');
export const HANDOVER = join(DIR, 'HANDOVER.md');
export const LOG = join(DIR, 'relay.log');
export const sessionId = () => process.env.CLAUDE_CODE_SESSION_ID || '';

export const readState = () => { try { return JSON.parse(readFileSync(STATE, 'utf8')); } catch { return { active: false }; } };
export const writeState = (s) => { mkdirSync(DIR, { recursive: true }); writeFileSync(STATE, JSON.stringify(s, null, 2) + '\n'); };
const now = () => new Date().toISOString();

// Close threshold by window. Auto-compaction was observed at ~89 % of a 1M window; on 200k the reserve is a bigger share, so close earlier.
export const defaultClose = (window) => (window >= 1_000_000 ? 85 : 70);
// Context of one assistant turn = input + cache read + cache creation (the cache-read part is most of it).
export const contextOf = (u) => (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
// A wrong window setting must not hide the alarm: tokens above the configured window mean the model has the 1M window.
export const effectiveWindow = (tokens, window) => (tokens > window ? 1_000_000 : window);

/** What the context hook says: null (silent) or { level: 'warn'|'close', pct, text }. */
export function contextDecision(usage, state) {
  if (!state.active || !usage) return null;
  const tokens = contextOf(usage);
  const win = effectiveWindow(tokens, state.window || 200_000);
  const close = state.closePct || defaultClose(win);
  const pct = (tokens / win) * 100;
  const head = `AUTO-RELAY · контекст ≈ ${Math.round(tokens / 1000)} тыс. токенов = ${pct.toFixed(1)} % окна ${win / 1000} тыс.`;
  if (pct >= close) return { level: 'close', pct, text: `${head} ПЕРЕДАВАЙ ЭСТАФЕТУ: доведи текущий шаг до чистого среза `
    + '(проверки зелёные, коммит), новых больших шагов не начинай; перепиши .claude/auto-relay/HANDOVER.md для незнакомца, закоммить, '
    + 'выполни `node .claude/auto-relay/relay.mjs ready` и закончи ход одной строкой. Новый чат откроет Stop-хук.' };
  if (pct >= close - 5) return { level: 'warn', pct, text: `${head} До передачи эстафеты осталось меньше 5 %: заканчивай текущий шаг, `
    + 'обнови «Сделано» и «Следующий шаг» в HANDOVER.md.' };
  return null;
}

/** What the Stop hook does: { action: 'none'|'spawn'|'limit'|'block', reason }. */
export function stopDecision(state, input) {
  if (!state.active) return { action: 'none', reason: 'auto-relay is off' };
  if (state.handoverReady) {
    if (state.handoverFrom && input.session_id && state.handoverFrom !== input.session_id) return { action: 'none', reason: 'handover belongs to another chat' };
    if ((state.chain || 1) >= (state.maxChats || 10)) return { action: 'limit', reason: `chat limit ${state.maxChats || 10} reached` };
    return { action: 'spawn', reason: `chat ${(state.chain || 1) + 1} of ${state.maxChats || 10}` };
  }
  if (input.stop_hook_active) return { action: 'none', reason: 'already pushed once' };
  if (state.sessionId && input.session_id && state.sessionId !== input.session_id) return { action: 'none', reason: 'not the chat of the run' };
  return { action: 'block', reason: 'Режим auto-relay включён, а задача не закрыта. Продолжай по .claude/auto-relay/HANDOVER.md. '
    + 'Задача выполнена по критериям → `node .claude/auto-relay/relay.mjs stop --reason "<итог>"`; нужен владелец → `stop --reason "жду владельца: <что>"`.' };
}

/** `ready` is refused until HANDOVER.md was rewritten in THIS chat (its mtime is after the chat's start). */
export const handoverFresh = (handoverMtimeMs, chatStartedAt) => handoverMtimeMs > Date.parse(chatStartedAt || 0);

function arg(name, def) { const i = process.argv.indexOf(name); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : def; }

function check() {
  const t = [];
  const ok = (name, c) => t.push([name, !!c]);
  const s = { active: true, window: 200_000, chain: 1, maxChats: 3 };
  ok('silent below the warn line', contextDecision({ cache_read_input_tokens: 100_000 }, s) === null);
  ok('warn at 66 % of 200k', contextDecision({ cache_read_input_tokens: 132_000 }, s)?.level === 'warn');
  ok('close at 71 % of 200k', contextDecision({ cache_read_input_tokens: 142_000 }, s)?.level === 'close');
  ok('cache read counts (mutant without it would be silent)', contextDecision({ input_tokens: 5, cache_read_input_tokens: 150_000 }, s) !== null);
  ok('1M window: 80 % only warns', contextDecision({ cache_read_input_tokens: 800_000 }, { ...s, window: 1_000_000 })?.level === 'warn');
  ok('1M window: 86 % closes', contextDecision({ cache_read_input_tokens: 860_000 }, { ...s, window: 1_000_000 })?.level === 'close');
  ok('wrong 200k setting on a 1M model does not stay silent forever', contextDecision({ cache_read_input_tokens: 870_000 }, s)?.level === 'close');
  ok('inactive run is silent', contextDecision({ cache_read_input_tokens: 190_000 }, { active: false }) === null);
  ok('stop: inactive → none', stopDecision({ active: false }, {}).action === 'none');
  ok('stop: work not done → block once', stopDecision(s, { stop_hook_active: false }).action === 'block');
  ok('stop: second stop after the push → none (no loop)', stopDecision(s, { stop_hook_active: true }).action === 'none');
  ok('stop: another chat of the project is never pushed', stopDecision({ ...s, sessionId: 'run' }, { session_id: 'side' }).action === 'none');
  ok('stop: handover ready → spawn', stopDecision({ ...s, handoverReady: true, handoverFrom: 'a' }, { session_id: 'a' }).action === 'spawn');
  ok('stop: another chat never spawns', stopDecision({ ...s, handoverReady: true, handoverFrom: 'a' }, { session_id: 'b' }).action === 'none');
  ok('stop: chat limit → limit', stopDecision({ ...s, chain: 3, handoverReady: true }, {}).action === 'limit');
  ok('ready refused for a stale HANDOVER.md', !handoverFresh(Date.parse('2026-01-01T10:00:00Z'), '2026-01-01T11:00:00Z'));
  ok('ready accepted for a fresh HANDOVER.md', handoverFresh(Date.parse('2026-01-01T12:00:00Z'), '2026-01-01T11:00:00Z'));
  for (const [n, c] of t) console.log(`${c ? '✓' : '✗'} ${n}`);
  const bad = t.filter(([, c]) => !c).length;
  console.log(`auto-relay self-test: ${t.length - bad}/${t.length}`);
  process.exit(bad ? 1 : 0);
}

// Direct run: compare REAL paths — a symlinked or junction folder (macOS /var → /private/var, Windows junctions) breaks a plain compare.
const directRun = () => { try { return fileURLToPath(import.meta.url) === realpathSync(process.argv[1]); } catch { return false; } };
if (process.argv[1] && directRun()) {
  const cmd = process.argv[2];
  const s = readState();
  if (cmd === '--check') check();
  else if (cmd === 'start') {
    const task = arg('--task');
    if (!task) { console.error('start needs --task "<one line>"'); process.exit(2); }
    const window = Number(arg('--window', s.window || 200_000));
    writeState({ active: true, task, chain: 1, maxChats: Number(arg('--max', 10)), window, closePct: Number(arg('--close', defaultClose(window))),
      handoverReady: false, handoverFrom: '', startedAt: now(), chatStartedAt: now(), sessionId: sessionId() });
    console.log(`auto-relay ON · chat 1 · window ${window} · close at ${readState().closePct} % · write HANDOVER.md now`);
  } else if (cmd === 'continue') {
    if (!s.task) { console.error('no auto-relay run in state.json — start it with /auto-relay <task>'); process.exit(2); }
    writeState({ ...s, active: true, handoverReady: false, chatStartedAt: now(), sessionId: sessionId() });
    console.log(`auto-relay chat ${s.chain} of ${s.maxChats} · task: ${s.task} · read .claude/auto-relay/HANDOVER.md now`);
  } else if (cmd === 'ready') {
    let m = 0; try { m = statSync(HANDOVER).mtimeMs; } catch { /* missing */ }
    if (!handoverFresh(m, s.chatStartedAt)) { console.error('refused: HANDOVER.md was not rewritten in this chat'); process.exit(1); }
    writeState({ ...s, handoverReady: true, handoverFrom: sessionId(), readyAt: now() });
    console.log('handover ready — end the turn; the Stop hook opens the next chat');
  } else if (cmd === 'stop') {
    writeState({ ...s, active: false, handoverReady: false, stoppedAt: now(), stopReason: arg('--reason', '') });
    console.log('auto-relay OFF');
  } else if (cmd === 'status') console.log(JSON.stringify(s, null, 2));
  else { console.error('usage: relay.mjs start|continue|ready|stop|status|--check'); process.exit(2); }
}
```

### 4.2. `.claude/hooks/relay-hook.mjs`

```js
#!/usr/bin/env node
// relay-hook — one hook for three events of the auto-relay run (wired in .claude/settings.json):
//   UserPromptSubmit · PreToolUse — read the context size of the last answer from the transcript and warn / order the handover;
//                                   a prompt that starts with «auto-relay continue» also gets the order to run the skill;
//   Stop                          — handover ready → open the next chat (Windows: open-chat.ps1); work not done → push once to continue.
// Never breaks a session: any error → silent exit 0. Dry run (prints instead of opening a chat): env AUTO_RELAY_DRY=1.
import { readFileSync, writeFileSync, openSync, readSync, fstatSync, closeSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { readState, writeState, contextDecision, stopDecision, DIR, LOG } from '../auto-relay/relay.mjs';

const TAIL = 4 * 1024 * 1024; // the last answer is always in the tail; a whole transcript can be hundreds of MB

/** usage of the last main-chat answer (subagent answers carry isSidechain and are skipped). */
export function lastUsage(path) {
  const fd = openSync(path, 'r');
  try {
    const size = fstatSync(fd).size, len = Math.min(size, TAIL), buf = Buffer.alloc(len);
    readSync(fd, buf, 0, len, size - len);
    const lines = buf.toString('utf8').split('\n');
    if (len < size) lines.shift();
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i].includes('"usage"')) continue;
      let o; try { o = JSON.parse(lines[i]); } catch { continue; }
      if (o.type === 'assistant' && !o.isSidechain && o.message && o.message.usage) return o.message.usage;
    }
    return null;
  } finally { closeSync(fd); }
}

const say = (event, text) => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }));
const log = (line) => { try { appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`); } catch { /* no log, no harm */ } };

function openNextChat(projectDir) {
  const prompt = 'auto-relay continue';
  if (process.env.AUTO_RELAY_DRY === '1') { console.error(`[dry] would open a new chat in ${projectDir} with «${prompt}»`); return; }
  if (process.platform !== 'win32') { log('open-chat: only Windows is wired (open-chat.ps1); open a chat by hand and send «auto-relay continue»'); return; }
  spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', join(DIR, 'open-chat.ps1'),
    '-Folder', projectDir, '-Prompt', prompt], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const ev = input.hook_event_name;
  const state = readState();
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

  if (ev === 'Stop') {
    const d = stopDecision(state, input);
    if (d.action === 'spawn') {
      writeState({ ...state, handoverReady: false, chain: (state.chain || 1) + 1, lastRelayAt: new Date().toISOString() });
      log(`relay → ${d.reason}`);
      openNextChat(projectDir);
    } else if (d.action === 'limit') {
      writeState({ ...state, active: false, handoverReady: false, stopReason: d.reason });
      log(`stopped: ${d.reason}`);
    } else if (d.action === 'block') {
      process.stdout.write(JSON.stringify({ decision: 'block', reason: d.reason }));
    }
  } else if (ev === 'UserPromptSubmit' || ev === 'PreToolUse') {
    const parts = [];
    if (ev === 'UserPromptSubmit' && /^\s*\/?auto-relay continue/i.test(input.prompt || '')) {
      parts.push('ПРИКАЗ: это следующий чат длинной автономной задачи. Запусти навык auto-relay в режиме continue: '
        + 'сначала `node .claude/auto-relay/relay.mjs continue`, потом прочитай .claude/auto-relay/HANDOVER.md целиком и продолжай со «Следующего шага».');
    }
    const d = input.transcript_path ? contextDecision(lastUsage(input.transcript_path), state) : null;
    // PreToolUse speaks only when the level changes (memory per session in tmp), UserPromptSubmit always.
    const memo = join(tmpdir(), `auto-relay-${String(input.session_id || 'x').replace(/[^\w-]/g, '')}.json`);
    let seen = ''; try { seen = JSON.parse(readFileSync(memo, 'utf8')).level; } catch { /* first time */ }
    if (d && (ev === 'UserPromptSubmit' || d.level !== seen)) { parts.push(d.text); writeFileSync(memo, JSON.stringify({ level: d.level })); }
    if (parts.length) say(ev, parts.join('\n'));
  }
} catch { /* silent: a hook never breaks the session */ }
process.exit(0);
```

### 4.3. `.claude/auto-relay/open-chat.ps1`

В файле только ASCII-символы, поэтому Windows PowerShell 5.1 читает его правильно в любой кодировке сохранения.

```powershell
# open-chat.ps1 - open a NEW Claude Code chat in the VS Code window of this project and send the prompt (Windows 11).
# Called by .claude/hooks/relay-hook.mjs on Stop after `relay.mjs ready`. Manual test:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .claude\auto-relay\open-chat.ps1 -Folder "C:\path\to\project" -Prompt "auto-relay continue"
# Route: `code -r <folder>` raises the project window -> deep link vscode://anthropic.claude-code/open?prompt=... opens a new chat tab with
# the text pre-filled (the extension does NOT send it) -> Enter is pressed ONLY if the foreground window is this project's VS Code.
param(
  [Parameter(Mandatory = $true)][string]$Folder,
  [string]$Prompt = "auto-relay continue",
  [int]$DelaySec = 4,          # let the old chat finish its last turn
  [switch]$CtrlEnter            # set if the extension option "use Ctrl+Enter to send" is on
)
$log = Join-Path $Folder ".claude\auto-relay\relay.log"
function Log($m) { Add-Content -Path $log -Value ("{0} open-chat: {1}" -f (Get-Date -Format o), $m) }

Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices;
public static class Fg {
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  public static string Title() { var sb = new StringBuilder(512); GetWindowText(GetForegroundWindow(), sb, 512); return sb.ToString(); }
}
"@

Start-Sleep -Seconds $DelaySec
$name = Split-Path $Folder -Leaf
& code -r "$Folder"                                      # project window becomes the last active VS Code window
Start-Sleep -Seconds 2
Start-Process ("vscode://anthropic.claude-code/open?prompt=" + [uri]::EscapeDataString($Prompt))

# Wait up to 15 s for this project's VS Code window to be in front (title: "... - <folder> - Visual Studio Code").
$ws = New-Object -ComObject WScript.Shell
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Milliseconds 500
  $t = [Fg]::Title()
  if ($t -like "*$name*" -and $t -like "*Visual Studio Code*") {
    Start-Sleep -Milliseconds 1500                         # the new chat input mounts after the tab opens
    if ($CtrlEnter) { $ws.SendKeys("^~") } else { $ws.SendKeys("~") }
    Log "sent '$Prompt' to '$t'"
    exit 0
  }
  if ($i -eq 10) { $null = $ws.AppActivate("Visual Studio Code") }   # one nudge if the window did not come forward by itself
}
Log "FAILED: foreground window is '$([Fg]::Title())', not VS Code of $name - Enter NOT sent; open a chat and send '$Prompt' by hand"
exit 1
```

### 4.4. `.claude/skills/auto-relay/SKILL.md` — даёт слеш-команду `/auto-relay`

````markdown
---
name: auto-relay
description: "Длинная автономная задача, которая не помещается в один чат: агент работает сам, а когда контекст чата подходит к пределу, доводит шаг до среза, пишет передачу в .claude/auto-relay/HANDOVER.md, и хук сам открывает НОВЫЙ чат VS Code, который продолжает работу. Используй по фразам «работай автономно с созданием новых чатов автоматически», «длинная автономная задача на много чатов», «auto-relay», и ВСЕГДА когда сообщение начинается с «auto-relay continue» (это прислал хук из прошлого чата)."
---

# /auto-relay — автономная работа с эстафетой между чатами

Режимы: `/auto-relay <задача>` — старт · `auto-relay continue` — продолжение в новом чате (присылает хук) · `/auto-relay stop` — выключить.

## Старт (`/auto-relay <задача>`)

1. Сформулируй задачу так, чтобы её можно было делать без владельца: **цель** одной фразой, **критерии готовности** (каждый
   проверяется командой или наблюдением), **границы** (что не трогать; внешние отправки — Slack, почта, тикеты, push — только с явного
   «да» владельца). Если без ответа владельца задачу не начать — задай ОДИН вопрос сейчас; дальше вопросов не будет.
2. `node .claude/auto-relay/relay.mjs start --task "<цель одной строкой>" [--max 10] [--window 200000] [--close 70]`
   (`--window 1000000` для модели с окном 1M; `--max` — сколько чатов подряд максимум; `--close` — порог передачи в процентах,
   без него 70 % на 200k и 85 % на 1M). Параметры, которые назвал владелец, передай сюда.
3. Напиши `.claude/auto-relay/HANDOVER.md` по шаблону ниже и закоммить (если проект в git).
4. Работай.

## Работа (в каждом чате)

- Цикл: шаг → проверка наблюдением (запуск, тест, вывод) → коммит → строка в «Сделано» HANDOVER.md. Обновляй HANDOVER.md на каждой вехе:
  это страховка от сжатия контекста и обрыва.
- Хук пишет строку `AUTO-RELAY · контекст …`. «Осталось меньше 5 %» — закончи текущий шаг. **«ПЕРЕДАВАЙ ЭСТАФЕТУ»** — сразу к передаче.
- Не останавливайся ради вопроса. Вопрос к владельцу записывай в HANDOVER.md, раздел «Вопросы владельцу», и бери следующий шаг, который
  от ответа не зависит. Если всё упёрлось во владельца, выполни `node .claude/auto-relay/relay.mjs stop --reason "жду владельца: <что>"`
  и напиши вопрос в чат.

## Передача эстафеты (по приказу хука)

1. Доведи текущий шаг до чистого среза: проверки зелёные, коммит. Новых больших шагов не начинай.
2. Перепиши HANDOVER.md для незнакомца: следующий чат ничего не помнит, кроме этого файла.
3. Закоммить.
4. `node .claude/auto-relay/relay.mjs ready` (откажет, если HANDOVER.md не переписан в этом чате).
5. Закончи ход ОДНОЙ строкой: «Передаю эстафету: чат N → N+1, следующий шаг — …». После неё никаких действий: Stop-хук откроет новый чат и
   отправит в него `auto-relay continue`.

## Продолжение (`auto-relay continue`)

1. `node .claude/auto-relay/relay.mjs continue`
2. Прочитай `.claude/auto-relay/HANDOVER.md` целиком, `git log --oneline -10`, `git status`.
3. Проверь, что последний коммит прошлого чата на месте, а «Следующий шаг» ещё не сделан. Продолжай с него.

## Финал

Все критерии готовности выполнены и проверены → `node .claude/auto-relay/relay.mjs stop --reason "<итог>"` → отчёт владельцу: что
сделано, каким наблюдением проверено, сколько было чатов, что осталось непроверенным.

## Шаблон HANDOVER.md

```markdown
# HANDOVER — <цель одной строкой>
Чат: N из M · обновлено: <дата время>

## Цель и критерии готовности
- [ ] <критерий 1 — чем проверяется>
## Границы
<что не трогать, что только с «да» владельца>
## Сделано
- <что> — <доказательство: команда, вывод, коммит>
## Следующий шаг (начни отсюда)
<конкретно: файл, команда, ожидаемый результат>
## Открытые проблемы и ловушки
<что уже пробовали и не сработало, почему>
## Вопросы владельцу <!-- questions-guard:allow заголовок шаблона HANDOVER.md внутри блока кода навыка, не вопрос владельцу -->
<если есть>
```
````

### 4.5. `.claude/auto-relay/e2e.mjs` — сквозная самопроверка

```js
// e2e — end-to-end check of the auto-relay chain: the hook is fed the JSON Claude Code sends, chat opening runs dry.
// Runs on COPIES of relay.mjs and relay-hook.mjs in a temp folder, so the live state.json is never touched.
//   node .claude/auto-relay/e2e.mjs      → «e2e: 15/15»
import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, rmSync, mkdirSync, mkdtempSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));            // <project>/.claude/auto-relay
const ROOT = mkdtempSync(join(tmpdir(), 'auto-relay-e2e-'));     // fake project
mkdirSync(join(ROOT, '.claude/auto-relay'), { recursive: true }); mkdirSync(join(ROOT, '.claude/hooks'), { recursive: true });
copyFileSync(join(SRC, 'relay.mjs'), join(ROOT, '.claude/auto-relay/relay.mjs'));
copyFileSync(join(SRC, '../hooks/relay-hook.mjs'), join(ROOT, '.claude/hooks/relay-hook.mjs'));
const RELAY = join(ROOT, '.claude/auto-relay/relay.mjs');
const HOOK = join(ROOT, '.claude/hooks/relay-hook.mjs');
const STATE = join(ROOT, '.claude/auto-relay/state.json');
const HANDOVER = join(ROOT, '.claude/auto-relay/HANDOVER.md');
const T = join(ROOT, 'transcript.jsonl');
const env = (sid) => ({ ...process.env, CLAUDE_CODE_SESSION_ID: sid, CLAUDE_PROJECT_DIR: ROOT, AUTO_RELAY_DRY: '1' });
const relay = (args, sid = 'chat-1') => spawnSync('node', [RELAY, ...args], { env: env(sid), encoding: 'utf8' });
const hook = (input, sid = 'chat-1') => spawnSync('node', [HOOK], { input: JSON.stringify(input), env: env(sid), encoding: 'utf8' });
const state = () => JSON.parse(readFileSync(STATE, 'utf8'));
const usage = (cache) => JSON.stringify({ type: 'assistant', message: { usage: { input_tokens: 3, cache_read_input_tokens: cache, cache_creation_input_tokens: 500 } } });
const results = [];
const ok = (name, c, extra = '') => results.push([name, !!c, extra]);
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

for (const s of ['chat-1', 'chat-2', 'other']) rmSync(join(tmpdir(), `auto-relay-${s}.json`), { force: true });
rmSync(STATE, { force: true }); rmSync(HANDOVER, { force: true }); rmSync(join(ROOT, '.claude/auto-relay/relay.log'), { force: true });
ok('hook silent while auto-relay is off', hook({ hook_event_name: 'Stop', session_id: 'chat-1' }).stdout === '');
ok('start', relay(['start', '--task', 'demo', '--max', '2']).status === 0 && state().active && state().chain === 1);
writeFileSync(T, [usage(50_000), usage(100_000)].join('\n') + '\n');
ok('50 % of 200k: no context line', !/AUTO-RELAY/.test(hook({ hook_event_name: 'UserPromptSubmit', session_id: 'chat-1', transcript_path: T, prompt: 'x' }).stdout));
writeFileSync(T, [usage(100_000), JSON.stringify({ type: 'assistant', isSidechain: true, message: { usage: { cache_read_input_tokens: 190_000 } } }), usage(142_000)].join('\n') + '\n');
const close = hook({ hook_event_name: 'PreToolUse', session_id: 'chat-1', transcript_path: T });
ok('71 % of 200k on PreToolUse: ПЕРЕДАВАЙ ЭСТАФЕТУ', /ПЕРЕДАВАЙ ЭСТАФЕТУ/.test(close.stdout));
ok('same level on the next PreToolUse: silent', hook({ hook_event_name: 'PreToolUse', session_id: 'chat-1', transcript_path: T }).stdout === '');
const push = hook({ hook_event_name: 'Stop', session_id: 'chat-1', stop_hook_active: false });
ok('Stop while work is not handed over: block with a reason', JSON.parse(push.stdout || '{}').decision === 'block');
ok('Stop right after the push: no second block', hook({ hook_event_name: 'Stop', session_id: 'chat-1', stop_hook_active: true }).stdout === '');
ok('ready refused: HANDOVER.md not written in this chat', relay(['ready']).status === 1);
sleep(20); writeFileSync(HANDOVER, '# HANDOVER — demo\n');
ok('ready accepted after HANDOVER.md', relay(['ready']).status === 0 && state().handoverReady && state().handoverFrom === 'chat-1');
ok('Stop of ANOTHER chat does not open a chat', !/would open/.test(hook({ hook_event_name: 'Stop', session_id: 'other' }).stderr) && state().handoverReady);
const spawnRun = hook({ hook_event_name: 'Stop', session_id: 'chat-1' });
ok('Stop of this chat: next chat opened (dry) and chain = 2', /would open a new chat .*auto-relay continue/.test(spawnRun.stderr) && state().chain === 2 && !state().handoverReady, spawnRun.stderr.trim());
const order = hook({ hook_event_name: 'UserPromptSubmit', session_id: 'chat-2', transcript_path: T, prompt: 'auto-relay continue' }, 'chat-2');
ok('new chat prompt «auto-relay continue» gets the order to run the skill', /ПРИКАЗ: это следующий чат/.test(order.stdout));
ok('continue in chat 2', relay(['continue'], 'chat-2').status === 0 && state().sessionId === 'chat-2');
sleep(20); writeFileSync(HANDOVER, '# HANDOVER — demo, chat 2\n');
relay(['ready'], 'chat-2');
hook({ hook_event_name: 'Stop', session_id: 'chat-2' }, 'chat-2');
ok('chat limit 2 reached: run switched off, no chat opened', state().active === false && /limit/.test(state().stopReason || ''));
ok('relay.log keeps the events', /relay → chat 2 of 2/.test(readFileSync(join(ROOT, '.claude/auto-relay/relay.log'), 'utf8')));

for (const [n, c, x] of results) console.log(`${c ? '✓' : '✗'} ${n}${x && !c ? ' · ' + x : ''}`);
const bad = results.filter((r) => !r[1]).length;
console.log(`e2e: ${results.length - bad}/${results.length}`);
rmSync(ROOT, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
```

### 4.6. `.claude/settings.json` — подключить хук и разрешения

Если в `settings.json` уже есть `hooks` или `permissions`, агент **добавляет** записи в существующие массивы и ничего не заменяет.
Форма `"command": "node", "args": [...]` запускает node без оболочки, поэтому кавычки и пробелы в пути на Windows не мешают.
Если версия расширения не понимает `args`, допустима форма `"command": "node .claude/hooks/relay-hook.mjs"`: хук запускается из
корня проекта.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/relay-hook.mjs"], "timeout": 5 } ] }
    ],
    "PreToolUse": [
      { "matcher": "*", "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/relay-hook.mjs"], "timeout": 5 } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/relay-hook.mjs"], "timeout": 10 } ] }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(node .claude/auto-relay/relay.mjs:*)",
      "Bash(node .claude/auto-relay/e2e.mjs)"
    ]
  }
}
```

Длинная автономная работа встаёт на любом запросе разрешения. Поэтому до старта в `permissions.allow` вносятся команды, которые задача
будет вызывать (сборка, тесты, git), а внешние отправки остаются под запретом.

### 4.7. `.gitignore`

```
.claude/auto-relay/state.json
.claude/auto-relay/relay.log
```

`HANDOVER.md` коммитится: по истории git видно, как шла эстафета.

## 5. Приёмка на машине — по порядку, каждый шаг с ожидаемым результатом

1. `node .claude/auto-relay/relay.mjs --check` → `auto-relay self-test: 17/17`.
2. `node .claude/auto-relay/e2e.mjs` → `e2e: 15/15`. Тест работает на копиях во временной папке, живой `state.json` не трогает.
3. Ручная проверка диплинка: `Win+R` → `vscode://anthropic.claude-code/open?prompt=проверка` → в VS Code открывается вкладка нового чата
   с текстом «проверка», текст не отправлен.
4. Открывашка вручную, в PowerShell, при открытом VS Code проекта:
   `powershell -NoProfile -ExecutionPolicy Bypass -File .claude\auto-relay\open-chat.ps1 -Folder "<полный путь проекта>" -Prompt "Ответь одним словом: открылся" -DelaySec 1`
   → новый чат отвечает «открылся», в `.claude/auto-relay/relay.log` строка `open-chat: sent`.
   Если текст вставился, но не ушёл, а в настройках расширения включена отправка по Ctrl+Enter, добавь `-CtrlEnter`.
5. Репетиция цепочки на маленьком окне. Владелец пишет в новом чате:
   `/auto-relay <маленькая задача на 3–4 шага>, параметры старта: --window 100000 --close 50 --max 2`.
   Ожидаемо: в чате 1 на ≈ 50 тыс. токенов появляется «ПЕРЕДАВАЙ ЭСТАФЕТУ», агент пишет HANDOVER.md и выполняет `ready`, через ≈ 10 с
   открывается чат 2 и продолжает. На лимите `--max 2` прогон выключается сам (`relay.mjs status` → `"active": false`, причина
   `chat limit 2 reached`). Шаги задачи держи мелкими: если контекст за один ход перескочит окно 100 тыс., датчик сочтёт окно моделью
   на 1M и порог уйдёт выше.
6. После репетиции задать настоящие значения: `--window 1000000` для модели с окном 1M, иначе 200000. `--close` не задавать, чтобы
   сработал порог по умолчанию.

## 6. Риски и что делать

| Ярус | Риск | Что делать |
|---|---|---|
| высокий | Открывашка на Windows ещё ни разу не запускалась. Окно VS Code может не выйти на передний план: Windows запрещает фоновым процессам отбирать фокус | Первый прогон под присмотром. Открывашка закрыта на ошибку: Enter не нажимается, в `relay.log` пишется строка `FAILED`, и владелец отправляет `auto-relay continue` руками. Если сбой повторяется, кнопку отправки можно нажимать через UI Automation (PowerShell `System.Windows.Automation`), найдя её имя в дереве инструментом Inspect из Windows SDK |
| высокий | Запрос разрешения останавливает автономию | Пункт 4.6: заранее разрешить команды задачи |
| средний | Неверное `--window` | При контексте больше заданного окна датчик считает окно равным 1M. С 200k на модели 1M передача просто случится раньше |
| средний | Автосжатие случилось раньше порога | HANDOVER.md обновляется на каждой вехе, поэтому после сжатия агент продолжает по файлу в том же чате |
| средний | Старый чат продолжает работу после `ready` | Протокол: после `ready` только одна строка. Открывашка ждёт 4 с, и передачу открывает только чат с id из `state.json` |
| средний | Бесконечная цепочка | Лимит `--max` и команда `relay.mjs stop`. Финал — по критериям готовности из HANDOVER.md |
| средний | Агенту не виден id сессии (`CLAUDE_CODE_SESSION_ID` в окружении команд; на macOS с расширением 2.1.325 есть, на Windows не проверено) | Привязка к чату отключается сама: `ready` пишет пустой id, и передачу откроет первый чат проекта, закончивший ход. Проверка: `node -e "console.log(process.env.CLAUDE_CODE_SESSION_ID)"` из чата агента |
| низкий | Обновление расширения сменит диплинк | Шаг 3 приёмки после каждого обновления расширения |
| низкий | Вкладки старых чатов копятся | Закрывать их руками, на работу они не влияют |

## 7. Откуда это: как работает исходный стек (macOS)

| Здесь | В исходном проекте |
|---|---|
| `relay-hook.mjs`, контекстная часть | хук бюджета контекста: на 80 % окна 1M предупреждение голосом, на 85 % — довести до среза и мягко закрыть чат |
| SKILL.md, «Передача» | навык мягкого закрытия: статус и передача «с чего продолжить» в STATUS.md, коммит, прощальная записка |
| `open-chat.ps1` | инструмент нового чата: кнопка «New session» по подписи в Accessibility macOS, текст через буфер обмена и Return |
| SKILL.md, «Продолжение» | ведущее слово `resume` в первом сообщении нового чата: хук приказывает пройти полный вход и читать STATUS.md |
| `relay.mjs` (лимит, `stop`) | автономные циклы с условиями остановки |

В переносимой версии этот стек собран в один навык с одним файлом состояния. Порог передачи стал единственным: голос и ступень 80 % убраны,
зато добавлены открытие чата из Stop-хука и привязка передачи к id сессии.
