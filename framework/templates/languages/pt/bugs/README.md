# `bugs/` — defeitos, dificuldades, quebras

Um documento por defeito: sintoma, reprodução determinística, forense, causa raiz / hipóteses, histórico
de correção, status. O backlog durável de bugs do próprio agente — nada se perde, e qualquer bug pode ser
retomado a frio por uma sessão futura. Um `NN_<nome>.md` por bug.

**Para o humano (proprietário):** você pode registrar um bug aqui em palavras simples (o que está errado,
como reproduzir); o agente o estruturará. Navegue neste diretório para ver os defeitos conhecidos e seu
status.

**Para o agente de IA:** quando encontrar um defeito durante o trabalho/testes, registre-o aqui segundo o
cânone (habilidade: `/report-bug`; método: `BUG_FIXING_FRAMEWORK.md`) — mesmo os pequenos. O documento
do bug carrega um critério de aceitação observável da correção — o que se VERÁ funcionando após o
fix (`REQUIREMENTS_FRAMEWORK.md`). Enquanto aberto, sem tag `DONE`. Quando corrigido **e verificado**, `git mv NN_x.md NN_DONE_x.md` e acrescente uma seção
`## ✅ STATUS: DONE (data)`. Após 3 tentativas cegas falhadas de correção, pare e mude para pesquisa
(`/bug-research`).

**O subdiretório `bugs/KAIF/`** — defeitos e pedidos de melhoria sobre o **próprio
framework KAIF**, não sobre este projeto. Quando uma falha remonta a uma lacuna do KAIF (uma
regra que enganou, um guardrail ausente, maquinaria quebrada), registre o documento lá pelo
mesmo cânone de bugs — **estritamente em inglês** (esses documentos se dirigem ao desenvolvedor
do KAIF). Deduplique antes de registrar: procure primeiro em `bugs/KAIF/`; implantações
atreladas ao origin procuram também no issue tracker do origin e enviam sinais confirmados para
upstream; as desatreladas mantêm tudo local.
