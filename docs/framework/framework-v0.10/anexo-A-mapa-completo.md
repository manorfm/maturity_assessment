# Anexo A — Mapa completo de capacidades

> Base: v0.4, com as lacunas reclassificadas na v0.5 em `[anexar: folha]`,
> `[rubrica]` e `[pesquisa]` (ver [03](03-mapa-de-capacidades.md)). A
> constituição foi para [02](02-constituicao.md), a pontuação para
> [05](05-modelo-estatistico.md), perguntas e triangulação para
> [07](07-desenho-de-perguntas.md) e as referências para
> [11](11-referencias.md). Os números de seção abaixo (§2 a §9) são internos a
> este anexo.

## 2. Meta-modelo

```text
CONTEXTO ORGANIZACIONAL (não pontua; muda interpretação e alvo)
  porte · a quem tecnologia se reporta · tradicional/digital/AI-first
  · setor regulado · sourcing · tipo de produto · geografia
        │
        ▼
RESULTADOS (o que a maturidade deveria produzir; preferir telemetria)
  fluxo · estabilidade · confiabilidade · valor · pessoas · custo · aprendizado
        ▲
        │ explicados por
DOMÍNIO → PILAR → CAPACIDADE → SUBCAPACIDADE     (árvore: navegação e ownership)
        ▲
        │ evidenciadas por (N:N — aqui nasce o grafo)
PRÁTICA (compatível, nunca obrigatória) ─── FAMÍLIA DE FERRAMENTA (habilitador)
        ▲
        │ observada como
SINAL / COMPORTAMENTO (positivo, frágil, ritual, bloqueio, divergência)
        ▲
        │ extraído de
EVENTO OBSERVADO (anamnese: "a última vez que…")  ← pergunta adaptativa por perfil
```

### 2.1 Tipos de aresta do grafo

| Aresta | Exemplo |
|---|---|
| `evidencia` | "Escala de pods feita de madrugada, à mão" **evidencia** capacidade/elasticidade, observabilidade/alertas, carga cognitiva, sustentabilidade |
| `amplifica` | Ausência de ownership **amplifica** recorrência de incidentes |
| `bloqueia` | Aprovação por comitê **bloqueia** integração frequente mesmo com infraestrutura pronta |
| `depende-de` | Análise de canary **depende de** SLIs confiáveis |
| `substitui` | Previsão probabilística **substitui** estimativa determinística em horas (prática datada → atual) |
| `contradiz` | Diretoria diz "postmortem blameless", a operação relata "quem errou é chamado" |

Um nó cinza, que pertence a mais de um pai, **não é duplicado**: ele tem um
**dono primário** (onde a intervenção mora) e arestas `evidencia` para os outros
pais. Na nota, a mesma resposta contribui para cada efeito uma única vez, sem
duplicar uma nota genérica (regra vigente no motor).

### 2.2 Contexto organizacional

O contexto não produz sinal de capacidade. Ele seleciona perguntas, ajusta o
**alvo** de maturidade e muda a leitura de um achado.

| Variável | Por que importa | Como muda a leitura |
|---|---|---|
| Porte e número de times | Coordenação cresce de forma não linear | Governança de portfólio pesada numa empresa de 1 time é desperdício; ausência dela com 40 times é risco |
| **A quem tecnologia se reporta** (CEO, CFO, COO, CDO, holding) | Define se TI é vista como centro de custo ou como produto | Sob o CFO, o viés esperado é de custo e controle: CAB, orçamento anual, projeto em vez de produto |
| Estágio digital: tradicional → digital → AI-first (MIT CISR: 4 estágios de IA) | O ponto de partida muda o caminho de transformação | Uma empresa tradicional com núcleo legado precisa de modernização antes de plataforma |
| Setor regulado | Existe segregação legítima | Aprovação proporcional e verificável não é fragilidade (regra vigente) |
| Sourcing (fornecedores, fábrica de software) | O conhecimento e o ownership podem estar fora | "Especialista externo como gargalo" vira hipótese provável |
| Tipo de produto (B2C digital, B2B, interno, embarcado) | Muda o valor de experimentação e de releases frequentes | Canary e testes A/B pesam mais em B2C de alto tráfego |
| **Momento organizacional** (reestruturação recente, fusão, demissões, troca de liderança, crescimento acelerado) | Clima e estrutura estão em transição | Divergência e baixa segurança podem ser efeito do momento, não traço estável; a leitura longitudinal ganha peso |
| **Modelo de gestão de desempenho** (metas individuais com bônus, OKR, ranking forçado, avaliação 360) | Define como indicadores são usados | Metas ligadas a bônus aumentam a probabilidade de indicador virar alvo (Goodhart, Austin) |

### 2.3 Resultados

Sem resultados, a maturidade vira opinião. O mapa separa os resultados que o
questionário pode sugerir daqueles que só telemetria confirma.

| Família | Indicadores de referência | Fonte preferida |
|---|---|---|
| Fluxo | lead time de mudança, frequência de deploy, tempo de ciclo, idade do WIP, throughput | Git/CI/CD/board |
| Estabilidade | taxa de falha de mudança, tempo de recuperação de deploy com falha, taxa de retrabalho (as 5 métricas DORA vigentes) | CI/CD + incidentes |
| Confiabilidade | cumprimento de SLO, consumo de error budget | Observabilidade |
| Valor | áreas-chave de valor do EBM (valor atual, valor não realizado, tempo até o mercado, capacidade de inovar) | Produto/negócio |
| Pessoas | bem-estar, burnout, intenção de saída, tempo até o primeiro deploy de um novato | Questionário + RH |
| Custo | custo por transação ou cliente (unit economics), desperdício de nuvem | FinOps |
| Aprendizado | recorrência de incidentes da mesma classe, ações de postmortem concluídas e efetivas | Registro de incidentes |
| **Direção** | % de pessoas que ligam o próprio trabalho a um objetivo da empresa, **nas palavras delas**; concordância entre níveis sobre as 3 prioridades; % do trabalho sem vínculo com objetivo | Questionário (pergunta aberta codificada) |
| **Organização** | rotatividade voluntária e lamentada, tempo até a produtividade de um novato, tempo de decisão entre áreas | RH + questionário |

> Regra mantida: categoria de performance DORA **só** com telemetria por
> aplicação ou serviço. A entrevista sugere, a telemetria confirma, e as duas
> leituras não se fundem.

---

## 3. Eixo de apropriação: da prática à filosofia

Os estágios do motor (0–4) medem **consistência do comportamento**. O mapa lhes
acrescenta uma leitura de **apropriação**: quão fundo a prática foi internalizada.
Os dois eixos são o mesmo estágio visto de dois ângulos. Não é uma segunda nota.

| Estágio (motor) | Apropriação | Crawl/Walk/Run | IBM DevOps | CNCF Plataforma | KMM (Kanban) | Pergunta-chave |
|---|---|---|---|---|---|---|
| **0 Opaco** | Ausente ou invisível | — | — | — | 0 Oblivious | Ninguém consegue reconstruir o que aconteceu |
| **1 Reativo** | **Ritual ou heroísmo**: a forma existe sem a função, ou a função existe só pelo esforço de alguém | Crawl | Practiced | Provisional | 1 Emerging | "Temos, mas…" |
| **2 Repetível** | **Mecânica**: segue procedimento; não adapta ao contexto | Walk | Consistent/Repeatable | Operational | 2 Defined | Funciona enquanto o caso é o típico |
| **3 Gerenciado** | **Entendida**: sabe o porquê, mede o efeito, adapta ao risco | Run | Reliable | Scalable | 3 Managed / 4 Quantitatively Managed | O efeito é medido e muda a decisão |
| **4 Adaptativo** | **Filosofia**: o princípio passa a valer em outras áreas; o time reinventa a prática e ensina outros | Fly | Scaled/Optimized | Optimizing | 5 Optimizing / 6 Congruent | O princípio aparece onde ninguém mandou aplicar |

**Teste da filosofia:** a prática sobrevive e se transfere? Um time com filosofia
de redução de risco por exposição progressiva não faz só canary de código. Faz
rollout gradual de configuração, de migração de banco, de mudança de preço e até
de mudança organizacional. É a **generalização espontânea do princípio** que
caracteriza o estágio 4.

### 3.1 Escadas de apropriação: exemplos trabalhados

Cada escada mostra o comportamento observável por estágio e a pergunta de evento
que o discrimina, sem citar o nome da prática. As escadas viram rubricas
(`CapabilityReference`) e trilhas do grafo adaptativo.

#### A. Exposição progressiva (canary) — folha `release-feedback`

| Estágio | Comportamento observado |
|---|---|
| 0 | Deploy para 100% de uma vez; ninguém sabe dizer quando a versão chegou aos usuários |
| 1 | Policy de canary configurada, mas a promoção é **por tempo** ("espera 30 min e sobe"); ninguém olha nada; ou alguém "fica de olho no dashboard" por heroísmo |
| 2 | Alguém compara métricas antes e depois do deploy seguindo um checklist; a comparação é **temporal**, o que o SRE Workbook aponta como armadilha (o tempo é a maior fonte de variação) |
| 3 | Comparação **canary × controle** simultânea, com poucas métricas ligadas a SLI; a promoção é interrompida automaticamente; a janela e o tamanho do canary cobrem o pico de carga |
| 4 | O princípio se generaliza: flags, migrações de dados e mudanças de configuração também saem progressivamente; resultados de canary abortado retroalimentam testes e arquitetura; o time ajusta métricas quando o canary é "ruidoso" |

