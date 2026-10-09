# 01 — Visão e relatório: o produto final

> O relatório é o objetivo de todo o resto. Motor, perguntas e estatística
> existem para que ele seja **verdadeiro, útil e acionável**. Este documento
> define o relatório-alvo; os demais explicam como produzi-lo.

## 1. A pergunta que o produto responde

> **Como está a tecnologia desta organização, por que está assim, o que fazer
> primeiro e como saber se funcionou — e com quanta segurança dizemos isso?**

Cada parte da frase corresponde a uma seção do relatório:

| Parte da pergunta | Seção do relatório | Fonte |
|---|---|---|
| Como está | Estado: índice, faixa, cobertura, divergência | Modelo de medição (05) |
| Por que está assim | Diagnóstico diferencial: causas prováveis, evidência a favor e contra | Camada causal (05, 08) |
| O que fazer primeiro | Conduta: restrição principal, experimento menor, responsável | Tratamento (08) |
| Como saber se funcionou | Acompanhamento: indicadores antecedentes e de resultado, reavaliação | Tratamento (08), validação (09) |
| Com quanta segurança | Faixa, cobertura, estado de calibração, lacunas, exames complementares | Modelo (05), validação (09) |

## 2. Quem usa o relatório e para quê

O relatório serve a usos diferentes. O argumento de validade (09) precisa
sustentar **cada uso**, não apenas "o instrumento".

| Público | Uso pretendido | Uso proibido (P2, P8) |
|---|---|---|
| Direção (CEO, CTO, CFO) | Decidir onde investir, o que parar, que restrição organizacional remover | Bônus, ranking de times, demissão |
| Gestão intermediária | Priorizar condutas no seu escopo; escalar restrições que não controla | Avaliar pessoas do time |
| Times | Entender o próprio sistema; escolher experimentos | Comparar-se com outros times como competição |
| Consultoria / transformação | Plano de tratamento sequenciado; linha de base para medir efeito | Vender ferramenta sem problema demonstrado |
| Especialistas (arquitetura, SRE, segurança, dados) | Aprofundar a ficha do nó da sua disciplina | — |

## 3. Arquitetura do relatório

```text
LAUDO (1 página)          ← leitura em 3 minutos pela direção
  │
  ├─ MAPA NAVEGÁVEL       ← 4 sistemas → 12 domínios → pilares → capacidades → subcapacidades
  │     ├─ por capacidade (o que)
  │     ├─ por estrutura organizacional (onde)
  │     └─ por perspectiva (quem vê o quê)
  │
  ├─ FICHA DO NÓ          ← qualquer nó isolado, com a mesma estrutura em todos os níveis
  │
  ├─ PLANO DE TRATAMENTO  ← condutas sequenciadas por restrição, horizonte e autoridade
  │
  └─ ACOMPANHAMENTO       ← indicadores, reavaliação, o que mudou desde a última leitura
```

A mesma estrutura de ficha vale para a empresa inteira, para um domínio, para uma
capacidade ou para uma subcapacidade. Isso é o que permite **"aprofundar até ver
cada aspecto isolado"** sem mudar de linguagem.

## 4. Laudo (primeira página)

Ordem fixa, inspirada na estrutura de um laudo clínico, com rótulos em linguagem
cotidiana:

1. **Motivo da avaliação** (queixa): o que a organização quis entender, nas
   palavras de quem contratou. Serve para confrontar a queixa com os achados.
2. **Leitura geral:** índice da empresa com faixa, cobertura, alvo do contexto e
   as duas maturidades (técnica e organizacional).
3. **Principais achados** (no máximo 3): o que está acontecendo, onde e com que
   sustentação. Cada achado aponta para sua ficha.
4. **Onde as áreas veem sistemas diferentes** (no máximo 3 divergências): a
   distância entre a teoria declarada e a vivida.
5. **Restrição principal:** o elo que, se tratado primeiro, destrava mais o resto
   (Teoria das Restrições, §08).
6. **Conduta recomendada para os próximos 30 dias:** 1 a 3 experimentos, cada um
   com dono provável e critério de sucesso.
7. **Prognóstico:** o que tende a acontecer se nada mudar (arquétipo sistêmico)
   e o que se espera se a conduta funcionar.
8. **O que ainda não sabemos:** lacunas de cobertura e **exames complementares**
   sugeridos (telemetria, entrevista com perspectiva ausente, reaplicação).
