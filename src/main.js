\
import * as THREE from 'three';
import './style.css';

const root = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c8e8);
scene.fog = new THREE.Fog(0x91c8e8, 180, 620);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 1800);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd9efff, 0x526044, 1.7));
const sun = new THREE.DirectionalLight(0xfff0d8, 2.1);
sun.position.set(-100, 180, 80);
scene.add(sun);

const mat = (color, roughness=1, metalness=0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const materials = {
  grass: mat(0x477d3b), forest: mat(0x285c31), sand: mat(0xd8c28c),
  water: new THREE.MeshStandardMaterial({color:0x167da9,roughness:.25,metalness:.12}),
  road: mat(0x343a40), line: mat(0xe8dfb2), bark: mat(0x674329),
  leaf: [mat(0x1c6736),mat(0x2b8744),mat(0x14512d)],
  rock: mat(0x777d7c), glass: new THREE.MeshStandardMaterial({color:0x8bd3e8,roughness:.2,metalness:.2}),
  roof: mat(0x773f35), wall: mat(0xd6c6a8)
};

function addMesh(geometry, material, x, y, z, parent=scene) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x,y,z);
  parent.add(mesh);
  return mesh;
}

// World base: a large playable island with surrounding sea.
addMesh(new THREE.PlaneGeometry(1600,1600), materials.water, 0,-2,0).rotation.x = -Math.PI/2;
addMesh(new THREE.PlaneGeometry(620,620), materials.grass, 0,-.7,0).rotation.x = -Math.PI/2;

// Broad biome zones: city, village, forest, mountain, coast.
const beach = addMesh(new THREE.PlaneGeometry(620,75), materials.sand, 0,-.55,270);
beach.rotation.x = -Math.PI/2;

const river = addMesh(new THREE.PlaneGeometry(28,620), materials.water, 112,-.48,-5);
river.rotation.x = -Math.PI/2;

// Roads and markings.
function road(x,z,w,d) { addMesh(new THREE.BoxGeometry(w,.14,d),materials.road,x,.02,z); }
for(let x=-75;x<=75;x+=30) road(x,0,5,170);
for(let z=-75;z<=75;z+=30) road(0,z,170,5);
road(155,100,205,7);
road(215,145,7,130);
for(let z=-78;z<78;z+=12) addMesh(new THREE.BoxGeometry(.22,.025,5),materials.line,0,.105,z);

// City buildings with window grids.
const buildingPalette=[0xb8c1c6,0xd7c8ad,0x899eaa,0xd8dadd,0x9c8775];
function building(x,z,w,h,d) {
  const group = new THREE.Group();
  const body = addMesh(new THREE.BoxGeometry(w,h,d),mat(buildingPalette[Math.floor(Math.random()*buildingPalette.length)]),0,h/2,0,group);
  addMesh(new THREE.BoxGeometry(w+.5,.5,d+.5),mat(0x414b55),0,h+.25,0,group);
  const cols=Math.max(1,Math.floor(w/2.6)), rows=Math.max(1,Math.floor(h/3.5));
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    addMesh(new THREE.BoxGeometry(.85,1.15,.06),materials.glass,
      -w/2+1.3+c*2.5,1.8+r*3.2,d/2+.04,group);
  }
  group.position.set(x,0,z); scene.add(group);
}
for(let x=-75;x<=75;x+=19) for(let z=-75;z<=75;z+=23){
  if(Math.abs(x)<13 || Math.abs(z)<13) continue;
  building(x,z,9,9+Math.random()*27,10);
}

// Village houses.
function house(x,z) {
  const g=new THREE.Group();
  addMesh(new THREE.BoxGeometry(10,5.5,9),materials.wall,0,2.75,0,g);
  const roof=addMesh(new THREE.ConeGeometry(8,4.5,4),materials.roof,0,7,0,g);
  roof.rotation.y=Math.PI/4;
  addMesh(new THREE.BoxGeometry(1.5,3,.15),mat(0x55351f),0,1.5,4.58,g);
  g.position.set(x,0,z); scene.add(g);
}
for(let i=0;i<34;i++) house(115+Math.random()*175,45+Math.random()*170);

