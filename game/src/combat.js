export function createEffects(scene){
  const effects=[];
  function burst(position,color=0xf3b262,count=12){
    const geometry=new THREE.SphereGeometry(0.12,6,5),material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.9});
    for(let i=0;i<count;i++){const mesh=new THREE.Mesh(geometry,material.clone());mesh.position.copy(position);mesh.userData.velocity=new THREE.Vector3((Math.random()-.5)*6,Math.random()*4,(Math.random()-.5)*6);mesh.userData.life=0.38+Math.random()*0.45;scene.add(mesh);effects.push(mesh);}
  }
  function update(dt){for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.userData.life-=dt;fx.position.addScaledVector(fx.userData.velocity,dt);fx.userData.velocity.y-=5*dt;fx.material.opacity=Math.max(0,fx.userData.life);if(fx.userData.life<=0){scene.remove(fx);fx.geometry.dispose();fx.material.dispose();effects.splice(i,1);}}}
  return {burst,update};
}
export function punchTarget(actor,people,wanted,effects){
  const origin=actor.root.position;let target=null,best=2.5;
  for(const p of people){if(!p.alive)continue;const d=Math.hypot(p.root.position.x-origin.x,p.root.position.z-origin.z);if(d<best){target=p;best=d;}}
  if(target){target.hp-=42;effects.burst(target.root.position.clone().add(new THREE.Vector3(0,1,0)),0xe7a566,9);if(target.hp<=0){target.alive=false;target.root.visible=false;}}
  return target;
}
export function fireSidearm(actor,people,police,effects){
  const start=actor.root.position.clone().add(new THREE.Vector3(0,1.4,0)),forward=new THREE.Vector3(Math.sin(actor.yaw),0,Math.cos(actor.yaw));
  let target=null,best=27;
  for(const p of [...people,...police]){if(!p.alive)continue;const delta=p.root.position.clone().add(new THREE.Vector3(0,1,0)).sub(start),along=delta.dot(forward),side=delta.clone().addScaledVector(forward,-along).length();if(along>0&&along<best&&side<1.4){target=p;best=along;}}
  const end=start.addScaledVector(forward,target?best:24);effects.burst(end,0xffcf78,7);
  if(target){target.hp-=55;if(target.hp<=0){target.alive=false;target.root.visible=false;}}
  return target;
}
