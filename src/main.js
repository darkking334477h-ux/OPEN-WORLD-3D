
import * as THREE from 'three';
import './style.css';

const root = document.querySelector('#game');
if (!root) throw new Error('Missing #game element in index.html');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c8e8);
scene.fog = new THREE.Fog(0x91c8e8, 180, 620);

const camera = new THREE.PerspectiveCamera(
  68, innerWidth / innerHeight, 0.1, 1800
);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance'
});

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

const mat = (color, roughness = 1, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const materials = {
  grass: mat(0x477d3b),
  sand: mat(0xd8c28c),
  water: new THREE.MeshStandardMaterial({
    color: 0x167da9, roughness: 0.25, metalness: 0.12
  }),
  road: mat(0x343a40),
  line: mat(0xe8dfb2),
  bark: mat(0x674329),
  leaf: [mat(0x1c6736), mat(0x2b8744), mat(0x14512d)],
  rock: mat(0x777d7c),
  glass: new THREE.MeshStandardMaterial({
    color: 0x8bd3e8, roughness: 0.2, metalness: 0.2
  }),
  roof: mat(0x773f35),
  wall: mat(0xd6c6a8)
};

function addMesh(geometry, material, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

// WORLD
const sea = addMesh(
  new THREE.PlaneGeometry(1600, 1600),
  materials.water, 0, -2, 0
);
sea.rotation.x = -Math.PI / 2;

const land = addMesh(
  new THREE.PlaneGeometry(620, 620),
  materials.grass, 0, -0.7, 0
);
land.rotation.x = -Math.PI / 2;

const beach = addMesh(
  new THREE.PlaneGeometry(620, 75),
  materials.sand, 0, -0.55, 270
);
beach.rotation.x = -Math.PI / 2;

const river = addMesh(
  new THREE.PlaneGeometry(28, 620),
  materials.water, 112, -0.48, -5
);
river.rotation.x = -Math.PI / 2;

// ROADS
function road(x, z, w, d) {
  addMesh(new THREE.BoxGeometry(w, 0.14, d),
    materials.road, x, 0.02, z);
}

for (let x = -75; x <= 75; x += 30) road(x, 0, 5, 170);
for (let z = -75; z <= 75; z += 30) road(0, z, 170, 5);

road(155, 100, 205, 7);
road(215, 145, 7, 130);

for (let z = -78; z < 78; z += 12) {
  addMesh(new THREE.BoxGeometry(0.22, 0.025, 5),
    materials.line, 0, 0.105, z);
}

// CITY
const buildingPalette = [
  0xb8c1c6, 0xd7c8ad, 0x899eaa, 0xd8dadd, 0x9c8775
];

function building(x, z, w, h, d) {
  const group = new THREE.Group();

  addMesh(
    new THREE.BoxGeometry(w, h, d),
    mat(buildingPalette[Math.floor(Math.random() * buildingPalette.length)]),
    0, h / 2, 0, group
  );

  addMesh(
    new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5),
    mat(0x414b55), 0, h + 0.25, 0, group
  );

  const cols = Math.max(1, Math.floor(w / 2.6));
  const rows = Math.max(1, Math.floor(h / 3.5));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      addMesh(
        new THREE.BoxGeometry(0.85, 1.15, 0.06),
        materials.glass,
        -w / 2 + 1.3 + c * 2.5,
        1.8 + r * 3.2,
        d / 2 + 0.04,
        group
      );
    }
  }

  group.position.set(x, 0, z);
  scene.add(group);
}

for (let x = -75; x <= 75; x += 19) {
  for (let z = -75; z <= 75; z += 23) {
    if (Math.abs(x) < 13 || Math.abs(z) < 13) continue;
    building(x, z, 9, 9 + Math.random() * 27, 10);
  }
}

// VILLAGE
function house(x, z) {
  const group = new THREE.Group();

  addMesh(new THREE.BoxGeometry(10, 5.5, 9),
    materials.wall, 0, 2.75, 0, group);

  const roof = addMesh(
    new THREE.ConeGeometry(8, 4.5, 4),
    materials.roof, 0, 7, 0, group
  );
  roof.rotation.y = Math.PI / 4;

  addMesh(new THREE.BoxGeometry(1.5, 3, 0.15),
    mat(0x55351f), 0, 1.5, 4.58, group);

  group.position.set(x, 0, z);
  scene.add(group);
}

