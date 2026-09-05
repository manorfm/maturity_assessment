# Diagnóstico probabilístico e recomendações

## Semântica vigente

O diagnóstico avalia cada causa que pode coexistir em uma família binária própria:
`causa sustentada` contra `evidência insuficiente`. Sintomas, restrições e
consequências alimentam evidência ou aplicabilidade, mas não competem como causas.
Cada família inclui priors especialistas provisórios e probabilidades condicionais
versionadas. O resultado exibido é um **posterior provisório**: ele
representa a crença do modelo diante das evidências declaradas, mas ainda não é uma
probabilidade empiricamente calibrada.

Estágio do comportamento, cobertura temática, posterior e prioridade são medidas diferentes.
Uma nota baixa não escolhe uma solução sozinha; grupos com a mesma nota podem ter
causas e experimentos diferentes.

O estágio pode localizar a distância para o comportamento de alta performance da
capacidade, mas não seleciona a intervenção. A recomendação continua dependendo da
cadeia `fato -> efeito -> hipótese causal -> contenção -> autoridade -> capacidade
necessária`. A rubrica comparativa define o destino comportamental; o diagnóstico
causal decide qual caminho é plausível neste contexto.

O finding separa ainda problema, capacidades afetadas e capacidade necessária para
resolver a causa. A prontidão dessa capacidade usa evidências positivas do recorte e
é classificada como não demonstrada, declarada, local, operacional ou adaptativa.
Ausência de evidência nunca é apresentada como prova de inexistência. Esse estado
condiciona o tamanho do experimento: uma solução estrutural não é recomendada como
primeiro passo quando ainda falta execução, alcance ou aprendizado para sustentá-la.

No contrato executivo, a recomendação carrega também a proveniência agregada que
sustenta a decisão: pessoas que podiam observar a situação, pessoas favoráveis,
padrões de resposta, perspectivas, contradições específicas e pessoas que não
entraram em nenhuma dessas duas categorias. A parcela não classificada é calculada
pela união dos participantes favoráveis e contraditórios, porque uma mesma pessoa
pode produzir sinais em direções diferentes. Esses números descrevem a base
observada; não são chamados de evidência ampla, não são convertidos em porcentagem
causal e não escondem a incerteza remanescente. Cobertura temática, suporte coletivo,
posterior causal e prontidão da solução permanecem medidas separadas.

A apresentação começa pelo comportamento identificado e distingue explicitamente
apoio, contradição específica publicável e respostas que não geraram sinal em
nenhuma dessas direções. Ausência de contradição publicável nunca é descrita como
concordância. Uma pessoa fora das duas categorias pode não ter observado o evento,
não ter produzido sinal classificável ou não ter alcançado evidência publicável;
o relatório não escolhe uma dessas explicações sem dados próprios. Na interface,
convergência, amplitude, diversidade de perspectivas e cobertura causal aparecem
como “acordo entre os relatos”, “tamanho da base”, “variedade de lentes” e
“explicação do mecanismo”, sempre acompanhados da pergunta respondida.

A força da evidência mantém quatro leituras independentes: convergência das
respostas, amplitude na população aplicável, diversidade de perspectivas e
cobertura causal. Alta convergência em uma única perspectiva continua sendo
hipótese local, não evidência organizacional triangulada.

## Atualização e explicação

O cálculo usa log-espaço e normalização por softmax. A força considera suporte sobre
população aplicável, variedade de perspectivas e camadas. Uma ocorrência isolada
não equivale a recorrência coletiva, e ausência de resposta não vira evidência
negativa. Evidências que pertencem ao
mesmo grupo causal são consumidas uma única vez, evitando premiar perguntas
redundantes. Contradições alteram apenas as hipóteses às quais foram ligadas.

O relatório preserva:

`comportamento -> evidência independente -> hipótese/alternativas -> restrição -> experimento`

O catálogo materializa essa cadeia em uma rede especialista tipada com relações
`observed_as`, `may_be_explained_by`, `supported_by`, `contradicted_by`,
`addressed_by` e `grounded_in`. Toda intervenção
publicada precisa possuir o caminho completo; a rede é explicável e não aprende
silenciosamente com cliques ou respostas.

