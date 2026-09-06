# Modelo de avaliação

## Unidade de análise

A unidade principal é uma capacidade observável em um contexto. Cada capacidade
possui comportamentos esperados, anti-padrões, evidências, bloqueios possíveis e
relações com outras capacidades.

## Árvore de capacidades

Os eixos não são uma lista plana de frameworks. A taxonomia vigente separa oito
capacidades sociotécnicas:

1. **Estratégia de produto e valor** — direção e alinhamento, descoberta e validação,
   resultados e gestão de portfólio.
2. **Fluxo de entrega** — planejamento, refinamento, fluxo de trabalho, integração,
   release e feedback.
3. **Engenharia e qualidade** — sustentabilidade da mudança, proteção contínua de
   riscos, feedback técnico repetível e competências acessíveis ao fluxo.
4. **Arquitetura e evolução** — alinhamento ao domínio, decisões arquiteturais,
   evolutibilidade, integração e dados.
5. **Operação e confiabilidade** — investigabilidade, objetivos de confiabilidade,
   incidentes e recuperação demonstrável.
6. **Plataforma e experiência de engenharia** — autonomia com limites seguros,
   infraestrutura reproduzível e eficiência operacional.
7. **Segurança e gestão de risco** — risco na entrega, identidade, acesso e
   rastreabilidade.
8. **Sistema organizacional** — estrutura e ownership, governança habilitadora,
   liderança, colaboração, aprendizado e adaptação. Na leitura executiva este
   pilar é um meta-sistema: explica restrições que aparecem nos demais; não é
   o oitavo eixo técnico.

Cada ramo segue, quando houver evidência suficiente, `capacidade → subcapacidade →
prática → comportamento observado`. Comportamentos podem produzir sinais em vários
ramos: uma integração tardia, por exemplo, pode afetar fluxo, engenharia, arquitetura
e sistema organizacional. A pontuação é calculada separadamente em cada efeito e
mantém a mesma resposta como origem explicável; não se duplica uma nota genérica.

Cada nó pode possuir filhos e produzir outro radar. Seu nível é limitado pelo filho
com evidência mais frágil. Cada clique abre uma página própria, preserva o recorte
organizacional e apresenta um breadcrumb do macro ao micro; folhas mostram problemas
e correções. A home não indexa os oito pilares do motor: ela projeta três sistemas
— Produto, Engenharia e Operação — e uma faixa transversal de Gestão. Ausência de
evidência é rotulada como “entrevista não atravessou” ou “não avaliado”, nunca como nível zero nem como ausência de problema,
quando o evento não ocorreu ou ninguém aplicável o observou. Se o evento ocorreu e
o comportamento esperado da família não aparece, isso é falta de prática no local,
não zero inventado nem “não avaliado”.
A taxonomia não duplica o mesmo sinal para preencher frameworks diferentes.

Cloud é contexto de arquitetura e operação, não um diagnóstico autônomo nem um
eixo do radar. Quando o evento é na nuvem, o cotidiano discrimina identidade
versus autorização no recurso, blast radius do token e validação contínua — sem
perguntar AWS, Azure ou GCP. Workloads cloud poderão aprofundar os seis pilares
Well-Architected quando houver evidência discriminativa suficiente. Ferramentas
como vault aparecem como possível intervenção para um problema de gestão de
segredos demonstrado; sua presença nunca constitui um nível. Família de
capacidade (caminho de artefato, registro de imagem, esteira) também não cria
eixo: publica-se a falta do caminho, não a marca.

As folhas vigentes são direção/alinhamento, descoberta/validação, portfólio;
planejamento/refinamento, fluxo, feedback de integração e release; mudança sustentável,
proteção contínua de riscos, feedback técnico e competência acessível; domínio,
decisões, evolutibilidade e dados; impacto investigável, confiabilidade, incidentes e
recuperação; autonomia de plataforma, infraestrutura reproduzível e eficiência;
risco na entrega e identidade/acesso; ownership, governança habilitadora, liderança,
colaboração e aprendizado.

Referenciais como DORA, SRE, Well-Architected, DDD, Team Topologies, Tuckman,
TOGAF e práticas de engenharia alimentam capacidades; não viram pilares ou notas
por mera adoção nominal.