// Trees and forest.
function tree(x,z,s=1) {
  const g=new THREE.Group();
  addMesh(new THREE.CylinderGeometry(.2*s,.3*s,2.5*s,7),materials.bark,0,1.25*s,0,g);
  addMesh(new THREE.ConeGeometry(1.5*s,3.8*s,8),materials.leaf[Math.floor(Math.random()*3)],0,3.6*s,0,g);
  g.position.set(x,0,z); scene.add(g);
}
for(let i=0;i<340;i++){
  const x=-280+Math.random()*155, z=-270+Math.random()*540;
  tree(x,z,.75+Math.random()*.8);
}
for(let i=0;i<100;i++){
  const x=(Math.random()-.5)*570,z=(Math.random()-.5)*570;
  if(x>-90&&x<90&&z>-90&&z<90) continue;
  if(x>90&&z>25) continue;
  tree(x,z,.65+Math.random()*.65);
}

// Mountain range on the north-west edge.
for(let i=0;i<42;i++){
  const h=28+Math.random()*70;
  const m=addMesh(new THREE.ConeGeometry(13+Math.random()*17,h,6),
    mat(0x56676a),-245+Math.random()*490,h/2-1,-275+Math.random()*85);
  if(h>72){
    addMesh(new THREE.ConeGeometry(5,h*.22,6),mat(0xe6eff0),
      m.position.x,h*.88,m.position.z);
  }
}

// Bridge across river.
addMesh(new THREE.BoxGeometry(48,1.2,14),mat(0x777f83),112,.8,20);
for(const x of [91,133]) for(let z=14;z<=26;z+=12)
  addMesh(new THREE.BoxGeometry(.7,2,.7),mat(0x5c6268),x,1.8,z);

// Rocks.
for(let i=0;i<150;i++){
 const r=addMesh(new THREE.DodecahedronGeometry(.7+Math.random()*1.8,0),materials.rock,
   (Math.random()-.5)*570,.3,(Math.random()-.5)*570);
 r.rotation.set(Math.random(),Math.random(),Math.random());
}

// Clouds.
const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
for(let i=0;i<28;i++){
 const cloud=new THREE.Group();
 for(let j=0;j<4;j++) addMesh(new THREE.SphereGeometry(3+Math.random()*2,10,10),
   cloudMat,j*3,Math.random()*2,Math.random()*2,cloud);
 cloud.position.set((Math.random()-.5)*650,45+Math.random()*35,(Math.random()-.5)*650);
 scene.add(cloud);
}

// Player character.
const player=new THREE.Group();
const playerBody=addMesh(new THREE.CapsuleGeometry(.48,.95,4,8),mat(0x176fe0),0,1,0,player);
addMesh(new THREE.SphereGeometry(.32,16,16),mat(0xffc99e),0,1.9,0,player);
scene.add(player);

// A simple drivable car, parked near the city road.
const car=new THREE.Group();
addMesh(new THREE.BoxGeometry(4.2,1.15,7),mat(0xc52f35),0,1.05,0,car);
addMesh(new THREE.BoxGeometry(3.1,1.15,3.1),materials.glass,0,2.05,-.25,car);
const wheelMat=mat(0x17191c);
for(const x of [-2.05,2.05]) for(const z of [-2.25,2.25]){
 const wheel=addMesh(new THREE.CylinderGeometry(.65,.65,.38,12),wheelMat,x,.65,z,car);
 wheel.rotation.z=Math.PI/2;
}
car.position.set(12,0,18); car.rotation.y=Math.PI;
scene.add(car);

let inCar=false;
let carSpeed=0;

