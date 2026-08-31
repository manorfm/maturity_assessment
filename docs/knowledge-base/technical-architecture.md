# Arquitetura técnica vigente

## Decisão

A aplicação será um monólito modular em **Node.js com TypeScript**, usando SQLite,
API HTTP e páginas sóbrias renderizadas no servidor. JavaScript no navegador será
progressivo e usado apenas onde melhorar a interação.

## Direção inicial da stack

- Node.js em versão LTS e TypeScript em modo estrito;
- Fastify para HTTP, API e composição explícita dos módulos;
- templates server-side para as telas;
- `node:sqlite`, schema inicial idempotente e acesso isolado por serviços;
- CSS local com design tokens simples, sem depender inicialmente de um SPA;
- testes unitários para inferências e testes de integração para API/banco;
- Playwright para fluxos reais de navegador e projetos sintéticos de demonstração;
- conteúdo inicial do assessment versionado em arquivos no repositório.

Fastify e `node:sqlite` foram confirmados no primeiro corte executável. Detalhes
internos podem evoluir por ADR sem alterar o modelo de domínio.

## Domínio e fronteiras

Valores recebidos por HTTP não entram diretamente nas regras. `ProjectName`,
`OrganizationPath`, `ProjectDraft`, `AssessmentProfile` e `InvitationQuantity`
normalizam e protegem invariantes antes da persistência. Operações que alteram um
agregado usam a mesma função transacional para commit/rollback atômico.

Erros conhecidos derivam de `AppError` e carregam apenas status, código e mensagem
segura. Um handler HTTP único converte erros em páginas com referência da requisição;
falhas inesperadas são registradas internamente sem apresentar stack, SQL ou segredo.

TypeScript estrito também rejeita símbolos e parâmetros não usados. Mudanças de
comportamento seguem ciclos red/green/blue com testes de domínio, integração e HTTP.

O estágio atual não preserva bancos anteriores. Um banco vazio recebe diretamente
o único schema vigente, registrado como versão 19; mudanças incompatíveis exigem
recriação explícita da base. Opções carregam `observation_kind` (`practice`,
`visibility` ou `not_applicable`). Capturas agregadas de diagnóstico, experimentos
de transformação, rótulos cegos do piloto e entrevistas cognitivas ficam em tabelas
próprias, sem vínculo com pessoa. O painel administrativo registra entrevistas
cognitivas nessas tabelas. Colunas de
projeção, camada e restrição são obrigatórias.
Índices e constraints garantem que um lote de origem seja reemitido no máximo uma vez.

A API administrativa usa bearer token apenas no header e compartilha os serviços
das telas. Relatórios JSON passam por sanitização para remover contagem de padrões e
campos internos. Erros HTML e JSON são produzidos por um único handler universal.

## Limites modulares

Cada módulo contém domínio, casos de uso, persistência e interface HTTP próprios.
Um módulo não acessa diretamente as tabelas internas de outro. A composição ocorre
na inicialização da aplicação e a comunicação usa contratos explícitos.

Estrutura inicial:

```text
src/
  app/
  modules/
    catalog/
    assessments/
    inference/
    projects/
  shared/
  web/
```

`shared` será pequeno: infraestrutura realmente transversal, não regras de negócio
sem proprietário.

O questionário e a inferência não são cadeias de `if` espalhadas pelas rotas.
Definições declarativas versionadas no módulo `catalog` semeiam tabelas de versões,
nós, opções, arestas e sinais. O motor lê exclusivamente a versão publicada no
SQLite e escolhe arestas específicas por resposta antes da aresta padrão. O grafo
de domínio permanece relacional e não exige banco de grafos.

## Critérios da decisão

- um único processo, deploy e banco no estágio atual;
- baixo custo de operação e desenvolvimento local;
- regras de inferência testáveis sem servidor ou banco;
- histórico e explicabilidade preservados por versão;
- possibilidade de trocar SQLite no futuro sem antecipar uma arquitetura distribuída;
- acessibilidade, privacidade e segurança incluídas desde o primeiro fluxo.

## Primeiro corte vertical

1. Criar um projeto e sua hierarquia configurável.
2. Emitir convites anônimos não rastreáveis no relatório.
3. Responder a um pequeno cenário de entrega/observabilidade.
4. Persistir respostas e gerar sinais explicáveis.
5. Exibir consolidação apenas quando o limite mínimo de participantes for atingido.

