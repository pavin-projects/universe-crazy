import * as THREE from "three";
import "./style.css";

const canvasRoot = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
canvasRoot.append(renderer.domElement);
renderer.domElement.setAttribute("role", "img");
renderer.domElement.setAttribute("aria-label", "Animated 3D portal and fighting arena");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#090c1d");
scene.fog = new THREE.FogExp2("#0c1027", 0.022);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 10.5, 17.8);
camera.lookAt(0, 1.4, 0);

scene.add(new THREE.HemisphereLight("#b7c8ff", "#222032", 2.25));
const keyLight = new THREE.DirectionalLight("#fff1d1", 3.5);
keyLight.position.set(-5, 11, 8);
keyLight.castShadow = false;
keyLight.shadow.camera.left = -12;
keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 14;
keyLight.shadow.camera.bottom = -12;
scene.add(keyLight);

const portalLight = new THREE.PointLight("#8b73ff", 18, 12, 2);
portalLight.position.set(0, 3.2, -5.2);
scene.add(portalLight);
const cyanLight = new THREE.PointLight("#4ce9ff", 7, 11, 2);
cyanLight.position.set(6, 4, -1);
scene.add(cyanLight);

const clock = new THREE.Clock();
const keys = new Set();
const justPressed = new Set();
const projectiles = [];
const fighters = [];
const arena = new THREE.Group();
scene.add(arena);
const arenaSurfaces = [];
let portalDisc;
let portalRings = [];
let battleMode = "cpu";
let selectedFighter = "bumble";
let arenaIndex = 0;
const arenaCount = 200;
let floorRadius = 8.15;
let matchTime = 180;
let matchActive = false;
let matchEnded = false;
let cpuThinkTime = 0;
let effectTime = 0;
let displayedSecond = -1;
let hudDirty = true;
let animationFrame = 0;
let lastFrameTime = 0;
const frameInterval = 1000 / 45;

const characters = {
  bumble: {
    name: "Bumble Roy",
    palette: { primary: "#f5bd4a", dark: "#282238", trim: "#ffe38a", accent: "#ff9452" },
    speed: 7.3,
    power: 0.9,
    special: "sting"
  },
  robot: {
    name: "Robot Boy",
    palette: { primary: "#638ec5", dark: "#1d2b4d", trim: "#b1f3ff", accent: "#53e9f4" },
    speed: 5.8,
    power: 1.25,
    special: "dash"
  },
  nova: {
    name: "Nova Fox",
    palette: { primary: "#c27aff", dark: "#30224d", trim: "#ffe38a", accent: "#ff9d67" },
    speed: 7.1,
    power: 0.94,
    special: "sting"
  },
  titan: {
    name: "Cinder Titan",
    palette: { primary: "#c96a4a", dark: "#3d252b", trim: "#ffc276", accent: "#ff604a" },
    speed: 4.9,
    power: 1.38,
    build: "heavy",
    special: "quake"
  },
  glitch: {
    name: "Glitch",
    palette: { primary: "#52d7bd", dark: "#18343d", trim: "#c2fff0", accent: "#ff5dcc" },
    speed: 6.4,
    power: 1.04,
    special: "pulse"
  },
  tide: {
    name: "Tide Runner",
    palette: { primary: "#479ce0", dark: "#18344c", trim: "#b5f6ff", accent: "#43f0d7" },
    speed: 7.6,
    power: 0.86,
    special: "dash"
  }
};

const arenaThemes = [
  { name: "Skyforge Gate", background: "#090c1d", fog: "#0c1027", stone: "#333952", floor: "#252d49", trim: "#4a4b75", glow: "#69d7ed", portal: "#8b73ff" },
  { name: "Emberfall Foundry", background: "#1c1018", fog: "#30151e", stone: "#59404a", floor: "#38212c", trim: "#a84d4d", glow: "#ff9a51", portal: "#ff614c" },
  { name: "Frostline Citadel", background: "#071522", fog: "#0a2637", stone: "#49677b", floor: "#19354b", trim: "#6da9c6", glow: "#9df4ff", portal: "#7bb7ff" },
  { name: "Verdant Canopy", background: "#081b19", fog: "#103127", stone: "#345447", floor: "#183a31", trim: "#47836b", glow: "#9df48f", portal: "#53d6a0" },
  { name: "Neon Drift", background: "#100b25", fog: "#21133c", stone: "#453b68", floor: "#241a42", trim: "#7554aa", glow: "#ff67dc", portal: "#8c68ff" },
  { name: "Tidal Observatory", background: "#061a27", fog: "#0b3342", stone: "#356176", floor: "#153e53", trim: "#438ca0", glow: "#80f8e6", portal: "#38c9ff" },
  { name: "Sunken Crown", background: "#191728", fog: "#292641", stone: "#5b536b", floor: "#35334f", trim: "#a28c67", glow: "#ffd587", portal: "#c7a6ff" },
  { name: "Moonfall Station", background: "#10121b", fog: "#202637", stone: "#444e63", floor: "#252e42", trim: "#7185a6", glow: "#c4d7ff", portal: "#8ca4ff" },
  { name: "Crystal Wilds", background: "#101126", fog: "#24234a", stone: "#4a4778", floor: "#292850", trim: "#8274bb", glow: "#bd9bff", portal: "#ec8bff" },
  { name: "Thunderhead Peak", background: "#121827", fog: "#263248", stone: "#505b70", floor: "#2b354c", trim: "#6d83a4", glow: "#d7f0ff", portal: "#81a4ff" }
];

