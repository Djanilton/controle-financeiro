# Requisitos e pendências — Controle Financeiro

**Atualizado em:** 25/10/2026

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
