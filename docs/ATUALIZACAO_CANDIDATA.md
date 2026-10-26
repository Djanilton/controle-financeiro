# Atualização candidata por Excel e Minhas Finanças

Implementação preparada para revisão de código por Pull Request, sem aplicação financeira, sincronização ou deploy. A implementação recuperada foi integrada à branch `feat/atualizacao-candidata`, sobre `6976eaa`, em worktree isolado. Os três Excel informados foram baixados em leitura e validados privadamente nesta rodada. As seções históricas abaixo foram preservadas; a revisão vigente está ao final. Validação dos campos do arquivo não prova ausência de filtros na exportação nem reconciliação com a base financeira real.

## Fontes e limites

Pasta informada: OneDrive/Djanilton/Finanças/Gerenciador financeiro/Despesas/App Minhas finanças/Extratos. A ferramenta nova recebe seleção local de cópias, sem acesso Graph e sem gravação no OneDrive.

- despesas-2026-10-22-22-30-11.xlsx
- receitas-2026-10-22-22-33-58.xlsx
- transferências-2026-10-22-22-35-10.xlsx

O conjunto Excel candidato exige os três nomes e considera registros de 01/10/2026 a 31/12/2044. Registros anteriores, inclusive por data de pagamento, são protegidos. Registros ativos ausentes na fonte permanecem presentes e são sinalizados como possíveis exclusões, sem excluir automaticamente. O envelope privado e coleções não transacionais são copiados integralmente.

Janela do plugin: 12 meses-calendário desde o primeiro dia do mês de referência. Outubro/2026 significa 01/10/2026–30/09/2027. A consulta deve usar vencimento, status todos, sem filtro de conta/categoria/cartão que oculte registros. É uma nova leitura completa da janela para atualização incremental local; não se presume API de delta global ou updatedSince. Outros meses ficam intactos. Transações efetivadas exigem detalhes de pagamento; ausências da janela bloqueiam para revisão, sem apagar.

## De/para suportado

| Excel | Pacote do plugin | Controle Financeiro / regra |
|---|---|---|
| Tipo pelo arquivo | items.type expenses/incomes/transfers | kind Despesa/Receita/Transferência |
| ID gerado pelo importador (posição/data/valor) | items.id + profileId + occurrenceMonth + splitId | Excel não fornece ID remoto confiável; preservar ID local ao vincular. Plugin usa minhasFinancas.key/remoteId/profileId/splitId/occurrenceMonth |
| Descrição | items.description | description; mudanças com identidade incerta viram conflito |
| Vencimento/Data | detalhe dueDate/referenceDate, items.date | dueDate; referência mensal da atualização e da prévia |
| Pagamento/Efetivação | detalhes effectiveDate | paymentDate; não inferir pagamento de previsão |
| Lançamento | detalhes createdAt | postedDate; diferente de competência/pagamento |
| Valor/Valor (R$)/Total | presentationAmount/value, valor dos detalhes | amount/cashAmount; centavos na prévia; total desconhecido não deve virar zero |
| Conta | account.description | account; nomes não substituem cadastro remoto de contas |
| Origem/Conta Origem | originAccount.description | account em transferências |
| Destino/Conta Destino | destinationAccount.description | destination; ambos obrigatórios em transferência |
| Cartão | card.description | card; despesa em cartão não é transferência nem novo pagamento de fatura |
| Categoria/Subcategoria | category/subcategory; detalhes categorySplits | category/subcategory; desdobrar pelos valores confirmados sem somar valor integral novamente |
| Situação/Status | completed/pending | Efetivada/Pendente; agrupamentos separados na prévia |
| Recorrência | recurrence + detalhes | recurrence; não criar nova série remota |
| Parcelas | installmentNumber/installmentsCount | installments; parcela/competência não é ID de toda a série |
| Observação | detalhes notes | notes; preservar anotação existente se Excel vazio |
| Nome do arquivo | generatedAt, páginas, perfil, moeda, totais | source/candidateImport e candidateUpdate; data de geração não comprova atualização bancária |

