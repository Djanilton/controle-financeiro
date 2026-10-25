/* Local worker only: never performs network or storage operations. */
importScripts('./base-reconciliation.js');
onmessage=event=>{try{if(event.data.operation==='export'){postMessage({blob:new Blob([JSON.stringify(event.data.value)],{type:'application/json'})});return}const report=BaseReconciliation.compare(event.data.local,event.data.cloud,progress=>postMessage({progress}));postMessage({report})}catch{postMessage({error:'Comparação interrompida. Bases locais preservadas.'})}};
