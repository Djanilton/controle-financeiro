const test=require('node:test'),assert=require('node:assert/strict'),C=require('../candidate-update.js'),F=require('./candidate-year-fixture.cjs');
test('cópia de origem, candidata e undo permanecem isolados; caminho owned usa apenas entrada privada',()=>{
 const p=F.yearPacket(),b=F.base(),before=structuredClone(b),normal=C.preview(b,F.options(p),true),privateInput=structuredClone(b),owned=C.previewOwned(privateInput,F.options(p));
 assert.deepEqual(normal,owned);assert.equal(owned.undo,privateInput);assert.notEqual(owned.candidate,privateInput);assert.notEqual(normal.undo,b);
 owned.candidate.manual.transactions[0].amount=99;owned.candidate.data.investments[0].id='synthetic-change';assert.deepEqual(privateInput,before);assert.deepEqual(b,before);
 b.manual.transactions[0].amount=55;assert.deepEqual(normal.undo,before);
});
test('recuperação owned é exclusiva do JSON recém-lido; API pública continua copiando',()=>{
 const b=F.base(),preview=C.preview(b,F.options(F.yearPacket())),signature=JSON.stringify({data:b.data,manual:b.manual}),file=JSON.stringify({schema:'candidate-review-v1',sourceSignature:signature,preview});
 const input=JSON.parse(file),safe=C.recoverReview(input,signature,true);input.preview.candidate.manual.transactions[0].amount=66;assert.notEqual(safe.candidate.manual.transactions[0].amount,66);
 const privateParsed=JSON.parse(file),owned=C.recoverReviewOwned(privateParsed,signature);assert.equal(owned.candidate,privateParsed.preview.candidate);owned.candidate.manual.transactions[0].amount=77;assert.deepEqual(owned.undo,b);
 assert.throws(()=>C.recoverReviewOwned(JSON.parse(file),'other-signature'));
});
test('atualização conserva colunas de origem anteriores além do novo snapshot MCP',()=>{
 const p=F.yearPacket(),first=C.preview(F.base(),F.options(p)),row=first.candidate.data.transactions.find(t=>t.minhasFinancas);row.sourceFields.originalExcelColumn='synthetic-original';
 const next=C.preview(first.candidate,F.options(p));assert.ok(next.passed);assert.equal(next.candidate.data.transactions.find(t=>t.id===row.id).sourceFields.originalExcelColumn,'synthetic-original');
});

test('flags JSON não podem fornecer uma vista interna previamente validada',()=>{
 const M=require('../minhas-financas-core.js'),p=F.yearPacket(),view=M.validate(p);assert.throws(()=>M.previewValidated([],structuredClone(view)),/interno/);assert.throws(()=>M.preview([], {...p,validated:true,financialSemantics:null},true),/Semântica/);
});
