# Instruções permanentes do projeto

## Contexto obrigatório

Antes de planejar ou alterar este projeto, leia integralmente:

1. `docs/knowledge-base/README.md` e os documentos que ele indexa;
2. `docs/backlog/README.md` e os itens relevantes ao trabalho solicitado;
3. `docs/history/completed.md` somente quando for necessário entender a cronologia;
   o histórico não é especificação e nunca prevalece sobre a base de conhecimento.

A base de conhecimento é a fonte vigente do produto. Não implemente algo que a
contradiga silenciosamente. Se uma solicitação mudar o modelo, atualize primeiro ou
junto a documentação correspondente.

## Princípios que não podem ser perdidos

- Avaliar comportamentos, decisões, restrições, efeitos e aprendizado; nunca
  atribuir maturidade pela presença de ferramenta, framework, cargo ou cerimônia.
- Perguntas de tecnologia ou estrutura servem somente para contexto e roteamento.
- Usar cenários por perfil para observar o mesmo sistema sociotécnico sob lentes
  diferentes; não transformar o assessment em prova de conhecimento teórico.
- Distinguir capacidade do indivíduo/time de bloqueios impostos por organização,
  arquitetura, plataforma, governança, incentivos ou dependências.
- Preservar anonimato, participação única, limiares de agregação e impossibilidade
  de gestores acessarem respostas individuais.
- Manter inferências explicáveis e versionadas: sinais, contradições, confiança,
  escopo, bloqueios e recomendações condicionadas ao problema.
- Representar a jornada adaptativa como conteúdo em grafo, não como condicionais de
  negócio espalhadas pelo código.
- Manter o sistema como monólito modular Node.js/TypeScript com SQLite enquanto os
  critérios documentados não justificarem mudança.

## Manutenção documental obrigatória

Ao concluir uma alteração relevante:

1. Atualize a base de conhecimento se o comportamento vigente mudou.
2. Remova do backlog o que deixou de ser futuro.
3. Registre em `docs/history/completed.md` uma linha curta com data, resultado e
   links para a documentação vigente, sem duplicar toda a especificação.
4. Adicione ao backlog novas hipóteses descobertas, deixando explícito que ainda não
   são compromisso.
5. Atualize índices quando criar, mover ou remover documentos.

O backlog deve permanecer acionável e conter apenas itens abertos. Não use uma
lista crescente de itens marcados como concluídos; o histórico é o lugar dos itens
entregues e a base de conhecimento descreve o estado atual.

## Qualidade do conteúdo do assessment

- Perfis alteram contexto, linguagem e poder de decisão, não a definição das
  capacidades avaliadas.
- Evite perguntas que revelem a resposta desejada ou dependam de jargão.
- Triangule capacidades com sinais de perfis distintos e eventos recentes.
- Nunca interprete divergência automaticamente como baixa maturidade; ela pode
  revelar baixa visibilidade, fronteira de responsabilidade ou assimetria de poder.
- Recomendações devem atacar causas plausíveis e considerar pré-condições, custo,
  risco e menor experimento útil.

## Qualidade de implementação

- Desenvolva mudanças de comportamento em ciclos TDD explícitos: `red` (teste novo
  falhando pela razão esperada), `green` (menor implementação correta) e `blue`
  (refatoração com todos os testes verdes).
- Modele regras e invariantes no domínio. Use entidades ricas e value objects quando
  um conceito possuir validação, normalização ou comportamento próprios.
- Prefira simplicidade, coesão, responsabilidade única, nomes significativos e uma
  arquitetura que revele o domínio nos diretórios e APIs.
- Centralize tratamento de erros e respostas seguras. Nunca exponha stack trace,
  segredo, SQL ou detalhe interno ao usuário; registre contexto técnico sem tokens.
- Antes de concluir, procure e remova código morto, duplicação, ramos equivalentes,
  compatibilidade obsoleta e artefatos que perderam uso.
- Não introduza React ou outro framework por antecipação. Se uma interface React
  vier a ser adotada por uma decisão documentada, aplique componentes coesos,
  estado mínimo e TypeScript estrito.

## Encerramento de cada interação

Toda resposta final deve terminar com uma única sugestão curta de mensagem de
commit sobre o que foi efetivamente concluído naquela interação, nunca sobre o que
foi apenas solicitado ou planejado.

Formato obrigatório, em inglês e no passado:

```text
<type>: <text>
```

Use um tipo convencional adequado, como `feat`, `fix`, `docs`, `test`, `refactor` ou
`chore`. Não inclua prefixos adicionais, lista, hash ou bloco de código.