**Pergunta de evento:** "Na última mudança relevante, o que fez ela passar de
poucos usuários para todos?" (tempo decorrido · alguém olhou um painel ·
comparação automática com a versão atual · não houve etapa intermediária · não
observo). **Aprofundamento:** "Nos últimos meses, alguma promoção foi
interrompida? O que mudou depois?"

#### B. Aprendizado com incidente (postmortem) — folhas `incident-management`, `organizational-learning`

| Estágio | Comportamento observado |
|---|---|
| 0 | Incidente resolvido e esquecido; não há registro |
| 1 | Documento de postmortem existe (ritual); participam 2–3 pessoas do time que "causou"; a ação é "tomar mais cuidado" ou "treinar a pessoa"; ou só existe revisão quando a diretoria cobra |
| 2 | Template seguido; causa raiz única; ações registradas, mas poucas concluídas |
| 3 | Revisão sem culpa, com fatores contribuintes; participam as áreas afetadas (produto, suporte, plataforma); ações têm dono e prazo e são revisadas; quase-incidentes também são estudados |
| 4 | Incidentes de outras áreas e de outras empresas são estudados; padrões recorrentes mudam arquitetura, plataforma e política; relatos são lidos voluntariamente; as pessoas **pedem** para contar seus erros |

**Sinais cruzados:** poucas pessoas participando → segurança psicológica,
ownership, visibilidade. O mesmo erro em várias áreas → falta de canal de
aprendizado entre times, plataforma sem guardrail, conhecimento concentrado.
**Pergunta de evento:** "No último incidente que você acompanhou, quem estava na
conversa depois que o serviço voltou? O que mudou no trabalho nas semanas
seguintes?"

#### C. Capacidade e elasticidade — folhas `cloud-efficiency`, `reliability-practice`

| Estágio | Comportamento observado |
|---|---|
| 0 | Réplicas fixas; ninguém sabe a capacidade máxima |
| 1 | Alguém é acionado de madrugada para aumentar pods ou máquinas (heroísmo); ou autoscaling configurado com mínimo = máximo (ritual) |
| 2 | Autoscaling por CPU com limites definidos; picos sazonais tratados com pré-escala manual agendada |
| 3 | Escala por sinal de demanda (fila, RPS, latência), testada com carga; custo por transação acompanhado; o limite de escala considera dependências (banco, terceiros) |
| 4 | Capacidade tratada como produto: previsão de demanda com negócio, testes de caos e de carga contínuos, custo e emissão otimizados; o aprendizado vira caminho padrão na plataforma |

**Sinais:** "Entrar de madrugada para escalar" também evidencia alertas não
acionáveis, carga cognitiva, bem-estar e falta de ownership. Nuvem que "sobe
indiscriminadamente", sem tag nem dono, evidencia governança de custo e
autosserviço sem guardrail.

#### D. Investigação operacional (troubleshooting) — folha `observability-practice`

| Estágio | Comportamento observado |
|---|---|
| 0 | Problema chega pelo cliente; não há logs acessíveis |
| 1 | Para investigar, alguém pede acesso ao cluster, **baixa o arquivo de log do pod** ou pede ao SRE; só 1–2 pessoas conseguem investigar |
| 2 | Logs centralizados, mas sem correlação; busca por texto; cada serviço com formato próprio |
| 3 | Telemetria estruturada e correlacionada (trace id atravessa serviços); o dev consegue ir do sintoma ao deploy que causou; alertas por sintoma e SLO |
| 4 | Telemetria usada para decisões de produto e arquitetura; o time instrumenta antes de lançar; investigação é aprendida por todos, inclusive novatos |

**Pergunta de evento:** "Na última vez que um comportamento estranho apareceu em
produção, quais foram os passos até descobrir onde estava?" (reconstruir a
sequência, não perguntar a ferramenta).

#### E. Fluxo visível (Kanban, CFD) — folhas `work-management`, `planning-refinement`

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há board, ou o board não corresponde ao trabalho real |
| 1 | Board com colunas, sem políticas; WIP ilimitado; CFD existe na ferramenta e ninguém abre (ritual) |
| 2 | Limites de WIP definidos, mas estourados sem conversa; métricas lidas em média ("o ciclo médio é 8 dias") |
| 3 | Idade do item em progresso discutida diariamente; o CFD é lido para achar gargalo (faixa que se alarga) e lote (degraus); previsão probabilística com base no throughput; bloqueios têm política |
| 4 | Fluxo gerenciado entre times (upstream e downstream); políticas explícitas evoluem por experimento; o conceito de fluxo é aplicado ao portfólio e à discovery |

**Leitura do CFD como pergunta de letramento:** mostrar um CFD sintético e
pedir a interpretação ("o que você faria na segunda-feira?"). As opções
discriminam: faixa de "em teste" crescendo (gargalo) · linhas paralelas (fluxo
estável) · degraus (lote) · linha de "concluído" plana (nada entrega). Quem não
sabe o nome "CFD" pode acertar a leitura.

#### F. Leitura de indicadores (letramento em variação) — `[rubrica]` → D12 Direção, desempenho e aprendizado

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há indicadores |
| 1 | Dashboard existe; reuniões reagem a cada ponto ("subiu 3%, o que houve?"); médias escondem caudas; ninguém sabe o que é um outlier (ritual) |
| 2 | Metas fixas por indicador; semáforo verde, amarelo e vermelho; o indicador vira meta e começa a ser manipulado (Goodhart/Campbell) |
| 3 | Distinção entre variação comum e especial (gráficos de controle, percentis); outliers investigados como caso; indicadores pareados para evitar otimização local (velocidade + qualidade) |
| 4 | Indicadores revisados e aposentados quando perdem sentido; hipóteses escritas antes de olhar o dado; o raciocínio estatístico aparece em decisões de produto, incidente e pessoas |

**Pergunta:** mostrar uma série de lead time com um ponto extremo e perguntar o
que fazer (investigar o caso · mudar a meta · reclamar com o time · ignorar ·
olhar o percentil). É uma pergunta de conhecimento, marcada como camada
**Conhecimento**, não Prática.

#### G. Integração operacional → analytics — `[rubrica]` → Dados, analytics e IA

| Estágio | Comportamento observado |
|---|---|
| 0 | Relatórios feitos à mão em planilha exportada do sistema |
| 1 | Analytics lê **direto do banco de produção** (ou de uma réplica sem contrato); dumps noturnos; mudança de schema quebra relatório e ninguém sabe |
| 2 | ETL batch agendado para data warehouse; dono do pipeline é o time de dados, que descobre mudanças depois |
| 3 | Eventos ou CDC publicados com **contrato de dados** versionado; o produtor é responsável pelo significado; testes de qualidade no pipeline; métricas com definição única (camada semântica) |
| 4 | Dados como produto por domínio (data mesh quando o porte justifica); experimentação e decisões de produto consomem dados quase em tempo real; mudanças de schema seguem o fluxo de entrega |

**Por que diz muito do ambiente:** o formato da integração revela acoplamento,
ownership, contrato, confiança na informação e o tempo entre o fato e a decisão.
"Dois dashboards com números diferentes para a mesma métrica" é um sinal clássico.

#### H. Aprovação de mudança — folha `enabling-governance`

| Estágio | Comportamento observado |
|---|---|
| 0 | Mudanças vão para produção sem que se saiba quem decidiu |
| 1 | **10 pessoas aprovam**; comitê semanal (CAB) para toda mudança; aprovação vira carimbo, e quem aprova não sabe o que aprova |
| 2 | Aprovação por tipo de mudança; mudanças padrão pré-aprovadas, mas o formulário é o mesmo |
| 3 | Revisão por par e controles automatizados no pipeline (evidência gerada pela própria entrega); aprovação humana só para risco alto; exceções com validade |
| 4 | O controle é medido pela eficácia (quantos problemas evitou versus espera que gerou) e é removido quando não agrega; auditoria consome evidência automatizada |

**Literatura:** *Accelerate* mostrou que aprovação externa (CAB) se associa a
pior desempenho de entrega e não a mais estabilidade.

#### I. Cerimônias e autonomia do time — `[rubrica]` → D10 Estrutura / `work-management`

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há ritmo de sincronização |
| 1 | A daily só acontece se o Scrum Master convocar; vira reporte de status para o gestor; a retrospectiva repete os mesmos itens |
| 2 | Ritos acontecem sozinhos, seguindo o guia; formato nunca muda |
| 3 | O time adapta ou elimina ritos pelo efeito; a daily olha o fluxo (itens parados), não as pessoas; a retro gera experimento com revisão |
| 4 | O time governa o próprio processo; o papel de facilitador rotaciona ou desaparece; o método é explicado pelos princípios (empirismo, fluxo), não pelo framework |

