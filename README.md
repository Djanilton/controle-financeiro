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

A tela Importar reúne as ações em um único quadro, incluindo seleção local e opções recolhidas de carga inicial/recuperação. A pasta de transações usa um caminho completo, sem escolher arbitrariamente entre pastas chamadas Extratos. Os leitores aceitam FGTS com ou sem símbolos monetários e CNIS com remunerações em várias colunas ou grade anual girada; a posição dos meses vazios é preservada. Falhas de leitura não substituem os dados válidos anteriores.

A remuneração COSERN ausente no quadro INSS é completada pelo salário básico dos contracheques armazenados, sem somar férias, benefícios ou alterar o saldo previdenciário. Valores históricos preenchidos são preservados. A tabela de renda fixa alterna entre instituição e total mensal das aplicações selecionadas; percentuais são ponderados pelo saldo inicial, não somados, e a escolha permanece salva no dispositivo.

## OneDrive

Em **Configurações**, informe o Client ID do aplicativo Microsoft e mantenha ou ajuste os caminhos privados. No cadastro Microsoft Entra, inclua como URI de redirecionamento do tipo SPA:

`https://djanilton.github.io/controle-financeiro/`

Permissões delegadas usadas: `User.Read` e `Files.Read`. Para editar os registros da área Construção e gravar a cópia integrada no OneDrive, autorize também `Files.ReadWrite`. O arquivo legado do Minha Obra continua preservado: a área integrada usa `dados-construcao-controle-financeiro.json`, com cópia de segurança antes de cada gravação e proteção contra alterações concorrentes.

## Origem dos saldos da obra

Os saldos disponíveis não são constantes gravadas no código. O aplicativo parte dos movimentos e saldos iniciais do `Controle das finanças.xlsm`, normaliza os nomes das contas e considera somente **Sofisa** e **Investimento Itaú** para a reserva da obra. Venda da casa, terreno e etapas já pagas permanecem históricos e não são somados ou descontados novamente.

### Estratégia mista da PLR e prevenção de insuficiências

O modo **Equilibrado** usa o mesmo motor SAC e de caixa. Simula divisões da PLR entre reserva e amortização e escolhe, entre as divisões testadas, primeiro a menor insuficiência e depois o menor salário total. A PLR mista entra em abril; durante a obra e após quitar a dívida, a parcela sem destino de amortização permanece na reserva. Amortização que exceda o saldo devedor retorna à reserva.

O planejamento percorre os compromissos futuros de trás para frente para determinar a cobertura necessária. Pode antecipar aportes do salário para meses anteriores à falta de recursos, mas nunca ultrapassa os limites cadastrados. Esses aportes aparecem separadamente nas tabelas. A taxa conservadora da cobertura usa a menor remuneração das duas aplicações; o fluxo final é recalculado por banco, com Sofisa antes de Itaú. Se os recursos não bastarem, a insuficiência continua explícita: o aplicativo não cria renda nem apenas esconde a falta com um saldo zerado.

A migração preserva a estratégia cadastrada. O modo Equilibrado pode ser escolhido em Construção > Premissas. Configurações e backups de políticas aplicadas em versões anteriores são mantidos; a migração não reverte nem reaplica escolhas automaticamente. A planilha original e sua regra histórica não são modificadas. O Resumo distingue custo do projeto, valores pagos, recursos reservados e disponibilidade mensal. Documentos e anexos contratuais aparecem em um único quadro. Erros das primeiras importações deixam a lista ativa, com uma cópia privada recuperável; novos erros continuam visíveis.

## Desenvolvimento

A conferência do motor, a matriz de migração e os limites da validação de 25/10 estão em [Validação do motor e migração](docs/VALIDACAO_MOTOR_E_MIGRACAO.md). A importação conserva os parâmetros da referência validada, sem impor valores históricos de FGTS. Em Opções e cópias da construção, **Exportar acompanhamento atual (Excel)** baixa os registros e o cenário atuais; **Exportar planilha original** baixa a fonte. Use o backup JSON para restauração integral.

O projeto é estático e não exige instalação. Sirva a pasta por HTTP para testar. Os testes do núcleo rodam com:

```sh
node --test tests/core.test.cjs tests/unification.test.cjs tests/construction-host.test.cjs
```

O GitHub Actions publica o conteúdo no GitHub Pages a cada atualização da branch `main`.

