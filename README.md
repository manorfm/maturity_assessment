# Maturity Assessment

Aplicação web para self-assessment de maturidade organizacional e técnica baseada
em comportamentos, decisões e evidências — não em declarações genéricas sobre
frameworks ou ferramentas.

O produto será construído em Node.js/TypeScript como um monólito modular, com
API, interface web sóbria renderizada no servidor e SQLite. A definição do modelo
está em [`docs/knowledge-base`](docs/knowledge-base) e as possibilidades futuras
ficam separadas em [`docs/backlog`](docs/backlog/README.md).

## Estado atual — MVP concluído

O primeiro corte vertical está executável. Ele permite criar um projeto, configurar
uma hierarquia livre, gerar convites individuais, responder anonimamente a uma
entrevista de 52 nós com aprofundamentos condicionais e liberar findings globais e hierárquicos
após cinco conclusões em partições seguras.

A versão 0.3 adapta a linguagem de cenários ao perfil e apresenta divergências de
perspectiva somente quando cada grupo comparado possui ao menos cinco respostas.

A versão 0.4 concluiu o [escopo do MVP](docs/knowledge-base/mvp-scope.md): adicionou
lotes revogáveis/reemitíveis e uma
[API administrativa](docs/knowledge-base/api.md). O sistema está pronto para um
piloto controlado; itens de escala, integração e calibração permanecem no backlog.

A versão 0.5 torna os convites independentes de perfil, identifica a perspectiva
na própria jornada, amplia a cobertura comportamental do SDLC, permite copiar os
links emitidos e apresenta um radar das capacidades com evidência agregada.

A versão 0.6 aprofunda entrega e integração, testa práticas maduras sob pressão,
discrimina causas prováveis e apresenta confiança, contradições e próximos passos
dentro do radar navegável.

A versão 0.7 adiciona anamnese de incidentes, diagnóstico e correção operacional,
além de aprofundar objetivo da iteração, bloqueios e decisões antes da construção.

A versão 0.8 conecta comportamentos a múltiplas capacidades, investiga melhoria
contínua e superfícies compartilhadas somente quando aplicáveis e classifica cada
nível da hierarquia pelo elo confiável mais frágil.

A versão 0.9 organiza capacidades em uma árvore navegável, separa valor/fluxo do
sistema de engenharia, coloca cloud e plataforma sob arquitetura/operação, oferece
acesso explícito a projetos existentes e adiciona um showcase Playwright com
organizações sintéticas ruim, mediana e elite.

A versão 0.10 mantém quatro capacidades macro sempre visíveis e move cada explosão
para uma página própria, com breadcrumb, escopo organizacional preservado e
diagnóstico coerente quando a evidência é insuficiente ou contraditória.

A versão 0.11 migra o relatório para seis capacidades sociotécnicas, introduz
cobertura temática distinta de confiança, redistribui uma resposta por múltiplas
práticas quando seus efeitos atravessam o sistema e acrescenta situações sobre
resultado, sustentabilidade técnica, dados, confiabilidade e liderança.

A versão 0.12 torna os efeitos capacidade/camada/restrição explícitos no catálogo,
audita cobertura independente de todas as folhas antes da publicação, abre ramos
próprios para cinco perspectivas e exercita uma squad multiperfil no showcase.

A versão 0.13 introduziu um sistema especialista sem LLM. O estado vigente remove
coocorrência genérica e usa população aplicável, evidências relacionadas, camadas,
perspectivas e contradições específicas para priorizar experimentos. Cada sugestão
informa causa, ação, responsável provável, métrica, revisão e critério de sucesso.
Grupos com a mesma nota podem receber recomendações diferentes.

A versão 0.14 publica um modelo causal versionado no SQLite, atualiza hipóteses
concorrentes em log-espaço, evita dupla contagem de evidências correlacionadas e
mostra posteriores explicáveis no relatório. Ao terminar o percurso obrigatório,
o motor pode acrescentar até cinco probes observáveis pelo perfil, escolhidos por
ganho esperado de informação, cobertura, validação e custo; cada decisão fica em
snapshot privado e nunca é exposta pela API administrativa. Recomendações continuam
sem LLM, são ligadas à causa e acompanhadas de experimento verificável.

Os percentuais são posteriores provisórios baseados em probabilidades especialistas,
não precisão empírica. Brier score, erro de calibração, precisão e recall já possuem
implementação offline, mas só poderão ser interpretados após revisão externa e massa
real rotulada. O trabalho de piloto está no
[`roadmap probabilístico`](docs/backlog/probabilistic-inference-roadmap.md).

A versão 0.15 separa sintomas, causas e consequências na publicação do modelo.
Causas simultâneas deixaram de competir em uma distribuição categórica: cada uma é
avaliada contra evidência insuficiente. O posterior considera prevalência na
população aplicável, perspectivas e camadas; ausência de resposta permanece neutra.
Inconclusões são agrupadas por capacidade e só indicam uma próxima pergunta quando
existe um probe contextual elegível.

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://127.0.0.1:3000`. O banco é criado em `data/app.sqlite`.

## Verificação

```bash
npm run check
npm test
npm run build
npm run test:e2e
```

Para gerar os três projetos sintéticos e deixar a aplicação aberta para inspeção,
execute apenas `npm run demo`. O comando percorre toda a jornada em Chromium,
imprime os links administrativos e mantém o servidor na porta `3217`; não exige
preparação manual do banco. O SQLite é recriado antes do E2E e preservado quando o
servidor de inspeção assume a mesma porta, portanto os links impressos continuam
válidos. `npm run showcase` permanece como alias compatível.

## Limites deste corte

- O segredo no link administrativo é o único acesso do criador; ainda não há conta
  ou recuperação.
- Convites podem ser copiados em conjunto e expiram em 30 dias; lotes podem ser revogados
  e reemitidos sem recuperar segredos antigos.
- O grafo é semeado a partir do catálogo versionado e executado pelas tabelas de
  nós, opções, arestas e sinais no SQLite. Um editor visual do grafo de perguntas,
  diferente do editor de hierarquia organizacional já entregue, continua no backlog.
- Os recortes hierárquicos são suprimidos quando um grupo irmão pequeno permitiria
  inferência por subtração; filtros combináveis mais avançados ainda não existem.
- A jornada comum é complementada por ramos próprios de gestão, produto, qualidade,
  engenharia e plataforma/operações; dados, design, arquitetura e segurança ainda
  usam o percurso comum e permanecem no backlog de calibração por disciplina.
- A adaptação preserva o tronco declarativo e usa seleção probabilística somente no
  aprofundamento terminal. Ainda não há calibração empírica nem aprendizado
  supervisionado; respostas, cliques e aceitação de sugestões não são tratados como
  rótulos de verdade.
