import * as THREE from "three";

function initializeUniverseCrazy() {
const canvasRoot = document.querySelector("#scene");
const graphicsError = document.querySelector("#graphics-error");
const graphicsErrorMessage = document.querySelector("#graphics-error-message");
const knockoutFlash = document.querySelector("#knockout-flash");
const knockoutName = document.querySelector("#knockout-name");
const storageNotice = document.querySelector("#storage-notice");
const fullscreenButton = document.querySelector("#toggle-fullscreen");
const fullscreenNotice = document.querySelector("#fullscreen-notice");
document.querySelector("#retry-graphics").addEventListener("click", () => window.location.reload());
function updateFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.textContent = isFullscreen ? "EXIT FULL SCREEN" : "FULL SCREEN";
  fullscreenButton.setAttribute("aria-label", isFullscreen ? "Exit full screen" : "Enter full screen");
}

fullscreenButton.addEventListener("click", async () => {
  fullscreenNotice.hidden = true;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else {
      fullscreenNotice.textContent = "Full screen is not supported by this browser.";
      fullscreenNotice.hidden = false;
    }
  } catch (error) {
    if (!(error instanceof TypeError)
      && (!(error instanceof DOMException) || !["NotAllowedError", "SecurityError"].includes(error.name))) throw error;
    fullscreenNotice.textContent = "Full screen is blocked in this view. Open Universe Crazy in its own tab to play full screen.";
    fullscreenNotice.hidden = false;
  }
});
document.addEventListener("fullscreenchange", updateFullscreenButton);
updateFullscreenButton();
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
} catch (error) {
  if (!(error instanceof Error) || !/webgl|context/i.test(error.message)) throw error;
  graphicsErrorMessage.textContent = "3D graphics could not start. Close other 3D tabs or enable browser hardware acceleration, then reload.";
  graphicsError.hidden = false;
  return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
canvasRoot.append(renderer.domElement);
renderer.domElement.setAttribute("role", "img");
renderer.domElement.setAttribute("aria-label", "Game scene. Keyboard controls activate after starting a match.");
renderer.domElement.tabIndex = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#090c1d");
scene.fog = new THREE.FogExp2("#0c1027", 0.022);
let starField;
let galaxyBackdrop;
let titlePlanets;
let spaceBattle;
const backgroundShips = [];
const backgroundShots = [];

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 10.8, 25.5);
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
const virtualKeys = new Set();
const projectiles = [];
const hitEffects = [];
const fighters = [];
const arena = new THREE.Group();
scene.add(arena);
const arenaSurfaces = [];
const arenaPlanets = [];
let portalDisc;
let portalRings = [];
let fighterPreview = null;
let secretPowerUp = null;
let battleMode = "cpu";
let selectedFighter = "bumble";
const arenaCount = 200;
let arenaIndex = Math.floor(Math.random() * arenaCount);
let floorRadius = 8.15;
let secretSeal = null;
let secretPortalPending = false;
let hiddenRealmActive = false;
let secretChallengeActive = false;
let secretPortalOpen = false;
let titleScreenActive = true;
let selectionScreenActive = false;
let savedArenaIndex = 0;
let savedBattleMode = "cpu";
let unlockPersistenceAvailable = true;
function readEntityUnlock() {
  try {
    return window.localStorage.getItem("universeCrazyEntitySkin") === "unlocked";
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
    unlockPersistenceAvailable = false;
    storageNotice.hidden = false;
    return false;
  }
}

function saveEntityUnlock() {
  if (!unlockPersistenceAvailable) return false;
  try {
    window.localStorage.setItem("universeCrazyEntitySkin", "unlocked");
    return true;
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
    unlockPersistenceAvailable = false;
    storageNotice.hidden = false;
    return false;
  }
}

let entityUnlocked = readEntityUnlock();
const regularCharacterIds = ["bumble", "robot", "nova", "titan", "glitch", "tide", "frog", "dinosaur"];
let matchTime = 180;
let matchActive = false;
let matchEnded = false;
let portalIntroActive = false;
let effectTime = 0;
let displayedSecond = -1;
let hudDirty = true;
let knockoutFlashTimer = 0;
let animationFrame = 0;
let lastFrameTime = 0;
const frameInterval = 1000 / 45;
let joystickPointerId = null;
let cameraShake = 0;
let graphicsContextLost = false;
let resumeAfterGraphicsRestore = false;

const characters = {
  bumble: {
    name: "Bumble Boy",
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
  },
  frog: {
    name: "Moss Hopper",
    palette: { primary: "#63d274", dark: "#204d3b", trim: "#d8ff96", accent: "#88f0b0" },
    speed: 7.4,
    power: 0.92,
    special: "sting"
  },
  dinosaur: {
    name: "Rex Rumble",
    palette: { primary: "#f0784d", dark: "#57313f", trim: "#ffd166", accent: "#ff9d59" },
    speed: 5.6,
    power: 1.22,
    build: "heavy",
    special: "quake"
  },
  entity: {
    name: "Entity.exe",
    palette: { primary: "#71284e", dark: "#160c25", trim: "#ff4f8d", accent: "#b774ff" },
    speed: 5.5,
    power: 1.2,
    build: "heavy",
    special: "pulse"
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

const secretTheme = {
  name: "The Null Abyss", background: "#08050f", fog: "#16081f", stone: "#30223d",
  floor: "#1d142b", trim: "#873f83", glow: "#ff4f8d", portal: "#bd48ff"
};

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
  starField = points;
  scene.add(starField);

  const spiralPositions = [];
  const spiralColors = [];
  for (let i = 0; i < 1600; i += 1) {
    const arm = i % 4;
    const radius = 0.7 + Math.random() * 22;
    const angle = arm * Math.PI / 2 + radius * 0.22 + (Math.random() - 0.5) * 0.38;
    spiralPositions.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.58 + (Math.random() - 0.5) * 0.9,
      (Math.random() - 0.5) * 1.8
    );
    const color = new THREE.Color().setHSL(0.56 + Math.random() * 0.19, 0.78, 0.62 + Math.random() * 0.24);
    spiralColors.push(color.r, color.g, color.b);
  }
  const spiralGeometry = new THREE.BufferGeometry();
  spiralGeometry.setAttribute("position", new THREE.Float32BufferAttribute(spiralPositions, 3));
  spiralGeometry.setAttribute("color", new THREE.Float32BufferAttribute(spiralColors, 3));
  galaxyBackdrop = new THREE.Group();
  galaxyBackdrop.position.set(-3, 10, -43);
  galaxyBackdrop.rotation.x = -0.18;
  galaxyBackdrop.add(new THREE.Points(
    spiralGeometry,
    new THREE.PointsMaterial({ size: 0.19, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.78 })
  ));
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 16, 12),
    new THREE.MeshBasicMaterial({ color: "#fff1d2" })
  );
  galaxyBackdrop.add(core);
  scene.add(galaxyBackdrop);
}

