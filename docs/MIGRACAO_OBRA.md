# Projeções e vínculos privados

O Controle Financeiro usa o mesmo motor atual do Minha Obra. O cronograma, as despesas próprias, as exclusões, os pagamentos e os aportes programados são importados do arquivo privado `dados-completos.json` no OneDrive. No mesmo navegador, o cache privado do Minha Obra também pode inicializar o vínculo. Nenhum registro ou planilha é enviado ao GitHub.

As duas projeções ficam em Empréstimos e Projeção reserva. O Minha Obra conserva premissas da construção, cronograma, gastos, contrato e dados privados; a retirada das abas de projeção não apaga entradas.

O orçamento provisionado na origem não é descontado novamente. Móveis e eletros pendentes seguem as oito parcelas após a obra do motor de origem. No fluxo vinculado, uma parcela paga no relatório substitui a prevista, não soma a ela. Valores posteriores continuam sendo projeções, não pagamentos realizados. O saldo devedor é uma estimativa do modelo SAC; pagamento bruto não comprova amortização, juros ou saldo bancário contratual.

A posição real de Itaú e Sofisa é apresentada ao lado da reserva projetada, sem confundir saldo bruto com dinheiro livre após compromissos da obra. A regra escolhida pelo usuário é resgatar Sofisa primeiro e Investimento Itaú apenas para complementar. A posição bancária depende das contas e dos saldos iniciais efetivamente importados. As projeções futuras descontam necessidades de financiamento, recursos próprios do cronograma e móveis/eletros; pagamentos correspondentes já lançados nas aplicações não são retirados outra vez. Aportes do cenário não cobertos por transferências existentes são projetados na Sofisa. Rendimentos bancários são brutos e taxas devem estar informadas; falta de recursos fica explícita, sem executar operação bancária.

O Resumo separa Itaú e Investimento Itaú. Benefícios sem novo extrato mantêm seu último saldo conhecido, sem inventar rendimentos ou novas contribuições. O Total soma posições e dívida uma vez, sem somar novamente despesas, salário ou subtotais. Ausência de um saldo aparece identificada na linha; uma soma parcial não confirma patrimônio completo.

O vínculo primeiro consulta a pasta do aplicativo e, se o arquivo não existir, busca os nomes privados no OneDrive. Se não houver JSON atualizado, conserva a cópia anterior com aviso ou inicializa apenas premissas validadas da planilha de financiamento. Esse caso não confirma atualização dos lançamentos da obra.

Filtros e aba ativa ficam no armazenamento local de cada navegador, com a posição da lista preservada durante a seleção. Não há sincronização de preferências entre dispositivos.

As configurações de cenário pertencem ao dispositivo no Controle Financeiro. O botão Atualizar dados da obra do OneDrive relê a origem. No celular é necessário conectar à mesma conta Microsoft e importar; o cache do computador não se transfere sozinho.

Conferência local: `tests/verify-migration.cjs` compara meses e valores do modelo migrado com o código atual da origem. `tests/verify-workbooks.cjs` confere as três bases de benefícios e a referência SAC original. Os caminhos privados são argumentos de execução, nunca dados incluídos no repositório.
