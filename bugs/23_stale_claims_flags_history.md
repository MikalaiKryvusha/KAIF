# Bug 23 — `stale-claims` не отличает летопись от протухшего утверждения (K5)

**Status:** 🟡 OPEN
**Version/build:** 2.0 (build 68) · **When/context:** 2026-07-31, отчёт ndim (`ai_agents_reports/23`, K5).

## Symptom

Из 24 срабатываний скана в поле **половина легитимна**: записи EXPERIENCE об обновлении 1.5→1.6,
отчёт researches/15 (он ПРО версию 1.6), строка STATUS «Предыдущее обновление: … 1.6». Историю
нельзя «обновить до 2.0», не соврав. Шумный страж приучает игнорировать вывод (урок отчёта 13:
ложная тревога опаснее пропуска).

## Repro (deterministic)

Свод: фикстура с EXPERIENCE-записью «обновились на <старая версия>» и researches-доком про старую
версию → update → сейчас обе строки в `stale-claims`; после фикса — нет (или в секции «вероятно
история»).

## Forensics

**Красный прогон s07/T4 (2026-07-31):** все три фикстурных журнала прошлого попали в stale-claims
задания — `researches/15_kaif_20_note.md`, дописанная EXP-строка в `EXPERIENCE.md`, строка
«Предыдущее обновление: KAIF 2.0.» в `STATUS.md` (3 стража красные).

## Root cause

`framework/installer/KAIF-CORE.mjs:403-426` — `scanStaleClaims` ходит по ВСЕМ .md (кроме
.git/node_modules/.kaif), включая директории знаний — журналы прошлого по определению.

## Fix plan (план 23, Фаза B3; предложение отчёта)

Не сканировать `researches/ interviews/ homeworks/ bugs/ ideas/` и `EXPERIENCE.md`; в `STATUS.md`
пропускать строки с «предыдущ/previous»; вывод делить на «вероятно протухло» / «вероятно история».
Сшивка с эпиком H: `PROJECT_HISTORY.md` войдёт в исключения с рождения.

## Decisions made without the owner

*Заполнится при закрытии.*

## Links

`ideas/ai_agents_reports/23` (K5) · `plans/23` Фаза B3 · план 22 §6 (эпик H).