A versão causal vigente `causal-catalog-v9` projeta no mesmo finding a hipótese
mais sustentada, explicações concorrentes do mesmo sistema de problemas, evidência
a favor, evidência contrária que atingiu o limiar, lacuna restante e limite da
orientação. Ausência de contradição observada é declarada como ausência de evidência
contrária específica acima do limiar e acompanhada da parcela não classificada,
nunca como confirmação da hipótese. Sintoma, hipótese e
amplificador continuam papéis diferentes dentro da biblioteca.

Quando a evidência agregada contém uma decisão ou comportamento, uma consequência
em camada de resultado e ao menos dois padrões factuais, o finding pode materializar
um padrão sociotécnico. O contrato distingue comportamento virtuoso ou vicioso,
condição habilitadora, racionalidade local, efeito sistêmico, incentivo, fronteira
entre quem observa/recomenda/decide/executa, comportamento compensatório e sinal de
regressão. A relação de reforço permanece explicitamente uma hipótese. Recorrência
não determina contenção, prática local não implica difusão e divergência abre
investigação de visibilidade, fronteira ou poder.

`culture` isolado não é mecanismo publicável: ele é normalizado para mecanismo e
contenção indeterminados, suspende a prescrição e exige reconstruir decisão,
incentivo, política, poder ou consequência observável.

A direção técnica condicionada possui seis bibliotecas: feedback/esteira,
segurança no fluxo, ambiente seguro, descoberta de domínio, mapeamento arquitetural
e caminhos homologados. Cada contrato separa prática-alvo, técnicas, mecanismo
habilitador e famílias de ferramenta opcionais, além de pré-condições, limite,
custo, risco, menor experimento, indicador, critério e fundamento versionado. A
rede causal registra a relação potencial `may_enable`, mas a projeção só aparece
quando mecanismo e contenção autorizam experimento e a capacidade de solução foi
ao menos declarada. Presença ou ausência nominal nunca seleciona contrato.

O prior de evidência insuficiente varia com a observabilidade, sem uma reserva fixa
que cresça artificialmente com a quantidade de causas. O suporte publicado de uma
causa usa a opção escolhida da hipótese, não o sintoma do nó pai: uma família cujo
identificador coincide com um padrão de evidência conta somente essas observações.
O relatório lista no máximo três causas distintas por padrão, sem repetir o mesmo
texto em cada folha afetada. Incerteza e discriminadores ficam sob demanda.
Snapshots individuais nunca são publicados.

Os fundamentos de fluxo, prioridade e melhoria distinguem fechamento do ciclo,
feedback multidisciplinar precoce, aprendizagem sob prazo, foco por resultado,
capacidade reservada, autonomia dentro de limites e gatilhos antecipados. Esses
fundamentos explicam por que o menor experimento pode alterar o mecanismo observado;
não usam mais uma justificativa única de “atacar o comportamento” para padrões
causalmente diferentes.

Arquitetura e evolução também possuem fundamentos próprios para acoplamento por
coordenação, correlação entre componentes, impacto invisível, contratos implícitos,
ownership e mudanças em grande lote. Mapas, contratos e técnicas de descoberta só
entram para tornar dependência, contexto ou compatibilidade verificáveis; a presença
nominal de C4, DDD ou Event Storming continua sem sustentar diagnóstico.

Autonomia e dependências distinguem ainda acesso operacional seguro, competência
acessível ao fluxo, prioridade compartilhada, decisão concentrada, desenho
organizacional e autoridade para agir sobre risco. A ausência de SRE, arquiteto ou
especialista formal não é uma deficiência: o diagnóstico observa se quem assume o
resultado dispõe de contexto, limites, capacidade e poder de decisão.

Operação sustentável distingue mitigação de prevenção, instrução de caminho
reproduzível, automação local de capacidade compartilhada e exceção temporária de
fluxo emergencial reconciliável. Ambiente, correção e migração de dados são tratados
por idempotência, validação, reversibilidade e efeito observado; nenhuma família de
ferramenta é exigida por nome.

Decisão e aprendizagem distinguem critério observável, revisão por evidência,
capacidade real para melhoria, foco entre grupos e transferência de conhecimento
para execução. Discovery só é orientação quando preserva alternativas e pode
contrariar a hipótese; cerimônia, patrocínio, curso ou documento não demonstram por
si mesmos que a direção ou a capacidade mudou.

