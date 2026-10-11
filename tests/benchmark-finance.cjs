const fs=require('node:fs'),X=require('../vendor/xlsx.full.min.js'),C=require('../app-core.js'),M=require('../financial-model.js');
const start=performance.now(),book=X.read(fs.readFileSync(process.argv[2]),{type:'buffer',dense:true,sheets:['Configurações','Despesas','Receitas','Transferências','Neos Prev','INSS','FGTS','Resumo']}),data=C.mapWorkbook(book,X),read=performance.now();
const tx=M.enrich(data.transactions,data.sourceTables),enriched=performance.now(),investments=M.investmentRows(tx,data.initialBalances,data.sourceTables,{from:'2000-01',to:'2061-12',asOf:'2026-10',annualCdi:.12}),calculated=performance.now();
M.summaryRows(tx,data.initialBalances,data.sourceTables,investments,[],'2022-01','2030-12');const end=performance.now();
console.log(JSON.stringify({transactions:tx.length,readingSeconds:(read-start)/1000,classificationSeconds:(enriched-read)/1000,investmentSeconds:(calculated-enriched)/1000,summarySeconds:(end-calculated)/1000}));
