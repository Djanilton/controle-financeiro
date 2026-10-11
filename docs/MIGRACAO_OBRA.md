# Projeções e vínculos privados

O Controle Financeiro usa o mesmo motor atual do Minha Obra. O cronograma, as despesas próprias, as exclusões, os pagamentos e os aportes programados são importados do arquivo privado `dados-completos.json` no OneDrive. No mesmo navegador, o cache privado do Minha Obra também pode inicializar o vínculo. Nenhum registro ou planilha é enviado ao GitHub.

As duas projeções ficam em Empréstimos e Projeção reserva. O Minha Obra conserva premissas da construção, cronograma, gastos, contrato e dados privados; a retirada das abas de projeção não apaga entradas.

O orçamento provisionado na origem não é descontado novamente. Móveis e eletros pendentes seguem as oito parcelas após a obra do motor de origem. No fluxo vinculado, uma parcela paga no relatório substitui a prevista, não soma a ela. Valores posteriores continuam sendo projeções, não pagamentos realizados. O saldo devedor é uma estimativa do modelo SAC; pagamento bruto não comprova amortização, juros ou saldo bancário contratual.

A posição real de Itaú e Sofisa é apresentada ao lado da reserva projetada, sem confundir saldo bruto com dinheiro livre após compromissos da obra. Não se presume qual aplicação será resgatada para cada despesa. A posição bancária depende das contas e dos saldos iniciais efetivamente importados.

As configurações de cenário pertencem ao dispositivo no Controle Financeiro. O botão Atualizar dados da obra do OneDrive relê a origem. No celular é necessário conectar à mesma conta Microsoft e importar; o cache do computador não se transfere sozinho.

Conferência local: `tests/verify-migration.cjs` compara meses e valores do modelo migrado com o código atual da origem. `tests/verify-workbooks.cjs` confere as três bases de benefícios e a referência SAC original. Os caminhos privados são argumentos de execução, nunca dados incluídos no repositório.
