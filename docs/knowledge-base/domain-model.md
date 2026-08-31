# Modelo de domínio e módulos

## Conceitos principais

- **AssessmentTemplate:** versão publicável do instrumento.
- **Project:** espaço criado por um responsável para configurar, compartilhar e
  acompanhar uma aplicação do assessment para um time.
- **OrganizationUnit:** nó configurável de uma hierarquia, com tipo e nome locais;
  pode representar organização, tribo, cluster, time, squad ou outra estrutura.
- **Capability:** comportamento ou resultado que queremos compreender.
- **Scenario:** contexto apresentado ao respondente.
- **Question:** interação dentro de um cenário.
- **Option:** escolha com sinais e trade-offs, nunca uma “alternativa correta” nua.
- **Signal:** evidência positiva, negativa, ambígua ou de bloqueio.
- **InferenceRule:** combina sinais para sustentar uma hipótese com confiança.
- **AssessmentRun:** rodada de um template dentro de um projeto.
- **Invitation:** credencial individual, aleatória, com validade e uso controlado;
  autoriza uma participação sem precisar aparecer no relatório.
- **InvitationBatch:** agregado administrativo de convites de uma unidade, sem perfil
  imposto pelo criador;
  permite estados coletivos, revogação e uma reemissão sem identificar pessoas.
- **Participation:** sessão anônima associada a um convite, separada das respostas.
- **RespondentContext:** perspectiva, responsabilidades exercidas, autoridade,
  alcance, eventos observáveis e trilha de entrevista, com minimização de PII. O contexto seleciona
  arestas e não produz sinal de capacidade.
- **ObservedEvent:** contrato de autoria para a anamnese centrada em evento;
  preserva família, recência, gatilho, responsabilidade observável, autoridade,
  alcance, fatos ordenados e condição de revisão, sem carregar causa, capacidade,
  sinal ou pontuação. As cinco reconstruções iniciais já alteram o percurso publicado.
- **Profile:** lente configurável sobre responsabilidades, visibilidade e decisões;
  seleciona cenários, mas não cria uma escala de capacidade por cargo.
- **Response:** resposta bruta e metadados consentidos.
- **Finding:** hipótese explicável, evidências, contradições e confiança.
- **DiagnosticContext:** mecanismo de restrição, contenção, evidência faltante,
  impactos e severidade qualitativa associados ao finding.
- **DiagnosticSystem:** biblioteca versionada que distingue sintomas, hipóteses
  causais e amplificadores relacionados, sem substituir os padrões nem afirmar
  causa comum.
- **CausalAnalysis:** projeção pública da hipótese mais sustentada, alternativas,
  evidência favorável e contrária, lacuna, limitação e versão do conhecimento.
- **Recommendation:** experimento ou ação ligada a um finding e suas dependências.
- **AssessmentNode/Edge:** grafo versionado de cenários, perguntas, condições e
  encerramentos possíveis.
- **ProblemPattern:** hipótese de problema ligada a sinais, impactos e bloqueios.
- **EvidenceFacet:** perspectiva de um perfil sobre uma capacidade compartilhada,
  usada para triangulação sem identificar o participante.
- **PilotLabel:** julgamento cego de causa por disciplina avaliadora, sem vínculo
  com participação, convite ou resposta.
- **ItemReview:** entrevista cognitiva sobre um nó (compreensão, correspondência da
  interpretação, encaixe e sobreposição de alternativas, recuperação de um evento,
  termo confuso, viés de opção ouro,
  uso de “não observo”).

## Módulos do monólito

1. `identity`: acesso e papéis.
2. `catalog`: capacidades, cenários, perguntas, versões e referências.
3. `assessments`: campanhas, participantes e aplicação do questionário.
4. `inference`: sinais, regras, confiança e geração de findings.
5. `reporting`: visualizações, divergências e recomendações.
6. `knowledge`: glossário, fontes, decisões e histórico do modelo.

Cada módulo será dono de suas regras e tabelas. Integrações internas passam por
interfaces de aplicação/eventos internos, mantendo um único deploy e um único
banco enquanto os limites continuam explícitos.

## Projeto, compartilhamento e participação única

