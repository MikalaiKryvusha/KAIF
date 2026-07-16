# KAIF en <PROJECT_NAME> — el framework, desplegado

> **Qué es este documento.** Una descripción de alto nivel del **framework KAIF tal como está desplegado y
> en uso en este proyecto** — piense en él como la página de "tecnologías y frameworks" del proyecto, en la
> que KAIF es ahora una de las tecnologías. Lo escribe el agente **después de una inyección exitosa de
> KAIF** (el núcleo autoextraíble se elimina en cuanto esto existe — vea el ciclo de vida de KAIF). Desde
> entonces el trabajo en este proyecto se organiza *a través de* KAIF, y este archivo es su resumen para
> humanos.
>
> Escrito en el idioma de trabajo del propietario. **Referencia viva — nunca se marca con `DONE`.**
> Mantenga actualizada la línea de versión.

---

## Qué es KAIF

KAIF (Krinik AI Framework) es un **framework operativo resistente a la pérdida de contexto y con autonomía
disciplinada para el tándem humano–IA**. Externaliza la memoria de trabajo y la disciplina del agente en
este repositorio — un pequeño conjunto de documentos markdown, convenciones de directorios y habilidades
slash repetibles — de modo que cualquier sesión nueva del agente se reanuda con contexto completo, trabaja
de forma autónoma dentro de límites claros y acumula conocimiento en lugar de perderlo. No es código; es
*proceso capturado como archivos que un agente lee*.

## Por qué está aquí — lo que aporta a este proyecto

- **Sin arranques en frío.** Una sesión nueva lee `AGENT_GUIDE.md` + `STATUS.md` y es productiva de inmediato.
- **Conocimiento que sobrevive.** Bugs, decisiones, investigación e ideas se vuelven documentos duraderos, no chat perdido.
- **Autonomía acotada.** El agente muele el backlog solo y escala únicamente las decisiones del propietario.
- **Un método compartido.** Humano = visionario (`GOAL.md`), agente = ejecutor; KAIF es la interfaz entre ambos.

## Cómo funciona aquí — las piezas móviles

| Pieza | Rol en este proyecto |
|-------|----------------------|
| `AGENT_GUIDE.md` | El canon que el agente lee antes de cada tarea. |
| `PHILOSOPHY.md` | Cómo piensa el agente (KISS + Occam + el conjunto ampliado de principios). |
| `BUG_FIXING_FRAMEWORK.md` | Cómo depura el agente. |
| `GOAL.md` / `MASTER_PLAN.md` | La visión, y el camino por fases hacia ella. |
| `STATUS.md` | El estado vivo — actualizado tras cada tarea significativa. |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` / `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | Los mapas externo e interno. |
| `plans/ ideas/ bugs/ researches/ interviews/ homeworks/` | Los directorios de conocimiento (cada uno con su README). |
| `.claude/skills/` (o el equivalente de su sistema de agente) | Los rituales repetibles (`/resume`, `/pause`, ciclos, …). |
| `.kaif/kaif.json` | El marcador de despliegue: versión, esfera, agente, tracking. |

## Registro del despliegue

| Campo | Valor |
|-------|-------|
| **Versión de KAIF** | `<X.Y>` |
| **Inyectado el** | `<AAAA-MM-DD>` |
| **Cómo fue la inyección** | `<una o dos líneas: desempaquetado mecánico rápido, o flujo respetuoso por etapas; cualquier cosa notable>` |
| **Esfera** | `<programming / science / design / business / …>` |
| **Sistemas de agente** | `<claude-code / codex / grok-build / cline / zoo-code / …>` |
| **Idioma de trabajo** | `<el idioma del propietario>` |
| **Tracking** | `<origin / fork>` — `<URL del repo origin>` |

## Vivir con KAIF (ciclo de vida)

`/kaif-version` (buscar actualizaciones) · `/kaif-update` (migración respetuosa desde origin) ·
`/kaif-fork` (evolucionar el suyo propio) · `/kaif-switch-origin` · `/kaif-remove` (el parcial conserva
sus artefactos, o completo — siempre respetuoso). Respaldado por los handles npm `kaif:*`.

<!-- KAIF:AUTHOR-NOTE:BEGIN — this whole region is stripped mechanically on anonymous installs -->
---

## Una nota del autor

> KAIF fue concebido y construido por necesidad por **Krinik (Mikalai Kryvusha / Николай Кривуша)** durante
> sesiones de vibe-coding con Claude sobre un producto de software, a finales de un caluroso junio de 2026,
> en Minsk. **El cumpleaños de KAIF es el 30 de junio de 2026.**

*(Texto original, en ruso — canónico:)*

> KAIF был придуман и разработан как вынужденная необходимость (Николай Кривуша) Криником при совместной
> работе в режиме вайбкодинга с Claude над программным продуктом в конце жаркого июня 2026 года, в
> г. Минск. Дата рождения KAIF — 30 июня 2026 г.
<!-- KAIF:AUTHOR-NOTE:END -->