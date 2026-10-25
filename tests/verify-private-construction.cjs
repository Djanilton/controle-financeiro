// Read-only audit. Private source paths are arguments; output contains no rows, IDs or amounts.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const M=require('../construction-migration.js'),F=require('../construction-finance.js'),E=require('../sac-engine.js');
const [legacyPath,currentPath,appPath,asOfDate]=process.argv.slice(2);
if(!legacyPath||!currentPath)throw Error('Informe os JSONs privados legado e integrado; opcionalmente base financeira e data de corte.');
function read(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
const before=read(legacyPath),state=read(currentPath),preservation=M.verify(before,state);
const summary={preservationPassed:preservation.passed,missingReferences:preservation.missing.length,counts:preservation.counts,bankSourceVerified:false};
let overrides={};
if(appPath){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOfDate||''))throw Error('Informe uma data de corte explícita YYYY-MM-DD.');
 const app=read(appPath),C=require('../app-core.js'),Model=require('../financial-model.js'),B=require('../finance-bridge.js'),T=require('../transaction-entry.js');
 const tx=Model.enrich(T.expand([...app.data.transactions,...app.manual.transactions]).sort((a,b)=>(b.date||'').localeCompare(a.date||'')),app.data.sourceTables||{}),end=state.meta.engine.config.dates.at(-1).slice(0,7);
 const snapshot=B.fromLedger(C,tx,app.data.initialBalances||[],asOfDate,{provisionedCosts:F.ownCosts(state),fgtsProjection:B.fgtsProjection(Model,C,tx,app.data.sourceTables||{},asOfDate,end)});
 overrides=B.apply({},snapshot);summary.bankSourceVerified=true;
}
const effective={...state,meta:{...state.meta,engine:{...state.meta.engine,config:{...state.meta.engine.config,...overrides}}}},config=F.linkedConfig(effective,E),options={expenses:F.ownCosts(state),programs:state.meta.programacoes||[],movements:state.items.meses||[]},result=E.calculate(config,options);
const validation=spawnSync(process.env.PYTHON||'python3',[path.join(__dirname,'../tools/validate_financing.py')],{input:JSON.stringify({config,options,result}),encoding:'utf8',timeout:60000,killSignal:'SIGKILL'});
summary.independentPassed=!validation.error&&validation.status===0;
if(summary.independentPassed)summary.independent=JSON.parse(validation.stdout);
summary.months=result.sac.length;summary.hasUncoveredPayments=result.cash.some(x=>!x.historical&&x.unfunded>.005);summary.hasNegativeDebt=result.sac.some(x=>x.M<0);
console.log(JSON.stringify(summary));if(!summary.preservationPassed||!summary.independentPassed||summary.hasNegativeDebt)process.exitCode=1;