for (let i = 0; i < 34; i++) {
  house(115 + Math.random() * 175, 45 + Math.random() * 170);
}

// FOREST
function tree(x, z, s = 1) {
  const group = new THREE.Group();

  addMesh(
    new THREE.CylinderGeometry(0.2 * s, 0.3 * s, 2.5 * s, 7),
    materials.bark, 0, 1.25 * s, 0, group
  );

  addMesh(
    new THREE.ConeGeometry(1.5 * s, 3.8 * s, 8),
    materials.leaf[Math.floor(Math.random() * 3)],
    0, 3.6 * s, 0, group
  );

  group.position.set(x, 0, z);
  scene.add(group);
}

for (let i = 0; i < 340; i++) {
  tree(
    -280 + Math.random() * 155,
    -270 + Math.random() * 540,
    0.75 + Math.random() * 0.8
  );
}

for (let i = 0; i < 100; i++) {
  const x = (Math.random() - 0.5) * 570;
  const z = (Math.random() - 0.5) * 570;

  if (x > -90 && x < 90 && z > -90 && z < 90) continue;
  if (x > 90 && z > 25) continue;

  tree(x, z, 0.65 + Math.random() * 0.65);
}

// MOUNTAINS
for (let i = 0; i < 42; i++) {
  const h = 28 + Math.random() * 70;

  const mountain = addMesh(
    new THREE.ConeGeometry(13 + Math.random() * 17, h, 6),
    mat(0x56676a),
    -245 + Math.random() * 490,
    h / 2 - 1,
    -275 + Math.random() * 85
  );

  if (h > 72) {
    addMesh(
      new THREE.ConeGeometry(5, h * 0.22, 6),
      mat(0xe6eff0),
      mountain.position.x,
      h * 0.88,
      mountain.position.z
    );
  }
}

// BRIDGE
addMesh(
  new THREE.BoxGeometry(48, 1.2, 14),
  mat(0x777f83), 112, 0.8, 20
);

for (const x of [91, 133]) {
  for (let z = 14; z <= 26; z += 12) {
    addMesh(
      new THREE.BoxGeometry(0.7, 2, 0.7),
      mat(0x5c6268), x, 1.8, z
    );
  }
}

// ROCKS
for (let i = 0; i < 150; i++) {
  const rock = addMesh(
    new THREE.DodecahedronGeometry(0.7 + Math.random() * 1.8, 0),
    materials.rock,
    (Math.random() - 0.5) * 570,
    0.3,
    (Math.random() - 0.5) * 570
  );

  rock.rotation.set(Math.random(), Math.random(), Math.random());
}

// CLOUDS
const cloudMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, roughness: 1
});

for (let i = 0; i < 28; i++) {
  const cloud = new THREE.Group();

  for (let j = 0; j < 4; j++) {
    addMesh(
      new THREE.SphereGeometry(3 + Math.random() * 2, 10, 10),
      cloudMat,
      j * 3,
      Math.random() * 2,
      Math.random() * 2,
      cloud
    );
  }

  cloud.position.set(
    (Math.random() - 0.5) * 650,
    45 + Math.random() * 35,
    (Math.random() - 0.5) * 650
  );

  scene.add(cloud);
}

// PLAYER
const player = new THREE.Group();

addMesh(
  new THREE.CapsuleGeometry(0.48, 0.95, 4, 8),
  mat(0x176fe0), 0, 1, 0, player
);

addMesh(
  new THREE.SphereGeometry(0.32, 16, 16),
  mat(0xffc99e), 0, 1.9, 0, player
);

scene.add(player);

// CAR
const car = new THREE.Group();

addMesh(
  new THREE.BoxGeometry(4.2, 1.15, 7),
  mat(0xc52f35), 0, 1.05, 0, car
);

addMesh(
  new THREE.BoxGeometry(3.1, 1.15, 3.1),
  materials.glass, 0, 2.05, -0.25, car
);

const wheelMat = mat(0x17191c);

for (const x of [-2.05, 2.05]) {
  for (const z of [-2.25, 2.25]) {
    const wheel = addMesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.38, 12),
      wheelMat, x, 0.65, z, car
    );
    wheel.rotation.z = Math.PI / 2;
  }
}

car.position.set(12, 0, 18);
car.rotation.y = Math.PI;
scene.add(car);

let inCar = false;
let carSpeed = 0;

// NPC
const npcs = [];

