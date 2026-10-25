const test=require('node:test'),assert=require('node:assert/strict'),D=require('../construction-drafts.js');
function storage(){const values=new Map();return {get length(){return values.size},key:i=>[...values.keys()][i],getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}}
const state=value=>({meta:{engine:{config:{principal:value}}},items:{documentos:[]}});
test('abas mantêm rascunhos e bases independentes mesmo após outro envio e recarga',()=>{
 const local=storage(),sa=storage(),sb=storage(),a=D.open(local,sa,{id:()=> 'a'}),b=D.open(local,sb,{id:()=> 'b'});a.remember(state(10),state(1),true);b.remember(state(20),state(1),true);a.remember(state(10),state(10),false);
 const reloaded=D.open(local,sb,{id:()=> 'unused'});assert.equal(reloaded.read().state.meta.engine.config.principal,20);assert.equal(reloaded.read().base.meta.engine.config.principal,1);assert.equal(D.pending(local).length,1);
});
test('recuperação conserva o rascunho atual e a cópia de origem',()=>{
 const local=storage(),a=D.open(local,storage(),{id:()=> 'a'});let next=0;const b=D.open(local,storage(),{id:()=> 'b'+next++});a.remember(state(10),state(1),true);b.remember(state(20),state(1),true);const r=b.recover(a.key,state(20),state(1),true);assert.equal(r.state.meta.engine.config.principal,10);assert.ok(D.pending(local).some(x=>x.state.meta.engine.config.principal===20));assert.ok(a.read());
});
test('nova aba com sessionStorage clonado recebe identidade distinta sem apagar pendência',()=>{
 const local=storage(),session=storage(),a=D.open(local,session,{id:()=> 'a'});a.remember(state(10),null,true);const b=D.open(local,session,{id:()=> 'b',reuse:false});assert.notEqual(a.key,b.key);assert.equal(b.read(),null);assert.equal(D.pending(local).length,1);
});
