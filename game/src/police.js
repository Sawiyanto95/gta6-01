import { createCar, driveCar } from './vehicles.js';
export function createPoliceSystem(scene,random,hud,audio){
  const units=[];let wanted=0,heat=0,cooldown=0;
  function crime(amount=1){wanted=Math.min(5,Math.max(1,wanted+amount));heat=18+5*wanted;hud.raiseWanted(wanted);audio.effect('crime');}
  function update(dt,actor,vehicle,hidden){
    const position=vehicle?vehicle.root.position:actor.root.position;
    cooldown-=dt;
    if(wanted>0&&cooldown<=0&&units.filter(u=>u.active).length<Math.min(5,Math.ceil(wanted*0.8))){
      const angle=random()*Math.PI*2,distance=48+random()*24,x=position.x+Math.cos(angle)*distance,z=position.z+Math.sin(angle)*distance;
      const cop=createCar(scene,x,z,Math.atan2(position.x-x,position.z-z),0,true);cop.active=true;cop.speed=5+random()*2;cop.steerBias=0;units.push(cop);cooldown=2.4;
    }
    for(const cop of units){if(!cop.active)continue;
      const p=cop.root.position,target=vehicle?vehicle.root.position:new THREE.Vector3(position.x,0,position.z),dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
      if(d>3){const desired=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(desired-cop.yaw),Math.cos(desired-cop.yaw));cop.yaw+=THREE.MathUtils.clamp(delta,-dt*1.3,dt*1.3);cop.root.rotation.y=cop.yaw;cop.speed=Math.min(18,cop.speed+dt*4);p.x+=Math.sin(cop.yaw)*cop.speed*dt;p.z+=Math.cos(cop.yaw)*cop.speed*dt;}
      if(d<4&&vehicle&&wanted>0){vehicle.speed*=Math.max(0.6,1-dt*0.9);vehicle.damage=Math.min(1,vehicle.damage+dt*0.05);if(cooldown<0){actor.health=Math.max(5,actor.health-3);cooldown=1.3;}}
    }
    if(wanted>0){heat-=dt;if(hidden&&heat<=0){wanted--;heat=wanted?10:0;hud.raiseWanted(wanted);}}
    if(wanted===0&&units.length){for(const cop of units){cop.active=false;cop.root.visible=false;}units.length=0;}
    return wanted;
  }
  return {units,get wanted(){return wanted;},crime,setWanted(level){wanted=THREE.MathUtils.clamp(level,0,5);heat=22;hud.raiseWanted(wanted);},update};
}
