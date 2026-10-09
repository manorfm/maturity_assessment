# 14 — Padronização × variedade: quando "padrão" vira caixa

> Cenário trazido na discussão: a organização fala em "padrão", mas não no sentido
> de plataforma que habilita, e sim no de **encaixotar**. Isso reduz as soluções
> possíveis, dificulta ouvir ideias diferentes e convive, paradoxalmente, com
> **áreas diferentes fazendo a mesma coisa** e **custo operacional alto**. Este
> documento aprofunda o cenário até filosofia, práticas, sinais, perguntas e
> condutas, e serve de modelo para aprofundar outros cenários (§9).

## 1. O paradoxo

Excesso de padrão e falta de padrão costumam coexistir na mesma empresa:

- **padrão onde não precisava** (a escolha de linguagem, de arquitetura, do
  formato de documento, do framework de front), que impede soluções adequadas; e
- **falta de padrão onde precisava** (identidade, observabilidade, pipeline,
  dados de cliente), que gera duplicidade, incompatibilidade e custo.

A causa comum é que o padrão foi decidido por **controle**, não por **valor**:
padroniza-se o que é visível e fácil de fiscalizar, e não o que é commodity e
barato de compartilhar.

## 2. Tipologia

| Tipo | Como é | Quem decide e por quê | Efeito |
|---|---|---|---|
| **Padrão habilitador** (caminho pavimentado) | Caminho mais fácil para o caso comum; opcional; com suporte e saída documentada | Quem usa participa; decisão por valor e evidência | Menos carga cognitiva; variedade onde importa |
| **Padrão-caixa** (coercitivo) | Obrigatório para todos os casos; exceção difícil ou punida; sem data de revisão | Centro decide por controle, medo ou conveniência | Solução inadequada, contornos, silêncio, perda de talento |
| **Ausência de padrão** (fragmentação) | Cada time escolhe tudo, inclusive o que é commodity | Ninguém | Duplicidade, integração cara, segurança desigual |
| **Duplicação estrutural** | Áreas diferentes constroem a mesma capacidade | Silos de estrutura e orçamento | Custo operacional alto, dados inconsistentes |
| **Padrão expirado** | Fazia sentido antes; o contexto mudou | Inércia | Custo sem benefício; "sempre foi assim" |

## 3. Filosofia e fundamentos

| Ideia | Fonte | O que diz para este cenário |
|---|---|---|
| **Burocracia habilitadora × coercitiva** | Adler & Borys (1996) | Regras formais podem ajudar quem trabalha (habilitadoras: transparentes, flexíveis, com reparo local) ou controlá-lo (coercitivas). A diferença não é ter regra, é **como a regra foi desenhada e para quem** |
| **Trabalho padronizado do Sistema Toyota** | Ohno; Liker | "Onde não há padrão, não há melhoria", mas o padrão é **de quem faz o trabalho**, é a linha de base para melhorar e muda com frequência. Padrão congelado não é padrão Toyota |
| **Variedade requisitada** | Ashby (1956) | Um sistema de controle precisa de tanta variedade quanto o ambiente que controla. Um único padrão para problemas diversos falha por construção |
| **Especificação crítica mínima** | Cherns (1976) | Especifique só o que é essencial; deixe o resto para quem faz |
| **Exploração × explotação**; armadilha de competência | March (1991); Levitt & March (1988) | Otimizar só o que já se sabe fazer (explotação) mata a exploração; a organização fica boa no que não importa mais |
| **Evolução de componentes** | Wardley | Padronize e compre o que é commodity; explore o que é gênese ou diferencial. Padrão em componente diferencial mata a inovação; ausência de padrão em commodity gera desperdício |
| **Subdomínios** | Evans (DDD) | Central (investir, variedade), suporte (padrão simples), genérico (comprar ou padronizar) |
| **Caminho pavimentado, não gaiola** | Netflix (*paved road*); Spotify (*golden path*); Team Topologies (plataforma mínima viável) | O padrão compete pela adoção sendo o caminho mais fácil |
| **Pensamento de grupo** | Janis (1972); Edmondson (1999) | Coesão e pressão por conformidade silenciam alternativas; segurança psicológica e dissenso estruturado recuperam |
| **Não inventado aqui** (e o inverso) | Katz & Allen (1982) | Times rejeitam o que vem de fora; ou, no inverso, adotam o padrão externo sem questionar |
| **Inner source** | Capraro & Riehle (2017) | Práticas de código aberto internas reduzem duplicidade sem centralizar |
| **Racionalização de portfólio** (TIME: tolerar, investir, migrar, eliminar) | Gartner; TBM | Duplicidade é tratada por decisão explícita sobre cada aplicação, não por decreto de padrão |
| **Radar de tecnologia** (adotar, testar, avaliar, suspender) | Thoughtworks | Padrões com ciclo de vida: entram, são testados, e **saem** |
| **Processo de aconselhamento arquitetural** | Harmel-Law (2023) | Qualquer pessoa pode decidir, desde que consulte os afetados e os especialistas. Descentraliza e ouve ideias diferentes |