function createUniverseBackdrop() {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the Universe Crazy background.");

  context.fillStyle = "#050817";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const nebula of [
    { x: 360, y: 440, radius: 470, color: "rgba(91, 48, 169, 0.45)" },
    { x: 1100, y: 310, radius: 390, color: "rgba(20, 118, 166, 0.35)" },
    { x: 900, y: 760, radius: 430, color: "rgba(122, 47, 105, 0.28)" }
  ]) {
    const glow = context.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
    glow.addColorStop(0, nebula.color);
    glow.addColorStop(1, "rgba(5, 8, 23, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (let i = 0; i < 1100; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.7 + 0.25;
    context.fillStyle = `rgba(222, 233, 255, ${0.22 + Math.random() * 0.7})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 140),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, fog: false })
  );
  wall.position.set(0, -18, -52);
  scene.add(wall);

  titlePlanets = new THREE.Group();
  for (const config of [
    { x: -19, y: 7, z: -17, radius: 3.1, color: "#754caa", glow: "#c5a1ff", phase: 0 },
    { x: 19, y: -2.5, z: -21, radius: 2.45, color: "#287d9c", glow: "#78eaff", phase: 2.4 },
    { x: -25, y: -3.5, z: -28, radius: 1.55, color: "#8a4c65", glow: "#ff9b9f", phase: 1.1 },
    { x: 25, y: 10, z: -34, radius: 1.8, color: "#426b55", glow: "#9affc1", phase: 3.5 },
    { x: -11, y: 12.5, z: -41, radius: 1.05, color: "#a17c43", glow: "#ffe097", phase: 5.2 },
    { x: 12, y: -8.5, z: -38, radius: 1.25, color: "#515e9b", glow: "#a5baff", phase: 4.3 }
  ]) {
    const planet = new THREE.Group();
    planet.position.set(config.x, config.y, config.z);
    planet.userData.basePosition = planet.position.clone();
    planet.userData.phase = config.phase;
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius, 28, 20),
      material(config.color, 0.76, 0.08, { emissive: config.glow, emissiveIntensity: 0.35 })
    );
    surface.userData.spin = config.radius > 3 ? 0.16 : -0.2;
    planet.add(surface);
    planet.add(new THREE.Mesh(
      new THREE.SphereGeometry(config.radius * 1.08, 24, 18),
      new THREE.MeshBasicMaterial({ color: config.glow, transparent: true, opacity: 0.12, side: THREE.BackSide })
    ));
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(config.radius * 1.35, 0.075, 8, 64),
      material(config.glow, 0.3, 0.28, { emissive: config.glow, emissiveIntensity: 0.9 })
    );
    ring.rotation.set(1.12, 0.2, -0.16);
    ring.userData.spin = config.radius > 2 ? 0.07 : -0.1;
    planet.add(ring);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius * 0.16, 12, 10),
      material(config.glow, 0.42, 0.14, { emissive: config.glow, emissiveIntensity: 0.2 })
    );
    moon.position.set(config.radius * 1.65, config.radius * 0.4, 0);
    moon.userData.orbitSpeed = config.phase ? -0.3 : 0.24;
    planet.add(moon);
    titlePlanets.add(planet);
  }
  scene.add(titlePlanets);
  createSpaceBattle();
}

function createSpaceBattle() {
  spaceBattle = new THREE.Group();
  scene.add(spaceBattle);
  const shipConfigs = [
    { x: -25, y: 8, z: -35, direction: 1, speed: 1.9, color: "#77eaff", phase: 0.2 },
    { x: -9, y: 12, z: -44, direction: 1, speed: 1.3, color: "#8effd0", phase: 2.4 },
    { x: 25, y: 4, z: -38, direction: -1, speed: 1.7, color: "#ff81bc", phase: 1.1 },
    { x: 10, y: 10, z: -47, direction: -1, speed: 1.45, color: "#ffb56e", phase: 4.1 }
  ];
  shipConfigs.forEach((config) => {
    const ship = new THREE.Group();
    const hullMaterial = new THREE.MeshBasicMaterial({ color: config.color });
    const wingMaterial = new THREE.MeshBasicMaterial({ color: "#7184b8" });
    const engineMaterial = new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.8 });
    const hull = addMesh(ship, new THREE.CylinderGeometry(0.07, 0.25, 1.35, 6), hullMaterial, [0, 0, 0]);
    hull.rotation.z = -Math.PI / 2;
    const wings = addMesh(ship, new THREE.BoxGeometry(0.76, 0.07, 0.62), wingMaterial, [-0.12, 0, 0]);
    wings.rotation.y = 0.16;
    addMesh(ship, new THREE.SphereGeometry(0.12, 8, 6), engineMaterial, [-0.76, 0, 0]);
    ship.position.set(config.x, config.y, config.z);
    ship.rotation.y = config.direction > 0 ? 0 : Math.PI;
    spaceBattle.add(ship);
    backgroundShips.push({ ...config, group: ship });
  });

  for (let index = 0; index < 4; index += 1) {
    const color = index % 2 ? "#ff8fc9" : "#7df6ff";
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 });
    const shot = addMesh(spaceBattle, new THREE.SphereGeometry(0.075, 7, 6), material, [0, 0, 0]);
    backgroundShots.push({
      mesh: shot,
      phase: index * 0.25,
      speed: index % 2 ? -7.5 : 6.8,
      lane: index % 2 ? 1 : -1,
      colorIndex: index
    });
  }
}

function animateSpaceBattle(elapsed) {
  const flightRange = 56;
  backgroundShips.forEach((ship) => {
    const wrappedX = ((ship.x + ship.direction * ship.speed * elapsed + flightRange / 2) % flightRange + flightRange) % flightRange - flightRange / 2;
    ship.group.position.x = wrappedX;
    ship.group.position.y = ship.y + Math.sin(elapsed * 0.72 + ship.phase) * 0.36;
    ship.group.position.z = ship.z + Math.sin(elapsed * 0.48 + ship.phase) * 0.28;
    ship.group.rotation.z = Math.sin(elapsed * 0.9 + ship.phase) * 0.035;
    ship.group.children[2].scale.x = 0.75 + Math.sin(elapsed * 9 + ship.phase) * 0.2;
  });
  backgroundShots.forEach((shot) => {
    const distance = ((elapsed * shot.speed + shot.phase * flightRange + flightRange / 2) % flightRange + flightRange) % flightRange - flightRange / 2;
    shot.mesh.position.set(distance, 7 + shot.lane * 2.4 + Math.sin(elapsed * 1.8 + shot.phase) * 0.3, -39 - shot.colorIndex * 1.4);
    shot.mesh.visible = Math.sin(elapsed * 4 + shot.phase * Math.PI * 2) > -0.75;
  });
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

function hasSecretSeal(index) {
  return [5, 13, 18].includes(index % 20);
}

function createSecretSeal(theme) {
  const seal = new THREE.Group();
  seal.position.set(-1.6, 0.08, 0.8);
  const glow = material(theme.glow, 0.22, 0.35, { emissive: theme.glow, emissiveIntensity: 1.7 });
  const base = addMesh(seal, new THREE.CylinderGeometry(0.72, 0.86, 0.18, 8), material(theme.stone, 0.38, 0.45), [0, 0.09, 0]);
  base.rotation.y = Math.PI / 8;
  const ring = addMesh(seal, new THREE.TorusGeometry(0.53, 0.045, 8, 24), glow, [0, 0.29, 0]);
  ring.rotation.x = Math.PI / 2;
  const core = addMesh(seal, new THREE.OctahedronGeometry(0.36, 0), glow, [0, 0.66, 0]);
  core.userData.spin = 1.8;
  seal.userData.core = core;
  arena.add(seal);
  secretSeal = seal;
}

function createBattlefieldBackdrop(theme, random) {
  const backZ = -floorRadius - 9;
  const rock = material(theme.stone, 0.92, 0.04);
  const shadow = new THREE.MeshBasicMaterial({ color: "#080912" });
  const cave = addMesh(arena, new THREE.CircleGeometry(2.45, 24), shadow, [0, 3, backZ - 0.2], [1.32, 1, 1]);
  cave.renderOrder = 1;
  const arch = addMesh(arena, new THREE.TorusGeometry(2.6, 0.48, 8, 16), rock, [0, 3, backZ + 0.05], [1.32, 1, 1]);
  arch.rotation.z = Math.PI / 2;

  for (let i = 0; i < 8; i += 1) {
    const side = i < 4 ? -1 : 1;
    const level = i % 4;
    const size = 1.5 + random() * 1.7;
    const boulder = addMesh(
      arena,
      new THREE.DodecahedronGeometry(size, 0),
      rock,
      [side * (4.6 + level * 2.2 + random()), -0.5 + size * 0.2, backZ - random() * 2],
      [1.1 + random() * 0.6, 0.8 + random() * 0.8, 0.55 + random() * 0.5]
    );
    boulder.rotation.set(random() * 0.5, random() * Math.PI, random() * 0.4);
  }

  const planetColors = [theme.glow, theme.portal, theme.trim, "#a68cff"];
  const planetConfigs = [
    { side: -1.45, height: 10, depth: 11, radius: 4.6 },
    { side: 1.4, height: 10.5, depth: 13, radius: 5.1 },
    { side: 0.25, height: 15, depth: 18, radius: 3.6 },
    { side: -0.55, height: 18, depth: 20, radius: 2.65 }
  ];
  planetConfigs.forEach((config, index) => {
    const phase = random() * Math.PI * 2;
    const group = new THREE.Group();
    group.position.set(config.side * floorRadius, config.height, backZ - config.depth);
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius, 20, 14),
      material(planetColors[index], 0.8, 0.04, { emissive: planetColors[index], emissiveIntensity: 0.34, fog: false })
    );
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius * 1.1, 16, 12),
      new THREE.MeshBasicMaterial({ color: planetColors[index], transparent: true, opacity: 0.12, depthWrite: false, fog: false, side: THREE.BackSide })
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(config.radius * 1.35, 0.09, 6, 32),
      new THREE.MeshBasicMaterial({ color: planetColors[(index + 1) % planetColors.length], transparent: true, opacity: 0.82, fog: false })
    );
    ring.rotation.set(1.05 + random() * 0.2, 0.12, -0.16);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius * 0.17, 10, 8),
      new THREE.MeshBasicMaterial({ color: planetColors[(index + 2) % planetColors.length], fog: false })
    );
    moon.position.set(config.radius * 1.8, 0.15, 0);
    group.add(surface, atmosphere, ring, moon);
    arena.add(group);
    arenaPlanets.push({
      group,
      surface,
      ring,
      moon,
      x: group.position.x,
      y: group.position.y,
      phase,
      spin: index % 2 ? -0.16 : 0.13,
      orbitAngle: phase,
      orbitRadius: config.radius * 1.7,
      orbitSpeed: index % 2 ? -0.38 : 0.3,
      drift: 0.52 + random() * 0.34
    });
  });

  const foliage = material(theme.name === "Verdant Canopy" ? "#4c9a58" : "#54745b", 0.88, 0.02);
  const leafGlow = material(theme.name === "Verdant Canopy" ? "#8bd37a" : "#829f70", 0.82, 0.01);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const x = side * (floorRadius - 0.6 - i * 0.35);
      const z = -4.5 + i * 3.2;
      addMesh(arena, new THREE.CylinderGeometry(0.11, 0.18, 1.25, 6), foliage, [x, 0.62, z]);
      for (let leaf = 0; leaf < 3; leaf += 1) {
        const blade = addMesh(arena, new THREE.ConeGeometry(0.3, 1.15, 5), leafGlow, [x + (random() - 0.5) * 0.55, 1.15 + random() * 0.25, z + (random() - 0.5) * 0.45]);
        blade.rotation.z = (random() - 0.5) * 0.9;
        blade.rotation.x = (random() - 0.5) * 0.7;
      }
    }
  }
}

function createArena(index = arenaIndex) {
  fighterPreview = null;
  secretPowerUp = null;
  disposeObject(arena);
  arena.clear();
  portalRings = [];
  portalDisc = null;
  secretSeal = null;
  arenaPlanets.length = 0;
  hitEffects.length = 0;
  cameraShake = 0;
  arenaSurfaces.length = 0;
  arena.visible = !titleScreenActive;

  const theme = hiddenRealmActive ? secretTheme : arenaThemes[Math.floor(index / 20) % arenaThemes.length];
  const layout = hiddenRealmActive ? 0 : index % 20;
  const random = seededRandom(index + 941);
  scene.background.set(theme.background);
  scene.fog.color.set(theme.fog);
  portalLight.color.set(theme.portal);
  cyanLight.color.set(theme.glow);

  const stone = material(theme.stone, 0.72, 0.18);
  const floor = material(theme.floor, 0.52, 0.24);
  const trim = material(theme.trim, 0.3, 0.46, { emissive: theme.trim, emissiveIntensity: 0.48 });
  const radiusVariants = [10.4, 12.6, 9.2, 10.8, 13.1, 9.6, 11.6, 8.9, 12, 10.1];
  const planetDepthVariants = [0.38, 0.56, 0.25, 0.42, 0.62, 0.28, 0.48, 0.24, 0.58, 0.34];
  floorRadius = radiusVariants[layout % radiusVariants.length] + random() * 0.4;
  const planetDepth = floorRadius * planetDepthVariants[layout % planetDepthVariants.length];
  const planetCore = addMesh(
    arena,
    new THREE.SphereGeometry(1, 36, 22),
    stone,
    [0, -planetDepth, 0],
    [floorRadius + 0.15, planetDepth, floorRadius + 0.15]
  );
  planetCore.rotation.y = random() * Math.PI * 2;
  const platform = addMesh(arena, new THREE.CylinderGeometry(floorRadius + 0.55, floorRadius - 0.35, 0.75, 48), stone, [0, -0.35, 0]);
  platform.receiveShadow = true;
  addMesh(arena, new THREE.CircleGeometry(floorRadius, 48), floor, [0, 0.035, 0]).rotation.x = -Math.PI / 2;
  const planetBand = addMesh(arena, new THREE.TorusGeometry(floorRadius * 0.88, 0.085, 8, 72), trim, [0, -planetDepth * 0.58, 0]);
  planetBand.rotation.x = Math.PI / 2;

  for (const radius of [4, floorRadius * 0.74, floorRadius - 0.1]) {
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

  for (const [directionX, directionZ] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const stepCount = 4 + (layout % 2);
    const stepRun = 1.3;
    for (let step = 0; step < stepCount; step += 1) {
      const top = (step + 1) * 0.22;
      const distance = 1.9 + step * stepRun;
      const x = directionX * distance;
      const z = directionZ * distance;
      const width = directionX === 0 ? 1.45 : 1.15;
      const depth = directionZ === 0 ? 1.45 : 1.15;
      addMesh(arena, new THREE.BoxGeometry(width * 2, top, depth * 2), trim, [x, top / 2, z]);
      addMesh(arena, new THREE.BoxGeometry(width * 1.9, 0.035, depth * 1.9), floor, [x, top + 0.018, z]);
      arenaSurfaces.push({ x, z, top, halfWidth: width, halfDepth: depth, stair: true });
    }
    const landingDistance = 1.9 + stepCount * stepRun;
    const landingTop = stepCount * 0.22;
    const x = directionX * landingDistance;
    const z = directionZ * landingDistance;
    const landingWidth = directionX === 0 ? 2.1 : 1.6;
    const landingDepth = directionZ === 0 ? 1.6 : 2.1;
    addMesh(arena, new THREE.BoxGeometry(landingWidth * 2, 0.3, landingDepth * 2), trim, [x, landingTop - 0.15, z]);
    addMesh(arena, new THREE.BoxGeometry(landingWidth * 1.9, 0.04, landingDepth * 1.9), floor, [x, landingTop + 0.02, z]);
    arenaSurfaces.push({ x, z, top: landingTop + 0.04, halfWidth: landingWidth, halfDepth: landingDepth });
  }

  const platformCount = 2 + (layout % 5);
  for (let index = 0; index < platformCount; index += 1) {
    const angle = ((index + 0.5) / platformCount) * Math.PI * 2 + (random() - 0.5) * 0.3;
    const distance = floorRadius * (0.43 + random() * 0.1);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const width = 1.2 + random() * 0.8;
    const depth = 1.2 + random() * 0.8;
    const top = 0.8 + random() * 1.2;
    addMesh(arena, new THREE.CylinderGeometry(0.16, 0.24, top, 6), stone, [x, top / 2, z]);
    addMesh(arena, new THREE.CylinderGeometry(1, 0.92, 0.28, 8), trim, [x, top - 0.14, z], [width, 1, depth]);
    addMesh(arena, new THREE.CylinderGeometry(0.93, 0.9, 0.05, 8), floor, [x, top - 0.025, z], [width, 1, depth]);
    const platformRing = addMesh(arena, new THREE.TorusGeometry(width * 0.72, 0.035, 6, 24), rune, [x, top + 0.01, z]);
    platformRing.rotation.x = Math.PI / 2;
    arenaSurfaces.push({ x, z, top, halfWidth: width * 0.9, halfDepth: depth * 0.9 });
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

  createBattlefieldBackdrop(theme, random);
  if (!titleScreenActive && (!hiddenRealmActive || secretPortalOpen)) createPortal();
  if (hiddenRealmActive) {
    const obelisk = addMesh(arena, new THREE.OctahedronGeometry(2.2, 1), material(secretTheme.trim, 0.2, 0.5, { emissive: secretTheme.glow, emissiveIntensity: 1.2 }), [0, 2.2, -4]);
    obelisk.scale.set(0.8, 1.6, 0.5);
    obelisk.rotation.y = Math.PI / 4;
    createSecretPowerUp();
  } else if (hasSecretSeal(index)) {
    createSecretSeal(theme);
  }
  if (!titleScreenActive && !matchActive && fighters.length === 0) updateFighterPreview(selectedFighter);
}

function createLimb(parent, palette, x, y, z, length, radius, rotationZ = 0) {
  const pivot = new THREE.Group();
  const jointOffset = length / 2 + radius;
  pivot.position.set(x, y + jointOffset, z);
  pivot.rotation.z = rotationZ;
  pivot.userData.restRotationZ = rotationZ;
  pivot.userData.side = Math.sign(x) || 1;
  pivot.userData.limbType = y > 0.78 ? "arm" : "leg";
  addMesh(
    pivot,
    new THREE.CapsuleGeometry(radius * 0.78, length, 4, 8),
    material(palette.primary, 0.36, 0.2),
    [0, -jointOffset, 0]
  );
  const jointMaterial = material(palette.trim, 0.32, 0.22, { emissive: palette.accent, emissiveIntensity: 0.12 });
  addMesh(pivot, new THREE.SphereGeometry(radius * 0.92, 10, 8), jointMaterial, [0, 0, 0]);
  addMesh(
    pivot,
    new THREE.SphereGeometry(radius * 0.92, 10, 8),
    jointMaterial,
    [0, -length - radius * 2, 0]
  );
  parent.add(pivot);
  return pivot;
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
  const blinkingEyes = [];
  const addBlinkingEye = (geometry, eyeMaterial, position, scale = null) => {
    const eye = addMesh(body, geometry, eyeMaterial, position, scale);
    blinkingEyes.push({ eye, height: eye.scale.y });
    return eye;
  };

  if (kind === "bumble") {
    addMesh(body, new THREE.CapsuleGeometry(0.42, 0.63, 5, 12), mainMat, [0, 1.05, 0]);
    addMesh(body, new THREE.SphereGeometry(0.45, 18, 14), mainMat, [0, 1.93, 0.02], [1, 0.95, 0.95]);
    addMesh(body, new THREE.SphereGeometry(0.32, 16, 12), material("#fff1c8", 0.3), [0, 1.97, 0.36], [1, 0.67, 0.26]);
    for (const x of [-0.13, 0.13]) {
      addBlinkingEye(new THREE.SphereGeometry(0.055, 9, 8), darkMat, [x, 2.03, 0.44]);
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
      addBlinkingEye(new THREE.SphereGeometry(0.065, 10, 8), trimMat, [x, 1.86, 0.36]);
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
  } else if (kind === "frog") {
    addMesh(body, new THREE.CapsuleGeometry(0.48, 0.5, 5, 12), mainMat, [0, 0.92, 0], [1.12, 0.9, 1]);
    addMesh(body, new THREE.SphereGeometry(0.53, 18, 14), mainMat, [0, 1.72, 0.04], [1.16, 0.86, 0.92]);
    addMesh(body, new THREE.SphereGeometry(0.34, 16, 12), trimMat, [0, 0.96, 0.36], [1.05, 0.84, 0.25]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.CylinderGeometry(0.07, 0.09, 0.36, 9), mainMat, [side * 0.3, 2.13, 0.02], [1, 1, 1]).rotation.z = side * -0.18;
      addMesh(body, new THREE.SphereGeometry(0.19, 14, 12), trimMat, [side * 0.32, 2.34, 0.12], [1, 1.08, 0.92]);
      addBlinkingEye(new THREE.SphereGeometry(0.105, 12, 10), darkMat, [side * 0.32, 2.34, 0.29]);
      animatedLimbs.push(createLimb(body, palette, side * 0.58, 1.08, 0, 0.35, 0.15, side * -0.18));
      animatedLimbs.push(createLimb(body, palette, side * 0.29, 0.43, 0, 0.33, 0.19, side * 0.06));
      addMesh(body, new THREE.SphereGeometry(0.25, 12, 9), trimMat, [side * 0.34, 0.12, 0.14], [1.35, 0.55, 1.35]);
      addMesh(body, new THREE.SphereGeometry(0.055, 8, 8), trimMat, [side * 0.39, 1.28, 0.38]);
    }
    addMesh(body, new THREE.BoxGeometry(0.34, 0.035, 0.025), darkMat, [0, 1.55, 0.48]);
  } else if (kind === "dinosaur") {
    addMesh(body, new THREE.CapsuleGeometry(0.58, 0.72, 5, 12), mainMat, [0, 1.05, 0], [1.18, 1.05, 1.15]);
    addMesh(body, new THREE.SphereGeometry(0.49, 16, 13), mainMat, [0, 1.9, 0.14], [1, 0.91, 1.02]);
    addMesh(body, new THREE.SphereGeometry(0.37, 14, 10), trimMat, [0, 1.62, 0.51], [1.15, 0.55, 0.86]);
    addMesh(body, new THREE.BoxGeometry(0.34, 0.06, 0.16), darkMat, [0, 1.52, 0.81]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.SphereGeometry(0.09, 10, 8), trimMat, [side * 0.23, 1.99, 0.48]);
      addBlinkingEye(new THREE.SphereGeometry(0.04, 8, 8), darkMat, [side * 0.23, 1.99, 0.53]);
      animatedLimbs.push(createLimb(body, palette, side * 0.61, 1.17, 0.02, 0.42, 0.18, side * -0.18));
      animatedLimbs.push(createLimb(body, palette, side * 0.29, 0.43, 0.02, 0.4, 0.2, side * 0.04));
      addMesh(body, new THREE.SphereGeometry(0.24, 12, 9), darkMat, [side * 0.31, 0.13, 0.18], [1.4, 0.58, 1.45]);
    }
    const tail = addMesh(body, new THREE.ConeGeometry(0.34, 1.12, 8), mainMat, [0, 1, -0.95]);
    tail.rotation.x = -Math.PI / 2;
    for (const z of [-0.48, -0.08, 0.32]) {
      const spike = addMesh(body, new THREE.ConeGeometry(0.17, 0.4, 5), trimMat, [0, 1.92, z]);
      spike.rotation.z = Math.PI;
    }
  } else if (kind === "entity") {
    addMesh(body, new THREE.CapsuleGeometry(0.23, 1.1, 5, 10), mainMat, [0, 1.52, 0], [1, 1.05, 0.82]);
    addMesh(body, new THREE.SphereGeometry(0.34, 16, 12), mainMat, [0, 2.45, 0.02], [0.9, 1.08, 0.82]);
    addMesh(body, new THREE.BoxGeometry(0.34, 0.09, 0.08), darkMat, [0, 2.38, 0.28]);
    for (const side of [-1, 1]) {
      addBlinkingEye(new THREE.SphereGeometry(0.075, 10, 8), trimMat, [side * 0.13, 2.49, 0.28]);
      animatedLimbs.push(createLimb(body, palette, side * 0.32, 1.94, 0, 0.68, 0.095, side * -0.15));
      animatedLimbs.push(createLimb(body, palette, side * 0.55, 1.39, 0.02, 0.72, 0.085, side * 0.12));
      animatedLimbs.push(createLimb(body, palette, side * 0.14, 0.82, 0, 0.66, 0.11, side * 0.08));
      animatedLimbs.push(createLimb(body, palette, side * 0.17, 0.32, 0.03, 0.58, 0.085, side * -0.08));
      addMesh(body, new THREE.BoxGeometry(0.22, 0.12, 0.32), darkMat, [side * 0.18, 0.08, 0.16]);

      for (const y of [0.92, 1.42, 1.91]) {
        const spike = addMesh(body, new THREE.ConeGeometry(0.14, 0.58, 5), trimMat, [side * 0.34, y, -0.01]);
        spike.rotation.z = -side * Math.PI / 2;
      }
    }
    for (const y of [0.95, 1.3, 1.65, 2.02]) {
      const spine = addMesh(body, new THREE.ConeGeometry(0.14, 0.55, 5), trimMat, [0, y, -0.24]);
      spine.rotation.x = -Math.PI / 2;
    }
    addMesh(body, new THREE.OctahedronGeometry(0.21, 0), trimMat, [0, 1.52, 0.29]);
  } else {
    const heavy = characters[kind].build === "heavy";
    const width = heavy ? 0.58 : 0.42;
    addMesh(body, new THREE.CapsuleGeometry(width, heavy ? 0.72 : 0.64, 5, 10), mainMat, [0, 1.08, 0]);
    addMesh(body, new THREE.SphereGeometry(heavy ? 0.48 : 0.39, 16, 12), mainMat, [0, 1.92, 0.02]);
    addMesh(body, new THREE.BoxGeometry(0.5, 0.19, 0.12), darkMat, [0, 1.89, 0.36]);
    for (const side of [-1, 1]) {
      addBlinkingEye(new THREE.SphereGeometry(0.07, 9, 8), trimMat, [side * 0.14, 1.9, 0.43]);
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

  if (kind === "entity") root.scale.setScalar(1.4);
  root.userData.baseScale = root.scale.clone();

  root.traverse((child) => {
    if (child.isMesh) child.castShadow = true;
  });
  root.userData.body = body;
  root.userData.kind = kind;
  root.userData.animatedLimbs = animatedLimbs;
  root.userData.blinkingEyes = blinkingEyes;
  root.userData.blinkOffset = Math.random() * 4.5;
  return root;
}

function animateBlink(visual, elapsed) {
  const phase = (elapsed + visual.userData.blinkOffset) % 4.5;
  const blink = phase < 0.16 ? Math.sin((phase / 0.16) * Math.PI) : 0;
  visual.userData.blinkingEyes.forEach(({ eye, height }) => {
    eye.scale.y = height * (1 - blink * 0.9);
  });
}

function createSpeechBubble(fighter, text) {
  if (fighter.speechBubble) {
    fighter.visual.remove(fighter.speechBubble);
    fighter.speechBubble.material.map.dispose();
    fighter.speechBubble.material.dispose();
    fighter.speechBubble.geometry.dispose();
  }
  const bubbleCanvas = document.createElement("canvas");
  bubbleCanvas.width = 512;
  bubbleCanvas.height = 160;
  const context = bubbleCanvas.getContext("2d");
  if (!context) throw new Error("Could not draw a fighter speech bubble.");
  context.fillStyle = "#f8f6ff";
  context.strokeStyle = characters[fighter.kind].palette.trim;
  context.lineWidth = 7;
  context.beginPath();
  context.roundRect(12, 10, 488, 120, 34);
  context.fill();
  context.stroke();
  context.beginPath();
  context.moveTo(382, 120);
  context.lineTo(410, 155);
  context.lineTo(440, 120);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = "#17152b";
  context.font = "700 36px Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 70, 430);
  const texture = new THREE.CanvasTexture(bubbleCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  bubble.scale.set(2.7, 0.84, 1);
  bubble.position.set(0, 3.1, 0);
  bubble.renderOrder = 10;
  fighter.visual.add(bubble);
  fighter.speechBubble = bubble;
  fighter.speechTimer = 3.4;
}

function updateSpeechBubble(fighter, delta, elapsed) {
  if (!fighter.speechBubble) return;
  fighter.speechTimer = Math.max(0, fighter.speechTimer - delta);
  if (fighter.speechTimer === 0) {
    fighter.visual.remove(fighter.speechBubble);
    fighter.speechBubble.material.map.dispose();
    fighter.speechBubble.material.dispose();
    fighter.speechBubble.geometry.dispose();
    fighter.speechBubble = null;
    return;
  }
  fighter.speechBubble.position.y = 3.1 + Math.sin(elapsed * 3 + fighter.cpuThinkTime) * 0.07;
  fighter.speechBubble.material.opacity = Math.min(1, fighter.speechTimer / 0.35);
}

function updateFighterPreview(kind) {
  if (fighterPreview) {
    disposeObject(fighterPreview);
    arena.remove(fighterPreview);
  }
  fighterPreview = createFighterVisual(kind);
  const compact = window.innerWidth <= 900;
  fighterPreview.scale.multiplyScalar(kind === "entity" ? 1.2 : compact ? 1.48 : 1.55);
  fighterPreview.position.set(compact ? 0 : 8.3, 0.08, 0.3);
  fighterPreview.userData.baseY = fighterPreview.position.y;
  fighterPreview.userData.preview = true;
  arena.add(fighterPreview);
  animateBlink(fighterPreview, clock.elapsedTime);
  const description = document.querySelector(`[data-fighter="${kind}"] .fighter-card-copy small`).textContent;
  document.querySelector("#preview-note").textContent = `${characters[kind].name} · ${description} · Animated 3D preview`;
}

function createSecretPowerUp() {
  const powerUp = new THREE.Group();
  powerUp.position.set(-2.4, 0.08, 0.9);
  const glow = new THREE.MeshBasicMaterial({ color: "#ffe57c" });
  addMesh(powerUp, new THREE.TorusGeometry(0.56, 0.055, 8, 28), glow, [0, 0.72, 0]).rotation.x = Math.PI / 2;
  const orb = addMesh(powerUp, new THREE.IcosahedronGeometry(0.38, 1), new THREE.MeshBasicMaterial({ color: "#fff2a1" }), [0, 1.05, 0]);
  orb.userData.spin = 2.1;
  powerUp.userData.orb = orb;
  arena.add(powerUp);
  secretPowerUp = powerUp;
}

function makeFighter(kind, index) {
  const visual = createFighterVisual(kind);
  if (kind === "dinosaur") visual.scale.setScalar(1.12);
  const powerAura = addMesh(visual, new THREE.TorusGeometry(0.9, 0.045, 8, 24), new THREE.MeshBasicMaterial({ color: "#ffe57c", transparent: true, opacity: 0.9 }), [0, 1.18, 0], [1.35, 1, 1.35]);
  powerAura.rotation.x = Math.PI / 2;
  powerAura.visible = false;
  visual.userData.powerAura = powerAura;
  const [x, z] = [[-3.4, 1.1], [3.4, -0.6], [-3.4, -2.2], [3.4, 2.4]][index % 4];
  visual.position.set(x, 0.08, z);
  arena.add(visual);
  return {
    kind, visual, x, y: 0.08, z,
    vx: 0, vy: 0, vz: 0, facing: x < 0 ? 1 : -1,
    hp: 100, damage: 0, stocks: kind === "entity" ? 4 : 3, grounded: true, cooldown: 0, specialCooldown: 0,
    invulnerable: index === 0 && secretChallengeActive ? 2.5 : 0,
    attackPose: 0, hitFlash: 0, powerBoost: 0, respawn: 0, falling: false, eliminated: false,
    cpuThinkTime: Math.random() * 0.25, speechBubble: null, speechTimer: 0
  };
}

function clearFighters() {
  portalIntroActive = false;
  knockoutFlashTimer = 0;
  knockoutFlash.hidden = true;
  knockoutFlash.classList.remove("play");
  if (fighterPreview) {
    disposeObject(fighterPreview);
    arena.remove(fighterPreview);
    fighterPreview = null;
  }
  for (const fighter of fighters) {
    removeKnockoutBlackHole(fighter);
    disposeObject(fighter.visual);
    arena.remove(fighter.visual);
  }
  fighters.length = 0;
  for (const projectile of projectiles) {
    disposeObject(projectile.mesh);
    arena.remove(projectile.mesh);
  }
  projectiles.length = 0;
  for (const effect of hitEffects) {
    arena.remove(effect);
    disposeObject(effect);
  }
  hitEffects.length = 0;
  cameraShake = 0;
}

function updateHud() {
  if (fighters.length < 2) return;
  const panels = [
    { panel: "#player-one-panel", name: "#player-one-name", damage: "#player-one-damage", hp: "#player-one-hp", stocks: "#player-one-stocks" },
    { panel: "#player-two-panel", name: "#player-two-name", damage: "#player-two-damage", hp: "#player-two-hp", stocks: "#player-two-stocks" },
    { panel: "#player-three-panel", name: "#player-three-name", damage: "#player-three-damage", hp: "#player-three-hp", stocks: "#player-three-stocks" },
    { panel: "#player-four-panel", name: "#player-four-name", damage: "#player-four-damage", hp: "#player-four-hp", stocks: "#player-four-stocks" }
  ];
  panels.forEach((selectors, index) => {
    const fighter = fighters[index];
    document.querySelector(selectors.panel).hidden = !fighter;
    if (!fighter) return;
    const maxStocks = fighter.kind === "entity" ? 4 : 3;
    document.querySelector(selectors.name).textContent = characters[fighter.kind].name;
    document.querySelector(selectors.damage).textContent = `${Math.floor(fighter.damage)}%`;
    const hpMeter = document.querySelector(selectors.hp);
    const hpFill = hpMeter.querySelector("span");
    const hp = Math.ceil(fighter.hp);
    hpFill.style.width = `${hp}%`;
    hpFill.style.backgroundColor = hp > 55 ? "#72e0a2" : hp > 25 ? "#ffd166" : "#ff7189";
    hpMeter.setAttribute("aria-valuenow", String(hp));
    hpMeter.setAttribute("aria-label", `${characters[fighter.kind].name} health`);
    document.querySelector(selectors.stocks).textContent = `${"● ".repeat(fighter.stocks)}${"○ ".repeat(maxStocks - fighter.stocks)}`.trim();
    document.querySelector(selectors.stocks).setAttribute("aria-label", `${fighter.stocks} stocks remaining`);
  });
  hudDirty = false;
}

function updateArenaLabel() {
  const theme = hiddenRealmActive ? secretTheme : arenaThemes[Math.floor(arenaIndex / 20) % arenaThemes.length];
  document.querySelector("#arena-name").textContent = hiddenRealmActive ? theme.name : `${theme.name} · Layout ${(arenaIndex % 10) + 1}`;
  document.querySelector("#arena-count").textContent = hiddenRealmActive ? "HIDDEN REALM" : `${arenaIndex + 1} / ${arenaCount}`;
  document.querySelector("#battle-arena-name").textContent = theme.name.toUpperCase();
}

function updateControlsHint() {
  const controls = battleMode === "cpu"
    ? "Solo vs. 3 CPUs: WASD move · Space jump · J fight · K special"
    : "Local 4-player (half speed): P1 WASD/J/K · P2 Arrows/Enter/Shift · P3 TFGH/Y/U · P4 Numpad 4,5,6,8 / 1,2,0";
  document.querySelector("#controls-hint").textContent = controls;
  document.querySelector("#match-control-hint").textContent = controls;
}

function clearInputState() {
  keys.clear();
  justPressed.clear();
  resetJoystick();
}

function resetJoystick() {
  joystickPointerId = null;
  virtualKeys.clear();
  const knob = document.querySelector("#joystick-knob");
  if (knob) knob.style.transform = "";
}

function changeArena(offset) {
  arenaIndex = (arenaIndex + offset + arenaCount) % arenaCount;
  createArena(arenaIndex);
  updateArenaLabel();
}

function startMatch(opponentOverride = null, randomizeArena = false) {
  selectionScreenActive = false;
  titlePlanets.visible = false;
  if (randomizeArena && !hiddenRealmActive) {
    arenaIndex = Math.floor(Math.random() * arenaCount);
    createArena(arenaIndex);
    updateArenaLabel();
  }
  clearInputState();
  clearFighters();
  const opponentPool = regularCharacterIds.filter((kind) => kind !== selectedFighter);
  const fighterCount = secretChallengeActive ? 2 : 4;
  fighters.push(makeFighter(selectedFighter, 0));
  for (let index = 1; index < fighterCount; index += 1) {
    const kind = index === 1 && opponentOverride
      ? opponentOverride
      : opponentPool[(index - 1) % opponentPool.length];
    fighters.push(makeFighter(kind, index));
  }
  const openingLines = {
    bumble: "Let's buzz!",
    robot: "Systems online!",
    nova: "Catch me!",
    titan: "Stand your ground!",
    glitch: "Victory.exe!",
    tide: "Ride the wave!",
    frog: "Ready to hop!",
    dinosaur: "Raaawr!"
  };
  fighters.forEach((fighter) => createSpeechBubble(fighter, openingLines[fighter.kind]));
  const portalEntryDuration = 1.05;
  fighters.forEach((fighter) => {
    fighter.portalEntry = portalEntryDuration;
    fighter.portalEntryDuration = portalEntryDuration;
    fighter.portalEntryTarget = { x: fighter.x, z: fighter.z };
    fighter.x = 0;
    fighter.y = 2.85;
    fighter.z = -5.15;
    fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
    fighter.visual.rotation.set(0, 0, 0);
    fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(0.18);
  });
  portalIntroActive = true;
  matchTime = 180;
  displayedSecond = -1;
  matchActive = true;
  matchEnded = false;
  hudDirty = true;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#return-through-portal").hidden = true;
  document.querySelector("#battle-hud").hidden = false;
  document.querySelector("#touch-controls").hidden = false;
  for (let index = 1; index < 4; index += 1) {
    document.querySelector(`#player-${["one", "two", "three", "four"][index]}-label`).textContent =
      battleMode === "cpu" ? `CPU ${index}` : `PLAYER ${index + 1}`;
  }
  document.querySelector("#battle-status").textContent = "PORTAL ARRIVAL!";
  updateControlsHint();
  updateHud();
  document.querySelector("#screen-reader-status").textContent =
    `The portal opens. ${fighters.map((fighter) => `${characters[fighter.kind].name} enters the arena`).join(". ")}.`;
  renderer.domElement.focus();
}

