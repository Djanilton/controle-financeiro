const test=require('node:test'),assert=require('node:assert/strict'),M=require('../minhas-financas-core.js'),C=require('../candidate-update.js');
const fixture=require('./candidate-year-fixture.cjs');
function packet(){const p=M.validate(fixture.yearPacket(55));delete p.sourcePages;const rows=p.items;p.pages=[];for(let offset=0;offset<rows.length;offset+=40){const items=rows.slice(offset,offset+40),hasMore=offset+items.length<rows.length;p.pages.push({items,pagination:{offset,limit:40,totalCount:rows.length,included:true,hasMore,nextOffset:hasMore?offset+items.length:null}})}return p}
test('pacote normalizado deve provar os registros de cada página, não somente suas contagens',()=>{
 const p=packet();assert.equal(M.validate(p).items.length,660);assert.ok(C.preview(fixture.base(),fixture.options(p)).passed);
 const changes=[
  p=>p.pages.forEach(page=>delete page.items),
  p=>p.pages.forEach(page=>{page.scope='local_consolidated_package';delete page.items}),
  p=>{const first=p.pages[0];p.pages=[first];Object.assign(first.pagination,{limit:p.items.length,hasMore:false,nextOffset:null})},
  p=>p.pages[0].items.pop(),
  p=>p.pages[0].items[1]=p.pages[0].items[0],
  p=>p.pages[0].items[0]={...p.pages[0].items[0],description:'Outro registro sintético'},
  p=>{const a=p.pages[0].items;[a[0],a[1]]=[a[1],a[0]]},
  p=>{p.items=structuredClone(p.items);p.items[0].description='Consolidado diferente das páginas'},
  p=>p.pages.push({...p.pages.at(-1),pagination:{...p.pages.at(-1).pagination,offset:p.items.length}}),
 ];
 for(const change of changes){const p=packet(),original=structuredClone(fixture.base());change(p);assert.throws(()=>C.preview(original,fixture.options(p)));assert.deepEqual(original,fixture.base())}
});
test('sourcePages conservam prova de linhas e rejeitam omissão, duplicidade ou diferença do consolidado',()=>{
 for(const change of [p=>{p.sourcePages.splice(1,1);Object.assign(p.sourcePages[0].payload.result.data.pagination,{limit:55,hasMore:false,nextOffset:null})},p=>p.sourcePages[0].payload.result.data.items.pop(),p=>p.sourcePages[0].payload.result.data.items[1]=p.sourcePages[0].payload.result.data.items[0],p=>{p.items=structuredClone(p.items);p.items[0].description='Consolidado divergente'}]){const p=fixture.yearPacket(55);change(p);assert.throws(()=>M.validate(p))}
});
test('mesma contagem e total não autorizam trocar conteúdo de uma página',()=>{
 const p=packet(),first=p.pages[0].items[0];p.pages[0].items[0]={...first,account:{description:'Outra conta sintética'}};
 assert.equal(p.pages[0].items.length,40);assert.throws(()=>M.validate(p));
});
module.exports={packet};
