# Plano: diagnóstico centrado em eventos reais e direção técnica aplicável

Status: implementação em andamento. O contrato factual, as trilhas curtas da onda
2 e os padrões/ciclos sociotécnicos da onda 3 estão vigentes; a validação cognitiva
do orçamento permanece aberta e a próxima implementação é a onda 4.

## Problema

O produto já possui uma ontologia diagnóstica forte, mas a experiência ainda se
aproxima de um questionário amplo que simula uma entrevista. A jornada típica
percorre dezenas de cenários, muitas alternativas permitem reconhecer a resposta
desejável e a coleta nem sempre reconstrói a sequência real de decisão, espera,
restrição, consequência e aprendizado.

O relatório separa mecanismo, contenção, autoridade, impacto e prescrição, porém
parte dessas conclusões nasce de respostas fechadas que já nomeiam a causa. A
direção técnica possui bons contratos em alguns padrões, mas ainda contém
fundamentos repetidos ou genéricos e mantém práticas, técnicas e famílias de
ferramentas longe da leitura principal de especialistas e times.

Isso reduz a capacidade de:

- reconhecer o cotidiano de pessoas desenvolvedoras em ambientes com baixa ou alta
  capacidade;
- distinguir responsabilidade exercida de cargo formal, especialmente quando não
  existe SRE, plataforma, QA ou arquitetura dedicados;
- revelar ciclos virtuosos e viciosos que atravessam squad, arquitetura,
  governança, incentivos e organização;
- orientar práticas como integração contínua, análise de segurança, descoberta de
  domínio ou mapeamento arquitetural sem convertê-las em checklist;
- explicar quando uma técnica ou família de ferramenta ataca o mecanismo observado,
  suas pré-condições, limites e forma de verificar o efeito.

## Hipótese de resultado

Uma pessoa responde a poucos eventos recentes que realmente observou. O sistema
reconstrói cada evento como uma sequência verificável:

```text
contexto e autonomia
  -> evento recente
  -> linha do tempo
  -> decisões e informação disponível
  -> trabalho, espera e contornos
  -> consequência
  -> aprendizado ou reforço do padrão
```

O diagnóstico combina eventos e perspectivas para publicar:

```text
fatos observados
  -> padrão virtuoso ou vicioso
  -> ciclo de reforço ou sustentação
  -> hipóteses causais concorrentes
  -> abrangência e contenção
  -> capacidade disponível para agir
  -> prática-alvo
  -> técnica aplicável
  -> mecanismo habilitador
  -> família de ferramenta opcional
  -> experimento e critério de sucesso
```

A experiência deve funcionar sem depender da presença de perfis especializados.
Quando uma pessoa desenvolvedora também opera, provisiona ou decide arquitetura,
suas responsabilidades e autonomia abrem os aprofundamentos correspondentes.

## Invariantes

- Ferramenta, framework, cargo, certificação, cerimônia e documento não pontuam.
- Ausência de SRE, QA, arquiteto ou plataforma não constitui fragilidade.
- Perfil adapta linguagem; responsabilidade, visibilidade e autonomia selecionam
  eventos e aprofundamentos.
- Inventário técnico é contexto. Só o efeito de desconhecimento, fragmentação,
  indisponibilidade ou inadequação produz evidência diagnóstica.
- Uma alternativa de evento registra fato. Causa permanece hipótese do motor ou é
  discriminada por fatos posteriores, nunca por autoatribuição abstrata.
- Padrão virtuoso não é elogio: declara comportamento, condição que o sustenta,
  efeito observado e sinal de regressão.
- Padrão vicioso não termina em “cultura”: explicita incentivo, autoridade,
  prioridade, política, fronteira, capacidade ou reação a erro observáveis.
- Técnica e família de ferramenta só aparecem depois de problema, mecanismo,
  contenção e capacidade de solução minimamente sustentados.
- Direção técnica informa fundamento, pré-condições, limite, custo/risco
  qualitativo, menor experimento, indicador e critério.
- Anonimato, participação única, limiar de cinco, supressão hierárquica e ausência
  de respostas individuais permanecem inalterados.
