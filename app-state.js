/* App-owned private database. Source documents are read only on explicit import. */
'use strict';
const APP_STATE_FILE='controle-financeiro-app.json',APP_SYNC_KEY='controle-financeiro-sync-v1';
let appSync=loadJson(APP_SYNC_KEY,{etag:'',dirty:false}),appRemote=null,appSyncTask=null,appSaveTimer,appReady=false,appLoading=false,appBackupMade=false,appRevision=0,appLastCheck=0,appSignature='',appSyncStatus='Dados deste dispositivo';
function appStateData(){const result={...data};for(const key of ['constructionSnapshot','constructionStatus','constructionImportedAt','constructionItemId','constructionEtag','financingConfig','constructionSyncError','financialBridgeError'])delete result[key];return {schema:1,data:result,manual:structuredClone(manual)}}
function appStateSignature(value=appStateData()){return JSON.stringify({data:value.data,manual:value.manual})}
let appStorageUnsafe=false;
function appStorageFailure(error){appStorageUnsafe=true;appSyncStatus='Falha no armazenamento local. Alterações podem ser perdidas ao fechar o navegador. Exporte uma cópia antes de fechar.';toast(appSyncStatus);return error}
function saveSyncMeta(){try{localStorage.setItem(APP_SYNC_KEY,JSON.stringify(appSync))}catch(error){throw appStorageFailure(error)}}
addEventListener('beforeunload',event=>{if(appStorageUnsafe){event.preventDefault();event.returnValue=''}});
function hasAppData(){return !!(data.transactions?.length||data.sources?.length||data.payroll?.baseline?.length||data.payroll?.documents?.length||manual.transactions?.length)}
function appChanged(){if(!appReady||appLoading)return;const signature=appStateSignature();if(signature===appSignature)return;appSignature=signature;appRevision++;appSync.dirty=true;saveSyncMeta();clearTimeout(appSaveTimer);if(user)appSaveTimer=setTimeout(()=>saveAppState().catch(appSyncError),3500)}
function appSyncError(e){if(appStorageUnsafe){toast(appSyncStatus);return}const status=e.message||String(e);if(appSyncStatus!==status){appSyncStatus=status;toast(status)}}
const appDbBefore=dbSet;dbSet=async function(key,value){if(key==='main')appChanged();try{await appDbBefore(key,value)}catch(error){throw appStorageFailure(error)}};
const appManualBefore=saveManual;saveManual=function(){try{appManualBefore();appChanged()}catch(error){throw appStorageFailure(error)}};
const sourcesWorkbookBefore=importOneDriveWorkbook;importOneDriveWorkbook=async function(event){if(!event)return;return sourcesWorkbookBefore()};
async function appStateMetadata(){try{return await (await graph('/me/drive/root:/'+graphPath(CONSTRUCTION_FOLDER+'/'+APP_STATE_FILE),{silent:true})).json()}catch(e){if(e.message.includes('404'))return null;throw e}}
async function downloadAppState(item){
 const safeError=message=>Object.assign(new Error(message),{appDownloadSafe:true});
 const url=item['@microsoft.graph.downloadUrl'];
 let validUrl=false;try{validUrl=new URL(url).protocol==='https:'}catch{}
 if(!url||!validUrl)throw safeError('URL de leitura da base indisponível. Consulte novamente os metadados do OneDrive.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),120000);
 try{
  const response=await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(response.status!==200)throw safeError('Download da base não concluído (HTTP '+response.status+'). Consulte novamente o OneDrive; a URL pode ter expirado.');
  const bytes=await response.arrayBuffer();
  if(Number.isFinite(item.size)&&bytes.byteLength!==item.size)throw safeError('Download incompleto da base. Os dados locais foram preservados.');
  const value=validateAppState(JSON.parse(new TextDecoder().decode(bytes)));
  const latest=await appStateMetadata();
  if(!item.eTag||latest?.id!==item.id||latest?.eTag!==item.eTag)throw safeError('A base mudou durante o download. Confira a versão da nuvem antes de continuar.');
  return value;
 }catch(error){if(error.name==='AbortError')throw safeError('Tempo de leitura da base excedido. Os dados locais foram preservados.');if(error.appDownloadSafe)throw error;throw safeError('Falha ao transferir ou interpretar a base. Os dados locais foram preservados; consulte novamente o OneDrive.')}finally{clearTimeout(timer)}
}
function validateAppState(value){if(![undefined,1].includes(value?.schema)||!value?.data||!Array.isArray(value.data.transactions)||!Array.isArray(value.data.sources)||!value.manual||!Array.isArray(value.manual.transactions))throw Error('Base privada do aplicativo inválida. Os dados deste dispositivo foram preservados.');return {...value,schema:1}}
async function readAppState({force=false}={}){
 await readyAuth();if(!user||appSync.reviewLocked)return false;if(!force&&Date.now()-appLastCheck<60000&&appRemote)return false;
 const item=await appStateMetadata();appLastCheck=Date.now();
 if(!item){appRemote=null;if(hasAppData()){appSync.dirty=true;saveSyncMeta();await saveAppState()}return false}
 if(item.eTag===appSync.etag&&appRemote){if(appSync.dirty)await saveAppState();return false}

 const readSignature=appStateSignature();
 const value=await downloadAppState(item);
 if(appStateSignature()!==readSignature)throw Error('Os dados locais mudaram durante a leitura da nuvem. Suas alterações foram preservadas; tente sincronizar novamente.');
 if(appSync.dirty&&appSync.etag!==item.eTag){if(!appSync.pendingSignature||appStateSignature(value)!==appSync.pendingSignature)throw Error('Há alterações neste dispositivo e outra versão na nuvem. Abra Configurações para conferir as cópias.');appSync.etag=item.eTag;delete appSync.pendingSignature;saveSyncMeta()}
 appRemote={item,value};if(appSync.dirty){await saveAppState();return false}
 appLoading=true;try{if(hasAppData())await appDbBefore('before-cloud-sync',{data:structuredClone(data),manual:structuredClone(manual)});if(appStateSignature()!==readSignature)throw Error('Os dados locais mudaram durante a recuperação. Alterações preservadas.');const construction=Object.fromEntries(['constructionSnapshot','constructionStatus','constructionImportedAt','constructionItemId','constructionEtag','financingConfig'].filter(k=>data[k]!==undefined).map(k=>[k,data[k]]));data={...value.data,...construction};manual=structuredClone(value.manual);appManualBefore();invalidateModel();await appDbBefore('main',data);appSync={etag:item.eTag,dirty:false};saveSyncMeta();appSignature=appStateSignature();appSyncStatus='Sincronizado com o OneDrive';render();return true}finally{appLoading=false;appChanged()}
}
async function saveAppState(){
 if(!appReady||appLoading||!appSync.dirty||!user)return;if(reportBusy){clearTimeout(appSaveTimer);appSaveTimer=setTimeout(()=>saveAppState().catch(appSyncError),3500);return}
 if(appSyncTask)return appSyncTask;
 appSyncTask=(async()=>{const revision=appRevision,current=await appStateMetadata();if((current?.eTag||'')!==(appSync.etag||''))throw Error('Outra sessão alterou a base. Suas alterações locais foram preservadas; confira em Configurações.');
  const folder=await constructionFolder(),prefix='/me/drive/items/'+encodeURIComponent(folder.id)+':/';
  if(current&&!appBackupMade){const old=appRemote?.value||await downloadAppState(current);await authorizedWrite(prefix+'controle-financeiro-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json:/content',JSON.stringify(old));appBackupMade=true}
  const payload={...appStateData(),savedAt:new Date().toISOString()};appSync.pendingSignature=appStateSignature(payload);saveSyncMeta();const saved=await authorizedWrite(current?'/me/drive/items/'+encodeURIComponent(current.id)+'/content':prefix+APP_STATE_FILE+':/content',JSON.stringify(payload),current?.eTag||null);appRemote={item:saved,value:payload};if(!saved.eTag)throw Error('Envio sem ETag confirmado. Resultado incerto; confira a versão da nuvem antes de repetir.');appSync.etag=saved.eTag;appSync.dirty=appRevision!==revision;delete appSync.pendingSignature;saveSyncMeta();appSyncStatus=appSync.dirty?'Alterações locais aguardando sincronização':'Sincronizado com o OneDrive';if(appSync.dirty)appSaveTimer=setTimeout(()=>saveAppState().catch(appSyncError),3500)
 })().finally(()=>{appSyncTask=null});return appSyncTask;
}
async function connectAppState(){if(appSyncTask)return appSyncTask;try{await readAppState({force:true})}catch(e){appSyncError(e)}}
const stateLoginBefore=login;login=async function(){await stateLoginBefore();await connectAppState()};
const stateInitBefore=init;init=async function(){await stateInitBefore();try{const journal=await dbGet('reconciliation-journal');if(journal&&journal.stage!=='complete'){appSync.reviewLocked=true;appConflictLocked=true;saveSyncMeta();appSyncStatus='Conciliação interrompida. Gravação bloqueada. Exporte a cópia de recuperação e compare novamente antes de aplicar.'}}catch(error){appStorageFailure(error);appSync.reviewLocked=true;appConflictLocked=true}appSignature=appStateSignature();appReady=true;await connectAppState()};
async function authorizeAppState(){await constructionWriteToken(true);await connectAppState();await saveAppState();toast(appSyncStatus);render()}
async function useCloudState(){if(appSync.reviewLocked)throw Error('Conclua a conciliação antes de substituir a base local.');if(!confirm('Carregar a versão da nuvem? A cópia deste dispositivo será guardada para recuperação.'))return;await appDbBefore('before-cloud-sync',{data:structuredClone(data),manual:structuredClone(manual)});const previousSync={...appSync};appSync.dirty=false;appSync.etag='';saveSyncMeta();try{await readAppState({force:true})}catch(error){appSync=previousSync;saveSyncMeta();throw error}}
async function exportStateBackup(previous=false){const value=previous?await dbGet('before-cloud-sync'):appStateData();if(!value)return toast('Nenhuma cópia anterior neste dispositivo.');const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(value)],{type:'application/json'}));a.href=url;a.download='controle-financeiro-'+(previous?'copia-anterior':'backup')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const stateSettingsBefore=settingsView;settingsView=function(){return stateSettingsBefore()+'<article class="card"><h2>Base privada do aplicativo</h2><p>'+esc(appSyncStatus)+'</p><p class="fine">As alterações são salvas no aplicativo e sincronizadas no OneDrive. Planilhas e PDFs só são lidos quando você aciona Importar. A primeira autorização de gravação é feita pelo botão abaixo.</p><div class="actions"><button class="primary" id="authorizeAppState">Autorizar e sincronizar</button><button class="secondary" id="exportAppState">Exportar base completa</button><button class="secondary" id="exportPreviousState">Exportar cópia anterior deste dispositivo</button><button class="secondary" id="useCloudState">Carregar versão da nuvem</button></div></article>'};
const stateAttachBefore=attach;attach=function(){stateAttachBefore();$('authorizeAppState')?.addEventListener('click',()=>authorizeAppState().catch(appSyncError));$('exportAppState')?.addEventListener('click',()=>exportStateBackup());$('exportPreviousState')?.addEventListener('click',()=>exportStateBackup(true));$('useCloudState')?.addEventListener('click',()=>useCloudState().catch(appSyncError))};
function checkAppState(){if(!appReady||!user||document.hidden||!navigator.onLine||appSyncTask||Date.now()-appLastCheck<60000)return;appLastCheck=Date.now();(appSync.dirty?saveAppState():readAppState({force:true})).catch(appSyncError)}
setInterval(checkAppState,60000);addEventListener('focus',checkAppState);document.addEventListener('visibilitychange',checkAppState);
let appReadTask=null;const appReaderBefore=readAppState;readAppState=function(options){if(appReadTask)return appReadTask;appReadTask=appReaderBefore(options).finally(()=>{appReadTask=null});return appReadTask};

