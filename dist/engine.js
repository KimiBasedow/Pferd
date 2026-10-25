(function(root){
  const sports={
    Reiten:{muscles:'Rumpf · Adduktoren · Rücken',coord:true, strength:['Beckenheben','Seitlicher Ausfallschritt','Bird Dog']},
    Laufen:{muscles:'Beine · Gesäß · Waden',coord:false,strength:['Kniebeuge','Beckenheben','Wadenheben']},
    Tennis:{muscles:'Rumpf · Schultern · Beine',coord:true,strength:['Seitlicher Ausfallschritt','Schulter-Y','Bird Dog']},
    Fußball:{muscles:'Beine · Rumpf · Adduktoren',coord:true,strength:['Kniebeuge','Seitlicher Ausfallschritt','Beckenheben']},
    Radfahren:{muscles:'Beine · Gesäß · Rücken',coord:false,strength:['Beckenheben','Bird Dog','Kniebeuge']},
    Schwimmen:{muscles:'Schultern · Rücken · Rumpf',coord:false,strength:['Schulter-Y','Bird Dog','Unterarmstütz']},
    Klettern:{muscles:'Rücken · Schultern · Rumpf',coord:true,strength:['Schulter-Y','Unterarmstütz','Beckenheben']},
    Tanzen:{muscles:'Rumpf · Beine · Füße',coord:true,strength:['Wadenheben','Seitlicher Ausfallschritt','Bird Dog']}
  };
  const instructions={
    'Locker aufwärmen':'Gehe locker auf der Stelle, kreise die Schultern und mobilisiere sanft die Hüfte.',
    'Kniebeuge':'Füße etwa hüftbreit. Schiebe die Hüfte nach hinten und beuge die Knie kontrolliert. Richte dich langsam auf.',
    'Beckenheben':'In Rückenlage die Füße aufstellen. Hebe das Becken kontrolliert an, halte kurz und senke es wieder.',
    'Seitlicher Ausfallschritt':'Mache einen Schritt zur Seite, schiebe die Hüfte zurück und kehre kontrolliert zurück. Wechsle die Seite.',
    'Bird Dog':'Im Vierfüßlerstand einen Arm und das gegenüberliegende Bein strecken. Halte den Rumpf ruhig und wechsle die Seite.',
    'Wadenheben':'Stelle dich aufrecht hin, hebe langsam die Fersen und senke sie kontrolliert. Halte dich bei Bedarf fest.',
    'Schulter-Y':'Hebe die Arme ohne Gewicht diagonal zu einem Y. Schultern bleiben entspannt. Nur im angenehmen Bewegungsbereich.',
    'Unterarmstütz':'Stütze dich auf Unterarme und Knie oder Füße. Atme ruhig und halte den Rumpf stabil.',
    'Einbeinstand mit Armbewegung':'Stehe nahe einer stabilen Stütze auf einem Bein und bewege langsam die Arme. Wechsle nach der halben Zeit das Bein.',
    'Seitwärtsschritte mit Rhythmus':'Gehe je zwei kleine Schritte nach rechts und links. Ergänze einen ruhigen Klatschrhythmus.',
    'Lockeres Ausdauertraining':'Gehe zügig auf der Stelle oder draußen. Wähle ein Tempo, bei dem du dich gut unterhalten kannst.',
    'Hüftmobilität':'Im sicheren Stand die Hüfte sanft kreisen. Bewege dich langsam und bleibe im angenehmen Bereich.',
    'Wade und Hüftbeuger dehnen':'Dehne Wade und Hüftvorderseite sanft, ohne zu federn. Wechsle nach der halben Zeit die Seite.',
    'Brust und Schultern mobilisieren':'Öffne die Arme sanft zur Seite, atme ruhig und bewege die Schultern kontrolliert.',
    'Rudern mit Band':'Befestige das Band sicher auf Brusthöhe. Ziehe die Ellbogen kontrolliert nach hinten und löse langsam.',
    'Kurzhantel-Kniebeuge':'Halte eine leichte Hantel vor der Brust. Beuge Hüfte und Knie kontrolliert und richte dich langsam auf.',
    'Balance auf dem Kissen':'Stehe neben einer stabilen Stütze auf dem Balancekissen. Beginne beidbeinig und halte den Blick ruhig.'
  };
  function monday(date=new Date()){const d=new Date(date);d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
  function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function weekKey(date=new Date()){return iso(monday(date));}
  function generate(p,week=weekKey()){
    const selected=(p.sports||[]).filter(s=>sports[s]);if(!selected.length)throw Error('Wähle mindestens eine Sportart.');
    const count=Math.max(1,Math.min(6,Number(p.count)||3));const minutes=Math.max(15,Math.min(90,Number(p.minutes)||30));
    const days={1:[2],2:[1,4],3:[0,2,5],4:[0,2,4,6],5:[0,1,3,4,6],6:[0,1,2,4,5,6]}[count];
    const hasCoord=selected.some(s=>sports[s].coord)||(p.goals||[]).some(g=>!g.done&&g.focus==='Koordination');const names=[...new Set(selected.flatMap(s=>sports[s].strength))];
    if(p.equipment.includes('Kurzhanteln'))names[names.indexOf('Kniebeuge')>=0?names.indexOf('Kniebeuge'):0]='Kurzhantel-Kniebeuge';
    if(p.equipment.includes('Widerstandsband'))names.push('Rudern mit Band');
    const goals=(p.goals||[]).filter(g=>!g.done).map(g=>g.focus);let focuses=['Kraft & Stabilität',hasCoord?'Koordination & Balance':'Ausdauer & Rumpf','Mobilität & Ausgleich'];
    if(goals.includes('Koordination'))focuses[1]='Koordination & Balance';if(goals.includes('Ausdauer'))focuses[1]='Ausdauer & Rumpf';if(goals.includes('Kraft'))focuses[2]='Kraft & Stabilität';if(goals.includes('Beweglichkeit'))focuses[2]='Mobilität & Ausgleich';
    return days.map((day,i)=>{
      const date=monday(new Date(week+'T12:00:00'));date.setDate(date.getDate()+day);
      const near=(p.competitions||[]).find(c=>{const gap=(new Date(c.date+'T12:00:00')-date)/86400000;return gap>=0&&gap<=2;});
      const focus=near?'Lockere Aktivierung':focuses[i%focuses.length];
      let list=near?['Locker aufwärmen','Hüftmobilität','Brust und Schultern mobilisieren','Lockeres Ausdauertraining','Wade und Hüftbeuger dehnen']:
        ['Locker aufwärmen',names[i%names.length],names[(i+1)%names.length],hasCoord?(p.equipment.includes('Balancekissen')?'Balance auf dem Kissen':'Einbeinstand mit Armbewegung'):'Unterarmstütz',focus.includes('Ausdauer')?'Lockeres Ausdauertraining':hasCoord?'Seitwärtsschritte mit Rhythmus':'Lockeres Ausdauertraining','Hüftmobilität','Wade und Hüftbeuger dehnen'];
      if(!near&&focus.includes('Mobilität'))list=['Locker aufwärmen','Hüftmobilität','Brust und Schultern mobilisieren',names[(i+1)%names.length],hasCoord?'Einbeinstand mit Armbewegung':'Unterarmstütz','Lockeres Ausdauertraining','Wade und Hüftbeuger dehnen'];
      const total=minutes*60;const weights=list.map((_,j)=>j===0?2:j===list.length-1?2:focus.includes('Ausdauer')&&list[j]==='Lockeres Ausdauertraining'?6:3);const sum=weights.reduce((a,b)=>a+b,0);let used=0;
      const blocks=list.map((name,j)=>{const sec=j===list.length-1?total-used:Math.floor(total*weights[j]/sum);used+=sec;return {name,seconds:sec,instruction:instructions[name],kind:j===0?'Aufwärmen':j===list.length-1?'Dehnen':name.includes('Ausdauer')?'Ausdauer':name.includes('Balance')||name.includes('Einbein')||name.includes('Rhythmus')?'Koordination':name.includes('mobil')||name.includes('Hüftmobil')?'Mobilität':'Kraft',reps:['Unterarmstütz','Locker aufwärmen','Lockeres Ausdauertraining','Hüftmobilität','Wade und Hüftbeuger dehnen','Brust und Schultern mobilisieren','Einbeinstand mit Armbewegung','Seitwärtsschritte mit Rhythmus','Balance auf dem Kissen'].includes(name)?0:8};});
      return {id:week+'-'+day,date:iso(date),day,focus,minutes,light:!!near,race:near?.name,blocks,sports:selected};
    });
  }
  root.AthletEngine={sports,instructions,monday,iso,weekKey,generate};
  if(typeof module!=='undefined')module.exports=root.AthletEngine;
})(typeof window!=='undefined'?window:globalThis);
