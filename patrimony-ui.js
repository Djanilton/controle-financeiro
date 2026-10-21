/* One bank projection for the balance sheet, with SAC/schedule supplied by Construction. */
let patrimonyCache=null;
let patrimonyError='';
let patrimonyViewCache=null;
function patrimonySummary(from,to,model){
 const result=constructionResult(),anchor=today.slice(0,7),transactions=allTransactions(),initial=data.initialBalances||[],tables=data.sourceTables||{};
 patrimonyError='';
 if(patrimonyViewCache?.transactions===transactions&&patrimonyViewCache?.model===model&&patrimonyViewCache?.result===result&&patrimonyViewCache?.initial===initial&&patrimonyViewCache?.tables===tables&&patrimonyViewCache?.from===from&&patrimonyViewCache?.to===to)return patrimonyViewCache.rows.map(x=>({...x}));
 const historical=Model.summaryRows(transactions,initial,tables,model.investments,model.loans,from,to);
 if(!result?.funding?.sourceSnapshot||to<anchor)return historical;
 try{
  if(patrimonyCache?.model!==model||patrimonyCache?.result!==result||patrimonyCache?.to!==to)patrimonyCache={model,result,to,projection:PatrimonyModel.project({transactions,initial,tables,positions:model.investments,loanPositions:model.loans,result,asOfDate:today,to})};
  const projected=new Map(patrimonyCache.projection.rows.map(row=>[row['Mês'],row]));
  const rows=historical.map(row=>({...projected.get(row['Mês'])||row}));patrimonyViewCache={transactions,model,result,initial,tables,from,to,rows:rows.map(x=>({...x}))};return rows;
 }catch(error){patrimonyError='Projeção indisponível: '+error.message;return historical.map(row=>row['Mês']<anchor?row:{...row,Itaú:null,Sofisa:null,'Investimento Itaú':null,Ativos:null,Total:null,'Saldos não informados':patrimonyError})}
}