O criador abre um `Project` e recebe um link de gestão protegido. Para responder,
há dois tipos diferentes de link:

- **link do projeto:** página de entrada e instruções; não concede uma participação;
- **link de convite:** token único criado para uma pessoa, válido para uma rodada e
  consumido ao iniciar/concluir conforme a política definida.

Um mesmo link público compartilhado com todos não impede respostas repetidas.
Portanto, cada participante recebe um convite diferente. O sistema armazena apenas
o hash do token, nunca o token em texto puro. Tokens devem ser aleatórios, expirar,
poder ser revogados e não aparecer em logs.

Para conciliar anonimato e prevenção de duplicidade, identidade de convite e
conteúdo das respostas ficam separados. O relatório sabe que um convite respondeu,
mas não expõe qual conjunto de respostas pertence a qual convite. O administrador
vê estados agregados como “emitido”, “iniciado” e “concluído”, não respostas por
participante.

Esse mecanismo impede reutilização acidental ou simples do mesmo convite, mas não
prova identidade humana. Garantias maiores exigiriam e-mail, SSO ou outro dado de
identidade, reduzindo anonimato. Essa escolha deve ser configurável e transparente.

Após concluir, o token passa a servir apenas para mostrar uma confirmação neutra.
Reabrir o mesmo link nunca exibe respostas, resultados, percurso ou alternativas
selecionadas e não permite iniciar novamente. A retomada só existe enquanto a
participação estiver incompleta.

Convites são emitidos em lotes. O criador vê unidade, quantidade e estado
do lote, nunca a relação entre link e resposta. Revogar afeta somente links ainda
não usados; participações iniciadas permanecem anônimas e válidas. Cada participante
escolhe uma perspectiva ampla na primeira etapa; essa resposta apenas roteia a
entrevista e não gera sinal de capacidade. Reemissão cria
novos segredos, ocorre no máximo uma vez por lote de origem e não recupera tokens.

## Requisitos de explicabilidade

Todo finding precisa informar:

- quais respostas e sinais o sustentam;
- quais sinais o contradizem;
- confiança e lacunas;
- contexto e bloqueios que alteram a interpretação;
- versão do template e da regra usada;
- capacidade principal e capacidades afetadas;
- mecanismo, contenção, autoridade decisória, impactos, severidade e evidência ainda faltante;
- estado da prescrição: pronta para experimento ou suspensa para investigação.
- hipóteses concorrentes, evidência favorável e contrária, limitação e versão da
  biblioteca causal, sem expor identificadores internos.
- ciclo sociotécnico somente quando decisão e consequência foram observadas,
  preservando incentivo, fronteira decisória, compensação, evidência contrária,
  lacuna, escopo e reforço como hipótese.
- direção técnica condicionada, com prática, técnica, habilitador, família de
  ferramenta opcional, pré-condições, limites, custo/risco e experimento como
  conceitos separados; ausência nominal não produz direção.
- `FindingNarrative`, projeção versionada que ordena a leitura sem alterar o
  finding, omite playbook em investigação e preserva força local e regressão de
  padrões virtuosos.

Recorrência e contenção são invariantes diferentes. A primeira informa onde o
padrão apareceu; a segunda informa onde a restrição pode ser removida. O domínio
classifica o portfólio por contenção — organizacional, compartilhado, local ou
indeterminado — e nunca promove um relato local por prevalência isolada.

`TransformationPortfolio` é uma projeção versionada dos mesmos findings, não um
segundo recomendador. Cada passo preserva padrão, contenção e autoridade e declara
fase, dependências, pré-condições, incompatibilidades, custo, risco,
reversibilidade e possível deslocamento de risco. Findings com prescrição
investigativa ficam em `conditioned`: o problema continua visível, mas não entra na
sequência até que mecanismo, contenção e autoridade sejam discriminados.

`AudienceReportProjector` produz `audience-report-v1` a partir dos mesmos findings
e do mesmo `TransformationPortfolio`. A projeção organizacional separa decisões e
restrições compartilhadas; a técnica seleciona restrições sistêmicas; a local
separa ação própria, restrição recebida e escalada; a especialista preserva o
contrato completo. Projeções carregam referências sem criar uma nova identidade de
problema ou uma regra alternativa de recomendação.
