# Contrato MCP atualizado — preparação independente do PR #8

Base estabilizada: `cc35245960054552966e71da0212cf55e206f528` (PR #8). Branch de evolução: `feat/mcp-contrato-leitura`. Não altera o PR #8 nem o PR #10 da migração; nenhum JSON operacional é movido. Esta etapa não habilita conexão real.

## Evidência e limites

Fonte contratual: esclarecimentos oficiais do fornecedor fornecidos pelo usuário nesta tarefa. As definições de ferramentas disponíveis nesta sessão foram examinadas **como metadados**, sem executá-las: limites/nomes/parâmetros de entrada são compatíveis com a confirmação. Isso não equivale a executar `tools/list` no transporte próprio do aplicativo, que ainda não existe. Não foram usados tokens, sessões ou credenciais do ChatGPT.

`minhas-financas-readonly.js` é um planejador puro com executor **exclusivamente sintético**, não um cliente HTTP/OAuth. Não possui fetch, autenticação, armazenamento, timers, reconexão, escrita ou integração com a base ativa; não é carregado pelos loaders da aplicação. `createSynthetic` não aceita transporte em modo real. A marca synthetic é uma condição de teste, não um isolamento de código arbitrário ou prova criptográfica de transporte: a aplicação não instancia esse cliente. Nenhuma configuração/atalho permite habilitar consultas reais.

Os schemas e caminhos de saída das fixtures são **sintéticos e revisados localmente**, não capturas do fornecedor. O adaptador exige mapping de saída explícito; não adivinha envelopes/caminhos desconhecidos. Schemas de entrada do transporte próprio deverão ser obtidos/revalidados após autenticação futura; a presença desses campos na integração ChatGPT não basta para autorizar outra conexão.

## Matriz de solicitações

| Ferramenta | Controle de atualização | Escopo e limites implementados |
|---|---|---|
| get_credit_card_transactions | Não solicita atualização bancária por contrato; **não enviar** requestUpdateOpenFinance | Perfil, cartão e month explícitos; padrão 100, máximo 200; nextOffset com mesmos filtros até hasMore=false |
| get_installment_series | Não solicita atualização bancária por contrato; **não enviar** requestUpdateOpenFinance | Perfil e ID/tipo/occurrenceMonth de parcela efetivamente recebida; padrão 50, máximo 200; máximo 10.000 registros; originId nunca substitui transactionId |
| get_credit_card_details | **requestUpdateOpenFinance=false obrigatório** | Perfil, cartão e competência explícitos; preservar dados de fatura, fechamento disponível, pagamentos, pendências, estornos e adiantamentos, inclusive valores nulos |
| get_transaction_details | **false obrigatório** | Perfil, ID/tipo/mês exatos, sem fallback ou nova busca automática |
| search_transactions | **false obrigatório** | Perfil e período explícitos por vencimento; máximo 50/página; sem filtros adicionais nesta preparação |
| run_report | **false obrigatório** | Consulta ampla abaixo; máximo 100 detalhes/página, 24 competências e 100 mil ocorrências |

O catálogo `tools/list` injetado deve anunciar cada parâmetro e seu tipo; capacidade booleana ausente para as quatro ferramentas com controle bloqueia. Parâmetros inesperados/requeridos desconhecidos, enum incompatível ou perda/inclusão de argumento no recibo do transporte bloqueiam sem fallback. O recibo contém somente ferramenta/argumentos, nunca cabeçalhos/tokens; é evidência estrutural de teste, não autenticação do servidor ou prova do fio real. Resposta contradizendo false/ausência de refresh também bloqueia. HTTP, JSON-RPC, ferramenta, timeout ou sessão expirada não provocam repetição/reconexão.

## Paginação e identidade

Cada página deve confirmar perfil e, para faturas, cartão/competência por caminhos revisados. A referência de série deve coincidir com a ocorrência escolhida de uma captura recebida; a seleção não pode sobrescrever ID/perfil/tipo/mês. IDs e splitId são strings opacas; chave: perfil + tipo normalizado + ID + mês explícito + divisão opcional. Nada é derivado de date/originId/nome/descrição.

Há bloqueios para páginas ausentes, gaps, cursores repetidos, metadados contraditórios, duplicidade de identidade, totais/escopo/resumo mudando entre páginas e limites excedidos. Sem versão/snapshot oficial, alterações invisíveis ainda podem ocorrer: mesma contagem e mesmos totais não provam estabilidade. `paginationObservedEnd` não equivale a `complete`/snapshot. Nenhuma ausência vira exclusão, e nenhum transporte REST/stdio cria garantia de snapshot.

Séries preservam exatamente os registros recebidos, incluindo deleted, completed, originId, números/quantidades, valores e meses. declaredCount não gera linhas; uma lacuna não é preenchida com parcela inventada. Totais da série incluem registros excluídos conforme o fornecedor; não reutilizar esses totais como pendências ativas. Adiantamento sem natureza comprovada fica em revisão; não se presume que todo adiantamento seja pagamento.

## Datas e faturas

| Campo | Semântica |
|---|---|
| month na consulta de cartão | Competência da fatura selecionada |
| date do item | Compra/ocorrência; não é vencimento |
| dueDate do item | Vencimento do lançamento |
| invoice.dueDate | Vencimento da fatura, não de cada compra |
| ocorrência selecionada para série | Mês original da parcela, não filtro da série inteira |

A fatura Itaú original continua fonte independente. A captura nova pode ser convertida para `card-invoice-capture-v1`, reutilizando o mapeador e comparador existentes; caminhos, sinal, moeda, escala e natureza precisam de revisão explícita. O resumo da fatura fica preservado como evidência, sem transformar seu total em valor individual. `invoiceTotals` compara uma única vez o total escopado com as linhas assinadas cuja semântica foi mapeada, excluindo pagamentos (incluindo antecipados **identificados** como pagamento). Não soma o pagamento às compras. Valores/moedas desconhecidos, transferência tratada como despesa, adiantamento não classificado ou registros excluídos na lista de fatura bloqueiam o total; nulo não vira zero. Totais coincidentes não autorizam cobertura/substituição.

## Dinheiro por ocorrência

No formato confirmado, monetaryProjection.equivalentMinor é inteiro **em texto**, status é `confirmed`, pendingReason é explicitamente null, baseCurrency/baseScale são válidos. A projeção deve estar dentro dos detalhes da mesma ocorrência, com perfil/tipo/ID/mês confirmados. BRL/2: `"12345"` corresponde exatamente a R$ 123,45. Validação inteira/BigInt e round-trip decimal impedem arredondamento/overflow; não se convertem strings decimais, números aproximados ou nulos em valores.

O modelo financeiro atual aceita proposta em BRL/2; outra base/escala permanece bloqueada. A projeção confirmada recebida pode trazer moeda nativa diferente: preserva-se o equivalente já calculado pelo fornecedor, sem recalcular câmbio. amount, fullAmount e presentationAmount permanecem originais com finalidades distintas; nenhum é fallback para equivalentMinor. Valores ausentes/nulos/desconhecidos continuam distintos.

Cobertura `detail.transaction` em data/metadados é corroborada e confrontada com o mesmo valor; cópias não são somadas. complete=false, hasEstimates=true, pendingNative não vazio, finalMinor nulo/divergente ou estado não confirmado no escopo individual bloqueiam. Cobertura agregada sem vínculo individual não confirma nem substitui o valor da ocorrência. O valor canônico e a identidade fornecem a prova individual; flags/totais agregados isolados não fornecem. Sinais são preservados, inclusive despesa negativa/estorno e receita negativa/compensação. `completed` continua a única indicação booleana usada para situação; dinheiro confirmado não torna transação paga.

Tipos oficiais de saída `expense`, `income`, `transfer` são reconhecidos. Recorrências: despesa N/F/M = avulsa/fixa/parcelada; receita/transferência N/M/P = avulsa/fixa/parcelada. originId, parcela e rateios permanecem evidências originais; vínculos locais de contas/cartões e proteção de investimentos continuam obrigatórios. detailsOnly ainda gera **somente relatório de mapeamento**, zero propostas.

## Extração ampla por vencimento

Plano estrito para run_report: perfil e startDate/endDate explícitos; type=transactions, dateReference=due, includeDetails=true, status=all, recurrence=all, summedOnly=false, debitOnly=false, alwaysBringOverdue=false, requestUpdateOpenFinance=false. Não enviar reportFilterId, filtros salvos ou seleções adicionais. Percorrer nextOffset até hasMore=false respeitando 24 competências/100.000 ocorrências. Linhas continuam resumidas; detalhes individuais serão obtidos apenas para campos necessários e com autorização específica. Não consultar automaticamente milhares de detalhes nem gerar parcelas faltantes.

Este plano não libera substituição MCP. O motor candidato continua independente: Excel completo + controles independentes + janela selecionável **por vencimento**, corte histórico, fontes protegidas, backup/ETag/revisão; sem aplicação automática. Nenhuma mudança no motor de substituição Excel nesta branch.

## Requisitos para habilitar consulta real

1. Implementar/revisar transporte próprio e OAuth: cliente registrado, PKCE S256, state, callback exato, tokens apenas em memória segura fora de capturas/OneDrive, escopo de leitura suportado. Validar CORS/sessão MCP/cabeçalhos no ambiente do aplicativo; backend privado se o navegador não puder atender esses requisitos. Sem credenciais ChatGPT ou reaproveitamento de token Microsoft.
2. Obter tools/list pelo transporte próprio; validar nomes, schemas e a transmissão serializada efetiva. Comprovar a política de ausência de refresh da conexão, sem retries/fallbacks.
3. Validar caminhos de resposta com captura mínima autorizada; preservar originais e tratar PROFILE_LOCKED com desbloqueio somente na página oficial, sem capturar PIN. Sessão expirada/NOT_FOUND/limite interrompem o fluxo.
4. Planejar orçamento de chamadas/limites e consentimento por perfil/cartão/competência, incluindo paginação e eventuais séries/detalhes realmente necessários. Não habilitar o botão pela existência de um schema ou de mocks aprovados.
5. Regerar a comparação sobre a fatura bancária já salva e registrar nova revisão local com os mecanismos existentes. Marcas anteriores, resolvidas/persistentes/novas e ambiguidades devem ser validadas nesse fluxo integrado antes de ativar a interface.

O botão permanece desabilitado, preservando cartão local, perfil/cartão remotos quando conhecidos e mês. O impedimento atual é autenticação/transporte e validação de saída/integrada, **não** falta de garantia contratual de ausência de atualização bancária nas duas listagens. Nenhuma chamada real foi feita.
