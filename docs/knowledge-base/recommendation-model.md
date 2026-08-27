# Diagnóstico e recomendações

## Semântica

Uma recomendação é um experimento ligado a uma hipótese sustentada pelo conjunto de
respostas. A porcentagem exibida é **confiança heurística na aderência da
intervenção**: não representa maturidade, popularidade, prioridade nem probabilidade
empiricamente calibrada.

O cálculo usa apenas evidências declaradas para a intervenção: proporção das
jornadas aplicáveis, confirmação por padrões relacionados, variedade de camadas e
perspectivas, consequência observada e contradições semânticas específicas. Sinais
positivos ou problemas apenas coexistentes na mesma capacidade não alteram a
confiança. O resultado é arredondado em cinco pontos percentuais para não comunicar
precisão inexistente antes do piloto.

Prioridade é separada da confiança. Ela considera severidade e alcance; portanto,
uma hipótese muito provável pode vir depois de um bloqueio mais crítico. Empates de
confiança são legítimos somente quando os vetores de evidência forem equivalentes.

## Implementação vigente

O motor é um sistema especialista determinístico, não um modelo estatístico ou de
machine learning. Para cada intervenção ele combina suporte na população aplicável,
padrões declarados, camadas, perspectivas, consequência e contradições específicas.
Problemas apenas coexistentes não aumentam confiança e sinais positivos não
relacionados não são tratados como contradição.

As intervenções possuem catálogo versionado. O motor não aprende com respostas,
cliques ou recomendações aceitas e não seleciona a próxima pergunta por ganho de
informação. O grafo adapta o percurso por regras declarativas de resposta e perfil.

## Cadeia explicável

O relatório preserva:

`comportamento observado -> consequência -> causa sustentada -> restrição -> experimento`

Cada experimento informa ação inicial, responsável provável, métrica, horizonte de
revisão e critério de sucesso. Quando não existe sustentação coletiva suficiente,
o sistema não inventa uma solução: informa que a próxima rodada deve discriminar
evento, consequência e restrição.

## População e privacidade

Suporte usa apenas pessoas que produziram evidência naquela capacidade. Perfis
servem para triangulação agregada, nunca para atribuir respostas. A API publica a
decomposição agregada e não inclui identificadores de participação.

## Calibração

Os pesos atuais são regras especialistas versionadas, não probabilidades. A
interface deve usar `confiança heurística` até existir um modelo probabilístico
comparado com casos rotulados, revisão multidisciplinar e entrevistas cognitivas.
O plano aprovado está no
[`roadmap probabilístico`](../backlog/probabilistic-inference-roadmap.md).
