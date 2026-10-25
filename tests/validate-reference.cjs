// Private extracted cell map; output deliberately excludes financial rows.
const fs=require('node:fs'),A=require('../sac-adapter.js'),E=require('../sac-engine.js');
if(!process.argv[2])throw Error('Informe o mapa privado de células, fora do repositório.');
const cells=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),config=A.configFromCells(cells),r=A.compare(cells,E.calculate({...config,trCapitalizes:false}));
console.log(JSON.stringify({passed:r.passed,checked:r.checked,formulaCount:r.formulaCount,unmapped:r.unmapped.length,differences:r.differences.length,maxDifference:r.maxDelta,tolerance:r.tolerance}));
if(!r.passed)process.exitCode=1;
