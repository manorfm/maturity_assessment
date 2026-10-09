# 24 — Dossiê: rede em nuvem, comunicação entre serviços e segurança de infraestrutura

> Pergunta: o framework abrange redes (nuvem), segurança, service mesh?
>
> **Até a v0.9, não.** A v0.2 tinha "serviços de base e rede" e "isolamento e
> segmentação", mas o tema se perdeu quando o mapa foi condensado. Segurança
> estava coberta no ciclo de desenvolvimento e na identidade, não na rede, na
> postura de nuvem nem na detecção. Service mesh não aparecia. Este dossiê fecha
> essas lacunas no formato de 18 §13 e as reintegra ao mapa (§12).

## 1. Fontes

| Fonte | Contribuição |
|---|---|
| Google — **BeyondCorp** (2014) e **BeyondProd** (2019) | Acesso sem perímetro confiável; em microsserviços: identidade de serviço, mTLS, autorização entre serviços, código verificado antes de rodar |
| NIST SP 800-207 (2020) | Arquitetura Zero Trust: nenhuma confiança implícita pela localização na rede |
| CISA — **Zero Trust Maturity Model v2** (2023) | Cinco pilares (identidade, dispositivos, redes, aplicações e cargas, dados) e três transversais (visibilidade e análise, automação e orquestração, governança); estágios **Tradicional → Inicial → Avançado → Ótimo** |
| AWS, Azure, GCP — Well-Architected (confiabilidade, segurança) e *landing zones* / Cloud Adoption Framework | Desenho de rede por conta ou projeto, segmentação, conectividade privada e híbrida, controles preventivos |
| Modelo de responsabilidade compartilhada (provedores de nuvem) | O que é do provedor e o que é do cliente em cada serviço |
| CIS Benchmarks; CSA Cloud Controls Matrix; MITRE ATT&CK (matriz de nuvem) | Configuração segura de referência; controles; técnicas reais de ataque |
| Envoy (Lyft), Istio, Linkerd, Cilium; Kubernetes **Gateway API** (v1.0, 2023); modo *ambient* do Istio (GA em 2024) | Service mesh e evolução para modelos sem sidecar; API padrão para tráfego de entrada e entre serviços |
| Nygard, *Release It!* (2ª ed., 2018); Brooker, "Timeouts, retries and backoff with jitter" (Amazon Builders' Library) | Padrões de estabilidade: timeout, retry com backoff e jitter, circuit breaker, bulkhead |
| Newman, *Building Microservices* (2ª ed., 2021) | Quando service mesh ajuda e quando é complexidade antecipada |

## 2. Filosofia

1. **A identidade é o novo perímetro.** Estar "dentro da rede" não prova nada.
   Cada chamada, de pessoa ou de serviço, é autenticada, autorizada e registrada
   (BeyondCorp, BeyondProd, NIST 800-207).
2. **Assuma a violação.** Desenhe como se um componente já estivesse comprometido:
   segmentação, menor privilégio e detecção limitam o estrago.
3. **Seguro por padrão, no caminho pavimentado.** O jeito mais fácil de criar uma
   rede, um serviço ou uma permissão já é o seguro. Segurança que depende de cada
   time lembrar falha.
4. **Rede é código.** Topologia, regras e políticas são versionadas, revisadas e
   verificadas automaticamente, como qualquer software.
5. **A rede falha, sempre.** Toda chamada remota pode ficar lenta, falhar ou
   duplicar. Resiliência de chamada (timeout, retry com jitter, circuit breaker,
   idempotência) é responsabilidade do desenho, não do acaso (Nygard, Brooker).
6. **Preocupações transversais saem do código de negócio**, quando a escala
   justifica: mTLS, retries e roteamento podem ir para a plataforma (mesh,
   gateway). Mas **complexidade tem custo**; mesh em poucos serviços costuma ser
   antecipação (Newman).
7. **Responsabilidade compartilhada é explícita.** Cada time sabe o que é dele,
   da plataforma e do provedor.

## 3. Como o pensamento evoluiu (o que expirou)

| Antes | Hoje | Por que mudou |
|---|---|---|
| Perímetro: dentro da rede é confiável (VPN, firewall de borda) | Zero Trust: identidade e contexto a cada acesso | Ataques laterais; nuvem e trabalho remoto dissolveram o perímetro |
| Regras de firewall por IP abertas por ticket | Políticas por identidade de serviço, como código | IPs efêmeros em nuvem e contêineres |
| Rede configurada no console | Rede como código com verificação automática | Drift, erro humano, auditoria |
| Cada serviço implementa retry do seu jeito (ou não implementa) | Padrão da plataforma ou biblioteca com timeout, backoff e jitter | Tempestades de retry derrubam sistemas inteiros |
| Service mesh com sidecar em tudo | Mesh só quando a escala pede; modelos sem sidecar (*ambient*, eBPF) | Custo de recursos e de operação |
| Ingress específico de cada controlador | Gateway API padronizada | Portabilidade e separação de papéis |
| Segurança de nuvem como auditoria periódica | Postura avaliada continuamente e corrigida no caminho | Mudança contínua de infraestrutura |
| Credencial de longa duração em arquivo | Identidade de carga de trabalho com credencial temporária | Vazamento de segredos é causa comum de incidente |

## 4. Práticas de referência

| Prática | O que é |
|---|---|
| *Landing zone* e rede por conta ou projeto | Estrutura inicial de contas, rede, identidade e controles preventivos |
| Planejamento de endereços (IPAM) | Evitar sobreposição que impede conectar ambientes depois |
| Segmentação e microssegmentação | Limitar quem fala com quem; políticas por serviço (ex.: NetworkPolicy) |
| Conectividade privada e híbrida | Serviços consumidos sem passar pela internet; ligação com data center |
| Controle de saída (egress) | Saber e limitar para onde os serviços falam |
| DNS e certificados gerenciados | Renovação automática; certificados vencidos são causa clássica de incidente |
| Rede como código + verificação de alcance | Mudança revisada; análise automática de "quem alcança quem" |
| Identidade de serviço e mTLS | Cada serviço tem identidade verificável; tráfego cifrado e autenticado |
| Gateway de API e Gateway API | Entrada padronizada, autenticação, limites de taxa |
| Resiliência de chamada | Timeout, retry com backoff e jitter, circuit breaker, bulkhead, idempotência |
| Service mesh (quando justificado) | mTLS, políticas, roteamento e telemetria fora do código |
| Postura de segurança contínua (CSPM/CNAPP) | Configurações de nuvem avaliadas continuamente contra referência |
| Menor privilégio automatizado | Permissões derivadas do uso real; revisão periódica automática |
| Detecção e resposta em nuvem | Registros de auditoria centralizados, detecções baseadas em técnicas reais (ATT&CK), resposta exercitada |

## 5. O que só aparece na cultura

- times criam rede, serviço e permissão **sozinhos pelo caminho pavimentado**, e o
  resultado já nasce seguro;
- uma regra de firewall ou permissão ampla **é vista como dívida**, com dono e
  prazo;
- quem opera o serviço sabe o timeout e o comportamento de retry das
  dependências dele;
- achados de postura são corrigidos pelo time dono, não por uma equipe central
  que "fecha tickets";
- exercícios de resposta a incidente de segurança acontecem antes do incidente.

## 6. Escadas de apropriação

### 6.1 Rede e conectividade — N13 `[rubrica]` → D7

| Estágio | Comportamento |
|---|---|
| 0 | Ninguém sabe desenhar a rede atual; mudanças por tentativa e erro |
| 1 | Uma ou duas pessoas mudam a rede à mão; pedidos por ticket levam dias; ambientes não se conectam por sobreposição de endereços |
| 2 | Rede padronizada e parcialmente como código; mudanças revisadas, mas lentas e centralizadas |
| 3 | Rede como código com verificação automática; times obtêm conectividade pelo caminho pavimentado em horas; segmentação por padrão, **também sob pressão** |
| 4 | Topologia evolui por evidência (custo, latência, incidentes); conectividade por intenção ("este serviço fala com aquele"), verificada continuamente |

### 6.2 Comunicação entre serviços e resiliência de chamada — N14 `[anexar: reliability-practice]` → D8 / D5

| Estágio | Comportamento |
|---|---|
| 0 | Endereços fixos no código; sem timeout; a falha de uma dependência derruba tudo |
| 1 | Cada time trata do seu jeito; retry sem backoff causou incidente; ou há mesh instalado que ninguém entende (ritual) |
| 2 | Biblioteca ou padrão com timeout e retry; circuit breaker em parte dos serviços |
| 3 | Resiliência de chamada é padrão da plataforma; timeouts ajustados por SLO; degradação planejada; testada (chaos, 22) |
| 4 | Políticas de tráfego usadas para liberar com segurança (exposição progressiva) e para isolar falhas; aprendizado de incidentes muda os padrões |

### 6.3 Segurança de rede e Zero Trust — N15 `[rubrica]` → D9

| Estágio | Comportamento |
|---|---|
| 0 | Confiança pela rede; ninguém sabe o que está exposto |
| 1 | Firewall de borda e VPN; exceções abertas por ticket e nunca fechadas; revisão só em auditoria |
| 2 | Segmentação definida; identidade forte para pessoas; permissões revisadas periodicamente |
| 3 | Identidade para serviços (mTLS), políticas como código, menor privilégio aplicado, postura avaliada continuamente e corrigida pelo time dono |
| 4 | Acesso decidido por identidade e contexto a cada chamada; privilégio ajustado automaticamente ao uso; detecção e resposta exercitadas e alimentando o desenho |

### 6.4 Detecção e resposta em nuvem — `[rubrica]` existente → D9

| Estágio | Comportamento |
|---|---|
| 0 | Sem registros de auditoria centralizados |
| 1 | Registros existem; ninguém olha até um incidente |
| 2 | Alertas de segurança padrão do provedor; triagem por uma pessoa |
| 3 | Detecções mapeadas a técnicas reais, com dono e playbook; exercícios periódicos |
| 4 | Caça a ameaças; detecções geradas a partir de incidentes e exercícios; tempo até conter medido e reduzido |

## 7. Trilhas de sofisticação

### 7.1 Rede

| Fase | Comportamento |
|---|---|
| F0 | Configuração manual sem registro |
| F1 | Console e scripts soltos |
| F2 | Parte como código; *landing zone* definida |
| F3 | Toda a rede como código, revisada, com verificação automática de alcance |
| F4 | Conectividade de autosserviço com guardrails; IPAM automatizado |
| F5 | Conectividade por intenção, verificada continuamente, com correção automática de desvio |

### 7.2 Comunicação entre serviços

| Fase | Comportamento |
|---|---|
| F0 | Chamadas diretas sem timeout |
| F1 | Tratamento ad hoc por time |
| F2 | Biblioteca padrão de resiliência |
| F3 | Plataforma aplica mTLS, timeouts, retries e telemetria (gateway, mesh ou biblioteca gerenciada) |
| F4 | Roteamento de tráfego para exposição progressiva e isolamento de falha, ligado a SLO |
| F5 | Políticas ajustadas automaticamente por comportamento observado; experimentos de falha contínuos |

### 7.3 Zero Trust (correspondência com a CISA)

| Fase | CISA ZTMM | Comportamento |
|---|---|---|
| F0–F1 | Tradicional | Perímetro, configuração manual, confiança implícita |
| F2 | Inicial | Primeiros controles por identidade; automação parcial |
| F3–F4 | Avançado | Controles por identidade em todos os pilares; políticas centralizadas; visibilidade integrada |
| F5 | Ótimo | Acesso dinâmico por risco, automatizado, com análise contínua |

## 8. Prontidão para service mesh (22)

Service mesh é uma **prática avançada** frequentemente adotada cedo demais.

| Tipo | Pré-requisito | Mínimo |
|---|---|---|
| Essencial | Orquestração de contêineres estável | `reproducible-infrastructure` ≥ 3 |
| Essencial | Observabilidade (o mesh gera telemetria que alguém precisa ler) | Estágio 2 e F3 |
| Essencial | Plataforma com dono e capacidade para operar o mesh | `platform-autonomy` ≥ 2 |
| Essencial | Necessidade real: muitos serviços com preocupações transversais repetidas | Contexto (número de serviços, exigência de mTLS) |
| Conforto | Identidade de serviço | `cloud-security` ≥ 2 |
| Conforto | Resiliência de chamada já entendida pelos times | N14 ≥ 2 |

**Adoção prematura:** mesh em poucos serviços; mesh instalado para "ter mTLS" sem
identidade de serviço gerida; incidentes causados pela própria camada de mesh que
ninguém sabe investigar.

## 9. Sinais (continuação do catálogo)

| # | Sinal | Quem vê | Capacidades (dono **em negrito**) | Hipóteses concorrentes |
|---|---|---|---|---|
| S63 | Abrir uma regra de rede ou firewall leva dias, por ticket | Engenharia | **Rede** · governança · autonomia de plataforma | rede fora do código · aprovação centralizada · falta de guardrail |
| S64 | Ambientes que não se conectam por sobreposição de endereços | Plataforma | **Rede** (IPAM) | ausência de planejamento de endereços |
| S65 | Regras "temporárias" abertas há meses | Segurança | **Segurança de rede** · governança | exceção sem prazo · ninguém revisa |
| S66 | Incidente causado por tempestade de retry ou timeout ausente | SRE | **Comunicação entre serviços** · confiabilidade | sem padrão de resiliência · sem chaos |
| S67 | Certificado vencido derrubou algo | SRE | **Rede** (certificados) · confiabilidade | renovação manual · sem dono |
| S68 | Mesh instalado que só uma pessoa entende | Plataforma | **Plataforma** · adoção prematura | necessidade antecipada · falta de capacidade |
| S69 | Credenciais de longa duração em arquivos ou variáveis | Segurança, dev | **Identidade e segredos** | sem identidade de carga · pressa |
| S70 | Achados de postura de nuvem acumulam sem dono | Segurança | **Postura de segurança** · ownership | fila central · achado sem contexto |
| S71 | Ninguém sabe para onde os serviços falam na internet | Segurança, plataforma | **Segurança de rede** (egress) · observabilidade | sem controle de saída |
| S72 | Nunca houve exercício de incidente de segurança | Segurança, direção | **Detecção e resposta** · aprendizado | segurança vista como auditoria |

## 10. Perguntas de evento

| Perspectiva | Pergunta |
|---|---|
| Engenharia | "Na última vez que seu serviço precisou falar com um sistema novo, quanto tempo levou até funcionar, e o que foi preciso fazer?" (horas, por conta própria · dias, com ticket · semanas · não sei como aconteceu · não observo) |
| Engenharia (resiliência) | "Na última vez que uma dependência do seu serviço ficou lenta, o que aconteceu com o seu serviço?" (caiu junto · ficou lento junto · degradou parte das funções · continuou normal · não observo) |
| Plataforma | "Na última mudança de rede, como ela foi feita e verificada?" |
| Segurança | "Na última vez que uma permissão ou regra ampla foi concedida como exceção, o que aconteceu com ela depois?" (continua lá · foi revista quando alguém lembrou · tinha prazo e foi fechada · não existem exceções assim) |
| Segurança (detecção) | "No último alerta de segurança relevante, quanto tempo levou para alguém saber se era real?" |
| Direção | "Quando foi a última vez que a organização ensaiou um incidente de segurança?" |

## 11. Condutas

| Conduta | Mecanismo | Cynefin | Grau | Menor experimento |
|---|---|---|---|---|
| Rede como código com verificação de alcance | Mudança revisada e verificável | Complicado | B | Um ambiente migrado para código; verificação no pipeline |
| Conectividade por autosserviço com guardrails | Remove a fila de tickets | Complicado | B | Módulo pavimentado para o caso mais pedido |
| Biblioteca ou plataforma de resiliência de chamada | Timeout, retry com jitter e circuit breaker por padrão | Claro | A–B (Nygard; Brooker) | Aplicar aos 5 serviços mais críticos |
| Identidade de carga com credencial temporária | Elimina segredos de longa duração | Complicado | B | Um serviço sem credencial em arquivo |
| Exceções de rede com prazo | Exceção vira dívida visível | Claro | C | Inventário das regras amplas; prazo em todas as novas |
| Postura de nuvem corrigida pelo time dono | Achado vai para quem pode corrigir, no fluxo | Complicado | B | Achados de 1 conta roteados para os times donos |
| Exercício de incidente de segurança | Resposta ensaiada | Complexo | B | Exercício de mesa semestral com direção |
| Service mesh só com prontidão (§8) | Evita complexidade antecipada | Complicado | C | Avaliar prontidão antes de qualquer piloto |

## 12. Integração ao mapa

| Capacidade | Domínio | Marca |
|---|---|---|
| N13 Rede e conectividade em nuvem (topologia, IPAM, segmentação, conectividade privada e híbrida, DNS e certificados, rede como código) | D7 | `[rubrica]` |
| N14 Comunicação entre serviços e resiliência de chamada (gateway, mesh, timeouts, retries, idempotência) | D8 / D5 | `[anexar: reliability-practice]` |
| N15 Segurança de rede e Zero Trust (identidade de serviço, microssegmentação, egress, menor privilégio automatizado) | D9 | `[rubrica]` |
| N16 Postura de segurança de nuvem contínua | D9 | `[anexar: cloud-security]` |
| Detecção e resposta a ameaças (existente) | D9 | `[rubrica]`, agora com escada (§6.4) |

Arestas novas no grafo de habilitação (23):

| De (mínimo) | Habilita | Tipo | Comportamento-chave |
|---|---|---|---|
| Infraestrutura reproduzível ≥ 3 | Rede como código (N13) 2→3 | Técnico | Mudar infraestrutura só por código |
| Identidade de máquina (`cloud-security`) ≥ 2 | Zero Trust (N15) 2→3 | Técnico | Cada serviço com identidade própria |
| Observabilidade ≥ 2 | Comunicação entre serviços (N14) 2→3 | Técnico | Ver latência e erro por dependência |
| Ownership ponta a ponta ≥ 2 | Postura de segurança (N16) 1→2 | Estrutural | O time dono corrige o próprio achado |
| Resposta a incidentes ≥ 2 | Detecção e resposta 2→3 | Técnico | Resposta ensaiada |

## 13. Outros temas de infraestrutura: situação

| Tema | Situação no mapa |
|---|---|
| Computação e contêineres; orquestração | Parcial (infraestrutura reproduzível, plataforma) |
| Rede, DNS, certificados | **Coberto a partir desta versão** (N13) |
| CDN e borda | Baixa; entra em N13 |
| **Bancos de dados**: operação, backup, **mudança de esquema** (capacidade do DORA) | Parcial (recuperação); mudança de esquema sem escada → candidato a próximo dossiê |
| Mensageria e eventos | Parcial (integração, idempotência) |
| Armazenamento e ciclo de vida de dados | Parcial (D6) |
| Identidade e segredos | Coberto (`cloud-security`) |
| Custos de infraestrutura | Coberto (FinOps, N3) |
