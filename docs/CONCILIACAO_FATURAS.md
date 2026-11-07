# Conciliação privada de faturas — revisão sem escrita

## Escopo implementado

Área independente **Conciliação de faturas**, na branch do PR #8. Arquivos lidos no navegador por ação explícita; nenhuma consulta MCP, chamada Graph, persistência financeira ou aplicação. Descartar revisão libera as referências da tela, sem apagar arquivos ou bases. Exportação JSON privada somente após consentimento próprio; contém dados financeiros e não deve ser enviada ao GitHub. A conciliação não remove o bloqueio da atualização candidata e não oferece operações de correção no Minhas Finanças.

Selecionar cartão (identificador local de revisão; sugestões dos cartões já carregados), mês **de vencimento** e moeda. O vínculo entre o cartão remoto e esse identificador precisa ser revisado; nomes iguais não constituem vínculo. Cada comparação cobre um cartão/mês. Arquivos de outros cartões/meses são recusados. É possível revisar outras faturas separadamente; ainda não há consolidação automática de várias faturas.

## Formatos bancários

- **CSV:** leitor local com delimitador explícito `;`, `,` ou tabulação, aspas, aspas escapadas e linhas internas. Cabeçalhos duplicados bloqueiam leitura. Mapear explicitamente colunas em “Mapeamento explícito dos arquivos”.
- **XLSX:** reutiliza o XLSX já embarcado no aplicativo; exige uma aba e o mesmo mapeamento do CSV. Datas Excel seriais, formatos brasileiros e células com fórmula sem valor comprovado não são convertidos por aproximação. Nesta primeira versão os campos de data mapeados precisam de `YYYY-MM-DD`; números inválidos permanecem inválidos, não zero. Não avalia fórmulas.
- **OFX:** subconjunto estrito de extrato **de cartão** `CREDITCARDMSGSRSV1`, uma única resposta `CCSTMTRS`/conta `CCACCTFROM`, transações fechadas `STMTTRN`, moeda `CURDEF`; `ACCTID` precisa coincidir com `ofxAccountId` explicitamente revisado no arquivo. Rejeita OFX de conta, entidades/DOCTYPE e arquivo truncado. `FITID` é ID bancário, não ID remoto MF. `DTPOSTED` é **processamento**, nunca compra/vencimento. Sinal de `TRNAMT` exige revisão (`ofxChargeSign: negative|positive`). Mapear `TRNTYPE` explicitamente: `DEBIT` pode ser compra somente após confirmação; `CREDIT` não distingue pagamento de estorno sozinho e fica desconhecido até revisão. Outras variantes OFX necessitam validação de layout. Não usa saldo bancário como total da fatura.
- **PDF:** bloqueado. Os parsers existentes de contracheque/FGTS não validam faturas de cartão. Necessário exemplar privado com texto extraível e parser específico testável. Não há OCR/inferência de movimentações.

Exemplo de CSV **inteiramente fictício**, com opções iniciais da tela:

```csv
Descrição;Valor;Natureza;Data da compra;Vencimento;Parcela;Total parcelas
Compra fictícia;120,00;purchase;2026-10-10;2026-11-10;2;4
Estorno fictício;-20,00;refund;2026-10-12;2026-11-10;;
Pagamento fictício;-100,00;payment;2026-10-15;2026-11-10;;
```

`format: decimal-comma|decimal-dot|minor` e `positive: charge|credit` são afirmações **revisadas na fonte**, não inferências de `amount`/`presentationAmount`. O leitor atual trabalha com escala 2 explicitamente confirmada. Moedas distintas/escala desconhecida bloqueiam comparação monetária. Campos vazios viram `NULL`, ausentes `ABSENT`, malformados `INVALID`; cópia dos campos originais permanece somente na revisão privada.

## Contrato local revisado (não é contrato de resposta oficial MCP)

Arquivo JSON de banco ou Minhas Finanças, respectivamente `side: bank|minhas-financas`:

