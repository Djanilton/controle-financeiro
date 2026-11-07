/* Evidence-only INSS history and versioned calculations. Never applies balances. */
(function(root){'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k),clone=structuredClone;
const validMonth=m=>typeof m==='string'&&/^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])$/.test(m);
const sourceUrl='https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal/tabela-de-contribuicao-historico';
const TABLES=Object.freeze([
 {id:'ME9-2019',from:'2019-01',to:'2019-12',method:'whole-base',brackets:[[175181,800],[291972,900],[583945,1100]],url:sourceUrl},
 {id:'SEPRT3659-2020-II',from:'2020-01',to:'2020-02',method:'whole-base',brackets:[[183029,800],[305052,900],[610106,1100]],url:sourceUrl},
 {id:'SEPRT3659-2020-III',from:'2020-03',to:'2020-12',method:'progressive',brackets:[[104500,750],[208960,900],[313440,1200],[610106,1400]],url:'https://www.stj.jus.br/internet_docs/biblioteca/clippinglegislacao/Prt_3659_2020_ME.pdf'}
]);
function minor(v){if(typeof v==='number')return Number.isFinite(v)&&v>=0&&Number.isSafeInteger(Math.round(v*100))&&Number(v.toFixed(2))===v?Math.round(v*100):null;if(typeof v!=='string'||!/^\d{1,3}(?:\.\d{3})*,\d{2}$|^\d+,\d{2}$/.test(v.trim()))return null;return minor(Number(v.trim().replace(/\./g,'').replace(',','.')))}
function parse(lines,name='CNIS'){
 const reviewWarnings=/13[º°o]?\s*sal[áa]rio|13\/(?:19|20)\d{2}/i.test(lines.join(' '))?['THIRTEENTH_PERIOD_REQUIRES_SEPARATE_MAPPING']:[];
 const records=new Map(),get=m=>{if(!records.has(m))records.set(m,{'Mês':m+'-01',_statement:'INSS',_inssEvidence:[]});return records.get(m)},seen=new Set();let relation='unknown',section='unknown';
 const add=(m,field,value,role,sourceLine)=>{if(!validMonth(m))throw Error('INSS_MONTH_INVALID');if(!Number.isSafeInteger(value))throw Error('INSS_AMOUNT_INVALID');const key=JSON.stringify([relation,m,field,value]);if(seen.has(key))return;seen.add(key);const r=get(m);r._inssEvidence.push({source:name,relation,month:m,field,role,amountMinor:value,sourceLine});if(r._inssConflicts?.includes(field))return;if(!own(r,field))r[field]=value/100;else if(r[field]!==value/100){delete r[field];r._inssConflicts??=[];r._inssConflicts.push(field)}};
 for(let i=0;i<lines.length;i++){
  const line=String(lines[i]).trim();if(/^Rela[çc][ãa]o Previdenci[áa]ria|^Seq\.?\s/i.test(line)){relation='section-'+i;section='unknown'}
  if(/Remunera[çc][õo]es|Compet[êe]ncia\s+Remunera[çc][ãa]o/i.test(line))section='remuneration';if(/Remunera[çc][ãa]o Declarada/i.test(line))section='declared';
  const annual=line.match(/^@CNIS (\d{4}-\d{2}) ([\d.]+,\d{2})$/);if(annual){add(annual[1],'Remuneração INSS',minor(annual[2]),'consolidated-annual-grid',i);continue}
  const full=line.match(/^(\d{2})\/(\d{4})\s+([\d.]+,\d{2})\s+([\d.]+,\d{2})\s+([\d.]+,\d{2})\*?\s+([\d.]+,\d{2})\s+([\d.]+,\d{2})\s+([\d.]+,\d{2})\s+([\d.]+,\d{2})\*?\s+([\d.]+,\d{2})/);
  if(full){const m=full[2]+'-'+full[1];if(m<'2019-11')throw Error('ANNUAL_CIVIL_SCOPE_INVALID');add(m,'Remuneração Apurada CNIS',minor(full[3]),'apurada-ano-civil',i);add(m,'Remuneração INSS',minor(full[9]),'consolidada-ano-civil',i);get(m)['Teto CNIS']=minor(full[5])/100;continue}
  // Only competence + remuneration pairs. Do not assign pre-2019 declared wages as "apurada".
  for(const match of line.matchAll(/(?<![\d/])((?:0[1-9]|1[0-2]))\/((?:19|20)\d{2})\s+([\d.]+,\d{2})/g)){
   const m=match[2]+'-'+match[1];add(m,section==='declared'?'Remuneração Histórica Declarada':section==='remuneration'?'Remuneração Histórica Informada':'Remuneração sem classificação',minor(match[3]),section==='declared'?'declared-remuneration':section==='remuneration'?'reported-remuneration-unclassified':'unclassified-remuneration-pair',i);
  }
 }
 if(!records.size){if(/CNIS|Extrato Previdenci[áa]rio/i.test(lines.join(' ')))return {kind:'INSS',records:[],reviewOnly:true,reviewWarnings:[...reviewWarnings,'NO_REMUNERATION_ROWS_RECOGNIZED']};throw Error('Tabela de competências CNIS não reconhecida.');}
 return {kind:'INSS',records:[...records.values()].sort((a,b)=>a['Mês'].localeCompare(b['Mês'])),reviewOnly:true,reviewWarnings};
}
function calculate({month,baseMinor,category,periodKind='monthly',rounding,linksConfirmed=false,otherBasesMinor=[]}={}){
 const blocked=code=>({status:'BLOCKED',code,contributionMinor:null});
 if(!validMonth(month)||!Number.isSafeInteger(baseMinor)||baseMinor<0)return blocked('BASE_OR_MONTH_UNKNOWN');
 if(!['employee','domestic','casual'].includes(category))return blocked('CATEGORY_UNSUPPORTED');
 if(!['monthly','13th'].includes(periodKind))return blocked('PERIOD_KIND_UNKNOWN');
 if(!linksConfirmed||!Array.isArray(otherBasesMinor)||otherBasesMinor.some(n=>!Number.isSafeInteger(n)||n<0))return blocked('MULTIPLE_LINKS_UNCONFIRMED');
 // Allocation among simultaneous jobs requires its own contractual/eSocial evidence, not a naive sum.
 if(otherBasesMinor.length)return blocked('MULTIPLE_LINKS_ALLOCATION_REQUIRED');
 if(!['truncate-final','round-final'].includes(rounding))return blocked('ROUNDING_POLICY_REQUIRED');
 const table=TABLES.find(t=>month>=t.from&&month<=t.to);if(!table)return blocked('OFFICIAL_TABLE_NOT_VERSIONED');
 const base=Math.min(baseMinor,table.brackets.at(-1)[0]);let numerator=0;
 if(table.method==='whole-base')numerator=base*table.brackets.find(([cap])=>base<=cap)[1];
 else{let previous=0;for(const [cap,rate] of table.brackets){numerator+=Math.max(0,Math.min(base,cap)-previous)*rate;previous=cap}}
 if(!Number.isSafeInteger(numerator))return blocked('PRECISION_UNSAFE');
 return {status:'CALCULATED',contributionMinor:rounding==='truncate-final'?Math.floor(numerator/10000):Math.round(numerator/10000),table:table.id,source:table.url,method:table.method,rounding,periodKind,baseMinor,ceilingMinor:table.brackets.at(-1)[0],recollectionProven:false};
}
function compare(sources=[],workbook=[],options={}){
 const months=new Map(),get=m=>{if(!months.has(m))months.set(m,{month:m,declared:[],reported:[],unclassified:[],assessed:[],consolidated:[],contributionInss:null,cosernDiscount:null,recollection:null,origins:[],conflicts:[],calculation:{status:'BLOCKED',code:'CALCULATION_CONTEXT_REQUIRED',contributionMinor:null}});return months.get(m)};
 const value=(row,k)=>!own(row,k)?{state:'ABSENT',minor:null}:row[k]===null?{state:'NULL',minor:null}:minor(row[k])===null?{state:'INVALID',minor:null}:{state:'DOCUMENTED',minor:minor(row[k])};
 for(const packet of sources)for(const row of packet.records||[]){const m=String(row['Mês']||'').slice(0,7);if(!validMonth(m))continue;const r=get(m);for(const [field,target] of [['Remuneração Histórica Informada','reported'],['Remuneração sem classificação','unclassified'],['Remuneração Histórica Declarada','declared'],['Remuneração Apurada CNIS','assessed'],['Remuneração INSS','consolidated']]){const v=value(row,field);if(v.state==='DOCUMENTED')r[target].push({...v,source:packet.name||packet.kind,role:target})}r.origins.push(...clone(row._inssEvidence||[]));r.conflicts.push(...row._inssConflicts||[])}
 for(const row of workbook){const m=String(row['Mês']||'').slice(0,7);if(!validMonth(m))continue;const r=get(m);r.workbookOriginal=clone(row);r.contributionInss={...value(row,'Contribuição INSS'),origin:'workbook',independentProven:row._inssContributionIndependent===true};r.cosernDiscount={...value(row,'Contribuição Cosern'),origin:row._cosernSource||'workbook',independentProven:row._cosernContributionIndependent===true};if(row._recollectionProven===true)r.recollection=value(row,'Recolhimento comprovado')}
 const rows=[...months.values()].sort((a,b)=>a.month.localeCompare(b.month));for(const r of rows){for(const key of ['reported','declared','unclassified','assessed','consolidated']){const unique=new Set(r[key].map(v=>v.minor));r[key+'Minor']=unique.size===1?[...unique][0]:null;if(unique.size>1)r.conflicts.push(key+'_DIVERGENT_SOURCES')}r.differenceMinor=r.contributionInss?.minor!==null&&r.contributionInss?.minor!==undefined&&r.cosernDiscount?.minor!==null&&r.cosernDiscount?.minor!==undefined?r.contributionInss.minor-r.cosernDiscount.minor:null}
 for(const r of rows){r.calculations=(options.calculations||[]).filter(c=>c.month===r.month).map(c=>{const result=calculate(c);return {...result,differenceFromCosernMinor:c.discountPeriodConfirmed===true&&c.periodKind==='monthly'&&result.contributionMinor!==null&&r.cosernDiscount?.state==='DOCUMENTED'?result.contributionMinor-r.cosernDiscount.minor:null}});if(r.calculations.length)r.calculation=r.calculations.find(c=>c.periodKind==='monthly')||r.calculations[0]}
 return {schema:'inss-history-review-v1',applyAllowed:false,redeemable:false,firstMonth:rows[0]?.month||null,lastMonth:rows.at(-1)?.month||null,rows,sourceWarnings:sources.flatMap(s=>s.reviewWarnings||[]),transition:transition(rows)};
}
function transition(rows){const independent=rows.filter(r=>r.contributionInss?.independentProven&&r.cosernDiscount?.independentProven&&Number.isSafeInteger(r.contributionInss.minor)&&Number.isSafeInteger(r.cosernDiscount.minor));const matches=independent.filter(r=>r.contributionInss.minor===r.cosernDiscount.minor);return {status:'UNCONFIRMED',month:null,observedIndependentEqualMonths:matches.map(r=>r.month),reason:'Igualdade numérica não prova uma transição; exige documento com marco de vigência.'}}
function documentedTransition(evidence){return evidence?.kind==='contribution-transition'&&validMonth(evidence.month)&&typeof evidence.source==='string'&&evidence.source.trim()&&evidence.reviewed===true?{status:'DOCUMENTED',month:evidence.month,source:evidence.source}:{status:'UNCONFIRMED',month:null}}
const api={TABLES,parse,calculate,compare,transition,documentedTransition,minor};if(typeof module==='object'&&module.exports)module.exports=api;else root.InssHistory=api;
})(globalThis);