IDs remotos de contas/cartões/categorias não são inventados pelo nome. O importador atual guarda descrições e identidade da ocorrência; catálogo de entidades, correspondência explícita desses IDs e validação dos campos privados reais permanecem necessários antes de escrita remota. Nenhuma escrita Minhas Finanças faz parte desta implementação.

## Fluxo novo

Configurações → Importações → Atualização candidata. Selecionar os três Excel e/ou um JSON privado validável do plugin, informar referência e gerar prévia. Worker calcula uma cópia; base ativa e manual permanecem inalteradas. Bloqueio de gravação é ativado, e detecção automática de pacotes fica suspensa durante revisão. Exportar relatório integral ou candidata quando não houver conflitos. Não existe botão de ativação; não usar o importador normal como atalho de aprovação.

Prévia separa tipo/status por mês, contagem e total em centavos antes/depois; transferências não são resultado ou saldo. Projeções identificadas como calculadas/templates não entram nos totais contábeis. O motor continua separado; não inserir suas saídas como receitas realizadas. Fontes privadas não classificadas, correspondências múltiplas, registros semelhantes sem identidade segura ou vínculos existentes com alterações divergentes bloqueiam a candidata. Campos desconhecidos, fontes anteriores e coleções de financiamento/investimento/construção/contracheques/FGTS/INSS/configurações são preservados.

## Contrato do plugin e primeira atualização real

O navegador não pode chamar conectores exclusivos do ChatGPT. Aceita pacotes minhas-financas-report-v1 e minhas-financas-source-report-v1 já validados pelo núcleo existente: perfil/BRL, referência due, todas as páginas e totais conciliados, detalhes quando exigidos, cobertura monetária confirmada. Não usar apenas primeira página. O contrato exposto de run_report limita uma consulta a 24 meses/100 mil ocorrências e detalhes paginados; search_transactions tem limites próprios (até 50 por página). Páginas representam snapshot sincronizado corrente, não necessariamente congelado. Conferir consistência entre páginas e frescor da fonte; autenticação/data de geração não comprovam novos movimentos bancários. Sincronização bancária pode depender de processamento no aplicativo do fornecedor. Nenhuma chamada real ao plugin foi feita nesta etapa.

Antes da primeira atualização real: autorização específica; exportar/baixar backups privados; confirmar HEAD/ETag da base ativa e bloquear escritas; conferir cabeçalhos, cobertura até 2044 e totais dos três arquivos; gerar pacote completo de 12 meses no perfil autorizado, sem publicar seus dados; comparar candidata e relatório, incluindo contagens, saldos por data, parcelas, cartões e registros manuais. Resolver ambiguidades e IDs de entidades; repetir a geração para comprovar idempotência. Somente depois projetar ativação pela conciliação com ETag, diário e confirmação. Esta ferramenta não cria nem substitui esse protocolo e não o executa.

Limites: candidate preview não valida saldo bancário atual nem cria saldo inicial. Não é reconciliação final com base real. Ler Excel e clonar envelopes ainda consome memória; Worker evita cálculo principal síncrono, mas não elimina parse/structured clone. Não há persistência automática da candidata; exportar antes de fechar. Base real, cabeçalhos reais, frescor e autorização OAuth não foram validados aqui.

## Revisão vigente: substituição controlada por vencimento

Esta seção substitui a regra inicial de somente acrescentar/atualizar e preservar toda ausência. A ferramenta agora substitui, **apenas na candidata**, o conjunto gerenciado dentro do período explicitamente selecionado. Uma ausência em fonte completa e validada pode remover um registro gerenciado da candidata. Nenhum registro da base ativa é removido.

### Escopo e precedência

