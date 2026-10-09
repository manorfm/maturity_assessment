# 13 — Cobertura de referenciais: o que o mapa cobre e o que falta

> Pergunta: o framework fecha as lacunas de práticas e filosofias da área de
> tecnologia (DDD, Team Topologies, Well-Architected, SRE, XP, ágil, governança,
> segurança, TOGAF, modelos operacionais, ISOs, FinOps…)?
>
> **Resposta curta: ainda não.** O núcleo de entrega, engenharia, operação e
> organização está bem coberto em nível de capacidade. Governança corporativa de
> TI, arquitetura corporativa e portfólio de aplicações, gestão de serviços,
> estratégia tecnológica situacional, custo total de TI, conformidade, dados e IA
> ainda têm cobertura baixa. Este documento mostra onde, e o que abrir.

## 1. Regra de uso dos referenciais (mantida)

Referenciais **alimentam capacidades**; não viram pilares nem notas. Um
referencial entra no mapa pela sua **filosofia** (o porquê) traduzida em
**comportamento observável** (o quê), nunca pela adoção nominal. Por isso cada
linha abaixo tem a filosofia, o comportamento e o cuidado com o que ficou datado.

Legenda de cobertura: **Alta** (capacidade com rubrica e perguntas) ·
**Parcial** (capacidade existe, faltam aspectos) · **Baixa** (tema citado, sem
evidência) · **Ausente**.

## 2. Arquitetura, design e nuvem

| Referencial | Filosofia | Comportamento observável | No mapa | Cobertura | Lacuna a abrir | Datado / cuidado |
|---|---|---|---|---|---|---|
| **DDD** (Evans; Vernon) | O modelo do software deve refletir o domínio, com linguagem e limites compartilhados com o negócio | Mudança de regra toca um contexto; termos iguais no negócio e no código; limites evitam coordenação | D5 `domain-alignment` | Parcial | **Mapa de contextos** (relações entre contextos, camada anticorrupção); **classificação de subdomínios** (central, suporte, genérico) ligada a investir, comprar ou terceirizar | Padrões táticos (agregados etc.) não são maturidade; DDD tático em todo lugar é custo |
| Arquitetura evolutiva (Ford, Parsons, Kua) | Arquitetura muda por incrementos guiados por funções de fitness | Critérios arquiteturais verificados automaticamente | D5 `evolvability` | Parcial | Funções de fitness como prática | — |
| **TOGAF 10** e arquitetura corporativa | Alinhar negócio e tecnologia por capacidades de negócio, princípios e roadmaps de transição | Decisões de investimento usam um mapa de capacidades de negócio; portfólio de aplicações conhecido; duplicidades detectadas | D5 `architecture-decisions` (só decisão local) | **Baixa** | **Arquitetura corporativa e portfólio de aplicações** (§6, N1) | Método em cascata e repositório de artefatos como fim. Hoje: arquitetura contínua, leve, perto dos times |
| **Well-Architected** (AWS, Azure, GCP) | Revisão periódica de riscos por workload em 6 pilares, com trade-offs explícitos | Revisões recorrentes; riscos altos tratados com prazo | D5, D7, D8, D9 espalhado | Parcial | **Revisão de arquitetura por risco** como prática; pilar de **sustentabilidade** | **Não existe "nível 5"**: o framework classifica riscos (alto, médio), não níveis |
| Cloud Adoption Framework (AWS CAF, Azure CAF) | Adoção de nuvem é transformação de negócio, pessoas, governança, plataforma, segurança e operação | *Landing zone* governada; capacitação; governança de custo e identidade | D7, D9, D10 | Parcial | Capacitação em nuvem (perspectiva Pessoas) | "Migrar tudo" como meta |
| ISO/IEC 25010:2023 | Qualidade de produto tem características explícitas (desempenho, confiabilidade, segurança, manutenibilidade, flexibilidade, segurança operacional…) | Requisitos de qualidade decididos e verificados | D5 atributos de qualidade; D4 | Parcial | Usar como lista de atributos em `quality-strategy` | — |