**Sinal de "agilidade sem agilidade":** ritos completos, mas a data e o escopo
são fixados antes da discovery e o time não pode mudar a ordem do backlog. O
foco é o sistema, não o time.

#### J. IA no trabalho — folha `technical-capability` + `[pesquisa]` IA

| Estágio | Comportamento observado |
|---|---|
| 0 | Uso proibido ou invisível (uso "na sombra") |
| 1 | Licenças compradas; mede-se "% de adoção" e linhas geradas; não há política clara; a sensação de produtividade não aparece no lead time |
| 2 | Uso em tarefas locais (autocomplete, testes); revisão humana padrão; política de dados definida |
| 3 | Contexto interno acessível à IA (documentação, código, decisões); o efeito é medido em resultado (ciclo, retrabalho, defeitos); o time sabe onde a IA piora o trabalho |
| 4 | Processos redesenhados em torno de agentes com escopo, identidade e rastreabilidade; a IA reduz gargalos sistêmicos (descoberta de informação, revisão), não só a digitação |

**Crença × fato:** no RCT do METR (2025), desenvolvedores experientes ficaram
**19% mais lentos** com IA, mas **acreditavam ter ficado 20% mais rápidos**. É o
exemplo perfeito do tipo de divergência que o produto deve capturar,
confrontando a percepção declarada com o fluxo observado.

### 3.2 Escadas organizacionais (novas na v0.4)

Estas escadas observam a **organização**: como ela direciona, mede,
escuta, desenha times e aprende. Uma área pode ter plataforma no estágio 4 e
estar no estágio 1 aqui. O índice precisa mostrar as duas coisas (02 §3, item 8).

#### K. Desdobramento estratégico (estratégia → tático → operacional) — `[rubrica]` → D12

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há estratégia comunicada; o trabalho chega como pedido |
| 1 | OKRs existem (ritual), mas são **cascateados** de cima como lista de entregas; o dev não sabe dizer qual objetivo o trabalho da semana atende; o trimestre termina com "OKR 70% concluído" e nada muda |
| 2 | Objetivos por área, com key results mensuráveis; o vínculo entre objetivo e iniciativa é documentado, mas definido só pelo nível de cima |
| 3 | **Negociação nos dois sentidos** (catchball do Hoshin Kanri): o time propõe como contribuir e sobe restrições. Key results medem resultado, não entrega. A intenção (o porquê) acompanha o objetivo, e o time tem autonomia no como (Bungay). A coordenação entre áreas é explícita |
| 4 | A estratégia é revisada por evidência vinda de baixo; objetivos são abandonados quando a hipótese cai; qualquer pessoa explica o porquê das prioridades com as próprias palavras; alinhamento lateral entre áreas é rotina |

**Pergunta de evento:** "Pense no trabalho mais importante que você fez na
última semana. A que ele serve, com suas palavras?" É aberta e codificada, e a
comparação com a resposta da diretoria mede a **distância de compreensão**.
**Aprofundamento:** "Na última vez que um objetivo deixou de fazer sentido no meio
do ciclo, o que aconteceu?" (continuou até o fim · foi renegociado · ninguém
percebeu · não observo).
**Literatura:** Sull, Homkes & Sull (2015): o gargalo é a coordenação lateral, e a
comunicação precisa medir compreensão. Bungay: lacunas de conhecimento,
alinhamento e efeito. Hoshin Kanri: catchball. Doerr e Grove: OKR.

#### L. Indicador como termômetro, não como meta; meta não atingida — `[rubrica]` → D12

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há indicadores nem metas |
| 1 | O indicador **é** a meta, ligada a bônus ou cobrança; aparecem contornos (fechar ticket e reabrir outro, teste sem asserção, incidente reclassificado). **Meta não atingida → "precisamos de mais produtividade", mais horas ou troca de pessoa** |
| 2 | Metas revisadas periodicamente; a falha gera plano de ação, mas o plano é "fazer mais do mesmo" |
| 3 | Indicador usado como **informação** sobre o sistema (Austin): meta não atingida abre a pergunta "que comportamento, conhecimento ou condição faltou?". Para trabalho novo ou complexo, **metas de aprendizado** substituem metas de desempenho (Seijts & Latham); indicadores vêm em pares para evitar otimização local |
| 4 | A organização separa explicitamente medir para entender de medir para recompensar; indicadores que viraram alvo são aposentados; resultados abaixo do esperado geram experimentos e aprendizado compartilhado, e quem reporta má notícia é protegido |

**Pergunta de evento:** "Na última vez que um objetivo importante do seu time não
foi atingido, qual foi a primeira conversa?" (pediram mais esforço ou horas ·
buscaram quem falhou · perguntaram o que faltou saber ou fazer · mudaram a meta
sem entender · ninguém falou disso · não observo).
**Sinal de Goodhart:** "Você já viu alguém fazer algo que melhorava o número,
mas não o resultado?" (frequência + exemplo, agregado).
**Literatura:** Austin (1996): medição informativa × motivacional. Kerr (1975),
Ordóñez et al. (2009), Deming (pontos 11 e 12), Muller (2018), Rother (*Toyota Kata*).

#### M. Voz e escuta — `[rubrica]` → D11

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há espaço para opinião; decisões são comunicadas prontas |
| 1 | Existem canais (pesquisa de clima, caixa de sugestão, retro), mas nada muda: as pessoas calam por **futilidade** ("não adianta"), mais do que por medo. Ou só falam os seniores ou os próximos do líder |
| 2 | Opiniões são ouvidas em fóruns formais; o retorno sobre o que foi feito é raro |
| 3 | Discordância é pedida antes da decisão; as pessoas veem o efeito do que disseram (o ciclo se fecha); o júnior fala em reunião técnica; má notícia sobe rápido |
| 4 | Discordar é esperado e reconhecido; decisões registram as objeções e são revistas quando a objeção se confirma; a liderança muda de posição publicamente |

**Pergunta de evento:** "A última vez que você discordou de uma decisão que
afetava seu trabalho: você falou? Se falou, o que aconteceu? Se não, por quê?"
(não achei que mudaria algo · risco para mim · não havia espaço · falei e mudou ·
falei e não houve retorno).
**Literatura:** Edmondson (1999); Morrison (2014) sobre voz e silêncio; Detert &
Burris (2007); Milliken et al. (2003).

#### N. Desenho do time — `[team-ownership]` + `[rubrica]` → D10

| Estágio | Comportamento observado |
|---|---|
| 0 | "Time" é agrupamento de pessoas alocadas a projetos; ninguém sabe quem está nele |
| 1 | Fronteira instável (pessoas emprestadas, realocação a cada trimestre); propósito vago; responsabilidade sem autoridade: o time responde pelo resultado, mas não decide prioridade, arquitetura ou pessoas |
| 2 | Times estáveis com propósito escrito; autoridade parcial; a composição foi feita por disponibilidade, não pelas habilidades necessárias |
| 3 | As **seis condições** de Hackman atendidas: time real (fronteira, interdependência, estabilidade), direção convincente, pessoas certas (habilidades e tamanho), estrutura habilitadora (tarefa, normas), contexto de apoio (informação, recursos, recompensa ao time) e coaching disponível. **Autonomia e responsabilidade andam juntas** |
| 4 | A organização redesenha times a partir de evidência (carga cognitiva, dependências, fluxo); o time participa do desenho; a estrutura muda com a estratégia, não por política |

**Pergunta de evento:** "Nos últimos 3 meses, quantas vezes mudou quem faz parte
do seu time?" · "Na última decisão importante sobre o que o time faria, quem
decidiu?" · "Se o resultado do time não for atingido, quem responde?" A
comparação entre as duas últimas mostra **responsabilidade sem autoridade**.
**Literatura:** Hackman (2002), Wageman, Hackman & Lehman (2005, TDS), regra
60/30/10; Skelton & Pais (2019).

#### O. Pessoa certa na função certa; tolerância a disfunção — `[pesquisa]` → D11

> **P2 e P8:** esta escada observa **decisões do sistema** (como promove, aloca e
> trata disfunções), nunca uma pessoa específica.

| Estágio | Comportamento observado |
|---|---|
| 0 | Não se sabe o que se espera de cada papel |
| 1 | Promoção como recompensa: o melhor técnico vira gestor sem preparo (efeito Peter); posições estratégicas ocupadas por proximidade; **disfunção conhecida é tolerada** por anos ("todo mundo sabe") e o time se adapta para baixo |
| 2 | Papéis e níveis descritos; trilha técnica existe no papel; disfunções tratadas só quando viram crise |
| 3 | Trilhas técnica e de gestão com o mesmo prestígio; a escolha para funções estratégicas considera a função, não o cargo; disfunções têm conversa cedo, com feedback e apoio, e desligamento quando necessário, tratado com respeito; o time percebe justiça no processo |
| 4 | A organização aprende com decisões de pessoas (promoções que não funcionaram, estruturas que falharam); posições são redesenhadas para a estratégia; o time participa de contratações |

