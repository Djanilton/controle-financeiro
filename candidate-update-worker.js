/* Local candidate computation only. No remote calls or persistence. */
importScripts('./app-core.js','./minhas-financas-core.js','./candidate-sources.js','./candidate-update.js');
onmessage=({data})=>{try{postMessage({result:CandidateUpdate.preview(data.base,data.options)})}catch(error){
 const publicMessages=new Set(['Pacote de amostra MCP não comprova cobertura para substituição.','Escopo completo sem filtros do plugin não comprovado.','Pacote deve cobrir os 12 meses completos por vencimento.','Completude, perfil, tipos e cobertura do Excel devem ser confirmados.','Informe o perfil da fonte.','Perfil diferente da base gerenciada.','Consulta fonte contém filtros; substituição bloqueada.','Controles independentes do Excel não informados.']);
 postMessage({error:publicMessages.has(error.message)?error.message:'Pacote, janela ou fontes inválidos/incompletos. Revise os relatórios; base ativa preservada.'})
}};
