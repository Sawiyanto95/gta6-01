export function createPlayer(scene){
  const root=new THREE.Group();root.position.set(0,0,15);scene.add(root);
  const coat=new THREE.MeshStandardMaterial({color:0x314e50,roughness:0.85}),skin=new THREE.MeshStandardMaterial({color:0xb67e61,roughness:0.9});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.36,0.8,5,9),coat);torso.position.y=1.2;torso.castShadow=true;root.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,12,9),skin);head.position.y=2.0;root.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,7),new THREE.MeshStandardMaterial({color:0x242b2b}));hair.position.set(0,2.12,-0.04);hair.scale.set(1,0.5,1);root.add(hair);
  const actor={root,yaw:0,health:100,velocityY:0,onGround:true,walkPhase:0};return actor;
}
export function movePlayer(actor,keys,dt){
  const forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
  const input=new THREE.Vector2(side,forward);if(input.lengthSq()>1)input.normalize();
  const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight'),speed=sprint?9.2:5.5;
  const yaw=actor.yaw,dx=Math.cos(yaw)*input.x+Math.sin(yaw)*input.y,dz=-Math.sin(yaw)*input.x+Math.cos(yaw)*input.y;
  actor.root.position.x=THREE.MathUtils.clamp(actor.root.position.x+dx*speed*dt,-238,238);actor.root.position.z=THREE.MathUtils.clamp(actor.root.position.z+dz*speed*dt,-238,238);
  if(input.lengthSq()>0.01){actor.root.rotation.y=Math.atan2(-dx,-dz);actor.walkPhase+=dt*12*(sprint?1.45:1);actor.root.children[2].rotation.x=Math.sin(actor.walkPhase)*0.15;}
  actor.velocityY-=18*dt;actor.root.position.y=Math.max(0,actor.root.position.y+actor.velocityY*dt);if(actor.root.position.y===0){actor.velocityY=0;actor.onGround=true;}
}
