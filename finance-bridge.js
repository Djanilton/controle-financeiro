/* Current balances come from the ledger, never from the paid-only subset. */
(function(root){
'use strict';
const KEY='controle-financeiro-saldos-obra-v1',SCHEMA='ledger-daily-v2';
function valid(s){return s?.version===2&&s.sourceSchema===SCHEMA&&/^\d{4}-\d{2}-\d{2}$/.test(s.asOfDate)&&['sofisa','itau'].every(k=>Number.isFinite(s.balances?.[k])&&s.balances[k]>=0)&&Number.isFinite(Date.parse(s.updatedAt))}
function fromLedger(core,tx,initial,asOfDate,meta={}){
 const accounts=new Set([...tx.flatMap(x=>[x.account,x.destination]),...initial.map(x=>x.account)].filter(Boolean).map(core.normalize));
 if(!['Sofisa','Investimento Itaú'].every(x=>accounts.has(core.normalize(x))))throw Error('Importe a base completa com Sofisa e Investimento Itaú; saldos ausentes não são zero.');
 const names=['Sofisa','Investimento Itaú'],rows=core.dailyBalances(tx,initial,asOfDate.slice(0,7),names).filter(x=>x.date===asOfDate),balances={};
 for(const [i,key]of ['sofisa','itau'].entries()){const row=rows.find(x=>core.normalize(x.account)===core.normalize(names[i]));if(!row)throw Error('Saldo de '+names[i]+' não carregado.');balances[key]=Math.round(row.closing*100)/100}
 const paid=tx.filter(x=>x.kind==='Despesa'&&/financiamento.*(?:caixa|casa)|caixa.*financiamento/.test(core.normalize(x.description))&&/\/\s*(12|401|411)\b/.test(x.installments+' '+x.description)&&x.paymentDate&&x.paymentDate<=asOfDate&&x.paymentDate.slice(0,7)===asOfDate.slice(0,7));
 const s={version:2,sourceSchema:SCHEMA,asOf:asOfDate.slice(0,7),asOfDate,balances,paidInstallmentCurrent:paid.reduce((a,x)=>a+Number(x.amount||0),0),updatedAt:meta.updatedAt||new Date().toISOString(),account:meta.account||null,sourceImportedAt:meta.sourceImportedAt||null,source:'Controle Financeiro — saldos calculados até a data de referência'};
 if(!valid(s))throw Error('Os saldos das aplicações precisam ser conferidos; nenhum saldo negativo será tratado como capital disponível.');return s;
}
function apply(c,s){if(!valid(s))throw Error('Importe os saldos atuais das duas aplicações. O saldo antigo compartilhado não é uma origem válida.');return {...c,investments:s.balances.sofisa+s.balances.itau,bankBalances:{...s.balances},projectionStart:s.asOf,projectionAsOfDate:s.asOfDate,paidInstallmentCurrent:s.paidInstallmentCurrent||0,investmentSourceUpdated:s.updatedAt,currentFunds:true,skipCurrentUndatedInflows:true}}
root.ObraFinanceBridge={valid,fromLedger,apply,KEY,SCHEMA};
if(typeof module!=='undefined'){module.exports=root.ObraFinanceBridge;return}
if(typeof data==='undefined')return;
let ledgerRows=null,ledgerInitial=null,ledgerDate=null,current=null;
function controlSnapshot(){
 const date=new Date().toLocaleDateString('sv-SE'),rows=allTransactions(),initial=data.initialBalances||[];
 if(ledgerRows===rows&&ledgerInitial===initial&&ledgerDate===date)return current;
 try{const next=fromLedger(FinanceCore,rows,initial,date,{account:user?.username,sourceImportedAt:data.sources?.map(x=>x.importedAt).sort().at(-1)});
 const raw=localStorage.getItem(KEY);let old;try{old=JSON.parse(raw||'null')}catch{}
 if(old&&!valid(old)&&!localStorage.getItem(KEY+'-backup-anterior'))localStorage.setItem(KEY+'-backup-anterior',raw);
 if(valid(old)&&old.asOfDate===next.asOfDate&&JSON.stringify(old.balances)===JSON.stringify(next.balances)&&old.paidInstallmentCurrent===next.paidInstallmentCurrent&&old.account===next.account)next.updatedAt=old.updatedAt;
 localStorage.setItem(KEY,JSON.stringify(next));current=next;delete data.financialBridgeError;
 }catch(e){current=null;data.financialBridgeError=e.message}
 ledgerRows=rows;ledgerInitial=initial;ledgerDate=date;return current;
}
root.ObraFinanceBridge.controlSnapshot=controlSnapshot;
const previousResult=constructionResult;
constructionResult=function(){const snapshot=controlSnapshot(),p=projectState();if(!p?.meta?.engine?.config)return previousResult();const key=snapshot?.updatedAt+'|'+p.meta.updated+'|'+p.meta.settingsUpdated;if(constructionCache?.unifiedKey===key)return constructionCache.result;
 const result=ConstructionFinance.calculate(p,MinhaObraEngine,snapshot?apply({},snapshot):{});result.funding.sourceAvailable=!!snapshot;result.funding.sourceSnapshot=snapshot;constructionCache={unifiedKey:key,result};return result};
const previousInit=init;init=async function(){await previousInit();controlSnapshot()};
const previousImport=mergeImport;mergeImport=function(mapped,replace){previousImport(mapped,replace);ledgerRows=null;ledgerInitial=null;current=null;};
window.addEventListener('focus',()=>{ledgerRows=null;controlSnapshot()});
})(typeof globalThis!=='undefined'?globalThis:this);
