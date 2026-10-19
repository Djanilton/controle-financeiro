/* Presentation of existing scenario values; no second financial calculation. */
function contractorScheduleMonths(schedule=[]){
 const months=new Map();
 for(const row of schedule){const value=months.get(row.month)||{payment:0,own:0,fgts:0,caixa:0};for(const key of Object.keys(value))value[key]+=Number(row[key]||0);months.set(row.month,value)}
 return months;
}
const reserveRowsBeforeDetails=mergedReserveRows;
mergedReserveRows=function(...args){
 const schedule=contractorScheduleMonths(constructionResult()?.schedule||[]);
 return reserveRowsBeforeDetails(...args).map(row=>{
  const stage=schedule.get(row['Mês'])||{};
  const {'Pagamentos previstos':payments,...values}=row;
  return {...values,'Pagamentos da reserva no mês':payments,
   'Construtora — pagamento no cronograma':stage.payment||0,
   'Construtora — recursos próprios':stage.own||0,
   'Construtora — FGTS inicial':stage.fgts||0,
   'Construtora — financiamento Caixa':stage.caixa||0};
 });
};
function reserveOpeningExplanation(result){
 const f=result.funding;if(!f?.currentFunds)return '';
 const lines=[['Saldo bancário atual de Itaú + Sofisa',f.capital],['− Próprios pendentes da construtora, já reservados',f.ownConstructorRemaining],['− Terreno pendente, já reservado',f.landRemaining],['− Outras despesas iniciais pendentes, já reservadas',f.otherUpfront],['= Reserva livre inicial do cenário',f.startingReserve]];
 return '<details id="reserveOpeningBridge" open><summary>Do saldo bancário à reserva livre</summary>'+tableView(['Composição','Valor'],lines.map(([Composição,Valor])=>({Composição,Valor})),(v,h)=>h==='Valor'?nullableMoney(v):esc(v))+'<p class="fine">A reserva final parte dessa reserva livre inicial e acompanha rendimentos e movimentos mensais. Os valores reservados continuam sendo compromissos, não pagamentos realizados. As colunas da construtora mostram o cronograma completo, inclusive etapas históricas já pagas; a parcela própria ainda pendente já foi separada acima e não é descontada novamente no mês da etapa. FGTS inicial e liberações Caixa pagam a construtora, não entram na reserva livre. Aporte FGTS é a amortização futura do financiamento, diferente do FGTS inicial da obra. Móveis e eletros parcelados não são retirados antecipadamente: saem nas oito parcelas após a obra.</p></details>';
}
const reserveViewBeforeDetails=liquidConstructionView;
liquidConstructionView=function(){const html=reserveViewBeforeDetails(),result=constructionResult();return result?html.replace('<h2>Saldo líquido da Obra</h2>','<h2>Saldo líquido da Obra</h2>'+reserveOpeningExplanation(result)):html};
