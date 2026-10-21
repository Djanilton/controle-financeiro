# Fluxo bancário, abertura e lançamentos — 21/10/2026

## Balanço

O Itaú usa primeiro o dinheiro disponível, incluindo receitas previstas. Somente a falta é transferida da Sofisa e depois do Investimento Itaú. A prioridade anterior resgatava aplicações para pagar parcelas mesmo havendo dinheiro na conta e aplicava a ela o limite de aporte de salário da reserva. Isso preservava caixa desnecessariamente e podia mostrar obrigação sem cobertura ao lado de saldo disponível. O limite continua no cenário da reserva da Construção; não restringe dinheiro já na conta no balanço bancário.

Medições da Caixa continuam creditadas no Itaú; construtora, parcelas e móveis saem dele. Despesas futuras cadastradas nas duas aplicações são roteadas pelo Itaú no cenário, sem reescrever o registro importado. Histórico, venda histórica e pagamentos já realizados são preservados. FGTS amortiza o financiamento diretamente, não é receita livre. Ativos + Passivo = Total; transferências não geram renda/despesa nem dedução repetida. Saldos mensais não garantem liquidez intradiária.

## Desempenho e armazenamento

O motor SAC/CDI e a montagem das telas executam no navegador, não no Excel ou no OneDrive. JSON é formato de persistência e troca da base privada, não um serviço de cálculo remoto. A base inclui transações, parâmetros e tabelas históricas auxiliares importadas, não apenas campos digitados. Índices e resultados derivados são reutilizados em memória e invalidados após mudanças. IndexedDB e preferências locais permitem cache por dispositivo; arquivos e anexos privados continuam separados no OneDrive. Não há importação de planilha a cada troca de aba.

Foram removidos o cálculo duplicado de investimentos na integração e varreduras de toda a base a cada mês. O resumo usa índices por mês; sua repetição reutiliza uma cópia protegida do cache. Matrizes mensais usam índice de conta/mês. Formatação de moeda e datas reutiliza formatadores Intl. A primeira tela local aparece antes da restauração da autenticação; falhas de carregamento mostram mensagem em vez de uma tela vazia.

Medição isolada no mesmo navegador e cópia da base, sem gravação no serviço: preparação dos cálculos 1936 ms para 949 ms; primeiro balanço 2710 ms para 1177 ms; repetição 1090 ms para 11 ms; resumo diário 736 ms para 527 ms. Esses tempos não são garantia para celular, rede ou autenticação, nem representam todo o tempo de abertura.

## Formulário e plugin

Há situação (efetivada/pendente) nas segmentações de Transações e Despesas. Novo lançamento permite variável, fixa ou parcelada, com quantidade 2–120 e valor por parcela. Categoria/subcategoria são seleções vinculadas. Transferências exigem contas diferentes, sem categoria. Data de lançamento é hoje em America/Fortaleza. Efetivação é o vencimento apenas para registro efetivado e não futuro; pendentes não recebem data de pagamento. Séries compatíveis com o plugin começam pendentes, hoje ou no futuro.

Fixa/parcelada é armazenada como uma entrada-modelo e expandida localmente dentro do horizonte do aplicativo. Uma ocorrência conciliada ou editada substitui a ocorrência gerada. Edição local de ocorrência não altera silenciosamente a série inteira; invalida a solicitação pendente para revisão.

O formulário salva também uma solicitação privada em `manual.pluginOutbox`, sincronizada junto da base. Configurações > Importações permite exportá-la para processamento explícito no chat. O site GitHub Pages não tem acesso às credenciais nem às ferramentas MCP do chat; **não publica diretamente no Minhas Finanças**. Por isso a tela informa pendente de envio, nunca sincronização externa concluída. Contas e categorias precisarão ser resolvidas pelos IDs oficiais no processamento. Solicitações alteradas exigem revisão; exportar não autoriza executar conteúdo sem validar a intenção humana.

Os testes de interface usam perfil isolado e dados sintéticos. A auditoria financeira lê cópias privadas sem editar os originais. Nenhum teste deste conjunto cria transações reais no Minhas Finanças.
