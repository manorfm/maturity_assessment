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
engenharia ou plataforma/operações. O perfil adapta linguagem e observabilidade; ele
não produz nota e não cria uma avaliação individual.

### 4. Anamnese comportamental adaptativa

A entrevista reconstrói situações do dia a dia, como uma entrega bloqueada, um
incidente, uma decisão arquitetural ou uma ação de melhoria. Em vez de perguntar
“você usa CI/CD?” ou “aplica SRE?”, ela investiga o que aconteceu, quem percebeu,
quanto esperou, como decidiu, que consequência ocorreu e o que mudou depois.

O percurso é um grafo versionado com 52 nós. Um tronco comum identifica sintomas;
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

O nível de cada capacidade combina direção, variedade e convergência das evidências.
Cobertura temática e confiança são medidas diferentes: muitas respostas sobre o
mesmo comportamento aumentam suporte, mas não substituem a falta de outros padrões.
Evidência insuficiente permanece “não avaliada” e nunca é convertida em zero.

O diagnóstico causal usa um sistema especialista probabilístico sem LLM. Hipóteses
versionadas são atualizadas em log-espaço com priors e likelihoods explícitos. O
cálculo considera população aplicável, recorrência, perspectivas, camadas,
contradições pareadas e independência entre grupos de evidência. A seleção de probes
usa ganho esperado de informação, cobertura, poder de validação e custo.

Os percentuais atuais expressam força relativa das hipóteses especialistas. Eles
ainda não são probabilidades empiricamente calibradas; Brier score, erro de
calibração, precisão e recall estão implementados para uso futuro com rótulos
externos revisados.

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
- showcase automatizado com organizações ruim, mediana e elite.

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

Para executar o Playwright, gerar três projetos sintéticos e manter os relatórios
abertos para inspeção manual:

```bash
npm run demo
```

O comando recria somente o SQLite temporário do showcase, percorre as jornadas em
Chromium, imprime os links administrativos e mantém a aplicação na porta `3217`.
`npm run showcase` é um alias do mesmo fluxo.

## Estado e limites atuais

- O MVP está concluído e suporta um piloto controlado.
- O acesso administrativo usa o segredo entregue na criação; ainda não há conta,
  recuperação ou SSO.
- Dados, design, arquitetura e segurança usam o percurso comum; ramos próprios por
  disciplina ainda precisam de validação antes da publicação.
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
