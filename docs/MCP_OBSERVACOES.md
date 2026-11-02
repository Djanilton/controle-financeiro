# MCP: comparação candidata por observações — 02/11/2026

## Contrato confirmado e consequência

A resposta oficial às 12 perguntas, fornecida pelo usuário nesta tarefa, confirma: **não há snapshot estável, histórico confiável de exclusões ou cursor incremental oficial**. Consistência matemática de páginas, filtros, contagens ou totais não cria essas garantias. Não há substituição integral segura de uma janela usando somente MCP nas condições atuais. Não repetir consultas para tentar fabricar consistência.

O modo MCP agora produz somente propostas em uma cópia. Uma ocorrência não observada permanece íntegra, classificada `NOT_OBSERVED_PRESERVED`; nunca vira exclusão, cancelamento ou conflito por ausência. Identidades conhecidas podem propor atualização; inclusões exigem identidade, vencimento, dinheiro e vínculos comprovados. Conflitos mantêm toda a candidata transacional igual à origem. Excel continua um fluxo independente de substituição controlada com os três relatórios, controles independentes e revisão humana. Selecionar Excel junto com MCP é rejeitado.

Consulta MCP direta e aplicação/importação automática do pacote antigo estão desabilitadas. Nenhum código novo executa rede, autenticação, detalhes em lote ou repetição. PoC, OAuth e PIN não foram alterados. O bloqueio de conciliação, assinatura da base, cópia anterior e ETag da revisão permanecem; não existe ação de ativação.

## Captura local, não um schema oficial novo

`minhas-financas-observations-v1` é **um envelope local de captura/revisão**, não um formato prometido pelo fornecedor. Contém `profileId` string, `queries[]` com ferramenta, solicitação e páginas originais, e `details[]` com ferramenta, solicitação e resposta individual. Não converte arquivos antigos em provas de chamadas que não foram capturadas.

```json
{
  "schema": "minhas-financas-observations-v1",
  "profileId": "perfil-sintetico",
  "queries": [{
    "tool": "search_transactions",
    "request": {"profileId":"perfil-sintetico","dateReference":"due","startDate":"2026-10-01","endDate":"2026-10-31","limit":50,"offset":0},
    "pages": [{"request":{"profileId":"perfil-sintetico","dateReference":"due","startDate":"2026-10-01","endDate":"2026-10-31","limit":50,"offset":0},"payload":{"structuredContent":{"data":{"items":[]},"querySummary":{"dateReference":"due"}}}}]
  }],
  "details": []
}
```

O exemplo vazio não comprova ausência de transações. `details` deve conter `tool=get_transaction_details`, solicitação com `profileId`, `transactionId`, `type`, `month`, e resposta com `data.profile.id`, `data.type`, `data.month`, `data.transaction.id/profileId`. A identidade deve coincidir com a solicitada e com a observação. `run_report(includeDetails=true)` não substitui esse objeto completo. Não buscar detalhes sem necessidade e autorização.

Aceita JSON-RPC `result`, `structuredContent` ou JSON em `content` textual; se ambos forem fornecidos devem ser iguais. Erros usam códigos fixos sem copiar mensagens privadas para logs. O caminho de lista reconhecido é `data.items`/`data.transactions`; outros layouts permanecem bloqueados, sem adivinhação. Capturas locais não provam autenticidade do servidor.

## De/para vigente

