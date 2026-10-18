// Read-only optional private fixtures. Browser profile is isolated; no Microsoft session.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
async function main(){
 const root=path.resolve(__dirname,'..'),[appFile,constructionFile]=process.argv.slice(2);if(!appFile||!constructionFile)throw Error('Informe duas cópias privadas para teste somente leitura.');
 const app=JSON.parse(fs.readFileSync(appFile)),construction=JSON.parse(fs.readFileSync(constructionFile)),server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)&&file!==root)return res.writeHead(403).end();if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');try{const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime});fs.createReadStream(file).pipe(res)}catch{res.writeHead(404).end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,executablePath:path.join(process.env.PROGRAMFILES,'Google/Chrome/Application/chrome.exe')}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForSelector('[data-tab="construction"]');
  await page.evaluate(async({app,construction})=>{data=app.data;manual=app.manual;localStorage.setItem(ConstructionMigration.STORAGE,JSON.stringify(construction));const s=ConstructionMigration.local(localStorage,construction);acceptConstruction(s);await maintainImportHistory();ConstructionHost.open('resumo')},{app,construction});
  const frame=page.frameLocator('iframe[title="Controle da construção"]');await frame.locator('#summaryFunding').waitFor({timeout:60000});await frame.getByRole('heading',{name:'Situação da obra e custo total',exact:true}).waitFor();
  const result=await page.evaluate(()=>{const r=constructionResult(),rows=r.cash.filter(x=>!x.historical);return {feasible:r.balancedPlan.feasible,payoff:r.payoff,unfunded:rows.reduce((a,x)=>a+x.unfunded,0),months:rows.length,anticipated:rows.some(x=>x.salaryAnticipated>0),loanPayoff:calculations().loans.find(x=>Math.abs(x.closing)<.005)?.month,cleanErrors:data.reportLog.every(x=>x.status!=='Erro')}});
  assert.ok(result.feasible);assert.ok(result.unfunded<.005);assert.equal(result.loanPayoff,result.payoff);assert.ok(result.cleanErrors);assert.ok(result.anticipated);
  await frame.getByRole('cell',{name:'Integralmente pago',exact:true}).waitFor();assert.equal(await frame.getByRole('cell',{name:'Terreno ainda a pagar',exact:true}).count(),0);
  await page.screenshot({path:path.join(os.tmpdir(),'controle-construction-review-desktop.png'),fullPage:false});await frame.locator('#summaryFunding').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(os.tmpdir(),'controle-balanced-funding.png'),fullPage:false});
  await page.locator('[data-construction-section="contrato"]').click();assert.equal(await frame.getByRole('heading',{name:'Documentos e anexos contratuais',exact:true}).count(),1);
  await page.evaluate(()=>{tab='payroll';render()});const types=await page.locator('.payroll-matrix tbody tr td:first-of-type').allTextContents();const firstDiscount=types.indexOf('Descontos');if(firstDiscount>=0)assert.ok(types.slice(firstDiscount).every(x=>x==='Descontos'));
  await page.evaluate(()=>{tab='reserve';render()});assert.ok((await page.locator('th').allTextContents()).includes('Salário antecipado'));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>ConstructionHost.open('resumo'));await frame.locator('#summaryOverview').waitFor();await page.screenshot({path:path.join(os.tmpdir(),'controle-construction-review-mobile.png'),fullPage:false});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({browser:'passed',...result,pageErrors:errors}));
 }finally{await browser.close();await new Promise(r=>server.close(r))}
}
main().catch(e=>{console.error(e);process.exitCode=1});
