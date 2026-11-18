import { JOBS, TARGETS, SAVE_KEY } from './config.js';
export function loadProgress(){try{return JSON.parse(localStorage.getItem(SAVE_KEY))||{};}catch{return {};}}
export function createMissionSystem(saved,hud,sound,raiseWanted=level=>hud.raiseWanted(level)){
  const state={money:Math.max(0,Number(saved.money)||1250),completed:Math.max(0,Math.min(JOBS.length,Number(saved.completed)||0)),active:false,step:0,time:0};
  const current=()=>JOBS[Math.min(state.completed,JOBS.length-1)];
  const save=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify({money:state.money,completed:state.completed}));}catch{hud.toast('SAVE UNAVAILABLE');}};
  function start(){if(state.completed>=JOBS.length){hud.toast('THE COAST IS YOURS · FREE ROAM');return;}state.active=true;state.step=0;state.time=current().time;hud.toast(current().brief);sound('mission');save();}
  function advance(){state.step++;if(state.step>=current().steps.length){const reward=current().reward;state.money+=reward;state.completed++;state.active=false;hud.toast(`JOB COMPLETE · +$${reward.toLocaleString()}`);sound('success');save();}else{hud.toast(current().steps[state.step]);sound('mission');}}
  function fail(){state.active=false;hud.toast('JOB LOST · MEET MARA TO TRY AGAIN');sound('fail');}
  function update(dt,actor,car,stolen,wanted,escaped){if(!state.active)return;state.time-=dt;if(state.time<=0){fail();return;}
    const p=car?car.root.position:actor.root.position;
    if(state.completed===0&&state.step===0&&stolen)advance();
    else if(state.completed===0&&state.step===1&&Math.hypot(p.x+112,p.z-81)<15)advance();
    else if(state.completed===1&&state.step===0&&Math.hypot(p.x+84,p.z+86)<15)advance();
    else if(state.completed===1&&state.step===1&&Math.hypot(p.x-112,p.z+111)<15)advance();
    else if(state.completed===2&&state.step===0&&Math.hypot(p.x-154,p.z-154)<16){advance();raiseWanted(2);}
    else if(state.completed===2&&state.step===1&&Math.hypot(p.x-18,p.z+208)<16&&escaped)advance();
  }
  return {state,current,start,advance,fail,save,update,marker(){if(state.completed>=JOBS.length)return [0,0,0];if(!state.active)return JOBS[state.completed].meet||[0,0,0];return TARGETS[state.completed][Math.min(state.step,1)];}};
}
