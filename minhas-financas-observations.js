/* Pure candidate comparison. Local capture envelope, NOT a provider snapshot.
 * Never fetches, persists, retries, deletes, applies, or derives missing fields. */
(function(root){'use strict';
const SCHEMA='minhas-financas-observations-v1',CUTOFF='2026-10-01';
const TYPES={expenses:'Despesa',incomes:'Receita',transfers:'Transferência'},ALIASES={transfer:'transfers',income:'incomes',expense:'expenses',despesa:'expenses',receita:'incomes',transferencia:'transfers'};
const copy=x=>structuredClone(x),own=(o,k)=>Object.hasOwn(o||{},k),text=x=>typeof x==='string'&&x.length>0;
const fail=code=>{throw Object.assign(Error(code),{code})};
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const month=v=>typeof v==='string'&&/^\d{4}-\d{2}$/.test(v)&&date(v+'-01');
const type=v=>typeof v==='string'?(own(TYPES,v)?v:own(ALIASES,v)?ALIASES[v]:undefined):undefined;
const stable=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v??null);
function state(o,k){return !own(o,k)?'ABSENT':o[k]===null?'NULL':o[k]===undefined?'UNKNOWN':'PRESENT'}
function dateFormat(v){if(v===null)return 'NULL';if(v===undefined)return 'ABSENT';if(date(v))return 'CALENDAR';if(legacyLocal(v))return v.length===19?'LEGACY_LOCAL_SECOND':'LEGACY_LOCAL_MINUTE';if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2} /.test(v))return 'INVALID_LOCAL_DATETIME';if(typeof v!=='string')return 'INVALID';if(/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(v))return /(?:Z|[+-]\d\d:\d\d)$/.test(v)?'INSTANT_WITH_OFFSET':'LOCAL_TIMESTAMP';return 'UNMAPPED'}
function key(profile,t){if(!text(profile)||!type(t.type)||!text(t.id)||!month(t.occurrenceMonth)||own(t,'splitId')&&t.splitId!==null&&!text(t.splitId))fail('IDENTITY_UNCONFIRMED');return JSON.stringify([profile,type(t.type),t.id,t.occurrenceMonth,t.splitId??null])}
function remoteKey(t){const m=t.minhasFinancas;if(!m)return null;try{return key(m.profileId,{type:Object.keys(TYPES).find(k=>TYPES[k]===t.kind),id:m.remoteId,occurrenceMonth:m.occurrenceMonth,splitId:m.splitId??null})}catch{return null}}
function unwrap(payload,context=null){
 let p=payload;if(p?.jsonrpc){if(p.error)fail('JSON_RPC_ERROR');p=p.result}
 if(!p||typeof p!=='object'||Array.isArray(p))fail('ENVELOPE_INVALID');
 const structured=p.structuredContent;let textual;
 if(Array.isArray(p.content))for(const c of p.content)if(c.type==='text'){let parsed;try{parsed=JSON.parse(c.text)}catch{continue}if(textual&&stable(parsed)!==stable(textual))fail('CONTENT_CONTRADICTORY');textual=parsed}
 if(structured&&textual&&stable(structured)!==stable(textual))fail('CONTENT_CONTRADICTORY');
 if(p.isError===true){const code=(structured||textual)?.error?.code;fail(code==='PROFILE_LOCKED'?'PROFILE_LOCKED':'TOOL_ERROR')}
 p=structured||textual||p;if(context)context.metadata=p.metadata??null;if(p.success===false||p.error)fail('BUSINESS_ERROR');if(p.result){p=p.result;if(p.success===false||p.error)fail('BUSINESS_ERROR')}
 return p;
}
function minor(value,scale){
 if(typeof value!=='number'||!Number.isFinite(value)||!Number.isInteger(scale)||scale<0||scale>6)return null;
 // No rounding. Exponents are deliberately unsupported until explicitly mapped.
 const m=String(value).match(/^(-?)(\d+)(?:\.(\d+))?$/);if(!m||(m[3]||'').length>scale)return null;
 const n=BigInt((m[1]||'')+m[2]+(m[3]||'').padEnd(scale,'0'));return n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):null;
}
function money(t,context=null,request=null){
 if(own(t.monetaryProjection,'equivalentMinor')){const evidence=projectionEvidence(t,context,request);if(!evidence.proposalAllowed)fail(evidence.code);return Number(integerMinor(t.monetaryProjection.equivalentMinor))/100}

 const p=t.monetaryProjection,s=t.monetaryStatus?.presentationAmount??p?.monetaryStatus?.presentationAmount;
 // This recognized field layout is intentionally narrow. Unknown provider shapes
 // stay conflicts, rather than being relabeled as confirmed by a packet flag.
 if(!p||p.baseCurrency!=='BRL'||p.baseScale!==2||p.complete!==true||p.hasEstimates!==false||!['confirmed','definitive'].includes(s))fail('MONEY_NOT_DEFINITIVE');
 const n=minor(t.presentationAmount,p.baseScale),f=p.finalMinor;
 if(n===null||!(typeof f==='string'&&/^-?\d+$/.test(f)||Number.isSafeInteger(f))||BigInt(f)!==BigInt(n))fail('MONEY_UNCONFIRMED');
 if(p.native!=null&&(!text(p.native.currency)||!Number.isInteger(p.native.scale)||p.native.scale<0||p.native.scale>6||!(typeof p.native.minor==='string'&&/^-?\d+$/.test(p.native.minor)||Number.isSafeInteger(p.native.minor))))fail('NATIVE_MONEY_INVALID');
 return n/100;
}
// Observed local legacy spellings: minutes or seconds. No timezone conversion.
function legacyLocal(v){const m=typeof v==='string'&&v.match(/^(\d{4}-\d{2}-\d{2}) ([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/);return m&&date(m[1])?m[1]:null}
function calendarDue(v){return date(v)?v:legacyLocal(v)}
const integerMinor=v=>Number.isSafeInteger(v)?BigInt(v):typeof v==='string'&&/^-?\d+$/.test(v)?BigInt(v):null;
const valueType=v=>v===null?'null':Array.isArray(v)?'array':typeof v==='number'?Number.isInteger(v)?'integer':'number':typeof v;
function identity(d,req,profile,metadata=null){
 const fields=[['data.type',d?.type,v=>!!type(v),v=>type(v)===type(req?.type)],['data.month',d?.month,month,v=>v===req?.month],['data.profile.id',d?.profile?.id,text,v=>v===profile],['data.transaction.id',d?.transaction?.id,text,v=>v===req?.transactionId],['data.transaction.profileId',d?.transaction?.profileId,text,v=>v===profile]];
 const requestValid=req?.profileId===profile&&text(profile)&&text(req?.transactionId)&&month(req?.month)&&!!type(req?.type);
 const checked=fields.map(([field,value,valid,same])=>({field,state:value===undefined?'ABSENT':value===null?'NULL':!valid(value)?'UNMAPPED':same(value)?'MATCH':'DIVERGENT'}));
 // Optional alternate paths are never required, but a known contradictory echo blocks.
 const alternatives=[[d?.profileId,profile,text],[d?.transactionId,req?.transactionId,text],[d?.transaction?.type,req?.type,v=>!!type(v),'type'],[d?.transaction?.month,req?.month,month],[d?.transaction?.occurrenceMonth,req?.month,month],[metadata?.profileId,profile,text]];
 const optionalConflict=alternatives.some(([v,expected,valid,kind])=>v!=null&&valid(v)&&(kind==='type'?type(v)!==type(expected):v!==expected));
 const mismatch=!requestValid||optionalConflict||checked.some(f=>f.state==='DIVERGENT');
 return {code:mismatch?'DETAIL_IDENTITY_MISMATCH':checked.every(f=>f.state==='MATCH')?'DETAIL_IDENTITY_CONFIRMED':'DETAIL_IDENTITY_PARTIAL',fields:checked};
}
function coverageContexts(context){
 const result=[],seen=new WeakSet();
 for(const [path,value] of [['data.monetaryCoverage',context?.data?.monetaryCoverage],['result.metadata.monetaryCoverage',context?.metadata?.monetaryCoverage],['envelope.metadata.monetaryCoverage',context?.envelopeMetadata?.monetaryCoverage]]){
  if(value&&typeof value==='object'){if(seen.has(value))continue;seen.add(value)}
  if(Array.isArray(value)){value.forEach((entry,i)=>{if(entry&&typeof entry==='object'&&!Array.isArray(entry))result.push([path+'['+i+']',entry])})}
  else if(value&&typeof value==='object')result.push([path,value]);
 }
 return result;
}
function coverageEvidence(context){return coverageContexts(context).map(([path,c])=>({path,complete:state(c,'complete'),hasEstimates:state(c,'hasEstimates'),finalMinor:state(c,'finalMinor'),pendingNative:state(c,'pendingNative'),kindState:state(c,'kind'),kindRecognized:c.kind==='detail.transaction',flagsConsistent:c.complete===true&&c.hasEstimates===false&&integerMinor(c.finalMinor)!==null,definitivenessVerified:false,scope:'NOT_ASSUMED_INDIVIDUAL'}))}
function projectionEvidence(t,context,req){
 const p=t?.monetaryProjection;
 if(!p||typeof p!=='object'||Array.isArray(p))return {format:'MISSING',accepted:false,proposalAllowed:false,code:'MONEY_UNCONFIRMED',coverage:coverageEvidence(context)};
 const native=p.native,baseKnown=/^[A-Z]{3}$/.test(p.baseCurrency||'')&&Number.isInteger(p.baseScale)&&p.baseScale>=0&&p.baseScale<=6;
 const nativeKnown=!!native&&text(native.currency)&&Number.isInteger(native.scale)&&native.scale>=0&&native.scale<=6&&integerMinor(native.minor)!==null;
 if(!own(p,'equivalentMinor'))return {format:'LOCAL_REVIEWED_LEGACY',accepted:baseKnown&&nativeKnown,proposalAllowed:false,code:'LEGACY_VALIDATOR_REQUIRED',coverage:coverageEvidence(context)};
 const equivalent=typeof p.equivalentMinor==='string'?integerMinor(p.equivalentMinor):null;
 const representation=baseKnown&&equivalent!==null&&equivalent<=BigInt(Number.MAX_SAFE_INTEGER)&&equivalent>=BigInt(Number.MIN_SAFE_INTEGER)&&minor(Number(equivalent)/(10**p.baseScale),p.baseScale)===Number(equivalent);
 // The canonical equivalent belongs to this exact transaction, not an aggregate.
 // presentationAmount/amount/fullAmount have separate semantics; never substitute them.
 const binding=identity({...context?.data,transaction:t},req,req?.profileId,context?.metadata).code==='DETAIL_IDENTITY_CONFIRMED';
 const statusKnown=p.status==='confirmed'&&own(p,'pendingReason')&&p.pendingReason===null;
 const supplemental=t.monetaryStatus?.presentationAmount;
 const statusCompatible=supplemental==null||supplemental==='confirmed';
 const individual=coverageContexts(context).filter(([,c])=>c.kind==='detail.transaction');
 const coverageValid=individual.every(([,c])=>c.complete===true&&c.hasEstimates===false&&Array.isArray(c.pendingNative)&&c.pendingNative.length===0&&integerMinor(c.finalMinor)===equivalent&&(!own(c,'baseCurrency')||c.baseCurrency===p.baseCurrency)&&(!own(c,'baseScale')||c.baseScale===p.baseScale));
 const projectionFlags=(!own(p,'complete')||p.complete===true)&&(!own(p,'hasEstimates')||p.hasEstimates===false)&&(!own(p,'pendingNative')||Array.isArray(p.pendingNative)&&!p.pendingNative.length)&&(!own(p,'finalMinor')||integerMinor(p.finalMinor)===equivalent);
 const code=!representation?'PROJECTION_VALUE_UNCONFIRMED':!binding?'MONETARY_SCOPE_UNCONFIRMED':!statusKnown||!statusCompatible||!projectionFlags?'PROJECTION_STATUS_UNCONFIRMED':!coverageValid?'MONETARY_COVERAGE_CONTRADICTORY':p.baseCurrency!=='BRL'||p.baseScale!==2?'BASE_CURRENCY_UNSUPPORTED':'MONEY_CONFIRMED_INDIVIDUAL';
 return {format:'OCCURRENCE_EQUIVALENT_MINOR',accepted:representation,proposalAllowed:code==='MONEY_CONFIRMED_INDIVIDUAL',code,coverage:coverageEvidence(context),coverageSummed:false};
}
const DETAIL_FIELDS=['type','month','profile.id','transaction.id','transaction.profileId','transaction.dueDate','transaction.createdAt','transaction.referenceDate','transaction.effectiveDate','transaction.completed','transaction.includedInTotals','transaction.monthlySavings','transaction.recurrence','transaction.installmentNumber','transaction.installmentsCount','transaction.account.id','transaction.card.id','transaction.card.name','transaction.card.description','currency','transaction.currency','transaction.originId','transaction.splitId','transaction.amount','transaction.fullAmount','transaction.presentationAmount','transaction.monetaryStatus','transaction.monetaryProjection.native','transaction.monetaryProjection.native.minor','transaction.monetaryProjection.native.currency','transaction.monetaryProjection.native.scale','transaction.monetaryProjection.baseCurrency','transaction.monetaryProjection.baseScale','transaction.monetaryProjection.status','transaction.monetaryProjection.equivalentMinor','transaction.monetaryProjection.pendingReason','transaction.monetaryProjection.snapshotId','monetaryCoverage','monetaryCoverage.kind','monetaryCoverage.complete','monetaryCoverage.hasEstimates','monetaryCoverage.finalMinor','monetaryCoverage.pendingNative'];
function at(o,path){for(const k of path.split('.')){if(!o||typeof o!=='object'||!own(o,k))return {presence:'ABSENT'};o=o[k]}return {presence:o===null?'NULL':o===undefined?'UNKNOWN':'PRESENT',value:o}}
const linkNames=(links,profile,id)=>new Set(links.filter(l=>l.profileId===profile&&l.remoteId===id&&text(l.localName)).map(l=>l.localName));
function linkEvidence(links,profile,id,kind){const n=linkNames(links,profile,id).size;return [n===1,kind+(n===1?'_LINK_CONFIRMED':n>1?'_LINK_AMBIGUOUS':'_LINK_UNCONFIRMED')]}
function inspectDetailsOnly(packet,{accountLinks=[],cardLinks=[]}={}){
 if(packet?.schema!==SCHEMA||!text(packet.profileId)||!Array.isArray(packet.queries)||packet.queries.length||!Array.isArray(packet.details))fail('DETAILS_ONLY_SCOPE_INVALID');
 const entries=[];
 for(let index=0;index<packet.details.length;index++){
  const entry=packet.details[index];try{
   if(entry.tool!=='get_transaction_details')fail('DETAIL_TOOL_INVALID');const envelope={},r=unwrap(entry.payload,envelope),d=r.data||r,t=d.transaction||{},req=entry.request,context={data:d,metadata:r.metadata,envelopeMetadata:envelope.metadata};
   const ident=identity(d,req,packet.profileId,r.metadata),money=projectionEvidence(t,context,req),accepted=[],blocked=[];
   const add=(field,ok,code)=>{(ok?accepted:blocked).push({field,code})};
   for(const f of ident.fields)add(f.field,f.state==='MATCH',f.state);
   add('request.identity',ident.code==='DETAIL_IDENTITY_CONFIRMED',ident.code);
   add('data.transaction.dueDate',!!calendarDue(t.dueDate),calendarDue(t.dueDate)?'DUE_CALENDAR_RECOGNIZED':'DUE_DATE_UNCONFIRMED');
   for(const field of ['createdAt','referenceDate','effectiveDate'])add('data.transaction.'+field,true,own(t,field)?t[field]===null?'NULL_PRESERVED':'ORIGINAL_PRESERVED':'ABSENT');
   add('data.transaction.completed',typeof t.completed==='boolean','BOOLEAN_REQUIRED');
   let rec=false;try{rec=text(t.recurrence)&&!!recurrence(t,type(d.type))}catch{}add('data.transaction.recurrence',rec,rec?'RECURRENCE_RECOGNIZED':'RECURRENCE_UNKNOWN');
   add('data.transaction.installments',Number.isInteger(t.installmentNumber)&&Number.isInteger(t.installmentsCount)&&t.installmentNumber>=1&&t.installmentsCount>=t.installmentNumber,'INSTALLMENT_PAIR_REQUIRED');
   add('data.transaction.account.id',!!accountId(t.account),'OPAQUE_ACCOUNT_ID_REQUIRED');
   add('data.transaction.account.localLink',...linkEvidence(accountLinks,packet.profileId,accountId(t.account),'ACCOUNT'));
   if(t.card!=null){add('data.transaction.card.id',!!accountId(t.card),'OPAQUE_CARD_ID_REQUIRED');add('data.transaction.card.label',text(t.card.name)||text(t.card.description),'CARD_LABEL_RECOGNIZED');add('data.transaction.card.localLink',...linkEvidence(cardLinks,packet.profileId,accountId(t.card),'CARD'))}
   add('data.transaction.monetaryProjection',money.accepted,money.accepted?'REPRESENTATION_RECOGNIZED':money.code);
   add('data.transaction.monetaryProjection.individualProof',money.proposalAllowed,money.code);
   const fields=DETAIL_FIELDS.map(path=>{const v=at(d,path);return {field:'data.'+path,presence:v.presence,type:v.presence==='ABSENT'?'unknown':valueType(v.value),...(/(?:dueDate|createdAt|referenceDate|effectiveDate)$/.test(path)?{format:dateFormat(v.value)}:{})}});
   const flags=[];for(const [path,o]of [['data',d],['result.metadata',r.metadata],['envelope.metadata',envelope.metadata],['result',r]])for(const field of ['requestUpdateOpenFinance','bankRefreshMayBeRequested'])if(own(o,field))flags.push({field:path+'.'+field,state:o[field]===false?'FALSE_CONFIRMED':o[field]===true?'TRUE_CONTRADICTS':'UNMAPPED'});
   const noRefresh=flags.some(f=>f.state==='TRUE_CONTRADICTS')?'CONTRADICTORY':req?.requestUpdateOpenFinance===false&&flags.some(f=>f.field.endsWith('requestUpdateOpenFinance')&&f.state==='FALSE_CONFIRMED')&&flags.some(f=>f.field.endsWith('bankRefreshMayBeRequested')&&f.state==='FALSE_CONFIRMED')?'CONFIRMED':'NOT_FULLY_REPORTED';
   entries.push({index,occurrenceMonth:month(req?.month)?req.month:null,identity:ident.code,fields,accepted,blocked,money,noRefresh,flags,structurallyValid:ident.code==='DETAIL_IDENTITY_CONFIRMED'&&noRefresh!=='CONTRADICTORY'});
  }catch(e){if(!e.code)throw e;entries.push({index,structurallyValid:false,accepted:[],blocked:[{field:'response',code:e.code}]})}
 }
 return {schema:'mcp-details-mapping-report-v1',detailsOnly:true,passed:entries.length>0&&entries.every(e=>e.structurallyValid),entries,snapshot:false,complete:false,proposalAllowed:false,applyAllowed:false,replacementAllowed:false,coverageEvidence:'NO_SEARCH_PERFORMED'};
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
 for(const entry of packet.details){if(entry.tool!=='get_transaction_details')fail('DETAIL_TOOL_INVALID');const envelope={},r=unwrap(entry.payload,envelope),d=r.data||r,t=d.transaction,req=entry.request;
  if(identity(d,req,packet.profileId,r.metadata).code!=='DETAIL_IDENTITY_CONFIRMED')fail('DETAIL_IDENTITY_MISMATCH');
  const k=key(packet.profileId,{type:d.type,id:t.id,occurrenceMonth:d.month,splitId:t.splitId??null});if(details.has(k)&&stable(details.get(k))!==stable(t))fail('DETAIL_CONTRADICTORY');details.set(k,t);detailContexts.set(k,{data:Object.fromEntries(Object.entries(d).filter(([field])=>field!=='transaction')),metadata:r.metadata??null,envelopeMetadata:envelope.metadata});
 }
 return {rows,details,detailContexts,warnings:[...new Set(warnings)]};
}
function fingerprint(t){return stable(Object.fromEntries(Object.entries(t).filter(([k])=>!['minhasFinancas','sourceFields'].includes(k))))}
function compare(base,packet,{window,accountLinks=[],cardLinks=[],protectedRecords=[],isProtected=()=>false}={}){
 if(Array.isArray(packet?.queries)&&packet.queries.length===0){const report=inspectDetailsOnly(packet,{accountLinks,cardLinks});return {passed:report.passed,mappingOnly:true,mappingReport:report,rows:copy(base),changes:{added:0,updated:0,unchanged:base.length,protected:0,linked:0},conflicts:report.passed?[]:[{reason:'DETAILS_MAPPING_INVALID',code:'DETAILS_MAPPING_INVALID'}],notObserved:[],proposals:[],warnings:['DETAILS_ONLY_NO_SEARCH'],snapshot:false,complete:false,replacementAllowed:false,applyAllowed:false}}
 if(packet?.capture?.detailsOnly===true)fail('DETAILS_ONLY_SCOPE_INVALID');
 if(!date(window?.from)||!date(window?.to)||window.from<CUTOFF||window.to<window.from)fail('WINDOW_INVALID');const captured=collect(packet),profile=packet.profileId,rows=copy(base),conflicts=[],notObserved=[],changes={added:0,updated:0,unchanged:0,protected:0,linked:0},byRemote=new Map(),seen=new Map(),bad=new Set(),observed=new Set(),proposals=[];
 const add=(m,k,v)=>{if(!m.has(k))m.set(k,[]);m.get(k).push(v)};base.forEach((t,i)=>{const k=remoteKey(t);if(k)add(byRemote,k,i)});
 // A repeated account link is one relationship, not one entry per occurrence.
 const links=new Map(),link=(id,name)=>{if(!links.has(id))links.set(id,new Set());links.get(id).add(name)};for(const l of accountLinks){if(l.profileId!==profile||!text(l.remoteId)||!text(l.localName))fail('ACCOUNT_LINK_INVALID');link(l.remoteId,l.localName)}
 for(const old of base){const m=old.minhasFinancas;if(m?.profileId!==profile)continue;for(const [id,name]of [[m.accountId,old.account],[m.destinationAccountId,old.destination]])if(text(id)&&text(name))link(id,name)}
 const cards=new Map(),linkCard=(id,name)=>{if(!cards.has(id))cards.set(id,new Set());cards.get(id).add(name)};for(const l of cardLinks){if(l.profileId!==profile||!text(l.remoteId)||!text(l.localName))fail('CARD_LINK_INVALID');linkCard(l.remoteId,l.localName)}for(const old of base)if(old.minhasFinancas?.profileId===profile&&text(old.minhasFinancas.cardId)&&text(old.card))linkCard(old.minhasFinancas.cardId,old.card);
 const localAccount=id=>{const names=[...new Set(links.get(id)||[])];if(!id||names.length!==1)fail('ACCOUNT_LINK_UNCONFIRMED');return names[0]};
 for(const record of captured.rows){let k;try{k=key(profile,record.item)}catch(e){conflicts.push({code:e.code,reason:e.code,evidence:copy(record.item)});continue}observed.add(k);if(seen.has(k)){if(stable(seen.get(k).item)!==stable(record.item)){bad.add(k);conflicts.push({code:'OBSERVATION_CHANGED',reason:'OBSERVATION_CHANGED',evidence:copy(record.item)})}else captured.warnings.push('DUPLICATE_OBSERVATION');}else seen.set(k,record)}
 // Build potential-match index once. A partial MCP observation never proves that
 // a visually identical Excel occurrence is unique, so linking is review-only.
 const existingIds=new Set([...base,...protectedRecords].map(t=>t.id)),protectedKeys=new Set(protectedRecords.map(remoteKey).filter(Boolean));
 const potential=new Map();for(const t of [...base,...protectedRecords])add(potential,JSON.stringify([t.kind,t.dueDate,t.account,t.destination||'']),t);
 for(const [k,{item,request}] of seen){if(bad.has(k))continue;const indices=byRemote.get(k)||[],old=indices.length===1?base[indices[0]]:null;try{
   if(indices.length>1)fail('REMOTE_IDENTITY_AMBIGUOUS');if(protectedKeys.has(k))fail('LOCAL_RECORD_PROTECTED');
   if(old&&(!date(old.dueDate)||old.dueDate<window.from||old.dueDate>window.to))fail('LOCAL_DUE_OUTSIDE_WINDOW');
   if(old&&(isProtected(old)||old.includedInTotals===false||old.monthlySavings===true||old.minhasFinancas?.observationVersion&&fingerprint(old)!==old.minhasFinancas.observationVersion)){changes.protected++;fail('LOCAL_RECORD_PROTECTED')}
   const d=captured.details.get(k);if(!d)fail('DETAIL_REQUIRED');if(isProtected(d)||['loanId','investmentId','constructionId','fgtsId','payrollId','isProjection','isFinancing','recurringTemplate'].some(field=>own(d,field)&&d[field]!=null&&d[field]!==false))fail('REMOTE_PROTECTED_SOURCE');const kind=type(item.type),due=calendarDue(d.dueDate);if(type(request.type)&&type(request.type)!==kind)fail('TYPE_FILTER_MISMATCH');
   if(!date(due))fail('DUE_DATE_UNCONFIRMED');if(own(item,'dueDate')&&calendarDue(item.dueDate)!==due)fail('DUE_DATE_MISMATCH');
   if(due<CUTOFF||due<window.from||due>window.to||due<request.startDate||due>request.endDate)fail('DUE_DATE_OUTSIDE_WINDOW');
   for(const field of ['includedInTotals','monthlySavings'])if(own(d,field)&&typeof d[field]!=='boolean')fail('REMOTE_FINANCIAL_FLAGS_UNCONFIRMED');
   const amount=money(d,captured.detailContexts.get(k),{profileId:profile,transactionId:item.id,type:item.type,month:item.occurrenceMonth});if(item.presentationAmount!=null&&item.presentationAmount!==d.presentationAmount)fail('PRESENTATION_AMOUNT_MISMATCH');
   if(d.includedInTotals===false||d.monthlySavings===true)fail('REMOTE_FINANCIAL_FLAGS_REQUIRE_REVIEW');
   const remoteCard=d.card??item.card;let card=old?.card||'',cardId=old?.minhasFinancas?.cardId??null;if(remoteCard!=null){cardId=accountId(remoteCard);if(!cardId)fail('CARD_ID_UNCONFIRMED');if(accountId(item.card)&&accountId(item.card)!==cardId)fail('CARD_ID_MISMATCH');const names=[...(cards.get(cardId)||[])];if(names.length!==1)fail(names.length>1?'CARD_LINK_AMBIGUOUS':'CARD_LINK_UNCONFIRMED');card=names[0]}
   if(typeof d.completed!=='boolean')fail('COMPLETION_UNCONFIRMED');if(!text(item.description))fail('DESCRIPTION_MISSING');
   const origin=kind==='transfers'?d.originAccount:d.account,destination=kind==='transfers'?d.destinationAccount:null,account=localAccount(accountId(origin)),dest=kind==='transfers'?localAccount(accountId(destination)):'';
   for(const [compact,detail]of [[item.account,d.account],[item.originAccount,d.originAccount],[item.destinationAccount,d.destinationAccount]])if(accountId(compact)&&accountId(compact)!==accountId(detail))fail('ACCOUNT_ID_MISMATCH');
   if(kind==='transfers'&&(accountId(origin)===accountId(destination)||account===dest))fail('TRANSFER_ACCOUNTS_INVALID');
   if(d.categorySplits?.length>1||item.categoriesCount>1)fail('SPLIT_MAPPING_REQUIRES_REVIEW');
   const rec=recurrence(d,kind);let installment=old?.installments||'';
   if(d.installmentNumber!=null||d.installmentsCount!=null){if(!Number.isInteger(d.installmentNumber)||!Number.isInteger(d.installmentsCount)||d.installmentNumber<1||d.installmentsCount<d.installmentNumber)fail('INSTALLMENT_PARTIAL');installment=d.installmentNumber+'/'+d.installmentsCount}
   if(d.originId!=null&&!text(d.originId))fail('ORIGIN_ID_INVALID');
   const payment=d.effectiveDate===null?'':date(d.effectiveDate)?d.effectiveDate:old?.paymentDate||'',posted=date(d.createdAt)?d.createdAt:old?.postedDate||'';
   const financialFlags=Object.fromEntries(['includedInTotals','monthlySavings'].filter(f=>own(d,f)).map(f=>[f,d[f]]));
   const next={...copy(old||{}),...financialFlags,id:old?.id||'mf-observation:'+k,kind:TYPES[kind],description:item.description,card,amount,cashAmount:amount,dueDate:due,date:payment||due,paymentDate:payment,postedDate:posted,status:d.completed?'Efetivada':'Pendente',account,destination:dest,recurrence:rec||old?.recurrence||'',installments:installment,source:old?.source||'Minhas Finanças (observação)',sourceFields:{...copy(old?.sourceFields||{}),mcpObservation:{item:copy(item),detail:copy(d),detailContext:copy(captured.detailContexts.get(k)),request:copy(request)}},minhasFinancas:{...copy(old?.minhasFinancas||{}),profileId:profile,remoteId:item.id,occurrenceMonth:item.occurrenceMonth,splitId:item.splitId??null,cardId,accountId:accountId(origin),destinationAccountId:accountId(destination),originId:d.originId??old?.minhasFinancas?.originId??null,dateReference:'due',observationOnly:true,effectiveDateState:state(d,'effectiveDate'),effectiveDateFormat:dateFormat(d.effectiveDate),createdAtFormat:dateFormat(d.createdAt),fieldStates:Object.fromEntries(['dueDate','createdAt','referenceDate','effectiveDate','amount','presentationAmount','completed','includedInTotals','monthlySavings','recurrence','originId','installmentNumber','installmentsCount','account','originAccount','destinationAccount','currency'].map(field=>[field,state(d,field)]))}};
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
const api={SCHEMA,readEnvelope:unwrap,identityKey:key,normalizeType:type,collect,compare,inspectDetailsOnly,identity,calendarDue,projectionEvidence,remoteKey,hasLocalChanges:t=>!!(t.minhasFinancas?.observationVersion&&fingerprint(t)!==t.minhasFinancas.observationVersion),recurrence,dateFormat,fieldState:state,minor,callBudget};root.MinhasFinancasObservations=api;if(typeof module==='object')module.exports=api;
})(globalThis);
