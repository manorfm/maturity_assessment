# Evoluções futuras

## Decisões adiadas após o primeiro corte

- autenticação do criador, recuperação de acesso e eventual SSO;
- política definitiva de retenção e exclusão de respostas;
- configuração do limiar de anonimato sem permitir redução insegura;
- editor administrativo ou continuidade da autoria por arquivos versionados;
- envio de convites por e-mail/identidade versus distribuição manual;
- proteção contra ataques de interseção em futuros filtros combináveis por perfil,
  tempo ou outras dimensões; a hierarquia simples já usa supressão por partição;
- política para texto livre, que permanece fora do primeiro corte;

## Instrumento e experiência

- simulações com consequências visíveis e ramificações com múltiplos checkpoints;
- banco de cenários por papel, contexto, tamanho e tipo de organização;
- criar ramos próprios para dados, design, arquitetura e segurança e validar a
  linguagem de todos os ramos com cada disciplina antes da publicação;
- modo facilitado para workshops, além da coleta individual;
- entrevistas qualitativas associadas a uma campanha;
- aprofundar folhas que ainda possuam apenas o mínimo publicável de dois padrões,
  guiado por poder discriminativo e calibração empírica;
- editor visual do grafo com simulação de percursos e validação antes de publicar;
- versões multilíngues revisadas semanticamente, não apenas traduzidas;
- acessibilidade validada com usuários e tecnologias assistivas;
- estimativa de tempo, salvamento parcial e retomada segura;
- feedback ao respondente sem revelar alternativas supostamente “certas”.

## Modelo de inferência

- executar o
  [`roadmap do motor probabilístico`](probabilistic-inference-roadmap.md), que reúne
  ontologia causal, inferência bayesiana, seleção de perguntas, recomendações,
  instrumentação, piloto e calibração;
- análise longitudinal para identificar mudança sustentada;
- benchmarks apenas com amostras comparáveis e proteção contra ranking simplista;
- revisão humana e contestação de findings;
- detecção de questões com baixo poder discriminativo ou viés por grupo/contexto.

## Pilares e referências

- definir para cada ramo pelo menos três camadas navegáveis — capacidade, prática e
  comportamento/evidência — sem transformar frameworks ou ferramentas em nota;
- calibrar empiricamente o mínimo vigente de dois padrões independentes por folha;
- aprofundar DORA sem reduzir maturidade às quatro métricas;
- incorporar as cinco métricas DORA vigentes como resultados por aplicação/serviço,
  sem derivar categoria DORA apenas de respostas comportamentais;
- SRE: SLOs, error budgets, incidentes, toil, capacidade e aprendizado;
- Well-Architected e cloud: trade-offs, resiliência, custo, segurança e operação;
- separar eficiência de performance, custo e sustentabilidade em folhas próprias
  quando cada uma possuir sinais comportamentais independentes suficientes;
- DDD e arquitetura evolutiva: limites, linguagem, acoplamento e fitness functions;
- Team Topologies: carga cognitiva, modos de interação e plataforma como produto;
- Tuckman e dinâmica de times sem transformar estágios em classificação rígida;
- TOGAF e governança adaptativa, observando tempo de decisão e valor dos controles;
- segurança de software, supply chain, threat modeling e resposta a vulnerabilidades;
- produto, discovery, experimentação e conexão entre resultados técnicos e cliente;
- sustentabilidade, FinOps e eficiência de recursos quando forem relevantes.

## IA como objeto avaliado

Este tópico trata de comportamentos da organização avaliada. Não descreve o motor
de inferência do produto.

- onde IA participa de discovery, código, revisão, testes, operação e incidentes;
- qualidade da supervisão, rastreabilidade e validação de saídas;
- impacto em lead time, retrabalho, risco, aprendizagem e concentração de conhecimento;
- políticas de dados, propriedade intelectual, acesso e modelos autorizados;
- diferença entre adoção nominal de IA e melhoria observável de capacidade;
- risco de automação ampliar gargalos ou enfraquecer entendimento do sistema.
- criar nós de contexto sem pontuação e deep dives comportamentais sobre uso real,
  revisão, autonomia, aprendizagem, segurança de dados e consequências da IA;

## Relatórios e recomendações

- ampliar os experimentos vigentes com custo, dependências, riscos,
  incompatibilidades de contexto e reversibilidade específicos por intervenção;
- persistir a versão do recomendador e todos os candidatos considerados, além dos
  fatores já apresentados na justificativa, sem armazenar identificação individual;
- calibrar a classificação por elo limitante e a relação entre sinais cruzados,
  cobertura e confiança sem convertê-la em ranking de times;
- aprofundar a cadeia de evidências vigente até as perguntas agregadas sem permitir
  inferência de participantes;
- exportação controlada e relatórios para públicos com diferentes níveis de detalhe;
- acompanhamento de ações sem transformar o assessment em ferramenta punitiva.

## Plataforma e integrações

- editor administrativo com revisão e publicação de templates;
- importação opcional de evidências de CI/CD, incidentes e observabilidade;
- integração com provedores de identidade sem comprometer anonimato analítico;
- canais de distribuição de convites, códigos de acesso e recuperação segura;
- políticas configuráveis de convite: uso único, retomada, expiração e reemissão;
- múltiplas organizações e isolamento de dados;
- importação configurável de hierarquias organizacionais;
- PostgreSQL quando concorrência, escala ou operação justificarem a migração;
- trilha de auditoria, retenção configurável e exclusão de dados;
- ampliar a API administrativa do MVP para uma API pública versionada e webhooks
  com escopos mínimos;
- execução on-premises para organizações com restrições regulatórias.

## Pesquisa e governança do próprio modelo

- conselho/revisão multidisciplinar das perguntas e inferências;
- registro de fontes, versões e grau de evidência de cada capacidade;
- testes com diferentes funções, culturas e níveis hierárquicos;
- processo de depreciação de perguntas e regras;
- documentação de incidentes de interpretação e correções do instrumento;
- política explícita contra uso para avaliação individual de desempenho.