function material(color, roughness = 0.55, metalness = 0.05, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function addMesh(parent, geometry, mat, position, scale = null) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(...position);
  if (scale) mesh.scale.set(...scale);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (Array.isArray(child.material)) child.material.forEach((item) => item.dispose());
    else if (child.material) child.material.dispose();
  });
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createStars() {
  const vertices = [];
  for (let i = 0; i < 520; i += 1) {
    const radius = 30 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const y = Math.random() * 35 - 4;
    vertices.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius - 12);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#d9ddff", size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.85 }));
  scene.add(points);
}

function createPortal() {
  const portal = new THREE.Group();
  portal.position.set(0, 2.85, -5.45);
  arena.add(portal);

  const frame = addMesh(portal, new THREE.TorusGeometry(1.78, 0.16, 20, 96), material("#9882ff", 0.2, 0.48, { emissive: "#5c47ff", emissiveIntensity: 1.25 }), [0, 0, 0]);
  frame.castShadow = false;
  portalRings.push(frame);

  const innerRing = addMesh(portal, new THREE.TorusGeometry(1.49, 0.035, 12, 88), material("#79edff", 0.2, 0.25, { emissive: "#26cce9", emissiveIntensity: 1.5 }), [0, 0, 0.04]);
  innerRing.castShadow = false;
  portalRings.push(innerRing);

  portalDisc = addMesh(portal, new THREE.CircleGeometry(1.48, 64), new THREE.MeshBasicMaterial({ color: "#453ca4", transparent: true, opacity: 0.74, side: THREE.DoubleSide }), [0, 0, -0.035]);
  portalDisc.castShadow = false;

  for (let i = 0; i < 3; i += 1) {
    const orbit = addMesh(portal, new THREE.TorusGeometry(0.62 + i * 0.22, 0.022, 8, 48), new THREE.MeshBasicMaterial({ color: i % 2 ? "#75e9ff" : "#c2a4ff", transparent: true, opacity: 0.74 - i * 0.12 }), [0, 0, 0.08 + i * 0.01]);
    orbit.userData.spin = i % 2 ? -1 : 1;
    portalRings.push(orbit);
  }

  const pillars = material("#59628b", 0.34, 0.58);
  const glow = material("#80f3ff", 0.25, 0.25, { emissive: "#15bdda", emissiveIntensity: 1.2 });
  for (const x of [-2.7, 2.7]) {
    addMesh(portal, new THREE.CylinderGeometry(0.18, 0.25, 3.6, 8), pillars, [x, -0.6, 0.15]);
    addMesh(portal, new THREE.BoxGeometry(0.52, 0.18, 0.52), glow, [x, 1.32, 0.15]);
  }

  const moteGeometry = new THREE.SphereGeometry(0.035, 7, 7);
  for (let i = 0; i < 42; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.9 + Math.random() * 0.8;
    const mote = addMesh(portal, moteGeometry, new THREE.MeshBasicMaterial({ color: i % 2 ? "#8ff9ff" : "#c5a6ff" }), [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.random() * 0.2]);
    mote.userData.angle = angle;
    mote.userData.radius = radius;
    mote.userData.speed = 0.25 + Math.random() * 0.55;
    portalRings.push(mote);
  }
}

