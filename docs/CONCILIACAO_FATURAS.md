# Conciliação privada de faturas — revisão sem escrita

## Escopo implementado

Área independente **Conciliação de faturas**, na branch do PR #8. Arquivos lidos no navegador por ação explícita; nenhuma consulta MCP, chamada Graph, persistência na base financeira ativa ou aplicação. Revisões e marcações são guardadas no histórico privado separado do navegador. Descartar revisão limpa a tela, sem apagar arquivos, bases ou revisões arquivadas. Exportação JSON privada somente após consentimento próprio; contém dados financeiros e não deve ser enviada ao GitHub. A conciliação não remove o bloqueio da atualização candidata e não oferece operações de correção no Minhas Finanças.

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

## Acompanhamento e novas revisões — 07/11/2026

As revisões agora são persistidas no **IndexedDB privado deste navegador**, banco `controle-financeiro-invoice-review-v1`, separado da base ativa e fora do Graph/OneDrive. A leitura local é consentida; o aviso informa o registro da revisão. Cada revisão guarda a fonte bancária revisada, fonte MF recebida, relatório e data. Marcações são eventos adicionais, sem sobrescrever a revisão anterior. “Descartar revisão desta tela” não apaga o histórico. Não há exclusão automática. Erros de quota/armazenamento são mostrados; não se afirma persistência quando o salvamento falha. O armazenamento local não é backup em nuvem ou criptografia própria: proteger o perfil do navegador e usar a exportação privada autorizada quando necessário.

Checkbox em cada linha problemática permite marcar/desmarcar. Estados: Pendente, Marcada como corrigida pelo usuário, Correção confirmada após nova conciliação, Permanece divergente e Necessita revisão. Evento registra data; reabrir revisão/atualizar página recupera marcações. Contadores separam esses estados. Uma linha já conferente na primeira revisão **não** é apresentada como correção confirmada.

Identidade de acompanhamento usa cartão, mês de fatura, perfil/cartão remoto disponíveis e os IDs efetivamente recebidos de cada lado, incluindo tipo/mês/divisão/parcela quando presentes. Não usa descrição/valor como identidade de marcação. Identificadores repetidos ou ambíguos não transferem marcações; podem ter uma anotação apenas naquela revisão. Mudança de IDs/parcela ou ausência de ocorrência exige revisão. Nenhum vínculo automático com transação financeira é criado.

Ordenação estável: somente banco (Itaú quando essa for a fonte), somente Minhas Finanças, demais divergências, prováveis correspondências, conferentes. A ordem visual não altera a identificação original da linha.

**Comparar novamente por arquivo** exige novo consentimento e nova fonte do mesmo cartão/mês; conserva a fonte bancária e acrescenta outra revisão. Uma ocorrência antes marcada só é confirmada quando reencontrada inequivocamente nos dois lados, com correspondência forte, campos válidos e controles válidos de ambas as fontes. Divergência reencontrada permanece divergente. Consulta/fonte parcial, desaparecimento ou identidade ambígua não comprovam correção ou exclusão. Ausências ficam registradas para revisão, sem eliminar a revisão anterior. O relatório privado exportado inclui o acompanhamento atual, somente com o consentimento de exportação já existente.

### Consulta MCP e autenticação futura

Botão **Consultar novamente no Minhas Finanças** permanece desabilitado e não possui transporte de consulta. Inspeção atual do contrato de `get_credit_card_transactions`: perfil/cartão/mês e paginação com limite 200, mas **sem anúncio de requestUpdateOpenFinance** nem garantia suficiente de ausência de atualização bancária. Não é correto omitir esse controle ou inferir suporte por existir em search/details. Nenhuma chamada foi feita.

Para habilitar futuramente: confirmação oficial da política sem refresh e schema do transporte efetivo; OAuth próprio com PKCE S256/state/CSRF, sem credenciais do ChatGPT; preferir sessão protegida em backend intermediário ou a PoC isolada já autorizada, conforme CORS/redirects, sem segredos no aplicativo público; consentimento por consulta com cartão/perfil/mês fixos e orçamento explícito de páginas; sem retentativa/reconexão automática. Valores e cobertura precisam de contrato verificável. O backend, se necessário, deverá manter tokens fora do navegador/repositório, sessão segura e escopo de leitura, sem endpoints de escrita. Não foi implantado servidor ou nova autenticação nesta etapa. Importação manual permanece alternativa funcional.

Pergunta adicional pronta ao fornecedor: **get_credit_card_transactions pode garantir contratualmente que uma chamada não solicita atualização Open Finance, mesmo sem cache, e expor essa capacidade no tools/list do transporte OAuth próprio? Quais evidências de filtros, paginação e cobertura acompanham essa resposta?** Não enviada automaticamente.

## Consolidação de navegação, fontes e relatório

Menu **Conciliação de faturas** imediatamente após Despesas. **Configurações → Importações → IMPORTAR FATURAS CARTÃO** abre a mesma tela. O roteiro indica cartão/mês → fatura → fonte MF → comparação → marcações → nova revisão/histórico. Resultados são levados à vista após Comparar/Demonstração; dados técnicos continuam recolhidos. Há busca, filtro por situação e ordenação (prioridade por padrão, data da compra, diferença conhecida ou descrição). O índice original de cada linha é preservado ao filtrar/ordenar, para não aplicar marcação a outra ocorrência.

