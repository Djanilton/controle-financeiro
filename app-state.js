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
function validateAppState(value){if(![undefined,1].includes(value?.schema)||!value?.data||!Array.isArray(value.data.transactions)||!Array.isArray(value.data.sources)||!value.manual||!Array.isArray(value.manual.transactions))throw Error('Base privada do aplicativo inválida. Os dados deste dispositivo foram preservados.');return {...value,schema:1}}
async function readAppState({force=false}={}){
 await readyAuth();if(!user)return false;if(!force&&Date.now()-appLastCheck<60000&&appRemote)return false;
 const item=await appStateMetadata();appLastCheck=Date.now();
 if(!item){appRemote=null;if(hasAppData()){appSync.dirty=true;saveSyncMeta();await saveAppState()}return false}
 if(item.eTag===appSync.etag&&appRemote){if(appSync.dirty)await saveAppState();return false}

 const readSignature=appStateSignature();
 const value=validateAppState(await(await graph('/me/drive/items/'+encodeURIComponent(item.id)+'/content',{silent:true})).json());
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
  if(current&&!appBackupMade){const old=appRemote?.value||await(await graph('/me/drive/items/'+encodeURIComponent(current.id)+'/content',{silent:true})).json();await authorizedWrite(prefix+'controle-financeiro-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json:/content',JSON.stringify(old));appBackupMade=true}
  const payload={...appStateData(),savedAt:new Date().toISOString()};appSync.pendingSignature=appStateSignature(payload);saveSyncMeta();const saved=await authorizedWrite(current?'/me/drive/items/'+encodeURIComponent(current.id)+'/content':prefix+APP_STATE_FILE+':/content',JSON.stringify(payload),current?.eTag||null);appRemote={item:saved,value:payload};if(!saved.eTag)throw Error('Envio sem ETag confirmado. Resultado incerto; confira a versão da nuvem antes de repetir.');appSync.etag=saved.eTag;appSync.dirty=appRevision!==revision;delete appSync.pendingSignature;saveSyncMeta();appSyncStatus=appSync.dirty?'Alterações locais aguardando sincronização':'Sincronizado com o OneDrive';if(appSync.dirty)appSaveTimer=setTimeout(()=>saveAppState().catch(appSyncError),3500)
 })().finally(()=>{appSyncTask=null});return appSyncTask;
}
async function connectAppState(){if(appSyncTask)return appSyncTask;try{await readAppState({force:true})}catch(e){appSyncError(e)}}
const stateLoginBefore=login;login=async function(){await stateLoginBefore();await connectAppState()};
const stateInitBefore=init;init=async function(){await stateInitBefore();appSignature=appStateSignature();appReady=true;await connectAppState()};
async function authorizeAppState(){await constructionWriteToken(true);await connectAppState();await saveAppState();toast(appSyncStatus);render()}
async function useCloudState(){if(!confirm('Carregar a versão da nuvem? A cópia deste dispositivo será guardada para recuperação.'))return;await appDbBefore('before-cloud-sync',{data:structuredClone(data),manual:structuredClone(manual)});const previousSync={...appSync};appSync.dirty=false;appSync.etag='';saveSyncMeta();try{await readAppState({force:true})}catch(error){appSync=previousSync;saveSyncMeta();throw error}}
async function exportStateBackup(previous=false){const value=previous?await dbGet('before-cloud-sync'):appStateData();if(!value)return toast('Nenhuma cópia anterior neste dispositivo.');const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(value)],{type:'application/json'}));a.href=url;a.download='controle-financeiro-'+(previous?'copia-anterior':'backup')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const stateSettingsBefore=settingsView;settingsView=function(){return stateSettingsBefore()+'<article class="card"><h2>Base privada do aplicativo</h2><p>'+esc(appSyncStatus)+'</p><p class="fine">As alterações são salvas no aplicativo e sincronizadas no OneDrive. Planilhas e PDFs só são lidos quando você aciona Importar. A primeira autorização de gravação é feita pelo botão abaixo.</p><div class="actions"><button class="primary" id="authorizeAppState">Autorizar e sincronizar</button><button class="secondary" id="exportAppState">Exportar base completa</button><button class="secondary" id="exportPreviousState">Exportar cópia anterior deste dispositivo</button><button class="secondary" id="useCloudState">Carregar versão da nuvem</button></div></article>'};
const stateAttachBefore=attach;attach=function(){stateAttachBefore();$('authorizeAppState')?.addEventListener('click',()=>authorizeAppState().catch(appSyncError));$('exportAppState')?.addEventListener('click',()=>exportStateBackup());$('exportPreviousState')?.addEventListener('click',()=>exportStateBackup(true));$('useCloudState')?.addEventListener('click',()=>useCloudState().catch(appSyncError))};
function checkAppState(){if(!appReady||!user||document.hidden||!navigator.onLine||appSyncTask||Date.now()-appLastCheck<60000)return;appLastCheck=Date.now();(appSync.dirty?saveAppState():readAppState({force:true})).catch(appSyncError)}
setInterval(checkAppState,60000);addEventListener('focus',checkAppState);document.addEventListener('visibilitychange',checkAppState);
let appReadTask=null;const appReaderBefore=readAppState;readAppState=function(options){if(appReadTask)return appReadTask;appReadTask=appReaderBefore(options).finally(()=>{appReadTask=null});return appReadTask};