## 3. Entrega, operação e serviço

| Referencial | Filosofia | Comportamento observável | No mapa | Cobertura | Lacuna a abrir | Datado / cuidado |
|---|---|---|---|---|---|---|
| **DevOps / DORA** | Fluxo rápido e estável com feedback, sustentado por cultura e capacidades | As 35 capacidades do catálogo | D3, D4, D7, D8, D10 | **Alta** | — | Ranking elite/alto/médio/baixo (substituído por perfis em 2025); 4 métricas → 5 |
| Continuous Delivery (Humble & Farley) | Software sempre liberável; lotes pequenos; automação do caminho | Deploy sob demanda, reversível | D3 | **Alta** | — | — |
| **SRE** (Google) | Confiabilidade é característica de produto, gerida por objetivos (SLO), com toil limitado | SLO com consequência; toil medido; revisão de incidente; plantão sustentável | D8, D7 | Parcial | **Política de error budget com consequência**; **medição de toil**; **revisão de prontidão para produção** | Copiar o SRE do Google sem a escala do Google |
| **ITIL 4 / ISO/IEC 20000** | Gestão de serviço por cadeia de valor, com práticas de incidente, problema, mudança, nível de serviço e suporte | Catálogo de serviços; acordo de nível de serviço com o negócio; problema tratado na causa; suporte alimenta produto | D8 parcial | **Baixa** | **Gestão de serviço** (§6, N2) | CAB central para tudo (o próprio ITIL 4 migrou para *change enablement* com autoridade por risco) |
| Chaos engineering | Confiança vem de experimentar falhas controladas | Experimentos de falha regulares | D8 `reliability-practice` | Parcial | — | Chaos sem observabilidade e sem SLO |
| Platform engineering (CNCF) | Plataforma como produto interno, com autosserviço e guardrails | Caminho pavimentado adotado por escolha | D7 | **Alta** | Modelo de interação com times (Team Topologies) | Plataforma como fila de tickets |
| **FinOps** | Custo é responsabilidade de quem gasta; decisão por valor de negócio | Time vê e decide sobre o próprio custo; unit economics | D7 `cloud-efficiency` | Parcial | **Cultura FinOps** (engenharia decide com custo) | Relatório mensal centralizado |
| **TBM** (Technology Business Management) | Custo total de TI (não só nuvem) transparente e ligado a serviços e capacidades de negócio | Custo por serviço e por capacidade; *showback* | — | **Ausente** | **Custo total de tecnologia** (§6, N3) | Rateio arbitrário |
| Green software (SCI, ISO/IEC 21031:2024) | Emissão por unidade funcional é atributo de qualidade | Carbono estimado por transação | D7 sustentabilidade | Baixa | Anexar a `cloud-efficiency` | — |

## 4. Engenharia, produto, fluxo e método