// NPCs as simple people-shaped figures, wandering near the village.
const npcs=[];
for(let i=0;i<10;i++){
 const npc=new THREE.Group();
 addMesh(new THREE.CapsuleGeometry(.35,.75,3,6),mat([0xe0a02e,0x4c9c8c,0x8759b8][i%3]),0,.8,0,npc);
 addMesh(new THREE.SphereGeometry(.23,12,12),mat(0xffc99e),0,1.65,0,npc);
 npc.position.set(130+Math.random()*130,0,65+Math.random()*120);
 scene.add(npc);
 npcs.push({mesh:npc,phase:Math.random()*6,speed:.5+Math.random()*.6,origin:npc.position.clone()});
}

// Mission points and collectible markers.
const missionPositions=[
 new THREE.Vector3(30,0,-35),
 new THREE.Vector3(150,0,110),
 new THREE.Vector3(-170,0,-150),
 new THREE.Vector3(0,0,250)
];
let missionIndex=0;
const marker=new THREE.Group();
const ring=addMesh(new THREE.TorusGeometry(3,.25,8,32),mat(0xffdc55,0.35,.4),0,1,0,marker);
ring.rotation.x=Math.PI/2;
addMesh(new THREE.CylinderGeometry(.15,.15,5,8),new THREE.MeshBasicMaterial({color:0xffdc55}),0,3.5,0,marker);
scene.add(marker);
function setMission(){
 marker.position.copy(missionPositions[missionIndex]);
 document.querySelector('#missionText').textContent=[
  'Visit the city marker','Explore the village','Reach the forest','Visit the beach'
 ][missionIndex];
}
setMission();

// Input.
const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});

let joyX=0,joyY=0,joyActive=false,joyPointer=null;
const joystick=document.querySelector('#joystick');
const stick=document.querySelector('#stick');
function setJoystick(e){
 const r=joystick.getBoundingClientRect();
 let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
 const max=39,len=Math.hypot(dx,dy);
 if(len>max){dx=dx/len*max;dy=dy/len*max;}
 joyX=dx/max;joyY=dy/max;
 stick.style.transform=`translate(${dx}px,${dy}px)`;
}
joystick.addEventListener('pointerdown',e=>{
 joyActive=true;joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);setJoystick(e);
});
joystick.addEventListener('pointermove',e=>{if(joyActive&&e.pointerId===joyPointer)setJoystick(e);});
function resetJoy(){joyActive=false;joyPointer=null;joyX=joyY=0;stick.style.transform='translate(0,0)';}
joystick.addEventListener('pointerup',resetJoy);
joystick.addEventListener('pointercancel',resetJoy);

let verticalSpeed=0,grounded=true;
document.querySelector('#jump').addEventListener('pointerdown',e=>{
 e.preventDefault();if(!inCar&&grounded){verticalSpeed=8.5;grounded=false;}
});

// Camera look: drag on the right half of the screen.
let lookPointer=null,lastX=0,lastY=0,yaw=0,pitch=.25;
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.clientX>innerWidth*.38){lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);}
});
renderer.domElement.addEventListener('pointermove',e=>{
 if(lookPointer!==e.pointerId)return;
 yaw-=(e.clientX-lastX)*.004;
 pitch=Math.max(-.25,Math.min(.8,pitch+(e.clientY-lastY)*.003));
 lastX=e.clientX;lastY=e.clientY;
});
function stopLook(e){if(e.pointerId===lookPointer)lookPointer=null;}
renderer.domElement.addEventListener('pointerup',stopLook);
renderer.domElement.addEventListener('pointercancel',stopLook);

// Enter/exit vehicle.
const actionBtn=document.querySelector('#action');
actionBtn.addEventListener('click',()=>{
 if(!inCar && player.position.distanceTo(car.position)<9){
   inCar=true;actionBtn.textContent='EXIT CAR';
 }else if(inCar){
   inCar=false;player.position.copy(car.position).add(new THREE.Vector3(4,0,0));
   actionBtn.textContent='ENTER CAR';
 }
});
document.querySelector('#interact').addEventListener('click',()=>{
 missionIndex=(missionIndex+1)%missionPositions.length;setMission();
});

