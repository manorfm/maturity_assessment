# 15 — Estatística suficiente? Algoritmos de IA (sem LLM) e o Laya

## 1. Resposta curta

- **Para a primeira versão e o piloto, sim.** O modelo da v0.5 (posterior
  discreta, observadores com severidade, pooling hierárquico, noisy-OR) é
  correto em estrutura, explicável e implementável.
- **Para acompanhar a evolução e aprender com muitas organizações, não.** Faltam
  cinco coisas: tempo, dependência entre capacidades, ausência não aleatória,
  efeito de tratamento e aprendizado entre organizações (§2).
- **Algoritmos de IA sem LLM ajudam**, mas cada um só entra quando houver dados
  suficientes e sempre fora do caminho de decisão em tempo real, com saída
  explicável e revisão humana (§3–§4).
- **O Laya serve para uma tarefa específica**: classificar texto livre em
  categorias do livro de códigos, depois de ajuste fino e calibração em
  português. Não serve para decidir estágio, causa, conduta nem o fluxo da
  entrevista (§5).

## 2. Lacunas estatísticas da v0.5

| # | Lacuna | Por que importa | Modelo proposto | Quando |
|---|---|---|---|---|
| E1 | **Tempo** | Reavaliação precisa distinguir melhora real de ruído, e o prognóstico precisa de números | **Rede bayesiana dinâmica / modelo oculto de Markov**: probabilidade de transição entre estágios por capacidade, condicionada à conduta aplicada | Após 2+ leituras em 20+ organizações |
| E2 | **Dependência entre capacidades** | Folhas hoje são independentes; na realidade, CI e testes andam juntos, clima e aprendizado também. Dependência permite inferir o que não foi perguntado e detectar incoerência | **Prior multidimensional** (correlação entre folhas) ou **rede bayesiana entre capacidades** com estrutura elicitada | Estrutura elicitada já; estimação com o piloto |
| E3 | **Ausência não aleatória** | "Não observo" não é aleatório: quem não vê o incidente muitas vezes está num lugar onde incidentes são escondidos | Modelar a visibilidade como variável (05 §4) e testar sensibilidade a ausência não aleatória (padrão-mistura) | Piloto |
| E4 | **Efeito de tratamento** | "Melhorou porque fizemos a conduta?" | **Diferenças em diferenças**, **controle sintético** e modelos hierárquicos bayesianos com unidades tratadas e não tratadas | 10+ organizações com condutas acompanhadas |
| E5 | **Aprendizado entre organizações** | Priors melhores, benchmark honesto, "o que organizações parecidas fizeram" | Modelo hierárquico com nível de organização e setor; meta-análise dos efeitos | 50+ organizações, com consentimento (§4) |

## 3. Algoritmos de IA sem LLM

| Problema | Algoritmo | Dados necessários | Valor | Risco e guarda |
|---|---|---|---|---|
| Qual pergunta fazer | **Desenho experimental bayesiano** (ganho esperado de informação; já na v0.5) + **otimização inteira** para a amostragem matricial | Nenhum além do modelo | Entrevista mais curta, cobertura maior | Explicável por construção |
| Qual pergunta fazer (alternativa) | Aprendizado por reforço / *bandits* | Muito | Pequeno sobre o anterior | **Não recomendado**: otimiza o que é fácil de medir (tempo, conclusão), não a verdade |
| Descobrir relações causais novas | **Descoberta causal** (PC, FCI, GES) com restrições dos especialistas | Centenas de unidades | Sugere arestas não previstas na biblioteca causal | Saída é **hipótese para revisão humana**, nunca aresta publicada automaticamente |
| Perfis de organização | **Análise de classes/perfis latentes**, modelos de mistura | 30+ organizações | Perfis como os do DORA 2025 ("travado por processo", "gargalo de legado") com base empírica | Perfil não é rótulo de valor; publicar com incerteza de classificação |
| Prognóstico numérico | **Rede bayesiana dinâmica** (E1); **simulação de dinâmica de sistemas** para arquétipos | E1: longitudinal. Simulação: parâmetros elicitados | "Se nada mudar, em 12 meses…" com faixa | Simulação é didática até ser calibrada |
| Priorização da conduta | **Centralidade no grafo causal** (restrição principal, 08 §4); **otimização com restrições** (capacidade, dependências, limite de WIP) para sequenciar o plano | Grafo e condutas | Plano viável, não lista de desejos | Mostrar o critério e as alternativas quase tão boas |
| Recomendar pela experiência | **Raciocínio baseado em casos** (vizinhos mais próximos por contexto e achados) | 30+ casos com resultado | "Organizações parecidas tentaram X e Y; X funcionou em 4 de 6" | Casos anonimizados e agregados; nunca expor organização identificável |
| Qualidade da resposta | **Estatísticas de ajuste da pessoa** (*person-fit*), tempo de resposta, padrão em linha | Nenhum além do modelo | Reduz peso de respostas descuidadas | Reduz peso, **não exclui** a pessoa; nunca expõe quem |
| Texto livre | **Classificadores encoder ajustados** (BERT e similares, incluindo o Laya) | 300–500 respostas codificadas por humanos | Codificação consistente e barata | Revisão humana dos incertos e raros; κ medido (07 §6) |
| Telemetria (quando conectada) | Detecção de anomalia e mudança de regime em séries (lead time, falha) | Séries temporais | Confirma ou refuta a entrevista (exame complementar) | Leitura separada da entrevista (R25) |

