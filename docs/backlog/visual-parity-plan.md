# Plano: paridade visual com o protótipo

Referência visual vigente: Design Graph `anaminese_maturity_v3`
(espelho `maturity`) **e** o standalone
`Workspace/prototipos/Anamnese de Tecnologia v3.html`. O Graph descreve
o standalone; quando divergirem, prevalece o HTML standalone. Não é
licença para copiar números de exemplo (Orbital, 13%/24%, “Integração
contínua” fixa, Chaos 1%, alvo 45%). Onde o modelo não mede, o bloco
declara lacuna.

## Problema

Quem compara o protótipo com o produto encontra **shells de conteúdo**
(listas, cartões de texto, abas) no lugar de **composições tipadas**
(grades numeradas, chart marks, matrizes autoridade×horizonte, escadas
F0–F5, dual-band de histórico). O mapa foi o primeiro erro de
inventário corrigido; a auditoria de 2026-11-22 mostrou o mesmo padrão
em Ficha, Prontidão, Fronteira, Plano, Histórico e Marcos do
walkthrough.

## Hipótese de resultado

Cada página do relatório, da administração e da entrevista usa os
mesmos blocos visuais do protótipo, preenchidos com a leitura
publicada. Célula sem cobertura continua neutra. Nenhum gráfico publica
o exemplo numérico do protótipo.

## Catálogo completo do protótipo (30 telas)

Fonte: `list_screens` em `anaminese_maturity_v3` + alts do standalone.
Pares (web)/(celular) compartilham a mesma intenção; o produto hoje é
responsivo único, não duas artes.

### Relatório (chrome de 9 itens)

| # | Tela | Componentes (Graph) | Classificação vigente |
| --- | --- | --- | --- |
| 1 | Laudo (+ variante tema escuro) | 15 | Casca + condicionado (Ondas 3–4) |
| 2 | Mapa navegável | 52 | **6a–6b feitos**; 6c–6d abertas |
| 3 | Ficha do nó | 35 | **Déficit estrutural** (não “só CSS”) |
| 4 | Prontidão para práticas avançadas | 15 | **Déficit estrutural** |
| 5 | Fronteira de aprendizado | 20 | **Déficit estrutural** (escada F0–F5) |
| 6 | Plano de tratamento | 17 | **Déficit estrutural** (matriz autoridade×horizonte) |
| 7 | Walkthrough: Operação | 25 | Seções ok; **Marcos/Caminho** subcompostos |
| 8 | Histórico e reavaliação | 24 | **Déficit estrutural** (comparador + bands) |
| 9 | Visão por público | 17 | Campos próximos; falta **DecisãoPolíticaStack** tipado |

### Administração (wizard 1–4)

| Tela | Notas |
| --- | --- |
| Criar projeto | `Projeto`: nome, motivo, **Salvar rascunho**; fieldsets de porte / setor regulado / estágio no markup do protótipo — **domínio não persiste** |
| Estrutura organizacional | Tribo/Squad/`AdicionarSquad` — produto tem cartões; polimento + rótulos |
| Convites e participação | Amostra, lote, células de participação — produto tem lote; polimento |
| Termo de uso | `TermoUsoItem` × cláusulas — aceite formal que trava convites = hipótese de domínio |

### Entrevista (web + celular)

| Tela | Intenção do protótipo | Produto / gap |
| --- | --- | --- |
| Boas-vindas | Anonimato + links (incl. **Como tratamos os dados**) | Link/política ainda não publicados pelo domínio |
| Contexto | **Senioridade na profissão** + **Tempo na empresa** (`Stack2`) | Fora do domínio até contrato |
| Sua perspectiva | Fieldset de perspectiva | Fluxo existe; polimento CapsBold |
| Pergunta de evento | Fieldset + Voltar | Fluxo existe |
| Pedido de exemplo | Field + Link | Fluxo existe |
| Aprofundamento de pressão | Fieldset | Fluxo existe |
| Pergunta de leitura | **LeituraQuadroChartMark** (figura do quadro) | Produto tem figura semanal — validar paridade do ChartMark |
| Conclusão | “Obrigado.” / respostas registradas / pode fechar | Inventário antigo pedia “compromisso de devolução” — **o protótipo não tem esse bloco**; não inventar |

## Menu — vigente

1. Laudo · 2. Mapa · 3. Ficha · 4. Prontidão · 5. Fronteira · 6. Plano ·
7. Área: Operação · 8. Histórico · 9. Visão por público.

Rodapé do protótipo: `Instrumento v21 · modelo m2` **e** `Estimativas
provisórias`. No produto o rótulo v21/m2 **não entra**. Rotas
`/walkthrough/product|engineering|organization` acessíveis, fora do menu.

## Auditoria 2026-11-22 — erros de inventário (além do mapa)

O plano classificava Ficha → Histórico como “só CSS”. O Graph e o
standalone mostram **outra composição**, no mesmo sentido em que o mapa
era dashboard e não abas.

### Laudo — tabela “o que falta” estava obsoleta

