# `homeworks/` — tarefas do agente para o humano

Tarefas que o agente pede ao **humano** — coisas que não pode fazer sozinho por sua natureza digital e
incorpórea: testar em hardware real, agir no mundo físico, usar uma conta/credencial que só o humano tem,
fazer uma compra, observar algo offline. Cada documento descreve a tarefa com passos concretos para o
humano, e recolhe de volta suas observações e resultados. Um `NN_<nome>.md` cada.

**Para o humano (proprietário):** quando o agente registra um homework, ele precisa de uma mão no mundo
físico/offline. Siga os passos e escreva o que observou de volta no documento — o agente lê suas notas e
continua.

**Para o agente de IA:** quando estiver bloqueado em algo que só um humano-com-corpo pode fazer, não trave
— escreva aqui um homework com passos claros, mínimos e numerados e um lugar para os resultados do humano,
depois continue com outro trabalho. Logo após o H1 vem o cabeçalho meta lintável — **Criado:** ·
**Pai:** · **Estado:** · **Para fora:** (`AGENT_GUIDE.md` → Document header meta). Quando o humano
reportar, incorpore os resultados e marque o arquivo
com `DONE` (`git mv NN_x.md NN_DONE_x.md`).

**Homework da classe «gosto»** (o critério de aceitação é um adjetivo de percepção — `AGENT_GUIDE.md` →
"The taste class"): o agente entrega ao humano um ARTEFATO para perceber, nunca um link nem um benchmark
alheio; todos os candidatos sobre UM MESMO material, rótulos cegos, a chave ao lado. Dois campos fixos em
cada documento desse tipo: **«Pronto para ver/ouvir agora mesmo»** (caminhos para os artefatos) e
**«Veredictos já dados»** (as decisões do proprietário, registradas literalmente — um veredicto é cânone
e nunca é perguntado duas vezes).
