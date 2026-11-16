# Multicategorias — normalização compartilhada e limites de contrato

Base: main `051e654`, após PR #12. Branch independente `fix/mcp-multicategorias`; PRs #10/#11 não modificados. Sem fonte privada, autenticação real, consulta MCP ou operação financeira nesta implementação.

## O que funciona

`minhas-financas-categories.js` substitui o algoritmo de `expand()` por um único normalizador compartilhado. Reutiliza o **contrato local normalizado legado** `controle-financeiro-normalized-v1`, já existente no aplicativo; isso não é uma declaração sobre a saída bruta do fornecedor. Nesse contrato, `categorySplits[].id/amount/description/subcategory` têm semântica local revisada (major BRL/2, valores assinados).

Uma ocorrência de 100 com rateios 40 e 60 produz somente duas linhas financeiras, nunca uma linha adicional de 100. IDs da ocorrência (perfil/tipo/ID/mês), IDs dos rateios, descrição original, campos originais, conta/cartão, vencimento, situação e parcela são preservados. Recorrência explícita dos detalhes é aproveitada quando não vier no resumo. Não cria parcelas futuras nem presume pagamento pela confirmação monetária.

O normalizador exige IDs opacos distintos, estrutura/categorias válidas, valores de duas casas sem aproximação, contexto BRL/2 e soma inteira exata. Preserva sinais, inclusive compensações assinadas explícitas no contrato local. Moeda/escala divergentes, projeções individuais de formato não contratado e total inconsistente bloqueiam. Limite defensivo local de 1.000 rateios; não é um limite anunciado pelo fornecedor.

Os motores e filtros existentes recebem apenas as linhas classificadas: categorias/subcategorias, receitas/despesas, gráficos, saldo/fluxo e relatórios somam os mesmos valores, uma única vez. Não foram criados motores financeiros novos nem alteradas regras de investimentos, SAC, construção ou FGTS. Registros protegidos não são atualizados pelo desdobramento.

Para conciliação, o mesmo normalizador reconstrói uma ocorrência integral somente se todas as linhas e IDs esperados estiverem presentes, os originais/semântica coincidirem, os valores/categorias não tiverem alterações locais e o contexto de conta/cartão/datas/situação/parcela for coerente. Compara então uma compra de 100 com a fatura, não duas compras de 40/60 nem 200. Pagamentos continuam classificados pelo contrato de fatura existente, não por categorias ou sinal. Grupo parcial/alterado/duplicado fica bloqueado. `splitId` sem evidência de categorias não é classificado como rateio por analogia.

A interface de Despesas/Transações mostra evidência privada consolidada, categorias e valores, identidade e situação. A contagem distingue linhas classificadas de ocorrências; recortes incompletos não exibem total integral presumido. A visualização não insere uma linha financeira na base.

## Excel e identidade

O Excel mantém suas linhas originais por categoria; nenhuma nova migração ou deduplicação por nome/valor foi criada. Importações com 2 linhas podem representar 1 ocorrência MCP e 100 de valor, sem igualdade de contagens. Controles independentes continuam referentes às linhas do arquivo exportado.

Foi removida, **apenas para rateios**, a associação legada por semelhança de descrição/valor/notas. Se já existirem linhas Excel plausíveis sem vínculo remoto inequívoco, retorna `SPLIT_EXCEL_IDENTITY_REVIEW_REQUIRED`, preservando a base. Vínculos remotos existentes e IDs locais continuam reutilizados; reimportação idempotente não inventa uma descrição legada antes nula. Mudança de categoria/valor com mesmos IDs atualiza somente a proposta; edição local bloqueia. Troca/remoção de ID não apaga a linha anterior nem autoriza substituição.

## O que permanece bloqueado nas capturas MCP reais

**Não foi comprovado o contrato monetário individual de `categorySplits` na resposta real.** `monetaryProjection.equivalentMinor` confirmado para a ocorrência não comprova o valor de cada divisão. Um objeto parecido dentro de cada divisão ou uma flag de pacote não estabelece esse contrato. O adaptador de observações não importa esse campo como se fosse `amount` em reais/centavos.

Consulta apenas de metadados e documentação de ajuda disponível: os metadados anunciam entrada, não schema de saída dos rateios. A ajuda oficial consultada (Dicas de uso e Funcionalidades e planos, incluindo contexto sobre categorias/orçamentos) não documenta `categorySplits`/unidade monetária individual. Não foi consultado servidor autenticado nem solicitada nova captura.

O bloqueio principal continua `SPLIT_MAPPING_REQUIRES_REVIEW`. O relatório privado acrescenta motivos específicos: `SPLIT_MONETARY_CONTRACT_UNCONFIRMED`, `SPLIT_ID_REQUIRED`, `SPLIT_ID_DUPLICATED`, `SPLIT_STRUCTURE_INVALID`, `SPLIT_COUNT_MISMATCH`. Exibe valor consolidado apenas quando já comprovado pelo validador da ocorrência, quantidade de divisões e campos recebidos sem interpretar valores desconhecidos. Distingue ausente, nulo e não confirmado. Isso não transforma detailsOnly em busca/proposta/cobertura; não exporta candidata bloqueada.

Mesmo com valores individuais e soma aparentemente compatíveis, o caminho bruto continua bloqueado enquanto faltarem estas respostas oficiais:

1. Schema completo de uma divisão: campo exato do ID opaco, categoria e subcategoria e relação com a identidade da ocorrência.
2. Campo exato do valor individual, unidade, moeda, escala, sinal e evidência de confirmação/pendência. `amount`, `presentationAmount` e `fullAmount` não são assumidos equivalentes.
3. Se a divisão tem uma projeção própria comprovada, como identificar seu escopo, cobertura e vínculo; cobertura agregada não pode suprir confirmação individual.
4. Regras de soma/arredondamento, descontos/compensações e alterações/remoções de IDs, incluindo rateio dentro de parcela.

A publicação entrega componentes independentes e correções comprovadas. **Não habilita automaticamente multicategorias de capturas reais**, transporte MCP, exclusões/substituição por período ou aplicação financeira. Não há migração de schema da base ativa. Metadados novos existem apenas nos resultados de normalização explicitamente solicitada e nas revisões privadas.

## Validação e publicação

Fixtures integralmente sintéticas: 100/40/60, uma categoria, parcelas, créditos/estornos e compensações, soma inválida, ID ausente/duplicado, moeda/escala, compras iguais com IDs diferentes, reimportação/edição local, Excel com granularidade diferente, fatura integral, grupo incompleto e recuperação de revisão. Captura bruta com projeções individuais aparentemente válidas continua bloqueada; XSS escapado e nenhuma proposta/aplicação/escrita.

Suíte Node/Python e Chromium completa, incluindo proteção antecipada do PR #12 e desktop/mobile. Resultados e CI do SHA final registrados no PR. Rollback: revert do merge por PR, sem remover dados ou restaurar JSONs; não há migração financeira para desfazer. Publicação autorizada pelo usuário após CI e segurança comprovados, mantendo o processamento ambíguo bloqueado.
