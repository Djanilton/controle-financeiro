// Entirely synthetic, isolated origin; no Graph/MCP/network access.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,launchOptions}=require('./browser-runtime.cjs'),C=require('../card-invoice-core.js');
(async()=>{
 const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file))return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');fs.createReadStream(file).pipe(res)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch(launchOptions()),page=await browser.newPage({viewport:{width:1440,height:1000}}),origin='http://127.0.0.1:'+server.address().port,errors=[],outside=[],writes=[];
 await page.route('**/*',r=>{const req=r.request();if(new URL(req.url()).origin!==origin){outside.push(req.method());return r.abort()}if(req.method()!=='GET')writes.push(req.method());return r.continue()});page.on('pageerror',e=>errors.push(e.name));
 try{
  await page.goto(origin);await page.waitForFunction(()=>typeof appReady!=='undefined'&&appReady);await page.locator('[data-tab="cardInvoices"]').click();
  const signature=await page.evaluate(()=>appStateSignature()),storage=await page.evaluate(()=>JSON.stringify(localStorage)),lock=await page.evaluate(()=>({review:appSync.reviewLocked,conflict:appConflictLocked}));
  await page.locator('#invoiceDemo').click();assert.ok((await page.locator('#invoiceResult').textContent()).includes('Valor divergente'));assert.equal(await page.locator('#invoiceExport').isDisabled(),true);
  await page.locator('#invoiceExportConsent').check();const waiting=page.waitForEvent('download');await page.locator('#invoiceExport').click();const download=await waiting,report=JSON.parse(fs.readFileSync(await download.path()));assert.equal(report.applyAllowed,false);assert.equal(report.counts.MATCH,1);assert.equal(report.counts.INSTALLMENTS_DIVERGENT,1);
  // CSV, explicit column mapping, consent, unknown date (not inferred).
  const application=C.demo().application;application.sharedIdentityReviewed=false;application.rows=application.rows.slice(0,1);application.cardId='cartao-local';application.rows[0].cardId='cartao-local';delete application.rows[0].sharedId;
  const upload=async(name,buffer)=>page.locator('#invoiceBankFile').setInputFiles({name,mimeType:'application/octet-stream',buffer});
  await page.locator('#invoiceCard').fill('cartao-local');await page.locator('#invoiceMonth').fill('2026-11');await upload('fatura-ficticia.csv',Buffer.from('Descrição;Valor;Natureza;Data da compra;Vencimento\nCompra fictícia a;120,00;purchase;2026-10-10;2026-11-10'));
  await page.locator('summary').filter({hasText:'Mapeamento explícito dos arquivos'}).click();
  await page.locator('#invoiceOptions').fill(JSON.stringify({format:'decimal-comma',positive:'charge',mapping:{description:'Descrição',amountMinor:'Valor',kind:'Natureza',purchaseDate:'Data da compra',dueDate:'Vencimento'}}));
  await page.locator('#invoiceAppFile').setInputFiles({name:'fonte-sintetica.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(application))});
  await page.locator('#invoiceCompare').click();assert.match(await page.locator('#invoiceMessage').textContent(),/CONSENT_REQUIRED/);assert.equal(await page.locator('#invoiceResult').count(),0);
  // Inputs are discarded deliberately on rerender; reselect explicitly.
  const appUpload=async()=>page.locator('#invoiceAppFile').setInputFiles({name:'fonte-sintetica.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(application))});
  await upload('fatura-ficticia.csv',Buffer.from('Descrição;Valor;Natureza;Data da compra;Vencimento\nCompra fictícia a;120,00;purchase;2026-10-10;2026-11-10'));await appUpload();await page.locator('#invoiceConsent').check();await page.locator('#invoiceCompare').click();await page.waitForSelector('#invoiceResult');assert.equal(await page.evaluate(()=>invoiceWorkspace.report.counts.PROBABLE_MATCH),1);
  // Real XLSX reader, one worksheet with explicitly selected columns (not a stub).
  const xlsx=await page.evaluate(()=>{const b=XLSX.utils.book_new();XLSX.utils.book_append_sheet(b,XLSX.utils.aoa_to_sheet([['Descrição','Valor','Natureza','Data da compra','Vencimento'],['Compra fictícia a','120,00','purchase','2026-10-10','2026-11-10']]),'Fatura');return [...new Uint8Array(XLSX.write(b,{type:'array',bookType:'xlsx'}))]});
  await upload('fatura-ficticia.xlsx',Buffer.from(xlsx));await appUpload();await page.locator('#invoiceConsent').check();await page.locator('#invoiceCompare').click();await page.waitForFunction(()=>invoiceWorkspace.report?.counts.PROBABLE_MATCH===1&&!invoiceWorkspace.busy);
  assert.equal(await page.evaluate(()=>appStateSignature()),signature);assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),storage);assert.deepEqual(await page.evaluate(()=>({review:appSync.reviewLocked,conflict:appConflictLocked})),lock);
  // HTML in private descriptions is text, never markup.
  await page.evaluate(()=>{invoiceWorkspace.report.results[0].bank.description='<img src=x onerror="window.invoiceXss=true">';render()});assert.equal(await page.locator('#invoiceResult img').count(),0);assert.equal(await page.evaluate(()=>window.invoiceXss),undefined);
  await page.screenshot({path:'/tmp/controle-faturas-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert.ok(await page.locator('#invoiceCompare').isVisible());await page.waitForFunction(()=>document.querySelector('.invoice-workspace').getBoundingClientRect().left>=document.querySelector('.sidebar').getBoundingClientRect().right);await page.locator('#invoiceCard').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#invoiceMonth').evaluate(el=>el===document.activeElement),true);
  await page.screenshot({path:'/tmp/controle-faturas-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#invoiceClear').click();assert.equal(await page.locator('#invoiceResult').count(),0);assert.equal(await page.evaluate(()=>invoiceWorkspace.bank),null);
  assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);assert.deepEqual(writes,[]);console.log('Chromium faturas: demonstração, CSV, XLSX, consentimento, exportação, XSS, teclado/mobile, base/storage/bloqueios intactos; zero rede externa/escrita.');
 }catch(error){console.error('synthetic UI status:',await page.locator('#invoiceMessage').textContent());throw error}finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exit(1)});
