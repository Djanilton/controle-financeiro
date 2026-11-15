/* Runs before operational modules: a saved invoice tab must never boot as writable. */
(function(root){'use strict';
 const params=new URL(location.href).searchParams;let saved=false;
 try{saved=JSON.parse(localStorage.getItem('controle-financeiro-filtros-v1')||'{}').tab==='cardInvoices'}catch{}
 const requested=params.get('area')==='cardInvoices'||params.get('mode')==='invoice-review'||saved;
 root.InvoiceReviewIntegrated={active:requested,boot:requested,pendingWrites:0,pendingReads:0,bootStamp:requested?{manual:localStorage.getItem('controle-financeiro-lancamentos-v1'),sync:localStorage.getItem('controle-financeiro-sync-v1')}:null};
})(globalThis);
