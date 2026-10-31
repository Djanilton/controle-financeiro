# Revisão técnica direcionada do PR #8

Referência: commit 15007ac5b4e32e9615c818f376f300219080d953, branch feat/atualizacao-candidata, PR mantido rascunho. Revisão de 30/10/2026 (Fortaleza). Somente código/testes sintéticos/documentação; nenhuma consulta MCP ou alteração de base real.

## Paginação: defeito demonstrado e correção

No commit de referência, pageRows aceitava ausência de page.items e conferia somente comprimento quando items existia. No contêiner minhas-financas-report-v1 era possível fornecer metadados coerentes e conteúdo diferente de p.items. Os testes negativos falharam antes da correção porque o motor aceitava as entradas: evidência de defeito, não hipótese.

Agora toda página normalizada precisa conter items, com contagem exata e correspondência integral com a fatia de p.items naquele offset. A comparação inclui tipos, campos adicionais, valores, ausência versus null e ordem dos registros/arrays. Ordem das propriedades de objetos JSON não altera seu significado. Nenhum total/flag/scope substitui os registros; mesmo scope=local_consolidated_package não permite omitir items.

sourcePacket já comparava os registros concatenados de sourcePages ao consolidado. Essa regra foi preservada, inclusive janelas contíguas, filtros, totais/situação, cobertura monetária e identidade; a comparação agora é incremental por registro, sem duas strings JSON do conjunto inteiro. A página consolidada interna referencia somente os itens efetivamente conferidos nas páginas originais. Isso não cria uma página externa fictícia nem dispensa sua prova.

Testes negativos: páginas omitidas; metadados ajustados para aparentar completude; arrays ausentes; linha faltante; duplicata; registro/conta/descrição diferente; ordem incoerente; página extra; divergência entre sourcePages e p.items. Testam tanto o contêiner normalizado quanto o contêiner com páginas fonte. Duplicatas presentes igualmente nas páginas e no consolidado continuam sujeitas à unicidade de tipo/ID/mês e às regras anteriores.

**Limite:** comprova consistência do pacote fornecido, não autenticidade da fonte, ausência de filtro oculto ou snapshot imutável do servidor. Páginas de momentos diferentes podem exigir garantia externa de revisão/snapshot ou reconciliação independente. Pacotes antigos contendo apenas metadados agora são bloqueados; é necessário obter as páginas originais. Não preencher page.items a partir de p.items para fingir evidência perdida. A construção equivalente nas fixtures é exclusivamente sintética.

## Memória: fontes e otimizações delimitadas

| Etapa | Fonte de consumo | Tratamento |
|---|---|---|
| Carga | ArrayBuffer, decodificação e parse do JSON; o fixture contém lista consolidada e páginas | Mantidos os dados completos. O benchmark usa arquivo no disco, como o seletor normal, sem transporte de 30 MB como buffer no protocolo Playwright |
| Base/Worker | Clone antecipado no main, cópia do postMessage, clone da candidata e outro clone undo | Removido clone antecipado redundante, com assinatura e versão verificadas antes e depois do Worker. No Worker, o input já isolado é reutilizado para undo; candidata continua sendo outra cópia |
| Normalização | Três validações completas; strings do dataset para comparação; clones por linha | Uma vista validada reutilizada no mesmo fluxo síncrono, registrada internamente em WeakSet (não por flag JSON); comparação por registro; contrato de proveniência compartilhado em memória; linhas recém-criadas pelo adaptador não são clonadas novamente |
| sourceFields | Snapshots completos dos registros/detalhes e contrato | Nenhum campo financeiro removido. Um teste demonstrou perda de colunas antigas adicionais; agora são conservadas ao agregar o novo snapshot MCP, sem histórico recursivo |
| Exportação | Cópia para Worker, representação JSON e Blob, além da revisão viva | Mantidas, para não alterar informação ou formato. Continua sendo o maior pico de RSS agregado |
| Recuperação | JSON recém-lido, revisão anterior e clone adicional de toda a nova revisão | Eliminado somente o clone redundante do objeto recém-parseado. Validação de estrutura e assinatura permanece igual. A API pública recoverReview continua copiando |

previewOwned é usado pelo Worker com sua cópia privada, nunca por uma flag do arquivo. preview e recoverReview públicos conservam cópias defensivas. recoverReviewOwned recebe somente o JSON recém-parseado pelo leitor local. Testes verificam isolamento candidata/undo/origem, assinatura inválida, retenção das colunas originais e bloqueio quando a base muda durante a leitura, antes de iniciar Worker. A transferência postMessage continua usando structured clone: não há conversão JSON que descarte tipos/campos do envelope para reduzir memória.