**Buscar fatura no OneDrive** lista apenas a pasta privada configurada, por clique, e exige selecionar arquivo/versão. Lê IDs/ETags antes/depois, bloqueando identidade errada ou versão alterada. Não baixa ao abrir a tela, não altera arquivos e não escolhe automaticamente um arquivo quando há candidatos. Cartão/mês são conferidos no documento e pelo usuário, nunca garantidos pelo nome. Arquivo local permanece alternativa. Caminhos/permissões no navegador Windows ainda não foram validados.

### Adaptador Itaú XLSX

Selecionar explicitamente **Itaú XLSX — layout validado** e confirmar escopo/cartão/mês/BRL antes da leitura. O adaptador detecta os cabeçalhos Data, Lançamento, Parcelamento, Valor e Número do cartão por conteúdo, após o preâmbulo; não fixa a linha 14. Verifica resumo de valor/vencimento, calendário, datas seriais Excel (sistema 1900; dia fictício 60 e sistema 1904 bloqueados), valores em reais e parcelas `N de M`/`Parcela N de M`. Mantém titulares, nomes, físicos/virtuais/adicionais nos campos originais, sem inventar vínculo com cartão MF.

Créditos/cancelamentos/estornos são negativos; tarifas/juros/IOF positivos são distinguidos por termos reconhecidos. Pagamento negativo da própria fatura, incluindo o rótulo bancário de pagamento por boleto observado, não é compra/estorno e fica separado. Notas textuais finais sem dados financeiros são preservadas; linhas incompletas de lançamentos, parcelas/datas inválidas e total divergente bloqueiam o layout. **A soma de compras/créditos/encargos, sem pagamento da fatura, precisa coincidir com o total oficial.** Não se presume que isso funcionará para saldo anterior ou toda variante bancária.

Validação privada somente leitura reconheceu o arquivo disponibilizado e conciliou a soma com seu total oficial, sem publicar nomes, valores, datas pessoais, números de cartão ou o arquivo. Isso **não é** uma conciliação real completa com o Minhas Finanças. O total independente verificado não cria contagem independente, snapshot ou cobertura integral: `control.independent` continua false, e nenhum pacote de substituição é gerado.

IDs `document-row` identificam apenas a linha da cópia por SHA-256/posição original. Não são IDs bancários/MF e não são usados como identificador compartilhado. Substituir o arquivo altera o hash e exige nova revisão de identidade. Os documentos originais permanecem onde estavam.

### Recorrências revisadas e exportação

`recurringAliases` recebe regras privadas com descrições exatas dos dois lados, cartão/mês, ciclo confirmado, tolerância de 0–7 dias e revisão explícita. Valor, natureza e parcela devem coincidir, datas devem estar no ciclo revisado e a associação precisa ser um-para-um. Ciclos/cartões diferentes não são associados; multiplicidade é ambígua. Resultado é **Provável correspondência recorrente**, sem vínculo/aplicação ou confirmação automática de correção.

Exportação XLSX privada, com consentimento separado, gera quatro abas: **Conciliação**, **Resumo**, **Banco original**, **Minhas Finanças original**. Mantém valores originais e minor, moeda/escala, motivos e acompanhamento/data da marcação; unidades monetárias só são apresentadas após validação de moeda/escala. A aba Conciliação mantém a ordem de prioridade. Fórmulas não são derivadas de descrições ou documentos. Não importa o XLSX de volta como alteração financeira. O JSON privado continua disponível.

Sincronização do histórico e corte de JSONs: [MIGRACAO_DADOS_PRIVADOS.md](MIGRACAO_DADOS_PRIVADOS.md). Situação de todos os requisitos, incluindo pendências reais: [MATRIZ_CONSOLIDACAO.md](MATRIZ_CONSOLIDACAO.md).


### Navegação e filtros da revisão

Faturas cartão está entre as ações principais das Importações e abre a mesma área de Conciliação, sem leitura automática do OneDrive. Selecione as fontes e compare mediante consentimento. Os filtros cartão, mês, situação e ordenação são reativos e limitados à revisão aberta; outra revisão exige reabertura explícita pelo histórico. Motivos resumidos podem ser expandidos por clique ou teclado. Filtros e ordenação preservam o índice original usado pelas marcações, não criam revisão nem alteram transações. A pesquisa textual e o botão Filtrar relatório foram retirados.


### Atalho OneDrive e confirmação antes do conteúdo

Em Configurações → Importações, **Faturas cartão** usa a mesma regra visual dos botões Contracheques e Alocação de investimentos. Não integra o grupo “Importar todos os relatórios”. O clique abre Conciliação e solicita a listagem dos metadados da pasta privada configurada em `invoiceReportsFolder`, reaproveitando `chooseInvoiceOneDrive`/Microsoft Graph. Não grava um caminho pessoal no código nem busca pasta alternativa silenciosamente. A navegação normal pelo menu não inicia essa listagem.

Escolha um arquivo, informe cartão e mês de vencimento e marque a confirmação antes de carregar. Alterações do arquivo, cartão ou mês invalidam a confirmação; conteúdo só é solicitado após nova confirmação. `readPrivateItem` mantém identidade e ETag antes/depois, sem escrita. Cliques concorrentes de carga são bloqueados. Sessão desconectada/expirada e pasta ausente/permissão insuficiente mostram orientação e acesso às configurações, sem login, reconexão ou importação automáticos. Selecione manualmente “Buscar fatura no OneDrive” depois de conectar/configurar. O seletor local permanece em “Alternativa: selecionar fatura neste dispositivo”. Carregar não compara nem aplica dados; consentimentos da comparação e da exportação continuam separados.
