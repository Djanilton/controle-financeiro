/* One category normalizer. Legacy local semantics are not a provider split contract. */
(function(root){'use strict';
const copy=structuredClone,own=(o,k)=>Object.hasOwn(o||{},k),id=v=>typeof v==='string'&&v.length>0;
const SEMANTICS=Object.freeze({contract:'controle-financeiro-normalized-v1',currency:'BRL',scale:2,unit:'major',itemAmount:'presentationAmount',detailAmount:'amount',sign:'source-signed',dueDate:'explicit-calendar-date',occurrenceMonth:'explicit',recurrenceCodes:'F-fixed-M-monthly-or-installment'});
const fail=code=>{throw Object.assign(Error(code),{code})},need=(ok,code)=>{if(!ok)fail(code)};
function majorMinor(n){need(typeof n==='number'&&Number.isFinite(n)&&Number.isSafeInteger(Math.round(n*100))&&Number(n.toFixed(2))===n,'SPLIT_VALUE_INVALID');return Math.round(n*100)}
const stable=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);const same=(a,b)=>stable(a)===stable(b);
function legacy(raw,detail,semantics,profileId){
 const splits=detail.categorySplits;if(splits===undefined&&!(raw.categoriesCount>1))return [raw];
 need(Object.entries(SEMANTICS).every(([k,v])=>semantics?.[k]===v),'SPLIT_SEMANTICS_UNCONFIRMED');
 need(id(profileId)&&id(raw.id)&&id(raw.occurrenceMonth)&&['expenses','incomes','transfers'].includes(raw.type)&&detail.id===raw.id&&(!own(detail,'profileId')||detail.profileId===profileId),'SPLIT_PARENT_MISMATCH');
 need(Array.isArray(splits)&&splits.length>0&&splits.length<=1000,'SPLIT_STRUCTURE_INVALID');
 if(raw.categoriesCount!=null)need(Number.isInteger(raw.categoriesCount)&&raw.categoriesCount===splits.length,'SPLIT_COUNT_MISMATCH');
 need(raw.splitId==null,'SPLIT_PARENT_IDENTITY_UNCONFIRMED');const ids=new Set();let sum=0;for(const x of splits){need(x&&typeof x==='object'&&!Array.isArray(x)&&id(x.id),'SPLIT_ID_REQUIRED');need(!ids.has(x.id),'SPLIT_ID_DUPLICATED');ids.add(x.id);need(id(x.description),'SPLIT_CATEGORY_REQUIRED');need(!own(x,'subcategory')||x.subcategory==null||typeof x.subcategory==='string','SPLIT_CATEGORY_REQUIRED');for(const field of ['categoryId','subcategoryId'])need(!own(x,field)||x[field]==null||id(x[field]),'SPLIT_CATEGORY_REQUIRED');need(!own(x,'monetaryProjection'),'SPLIT_SEMANTICS_UNCONFIRMED');need(!own(x,'currency')||x.currency==='BRL','SPLIT_CURRENCY_MISMATCH');need(!own(x,'scale')||x.scale===2,'SPLIT_SCALE_MISMATCH');const n=majorMinor(x.amount);sum+=n;need(Number.isSafeInteger(sum),'SPLIT_VALUE_INVALID')}
 need(sum===majorMinor(raw.presentationAmount),'SPLIT_SUM_MISMATCH');
 return splits.map(x=>({...raw,presentationAmount:x.amount,splitId:x.id,category:{id:x.categoryId,description:x.description},subcategory:{id:x.subcategoryId,description:x.subcategory||''},categoryAllocation:{schema:'cf-category-allocation-v1',profileId,parentItem:copy(raw)}}));
}
function inspect(item,detail){
 const s=detail?.categorySplits;if(s===undefined&&!(item?.categoriesCount>1))return null;
 let code='SPLIT_MONETARY_CONTRACT_UNCONFIRMED';
 if(!Array.isArray(s)||!s.length||s.length>1000)code='SPLIT_STRUCTURE_INVALID';
 else if(s.some(x=>!id(x?.id)))code='SPLIT_ID_REQUIRED';
 else if(new Set(s.map(x=>x.id)).size!==s.length)code='SPLIT_ID_DUPLICATED';
 else if(item?.categoriesCount!=null&&item.categoriesCount!==s.length)code='SPLIT_COUNT_MISMATCH';
 return {status:'BLOCKED',code,financialCount:1,categoryLineCount:Array.isArray(s)?s.length:null,rows:Array.isArray(s)?s.slice(0,1000).map(x=>({id:id(x?.id)?x.id:null,label:typeof x?.description==='string'?x.description:'Não confirmado',subcategory:typeof x?.subcategory==='string'?x.subcategory:'',valueState:!own(x,'amount')?'ABSENT':x.amount===null?'NULL':'UNCONFIRMED',projectionState:!own(x,'monetaryProjection')?'ABSENT':x.monetaryProjection===null?'NULL':'CONTRACT_UNCONFIRMED'})):[]};
}
const categoryRow=row=>!!row.minhasFinancas?.splitId&&!!(row.sourceFields?.item?.categoryAllocation||own(row.sourceFields?.detail,'categorySplits')||row.sourceFields?.item?.categoriesCount>1||own(row.sourceFields?.mcpObservation?.detail,'categorySplits'));
function invoiceRows(input,{hasLocalChanges}={}){
 const groups=new Map(),plain=[];for(const row of input){if(!categoryRow(row)){plain.push(row);continue}const m=row.minhasFinancas;need(id(m.profileId)&&id(m.remoteId)&&id(m.occurrenceMonth),'SPLIT_ID_REQUIRED');const k=JSON.stringify([m.profileId,row.kind,m.remoteId,m.occurrenceMonth]);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row)}
 for(const rows of groups.values()){
  const first=rows[0],m=first.minhasFinancas,source=first.sourceFields,meta=source?.item?.categoryAllocation;
  need(meta?.schema==='cf-category-allocation-v1'&&meta.profileId===m.profileId,'SPLIT_SOURCE_EVIDENCE_REQUIRED');const parent=meta.parentItem,detail=source.detail;
  need(parent?.id===m.remoteId&&parent.occurrenceMonth===m.occurrenceMonth&&({expenses:'Despesa',incomes:'Receita',transfers:'Transferência'})[parent.type]===first.kind&&detail?.id===m.remoteId,'SPLIT_PARENT_MISMATCH');
  const expected=legacy(parent,detail,source.financialSemantics,m.profileId);need(rows.length===expected.length,'SPLIT_GROUP_INCOMPLETE');const seen=new Set();
  for(const r of rows){need(typeof hasLocalChanges==='function'&&!hasLocalChanges(r),'SPLIT_LOCAL_CHANGES');const allocation=r.sourceFields?.item?.categoryAllocation,part=expected.find(x=>x.splitId===r.minhasFinancas.splitId);need(part&&!seen.has(part.splitId),'SPLIT_ID_DUPLICATED');seen.add(part.splitId);need(same(r.sourceFields.item,part),'SPLIT_SOURCE_CONTRADICTORY');need(same(allocation,meta)&&same(r.sourceFields.detail,detail)&&same(r.sourceFields.financialSemantics,source.financialSemantics),'SPLIT_SOURCE_CONTRADICTORY');need(majorMinor(r.cashAmount)===majorMinor(part.presentationAmount)&&majorMinor(r.amount)===majorMinor(part.presentationAmount)&&r.category===part.category.description&&r.subcategory===part.subcategory.description,'SPLIT_LOCAL_CHANGES');for(const f of ['dueDate','paymentDate','postedDate','account','destination','card','kind','status','installments','recurrence','invoiceMonth','invoiceKind','purchaseDate'])need(same(r[f],first[f]),'SPLIT_CONTEXT_MISMATCH')}
  const total=parent.presentationAmount;
  plain.push({...copy(first),id:'mf-occurrence:'+JSON.stringify([m.profileId,parent.type,m.remoteId,m.occurrenceMonth]),description:parent.description,amount:total,cashAmount:total,category:'Multicategoria',subcategory:'',categoryAllocations:expected.map(x=>({id:x.splitId,category:x.category.description,subcategory:x.subcategory.description,amount:x.presentationAmount})),minhasFinancas:{...copy(m),splitId:null},sourceFields:{...copy(source),categoryRows:rows.map(r=>({localId:r.id,splitId:r.minhasFinancas.splitId,category:r.category,subcategory:r.subcategory,cashAmount:r.cashAmount}))}});
 }
 return plain;
}
function summaries(input,{hasLocalChanges}={}){const groups=new Map();for(const row of input){const m=row.minhasFinancas;if(!categoryRow(row))continue;const key=JSON.stringify([m.profileId,row.kind,m.remoteId,m.occurrenceMonth]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row)}return [...groups.values()].slice(0,30).map(rows=>{const m=rows[0].minhasFinancas;try{const parent=invoiceRows(rows,{hasLocalChanges})[0];return {remoteId:m.remoteId,month:m.occurrenceMonth,status:'VALIDATED_LOCAL_NORMALIZED',totalMinor:majorMinor(parent.cashAmount),rows:parent.categoryAllocations}}catch(e){return {remoteId:m.remoteId,month:m.occurrenceMonth,status:e.code||'SPLIT_MAPPING_REQUIRES_REVIEW',totalMinor:null,rows:[]}}})}
const api={summaries,SEMANTICS,majorMinor,legacy,inspect,invoiceRows};root.MinhasFinancasCategories=api;if(typeof module==='object')module.exports=api;
})(globalThis);
