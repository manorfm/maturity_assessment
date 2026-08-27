# Roadmap do motor probabilístico

## Objetivo

Evoluir o sistema especialista vigente para uma anamnese probabilística explicável,
capaz de escolher aprofundamentos que reduzam incerteza e recomendar intervenções
compatíveis com causas, restrições e pré-requisitos. Não haverá LLM nem aprendizado
automático com dados não rotulados.

## Estado de partida

Já estão implementados:

- grafo adaptativo versionado com 52 nós e roteamento por resposta e perspectiva;
- 204 sinais com folhas, camada de evidência e restrição declaradas no catálogo;
- maturidade, cobertura e confiança da capacidade calculadas separadamente;
- recomendador especialista determinístico por conjunto de jornadas;
- população aplicável, triangulação por camada e perfil e contradições pareadas;
- confiança heurística arredondada, separada da prioridade;
- intervenções apresentadas com ação, responsável provável, métrica, horizonte e
  critério de sucesso;
- anonimato, supressão hierárquica e ausência de respostas individuais na API.

Ainda não estão implementados:

- distribuição probabilística sobre hipóteses concorrentes;
- atualização bayesiana a cada resposta;
- escolha de pergunta por ganho esperado de informação;
- encerramento por incerteza residual e cobertura mínima;
- calibração empírica, Brier score ou medição de poder discriminativo;
- aprendizado com resultado real das intervenções.

## Arquitetura planejada

O catálogo TypeScript continuará como fonte de autoria e publicará no SQLite:

- `inference_model_versions`: versão, estado, política e data de publicação;
- `diagnostic_hypotheses`: família diagnóstica, causa, prior e escopo;
- `evidence_likelihoods`: sinal, hipótese, efeito favorável/contrário e
  probabilidade condicional;
- `question_observations`: aplicabilidade, perfis observadores, custo e evidências
  possíveis;
- `intervention_prerequisites`: hipótese tratada, condição, dependências e
  incompatibilidades;
- `inference_snapshots`: versão, participação, distribuição e motivo da próxima
  pergunta, sem exposição por API administrativa.

Cada família diagnóstica terá hipóteses concorrentes e uma saída `unknown`; causas
simultâneas serão representadas por famílias diferentes, evitando uma explosão
combinatória inicial. Evidências correlacionadas pertencerão ao mesmo grupo e serão
consumidas uma única vez para impedir dupla contagem.

O cálculo ocorrerá em log-espaço e normalizará os resultados:

`log P(H|E) = log P(H) + Σ log P(E|H)`

O seletor simulará cada resposta possível, calculará a entropia posterior esperada
e comparará com a entropia atual. Ganho de informação será normalizado para `0–1`
antes de combinar cobertura, validação e custo.

Contratos internos principais:

```text
infer(modelVersion, observations) -> DiagnosticPosterior[]
rankQuestions(posteriors, context, answered) -> QuestionCandidate[]
recommend(posteriors, prerequisites) -> InterventionPlan[]
explain(snapshot) -> EvidenceChain
```

A API pública acrescentará `modelVersion`, `hypotheses`, `uncertainty`,
`missingEvidence` e `interventionPlan`. Não publicará snapshots individuais,
probabilidades por perfil abaixo do limiar ou alternativas selecionadas.

## Fase 1 — Ontologia causal e contratos

Modelar explicitamente:

- `DiagnosticHypothesis`: causa possível, capacidade, impacto e escopo;
- `EvidencePredicate`: sinal que sustenta, contradiz ou apenas contextualiza;
- `QuestionObservation`: perfis capazes de observar e custo da pergunta;
- `InterventionPrerequisite`: condição necessária, ausente ou desconhecida;
- `DiagnosticPosterior`: distribuição normalizada e lacunas restantes;
- `InferenceModelVersion`: versão imutável de estrutura, priors e política.

Cada hipótese deverá declarar priors especialistas provisórios, evidências
condicionais, hipóteses concorrentes, contradições e intervenções compatíveis. A
publicação falhará diante de referências inexistentes, probabilidades inválidas,
hipóteses sem discriminador ou intervenção sem causa e pré-requisito.

Entrega: persistência versionada, auditoria do catálogo e API interna capaz de
explicar `prior -> evidência -> posterior`, ainda sem alterar a jornada.

Aceite: todas as distribuições somam 1 dentro da tolerância, o resultado é
reproduzível para a mesma versão e nenhum signal é consumido duas vezes no mesmo
grupo de evidência.

## Fase 2 — Inferência bayesiana explicável

- Atualizar o posterior após cada resposta usando somente relações publicadas.
- Tratar “não sei”, “não participei” e “não se aplica” como ausência ou limite de
  observação, nunca como evidência negativa.
- Separar sintoma, causa, restrição e consequência para evitar dupla contagem.
- Preservar divergência entre perfis como distribuições condicionais, sem gerar
  classificação individual.
- Manter o motor heurístico apenas como comparador temporário em testes offline;
  não haverá dois resultados concorrentes em produção.

Entrega: relatório diagnóstico usando posterior provisório e mostrando hipóteses
alternativas. O percentual continuará rotulado como não calibrado.

Aceite: casos com a mesma maturidade e causas distintas produzem posteriores
distintos; uma contradição altera somente hipóteses relacionadas; `unknown` cresce
quando a observação não discrimina as alternativas.