function createArena(index = arenaIndex) {
  disposeObject(arena);
  arena.clear();
  portalRings = [];
  portalDisc = null;
  arenaSurfaces.length = 0;

  const theme = arenaThemes[Math.floor(index / 20) % arenaThemes.length];
  const layout = index % 20;
  const random = seededRandom(index + 941);
  scene.background.set(theme.background);
  scene.fog.color.set(theme.fog);
  portalLight.color.set(theme.portal);
  cyanLight.color.set(theme.glow);

  const stone = material(theme.stone, 0.72, 0.18);
  const floor = material(theme.floor, 0.52, 0.24);
  const trim = material(theme.trim, 0.3, 0.46, { emissive: theme.trim, emissiveIntensity: 0.48 });
  floorRadius = 7.7 + random() * 0.9;
  const platform = addMesh(arena, new THREE.CylinderGeometry(floorRadius + 0.55, floorRadius - 0.35, 0.75, 48), stone, [0, -0.35, 0]);
  platform.receiveShadow = true;
  addMesh(arena, new THREE.CircleGeometry(floorRadius, 48), floor, [0, 0.035, 0]).rotation.x = -Math.PI / 2;

  for (const radius of [3.1, floorRadius * 0.74, floorRadius - 0.1]) {
    const ring = addMesh(arena, new THREE.TorusGeometry(radius, radius > floorRadius - 0.2 ? 0.075 : 0.025, 8, 72), trim, [0, 0.08, 0]);
    ring.rotation.x = Math.PI / 2;
  }

  const rune = material(theme.glow, 0.25, 0.32, { emissive: theme.glow, emissiveIntensity: 0.55 });
  const markCount = 8 + Math.floor(random() * 9);
  for (let i = 0; i < markCount; i += 1) {
    const angle = (i / markCount) * Math.PI * 2;
    const mark = addMesh(arena, new THREE.BoxGeometry(0.12, 0.018, 0.48 + random() * 0.35), rune, [Math.cos(angle) * floorRadius * 0.86, 0.085, Math.sin(angle) * floorRadius * 0.86]);
    mark.rotation.y = -angle;
  }

  const stageCount = 1 + (layout % 3);
  for (let i = 0; i < stageCount; i += 1) {
    const angle = (i / stageCount) * Math.PI * 2 + random() * 0.38;
    const x = Math.cos(angle) * (2.4 + random() * 1.2);
    const z = Math.sin(angle) * (2.1 + random() * 1.3);
    const width = 1.05 + random() * 0.35;
    const depth = 0.78 + random() * 0.38;
    const top = 0.76 + random() * 0.46;
    const stage = addMesh(arena, new THREE.BoxGeometry(width * 2, 0.24, depth * 2), trim, [x, top - 0.12, z]);
    addMesh(arena, new THREE.BoxGeometry(width * 1.9, 0.035, depth * 1.9), floor, [x, top + 0.018, z]);
    stage.receiveShadow = true;
    arenaSurfaces.push({ x, z, top, halfWidth: width, halfDepth: depth });
  }

  const crystal = material(theme.trim, 0.38, 0.35);
  const crystalCount = 3 + Math.floor(random() * 5);
  for (let i = 0; i < crystalCount; i += 1) {
    const angle = (i / crystalCount) * Math.PI * 2 + random() * 0.3;
    const size = 0.65 + random() * 0.65;
    const x = Math.cos(angle) * (floorRadius + 1.5 + random() * 2);
    const z = Math.sin(angle) * (floorRadius + 1.5 + random() * 2);
    const shard = addMesh(arena, new THREE.OctahedronGeometry(size, 0), crystal, [x, -0.3, z], [0.8, 1.3 + random(), 0.8]);
    shard.rotation.set(random() * 0.5, angle, random() * 0.5);
  }

  const cloudMaterial = new THREE.MeshStandardMaterial({ color: theme.trim, transparent: true, opacity: 0.3, roughness: 1 });
  const cloudCount = 4 + Math.floor(random() * 4);
  for (let i = 0; i < cloudCount; i += 1) {
    const cloud = new THREE.Group();
    const angle = (i / cloudCount) * Math.PI * 2;
    cloud.position.set(Math.cos(angle) * (floorRadius + 1 + random() * 3), -2.4 - random() * 1.4, Math.sin(angle) * (floorRadius + 1 + random() * 3));
    for (let j = 0; j < 3; j += 1) {
      addMesh(cloud, new THREE.SphereGeometry(0.75 + random() * 0.5, 10, 8), cloudMaterial, [(random() - 0.5) * 1.5, (random() - 0.5) * 0.45, (random() - 0.5) * 1.4], [1.35, 0.7, 1]);
    }
    arena.add(cloud);
  }

  createPortal();
}

function createLimb(parent, palette, x, y, z, length, radius, rotationZ = 0) {
  const limb = addMesh(parent, new THREE.CapsuleGeometry(radius, length, 4, 8), material(palette.primary, 0.42, 0.18), [x, y, z]);
  limb.rotation.z = rotationZ;
  limb.userData.restRotationZ = rotationZ;
  return limb;
}

