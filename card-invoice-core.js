/* Independent, local, read-only invoice comparison. No application-state or transport dependency. */
(function(root){
'use strict';
const SCHEMA='card-invoice-source-v1',KINDS=['purchase','refund','credit','fee','interest','iof','adjustment','payment','unknown'];
const CONTRACTS=Object.freeze({get_credit_card_transactions:{limit:200,requestUpdateOpenFinanceSupported:false,bankRefreshGuaranteed:true},get_installment_series:{limit:200,defaultLimit:50,maxRecords:10000,requestUpdateOpenFinanceSupported:false,bankRefreshGuaranteed:true,bankAccess:false},get_credit_card_details:{requiredArguments:{requestUpdateOpenFinance:false},bankRefreshGuaranteed:true}});
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x||{},k),copy=x=>JSON.parse(JSON.stringify(x));
const text=x=>typeof x==='string'&&x.trim()?x.trim():null;
function noSecrets(value,depth=0){if(depth>60)throw Error('SOURCE_DEPTH_INVALID');if(!value||typeof value!=='object')return;for(const [k,v] of Object.entries(value)){if(/^(?:authorization|access_?token|refresh_?token|client_?secret|password|pin|recovery|recoveryUrl)$/i.test(k))throw Error('SECRET_FIELD_REJECTED');noSecrets(v,depth+1)}}
function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;const d=new Date(v+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v?v:null}
function month(v){return typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v)?v:null}
function state(o,k,test){return !own(o,k)?'ABSENT':o[k]===null?'NULL':test(o[k])?'CONFIRMED':'INVALID'}
function minor(value,format='decimal-dot'){
 if(typeof value!=='string'&&typeof value!=='number')return null;
 let s=String(value).trim();if(format==='minor')return /^-?\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;
 if(format==='decimal-comma'){if(!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(s))return null;s=s.replace(/\./g,'').replace(',','.')}else if(format!=='decimal-dot')return null;
 if(!/^-?\d+(?:\.\d{1,2})?$/.test(s))return null;const [a,b='']=s.replace('-','').split('.'),n=Number(a)*100+Number(b.padEnd(2,'0'));return Number.isSafeInteger(n)?(s.startsWith('-')?-n:n):null;
}
function remoteOccurrenceKey(profile,row){const types={expense:'expenses',expenses:'expenses',despesa:'expenses',income:'incomes',incomes:'incomes',receita:'incomes',transfer:'transfers',transfers:'transfers',transferencia:'transfers'};if(typeof row.id!=='string'||!row.id.length||!types[row.type]||!month(row.occurrenceMonth))return null;return JSON.stringify([profile,types[row.type],row.id,row.occurrenceMonth,row.splitId??null])}
function normalizedRow(raw,index,source){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('ROW_STRUCTURE_INVALID');
 const fields={};for(const k of ['purchaseDate','processingDate','dueDate'])fields[k]=state(raw,k,date);
 for(const k of ['id','sharedId','description','cardId'])fields[k]=state(raw,k,text);
 fields.amountMinor=state(raw,'amountMinor',Number.isSafeInteger);fields.invoiceMonth=state(raw,'invoiceMonth',month);
 for(const k of ['installmentNumber','installmentsCount'])fields[k]=state(raw,k,v=>Number.isSafeInteger(v)&&v>0);
 const r={...copy(raw),sourceFields:copy(raw.sourceFields??raw),index,side:source,fields,amountMinor:Number.isSafeInteger(raw.amountMinor)?raw.amountMinor:null,kind:KINDS.includes(raw.kind)?raw.kind:'unknown'};
 for(const k of ['purchaseDate','processingDate','dueDate'])r[k]=date(raw[k]);r.invoiceMonth=month(raw.invoiceMonth);
 r.cardId=text(raw.cardId);r.description=text(raw.description);r.sharedId=typeof raw.sharedId==='string'&&raw.sharedId.length?raw.sharedId:null;r.id=typeof raw.id==='string'&&raw.id.length?raw.id:null;
 r.installmentNumber=fields.installmentNumber==='CONFIRMED'?raw.installmentNumber:null;r.installmentsCount=fields.installmentsCount==='CONFIRMED'?raw.installmentsCount:null;
 r.issues=[];if(r.amountMinor===null)r.issues.push('AMOUNT_UNKNOWN');if(r.kind==='unknown')r.issues.push('KIND_UNKNOWN');
 if(r.amountMinor!==null&&(r.kind==='purchase'||['fee','interest','iof'].includes(r.kind))&&r.amountMinor<0||r.amountMinor!==null&&['refund','credit'].includes(r.kind)&&r.amountMinor>0)r.issues.push('SIGN_CONTRADICTORY');
 if(r.installmentNumber&&r.installmentsCount&&r.installmentNumber>r.installmentsCount)r.issues.push('INSTALLMENTS_INVALID');
 if(Object.values(fields).includes('INVALID'))r.issues.push('FIELD_INVALID');
 return r;
}
function source(packet,side){
 noSecrets(packet);
 if(packet?.schema!==SCHEMA||!['bank','minhas-financas'].includes(side)||packet.side!==side)throw Error('SOURCE_SCHEMA_INVALID');
 if(side==='minhas-financas'&&!text(packet.profileId))throw Error('PROFILE_REQUIRED');
 if(!text(packet.cardId)||!month(packet.invoiceMonth)||!Array.isArray(packet.rows)||packet.rows.length>100000)throw Error('SOURCE_SCOPE_INVALID');
 const rows=packet.rows.map((r,i)=>normalizedRow(r,i,side)),issues=[];
 const validMoney=/^[A-Z]{3}$/.test(packet.currency||'')&&packet.scale===2&&packet.amountSemantics==='signed-invoice-minor';
 if(!validMoney)issues.push('MONETARY_SEMANTICS_UNCONFIRMED');
 for(const r of rows){if(own(r,'currency')&&r.currency!==packet.currency)r.issues.push('ROW_CURRENCY_DIVERGENT');if(own(r,'scale')&&r.scale!==packet.scale)r.issues.push('ROW_SCALE_DIVERGENT');if(r.cardId!==packet.cardId)r.issues.push('CARD_SCOPE_UNCONFIRMED');if(r.invoiceMonth!==packet.invoiceMonth)r.issues.push(r.invoiceMonth?'INVOICE_MONTH_DIVERGENT':'INVOICE_MONTH_UNKNOWN')}
 const ids=new Map();for(const r of rows)if(r.id){const key=side==='minhas-financas'?remoteOccurrenceKey(packet.profileId,r)||r.id:r.id;if(!ids.has(key))ids.set(key,[]);ids.get(key).push(r)}for(const list of ids.values())if(list.length>1)for(const r of list)r.issues.push('DUPLICATE_ID');
 const allKnown=rows.every(r=>r.amountMinor!==null&&!r.issues.length),sum=rows.reduce((n,r)=>n+(r.amountMinor??0),0);
 const c=packet.control,controlled=validMoney&&allKnown&&Number.isSafeInteger(sum)&&c?.independent===true&&c.count===rows.length&&Number.isSafeInteger(c.totalMinor)&&c.totalMinor===sum;
 if(!controlled)issues.push('SOURCE_COVERAGE_UNCONFIRMED');
 return {...copy(packet),rows,issues,controlled,complete:false,snapshot:false,validMoney};
}
const clean=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function reconcile(bankPacket,appPacket){
 const b=source(bankPacket,'bank'),a=source(appPacket,'minhas-financas');
 if(b.cardId!==a.cardId||b.invoiceMonth!==a.invoiceMonth)throw Error('COMPARISON_SCOPE_MISMATCH');
 if(!b.validMoney||!a.validMoney||b.currency!==a.currency||b.scale!==a.scale)throw Error('CURRENCY_OR_SCALE_UNCONFIRMED');
 const results=[],usedB=new Set(),usedA=new Set();
 const entry=(code,x,y,reasons=[])=>{results.push({code,bank:x?copy(x):null,application:y?copy(y):null,reasons,reviewRequired:true});if(x)usedB.add(x.index);if(y)usedA.add(y.index)};
 const payments=(s,set,side)=>{for(const r of s.rows)if(r.kind==='payment'){entry('PAYMENT_EXCLUDED',side==='bank'?r:null,side==='bank'?null:r,['Pagamento de fatura não é compra nem estorno.']);set.add(r.index)}};payments(b,usedB,'bank');payments(a,usedA,'minhas-financas');
 // Shared identifier must be a documented, explicitly reviewed cross-source reference, not two unrelated local IDs.
 const sharedVerified=b.sharedIdentityReviewed===true&&a.sharedIdentityReviewed===true;
 function compare(x,y,probable){
  const codes=[];if(x.amountMinor!==y.amountMinor)codes.push('VALUE_DIVERGENT');
  if(x.invoiceMonth!==y.invoiceMonth||x.purchaseDate&&y.purchaseDate&&x.purchaseDate!==y.purchaseDate||x.dueDate&&y.dueDate&&x.dueDate!==y.dueDate)codes.push('DATE_OR_MONTH_DIVERGENT');
  if(x.installmentNumber!==y.installmentNumber||x.installmentsCount!==y.installmentsCount)codes.push('INSTALLMENTS_DIVERGENT');
  if(x.kind!==y.kind)codes.push('KIND_DIVERGENT');
  if(x.issues.length||y.issues.length)codes.push('FIELDS_UNCONFIRMED');
  if(probable&&codes.length)codes.push('PROBABLE_ASSOCIATION_REVIEW_REQUIRED');
  entry(codes[0]||(probable?'PROBABLE_MATCH':'MATCH'),x,y,codes.length?codes:[probable?'Critérios compostos únicos; confirmar manualmente.':'Identificador compartilhado revisado.']);
 }
 if(sharedVerified){const bm=new Map(),am=new Map();for(const [s,m,u] of [[b,bm,usedB],[a,am,usedA]])for(const r of s.rows)if(r.sharedId&&!u.has(r.index)){if(!m.has(r.sharedId))m.set(r.sharedId,[]);m.get(r.sharedId).push(r)}for(const id of new Set([...bm.keys(),...am.keys()])){const xs=bm.get(id)||[],ys=am.get(id)||[];if(xs.length===1&&ys.length===1&&!xs[0].issues.includes('DUPLICATE_ID')&&!ys[0].issues.includes('DUPLICATE_ID'))compare(xs[0],ys[0],false);else if(xs.length>1||ys.length>1){for(const x of xs)entry('AMBIGUOUS',x,null,['Identificador repetido; nenhum vínculo automático.']);for(const y of ys)entry('AMBIGUOUS',null,y,['Identificador repetido; nenhum vínculo automático.'])}}}
 const eligible=r=>!r.issues.length&&r.purchaseDate&&r.description&&r.cardId&&r.invoiceMonth&&!(sharedVerified&&r.sharedId);
 const key=r=>JSON.stringify([r.cardId,r.invoiceMonth,r.purchaseDate,clean(r.description),r.amountMinor,r.kind,r.installmentNumber,r.installmentsCount]);
 const bm=new Map(),am=new Map();for(const [s,m,u] of [[b,bm,usedB],[a,am,usedA]])for(const r of s.rows)if(!u.has(r.index)&&eligible(r)){const k=key(r);if(!m.has(k))m.set(k,[]);m.get(k).push(r)}
 for(const k of new Set([...bm.keys(),...am.keys()])){const xs=bm.get(k)||[],ys=am.get(k)||[];if(xs.length===1&&ys.length===1)compare(xs[0],ys[0],true);else if(xs.length>1||ys.length>1){for(const x of xs)entry('AMBIGUOUS',x,null,['Compras repetidas; preservar todas as ocorrências.']);for(const y of ys)entry('AMBIGUOUS',null,y,['Compras repetidas; preservar todas as ocorrências.'])}}
 // A single differing field may suggest a discrepancy, never establish a definitive identity.
 const remainingB=b.rows.filter(r=>!usedB.has(r.index)&&eligible(r)),remainingA=a.rows.filter(r=>!usedA.has(r.index)&&eligible(r));
 const plausible=(x,y)=>{if(x.cardId!==y.cardId||x.invoiceMonth!==y.invoiceMonth||clean(x.description)!==clean(y.description)||x.kind!==y.kind)return false;const differences=[x.purchaseDate!==y.purchaseDate,x.amountMinor!==y.amountMinor,x.installmentNumber!==y.installmentNumber||x.installmentsCount!==y.installmentsCount];return differences.filter(Boolean).length===1};
 const suggestionKeys=r=>{const base=[r.cardId,r.invoiceMonth,clean(r.description),r.kind],parcel=[r.installmentNumber,r.installmentsCount];return [JSON.stringify([...base,'amount',r.purchaseDate,...parcel]),JSON.stringify([...base,'date',r.amountMinor,...parcel]),JSON.stringify([...base,'parcel',r.purchaseDate,r.amountMinor])]};
 const suggestionIndex=rows=>{const index=new Map();for(const r of rows)for(const k of suggestionKeys(r)){if(!index.has(k))index.set(k,[]);index.get(k).push(r)}return index};
 const bi=suggestionIndex(remainingB),ai=suggestionIndex(remainingA),ambiguousB=new Set(),ambiguousA=new Set();
 const suggestions=(rows,index,ambiguous)=>new Map(rows.map(x=>{const lists=suggestionKeys(x).map(k=>index.get(k)||[]);if(lists.some(v=>v.length>1)){ambiguous.add(x.index);return [x.index,[]]}const found=[...new Set(lists.flat())].filter(y=>plausible(x,y));if(found.length>1)ambiguous.add(x.index);return [x.index,found]}));
 const possibleB=suggestions(remainingB,ai,ambiguousB),possibleA=suggestions(remainingA,bi,ambiguousA);
 for(const x of remainingB){const ys=possibleB.get(x.index);if(ys.length===1&&possibleA.get(ys[0].index).length===1&&!usedA.has(ys[0].index))compare(x,ys[0],true)}
 for(const [s,u,side,other] of [[b,usedB,'bank',a],[a,usedA,'application',b]])for(const r of s.rows)if(!u.has(r.index)){
  const special=['refund','credit','fee','interest','iof','adjustment'].includes(r.kind),ambiguous=(side==='bank'?ambiguousB:ambiguousA).has(r.index),code=ambiguous?'AMBIGUOUS':r.issues.length?'FIELDS_UNCONFIRMED':special?'SPECIAL_UNRECONCILED':r.installmentNumber?(side==='bank'?'INSTALLMENT_BANK_ONLY':'INSTALLMENT_APP_ONLY'):(side==='bank'?'BANK_ONLY':'APP_ONLY');
  entry(code,side==='bank'?r:null,side==='application'?r:null,[...r.issues,other.controlled?'Não localizado na fonte revisada desta fatura; conferir manualmente.':'Apenas não observado: cobertura da outra fonte não comprovada.']);
 }
 const sum=s=>{const rows=s.rows.filter(r=>r.kind!=='payment'),known=rows.every(r=>r.amountMinor!==null&&!r.issues.length);const n=rows.reduce((v,r)=>v+(r.amountMinor??0),0);return known&&Number.isSafeInteger(n)?n:null};
 const bankTotal=sum(b),appTotal=sum(a),counts={};for(const r of results)counts[r.code]=(counts[r.code]||0)+1;
 const payable=Number.isSafeInteger(b.declaredPayableMinor)?b.declaredPayableMinor:null;
 return {schema:'card-invoice-review-v1',applyAllowed:false,writeAllowed:false,syncAllowed:false,replacementAllowed:false,snapshot:false,cardId:b.cardId,invoiceMonth:b.invoiceMonth,currency:b.currency,scale:b.scale,bankMovementsMinor:bankTotal,bankPayableMinor:payable,appMovementsMinor:appTotal,differenceMinor:bankTotal===null||appTotal===null?null:bankTotal-appTotal,payableDifferenceMinor:payable===null||appTotal===null?null:payable-appTotal,counts,results,installmentIssues:results.filter(r=>r.code.includes('INSTALLMENT')||r.reasons.includes('INSTALLMENTS_DIVERGENT')),warnings:[...new Set([...b.issues,...a.issues,'MANUAL_REVIEW_REQUIRED','SINGLE_INVOICE_NOT_FUTURE_SERIES','PAYABLE_MAY_INCLUDE_PREVIOUS_BALANCE_AND_PAYMENTS'])],sources:{bank:b,application:a}};
}
// Explicit column mapping. Empty fields remain null/absent; never guessed from generic dates or monetary fields.
function fromTable(table,options){
 const {mapping={},cardId,invoiceMonth,currency,format='decimal-dot',positive='charge'}=options;
 if(!Array.isArray(table)||!table.length||!['charge','credit'].includes(positive))throw Error('TABLE_OR_SIGN_INVALID');
 const headers=table[0].map(String);if(new Set(headers).size!==headers.length)throw Error('HEADERS_AMBIGUOUS');
 if(!mapping.amountMinor||!headers.includes(mapping.amountMinor)||!mapping.kind||!headers.includes(mapping.kind))throw Error('COLUMN_MAPPING_REQUIRED');
 const allowed=['id','sharedId','description','amountMinor','purchaseDate','processingDate','dueDate','invoiceMonth','installmentNumber','installmentsCount','kind'];
 const rows=table.slice(1).filter(v=>v.some(x=>x!==''&&x!==null&&x!==undefined)).map(values=>{
  const row={cardId,invoiceMonth,sourceFields:{}};headers.forEach((h,i)=>{if(i<values.length)Object.defineProperty(row.sourceFields,h,{value:values[i]??null,enumerable:true})});
  for(const k of allowed)if(mapping[k]){const index=headers.indexOf(mapping[k]);if(index<0)throw Error('COLUMN_MAPPING_INVALID');const v=values[index];if(v===undefined)continue;if(v===null||v===''){row[k]=null;continue}if(k==='amountMinor'){const n=minor(v,format);row[k]=n===null?v:positive==='credit'?-n:n}else if(['installmentNumber','installmentsCount'].includes(k))row[k]=/^\d+$/.test(String(v))?Number(v):v;else row[k]=String(v)}
  return row;
 });return {schema:SCHEMA,side:'bank',cardId,invoiceMonth,currency,scale:2,amountSemantics:'signed-invoice-minor',control:options.control??null,declaredPayableMinor:options.declaredPayableMinor??null,closingDate:options.closingDate??null,invoiceDueDate:options.invoiceDueDate??null,rows};
}
function csv(textValue,delimiter=';'){
 if(typeof textValue!=='string'||textValue.length>10000000||![';',',','\t'].includes(delimiter))throw Error('CSV_INVALID');
 const rows=[],row=[];let value='',quoted=false,closed=false;const s=textValue.replace(/^\uFEFF/,'');
 for(let i=0;i<s.length;i++){const c=s[i];if(quoted){if(c==='"'&&s[i+1]==='"'){value+='"';i++}else if(c==='"'){quoted=false;closed=true}else value+=c;continue}
 if(c==='"'){if(value||closed)throw Error('CSV_INVALID');quoted=true}else if(c===delimiter){row.push(value);value='';closed=false}else if(c==='\n'||c==='\r'){if(c==='\r'&&s[i+1]==='\n')i++;row.push(value);rows.push(row.splice(0));value='';closed=false}else{if(closed)throw Error('CSV_INVALID');value+=c}}
 if(quoted)throw Error('CSV_INVALID');if(value||row.length||closed){row.push(value);rows.push(row)}return rows;
}
function ofx(input,options){
 if(typeof input!=='string'||input.length>10000000||/<!DOCTYPE|<!ENTITY/i.test(input)||!/<CREDITCARDMSGSRSV1\b/i.test(input)||/<BANKMSGSRSV1\b/i.test(input))throw Error('CREDIT_CARD_OFX_REQUIRED');
 const tag=(s,k)=>{const m=s.match(new RegExp('<'+k+'>([^<\\r\\n]*)','i'));return m?m[1].trim():null};
 if((input.match(/<CCSTMTRS>/gi)||[]).length!==1||(input.match(/<CCACCTFROM>/gi)||[]).length!==1||!text(options.ofxAccountId)||tag(input,'ACCTID')!==options.ofxAccountId)throw Error('OFX_CARD_IDENTITY_REVIEW_REQUIRED');
 if(tag(input,'CURDEF')!==options.currency)throw Error('OFX_CURRENCY_MISMATCH');
 const blocks=[...input.matchAll(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi)],opens=(input.match(/<STMTTRN>/gi)||[]).length;if(opens!==blocks.length)throw Error('OFX_TRUNCATED');
 const rows=blocks.map(m=>{const t=m[1],raw=tag(t,'DTPOSTED'),posting=raw&&/^\d{8}(?:\d{6}(?:\.\d+)?(?:\[[^\]]+\])?)?$/.test(raw)?date(raw.slice(0,4)+'-'+raw.slice(4,6)+'-'+raw.slice(6,8)):null;
 const type=tag(t,'TRNTYPE'),amount=minor(tag(t,'TRNAMT'));if(!['negative','positive'].includes(options.ofxChargeSign))throw Error('OFX_SIGN_REVIEW_REQUIRED');const signed=amount===null?null:options.ofxChargeSign==='negative'?-amount:amount;
 // PAYMENT is excluded only when explicitly so classified. CREDIT can be a refund OR payment: require review.
 const kinds=options.ofxKinds||{},kind=KINDS.includes(kinds[type])?kinds[type]:'unknown';
 return {id:tag(t,'FITID'),description:tag(t,'NAME')||tag(t,'MEMO'),processingDate:posting||raw,amountMinor:signed===null?tag(t,'TRNAMT'):signed,kind,cardId:options.cardId,invoiceMonth:options.invoiceMonth,sourceFields:{TRNTYPE:type,DTPOSTED:raw,TRNAMT:tag(t,'TRNAMT'),FITID:tag(t,'FITID'),MEMO:tag(t,'MEMO')}}});
 return {schema:SCHEMA,side:'bank',cardId:options.cardId,invoiceMonth:options.invoiceMonth,currency:options.currency,scale:2,amountSemantics:'signed-invoice-minor',control:options.control??null,declaredPayableMinor:options.declaredPayableMinor??null,closingDate:options.closingDate??null,invoiceDueDate:options.invoiceDueDate??null,rows};
}
// Only inspect already-captured responses. Never invoke tools or derive undocumented output paths.
function fromCapture(capture,mapping){
 noSecrets(capture);
 if(capture?.schema!=='card-invoice-capture-v1'||!Array.isArray(capture.pages)||!capture.pages.length||capture.pages.length>1000||!text(capture.profileId)||!text(capture.remoteCardId)||!text(capture.cardId)||!month(capture.invoiceMonth)||mapping?.reviewed!==true)throw Error('CAPTURE_MAPPING_REQUIRED');
 const read=(o,path)=>{if(typeof path!=='string'||!path||path.split('.').some(k=>['__proto__','prototype','constructor'].includes(k)))throw Error('MAPPING_PATH_INVALID');return path.split('.').reduce((v,k)=>v&&typeof v==='object'&&own(v,k)?v[k]:undefined,o)};
 const stable=o=>JSON.stringify(o,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 const rows=[],evidence=[],seen=new Set();let next=0,finished=false,total=null;
 for(const p of capture.pages){const req=p.request;if(req?.arguments&&Object.keys(req.arguments).some(k=>!['cardId','profileId','month','limit','offset'].includes(k)))throw Error('CAPTURE_REQUEST_INVALID');if(finished||req?.name!=='get_credit_card_transactions'||req.arguments?.cardId!==capture.remoteCardId||req.arguments?.profileId!==capture.profileId||req.arguments?.month!==capture.invoiceMonth||req.arguments?.offset!==next||!Number.isInteger(req.arguments.limit)||req.arguments.limit<1||req.arguments.limit>200)throw Error('CAPTURE_REQUEST_INVALID');
  let payload=p.response?.structuredContent;const textsPresent=p.response?.content?.filter(c=>c.type==='text')||[];if(payload&&textsPresent.length){if(textsPresent.length!==1)throw Error('CAPTURE_ENVELOPES_CONTRADICTORY');let textual;try{textual=JSON.parse(textsPresent[0].text)}catch{throw Error('CAPTURE_RESPONSE_INVALID')}if(stable(payload)!==stable(textual))throw Error('CAPTURE_ENVELOPES_CONTRADICTORY')}if(!payload){const texts=p.response?.content?.filter(c=>c.type==='text')||[];if(texts.length!==1)throw Error('CAPTURE_RESPONSE_INVALID');try{payload=JSON.parse(texts[0].text)}catch{throw Error('CAPTURE_RESPONSE_INVALID')}}
  if(p.response?.isError||p.response?.error||payload?.success===false||payload?.error)throw Error('CAPTURE_TOOL_ERROR');
  const items=read(payload,mapping.itemsPath);if(!Array.isArray(items)||items.length>req.arguments.limit)throw Error('CAPTURE_ITEMS_INVALID');
  for(const item of items){const r={sourceFields:copy(item),cardId:capture.cardId,invoiceMonth:capture.invoiceMonth};for(const [field,path] of Object.entries(mapping.fields||{})){if(field==='dueDate'&&(typeof path!=='string'||path.split('.').at(-1)!=='dueDate'))throw Error('DUE_DATE_MAPPING_UNCONFIRMED');if(['__proto__','prototype','constructor','sourceFields','cardId'].includes(field))throw Error('MAPPING_PATH_INVALID');const v=read(item,path);if(v!==undefined)r[field]=copy(v)}if(own(item,'id')&&r.id!==item.id)throw Error('CAPTURE_ID_MAPPING_DIVERGENT');for(const f of ['type','occurrenceMonth','splitId','originId'])if(own(item,f)&&own(r,f)&&stable(item[f])!==stable(r[f]))throw Error('CAPTURE_IDENTITY_MAPPING_DIVERGENT');const key=remoteOccurrenceKey(capture.profileId,{...item,id:r.id})||r.id;if(!text(r.id)||seen.has(key))throw Error('CAPTURE_ID_INVALID');seen.add(key);for(const field of ['type','occurrenceMonth','originId','splitId','installmentNumber','installmentsCount'])if(own(item,field)&&!own(r,field))r[field]=copy(item[field]);rows.push(r)}
  const pagination=mapping.paginationPath?read(payload,mapping.paginationPath):undefined;
  if(pagination!==undefined){if(!pagination||typeof pagination.hasMore!=='boolean')throw Error('PAGINATION_INVALID');if(own(pagination,'totalCount')){if(!Number.isSafeInteger(pagination.totalCount)||pagination.totalCount<rows.length||total!==null&&total!==pagination.totalCount)throw Error('PAGINATION_CONTRADICTORY');total=pagination.totalCount}if(own(pagination,'offset')&&pagination.offset!==req.arguments.offset)throw Error('PAGINATION_CONTRADICTORY');if(pagination.hasMore){if(!Number.isInteger(pagination.nextOffset)||pagination.nextOffset!==next+items.length||!items.length)throw Error('PAGINATION_INVALID');next=pagination.nextOffset}else{if(total!==null&&total!==rows.length)throw Error('PAGINATION_CONTRADICTORY');finished=true}}
  else if(capture.pages.length>1)throw Error('PAGINATION_UNCONFIRMED');
  evidence.push({request:copy(req),response:copy(p.response)});
 }
 return {schema:SCHEMA,side:'minhas-financas',profileId:capture.profileId,remoteCardId:capture.remoteCardId,cardId:capture.cardId,invoiceMonth:capture.invoiceMonth,currency:capture.currency,scale:capture.scale,amountSemantics:mapping.amountSemantics,rows,evidence,paginationObservedEnd:finished,complete:false,snapshot:false};
}
function installmentEvidence(packet){
 noSecrets(packet);
 if(packet?.tool!=='get_installment_series'||!text(packet.request?.transactionId)||!text(packet.request?.profileId)||!['despesa','receita','transferencia'].includes(packet.request.type)||!month(packet.request.month)||!Array.isArray(packet.recorded))throw Error('SERIES_EVIDENCE_INVALID');
 if(own(packet.request,'limit')&&(!Number.isSafeInteger(packet.request.limit)||packet.request.limit<1||packet.request.limit>200)||own(packet.request,'offset')&&(!Number.isSafeInteger(packet.request.offset)||packet.request.offset<0)||packet.recorded.length>(packet.request.limit??50))throw Error('SERIES_PAGE_LIMIT_INVALID');
 // This local reviewed schema contains recorded entries only, never synthesized future installments.
 if(packet.mappingReviewed!==true)throw Error('SERIES_MAPPING_REQUIRED');
 return {recorded:packet.recorded.map((r,i)=>normalizedRow(r,i,'series')),declaredCount:packet.declaredCount??null,notASchedule:true,complete:false};
}
function demo(){
 const row=(id,amount,extra={})=>({id,sharedId:id,description:'Compra fictícia '+id,amountMinor:amount,kind:'purchase',cardId:'cartao-demo',invoiceMonth:'2026-11',purchaseDate:'2026-10-10',dueDate:'2026-11-10',...extra});
 const bankRows=[row('a',12000),row('b',8000),row('bank-only',1000),row('refund',-500,{kind:'refund'}),row('payment',-20000,{kind:'payment'}),row('p',2000,{installmentNumber:2,installmentsCount:4})];
 const appRows=[row('a',12000),row('b',8500),row('app-only',1500),row('p',2000,{installmentNumber:1,installmentsCount:4})];
 const make=(side,rows)=>({schema:SCHEMA,side,profileId:side==='minhas-financas'?'perfil-demo':undefined,cardId:'cartao-demo',invoiceMonth:'2026-11',currency:'BRL',scale:2,amountSemantics:'signed-invoice-minor',sharedIdentityReviewed:true,rows,control:{independent:true,count:rows.length,totalMinor:rows.reduce((n,r)=>n+r.amountMinor,0)}});
 return {bank:make('bank',bankRows),application:make('minhas-financas',appRows)};
}
const api={SCHEMA,CONTRACTS,date,month,minor,source,reconcile,fromTable,csv,ofx,fromCapture,installmentEvidence,demo};
if(typeof module==='object'&&module.exports)module.exports=api;else root.CardInvoice=api;
})(globalThis);