| Evidência MCP | Proposta Controle Financeiro | Regra / limite |
|---|---|---|
| perfil + tipo + ID + occurrenceMonth + splitId opcional | `minhasFinancas` e chave composta | Strings opacas; mês explícito YYYY-MM. Não converter IDs numéricos nem derivar mês de pagamento/data. |
| `data.transaction.dueDate` | `dueDate` | Somente calendário YYYY-MM-DD válido; sem fallback de date/referenceDate. Legados/timestamps ficam em conflito, não são aproximados. |
| `effectiveDate` | `paymentDate` | Calendário válido quando disponível; null explícito limpa a data proposta, ausência/formato desconhecido conserva a anterior com evidência desconhecida. Nunca determina situação. |
| `createdAt` | `postedDate` | Cadastro/lançamento; calendário reconhecido, timestamps preservados sem truncamento. Não presumir UTC/fuso. |
| `referenceDate` / `date` | Original privado | Referência da consulta, não vencimento nem competência da ocorrência. |
| `presentationAmount` | `amount` e `cashAmount` assinados | Equivalente na moeda-base; não é obrigado a coincidir com amount nativo. Sem inversão de estorno/receita negativa. |
| `amount`, `fullAmount`, `value` | Originais privados | Unidade maior confirmada, finalidades diferentes. fullAmount pode conter encargos/descontos; não substituir presentationAmount por fallback. |
| `monetaryProjection.native.{minor,currency,scale}` | Originais privados | Moeda/escala nativas separadas da base; não assumir equivalência com data.currency/metadata.currency/transaction.currency. |
| `baseCurrency`, `baseScale`, status do campo, `finalMinor` | Validação monetária | Modelo atual BRL/2. Exige valor fornecido compatível, complete=true, hasEstimates=false, finalMinor não nulo e estado definitivo do campo. Sem recalcular FX. |
| `completed` boolean nos detalhes | Efetivada/Pendente | Ausência/null gera conflito; status textual variável e effectiveDate não são prova. |
| `account.id`, `originAccount.id`, `destinationAccount.id` | `account` / `destination` com vínculo explícito | Reaproveita vínculo remoto já estabelecido ou seleção humana de conta local. Não associa pelo nome. Transferência é uma linha, com contas distintas. |
| recurrence N/F/M em despesas | Avulsa/Fixa/Parcelada | Não inferir série. |
| recurrence N/M/P em receitas/transferências | Avulsa/Fixa/Parcelada | Tabela diferente da despesa. |
| originId | `minhasFinancas.originId` | Não usar como ID de ocorrência nem afirmar que seja seriesId. |
| installmentNumber / installmentsCount | `installments` | Ambos inteiros coerentes; ausência fica desconhecida; campos parciais geram conflito. |
| divisões, cartões, categorias | Preservados nos originais e nos campos locais anteriores | Referência explícita a cartão sem vínculo comprovado e múltiplas divisões sem mapeamento comprovado bloqueiam; nenhuma reconciliação nova de cartões/categorias é afirmada. |

**Limitação monetária importante:** o formato exato de `monetaryStatus` e da projeção por campo não foi fornecido nessa resposta de suporte. O adaptador reconhece conservadoramente `transaction.monetaryProjection` com `baseCurrency/baseScale/complete/hasEstimates/finalMinor` e `transaction.monetaryStatus.presentationAmount` (ou `monetaryProjection.monetaryStatus.presentationAmount`) igual a `confirmed`/`definitive`. Essas são formas suportadas e testadas sinteticamente, **não confirmação de que o servidor real as emita**. Layout/enum diferente continua bloqueado. Uma projeção apenas agregada não confirma cada ocorrência. knownMinor e projectedMinor nunca substituem finalMinor. O fornecedor arredonda por operação, empates afastados de zero; o adaptador não arredonda nem refaz câmbio, apenas preserva e verifica resultados fornecidos. Base diferente de BRL/2 exige evolução explícita do modelo, não conversão aproximada.

Originais de item, detalhes, contexto (incluindo moeda externa ao transaction), solicitação e campos anteriores de sourceFields ficam somente no relatório/candidata privados. Estados ABSENT/NULL/UNKNOWN/PRESENT e formatos de data são preservados; falhas têm código específico. Valores inválidos nunca viram zero. Nenhum original privado pertence ao GitHub ou aos logs.

## Identidade, proteção e limites