**Pergunta de evento (sistema, não pessoa):** "Na última vez que um
comportamento prejudicava o time de forma recorrente, quanto tempo levou até
algo mudar?" (semanas · meses · nunca mudou · a pessoa foi promovida · não
observo). · "A última promoção ou escolha de liderança que você acompanhou foi
por qual razão, até onde se sabe?"
**Literatura:** Felps, Mitchell & Byington (2006): *bad apples*. Housman & Minor
(2015): custo do trabalhador tóxico. Benson, Li & Shue (2019): promoção do
melhor vendedor. Colquitt (2001): justiça organizacional.

#### P. Melhorar o sistema × apertar parafusos — `[organizational-learning]` + `[rubrica]` → D12

| Estágio | Comportamento observado |
|---|---|
| 0 | Todo o tempo é consumido por demanda e incidente; ninguém sabe quanto |
| 1 | "Apertar parafusos" o tempo todo: toil, retrabalho e urgências; melhorias só nas horas vagas ou por heroísmo; as pessoas executam tarefas sem saber o porquê |
| 2 | Tempo reservado para melhoria (% da sprint, "tech day"), frequentemente sacrificado pela urgência |
| 3 | Melhoria do sistema é trabalho de primeira classe: tem dono, entra no fluxo, tem efeito medido (menos toil, menos recorrência); as pessoas entendem o porquê do trabalho |
| 4 | A organização trabalha **no** sistema, não só **dentro** dele (Deming): aprender é parte do trabalho diário (Toyota Kata); o tempo de toil cai de forma sustentada; ideias de melhoria vêm de todos os níveis |

**Pergunta de evento:** "Na última semana, que parte do seu tempo foi em trabalho
que você já fez igual antes (repetido, manual ou retrabalho)?" (faixas) · "A
última melhoria que você propôs: o que aconteceu com ela?"
**Literatura:** Google SRE (toil ≤ 50%); Repenning & Sterman (2001), "Nobody Ever
Gets Credit for Fixing Problems that Never Happened" (a armadilha da capacidade);
Deming; Rother; Argyris (aprendizado de circuito duplo).

---

## 4. Catálogo de sinais: o grafo navegável

Cada linha é um **comportamento observável** que a anamnese pode reconstruir.
Ele evidencia várias capacidades (as arestas do grafo) e abre **hipóteses
concorrentes**, que o aprofundamento precisa discriminar antes de publicar causa.

| # | Sinal observado | Quem costuma ver | Capacidades evidenciadas (dono primário **em negrito**) | Hipóteses concorrentes a discriminar |
|---|---|---|---|---|
| S01 | Infra pronta para trunk-based, mas branches duram dias ou semanas | Dev, tech lead | **Integração contínua** · revisão de código · testes automatizados · governança | medo por falta de testes · revisão lenta (fila de PR) · release por pacote exigido pelo negócio · falta de feature flag · hábito sem conhecimento |
| S02 | Vários times alteram o mesmo serviço | Dev, arquiteto | **Estrutura e ownership** · alinhamento ao domínio · evolutibilidade · colaboração | serviço "shared" sem dono · limite de domínio errado · reorganização recente · plataforma disfarçada de serviço |
| S03 | Atividades chegam sem refinamento ou como solução pronta | Dev, QA, PO | **Planejamento e refinamento** · descoberta · portfólio · relação com negócio | PO sem autonomia · demanda por projeto e data fixa · discovery inexistente · pressão de urgência |
| S04 | A daily só acontece com o Scrum Master | Todos | **Método e autonomia do time** · liderança · colaboração | time recém-formado (Tuckman) · rito como reporte a gestor · baixa segurança psicológica · rito sem utilidade percebida |
| S05 | Ninguém sabe onde está o gargalo | Gestão, PO | **Fluxo de trabalho** · letramento em indicadores · visibilidade | board não reflete o trabalho · trabalho invisível (suporte, incidentes) · métrica só de pessoas |
| S06 | Dashboard existe, mas ninguém o lê ou sabe o que é um outlier | Gestão, dados | **Letramento em indicadores** · observabilidade · decisão por evidência | indicador sem pergunta · excesso de métricas · métrica punitiva · falta de formação |
| S07 | Para investigar é preciso baixar o log do pod ou pedir a alguém | Dev, SRE | **Observabilidade** · autonomia de plataforma · identidade e acesso · competência técnica | telemetria sem correlação · acesso restrito por segurança sem alternativa · conhecimento concentrado |
| S08 | Mudança precisa de 10 aprovações | Dev, gestão | **Governança habilitadora** · release · fluxo · segurança | exigência regulatória real · incidente passado que gerou trauma · controle sem medição de eficácia |
| S09 | Canary configurado, mas a promoção é por tempo | SRE, dev | **Release e feedback** · confiabilidade (SLI) · observabilidade | SLI inexistente · métricas ruidosas · pressa · a prática foi copiada sem o propósito |
| S10 | Alguém entra de madrugada para aumentar pods | SRE, plataforma | **Eficiência / capacidade** · confiabilidade · clima e bem-estar · ownership | autoscaling ausente ou mal configurado · gargalo em dependência que não escala · alerta sem runbook |
| S11 | Nuvem cresce sem tag, dono nem custo conhecido | Plataforma, finanças | **FinOps / custo** · autosserviço com guardrail · governança | autosserviço sem guardrail · falta de dono · custo invisível ao time |
| S12 | Postmortem com poucas pessoas | SRE, gestão | **Aprendizado organizacional** · incidentes · clima · colaboração | culpa implícita · incidente visto como "problema da infra" · agenda cheia · ações nunca concluídas desmotivam |
| S13 | O mesmo erro aparece em várias áreas | Suporte, SRE, QA | **Aprendizado organizacional** · plataforma (guardrail) · padrões técnicos · gestão de conhecimento | aprendizado não circula entre times · componente comum sem dono · biblioteca copiada, não compartilhada |
| S14 | Analytics lê direto do banco de produção | Dados, dev | **Integração operacional-analítica** · contratos de dados · evolutibilidade · segurança de dados | falta de plataforma de dados · time de dados sem acesso a eventos · urgência histórica que virou padrão |
| S15 | Dois dashboards dão números diferentes para a mesma métrica | Gestão, dados | **Semântica e qualidade de dados** · decisão por evidência · colaboração | definição não compartilhada · cópias de pipeline · ownership difuso |
| S16 | Velocity usada para comparar times | Gestão, dev | **Letramento em indicadores** · liderança · método | pressão por "produtividade" · falta de métrica de resultado · confusão entre esforço e valor |
| S17 | Hotfix pula a esteira | Dev, SRE | **Release** · governança · qualidade | esteira lenta demais · esteira quebrada · cultura de urgência |
| S18 | Fila para ambiente de homologação compartilhado | Dev, QA | **Autonomia de plataforma** · fluxo · estratégia de qualidade | ambientes caros ou manuais · teste dependente de ambiente integrado · QA como fase |
| S19 | QA como etapa final, com "fase de testes" | QA, dev | **Estratégia de qualidade** · fluxo · competência técnica | testabilidade baixa · estrutura por função · contrato com fábrica de software |
| S20 | Diretoria acha que a IA acelerou; o lead time não mudou | Gestão, dev | **Postura de IA** · letramento em indicadores · fluxo | gargalo fora do código (revisão, ambiente, aprovação) · percepção versus fato (METR) · adoção nominal |
| S21 | One-on-one cancelado ou usado só para status | Dev, gestão | **Liderança e gestão** · carreira · clima | gestor com muitos liderados · 1:1 sem propósito claro · cultura de urgência |
| S22 | Novato leva semanas até o primeiro deploy | Novato, tech lead | **Onboarding e sucessão** · plataforma · documentação · carga cognitiva | ambiente local complexo · acessos manuais · conhecimento tácito |
| S23 | O júnior descreve a prática sem saber o nome, ou não sabe descrevê-la | Júnior | Capacidade da prática em questão · competência acessível · mentoria | a prática existe e é tácita (bom) · a prática não existe · o júnior está isolado do fluxo |
| S24 | Plano entregue "no verde" até a véspera, e então vermelho (*watermelon*) | Gestão, PMO | **Previsão e comunicação** · clima · governança de execução | medo de reportar risco · status por opinião, não por fluxo · incentivo à data |
| S25 | Decisão arquitetural refeita a cada novo líder | Arquiteto, dev | **Decisões arquiteturais** · gestão de conhecimento · liderança técnica | decisões sem registro · direito de decisão difuso · rotatividade |
| S26 | Feature flag nunca removida | Dev | **Sustentabilidade da mudança** · release · dívida técnica | falta de ciclo de vida da flag · flag usada como configuração permanente |
| S27 | O time de plataforma vira fila de tickets | Dev, plataforma | **Autonomia de plataforma** · topologia de times · carga cognitiva | plataforma sem estratégia de produto · falta de autosserviço · pouca gente |
| S28 | Experimento A/B sem hipótese nem critério prévio | Produto, dados | **Descoberta e validação** · letramento · dados | pressão para "provar" · falta de infraestrutura de experimentação · desconhecimento de poder estatístico |
| S29 | O dev não sabe dizer a que objetivo seu trabalho serve | Dev, júnior | **Desdobramento estratégico** · comunicação · voz | estratégia inexistente · cascata de tarefas · comunicação medida por envio, não por compreensão · gestor intermediário sem clareza |
| S30 | Diretoria e times citam prioridades diferentes | Todos | **Desdobramento estratégico** · governança de execução · portfólio | prioridades demais · mudança recente não comunicada · prioridades locais de cada área em conflito |
| S31 | Meta não atingida → pedido de mais horas ou troca de pessoa | Dev, gestão | **Indicador como termômetro** · liderança · clima | cultura de esforço · falta de leitura do sistema · pressão de cima sem espaço para análise |
| S32 | Números melhoram, resultado não (Goodhart visível) | Todos | **Indicador como termômetro** · letramento · clima | meta ligada a bônus · indicador incompleto · medo de reportar |
| S33 | OKR com key results que são entregas ("lançar X") | Produto, gestão | **Desdobramento estratégico** · direção de produto | OKR como ritual · falta de métrica de resultado · planejamento por projeto |
| S34 | Pesquisa de clima respondida, nada muda, e a participação cai | Todos | **Voz e escuta** · liderança · aprendizado | ciclo de retorno ausente · ações centralizadas no RH · futilidade |
| S35 | Só seniores falam nas reuniões técnicas | Júnior, pleno | **Voz e escuta** · clima · competência acessível | hierarquia implícita · baixa segurança psicológica · formato de reunião |
| S36 | Pessoas emprestadas entre times a cada trimestre | Gestão, dev | **Desenho do time** · carga cognitiva · ownership | alocação por projeto · escassez de especialistas · financiamento por projeto |
| S37 | O time responde pelo resultado, mas não decide prioridade | Tech lead, gestão | **Desenho do time** (autoridade × responsabilidade) · governança · direitos de decisão | PO sem poder · decisão centralizada · desconfiança da liderança |
| S38 | Disfunção conhecida tolerada por muito tempo | Todos | **Tolerância a disfunção** · liderança · clima · rotatividade | conflito evitado · pessoa protegida por resultado individual · falta de processo de feedback |
| S39 | Melhor técnico promovido a gestor e o time piora | Dev, gestão | **Pessoa-função** · carreira (trilha técnica) · liderança | só existe trilha de gestão · promoção como recompensa · falta de preparo |
| S40 | Melhorias propostas nunca entram no fluxo | Dev, SRE | **Melhorar o sistema** · voz · portfólio | capacidade 100% alocada em demanda · melhoria sem dono · armadilha da capacidade |
| S41 | Saída de pessoas-chave sem que a liderança percebesse antes | Gestão, RH | **Sucessão e retenção** · clima · voz · 1:1 | 1:1 inexistente ou de status · sinais ignorados · concentração de conhecimento |
| S42 | Bônus individual por métrica de time ou de entrega | Gestão, RH | **Indicador como termômetro** · colaboração · desenho do time | modelo de desempenho herdado · recompensa individual × trabalho interdependente (Sull: 2–3× mais peso ao individual) |