DORA é uma lente de resultado e capacidades, não um ramo equivalente ao SDLC. Uma
classificação DORA futura exigirá as cinco métricas vigentes no contexto de uma
aplicação ou serviço — lead time, frequência, tempo de recuperação de implantação
falha, taxa de falha e taxa de retrabalho — sem inferi-las apenas da entrevista.

## Contexto não é evidência

Perguntas como “usa Kafka?”, “usa Kubernetes?” ou “possui time de plataforma?” só
podem atuar como filtros de aplicabilidade ou roteamento. Elas não produzem sinal
positivo ou negativo de capacidade.

Depois do filtro, o instrumento apresenta um problema compatível com o contexto.
Por exemplo, se existe mensageria, investiga perda, duplicidade, evolução de
contratos, rastreabilidade, ownership e resposta a falhas. Se não existe, pode
investigar como o sistema lida com desacoplamento, picos e dependências por outros
meios. A capacidade avaliada é o comportamento diante do problema, não o produto
escolhido.

O mesmo vale para plataforma: o nome do time é irrelevante. Importam tempo para
obter uma capacidade, clareza do caminho suportado, autonomia com guardrails,
experiência do desenvolvedor, tratamento de exceções e feedback para evolução.

## Camadas de observação

Cada resposta pode gerar sinais em camadas diferentes:

- **Conhecimento:** reconhece riscos, opções e trade-offs.
- **Prática:** comportamento ocorre no trabalho real.
- **Consistência:** prática resiste a urgência, escala e troca de pessoas.
- **Sistema habilitador:** ferramentas, estrutura e governança favorecem a prática.
- **Resultado e aprendizado:** mede efeitos e adapta o sistema.

Isso permite distinguir “não sabe fazer”, “sabe mas está bloqueado” e “faz de
forma sustentável”.

## Estágio do comportamento por capacidade

Uma escala inicial de consistência do comportamento, sujeita a calibração
empírica. Não é o diagnóstico nem uma nota de framework:

0. **Opaco:** decisões e resultados não são observáveis.
1. **Reativo:** resposta depende de urgência e esforço individual.
2. **Repetível:** existem práticas locais, ainda frágeis ou inconsistentes.
3. **Gerenciado:** comportamento é consistente, observável e possui ownership.
4. **Adaptativo:** feedback modifica ativamente políticas, produto e plataforma.

Essa escala também expressa a distância comportamental para uma referência de alta
performance, desde que cada folha possua uma rubrica própria. A referência não é
um pacote universal de práticas: declara propósito, comportamentos observáveis,
condições habilitadoras, efeitos, evidências, reação sob pressão, sinais de
regressão e limites de interpretação. Uma folha sem esse contrato continua com a
estimativa direcional vigente, mas não pode alegar comparação normativa completa.

A referência vigente `capability-reference-v19` materializa rubricas para
`discovery-validation`, `sdlc-automation`, `release-feedback`,
`platform-autonomy`, `technical-capability`, `software-security` e
`evolvability`, `organizational-learning`, `team-ownership`,
`enabling-governance`, `leadership-management`, `collaboration`, `product-direction`, `portfolio-management`, `work-management`, `planning-refinement`, `continuous-integration`, `sustainable-design`, `quality-strategy`,
`organizational-system`, `domain-alignment` e `architecture-decisions`. Cada contrato possui propósito, cinco âncoras de
comportamento, efeito e reação sob pressão, evidências necessárias, condições
habilitadoras, regressões, práticas compatíveis, famílias de ferramenta opcionais
e limites. O meta-sistema organizacional é uma referência de leitura agregada; não
substitui as cinco folhas organizacionais nem atribui cultura a indivíduos.

A matriz vigente `capability-reference-coverage-v1` relaciona essas referências
somente aos metadados tipados dos sinais. Correspondência exata com a capacidade é
direta; no meta-sistema organizacional, sinais das cinco folhas são indiretos. A
matriz separa padrões e nós, camadas, perspectivas explícitas ou compartilhadas,
causa emitida cedo demais, pista de resposta desejável e lacunas de comportamento,
resultado ou pressão. “Cobertura mínima” significa apenas dois padrões, observação
do comportamento ou sistema, consequência e situação de pressão; não valida todos
os textos da rubrica nem autoriza recalibrar o estágio.

