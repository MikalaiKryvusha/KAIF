# `homeworks/` — tareas del agente para el humano

Tareas que el agente pide hacer al **humano** — cosas que no puede hacer él mismo por su naturaleza
digital e incorpórea: probar en hardware real, actuar en el mundo físico, usar una cuenta/credencial que
solo tiene el humano, hacer una compra, observar algo offline. Cada documento describe la tarea con pasos
concretos para el humano, y recoge de vuelta sus observaciones y resultados. Un `NN_<nombre>.md` cada una.

**Para el humano (propietario):** cuando el agente registra un homework, necesita una mano en el mundo
físico/offline. Siga los pasos y escriba lo que observó de vuelta en el documento — el agente lee sus
notas y continúa.

**Para el agente de IA:** cuando esté bloqueado por algo que solo puede hacer un humano-con-cuerpo, no se
atasque — escriba aquí un homework con pasos claros, mínimos y numerados y un lugar para los resultados del
humano, y luego continúe con otro trabajo. Justo después del H1 va la cabecera meta lintable —
**Creado:** · **Padre:** · **Estado:** · **Hacia fuera:** (`AGENT_GUIDE.md` → Document header
meta). Cuando el humano informe, incorpore los resultados y etiquete el
archivo con `DONE` (`git mv NN_x.md NN_DONE_x.md`).

**Homework de clase «gusto»** (el criterio de aceptación es un adjetivo de percepción — `AGENT_GUIDE.md` →
"The taste class"): el agente entrega al humano un ARTEFACTO para percibir, nunca un enlace ni un
benchmark ajeno; todos los candidatos sobre UN MISMO material, etiquetas ciegas, la clave al lado. Dos
campos fijos en cada documento de este tipo: **«Listo para ver/escuchar ahora mismo»** (rutas a los
artefactos) y **«Veredictos ya emitidos»** (las decisiones del propietario, registradas literalmente —
un veredicto es canon y nunca se pregunta dos veces).
