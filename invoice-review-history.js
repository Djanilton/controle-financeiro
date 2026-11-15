/* Append-only private review events; never used to change financial transactions. */
(function(root){'use strict';
const clone=structuredClone,SCHEMA='invoice-review-history-v1';
const STATES={pending:'Pendente',marked:'Marcada como corrigida pelo usuário',confirmed:'Correção confirmada após nova conciliação',persistent:'Permanece divergente',review:'Necessita revisão'};
const problem=r=>!['MATCH','PAYMENT_EXCLUDED'].includes(r.code),scope=r=>JSON.stringify([r.cardId,r.invoiceMonth,r.sources?.application?.profileId||null,r.sources?.application?.remoteCardId||null]);
function key(report,row){
 if(row.code==='AMBIGUOUS'||row.bank?.issues?.includes('DUPLICATE_ID')||row.application?.issues?.includes('DUPLICATE_ID'))return null;
 const ids=[];for(const side of ['bank','application']){const r=row[side];if(r?.id)ids.push([side,r.id,r.type??null,r.occurrenceMonth??null,r.splitId??null,r.installmentNumber??null,r.installmentsCount??null])}
 return ids.length?JSON.stringify([scope(report),ids]):null;
}
function rowRefs(row){return ['bank','application'].filter(s=>row[s]?.id).map(s=>[s,row[s].id,row[s].type??null,row[s].occurrenceMonth??null,row[s].splitId??null,row[s].installmentNumber??null,row[s].installmentsCount??null])}
function follows(previous,old,current,row){
 if(scope(previous)!==scope(current)||!key(previous,old)||!key(current,row))return false;
 const a=rowRefs(old),b=rowRefs(row);const common=a.filter(x=>b.some(y=>JSON.stringify(x)===JSON.stringify(y)));
 // Every identifier previously present must still be present unchanged on its original side.
 return a.length>0&&common.length===a.length;
}
function newRevision(report,previous=[],now=new Date().toISOString(),id){
 if(report?.schema!=='card-invoice-review-v1'||!Array.isArray(report.results)||!id)throw Error('REVIEW_INVALID');
 const prior=previous.filter(x=>scope(x.report)===scope(report)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];
 const rows=report.results.map((row,index)=>({index,key:key(report,row),state:problem(row)?'pending':'not-applicable',markedAt:null,change:'new'}));
 const resolved=[],unobserved=[];
 if(prior){const old=project(prior);for(const entry of old.rows){const row=prior.report.results[entry.index];if(!problem(row)&&entry.change!=='resolved')continue;const matches=report.results.map((r,i)=>({r,i})).filter(x=>follows(prior.report,row,report,x.r));if(matches.length!==1){if(problem(row))unobserved.push({previousIndex:entry.index,state:'review',reason:'Ocorrência não reencontrada inequivocamente; desaparecimento não prova correção.'});continue}const target=rows[matches[0].i],current=matches[0].r;if(report.results.filter(r=>key(report,r)&&key(report,r)===target.key).length!==1){target.state='review';continue}target.markedAt=entry.markedAt;target.change='persistent';if(entry.state==='marked'||entry.state==='persistent'||entry.state==='confirmed'){if(current.code==='MATCH'&&current.bank&&!current.bank.issues.length&&current.application&&!current.application.issues.length&&report.sources.bank.controlled&&report.sources.application.controlled){target.state='confirmed';target.change='resolved';resolved.push(target.index)}else{target.state=problem(current)?'persistent':'review'}}else if(problem(current))target.state=entry.state==='review'?'review':'pending';}}
 for(const r of rows)if(!r.key){r.state='review';r.change='ambiguous'}
 return {schema:SCHEMA,id,createdAt:now,report:clone(report),rows,events:[],resolved,unobserved};
}
function project(revision,events=[]){const r=clone(revision);for(const e of [...r.events,...events.filter(e=>e.revisionId===r.id)].sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id))){const row=r.rows.find(x=>x.index===e.index);if(!row||!['marked','pending','review'].includes(e.state))continue;row.state=e.state;row.markedAt=e.state==='marked'?e.at:null}return r}
function mark(revision,index,checked,at,id){const row=revision.rows.find(x=>x.index===index);if(!row||!problem(revision.report.results[index])||!id||!Number.isFinite(Date.parse(at)))throw Error('MARK_INVALID');return {schema:'invoice-review-event-v1',id,revisionId:revision.id,index,state:checked?'marked':'pending',at}}
function counts(revision){const result={pending:0,marked:0,confirmed:0,persistent:0,review:0};for(const r of revision.rows)if(problem(revision.report.results[r.index])||r.change==='resolved')result[r.state]++;return result}
function sortRows(rows){const rank=r=>['BANK_ONLY','INSTALLMENT_BANK_ONLY'].includes(r.code)?0:['APP_ONLY','INSTALLMENT_APP_ONLY'].includes(r.code)?1:['PROBABLE_MATCH','PROBABLE_RECURRING_MATCH'].includes(r.code)?3:['MATCH','PAYMENT_EXCLUDED'].includes(r.code)?4:2;return rows.map((row,index)=>({row,index})).sort((a,b)=>rank(a.row)-rank(b.row)||a.index-b.index)}
const api={SCHEMA,STATES,key,newRevision,project,mark,counts,sortRows};if(typeof module==='object'&&module.exports)module.exports=api;else root.InvoiceReviewHistory=api;
})(globalThis);
