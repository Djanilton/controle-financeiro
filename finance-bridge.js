/* Current balances come from the ledger, never from the paid-only subset. */
(function(root){
'use strict';
const KEY='controle-financeiro-saldos-obra-v1',SCHEMA='ledger-daily-v2';
function valid(s){return s?.version===2&&s.sourceSchema===SCHEMA&&/^\d{4}-\d{2}-\d{2}$/.test(s.asOfDate)&&['sofisa','itau'].every(k=>Number.isFinite(s.balances?.[k])&&s.balances[k]>=0)&&Number.isFinite(Date.parse(s.updatedAt))}
function bankForecast(core,tx,asOfDate,costs=[]){const result={},bank=a=>({'sofisa':'sofisa','investimento itau':'itau'}[core.normalize(a)]),covered=costs.map(x=>core.normalize(x.name)).filter(x=>x.length>=4);for(const t of tx){const date=t.dueDate||t.date||'',a=bank(t.account),b=bank(t.destination);if(date<=asOfDate||!a&&!b)continue;const text=core.normalize([t.description,t.category].join(' ')),modeled=/financiamento.*(?:caixa|casa)|caixa.*financiamento|construcao.*(?:casa|etapa)|construtora|\bplr\b/.test(text)||t.kind==='Despesa'&&covered.some(x=>text.includes(x));if(modeled||t.kind==='Receita'&&/rendimento|rentabilidade|juros/.test(text))continue;const m=date.slice(0,7),row=result[m]??={sofisa:{income:null,inflow:0,outflow:0},itau:{income:null,inflow:0,outflow:0},internal:[]},amount=Number(t.cashAmount??t.amount)||0;if(t.kind==='Transferência'){if(a&&b)row.internal.push({from:a,to:b,amount});else{if(a)row[a].outflow+=amount;if(b)row[b].inflow+=amount}}else if(a&&t.kind==='Receita'){if(/rendimento|rentabilidade|juros/.test(text))row[a].income=(row[a].income??0)+amount;else row[a].inflow+=amount}else if(a&&t.kind==='Despesa')row[a].outflow+=amount}return result}
function fromLedger(core,tx,initial,asOfDate,meta={}){
 const accounts=new Set([...tx.flatMap(x=>[x.account,x.destination]),...initial.map(x=>x.account)].filter(Boolean).map(core.normalize));
 if(!['Sofisa','Investimento Itaú'].every(x=>accounts.has(core.normalize(x))))throw Error('Importe a base completa com Sofisa e Investimento Itaú; saldos ausentes não são zero.');
 const names=['Sofisa','Investimento Itaú'],rows=core.dailyBalances(tx,initial,asOfDate.slice(0,7),names).filter(x=>x.date===asOfDate),balances={};
 for(const [i,key]of ['sofisa','itau'].entries()){const row=rows.find(x=>core.normalize(x.account)===core.normalize(names[i]));if(!row)throw Error('Saldo de '+names[i]+' não carregado.');balances[key]=Math.round(row.closing*100)/100}
 const paid=tx.filter(x=>x.kind==='Despesa'&&/financiamento.*(?:caixa|casa)|caixa.*financiamento/.test(core.normalize(x.description))&&/\/\s*(12|401|411)\b/.test(x.installments+' '+x.description)&&x.paymentDate&&x.paymentDate<=asOfDate&&x.paymentDate.slice(0,7)===asOfDate.slice(0,7));
 const s={version:2,sourceSchema:SCHEMA,asOf:asOfDate.slice(0,7),asOfDate,balances,bankForecast:bankForecast(core,tx,asOfDate,meta.provisionedCosts||[]),paidInstallmentCurrent:paid.reduce((a,x)=>a+Number(x.amount||0),0),updatedAt:meta.updatedAt||new Date().toISOString(),account:meta.account||null,sourceImportedAt:meta.sourceImportedAt||null,source:'Controle Financeiro — saldos calculados até a data de referência'};
 if(meta.fgtsProjection!==undefined)s.fgtsProjection=meta.fgtsProjection;
 if(!valid(s))throw Error('Os saldos das aplicações precisam ser conferidos; nenhum saldo negativo será tratado como capital disponível.');return s;
}
function fgtsProjection(model,core,tx,tables,asOfDate,to){
 const asOf=asOfDate.slice(0,7),paid={},initialPaid={};
 const isFgts=t=>core.normalize(t.account)==='fgts'&&['Despesa','Transferência'].includes(t.kind),initial=t=>/construtora|construcao|obra/.test(core.normalize(t.description))&&!/amortiz/.test(core.normalize(t.description)),loan=t=>/amortiz/.test(core.normalize(t.description))||/financiamento/.test(core.normalize(t.description))&&!initial(t),date=t=>t.paymentDate||t.dueDate||t.date||'';
 for(const t of tx.filter(t=>isFgts(t)&&date(t)<=asOfDate)){const m=date(t).slice(0,7),amount=Math.max(0,Number(t.cashAmount??t.amount)||0);if(loan(t))paid[m]=(paid[m]||0)+amount;else if(initial(t))initialPaid[m]=(initialPaid[m]||0)+amount}
 const forecast=tx.filter(t=>!(isFgts(t)&&date(t)>asOfDate&&(loan(t)||initial(t))));
 const rows=model.benefitMonthly('FGTS',tables,asOf,to,asOf,forecast),balances=Object.fromEntries(rows.filter(x=>x.available&&Number.isFinite(x.closing)).map(x=>[x.month,x.closing]));
 return {asOfDate,balances,paid,initialPaid,sourceAvailable:Object.keys(balances).length>0};
}
function apply(c,s){if(!valid(s))throw Error('Importe os saldos atuais das duas aplicações. O saldo antigo compartilhado não é uma origem válida.');return {...c,investments:s.balances.sofisa+s.balances.itau,bankBalances:{...s.balances},bankForecast:s.bankForecast||{},...(s.fgtsProjection?{fgtsProjection:s.fgtsProjection}:{}),projectionStart:s.asOf,projectionAsOfDate:s.asOfDate,paidInstallmentCurrent:s.paidInstallmentCurrent||0,investmentSourceUpdated:s.updatedAt,currentFunds:true,skipCurrentUndatedInflows:true}}
root.ObraFinanceBridge={valid,fromLedger,apply,bankForecast,fgtsProjection,KEY,SCHEMA};
if(typeof module!=='undefined'){module.exports=root.ObraFinanceBridge;return}
if(typeof data==='undefined')return;
let ledgerRows=null,ledgerInitial=null,ledgerDate=null,ledgerCosts=null,ledgerFgts=null,current=null;
function controlSnapshot(){
 const date=new Date().toLocaleDateString('sv-SE'),rows=allTransactions(),initial=data.initialBalances||[],state=typeof projectState==='function'?projectState():null,costs=state?ConstructionFinance.ownCosts(state):[],costKey=JSON.stringify(costs.map(x=>[x.name,x.planned,x.paid])),fgtsTo=state?.meta?.engine?.config?.dates?.at(-1)?.slice(0,7)||'2061-12',fgtsKey=JSON.stringify([data.sourceTables?.FGTS||[],fgtsTo]);
 if(ledgerRows===rows&&ledgerInitial===initial&&ledgerDate===date&&ledgerCosts===costKey&&ledgerFgts===fgtsKey)return current;
 try{const next=fromLedger(FinanceCore,rows,initial,date,{fgtsProjection:fgtsProjection(FinancialModel,FinanceCore,rows,data.sourceTables||{},date,fgtsTo),account:user?.username,provisionedCosts:costs,sourceImportedAt:data.sources?.map(x=>x.importedAt).sort().at(-1)});
 const raw=localStorage.getItem(KEY);let old;try{old=JSON.parse(raw||'null')}catch{}
 if(old&&!valid(old)&&!localStorage.getItem(KEY+'-backup-anterior'))localStorage.setItem(KEY+'-backup-anterior',raw);
 if(valid(old)&&old.asOfDate===next.asOfDate&&JSON.stringify(old.balances)===JSON.stringify(next.balances)&&JSON.stringify(old.bankForecast)===JSON.stringify(next.bankForecast)&&old.paidInstallmentCurrent===next.paidInstallmentCurrent&&old.account===next.account&&JSON.stringify(old.fgtsProjection)===JSON.stringify(next.fgtsProjection))next.updatedAt=old.updatedAt;
 localStorage.setItem(KEY,JSON.stringify(next));current=next;delete data.financialBridgeError;
 }catch(e){current=null;data.financialBridgeError=e.message}
 ledgerRows=rows;ledgerInitial=initial;ledgerDate=date;ledgerCosts=costKey;ledgerFgts=fgtsKey;return current;
}
root.ObraFinanceBridge.controlSnapshot=controlSnapshot;
const previousResult=constructionResult;
constructionResult=function(){const snapshot=controlSnapshot(),p=projectState();if(!p?.meta?.engine?.config)return previousResult();const key=snapshot?.updatedAt+'|'+JSON.stringify(snapshot?.fgtsProjection)+'|'+p.meta.updated+'|'+p.meta.settingsUpdated;if(constructionCache?.unifiedKey===key)return constructionCache.result;
 const result=ConstructionFinance.calculate(p,MinhaObraEngine,snapshot?apply({},snapshot):{});result.funding.sourceAvailable=!!snapshot;result.funding.sourceSnapshot=snapshot;constructionCache={unifiedKey:key,result};return result};
const previousInit=init;init=async function(){await previousInit();controlSnapshot()};
const previousImport=mergeImport;mergeImport=function(mapped,replace){previousImport(mapped,replace);ledgerRows=null;ledgerInitial=null;current=null;};
window.addEventListener('focus',()=>{ledgerRows=null;controlSnapshot()});
})(typeof globalThis!=='undefined'?globalThis:this);