## 4. Regras para qualquer algoritmo

1. **Fora do caminho de decisão em tempo real.** Algoritmos treinados rodam no
   laboratório (10, WP10) e produzem parâmetros ou sugestões versionadas.
2. **Explicável** (P4): o relatório diz de onde veio cada número e cada sugestão.
3. **Portão de dados:** cada algoritmo declara o volume mínimo e só é ativado
   quando ele existe.
4. **Sem modelos de indivíduo** (P2, P8): nenhum algoritmo estima nada sobre uma
   pessoa, só sobre unidades.
5. **Justiça entre grupos:** testar funcionamento diferencial por perspectiva,
   porte e idioma antes de publicar (09 §5).
6. **Aprendizado entre organizações só com consentimento** explícito e dados
   agregados; opção de não participar sem perder o serviço.
7. **Nada aprende sozinho em produção** (gate vigente).

## 5. O Laya

### 5.1 O que é

O Laya é um motor de decisão **não autorregressivo**, baseado em encoders
(ModernBERT-large, 421M parâmetros, e uma versão multilíngue mmBERT-base, 322M).
Recebe um texto e devolve, numa única passagem de ~33 ms, uma **escolha entre
categorias**, uma **nota ordinal** ou um **sim/não**, com probabilidades.
Licença Apache 2.0; roda localmente.

Pontos relevantes do próprio projeto:

- os checkpoints vêm **superconfiantes**; a versão em inglês precisa de ajuste de
  temperatura (ECE cai de 0,47 para 0,08). A **multilíngue não tem temperaturas
  ajustadas**, então para português a calibração é trabalho nosso;
- no modo de decisões tipadas, o desempenho sem ajuste fino fica **perto do
  acaso**; ajuste fino é essencial;
- **não gera explicação** da decisão, só probabilidades.

### 5.2 Onde cabe no produto

> Detalhado e ampliado (oito pontos de uso, ordem de adoção) em [20](20-laya-pontos-de-uso.md).

| Uso | Encaixe | Condição |
|---|---|---|
| Codificar resposta aberta em código do livro de códigos (07 §6) | **Bom**: é classificação dedutiva, onde encoders ajustados superam LLMs de uso geral (κ > 0,85 em códigos frequentes no estudo citado em 07) | Ajuste fino com 300–500 respostas codificadas; calibração em português; revisão humana abaixo do limiar e nos códigos raros; κ ≥ 0,7 |
| Verificar se uma resposta aberta descreve um evento concreto | Bom (sim/não) | Mesmas condições |
| Classificar o tipo de evento relatado (família de tarefa) | Bom (escolha) | Mesmas condições |
| Decidir estágio, causa ou conduta | **Não** | Viola P4 (sem explicação) e duplica o modelo bayesiano, que já é exato e explicável |
| Escolher a próxima pergunta | **Não** | O seletor bayesiano é ótimo por construção e explicável |
| Decidir pontos do produto (priorização de roadmap etc.) | **Não** | Decisão de produto pede argumento, não classificação de texto |

### 5.3 Menor experimento

1. Montar 400 respostas abertas codificadas por dois humanos (piloto E3).
2. Ajustar o Laya multilíngue em 300; testar em 100.
3. Ajustar a temperatura para português; medir ECE.
4. Comparar κ(Laya × humano) com κ(humano × humano).
5. Adotar se κ(Laya × humano) ≥ 0,7 e ECE ≤ 0,08; senão, manter a codificação
   humana com o LLM só como sugestão (07 §6).

## 6. O que libera cada algoritmo, por volume de dados

| Fase | Dados disponíveis | O que entra |
|---|---|---|
| 0 — Antes do piloto | Simulação | Modelo v0.5; E0; simulação de arquétipos (didática); otimização do plano |
| 1 — Piloto | 8–12 organizações, 1 leitura | Estimação de κ, δ, ρ, ψ, ω; prior multidimensional (E2); Laya para texto |
| 2 — Primeira base | 30–50 organizações | Perfis latentes; raciocínio baseado em casos; E3 |
| 3 — Base longitudinal | 20+ organizações com 2+ leituras | Transições entre estágios (E1); prognóstico numérico; efeito de tratamento (E4) |
| 4 — Base ampla | 200+ organizações | Descoberta causal como hipótese; aprendizado entre organizações (E5); benchmark por setor |
