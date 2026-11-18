const SKIN=[0xc38a66,0x95684f,0xe0ae89,0x7b5141,0xd1a07c];
const SHIRT=[0xd9c7a0,0x49857c,0xc96e52,0x526a72,0xe8dbca,0x91a47d];
function personMesh(scene,x,z,index,officer=false){
  const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
  const cloth=new THREE.MeshStandardMaterial({color:officer?0x334b56:SHIRT[index%SHIRT.length],roughness:0.86});
  const skin=new THREE.MeshStandardMaterial({color:SKIN[index%SKIN.length],roughness:0.9});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.34,0.68,4,8),cloth);torso.position.y=1.12;torso.castShadow=true;root.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.255,10,8),skin);head.position.y=1.86;root.add(head);
  const legs=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.78,0.28),new THREE.MeshStandardMaterial({color:officer?0x26383d:0x545953}));legs.position.y=0.44;root.add(legs);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(0.82,0.16,0.19),cloth);arm.position.y=1.13;root.add(arm);
  if(officer){const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.27,0.13,8),new THREE.MeshStandardMaterial({color:0x233b46}));cap.position.y=2.08;root.add(cap);}
  return {root,hp:100,officer,alive:true,walkSpeed:0.5+(index%5)*0.12,axis:'x',yaw:0,phase:index*0.8,hitCooldown:0};
}
export function createPedestrians(scene){
  const crowd=[];
  for(let i=0;i<28;i++){
    const along=-218+(i*41%436),axis=i%4<2?'x':'z',road=(Math.floor(i/4)-3)*56;
    const x=axis==='x'?along:road+(i%2?13:-13),z=axis==='x'?road+(i%2?13:-13):along;
    const p=personMesh(scene,x,z,i);p.axis=axis;p.yaw=axis==='x'?(i%2?Math.PI/2:-Math.PI/2):(i%2?0:Math.PI);p.root.rotation.y=p.yaw;crowd.push(p);
  }
  return crowd;
}
export function createFootOfficer(scene){const cop=personMesh(scene,-30,-44,2,true);cop.active=false;return cop;}
export function walkPedestrians(crowd,dt,actor,wanted){
  for(const p of crowd){if(!p.alive)continue;p.phase+=dt*6.5;const pos=p.root.position;
    const panic=wanted>0&&Math.hypot(pos.x-actor.x,pos.z-actor.z)<26;
    const yaw=panic?Math.atan2(pos.x-actor.x,pos.z-actor.z):p.yaw,speed=p.walkSpeed*(panic?1.8:1);
    pos.x-=Math.sin(yaw)*speed*dt;pos.z-=Math.cos(yaw)*speed*dt;p.root.rotation.y=yaw;
    const edge=p.axis==='x'?pos.x:pos.z;if(Math.abs(edge)>232)p.yaw+=Math.PI;
    p.root.children[2].rotation.z=Math.sin(p.phase)*0.12;
  }
}
export function pursueOfficer(officer,actor,dt,wanted){
  if(!officer.active||!officer.alive||wanted<2)return 0;
  const p=officer.root.position,dx=actor.x-p.x,dz=actor.z-p.z,distance=Math.hypot(dx,dz);
  if(distance>2.2){p.x+=dx/distance*dt*3.25;p.z+=dz/distance*dt*3.25;officer.root.rotation.y=Math.atan2(-dx,-dz);}
  officer.hitCooldown-=dt;if(distance<2.3&&officer.hitCooldown<=0){officer.hitCooldown=1.3;return 7;}
  return 0;
}
