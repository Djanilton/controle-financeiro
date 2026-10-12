# Projeções e vínculos privados

O Controle Financeiro usa o mesmo motor atual do Minha Obra. O cronograma, as despesas próprias, as exclusões, os pagamentos e os aportes programados são importados do arquivo privado `dados-completos.json` no OneDrive. No mesmo navegador, o cache privado do Minha Obra também pode inicializar o vínculo. Nenhum registro ou planilha é enviado ao GitHub.

As duas projeções ficam em Empréstimos e Projeção reserva. O Minha Obra conserva premissas da construção, cronograma, gastos, contrato e dados privados; a retirada das abas de projeção não apaga entradas.

A formação da reserva, a prioridade próprios → FGTS → Caixa e a prioridade investimento → salário estão descritas em [RESERVA_PRIORIDADE.md](RESERVA_PRIORIDADE.md). O cenário usa o motor atual da obra como origem autoritativa; pagamentos já realizados e compromissos provisionados não são descontados novamente. Saldos bancários importados são preservados e apresentados separadamente para conferência.

O Resumo separa Itaú e Investimento Itaú. NEOS e FGTS usam o último saldo informado no extrato e as movimentações posteriores das respectivas contas (Neos Previdência e FGTS), incluindo receitas/rendimentos, despesas e transferências. O mês já coberto pelo extrato não é contado de novo. Meses sem movimentos previstos mantêm o último saldo; não há rendimento automático adicional. INSS repete o último desconto mensal a partir do mês seguinte ao último registro. Esses meses são identificados como Projeção, não novos extratos. O acumulado é calculado desde a origem, antes da aplicação do filtro de período. O Total soma posições e dívida uma vez, sem somar novamente despesas, salário ou subtotais. Ausência de um saldo aparece identificada na linha; uma soma parcial não confirma patrimônio completo.

O vínculo primeiro consulta a pasta do aplicativo e, se o arquivo não existir, busca os nomes privados no OneDrive. Se não houver JSON atualizado, conserva a cópia anterior com aviso ou inicializa apenas premissas validadas da planilha de financiamento. Esse caso não confirma atualização dos lançamentos da obra.

Filtros e aba ativa ficam no armazenamento local de cada navegador, com a posição da lista preservada durante a seleção. Não há sincronização de preferências entre dispositivos.

As configurações de cenário pertencem ao dispositivo no Controle Financeiro. A sincronização relê a origem automaticamente ao conectar à Microsoft. O botão manual fica somente em Configurações. No celular é necessário conectar à mesma conta Microsoft; o cache do computador não se transfere sozinho.

Conferência local: `tests/verify-migration.cjs` compara meses e valores do modelo migrado com o código atual da origem. `tests/verify-workbooks.cjs` confere as três bases de benefícios e a referência SAC original. Os caminhos privados são argumentos de execução, nunca dados incluídos no repositório.