- ID local já vinculado é mantido. Mesmo ID em outros tipos/meses é outra ocorrência. originId não substitui ID da ocorrência.
- Identidade remota duplicada localmente gera conflito. Observação repetida idêntica é deduplicada; observações diferentes da mesma identidade geram conflito, sem escolher a última.
- Possível correspondência Excel ou outra origem no mesmo tipo/vencimento/contas exige revisão humana; uma captura parcial não prova unicidade global. Não há associação retroativa automática por descrição/valor. Uma interface para confirmar individualmente vínculo de ocorrência Excel ainda é pendente.
- Preservam-se histórico anterior a 01/10/2026 por vencimento, manuais, edições locais, projeções, financiamento, investimento, construção, FGTS e demais fontes protegidas. Não mover registro local de fora da janela silenciosamente.
- `nextOffset` determina o próximo pedido capturado; filtros devem permanecer iguais. Páginas posteriores ao encerramento, cursores inválidos e filtros contraditórios bloqueiam. Falta de páginas/metadados ou contagens mudando indica parcialidade/mutação; nunca remoção.
- Busca até 50 itens/página; relatório até 100, 24 competências e 100 mil itens por consulta. Capturas parciais são observações, não cobertura completa.
- Planejador puro de orçamento exige plano e consumo explicitamente informados. Sync 500/dia e 3000/mês; Sync Bank 1000/6000; Sync Bank Pro 2000/10000. Não identifica plano, não verifica saldo remoto e não executa chamadas.

## Interface, recuperação e exportação

Importações oferece comparador MCP de arquivo local, vínculos explícitos de contas, propostas, conflitos e número de não observados preservados. Controles de cobertura/completude são somente Excel. Relatórios mensais antes/depois são da cópia local, não totais globais do fornecedor. A revisão tem snapshot=false, complete=false, replacementAllowed=false e applyAllowed=false.

A exportação MCP de candidata usa wrapper `mcp-observation-candidate-review-v1`, não backup ativável schema=1. Revisão recuperável mantém assinatura da base, undo e candidata. Revisões antigas de **substituição MCP** são rejeitadas; nenhum arquivo é apagado. Recuperação de observações exige IDs anteriores presentes, manuais intactos e protegidos preservados. Desfazer só troca a cópia. Fluxo Excel e suas revisões permanecem independentes.

## Validação e próximo passo

Testes sintéticos cobrem 12 meses, moedas/escalas/sinais, montante nativo distinto do apresentado, estimativas/null, ausência de datas, datas de calendário e timestamps, recorrências oficiais, parcelas, transferências, identidade composta, mudança/desaparecimento de páginas, preservação dos não observados, proteções, orçamento, recuperação e 30 mil ocorrências. Chromium verifica fluxo Excel, bloqueio do importador antigo e comparação MCP, vínculo explícito, exportação não ativável, mobile e base ativa intacta.

**Não validado com fonte real nessa etapa:** formatos concretos de datas legadas, enums/layout monetário por campo, captura completa do contrato real no envelope local, vínculos privados de contas/ocorrências, capacidade do Windows e custo efetivo por plano. Nenhuma consulta real foi executada.

Próximo passo mínimo: esclarecer/documentar o layout monetário por campo e os formatos de data efetivamente retornados; implementar a captura autorizada no envelope local sem inventar evidência; preparar catálogo de contas e revisão de vínculos. Planejar 12 meses via run_report respeitando seus limites e buscar detalhes só quando necessário e autorizado. Produzir **propostas observacionais**, nunca substituição completa pelo MCP. Primeira aplicação financeira requer projeto separado com revisão humana, backups, ETag e autorização; não faz parte do PR atual.

### Medições desta revisão

329 testes Node aprovados; oito scripts Chromium (incluindo três cenários de sessões de construção) aprovados. Ensaio final de 30 mil observações em Chromium Linux: prévia 4,807 s; revisão exportada 1,832 s; recuperação 0,485 s; RSS agregado máximo amostrado 1.639.592 KiB (~1,56 GiB), heap renderer máximo 198.711.064 bytes. Fonte sintética 38.213.433 bytes, revisão 92.979.427 bytes; base ativa intacta e bloqueio ativo. RSS é soma dos processos, não só heap JS, e a amostragem pode perder picos.

No benchmark Node da segunda carga, um defeito de custo quadrático foi demonstrado no índice de contas: guardava o mesmo vínculo para cada ocorrência e recriava Set de milhares de entradas a cada linha. Set por ID remoto elimina somente repetições desse índice, mantendo todas as transações/originais. Tempo 24.106,8 → 4.848,4 ms, hash da candidata idêntico, undo igual. maxRSS 903.696 → 930.728 KiB: não se comprovou economia de RSS. Não comparar como melhoria de memória com o benchmark antigo de substituição, cujo contrato e tamanho da massa eram diferentes. Exportação/parse/clones ainda dominam memória; Windows não medido. Testes negativos de vínculos divergentes e edições locais permanecem aprovados.

