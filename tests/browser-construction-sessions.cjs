const test=require('node:test'),assert=require('node:assert/strict'),{start}=require('./construction-browser-harness.cjs');
test('duas abas preservam rascunho na recarga e combinam edições independentes',async()=>{
 const h=await start();try{const a=await h.session(),b=await h.session({context:a.context});
  await b.frame.locator('#engineParams [name=area]').fill('250');assert.equal(await b.frame.evaluate(()=>dirty),true);
  await a.frame.locator('#engineParams [name=principal]').fill('350000');await a.frame.evaluate(()=>saveCloud());assert.equal(h.remote().meta.engine.config.principal,350000);
  await b.page.reload();const reloaded=await h.session({page:b.page});assert.equal(await reloaded.frame.locator('#engineParams [name=area]').inputValue(),'250');assert.equal(await reloaded.frame.evaluate(()=>dirty),true);assert.equal(await reloaded.page.evaluate(()=>projectState().meta.engine.config.area),250);
  await reloaded.frame.evaluate(()=>saveCloud());assert.equal(h.remote().meta.engine.config.principal,350000);assert.equal(h.remote().meta.engine.config.area,250);assert.equal(await reloaded.frame.evaluate(()=>dirty),false);assert.deepEqual(h.errors,[]);
 }finally{await h.close()}
});
test('sessões independentes bloqueiam conflito no mesmo campo sem sobrescrever a nuvem',async()=>{
 const h=await start();try{const a=await h.session(),b=await h.session();await a.frame.locator('#engineParams [name=principal]').fill('350000');await b.frame.locator('#engineParams [name=principal]').fill('360000');await a.frame.evaluate(()=>saveCloud());const backups=h.backups.length;await b.frame.evaluate(()=>saveCloud());assert.equal(h.remote().meta.engine.config.principal,350000);assert.equal(h.backups.length,backups);assert.equal(await b.frame.evaluate(()=>dirty),true);assert.match(await b.frame.locator('#toast').innerText(),/Conflito/);assert.equal(await b.frame.locator('#engineParams [name=principal]').inputValue(),'360000');assert.deepEqual(h.errors,[]);
 }finally{await h.close()}
});
test('rascunho de aba fechada pode ser recuperado sem apagar cópias anteriores',async()=>{
 const h=await start();try{const a=await h.session(),b=await h.session({context:a.context});await b.frame.locator('#engineParams [name=principal]').fill('360000');await b.page.close();
  await a.frame.locator('#engineParams [name=principal]').fill('350000');await a.frame.evaluate(()=>saveCloud());await a.frame.evaluate(()=>{tab='config';render()});const recover=a.frame.getByRole('button',{name:'Recuperar cópia',exact:true});assert.ok(await recover.count());await recover.first().click();assert.equal(await a.frame.evaluate(()=>state.meta.engine.config.principal),360000);assert.equal(await a.frame.evaluate(()=>dirty),true);assert.ok(await a.frame.evaluate(()=>draftSession.pending().length)>=2);assert.equal(h.remote().meta.engine.config.principal,350000);assert.deepEqual(h.errors,[]);
 }finally{await h.close()}
});
