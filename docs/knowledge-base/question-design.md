# Desenho de perguntas

## Regras

- Perguntar sobre eventos recentes e concretos, não sobre identidade do time.
- Evitar mencionar a prática cuja presença está sendo inferida.
- Oferecer opções plausíveis, todas com algum custo ou benefício.
- Separar preferência pessoal, comportamento real e restrição externa.
- Combinar sinais; nenhuma pergunta isolada determina maturidade.
- Incluir checagens de consistência sem repetir literalmente a questão.
- Randomizar ordem quando ela puder induzir uma resposta “correta”.
- Registrar “não sei” como informação sobre visibilidade, não como falha automática.
- Usar perguntas sobre ferramentas e estruturas apenas para aplicabilidade e
  roteamento; suas respostas não pontuam maturidade.
- Formular cenários em torno de falhas, mudanças, decisões e consequências, de modo
  que diferentes soluções técnicas possam demonstrar a mesma capacidade.

## Formatos

- cenário ramificado;
- escolha forçada entre trade-offs;
- ordenar próximas ações;
- distribuir orçamento, tempo ou capacidade limitados;
- reconstruir a linha do tempo de um evento;
- selecionar evidências disponíveis;
- comparar o que deveria ocorrer com o que ocorreu;
- estimar frequência/confiança e depois informar um exemplo.

## Exemplo: observabilidade

**Cenário:** Após uma implantação, a latência aumenta para parte dos clientes e um
alerta dispara. Há uma entrega importante prevista para o mesmo dia. Ordene as
três primeiras ações que mais se aproximam do que normalmente aconteceria.

As opções podem revelar capacidade de detectar impacto, correlacionar mudança,
mitigar, comunicar, usar runbook, escalar e aprender. Perguntas posteriores
exploram quem recebeu o alerta, se ele exigiu ação, como recorrências são tratadas
e se a experiência muda limites ou automação.

**Inferências possíveis:** qualidade do sinal, ownership, resposta, segurança para
interromper fluxo, vínculo entre telemetria e impacto, aprendizado pós-incidente.

**Bloqueios possíveis:** telemetria insuficiente, alerta sem dono, acesso restrito,
pressão de prazo, dependência externa, ausência de ambiente seguro para mitigação.

## Exemplo: design e acoplamento

**Cenário:** Uma regra de preço que parecia local agora precisa ser usada por três
fluxos, cada um com ritmo de mudança diferente. O prazo é curto. Como o time tende
a decidir o primeiro passo e quais sinais fariam rever a decisão?

O cenário pode inferir modelagem, gestão de acoplamento, reversibilidade, custo de
mudança, testes e decisão arquitetural sem perguntar se a pessoa “aplica SOLID” ou
“usa DDD”.

## Vieses a controlar

- desejabilidade social e resposta “de livro”;
- confirmação do autor do assessment;
- efeito halo de ferramentas ou certificações;
- viés de retrospectiva;
- excesso de confiança e falsa precisão;
- atribuição ao indivíduo de uma restrição sistêmica;
- diferenças de contexto, função, idioma e poder hierárquico.

## Regra para tecnologias e frameworks

Uma pergunta de inventário pode decidir qual cenário aparece em seguida, mas não
participa da inferência. O cenário seguinte deve funcionar assim:

```text
contexto declarado -> problema relevante -> decisão/comportamento -> consequência
```

Evitar:

> Vocês usam Kubernetes?

Preferir, quando orquestração for aplicável:

> Uma nova versão aumenta consumo de memória gradualmente e afeta apenas parte das
> instâncias. Como o problema costuma ser percebido, contido e impedido de voltar?

A resposta pode revelar observabilidade, isolamento, estratégia de implantação,
limites, rollback, ownership e aprendizado, independentemente da tecnologia usada.

## Cenários organizacionais que o catálogo deve cobrir

### Vários times alterando o mesmo produto ou repositório

Não perguntar se existe monorepo ou qual estratégia de branch é usada. Apresentar
uma mudança que atravessa times e investigar:

- como descobrem alterações concorrentes e seus responsáveis;
- quanto tempo uma mudança permanece isolada antes de encontrar as demais;
- onde está a versão confiável do produto e como ela é reproduzida;
- como contratos e integrações são verificados;
- quem coordena ordem, rollback e comunicação;
- o que ocorre quando prioridades dos times entram em conflito.