function beginSecretChallenge() {
  secretPortalPending = false;
  savedArenaIndex = arenaIndex;
  savedBattleMode = battleMode;
  hiddenRealmActive = true;
  secretChallengeActive = true;
  secretPortalOpen = false;
  arenaIndex = arenaCount;
  battleMode = "cpu";
  createArena(arenaIndex);
  updateArenaLabel();
  startMatch("entity");
  document.querySelector("#battle-status").textContent = "ENTITY.EXE — FIND THE POWER-UP!";
  document.querySelector("#screen-reader-status").textContent = "The Entity.exe final boss challenge begins in the hidden realm. Find the glowing power-up.";
}

function restoreFromSecretRealm() {
  if (!hiddenRealmActive) return;
  hiddenRealmActive = false;
  secretChallengeActive = false;
  secretPortalOpen = false;
  secretPortalPending = false;
  arenaIndex = savedArenaIndex;
  battleMode = savedBattleMode;
  createArena(arenaIndex);
  updateArenaLabel();
}

function showSelection() {
  const enteringFromTitle = titleScreenActive;
  titleScreenActive = false;
  selectionScreenActive = true;
  titlePlanets.visible = true;
  clearInputState();
  restoreFromSecretRealm();
  if (enteringFromTitle) createArena(arenaIndex);
  matchActive = false;
  document.querySelector("#battle-hud").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = false;
  clearFighters();
  updateFighterPreview(selectedFighter);
}