O corte vigente implementa esses cinco passos com 88 nós, aprofundamentos
condicionais e nove perspectivas — gestão, produto, qualidade, engenharia,
plataforma/operações, arquitetura, segurança, dados e design — escolhidas durante
a entrevista. Um contexto neutro adicional registra responsabilidades exercidas,
autoridade, alcance e eventos observáveis. `assessment_edges.conditions_json`
mantém condições declarativas e `participations.work_context_json` preserva o
contexto da retomada sem gerar sinal.
O mesmo JSON preserva a trilha derivada da opção de contexto. A estimativa exibida
percorre as arestas dessa trilha, em vez de usar o primeiro sucessor do grafo amplo.

O cálculo ordinal agrega primeiro por pessoa, aplica partial pooling fraco em
recortes pequenos e publica intervalo beta-binomial de 90%. Sinais contraditórios
reduzem confiança sem criar condicionais nas rotas. O radar usa SVG acessível,
marcadores focáveis, resumos em hover/foco e links nativos somente para capacidades
avaliadas. Capacidades sem cobertura usam marcador neutro, ficam fora da geometria
e não oferecem navegação. A apresentação não recalcula a inferência nem depende de
framework de frontend.

O HTML renderizado no servidor segue divulgação progressiva: um cartão de decisão
em linguagem operacional mantém situação, prioridade, teste, critério e limite no
primeiro plano. Base das entrevistas, justificativa da prioridade, hipóteses e
fundamento técnico ficam em detalhes expansíveis. Depois da decisão, uma navegação
por âncoras conduz às projeções de diretoria, liderança de tecnologia, gerência
local e especialistas; todas consomem o mesmo diagnóstico e o mesmo portfólio.
O panorama sequenciado vem após os briefings, enquanto radar e recortes estruturais
orientam aprofundamento sem reabrir a decisão. IDs de navegação pertencem apenas ao
relatório global, evitando âncoras duplicadas nos recortes de unidade. O limitador de palco
exclui cloud aninhada salvo quando resta só esse elo. Hipóteses do home ficam
amarradas ao limitador. Probabilidades, ordinal exato, cobertura percentual, versão,
calibração e revisão cognitiva ficam em elementos `details`. O home coloca decisão
e mapa antes da administração de convites, também recolhida. Divergências correlatas
são compostas num único resumo de fronteira.
Essa separação muda a linguagem e a hierarquia visual, não os contratos ou regras
do motor. A rota apenas projeta o desfecho já decidido; não infere causa nem escolhe
solução por texto. O catálogo de orientação vive em `solution-guidance.ts`; a
composição do desfecho em `report-outcome.ts`.
Contratos de investigação e preservação ficam em `capability-narrative.ts`. A
triangulação agrega sinais por perfil e folha declarada em `detail_capabilities`;
não tenta converter capacidades amplas em folhas por nome ou regex.

`guidanceStatus` separa contratos causais explícitos de orientação de fonte ainda
incompleta. `GroupRecommendationEngine` considera somente os explícitos e consome
métrica e critério do mesmo contrato; o roteamento histórico por regex foi removido.
Assim autoria de conteúdo não cria uma segunda regra escondida dentro do ranqueador.

`CausalKnowledgeGraph` é a única composição entre comportamento, efeito, hipótese,
evidência, contradição, intervenção e fundamento. `problem-system.ts` mantém
bibliotecas declarativas com os papéis `symptoms`, `hypotheses` e `amplifiers`;
elas alimentam tanto o agrupamento do panorama quanto as alternativas do finding.
A projeção pública remove identificadores internos, preserva a versão
`causal-catalog-v3` e aparece no cartão e no detalhe sem recalcular o posterior.
`SociotechnicalPattern` valida decisão e consequência observadas antes de compor
um ciclo, mantém reforço como hipótese e separa racionalidade local, efeito,
incentivo, fronteira decisória e comportamento compensatório. A projeção é
omitida quando essas evidências não existem; não há fallback narrativo que invente
causalidade.

`technical-practice-library.ts` contém contratos declarativos das seis famílias
técnicas vigentes. `CausalKnowledgeGraph` registra apenas que um padrão pode
habilitar um contrato; `technicalDirectionFor` materializa a direção depois de
validar padrão, mecanismo, prescrição e `SolutionReadiness`. Rotas e HTML apenas
projetam o objeto pronto e não contêm regras de elegibilidade.

