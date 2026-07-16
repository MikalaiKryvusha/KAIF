# KAIF em <PROJECT_NAME> — o framework, implantado

> **O que é este documento.** Uma descrição de alto nível do **framework KAIF tal como implantado e usado
> neste projeto** — pense nele como a página de "tecnologias e frameworks" do projeto, na qual o KAIF é
> agora uma das tecnologias. É escrito pelo agente **após uma injeção bem-sucedida do KAIF** (o núcleo
> autoextraível é removido assim que este documento existe — veja o ciclo de vida do KAIF). A partir daí, o
> trabalho neste projeto é organizado *através do* KAIF, e este arquivo é o seu resumo para humanos.
>
> Escrito no idioma de trabalho do proprietário. **Referência viva — nunca marcada com `DONE`.** Mantenha
> a linha de versão atualizada.

---

## O que é o KAIF

KAIF (Krinik AI Framework) é um **framework operacional resistente à perda de contexto e com autonomia
disciplinada para o tandem humano–IA**. Ele externaliza a memória de trabalho e a disciplina do agente
neste repositório — um pequeno conjunto de documentos markdown, convenções de diretórios e habilidades
slash repetíveis — de modo que qualquer sessão nova do agente retoma com contexto completo, trabalha de
forma autônoma dentro de limites claros e acumula conhecimento em vez de perdê-lo. Não é código; é
*processo capturado como arquivos que um agente lê*.

## Por que está aqui — o que dá a este projeto

- **Sem partidas a frio.** Uma sessão nova lê `AGENT_GUIDE.md` + `STATUS.md` e é produtiva imediatamente.
- **Conhecimento que sobrevive.** Bugs, decisões, pesquisas e ideias tornam-se documentos duráveis, não chat perdido.
- **Autonomia delimitada.** O agente mói o backlog sozinho e escala apenas as decisões do proprietário.
- **Um método compartilhado.** Humano = visionário (`GOAL.md`), agente = executor; o KAIF é a interface entre eles.

## Como funciona aqui — as peças móveis

| Peça | Papel neste projeto |
|------|---------------------|
| `AGENT_GUIDE.md` | O cânone que o agente lê antes de cada tarefa. |
| `PHILOSOPHY.md` | Como o agente pensa (KISS + Occam + o conjunto ampliado de princípios). |
| `BUG_FIXING_FRAMEWORK.md` | Como o agente depura. |
| `GOAL.md` / `MASTER_PLAN.md` | A visão, e o caminho em fases até ela. |
| `STATUS.md` | O estado vivo — atualizado após cada tarefa significativa. |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` / `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | Os mapas externo e interno. |
| `plans/ ideas/ bugs/ researches/ interviews/ homeworks/` | Os diretórios de conhecimento (cada um com seu README). |
| `.claude/skills/` (ou o equivalente do seu sistema de agente) | Os rituais repetíveis (`/resume`, `/pause`, ciclos, …). |
| `.kaif/kaif.json` | O marcador de implantação: versão, esfera, agente, tracking. |

## Registro da implantação

| Campo | Valor |
|-------|-------|
| **Versão do KAIF** | `<X.Y>` |
| **Injetado em** | `<AAAA-MM-DD>` |
| **Como foi a injeção** | `<uma ou duas linhas: desempacotamento mecânico rápido, ou fluxo respeitoso por etapas; qualquer coisa notável>` |
| **Esfera** | `<programming / science / design / business / …>` |
| **Sistemas de agente** | `<claude-code / codex / grok-build / cline / zoo-code / …>` |
| **Idioma de trabalho** | `<o idioma do proprietário>` |
| **Tracking** | `<origin / fork>` — `<URL do repositório origin>` |

## Vivendo com o KAIF (ciclo de vida)

`/kaif-version` (verificar atualizações) · `/kaif-update` (migração respeitosa a partir do origin) ·
`/kaif-fork` (evoluir o seu próprio) · `/kaif-switch-origin` · `/kaif-remove` (o parcial mantém seus
artefatos, ou completo — sempre respeitoso). Apoiado pelos handles npm `kaif:*`.

<!-- KAIF:AUTHOR-NOTE:BEGIN — this whole region is stripped mechanically on anonymous installs -->
---

## Uma nota do autor

> O KAIF foi concebido e construído por necessidade por **Krinik (Mikalai Kryvusha / Николай Кривуша)**
> durante sessões de vibe-coding com Claude em um produto de software, no fim de um quente junho de 2026,
> em Minsk. **O aniversário do KAIF é 30 de junho de 2026.**

*(Texto original, em russo — canônico:)*

> KAIF был придуман и разработан как вынужденная необходимость (Николай Кривуша) Криником при совместной
> работе в режиме вайбкодинга с Claude над программным продуктом в конце жаркого июня 2026 года, в
> г. Минск. Дата рождения KAIF — 30 июня 2026 г.
<!-- KAIF:AUTHOR-NOTE:END -->