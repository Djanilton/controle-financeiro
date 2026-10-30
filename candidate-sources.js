/* Local adapters only: never fetches, activates or persists financial data. */
(function(root){'use strict';
const Core=root.FinanceCore||(typeof require==='function'?require('./app-core.js'):null);
const MF=root.MinhasFinancasCore||(typeof require==='function'?require('./minhas-financas-core.js'):null);
const FILES={'despesas-2026-10-22-22-30-11.xlsx':'Despesa','receitas-2026-10-22-22-33-58.xlsx':'Receita','transferências-2026-10-22-22-35-10.xlsx':'Transferência'};
function check(ok,message){if(!ok)throw Error(message)}
function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value}
function money(value){
 if(typeof value==='number'){check(Number.isFinite(value)&&Number.isSafeInteger(Math.round(value*100))&&Math.abs(value*100-Math.round(value*100))<=0.00001,'Valor monetário não finito ou precisão não comprovada.');return value}
 const text=String(value??'').trim().replace(/^R\$\s*/,'').replace(/\s/g,'');
 check(/^-?(?:\d+(?:[.,]\d{1,2})?|\d{1,3}(?:\.\d{3})+,\d{1,2})$/.test(text),'Valor monetário ausente ou ambíguo.');
 return Core.number(text);
}
function fromExcelBook(book,XLSX,name,control=null){
 const kind=FILES[name];check(kind,'Relatório Excel não corresponde à carga histórica selecionada.');
 check(book?.SheetNames?.length===1,'Relatório deve conter uma única aba; seleção ambígua bloqueada.');
 const sheet=book.Sheets[book.SheetNames[0]],rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true});
 const matrix=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true});
 const headers=(matrix[0]||[]).map(Core.normalize);
 for(const field of ['Descrição','Valor','Vencimento'])check(headers.includes(Core.normalize(field)),'Cabeçalho obrigatório ausente no Excel.');
 const warnings=new Set(),transactions=rows.map((raw,index)=>{
  const description=String(Core.pick(raw,'Descrição','Descricao')).trim();check(description,'Linha sem descrição no relatório.');
  const amount=money(Core.pick(raw,'Valor','Valor (R$)','Total'));
  check(Number.isSafeInteger(Math.round(amount*100)),'Valor excede a precisão monetária suportada.');
  const due=Core.excelDate(Core.pick(raw,'Vencimento','Vencimento_Ori'));check(validDate(due),'Vencimento inválido; data efetiva não substitui vencimento.');
  const t=Core.transaction(raw,kind,index);t.description=description;t.dueDate=due;t.cashAmount=amount;t.amount=Math.abs(amount);
  for(const value of [t.postedDate,t.paymentDate])check(!value||validDate(value),'Data de lançamento ou efetivação inválida.');
  check(t.account&&t.account.trim(),'Conta de origem ausente.');
  if(kind==='Transferência')check(t.destination&&t.destination.trim()&&Core.normalize(t.destination)!==Core.normalize(t.account),'Transferência sem destino válido.');
  const status=Core.normalize(Core.pick(raw,'Situação','Situacao','Status'));
  if(!status){t.status='Não informado';warnings.add('Situação ausente na fonte; pagamento não presumido.');}
  else if(['efetivada','efetivado','pago','paga','recebido','recebida','completed'].includes(status))t.status='Efetivada';
  else if(['pendente','pending','a pagar','a receber'].includes(status))t.status='Pendente';
  else throw Error('Situação não reconhecida no relatório.');
  t.notes=String(Core.pick(raw,'Observações','Observacoes','Observação','Observacao')??'');
  t.tags=String(Core.pick(raw,'Tags')??'');
  const installment=description.match(/\s+(\d+)\s*\/\s*(\d+)\s*$/);
  if(!t.installments&&installment&&Core.normalize(t.recurrence).includes('parcel')){check(Number(installment[1])>0&&Number(installment[2])>=Number(installment[1]),'Número de parcela inválido.');t.installments=Number(installment[1])+'/'+Number(installment[2]);}
  t.effectiveDateKnown=!!t.paymentDate;t.date=t.paymentDate||t.dueDate;
  t.source=name;t.sourceFields=structuredClone(raw);
  return t;
 });
 const total=transactions.reduce((sum,t)=>sum+Math.round(t.cashAmount*100),0);
 check(Number.isSafeInteger(total),'Total excede a precisão monetária suportada.');
 if(control){check(Number.isInteger(control.expectedCount)&&control.expectedCount===transactions.length,'Contagem difere do controle independente da fonte.');check(Number.isSafeInteger(control.expectedTotalMinor)&&control.expectedTotalMinor===total,'Total difere do controle independente da fonte.');}
 return {schema:'candidate-source-v1',source:'excel',name,transactions,observedCount:transactions.length,observedTotalMinor:total,
  expectedCount:control?.expectedCount??transactions.length,expectedTotalMinor:control?.expectedTotalMinor??total,
  independentControl:!!control,warnings:[...warnings]};
}
function fromPacket(packet){
 check(!packet?.poc?.sampleOnly,'Pacote de amostra MCP não comprova cobertura para substituição.');
 const normalized=MF.preview([],packet);check(normalized.passed,'Pacote MCP contém conflitos de normalização.');
 // Only retain an explicit series identifier; recurrence codes are never treated as IDs.
 const original=MF.validate(packet),details=new Map(original.details.map(d=>[[d.type,String(d.transaction?.id),d.month].join('|'),d.transaction]));
 const items=new Map(original.items.map(t=>[[t.type,String(t.id),t.occurrenceMonth].join('|'),t]));
 for(const t of normalized.rows){
  const m=t.minhasFinancas,key=[t.kind==='Despesa'?'expenses':t.kind==='Receita'?'incomes':'transfers',String(m.remoteId),m.occurrenceMonth].join('|'),raw=items.get(key),detail=details.get(key);
  const ids=[raw?.seriesId,detail?.seriesId].filter(v=>v!=null);
  check(ids.every(v=>typeof v==='string'&&v.length>0)&&new Set(ids).size<=1,'Identificador de série remoto inválido ou divergente.');
  if(ids.length)m.seriesId=ids[0];
 }
 return {schema:'candidate-source-v1',source:'plugin',transactions:normalized.rows,profileId:String(packet.profileId),
  from:packet.from,to:packet.to,dateReference:'due'};
}
const api={FILES,validDate,money,fromExcelBook,fromPacket};root.CandidateSources=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
