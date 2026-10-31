const {normalizedFixture,controls}=require('./mcp-contract-fixture.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../candidate-update.js'),S=require('../candidate-sources.js'),M=require('../minhas-financas-core.js'),X=require('../vendor/xlsx.full.min.js');
const names=Object.keys(C.FILES);
const base=()=>({schema:1,data:{transactions:[],initialBalances:[{id:'synthetic'}],investments:[{id:'investment'}],loans:[{id:'loan'}],construction:{keep:true}},manual:{transactions:[],pluginOutbox:[{id:'local-intent'}]},unknown:{keep:true}});
const coverage={complete:true,dateReference:'due',profileId:'synthetic',from:'2026-10-01',to:'2044-12-31',types:['Despesa','Receita','Transferência']};
const options=extra=>({asOf:'2026-10-25',coverage,...extra,pluginControl:extra?.packet?controls(extra.packet):undefined});
const row=extra=>({'Descrição':'Operação sintética','Valor':10,'Vencimento':'2026-10-10','Conta':'Conta sintética','Situação':'Pendente',...extra});
function book(rows){const b=X.utils.book_new();X.utils.book_append_sheet(b,X.utils.json_to_sheet(rows),'Relatório');return b}
function sources(expenses=[row()]){return names.map((name,i)=>{const rows=i===0?expenses:i===1?[row({'Descrição':'Receita sintética'})]:[row({'Descrição':'Transferência sintética','Origem':'Conta sintética','Destino':'Outra conta'})];return S.fromExcelBook(book(rows),X,name,{expectedCount:rows.length,expectedTotalMinor:rows.reduce((n,r)=>n+Math.round(Number(r.Valor)*100),0)})})}
function rawPacket(){return {schema:M.SCHEMA,complete:true,profileId:'synthetic',currency:'BRL',dateReference:'due',from:'2026-10-01',to:'2027-09-30',generatedAt:'2026-10-25T00:00:00Z',replacementCoverage:{complete:true,dateReference:'due',profileId:'synthetic',from:'2026-10-01',to:'2027-09-30',status:'all',unfiltered:true,types:['expenses','incomes','transfers']},items:[{id:'remote-synthetic',type:'expenses',description:'Operação sintética',date:'2026-10-10',presentationAmount:10,status:'pending',account:{description:'Conta sintética'}}],detailsComplete:true,details:[{profile:{id:'synthetic'},month:'2026-10',transaction:{id:'remote-synthetic',amount:10,dueDate:'2026-10-10'}}],pages:[{pagination:{included:true,totalCount:1,limit:10,offset:0,hasMore:false}}],totals:{expenses:{count:1,total:10},incomes:{count:0,total:0},transfers:{count:0,total:0}}}}
function packet(){return normalizedFixture(rawPacket())}

