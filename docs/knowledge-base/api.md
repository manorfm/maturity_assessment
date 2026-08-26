# API administrativa do MVP

A API JSON reutiliza os mesmos serviços de aplicação das telas. Ela não expõe
respostas individuais, hashes, tokens antigos ou contagens por alternativa. O
relatório inclui capacidades direcionais globais e por recorte elegível, sempre
submetidas ao mesmo limiar e à supressão hierárquica das telas. Cada capacidade
inclui nível, confiança, volume agregado de sinais e indicação de contradição.

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
- `POST /api/projects/:publicId/invitation-batches` — cria lote para uma unidade,
  sem perfil pré-definido, e retorna links uma única vez;
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
