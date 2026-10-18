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

A verificação acontece ao entrar na Microsoft e a cada cinco minutos enquanto o aplicativo está aberto e visível, além do botão manual. Ela usa a conexão do próprio navegador e não executa tarefas do Codex. Metadados do OneDrive evitam baixar novamente arquivos inalterados. Os registros importados permanecem no armazenamento privado de cada navegador e podem ser reconstruídos dos mesmos arquivos do OneDrive em outro dispositivo. Nenhuma planilha ou PDF original é sobrescrito.

PDF.js 5.4.624 (compilação de compatibilidade) é distribuído em `vendor/` sob Apache 2.0, com licença incluída.

## OneDrive

Em **Configurações**, informe o Client ID do aplicativo Microsoft e mantenha ou ajuste os caminhos privados. No cadastro Microsoft Entra, inclua como URI de redirecionamento do tipo SPA:

`https://djanilton.github.io/controle-financeiro/`

Permissões delegadas usadas: `User.Read` e `Files.Read`. Para editar os registros da área Construção e gravar a cópia integrada no OneDrive, autorize também `Files.ReadWrite`. O arquivo legado do Minha Obra continua preservado: a área integrada usa `dados-construcao-controle-financeiro.json`, com cópia de segurança antes de cada gravação e proteção contra alterações concorrentes.

## Origem dos saldos da obra

Os saldos disponíveis não são constantes gravadas no código. O aplicativo parte dos movimentos e saldos iniciais do `Controle das finanças.xlsm`, normaliza os nomes das contas e considera somente **Sofisa** e **Investimento Itaú** para a reserva da obra. Venda da casa, terreno e etapas já pagas permanecem históricos e não são somados ou descontados novamente.

## Desenvolvimento

O projeto é estático e não exige instalação. Sirva a pasta por HTTP para testar. Os testes do núcleo rodam com:

```sh
node --test tests/core.test.cjs tests/unification.test.cjs tests/construction-host.test.cjs
```

O GitHub Actions publica o conteúdo no GitHub Pages a cada atualização da branch `main`.