**Como o grafo aparece na UI:** ao abrir uma capacidade, a pessoa vê os sinais
que a evidenciaram. Ao abrir um sinal, vê todas as capacidades que ele toca. O
drill-down "até não poder" termina no **evento reconstruído** (anonimizado e
agregado), que é a evidência primária.

---

## 5. Árvore de capacidades v0.4

### 5.0 Duplicações da v0.2 e como foram resolvidas

| Tema duplicado na v0.2 | Onde estava | Dono primário | Aresta para |
|---|---|---|---|
| Entrada e qualificação de demanda | D1 Portfólio **e** D3 Prontidão | **D3 Fluxo e entrega** (entrada no fluxo) | D1 mantém só *composição de portfólio* |
| Governança habilitadora | D1 Governança de valor **e** D8 | **D10 Estrutura, governança e colaboração** | D1 mantém *realização de benefícios* |
| Colaboração produto–engenharia | D2 **e** D8 | **D2 Produto** (trio de decisão) | D10 mantém negócio–tecnologia e ecossistema |
| Disseminação de conhecimento | D4 **e** D8 | **D12** (conhecimento organizacional) | D4 mantém *competência técnica* |
| Incidente e recuperação | D6 **e** D7 | **D8 Operação** (técnico) · **D9 Segurança** (incidente de segurança e continuidade de negócio) | aresta `depende-de` entre ambos |
| Observação pós-release | D3 **e** D6 | **D3** (decisão de release, canary) | D8 fornece telemetria (`depende-de`) |

### 5.1 Legenda

- `[folha-id]`: capacidade coberta por uma das 29 folhas do motor.
- `[anexar: folha-id]`: o tema cabe numa folha existente; basta acrescentar
  comportamentos à rubrica dela e criar perguntas. Não exige pesquisa nova.
- `[rubrica]`: literatura madura; falta autoria (rubrica 0–4, eventos, perguntas,
  entrevista cognitiva) para virar folha ou subfolha.
- `[pesquisa]`: evidência ainda em formação ou desafio de método/ética; exige
  pesquisa antes da autoria (03 §4).
- `↔`: principais arestas para outros domínios.
- Subcapacidades separadas por `·`. As da v0.2 foram mantidas quando não há
  observação em contrário; **novidades em negrito**.

```text
Sistema de capacidades de tecnologia
Resultado: criar, evoluir e operar produtos e serviços digitais de valor,
confiáveis, seguros, sustentáveis — e aprender mais rápido que o contexto muda.
```

### D1. Direção, valor e investimento → pilar do motor `product-value`

```text
├─ Estratégia e resultados
│  ├─ Intenção estratégica de tecnologia            [product-direction]
│  │    tese e diferenciação · horizonte e cenários · princípios e restrições
│  │    · **tese de transformação (tradicional → digital → AI-first)**
│  ├─ Resultados e objetivos                        [product-direction]
│  │    resultados de cliente/negócio/tecnologia · ligação objetivo→iniciativa · guardrails
│  └─ Alinhamento e revisão da direção              [product-direction]
│       tradução para produtos e plataformas · comunicação de trade-off · revisão por evidência
├─ Portfólio
│  ├─ Composição e balanceamento                    [portfolio-management]
│  │    crescimento × sustentação × modernização · concentração de risco · limite de compromisso
│  ├─ Gestão de iniciativas                         [portfolio-management]
│  │    revisão e replanejamento · **o que para quando algo entra** · encerramento
│  └─ **Modelo de financiamento**                   [anexar: portfolio-management]
│       projeto × produto/time estável · orçamento anual × incremental ↔ D10 governança
├─ Economia e priorização
│  ├─ Avaliação de valor e custo de atraso          [portfolio-management]
│  ├─ Custo tecnológico e unit economics            [anexar: cloud-efficiency] ↔ D7 FinOps
│  └─ Priorização transparente                      [portfolio-management]
│       critérios explícitos · direitos de decisão · tratamento de urgência
└─ Realização de benefícios
   ├─ Linha de base e resultado observado           [anexar: product-direction]
   ├─ Responsabilidade pelo benefício após a entrega [anexar: product-direction]
   └─ Aprendizado de investimento (realocação por evidência) [portfolio-management]
```

### D2. Produto, serviço e cliente → `product-value`

```text
├─ Conhecimento de cliente e contexto
│  ├─ Segmentação e contexto de uso                 [discovery-validation]
│  ├─ Entendimento de problemas e jornadas          [discovery-validation]
│  └─ Pesquisa contínua                             [anexar: discovery-validation]
├─ Descoberta e experimentação
│  ├─ Formulação de oportunidades                   [discovery-validation]
│  ├─ Hipóteses e riscos (valor, usabilidade, viabilidade, negócio) [discovery-validation]
│  ├─ Experimentação                                [discovery-validation] ↔ D6 dados
│  │    desenho e critério prévio · **poder estatístico e tamanho de amostra** · leitura honesta
│  └─ Convergência de decisão de produto            [product-direction]
├─ Design de solução e serviço
│  ├─ Design de serviço ponta a ponta               [pesquisa]
│  ├─ Experiência, erro e recuperação               [rubrica]
│  └─ Acessibilidade e prontidão                    [pesquisa]
├─ Ciclo de vida de produto
│  ├─ Evolução orientada a resultado                [product-direction]
│  ├─ Feedback de produto e serviço                 [discovery-validation] ↔ D3 feedback
│  └─ Transição e descontinuação                    [anexar: product-direction]
└─ Trio de decisão (produto, design, engenharia)
   ├─ Participação precoce e desafio de premissas   [collaboration]
   ├─ Demanda como intenção, não como solução pronta [discovery-validation]
   └─ Direito de retorno à discovery                [planning-refinement]
```

### D3. Fluxo e entrega → `delivery-flow`