let appConflictReview=null,appConflictLocked=false,appReconcileSending=false,appApplying=false;
const conflictSaveBefore=saveAppState;saveAppState=async function(){if((appConflictLocked||appSync.reviewLocked)&&!appReconcileSending)throw Error('Conciliação em revisão. Gravação bloqueada; exporte e revise as cópias.');return conflictSaveBefore()};
async function comparePrivateBases(){appConflictLocked=true;appSync.reviewLocked=true;saveSyncMeta();if(appSyncTask)await appSyncTask;const item=await appStateMetadata();if(!item)throw Error('Base da nuvem não encontrada. Nenhuma gravação realizada.');const local=structuredClone(appStateData()),signature=appStateSignature(local),cloud=await downloadAppState(item);if(appStateSignature()!==signature)throw Error('A base local mudou durante a comparação. Compare novamente.');appConflictReview={local,cloud,etag:item.eTag,signature,report:BaseReconciliation.compare(local,cloud),choices:{}};render()}
function exportConflictCopy(kind){if(!appConflictReview)throw Error('Compare as bases primeiro.');let value=kind==='proposal'?BaseReconciliation.consolidate(appConflictReview.report,appConflictReview.choices):kind==='report'?appConflictReview.report:appConflictReview[kind];const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='base-revisao-'+kind+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function conflictReviewView(){const review=appConflictReview;return `<article class="card"><h2>Conciliação da base privada</h2><p>Comparação somente de leitura. Cópias e relatórios contêm dados privados: guarde-os com segurança. Sem base comum, um registro exclusivo pode representar exclusão; escolha explicitamente.</p><button id="comparePrivateBases">Comparar local e nuvem</button>${review?`<p>${review.report.differences.length} diferenças; gravação bloqueada durante revisão.</p><div class="table-wrap"><table><tbody>${review.report.differences.map((d,i)=>`<tr><td>${esc(d.id)}</td><td>${esc(d.type)}</td><td><pre>${esc(JSON.stringify(d.local))}</pre></td><td><pre>${esc(JSON.stringify(d.cloud??d.candidates))}</pre></td><td><select data-review-choice="${i}"><option value="">Revisar</option><option value="local">Local (ou exclusão)</option><option value="cloud">Nuvem (ou exclusão)</option></select></td></tr>`).join('')}</tbody></table></div><div class="actions">${['local','cloud','report','proposal'].map(k=>`<button data-review-export="${k}">Exportar ${k}</button>`).join('')}</div><p>Exportar proposta não aplica nem envia dados. O botão de aplicação exige confirmação explícita e reconfere a versão da nuvem.</p>`:''}</article>`};
const conflictAttachBefore=attach;attach=function(){conflictAttachBefore();$('comparePrivateBases')?.addEventListener('click',()=>comparePrivateBases().catch(appSyncError));document.querySelectorAll('[data-review-choice]').forEach(el=>el.addEventListener('change',()=>{appConflictReview.choices[appConflictReview.report.differences[Number(el.dataset.reviewChoice)].id]=el.value}));document.querySelectorAll('[data-review-export]').forEach(el=>el.addEventListener('click',()=>{try{exportConflictCopy(el.dataset.reviewExport)}catch(error){appSyncError(error)}}))};
async function applyReviewedBase(){
 if(appApplying)throw Error('Aplicação já em andamento.');
 if(!navigator.locks)throw Error('Este navegador não oferece bloqueio seguro entre abas. Exporte as cópias e utilize um navegador compatível.');
 return navigator.locks.request('controle-financeiro-reconciliation',{ifAvailable:true},async lock=>{if(!lock)throw Error('Outra aba está aplicando uma conciliação. Aguarde e compare novamente.');appApplying=true;try{return await applyReviewedBaseLocked()}finally{appApplying=false}})
}
async function applyReviewedBaseLocked(){
 const review=appConflictReview;if(!review)throw Error('Compare as bases primeiro.');
 const approved=validateAppState(BaseReconciliation.consolidate(review.report,review.choices));
 if(appStateSignature()!==review.signature)throw Error('A base local mudou. Compare novamente.');
 const item=await appStateMetadata();if(item?.eTag!==review.etag)throw Error('A nuvem mudou. Compare novamente.');
 if(!confirm('Aplicar a proposta revisada neste dispositivo e sincronizar com OneDrive? As duas cópias serão guardadas antes da gravação.'))return;
 const journal={stage:'prepared',local:review.local,cloud:review.cloud,approved,etag:review.etag,choices:structuredClone(review.choices)};
 appSync.reviewLocked=true;appConflictLocked=true;saveSyncMeta();
 try{
 await appDbBefore('reconciliation-journal',journal);
 await appDbBefore('before-reconciliation-'+Date.now(),journal);
 if(appStateSignature()!==review.signature)throw Error('A base local mudou durante o backup. Compare novamente.');
 const current=await appStateMetadata();if(appStateSignature()!==review.signature)throw Error('A base local mudou. Compare novamente.');if(current?.eTag!==review.etag)throw Error('A nuvem mudou durante o backup. Compare novamente.');
 appLoading=true;
 const next={...data,...approved.data};await appDbBefore('main',next);manual=structuredClone(approved.manual);appManualBefore();data=next;invalidateModel();appSync.etag=review.etag;appSync.dirty=true;appBackupMade=false;appRemote={item:current,value:review.cloud};appRevision++;appSignature=appStateSignature();saveSyncMeta();
 await appDbBefore('reconciliation-journal',{...journal,stage:'local-applied'});
 appLoading=false;appReconcileSending=true;await saveAppState();appReconcileSending=false;
 if(appSync.dirty)throw Error('Existem alterações posteriores ao envio. Compare novamente antes de concluir.');
 await appDbBefore('reconciliation-journal',{stage:'complete'});
 appSync.reviewLocked=false;appConflictLocked=false;saveSyncMeta();appConflictReview=null;render();
 }catch(error){appSync.reviewLocked=true;appConflictLocked=true;appSyncStatus='Conciliação interrompida. Não feche sem exportar a cópia de recuperação. Compare novamente; não force a substituição.';try{saveSyncMeta()}catch{}throw Error(appSyncStatus)}finally{appLoading=false;appReconcileSending=false}

}
async function exportReconciliationJournal(){const journal=await dbGet('reconciliation-journal');if(!journal||journal.stage==='complete')throw Error('Nenhuma recuperação pendente.');const url=URL.createObjectURL(new Blob([JSON.stringify(journal)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='conciliacao-recuperacao-privada.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function conflictApplyView(){return '<button id="exportReconciliationJournal">Exportar cópia de recuperação privada</button>'+(appConflictReview?'<article class="card"><button id="applyReviewedBase">Aplicar proposta revisada e sincronizar</button></article>':'')};
const reviewAttachBefore=attach;attach=function(){reviewAttachBefore();$('exportReconciliationJournal')?.addEventListener('click',()=>exportReconciliationJournal().catch(appSyncError));$('applyReviewedBase')?.addEventListener('click',()=>applyReviewedBase().catch(appSyncError))};
