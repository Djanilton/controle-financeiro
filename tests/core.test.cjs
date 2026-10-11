const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../app-core.js');

test('login Microsoft usa a biblioteca MSAL hospedada no próprio aplicativo',()=>{
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/loadScript\('\.\/vendor\/msal-browser\.min\.js'\)/);
  assert.ok(fs.statSync(path.join(root,'vendor','msal-browser.min.js')).size>100_000);
  assert.doesNotMatch(html,/alcdn\.(?:msauth|msftauth)\.net/);
});

test('login Microsoft usa a ponte de retorno exigida pelo MSAL 5',()=>{
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert.match(html,/msal-redirect-bridge\.min\.js/);
  assert.match(html,/broadcastResponseToMainFrame/);
  assert.ok(fs.statSync(path.join(root,'vendor','msal-redirect-bridge.min.js')).size>5_000);
  assert.doesNotMatch(app,/handleRedirectPromise/);
});

test('leitor de Excel também fica hospedado no aplicativo',()=>{
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/loadScript\('\.\/vendor\/xlsx\.full\.min\.js'\)/);
  assert.ok(fs.statSync(path.join(root,'vendor','xlsx.full.min.js')).size>500_000);
  assert.doesNotMatch(html,/cdn\.jsdelivr\.net\/npm\/xlsx/);
});

test('importação do arquivo consolidado lê somente as abas financeiras necessárias',()=>{
  const app=fs.readFileSync(path.resolve(__dirname,'..','app.js'),'utf8');
  assert.match(app,/bookSheets:true/);
  assert.match(app,/dense:true,sheets:selected/);
  assert.match(app,/FINANCE_SHEETS=.*Configurações.*Despesas.*Receitas.*Transferências.*Neos Prev.*INSS.*FGTS.*Investimentos.*Empréstimos/);
});

test('converte números brasileiros e datas do Excel',()=>{
  assert.equal(Core.number('R$ 1.234,56'),1234.56);
  assert.equal(Core.number('1234.56'),1234.56);
  assert.equal(Core.excelDate('25/09/2026'),'2026-09-25');
  assert.equal(Core.excelDate(45925),'2025-09-25');
});

test('mapeia pagamento como data efetiva da despesa',()=>{
  const row={Vencimento:'20/09/2026',Pagamento:'25/09/2026',Descrição_Ori:'Energia',Valor:'321,45',Categoria:'Moradia',Conta:'Itaú'};
  const item=Core.transaction(row,'Despesa',0);
  assert.equal(item.date,'2026-09-25');
  assert.equal(item.dueDate,'2026-09-20');
  assert.equal(item.paymentDate,'2026-09-25');
  assert.equal(item.description,'Energia');
  assert.equal(item.amount,321.45);
  assert.equal(item.account,'Itaú');
});

test('preserva as segmentações de despesa usadas no Power Pivot',()=>{
  const item=Core.transaction({Vencimento:'10/10/2026',Valor:100,Descrição:'Mercado',Conta:'Itaú',Categoria:'Alimentação',Subcategoria:'Supermercado',Cartão:'Visa','Tipo de Despesa':'Variável','Considerar Despesa':'Sim'},'Despesa',0);
  const filtered=Core.filterTransactions([item],{kind:'Despesa',category:'Alimentação',subcategory:'Supermercado',card:'Visa',expenseType:'Variável',considerExpense:'Sim',dateField:'due',from:'2026-10-01',to:'2026-10-31'});
  assert.equal(filtered.length,1);
});

test('calcula resumo de saldo com receita, despesa e os dois lados da transferência',()=>{
  const transactions=[
    Core.transaction({Vencimento:'05/01/2026',Valor:1000,Descrição:'Salário',Conta:'Itaú'},'Receita',0),
    Core.transaction({Vencimento:'10/01/2026',Valor:200,Descrição:'Mercado',Conta:'Itaú'},'Despesa',1),
    Core.transaction({Vencimento:'15/01/2026',Valor:300,Descrição:'Aplicação','Conta Origem':'Itaú','Conta Destino':'Sofisa'},'Transferência',2)
  ];
  const initial=[{account:'Itaú',year:2026,amount:500},{account:'Sofisa',year:2026,amount:100}];
  const rows=Core.balanceRows(transactions,initial,{from:'2026-01',to:'2026-01'});
  const itau=rows.find(x=>x.account==='Itaú'),sofisa=rows.find(x=>x.account==='Sofisa');
  assert.deepEqual({opening:itau.opening,income:itau.income,expenses:itau.expenses,transfers:itau.transfers,closing:itau.closing},{opening:500,income:1000,expenses:200,transfers:-300,closing:1000});
  assert.equal(sofisa.closing,400);
});

test('pesquisa ignora acentos e encontra conta ou descrição',()=>{
  const rows=[
    {kind:'Despesa',description:'Educação Salesiano',category:'Filhos',account:'Itaú',date:'2026-09-01'},
    {kind:'Receita',description:'Salário',category:'Renda',account:'Sofisa',date:'2026-09-25'}
  ];
  assert.equal(Core.filterTransactions(rows,{query:'educacao'}).length,1);
  assert.equal(Core.filterTransactions(rows,{query:'sofisa',kind:'Receita'}).length,1);
});

test('consolida receitas e despesas por mês',()=>{
  const rows=[
    {kind:'Receita',date:'2026-09-25',amount:10000},
    {kind:'Despesa',date:'2026-09-20',amount:4000},
    {kind:'Despesa',date:'2026-10-02',amount:500}
  ];
  const result=Core.monthly(rows);
  assert.deepEqual(result[0],{month:'2026-09',income:10000,expenses:4000,transfers:0});
  assert.deepEqual(result[1],{month:'2026-10',income:0,expenses:500,transfers:0});
});

test('mapeia as abas consolidadas e usa saldos iniciais no lugar do antigo Resumo patrimonial',()=>{
  const sheets={
    Despesas:[{Pagamento:'25/09/2026',Descrição_Ori:'Condomínio',Valor:900,Conta:'Itaú'}],
    Receitas:[{Pagamento:'25/09/2026',Descrição_Ori:'Salário',Valor:10000,Conta:'Itaú'}],
    Transferências:[{Pago:'26/09/2026',Descrição:'Reserva',Valor:1000,'Conta Origem':'Itaú','Conta Destino':'Sofisa'}],
    Configurações:[{Conta:'Itaú',Ano:2026,SaldoInicial:5000}],
    Resumo:[{Mês:'30/09/2026',Total:250000,Invest:150000,Passivo:50000}],
    Investimentos:[{Data:'30/09/2026',Descrição:'CDB',Realizado:50000,Projetado:60000}],
    Empréstimos:[{Data:'30/09/2026',Descrição:'Imóvel','Saldo Devedor':120000,'Saldo Projetado':110000}],
    'Neos Prev':[],INSS:[],FGTS:[]
  };
  const book={SheetNames:Object.keys(sheets),Sheets:sheets};
  const XLSX={utils:{sheet_to_json:sheet=>sheet}};
  const mapped=Core.mapWorkbook(book,XLSX);
  assert.equal(mapped.transactions.length,3);
  assert.equal(mapped.netWorth.length,0);
  assert.deepEqual(mapped.initialBalances[0],{account:'Itaú',year:2026,amount:5000});
  assert.equal(mapped.investments[0].projected,60000);
  assert.equal(mapped.loans[0].balance,120000);
});
