# Arquitetura técnica vigente

## Decisão

A aplicação será um monólito modular em **Node.js com TypeScript**, usando SQLite,
API HTTP e páginas sóbrias renderizadas no servidor. JavaScript no navegador será
progressivo e usado apenas onde melhorar a interação.

## Direção inicial da stack

- Node.js em versão LTS e TypeScript em modo estrito;
- Fastify para HTTP, API e composição explícita dos módulos;
- templates server-side para as telas;
- `node:sqlite`, schema inicial idempotente e acesso isolado por serviços;
- CSS local com design tokens simples, sem depender inicialmente de um SPA;
- testes unitários para inferências e testes de integração para API/banco;
- conteúdo inicial do assessment versionado em arquivos no repositório.

Fastify e `node:sqlite` foram confirmados no primeiro corte executável. Detalhes
internos podem evoluir por ADR sem alterar o modelo de domínio.

## Limites modulares

Cada módulo contém domínio, casos de uso, persistência e interface HTTP próprios.
Um módulo não acessa diretamente as tabelas internas de outro. A composição ocorre
na inicialização da aplicação e a comunicação usa contratos explícitos.

Estrutura inicial:

```text
src/
  app/
  modules/
    catalog/
    assessments/
    inference/
    projects/
  shared/
  web/
```

`shared` será pequeno: infraestrutura realmente transversal, não regras de negócio
sem proprietário.

O questionário e a inferência não são cadeias de `if` espalhadas pelas rotas.
Definições declarativas versionadas no módulo `catalog` descrevem nós, opções e
sinais; o primeiro grafo é linear, mas já possui identidade e versão próprias. Nós,
arestas condicionais e publicação persistidos em SQLite são a evolução natural do
motor, sem exigir banco de grafos.

## Critérios da decisão

- um único processo, deploy e banco no estágio atual;
- baixo custo de operação e desenvolvimento local;
- regras de inferência testáveis sem servidor ou banco;
- histórico e explicabilidade preservados por versão;
- possibilidade de trocar SQLite no futuro sem antecipar uma arquitetura distribuída;
- acessibilidade, privacidade e segurança incluídas desde o primeiro fluxo.

## Primeiro corte vertical

1. Criar um projeto e sua hierarquia configurável.
2. Emitir convites anônimos não rastreáveis no relatório.
3. Responder a um pequeno cenário de entrega/observabilidade.
4. Persistir respostas e gerar sinais explicáveis.
5. Exibir consolidação apenas quando o limite mínimo de participantes for atingido.

O corte vigente implementa esses cinco passos com cinco cenários iniciais e perfis
de gestão, produto, qualidade, engenharia e plataforma/operações.

## Links e proteção contra respostas repetidas

- O identificador público do projeto não autoriza responder.
- Cada convite usa um token criptograficamente aleatório de alta entropia.
- O banco guarda `hash(token)`, estado, validade e rodada; a URL contém o token.
- O consumo é atômico no SQLite para impedir duas conclusões concorrentes.
- Uma sessão pode retomar resposta parcial sem criar uma segunda participação.
- Convites concluídos não podem iniciar nova participação.
- Ao reabrir um convite concluído, a aplicação mostra somente que a participação já
  foi registrada; não recupera nem apresenta respostas.
- Tokens são removidos de logs, telemetria, referrers e páginas posteriores.
- Respostas e convites ficam logicamente separados e não são correlacionados nos
  relatórios administrativos.

Cookies, IP e fingerprint de navegador não serão usados como controle principal:
são frágeis, podem bloquear pessoas legítimas e criam riscos de privacidade. Como
defesa complementar, poderão existir rate limit e detecção agregada de abuso sem
compor qualquer inferência de maturidade.
