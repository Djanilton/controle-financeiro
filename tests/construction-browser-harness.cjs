// All external requests are blocked. Remote saves below affect synthetic memory only.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,launchOptions}=require('./browser-runtime.cjs'),M=require('../construction-migration.js'),{fixture}=require('./construction-fixture.cjs');
function seed(config=fixture()){
 return {version:2,meta:{updated:'2020-01-01T00:00:00Z',projectionPolicy:{version:1},engine:{config},contractTasks:[],contractInfo:{docs:[['Contrato teste','Referência','https://example.com/doc']],points:[['Ponto teste','Conferir','Cláusula teste',0]]},finance:{pci:{terreno:config.land},planilha:{terreno:config.land}}},items:{etapas:[],tarefas:[],gastos:[],materiais:[],parcelas:[],documentos:[],meses:[]}};
}
async function start(initial=seed()){
 const root=path.resolve(__dirname,'..'),errors=[],saves=[],backups=[];let remote=structuredClone(initial),revision=1,hold=null;
 const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))file=path.join(root,'index.html');if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file))return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');fs.createReadStream(file).pipe(res)});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const browser=await chromium.launch(launchOptions()),origin='http://127.0.0.1:'+server.address().port;
 async function session({context=null,page=null}={}){
  const existing=!!page;context??=page?.context()||await browser.newContext();
  if(!context._constructionTest){
   context._constructionTest=true;
   await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
   await context.exposeBinding('testConstructionRead',()=>({data:structuredClone(remote),etag:'revision-'+revision,canonical:true}));
   await context.exposeBinding('testConstructionSave',async(_,local,base)=>{saves.push(structuredClone(local));if(hold)await hold.promise;const merged=M.merge(local,remote,base);if(merged.conflicts.length)throw Error('Conflito: '+merged.conflicts.join(', '));backups.push(structuredClone(remote));remote=merged.state;revision++;return {data:structuredClone(remote),etag:'revision-'+revision,canonical:true}});
  }
  if(!page){page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());}
  if(!existing)await page.goto(origin);await page.waitForFunction(()=>typeof appReady!=='undefined'&&appReady);
  await page.evaluate(initial=>{
   ConstructionHost.session=async()=>({username:'synthetic@example.com'});
   ConstructionHost.readState=()=>window.testConstructionRead();ConstructionHost.save=(s,b)=>window.testConstructionSave(s,b);
   ConstructionHost.graph=async()=>({value:[]});ConstructionHost.upload=async file=>({id:'synthetic-upload',webUrl:'https://example.com/'+file.name});ConstructionHost.balance=()=>null;
   if(!localStorage.getItem(ConstructionMigration.STORAGE))localStorage.setItem(ConstructionMigration.STORAGE,JSON.stringify(initial));acceptConstruction(JSON.parse(localStorage.getItem(ConstructionMigration.STORAGE)));ConstructionHost.open('premissas');
  },initial);
  const frame=await(await page.waitForSelector('iframe[title="Controle da construção"]')).contentFrame();
  await frame.waitForFunction(()=>typeof state!=='undefined'&&!!state?.meta?.engine?.config&&!!user);
  // Explicit saves make concurrency tests deterministic; preserve the normal dirty marker.
  await frame.evaluate(async()=>{clearTimeout(queue);scheduleSync=function(){rememberConstructionSync();parent.ConstructionHost.update(state)};if(!dirty)await refreshCloud()});
  return {page,frame,context,navigate:section=>page.evaluate(section=>ConstructionHost.open(section),section)};
 }
 return {browser,origin,errors,saves,backups,session,remote:()=>structuredClone(remote),replaceRemote:s=>{remote=structuredClone(s);revision++},hold(){let release;const promise=new Promise(r=>release=r);hold={promise,release};return ()=>{hold.release();hold=null}},async close(){await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r))}};
}
module.exports={start,seed};
