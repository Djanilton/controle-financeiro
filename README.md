# Controle das Finanças

Aplicativo particular, inspirado na arquitetura do **Minha Obra**, para pesquisar transações, acompanhar patrimônio e comparar realização e projeção de investimentos e empréstimos.

## Privacidade

O repositório contém somente o aplicativo. Planilhas, relatórios e lançamentos pessoais **não são enviados ao GitHub**. A leitura ocorre no navegador e os dados são guardados no IndexedDB/localStorage do dispositivo. A conexão opcional com o OneDrive usa Microsoft Graph diretamente no navegador.

## Funcionalidades desta primeira versão

- painel mensal de receitas, despesas, resultado e patrimônio;
- pesquisa por descrição, categoria, conta, cartão e observação;
- filtros por tipo, conta e data, com paginação para bases grandes;
- cadastro manual de transações;
- tabelas de realização e projeção de investimentos e empréstimos;
- gráfico dinâmico da evolução patrimonial;
- importação da planilha `Controle das finanças.xlsm`;
- importação dos relatórios mais recentes de despesas, receitas, transferências, Neos, INSS e FGTS em Excel/CSV;
- importação local ou direta do OneDrive;
- área **Construção**, com Premissas, Resumo, Despesas, Cronograma físico-financeiro e Obrigações e pendências contratuais;
- projeção integrada da reserva da obra, usando os saldos atuais de Sofisa e Investimento Itaú sem reaplicar pagamentos históricos;
- migração preservada de documentos, anexos, formulários, IDs e campos privados do Minha Obra;
- instalação como aplicativo (PWA).

## Contracheques e importação dos relatórios

A área **Contracheques** lê as abas anuais da planilha histórica, calcula os totais pelas rubricas e apresenta resumo mensal, anual, matriz por rubrica e gráficos. PDFs de salário, férias, PLR e complementos são conferidos contra os totais impressos antes da importação. Documentos repetidos não se acumulam; no mês coberto pelos PDFs, o total dos documentos substitui o consolidado da planilha. Diferenças ficam expostas para conferência. Os contracheques não geram receitas bancárias adicionais.

Em **Importar**, o botão **Importar todos os relatórios** verifica contracheques, despesas/receitas/transferências e extratos NEOS/FGTS/INSS. Os caminhos ficam em Configurações. O histórico anterior de contracheques vem da planilha e os PDFs do ano atual são examinados nas subpastas anuais. PDFs antigos também podem ser selecionados localmente. Os leitores aceitam PDFs com texto selecionável, Excel e CSV. Arquivos digitalizados sem texto exigem outra fonte.

A leitura das fontes acontece somente por ação explícita em **Importar**. A busca de contracheques limita-se ao ano selecionado e ignora outros arquivos da pasta. A planilha histórica é usada na carga inicial, sem reimportação a cada entrada.

Após conectar à Microsoft, o aplicativo sincroniza sua própria base privada `controle-financeiro-app.json` no OneDrive. Edições de transações são salvas localmente e enviadas após alguns segundos; outras sessões verificam os metadados a cada minuto, sem varrer planilhas ou PDFs. Em **Configurações > Base privada do aplicativo**, autorize a gravação uma vez. Existem exportação, cópia anterior à substituição e proteção por ETag contra gravações concorrentes. Conflitos preservam as alterações locais e exigem conferência; não são resolvidos por sobrescrita silenciosa. Nenhuma planilha ou PDF original é sobrescrito.

O resumo financeiro mensal fica em **Projeção reserva**; a formação da reserva fica somente em **Construção > Resumo**. Documentos e anexos ficam reunidos às obrigações contratuais. As configurações da construção estão nas configurações gerais.

PDF.js 5.4.624 (compilação de compatibilidade) é distribuído em `vendor/` sob Apache 2.0, com licença incluída.

## OneDrive

Em **Configurações**, informe o Client ID do aplicativo Microsoft e mantenha ou ajuste os caminhos privados. No cadastro Microsoft Entra, inclua como URI de redirecionamento do tipo SPA:

`https://djanilton.github.io/controle-financeiro/`

Permissões delegadas usadas: `User.Read` e `Files.Read`. Para editar os registros da área Construção e gravar a cópia integrada no OneDrive, autorize também `Files.ReadWrite`. O arquivo legado do Minha Obra continua preservado: a área integrada usa `dados-construcao-controle-financeiro.json`, com cópia de segurança antes de cada gravação e proteção contra alterações concorrentes.

## Origem dos saldos da obra

Os saldos disponíveis não são constantes gravadas no código. O aplicativo parte dos movimentos e saldos iniciais do `Controle das finanças.xlsm`, normaliza os nomes das contas e considera somente **Sofisa** e **Investimento Itaú** para a reserva da obra. Venda da casa, terreno e etapas já pagas permanecem históricos e não são somados ou descontados novamente.

### Estratégia mista da PLR e prevenção de insuficiências

O modo **Equilibrado** usa o mesmo motor SAC e de caixa. Simula divisões da PLR entre reserva e amortização e escolhe, entre as divisões testadas, primeiro a menor insuficiência e depois o menor salário total. A PLR mista entra em abril; durante a obra e após quitar a dívida, a parcela sem destino de amortização permanece na reserva. Amortização que exceda o saldo devedor retorna à reserva.

O planejamento percorre os compromissos futuros de trás para frente para determinar a cobertura necessária. Pode antecipar aportes do salário para meses anteriores à falta de recursos, mas nunca ultrapassa os limites cadastrados. Esses aportes aparecem separadamente nas tabelas. A taxa conservadora da cobertura usa a menor remuneração das duas aplicações; o fluxo final é recalculado por banco, com Sofisa antes de Itaú. Se os recursos não bastarem, a insuficiência continua explícita: o aplicativo não cria renda nem apenas esconde a falta com um saldo zerado.

A atualização aplica essa política uma vez, preservando a configuração anterior no armazenamento privado e usando o backup e controle de conflito existentes para sincronizar a alteração. A planilha original e sua regra histórica não são modificadas. O Resumo distingue custo do projeto, valores pagos, recursos reservados e disponibilidade mensal. Documentos e anexos contratuais aparecem em um único quadro. Erros das primeiras importações deixam a lista ativa, com uma cópia privada recuperável; novos erros continuam visíveis.

## Desenvolvimento

O projeto é estático e não exige instalação. Sirva a pasta por HTTP para testar. Os testes do núcleo rodam com:

```sh
node --test tests/core.test.cjs tests/unification.test.cjs tests/construction-host.test.cjs
```

O GitHub Actions publica o conteúdo no GitHub Pages a cada atualização da branch `main`.
