# Maturity Assessment

Aplicação web para self-assessment de maturidade organizacional e técnica baseada
em comportamentos, decisões e evidências — não em declarações genéricas sobre
frameworks ou ferramentas.

O produto será construído em Node.js/TypeScript como um monólito modular, com
API, interface web sóbria renderizada no servidor e SQLite. A definição do modelo
está em [`docs/knowledge-base`](docs/knowledge-base) e as possibilidades futuras
ficam separadas em [`docs/backlog`](docs/backlog/README.md).

## Estado atual — MVP concluído

O primeiro corte vertical está executável. Ele permite criar um projeto, configurar
uma hierarquia livre, gerar convites individuais, responder anonimamente a cinco
cenários com aprofundamentos condicionais e liberar findings globais e hierárquicos
após cinco conclusões em partições seguras.

A versão 0.3 adapta a linguagem de cenários ao perfil e apresenta divergências de
perspectiva somente quando cada grupo comparado possui ao menos cinco respostas.

A versão 0.4 conclui o [escopo do MVP](docs/knowledge-base/mvp-scope.md): adiciona
lotes revogáveis/reemitíveis, migrações incrementais e uma
[API administrativa](docs/knowledge-base/api.md). O sistema está pronto para um
piloto controlado; itens de escala, integração e calibração permanecem no backlog.

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://127.0.0.1:3000`. O banco é criado em `data/app.sqlite`.

## Verificação

```bash
npm run check
npm test
npm run build
```

## Limites deste corte

- O segredo no link administrativo é o único acesso do criador; ainda não há conta
  ou recuperação.
- Convites são copiados manualmente e expiram em 30 dias; lotes podem ser revogados
  e reemitidos sem recuperar segredos antigos.
- O grafo é semeado a partir do catálogo versionado e executado pelas tabelas de
  nós, opções, arestas e sinais no SQLite. Um editor visual continua no backlog.
- Os recortes hierárquicos são suprimidos quando um grupo irmão pequeno permitiria
  inferência por subtração; filtros combináveis mais avançados ainda não existem.
- Variantes por perfil cobrem inicialmente urgência e degradação; a expansão e a
  calibração do catálogo continuam sendo trabalho incremental.
