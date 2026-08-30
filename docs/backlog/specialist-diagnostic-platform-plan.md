# Plano: plataforma especialista de diagnóstico sociotécnico

Status: direção aprovada para evolução futura. Este documento é a referência
canônica do objetivo completo e da sequência de implementação. Nada descrito como
futuro integra o comportamento vigente até ser promovido à base de conhecimento.

## Relação com os demais planos

- [`engineering-diagnostic-plan.md`](engineering-diagnostic-plan.md) transformou a
  apresentação de maturidade em diagnóstico e continua dono dos contratos causais
  ainda incompletos.
- [`decision-report-plan.md`](decision-report-plan.md) continua dono do fechamento
  de decisão e dos contratos de intervenção por folha.
- [`instrument-evolution-plan.md`](instrument-evolution-plan.md) e
  [`probabilistic-inference-roadmap.md`](probabilistic-inference-roadmap.md)
  continuam donos da validação cognitiva, revisão cega e calibração empírica.
- Este plano integra essas linhas e acrescenta operating model, funding, workforce,
  plataforma interna, portfólio de transformação e relatórios por autoridade.

## Problema e públicos

O produto atual encontra padrões úteis, mas ainda exige facilitação para separar
problema local de restrição organizacional, explicar causas concorrentes e ordenar
uma transformação ampla. O objetivo é servir:

- diretoria, para decidir política, funding, estrutura e investimentos comuns;
- liderança de tecnologia, para coordenar arquitetura, plataforma, segurança,
  confiabilidade e capacidade técnica;
- gerência de unidade, para distinguir ações locais de dependências recebidas;
- especialistas e times, para investigar evidência, causa e experimento.

## Hipótese de resultado

A plataforma recebe evidências comportamentais acessíveis a pessoas com pouco
repertório técnico e produz uma cadeia explicável:

```text
fato observado
  -> comportamento e consequência
  -> padrão recorrente
  -> hipóteses causais concorrentes
  -> evidência a favor, contra e faltante
  -> mecanismo de restrição
  -> abrangência e contenção
  -> capacidade necessária
  -> opções de intervenção e pré-condições
  -> menor experimento e critério de sucesso
  -> portfólio local, compartilhado ou organizacional
```

A solução pode ser prática, capacitação, política, modelo gerencial, desenho
organizacional, funding, arquitetura, capacidade de plataforma ou família de
ferramenta. Nenhuma delas é escolhida apenas por presença ou ausência nominal.

## Invariantes

- Uma ferramenta, framework, cargo, cerimônia ou estrutura não pontua capacidade.
- Tema técnico não determina abrangência nem contenção.
- Ocorrer em todas as unidades significa transversalidade observada; não prova
  causa organizacional.
- Ausência de time de plataforma não é um problema por si só. Demanda recorrente,
  espera, reinvenção, contornos e concentração podem demonstrar necessidade de uma
  capacidade compartilhada; o desenho da solução vem depois.
- Controle de segurança não é automaticamente burocracia. O instrumento distingue
  obrigação legítima, risco contextual, política indiferenciada, ownership ausente
  e controle usado para compensar baixa confiança técnica.
- Cultura nunca é causa terminal. Ela é decomposta em incentivo, autoridade,
  reação a erro, segurança psicológica, capacidade, prioridade ou comportamento de
  liderança observáveis.
- Conhecimento ausente, conhecimento concentrado e conhecimento bloqueado por
  política exigem intervenções diferentes.
- Uma divergência de perspectiva pode revelar visibilidade, fronteira ou poder; não
  vira fragilidade automaticamente.
- O mesmo sintoma pode receber soluções diferentes por mecanismo e contenção.
- A plataforma não usa LLM para inferência ou recomendação.

## Modelo-alvo

### Motor de evidências

Responsável por fatos agregados, comportamentos, consequências, perspectivas,
contradições, cobertura, recorrência e lacunas. Preserva anonimato e não publica
respostas individuais.

### Motor de diagnóstico

Mantém hipóteses concorrentes e determina, com incerteza explícita:

- capacidade principal e efeitos relacionados;
- mecanismo da restrição;
- abrangência observada;
- contenção provável;
- impacto e severidade, somente quando demonstrados;
- evidência que ainda falta;
- autoridade necessária para agir.

### Motor de intervenção