No corte atual, as vinte e duas referências atingem cobertura mínima. Alinhamento ao
domínio observa significado, conflitos, limites e responsabilidade na mudança e no
caso equivalente seguinte; DDD, event storming, glossário, diagrama ou ferramenta
não pontuam por presença. Em decisões arquiteturais, a referência reconstrói
contexto, alternativas, trade-offs, autoridade e reversibilidade e confronta a
escolha com seu efeito ou com a mudança seguinte. ADR, comitê, framework,
documentação e ferramenta não pontuam por presença; decisão especializada pode ser
legítima quando risco, consequência e retorno permanecem verificáveis. Em gestão do
trabalho, sete eventos distintos cobrem dez padrões sob as lentes de todas as
perspectivas, distinguindo fluxo até uma consequência útil de ocupação, início
contínuo e espera normalizada. Limites de trabalho, retirada de compromisso e
tratamento de bloqueios só sustentam estágio quando aparecem em comportamento e
efeito; quadro, sprint, método ou ferramenta não pontuam por presença. Em feedback
técnico, a prática é confrontada com a consequência da mesma mudança: decisão
alterada a tempo, retrabalho posterior, avanço sem retorno ou efeito descoberto
mais tarde. O fato chega à camada de resultado sem escolher causa ou ferramenta e
sem aumentar o peso da prática. Cobertura mínima continua sendo propriedade do
instrumento, não evidência de maturidade da organização nem validação da rubrica.

Em release e feedback, os estágios distinguem rastreabilidade e decisão sobre
implantação, exposição e contenção, além do efeito que retorna ao caminho de
entrega. Entrega contínua, exposição progressiva e GitOps são práticas compatíveis
somente quando reduzem variação, preservam reconciliação e produzem esse
comportamento; presença nominal não concede estágio. Frequência declarada também
não vira classificação DORA sem telemetria por serviço e estabilidade em contexto.

Em competência técnica, o estágio observa quem consegue decidir e executar um
trabalho equivalente com segurança. Ele distingue conhecimento ausente,
concentração em especialistas ou fornecedores, conhecimento bloqueado por acesso ou
carga, aprendizagem local e capacidade distribuída que se adapta à demanda. Cargo,
curso, certificação e matriz declarada permanecem contexto: só a execução posterior
e seu efeito sustentam a comparação.

Em segurança de software, o estágio observa se risco relevante altera desenho,
escopo, proteção ou liberação e se exceções e escapes retornam ao sistema. Scanner,
SAST, checklist, certificação e time especializado são habilitadores possíveis,
não evidência suficiente. Obrigações e segregação legítimas não penalizam o estágio
quando decisão, evidência e efeito são proporcionais e verificáveis.

Em evolutibilidade, a referência compara o custo da mudança equivalente seguinte:
partes alteradas, responsáveis, espera, coordenação, contornos e retrabalho.
Arquitetura formal, DDD, microsserviços, diagramas ou tecnologia recente não
concedem estágio; monólito ou tecnologia antiga também não penalizam quando limites
e contratos permitem mudanças pequenas, seguras e adaptadas pelo efeito.

Em aprendizado organizacional, o estágio exige ligar evento, mudança escolhida,
responsável, capacidade e revisão no caso seguinte. A referência separa ausência de
fechamento de uma ação local bloqueada por prioridade, política ou autoridade.
Retrospectiva, post-mortem, treinamento, comunidade ou repositório não concedem
estágio sem alteração demonstrada no trabalho ou no sistema. Ter o rito e
aprender no dia a dia são leituras distintas.

Em ownership, o estágio confronta responsabilidade declarada com autoridade sobre
prioridade, risco, mudança e acompanhamento do resultado. Responsabilidade
compartilhada pode ser sustentável quando a decisão entre as partes é explícita;
nome do time, owner nominal, RACI ou Team Topologies não concedem estágio. Carga,
espera e conflito precisam conseguir alterar capacidade, fronteira ou interação.

Em governança habilitadora, o estágio observa qual risco ou obrigação altera a
decisão, que evidência sustenta o caminho e como eficácia e espera realimentam o
controle. Aprovação ou segregação legítima não é fragilidade quando proporcional e
verificável; comitê, política, auditoria, certificação ou ferramenta de policy não
concedem estágio. Casos comuns precisam receber decisão no fluxo e exceções devem
ter autoridade, validade, proteção compensatória e reconciliação explícitas.

