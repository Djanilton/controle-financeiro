# Integração pelo plugin — 21/10/2026

## Retirada do aplicativo antigo

Após os testes e a publicação integrada, o GitHub Pages de `Djanilton/minha-obra-app` foi despublicado e o repositório arquivado em 21/10/2026. A API confirmou `archived: true` e `has_pages: false`. O histórico completo também foi preservado em um bundle local verificado. Não houve exclusão da pasta privada OneDrive, dos anexos, dos arquivos financeiros originais ou da cópia local do código. A retirada é recuperável; não foi uma exclusão irreversível do repositório.

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

## Capacidades atuais — consulta de 25/10/2026

O registro de 21/10 de que não havia ferramenta para valores de parcelas/receitas recorrentes foi superado pelas ferramentas expostas em 25/10. O site continua sem executor MCP/CRUD remoto: importa pacotes privados e mantém intenções locais para envio pelo chat.

- Criação de receitas, despesas, transferências e séries futuras tem ferramentas dedicadas.
- `prepare_transaction_edit` atende edição geral de avulsas manuais compatíveis.
- `prepare_transaction_value` está exposta para valor de receita/despesa/transferência manual, inclusive fixa ou parcelada: mês explícito, valor por ocorrência e escopo `single` ou `from_selected`.
- `prepare_transaction_delete` está exposta com escopos próprios e confirmação obrigatória; exclusão pode ser irreversível.
- Alteração de valores fixos de despesa/transferência e liquidação possuem ferramentas e permissões específicas. Não extrapolar suas exceções para outras operações.

As ferramentas de valor/exclusão não apareciam na lista retornada por `get_user_capabilities`, embora seus schemas estivessem expostos. Confirmar catálogo e consentimento v10 antes de implementar; exposição não comprova autorização para todo lançamento. Não foi preparado nem enviado comando real nesta validação.

Transações vinculadas a empréstimos, Open Finance, múltiplas categorias, anexos e outros casos excluídos nas ferramentas continuam dependendo de suporte oficial específico. Identificar o tipo e o ID do financiamento; a descrição não prova que o lançamento seja uma despesa manual elegível. Não criar substitutos para contornar uma operação indisponível.

A integração futura precisa persistir ID local/remoto, mês, escopo, prévia, confirmação, chave idempotente e status; reler o resultado antes de marcar conciliação. Despesa e resgate são comandos separados, sem atomicidade. Publicação de um comando não confirma aplicação no dispositivo. API segura para cliente externo/navegador, OAuth/CORS e limites precisam de contrato oficial; não colocar credenciais do plugin no GitHub Pages.

As colunas de conciliação permanecem necessárias. Projeções não devem reescrever lançamentos realizados. A consulta e a geração de pacotes seguem acionadas pelo usuário no chat.

Os dois formatos aceitos são `minhas-financas-report-v1` e `minhas-financas-source-report-v1`. No segundo, páginas completas de previsões pendentes simples confirmadas podem dispensar detalhes; efetivados e múltiplas categorias continuam exigindo detalhes. Isso não transforma relatório resumido em exportação completa.

## Balanço e resgates

O balanço usa a mesma apresentação de compromisso contratado da tela Empréstimos: saldo calculado liberado mais crédito contratado ainda a liberar. Durante a obra sem amortização, mantém o principal contratado. Após as liberações, acompanha a redução calculada pelo SAC e os aportes. A parcela ainda a liberar não é creditada antecipadamente na conta; somente as medições previstas são entradas de caixa. É uma apresentação do compromisso contratado, não comprovação do saldo exigível pelo banco.

A coluna Móveis e eletros discrimina as oito parcelas pós-obra já incluídas nas despesas. Resgate para pagar parcela do financiamento e móveis é transferência de investimento para a conta; não é uma nova despesa. Ativos, passivo e total continuam reconciliados sem descontar novamente as colunas informativas.

## Validação

Testes unitários cobrem repetição, IDs, parcelas, desdobramentos, perfis, totais, páginas, alterações concorrentes, saldo contratado e ausência de dupla dedução. Testes de navegador usam perfil isolado, dados fictícios ou cópias privadas em leitura. As gravações reais nos serviços externos não são simuladas como concluídas.
