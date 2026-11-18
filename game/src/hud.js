import { CITY, JOBS } from './config.js';
export function createHud(){
  const $=id=>document.getElementById(id),map=$('map'),ctx=map.getContext('2d');let toastTimer=0;
  function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),2800);}
  function updateMap(actor,car,police,people,missions){
    const w=map.width,h=map.height,scale=w/500,p=car?car.root.position:actor.root.position,heading=car?car.yaw:actor.yaw;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#1c3839';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-heading);ctx.translate(-p.x*scale,-p.z*scale);
    ctx.fillStyle='#516061';for(let i=-4;i<=4;i++){ctx.fillRect(i*56*scale-8.5*scale,-250*scale,17*scale,500*scale);ctx.fillRect(-250*scale,i*56*scale-8.5*scale,500*scale,17*scale);}
    ctx.fillStyle='#c6ae89';for(let x=-3.5;x<4;x++)for(let z=-3.5;z<4;z++)ctx.fillRect(x*56*scale-18*scale,z*56*scale-18*scale,36*scale,36*scale);
    ctx.fillStyle='#4c9794';ctx.fillRect(-260*scale,244*scale,520*scale,58*scale);
    for(const person of people){if(!person.alive)continue;ctx.fillStyle='#ebd7b6';ctx.fillRect(person.root.position.x*scale-1.5,person.root.position.z*scale-1.5,3,3);}
    for(const unit of police){if(!unit.active)continue;ctx.fillStyle='#ef6f58';ctx.beginPath();ctx.arc(unit.root.position.x*scale,unit.root.position.z*scale,4,0,Math.PI*2);ctx.fill();}
    const [mx,,mz]=missions.marker();ctx.fillStyle='#ffd077';ctx.beginPath();ctx.arc(mx*scale,mz*scale,4.5,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.fillStyle='#ffe1a7';ctx.beginPath();ctx.moveTo(w/2,h/2-7);ctx.lineTo(w/2-5,h/2+5);ctx.lineTo(w/2+5,h/2+5);ctx.fill();
  }
  function update(actor,car,police,people,missions,health,wanted,time){
    const state=missions.state,completed=state.completed;
    $('mission-kicker').textContent=state.active?`JOB 0${completed+1} / ${JOBS[completed].name.toUpperCase()}`:(completed>=JOBS.length?'FREE ROAM':`NEXT JOB / ${JOBS[completed].name.toUpperCase()}`);
    $('objective').textContent=state.active?JOBS[completed].steps[state.step]:'Meet Mara at the gold marker. M starts the next job.';
    $('mission-hint').textContent=state.active?`MARA VALE • ${state.active?'RUNNING':'WAITING'}`:'M starts your next job';
    $('mission-timer').textContent=state.active?`${Math.ceil(state.time)}s`:'';$('cash').textContent=`$${state.money.toLocaleString()}`;
    $('health-fill').style.width=`${Math.max(0,health)}%`;$('stars').innerHTML='★'.repeat(wanted)+'<span>'+'☆'.repeat(5-wanted)+'</span>';
    $('clock').textContent=`${String(18+Math.floor(time/150)%3).padStart(2,'0')}:${String(Math.floor(time*0.4)%60).padStart(2,'0')}`;
    $('drive').classList.toggle('hidden',!car);$('reticle').classList.toggle('hidden',!!car);
    if(car){$('speed').textContent=String(Math.round(Math.abs(car.speed)*4.1)).padStart(2,'0');$('vehicle-name').textContent=car.police?'HARBOR INTERCEPTOR':car.id==='mission-car'?'PIER COUPE':'SABLE SEDAN';}
    $('mode-label').textContent=car?'DRIVING':health<35?'CRITICAL':'ON FOOT';const position=car?car.root.position:actor.root.position;$('district').textContent=position.z>170?'SOUTH MARINA':position.x<-110?'CANAL QUARTER':position.z<-120?'LIGHTHOUSE ROAD':'OLD QUAY';
    updateMap(actor,car,police,people,missions);
  }
  function stars(wanted){$('stars').textContent='★'.repeat(wanted)+'☆'.repeat(5-wanted);}
  return {toast,update,stars,raiseWanted:stars};
}
