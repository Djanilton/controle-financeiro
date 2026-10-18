(function(root){
'use strict';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const num=v=>typeof v==='number'?v:Number(String(v??'').replace(/R\$|\s/g,'').replace(/\./g,'').replace(',','.'))||0;
const cents=v=>Math.round((v+Number.EPSILON)*100)/100;
const MONTHS=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const RUBRICS={M010:'Salário Básico','20CN':'Benef pre-escola','/314':'Trib. INSS','/401':'Imposto IRRF','/402':'Imposto IRRF','/385':'Imposto IRRF','/505':'Vale Refeição','55AN':'Mensalidade Neos','59AN':'Mensalidade Neos','55CN':'Cesta Base','561N':'Desc Emp Cosern','573N':'Aj Assint Sintern','6A9N':'Bradesco Dental',BE10:'Unimed',BE22:'Seguro de Vida','679N':'Co partic Unimed','066N':'Prov Neos férias','54AN':'Prov Neos férias',M388:'Prov INSS férias',M389:'Prov INSS férias','548N':'prov desc férias','/355':'Desc Adiant férias','/356':'Desc Adiant férias','1AM1':'Média férias','1AMA':'Média férias','0AM1':'Média férias','0AMA':'Média férias','1CM1':'Média férias 1/3','1CMA':'Média férias 1/3','0CM1':'Média férias 1/3','0CMA':'Média férias 1/3','277N':'grat extra férias','278N':'grat extra férias','110N':'grat extra férias','276N':'grat extra férias',MC03:'Férias',MZ00:'Férias',MC04:'Férias Mês 1/3',MZ02:'Férias Mês 1/3',MC40:'abono férias',MZ20:'abono férias',MC42:'abono férias 1/3',MZ22:'abono férias 1/3'};
function pdfLines(items){
 const angles=new Map();for(const item of items){if(!item.str?.trim())continue;const a=Math.round(Math.atan2(item.transform?.[1]??0,item.transform?.[0]??1)*180/Math.PI);angles.set(a,(angles.get(a)||0)+item.str.length)}const angle=([...angles].sort((a,b)=>b[1]-a[1])[0]?.[0]||0)*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle);
 const groups=[];
 for(const item of items){if(!item.str?.trim())continue;const ox=item.transform?.[4]||0,oy=item.transform?.[5]||0,y=-sin*ox+cos*oy,x=cos*ox+sin*oy;let row=groups.find(x=>Math.abs(x.y-y)<1.5);if(!row){row={y,items:[]};groups.push(row)}row.items.push({...item,x})}
 return groups.sort((a,b)=>b.y-a.y).map(x=>x.items.sort((a,b)=>a.x-b.x).map(t=>t.str).join(' ').replace(/\s+/g,' ').trim());
}
function parsePDF(lines,name='contracheque.pdf'){
 const text=lines.join('\n'),n=norm(text);
 if(!/c o m p r o v a n t e|comprovante.*pagamento|rubrica/.test(n))throw Error('PDF não reconhecido como contracheque: '+name);
 const named=name.match(/(?:^|\D)(0[1-9]|1[0-2])(20\d{2})(?:\D|$)/),reference=n.match(new RegExp('('+MONTHS.join('|')+')\\s+(20\\d{2})'));
 const month=reference?reference[2]+'-'+String(MONTHS.indexOf(reference[1])+1).padStart(2,'0'):named?named[2]+'-'+named[1]:'';
 if(!month)throw Error('Competência não identificada em '+name);
 const entries=[];let printed=null,paymentDate='',printedNet=null;
 for(const line of lines){const parts=line.split('|').map(s=>s.trim());
  if(parts.length>=8&&/^[A-Z0-9/]{3,5}$/i.test(parts[1])&&parts[3]&&!/^[-]+$/.test(parts[3])){
   const earnings=parts[5],deductions=parts[6];
   for(const [value,type] of [[earnings,'Vantagens'],[deductions,'Descontos']])if(/\d,\d{2}/.test(value))entries.push({code:parts[1],description:RUBRICS[parts[1]]||parts[3],originalDescription:parts[3],type,amount:num(value),reference:parts[4]||''});
  }
  const broken=line.match(/^\|[-\s]*(\/35[56])[-\s]+.*?([\d.]+,\d{2})[-\s]*\|$/);if(broken&&parts.length<8)entries.push({code:broken[1],description:RUBRICS[broken[1]],originalDescription:'Adiantamento de férias',type:'Descontos',amount:num(broken[2]),reference:''});
  if(/T\s*O\s*T\s*A\s*I\s*S/i.test(line)){const v=line.match(/-?\d[\d.]*,\d{2}/g)||[];if(v.length>=2)printed={earnings:num(v.at(-2)),deductions:num(v.at(-1))}}
  const payment=line.match(/\b(\d{2})\.(\d{2})\.(20\d{2})\b/);if(payment){paymentDate=payment[3]+'-'+payment[2]+'-'+payment[1];const v=line.match(/-?\d[\d.]*,\d{2}/g);if(v?.length)printedNet=num(v[0])}
 }
 if(!entries.length||!printed)throw Error('Rubricas ou totais não encontrados em '+name+'. O documento precisa conter texto selecionável.');
 const earnings=cents(entries.filter(x=>x.type==='Vantagens').reduce((s,x)=>s+x.amount,0)),deductions=cents(entries.filter(x=>x.type==='Descontos').reduce((s,x)=>s+x.amount,0)),net=cents(earnings-deductions);
 if(Math.abs(earnings-printed.earnings)>.02||Math.abs(deductions-printed.deductions)>.02||printedNet!==null&&Math.abs(net-printedNet)>.02)throw Error('Totais do PDF não conferem com as rubricas em '+name+'. Importação suspensa.');
 const type=/ferias/.test(norm(name))?'Férias':/plr|particip.*resultado/.test(norm(name))?'PLR':/13/.test(name)?'13º salário':/retro|reajuste|acordo/.test(norm(name))?'Complementar':'Salário';
 return {month,paymentDate,type,name,earnings,deductions,net,entries,status:'Realizado'};
}
function xmlText(book,key){const c=book.files?.[key]?.content;return c?typeof c==='string'?c:new TextDecoder().decode(c):''}
function workbook(book,X,name='Contracheques',asOf=new Date().toISOString().slice(0,7)){
 const records=[],checks=[];
 const styles=xmlText(book,'xl/styles.xml'),fonts=[...(styles.match(/<fonts\b[^>]*>([\s\S]*?)<\/fonts>/)?.[1]||'').matchAll(/<font\b[^>]*>([\s\S]*?)<\/font>/g)].map(x=>x[1]),xfs=[...(styles.match(/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/)?.[1]||'').matchAll(/<xf\b[^>]*fontId="(\d+)"[^>]*>/g)].map(x=>Number(x[1]));
 const red=s=>{const f=fonts[xfs[s]??0]||'',rgb=f.match(/<color[^>]*rgb="(?:FF)?([A-F\d]{6})"/i)?.[1];return rgb&&parseInt(rgb.slice(0,2),16)>180&&parseInt(rgb.slice(2,4),16)<100};
 for(const year of book.SheetNames.filter(x=>/^\d{4}$/.test(x))){const sheet=book.Sheets[year];if(!sheet)continue;const rows=X.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true});
  const idx=book.SheetNames.indexOf(year)+1,xml=xmlText(book,'xl/worksheets/sheet'+idx+'.xml'),styleMap=new Map([...xml.matchAll(/<c\b([^>]*)>/g)].map(x=>[x[1].match(/\br="([^"]+)"/)?.[1],Number(x[1].match(/\bs="(\d+)"/)?.[1]||0)]));
  for(let m=1;m<=12;m++){const month=year+'-'+String(m).padStart(2,'0'),entries=[];
   for(let i=1;i<rows.length;i++){const r=rows[i],type=/^vantagen|^provento/i.test(norm(r[1]))?'Vantagens':/^desconto/i.test(norm(r[1]))?'Descontos':'';if(!type||r[m+1]===''||!Number.isFinite(Number(r[m+1])))continue;const address=X.utils.encode_cell({r:i,c:m+1}),cell=sheet[address]||sheet['!data']?.[i]?.[m+1],predicted=red(styleMap.get(address))||month>asOf;entries.push({description:String(r[0]).trim(),type,amount:Number(r[m+1]),status:predicted?'Previsto':'Realizado',cell:address,formula:cell?.f||''})}
   if(!entries.length)continue;
   const earnings=cents(entries.filter(x=>x.type==='Vantagens').reduce((s,x)=>s+x.amount,0)),deductions=cents(entries.filter(x=>x.type==='Descontos').reduce((s,x)=>s+x.amount,0));
   const saved=rows.find(x=>/^total a receber$/i.test(norm(x[0])))?.[m+1];if(typeof saved==='number'&&Math.abs(saved-(earnings-deductions))>.02)checks.push({month,saved,calculated:cents(earnings-deductions)});
   records.push({month,name,type:'Consolidado da planilha',entries,earnings,deductions,net:cents(earnings-deductions),status:entries.some(x=>x.status==='Previsto')?'Previsto':'Realizado'});
  }
 }
 if(!records.length)throw Error('Não foram encontradas abas anuais de contracheques.');return {records,checks};
}
function digest(document){return JSON.stringify([document.month,document.paymentDate,document.earnings,document.deductions,document.entries.map(x=>[x.code||norm(x.description),x.type,x.amount,x.reference||''])])}
function mergePDF(documents,incoming){const hash=digest(incoming),same=documents.find(x=>digest(x)===hash);if(same)return documents;return [...documents.filter(x=>!(norm(x.name)===norm(incoming.name)&&x.month===incoming.month)),incoming]}
function monthly(base,documents){const out=new Map(base.map(x=>[x.month,{...x,fromPDF:false,documents:[]}])) ,groups=new Map();for(const d of documents){if(!groups.has(d.month))groups.set(d.month,[]);groups.get(d.month).push(d)}for(const [month,docs] of groups){const entries=docs.flatMap(d=>d.entries.map(x=>({...x,status:'Realizado',source:d.name,paymentDate:d.paymentDate}))),earnings=cents(docs.reduce((s,x)=>s+x.earnings,0)),deductions=cents(docs.reduce((s,x)=>s+x.deductions,0)),prior=out.get(month);out.set(month,{month,entries,earnings,deductions,net:cents(earnings-deductions),status:'Realizado',fromPDF:true,documents:docs.map(x=>x.name),baselineDifference:prior?cents(earnings-deductions-prior.net):null})}return [...out.values()].sort((a,b)=>a.month.localeCompare(b.month))}
root.PayrollCore={norm,num,cents,RUBRICS,pdfLines,parsePDF,workbook,digest,mergePDF,monthly};if(typeof module!=='undefined')module.exports=root.PayrollCore;
})(typeof globalThis!=='undefined'?globalThis:this);