A revisão negativa também comprovou que uma referência explícita a cartão poderia ser conservada somente no original sem bloquear uma inclusão. Corrigido: CARD_LINK_UNCONFIRMED bloqueia a proposta até existir mapeamento de cartão; fontes remotas explicitamente ligadas a financiamento/investimento/construção/FGTS/contracheque/projeção são igualmente bloqueadas, além da proteção dos registros locais. Não há classificação por descrição.

## Preparação da captura local — 02/11/2026

PoC privada **2026.11.02.1**, isolada do PR: diário em memória das solicitações exatas de ferramentas e respostas JSON realmente recebidas, antes da interpretação de campos financeiros. Exporta o envelope local acima por POST, com Host/Origin/CSRF e checkbox específico de autorização para arquivo financeiro sensível. Não há download por GET nem salvamento financeiro automático. O diagnóstico sanitizado permanece separado em `_mcp_diagnosticos`; não colocar capturas nessa pasta nem no GitHub/suporte.

Tokens, credenciais, cabeçalhos, sessão, PIN, recuperação e URLs não entram na captura. Erros de ferramenta não viram observações; texto JSON passa pelo mesmo filtro. Campos financeiros desconhecidos/nulos e tipos originais são mantidos sem normalização. Memória retida pode ser exportada mesmo após expiração do token, sem bearer(), refresh ou nova chamada. O formato pode ser aceito estruturalmente e ainda gerar conflitos legítimos de vencimento/dinheiro/vínculos; exportar não confirma esses campos.

**Bloqueio vigente:** transporte de produção da nova PoC bloqueia OAuth/consultas reais por padrão, sem controle de reativação na interface desta entrega. Qualquer consulta futura exige autorização separada. `CAPTURE_NOT_RETAINED` não autoriza reconstruir solicitações pela interface, inventar respostas ou consultar de novo. A versão antiga não guardava todos os argumentos originais; troca de processo/atualização não preserva memória nem OAuth. Não foi declarado reaproveitamento de sessão antiga no Windows.

Diagnóstico real sanitizado da versão 2026.10.29.2 lido sem novas consultas: dueDate/createdAt/referenceDate string TEXT_UNMAPPED; effectiveDate null; account objeto com id/description string; recurrence string; installmentNumber inteiro; monetaryProjection objeto com status string; moedas em data/metadata string. O vocabulário antigo omitia native/baseScale/completed/originId, portanto não permite concluir ausência desses campos reais. Coletor/matriz novos incluem esses nomes, sempre sem registrar valores. monetaryStatus e conteúdo exato dos campos monetários continuam não confirmados.

**Validação:** 215 testes Python com sockets não loopback bloqueados, incluindo 12 de captura e teste contra o comparador real deste PR; 23 cenários Chromium (2 captura/bloqueio, 20 detalhes, 1 diagnóstico) aprovados com fontes sintéticas. A integração mantém base original, não observados, ausência de exclusões e applyAllowed/replacementAllowed=false. Instalação assinada 2026.10.30.1→2026.11.02.1, início/encerramento e rollback aprovados em diretórios temporários Linux com configuração sintética idêntica; PowerShell/Edge físico não foi executado.

Atualização publicada somente na origem privada `_mcp_atualizacoes` da pasta permanente existente, com sequência 4, assinatura e hashes; arquivos/configurações e versões antigas preservados. O usuário utiliza **Atualizar Minhas Finanças MCP.cmd**, sem ZIP manual nem instalação paralela. A gravação na nuvem e a releitura do manifesto foram verificadas; isso não comprova sincronização/instalação no disco Windows. Guia privado `CAPTURA_PRIVADA.md` disponível na mesma pasta. Quando houver evidência elegível em memória, marcar consentimento e clicar **Salvar captura financeira privada existente**, escolhendo pasta privada local, preferencialmente fora do OneDrive. Sem memória elegível, parar sem nova consulta. A PoC não envia a captura a serviços externos.

CI deste PR valida somente aplicativo/documentação. Código, instalador e testes Python da PoC permanecem fora do repositório público e foram testados separadamente, não apresentados como CI público da PoC.
