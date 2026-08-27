# Piloto, calibração e aprendizado supervisionado

O motor probabilístico necessário ao piloto já foi implementado. Sua arquitetura e
semântica vigentes estão na base de conhecimento. Este backlog contém apenas o que
não pode ser concluído honestamente sem massa real e validação externa.

Não executar este roadmap sobre o grafo anterior à higiene observacional e ao
conteúdo aplicável já vigentes (`evidence-anamnesis-v12`). Calibrar opções ouro
e jornadas sem “não observo” congelaria o viés.

## Preparação do piloto

- Fazer entrevistas cognitivas, inicialmente 5–8 por perspectiva, para verificar
  compreensão, observabilidade e vieses das alternativas.
- Revisar de forma cega aproximadamente 50–100 jornadas com especialistas de
  disciplinas diferentes e registrar causa, justificativa e discordância.
- Executar piloto controlado com diversidade de organização, perspectiva, contexto
  e branches; volume concentrado não substitui diversidade.
- Definir antes da análise os limites aceitáveis de falso positivo, parada
  incorreta, duração e divergência entre avaliadores.

## Calibração versionada

Com rótulos externos, medir Brier score, erro de calibração por faixa, precisão,
recall, taxa de parada incorreta e poder discriminativo das perguntas. Ajustar
priors e likelihoods somente em uma nova versão revisada e reproduzível. Algumas
centenas de jornadas podem iniciar a calibração global, mas branches raros e
recortes por perspectiva exigirão mais observações.

## Evolução supervisionada

Somente após calibração estável, avaliar atualização assistida dos parâmetros.
Clique, frequência de resposta e aceitação de recomendação não são rótulos. Efeito
de intervenção exige baseline, janela de revisão, contexto e critério de sucesso.
O modelo nunca se atualiza silenciosamente em produção.

Monitorar drift, diferenças por contexto/perspectiva, contestação, falsos positivos
e risco de uso punitivo. Preservar anonimato, revisão humana e rollback de versão.