Em liderança e gestão, o estágio observa como risco, carga, conflito e resultado
alteram compromissos e se restrições recebem decisão no nível capaz de removê-las.
Maturidade do local inclui clima, incentivo e liderança: se erro e risco podem
ser ditos, o que é reconhecido (apagar o incêndio versus evitá-lo), se a
reunião “tranquila” omite o que importa e se war room é o único momento em que
a liderança vê o sistema. Prazo, ocupação, heroísmo, culpa e silêncio são
efeitos observáveis do sistema, não rótulos de uma pessoa. O relatório
constata o recorte; não identifica gerente de baixa performance. Cargo,
one-on-one, modelo de liderança ou cerimônia não concedem estágio; recorrência,
poder, perspectivas e consequência precisam ser triangulados. `culture` isolado
continua sem mecanismo publicável.

Em colaboração, o estágio observa como uma dependência compartilha contexto,
produz decisão e devolve resultado, incluindo se uma ajuda recorrente transfere
capacidade para o trabalho seguinte. Handoff, fila, escalada e coordenação permanente
são diferentes de parceria temporária com propósito e encerramento. Proximidade,
reunião, cerimônia, ferramenta ou modelo nominal de interação não concedem estágio;
conflito e variação também não são fragilidade automática.

Em direção de produto, o estágio observa se problema, público, resultado e risco
orientam prioridade e investimento e se a evidência possui autoridade para alterar,
reduzir ou interromper a solução. Entrega, aceite ou reporte posterior não
substituem efeito na decisão. OKR, roadmap, cargo de produto, Scrum, cerimônia ou
dashboard não concedem estágio por presença.

Em gestão de portfólio, o estágio exige que iniciar uma prioridade torne explícito
o trabalho não iniciado, reduzido ou interrompido. Resultado, risco, custo de atraso
e capacidade precisam rever investimento e distribuição de pessoas; uma lista
ordenada sem retirada de compromisso não demonstra escolha. PMO, comitê, orçamento
anual, OKR ou ferramenta de portfólio não concedem estágio por presença.

Em planejamento e refinamento, o estágio observa se problema, exemplos, riscos e
dependências permitem assumir um compromisso pequeno e reversível, e se o primeiro
feedback confirma ou reabre o trabalho enquanto o contexto ainda está disponível.
Incerteza restante deve continuar explícita e capaz de alterar escopo; definição
completa antecipada não é o alvo. Backlog, refinement, sprint planning, estimativa,
cerimônia, framework ou ferramenta não concedem estágio por presença.

Em integração contínua, o estágio observa quanto tempo mudanças permanecem
isoladas, quando encontram a versão compartilhada, que conflitos e incompatibilidades
aparecem e se uma falha corrige o caminho antes de acumular outro lote. A
consequência do primeiro retorno distingue correção oportuna de reabertura tardia.
Git, branches, trunk-based development, pull request, pipeline ou servidor de
integração não concedem estágio por presença.

Em design sustentável, o estágio observa se cada mudança reduz ou acumula
dependência, contorno, defeito, conhecimento concentrado e custo para a alteração
seguinte. Melhoria incremental, testes de caracterização e decisões reversíveis
são práticas compatíveis quando produzem esse efeito; dívida em backlog ou espera
por reescrita não demonstram capacidade por si. SOLID, Clean Architecture, padrão,
linguagem, framework, ferramenta ou idade da tecnologia não concedem nem retiram
estágio por presença.

Em estratégia de qualidade, o estágio observa como risco, impacto, exemplos e
histórico alteram prevenção, feedback e observação, e se escapes modificam a
proteção seguinte. Especialização de QA pode ser habilitadora; torna-se fragilidade
quando vira etapa, fila ou transferência de responsabilidade. Cobertura, quantidade
de testes, suíte, pirâmide, shift-left, scanner ou ferramenta não concedem estágio
por presença.

O nível 4 exige comportamento adaptativo sustentado e consequência observada. Não
é concedido por CI/CD, GitOps, SRE, plataforma, cloud, DDD, Scrum, Vault ou qualquer
outro nome. Da mesma forma, tecnologia antiga não reduz o estágio por idade: perde
sustentação quando os eventos demonstram variação, espera, risco, baixa
reprodutibilidade, dependência pessoal, ausência de rastreabilidade ou incapacidade
de aprender.