- O grafo continua versionado no catálogo e interpretado pelo motor; não entram
  condicionais de jornada nas rotas.
- O monólito modular Node.js/TypeScript com SQLite permanece a arquitetura vigente.

## Fora de escopo

- aumentar a quantidade de pilares;
- criar nota de adoção de CI/CD, SAST, SRE, DDD, Event Storming, C4 ou IDP;
- recomendar marcas ou comparar fornecedores;
- inferir perfil, senioridade ou desempenho individual;
- importar telemetria externa antes de estabilizar e validar o novo instrumento;
- recalibrar priors durante a mudança do grafo;
- iniciar piloto misturando versões do instrumento;
- criar editor visual, SPA, LLM recomendador ou nova infraestrutura distribuída.

## Sequência

```text
Onda 2  entrevista centrada em eventos
   |
Onda 3  fatos, padrões e ciclos sociotécnicos
   |
Onda 4  bibliotecas técnicas condicionadas
   |
Onda 5  direção e organização do relatório
   |
Onda 6  showcase contrastante e validação humana
   |
Onda 7  piloto, revisão cega e calibração
```

As ondas 2 a 5 mudam comportamento e exigem `red -> green -> blue`. Onda 6 é
gate de linguagem e utilidade; onda 7 reutiliza a infraestrutura de calibração
vigente e não pode começar sobre duas versões diferentes do grafo.

---

## Onda 2 — Entrevista centrada em eventos recentes

### Objetivo

Trocar amplitude serial por profundidade diagnóstica em poucos eventos recuperáveis.

### Famílias iniciais de evento

1. última mudança que atrasou ou precisou de contorno;
2. último incidente ou degradação relevante;
3. última decisão técnica que atravessou uma fronteira;
4. último risco de qualidade ou segurança encontrado durante uma mudança;
5. última necessidade de ambiente, acesso ou capacidade compartilhada;
6. última evidência que tentou alterar produto, prioridade ou investimento;
7. última melhoria do sistema de trabalho que avançou ou perdeu continuidade.

Cada pessoa percorre um tronco mínimo e de dois a quatro eventos elegíveis. O
orçamento final será decidido no piloto cognitivo; reduzir perguntas não pode
eliminar triangulação mínima.

### Estrutura de um evento

- gatilho e recência;
- primeira decisão;
- informação e evidência disponíveis;
- sequência de trabalho e espera;
- pessoas ou grupos necessários, em categorias amplas;
- contorno ou exceção;
- consequência observada;
- mudança posterior;
- fato que faria revisar a interpretação.

### Formatos

- linha do tempo ordenável;
- escolha de dois momentos que mais consumiram tempo;
- seleção de evidências efetivamente disponíveis;
- comparação entre processo esperado e ocorrido;
- decisão sob restrição de capacidade;
- consequência e evento seguinte equivalente.

### Red

- Um cenário não pode terminar somente em “o que normalmente acontece” quando a
  resposta pretende sustentar causa.
- Uma opção não pode combinar decisão, mecanismo e consequência independentes.
- Alternativas não podem pedir que a pessoa escolha diretamente “a causa”.
- O mesmo evento precisa aceitar fatos mistos sem obrigar a selecionar uma narrativa
  totalmente forte ou totalmente frágil.
- A estimativa de duração deve refletir caminhos reais, não apenas o primeiro
  sucessor disponível.

### Próximo incremento

- Comparar duração e recuperação do evento em entrevista cognitiva antes de fechar
  o orçamento.

### Blue

- Remover nós substituídos e padrões sem origem factual.
- Extrair estruturas declarativas comuns sem criar um questionário genérico.

### Critério de aceite

- Uma pessoa consegue citar o evento usado para responder e distinguir o que
  ocorreu do que deveria ocorrer.
- O catálogo não depende de alternativa ideal reconhecível para identificar
  comportamento sustentado.
- A jornada típica é menor que a atual e possui maior quantidade de fatos ligados
  ao mesmo evento.

---

## Onda 4 — Bibliotecas técnicas condicionadas ao problema

### Objetivo