Ondas 3–4 já entregaram casca tipográfica, gauge, barra de divergência,
restrição accent, prognóstico em 2 cartões. O que ainda falta no laudo é
polimento fino / prova transversal — **não** reabrir casca como gap
principal.

### Mapa — parcial (6a–6b)

Feito: lead causal, Tecnologia, 4 sistemas, method/notice,
`publishSystemSlices`, grade 4 colunas, índice 32px; Engenharia por
domínio (`publishDomainSlices` / `projectEngineeringDomains`). Aberto:
6c radars; 6d matrizes com % + interpretação.

### Ficha — déficit estrutural

| Bloco no protótipo | Produto hoje | Backend / mensagem |
| --- | --- | --- |
| Trilho numerado 1–N (serif 15) + Grid2 200px\|1fr | `report-block` empilhado sem números de seção | Casca HTML |
| Como está: legenda estágio 0–4; nuvem de **20 pontos** (cenários); 3 colunas por perspectiva com %·faixa·Alvo | Barras `stage-distribution` + texto | Posterior/faixa por perspectiva já parcial; **falta** ChartMark de nuvem + cartões 3 colunas |
| Relatos em grade tipada | Listas “Por perspectiva / Por time” | Conteúdo existe; falta grade |
| O que fazer: cartão accent “Menor experimento” + Cynefin · grau A–D · forma de aprendizado + legenda A–D | Um parágrafo em `ficha-card` | Conduta/cynefin/evidência existem no domínio do plano — **projector da ficha não monta o cartão tipado** |
| ChartMark5/6/7, Alvo, CapsBold path | Ausentes ou texto | Só publicar marcas com posterior |

### Prontidão — déficit estrutural

| Bloco | Produto | Backend |
| --- | --- | --- |
| Cartão prática: título 30px, tag Pronto/Não pronto, **P(pronto) 48px**, trilho, lead | `readiness-card` com `P(pronto)` em texto | `p_k` / band existem |
| Grade pré-requisitos: ○/● · nome · barra · % · rótulo **gargalo** (red-soft) | Lista `p_k` em `<li>` | Checklist existe; falta composição Grid6/Grid7 |
| Nota final: probabilidade nunca vira índice da org | Frase no hero — ok em espírito | — |

### Fronteira — déficit estrutural (não listas)

Protótipo: **escada F0–F5** (Condições humanas → Fluxo e decisão →
Práticas técnicas → Entrega → Operação confiável → Práticas avançadas)
com práticas posicionadas (`ChartMark6`) e stacks de condições humanas.
“Comece por” em Grid4. Produto: três listas Dominado / Pode aprender /
Ainda bloqueado + card “Comece por”. Reclassificar: **substituir listas
pela escada** quando o grafo publicar degraus; listas podem permanecer
como fallback de lacuna.

### Plano — déficit estrutural

Protótipo: matriz **linhas = autoridade** (Direção, Gestão, …) ×
**colunas = horizonte** (0–30 · 1–3 · 3–12), contador “Ativas: N de M”,
setas de dependência, Cynefin em Grid3. Produto: três colunas de conduta
achatadas + pulso + Cynefin em lista. Backend de horizonte/autoridade já
existe em `TreatmentConduct`; **falta projector de matriz**.

### Walkthrough Operação — semi-estrutural

Seções batem com o produto (onde / chegamos / funciona / próxima /
caminho / marcos / riscos / premissas). Gaps: trilho numerado; Alvo no
hero; **Marcos = tabela Prazo \| Marco \| Critério** (produto = bullets);
CaminhoStack/Tag. Não inventar % de índice de Operação do mock.

### Histórico — déficit estrutural

Protótipo: seletor “Leitura anterior”; bloco Tecnologia com **dois % +
bandas comparativas + linha de alvo**; chips de perfil; “Cada
capacidade”; grade Melhorou \| Piorou; Achados; Note Atenção. Produto:
texto P(melhora)/P(piora) + evolução. Comparar duas leituras publicadas
é domínio parcial; **casca do comparador visual falta**.

### Visão por público — composição

Protótipo: path CapsBold + fato; **duas colunas** DecisãoPolíticaStack
(campos Decisão pedida / Política / Investimento / Risco / Acompanhar
vs versão do time). Produto: três blocos direção/time/recorrer em
parágrafos. Estrutura de campos do domínio (`AudienceReading`) é
próxima; falta o stack tipado. **Proibir** gravar CTO/CFO/Orbital como
copy fixa (o mock usa; o produto usa “quem autoriza”).

### Admin / entrevista — confirmações

- Contexto: labels **Senioridade na profissão** e **Tempo na empresa**
  confirmados no Graph (`Stack2`).
- Boas-vindas: **Como tratamos os dados** confirmado.
- Criar projeto: **Salvar rascunho** + motivo; porte/setor/estágio no
  desenho — domínio bloqueia persistência.
- Conclusão: **não** exige compromisso de devolução no protótipo atual.

## Mensagem do protótipo (gramática transversal)

Copiar a **função**, nunca o caso Orbital:

