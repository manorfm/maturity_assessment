# Escopo e conclusão do MVP

**Status: concluído na versão 0.4.0 em 2026-08-25.**

O MVP é considerado concluído quando uma organização consegue executar um piloto
completo sem acesso direto ao banco ou alteração de código.

## Critérios obrigatórios

1. ✅ Criar projeto e hierarquia organizacional configurável.
2. ✅ Gerar convites únicos por unidade e perfil, sem coletar identidade.
3. ✅ Acompanhar lotes por estados agregados, revogar links ainda não usados e
   reemitir um lote sem recuperar tokens antigos.
4. ✅ Impedir participação duplicada e não revelar respostas após conclusão.
5. ✅ Executar grafo versionado, ramificado e adaptado ao perfil.
6. ✅ Produzir findings globais e hierárquicos com limiar e supressão de partições.
7. ✅ Triangular perspectivas somente entre grupos elegíveis.
8. ✅ Disponibilizar telas e API JSON para o fluxo administrativo principal.
9. ✅ Aplicar migrações incrementais sem destruir bancos existentes.
10. ✅ Passar por tipagem estrita, testes de domínio/integração/HTTP, build e revisão
    de vazamento de erros ou segredos.

Funcionalidades como SSO, editor visual, benchmarks, integrações externas e
questionário amplo continuam pós-MVP. Elas não impedem um piloto do método.

## Regra de declaração

O histórico só registra “MVP concluído” quando todos os critérios acima estiverem
implementados e verificados. Evoluções posteriores não alteram retroativamente
esta linha de base; mudanças de escopo devem gerar uma nova etapa do produto.
