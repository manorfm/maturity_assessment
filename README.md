# Diagnóstico de engenharia

Aplicação web para diagnosticar o sistema sociotécnico de entrega de organizações
que criam e operam produtos digitais. A entrevista observa como o trabalho
realmente acontece: decisões, comportamentos, restrições, consequências e
aprendizado. Ferramentas, cargos, cerimônias e frameworks fornecem contexto, mas
não geram evidência de capacidade por existirem nominalmente.

O produto não é um checklist de maturidade. Ele combina um diagnóstico explicável
— comportamento, hipóteses de causa, confiança e menor experimento — com um
referencial comparativo de alta performance por capacidade. O estágio 0–4 localiza
a distância comportamental depois do diagnóstico; ferramenta, framework ou cargo
não pontuam por presença. O repositório ainda se chama `maturity_assessment`; isso
não define o propósito.

O MVP está concluído e pronto para piloto controlado. O first screen do relatório já é o diagnóstico
([plano](docs/backlog/engineering-diagnostic-plan.md)). O experimento real pede **18 pessoas em
duas unidades**, com trilhas complementares; oito pessoas numa unidade só checam linguagem.
O instrumento ainda precisa de jornadas reais, revisão com especialistas e calibração, sem transformar o
resultado em ranking de pessoas ou times.

## Como ler o relatório agora

**Home vigente.** Resultado das entrevistas: problemas por área, cada
um com caminho possível, sustentação provisória, o que significa,
fundamento e impacto esperado. Quem autoriza decide depois de ler.
Abrir uma área é capítulo: uma linha do recorte e a mesma evidência
com o nome local. Ainda faltam o dossiê restante (G3) e o sintético
de anamnese (G4) em
[`docs/backlog/report-presentation-plan.md`](docs/backlog/report-presentation-plan.md).

**Disciplina vigente.** Nome local da dor, efeito no nível acima, onde
mais isso chega com outro nome. Ainda abre com três blocos de escopo.

A especificação do motor (não da anamnese) está em
[`docs/knowledge-base/recommendation-model.md`](docs/knowledge-base/recommendation-model.md)
e [`docs/knowledge-base/assessment-model.md`](docs/knowledge-base/assessment-model.md).

O showcase sintético da POC apresenta três relatórios organizacionais — comportamento
frágil, prática intermediária e prática sustentada — com 18 pessoas em duas
unidades, e semeia o contraste de fronteira de times para validar o mapa.
Os seis contrastes da onda 6 permanecem o protocolo de validação humana;
somente entrevistas reais contam para o gate de cinco por perspectiva.
A página `/showcase` é o deck desses três casos; o E2E percorre criar
projeto, gerar convite e concluir uma entrevista no mesmo produto.
A execução demonstra coerência sintética, não acurácia empírica.
O painel administrativo registra qual contraste foi validado e mostra cobertura e
problemas abertos sem associar a entrevista a convite, participação ou pessoa.

## Objetivo

O produto procura responder cinco perguntas:

1. Quais capacidades do sistema de trabalho são sustentáveis e quais são frágeis?
2. O que limita a evolução: conhecimento, processo, ferramenta, acesso, arquitetura,
   governança, cultura ou desenho organizacional?
3. Em qual parte da estrutura o problema aparece e até onde seu efeito se propaga?
4. Qual é o menor experimento verificável capaz de melhorar a situação?
5. Qual distância comportamental existe para uma capacidade de alta performance?

O resultado esperado não é apenas uma nota. É um diagnóstico explicável e uma
comparação condicionada à evidência que conectam:

```text
contexto → comportamento → evidência → sintoma → causa provável
         → impacto → comportamento-alvo → intervenção → medida de sucesso
```

## Como funciona

### 1. Configuração do projeto

O responsável cria um projeto e monta uma hierarquia organizacional livre. Os nomes
e a profundidade não são fixos: organização, área, tribo, cluster, squad ou qualquer
outra estrutura podem ser representados. Convites são emitidos para as unidades
folha; os resultados são consolidados progressivamente nos níveis ancestrais.

