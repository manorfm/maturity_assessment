# API administrativa do MVP

A API JSON reutiliza os mesmos serviços de aplicação das telas. Ela não expõe
respostas individuais, hashes, tokens antigos ou contagens por alternativa. O
relatório inclui capacidades direcionais globais e por recorte elegível, sempre
submetidas ao mesmo limiar e à supressão hierárquica das telas. Cada capacidade
inclui nível, intervalo compatível com as evidências, quantidade agregada de
observadores e sinais e indicação de contradição. O campo numérico de confiança
permanece na API para diagnóstico e pesquisa, mas a interface o traduz em
diversidade de perspectivas, precisão do intervalo e concordância; ele não é
apresentado como probabilidade de a nota estar correta.
O relatório também inclui classificação sociotécnica global e por unidade elegível,
com nível, rótulo e capacidades ou unidades limitantes.
O objeto `areas` agrupa os problemas por capacidade e informa `diagnosis`,
`correction`, evidência agregada e se o padrão representa comportamento ou
restrição. O mesmo formato existe nos recortes hierárquicos elegíveis.
`capabilityGroups` expõe a árvore recursiva usada pelos radares; cada ramo inclui
nível limitante, intervalo, observadores, evidência, contradição e filhos
observados.

Cada finding também expõe `cause`, `priority`, `recommendationEvidence`,
`experiment`, `foundation`, `affectedCapabilities`, `solutionCapability` e
`solutionReadiness`, além de `priorityFactors` (`intensity` e `reach`), `mechanism`, `containment`,
`missingEvidence`, `impacts`, `severity`, `decisionAuthority` e `prescription`.
Também expõe `causalAnalysis`, com versão do conhecimento, hipótese em linguagem
natural, alternativas concorrentes, evidências favoráveis e contrárias agregadas,
lacuna e limitação. Identificadores internos de padrões não aparecem nessa projeção.
Quando decisão e consequência estão trianguladas, `causalAnalysis` pode incluir
`sociotechnicalPattern`: tipo virtuoso/vicioso, racionalidade local, efeito,
reforço hipotético, incentivo, fronteira decisória, compensação, evidência e limite
de escopo. A ausência desse campo significa que o ciclo ainda não é publicável.
Um finding elegível pode incluir `technicalDirection`, com biblioteca,
prática-alvo, técnicas, habilitador, famílias opcionais, pré-condições, limite,
custo/risco, experimento, indicador, critério e fundamento. O campo é omitido se
o mecanismo ainda estiver em investigação ou a capacidade de solução não tiver
sido demonstrada ao menos como declarada.
`prescription.status` informa se uma intervenção condicionada está pronta ou se o
finding exige investigação causal. A prontidão diferencia capacidade não demonstrada, apenas
declarada, local, operacional e adaptativa sem afirmar inexistência a partir de
silêncio. A evidência informa somente totais agregados, padrões,
camadas e perspectivas; nunca IDs. `foundation` declara fonte e princípio da
intervenção e não pontua. `confidence` é um valor interno do posterior especialista
na aderência da intervenção e não deve ser interpretado como estágio de capacidade, apoio
popular ou probabilidade calibrada. A interface publica somente uma força
qualitativa da hipótese até existir calibração empírica suficiente.
`recommendationEvidence.strength` separa convergência, amplitude populacional,
diversidade de perspectivas, cobertura causal e o estado executivo da evidência.
O relatório sanitizado também inclui `visibilityGaps` (perspectivas que atingiram o
limiar e relataram “não observo”), `previousMeasurement` (delta de suporte de
padrões entre capturas) e `calibration` (limiares pré-declarados, contagem de
rótulos cegos, gate e bloqueios), sem identificação individual. Entrevistas
cognitivas do instrumento são registradas nas telas administrativas, sem
participação ou identidade, e só aparecem em `calibration` como contagem e totais
de problemas observados. Além de compreensão, encaixe, sobreposição, recuperação e
viés de resposta, os totais cobrem reconhecimento de autonomia, utilidade,
segurança e explicação do fundamento.

`transformationPortfolio` existe no relatório global e em cada item de `scopes`.
Sua versão vigente é `transformation-portfolio-v1`; `sequence` contém passos
ordenados com fase, autoridade, contenção, dependências, pré-condições,
incompatibilidades, custo, risco, reversibilidade e risco deslocado. `conditioned`
preserva os problemas cuja intervenção depende de investigação adicional. Essa
projeção deriva dos mesmos findings e não executa inferência paralela.

`audienceReports.version` é `audience-report-v1`. No relatório global,
`executive` contém decisões organizacionais, restrições compartilhadas, resultados
ameaçados e os passos correspondentes; `technology` contém restrições sistêmicas,
domínios técnicos e sua sequência; `specialist` preserva os findings e separa os
que ainda exigem investigação. Cada item de `scopes` possui `audienceReport` com
ações locais, restrições recebidas, escaladas e a sequência daquele recorte. Todos
os itens reutilizam padrões e passos já publicados no relatório.

Cada hipótese causal expõe `observability`, população agregada (`support`,
`applicable`, quantidade de perspectivas e camadas) e `nextQuestion`. Este último é
`null` quando não existe discriminador contextual elegível.

## Autorização

Ao criar um projeto, a API retorna `adminToken` uma única vez. As demais operações
administrativas exigem:

```http
Authorization: Bearer <adminToken>
```

Falhas de autenticação retornam `404` para não confirmar a existência do projeto.
O header e as URLs são removidos dos logs estruturados.

## Operações

- `POST /api/projects` — cria projeto e hierarquia;
- `GET /api/projects/:publicId` — retorna unidades, lotes e relatório sanitizado;
- `POST /api/projects/:publicId/invitation-batches` — cria lote exclusivamente para
  uma unidade folha, sem perfil pré-definido, e retorna links uma única vez;
- `POST /api/projects/:publicId/invitation-batches/:batchId/revoke` — invalida links
  ainda disponíveis, sem afetar participações iniciadas;
- `POST /api/projects/:publicId/invitation-batches/:batchId/reissue` — cria uma única
  substituição para links revogados ou expirados.

## Erros

Erros usam o mesmo envelope, sem detalhes internos:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Não foi possível validar os dados informados.",
    "requestId": "req-1"
  }
}
```

JSON malformado retorna `REQUEST_ERROR`; falhas inesperadas retornam mensagem
genérica e são registradas apenas no servidor.
