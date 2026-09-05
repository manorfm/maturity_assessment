# Plano: mapa da organização para a diretoria

A projeção da home (onda A) já está vigente. Este arquivo guarda a árvore
completa com lacunas — candidatas à onda E — e o mapeamento folha → área.
O cartão e o enxugamento visual continuam em
[`executive-decision-narrative-plan.md`](executive-decision-narrative-plan.md)
e [`report-presentation-plan.md`](report-presentation-plan.md).

## Problema e público

A home trata oito pilares como se fossem áreas da organização. Mistura
função (produto, plataforma, segurança), etapa de ciclo (integração
contínua, planejamento e refinamento) e atributo (evolutibilidade) no
mesmo nível. Um diretor não reconhece o organograma nem o sistema de
engenharia.

Público: diretoria na página principal. Gerência e especialistas no
drill-down.

## Evidência

No showcase, o mapa do caso médio publica quatro pares no mesmo nível:
fluxo de entrega, arquitetura e evolução, operação e confiabilidade,
segurança e gestão de risco. Engenharia e qualidade, plataforma e
sistema organizacional somem porque o pilar exige duas folhas cobertas —
mesmo quando já existe finding em portfólio, plataforma ou aprendizado.

Dentro de fluxo de entrega, “integração contínua” e “fluxo de trabalho”
aparecem como irmãos. Isso sugere SDLC ou cerimônia, não o comportamento
avaliado.

## O que não fazer

Não aprofundar o mapa em ciclo de vida (requisito → desenho → build →
teste → release). SDLC é modelo de etapa; o produto avalia comportamento
e restrição. DORA já está na base como lente de resultado, não como
eixo. Não criar um décimo quinto eixo. Não pontuar ferramenta, cargo ou
cerimônia. Folhas diagnósticas permanecem as mesmas até um contrato novo
justificar folha nova.

Integração contínua **não** entra dentro de fluxo de trabalho como
subprocesso. Fluxo de trabalho é espera, lote e ocupação. Integração é
quando a mudança se encontra com o resto. São folhas irmãs sob **entrega**,
não uma dentro da outra.

Fluxo de trabalho **não** é o SDLC. SDLC **não** é o fluxo de entrega.
Fluxo de entrega é o caminho até o usuário: o que entra, o que espera, o
que se encontra, o que chega.

## Hipótese de resultado

A home mostra **disciplinas do sistema de entrega**, não departamentos.
Uma empresa adaptativa de dezoito pessoas exerce as mesmas disciplinas
que uma de dois mil; a diferença é consistência sob pressão e
aprendizado que muda o próximo ciclo — não a existência de uma área.

O diretor lê sistemas de trabalho. O desenvolvedor abre **Engenharia** e
vê entrega, qualidade de software e arquitetura. Qualidade não concorre
com plataforma nem com segurança na home. A precisão continua nas folhas.

## Regra de nome

Substantivo curto que uma empresa opaca já reconhece. O comportamento
fica no drill-down e no cartão, não no rótulo do mapa.

- Não verbo de campanha (“apostar”, “fazer andar”, “deixar o risco”).
- Não cerimônia ou ferramenta (refinamento, integração contínua, SDLC).
- Não cargo ou área formal (VP de Engenharia, time de plataforma).
- Não jargão que só a empresa adaptativa usa (evolutibilidade,
  observabilidade, meta-sistema).

## Correção da hipótese anterior

Oito fatias no mesmo nível **faz qualidade concorrer** com plataforma,
segurança e arquitetura. Isso é organograma disfarçado: QA versus SRE
versus arquitetura. A maior população (quem desenvolve) não se vê.

Seis caixas na home sem um recorte interno de Engenharia também falha:
vira departamento.

O meio-termo: a **home tem quatro sistemas**. Engenharia é o sistema em
que o desenvolvedor trabalha. Lá dentro cabem entrega, qualidade de
software, arquitetura e plataforma. Plataforma é ofício do caminho
compartilhado, como arquitetura é ofício do custo de mudar — não uma
fatia rival na home. O que a base chama de sistema organizacional **não
é pilar**: a organização é o conjunto. Vira faixa transversal. Os oito
pilares do motor continuam por baixo.

## Home (três sistemas)

