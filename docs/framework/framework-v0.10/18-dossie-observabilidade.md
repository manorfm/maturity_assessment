# 18 — Dossiê de estado da arte: observabilidade

> Um **dossiê** reúne o que as referências da área (empresas que operam em
> escala, pesquisadores e comunidades) dizem sobre um tema, e o traduz para o
> produto: filosofia, práticas, cultura, escadas, sinais, perguntas, causas,
> condutas e exames. Este é o primeiro dossiê e serve de modelo para os demais
> (§12). O objetivo não é repetir um fornecedor, e sim levar a organização ao
> **estado da arte de cultura e filosofia técnica** do tema.

## 1. Fontes

| Fonte | Contribuição principal |
|---|---|
| **Google** — *SRE Book* (2016), *SRE Workbook* (2018), artigo Dapper (2010) | Quatro sinais de ouro; alertar por sintoma; SLO e error budget; alertas por taxa de consumo em múltiplas janelas; rastreamento distribuído |
| **Amazon** — Builders' Library (Yanacek; "Instrumenting distributed systems for operational visibility"; "Building dashboards for operational visibility"); Werner Vogels (2006) | Um registro estruturado por unidade de trabalho com tempos das dependências; painéis por experiência do cliente; "you build it, you run it"; revisões semanais de métricas operacionais; *Correction of Errors* |
| **Honeycomb** — Majors, Fong-Jones & Miranda, *Observability Engineering* (2022); modelo de maturidade de observabilidade; "Observability 2.0" | Observabilidade como capacidade de responder perguntas novas sem enviar código novo; eventos largos como fonte única; alta cardinalidade; desenvolvimento orientado por observabilidade |
| **Stripe** — *canonical log lines* (Brandur Leach) | Uma linha de log rica e estruturada por requisição, com todo o contexto |
| **Meta** — Scuba (VLDB, 2013) | Origem dos eventos largos consultáveis em segundos |
| **Netflix, Uber** — blogs de engenharia; Jaeger (Uber) | Observabilidade em escala; rastreamento como padrão aberto |
| **Brendan Gregg** (método USE) · **Tom Wilkie** (método RED) | Roteiros mínimos para recursos (utilização, saturação, erros) e serviços (taxa, erros, duração) |
| **Cindy Sridharan** — *Distributed Systems Observability* (2018) | Observabilidade × monitoramento; limites dos "três pilares" |
| **Alex Hidalgo** — *Implementing Service Level Objectives* (2020) | SLO como conversa entre engenharia e negócio |
| **OpenTelemetry / CNCF** | Padrão aberto de instrumentação; perfis contínuos como quarto sinal (alfa pública em março de 2026) |
| **Engenharia de resiliência** — Cook, *How Complex Systems Fail* (1998); Woods & Allspaw (relatório STELLA, 2017); VOID (Nash) | Sistemas complexos sempre operam parcialmente degradados; o entendimento está nas pessoas ("acima da linha"); aprendizado com incidentes |
| **DORA** — capacidade "monitoring and observability" | Relação com desempenho de entrega |
| **Grafana Labs** — Observability Survey 2026 (1.363 respostas) | Estado do mercado: custo é o critério nº 1 (65%); complexidade é a maior preocupação (38%); fadiga de alertas é o maior obstáculo à resposta (30%) |

## 2. Filosofia: o porquê

1. **Sistemas complexos falham de formas novas.** Não é possível prever todos os
   painéis. Observabilidade é a capacidade de **fazer perguntas novas ao sistema
   em produção e obter resposta sem enviar código novo** (Majors). Monitoramento
   responde ao que já se sabia perguntar; observabilidade, ao que ninguém previu.
2. **O usuário sente sintomas, não causas.** Alertas e objetivos se ancoram no
   que o usuário vive: latência, erros, disponibilidade da jornada (Google).
   Causas (CPU, memória) são para investigar, não para acordar alguém.