## 4. Escadas de apropriação

### Q. Padronização com variedade — N7 `[rubrica]` → D10 / D7

| Estágio | Comportamento observado |
|---|---|
| 0 | Não há padrões; ou existem e ninguém sabe quais são |
| 1 | **Padrão-caixa**: obrigatório para tudo; exceção exige escalada ou é negada; quem propõe alternativa é visto como problema; contornos silenciosos ("usamos o padrão no papel") |
| 2 | Padrões documentados com processo de exceção, mas lento e raramente aprovado; sem data de revisão |
| 3 | **Padrão habilitador**: caminho pavimentado para o caso comum, opcional, com suporte; exceção rápida com critério; padrões com dono e data de revisão; quem usa participa da evolução |
| 4 | Padrões competem pela adoção; exceções bem-sucedidas viram padrão novo; padrões expirados são aposentados; commodity padronizada e diferencial livre, por decisão explícita |

**Pergunta de evento:** "A última vez que alguém do seu time quis resolver um
problema de um jeito diferente do padrão, o que aconteceu?" (não era permitido e
ninguém insistiu · foi usado escondido · pediu exceção e esperou semanas · pediu
exceção e teve resposta rápida com critério · a alternativa foi avaliada e virou
opção para outros · não observo)

### R. Reuso entre áreas e custo operacional — N1, N3 `[rubrica]` → D5 / D1

| Estágio | Comportamento observado |
|---|---|
| 0 | Ninguém sabe quantas aplicações e capacidades existem nem quanto custam |
| 1 | Áreas descobrem por acaso que outra já tinha feito o mesmo; cada área mantém sua cópia; custo operacional cresce sem dono |
| 2 | Inventário de aplicações existe, mas desatualizado; duplicidades conhecidas e toleradas |
| 3 | Portfólio mantido e usado em decisões (tolerar, investir, migrar, eliminar); custo por serviço visível para quem decide; componentes comuns com contribuição entre áreas |
| 4 | Reuso por escolha (inner source, plataforma); custo operacional cai de forma sustentada; decisões de construir, comprar ou reutilizar seguem a evolução do componente |

**Pergunta de evento:** "Na última vez que seu time precisou de uma capacidade
nova (autenticação, envio de notificação, relatório, integração), como decidiram
entre construir, reutilizar algo interno ou comprar?" (construímos sem procurar ·
descobrimos depois que já existia · procuramos, mas o interno não servia e não
havia como contribuir · reutilizamos e contribuímos · a decisão seguiu um critério
de portfólio · não observo)

## 5. Sinais (continuação do catálogo, Anexo A §4)

| # | Sinal | Quem vê | Capacidades (dono **em negrito**) | Hipóteses concorrentes |
|---|---|---|---|---|
| S43 | "Aqui é tudo no padrão" dito como encerramento de conversa | Engenharia, arquitetura | **Padronização com variedade** · voz · decisões arquiteturais | padrão como controle · trauma de incidente · falta de confiança · regulação mal interpretada |
| S44 | Exceções ao padrão levam semanas ou não existem | Engenharia | **Padronização** · governança habilitadora | comitê sobrecarregado · ninguém com autoridade · medo de precedente |
| S45 | Uso "escondido" de alternativas ao padrão (*shadow IT*) | Engenharia, segurança | **Padronização** · segurança · voz | padrão inadequado · exceção impossível |
| S46 | O padrão tem mais de 3 anos sem revisão | Arquitetura | **Estratégia tecnológica situacional** · padronização | sem dono · sem data de revisão · inércia |
| S47 | Duas ou mais áreas descobrem que fizeram a mesma coisa | Gestão, arquitetura | **Portfólio de aplicações** · colaboração · desdobramento estratégico | silos de orçamento · sem catálogo · interno não atende |
| S48 | Dados do mesmo cliente com valores diferentes em sistemas diferentes | Dados, suporte | **Portfólio** · definição única de métrica · integração | duplicidade de sistemas · ausência de dono do dado |
| S49 | Ninguém sabe o custo total de operar um serviço | Gestão, finanças | **Custo total de tecnologia** · FinOps | TBM ausente · custo diluído em contratos |
| S50 | Contratos de ferramentas sobrepostas em áreas diferentes | Compras, gestão | **Portfólio** · custo | compras descentralizadas sem catálogo |
| S51 | Alternativa proposta é descartada sem avaliação ("não é o padrão") | Engenharia, júnior | **Voz e escuta** · padronização · decisões arquiteturais | pensamento de grupo · autoridade central · falta de critério |
| S52 | Plataforma obrigatória que ninguém escolheria se pudesse | Engenharia, plataforma | **Plataforma como produto** · padronização | plataforma sem estratégia de produto · mandato no lugar de adoção |

