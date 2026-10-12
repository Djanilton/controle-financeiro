# Reserva vinculada ao Minha Obra

Motor e montagem das premissas alinhados ao Minha Obra, revisão a4f48df35d8d93f2859013189962bb6664d9560d, de 12/10/2026. O adaptador lê etapas, pagamentos da construtora, diferenças de materiais, despesas próprias, terreno pago e programações do arquivo privado, além das premissas financeiras. Não publica registros particulares.

Próprios da construtora = máximo(0, custo total da construtora − financiamento − FGTS). O cronograma usa próprios primeiro, depois FGTS e Caixa. Próprios já pagos são abatidos da necessidade pendente, não novamente do investimento atual.

Capital disponível = investimentos + venda líquida. A formação da reserva explicita próprios pendentes, terreno pendente e demais despesas próprias pendentes. Móveis/eletros parcelados ficam investidos até seus vencimentos: a tabela diferencia saldo livre após todos os compromissos de reserva inicial que ainda rende até pagar esses compromissos.

Rendimentos líquidos, parcelas, despesas parceladas e entradas reproduzem o motor da obra. Retiradas usam Sofisa antes de Investimento Itaú. Salário automático cobre só o déficit, até os limites e datas do cenário; programações explícitas de salário prevalecem. A insuficiência restante aparece como falta de recursos, sem saldo bancário negativo fictício. Nenhuma operação bancária é executada.

Quando os saldos importados divergem, a projeção usa a reserva calculada pelo Minha Obra. O saldo bancário importado permanece inalterado no histórico e no saldo diário. A diferença é exibida. A distribuição projetada entre bancos reconcilia a soma com a reserva da obra: provisões reduzem Sofisa primeiro; eventual diferença positiva é atribuída à Sofisa somente como cenário. Rendimentos líquidos totais são rateados proporcionalmente aos saldos projetados, não representam cálculo individual de tributação de cada aplicação.

Previsões de construção/financiamento do relatório não são somadas outra vez aos compromissos já calculados pelo Minha Obra. Pagamentos realizados no relatório ficam visíveis para conferência; no cenário vinculado não substituem novamente o fluxo autoritativo.

Sincronização automática ao entrar, retornar ao aplicativo e a cada dois minutos enquanto conectado e visível. Botão manual somente em Configurações. Resumo vem imediatamente depois de Projeção reserva. Offline utiliza a última cópia e informa pendências.

Validação: tests/reserve-priority.test.cjs testa ordem de fontes, pagamento já realizado, principal alterado, ausência de desconto duplicado, prioridade dos bancos e insuficiência salarial. tests/ui-smoke.cjs verifica navegação, botões e construção da tabela com motor real e dados sintéticos.