function showPortal() {
  titleScreenActive = true;
  selectionScreenActive = false;
  titlePlanets.visible = true;
  clearInputState();
  restoreFromSecretRealm();
  arena.visible = false;
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
  portalIntroActive = false;
  matchEnded = true;
  matchActive = false;
  document.querySelector("#battle-status").textContent = "FINAL";
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#match-end-status").textContent = "MATCH COMPLETE";
  document.querySelector("#return-through-portal").hidden = true;
  const winner = winnerIndex === null ? null : fighters[winnerIndex];
  let unlockMessage = "";
  if (secretChallengeActive && winner === fighters[0]) {
    secretPortalOpen = true;
    createPortal();
    document.querySelector("#match-end-status").textContent = "ENTITY.EXE DEFEATED — PORTAL OPEN";
    document.querySelector("#return-through-portal").hidden = false;
    if (!entityUnlocked) {
      entityUnlocked = true;
      const saved = saveEntityUnlock();
      document.querySelector('[data-fighter="entity"]').hidden = false;
      document.querySelector("#fighter-count").textContent = "09 FIGHTERS";
      unlockMessage = saved
        ? " Entity.exe skin unlocked!"
        : " Entity.exe skin unlocked for this visit; embedded storage is blocked, so it will not persist after reload.";
    }
  }
  document.querySelector("#winner-title").textContent = winner ? `${characters[winner.kind].name.toUpperCase()} WINS` : "TIME!";
  document.querySelector("#winner-message").textContent = winner
    ? `${characters[winner.kind].name} takes the arena. ${reason}${unlockMessage}`
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
  projectiles.push({
    mesh: projectile,
    owner: fighter,
    vx: fighter.facing * 13,
    life: 1.5,
    damage: 9,
    power: characters[fighter.kind].power * (fighter.powerBoost > 0 ? 1.7 : 1)
  });
}