## 6. Famílias causais

### 6.1 "Padrão-caixa"

| Causa | Sintomas típicos (λ alto) |
|---|---|
| Padrão como instrumento de controle central | S43, S44, S51 |
| Trauma de incidente passado (o padrão nasceu para evitar uma repetição) | S43, S46 |
| Contrato ou licenciamento que obriga o uso | S52, S50 |
| Regulação mal interpretada (acredita-se que a norma exige uniformidade) | S44 |
| Concentração de conhecimento (só se sabe operar uma tecnologia) | S43, S52 |
| Ausência de critério explícito de decisão | S51, S44 |

### 6.2 "Duplicação estrutural"

| Causa | Sintomas típicos |
|---|---|
| Silos de estrutura e orçamento (cada área financia o seu) | S47, S50 |
| Ausência de catálogo ou portfólio | S47, S49 |
| Capacidade interna não atende e não aceita contribuição | S47, S52 |
| Incentivo por área (metas locais) | S47, S42 |
| Não inventado aqui | S47 |

## 7. Condutas

| Conduta | Mecanismo | Cynefin | Grau | Menor experimento |
|---|---|---|---|---|
| **Radar de tecnologia com ciclo de vida** | Padrões entram, são testados e saem; cada um tem dono e data de revisão | Complicado | C | Publicar o radar atual com status e dono; marcar 3 padrões para revisão em 90 dias |
| **Caminho pavimentado opcional** | O padrão compete pela adoção; exceção com critério e prazo curto | Complexo | B | Num domínio, tornar o padrão opcional por 1 trimestre, medir adoção e contornos |
| **Processo de aconselhamento arquitetural** | Decisão descentralizada com consulta obrigatória aos afetados | Complexo | C | Aplicar nas próximas 5 decisões arquiteturais e registrar as objeções |
| **Padronizar pela evolução do componente** | Commodity padronizada, diferencial livre (Wardley, subdomínios) | Complicado | C | Mapear 10 componentes principais e classificar |
| **Racionalização do portfólio (TIME)** | Decisão explícita por aplicação | Complicado | B | Inventário de um domínio de negócio e decisão sobre as 3 duplicidades mais caras |
| **Inner source** | Contribuição entre áreas em componentes comuns | Complexo | B | Um componente compartilhado aceita contribuição externa com guia e revisor |
| **Custo por serviço (showback)** | Custo visível para quem decide | Claro | B | Custo mensal de 5 serviços mostrado aos times donos |
| **Dissenso estruturado** | Alternativas avaliadas antes da decisão | Complexo | B | Revisões de decisão com "melhor argumento contra" obrigatório |

## 8. Ligação com "o que fazia sentido antes"

Padrões expiram. Um padrão que nasceu quando uma tecnologia era diferencial ou
quando o time era pequeno pode virar caixa quando o componente virou commodity
ou quando a empresa cresceu. O produto trata isso de três formas:

1. o sinal S46 (padrão sem revisão) e a pergunta "por que existe este padrão hoje?";
2. a capacidade N6 (estratégia situacional), que revisa premissas;
3. o catálogo de práticas datadas (Anexo A §6), que também tem ciclo de vida.

## 9. Método para aprofundar qualquer cenário

Este documento segue um roteiro que vale para qualquer cenário novo trazido por
consultores, clientes ou pela própria base de sinais:

```text
1. Cenário cotidiano (como as pessoas descrevem)
2. Tipologia (formas diferentes que o mesmo fenômeno assume)
3. Filosofia e fundamentos (o porquê, com fonte)
4. Escada de apropriação (0–4) e, se for prática técnica, trilha de sofisticação (F0–F5)
5. Sinais observáveis e quem os vê
6. Família causal (causas concorrentes e sintomas)
7. Perguntas de evento por perspectiva
8. Condutas com mecanismo, Cynefin, grau de evidência e menor experimento
9. O que expira (premissas datadas)
```

Cenários candidatos, na mesma forma:

| Cenário | Universos que abre |
|---|---|
| "Tudo é urgente" | Classes de serviço (Kanban), custo de atraso (Reinertsen), portfólio, gestão de demanda, liderança |
| "Reunião de alinhamento para tudo" | Direitos de decisão, carga cognitiva, modos de interação (Team Topologies), assíncrono, confiança |
| "Modernização que nunca termina" | Strangler fig, fatiamento, portfólio, custo de atraso, critério de encerramento |
| "O conhecimento está no fornecedor" | Sourcing, sucessão, contratos com transferência, subdomínios centrais |
| "Cada gerente pede um relatório diferente" | Definição única de métrica, camada semântica, letramento, desdobramento estratégico |
| "Herói da madrugada" | Toil, SRE, transferência do fardo, bem-estar, reconhecimento |
| "Projeto aprovado, time montado, time desmontado" | Financiamento por projeto × produto, times estáveis, perda de conhecimento |