function createFighterVisual(kind) {
  const palette = characters[kind].palette;
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const mainMat = material(palette.primary, 0.36, kind === "robot" ? 0.52 : 0.12);
  const trimMat = material(palette.trim, 0.3, 0.22, { emissive: kind === "robot" ? "#14738c" : "#583100", emissiveIntensity: 0.18 });
  const darkMat = material(palette.dark, 0.56, 0.08);
  const animatedLimbs = [];

  if (kind === "bumble") {
    addMesh(body, new THREE.CapsuleGeometry(0.42, 0.63, 5, 12), mainMat, [0, 1.05, 0]);
    addMesh(body, new THREE.SphereGeometry(0.45, 18, 14), mainMat, [0, 1.93, 0.02], [1, 0.95, 0.95]);
    addMesh(body, new THREE.SphereGeometry(0.32, 16, 12), material("#fff1c8", 0.3), [0, 1.97, 0.36], [1, 0.67, 0.26]);
    for (const x of [-0.13, 0.13]) {
      addMesh(body, new THREE.SphereGeometry(0.055, 9, 8), darkMat, [x, 2.03, 0.44]);
      addMesh(body, new THREE.CylinderGeometry(0.035, 0.045, 0.38, 8), darkMat, [x * 1.4, 2.43, 0.01], [1, 1, 1]).rotation.z = x < 0 ? -0.2 : 0.2;
      addMesh(body, new THREE.SphereGeometry(0.09, 10, 8), trimMat, [x * 1.4, 2.63, 0.01]);
    }
    for (const y of [0.84, 1.18, 1.49]) {
      addMesh(body, new THREE.BoxGeometry(0.7, 0.12, 0.78), darkMat, [0, y, 0.015]);
    }
    for (const side of [-1, 1]) {
      animatedLimbs.push(createLimb(body, palette, side * 0.56, 1.12, 0, 0.42, 0.14, side * -0.18));
      addMesh(body, new THREE.SphereGeometry(0.18, 12, 10), trimMat, [side * 0.66, 0.82, 0.05]);
      animatedLimbs.push(createLimb(body, palette, side * 0.22, 0.4, 0, 0.33, 0.15, side * 0.04));
      addMesh(body, new THREE.SphereGeometry(0.18, 12, 9), darkMat, [side * 0.22, 0.14, 0.11], [1.2, 0.62, 1.3]);
      const wing = addMesh(body, new THREE.SphereGeometry(0.4, 14, 10), new THREE.MeshStandardMaterial({ color: "#d8f3ff", roughness: 0.2, transparent: true, opacity: 0.55, metalness: 0.12 }), [side * 0.55, 1.55, -0.32], [0.95, 0.32, 0.25]);
      wing.rotation.z = side * 0.3;
    }
    addMesh(body, new THREE.TorusGeometry(0.27, 0.035, 8, 24), trimMat, [0, 1.04, 0.41]);
  } else if (kind === "robot") {
    addMesh(body, new THREE.BoxGeometry(0.78, 0.82, 0.58), mainMat, [0, 1.08, 0]);
    addMesh(body, new THREE.BoxGeometry(0.71, 0.6, 0.6), mainMat, [0, 1.82, 0]);
    addMesh(body, new THREE.BoxGeometry(0.55, 0.26, 0.045), darkMat, [0, 1.85, 0.32]);
    for (const x of [-0.16, 0.16]) {
      addMesh(body, new THREE.SphereGeometry(0.065, 10, 8), trimMat, [x, 1.86, 0.36]);
    }
    addMesh(body, new THREE.CylinderGeometry(0.035, 0.055, 0.3, 8), trimMat, [0, 2.27, 0], [1, 1, 1]);
    addMesh(body, new THREE.SphereGeometry(0.1, 10, 8), trimMat, [0, 2.43, 0]);
    addMesh(body, new THREE.TorusGeometry(0.16, 0.035, 8, 20), trimMat, [0, 1.13, 0.31]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.BoxGeometry(0.3, 0.55, 0.35), darkMat, [side * 0.56, 1.15, 0]);
      animatedLimbs.push(createLimb(body, palette, side * 0.62, 0.98, 0, 0.3, 0.13, side * -0.12));
      addMesh(body, new THREE.SphereGeometry(0.16, 10, 8), trimMat, [side * 0.64, 0.76, 0.08]);
      animatedLimbs.push(createLimb(body, palette, side * 0.22, 0.4, 0, 0.34, 0.15, side * 0.03));
      addMesh(body, new THREE.BoxGeometry(0.32, 0.2, 0.4), trimMat, [side * 0.22, 0.12, 0.08]);
      addMesh(body, new THREE.BoxGeometry(0.16, 0.72, 0.2), trimMat, [side * 0.55, 1.12, 0]);
      addMesh(body, new THREE.SphereGeometry(0.22, 12, 10), mainMat, [side * 0.58, 0.77, 0.08]);
    }
    addMesh(body, new THREE.BoxGeometry(0.22, 0.22, 0.12), trimMat, [0, 1.18, 0.34]);
  } else {
    const heavy = characters[kind].build === "heavy";
    const width = heavy ? 0.58 : 0.42;
    addMesh(body, new THREE.CapsuleGeometry(width, heavy ? 0.72 : 0.64, 5, 10), mainMat, [0, 1.08, 0]);
    addMesh(body, new THREE.SphereGeometry(heavy ? 0.48 : 0.39, 16, 12), mainMat, [0, 1.92, 0.02]);
    addMesh(body, new THREE.BoxGeometry(0.5, 0.19, 0.12), darkMat, [0, 1.89, 0.36]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.SphereGeometry(0.07, 9, 8), trimMat, [side * 0.14, 1.9, 0.43]);
      animatedLimbs.push(createLimb(body, palette, side * (heavy ? 0.68 : 0.55), 1.14, 0, 0.48, heavy ? 0.2 : 0.15, side * -0.12));
      animatedLimbs.push(createLimb(body, palette, side * 0.22, 0.4, 0, 0.38, heavy ? 0.19 : 0.14, side * 0.04));
      addMesh(body, new THREE.BoxGeometry(0.38, 0.18, 0.45), darkMat, [side * 0.22, 0.12, 0.08]);
    }
    addMesh(body, new THREE.TorusGeometry(0.24, 0.055, 8, 20), trimMat, [0, 1.12, 0.39]);
    if (kind === "nova") {
      for (const side of [-1, 1]) {
        const ear = addMesh(body, new THREE.ConeGeometry(0.18, 0.62, 6), trimMat, [side * 0.24, 2.45, 0]);
        ear.rotation.z = side * -0.22;
      }
      const tail = addMesh(body, new THREE.ConeGeometry(0.22, 0.78, 8), mainMat, [0, 0.94, -0.62]);
      tail.rotation.x = Math.PI / 2;
    } else if (kind === "titan") {
      for (const side of [-1, 1]) {
        const horn = addMesh(body, new THREE.ConeGeometry(0.2, 0.58, 6), trimMat, [side * 0.39, 2.15, -0.08]);
        horn.rotation.z = side * -0.42;
        addMesh(body, new THREE.OctahedronGeometry(0.31, 0), darkMat, [side * 0.58, 1.52, 0]);
      }
    } else if (kind === "glitch") {
      const halo = addMesh(body, new THREE.TorusGeometry(0.62, 0.045, 8, 32), trimMat, [0, 2.3, 0]);
      halo.rotation.x = Math.PI / 2;
      halo.userData.spin = 0.8;
    } else if (kind === "tide") {
      for (const side of [-1, 1]) {
        const fin = addMesh(body, new THREE.ConeGeometry(0.22, 0.68, 5), trimMat, [side * 0.49, 1.36, -0.18]);
        fin.rotation.z = side * Math.PI / 2;
      }
    }
  }

  root.traverse((child) => {
    if (child.isMesh) child.castShadow = true;
  });
  root.userData.body = body;
  root.userData.kind = kind;
  root.userData.animatedLimbs = animatedLimbs;
  return root;
}