3. **Confiabilidade é uma decisão de produto.** O SLO define quanto de falha é
   aceitável e o error budget decide quando priorizar confiabilidade sobre
   funcionalidade. É uma conversa entre engenharia e negócio (Hidalgo).
4. **Quem constrói, opera.** Quem escreve o código instrumenta, entende o
   comportamento em produção e participa do plantão (Vogels). Observabilidade
   terceirizada para outra equipe perde o contexto.
5. **O entendimento está nas pessoas.** Ferramentas representam o sistema; o
   modelo mental do time é o que resolve incidentes (Woods: "acima da linha").
   Por isso observabilidade é sociotécnica: acesso, habilidade de investigar e
   aprendizado coletivo importam tanto quanto dados.
6. **Instrumentar faz parte de construir.** A instrumentação nasce com o código,
   é revisada como o código e verificada depois de cada deploy
   (desenvolvimento orientado por observabilidade).
7. **Contexto antes de volume.** Um evento rico por unidade de trabalho (com
   usuário, versão, feature flag, dependências e tempos) vale mais que milhões
   de linhas soltas. Decidir **na leitura** (eventos largos) em vez de **na
   escrita** (métricas pré-agregadas) preserva perguntas futuras.
8. **Telemetria tem custo e é um produto.** Amostragem, retenção e cardinalidade
   são decisões de engenharia com dono. Padrões abertos evitam aprisionamento.

## 3. Como o pensamento evoluiu (o que expirou)

| Antes | Hoje (estado da arte) | Por que mudou |
|---|---|---|
| "Três pilares": logs, métricas e traces em ferramentas separadas | **Eventos largos estruturados como fonte única**, de onde se derivam métricas e traces | Correlacionar entre silos custa caro e perde o contexto |
| Painel para tudo | **Perguntas ad hoc** sobre dados de alta cardinalidade; poucos painéis, por jornada do cliente | Painéis respondem só o que se previu |
| Alerta por limiar de CPU, memória, disco | **Alerta por sintoma e por consumo de SLO** (várias janelas) | Ruído, fadiga, alertas não acionáveis |
| Logs em texto livre, lidos no servidor | **Logs estruturados**, uma linha canônica por requisição | Busca, correlação e custo |
| Agente proprietário por ferramenta | **OpenTelemetry** como padrão de instrumentação | Portabilidade; um só esforço de instrumentação |
| Operações monitora; desenvolvimento entrega | **Dono do serviço** instrumenta, investiga e opera | Contexto perdido na passagem |
| MTTR como meta | Aprendizado com incidentes; tempo até a primeira hipótese; distribuição, não média | MTTR é enganoso (VOID) |
| Alta cardinalidade proibida (custo) | Alta cardinalidade como requisito, com amostragem | Os problemas reais estão nas combinações raras |
| AIOps como caixa-preta que "resolve" | IA como assistente de hipótese, com humano no comando e explicação | Confiança e responsabilidade |
| Observabilidade como projeto de ferramenta | Observabilidade como **capacidade do time** | Ferramenta sem uso é ritual |

## 4. Práticas de referência

| Prática | O que é | Fonte |
|---|---|---|
| Quatro sinais de ouro | Latência, tráfego, erros, saturação por serviço | Google SRE |
| RED e USE | Serviço: taxa, erros, duração. Recurso: utilização, saturação, erros | Wilkie; Gregg |
| SLO + error budget + política | Objetivo por jornada, orçamento de erro e o que acontece quando ele acaba | Google SRE; Hidalgo |
| Alerta por consumo de SLO em múltiplas janelas | Pagina só quando o orçamento está sendo consumido rápido o bastante para importar | SRE Workbook |
| Evento largo / linha canônica | Um registro rico por unidade de trabalho | Stripe; Honeycomb; Amazon |
| Registro por requisição com tempos das dependências | Tempo gasto em cada dependência, tentativas, cache, dentro do mesmo registro | Amazon Builders' Library |
| Rastreamento distribuído com propagação de contexto | Uma requisição acompanhada entre serviços | Dapper (Google); OpenTelemetry |
| Perfis contínuos | Onde o código gasta CPU e memória em produção | OpenTelemetry Profiles (alfa, 2026) |
| Marcadores de deploy e comparação por versão | Ver o efeito de cada mudança; base do canary | Honeycomb; SRE Workbook |
| Painéis por experiência do cliente | Painéis de topo pela jornada, depois pelo serviço | Amazon Builders' Library |
| Revisão de prontidão para produção | Serviço só entra em produção com instrumentação, alertas e runbook | Google SRE |
| Revisão semanal de métricas operacionais | Liderança e times olham tendências juntos, antes de virar incidente | Amazon |
| Revisão de incidente com reconstrução por telemetria | A telemetria reconstrói a linha do tempo; o foco é aprender | Amazon COE; aprendizado com incidentes |
| Governança de custo de telemetria | Amostragem por cauda, retenção por valor, dono do orçamento | Grafana Survey; Honeycomb |

