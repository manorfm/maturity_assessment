# Maturity Assessment

Aplicação web para avaliar a maturidade sociotécnica de organizações que criam e
operam produtos digitais. O assessment observa como o trabalho realmente acontece:
decisões, comportamentos, restrições, consequências e aprendizado. Ferramentas,
cargos, cerimônias e frameworks fornecem contexto, mas não geram maturidade por
existirem nominalmente.

O MVP está concluído e pronto para piloto controlado. A próxima meta é validar o
instrumento com jornadas reais, revisar as inferências com especialistas e calibrar
o modelo sem transformar o resultado em ranking de pessoas ou times.

## Objetivo

O produto procura responder quatro perguntas:

1. Quais capacidades do sistema de trabalho são sustentáveis e quais são frágeis?
2. O que limita a evolução: conhecimento, processo, ferramenta, acesso, arquitetura,
   governança, cultura ou desenho organizacional?
3. Em qual parte da estrutura o problema aparece e até onde seu efeito se propaga?
4. Qual é o menor experimento verificável capaz de melhorar a situação?

O resultado esperado não é apenas uma nota. É um diagnóstico explicável que conecta:

```text
contexto → comportamento → evidência → sintoma → causa provável
         → impacto → intervenção → medida de sucesso
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

### 4. Anamnese comportamental adaptativa

A entrevista reconstrói situações do dia a dia, como uma entrega bloqueada, um
incidente, uma decisão arquitetural ou uma ação de melhoria. Em vez de perguntar
“você usa CI/CD?” ou “aplica SRE?”, ela investiga o que aconteceu, quem percebeu,
quanto esperou, como decidiu, que consequência ocorreu e o que mudou depois.

O percurso é um grafo versionado com 72 nós. Um tronco comum identifica sintomas;
branches por perspectiva aprofundam o que a pessoa consegue observar. Depois do
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

### 6. Inferência de maturidade e causas

O produto usa modelos diferentes para perguntas diferentes. Nota de maturidade,
cobertura, confiança da nota, probabilidade de uma causa e prioridade de uma ação
não são o mesmo número e não são combinadas como se fossem uma única certeza.

#### Estimativa direcional de maturidade

Cada evidência comportamental possui peso entre fragilidade e prática adaptativa.
Para uma folha da taxonomia, o motor calcula uma média direcional sobre a escala
centrada no nível repetível, limita o resultado entre 0 e 4 e registra o volume de
sinais. Esse cálculo determinístico foi escolhido porque é simples, auditável e
permite reconstruir quais comportamentos deslocaram o nível.

```text
nível = limitar(2 + média dos pesos, 0, 4)
confiança = mínimo(1, quantidade de sinais / 4) × concordância direcional
```

A confiança dessa nota cresce até quatro sinais e é reduzida pelo desacordo entre
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

O percentual apresentado é o posterior provisório: a força relativa da hipótese
diante das premissas e evidências da versão atual. Antes da calibração com casos
reais, ele não deve ser lido como “há 80% de certeza objetiva de que esta é a causa”.

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
mais frágil, inclusive entre descendentes publicáveis. Assim, duas squads maduras
não mascaram uma terceira squad crítica dentro da mesma área.

### 8. Relatório e plano de melhoria

O painel oferece uma leitura executiva com estágio, principal limitador, risco e
prioridade. O radar permite navegar da capacidade macro até subcapacidades, práticas
e evidências. Cada diagnóstico recomendado apresenta:

- problema observado e impacto esperado;
- causa provável e força da hipótese;
- ação sugerida e responsável provável;
- medida, horizonte de revisão e critério de sucesso;
- evidências e detalhes do modelo sob demanda.

Recomendações são classificadas como correção ou evolução. Uma ferramenta só pode
ser sugerida quando resolve uma causa sustentada e é compatível com o contexto; sua
simples presença nunca é tratada como maturidade.

## Capacidades avaliadas

O radar superior organiza seis capacidades sociotécnicas:

1. **Estratégia de produto e valor** — direção, descoberta, resultados e portfólio.
2. **Fluxo de entrega** — planejamento, refinamento, trabalho, integração, release
   e feedback.
3. **Engenharia e qualidade** — design sustentável, estratégia de qualidade,
   automação do SDLC, segurança e capacidade técnica.
4. **Arquitetura e evolução** — domínio, decisões, evolutibilidade, integração e dados.
5. **Operação, confiabilidade e plataforma** — observabilidade, confiabilidade,
   incidentes, autonomia e infraestrutura/cloud.
6. **Sistema organizacional** — ownership, governança, liderança, colaboração e
   aprendizado.

DDD, Team Topologies, Tuckman, TOGAF, SRE, Well-Architected, DevOps, agilidade,
DORA e práticas de engenharia orientam a autoria e a interpretação. Eles não viram
checklists nem concedem pontos pelo nome.

## Escala de maturidade

| Nível | Estado | Interpretação |
|---:|---|---|
| 0 | Opaco | Decisões e resultados não são observáveis. |
| 1 | Reativo | A resposta depende de urgência e esforço individual. |
| 2 | Repetível | Existem práticas locais, ainda sensíveis ao contexto. |
| 3 | Gerenciado | O comportamento é consistente, observável e possui ownership. |
| 4 | Adaptativo | Feedback modifica ativamente políticas, produto e plataforma. |

O nível é direcional e explicável. Não deve ser usado isoladamente para comparar
times, avaliar desempenho individual ou prescrever uma solução.

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
- showcase automatizado com casos inspecionáveis (frágil, emergente, adaptativo e divergência).

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

Para gerar casos sintéticos, um índice de inspeção e manter os relatórios
abertos para investigação manual de textos e resultados:

```bash
npm run demo
```

O comando recria somente o SQLite temporário do showcase, percorre as jornadas em
Chromium, grava o índice em `/private/tmp/maturity-assessment-showcase.html`,
imprime os links e mantém a aplicação na porta `3217`. Abra
`http://127.0.0.1:3217/showcase` para as histórias, o que procurar, trechos
observados e convites ociosos (entrevista à mão e o experimento do mapa por
estrutura). `npm run showcase` é um alias do mesmo fluxo.

## Estado e limites atuais

- O MVP está concluído e suporta um piloto controlado.
- O acesso administrativo usa o segredo entregue na criação; ainda não há conta,
  recuperação ou SSO.
- Os ramos de dados, design, arquitetura e segurança já existem no grafo; a
  linguagem ainda precisa de validação com cada disciplina antes de um piloto real.
- A adaptação probabilística complementa o tronco declarativo somente no
  aprofundamento terminal.
- Não há calibração empírica, aprendizado automático em produção ou atualização
  silenciosa do modelo.
- Cliques e aceitação de recomendações não são tratados como verdade de treinamento.

## Documentação

- [Base de conhecimento vigente](docs/knowledge-base/README.md)
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
