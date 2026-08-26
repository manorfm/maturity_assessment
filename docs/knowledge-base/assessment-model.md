# Modelo de avaliação

## Unidade de análise

A unidade principal é uma capacidade observável em um contexto. Cada capacidade
possui comportamentos esperados, anti-padrões, evidências, bloqueios possíveis e
relações com outras capacidades.

## Pilares iniciais

1. **Fluxo e entrega** — tamanho de lote, feedback, dependências, previsibilidade,
   trabalho não planejado e capacidade de concluir.
2. **Engenharia e SDLC** — design, testes, revisão, integração, segurança,
   implantação, manutenção e gestão de dívida.
3. **Arquitetura e evolução** — limites, acoplamento, decisões, fitness functions,
   alinhamento ao domínio e custo de mudança.
4. **Confiabilidade e observabilidade** — sinais úteis, SLOs, resposta a incidentes,
   aprendizado, capacidade e redução de toil.
5. **Plataforma, cloud e segurança** — caminhos pavimentados, self-service,
   guardrails, permissões, resiliência e responsabilidade compartilhada.
6. **Organização e interação** — topologias de time, carga cognitiva, ownership,
   conflitos, segurança psicológica, formação e coordenação.
7. **Governança e estratégia** — clareza de decisão, risco, priorização, políticas,
   arquitetura corporativa e alinhamento entre intenção e execução.
8. **Aprendizado e adaptação** — experimentação, feedback do cliente, retrospectiva,
   uso de dados, IA com supervisão e mudança sustentada.

Referenciais como DORA, SRE, Well-Architected, DDD, Team Topologies, Tuckman,
TOGAF e práticas de engenharia alimentam capacidades; não viram pilares ou notas
por mera adoção nominal.

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
um radar apenas das capacidades para as quais o grupo
elegível produziu sinais. Cada eixo é uma estimativa direcional de 0 a 4 calculada
dentro da capacidade, acompanhada do volume de evidência. Um eixo ausente significa
evidência insuficiente e nunca é desenhado como zero. O radar não combina pilares
em uma nota global e não substitui findings, bloqueios ou recomendações.

O cálculo vigente combina sinais comportamentais convergentes dentro da capacidade.
Evidências em direções opostas reduzem a confiança e são mostradas como contradição,
em vez de desaparecerem em uma média. Um comportamento positivo é aprofundado para
verificar consistência sob urgência; um comportamento frágil abre discriminação de
causas prováveis. O resultado continua sujeito a calibração empírica.

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