function makeFighter(kind, index) {
  const visual = createFighterVisual(kind);
  const x = index === 0 ? -3.4 : 3.4;
  visual.position.set(x, 0.08, index === 0 ? 1.1 : -0.6);
  arena.add(visual);
  return {
    kind, visual, x, y: 0.08, z: index === 0 ? 1.1 : -0.6,
    vx: 0, vy: 0, vz: 0, facing: index === 0 ? 1 : -1,
    damage: 0, stocks: 3, grounded: true, cooldown: 0, specialCooldown: 0,
    invulnerable: 0, attackPose: 0, respawn: 0
  };
}

function clearFighters() {
  for (const fighter of fighters) {
    disposeObject(fighter.visual);
    arena.remove(fighter.visual);
  }
  fighters.length = 0;
  for (const projectile of projectiles) {
    disposeObject(projectile.mesh);
    arena.remove(projectile.mesh);
  }
  projectiles.length = 0;
}

function updateHud() {
  if (fighters.length < 2) return;
  const [one, two] = fighters;
  document.querySelector("#player-one-name").textContent = characters[one.kind].name;
  document.querySelector("#player-two-name").textContent = characters[two.kind].name;
  document.querySelector("#player-one-damage").textContent = `${Math.floor(one.damage)}%`;
  document.querySelector("#player-two-damage").textContent = `${Math.floor(two.damage)}%`;
  document.querySelector("#player-one-stocks").textContent = `${"● ".repeat(one.stocks)}${"○ ".repeat(3 - one.stocks)}`.trim();
  document.querySelector("#player-two-stocks").textContent = `${"● ".repeat(two.stocks)}${"○ ".repeat(3 - two.stocks)}`.trim();
  document.querySelector("#player-one-stocks").setAttribute("aria-label", `${one.stocks} stocks remaining`);
  document.querySelector("#player-two-stocks").setAttribute("aria-label", `${two.stocks} stocks remaining`);
  hudDirty = false;
}

function updateArenaLabel() {
  const theme = arenaThemes[Math.floor(arenaIndex / 20) % arenaThemes.length];
  document.querySelector("#arena-name").textContent = `${theme.name} · Layout ${(arenaIndex % 10) + 1}`;
  document.querySelector("#arena-count").textContent = `${arenaIndex + 1} / ${arenaCount}`;
  document.querySelector("#battle-arena-name").textContent = theme.name.toUpperCase();
}

function updateControlsHint() {
  document.querySelector("#controls-hint").textContent = battleMode === "cpu"
    ? "Move: ←/→ or A/D · Jump: ↑ / Space · Depth: ↓ / W/S · Strike: J / Enter · Special: K / Shift"
    : "Local controls: Arrow keys + Enter/Shift · A/D + Space/J/K · W/S for depth";
}

function clearInputState() {
  keys.clear();
  justPressed.clear();
}

function changeArena(offset) {
  arenaIndex = (arenaIndex + offset + arenaCount) % arenaCount;
  createArena(arenaIndex);
  updateArenaLabel();
}

function startMatch() {
  clearInputState();
  clearFighters();
  const characterIds = Object.keys(characters);
  const opponent = characterIds[(characterIds.indexOf(selectedFighter) + 1) % characterIds.length];
  fighters.push(makeFighter(selectedFighter, 0), makeFighter(opponent, 1));
  matchTime = 180;
  displayedSecond = -1;
  matchActive = true;
  matchEnded = false;
  cpuThinkTime = 0;
  hudDirty = true;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#battle-hud").hidden = false;
  document.querySelector("#touch-controls").hidden = battleMode !== "cpu";
  document.querySelector("#player-two-label").textContent = battleMode === "cpu" ? "CPU" : "PLAYER 2";
  document.querySelector("#battle-status").textContent = "FIGHT!";
  updateHud();
  document.querySelector("#screen-reader-status").textContent = `Battle started. ${characters[selectedFighter].name} versus ${characters[opponent].name}.`;
}

function showSelection() {
  clearInputState();
  matchActive = false;
  document.querySelector("#battle-hud").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = false;
  clearFighters();
}

function showPortal() {
  clearInputState();
  matchActive = false;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#battle-hud").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#portal-screen").hidden = false;
  clearFighters();
}

