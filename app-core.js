(function(root){
  'use strict';
  const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const number=v=>{if(typeof v==='number')return Number.isFinite(v)?v:0;let s=String(v??'').trim().replace(/R\$|\s/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.'))s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');else if(s.includes(','))s=s.replace(',','.');const n=Number(s);return Number.isFinite(n)?n:0};
  const excelDate=v=>{if(v instanceof Date&&!isNaN(v))return v.toISOString().slice(0,10);if(typeof v==='number'){const d=new Date(Date.UTC(1899,11,30)+v*86400000);return d.toISOString().slice(0,10)}const s=String(v??'').trim();if(!s)return '';const br=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(br)return `${br[3]}-${br[2].padStart(2,'0')}-${br[1].padStart(2,'0')}`;const iso=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return iso?iso[0]:''};
  const pick=(row,...names)=>{const map=Object.fromEntries(Object.keys(row).map(k=>[normalize(k),k]));for(const n of names){const key=map[normalize(n)];if(key!==undefined&&row[key]!==undefined&&row[key]!==null)return row[key]}return ''};
  function transaction(row,kind,index){
    const isTransfer=kind==='Transferência';
    const date=excelDate(pick(row,'Pagamento','Pago','Vencimento','Lançamento','Data'));
    const description=String(pick(row,'Descrição','Descrição_Ori','Descricao','Histórico','Historico')||`${kind} ${index+1}`);
    const amount=Math.abs(number(pick(row,'Valor','Valor (R$)','Total')));
    return {id:`${normalize(kind)}-${index}-${date}-${amount}`,kind,date,description,amount,category:String(pick(row,'Categoria')||''),subcategory:String(pick(row,'Subcategoria')||''),account:String(pick(row,isTransfer?'Conta Origem':'Conta','Conta')||''),destination:String(pick(row,'Conta Destino')||''),card:String(pick(row,'Cartão','Cartao')||''),status:String(pick(row,'Situação','Situacao','Status')||(date?'Efetivada':'Pendente')),recurrence:String(pick(row,'Recorrência','Recorrencia')||''),installments:String(pick(row,'Parcelas')||''),notes:String(pick(row,'Observação','Observacao')||''),source:'Planilha'};
  }
  function seriesRow(row){
    const date=excelDate(pick(row,'Mês','Mes','Data'));
    if(!date)return null;
    const ignored=new Set(['mês','mes','data','remuneração','remuneracao','salário liq','salario liq','despesas','empréstimos','emprestimos','passivo','depósito investimento','deposito investimento','saque investimento']);
    let assets=0;for(const [k,v] of Object.entries(row))if(!ignored.has(normalize(k)))assets+=number(v);
    const total=number(pick(row,'Total'))||assets;
    return {date,total,investments:number(pick(row,'Invest','Investimentos')),liabilities:Math.abs(number(pick(row,'Passivo','Empréstimos','Emprestimos'))),expenses:Math.abs(number(pick(row,'Despesas'))),income:number(pick(row,'Salário Liq','Salario Liq','Remuneração','Remuneracao'))};
  }
  function genericInvestment(row,index){const date=excelDate(pick(row,'Mês','Mes','Data','Competência','Competencia'));const actual=number(pick(row,'Realizado','Valor Atual','Saldo','Investimento Atual','Valor'));const projected=number(pick(row,'Projetado','Projeção','Projecao','Meta','Valor Projetado'));return {id:`inv-${index}-${date}`,date,description:String(pick(row,'Descrição','Descricao','Investimento','Produto')||`Investimento ${index+1}`),institution:String(pick(row,'Instituição','Instituicao','Banco','Corretora','Conta')||''),type:String(pick(row,'Tipo','Classe','Categoria')||''),actual,projected,rate:number(pick(row,'Rentabilidade','Taxa','Taxa Anual')),horizon:excelDate(pick(row,'Vencimento','Prazo')),source:'Planilha'};}
  function genericLoan(row,index){const date=excelDate(pick(row,'Mês','Mes','Data','Competência','Competencia'));return {id:`loan-${index}-${date}`,date,description:String(pick(row,'Descrição','Descricao','Contrato','Empréstimo','Emprestimo')||`Empréstimo ${index+1}`),creditor:String(pick(row,'Credor','Banco','Instituição','Instituicao')||''),balance:number(pick(row,'Saldo Devedor','Saldo','Realizado','Valor Atual')),projected:number(pick(row,'Saldo Projetado','Projetado','Projeção','Projecao')),installment:number(pick(row,'Parcela','Prestação','Prestacao')),rate:number(pick(row,'Taxa','Juros')),maturity:excelDate(pick(row,'Vencimento','Prazo')),status:String(pick(row,'Situação','Situacao','Status')||'Ativo'),source:'Planilha'};}
  function mapWorkbook(book,XLSX){
    const sheet=n=>{const key=book.SheetNames.find(x=>normalize(x)===normalize(n));return key?XLSX.utils.sheet_to_json(book.Sheets[key],{defval:'',raw:true}):[]};
    const expenses=sheet('Despesas').map((r,i)=>transaction(r,'Despesa',i)).filter(x=>x.amount||x.description);
    const income=sheet('Receitas').map((r,i)=>transaction(r,'Receita',i)).filter(x=>x.amount||x.description);
    const transfers=sheet('Transferências').map((r,i)=>transaction(r,'Transferência',i)).filter(x=>x.amount||x.description);
    const netWorth=sheet('Resumo').map(seriesRow).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date));
    const investments=sheet('Investimentos').map(genericInvestment).filter(x=>x.actual||x.projected||x.description&&!/^Investimento \d+$/.test(x.description));
    const loans=sheet('Empréstimos').map(genericLoan).filter(x=>x.balance||x.projected||x.description&&!/^Empréstimo \d+$/.test(x.description));
    const auxiliary=['Neos Prev','INSS','FGTS'].flatMap(kind=>sheet(kind).map((row,index)=>({id:`${normalize(kind)}-${index}`,kind,date:excelDate(pick(row,'Mês','Mes','Data')),description:String(pick(row,'Descrição','Descricao','Perfil')||kind),contribution:number(pick(row,'Contribuição','Contribuição (R$)','Contribuicao','Valor Contribuição (R$)')),balance:number(pick(row,'Saldo','Saldo (R$)')),source:'Planilha'}))).filter(x=>x.date||x.balance||x.contribution);
    return {transactions:[...expenses,...income,...transfers],netWorth,investments,loans,auxiliary,source:{name:'Controle das finanças',sheets:book.SheetNames,counts:{Despesas:expenses.length,Receitas:income.length,Transferências:transfers.length,Resumo:netWorth.length,Investimentos:investments.length,Empréstimos:loans.length,Auxiliares:auxiliary.length},importedAt:new Date().toISOString()}};
  }
  function mapReport(book,XLSX,fileName='Relatório'){
    if(book.SheetNames.some(x=>normalize(x)==='despesas')&&book.SheetNames.some(x=>normalize(x)==='receitas'))return mapWorkbook(book,XLSX);
    const rows=XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]],{defval:'',raw:true});const name=normalize(fileName);
    const auxKind=name.includes('neos')?'Neos Prev':name.includes('inss')?'INSS':name.includes('fgts')?'FGTS':'';
    if(auxKind){const auxiliary=rows.map((row,index)=>({id:`${normalize(auxKind)}-${index}`,kind:auxKind,date:excelDate(pick(row,'Mês','Mes','Data')),description:String(pick(row,'Descrição','Descricao','Perfil')||auxKind),contribution:number(pick(row,'Contribuição','Contribuição (R$)','Contribuicao','Valor Contribuição (R$)')),balance:number(pick(row,'Saldo','Saldo (R$)')),source:fileName})).filter(x=>x.date||x.balance||x.contribution);return {transactions:[],netWorth:[],investments:[],loans:[],auxiliary,source:{name:fileName,sheets:book.SheetNames,counts:{[auxKind]:auxiliary.length},importedAt:new Date().toISOString()}};}
    let kind=name.includes('receita')?'Receita':name.includes('transfer')?'Transferência':'Despesa';
    const transactions=rows.map((r,i)=>transaction(r,kind,i)).filter(x=>x.amount||x.description);
    return {transactions,netWorth:[],investments:[],loans:[],auxiliary:[],source:{name:fileName,sheets:book.SheetNames,counts:{[kind]:transactions.length},importedAt:new Date().toISOString()}};
  }
  function monthly(transactions){const out={};for(const t of transactions){if(!t.date)continue;const m=t.date.slice(0,7);out[m]??={month:m,income:0,expenses:0,transfers:0};if(t.kind==='Receita')out[m].income+=t.amount;else if(t.kind==='Despesa')out[m].expenses+=t.amount;else out[m].transfers+=t.amount}return Object.values(out).sort((a,b)=>a.month.localeCompare(b.month));}
  function filterTransactions(items,filters={}){const q=normalize(filters.query);return items.filter(x=>(!q||normalize([x.description,x.category,x.subcategory,x.account,x.destination,x.card,x.notes].join(' ')).includes(q))&&(!filters.kind||x.kind===filters.kind)&&(!filters.account||x.account===filters.account)&&(!filters.from||x.date>=filters.from)&&(!filters.to||x.date<=filters.to));}
  root.FinanceCore={normalize,number,excelDate,pick,transaction,mapWorkbook,mapReport,monthly,filterTransactions};if(typeof module!=='undefined')module.exports=root.FinanceCore;
})(typeof globalThis!=='undefined'?globalThis:this);
