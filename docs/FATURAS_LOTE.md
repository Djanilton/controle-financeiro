# Faturas em lote — leitura privada, sem aplicação

## Procedimento

1. No checkout da branch, abra Configurações → Importações. Configure a raiz privada já usada pelo aplicativo. `invoiceReportsFolder` deve apontar para Faturas cartão e `reportsFolder` para Relatório App Minhas Finanças; não há caminho pessoal fixado no código.
2. **Faturas cartão** solicita um único consentimento para ler os documentos bancários e os três relatórios MF. Cancelar não lista nem baixa arquivos. Entrar na tela, inicializar ou recarregar não consulta o Graph.
3. A leitura percorre a raiz e as pastas anuais existentes, inclusive anos futuros, sem seleção individual dos arquivos inequívocos. Processa sequencialmente; versões inalteradas usam o cache privado. O lote não integra Importar todos.
4. Na primeira leitura, cartão desconhecido exige vínculo privado explícito. O painel mostra somente no navegador os identificadores encontrados no conteúdo. Sem vínculo ou sem semântica do layout, o documento fica bloqueado; nome/final do arquivo não cria identidade.
5. Depois de registrar vínculos/layouts revisados, repita a ação manual. Novos arquivos/versões inequívocos serão processados em lote. Os demais permanecem com motivo de bloqueio. Não há aplicação financeira.
6. A revisão mais recente por mês de fatura é aberta. Os seletores Cartão do histórico/Mês da fatura salva reabrem outras revisões sem rede. Marcações e exportações JSON/XLSX existentes continuam disponíveis.

Não conectar à Microsoft em um perfil com bases reais para apenas testar a demonstração. O teste autenticado de leitura é distinto dos testes simulados e depende da configuração de redirect URI/permissões já existente. Não autorize sincronização de base, corte de JSON ou escrita do histórico durante este teste.

## Identidade e versões

- Itaú XLSX: utiliza o leitor existente, cabeçalho por conteúdo, vencimento e total do preâmbulo, identificadores da coluna Número do cartão e total dos movimentos sem pagamento da própria fatura. Múltiplos cartões físicos/virtuais só pertencem à mesma fatura se o grupo exato foi vinculado explicitamente. Linha de compra sem cartão é bloqueada. Formato Excel 1904 continua bloqueado.
- Pasta anual e pistas inequívocas de mês/ano no nome precisam concordar com o conteúdo. Não se extrai identidade do nome.
- CSV/XLSX genéricos: exigem perfil privado revisado, cartão/vencimento/total presentes no conteúdo, mapa de colunas, sinal, moeda e formato numérico explícitos. Datas ISO; não se adivinham layouts.
- OFX: leitor existente, identidade `ACCTID`, vencimento explícito `DTPMTDUE` e total `AMTDUE`, perfil de instituição/moeda/sinal/tipos revisado. Muitos OFX não trazem esses campos: nesses casos o lote bloqueia, sem transformar DTPOSTED em vencimento. A alternativa manual anterior permanece disponível.
- ID/ETag iguais: sem download. ETag diferente/bytes iguais: uma leitura para comprovar hash, sem reprocessar/comparar. Conteúdo alterado: nova fonte/revisão, preservando a anterior. Mudança de layout revisado invalida o cache do parser e pode exigir nova leitura; isso não é mudança financeira automática.
- Mesmo cartão/mês em documentos diferentes com conteúdos distintos: conflito, sem eleição por mtime. O usuário pode registrar a versão escolhida **para aquele conjunto exato de IDs/hashes**. Qualquer versão alterada invalida a escolha. Documentos idênticos por hash não duplicam a revisão.
- Fontes bloqueadas mantêm os bytes somente no cache privado, para rever o vínculo sem repetir download quando ID/ETag não mudaram. O mesmo bloqueio e a mesma configuração são reaproveitados sem novo parsing. Cache de fontes e índice ficam no IndexedDB separado do aplicativo, junto ao histórico privado, com stores distintos. A atualização do banco v1→v2 preserva todos os eventos. Falha de quota/persistência é bloqueio, não autorização para excluir dados.

## Vínculo privado — exemplo totalmente fictício

```json
[{
  "reviewed": true,
  "institution": "Itaú",
  "bankCards": ["identificador-bancario-ficticio"],
  "localCardId": "cartao-local-ficticio",
  "mfCardValue": "valor-exato-da-coluna-cartao-no-excel-ficticio",
  "mfCardField": "Cartão",
  "profileId": "escopo-privado-revisado-do-excel",
  "mfLayoutReviewed": true,
  "mfCurrency": "BRL",
  "mfScale": 2,
  "mfAmountFormat": "reais-reviewed",
  "mfMonthField": "Mês da fatura",
  "mfKindField": "Natureza",
  "mfPurchaseDateField": "Data da compra"
}]
```

Preencher esses campos declara a revisão feita pelo titular, não cria prova independente de cobertura nem um ID remoto oficial. O mesmo escopo MF não pode ser vinculado a dois cartões distintos por nome. Agrupar os identificadores de um único cartão/fatura exige revisão explícita do grupo. Não inserir credenciais, tokens, PIN nem URLs de recuperação; chaves de segredos são rejeitadas.