function finishMatch(winnerIndex, reason) {
  if (matchEnded) return;
  clearInputState();
  matchEnded = true;
  matchActive = false;
  document.querySelector("#battle-status").textContent = "FINAL";
  const winner = winnerIndex === null ? null : fighters[winnerIndex];
  document.querySelector("#winner-title").textContent = winner ? `${characters[winner.kind].name.toUpperCase()} WINS` : "TIME!";
  document.querySelector("#winner-message").textContent = winner
    ? `${characters[winner.kind].name} takes the arena. ${reason}`
    : reason;
  document.querySelector("#match-end").hidden = false;
  document.querySelector("#screen-reader-status").textContent = document.querySelector("#winner-message").textContent;
}

function launchProjectile(fighter) {
  const projectile = addMesh(arena, new THREE.SphereGeometry(0.27, 16, 12), new THREE.MeshStandardMaterial({
    color: "#ffe36f", emissive: "#ff9d35", emissiveIntensity: 2.3, roughness: 0.2
  }), [fighter.x + fighter.facing * 0.8, fighter.y + 1.35, fighter.z]);
  const halo = addMesh(projectile, new THREE.TorusGeometry(0.39, 0.025, 8, 24), new THREE.MeshBasicMaterial({ color: "#fff1a6" }), [0, 0, 0]);
  halo.rotation.x = Math.PI / 2;
  projectile.userData.spin = 4;
  projectiles.push({ mesh: projectile, owner: fighter, vx: fighter.facing * 13, life: 1.5, damage: 9, power: characters[fighter.kind].power });
}

function hitTarget(attacker, target, damage, force) {
  if (target.invulnerable > 0) return;
  target.damage += damage;
  const direction = target.x >= attacker.x ? 1 : -1;
  const knockback = force + target.damage * 0.045;
  target.vx += direction * knockback;
  target.vy = Math.max(target.vy, 2.8 + target.damage * 0.022);
  target.vz += Math.sign(target.z - attacker.z || 1) * 1.3;
  target.grounded = false;
  hudDirty = true;
  document.querySelector("#battle-status").textContent = `${characters[attacker.kind].name} landed a hit!`;
}

function attack(fighter, target, special = false) {
  if (fighter.cooldown > 0 || !matchActive) return;
  if (special && fighter.specialCooldown > 0) return;
  fighter.cooldown = special ? 0.55 : 0.42;
  fighter.attackPose = special ? 0.55 : 0.34;
  if (special) fighter.specialCooldown = 4;

  if (special && characters[fighter.kind].special === "sting") {
    launchProjectile(fighter);
    return;
  }

  if (special && characters[fighter.kind].special === "dash") {
    fighter.vx = fighter.facing * 12;
  }

  const dx = target.x - fighter.x;
  const dz = target.z - fighter.z;
  const inReach = Math.hypot(dx, dz) < (special ? 2.6 : 2.15);
  const inFront = dx * fighter.facing > -0.65;
  if (inReach && Math.abs(dz) < 1.75 && inFront) {
    hitTarget(fighter, target, (special ? 12 : 7) * characters[fighter.kind].power, special ? 5 : 3.2);
  }
}

function respawn(fighter, index) {
  fighter.stocks -= 1;
  if (fighter.stocks <= 0) {
    const winnerIndex = index === 0 ? 1 : 0;
    finishMatch(winnerIndex, "Out of stocks.");
    updateHud();
    return;
  }
  fighter.x = index === 0 ? -3.4 : 3.4;
  fighter.y = 0.08;
  fighter.z = index === 0 ? 1.1 : -0.6;
  fighter.vx = 0;
  fighter.vy = 0;
  fighter.vz = 0;
  fighter.damage = 0;
  fighter.invulnerable = 1.6;
  fighter.respawn = 0;
  hudDirty = true;
  document.querySelector("#battle-status").textContent = `${characters[fighter.kind].name} returns!`;
}

function readInput(fighter, index, delta) {
  const isCpu = index === 1 && battleMode === "cpu";
  const pressed = (...codes) => codes.some((code) => keys.has(code));
  const tapped = (...codes) => codes.some((code) => justPressed.has(code));
  let horizontal = 0;
  let depth = 0;
  let jump = false;
  let strike = false;
  let special = false;

  if (!isCpu) {
    if (index === 0) {
      const arrowAliases = battleMode === "cpu";
      horizontal = Number(pressed("KeyD", ...(arrowAliases ? ["ArrowRight"] : []))) - Number(pressed("KeyA", ...(arrowAliases ? ["ArrowLeft"] : [])));
      depth = Number(pressed("KeyS", ...(arrowAliases ? ["ArrowDown"] : []))) - Number(keys.has("KeyW"));
      jump = pressed("Space", ...(arrowAliases ? ["ArrowUp"] : [])) && tapped("Space", ...(arrowAliases ? ["ArrowUp"] : []));
      strike = tapped("KeyJ", ...(arrowAliases ? ["Enter"] : []));
      special = tapped("KeyK", ...(arrowAliases ? ["ShiftRight"] : []));
    } else {
      horizontal = Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"));
      depth = Number(keys.has("ArrowDown"));
      jump = keys.has("ArrowUp") && justPressed.has("ArrowUp");
      strike = justPressed.has("Enter");
      special = justPressed.has("ShiftRight");
    }
  } else {
    const target = fighters[0];
    const dx = target.x - fighter.x;
    const dz = target.z - fighter.z;
    horizontal = Math.abs(dx) > 1.7 ? Math.sign(dx) : 0;
    depth = Math.abs(dz) > 1.1 ? Math.sign(dz) : 0;
    cpuThinkTime -= delta;
    if (cpuThinkTime <= 0) {
      cpuThinkTime = 0.25 + Math.random() * 0.35;
      strike = Math.hypot(dx, dz) < 2.2;
      special = Math.hypot(dx, dz) < 4 && Math.random() < 0.22;
      jump = fighter.grounded && Math.random() < 0.12;
    }
  }

  const speed = characters[fighter.kind].speed;
  fighter.vx = (fighter.vx + horizontal * speed * delta * 8) * Math.exp(-(horizontal ? 3.2 : 7) * delta);
  fighter.vz = (fighter.vz + depth * speed * delta * 6) * Math.exp(-(depth ? 3.8 : 7) * delta);
  fighter.vx = THREE.MathUtils.clamp(fighter.vx, -speed, speed);
  fighter.vz = THREE.MathUtils.clamp(fighter.vz, -speed * 0.7, speed * 0.7);
  if (Math.abs(fighter.vx) < 0.035) fighter.vx = 0;
  if (Math.abs(fighter.vz) < 0.035) fighter.vz = 0;

  if (horizontal) fighter.facing = Math.sign(horizontal);
  if (jump && fighter.grounded) {
    fighter.vy = 9.2;
    fighter.grounded = false;
  }
  if (strike) attack(fighter, fighters[1 - index]);
  if (special) attack(fighter, fighters[1 - index], true);
}

