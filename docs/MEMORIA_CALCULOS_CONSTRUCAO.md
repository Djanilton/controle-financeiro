# Memória dos cálculos da construção

## Fonte e versões

O motor operacional está em `sac-engine.js`; a ligação entre etapas, pagamentos, materiais e parâmetros está em `construction-finance.js`. `sac-adapter.js` lê a planilha e compara o cenário de referência com os valores salvos. O cenário operacional é recalculado a partir das entradas; não executa fórmulas Excel nem usa seus resultados salvos como projeção.

Há dois usos distintos: referência histórica (`trCapitalizes:false`) para conferir a planilha e cenário atual, com TR no saldo e fase de obra. O arquivo original e os seus caches não são alterados. Principal, FGTS e prazo vêm da fonte validada e dos ajustes explícitos do usuário, não de constantes históricas.

## Mapa de origem e destino

| Origem | Tratamento atual | Testes de referência |
|---|---|---|
| Premissas B6/B8 | Saldo da primeira etapa, pago e próximo aporte separados | `verify-workbooks`, `validate-reference` |
| Premissas B11/B13/B23/B24/B29 | Próprios, custo, etapas/percentuais e venda líquida | `verify-migration`, navegador de campos |
| Parâmetros B/E/H/K | Custo do projeto, despesas próprias, crédito, FGTS, reserva e taxas | Adaptador, importação e navegador de campos |
| Financiamento_SAC C/M | Saldo inicial/final, TR, SAC e aportes | Validador Python e testes do motor |
| SAC D/E | TR derivada da TBF/faixas e juros | Referência da planilha e Python |
| SAC F/G/H/I/J | Amortização, MIP, DFI, administração e FGHAB | Referência e testes do motor |
| SAC K/L | Aportes limitados à dívida e parcela calculada | `amortization-sources`, `fgts-balance` |
| SAC O/T | Idades e início das faixas MIP importadas | Adaptador e referência |
| Fluxo C/D/E/F/G/H/I/J | Reserva, rendimento, salário, aportes, pagamentos e fator líquido | Python, `unification`, `balanced-projection` |
| Indicadores N/P | Quitação, mínimo, insuficiência, juros e totais | Referência e testes de cenário |
| Cronograma B/E/F/H/I/J/K | Calendário, físicos, pagamentos e fontes | Prioridade de fontes e navegador de campos |

O extrator Python e a CLI de referência permitem repetir a conferência das 8.385 fórmulas mapeadas da planilha usada na validação. O mapa extraído é privado e não pertence ao Git.

## Dívida e fase de obra

Na fase de amortização, o saldo corrigido é `saldo inicial × (1 + TR)`. Os juros incidem sobre esse saldo e a taxa mensal equivalente deriva da taxa anual. A amortização SAC divide o saldo corrigido pelo prazo remanescente. MIP segue as faixas importadas; DFI e administração são apresentados separadamente. FGHAB fica fora da parcela L, conforme a convenção da origem. CET é informativo e não é somado novamente aos juros/TR.

Durante a obra, o principal entra conforme a curva de liberações do cenário, sem amortização regular. A TR é paga nos encargos e não volta a ser capitalizada no fechamento dessa fase. A curva é proporcional ao cronograma e normalizada ao principal contratado; datas fora do intervalo são ajustadas e, sem pesos, a distribuição é uniforme. Isso é hipótese de planejamento, não comprovação de liberação pela Caixa. O progresso físico tampouco comprova pagamento ou crédito.

Ao terminar a fase de obra, começa o SAC pelo prazo restante. Aportes extraordinários são limitados ao saldo após a amortização regular. O saldo devedor não fica negativo. O arredondamento legado que zera resíduos menores que meio real foi mantido para paridade; precisão interna não equivale ao arredondamento de cada cobrança do banco.

## Fontes de recursos e pagamentos

O cronograma da construtora consome próprios, depois FGTS e depois Caixa. Economias/diferenças de materiais são conciliadas com o custo total, sem criar próprios negativos. A compra do terreno, pagamentos históricos e despesas próprias são separados do crédito contratado para não contar o principal novamente como custo do imóvel.