Todos os fundamentos do catálogo vigente são explícitos. Risco operacional,
privacidade, severidade, conhecimento concentrado, comunicação, qualidade não
funcional e mudança sistêmica possuem relações próprias entre fato, mecanismo e
experimento. O motor não fabrica mais uma justificativa a partir do título quando
o catálogo omite esse contrato.

## Recomendações

O projetor `finding-narrative-v1` organiza cada finding nesta ordem pública:
o que está acontecendo, por que isso se repete, o que fazer agora, valor ou
ausência honesta de impacto, por que o recorte, como saber se funcionou,
evidência favorável e contrária, contenção/autoridade, capacidade que já
funciona, opções técnicas e metodologia. O cartão compacto usa a prosa
cotidiana (`plainExplanation`) como título: o evento de trabalho e quem
decide, sem slogan nem metáfora. O título de catálogo fica secundário. As tags são **Precisa de correção**, **Pode evoluir** e
**Manter o que funciona**.
A rota percorre os IDs dessa projeção; não decide uma ordem própria nem
recalcula inferência. O resumo factual aparece uma vez. Detalhes progressivos
explicam força da evidência, alternativas e método sem repetir a mesma contagem.

Findings investigativos substituem experimento e opções técnicas por uma próxima
investigação. Padrões virtuosos publicam condição de sustentação e sinal de
regressão. As leituras de diretoria, tecnologia, gestão local e especialistas
continuam filtrando o mesmo finding por autoridade, sem criar outra prioridade.

Uma recomendação exige suporte coletivo mínimo e hipótese causal correspondente.
O motor suprime prescrições incompatíveis e sua entidade probabilística valida
pré-requisitos antes de recomendar; entre 50% e 70% a ação permanece como hipótese
a validar. O plano informa ação inicial, responsável provável, métrica, horizonte
e critério de sucesso. Cada intervenção declara também um **fundamento** (fonte e
princípio, por exemplo Well-Architected Security, Continuous Delivery, SRE ou Lean)
que não pontua: explica por que a ação ataca o comportamento observado, sem
recomendar ferramenta na ausência de problema. Prioridade considera severidade e
alcance sem alterar o posterior.

Cada finding possui uma única **capacidade principal**, onde o padrão e o contrato
de intervenção são publicados. Outras capacidades aparecem como efeitos. O mesmo
padrão não vira várias prioridades apenas porque atravessa pilares.

O catálogo diferencia correção de um padrão negativo e evolução de uma prática
intermediária. Uma capacidade 4/4 não recebe ação artificial; uma capacidade abaixo
de 4 pode receber evolução quando as respostas sustentam um passo concreto.

Prática, processo, framework, técnica e família de ferramenta podem compor a
direção, nunca a evidência inicial. Cada opção deve explicar qual comportamento
pretende habilitar, por que é compatível com o mecanismo, quais pré-condições exige,
o que não resolve e como seu efeito será verificado. Exemplos de produto ou marca
permanecem ilustrativos e não alteram estágio, confiança ou prioridade.

## Sequenciamento da transformação

O planejador `transformation-portfolio-v1` consome os findings já decididos pelo
motor e ordena intervenções em cinco fases: estabilizar risco e ownership,
encurtar feedback, remover restrições compartilhadas, ajustar operating model e
desenvolver capacidade adaptativa. Dentro da fase, prioridade e padrão fornecem
ordem estável. Uma dependência só é criada entre fases quando o passo anterior
representa uma pré-condição sistêmica explícita, atualmente ownership; proximidade
de fase, prioridade ou sintoma não cria causalidade. Ação local independente nunca
bloqueia decisão organizacional, e intervenções de squads diferentes não dependem
uma da outra sem relação declarada.

Cada passo publica autoridade, contenção, pré-condições, incompatibilidades, custo,
risco, reversibilidade e risco que pode ser deslocado para outra fronteira. Esses
atributos são qualitativos e condicionais: não formam score nem alegam previsão de
retorno. Prescrição suspensa aparece separadamente como investigação necessária e
não recebe posição artificial no plano.

O projetor de audiência `audience-report-v1` não ranqueia novamente. Ele filtra o
portfólio já ordenado por contenção, autoridade e capacidade observada. Diretoria e
liderança técnica podem enxergar a mesma restrição compartilhada por razões de
decisão diferentes; a posição, o padrão e a intervenção continuam únicos. No
recorte local, autoridade de time produz ação local e as demais autoridades
produzem dependência recebida e escalada. Achados ainda investigativos permanecem
no detalhe especialista e não são promovidos a decisão executiva.