9. **Rodapé de honestidade:** amostra (pessoas, unidades, perspectivas), versão do
   instrumento e do modelo, estado de calibração ("posterior provisório até o
   piloto" ou "calibrado em <data>").

### Exemplo (organização fictícia)

```text
MOTIVO   "Entregamos devagar e não sabemos por quê." — CTO

LEITURA GERAL
  Tecnologia            24%   faixa 18–31%   cobertura 62%   alvo do contexto 45%
  Maturidade técnica    29%   ·  Maturidade organizacional 16%
  Perfil: "Travado por processo" (entrega capaz, espera longa por governança)

ACHADOS
  1. Mudanças prontas esperam 6–15 dias por aprovação de várias pessoas
     (Engenharia › Entrega · 4 áreas · sustentação forte)            → ficha
  2. Metas não atingidas geram pedido de mais esforço, não análise
     (Organização › Direção · 3 áreas · sustentação moderada)        → ficha
  3. Investigar produção depende de 2 pessoas com acesso ao cluster
     (Operação › Observabilidade · 2 áreas · sustentação forte)      → ficha

DIVERGÊNCIAS
  Incidentes   direção 55% · operação 19%   (a direção não vê o que acontece depois do alerta)
  Fluxo        gestão 48%  · engenharia 22%

RESTRIÇÃO PRINCIPAL
  Aprovação de mudança. Ela explica parte dos achados 1 e 3 e alimenta o 2
  (a espera vira "falta de produtividade").

CONDUTA (30 dias)
  • Classificar mudanças por risco e liberar as de baixo risco com revisão por par
    e evidência automática — dono provável: diretoria de tecnologia + segurança
  • Revisão do último objetivo não atingido com a pergunta "o que faltou saber ou
    fazer?" — dono provável: gestão da área

PROGNÓSTICO
  Sem mudança: o padrão "consertos que falham" tende a crescer (mais controles a
  cada incidente → mais espera → lotes maiores → mais incidentes).
  Com a conduta: redução esperada da espera em mudanças de baixo risco; o efeito
  aparece primeiro no tempo de espera, depois na taxa de falha.

O QUE AINDA NÃO SABEMOS
  Segurança e Dados com cobertura < 40%. Exame complementar: telemetria de CI/CD
  (lead time real) para confirmar o achado 1.

Amostra: 64 pessoas · 9 unidades · 7 perspectivas · instrumento v21 · modelo m2
Posterior provisório — ainda não calibrado com piloto.
```

## 5. Mapa navegável

### 5.1 Três cortes do mesmo dado

| Corte | Pergunta | Visual principal |
|---|---|---|
| **Por capacidade** | O que está frágil? | Árvore com índice e faixa em cada nó (forest plot: ponto + intervalo) |
| **Por estrutura** | Onde está frágil? | Matriz unidade × capacidade (heatmap), com células sem cobertura em neutro |
| **Por perspectiva** | Quem vê o quê? | Matriz perspectiva × capacidade, com a divergência destacada |

Os três cortes podem ser combinados (capacidade X na área Y vista pela
perspectiva Z) desde que cada recorte respeite o limiar de anonimato e a
proteção contra ataques de interseção (R5).

### 5.2 Hierarquia do mapa

```text
Tecnologia (raiz)
├─ Produto        → D1 Direção e investimento · D2 Produto e cliente
├─ Engenharia     → D3 Fluxo e entrega · D4 Engenharia e qualidade · D5 Arquitetura
│                   · D6 Dados e IA · D7 Plataforma · D9 Segurança
├─ Operação       → D8 Operação e confiabilidade
└─ Organização    → D10 Estrutura · D11 Pessoas e clima · D12 Direção e aprendizado
```

Cada domínio abre pilares, capacidades e subcapacidades (03 e Anexo A). O último
nível é o **sinal**, e abaixo dele o **evento reconstruído**, sempre agregado.

### 5.3 Nós que pertencem a vários pais

Um nó cinza (por exemplo, "aprovação de mudança") aparece em todos os pais em que
tem aresta `evidencia`. Na ficha, ele mostra **dono primário** (onde a conduta
mora) e **efeitos** (onde o problema se manifesta). O índice do pai recebe a
contribuição pela fração da aresta, sem contagem dupla na raiz (05 §7).

## 6. Ficha do nó

Mesma estrutura para qualquer nó. Campos vazios aparecem como lacuna explícita,
nunca omitidos.

| # | Bloco | Conteúdo | Fonte |
|---|---|---|---|
| 1 | **Cabeçalho** | Nome · caminho no mapa · índice · faixa · cobertura · alvo · tendência desde a última leitura | 05 |
| 2 | **O que é e por que importa** | Definição em uma frase; o que a literatura diz; como uma organização madura se comporta aqui (estágio 4) | 03, rubrica |
| 3 | **Como está** | Distribuição do estágio (0–4) em pontos de quantil; por perspectiva; por unidade | 05 |
| 4 | **O que as pessoas relataram** | Eventos reconstruídos agregados ("em 7 de 11 relatos, a mudança esperou por aprovação") e sinais | 04 |
| 5 | **Por que provavelmente acontece** | Diagnóstico diferencial: até 3 causas com sustentação verbal, evidência a favor e contra, arquétipo sistêmico | 05, 08 |
| 6 | **Onde se resolve** | Contenção (time, serviço compartilhado, política, estrutura, externo) e autoridade necessária | 08 |
| 7 | **O que fazer** | Conduta: menor experimento, pré-condições, custo e risco, domínio Cynefin, grau de evidência da intervenção | 08 |
| 8 | **Como saber se funcionou** | Indicador antecedente, indicador de resultado, horizonte, critério de sucesso | 08 |
| 9 | **O que já funciona** | Práticas fortes a preservar e sinais de regressão | 08 |
| 10 | **Relações** | Arestas do grafo: evidencia, amplifica, bloqueia, depende-de | 03 |
| 11 | **O que não sabemos** | Lacunas, perspectivas ausentes, exames complementares | 05, 09 |
| 12 | **Referências** | Fundamentos da rubrica e da conduta | 11 |

## 7. Linguagem de incerteza

1. **Número com faixa, nunca sozinho.** `24% (18–31%)`. Sem decimais.
2. **Sustentação verbal** para causas, com escala fixa e documentada. Enquanto o
   modelo não for calibrado (09), a escala verbal é a única exibida:

   | Posterior interno | Termo exibido (antes da calibração) | Termo exibido (após calibração) |
   |---|---|---|
   | ≥ 0,90 | sustentação forte | muito provável |
   | 0,70–0,89 | sustentação moderada | provável |
   | 0,50–0,69 | hipótese a verificar | tão provável quanto não |
   | < 0,50 | não publicada como causa | — |

   A escala segue a lógica das escalas de verossimilhança do IPCC: termos fixos
   para faixas fixas, para que "provável" signifique sempre a mesma coisa.
3. **Cobertura separada de confiança.** Cobertura diz quanto do tema foi
   observado; a faixa diz quão incerta é a estimativa do que foi observado.
4. **Visual de incerteza.** Preferir ponto + intervalo e *quantile dotplots* ao
   radar. Estudos com leigos mostram melhores decisões com dotplots de quantis do
   que com intervalos isolados (Kay et al., 2016; Fernandes et al., 2018). O
   radar continua disponível no detalhe, nunca como visual principal: a área do
   polígono depende da ordem dos eixos e induz leitura errada.

## 8. Plano de tratamento

Organizado em três eixos (detalhe em 08):

| Eixo | Valores |
|---|---|
| **Horizonte** | 0–30 dias (condutas imediatas, reversíveis) · 1–3 meses (condutas de capacidade) · 3–12 meses (condutas estruturais) |
| **Autoridade** | Direção · gestão · time · especialista (a mesma causa pode pedir verbos diferentes por nível) |
| **Modo** (Cynefin) | Claro → aplicar prática conhecida · Complicado → análise de especialista · Complexo → experimentos seguros em paralelo · Caótico → estabilizar primeiro |

A sequência respeita dependências: uma conduta estrutural (criar plataforma,
redesenhar times) não entra antes que as pré-condições estejam demonstradas.

## 9. Acompanhamento e reavaliação

- **Pulso curto** (5 minutos, a cada 4–8 semanas) sobre os nós tratados, usando
  os mesmos itens-âncora para comparabilidade.
- **Reavaliação completa** a cada 6–12 meses, com a mesma versão de instrumento ou
  com uma ponte de equating documentada (09).
- **Mudança publicada** somente quando a diferença entre leituras supera a faixa
  (probabilidade posterior de melhora ≥ 0,8), nunca por diferença de ponto.
- **Telemetria** (quando conectada) acompanha os indicadores de resultado sem
  depender de nova entrevista.

## 10. O que o relatório nunca faz

- Nomear ou permitir inferir pessoas (P2, P3).
- Mostrar o índice sem faixa, cobertura e estado de calibração (P4).
- Recomendar ferramenta sem problema demonstrado (P1).
- Transformar o índice em meta de bônus. O relatório declara isso na primeira
  página (P8).
- Esconder divergência para "simplificar" a leitura executiva (P5).
