# 04 — Metodologia de evidência

> Espinha metodológica: **Evidence-Centered Design (ECD)** de Mislevy, Steinberg e
> Almond, a abordagem usada pelo ETS para avaliações complexas com redes
> bayesianas. O repositório já pratica boa parte da ECD sem nomeá-la; a v0.5
> torna o contrato explícito, o que permite testar, auditar e evoluir cada peça
> separadamente.

## 1. Por que ECD

Uma avaliação é um **argumento de evidência**: queremos afirmar algo que não
observamos diretamente (a capacidade de uma unidade) a partir do que observamos
(o que as pessoas relatam de eventos). A ECD organiza esse argumento em camadas:

| Camada ECD | Pergunta | No produto |
|---|---|---|
| **Análise do domínio** | O que importa saber sobre este domínio? | Literatura, rubricas, escadas de apropriação (Anexo A) |
| **Modelagem do domínio** | Que afirmações queremos fazer, com que evidência e em que situações? | Argumento por capacidade: afirmação → evidência → situação que a revela |
| **Modelo de capacidade** *(student model)* | Quais variáveis latentes descrevem a unidade? | Estágio 0–4 por folha, por unidade; causas binárias; letramento |
| **Modelo de evidência** | Como uma resposta vira observável e como o observável atualiza as variáveis? | Regras de evidência (opção → observáveis) + modelo de medição (05) |
| **Modelo de tarefa** | Que situações provocam a evidência? | Famílias de evento, cenários, probes, variantes por perspectiva |
| **Modelo de montagem** | Como combinar tarefas numa entrevista? | Trilhas, tronco comum, amostragem matricial, restrições de conteúdo (06) |
| **Entrega** (arquitetura de 4 processos) | Seleção → apresentação → identificação de evidência → acumulação de evidência | Motor adaptativo (06) → tela → regras de evidência → modelo de medição (05) |

**Diferença importante para a ECD educacional:** aqui o respondente **não é o
examinado**. Ele é um **informante** sobre a unidade (time, área, empresa). O
modelo de capacidade descreve a unidade, e cada pessoa funciona como um
observador com ponto de vista e viés próprios. Isso muda o modelo estatístico:
em vez de "a habilidade da pessoa", estimamos "o estado da unidade visto por
observadores imperfeitos" (05 §4).

## 2. Mapeamento para o repositório

| Conceito ECD | Existe hoje | Mudança v0.5 |
|---|---|---|
| Variável do modelo de capacidade | Folha + estágio ordinal (média) | Variável discreta 0–4 **com distribuição posterior** por unidade (05) |
| Tarefa | `AssessmentNode` (`scenario`, `probe`, `context`) | Mantido; ganha `taskFamily`, `testlet` e `pressure` explícitos |
| Regra de evidência | `Option.signals[]` com `weight` −2..+2 | `Option.evidence[]` com **âncora de estágio, discriminação, camada, testlet** (§4) |
| Modelo de medição | `CapabilityAssessment` (média + beta) | Modelo de observadores com severidade de perspectiva (05) |
| Rede causal | Famílias binárias independentes | Rede noisy-OR com vazamento (05 §8) |
| Montagem | Trilhas por contexto, probes por EIG | + amostragem matricial e restrições de conteúdo (06) |
| Argumento por achado | `Finding` com evidência a favor e contra | Mantido; ganha o formato de Toulmin (§3) |

## 3. O argumento de cada achado (Toulmin)

Cada achado publicado precisa preencher os seis elementos. O relatório (ficha do
nó, bloco 5) é a projeção pública deste argumento.

| Elemento | Pergunta | Exemplo |
|---|---|---|
| **Afirmação** | O que dizemos? | "Na área de Pagamentos, a integração de mudanças é tardia (estágio 1)" |
| **Dados** | O que foi observado? | 8 de 11 relatos de engenharia: a última mudança ficou isolada mais de 5 dias |
| **Garantia** | Por que esses dados sustentam a afirmação? | Rubrica de `continuous-integration`: isolamento longo e recorrente = estágio 1 |
| **Respaldo** | O que sustenta a garantia? | *Accelerate*; Humble & Farley; DORA |
| **Explicações alternativas** | O que mais explicaria os dados? | Release por pacote exigido pelo cliente (contexto legítimo); viés da amostra (só um time respondeu) |
| **Qualificador** | Com que segurança? | Sustentação forte; cobertura 70%; faixa 1–2 |

## 4. Regras de evidência: a matriz Q

### 4.1 Contrato da opção

Cada opção de prática declara, **para cada capacidade que evidencia**, uma linha
da matriz Q:

```ts
type EvidenceLink = {
  capability: LeafId;             // folha evidenciada
  anchorStage: 0 | 1 | 2 | 3 | 4; // estágio que este comportamento caracteriza
  discrimination: 'low' | 'medium' | 'high'; // quanto esta resposta separa estágios vizinhos
  layer: 'knowledge' | 'practice' | 'consistency' | 'system' | 'outcome';
  appropriation?: 'ritual' | 'heroism';      // subtipo do estágio 1 (02 §3)
  constraint: ConstraintKind;     // natureza da restrição observada (vigente)
  role: 'primary' | 'effect';     // dono primário ou efeito (grafo)
  sophistication?: 0 | 1 | 2 | 3 | 4 | 5; // fase técnica F0–F5 da prática (12); não entra no índice (R28)
};

type Option = {
  id: string; label: string;
  observation: 'practice' | 'visibility' | 'not_applicable';
  factKind?: EventFactKind;
  evidence: EvidenceLink[];       // substitui signals[]
  causeEvidence?: CauseLink[];    // sintomas para a camada causal (05 §8)
};

type AssessmentNode = { /* vigente */ taskFamily: string; testlet: string; pressure?: boolean };
```

