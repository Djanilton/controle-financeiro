# Integração pelo plugin — 21/10/2026

## Operação

O plugin é consultado no chat somente quando o usuário pedir. Não há consulta agendada ao plugin, nem token MCP embutido no site. As leituras oficiais geram um pacote privado `minhas-financas-relatorio-plugin.json`, na mesma pasta OneDrive da base do aplicativo. O nome histórico dessa pasta não implica dependência do aplicativo Minha Obra.

Em Configurações > Importações, o Controle Financeiro permite conferir o pacote e habilitar/desabilitar a detecção de novos pacotes privados. A detecção usa a sessão Microsoft já autorizada, ETag, intervalo de cinco minutos e foco/visibilidade; não reimporta planilhas e PDFs. Sem sessão ou sem pacote, os dados anteriores são mantidos.

O formato `minhas-financas-report-v1` exige perfil, BRL, período, paginação completa, totais por tipo e detalhes individuais coerentes com as linhas do relatório. Referência de vencimento e data efetiva são preservadas separadamente. Um relatório resumido não deve ser apresentado como uma exportação completa.

## Conciliação e recuperação

- IDs externos são associados aos IDs locais existentes, sem usar apenas a descrição como identidade.
- Registros iguais são diferenciados por comprovante, lançamento, número da parcela e classificação quando necessário. O sufixo de parcela em uma descrição antiga só é conciliado com número confirmado nos detalhes oficiais.
- Despesas com várias categorias são desdobradas pelos valores confirmados; o valor integral não é somado novamente. A quantidade de linhas contábeis pode ser maior que a de transações do relatório.
- O pacote é validado integralmente antes da aplicação. Ambiguidade, edição local concorrente ou desaparecimento de transação antes importada interrompe a importação; não há exclusão silenciosa.
- A primeira aplicação preserva uma cópia local `before-minhas-financas-import`; repetir o mesmo pacote não substitui essa cópia nem gera novas transações. A sincronização da base continua usando backup e controle de conflitos.
- Planilhas, PDFs e o JSON original da construção não são alterados. Pacotes privados, dados financeiros, IDs e credenciais não pertencem ao GitHub.

## Atualizações no Minhas Finanças: limite confirmado

A ajuda oficial consultada confirma a alteração de uma parcela ou mês individual na interface do aplicativo. Isso não confirma disponibilidade equivalente por MCP. As capacidades e ferramentas expostas nesta sessão continuam restringindo a edição geral a transações manuais avulsas compatíveis. Não há uma ferramenta exposta para alterar as parcelas existentes e as receitas recorrentes pretendidas pelo usuário.

Não se deve tentar contornar isso criando lançamentos substitutos, removendo vínculos, omitindo a recorrência, usando credenciais do cliente fora de seu contexto ou afirmando que as transações foram atualizadas. Quando houver ferramenta oficial compatível, cada ocorrência deverá ser identificada pelo ID e mês corretos, comparada com o cálculo, submetida à revisão exigida e conferida após a confirmação. Publicar um comando não comprova sua aplicação no dispositivo.

As colunas de conciliação não devem ser removidas sob a premissa de que a sincronização de saída já ocorreu. Nenhuma transação realizada deve ser reescrita com uma projeção.

## Balanço e resgates

O balanço usa a mesma apresentação de compromisso contratado da tela Empréstimos: saldo calculado liberado mais crédito contratado ainda a liberar. Durante a obra sem amortização, mantém o principal contratado. Após as liberações, acompanha a redução calculada pelo SAC e os aportes. A parcela ainda a liberar não é creditada antecipadamente na conta; somente as medições previstas são entradas de caixa. É uma apresentação do compromisso contratado, não comprovação do saldo exigível pelo banco.

A coluna Móveis e eletros discrimina as oito parcelas pós-obra já incluídas nas despesas. Resgate para pagar parcela do financiamento e móveis é transferência de investimento para a conta; não é uma nova despesa. Ativos, passivo e total continuam reconciliados sem descontar novamente as colunas informativas.

## Validação

Testes unitários cobrem repetição, IDs, parcelas, desdobramentos, perfis, totais, páginas, alterações concorrentes, saldo contratado e ausência de dupla dedução. Testes de navegador usam perfil isolado, dados fictícios ou cópias privadas em leitura. As gravações reais nos serviços externos não são simuladas como concluídas.