for (let i = 0; i < 10; i++) {
  const npc = new THREE.Group();

  addMesh(
    new THREE.CapsuleGeometry(0.35, 0.75, 3, 6),
    mat([0xe0a02e, 0x4c9c8c, 0x8759b8][i % 3]),
    0, 0.8, 0, npc
  );

  addMesh(
    new THREE.SphereGeometry(0.23, 12, 12),
    mat(0xffc99e), 0, 1.65, 0, npc
  );

  npc.position.set(
    130 + Math.random() * 130,
    0,
    65 + Math.random() * 120
  );

  scene.add(npc);

  npcs.push({
    mesh: npc,
    phase: Math.random() * 6,
    speed: 0.5 + Math.random() * 0.6,
    origin: npc.position.clone()
  });
}

// MISSIONS
const missionPositions = [
  new THREE.Vector3(30, 0, -35),
  new THREE.Vector3(150, 0, 110),
  new THREE.Vector3(-170, 0, -150),
  new THREE.Vector3(0, 0, 250)
];

const missionNames = [
  'Visit the city marker',
  'Explore the village',
  'Reach the forest',
  'Visit the beach'
];

let missionIndex = 0;

const marker = new THREE.Group();

const ring = addMesh(
  new THREE.TorusGeometry(3, 0.25, 8, 32),
  mat(0xffdc55, 0.35, 0.4),
  0, 1, 0, marker
);
ring.rotation.x = Math.PI / 2;

addMesh(
  new THREE.CylinderGeometry(0.15, 0.15, 5, 8),
  new THREE.MeshBasicMaterial({ color: 0xffdc55 }),
  0, 3.5, 0, marker
);

scene.add(marker);

function setMission() {
  marker.position.copy(missionPositions[missionIndex]);

  const missionText = document.querySelector('#missionText');
  if (missionText) {
    missionText.textContent = missionNames[missionIndex];
  }
}

setMission();

// INPUT
const keys = {};

addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});

addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

let joyX = 0;
let joyY = 0;
let joyActive = false;
let joyPointer = null;

const joystick = document.querySelector('#joystick');
const stick = document.querySelector('#stick');

if (joystick && stick) {
  function setJoystick(e) {
    const r = joystick.getBoundingClientRect();

    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);

    const max = 39;
    const len = Math.hypot(dx, dy);

    if (len > max) {
      dx = dx / len * max;
      dy = dy / len * max;
    }

    joyX = dx / max;
    joyY = dy / max;

    stick.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  joystick.addEventListener('pointerdown', e => {
    joyActive = true;
    joyPointer = e.pointerId;
    joystick.setPointerCapture(e.pointerId);
    setJoystick(e);
  });

  joystick.addEventListener('pointermove', e => {
    if (joyActive && e.pointerId === joyPointer) setJoystick(e);
  });

  function resetJoy() {
    joyActive = false;
    joyPointer = null;
    joyX = 0;
    joyY = 0;
    stick.style.transform = 'translate(0,0)';
  }

  joystick.addEventListener('pointerup', resetJoy);
  joystick.addEventListener('pointercancel', resetJoy);
}

// JUMP
let verticalSpeed = 0;
let grounded = true;

const jumpButton = document.querySelector('#jump');

if (jumpButton) {
  jumpButton.addEventListener('pointerdown', e => {
    e.preventDefault();

    if (!inCar && grounded) {
      verticalSpeed = 8.5;
      grounded = false;
    }
  });
}

// CAMERA LOOK
let lookPointer = null;
let lastX = 0;
let lastY = 0;
let yaw = 0;
let pitch = 0.25;

renderer.domElement.addEventListener('pointerdown', e => {
  if (e.clientX > innerWidth * 0.38) {
    lookPointer = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
  }
});

renderer.domElement.addEventListener('pointermove', e => {
  if (lookPointer !== e.pointerId) return;

  yaw -= (e.clientX - lastX) * 0.004;

  pitch = Math.max(
    -0.25,
    Math.min(0.8, pitch + (e.clientY - lastY) * 0.003)
  );

  lastX = e.clientX;
  lastY = e.clientY;
});

function stopLook(e) {
  if (e.pointerId === lookPointer) lookPointer = null;
}

renderer.domElement.addEventListener('pointerup', stopLook);
renderer.domElement.addEventListener('pointercancel', stopLook);

// VEHICLE BUTTON
const actionBtn = document.querySelector('#action');