1. **Produto**
2. **Engenharia** — entrega, qualidade de software, arquitetura,
   plataforma, segurança.
3. **Operação** — confiabilidade, incidentes, recuperação.
   Observabilidade não fica aqui: acompanha a publicação da mudança.

## Como a árvore aprofunda sem inventar eixo

Três tipos de nó. Só a folha vigente pontua.

- **Grupo** — pasta de índice, sem nota própria.
- **Folha** — um dos 29 IDs atuais.
- **Lacuna** — comportamento que o grafo já pergunta ou que o evento
  exige; ainda sem contrato de folha. Não entra no motor nesta onda.

Tuckman e Team Topologies **interpretam** o grupo Modelo de times.
Não viram filhos forming/storming nem pontuam o modelo.

`Liberação` passa a **Publicação**.

## Árvore com drill-down

```text
HOME
├─ Produto
│    ├─ Direção                          [grupo]
│    │    └─ Direção                     [folha product-direction]
│    │         resultado na decisão      [lacuna]
│    │         hipótese compartilhada    [lacuna]
│    ├─ Descoberta                       [grupo]
│    │    └─ Descoberta                  [folha discovery-validation]
│    │         evidência de uso          [lacuna]
│    │         problema antes da solução [lacuna]
│    ├─ Portfólio                        [grupo]
│    │    └─ Portfólio                   [folha portfolio-management]
│    │         o que para quando entra   [lacuna]
│    │         custo de atraso           [lacuna]
│    └─ Planejamento                     [folha planning-refinement]
│
├─ Engenharia
│    ├─ Entrega
│    │    ├─ Fluxo de trabalho           [folha work-management]
│    │    │    espera · lote · ocupação  [grupo sobre a mesma folha]
│    │    ├─ Integração                  [folha continuous-integration]
│    │    └─ Publicação                  [folha release-feedback]
│    │         Observabilidade           [folha observability-practice]
│    │
│    ├─ Qualidade de software
│    │    ├─ Sustentabilidade da mudança [folha sustainable-design]
│    │    ├─ Estratégia de qualidade     [folha quality-strategy]
│    │    ├─ Feedback técnico            [folha sdlc-automation]
│    │    └─ Competência técnica         [folha technical-capability]
│    │
│    ├─ Arquitetura
│    │    ├─ Domínio                     [folha domain-alignment]
│    │    ├─ Decisões                    [folha architecture-decisions]
│    │    ├─ Evolução                    [folha evolvability]
│    │    └─ Dados                       [folha integration-data]
│    │
│    ├─ Plataforma
│    │    ├─ Acesso a capacidades        [folha platform-autonomy]
│    │    │    caminho encontrado        [lacuna — discovery do path]
│    │    │    fila vs self-service      [já é a folha]
│    │    │    adoção do caminho         [lacuna]
│    │    ├─ Infraestrutura              [folha reproducible-infrastructure]
│    │    └─ Eficiência                  [folha cloud-efficiency]
│    │
│    └─ Segurança
│         ├─ Segurança na entrega        [folha software-security]
│         └─ Identidade e acesso         [folha cloud-security]
│
└─ Operação
     ├─ Confiabilidade                   [folha reliability-practice]
     ├─ Incidentes                       [folha incident-management]
     └─ Recuperação                      [folha cloud-reliability]


FAIXA  Gestão  (nome em aberto vs Governança)
├─ Modelo de times                       [grupo — Tuckman/TT interpretam, não pontuam]
│    ├─ Dois times no mesmo artefato     [lacuna — já no grafo: fronteira, superfície]
│    ├─ Prioridade entre times           [lacuna]
│    └─ Desenho do time sob pressão      [lacuna — estrutura adaptada vs implícita]
├─ Responsabilidade                      [folha team-ownership]
│    ├─ Serviço ponta a ponta            [lacuna — já no grafo]
│    ├─ Aceite encerra o dono            [lacuna — padrão vigente]
│    └─ Responsável é uma pessoa         [lacuna]
├─ Governança                            [folha enabling-governance]
│    ├─ Aprovação proporcional           [lacuna]
│    └─ Controle sem propósito           [lacuna]
├─ Liderança                             [folha leadership-management]
├─ Colaboração                           [folha collaboration]
└─ Aprendizado                           [folha organizational-learning]
     ├─ Ciclo fecha                      [lacuna]
     └─ Lista sem dono                   [já é finding da folha]
```

