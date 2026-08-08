# `plans/` — planes detallados paso a paso

Planes detallados de piezas de trabajo concretas: pasos individuales del plan maestro, features, ideas,
bugs, investigaciones, procedimientos. El **`MASTER_PLAN.md`** (raíz del proyecto) es la hoja de ruta de
alto nivel; `plans/` contiene los planes ampliados que implementan sus pasos. Un `NN_<nombre>.md` por plan.

**Para el humano (propietario):** no tiene que escribir aquí — los planes suelen ser del agente. Puede
dejar un plan si quiere dirigir *cómo* se hace algo. Léalos para ver el enfoque previsto del agente antes
de que lo ejecute.

**Para el agente de IA:** antes de un trabajo no trivial, escriba aquí un plan corto y sígalo. Todo plan
SE ABRE con su vector de objetivo + criterios de aceptación — escritos según
`REQUIREMENTS_FRAMEWORK.md`; pueden cambiar a medida que el trabajo enseña. Justo después del H1
va la cabecera meta lintable — **Creado:** · **Padre:** · **Estado:** (con hitos) ·
**Hacia fuera:** (`AGENT_GUIDE.md` → Document header meta). Numere los
archivos (`NN_<nombre>.md`). Un plan terminado y verificado recibe la etiqueta `DONE` en su nombre
(`git mv NN_x.md NN_DONE_x.md`) más una sección de estado. El material de referencia (no una tarea
cerrable) no se etiqueta con DONE.

**Nomenclatura — un épico se ve en el backlog por su nombre de archivo.** El trabajo pesado,
compuesto y largo se planifica como un **épico** (`/plan-epic`), y su archivo lleva la marca:
**`NN_EPIC_<nombre>.md`**. El archivo del épico contiene la arquitectura por fases de la hoja de
ruta — *y ningún detalle operativo*. El detalle vive en sus **hijos**: un plan operativo por fase
(I+D, pruebas, implementación, aceptación), y cada hijo nombra a su padre en su propio nombre de
archivo — **`NN_epicMM_<fase>_<nombre>.md`**, donde `MM` es el número del épico padre. Solo se
detalla la fase más próxima; el plan de la fase N+1 se escribe al cerrar la fase N. El trabajo que
nunca necesitó un épico se queda como plan **autónomo**: `NN_<nombre>.md`. La convención rige hacia
adelante — no renombre los planes antiguos: sus números ya están citados a lo largo de la historia.