- Vencimento (`dueDate`) é obrigatório. Não usar pagamento, lançamento ou `date` como fallback para decidir remoções. Linhas Excel precisam de coluna Vencimento/Vencimento_Ori. Registros antigos sem vencimento identificável ficam preservados, fora dos totais por vencimento.
- Nada anterior a 01/10/2026 é substituído. Havendo data histórica de pagamento/registro anterior ao corte, o registro permanece protegido, mesmo se outro campo apontar para período posterior.
- Excel aceita seleção mensal ou outro intervalo entre 01/10/2026 e 31/12/2044, coberto pelas três exportações completas do mesmo perfil. Origem gerenciada: metadados deste dataset/perfil, nomes de arquivo reconhecidos ou vínculo remoto do mesmo perfil. Origem genérica Planilha exige adesão explícita na tela; não se assume que qualquer planilha pertença ao dataset. Manuais, projeções/templates, protegidos/overrides, origens desconhecidas e todas as coleções não transacionais continuam preservados.
- Plugin substitui 12 meses-calendário completos. Na combinação Excel + plugin, a janela anual deve caber no período Excel selecionado. O plugin prevalece nessa janela; Excel fornece os outros meses. Intervalos já cobertos pelo plugin são mantidos no manifesto e não rebaixados por cargas Excel posteriores, inclusive quando a janela móvel avança.
- A substituição remove os gerenciados da candidata e insere o conjunto validado da fonte; não faz união com ausentes antigos. IDs locais são conservados quando a correspondência é inequívoca; se não houver identidade segura, são gerados IDs determinísticos da fonte. Cópia original para desfazer conserva todos os registros/IDs anteriores. Identidades repetidas na própria fonte ou correspondência com registro protegido bloqueiam todo o resultado; não há candidata parcialmente aplicável.

### Prova de completude exigida

Para Excel, é obrigatório confirmar o perfil e a cobertura completa por vencimento dos três arquivos; o parser confere contagem de linhas e soma de centavos contra o conjunto normalizado de cada arquivo. A confirmação de cobertura é declaração explícita do operador: o nome do arquivo e os totais recalculados não provam, sozinhos, que a exportação não possuía filtros. Na primeira carga real, conferir os filtros/período e totais originais do relatório antes de marcar a confirmação. Fonte vazia completa é diferente de download/consulta incompletos.

Pacote do plugin exige o schema validado anterior e um manifesto adicional `replacementCoverage`:

```json
{
  "complete": true,
  "dateReference": "due",
  "profileId": "perfil-sintetico",
  "from": "2026-10-01",
  "to": "2027-09-30",
  "status": "all",
  "unfiltered": true,
  "types": ["expenses", "incomes", "transfers"]
}
```

O manifesto deve ser construído a partir das consultas originais verificadas, não acrescentado para contornar uma rejeição. Páginas faltantes/hasMore, totais incoerentes, perfil/tipos/período incorretos, status limitado, filtros visíveis nas páginas fonte ou cobertura monetária incompleta bloqueiam a substituição. Pacotes antigos sem evidência de escopo são recusados para substituição. Um pacote completo e vazio pode remover gerenciados da janela; uma consulta incompleta nunca pode. O manifesto não é assinatura criptográfica nem prova de frescor do banco. Permanecem necessários snapshot consistente e revisão humana.

### Prévia e desfazer

A prévia apresenta removidos, incluídos, preservados, conflitos e totais antes/depois por mês/tipo/status. Removidos/incluídos descrevem o conjunto substituído, não necessariamente variação líquida de quantidade; uma reaplicação idempotente pode substituir a mesma quantidade sem alterar conteúdo. `operations` discrimina fonte e período. Quando bloqueada por conflito, nenhuma transação da candidata é alterada e o resumo mostra zero remoções/inclusões; as operações propostas ficam no relatório.

Botão **Desfazer candidata** restaura a cópia anterior somente no resultado em memória, sem liberar gravações nem alterar a base ativa. É possível exportar a cópia anterior privada. Totais sem montante conhecido ficam indisponíveis; transferências continuam separadas de resultado/saldo. O bloqueio persistente, ETag, backups e diário existentes não são removidos; a ferramenta ainda não aplica nem sincroniza candidatas. Guardar as exportações privadas antes de fechar, pois candidata/undo não são persistidos automaticamente.

## Revisão integrada: carga Excel, pacotes e recuperação local

### Entrega e arquitetura

