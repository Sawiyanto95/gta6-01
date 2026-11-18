import { COLORS } from './config.js';

const PAINTS=[0xc65342,0xd5aa54,0x4e8582,0xd6d0bd,0x42565d,0x768b73,0x9c5545,0xe0bb84];
const mat=(color,roughness=0.7,metalness=0.05)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
export function createCar(scene,x,z,yaw,paint,police=false){
  const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=yaw;
  const color=police?COLORS.police:paint;
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.15,0.62,4.2),mat(color,0.4,0.17));body.position.y=0.8;body.castShadow=true;root.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.72,0.72,2.2),mat(police?0xe1e0d3:paint,0.32,0.08));cabin.position.set(0,1.43,-0.08);cabin.castShadow=true;root.add(cabin);
  const glass=mat(0x416e73,0.2,0.24);
  for(const side of [-1,1]){const pane=new THREE.Mesh(new THREE.BoxGeometry(1.57,0.46,0.07),glass);pane.position.set(0,1.45,side*0.53);root.add(pane);}
  for(const wx of [-1.1,1.1])for(const wz of [-1.35,1.35]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.41,0.41,0.28,12),mat(0x202a2b,0.9));wheel.rotation.z=Math.PI/2;wheel.position.set(wx,0.42,wz);root.add(wheel);}
  for(const side of [-1,1]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.2,0.08),mat(0xf5e1b1));lamp.position.set(side*0.7,0.84,-2.14);root.add(lamp);const tail=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.16,0.08),mat(0xa9473e));tail.position.set(side*0.7,0.84,2.14);root.add(tail);}
  if(police){const bar=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.18,0.37),mat(0x253d45));bar.position.y=1.98;root.add(bar);for(const side of [-1,1]){const siren=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.22,0.32),new THREE.MeshStandardMaterial({color:side<0?0xe25243:0x4b8fbd,emissive:side<0?0x872c26:0x1e4c8b,emissiveIntensity:1.5}));siren.position.set(side*0.3,2.1,0);root.add(siren);}}
  scene.add(root);return {root,speed:0,yaw,police,paint:color,driver:false,stopped:false,damage:0,brake:0};
}
export function createTraffic(scene,random){
  const cars=[];
  for(let i=0;i<20;i++){
    const vertical=i%2===0, road=(Math.floor(i/2)%9-4)*56, lane=i%4<2?-1:1;
    const x=vertical?road+lane*3.4:-215+random()*430, z=vertical?-215+random()*430:road-lane*3.4;
    const yaw=vertical?(lane<0?0:Math.PI):(lane<0?Math.PI/2:-Math.PI/2),car=createCar(scene,x,z,yaw,PAINTS[i%PAINTS.length]);
    car.cruise=4.6+random()*3.5;car.axis=vertical?'z':'x';car.dir=vertical?Math.sign(Math.cos(yaw)):Math.sign(Math.sin(yaw));car.light=i%6===0;car.wait=random()*3;car.id=i;cars.push(car);
  }
  return cars;
}
export function makeStealable(scene){const car=createCar(scene,3.6,0,Math.PI/2,0xd18c43);car.stopped=true;car.stolen=false;car.id='mission-car';return car;}
export function driveCar(car,throttle,turn,dt,handbrake=false){
  const accel=throttle>=0?12.5:18;car.speed+=throttle*accel*dt;
  if(throttle===0)car.speed*=Math.pow(handbrake?0.955:0.987,dt*60);if(handbrake)car.speed*=Math.pow(0.91,dt*60);
  car.speed=THREE.MathUtils.clamp(car.speed,-9,28);car.yaw+=turn*Math.min(Math.abs(car.speed)/8,1.15)*dt*(car.speed<0?-1:1)*1.3;
  car.root.rotation.y=car.yaw;car.root.position.x+=Math.sin(car.yaw)*car.speed*dt;car.root.position.z+=Math.cos(car.yaw)*car.speed*dt;
}
export function moveTraffic(cars,dt,actor){
  for(const car of cars){if(car.driver)continue;const p=car.root.position;
    if(car.wait>0){car.wait-=dt;car.speed=Math.max(0,car.speed-dt*7);}else{
      const near=Math.hypot(p.x-actor.x,p.z-actor.z)<8;const desired=near&&car.light?0:car.cruise;car.speed+=(desired-car.speed)*Math.min(1,dt*1.7);
    }
    p.x+=Math.sin(car.yaw)*car.speed*dt;p.z+=Math.cos(car.yaw)*car.speed*dt;
    const along=car.axis==='z'?p.z:p.x;if(Math.abs(along)>235){if(car.axis==='z')p.z=-Math.sign(along)*232;else p.x=-Math.sign(along)*232;car.wait=0.5;}
  }
}
export function closestCar(cars,x,z,limit=5.6){let found=null,best=limit;for(const car of cars){const d=Math.hypot(car.root.position.x-x,car.root.position.z-z);if(d<best){found=car;best=d;}}return found;}
