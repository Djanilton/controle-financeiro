/* Pure candidate comparison. Local capture envelope, NOT a provider snapshot.
 * Never fetches, persists, retries, deletes, applies, or derives missing fields. */
(function(root){'use strict';
const SCHEMA='minhas-financas-observations-v1',CUTOFF='2026-10-01';
const TYPES={expenses:'Despesa',incomes:'Receita',transfers:'Transferência'},ALIASES={despesa:'expenses',receita:'incomes',transferencia:'transfers'};
const copy=x=>structuredClone(x),own=(o,k)=>Object.hasOwn(o||{},k),text=x=>typeof x==='string'&&x.length>0;
const fail=code=>{throw Object.assign(Error(code),{code})};
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const month=v=>typeof v==='string'&&/^\d{4}-\d{2}$/.test(v)&&date(v+'-01');
const type=v=>TYPES[v]?v:ALIASES[v];
const stable=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v??null);
function state(o,k){return !own(o,k)?'ABSENT':o[k]===null?'NULL':o[k]===undefined?'UNKNOWN':'PRESENT'}
function dateFormat(v){if(v===null)return 'NULL';if(v===undefined)return 'ABSENT';if(date(v))return 'CALENDAR';if(typeof v!=='string')return 'INVALID';if(/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(v))return /(?:Z|[+-]\d\d:\d\d)$/.test(v)?'INSTANT_WITH_OFFSET':'LOCAL_TIMESTAMP';return 'UNMAPPED'}
function key(profile,t){if(!text(profile)||!type(t.type)||!text(t.id)||!month(t.occurrenceMonth)||own(t,'splitId')&&t.splitId!==null&&!text(t.splitId))fail('IDENTITY_UNCONFIRMED');return JSON.stringify([profile,type(t.type),t.id,t.occurrenceMonth,t.splitId??null])}
function remoteKey(t){const m=t.minhasFinancas;if(!m)return null;try{return key(m.profileId,{type:Object.keys(TYPES).find(k=>TYPES[k]===t.kind),id:m.remoteId,occurrenceMonth:m.occurrenceMonth,splitId:m.splitId??null})}catch{return null}}
function unwrap(payload){
 let p=payload;if(p?.jsonrpc){if(p.error)fail('JSON_RPC_ERROR');p=p.result}
 if(!p||typeof p!=='object'||Array.isArray(p))fail('ENVELOPE_INVALID');
 const structured=p.structuredContent;let textual;
 if(Array.isArray(p.content))for(const c of p.content)if(c.type==='text'){let parsed;try{parsed=JSON.parse(c.text)}catch{continue}if(textual&&stable(parsed)!==stable(textual))fail('CONTENT_CONTRADICTORY');textual=parsed}
 if(structured&&textual&&stable(structured)!==stable(textual))fail('CONTENT_CONTRADICTORY');
 if(p.isError===true){const code=(structured||textual)?.error?.code;fail(code==='PROFILE_LOCKED'?'PROFILE_LOCKED':'TOOL_ERROR')}
 p=structured||textual||p;if(p.success===false||p.error)fail('BUSINESS_ERROR');if(p.result){p=p.result;if(p.success===false||p.error)fail('BUSINESS_ERROR')}
 return p;
}
function minor(value,scale){
 if(typeof value!=='number'||!Number.isFinite(value)||!Number.isInteger(scale)||scale<0||scale>6)return null;
 // No rounding. Exponents are deliberately unsupported until explicitly mapped.
 const m=String(value).match(/^(-?)(\d+)(?:\.(\d+))?$/);if(!m||(m[3]||'').length>scale)return null;
 const n=BigInt((m[1]||'')+m[2]+(m[3]||'').padEnd(scale,'0'));return n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):null;
}
function money(t){
 const p=t.monetaryProjection,s=t.monetaryStatus?.presentationAmount??p?.monetaryStatus?.presentationAmount;
 // This recognized field layout is intentionally narrow. Unknown provider shapes
 // stay conflicts, rather than being relabeled as confirmed by a packet flag.
 if(!p||p.baseCurrency!=='BRL'||p.baseScale!==2||p.complete!==true||p.hasEstimates!==false||!['confirmed','definitive'].includes(s))fail('MONEY_NOT_DEFINITIVE');
 const n=minor(t.presentationAmount,p.baseScale),f=p.finalMinor;
 if(n===null||!(typeof f==='string'&&/^-?\d+$/.test(f)||Number.isSafeInteger(f))||BigInt(f)!==BigInt(n))fail('MONEY_UNCONFIRMED');
 if(p.native!=null&&(!text(p.native.currency)||!Number.isInteger(p.native.scale)||p.native.scale<0||p.native.scale>6||!(typeof p.native.minor==='string'&&/^-?\d+$/.test(p.native.minor)||Number.isSafeInteger(p.native.minor))))fail('NATIVE_MONEY_INVALID');
 return n/100;
}
function recurrence(t,kind){const r=t.recurrence,table=kind==='expenses'?{N:'Avulsa',F:'Fixa',M:'Parcelada'}:{N:'Avulsa',M:'Fixa',P:'Parcelada'};if(r==null)return '';if(!own(table,r))fail('RECURRENCE_UNKNOWN');return table[r]}
function accountId(a){return text(a?.id)?a.id:null}
function collect(packet){
 if(packet?.schema!==SCHEMA||!text(packet.profileId)||!Array.isArray(packet.queries)||!Array.isArray(packet.details))fail('OBSERVATION_CAPTURE_REQUIRED');
 const rows=[],warnings=[],details=new Map(),detailContexts=new Map();
 for(const q of packet.queries){
  if(!['search_transactions','run_report'].includes(q.tool)||!Array.isArray(q.pages)||!q.pages.length)fail('QUERY_INVALID');
  let offset=0,previousCount=null,finished=false;const request=q.request;
  if(request?.profileId!==packet.profileId||!['due','vencimento'].includes(request.dateReference)||!date(request.startDate)||!date(request.endDate)||request.endDate<request.startDate||!Number.isInteger(request.limit)||request.limit<1||request.limit>(q.tool==='search_transactions'?50:100))fail('QUERY_FILTER_INVALID');
  const months=(Number(request.endDate.slice(0,4))-Number(request.startDate.slice(0,4)))*12+Number(request.endDate.slice(5,7))-Number(request.startDate.slice(5,7))+1;
  if(q.tool==='run_report'&&months>24)fail('REPORT_LIMIT');let observed=0;
  for(const page of q.pages){
   if(finished)fail('PAGE_AFTER_END');if(page.request?.offset!==offset||stable({...page.request,offset:0})!==stable({...request,offset:0}))fail('PAGE_FILTER_OR_CURSOR_CHANGED');
   const r=unwrap(page.payload),d=r.data||r,items=d.items||d.transactions;if(!Array.isArray(items)||items.length>request.limit)fail('PAGE_ROWS_INVALID');observed+=items.length;if(q.tool==='run_report'&&observed>100000)fail('REPORT_LIMIT');
   const qs=r.querySummary||d.querySummary,f=d.filters||r.filters;
   for(const meta of [qs,f])if(meta){if(meta.dateReference!=null&&!['due','vencimento'].includes(meta.dateReference))fail('DATE_REFERENCE_MISMATCH');for(const field of ['startDate','endDate'])if(meta[field]!=null&&meta[field]!==request[field])fail('PERIOD_MISMATCH')}
   if(r.metadata?.profileId!=null&&r.metadata.profileId!==packet.profileId)fail('PROFILE_MISMATCH');
   for(const item of items)rows.push({item,request,tool:q.tool});
   const p=d.pagination||r.pagination;
   if(!p){warnings.push('PAGINATION_NOT_REPORTED');finished=true;continue}
   if(own(p,'offset')&&p.offset!==offset||own(p,'limit')&&p.limit!==request.limit||own(p,'hasMore')&&typeof p.hasMore!=='boolean'||own(p,'totalCount')&&(!Number.isSafeInteger(p.totalCount)||p.totalCount<0))fail('PAGINATION_CONTRADICTORY');
   if(previousCount!==null&&p.totalCount!=null&&p.totalCount!==previousCount)warnings.push('SOURCE_CHANGED_DURING_PAGING');previousCount=p.totalCount??previousCount;
   if(p.hasMore===true){if(!Number.isSafeInteger(p.nextOffset)||p.nextOffset<=offset)fail('PAGINATION_CONTRADICTORY');if(p.nextOffset!==offset+items.length)warnings.push('PAGE_GAP_NOT_COVERAGE');offset=p.nextOffset}
   else if(p.hasMore===false){if(p.nextOffset!=null)fail('PAGINATION_CONTRADICTORY');finished=true}
   else {warnings.push('PAGINATION_PARTIAL');finished=true}
  }
  if(!finished)warnings.push('QUERY_PARTIAL');
 }
 for(const entry of packet.details){if(entry.tool!=='get_transaction_details')fail('DETAIL_TOOL_INVALID');const r=unwrap(entry.payload),d=r.data||r,t=d.transaction,req=entry.request;
  if(!t||req?.profileId!==packet.profileId||!text(req.transactionId)||!month(req.month)||!type(req.type)||t.id!==req.transactionId||type(d.type)!==type(req.type)||d.month!==req.month||d.profile?.id!==packet.profileId||t.profileId!==packet.profileId)fail('DETAIL_IDENTITY_MISMATCH');
  const k=key(packet.profileId,{type:d.type,id:t.id,occurrenceMonth:d.month,splitId:t.splitId??null});if(details.has(k)&&stable(details.get(k))!==stable(t))fail('DETAIL_CONTRADICTORY');details.set(k,t);detailContexts.set(k,{data:Object.fromEntries(Object.entries(d).filter(([field])=>field!=='transaction')),metadata:r.metadata??null});
 }
 return {rows,details,detailContexts,warnings:[...new Set(warnings)]};
}
function fingerprint(t){return stable(Object.fromEntries(Object.entries(t).filter(([k])=>!['minhasFinancas','sourceFields'].includes(k))))}
function compare(base,packet,{window,accountLinks=[],protectedRecords=[],isProtected=()=>false}={}){
 if(!date(window?.from)||!date(window?.to)||window.from<CUTOFF||window.to<window.from)fail('WINDOW_INVALID');const captured=collect(packet),profile=packet.profileId,rows=copy(base),conflicts=[],notObserved=[],changes={added:0,updated:0,unchanged:0,protected:0,linked:0},byRemote=new Map(),seen=new Map(),bad=new Set(),observed=new Set(),proposals=[];
 const add=(m,k,v)=>{if(!m.has(k))m.set(k,[]);m.get(k).push(v)};base.forEach((t,i)=>{const k=remoteKey(t);if(k)add(byRemote,k,i)});
 // A repeated account link is one relationship, not one entry per occurrence.
 const links=new Map(),link=(id,name)=>{if(!links.has(id))links.set(id,new Set());links.get(id).add(name)};for(const l of accountLinks){if(l.profileId!==profile||!text(l.remoteId)||!text(l.localName))fail('ACCOUNT_LINK_INVALID');link(l.remoteId,l.localName)}
 for(const old of base){const m=old.minhasFinancas;if(m?.profileId!==profile)continue;for(const [id,name]of [[m.accountId,old.account],[m.destinationAccountId,old.destination]])if(text(id)&&text(name))link(id,name)}
 const localAccount=id=>{const names=[...new Set(links.get(id)||[])];if(!id||names.length!==1)fail('ACCOUNT_LINK_UNCONFIRMED');return names[0]};
 for(const record of captured.rows){let k;try{k=key(profile,record.item)}catch(e){conflicts.push({code:e.code,reason:e.code,evidence:copy(record.item)});continue}observed.add(k);if(seen.has(k)){if(stable(seen.get(k).item)!==stable(record.item)){bad.add(k);conflicts.push({code:'OBSERVATION_CHANGED',reason:'OBSERVATION_CHANGED',evidence:copy(record.item)})}else captured.warnings.push('DUPLICATE_OBSERVATION');}else seen.set(k,record)}
 // Build potential-match index once. A partial MCP observation never proves that
 // a visually identical Excel occurrence is unique, so linking is review-only.
 const existingIds=new Set([...base,...protectedRecords].map(t=>t.id)),protectedKeys=new Set(protectedRecords.map(remoteKey).filter(Boolean));
 const potential=new Map();for(const t of [...base,...protectedRecords])add(potential,JSON.stringify([t.kind,t.dueDate,t.account,t.destination||'']),t);
 for(const [k,{item,request}] of seen){if(bad.has(k))continue;const indices=byRemote.get(k)||[],old=indices.length===1?base[indices[0]]:null;try{
   if(indices.length>1)fail('REMOTE_IDENTITY_AMBIGUOUS');if(protectedKeys.has(k))fail('LOCAL_RECORD_PROTECTED');
   if(old&&(!date(old.dueDate)||old.dueDate<window.from||old.dueDate>window.to))fail('LOCAL_DUE_OUTSIDE_WINDOW');
   if(old&&(isProtected(old)||old.minhasFinancas?.observationVersion&&fingerprint(old)!==old.minhasFinancas.observationVersion)){changes.protected++;fail('LOCAL_RECORD_PROTECTED')}
   const d=captured.details.get(k);if(!d)fail('DETAIL_REQUIRED');if(isProtected(d)||['loanId','investmentId','constructionId','fgtsId','payrollId','isProjection','isFinancing','recurringTemplate'].some(field=>own(d,field)&&d[field]!=null&&d[field]!==false))fail('REMOTE_PROTECTED_SOURCE');if(d.card!=null||item.card!=null)fail('CARD_LINK_UNCONFIRMED');const kind=type(item.type),due=d.dueDate;if(type(request.type)&&type(request.type)!==kind)fail('TYPE_FILTER_MISMATCH');
   if(!date(due))fail('DUE_DATE_UNCONFIRMED');if(own(item,'dueDate')&&item.dueDate!==due)fail('DUE_DATE_MISMATCH');
   if(due<CUTOFF||due<window.from||due>window.to||due<request.startDate||due>request.endDate)fail('DUE_DATE_OUTSIDE_WINDOW');
   const amount=money(d);if(item.presentationAmount!=null&&item.presentationAmount!==d.presentationAmount)fail('PRESENTATION_AMOUNT_MISMATCH');
   if(typeof d.completed!=='boolean')fail('COMPLETION_UNCONFIRMED');if(!text(item.description))fail('DESCRIPTION_MISSING');
   const origin=kind==='transfers'?d.originAccount:d.account,destination=kind==='transfers'?d.destinationAccount:null,account=localAccount(accountId(origin)),dest=kind==='transfers'?localAccount(accountId(destination)):'';
   for(const [compact,detail]of [[item.account,d.account],[item.originAccount,d.originAccount],[item.destinationAccount,d.destinationAccount]])if(accountId(compact)&&accountId(compact)!==accountId(detail))fail('ACCOUNT_ID_MISMATCH');
   if(kind==='transfers'&&(accountId(origin)===accountId(destination)||account===dest))fail('TRANSFER_ACCOUNTS_INVALID');
   if(d.categorySplits?.length>1||item.categoriesCount>1)fail('SPLIT_MAPPING_REQUIRES_REVIEW');
   const rec=recurrence(d,kind);let installment=old?.installments||'';
   if(d.installmentNumber!=null||d.installmentsCount!=null){if(!Number.isInteger(d.installmentNumber)||!Number.isInteger(d.installmentsCount)||d.installmentNumber<1||d.installmentsCount<d.installmentNumber)fail('INSTALLMENT_PARTIAL');installment=d.installmentNumber+'/'+d.installmentsCount}
   if(d.originId!=null&&!text(d.originId))fail('ORIGIN_ID_INVALID');
   const payment=d.effectiveDate===null?'':date(d.effectiveDate)?d.effectiveDate:old?.paymentDate||'',posted=date(d.createdAt)?d.createdAt:old?.postedDate||'';
   const next={...copy(old||{}),id:old?.id||'mf-observation:'+k,kind:TYPES[kind],description:item.description,amount,cashAmount:amount,dueDate:due,date:payment||due,paymentDate:payment,postedDate:posted,status:d.completed?'Efetivada':'Pendente',account,destination:dest,recurrence:rec||old?.recurrence||'',installments:installment,source:old?.source||'Minhas Finanças (observação)',sourceFields:{...copy(old?.sourceFields||{}),mcpObservation:{item:copy(item),detail:copy(d),detailContext:copy(captured.detailContexts.get(k)),request:copy(request)}},minhasFinancas:{...copy(old?.minhasFinancas||{}),profileId:profile,remoteId:item.id,occurrenceMonth:item.occurrenceMonth,splitId:item.splitId??null,accountId:accountId(origin),destinationAccountId:accountId(destination),originId:d.originId??old?.minhasFinancas?.originId??null,dateReference:'due',observationOnly:true,effectiveDateState:state(d,'effectiveDate'),effectiveDateFormat:dateFormat(d.effectiveDate),createdAtFormat:dateFormat(d.createdAt),fieldStates:Object.fromEntries(['dueDate','createdAt','referenceDate','effectiveDate','amount','presentationAmount','completed','recurrence','originId','installmentNumber','installmentsCount','account','originAccount','destinationAccount','currency'].map(field=>[field,state(d,field)]))}};
   if(!old&&(potential.get(JSON.stringify([next.kind,due,account,dest]))||[]).length)fail('POSSIBLE_LOCAL_MATCH_REVIEW');
   if(!old&&existingIds.has(next.id))fail('LOCAL_ID_COLLISION');existingIds.add(next.id);
   next.minhasFinancas.observationVersion=fingerprint(next);
   const action=old?fingerprint(old)===fingerprint(next)?'unchanged':'updated':'added';changes[action]++;proposals.push({action,id:next.id});if(old)rows[indices[0]]=next;else rows.push(next);
  }catch(e){if(!e.code)throw e;conflicts.push({code:e.code,reason:e.code,evidence:{item:copy(item),detail:copy(captured.details.get(k)||null)}})}
 }
 for(const t of base){const k=remoteKey(t);if(t.minhasFinancas?.profileId===profile&&date(t.dueDate)&&t.dueDate>=window.from&&t.dueDate<=window.to&&!observed.has(k))notObserved.push({id:t.id,reason:'NOT_OBSERVED_PRESERVED'})}
 return {passed:conflicts.length===0,rows:conflicts.length?copy(base):rows,changes,conflicts,notObserved,proposals,warnings:[...new Set(captured.warnings)],snapshot:false,complete:false,replacementAllowed:false,applyAllowed:false};
}
const LIMITS={Sync:{daily:500,monthly:3000},'Sync Bank':{daily:1000,monthly:6000},'Sync Bank Pro':{daily:2000,monthly:10000}};
function callBudget({plan,dayUsed,monthUsed,calls}={}){if(!LIMITS[plan]||![dayUsed,monthUsed,calls].every(n=>Number.isSafeInteger(n)&&n>=0))return {allowed:false,code:'QUOTA_UNKNOWN'};return {allowed:dayUsed+calls<=LIMITS[plan].daily&&monthUsed+calls<=LIMITS[plan].monthly,code:'EXPLICIT_QUOTA_PLAN_ONLY',executesCalls:false}}
const api={SCHEMA,collect,compare,remoteKey,hasLocalChanges:t=>!!(t.minhasFinancas?.observationVersion&&fingerprint(t)!==t.minhasFinancas.observationVersion),recurrence,dateFormat,fieldState:state,minor,callBudget};root.MinhasFinancasObservations=api;if(typeof module==='object')module.exports=api;
})(globalThis);
