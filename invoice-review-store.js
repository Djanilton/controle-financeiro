/* Dedicated browser database: never included in appStateData/Graph synchronization. */
(function(root){'use strict';
let pending;
function db(){return pending??=new Promise((resolve,reject)=>{const r=indexedDB.open('controle-financeiro-invoice-review-v1',2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('events'))r.result.createObjectStore('events',{keyPath:'id'});if(!r.result.objectStoreNames.contains('batch'))r.result.createObjectStore('batch',{keyPath:'key'})};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();pending=null};resolve(r.result)};r.onerror=()=>{pending=null;reject(Error('REVIEW_STORAGE_UNAVAILABLE'))}})}
async function all(){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('events','readonly'),r=t.objectStore('events').getAll();t.oncomplete=()=>resolve(r.result);t.onabort=t.onerror=()=>reject(Error('REVIEW_STORAGE_READ_FAILED'))})}
async function append(value){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('events','readwrite');t.objectStore('events').add(value);t.oncomplete=()=>resolve();t.onabort=t.onerror=()=>reject(Error('REVIEW_STORAGE_WRITE_FAILED'))})}
async function batchGet(key){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('batch','readonly'),r=t.objectStore('batch').get(key);t.oncomplete=()=>resolve(r.result?.value??null);t.onabort=t.onerror=()=>reject(Error('BATCH_STORAGE_READ_FAILED'))})}
async function batchPut(key,value){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('batch','readwrite');t.objectStore('batch').put({key,value});t.oncomplete=()=>resolve();t.onabort=t.onerror=()=>reject(Error('BATCH_STORAGE_WRITE_FAILED'))})}
// A source version is immutable; the small index points at the last verified version.
async function rememberFile(item,entry){const key='file:'+item.id+':'+entry.version+':'+(entry.parserKey||'legacy');await batchPut(key,entry);await batchPut('index:'+item.id,{key,version:entry.version,hash:entry.hash});return entry}
async function cachedFile(id){const index=await batchGet('index:'+id);return index?batchGet(index.key):null}
root.InvoiceReviewStore={all,append,batchGet,batchPut,rememberFile,cachedFile};
})(globalThis);