// Game update.
const clock=new THREE.Clock();
const camForward=new THREE.Vector3(),camRight=new THREE.Vector3(),move=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 let f=joyY,s=joyX;
 if(keys.w||keys.arrowup)f=-1;
 if(keys.s||keys.arrowdown)f=1;
 if(keys.a||keys.arrowleft)s=-1;
 if(keys.d||keys.arrowright)s=1;
 const l=Math.hypot(f,s);if(l>1){f/=l;s/=l;}

 if(inCar){
   const throttle=-f;
   carSpeed=THREE.MathUtils.damp(carSpeed,throttle*24,2.2,dt);
   car.rotation.y-=s*dt*1.3*Math.min(1,Math.abs(carSpeed)/5);
   const dir=new THREE.Vector3(Math.sin(car.rotation.y),0,Math.cos(car.rotation.y));
   car.position.addScaledVector(dir,carSpeed*dt);
   player.position.copy(car.position);
   document.querySelector('#mode').textContent='DRIVING';
   document.querySelector('#speed').textContent=Math.round(Math.abs(carSpeed)*3.6)+' km/h';
 }else{
   camera.getWorldDirection(camForward);camForward.y=0;camForward.normalize();
   camRight.crossVectors(camForward,new THREE.Vector3(0,1,0)).normalize();
   move.set(0,0,0).addScaledVector(camForward,-f).addScaledVector(camRight,s);
   if(move.lengthSq()>0){
     move.normalize();player.position.addScaledVector(move,9*dt);
     player.rotation.y=Math.atan2(move.x,move.z);
   }
   verticalSpeed-=22*dt;player.position.y+=verticalSpeed*dt;
   if(player.position.y<=0){player.position.y=0;verticalSpeed=0;grounded=true;}
   document.querySelector('#mode').textContent='ON FOOT';
   document.querySelector('#speed').textContent='0 km/h';
 }
 player.position.x=THREE.MathUtils.clamp(player.position.x,-295,295);
 player.position.z=THREE.MathUtils.clamp(player.position.z,-295,295);
 car.position.x=THREE.MathUtils.clamp(car.position.x,-295,295);
 car.position.z=THREE.MathUtils.clamp(car.position.z,-295,295);

 // Nearby vehicle prompt.
 if(!inCar && player.position.distanceTo(car.position)<9) actionBtn.textContent='ENTER CAR';
 else if(!inCar) actionBtn.textContent='CAR NEARBY';

 // NPC wandering.
 const t=clock.elapsedTime;
 for(const n of npcs){
   n.mesh.position.x=n.origin.x+Math.sin(t*n.speed+n.phase)*5;
   n.mesh.position.z=n.origin.z+Math.cos(t*n.speed+n.phase)*5;
 }

 // Mission marker pulse.
 marker.rotation.y+=dt*.8;
 marker.children[0].scale.setScalar(1+Math.sin(t*3)*.08);

 // Camera follow and orbit look.
 const target=inCar?car.position:player.position;
 const distance=inCar?16:12;
 const height=inCar?7:6;
 const desired=new THREE.Vector3(
   target.x+Math.sin(yaw)*distance,
   target.y+height+pitch*8,
   target.z+Math.cos(yaw)*distance
 );
 camera.position.lerp(desired,Math.min(1,dt*5));
 camera.lookAt(target.x,target.y+1.2,target.z);

 // Complete mission by reaching marker.
 if(player.position.distanceTo(marker.position)<7){
   missionIndex=(missionIndex+1)%missionPositions.length;setMission();
 }
 renderer.render(scene,camera);
}
animate();

addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
});

