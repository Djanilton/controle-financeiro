/* Explicitly injected Graph transport. Not instantiated by the application; writes default to blocked. */
(function(root){'use strict';
const H=root.PrivateHistorySync||(typeof require==='function'?require('./private-history-sync'):null),M=root.PrivateCutover||(typeof require==='function'?require('./private-cutover-core'):null);
const safePath=p=>{if(typeof p!=='string'||!p||/[:?#\u0000-\u001f\\]/.test(p)||p.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('GRAPH_PRIVATE_PATH_INVALID');return p.split('/').map(encodeURIComponent).join('/')};
function create({request,basesFolder,backupsFolder,historyFolder,allowWrites=false}={}){
 if(typeof request!=='function')throw Error('GRAPH_INJECTED_REQUEST_REQUIRED');
 const path=(folder,name)=>'/me/drive/root:/'+safePath(folder+'/'+name),byId=id=>{if(typeof id!=='string'||!id)throw Error('GRAPH_ITEM_ID_REQUIRED');return '/me/drive/items/'+encodeURIComponent(id)};
 async function send(method,url,body,headers={}){if(method!=='GET'&&!allowWrites)throw Error('GRAPH_REAL_WRITES_DISABLED');const r=await request({method,url,body,headers});if(!r||!Number.isInteger(r.status))throw Error('GRAPH_RESPONSE_INVALID');if(r.status===404&&method==='GET')return null;if(r.status===409||r.status===412)throw Error('GRAPH_VERSION_CONFLICT');if(r.status<200||r.status>=300)throw Error('GRAPH_OPERATION_FAILED');return r}
 async function metadata(url){const r=await send('GET',url+'?$select=id,name,eTag,size,file');if(!r)return null;const v=r.json;if(!v?.id||!v.eTag||!v.file||!Number.isSafeInteger(v.size)||v.size<0||v.size>30000000)throw Error('GRAPH_METADATA_INVALID');return v}
 async function readId(id){const before=await metadata(byId(id));if(!before)throw Error('GRAPH_SOURCE_MISSING');const r=await send('GET',byId(id)+'/content');if(typeof r?.text!=='string'||new TextEncoder().encode(r.text).byteLength>30000000)throw Error('GRAPH_CONTENT_INVALID');const after=await metadata(byId(id));if(!after||after.eTag!==before.eTag||after.id!==before.id)throw Error('GRAPH_SOURCE_CHANGED');return {...after,content:r.text}}
 async function createVerified(folder,name,text){const r=await send('PUT',path(folder,name)+':/content?@microsoft.graph.conflictBehavior=fail',text,{'If-None-Match':'*','Content-Type':'application/json'}),item=r.json;if(!item?.id||!item.eTag)throw Error('GRAPH_CREATE_INVALID');const verify=await readId(item.id);if(verify.eTag!==item.eTag||await M.digest(verify.content)!==await M.digest(text))throw Error('GRAPH_COPY_NOT_VERIFIED');return item}
 return {
  readSource:readId,readTarget:readId,
  exists:async name=>!!await metadata(path(basesFolder,name)),
  createIfAbsent:(name,text)=>createVerified(basesFolder,name,text),
  backup:async(name,text)=>createVerified(backupsFolder,name,text),
  readHistory:async name=>{const item=await metadata(path(historyFolder,name));return item?readId(item.id):null},
  async commitHistory(plan,{name='historico-conciliacoes.json',authorized=false,backupName}={}){
   if(!authorized||!plan?.passed||plan.conflicts?.length||!backupName)throw Error('HISTORY_EXPLICIT_AUTHORIZATION_REQUIRED');
   const current=await this.readHistory(name);if(!current||current.eTag!==plan.expectedETag||JSON.stringify(JSON.parse(current.content))!==JSON.stringify(plan.backup))throw Error('GRAPH_VERSION_CONFLICT');
   await createVerified(backupsFolder,backupName,current.content);const again=await this.readHistory(name);if(!again||again.eTag!==current.eTag||await M.digest(again.content)!==await M.digest(current.content))throw Error('GRAPH_VERSION_CONFLICT');
   const content=JSON.stringify(plan.entries),r=await send('PUT',byId(current.id)+'/content',content,{'If-Match':current.eTag,'Content-Type':'application/json'}),verify=await readId(current.id);
   if(!r.json?.eTag||verify.eTag!==r.json.eTag||await M.digest(verify.content)!==await M.digest(content))throw Error('HISTORY_REUPLOAD_NOT_VERIFIED');return {eTag:verify.eTag,entries:plan.entries,applyAllowed:false};
  },
  async createHistory(entries,{authorized=false,name='historico-conciliacoes.json'}={}){if(!authorized)throw Error('HISTORY_EXPLICIT_AUTHORIZATION_REQUIRED');H.prepare(entries,[],{etag:'creation-only'});return createVerified(historyFolder,name,JSON.stringify(entries))}
 };
}
async function stageWithBackups(plan,transport,{authorized=false,backupPrefix}={}){if(!authorized||!backupPrefix)throw Error('CUTOVER_BACKUP_AUTHORIZATION_REQUIRED');const backups=[];try{for(const e of plan.entries){const current=await transport.readSource(e.id);if(current.eTag!==e.eTag||await M.digest(current.content)!==e.hash)throw Error('CUTOVER_SOURCE_CHANGED');const b=await transport.backup(backupPrefix+'-'+e.name,current.content);backups.push({name:e.name,id:b.id,eTag:b.eTag,hash:e.hash})}const journal=await M.stage(plan,transport,{authorized:true});return {...journal,sourceWritable:null,sourceWriteStatus:'revocation-not-verified',backups}}catch(error){error.journal={phase:'failed',active:'source',sourceWritable:false,targetWritable:false,...error.journal,sourceWritable:null,sourceWriteStatus:'revocation-not-verified',backups};throw error}}
async function activateVerified(journal,transport,{authorized=false,verifyRevocation}={}){if(!authorized||typeof verifyRevocation!=='function'||journal.backups?.length!==2)throw Error('CUTOVER_DISTRIBUTED_REVOCATION_REQUIRED');const proof=await verifyRevocation();if(proof?.allKnownWritersRevoked!==true||!Array.isArray(proof.writers)||!proof.writers.length||proof.writers.some(w=>w.revoked!==true)||!proof.auditReference)throw Error('CUTOVER_DISTRIBUTED_REVOCATION_REQUIRED');for(const b of journal.backups){const v=await transport.readTarget(b.id);if(v.eTag!==b.eTag||await M.digest(v.content)!==b.hash)throw Error('CUTOVER_BACKUP_CHANGED')}return {...await M.activate(journal,transport,{authorized:true,sourceWriteLeaseRevoked:true}),sourceWriteStatus:'externally-verified-revoked'}}
const api={create,stageWithBackups,activateVerified};if(typeof module==='object'&&module.exports)module.exports=api;else root.PrivateGraphTransport=api;
})(globalThis);
