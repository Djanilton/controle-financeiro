const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../app-core.js');

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
  assert.equal(item.description,'Energia');
  assert.equal(item.amount,321.45);
  assert.equal(item.account,'Itaú');
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

test('mapeia as abas consolidadas e mantém projeções separadas',()=>{
  const sheets={
    Despesas:[{Pagamento:'25/09/2026',Descrição_Ori:'Condomínio',Valor:900,Conta:'Itaú'}],
    Receitas:[{Pagamento:'25/09/2026',Descrição_Ori:'Salário',Valor:10000,Conta:'Itaú'}],
    Transferências:[{Pago:'26/09/2026',Descrição:'Reserva',Valor:1000,'Conta Origem':'Itaú','Conta Destino':'Sofisa'}],
    Resumo:[{Mês:'30/09/2026',Total:250000,Invest:150000,Passivo:50000}],
    Investimentos:[{Data:'30/09/2026',Descrição:'CDB',Realizado:50000,Projetado:60000}],
    Empréstimos:[{Data:'30/09/2026',Descrição:'Imóvel','Saldo Devedor':120000,'Saldo Projetado':110000}],
    'Neos Prev':[],INSS:[],FGTS:[]
  };
  const book={SheetNames:Object.keys(sheets),Sheets:sheets};
  const XLSX={utils:{sheet_to_json:sheet=>sheet}};
  const mapped=Core.mapWorkbook(book,XLSX);
  assert.equal(mapped.transactions.length,3);
  assert.equal(mapped.netWorth[0].total,250000);
  assert.equal(mapped.investments[0].projected,60000);
  assert.equal(mapped.loans[0].balance,120000);
});