function spawnImpact(target, heavy) {
  const effect = new THREE.Group();
  effect.position.set(target.x, target.y + 1.25, target.z);
  const color = heavy ? "#ffcf74" : "#8df8ff";
  const ring = addMesh(effect, new THREE.TorusGeometry(0.28, 0.045, 6, 18), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }), [0, 0, 0]);
  ring.userData.impactRing = true;
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const spark = addMesh(effect, new THREE.OctahedronGeometry(0.075, 0), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }), [0, 0, 0]);
    spark.userData.velocity = new THREE.Vector3(Math.cos(angle) * 3, 1.5 + (i % 3) * 0.6, Math.sin(angle) * 2.2);
  }
  arena.add(effect);
  effect.userData.remaining = 0.3;
  hitEffects.push(effect);
  cameraShake = Math.max(cameraShake, heavy ? 0.32 : 0.19);
}

function createKnockoutBlackHole(fighter) {
  const effect = new THREE.Group();
  const fighterRadius = Math.hypot(fighter.x, fighter.z);
  const edgeAnchorRadius = Math.min(Math.max(0, fighterRadius - 1.15), floorRadius - 1.1);
  const centerX = fighterRadius > 1.15
    ? (fighter.x / fighterRadius) * edgeAnchorRadius
    : fighter.x - fighter.facing * 1.15;
  const centerZ = fighterRadius > 1.15
    ? (fighter.z / fighterRadius) * edgeAnchorRadius
    : fighter.z;
  fighter.blackHoleAnchor = { x: centerX, z: centerZ };
  fighter.blackHoleStartRadius = Math.hypot(fighter.x - centerX, fighter.z - centerZ);
  fighter.blackHoleStartAngle = Math.atan2(fighter.z - centerZ, fighter.x - centerX);
  const core = addMesh(
    effect,
    new THREE.SphereGeometry(0.58, 14, 10),
    new THREE.MeshBasicMaterial({ color: "#02030a" }),
    [0, 0, 0],
    [1, 0.25, 1]
  );
  const outerRing = addMesh(
    effect,
    new THREE.TorusGeometry(0.82, 0.12, 8, 36),
    new THREE.MeshBasicMaterial({ color: "#ff9d67", transparent: true, opacity: 0.9 }),
    [0, 0.04, 0]
  );
  outerRing.rotation.x = Math.PI / 2;
  const innerRing = addMesh(
    effect,
    new THREE.TorusGeometry(0.58, 0.055, 8, 32),
    new THREE.MeshBasicMaterial({ color: "#a48aff", transparent: true, opacity: 0.95 }),
    [0, 0.06, 0]
  );
  innerRing.rotation.x = Math.PI / 2;
  const particleMaterial = new THREE.MeshBasicMaterial({ color: "#8df8ff" });
  const particles = [];
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2;
    const particle = addMesh(effect, new THREE.OctahedronGeometry(0.075, 0), particleMaterial, [Math.cos(angle) * 1.05, 0.08, Math.sin(angle) * 1.05]);
    particles.push({ mesh: particle, angle, speed: index % 2 ? -4.5 : 5.2 });
  }
  effect.position.set(centerX, 0.12, centerZ);
  effect.userData.core = core;
  effect.userData.outerRing = outerRing;
  effect.userData.innerRing = innerRing;
  effect.userData.particles = particles;
  effect.userData.centerX = centerX;
  effect.userData.centerZ = centerZ;
  arena.add(effect);
  return effect;
}

