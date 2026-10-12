const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={console,Date,Intl,URL,Map,Set,crypto:require('node:crypto').webcrypto,localStorage:{getItem:()=>null,setItem:()=>{}},addEventListener:()=>{},document:{addEventListener:()=>{}},location:{href:'https://djanilton.github.io/controle-financeiro/',origin:'https://djanilton.github.io',pathname:'/controle-financeiro/'}};context.window=context;context.globalThis=context;vm.createContext(context);
for(const file of ['app-core.js','financial-model.js','sac-engine.js','sac-adapter.js','app.js','app-enhancements.js','construction-finance.js','integration-ui.js','interaction-state.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8').replace(/\binit\(\);\s*$/,''),context,{filename:file});
vm.runInContext("data.transactions=[Core.transaction({Descrição:'FINANCIAMENTO CASA',Parcelas:'1/401',Conta:'Itaú',Categoria:'Compras',Subcategoria:'Casa',Valor:4000,Vencimento:'25/10/2026'},'Despesa',0)];data.initialBalances=[{account:'Itaú',year:2026,amount:10000}];",context);
for(const view of ['dashboardView','expensesView','transactionsView','balancesView','investmentsView','loansView','summaryView','reserveView','settingsView']){const html=vm.runInContext(view+'()',context);assert.ok(html.length>100,view);assert.ok(!html.includes('NaN'),view);console.log(view,'OK')}
vm.runInContext("mergeImport({transactions:[],netWorth:[],initialBalances:[],investments:[],loans:[],auxiliary:[],financingConfig:{term:411},source:{name:'SAC'}},true);if(data.transactions.length!==1)throw Error('Importar SAC apagou transações');",context);
console.log('Importação SAC preserva transações OK');
const chart=vm.runInContext("lineChart([{date:'2026-09',total:100},{date:'2026-10',total:200}])",context);
assert.ok(chart.includes('data-chart-tip='));assert.ok(chart.includes('aria-label="set. de 26:'));assert.ok(!chart.includes('<title>'));
assert.ok(vm.runInContext("NAV.findIndex(x=>x[0]==='transactions')<NAV.findIndex(x=>x[0]==='expenses')",context));
assert.ok(vm.runInContext("summaryView().includes('table-wrap freeze-month')",context));
assert.ok(vm.runInContext("tableView(['Mês','Valor'],[]).includes('freeze-month')",context));
console.log('Tooltip único, ordem das abas e mês fixo OK');