```text
├─ Entrada e prontidão
│  ├─ Entrada e triagem de demanda                  [planning-refinement]
│  ├─ Entendimento compartilhado (exemplos, critérios, exceções) [planning-refinement]
│  ├─ Prontidão técnica e de risco                  [planning-refinement]
│  └─ Fatiamento em incremento útil                 [planning-refinement]
├─ Fluxo de trabalho
│  ├─ Visibilidade real do fluxo                    [work-management]
│  │    board = trabalho real · trabalho invisível · idade e bloqueio
│  ├─ WIP, puxar e terminar                         [work-management]
│  ├─ **Métricas de fluxo e sua leitura**           [work-management] ↔ D12 letramento
│  │    tempo de ciclo em percentis · throughput · idade do WIP · **CFD** · eficiência de fluxo
│  │    · Lei de Little e suas premissas
│  ├─ Classes de serviço e trabalho urgente         [work-management]
│  └─ Previsão e comunicação                        [work-management]
│       **previsão probabilística (Monte Carlo)** · risco comunicado cedo · negociação de escopo/data
├─ Integração da mudança
│  ├─ Integração frequente, branches curtas         [continuous-integration]
│  ├─ Revisão que não vira fila                     [continuous-integration] ↔ D4
│  └─ Feature flags e ciclo de vida delas           [continuous-integration] ↔ D4 dívida
├─ Release e feedback
│  ├─ Desenho de mudança e reversibilidade          [release-feedback]
│  ├─ **Exposição progressiva com análise** (canary × controle, rollout, dark launch) [release-feedback]
│  ├─ Decisão de release e autoridade para pausar   [release-feedback] ↔ D10 governança
│  └─ Contenção, rollback e aprendizado da falha de mudança [release-feedback]
├─ Dependências e fornecedores
│  ├─ Visibilidade e classificação de dependências  [collaboration]
│  ├─ Contrato de colaboração e escalonamento       [collaboration]
│  ├─ Redução de dependências (autonomia, desacoplamento) [team-ownership] ↔ D5
│  └─ Gestão de fornecedores e fábricas             [rubrica]
└─ Loops de feedback
   ├─ Instrumentação de aprendizado                 [release-feedback] ↔ D6
   └─ Decisão por feedback (produto, fluxo, tecnologia) [release-feedback]
```

### D4. Engenharia e qualidade → `engineering-quality`

```text
├─ Design, código e dívida
│  ├─ Design local e contratos                      [sustainable-design]
│  ├─ Mudanças pequenas e revisão orientada a risco [sustainable-design]
│  ├─ Manutenibilidade e diagnóstico                [sustainable-design]
│  └─ Gestão de dívida técnica                      [sustainable-design]
├─ Estratégia de qualidade
│  ├─ Risco de qualidade e confiança proporcional   [quality-strategy]
│  ├─ Testabilidade, dados e ambientes              [quality-strategy] ↔ D7 ambientes efêmeros
│  ├─ Validação em camadas + exploração             [quality-strategy]
│  │    **cobertura de risco (não % de linhas) · testes de contrato · mutação**
│  └─ Defeitos, escape e regressão                  [quality-strategy]
├─ Automação e cadeia de suprimentos
│  ├─ Build e artefato reproduzível, proveniência   [sdlc-automation]
│  ├─ Feedback técnico rápido e confiável (flakiness, fila) [sdlc-automation]
│  └─ Supply chain: inventário, atualização, SBOM   [sdlc-automation] ↔ D9
├─ Engenharia assistida por IA
│  ├─ Adequação e autonomia de uso                  [pesquisa] ↔ D12 postura de IA
│  ├─ Contexto e conhecimento para IA               [pesquisa] ↔ D6
│  ├─ Construção e revisão assistidas, com responsabilidade humana [pesquisa]
│  └─ Agentes no SDLC: escopo, identidade, rastreabilidade [pesquisa] ↔ D9
└─ Competência técnica
   ├─ Mapa de competência, concentração e sucessão  [technical-capability]
   ├─ Padrões técnicos úteis (criados por problema, com exceção e depreciação) [technical-capability]
   └─ Especialista como multiplicador, não gargalo  [technical-capability]
```

### D5. Arquitetura e evolução → `architecture-evolution`

```text
├─ Domínio e limites
│  ├─ Contextos, responsabilidades e linguagem      [domain-alignment]
│  └─ **Congruência sociotécnica** (limites de sistema × limites de time) [domain-alignment] ↔ D10 topologia
├─ Decisões arquiteturais
│  ├─ Trade-offs, registro e reversibilidade        [architecture-decisions]
│  ├─ Direitos de decisão e participação            [architecture-decisions]
│  └─ Atributos de qualidade por design (escala, confiabilidade, segurança, custo) [architecture-decisions]
├─ Evolução e modernização
│  ├─ Custo da mudança equivalente seguinte         [evolvability]
│  ├─ Saúde e risco do legado, fim de suporte       [evolvability]
│  ├─ Modernização progressiva (strangler, coexistência) [evolvability]
│  └─ **Funções de fitness arquiteturais**          [evolvability]
└─ Integração e APIs
   ├─ Contratos, versionamento e depreciação        [integration-data]
   ├─ Síncrono × assíncrono; falha, idempotência e ordenação [integration-data]
   └─ Interoperabilidade de ecossistema e parceiros [integration-data]
```

### D6. Dados, analytics e IA → **domínio proposto** (hoje parcialmente em `integration-data`)

> **Decisão D1:** separar ou não. Argumentos a favor: outras pessoas (dados, BI,
> ciência de dados), outras práticas e forte poder diagnóstico (§3.1-G). Contra: o
> motor evita eixos novos sem dois padrões independentes.

```text
├─ Integração operacional → analítica
│  ├─ **Forma de integração** (dump/leitura direta · ETL batch · CDC/eventos) [rubrica]
│  ├─ **Contratos de dados e responsabilidade do produtor** [integration-data]
│  └─ Latência entre o fato e a decisão             [anexar: integration-data]
├─ Qualidade, semântica e governança
│  ├─ Ownership, catálogo, linhagem                 [rubrica]
│  ├─ **Definição única de métrica (camada semântica)** [rubrica]
│  ├─ Qualidade e observabilidade de dados          [rubrica]
│  └─ Retenção, privacidade e acesso proporcional   [cloud-security] ↔ D9
├─ Dados como produto
│  ├─ Descoberta, documentação e autosserviço analítico [rubrica]
│  └─ Plataforma de dados e experimentação          [rubrica] ↔ D2
└─ Sistemas de IA
   ├─ Ciclo de vida de modelos e aplicações de IA (dados, prompt, avaliação, deploy, retirada) [pesquisa]
   ├─ Avaliação contínua (evals), drift, custo      [pesquisa]
   ├─ Segurança de IA (injeção de prompt, dados, abuso) [pesquisa] ↔ D9
   └─ Supervisão humana, transparência e contestação [pesquisa]
```

### D7. Plataforma e experiência de engenharia → `platform-experience`

```text
├─ Plataforma como produto
│  ├─ Consumidores, jornadas e métricas de adoção   [platform-autonomy]
│  ├─ Autosserviço com guardrails (caminho pavimentado) [platform-autonomy]
│  └─ Suporte sem virar fila; depreciação           [platform-autonomy]
├─ Infraestrutura reproduzível
│  ├─ IaC/GitOps, drift, inventário                 [reproducible-infrastructure]
│  ├─ **Ambientes efêmeros ou sob demanda**         [reproducible-infrastructure] ↔ D4
│  └─ Padrão de ambiente e recriação                [reproducible-infrastructure]
├─ Capacidade, custo e eficiência
│  ├─ **Elasticidade automatizada por sinal de demanda** [cloud-efficiency]
│  ├─ **FinOps: visibilidade, alocação (tags/dono), otimização** [cloud-efficiency]
│  └─ Sustentabilidade e eficiência energética      [cloud-efficiency]
├─ **Rede e conectividade em nuvem (N13, 24)**        [rubrica]
│  ├─ Topologia, *landing zone*, planejamento de endereços (IPAM)
│  ├─ Segmentação, conectividade privada e híbrida, controle de saída
│  └─ DNS, certificados, CDN e borda; rede como código ↔ D9 Zero Trust
└─ Experiência do desenvolvedor
   ├─ **Tempo até o primeiro deploy e onboarding técnico** [platform-autonomy] ↔ D11 onboarding
   ├─ **Descoberta de informação** (serviços, APIs, documentação) [anexar: platform-autonomy]
   └─ Carga cognitiva imposta pelo ferramental      [team-ownership] ↔ D10
```

### D8. Operação e confiabilidade → `operations-reliability`

