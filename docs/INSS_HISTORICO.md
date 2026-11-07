# Histórico INSS: evidências, cálculo e revisão sem aplicação

## Escopo

A seção **Investimentos → INSS — Histórico e conferência** amplia a tabela INSS existente e lê múltiplos relatórios oficiais locais (PDF com texto ou TXT) e, opcionalmente, somente a aba INSS de uma cópia da planilha. Reutiliza `pdfText`/`StatementCore.pdfLines` e XLSX existentes. Não existe menu ou tabela financeira independente de INSS. A mesma tabela recebe os campos de prévia, mantidos em memória: **não aplica**, não altera o arquivo, não substitui históricos, não sincroniza ou grava saldos. O parser INSS normal também marca as fontes como `reviewOnly`; `StatementCore.apply` preserva integralmente os registros anteriores de INSS e orienta a revisão, em vez de copiar o desconto do contracheque para duas contribuições. FGTS/NEOS preservam seus fluxos anteriores.

## Evidências separadas

| Fonte/campo | Tratamento |
|---|---|
| Vínculos e remunerações, coluna Remuneração | Histórica **informada**, com competência, origem e evidência separada. Não é automaticamente “apurada”, “consolidada” ou “declarada” no sentido do Ano Civil. |
| Campo explicitamente Declarada | Classificação declarada apenas quando o cabeçalho a comprova. |
| Ano Civil: remuneração apurada/consolidada | Campos distintos do layout conhecido; não somar entre si ou com o histórico informado. O Ano Civil não retroage a competências anteriores a 11/2019. |
| Grade anual CNIS reconhecida | Mantém os meses efetivamente ocupados; meses vazios não viram zero. |
| Mesmo campo/competência com valores diferentes | Preserva evidências e sinaliza conflito; não soma vínculos/complementos automaticamente, nem escolhe a última fonte silenciosamente. |
| Documento CNIS sem linhas remuneratórias reconhecidas | Aviso `NO_REMUNERATION_ROWS_RECOGNIZED`; não fabrica competências e não apaga outros relatórios. Documento ilegível sem reconhecimento continua bloqueado. |
| Contribuição INSS / Contribuição Cosern históricas | Preservadas separadamente. Célula preenchida não comprova origem independente, desconto ou recolhimento. |
| Desconto COSERN em contracheque | É desconto informado, não prova de recolhimento; não é copiado para Contribuição INSS. Um histórico COSERN com independência comprovada não é sobrescrito por atualização do contracheque. |
| Recolhimento | Apenas evidência explicitamente comprovada; ausência não vira zero ou contribuição estimada. |

`InssHistory.compare` expõe ausência, null e valor inválido, origens, remunerações por finalidade, contribuições e diferença. Valores originais ficam nas evidências privadas. Não inclui todos os vínculos em uma soma ou categoria sem prova. Paginação de PDF e datas de nascimento/emissão não são usadas para estabelecer primeira/última competência: a competência exige linha remuneratória ou grade reconhecida.

## Auditoria privada realizada

Foram lidos os três relatórios oficiais disponibilizados no OneDrive e a aba INSS do XLSM original **sem executar macros nem salvar o arquivo**. A comparação estrutural com o leitor PDF do próprio aplicativo recuperou a série longa e o Ano Civil, mantendo os conflitos. O relatório resumido de vínculos não ofereceu linhas de remuneração reconhecidas. O intervalo pessoal e as quantidades foram informados apenas ao titular; valores, planilha, PDFs, conteúdo extraído e identificadores não fazem parte do repositório/testes.

Na planilha, as duas contribuições são majoritariamente números gravados, sem origem documental rastreável por célula; também existem fórmulas de subtotal/projeção e referência à coluna COSERN. Isso **não comprova** uma competência de transição. O código anterior que atribuía a mesma rubrica às duas colunas também não serve como evidência. O marco continua **não confirmado**. `documentedTransition` exige documento de vigência identificado e revisado; igualdade numérica, inclusive entre fontes independentes, apenas registra observação.

## Cálculo versionado, nunca automático sobre remuneração genérica

Tabelas inicialmente registradas em `inss-history.js` para empregado, doméstico e avulso:

| Vigência | Norma / método |
|---|---|
| 2019-01 a 2019-12 | ME 9/2019, alíquota sobre a base integral, limitada ao teto. |
| 2020-01 a 2020-02 | SEPRT 3.659/2020, Anexo II, base integral. |
| 2020-03 a 2020-12 | SEPRT 3.659/2020, Anexo III, progressivo por faixas. |

