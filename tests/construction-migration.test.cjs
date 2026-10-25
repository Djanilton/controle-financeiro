const test=require('node:test'),assert=require('node:assert/strict'),M=require('../construction-migration.js');
const copy=x=>structuredClone(x);
function state(updated='2026-01-01'){return {items:{documentos:[]},meta:{updated,engine:{config:{}},contractTasks:[{title:'A',status:'Pendente',updated:'2026-01-01'},{title:'B',status:'Pendente',updated:'2026-01-01'}]}}}
test('obrigações usam atualização por item, independente da ordem e do timestamp global',()=>{
 const a=state('2026-01-03'),b=state('2026-01-02');Object.assign(a.meta.contractTasks[0],{status:'Concluído',updated:'2026-01-03'});Object.assign(b.meta.contractTasks[1],{status:'Concluído',updated:'2026-01-02'});
 for(const [left,right]of [[a,b],[b,a]]){const before=JSON.stringify([left,right]),r=M.merge(left,right);assert.deepEqual(r.conflicts,[]);assert.ok(r.state.meta.contractTasks.every(x=>x.status==='Concluído'));assert.equal(JSON.stringify([left,right]),before)}
});
test('base comum permite edições em obrigações diferentes e campos diferentes do mesmo item',()=>{
 const base=state(),a=copy(base),b=copy(base);a.meta.contractTasks[0].status='Concluído';b.meta.contractTasks[1].status='Concluído';b.meta.contractTasks[0].note='Conferido';
 a.meta.contractTasksUpdated='2026-01-02';b.meta.contractTasksUpdated='2026-01-03';const r=M.merge(a,b,base);assert.deepEqual(r.conflicts,[]);assert.ok(r.state.meta.contractTasks.every(x=>x.status==='Concluído'));assert.equal(r.state.meta.contractTasks[0].note,'Conferido');assert.equal(r.state.meta.contractTasksUpdated,'2026-01-03');
});
test('alterações concorrentes no mesmo campo e versões sem data exigem revisão',()=>{
 const base=state(),a=copy(base),b=copy(base);a.meta.contractTasks[0].status='Concluído';b.meta.contractTasks[0].status='Em andamento';assert.ok(M.merge(a,b,base).conflicts.includes('meta.contractTasks.A.status'));
 assert.ok(M.merge(a,b).conflicts.includes('meta.contractTasks.A'));
});
test('IDs sobrevivem a título alterado; registro antigo só é associado a título único',()=>{
 const a=state(),b=state();a.meta.contractTasks[0].id='id-a';let r=M.merge(a,b);assert.deepEqual(r.conflicts,[]);assert.equal(r.state.meta.contractTasks.length,2);assert.equal(r.state.meta.contractTasks[0].id,'id-a');
 b.meta.contractTasks[0]={...a.meta.contractTasks[0],title:'Novo título',updated:'2026-01-02'};r=M.merge(a,b);assert.equal(r.state.meta.contractTasks.filter(x=>x.id==='id-a').length,1);assert.equal(r.state.meta.contractTasks[0].title,'Novo título');
 const ambiguous=state();ambiguous.meta.contractTasks=[{id:'one',title:'A'},{id:'two',title:'A'}];assert.ok(M.merge(ambiguous,state()).conflicts.includes('meta.contractTasks.A'));
});
test('tombstones antigos não são apagados e edição concorrente com exclusão bloqueia',()=>{
 const base=state(),a=copy(base),b=copy(base);a.meta.contractTasks.shift();a.meta.contractTaskDeleted={A:'2026-01-02'};let r=M.merge(a,b,base);assert.deepEqual(r.conflicts,[]);assert.ok(!r.state.meta.contractTasks.some(x=>x.title==='A'));assert.equal(r.state.meta.contractTaskDeleted.A,'2026-01-02');
 b.meta.contractTasks[0].status='Concluído';b.meta.contractTasks[0].updated='2026-01-03';r=M.merge(a,b,base);assert.ok(r.conflicts.includes('meta.contractTasks.A'));assert.equal(r.state.meta.contractTaskDeleted.A,'2026-01-02');
});
test('conflito sem base não substitui armazenamento ou marca legado como importado',()=>{
 const a=state(),b=state();a.meta.contractTasks[0].status='Concluído';b.meta.contractTasks[0].status='Em andamento';const raw=JSON.stringify(a),legacy=JSON.stringify(b),values=new Map([[M.STORAGE,raw],[M.LEGACY,legacy]]),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 assert.throws(()=>M.local(storage),/Conflito/);assert.equal(values.get(M.STORAGE),raw);assert.equal(values.get(M.LEGACY),legacy);assert.ok(!values.has(M.STORAGE+'-legacy-imported'));
});
test('campos privados desconhecidos na raiz são combinados sem perda de subcampos',()=>{
 const a=state('2026-01-02'),b=state('2026-01-03');a.privateExtra={oldField:{keep:true},shared:{left:1}};b.privateExtra={newField:{keep:true},shared:{right:2}};const r=M.merge(a,b);assert.deepEqual(r.conflicts,[]);assert.deepEqual(r.state.privateExtra,{oldField:{keep:true},shared:{left:1,right:2},newField:{keep:true}});
 const base=copy(a),left=copy(base),right=copy(base);left.privateExtra.shared.left=2;right.privateExtra.shared.left=3;assert.ok(M.merge(left,right,base).conflicts.includes('root.privateExtra.shared.left'));
});