## Comparação antes/depois

Mesmo ambiente Linux, Chromium /usr/bin/chromium, 30 mil ocorrências sintéticas. Duas execuções por versão na comparação do aplicativo, com o mesmo harness por arquivo e amostragem a cada 250 ms. São ensaios locais sem exclusividade garantida de CPU, não SLA, benchmark Windows ou prova de pico absoluto. Soma RSS inclui processos/páginas possivelmente compartilhadas; heap renderer não mede todo o Worker.

| Medida Chromium | Antes: 15007ac, arquivo no disco | Depois: duas execuções |
|---|---:|---:|
| Prévia | 4.931 / 5.085 ms | 3.894 / 3.710 ms |
| Exportação | 1.123 / 1.048 ms | 1.090 / 990 ms |
| Recuperação | 723 / 771 ms | 375 / 392 ms |
| RSS agregado máximo amostrado | 1.459.556 / 1.390.436 KiB | 1.456.248 / 1.455.024 KiB |
| Heap renderer máximo amostrado | 204.439.072 / 204.471.292 bytes | 95.193.068 / 95.159.404 bytes |
| Revisão exportada | 68.947.049 bytes | 68.947.049 bytes |

Prévia aproximadamente 24% mais rápida e recuperação aproximadamente 49% mais rápida na média desses pares. Heap renderer amostrado cerca de 53% menor. **Não houve redução consistente do RSS agregado máximo**: o intervalo se sobrepõe e o pico de exportação permanece. Uma terceira execução de regressão confirmou o fluxo, sem integrar o cálculo das médias comparativas.

Separação do harness: com envio do arquivo como buffer pelo Playwright, o commit antigo teve RSS agregado de 1.705.616 / 1.842.272 KiB e heap renderer de aproximadamente 404 MB. Trocando somente para arquivo no disco, ainda no commit antigo, foram obtidos os valores da coluna Antes. Essa diferença é do método de teste, não uma otimização do produto. Não atribuir ao aplicativo a redução entre o antigo resultado ~1,71 GiB e a medição por arquivo.

Ensaio Node separado: baseline preservado por git archive de 15007ac; mesmo script tests/benchmark-candidate-review.cjs, Node --expose-gc, 30 mil itens novos e base com 30.002 registros. Ambos criam cópia privada representando a fronteira do transporte, antes do cronômetro. Pico do processo inclui fixture, primeira candidata, GC e cópia de entrada; não é heap exclusivo do algoritmo nem um Worker real.

| Medida Node | Antes | Depois |
|---|---:|---:|
| Segunda prévia | 5.160,56 ms | 3.841,81 ms |
| maxRSS do processo | 818.148 KiB | 551.824 KiB |
| heapUsed após prévia | 595.046.872 bytes | 405.246.520 bytes |

maxRSS aproximadamente 33% menor nesse ensaio. O hash SHA-256 da candidata JSON foi idêntico nas duas versões; os asserts também confirmaram undo igual à base e idempotência. Isso demonstra preservação no fixture, não equivalência com finanças reais.

## Proteções e resultados

Validação local: 310 testes Node aprovados, zero falhas; sete scripts Chromium aprovados nesta revisão, com três cenários de construction-sessions e o fluxo completo de 30 mil ocorrências. Após o registro privado das vistas validadas, os três scripts diretamente afetados (minhas-financas, candidate-update e candidate-volume) foram reexecutados e aprovados. Os testes direcionados de ownership também foram reexecutados após fechar parâmetros internos das APIs públicas. git diff --check aprovado. CI remoto será acompanhado para o commit publicado. As validações e limites estão registrados também em REQUISITOS_E_PENDENCIAS.md e no PR. Testes verificam: base ativa intacta; bloqueio de conciliação persistente; registros protegidos; corte e janela exclusivamente por dueDate; IDs locais/séries/conflitos preservados; amostra incompleta rejeitada; MCP direto desabilitado; exportação/recuperação/desfazer sem aplicação. Backups/ETag e workflow de deploy não foram alterados.

Além do contrato do fornecedor, permanecem limites concretos: memória alta na exportação/reabertura em dispositivos limitados; necessidade das páginas reais para pacotes anteriormente resumidos; autenticidade/cobertura/consistência temporal não comprováveis por flags; conferência independente de controles e base/backups/ETag antes da primeira atualização real. Não existe aplicação automática da candidata. Nenhuma consulta real é necessária para fechar esta revisão de código.
