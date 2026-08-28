<!--
  ⚠️ ЭТОТ ФАЙЛ — ТЕЛО СТРАНИЦЫ РЕЛИЗА, И В НЁМ АБЗАЦ ПИШЕТСЯ ОДНОЙ СТРОКОЙ.
  GitHub Releases сохраняет переводы строк (одиночный \n рендерится разрывом), поэтому врап
  «для читаемости в репозитории» превращается на публичной странице в рваный текст. Проверка
  перед публикацией: в файле не должно быть двух непустых строк подряд вне блоков кода и таблиц.

-->

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.4_GitHub_LOGO.webp" alt="KAIF 2.4 Teamed Up KAIF" width="620">
</p>

> **Release date: 2026-08-28** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.4 — Teamed Up KAIF.** KAIF is an agent harness, and until now it harnessed one agent per project. The central feature of this version is written in its name: 2.4 teaches KAIF to deploy a whole team of AI agents — several agents pulling one project in one harness, each in its own workplace, all visible on one status board.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is what is new in this version.

---

### ✨ What's new in 2.4

**1. A team of agents, deployed as a skill.** The new optional `/team-deployment` skill — the 37th in the set — analyzes the project's work profile, proposes a justified composition (roles, archetype, size) and deploys it: isolated workplaces in git worktrees named `<project>-team-<role>`, a generated team Constitution, and a shared status dashboard where every agent posts its state for the owner and for each other. The skill is distilled from a live field team of six roles and from the 2026 research on multi-agent systems. KAIF fixes the methodology — what must exist; the project's agent builds the tools — how.

**2. Closing a chat is two different words now.** `/end-chat-soft` is ordered in advance: the agent finishes the current work to a clean cut, then walks the full closing ceremonies without haste. `/end-chat-force` is for right now: fix only what must not be lost, commit, push — and every skipped ceremony becomes an explicit debt line for the next chat. The old `/end-chat` is gone. One more rule came with the split: a named end time — "work until 11", "take an hour" — is the moment the soft close STARTS, not a deadline to fear; all four autonomy loops now work at a normal pace to the named hour instead of finishing early out of respect for the clock.

**3. The creed and the prayer.** Before work the agent now speaks two texts canonized in the canon: the creed — faith in the product and in the owner's design — and the prayer of the sixteen principles of the philosophy. Spoken at session start and at every context refresh, so the principles steer the work instead of fading with the context. One boundary keeps the prayer honest: Occam and Pareto act inside the machinery and never economize on what the owner sees and hears.

**4. Four field fixes from the 2.3 reports.** Merge and replace preserve the file's end-of-line convention instead of silently rewriting it; step 4 of `/report-bug` is phrased so an agent system's own classifier lets it through; version mentions that are legitimately old carry a justification marker for the stale-claims gate; the merge lines of `update` name the module signatures they touch.

**5. The contour calls with the right voice.** The interactive review contour now treats its named neural voice as part of its identity: deploying the contour includes downloading the concrete speech engine and pinning ONE voice chosen by the owner in a blind listening; the stock system voice is only a degraded fallback that announces itself in every call and leaves a recorded debt. And multiple-choice questions to the owner are always rendered as radio buttons.

**6. The court sat before this page went out.** A registry of 26 claims this version makes about itself was re-executed by an adversarial panel: 18 confirmed as written, 8 weakened to what the evidence actually supports, none refuted — and the three defects the panel itself surfaced were fixed the same hour.

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words — the [README](https://github.com/MikalaiKryvusha/KAIF#-quick-start) carries the full quick start, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the delta and migrates respectfully, keeping your content. If the run dies midway, say *"resume the KAIF update"*.

---

<a name="русский"></a>
## Русский · [English](#english)

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.4_GitHub_LOGO.webp" alt="KAIF 2.4 Teamed Up KAIF — медальон команды из восьми ролей в кольце уробороса" width="620">
</p>

**KAIF 2.4 — Teamed Up KAIF.** KAIF — это агентный харнесс (обвязка), и до сих пор он запрягал одного агента на проект. Центральная фича версии записана в самом имени: 2.4 учит KAIF разворачивать целую команду ИИ-агентов — несколько агентов в одной упряжи тянут один проект, каждый на своём рабочем месте, и все видны на одной доске статусов.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#русский). Эта страница — что нового именно в этой версии.

---

### ✨ Что нового в 2.4

**1. Команда агентов — развёртывается навыком.** Новый опциональный навык `/team-deployment` — тридцать седьмой в наборе — анализирует профиль работы проекта, предлагает обоснованный состав (роли, архетип, размер) и разворачивает его: изолированные рабочие места в git worktree с именами `<проект>-team-<роль>`, сгенерированная Конституция команды и общая доска статусов, где каждый агент пишет своё состояние — для владельца и друг для друга. Навык дистиллирован из живой полевой команды в шесть ролей и исследований мультиагентных систем 2026 года. KAIF фиксирует методологию — что обязано быть; агент проекта строит инструменты — как.

**2. Закрыть чат — теперь два разных слова.** `/end-chat-soft` заказывается заранее: агент доводит текущую работу до чистого среза, а затем не спеша проходит все церемонии закрытия. `/end-chat-force` — про «прямо сейчас»: зафиксировать только то, что нельзя потерять, закоммитить, запушить — а каждая пропущенная церемония становится явной строкой долга следующему чату. Старого `/end-chat` больше нет. Вместе с раздвоением пришло правило: названное время окончания — «работай до 11», «поработай час» — это момент СТАРТА мягкого закрытия, а не дедлайн, которого надо бояться; все четыре автономных цикла теперь работают в обычном темпе до самого срока, вместо того чтобы заканчивать заранее из уважения к часам.

**3. Символ веры и молитва.** Перед работой агент теперь произносит два текста, канонизированных в каноне: символ веры — вера в продукт и в замысел владельца — и молитву шестнадцати принципов философии. Они звучат на входе в сессию и на каждом освежении контекста, чтобы принципы направляли работу, а не таяли вместе с контекстом. Одна граница держит молитву честной: Оккам и Парето действуют внутри машинерии и никогда не экономят на том, что владелец видит и слышит.

**4. Четыре полевых фикса из отчётов 2.3.** Merge и replace сохраняют конвенцию концов строк файла, а не переписывают её молча; шаг 4 навыка `/report-bug` сформулирован так, что собственный классификатор агентской системы его пропускает; законно старые упоминания версий несут маркер оправдания для гейта протухших заявлений; строки merge в выводе `update` называют сигнатуры модулей, которые трогают.

**5. Контур зовёт правильным голосом.** Интерактивный контур вычитки теперь считает именованный нейроголос частью своей идентичности: развёртывание контура включает скачивание конкретного речевого движка и закрепление ОДНОГО голоса, выбранного владельцем слепым прослушиванием; стоковый системный голос — только деградированный фолбэк, который объявляет себя в каждом зове и оставляет записанный долг. А развилки с вариантами ответов владельцу всегда рендерятся радиокнопками.

**6. Суд заседал до выхода этой страницы.** Реестр из 26 заявлений, которые версия делает о себе, переисполнен состязательной панелью: 18 подтверждены как написаны, 8 ослаблены до того, что реально подтверждают улики, ни одно не опровергнуто — а три дефекта, которые нашла сама панель, починены тем же часом.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами — полный быстрый старт, режимы развёртывания и языковые опции несёт [README](https://github.com/MikalaiKryvusha/KAIF#-быстрый-старт).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет дельту и мигрирует уважительно, сохранив ваше. Если прогон умер на середине — скажите *«продолжи обновление KAIF»*.