Cobrir práticas e técnicas concretas sem transformar o produto em inventário ou
prova de jargão.

### Contrato comum

Cada biblioteca declara:

- sintomas observáveis;
- fatos discriminantes;
- mecanismos concorrentes;
- prática-alvo;
- técnicas compatíveis;
- mecanismo habilitador;
- famílias de ferramentas opcionais;
- pré-condições;
- o que a técnica não resolve;
- risco e custo qualitativos;
- menor experimento;
- indicador e critério;
- fundamento com fonte, princípio, data/versão e limitação.

### 4A — Esteira e feedback técnico

Cobrir proveniência do artefato, integração, duração e estabilidade das verificações,
ownership das falhas, promoção, exposição, bypass, reconciliação e feedback ao
desenvolvedor. Famílias possíveis incluem build, integração, contrato, qualidade,
entrega e observação da mudança; presença nominal não gera sinal.

### 4B — Segurança no fluxo

Cobrir análise estática, composição de dependências, segredo, configuração e
infraestrutura como código apenas quando o risco for aplicável. Distinguir tempo de
retorno, precisão, política por criticidade, ownership, bloqueio, exceção e
aprendizado. Explicitar que scanners não substituem modelagem de ameaça,
autorização, teste de comportamento ou decisão de risco.

### 4C — Ambiente seguro e autonomia operacional

Separar provisionamento, isolamento, dado, acesso, custo, descarte, fidelidade,
concorrência e observabilidade. Avaliar o tempo até o primeiro aprendizado e se o
caminho comum pode ser executado com acesso mínimo, guardrails e reconciliação.

### 4D — Descoberta de domínio e Event Storming

Recomendar descoberta colaborativa quando eventos, regras, linguagem, ownership ou
fronteiras não puderem ser reconstruídos durante uma mudança. Explicar que Event
Storming torna conflitos e decisões visíveis, mas não resolve sozinho acoplamento,
falta de autoridade, funding ou feedback técnico.

### 4E — Mapeamento arquitetural e parque tecnológico

Distinguir inventário nominal de mapa usado para decidir. Cobrir ownership,
criticidade, dependências, fluxos, tecnologias sem mantenedor, risco de mudança e
capacidade de reconstruir impacto. Técnicas possíveis incluem context map, mapa de
capacidades, catálogo de serviços, C4 e mapa de dependências, conforme o problema.

### 4F — Ferramentas e caminhos homologados

Investigar descoberta, acesso, adequação, suporte, alternativas redundantes,
exceções, telemetria de uso e evolução do catálogo. Homologação só é capacidade
quando reduz risco e permite execução; catálogo inacessível ou inadequado pode
produzir fila e contorno.

### Red

- Nenhuma família pode ser recomendada por ausência nominal.
- SAST não pode ser recomendado quando a evidência exige modelagem de ameaça ou
  decisão de autorização.
- Event Storming não pode ser indicado apenas por ausência de documentação.
- C4 ou catálogo de serviços não pode ser indicado quando o problema é somente
  acesso desatualizado.
- Esteira não pode ser recomendada quando política de lote permanece como causa.
- Ferramenta homologada não pode ser tratada como adequada sem evidência da jornada
  do consumidor.

### Green

- Implementar uma biblioteca por vez, começando por esteira, segurança e ambiente.
- Ligar contratos à rede causal e ao recomendador explícito.
- Manter padrões sem contrato diagnosticáveis e com prescrição suspensa.

### Blue

- Eliminar fundamentos repetidos e orientações genéricas substituídas.
- Consolidar referências compartilhadas sem reutilizar justificativas incompatíveis.

### Critério de aceite

- Casos com o mesmo sintoma e mecanismos diferentes recebem técnicas diferentes.
- Cada orientação explica prática, técnica, habilitador e ferramenta opcional em
  camadas separadas.
- Nenhum contrato novo usa marca como solução ou presença como evidência.

---

## Onda 5 — Direção e organização da leitura

### Objetivo

Fazer o relatório responder primeiro ao trabalho observado e depois oferecer
direção técnica utilizável.

### Ordem da página

