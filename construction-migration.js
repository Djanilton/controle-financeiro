/* Recoverable construction migration; source records and attachment IDs stay intact. */
(function(root){
'use strict';
const STORAGE='controle-financeiro-construcao-v1',LEGACY='minha-obra-completa-local-v1',FILE='dados-construcao-controle-financeiro.json';
const copy=x=>structuredClone(x),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),stamp=s=>[s?.meta?.settingsUpdated||'',s?.meta?.updated||''].sort().at(-1);
function valid(s){return !!s?.items&&!!s?.meta?.engine?.config&&Object.values(s.items).every(Array.isArray)}
function merge(a,b,base=null){if(!valid(a))return {state:copy(b),conflicts:[]};if(!valid(b))return {state:copy(a),conflicts:[]};const conflicts=[];
 const newer=stamp(a)>=stamp(b)?a:b,older=newer===a?b:a;
 function join(x,y,z,path){if(eq(x,y))return copy(x);if(base&&eq(x,z))return copy(y);if(base&&eq(y,z))return copy(x);if(x===undefined)return copy(y);if(y===undefined)return copy(x);
  if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x)&&!Array.isArray(y)){const o={};for(const k of new Set([...Object.keys(x),...Object.keys(y)]))o[k]=join(x[k],y[k],z?.[k],path+'.'+k);return o}
  if(!base&&Array.isArray(x)&&Array.isArray(y)){if(!x.length&&y.length)return copy(y);if(!y.length&&x.length)return copy(x)}
  if(base&&!/\.(updated|settingsUpdated|financialBalances)$/.test(path))conflicts.push(path);return copy(newer===a?x:y);
 }
 // Arrays of obligations are merged by identity below, never as a single field.
 const taskMeta=new Set(['contractTasks','contractTaskDeleted','contractTasksUpdated']);
 const otherMeta=s=>Object.fromEntries(Object.entries(s?.meta||{}).filter(([k])=>!taskMeta.has(k)));
 const otherRoot=s=>Object.fromEntries(Object.entries(s||{}).filter(([k])=>k!=='meta'&&k!=='items'));
 const out={...join(otherRoot(a),otherRoot(b),base?otherRoot(base):undefined,'root'),items:{},meta:join(otherMeta(a),otherMeta(b),base?otherMeta(base):undefined,'meta')};
 for(const kind of new Set([...Object.keys(a.items),...Object.keys(b.items)])){const entries=new Map();for(const s of [b,a])for(const r of s.items[kind]||[]){const key=r.id||JSON.stringify(r),old=entries.get(key);if(old&&base){const original=base.items?.[kind]?.find(x=>x.id===r.id);entries.set(key,join(r,old,original,'items.'+kind+'.'+key))}else if(!old||(r.updated||'')>=(old.updated||''))entries.set(key,copy(r))}out.items[kind]=[...entries.values()];const deleted={...b.meta.deletedRecords?.[kind]};for(const [id,time]of Object.entries(a.meta.deletedRecords?.[kind]||{}))if(!deleted[id]||time>deleted[id])deleted[id]=time;out.meta.deletedRecords??={};out.meta.deletedRecords[kind]=deleted;out.items[kind]=out.items[kind].filter(r=>!deleted[r.id])}
 // Match old title-only entries to an ID only when that title is unambiguous.
 const titleIds=new Map();for(const s of [a,b,base])for(const r of s?.meta?.contractTasks||[])if(r.id&&r.title){if(!titleIds.has(r.title))titleIds.set(r.title,new Set());titleIds.get(r.title).add(r.id)}
 const keyOf=r=>{const ids=titleIds.get(r.title);if(!r.id&&ids?.size>1)conflicts.push('meta.contractTasks.'+r.title);return r.id|| (ids?.size===1?[...ids][0]:r.title)};
 const taskMap=s=>{const m=new Map();for(const r of s?.meta?.contractTasks||[]){const k=keyOf(r);if(!k||m.has(k))conflicts.push('meta.contractTasks.'+(k||'sem-identidade'));else m.set(k,r.id||!titleIds.has(r.title)?r:{...r,id:k})}return m};
 const left=taskMap(a),right=taskMap(b),original=taskMap(base),deleted={};
 for(const s of [a,b])for(const [key,time]of Object.entries(s.meta.contractTaskDeleted||{})){const ids=titleIds.get(key),id=ids?.size===1?[...ids][0]:key;if(!deleted[id]||time>deleted[id])deleted[id]=time}
 const tasks=[];for(const k of new Set([...left.keys(),...right.keys()])){const x=left.get(k),y=right.get(k),z=original.get(k),path='meta.contractTasks.'+k;let row;
  if(!x||!y)row=copy(x||y);else if(base)row=join(x,y,z,path);else if(eq(x,y))row=copy(x);else if(x.updated&&y.updated&&x.updated!==y.updated)row=copy(x.updated>y.updated?x:y);else{conflicts.push(path);row=copy(x)}
  if(deleted[k]){const changed=base&&z&&![x,y].filter(Boolean).every(r=>eq(r,z));if(changed||row.updated&&row.updated>deleted[k]){conflicts.push(path);tasks.push(row)}else if(!base&&!row.updated){conflicts.push(path);tasks.push(row)}}else tasks.push(row);
 }
 if(a.meta.contractTasks||b.meta.contractTasks)out.meta.contractTasks=tasks;
 if(a.meta.contractTaskDeleted||b.meta.contractTaskDeleted)out.meta.contractTaskDeleted=deleted;
 if(a.meta.contractTasksUpdated||b.meta.contractTasksUpdated)out.meta.contractTasksUpdated=[a.meta.contractTasksUpdated||'',b.meta.contractTasksUpdated||''].sort().at(-1);
 return {state:out,conflicts:[...new Set(conflicts)]};
}
function verify(before,after){if(!valid(before)||!valid(after))throw Error('Base de construção inválida.');const missing=[];for(const [kind,rows]of Object.entries(before.items))for(const x of rows)if(x.id&&!after.items[kind]?.some(y=>y.id===x.id)&&!after.meta.deletedRecords?.[kind]?.[x.id])missing.push(kind+':'+x.id);const refs=x=>{const values=[];function visit(v){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')for(const [k,z]of Object.entries(v)){if(/driveItemId|url$/i.test(k)&&typeof z==='string'&&z)values.push(z);visit(z)}}visit(x);for(const d of x.meta.contractInfo?.docs||[])if(d[2])values.push(d[2]);return values};const afterRefs=new Set(refs(after));for(const r of refs(before))if(!afterRefs.has(r))missing.push('anexo:'+r);return {passed:missing.length===0,missing,counts:Object.fromEntries(Object.entries(after.items).map(([k,v])=>[k,v.length]))}}
function local(storage,seed){let current,legacy;try{current=JSON.parse(storage.getItem(STORAGE)||'null');legacy=JSON.parse(storage.getItem(LEGACY)||'null')}catch{}let state=valid(current)?current:valid(legacy)?copy(legacy):valid(seed)?copy(seed):null;if(!state)return null;if(!valid(current)){const backup=STORAGE+'-backup-origem';if(!storage.getItem(backup))storage.setItem(backup,JSON.stringify(state));storage.setItem(STORAGE,JSON.stringify(state))}if(valid(seed)){const result=merge(state,seed);if(result.conflicts.length)throw Error('Conflito de migração; registros locais preservados.');const merged=result.state;if(!verify(state,merged).passed)throw Error('Migração interrompida: registros não preservados.');state=merged;storage.setItem(STORAGE,JSON.stringify(state))}return state}
function preserveLegacy(storage,seed){let state=local(storage,seed);const raw=storage.getItem(LEGACY);if(!raw||raw===storage.getItem(STORAGE+'-legacy-imported'))return state;let legacy;try{legacy=JSON.parse(raw)}catch{return state}if(!valid(legacy))return state;if(!storage.getItem(STORAGE+'-backup-legado'))storage.setItem(STORAGE+'-backup-legado',raw);const result=state?merge(state,legacy):{state:copy(legacy),conflicts:[]};if(result.conflicts.length)throw Error('Conflito com registros legados; cópias preservadas.');state=result.state;if(!verify(legacy,state).passed)throw Error('Registros locais legados não foram preservados.');storage.setItem(STORAGE,JSON.stringify(state));storage.setItem(STORAGE+'-legacy-imported',raw);return state}
root.ConstructionMigration={STORAGE,LEGACY,FILE,valid,merge,verify,local:preserveLegacy};if(typeof module!=='undefined')module.exports=root.ConstructionMigration;
})(typeof globalThis!=='undefined'?globalThis:this);
