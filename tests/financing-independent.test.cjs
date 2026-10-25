const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const E=require('../sac-engine.js'),{fixture}=require('./construction-fixture.cjs');
function verify(config,options,result=E.calculate(config,options)){
 const run=spawnSync(process.env.PYTHON||'python3',[path.join(__dirname,'../tools/validate_financing.py')],{input:JSON.stringify({config,options,result}),encoding:'utf8',timeout:10000,killSignal:'SIGKILL'});
 assert.ifError(run.error);assert.equal(run.status,0,run.stdout||run.stderr);return JSON.parse(run.stdout);
}
test('reconstrução independente confere SAC, obra, TR, FGTS, PLR e amortizações em 413 meses',()=>{
 for(const strategy of ['CDB','Finan','Equilibrado'])for(const constructionMonths of [0,12]){
  const c={...fixture(),strategy,constructionMonths,currentFunds:true,landPaid:200000,paidContractorTotal:184000,investments:100000,bankBalances:{sofisa:80000,itau:20000},projectionStart:'2020-01',projectionAsOfDate:'2020-01-15',skipCurrentUndatedInflows:true};
  c.fgtsProjection={asOfDate:'2020-01-15',paid:{},initialPaid:{},balances:Object.fromEntries(c.dates.map((d,i)=>[d,80000+i*1200]))};
  const options={programs:[{tipo:'extra',valor:200,inicio:1,fim:36},{tipo:'amortizacao',valor:500,inicio:1,fim:36}],expenses:[]};
  const r=verify(c,options);assert.equal(r.months,413);assert.ok(r.checked>5000);
 }
});
test('validador independente detecta desvio de juros e insuficiência ocultada',()=>{
 const c={...fixture(),currentFunds:true,investments:0,landPaid:200000,paidContractorTotal:184000,salaryFirst:0,salaryLater:0,plr:0},options={expenses:[]},r=E.calculate(c,options);r.sac[3].E+=1;assert.throws(()=>verify(c,options,r));
 const cash=E.calculate(c,options),row=cash.cash.find(x=>x.unfunded>0);assert.ok(row);row.unfunded=0;assert.throws(()=>verify(c,options,cash));
});
test('validador independente confere excedentes de amortização e detecta entrada perdida',()=>{
 const c={...fixture(),principal:1000,currentFunds:true,investments:100000,landPaid:200000,paidContractorTotal:184000,plr:0},options={expenses:[],programs:[{tipo:'amortizacao',valor:100000,inicio:1,fim:2}]},r=E.calculate(c,options);verify(c,options,r);r.cash[0].G-=100;r.cash[0].I-=100;assert.throws(()=>verify(c,options,r));
});
