# Preparação da integração por observações — revisão de 06/11/2026

## Estado e evidências

A validação real do JSON detailsOnly no aplicativo foi concluída pelo usuário: identidade, vencimento com segundos, recorrência, parcelas, conta/cartão e representação monetária reconhecidos; vínculos e prova monetária individual bloqueados; zero propostas e base intacta. Não é necessário repetir esse teste. Esta revisão não leu a captura nem executou MCP. As evidências financeiras reais permanecem privadas; fixtures e medições usam somente dados sintéticos.

## Fluxos e proteções

| Fluxo | Resultado permitido | Resultado proibido |
|---|---|---|
| detailsOnly | Mapeamento de campos, identidade, mês e justificativas de bloqueio | Busca inventada, janela como cobertura, inclusão, atualização ou candidata exportável |
| Busca + detalhes capturados | Propostas conservadoras se cada evidência e vínculo passar | Exclusão por ausência, snapshot presumido ou aplicação |
| Excel | Cópia candidata independente com três arquivos e controles independentes | Mistura com MCP, aplicação automática ou declaração de conciliação real sem arquivos privados |

Interface separa mapeamento validado/incompleto, propostas de observações, conflitos e carga Excel. Base local vazia é explicitamente distinguida de base financeira real não carregada. Mapeamento não mostra totais/preservados zero nem janela de 12 meses como cobertura. Mês vem da solicitação original, sem derivação de datas genéricas. Campos aceitos, desconhecidos/nulos/ausentes, formatos e bloqueios ficam separados. Relatório é revisão privada; não se confunde com o diagnóstico estrutural sanitizado da PoC.

Contas e cartões são selecionados manualmente por IDs remotos, com rótulos somente para apresentação. Opções locais vêm de entidades já existentes; não há criação nem associação por nome. Vínculos estabelecidos por IDs são preservados, escolhas ficam na revisão e vínculos remotos contraditórios bloqueiam. Transferências continuam exigindo as duas contas distintas; nomes de cartão não viram conta nem movimento de fatura adicional. IDs locais e transações não observadas são preservados. Manuais/edições locais, financiamentos, construção, FGTS, investimentos, contracheques e projeções seguem protegidos.

Conciliação/review lock, assinatura ativa, cópia anterior, ETag e recuperação continuam obrigatórios. Nenhum botão aplica a candidata. A consulta direta MCP do aplicativo permanece desabilitada. A PoC não faz parte dos arquivos públicos do aplicativo.

## Contrato monetário e pergunta ao fornecedor

| Escopo | Campos | Uso seguro atual |
|---|---|---|
| Ocorrência | amount, presentationAmount, fullAmount, monetaryProjection.native.{minor,currency,scale} | Preservar separadamente; não deduzir equivalência ou escala de valores genéricos |
| Projeção da ocorrência | baseCurrency/baseScale, status, equivalentMinor, pendingReason, snapshotId | Reconhecer estrutura; enums e definitividade individual ainda exigem contrato |
| Cobertura agregada da resposta/metadados | monetaryCoverage.complete/hasEstimates/finalMinor/pendingNative | Descrever o próprio escopo; não atribuir finalMinor ao item |

A presença de equivalentMinor numa ocorrência, sua igualdade com presentationAmount convertido, ou a coincidência com finalMinor agregado não comprova sozinha definitividade ou vínculo de cobertura. Não se recalcula câmbio, inverte sinal ou arredonda. Null e estimativas continuam desconhecidos, nunca zero. O formato novo mantém MONETARY_SCOPE_UNCONFIRMED (ou impedimento estrutural mais específico); o layout local legado conserva suas verificações anteriores, sem alegar que o fornecedor o emite.

**Pergunta pronta para o suporte:** Em get_transaction_details, quais enums de transaction.monetaryProjection.status e condições de pendingReason/native/equivalentMinor comprovam que equivalentMinor é definitivo, assinado e expresso em baseCurrency/baseScale para aquela ocorrência? Como isso se relaciona com data.monetaryCoverage e result.metadata.monetaryCoverage: qual é o escopo de cada cobertura e existe uma vinculação documentada por ocorrência/snapshot, sem usar igualdade de totais? A presença de cobertura completa sem estimativas é necessária/suficiente para o equivalente individual? Confirmem também a unidade/finalidade de presentationAmount/fullAmount e o significado de valores nulos. Não são necessários dados privados para responder.

## PoC privada preparada

Versão 2026.11.06.1 preparada localmente para o atualizador assinado já existente. Não foi disponibilizada na origem do OneDrive, instalada ou iniciada no Windows. Exige autorização antes de distribuição e outra autorização antes de consulta real. Não há ZIP para extração manual.

