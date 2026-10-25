const assert=require('node:assert/strict');
const E=require('./dist/engine.js');
const p={sports:['Reiten'],equipment:[],count:3,minutes:30,goals:[],competitions:[]};
let checked=0;
for(const sport of Object.keys(E.sports))for(let count=1;count<=6;count++)for(const minutes of [15,20,30,45,60,90]){
  const result=E.generate({...p,sports:[sport],count,minutes},'2026-10-26');
  assert.equal(result.length,count);assert.equal(new Set(result.map(s=>s.day)).size,count);
  for(const s of result){assert.equal(s.blocks.reduce((a,b)=>a+b.seconds,0),minutes*60);assert(s.blocks.every(b=>b.seconds>0&&typeof b.instruction==='string'));assert.equal(s.blocks[0].kind,'Aufwärmen');assert.equal(s.blocks.at(-1).kind,'Dehnen');}
  checked++;
}
const mix=E.generate({...p,sports:['Reiten','Schwimmen'],equipment:['Widerstandsband','Kurzhanteln','Balancekissen']},'2026-10-26');
assert(mix.some(s=>s.blocks.some(b=>b.name==='Balance auf dem Kissen')));
assert(E.generate({...p,sports:['Laufen'],goals:[{focus:'Koordination',done:false}]},'2026-10-26').some(s=>s.blocks.some(b=>b.kind==='Koordination')));
const race=E.generate({...p,competitions:[{name:'Turnier',date:'2026-10-28'}]},'2026-10-26');
assert(race[0].light);assert(race[1].light);assert(!race[2].light);
assert(race[0].blocks.every(b=>b.reps===0));
assert.equal(E.weekKey(new Date('2026-10-25T12:00:00')),'2026-10-19');
assert.equal(E.weekKey(new Date('2026-10-26T12:00:00')),'2026-10-26');
assert.throws(()=>E.generate({...p,sports:[]}),/Sportart/);
console.log(`${checked} Planungskombinationen, Zeitbudgets, Koordination, Wettkampfentlastung und Wochenwechsel geprüft.`);