test('Excel preserva observações plurais, tags, cartão, categorias, sinais e campos desconhecidos',()=>{
 const r=row({'Valor':-12.34,'Observações':'Anotação privada sintética','Tags':'tag sintética','Cartão':'Cartão sintético','Categoria':'Categoria sintética','Subcategoria':'Subcategoria sintética','Coluna futura':'campo sintético'});
 const source=S.fromExcelBook(book([r]),X,names[0],{expectedCount:1,expectedTotalMinor:-1234}),t=source.transactions[0];
 assert.equal(t.cashAmount,-12.34);assert.equal(t.notes,r['Observações']);assert.equal(t.tags,r.Tags);assert.equal(t.card,r['Cartão']);assert.equal(t.sourceFields['Coluna futura'],r['Coluna futura']);assert.equal(t.category,r.Categoria);assert.equal(t.subcategory,r.Subcategoria);
});
test('efetivação e lançamento não substituem a referência do vencimento',()=>{
 const s=S.fromExcelBook(book([row({'Efetivação':'2026-11-02','Lançamento':'2026-09-20','Situação':'Efetivada'})]),X,names[0]);
 assert.equal(s.transactions[0].dueDate,'2026-10-10');assert.equal(s.transactions[0].paymentDate,'2026-11-02');assert.equal(s.transactions[0].date,'2026-11-02');assert.equal(s.transactions[0].postedDate,'2026-09-20');
});
test('recorrência original e número de parcela preservados sem inferir parcela de um nome arbitrário',()=>{
 const parsed=S.fromExcelBook(book([row({'Descrição':'Parcela sintética 4/12','Recorrência':'Parcelada (mensal)'})]),X,names[0]);
 assert.equal(parsed.transactions[0].installments,'4/12');assert.equal(parsed.transactions[0].recurrence,'Parcelada (mensal)');
 const monthly=S.fromExcelBook(book([row({'Descrição':'Evento sintético 12/2','Recorrência':'M'})]),X,names[1]);assert.equal(monthly.transactions[0].installments,'');assert.equal(monthly.transactions[0].recurrence,'M');
});
test('transferência sem situação ou pagamento mantém ausência explícita e origem/destino',()=>{
 const t=S.fromExcelBook(book([{'Descrição':'Transferência sintética','Valor':2,'Vencimento':'2026-10-10','Origem':'Origem sintética','Destino':'Destino sintético'}]),X,names[2]).transactions[0];
 assert.equal(t.status,'Não informado');assert.equal(t.paymentDate,'');assert.equal(t.effectiveDateKnown,false);assert.equal(t.account,'Origem sintética');assert.equal(t.destination,'Destino sintético');
});
test('cabeçalhos, datas, valores e situação inválidos bloqueiam sem inventar zeros',()=>{
 for(const r of [row({'Vencimento':'2026-02-30'}),row({'Valor':''}),row({'Valor':'não monetário'}),row({'Situação':'desconhecida'}),row({'Conta':''})])assert.throws(()=>S.fromExcelBook(book([r]),X,names[0]));
 const r=row();delete r.Vencimento;assert.throws(()=>S.fromExcelBook(book([r]),X,names[0]));
});
test('completude requer confirmação e controles independentes conciliados',()=>{
 assert.throws(()=>S.fromExcelBook(book([row()]),X,names[0],{expectedCount:2,expectedTotalMinor:1000}));
 assert.throws(()=>S.fromExcelBook(book([row()]),X,names[0],{expectedCount:1,expectedTotalMinor:1001}));
 const excel=sources();excel[0].independentControl=false;assert.throws(()=>C.preview(base(),options({excel})),/independentes/);
 assert.throws(()=>C.preview(base(),options({excel:sources(),coverage:{...coverage,complete:false}})));
});
test('ocorrências distintas do mesmo texto/data são preservadas e idempotentes',()=>{
 const excel=sources([row({'Valor':10,'Observações':'Compra sintética A'}),row({'Valor':20,'Observações':'Compra sintética B'})]);
 const a=C.preview(base(),options({excel}));assert.ok(a.passed);assert.equal(a.candidate.data.transactions.length,4);
 a.candidate.data.transactions[0].privateField='conservar';const second=C.preview(a.candidate,options({excel}));assert.ok(second.passed);assert.equal(second.candidate.data.transactions[0].privateField,'conservar');assert.deepEqual(second.candidate.data.transactions.map(t=>t.id),a.candidate.data.transactions.map(t=>t.id));
});
test('ocorrências ambíguas anteriores não perdem vínculos nem metadados',()=>{
 const excel=sources(),a=C.preview(base(),options({excel})).candidate,t=a.data.transactions[0];a.data.transactions.push({...structuredClone(t),id:'another-local-id',privateField:'preservar'});
 const original=structuredClone(a),r=C.preview(a,options({excel}));assert.equal(r.passed,false);assert.deepEqual(r.candidate,original);assert.deepEqual(C.undo(r),original);
});
test('vínculos de financiamento/investimento e alterações locais MCP permanecem protegidos',()=>{
 const b=base(),source=names[0];b.data.transactions=[{id:'loan',kind:'Despesa',source,dueDate:'2026-10-10',description:'Financiamento sintético',amount:2,loanId:'loan'}, {id:'investment',kind:'Despesa',source,dueDate:'2026-10-10',description:'Investimento sintético',amount:3,investmentId:'investment'}];
 const p=packet(),remote=M.preview([],p).rows[0];remote.notes='Edição local sintética';b.data.transactions.push(remote);
 const r=C.preview(b,options({excel:sources()}));assert.equal(r.passed,false);assert.deepEqual(r.candidate,b);
});
test('adaptador MCP utiliza o mesmo modelo e recusa amostra/parcelas incompletas',()=>{
 const p=packet(),source=S.fromPacket(p);assert.equal(source.schema,'candidate-source-v1');assert.equal(source.transactions[0].kind,'Despesa');assert.equal(source.transactions[0].dueDate,'2026-10-10');
 const r=C.preview(base(),options({packet:p}));assert.ok(r.passed);assert.deepEqual(r.candidate.data.transactions[0].minhasFinancas.remoteId,'remote-synthetic');
 assert.throws(()=>S.fromPacket({...p,poc:{sampleOnly:true}}));assert.throws(()=>C.preview(base(),options({packet:{...p,poc:{sampleOnly:true}}})));
 const incomplete=structuredClone(p);incomplete.pages[0].pagination.hasMore=true;assert.throws(()=>S.fromPacket(incomplete));
});
test('volume sintético 30 mil: substituição e exportação/recuperação preservam IDs e original',()=>{
 const excel=names.map((name,i)=>({name,independentControl:true,transactions:i?[]:Array.from({length:30000},(_,j)=>({kind:'Despesa',description:'Ocorrência sintética '+j,dueDate:'2026-10-10',date:'2026-10-10',account:'Conta sintética',cashAmount:1,amount:1,status:'Pendente',notes:''})),expectedCount:i?0:30000,expectedTotalMinor:i?0:3000000}));
 const b=base(),a=C.preview(b,options({excel}));assert.ok(a.passed);assert.equal(a.candidate.data.transactions.length,30000);assert.equal(b.data.transactions.length,0);
 const recovered=JSON.parse(JSON.stringify(a.candidate)),next=C.preview(recovered,options({excel}));assert.ok(next.passed);assert.deepEqual(next.candidate.data.transactions.map(t=>t.id),a.candidate.data.transactions.map(t=>t.id));assert.deepEqual(next.undo,recovered);assert.deepEqual(next.candidate.manual,b.manual);
});
test('revisão exportada reabre sem aplicar e exige a mesma base de origem',()=>{
 const b=base(),preview=C.preview(b,options({excel:sources()})),signature=JSON.stringify({data:b.data,manual:b.manual});
 const value=JSON.parse(JSON.stringify({schema:'candidate-review-v1',sourceSignature:signature,preview}));
 const restored=C.recoverReview(value,signature);assert.equal(restored.restored,true);assert.deepEqual(restored.candidate,preview.candidate);assert.deepEqual(C.undo(restored),b);assert.equal(b.data.transactions.length,0);
 assert.throws(()=>C.recoverReview(value,'different-base'),/difere/);
 value.preview.undo.data.transactions.push({id:'not-the-original'});assert.throws(()=>C.recoverReview(value,signature),/difere/);
});
test('revisão não aceita contagens/totais injetáveis ou estruturas incompletas',()=>{
 const b=base(),p=C.preview(b,options({excel:sources()})),signature=JSON.stringify({data:b.data,manual:b.manual});
 for(const mutate of [v=>v.preview.summary.removed='<img src=x>',v=>v.preview.after[0].count='<script>',v=>delete v.preview.conflicts,v=>v.preview.operations[0].period.from='invalid']){
  const value=JSON.parse(JSON.stringify({schema:'candidate-review-v1',sourceSignature:signature,preview:p}));mutate(value);assert.throws(()=>C.recoverReview(value,signature),/Formato/);
 }
});

