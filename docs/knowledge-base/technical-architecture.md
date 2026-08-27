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
o único schema vigente, registrado como versão 16; mudanças incompatíveis exigem
recriação explícita da base. Opções carregam `observation_kind` (`practice`,
`visibility` ou `not_applicable`). Capturas agregadas de diagnóstico e experimentos
de transformação ficam em tabelas próprias, sem vínculo com pessoa. Colunas de
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

O corte vigente implementa esses cinco passos com 52 nós, aprofundamentos
condicionais e perspectivas de gestão, produto, qualidade, engenharia e
plataforma/operações escolhidas durante a entrevista.

O cálculo de nível e confiança vive no domínio de inferência. Sinais contraditórios
reduzem confiança sem criar condicionais nas rotas. O radar usa SVG acessível,
marcadores focáveis, resumos em hover/foco e links nativos somente para capacidades
avaliadas. Capacidades sem cobertura usam marcador neutro, ficam fora da geometria
e não oferecem navegação. A apresentação não recalcula a inferência nem depende de
framework de frontend.

O HTML renderizado no servidor segue divulgação progressiva: interpretação,
impacto, prioridade, ação e medida aparecem primeiro; probabilidades, população,
incerteza, versão e evidências ficam em elementos `details`. Essa separação muda a
linguagem e a hierarquia visual, não os contratos ou regras do motor.

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
escopo da unidade, permitindo navegação macro→micro sem perder o recorte. O showcase
E2E cria sete participações — qualidade, gestão, produto, três de engenharia e
plataforma/operações — para cada cenário ruim, mediano e elite, percorre o
grafo em Chromium, valida a ordenação, imprime os caminhos e deixa a mesma base
servida para inspeção manual quando iniciado por `npm run demo`. O servidor interno
usado pelo Playwright fica isolado em `demo:serve`, evitando recursão entre scripts.

O serviço de inferência projeta sinais versionados do catálogo em uma ou mais folhas
da taxonomia. Essa projeção preserva o padrão de origem e permite efeitos cruzados
sem duplicar respostas. Cada folha calcula nível e confiança pelos pesos e cobertura
pela quantidade de padrões distintos; a classificação ignora folhas que ainda não
atingiram a cobertura mínima.

Na versão vigente, cada sinal do próprio catálogo contém obrigatoriamente as folhas
afetadas, a camada de evidência e o tipo de restrição. O catálogo não completa esses
campos por regex ou pelo nome do padrão. A inferência não possui leitura ou backfill
para formatos históricos.

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
compor qualquer inferência de maturidade.
