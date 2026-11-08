# Dados privados, importações e corte futuro

## Configuração sem caminhos pessoais no código

Configurações → Importações → **Fontes privadas do Controle Financeiro** recebe a pasta central relativa à raiz do OneDrive. Os caminhos são guardados nas preferências privadas do dispositivo. Não há caminho pessoal novo fixado em JavaScript. Defaults pessoais antigos de relatórios/contracheques e financiamento foram removidos; configurações existentes são preservadas. O caminho da planilha original, contracheques e referência do financiamento permanece separado e configurável, sem mover originais.

Derivados configuráveis da raiz escolhida:

- `Alocação Investimentos`, `Faturas cartão`, `Relatório App Minhas Finanças`.
- `Dados privados/Bases`, `Dados privados/Backups`, `Dados privados/Conciliações`, `Dados privados/Revisões candidatas`.

Salvar caminhos **não cria diretórios**, não copia arquivos, não inicia importação ou muda a base ativa. O verificador confirma somente permissões de leitura das três pastas de fontes; não presume permissão de escrita. Caminhos explícitos não encontrados não são substituídos silenciosamente por uma busca global. Nomes sem caminho exigem resultado único. Acesso negado não vira ausência ou base vazia.

## Inventário e dependências

Auditoria de metadados no OneDrive confirmou a existência dos dois JSONs operacionais abaixo e do legado de compatibilidade, com ETags obtidos pela leitura exata dos itens. Conteúdos financeiros, IDs e ETags não são publicados. Não se baixou/copiou o conteúdo dessas bases nesta execução.

| Arquivo/artefato | Papel | Destino proposto |
|---|---|---|
| `controle-financeiro-app.json` | Base operacional do Controle Financeiro | Bases, após verificação/autorização. |
| `dados-construcao-controle-financeiro.json` | Base canônica integrada da construção | Bases, após verificação/autorização. |
| `dados-completos.json` | Compatibilidade/fallback do legado | Manter na origem, somente leitura após corte. Não copiar automaticamente. |
| Backups anteriores e pacotes antigos | Recuperação/inventário individual | Não migrar indiscriminadamente. Novos backups terão destino próprio aprovado. |
| Planilhas originais, contratos, aditivos, projetos e PDFs da construção | Documentos de origem | Permanecem onde estão, com links/referências preservados. |
| Histórico de conciliações IndexedDB | Revisões/eventos privados | Continua no navegador; sincronização opcional preparada, não ativada. |
| Revisões candidatas e fontes financeiras | Cópias de conferência | Diretórios próprios; nunca base ativa implicitamente. |

`app-state.js` e `construction-host.js` ainda usam a rota legada ativa para os JSONs. `integration-ui.js`/`construction-migration.js` preservam compatibilidade com o snapshot/localStorage legado e anexos. Nenhuma rota ativa foi trocada. A interface distingue cópia local/base remota, endereço atual e destino futuro configurado.

Os motores SAC, construção, reserva, FGTS e investimentos são JavaScript local, incluindo o iframe local `construction/index.html`. O símbolo `MinhaObraEngine` é compatibilidade de nome do motor embarcado, não chamada ao aplicativo legado. Testes executam 413 meses sem rede/Microsoft/Excel e há verificador Python independente. Comparação com todos os resultados das planilhas e contratos privados não foi repetida; não se declara equivalência real integral sem esse confronto.

## Protocolo transacional preparado (não conectado ao Graph de escrita)

`private-cutover-core.js` implementa um protocolo com transporte injetado, testado somente em memória:

1. Inventário fechado dos dois arquivos, esquema válido, ETag e conteúdo não vazio. Copiar sem reserializar campos ou remover extras.
2. Prévia privada dos conteúdos e hashes SHA-256 UTF-8, com `applyAllowed:false`.
3. Autorização específica para estágio; recusar destino existente, especialmente versões mais novas. Criação condicional `If-None-Match:*`, nunca sobrescrita.
4. Releitura das cópias, comparação de hash/ETag e nova conferência das origens. Falha deixa diário e cópias parciais preservadas, sem ativação e sem apagar arquivos.
5. Corte separado, com nova autorização e **prova externa de revogação de escrita na origem**, validando novamente as cópias. Só um destino pode ser gravável.
6. Origem antiga permanece fallback/backup somente leitura. Rollback primeiro revoga escritas do destino e retorna em modo somente leitura, sem sobrescrever a origem com dados possivelmente antigos.

**Limites reais:** o protocolo não altera ACLs, não implementa lease distribuído, não troca as rotas do aplicativo, não cria backups no OneDrive nem escreve arquivos reais. O chamador futuro deve comprovar revogação de todas as sessões antigas, produzir backups independentes nos diretórios aprovados e tratar metadados/sessões/versões. As flags de autorização do teste não constituem essa comprovação em produção. Corte real continua bloqueado até inventário final, prévia/hash, backups, permissões e autorização do titular. Não pode haver duas bases ativas graváveis.

## Rotina anual e incremental

`folderFiles` descobre o ano corrente e o anterior para complementos; a configuração não precisa ser trocada em janeiro. Pastas históricas e `base inicial` são reservadas à recuperação explicitamente solicitada, sem varredura normal de todos os anos. PDFs são selecionados no escopo anual e identificados pelo parser de conteúdo; competência/data do documento deve ser compatível com a pasta de contracheques. Não se restringem as competências de FGTS/NEOS/CNIS ao ano da pasta.