A reserva bancária usa Sofisa e Investimento Itaú, com saldos até a data de referência. Terreno e etapas já pagos não são descontados outra vez, nem a venda histórica é somada novamente ao capital atual. Despesas provisionadas não reaparecem como saídas duplicadas. Móveis/eletros diferidos são pagos no período previsto pelo modelo, com ajuste da última parcela para fechar os centavos.

Os resgates usam Sofisa antes de Investimento Itaú. O salário cobre a necessidade até os limites cadastrados. Insuficiências ficam explícitas mesmo quando o saldo bancário disponível é limitado a zero. Resgate é transferência entre contas; não é outra despesa além do pagamento.

## FGTS, PLR e aportes

FGTS destinado à dívida permanece separado do caixa bancário. O cenário integrado usa saldo projetado da conta, descontando usos iniciais e anteriores ainda não refletidos nessa posição. Uma amortização já realizada não vira outra transferência. Na ausência de saldo elegível, o sistema não inventa aporte com o valor bienal histórico.

Quando fontes coincidem, a redução da dívida é atribuída primeiro ao FGTS, depois à PLR e às amortizações programadas. PLR e aportes externos sem uso retornam à reserva; a sobra de FGTS continua no FGTS. Não se atribui a mesma redução a duas fontes. Aportes programados durante a obra permanecem investidos conforme a política do cenário.

PLR em CDB vai à reserva no calendário do modelo; Finan a destina à dívida e conserva excedentes e eventos posteriores à quitação na reserva. Equilibrado testa divisões da PLR entre caixa e dívida, compara insuficiência e uso de salário e pode antecipar salário sem ultrapassar o limite. É busca entre divisões testadas, não prova de ótimo global.

A migração preserva a estratégia escolhida. Equilibrado continua disponível para seleção explícita. Metadados e backups de políticas aplicadas em versões anteriores são preservados, sem reaplicação ou reversão automática.

## Rendimentos e decisão investir/amortizar

A taxa mensal bruta é estimada por `(1 + CDI anual × percentual CDI)^(1/12) − 1`. Aplica-se o fator líquido do mês e, no mês corrente, a fração de dias restantes. Cada aplicação tem seu percentual CDI. Receitas de rendimento já substituídas pelo modelo não são somadas novamente; transferências internas apenas redistribuem capital.

O líquido usa fatores simplificados da referência; não apura IR/IOF por lote, idade fiscal de cada aporte ou CDI por dia útil real. A decisão automática de extras compara rendimento líquido com custo marginal de juros, TR e MIP; DFI/administração fixos não são economia marginal de amortização parcial. Empates favorecem amortização e, após quitar, extras permanecem investidos. A liquidez durante a obra tem regra própria.

## Sincronização e integridade

O arquivo original legado permanece uma fonte de leitura. A base canônica da construção tem nome próprio e a base financeira do aplicativo é separada. Gravações exigem sessão/permissões Microsoft e usam backup e ETag; conflito não deve ser resolvido por sobrescrita silenciosa.

Rascunhos de edição têm cópias por sessão, além do cache compartilhado. Uma aba que salva não elimina a cópia pendente de outra. A recarga restaura seu rascunho, e cópias de sessões encerradas podem ser recuperadas nas opções da construção. Divergências concorrentes do mesmo campo bloqueiam o envio; edições independentes são combinadas com uma base comum.

## Limites e conferência no aplicativo

Testes com dados sintéticos cobrem campos, foco, diálogos, documentos, upload simulado, calendário, gráficos, propagação, recarga e concorrência. Conferência de IDs/links em JSON não confirma permissão ou conteúdo de cada anexo remoto. A instalação física, OAuth real, cobrança bancária e aplicação de comandos em outro serviço exigem conferência própria.

Na revisão do app, percorra Premissas, Resumo, Despesas, Cronograma, Obrigações/documentos, Projeção Reserva e Empréstimos. Confira depois Importações e Opções/cópias: planilha no OneDrive, backup JSON, acompanhamento Excel, planilha original e lembretes. As evidências e pendências da entrega estão em `VALIDACAO_MOTOR_E_MIGRACAO.md`.
