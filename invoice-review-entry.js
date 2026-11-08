/* Operational host entry: leave it before source authentication; no token or financial state is transferred. */
'use strict';
function openInvoiceSourcesReview(){
 if((typeof appReadTask!=='undefined'&&appReadTask)||(typeof appSyncTask!=='undefined'&&appSyncTask)||(typeof constructionSyncTask!=='undefined'&&constructionSyncTask)||(typeof reportBusy!=='undefined'&&reportBusy)||(typeof appApplying!=='undefined'&&appApplying)){toast('Aguarde a operação atual terminar antes de abrir a conferência isolada. Nenhuma sincronização adicional foi iniciada.');return}
 const url=new URL(location.href);url.search='?mode=invoice-readonly&area=cardInvoices';url.hash='';location.assign(url.href);
}
document.addEventListener('click',event=>{if(!event.target.closest?.('[data-tab="cardInvoices"],#openInvoiceImports'))return;event.preventDefault();event.stopImmediatePropagation();openInvoiceSourcesReview()},true);
const invoiceOperationalRender=render;render=function(){if(tab==='cardInvoices'){openInvoiceSourcesReview();return}return invoiceOperationalRender()};
