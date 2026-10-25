const test=require('node:test'),assert=require('node:assert/strict'),E=require('../sac-engine.js'),{fixture}=require('./construction-fixture.cjs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function config(){return {...fixture(),principal:1000,currentFunds:true,investments:100000,landPaid:200000,paidContractorTotal:184000,plr:0}}
test('amortização programada excedente ou após quitação permanece na reserva',()=>{
 const c=config(),r=E.calculate(c,{expenses:[],programs:[{tipo:'amortizacao',valor:100000,inicio:1,fim:2}]});
 close(r.sac[0].K+r.cash[0].G,100000);assert.equal(r.sac[0].M,0);assert.equal(r.sac[1].K,0);assert.equal(r.cash[1].G,100000);
});
test('FGTS quita antes da PLR; a PLR sem uso retorna integralmente e FGTS não vira caixa',()=>{
 const c={...config(),principal:10000,strategy:'Misto',plrDebtShare:.5,plr:1000,plrCashFactor:1};
 c.dates=c.dates.map((_,i)=>new Date(Date.UTC(2020,4+i,1)).toISOString().slice(0,7));c.fgtsProjection={asOfDate:'2020-05-01',balances:Object.fromEntries(c.dates.map(d=>[d,1000000])),paid:{},initialPaid:{}};
 const r=E.calculate(c,{expenses:[]}),i=23;assert.equal(r.sac[i].M,0);close(r.expenseTimeline[i].fgts,r.sac[i].K);assert.equal(r.cash[i].plrToDebt,0);assert.equal(r.cash[i].plrToReserve,1000);assert.equal(r.cash[i].G,1000);assert.ok(r.expenseTimeline[i].fgtsRemaining>0);assert.equal(r.expenseTimeline[i].plr,1000);
});
test('PLR Finan excedente e eventos posteriores à quitação permanecem na reserva',()=>{
 const c={...config(),strategy:'Finan',plr:100000,plrCashFactor:1,biennialFgts:0},r=E.calculate(c,{expenses:[]}),i=11;
 assert.equal(r.sac[i].M,0);close(r.cash[i].plrToDebt+r.cash[i].plrToReserve,100000);assert.ok(r.cash[i].plrToReserve>0);assert.equal(r.cash[23].plrToReserve,100000);assert.equal(r.cash[23].plrToDebt,0);
});
test('FGTS, PLR e amortização coincidentes não somam a mesma redução duas vezes',()=>{
 const c={...config(),principal:10000,strategy:'Finan',plr:1000,biennialFgts:5000},r=E.calculate(c,{expenses:[],programs:[{tipo:'amortizacao',valor:50000,inicio:24,fim:24}]}),i=23,fgts=r.expenseTimeline[i].fgts,plr=r.cash[i].plrToDebt,programApplied=r.sac[i].K-fgts-plr;
 close(programApplied+r.cash[i].G-r.cash[i].plrToReserve,50000);close(plr+r.cash[i].plrToReserve,1000);close(fgts+plr+programApplied,r.sac[i].K);assert.ok(programApplied>=0);assert.equal(r.sac[i].M,0);
});
