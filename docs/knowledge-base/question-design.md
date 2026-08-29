# Desenho de perguntas

## Regras

- Perguntar sobre eventos recentes e concretos, não sobre identidade do time.
- Evitar mencionar a prática cuja presença está sendo inferida.
- Oferecer opções plausíveis, todas com algum custo ou benefício.
- Separar preferência pessoal, comportamento real e restrição externa.
- Combinar sinais; nenhuma pergunta isolada determina o diagnóstico.
- Incluir checagens de consistência sem repetir literalmente a questão.
- Randomizar alternativas comportamentais quando a posição puder induzir uma
  resposta “correta”. A ordem é determinística por participação e pergunta para
  não mudar ao retomar; “não observo” e “não se aplica” permanecem no fim.
- Registrar “não sei” / “não observo” como informação sobre visibilidade, não como
  falha automática. “Não se aplica” é contexto: a folha permanece não avaliada.
- Toda opção de prática pontua comportamento; saídas observacionais não carregam
  sinal de capacidade.
- Usar perguntas sobre ferramentas e estruturas apenas para aplicabilidade e
  roteamento; suas respostas não pontuam o diagnóstico.
- Formular cenários em torno de falhas, mudanças, decisões e consequências, de modo
  que diferentes soluções técnicas possam demonstrar a mesma capacidade.
- Depois de um sinal positivo, mudar contexto ou pressão para verificar se a prática
  é consistente; depois de um sinal negativo, discriminar ferramenta, processo,
  comunicação, desenho de times, arquitetura, governança e conhecimento.
- Pedir que a pessoa reconheça o que ocorreu no último caso comparável; não pedir
  que escolha diretamente a causa, a prática ideal ou um adjetivo sobre o time.
- Manter cada alternativa centrada em uma decisão ou efeito observável. Quando uma
  cadeia reunir comportamentos separáveis, aprofundá-la em outro nó do grafo.
- Preferir linguagem cotidiana compartilhada. Variantes por perspectiva adaptam
  cenário e poder de decisão; as alternativas só permanecem comuns quando todas as
  perspectivas conseguem reconhecer o mesmo comportamento sem traduzir jargão.
- Antes do piloto, executar `npm run audit:instrument`. O comando percorre todas as
  perguntas e intervenções e bloqueia alternativas compostas, pistas julgadoras e
  experimentos genéricos; avisos de evento ausente ou abstração também devem chegar
  a zero na versão publicada para entrevista cognitiva.

## Formatos

- cenário ramificado;
- escolha forçada entre trade-offs;
- ordenar próximas ações;
- distribuir orçamento, tempo ou capacidade limitados;
- reconstruir a linha do tempo de um evento;
- selecionar evidências disponíveis;
- comparar o que deveria ocorrer com o que ocorreu;
- estimar frequência/confiança e depois informar um exemplo.

## Três estados observacionais

Cada pergunta de prática admite, além das alternativas de comportamento:

1. **Prática** — o que ocorreu; pode ser forte, intermediário ou frágil e pontua.
2. **Não observo** — a pessoa não vê o evento no cotidiano; registra visibilidade,
   sem peso de capacidade para aquela jornada.
3. **Não se aplica** — o evento não ocorre neste ambiente; a folha permanece não
   avaliada, nunca zero.

Nós de contexto (credencial entre sistemas, dependência que pode falhar, ciclo de
reconhecimento, assistência de modelo) só abrem o cenário de prática quando o
evento existe. Ferramenta, produto de cofre, IAM, Copilot ou OKR não aparecem na
pergunta e não pontuam.

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

Antes do deep dive, usar um nó de contexto sem sinal para confirmar se mais de um
time altera diretamente a mesma superfície. Ownership exclusivo segue adiante sem
ser premiado; compartilhamento abre cenários sobre sobrescrita, colisão, composição,
proveniência e comunicação.

### Reflexão e melhoria contínua