A coluna Natureza precisa conter `purchase`, `refund`, `credit`, `fee`, `interest`, `iof`, `adjustment` ou `payment` com semântica documentada. Tipo despesa não vira compra automaticamente. Se o Excel real não trouxer essa classificação ou mês de fatura, o comparador **bloqueia** a associação até validar um mapeamento documental. `invoiceMonthFromDueDateReviewed:true` é opção privada apenas quando estiver comprovado que o vencimento daquele layout identifica o mês da fatura; data genérica/pagamento não substitui vencimento. Receita positiva como crédito só tem sinal invertido com `incomeCreditSignReviewed:true`, revisão explícita e natureza crédito/estorno já documentada. Sem isso, falha de sinal fica em revisão.

Layout genérico fictício (objeto em `csv`, `xlsx` ou `ofx` no painel de layouts):

```json
{"csv":{"reviewed":true,"institution":"Instituição fictícia","currency":"BRL","cardField":"Cartão","dueField":"Vencimento","totalField":"Total fatura","format":"decimal-comma","positive":"charge","delimiter":";","mapping":{"description":"Descrição","amountMinor":"Valor","kind":"Natureza","purchaseDate":"Data da compra","dueDate":"Vencimento"}}}
```

A validação real dos layouts CSV/OFX e dos campos dos Excel MF continua necessária. Os exemplos são dados sintéticos e não correspondem a arquivos do titular.

## Fonte MF e completude

Os três relatórios são identificados pelos nomes de exportação datados validados pelo importador existente. A data do nome escolhe a exportação mais recente; empate de versões é bloqueado. Layout, descrição, valor, vencimento, conta e destino de transferência são conferidos no conteúdo pelo mesmo adaptador da candidata, **sem chamar sua aplicação**. A origem e os campos originais são preservados; IDs de linha de Excel são documentais, não IDs remotos MCP.

Mesmo os três Excel lidos com sucesso **não comprovam cobertura por cartão/fatura**: não há controle independente dessa seleção automaticamente conhecido. O pacote de conciliação fica parcial, sem snapshot/controle de exclusões/completude. “Só no banco/MF” significa não observado na outra fonte recebida; nunca exclusão comprovada. Relatórios antigos ou sem o mês solicitado também não provam ausência. Só o subtotal recebido é comparado; pagamento de fatura permanece separado das compras.

## Limites e memória

Máximo de 120 pastas, 5.000 arquivos, 50 páginas/10.000 filhos por diretório, 30 MB por fonte e leitura de até 100.001 linhas com rejeição de truncamento do parser. NextLink precisa ser HTTPS no host exato graph.microsoft.com e caminho permitido. Ciclos, IDs duplicados, ETag/size contraditórios e alteração durante leitura são bloqueados.

Buffers são processados um a um. O índice das faturas contém somente metadados/scopes; uma fonte bancária é recuperada por comparação. Os três relatórios são lidos sequencialmente e as transações dos cartões pertinentes são mantidas para comparar; originais completos permanecem no cache privado. Revisões anteriores continuam no IndexedDB. O histórico ainda é projetado em memória pela interface existente; coleções muito extensas precisam de medição real. Não há garantia artificial de snapshot nem promessa de memória no Windows.

## Escrita e migração

`private-graph-transport.js` recebe uma função de request **injetada**, não usa fetch/token implicitamente, bloqueia escrita por padrão e não é instanciado pela aplicação. Testes habilitam escrita somente sobre mocks. Backup de histórico, If-Match, cópias condicionais, hash/releitura e migração com backups/prova externa de revogação estão preparados; não há botão/transporte de escrita real ativado. Autorizações específicas e verificação das garantias do Graph/ACLs/sessões antigas continuam obrigatórias.

## Assistente de confirmação do cartão

Reabra Conciliação no **mesmo endereço, porta e perfil de navegador** usados no teste anterior; não limpe o armazenamento. A identidade da fatura bloqueada pode ser recuperada dos bytes/identidade já preservados, sem baixá-la novamente. Instituição, mês e identificadores mascarados aparecem em **Confirmar cartão da fatura**. A evidência única é selecionada para revisão, nunca confirmada automaticamente.

Se os três relatórios MF ainda não estiverem disponíveis com integridade verificável, use **Inspecionar relatórios MF pelo OneDrive** e autorize sua leitura. Essa ação acessa apenas os relatórios da pasta configurada; não recarrega a base principal nem busca faturas adicionais. O consentimento do lote também autoriza essa inspeção quando há faturas sem vínculo. Nenhuma consulta ocorre ao inicializar/recarregar.

Confira o cartão MF. Um identificador completo coincidente pode vir pré-selecionado; nome/final não autorizam essa proposta. Se não houver coincidência integral, selecione explicitamente somente após conferência documental. Em **Colunas e bloqueios dos relatórios encontrados**, veja os cabeçalhos reais por arquivo e, quando necessário, escolha colunas existentes. Não é preciso editar JSON. Campos ausentes ou sem semântica comprovada não são preenchidos artificialmente.

Quando a pré-validação permitir, marque a confirmação e acione **Confirmar vínculo e comparar arquivos salvos**. A ação verifica as fontes e gera a tabela somente com o cache; não precisa estar conectada se todas as evidências estiverem disponíveis. Não faz novos downloads, não escreve no OneDrive e não altera transações. Revisões anteriores e marcações são preservadas.

Se faltar natureza (compra, estorno, pagamento etc.), mês da fatura, vencimento, identidade ou semântica monetária, o bloqueio é explicado. Total igual não comprova cobertura nem autoriza inferência. A comparação continua parcial e sem aplicação. Cache legado sem bytes/metadados suficientes poderá exigir uma leitura explícita da fonte; cache corrompido ou versões conflitantes não são substituídos silenciosamente. O nome do arquivo não é prova de identidade. Os detalhes técnicos antigos continuam em Opções avançadas para casos excepcionais.
