# Saldos e vínculo automático

## Saldo das contas

O calendário do Power Pivot está relacionado a Movimentos[Vencimento], não a Vencimento_Ori. A importação prioriza o Vencimento tratado e usa o original apenas quando o campo tratado está vazio. Despesas/Receitas respeitam a fórmula de vencimento da planilha; transferências são negativas na origem e positivas no destino. Estornos conservam o sinal.

Para cada conta/ano, a base é o saldo da tabela SaldoInicial da aba Configurações no último ano cadastrado menor ou igual ao ano consultado. Sem novo cadastro anual, somam-se os movimentos dos anos intermediários. O saldo inicial do período inclui os movimentos anteriores ao período; saldo final = inicial − despesas + receitas + transferências líquidas. Diário e mensal usam o mesmo calendário e os mesmos movimentos. O último dia do mês deve reconciliar com o fechamento mensal.

Foram lidas as consultas Despesas, Receitas, Transferências e Movimentos, a relação Calendar[Date] e as 12 medidas do Power Pivot. O motor aplica Movimento, Receitas, Despesas, Transferências, Saldo Base, Movimentos Até Ontem, Saldo Inicial e Saldo Final na granularidade de conta/período. Não soma fechamentos de meses como se fossem receitas. Os totais entre contas são aditivos; a fórmula da planilha usa MAX(Contas[Conta]) no Saldo Base e pode ter outro resultado no total geral sem contexto de conta.

As tabelas dinâmicas salvas são caches e podem não representar lançamentos/fórmulas corrigidos sem Atualizar Tudo no Excel. A conferência contra os registros brutos não substitui a atualização da tabela dinâmica original. O aplicativo não altera nem salva o arquivo Excel.

## Financiamento e reserva

As premissas atuais do Minha Obra vêm de meta.engine.config, incluindo principal, annualInterest, term, constructionMonths, cdi, expenses, schedule e demais entradas. Gastos/valores pagos e movimentos vêm de items.gastos/items.meses; aportes vêm de meta.programacoes. O config da planilha antiga não substitui o config atualizado da obra. Overrides explícitos do cenário financeiro continuam separados.

Sem parcela efetivamente paga até o mês consultado, o saldo contratado é igual ao principal atualizado. Não é o saldo de crédito já liberado nas etapas da construção. O saldo bancário oficial depende do extrato da Caixa; a programação SAC futura permanece uma estimativa, sem mudança no motor original de liberação/TR.

Com sessão Microsoft válida, sincroniza ao abrir/conectar, voltar ao aplicativo e a cada 2 minutos enquanto estiver visível. Leituras automáticas usam autenticação silenciosa; não abrem uma janela de login sem ação do usuário. Usa ID e ETag do arquivo privado para evitar downloads sem alteração. No mesmo navegador, o cache atualizado do Minha Obra também alimenta o vínculo. Timestamp mais novo vence; offline, conserva o cache e mostra a pendência. Não grava dados do Controle Financeiro no arquivo do Minha Obra e não executa operações bancárias.

A migração do vencimento requer uma nova leitura automática da planilha quando houver login. Antes disso, dados antigos permanecem disponíveis, mas não contêm o vencimento tratado que a versão anterior descartava.