`finding-narrative.ts` é a única regra de ordem e linguagem resumida do cartão
principal. Sua versão `finding-narrative-v1` produz seções tipadas; a rota associa
cada seção à marcação HTML e mantém detalhes metodológicos em divulgação
progressiva. O projetor não consulta banco, não ranqueia e não altera posterior,
contenção, autoridade ou prescrição.

`TransformationPortfolioPlanner`, no mesmo módulo de domínio, é a única regra de
sequenciamento. Ele consome a projeção pública do finding e produz
`transformation-portfolio-v1` para organização e recortes elegíveis. A interface e
a API não mantêm tabelas ou condicionais próprias de ordenação; achados
investigativos são separados antes do ranqueamento e políticas de intervenção por
mecanismo centralizam pré-condições e risco deslocado.

`AudienceReportProjector` é a única projeção por autoridade. Ele vive no domínio de
inferência, recebe findings e portfólio prontos e não depende de HTTP ou HTML. A API
serializa suas projeções; as rotas apenas traduzem os mesmos objetos para briefings
e leitura local. Não existem motores, catálogos ou prioridades específicos por
público.

O módulo `inference` contém um sistema probabilístico especialista, sem LLM e sem
serviço distribuído. Hipóteses, priors, probabilidades condicionais, observabilidade
das perguntas e política são publicados com versão imutável no SQLite. A atualização
bayesiana ocorre em log-espaço e consome uma única evidência por grupo correlacionado.
O módulo `assessments` pede ao seletor adaptativo um aprofundamento somente depois
do tronco obrigatório; no máximo cinco probes adicionais são escolhidos por entropia,
cobertura, validação e custo. Snapshots dessa decisão permanecem privados.

`CapabilityTaxonomy` organiza as capacidades medidas em ramos recursivos. O radar
superior e os radares de aprofundamento consomem a mesma árvore; a UI não recalcula
níveis. Cada capacidade possui URL administrativa própria e recebe opcionalmente o
escopo da unidade, permitindo navegação macro→micro sem perder o recorte.

A taxonomia executiva possui oito pilares. Operação/confiabilidade,
plataforma/experiência de engenharia e segurança/risco são ramos separados, embora
um mesmo sinal possa afetar folhas de todos eles. `SolutionReadiness` é derivado de
evidência positiva agregada do recorte; não altera a nota da capacidade nem o
posterior causal. O finding sanitizado carrega capacidade de solução e prontidão
junto ao experimento.

O showcase E2E gera seis casos inspecionáveis: linha sob pressão (com partição irmã abaixo do
grupo mínimo), prática local intermediária, operação adaptativa com as nove lentes,
divergência triangulada entre gestão e engenharia, integração tardia com contenção
em tooling versus política e organização sustentada com um problema contido em uma
única squad. Percorre o grafo em Chromium,
grava um índice com histórias, trechos observados e convites ociosos, valida a
ordenação, um único limitador (sem cloud por default), homes distintos entre
frágil e emergente, preservação do ramo 4/4, isolamento local, autoridade distinta
para o mesmo sintoma e a tag de divergência, e deixa a mesma base servida em `3217` — inclusive
em `/showcase` — quando iniciado por `npm run demo`. O Playwright sobe
`demo:test-server` e recria o SQLite; `demo:serve` só reabre a mesma base na porta
3217, evitando recursão entre scripts.

O catálogo `capability-narrative.ts` é o único contrato de prosa para investigação
e preservação. Cada folha declara situação incerta, evento recente, comportamento
sustentado e regressão; não existe fallback que encaixe o rótulo da capacidade em
uma frase. A auditoria do instrumento protege evento recuperável, saída de
visibilidade e vocabulário acessível antes da publicação.
O caso principal possui dois times de dez pessoas cada: um SRE, quatro pessoas de
engenharia, uma de QA, duas de produto, uma de arquitetura e uma de gestão. Os casos
fixam escolhas narrativas somente nos eventos que definem sua história central. Um
time concentra esteira, regressão e ambiente; o outro, dependências, serviço sem
responsável, legado desconhecido e coordenação. As demais respostas ficam em faixas intermediárias e variam por
perspectiva. Assim o showcase valida coerência entre resposta e diagnóstico, sem
reutilizar o recomendador para fabricar a própria expectativa.