function updateKnockoutBlackHole(fighter, delta, progress) {
  const effect = fighter.knockoutEffect;
  if (!effect) return;
  effect.position.set(effect.userData.centerX, 0.12, effect.userData.centerZ);
  effect.scale.setScalar(0.75 + progress * 0.75);
  effect.userData.outerRing.rotation.z -= delta * 3.2;
  effect.userData.innerRing.rotation.z += delta * 5.1;
  effect.userData.particles.forEach((particle) => {
    particle.angle += delta * particle.speed;
    particle.mesh.position.set(Math.cos(particle.angle) * 1.05, 0.08 + Math.sin(particle.angle * 2) * 0.08, Math.sin(particle.angle) * 1.05);
  });
  effect.userData.core.scale.y = 0.25 + progress * 0.15;
}

function removeKnockoutBlackHole(fighter) {
  if (!fighter.knockoutEffect) return;
  arena.remove(fighter.knockoutEffect);
  disposeObject(fighter.knockoutEffect);
  fighter.knockoutEffect = null;
}

function showKnockoutFlash(fighter) {
  if (fighter !== fighters[0]) return;
  knockoutName.textContent = characters[fighter.kind].name;
  knockoutFlash.hidden = false;
  knockoutFlash.classList.remove("play");
  void knockoutFlash.offsetWidth;
  knockoutFlash.classList.add("play");
  knockoutFlashTimer = 1.2;
  document.querySelector("#screen-reader-status").textContent = `K.O.! ${characters[fighter.kind].name} is falling into a black hole.`;
}

function hitTarget(attacker, target, damage, force) {
  if (target.eliminated || target.respawn > 0 || target.invulnerable > 0) return;
  target.damage += damage;
  target.hp = Math.max(0, target.hp - damage);
  const direction = target.x >= attacker.x ? 1 : -1;
  const knockback = force * characters[attacker.kind].power + target.damage * 0.045;
  target.vx += direction * knockback;
  const edgeDistance = floorRadius - Math.hypot(target.x, target.z);
  if (edgeDistance < 3.2) {
    const edgePush = knockback * (1 - Math.max(0, edgeDistance) / 3.2) * 0.9;
    const radialLength = Math.hypot(target.x, target.z) || 1;
    target.vx += (target.x / radialLength) * edgePush;
    target.vz += (target.z / radialLength) * edgePush;
  }
  target.vy = Math.max(target.vy, 2.8 + target.damage * 0.022);
  target.vz += Math.sign(target.z - attacker.z || 1) * 1.3;
  target.grounded = false;
  target.hitFlash = 0.24;
  spawnImpact(target, damage >= 10);
  hudDirty = true;
  document.querySelector("#battle-status").textContent = `${characters[attacker.kind].name} landed a hit!`;
  if (target.hp <= 0) beginKnockout(target, "was knocked out at 0 HP!");
}

function beginKnockout(fighter, reason) {
  if (fighter.eliminated || fighter.respawn > 0) return;
  fighter.falling = true;
  fighter.respawn = 1.35;
  fighter.knockoutElapsed = 0;
  fighter.knockoutEffect = createKnockoutBlackHole(fighter);
  fighter.vy = Math.min(fighter.vy, -1.6);
  showKnockoutFlash(fighter);
  document.querySelector("#battle-status").textContent = `${characters[fighter.kind].name} ${reason}`;
}

function tryActivateSecretSeal(fighter) {
  if (!secretSeal || fighter !== fighters[0] || hiddenRealmActive || secretPortalPending) return;
  const dx = secretSeal.position.x - fighter.x;
  const dz = secretSeal.position.z - fighter.z;
  if (Math.hypot(dx, dz) > 2.45 || dx * fighter.facing < -0.5) return;
  secretSeal.visible = false;
  secretPortalPending = true;
  document.querySelector("#battle-status").textContent = "The seal breaks open. A hidden portal appears!";
  document.querySelector("#screen-reader-status").textContent = "The seal breaks open. A hidden portal appears!";
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

  if (!target) {
    const reach = special ? 2.6 : 2.15;
    target = fighters
      .filter((opponent) => opponent !== fighter && !opponent.eliminated && opponent.respawn <= 0)
      .filter((opponent) => {
        const dx = opponent.x - fighter.x;
        const dz = opponent.z - fighter.z;
        return Math.hypot(dx, dz) < reach && Math.abs(dz) < 1.75 && dx * fighter.facing > -0.65;
      })
      .sort((a, b) => (a.x - fighter.x) ** 2 + (a.z - fighter.z) ** 2 - (b.x - fighter.x) ** 2 - (b.z - fighter.z) ** 2)[0]
      || nearestOpponent(fighter);
  }
  if (!target) return;
  const dx = target.x - fighter.x;
  const dz = target.z - fighter.z;
  const inReach = Math.hypot(dx, dz) < (special ? 2.6 : 2.15);
  const inFront = dx * fighter.facing > -0.65;
  if (inReach && Math.abs(dz) < 1.75 && inFront) {
    const boost = fighter.powerBoost > 0 ? 1.7 : 1;
    hitTarget(fighter, target, (special ? 12 : 7) * characters[fighter.kind].power * boost, special ? 5.8 : 3.8);
  }
  if (!special) tryActivateSecretSeal(fighter);
}

