# Perfis e triangulação

## Princípio

O assessment adapta linguagem e cenários ao que cada perfil observa, decide ou
influencia. Ele não aplica a mesma prova a todos e não calcula maturidade individual
ou por profissão. O objeto avaliado continua sendo a capacidade do sistema de
trabalho em um escopo organizacional.

## Perfil configurável

Organizações usam títulos diferentes. O projeto oferece famílias iniciais — gestão,
produto, qualidade, engenharia, dados, design, arquitetura, plataforma/operações e
segurança — e permite nomes locais. Um título pode mapear para várias famílias, e
uma pessoa pode selecionar mais de uma lente sem informar identidade.

O roteamento considera:

- decisões que o perfil costuma tomar;
- partes do fluxo que consegue observar;
- dependências que oferece ou consome;
- horizonte de tempo e escopo organizacional;
- contexto técnico necessário para tornar o cenário plausível.

## Matriz de perspectivas

Uma capacidade compartilhada recebe evidências complementares:

| Capacidade | Gestão | Produto | QA | Engenharia | Plataforma/SRE |
|---|---|---|---|---|---|
| Feedback rápido | remove dependências | reduz lote e valida valor | antecipa risco | integra e verifica | encurta provisão e diagnóstico |
| Qualidade sustentável | protege capacidade | explicita critérios | desenha estratégia | incorpora testabilidade | fornece ambientes e sinais |
| Fluxo seguro | limita WIP/escalada | negocia escopo | evita fila final | automatiza entrega | cria guardrails e recuperação |
| Aprendizado | trata conflito/erro | revisa hipótese | analisa escapes | reduz recorrência | evolui plataforma/runbooks |

A matriz não é uma checklist fixa; orienta autoria e identifica pontos cegos.

## Triangulação

O motor compara sinais apenas de forma agregada:

- **convergência:** perspectivas independentes descrevem comportamento semelhante;
- **divergência:** experiências diferem por papel, unidade ou etapa do fluxo;
- **assimetria de visibilidade:** uma função não consegue observar consequência ou
  decisão que deveria orientar seu trabalho;
- **assimetria de poder:** pessoas reconhecem o problema, mas não conseguem mudar
  prioridade, política ou estrutura;
- **variação saudável:** práticas diferentes resolvem adequadamente o mesmo risco.

O relatório apresenta a divergência como finding do sistema. Nunca mostra “o QA
disse X” quando isso puder identificar alguém.

## Modelos de referência

Tuckman, Team Topologies, DORA, SRE, DDD, TOGAF, Well-Architected e conhecimento
quantitativo servem para formular hipóteses e interpretar sinais. Familiaridade com
os nomes não é requisito. Um gestor pode demonstrar boa leitura de dinâmica de time
sem citar Tuckman; alguém pode citar percentis e ainda tomar decisões ruins diante
de ruído e incerteza.

## Resultado

O relatório sintetiza capacidades no nível elegível da hierarquia, atribui o
gargalo ao escopo mais plausível e diferencia:

- comportamento maduro e sustentável;
- prática local ainda frágil;
- conhecimento sem autonomia para agir;
- ausência de competência acessível ao fluxo;
- processo sequencial com linguagem ágil;
- controle de governança proporcional e habilitador;
- controle que apenas transfere responsabilidade ou cria espera.

