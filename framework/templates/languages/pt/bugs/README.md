# `bugs/` — defeitos, dificuldades, quebras

Um documento por defeito: sintoma, reprodução determinística, forense, causa raiz / hipóteses, histórico
de correção, status. O backlog durável de bugs do próprio agente — nada se perde, e qualquer bug pode ser
retomado a frio por uma sessão futura. Um `NN_<nome>.md` por bug.

**Para o humano (proprietário):** você pode registrar um bug aqui em palavras simples (o que está errado,
como reproduzir); o agente o estruturará. Navegue neste diretório para ver os defeitos conhecidos e seu
status.

**Para o agente de IA:** quando encontrar um defeito durante o trabalho/testes, registre-o aqui segundo o
cânone (habilidade: `/report-bug`; método: `BUG_FIXING_FRAMEWORK.md`) — mesmo os pequenos. Enquanto aberto,
sem tag `DONE`. Quando corrigido **e verificado**, `git mv NN_x.md NN_DONE_x.md` e acrescente uma seção
`## ✅ STATUS: DONE (data)`. Após 3 tentativas cegas falhadas de correção, pare e mude para pesquisa
(`/bug-research`).
