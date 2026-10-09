# Framework de Anamnese de Tecnologia — v0.10

> **O que é este pacote:** a especificação-alvo para evoluir o projeto
> [`manorfm/maturity_assessment`](https://github.com/manorfm/maturity_assessment)
> de ponta a ponta: visão do relatório, constituição, mapa de capacidades,
> metodologia de evidência, modelo estatístico, motor adaptativo, desenho de
> perguntas, diagnóstico e tratamento, validação e o plano de trabalho para um
> agente de código aplicar tudo no repositório.
>
> **Por que v0.10:** acrescenta o **dossiê de infraestrutura** (24): rede em
> nuvem, comunicação entre serviços e service mesh, segurança de rede e Zero
> Trust, postura de segurança de nuvem e detecção e resposta. Esses temas
> existiam na v0.2 e tinham se perdido na condensação do mapa.
>
> **Por que v0.9:** acrescenta o **grafo de habilitação** (23): camadas de
> fundação, dependências entre capacidades (técnicas, cognitivas, sociais,
> estruturais e de governança), comportamentos-chave que destravam os próximos
> passos, modalidades de aprendizado e a **fronteira de aprendizado** que o motor
> usa para escolher a próxima fase.
>
> **Por que v0.8:** acrescenta a camada de **prontidão para práticas
> avançadas** (22): o motor passa a entender que chaos engineering, automação de
> qualidade madura e AI-DLC exigem pré-requisitos, calcula a probabilidade de a
> organização estar pronta, aponta o gargalo e detecta **adoção prematura**.
>
> **Por que v0.7:** acrescenta o primeiro **dossiê de estado da arte**
> (observabilidade, a partir de Google, Amazon, Honeycomb, Stripe, Meta, Netflix,
> OpenTelemetry e engenharia de resiliência) com o modelo para os demais (18); a
> **auditoria do banco de perguntas** vigente e o padrão novo de escrita e de
> aprofundamento (19); os **pontos de uso do Laya** (20); e a **agenda de
> robustez** com as 10 prioridades (21).
>
> **Por que v0.6:** acrescenta à v0.5 o segundo eixo de sofisticação técnica
> (12), a cobertura dos referenciais com 12 capacidades novas (13), o
> aprofundamento de "padrão × caixa" como método para qualquer cenário (14), a
> análise de suficiência estatística e de IA sem LLM, incluindo o Laya (15), o
> ciclo de evolução com walkthrough e reavaliação (16) e a autoavaliação honesta
> do framework com premissas datadas (17).
>
> **Por que a v0.5 não foi v0.4.1:** a mudança é estrutural. A v0.4 revisou o mapa e
> as regras; a v0.5 revisa **como a evidência vira medida** (modelo de medição,
> agregação, divergência, causalidade) e **como a medida vira relatório e
> tratamento**. Vários componentes do motor atual são substituídos.

## 1. Ordem de leitura

| # | Documento | Pergunta que responde | Público |
|---|---|---|---|
| 01 | [Visão e relatório](01-visao-e-relatorio.md) | **Qual é o produto final?** O laudo, a ficha de cada nó, o plano de tratamento | Todos. **Começar aqui** |
| 02 | [Constituição](02-constituicao.md) | O que nunca muda (princípios) e o que pode mudar (regras) | Todos |
| 03 | [Mapa de capacidades](03-mapa-de-capacidades.md) | O que é observado; o que já pontua; o que falta e por quê | Autoria, especialistas |
| 04 | [Metodologia de evidência](04-metodologia-de-evidencia.md) | Como um evento vira evidência de uma capacidade (Evidence-Centered Design) | Autoria, estatística |
| 05 | [Modelo estatístico](05-modelo-estatistico.md) | Como a evidência vira estágio, índice, faixa, divergência e causa | Estatística, engenharia |
| 06 | [Motor adaptativo](06-motor-adaptativo.md) | Qual pergunta fazer a seguir, a quem e quando parar | Engenharia, autoria |
| 07 | [Desenho de perguntas](07-desenho-de-perguntas.md) | Tipos de item, lentes por perfil, controle de viés | Autoria |
| 08 | [Diagnóstico e tratamento](08-diagnostico-e-tratamento.md) | Da causa provável à conduta, ao prognóstico e ao acompanhamento | Consultoria, liderança |
| 09 | [Validação e calibração](09-validacao-e-calibracao.md) | Como saber se o instrumento mede o que diz medir | Estatística, pesquisa |
| 10 | [Plano de migração para o agente](10-plano-de-migracao.md) | O que mudar no repositório, em que ordem, com que critério de aceite | Agente de código |
| 11 | [Referências](11-referencias.md) | Bibliografia consolidada | Todos |
| 12 | [Sofisticação das práticas](12-sofisticacao-das-praticas.md) | Em que fase técnica está cada prática (F0–F5) e como isso se combina com a apropriação | Especialistas, consultoria |
| 13 | [Cobertura de referenciais](13-cobertura-de-referenciais.md) | DDD, Team Topologies, Well-Architected, SRE, XP, ágil, COBIT, TOGAF, ITIL, ISOs, FinOps, IA… o que está coberto e o que falta | Todos |
| 14 | [Padronização × variedade](14-padronizacao-e-variedade.md) | Quando "padrão" vira caixa; duplicidade e custo; método para aprofundar qualquer cenário | Autoria, consultoria |
| 15 | [Inteligência no motor](15-inteligencia-no-motor.md) | A estatística basta? Onde algoritmos de IA sem LLM ajudam; onde o Laya cabe | Estatística, engenharia |
| 16 | [Ciclo de evolução](16-ciclo-de-evolucao.md) | Fotografia, walkthrough por área, próxima fase, pulsos, reavaliação, revisão de premissas | Liderança, consultoria |
| 18 | [Dossiê: observabilidade](18-dossie-observabilidade.md) | O estado da arte de um tema, da filosofia à conduta; modelo para os demais dossiês | Especialistas, autoria |
| 19 | [Banco de perguntas](19-banco-de-perguntas.md) | Auditoria do grafo vigente; o que reescrever; padrão novo de item e de aprofundamento | Autoria, engenharia |
| 20 | [Laya: pontos de uso](20-laya-pontos-de-uso.md) | Onde o classificador entra, onde não entra, em que ordem | Engenharia |
| 21 | [Agenda de robustez](21-agenda-de-robustez.md) | Temas e profundidade que faltam; evidência; uso real; manipulação; 10 prioridades | Todos |
| 22 | [Prontidão para práticas avançadas](22-prontidao-para-praticas-avancadas.md) | O que precisa existir antes de chaos engineering, automação de QA e AI-DLC; como o motor calcula prontidão e detecta adoção prematura | Todos |
| 23 | [Grafo de habilitação](23-grafo-de-habilitacao.md) | O que a organização precisa aprender primeiro; o que depende do quê; como aprender; como o motor escolhe o próximo passo | Todos |
| 24 | [Dossiê: rede, comunicação entre serviços e segurança](24-dossie-infraestrutura-rede-e-seguranca.md) | Rede em nuvem, service mesh, Zero Trust, postura e detecção: estado da arte, escadas, trilhas, prontidão, sinais, perguntas e condutas | Plataforma, segurança, arquitetura |
| 17 | [Maturidade do framework](17-maturidade-do-framework.md) | O framework aplicado a si mesmo; limites; exames complementares; premissas datadas | Todos. **Ler logo depois de 01** |
| A | [Anexo A — Mapa completo](anexo-A-mapa-completo.md) | Árvore completa, escadas de apropriação, catálogo de sinais | Autoria |
| B | `anexo-B-prototipos/` (`model.py`, `causal.py`) | Protótipos que reproduzem os números de 05; base dos testes do WP4 e WP5 | Estatística, engenharia |

## 2. As dez mudanças mais importantes

| # | Mudança | Documento | Substitui no repositório |
|---|---|---|---|
| 1 | O relatório passa a ser um **laudo**: queixa → achados → diagnóstico diferencial → prognóstico → conduta → acompanhamento. Cada nó do mapa tem uma **ficha** isolável | 01 | `interview-report-v1`, `finding-narrative-v1` (evoluem) |
| 2 | **Evidence-Centered Design** vira a espinha metodológica: modelo de capacidade, modelo de evidência e modelo de tarefa explícitos | 04 | Organização implícita entre `Signal`, `CapabilityReference` e grafo |
| 3 | Cada opção de resposta passa a declarar **âncora de estágio (0–4), discriminação e testlet** por capacidade (matriz Q), no lugar de um `weight` de −2 a +2 | 04, 05 | `Signal.weight` |
| 4 | O estágio de cada capacidade vira uma **distribuição posterior exata sobre 0–4**, calculada por enumeração. Não há média de ordinais nem confiança composta por pesos arbitrários | 05 | `CapabilityAssessment` |
| 5 | Cada respondente é tratado como **observador com viés de perspectiva** (modelo de avaliadores). A severidade de cada perspectiva é estimada e **vinhetas de ancoragem** a separam da diferença real de visibilidade | 05, 07 | Triangulação por média direcional |
| 6 | **Agregação hierárquica** (time → área → empresa) com *partial pooling* estimado, e índice com faixa obtida por simulação a partir das posteriores | 05 | Prior organizacional de força fixa; mínimo puro |
| 7 | Camada causal como **rede bayesiana noisy-OR com vazamento**: causas coexistem e competem pela explicação (*explaining away*). Priors vêm de elicitação estruturada | 05, 08 | Famílias binárias independentes com força de evidência *ad hoc* |
| 8 | **Amostragem matricial** entre respondentes da mesma unidade: cada pessoa responde a um subconjunto; o time cobre tudo | 06 | Todos percorrem trilhas equivalentes |
| 9 | Tratamento com **grau de evidência da intervenção**, domínio **Cynefin**, **restrição principal** (Teoria das Restrições), **arquétipo sistêmico** e ciclo **PDSA** | 08 | `intervention-foundations`, `solution-guidance` (evoluem) |
| 10 | Validação por **argumento de validade** (Kane): cada uso do relatório tem inferências explícitas e a evidência que as sustenta; teoria da generalizabilidade para dimensionar respondentes por unidade | 09 | Gate de piloto atual (mantido e ampliado) |

## 3. O que permanece (pontos fortes do repositório)

A v0.5 não joga fora o que já é raro no mercado:

- princípios de comportamento acima da presença, sistema antes de pessoa, anonimato;
- entrevista centrada em evento (`ObservedEvent`) e três estados observacionais
  (prática, não observo, não se aplica);
- grafo de perguntas como conteúdo versionado, com auditoria de instrumento;
- explicabilidade: evidência a favor e contra, lacuna, contenção, autoridade;
- separação entre recorrência (onde aparece) e contenção (onde se resolve);
- gate de piloto com rótulos cegos, Brier e ECE, e proibição de recalibrar sozinho;
- projeções por público (diretoria, gestão, técnica, especialista).

## 4. Relação com as versões anteriores

| Versão | Foco | Situação |
|---|---|---|
| v0.2 | Árvore de capacidades em 8 domínios | Substituída |
| v0.3 | Meta-modelo, eixo prática → filosofia, sinais, crosswalk | Incorporada ao Anexo A |
| v0.4 | Constituição, 12 domínios, escadas organizacionais, clima | Incorporada em 02, 03 e Anexo A |
| v0.5 | Medição, motor, relatório-alvo, tratamento, validação, plano do agente | Incorporada |
| v0.6 | Sofisticação, cobertura de referenciais, padrão × caixa, IA sem LLM, ciclo de evolução, autoavaliação | Incorporada |
| v0.7 | Dossiê de estado da arte, auditoria e padrão do banco de perguntas, Laya, agenda de robustez | Incorporada |
| v0.8 | Prontidão para práticas avançadas (chaos, QA, AI-DLC) e adoção prematura | Incorporada |
| v0.9 | Grafo de habilitação, camadas de fundação, comportamentos-chave, fronteira de aprendizado | Incorporada |
| **v0.10** | Dossiê de rede, comunicação entre serviços, Zero Trust e segurança de nuvem | **Vigente para discussão** |

## 5. Convenções

- `[folha-id]` refere-se às 29 folhas vigentes de `CapabilityTaxonomy`.
- `R#` refere-se às regras da constituição; `P#` aos princípios.
- "Unidade" é qualquer nó da hierarquia organizacional configurada (time, área,
  tribo, empresa).
- "Estágio" é o ordinal 0–4 da rubrica; "índice" é a leitura percentual
  derivada da posterior do estágio (§05).
- Toda afirmação empírica tem referência em [11](11-referencias.md).
