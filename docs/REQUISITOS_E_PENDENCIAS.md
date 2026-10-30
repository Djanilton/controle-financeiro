# Requisitos e pendências — Controle Financeiro

**Atualizado em:** 28/10/2026

**Aplicação principal:** [Djanilton/controle-financeiro](https://github.com/Djanilton/controle-financeiro)

**Legado de referência:** [Djanilton/minha-obra-app](https://github.com/Djanilton/minha-obra-app)

**Branch da implementação:** `fix/auditoria-motor-migracao`; **base desta auditoria:** `main` em `1a8a700`.

**Publicação:** deploy do GitHub Pages concluído com sucesso em 25/10/2026, pelo [PR #1](https://github.com/Djanilton/controle-financeiro/pull/1).

**Commit publicado da implementação:** `c32c4bfb8181a3b675a2af257d0c26b7a8cd0a21`.

**Deploy verificado:** [workflow 40203918065](https://github.com/Djanilton/controle-financeiro/actions/runs/40203918065).

**Aplicativo:** [Controle Financeiro](https://djanilton.github.io/controle-financeiro/).
**Commit da implementação:** `4c2c3d50384764ebccf7e0ea34717b0e377412af`.
**Referência de acompanhamento:** este arquivo, conforme a seção Acompanhamento consolidado obrigatório do `AGENTS.md`.

## Resposta sobre conclusão

**A migração integral ainda não está encerrada e o plano completo não foi concluído.** Os recursos úteis identificados no inventário do Minha Obra têm implementação ou substituição documentada no código local. Isso não equivale a aceite do usuário, paridade de todos os dados financeiros atuais, validação externa ou atualização do app publicado.

A auditoria, as correções e a migração funcional identificada foram executadas e testadas localmente. Continuam pendentes: base financeira completa e saldos atuais, autenticação/permissões e gravações reais, abertura dos anexos, instalação/dispositivos físicos, aceite das diferenças e CRUD remoto do Minhas Finanças. A publicação técnica para conferência foi concluída; não encerra essas pendências. Não há evidência para declarar esses itens funcionais e externos concluídos.

**A main do GitHub já contém a implementação e o acompanhamento, com publicação técnica confirmada pelo workflow.** A nova orientação do `AGENTS.md` foi preservada. O PR #1 foi mesclado e o deploy concluiu com sucesso. O teste HTTP direto a partir deste ambiente foi bloqueado pelo proxy; a conferência visual/funcional do usuário ainda não foi realizada.

## Objetivo e estados

Centralizar funcionalidades financeiras, investimentos e construção no Controle Financeiro, preservando histórico, dados privados, cálculos, telas, documentos, sincronizações e testes. O Minha Obra permanece referência; não retomar desenvolvimento paralelo nem copiar dependências e pontos de entrada obsoletos indiscriminadamente. Preservar versões e licenças e justificar substituições/arquivamentos.

| Status | Significado neste documento |
|---|---|
| **não verificado** | Não executado, não implementado ou sem evidência suficiente; o texto especifica o caso |
| **em andamento** | Parte do requisito atendida; escopo restante identificado |
| **bloqueado** | Validação/implementação impedida por acesso, falha de serviço ou capacidade externa identificada |
| **implementado** | Mudança disponível no código local, com testes indicados; não significa publicação ou aceite integral |
| **validado** | Escopo específico efetivamente conferido pelos testes/leitura descritos; não extrapolar para produção ou operações reais |

Os requisitos amplos somente serão encerrados após atender seus critérios de aceite. Validações técnicas limitadas podem ser registradas como **validado** sem marcar o requisito inteiro como concluído. Não há percentual global de conclusão calculado.

## P0 — Migração integral do Minha Obra

**Status geral: em andamento.** Implementação funcional identificada disponível localmente; aceite e validações externas pendentes. A matriz dos 22 arquivos legados, destinos, equivalências e substituições está em [Validação do motor e migração](VALIDACAO_MOTOR_E_MIGRACAO.md). A memória de regras está em [Memória dos cálculos da construção](MEMORIA_CALCULOS_CONSTRUCAO.md).

| ID / requisito | Status e execução realizada | Arquivos / evidências | Pendência para encerramento |
|---|---|---|---|
| MIG-01 — Inventário recursivo dos dois repositórios, inclusive docs, testes, ferramentas, ativos, PWA e configurações | **validado**, no escopo das árvores auditadas: 22 arquivos no legado e 124 na versão então auditada do destino | Árvores GitHub, hashes e matriz em `VALIDACAO_MOTOR_E_MIGRACAO.md` | Novos arquivos locais desta execução estão registrados abaixo; inventário não comprova comportamento por si só |
| MIG-02 — Matriz por caminho e decisão de integrar/substituir/arquivar | **implementado**: cada caminho legado identificado tem destino ou substituição e limites documentados | Matriz por arquivo e seção Substituições deliberadas no relatório | Aceite do usuário das diferenças e substituições |
| MIG-03 — SAC, TR, MIP, juros de obra, liberações, amortizações, FGTS, PLR, aportes, rendimentos, reserva, insuficiências e quitação | **validado**, nos cenários de referência e testes independentes descritos em E-02 a E-06 | `sac-engine.js`, `construction-finance.js`, `sac-adapter.js`, `tools/validate_financing.py`; suítes e validadores | Não comprova cobrança bancária real, ótimo global da estratégia ou reconciliação da base financeira completa |
| MIG-04 — Premissas, parâmetros, resumo, despesas, cronograma, obrigações, gráficos, financiamento e recursos próprios | **implementado**, com navegação e propagação conferidas em navegador isolado | `construction/`, `construction-host.js`, `integration-ui.js`; cinco scripts de navegador em E-07 | Conferência do usuário no app, autenticação real e dispositivos físicos |
| MIG-05 — Campos, formulários, tabelas, documentos, anexos e compatibilidade de IDs | **validado**, para preservação estrutural nas bases privadas lidas e fluxos testados | `construction-migration.js`; testes de importação, host, campos e fluxos; E-06/E-07 | Permissão, conteúdo e abertura de cada anexo remoto não conferidos |
| MIG-06 — Importação de planilha/JSON, OneDrive/SharePoint, persistência e backups sem sobrescrever origens | **em andamento**: importações e acesso centralizado à planilha implementados; backup anterior à importação e testes sintéticos de ETag/conflito | `app-refinement.js`, `construction/engine-ui.js`, `construction/embedded.js`, `construction-host.js`, `app-state.js`; testes de importação e host | OAuth e gravação reais, leitura da base financeira completa e suporte geral a bibliotecas SharePoint não validados; D-03/D-04 |
| MIG-07 — Portar testes relevantes e adaptar navegador | **validado**, para os casos executados: campos, foco, diálogos, edição durante envio, documentos, upload simulado, ICS, gráficos, recarga, sessões e offline de página carregada | `tests/browser-construction-fields.cjs`, `browser-construction-workflows.cjs`, `browser-construction-sessions.cjs`, `browser-construction-migration.cjs`, `browser-runtime.cjs`, `construction-browser-harness.cjs` | Testes de duas aplicações substituídos pelos da aplicação única; não declarar cobertura de todas as combinações possíveis |
| MIG-08 — Conferência mensal com planilha de referência indicada | **validado**, somente em leitura; planilha encontrada com modificação em 18/10/2026 | E-02 a E-05; `verify-workbooks.cjs`, `verify-migration.cjs`, `validate-reference.cjs`, extrator e validador Python | Conferência usa valores salvos, sem recálculo ao vivo do Excel; não substitui conferência de saldos/transações atuais |
| MIG-09 — PWA, cache, estáticos, responsividade, foco e atualização sem perda | **em andamento**: arquivos locais, viewport a 390 px, foco, recarga e edição de página carregada offline conferidos | Manifesto, `index.html`, `construction/index.html`, testes de navegador | Instalação física e arranque offline não verificados; nenhum service worker foi introduzido |
| MIG-10 — Relatório de paridade e diferenças aceitas | **implementado**: relatório, matriz e memória consolidados | `VALIDACAO_MOTOR_E_MIGRACAO.md`, `MEMORIA_CALCULOS_CONSTRUCAO.md`, `CALCULOS.md`, README | Aceite do usuário ainda não realizado |
| MIG-11 — Legado somente referência após aprovação, sem exclusão | **validado**, apenas quanto ao estado remoto consultado: repositório arquivado e Pages despublicado antes desta execução | Inventário remoto e histórico de `INTEGRACAO_MINHAS_FINANCAS.md` | Não foi executado novo arquivamento/exclusão; estado histórico não comprova aceite desta entrega |

**Critério de aceite preservado:** cada funcionalidade/arquivo deve ter destino, equivalência verificada ou descarte justificado e aprovado; testes aprovados e diferenças mensais explicadas. Implementação local e testes não encerram o aceite nem a publicação.

## Correções e entregas registradas na branch

Todas as linhas abaixo pertencem à branch `fix/auditoria-motor-migracao`. Implementação original no commit `4c2c3d5`, incorporada à main pelo PR #1 no commit publicado `c32c4bf`. **Implementado** refere-se ao código local; os resultados efetivamente executados estão em E-01 a E-07.

| ID | Status / alteração | Arquivos relevantes | Testes realmente executados / resultado | Problemas restantes |
|---|---|---|---|---|
| COR-01 | **implementado**: importação deixa de impor FGTS histórico e de anunciar principal fixo; conserva parâmetros e separa referência/cenário | `construction/engine-ui.js`, `integration-ui.js` | `construction-import.test.cjs`, referência da planilha; aprovados | Valores vigentes do contrato ainda exigem conferência externa |
| COR-02 | **implementado**: importação reprovada conserva estado/bytes; importação válida guarda cópia anterior recuperável | `construction/engine-ui.js`, `construction/embedded.js` | `construction-import.test.cjs`; aprovado | Recuperação no perfil real do usuário não executada |
| COR-03 | **implementado**: amortização excedente e após quitação retorna à reserva; FGTS/PLR/aportes não recebem a mesma redução duas vezes; PLR sem uso é conservada | `sac-engine.js` | `amortization-sources.test.cjs`, `fgts-balance.test.cjs`, `balanced-projection.test.cjs`, validação independente; aprovados | Sem execução bancária; FGTS excedente permanece separado do caixa |
| COR-04 | **implementado**: merge de obrigações por identidade/atualização, exclusões e conflitos; preservação de subcampos privados desconhecidos | `construction-migration.js`, `construction/embedded.js` | `construction-migration.test.cjs`, `construction-host.test.cjs`, `unification.test.cjs`; aprovados | Base comum e revisão continuam necessárias em conflitos |
| COR-05 | **implementado**: cópias de rascunhos por sessão, recarga, recuperação de aba encerrada e cálculo com o editor da própria janela | `construction-drafts.js`, `construction-host.js`, `construction/embedded.js` | `construction-drafts.test.cjs`, `browser-construction-sessions.cjs`, fluxos de navegador; aprovados | Sincronização entre dispositivos físicos não conferida |
| COR-06 | **implementado**: estratégia cadastrada é preservada na migração; Equilibrado permanece escolha explícita, sem reaplicar/reverter políticas antigas | `construction-migration.js`, README | `balanced-projection.test.cjs` e regressão completa; aprovados | Aceite do usuário das estratégias e diferenças documentadas |
| EXP-01 | **implementado**: Excel atual separado da planilha original; inclui custos editados, programações, obrigações, cláusulas/fontes, histórico de anexos e motor | `construction-export.js`, `construction/embedded.js`, `construction/index.html` | `construction-export.test.cjs`, navegador de migração com download/leitura do Excel; aprovados | Substitui o espelho Excel automático legado por exportação local; JSON é o backup integral |
| IMP-01 | **implementado**: leitura da planilha da construção em Configurações > Importações > Carga inicial e recuperação, com sessão/confirmação e cópia anterior | `app-refinement.js`, `construction/embedded.js` | `refinement.test.cjs`, `construction-import.test.cjs`, navegador de opções; aprovados no escopo isolado | Leitura por OAuth no dispositivo real não testada |
| VAL-01 | **implementado**: extrator de fórmulas/caches, CLI de referência e reconstrução Python independente recuperados/adaptados | `tools/extract_workbook.py`, `tools/validate_financing.py`, `tests/validate-reference.cjs`, `verify-migration.cjs`, `verify-private-construction.cjs` | Executados na planilha e nos JSONs de construção, somente leitura; E-02 a E-06 | Fonte bancária completa não acessível; reconstrução não prova ótimo global nem cobrança bancária |
| DOC-01 | **implementado**: matriz, memória, instruções de exportação/importação e estado atual das capacidades Minhas Finanças | README, `docs/CALCULOS.md`, `MEMORIA_CALCULOS_CONSTRUCAO.md`, `VALIDACAO_MOTOR_E_MIGRACAO.md`, `INTEGRACAO_MINHAS_FINANCAS.md`, este arquivo | Revisão documental e verificação de links/consistência nesta atualização | PR #1 mesclado e deploy confirmado; acompanhamento de publicação registrado abaixo |
| TEST-01 | **validado**, no escopo executado: portabilidade e ampliação da regressão automatizada | Suítes `tests/`, scripts de navegador e helpers | 212 testes e 11 cenários de navegador aprovados; E-01/E-07 | Não significa que todos os testes de navegador do repositório ou autenticações reais foram executados |

## P0 — Integração bidirecional com Minhas Finanças

**Status geral: em andamento.** O site importa e concilia pacotes privados e mantém intenções locais de envio; **não executa CRUD remoto**. O objetivo de consultar, importar, criar, editar, excluir e sincronizar resultados com o serviço ainda não foi atingido integralmente.

As ferramentas oficiais consultadas já expõem operações de escrita. Não classificar toda escrita como dependente de futura criação pelo fornecedor. Separar capacidade do serviço, permissão da conexão e implementação no site. Detalhes em [Integração Minhas Finanças](INTEGRACAO_MINHAS_FINANCAS.md).

| ID / requisito | Status / o que já existe | Arquivos / evidências | Trabalho restante |
|---|---|---|---|
| MF-01 — Importar receitas, despesas e transferências com período, paginação, filtros e incremental quando permitido | **em andamento**: dois formatos de pacote privado, páginas/janelas, BRL/perfil/totais validados; detecção de pacote por ETag/foco/intervalo | `minhas-financas-core.js`, `minhas-financas-ui.js`; testes `minhas-financas*.test.cjs` e navegador aprovados | Cliente direto de consulta/incremental no serviço não implementado; pacote é gerado fora do site a pedido no chat |
| MF-02 — IDs estáveis, categorias, contas, cartões, parcelas, recorrências e vínculos | **em andamento**: associação local/remota por ID/ocorrência, detalhes, parcelas e desdobramentos contemplados na importação | Núcleo Minhas Finanças, `transaction-entry.js`, testes de origem e conciliação | Consulta integral/atualização de entidades e vínculos pelo site ainda não implementada |
| MF-03 — Criar remotamente com confirmação/permissão | **não verificado**: executor de criação remota não implementado no site; intenções locais não são comandos aplicados | `transaction-entry.js`, fila `manual.pluginOutbox`; ferramentas de criação do serviço expostas | Arquitetura, consentimento, prévia, confirmação, envio, status, idempotência e releitura |
| MF-04 — Editar remotamente preservando IDs/histórico, parcela versus série | **não verificado**: executor remoto não implementado no site | Serviço expõe edição de avulsas e ferramentas de valor de ocorrências fixas/parceladas | D-01/D-02; mapear registro, mês, escopo e elegibilidade; nunca excluir/recriar como substituto |
| MF-05 — Excluir remotamente com confirmação, rastreabilidade e recuperação se suportada | **não verificado**: executor remoto não implementado no site | Ferramenta de exclusão exposta com escopos e aviso de irreversibilidade | Confirmar consentimento/semântica; não prometer reversão; nenhuma exclusão real executada |
| MF-06 — Enviar cálculos de financiamento durante obra/casa e rendimentos às transações corretas | **não verificado**: sincronização de saída não implementada | Motor e intenção local são componentes existentes, sem prova de atualização remota | Mapear IDs/mês/tipo/vínculo; distinguir previsto/realizado e operações elegíveis; impedir duplicação |
| MF-07 — Reconciliar importações e registros locais sem converter projeção em realizado | **em andamento**: conflitos, edição local, desaparecimento de item, IDs, categorias e repetição protegidos na importação | Núcleo/UI Minhas Finanças; testes e navegador aprovados | Conciliação após escrita remota e estados parciais não implementados |
| MF-08 — Erros, expiração, permissões, limites, conflitos e repetição | **em andamento**: cenários de pacote inválido/conflito/repetição testados | Suítes Minhas Finanças; proteção da base privada existente | Tratamento e testes dos erros de escrita/API, limite, resposta incerta e sessão expirada ainda pendentes |

### Dependências do fornecedor e decisões de integração

| ID | Status / evidência | Pendência e responsável pelo próximo passo |
|---|---|---|
| D-01 — Contrato, catálogo e permissões de escrita | **em andamento**: capacidades e schemas oficiais lidos; ferramentas de valor/exclusão expostas não constavam de toda a lista retornada por capabilities | Confirmar catálogo, consentimentos e elegibilidade; documentação de API externa, OAuth/CORS, autenticação, limites/rate limiting e arquitetura chat/mediador/navegador. Capacidade MCP não comprova acesso direto seguro do site |
| D-02 — Classes e operações ainda excluídas | **bloqueado**, para operações não suportadas pelas ferramentas inspecionadas: vínculos de empréstimo, Open Finance e outras exclusões; não há lote atômico de escritas | Depende de capacidade oficial específica quando o caso concreto se enquadrar. Confirmar parcelas/séries, investimentos, saldo devedor e escopos; não contornar por lançamentos substitutos. Solicitação formal ao desenvolvedor não foi aberta |
| D-03 — Base financeira completa e saldos atuais | **bloqueado**: leitura de `controle-financeiro-app.json` terminou com `Transport closed` no conector | Restabelecer leitura autorizada ou disponibilizar cópia privada adequada; depois conferir saldos, transações, FGTS e integração patrimonial. As bases privadas de construção foram lidas, mas não substituem a base financeira |
| D-04 — Validação externa/manual | **não verificado**: não executadas autenticação e gravação reais, abertura individual dos anexos, instalação e uso em dispositivos físicos | Execução autorizada e conferência do usuário; testes isolados não encerram esta etapa |
| D-05 — Revisão e publicação | **validado**, no escopo da publicação técnica: PR #1 mesclado, commit `c32c4bf`, workflow 40203918065 com sucesso | Teste HTTP direto bloqueado pelo proxy deste ambiente; aceite visual/funcional permanece em D-04 |

As ferramentas de criação, edição de avulsas, alteração de valores de parcelas/recorrências e exclusão já expostas não foram usadas para alterar dados reais. Só abrir solicitação ao fornecedor por capacidades efetivamente ausentes; a indisponibilidade geral de escrita registrada anteriormente foi superada. Nenhuma mensagem foi enviada ao desenvolvedor nesta execução.

**Arquitetura e segurança mantidas:** modo de importação/leitura continua disponível; prévia/diff e confirmação são obrigatórios na futura escrita, com correlação de IDs, idempotência e conflitos explícitos. Despesa e resgate são operações separadas, sem atomicidade. Publicação de comando não comprova aplicação no dispositivo. Tokens e credenciais não pertencem ao GitHub Pages. Projeções não devem reescrever realizados.

**Critério de aceite preservado:** testes sintéticos de CRUD e sincronização, funções/permissões liberadas e validação manual autorizada, com estado de cada operação visível na interface. Esse critério ainda não foi atendido.

## P1 — Validação e sincronização financeira

| ID / requisito | Status / execução | Evidência | Pendência |
|---|---|---|---|
| FIN-01 — Fontes e critérios dos saldos/investimentos, inclusive Sofisa e Investimento Itaú | **em andamento**: critérios de corte, fontes elegíveis e prevenção de duplicação inspecionados/testados | `finance-bridge.js`, `financial-model.js`, testes de saldos, reserva e fechamento | D-03: saldos atuais da base completa não conferidos |
| FIN-02 — Parâmetros Caixa atualizados sem constantes históricas | **em andamento**: importação corrigida; referência indicada conferida; principal/FGTS/prazo da fonte preservados | COR-01, MIG-08, testes de importação | Conferência externa dos parâmetros contratuais vigentes. Os valores históricos de principal, FGTS e prazo continuam referências, não valores a impor |
| FIN-03 — Não duplicar juros, amortizações, PLR, FGTS, rendimentos, transferências e despesas históricas | **validado**, nos cenários sintéticos, referência e base de construção descritos em E-01 a E-06 | Motor, ponte, testes de fontes/amortização/FGTS/reserva/patrimônio e Python | Reconciliação de todos os lançamentos reais depende de D-03; não extrapolar a validação local |
| FIN-04 — Reconciliação/backups das bases privadas com Graph/OneDrive | **em andamento**: backup, ETag, preservação de rascunho e conflito testados com respostas simuladas; leitura real das bases de construção | `construction-host.js`, `app-state.js`, testes de host/estado/sessões e E-06 | Base financeira completa e gravações reais não validadas; D-03/D-04 |
| FIN-05 — Integração de previsões, relatórios e transações realizadas | **em andamento**: separação previsto/realizado e conciliação de pacote têm testes aprovados | Integração, Minhas Finanças, patrimônio e testes | Confronto completo com dados atuais e sincronização de saída; MF-06/D-03 |

Referências históricas para FIN-02: financiamento de R$ 339.000, FGTS de R$ 77.000 separado do principal e prazo de 411 meses. São referências de conferência, nunca constantes para impor; a fonte vigente e o contrato precisam ser confirmados.

## Evidências de execução

Os resultados abaixo foram efetivamente obtidos nas etapas anteriores desta execução. Nesta atualização documental eles foram consultados e consolidados, **não reexecutados**. Dados privados permanecem fora do repositório; não publicar valores, linhas, IDs, links particulares ou cópias das fontes.

| ID | Execução e resultado | Limite da evidência |
|---|---|---|
| E-01 | `node --test --test-isolation=none tests/*.test.cjs`: **212 testes aprovados**, sem falhas, cancelamentos ou ignorados | Não inclui automaticamente todos os scripts `browser-*.cjs`; testes financeiros usam cenários sintéticos |
| E-02 | `verify-workbooks.cjs`: **9.698 valores**, zero divergências acima de R$0,01; diferença máxima aproximada de 2,84 × 10⁻¹⁴ | Valores salvos da planilha, sem recálculo ao vivo do Excel |
| E-03 | Extrator Python + `validate-reference.cjs`: **9.697 valores e 8.385 fórmulas**, nenhuma sem mapeamento e nenhuma divergência | Representação do mapa extraído difere do fluxo XLSX; contagens não são intercambiáveis |
| E-04 | `verify-migration.cjs`: **20.237 verificações numéricas, 413 meses**, diferença máxima zero | Comparação entre adaptação legada e integrada no cenário de referência; regras atuais deliberadamente distintas têm testes próprios |
| E-05 | Validador Python nos três cenários derivados da planilha: **6.608 verificações por cenário, 413 meses**, diferença máxima zero | Reconstrói SAC/fontes e verifica conservação de caixa; não é implementação independente de toda a otimização, tributação ou política de salário |
| E-06 | `verify-private-construction.cjs` e leitura das bases antiga/integrada: nenhum ID/referência de anexo ausente; cenário integrado com outras **6.608 verificações, 413 meses**, diferença máxima zero e sem dívida negativa | Preservação estrutural não prova abertura dos anexos; fonte bancária completa não foi verificada nem permite concluir cobertura de todos os pagamentos |
| E-07 | Cinco scripts de navegador aprovados: migração, campos, fluxos, sessões e Minhas Finanças; **11 cenários** | Perfis isolados, dados sintéticos, rede externa bloqueada e host simulado. Inclui download/leitura de Excel, foco, recarga, conflitos, upload simulado, ICS, gráficos, opções, offline de página carregada e viewport a 390 px |
| E-08 | Atualização documental atual: confronto do `AGENTS.md` remoto, revisão de status, referências locais e `git diff --check` | Nenhuma mudança funcional nem execução externa nesta atualização |

E-07 corresponde a `browser-construction-migration.cjs`, `browser-construction-fields.cjs`, `browser-construction-workflows.cjs`, `browser-construction-sessions.cjs` e `browser-minhas-financas.cjs`. Os 20 casos legados adaptados temporariamente passaram na auditoria inicial; sua incorporação é rastreada pelos equivalentes da matriz, sem tratá-los como 20 testes adicionais da suíte final de 212.

## Plano de implementação por etapas — posição consolidada

| Etapa do plano recomendado | Status | Executado | Falta |
|---|---|---|---|
| 1 — Consolidar referência e aceite | **em andamento** | Auditoria, inventário, matriz, memória e requisitos consolidados | Aceite das diferenças/substituições |
| 2 — Corrigir riscos de dados e premissas | **implementado** | COR-01 a COR-06, testes locais e preservação estrutural | Conferência no app e validação externa pertinentes |
| 3 — Fechar lacunas de migração | **implementado** | Exportação atual, ferramentas, memória, campos, fluxos e sessões identificados no legado | Aceite funcional final e dispositivos reais |
| 4 — Fixar contrato Minhas Finanças | **em andamento** | Leitura de capabilities/schemas e registro dos limites | D-01/D-02, arquitetura, consentimento e catálogo; nenhum contato externo realizado |
| 5 — Integrar escrita suportada | **não verificado** | Intenções locais e importação são componentes prévios | Executor CRUD, confirmação, idempotência, status, releitura e testes de escrita não implementados no site |
| 6 — Vincular cálculos e ocorrências remotas | **não verificado** | Motor calcula cenários e importação associa registros | Sincronização de saída por ID/mês/escopo e elegibilidade não implementada |
| 7 — Validar dados reais e entrega | **em andamento** | Planilha e bases da construção lidas; E-02 a E-06 | D-03/D-04, saldos e transações completos, OAuth, escrita, anexos e dispositivos |
| 8 — Revisar e publicar | **em andamento** | Publicação técnica concluída: PR #1 mesclado e deploy confirmado; documentação de resultado enviada incorporada à `main` pelo PR #2 (`1a8a700`) | Aceite final e conferência no app ainda pendentes; demais lacunas do plano continuam abertas |

A ordem original de auditoria → contrato do fornecedor/leitura segura → migração incremental → CRUD autorizado → validação/publicação continua válida. A migração avançou independentemente do CRUD. Não foi criada solicitação ao fornecedor, monitoramento, tarefa futura ou execução assíncrona de acompanhamento.

## Regras e critérios para a próxima atualização

- Seguir `AGENTS.md`, README e este acompanhamento consolidado. Atualizar os itens afetados junto com qualquer mudança de estado, na mesma branch/PR.
- Registrar status, resumo, arquivos, testes realmente executados, limites, pendências e commit/PR ou branch. Não marcar publicação, sincronização ou aceite com base apenas em código existente ou em teste simulado.
- Não apagar pendências anteriores válidas, nem marcar toda a migração ou todo o plano como concluído enquanto MIG-02/MIG-10, D-01 a D-05 e os requisitos MF/FIN aplicáveis permanecerem abertos.
- Não executar alterações financeiras reais, exclusões, migrações destrutivas, sobrescritas, commits ou publicação automaticamente; respeitar autorização específica e a política de branch/deploy.
- Preservar os originais, IDs, campos privados, backups e conflitos. Não enviar dados privados, credenciais ou fontes financeiras ao repositório público.
- Só encerrar a entrega após evidenciar os critérios de aceite, registrar a conferência do usuário e distinguir a versão publicada da branch local.

## Publicação autorizada para conferência — 25/10/2026

O usuário autorizou publicar o aplicativo e manter o GitHub atualizado. Esta autorização cobre commit, envio da branch, PR, merge e acompanhamento do GitHub Pages. Não altera as restrições sobre gravações financeiras reais, não encerra o aceite funcional e não marca MF-03 a MF-06 como implementados. Antes do envio, foram reexecutados os 212 testes e os cinco scripts de navegador (11 cenários), todos aprovados. O PR #1 foi aberto após atualizar a branch sobre a main mais recente, preservando as orientações e requisitos adicionados pelo usuário. O PR #1 foi mesclado no commit `c32c4bf` e o workflow 40203918065 concluiu com sucesso. A atualização do resultado na documentação não altera o código funcional publicado.

## Resultado da publicação para conferência

| Registro | Status / resultado verificado | Evidência / limite |
|---|---|---|
| PUB-01 — Atualização do GitHub | **validado**: PR #1 mesclado; código, testes e documentos integrados à main | [PR #1](https://github.com/Djanilton/controle-financeiro/pull/1), commit `c32c4bfb8181a3b675a2af257d0c26b7a8cd0a21` |
| PUB-02 — GitHub Pages | **validado**: workflow Publicar no GitHub Pages e etapas de upload/deploy concluídos com sucesso | [Execução 40203918065](https://github.com/Djanilton/controle-financeiro/actions/runs/40203918065) |
| PUB-03 — Abertura pública a partir deste ambiente | **bloqueado**: requisição HTTP direta impedida pelo proxy (403 no CONNECT) | Conferência visual/funcional no endereço público cabe à revisão no navegador do usuário; não foi tratada como teste aprovado |
| PUB-04 — Registro do resultado | **validado**: atualização documental incorporada à `main` pelo PR #2 (`1a8a700`), sem mudança funcional | Commit/PR desta atualização registrados no histórico do GitHub; o registro não reexecuta nem encerra validações externas |

A publicação técnica não altera MF-03 a MF-06, D-01 a D-04, FIN-01/FIN-02/FIN-04/FIN-05 nem os critérios de aceite ainda abertos. Não foram gravadas transações ou bases financeiras reais.

## Auditoria da versão publicada — 25/10/2026

Base: `main` no commit `1a8a700dbb73795655ddb2486412b4eff50d2bac`. Foram relidos `AGENTS.md`, este documento, o histórico Git e o inventário dos 71 arquivos em `tests/`. O PR #1 (`c32c4bf`) publicou a implementação; o PR #2 (`1a8a700`) atualizou a documentação. Esta auditoria documental não reexecutou testes nem leu dados financeiros privados. E-01 a E-07 registram os resultados da execução anterior; a existência dos 71 arquivos de teste não comprova a execução de todos eles.

| Situação comprovada | Funcionalidades / arquivos | Evidência e limite |
|---|---|---|
| Implementado e validado localmente | Importação segura e backup (`construction/engine-ui.js`, `construction/embedded.js`); amortização, FGTS e PLR (`sac-engine.js`); merge de obrigações (`construction-migration.js`); rascunhos (`construction-drafts.js`, `construction-host.js`); exportação (`construction-export.js`) | COR-01 a TEST-01, E-01 a E-07; publicação pelo PR #1 e workflow 40203918065. Validação limitada a cenários sintéticos e fontes descritas. |
| Implementado, sem validação externa | Leitura OneDrive no perfil real, recuperação de backup real, anexos, instalação/arranque offline, parâmetros contratuais vigentes e conferência funcional do site publicado | MIG-05/06/09, FIN-02, D-04 e PUB-03; testes simulados não encerram esses itens. |
| Incompleto | Consulta direta e CRUD remoto do Minhas Finanças, releitura após escrita e envio de projeções por ocorrência | MF-01 a MF-08; intenções locais e importação de pacotes não comprovam escrita remota. |
| Dependências e problemas conhecidos | Base financeira completa; contrato de autenticação, permissões, API/CORS e capacidades específicas do fornecedor | D-01 a D-03: `Transport closed` na leitura da base; proxy 403 na abertura HTTP pública (PUB-03). Sem evidência de resolução. |

**Prioridades:** P0, conferir o aplicativo publicado e recuperar acesso autorizado à base financeira completa para reconciliar saldos; P0, definir contrato seguro com Minhas Finanças; P1, implementar CRUD com prévia, confirmação, idempotência e releitura; P1, validar OAuth, anexos e PWA em dispositivos reais. Preservar a matriz e atualizar este documento junto com cada alteração futura, conforme `AGENTS.md`.

## Etapa 1 — proteção da leitura concorrente (25/10/2026)

Base atualizada por fetch: `56f127584c446fff8b9c632868ae9879f9be5125`. Branch local `fix/integridade-leitura-base`, sem commit, push ou publicação nesta etapa.

- **Anterior:** leitura validava formato e ETag, mas não detectava edição local ocorrida enquanto o conteúdo era baixado. **Atual: implementado e validado em cenário sintético**: `app-state.js` compara a assinatura local anterior ao download antes de aplicar a resposta; divergência interrompe a aplicação com erro explícito e preserva a edição.
- `tests/app-state.test.cjs`: regressões para edição durante download e falha `Transport closed`, sem escrita remota e sem substituição de dados. O erro histórico do conector não foi reproduzido em acesso privado nesta execução; sua causa externa permanece não determinada (D-03 aberto).
- Suíte obrigatória executada: 214 testes, 212 aprovados e 2 falhas por `spawnSync python3 ETIMEDOUT` no sandbox. Reexecução isolada de `financing-independent.test.cjs` com permissão ampliada: 3/3 aprovados, inclusive os dois casos afetados. Não declarar uma execução integral de 214/214 aprovada. Teste direcionado de estado também aprovado. Navegador não executado nesta etapa.
- Não houve leitura de saldos privados nem gravação financeira real. Conciliação real, recuperação autenticada, saldos atuais e dependências D-01 a D-04 permanecem abertos. Etapas 2 a 5 ainda não encerradas; próxima prioridade é auditar recuperação explícita da nuvem e concorrência Graph/ETag.

### Continuação das prioridades — 25/10/2026

Branch `fix/integridade-leitura-base`, base remota confirmada por fetch em `56f1275`; alterações locais preservadas, sem commit/publicação.

| Etapa | Estado anterior → atual / evidência | Limites e próximo passo |
|---|---|---|
| 1 — Integridade | Proteção de edição durante download mantida; **validado** em testes sintéticos. `finance-bridge.js` exige contas elegíveis e rejeita saldos ausentes; regressões financeiras da suíte passaram. | Base financeira privada não obtida nesta execução; D-03 e reconciliação de saldos reais permanecem abertos. `Transport closed` foi simulado como falha de transporte, sem determinar a causa histórica do conector. |
| 2 — Recuperação | **implementado → validado no cenário simulado**: `useCloudState` em `app-state.js` agora restaura dirty/ETag anteriores quando a recuperação falha; antes a falha deixava as alterações locais sem marca de pendência. Teste em `tests/app-state.test.cjs` comprova preservação de dados e ausência de escrita. | OAuth, gravação real, falhas de persistência e concorrência entre dispositivos físicos não validados; etapa continua em andamento. |
| 3 — Minhas Finanças | **em andamento**: `get_user_capabilities` consultado novamente; catálogo agora inclui `prepare_transaction_value` e `prepare_transaction_delete`, além de criação, confirmação e consulta de status. A antiga divergência de catálogo está superada nesta resposta oficial. | API/CORS segura para navegador continua sem contrato confirmado; nenhum executor remoto implementado ou comando financeiro preparado/enviado. MF-03 a MF-06 permanecem abertos. |
| 4 — Motor/migração | **validado no escopo sintético existente**: suíte independente aprovada sem alteração do motor. A fixture define `term:411` e uma sequência de `dates` com 413 posições: prazo contratual e horizonte de observação são parâmetros distintos; 413 linhas não significam 413 parcelas contratadas. | Não houve nova comparação com planilha privada nem cobrança bancária; aceite da migração permanece pendente. |
| 5 — Interface/PWA | **em andamento**: verificação anterior no Chromium 154 confirmou carregamento, dez abas, filtro e ausência de erros; identificou largura 410 px em viewport 390 px em Configurações com menu aberto. | Problema responsivo ainda não corrigido. Instalação física, arranque offline e anexos reais não validados. |

**Testes desta continuação:** `node --test --test-isolation=none tests/*.test.cjs`, com subprocessos permitidos: **215/215 aprovados**, zero falhas/ignorados; supera os timeouts ambientais registrados acima para a execução anterior. `browser-construction-sessions.cjs`, Playwright/Chromium local: **3/3 aprovados**, com sessões isoladas e dados sintéticos. `git diff --check` aprovado. Não foram realizadas gravações financeiras reais.

**Próxima prioridade P0:** ampliar a recuperação transacional diante de falhas de IndexedDB e auditar a corrida entre leitura e gravação/ETag; obter a base privada somente por acesso autorizado para reconciliar saldos. O plano integral continua aberto; a confirmação de capabilities não conclui integração nem autoriza operações reais. O GitHub não contém estas alterações locais.

### Entrega local de persistência e sincronização — 25/10/2026

Branch `fix/integridade-leitura-base`; commit desta entrega identificado no histórico Git (não publicado). Preserva alterações das etapas anteriores.

- `app-state.js`: pendência marcada antes de aguardar a gravação IndexedDB; leitura revalida assinatura também após o backup assíncrono; ao terminar a tentativa de leitura, mudanças locais são novamente detectadas. Mantidas as correções anteriores de concorrência no download e restauração de dirty/ETag em recuperação com erro.
- `tests/app-state.test.cjs`: novos casos de rede interrompida, sessão expirada/401, conflito/412 e edição durante envio. O envio seguinte inclui a última edição sem duplicar registros; falhas conservam pendência e ETag anterior. São mocks do serviço, não validação de OAuth real.
- Regressão completa final: **219 testes aprovados, zero falhas/ignorados**, incluindo financiamento independente Python, SAC, FGTS, PLR, reserva, investimentos e conciliação. Motor financeiro não alterado.
- Navegador: `browser-construction-sessions.cjs` (3 casos), `browser-construction-fields.cjs`, `browser-minhas-financas.cjs`, `browser-transaction-workspace.cjs` e `browser-settings.cjs` aprovados. Os dois últimos inicialmente falharam antes do lançamento por caminho Windows fixo; adaptados ao helper existente `browser-runtime.cjs` e reexecutados com sucesso no Chromium Linux. Cobertura inclui campos/foco, rascunhos, recarga, conflito entre sessões de construção, importação/IDs, filtros, edição/formulários desktop/mobile e inicialização de autenticação simulada. Não comprova sincronização financeira real entre dispositivos.
- **Limites mantidos:** responsividade de Configurações com menu aberto a 390 px ainda pendente; falha persistente de IndexedDB ou localStorage pode impedir durabilidade após fechamento, portanto não declarar recuperação universal concluída. A marca dirty por si só não substitui uma gravação local bem-sucedida. Necessário ampliar testes transacionais de falha de armazenamento e reload financeiro com envio de resultado incerto. Nenhum desses limites autoriza sobrescrever conflitos.
- `Transport closed`: erro histórico observado no conector, sem reprodução causal no código do aplicativo. Teste sintético confirma preservação diante da mesma mensagem, mas não demonstra que a origem seja exclusivamente externa. Não houve acesso à base real nesta entrega. Procedimento posterior seguro: no navegador autorizado, exportar backup privado, carregar a base em perfil de teste sem escrita remota, conferir IDs/contagens e saldos por data com os relatórios de origem, executar validadores em leitura e comparar construção/patrimônio; registrar somente resultados agregados, sem publicar arquivos/IDs/tokens. Escrita real exige autorização separada.
- Revisão: `git diff --check` aprovado; arquivos alterados limitados a código de estado, testes e este documento, sem novas fontes financeiras ou credenciais. Sem push, merge, deploy ou operação financeira real. PR depende de autorização para push da branch. Não iniciar escrita Minhas Finanças nesta tarefa.

### PR #3 — seguimento autorizado, sem merge (25/10/2026)

PR: https://github.com/Djanilton/controle-financeiro/pull/3. Commit inicial `bf9866f`; continuação na mesma branch. Push autorizado, merge/deploy proibidos.

- Envio incerto: `app-state.js` registra assinatura do payload antes do PUT. Se após recarga o conteúdo remoto corresponder exatamente ao envio pendente, reconhece o ETag e permite sincronizar a versão local; conteúdo diferente continua sendo conflito explícito. Teste sintético simula metadados recuperados e conteúdo aplicado, sem duplicar registros. Não prova durabilidade se o próprio armazenamento local falhar.
- Armazenamento persistentemente indisponível: novo teste confirma erro explícito do IndexedDB, preservação em memória e marca de pendência. **Limite ainda aberto:** nenhuma aplicação pode garantir recuperação após fechar a página se todas as cópias locais falharem; exportar backup antes de fechar e corrigir disponibilidade/quota do navegador. Não declarar esse cenário integralmente recuperável.
- Responsividade: `sidebar.css` mantém trilho de 64 px no celular e permite quebra de conteúdo. `browser-settings.cjs` ganhou asserções para ausência de overflow e largura útil acima de 300 px a 390 px. Verificação headless: scrollWidth 390 para viewport 390, antes 410; dez abas e filtro funcionais, zero erros JS/console.
- Testes: regressão Node **221 aprovados, zero falhas**; Chromium Configurações aprovado com novas asserções; smoke local de dez abas aprovado. Resultados anteriores de cinco scripts preservados; não foram todos repetidos nesta continuação.
- Revisão do diff: apenas estado/sincronização, CSS de navegação, testes sintéticos e requisitos; nenhum motor financeiro, arquivo privado ou credencial adicionado. `git diff --check` aprovado. CI inicial do commit bf9866f: zero check-runs; workflow existente publica apenas em push na main ou acionamento manual, não executado nesta branch.
- Base real/Transport closed: permanece sem diagnóstico causal, sem tentativa de modificar a base real. Procedimento seguro e limites da seção anterior continuam válidos. Escrita Minhas Finanças não iniciada. PR deve permanecer aberto para revisão.

### Revisão final PR #3 — 25/10/2026

- CI adicionado em `.github/workflows/ci.yml`: pull requests para main, Node 24/Python 3.12, regressão completa e três scripts Playwright com Chromium e dados sintéticos; permissões somente de leitura, sem deploy ou autenticação real.
- `app-state.js`: falhas de localStorage/IndexedDB geram aviso explícito de possível perda ao fechar e proteção beforeunload. Aviso permanece mesmo diante de outros erros de sincronização. Falha persistente continua impedindo garantir durabilidade; exportação privada é necessária antes de fechar.
- Resposta de PUT sem ETag não pode mais adotar ETag de uma consulta posterior (que poderia pertencer a outra sessão): mantém envio incerto/pendente e exige releitura. Testes cobrem ausência de confirmação falsa e falha de localStorage. Histórico e requisitos anteriores preservados; motor não alterado.
- Regressão local final: 223 testes aprovados, zero falhas. Navegador: Configurações, sessões da construção e Minhas Finanças executados com dados sintéticos; resultados do CI registrados no PR/checks. Sem validação de base real ou resolução causal de Transport closed. Sem merge ou deploy.

**CI remoto comprovado:** commit `fd14c09`, workflow https://github.com/Djanilton/controle-financeiro/actions/runs/40218044926 concluído com **success**, incluindo regressão Node/validador independente, instalação Chromium e três scripts sintéticos de navegador. A atualização documental posterior apenas registra essa evidência. PR #3 permanece aberto; autorização de merge ainda necessária.

### Publicação autorizada do PR #3 — 25/10/2026 (registro local)

- Antes do merge: HEAD confirmado em `3bb8ed0d795f284bfd8207f517d2e87441c408aa`, check `tests` concluído com sucesso; diff com os sete arquivos esperados e `git diff --check` sem erros. Nenhum arquivo financeiro privado ou credencial incluído.
- PR #3 integrado por squash à main no commit `c3238ab906b69bdf5a60054214e2ba8d9ac39c47`.
- GitHub Pages: https://github.com/Djanilton/controle-financeiro/actions/runs/40218685967 concluído com **success**; checkout, upload de artefato e deploy aprovados. O `head_sha` do workflow corresponde ao commit integrado. Isso confirma a origem do artefato, sem afirmar comparação dos bytes servidos publicamente.
- Verificação pública não destrutiva: tentativa HTTP HEAD para https://djanilton.github.io/controle-financeiro/ bloqueada pelo proxy do ambiente (403 no CONNECT). Carregamento, navegação e bytes da versão servida não puderam ser verificados daqui após o deploy. Testes locais/CI anteriores não substituem essa conferência pública.
- Permanecem pendentes: validação com base financeira real, OAuth real, causa histórica de Transport closed e recuperação após fechamento quando armazenamento local está indisponível. Nenhum dado real foi alterado. Próxima prioridade recomendada: conferência pública em navegador autorizado e validação controlada da base privada, mantendo backups e sem escrita remota não autorizada.
- Este registro fica **somente local**, conforme solicitação de não provocar nova publicação apenas para documentar. A documentação do GitHub contém a revisão pré-merge; incorporar este registro na próxima alteração autorizada. Nenhuma nova implementação iniciada.

### Validação pós-publicação em leitura — 25/10/2026

Main remota consultada por fetch, permanece em `c3238ab906b69bdf5a60054214e2ba8d9ac39c47`. Registro local anterior da publicação preservado. Esta execução altera somente documentação local, sem commit/push/publicação.

| Verificação | Resultado comprovado e limite |
|---|---|
| Endereço público | Requisição HTTP novamente bloqueada pelo proxy (403 no CONNECT); não se conclui falha do Pages. Bytes servidos e navegação pública não conferidos. |
| Mesmo commit em HTTP local/Chromium 154 | Inicialização e dez abas: Painel, Transações, Despesas, Resumo saldo diário, Investimentos, Empréstimos, Contracheques, Construção, Balanço Patrimonial e Configurações navegáveis; filtro aceita texto sintético; zero erros JS/console. Desktop sem overflow; Configurações em 390 px apresenta scrollWidth 390. Perfil isolado, rede externa bloqueada, sem autenticação real. |
| Regressão | 223 testes Node aprovados, zero falhas, incluindo validador independente financeiro. Não houve nova conferência numérica de dados reais ou de planilha privada. |
| Base privada | Busca autorizada do conector encontrou o arquivo no caminho esperado, com aproximadamente 15,6 MB. Fetch dos bytes, somente leitura, reproduziu `Transport closed`. Conteúdo não obtido; não foi possível criar backup local do arquivo, conferir IDs/contagens/saldos nem integrar patrimônio real. Nenhuma escrita OneDrive realizada. |
| Autenticação/permissões | Código usa MSAL para conta pessoal, User.Read/Files.Read na leitura; Files.ReadWrite em autorização separada para escrita. Caminho financeiro deriva da pasta fixa `Aplicativos/Minha Obra`; metadados e conteúdo são consultados por Graph. Busca pelo conector comprova acesso à pesquisa, não valida token/OAuth do site nem ETag do arquivo. ETag real não obtido. |
| Transport closed | Reproduzido no fetch do conector, fora da execução do JavaScript do aplicativo. Não há status HTTP do Graph nem conteúdo para atribuir causa exclusiva a conector, rede ou Graph. Tamanho do arquivo é dado de diagnóstico, não causa demonstrada. Código simula erro e preserva dados; isso não comprova compatibilidade com esta base real. |

**Procedimento seguro posterior, sem exposição pública:**
1. No OneDrive autenticado, localizar o arquivo da base e usar **Baixar** para salvar uma cópia em pasta privada local, sem mover, renomear ou editar o original. Não enviar a cópia, tokens ou IDs a repositórios, issues ou screenshots públicos.
2. Para diagnóstico do Graph, usar ferramenta oficial autenticada (por exemplo Graph Explorer) apenas com operações **GET**, escopo de leitura: consultar metadados do caminho, registrar privadamente tamanho/ETag/data e baixar `/content`. Não executar PUT/PATCH/POST/DELETE nem conceder permissões de escrita para esta conferência. Comparar o arquivo baixado com a cópia privada e confirmar JSON válido, schema e listas data.transactions/data.sources/manual.transactions.
3. Registrar somente resultados agregados: contagens e IDs únicos, duplicações/vínculos de transferências, saldos por conta/data contra relatórios, separação previsto/realizado e contas elegíveis da reserva. Comparar premissas/cenário da construção com a referência vigente, em leitura. Não usar valores históricos fixos para corrigir diferenças.
4. Não usar **Autorizar e sincronizar** nem conectar uma cópia de teste com alterações pendentes: a inicialização pode tentar salvar automaticamente, inclusive se a base não existir. Para ensaio do aplicativo com cópia privada, exigir ambiente isolado com escritas remotas bloqueadas antes da autenticação e backup confirmado. A validação OAuth real no aplicativo continua pendente até esse controle estar garantido.

**Prioridade:** obter download privado íntegro em leitura e conferir dados antes de qualquer gravação; em seguida validar OAuth em ambiente que bloqueie escrita. Nenhuma correção funcional aplicada nesta auditoria. Mantidos os limites de armazenamento indisponível, base real e conferência pública.

Testes de navegador adicionais desta execução: `browser-settings.cjs`, `browser-construction-migration.cjs` e `browser-minhas-financas.cjs` concluídos com sucesso; cobrem importações/configurações, campos/IDs/anexos simulados da construção, download Excel e conciliação de pacote sintético. Não abrangem abertura de anexos reais ou login Microsoft real.

### Investigação de download / Transport closed — 25/10/2026

Branch local `fix/download-base-financeira`, criada sobre main `c3238ab`, preservando os registros documentais locais anteriores. Sem commit, push, merge ou deploy.

**Causa demonstrada no aplicativo:** `app-state.js` utilizava `graph(.../content)`, que acrescenta Authorization. A documentação oficial afirma que `/content` responde 302 e recomenda, para JavaScript com preflight CORS, obter `@microsoft.graph.downloadUrl` e baixar diretamente sem Authorization. Fonte consultada: https://github.com/microsoftgraph/microsoft-graph-docs-contrib/blob/main/api-reference/v1.0/api/driveitem-get-content.md (a página learn.microsoft.com foi bloqueada pelo proxy). Isso comprova inadequação ao fluxo recomendado, não uma falha CORS real observada no OAuth deste usuário.

**Correção implementada:** `downloadAppState` em `app-state.js` usa a URL HTTPS temporária recebida dos metadados, imediatamente e sem persistir/logar essa URL, sem cabeçalhos de autenticação, com credentials omit e referrer omitido. Timeout de 120 segundos cobre download e leitura do corpo; não há repetição automática nem retomada por Range. Respostas diferentes de 200 (inclusive 206) são recusadas; quando size está presente, exige tamanho exato; JSON deve ser integral e válido. Metadados são relidos após transferência e ID/ETag precisam coincidir antes de aplicar. Leitura para backup sem cache também usa o helper. Preservadas as verificações de alterações locais, backups e conflitos.

**Autenticação/expiração:** token de leitura continua restrito à consulta Graph; a URL pré-autenticada é uma credencial temporária e nunca recebe o Bearer Microsoft. URLs podem expirar em minutos segundo a documentação; 401/403 exigem nova consulta, sem fallback para `/content` ou retry silencioso. CORS da origem de download e latência real não foram medidos. Timeout é limite operacional explícito, não garantia de transferência de qualquer tamanho/rede.

**Testes realmente executados:** regressão completa `node --test --test-isolation=none tests/*.test.cjs`: **228 aprovados, zero falhas**. `tests/app-state.test.cjs` acrescenta transferência sintética de 16 MiB sem Authorization, interrupção da leitura do corpo, JSON truncado, HTTP 403 de URL expirada e alteração de ETag; falhas preservam dados locais e não provocam escritas. Chromium `browser-settings.cjs` aprovado com autenticação/Graph simulados. Os testes de corpo interrompido são mocks; não representam medição de conexão Microsoft real nem demonstram a causa do conector. `git diff --check` aprovado.

**Separação de problemas:** o `Transport closed` histórico foi reproduzido no fetch da ferramenta SharePoint, fora do JavaScript do aplicativo. Não houve acesso a status HTTP, stack interna ou corpo dessa ferramenta. Sua causa efetiva continua **bloqueada/não determinada**; nenhum reparo do conector foi tentado. A mudança local não permite alegar resolução do erro do ChatGPT, download da base real, OAuth real ou saldos validados. Base privada não lida/modificada nesta etapa.

**Pendências:** validar downloadUrl/CORS e tempos em navegador autorizado com escritas remotas bloqueadas; confirmar ETag e integridade de cópia privada antes de reconciliar saldos. Necessário testar timeout e interrupção de socket em navegador/servidor controlado além dos mocks. Correção local ainda não publicada e GitHub não reflete esta branch. Motor financeiro e dados reais não alterados.

### Revisão de segurança do download — 25/10/2026

Branch `fix/download-base-financeira`, push e PR autorizados pelo usuário; merge/deploy não autorizados. Inclui registros locais pós-publicação e auditoria em leitura anteriormente preservados.

- URL pré-autenticada não é escrita em logs, interface ou armazenamento persistente pelo helper; requisição usa somente o destino recebido do Graph, sem Authorization/cookies/referrer. Metadados com URL permanecem apenas em memória; a URL é sensível e aparece necessariamente nas ferramentas de rede do próprio navegador. Não compartilhar capturas de rede.
- Erros nativos de fetch/JSON e URL inválida agora são substituídos por mensagens controladas, evitando exposição acidental de endereço assinado ou fragmentos privados. Não há envio da URL para telemetria/serviços auxiliares pelo código alterado.
- Timeout de 120 segundos, status 200, tamanho quando informado, JSON/schema íntegros e ID/ETag após transferência continuam obrigatórios. Nova consulta explícita permite recuperar expiração; conteúdo alterado bloqueia aplicação. Sem fallback autenticado para /content e sem retries automáticos.
- Regressão final local: **231 testes Node aprovados, zero falhas**, incluindo timeout, erro sem exposição de URL, recuperação após 403, JSON grande/truncado, interrupção e mudança de ETag. Chromium: configurações, sessões da construção e Minhas Finanças com dados sintéticos. Evidências remotas serão os checks do PR; resultados locais não substituem CI.
- Limites preservados: origem histórica do Transport closed do conector ChatGPT não determinada, OAuth/CORS/latência reais e base financeira real não validados. Mocks não reproduzem implementação interna do conector. Motor e dados reais não alterados. Verificação de socket/CORS real e procedimento privado continuam pendentes.

**CI comprovado do PR #4:** commit `9b55db0889055552b5b7755ef950694a63b6dbda`, execução https://github.com/Djanilton/controle-financeiro/actions/runs/40221585138 aprovada; regressão Node/validador independente e Chromium sintético concluídos com sucesso. PR https://github.com/Djanilton/controle-financeiro/pull/4 aberto, sem merge/deploy. Aprovação técnica limitada aos cenários automatizados; validação real permanece pendente.

### Publicação autorizada PR #4 — 25/10/2026 (registro local para próxima atualização)

- HEAD pré-merge confirmado em `58e48386810034b5041f7a62a8b8213d838c250b`, check tests success; diff com três arquivos esperados, sem dados privados/credenciais e sem erros de whitespace.
- Integrado por squash na main: `11a9af5638c648b43fd4aade77c342656694dc20`.
- Deploy GitHub Pages https://github.com/Djanilton/controle-financeiro/actions/runs/40221967342 concluído com success e head_sha correspondente ao commit integrado.
- Verificação pública HTTP bloqueada pelo proxy (403 CONNECT). Smoke Chromium local no mesmo commit: inicialização e dez abas navegáveis, filtro sintético funcional, zero erros JS/console, largura mobile 390/390. Isso não confirma bytes servidos, OAuth real nem conteúdo privado.
- Registro mantido localmente, sem commit/push/deploy exclusivo de documentação. Nenhuma implementação adicional iniciada ou dado real alterado. Permanecem base real, OAuth/CORS/latência e Transport closed do conector não diagnosticados.
- Procedimento privado seguro: baixar backup do JSON pela interface OneDrive sem editar o original; usar Graph Explorer autenticado com permissões de leitura e somente GET para metadados e downloadUrl. Abrir a URL temporária imediatamente em aba privada para baixar cópia, sem compartilhar URL/token/captura de rede. Conferir JSON e contagens localmente; comparar ETag antes/depois. Não usar Autorizar e sincronizar. Para testar o fluxo autenticado dentro do app, exigir bloqueio de requisições de escrita antes da conexão, pois a aplicação pode sincronizar automaticamente. Um teste sem esse bloqueio não é estritamente somente leitura.

### Conciliação auditável da base privada — implementação local (25/10/2026)

Branch `feat/conciliacao-base-privada`, criada sobre main `11a9af5`; preserva registro documental local da publicação anterior. Sem commit/push/merge/deploy e sem execução contra dados financeiros reais.

**Anterior:** ETag detectava divergência sem comparação assistida. **Atual: implementado e validado nos cenários sintéticos descritos**, ainda sem aceite/base real.

- `base-reconciliation.js`: comparação pura/sem persistência; campos compartilhados, exclusivos (possível exclusão), alterados/conflitantes e ambíguos. Usa ID local, identidade Minhas Finanças com perfil/ID/split/competência e chave conservadora de descrição normalizada/tipo/data/contas/parcela. IDs diferentes não comprovam transações distintas; equivalência por chave exige escolha explícita. Múltiplas correspondências bloqueiam consolidação; sem base ancestral, exclusão não é inferida automaticamente. Diferenças de valor/campos não são silenciosamente mescladas.
- Compara o envelope inteiro e objetos/coleções de data/manual, incluindo fontes, saldos iniciais, patrimônio, históricos, contracheques e campos desconhecidos. Coleções sem identidade reconhecida exigem decisões conservadoras; não há garantia de conciliação semântica automática de qualquer formato privado. Campos idênticos são preservados. Registros ambíguos exigem revisão externa das cópias, não há editor automático para desambiguá-los nesta versão.
- `app-state.js`, `settings-workspace.js`, `index.html`: Configurações exibe diferenças escapadas, seleção local/nuvem, exportação das duas cópias, relatório e proposta. Exportar proposta não grava. Revisão bloqueia envio e substituição automática; marca persistida resiste à recarga. Falha de leitura mantém bloqueio e dados locais.
- Aplicação exige todas as escolhas e confirmação explícita. Reconfere assinatura local e ETag antes/depois do backup local `before-reconciliation`, que contém ambas as cópias e escolhas; a gravação remota usa o backup e If-Match já existentes. Não altera fontes originais. Nenhuma aplicação foi acionada com dados reais nesta tarefa. Sem atomicidade entre IndexedDB/localStorage/OneDrive: falhas persistentes de armazenamento e envio incerto continuam sujeitas às proteções e limites anteriores; backup externo privado continua necessário antes de recuperação real.
- Testes: regressão completa **239 aprovados, zero falhas**, incluindo testes de comparação/duplicação por IDs divergentes, identidade remota, ambiguidades, exclusões, preservação de desconhecidos, rede indisponível, bloqueio de gravação, cancelamento e ETag alterado. `tests/browser-base-reconciliation.cjs` aprovado no Chromium: visualização, exportação de relatório e bloqueio após reload com dados sintéticos. `git diff --check` aprovado. Aplicação completa de uma conciliação real e dispositivos físicos não validados.
- Arquivos novos: `base-reconciliation.js`, `tests/base-reconciliation.test.cjs`, `tests/browser-base-reconciliation.cjs`; modificados estado, inicialização, Configurações, testes de estado e este acompanhamento. Motor financeiro não modificado. Bases privadas, credenciais e URLs temporárias reais não incluídas.

**Procedimento seguro após revisão/publicação autorizada:** baixar backup privado pelo OneDrive e exportar base local; abrir Configurações e Comparar local e nuvem; exportar ambas as cópias e o relatório; revisar cada diferença e possíveis exclusões; resolver ambiguidades externamente sem fabricar IDs; gerar/exportar proposta e conferir contagens, vínculos, saldos e histórico. Somente após aprovação e autorização específica usar Aplicar proposta revisada e sincronizar; se local/ETag mudar, comparar de novo. Falha de rede não deve ser contornada por substituição forçada. Não limpar armazenamento nem descartar backups. A aplicação não foi publicada nesta tarefa, portanto esse procedimento ainda depende de revisão da branch local.

Permanecem bloqueadas/não verificadas a base real, OAuth/CORS real, origem histórica do Transport closed do conector e durabilidade com armazenamento indisponível. Próxima prioridade: revisão do diff e testes adicionais de falhas entre os armazenamentos durante aplicação antes de autorizar recuperação real. GitHub ainda não reflete esta implementação local.

### Segurança da aplicação consolidada — revisão para PR (25/10/2026)

Mesma branch `feat/conciliacao-base-privada`; push e abertura de PR autorizados, sem autorização de merge/deploy/aplicação real.

- Falha demonstrada: etapas locais e remotas não eram atômicas; uma interrupção podia deixar armazenamento parcial sem instrução persistente. Corrigido com diário IndexedDB `reconciliation-journal` antes de modificar dados, backup separado com timestamp, etapas prepared/local-applied/complete e bloqueio na recarga enquanto incompleto. Botão exporta recuperação privada com original, nuvem, proposta e decisões. Não há retomada automática de escrita: comparar novamente e revisar backups.
- Web Locks serializa aplicações na mesma origem; concorrência ou navegador sem suporte bloqueia operação. ETag continua protegendo entre dispositivos. Alteração local durante download da comparação agora invalida a revisão. Backup remoto e If-Match permanecem obrigatórios. Falha após enviar ou após atualização local mantém revisão bloqueada, nunca sucesso automático.
- Testes Node: **250 aprovados, zero falhas**, incluindo falhas no diário/backup/main, localStorage antes/depois da persistência, rede interrompida, envio aplicado sem resposta, ETag alterado, reload com diário incompleto, bloqueio de outra aba, cancelamento e repetição sem nova revisão. Regressão financeira independente incluída, sem alteração do motor.
- Chromium: scripts base-reconciliation, settings, construction-sessions e minhas-financas aprovados com dados sintéticos e Graph simulado. Reload/bloqueio/exportação conferidos; bloqueio simultâneo de aplicação e falhas de armazenamento usam testes controlados Node, não dispositivos físicos ou encerramento abrupto de processo real. Workflow CI inclui o novo script de conciliação.
- Revisão do diff: apenas módulos de comparação/estado/UI, inicialização, testes, CI e requisitos. Sem arquivo financeiro privado/credencial. Resultados reais de OAuth/ETag/base privada e Transport closed continuam pendentes, sem tentativa de gravação real.
- Limites: diário e backups dependem de armazenamento disponível. Falha persistente exige exportar cópias enquanto a página está aberta e restaurar em ambiente privado controlado; não limpar armazenamento nem forçar sobrescrita. Arrays sem identidade e correspondências ambíguas continuam sem mesclagem automática; revisão externa necessária. Sem atomicidade distribuída, resultado remoto incerto exige releitura e nova conferência, não repetição cega.

**Evidência remota:** PR https://github.com/Djanilton/controle-financeiro/pull/5, implementação `e14bde6ea6b498f73fc5a24bbc1e20390c947846`; CI https://github.com/Djanilton/controle-financeiro/actions/runs/40226027001 concluído com success, incluindo regressão Node/validador e navegador. Sem merge/deploy/aplicação real. Apto para revisão técnica e publicação controlada mediante autorização; não equivale a aceite para conciliar a base real.

### Publicação autorizada do PR #5 — 25/10/2026 (registro local)

HEAD pré-merge confirmado em `b6d8b4a561197ee031728431376f810a15b44983`, check tests success; diff com nove arquivos esperados, sem dados financeiros privados/credenciais e git diff --check aprovado. Squash integrado à main: `19f90908cf1c22a333f0199035c416ccf6c18192`.

Deploy https://github.com/Djanilton/controle-financeiro/actions/runs/40226393502 concluído com success, head_sha correspondente ao commit integrado. Abertura HTTP pública bloqueada pelo proxy 403 CONNECT; não foi possível verificar bytes/navegação servidos publicamente. No mesmo commit local, Chromium browser-base-reconciliation aprovado com dados sintéticos: UI de diferenças, exportação e bloqueio após recarga. Nenhuma aplicação ou sincronização real executada.

Registro preservado somente localmente para a próxima atualização documental, sem commit/push/deploy exclusivo. Nenhuma implementação adicional iniciada. Permanecem pendentes validação da base real, OAuth real, causa histórica do Transport closed e durabilidade com armazenamento indisponível.

Uso somente de leitura: guardar cópia privada do OneDrive e exportar base local antes de iniciar; em Configurações, Comparar local e nuvem ativa bloqueio persistente antes da leitura, mesmo se faltar sessão; reconectar somente depois de ativar esse bloqueio, sem usar Autorizar e sincronizar. Exportar local/cloud/report e revisar proposta sem clicar Aplicar proposta revisada e sincronizar. Não limpar armazenamento para retirar o bloqueio. A inicialização fora desse modo ainda pode tentar sincronização automática; para garantia de ausência de qualquer escrita, bloquear métodos de escrita remotos antes de autenticar. URL/relatórios/cópias privadas não devem ser compartilhados publicamente.

### Renovação de leitura na conciliação — correção local (25/10/2026)

Branch `fix/autenticacao-conciliacao`, criada sobre main `19f9090`, com registro documental local da publicação preservado. Sem commit, push ou deploy; nenhum acesso/gravação financeira real.

**Diagnóstico demonstrado pelo código e testes:** o botão de conexão utiliza a presença de conta MSAL; não comprova token Files.Read válido. A comparação usa Graph silent=true; `acquireTokenSilent` pode falhar antes de qualquer metadado/download. O erro genérico anterior não oferecia recuperação de leitura. Isso explica o estado conta conectada/token indisponível, sem provar a causa específica da sessão real no computador; diferença celular/desktop pode envolver cache, sessão, políticas do navegador ou consentimento, ainda não medidos.

**Implementado:**
- `app.js`: aquisição silenciosa tem código READ_AUTH_REQUIRED; Graph diferencia autenticação HTTP 401, permissão 403, conexão e outros status, sem ler/exibir corpos de erro privados. Preserva HTTP 404 para base inexistente. Token e downloadUrl não aparecem nas mensagens.
- `app-state.js`: botão **Renovar acesso de leitura Microsoft** usa acquireTokenPopup em ação explícita, apenas User.Read/Files.Read. Bloqueio persistente de gravação é ativado antes de abrir autenticação. Não chama login/importações/salvamento, não solicita Files.ReadWrite, não usa redirect automático; cancelamento/popup bloqueado gera orientação segura e mantém base local. Depois da renovação refaz apenas comparação; nenhum fallback interativo em tarefas de fundo. ETag, backups e verificações locais preservados. Diagnósticos distinguem autenticação, Graph/permissão, download e conciliação, sem repassar erros arbitrários.
- `settings-workspace.js`: quadro de conciliação e botão de aplicação aparecem somente em Sincronizações, não em Importações.

**Evidências executadas:** 257 testes Node aprovados, zero falhas; inclui regressão financeira independente. `tests/read-auth.test.cjs` cobre token silencioso expirado, Graph 401/403/500, rede e ausência de corpo privado em mensagens. Testes de estado cobrem escopos somente leitura, bloqueio antes do popup, cancelamento e ausência de escritas. Chromium `browser-base-reconciliation.cjs` e `browser-settings.cjs` aprovados; asserções comprovam quadro ausente em Importações e único em Sincronizações. Testes são sintéticos, não autenticação Microsoft real. `git diff --check` aprovado.

**Procedimento posterior à publicação autorizada:** guardar cópia local privada; em Configurações > Sincronizações usar Comparar local e nuvem para ativar bloqueio; se diagnóstico indicar renovação silenciosa indisponível, clicar Renovar acesso de leitura Microsoft e permitir somente a janela Microsoft do site. Após retorno, comparar e exportar cópias/relatório. Não usar Autorizar e sincronizar nem Aplicar proposta para este diagnóstico. Se persistir, registrar apenas etapa/código/status e comportamento do popup, nunca token/URL/cópia pública. Bloqueios de popup/cookies e sessão real continuam dependentes de validação no computador do usuário. Transport closed do conector permanece problema separado, não reparado por esta alteração.

GitHub permanece sem estas alterações locais. Nenhum motor financeiro, dado real ou arquivo privado alterado. Próximo passo: revisão da branch e autorização específica antes de publicação, depois conferir renovação no navegador afetado.

### Revisão autorizada para PR da autenticação — 25/10/2026

Mesma branch `fix/autenticacao-conciliacao`; commit/push desta branch e PR autorizados, sem merge/deploy/escrita real. Revisão do diff confirma escopos exclusivamente User.Read/Files.Read na renovação e ausência de chamada a login/importação/gravação. Bloqueio ativado antes de readyAuth/popup, mantido durante e depois, inclusive cancelamento ou Graph 403; nenhum desbloqueio automático adicionado.

Regressão reexecutada: **259 testes Node aprovados, zero falhas**, incluindo motor independente e sincronização. Dois casos adicionais verificam recusa de saveAppState durante/após popup e após falha Graph, metadados persistentes reviewLocked e zero escritas simuladas. Quatro scripts Chromium aprovados: base-reconciliation, settings, construction-sessions e minhas-financas. `git diff --check` aprovado. Arquivos revisados restritos à autenticação/diagnóstico, UI, testes sintéticos e acompanhamento; sem bases privadas/credenciais.

Limites: testes simulados não confirmam sessão/cookies/popup do computador afetado nem corrigem Transport closed do conector. Operações remotas iniciadas antes de ativar o bloqueio não são retroativamente canceladas. Validação real posterior deve começar com backups privados e sem aplicação/sincronização. CI remoto será conferido após abertura do PR; não confundir aprovação local com autenticação real.

**CI remoto confirmado:** PR https://github.com/Djanilton/controle-financeiro/pull/6, implementação `02b4e8bc5409072cef19658a58123ef4f96d74e1`; execução https://github.com/Djanilton/controle-financeiro/actions/runs/40234564039 concluída com success, incluindo regressão Node/validador independente e navegador sintético. Sem merge/deploy. Apto para revisão e publicação controlada mediante autorização; autenticação real do computador afetado ainda não validada.

### Publicação autorizada PR #6 — 25/10/2026 (registro local)

HEAD pré-merge confirmado em `8ea6c526d5f1e3a15dc1c68fb3eafcd1dcb9f953`, check tests success; sete arquivos esperados, sem dados financeiros privados e diff --check aprovado. Squash integrado à main no commit `b2c5d4f104528842dbf6c52ac229bbd63a0bb161`.

Deploy https://github.com/Djanilton/controle-financeiro/actions/runs/40234914580 concluído com success e head_sha correspondente ao commit integrado. Acesso público HTTP bloqueado pelo proxy (403 CONNECT); não foi possível confirmar navegação servida publicamente. Testes Chromium locais no mesmo commit: browser-base-reconciliation e browser-settings aprovados, incluindo quadro único em Sincronizações, exportação/reload e autenticação simulada. Nenhuma autenticação com conta real, sincronização financeira, aplicação de proposta ou alteração OneDrive executada.

Registro mantido somente local para próxima atualização documental, sem commit/push/deploy exclusivo. Nenhuma implementação adicional iniciada. Validação real do popup, cookies e conta afetada permanece pendente. Teste recomendado: guardar backup privado, abrir Sincronizações, ativar bloqueio por Comparar local e nuvem; em seguida usar Renovar acesso de leitura Microsoft, permitir popup oficial e voltar à comparação. Não usar Autorizar e sincronizar nem Aplicar proposta revisada e sincronizar. Não limpar cache/armazenamento da base local para tentar corrigir autenticação.

### Desempenho da conciliação — correção local (25/10/2026)

Branch `perf/conciliacao-indexada`, sobre main `b2c5d4f`; registro local anterior da publicação preservado. Sem commit/push/PR/merge/deploy; bases reais não lidas nem alteradas.

**Diagnóstico:** comparação anterior varria e recalculava identidades/chaves de toda a nuvem para cada registro local: O(n*m) para a busca, com alocações temporárias repetidas. Renderizava todas as diferenças e JSONs de uma vez. Para 30.378 × 25.442, a busca poderia avaliar aproximadamente 773 milhões de pares, antes da renderização; esse número é estimativa do algoritmo, não medição da base real.

**Implementado:**
- `base-reconciliation.js`: índices Map por identidade local/remota e chave de negócio, união Set de candidatos e ordenação por posição original. Mantém regras anteriores de exclusividade, consumo, ambiguidade e decisão explícita, sem união automática. Custo típico O(n+m+K), com ordenação dos candidatos por registro; K é volume de correspondências. Dados altamente ambíguos ainda podem gerar K quadrático, pois o relatório conserva candidatos. Removida cópia inicial não utilizada; diferenças referenciam registros já disponíveis em vez de cloná-los repetidamente. Consolidação indexa diferenças por ID, evitando find por marcador.
- `base-reconciliation-worker.js`: comparação e serialização de exportações em Worker local, sem rede/armazenamento; progresso por contagens, timeout e encerramento em sucesso/erro. `app-state.js` mantém bloqueio persistente, confere assinatura local depois do Worker e impede aplicar durante comparação. Sem Worker, operação falha com segurança; não há fallback pesado na thread principal. Metadados/ETag/backups/diário/confirmação preservados.
- UI: 50 diferenças por página, decisões mantidas entre páginas e prévias limitadas (strings/arrays); cópias/relatório integral exportáveis sem montar tabela completa. JSON de exportação serializado em Worker. Leitura/parse do download, assinaturas, structured clone entre threads e consolidação da proposta ainda têm custo em memória/tempo na thread principal; não há promessa de ausência absoluta de pausas em dispositivos modestos.

**Evidências:** regressão completa final: **263 testes Node aprovados, zero falhas**, incluindo regressão financeira independente. `tests/reconciliation-reference.cjs` preserva o algoritmo anterior apenas como oráculo sintético; `reconciliation-performance.test.cjs` compara igualdade profunda dos resultados para dez conjuntos pequenos (10 a 73 registros), incluindo IDs divergentes, ambiguidades e exclusão. Benchmarks anteriores desta mesma execução: 30 mil ~695 ms; 50 mil ~1.034 ms; 100 mil ~2.443 ms. Resultados dependem de hardware/carga e não são SLA para Edge ou dados reais.

Chromium: `browser-reconciliation-performance.cjs`, `browser-base-reconciliation.cjs` e `browser-settings.cjs` aprovados. Caso de 30 mil divergências em Worker: ~748 ms, 64 batidas de temporizador durante processamento; 50 linhas renderizadas, troca de página, exportação do relatório e falha simulada de inicialização de Worker verificadas. Comparação e exportação testadas com dados sintéticos, nunca transações privadas. Progresso contém somente contagens. `git diff --check` aprovado.

**Pendências/riscos:** testar no Edge do computador afetado após revisão/publicação autorizada; não foi reproduzido o conjunto privado de 30.378/25.442. Memória continua proporcional à base/relatório e aos candidatos ambíguos; não existe limite rígido de heap. JSON parse/assinaturas e clonagem inicial podem causar pausas curtas. Worker bloqueado por CSP/recurso indisponível interrompe comparação preservando escrita bloqueada; não força processamento síncrono. Base real, OAuth real e causa histórica do Transport closed permanecem não verificados. GitHub ainda não contém esta correção; abertura de PR depende de autorização posterior.

### Revisão autorizada da otimização para PR — 25/10/2026

Branch `perf/conciliacao-indexada`; commit/push somente desta branch e abertura de PR autorizados. Sem merge/deploy/dados reais. Diff revisado restrito ao motor de conciliação, Worker/UI, testes, CI e documentação. Worker importa apenas código da mesma origem; não usa fetch, credenciais, armazenamento ou telemetria, nem envia payload financeiro a serviços externos. Mensagens ficam entre Worker e página.

Snapshot local independente mantido para auditoria: removê-lo deixaria o relatório vulnerável a mutações posteriores da base editável. Permanecem eliminadas cópias redundantes internas do algoritmo. ETag, backups, bloqueio persistente e diário não removidos; aplicação agora também recusa execução durante comparação ativa.

Regressão final reexecutada: **263 testes Node aprovados, zero falhas**, incluindo equivalência profunda com referência anterior nos dez conjuntos e casos adicionais de ID repetido, múltiplos candidatos por ID/chave e vínculo remoto com ID local divergente. Benchmarks desta execução: 30 mil 884 ms, 50 mil 1.061 ms, 100 mil 2.220 ms. Memória amostrada no processo da suíte inteira: heap 177/404/503 MiB e RSS 580/669/812 MiB, respectivamente; inclui outros testes, alocações e GC, não é consumo isolado do comparador, limite garantido ou pico de navegador. Demonstra que bases grandes continuam exigindo memória significativa.

Chromium: três scripts (reconciliation-performance, base-reconciliation, settings) aprovados novamente. Worker com 30 mil divergências: 762 ms, 63 batidas do temporizador; paginação de 50, exportação e erro de inicialização aprovados. CI inclui o teste de desempenho de navegador. `git diff --check` aprovado. Nenhum arquivo financeiro privado/credencial incluído.

Riscos preservados: K de candidatos ambíguos pode crescer quadraticamente; structured clone, parsing, assinatura e proposta ainda alocam memória e podem causar pausas. Edge real afetado e heap limitado não validados. Revisão de PR não equivale a autorização para conciliar a base real. CI remoto será acompanhado após push.

**CI remoto confirmado da otimização:** PR https://github.com/Djanilton/controle-financeiro/pull/7, implementação `8e384e5bf86b28b7a3f3812d8fe5bb0d0ad5cfb5`; execução https://github.com/Djanilton/controle-financeiro/actions/runs/40236356385 concluída com success, incluindo regressão Node/validador e testes Chromium com desempenho/paginação/exportação. Sem merge/deploy/sincronização real. Publicação depende de autorização posterior e não equivale à validação do Edge com base real.


### MCP direto — rede e descoberta OAuth (25/10/2026, America/Fortaleza)

**Status: em andamento; leitura autenticada bloqueada.** Execução cloud na revisão 2, com observed_spec_revision 2 e observations_current true. Ambos os domínios constam na configuração retornada e em `/etc/codex/network-policy.json`. O status da política retorna unknown, portanto não comprova enforcement; os testes abaixo comprovam acesso aos destinos nesta execução, via proxy herdado e com verificação TLS habilitada.

Testes reais: HEAD https://minhasfinancas.app.br retornou 200; HEAD https://mcp.minhasfinancas.app.br retornou 405 com Allow: POST. POST JSON-RPC initialize (protocolo solicitado 2025-03-26) na raiz MCP retornou 401 AUTH_REQUIRED; handshake não concluído. GET /.well-known/oauth-protected-resource no host MCP retornou metadados com servidor https://minhasfinancas.app.br/oauth, Bearer por header e escopos finances:read/finances:write. GET https://minhasfinancas.app.br/.well-known/oauth-authorization-server/oauth retornou 200, authorization_code/refresh_token, PKCE S256 e cliente público (token_endpoint_auth_methods_supported: none). Descoberta pública não comprova emissão de token, CORS ou leitura de contas/transações.

Próximo requisito: sessão OAuth autorizada com escopo exclusivamente finances:read e cliente/redirect URI aceitos pelo serviço. Nenhum segredo/runtime variable está configurado no status desta execução. Não houve registro de cliente, login, emissão de token, tools/call, leitura de dados financeiros nem escrita remota. Não reutilizar credenciais do plugin nem embutir tokens no site público.

Checkout recebido: branch work, HEAD 6976eaa; árvore limpa antes deste registro. feat/atualizacao-candidata não consta nas branches locais e git ls-remote --heads origin refs/heads/feat/atualizacao-candidata não retornou referência. Isto não prova perda da branch em outro checkout/remoto; seu desenvolvimento não foi acessado nem alterado. Nenhum checkout/reset/merge/commit/push/deploy executado. Alteração somente neste documento; GitHub ainda não contém este registro local.


### Continuidade recuperada e OAuth/CORS MCP — 25/10/2026 (America/Fortaleza)

**Estado verificado:** checkout principal em `work`, HEAD `6976eaa49ab02194dcb7b4d981cdab81ef4f4c55`, mesmo SHA da main remota consultada por `git ls-remote --heads origin`. Única alteração pré-existente: este documento, com diagnóstico da rodada anterior, preservado. Um worktree local; candidata ausente das refs locais/remotas e dos reflogs. `git fsck --no-reflogs --unreachable` não revelou objetos recuperáveis. Busca em /workspace e /tmp não encontrou o patch/documento originais. Nenhum reset, checkout, commit, push, merge ou deploy nesta continuidade.

**Recuperação não destrutiva concluída:** o histórico acessível do chat Codex `Construção Aplicativo Controle Financeiro` (01a172ee-6f7d-7631-9c9c-9ef5ef0a8029) contém comandos completos de criação/edição dos arquivos. Histórico confirma worktrees antigos /workspace/controle-financeiro [feat/atualizacao-candidata] e /workspace/controle-financeiro-mcp-poc [poc/mcp-leitura-direta], indisponíveis como worktrees nesta execução. Os arquivos foram reconstruídos sobre uma cópia de git archive do HEAD, extraindo heredocs e reproduzindo exclusivamente edições Python de arquivos relativos com operações limitadas. Comandos históricos de rede, Git, autenticação e publicação não foram reexecutados. Não é recuperação da ref original nem comparação byte a byte com o patch original, que segue indisponível.

Artefatos fora do repositório principal, em `/workspace/recuperacao-controle-financeiro/`:
- `candidata/`: cópia completa para revisão, incluindo candidate-update.js, candidate-update-ui.js, candidate-update-worker.js, index.html, docs/ATUALIZACAO_CANDIDATA.md, testes e requisitos recuperados.
- `atualizacao-candidata-recuperada.patch`: oito arquivos, incluindo documentação; não aplicado à árvore principal.
- `comandos-historicos.json`, `recovery-log.txt`, `SHA256.json`: procedência e hashes atuais dos oito arquivos; hashes não comprovam identidade com artefatos antigos.
- `testes-node.log`, `testes-chromium.log`: evidências reproduzidas nesta execução.
- `poc-historica/`: helper OAuth offline, quatro testes sintéticos e documentação antiga. Mantida como histórico; ainda usa scope finances e exige resource igual ao endpoint /mcp. Não é cliente autenticado pronto para uso. Os quatro testes OAuth históricos não foram reexecutados nesta continuidade.

**Validação reproduzida da candidata:** 275 testes Node aprovados, zero falhas (`node --test --test-isolation=none tests/*.test.cjs`). Quatro scripts Chromium aprovados: browser-candidate-update, browser-settings, browser-base-reconciliation e browser-minhas-financas. `git apply --reverse --check` do patch sobre a cópia recuperada aprovado. Testes apenas sintéticos, sem sessão real, planilhas reais ou sincronização financeira. O histórico relatava 274 testes na primeira implementação e 275 após a revisão de substituição controlada; a segunda revisão foi recuperada. Não é necessário reimplementar esses módulos.

**Pronto na cópia recuperada, em cenário sintético:** candidata separada, corte de histórico 01/10/2026, Excel até dezembro/2044, janela de 12 meses por vencimento, prévia e exportação sem aplicação automática. Revisão posterior permite substituição controlada de registros gerenciados por fonte/perfil/período e exige evidência de completude, preservando manuais e demais módulos. Ausência em consulta incompleta não autoriza exclusão. Ainda falta conferir os três Excel reais/cabeçalhos/totais, a base privada e o contrato real de páginas/detalhes MCP. Isso não foi executado nem autorizado como aplicação real.

**Rede atual:** environment_status agora retorna spec_revision e observed_spec_revision 3, observations_current true, política restricted/enforced com os dois hosts permitidos. É evolução do status da rodada anterior, que mostrava revisão 2/unknown; não foram repetidos testes HEAD genéricos de conectividade.

**Fonte oficial consultada:** https://minhasfinancas.app.br/ajuda/conectar-outros-agentes-mcp (revisão editorial outubro/2026) e https://minhasfinancas.app.br/.well-known/oauth-authorization-server/oauth. Confirmam Authorization Code, PKCE S256, DCR e cliente público sem segredo. Escopo de leitura atual: `finances:read`; `finances` não consta em scopes_supported. Escrita exige finances:write, não solicitado. Callback aceito segundo a documentação: HTTPS público ou HTTP loopback 127.0.0.1/[::1], porta 1024–65535; URI idêntica no cadastro, autorização e troca, sem query/fragmento/curinga; localhost e IP privado não aceitos. A documentação também exige conta verificada e elegibilidade de acesso, não verificadas para a conta nesta execução.

**Testes reais novos:**
| Teste | Resultado | Implicação |
|---|---|---|
| GET metadados de autorização | 200, PKCE S256, code, token_endpoint_auth_methods_supported none, DCR /oauth/register | Contrato público disponível; não comprova login/token |
| OPTIONS /mcp com Origin https://djanilton.github.io | 403 ORIGIN_NOT_ALLOWED, sem Access-Control-Allow-Origin | Restrição emitida pelo MCP, depois do CONNECT 200; não é bloqueio do proxy |
| POST initialize /mcp com a mesma Origin | 403 ORIGIN_NOT_ALLOWED | Navegador GitHub Pages não pode usar esse caminho diretamente no estado observado |
| OPTIONS /oauth/register e /oauth/token com a mesma Origin | 200, Allow POST, sem Access-Control-Allow-Origin | Não comprova suporte CORS; headers observados não permitem essa origem |
| Chromium novo, documento HTML sintético servido por interceptação na origem GitHub Pages | fetch de descoberta e de initialize falharam com TypeError | Confirma bloqueio no navegador nesta execução; nenhum código do aplicativo publicado/sessão real foi carregado |
| POST DCR sem Origin, cliente público dedicado, scope finances:read, callback http://127.0.0.1:8765/callback | 201, client_id emitido, token_endpoint_auth_method none, escopo somente leitura | Registro funcional por cliente fora do navegador; não autoriza conta nem dados |

DCR devolveu grant_types authorization_code/refresh_token, embora o pedido limitasse a authorization_code. Nenhum grant foi utilizado e nenhum access/refresh token emitido. Apenas metadados públicos do cliente foram guardados fora do repositório em `cliente-publico-poc.json`; nenhuma credencial do ChatGPT foi lida/copied/utilizada. Nenhum login/consentimento, tools/list, tools/call ou consulta de transações foi realizado. Paginação, formato financeiro direto, IDs e limite 10 permanecem **não verificados por conexão direta**; schemas conhecidos do importador/plugin não substituem essa validação.

**Proposta antes de alterar código (aguarda autorização conforme pedido do usuário):**
1. Revisar e restaurar a candidata recuperada em branch/worktree dedicado, sem sobrescrever o diagnóstico local. Nenhuma reconstrução funcional nova é necessária nessa etapa.
2. Adaptar a PoC recuperada para finances:read, validar discovery/resource/issuer atuais, PKCE S256, state aleatório, retorno único/expiração e token escopado. Implementar receptor loopback e executor local de leitura no computador onde o usuário abrirá o navegador; o loopback do navegador pessoal não alcança o executor cloud. Alternativa posterior: backend intermediário dedicado, sem publicação nesta tarefa. Não recomendar fetch direto do GitHub Pages enquanto o fornecedor rejeitar essa origem.
3. Iniciar o receptor local em 127.0.0.1:8765/callback e só então gerar o link de autorização para o cliente dedicado. Guardar verifier/state/tokens somente em memória, não em Git, URLs de diagnóstico, logs, localStorage ou exportações da candidata. Validar issuer/state/callback e conferir escopo devolvido; recusar escrita. Não montar agora link utilizável: não há receptor local instalado, e a PoC antiga rejeita os metadados atuais.
4. Procedimento do usuário, após preparação do executor: abrir o link gerado na mesma máquina do receptor; conferir domínio minhasfinancas.app.br, nome Controle Financeiro e callback exato; fazer login; autorizar exclusivamente consulta/leitura; manter criação/ajuste desligados; cancelar se pedir escrita. O navegador retorna ao receptor, que valida state/issuer e troca o código com verifier sem pedir que o usuário cole códigos ou tokens no chat. Esta execução para antes do login. Depois é necessário verificar elegibilidade/perfil via catálogo real, sem escolher perfil arbitrário.
5. Após consentimento, initialize + notifications/initialized + tools/list; inspecionar os schemas retornados e permitir exclusivamente as ferramentas necessárias de leitura. Consultar no máximo dez transações por vencimento, guardando apenas dados privados em memória. Conferir paginação/cursor, repetição, ocorrência/mês, totais, cobertura monetária, completude e limites; não deduzir exclusões dessa amostra.
6. Só após validar o contrato real, propor adaptador para o formato já aceito pela candidata. Cobrir integralmente os 12 meses por vencimento antes de habilitar substituição; preservar histórico, manuais, financiamento, construção, investimentos, FGTS, contracheques e projeções. Gerar prévia e cópia anterior; nenhuma aplicação financeira autorizada nesta tarefa.

**Riscos/limites:** CORS bloqueia integração puramente estática nesta origem; backend/cliente local não é garantia de autenticação ou acesso a dados até concluir consentimento. Tokens no navegador seriam expostos a XSS e recursos da mesma origem; arquitetura mediada exige sessão e proteção de tokens próprias. Reconstrução histórica e testes sintéticos não provam equivalência byte a byte com artefatos perdidos nem validação de bases reais. Este diagnóstico não inclui novas implementações; apenas recuperação isolada, registro documental e testes. Main e branch work permanecem no mesmo SHA; GitHub não contém este registro ou os artefatos recuperados.


<!-- Registro recuperado da implementação candidata; histórico preservado. -->

### Atualização controlada candidata Excel/plugin — implementação sintética (25/10/2026)

Branch `feat/atualizacao-candidata`, criada sobre main `6976eaa`; registro local da publicação anterior preservado. Pedido anterior de análise real foi cancelado. Nesta implementação não foram lidos os três Excel reais, chamados serviços financeiros do plugin, sincronizadas bases ou gravados arquivos no OneDrive. Sem commit/push/merge/deploy.

**Estado anterior → atual:** importações diretas existentes → novo caminho separado **implementado e validado com dados sintéticos**, sem ativação. `candidate-update.js` calcula cópia do envelope, `candidate-update-worker.js` executa cálculo local sem rede, `candidate-update-ui.js` oferece seleção de cópias em Configurações > Importações, prévia e exportações privadas; `index.html` carrega os módulos. Sem botão de aplicar. A candidata permanece apenas em memória até exportar; persistência/backups da base ativa não são substituídos.

- Corte fixo 01/10/2026: registros anteriores por data/vencimento/pagamento são protegidos, inclusive diante de IDs repetidos em períodos diferentes. Excel exige conjunto de três nomes de 22/10, considera até 31/12/2044, preserva exclusivos e sinaliza ausências sem excluir. Proveniência por arquivo/chave fica na candidata; fontes e histórico anteriores não são substituídos.
- Janela móvel definida explicitamente: 12 meses-calendário desde primeiro dia do mês informado, por vencimento. Outubro/2026 → 01/10/2026–30/09/2027. Pacote completo validado por MinhasFinancasCore; páginas, moeda/perfil, totais/detalhes e cobertura monetária exigidos conforme schema. Perfil divergente, pacote incompleto ou ocorrência que invada histórico/projeção privada bloqueiam revisão. Não é endpoint de delta nem prova de atualização bancária.
- Identidade: Excel não prova ID remoto (IDs gerados por posição não são autoridade); chaves de negócio conservadoras e semelhanças suspeitas detectam duplicação/ambiguidade. Plugin mantém chave remota por perfil/tipo/ID/competência/split e ID local existente. Repetição combinada Excel/plugin é idempotente. Correspondências privadas, múltiplas, vínculos divergentes e reabertura de realizado pelo Excel exigem revisão.
- Preserva manual, metadados desconhecidos, financiamentos, investimentos, patrimônio, construção, contracheques, FGTS/INSS e demais coleções do envelope. Configurações não são gravadas pelo novo fluxo. Projeções/templates identificados não viram importações/receitas realizadas nem entram nos totais contábeis da prévia. Contagens e totais em centavos são separados por mês/tipo/status; transferências não são saldo/resultado.
- UI mostra até 36 grupos e exporta todos no relatório; conflitos bloqueiam exportação da candidata. Comparação de assinatura impede exportar candidata se base ativa mudou. ETag local conhecido acompanha o relatório como referência, sem consulta/escrita remota. A revisão ativa bloqueio persistente de gravação e suspende detecção/importação automática de pacotes; não remove controles de ETag, backups ou diário existentes. Não há protocolo novo de aplicação.

**De/para e primeira atualização:** [ATUALIZACAO_CANDIDATA.md](ATUALIZACAO_CANDIDATA.md) documenta datas, status, contas/cartões, parcelas, recorrências, categorias/splits, observações, identidade e fontes, além dos limites do plugin. Campos reais dos Excel ainda não conferidos. IDs de entidades não são inventados por nome; vínculo de catálogos e casos ambíguos permanecem pendentes. Navegador não consome diretamente conectores ChatGPT; recebe pacote privado gerado por leitura autorizada fora do site, sem credenciais embutidas. Páginas não são snapshot garantidamente congelado e autenticação/generatedAt não comprovam frescor bancário.

**Testes executados:** regressão completa **274 Node aprovados, zero falhas**, incluindo motor financeiro independente; 11 testes novos em `tests/candidate-update.test.cjs` cobrem corte, 2044, campos privados, manual, projeções, três tipos, idempotência combinada, ID compartilhado entre períodos, ausências preservadas, cobertura monetária, perfil e pacotes incompletos. Chromium: `browser-candidate-update.cjs` aprovado com três XLSX gerados em memória, Worker, assinatura ativa inalterada, bloqueio persistente e download separado; scripts settings, base-reconciliation e minhas-financas também aprovados. `git diff --check` aprovado. Nenhum teste comprova base real ou autenticação real.

**Pendências para primeira atualização real:** autorização específica; backups privados local/OneDrive; confirmação de ETag e bloqueio de escritas; conferir cabeçalhos, min/max de datas, contagens e totais dos três arquivos reais; leitura completa e consistente dos 12 meses do perfil autorizado; inspeção de campos/IDs e ambiguidades; geração repetida da candidata; confronto de saldos/patrimônio sem introduzir novos saldos; revisão/aprovação antes de ativação pelo protocolo de conciliação existente. Não usar o importador normal para contornar essa aprovação. Memória/parse Excel, cobertura monetária não confirmada e falhas de armazenamento continuam riscos. Operações iniciadas antes do bloqueio não são canceladas retroativamente. GitHub não reflete esta implementação local.

### Substituição controlada por vencimento na candidata — 25/10/2026

Mesma branch local `feat/atualizacao-candidata`; preservadas as entregas anteriores, sem commit/push/merge/deploy/sincronização. Somente dados sintéticos.

**Mudança de regra:** o modo anterior conservava toda ausência. A implementação vigente substitui o conjunto gerenciado na candidata quando a fonte é completa, validada e cobre o período de vencimento selecionado. Não altera a base ativa. Ausências em consultas incompletas nunca causam remoção. O histórico anterior a 01/10/2026, registros sem vencimento, fora do período, manuais, projeções e demais protegidos continuam preservados. O comportamento anterior de preservação universal de ausências deixa de ser o critério para este modo, mantendo-se registrado como histórico da implementação.

- `candidate-update.js`: schema de prévia v2, períodos estritamente por dueDate, validação de datas/corte, três arquivos/tipos Excel, contagem e total em centavos por arquivo, cobertura e perfil explícitos. Origem genérica Planilha exige opção explícita; não se presume gestão de toda transação importada de origem desconhecida. Rejeita identidade repetida na fonte e colisão com preservados. Correspondência inequívoca conserva ID e campos não substituídos; demais IDs são determinísticos, com original integral disponível para desfazer.
- Plugin exige 12 meses completos e `replacementCoverage` de todos os tipos/status, perfil/período due, sem filtros. Mantidas validações de paginação, totais/detalhes e moeda; consultas filtradas visíveis nas páginas fonte são recusadas. O manifesto de escopo é evidência declarada e precisa ser derivado de consultas verificadas: não autentica criptograficamente a fonte nem prova frescor. Pacotes antigos sem escopo comprovado não podem substituir períodos.
- Precedência: plugin substitui Excel na sua janela. Intervalos completos de plugin são persistidos no manifesto da candidata e não rebaixados por Excel posterior, inclusive após avanço da janela. Se ambas as fontes forem selecionadas, o período Excel precisa conter a janela anual; assim não se altera silenciosamente fora da seleção. Todas as coleções não transacionais permanecem copiadas integralmente.
- `candidate-update-ui.js`: período Excel explícito, perfil, confirmação de completude/cobertura, opção para Planilha legada, resumo de removidos/incluídos/preservados/conflitos e totais antes/depois. Guarda seleção no resultado para não resetar o período visual após gerar. Undo restaura somente candidata em memória; cópia anterior privada exportável. Em conflito, candidata financeira inteira permanece igual à original, com zero remoções/inclusões no resumo e operações propostas no relatório. Nenhum botão de aplicação/sincronização adicionado.
- ETag conhecido acompanha relatório; não consultado/regravado remotamente. Bloqueio de conciliação, backups e diário existentes preservados. A ativação futura continua dependendo de revisão, confirmação e conferência atual de ETag; exportar candidata não autoriza importá-la diretamente.

**Testes comprovados:** regressão completa **275 testes Node aprovados, zero falhas** (12 casos da candidata), incluindo regressão financeira independente. Casos: carga até 2044, substituição mensal por vencimento apesar de date divergente, histórico/fora do período/protegidos, ausência de vencimento sem fallback, paginação/totais/tipos/escopo incompletos, perfil, idempotência combinada, fonte completa vazia, duplicidade, origem Planilha opt-in e precedência com avanço de janela. Quatro scripts Chromium aprovados: candidate-update, settings, base-reconciliation e minhas-financas. Novo fluxo de confirmação e desfazer testado com XLSX sintéticos; assinatura da base ativa permanece inalterada. `git diff --check` aprovado.

**Limites/primeira carga real:** cobertura Excel exige declaração explícita e conferência dos filtros/período/totais originais; contar linhas normalizadas não demonstra que uma exportação era completa. Manifesto plugin deve ser gerado a partir da leitura paginada autorizada, não acrescentado para contornar validação. Cabeçalhos/IDs/contagens/totais reais, OAuth e frescor continuam não conferidos. Candidata e undo consomem memória e não persistem automaticamente; exportar cópias privadas antes de fechar. O app ainda não aplica esta candidata; não usar importação normal como atalho. Detalhamento vigente em `docs/ATUALIZACAO_CANDIDATA.md`. Branch preparada para revisão local; GitHub não reflete as alterações.

### Integração da atualização candidata — implementação e validação local

**Estado atual:** branch `feat/atualizacao-candidata`, worktree `/workspace/controle-financeiro-candidata`, sobre HEAD `6976eaa49ab02194dcb7b4d981cdab81ef4f4c55`, igual à main remota consultada no início. Nenhum commit novo, push, PR, merge ou deploy. As alterações estão locais e o GitHub não reflete esta entrega. Checkout original em work e seu documento não commitado foram mantidos intactos; patch/cópia recuperados não foram sobrescritos. O documento desta branch preserva integralmente o registro original e incorpora também os registros recuperados, sem apagar pendências anteriores.

| Item | Status comprovado | Evidência e limite |
|---|---|---|
| CAND-01 — Recuperação e integração | **implementado** | Patch recuperado aplicado ao worktree isolado, preservando atualizações documentais do checkout original. Motor candidato existente aproveitado; sem reimplementar o aplicativo |
| CAND-02 — Excel histórico | **validado no escopo de leitura/parser privado** | Três arquivos reais encontrados no OneDrive e baixados somente para validação local fora do Git. Cabeçalhos, datas, valores assinados, situação quando disponível, contas/cartões, categorias, recorrência, parcelas e transferências percorridos pelo adaptador. Não comprova os filtros da exportação nem reconciliação com saldos/bases reais |
| CAND-03 — Substituição por vencimento | **implementado e validado sinteticamente** | Período Excel até dezembro/2044; fonte/perfil explícitos, cobertura declarada e controles independentes conciliados; preserva histórico anterior ao corte e dados não gerenciados/protegidos. Arquivo/consulta incompleta não implica exclusão |
| CAND-04 — Identidade/duplicidade | **validado sinteticamente** | Ocorrências de mesmo texto/data distinguíveis por atributos são preservadas, IDs estáveis; ambiguidade anterior bloqueia em vez de perder vínculos. Precedência da janela completa do plugin é mantida em cargas posteriores do Excel |
| CAND-05 — Interface e revisão | **implementado e validado em Chromium sintético** | Ações Excel/pacote, período, controles, avisos de cobertura, quantidades/totais, conflitos, exportação e revisão recuperável. MCP direto desabilitado. Reabertura não aplica dados e exige mesma origem/assinatura; dados injetáveis/malformados bloqueados |
| CAND-06 — Adaptador de pacote MCP | **implementado e validado sinteticamente** | Reutiliza validate/preview existentes para o mesmo modelo da carga Excel; exige pacote completo e evidência de escopo anual sem filtros. Pacotes de amostra da PoC são recusados; sem fetch, tokens ou executor remoto no aplicativo |
| CAND-07 — Primeira atualização real | **não verificado / não executado** | Base financeira real não foi aberta, substituída ou sincronizada. Exige backups, ETag, fonte/perfil, controles independentes, revisão de transferências e conflitos, além de autorização posterior para aplicação |
| MF-01 / MF-07 — Consulta direta e conciliação | **bloqueado na consulta direta; preparação offline implementada** | Usuário relatou OAuth e perfis funcionando no Windows; search_transactions retorna isError=true sem código reconhecido. Aguardando fornecedor: código/envelope público e contrato de leitura. Não houve nova consulta MCP real, fallback, reconexão ou tentativa de contornar limites |

**Arquivos da entrega:** candidate-sources.js, candidate-update.js, candidate-update-ui.js, candidate-update-worker.js, index.html, minhas-financas-core.js (exposição da verificação de alterações locais existente), testes candidatos/Chromium, workflow CI e documentação. Nenhum motor SAC, projeção de investimento, folha, construção, conta real, documento OneDrive ou store financeira do navegador foi alterado. Persistência feita pelo fluxo candidato se limita ao bloqueio técnico de revisão já existente; não existe aplicação da candidata neste fluxo.

**Constatações reais do Excel:** Observações no plural não eram lidas pelo mapeamento antigo; o adaptador agora preserva observações, tags e campos extras. Relatório de transferências não contém situação/efetivação: mantém Não informado/data vazia, sem inventar pagamento ou pendência. Sufixo numérico de nome só é tratado como parcela quando a recorrência declara parcelamento. Despesas/receitas têm ocorrências até 2044; ausência de transferências futuras não comprova cobertura. Valores, contagens financeiras, descrições, contas pessoais e conteúdo dos arquivos reais ficaram exclusivamente na validação privada fora do repositório.

**Testes efetivamente executados:** **288 testes Node aprovados, zero falhas**, por node --test --test-isolation=none tests/*.test.cjs, incluindo regressão financeira independente, idempotência, substituição mensal/anual, vencimento, parcelas/recorrências, transferências, proteção de histórico/manuais/vínculos e edição local, fontes parciais, normalização MCP, ambiguidades, fonte repetida e recuperação segura. Cenário novo de 30 mil transações sintéticas passou em substituição, segunda carga com mesmos IDs e roundtrip JSON; não é SLA nem teste de base real.

Seis scripts Chromium aprovados: browser-candidate-update (inclui geração, exportação, reabertura/reload, bloqueio de base alterada, revisão malformada, pacote incompleto e ausência de escrita após bloqueio), browser-settings, browser-base-reconciliation, browser-reconciliation-performance, browser-construction-sessions e browser-minhas-financas. Browser-base-reconciliation teve um timeout inicial de navegação local em rodada conjunta; reexecução isolada passou sem mudança de código ou aumento de timeout. A causa do timeout não foi confirmada. Não confundir mocks de Microsoft/Graph com autenticação real. CI local preparado para incluir navegador da candidata; CI remoto não executado porque não houve publicação.

**Limites e pendências:** controles de contagem/total e declaração de cobertura dependem de conferência humana na fonte, não autenticam o arquivo nem provam ausência de filtros automaticamente. Não houve comparação com a base financeira privada ou saldos bancários. Transferências com situação ausente precisam de revisão antes de qualquer aplicação. Leitura XLSX/JSON, assinaturas e cópias ainda custam memória/tempo; só cálculo/serialização são deslocados para Worker. Arquivos acima de 64 MiB e revisões acima de 128 MiB são bloqueados; base altamente ambígua exige revisão. Exportações são privadas e não devem ser commitadas.

**Próximos passos seguros:** conferir backups privados/ETag e a base ativa, resolver origens legadas e ambiguidades, validar controles e filtros no aplicativo de origem, gerar e inspecionar candidata/relatório/cópia anterior/revisão recuperável. Não usar restauração/importação normal como atalho de aplicação. Aplicação real exige revisão e autorização específicas posteriores; não está autorizada nesta entrega. O fluxo Excel pode ser revisado enquanto o suporte trata o MCP. A integração direta continua condicionada à resposta do fornecedor e à arquitetura/CORS da aplicação publicada.


### Revisão para publicação exclusiva da branch candidata — 26/10/2026

**Escopo autorizado:** commit descritivo, push somente de `feat/atualizacao-candidata` e Pull Request para `main`, exclusivamente para revisão de código. Os registros acima de entrega exclusivamente local são históricos; esta seção registra a preparação para o PR. Merge, deploy, aplicação da candidata e sincronização financeira de escrita continuam proibidos. Base do trabalho: `6976eaa49ab02194dcb7b4d981cdab81ef4f4c55`. O commit e o PR desta entrega identificam o resultado versionado sem autorreferência circular de SHA neste documento.

**Revisão dos 13 arquivos:** somente código JavaScript/HTML, testes sintéticos, workflow de validação de PR e documentação. Inclusão por lista explícita; sem Excel, base JSON, dados financeiros pessoais, credenciais, tokens, artefatos de validação privada, logs, ZIP ou temporários. A PoC OAuth e os artefatos de recuperação permanecem fora do commit. Revisão textual e varredura de padrões de segredo realizadas; dados de teste são sintéticos. O checkout original e sua alteração documental foram preservados.

| Estado | Implementação / evidência | Pendente ou bloqueado |
|---|---|---|
| **implementado** | Fluxo Excel e pacote validado no mesmo modelo; prévia, exportação e reabertura isolada | Não existe aplicação automática da candidata |
| **validado no escopo sintético** | Substituição por vencimento, histórico anterior a 01/10/2026 intacto, registros exclusivos/protegidos e precedência da janela do plugin | Cobertura completa exige controles independentes e confirmação humana de filtros/perfil; manifesto não é prova criptográfica |
| **validado no escopo sintético** | Bloqueio persistente de conciliação continua ativo; fluxo candidato não chama gravação da base financeira ou Graph. Exportação e reabertura conservam a assinatura ativa | Operações remotas iniciadas antes do bloqueio não são canceladas retroativamente |
| **bloqueado** | Botão MCP direto desabilitado; adaptador aceita somente pacote completo validado | Suporte Minhas Finanças precisa esclarecer `search_transactions` com `isError=true` / `TOOL_ISERROR_UNKNOWN`; nenhuma consulta real repetida |
| **não verificado / não executado** | Primeira atualização da base real e aceite no Windows/Edge com volume real | Backups privados, ETag, cobertura, transferências sem situação, ambiguidades e revisão humana; aplicação exige projeto/revisão e autorização posteriores |

**Riscos para revisão antes do merge:** conferir gestão de origens legadas e identidade dos registros, proteção de vínculos, regras de cobertura e precedência Excel/pacote. Parsing XLSX, assinaturas, clonagem e exportação continuam consumindo memória; cenário sintético de volume não é SLA. Validação privada dos campos dos Excel não equivale a reconciliação de saldos ou base ativa. CORS e arquitetura da futura integração direta continuam pendentes. O merge na main pode disparar Pages; este PR não autoriza merge nem deploy. Workflow Pages permanece inalterado e limitado a push na main ou acionamento manual, que não foi solicitado.

**Reexecução pré-publicação:** 288 testes Node aprovados, zero falhas (`node --test --test-isolation=none tests/*.test.cjs`), incluindo volume sintético de 30 mil transações, idempotência, vencimento, recorrências/parcelas, transferências, histórico, protegidos, duplicações, pacote e recuperação. Seis scripts Chromium aprovados nesta rodada, sem falhas: `browser-base-reconciliation`, `browser-reconciliation-performance`, `browser-settings`, `browser-construction-sessions` (três cenários), `browser-minhas-financas` e `browser-candidate-update`. A candidata foi gerada, exportada e reaberta mantendo assinatura ativa e bloqueio, sem escrita Graph após bloqueio; MCP direto permaneceu desabilitado. `git diff --check` aprovado antes do commit. Testes com navegador/Graph simulados não comprovam autenticação remota, Windows/Edge real ou atualização financeira real. CI remoto será acionado pelo PR; seus resultados devem ser conferidos separadamente.


### PR #8 — revisão do vencimento e vínculos progressivos (28/10/2026)

Branch `feat/atualizacao-candidata`, PR https://github.com/Djanilton/controle-financeiro/pull/8, revisão sobre `af42cb52a81d3e1bfbf4e566b40c428f609655af`. PR consultado aberto, rascunho, não mesclado; main em `6976eaa`. Esta seção substitui a regra temporal antiga registrada no histórico: **só dueDate seleciona período e protege vencimentos anteriores a 01/10/2026**. Lançamento/pagamento anterior não impede atualizar vencimento permitido. Manuais, alterações locais, projeções e vínculos protegidos continuam preservados. Nenhuma aplicação, exclusão da base ativa, escrita financeira, merge ou deploy.

| Item | Estado / evidência | Pendência |
|---|---|---|
| Período e corte | **implementado / validado sinteticamente**: vencimento exclusivo; padrão 12 meses desde mês atual; histórico explícito respeitando corte | Conferência humana da seleção antes de qualquer carga real |
| Atualização integral | **implementado**: substituição candidata apenas com fonte completa e controles conciliados; ausência em consulta incompleta não é exclusão | Cobertura/filtros não são comprovados criptograficamente; operador deve conferir |
| Identidade progressiva | **implementado / validado sinteticamente**: perfil/ID/ocorrência/split, série explícita opcional, retrovínculo Excel inequívoco, ID local conservado em atualizações por identidade remota | Formato real de série e catálogos remotos não confirmados; divergências/duplicidades exigem revisão |
| Parcelas, pagamentos e transferências | **validado sinteticamente**: parcela antiga com vencimento futuro, antecipação, valores atualizados, compras duplicadas, idempotência e situação desconhecida de transferências | Sem reconciliação de saldos, base ativa ou aceite Windows/Edge real |
| Memória | **validado somente no ensaio local**: 30 mil linhas, substituição + recarga + roundtrip; 4,209 s, pico RSS 384.800 KiB (~376 MiB), Linux | Não é SLA nem pico do navegador; XLSX, assinaturas e cópias ainda custam memória |
| Interface móvel / CI | **correção implementada**: largura limitada dos controles e fieldsets candidatos; assertions móveis mantidos | CI antigo 40308686800 falhou no assert mobile do browser-base-reconciliation após Node passar; acompanhar nova execução |
| MCP direto no app | **bloqueado**: botão permanece desabilitado; somente pacote completo validado | Suporte informou PROFILE_LOCKED e recuperação por página oficial. PoC tratada fora deste PR; ainda depende de reteste autenticado real e CORS/arquitetura |

Arquivos afetados: candidate-update.js, candidate-sources.js, candidate-update-ui.js, minhas-financas-core.js (parcela antes da assinatura local), styles.css, testes candidatos e documentação. PoC, ZIP, dados privados, artefatos de recuperação e checkout original não entram no commit. Bloqueio de conciliação não removido; candidata e reabertura continuam sem aplicação automática ou escrita OneDrive. Não há sincronização por diferenças.

**Validação desta revisão:** 295 testes Node aprovados, zero falhas (`node --test --test-isolation=none tests/*.test.cjs`); regressões novas incluem pagamento antecipado, parcela lançada em ano anterior, corte exclusivo por vencimento, seleção histórica explícita, retrovínculo seguro com ID local, alteração de valor após vínculo remoto, cartão/parcela divergentes, duplicidade, parcela numerada e segunda carga sem falso conflito local. Seis scripts Chromium aprovados: base-reconciliation, reconciliation-performance, settings, construction-sessions (três cenários), minhas-financas e candidate-update. Padrão de datas e asserts de largura móvel mantidos e conferidos. `git diff --check` aprovado. Ensaios sintéticos; sem leitura/regravação da base privada, consulta MCP autenticada, aceite de perfil real ou alteração no bloqueio de conciliação. Primeira atualização real continua exigindo backups/ETag, conferência de cobertura, conflitos e autorização específica posterior.

**CI remoto confirmado desta revisão:** implementação `fa78d73a7b2454d2dc3ba323cf26963868a0eebb`, PR #8, execução [40781189175](https://github.com/Djanilton/controle-financeiro/actions/runs/40781189175) concluída com **success**, incluindo Node/validador e seis scripts Chromium. A falha móvel da execução anterior não ocorreu nesta rodada. Este registro posterior altera somente documentação; não autoriza merge/deploy nem comprova perfil MCP, PIN ou base financeira real.

### PR #8 — preparação anual e contrato financeiro estrito (30/10/2026)

Branch feat/atualizacao-candidata, revisão sobre 8702af78a1a0bfac3f6c9e6304d40664bd2124d8; PR permanece rascunho. As seções anteriores são históricas; esta revisão elimina os fallbacks de vencimento e mês ainda existentes no núcleo.

| Estado | Entrega / evidência | Limite ou pendência |
|---|---|---|
| Implementado e testado sinteticamente | dueDate calendário explícito, mês da ocorrência obrigatório, detalhes indexados por tipo/ID/mês, perfil e dinheiro em contrato local versionado | Contrato local não é contrato oficial do MCP; pacote sem evidência não pode ser promovido por simples flags |
| Implementado e testado sinteticamente | Moeda/escala/unidade/campos/sinal declarados, validação estrita, origem preservada em sourceFields, ausência/null/unknown/invalid distintos | Unidades, datas TEXT_UNMAPPED e semântica real de projeções ainda dependem do fornecedor |
| Implementado e testado sinteticamente | Controles independentes Excel em todas as entradas e pluginControl fora do JSON; contagem/totais/páginas/detalhes/filtros/cobertura conciliados | Conferência humana não autentica origem nem comprova consistência temporal entre páginas reais |
| Implementado e testado sinteticamente | 12 meses com antecipações, parcelas antigas, duplicatas legítimas, alterações/exclusões candidatas, protegidos, identidade composta e idempotência | Nenhuma base real foi aberta ou substituída nesta rodada |
| Implementado e testado em Chromium Linux | Carga/prévia/exportação/recuperação/desfazer com 30 mil ocorrências MCP; assinatura ativa e bloqueio mantidos, UI de possíveis exclusões e conflitos identificáveis | Pico amostrado relevante de memória; sem medição Windows/Edge ou SLA |
| Pendente de informação externa | Formatos de dueDate/createdAt/referenceDate, moeda/escala/sinal, recorrência/parcelas, relatório completo e consistência entre páginas | Perguntas ao fornecedor preparadas privadamente; não houve consulta MCP real neste desenvolvimento |
| Bloqueado por segurança | Aplicação financeira, integração MCP direta e pacotes reais sem semântica/cobertura verificadas | Nenhuma aplicação automática, escrita, sincronização, merge ou deploy |

Arquivos: minhas-financas-core.js, candidate-sources.js, candidate-update.js, candidate-update-ui.js, candidate-update-worker.js, fixtures/testes Node/Chromium, CI e documentos candidatos. PoC e arquivos privados permanecem fora do PR. Métricas e contrato detalhados em ATUALIZACAO_CANDIDATA.md. Resultado final de testes/CI registrado na entrega do commit e no PR, distinguindo execução local e remota.

Validação local final desta revisão: 302 testes Node sem falhas; sete scripts Chromium aprovados (base-reconciliation, reconciliation-performance, settings, construction-sessions com três cenários, minhas-financas, candidate-update, candidate-volume). 30 mil ocorrências MCP em 12 meses: prévia/exportação/recuperação/desfazer, idempotência e base ativa intacta; memória/tempo e limites em ATUALIZACAO_CANDIDATA.md. git diff --check aprovado. O CI remoto pertence ao commit desta revisão e será acompanhado no PR; não confundir execução local com validação remota ou financeira real.

CI do commit ef98f82: os 302 testes Node passaram; navegador não executado porque ubuntu-latest resolveu Ubuntu 26.04 e Playwright 1.56.1 não suporta esse sistema. Correção de infraestrutura: runner fixado em ubuntu-24.04, mantendo Playwright e todos os testes/asserts. Nova execução remota será conferida no PR. Não é falha de consulta MCP nem validação financeira real.
