# Modelo de avaliação

## Unidade de análise

A unidade principal é uma capacidade observável em um contexto. Cada capacidade
possui comportamentos esperados, anti-padrões, evidências, bloqueios possíveis e
relações com outras capacidades.

## Árvore de capacidades

Os eixos não são uma lista plana de frameworks. A taxonomia alvo aprovada para o
MVP separa seis capacidades sociotécnicas:

1. **Estratégia de produto e valor** — direção e alinhamento, descoberta e validação,
   resultados e gestão de portfólio.
2. **Fluxo de entrega** — planejamento, refinamento, fluxo de trabalho, integração,
   release e feedback.
3. **Engenharia e qualidade** — design sustentável, estratégia de qualidade,
   automação do SDLC, segurança de software e capacidade técnica.
4. **Arquitetura e evolução** — alinhamento ao domínio, decisões arquiteturais,
   evolutibilidade, integração e dados.
5. **Operação, confiabilidade e plataforma** — observabilidade, confiabilidade,
   incidentes, plataforma/autonomia e cloud/infraestrutura.
6. **Sistema organizacional** — estrutura e ownership, governança habilitadora,
   liderança, colaboração, aprendizado e adaptação.

Cada ramo segue, quando houver evidência suficiente, `capacidade → subcapacidade →
prática → comportamento observado`. Comportamentos podem produzir sinais em vários
ramos: uma integração tardia, por exemplo, pode afetar fluxo, engenharia, arquitetura
e sistema organizacional. A pontuação é calculada separadamente em cada efeito e
mantém a mesma resposta como origem explicável; não se duplica uma nota genérica.

Cada nó pode possuir filhos e produzir outro radar. Seu nível é limitado pelo filho
com evidência mais frágil. Cada clique abre uma página própria, preserva o recorte
organizacional e apresenta um breadcrumb do macro ao micro; folhas mostram problemas
e correções. Os seis eixos macro permanecerão visíveis após a migração do catálogo,
mas ausência de evidência é
rotulada como “não avaliado”, nunca como nível zero. A taxonomia não duplica o mesmo
sinal para preencher frameworks diferentes.

Cloud é contexto de arquitetura e operação, não maturidade autônoma. Quando o
catálogo possuir evidência discriminativa suficiente, workloads cloud poderão
aprofundar os seis pilares Well-Architected — excelência operacional, segurança,
confiabilidade, eficiência de performance, otimização de custos e sustentabilidade.
Ferramentas como vault aparecem como possível intervenção para um problema de
gestão de segredos demonstrado; sua presença nunca constitui um nível.

As folhas vigentes são direção/alinhamento, descoberta/validação, portfólio;
planejamento/refinamento, fluxo, integração e release; design sustentável, qualidade,
automação, segurança e capacidade técnica; domínio, decisões, evolutibilidade, dados;
observabilidade, confiabilidade, incidentes, plataforma e cloud; ownership,
governança habilitadora, liderança, colaboração e aprendizado. Cloud aprofunda
infraestrutura reproduzível, segurança/identidade, confiabilidade e eficiência.

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
positivo ou negativo de maturidade.

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

## Maturidade por capacidade

Uma escala inicial, sujeita a calibração empírica:

0. **Opaco:** decisões e resultados não são observáveis.
1. **Reativo:** resposta depende de urgência e esforço individual.
2. **Repetível:** existem práticas locais, ainda frágeis ou inconsistentes.
3. **Gerenciado:** comportamento é consistente, observável e possui ownership.
4. **Adaptativo:** feedback modifica ativamente políticas, produto e plataforma.

Não haverá média simples entre pilares. O relatório deve destacar capacidades
limitantes, relações causais plausíveis e confiança. Uma nota agregada, se existir,
será secundária e explicável.

