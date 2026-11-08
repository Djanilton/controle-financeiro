const test=require('node:test'),assert=require('node:assert/strict'),C=require('../candidate-update.js'),O=require('../minhas-financas-observations.js'),F=require('./mcp-observations-fixture.cjs');
const run=(p,b=F.base())=>C.preview(b,F.options(p));
const codes=r=>r.conflicts.map(c=>c.code);
function single(){const p=F.observationPacket(1);p.queries=p.queries.slice(0,1);p.details=p.details.slice(0,1);return p}
function amount(p,n){const d=F.tx(p);d.presentationAmount=n;d.monetaryProjection.finalMinor=String(O.minor(n,2));F.items(p)[0].presentationAmount=n}
test('12 meses por observações: três tipos, duplicatas legítimas, histórico, módulos, antecipação e idempotência',()=>{
 const p=F.observationPacket(),b=F.base(),original=structuredClone(b),r=run(p,b);assert.equal(r.passed,true);assert.equal(r.candidate.data.transactions.length,110);assert.deepEqual(b,original);assert.deepEqual(r.candidate.manual,b.manual);assert.deepEqual(C.undo(r),b);assert.deepEqual(run(p,r.candidate).candidate,r.candidate);assert.equal(r.snapshot,false);assert.equal(r.complete,false);assert.equal(r.replacementAllowed,false);assert.equal(r.summary.removed,0);assert.deepEqual(r.possibleDeletions,[]);
 const row=r.candidate.data.transactions.find(t=>t.minhasFinancas);assert.equal(row.paymentDate,'2026-09-20');assert.equal(row.postedDate,'2025-01-01');assert.equal(row.dueDate,'2026-10-10');assert.equal(row.installments,'1/12');assert.equal(row.cashAmount,-100);
});
test('ausência, consulta parcial e desaparecimento entre páginas preservam ocorrências, sem exclusão ou cancelamento',()=>{
 const p=F.observationPacket(55),first=run(p),partial=F.observationPacket(55);partial.queries[0].pages.pop();partial.queries.splice(1);const r=run(partial,first.candidate);assert.ok(r.passed);assert.ok(r.notObserved.length>0);assert.ok(r.warnings.includes('QUERY_PARTIAL'));assert.equal(r.candidate.data.transactions.length,first.candidate.data.transactions.length);assert.deepEqual(r.possibleDeletions,[]);
 const empty=single();empty.queries[0].pages[0].payload.structuredContent.data.items=[];empty.queries[0].pages[0].payload.structuredContent.data.pagination={hasMore:false};empty.details=[];const e=run(empty,first.candidate);assert.ok(e.passed);assert.deepEqual(e.candidate,first.candidate);assert.equal(e.notObserved.length,660);
});
test('atualização por identidade composta preserva ID e campos privados; valores nativos não são equivalentes apresentados',()=>{
 const p=single(),initial=run(p),old=initial.candidate.data.transactions.find(t=>t.minhasFinancas);old.sourceFields.originalExcelColumn='synthetic';const changed=single();amount(changed,-250);F.tx(changed).amount=10;F.tx(changed).fullAmount=11;F.tx(changed).monetaryProjection.native={minor:'10000',currency:'USD',scale:3};F.tx(changed).completed=false;F.tx(changed).effectiveDate=null;
 const r=run(changed,initial.candidate),row=r.candidate.data.transactions.find(t=>t.id===old.id);assert.ok(r.passed);assert.equal(row.cashAmount,-250);assert.equal(row.id,old.id);assert.equal(row.status,'Pendente');assert.equal(row.sourceFields.originalExcelColumn,'synthetic');assert.equal(row.sourceFields.mcpObservation.detail.amount,10);
});
test('moedas, escalas, sinais e arredondamento fornecido são preservados, sem recalcular câmbio',()=>{
 for(const n of [-1.01,1.01,0,-10,10]){const p=single();amount(p,n);const d=F.tx(p);d.amount=n<0?-1.005:1.005;d.monetaryProjection.native={minor:n<0?'-1005':'1005',currency:'KWD',scale:3};const r=run(p);assert.ok(r.passed);assert.equal(r.candidate.data.transactions.at(-1).amount,n)}
 for(const mutate of [d=>d.presentationAmount=null,d=>delete d.presentationAmount,d=>d.presentationAmount=0.001,d=>d.monetaryProjection.baseCurrency='USD',d=>d.monetaryProjection.baseScale=0,d=>d.monetaryProjection.finalMinor=null,d=>d.monetaryProjection.complete=false,d=>d.monetaryProjection.hasEstimates=true,d=>delete d.monetaryStatus,d=>d.monetaryStatus.presentationAmount='estimated',d=>{delete d.monetaryProjection.finalMinor;d.monetaryProjection.knownMinor='100';d.monetaryProjection.projectedMinor='100'}]){const p=single();mutate(F.tx(p));const r=run(p);assert.equal(r.passed,false);assert.deepEqual(r.candidate,F.base())}
});
test('datas desconhecidas não usam referenceDate/date; calendário não é truncado de timestamp',()=>{
 for(const due of [undefined,null,'10/10/2026','2026-10-10T00:00:00','2026-02-30']){const p=single();F.tx(p).dueDate=due;F.tx(p).referenceDate='2026-10-10';const r=run(p);assert.ok(codes(r).includes('DUE_DATE_UNCONFIRMED'))}
 const p=single();F.tx(p).effectiveDate='2026-09-20T12:30:00';F.tx(p).createdAt='2025-01-01T10:00:00-03:00';const r=run(p),t=r.candidate.data.transactions.at(-1);assert.ok(r.passed);assert.equal(t.paymentDate,'');assert.equal(t.postedDate,'');assert.equal(t.minhasFinancas.effectiveDateFormat,'LOCAL_TIMESTAMP');assert.equal(t.minhasFinancas.createdAtFormat,'INSTANT_WITH_OFFSET');assert.equal(t.sourceFields.mcpObservation.detail.effectiveDate,'2026-09-20T12:30:00');
});
test('identificadores opacos, mês explícito, tipos e origem não confundem série e ocorrência',()=>{
 const p=single();F.items(p)[0].id='000123';F.tx(p).id='000123';p.details[0].request.transactionId='000123';F.tx(p).originId='series-1';const r=run(p);assert.ok(r.passed);assert.equal(r.candidate.data.transactions.at(-1).minhasFinancas.remoteId,'000123');assert.equal(r.candidate.data.transactions.at(-1).minhasFinancas.originId,'series-1');assert.equal(r.candidate.data.transactions.at(-1).minhasFinancas.seriesId,undefined);
 for(const mutate of [p=>F.items(p)[0].id=123,p=>delete F.items(p)[0].occurrenceMonth,p=>F.items(p)[0].occurrenceMonth='2026-09',p=>F.tx(p).originId=1]){const q=single();mutate(q);assert.equal(run(q).passed,false)}
 const all=F.observationPacket(3);for(const q of all.queries)for(const page of q.pages)for(const t of page.payload.structuredContent.data.items)t.id='same-id';for(const d of all.details){d.request.transactionId='same-id';d.payload.structuredContent.data.transaction.id='same-id'}assert.ok(run(all).passed);
});
test('recorrências oficiais diferem por tipo; ausência não presume parcela',()=>{
 for(const [type,table]of Object.entries({expenses:{N:'Avulsa',F:'Fixa',M:'Parcelada'},incomes:{N:'Avulsa',M:'Fixa',P:'Parcelada'},transfers:{N:'Avulsa',M:'Fixa',P:'Parcelada'}}))for(const [code,name]of Object.entries(table))assert.equal(O.recurrence({recurrence:code},type),name);
 const p=single();delete F.tx(p).recurrence;delete F.tx(p).installmentNumber;delete F.tx(p).installmentsCount;const r=run(p);assert.ok(r.passed);assert.equal(r.candidate.data.transactions.at(-1).installments,'');assert.equal(r.candidate.data.transactions.at(-1).recurrence,'');F.tx(p).installmentNumber=1;assert.ok(codes(run(p)).includes('INSTALLMENT_PARTIAL'));
});
test('completed boolean confirma situação; texto e efetivação não são prova; transferência tem duas contas e um registro',()=>{
 const p=single();delete F.tx(p).completed;assert.ok(codes(run(p)).includes('COMPLETION_UNCONFIRMED'));const q=F.observationPacket(3),r=run(q);assert.ok(r.passed);assert.equal(r.candidate.data.transactions.filter(t=>t.kind==='Transferência').length,12);
 const missing=F.options(q);missing.accountLinks=[];assert.equal(C.preview(F.base(),missing).passed,false);F.tx(q,2).destinationAccount.id='account-a';assert.equal(run(q).passed,false);
});
test('páginas mutáveis: duplicatas iguais deduplicadas, diferentes geram conflito; totais variáveis nunca comprovam snapshot',()=>{
 const p=F.observationPacket(55),page=p.queries[0].pages[1].payload.structuredContent.data;page.items[0]=structuredClone(F.items(p)[0]);const r=run(p);assert.ok(r.passed);assert.equal(r.candidate.data.transactions.length,661);assert.ok(r.warnings.includes('DUPLICATE_OBSERVATION'));page.items[0].description='Changed';assert.ok(codes(run(p)).includes('OBSERVATION_CHANGED'));
 const q=F.observationPacket(55);q.queries[0].pages[1].payload.structuredContent.data.pagination.totalCount=54;assert.ok(run(q).warnings.includes('SOURCE_CHANGED_DURING_PAGING'));
 for(const mutate of [p=>p.queries[0].pages[1].request.dateReference='created',p=>p.queries[0].pages[1].request.offset=49,p=>p.queries[0].pages[0].payload.structuredContent.data.pagination.nextOffset=49]){const a=F.observationPacket(55);mutate(a);assert.throws(()=>run(a))}
});
test('metadados contraditórios e detalhes de report não substituem get_transaction_details',()=>{
 for(const mutate of [p=>p.details[0].tool='run_report',p=>p.details[0].payload.structuredContent.data.profile.id='other',p=>p.queries[0].pages[0].payload.structuredContent.querySummary.dateReference='payment',p=>p.queries[0].pages[0].payload.structuredContent.querySummary.startDate='2026-10-02']){const q=single();mutate(q);assert.throws(()=>run(q))}
 const q=single();q.details=[];assert.ok(codes(run(q)).includes('DETAIL_REQUIRED'));
});
test('envelopes MCP estruturado/textual, erros seguros e contradições',()=>{
 for(const textOnly of [true,false]){const p=single();for(const page of p.queries[0].pages){page.payload.content=[{type:'text',text:JSON.stringify(page.payload.structuredContent)}];if(textOnly)delete page.payload.structuredContent}assert.ok(run(p).passed)}
 const p=single();p.queries[0].pages[0].payload={isError:true,structuredContent:{error:{code:'PROFILE_LOCKED',message:'private'}}};assert.throws(()=>run(p),e=>e.code==='PROFILE_LOCKED'&&!e.message.includes('private'));
 const q=single();q.queries[0].pages[0].payload.content=[{type:'text',text:'{}'}];assert.throws(()=>run(q),/CONTENT_CONTRADICTORY/);
});
test('alterações manuais, fontes protegidas, identidade ambígua e possíveis vínculos Excel nunca são sobrescritos',()=>{
 const p=single(),first=run(p);for(const flag of ['isManual','manualOverride','isProjection','isFinancing','investmentId','constructionId','fgtsId','payrollId','protected']){const b=structuredClone(first.candidate);b.data.transactions.at(-1)[flag]=true;const r=run(p,b);assert.equal(r.passed,false);assert.deepEqual(r.candidate,b)}
 const b=structuredClone(first.candidate);b.data.transactions.at(-1).notes='manual edit';assert.equal(run(p,b).passed,false);
 const ambiguous=structuredClone(first.candidate);ambiguous.data.transactions.push({...structuredClone(ambiguous.data.transactions.at(-1)),id:'other-local'});assert.ok(codes(run(p,ambiguous)).includes('REMOTE_IDENTITY_AMBIGUOUS'));
 const excel=F.base(),row=structuredClone(first.candidate.data.transactions.at(-1));delete row.minhasFinancas;row.source='Excel';row.id='excel-id';excel.data.transactions.push(row);assert.ok(codes(run(p,excel)).includes('POSSIBLE_LOCAL_MATCH_REVIEW'));
});
test('planos e orçamento exigem informação explícita; não executam chamadas',()=>{
 assert.equal(O.callBudget({calls:1}).code,'QUOTA_UNKNOWN');for(const [plan,daily,monthly]of [['Sync',500,3000],['Sync Bank',1000,6000],['Sync Bank Pro',2000,10000]]){assert.equal(O.callBudget({plan,dayUsed:daily-1,monthUsed:monthly-1,calls:1}).allowed,true);assert.equal(O.callBudget({plan,dayUsed:daily,monthUsed:0,calls:1}).allowed,false)}
 const p=single();p.queries[0].request.limit=51;assert.throws(()=>run(p),/QUERY_FILTER_INVALID/);
});
test('revisão recuperável e undo preservam base; antiga substituição MCP não reabre',()=>{
 const p=single(),b=F.base(),r=run(p),signature=JSON.stringify({data:b.data,manual:b.manual}),review={schema:'candidate-review-v1',sourceSignature:signature,preview:r};assert.deepEqual(C.undo(C.recoverReview(JSON.parse(JSON.stringify(review)),signature)),b);const unsafe=structuredClone(review);unsafe.preview.mode='replace-due-period';assert.throws(()=>C.recoverReview(unsafe,signature),/antiga/);
 const legacy=require('./candidate-year-fixture.cjs').yearPacket();assert.throws(()=>C.preview(b,{packet:legacy,asOf:'2026-10-30'}),/OBSERVATION_CAPTURE_REQUIRED/);assert.throws(()=>C.preview(b,{...F.options(p),excel:[{}]}),/misture/);
});
test('30 mil observações: idempotência, serialização, recuperação e undo sem alterações na origem',()=>{
 const p=F.observationPacket(2500),b=F.base(),r=run(p,b);assert.ok(r.passed);assert.equal(r.candidate.data.transactions.length,30002);assert.deepEqual(run(p,r.candidate).candidate,r.candidate);const signature=JSON.stringify({data:b.data,manual:b.manual});const restored=C.recoverReview(JSON.parse(JSON.stringify({schema:'candidate-review-v1',sourceSignature:signature,preview:r})),signature);assert.deepEqual(C.undo(restored),b);assert.deepEqual(restored.candidate,r.candidate);console.log(JSON.stringify({syntheticObservationRows:30000,peakRssKiB:process.resourceUsage().maxRSS}));
});
test('ausência de metadados de paginação não afirma completude; referência/período contraditórios bloqueiam',()=>{
 const p=single();delete p.queries[0].pages[0].payload.structuredContent.data.pagination;const r=run(p);assert.ok(r.passed);assert.ok(r.warnings.includes('PAGINATION_NOT_REPORTED'));assert.equal(r.complete,false);assert.equal(r.replacementAllowed,false);
});
test('limites de relatório e get_transaction_details são independentes de quotas presumidas',()=>{
 const p=single();p.queries[0].tool='run_report';p.queries[0].request.endDate='2028-10-31';assert.throws(()=>run(p),/REPORT_LIMIT/);
 const q=single();q.queries[0].tool='run_report';q.queries[0].request.limit=101;assert.throws(()=>run(q),/QUERY_FILTER_INVALID/);
});
test('campos originais de contexto e estados preservam moeda diferente sem assumir equivalência',()=>{
 const p=single(),d=p.details[0].payload.structuredContent.data;d.currency='USD';d.transaction.currency=null;delete d.transaction.referenceDate;const r=run(p),t=r.candidate.data.transactions.at(-1);assert.ok(r.passed);assert.equal(t.sourceFields.mcpObservation.detailContext.data.currency,'USD');assert.equal(t.minhasFinancas.fieldStates.currency,'NULL');assert.equal(t.minhasFinancas.fieldStates.referenceDate,'ABSENT');assert.equal(t.minhasFinancas.fieldStates.effectiveDate,'PRESENT');
});
test('recuperação de observações não aceita omissão de registros ou alteração de manuais',()=>{
 const b=F.base(),r=run(single(),b),signature=JSON.stringify({data:b.data,manual:b.manual}),file={schema:'candidate-review-v1',sourceSignature:signature,preview:r};for(const change of [v=>v.preview.candidate.data.transactions.shift(),v=>v.preview.candidate.manual.transactions[0].amount=999]){const v=structuredClone(file);change(v);assert.throws(()=>C.recoverReview(v,signature),/perdeu identidade/)}
});
test('legado normalizado não exige igualdade entre montante nativo e equivalente apresentado',()=>{
 const M=require('../minhas-financas-core.js'),p=require('./candidate-year-fixture.cjs').yearPacket();p.details[0].transaction.amount=1.005;assert.ok(M.validate(p));const rows=M.preview([],p).rows;assert.equal(rows[0].amount,p.items[0].presentationAmount);assert.equal(rows[0].cashAmount,p.items[0].presentationAmount);
});
test('flags declaradas de completude/snapshot nunca transformam observações em substituição',()=>{
 const p=single();p.complete=true;p.snapshot=true;p.replacementCoverage={complete:true};const r=run(p);assert.ok(r.passed);assert.equal(r.complete,false);assert.equal(r.snapshot,false);assert.equal(r.replacementAllowed,false);assert.equal(r.summary.removed,0);assert.deepEqual(r.possibleDeletions,[]);
});
test('ID local repetido não permite gerar propostas que perderiam vínculos',()=>{
 const b=F.base();b.data.transactions.push({...b.data.transactions[0]});assert.throws(()=>run(single(),b),/LOCAL_IDENTITY_AMBIGUOUS/);
});
test('índice deduplicado de contas não esconde vínculo divergente ou edição local',()=>{
 const p=single(),r=run(p),t=r.candidate.data.transactions.at(-1),M=require('../minhas-financas-core.js');assert.equal(M.hasLocalChanges(t),false);t.notes='manual';assert.equal(M.hasLocalChanges(t),true);const o=F.options(p);o.accountLinks.push({profileId:p.profileId,remoteId:'account-a',localName:'Conta diferente'});assert.equal(C.preview(F.base(),o).passed,false);
});
test('cartão sem vínculo comprovado e fonte remota protegida não geram propostas novas',()=>{
 const card=single();F.tx(card).card={id:'synthetic-card',description:'Cartão sintético'};assert.ok(codes(run(card)).includes('CARD_LINK_UNCONFIRMED'));
 for(const field of ['loanId','investmentId','constructionId','fgtsId','payrollId','isProjection']){const p=single();F.tx(p)[field]='synthetic-protected';assert.ok(codes(run(p)).includes('REMOTE_PROTECTED_SOURCE'))}
});