Busca: um formulário de consentimento, perfil explícito, vencimento inicial/final, tipo todos, limite 5/10, offset zero, requestUpdateOpenFinance=false. Catálogo autenticado e fronteira HTTP conferidos, sem remoção/fallback. Uma página por execução, sem paginação/reconexão/repetição automática, inclusive erro/timeout. Respostas contraditórias interrompem. Campos desconhecidos permanecem desconhecidos. Depois, somente uma ocorrência escolhida da página pode ter detalhes, com consentimento separado e ID/tipo/mês originais. Exportação privada exige terceiro consentimento. Solicitações e respostas recebidas ficam em memória com filtro de segredos; erros não são reconstruídos como dados.

Perfil bloqueado usa link oficial/PIN existente. A tentativa é consumida. Após desbloqueio, uma nova preparação manual exige consentimento e nonce de uso único e preserva OAuth; os filtros ficam fixos e a nova busca ainda exige consentimento/clique separado, sem polling. Sessão e filtros são preservados enquanto válidos. A busca pode continuar impedida por tipos/formatos ainda não documentados; não há correção baseada em tentativa real repetida.

## Memória e desempenho

Eliminada uma clonagem transacional descartada: a cópia candidata clona os demais campos do envelope e recebe as linhas já clonadas pelo comparador. Undo e candidata permanecem independentes; sourceFields e originais completos preservados. Não se removeu informação financeira nem proteção.

Medição única por versão, Chromium/Linux, 30.000 ocorrências sintéticas, benchmark existente:

| Métrica | Antes | Depois |
|---|---:|---:|
| Prévia | 4.691 ms | 4.267 ms |
| Exportação da revisão | 1.712 ms | 1.648 ms |
| Reabertura | 502 ms | 438 ms |
| Pico RSS agregado observado | 1.853.152 KiB (~1,77 GiB) | 1.697.712 KiB (~1,62 GiB) |
| Heap renderer observado | 199.169.744 bytes | 199.711.640 bytes |
| Revisão exportada | 94.839.447 bytes | 94.839.462 bytes |

Resultados pontuais, sem atribuir toda a diferença à otimização nem prometer estabilidade/Windows. Worker.postMessage, bases candidata/undo, sourceFields originais e serialização JSON+Blob da revisão continuam consumindo memória. A exportação é o maior pico observado. Manter a revisão recuperável completa foi prioritário; não se reescreveu o serializador ou introduziu exportação parcial. Windows e bases financeiras reais não foram medidos.

## Próximo passo mínimo

Não repetir o detailsOnly real já aprovado. Primeiro obter esclarecimento monetário e autorizar a disponibilização da versão preparada no atualizador privado. Só depois, sob autorização separada, realizar uma busca curta por vencimento, selecionar uma ocorrência para detalhes e salvar captura privada com consentimentos distintos. Sem valores individuais comprovados, o resultado esperado continua sendo bloqueio financeiro explicado, não proposta forçada. Uma amostra jamais autoriza substituição de 12 meses.

## Resultados de validação

341 testes Node aprovados, oito scripts Chromium do aplicativo aprovados (a revisão de vínculos/mapeamento foi reexecutada na versão final), git diff --check limpo. Cobrem observações/Excel, identidade, segundos, dinheiro desconhecido, cartões explícitos/ambíguos, idempotência, proteções, base vazia, exportação/recuperação/desfazer e corrida de assinatura ativa. Código de filtros/CSS compacto preservado.

PoC isolada: 252 testes Python offline e 37 cenários Chromium aprovados. Busca→detalhe escolhido→exportação privada reproduzidos com provedor estrito e opener HTTP sintético; catálogo ausente/incompatível, argumento omitido/alterado, timeout, sessão expirada, bloqueio por PIN, nonce/rearme manual com filtros fixos, NOT_FOUND, vazios, cliques concorrentes e páginas contraditórias testados. Sem chamada financeira real. Instalação assinada da versão anterior para 2026.11.06.1, inicialização sem conexão, encerramento e rollback executados em temporários Linux com configuração/código anterior preservados. A versão preparada não foi disponibilizada no feed privado nem no Windows.

CI público valida somente o aplicativo do PR; não executa a PoC privada. Execução real da nova busca, moeda/definitividade individual, cobertura real e desempenho Windows continuam não verificados. A pergunta monetária não foi enviada automaticamente.

Código desta revisão: `7ee40a20f4e414228e6579f69a65f9bcf27c6ffb`, PR #8 rascunho. [CI público #28 aprovado](https://github.com/Djanilton/controle-financeiro/actions/runs/42319194161), com Node e Chromium; registro documental posterior sem alteração do código testado. Relatório e perguntas não contêm captura financeira privada.