Worktree `/workspace/controle-financeiro-candidata`, branch `feat/atualizacao-candidata`, base `6976eaa49ab02194dcb7b4d981cdab81ef4f4c55`. Integração inicialmente local; em 26/10/2026 o usuário autorizou commit, push exclusivo desta branch e PR para revisão. Sem autorização de merge, deploy ou aplicação financeira. O checkout original, sua alteração documental, o patch recuperado e a PoC MCP foram preservados. Não foi recriado o motor financeiro nem introduzido executor MCP no aplicativo.

- `candidate-sources.js` adapta Excel e pacote validado ao mesmo modelo de transações existente. Reutiliza `FinanceCore.transaction` e `MinhasFinancasCore.preview`.
- `candidate-update.js` mantém a substituição por vencimento e a precedência do pacote em suas janelas completas. Identidades distintas de mesmo texto/data podem coexistir quando distinguíveis; vínculo anterior ambíguo bloqueia a prévia. IDs Excel são estáveis e compactos, com detecção de colisão antes da candidata.
- `minhas-financas-core.js` apenas expõe a verificação de alterações locais já usada internamente. A candidata protege essas edições, além de vínculos explícitos a financiamento, investimentos, construção, FGTS e contracheques. Os demais módulos e campos desconhecidos do envelope são clonados, sem regravação.
- Worker calcula a candidata; outro Worker já existente serializa exportações. Leitura/parse inicial dos Excel e assinaturas continuam tendo custo na thread principal; não há promessa de consumo fixo de memória ou ausência absoluta de pausas.

### Excel real e de/para vigente

Os três arquivos foram acessados pela pasta OneDrive fornecida e baixados fora do Git. Não foi lida nem substituída a base financeira real. A validação privada percorreu os campos e linhas dos arquivos; nenhum valor, descrição, observação ou identificador financeiro foi incorporado aos testes, documentos ou patch público.

| Fonte | Campo de entrada | Tratamento |
|---|---|---|
| Todos | Descrição, Valor, Vencimento | Obrigatórios; datas reais e valor reconhecido. Valores negativos preservados, sem zero inventado |
| Despesas/receitas | Lançamento, Efetivação, Situação | Datas separadas do vencimento. Situação reconhecida; data efetiva ausente continua ausente |
| Despesas | Cartão | Preservado junto da conta, sem inferir conta pelo cartão |
| Despesas/receitas | Categoria, Subcategoria, Recorrência | Preservadas conforme a fonte; não criam séries/parcelas futuras por extrapolação |
| Parcelamentos declarados | Sufixo n/total na descrição | Número preservado apenas quando a recorrência declara parcelamento; números em nomes arbitrários não viram parcelas |
| Todos | Observações, Tags | Cabeçalho plural reconhecido. Conteúdo preservado; não executado como instrução |
| Transferências | Origem, Destino, Vencimento, Valor | Origem/destino mantidos; conta igual ou ausente é rejeitada |
| Transferências | Situação/Efetivação ausentes neste relatório | `Não informado` e data vazia; não presume pagamento ou pendência. Conferência real ainda necessária |
| Todos | Campos adicionais | Preservados em sourceFields, apenas nas cópias privadas |

Os arquivos de despesas e receitas contêm ocorrências até 2044. A ausência de transferência em meses posteriores não comprova inexistência ou cobertura desses meses. Não há geração fictícia de ocorrências até 2044: a candidata utiliza as linhas existentes dentro do período permitido.

### Cobertura e controles

Na área Configurações > Importações (links antigos de Importar continuam funcionando), use Atualizar pelos relatórios Excel. Após selecionar os arquivos, a auditoria local mostra quantidades, totais lidos e avisos. Em Controles independentes, informe as quantidades e os totais assinados conferidos na fonte para cada relatório. Confirme o mesmo perfil, a referência de vencimento, ausência de filtros restritivos e cobertura do intervalo selecionado.

