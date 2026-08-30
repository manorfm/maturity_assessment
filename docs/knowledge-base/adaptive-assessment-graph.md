# Grafo adaptativo de assessment

## Objetivo

Construir uma jornada de perguntas que aprofunda problemas relevantes sem codificar
um questionário fixo ou espalhar condicionais pela aplicação. O grafo é conteúdo
versionado, validado e publicável.

No estado vigente, o catálogo em TypeScript é a fonte de autoria e semeia uma
versão publicada em tabelas SQLite. Participações guardam a versão usada; o motor
carrega nós, opções, sinais e arestas do banco. Alterar o arquivo sem criar uma nova
versão não modifica campanhas já semeadas.

A versão pré-piloto vigente `evidence-anamnesis-pilot-v6` começa por uma escolha neutra de
perspectiva. A pessoa recebe um tronco comum e, quando a perspectiva muda o que ela
consegue observar ou decidir, um ramo próprio. Gestão, produto, qualidade, engenharia,
plataforma/operações, arquitetura, segurança, dados e design possuem aprofundamentos
dedicados. Variantes de texto ficam restritas aos casos em que muda a linguagem, mas
não a evidência procurada.

Cenários e probes (exceto a escolha de perspectiva) oferecem “não observo”, sem
sinal. Nós de contexto sobre credencial, dependência, reconhecimento e assistência
de modelo roteiam para a prática somente quando o evento ocorre; caso contrário a
folha permanece não avaliada. Identidade, resiliência de dependência, incentivo, uso
de modelo, complexidade acidental e leitura de sinal ruidoso alimentam folhas já
existentes da taxonomia — não criam pilares.

Após a liderança sistêmica, o perfil escolhe o aprofundamento: gestão (portfólio,
segurança para expor risco e carga cognitiva), produto (discovery e efeito),
qualidade (estratégia de risco e não funcionais), engenharia (segurança na mudança
e difusão de conhecimento), plataforma (recuperação, resiliência, eficiência e
caminho até capacidade), arquitetura (linguagem compartilhada e espera entre
grupos), segurança (ameaça e achado em mudança comum), dados (significado e
evolução do contrato) e design (experiência na decisão e evidência de uso). Nenhum
desses ramos pergunta o nome de um modelo, ferramenta ou cargo.

## Tipos de nó

- `context`: identifica aplicabilidade sem produzir evidência de capacidade;
- `scenario`: apresenta um evento ou problema concreto;
- `question`: escolha, ordenação, frequência, linha do tempo ou evidência;
- `probe`: aprofunda contradição, impacto, frequência, causa ou bloqueio;
- `checkpoint`: decide se já há evidência suficiente ou se falta confiança;
- `end`: encerra um ramo e registra lacunas restantes.

As arestas usam condições declarativas sobre respostas e sinais já observados. Não
executam código arbitrário. Cada percurso tem limites de tamanho, detecção de ciclo
e uma saída segura. A tela da entrevista mostra a etapa corrente, uma estimativa de
minutos restantes no caminho declarativo típico e pede que a pessoa guarde o
endereço de retomada: o convite original não reabre o percurso. No fim podem
entrar até cinco probes extras; eles não entram na estimativa do tronco.

O grafo vigente possui três ramificações de discriminação após a espera para
entregar: empacotamento manual, fila de qualidade ou aprovação/governança. Uma
resposta de fluxo curto segue diretamente ao cenário seguinte.

Perfil, unidade organizacional e contexto selecionam nós elegíveis; eles não geram
sinais de capacidade por si mesmos. Um cenário pode ter variantes para gestão, PM,
QA ou engenharia que alimentam a mesma capacidade por `EvidenceFacet`s diferentes.

O catálogo atual contém 79 nós e cobre eventos de priorização, integração,
entrega, qualidade, observabilidade, recorrência, descoberta, feedback técnico,
ambientes, segurança, arquitetura, dados, experiência de uso e aprendizado após falhas. Quantidade de perguntas
não é meta de diagnóstico: novas versões devem ampliar profundidade e discriminação
com base em lacunas de evidência e sinais anteriores, como uma entrevista.