function nearestOpponent(fighter) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const opponent of fighters) {
    if (opponent === fighter || opponent.eliminated || opponent.respawn > 0) continue;
    const distance = (opponent.x - fighter.x) ** 2 + (opponent.y - fighter.y) ** 2 + (opponent.z - fighter.z) ** 2;
    if (distance < nearestDistance) {
      nearest = opponent;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function respawn(fighter, index) {
  removeKnockoutBlackHole(fighter);
  fighter.visual.scale.copy(fighter.visual.userData.baseScale);
  fighter.stocks -= 1;
  if (fighter.stocks <= 0) {
    fighter.stocks = 0;
    fighter.eliminated = true;
    fighter.falling = false;
    fighter.visual.visible = false;
    const remaining = fighters.map((item, fighterIndex) => ({ item, fighterIndex })).filter(({ item }) => !item.eliminated);
    hudDirty = true;
    if (remaining.length === 1) {
      finishMatch(remaining[0].fighterIndex, "Last fighter standing.");
    } else {
      document.querySelector("#battle-status").textContent = `${characters[fighter.kind].name} is out!`;
    }
    updateHud();
    return;
  }
  [fighter.x, fighter.z] = [[-3.4, 1.1], [3.4, -0.6], [-3.4, -2.2], [3.4, 2.4]][index % 4];
  fighter.y = 0.08;
  fighter.z = index === 0 ? 1.1 : -0.6;
  fighter.vx = 0;
  fighter.vy = 0;
  fighter.vz = 0;
  fighter.damage = 0;
  fighter.hp = 100;
  fighter.invulnerable = 1.6;
  fighter.respawn = 0;
  fighter.falling = false;
  fighter.visual.rotation.set(0, 0, 0);
  fighter.visual.visible = true;
  fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
  hudDirty = true;
  document.querySelector("#battle-status").textContent = `${characters[fighter.kind].name} returns!`;
}

function readInput(fighter, index, delta) {
  const isCpu = index > 0 && battleMode === "cpu";
  const pressed = (...codes) => codes.some((code) => keys.has(code) || virtualKeys.has(code));
  const tapped = (...codes) => codes.some((code) => justPressed.has(code));
  const playerControls = [
    { horizontal: ["KeyA", "KeyD"], depth: ["KeyW", "KeyS"], jump: "Space", strike: "KeyJ", special: "KeyK" },
    { horizontal: ["ArrowLeft", "ArrowRight"], depth: ["ArrowUp", "ArrowDown"], jump: "ArrowUp", strike: "Enter", special: "ShiftRight" },
    { horizontal: ["KeyF", "KeyH"], depth: ["KeyT", "KeyG"], jump: "KeyR", strike: "KeyY", special: "KeyU" },
    { horizontal: ["Numpad4", "Numpad6"], depth: ["Numpad8", "Numpad5"], jump: "Numpad0", strike: "Numpad1", special: "Numpad2" }
  ][index];
  let horizontal = 0;
  let depth = 0;
  let jump = false;
  let strike = false;
  let special = false;

  if (!isCpu) {
    const arrowAliases = index === 0 && battleMode === "cpu";
    const left = [playerControls.horizontal[0], ...(arrowAliases ? ["ArrowLeft"] : [])];
    const right = [playerControls.horizontal[1], ...(arrowAliases ? ["ArrowRight"] : [])];
    const back = [playerControls.depth[0], ...(arrowAliases ? ["ArrowUp"] : [])];
    const forward = [playerControls.depth[1], ...(arrowAliases ? ["ArrowDown"] : [])];
    const jumpKeys = [playerControls.jump, ...(arrowAliases ? ["ArrowUp"] : [])];
    horizontal = Number(pressed(...right)) - Number(pressed(...left));
    depth = Number(pressed(...forward)) - Number(pressed(...back));
    jump = pressed(...jumpKeys) && tapped(...jumpKeys);
    strike = tapped(playerControls.strike, ...(arrowAliases ? ["Enter"] : []));
    special = tapped(playerControls.special, ...(arrowAliases ? ["ShiftRight"] : []));
  } else {
    const target = nearestOpponent(fighter);
    if (!target) return;
    const dx = target.x - fighter.x;
    const dz = target.z - fighter.z;
    horizontal = Math.abs(dx) > 1.7 ? Math.sign(dx) : 0;
    depth = Math.abs(dz) > 1.1 ? Math.sign(dz) : 0;
    fighter.cpuThinkTime -= delta;
    if (fighter.cpuThinkTime <= 0) {
      fighter.cpuThinkTime = 0.25 + Math.random() * 0.35;
      strike = Math.hypot(dx, dz) < 2.2;
      special = Math.hypot(dx, dz) < 4 && Math.random() < 0.22;
      jump = fighter.grounded && Math.random() < 0.12;
    }
  }

  const speed = characters[fighter.kind].speed * (battleMode === "local" ? 0.5 : 1);
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
  if (strike) attack(fighter);
  if (special) attack(fighter, null, true);
}

function updateFighter(fighter, index, delta, elapsed) {
  if (fighter.eliminated) return;
  updateSpeechBubble(fighter, delta, elapsed);
  fighter.cooldown = Math.max(0, fighter.cooldown - delta);
  fighter.specialCooldown = Math.max(0, fighter.specialCooldown - delta);
  fighter.invulnerable = Math.max(0, fighter.invulnerable - delta);
  fighter.attackPose = Math.max(0, fighter.attackPose - delta);
  fighter.hitFlash = Math.max(0, fighter.hitFlash - delta);
  fighter.powerBoost = Math.max(0, fighter.powerBoost - delta);
  if (fighter.respawn > 0) {
    fighter.respawn -= delta;
    if (fighter.falling) {
      fighter.knockoutElapsed += delta;
      const progress = THREE.MathUtils.clamp(fighter.knockoutElapsed / 1.35, 0, 1);
      const orbitAngle = fighter.blackHoleStartAngle + progress * Math.PI * 4;
      const orbitRadius = fighter.blackHoleStartRadius * (1 - progress);
      fighter.x = fighter.blackHoleAnchor.x + Math.cos(orbitAngle) * orbitRadius;
      fighter.z = fighter.blackHoleAnchor.z + Math.sin(orbitAngle) * orbitRadius;
      fighter.vy -= 4.5 * delta;
      fighter.y += fighter.vy * delta;
      fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
      fighter.visual.rotation.y += delta * 5;
      fighter.visual.rotation.z += delta * 0.7;
      fighter.visual.rotation.x += delta * 0.35;
      fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(Math.max(0.08, 1 - progress * 0.78));
      updateKnockoutBlackHole(fighter, delta, progress);
    }
    if (fighter.respawn <= 0) respawn(fighter, index);
    return;
  }

  if (fighter.portalEntry > 0) {
    fighter.portalEntry = Math.max(0, fighter.portalEntry - delta);
    const progress = 1 - fighter.portalEntry / fighter.portalEntryDuration;
    const eased = 1 - (1 - progress) ** 3;
    const target = fighter.portalEntryTarget;
    fighter.x = target.x * eased;
    fighter.y = THREE.MathUtils.lerp(2.85, 0.08, eased) + Math.sin(progress * Math.PI) * 0.48;
    fighter.z = THREE.MathUtils.lerp(-5.15, target.z, eased);
    fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
    fighter.visual.rotation.y = (fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2) + (1 - eased) * Math.PI * 1.7;
    fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(0.18 + eased * 0.82);
    if (fighter.portalEntry === 0) {
      fighter.x = target.x;
      fighter.y = 0.08;
      fighter.z = target.z;
      fighter.grounded = true;
      fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
      fighter.visual.rotation.y = fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
      fighter.visual.scale.copy(fighter.visual.userData.baseScale);
    }
    return;
  }

  readInput(fighter, index, delta);
  if (fighter.respawn > 0) return;
  const wasGrounded = fighter.grounded;
  const previousY = fighter.y;
  fighter.vy -= 23 * delta;
  fighter.x += fighter.vx * delta;
  fighter.y += fighter.vy * delta;
  fighter.z += fighter.vz * delta;
  if (index === 0 && secretPowerUp && Math.hypot(fighter.x - secretPowerUp.position.x, fighter.z - secretPowerUp.position.z) < 1.25) {
    secretPowerUp.visible = false;
    secretPowerUp = null;
    fighter.powerBoost = 8;
    document.querySelector("#battle-status").textContent = "SECRET POWER-UP! Your next attacks hit harder!";
    document.querySelector("#screen-reader-status").textContent = "Secret power-up collected. Your attacks are stronger for eight seconds.";
  }

  const edgeDistance = Math.hypot(fighter.x, fighter.z * 1.08);
  fighter.grounded = false;
  if (wasGrounded) {
    const steppedSurface = arenaSurfaces.find((surface) =>
      surface.stair &&
      surface.top > previousY &&
      surface.top <= previousY + 0.23 &&
      Math.abs(fighter.x - surface.x) <= surface.halfWidth + 0.18 &&
      Math.abs(fighter.z - surface.z) <= surface.halfDepth + 0.18
    );
    if (steppedSurface) {
      fighter.y = steppedSurface.top;
      fighter.vy = 0;
      fighter.grounded = true;
    }
  }
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

  if (fighter.y < -2.8 || edgeDistance > floorRadius + 1.35) {
    beginKnockout(fighter, "drifts out into space!");
    return;
  }

  fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
  fighter.visual.rotation.y = fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
  fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(1 + fighter.hitFlash * 0.7);
  if (fighter.visual.userData.powerAura) {
    fighter.visual.userData.powerAura.visible = fighter.powerBoost > 0;
    fighter.visual.userData.powerAura.rotation.z += delta * 1.8;
  }
  const body = fighter.visual.userData.body;
  const movement = Math.min(1, Math.hypot(fighter.vx, fighter.vz) / characters[fighter.kind].speed);
  const swing = fighter.attackPose > 0 ? Math.sin((fighter.attackPose / 0.55) * Math.PI) : 0;
  const idleBreath = Math.sin(elapsed * 2.6 + fighter.cpuThinkTime) * 0.025 * (1 - movement);
  body.position.y = fighter.grounded ? Math.abs(Math.sin(elapsed * 12)) * 0.065 * movement + idleBreath : 0;
  body.rotation.z = swing * -fighter.facing * 0.22 - fighter.vx * 0.012;
  body.rotation.x = fighter.grounded
    ? Math.sin(elapsed * 2.1 + fighter.cpuThinkTime) * 0.025 * (1 - movement)
    : -0.1;
  fighter.visual.userData.animatedLimbs.forEach((limb, limbIndex) => {
    const gaitPhase = (limb.userData.side < 0 ? 0 : Math.PI) + (limb.userData.limbType === "arm" ? Math.PI : 0);
    limb.rotation.z = limb.userData.restRotationZ
      + Math.sin(elapsed * 10 + gaitPhase) * 0.48 * movement
      + Math.cos(elapsed * 18) * swing * -fighter.facing * 0.28;
  });
  body.rotation.y = Math.sin(elapsed * 5 + fighter.cpuThinkTime) * 0.08 * movement
    + swing * fighter.facing * 0.12;
  animateBlink(fighter.visual, elapsed);
  fighter.visual.visible = fighter.invulnerable <= 0 || Math.floor(elapsed * 12) % 2 === 0;
}

function updateProjectiles(delta) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.life -= delta;
    projectile.mesh.position.x += projectile.vx * delta;
    projectile.mesh.rotation.y += delta * 4;
    for (const target of fighters) {
      if (target === projectile.owner || target.eliminated || target.respawn > 0) continue;
      const dx = projectile.mesh.position.x - target.x;
      const dy = projectile.mesh.position.y - (target.y + 1.3);
      const dz = projectile.mesh.position.z - target.z;
      if (dx * dx + dy * dy + dz * dz < 0.85 * 0.85) {
        hitTarget(projectile.owner, target, projectile.damage * projectile.power, 4.2);
        projectile.life = 0;
        break;
      }
    }
    if (projectile.life <= 0 || Math.abs(projectile.mesh.position.x) > 12) {
      arena.remove(projectile.mesh);
      projectiles.splice(i, 1);
    }
  }
}

function updateHitEffects(delta) {
  for (let i = hitEffects.length - 1; i >= 0; i -= 1) {
    const effect = hitEffects[i];
    effect.userData.remaining -= delta;
    const progress = 1 - effect.userData.remaining / 0.3;
    effect.children.forEach((child) => {
      if (child.userData.impactRing) {
        child.scale.setScalar(1 + progress * 2.2);
        child.material.opacity = Math.max(0, 1 - progress);
      } else if (child.userData.velocity) {
        child.position.addScaledVector(child.userData.velocity, delta);
        child.userData.velocity.y -= 9 * delta;
        child.material.opacity = Math.max(0, 1 - progress);
      }
    });
    if (effect.userData.remaining <= 0) {
      arena.remove(effect);
      disposeObject(effect);
      hitEffects.splice(i, 1);
    }
  }
  cameraShake = Math.max(0, cameraShake - delta * 1.2);
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
    const standings = fighters
      .map((fighter, index) => ({ fighter, index }))
      .sort((a, b) => b.fighter.stocks - a.fighter.stocks || a.fighter.damage - b.fighter.damage);
    const first = standings[0];
    const second = standings[1];
    const tied = first.fighter.stocks === second.fighter.stocks && first.fighter.damage === second.fighter.damage;
    finishMatch(tied ? null : first.index, tied ? "The arena ends in a draw." : "Time is up!");
  }
}

