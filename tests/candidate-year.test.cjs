const test=require('node:test'),assert=require('node:assert/strict'),M=require('../minhas-financas-core.js'),C=require('../candidate-update.js');
const {yearPacket,controls,base,options}=require('./candidate-year-fixture.cjs');
test('12 meses: vencimento explícito, três tipos, antecipação, parcelas antigas, duplicatas legítimas e idempotência',()=>{
 const p=yearPacket(),b=base(),original=structuredClone(b),copy=structuredClone(p),first=C.preview(b,options(p));assert.ok(first.passed);assert.equal(first.candidate.data.transactions.length,p.items.length+2);assert.deepEqual(b,original);assert.deepEqual(p,copy);
 assert.deepEqual(first.candidate.manual,b.manual);for(const id of ['historical','outside'])assert.deepEqual(first.candidate.data.transactions.find(t=>t.id===id),b.data.transactions.find(t=>t.id===id));
 const rows=first.candidate.data.transactions.filter(t=>t.minhasFinancas);assert.ok(rows.some(t=>t.paymentDate==='2026-09-20'&&t.dueDate==='2026-10-10'));assert.ok(rows.some(t=>t.installments==='1/12'));assert.ok(rows.every(t=>t.postedDate===''));
 const again=C.preview(first.candidate,options(p));assert.ok(again.passed);assert.deepEqual(again.candidate,first.candidate);assert.equal(first.after.filter(r=>r.month>='2026-10'&&r.month<='2027-09'&&['Efetivada','Pendente'].includes(r.status)).length,72);assert.deepEqual(C.undo(first),b);
});
test('mudança de valor/situação e ausência comprovada só alteram a cópia candidata; IDs conservados',()=>{
 const p=yearPacket(),old=C.preview(base(),options(p)),next=yearPacket();
 for(const r of next.items)if(r.id==='synthetic-0-0'){r.presentationAmount=-250;r.status='pending';}
 for(const d of next.details)if(d.transaction.id==='synthetic-0-0'){d.transaction.amount=-250;d.transaction.status='pending';d.transaction.effectiveDate=null;}
 // Rebuild controls and source totals after an explicit synthetic source change.
 const mutate=require('./candidate-year-mutations.cjs');mutate.refresh(next);
 const changed=C.preview(old.candidate,options(next));assert.ok(changed.passed);const a=old.candidate.data.transactions.find(t=>t.minhasFinancas?.remoteId==='synthetic-0-0'),b=changed.candidate.data.transactions.find(t=>t.minhasFinancas?.remoteId==='synthetic-0-0');assert.equal(a.id,b.id);assert.equal(b.cashAmount,-250);assert.equal(b.paymentDate,'');
 mutate.remove(next,'synthetic-0-1');const removed=C.preview(changed.candidate,options(next));assert.ok(removed.passed);assert.equal(removed.possibleDeletions.length,1);assert.ok(changed.candidate.data.transactions.some(t=>t.minhasFinancas?.remoteId==='synthetic-0-1'));
});
test('semântica, vencimento, mês, dinheiro e cobertura desconhecidos nunca viram valores assumidos',()=>{
 const mutations=[p=>delete p.financialSemantics,p=>p.financialSemantics.scale=0,p=>p.financialSemantics.unit='minor',p=>p.complete='true',p=>p.replacementCoverage.complete='true',p=>delete p.items[0].occurrenceMonth,p=>p.items[0].currency='USD',p=>p.items[0].presentationAmount=null,p=>p.items[0].presentationAmount=0.001,p=>p.items[0].dueDate=null,p=>p.details[0].transaction.dueDate='10/10/2026',p=>p.sourcePages.pop(),p=>p.sourcePages.push(p.sourcePages[0]),p=>p.sourcePages[0].payload.result.data.filters.unknownFilter=true,p=>p.sourcePages[0].payload.result.data.totals.expenses.total=null,p=>p.sourcePages[0].payload.result.data.monetaryCoverage.expenses.finalMinor=undefined,p=>p.details[0].type='incomes'];
 for(const mutate of mutations){const p=yearPacket(),b=base(),copy=structuredClone(b);mutate(p);assert.throws(()=>C.preview(b,options(p)));assert.deepEqual(b,copy)}
 const p=yearPacket();assert.throws(()=>C.preview(base(),{packet:p,asOf:'2026-10-30'}),/independentes/);const o=options(p);o.pluginControl.totals.expenses.count++;assert.throws(()=>C.preview(base(),o),/independentes/);
 assert.equal(M.fieldState({},'amount'),'ABSENT');assert.equal(M.fieldState({amount:null},'amount'),'NULL');assert.equal(M.fieldState({amount:undefined},'amount'),'UNKNOWN');assert.equal(M.fieldState({amount:'?'},'amount',Number.isFinite),'INVALID');assert.equal(M.fieldState({amount:0},'amount',Number.isFinite),'PRESENT');
});
test('alterações locais e todas as fontes protegidas preservadas; identidade remota alterada não força vínculo',()=>{
 const p=yearPacket(),initial=C.preview(base(),options(p)),modified=structuredClone(initial.candidate);modified.data.transactions.find(t=>t.minhasFinancas).cashAmount=-999;const r=C.preview(modified,options(p));assert.equal(r.passed,false);assert.deepEqual(r.candidate.data.transactions,modified.data.transactions);
 for(const flag of ['isProjection','isFinancing','investmentId','constructionId','fgtsId','payrollId','isManual']){const b=base();b.data.transactions.push({id:'protected-'+flag,dueDate:'2026-10-11',amount:2,[flag]:true});const r=C.preview(b,options(p));assert.ok(r.passed);assert.deepEqual(r.candidate.data.transactions.find(t=>t.id==='protected-'+flag),b.data.transactions.at(-1))}
 const ambiguous=structuredClone(initial.candidate),row=ambiguous.data.transactions.find(t=>t.minhasFinancas);ambiguous.data.transactions.push({...structuredClone(row),id:'duplicate-private-id'});const r2=C.preview(ambiguous,options(p));assert.equal(r2.passed,false);
});
test('30 mil ocorrências MCP: prévia, segunda carga, exportação, recuperação e desfazer sem tocar a origem',()=>{
 const p=yearPacket(2500),b=base(),first=C.preview(b,options(p));assert.ok(first.passed);assert.equal(first.candidate.data.transactions.length,30002);const again=C.preview(first.candidate,options(p));assert.ok(again.passed);assert.deepEqual(again.candidate,first.candidate);
 const signature=JSON.stringify({data:b.data,manual:b.manual}),restored=C.recoverReview(JSON.parse(JSON.stringify({schema:'candidate-review-v1',sourceSignature:signature,preview:first})),signature);assert.equal(restored.candidate.data.transactions.length,30002);assert.deepEqual(C.undo(restored),b);
 console.log(JSON.stringify({syntheticMcpRows:30000,peakRssKiB:process.resourceUsage().maxRSS,heapUsedBytes:process.memoryUsage().heapUsed}));
});

