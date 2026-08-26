# Evoluções futuras

## Decisões adiadas após o primeiro corte

- autenticação do criador, recuperação de acesso e eventual SSO;
- política definitiva de retenção e exclusão de respostas;
- revisão humana responsável pela calibração inicial e processo de contestação;
- configuração do limiar de anonimato sem permitir redução insegura;
- editor administrativo ou continuidade da autoria por arquivos versionados;
- envio de convites por e-mail/identidade versus distribuição manual;
- proteção contra ataques de interseção em futuros filtros combináveis por perfil,
  tempo ou outras dimensões; a hierarquia simples já usa supressão por partição;
- política para texto livre, que permanece fora do primeiro corte;
- modelo de migrações incremental antes de operação com dados reais.

## Instrumento e experiência

- simulações com consequências visíveis e ramificações com múltiplos checkpoints;
- banco de cenários por papel, contexto, tamanho e tipo de organização;
- modo facilitado para workshops, além da coleta individual;
- entrevistas qualitativas associadas a uma campanha;
- adaptação do questionário conforme sinais anteriores, sem esconder o critério;
- editor visual do grafo com simulação de percursos e validação antes de publicar;
- versões multilíngues revisadas semanticamente, não apenas traduzidas;
- acessibilidade validada com usuários e tecnologias assistivas;
- estimativa de tempo, salvamento parcial e retomada segura;
- feedback ao respondente sem revelar alternativas supostamente “certas”.

## Modelo de inferência

- calibração empírica de perguntas e pesos;
- análise de contradições e confiança por capacidade;
- diferenciação mais precisa entre lacuna de conhecimento e bloqueio sistêmico;
- relações causais apresentadas como hipóteses, nunca como causalidade comprovada;
- análise longitudinal para identificar mudança sustentada;
- benchmarks apenas com amostras comparáveis e proteção contra ranking simplista;
- revisão humana e contestação de findings;
- detecção de questões com baixo poder discriminativo ou viés por grupo/contexto.

## Pilares e referências

- aprofundar DORA sem reduzir maturidade às quatro métricas;
- SRE: SLOs, error budgets, incidentes, toil, capacidade e aprendizado;
- Well-Architected e cloud: trade-offs, resiliência, custo, segurança e operação;
- DDD e arquitetura evolutiva: limites, linguagem, acoplamento e fitness functions;
- Team Topologies: carga cognitiva, modos de interação e plataforma como produto;
- Tuckman e dinâmica de times sem transformar estágios em classificação rígida;
- TOGAF e governança adaptativa, observando tempo de decisão e valor dos controles;
- segurança de software, supply chain, threat modeling e resposta a vulnerabilidades;
- produto, discovery, experimentação e conexão entre resultados técnicos e cliente;
- sustentabilidade, FinOps e eficiência de recursos quando forem relevantes.

## IA no ciclo de trabalho

- onde IA participa de discovery, código, revisão, testes, operação e incidentes;
- qualidade da supervisão, rastreabilidade e validação de saídas;
- impacto em lead time, retrabalho, risco, aprendizagem e concentração de conhecimento;
- políticas de dados, propriedade intelectual, acesso e modelos autorizados;
- diferença entre adoção nominal de IA e melhoria observável de capacidade;
- risco de automação ampliar gargalos ou enfraquecer entendimento do sistema.

## Relatórios e recomendações

- mapas de capacidades e gargalos em vez de nota única;
- comparação segura entre percepções de papéis;
- cadeia de evidências navegável para cada finding;
- recomendações como experimentos, com custo, dependências e sinal de sucesso;
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
- API pública e webhooks com escopos mínimos;
- execução on-premises para organizações com restrições regulatórias.

## Pesquisa e governança do próprio modelo

- conselho/revisão multidisciplinar das perguntas e inferências;
- registro de fontes, versões e grau de evidência de cada capacidade;
- testes com diferentes funções, culturas e níveis hierárquicos;
- processo de depreciação de perguntas e regras;
- documentação de incidentes de interpretação e correções do instrumento;
- política explícita contra uso para avaliação individual de desempenho.