```json
{
  "schema": "card-invoice-source-v1",
  "side": "minhas-financas",
  "profileId": "perfil-ficticio",
  "cardId": "cartao-ficticio",
  "invoiceMonth": "2026-11",
  "currency": "BRL",
  "scale": 2,
  "amountSemantics": "signed-invoice-minor",
  "rows": [
    {"id":"ocorrencia-ficticia", "description":"Compra fictícia", "cardId":"cartao-ficticio", "invoiceMonth":"2026-11", "purchaseDate":"2026-10-10", "processingDate":"2026-10-11", "dueDate":"2026-11-10", "amountMinor":12000, "kind":"purchase", "installmentNumber":2, "installmentsCount":4}
  ]
}
```

Naturezas aceitas: `purchase`, `refund`, `credit`, `fee`, `interest`, `iof`, `adjustment`, `payment`, `unknown`. Compras/encargos positivos, créditos/estornos negativos; pagamentos sempre excluídos das compras. Ajustes exigem classificação e sinal explícitos. Não classificar um crédito como pagamento por dedução. Evita contabilizar novamente pagamentos antecipados no total de compras, mas **não promete reconciliar saldo anterior e todas as regras bancárias sem layout validado**.

Opcionais no envelope: `declaredPayableMinor` (total oficial a pagar, não calculado das compras), `closingDate`, `invoiceDueDate`, `control:{independent:true,count,totalMinor}`. Controle refere-se a **todas as linhas da fonte, incluindo pagamentos**; total de movimentos apresentado exclui pagamentos. Contagem/total precisam vir de conferência independente, não da soma calculada pelo próprio leitor. Mesmo com controles coerentes, o relatório **não declara snapshot/completude global** ou autoriza exclusões. Quando falta controle válido, ausência do outro lado significa apenas “não observado”. A tela também permite informar separadamente o total oficial a pagar; divergência com o JSON bloqueia leitura.

`sharedId` só pode representar identificador **comum e documentado nas duas fontes**, com `sharedIdentityReviewed:true` em ambas. IDs locais/remotos diferentes não são convertidos em identificador comum. Sem isso, data de compra + descrição normalizada + valor + cartão + mês + parcela únicos geram correspondência **provável**, sempre para revisão. Uma diferença única de valor/data/parcela pode gerar uma divergência provável explicada, nunca vínculo financeiro. Compras repetidas/IDs repetidos ficam ambíguos, sem fusão. Se identificadores compartilhados revisados discordam, não são ignorados para forçar correspondência por texto/valor.

Pagamento da própria fatura não é compra/estorno. Total oficial a pagar, soma de movimentos bancários, soma MF e diferenças são exibidos separadamente. Campos inválidos/desconhecidos impedem total numérico confiável. Estornos, IOF, juros, tarifas e créditos não encontrados são destacados. Número/total de parcelas divergentes são listados; uma fatura nunca gera todas as parcelas futuras.

## Evidências capturadas e ferramentas oficiais

Inspeção das definições disponíveis, **sem executar ferramentas**:

| Ferramenta | Entrada oficial relevante | Limites e restrições |
|---|---|---|
| `get_credit_card_transactions` | `cardId`, `month`, `profileId` opcional, `limit`, `offset` | mês é fatura, padrão 100/máximo 200; `pagination.hasMore/nextOffset`; totais da fatura não são totais da página; `date` compra/ocorrência, `dueDate` do lançamento, `invoice.dueDate` da fatura; créditos negativos. Não anuncia `requestUpdateOpenFinance`. |
| `get_installment_series` | `transactionId`, `type: despesa|receita|transferencia`, `month`, `profileId` opcional, `limit`, `offset` | ID/tipo/mês de ocorrência efetivamente observada, não ID de origem/série; padrão 50/máximo 200; apenas parcelas cadastradas, sem gerar as faltantes por `declaredCount`; contempla excluídas sinalizadas. Descrição garante ausência de acesso bancário. |

As saídas disponíveis tipam `data` como desconhecido. **Não inventamos caminhos para contas, compras, parcelas ou escalas.** `CardInvoice.fromCapture` recebe o contrato local `card-invoice-capture-v1` e mapeamento explicitamente revisado de caminhos, apenas para capturas já existentes de cartão:

