# AGENTS.md — Controle Financeiro

## Missão e escopo
Este arquivo orienta agentes que desenvolvem o repositório `Djanilton/controle-financeiro`. Responda ao usuário em português brasileiro. Respeite outras instruções `AGENTS.md` mais específicas, quando existirem.

O **Controle Financeiro** é a aplicação principal. O antigo **Minha Obra** (`Djanilton/minha-obra-app`) é um projeto legado de referência, e não uma aplicação a ser retomada. Compare ambos quando solicitado para confirmar se todas as telas, cálculos, integrações e funcionalidades foram migrados; nunca suponha migração completa sem evidência.

## Arquitetura existente
- Aplicação web estática, com `index.html`, JavaScript e CSS; PWA publicada por GitHub Pages a partir de `main`.
- Não presumir React, TypeScript ou ferramentas de build sem verificar a estrutura atual.
- Módulos citados na inicialização incluem `app-core.js`, `financial-model.js`, `sac-engine.js`, `sac-adapter.js`, `construction-finance.js`, `construction-host.js`, `construction-migration.js`, `finance-bridge.js`, `minhas-financas-core.js`, `minhas-financas-ui.js`, `payroll-core.js`, `statement-core.js`, `patrimony-model.js` e outros.
- Os dados privados ficam no navegador (IndexedDB/localStorage) e, com autorização, em arquivos privados no OneDrive via Microsoft Graph.
- O `README.md` descreve o comportamento pretendido; confirme detalhes no código e nos testes, sobretudo se houver divergências.

## Procedimento antes de implementar
1. Ler `README.md`, este `AGENTS.md`, os módulos envolvidos e seus testes.
2. Verificar a branch e alterações pré-existentes (`git status` quando disponível); preservar o trabalho existente.
3. Localizar a causa do problema antes de editar; fazer alterações pequenas, legíveis e reversíveis.
4. Para migrações, montar uma matriz **funcionalidade legada → implementação atual → testes → status comprovado → pendências**. Diferenciar implementado, parcial, ausente e não verificado.
5. Não reescrever módulos inteiros nem criar integrações ou fontes paralelas sem necessidade. Não misturar regras de projetos diferentes.
6. Em tarefas grandes, apresentar um plano curto antes de alterações estruturais.

## Financiamento, construção e projeções
- Preservar o motor SAC e a separação entre juros de obra, amortização do principal, encargos, prestações, amortizações extraordinárias, FGTS e saldo devedor.
- Conferir datas, competência mensal, prazo, arredondamento, precisão monetária e a evolução do saldo devedor sem saldos de dívida negativos ou contagem dupla.
- Valores históricos informados: financiamento da Caixa de R$ 339.000 e FGTS separado de R$ 77.000; são referências para conferência, **não constantes para codificar**. Confirmar parâmetros vigentes na fonte mais recente.
- O prazo histórico informado de 411 meses também deve ser validado nos dados atuais, não fixado sem conferência.
- Confrontar projeções mês a mês com planilhas de referência, como `financiamento construção casa.xlsx`, quando estiverem disponíveis. Não inventar resultados nem alegar comparação se o arquivo não estiver acessível.
- Evitar dupla contabilização de liberações da Caixa, PLR, transferências, pagamentos já realizados, FGTS destinado à amortização e receitas fictícias de rendimento.
- A reserva da obra usa movimentos e saldos elegíveis conforme o código atual (historicamente Sofisa e Investimento Itaú). Não recriar saldos a partir de valores fixos.
- Manter custos, despesas extras, cronograma físico-financeiro, parcelas pagas, aportes, obrigações contratuais, documentos e anexos coerentes nas diferentes telas.
- Verificar, ao implementar regras de investimentos, taxas de CDI, remuneração líquida, dias efetivos e tratamentos tributários conforme premissas explícitas, sem duplicar rendimentos importados.