Não haverá média simples entre pilares. O relatório deve destacar capacidades
limitantes, relações causais plausíveis e confiança. Uma nota agregada, se existir,
será secundária e explicável. Acrescentar eixos ao radar (por exemplo quinze
dimensões nomeadas) não aumenta precisão: cada eixo novo exige dois padrões
independentes e população elegível; sem isso o mapa só ganha mais marcadores “?”.

O relatório preserva três leituras independentes:

1. **diagnóstico causal**, que explica comportamento, efeito, mecanismo, contenção
   e autoridade;
2. **estágio comportamental**, que localiza a distância para a referência daquela
   capacidade;
3. **performance operacional**, formada por telemetria de aplicações ou serviços
   quando ela existir, sem ser inferida da entrevista.

Confiança e cobertura acompanham as três leituras e nunca são fundidas num score
único. Categoria de performance DORA depende das métricas vigentes por aplicação
ou serviço e de referência comparável; não deriva do estágio 0–4.

O relatório vigente apresenta, na home, um mapa de apresentação com três sistemas
— **Produto**, **Engenharia** e **Operação**. Engenharia abre entrega, qualidade de
software, arquitetura, plataforma e segurança. Observabilidade fica sob Publicação,
dentro de Entrega. Gestão (responsabilidade, governança, liderança, colaboração e
aprendizado) é faixa transversal, não um quarto azulejo. `planning-refinement`
permanece no pilar `delivery-flow` do motor e aparece em Produto só na projeção.
A leitura começa pelo problema observado, pela hipótese de por que ele se
repete e pelo que fazer agora. Estágio ordinal e o mapa de sistemas
são auxiliares: o produto é o problema e o teste, não o nível. Os oito pilares
continuam a árvore que `CapabilityTaxonomy.organize` agrega; não indexam a home.
Um sistema ou disciplina **aparece** quando há folha publicada (cobertura ≥ 1) ou
finding; não some porque o pilar antigo não fechou duas crianças. Pasta sem folha
nem finding permanece “entrevista não atravessou”, nunca zero e nunca “sem
problema”. Essa leitura mora no mapa fechado; a first plane em leitura
de problema não ensaia folha sem finding. Clicar numa disciplina abre
uma linha do recorte (o que **não é**), a dor local, o efeito no
sistema, o que fazer e o teste. A folha nomeia a dor local; o nível acima nomeia
o efeito que essa dor gera no sistema — são problemas distintos. O motor registra arestas entre disciplinas com causa publicada. A first
screen não publica sessão de cruzamento. Ao abrir a disciplina, o
mesmo problema aparece com o nome daquele recorte; o nível acima usa
outro nome; a área maior lista as menores. Disciplina sem recorte
próprio não abre pergunta na home. O mapa completo fica no detalhe.
Não inventa finding. O radar dos oito pilares abre no detalhe.
Unidades apontam **Ver cobertura deste time**.
Cada eixo
avaliado do motor é uma estimativa direcional de 0 a 4 calculada dentro da
capacidade, acompanhada do volume de evidência. Um eixo ausente significa
cobertura temática insuficiente — dois padrões distintos da disciplina não
apareceram nas entrevistas — e nunca é interpretado como falta de pessoas,
zero ou fragilidade.
Vermelho é reservado a uma fragilidade efetivamente avaliada. O mapa não combina
sistemas em uma nota global e não substitui findings, bloqueios ou recomendações.

O cálculo pré-piloto converte pesos em níveis ordinais, agrega primeiro por pessoa e
só então estima o recorte. Isso impede que várias respostas correlacionadas da mesma
pessoa simulem consenso. Recortes pequenos recebem um prior organizacional fraco,
sem ocultar o resultado local, e publicam um intervalo beta-binomial de 90%.
O cálculo combina sinais comportamentais convergentes dentro da capacidade.
Evidências em direções opostas reduzem a confiança e são mostradas como contradição,
em vez de desaparecerem em uma média. Um comportamento positivo é aprofundado para
verificar consistência sob urgência; um comportamento frágil abre discriminação de
causas prováveis. O resultado continua sujeito a calibração empírica.

Confiança e cobertura são dimensões diferentes. Confiança expressa convergência e
volume populacional; cobertura expressa variedade de padrões independentes e de
folhas examinadas. Repetir o mesmo padrão por várias pessoas não completa cobertura.
Uma folha exige inicialmente dois padrões distintos para publicar nível; o ramo
expõe a proporção de folhas cobertas e mantém as demais como não avaliadas. Um ramo
só publica sua própria nota quando ao menos metade da cobertura temática e a maioria
de seus filhos atingem cobertura completa; uma única prática forte nunca representa
o pilar inteiro.