```text
├─ Observabilidade e investigação
│  ├─ Telemetria estruturada e correlacionada       [observability-practice]
│  ├─ **Investigação autônoma** (sem acesso privilegiado nem download de log) [observability-practice] ↔ D7
│  └─ Uso de sinais para produto, arquitetura e fluxo [observability-practice]
├─ Confiabilidade
│  ├─ SLI, SLO e error budget com consequência      [reliability-practice]
│  ├─ Alerta acionável, redução de ruído e **toil** [reliability-practice]
│  ├─ Design para falha, degradação, testes de resiliência/caos [reliability-practice]
│  ├─ Desempenho e capacidade de serviço            [reliability-practice] ↔ D7
│  └─ **Comunicação entre serviços e resiliência de chamada (N14, 24)** [anexar: reliability-practice]
│       timeouts, retries com jitter, circuit breaker, idempotência, gateway, mesh ↔ D5
├─ Incidentes
│  ├─ Detecção, comando e comunicação               [incident-management]
│  ├─ Plantão sustentável                           [incident-management] ↔ D11 clima
│  └─ **Revisão de incidente com aprendizado** (participação, fatores contribuintes, recorrência) [incident-management] ↔ D12 aprendizado
└─ Recuperação
   ├─ Backup, restauração demonstrada, RTO/RPO      [cloud-reliability]
   └─ Dependências e comunicação durante a recuperação [cloud-reliability]
```

### D9. Segurança, risco e resiliência → `security-risk`

```text
├─ Segurança no desenho e na entrega
│  ├─ Modelagem de ameaça na mudança comum          [software-security]
│  ├─ Validação no SDLC proporcional ao risco       [software-security]
│  ├─ Gestão de vulnerabilidades (prioridade, dono, reincidência) [software-security]
│  └─ Habilitação (guardrails, champions, feedback rápido) [software-security]
├─ Identidade, acesso e segredos
│  ├─ Identidade humana e privilégio                [cloud-security]
│  ├─ Identidade de máquina, workload e **agentes de IA** [cloud-security]
│  └─ Segredos: rotação, exposição, revogação       [cloud-security]
├─ **Segurança de rede e Zero Trust (N15, 24)**     [rubrica] ↔ D7 rede
│  ├─ Identidade de serviço e mTLS; políticas como código
│  └─ Microssegmentação, controle de saída, menor privilégio automatizado
├─ **Postura de segurança de nuvem contínua (N16)** [anexar: cloud-security]
├─ Privacidade e proteção de dados                  [rubrica] ↔ D6
├─ Detecção e resposta a ameaças (escada em 24 §6.4) [rubrica]
├─ Conformidade com evidência automatizada          [anexar: enabling-governance] ↔ D10 governança
└─ Continuidade de negócio e resiliência organizacional [anexar: cloud-reliability] ↔ D8 recuperação
```

### Sistema **Organização** (antigo D10; `organizational-system`) — três domínios

> Na home, **Organização** é o quarto sistema (regra R2 revisada). Ele se abre em
> Estrutura, Pessoas e Direção. O motor continua com as cinco folhas
> organizacionais; as capacidades novas entram como `[rubrica]`, `[pesquisa]` ou `[anexar]` até terem contrato.

### D10. Estrutura, governança e colaboração — *como os times estão desenhados e decidem*

```text
├─ Desenho de times
│  ├─ **Seis condições de efetividade** (Hackman)   [team-ownership]
│  │    time real (fronteira, estabilidade) · direção convincente · pessoas certas
│  │    · estrutura habilitadora · contexto de apoio · coaching disponível
│  ├─ Topologia e modos de interação (Conway, Team Topologies) [team-ownership]
│  ├─ **Autonomia com responsabilidade** (autoridade compatível com o que se cobra) [team-ownership]
│  ├─ Ownership ponta a ponta (build, run, resultado) [team-ownership]
│  └─ Carga cognitiva e trabalho invisível          [team-ownership]
├─ Governança habilitadora e decisões
│  ├─ Direitos de decisão compatíveis com a responsabilidade [enabling-governance]
│  ├─ Controle proporcional, automatizado e medido pela eficácia [enabling-governance]
│  └─ Governança de execução (fórum que decide, não ritual de status) [enabling-governance]
├─ Método de trabalho e agilidade real
│  ├─ Cerimônias com efeito e autonomia do time sobre o processo [rubrica]
│  ├─ Empirismo: inspeção e adaptação com consequência [organizational-learning]
│  └─ Agilidade além de TI (negócio aceita mudar escopo e data) [collaboration]
└─ Colaboração entre áreas
   ├─ **Coordenação lateral** (confiar nas outras áreas, não só no chefe; Sull) [collaboration]
   ├─ Entendimento compartilhado de resultado       [collaboration]
   ├─ Coordenação de compromisso (data, escopo, capacidade, risco) [collaboration]
   └─ Colaboração de ecossistema (suporte, vendas, parceiros) [collaboration]
```

### D11. Pessoas, liderança e clima — *como as peças atuam*

```text
├─ Liderança
│  ├─ Liderança técnica e de gestão (multiplicar, não centralizar) [leadership-management]
│  ├─ **Liderança intermediária com clareza e autoridade** (Sull) [leadership-management]
│  └─ **One-on-one com propósito** (desenvolvimento, não status) [anexar: leadership-management]
├─ Clima
│  ├─ Segurança psicológica e reação à má notícia (Edmondson, Westrum) [leadership-management]
│  ├─ **Voz e escuta** (discordância pedida; ciclo de retorno; futilidade) [rubrica]
│  ├─ **Justiça percebida** (distributiva, processual, interacional) [rubrica]
│  └─ Sustentabilidade do ritmo e bem-estar (6 áreas de Leiter & Maslach) [leadership-management]
├─ Pessoa e função
│  ├─ **Clareza de papel e de expectativa**         [rubrica]
│  ├─ **Adequação pessoa-função** (posição × função estratégica; trilha técnica × gestão) [pesquisa]
│  ├─ **Tratamento de disfunção** (tempo até agir, feedback cedo, desligamento respeitoso) [pesquisa]
│  └─ Carreira, feedback e reconhecimento (individual × colaborativo) [anexar: leadership-management]
└─ Ciclo de vida das pessoas
   ├─ **Onboarding** (tempo até contribuir, até o 1º deploy, até decidir) [rubrica] ↔ D7
   ├─ Sucessão e concentração de conhecimento       [technical-capability]
   └─ Retenção e saída lamentada (sinais antecipados) [anexar: leadership-management]
```

### D12. Direção, desempenho e aprendizado — *para onde a organização vai e como aprende*

```text
├─ Desdobramento estratégico
│  ├─ **Estratégia → tático → operacional** (objetivos com intenção, catchball) [rubrica] ↔ D1
│  ├─ **Compreensão, não só comunicação** (cada nível explica o porquê) [rubrica]
│  ├─ **OKR como resultado, não como lista de entregas** [anexar: product-direction] ↔ D2
│  └─ Revisão da estratégia por evidência vinda de baixo [product-direction]
├─ Uso de indicadores e metas
│  ├─ **Indicador como termômetro** (informativo × motivacional; Austin) [rubrica]
│  ├─ **Meta não atingida → que comportamento ou conhecimento faltou** [rubrica]
│  ├─ **Metas de aprendizado para trabalho complexo** [rubrica]
│  ├─ Letramento em indicadores (variação, outlier, percentil) [rubrica]
│  ├─ Higiene de métricas (anti-Goodhart, pares, aposentadoria) [rubrica]
│  └─ **Incentivos coerentes** (recompensa ao time quando o trabalho é interdependente) [rubrica]
├─ Postura de IA da organização
│  ├─ Posição clara e comunicada sobre IA (DORA)    [rubrica]
│  ├─ Medição de impacto real, não de adoção        [pesquisa]
│  └─ Redesenho do trabalho e dos papéis            [pesquisa]
└─ Aprendizado, mudança e conhecimento
   ├─ **Trabalhar no sistema, não só dentro dele** (toil, capacidade de melhoria) [organizational-learning]
   ├─ Melhoria contínua com efeito revisado         [organizational-learning]
   ├─ Aprendizado entre times (o erro de um vira proteção de todos) [organizational-learning]
   ├─ **Aprendizado de circuito duplo** (revisar premissas, não só ações) [organizational-learning]
   ├─ Gestão de mudança organizacional              [anexar: organizational-learning]
   └─ Conhecimento organizacional recuperável       [anexar: organizational-learning]
```

---

## 6. Práticas, indicadores e ferramentas datados