1. **Orientar o olhar** — lead nomeia onde o problema se concentra + CTA.
2. **Método ≠ ranking** — ordem do modelo; eixos/células canônicos.
3. **Cobertura honestidade** — abaixo do mínimo → cinza / “Não avaliado”
   / fora do polígono; **não** zero.
4. **Agregação anônima** — &lt; N: sem linha própria; frase explícita.
5. **Divergência sem juiz** — dois lados + distância; interpreta o sistema.
6. **Problema → lugar → próximo passo** — Ver ficha / Ver prontidão / Ver plano.
7. **Aviso de uso** — sistema de trabalho; não pessoas nem bônus.
8. **Legenda tipada** — losango/faixa/alvo; eixo não avaliado ≠ zero.
9. **Ficha/Prontidão** — “menor experimento” + Cynefin + grau de evidência;
   P(pronto) nunca vira índice da organização.
10. **Fronteira** — degraus e condições humanas em paralelo; não culpa.
11. **Histórico** — mudança só com limiar de P(melhora/piora/estável);
    alvo como referência visual, não meta de bônus.
12. **Público** — mesmo achado; muda a decisão pedida, não a verdade.

## Relatório — o que falta (revisado 2026-11-22)

| Tela | Já existe | Falta (protótipo) |
| --- | --- | --- |
| Laudo | Casca 3 + gauge/barra/prognóstico 4 | Polimento; prova transversal |
| Mapa | 6a overview · 6b domínio | 6c radars · 6d % + interpretação |
| Ficha | Trilha + seções textuais + stage bars | Trilho numerado; nuvem/3 colunas Como está; cartão Menor experimento (Cynefin·grau·forma); grades tipadas |
| Prontidão | `p_k`, band, gargalo em texto | Cartão 48px + grade pré-requisitos com barra/%/gargalo |
| Fronteira | Listas + Comece por | Escada F0–F5 + ChartMark6 + stacks humanas |
| Plano | 3 horizontes + pulso + Cynefin lista | Matriz autoridade×horizonte + Ativas N/M + setas |
| Walkthrough | Seções + trilha | Marcos tabela; CaminhoStack; Alvo; trilho |
| Histórico | Seletor + P(·) + evolução | Comparador Tecnologia (bands+alvo); Melhorou\|Piorou; chips |
| Visão por público | Dois lados + recorrer | DecisãoPolíticaStack tipado (sem CTO/CFO/Orbital) |

## Administração / entrevista — inalterado em espírito

Bloqueios de domínio (porte/setor/estágio/motivo, senioridade/tempo,
política de dados, aceite do termo) antes de UI. Visual dos radios e
fieldsets já especificado no Graph.

## Hipóteses abertas

1. ~~Casca laudo~~ · ~~Gauge/barra/prognóstico~~ · ~~Mapa 6a~~ feitos.
2. Lacunas de prova (banda 50 pts, fixture e2e) — inalteradas.
3. Contexto do projeto + senioridade — domínio antes do green de UI.
4. Escada da fronteira vs listas: a escada é a arte alvo; listas só como
   lacuna se o grafo não publicar posição F0–F5.
5. Matriz do plano: reusar `authority` + `horizon` já no
   `TreatmentConduct`.

## Fora deste plano

- Copiar índices/faixas/alvos do mock.
- Quatro áreas de volta no menu.
- React.
- Calibração / piloto / folhas candidatas.
- Rótulo “Instrumento v21 · modelo m2” no chrome.
- “Compromisso de devolução” na conclusão (não está no protótipo).

## Menor experimento e sequência

Uma tela (ou bloco) por vez, TDD do HTML: presença do bloco + ausência
de Orbital/`13%`/`24%`.

1. ~~Tokens · laudo · marcas célula · mapa 6a · mapa 6b~~.
2. **Mapa 6c → 6d** (fecha o dashboard do mapa).
3. **Ficha estrutural** (trilho + Como está + Menor experimento).
4. **Prontidão** cartão + grade pré-requisitos.
5. **Fronteira** escada F0–F5.
6. **Plano** matriz autoridade×horizonte.
7. **Histórico** comparador visual.
8. Walkthrough Marcos/Caminho · Visão DecisãoPolíticaStack.
9. Admin + entrevista (domínio primeiro).
10. Prova transversal.

## Fundação visual

| Item | Estado |
| --- | --- |
| Tokens + `:root --na` | feito |
| ChartMark célula mapa | feito (Onda 5) |
| Mapa overview 6a | feito |
| Mapa domínio 6b | feito |
| Shell nav 9 + tema | vigente |
| Anti-Orbital/13%/24% | vigente nos testes |

## Sequência de implementação

0–5 · 6a · 6b — feitos.
6c. Radars do mapa — **próximo**.
6d. Matrizes com % + interpretação.
7. Ficha estrutural.
8. Prontidão estrutural.
9. Fronteira escada.
10. Plano matriz.
11. Histórico comparador.
12. Walkthrough Marcos + Visão stack.
13. Admin + entrevista.
14. Prova transversal.