if (actionBtn) {
  actionBtn.addEventListener('click', () => {
    if (!inCar && player.position.distanceTo(car.position) < 9) {
      inCar = true;
      actionBtn.textContent = 'EXIT CAR';
    } else if (inCar) {
      inCar = false;
      player.position.copy(car.position).add(
        new THREE.Vector3(4, 0, 0)
      );
      actionBtn.textContent = 'ENTER CAR';
    }
  });
}

// INTERACT BUTTON
const interactButton = document.querySelector('#interact');

if (interactButton) {
  interactButton.addEventListener('click', () => {
    missionIndex = (missionIndex + 1) % missionPositions.length;
    setMission();
  });
}

// GAME LOOP
const clock = new THREE.Clock();

const camForward = new THREE.Vector3();
const camRight = new THREE.Vector3();
const move = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  let f = joyY;
  let s = joyX;

  if (keys.w || keys.arrowup) f = -1;
  if (keys.s || keys.arrowdown) f = 1;
  if (keys.a || keys.arrowleft) s = -1;
  if (keys.d || keys.arrowright) s = 1;

  const length = Math.hypot(f, s);

  if (length > 1) {
    f /= length;
    s /= length;
  }

  if (inCar) {
    const throttle = -f;

    carSpeed = THREE.MathUtils.damp(
      carSpeed, throttle * 24, 2.2, dt
    );

    car.rotation.y -=
      s * dt * 1.3 * Math.min(1, Math.abs(carSpeed) / 5);

    const direction = new THREE.Vector3(
      Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y)
    );

    car.position.addScaledVector(direction, carSpeed * dt);
    player.position.copy(car.position);

    const mode = document.querySelector('#mode');
    const speed = document.querySelector('#speed');

    if (mode) mode.textContent = 'DRIVING';
    if (speed) {
      speed.textContent =
        Math.round(Math.abs(carSpeed) * 3.6) + ' km/h';
    }
  } else {
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();

    camRight.crossVectors(camForward, worldUp).normalize();

    move.set(0, 0, 0)
      .addScaledVector(camForward, -f)
      .addScaledVector(camRight, s);

    if (move.lengthSq() > 0) {
      move.normalize();
      player.position.addScaledVector(move, 9 * dt);
      player.rotation.y = Math.atan2(move.x, move.z);
    }

    verticalSpeed -= 22 * dt;
    player.position.y += verticalSpeed * dt;

    if (player.position.y <= 0) {
      player.position.y = 0;
      verticalSpeed = 0;
      grounded = true;
    }

    const mode = document.querySelector('#mode');
    const speed = document.querySelector('#speed');

    if (mode) mode.textContent = 'ON FOOT';
    if (speed) speed.textContent = '0 km/h';
  }

  player.position.x = THREE.MathUtils.clamp(player.position.x, -295, 295);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -295, 295);

  car.position.x = THREE.MathUtils.clamp(car.position.x, -295, 295);
  car.position.z = THREE.MathUtils.clamp(car.position.z, -295, 295);

  // CAR PROMPT
  if (actionBtn && !inCar) {
    actionBtn.textContent =
      player.position.distanceTo(car.position) < 9
        ? 'ENTER CAR'
        : 'CAR NEARBY';
  }

  // NPC MOVEMENT
  const t = clock.elapsedTime;

  for (const npc of npcs) {
    npc.mesh.position.x =
      npc.origin.x + Math.sin(t * npc.speed + npc.phase) * 5;

    npc.mesh.position.z =
      npc.origin.z + Math.cos(t * npc.speed + npc.phase) * 5;
  }

  // MISSION MARKER
  marker.rotation.y += dt * 0.8;
  marker.children[0].scale.setScalar(
    1 + Math.sin(t * 3) * 0.08
  );

  // CAMERA FOLLOW
  const target = inCar ? car.position : player.position;
  const distance = inCar ? 16 : 12;
  const height = inCar ? 7 : 6;

  const desired = new THREE.Vector3(
    target.x + Math.sin(yaw) * distance,
    target.y + height + pitch * 8,
    target.z + Math.cos(yaw) * distance
  );

  camera.position.lerp(desired, Math.min(1, dt * 5));
  camera.lookAt(target.x, target.y + 1.2, target.z);

  // COMPLETE MISSION
  if (player.position.distanceTo(marker.position) < 7) {
    missionIndex = (missionIndex + 1) % missionPositions.length;
    setMission();
  }

  renderer.render(scene, camera);
}

animate();

// RESIZE
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
});
