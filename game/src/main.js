import { CITY, JOBS } from './config.js';
import { createInput } from './input.js';
import { createRenderer, chaseCamera } from './render.js';
import { buildCity } from './city.js';
import { createCar, createTraffic, makeStealable, driveCar, moveTraffic, closestCar } from './vehicles.js';
import { createPedestrians, createFootOfficer, walkPedestrians, pursueOfficer } from './pedestrians.js';
import { createPlayer, movePlayer } from './player.js';
import { createMissionSystem, loadProgress } from './missions.js';
import { createHud } from './hud.js';
import { createEffects, punchTarget, fireSidearm } from './combat.js';
import { createPoliceSystem } from './police.js';
import { createAudio } from './audio.js';

const canvas=document.querySelector('#world'),input=createInput(canvas),{renderer}=createRenderer(canvas);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(61,innerWidth/innerHeight,0.1,850);
scene.add(new THREE.AmbientLight(0xffffff,0.25));buildCity(scene);
const random=(()=>{let seed=CITY.seed;return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};})();
const actor=createPlayer(scene),traffic=createTraffic(scene,random),specialCar=makeStealable(scene),people=createPedestrians(scene),footCop=createFootOfficer(scene);
const hud=createHud(),audio=createAudio(),effects=createEffects(scene),police=createPoliceSystem(scene,random,hud,audio);
const missions=createMissionSystem(loadProgress(),hud,name=>audio.effect(name),level=>police.crime(level));
const title=document.querySelector('#title'),pause=document.querySelector('#pause'),hudRoot=document.querySelector('#hud');
let driven=null,playing=false,paused=false,elapsed=0,escaped=false,stolenThisFrame=false,lastTime=performance.now(),footCooldown=0,shotCooldown=0,saveTimer=0;
const shot=new URLSearchParams(location.search).get('shot');
window.addEventListener('contextmenu',e=>e.preventDefault());
document.querySelector('#begin').addEventListener('click',()=>{audio.enable();title.classList.add('hidden');hudRoot.classList.remove('hidden');playing=true;document.querySelector('#begin').blur();missions.start();});
document.querySelector('#resume').addEventListener('click',()=>setPaused(false));
document.querySelector('#save').addEventListener('click',()=>{missions.save();document.querySelector('#save-note').textContent='Progress saved to this browser.';audio.effect('success');});
function setPaused(value){paused=value;pause.classList.toggle('hidden',!paused);canvas.style.filter=paused?'blur(2px)':'';}
function togglePause(){if(!playing)return;setPaused(!paused);}
function enterVehicle(){
  if(driven){const p=driven.root.position;actor.root.position.set(p.x+Math.cos(driven.yaw)*2.5,0,p.z-Math.sin(driven.yaw)*2.5);actor.root.visible=true;driven.driver=false;driven=null;audio.effect('tap');return;}
  const p=actor.root.position,car=closestCar([...traffic,specialCar],p.x,p.z,6.2);if(!car){hud.toast('GET CLOSER TO A CAR');return;}
  driven=car;driven.driver=true;actor.root.visible=false;driven.stopped=false;
  if(!driven.stolen){driven.stolen=true;stolenThisFrame=true;police.crime(1);hud.toast('HOT RIDE · PATROL ALERTED');}
}
function updateOnFoot(dt){
  movePlayer(actor,input.held,dt);
  if(input.tapped.has('Space')&&actor.onGround){actor.velocityY=7.6;actor.onGround=false;}
  if(input.tapped.has('KeyE'))enterVehicle();
  if(input.tapped.has('KeyF')&&footCooldown<=0){footCooldown=.46;const target=punchTarget(actor,[...people,footCop],police.wanted,effects);if(target){police.crime();audio.effect('tap');}}
  if((input.tapped.has('KeyR')||input.held.has('Mouse0'))&&shotCooldown<=0){shotCooldown=.36;fireSidearm(actor,people,[...police.units,footCop],effects);police.crime();audio.effect('tap');}
}
function updateDriving(dt){
  if(input.tapped.has('KeyE')){enterVehicle();return;}
  const throttle=(input.held.has('KeyW')?1:0)-(input.held.has('KeyS')?1:0),turn=(input.held.has('KeyD')?1:0)-(input.held.has('KeyA')?1:0);
  driveCar(driven,throttle,turn,dt,input.held.has('Space'));
  const speed=Math.abs(driven.speed),p=driven.root.position;
  if(Math.abs(p.x)>239||Math.abs(p.z)>239){driven.speed*=-.35;driven.root.position.x=THREE.MathUtils.clamp(p.x,-239,239);driven.root.position.z=THREE.MathUtils.clamp(p.z,-239,239);driven.damage=Math.min(1,driven.damage+.08);effects.burst(p.clone().add(new THREE.Vector3(0,.8,0)),0xf0a05a,5);}
  for(const person of people){if(!person.alive||speed<4)continue;const d=Math.hypot(person.root.position.x-p.x,person.root.position.z-p.z);if(d<2.1){person.hp=0;person.alive=false;person.root.visible=false;police.crime(2);actor.health=Math.max(5,actor.health-8);effects.burst(person.root.position,0x9c5745,12);}}
  for(const car of traffic){if(car===driven)continue;const d=Math.hypot(car.root.position.x-p.x,car.root.position.z-p.z);if(d<2.6&&speed>3){driven.speed*=-.25;driven.damage=Math.min(1,driven.damage+.12);car.speed*=.55;effects.burst(p.clone().add(new THREE.Vector3(0,1,0)),0xf2b05e,9);}}
}
function update(dt){
  if(paused){renderer.render(scene,camera);input.endFrame();return;}
  elapsed+=dt;footCooldown-=dt;shotCooldown-=dt;saveTimer+=dt;
  const look=input.look();if(playing&&!paused){if(driven)updateDriving(dt);else updateOnFoot(dt);}
  const position=driven?driven.root.position:actor.root.position;
  moveTraffic(traffic,dt,{x:position.x,z:position.z});walkPedestrians(people,dt,{x:position.x,z:position.z},police.wanted);
  if(police.wanted>=2&&!driven)footCop.active=true;
  const damage=pursueOfficer(footCop,{x:position.x,z:position.z},dt,police.wanted);if(damage)actor.health=Math.max(5,actor.health-damage);
  const hidden=police.units.every(u=>!u.active||Math.hypot(u.root.position.x-position.x,u.root.position.z-position.z)>60)&&Math.abs(position.x)>85;
  const currentWanted=police.update(dt,actor,driven,hidden);escaped=currentWanted===0;
  missions.update(dt,actor,driven,stolenThisFrame,currentWanted,escaped);stolenThisFrame=false;
  if(saveTimer>15){missions.save();saveTimer=0;}
  if(playing&&!paused){chaseCamera(camera,actor,driven,dt,look);audio.update(dt,true);}
  else if(!playing){camera.position.set(-19,10,-18);camera.lookAt(8,1.5,30);}
  effects.update(dt);hud.update(actor,driven,police.units,people,missions,actor.health,currentWanted,elapsed);
  renderer.render(scene,camera);input.endFrame();
}
function frame(now){const dt=Math.min(.04,(now-lastTime)/1000);lastTime=now;update(dt);requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.addEventListener('keydown',event=>{if(event.code==='Escape'&&playing){event.preventDefault();togglePause();}if(event.code==='KeyM'&&playing&&!paused){if(!missions.state.active)missions.start();else hud.toast('JOB IN PROGRESS · FOLLOW THE GOLD MARKER');}});
if(shot){
  title.classList.add('hidden');hudRoot.classList.remove('hidden');playing=true;missions.start();
  if(shot==='chase'){
    actor.root.position.set(56,0,56);driven=specialCar;driven.root.position.set(56,0,56);driven.root.rotation.y=driven.yaw=Math.PI/2;driven.driver=true;actor.root.visible=false;police.setWanted(3);missions.state.step=1;missions.state.time=68;
    const cop=createCar(scene,34,53,Math.PI/2,0,true);cop.active=true;cop.speed=13;police.units.push(cop);
  }else if(shot==='drive'){
    actor.root.position.set(-40,0,48);driven=specialCar;driven.root.position.set(-40,0,48);driven.root.rotation.y=driven.yaw=Math.PI/2;driven.speed=10;driven.driver=true;actor.root.visible=false;missions.state.step=1;missions.state.time=68;
  }else if(shot==='street'){
    actor.root.position.set(-10,0,18);actor.yaw=Math.PI/4;missions.state.active=false;
  }else if(shot==='mission'){
    actor.root.position.set(0,0,12);missions.state.step=0;missions.state.time=88;hud.toast('A BORROWED SUNSET · STEAL THE PIER COUPE');
  }
}
