/* Bank cash-flow reconciliation using the existing construction/SAC results.
   This module never recalculates debt or writes financial records. */
(function(root){
'use strict';
const C=root.FinanceCore||(typeof require==='function'?require('./app-core.js'):null),M=root.FinancialModel||(typeof require==='function'?require('./financial-model.js'):null);
const banks=['Sofisa','Investimento Itaú','Itaú'],date=t=>t.dueDate||t.date||'',amount=t=>Number(t.cashAmount??t.amount)||0,month=t=>date(t).slice(0,7),key=a=>banks.find(n=>C.normalize(n)===C.normalize(a));
function project({transactions,initial=[],tables={},positions=[],loanPositions=null,result,asOfDate,to}){
 const anchor=asOfDate.slice(0,7),actual=transactions.filter(t=>date(t)<=asOfDate),linked=new Set(M.financingTransactions(transactions)),cash=new Map(result.cash.map(x=>[x.A,x])),sac=new Map(result.sac.map(x=>[x.A,x])),events=new Map((result.expenseTimeline||[]).map(x=>[x.month,x]));
 const financingIncome=t=>t.kind==='Receita'&&/financiamento.*(?:caixa|casa)|caixa.*(?:medicao|liberacao)/.test(C.normalize(t.description));
 const contractor=t=>t.kind==='Despesa'&&/construtora|construcao casa nova/.test(C.normalize(t.description));
 const furniture=t=>result.deferred>0&&t.kind==='Despesa'&&/moveis|eletrodomesticos/.test(C.normalize(t.description));
 const yieldIncome=t=>t.kind==='Receita'&&['Sofisa','Investimento Itaú'].includes(key(t.account))&&/rendimento|rentabilidade|juros/.test(C.normalize([t.description,t.category].join(' ')));
 const plans=transactions.filter(t=>date(t)>asOfDate&&month(t)<=to&&!linked.has(t)&&!financingIncome(t)&&!contractor(t)&&!furniture(t)&&!yieldIncome(t));
 const byMonth=new Map();for(const t of plans){const a=byMonth.get(month(t))||[];a.push(t);byMonth.set(month(t),a)}
 const canonical=actual.map(t=>({...t})),flows=[],balance={};for(const name of banks)balance[name]=C.balanceRows(actual,initial,{from:anchor,to:anchor}).find(x=>C.normalize(x.account)===C.normalize(name))?.closing||0;
 const stages=new Map();let paidOwn=Math.max(0,result.funding?.constructorAlreadyPaid||0);
 for(const stage of result.schedule||[]){const covered=Math.min(paidOwn,Math.max(0,stage.own||0));paidOwn-=covered;const own=Math.max(0,(stage.own||0)-covered);if(stage.month<anchor&&!own)continue;const m=stage.month<anchor?anchor:stage.month,row=stages.get(m)||{own:0,fgts:0,caixa:0,covered:0};row.own+=own;row.covered+=covered;if(stage.month>=anchor){row.fgts+=stage.fgts||0;row.caixa+=stage.caixa||0}stages.set(m,row)}
 let pending=0,fgtsUsed=0,serial=0;
 const positionIndex=new Map(positions.map(x=>[x.institution+'|'+x.month,x])),fgtsSource=result.funding?.sourceSnapshot?.fgtsProjection;
 for(const m of M.months(anchor,to)){
  const s=sac.get(m),r=cash.get(m),stage={...(stages.get(m)||{own:0,fgts:0,caixa:0,covered:0})},flow={month:m,caixa:0,fgts:0,sofisa:0,itau:0,contractor:0,installment:0,uncovered:0,earnings:{},remainingSalary:Math.max(0,r?.salaryLimit??r?.F??0)},day=m===anchor?asOfDate:m+'-01';
  const emit=(kind,account,value,description,destination='',paid=value)=>{if(value<=.0000001)return;canonical.push({id:'projection-patrimony-'+(++serial),kind,account,destination,description,date:day,dueDate:day,amount:value,cashAmount:paid,considerExpense:kind==='Despesa'?'Sim':'',projection:true});};
  const credit=(account,value,description)=>{if(value<=0)return;balance[account]+=value;emit('Receita',account,value,description)};
  const resgate=need=>{let got=0;for(const [name,field]of [['Sofisa','sofisa'],['Investimento Itaú','itau']]){const value=Math.min(Math.max(0,need-got),Math.max(0,balance[name]));if(value){balance[name]-=value;balance.Itaú+=value;flow[field]+=value;got+=value;emit('Transferência',name,value,'Resgate para pagamentos previstos','Itaú')}}return got};
  // Bank balance already includes salary/other receipts. Spend it first, rescue only
  // the shortage. The reserve's salary contribution cap is not a cap on owned cash.
  const expense=(account,value,description)=>{value=Math.max(0,value);if(banks.includes(account))account='Itaú';if(account==='Itaú')resgate(Math.max(0,value-balance.Itaú));const paid=Math.min(value,Math.max(0,balance[account]||0));balance[account]=(balance[account]||0)-paid;flow.uncovered+=value-paid;emit('Despesa',account,value,description,'',paid);return paid};
  for(const [name,institution]of [['Sofisa','Sofisa'],['Investimento Itaú','Itaú']]){const p=positionIndex.get(institution+'|'+m),days=new Date(Number(m.slice(0,4)),Number(m.slice(5,7)),0).getDate(),fraction=m===anchor?(days-Number(asOfDate.slice(8,10)))/days:1,rate=p?.monthlyRate;if(!Number.isFinite(rate))throw Error('CDI não disponível para '+institution+' em '+m);const income=Math.max(0,balance[name])*(Math.pow(1+rate,fraction)-1);flow.earnings[name]=income;credit(name,income,'Rendimento calculado pelo CDI previsto')}
  const tx=byMonth.get(m)||[];
  for(const t of tx.filter(t=>t.kind==='Receita')){const account=key(t.account);if(account)balance[account]+=amount(t);canonical.push({...t})}
  for(const t of tx.filter(t=>t.kind==='Transferência')){const source=key(t.account),dest=key(t.destination);let value=amount(t);if(source){value=Math.min(value,Math.max(0,balance[source]));balance[source]-=value}if(dest)balance[dest]+=value;if(dest==='Itaú'&&source==='Sofisa')flow.sofisa+=value;if(dest==='Itaú'&&source==='Investimento Itaú')flow.itau+=value;canonical.push({...t,amount:value,cashAmount:value})}
  // Actual payments and credits in the current month remain authoritative.
  const currentActual=m===anchor?actual.filter(t=>month(t)===m):[],actualContractor=currentActual.filter(contractor).reduce((v,t)=>v+amount(t),0),actualRelease=currentActual.filter(financingIncome).reduce((v,t)=>v+amount(t),0);
  flow.actualLoan=currentActual.filter(t=>linked.has(t)).reduce((v,t)=>v+amount(t),0);
  for(const t of currentActual.filter(t=>t.kind==='Transferência'&&key(t.destination)==='Itaú')){if(key(t.account)==='Sofisa')flow.sofisa+=amount(t);if(key(t.account)==='Investimento Itaú')flow.itau+=amount(t)}
  let alreadyPaid=Math.max(0,actualContractor-stage.covered);for(const source of ['own','fgts','caixa']){const used=Math.min(alreadyPaid,stage[source]);stage[source]-=used;alreadyPaid-=used}
  flow.caixa=Math.max(0,(s?.release||0)-actualRelease);credit('Itaú',flow.caixa,'Medição Caixa — cronograma do financiamento');
  flow.fgtsBefore=fgtsUsed;
  const requestedFgts=events.get(m)?.fgtsPending??events.get(m)?.fgts??0,fgtsBase=fgtsSource?fgtsSource.balances[m]:positionIndex.get('FGTS|'+m)?.closing;
  const fgtsBalance=Math.max(0,(fgtsBase||0)-fgtsUsed),fgtsInitial=Math.min(stage.fgts,fgtsBalance),fgtsDebt=Math.min(requestedFgts,Math.max(0,fgtsBalance-fgtsInitial));
  if(fgtsInitial){balance.Itaú+=fgtsInitial;emit('Transferência','FGTS',fgtsInitial,'FGTS inicial para construtora','Itaú')}flow.fgts=fgtsInitial;fgtsUsed+=fgtsInitial+fgtsDebt;
  if(fgtsDebt)emit('Despesa','FGTS',fgtsDebt,'Amortização do financiamento com FGTS');
  flow.uncovered+=Math.max(0,requestedFgts-fgtsDebt);
  const contractorTotal=stage.own+stage.fgts+stage.caixa;flow.contractor=contractorTotal+actualContractor;
  // Stage credits and existing bank cash pay first; only the shortage is rescued.
  expense('Itaú',contractorTotal,'Pagamento construtora — cronograma');
  flow.installment=Math.max(0,r?.H??s?.L??0);expense('Itaú',flow.installment,'Parcela do financiamento — motor SAC');
  const extra=Math.max(0,(s?.K||0)-(events.get(m)?.fgts||0));expense('Itaú',extra,'Amortização extraordinária — motor SAC');
  expense('Itaú',r?.deferredPayment||0,'Móveis e eletrodomésticos — parcela após obra');
  for(const t of tx.filter(t=>t.kind==='Despesa')){const account=key(t.account);if(account){if(amount(t)<0){balance[account]-=amount(t);canonical.push({...t});continue}const before=canonical.length;expense(account,amount(t),t.description);const record=canonical.at(-1);if(canonical.length>before&&record.kind==='Despesa'){record.considerExpense=t.considerExpense??'Sim';record.category=t.category;record.originalId=t.id}}else canonical.push({...t})}
  pending+=flow.uncovered;flow.pending=pending;flow.fgtsUsed=fgtsUsed;flow.caixa+=actualRelease;flow.bankClosing={...balance};flows.push(flow);
 }
 const balances=C.balanceRows(canonical,initial,{from:anchor,to}),index=new Map(balances.map(x=>[C.normalize(x.account)+'|'+x.month,x])),flowIndex=new Map(flows.map(x=>[x.month,x]));
 for(const flow of flows)for(const name of banks){const closing=index.get(C.normalize(name)+'|'+flow.month)?.closing??0;if(Math.abs(closing-flow.bankClosing[name])>.005)throw Error('Movimentos e saldo não reconciliados: '+name+' em '+flow.month)}
 const investments=positions.map(p=>{if(p.month<anchor)return p;const f=flowIndex.get(p.month);if(!f)return p;if(p.institution==='FGTS'){const d=new Date(p.month+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()-1);const opening=fgtsSource?.balances[d.toISOString().slice(0,7)]??p.opening,closing=fgtsSource?fgtsSource.balances[p.month]:p.closing;return {...p,opening:opening==null?null:opening-f.fgtsBefore,closing:closing==null?null:Math.max(0,closing-f.fgtsUsed)}}const name=p.institution==='Itaú'?'Investimento Itaú':p.institution==='Sofisa'?'Sofisa':null;if(!name)return p;const row=index.get(C.normalize(name)+'|'+p.month);return row?{...p,...row,institution:p.institution,earnings:row.income,phase:'Projeção bancária vinculada à obra'}:p});
 const releasedLoans=result.sac.map(s=>({month:s.A,opening:s.C,closing:s.M,installment:s.L,phase:s.phase,release:s.release}));
 // Same contracted-debt presentation already used in Empréstimos. No second SAC.
 const loans=loanPositions||(Number.isFinite(result.parameters?.H3)?M.presentLoanRows(releasedLoans,{principal:result.parameters.H3},transactions,anchor):releasedLoans);
 const rows=M.summaryRows(canonical,initial,tables,investments,loans,anchor,to),expenseTotals=new Map();for(const t of canonical)if(t.kind==='Despesa'&&C.normalize(t.considerExpense)!=='nao')expenseTotals.set(month(t),(expenseTotals.get(month(t))||0)+(Number(t.amount)||0));
 for(const row of rows){const f=flowIndex.get(row['Mês']);row.Despesas=-(expenseTotals.get(row['Mês'])||0);row['Medições Caixa creditadas no Itaú']=f.caixa;row['Resgate Sofisa para Itaú']=f.sofisa;row['Resgate Investimento Itaú para Itaú']=f.itau;row['Pagamento construtora']=f.contractor;row['Parcela do financiamento']=f.installment+f.actualLoan;row['Móveis e eletros']=cash.get(row['Mês'])?.deferredPayment||0;row['Despesas sem cobertura no mês']=f.uncovered;row['Obrigações sem cobertura acumuladas']=-f.pending;row.Total-=f.pending;row.Passivo-=f.pending;}
 return {rows,investments,transactions:canonical,flows};
}
root.PatrimonyModel={project};if(typeof module!=='undefined')module.exports=root.PatrimonyModel;
})(typeof globalThis!=='undefined'?globalThis:this);