Os sinais podem indicar integração tardia, branches longevas, ownership ambíguo,
ausência de fonte confiável, dependência coordenada manualmente, acoplamento e
limites organizacionais desalinhados ao sistema.

### Agilidade declarada e fluxo em cascata

Não perguntar “vocês são ágeis?”. Reconstruir a jornada de uma necessidade recente:

- quando usuário e engenharia participaram;
- quando escopo, design, teste e operação deram feedback;
- tamanho do lote antes de validação real;
- tempo de trabalho versus tempo de espera;
- custo para mudar uma decisão após o início;
- se cerimônias alteraram decisões ou apenas reportaram status;
- se o incremento poderia chegar ao usuário ou dependia de uma grande liberação.

Sprints, daily e backlog são contexto neutro. Feedback tardio, fases sequenciais,
handoffs, lote grande e baixa capacidade de mudança são evidências mais úteis.

### Qualidade e QA como etapa final

Apresentar uma entrega com risco e prazo limitado e explorar quando QA participa,
como critérios são definidos, quanto custa criar dados, quais verificações são
repetíveis e o que ocorre com regressões. Isso distingue especialização útil de um
handoff que acumula fila, testes regressivos manuais e cobertura sempre posterior.

### Provisionamento e entrega

Pedir a linha do tempo entre “mudança pronta” e “mudança operando”: passos manuais,
esperas, aprovações, reconstrução de pacote, diferenças entre ambientes, origem dos
artefatos, rollback e evidência de sucesso. Um script local conta como automação e
aprendizado; sua fragilidade, abrangência e reutilização determinam o próximo nó.

### Especialistas, generalistas e lacunas de disciplina

Não inferir maturidade por títulos como SRE, QA ou full-stack. Usar cenários que
revelem se conhecimentos necessários entram na decisão, seja por integrantes do
time, colaboração temporária, plataforma ou padrões automatizados. Avaliar o
resultado e o acesso à competência, não a existência de um cargo.

## Perguntas orientadas por perfil

Perfil define quais situações a pessoa consegue observar e influenciar. Não define
um questionário isolado ou uma nota própria. Diferentes perfis recebem perspectivas
do mesmo evento, permitindo triangulação posterior.

### Gestão de pessoas/engenharia

Apresentar crescimento, conflito, dependência ou reorganização e investigar como o
gestor identifica carga cognitiva, preserva contexto, escolhe fronteiras, ajusta
modos de interação e acompanha efeitos. Isso pode revelar comportamentos explicados
por Tuckman e Team Topologies sem pedir os nomes desses modelos.

### Produto

Explorar como uma necessidade vira hipótese, quais pessoas entram cedo, tamanho do
lote, evidência de valor, mudança de direção e relação entre prazo e risco técnico.
Isso ajuda a distinguir discovery e entrega iterativos de cascata fracionada em
sprints.

### QA/qualidade

Investigar quando qualidade entra na decisão, como riscos são escolhidos, obtenção
de dados de teste, repetibilidade, tempo de regressão, ambiente e influência sobre
design. QA não é avaliado pela quantidade de casos nem culpado por cobertura que o
sistema de trabalho empurra para o fim.

### Engenharia web, backend e mobile

Usar mudanças reais para observar integração, feedback, disciplina específica,
compatibilidade, testes, acessibilidade, segurança, release e operação. “Full-stack”
é apenas contexto; a questão é se competências necessárias entram no trabalho e se
o produto mantém qualidade coerente em cada superfície.

### SRE, plataforma, infraestrutura e segurança

Investigar como capacidades são oferecidas, tempo de espera, self-service,
guardrails, exceções, feedback, confiabilidade e responsabilidade compartilhada.
Ter o time especializado não pontua; reduzir carga e risco de modo sustentável gera
sinais.

### Gestão executiva e governança

Apresentar um risco ou decisão atravessando unidades e observar tempo, clareza,
proporcionalidade do controle, autonomia, escalonamento e aprendizado. Isso separa
governança que cria segurança organizacional de governança que apenas adiciona
fila, transferência de responsabilidade e aprovações sem evidência.

### Conhecimento quantitativo sem prova teórica

Não perguntar se alguém “entende estatística”. Mostrar um dashboard, alerta ou
experimento com ruído, distribuição, sazonalidade, percentis, base pequena ou
correlação enganosa e perguntar qual decisão tomaria, que informação falta e como
validaria. A inferência observa raciocínio, incerteza e consequência, não vocabulário
estatístico.
