# Requisitos e pendências — Controle Financeiro

**Atualizado em:** 24/10/2026  
**Aplicação principal:** [Djanilton/controle-financeiro](https://github.com/Djanilton/controle-financeiro)  
**Legado de referência:** [Djanilton/minha-obra-app](https://github.com/Djanilton/minha-obra-app)  
**Estado deste documento:** planejamento e registro de pendências; não comprova que as implementações foram feitas.

## Objetivo

Centralizar as funcionalidades financeiras, de investimentos e da construção no **Controle Financeiro**, substituindo operacionalmente o antigo **Minha Obra**. Conservar histórico, dados privados, motor financeiro, interfaces, documentos, sincronizações e testes; evitar desenvolvimento paralelo em duas aplicações.

Os itens abaixo estão classificados como **pendentes de auditoria/implementação**, ainda que alguns módulos já existam. Só marcar concluído após inspeção do código, testes e validação do usuário.

## P0 — Integração bidirecional com Minhas Finanças (plugin/API)

**Objetivo:** importar, consultar, criar, editar e excluir transações no serviço **Minhas Finanças** a partir do Controle Financeiro, de maneira autenticada, autorizada e auditável.

**Situação:** o repositório já faz referência a `minhas-financas-core.js` e `minhas-financas-ui.js`; sua existência não comprova capacidade de escrita remota nem autorização do provedor. **Dependência externa:** disponibilidade, documentação, permissões e eventual implementação de operações de escrita pelo criador/mantenedor do aplicativo/plugin Minhas Finanças.

### Escopo funcional
- [ ] Importar transações de receitas, despesas e transferências, com paginação, filtros por conta/cartão, datas e atualização incremental quando a API permitir.
- [ ] Consultar identificadores estáveis, categorias, contas, cartões, parcelas, recorrências e vínculos entre lançamentos.
- [ ] Criar transações remotamente, somente com confirmação do usuário e permissão explícita.
- [ ] Editar transações existentes remotamente, preservando IDs e histórico; definir tratamento de transações parceladas/recorrentes (parcela isolada versus série).
- [ ] Excluir transações remotamente, com confirmação explícita, tratamento de reversão/recuperação quando suportado e rastreabilidade.
- [ ] Sincronizar os resultados de cálculos do aplicativo para as transações adequadas de **financiamento período construção**, **financiamento casa** e **rendimentos dos investimentos**, evitando duplicidade.
- [ ] Definir reconciliação entre registros locais, bases importadas e lançamentos remotos; não transformar projeções automaticamente em lançamentos realizados.
- [ ] Cobrir erros, expiração de sessão, permissões insuficientes, limites de API, conflitos e operações repetidas.

### Dependências do criador do aplicativo Minhas Finanças
- [ ] Confirmar oficialmente se o plugin e/ou API disponibilizam leitura e escrita por integração externa, inclusive exclusão.
- [ ] Solicitar documentação dos endpoints/ações: listar, criar, atualizar, excluir; autenticação e escopos; limites e rate limiting.
- [ ] Confirmar suporte a transações parceladas, séries recorrentes, transferência entre contas, investimentos, saldo devedor e operações em lote.
- [ ] Confirmar semântica da exclusão (reversível ou definitiva) e autorização granular.
- [ ] Se escrita ainda não existir, abrir solicitação ao desenvolvedor com casos de uso e acompanhar disponibilização. **Não tentar contornar permissões ausentes nem simular sincronização como se fosse efetiva.**

### Arquitetura e segurança propostas
- Antes de implementar, auditar a integração atual e confirmar se um acesso direto do navegador à API é permitido com autenticação segura e CORS. Quando necessário, propor intermediário seguro sem expor segredo no GitHub Pages.
- Permitir modo **somente leitura** enquanto operações de escrita não estiverem disponíveis.
- Mostrar prévia/diff antes de criar, editar ou excluir; exigir confirmação; manter registro de alterações e correlação ID local ↔ ID remoto.
- Adotar idempotência e prevenção de duplicidade, sincronização incremental e política explícita de conflitos; nunca sobrescrever dados remotos silenciosamente.
- Nunca colocar tokens, contas ou transações reais no repositório público.

**Critério de aceite:** testes com dados sintéticos para CRUD e sincronização, confirmação de funcionalidades efetivamente liberadas pelo fornecedor e validação manual autorizada com exemplos não sensíveis; estado de cada operação visível na interface.

## P0 — Migração integral do Minha Obra para Controle Financeiro

**Objetivo:** transferir, integrar ou substituir de forma equivalente **todos os arquivos, códigos, pastas, recursos, telas, motores de cálculo, documentos de interface e sincronizações úteis** do legado `Djanilton/minha-obra-app` para o Controle Financeiro, sem perda de comportamento.

**Atenção:** não copiar cegamente tudo para a raiz do repositório. Arquivos duplicados, dependências antigas e pontos de entrada conflitantes podem quebrar o aplicativo atual. Fazer inventário e migração controlada, preservando versões e licenças; identificar arquivos que devem ser **integrados**, **substituídos** ou **arquivados por obsolescência justificada**.

### Etapas
- [ ] Inventariar recursivamente arquivos/pastas dos dois repositórios, incluindo `docs/`, `tests/`, `tools/`, ativos visuais, PWA, configurações e dependências.
- [ ] Gerar matriz por caminho: arquivo legado → destino ou equivalente atual → decisão (copiar, mesclar, substituir, já migrado, obsoleto justificado) → diferença funcional → teste → status.
- [ ] Comparar motores: SAC, TR, MIP, juros de obra, cronograma de desembolsos, amortizações, FGTS, PLR, aportes, rendimentos, reserva, insuficiências e projeção até a quitação.
- [ ] Comparar telas: Premissas, Parâmetros, Resumo, Despesas, Cronograma físico-financeiro, Obrigações/Pendências, Painéis/Gráficos, Financiamento e Recursos Próprios.
- [ ] Migrar campos e regras de formulários, tabelas, documentos e anexos; garantir compatibilidade dos IDs e da base privada existente.
- [ ] Comparar importação de planilha, leitura OneDrive/SharePoint, persistência e backups; garantir que o sistema de origem não seja sobrescrito.
- [ ] Portar testes relevantes do legado e adaptar testes de navegador. Verificar cobertura e paridade de resultados.
- [ ] Validar resultados mensais do motor integrado com a planilha de referência mais recente, quando autorizada e acessível.
- [ ] Confirmar PWA, cache, arquivos estáticos, interface responsiva, foco dos campos e atualização de telas sem perda de dados.
- [ ] Formalizar relatório de paridade: o que foi migrado, diferenças aceitas e itens ainda faltantes.
- [ ] Após aprovação e testes, tornar o legado somente referência; não apagá-lo sem autorização.

**Referências iniciais do legado:** `docs/CALCULOS.md`, `tests/engine.test.js`, `tests/browser.test.cjs`, `tools/extract_workbook.py`, `tests/validate-reference.cjs`. Verificar existência e conteúdo atual de cada um.

**Critério de aceite:** cada funcionalidade/arquivo do inventário tem destino, equivalência verificada ou descarte justificado e aprovado. Testes automatizados passam, e os cálculos financeiros comparados mês a mês não apresentam divergências não explicadas.

## P1 — Validação e sincronização financeira

- [ ] Confirmar fontes atuais e critérios dos saldos e investimentos (inclusive Sofisa e Investimento Itaú).
- [ ] Confirmar parâmetros atualizados do financiamento Caixa; valores históricos de referência: R$ 339.000, FGTS R$ 77.000 separadamente e prazo de 411 meses. **Não codificar valores fixos**.
- [ ] Validar não duplicação de juros, amortizações, PLR, FGTS, rendimentos, transferências e despesas históricas.
- [ ] Testar reconciliação e backups da base privada `controle-financeiro-app.json` e dados da construção com Microsoft Graph/OneDrive.
- [ ] Verificar integração entre previsões do aplicativo, relatórios importados e transações realizadas.

## Ordem sugerida de execução

1. **Auditoria somente leitura** dos dois repositórios e da integração atual Minhas Finanças, produzindo inventário/matriz e lista de dependências.
2. **Abrir e acompanhar** as necessidades de CRUD com o fornecedor Minhas Finanças; implementar leitura segura e preparação da camada de integração sem simular recursos ainda indisponíveis.
3. **Migração incremental** do legado em branch separada, com testes e validação por módulo.
4. **Concluir CRUD remoto** somente depois de confirmadas API, permissões e semântica; proteger operações destrutivas com confirmação.
5. **Validação final e publicação** após aprovação específica.

## Regras de execução

- Seguir o `AGENTS.md` da raiz e o `README.md` vigente.
- Trabalhar preferencialmente em branch e PR, evitando publicação inadvertida pelo GitHub Pages ao atualizar `main`.
- Não executar alterações reais no Minhas Finanças, exclusões, migrações destrutivas ou sobrescritas sem autorização explícita.
- Não versionar arquivos de dados pessoais, planilhas de origem, extratos, credenciais ou backups.
- Atualizar este documento conforme evidências: **não verificado → em andamento → bloqueado externamente → validado**, registrando PRs, testes e dependências.