## Dados, importação e sincronização
- Preservar IDs de transações, contas e transferências, vínculos, campos privados, históricos, documentos e bases anteriores.
- A integração Microsoft usa autorização explícita e Microsoft Graph/OneDrive. Respeitar controle de versões/ETag, backups e detecção de conflitos; jamais resolver conflito por sobrescrita silenciosa.
- A base privada do aplicativo `controle-financeiro-app.json` e os dados de construção integrados são dados de usuário, não arquivos para commit.
- Não sobrescrever planilhas, PDFs de origem nem transações reais do Minhas Finanças sem autorização específica.
- Falhas de importação, permissões ou leitura não devem substituir dados anteriores válidos por zeros ou vazios.
- Evitar dupla contabilização de receitas de contracheques, transferências, rendimentos modelados e dados de outras fontes.

## Privacidade e segurança
- O repositório é público: nunca adicionar planilhas financeiras reais, extratos, contracheques, dados pessoais, credenciais, tokens, segredos ou cópias da base privada.
- Não despejar dados sensíveis em logs, mensagens de commit, screenshots ou testes.
- Não limpar IndexedDB/localStorage nem executar migrações destrutivas sem backup adequado e aprovação expressa.
- Solicitar autorização antes de qualquer alteração de dados financeiros reais, push, merge ou publicação com efeito funcional.
- A branch `main` publica no GitHub Pages por GitHub Actions; portanto, mudanças nela podem disparar deploy automaticamente. Preferir branch de trabalho e PR para mudanças de código. Não fazer push para `main` por conta própria em tarefas de desenvolvimento.

## Testes e critérios de conclusão
- Testar comportamento alterado e possíveis regressões, sobretudo fluxo de caixa, parcelas SAC, amortização, FGTS, sincronização e importações.
- O README indica a execução básica:
  `node --test tests/core.test.cjs tests/unification.test.cjs tests/construction-host.test.cjs`
  Verificar se os arquivos ainda existem e ampliar os testes relevantes.
- Usar dados sintéticos para testes. Verificar consistência entre telas e cálculos mês a mês quando solicitado.
- Conferir navegação, persistência de campos, ausência de perda de foco, layout responsivo e funcionamento do PWA em alterações de interface.
- Distinguir testes executados, testes não executados e resultados que dependem de validação manual ou autenticação externa.
- Não afirmar que algo foi testado, migrado, sincronizado ou publicado sem evidência verificável.

## Comunicação e eficiência
- Responder de forma objetiva, em português, com **o que mudou, arquivos alterados, testes executados e pendências**.
- Evitar varreduras e alterações repetitivas sem ganho. Para tarefa simples, corrigir apenas o necessário.
- Se faltar autorização, acesso a fontes privadas ou requisito crítico, explicar a limitação e executar apenas etapas seguras.
- Não criar tarefas futuras nem prometer execução assíncrona sem ferramenta apropriada.

## Acompanhamento consolidado obrigatório
- Usar `docs/REQUISITOS_E_PENDENCIAS.md` como referência central de requisitos, progresso, dependências e pendências.
- Ao finalizar qualquer implementação, correção, migração ou teste que altere o estado de uma funcionalidade, atualizar no documento os itens afetados, preservando as pendências anteriores ainda válidas.
- Para cada atualização, registrar: status (**não verificado**, **em andamento**, **bloqueado**, **implementado**, **validado**), resumo do que mudou, arquivos relevantes, testes realmente executados e seus resultados, problemas restantes, commit/PR ou branch quando disponíveis.
- Não marcar como validado um recurso apenas por existir código; registrar explicitamente limitações, validações manuais ou dependências externas (como permissões do plugin Minhas Finanças).
- Incluir a alteração da documentação na mesma branch/PR da implementação, preferencialmente no mesmo commit lógico. Não criar commits nem publicar automaticamente sem autorização; respeitar a política de branch e deploy acima.
- Se a implementação não for publicada ou o documento remoto não puder ser atualizado, informar claramente que o GitHub ainda não reflete o estado local e fornecer o resumo das alterações pendentes.
- Quando a tarefa for somente consulta/análise, não modificar o arquivo sem necessidade; apresentar as divergências encontradas e propor a atualização.
- Não registrar no documento dados financeiros privados, tokens, credenciais ou qualquer conteúdo sensível.

## Instruções do projeto do ChatGPT
As instruções de um Projeto do ChatGPT e seu histórico não são necessariamente visíveis no Codex. O repositório e este arquivo são as referências permanentes para desenvolvimento; use os arquivos de origem fornecidos e confirme premissas quando houver divergências.
