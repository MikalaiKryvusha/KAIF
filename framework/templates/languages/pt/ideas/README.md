# `ideas/` — propostas de features e melhorias

Ideias detalhadas do *que* construir — normalmente uma fatia estreita do projeto, descrita bem o suficiente
para o agente implementar. Na maioria das vezes escritas pelo **humano**, mas o agente também propõe
ideias. Um `NN_<nome>.md` por ideia.

**Para o humano (proprietário):** este é o seu principal diretório de autoria. Deixe aqui uma ideia
descrevendo o que quer; o agente vai organizá-la em uma forma limpa e estruturada e implementá-la. Uma
ideia é uma peça da **visão** do produto — o agente só a implementa após a sua aprovação.

**Para o agente de IA:** leia as ideias do proprietário, corrija erros de digitação, reestruture
minimamente para clareza e depois implemente. Quando *você* tiver uma ideia que valha a pena, registre-a
aqui com o status "❓ aguardando aprovação do proprietário" (habilidade: `/propose-idea`) e **não**
implemente até que seja aprovada. Após implementar uma ideia, escreva o status e a data no arquivo e
marque-o com `DONE` (`git mv NN_x.md NN_DONE_x.md`).
