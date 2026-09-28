# Bug 126 — Забор ответа после падения браузера на Linux и macOS откладывался навсегда: замок профиля, оставленный убитым Chromium, читался «окно ещё открыто»

**Status:** 🔧 фикс 2026-09-28 22:55 +03:00 (сессия 76, эпик CP 2.9, `plans/129`) — `profileHeld` судит POSIX-замок профиля по хосту и pid; свод `s22` D
в облачном Linux: на сборке v2.8 пять случаев забора красны, на починке — 100 зелёных. DONE — на закрытии эпика CP после лёгкого судьи;
путь владельца (Windows, `lockfile`) этим фиксом не тронут.
**Severity:** S2 — терялся бы прогон и ответ владельца оставался невнесённым до ручного разбора: ответ, записанный «на этом компьютере»
при мёртвом сервере, лежит в профиле, но `--queue --list` его не забирает никогда. Данные не теряются; поле — все тикеты с Windows, где
замок другой (`lockfile`), поэтому у владельца дефект не проявлялся.
**Version/build:** KAIF 2.8 (выпущена) и 2.9 до фикса; `framework/tools/contour/review.mjs` → `profileHeld` (POSIX-ветка); облачный
Linux-контейнер, Chromium Playwright 1194 (`/opt/pw-browsers/chromium`).
**When/context:** сессия 76, 2026-09-28 22:28–22:52 +03:00, нулёвка эпика CP: свод `s22` впервые нашёл Chromium в контейнере (единый
список браузеров) и часть D (забор ответа после жёсткого убийства браузера) покраснела.
**Fixing:** эта сессия, тем же движением, что заведён.
**Fix accepted when (observable):**
- Ситуация. Страница контура открыта окном на профиле проекта; сервер убит, владелец нажал «Записать» — ответ лёг в профиль; браузер
  убит жёстко (`kill -9`), символьная ссылка `SingletonLock` → «<хост>-<pid>» осталась.
- Действие. Агент печатает очередь владельца (`--queue --list`).
- Результат. Строки «recovery deferred» нет; «answer recovered from the owner's machine … from indexedDB», запись несёт `recovered: true`;
  пока браузер ЖИВ (тот же pid), забор по-прежнему откладывается.
- Проверка. `node tools/sandbox/s22-contour-shipped.mjs` в Linux-окружении с Chromium — случаи (5а) «забор ОТЛОЖЕН» и (5б) «после
  ЖЁСТКОГО убийства … забрал» зелёные; `KAIF_DIST=<v2.8/dist>` — (5б) и четыре следующих красны.

## Symptom

`--queue --list` после жёсткого убийства браузера печатает «recovery deferred: a browser still holds the project profile (SingletonLock
present (platform not verified))» — и так на каждом следующем вызове: ссылка не исчезает сама.

## Repro (deterministic)

1. `P=$(mktemp -d)`; `/opt/pw-browsers/chromium --headless=new --no-sandbox --user-data-dir=$P about:blank &`
2. `readlink $P/SingletonLock` → `vm-32293` (хост `vm`, pid браузера); `pkill -9 -f "user-data-dir=$P"`
3. `ls -la $P/SingletonLock` → ссылка на месте (наблюдено 2026-09-28 22:51 +03:00).
4. Код v2.8: `try { lstatSync(join(d, 'SingletonLock')); return 'SingletonLock present (platform not verified)'; }` — наличие ссылки = занято.

## Root cause

POSIX-ветка проверки занятости профиля судила НАЛИЧИЕ замка, а не его жизнь; сам Chromium на POSIX хранит в ссылке «хост-pid» и
считает замок своего хоста с мёртвым pid остатком. Ветка была честно помечена «not verified» и так и не проверена: свод, который её
судит (`s22` D), на машине владельца идёт по Windows-ветке, а в облаке прежде пропускался — Chromium контейнера не был в списке браузеров.

## Fix

`profileHeld`: ссылки нет → свободно; не ссылка → занято; хост другой или ссылка не разбирается → занято; pid жив или чужой (EPERM) →
занято; pid мёртв (ESRCH) → остаток, свободно. Windows-ветка (`lockfile`) не менялась. Попутно — один список браузеров в поставке
(`review.mjs`: `KAIF_BROWSER`, Chromium контейнера, флаг `--no-sandbox` только под root), инструменты истока берут его оттуда.
`TWINS: searched "SingletonLock|lockfile" in framework/ tools/ — found 1 judge of profile liveness (profileHeld); the page lock of the
contour (checkLock) judges its own pid already.`

## Decisions made without the owner

Заполняется при закрытии. На момент заведения: `[ИИ]` правило «свой хост + мёртвый pid → остаток» взято у самого Chromium
(поведение ProcessSingleton на POSIX, наблюдено пробой выше), без строки `FORK:` — вариант «занято» остаётся для любого сомнения.

## Links

`plans/129` CP0/CP6 · `plans/111` LP (критерий 19 2.7 — забор ответа) · `tools/sandbox/s22-contour-shipped.mjs` (5а)/(5б) · #125.
