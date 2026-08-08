# `plans/` — planos detalhados passo a passo

Planos detalhados de peças de trabalho específicas: passos individuais do plano mestre, features, ideias,
bugs, pesquisas, procedimentos. O **`MASTER_PLAN.md`** (raiz do projeto) é o roteiro de alto nível;
`plans/` contém os planos ampliados que implementam seus passos. Um `NN_<nome>.md` por plano.

**Para o humano (proprietário):** você não precisa escrever aqui — os planos são normalmente do agente.
Pode deixar um plano se quiser direcionar *como* algo é feito. Leia-os para ver a abordagem pretendida do
agente antes da execução.

**Para o agente de IA:** antes de um trabalho não trivial, escreva aqui um plano curto e siga-o. Todo plano
SE ABRE com seu vetor de objetivo + critérios de aceitação — escritos segundo o
`REQUIREMENTS_FRAMEWORK.md`; eles podem mudar conforme o trabalho ensina. Logo após o H1 vem o
cabeçalho meta lintável — **Criado:** · **Pai:** · **Estado:** (com marcos) · **Para fora:**
(`AGENT_GUIDE.md` → Document header meta). Numere os
arquivos (`NN_<nome>.md`). Um plano terminado e verificado recebe a tag `DONE` no nome
(`git mv NN_x.md NN_DONE_x.md`) mais uma seção de status. Material de referência (não uma tarefa fechável)
não recebe a tag DONE.

**Nomenclatura — um épico aparece no backlog pelo nome do arquivo.** Trabalho pesado, composto e
longo é planejado como um **épico** (`/plan-epic`), e seu arquivo carrega a marca:
**`NN_EPIC_<nome>.md`**. O arquivo do épico contém a arquitetura por fases do roteiro — *e nenhum
detalhe operacional*. O detalhe vive nos seus **filhos**: um plano operacional por fase (P&D,
testes, implementação, aceitação), e cada filho nomeia o pai no próprio nome de arquivo —
**`NN_epicMM_<fase>_<nome>.md`**, onde `MM` é o número do épico pai. Somente a fase mais próxima é
detalhada; o plano da fase N+1 é escrito no fechamento da fase N. O trabalho que nunca precisou de
um épico continua um plano **autônomo**: `NN_<nome>.md`. A convenção vale para frente — não renomeie
planos antigos: seus números já estão citados por toda a história.