## Configurações

Sincronizações reúne sessão Microsoft, autorização da base privada, construção e diagnóstico de conflitos. Importações reúne novos relatórios, caminhos de origem, histórico e cópias recuperáveis; links antigos de importação continuam funcionando. A configuração do Client ID é avançada e não é repetida nos formulários de caminhos. A limpeza removeu apenas controles duplicados da interface, não registros ou backups.

A inicialização Microsoft é compartilhada entre chamadas simultâneas, restaura a conta ativa/em cache e atualiza o indicador também nas telas Construção e Contracheques. A base privada é sincronizada ao entrar; documentos de origem não são importados automaticamente. Sem sessão autorizada, ou se a Microsoft exigir nova autenticação/permissão, a ação Entrar/Autorizar continua necessária.

### Recuperação do mapeamento de transferências

O importador aceita Origem/Destino e Conta Origem/Conta Destino. Bases antigas com contas ausentes são recuperadas a partir do relatório original, em leitura silenciosa e apenas enquanto existirem vínculos a corrigir. A recuperação exige correspondência única de data, tipo, valor e descrição, completa somente campos vazios e arquiva os registros anteriores. Não altera valores, IDs, anotações ou documentos de origem. Falhas de acesso preservam a base e são informadas; não há ajuste de saldo fixado no código.

O saldo disponível hoje usa somente os movimentos até a data de referência. Já o Balanço Patrimonial usa fechamentos mensais completos, com receitas, despesas e transferências previstas até o fim de cada mês. A coluna Empréstimos mostra a parcela calculada, enquanto o Total patrimonial continua abatendo o saldo devedor uma única vez.

A reserva da construção parte do saldo disponível hoje e incorpora os lançamentos futuros das duas aplicações, sem reaplicar períodos passados. Na reserva, rendimentos fictícios lançados como receitas são ignorados: o motor calcula CDI, percentual da instituição e fator líquido sobre o saldo remanescente, proporcional aos dias restantes no mês atual. O Balanço Patrimonial, separadamente, continua mostrando os fechamentos pelos lançamentos previstos. Liberações da Caixa, PLR já modelada e pagamentos de despesas provisionadas permanecem em seus fluxos próprios, sem duplicação na reserva livre. Transferências entre as duas aplicações apenas redistribuem o capital livre disponível. Saldo líquido da Obra mostra PLR consolidada, FGTS aplicado à amortização e a parcela/saldo devedor do mesmo cenário da aba Empréstimos. FGTS destinado à dívida não entra novamente na reserva bancária.

### Cópias da construção e revisão de rascunhos

Em Configurações > Importações > Carga inicial e recuperação, **Ler planilha da construção no OneDrive** usa a localização privada configurada nas opções da construção. A aplicação valida os valores antes de importar e guarda uma cópia local anterior, disponível para exportação em Opções e cópias da construção. Nenhuma planilha original é regravada.

Rascunhos de sessões diferentes têm cópias independentes. Recarregar uma aba restaura seu rascunho; cópias deixadas por outras sessões aparecem em **Rascunhos recuperáveis** nas opções da construção. Conflitos com a nuvem continuam exigindo revisão. O acompanhamento Excel inclui custos editados, programações, obrigações, cláusulas e histórico de anexos; o backup JSON conserva o estado integral para recuperação.

## Atualização candidata por Excel ou pacote Minhas Finanças

Em Configurações > Importações, **Atualização financeira candidata** prepara uma cópia para revisão, sem aplicar dados. A carga histórica usa os três relatórios Excel de 22/10/2026, período por vencimento entre 01/10/2026 e dezembro/2044 e controles independentes de quantidade/total conferidos na fonte. Histórico, manuais, projeções e vínculos protegidos são preservados; ausência de cobertura ou conflito impede exportar a candidata.

Minhas Finanças opera por importação de pacote completo validado; consulta MCP direta permanece desabilitada enquanto o fornecedor esclarece a falha de leitura. Amostras parciais não servem para substituir períodos. Há prévia mensal, cópia anterior, relatório e revisão recuperável para reabrir no mesmo conteúdo de base, sem aplicação. O bloqueio de conciliação permanece ativo. Regras, limites e conferências antes da primeira atualização real estão em [Atualização candidata](docs/ATUALIZACAO_CANDIDATA.md).
