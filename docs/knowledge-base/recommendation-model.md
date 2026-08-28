# Diagnóstico probabilístico e recomendações

## Semântica vigente

O diagnóstico avalia cada causa que pode coexistir em uma família binária própria:
`causa sustentada` contra `evidência insuficiente`. Sintomas, restrições e
consequências alimentam evidência ou aplicabilidade, mas não competem como causas.
Cada família inclui priors especialistas provisórios e probabilidades condicionais
versionadas. O resultado exibido é um **posterior provisório**: ele
representa a crença do modelo diante das evidências declaradas, mas ainda não é uma
probabilidade empiricamente calibrada.

Maturidade, cobertura temática, posterior e prioridade são medidas diferentes.
Uma nota baixa não escolhe uma solução sozinha; grupos com a mesma nota podem ter
causas e experimentos diferentes.

## Atualização e explicação

O cálculo usa log-espaço e normalização por softmax. A força considera suporte sobre
população aplicável, variedade de perspectivas e camadas. Uma ocorrência isolada
não equivale a recorrência coletiva, e ausência de resposta não vira evidência
negativa. Evidências que pertencem ao
mesmo grupo causal são consumidas uma única vez, evitando premiar perguntas
redundantes. Contradições alteram apenas as hipóteses às quais foram ligadas.

O relatório preserva:

`comportamento -> evidência independente -> hipótese/alternativas -> restrição -> experimento`

O prior de evidência insuficiente varia com a observabilidade, sem uma reserva fixa
que cresça artificialmente com a quantidade de causas. O relatório agrupa causas
por capacidade e apresenta posterior, suporte/população, perspectivas, camadas e
incerteza. “Próximo discriminador” só aparece quando há pergunta contextual ainda
elegível; caso contrário, declara uma lacuna do instrumento. Snapshots individuais
nunca são publicados.

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

O catálogo diferencia correção de um padrão negativo e evolução de uma prática
intermediária. Uma capacidade 4/4 não recebe ação artificial; uma capacidade abaixo
de 4 pode receber evolução quando as respostas sustentam um passo concreto.

Título, mecanismo causal e ação são campos distintos. O título descreve o efeito
observado; a causa explica por que o sistema tende a reproduzi-lo; a ação propõe o
menor teste compatível com a restrição. Cada padrão publicado referencia
explicitamente um fundamento do catálogo — sem classificação por coincidência de
palavras — e a ausência desse vínculo impede a inicialização do recomendador.

Os experimentos não reutilizam uma porcentagem como se ela medisse tudo. Posterior
expressa força da hipótese; prioridade combina alcance e severidade. Métrica,
horizonte e critério de sucesso variam por família do problema (incidente, entrega,
dados, arquitetura, experiência, aprendizagem, governança ou assistência) e devem
permitir verificar melhoria sem deslocar risco ou espera para outra etapa.

## Seleção adaptativa

O tronco comum garante cobertura básica. Ao fim dele, perguntas elegíveis são
ordenadas por redução esperada de entropia, cobertura ausente, necessidade de
validação e custo. Somente probes observáveis pela perspectiva, ainda não
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
