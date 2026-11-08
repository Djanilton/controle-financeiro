/* Deliberately excludes app.js, app-state, integration-ui, construction, candidate application and migration transports. */
(async()=>{'use strict';try{
 await Promise.all([loadScript('./vendor/msal-browser.min.js'),loadScript('./vendor/xlsx.full.min.js')]);
 for(const path of ['app-core','minhas-financas-observations','minhas-financas-core','candidate-sources','sources-read-session','sources-review-host','card-invoice-core','card-invoice-itau','card-invoice-extras','card-invoice-ui','invoice-review-history','invoice-review-store','invoice-review-ui','private-source-core','private-source-read','card-invoice-extras-ui','invoice-batch-core','invoice-batch-ui','invoice-review-workspace'])await loadScript('./'+path+'.js?v=20261107-source-only');
 await initializeSourcesReview();
}catch{document.getElementById('view').textContent='Não foi possível abrir a conferência isolada. A base financeira não foi carregada nem alterada.'}})();
