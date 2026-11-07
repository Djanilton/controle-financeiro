// All records and controls below are generated synthetically, never real reports.
const M=require('../minhas-financas-core.js');
function yearPacket(perMonth=9){
 const p={schema:'minhas-financas-source-report-v1',financialSemantics:{...M.SEMANTICS},complete:true,readyForControleFinanceiro:true,detailsComplete:true,profileId:'synthetic-year',currency:'BRL',dateReference:'due',from:'2026-10-01',to:'2027-09-30',generatedAt:'2026-10-30T12:00:00Z',items:[],details:[],sourcePages:[]};
 p.replacementCoverage={complete:true,profileId:p.profileId,dateReference:'due',from:p.from,to:p.to,status:'all',unfiltered:true,types:['expenses','incomes','transfers']};
 for(let month=0;month<12;month++){
  const start=new Date(Date.UTC(2026,9+month,1)).toISOString().slice(0,10),end=new Date(Date.UTC(2026,10+month,0)).toISOString().slice(0,10),occurrenceMonth=start.slice(0,7),rows=[];
  for(let i=0;i<perMonth;i++){
   const type=['expenses','incomes','transfers'][i%3],id='synthetic-'+month+'-'+i,amount=(i%3===0?-1:1)*(100+i%7),status=i%2?'pending':'completed',dueDate=occurrenceMonth+'-10';
   const row={id,type,occurrenceMonth,dueDate,date:'2024-01-01',description:'Operação sintética '+i,presentationAmount:amount,status,currency:'BRL',scale:2,account:{description:'Conta sintética A'},...(type==='transfers'?{originAccount:{description:'Conta sintética A'},destinationAccount:{description:'Conta sintética B'}}:{})};
   if(i===3)row.description='Operação sintética 0'; // Two legitimate identical purchases, different IDs.
   if(i===3)row.presentationAmount=-100;
   const transaction={id,dueDate,amount:row.presentationAmount,profileId:p.profileId,effectiveDate:status==='completed'?'2026-09-20':null,createdAt:'2025-01-01',status,currency:'BRL',scale:2};
   if(i%5===0)Object.assign(transaction,{installmentNumber:month+1,installmentsCount:12});
   row.seriesId='synthetic-series-'+i;
   rows.push(row);p.details.push({profile:{id:p.profileId},type,month:occurrenceMonth,transaction});
  }
  const totals=Object.fromEntries(['expenses','incomes','transfers'].map(type=>{const a=rows.filter(t=>t.type===type),sum=s=>a.filter(t=>!s||t.status===s).reduce((n,t)=>n+Math.round(t.presentationAmount*100),0)/100;return [type,{count:a.length,total:sum(),completed:sum('completed'),pending:sum('pending')}]}));
  for(let offset=0;offset<rows.length;offset+=50){const items=rows.slice(offset,offset+50),hasMore=offset+items.length<rows.length;p.sourcePages.push({payload:{success:true,result:{success:true,metadata:{profileId:p.profileId,currency:'BRL'},data:{items,totals,filters:{startDate:start,endDate:end,dateReference:'due',status:'all',type:'transactions'},monetaryCoverage:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,{complete:true,hasEstimates:false,baseCurrency:'BRL',finalMinor:String(Math.round(v.total*100))}])),pagination:{included:true,offset,limit:50,totalCount:rows.length,hasMore,nextOffset:hasMore?offset+items.length:null}}}}})}
  p.items.push(...rows);
 }
 return p;
}
function controls(p){const totals=Object.fromEntries(['expenses','incomes','transfers'].map(k=>{const rows=p.items.filter(t=>t.type===k);return [k,{count:rows.length,totalMinor:rows.reduce((n,t)=>n+Math.round(t.presentationAmount*100),0)}]}));return {independentControl:true,profileId:p.profileId,from:p.from,to:p.to,totals}}
const base=()=>({schema:1,data:{transactions:[{id:'historical',kind:'Despesa',dueDate:'2026-09-30',amount:7},{id:'outside',kind:'Receita',dueDate:'2027-10-01',amount:9}],investments:[{id:'synthetic-keep'}],loans:[{id:'synthetic-loan'}]},manual:{transactions:[{id:'manual',isManual:true,dueDate:'2026-10-15',amount:8}]},unknown:{keep:true}});
const options=p=>({packet:p,pluginControl:controls(p),asOf:'2026-10-30'});
module.exports={yearPacket,controls,base,options};
