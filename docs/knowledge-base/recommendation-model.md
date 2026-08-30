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

O finding separa ainda problema, capacidades afetadas e capacidade necessária para
resolver a causa. A prontidão dessa capacidade usa evidências positivas do recorte e
é classificada como não demonstrada, declarada, local, operacional ou adaptativa.
Ausência de evidência nunca é apresentada como prova de inexistência. Esse estado
condiciona o tamanho do experimento: uma solução estrutural não é recomendada como
primeiro passo quando ainda falta execução, alcance ou aprendizado para sustentá-la.

No contrato executivo, a recomendação carrega também a proveniência agregada que
sustenta a decisão: pessoas que podiam observar a situação, pessoas favoráveis,
padrões de resposta, perspectivas e contradições. Esses números descrevem a base
observada; não são chamados de evidência ampla, não são convertidos em porcentagem
causal e não escondem a incerteza remanescente. Cobertura temática, suporte coletivo,
posterior causal e prontidão da solução permanecem medidas separadas.

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
`observed_as`, `explained_by`, `addressed_by` e `grounded_in`. Toda intervenção
publicada precisa possuir o caminho completo; a rede é explicável e não aprende
silenciosamente com cliques ou respostas.

O prior de evidência insuficiente varia com a observabilidade, sem uma reserva fixa
que cresça artificialmente com a quantidade de causas. O suporte publicado de uma
causa usa a opção escolhida da hipótese, não o sintoma do nó pai: uma família cujo
identificador coincide com um padrão de evidência conta somente essas observações.
O relatório lista no máximo três causas distintas por padrão, sem repetir o mesmo
texto em cada folha afetada. Incerteza e discriminadores ficam sob demanda.
Snapshots individuais nunca são publicados.

## Recomendações

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

Cada página do relatório escolhe um desfecho: preservar prática sustentada;
corrigir ou evoluir o limitador quando há finding amarrado; discriminar quando o
limitador mistura evidência, quando o finding **é** a divergência de perspectiva,
quando as fragilidades estão dispersas sem padrão recorrente, ou quando ainda
competem várias explicações; ou declarar evidência insuficiente. Esses três
vazios não se confundem: falta de amostra, contradição no mesmo elo e
fragilidade sem causa amarrada pedem textos diferentes. Discriminar pede
observação de um evento recente, não um playbook. Um ramo em 4 não herda
discriminação de um neto de cloud.

Discriminação sem causa isolada usa um contrato narrativo da capacidade: declara o
sinal observado, as explicações que ainda competem e o evento que precisa ser
reconstruído. O nome da capacidade nunca é encaixado mecanicamente em uma frase.
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

A decisão principal explicita que é a primeira entre `N` problemas confirmados e
que a ordenação combina alcance e intensidade do sinal. Os demais não desaparecem: o panorama
mantém o total real e mostra até quatro próximos candidatos. A abrangência por
unidade é uma projeção da mesma evidência agregada, não um segundo recomendador.

O cartão mostra separadamente intensidade do sinal e alcance e
explica por que a frente venceu o próximo candidato; confiança não entra nessa
ordenação. Padrões preservados individualmente podem ser agrupados em **frentes
diagnósticas** por relações explícitas do catálogo. O agrupamento organiza sintomas
que merecem uma decisão coordenada, mas nunca declara causa comum comprovada.

Além de abrangência, o contrato publicado inclui mecanismo de restrição, contenção,
impactos, severidade e evidência faltante. Severidade permanece indeterminada até
existir evidência própria de impacto; ela não deriva do peso da alternativa.
Abrangência descreve onde o padrão foi
observado; contenção descreve quem ou o que provavelmente consegue removê-lo. Se a
entrevista não discriminou isso, o resultado permanece indeterminado.

O contrato também declara a autoridade provável para agir. Sem mecanismo ou
contenção discriminados, o problema continua publicado, porém a orientação muda
para investigação e nenhuma solução específica é prescrita. O panorama separa
decisões organizacionais, capacidades compartilhadas, problemas locais e contenção
ainda indeterminada; cada item navega para o finding canônico no detalhamento.

A apresentação é uma projeção determinística do mesmo finding, não um segundo motor
de recomendação. No first screen, o cartão vem antes do estágio e do mapa de
contraste. Ele traduz o contrato para linguagem operacional nesta ordem:
situação observada, base das entrevistas, capacidade atual para agir, teste proposto,
critério de sucesso e limite da decisão. Quando o limitador é do sistema
organizacional, o texto lembra que aquele pilar é um meta-sistema, não um oitavo
eixo técnico. Classe de solução, referência e opções ficam sob demanda. Quando a prontidão não foi demonstrada, o texto diz apenas que as
entrevistas ainda não mostraram o caminho funcionando; nunca conclui inexistência.
As perspectivas que sustentam a leitura são nomeadas, contradição zero é explícita e
capacidade principal fica separada dos efeitos relacionados. O fundamento mostra
fonte, princípio aplicado e vínculo com a evidência, além da classe de solução.

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
registro não abre o gate sozinho e não identifica pessoas.

## Experimento e reaplicação

Quando o recorte é elegível, o relatório persiste o experimento agregado (ação,
responsável sugerido, métrica, horizonte, critério e fundamento) e uma captura de
suporte por padrão. Uma segunda captura no mesmo projeto compara o suporte coletivo
sem identificar pessoas nem ranquear times. Reaplicação mede se o padrão perdeu ou
ganhou sustentação; não avalia indivíduos.