Seleciona opções compatíveis com mecanismo, contenção e capacidade disponível.
Cada opção declara pré-condições, custo e risco qualitativos, reversibilidade,
incompatibilidades, risco deslocado, fundamento, indicador e critério de sucesso.

### Planejador de transformação

Agrupa findings sem apagá-los, identifica dependências e produz uma sequência:

1. estabilizar risco e ownership;
2. encurtar feedback;
3. remover restrições compartilhadas;
4. mudar operating model, governança e funding quando demonstrado;
5. desenvolver capacidade adaptativa e workforce.

## Ontologia necessária

- `ObservedFact`;
- `BehaviorPattern`;
- `SystemCondition`;
- `CausalHypothesis`;
- `ConstraintMechanism`;
- `OccurrenceScope`;
- `ConstraintContainment`;
- `Impact`;
- `EvidenceFor`, `EvidenceAgainst` e `EvidenceGap`;
- `RequiredCapability`;
- `InterventionOption`;
- `InterventionPrerequisite`;
- `InterventionRisk`;
- `DecisionOwner`;
- `SuccessSignal`;
- `DiagnosticSystem`;
- `TransformationPortfolio`.

Relações mínimas do grafo:

- `observed_as`;
- `may_be_explained_by`;
- `supported_by`;
- `contradicted_by`;
- `causes` e `amplifies`;
- `contained_by`;
- `requires_capability`;
- `addressed_by`;
- `requires_prerequisite`;
- `incompatible_with`;
- `may_displace_risk_to`;
- `measured_by`;
- `grounded_in`.

## Matriz de localização

O resultado combina duas dimensões independentes.

**Abrangência:** local, compartilhada, transversal, organizacionalmente observada,
externa ou indeterminada.

**Contenção:** squad, múltiplas squads, serviço compartilhado, plataforma,
arquitetura, política, estrutura, liderança, portfólio/funding, fornecedor,
regulador ou indeterminada.

Exemplos:

| Evidência | Abrangência | Contenção possível |
|---|---|---|
| Uma squad integra tarde | local | squad ou indeterminada |
| Todas aguardam o mesmo ambiente | transversal | plataforma compartilhada |
| Duas squads colidem no mesmo artefato | compartilhada | arquitetura/ownership |
| Toda mudança recebe a mesma aprovação | transversal | política organizacional |
| Uma squad não usa um caminho disponível | local | conhecimento ou adequação |
| Uma squad aguarda DBA por regra corporativa | local | política/serviço comum |

## Famílias de jornadas a completar

### Mudança e entrega

Reconstruir lote, isolamento, integração, feedback, ambiente, aprovação, deploy,
exposição, feature toggle, reversão e consequência. Cobrir branch longa sem
perguntar estratégia nominal; toggle em código versus controle em runtime; release
train; pipeline nominal; frequência de entrega e lead time por serviço.

### Dependência, arquitetura e ownership

Cobrir artefato compartilhado, contratos, versões, responsabilidade operacional,
serviço sem owner, legado desconhecido, conhecimento concentrado, fronteiras e
prioridades incompatíveis.

### Liderança, cultura e aprendizagem

Cobrir reação a erro, contestação, prioridade, interrupção, incentivo, capacidade
para melhorar, desenvolvimento de pessoas e acompanhamento de ações. Cultura é
traduzida em mecanismos observáveis, nunca usada como explicação residual.

## Bibliotecas de sistemas de problemas

O catálogo deve possuir, no mínimo, sistemas explicáveis para:

- integração e feedback tardios;
- plataforma ausente, inadequada ou sem adoção;
- governança compensando baixa confiança;
- segurança tardia ou desproporcional;
- ownership e fronteiras incompatíveis;
- projeto operando sob nome de produto;
- funding sem feedback de resultado;
- legado e conhecimento concentrado;
- qualidade como fase final;
- operação dependente de heróis;
- melhoria sem capacidade, autoridade ou fechamento;
- lacuna de competência e reskilling;
- carga cognitiva e fragmentação de ferramentas;
- arquitetura que exige coordenação para cada mudança.

Cada sistema preserva os padrões originais e não declara causa comum sem evidência.

## Catálogo de intervenções

Toda intervenção deve declarar:

- problemas e mecanismos compatíveis;
- mecanismos incompatíveis;
- nível de decisão e responsável provável;
- pré-condições;
- capacidade necessária e prontidão atual;
- custo, risco e reversibilidade qualitativos;
- efeitos colaterais e risco deslocado;
- estratégia de adoção;
- fundamento com fonte, versão/data, princípio e limitações;
- menor experimento, indicadores e critério de sucesso.