As alternativas de prática são apresentadas em ordem determinística por
participação e nó. Isso reduz a pista recorrente de desejabilidade sem fazer a
ordem saltar durante uma retomada. Saídas observacionais continuam no fim e não
pontuam. A publicação também audita perguntas causais diretas, termos julgadores,
jargão exposto e alternativas excessivamente compostas.

O ramo de entrega aprofunda tanto sinais frágeis quanto maduros. Integração tardia
discrimina quatro causas prováveis — feedback ferramental, processo/política, fronteira
de times e acoplamento arquitetural. Integração frequente segue para verificar se
implantação e exposição são decisões independentes, se controles de release possuem
ownership e se o caminho seguro resiste a uma urgência. Uma contradição posterior
reduz confiança e pode regredir o nível inferido.

O ramo de incidentes percorre detecção, classificação, roteamento, diagnóstico,
correção e aprendizado. Caminhos frágeis discriminam ownership, política, fronteira
de sustentação, ausência de impacto observável, lacuna de telemetria, ferramenta ou
acesso insuficiente, quebra de correlação arquitetural e privacidade operacional.
Correções distinguem fonte reproduzível, exceção reconciliada e mutação direta de
runtime, configuração, infraestrutura ou dados.

O ramo de trabalho verifica se uma iteração é orientada a resultado ou ocupação,
como o grupo reage a bloqueios e se decisões chegam como solução pronta, escolha
concentrada, convenção por inércia ou trade-off intencionalmente revisável.

O ramo de resultado distingue o sintoma “a evidência não alterou o investimento”
de quatro mecanismos concorrentes: financiamento que termina com a iniciativa,
responsabilidade encerrada no aceite, capacidade já tomada pelo próximo compromisso
e incentivo que reconhece prazo e escopo sem dar autoridade ao resultado. Cada
mecanismo possui contenção, classe de solução, limite e experimento próprios; o
instrumento não conclui “mudar para produto” apenas pela nomenclatura adotada.

O ramo de plataforma reconstrói a jornada desde a descoberta até o aprendizado:
se o caminho é encontrado, acessível, adequado ao caso comum, concluído sem ajuda
recorrente, coerente com outras alternativas e capaz de tratar exceções. Depois,
verifica se conclusão, abandono, suporte e contornos mudam o produto interno. A
presença de portal, documentação, time ou automação não pontua; baixa adoção pode
ser restrição de descoberta, acesso, adequação, feedback, fragmentação ou retorno
das exceções, cada qual com intervenção própria.

O ramo de segurança continua depois do achado para reconstruir o controle. Distingue
obrigação legítima com separação verificável, proteção proporcional ao risco,
aprovação que compensa evidência técnica frágil, fórum que compensa ownership,
segregação implementada como fila manual e aceite sem decisão possível. Depois
observa se auditorias, exceções e incidentes alteram a proteção ou apenas acumulam
registros e etapas. A solução preserva a obrigação quando ela existe e atua no
mecanismo que tornou o controle lento ou ineficaz.

O ramo de workforce é observado por gestão e engenharia a partir de trabalho real.
Ele distingue conhecimento ainda inexistente, concentrado, bloqueado por acesso,
sem oportunidade de prática, dependente de fornecedor ou impedido pela carga. Uma
segunda etapa verifica se curso, mentoria, colaboração ou contratação mudaram quem
consegue executar a demanda seguinte. Presença em treinamento e matriz declarada
não demonstram capacidade sem aplicação; a intervenção pode envolver aquisição
temporária, colaboração, acesso supervisionado, prática aplicada, transferência
contratual ou redução explícita de escopo.

O ramo de melhoria verifica consequência em vez de frequência da cerimônia: ação
limitada, ownership, capacidade, revisão de efeito, autonomia e segurança para
expor problemas. As respostas geram sinais cruzados somente quando a cadeia completa
afeta mais de uma capacidade.

Um nó de contexto sem sinais identifica se a superfície de mudança pertence a um
time ou é alterada por vários. Apenas os casos compartilhados aprofundam colisão,
sobrescrita, integração tardia, coordenação manual, fonte reproduzível, limites de
arquitetura, prioridades e verificações entre times.

## Duas passagens de raciocínio

1. **Descoberta:** encontra sintomas e capacidades potencialmente afetadas.
2. **Discriminação:** separa explicações concorrentes e identifica o bloqueio.

Exemplo resumido:

```text
mudança pronta para entrega
  -> reconstrução manual do artefato?
  -> espera por ambiente/permissão?
  -> integração tardia com outras mudanças?
  -> regressão longa por dados/testes frágeis?
  -> impacto e frequência
  -> origem local, dependência ou política transversal
```

O percurso não precisa mencionar CI/CD, GitOps, branch strategy ou golden source.
Esses conceitos podem surgir como interpretações internas ou opções posteriores.

## Inferência

Respostas geram sinais tipados e versionados, nunca uma nota solta. Cada sinal novo
declara explicitamente as folhas afetadas, a camada de evidência e a natureza da
restrição observada. Regras combinam sinais
convergentes, contraditórios e ausentes para produzir `ProblemPattern`s com:

- capacidade afetada;
- severidade, frequência e impacto;
- confiança e evidências mínimas;
- escopo organizacional provável;
- bloqueios concorrentes;
- perguntas ainda necessárias.

O catálogo só pode ser publicado quando toda folha possui ao menos dois padrões
independentes. Repetir o mesmo padrão aumenta evidência, mas não cobertura. Folhas
sem cobertura mínima aparecem como `não avaliado` e ficam fora da geometria do radar.

Quando vários perfis observam o mesmo comportamento, o motor registra convergência,
divergência e ausência de visibilidade. Divergência direciona novas perguntas e
reduz confiança; não vira automaticamente um sinal negativo.

## Recomendações

O recomendador vigente é um sistema especialista explicável e não usa LLM. Cada
candidato declara seus padrões de sustentação e contradição; sinais apenas
coexistentes não são tratados como causa. A confiança considera a população que
observou a capacidade, triangulação específica por camada e perspectiva,
consequência e contradição pareada. Prioridade permanece separada da confiança. A
nota 0–4 não participa do ranking e identificadores internos nunca aparecem.

Enquanto não houver piloto, o posterior numérico permanece interno. A interface usa
faixas verbais de sustentação para não simular probabilidade calibrada. Sua decomposição acompanha o experimento,
que explicita ação, responsável provável, métrica, revisão e critério de sucesso.

Após uma saída declarativa, o motor compara probes ainda não respondidos, visíveis
à perspectiva e habilitados por padrões de contexto já observados. O ranking combina 50% de ganho esperado de informação, 25% de
cobertura, 15% de validação e 10% de custo invertido. A extensão termina sem pergunta
útil acima de 0,01 bit ou após cinco probes, e persiste versão, posterior e motivo
da escolha sem expor a jornada individual no relatório. Probes de causa só são
elegíveis quando um sintoma declarado em sua aplicabilidade foi observado.

Não existe mapeamento “resposta X = compre ferramenta Y”. Duas populações com a
mesma nota podem receber intervenções diferentes porque as combinações de causas,
camadas e comportamentos são diferentes.

O mesmo padrão transversal é publicado uma única vez com todas as folhas afetadas.
Depois de discriminar a causa, o motor declara a capacidade necessária para agir e
estima se ela não foi demonstrada, está apenas declarada, funciona localmente, é
operacional ou adaptativa. Essa leitura usa evidência coletiva positiva e não
transforma silêncio em inexistência.

O catálogo separa intervenções de `correction` e `evolution`. A primeira trata um
padrão negativo; a segunda transforma uma evidência intermediária recorrente em
capacidade adaptativa. Por isso uma folha com cobertura e confiança completas, mas
nível 3.7, recebe caminho de evolução; uma folha 4/4 não recebe recomendação apenas
para preencher espaço.

Para integração tardia, por exemplo, opções podem incluir reduzir tamanho de lote,
integração mais frequente, testes de contrato, clareza de ownership, modularização
ou automação do pipeline. A técnica adequada depende do bloqueio discriminado pelo
percurso e pode começar com um experimento menor do que a solução-alvo.

## Governança do conteúdo

- todo grafo possui versão imutável após publicação;
- alterações passam por validação de nós inalcançáveis, ciclos e saídas;
- cenários registram capacidades, vieses conhecidos e referências;
- regras e recomendações possuem testes com percursos sintéticos;
- relatórios guardam a versão exata do grafo e das regras;
- IA pode apoiar autoria e síntese no futuro, mas não altera silenciosamente uma
  campanha publicada nem produz finding sem cadeia de evidências.