## Fase 3 — Seleção adaptativa por informação

Para cada pergunta elegível, calcular redução esperada de entropia sobre as
hipóteses ativas. A política combinará:

- 50% ganho esperado de informação;
- 25% cobertura de capacidade ainda ausente;
- 15% necessidade de validação ou contradição;
- 10% custo da pergunta, invertido.

Restrições obrigatórias prevalecem sobre o ranking: perfil com visibilidade,
contexto aplicável, proteção de anonimato, ausência de repetição e limite de
jornada. O tronco mínimo continuará garantindo cobertura do SDLC.

Critérios de encerramento:

- cobertura mínima obrigatória concluída; e
- hipótese líder com posterior provisório de pelo menos 70% e margem mínima de 20
  pontos sobre a segunda; ou
- nenhuma pergunta restante com ganho esperado superior a 0,05 bit; ou
- limite de jornada atingido.

Entrega: entrevistas mais curtas em casos claros e aprofundamento adicional em
casos ambíguos, com registro do motivo de seleção e parada.

Aceite: nenhum perfil recebe pergunta que não possa observar, perguntas de maior
ganho vencem quando as demais restrições empatam e todo encerramento informa a regra
que o provocou.

## Fase 4 — Recomendações causais

Uma intervenção será prescrita somente quando:

- a hipótese tratada atingir o limiar vigente;
- pré-requisitos obrigatórios estiverem presentes;
- não houver contexto de incompatibilidade;
- a confiança superar 70%.

Entre 50% e 65%, o relatório apresentará hipótese e próximo discriminador, não uma
prescrição. Abaixo de 50%, mostrará apenas lacuna de evidência. Prioridade combinará
impacto, alcance, dependências, reversibilidade e esforço, sem alterar a confiança.

O plano apresentado conterá causa, evidências favoráveis e contrárias, ação,
responsável, dependências, métrica, baseline, revisão e critérios de sucesso e
interrupção. Recomendações sobrepostas serão compostas e ordenadas por dependência.

## Fase 5 — Instrumento e casos de referência

Auditar todas as perguntas atuais contra a ontologia. Expandir somente branches que
não distinguem suas hipóteses, adicionando para cada causa relevante:

1. comportamento em evento recente;
2. consequência observada;
3. discriminador de causa;
4. restrição para agir;
5. validação sob mudança de contexto ou pressão;
6. contradição independente.

Alternativas compostas serão divididas. Perguntas sem poder de alterar posterior,
cobertura ou roteamento serão removidas. Quantidade de perguntas não será meta.

Criar casos rotulados para mesma nota com causas diferentes, ferramenta sem acesso,
acesso sem conhecimento, política bloqueante, acoplamento, estrutura organizacional,
divergência multiperfil e maturidade declarada que falha sob pressão.

## Fase 6 — Piloto e calibração

Executar em sequência:

1. entrevistas cognitivas, inicialmente 5–8 por família de perspectiva;
2. revisão cega de aproximadamente 50–100 jornadas por especialistas;
3. piloto controlado com diversidade de organização, perfil e ramo;
4. comparação do posterior com rótulos externos e justificativas;
5. calibração versionada dos priors e probabilidades condicionais.

As quantidades são pontos de partida, não garantias estatísticas. Algumas centenas
de jornadas distribuídas começam a sustentar calibração global; branches raros e
recortes por perfil exigirão mais observações. Volume concentrado não substitui
diversidade.

Medir Brier score, erro de calibração por faixa, precisão e recall das causas,
taxa de parada incorreta, duração da jornada e divergência entre especialistas.

## Fase 7 — Aprendizado supervisionado e governança

Somente após dados rotulados e calibração estável, avaliar atualização assistida de
parâmetros. Clique, aceitação da recomendação e frequência de resposta não serão
rótulos. Efeito de intervenção exigirá baseline, janela de revisão e contexto.

Toda alteração continuará revisada, versionada, reproduzível e reversível. O motor
não se atualizará silenciosamente em produção. Monitorar drift, diferenças por
perfil/contexto, falsos positivos, contestação e risco de uso punitivo.

## Sequência técnica e TDD

1. Testes vermelhos para normalização do posterior e explicação completa.
2. Entidades e value objects da ontologia.
3. Persistência e publicação imutável do modelo.
4. Inferência bayesiana e comparação com casos dourados.
5. Política de ganho de informação e limites da jornada.
6. Recomendações e contratos HTTP.
7. Migração integral do catálogo e remoção do recomendador substituído.
8. Playwright com projetos ruim, intermediário, elite e causas distintas.
9. Instrumentação do piloto e painel de calibração offline.

Cada fase termina com `check`, testes unitários, integração, build, E2E, auditoria de
privacidade e atualização da base de conhecimento. Não há compatibilidade com
bancos anteriores: mudanças de modelo recriam o SQLite e incrementam suas versões.

## Critério de conclusão

O motor probabilístico estará pronto para piloto quando explicar cada posterior,
selecionar e encerrar perguntas deterministicamente, reproduzir casos dourados,
preservar anonimato e não apresentar recomendação sem causa e pré-requisitos. Estará
pronto para alegar precisão estatística somente depois que os resultados do piloto
atingirem critérios de calibração definidos antes da análise.
