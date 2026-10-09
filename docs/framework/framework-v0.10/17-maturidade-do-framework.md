# 17 — O framework está maduro? Limites, riscos e premissas datadas

> O framework aplicado a si mesmo, com a mesma honestidade que ele exige das
> organizações (P4).

## 1. Resposta curta

- **A arquitetura é sólida**: princípios, relatório-alvo, método de evidência,
  modelo estatístico, tratamento e validação formam um todo coerente e com base
  na literatura.
- **O produto ainda não é maduro**: a maior parte do que a v0.5 e a v0.6
  descrevem é especificação. O modelo não foi testado nem em simulação (E0),
  metade dos temas do mapa não tem rubrica nem perguntas, e nenhum estudo com
  pessoas reais foi concluído.
- **"Descobrir verdades" a partir de comportamento é possível só em parte.** O
  instrumento produz **crenças calibráveis com incerteza declarada** sobre o que as
  pessoas vivem. Para aspectos técnicos que ninguém vê no dia a dia, precisa de
  **exames complementares** (§3).
- **"Receitar soluções para toda a área"**: para problemas claros e complicados,
  sim, com grau de evidência. Para problemas complexos (a maioria dos
  organizacionais), a receita honesta é um **portfólio de experimentos** (08 §5),
  não uma prescrição.

## 2. Autoavaliação por componente

Usando a escala do próprio produto (0 opaco · 1 reativo · 2 repetível ·
3 gerenciado · 4 adaptativo):

| Componente | Estágio | Por quê | O que sobe um degrau |
|---|---|---|---|
| Constituição (02) | **3** | Princípios estáveis; regras com critério de mudança por ADR | Ser usada numa decisão difícil real e sobreviver |
| Visão e relatório (01) | **2** | Especificado e coerente; não construído nem testado com leitores | Protótipo do laudo lido por 5 diretores e 5 times |
| Mapa de capacidades (03, 13) | **2** | Amplo; 29 folhas com contrato; 54 temas + 12 capacidades novas sem contrato | Autoria das 7 prioridades de 03 §3.2 e de N1, N5 |
| Metodologia de evidência (04) | **2** | Contrato definido; matriz Q não migrada | WP3 concluído e auditoria verde |
| Modelo estatístico (05, 15) | **2** | Estrutura correta; parâmetros elicitados; protótipo reproduz exemplos | E0 (simulação e recuperação) aprovado |
| Motor adaptativo (06) | **1–2** | Motor vigente funciona; o novo é especificação | WP6 com os critérios de 06 §8 |
| Banco de perguntas | **2** em entrega e operação · **1** em organização, dados, IA | Grafo v20 com 92 nós concentrado em entrega | Itens para D10–D12, D6 e N1–N7 |
| Diagnóstico causal (05 §8, 08) | **1–2** | Biblioteca vigente cobre entrega; noisy-OR e arquétipos não implementados | WP5 e elicitação SHELF de 3 famílias |
| Tratamento (08) | **1** | Contrato definido; graus de evidência não atribuídos; poucas condutas nos domínios novos | Biblioteca com grau para as 30 condutas mais frequentes |
| Validação (09) | **1** | Plano e infraestrutura de gate; nenhum estudo concluído | E0, E1 e E2 |
| Privacidade e ética | **3** | Supressão por partição e anonimato implementados no repositório | Relatório de impacto (RIPD) e revisão ética de D11 |

**Leitura geral:** estágio **2, "repetível no papel"**. É o ponto certo para
parar de ampliar escopo e começar a **construir e testar** (§5).

## 3. O que o comportamento revela e o que não revela

| Revela bem | Revela em parte | Não revela sozinho |
|---|---|---|
| Esperas, decisões, contornos, heroísmo | Qualidade da arquitetura | Vulnerabilidades específicas |
| Uso real das práticas (apropriação) | Qualidade do código e dívida técnica | Desempenho e custo reais |
| Clima, voz, reação à má notícia | Postura de segurança | Conformidade legal detalhada |
| Divergência entre áreas | Sofisticação técnica (12) | Métricas DORA exatas |

### 3.1 Exames complementares

Quando a ficha do nó marca "exame complementar sugerido", estas são as opções. Cada
uma entra como **leitura separada** (R25) e confirma ou refuta a entrevista:

| Exame | O que mede | Nós que confirma | Esforço |
|---|---|---|---|
| Telemetria de Git e CI/CD | Lead time, frequência, idade de branch, tamanho de PR, taxa de falha | D3, D4 | Baixo (API) |
| Análise de repositório | Posse do código (quem altera o quê), acoplamento por mudança conjunta, arquivos quentes | D5, D10 (Conway), D4 | Médio |
| Registro de incidentes | Recorrência, tempo até a hipótese, participação nas revisões | D8, D12 | Baixo |
| Configuração de nuvem (varredura de políticas) | Identidade, exposição, tags, recursos sem dono | D9, D7 | Baixo |
| Faturas e custo | Custo por serviço, desperdício, tendência | D7, N3 | Baixo |
| Portfólio de aplicações | Inventário, duplicidades, fim de suporte | N1 | Médio |
| Registros de decisão (ADRs, atas) | Decisões registradas, revisadas, com alternativas | D5, D10 | Médio |
| Observação de ritos (amostra) | Efeito real de daily, retro, revisão | D10 método, D12 | Alto |
| Entrevista qualitativa guiada | Mecanismos que o questionário não discriminou | Qualquer | Alto |