## 5. O que só aparece na cultura

Estes comportamentos distinguem quem tem a ferramenta de quem tem a capacidade:

- qualquer engenheiro do time consegue investigar o próprio serviço em produção,
  com acesso seguro e sem pedir a alguém;
- **novatos investigam** um problema real nas primeiras semanas, acompanhados;
- depois de cada deploy, quem fez a mudança **olha o efeito** sem ninguém pedir;
- a instrumentação é pedida em revisão de código como os testes são;
- o plantão é visto como aprendizado sobre o sistema, e sua carga é acompanhada;
- conversas de prioridade entre produto e engenharia usam o error budget;
- a investigação começa por uma pergunta ("o que mudou para estes usuários?"), não
  por um painel;
- a liderança olha tendências operacionais regularmente, não só durante crises.

## 6. Escada de apropriação revisada — `observability-practice`

| Estágio | Comportamento observado |
|---|---|
| 0 | O problema chega pelo cliente; ninguém consegue reconstruir o que aconteceu |
| 1 | Investigar depende de 1–2 pessoas com acesso; logs baixados de servidor ou pod; ou a ferramenta existe e ninguém além delas a usa (ritual) |
| 2 | Telemetria centralizada; a investigação segue roteiro e painéis prontos; perguntas novas exigem novo código ou ajuda de especialista |
| 3 | O dono do serviço investiga sozinho: vai do sintoma do usuário até a mudança que o causou fazendo perguntas novas; alertas por sintoma e SLO; olha o efeito depois de cada deploy, **também sob pressão** |
| 4 | Instrumentar faz parte de construir; a telemetria orienta decisões de produto, arquitetura e prioridade (error budget); novatos investigam cedo; o time revê alertas, SLOs e custos pelo que aprendeu nos incidentes; o princípio se estende a dados e a modelos de IA |

## 7. Trilha de sofisticação revisada (substitui 12 §3.1)

| Fase | Comportamento no último evento |
|---|---|
| F0 | Descoberto pelo cliente; sem dados para investigar |
| F1 | Leitura manual de logs em servidor ou pod |
| F2 | Logs e métricas centralizados; painéis e busca por texto |
| F3 | Telemetria estruturada e correlacionada (trace + evento rico por requisição) via padrão aberto; do sintoma ao deploy em minutos |
| F4 | Alertas por consumo de SLO; comparação por versão e feature flag; perguntas de alta cardinalidade respondidas em segundos |
| F5 | Remediação automática do que é conhecido; assistência de IA para gerar hipóteses, com explicação e humano no comando; perfis contínuos em produção |

## 8. Sinais (continuação do catálogo)