function updateFighter(fighter, index, delta, elapsed) {
  fighter.cooldown = Math.max(0, fighter.cooldown - delta);
  fighter.specialCooldown = Math.max(0, fighter.specialCooldown - delta);
  fighter.invulnerable = Math.max(0, fighter.invulnerable - delta);
  fighter.attackPose = Math.max(0, fighter.attackPose - delta);
  if (fighter.respawn > 0) {
    fighter.respawn -= delta;
    if (fighter.respawn <= 0) respawn(fighter, index);
    return;
  }

  readInput(fighter, index, delta);
  const previousY = fighter.y;
  fighter.vy -= 23 * delta;
  fighter.x += fighter.vx * delta;
  fighter.y += fighter.vy * delta;
  fighter.z += fighter.vz * delta;

  const edgeDistance = Math.hypot(fighter.x, fighter.z * 1.08);
  fighter.grounded = false;
  if (fighter.vy <= 0) {
    const landedSurface = arenaSurfaces.find((surface) =>
      previousY >= surface.top &&
      fighter.y <= surface.top &&
      Math.abs(fighter.x - surface.x) <= surface.halfWidth + 0.28 &&
      Math.abs(fighter.z - surface.z) <= surface.halfDepth + 0.28
    );
    if (landedSurface) {
      fighter.y = landedSurface.top;
      fighter.vy = 0;
      fighter.grounded = true;
    }
  }
  if (!fighter.grounded && edgeDistance <= floorRadius && fighter.y <= 0.08) {
    fighter.y = 0.08;
    fighter.vy = 0;
    fighter.grounded = true;
  }

  if (fighter.y < -8 || edgeDistance > floorRadius + 3.4) {
    fighter.respawn = 1;
    fighter.visual.position.y = -10;
    document.querySelector("#battle-status").textContent = `${characters[fighter.kind].name} is out!`;
    return;
  }

  fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
  fighter.visual.rotation.y = fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
  const body = fighter.visual.userData.body;
  const movement = Math.min(1, Math.hypot(fighter.vx, fighter.vz) / characters[fighter.kind].speed);
  const swing = fighter.attackPose > 0 ? Math.sin((fighter.attackPose / 0.55) * Math.PI) : 0;
  body.position.y = fighter.grounded ? Math.abs(Math.sin(elapsed * 12)) * 0.065 * movement : 0;
  body.rotation.z = swing * -fighter.facing * 0.22 - fighter.vx * 0.012;
  body.rotation.x = fighter.grounded ? 0 : -0.1;
  fighter.visual.userData.animatedLimbs.forEach((limb, limbIndex) => {
    limb.rotation.z = limb.userData.restRotationZ
      + Math.sin(elapsed * 10 + (limbIndex % 2) * Math.PI) * 0.42 * movement
      + Math.cos(elapsed * 18) * swing * -fighter.facing * 0.28;
  });
  fighter.visual.visible = fighter.invulnerable <= 0 || Math.floor(elapsed * 12) % 2 === 0;
}

function updateProjectiles(delta) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.life -= delta;
    projectile.mesh.position.x += projectile.vx * delta;
    projectile.mesh.rotation.y += delta * 4;
    const target = fighters.find((fighter) => fighter !== projectile.owner);
    const dx = target ? projectile.mesh.position.x - target.x : 0;
    const dy = target ? projectile.mesh.position.y - (target.y + 1.3) : 0;
    const dz = target ? projectile.mesh.position.z - target.z : 0;
    if (target && dx * dx + dy * dy + dz * dz < 0.85 * 0.85) {
      hitTarget(projectile.owner, target, projectile.damage * projectile.power, 4.2);
      projectile.life = 0;
    }
    if (projectile.life <= 0 || Math.abs(projectile.mesh.position.x) > 12) {
      arena.remove(projectile.mesh);
      projectiles.splice(i, 1);
    }
  }
}

