# PR separado — corte definitivo dos JSONs operacionais

**Rascunho preparatório, dependente do PR #8.** Este delta contém somente o plano verificável. Não troca rotas, não instancia transporte de escrita, não cria pastas, não lê OneDrive e não executa migração. O código de protocolo/transportes já preparado no PR #8 não é duplicado. O PR deve ser redirecionado para main somente depois da integração aprovada do PR #8; até lá, base na branch desse PR, evitando incluir novamente todas as funcionalidades.

## Escopo único

Destino: pasta `Dados privados/Bases` da raiz privada configurada do Controle Financeiro (a raiz definitiva será conferida pelo usuário no inventário privado). Migrar apenas `controle-financeiro-app.json` e `dados-construcao-controle-financeiro.json`. Não mover contratos, documentos da construção, PDFs, Excel, anexos ou relatórios. `dados-completos.json` não vira terceira base canônica: inventariar seu papel de compatibilidade e impedir uso operacional como fallback após o corte verificado. Não excluir nenhuma origem nesta etapa.

## Matriz de dependências

| Responsabilidade atual | Estado no PR #8 | Aceite necessário para corte futuro |
|---|---|---|
| app-state / rota legada da base ativa | Funciona sem migrar | Resolver rota por manifesto de corte autenticado, não por pasta existente ou checkbox |
| construction-host / base canônica integrada | Rota antiga preservada, ETag e merge | Mesma origem/destino do inventário e fonte única após corte |
| construction-migration / fallback dados-completos | Compatibilidade preservada | Desativar fallback operacional somente depois da cópia canônica íntegra, conservando recuperação explícita |
| IndexedDB / rascunhos e backups | Permanecem no dispositivo | Confirmar dirty pendente/conflitos; nunca substituir por vazio ou limpar armazenamento |
| private-cutover-core | Protocolo injetado e bloqueado | Prova externa de revogação de todos os gravadores, backup íntegro e autorizações específicas |
| private-graph-transport | Sem instância de escrita real | Validar operações condicionais e recuperação no destino autorizado, sem conceder escrita ao modo fontes |
| conferência de faturas | Cliente GET isolado | Nenhum acesso novo a Bases/Backups, nenhuma permissão de corte herdada |

## Inventário privado antes de qualquer alteração

Registrar localmente: caminhos exatos, drive/item IDs, tamanhos, SHA-256 do conteúdo recebido, ETags, versão do schema e horários informativos. Não publicar o inventário no GitHub. Conteúdo completo e campos desconhecidos devem ser preservados. Metadados/tamanho isolados não comprovam integridade. Identificar todas as sessões e gravadores antigos (outros dispositivos, app legado, timers e integrações) e obter procedimento externo verificável para torná-los incapazes de gravar; uma flag local não prova revogação. Se não houver essa garantia, **bloquear corte**.

## Sequência transacional proposta — exige autorização de execução

1. Exibir inventário e conflitos locais/remotos; interromper se houver dirty pendente sem resolução ou divergência não revisada. Usuário aprova arquivos, fontes, destino e janela de manutenção.
2. Gerar backup privado independente de cada origem, verificar por releitura/hash e registrar diário persistente de migração; comprovar recuperação antes de copiar.
3. Ler origem vinculada ao ETag inventariado; se mudou, cancelar e preservar cópias. Copiar ao destino apenas com precondição de criação sem sobrescrita. Destino existente divergente exige decisão específica, nunca substituir silenciosamente.
4. Reler ambos os destinos e comparar hash, schema, contagens, IDs, vínculos/anexos e campos desconhecidos; demonstrar que a origem não mudou. Falhas parciais mantêm diário e backups sem ativar rota.
5. Reconferir revogação dos gravadores, integridade dos backups e autorizações. Ativar uma única vez um manifesto de corte versionado e condicional por ETag. Impedir dois caminhos graváveis simultaneamente; confirmar comportamento após recarga, reconexão e outro dispositivo. Não afirmar snapshot distribuído a partir de hashes ou ETags isolados.
6. Só após aceite: remover dependências **operacionais** da rota legada e fallback, mantendo ferramenta de recuperação explícita. Originais permanecem preservados até autorização separada de eventual descarte.

## Recuperação e rollback

Antes do corte: retomar pelo diário, comparando novamente origem/backup/destino; nunca repetir PUT indiscriminadamente. Cópia parcial não é base ativa.

Depois do corte: congelar gravações; se houve novas alterações no destino, não repontar silenciosamente à origem antiga. Inventariar versões, gerar novos backups e exigir reconciliação/autorização de recuperação. Restaurar somente cópia verificada com ETag e aprovação específica. Reverter código não restaura dados nem revoga gravadores. Sem recuperação comprovada, manter leitura e bloqueio de escrita.

## Testes e critérios de aceite (antes de conectar implementação real)

- Inventário não inclui documentos/Excel/PDF, não expõe valores/IDs em logs públicos.
- Origem intacta; ETag alterado antes/durante cópia bloqueia. Hash divergente, destino existente e campos desconhecidos preservados.
- Falha em cada etapa, retomada, diário adulterado, backup corrompido e concorrência entre dois clientes não ativam rota.
- Corte único; origem e destino nunca ficam simultaneamente graváveis. Reabertura não usa fallback legado após corte confirmado.
- Rascunhos/IDs locais/anexos e histórico preservados; fontes somente leitura continuam incapazes de acessar bases ou escrever.
- Recuperação antes/depois do corte, inclusive alteração posterior no destino; proibição de rollback destrutivo silencioso.
- Aplicativo atualizado deve continuar funcional com rota antiga **até** aprovação do corte. Validação financeira SAC/INSS/fontes não é substituída por sucesso técnico da cópia.

Testes sintéticos existentes: `private-graph-transport.test.cjs`, `consolidated-private.test.cjs`, `construction-migration.test.cjs`, `construction-host.test.cjs`, `sources-read-session.test.cjs` e roteiros de sessões/isolamento. Eles comprovam componentes preparados, não permissões/revogação/garantias de consistência do Graph real. Revisão do contrato real de precondições, cadastro de rotas e autorização são pendências externas explícitas.