Fontes oficiais: [tabelas históricas do INSS](https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal/tabela-de-contribuicao-historico) e [Portaria 3.659/2020, cópia do DOU no STJ](https://www.stj.jus.br/internet_docs/biblioteca/clippinglegislacao/Prt_3659_2020_ME.pdf). A notícia inicial da Portaria 914 não substitui a tabela revista da Portaria 3.659 para março/2020.

O núcleo exige base tributável explícita em centavos, categoria suportada, contexto de vínculos confirmado, competência, natureza mensal/13º e política de arredondamento. O 13º é um cálculo separado, nunca adicionado automaticamente à base mensal. Calcula as faixas com inteiros; arredondar ou truncar ao final são **políticas explícitas**, não regras presumidas para qualquer folha. Regime/categoria não suportado, múltiplos vínculos que precisem de rateio, política desconhecida ou competência sem tabela versionada bloqueiam cálculo. Não foi implementado rateio arbitrário entre vínculos ou confirmação de recolhimento.

**Limitação:** não há cálculo automático de toda a série histórica. Anos além das versões acima precisam de tabelas oficiais e regras de categoria/folha verificadas, inclusive mudanças intra-ano e tratamento de arredondamento em cada contexto. Na ausência, o relatório mostra `CALCULATION_CONTEXT_REQUIRED` ou `OFFICIAL_TABLE_NOT_VERSIONED`, preservando o desconto/histórico informado. A tela não usa remuneração genérica como salário de contribuição automaticamente. Bases de férias, 13º, múltiplos vínculos e incidências precisam de revisão documental antes de qualquer comparação calculada definitiva.

## Apresentação patrimonial

Os saldos históricos INSS continuam disponíveis como referência, sem reescrita. Posições geradas recebem `redeemable:false` e `assetEligible:false`; INSS sai dos totais de investimento e do agregado Prev/Ativos/Total. A coluna legada Prev INSS permanece informativa, sem integrar os ativos. NEOS e FGTS não mudam. O histórico INSS não é investimento resgatável, não gera saldo bancário e não financia a reserva da obra.

## Testar sem dados reais

Abrir `?area=investments` na execução local e selecionar **INSS — Histórico e conferência** e clicar **Demonstração fictícia INSS**. O exemplo mostra remuneração anterior ao Ano Civil, consolidado distinto e diferença de contribuições. Testes Node reproduzem conflito entre fontes, preservação histórica, março/2020, teto, arredondamento, 13º separado, bloqueio de vínculos/rateio, marco documental e indeterminado. Dados reais não integram fixtures ou CI.

### Contextos opcionais de cálculo

O campo de JSON da tela aceita uma lista de contextos privados explicitamente revisados. Exemplo totalmente fictício:

```json
[{"month":"2020-02","baseMinor":200000,"category":"employee","periodKind":"monthly","linksConfirmed":true,"otherBasesMinor":[],"rounding":"truncate-final","discountPeriodConfirmed":true}]
```

`baseMinor` não vem automaticamente da remuneração. `linksConfirmed` exige conferência real do contexto; não significa que o sistema resolveu rateio de vários vínculos. `discountPeriodConfirmed` declara que o desconto COSERN pertence à mesma incidência mensal; sem isso, a diferença contra o cálculo fica desconhecida. O relatório separa cada cálculo mensal/13º e mostra tabela, método, política e diferenças autorizadas; não soma 13º com mensal nem confirma recolhimento. O aviso `THIRTEENTH_PERIOD_REQUIRES_SEPARATE_MAPPING` impede tratar rubricas 13º reconhecidas no texto como competência mensal comum. A fonte original fica preservada para o mapeamento específico posterior.


## Compatibilidade da tabela existente — especificação consolidada

A coleção ativa continua sendo `data.sourceTables.INSS`. Não houve migração de dados nem uma segunda coleção financeira persistida. O item “Histórico INSS” saiu do menu principal; links antigos são redirecionados a Investimentos. A tabela e os filtros de período/instituição/situação foram reaproveitados. Ação “INSS — Histórico e conferência” seleciona explicitamente INSS sem alterar o intervalo de datas.

| Campo legado mantido | Semântica e compatibilidade |
|---|---|
| Mês | Competência original; formatos usados por importadores são preservados. |
| Remuneração Cosern | Histórico original; não é renomeado ou substituído pela classificação CNIS. |
| Remuneração INSS | Campo legado cuja origem/semântica individual pode variar; não é migrado automaticamente para “apurada” ou “consolidada”. |
| Contribuição Cosern | Valor histórico preservado; desconto de contracheque somente quando sua origem está comprovada. |
| Contribuição INSS | Histórico independente ou legado, sem cópia do desconto COSERN. |
| Saldo | Histórico informativo, com a compatibilidade de cálculo já existente; não integra patrimônio disponível ou resgatável. |

Campos adicionados à apresentação/prévia: **Remuneração Apurada CNIS**, **Remuneração Consolidada CNIS**, **Contribuição INSS calculada**, **Diferença calculada × COSERN**, **Fonte documental**, **Situação da conferência**, e remuneração histórica informada sem classificação anual. Nenhum campo legado é renomeado, removido ou preenchido por inferência. IDs, fórmulas representadas, metadados, anexos e campos extras permanecem nas linhas da candidata. Competências antigas ausentes das novas fontes permanecem presentes. Competência existente duplicada ou novo campo divergente gera conflito, sem associação/sobrescrita automática.

`InssHistory.previewTable` produz cópia de revisão com antes/depois e `applyAllowed:false`. A tela mostra as propostas na própria tabela, identificadas como não aplicadas; “Descartar somente a prévia” recupera a apresentação ativa. Alteração concorrente da base invalida a apresentação da prévia. Aplicação segue indisponível: exige migração validada, backup, ETag e autorização específica. Não existe ação que aplique essa prévia por clique nesta versão.

“Conferir PDFs INSS no OneDrive” usa a pasta de investimentos configurada privadamente, somente sob demanda. Lista a raiz, verifica identidade/ETag antes e depois da leitura e reaproveita fontes inalteradas **nesta sessão**. Não exige selecionar repetidamente os mesmos três PDFs. Configuração, sessão Microsoft e permissões reais de leitura no Windows ainda precisam de validação. Cache persistente de fontes INSS entre sessões não foi criado como segunda série financeira; reabrir sem uma prévia disponível pode requerer nova leitura autorizada.
