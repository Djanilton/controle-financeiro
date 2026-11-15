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

**Bloqueio de bootstrap resolvido nesta revisão.** `invoice-session-policy.js` é executado antes dos módulos operacionais e da biblioteca de autenticação. Acesso por `?area=cardInvoices`, `?mode=invoice-review` ou última aba salva ativa a proteção antes de qualquer manutenção. A resolução final da rota mantém a proteção na conferência e respeita navegação explícita para outras áreas.

A inicialização lê `main` em IndexedDB e os dados manuais locais, sem autenticar o cliente operacional, substituir a base pela nuvem, importar fontes, alterar o diário ou persistir metadados. Diário de conciliação incompleto conserva o bloqueio em memória sem gravá-lo. INSS, histórico de importações, política/adaptação da construção, recuperação de transferências, saldo compartilhado e sincronização MF verificam a proteção antes de qualquer mutação. Foco, armazenamento e timers obedecem à mesma política.

Antes de apresentar a cópia, o bootstrap relê `main` e confere os marcadores locais de lançamentos manuais/ETag. Mudança observada bloqueia a apresentação e oferece reabertura, sem gravar. Isso detecta as divergências verificadas entre leituras; não afirma snapshot distribuído ou cobertura da fonte financeira.

Tarefas de leitura/gravação já iniciadas impedem a entrada na conferência até terminarem, sem cancelamento ou perda de rascunho. A entrada pelo aplicativo atualiza a rota sem gravar preferências financeiras: recarregar continua protegido. Se a sessão iniciou em conferência, navegar explicitamente para outra área abre um novo ciclo operacional completo; fora da conferência as manutenções, login, sincronização, ETag e backups anteriores continuam disponíveis. Não foi removida nem globalmente desativada nenhuma dessas rotinas. URLs versionadas dos módulos alterados evitam misturar versões em cache.

Multicategorias: `categorySplits` e campos originais permanecem na evidência privada; observações com múltiplas divisões continuam `SPLIT_MAPPING_REQUIRES_REVIEW`, sem propostas inferidas. Não há contrato comprovado dos campos monetários individuais dos rateios nem identidade inequívoca disponível nas linhas Excel genéricas que autorize consolidação automática. Não se agrupam compras por descrição/valor. É necessário validar identidade e soma dos rateios antes de habilitar essa consolidação; não foi declarada concluída.

Demais limites: base corrente não comprova cobertura MF, ausência não é exclusão, paginação não é snapshot, MCP direto permanece desabilitado, contas/cartões exigem vínculos. A comparação não aplica candidata, altera faturas nem sincroniza JSONs. Os motores existentes não foram reescritos. Confrontos privados SAC/CDI/FGTS/INSS e documentos reais continuam dependentes das fontes autorizadas.

## Evidências

Suíte completa Node, Chromium e verificador Python executada com dados sintéticos; resultados finais registrados em REQUISITOS_E_PENDENCIAS.md e no PR. Novo teste Chromium verifica cópia da base carregada, confirmação documental, tabela, base principal/backup físicos no IndexedDB, metadados, armazenamento local, foco/armazenamento/espera e ausência de requisições externas. O teste PDF executa o `pdfText` real (PDF.js + pdfLines) com duas competências sintéticas concatenadas. Desktop e celular capturados e examinados; cabeçalho duplicado/recorte de iframe corrigidos. Não equivale a validação Windows autenticada ou PDF privado.

## Publicação e recuperação

PR único de integração para main, preservando PRs anteriores. O bloqueio de bootstrap descrito na rodada anterior foi fechado por proteção antecipada e testes negativos/positivos. Merge técnico autorizado pelo usuário é condicionado à suíte completa e CI aprovado no SHA final, inspeção de privacidade e conferência de main; acompanhar Pages até sucesso e verificar os arquivos servidos. Multicategorias ambíguas continuam seguramente bloqueadas e não impedem esta publicação independente. Nenhuma migração de JSON é requisito para uso das funcionalidades independentes; rotas antigas permanecem.

Após revisão/validação e liberação técnica: conferir SHA de main/branch, CI, diff de privacidade, merge do PR e acompanhamento do Pages; verificar versão e navegação. Para rollback de código, reverter o commit de integração por PR e acompanhar novo Pages; não restaurar/mover bases ou limpar navegador. Como não há alteração de formato/rota privada nesta rodada, não há migração de dados para desfazer. Não usar reset/push forçado ou sobrescrita de JSON.

## Evidência específica de inicialização

`browser-invoice-bootstrap.cjs` cobre abertura direta, última aba salva, modo explícito, MSAL real sem iniciar autenticação, dados dirty/ETag, diário completo/incompleto, login/reconexão de fontes com grants antigos de escrita, foco/storage, recarga e 310 segundos de timers simulados. Desde antes do primeiro script, intercepta toda gravação na DB operacional e todas as operações de Storage; compara main, backup, diário e valores privados locais originais. Nenhuma escrita operacional e nenhuma requisição Graph durante a conferência. O cliente de fontes exige Files.Read/User.Read e mantém sua autenticação em memória. Ao sair, confirma login operacional, manutenção INSS e execução da rotina de construção/saldo compartilhado.

Testes Node adicionais verificam política antecipada, tarefas assíncronas reais pendentes e mudança concorrente de main/manual/ETag sem apresentação de cópia mista. Suíte local final/CI constam no PR. Dados e chamadas são exclusivamente sintéticos; não foi feita autenticação real, consulta MCP ou migração de JSON. Aceites privados e memória elevada permanecem limites conhecidos, sem liberar operações financeiras bloqueadas.

Fechamento local: 529 testes Node/Python, 29 roteiros Chromium e diff sem erros. Capturas de abertura protegida desktop/mobile examinadas; altura embarcada acompanha conteúdo sem reter a viewport anterior. O CI remoto precisa aprovar o SHA exato antes de retirar o rascunho/realizar merge. Depois do Pages, confirmar código servido e abrir a rota de conferência em navegador limpo, sem autenticação ou fonte real.
