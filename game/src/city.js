import { CITY, COLORS } from './config.js';

const box = (scene, size, at, color, material = null) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material || new THREE.MeshStandardMaterial({ color, roughness: 0.87 }));
  mesh.position.set(...at); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
};
function makeBlock(scene, x, z, index) {
  const base = [0xcbb18a,0xb8aa8b,0xd8c4a0,0x9caaa0,0xc4a18a,0xd3c1a2][index % 6];
  const width = 23 + (index % 3) * 4, depth = 22 + (index % 4) * 3, height = 10 + (index * 7 % 17);
  box(scene, [width, height, depth], [x, height/2, z], base);
  box(scene, [width+0.3, 0.45, depth+0.3], [x,height+0.15,z], index%3===0 ? 0xa95742 : 0x586d68);
  const trim = new THREE.MeshStandardMaterial({ color: 0xf0dcb5, roughness: 0.72 });
  for (let floor=2.3; floor<height-0.5; floor+=2.8) {
    for (let side of [-1,1]) {
      const count=Math.max(2,Math.floor(width/4));
      for(let col=0;col<count;col++) box(scene,[0.9,1.1,0.08],[x-width/2+1.6+col*(width-3.2)/(count-1),floor,z+side*(depth/2+0.05)],0x4b7778,new THREE.MeshStandardMaterial({color:0x467477,roughness:0.27,metalness:0.16}));
    }
    box(scene,[0.12,0.22,depth+0.2],[x-width/2,floor-0.6,z],0xe5d1a9,trim);
  }
  if(index%5===0){
    const awning=box(scene,[width*0.45,0.55,2.6],[x,height*0.15,z+depth/2+1.4],0xd0774f);
    awning.position.y=3.2;
  }
}
export function buildCity(scene) {
  scene.background = new THREE.Color(0xe3a36f); scene.fog = new THREE.FogExp2(0xe3a36f, 0.0018);
  const hemi = new THREE.HemisphereLight(0xffe2b8,0x526966,2.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd09a,3.1); sun.position.set(-110,150,-80); scene.add(sun);
  box(scene,[520,1,520],[0,-0.65,0],0x85a69d);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(620,190),new THREE.MeshStandardMaterial({color:COLORS.water,roughness:0.28,metalness:0.12})); water.rotation.x=-Math.PI/2; water.position.set(0,-0.12,315); scene.add(water);
  box(scene,[520,0.18,22],[0,0,240],0xd2bc93);
  const pitch=CITY.roadPitch;
  for(let i=-4;i<=4;i++){
    const lane=i*pitch;
    box(scene,[CITY.roadWidth,0.08,520],[lane,0.02,0],COLORS.asphalt);
    box(scene,[520,0.08,CITY.roadWidth],[0,0.03,lane],COLORS.asphalt);
    box(scene,[2,0.1,520],[lane-11.7,0.04,0],0xc7b696); box(scene,[2,0.1,520],[lane+11.7,0.04,0],0xc7b696);
    box(scene,[520,0.1,2],[0,0.04,lane-11.7],0xc7b696); box(scene,[520,0.1,2],[0,0.04,lane+11.7],0xc7b696);
    for(let d=-230;d<240;d+=10){
      box(scene,[0.25,0.025,4.2],[lane,0.09,d],0xd8c896);
      box(scene,[4.2,0.025,0.25],[d,0.09,lane],0xd8c896);
    }
  }
  let n=0;
  for(let x=-4;x<4;x++) for(let z=-4;z<4;z++){
    const cx=x*pitch+pitch/2, cz=z*pitch+pitch/2;
    if(Math.abs(cx)>225||Math.abs(cz)>225) continue;
    makeBlock(scene,cx,cz,n++);
    if(n%6===0){
      const palm=new THREE.Group(); palm.position.set(cx+13,0,cz-11); scene.add(palm);
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.38,6,7),new THREE.MeshStandardMaterial({color:0x8d6946}));trunk.position.y=3;palm.add(trunk);
      for(let j=0;j<6;j++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(0.65,5,5),new THREE.MeshStandardMaterial({color:0x54765d}));leaf.position.y=6;leaf.rotation.z=j*Math.PI/3;leaf.rotation.x=0.55;palm.add(leaf);}
    }
  }
  for(let x=-220;x<=220;x+=12){
    const post=box(scene,[0.16,0.8,0.16],[x,0.4,249],0x68776e); box(scene,[0.3,0.1,0.3],[x,0.85,249],0xe0c28b);
    post.castShadow=false;
  }
  return { roads:Array.from({length:9},(_,i)=>(i-4)*pitch), blocks:n };
}