Problemas recorrentes são selecionados dentro de cada folha, nunca por um limite
global que permita a um pilar esconder outro. Um padrão negativo precisa aparecer
em pelo menos duas participações e, em grupos maiores, em 20% da população elegível.
Cada folha pode sustentar findings; o relatório publicado agrupa o mesmo padrão
uma única vez e lista as folhas afetadas. Um sinal cruzado não vira três
prioridades com o mesmo texto. Nível alto sem finding é descrito como convergência
positiva; nível crítico sem padrão recorrente explicita que as fragilidades estão
dispersas e não inventa uma causa ou intervenção.

## Classificação sociotécnica

Cada recorte elegível recebe `Opaco`, `Reativo`, `Repetível`, `Gerenciado` ou
`Adaptativo`. A classificação usa a menor capacidade com confiança mínima, não a
média. Ao consolidar a hierarquia, uma unidade ancestral também é limitada pela
classificação mais baixa entre descendentes publicáveis. O relatório preserva as
capacidades fortes e identifica explicitamente capacidades ou unidades limitantes;
isso evita que uma squad forte esconda outra bloqueada.
O primeiro plano é o diagnóstico: o que está acontecendo, o que as entrevistas
mostraram, o que testar e como saber se funcionou. O estágio ordinal descreve a
consistência do comportamento no elo limitante e fica em detalhe, não no
cabeçalho. O mapa da home localiza sistemas observados (Produto, Engenharia,
Operação) e a faixa de Gestão; não publica “N de 4” no primeiro plano.

Quando perspectivas elegíveis descrevem sistemas incompatíveis, o primeiro plano
fica `Inconclusivo`: a divergência suspende a classificação ordinal até distinguir
visibilidade, fronteira e poder de decisão. Os níveis internos continuam disponíveis
para investigação, mas não são apresentados como diagnóstico executivo do recorte.
Cada divergência é calculada e publicada na folha observada. No detalhamento, ela
suspende somente a folha ou o ramo que a contém; uma divergência de aprendizado não
substitui o diagnóstico de arquitetura, segurança ou fluxo. O resumo global continua
inconclusivo quando qualquer divergência elegível impede uma leitura única do sistema.

Na interface gerencial, o relatório global é o resultado das entrevistas,
não o laudo de uma decisão. A first screen mostra, nesta ordem: os
problemas publicados por área (cada um com caminho, sustentação
provisória, fundamento e impacto esperado), a amostra desta leitura
(pessoas e unidades) e os três sistemas (Produto, Engenharia, Operação).
Gestão nunca é o quarto azulejo. Quem autoriza decide depois de ler.
O cartão compacto permanece no detalhe da disciplina e quando não há
finding publicado. Abrir uma área é capítulo: uma linha do que o
recorte observa e as dores no nome local; a mesma evidência só
reaparece no outro recorte quando o cruzamento já foi publicado.
O caso opaco atravessa Produto, Engenharia e Gestão com nomes
locais do mesmo evento.
Termos como posterior, população aplicável
e mecanismo causal não substituem a descrição concreta do trabalho, da espera,
da decisão ou do risco observado.
Investigar permanece distinto de decidir. A contagem não esconde padrões atrás
de um corte de quatro nem permite interpretar `Opaco` como “um único problema”.
O panorama da first screen não prescreve transformações simultâneas; a
sequência de dependências permanece no detalhe. Cada dor publica o
próprio caminho; o produto não escolhe uma decisão no lugar de quem
autoriza.
O relatório distingue a capacidade principal do finding de seus efeitos relacionados.
A primeira localiza onde a evidência e o tratamento se ligam; os demais mostram
impacto transversal sem transformar todo pilar afetado em dono da intervenção.
Cada contenção visível recebe indicação própria (política para diretoria,
caminho para engenharia, operação para incidente). Relatos opostos no mesmo
evento, entre quem observou, publicam adoção desigual — não “impossível
escolher uma causa”.
Mecanismo detalhado, classe de solução (prática, política, desenho organizacional,
capacidade de plataforma ou família de ferramenta — nunca uma marca que pontue) e
fundamentos ficam visíveis em cada caminho do índice. O limitador
é o elo útil no piso da classificação, com finding amarrado; folhas de cloud
aninhadas não ocupam o palco só porque a nota foi baixa. A página da folha usa o
estágio daquela folha, não o rótulo global. Divergência de perspectiva no home é
o finding (as lentes não veem o mesmo sistema); contradição só discrimina quando
está no limitador escolhido. A mesma suspensão vale no detalhamento: uma hipótese
candidata pode ser mostrada para investigação, mas não autoriza intervenção antes
da triangulação. Mapa de sistemas, mapa por estrutura, calibração e revisão
cognitiva permanecem acessíveis, sem esconder as demais dores: administração,
leituras por público e instrumento ficam em `details`; as unidades na first
screen ocupam uma linha e não reimprimem o cartão global. Nota, confiança, população, incerteza e versão do modelo são
informações secundárias e explicáveis. Ferramenta, framework e nome de time
continuam sem pontuar.

