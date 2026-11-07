/* Dedicated browser database: never included in appStateData/Graph synchronization. */
(function(root){'use strict';
let pending;
function db(){return pending??=new Promise((resolve,reject)=>{const r=indexedDB.open('controle-financeiro-invoice-review-v1',1);r.onupgradeneeded=()=>{r.result.createObjectStore('events',{keyPath:'id'})};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();pending=null};resolve(r.result)};r.onerror=()=>{pending=null;reject(Error('REVIEW_STORAGE_UNAVAILABLE'))}})}
async function all(){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('events','readonly'),r=t.objectStore('events').getAll();t.oncomplete=()=>resolve(r.result);t.onabort=t.onerror=()=>reject(Error('REVIEW_STORAGE_READ_FAILED'))})}
async function append(value){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('events','readwrite');t.objectStore('events').add(value);t.oncomplete=()=>resolve();t.onabort=t.onerror=()=>reject(Error('REVIEW_STORAGE_WRITE_FAILED'))})}
root.InvoiceReviewStore={all,append};
})(globalThis);
