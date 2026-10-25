import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const tabs=await(await fetch('http://127.0.0.1:9222/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});ws.send(JSON.stringify({id:i,method,params}));});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
await send('Runtime.enable');await send('Page.enable');
await send('Page.navigate',{url:'http://127.0.0.1:8080'});await wait(1000);
await run('localStorage.clear()');await send('Page.reload');await wait(500);
assert.equal(await run("document.querySelectorAll('.session-card').length"),3);
await run("document.querySelector('[data-account]').click()");
assert(await run("document.querySelector('#account-dialog').open"));
assert(await run("[...document.querySelectorAll('[data-auth-provider]')].every(b=>b.disabled)"));
assert.match(await run("document.querySelector('#auth-status').textContent"),/eingerichtet/);
await run("document.querySelector('#auth-guest').click()");
await run("document.querySelector('[data-action=edit]').click()");
assert(await run("document.querySelector('#editor').open"));
await run("document.querySelectorAll('#sport-choices input').forEach(x=>x.checked=false);document.querySelector('#plan-form').requestSubmit()");
assert.match(await run("document.querySelector('#form-error').textContent"),/Sportart/);
await run("document.querySelector('#sport-choices input[value=Reiten]').checked=true;document.querySelector('#sport-choices input[value=Tennis]').checked=true;document.querySelector('#plan-form').elements.count.value='4';document.querySelector('#plan-form').elements.minutes.value='45';document.querySelector('#plan-form').requestSubmit()");
assert.equal(await run("document.querySelectorAll('.session-card').length"),4);
assert.equal(await run("JSON.parse(localStorage.getItem('athlet-v1')).profile.minutes"),45);
await run("location.hash='goals'");await wait(100);
await run("document.querySelector('#goal-form').elements.title.value='Besser im Gleichgewicht';document.querySelector('#goal-form').elements.focus.value='Koordination';document.querySelector('#goal-form').requestSubmit()");
assert.equal(await run("document.querySelectorAll('.goal-card').length"),1);
await run("document.querySelector('[data-goal-toggle]').click()");assert(await run("document.querySelector('.goal-card').classList.contains('done')"));
await run("location.hash='profile'");await wait(100);
await run("document.querySelector('#race-form').elements.name.value='Herbstturnier';document.querySelector('#race-form').elements.date.value='2026-11-01';document.querySelector('#race-form').requestSubmit()");
assert.equal(await run("document.querySelectorAll('.race-row').length"),1);
await run("location.hash='overview'");await wait(100);
await run("document.querySelector('[data-detail]').click()");assert(await run("document.querySelector('#detail').open"));
await run("document.querySelector('#detail [data-start]').click()");assert(await run("document.querySelector('#workout').open"));
await run("document.querySelector('[data-action=play]').click()");const before=await run("document.querySelector('#timer').textContent");await wait(1200);assert.notEqual(await run("document.querySelector('#timer').textContent"),before);
await run("document.querySelector('[data-action=play]').click()");const paused=await run("document.querySelector('#timer').textContent");await wait(1100);assert.equal(await run("document.querySelector('#timer').textContent"),paused);
await run("document.querySelector('[data-action=next]').click()");assert.equal(await run("document.querySelector('#rep-btn').textContent"),'0 / 8 ＋');
await run("document.querySelector('#rep-btn').click()");assert.equal(await run("document.querySelector('#rep-btn').textContent"),'1 / 8 ＋');
await run("for(let i=0;i<6;i++)document.querySelector('[data-action=next]')?.click()");assert.match(await run("document.querySelector('#workout-content').textContent"),/abgeschlossen/);
assert.equal(await run("JSON.parse(localStorage.getItem('athlet-v1')).completed.length"),1);
await run("document.querySelector('#workout .close-dialog').click()");
assert(await run("validBackup(JSON.parse(localStorage.getItem('athlet-v1')))"));
assert.equal(await run("validBackup({profile:{sports:[]}})"),false);
await send('Page.reload');await wait(500);assert.equal(await run("document.querySelectorAll('.session-card').length"),4);
// Exercise device-local profile isolation; this does not simulate a verified login.
await run("window.dispatchEvent(new CustomEvent('athlet-auth-change',{detail:{user:{uid:'test-account-a'}}}))");
assert.equal(await run("document.querySelectorAll('.session-card').length"),3);
assert.equal(await run("state.profile.goals.length"),0);
await run("window.dispatchEvent(new CustomEvent('athlet-auth-change',{detail:{user:{uid:'test-account-b'}}}))");
assert.equal(await run("state.completed.length"),0);
await run("window.dispatchEvent(new CustomEvent('athlet-auth-change',{detail:{user:null}}))");
assert.equal(await run("document.querySelectorAll('.session-card').length"),4);
assert.equal(await run("state.profile.goals.length"),1);
assert.equal(await run("state.completed.length"),1);
for(const [width,height,name] of [[1440,1100,'desktop'],[390,844,'mobile'],[820,1180,'ipad']]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<640});
 for(const page of ['overview','plan','goals','profile']){await run(`location.hash='${page}'`);await wait(100);assert(await run('document.documentElement.scrollWidth <= innerWidth'),`${name}/${page} has overflow`);}
 await run("location.hash='overview'");await wait(200);const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`/tmp/athlet-${name}-tested.png`,Buffer.from(shot.data,'base64'));
 await run("document.querySelector('[data-account]').click()");assert(await run('document.documentElement.scrollWidth <= innerWidth'));await run("document.querySelector('#auth-guest').click()");
}
assert.deepEqual(errors,[]);
console.log('Browserprüfung bestanden: Planung, Ziele, Wettkämpfe, Training, Speicherung, Anmeldemaske ohne Konfiguration, getrennte lokale Kontoprofile und drei Bildschirmgrößen.');
}finally{ws.close();}