| # | Sinal | Quem vê | Capacidades (dono **em negrito**) | Hipóteses concorrentes |
|---|---|---|---|---|
| S53 | Ninguém sabe dizer qual é o SLO do serviço principal | Todos | **Confiabilidade** · direção de produto | SLO inexistente · SLO só no papel · sem conversa com produto |
| S54 | Mais de metade dos alertas não gera ação | SRE, dev | **Observabilidade** · bem-estar | alerta por causa, não sintoma · ninguém revê alertas |
| S55 | Depois do deploy, ninguém olha o efeito | Dev | **Release e feedback** · observabilidade | sem marcador de deploy · confiança excessiva no teste · pressão |
| S56 | O novato não consegue investigar nada nos primeiros meses | Novato | **Onboarding** · observabilidade · conhecimento acessível | acesso restrito · telemetria complexa · ninguém ensina |
| S57 | Custo de telemetria cresce sem dono | Plataforma, finanças | **Custo** · observabilidade | retenção padrão para tudo · sem amostragem · sem dono |
| S58 | Cada time usa uma ferramenta de telemetria diferente e não conversam | Plataforma | **Padronização com variedade** · observabilidade | sem padrão aberto · compras descentralizadas |
| S59 | Investigação sempre começa pelo painel, mesmo quando ele não mostra o problema | Dev, SRE | **Observabilidade** (apropriação) | só existem painéis · falta de habilidade de investigação |
| S60 | Incidente revisado sem a linha do tempo reconstruída por dados | SRE, gestão | **Aprendizado** · observabilidade | telemetria insuficiente · revisão por opinião |
| S61 | "Não temos como saber quantos usuários foram afetados" | Produto, suporte | **Observabilidade** · direção de produto | sem instrumentação de negócio · sem identificador de jornada |
| S62 | A liderança só vê métricas operacionais em crise | Direção, gestão | **Liderança** · confiabilidade | sem revisão periódica · métricas não traduzidas para negócio |

## 9. Perguntas de evento (no padrão de 19)

| Perspectiva | Pergunta |
|---|---|
| Engenharia | "Pense no último comportamento estranho do seu serviço em produção. Quem conseguiu descobrir onde estava o problema?" (só uma pessoa específica · eu, com ajuda · eu, sozinho, com as ferramentas do time · qualquer pessoa do time · não observo) |
| Engenharia (aprofundamento) | "Nesse caso, o que foi preciso fazer para responder uma pergunta que nenhum painel mostrava?" (não foi possível · pedir acesso a alguém · escrever e publicar código novo para registrar mais dados · consultar os dados existentes de outro jeito · não precisou) |
| Engenharia (pressão) | "E na última vez que isso aconteceu com prazo apertado ou fora do horário?" (mesmas opções) |
| Início de carreira | "Nos seus primeiros meses aqui, você já tentou investigar um problema em produção? O que aconteceu?" |
| SRE / plataforma | "Dos últimos 10 alertas que acordaram alguém, quantos exigiram uma ação?" (faixas) |
| Produto | "No último problema que afetou clientes, quanto tempo levou para saber quantos e quais clientes foram afetados?" |
| Gestão | "Na última vez que foi preciso escolher entre corrigir confiabilidade ou entregar funcionalidade, o que decidiu?" (a data · a opinião de quem tinha mais poder · um objetivo de confiabilidade combinado antes · não houve escolha explícita) |
| Direção executiva | "Com que frequência você vê como os sistemas se comportaram, fora de um incidente?" |
| Suporte | "No último problema reportado por clientes, quem soube primeiro: o suporte ou a engenharia?" |

## 10. Família causal: "investigação lenta ou concentrada"

| Causa | Sintomas típicos |
|---|---|
| Telemetria sem correlação (silos, sem identificador de requisição) | S59, S61, investigação por acesso direto |
| Acesso restrito sem alternativa segura | concentração em 1–2 pessoas; S56 |
| Habilidade de investigação não difundida | S59, S56 |
| Alertas por causa, não por sintoma | S54 |
| Ausência de SLO e de conversa com produto | S53, S62 |
| Observabilidade vista como ferramenta de outra equipe | S55, S58 |

## 11. Condutas