Banco, guia e porta do E2E podem ser isolados com `E2E_DATABASE_PATH`,
`E2E_SHOWCASE_GUIDE` e `E2E_PORT`; `SHOWCASE_PUBLIC_URL` define a origem gravada
nos links preservados para inspeção. Assim uma nova execução não precisa tocar em
um showcase manual já aberto.

O painel administrativo possui um preflight distinto do gate de calibração para um
piloto cognitivo inicial de oito pessoas. Ele conta apenas convites ativos e
participações concluídas por unidade final. Oito pessoas numa única unidade
sustentam uma leitura agregada inicial; dividir quatro e quatro entre duas squads
não sustenta comparação local porque nenhuma alcança o limiar de anonimato de cinco.
Duas unidades comparáveis exigem pelo menos cinco participantes em cada uma. O
preflight nunca declara calibração: priors e posterior continuam provisórios até o
gate empírico próprio ser atendido.

O serviço de inferência projeta sinais versionados do catálogo em uma ou mais folhas
da taxonomia. Essa projeção preserva o padrão de origem e permite efeitos cruzados
sem duplicar respostas. Cada folha calcula nível pela evidência ordinal independente,
confiança por pessoas, padrões, precisão e concordância, e cobertura pela quantidade
de padrões distintos; a classificação ignora folhas que ainda não
atingiram a cobertura mínima.

Na versão vigente, cada sinal do próprio catálogo contém obrigatoriamente as folhas
afetadas, a camada de evidência e o tipo de restrição. O catálogo não completa esses
campos por regex ou pelo nome do padrão. A inferência não possui leitura ou backfill
para formatos históricos.

`auditInstrumentVersion` compõe a auditoria editorial com uma linha de base
determinística da versão publicada. `npm run audit:instrument` expõe percursos e
duração típica por perspectiva, distribuição de tipos de nó, tamanho do tronco
comum, variantes, probes causais, saídas de visibilidade e dívida dos fundamentos e
contratos de direção. Os cinco fixtures de lacuna — time full-cycle sem SRE,
segurança tardia, ambiente inseguro, parque desconhecido e ferramenta homologada
inutilizável — caracterizam trabalho futuro e não fabricam expectativa a partir do
recomendador.

`ObservedEvent`, no módulo `catalog`, é um value object de autoria para a próxima
versão do instrumento. Ele valida fatos ordenados, responsabilidade observável e
condição de revisão e rejeita narrativa abstrata. O tipo não é persistido nem
consumido pela inferência vigente e deliberadamente não possui causa, capacidade ou
pontuação.

`TeamClassification` encapsula a escala e a regra de elo limitante. O serviço de
inferência calcula classificações locais e aplica a menor classificação descendente
somente entre recortes já liberados pelas proteções de anonimato.

## Agregação hierárquica segura

Uma consulta recursiva calcula participantes concluídos em cada subárvore. O motor
só publica o recorte quando a unidade alcança o limiar e cada partição não vazia
(filhos e participantes diretamente associados) também alcança o mínimo. Se um
irmão pequeno permitir dedução por subtração, a cadeia relacionada é suprimida.

Findings por unidade não mostram contagem do padrão nem distribuição de opções.
Eles apresentam apenas padrões que atingiram a confiança mínima e a intervenção
correspondente.

## Links e proteção contra respostas repetidas

- O identificador público do projeto não autoriza responder.
- Cada convite usa um token criptograficamente aleatório de alta entropia.
- O banco guarda `hash(token)`, estado, validade e rodada; a URL contém o token.
- O consumo é atômico no SQLite para impedir duas conclusões concorrentes.
- Uma sessão pode retomar resposta parcial sem criar uma segunda participação.
- Convites concluídos não podem iniciar nova participação.
- Ao reabrir um convite concluído, a aplicação mostra somente que a participação já
  foi registrada; não recupera nem apresenta respostas.
- Tokens são removidos de logs, telemetria, referrers e páginas posteriores.
- Respostas e convites ficam logicamente separados e não são correlacionados nos
  relatórios administrativos.

Cookies, IP e fingerprint de navegador não serão usados como controle principal:
são frágeis, podem bloquear pessoas legítimas e criam riscos de privacidade. Como
defesa complementar, poderão existir rate limit e detecção agregada de abuso sem
compor qualquer inferência de capacidade.
