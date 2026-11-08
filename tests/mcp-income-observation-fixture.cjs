// Invented identities/amounts only; structural evidence, never a real capture.
const F=require('./mcp-observations-fixture.cjs');
function packet(due='2026-10-12 00:00:00'){
 const p=F.observationPacket(1);p.queries=p.queries.slice(0,1);p.details=p.details.slice(0,1);
 const e=p.details[0],d=e.payload.structuredContent.data,t=d.transaction,req=p.queries[0].request;
 e.request={profileId:p.profileId,transactionId:'synthetic-income-0',type:'receita',month:'2026-10',requestUpdateOpenFinance:false};d.type='income';d.month='2026-10';d.profile={id:p.profileId};Object.assign(t,{id:e.request.transactionId,profileId:p.profileId,dueDate:due,amount:37,completed:false,effectiveDate:null,recurrence:'M',includedInTotals:false,monthlySavings:true,presentationAmount:37});delete t.type;delete t.occurrenceMonth;delete t.monetaryStatus;for(const key of ['status','scale','currency','installmentNumber','installmentsCount','originId','createdAt'])delete t[key];
 t.monetaryProjection={native:{minor:'3700',currency:'BRL',scale:2},baseCurrency:'BRL',baseScale:2,status:'confirmed',equivalentMinor:'3700',pendingReason:null,snapshotId:'synthetic-projection'};
 d.monetaryCoverage={complete:true,hasEstimates:false,finalMinor:'3700',pendingNative:[]};d.requestUpdateOpenFinance=false;d.bankRefreshMayBeRequested=false;
 e.payload.structuredContent.metadata={profileId:p.profileId,monetaryCoverage:[{kind:'detail.transaction',complete:true,hasEstimates:false,finalMinor:'3700',pendingNative:[]}]};
 e.payload.content=[{type:'text',text:JSON.stringify(e.payload.structuredContent)}];
 Object.assign(req,{type:'todos',period:'personalizado',limit:5,offset:0,requestUpdateOpenFinance:false});const page=p.queries[0].pages[0];page.request={...req};page.payload.structuredContent.data={items:Array.from({length:5},(_,i)=>({id:'synthetic-income-'+i,type:'receita',occurrenceMonth:'2026-10',date:'2026-10-12',description:'Synthetic pending income',presentationAmount:37,account:{id:'account-a'}})),pagination:{offset:0,limit:5,totalCount:203,hasMore:true,nextOffset:5}};
 e.payload.structuredContent={success:true,result:e.payload.structuredContent};e.payload.content=[{type:'text',text:JSON.stringify(e.payload.structuredContent)}];
 page.payload.structuredContent.period={start:req.startDate,end:req.endDate};page.payload.structuredContent.metadata.requestUpdateOpenFinance=false;page.payload.structuredContent.metadata.bankRefreshMayBeRequested=false;page.payload.structuredContent={success:true,result:page.payload.structuredContent};
 return p;
}
module.exports={packet,tx:p=>p.details[0].payload.structuredContent.result.data.transaction};
