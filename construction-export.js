/* Local workbook export only; no Graph writes and no changes to source files. */
(function(root){'use strict';
const Finance=root.ConstructionFinance||(typeof require==='function'?require('./construction-finance.js'):null);
function workbook(state,result,X){
 if(!state?.items||!state.meta||!X?.utils)throw Error('Registros ou leitor Excel indisponíveis.');
 const book=X.utils.book_new(),cell=v=>v&&typeof v==='object'?JSON.stringify(v):v??'';
 function rows(name,records,preferred=[]){const cols=[...new Set([...preferred,...records.flatMap(x=>Object.keys(x))])];X.utils.book_append_sheet(book,X.utils.aoa_to_sheet([cols,...records.map(x=>cols.map(k=>cell(x[k])))]),name)}
 for(const [kind,name]of Object.entries({etapas:'Etapas',tarefas:'Pendencias',gastos:'Despesas',materiais:'Materiais',parcelas:'Parcelas',meses:'Fluxo',documentos:'Documentos'}))rows(name,state.items[kind]||[],['id','nome']);
 rows('Obrigacoes',state.meta.contractTasks||[],['id','title','status']);
 rows('CustosProprios',Finance.ownCosts(state),['id','name','planned','paid']);
 rows('Programacoes',state.meta.programacoes||[],['tipo','valor','inicio','fim']);
 rows('Clausulas',(state.meta.contractInfo?.points||[]).map(([titulo,descricao,referencia,documento])=>({titulo,descricao,referencia,documento})),['titulo','descricao','referencia','documento']);
 rows('FontesDocumentais',(state.meta.contractInfo?.docs||[]).map(([nome,fonte,url])=>({nome,fonte,url})),['nome','fonte','url']);
 rows('HistoricoAnexos',state.meta.attachmentHistory||[],['nome','url','driveItemId']);
 rows('Referencias',Object.entries(state.meta.finance||{}).map(([origem,dados])=>({origem,dados})));
 rows('Metadados',[{schema:'controle-construcao-acompanhamento-v1',updated:state.meta.updated||'',notice:'Cópia dos registros e cenário atuais; não altera a planilha original. Para restauração integral, use o backup JSON.'}]);
 if(result){rows('MotorSAC',result.sac);rows('MotorFluxo',result.cash);rows('MotorCronograma',result.schedule);rows('MotorParametros',Object.entries(result.parameters).map(([parametro,valor])=>({parametro,valor})));}
 return book;
}
root.ConstructionExport={workbook};if(typeof module!=='undefined')module.exports=root.ConstructionExport;
})(typeof globalThis!=='undefined'?globalThis:this);