Não perguntar apenas se existe retrospectiva. Reconstruir encontros recentes e
verificar quantas mudanças foram escolhidas, quem assumiu, como ganharam capacidade,
quando retornaram à pauta e qual efeito alterou a decisão. Cerimônia recorrente sem
adaptação é um sinal diferente de ação bloqueada por governança ou baixa autonomia.

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

### Incidente, diagnóstico e correção

Reconstruir um incidente recente desde o primeiro sinal até a reconciliação final:
como impacto define severidade, quem recebe, como ownership é encontrado, quais
dados permitem correlacionar a jornada e como mudanças em código, configuração,
infraestrutura ou dados chegam ao ambiente. Acesso direto ao runtime, busca por dado
pessoal e alteração em console são comportamentos investigados por risco e efeito,
não por nomes de produtos. Um caminho maduro continua reproduzível, auditável,
minimizado e capaz de aprender após a urgência.

### Objetivo, bloqueio e decisão

Usar um período recente para distinguir objetivo compartilhado de preenchimento de
capacidade. Ao surgir bloqueio, observar se o sistema reduz espera ou apenas inicia
mais trabalho, escala por uma pessoa ou cria contorno. Antes de construir, investigar
se opções, restrições e reversibilidade foram consideradas pelas competências
necessárias; ADR é uma possível evidência, não um requisito nominal.

### Especialistas, generalistas e lacunas de disciplina

Não inferir capacidade por títulos como SRE, QA ou full-stack. Usar cenários que
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
estatístico. O tronco vigente inclui um cenário com média, cauda e base reduzida
após um deploy; celebrar a média ou ignorar o denominador é prática frágil, não
falta de vocabulário.

### Identidade, dependência, incentivo e assistência

Não perguntar se existe Vault, IAM, circuit breaker, OKR ou Copilot. Confirmar se
o evento ocorre e, se ocorrer, o que acontece: como a credencial chega e expira;
o que o sistema faz quando a dependência atrasa; o que pesou no último ciclo de
reconhecimento; como uma saída assistida por modelo é revista quando erra no risco.
Ausência do evento deixa a folha não avaliada.

### Arquitetura, linguagem e espera entre grupos

Não perguntar “vocês fazem DDD?” nem “qual o interaction mode?”. Apresentar um termo
que dois grupos usam de formas diferentes numa mudança que parecia local, e uma
alteração comum que não avança sem outro grupo. A inferência observa se o significado
é reconstruído na entrega, se a espera é um modo explícito ou uma fila informal, e
se o time contorna o limite para não esperar.

### Segurança em mudança comum

Não perguntar se existe WAF, scanner ou time de AppSec. Uma alteração de prazo
normal passa a tocar dado identificável ou um caminho novo entre sistemas; depois,
um achado aparece no meio do trabalho. A inferência observa se o risco muda desenho
antes de liberar, se o achado pode atrasar a mudança, ou se vira exceção e correção
só do caso visível.

### Dados como significado compartilhado

Não perguntar qual warehouse ou catálogo está instalado. Dois produtos mostram o
mesmo indicador com valores diferentes; em seguida alguém precisa mudar a definição.
A inferência observa dono do significado, reconciliação artesanal e redefinição
silenciosa — não a ferramenta de dados.

### Design na fronteira produto–engenharia

Não perguntar se usam Figma ou Design System. Uma mudança altera o caminho da pessoa
usuária com prazo já definido; depois a interface já está no ar. A inferência observa
se a experiência entra na decisão, se chega como handoff final, e se evidência de
quem não concluiu pode reabrir o fluxo.

### Carga cognitiva e caminho até capacidade

Não perguntar o nome de Team Topologies nem se “temos IDP”. O mesmo grupo absorve
pedido de produto, incidente, melhoria de plataforma e exceção na mesma semana; um
time precisa usar uma capacidade que a plataforma já oferece em algum lugar. A
inferência observa se a carga é negociada e se existe caminho que outra pessoa
consegue seguir, sem herói nem fila.