function updateCamera(delta) {
  const activeFighters = fighters.filter((fighter) => !fighter.eliminated);
  const centerX = activeFighters.length
    ? activeFighters.reduce((total, fighter) => total + fighter.x, 0) / activeFighters.length
    : 0;
  const spreadX = activeFighters.length > 1
    ? Math.max(...activeFighters.map((fighter) => fighter.x)) - Math.min(...activeFighters.map((fighter) => fighter.x))
    : 0;
  const spreadZ = activeFighters.length > 1
    ? Math.max(...activeFighters.map((fighter) => fighter.z)) - Math.min(...activeFighters.map((fighter) => fighter.z))
    : 0;
  const targetX = THREE.MathUtils.clamp(centerX * 0.42, -4.5, 4.5);
  camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.7, delta) + (Math.random() - 0.5) * cameraShake;
  camera.position.y = THREE.MathUtils.damp(camera.position.y, 11.2, 2, delta) + (Math.random() - 0.5) * cameraShake;
  const arenaCameraDistance = Math.max(24, floorRadius * 2.7);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, arenaCameraDistance + Math.min(Math.max(spreadX, spreadZ), 12) * 0.55, 1.5, delta);
  camera.lookAt(targetX * 0.68, 1.35, 0);
}

function animatePortal(elapsed, delta) {
  starField.rotation.y += delta * 0.0014;
  galaxyBackdrop.rotation.z += delta * 0.014;
  galaxyBackdrop.rotation.x = -0.18 + Math.sin(elapsed * 0.16) * 0.025;
  galaxyBackdrop.children[0].material.opacity = 0.62 + Math.sin(elapsed * 1.1) * 0.12;
  animateSpaceBattle(elapsed);
  titlePlanets.visible = titleScreenActive || selectionScreenActive;
  if (titlePlanets.visible) {
    titlePlanets.children.forEach((planet) => {
      const { basePosition, phase } = planet.userData;
      planet.position.x = basePosition.x + Math.sin(elapsed * 0.18 + phase) * 1.1;
      planet.position.y = basePosition.y + Math.sin(elapsed * 0.24 + phase) * 0.24;
      planet.rotation.z = Math.sin(elapsed * 0.12 + phase) * 0.035;
      planet.children.forEach((part) => {
        if (part.userData.spin) part.rotation.y += delta * part.userData.spin;
        if (part.userData.orbitSpeed) part.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * part.userData.orbitSpeed);
      });
    });
  }
  if (arena.visible) {
    arenaPlanets.forEach((planet) => {
      planet.orbitAngle += delta * planet.orbitSpeed;
      planet.group.position.x = planet.x + Math.sin(planet.orbitAngle) * planet.orbitRadius;
      planet.group.position.y = planet.y + Math.sin(elapsed * planet.drift + planet.phase) * 0.42;
      planet.surface.rotation.y += delta * planet.spin;
      planet.ring.rotation.z += delta * planet.spin * 0.35;
      planet.moon.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * planet.orbitSpeed * 1.8);
    });
  }
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
  if (secretSeal?.userData.core) {
    secretSeal.userData.core.rotation.y += delta * secretSeal.userData.core.userData.spin;
    secretSeal.userData.core.position.y = 0.66 + Math.sin(elapsed * 2.4) * 0.09;
  }
  if (secretPowerUp?.userData.orb) {
    secretPowerUp.userData.orb.rotation.y += delta * secretPowerUp.userData.orb.userData.spin;
    secretPowerUp.userData.orb.position.y = 1.05 + Math.sin(elapsed * 2.8) * 0.12;
  }
  portalLight.intensity = portalRings.length ? 16 + Math.sin(elapsed * 2.4) * 3 : 0;
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
    if (!portalIntroActive) updateClock(delta);
    for (let index = 0; index < fighters.length; index += 1) {
      updateFighter(fighters[index], index, delta, elapsed);
    }
    if (portalIntroActive && fighters.every((fighter) => fighter.portalEntry === 0)) {
      portalIntroActive = false;
      document.querySelector("#battle-status").textContent = "FIGHT!";
      document.querySelector("#screen-reader-status").textContent = "All fighters have entered the arena. Fight!";
    }
    if (secretPortalPending) beginSecretChallenge();
    updateProjectiles(delta);
    updateHitEffects(delta);
    updateCamera(delta);
    if (hudDirty) updateHud();
  } else if (fighters.length === 0) {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 0.6, delta);
    camera.lookAt(0, selectionScreenActive && window.innerWidth <= 900 ? -2.2 : 1.4, 0);
    if (fighterPreview) {
      fighterPreview.position.y = fighterPreview.userData.baseY + Math.sin(elapsed * 2.4) * 0.08;
      fighterPreview.rotation.y += delta * 0.72;
      const body = fighterPreview.userData.body;
      body.rotation.z = Math.sin(elapsed * 1.3) * 0.035;
      body.position.y = Math.sin(elapsed * 2.4) * 0.035;
      fighterPreview.userData.animatedLimbs.forEach((limb) => {
        const phase = (limb.userData.side < 0 ? 0 : Math.PI) + (limb.userData.limbType === "arm" ? Math.PI : 0);
        limb.rotation.z = limb.userData.restRotationZ + Math.sin(elapsed * 3.4 + phase) * 0.24;
      });
      fighterPreview.traverse((part) => {
        if (part.userData.spin) part.rotation.y += delta * part.userData.spin;
      });
      animateBlink(fighterPreview, elapsed);
    }
  }
  if (knockoutFlashTimer > 0) {
    knockoutFlashTimer = Math.max(0, knockoutFlashTimer - delta);
    if (knockoutFlashTimer === 0) {
      knockoutFlash.hidden = true;
      knockoutFlash.classList.remove("play");
    }
  }
  justPressed.clear();
  if (!graphicsContextLost) renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(frame);
}

createUniverseBackdrop();
createStars();
createArena(arenaIndex);
updateArenaLabel();
document.querySelector('[data-fighter="entity"]').hidden = !entityUnlocked;
document.querySelector("#fighter-count").textContent = entityUnlocked ? "09 FIGHTERS" : "08 FIGHTERS";

document.querySelector("#enter-portal").addEventListener("click", showSelection);
document.querySelector("#back-to-portal").addEventListener("click", showPortal);
document.querySelector("#start-match").addEventListener("click", () => startMatch());
document.querySelector("#leave-battle").addEventListener("click", showSelection);
document.querySelector("#rematch").addEventListener("click", () => startMatch(secretChallengeActive ? "entity" : null));
document.querySelector("#return-to-select").addEventListener("click", showSelection);
document.querySelector("#return-through-portal").addEventListener("click", showSelection);
document.querySelector("#toggle-mode").addEventListener("click", () => {
  battleMode = battleMode === "cpu" ? "local" : "cpu";
  document.querySelector("#mode-label").textContent = battleMode === "cpu" ? "Solo vs. 3 CPUs" : "Local 4-player";
  document.querySelector("#toggle-mode").textContent = battleMode === "cpu" ? "Local 4-player" : "Solo vs. CPUs";
  updateControlsHint();
});
document.querySelector("#arena-previous").addEventListener("click", () => changeArena(-1));
document.querySelector("#arena-next").addEventListener("click", () => changeArena(1));
document.querySelector("#arena-random").addEventListener("click", () => changeArena(1 + Math.floor(Math.random() * (arenaCount - 1))));

document.querySelectorAll(".fighter-card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedFighter = card.dataset.fighter;
    updateFighterPreview(selectedFighter);
    document.querySelectorAll(".fighter-card").forEach((item) => {
      const selected = item === card;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
  });
});

window.addEventListener("keydown", (event) => {
  const supported = [
    "KeyA", "KeyD", "KeyW", "KeyS", "Space", "KeyJ", "KeyK",
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "ShiftRight",
    "KeyF", "KeyH", "KeyT", "KeyG", "KeyR", "KeyY", "KeyU",
    "Numpad0", "Numpad1", "Numpad2", "Numpad4", "Numpad5", "Numpad6", "Numpad8"
  ];
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
    clearInputState();
  } else {
    clock.start();
    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(frame);
  }
});

const joystick = document.querySelector("#virtual-joystick");
if (joystick) {
  const knob = document.querySelector("#joystick-knob");
  const directionKeys = ["KeyA", "KeyD", "KeyW", "KeyS"];
  const moveJoystick = (event) => {
    if (event.pointerId !== joystickPointerId) return;
    const bounds = joystick.getBoundingClientRect();
    const maxTravel = bounds.width * 0.34;
    let x = event.clientX - (bounds.left + bounds.width / 2);
    let y = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(x, y);
    if (distance > maxTravel) {
      x = (x / distance) * maxTravel;
      y = (y / distance) * maxTravel;
    }

    knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    const horizontal = x / maxTravel;
    const vertical = y / maxTravel;
    const nextKeys = new Set();
    if (horizontal < -0.25) nextKeys.add("KeyA");
    if (horizontal > 0.25) nextKeys.add("KeyD");
    if (vertical < -0.25) nextKeys.add("KeyW");
    if (vertical > 0.25) nextKeys.add("KeyS");
    directionKeys.forEach((code) => {
      if (nextKeys.has(code)) virtualKeys.add(code);
      else virtualKeys.delete(code);
    });
  };
  const releaseJoystick = (event) => {
    if (event.pointerId === joystickPointerId) resetJoystick();
  };

  joystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    joystickPointerId = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    moveJoystick(event);
  });
  joystick.addEventListener("pointermove", moveJoystick);
  joystick.addEventListener("pointerup", releaseJoystick);
  joystick.addEventListener("pointercancel", releaseJoystick);
  joystick.addEventListener("lostpointercapture", releaseJoystick);
}

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
});

renderer.domElement.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  graphicsContextLost = true;
  resumeAfterGraphicsRestore = matchActive;
  matchActive = false;
  clearInputState();
  graphicsErrorMessage.textContent = "The 3D graphics were interrupted. Your match is paused; the game will resume if the browser restores them.";
  graphicsError.hidden = false;
});
renderer.domElement.addEventListener("webglcontextrestored", () => {
  graphicsContextLost = false;
  graphicsError.hidden = true;
  if (resumeAfterGraphicsRestore) {
    matchActive = true;
    document.querySelector("#battle-status").textContent = "GRAPHICS RESTORED";
  }
  resumeAfterGraphicsRestore = false;
});

frame();
}

initializeUniverseCrazy();