Os controles são comparados às linhas e não são preenchidos automaticamente com os números lidos. Essa conferência e a declaração humana de filtros/cobertura são necessárias: consistência interna do arquivo não autentica sua origem nem prova completude. Cobertura, perfil, tipos, contagens ou totais divergentes bloqueiam substituição. Um conjunto completo vazio pode remover somente registros gerenciados do período, após cobertura confirmada; arquivo/consulta incompleta nunca autoriza exclusão.

A seleção de período Excel vai de 01/10/2026 até 31/12/2044. Registros anteriores ao corte, fora do período, de outra fonte/perfil, manuais e protegidos permanecem intactos. Origem genérica Planilha só participa mediante opção explícita e revisão. Valores de transferências são movimentos, não saldo ou resultado operacional. Os totais mensais da prévia agrupam lançamentos com vencimento válido e deixam projeções separadas; valores desconhecidos não são tratados como zero.

### Pacote Minhas Finanças

Atualizar pelo Minhas Finanças opera somente por importação de JSON. O botão de consulta MCP direta permanece desabilitado. O adaptador não faz fetch, não recebe token e não reconecta ao serviço.

O pacote precisa passar pelos validadores existentes: páginas completas, perfil/moeda, vencimentos, detalhes necessários, totais e cobertura monetária coerentes, doze meses completos na janela selecionada e evidência de escopo sem filtros. Pacotes parciais e arquivos da PoC com `poc.sampleOnly` são recusados para substituição, mesmo que uma amostra tenha campos válidos. Falta de ocorrência em amostra não significa exclusão. O plugin prevalece sobre Excel apenas nas janelas completas já registradas, evitando reintrodução de registros substituídos por uma carga posterior de Excel.

O relato do usuário confirma OAuth/perfis da PoC no Windows. A consulta real search_transactions continua bloqueada por isError=true sem código reconhecido; depende do suporte do fornecedor. Nenhuma consulta real foi repetida nesta rodada. run_report foi identificado como ferramenta oficial possível, mas não foi usado como fallback nem incorporado sem contrato validado.

### Prévia, exportação e recuperação

Gerar prévia ativa/preserva o bloqueio de conciliação antes de trabalhar com fontes; não altera as stores financeiras. Exportações disponíveis: candidata, cópia anterior, relatório e revisão recuperável. Conflitos bloqueiam exportação da candidata e aparecem na prévia; relatório privado traz todas as ocorrências. A tabela exibe até 36 grupos, sem truncar o relatório completo.

Exportar revisão recuperável gera candidate-review-v1, contendo candidata, cópia anterior, relatório e assinatura da base original. Reabrir essa revisão mantém tudo isolado: só aceita o mesmo conteúdo de origem, estruturas e contagens válidas. Não grava, não restaura a base ativa e não executa conteúdo do JSON. Assinatura é comparação de conteúdo, não autenticação criptográfica de autoria. Alteração da base ativa ou troca de fontes durante o cálculo invalida a prévia. Arquivos acima de 64 MiB e revisões acima de 128 MiB são bloqueados.

Desfazer candidata restaura apenas a cópia em memória e mantém a escrita bloqueada. Não desbloqueie a conciliação para contornar revisão. Operações remotas já iniciadas antes do bloqueio não podem ser retroativamente canceladas; esta entrega não é um protocolo de aplicação da candidata nem de migração real. Não use importação normal/restauração de backup como atalho de aplicação.

### Primeira atualização real: pendências

Guardar backups privados atuais do navegador e OneDrive, conferir ETag e base ativa, identificar as origens que podem ser gerenciadas e reconciliar cobertura/filtros e controles com o aplicativo de origem. Revisar situação/efetivação das transferências e qualquer conflito ambíguo. Gerar e conferir candidata, relatório, cópia anterior e revisão recuperável. Aplicação exige desenho/revisão de recuperação e autorização específica posterior; nenhuma aplicação está implementada neste fluxo.

A carga histórica Excel e a revisão offline não dependem de resolver o MCP. O uso de pacote completo depende da obtenção de uma fonte validada; o botão direto depende adicionalmente de resolver a resposta do fornecedor e do CORS/arquitetura da integração publicada.
