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
e critério de sucesso. Prioridade considera severidade e alcance sem alterar o
posterior.

O catálogo diferencia correção de um padrão negativo e evolução de uma prática
intermediária. Uma capacidade 4/4 não recebe ação artificial; uma capacidade abaixo
de 4 pode receber evolução quando as respostas sustentam um passo concreto.

## Seleção adaptativa

O tronco comum garante cobertura básica. Ao fim dele, perguntas elegíveis são
ordenadas por redução esperada de entropia, cobertura ausente, necessidade de
validação e custo. Somente probes observáveis pela perspectiva, ainda não
respondidos e relacionados à família incerta podem ser selecionados. O orçamento é
de cinco perguntas adicionais e o limiar especialista vigente é 0,01 bit.

## Calibração e aprendizado

O sistema não usa LLM nem aprende silenciosamente com respostas, cliques ou
aceitação da recomendação. Há cálculo offline de Brier score, erro esperado de
calibração, precisão e recall, porém essas métricas só possuem significado com
rótulos externos produzidos no piloto. Alterações futuras de priors ou likelihoods
devem criar uma nova versão revisada e reproduzível.