### 4.2 Migração do `weight`

| `weight` atual | `anchorStage` inicial | Observação |
|---|---|---|
| −2 | 0 | Revisar: muitas opções −2 descrevem ritual ou heroísmo, que são estágio 1 |
| −1 | 1 | Marcar `appropriation` quando aplicável |
| 0 | 2 | |
| +1 | 3 | Exige camada `consistency` para sustentar 3 (§5) |
| +2 | 4 | Exige camada `outcome` ou adaptação observada (§5) |

A discriminação inicial é `medium` para todas as opções e passa a ser revisada
pela autoria e, depois, estimada no laboratório de modelo (09).

### 4.3 Por que âncora e não peso

Um peso diz "bom" ou "ruim". Uma âncora diz **qual comportamento da rubrica esta
resposta representa**. Isso permite:

- respostas que evidenciam estágios diferentes em folhas diferentes (a mesma
  espera pode ser estágio 1 em fluxo e estágio 2 em governança);
- modelar o erro de observação de forma explícita: quem relata uma resposta de
  estágio 3 provavelmente vive uma unidade entre 2 e 4, com probabilidade maior em 3;
- conectar diretamente a rubrica (`CapabilityReference`) ao modelo de medição:
  âncora e rubrica usam a mesma escala.

## 5. Camadas de evidência como requisitos do estágio

As cinco camadas vigentes (conhecimento, prática, consistência, sistema,
resultado) viram **requisitos conjuntivos** para os estágios altos, na lógica dos
modelos de diagnóstico cognitivo (DINA/G-DINA: um nível só é alcançado quando os
atributos exigidos estão presentes):

| Estágio | Evidência mínima exigida na unidade | Sem ela |
|---|---|---|
| 0–2 | Prática | — |
| 3 Gerenciado | Prática **e** consistência (resiste a pressão, troca de pessoa, escala) | Posterior de 3–4 é limitado (05 §3.3) |
| 4 Adaptativo | Prática, consistência **e** resultado/adaptação (o efeito mudou o sistema) | Posterior de 4 é limitado |

Isso formaliza a regra vigente "o nível 4 exige comportamento adaptativo
sustentado e consequência observada" e evita que muitas respostas boas de uma
única camada simulem maturidade alta.

A camada **conhecimento** (perguntas de leitura, R6) alimenta uma variável
separada, **letramento**, e nunca é somada à prática. Saber ler um CFD não prova
que o time gerencia fluxo; a combinação "sabe e não faz" é um achado
(conhecimento bloqueado: governança, poder ou carga).

## 6. Dependência local: eventos como testlets

As perguntas de uma mesma reconstrução de evento (gatilho → decisão → espera →
consequência → aprendizado) não são independentes: descrevem o mesmo episódio.
Tratá-las como independentes superestima a certeza. A regra vigente "uma
evidência por grupo" já reconhece isso de forma grosseira.

**Proposta:** cada reconstrução de evento é um **testlet**. Dentro do testlet, as
respostas são combinadas numa única observação por capacidade (a âncora mais
informativa, ou a sequência modelada como uma cadeia); entre testlets diferentes,
assume-se independência condicional dado o estado da unidade. É o tratamento
padrão de testlets em teoria de resposta ao item (Wainer, Bradlow & Wang, 2007).

## 7. Três estados observacionais (mantido)

| Estado | Efeito no modelo |
|---|---|
| **Prática** | Observação que atualiza a posterior |
| **Não observo** | Não atualiza a capacidade; alimenta a variável de **visibilidade** da perspectiva |
| **Não se aplica** | Não atualiza; a folha pode ficar "não avaliada" na unidade |
| **Evento ocorreu e o comportamento esperado não aparece** | É prática: opção com âncora baixa (falta de prática publicável) |

## 8. Modelo de tarefa: características que a autoria declara

| Característica | Valores | Para quê |
|---|---|---|
| `taskFamily` | mudança, ambiente/acesso, incidente, risco de segurança, decisão arquitetural, melhoria, demanda, objetivo, pessoas, dado… | Cobertura por família (06) |
| `testlet` | id do evento reconstruído | Dependência local (§6) |
| Recência | último caso · últimos 3 meses | Reduz viés de memória |
| `pressure` | sim/não | Separa estágio 2 de 3 (consistência) |
| Perspectivas elegíveis | lista | Triangulação |
| Variante | por perspectiva | Linguagem, sem mudar a evidência |
| Custo | minutos estimados | Orçamento de tempo (06) |

## 9. Checagens de autoria (extensão do `audit:instrument`)

Além das checagens vigentes (jargão, opção composta, pista julgadora, saída de
visibilidade), a auditoria passa a bloquear:

1. opção de prática sem `evidence[]`;
2. folha com menos de dois `testlet`s distintos;
3. folha sem nenhuma opção com âncora ≥ 3 com camada `consistency`, ou sem âncora
   4 com camada `outcome` (a folha não conseguiria chegar ao topo);
4. folha sem opção de âncora 0–1 (não conseguiria detectar fragilidade);
5. âncora 4 em opção que só descreve presença (lista de termos: "temos",
   "existe", "usamos" + nome de prática);
6. folha organizacional sem vinheta de ancoragem (07 §4.3);
7. mais de uma opção com a mesma âncora e a mesma camada no mesmo nó (redundância).