1. **O que observamos** — evento e padrão recorrente em linguagem concreta.
2. **Por que importa** — consequência demonstrada e alcance.
3. **O que sustenta ou contradiz** — fatos agregados e perspectivas.
4. **O que pode manter o padrão** — hipótese principal, concorrentes e lacuna.
5. **Onde a restrição está contida** — autoridade provável e limite da leitura.
6. **O que já funciona** — padrão virtuoso e capacidade disponível para agir.
7. **Próximo experimento** — decisão, responsável, horizonte, indicador e critério.
8. **Opções técnicas** — prática, técnica, habilitador e família de ferramenta.
9. **Detalhes metodológicos** — posterior, cobertura, ordinal, calibração e versão.

As leituras por autoridade continuam projeções do mesmo finding. Especialistas e
times recebem opções técnicas abertas por padrão; diretoria recebe somente decisões
sob sua autoridade e consequências demonstradas.

### Red

- Leitor não precisa abrir metodologia para identificar evento, padrão, impacto e
  decisão solicitada.
- Uma ferramenta não aparece antes de mecanismo e prática-alvo.
- O relatório não mostra vários cartões concorrentes como prioridades simultâneas.
- Prescrição investigativa não exibe playbook de implementação.
- Padrões virtuosos aparecem com condição de sustentação e sinal de regressão.

### Green

- Criar uma projeção de narrativa centrada no evento a partir do finding existente.
- Reordenar o HTML sem recalcular diagnóstico nas rotas.
- Tornar o contrato técnico visível na leitura especialista.

### Blue

- Remover explicações duplicadas entre cartão, panorama, briefings e detalhes.
- Centralizar labels e prosa de apresentação no domínio responsável.

### Critério de aceite

- Em teste moderado, leitor descreve o problema e o experimento sem citar estágio
  ordinal como resultado principal.
- Pessoa desenvolvedora entende o comportamento esperado, a técnica possível, seu
  fundamento e o limite sem precisar conhecer o nome do framework.

---

## Onda 6 — Showcase contrastante e validação humana

### Objetivo

Demonstrar que o mesmo modelo funciona em estruturas organizacionais distintas e
que a linguagem é reconhecível no cotidiano.

### Casos obrigatórios

1. **Baixa autonomia e muitos handoffs** — desenvolvimento depende de ambiente,
   aprovação, qualidade e operação externas.
2. **Time full-cycle sem SRE dedicado** — desenvolvimento opera com autonomia e
   responsabilidade, guardrails e recuperação demonstrável.
3. **Organização com especialidades** — plataforma, segurança e arquitetura existem,
   mas são avaliadas por tempo, adequação, efeito e modos de interação.
4. **Mesmo sintoma, causas diferentes** — entrega lenta por esteira instável,
   política de lote e acoplamento arquitetural.
5. **Parque desconhecido** — mapa inexistente ou nominal produz ownership e impacto
   não reconstruíveis.
6. **Prática forte com ferramenta simples** — capacidade sustentada não é rebaixada
   pela ausência de produto sofisticado.

### Validação cognitiva

Para cada perspectiva relevante, observar:

- compreensão do cenário;
- recuperação de evento concreto;
- encaixe e sobreposição de alternativas;
- termos artificiais;
- percepção de resposta desejável;
- reconhecimento da própria autonomia;
- utilidade e segurança da orientação;
- capacidade de explicar o fundamento com as próprias palavras.

### Critério de aceite

- Pelo menos cinco entrevistas cognitivas por perspectiva antes de chamar a versão
  de estável para piloto.
- Nenhum caso exige facilitador para entender problema, causa concorrente e próximo
  teste.
- Alterações decorrentes das entrevistas geram uma nova versão antes do piloto;
  versões não são misturadas.

---

## Onda 7 — Piloto, revisão cega e calibração

### Objetivo

Validar poder discriminativo, falsos positivos, parada adaptativa e utilidade das
orientações após a estabilização cognitiva.

### Trabalho

