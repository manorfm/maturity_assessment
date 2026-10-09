# 20 — Laya: onde faz sentido usar

> O Laya é um classificador encoder (escolha entre categorias, nota ordinal,
> sim/não, ~33 ms, local, Apache 2.0). Faz sentido onde o produto precisa
> **classificar texto em categorias fixas, rápido, localmente e em volume**, e
> onde um erro é barato e revisável. Não faz sentido onde o produto precisa
> **raciocinar sobre evidência** (isso é o modelo bayesiano) ou **explicar a
> decisão** (o Laya não explica).

## 1. Pontos de uso, por prioridade

| # | Ponto | Tarefa Laya | Quando roda | Risco se errar | Guarda |
|---|---|---|---|---|---|
| **L1** | **Codificar resposta aberta** no livro de códigos (07 §6; exemplo do passo 6 da escada, 19 §5.1) | Escolha | Depois da coleta (lote) | Baixo: revisão humana dos incertos e raros | κ ≥ 0,7 com humanos; ECE ≤ 0,08; código com κ baixo não alimenta o relatório |
| **L2** | **"Outra opção"**: quando a pessoa escolhe "nenhuma destas" e escreve, mapear para a opção existente mais próxima ou marcar como "nova" | Escolha entre as opções do item + "nova" | Depois da coleta | Baixo: evidência entra com discriminação baixa | Só vira evidência com confiança ≥ limiar; "nova" alimenta a autoria |
| **L3** | **A resposta descreve um caso concreto?** Decide se vale pedir um exemplo mais específico | Sim/não | **Durante** a entrevista | Muito baixo: no pior caso, pede um exemplo a mais ou a menos | Nunca pontua; só decide mostrar ou não um pedido de exemplo (R32 ajustada) |
| **L4** | **Triagem de PII** no texto livre, como segunda barreira depois de regras e reconhecedor de entidades | Sim/não ("contém nome de pessoa, time pequeno, cliente ou data precisa?") | Antes de armazenar | Médio: falso negativo vaza dado | Nunca a única barreira; na dúvida, mascara |
| **L5** | **Classificar documentos de postmortem** (exame complementar): tipo de ação ("treinar pessoa", "nova aprovação", "mudança de sistema"), presença de fatores contribuintes, participação de áreas | Escolha e sim/não | Lote, no laboratório | Baixo | Resultado agregado; amostra revisada por humano |
| **L6** | **Classificar tickets** para a distribuição do fluxo (funcionalidade, defeito, risco, dívida — Flow Framework, N11) | Escolha | Lote | Baixo | Idem |
| **L7** | **Apoio à autoria**: sinalizar opção com vocabulário de valor, opção composta, pergunta habitual (19 §4) | Sim/não por regra | Na auditoria do instrumento | Nenhum: só sugere ao autor | Complementa as regras da auditoria, não substitui |
| **L8** | **Classificar ADRs e atas** de decisão (há alternativas? há critério? há revisão?) | Sim/não | Lote | Baixo | Agregado |

## 2. Onde **não** usar

| Uso | Por quê |
|---|---|
| Decidir estágio, causa ou conduta | Viola P4 (sem explicação); o modelo bayesiano já é exato e explicável |
| Escolher a próxima pergunta do grafo | O seletor por ganho de informação é ótimo por construção e auditável |
| Avaliar a qualidade da resposta de uma pessoa para descartá-la | Risco de viés por estilo de escrita e idioma; P2 |
| Análise de sentimento ou clima a partir de texto | Construto mal definido; clima se mede por itens referidos ao grupo (07 §4.1) |
| Priorizar o roadmap do produto | Decisão de produto pede argumento, não classificação |

## 3. Condições para adotar

1. **Ajuste fino** com dados do próprio produto (zero-shot de decisões tipadas fica
   perto do acaso, segundo o próprio projeto).
2. **Calibração em português**: a versão multilíngue vem sem temperaturas ajustadas.
3. **Execução local** (on-premises ou na infraestrutura do produto): texto de
   respondente não sai do ambiente (LGPD, P3).
4. **Medição contínua**: κ e ECE por código, publicados no painel do instrumento.
5. **Versão registrada** do modelo e do livro de códigos em cada relatório.

## 4. Ordem de adoção

| Fase | Pontos | Dependência |
|---|---|---|
| 1 | L7 (autoria) e L3 (pedir exemplo) | Pouco dado; risco quase nulo; ajuda já a reescrita do banco (19) |
| 2 | L1 e L2 (codificação) | 300–500 respostas codificadas por humanos no piloto |
| 3 | L4 (PII, segunda barreira) | Conjunto de teste com PII sintética em português |
| 4 | L5, L6, L8 (exames complementares) | Integração com documentos e tickets da organização |

## 5. Ajuste de regra

R32 passa a ser: *"Classificador de texto (Laya ou similar) pode codificar texto
aberto (L1, L2), triar PII como segunda barreira (L4), classificar documentos em
exames complementares (L5, L6, L8), apoiar a autoria (L7) e decidir se pede um
exemplo (L3). Nunca decide estágio, causa, conduta ou o próximo nó do grafo."*