Ciclo curto, lote e aprendizado que muda a aposta **são** os problemas
de agilidade. Continuam sem nó “Agilidade”.

Dois times no mesmo artefato ancoram em Entrega (espera/coordenação),
Arquitetura (acoplamento) e na faixa (responsabilidade / modelo de
times). Um finding, três efeitos — sem Tuckman no rótulo.

## Faixa transversal — ainda em aberto o nome

O oitavo ramo do motor (ownership, governança, liderança, colaboração,
aprendizado) **atravessa os quatro**. Não é o quinto sistema. A
organização é o conjunto; este ramo é *como se decide e se aprende*
dentro de cada ofício.

### Governança não é Segurança

O instrumento já separa os dois no evento, não no organograma.

- **Segurança:** a ameaça muda o desenho ou o caminho da mudança.
  Identidade, acesso, achado no prazo. Auditoria que não reduz o risco
  pretendido não conta.
- **Governança:** a regra, a aprovação ou a autoridade. O mesmo
  controle para risco baixo e alto; a velocidade que depende de
  conhecer alguém; a aprovação que não explica qual risco protege.

Uma empresa pode ter segurança forte e governança frágil (ameaça bem
modelada, mas tudo espera a mesma assinatura). Ou o contrário (SOC2
preenchido, ameaça não muda a entrega). Por isso não viram um pilar
só. Segurança permanece sistema da home. Governança é tema da faixa
transversal — ou filha dela.

### Gestão não é par de Operação

Operação é o sistema em produção. Gestão é **como se escolhe, aloca e
escala** — e também uma **perspectiva** (lente), não um ofício a
pontuar. Quem gerencia observa portfólio, poder e carga; não gera nota
por cargo.

O comportamento de gestão no dia a dia já tem dono:

| O que a gestão faz | Onde já entra |
| --- | --- |
| O que entra e o que sai da capacidade | Produto (portfólio, planejamento) |
| Espera, lote, coordenação | Engenharia → Entrega |
| Quem pode decidir, escalar, proteger | Faixa transversal |
| Se o ciclo seguinte muda com evidência | Produto + Aprendizado |

Gestão **não** ganha fatia ao lado de Operação. Candidata a **nome da
faixa transversal**, com governança, liderança, responsabilidade e
aprendizado como filhas. Risco: parecer avaliação de gestores. A
alternativa é manter o nome **Governança** na faixa e deixar gestão só
como perspectiva.

### Agilidade não é nó

Não entra como pilar, nem como irmã de Entrega. Scrum, SAFe, squad e
cerimônia não pontuam. O que as pessoas chamam de agilidade, neste
produto, é o **efeito** de três comportamentos já mapeados:

- o trabalho anda em ciclo curto (Entrega);
- a evidência pode mudar a aposta (Produto);
- o aprendizado fecha e altera o próximo ciclo (filha da faixa).

O estágio 0–4 de Entrega e Produto *é* a leitura de quão “ágil” o
sistema é na prática. Um nó “Agilidade” no mapa repetiria o erro da
integração contínua: nome de movimento no lugar de disciplina.

Na home não ganha fatia. Aparece no cartão quando o finding tem
contenção nesta faixa — ancorado no sistema em que a restrição surgiu.

## Onde entram os nomes que faltavam

Não são fatias novas na home. São folhas ou lentes.

| Nome pedido | Onde entra | Por que não é fatia da home |
| --- | --- | --- |
| Engenharia | Sistema da home | É o trabalho de construir e mudar software. |
| Qualidade de software | Filha de Engenharia | Não concorre com plataforma nem segurança. |
| Observabilidade | Filha de Publicação (Entrega) | Acompanha a mudança que chegou. Não é Operação nem qualidade de código. |
| Plataforma | Filha de Engenharia | Mesmo tipo de ofício que arquitetura: caminho e custo de mudar. |
| FinOps | Filha de Plataforma (`cloud-efficiency` → Eficiência) | Custo e uso mudam operação e investimento. Não é departamento financeiro. |
| Governança | Tema da faixa transversal (ou o nome dela) | Distinta de Segurança. Não é fatia da home. |
| Gestão | Perspectiva + candidata a nome da faixa | Não é par de Operação. Não pontua cargo. |
| Agilidade | Efeito de Entrega + Produto + Aprendizado | Não é nó. O estágio dessas disciplinas é a leitura. |
| Dados | Três lugares, uma lente | Significado e contrato → Arquitetura / Dados. Evidência que muda aposta → Produto. Telemetria → Operação / Observabilidade. Perspectiva `data` continua a lente. |
| Qualidade (QA) | Perspectiva + qualidade de software | Quem observa risco na mudança. Não é caixa rival de segurança. |

