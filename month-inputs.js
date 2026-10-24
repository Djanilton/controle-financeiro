/* Month filters are drafts until Enter/blur. Never render or persist partial years. */
(function(root){
'use strict';
const validMonth=value=>/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value);
if(typeof module!=='undefined'&&module.exports){module.exports={validMonth};return}
const drafts=new Map(),originals=new WeakMap();let batching=false,requested=false;
const isMonth=el=>!!el?.matches?.('input[type="month"]')&&!!el.closest('.filter-field,.filter-panel');
function discard(){for(const [el,draft]of drafts)el.value=draft.original;drafts.clear()}
function commit(){
 if(isMonth(document.activeElement))return;
 const pending=[...drafts];drafts.clear();let changed=false,invalid=false;batching=true;
 try{for(const [el,draft]of pending){if(!validMonth(el.value)||!el.validity.valid){el.value=draft.original;invalid=true;continue}if(el.value!==draft.original){changed=true;el.dispatchEvent(new Event('change',{bubbles:true}))}}}finally{batching=false}
 const repaint=changed||requested;requested=false;if(repaint){const focused=document.activeElement,id=focused?.id,group=focused?.closest?.('.multi-filter'),summary=focused?.tagName==='SUMMARY',open=[...document.querySelectorAll('.multi-filter[open]')].map(x=>x.id),top=window.scrollY,start=focused?.selectionStart,end=focused?.selectionEnd;render();for(const key of open)document.getElementById(key)?.setAttribute('open','');const target=id?document.getElementById(id):summary&&group?.id?document.getElementById(group.id)?.querySelector('summary'):null;if(target){target.focus({preventScroll:true});if(start!=null&&typeof target.setSelectionRange==='function')target.setSelectionRange(start,end)}window.scrollTo(0,top)}if(invalid)toast('Informe mês e ano completos. O período anterior foi mantido.');
}
function draft(el){if(!drafts.has(el))drafts.set(el,{original:originals.get(el)??el.defaultValue})}
root.MonthInputEditor={deferRender(){if(batching||drafts.size||isMonth(document.activeElement)){requested=true;return true}return false}};
document.addEventListener('focusin',event=>{const el=event.target;if(!isMonth(el))return;if(!drafts.has(el))originals.set(el,el.value);el.title='Digite o mês e o ano completos. Confirme com Enter ou saia dos campos de mês.'});
document.addEventListener('input',event=>{if(isMonth(event.target)&&!batching)draft(event.target)},true);
document.addEventListener('change',event=>{if(!isMonth(event.target)||batching)return;draft(event.target);event.stopImmediatePropagation();if(document.activeElement!==event.target)setTimeout(commit,0)},true);
document.addEventListener('focusout',event=>{if(isMonth(event.target))setTimeout(commit,0)});
document.addEventListener('keydown',event=>{if(!isMonth(event.target))return;if(event.key==='Enter'){event.preventDefault();event.target.blur()}else if(event.key==='Escape'){event.preventDefault();const el=event.target;el.value=drafts.get(el)?.original??originals.get(el)??el.defaultValue;drafts.delete(el);el.blur()}},true);
document.addEventListener('pointerdown',event=>{if(event.target.closest?.('button[id$="Clear"],button.filter-clear'))discard()},true);
// Repair only invalid saved view preferences, never financial records.
for(const state of [balanceFilters,investmentFilters,loanFilters,summaryFilters,reserveFilters,payrollFilters])for(const key of ['from','to'])if(state[key]&&!validMonth(state[key]))state[key]=(key==='from'?yearStart:today).slice(0,7);
})(typeof globalThis!=='undefined'?globalThis:this);
