# `plans/` — planes detallados paso a paso

Planes detallados de piezas de trabajo concretas: pasos individuales del plan maestro, features, ideas,
bugs, investigaciones, procedimientos. El **`MASTER_PLAN.md`** (raíz del proyecto) es la hoja de ruta de
alto nivel; `plans/` contiene los planes ampliados que implementan sus pasos. Un `NN_<nombre>.md` por plan.

**Para el humano (propietario):** no tiene que escribir aquí — los planes suelen ser del agente. Puede
dejar un plan si quiere dirigir *cómo* se hace algo. Léalos para ver el enfoque previsto del agente antes
de que lo ejecute.

**Para el agente de IA:** antes de un trabajo no trivial, escriba aquí un plan corto y sígalo. Numere los
archivos (`NN_<nombre>.md`). Un plan terminado y verificado recibe la etiqueta `DONE` en su nombre
(`git mv NN_x.md NN_DONE_x.md`) más una sección de estado. El material de referencia (no una tarea
cerrable) no se etiqueta con DONE.
