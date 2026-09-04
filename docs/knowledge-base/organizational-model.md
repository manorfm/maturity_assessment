# Estrutura organizacional e anonimato

## Hierarquia configurável

O criador do projeto configura uma árvore de unidades. Cada organização escolhe
seus nomes e profundidade:

```text
Organização
└── Tribo
    ├── Cluster A
    │   ├── Time 1
    │   └── Time 2
    └── Cluster B
        └── Squad 3
```

`tribo`, `cluster`, `time` e `squad` são rótulos configuráveis, não entidades
rígidas. Uma organização enxuta pode ter apenas organização e time. Convites são
associados exclusivamente às folhas da árvore, qualquer que seja o nome local;
nós intermediários existem para consolidar e navegar resultados. O respondente não
precisa declarar informações que permitam sua identificação.

Na tela, a árvore é montada adicionando raízes e unidades filhas; a pessoa não
digita caminhos nem separadores. O editor impede nomes vazios, barras, irmãos com
o mesmo nome, mais de doze níveis e mais de duzentas unidades. Apenas no envio as
folhas são serializadas no formato interno validado pelo domínio.

O convite não recebe perfil. O mesmo lote atende qualquer integrante da unidade, e
a primeira etapa coleta uma perspectiva ampla somente para roteamento. Os relatórios
só permitem comparações por perspectiva quando o limiar de anonimato for cumprido.
Perfis raros devem ser agrupados ou reportados apenas no nível ancestral.

## Visões do relatório

- **Global:** capacidades e gargalos da organização inteira.
- **Por nível:** agregação em tribo, cluster ou qualquer tipo configurado.
- **Local:** visão de uma unidade elegível, como squad/time.
- **Transversal:** problema recorrente em diferentes ramos da hierarquia.
- **Dependência:** capacidade local limitada por uma unidade ou política externa.

As agregações preservam distribuição, confiança, divergências e volume suficiente;
não calculam apenas média. Um resultado global alto não esconde um gargalo crítico,
e um time forte não compensa matematicamente uma restrição organizacional.

A classificação sociotécnica de cada unidade usa seu elo confiável mais frágil. Na
consolidação, o ancestral é limitado pela unidade descendente publicável de menor
nível, mantendo no relatório tanto a origem do limite quanto os radares locais.
Assim, duas folhas adaptativas não transformam em madura uma área que também contém
uma folha reativa: a classificação da área permanece limitada pela folha reativa.

## Regra de anonimato

Uma visão só é liberada quando atinge o limiar mínimo de participantes concluídos.
Abaixo dele:

- respostas são agregadas ao ancestral que alcance o limiar;
- filtros e combinações que permitam isolar pessoas são bloqueados;
- texto livre é tratado separadamente, com aviso e controles de identificação;
- o gestor não recebe exceção nem acesso às respostas brutas;
- contagens podem ser arredondadas ou suprimidas quando revelarem indivíduos.

O mínimo vigente de cinco protege anonimato e libera agregação; ele não garante
representatividade nem precisão estatística. Dez respostas em um time permitem um
recorte local mais estável e comparação de padrões recorrentes, mas diferenças entre
perspectivas só são publicadas quando cada perspectiva comparada possui cinco
participações no mesmo escopo. Portanto, dois times de dez podem orientar hipóteses
por time, porém não validam sozinhos todas as comparações entre SRE, QA, produto,
arquitetura, gestão e engenharia.

Comparações entre papel, senioridade ou disciplina só aparecem se cada grupo
comparado cumprir o limiar. O sistema deve testar ataques por interseção, como
deduzir uma pessoa subtraindo o resultado de um time do resultado do cluster.

No relatório vigente, além do limiar da unidade, todas as partições não vazias do
caminho hierárquico precisam atingir o mínimo. Um time com cinco respostas não é
mostrado se seu irmão tiver apenas uma, pois a comparação com o ancestral revelaria
informação sobre o grupo pequeno. Findings não exibem contagens por alternativa.

Reaplicação e experimentos persistidos usam o recorte elegível, nunca a pessoa.
O gestor vê se um padrão perdeu ou ganhou suporte coletivo; não vê quem respondeu
nem ranking de times.

## Problemas transversais

Cada recorte elegível abre sua própria classificação, decisão prioritária, lista
curta de comportamentos relacionados e radar. A sequência priorizada pertence ao
panorama global; o recorte não cria um segundo portfólio concorrente. No resumo
global, a ocorrência nas unidades finais distingue:

- **local**, quando apenas uma unidade sustenta o padrão;
- **compartilhada**, quando mais de uma, mas não todas, sustentam o padrão;
- **transversal**, quando todas as unidades finais elegíveis o sustentam;
- **observada**, quando existe somente um recorte elegível e não há comparação.

Esses rótulos descrevem abrangência observada, não causa. Um padrão transversal não
é automaticamente organizacional, e dependência só pode ser atribuída quando a
evidência identifica a fronteira ou política externa. Ausência em outro recorte
significa “não demonstrado nesse recorte”, nunca prova de inexistência.

**Contenção** é uma dimensão diferente: time, serviço compartilhado, política
organizacional, estrutura organizacional, fornecedor/regulador ou indeterminada.
Ela deriva do mecanismo sustentado, nunca da quantidade de squads afetadas. Uma
restrição transversal pode continuar indeterminada; uma dependência externa local
continua externa. Quando a raiz possui apenas recortes filhos elegíveis, o mapa por
estrutura omite essa raiz porque ela duplicaria a visão global.

O motor agrega `ProblemPattern`s semelhantes por escopo e origem provável. Exemplos:

- muitos times aguardam o mesmo provisionamento: possível gargalo de plataforma ou
  governança, ainda que cada time tenha criado contornos diferentes;
- conflitos recorrentes no mesmo repositório atravessam clusters: possível
  desalinhamento de ownership, arquitetura, integração ou planejamento;
- QA entra apenas ao final em várias unidades: desenho de fluxo organizacional, não
  falha isolada de um QA ou desenvolvedor;
- um time automatizou deploy localmente e os demais empacotam manualmente:
  capacidade local existente, baixa difusão e ausência de caminho reutilizável.

Findings devem atribuir o nível mais plausível da restrição e indicar incerteza. O
relatório nunca identifica qual participante originou um sinal.

## Amostra para o experimento real

O tamanho da amostra não é um número único e não aumenta com a quantidade de eixos
no radar. Os gates vigentes são:

1. **Checagem de linguagem:** 8 pessoas em uma unidade. Avalia compreensão, não
   publica os oito pilares nem compara squads.
2. **Diagnóstico de uma unidade:** 5 pessoas na mesma folha da hierarquia. Pode
   publicar findings locais; pilares sem dois padrões independentes permanecem não
   avaliados.
3. **Comparação entre unidades:** 10 pessoas, 5 em cada uma de duas unidades. Separa
   problema local de restrição compartilhada.
4. **Diagnóstico organizacional:** 18 pessoas em duas unidades, com trilhas
   complementares (entrega, ciclo completo, risco, plataforma, arquitetura, produto,
   portfólio, dados/experiência). Cada papel aparece pelo menos duas vezes para
   sustentar um padrão. A visão global é o cartão da organização; o detalhe de cada
   pilar e de cada unidade traz ações de área, diretoria ou escalada. Essa amostra
   é a população mínima para um relatório executivo quando o first screen fecha
   **corrigir**, **evoluir** ou **preservar**. Discriminar no cartão principal
   significa que a causa ainda não foi amarrada — não apresente à diretoria e não
   resolva só com mais eixos ou mais gente.
5. **Triangulação das nove lentes:** 45 pessoas (5 por perspectiva no mesmo recorte).
6. **Calibração:** 50 a 100 jornadas rotuladas por especialistas. Massa sintética
   não abre este gate.

A entrevista curta percorre de dois a quatro eventos. Aprofundamentos de perfil
(discovery, FinOps/cloud, qualidade profunda) ficam fora desse orçamento; a
ausência vira “não avaliado”, nunca nível zero. Expandir o radar para quinze eixos
aumentaria a fração não avaliada sem aumentar precisão: precisão vem de padrões
independentes, concordância e discriminação de causa.

O showcase da POC gera três organizações sintéticas de 18 pessoas, nomeadas pelos
estágios do modelo: **opaco**, **repetível** e **adaptativo**. Cada uma publica um
first screen que um diretor consegue usar — problema, causa e experimento, ou
preservação da prática. Folhas sem causa amarrada continuam no detalhe ou no
panorama como incerteza, não no cartão principal. Concordar num único padrão
adaptativo não publica o pilar; a ausência continua “não avaliado”.