test('corte e seleção usam somente vencimento, inclusive parcela antiga e pagamento antecipado',()=>{
 const excel=sources([row({'Descrição':'Compra antiga 8/12','Recorrência':'Parcelada','Lançamento':'2025-01-01','Efetivação':'2026-09-20','Situação':'Efetivada'})]);
 const b=base(),a=C.preview(b,options({excel}));assert.ok(a.passed);const old=a.candidate.data.transactions[0],id=old.id;
 const changed=sources([row({'Descrição':'Compra antiga 8/12','Recorrência':'Parcelada','Valor':15,'Lançamento':'2025-01-01','Efetivação':'2026-09-20','Situação':'Efetivada'})]);
 const next=C.preview(a.candidate,options({excel:changed}));assert.ok(next.passed);assert.equal(next.candidate.data.transactions[0].id,id);assert.equal(next.candidate.data.transactions[0].amount,15);assert.equal(next.candidate.data.transactions[0].paymentDate,'2026-09-20');
 assert.deepEqual(C.preview(next.candidate,options({excel:changed})).candidate,next.candidate);
 const historical={...old,id:'historic-due',dueDate:'2026-09-30',date:'2026-11-01',paymentDate:'2026-11-01'};
 const withHistory=structuredClone(next.candidate);withHistory.data.transactions.push(historical);
 assert.ok(C.preview(withHistory,options({excel:changed})).candidate.data.transactions.some(t=>t.id==='historic-due'));
});
test('padrão são doze meses do mês de referência; histórico anterior é opt-in pelo período',()=>{
 assert.deepEqual(C.window12('2027-02-18'),{from:'2027-02-01',to:'2028-01-31',dateReference:'due'});
 const r=C.preview(base(),options({asOf:'2027-02-18',excel:sources()}));assert.equal(r.window.from,'2027-02-01');assert.equal(r.window.to,'2028-01-31');assert.equal(r.candidate.data.transactions.length,0);
 const prior=C.preview(base(),options({asOf:'2027-02-18',excel:sources(),period:{from:'2026-10-01',to:'2026-10-31'}}));assert.equal(prior.candidate.data.transactions.length,3);
 assert.throws(()=>C.preview(base(),options({excel:sources(),period:{from:'2026-09-30',to:'2026-10-31'}})));
});
test('Excel vincula a identidade remota inequívoca e preserva ID nas mudanças posteriores de valor',()=>{
 const b=C.preview(base(),options({excel:sources()})).candidate,local=b.data.transactions[0].id;
 const p=packet();p.items[0].seriesId='synthetic-series';
 const r=C.preview(b,options({packet:p}));assert.ok(r.passed);const linked=r.candidate.data.transactions[0];
 assert.equal(linked.id,local);assert.equal(linked.minhasFinancas.profileId,'synthetic');assert.equal(linked.minhasFinancas.remoteId,'remote-synthetic');assert.equal(linked.minhasFinancas.occurrenceMonth,'2026-10');assert.equal(linked.minhasFinancas.seriesId,'synthetic-series');
 const changed=packet();changed.items[0].presentationAmount=15;changed.details[0].transaction.amount=15;changed.totals.expenses.total=15;
 const next=C.preview(r.candidate,options({packet:changed}));assert.ok(next.passed);assert.equal(next.candidate.data.transactions[0].id,local);assert.equal(next.candidate.data.transactions[0].amount,15);assert.equal(next.candidate.data.transactions[0].minhasFinancas.seriesId,'synthetic-series');
 assert.deepEqual(C.preview(next.candidate,options({packet:changed})).candidate,next.candidate);
});
test('vínculo retroativo não presume igualdade quando valor/cartão/parcela divergem',()=>{
 const b=C.preview(base(),options({excel:sources()})).candidate;
 for(const mutate of [p=>{p.items[0].presentationAmount=20;p.details[0].transaction.amount=20;p.totals.expenses.total=20},p=>p.items[0].card={description:'Outro cartão'},p=>{p.details[0].transaction.installmentsCount=12;p.details[0].transaction.installmentNumber=2}]){
  const p=packet();mutate(p);const r=C.preview(b,options({packet:p}));assert.equal(r.passed,false);assert.deepEqual(r.candidate,b);
 }
});
test('dois candidatos Excel ou nova identidade remota ambígua bloqueiam associação',()=>{
 const b=C.preview(base(),options({excel:sources()})).candidate;b.data.transactions.push({...b.data.transactions[0],id:'duplicate-synthetic'});
 const r=C.preview(b,options({packet:packet()}));assert.equal(r.passed,false);assert.deepEqual(r.candidate,b);
 const first=C.preview(base(),options({packet:packet()})).candidate,p=packet();p.items[0].id=p.details[0].transaction.id='other-remote';
 assert.equal(C.preview(first,options({packet:p})).passed,false);
});
test('situação desconhecida das transferências não presume pagamento durante atualização',()=>{
 const excel=sources();excel[2].transactions[0].status='Não informado';excel[2].transactions[0].paymentDate='';excel[2].transactions[0].effectiveDateKnown=false;
 const a=C.preview(base(),options({excel}));const b=C.preview(a.candidate,options({excel}));assert.ok(b.passed);const t=b.candidate.data.transactions.find(t=>t.kind==='Transferência');assert.equal(t.status,'Não informado');assert.equal(t.paymentDate,'');assert.equal(t.effectiveDateKnown,false);
});
test('parcela numerada do Excel recebe ID remoto sem perder ID local ou gerar edição local falsa',()=>{
 const excel=sources([row({'Descrição':'Compra antiga 8/12','Recorrência':'Parcelada','Lançamento':'2025-01-01'})]);
 const b=C.preview(base(),options({excel})).candidate,id=b.data.transactions[0].id,p=packet();
 p.items[0].description='Compra antiga';p.items[0].recurrence='M';p.details[0].transaction.installmentNumber=8;p.details[0].transaction.installmentsCount=12;p.details[0].transaction.createdAt='2025-01-01';
 const r=C.preview(b,options({packet:p}));assert.ok(r.passed);assert.equal(r.candidate.data.transactions[0].id,id);assert.equal(r.candidate.data.transactions[0].installments,'8/12');
 assert.equal(M.hasLocalChanges(r.candidate.data.transactions[0]),false);assert.deepEqual(C.preview(r.candidate,options({packet:p})).candidate,r.candidate);
});