| Referencial | Filosofia | Comportamento observável | No mapa | Cobertura | Lacuna a abrir | Datado / cuidado |
|---|---|---|---|---|---|---|
| **XP** (Beck) | Valores (comunicação, simplicidade, feedback, coragem, respeito) aplicados em práticas técnicas | TDD, refatoração contínua, integração contínua, design simples, posse coletiva do código, ritmo sustentável, trabalho em par ou em grupo | D4, D3, D11 | Parcial | **Construção colaborativa** (par, grupo) como mecanismo de qualidade e difusão; **posse coletiva do código** | Par obrigatório como regra; o valor é o feedback e a difusão, não o formato |
| Manifesto ágil, Scrum Guide 2020, Kanban Method | Empirismo, times auto-gerenciáveis, fluxo, melhoria evolutiva | Inspeção e adaptação com consequência; políticas explícitas | D3, D10 método | Parcial (Alta em fluxo) | Rubrica de cerimônias com efeito `[rubrica]` | Scrum Master necessário para o rito; velocity como produtividade |
| **Lean / TPS**, Value Stream Management, Flow Framework (Kersten) | Enxergar o fluxo de valor ponta a ponta e remover desperdício | Fluxo ideia → valor medido; distribuição entre funcionalidades, defeitos, riscos e dívida | D3, D1 | Parcial | **Distribuição do fluxo** (quanto vai para funcionalidade × defeito × risco × dívida) no portfólio | Lean como corte de custo |
| Teoria das Restrições | O sistema anda na velocidade do gargalo | Gargalo conhecido e protegido | 08 (tratamento) | Alta como método | — | — |
| **Modelo operacional de produto** (Cagan, *Transformed* 2024; Torres) | Times empoderados resolvem problemas com resultado, não entregam listas | Trio de produto; roadmap por resultado; discovery contínua | D2, D1 | Parcial | Times de produto × times de funcionalidade como leitura explícita | "Product owner" como anotador de requisitos |
| Lean Startup, JTBD, design thinking | Reduzir incerteza com experimentos baratos e entendimento do problema | Hipótese explícita; experimento com critério prévio | D2 | Parcial | — | Rito de "design sprint" sem decisão |
| Escala (SAFe, LeSS, Nexus) | Coordenar muitos times | Custo de coordenação; dependências | D10 | Baixa | Observar **custo de coordenação**, não o framework | Adoção de framework de escala como sinal de maturidade |
| Modelo Spotify | — | — | — | — | — | **Datado**: a própria Spotify diz que nunca funcionou como no vídeo; copiar a estrutura é antipadrão |
| Beyond Budgeting | Metas relativas e financiamento dinâmico no lugar do orçamento anual fixo | Realocação de recursos durante o ano por evidência | D1 financiamento `[anexar]` | Baixa | Anexar a `portfolio-management` | — |
| OKR | Alinhar por resultados com autonomia no como | Key results de resultado; negociação nos dois sentidos | D12 | Parcial | Rubricas de D12 `[rubrica]` | OKR cascateado e ligado a bônus |

## 5. Organização, governança, segurança, dados e IA