### 2. Convites anônimos e participação única

Cada pessoa recebe um link criptograficamente aleatório, válido para uma única
participação. Convite e respostas são separados, o painel nunca apresenta respostas
individuais e um link concluído não recupera o conteúdo respondido. Relatórios só
são publicados quando o grupo mínimo e as regras contra inferência por subtração
são atendidos.

### 3. Identificação da perspectiva

O mesmo link serve para qualquer integrante da unidade. Ao iniciar, a pessoa escolhe
a perspectiva mais próxima do seu trabalho — por exemplo, gestão, produto, qualidade,
engenharia, plataforma/operações, arquitetura, segurança, dados ou design. O perfil
adapta linguagem e observabilidade; ele não produz nota e não cria uma avaliação
individual.

Em seguida, a pessoa escolhe a descrição mais próxima das responsabilidades que
exerce, da autoridade disponível, do alcance e dos eventos que observa. Esse
contexto neutro seleciona aprofundamentos sem pontuar: uma pessoa de engenharia que
também opera recebe situações de recuperação mesmo sem existir um cargo de SRE.

### 4. Anamnese comportamental adaptativa

A entrevista reconstrói situações do dia a dia, como uma entrega bloqueada, um
incidente, uma decisão arquitetural ou uma ação de melhoria. Em vez de perguntar
“você usa CI/CD?” ou “aplica SRE?”, ela investiga o que aconteceu, quem percebeu,
quanto esperou, como decidiu, que consequência ocorreu e o que mudou depois.

O percurso é um grafo versionado com 88 nós. O contexto seleciona uma trilha curta
de dois a quatro eventos observáveis; cada evento aprofunda fatos e consequências,
e a perspectiva adapta a linguagem ao que a pessoa consegue observar. Depois do
percurso declarativo, o motor pode selecionar até cinco perguntas adicionais para
reduzir a incerteza causal, respeitando aplicabilidade, custo e orçamento da jornada.

### 5. Geração de evidências

As respostas geram sinais tipados, nunca uma nota direta. Cada sinal registra:

- capacidades afetadas;
- camada observada — conhecimento, prática, consistência, sistema habilitador ou
  resultado/aprendizado;
- natureza da restrição;
- padrões que sustenta ou contradiz;
- grupo causal, para evitar dupla contagem de evidências relacionadas.

Um comportamento pode afetar mais de uma capacidade. Integração tardia, por exemplo,
pode produzir evidências em fluxo, engenharia, arquitetura e organização sem
duplicar uma pontuação genérica.

### 6. Estimativa de consistência e diagnóstico causal

O produto usa modelos diferentes para perguntas diferentes. Estágio do
comportamento, cobertura, confiança dessa leitura, probabilidade de uma causa e
prioridade de uma ação não são o mesmo número e não são combinadas como se fossem
uma única certeza. O estágio é auxiliar; o diagnóstico causal é o produto.

#### Estimativa direcional de consistência

Cada evidência comportamental possui peso entre fragilidade e prática adaptativa.
Para uma folha da taxonomia, o motor calcula uma média direcional sobre a escala
centrada no nível repetível, limita o resultado entre 0 e 4 e registra o volume de
sinais. Esse cálculo determinístico foi escolhido porque é simples, auditável e
permite reconstruir quais comportamentos deslocaram o nível.

```text
nível local = média ordinal por pessoa, com cada pessoa contribuindo uma vez
nível do recorte pequeno = evidência local + prior organizacional fraco
incerteza = intervalo beta-binomial de 90%
confiança = diversidade de pessoas e padrões × precisão × concordância
```

A confiança não chega a 100% apenas pela repetição de quatro sinais. Ela cresce com
pessoas e padrões independentes, considera a largura do intervalo e é reduzida pelo desacordo entre
evidências positivas e negativas. A cobertura é calculada separadamente pela
variedade de padrões independentes: repetir muitas vezes o mesmo comportamento não
faz uma folha parecer completa. Ramos superiores herdam o menor nível e a menor
confiança entre os filhos publicáveis. O efeito prático é evitar que volume,
repetição ou uma prática muito forte escondam áreas ainda não observadas.

