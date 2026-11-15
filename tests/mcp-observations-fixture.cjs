// Synthetic capture only. This helper NEVER upgrades a production legacy packet.
const {yearPacket,base}=require('./candidate-year-fixture.cjs');
function observationPacket(perMonth=9){
 const old=yearPacket(perMonth),p={schema:'minhas-financas-observations-v1',profileId:old.profileId,queries:[],details:[]};
 for(const source of old.sourcePages){const d=source.payload.result.data,r={profileId:p.profileId,dateReference:'due',startDate:d.filters.startDate,endDate:d.filters.endDate,limit:50,offset:0};let q=p.queries.find(q=>q.request.startDate===r.startDate);if(!q){q={tool:'search_transactions',request:r,pages:[]};p.queries.push(q)}q.pages.push({request:{...r,offset:d.pagination.offset},payload:{structuredContent:{success:true,data:{items:structuredClone(d.items),pagination:structuredClone(d.pagination)},querySummary:{dateReference:'due'},metadata:{profileId:p.profileId}}}})}
 for(const detail of old.details){const t=structuredClone(detail.transaction);t.presentationAmount=t.amount;t.completed=t.status==='completed';t.recurrence=detail.type==='expenses'?'M':'P';t.originId='synthetic-origin-'+t.id;t.account={id:'account-a',description:'Nome remoto'};if(detail.type==='transfers'){t.originAccount=t.account;t.destinationAccount={id:'account-b',description:'Outro nome remoto'}}
 t.monetaryStatus={presentationAmount:'confirmed'};t.monetaryProjection={baseCurrency:'BRL',baseScale:2,native:{minor:String(Math.round(t.amount*100)),currency:'BRL',scale:2},complete:true,hasEstimates:false,finalMinor:String(Math.round(t.amount*100))};
 p.details.push({tool:'get_transaction_details',request:{profileId:p.profileId,transactionId:t.id,type:detail.type,month:detail.month},payload:{structuredContent:{success:true,data:{profile:detail.profile,type:detail.type,month:detail.month,transaction:t}}}})}
 return p;
}
const accountLinks=p=>[{profileId:p.profileId,remoteId:'account-a',localName:'Conta sintética A'},{profileId:p.profileId,remoteId:'account-b',localName:'Conta sintética B'}];
const options=p=>({asOf:'2026-10-30',packet:p,accountLinks:accountLinks(p)});
const tx=(p,i=0)=>p.details[i].payload.structuredContent.data.transaction;
const items=p=>p.queries.flatMap(q=>q.pages.flatMap(page=>page.payload.structuredContent.data.items));
module.exports={observationPacket,base,options,accountLinks,tx,items};