Título, mecanismo causal e ação são campos distintos. O título descreve o efeito
observado; a causa explica por que **este** padrão se reproduz; a ação propõe o
menor teste compatível com a restrição. Cada padrão do tronco declara orientação
tipada: restrição, explicação cotidiana, classe de solução, o que a classe não
resolve, exemplos de família (não de marca) e antipadrão de comprar ferramenta
sem o problema. Melhoria contínua só é fundamento quando o mecanismo **é** ciclo
de melhoria sem dono, capacidade ou revisão de efeito. A métrica nomeia o
comportamento a acompanhar; não recita o título. Cada padrão publicado
referencia explicitamente um fundamento do catálogo — sem classificação por
coincidência de palavras — e a ausência desse vínculo impede a inicialização do
recomendador.

No recorte de produto, a evidência que não altera o investimento
permanece um sintoma até o aprofundamento distinguir financiamento temporário,
encerramento de ownership no aceite, indisponibilidade de capacidade ou incentivo
por entrega. Esses mecanismos levam respectivamente a decisões de funding,
desenho organizacional, alocação ou incentivo; não são tratados por uma recomendação
única de “adotar modelo de produto”.

No recorte de plataforma, baixa adoção também permanece um sintoma. O contrato
separa descoberta, acesso, adequação ao caso, ajuda recorrente, alternativas
equivalentes, observação da jornada e retorno das exceções. As opções variam entre
descoberta contextual, política de acesso, evolução da capacidade compartilhada,
feedback executável, consolidação e discovery de produto interno. Nenhuma delas é
selecionada apenas porque existe ou falta um time, portal ou ferramenta.

No recorte de segurança, espera ou aprovação também não demonstram burocracia por
si sós. O diagnóstico preserva obrigações e revisão independente legítimas enquanto
distingue compensações por evidência técnica frágil, ownership ausente, segregação
manual ou etapa sem decisão possível. Eficácia, conformidade, risco residual e
custo no fluxo permanecem evidências separadas; passar em auditoria não autoriza
declarar que o controle reduziu o risco pretendido.

No recorte de workforce, “falta capacitação” não é mecanismo suficiente. O contrato
distingue adquirir experiência inexistente, distribuir conhecimento concentrado,
liberar prática segura, ligar conteúdo a trabalho, transferir capacidade de
fornecedor e proteger tempo retirando escopo. O efeito é medido pela execução
seguinte — ajuda, erro, tempo e distribuição — e não por presença, certificado ou
matriz declarada. Contratação, academia, pareamento e rotação são opções condicionadas,
não sinais de maturidade.

No recorte de legado e ownership, possuir repositório, documentação ou mantenedor
não demonstra responsabilidade. O contrato separa autoridade pelo resultado,
responsabilidade limitada ao código, decisão distribuída sem resolução e
dependência pessoal. Para legado, idade ou tecnologia também não determinam o
diagnóstico: a inferência observa se o comportamento pode ser reconstruído, se a
mudança produz evidência repetível, se o risco é reduzido em fatias reversíveis e
se um parceiro externo deixa capacidade exercitável. Cada mecanismo seleciona uma
intervenção diferente e explicita o que ela não resolve.

Cada página do relatório escolhe um desfecho: preservar prática sustentada;
corrigir ou evoluir o limitador quando há finding amarrado; discriminar quando o
limitador mistura evidência, quando o finding **é** a divergência de perspectiva,
quando as fragilidades estão dispersas sem padrão recorrente, ou quando ainda
competem várias explicações; ou declarar evidência insuficiente. Esses três
vazios não se confundem: falta de amostra, contradição no mesmo elo e
fragilidade sem causa amarrada pedem textos diferentes. Discriminar pede
observação de um evento recente, não um playbook. Um ramo em 4 não herda
discriminação de um neto de cloud.

