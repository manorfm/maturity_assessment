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

Comparações entre papel, senioridade ou disciplina só aparecem se cada grupo
comparado cumprir o limiar. O sistema deve testar ataques por interseção, como
deduzir uma pessoa subtraindo o resultado de um time do resultado do cluster.

No relatório vigente, além do limiar da unidade, todas as partições não vazias do
caminho hierárquico precisam atingir o mínimo. Um time com cinco respostas não é
mostrado se seu irmão tiver apenas uma, pois a comparação com o ancestral revelaria
informação sobre o grupo pequeno. Findings não exibem contagens por alternativa.

## Problemas transversais

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