| Conduta | Mecanismo | Cynefin | Grau | Menor experimento |
|---|---|---|---|---|
| Evento rico por requisição no serviço mais crítico | Contexto num só lugar | Complicado | B | 2 semanas, 1 serviço, via OpenTelemetry |
| SLO por jornada com política de error budget | Confiabilidade vira decisão de produto | Complicado | A–B | 1 jornada, 1 trimestre, revisão quinzenal com produto |
| Alertas por consumo de SLO; poda de alertas sem ação | Menos ruído, mais ação | Claro | B | Revisar os 20 alertas mais disparados; remover ou converter |
| Acesso de leitura seguro para todo o time | Remove a concentração | Complicado | C | Um time, dados sem PII, 30 dias |
| Sessões de investigação em par (treino com incidente real passado) | Difunde a habilidade | Complexo | C | 1 hora quinzenal por 6 semanas |
| Instrumentação na definição de pronto e na revisão de código | Nasce com o código | Claro | C | Checklist na revisão de 1 repositório |
| Revisão semanal de métricas operacionais com liderança | Liderança vê o sistema fora da crise | Complexo | C | 30 minutos semanais por 6 semanas |
| Orçamento e dono do custo de telemetria | Custo decidido por valor | Complicado | C | Amostragem por cauda num serviço de alto volume |

**Grau A–B** para SLO: a prática é consolidada na literatura de SRE e o DORA
associa monitoramento e observabilidade ao desempenho; estudos causais
controlados são raros.

## 12. Exames complementares

| Exame | O que medir |
|---|---|
| Auditoria de alertas | % de alertas com ação no último mês; alertas por plantão |
| Cobertura de telemetria | % de serviços com trace e evento estruturado; propagação de contexto entre serviços |
| SLOs | Quantos existem, por jornada, com política e revisões registradas |
| Custo de telemetria | Custo por serviço e tendência |
| Incidentes | Tempo até a primeira hipótese; quem investigou (quantas pessoas diferentes) |

## 13. Modelo de dossiê para outros temas

Todo dossiê segue as mesmas 12 seções: fontes, filosofia, evolução do
pensamento, práticas, cultura, escada de apropriação, trilha de sofisticação,
sinais, perguntas, família causal, condutas e exames. Fontes de referência
sugeridas para os próximos:

| Dossiê | Fontes de referência |
|---|---|
| Entrega contínua e integração | Humble & Farley; DORA; Google (*Software Engineering at Google*, 2020); trunk-based development (Hammant) |
| Resposta a incidentes e aprendizado | Google SRE; PagerDuty Incident Response; Allspaw; Dekker; LFI; VOID; Amazon COE |
| Confiabilidade e SLO | Google SRE; Hidalgo; Netflix (chaos engineering, Basiri et al., 2016) |
| Plataforma | CNCF; Team Topologies; Spotify (Backstage, *golden paths*); Netflix (*paved road*) |
| Arquitetura e domínio | Evans; Vernon; Ford et al.; Harmel-Law; Amazon (*two-pizza teams*, APIs como contrato, memorando de Bezos de 2002) |
| Qualidade e testes | Google (*Software Engineering at Google*); Beck (TDD); Fowler (pirâmide e testes de contrato) |
| Segurança | OWASP SAMM; BSIMM; Google (BeyondCorp); NIST SSDF; SLSA |
| Dados | Dehghani (data mesh); DAMA; Kleppmann (*Designing Data-Intensive Applications*); contratos de dados |
| Produto | Cagan; Torres; Amazon (*working backwards*, PR/FAQ) |
| Fluxo | Anderson; Vacanti; Reinertsen; Kersten |
| Organização e liderança | Hackman; Edmondson; Larson (*An Elegant Puzzle*, *Staff Engineer*, *Crafting Engineering Strategy*); Google (Aristotle, Oxygen) |
| Escrita e decisão | Amazon (memorandos de 6 páginas); Google (*design docs*); RFCs; ADRs; processo de aconselhamento (Harmel-Law) |
| FinOps e custo | FinOps Foundation; TBM Council |
| IA na engenharia | DORA AI Capabilities; METR; NIST AI RMF |