- Envelope: `profileId`, `remoteCardId`, `cardId` local revisado, `invoiceMonth`, `currency`, `scale`, `pages:[{request:{name,arguments},response}]`.
- Mapeamento: `reviewed:true`, `itemsPath`, `paginationPath` opcional, `amountSemantics`, `fields:{id,description,amountMinor,kind,purchaseDate,...}` com caminhos **verificados na captura**. Sem converter moeda/escala nem promover `date` a vencimento.
- Requisições de todas as páginas precisam manter perfil/cartão/mês, offset encadeado e limit 1–200; IDs repetidos/ausentes, excesso de itens, offsets/totais/envelopes contraditórios ou erros bloqueiam leitura. Lê structuredContent ou JSON textual; ambos precisam ser equivalentes se coexistirem.
- Página parcial ou única sem paginação é evidência parcial, nunca ausência/completude. Metadados coerentes não criam snapshot. Preserva requisição e resposta recebidas no relatório **privado**, sem fabricar páginas.
- Capturas da PoC `minhas-financas-observations-v1` de search/details **não são faturas** e não são aceitas automaticamente por este adaptador. Não alterar a PoC para simular essa equivalência.
- `CardInvoice.installmentEvidence` prepara o modelo local revisado de **ocorrências registradas** de série, mantendo `declaredCount` separado. Não há coleta, paginação ou associação automática da série na tela; depende de captura e contrato de saída verificáveis.

Botão MCP direto permanece desabilitado. Não existe configuração de chamada bancária com semântica de atualização desconhecida; não foi feito `tools/call`. A ausência de parâmetro na ferramenta de cartão impede afirmar a mesma política false já comprovada para search/details. Nenhum código de OAuth/PIN é reimplementado.

## Como testar localmente

1. Na branch do PR #8, executar `python3 -m http.server 8000 --bind 127.0.0.1` e abrir `http://127.0.0.1:8000/?area=cardInvoices`.
2. Clicar **Usar demonstração fictícia**. A tela produz casos correspondentes, valores/parcelas divergentes, compras em apenas uma fonte, estorno e pagamento excluído.
3. Para testar arquivos, salvar dados fictícios nos contratos acima, selecionar cartão/mês/moeda coincidentes, conferir mapeamento e consentir leitura local. Não usar importador normal nem exportação como base ativa.
4. Exportar relatório privado requer novo consentimento. Descartar revisão não apaga arquivo algum.

Testes: `node --test tests/card-invoice.test.cjs`; `node tests/browser-card-invoice.cjs` usando a configuração Playwright do projeto. CI inclui ambos. Testes automatizados usam apenas dados sintéticos.

## Perguntas ao fornecedor / pendências

1. A ferramenta de cartão pode garantir ausência de refresh bancário? Aceitará `requestUpdateOpenFinance=false` com política sem fallback, como search/details?
2. Quais são os caminhos/enums completos das respostas de cartão e séries, inclusive pagamentos antecipados, encargos, estornos e exclusões?
3. Qual identificador bancário de referência existe para conciliar com FITID/NSU/autorização? É estável, único por ocorrência e compartilhável com arquivo oficial?
4. Qual a moeda/escala/sinal e definitividade de cada valor individual? Qual cobertura monetária se aplica a linhas/totais da fatura/série?
5. Qual a relação documentada entre mês de fatura, compra, processamento, fechamento, vencimento da compra e vencimento da fatura? Como alterações de fechamento são tratadas?
6. Paginação oferece consistência/snapshot entre páginas? Como tratar linhas removidas, repetidas ou alteradas durante coleta? Totais incluem excluídas e ajustes?
7. Séries expõem ID de ocorrência, ID da série, divisão, parcela/total e exclusão em quais caminhos? Como representar parcela ausente sem inventar cronograma?

**Validação privada pendente:** formatos/layouts reais das instituições, conversões explicitamente autorizadas, mapeamento oficial de payloads, sinais e pagamentos antecipados, totais contra fatura real e séries. Não foi lido nenhum arquivo financeiro real nesta implementação. Recurso em revisão, não publicado no aplicativo de produção.