O que esperar desse cálculo:

- uma leitura direcional e explicável da capacidade, não uma medição física exata;
- regressão de confiança quando perfis ou situações contradizem a narrativa inicial;
- ausência de nota quando a variedade temática é insuficiente;
- classificação global limitada pelo gargalo confiável, em vez de uma média otimista.

#### Inferência bayesiana das causas

Depois de identificar um sintoma, o motor estima suas causas prováveis com famílias
bayesianas binárias independentes. Cada causa compete contra `evidência insuficiente`,
e não contra todas as outras causas, porque processo, ferramenta, acesso e estrutura
podem limitar o mesmo fluxo simultaneamente.

Cada família possui um prior especialista e likelihoods versionados que representam
quanto cada evidência seria esperada caso a causa estivesse ou não sustentada. A
atualização soma log-likelihoods e normaliza os resultados com softmax. O cálculo em
log-espaço evita perda numérica quando várias evidências são combinadas e mantém a
decomposição auditável.

```text
log posterior(h) ∝ log prior(h) + Σ força(e) × log likelihood(e | h)
```

A força de uma observação considera:

- prevalência: quantas pessoas observaram o padrão entre as que poderiam observá-lo;
- recorrência, com crescimento sublinear para volume não dominar o resultado;
- variedade de perspectivas e camadas de observação;
- observabilidade da causa para aquele grupo;
- contradições ligadas especificamente à hipótese;
- independência causal, consumindo somente uma evidência de cada grupo correlacionado.

Ausência de resposta é neutra. Uma pessoa que não poderia observar provisionamento,
por exemplo, não conta contra uma hipótese sobre plataforma. Como consequência,
duas squads com a mesma nota podem receber diagnósticos e intervenções diferentes.

O valor interno é um posterior provisório: a força relativa da hipótese
diante das premissas e evidências da versão atual. Antes da calibração com casos
reais, ele não deve ser lido como probabilidade objetiva. A interface pré-piloto
publica faixas verbais de sustentação e mantém o número apenas para avaliação offline.

#### Entropia e seleção da próxima pergunta

A incerteza entre hipóteses é medida por entropia de Shannon, em bits. Para cada
probe elegível, o motor simula seus resultados possíveis e estima quanta entropia
seria removida em média. Esse ganho esperado de informação responde: “qual pergunta
tem maior chance de separar as causas que ainda parecem plausíveis?”.

```text
ganho esperado = entropia atual − entropia média após os resultados possíveis
```

O ranking vigente combina 50% de ganho de informação normalizado, 25% de cobertura
ausente, 15% de necessidade de validação e 10% de custo invertido. Somente perguntas
observáveis pelo perfil, relacionadas ao sintoma e ainda não respondidas participam.
O aprofundamento termina após cinco probes ou quando nenhuma pergunta oferece ao
menos 0,01 bit de ganho esperado.

Isso reduz perguntas genéricas e concentra a entrevista onde uma resposta pode
mudar o diagnóstico. Não garante a pergunta perfeita: a qualidade depende dos
resultados e likelihoods definidos no catálogo vigente.

#### Priorização das recomendações

Uma nota baixa não seleciona automaticamente uma solução. A recomendação exige uma
hipótese causal compatível, suporte coletivo e seus pré-requisitos. A confiança da
intervenção vem do posterior causal; sua prioridade é calculada separadamente a
partir de severidade e alcance. Por isso uma ação urgente pode ter incerteza ainda
relevante, e uma causa muito provável pode não ser a ação de maior impacto imediato.

Entre 50% e 70%, a intervenção permanece como hipótese a validar. Acima do limiar
de prescrição e com pré-requisitos atendidos, ela pode ser publicada como
recomendação. O relatório sempre associa a ação a uma medida, horizonte de revisão
e critério de sucesso para que o efeito possa ser verificado.

#### Calibração implementada para o piloto