O importador compara ID/ETag e mantém compatibilidade com o manifesto antigo. A mudança do nome/versão do parser, sozinha, não provoca reimportação total. Quando o ETag mudou mas o hash dos bytes é igual, atualiza o manifesto sem reprocessar rubricas. Sem metadado forte, pode ser necessário baixar para conferir hash; não se afirma que um arquivo está inalterado sem prova. Versão/identidade são conferidas antes/depois nas leituras de fontes privadas com ETag. Falha de PDF restaura os dados anteriores pelo fluxo existente. NEOS/FGTS reutilizam os validadores de saldos/cotas e suas camadas; continuidade de todas as versões reais ainda exige validação.

Diferenças retroativas explicitamente identificadas no PDF ficam no mês do pagamento documentado, com competência de referência preservada. Sem data de pagamento comprovada não há remapeamento por aproximação. PDFs repetidos permanecem deduplicados pelo núcleo existente. Manifesto registra versão/hash, data e se as coleções foram alteradas. Resumo detalhado de arquivos ignorados e meses recalculados ainda precisa de refinamento; não se presume que todos os lançamentos financeiros foram reconciliados porque a importação terminou.

Relatórios de despesas/receitas/transferências preparados pelo OneDrive vão para a **candidata**, não para aplicação direta na rotina. É exigido um exemplar identificável de cada tipo; versões empatadas/ausentes são bloqueadas. Novas datas nos nomes padronizados de exportação são reconhecidas com calendário/horário e layout válidos, mantendo nomes internos canônicos e origem real. Cobertura, perfil, período de vencimentos e controles independentes não são preenchidos automaticamente. Carga inicial/recuperação antigas continuam ações separadas, nunca atalhos para aprovar candidata.

## Sincronização opcional de conciliações

`private-history-sync.js` prepara união append-only de revisões/eventos, com ETag esperado, backup do remoto e detecção de mesmo ID com conteúdos diferentes. Não exclui histórico, não sobrescreve conflito, não se mistura à base de transações e tem `applyAllowed:false`. O IndexedDB existente não foi substituído. Transporte Graph, backups externos e interface de aprovação de sincronização ainda não foram habilitados; nenhuma configuração inicia sincronização automática.


## Complemento — transporte Graph injetado e recuperação (07/11/2026)

`private-graph-transport.js` implementa leitura versionada, cópia condicional com If-None-Match e conflictBehavior=fail, hash/releitura e backups independentes antes do estágio. Não tem fetch, token ou request global; o chamador injeta o transporte. Escritas estão bloqueadas por padrão, sem instância na aplicação. A habilitação usada nos testes aponta exclusivamente para um Graph sintético. Falhas retêm diário e IDs/hashes dos backups parciais; não há remoção automática.

Histórico: união append-only existente, backup verificado do remoto, If-Match, nova conferência de ETag e releitura do conteúdo final. Conflitos de mesmo ID, concorrência e falhas de backup bloqueiam a operação. Criação inicial é separada e não sobrescreve arquivo existente. IndexedDB não é substituído nem apagado; teste de upgrade conserva eventos v1.

Migração: stageWithBackups prepara as duas cópias e conserva bytes/IDs/extras/anexos/links. activateVerified exige backups intactos e uma função externa que comprove a revogação de todos os gravadores inventariados, com referência de auditoria. O retorno sintético dessa função no teste não é prova de revogação em produção. O transporte não altera ACLs, não descobre todas as sessões antigas por si e **não troca as rotas reais**. Sem isso, uma única base gravável real não está comprovada; o corte permanece bloqueado.

Faltam para execução real: inventário final de origens/destinos/versões e gravadores, prévia autorizada, verificação das precondições de criação/upload suportadas pelo Graph real, permissões e diretórios aprovados, backups reais verificados, revogação distribuída/rotas únicas, ensaio de recuperação e autorização específica. Nenhum contrato/aditivo/projeto/PDF/XLSM ou arquivo original deve ser movido.

Contracheques mantêm ano corrente/anterior e recuperação histórica explícita. Investimentos descobrem todos os diretórios anuais existentes; base inicial é incluída somente na primeira carga sem histórico FGTS/NEOS ou em recuperação explícita. PDFs CNIS na raiz permanecem disponíveis. Pastas/páginas/arquivos agora têm limites e detecção de ciclos/IDs duplicados. Manifesto/ETag/hash, competência documental, complementos no pagamento e validações de saldos/cotas permanecem. Continuidade de todos os layouts reais, papéis de documentos acumulados e recálculo mínimo por dependência não foram presumidos nem declarados concluídos.

## Confronto privado da construção

`construction-reference-audit.js` e `scripts/compare-construction-reference.cjs` comparam duas séries mensais exportadas localmente, sem executar Excel ou Minha Obra. Exigem mapeamento explícito revisado de mês, campos, unidade e tolerância. Ausência, null, texto e mês duplicado não viram zero. Saída padrão contém apenas contadores; um quarto argumento grava relatório privado detalhado em arquivo novo (não sobrescreve).

```text
node scripts/compare-construction-reference.cjs modelo-privado.json referencia-privada.json mapeamento-privado.json resultado-privado-novo.json
```

Esses JSONs ficam fora do checkout. Para campos como juros de obra, amortização, liberação, saldo devedor, FGTS, recursos próprios, rendimentos e cronograma, confirmar a semântica de cada coluna antes do confronto. Correspondência numérica não substitui conferência documental/contratual. Motores locais e verificador Python de 413 meses permanecem a evidência sintética; confronto integral com a planilha privada não foi executado nesta rodada.
