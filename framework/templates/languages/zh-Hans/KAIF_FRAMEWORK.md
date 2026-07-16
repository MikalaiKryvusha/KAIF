# <PROJECT_NAME> 中的 KAIF —— 已部署的框架

> **本文档是什么。** 对**部署并应用于本项目的 KAIF 框架**的高层描述 —— 可以把它当作项目的
> "技术与框架"页面，KAIF 现在是其中一项技术。它由代理在 **KAIF 注入成功之后**撰写（本文档一旦
> 存在，自解压核心就会被删除 —— 见 KAIF 生命周期）。此后，本项目的工作*通过* KAIF 组织，
> 而本文件是面向人类的摘要。
>
> 以所有者的工作语言撰写。**活的参考文档 —— 永远不打 `DONE` 标签。** 保持版本行为最新。

---

## KAIF 是什么

KAIF (Krinik AI Framework) 是一个**抗上下文丢失、自治受纪律约束的人机协作操作框架**。它把代理的
工作记忆和纪律外化到这个仓库中 —— 一小组 markdown 文档、目录约定和可重复的斜杠技能 —— 使任何新的
代理会话都能带着完整上下文继续工作，在清晰的边界内自主行动，并且积累而不是丢失知识。它不是代码；
它是*以代理可读文件的形式记录下来的过程*。

## 为什么在这里 —— 它给本项目带来什么

- **没有冷启动。** 新会话读取 `AGENT_GUIDE.md` + `STATUS.md`，立即进入高效状态。
- **知识得以存续。** Bug、决策、研究和想法成为持久文档，而不是丢失的聊天记录。
- **受限的自治。** 代理独自消化待办事项，只将所有者级别的决策上报。
- **共享的方法。** 人类 = 愿景提出者（`GOAL.md`），代理 = 执行者；KAIF 是两者之间的接口。

## 在这里如何运作 —— 各个组成部分

| 部件 | 在本项目中的角色 |
|------|------------------|
| `AGENT_GUIDE.md` | 代理在每个任务前阅读的准则。 |
| `PHILOSOPHY.md` | 代理如何思考（KISS + 奥卡姆剃刀 + 扩展原则集）。 |
| `BUG_FIXING_FRAMEWORK.md` | 代理如何调试。 |
| `GOAL.md` / `MASTER_PLAN.md` | 愿景，以及通向愿景的分阶段路径。 |
| `STATUS.md` | 活的状态 —— 每个重要任务后更新。 |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` / `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | 外部与内部地图。 |
| `plans/ ideas/ bugs/ researches/ interviews/ homeworks/` | 知识目录（各有自己的 README）。 |
| `.claude/skills/`（或您代理系统的等价物） | 可重复的例行程序（`/resume`、`/pause`、循环等）。 |
| `.kaif/kaif.json` | 部署标记：版本、领域、代理、跟踪。 |

## 部署记录

| 字段 | 值 |
|------|----|
| **KAIF 版本** | `<X.Y>` |
| **注入日期** | `<YYYY-MM-DD>` |
| **注入过程** | `<一两行：快速机械解包，或分阶段的尊重式流程；任何值得注意的事项>` |
| **领域** | `<programming / science / design / business / …>` |
| **代理系统** | `<claude-code / codex / grok-build / cline / zoo-code / …>` |
| **工作语言** | `<所有者的语言>` |
| **跟踪** | `<origin / fork>` — `<origin 仓库 URL>` |

## 与 KAIF 共处（生命周期）

`/kaif-version`（检查更新）· `/kaif-update`（从 origin 进行尊重式迁移）· `/kaif-fork`
（演化您自己的版本）· `/kaif-switch-origin` · `/kaif-remove`（部分移除保留您的产物，或完全移除 ——
始终保持尊重）。由 npm 句柄 `kaif:*` 支持。

<!-- KAIF:AUTHOR-NOTE:BEGIN — this whole region is stripped mechanically on anonymous installs -->
---

## 作者的话

> KAIF 由 **Krinik（Mikalai Kryvusha / Николай Кривуша）**出于必要而构思和构建，诞生于 2026 年
> 炎热六月末在明斯克与 Claude 就一个软件产品进行的 vibe-coding 协作中。**KAIF 的生日是 2026 年
> 6 月 30 日。**

*(原文，俄语 —— 规范版本:)*

> KAIF был придуман и разработан как вынужденная необходимость (Николай Кривуша) Криником при совместной
> работе в режиме вайбкодинга с Claude над программным продуктом в конце жаркого июня 2026 года, в
> г. Минск. Дата рождения KAIF — 30 июня 2026 г.
<!-- KAIF:AUTHOR-NOTE:END -->