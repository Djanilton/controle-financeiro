# PR #8 — revisão final e publicação controlada

## Escopo congelado

A branch incorpora a main (compactação de filtros) sem publicar no Pages. Entram a candidata por vencimento, comparação por observações privadas, importações anuais, construção integrada, investimentos/INSS na tabela existente e conciliação local de faturas. A PoC OAuth experimental não é parte do aplicativo. Não há migração física como requisito de publicação.

## Conferência OneDrive isolada

A entrada Conciliação/Importações recarrega em `?mode=invoice-readonly`. O loader separado não carrega app-state, integração/sincronização, construção, candidata ou transporte Graph de escrita. Não abre o IndexedDB operacional; histórico/cache usam o armazenamento da conciliação. Dados/assinaturas vazias do host não são usados como prova de preservação.

A sessão pede Files.Read/User.Read, usa cache MSAL em memória, não herda o cliente operacional e autoriza somente GET das pastas configuradas de faturas/relatórios. Leitura de conteúdo exige metadados anteriores coerentes (nome, pai, ID, ETag, tamanho). JSONs operacionais não recebem capacidade de leitura. Reautenticação apenas explícita; nenhum timer ou renovação silenciosa. Permissões de escrita antigas não ampliam essa capacidade.

O teste Chromium negativo verifica os objetos e chaves físicos da base principal e backup, localStorage pré-existente, ausência de abertura da base, scripts operacionais, intervalos e Graph de base/escrita, incluindo login, reconexão, recarga, foco e passagem do tempo. Usa autenticação/Graph sintéticos com grants antigos de escrita. Testes unitários também bloqueiam métodos, caminhos, metadados divergentes e transição durante tarefa operacional.

**Limite real:** cadastrar `source-auth.html` como redirect SPA no Entra para cada origem de teste/publicação antes de validar login real. O callback sozinho não inicializa o aplicativo. Esta rodada não autentica conta nem verifica concessões reais. O modo operacional normal continua separado, com suas permissões e autorizações anteriores; não é convertido globalmente em somente leitura.

## Interface conferida

Relatório de faturas aparece antes de formulários: atualização, resumo, filtros, indicadores e tabela. Histórico e opções avançadas ficam recolhidos. Vínculos, layouts e equivalências têm formulários guiados; editores compatíveis permanecem como alternativa técnica. Não há download antes do consentimento do lote; desconhecidos bloqueiam e encaminham à revisão. Marcação, exportação e histórico continuam locais. Resultados parciais nunca viram cobertura integral.

## Publicação e recuperação (somente após aprovação)

1. Conferir CI do SHA exato, revisão de segurança e callback Entra; manter PR em rascunho até aprovação.
2. Fazer backup/exportação privada do estado local antes de eventual uso com fontes reais; não anexar ao GitHub.
3. Publicação de código é decisão separada: revisar, retirar rascunho, aprovar e só então merge/deploy main. Nenhuma dessas ações foi executada nesta rodada.
4. Se houver regressão, reverter o merge de código por PR e publicar a versão anterior. Não apagar IndexedDB, preferências, backups ou histórico; não tentar rollback financeiro mediante JSON vazio.
5. Rotas antigas dos JSONs permanecem ativas; salvar caminho futuro não muda a rota. Migração terá outro PR, inventário e autorização de execução próprios.

## Validações privadas separadas e critérios de aceite

| Área | Critério para aceite real | Bloqueio preservado |
|---|---|---|
| Construção/SAC | Confrontar mês a mês principal, juros, encargos, FGTS, liberações e saldo com referência aprovada; explicar diferenças e arredondamentos | Sem importar/regravar referência automaticamente |
| Contracheques/virada anual | Conferir competências, rubricas, totais e ausência de duplicação entre anos | Prévia e autorização de aplicação |
| NEOS/FGTS | Conferir saldos e movimentos por competência, fontes e dupla contagem | Não preencher ausência com zero |
| INSS | Conferir tabela única, fontes e fórmulas por competência; validar períodos ainda sem regra comprovada | Sem aplicar prévia; fora do patrimônio resgatável |
| Itaú/MF | Conferir cartão/ciclo, totais oficiais, parcelas, créditos e ambiguidades, usando arquivo privado | Correção manual no MF; sem escrita |
| Histórico privado | Conferir recuperação local e versões; para sync, backup remoto/ETag/releitura com autorização | Transporte de escrita não instanciado |
| Candidata 12 meses | Três relatórios completos e controles independentes, vencimentos, totais, protegidos, backup e revisão | Sem aplicação; MCP parcial não substitui janela |

Essas validações não são alegadas pelos testes sintéticos. Capturas públicas usam apenas estado vazio ou dados fictícios. Consumo Chromium/Linux não prevê desempenho Windows. Novos formatos bancários e falhas de permissão continuam bloqueados com diagnóstico; não justificam ampliar o escopo do PR #8.

## Evidência local final

448 testes Node; 24 roteiros Chromium sintéticos aprovados (incluem cenários com múltiplas asserções/testes); verificador Python dentro da suíte Node; diff sem erros de espaços. Navegação efetiva das seis áreas de construção em dois tamanhos corrigiu o menu ativo fora da área visível. Conferência isolada ganhou retorno explícito com confirmação. Capturas viewport e de relatórios sintéticos examinadas; não se equipara passagem de testes à validação visual nem à validação financeira real. Roteiros legados que precisam de arquivos privados não são parte desta rodada.

A medição local com 30.000 ocorrências manteve assinatura ativa/bloqueio: 5.551 ms de prévia, 2.182 ms de exportação, 935 ms de recuperação, RSS agregado ~1,77 GiB. Continua sendo risco para máquinas com pouca memória; não há promessa de desempenho Windows nem otimização financeira nova nesta rodada.
