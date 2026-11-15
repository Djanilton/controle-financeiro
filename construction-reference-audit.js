/* Offline semantic comparison only. Never opens Excel, calls a service or changes a financial base. */
(function(root){'use strict';
function compare(actual,reference,{reviewed=false,actualMonth='month',referenceMonth='month',fields=[]}={}){
 if(!reviewed||!Array.isArray(actual)||!Array.isArray(reference)||!fields.length||fields.some(f=>!f.name||!f.actual||!f.reference||!f.unit||!Number.isFinite(f.tolerance)||f.tolerance<0))throw Error('REFERENCE_MAPPING_REVIEW_REQUIRED');
 const index=(rows,key)=>{const map=new Map();for(const row of rows){const month=row[key];if(typeof month!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||map.has(month))throw Error('REFERENCE_MONTH_INVALID_OR_DUPLICATE');map.set(month,row)}return map},a=index(actual,actualMonth),b=index(reference,referenceMonth),results=[];
 for(const month of [...new Set([...a.keys(),...b.keys()])].sort())for(const field of fields){const x=a.get(month)?.[field.actual],y=b.get(month)?.[field.reference],present=v=>typeof v==='number'&&Number.isFinite(v);results.push({month,field:field.name,unit:field.unit,status:!a.has(month)?'MODEL_MONTH_MISSING':!b.has(month)?'REFERENCE_MONTH_MISSING':!present(x)||!present(y)?'VALUE_UNCONFIRMED':Math.abs(x-y)<=field.tolerance?'MATCH':'NUMERIC_DIFFERENCE',actual:x??null,reference:y??null})}
 return {schema:'construction-reference-audit-v1',applyAllowed:false,semanticMappingReviewed:true,results,counts:results.reduce((m,r)=>(m[r.status]=(m[r.status]||0)+1,m),{}),passed:results.every(r=>r.status==='MATCH')};
}
const api={compare};if(typeof module==='object'&&module.exports)module.exports=api;else root.ConstructionReferenceAudit=api;
})(globalThis);