test('páginas completas: cursor, duplicatas, filtros, tipos e totais por situação são conciliados',()=>{
 for(const change of [p=>p.sourcePages[0].payload.result.data.pagination.nextOffset=49,p=>p.sourcePages[0].payload.result.data.pagination.hasMore=false,p=>p.sourcePages.splice(1,1),p=>p.sourcePages[0].payload.result.data.items[1]=p.sourcePages[0].payload.result.data.items[0],p=>p.sourcePages[1].payload.result.data.filters.status='pending',p=>{const v=p.sourcePages[0].payload.result.data.totals.expenses;v.completed+=1;v.pending-=1}]){const p=yearPacket(55);change(p);assert.throws(()=>C.preview(base(),options(p)))}
 const p=yearPacket(),first=C.preview(base(),options(p)),old=first.candidate.data.transactions.find(t=>t.minhasFinancas);old.cashAmount=null;assert.equal(M.hasLocalChanges(old),true);const result=C.preview(first.candidate,options(p));assert.equal(result.passed,false);assert.equal(result.candidate.data.transactions.find(t=>t.id===old.id).cashAmount,null);
});
test('mesmo ID em tipos distintos e chaves legadas preservam identidade composta e IDs locais',()=>{
 const p=yearPacket();for(const row of p.items)if(row.id==='synthetic-0-1')row.id='synthetic-0-0';for(const d of p.details)if(d.transaction.id==='synthetic-0-1')d.transaction.id='synthetic-0-0';const r=C.preview(base(),options(p));assert.ok(r.passed);const next=structuredClone(r.candidate),item=next.data.transactions.find(t=>t.minhasFinancas);const local=item.id;item.minhasFinancas.key='legacy-delimited-key';const rememberedSeries=item.minhasFinancas.seriesId;delete p.items[0].seriesId;const second=C.preview(next,options(p));assert.ok(second.passed);assert.ok(second.candidate.data.transactions.some(t=>t.id===local));assert.equal(second.candidate.data.transactions.find(t=>t.id===local).minhasFinancas.seriesId,rememberedSeries);
});
