# Cálculos e fontes

A memória detalhada da construção, com o mapa de fórmulas e as diferenças entre referência e cenário operacional, está em [Memória dos cálculos da construção](MEMORIA_CALCULOS_CONSTRUCAO.md).

Dados privados são importados para o navegador, nunca para o GitHub. Cada dispositivo precisa importar os dados ou conectar-se ao OneDrive.

## Contas e despesas

Saldo final = saldo inicial + receitas − despesas + transferências líquidas. As transferências saem da origem e entram no destino. O saldo inicial cadastrado para um ano substitui a abertura anterior; não é uma receita. O saldo diário usa o mês final selecionado e a mesma base de vencimentos do resumo mensal. Despesas consideradas são classificadas por Sim/Não; os gráficos respeitam a segmentação selecionada.

Campos calculados vazios usam os originais, sem executar Power Query ou DAX. Tipo de despesa usa classificação explícita, regras de Configurações ou recorrência/parcelas. A classificação padrão sem outra evidência é Variável. Categoria → subcategoria → descrição são agrupadas no aplicativo.

## Investimentos e previdência

Itaú usa a conta Investimento Itaú; Sofisa usa Sofisa. Rendimentos realizados vêm das receitas dos relatórios. Projeção bruta mensal: `(1 + CDI anual × percentual CDI)^(1/12) − 1`, percentual 1 para Itaú e 1,05 para Sofisa. É uma estimativa mensal, não a apuração oficial diária de CDI nem valor líquido de IR/IOF. Uma taxa informada pelo usuário tem prioridade; sem ela, usam-se as premissas anuais importadas do financiamento. Sem taxa, não se inventa rendimento.

Néos recalcula saldo anterior + contribuição + rendimento + ajuste. Rendimento literal e saldo literal do histórico são evidências importadas e preservados; fórmulas são substituídas pelo cálculo independente. INSS acumula Contribuição INSS, não remuneração. FGTS acumula contribuições assinadas, preservando saldos literais de conciliação e linhas que a planilha exclui da soma. Meses posteriores ao último extrato não são marcados como realizados, e não há projeção automática dessas três fontes sem premissas adicionais.

## Financiamento

As premissas são importadas do arquivo financiamento construção casa e conferidas com as células calculadas. O motor reproduz o cenário SAC da planilha, incluindo TR, MIP por idade, DFI, administração, seguros e amortizações extraordinárias. O prazo importado é 411. A identificação aceita FINANCIAMENTO CASA com 401 parcelas e Financiamento Caixa com 411, pois existe essa divergência no relatório. A parcela paga do relatório é exibida separadamente da parcela calculada; o aplicativo não altera o contrato nem infere pagamentos ausentes.

## Resumo

Mantém as colunas da tabela Resumo. Contas, despesas, salário, transferências de investimentos, previdência e dívida são vinculados aos cálculos internos. Casa, carros e posições de outras instituições mantêm os valores importados, pois não há relatórios suficientes para reconstruí-los. Sofisa integra investimentos nesta consolidação. Não há substituição integral de todas as medidas Power Pivot e projeções de remuneração nesta versão.

## Conferência de 11/10/2026

- 17 testes unitários aprovados e oito abas renderizadas em teste de execução.
- SAC: 9.698 valores conferidos; zero divergências acima de R$0,01.
- Néos: 322 registros, INSS: 320, FGTS: 708; saldos históricos conferidos até precisão numérica.
- Validação visual e autenticação em celular físico precisam ser confirmadas no dispositivo do usuário.

Para testar novamente: `node --test tests/core.test.cjs tests/model.test.cjs` e `node tests/ui-smoke.cjs`. A conferência opcional `tests/verify-workbooks.cjs` recebe os caminhos dos dois arquivos como argumentos e imprime somente contagens e diferenças.
