# Integração técnica do aplicativo — 15/11/2026

Branch independente `feat/integracao-oficial`, baseada em PR #11 `c7594e6`, que contém PR #8 `cc35245` e main `d5d2494`. PR #10 e rotas JSON operacionais não são alterados. Nenhuma consulta MCP, conta Microsoft real ou documento financeiro privado foi utilizado.

## Implementado

- Comparação com uma cópia dos lançamentos já carregados no aplicativo, sem exigir pacote JSON nem reimportação MF. A conferência permanece no aplicativo; o cliente de fontes é hospedado em documento isolado, sem receber tokens. A alternativa isolada continua disponível.
- Fatura independente lida pelo parser existente, identidade documental mascarada e vínculo confirmado pelo usuário. Cache privado verificado por hash reutilizado; versões documentais conflitantes bloqueiam confirmação. Histórico e marcações continuam append-only. Configuração e consentimento OneDrive de fontes permanecem separados da sessão operacional.
- Guardas contra leituras da base na nuvem, gravações, importações e sincronização durante a conferência. Entrada aguarda inicialização e tarefas em andamento; gravações compartilhadas em curso são contadas. Timers de verificação, eventos de armazenamento e construção não podem substituir dados nesse estado.
- Natureza desconhecida não vira compra, `date` não vira vencimento; mês da fatura só é explícito ou derivado de vencimento após revisão humana específica. Registros sem competência não são descartados como inexistentes: totais/diferenças ficam desconhecidos. Moeda divergente bloqueada. Projeções e fontes protegidas não entram como compras.
- Precisão monetária: apenas resíduos binários dentro de tolerância limitada de ULP são normalizados para duas casas; precisão real adicional continua inválida. Fonte original preservada.
- Controles obrigatórios continuam referentes ao arquivo inteiro. Controle opcional da janela é separado e deve coincidir exatamente com os vencimentos selecionados. Mensagem de bloqueio obsoleta limpa após prévia bem-sucedida.
- INSS: mais de uma competência anual-civil na mesma linha, sem fabricar meses; remuneração apurada/consolidada separadas, tabela única e prévia sem aplicação.
- Painel sem base carregada apresenta dados desconhecidos em vez de saldos zero.

## Limites de segurança e revisão antes de publicação

A conferência integrada pausa os caminhos compartilhados depois que a inicialização operacional terminou. **Isso não transforma o bootstrap operacional normal em modo somente leitura.** A auditoria local encontrou manutenções automáticas preexistentes em `app-refinement.js` (`maintainPayrollLinks`, `maintainProjectionPolicy`) e comportamentos autorizados anteriores de `readAppState`. A sessão de fontes separada não carrega esses módulos. O teste de navegação integrada não comprova ausência de manutenção anterior à entrada na tela, sobretudo quando a última aba salva é Conciliação. Esta fronteira requer revisão específica antes de merge; não se declara isolamento de toda a inicialização apenas com o teste pós-entrada.

Multicategorias: `categorySplits` e campos originais permanecem na evidência privada; observações com múltiplas divisões continuam `SPLIT_MAPPING_REQUIRES_REVIEW`, sem propostas inferidas. Não há contrato comprovado dos campos monetários individuais dos rateios nem identidade inequívoca disponível nas linhas Excel genéricas que autorize consolidação automática. Não se agrupam compras por descrição/valor. É necessário validar identidade e soma dos rateios antes de habilitar essa consolidação; não foi declarada concluída.

Demais limites: base corrente não comprova cobertura MF, ausência não é exclusão, paginação não é snapshot, MCP direto permanece desabilitado, contas/cartões exigem vínculos. A comparação não aplica candidata, altera faturas nem sincroniza JSONs. Os motores existentes não foram reescritos. Confrontos privados SAC/CDI/FGTS/INSS e documentos reais continuam dependentes das fontes autorizadas.

## Evidências

Suíte completa Node, Chromium e verificador Python executada com dados sintéticos; resultados finais registrados em REQUISITOS_E_PENDENCIAS.md e no PR. Novo teste Chromium verifica cópia da base carregada, confirmação documental, tabela, base principal/backup físicos no IndexedDB, metadados, armazenamento local, foco/armazenamento/espera e ausência de requisições externas. O teste PDF executa o `pdfText` real (PDF.js + pdfLines) com duas competências sintéticas concatenadas. Desktop e celular capturados e examinados; cabeçalho duplicado/recorte de iframe corrigidos. Não equivale a validação Windows autenticada ou PDF privado.

## Publicação e recuperação

PR único de integração para main, preservando PRs anteriores. **Não fazer merge nesta rodada enquanto a fronteira de bootstrap acima não estiver comprovada.** CI verde é necessário, mas não remove esse bloqueio. Nenhuma migração de JSON é requisito para uso das funcionalidades independentes; rotas antigas permanecem.

Após revisão/validação e liberação técnica: conferir SHA de main/branch, CI, diff de privacidade, merge do PR e acompanhamento do Pages; verificar versão e navegação. Para rollback de código, reverter o commit de integração por PR e acompanhar novo Pages; não restaurar/mover bases ou limpar navegador. Como não há alteração de formato/rota privada nesta rodada, não há migração de dados para desfazer. Não usar reset/push forçado ou sobrescrita de JSON.