O projeto já calcula offline quatro métricas quando recebe previsões acompanhadas
de rótulos externos:

| Métrica | O que responde | Como melhora o produto |
|---|---|---|
| Brier score | Quão distante a probabilidade ficou do resultado observado? | Penaliza confiança excessiva e permite comparar versões do modelo. |
| Erro esperado de calibração | Quando o motor diz 70%, algo ocorre perto de 70% dos casos equivalentes? | Indica quais faixas precisam de ajuste de prior ou likelihood. |
| Precisão | Entre causas prescritas, quantas foram confirmadas externamente? | Controla recomendações falsas e intervenções desnecessárias. |
| Recall | Entre causas existentes, quantas foram detectadas? | Mostra lacunas de perguntas, evidências e cobertura do catálogo. |

Essas métricas estão implementadas, mas ainda não possuem validade operacional sem
uma base de casos revisados. Resposta escolhida, clique, tempo de tela ou aceitação
de recomendação não são rótulos de verdade.

#### Como o modelo pode ficar mais robusto

A robustez virá de um ciclo supervisionado e versionado, não de aprendizado
automático silencioso:

1. especialistas revisam jornadas anonimizadas e registram causa, justificativa e
   discordância de forma independente;
2. o piloto mede Brier, calibração, precisão, recall, parada incorreta e poder
   discriminativo por pergunta;
3. perguntas ambíguas ou pouco informativas são reescritas, removidas ou recebem
   novos discriminadores;
4. priors e likelihoods são ajustados em uma nova versão reproduzível;
5. a nova versão é comparada com a anterior antes de ser publicada;
6. drift por contexto, perspectiva e tipo de organização é monitorado ao longo do
   tempo, com revisão humana e possibilidade de rollback.

Com massa diversa e rótulos confiáveis, espera-se obter probabilidades mais bem
calibradas, menos falsos positivos, perguntas mais curtas e discriminativas e
recomendações mais específicas ao contexto. Apenas acumular respostas de muitos
projetos aumenta a base observável, mas não altera o modelo em produção nem garante
melhoria: sem revisão externa, os dados representam percepções, não a verdade causal.

### 7. Consolidação sociotécnica

O relatório não calcula uma média que permita a uma capacidade forte esconder um
gargalo. A classificação global e a de cada unidade são limitadas pelo elo confiável
mais frágil, inclusive entre descendentes publicáveis. Assim, duas squads com comportamento sustentado
não mascaram uma terceira squad crítica dentro da mesma área.

### 8. Relatório e plano de melhoria

O painel abre pelo índice das entrevistas — problemas por área, cada
um com caminho, sustentação, fundamento e impacto — e pelos três
sistemas. Não há sessão de cruzamento na home: o motor guarda as
arestas e a disciplina mostra o mesmo problema com o nome daquele
recorte. Briefings por público e administração ficam em detalhe.
Estágio e mapa de recorte não escondem as demais dores. Cada
diagnóstico recomendado apresenta:

- problema observado e impacto esperado;
- causa provável e força da hipótese;
- ação sugerida e responsável provável;
- medida, horizonte de revisão e critério de sucesso;
- quando elegível, direção técnica separada em prática-alvo, técnicas, mecanismo
  habilitador e famílias de ferramenta opcionais, com pré-condições e limites;
- evidências e detalhes do modelo sob demanda.

Na base das entrevistas, o painel nomeia o comportamento identificado e separa
pessoas que o sustentaram, contradições específicas e jornadas que não produziram
sinal publicável em nenhuma direção. “Sem contradição publicada” nunca significa
que todas as demais pessoas concordaram. Os indicadores de convergência, amplitude,
diversidade e cobertura causal explicam em texto o que medem e o que não permitem
concluir.

A first screen mostra o índice de problemas e os três sistemas. Unidades
distintivas ocupam uma linha cada. A sequência de transformação permanece
no detalhe. Recortes locais aparecem em “Unidades” somente quando mudam a
interpretação global e preservam os limiares de anonimato.