| Referencial | Filosofia | Comportamento observável | No mapa | Cobertura | Lacuna a abrir | Datado / cuidado |
|---|---|---|---|---|---|---|
| **Team Topologies** (2ª ed., 2025) | Desenhar times para fluxo rápido, respeitando carga cognitiva; 4 tipos de time e 3 modos de interação | Interações com propósito e prazo; times de habilitação; API do time | D10 | Parcial | **Modos de interação** (colaboração temporária, como-serviço, facilitação) e **times de habilitação** | Renomear times sem mudar interação |
| Sistemas sociotécnicos (Trist; princípios de Cherns) | Otimizar o técnico e o social juntos; **especificação crítica mínima** | Regras só onde necessárias; autonomia no resto | D10 | Baixa (teoria) | Base do tema "padrão × caixa" (14) | — |
| Modelo do Sistema Viável (Beer) | Autonomia recursiva com coordenação mínima | Unidades autônomas com canais de coordenação e auditoria claros | D10 | Baixa | Lente para desenho organizacional | — |
| **Modelos operacionais** (canvas de Campbell; produto × projeto; plataforma × serviços compartilhados × centro de excelência) | Estrutura, financiamento, governança, fluxo e pessoas precisam ser coerentes entre si | Financiamento, estrutura e governança apontam para o mesmo modelo | — | **Ausente** | **Coerência do modelo operacional** (§6, N4) | "Target operating model" desenhado em slides e nunca vivido |
| **COBIT 2019** | Governança (avaliar, direcionar, monitorar) separada de gestão; objetivos com níveis de capacidade; **fatores de desenho** ajustam ao contexto | Direção define apetite a risco e prioridades de TI; objetivos com dono | D12, D10 | **Baixa** | **Governança corporativa de TI** (§6, N5) | COBIT como checklist de auditoria |
| **ISO/IEC 38500** | O conselho e a direção são responsáveis pelo uso de TI: responsabilidade, estratégia, aquisição, desempenho, conformidade, comportamento humano | Direção avalia, direciona e monitora TI; TI na mesa da estratégia | D12 | **Baixa** | Parte de N5 | — |
| ISO 31000 | Risco gerido com apetite explícito e integrado à decisão | Apetite a risco declarado e usado | D9, D12 | Baixa | Apetite a risco em N5 | Matriz de risco sem decisão |
| **NIST CSF 2.0** | Governar, identificar, proteger, detectar, responder, recuperar | Estratégia de risco cibernético; detecção e resposta exercitadas | D9 | Parcial | Função **Governar** em N5; detecção e resposta `[rubrica]` | Níveis (*tiers*) como meta |
| ISO/IEC 27001:2022 | Sistema de gestão de segurança que melhora continuamente | Riscos tratados; auditoria alimenta melhoria | D9 | Baixa | Controles com efeito, não certificado | Certificação como prova de maturidade (P1) |
| OWASP SAMM 2, BSIMM | Maturidade de segurança de software por prática; BSIMM descreve o que empresas reais fazem | Atividades de segurança no ciclo de desenvolvimento | D9 `software-security` | Parcial | Usar como trilha de sofisticação (12 §3.7) | — |
| SLSA, NIST SSDF, Zero Trust (SP 800-207) | Integridade da cadeia de software; não confiar pela rede | Proveniência de artefatos; acesso por identidade e contexto | D4, D9 | Parcial | — | Perímetro como defesa |
| LGPD, ISO/IEC 27701 | Privacidade por finalidade, minimização e direitos do titular | Finalidade e retenção decididas no desenho | D9 `[rubrica]` | Baixa | Rubrica de privacidade | — |
| ISO 22301 | Continuidade de negócio exercitada | Plano testado | D9 `[anexar]` | Baixa | Anexar a `cloud-reliability` | Plano no papel |
| **DAMA-DMBOK**, DCAM, data mesh | Dado é ativo com dono, qualidade e governança; data mesh: domínio, produto, plataforma, governança federada | Dono do significado; contratos; qualidade monitorada | D6 | Parcial/Baixa | Rubricas de D6 `[rubrica]` | Data lake central como solução para tudo |
| **NIST AI RMF** (+ perfil de IA generativa, 2024), **ISO/IEC 42001:2023**, EU AI Act | IA governada por risco: mapear, medir, gerir; sistema de gestão de IA | Inventário de usos; avaliação antes e depois; supervisão humana | D6, D12 | **Baixa** | `[pesquisa]` de IA (03 §4) | Política de IA só como proibição |
| **Wardley Mapping** | Estratégia situacional: componentes evoluem de gênese a commodity; o que era diferencial vira commodity | Decisões de construir, comprar ou terceirizar pela evolução do componente; inércia reconhecida | — | **Ausente** | **Estratégia tecnológica situacional** (§6, N6) | — |
| Inner source | Práticas de código aberto dentro da empresa para reuso entre áreas | Contribuição entre times em componentes compartilhados | — | Ausente | Parte de 14 (reuso e duplicidade) | — |
| Gestão do conhecimento (Nonaka; comunidades de prática) | Conhecimento tácito vira explícito e volta a ser prática | Comunidades com efeito; decisões recuperáveis | D12 | Parcial | — | Wiki como fim |
| ISO/IEC 33000 (SPICE), CMMI 3.0 | Avaliação de processo por níveis de capacidade | — | Metodologia | — | Lições para o método (§7) | Nível como certificado |
| WCAG 2.2 | Acessível para todas as pessoas | Acessibilidade decidida no desenho, testada | D2 `[pesquisa]` | Baixa | Pode virar `[rubrica]` com WCAG como referência de efeito | Checklist no fim |

## 6. Capacidades novas propostas

