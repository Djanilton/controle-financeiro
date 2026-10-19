/* Device-only navigation preference: never written to financial files. */
const SIDEBAR_STORAGE='controle-financeiro-sidebar-compact-v1';
function setSidebarCompact(compact,persist=false){
 document.body.classList.toggle('sidebar-compact',compact);
 document.body.classList.remove('menu-open');
 const button=document.getElementById('menuButton');
 button.setAttribute('aria-expanded',String(!compact));
 button.setAttribute('aria-label',compact?'Expandir menu':'Retrair menu');
 button.title=compact?'Expandir menu':'Retrair menu';
 if(persist)try{localStorage.setItem(SIDEBAR_STORAGE,String(compact))}catch{}
 if(typeof alignConstructionHeader==='function')requestAnimationFrame(alignConstructionHeader);
}
function toggleSidebar(){setSidebarCompact(!document.body.classList.contains('sidebar-compact'),true)}
let sidebarSaved;try{sidebarSaved=localStorage.getItem(SIDEBAR_STORAGE)}catch{}
setSidebarCompact(sidebarSaved===null||sidebarSaved===undefined?matchMedia('(max-width: 1024px)').matches:sidebarSaved==='true');
document.getElementById('menuButton').onclick=toggleSidebar;