Exemplos de classes: prática de time, capacitação, política, desenho
organizacional, modelo gerencial, funding, plataforma, arquitetura e família de
ferramenta. A marca nunca é o diagnóstico.

## Relatórios-alvo

### Diretoria

Resultados ameaçados, frentes organizacionais, restrições compartilhadas, decisões
de funding/política/estrutura, capacidades comuns e sequência de transformação.

### Liderança de tecnologia

Arquitetura, plataforma, segurança, fluxo, confiabilidade, ownership, workforce,
dependências e portfólio de intervenções sistêmicas.

### Gerência de unidade

Problemas locais, dependências recebidas, autoridade disponível, escaladas,
experimentos, indicadores e capacidades sustentadas.

### Times e especialistas

Fatos, hipóteses, evidências a favor/contra, lacunas, opções técnicas,
pré-condições, fundamentos e detalhes do experimento.

Todos são projeções do mesmo finding e do mesmo grafo; não haverá recomendadores
paralelos por público.

## Sequência de implementação

### Validação humana de linguagem antes do piloto

- realizar entrevistas cognitivas com pessoas de baixo repertório técnico;
- validar leitura sem facilitador por diretoria e gerência reais;
- registrar compreensão, recuperação do evento e termos confusos no painel;
- revisar o conteúdo somente a partir dessa evidência, sem tratar teste automatizado
  como substituto da validação humana.

### Onda F — Relatórios por público

- diretoria;
- liderança de tecnologia;
- gerência local;
- especialistas e times.

### Onda G — Showcase controlado

- um caso por mecanismo isolado;
- casos com mesmo sintoma e contenções diferentes;
- organização saudável com problema local;
- organização frágil com problemas locais e organizacionais;
- divergência isolada sem contaminar pilares não relacionados.

### Onda H — Validação humana e calibração

- entrevistas cognitivas por perspectiva;
- leitura sem facilitador;
- revisão cega de causas;
- piloto diverso;
- falso positivo, parada incorreta, Brier, ECE e discordância;
- publicação explícita de nova versão somente após gate.

## Dependências

```text
validação humana de linguagem
  -> F relatórios
  -> G showcase
  -> H validação e calibração
```

F pode prototipar cedo, mas não fecha antes de D e E.
Nenhum piloto amplo começa antes da validação humana de linguagem e de G; nenhuma calibração muda o modelo
publicado antes de H.

## Critérios de aceite por capacidade nova

- respondível sem conhecer o nome da prática;
- fato separado de causa;
- pelo menos três hipóteses concorrentes nos sintomas críticos;
- evidência favorável, contrária e faltante;
- abrangência separada de contenção;
- capacidade necessária separada da solução;
- mais de uma intervenção quando o mecanismo permitir;
- pré-condições, riscos e fundamento explícitos;
- teste unitário, integração, relatório e showcase;
- auditoria sem erro ou aviso;
- documentação vigente atualizada quando promovida.

## Gate para posicionamento de plataforma especialista

O produto só pode adotar esse posicionamento quando demonstrar, em casos revisados:

- mesmo sintoma com causas e soluções diferentes;
- problemas locais separados de restrições organizacionais;
- necessidade de plataforma inferida por demanda e efeito, não por organograma;
- segurança legítima distinta de governança compensatória;
- ferramenta condicionada à capacidade necessária;
- transformação ordenada por dependências e autoridade;
- perguntas acessíveis a pessoas não técnicas;
- relatório compreensível sem facilitador;
- evidência contrária e limitações visíveis;
- referências auditáveis;
- falsos positivos e causas revisados externamente;
- resultado reproduzível na mesma versão do modelo.

## Riscos

- ampliar cobertura e reduzir poder discriminativo;
- produzir consultoria genérica por excesso de soluções;
- chamar sintoma transversal de causa organizacional;
- recomendar reestruturação quando falta apenas capacidade local;
- recomendar ferramenta antes de provar necessidade operacional;
- usar cultura como explicação não falsificável;
- criar relatório tão completo que nenhuma decisão fique clara;
- iniciar piloto antes de estabilizar linguagem e showcase;
- manter planos concluídos no backlog em vez de promover comportamento vigente.