- executar 50–100 jornadas revisadas de forma cega;
- incluir organizações e modelos operacionais contrastantes;
- revisar separadamente fato, padrão, causa, contenção e direção;
- medir falso positivo, parada incorreta, Brier, ECE e discordância conforme a
  política vigente;
- identificar perguntas sem poder discriminativo ou com viés por contexto;
- publicar novos priors apenas em versão `draft`, após revisão humana;
- manter aceitação da recomendação fora dos rótulos de verdade.

### Critério de aceite

- Gate vigente atendido sem relaxar limiares após observar resultados.
- Mesmo sintoma com mecanismos distintos é separado em revisão cega.
- Ausência de perfil especializado não gera falso diagnóstico de incapacidade.
- Direções são consideradas aplicáveis sem premiar ferramenta existente.

## Estratégia de migração

- Não alterar `evidence-anamnesis-pilot-v11` depois do início de coleta humana.
- Desenvolver a nova autoria sob identificador de versão próprio.
- Campanhas guardam integralmente a versão utilizada.
- Não comparar posterior ou nível entre versões como se fossem o mesmo instrumento.
- Manter apenas contratos necessários ao runtime vigente; remover compatibilidade
  obsoleta quando a versão anterior deixar de ser suportada.
- Atualizar base de conhecimento, backlog e histórico a cada onda promovida, sem
  marcar itens concluídos dentro deste arquivo.

## Métricas de produto e instrumento

As métricas abaixo orientam validação; não viram score de respondente ou time:

- duração mediana e dispersão por percurso;
- eventos concretos recuperados por jornada;
- fatos independentes por evento;
- frequência de “não observo” por responsabilidade elegível;
- alternativas sobrepostas ou ausentes nas entrevistas cognitivas;
- taxa de resposta desejável reconhecida;
- causas corretas e falsos positivos na revisão cega;
- diferença entre sintoma correto e mecanismo correto;
- compreensão sem facilitador do problema, fundamento e experimento;
- contratos com fundamento específico versus genérico;
- recomendações de família de ferramenta corretamente suspensas por falta de causa.

## Riscos e mitigação

- **Entrevista ficar longa por aprofundar eventos.** Limitar eventos elegíveis e
  medir tempo real; profundidade não significa perguntar tudo.
- **Linha do tempo exigir memória impossível.** Oferecer “não lembro”, janelas de
  recência e fatos aproximados sem transformar ausência em fragilidade.
- **Contexto de autonomia reidentificar pessoa.** Usar categorias amplas, não
  publicar combinações raras e aplicar o mesmo limiar de agregação.
- **Técnicas virarem checklist de consultoria.** Exigir mecanismo, limite e menor
  experimento antes de publicar opção.
- **Biblioteca crescer sem calibração.** Implementar por família, com caso
  contrastante e revisão disciplinar.
- **Relatório ficar ainda maior.** Um cartão fecha uma decisão; alternativas e
  metodologia usam divulgação progressiva.
- **Fundamento virar citação decorativa.** Exigir vínculo explícito entre princípio,
  fato e mecanismo e declarar limitação.
- **Preservar código histórico demais.** Versionar conteúdo e remover caminhos
  obsoletos quando não houver campanha suportada que dependa deles.

## Critério de conclusão do plano

O plano só sai do backlog quando:

- a jornada seleciona perguntas por responsabilidade, autonomia e evento observado;
- a entrevista reconstrói poucos eventos reais em vez de percorrer um formulário
  amplo;
- opções coletam fatos e o motor mantém hipóteses causais concorrentes;
- padrões virtuosos e viciosos possuem ciclos explicáveis e evidência faltante;
- esteira, segurança, ambiente, descoberta de domínio, mapeamento arquitetural,
  parque tecnológico e ferramentas homologadas possuem contratos condicionados;
- cada direção separa prática, técnica, habilitador e família de ferramenta;
- fundamentos genéricos do escopo promovido foram substituídos por contratos
  específicos;
- as três estruturas organizacionais contrastantes produzem diagnósticos coerentes;
- entrevistas cognitivas e revisão cega cumprem os gates vigentes;
- a base de conhecimento descreve o novo comportamento e o backlog contém somente
  trabalho ainda aberto.
