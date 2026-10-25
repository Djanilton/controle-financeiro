# Validação do motor e migração — 25/10/2026

## Estado da entrega

Implementação incorporada à main e publicada para conferência em 25/10/2026 pelo [PR #1](https://github.com/Djanilton/controle-financeiro/pull/1), commit `c32c4bf`. O [workflow 40203918065](https://github.com/Djanilton/controle-financeiro/actions/runs/40203918065) concluiu com sucesso. Nenhuma gravação foi feita nos serviços financeiros. A auditoria inicial comprovava testes e presença dos módulos, mas não a correção integral do motor. Esta etapa acrescenta confronto com a planilha indicada pelo usuário e reconstrução independente do SAC.

As fontes privadas ficaram fora do repositório. A planilha foi obtida em leitura pelo conector OneDrive; a versão encontrada estava modificada em 18/10/2026. Nenhuma base privada foi atualizada para aplicar as correções.

## Correções e recuperação de funcionalidades

- A importação conserva principal, FGTS de cada aba e prazo da referência validada. Não impõe o FGTS histórico nem anuncia valores fixos. Referência e cenário são cópias independentes. Uma importação reprovada também preserva os bytes anteriormente disponíveis para exportação.
- O fallback antigo de integração deixa de impor FGTS fixo.
- Amortizações programadas que excedam a dívida ou ocorram após quitação retornam à reserva. FGTS, PLR e amortização programada respeitam essa ordem de atribuição na dívida; PLR não aplicada retorna ao caixa e eventos Finan posteriores à quitação permanecem na reserva. FGTS excedente continua no FGTS, sem virar dinheiro bancário. O modo de referência histórica foi preservado para comparação com a planilha.
- Obrigações são fundidas por ID ou título legado inequívoco, considerando a atualização de cada item. Edições independentes com base comum podem ser combinadas; alterações concorrentes do mesmo campo, identidade ambígua e edição versus exclusão exigem revisão. Tombstones e timestamps são preservados. Importação local, incorporação de legado e recepção no iframe deixam de ignorar conflitos retornados.
- A exportação **Acompanhamento atual (Excel)** gera arquivo local separado com registros, IDs, anexos, obrigações, referências e resultados atuais do motor. A exportação da planilha original continua separada. JSON permanece o formato de restauração integral, incluindo campos/metadados que não têm representação tabular equivalente.
- O extrator de fórmulas/valores foi recuperado; exige destino privado fora do repositório e recusa sobrescrever arquivo existente. A CLI de validação imprime somente contagens e divergências agregadas.
- O validador Python reconstrói o SAC sem importar o motor JS. A conservação de caixa e soma por banco são conferidas como invariantes; isso não constitui uma implementação independente de toda a política de salário e da otimização.
- A leitura da planilha da construção no OneDrive voltou a ter acesso em Configurações > Importações > Carga inicial e recuperação. Exige sessão e confirmação; uma cópia da configuração anterior é guardada antes de aplicar a importação validada. A cópia pode ser exportada em Opções e cópias da construção.
- A migração agora conserva a estratégia escolhida. Não aplica Equilibrado automaticamente nem reverte configurações/políticas antigas.
- Rascunhos têm cópias independentes por sessão, sobrevivem à recarga e podem ser recuperados após fechar outra aba. A projeção usa o estado do editor da própria janela; campos privados desconhecidos também são combinados sem eliminar subcampos.
- O acompanhamento Excel inclui custos próprios com valores editados, programações, cláusulas/fontes documentais e histórico de anexos, além dos registros e motor.
- Os testes de navegador da migração e do Minhas Finanças aceitam `PLAYWRIGHT_MODULE` e `CHROME_PATH`, além do ambiente anterior. A migração testa também download/abertura do acompanhamento Excel e navegação em viewport estreita.

## Evidências da planilha, reproduzidas nesta etapa

| Conferência | Cobertura | Resultado |
|---|---|---|
| XLSX → adaptador → cenário original → valores salvos | 9.698 valores | Zero divergências acima de R$0,01; diferença máxima aproximadamente 2,84 × 10⁻¹⁴ |
| Extração Python → mapa privado → cenário original | 9.697 valores, 8.385 fórmulas | Zero divergências; nenhuma fórmula sem mapeamento |
| Referência legada de UI → adaptação integrada | 20.237 verificações numéricas, 413 meses | Diferença máxima zero |
| Reconstrução Python: cenário original | 6.608 verificações, 413 meses | Diferença máxima zero |
| Reconstrução Python: cenário atual derivado da planilha | 6.608 verificações, 413 meses | Diferença máxima zero |
| Reconstrução Python: configuração vinculada da construção | 6.608 verificações, 413 meses | Diferença máxima zero |

O fluxo XLSX e o mapa do openpyxl têm contagens distintas devido às representações de células vazias/tipos. Ambos passaram na tolerância estabelecida. Os valores salvos do XLSX não foram recalculados pelo Excel nesta sessão. O cenário original usa `trCapitalizes:false`; os cenários atuais preservam as correções e a fase de obra. Igualdade com a referência não exige remover melhorias autorizadas.

Os três cenários acima derivam da planilha. Na etapa seguinte, os JSONs privados original e integrado também foram lidos: a verificação não encontrou IDs ou referências de anexos ausentes. O cenário efetivo da base integrada passou em outras 6.608 verificações independentes, em 413 meses, com diferença máxima zero e sem dívida negativa. Isso confirma preservação estrutural, não abertura/permissão dos anexos.

A tentativa de obter `controle-financeiro-app.json` pelo conector terminou com `Transport closed`. A base financeira completa, os saldos bancários/FGTS atuais e a reconciliação de todos os lançamentos reais continuam não verificados. O cenário da construção sem essa atualização de saldos não autoriza concluir cobertura de todos os pagamentos; insuficiências continuam expostas.

O teste independente sintético percorre seis combinações: estratégias CDB, Finan e Equilibrado, com zero ou doze meses de construção. Inclui TR, saldo FGTS projetado, extras/amortizações, data de corte, insuficiência e saldos por banco. Há controles negativos que adulteram juros ou ocultam insuficiência e exigem reprovação.

## Testes executados ao concluir

- Suíte completa: **212 testes aprovados**, sem falhas ou ignorados.
- Cinco scripts de navegador passaram: migração, campos, fluxos operacionais, sessões e Minhas Finanças. Cobrem 11 cenários, incluindo campos/foco, edição durante envio, upload simulado, obrigações/cláusulas, ICS, gráficos, recarga, recuperação de rascunhos, conflitos, passagem entre opções e tela principal, página carregada offline, Excel e viewport a 390 px.
- Navegador Minhas Finanças: importação repetida sem duplicação, manutenção de ID e backup aprovados.
- Testes adicionais reproduzem os defeitos de FGTS fixo, merge de obrigações e perda/atribuição incorreta de excedentes; as correções passam.
- Validações da referência e da migração foram repetidas após a correção dos excedentes, mantendo os resultados da tabela. O validador independente foi ampliado para verificar também a atribuição de fontes, além de SAC e conservação de caixa.

Os navegadores usaram perfis isolados, dados sintéticos, host simulado e Microsoft bloqueada. No ambiente desta execução, a comunicação Node/Python e o servidor de testes de navegador exigiram execução fora do sandbox; não houve gravação externa.

## Matriz de migração atualizada

| Arquivo legado | Equivalente / decisão | Estado local após esta etapa |
|---|---|---|
| `.gitignore` | Regras do projeto principal | Substituído |
| `README.md` | README e documentos da aplicação principal | Atualizado; aceite integral da migração pendente |
| `calculation-engine.js` | `sac-engine.js`, `construction-finance.js` | Implementado; paridade e verificação independente nos cenários descritos |
| `docs/CALCULOS.md` | `MEMORIA_CALCULOS_CONSTRUCAO.md`, documentos atuais | Memória consolidada; histórico legado segue referência |
| `engine-ui.js` | `construction/engine-ui.js`, `embedded.js` | Incorporado; importação corrigida; referência original preservada em testes |
| `finance-bridge.js` | Ponte atual e host integrado | Substituído pela aplicação única |
| `icon.svg` | Ícone do Controle Financeiro | Substituído |
| `index.html` operacional | `construction/index.html` e host | Incorporado; acompanhamento Excel recuperado em exportação local |
| `manifest.webmanifest` | Manifesto da aplicação principal | Substituído; página carregada offline testada; instalação e arranque offline não verificados |
| `tests/browser.test.cjs` | Navegador integrado e testes de migração | Fluxos portados em `browser-construction-workflows.cjs`, migração e sessões; diferenças de arquitetura documentadas |
| `tests/engine.test.js` | Suítes atuais, referência e validador independente | Cobertura ampliada; casos legados executados na auditoria inicial |
| `tests/finance-bridge-browser.test.cjs` | Testar abas/dispositivos do app único | Substituído; duas abas e sessões independentes testadas em simulação; dispositivos físicos pendentes |
| `tests/finance-bridge.test.cjs` | `unification`, `reserve-priority` | Substituído por snapshot atual |
| `tests/fixture.js` | `tests/construction-fixture.cjs` | Incorporado |
| `tests/funding-priority.test.cjs` | `reserve-priority`, `unification` | Cobertura equivalente dos casos auditados |
| `tests/linked-values.test.cjs` | Testes de integração e navegador atual | Portado em `browser-construction-fields.cjs`; calendário, parâmetros, materiais, custos, aportes e recarga conferidos |
| `tests/login.test.cjs` | Testes de sessão e host integrado | Simulado; OAuth real ainda pendente |
| `tests/reserve-reference.test.cjs` | `referenceReserve` e testes atuais | Comportamento preservado; caso legado passou na auditoria inicial |
| `tests/validate-reference.cjs` | CLI recuperada com resumo sem dados privados | Implementado e executado |
| `tests/validate-tr.py` | `tools/validate_financing.py` | Substituído por reconstrução ampliada: SAC independente + conservação de caixa |
| `tools/extract_workbook.py` | Ferramenta recuperada | Implementado e executado com destino privado |
| `workbook-adapter.js` | `sac-adapter.js` | Conteúdo idêntico no inventário inicial |

## Execução reproduzível

```sh
node --test --test-isolation=none tests/*.test.cjs
python tools/extract_workbook.py /caminho/privado/referencia.xlsx /outro/diretorio/privado/cells.json
node tests/validate-reference.cjs /outro/diretorio/privado/cells.json
node tests/verify-workbooks.cjs '' /caminho/privado/referencia.xlsx
node tests/verify-migration.cjs /caminho/privado/referencia.xlsx
python tools/validate_financing.py /caminho/privado/snapshot.json
PLAYWRIGHT_MODULE=/caminho/playwright CHROME_PATH=/caminho/chrome node tests/browser-construction-migration.cjs
PLAYWRIGHT_MODULE=/caminho/playwright CHROME_PATH=/caminho/chrome node tests/browser-minhas-financas.cjs
PLAYWRIGHT_MODULE=/caminho/playwright CHROME_PATH=/caminho/chrome node tests/browser-construction-fields.cjs
PLAYWRIGHT_MODULE=/caminho/playwright CHROME_PATH=/caminho/chrome node tests/browser-construction-workflows.cjs
PLAYWRIGHT_MODULE=/caminho/playwright CHROME_PATH=/caminho/chrome node tests/browser-construction-sessions.cjs
node tests/verify-private-construction.cjs /privado/legado.json /privado/integrado.json
# Opcional: acrescentar /privado/base-app.json YYYY-MM-DD para conferir com saldos atuais.
```

O snapshot privado do validador contém `{config, options, result}`. `config` deve ser a configuração efetivamente usada pelo motor, inclusive overrides de saldos; `options` contém despesas/programações/movimentos; `result` é a saída a conferir. A ferramenta não gera nem escreve lançamentos. Python 3 é necessário para a suíte independente; openpyxl é necessário apenas para extração XLSX. Os testes de navegador precisam de Playwright e Chromium/Chrome.

## O que continua pendente

1. Conferência do usuário nas telas e aceite das substituições documentadas. Os fluxos legados identificados têm equivalentes e cobertura local; autenticação e dispositivos físicos não devem ser declarados validados pelos testes isolados.
2. Validar saldos/transações da base privada completa, funcionamento real de OAuth, permissões, backup/ETag e abertura de anexos; qualquer escrita real requer autorização específica.
3. Confirmar catálogo/consentimento e arquitetura do Minhas Finanças; implementar prévia, confirmação, idempotência, status e releitura do CRUD suportado. O site ainda importa pacotes e prepara intenções locais; não executa escrita remota.
4. Para casos excluídos pelas ferramentas oficiais — vínculos de empréstimo, Open Finance e outros — aguardar suporte do fornecedor; não usar lançamentos substitutos para contornar restrições.
5. A otimização Equilibrado é busca entre divisões testadas, não prova de ótimo global. Tributação é simplificada, CDI é modelado e liberações da Caixa são hipóteses. A validação numérica não confirma cobrança bancária real ou retorno futuro.
6. Publicação técnica concluída e registrada em `REQUISITOS_E_PENDENCIAS.md`; conferência visual/funcional do usuário ainda pendente. O aceite funcional e as operações financeiras reais continuam separados desta autorização.

## Substituições deliberadas e revisão no app

- A ponte de saldos entre duas aplicações e o segundo login Microsoft foram substituídos pela sessão única e pelo cenário integrado. Não reativar o aplicativo arquivado.
- O espelho Excel gravado automaticamente pelo legado foi substituído por exportação local dos dados atuais. A sincronização canônica permanece no JSON privado com backup/ETag. A planilha original continua somente leitura.
- O início das etapas é encadeado, a reserva usa saldos elegíveis e o salário respeita limites. Casos de testes que dependiam de entradas antigas independentes foram ajustados a essas regras atuais, sem restaurar dupla contabilização.
- Os modelos simplificados/estáticos antigos não foram reativados como projeções concorrentes. SAC, reserva, empréstimos e patrimônio continuam ligados ao mesmo motor.
- Alertas Android com o app fechado não existiam no legado. Lembretes na tela e exportação ICS estão preservados. Não foi introduzido service worker ou promessa de arranque offline.

Para sua conferência, revisar: Premissas → Resumo → Despesas → Cronograma (incluindo registros preservados) → Obrigações/documentos/PCI → Projeção Reserva → Empréstimos. Em Configurações > Importações, conferir leitura da planilha e Opções/cópias: JSON, Excel atual, planilha original, ICS e rascunhos recuperáveis. A implementação foi publicada pelo [PR #1](https://github.com/Djanilton/controle-financeiro/pull/1). O deploy foi confirmado pelo GitHub Actions; o acesso HTTP direto deste ambiente foi bloqueado pelo proxy. Consultar `REQUISITOS_E_PENDENCIAS.md` para evidências e pendências; o aceite do usuário permanece aberto.