O relatório vigente apresenta, no mapa global e nos recortes hierárquicos seguros,
os seis eixos macro e suas explosões. Cada eixo avaliado é uma estimativa direcional de 0 a 4 calculada
dentro da capacidade, acompanhada do volume de evidência. Um eixo ausente significa
evidência insuficiente, aparece com marcador neutro “?” e nunca é interpretado como
zero ou fragilidade. Esse estado não permite aprofundamento até atingir cobertura;
vermelho é reservado a uma fragilidade efetivamente avaliada. O radar não combina pilares
em uma nota global e não substitui findings, bloqueios ou recomendações.

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

Na interface gerencial, cada página fecha um único ato de fala: um limitador (a
folha avaliada mais frágil do recorte, nunca “e mais N”), um desfecho
(preservar, corrigir, evoluir, discriminar ou evidência insuficiente) e um
próximo passo amarrado a esse limitador. Divergência de perspectiva e
contradição no limitador são desfechos de discriminação — não abrem várias
frentes de intervenção. Radar, mapa por estrutura, calibração e revisão cognitiva
permanecem visíveis, mas não competem com a decisão: o instrumento fica em
`details` no rodapé; o mapa por estrutura omite recortes que só duplicam o
diagnóstico global. Nota, confiança, população, incerteza e versão do modelo são
informações secundárias e explicáveis. Quando há experimento, ele conecta
problema, impacto, ação, responsável provável, medida, prazo de revisão e
resultado esperado. O fundamento da intervenção (fonte e princípio) fica sob
demanda e não entra na nota.

Níveis inteiros são exibidos sem decimal (`4/4`); decimais aparecem somente quando
representam diferença real (`3.7/4`). Toda capacidade avaliada abaixo de 4 deve ter
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
nível por si só. A ausência de um título também não reduz automaticamente maturidade:
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

## Capacidade, sintoma, causa e solução

O modelo não salta de uma resposta para uma ferramenta recomendada. Ele constrói
uma cadeia explicável:

```text
sinais -> sintoma -> capacidade afetada -> bloqueios/causas prováveis
       -> impacto e abrangência -> opções de intervenção
```

Uma mesma baixa frequência de deploy pode resultar de empacotamento manual,
aprovações externas, branches longevas, regressão custosa, ambientes indisponíveis
ou alto acoplamento. Cada origem pede intervenções diferentes. GitOps, CI/CD ou uma
plataforma só aparecem como opções quando atacam o gargalo observado e são
compatíveis com contexto, custo e capacidade atual.

Também não se exige que o respondente conheça nomes como trunk-based development,
golden source, shift-left ou platform engineering. Pergunta-se como o trabalho
acontece, quanto espera, onde diverge, como falha e como se recupera.

## Maturidade local e maturidade do sistema

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

## Maturidade como propriedade sociotécnica

Entrega não pertence apenas a desenvolvimento. Produto, gestão, QA, mobile, web,
dados, segurança, operações, arquitetura e outras disciplinas moldam o mesmo SDLC.
O assessment mede como essas perspectivas interagem, onde o trabalho espera e como
decisões atravessam fronteiras.

Uma capacidade pode receber sinais de vários perfis. Por exemplo, feedback rápido
pode ser observado no modo como PM reduz incerteza, QA participa da definição,
engenharia integra mudanças e gestão trata dependências. O finding final combina
essas evidências sem calcular “maturidade do cargo” nem expor respostas individuais.

Modelos como Tuckman e Team Topologies ajudam a interpretar comportamento de
formação, conflito, autonomia, carga cognitiva e modos de interação. Não se pergunta
se alguém conhece os modelos; observa-se como estrutura times, reage a conflitos,
define responsabilidades e muda o desenho quando surgem sinais de sobrecarga.

Identidade e proteção de credencial, resiliência de dependência e assistência por
modelo são **contexto + cenário** sobre folhas já existentes (`cloud-security`,
confiabilidade, qualidade, governança). Não há sétimo pilar nem inventário de
ferramenta. Se o evento não ocorre no ambiente, a folha permanece não avaliada.
