# Bug 151 — follow-up на границе завершения Kimi-хода исчезает без отправки

**Status:** 🔴 OPEN — наблюдение владельца зафиксировано; граничный отказ ещё не воспроизведён на стенде
**Version/build:** Kimi Code 2.7.2, VS Code, Windows 11; reference implementation gxgleo67 extension 0.9.23 · **When/context:** 2026-11-23 00:34 +03:00, проектирование автоматического steer в `plans/144`
**Severity:** S2 — теряется введённое пользователем сообщение и требуется его повторный ввод
**Fixing:** фаза F3 `plans/144`; R&D-контроль проектируется в F1 `plans/145`

**Вектор цели:** **Avoid + Maintain.** Ни один follow-up не исчезает на переходе running → idle: сообщение либо вливается в текущий ход через steer, либо ровно один раз отправляется новым ходом, либо возвращается в composer вместе с вложениями при фактической ошибке.

**Fix accepted when (observable):**

1. Scale: доставленные сообщения при гонке завершения. Meter: контролируемый Extension Host завершает ход между нажатием Enter и `SteerChat`. Target: исходное содержимое создаёт ровно один новый ход; `SteerInput` = 0, duplicate prompt = 0, queue = 0, верхний ошибочный диалог для штатной гонки = 0.
2. Scale: сохранность composer при фактической ошибке. Meter: `SteerChat` отклоняется ошибкой, отличной от turn-ended. Target: текст и все media восстановлены в поле ввода, ошибка видима, отправленных событий = 0.
3. Scale: порядок серии follow-up. Meter: три сообщения отправляются во время одного running turn. Target: три `turn.steer`/`SteerInput` в исходном порядке, queue = 0, ни одно не очищает composer следующего.

## Symptom

Владелец сообщил: «там есть баг, что иногда отправка фолоу апа в такой какой-то особый момент попадает, что он и не отправился, и исчез из поля ввода, и вверху диалог ошибки появляется.»

Особый момент соответствует границе, когда UI ещё считает ход активным, а движок уже завершил его или фиксирует терминальное состояние. Это пока интерпретация симптома, не наблюдённая причина конкретного прошлого случая.

## Repro (deterministic стенд требуется)

Живой прошлый отказ не воспроизведён. Детерминированный сценарий для F1:

1. Поднять реальный VS Code Extension Host с instrumented `SessionRuntime` и открыть проектную сессию.
2. Начать ход, дождаться `isStreaming = true`, ввести текст и media follow-up.
3. Задержать webview→host `SteerChat`, завершить активный ход, затем выпустить вызов.
4. Проверить отдельно три исхода host: accepted steer, turn-ended, фактическая ошибка.
5. Повторить с тремя быстрыми follow-up и проверить порядок/отсутствие дублей.

Нельзя объявлять баг воспроизведённым по одному чтению `catch`: нужен наблюдённый исчезнувший ввод на этом пути до исправления.

## Forensics

Официальный VS Code уже имеет `chat.handler.ts → steerChat → runtime.steer()`. В `runtime.steer()` `SteerInput` испускается только после успешного `await this.session.steer(...)`.

Reference gxgleo67 `chat.store.ts → steerNow`:

```ts
void bridge.steerChat(content)
  .then(({ ok }) => {
    if (ok) { set({ draftMedia: [] }); return; }
    get().sendMessage(text);
  })
  .catch((error) => {
    toast.error(error instanceof Error ? error.message : String(error));
  });
```

Два подозрительных места видны по коду:

- `catch` показывает ошибку, но не восстанавливает текст/media в composer. Если InputArea уже очистил поле после отправки, пользователь наблюдает именно потерю ввода.
- fallback вызывает `sendMessage(text)`, а не исходный `content`: media, добавленные в `Content.build`, в этой ветке теряются. При добавлении автоматического steer нельзя допустить и рекурсивный цикл send→steer→send.

В текущем живом wire есть успешные примеры обычного steer (`prompt.steered` + `turn.steer`, например wire 2028/2040 и 2349/2358), поэтому механизм в целом рабочий. Строки ошибки прошлого отказа и снимок диалога не сохранены; нельзя выдумывать её текст.

## Root cause / Hypotheses

1. **Основная:** UI очищает composer до подтверждения доставки; rejected steer на running→idle boundary попадает в generic `catch`/toast без rollback. Подтверждается соответствующим кодом reference, но сам отказ ещё требует red repro.
2. **Вторая:** `runtime.isBusy` и реальное состояние engine расходятся на терминальном переходе. `ok: false` обрабатывает лишь часть гонки; rejected promise попадает в ошибку вместо нормального нового хода.
3. **Дополнительная потеря:** fallback передаёт только text, отбрасывая собранные media. Это отдельный дефект той же ветки, видимый по коду, и входит в страж.

## Fix plan

1. В F1 построить красный Extension Host repro с управляемой гонкой и зафиксировать фактический исчезнувший composer до правки.
2. Различить structured outcome `steered`, `turn-ended`, `failed`; нормальный turn-ended не показывать как ошибку.
3. До подтверждения сохранять исходный `content` и media. При turn-ended отправить тот же content ровно один раз через отдельный idle-send путь, не рекурсивный automatic-steer вход.
4. При фактической ошибке восстановить текст и media draft; ошибку оставить видимой. При accepted steer очищать draft только после host acknowledgement.
5. Автоматический Enter во время running turn использует тот же hardened path, queue остаётся пустой. Добавить мутанты: потерянный rollback, двойной fallback, media loss, recursive fallback, reorder.
6. В F3/F4 прогнать unit + реальный Extension Host + живой путь владельца; DONE только после прочитанных событий и экрана для трёх исходов.

## Decisions made without the owner

Пока none. Требование «не терять follow-up» дано владельцем; конкретная structured outcome форма будет выбрана по коду в F2/F3 и записана здесь.

## Links

`plans/144_EPIC_kimi_no_auto_compaction.md` критерий 11 · `plans/145_epic144_rnd_fork_and_disable_switch.md` · `researches/51_kimi_no_auto_compaction.md` §11 · `bugs/150` — отдельный дефект closure latch, не дубликат.

kaif-fp: Kimi VS Code follow-up steer :: composer input lost on running-idle race :: v2.10
