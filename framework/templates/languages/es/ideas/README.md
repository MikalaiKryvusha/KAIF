# `ideas/` — propuestas de features y mejoras

Ideas detalladas de *qué* construir — normalmente un corte estrecho del proyecto, descrito lo bastante bien
para que el agente pueda implementarlo. Las escribe casi siempre el **humano**, pero el agente también
propone ideas. Un `NN_<nombre>.md` por idea.

**Para el humano (propietario):** este es su directorio principal de autoría. Deje aquí una idea
describiendo lo que quiere; el agente la ordenará en una forma limpia y estructurada y la implementará.
Una idea es una pieza de la **visión** del producto — el agente la implementa solo después de su aprobación.

**Para el agente de IA:** lea las ideas del propietario, corrija erratas, reestructure mínimamente para la
claridad, y luego implemente. Cuando *usted* tenga una idea que valga la pena, regístrela aquí con el
estado "❓ a la espera de la aprobación del propietario" (habilidad: `/propose-idea`) y **no** la implemente
hasta que se apruebe. Tras implementar una idea, escriba el estado y la fecha en su archivo y etiquétela
con `DONE` (`git mv NN_x.md NN_DONE_x.md`).
