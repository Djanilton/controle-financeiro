/* Source-only session: no operational authentication, financial database, timers or write transport. */
(function(root){'use strict';
const SCOPES=Object.freeze(['User.Read','Files.Read']),fail=code=>{throw Object.assign(Error(code),{code})};
const encode=p=>p.split('/').map(encodeURIComponent).join('/');
function paths(value){const result={};for(const [key,last]of [['invoiceReportsFolder','Faturas cartão'],['reportsFolder','Relatório App Minhas Finanças']]){const p=value[key];if(typeof p!=='string'||p.split('/').some(s=>!s||s==='.'||s==='..')||/[:?#\\\u0000-\u001f]/.test(p)||p.split('/').at(-1).normalize('NFC').toLocaleLowerCase('pt-BR')!==last.toLocaleLowerCase('pt-BR'))fail('SOURCE_READ_FOLDER_CONFIGURATION_REQUIRED');result[key]=p}return result}
function create({clientId,redirectUri,createAuth,fetch:request,folders,now=Date.now}={}){
 if(typeof createAuth!=='function'||typeof request!=='function')fail('SOURCE_READ_DEPENDENCIES_REQUIRED');
 let account=null,token=null,expires=0,auth=null,connecting=null,epoch=0;const grants=new Map(),controllers=new Set();let configured=null;
 try{configured=paths(folders||{})}catch{}
 const revoke=()=>{epoch++;token=null;expires=0;account=null;grants.clear();for(const c of controllers)c.abort();controllers.clear()};
 function configure(next){const checked=paths(next);revoke();configured=checked}
 const connected=()=>!!(token&&account&&expires>now());
 async function connect(){if(connecting)return connecting;if(!clientId||typeof redirectUri!=='string')fail('SOURCE_READ_CLIENT_CONFIGURATION_REQUIRED');
  revoke();const attempt=epoch;connecting=(async()=>{try{auth??=createAuth({auth:{clientId,authority:'https://login.microsoftonline.com/consumers',redirectUri},cache:{cacheLocation:'memoryStorage',cacheMigrationEnabled:false}});await auth.initialize?.();const r=await auth.acquireTokenPopup({scopes:[...SCOPES],redirectUri,...(account?{account}:{})});if(attempt!==epoch)fail('SOURCE_READ_SESSION_CHANGED');if(!r?.accessToken||!r.account||!(r.expiresOn instanceof Date)||+r.expiresOn<=now())fail('SOURCE_READ_AUTH_RESPONSE_INVALID');token=r.accessToken;account=r.account;expires=+r.expiresOn;return true}catch{revoke();fail('SOURCE_READ_CONNECTION_REQUIRED')}finally{connecting=null}})();return connecting;
 }
 const fileAllowed=(name,role)=>typeof name==='string'&&(role==='invoice'?/\.(xlsx|csv|ofx)$/i.test(name):/^(despesas|receitas|transfer[eê]ncias)-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.xlsx$/i.test(name));
 function target(input,options){if(options?.method&&options.method!=='GET'||options?.body!==undefined||Object.keys(options||{}).some(k=>!['silent','method'].includes(k)))fail('SOURCE_READ_METHOD_BLOCKED');if(!configured)fail('SOURCE_READ_FOLDER_CONFIGURATION_REQUIRED');
  if(typeof input!=='string')fail('SOURCE_READ_PATH_BLOCKED');let url;
  if(input.startsWith('/')&&!input.startsWith('//'))url=new URL('https://graph.microsoft.com/v1.0'+input);else{url=new URL(input);if(!url.pathname.startsWith('/v1.0/'))fail('SOURCE_READ_PATH_BLOCKED')}
  if(url.protocol!=='https:'||url.hostname!=='graph.microsoft.com'||url.port||url.username||url.password||url.hash)fail('SOURCE_READ_PATH_BLOCKED');
  for(const key of url.searchParams.keys())if(!['$select','$top','$skiptoken','$orderby'].includes(key))fail('SOURCE_READ_QUERY_BLOCKED');
  for(const [key,p]of Object.entries(configured))if(url.pathname==='/v1.0/me/drive/root:/'+encode(p))return {url,kind:'root',role:key==='invoiceReportsFolder'?'invoice':'mf'};
  const m=url.pathname.match(/^\/v1\.0\/me\/drive\/items\/([^/]+)(?:\/(children|content))?$/);if(!m)fail('SOURCE_READ_PATH_BLOCKED');const id=decodeURIComponent(m[1]),grant=grants.get(id);if(!grant)fail('SOURCE_READ_UNAUTHORIZED_ITEM');
  if(m[2]==='children'&&grant.folder)return {url,kind:'children',grant};
  if(!m[2]&&!grant.folder){url.search='$select=id,name,eTag,size,file,parentReference';return {url,kind:'metadata',grant}}
  if(m[2]==='content'&&!grant.folder&&grant.verified===epoch)return {url,kind:'content',grant};
  fail('SOURCE_READ_PATH_BLOCKED');
 }
 async function graph(input,options={}){let t;try{t=target(input,options)}catch(error){if(error.code)throw error;fail('SOURCE_READ_PATH_BLOCKED')}if(!connected())fail('SOURCE_READ_CONNECTION_REQUIRED');const generation=epoch,c=new AbortController();controllers.add(c);
  try{const r=await request(t.url.href,{method:'GET',headers:{Authorization:'Bearer '+token},credentials:'omit',referrerPolicy:'no-referrer',signal:c.signal});if(generation!==epoch)fail('SOURCE_READ_SESSION_CHANGED');if(!r.ok){if(r.status===401){revoke();fail('SOURCE_READ_CONNECTION_REQUIRED')}fail(r.status===403?'SOURCE_READ_PERMISSION_DENIED':'SOURCE_READ_HTTP_ERROR')}
   if(t.kind==='content')return r;
   const json=await r.json();if(generation!==epoch)fail('SOURCE_READ_SESSION_CHANGED');
   if(t.kind==='root'){if(!json?.id||!json.folder||json.file)fail('SOURCE_READ_FOLDER_INVALID');grants.set(json.id,{id:json.id,folder:true,role:t.role,depth:0})}
   else if(t.kind==='children'){if(!Array.isArray(json.value)||json.value.length>10000)fail('SOURCE_READ_PAGE_INVALID');const accepted=[];
    for(const item of json.value){if(!item?.id||typeof item.name!=='string')fail('SOURCE_READ_PAGE_INVALID');let grant=null;if(item.folder&&!item.file&&t.grant.role==='invoice'&&t.grant.depth===0&&/^(19|20|21)\d{2}$/.test(item.name))grant={id:item.id,folder:true,role:'invoice',depth:1,parentId:t.grant.id};else if(item.file&&!item.folder&&fileAllowed(item.name,t.grant.role))grant={id:item.id,folder:false,name:item.name,role:t.grant.role,parentId:t.grant.id};if(!grant)continue;const prior=grants.get(item.id);if(prior&&(prior.parentId!==grant.parentId||prior.role!==grant.role||prior.name!==grant.name))fail('SOURCE_READ_ITEM_CONFLICT');grants.set(item.id,grant);accepted.push(item)}json.value=accepted;
   }else{if(json?.id!==t.grant.id||!json.file||json.folder||json.name!==t.grant.name||json.parentReference?.id!==t.grant.parentId||!fileAllowed(json.name,t.grant.role)||!json.eTag||!Number.isSafeInteger(json.size)||json.size<0||json.size>30000000)fail('SOURCE_READ_FILE_IDENTITY_INVALID');t.grant.verified=epoch}
   return new Response(JSON.stringify(json),{status:r.status,headers:{'Content-Type':'application/json'}});
  }catch(error){if(error.code)throw error;fail('SOURCE_READ_TRANSPORT_ERROR')}finally{controllers.delete(c)}
 }
 async function pages(input){const out=[],seen=new Set();let next=input;while(next){if(seen.size>=50||seen.has(next))fail('SOURCE_READ_PAGINATION_LIMIT');seen.add(next);const json=await(await graph(next)).json();if(!Array.isArray(json.value)||out.length+json.value.length>10000)fail('SOURCE_READ_PAGE_INVALID');out.push(...json.value);next=json['@odata.nextLink']}return out}
 return Object.freeze({connect,connected,configure,disconnect:revoke,graph,pages});
}
const api={SCOPES,paths,create};if(typeof module==='object'&&module.exports)module.exports=api;else root.SourcesReadSession=Object.freeze(api);
})(globalThis);
