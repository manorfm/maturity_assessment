# Maturity Assessment

Aplicação web para self-assessment de maturidade organizacional e técnica baseada
em comportamentos, decisões e evidências — não em declarações genéricas sobre
frameworks ou ferramentas.

O produto será construído em Node.js/TypeScript como um monólito modular, com
API, interface web sóbria renderizada no servidor e SQLite. A definição do modelo
está em [`docs/knowledge-base`](docs/knowledge-base) e as possibilidades futuras
ficam separadas em [`docs/backlog`](docs/backlog/README.md).

## Estado atual

O primeiro corte vertical está executável. Ele permite criar um projeto, configurar
uma hierarquia livre, gerar convites individuais, responder anonimamente a cinco
cenários e liberar findings agregados após cinco conclusões.

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
- Convites são copiados manualmente e expiram em 30 dias.
- O relatório apresenta findings globais e as unidades que alcançaram o limiar;
  findings navegáveis por cada nível da hierarquia entram na próxima evolução.
- O grafo inicial é declarativo e versionado no código. Editor e persistência de
  versões publicáveis continuam no backlog.