Discriminação sem causa isolada usa um contrato narrativo da capacidade: descreve
o que está acontecendo em linguagem cotidiana, o que ainda não dá para dizer e o
evento que precisa ser reconstruído. Não abre com “as respostas mostram que”
nem lista hipóteses como “ainda competem”. O nome da capacidade nunca é
encaixado mecanicamente em uma frase.
Preservação também nomeia o comportamento sustentado e um sinal de regressão; não é
um elogio genérico nem autoriza intervenção para preencher o relatório.
Todas as folhas possuem narrativas explícitas de investigação e preservação. Uma
folha nova sem esse contrato impede a autoria em vez de receber fallback por
rótulo. No cartão, causa, localização, autoridade e gravidade permanecem
auditáveis sob demanda; o primeiro plano usa situação, prioridade e próximo evento
em linguagem cotidiana.

O cartão formula explicitamente a decisão solicitada. Autorizar o experimento vem
antes do catálogo de alternativas, acompanhado por responsável, horizonte,
indicador e critério. Divergências de várias capacidades são condensadas numa única
hipótese de fronteira e pedem a reconstrução conjunta de um evento recente; não se
repetem como uma lista de déficits.

A decisão principal explicita que é a primeira entre `N` comportamentos recorrentes e
que a ordenação combina alcance e intensidade do sinal. Os demais não desaparecem: o panorama
mantém o total real e mostra até quatro próximos candidatos. A abrangência por
unidade é uma projeção da mesma evidência agregada, não um segundo recomendador.

O cartão mostra separadamente intensidade do sinal e alcance e
explica por que a frente venceu o próximo candidato; confiança não entra nessa
ordenação. Padrões preservados individualmente podem ser agrupados em **frentes
diagnósticas** por relações explícitas do catálogo. O agrupamento organiza sintomas
que merecem uma decisão coordenada, mas nunca declara causa comum comprovada.
As bibliotecas vigentes cobrem integração, ownership, fechamento de aprendizado,
produto/funding, adoção de plataforma, governança/confiança, workforce, legado,
resposta operacional, qualidade no fluxo e carga cognitiva. Padrões ainda sem
relação explícita permanecem organizados apenas pela capacidade e não ganham uma
causa por proximidade temática.

Além de abrangência, o contrato publicado inclui mecanismo de restrição, contenção,
impactos, severidade e evidência faltante. Severidade permanece indeterminada até
existir evidência própria de impacto; ela não deriva do peso da alternativa nem
da folha. Enquanto a gravidade for indeterminada, `impacts` fica vazio e o cartão
não lista custo, velocidade ou previsibilidade.
Abrangência descreve onde o padrão foi
observado; contenção descreve quem ou o que provavelmente consegue removê-lo. Se a
entrevista não discriminou isso, o resultado permanece indeterminado.

O contrato também declara a autoridade provável para agir. Sem mecanismo ou
contenção discriminados, o problema continua publicado, porém a orientação muda
para investigação e nenhuma solução específica é prescrita. O panorama separa
decisões organizacionais, capacidades compartilhadas, problemas locais e contenção
ainda indeterminada; cada item navega para o finding canônico no detalhamento.

A apresentação é uma projeção determinística do mesmo finding, não um segundo motor
de recomendação. No first screen da organização, o cartão prefere a decisão pronta
— finding com mecanismo e contenção — mesmo quando outra folha publicada está
num estágio mais baixo sem causa amarrada. Discriminar fica no detalhe dessa folha
ou no panorama, não no cartão que a diretoria lê primeiro. O cartão vem antes do
estágio e do mapa de sistemas. Na first screen, o cartão compacto traduz o
contrato nesta ordem: decisão pedida (verbo, quem autoriza e horizonte),
situação observada sem culpar o time quando a restrição é política, valor em
risco só com evidência de impacto — ou a declaração de que o impacto ainda
não foi medido —, teste, o que não resolve e antipadrão. Fundamento, classe
de solução, evidência agregada e vocabulário metodológico ficam em `details`;
o teste não exige abrir “Detalhes metodológicos”. Quando o limitador é do
sistema organizacional, o texto lembra que aquele pilar é um meta-sistema, não um
oitavo eixo técnico. Quando a prontidão não foi demonstrada, o
texto diz apenas que as entrevistas ainda não mostraram o caminho funcionando;
nunca conclui inexistência. As perspectivas que sustentam a leitura são nomeadas,
contradição zero é explícita e o recorte se explica pela autoridade, não pelo
rótulo da folha.
A first screen agrupa os demais padrões publicados em **Outras restrições**,
por frente diagnóstica — integração e feedback, plataforma, melhoria sem
fechamento, fluxo — e mostra o mecanismo de cada uma. Padrões da mesma
família do limitador aparecem como variações, não como problemas novos.
Tratar só o ponto principal não remove as outras frentes. Decidir e investigar continuam
distintos. Briefings por público continuam a projetar a mesma
restrição — autorizar, recusar ou escalar, não comprar ferramenta — sem
segundo motor, no rodapé administrativo.

