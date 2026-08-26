# Grafo adaptativo de assessment

## Objetivo

Construir uma jornada de perguntas que aprofunda problemas relevantes sem codificar
um questionário fixo ou espalhar condicionais pela aplicação. O grafo é conteúdo
versionado, validado e publicável.

No estado vigente, o catálogo em TypeScript é a fonte de autoria e semeia uma
versão publicada em tabelas SQLite. Participações guardam a versão usada; o motor
carrega nós, opções, sinais e arestas do banco. Alterar o arquivo sem criar uma nova
versão não modifica campanhas já semeadas.

## Tipos de nó

- `context`: identifica aplicabilidade sem produzir maturidade;
- `scenario`: apresenta um evento ou problema concreto;
- `question`: escolha, ordenação, frequência, linha do tempo ou evidência;
- `probe`: aprofunda contradição, impacto, frequência, causa ou bloqueio;
- `checkpoint`: decide se já há evidência suficiente ou se falta confiança;
- `end`: encerra um ramo e registra lacunas restantes.

As arestas usam condições declarativas sobre respostas e sinais já observados. Não
executam código arbitrário. Cada percurso tem limites de tamanho, detecção de ciclo
e uma saída segura.

O primeiro grafo possui três ramificações de discriminação após a espera para
entregar: empacotamento manual, fila de qualidade ou aprovação/governança. Uma
resposta de fluxo curto segue diretamente ao cenário seguinte.

Perfil, unidade organizacional e contexto selecionam nós elegíveis; eles não geram
sinais de maturidade por si mesmos. Um cenário pode ter variantes para gestão, PM,
QA ou engenharia que alimentam a mesma capacidade por `EvidenceFacet`s diferentes.

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

Respostas geram sinais tipados, nunca uma pontuação direta. Regras combinam sinais
convergentes, contraditórios e ausentes para produzir `ProblemPattern`s com:

- capacidade afetada;
- severidade, frequência e impacto;
- confiança e evidências mínimas;
- escopo organizacional provável;
- bloqueios concorrentes;
- perguntas ainda necessárias.

Quando vários perfis observam o mesmo comportamento, o motor registra convergência,
divergência e ausência de visibilidade. Divergência direciona novas perguntas e
reduz confiança; não vira automaticamente um sinal negativo.

## Recomendações

Cada recomendação declara quais padrões e pré-condições atende, seus custos, riscos
e sinais de sucesso. O motor primeiro seleciona intervenções compatíveis e depois
as ordena; não existe mapeamento “resposta X = compre ferramenta Y”.

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
