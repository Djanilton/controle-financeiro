// Explicit semantics for synthetic fixtures ONLY. This is not a provider adapter.
function normalizedFixture(p){
 p.financialSemantics={contract:'controle-financeiro-normalized-v1',currency:'BRL',scale:2,unit:'major',itemAmount:'presentationAmount',detailAmount:'amount',sign:'source-signed',dueDate:'explicit-calendar-date',occurrenceMonth:'explicit',recurrenceCodes:'F-fixed-M-monthly-or-installment'};
 for(const row of p.items){const d=p.details.find(d=>String(d.transaction.id)===String(row.id)&&d.transaction.dueDate===row.date);row.occurrenceMonth=d?.month||row.date.slice(0,7);if(!d)row.dueDate=row.date;else d.type=row.type;}
 for(const page of p.sourcePages||[]){const d=page.payload.result.data;if(d.pagination.hasMore)d.pagination.nextOffset=d.pagination.offset+d.items.length;}
 for(const page of p.pages||[])if(page.pagination.hasMore)page.pagination.nextOffset=page.pagination.offset+page.pagination.limit;
 for(const page of p.pages||[])page.items=p.items.slice(page.pagination.offset,page.pagination.offset+page.pagination.limit);
 return p;
}
function controls(p){return {independentControl:true,profileId:p.profileId,from:p.from,to:p.to,totals:Object.fromEntries(Object.entries(p.totals).map(([k,v])=>[k,{count:v.count,totalMinor:Math.round(v.total*100)}]))}}
module.exports={normalizedFixture,controls};
