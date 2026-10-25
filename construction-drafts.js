/* Each editing session keeps a recoverable draft independently of the shared cache. */
(function(root){'use strict';
const PREFIX='controle-financeiro-construcao-v1-draft-',SESSION='controle-construcao-draft-session-';
function pending(storage){const rows=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(PREFIX))continue;try{const draft=JSON.parse(storage.getItem(key));if(draft?.dirty&&draft.state?.items&&draft.state?.meta?.engine?.config)rows.push({...draft,key})}catch{}}return rows.sort((a,b)=>String(b.updated).localeCompare(String(a.updated)))}
function open(storage,session,{id=()=>crypto.randomUUID(),role='main',reuse=true}={}){
 const sessionKey=SESSION+role,previous=session.getItem(sessionKey),sessionId=reuse&&previous?previous:id(),key=PREFIX+sessionId;session.setItem(sessionKey,sessionId);
 const read=()=>{try{return JSON.parse(storage.getItem(key)||'null')}catch{return null}};
 function remember(state,base,dirty){if(dirty)storage.setItem(key,JSON.stringify({dirty:true,state:structuredClone(state),base:structuredClone(base),updated:new Date().toISOString()}));else storage.removeItem(key)}
 function recover(sourceKey,current,base,dirty){const draft=pending(storage).find(x=>x.key===sourceKey);if(!draft)throw Error('Rascunho não encontrado; atualize a lista.');if(dirty&&current){const backup=PREFIX+id();storage.setItem(backup,JSON.stringify({dirty:true,state:structuredClone(current),base:structuredClone(base),updated:new Date().toISOString()}))}remember(draft.state,draft.base,true);return structuredClone(draft)}
 return {key,read,remember,recover,pending:()=>pending(storage)};
}
root.ConstructionDrafts={PREFIX,pending,open};if(typeof module!=='undefined')module.exports=root.ConstructionDrafts;
})(typeof globalThis!=='undefined'?globalThis:this);