Recomendações são classificadas como correção ou evolução. Uma ferramenta só pode
ser sugerida quando resolve uma causa sustentada e é compatível com o contexto; sua
simples presença nunca é tratada como evidência de capacidade. As seis bibliotecas
técnicas vigentes cobrem feedback/esteira, segurança, ambiente seguro, descoberta
de domínio, mapeamento arquitetural e caminhos homologados. Elas permanecem
ocultas enquanto mecanismo, contenção ou capacidade para agir não forem suficientes.

## Capacidades observadas

Os oito pilares indexam o mapa de problemas; não são notas de um framework:

1. **Estratégia de produto e valor** — direção, descoberta, resultados e portfólio.
2. **Fluxo de entrega** — planejamento, refinamento, fluxo, integração, release
   e feedback.
3. **Engenharia e qualidade** — mudança sustentável, proteção contínua de riscos,
   feedback técnico e competência acessível.
4. **Arquitetura e evolução** — domínio, decisões, evolutibilidade, integração e dados.
5. **Operação e confiabilidade** — investigabilidade, objetivos, incidentes e
   recuperação.
6. **Plataforma e experiência de engenharia** — autonomia com limites, infraestrutura
   reproduzível e eficiência.
7. **Segurança e gestão de risco** — risco na entrega, identidade, acesso e
   rastreabilidade.
8. **Sistema organizacional** — ownership, governança, liderança, colaboração e
   aprendizado. Este pilar é um meta-sistema: explica restrições que aparecem nos
   demais; não é o oitavo eixo “técnico”.

DDD, Team Topologies, Tuckman, TOGAF, SRE, Well-Architected, DevOps, agilidade,
DORA e práticas de engenharia orientam a autoria e a interpretação. Eles não viram
checklists nem concedem pontos pelo nome.

## Estágio do comportamento (leitura auxiliar)

O relatório publica esta escala só como consistência do elo limitante, depois do
cartão de diagnóstico. Ela não é o resultado.

| Estágio | Estado | Interpretação |
|---:|---|---|
| 0 | Opaco | Decisões e resultados não são observáveis. |
| 1 | Reativo | A resposta depende de urgência e esforço individual. |
| 2 | Repetível | Existem práticas locais, ainda sensíveis ao contexto. |
| 3 | Gerenciado | O comportamento é consistente, observável e possui ownership. |
| 4 | Adaptativo | Feedback modifica ativamente políticas, produto e plataforma. |

O estágio é direcional e explicável. Não deve ser usado isoladamente para comparar
times, avaliar desempenho individual ou prescrever uma solução. A sequência para
tirá-lo do primeiro plano está no
[plano de diagnóstico](docs/backlog/engineering-diagnostic-plan.md).

## Técnicas implementadas

### Assessment e inferência

- entrevista comportamental em grafo direcionado, versionado e validado;
- roteamento por contexto e perspectiva sem pontuar perfil ou tecnologia;
- aprofundamento de sinais frágeis, maduros e contraditórios;
- projeção de uma resposta em múltiplas capacidades e camadas explícitas;
- cobertura por padrões independentes e confiança sensível a contradições;
- inferência bayesiana causal em log-espaço, sem LLM;
- deduplicação por grupos de evidência correlacionada;
- posterior condicionado à população capaz de observar a situação;
- seleção adaptativa por ganho esperado de informação;
- triangulação agregada entre perspectivas elegíveis;
- recomendações causais com experimentos mensuráveis;
- métricas offline para futura calibração supervisionada.

### Privacidade e segurança

- convites de uso único armazenados como hash;
- consumo atômico e retomada segura da participação;
- separação lógica entre convite e respostas;
- limiar mínimo e supressão conservadora de partições hierárquicas;
- ausência de respostas individuais no painel e na API;
- segredos e tokens removidos de logs e páginas posteriores;
- tratamento universal de erros sem stack trace, SQL ou detalhes internos.

### Engenharia do produto