function updateClock(delta) {
  matchTime = Math.max(0, matchTime - delta);
  const wholeSeconds = Math.ceil(matchTime);
  if (wholeSeconds !== displayedSecond) {
    displayedSecond = wholeSeconds;
    const minutes = Math.floor(wholeSeconds / 60);
    const seconds = Math.floor(wholeSeconds % 60).toString().padStart(2, "0");
    document.querySelector("#match-clock").textContent = `${minutes}:${seconds}`;
  }
  if (matchTime === 0) {
    const one = fighters[0];
    const two = fighters[1];
    const winner = one.stocks === two.stocks
      ? (one.damage === two.damage ? null : one.damage < two.damage ? 0 : 1)
      : one.stocks > two.stocks ? 0 : 1;
    finishMatch(winner, winner === null ? "The arena ends in a draw." : "Time is up!");
  }
}

function updateCamera(delta) {
  const centerX = fighters.length === 2 ? (fighters[0].x + fighters[1].x) / 2 : 0;
  const targetX = THREE.MathUtils.clamp(centerX * 0.42, -4.5, 4.5);
  camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.7, delta);
  camera.lookAt(targetX * 0.68, 1.35, 0);
}

function animatePortal(elapsed, delta) {
  portalRings.forEach((item, index) => {
    if (item.userData.spin) {
      item.rotation.z += delta * item.userData.spin;
    } else if (item.userData.angle !== undefined) {
      item.userData.angle += delta * item.userData.speed;
      item.position.x = Math.cos(item.userData.angle) * item.userData.radius;
      item.position.y = Math.sin(item.userData.angle) * item.userData.radius;
      item.position.z = Math.sin(elapsed * 2 + index) * 0.13;
    } else if (index === 0) {
      item.rotation.z = Math.sin(elapsed * 0.45) * 0.14;
    }
  });
  if (portalDisc) {
    portalDisc.material.opacity = 0.62 + Math.sin(elapsed * 1.8) * 0.1;
  }
  portalLight.intensity = 16 + Math.sin(elapsed * 2.4) * 3;
  cyanLight.intensity = 6 + Math.sin(elapsed * 1.6 + 1) * 2;
}

function frame(timestamp = 0) {
  if (document.hidden) {
    keys.clear();
    return;
  }
  if (timestamp - lastFrameTime < frameInterval) {
    animationFrame = requestAnimationFrame(frame);
    return;
  }
  lastFrameTime = timestamp;
  const delta = Math.min(clock.getDelta(), 1 / 30);
  const elapsed = clock.elapsedTime;
  animatePortal(elapsed, delta);
  if (matchActive) {
    updateClock(delta);
    for (let index = 0; index < fighters.length; index += 1) {
      updateFighter(fighters[index], index, delta, elapsed);
    }
    updateProjectiles(delta);
    updateCamera(delta);
    if (hudDirty) updateHud();
  } else if (fighters.length === 0) {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 0.6, delta);
    camera.lookAt(0, 1.4, 0);
  }
  justPressed.clear();
  renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(frame);
}

createStars();
createArena(arenaIndex);
updateArenaLabel();

document.querySelector("#enter-portal").addEventListener("click", showSelection);
document.querySelector("#back-to-portal").addEventListener("click", showPortal);
document.querySelector("#start-match").addEventListener("click", startMatch);
document.querySelector("#leave-battle").addEventListener("click", showSelection);
document.querySelector("#rematch").addEventListener("click", startMatch);
document.querySelector("#return-to-select").addEventListener("click", showSelection);
document.querySelector("#toggle-mode").addEventListener("click", () => {
  battleMode = battleMode === "cpu" ? "local" : "cpu";
  document.querySelector("#mode-label").textContent = battleMode === "cpu" ? "Solo vs. CPU" : "Local 2-player";
  document.querySelector("#toggle-mode").textContent = battleMode === "cpu" ? "Change mode" : "Switch to CPU";
  updateControlsHint();
});
document.querySelector("#arena-previous").addEventListener("click", () => changeArena(-1));
document.querySelector("#arena-next").addEventListener("click", () => changeArena(1));
document.querySelector("#arena-random").addEventListener("click", () => changeArena(1 + Math.floor(Math.random() * (arenaCount - 1))));

document.querySelectorAll(".fighter-card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedFighter = card.dataset.fighter;
    document.querySelectorAll(".fighter-card").forEach((item) => {
      const selected = item === card;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
  });
});

window.addEventListener("keydown", (event) => {
  const supported = ["KeyA", "KeyD", "KeyW", "KeyS", "Space", "KeyJ", "KeyK", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "ShiftRight"];
  if (!supported.includes(event.code)) return;
  if (matchActive) event.preventDefault();
  if (!keys.has(event.code)) justPressed.add(event.code);
  keys.add(event.code);
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", clearInputState);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    keys.clear();
    justPressed.clear();
  } else {
    clock.start();
    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(frame);
  }
});

document.querySelectorAll(".touch-controls button").forEach((button) => {
  const code = button.dataset.key;
  const release = () => keys.delete(code);
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (!keys.has(code)) justPressed.add(code);
    keys.add(code);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
});

frame();