**Uso:** roteiro de investigação e de orientação no relatório ("o que a
literatura atual recomenda no lugar"). **Não** reduz estágio pela presença: só
vira fragilidade quando o evento mostra o efeito negativo (princípio 6).

| Datado | Por que envelheceu | Referência atual | O que observar no evento |
|---|---|---|---|
| Velocity e story points como produtividade ou comparação entre times | Mede esforço estimado, é inflacionável e não compara contextos | Throughput, tempo de ciclo em percentis, idade do WIP (Vacanti); DX Core 4 | A velocity aparece em cobrança de gestor? |
| Estimativa determinística em horas | Ignora variabilidade; gera *watermelon* | Previsão probabilística (Monte Carlo sobre o throughput) | Datas "comprometidas" que escorregam sempre |
| % de utilização de pessoas como meta | Alta utilização gera fila (teoria de filas, Reinertsen) | Eficiência de fluxo, limites de WIP | Pessoas 100% alocadas, com itens parados esperando |
| MTTR como média | Distribuições de incidente são assimétricas; a média engana (VOID) | Distribuição e percentis, tempo de recuperação de deploy com falha (DORA), análise qualitativa | Metas de MTTR que geram fechamento prematuro de incidente |
| Postmortem com causa raiz única e ação "treinar a pessoa" | Sistemas complexos têm fatores contribuintes (Dekker, Allspaw, Safety-II) | Revisão de aprendizado, fatores contribuintes, quase-incidentes | Quem participa, que tipo de ação sai, recorrência |
| CAB/comitê para toda mudança | Associado a pior entrega, sem ganho de estabilidade (*Accelerate*) | Revisão por par + controles automatizados + aprovação por risco | Tempo em espera por aprovação; quem aprova entende a mudança? |
| Uptime % genérico | Não representa a experiência do usuário | SLI/SLO/error budget | Existe consequência quando o error budget acaba? |
| Alerta por limiar estático de CPU/memória | Barulhento e não acionável | Alerta por sintoma e por taxa de consumo do error budget (burn rate) | Alertas ignorados; plantão acordado por ruído |
| Log em arquivo no host ou pod | Não correlaciona, exige acesso privilegiado | Telemetria estruturada e correlacionada (OpenTelemetry) | "Baixei o log do pod" |
| ClickOps e scripts manuais | Não reproduzível; gera drift | IaC/GitOps | Quem recria o ambiente, e em quanto tempo? |
| Gitflow com branches longas de release | Integração tardia, merge doloroso | Trunk-based + feature flags + release por deploy | Idade média de branch; "semana de merge" |
| Homologação compartilhada com fila | Gargalo e teste não representativo | Ambientes efêmeros, testes de contrato, exposição progressiva | Fila por ambiente; "quebrou a homolog" |
| Deploy big bang em janela noturna | Risco concentrado, fadiga | Deploy frequente e reversível em horário comercial | Deploy às 23h com várias pessoas de plantão |
| QA como fase final e "fase de testes" | Feedback tardio, transferência de responsabilidade | Qualidade embutida, cobertura de risco, QA como habilitador | Onde o defeito é achado e quanto custa |
| Cobertura de código como meta | Indicador manipulável (Goodhart) | Cobertura de risco, testes de mutação, escape rate | Testes sem asserção para bater a meta |
| Relatório de status verde/amarelo/vermelho | Status por opinião | Métricas de fluxo + riscos explícitos | Vermelho aparecendo só na véspera |
| Planejamento anual fixo por projeto | Não absorve aprendizado | Financiamento de produto e time estável, portfólio adaptativo, custo de atraso | O que acontece com o plano quando surge evidência nova |
| ETL noturno ou leitura direta do banco transacional | Acoplamento oculto, dado atrasado, quebra silenciosa | CDC/eventos com contrato de dados; dados como produto | Relatório quebrado após deploy |
| Linhas de código e commits como produtividade | Fácil de inflar, sem valor | SPACE, DX Core 4, resultados | Ranking de pessoas por commit |
| % de adoção de IA e linhas geradas por IA | Mede uso, não impacto; percepção ≠ fato (METR) | Impacto em ciclo, retrabalho e defeitos; capacidades de IA do DORA | Meta de "uso de IA" na avaliação de pessoas |
| Classificação elite/high/medium/low como meta | O próprio DORA a substituiu por perfis em 2025 | 7 perfis de time (throughput, instabilidade, bem-estar) | Times "otimizando para virar elite" |
| Modelo de maturidade linear igual para todos | Ignora contexto e caminhos diferentes | Alvo por capacidade conforme valor (FinOps) e contexto | "Queremos nível 5 em tudo" |
| OKR cascateado de cima para baixo | Vira lista de tarefas; o time não entende nem negocia | Alinhamento com negociação (catchball), intenção explícita, key results de resultado | O time consegue explicar o porquê do próprio OKR? |
| OKR ligado a bônus | Incentiva meta conservadora e manipulação | OKR separado da avaliação de desempenho (prática recomendada pelos próprios autores de OKR) | Metas sempre "100% atingidas" |
| Gestão por objetivos numéricos individuais em trabalho interdependente | Destrói colaboração; a variação é majoritariamente do sistema (Deming) | Objetivos de time, metas de aprendizado para trabalho complexo | Pessoas recusando ajuda por "não estar na minha meta" |
| Ranking forçado / curva de avaliação | Competição interna, perda de colaboração e de segurança | Feedback contínuo, calibração por comportamento observável | Medo de ajudar colegas |
| Avaliação de desempenho só anual | Feedback tardio, viés de recência | 1:1 recorrente com foco em desenvolvimento; feedback próximo do evento | A pessoa foi surpreendida na avaliação? |
| Pesquisa de clima anual sem ciclo de retorno | Gera futilidade e reduz a participação | Pulsos curtos + ações visíveis + retorno do que mudou | Participação caindo ano a ano |
| Promoção a gestor como única forma de crescer | Perde o especialista, ganha um gestor despreparado (Benson et al.) | Trilhas paralelas (técnica e gestão) com o mesmo prestígio | Sêniores técnicos saindo ou virando gestores relutantes |
| Reunião de status como governança | Consome tempo, não decide | Fórum de decisão sobre riscos e trade-offs, com status assíncrono | Reuniões sem decisão registrada |

---

## 9. Crosswalk com referências

| Domínio v0.4 | DORA (35 capacidades + IA) | DX / SPACE / DevEx | Maturidade de mercado | Literatura-base |
|---|---|---|---|---|
| D1 Direção e investimento | Transformational leadership | Impact (DX Core 4) | EBM (4 áreas-chave de valor); MIT CISR (estágios de IA) | Reinertsen (custo de atraso); Kersten (Flow Framework) |
| D2 Produto | Customer feedback, team experimentation, user-centric focus | — | EBM | Kohavi et al. (experimentação) |
| D3 Fluxo e entrega | Small batches, WIP limits, visual management, visibility of work, trunk-based, CI, CD, streamlining change approval | Speed; feedback loops, flow state | **KMM** (níveis 0–6); IBM DevOps (Plan/Measure, Release/Deploy) | Vacanti; Anderson; Little; Humble & Farley |
| D4 Engenharia | Code maintainability, test automation, test data mgmt, version control, deployment automation | Quality; DXI | IBM DevOps (Develop/Test) | Bacchelli & Bird; Sadowski et al.; METR |
| D5 Arquitetura | Loosely coupled teams, flexible infrastructure | Cognitive load | — | Conway; MacCormack/Baldwin/Rusnak; Colfer & Baldwin; Ford et al. (arquitetura evolutiva) |
| D6 Dados e IA | Healthy data ecosystems, AI-accessible internal data | — | MIT CISR; maturidade de dados (DAMA-DMBOK) | Dehghani (data mesh) |
| D7 Plataforma | Platform engineering, empowering teams to choose tools | DevEx | **CNCF Platform Maturity v2** (4 níveis × 5 aspectos); **FinOps crawl/walk/run**; IBM (modelos de nuvem) | Skelton & Pais |
| D8 Operação | Monitoring & observability, proactive failure notification | — | IBM DevOps (Monitor/Optimize) | Beyer et al. (SRE); VOID |
| D9 Segurança | Pervasive security | — | CSA (automação de segurança em nuvem) | NIST SSDF, SLSA |
| D10 Estrutura, governança e colaboração | Loosely coupled teams, streamlining change approval | Collaboration (SPACE) | AgilityInsights (radares por papel); Team Topologies | Hackman (6 condições, 60/30/10); Conway; Sull et al.; Sweller (carga cognitiva) |
| D11 Pessoas, liderança e clima | Generative culture (Westrum), well-being, job satisfaction, transformational leadership | Satisfaction and well-being (SPACE) | TDS; Areas of Worklife; Gallup Q12 | Edmondson; Morrison; Felps et al.; Benson, Li & Shue; Colquitt; Google (Aristotle, Oxygen) |
| D12 Direção, desempenho e aprendizado | Learning culture, clear AI stance, visibility of work | Impact | EBM; Hoshin Kanri; OKR | Austin; Kerr; Ordóñez et al.; Seijts & Latham; Deming; Bungay; Argyris & Schön; Rother; Repenning & Sterman |

**Sobre o modelo "crawl → run" da IBM:** a IBM publica mais de uma família de
modelos. O **DevOps Maturity Model** (IBM Rational, cerca de 2013) tem níveis
*Practiced → Consistent/Repeatable → Reliable → Scaled → Optimized* nas práticas
Plan & Measure, Develop & Test, Release & Deploy e Monitor & Optimize. Os
**modelos de nuvem** citados pela IBM são o de adoção (*Legacy → Ad hoc → Repeatable
→ Optimized → Cloud-advanced*), o de segurança em nuvem da CSA (5 estágios de
automação) e o cloud-native da CNCF (*Build → Operate → Scale → Improve →
Optimize*). O mapa usa esses modelos só como **mapeamento de vocabulário** (§3):
todos medem presença e padronização de prática, e o mapa mede apropriação e efeito.
> Vale confirmar qual modelo de 5 fases da IBM você tinha em mente, para
> aprofundar a trilha de perguntas correspondente.

---