- monólito modular em Node.js e TypeScript estrito;
- Fastify, HTML renderizado no servidor e SQLite;
- domínio separado para assessment, catálogo, inferência, projetos e relatórios;
- entidades e value objects nas fronteiras com invariantes;
- schema vigente sem camada de retrocompatibilidade legada;
- testes de domínio, integração, HTTP e jornada completa com Playwright;
- showcase automatizado com três relatórios organizacionais da POC (frágil,
  intermediário e sustentado), cada um com 18 pessoas em duas unidades.

## Arquitetura

O sistema permanece intencionalmente simples: uma aplicação Node.js e um banco
SQLite. O catálogo TypeScript é a fonte de autoria do instrumento e publica versões
imutáveis de nós, opções, arestas, sinais e hipóteses no banco. Participações guardam
a versão utilizada, garantindo reprodutibilidade do diagnóstico.

```text
Interface web / API
        ↓
Projetos e convites ── Assessment adaptativo
        ↓                       ↓
Estrutura organizacional   Catálogo versionado
        └──────────┬────────────┘
                   ↓
        Inferência e recomendações
                   ↓
       Relatórios globais e por escopo
                   ↓
                 SQLite
```

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://127.0.0.1:3000`. Por padrão, o banco é criado em
`data/app.sqlite`.

## Verificação

```bash
npm run check
npm test
npm run build
npm run test:e2e
```

Para gerar os três casos, validar o percurso do produto e deixar a
apresentação aberta:

```bash
npm run demo
```

O comando recria o SQLite temporário, semeia as três organizações da POC, percorre
criar projeto → convite → entrevista no Chromium, lê os relatórios e grava o deck em
`/private/tmp/maturity-assessment-showcase-pilot-v1.html`. Abra
`http://127.0.0.1:3217/showcase` para o percurso e os três casos concluídos.
`npm run showcase` é um alias do mesmo fluxo.

Para uma execução paralela, `E2E_DATABASE_PATH`, `E2E_SHOWCASE_GUIDE`, `E2E_PORT`
e `SHOWCASE_PUBLIC_URL` isolam banco, guia e portas sem apagar um showcase que já
esteja aberto.

## Estado e limites atuais

- O MVP está concluído e suporta um piloto cognitivo inicial com oito pessoas em
  uma única unidade elegível. O painel impede interpretar uma divisão 4+4 como
  comparação segura entre squads.
- O acesso administrativo usa o segredo entregue na criação; ainda não há conta,
  recuperação ou SSO.
- Os ramos de dados, design, arquitetura e segurança já existem no grafo; o piloto
  cognitivo deve validar sua linguagem com cada disciplina antes de uso diagnóstico
  amplo.
- A adaptação probabilística complementa o tronco declarativo somente no
  aprofundamento terminal.
- Não há calibração empírica, aprendizado automático em produção ou atualização
  silenciosa do modelo.
- Cliques e aceitação de recomendações não são tratados como verdade de treinamento.

## Documentação

- [Base de conhecimento vigente](docs/knowledge-base/README.md)
- [Plano: diagnóstico de engenharia](docs/backlog/engineering-diagnostic-plan.md)
- [Modelo de avaliação](docs/knowledge-base/assessment-model.md)
- [Desenho das perguntas](docs/knowledge-base/question-design.md)
- [Diagnóstico e recomendações](docs/knowledge-base/recommendation-model.md)
- [Arquitetura técnica](docs/knowledge-base/technical-architecture.md)
- [Escopo concluído do MVP](docs/knowledge-base/mvp-scope.md)
- [Backlog de evolução](docs/backlog/README.md)
- [Changelog](CHANGELOG.md)
- [Histórico técnico detalhado](docs/history/completed.md)

## Princípios éticos

- Não avaliar pessoas individualmente.
- Não transformar o resultado em ranking simplista de times.
- Não confundir ferramenta, cargo ou cerimônia com capacidade.
- Não atribuir ao time uma restrição imposta pelo sistema organizacional.
- Não apresentar inferência como fato definitivo.
- Não comprometer anonimato para produzir recortes mais detalhados.