Entrega **não** absorve FinOps, dados, observabilidade nem qualidade de
software. Entrega é só o caminho do trabalho até o usuário.

## Termos que saem do primeiro plano

| Hoje | Por que sai | Rótulo da disciplina |
| --- | --- | --- |
| Integração contínua | Cerimônia / ferramenta | Integração |
| Planejamento e refinamento | Cerimônia | Planejamento |
| Release e feedback | Jargão de pipeline | Publicação |
| Evolutibilidade | Jargão | Evolução |
| Observabilidade no mesmo nível de qualidade | Concorre com ofício errado | Operação → Observabilidade |
| Estratégia de produto e valor | Ensaio | Produto |
| Engenharia e qualidade | Dois ofícios colados | Engenharia → Qualidade de software |
| Plataforma e experiência de engenharia | Ensaio + cargo | Plataforma |
| Sistema organizacional | Parece a empresa inteira | Governança (faixa transversal) |
| Plataforma no mesmo nível de Engenharia | Parece departamento | Engenharia → Plataforma |
| Defeitos recebem feedback técnico repetível | SDLC | Feedback técnico |
| Estrutura e ownership | Anglicismo | Responsabilidade |

IDs das folhas não mudam nesta onda. Muda rótulo e pai de apresentação.

## O que não aumenta

Três camadas distintas. Esta correção só mexe na terceira.

| Camada | Hoje | Depois |
| --- | --- | --- |
| Grafo de entrevista (`graph`) | Nós de cenário e probe | **Igual.** Nenhuma pergunta nova. |
| Folhas diagnósticas | 29 IDs | **Iguais.** Nenhum ID novo. |
| Pilares que o motor agrega | 8 (`product-value` … `organizational-system`) | **Iguais.** `CapabilityTaxonomy.organize` não muda. |
| Mapa da home | Os 8 pilares, se avaliados | **3 sistemas**; Engenharia abre 5 disciplinas; gestão é faixa transversal |

Não é um radar maior. É um índice para diretoria por cima das mesmas folhas.

## Impacto no motor

Mudar só a **ordem visual** não recalcula posterior, finding, prioridade nem classificação. Esses usam folha e padrão, não o rótulo do pilar.

O que quebraria o motor é **reparentar folha dentro de `capability-taxonomy.ts`**:

- `organize()` publica pilar se cobertura ≥ 0,5 e metade das crianças está avaliada. Juntar fluxo + qualidade + arquitetura num único pai exigiria ~6 folhas publicadas para a área “Engenharia” aparecer — pior que hoje.
- `observablePillars` do plano de amostra conta filhos do pilar.
- `domain-model.test.ts` e a API `capabilityGroups` fixam os oito IDs.
- `decideReportOutcome` achata folhas avaliadas; o score da folha não muda, o *quando o ramo aparece* muda.

Por isso a correção mapeada é uma **projeção**: `organizationalAreas` consome as 29 folhas e desenha a home. O motor continua nos 8 pilares / 29 folhas.

Único efeito colateral intencional: a home mostra a área se houver **folha publicada ou finding**, mesmo com o pilar antigo não avaliado. Isso é regra de apresentação, não de inferência.

## Correção mapeada (folha → área)

`planning-refinement` muda só de pasta visual (de fluxo de entrega para produto). O ID e o sinal no grafo permanecem.

