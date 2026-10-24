/* Per-device view preferences, not financial records. */
'use strict';
const FILTER_STORAGE='controle-financeiro-filtros-v1';
const filterStates=()=>({transactions:filters,expenses:expenseFilters,balances:balanceFilters,investments:investmentFilters,loans:loanFilters,summary:summaryFilters,reserve:reserveFilters});
try{const saved=JSON.parse(localStorage.getItem(FILTER_STORAGE)||'{}');for(const [name,state] of Object.entries(filterStates())){const source=saved[name];if(source&&typeof source==='object'&&!Array.isArray(source))for(const key of Object.keys(state))if(Object.hasOwn(source,key)){const v=source[key];if((key==='from'||key==='to')&&v&&!/^[1-9]\d{3}-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?$/.test(v))continue;if(typeof v==='string'||Array.isArray(v)&&v.every(x=>typeof x==='string'))state[key]=v}}if(NAV.some(x=>x[0]===saved.tab))tab=saved.tab}catch{}
const requestedArea=new URL(location.href).searchParams.get('area'),requestedTab=requestedArea==='import'?'settings':requestedArea;if(NAV.some(x=>x[0]===requestedTab))tab=requestedTab;
function saveFilterState(){try{localStorage.setItem(FILTER_STORAGE,JSON.stringify({...filterStates(),tab}))}catch(e){toast('Não foi possível guardar os filtros neste navegador.')}}
const stateRender=render;
render=function(){if(typeof MonthInputEditor!=='undefined'&&MonthInputEditor.deferRender())return;stateRender();saveFilterState()};
document.addEventListener('click',event=>{if(!event.target.closest?.('.multi-filter'))document.querySelectorAll('.multi-filter[open]').forEach(x=>x.open=false)});
let chartTooltip;
function hideChartTooltip(){if(chartTooltip)chartTooltip.hidden=true}
function showChartTooltip(event){const mark=event.target.closest?.('[data-chart-tip]');if(!mark){hideChartTooltip();return}if(!chartTooltip){chartTooltip=document.createElement('div');chartTooltip.className='chart-tooltip';chartTooltip.setAttribute('role','tooltip');document.body.appendChild(chartTooltip)}chartTooltip.textContent=mark.dataset.chartTip;chartTooltip.hidden=false;const box=mark.getBoundingClientRect(),x=event.clientX??box.left,y=event.clientY??box.top;chartTooltip.style.left=Math.max(8,Math.min(x+12,window.innerWidth-chartTooltip.offsetWidth-10))+'px';chartTooltip.style.top=Math.max(8,Math.min(y+12,window.innerHeight-chartTooltip.offsetHeight-10))+'px'}
document.addEventListener('pointerover',showChartTooltip);document.addEventListener('pointermove',showChartTooltip);document.addEventListener('focusin',showChartTooltip);document.addEventListener('focusout',hideChartTooltip);window.addEventListener('scroll',hideChartTooltip,{passive:true});
init();
