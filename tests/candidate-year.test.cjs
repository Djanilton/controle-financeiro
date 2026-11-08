// Legacy package consistency remains testable, but is never snapshot evidence.
const test=require('node:test'),assert=require('node:assert/strict'),M=require('../minhas-financas-core.js'),C=require('../candidate-update.js');
const {yearPacket,base,options}=require('./candidate-year-fixture.cjs');
test('relatório legado consistente não pode substituir uma janela MCP, nem vazio',()=>{
 const p=yearPacket();assert.ok(M.validate(p));assert.throws(()=>C.preview(base(),options(p)),/OBSERVATION_CAPTURE_REQUIRED/);
});
test('validação estrutural legada mantém páginas reais, filtros invariáveis e valores explícitos',()=>{
 for(const mutate of [p=>p.sourcePages.pop(),p=>p.sourcePages.push(p.sourcePages[0]),p=>p.sourcePages[0].payload.result.data.items.pop(),p=>p.items[0].dueDate=null,p=>p.items[0].presentationAmount=null,p=>delete p.items[0].occurrenceMonth,p=>p.sourcePages[1].payload.result.data.filters.status='pending']){const p=yearPacket(55);mutate(p);assert.throws(()=>M.validate(p))}
});
test('ausência, null, desconhecido e inválido são distintos; frações não viram zero',()=>{
 assert.equal(M.fieldState({},'amount'),'ABSENT');assert.equal(M.fieldState({amount:null},'amount'),'NULL');assert.equal(M.fieldState({amount:undefined},'amount'),'UNKNOWN');assert.equal(M.fieldState({amount:'?'},'amount',Number.isFinite),'INVALID');assert.equal(M.fieldState({amount:0},'amount',Number.isFinite),'PRESENT');
 const S=require('../candidate-sources.js');for(const v of [0.00000001,0.001,NaN,Infinity,null,undefined])assert.throws(()=>S.money(v));assert.equal(S.money(0),0);
});