## 4. Riscos do próprio framework

| Risco | Por que é real | Mitigação |
|---|---|---|
| **Volume de autoria** | 66 temas × ≥ 2 eventos × perspectivas = centenas de itens | Priorizar por sinais (03 §3.2); método de 14 §9; reutilizar eventos entre folhas via matriz Q |
| **Carga do respondente** | Mais temas = entrevista mais longa | Amostragem matricial (06 §4); orçamento de 15–25 min |
| **Promessa excessiva** | "Descobrir a verdade" vende mais do que o instrumento entrega | Linguagem de incerteza (01 §7); exames complementares; rodapé de calibração |
| **Viés do autor** | O mapa reflete as convicções de quem o escreveu | Revisão cega por especialistas (E2); piloto diverso; sinais que podem contrariar o autor |
| **Dependência de consultor** | Relatório difícil de ler sem mediação | Walkthrough (16); linguagem cotidiana; testes com leitores |
| **Uso punitivo** | Índice vira meta ou arma | P8 na primeira página; nada individual; pactuação de uso no contrato |
| **Idioma e cultura** | Hierarquia e franqueza variam entre países e empresas | DIF por idioma e porte (09 §5); vinhetas |
| **Modismo** | O framework pode fixar as práticas de hoje | Ciclo de vida das práticas e do próprio mapa (16 §7) |

## 5. Critérios para chamar de v1.0

1. E0 aprovado (recuperação de parâmetros).
2. Contrato completo (03 §5) para as 29 folhas e pelo menos 15 dos temas novos.
3. Relatório v2 testado com leitores reais (diretoria e times) com compreensão
   correta dos achados em ≥ 80% dos casos.
4. Piloto E3 concluído com os critérios de 09 §3.
5. Gate de calibração aberto (09 §8).
6. Pelo menos uma reavaliação completa (16) em 3 organizações.

## 6. Premissas da conversa que merecem revisão

Pedido explícito: apontar o que faz ou fazia sentido e pode não fazer mais. Nada
disso invalida a ideia do projeto; são ajustes de referência.

| Premissa | Situação | Ajuste |
|---|---|---|
| Régua "DORA elite" | O DORA substituiu a classificação elite/alto/médio/baixo por 7 perfis em 2025; as métricas passaram de 4 para 5 | Usar perfis e capacidades; categoria DORA só com telemetria (R8) |
| "Well-Architected nível 5" | O Well-Architected não tem níveis; é uma revisão de riscos por workload (alto, médio) | Usar como revisão de risco (N12). Níveis existem em outros modelos (CNCF, SAMM, COBIT) |
| Google, Amazon, Netflix, Uber, Spotify como estado da arte | Viés de sobrevivência; práticas nasceram para a escala e o contexto delas | Extrair o princípio e testar no contexto (P6). O "modelo Spotify" é o caso clássico: a própria Spotify não opera como no vídeo de 2014 |
| Tradicional → digital → AI-first como caminho linear | O MIT CISR descreve estágios de maneiras de trabalhar; áreas da mesma empresa ficam em estágios diferentes; transformação não termina | Estágio por área e contínuo (16), não uma "transformação" com data de fim |
| *Blameless culture* | Continua válida, mas "sem culpa" não é "sem responsabilidade". A formulação atual é **cultura justa** (Dekker) e **aprendizado com incidentes** | Rubrica de aprendizado observa responsabilidade e aprendizado juntos |
| Modelo de fases da IBM (e similares) | Útil como trilha de sofisticação técnica; mede o mecanismo, não o uso | Incorporado como segundo eixo (12), fora do índice |
| TOGAF | O ADM em cascata e os repositórios de artefatos envelheceram | Arquitetura contínua e leve, com decisões perto dos times (13 §2) |
| ISOs | Certificação mostra conformidade de processo, não maturidade de comportamento | Usar a filosofia de cada norma como lente; certificado não pontua (P1) |
| "Time de DevOps" ou "time de SRE" como sinal de maturidade | Criar um time com o nome costuma virar um novo silo (antipadrão descrito em Team Topologies) | Observar interação e ownership, não o nome do time |
| Estágios de Tuckman (citados no repositório) | O modelo linear formar → confrontar → normatizar → desempenhar tem pouco suporte empírico como sequência fixa | Usar só como vocabulário, nunca como classificação (regra vigente já diz isso) |
| Percentual com decimais | Precisão falsa | Inteiro com faixa (R1) |
