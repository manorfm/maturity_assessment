# 21 — Agenda de robustez: o que ainda falta explorar

> Robustez tem três faces: **conteúdo** (temas e profundidade), **evidência**
> (validação) e **uso real** (como o produto se comporta nas mãos de clientes,
> consultores e respondentes). Este documento lista o que falta em cada uma e
> termina com as 10 prioridades.

## 1. Temas ainda não explorados

Além das lacunas de 13 §6, a conversa e a revisão encontraram estes temas sem
cobertura:

| Tema | Por que importa | Onde entraria | Situação |
|---|---|---|---|
| **Cultura escrita e decisão** (design docs, RFCs, memorandos, ADRs, trabalho assíncrono) | Como a organização pensa e decide; base de conhecimento; ouvir ideias diferentes | D10 / D12 | Ausente |
| **Contratação técnica** (entrevista, critério, viés, tempo até contratar) | A qualidade do time começa aqui; ligação com pessoa-função e onboarding | D11 | Ausente |
| **Carreira e desempenho de engenheiros** (trilhas técnicas, staff+, calibração) | Trilha técnica sem prestígio empurra especialistas para gestão (17 §6) | D11 | Parcial |
| **Trabalho remoto e híbrido** (fusos, reuniões, documentação) | Muda coordenação, onboarding e voz | D10 | Ausente |
| **Estratégia técnica** (Larson, *Crafting Engineering Strategy*, 2025) | Diferença entre ter opiniões técnicas e ter estratégia | D1 / N6 | Parcial |
| **Uso e contribuição em open source** (licenças, SBOM, contribuição) | Risco legal e de cadeia de software; reputação técnica | D4 / D9 | Ausente |
| **Trilhas por tipo de produto** (mobile e lojas de apps, front-end, embarcado, dados) | Liberação, testes e observabilidade mudam por tipo de produto | Variantes de evento | Ausente |
| **Suporte ao cliente como fonte de feedback** | O suporte vê o problema antes da engenharia (S61) | N2 | Parcial |
| **Comunicação de crise externa** (página de status, clientes) | Confiança do cliente durante incidentes | D8 / N2 | Parcial |
| **Documentação técnica e portal do desenvolvedor** | Descoberta de informação é o maior atrito (Atlassian 2025) | D7 | Parcial |
| **Momento organizacional** (fusão, reestruturação, crescimento acelerado, demissões) | Muda clima e estrutura; afeta a leitura | Contexto (02) | Só como variável |
| **Diversidade e inclusão** | Afeta voz, justiça e retenção | D11 via justiça e voz | Sensível: só por itens referidos ao grupo, nunca atributos pessoais |

## 2. Profundidade: dossiês por tema

Profundidade de estado da arte significa ter, para cada tema, um dossiê com as 12
seções de 18 §13. Situação:

| Situação | Temas |
|---|---|
| Dossiê completo | Observabilidade (18) |
| Parcial (escadas e sinais, sem dossiê) | Canary, postmortem, capacidade, fluxo e CFD, indicadores, integração analítica, aprovação de mudança, cerimônias, IA, desdobramento estratégico, metas, voz, desenho de time, pessoa-função, melhoria (Anexo A); padrão × caixa (14) |
| Sem dossiê | Os demais temas de 13 e §1 |

**Meta para v1.0:** 12 dossiês completos, na ordem de 18 §13, começando pelos
temas com mais sinais no catálogo: resposta a incidentes, entrega contínua,
plataforma, indicadores e metas, organização e liderança.

## 3. Robustez de evidência

| Item | Situação | O que falta |
|---|---|---|
| E0 simulação e recuperação | Não iniciado | Rodar no laboratório (primeira tarefa técnica) |
| Entrevistas cognitivas | Infraestrutura pronta | Rodar com o banco reescrito (19) |
| Rótulos cegos de especialistas | Infraestrutura pronta | Recrutar 2 especialistas por disciplina |
| Piloto de campo | Não iniciado | 8–12 organizações diversas |
| **Base de referência** ("o que organizações parecidas fazem") | Não existe | Acumular avaliações com consentimento (R30); publicar só com ≥ 30 organizações comparáveis |
| **Evidência das condutas** | Graus A–D definidos, não atribuídos | Atribuir grau às 30 condutas mais frequentes; acompanhar efeito (15, E4) |

## 4. Robustez de uso

| Item | Por que | O que fazer |
|---|---|---|
| **Modo facilitado** (workshop) | Algumas organizações preferem conversa conduzida; times pequenos não atingem o limiar | Roteiro de facilitação com as mesmas perguntas; respostas registradas em grupo, marcadas como tal |
| **Guia do consultor** | Interpretar o laudo e conduzir o walkthrough exige método | Guia por seção do laudo; casos resolvidos; o que não dizer |
| **Pacto de uso com o contratante** | Protege contra uso punitivo (P8) | Termo antes da coleta: sem uso individual, sem bônus, divulgação aos respondentes |
| **Teste com leitores** | O laudo precisa ser entendido sem consultor | 5 diretores e 5 times leem e explicam o que entenderam (17 §5) |
| **Segurança do próprio produto** | Ele guarda dados sensíveis de organizações | Modelagem de ameaça, teste de invasão, controles de acesso; certificação quando houver clientes que exijam |
| **Idiomas** | Viés de tradução e de cultura | Versões revisadas semanticamente, com DIF por idioma (09 §5) |
| **Acessibilidade do produto** | Respondentes com deficiência | Teste com tecnologias assistivas (backlog vigente) |

## 5. Robustez contra manipulação

Quando o resultado importa, pessoas podem tentar influenciá-lo.

| Risco | Sinal | Mitigação |
|---|---|---|
| Time combina respostas para parecer melhor | Concordância anormalmente alta, padrão idêntico, tempos parecidos | Estatísticas de ajuste da pessoa e de concordância (15 §3); reduz peso, não expõe ninguém |
| Time combina respostas para parecer pior (e ganhar investimento) | Idem, na direção oposta | Idem; confronto com exames complementares |
| Liderança orienta as respostas | Divergência baixa entre perspectivas onde se esperava alta; texto livre repetitivo | Comunicação independente aos respondentes; anonimato reforçado |
| Resposta apressada | Tempo muito curto; mesma posição em todas as perguntas | Peso menor; ordem das opções variada (vigente) |

## 6. As 10 prioridades

| # | Prioridade | Face | Esforço | Impacto |
|---|---|---|---|---|
| 1 | Rodar E0 (simulação e recuperação) no laboratório | Evidência | Baixo | Alto: valida o modelo antes de gastar com pessoas |
| 2 | Reescrever o banco de perguntas no padrão de 19 | Conteúdo | Alto | Alto: sem isso o estágio do meio não é medido |
| 3 | Protótipo do laudo testado com leitores | Uso | Médio | Alto |
| 4 | Dossiês de resposta a incidentes e de entrega contínua | Conteúdo | Médio | Alto |
| 5 | Rubricas de indicadores/metas e desdobramento estratégico | Conteúdo | Médio | Alto |
| 6 | Entrevistas cognitivas e rótulos cegos com o banco novo | Evidência | Médio | Alto |
| 7 | Importação de Git e CI/CD (primeiro exame complementar) | Evidência | Médio | Médio-alto |
| 8 | Pacto de uso e guia do consultor | Uso | Baixo | Médio-alto |
| 9 | Laya fases 1 e 2 (autoria, pedir exemplo, codificação) | Conteúdo | Médio | Médio |
| 10 | Piloto de campo com 8–12 organizações | Evidência | Alto | Decisivo para v1.0 |
