# `bugs/` — defectos, dificultades, roturas

Un documento por defecto: síntoma, reproducción determinista, forense, causa raíz / hipótesis, historial
de corrección, estado. El backlog duradero de bugs del propio agente — nada se pierde, y cualquier bug
puede ser retomado en frío por una sesión futura. Un `NN_<nombre>.md` por bug.

**Para el humano (propietario):** puede registrar un bug aquí con palabras llanas (qué está mal, cómo
reproducirlo); el agente lo estructurará. Explore este directorio para ver los defectos conocidos y su
estado.

**Para el agente de IA:** cuando choque con un defecto durante el trabajo/las pruebas, regístrelo aquí
según el canon (habilidad: `/report-bug`; método: `BUG_FIXING_FRAMEWORK.md`) — incluso los pequeños.
El documento del bug lleva un criterio de aceptación observable de la corrección — qué se VERÁ
funcionando tras el fix (`REQUIREMENTS_FRAMEWORK.md`). Mientras esté abierto, sin etiqueta `DONE`. Cuando esté corregido **y verificado**,
`git mv NN_x.md NN_DONE_x.md` y añada una sección `## ✅ STATUS: DONE (fecha)`. Tras 3 intentos ciegos
fallidos de corrección, pare y pase a investigación (`/bug-research`).

**El subdirectorio `bugs/KAIF/`** — defectos y solicitudes de mejora sobre el **propio
framework KAIF**, no sobre este proyecto. Cuando un fallo se remonta a un hueco de KAIF (una
regla que confundió, un guardarraíl ausente, maquinaria rota), archívalo allí por el mismo canon
de bugs — **estrictamente en inglés** (estos documentos se dirigen al desarrollador de KAIF).
Deduplica antes de crear: busca primero en `bugs/KAIF/`; los despliegues ligados al origin
buscan también en el issue tracker del origin y envían las señales confirmadas río arriba; los
desligados lo mantienen todo local.
