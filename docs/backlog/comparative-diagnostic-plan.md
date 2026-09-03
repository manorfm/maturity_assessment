# Plano aberto: referencial comparativo de alta performance

Status: onda 0 incorporada à base de conhecimento em 2026-09-02. Este documento
contém somente o trabalho ainda futuro.

## Objetivo

Completar o diagnóstico causal vigente com uma referência operacional por
capacidade, capaz de mostrar a distância entre o comportamento observado e um
sistema de engenharia de alta performance sem pontuar ferramenta, framework,
cargo ou cerimônia por presença.

## Invariantes

- O finding causal permanece a leitura principal.
- O estágio 0–4 compara comportamentos e efeitos, não inventário técnico.
- Ferramenta antiga só é fragilidade quando produz efeito demonstrado; ferramenta
  moderna só é capacidade quando habilita comportamento sustentado.
- Performance DORA usa métricas por aplicação ou serviço e não é inferida da
  entrevista.
- Restrição organizacional não vira deficiência do time bloqueado.
- Cultura é decomposta em reação a erro, incentivo, poder, prioridade, carga e
  aprendizagem observáveis.
- Anonimato, limiar e supressão hierárquica permanecem inalterados.

## Sequência restante

### Onda 1 — Rubricas operacionais 0–4

Definir para cada folha propósito, âncoras dos cinco estágios, evidências, efeitos,
condições habilitadoras, comportamento sob pressão, regressão e limites. Começar
por descoberta/validação, feedback técnico, autonomia de plataforma e sistema
organizacional antes de expandir para a taxonomia inteira.

**Aceite:** cada estágio possui comportamento observável específico; nenhuma
rubrica concede ou retira estágio por nome de tecnologia.

### Onda 2 — Matriz de cobertura do instrumento

Relacionar perguntas e sinais às rubricas. Marcar observação direta, inferência
indireta, perspectiva única, alternativa desejável, mistura de fato/causa e lacuna.

**Aceite:** cada âncora crítica possui ao menos dois sinais independentes e as
fronteiras relevantes são trianguláveis.

### Onda 3 — Jornadas centradas em eventos

Reescrever lacunas prioritárias como reconstruções de discovery, mudança, build,
deploy, acesso/ambiente, incidente, decisão arquitetural, evidência de resultado e
melhoria. Roteamento segue responsabilidade e autonomia.

**Aceite:** toda causa publicável remonta a fatos do evento; nenhuma alternativa
isolada escolhe comportamento, causa e solução ao mesmo tempo.

### Onda 4 — Contrato de comparação e score

Separar no domínio e na API diagnóstico causal, estágio comportamental, confiança,
cobertura e performance operacional. Explicar a distância para o comportamento-alvo
sem média global que esconda o elo limitante.

**Aceite:** o mesmo estágio pode produzir recomendações diferentes por mecanismo;
ausência de evidência permanece não avaliada.

### Onda 5 — Biblioteca completa de direção

Completar os contratos dos padrões publicáveis com comportamento-alvo, classe de
solução, prática, técnica, família de ferramenta opcional, pré-condições,
incompatibilidades, custo, risco, fundamento, experimento e critério.

**Aceite:** nenhuma recomendação publicável é genérica ou selecionada por palavra,
marca ou presença nominal.

### Onda 6 — Relatório comparativo

Apresentar primeiro problema, efeito, contenção, autoridade e decisão; depois,
distância para a referência, comportamentos sustentados e direção. Todas as leituras
por autoridade preservam o mesmo finding canônico.

**Aceite:** gestão e engenharia distinguem diagnóstico, estágio, confiança e
performance sem facilitador.

### Onda 7 — Validação e telemetria externa

Executar casos sintéticos contrastantes, entrevistas cognitivas, revisão cega e
piloto conforme os gates vigentes. Só depois integrar métricas DORA, incidentes,
fluxo, plataforma e experiência por serviço.

**Aceite:** linguagem validada por perspectiva, 50–100 jornadas rotuladas e gates
pré-declarados atendidos antes de alegar robustez ou benchmark.

## Menor próximo experimento

Criar as quatro primeiras rubricas sem alterar inferência. Revisar se pessoas de
gestão e engenharia conseguem diferenciar comportamento-alvo, mecanismo causal e
ferramenta habilitadora antes de expandir o contrato às demais folhas.