| # | Capacidade | Domínio | Por que | Marca |
|---|---|---|---|---|
| N1 | **Arquitetura corporativa e portfólio de aplicações**: capacidades de negócio mapeadas, portfólio conhecido, duplicidades detectadas e racionalizadas | D5 (novo pilar) | TOGAF, TBM; cenário "áreas fazendo a mesma coisa" (14) | `[rubrica]` |
| N2 | **Gestão de serviço**: catálogo, nível de serviço acordado com o negócio, gestão de problemas, suporte como fonte de feedback | D8 (novo pilar) | ITIL 4, ISO/IEC 20000, SRE | `[rubrica]` |
| N3 | **Custo total de tecnologia**: custo por serviço e capacidade, *showback*, custo operacional visível | D1 + D7 | TBM, FinOps; cenário "custo operacional alto" | `[rubrica]` |
| N4 | **Coerência do modelo operacional**: financiamento, estrutura, governança, fluxo e pessoas apontam para o mesmo modelo | D10 | Modelos operacionais; produto × projeto | `[pesquisa]` |
| N5 | **Governança corporativa de TI**: direção avalia, direciona e monitora; apetite a risco; TI na estratégia; subordinação | D12 | COBIT 2019, ISO/IEC 38500, NIST CSF Governar, ISO 31000 | `[rubrica]` |
| N6 | **Estratégia tecnológica situacional**: construir, comprar ou terceirizar pela evolução do componente; revisão de premissas que expiraram | D1 | Wardley; DDD (subdomínios) | `[rubrica]` |
| N7 | **Padronização com variedade** e **reuso entre áreas** | D10 + D7 | Cenário "padrão como caixa" (14) | `[rubrica]` |
| N8 | **Construção colaborativa e posse coletiva** | D4 | XP | `[anexar: technical-capability]` |
| N9 | **Modos de interação entre times** | D10 | Team Topologies | `[anexar: collaboration]` |
| N10 | **Política de error budget, toil e prontidão para produção** | D8 | SRE | `[anexar: reliability-practice]` |
| N11 | **Distribuição do fluxo** (funcionalidade, defeito, risco, dívida) | D1 | Flow Framework | `[anexar: portfolio-management]` |
| N12 | **Revisão de arquitetura por risco** | D5 | Well-Architected | `[anexar: architecture-decisions]` |

## 7. Lições de método que os referenciais trazem

| Referencial | Lição para o produto |
|---|---|
| COBIT 2019 (fatores de desenho) | Confirma P6: o alvo depende do contexto. Os fatores de desenho do COBIT (estratégia, porte, risco, papel de TI, sourcing) são uma boa lista para o contexto de 02 |
| BSIMM | Maturidade **descritiva**: registrar o que empresas reais fazem, não só o que um modelo prescreve. Com dados de muitas avaliações, o produto pode publicar "o que organizações parecidas fazem" |
| ISO/IEC 33000 | Exige avaliador competente e evidência objetiva. Reforça a revisão humana dos achados antes da publicação em projetos com consultoria |
| Well-Architected | Achados como **riscos** com prioridade (alto, médio), não como notas. Alinha com o relatório por achados |
| CMMI | Níveis de processo sem efeito viram certificação. Reforça P1 |

## 8. Resumo da cobertura

| Cobertura | Referenciais |
|---|---|
| Alta | DevOps/DORA, Continuous Delivery, platform engineering, Teoria das Restrições |
| Parcial | DDD, arquitetura evolutiva, Well-Architected, CAF, ISO 25010, SRE, chaos, FinOps, XP, ágil/Scrum/Kanban, Lean/VSM, modelo de produto, Lean Startup, OKR, Team Topologies, NIST CSF, SAMM/BSIMM, SLSA/Zero Trust, DAMA/data mesh, gestão do conhecimento |
| Baixa | TOGAF/EA, ITIL/20000, green software, escala, Beyond Budgeting, sociotécnico, VSM de Beer, COBIT, 38500, 31000, 27001, LGPD/27701, 22301, IA (RMF/42001/AI Act), WCAG |
| Ausente | TBM, modelos operacionais, Wardley, inner source |

As 12 capacidades novas (§6) levam a maior parte dos referenciais de "Baixa" para
"Parcial". Chegar a "Alta" exige autoria e validação (09), não mais pesquisa de
escopo.