O mapa de sistemas e o detalhe das capacidades usam estágios qualitativos e **cobertura
temática**, sem decimal, percentual ou “N de 4” no primeiro plano. Cobertura informa quantos
aspectos do tema foram observados; não significa força causal, consenso nem tamanho
da amostra. Ordinal, intervalo e
cobertura exata permanecem auditáveis nos detalhes. Toda capacidade avaliada abaixo de 4 deve ter
uma correção de fragilidade ou uma evolução recomendada sustentada pelo grupo. Uma
evolução não reclassifica prática forte como problema: identifica o comportamento
de peso intermediário — exceção, coordenação ou capacidade ainda local — que impede
o estado adaptativo.

Uma opção pode produzir sinais em várias capacidades quando o mesmo comportamento
possui efeitos sociotécnicos demonstráveis. Uma melhoria com dono e efeito revisto,
por exemplo, sustenta aprendizado, organização e fluxo; a presença nominal de uma
retrospectiva continua sem pontuação.

## Tipos de evidência

- escolha em cenário com trade-off real;
- ordenação de ações diante de um incidente ou atraso;
- frequência e tempo (“na última implantação...”, “nos últimos 90 dias...”);
- artefato verificável, opcional (post-mortem, dashboard, ADR, política);
- contraste entre papéis sobre o mesmo evento;
- consequência observada e mudança posterior.

## Bloqueios

Todo comportamento ausente pode ser relacionado a um ou mais bloqueios:

- conhecimento ou experiência;
- tempo, prioridade ou incentivos;
- dependência e desenho organizacional;
- ausência ou baixa usabilidade de plataforma/ferramenta;
- política, permissão ou governança;
- arquitetura e dívida técnica;
- confiança, comunicação ou segurança psicológica.

A existência de QA, SRE, plataforma ou outra função especializada não altera o
nível por si só. A ausência de um título também não reduz automaticamente a capacidade inferida:
o instrumento verifica se a competência necessária entra cedo no fluxo, por pessoas,
colaboração ou guardrails. Quando não entra, registra lacuna de competência acessível;
quando a especialidade vira handoff ou fila, registra o bloqueio organizacional.

O relatório deve distinguir ausência de necessidade, solução alternativa adequada,
lacuna de capacidade e bloqueio. Não recomendar tecnologia antes de identificar o
problema, o impacto e as restrições.

O relatório agrupa padrões recorrentes pela área de capacidade e apresenta cada
item como diagnóstico e correção recomendada. Padrões de comportamento e padrões
de causa permanecem distinguíveis na API; ambos reutilizam a mesma evidência
agregada e nunca expõem a resposta que os originou.

## Leituras por autoridade

O painel projeta o mesmo diagnóstico em quatro leituras. Diretoria recebe impactos,
decisões de política, estrutura e investimento e restrições compartilhadas que
podem exigir capacidade comum. Liderança de tecnologia recebe arquitetura,
plataforma, segurança, fluxo, confiabilidade, ownership e demais dependências
sistêmicas. Gerência local recebe ações sob autoridade da unidade, restrições
recebidas e escaladas com o decisor provável. Especialistas e times preservam
hipóteses concorrentes, evidência favorável e contrária, lacunas, fundamento e
experimento completo.

