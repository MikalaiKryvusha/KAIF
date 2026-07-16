# `plans/` — planos detalhados passo a passo

Planos detalhados de peças de trabalho específicas: passos individuais do plano mestre, features, ideias,
bugs, pesquisas, procedimentos. O **`MASTER_PLAN.md`** (raiz do projeto) é o roteiro de alto nível;
`plans/` contém os planos ampliados que implementam seus passos. Um `NN_<nome>.md` por plano.

**Para o humano (proprietário):** você não precisa escrever aqui — os planos são normalmente do agente.
Pode deixar um plano se quiser direcionar *como* algo é feito. Leia-os para ver a abordagem pretendida do
agente antes da execução.

**Para o agente de IA:** antes de um trabalho não trivial, escreva aqui um plano curto e siga-o. Numere os
arquivos (`NN_<nome>.md`). Um plano terminado e verificado recebe a tag `DONE` no nome
(`git mv NN_x.md NN_DONE_x.md`) mais uma seção de status. Material de referência (não uma tarefa fechável)
não recebe a tag DONE.