| ID da folha | Pai no motor | Home | Disciplina | Rótulo |
| --- | --- | --- | --- | --- |
| `product-direction` | product-value | Produto | — | Direção |
| `discovery-validation` | product-value | Produto | — | Descoberta |
| `portfolio-management` | product-value | Produto | — | Portfólio |
| `planning-refinement` | delivery-flow | Produto | — | Planejamento |
| `work-management` | delivery-flow | Engenharia | Entrega | Fluxo de trabalho |
| `continuous-integration` | delivery-flow | Engenharia | Entrega | Integração |
| `release-feedback` | delivery-flow | Engenharia | Entrega | Liberação |
| `sustainable-design` | engineering-quality | Engenharia | Qualidade de software | Sustentabilidade da mudança |
| `quality-strategy` | engineering-quality | Engenharia | Qualidade de software | Estratégia de qualidade |
| `sdlc-automation` | engineering-quality | Engenharia | Qualidade de software | Feedback técnico |
| `technical-capability` | engineering-quality | Engenharia | Qualidade de software | Competência técnica |
| `domain-alignment` | architecture-evolution | Engenharia | Arquitetura | Domínio |
| `architecture-decisions` | architecture-evolution | Engenharia | Arquitetura | Decisões |
| `evolvability` | architecture-evolution | Engenharia | Arquitetura | Evolução |
| `integration-data` | architecture-evolution | Engenharia | Arquitetura | Dados |
| `observability-practice` | operations-reliability | Engenharia | Entrega → Publicação | Observabilidade |
| `reliability-practice` | operations-reliability | Operação | — | Confiabilidade |
| `incident-management` | operations-reliability | Operação | — | Incidentes |
| `cloud-reliability` | operations-reliability | Operação | — | Recuperação |
| `platform-autonomy` | platform-experience | Engenharia | Plataforma | Acesso a capacidades |
| `reproducible-infrastructure` | platform-experience | Engenharia | Plataforma | Infraestrutura |
| `cloud-efficiency` | platform-experience | Engenharia | Plataforma | Eficiência |
| `software-security` | security-risk | Engenharia | Segurança | Segurança na entrega |
| `cloud-security` | security-risk | Engenharia | Segurança | Identidade e acesso |
| `team-ownership` | organizational-system | (transversal) | Governança | Responsabilidade |
| `enabling-governance` | organizational-system | (transversal) | Governança | Governança |
| `leadership-management` | organizational-system | (transversal) | Governança | Liderança |
| `collaboration` | organizational-system | (transversal) | Governança | Colaboração |
| `organizational-learning` | organizational-system | (transversal) | Governança | Aprendizado |

Nenhuma folha some. Nenhuma folha é criada. `cloud-*` continua contexto dentro da área, não eixo cloud.

## O que falta — e o que não entra

Falta na home: disciplina **visível** quando a entrevista já sustentou
a folha — hoje some se o pilar pai não fechou duas crianças.

Não falta departamento de dados, design, FinOps, SRE ou cloud. Alta
performance na base é valor com fluxo, estabilidade, segurança,
responsabilidade e aprendizado sustentáveis — as oito disciplinas
acima. Dados e design já observam por perspectiva. Custo de atraso e
significado do dado na decisão estão finos como contrato de folha; não
justificam fatia nova sem rubrica própria.

Folha nova só com contrato. Esta onda não abre folha.

## Riscos

- Parecer organograma e pontuar cargo (“temos plataforma”).
- Esconder finding de folha porque a área pai ainda não tem duas folhas.
- Renomear para SDLC “moderno” (value stream, CI/CD) e repetir o erro
  com outro jargão.

## Menor experimento

O projetor da onda A, o cartão da onda B e a first screen da onda C
estão vigentes. Resta a massa que exercita fronteira de times e
segurança ≠ governança (onda D).

## Mudanças na base

`assessment-model.md` (árvore de apresentação vs folhas do motor),
`recommendation-model.md` (home por área), um projetor
`organizational-areas` ao lado da taxonomia — **sem reparentar**
`capability-taxonomy.ts` —, `open-decisions.md` (oito pilares deixam de
ser o índice da home). O grafo de entrevista e os IDs de folha ficam.

## Ordem

A sequência vigente das ondas A–E (mapa, cartão, UX, sintéticos,
lacunas) está em
[`report-presentation-plan.md`](report-presentation-plan.md). Este
arquivo permanece o detalhe do mapa.
