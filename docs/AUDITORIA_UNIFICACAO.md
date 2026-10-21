# Auditoria da unificação — 20/10/2026

## Origem e destino

Origem consultada: Minha Obra, `ba799d44158f5aea4ee9cfeb1217c6d40a3e6061` (acesso de transição, posterior a `b7dd449`). Destino anterior à auditoria: Controle Financeiro, `d8502a8c027f7e017f190655c5c4eb191e956a9a`. As versões remotas foram consultadas antes das alterações.

| Funcionalidade preservada | Acesso no Controle Financeiro |
| --- | --- |
| Parâmetros, CDI, percentuais das aplicações, datas encadeadas e aportes programados | Construção > Premissas |
| Situação, custos, pagos/pendentes, reserva e despesas expansíveis | Construção > Resumo |
| Gráficos, alocação e posição anual do mesmo cenário | Resumo > Gráficos, destinação de recursos e posição anual |
| Despesas próprias, pagamentos e diferenças de materiais | Construção > Despesas |
| Etapas, fontes de recursos e progresso físico | Construção > Cronograma físico-financeiro |
| Cadastros históricos de parcelas e fluxos manuais | Cronograma > Registros preservados |
| Pendências, obrigações, documentos, links e envio de anexos | Construção > Obrigações, pendências e documentações contratuais |
| Conciliação PCI, terreno e origem dos recursos | Obrigações > Conciliação documental |
| Reserva mensal, fontes, parcelas e amortizações | Construção > Projeção Reserva |
| SAC e saldo devedor calculado | Empréstimos, vinculado ao mesmo motor |
| Posições bancárias, patrimônio e dívida | Balanço Patrimonial |
| Sessão Microsoft, bases privadas, backups e cópias | Configurações > Sincronizações / Importações |

Os antigos modelos simplificados e as projeções estáticas da planilha não foram reativados como cenários paralelos. Funções antigas preservadas no HTML não são a fonte autoritativa: os pontos de entrada integrados usam `sac-engine.js`, `construction-finance.js` e o mesmo snapshot privado de `finance-bridge.js`.

## Correções desta auditoria

- A área incorporada usa a sessão Microsoft do aplicativo principal, sem iniciar um segundo cliente MSAL. Leitura, gravação, consulta documental e upload passam pelo host integrado.
- Edições feitas sem reconstruir o formulário também notificam o aplicativo principal. O estado pendente e a base de comparação são preservados entre recarregamentos; importação automática não substitui rascunho pendente.
- Foram recuperados os acessos à conciliação PCI, parcelas históricas, fluxos manuais, gráficos de alocação, posição anual e memória de indicadores.
- Aportes FGTS usam o saldo projetado da conta no mês programado, menos usos iniciais/anteriores ainda não incluídos nesse saldo. O valor é limitado à dívida remanescente. Um aporte já realizado não é transferido outra vez. O campo bienal antigo permanece apenas como referência histórica.

## Preservação e sincronização

`dados-completos.json` continua original de consulta. Construção grava em `dados-construcao-controle-financeiro.json`; as demais informações ficam em `controle-financeiro-app.json`. São mantidos IDs, campos desconhecidos, tombstones, URLs e IDs dos anexos. Backup antecede a gravação; ETag/If-Match impede sobrescrita concorrente. Links anteriores editados ficam no histórico de anexos.

O Minha Obra publicado já é uma página de transição, sem gravação. Seu código histórico e a origem privada não foram removidos. Planilhas e PDFs originais não são regravados; as alterações ficam na base do aplicativo. Importação de fontes é manual, não executada por temporizador. Sincronização automática das bases privadas requer sessão Microsoft válida e autorização de gravação.

## Evidências e limites

- Suíte unitária, testes de conflito/backup/ETag, migração e rascunho após recarga.
- Teste independente da referência original: 9.698 valores, sem divergência relevante.
- Comparação da adaptação original com a integrada: 20.237 verificações numéricas, 413 meses, diferença zero no cenário de referência. As novas regras de saldos atuais/FGTS são verificadas separadamente; não se exige que reproduzam premissas históricas obsoletas.
- Comparação local somente leitura dos IDs e referências de anexos entre original e base integrada, sem perdas identificadas. Não comprova abertura/permissão de cada arquivo remoto.
- Navegador isolado: sessão compartilhada, telas, edição de documento com preservação de ID/anexo, filtros, balanço, projeção, configurações e menu responsivo. Escritas Microsoft foram simuladas ou bloqueadas; não foi realizada uma gravação real de auditoria no OneDrive.
- Não há alerta Android com o app fechado; lembretes são exibidos no app e exportáveis em ICS.
- Projeções dependem do horizonte dos depósitos/rendimentos/receitas cadastrados. Ausência de novos depósitos FGTS não autoriza inventar aportes. Saldos e permissões remotos podem mudar após a conferência.
- Há insuficiências sinalizadas no cenário patrimonial de longo prazo com os limites atuais de salário. Não foram escondidas, nem convertidas em renda fictícia. Aportes FGTS não são dinheiro livre da conta corrente. A quitação projetada continua condicionada à cobertura dos pagamentos.

Não se deve concluir que uma gravação real ou todos os links remotos foram testados apenas porque os testes isolados passaram.