Os experimentos não reutilizam uma porcentagem como se ela medisse tudo. Posterior
expressa força da hipótese; prioridade combina alcance e severidade. Métrica,
horizonte e critério de sucesso variam por família do problema e, no tronco,
pela orientação do padrão. Devem permitir verificar se o comportamento parou
sem deslocar risco ou espera para outra etapa.

Somente contratos causais explícitos podem gerar prescrição. Cada contrato reúne
mecanismo, classe de solução, fundamento, métrica e critério; identificadores e
palavras incidentais nunca selecionam experimento por regex. Padrões ainda cobertos
apenas por orientação de fonte permanecem disponíveis ao diagnóstico, mas são
suprimidos pelo recomendador até receberem contrato específico. Não existe segundo
caminho de fallback capaz de publicar uma ação genérica.

No corte vigente, a auditoria executável bloqueia métrica que recita o título,
critério genérico, fundamento vazio e Melhoria contínua fora do mecanismo de
ciclo de melhoria. O responsável deriva da disciplina e do tipo de restrição.

## Seleção adaptativa

O tronco comum garante cobertura básica. Ao fim dele, perguntas elegíveis são
ordenadas por redução esperada de entropia, cobertura ausente, necessidade de
validação, valor causal, equilíbrio entre perspectivas, repetição semântica e custo.
Somente probes observáveis pela perspectiva, ainda não
respondidos e relacionados à família incerta podem ser selecionados. O orçamento é
de cinco perguntas adicionais e o limiar especialista vigente é 0,01 bit.

## Calibração e aprendizado

O sistema não usa LLM nem aprende silenciosamente com respostas, cliques ou
aceitação da recomendação. Os limiares do piloto são pré-declarados na política
da versão do modelo, antes de qualquer análise: no mínimo 50 jornadas rotuladas
de forma cega, 5 entrevistas cognitivas por perspectiva, falso positivo ≤ 20%,
parada incorreta ≤ 25%, ECE ≤ 0,15, Brier ≤ 0,25 e discordância entre avaliadores
≤ 30%. Rótulos externos não guardam participação, convite ou resposta. Sem essa
massa, o gate permanece bloqueado e o posterior exibido continua provisório.
Mesmo quando o gate abre, uma revisão de priors nasce como versão `draft` e não
substitui sozinha o modelo publicado. O painel administrativo registra entrevistas
cognitivas por cenário e perspectiva, sem participação, convite ou resposta; o
registro não abre o gate sozinho e não identifica pessoas. A versão
`cognitive-validation-v1` também registra se a pessoa reconheceu sua autonomia real,
considerou a orientação útil e segura e conseguiu explicar o fundamento com suas
próprias palavras. Showcase e respostas sintéticas nunca contam nesse gate.

Acoplamento que amplia o lote possui contrato explícito: diferencia a restrição de
feedback instável e política de lote, propõe reduzir uma mudança conjunta por limite
evolutivo ou contrato verificável, declara que não resolve tooling nem governança e
mede partes, responsáveis e coordenação antes de qualquer modularização ampla.

Um piloto cognitivo inicial com oito participantes é um gate operacional diferente.
Ele serve para observar compreensão, recuperação de eventos, adequação das opções e
utilidade da leitura agregada. Pode ocorrer em uma única unidade elegível; não
autoriza comparação entre duas squads com menos de cinco participantes em cada uma,
nem transforma seus resultados em calibração estatística.

## Experimento e reaplicação

Quando o recorte é elegível, o relatório persiste o experimento agregado (ação,
responsável sugerido, métrica, horizonte, critério e fundamento) e uma captura de
suporte por padrão. Uma segunda captura no mesmo projeto compara o suporte coletivo
sem identificar pessoas nem ranquear times. Reaplicação mede se o padrão perdeu ou
ganhou sustentação; não avalia indivíduos.