As leituras não recalculam causa, prioridade ou solução. O identificador do padrão,
a contenção, a autoridade e o passo do portfólio permanecem os mesmos em todas as
projeções. Uma restrição compartilhada pode aparecer para diretoria e liderança
técnica porque ambas possuem decisões diferentes sobre o mesmo problema; isso não
duplica o diagnóstico nem sua prioridade.
Na interface, uma leitura por autoridade sem conteúdo é omitida em vez de repetir
“nenhuma decisão”. Se apenas o diagnóstico principal estiver disponível, não se
cria navegação que retorne ao próprio cartão.

## Capacidade, sintoma, causa e solução

O modelo não salta de uma resposta para uma ferramenta recomendada. Ele constrói
uma cadeia explicável:

```text
sinais -> sintoma -> capacidade afetada -> bloqueios/causas prováveis
       -> impacto e abrangência -> opções de intervenção
```

Um problema pode afetar várias folhas e pilares ao mesmo tempo. Ele é publicado uma
única vez, com todas as capacidades afetadas; não se replica a mesma prioridade em
cada ramo. Depois de discriminar a causa, o recomendador também identifica a
**capacidade de solução** necessária e estima sua prontidão com evidência positiva
do mesmo recorte:

1. **Não demonstrada:** a entrevista não encontrou execução; isso não prova
   inexistência.
2. **Declarada, ainda não executada:** há conhecimento, intenção ou mecanismo
   habilitador, sem prática coletiva observável.
3. **Local:** a capacidade aparece na prática, mas depende do contexto ou de poucas
   pessoas.
4. **Operacional:** execução repetível aparece em alcance relevante e em mais de uma
   camada de evidência.
5. **Adaptativa:** prática, consistência e consequência convergem entre perspectivas
   e modificam o sistema.

Prontidão para solucionar não é a nota da capacidade afetada. Ela impede que uma
intervenção estrutural seja prescrita como se a organização já possuísse autoridade,
competência e mecanismo para executá-la. Quando a prontidão não foi demonstrada, o
menor experimento deve primeiro criar ou testar essa capacidade.

Uma mesma baixa frequência de deploy pode resultar de empacotamento manual,
aprovações externas, branches longevas, regressão custosa, ambientes indisponíveis
ou alto acoplamento. Cada origem pede intervenções diferentes. GitOps, CI/CD ou uma
plataforma só aparecem como opções quando atacam o gargalo observado e são
compatíveis com contexto, custo e capacidade atual.

Também não se exige que o respondente conheça nomes como trunk-based development,
golden source, shift-left ou platform engineering. Pergunta-se como o trabalho
acontece, quanto espera, onde diverge, como falha e como se recupera.

## Capacidade local e capacidade do sistema

O modelo mantém separadas:

- capacidade local do time;
- restrição recebida de outro time, plataforma, governança ou arquitetura;
- problema compartilhado por várias unidades;
- iniciativa local que contorna um problema sem resolvê-lo sistemicamente;
- capacidade organizacional de difundir uma solução comprovada.

Um script local de deploy pode demonstrar aprendizado e iniciativa do time, mas
também revelar ausência de uma capacidade organizacional reutilizável. O time não
deve ser penalizado pela restrição como se fosse falta de conhecimento; a
organização, porém, deve enxergar o gargalo transversal.

## Capacidade como propriedade sociotécnica

Entrega não pertence apenas a desenvolvimento. Produto, gestão, QA, mobile, web,
dados, segurança, operações, arquitetura e outras disciplinas moldam o mesmo SDLC.
O assessment mede como essas perspectivas interagem, onde o trabalho espera e como
decisões atravessam fronteiras.

Uma capacidade pode receber sinais de vários perfis. Por exemplo, feedback rápido
pode ser observado no modo como PM reduz incerteza, QA participa da definição,
engenharia integra mudanças e gestão trata dependências. O finding final combina
essas evidências sem calcular “capacidade do cargo” nem expor respostas individuais.

Modelos como Tuckman e Team Topologies ajudam a interpretar comportamento de
formação, conflito, autonomia, carga cognitiva e modos de interação. Não se pergunta
se alguém conhece os modelos; observa-se como estrutura times, reage a conflitos,
define responsabilidades e muda o desenho quando surgem sinais de sobrecarga.

Identidade e proteção de credencial, resiliência de dependência e assistência por
modelo são **contexto + cenário** sobre folhas já existentes (`cloud-security`,
confiabilidade, qualidade, governança). Não criam pilares por inventário de
ferramenta. Se o evento não ocorre no ambiente, a folha permanece não avaliada.
