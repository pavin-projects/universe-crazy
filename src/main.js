import * as THREE from "three";
import { setOnlineListeners, initOnlineUi, restoreSession, isSignedIn, currentAccount, currentSkinId, hostOrJoinMatch, leaveMatch, sendOnlineState, sendOnlineHit, sendOnlineProjectile, reportOnlineResult, openAccountFor } from "./online.js";
import { skinById } from "../shared/skins.js";
import { swordForWins } from "../shared/swords.js";
import { segmentSphereHitTime, segmentCrossesGate } from "./collision.js";
import { readFlightInput } from "./flight.js";

let onlineSendTimer = 0;
let onlineRemotes = [];
let onlineSlot = 0;

const FIGHTER_SCALE = 0.85;
const MAP_SCALE = 3;

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
const adminMusicToggle = document.querySelector("#admin-toggle-music");
const adminNextTrack = document.querySelector("#admin-next-track");
const musicStatus = document.querySelector("#music-status");
const musicScales = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  pentatonic: [0, 2, 4, 7, 9, 12, 14, 16],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12]
};
// Musical, structured 16-step motif patterns (indices into the track's scale, -1 = rest)
const musicMotifs = [
  [0, 2, 4, 2, 5, 4, 2, -1, 4, 5, 7, 5, 4, 2, 0, -1],
  [0, -1, 4, 2, 3, -1, 5, 4, 2, -1, 3, 1, 0, -1, 2, -1],
  [0, 4, 7, 4, 5, 4, 2, 4, 0, 4, 7, 5, 4, 2, 1, 0],
  [4, 2, 0, 2, 4, 4, 4, -1, 2, 2, 2, -1, 4, 7, 7, -1],
  [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0, -1],
  [0, 3, 5, 7, 5, 3, 2, -1, 0, 3, 5, 6, 5, 3, 2, 0],
  [7, 5, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 3, 2, 1, 0],
  [0, 2, 3, 5, 7, 5, 3, 2, 0, 2, 3, 5, 4, 2, 0, -1]
];
const musicTrackSeeds = [
  ["Starlight Pulse", 112, 60, "major", "triangle", "standard", 0, null],
  ["Nebula Drift", 104, 57, "minor", "sine", "standard", 1, null],
  ["Portal Rush", 132, 62, "minor", "triangle", "eerie", 2, null],
  ["Solar Flare", 128, 64, "mixolydian", "triangle", "standard", 3, null],
  ["Comet Chase", 126, 65, "pentatonic", "triangle", "standard", 4, null],
  ["Void Echoes", 112, 55, "harmonicMinor", "triangle", "scary", 5, null],
  ["Skyforge Anthem", 120, 67, "major", "triangle", "standard", 0, null],
  ["Emberfall Beat", 130, 58, "harmonicMinor", "sawtooth", "scary", 7, null],
  ["Frostline Waltz", 108, 63, "dorian", "sine", "standard", 1, null],
  ["Verdant Groove", 118, 60, "pentatonic", "triangle", "standard", 4, null],
  ["Neon Arcade", 136, 64, "minor", "triangle", "eerie", 2, null],
  ["Tidal Horizon", 110, 62, "major", "sine", "standard", 3, null],
  ["Sunken Crown", 106, 57, "harmonicMinor", "triangle", "scary", 6, null],
  ["Moonfall Sprint", 134, 66, "dorian", "triangle", "eerie", 5, null],
  ["Crystal Cavern", 106, 65, "major", "sine", "standard", 0, null],
  ["Thunderhead", 134, 57, "harmonicMinor", "sawtooth", "scary", 7, null],
  ["Bumble Bounce", 126, 67, "pentatonic", "triangle", "battle", 4, "bumble"],
  ["Robot Circuit", 130, 62, "dorian", "square", "battle", 2, "robot"],
  ["Foxfire Dash", 128, 64, "major", "triangle", "battle", 0, "nova"],
  ["Titan Stomp", 108, 53, "harmonicMinor", "sawtooth", "battle", 6, "titan"],
  ["Glitch Hop", 134, 64, "minor", "square", "battle", 2, "glitch"],
  ["Tide Runner", 122, 60, "mixolydian", "triangle", "battle", 3, "tide"],
  ["Mossy Leap", 118, 65, "pentatonic", "sine", "battle", 4, "frog"],
  ["Dino Roar", 132, 55, "harmonicMinor", "sawtooth", "battle", 7, "dinosaur"],
  ["Monkey Swing", 128, 67, "mixolydian", "triangle", "battle", 1, "monkey"],
  ["Lizard Lounge", 116, 62, "dorian", "triangle", "battle", 5, "lizard"],
  ["Orbital Ring", 124, 64, "major", "triangle", "standard", 3, null],
  ["Zero Gravity", 132, 59, "minor", "sine", "eerie", 1, null],
  ["Null Abyss", 138, 52, "harmonicMinor", "sawtooth", "scary", 5, "entity"],
  ["Victory Galaxy", 126, 60, "major", "triangle", "standard", 0, null]
];
const musicTracks = musicTrackSeeds.map(([title, bpm, root, scaleName, wave, mood, motifIndex, fighterKind]) => {
  const scale = musicScales[scaleName];
  const motif = musicMotifs[motifIndex % musicMotifs.length];
  const toMidi = (deg) => (deg === -1 ? null : root + 12 + scale[deg % scale.length]);
  const melody = [...motif.map(toMidi), ...motif.map((deg, idx) => (deg === -1 ? null : toMidi(idx === 15 ? 0 : deg)))];
  const progressions = [
    [0, 5, 3, 4],
    [0, 3, 4, 0],
    [0, 4, 5, 3],
    [0, 2, 3, 4]
  ];
  const progression = progressions[motifIndex % progressions.length];
  const chords = progression.map((deg) => {
    const bass = root - 12 + scale[deg % scale.length];
    const c1 = root + scale[deg % scale.length];
    const c2 = root + scale[(deg + 2) % scale.length];
    const c3 = root + scale[(deg + 4) % scale.length];
    return { bass, chord: [c1, c2, c3] };
  });
  return { title, bpm, wave, mood, fighterKind, melody, chords, stepDuration: 60 / bpm / 2 };
});
let currentMusicScene = "title";
let currentTrackIndex = 0;
let musicLoopCount = 0;
let musicEnabled = true;
let musicContext = null;
let musicFilter = null;
let musicMasterGain = null;
let musicScheduler = null;
let nextMusicStepTime = 0;
let musicStep = 0;

function playMusicTone(frequency, startTime, duration, volume, type) {
  const oscillator = musicContext.createOscillator();
  const envelope = musicContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(envelope);
  envelope.connect(musicFilter);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

function playMusicKick(startTime) {
  const osc = musicContext.createOscillator();
  const env = musicContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(112, startTime);
  osc.frequency.exponentialRampToValueAtTime(44, startTime + 0.11);
  env.gain.setValueAtTime(0.36, startTime);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);
  osc.connect(env);
  env.connect(musicMasterGain);
  osc.start(startTime);
  osc.stop(startTime + 0.14);
}

function scheduleMusicStep(step, startTime) {
  const track = musicTracks[currentTrackIndex];
  const melodyNote = track.melody[step];
  if (melodyNote !== null && melodyNote >= 0) {
    const vol = track.wave === "sawtooth" || track.wave === "square" ? 0.16 : 0.28;
    playMusicTone(440 * (2 ** ((melodyNote - 69) / 12)), startTime, track.stepDuration * 0.9, vol, track.wave);
  }
  if (step % 4 === 0) playMusicKick(startTime);
  if (step % 8 === 0) {
    const chord = track.chords[Math.floor(step / 8)];
    playMusicTone(440 * (2 ** ((chord.bass - 69) / 12)), startTime, track.stepDuration * 3.4, 0.34, "triangle");
    chord.chord.forEach((note) => {
      playMusicTone(440 * (2 ** ((note - 69) / 12)), startTime, track.stepDuration * 7.2, 0.075, "sine");
    });
  }
}

function updateMusicButton() {
  const track = musicTracks[currentTrackIndex];
  if (adminMusicToggle) adminMusicToggle.textContent = `🔊 Music: ${musicEnabled ? "On" : "Off"}`;
  if (adminNextTrack) adminNextTrack.textContent = `🎵 Track ${currentTrackIndex + 1}/30 · ${track.title}`;
}

function handleMusicError(error) {
  if (!(error instanceof DOMException)
    || !["NotAllowedError", "InvalidStateError"].includes(error.name)) throw error;
  musicStatus.textContent = "Music could not start. Interact with the page to resume audio.";
}

async function startMusic() {
  if (!musicEnabled) return;
  if (!window.AudioContext) {
    musicEnabled = false;
    musicStatus.textContent = "Music is not supported by this browser.";
    if (adminMusicToggle) {
      adminMusicToggle.disabled = true;
      adminMusicToggle.textContent = "Music unavailable";
    }
    if (adminNextTrack) adminNextTrack.disabled = true;
    return;
  }
  if (!musicContext) {
    musicContext = new window.AudioContext();
    const compressor = musicContext.createDynamicsCompressor();
    musicFilter = musicContext.createBiquadFilter();
    musicFilter.type = "lowpass";
    musicFilter.frequency.value = 2100;
    musicFilter.Q.value = 1.2;
    musicMasterGain = musicContext.createGain();
    musicMasterGain.gain.value = 0.0001;
    musicFilter.connect(musicMasterGain);
    musicMasterGain.connect(compressor);
    compressor.connect(musicContext.destination);
  }
  if (musicContext.state !== "running") await musicContext.resume();
  musicMasterGain.gain.setTargetAtTime(0.58, musicContext.currentTime, 0.1);
  if (musicScheduler !== null) return;
  nextMusicStepTime = musicContext.currentTime + 0.04;
  musicStep = 0;
  musicLoopCount = 0;
  musicScheduler = window.setInterval(() => {
    const now = musicContext.currentTime;
    if (nextMusicStepTime < now - 0.25) nextMusicStepTime = now + 0.04;
    const scheduleUntil = now + 0.14;
    while (nextMusicStepTime < scheduleUntil) {
      const track = musicTracks[currentTrackIndex];
      scheduleMusicStep(musicStep, nextMusicStepTime);
      nextMusicStepTime += track.stepDuration;
      musicStep += 1;
      if (musicStep >= track.melody.length) {
        musicStep = 0;
        musicLoopCount += 1;
        if (musicLoopCount >= 2) {
          musicLoopCount = 0;
          const desiredMood = currentMusicScene === "battle" ? "scary" : currentMusicScene === "select" ? "eerie" : "standard";
          let nextIndex = (currentTrackIndex + 1) % musicTracks.length;
          for (let offset = 1; offset <= musicTracks.length; offset += 1) {
            const candidate = (currentTrackIndex + offset) % musicTracks.length;
            if (musicTracks[candidate].mood === desiredMood) {
              nextIndex = candidate;
              break;
            }
          }
          currentTrackIndex = nextIndex;
          updateMusicButton();
        }
      }
    }
  }, 45);
  updateMusicButton();
  musicStatus.textContent = `Playing Track ${currentTrackIndex + 1} of 30: ${musicTracks[currentTrackIndex].title}.`;
}

function nextMusicTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
  musicStep = 0;
  musicLoopCount = 0;
  if (musicContext) nextMusicStepTime = musicContext.currentTime + 0.04;
  updateMusicButton();
  if (!musicEnabled) {
    musicEnabled = true;
    updateMusicButton();
  }
  startMusic().catch(handleMusicError);
}

function setMusicScene(sceneName, opponentKind = null) {
  currentMusicScene = sceneName;
  let matchingIndex = -1;
  if (sceneName === "battle" && opponentKind) {
    matchingIndex = musicTracks.findIndex((track) => track.fighterKind === opponentKind);
  }
  if (matchingIndex === -1) {
    const desiredMood = sceneName === "battle" ? "scary" : sceneName === "select" ? "eerie" : "standard";
    if (musicTracks[currentTrackIndex].mood !== desiredMood) {
      matchingIndex = musicTracks.findIndex((track) => track.mood === desiredMood);
    }
  }
  if (matchingIndex !== -1 && matchingIndex !== currentTrackIndex) {
    currentTrackIndex = matchingIndex;
    musicStep = 0;
    musicLoopCount = 0;
    if (musicContext) nextMusicStepTime = musicContext.currentTime + 0.04;
  }
  updateMusicButton();
  if (musicEnabled && musicContext) startMusic().catch(handleMusicError);
}

function pauseMusic() {
  if (musicScheduler !== null) {
    window.clearInterval(musicScheduler);
    musicScheduler = null;
  }
  if (musicContext?.state === "running") {
    musicMasterGain.gain.setValueAtTime(0.0001, musicContext.currentTime);
    musicContext.suspend().catch(handleMusicError);
  }
}

adminMusicToggle.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  updateMusicButton();
  if (musicEnabled) {
    startMusic().catch(handleMusicError);
  } else {
    pauseMusic();
    musicStatus.textContent = "Music muted.";
  }
});
updateMusicButton();
const autoStartMusic = () => {
  if (musicEnabled) startMusic().catch(handleMusicError);
};
window.addEventListener("pointerdown", autoStartMusic, { once: true });
window.addEventListener("keydown", autoStartMusic, { once: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseMusic();
  } else if (musicEnabled && musicContext) {
    startMusic().catch(handleMusicError);
  }
});

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
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
} catch (error) {
  if (!(error instanceof Error) || !/webgl|context/i.test(error.message)) throw error;
  graphicsErrorMessage.textContent = "3D graphics could not start. Close other 3D tabs or enable browser hardware acceleration, then reload.";
  graphicsError.hidden = false;
  return;
}
const renderQuality = { height: 720, fps: 60 };
let frameInterval = 1000 / 60;

function applyRenderQuality() {
  const aspect = window.innerWidth / window.innerHeight;
  const height = renderQuality.height;
  renderer.setPixelRatio(1);
  renderer.setSize(Math.round(height * aspect), height, false);
}

function setRenderQuality(height, fps) {
  renderQuality.height = height;
  renderQuality.fps = fps;
  frameInterval = fps > 0 ? 1000 / fps : 0;
  applyRenderQuality();
}

renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
canvasRoot.append(renderer.domElement);
renderer.domElement.setAttribute("role", "img");
renderer.domElement.setAttribute("aria-label", "Game scene. Keyboard controls activate after starting a match.");
renderer.domElement.tabIndex = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#090c1d");
scene.fog = new THREE.FogExp2("#0c1027", 0.0035);
let starField;
let galaxyBackdrop;
let titlePlanets;
let spaceBattle;
const backgroundShips = [];
const backgroundShots = [];

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 10.8, 25.5);
camera.lookAt(0, 1.4, 0);

scene.add(new THREE.HemisphereLight("#c9d8ff", "#1c1a2e", 2.35));
const keyLight = new THREE.DirectionalLight("#fff1d1", 3.6);
keyLight.position.set(-5, 11, 8);
keyLight.castShadow = false;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight("#7fd8ff", 1.45);
rimLight.position.set(6, 8, -9);
rimLight.castShadow = false;
scene.add(rimLight);

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
const realmBackdrop = new THREE.Group();
scene.add(realmBackdrop);
const streamedDecor = [];
const ARENA_STREAM_RANGE = 70;
const arenaSurfaces = [];
const arenaPlanets = [];
const galaxyBattlePlatforms = {};
let portalDisc;
let portalRings = [];
let fighterPreview = null;
let secretPowerUp = null;
let battleMode = "explore";
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

function readUnlockedFighters() {
  try {
    const raw = window.localStorage.getItem("universeCrazyUnlockedFighters");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") return new Set();
    unlockPersistenceAvailable = false;
    storageNotice.hidden = false;
    return new Set();
  }
}

function saveUnlockedFighters() {
  if (!unlockPersistenceAvailable) return false;
  try {
    window.localStorage.setItem("universeCrazyUnlockedFighters", JSON.stringify([...unlockedFighters]));
    return true;
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
    unlockPersistenceAvailable = false;
    storageNotice.hidden = false;
    return false;
  }
}

let entityUnlocked = readEntityUnlock();
const unlockedFighters = readUnlockedFighters();
const starterCharacterIds = ["bumble", "robot", "nova", "titan", "glitch", "tide", "frog", "dinosaur", "monkey", "lizard", "sandpiper", "frostling", "wraith", "pinwheel", "shellbeetle", "gusty"];
const unlockableCharacterIds = [
  "ghost", "mrstar", "stubby", "stickman", "larry", "bob", "michael", "rand",
  "robert", "bopper", "pewstickman", "liz", "cindy", "munchy", "cryptokin",
  "fred", "alieny", "dops", "cartoonguy", "lostapple", "jim", "immy",
  "pixelpal", "flameknight", "frostbite", "shadowcat", "thunderbolt", "captainclaw",
  "astroduck", "cyberninja", "slimeking", "rocketpup", "magmaorb", "clockwork",
  "cosmicowl", "neonpanda", "piratebones", "cactusjack", "bubblepop", "laserbear",
  "turbosnail", "voltbunny", "goldenknight", "cheesewizard", "discoagent", "ironbeaver",
  "starjelly", "cometkid", "spookybat", "megatoad", "galaxydragon", "omegabot"
];
const regularCharacterIds = [...starterCharacterIds, ...unlockableCharacterIds];
let matchTime = 180;
let matchActive = false;
let matchEnded = false;
let portalIntroActive = false;
let effectTime = 0;
let displayedSecond = -1;
let hudDirty = true;
let knockoutFlashTimer = 0;
const yAxis = new THREE.Vector3(0, 1, 0);
let animationFrame = 0;
let lastFrameTime = 0;
let joystickPointerId = null;
let cameraShake = 0;
// Briefly frames whoever just used a special; cleared automatically so the camera returns to the player
let specialCameraFocus = null;
const specialCameraDuration = 2.2;
let graphicsContextLost = false;
let resumeAfterGraphicsRestore = false;

const characters = {
  bumble: {
    name: "Bumble Boy",
    palette: { primary: "#f5bd4a", dark: "#282238", trim: "#ffe38a", accent: "#ff9452" },
    speed: 7.3,
    power: 0.9,
    special: "sting",
    specialName: "Stinger Shot",
    specialDescription: "Fires a fast, stinging energy bolt."
  },
  robot: {
    name: "Robot Boy",
    palette: { primary: "#638ec5", dark: "#1d2b4d", trim: "#b1f3ff", accent: "#53e9f4" },
    speed: 5.8,
    power: 1.25,
    special: "dash",
    specialName: "Turbo Dash",
    specialDescription: "Rocket forward and ram the closest rival."
  },
  nova: {
    name: "Nova Fox",
    palette: { primary: "#ff7b29", dark: "#4d2310", trim: "#ffd082", accent: "#ffae42" },
    speed: 7.1,
    power: 0.94,
    special: "starburst",
    specialName: "Starburst",
    specialDescription: "Fires three stars in a wide spread."
  },
  titan: {
    name: "Cinder Titan",
    palette: { primary: "#c96a4a", dark: "#3d252b", trim: "#ffc276", accent: "#ff604a" },
    speed: 4.9,
    power: 1.38,
    build: "heavy",
    special: "quake",
    specialName: "Groundquake",
    specialDescription: "Slams the ground with a nearby shockwave."
  },
  glitch: {
    name: "Glitch",
    palette: { primary: "#52d7bd", dark: "#18343d", trim: "#c2fff0", accent: "#ff5dcc" },
    speed: 6.4,
    power: 1.04,
    special: "phase",
    specialName: "Phase Blink",
    specialDescription: "Warps behind a rival and strikes."
  },
  tide: {
    name: "Tide Runner",
    palette: { primary: "#479ce0", dark: "#18344c", trim: "#b5f6ff", accent: "#43f0d7" },
    speed: 7.6,
    power: 0.86,
    special: "wave",
    specialName: "Tidal Wave",
    specialDescription: "Sends a wide, hard-hitting wave forward."
  },
  frog: {
    name: "Moss Hopper",
    palette: { primary: "#63d274", dark: "#204d3b", trim: "#d8ff96", accent: "#88f0b0" },
    speed: 7.4,
    power: 0.92,
    special: "tongue",
    specialName: "Tongue Lash",
    specialDescription: "Snags a rival from farther away."
  },
  dinosaur: {
    name: "Rex Rumble",
    palette: { primary: "#2f7d3a", dark: "#122618", trim: "#9be858", accent: "#ff3b30" },
    speed: 5.6,
    power: 1.22,
    build: "heavy",
    special: "fire",
    specialName: "Fire Breath",
    specialDescription: "Breathes fire in a burning cone."
  },
  monkey: {
    name: "Monkeyman",
    palette: { primary: "#8b5a2b", dark: "#3a2210", trim: "#e6b88a", accent: "#ffe135" },
    speed: 7.5,
    power: 0.94,
    special: "banana",
    specialName: "Banana Peel",
    specialDescription: "Drops a banana peel that makes any fighter slip and fall."
  },
  lizard: {
    name: "Surface Lizard",
    palette: { primary: "#2f9e44", dark: "#0d0e14", trim: "#e03434", accent: "#9be858" },
    speed: 6.9,
    power: 1.08,
    special: "tongue",
    specialName: "Tongue Lash",
    specialDescription: "Snags a rival with a long lizard tongue."
  },
  sandpiper: {
    name: "Dune Piper",
    palette: { primary: "#e2b45c", dark: "#4a2f12", trim: "#fff0b8", accent: "#ffcf6b" },
    speed: 7.0,
    power: 1.0,
    special: "dune",
    specialName: "Dust Devil",
    specialDescription: "Whips up a sand vortex that pulls rivals in and stings them."
  },
  frostling: {
    name: "Frostling",
    palette: { primary: "#8fe3ff", dark: "#17324a", trim: "#f0fbff", accent: "#4ac8ff" },
    speed: 6.8,
    power: 1.12,
    special: "frostnova",
    specialName: "Frost Nova",
    specialDescription: "Blasts a ring of cold that knocks nearby rivals back."
  },
  wraith: {
    name: "Shade Wraith",
    palette: { primary: "#4b3b6b", dark: "#120c22", trim: "#c9b6ff", accent: "#ff4fa3" },
    speed: 7.0,
    power: 0.94,
    special: "shadowdash",
    specialName: "Shadow Dash",
    specialDescription: "Dashes forward while briefly untouchable, striking anyone in the way."
  },
  pinwheel: {
    name: "Pinwheel Pup",
    palette: { primary: "#ffb347", dark: "#402a10", trim: "#fff3d6", accent: "#ff5e8a" },
    speed: 7.2,
    power: 0.86,
    special: "comet",
    specialName: "Comet Chain",
    specialDescription: "Throws three spinning stars that curve back to the thrower."
  },
  shellbeetle: {
    name: "Shell Beetle",
    palette: { primary: "#3f9b8e", dark: "#10302c", trim: "#b8fff0", accent: "#ffd166" },
    speed: 6.4,
    power: 1.42,
    special: "shellguard",
    specialName: "Shell Guard",
    specialDescription: "Raises a hard shell that shoves nearby rivals away."
  },
  gusty: {
    name: "Gusty Glider",
    palette: { primary: "#9d7bff", dark: "#2a1f52", trim: "#e4dcff", accent: "#ffe066" },
    speed: 7.4,
    power: 0.84,
    special: "gale",
    specialName: "Gale Gust",
    specialDescription: "Fires two gusts of wind that push rivals off their footing."
  },
  ghost: {
    name: "Ghost Boy",
    tagline: "Spooky • Floating • Spectral",
    icon: "👻",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#d9f4ff", dark: "#19263d", trim: "#7ff7ff", accent: "#a6e9ff" },
    speed: 7.4,
    power: 1.02,
    build: "ghost",
    special: "phase",
    specialName: "Phantom Warp",
    specialDescription: "Phases behind a rival and strikes.",
    openingLine: "Booo!"
  },
  mrstar: {
    name: "Mister Star",
    tagline: "Cosmic • Golden • Shining",
    icon: "⭐",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#ffd646", dark: "#3a250d", trim: "#fff4b8", accent: "#ff9b3d" },
    speed: 7.0,
    power: 1.12,
    build: "star",
    special: "starburst",
    specialName: "Nova Shower",
    specialDescription: "Launches three blazing golden stars.",
    openingLine: "Time to shine!"
  },
  stubby: {
    name: "Fleet Stubby",
    tagline: "Short • Speedy • Scrappy",
    icon: "⚡",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#ff9642", dark: "#2b1d2e", trim: "#ffe07d", accent: "#ff5c5c" },
    speed: 8.2,
    power: 0.92,
    build: "stubby",
    special: "dash",
    specialName: "Stubby Blitz",
    specialDescription: "Rockets forward at blistering speed.",
    openingLine: "Too fast for you!"
  },
  stickman: {
    name: "Stickman",
    tagline: "Classic • Nimble • Sharp",
    icon: "🏃",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#f2f4ff", dark: "#11131d", trim: "#72e8ff", accent: "#ffcf66" },
    speed: 7.8,
    power: 0.95,
    build: "stick",
    special: "dash",
    specialName: "Stick Dash",
    specialDescription: "Darts forward with a crisp stick strike.",
    openingLine: "Drawn to win!"
  },
  larry: {
    name: "Larry",
    tagline: "Steady • Cool • Tough",
    icon: "🧢",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#4c7de0", dark: "#1b243b", trim: "#f5c29b", accent: "#74d4ff" },
    speed: 6.5,
    power: 1.05,
    build: "human",
    accessory: "cap",
    special: "dash",
    specialName: "Power Dash",
    specialDescription: "Charges straight into the nearest rival.",
    openingLine: "Let's do this!"
  },
  bob: {
    name: "Bob",
    tagline: "Sturdy • Round • Fearless",
    icon: "🥊",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#e06c53", dark: "#2b1a1c", trim: "#ffd6a8", accent: "#ffaa44" },
    speed: 5.9,
    power: 1.2,
    build: "heavy",
    special: "quake",
    specialName: "Belly Slam",
    specialDescription: "Shakes the arena with a heavy slam.",
    openingLine: "Bob's ready!"
  },
  michael: {
    name: "Michael",
    tagline: "Sleek • Focused • Quick",
    icon: "🕶",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#39486b", dark: "#121726", trim: "#8ef0ff", accent: "#ff5c8d" },
    speed: 6.9,
    power: 1.04,
    build: "human",
    accessory: "visor",
    special: "sting",
    specialName: "Visor Bolt",
    specialDescription: "Fires a sharp neon visor beam.",
    openingLine: "Locked on."
  },
  rand: {
    name: "Rand",
    tagline: "Wild • Chaotic • Fierce",
    icon: "🔥",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#d95f2b", dark: "#2e1612", trim: "#ffd166", accent: "#ff4d6d" },
    speed: 6.8,
    power: 1.08,
    build: "human",
    accessory: "spiky",
    special: "starburst",
    specialName: "Chaos Burst",
    specialDescription: "Fires a three-way spread of sparks.",
    openingLine: "Wildcard!"
  },
  robert: {
    name: "Robert",
    tagline: "Armored • Heavy • Solid",
    icon: "🛡",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#7e8ca6", dark: "#1d2433", trim: "#d4e6ff", accent: "#5cd1ff" },
    speed: 5.7,
    power: 1.22,
    build: "heavy",
    special: "dash",
    specialName: "Steel Charge",
    specialDescription: "Rams rivals with armored force.",
    openingLine: "Standing firm."
  },
  bopper: {
    name: "Stately Bopper",
    tagline: "Dapper • Classy • Hard-Hitting",
    icon: "🎩",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#57488a", dark: "#141221", trim: "#ffe28a", accent: "#ff6b8b" },
    speed: 6.4,
    power: 1.14,
    build: "bopper",
    special: "quake",
    specialName: "Top-Hat Slam",
    specialDescription: "Drops a shockwave with stately style.",
    openingLine: "Good day to brawl!"
  },
  pewstickman: {
    name: "Pew Stickman",
    tagline: "Blaster • Nimble • Tactical",
    icon: "🔫",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#e8f7ff", dark: "#141824", trim: "#4cf2ff", accent: "#ff59b8" },
    speed: 7.7,
    power: 0.98,
    build: "stick",
    accessory: "blaster",
    special: "sting",
    specialName: "Laser Pew",
    specialDescription: "Fires a high-speed cyan laser shot.",
    openingLine: "Pew pew!"
  },
  liz: {
    name: "Liz",
    tagline: "Swift • Agile • Bright",
    icon: "🎀",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#e863b8", dark: "#30162c", trim: "#ffe0f4", accent: "#73f5ff" },
    speed: 7.5,
    power: 0.96,
    build: "human",
    accessory: "bow",
    special: "starshower",
    specialName: "Star Shower",
    specialDescription: "Calls a rain of stars down on a rival.",
    openingLine: "Watch this!"
  },
  cindy: {
    name: "Cindy",
    tagline: "Sparkly • Pop • Energetic",
    icon: "✨",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#62d6ff", dark: "#1d284a", trim: "#fff0a8", accent: "#ff7ad9" },
    speed: 7.2,
    power: 0.98,
    build: "human",
    accessory: "crown",
    special: "starburst",
    specialName: "Star Pop",
    specialDescription: "Throws three sparkling pop stars.",
    openingLine: "Sparkle time!"
  },
  munchy: {
    name: "Munchy",
    tagline: "Chubby • Hungry • Bouncy",
    icon: "🍔",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#f2a649", dark: "#402412", trim: "#fff1c2", accent: "#ff6363" },
    speed: 5.8,
    power: 1.18,
    build: "munchy",
    special: "tongue",
    specialName: "Snack Snatch",
    specialDescription: "Snags nearby rivals from afar.",
    openingLine: "Snack attack!"
  },
  cryptokin: {
    name: "Cryptokin",
    tagline: "Hooded • Mysterious • Eerie",
    icon: "🧥",
    rarity: "Secret",
    dropChance: 0.03,
    palette: { primary: "#392954", dark: "#110a1c", trim: "#b774ff", accent: "#52ffd8" },
    speed: 6.8,
    power: 1.16,
    build: "cryptokin",
    special: "void",
    specialName: "Cryptic Rift",
    specialDescription: "Pulls rivals into a dark void pulse.",
    openingLine: "From the shadows..."
  },
  fred: {
    name: "Fred",
    tagline: "Teeth • Chomp • Walking",
    icon: "🦷",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#f26b8a", dark: "#381421", trim: "#ffffff", accent: "#63b3ff" },
    speed: 6.5,
    power: 1.14,
    build: "teeth",
    special: "bite",
    specialName: "Bite",
    specialDescription: "Lunges forward with a chomping blue-glowing bite!",
    openingLine: "Chomp chomp!"
  },
  alieny: {
    name: "Alieny",
    tagline: "Three-Eyed • Cosmic • Weird",
    icon: "👽",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#55e86e", dark: "#13331c", trim: "#c7ff9c", accent: "#7d5cff" },
    speed: 7.1,
    power: 1.02,
    build: "alien",
    special: "void",
    specialName: "Abduct Pulse",
    specialDescription: "Pulls rivals in with alien gravity.",
    openingLine: "Take me to your arena!"
  },
  dops: {
    name: "DOPS",
    tagline: "Bouncy • Cyber • Quirky",
    icon: "🤖",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#4cd9c4", dark: "#182d38", trim: "#d4fff8", accent: "#ffd166" },
    speed: 7.0,
    power: 1.04,
    build: "stubby",
    accessory: "visor",
    special: "wave",
    specialName: "Pulse Wave",
    specialDescription: "Sends a wide cyber wave forward.",
    openingLine: "DOPS online!"
  },
  cartoonguy: {
    name: "Secret Cartoon Guy",
    tagline: "Retro • Inked • Rubber-Hose",
    icon: "🎬",
    rarity: "Secret",
    dropChance: 0.025,
    palette: { primary: "#1b1c24", dark: "#0a0a0f", trim: "#ffffff", accent: "#ffdf6b" },
    speed: 7.6,
    power: 1.12,
    build: "cartoon",
    special: "anvil",
    specialName: "Anvil Drop",
    specialDescription: "Drops a cartoon anvil straight onto a rival.",
    openingLine: "That's all, folks!"
  },
  lostapple: {
    name: "Lost Apple",
    tagline: "Crunchy • Tart • Lost in Space",
    icon: "🍎",
    rarity: "Secret",
    dropChance: 0.025,
    palette: { primary: "#e03131", dark: "#3b170e", trim: "#74c947", accent: "#ffe082" },
    speed: 6.9,
    power: 1.15,
    build: "apple",
    special: "quake",
    specialName: "Apple Core Slam",
    specialDescription: "Bounces down for a crunchy shockwave.",
    openingLine: "How did I get here?!"
  },
  jim: {
    name: "Jim",
    tagline: "Chill • Cap • Ready",
    icon: "🧢",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#3b82f6", dark: "#172542", trim: "#f5c29b", accent: "#93c5fd" },
    speed: 6.7,
    power: 1.03,
    build: "human",
    accessory: "cap",
    special: "wave",
    specialName: "Chill Wave",
    specialDescription: "Sends a smooth crashing wave.",
    openingLine: "Keep it chill."
  },
  immy: {
    name: "Immy",
    tagline: "Bright • Fast • Sparkling",
    icon: "🌟",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#c94bf0", dark: "#2b1338", trim: "#ffe799", accent: "#5ff2ff" },
    speed: 7.7,
    power: 0.96,
    build: "human",
    accessory: "crown",
    special: "phase",
    specialName: "Spark Blink",
    specialDescription: "Warps behind rivals in a flash.",
    openingLine: "Catch the spark!"
  },
  pixelpal: {
    name: "Pixel Pal",
    tagline: "Retro • 8-Bit • Bouncy",
    icon: "👾",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#7c5cff", dark: "#171333", trim: "#7cf7ff", accent: "#ff6ec7" },
    speed: 7.0,
    power: 1.0,
    build: "stubby",
    accessory: "visor",
    special: "sting",
    specialName: "Laser Pixel",
    specialDescription: "Shoots an 8-bit energy bolt.",
    openingLine: "Insert coin!"
  },
  flameknight: {
    name: "Flame Knight",
    tagline: "Fiery • Armored • Brave",
    icon: "🔥",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#e85925", dark: "#2b120e", trim: "#ffd166", accent: "#ff3b30" },
    speed: 6.1,
    power: 1.18,
    build: "heavy",
    accessory: "crown",
    special: "fire",
    specialName: "Flame Breath",
    specialDescription: "Scorches rivals with a fiery cone.",
    openingLine: "Forge ahead!"
  },
  frostbite: {
    name: "Frostbite",
    tagline: "Icy • Crisp • Chill",
    icon: "❄️",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#62d0ff", dark: "#122b42", trim: "#e6fbff", accent: "#38b6ff" },
    speed: 6.8,
    power: 1.05,
    build: "human",
    accessory: "spiky",
    special: "wave",
    specialName: "Ice Wave",
    specialDescription: "Sends a freezing wave across the floor.",
    openingLine: "Stay frosty!"
  },
  shadowcat: {
    name: "Shadow Cat",
    tagline: "Stealthy • Fast • Feline",
    icon: "🐱",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#292738", dark: "#0b0a12", trim: "#c77dff", accent: "#ff63b6" },
    speed: 7.9,
    power: 1.02,
    build: "human",
    accessory: "spiky",
    special: "phase",
    specialName: "Shadow Pounce",
    specialDescription: "Blinks behind a rival and strikes.",
    openingLine: "Meow from the shadows!"
  },
  thunderbolt: {
    name: "Thunderbolt",
    tagline: "Electric • Rapid • Charged",
    icon: "⚡",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#ffd43b", dark: "#26210c", trim: "#fff9cc", accent: "#4dabf7" },
    speed: 8.1,
    power: 0.96,
    build: "human",
    accessory: "visor",
    special: "dash",
    specialName: "Lightning Dash",
    specialDescription: "Zips forward like a bolt of lightning.",
    openingLine: "Shocking speed!"
  },
  captainclaw: {
    name: "Captain Claw",
    tagline: "Snappy • Tough • Coastal",
    icon: "🦀",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#e04836", dark: "#36110e", trim: "#ffd2b3", accent: "#ff8c42" },
    speed: 6.2,
    power: 1.14,
    build: "stubby",
    special: "bite",
    specialName: "Pincer Bite",
    specialDescription: "Lunges in with a snapping pincer bite.",
    openingLine: "Snap to it!"
  },
  astroduck: {
    name: "Astro Duck",
    tagline: "Quirky • Space • Feathered",
    icon: "🦆",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#ffd95e", dark: "#2e2410", trim: "#ffffff", accent: "#ff8533" },
    speed: 7.1,
    power: 0.98,
    build: "stubby",
    accessory: "cap",
    special: "starburst",
    specialName: "Quack Stars",
    specialDescription: "Fires three cosmic stars.",
    openingLine: "Quack in space!"
  },
  cyberninja: {
    name: "Cyber Ninja",
    tagline: "Silent • Neon • Lethal",
    icon: "🥷",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#1e293b", dark: "#090d16", trim: "#38f2af", accent: "#ff477e" },
    speed: 7.8,
    power: 1.06,
    build: "cryptokin",
    special: "phase",
    specialName: "Neon Blink",
    specialDescription: "Warps behind rivals with neon speed.",
    openingLine: "Silent strike."
  },
  slimeking: {
    name: "Slime King",
    tagline: "Squishy • Royal • Bouncy",
    icon: "🟢",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#4cd964", dark: "#143d1d", trim: "#ffe066", accent: "#8ef59f" },
    speed: 5.9,
    power: 1.16,
    build: "munchy",
    accessory: "crown",
    special: "quake",
    specialName: "Slime Bounce",
    specialDescription: "Drops a royal bouncy shockwave.",
    openingLine: "Bow to the slime!"
  },
  rocketpup: {
    name: "Rocket Pup",
    tagline: "Loyal • Turbo • Playful",
    icon: "🐶",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#c98549", dark: "#362010", trim: "#fff0d6", accent: "#ff595e" },
    speed: 7.6,
    power: 0.95,
    build: "human",
    accessory: "cap",
    special: "dash",
    specialName: "Rocket Bark",
    specialDescription: "Dashes forward at rocket speed.",
    openingLine: "Woof woof!"
  },
  magmaorb: {
    name: "Magma Orb",
    tagline: "Molten • Heavy • Glowing",
    icon: "🌋",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#ff5722", dark: "#2e1008", trim: "#ffd54f", accent: "#ff1744" },
    speed: 5.6,
    power: 1.24,
    build: "munchy",
    special: "fire",
    specialName: "Magma Blast",
    specialDescription: "Breathes a cone of molten fire.",
    openingLine: "Eruption time!"
  },
  clockwork: {
    name: "Clockwork",
    tagline: "Brass • Precise • Mechanical",
    icon: "⚙️",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#d49b4b", dark: "#2b1f10", trim: "#fff0bd", accent: "#6be5ff" },
    speed: 6.4,
    power: 1.1,
    build: "bopper",
    special: "sting",
    specialName: "Gear Shot",
    specialDescription: "Launches a spinning brass gear bolt.",
    openingLine: "Right on time!"
  },
  cosmicowl: {
    name: "Cosmic Owl",
    tagline: "Wise • Winged • Starry",
    icon: "🦉",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#7c65b8", dark: "#1e1633", trim: "#ffe28a", accent: "#74e8ff" },
    speed: 7.2,
    power: 1.04,
    build: "star",
    special: "starburst",
    specialName: "Star Swoop",
    specialDescription: "Sends three starry feathers flying.",
    openingLine: "Hoo's next?"
  },
  neonpanda: {
    name: "Neon Panda",
    tagline: "Chill • Glowing • Strong",
    icon: "🐼",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#f2f4f8", dark: "#151724", trim: "#5bf2ff", accent: "#ff66c4" },
    speed: 6.1,
    power: 1.18,
    build: "heavy",
    special: "quake",
    specialName: "Bamboo Slam",
    specialDescription: "Slams the arena with neon power.",
    openingLine: "Panda power!"
  },
  piratebones: {
    name: "Pirate Bones",
    tagline: "Spooky • Swashbuckler • Bold",
    icon: "☠️",
    rarity: "Secret",
    dropChance: 0.03,
    palette: { primary: "#e8e6df", dark: "#14141c", trim: "#ff4d6d", accent: "#ffd166" },
    speed: 6.9,
    power: 1.12,
    build: "teeth",
    special: "bite",
    specialName: "Skull Chomper",
    specialDescription: "Lunges forward with a skeletal chomp.",
    openingLine: "Arrr, matey!"
  },
  cactusjack: {
    name: "Cactus Jack",
    tagline: "Spiky • Desert • Tough",
    icon: "🌵",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#3da35d", dark: "#13331e", trim: "#d8f3dc", accent: "#ffd166" },
    speed: 6.3,
    power: 1.08,
    build: "human",
    accessory: "spiky",
    special: "sting",
    specialName: "Needle Volley",
    specialDescription: "Fires a sharp cactus needle.",
    openingLine: "Don't hug me!"
  },
  bubblepop: {
    name: "Bubble Pop",
    tagline: "Floaty • Bright • Splashy",
    icon: "🫧",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#74e8ff", dark: "#143547", trim: "#ffffff", accent: "#ff8ef2" },
    speed: 7.3,
    power: 0.94,
    build: "munchy",
    special: "wave",
    specialName: "Bubble Surge",
    specialDescription: "Sends a bubbly tidal wave forward.",
    openingLine: "Pop goes the rival!"
  },
  laserbear: {
    name: "Laser Bear",
    tagline: "Mighty • Visor • Bear",
    icon: "🐻",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#8c5638", dark: "#29170e", trim: "#ff5252", accent: "#ffe066" },
    speed: 5.8,
    power: 1.24,
    build: "heavy",
    accessory: "visor",
    special: "sting",
    specialName: "Bear Beam",
    specialDescription: "Fires a blazing red visor beam.",
    openingLine: "Grrr-eat shot!"
  },
  turbosnail: {
    name: "Turbo Snail",
    tagline: "Shelled • Drift • Speedy",
    icon: "🐌",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#ff9e5e", dark: "#2e1b10", trim: "#66e4ee", accent: "#ffe066" },
    speed: 7.4,
    power: 0.98,
    build: "stubby",
    special: "dash",
    specialName: "Shell Drift",
    specialDescription: "Boosts forward in a turbo shell.",
    openingLine: "Fastest snail alive!"
  },
  voltbunny: {
    name: "Volt Bunny",
    tagline: "Hoppy • Electric • Agile",
    icon: "🐰",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#fff0b3", dark: "#2e2610", trim: "#ff6ec7", accent: "#5cf2ff" },
    speed: 7.8,
    power: 0.94,
    build: "human",
    accessory: "bow",
    special: "volt",
    specialName: "Volt Chain",
    specialDescription: "Arcs lightning from a rival to the next nearest fighter.",
    openingLine: "Hop to it!"
  },
  goldenknight: {
    name: "Golden Knight",
    tagline: "Royal • Shining • Armored",
    icon: "👑",
    rarity: "Secret",
    dropChance: 0.03,
    palette: { primary: "#ffd43b", dark: "#332508", trim: "#fff7cc", accent: "#ff8c38" },
    speed: 6.2,
    power: 1.25,
    build: "heavy",
    accessory: "crown",
    special: "quake",
    specialName: "Royal Impact",
    specialDescription: "Shatters the floor with golden force.",
    openingLine: "For the crown!"
  },
  cheesewizard: {
    name: "Cheese Wizard",
    tagline: "Cheesy • Magical • Goofy",
    icon: "🧀",
    rarity: "Secret",
    dropChance: 0.025,
    palette: { primary: "#ffd93b", dark: "#3b2c0a", trim: "#fff3b0", accent: "#ff922b" },
    speed: 6.8,
    power: 1.1,
    build: "bopper",
    special: "boulder",
    specialName: "Fondue Boulder",
    specialDescription: "Rolls a heavy cheese boulder across the arena.",
    openingLine: "Say cheese!"
  },
  discoagent: {
    name: "Disco Agent",
    tagline: "Groovy • Flashy • Smooth",
    icon: "🪩",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#d966ff", dark: "#1c102e", trim: "#ffffff", accent: "#5cf2ff" },
    speed: 7.2,
    power: 1.02,
    build: "human",
    accessory: "visor",
    special: "starburst",
    specialName: "Disco Flash",
    specialDescription: "Blasts three glittering disco stars.",
    openingLine: "Time to boogie!"
  },
  ironbeaver: {
    name: "Iron Beaver",
    tagline: "Chompy • Sturdy • Builder",
    icon: "🦫",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#9c6644", dark: "#2b1a10", trim: "#e6ccb2", accent: "#63b3ff" },
    speed: 6.4,
    power: 1.12,
    build: "stubby",
    special: "pound",
    specialName: "Timber Pound",
    specialDescription: "Slams the ground and sends shockwaves both ways.",
    openingLine: "Timber!"
  },
  starjelly: {
    name: "Star Jelly",
    tagline: "Glowing • Floaty • Cosmic",
    icon: "🪼",
    rarity: "Ultra Rare",
    dropChance: 0.06,
    palette: { primary: "#7cf2ff", dark: "#12243b", trim: "#ff8ef2", accent: "#b774ff" },
    speed: 7.1,
    power: 1.04,
    build: "ghost",
    special: "void",
    specialName: "Jelly Pull",
    specialDescription: "Pulls rivals into a glowing cosmic pulse.",
    openingLine: "Bloop bloop!"
  },
  cometkid: {
    name: "Comet Kid",
    tagline: "Blazing • Fast • Cosmic",
    icon: "☄️",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#ff884d", dark: "#2e140c", trim: "#74e8ff", accent: "#ffe066" },
    speed: 7.9,
    power: 1.0,
    build: "star",
    special: "dash",
    specialName: "Comet Dash",
    specialDescription: "Streaks across the arena like a comet.",
    openingLine: "Incoming!"
  },
  spookybat: {
    name: "Spooky Bat",
    tagline: "Night • Winged • Quick",
    icon: "🦇",
    rarity: "Uncommon",
    dropChance: 0.3,
    palette: { primary: "#4f3a6e", dark: "#120c1c", trim: "#ff5c8a", accent: "#a98eff" },
    speed: 7.6,
    power: 0.96,
    build: "cryptokin",
    special: "phase",
    specialName: "Night Swoop",
    specialDescription: "Swoops behind rivals in the dark.",
    openingLine: "Screeech!"
  },
  megatoad: {
    name: "Mega Toad",
    tagline: "Giant • Bouncy • Croaky",
    icon: "🐸",
    rarity: "Rare",
    dropChance: 0.14,
    palette: { primary: "#40916c", dark: "#102b1f", trim: "#b7e4c7", accent: "#ffd166" },
    speed: 6.2,
    power: 1.18,
    build: "munchy",
    special: "tongue",
    specialName: "Mega Tongue",
    specialDescription: "Snags rivals from across the arena.",
    openingLine: "RIBBIT!"
  },
  galaxydragon: {
    name: "Galaxy Dragon",
    tagline: "Mythic • Starry • Fierce",
    icon: "🐉",
    rarity: "Secret",
    dropChance: 0.025,
    palette: { primary: "#6f42c1", dark: "#170b2e", trim: "#ffd166", accent: "#ff4d6d" },
    speed: 6.7,
    power: 1.26,
    build: "heavy",
    accessory: "crown",
    special: "fire",
    specialName: "Fire Breed",
    specialDescription: "Breathes a cone of starfire, then hatches three fire hatchlings.",
    openingLine: "Feel the galaxy's roar!"
  },
  omegabot: {
    name: "Omega Bot",
    tagline: "Supreme • Cyber • Legendary",
    icon: "🦾",
    rarity: "Secret",
    dropChance: 0.025,
    palette: { primary: "#495057", dark: "#0f1117", trim: "#ff3b30", accent: "#66e4ee" },
    speed: 6.5,
    power: 1.28,
    build: "heavy",
    accessory: "visor",
    special: "void",
    specialName: "Omega Rift",
    specialDescription: "Pulls rivals into a high-energy rift.",
    openingLine: "Omega protocol engaged."
  },
  entity: {
    name: "Entity.exe",
    palette: { primary: "#71284e", dark: "#160c25", trim: "#ff4f8d", accent: "#b774ff" },
    speed: 5.5,
    power: 1.2,
    build: "heavy",
    special: "void",
    specialName: "Void Pulse",
    specialDescription: "Pulls nearby rivals into a damaging rift."
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
  if (parent === arena) {
    geometry.computeBoundingSphere();
    const largestScale = Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z);
    streamedDecor.push({ mesh, radius: geometry.boundingSphere.radius * largestScale });
  }
  return mesh;
}

function updateArenaStreaming() {
  for (let index = streamedDecor.length - 1; index >= 0; index -= 1) {
    const entry = streamedDecor[index];
    if (entry.mesh.parent !== arena) {
      streamedDecor.splice(index, 1);
      continue;
    }
    entry.mesh.visible = entry.mesh.position.distanceToSquared(camera.position) < (ARENA_STREAM_RANGE + entry.radius) ** 2;
  }
}

function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  object.traverse((child) => {
    if (child.geometry && !child.isSprite) geometries.add(child.geometry);
    const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
    for (const item of childMaterials) {
      if (!item) continue;
      materials.add(item);
      if (item.map) textures.add(item.map);
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((item) => item.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getGalaxyBattlePlatformPosition(arenaIndex) {
  if (galaxyBattlePlatforms[arenaIndex]) {
    return galaxyBattlePlatforms[arenaIndex];
  }
  const rng = seededRandom(arenaIndex);
  const angle = rng() * Math.PI * 2;
  const distance = 85 + rng() * 240;
  const height = rng() * 120 - 60;
  const position = {
    x: Math.cos(angle) * distance,
    y: height,
    z: Math.sin(angle) * distance
  };
  galaxyBattlePlatforms[arenaIndex] = position;
  return position;
}

function createStars() {
  const vertices = [];
  for (let i = 0; i < 360; i += 1) {
    const radius = 30 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const y = Math.random() * 35 - 4;
    vertices.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius - 12);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#d9ddff", size: 0.13, sizeAttenuation: true, transparent: true, opacity: 0.85 }));
  starField = points;
  scene.add(starField);

  const spiralPositions = [];
  const spiralColors = [];
  for (let i = 0; i < 950; i += 1) {
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
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the Universe Crazy background.");

  context.fillStyle = "#050817";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const nebula of [
    { x: 460, y: 560, radius: 600, color: "rgba(91, 48, 169, 0.45)" },
    { x: 1400, y: 400, radius: 500, color: "rgba(20, 118, 166, 0.35)" },
    { x: 1150, y: 980, radius: 550, color: "rgba(122, 47, 105, 0.28)" },
    { x: 1800, y: 700, radius: 480, color: "rgba(91, 48, 169, 0.3)" }
  ]) {
    const glow = context.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
    glow.addColorStop(0, nebula.color);
    glow.addColorStop(1, "rgba(5, 8, 23, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (let i = 0; i < 2600; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 2.1 + 0.25;
    context.fillStyle = `rgba(222, 233, 255, ${0.22 + Math.random() * 0.7})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(420, 64, 40),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  sky.renderOrder = -1;
  scene.add(sky);

  titlePlanets = new THREE.Group();
  const titlePalette = [
    ["#754caa", "#c5a1ff"],
    ["#287d9c", "#78eaff"],
    ["#8a4c65", "#ff9b9f"],
    ["#426b55", "#9affc1"],
    ["#a17c43", "#ffe097"],
    ["#515e9b", "#a5baff"]
  ];
  const titleConfigs = [];
  const titleCamPos = new THREE.Vector3(0, 10.8, 25.5);
  const titleForward = new THREE.Vector3(0, 1.4, 0).sub(titleCamPos).normalize();
  const titleRight = new THREE.Vector3().crossVectors(titleForward, new THREE.Vector3(0, 1, 0)).normalize();
  const titleUp = new THREE.Vector3().crossVectors(titleRight, titleForward).normalize();
  const titleHalfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const titleAspect = window.innerWidth / window.innerHeight;
  // Jittered grid over the view so planets spread across the screen instead of clumping
  const cols = 9;
  const rows = 7;
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const u = -1.2 + ((col + 0.2 + Math.random() * 0.6) / cols) * 2.4;
      const v = -1.05 + ((row + 0.2 + Math.random() * 0.6) / rows) * 2.1;
      if (Math.abs(u) < 0.34 && Math.abs(v) < 0.3) continue;
      cells.push({ u, v });
    }
  }
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const placed = cells.slice(0, 40).map(({ u, v }) => {
    const depth = 18 + Math.random() * 16;
    const radius = depth * (0.035 + Math.random() * 0.012);
    const center = titleCamPos.clone()
      .addScaledVector(titleForward, depth)
      .addScaledVector(titleRight, u * depth * titleHalfTan * titleAspect)
      .addScaledVector(titleUp, v * depth * titleHalfTan);
    return { center, radius };
  });
  placed.forEach(({ center, radius }, index) => {
    const [color, glow] = titlePalette[index % titlePalette.length];
    titleConfigs.push({
      center,
      radius,
      x: center.x,
      y: center.y,
      z: center.z,
      color,
      glow,
      phase: Math.random() * Math.PI * 2
    });
  });
  for (const config of titleConfigs) {
    const planet = new THREE.Group();
    planet.position.set(config.x, config.y, config.z);
    planet.userData.basePosition = planet.position.clone();
    planet.userData.phase = config.phase;
    const detailed = config.radius > 1.5;
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(config.radius, detailed ? 28 : 16, detailed ? 20 : 12),
      material(config.color, 0.76, 0.08, { emissive: config.glow, emissiveIntensity: 0.35 })
    );
    surface.userData.spin = config.radius > 3 ? 0.16 : -0.2;
    planet.add(surface);
    planet.add(new THREE.Mesh(
      new THREE.SphereGeometry(config.radius * 1.08, 24, 18),
      new THREE.MeshBasicMaterial({ color: config.glow, transparent: true, opacity: 0.04, side: THREE.BackSide })
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
    { x: -20, y: 4, z: 17, direction: 1, speed: 6.5, color: "#77eaff", phase: 0.2, scale: 2.1 },
    { x: 6, y: 9, z: 6, direction: -1, speed: 3.2, color: "#8effd0", phase: 2.4, scale: 1.4 },
    { x: 22, y: 2, z: 13, direction: -1, speed: 5.2, color: "#ff81bc", phase: 1.1, scale: 1.8 },
    { x: -8, y: 11, z: -6, direction: 1, speed: 2.4, color: "#ffb56e", phase: 4.1, scale: 1.1 }
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
    ship.scale.setScalar(config.scale);
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

  const moteGeometry = new THREE.SphereGeometry(0.04, 6, 6);
  for (let i = 0; i < 14; i += 1) {
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
  streamedDecor.length = 0;
  disposeObject(realmBackdrop);
  realmBackdrop.clear();
  portalRings = [];
  portalDisc = null;
  secretSeal = null;
  arenaPlanets.length = 0;
  arenaSurfaces.length = 0;
  hitEffects.length = 0;
  cameraShake = 0;
  arena.visible = true;

  const theme = hiddenRealmActive ? secretTheme : arenaThemes[Math.floor(index / 20) % arenaThemes.length];
  const layout = hiddenRealmActive ? 0 : index % 20;
  const random = seededRandom(index + 941);
  scene.background.set(theme.background).multiplyScalar(0.35);
  scene.fog.color.copy(scene.background);
  portalLight.color.set(theme.portal);
  cyanLight.color.set(theme.glow);

  const stone = material(theme.stone, 0.72, 0.18);
  const floor = material(theme.floor, 0.52, 0.24);
  const trim = material(theme.trim, 0.3, 0.46, { emissive: theme.trim, emissiveIntensity: 0.48 });
  
  const platformPosition = getGalaxyBattlePlatformPosition(index);
  arena.position.set(platformPosition.x, platformPosition.y, platformPosition.z);
  
  const realmDiscGeometry = new THREE.CylinderGeometry(1, 1, 0.6, 40);
  const realmCoreGeometry = new THREE.SphereGeometry(1, 20, 14);
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2 + random() * 0.4;
    const distance = 170 + random() * 130;
    const radius = 18 + random() * 22;
    const realm = new THREE.Group();
    realm.position.set(Math.cos(angle) * distance, -30 + random() * 70, Math.sin(angle) * distance);
    addMesh(realm, realmDiscGeometry, index % 2 ? stone : floor, [0, 0, 0], [radius, 1, radius]);
    addMesh(realm, realmCoreGeometry, stone, [0, -radius * 0.4, 0], [radius * 0.9, radius * 0.5, radius * 0.9]);
    realmBackdrop.add(realm);
  }

  const radiusVariants = [46.8, 56.7, 41.4, 48.6, 59.1, 43.2, 52.2, 39.9, 54, 45.6];
  const planetDepthVariants = [0.38, 0.56, 0.25, 0.42, 0.62, 0.28, 0.48, 0.24, 0.58, 0.34];
  floorRadius = radiusVariants[layout % radiusVariants.length] * 1.25 + random() * 0.4;
  const planetDepth = floorRadius * planetDepthVariants[layout % planetDepthVariants.length];
  const platformScale = 0.65;
  floorRadius *= platformScale;
  const scaledPlatformSize = new THREE.Vector3(platformScale, 1, platformScale);
  
  const planetCore = addMesh(
    arena,
    new THREE.SphereGeometry(1, 36, 22),
    stone,
    [0, -planetDepth * platformScale, 0],
    [floorRadius + 0.15, planetDepth * platformScale * 0.6, floorRadius + 0.15]
  );
  planetCore.rotation.y = random() * Math.PI * 2;
  const platform = addMesh(arena, new THREE.CylinderGeometry((floorRadius + 0.55) * platformScale, (floorRadius - 0.35) * platformScale, 0.5, 48), stone, [0, -0.25, 0]);
  platform.receiveShadow = true;
  addMesh(arena, new THREE.CircleGeometry(floorRadius, 48), floor, [0, 0.035, 0]).rotation.x = -Math.PI / 2;
  const planetBand = addMesh(arena, new THREE.TorusGeometry(floorRadius * 0.88, 0.085, 8, 72), trim, [0, -planetDepth * 0.58, 0]);
  planetBand.rotation.x = Math.PI / 2;

  const isletGeometries = [new THREE.DodecahedronGeometry(1, 0), new THREE.ConeGeometry(0.7, 2.4, 5)];
  for (let index = 0; index < 48; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = floorRadius + 5 + random() * 22;
    const size = 0.8 + random() * 2.4;
    const isSpire = index % 3 === 0;
    const islet = addMesh(
      arena,
      isletGeometries[isSpire ? 1 : 0],
      isSpire ? trim : stone,
      [Math.cos(angle) * distance, -3 + random() * 9, Math.sin(angle) * distance],
      [size, size * (isSpire ? 1.6 : 0.6), size]
    );
    islet.rotation.y = random() * Math.PI * 2;
  }

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
    const stepRun = 1.3 * MAP_SCALE;
    for (let step = 0; step < stepCount; step += 1) {
      const top = (step + 1) * 0.22;
      const distance = (1.9 + step * 1.3) * MAP_SCALE;
      const x = directionX * distance;
      const z = directionZ * distance;
      const width = (directionX === 0 ? 1.45 : 1.15) * MAP_SCALE;
      const depth = (directionZ === 0 ? 1.45 : 1.15) * MAP_SCALE;
      addMesh(arena, new THREE.BoxGeometry(width * 2, top, depth * 2), trim, [x, top / 2, z]);
      addMesh(arena, new THREE.BoxGeometry(width * 1.9, 0.035, depth * 1.9), floor, [x, top + 0.018, z]);
      arenaSurfaces.push({ x, z, top, bottom: 0, halfWidth: width, halfDepth: depth, stair: true, solid: true });
    }
    const landingDistance = (1.9 + stepCount * 1.3) * MAP_SCALE;
    const landingTop = stepCount * 0.22;
    const x = directionX * landingDistance;
    const z = directionZ * landingDistance;
    const landingWidth = (directionX === 0 ? 2.1 : 1.6) * MAP_SCALE;
    const landingDepth = (directionZ === 0 ? 1.6 : 2.1) * MAP_SCALE;
    addMesh(arena, new THREE.BoxGeometry(landingWidth * 2, 0.3, landingDepth * 2), trim, [x, landingTop - 0.15, z]);
    addMesh(arena, new THREE.BoxGeometry(landingWidth * 1.9, 0.04, landingDepth * 1.9), floor, [x, landingTop + 0.02, z]);
    arenaSurfaces.push({ x, z, top: landingTop + 0.04, bottom: Math.max(0, landingTop - 0.3), halfWidth: landingWidth, halfDepth: landingDepth, solid: true });
  }

  const platformCount = 2 + (layout % 5);
  for (let index = 0; index < platformCount; index += 1) {
    const angle = ((index + 0.5) / platformCount) * Math.PI * 2 + (random() - 0.5) * 0.3;
    const distance = floorRadius * (0.43 + random() * 0.1);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const width = (1.2 + random() * 0.8) * MAP_SCALE;
    const depth = (1.2 + random() * 0.8) * MAP_SCALE;
    const top = 0.8 + random() * 1.2;
    addMesh(arena, new THREE.CylinderGeometry(0.16, 0.24, top, 6), stone, [x, top / 2, z]);
    addMesh(arena, new THREE.CylinderGeometry(1, 0.92, 0.28, 8), trim, [x, top - 0.14, z], [width, 1, depth]);
    addMesh(arena, new THREE.CylinderGeometry(0.93, 0.9, 0.05, 8), floor, [x, top - 0.025, z], [width, 1, depth]);
    const platformRing = addMesh(arena, new THREE.TorusGeometry(width * 0.72, 0.035, 6, 24), rune, [x, top + 0.01, z]);
    platformRing.rotation.x = Math.PI / 2;
    arenaSurfaces.push({ x, z, top, bottom: top - 0.32, halfWidth: width, halfDepth: depth, solid: true, round: true });
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

// Torso silhouettes are lathe profiles: [radius, height] pairs from hips to neck
function latheFromKeys(keys, segments = 18) {
  const curve = new THREE.SplineCurve(keys.map(([radius, y]) => new THREE.Vector2(radius, y)));
  return new THREE.LatheGeometry(curve.getPoints(28), segments);
}

const bodyShapes = {
  standard: {
    torso: [[0, 0.34], [0.28, 0.42], [0.38, 0.62], [0.42, 0.9], [0.42, 1.18], [0.4, 1.42], [0.34, 1.6], [0, 1.66]],
    headR: 0.39, armX: 0.55, armR: 0.15, armLen: 0.48, legX: 0.22, legR: 0.14, footW: 0.38, beltY: 1.12, beltZ: 0.42
  },
  broad: {
    torso: [[0, 0.34], [0.34, 0.42], [0.5, 0.62], [0.58, 0.9], [0.6, 1.18], [0.56, 1.42], [0.44, 1.6], [0, 1.66]],
    headR: 0.48, armX: 0.68, armR: 0.2, armLen: 0.48, legX: 0.22, legR: 0.19, footW: 0.46, beltY: 1.12, beltZ: 0.6
  },
  round: {
    torso: [[0, 0.34], [0.36, 0.42], [0.56, 0.7], [0.6, 0.95], [0.56, 1.2], [0.5, 1.42], [0.36, 1.6], [0, 1.66]],
    headR: 0.42, armX: 0.62, armR: 0.17, armLen: 0.46, legX: 0.26, legR: 0.18, footW: 0.42, beltY: 1.08, beltZ: 0.58
  },
  lanky: {
    torso: [[0, 0.34], [0.2, 0.42], [0.27, 0.7], [0.26, 1.0], [0.24, 1.2], [0.3, 1.42], [0.24, 1.6], [0, 1.66]],
    headR: 0.36, armX: 0.4, armR: 0.1, armLen: 0.54, legX: 0.16, legR: 0.1, footW: 0.3, beltY: 1.0, beltZ: 0.27
  },
  petite: {
    torso: [[0, 0.34], [0.2, 0.42], [0.3, 0.62], [0.31, 0.86], [0.27, 1.04], [0.26, 1.2], [0.28, 1.34], [0.24, 1.5], [0, 1.56]],
    headR: 0.46, armX: 0.36, armR: 0.1, armLen: 0.4, legX: 0.14, legR: 0.12, footW: 0.28, beltY: 1.04, beltZ: 0.3
  },
  hourglass: {
    torso: [[0, 0.34], [0.3, 0.42], [0.44, 0.66], [0.4, 0.84], [0.26, 1.0], [0.26, 1.1], [0.34, 1.26], [0.36, 1.4], [0.3, 1.56], [0, 1.66]],
    headR: 0.37, armX: 0.46, armR: 0.12, armLen: 0.46, legX: 0.18, legR: 0.13, footW: 0.32, beltY: 1.0, beltZ: 0.28,
    skin: "#e2b08f"
  },
  pear: {
    torso: [[0, 0.34], [0.34, 0.42], [0.5, 0.64], [0.48, 0.84], [0.36, 1.0], [0.26, 1.12], [0.3, 1.3], [0.32, 1.44], [0.26, 1.6], [0, 1.66]],
    headR: 0.36, armX: 0.46, armR: 0.12, armLen: 0.46, legX: 0.26, legR: 0.16, footW: 0.4, beltY: 1.06, beltZ: 0.3,
    skin: "#c98f6b"
  }
};

const bodyShapeByKind = {
  nova: "standard", tide: "standard", larry: "standard", michael: "standard", thunderbolt: "standard", discoagent: "standard",
  titan: "broad", robert: "broad", cactusjack: "broad", flameknight: "broad", goldenknight: "broad",
  omegabot: "broad", galaxydragon: "broad", entity: "broad",
  glitch: "lanky", lizard: "lanky", frostbite: "lanky", shadowcat: "lanky", monkey: "lanky",
  bob: "round", jim: "round", rocketpup: "round", laserbear: "round", neonpanda: "round",
  rand: "petite", immy: "petite", voltbunny: "petite", wraith: "petite",
  sandpiper: "round", frostling: "lanky", pinwheel: "standard", shellbeetle: "broad", gusty: "pear",
  liz: "hourglass", cindy: "pear"
};

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
  const scleraMat = material("#fffdf7", 0.16, 0.02);
  const pupilMat = material("#121018", 0.14, 0.08);
  const shineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const addRealisticEye = (x, y, z, radius = 0.085, irisColor = "#3d2a1c") => {
    addMesh(body, new THREE.SphereGeometry(radius, 12, 10), scleraMat, [x, y, z], [1, 1.08, 0.72]);
    const irisMat = material(irisColor, 0.2, 0.05);
    addBlinkingEye(new THREE.SphereGeometry(radius * 0.68, 10, 8), irisMat, [x, y, z + radius * 0.42]);
    addBlinkingEye(new THREE.SphereGeometry(radius * 0.44, 8, 8), pupilMat, [x, y, z + radius * 0.62]);
    addMesh(body, new THREE.SphereGeometry(radius * 0.22, 6, 6), shineMat, [x + radius * 0.22, y + radius * 0.24, z + radius * 0.85]);
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
    const scaryEyeMat = material("#ff3b30", 0.22, 0.1, { emissive: "#ff3b30", emissiveIntensity: 0.75 });
    const fangMat = material("#f7f5e8", 0.2);
    const scaleMat = material("#1d5927", 0.38, 0.16);
    const bellyMat = material("#6ea84f", 0.48, 0.06);
    addMesh(body, new THREE.CapsuleGeometry(0.56, 0.72, 6, 14), mainMat, [0, 1.06, 0], [1.18, 1.04, 1.14]);
    addMesh(body, new THREE.CapsuleGeometry(0.38, 0.52, 5, 12), bellyMat, [0, 1.02, 0.24], [1.05, 0.96, 0.65]);
    addMesh(body, new THREE.CylinderGeometry(0.28, 0.36, 0.26, 12), mainMat, [0, 1.56, 0.05]);
    addMesh(body, new THREE.SphereGeometry(0.49, 20, 16), mainMat, [0, 1.9, 0.14], [1, 0.91, 1.04]);
    addMesh(body, new THREE.SphereGeometry(0.37, 16, 12), trimMat, [0, 1.62, 0.51], [1.15, 0.55, 0.88]);
    addMesh(body, new THREE.BoxGeometry(0.38, 0.08, 0.18), darkMat, [0, 1.5, 0.81]);
    for (const fangX of [-0.14, 0, 0.14]) {
      const fang = addMesh(body, new THREE.ConeGeometry(0.045, 0.15, 6), fangMat, [fangX, 1.46, 0.85]);
      fang.rotation.x = Math.PI;
    }
    for (const [sx, sy, sz] of [[-0.36, 1.38, 0.34], [0.36, 1.38, 0.34], [-0.42, 1.02, 0.28], [0.42, 1.02, 0.28], [0, 1.18, 0.52], [-0.28, 1.24, -0.38], [0.28, 1.24, -0.38], [-0.18, 0.9, -0.52], [0.18, 0.9, -0.52]]) {
      addMesh(body, new THREE.OctahedronGeometry(0.16, 0), scaleMat, [sx, sy, sz], [1.1, 0.75, 0.55]);
    }
    for (const side of [-1, 1]) {
      const brow = addMesh(body, new THREE.BoxGeometry(0.19, 0.06, 0.13), darkMat, [side * 0.22, 2.09, 0.49]);
      brow.rotation.z = side * -0.28;
      addMesh(body, new THREE.SphereGeometry(0.1, 12, 10), scaryEyeMat, [side * 0.23, 1.99, 0.48]);
      addBlinkingEye(new THREE.BoxGeometry(0.03, 0.1, 0.04), darkMat, [side * 0.23, 1.99, 0.56]);
      addMesh(body, new THREE.SphereGeometry(0.19, 12, 10), mainMat, [side * 0.58, 1.44, 0.02]);
      animatedLimbs.push(createLimb(body, palette, side * 0.61, 1.17, 0.02, 0.42, 0.18, side * -0.18));
      animatedLimbs.push(createLimb(body, palette, side * 0.29, 0.43, 0.02, 0.4, 0.2, side * 0.04));
      addMesh(body, new THREE.SphereGeometry(0.24, 14, 10), darkMat, [side * 0.31, 0.13, 0.18], [1.4, 0.58, 1.45]);
    }
    const tail = addMesh(body, new THREE.ConeGeometry(0.34, 1.18, 10), mainMat, [0, 1, -0.96]);
    tail.rotation.x = -Math.PI / 2;
    for (const z of [-0.48, -0.08, 0.32]) {
      const spike = addMesh(body, new THREE.ConeGeometry(0.17, 0.44, 6), trimMat, [0, 1.94, z]);
      spike.rotation.z = Math.PI;
    }
  } else if (kind === "monkey") {
    addMesh(body, new THREE.CapsuleGeometry(0.39, 0.56, 6, 14), mainMat, [0, 1.02, 0], [1.04, 1, 0.9]);
    addMesh(body, new THREE.CapsuleGeometry(0.26, 0.42, 5, 12), trimMat, [0, 1.02, 0.18], [1, 0.96, 0.52]);
    addMesh(body, new THREE.CylinderGeometry(0.16, 0.2, 0.22, 10), mainMat, [0, 1.48, 0.01]);
    addMesh(body, new THREE.SphereGeometry(0.41, 20, 16), mainMat, [0, 1.88, 0.02]);
    addMesh(body, new THREE.SphereGeometry(0.31, 16, 12), trimMat, [0, 1.78, 0.32], [1.06, 0.78, 0.56]);
    addMesh(body, new THREE.SphereGeometry(0.12, 10, 8), trimMat, [0, 1.86, 0.48], [1.2, 0.75, 0.65]);
    addMesh(body, new THREE.BoxGeometry(0.2, 0.03, 0.04), darkMat, [0, 1.66, 0.48]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.SphereGeometry(0.03, 8, 6), darkMat, [side * 0.045, 1.87, 0.55]);
      addMesh(body, new THREE.SphereGeometry(0.18, 12, 10), mainMat, [side * 0.45, 1.9, 0], [0.65, 1, 0.45]);
      addMesh(body, new THREE.SphereGeometry(0.11, 10, 8), trimMat, [side * 0.45, 1.9, 0.04], [0.65, 1, 0.45]);
      addRealisticEye(side * 0.14, 1.96, 0.37, 0.09, "#5c3818");
      addMesh(body, new THREE.SphereGeometry(0.15, 10, 8), mainMat, [side * 0.47, 1.38, 0]);
      animatedLimbs.push(createLimb(body, palette, side * 0.52, 1.14, 0, 0.48, 0.13, side * -0.16));
      addMesh(body, new THREE.SphereGeometry(0.14, 12, 10), trimMat, [side * 0.6, 0.78, 0.04]);
      animatedLimbs.push(createLimb(body, palette, side * 0.21, 0.39, 0, 0.34, 0.14, side * 0.05));
      addMesh(body, new THREE.SphereGeometry(0.17, 12, 10), trimMat, [side * 0.22, 0.12, 0.1], [1.25, 0.58, 1.3]);
    }
    const monkeyTail = addMesh(body, new THREE.TorusGeometry(0.42, 0.055, 8, 22, Math.PI * 1.3), mainMat, [0, 1.05, -0.45]);
    monkeyTail.rotation.y = Math.PI / 2;
    monkeyTail.rotation.z = -0.35;
  } else if (kind === "lizard") {
    const shortsMat = material("#e03434", 0.45, 0.08);
    const shadesMat = material("#0d0e14", 0.14, 0.65);
    const scaleMat = material("#1b5e2b", 0.36, 0.16);
    const bellyMat = material("#5ec468", 0.45, 0.06);
    const clawMat = material("#1e241f", 0.5, 0.12);
    // Shirtless green lizard torso (no T-shirt) with realistic musculature & scales
    addMesh(body, new THREE.CapsuleGeometry(0.42, 0.58, 6, 14), mainMat, [0, 1.18, 0], [1.08, 1, 0.86]);
    addMesh(body, new THREE.CapsuleGeometry(0.28, 0.42, 5, 12), bellyMat, [0, 1.14, 0.16], [1.04, 0.94, 0.54]);
    addMesh(body, new THREE.CylinderGeometry(0.18, 0.22, 0.22, 10), mainMat, [0, 1.56, 0.02]);
    // Lizard scales on chest & back
    for (const [sx, sy, sz] of [[-0.25, 1.38, 0.3], [0.25, 1.38, 0.3], [0, 1.2, 0.38], [-0.22, 1.35, -0.3], [0.22, 1.35, -0.3], [0, 1.05, -0.34]]) {
      addMesh(body, new THREE.OctahedronGeometry(0.11, 0), scaleMat, [sx, sy, sz], [1.1, 0.75, 0.5]);
    }
    // Red shorts around waist and upper thighs
    addMesh(body, new THREE.CylinderGeometry(0.45, 0.43, 0.38, 16), shortsMat, [0, 0.76, 0]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.CylinderGeometry(0.18, 0.17, 0.32, 14), shortsMat, [side * 0.22, 0.56, 0]);
      addMesh(body, new THREE.SphereGeometry(0.16, 10, 8), mainMat, [side * 0.5, 1.42, 0]);
      animatedLimbs.push(createLimb(body, palette, side * 0.56, 1.16, 0, 0.46, 0.13, side * -0.14));
      addMesh(body, new THREE.SphereGeometry(0.14, 12, 10), mainMat, [side * 0.62, 0.8, 0.04]);
      animatedLimbs.push(createLimb(body, palette, side * 0.22, 0.38, 0, 0.34, 0.14, side * 0.04));
      addMesh(body, new THREE.BoxGeometry(0.28, 0.15, 0.42), clawMat, [side * 0.22, 0.1, 0.09]);
      // Black sunglasses lenses & side temples
      addMesh(body, new THREE.BoxGeometry(0.21, 0.13, 0.07), shadesMat, [side * 0.15, 1.96, 0.42]);
      addMesh(body, new THREE.BoxGeometry(0.04, 0.04, 0.34), shadesMat, [side * 0.32, 1.98, 0.24]);
    }
    // Lizard head, snout, nostrils, sunglasses bridge, and tail
    addMesh(body, new THREE.SphereGeometry(0.39, 20, 16), mainMat, [0, 1.92, 0.04]);
    addMesh(body, new THREE.SphereGeometry(0.29, 16, 12), mainMat, [0, 1.82, 0.38], [1.05, 0.62, 1.05]);
    for (const side of [-1, 1]) {
      addMesh(body, new THREE.SphereGeometry(0.025, 6, 6), scaleMat, [side * 0.09, 1.88, 0.64]);
    }
    addMesh(body, new THREE.BoxGeometry(0.58, 0.04, 0.06), shadesMat, [0, 1.98, 0.42]);
    const lizardTail = addMesh(body, new THREE.ConeGeometry(0.22, 1.08, 10), mainMat, [0, 0.86, -0.78]);
    lizardTail.rotation.x = -Math.PI / 2;
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
    const shape = bodyShapes[bodyShapeByKind[kind] || "standard"];
    const headMat = shape.skin ? material(shape.skin, 0.5, 0.02) : mainMat;
    addMesh(body, latheFromKeys(shape.torso), mainMat, [0, 0, 0]);
    addMesh(body, new THREE.SphereGeometry(shape.headR, 16, 12), headMat, [0, 1.92, 0.02]);
    const visorMat = material(new THREE.Color(palette.dark).lerp(new THREE.Color(palette.trim), 0.5), 0.4, 0.05);
    addMesh(body, new THREE.BoxGeometry(shape.headR * 1.28, 0.19, 0.12), visorMat, [0, 1.89, shape.headR - 0.03]);
    for (const side of [-1, 1]) {
      addBlinkingEye(new THREE.SphereGeometry(0.07, 9, 8), trimMat, [side * shape.headR * 0.36, 1.9, shape.headR + 0.04]);
      animatedLimbs.push(createLimb(body, palette, side * shape.armX, 1.14, 0, shape.armLen, shape.armR, side * -0.12));
      animatedLimbs.push(createLimb(body, palette, side * shape.legX, 0.4, 0, 0.66 - 2 * shape.legR, shape.legR, side * 0.04));
      addMesh(body, new THREE.BoxGeometry(shape.footW, 0.18, 0.45), darkMat, [side * shape.legX, 0.12, 0.08]);
    }
    addMesh(body, new THREE.TorusGeometry(0.24, 0.055, 8, 20), trimMat, [0, shape.beltY, shape.beltZ]);
    if (kind === "nova") {
      const creamFurMat = material("#fff6e8", 0.35, 0.04);
      addMesh(body, new THREE.SphereGeometry(0.28, 16, 12), creamFurMat, [0, 1.18, 0.28], [1.1, 0.88, 0.52]);
      addMesh(body, new THREE.SphereGeometry(0.25, 16, 12), creamFurMat, [0, 1.76, 0.34], [1.08, 0.62, 0.56]);
      addMesh(body, new THREE.SphereGeometry(0.055, 8, 8), pupilMat, [0, 1.82, 0.48]);
      for (const side of [-1, 1]) {
        const ear = addMesh(body, new THREE.ConeGeometry(0.19, 0.64, 8), mainMat, [side * 0.25, 2.45, 0]);
        ear.rotation.z = side * -0.22;
        const innerEar = addMesh(body, new THREE.ConeGeometry(0.11, 0.42, 6), creamFurMat, [side * 0.25, 2.43, 0.05]);
        innerEar.rotation.z = side * -0.22;
        addRealisticEye(side * 0.16, 1.97, 0.34, 0.135, "#ff8c29");
      }
      const tail = addMesh(body, new THREE.ConeGeometry(0.25, 0.88, 10), mainMat, [0, 0.94, -0.62]);
      tail.rotation.x = Math.PI / 2;
      const tailTip = addMesh(body, new THREE.ConeGeometry(0.14, 0.32, 8), creamFurMat, [0, 0.94, -1.04]);
      tailTip.rotation.x = Math.PI / 2;
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
    } else if (characters[kind].build === "ghost") {
      const ghostMat = new THREE.MeshStandardMaterial({
        color: palette.primary, emissive: palette.trim, emissiveIntensity: 0.45,
        transparent: true, opacity: 0.78, roughness: 0.2
      });
      body.clear();
      addMesh(body, new THREE.CapsuleGeometry(0.44, 0.78, 6, 14), ghostMat, [0, 1.32, 0]);
      addMesh(body, new THREE.SphereGeometry(0.44, 18, 14), ghostMat, [0, 1.92, 0.02]);
      for (let i = 0; i < 5; i += 1) {
        const angle = (i / 5) * Math.PI * 2;
        addMesh(body, new THREE.ConeGeometry(0.16, 0.42, 6), ghostMat, [Math.cos(angle) * 0.3, 0.75, Math.sin(angle) * 0.25]).rotation.x = Math.PI;
      }
      for (const side of [-1, 1]) {
        addRealisticEye(side * 0.14, 1.96, 0.37, 0.095, "#2ce6ff");
        animatedLimbs.push(createLimb(body, palette, side * 0.54, 1.25, 0, 0.38, 0.12, side * -0.25));
      }
    } else if (characters[kind].build === "star") {
      const starGlow = material(palette.primary, 0.25, 0.25, { emissive: palette.accent, emissiveIntensity: 0.35 });
      addMesh(body, new THREE.OctahedronGeometry(0.55, 0), starGlow, [0, 1.96, 0.02], [1.1, 1.1, 0.52]);
      addMesh(body, new THREE.OctahedronGeometry(0.26, 0), trimMat, [0, 1.16, 0.42]);
    } else if (characters[kind].build === "stubby") {
      root.scale.set(1.12, 0.78, 1.12);
    } else if (characters[kind].build === "stick") {
      body.clear();
      const stickMat = material(palette.dark, 0.5, 0.1);
      addMesh(body, new THREE.CylinderGeometry(0.08, 0.08, 0.92, 8), stickMat, [0, 1.14, 0]);
      addMesh(body, new THREE.SphereGeometry(0.36, 18, 14), mainMat, [0, 1.94, 0]);
      for (const side of [-1, 1]) {
        addRealisticEye(side * 0.12, 1.97, 0.31, 0.075, "#3b82f6");
        animatedLimbs.push(createLimb(body, { primary: palette.dark, trim: palette.trim, accent: palette.accent }, side * 0.22, 1.24, 0, 0.54, 0.06, side * -0.28));
        animatedLimbs.push(createLimb(body, { primary: palette.dark, trim: palette.trim, accent: palette.accent }, side * 0.14, 0.42, 0, 0.42, 0.065, side * 0.08));
      }
      if (characters[kind].accessory === "blaster") {
        addMesh(body, new THREE.BoxGeometry(0.14, 0.14, 0.45), trimMat, [0.42, 1.24, 0.32]);
      }
    } else if (characters[kind].build === "bopper") {
      const hatMat = material("#151520", 0.35, 0.2);
      addMesh(body, new THREE.CylinderGeometry(0.56, 0.56, 0.06, 18), hatMat, [0, 2.28, 0.02]);
      addMesh(body, new THREE.CylinderGeometry(0.34, 0.38, 0.46, 16), hatMat, [0, 2.52, 0.02]);
      addMesh(body, new THREE.BoxGeometry(0.32, 0.12, 0.08), trimMat, [0, 1.46, 0.42]);
    } else if (characters[kind].build === "munchy") {
      addMesh(body, new THREE.SphereGeometry(0.68, 20, 16), mainMat, [0, 1.12, 0], [1.14, 0.96, 1.05]);
      addMesh(body, new THREE.BoxGeometry(0.34, 0.09, 0.1), darkMat, [0, 1.72, 0.41]);
    } else if (characters[kind].build === "cryptokin") {
      const hoodMat = material(palette.primary, 0.65, 0.1);
      addMesh(body, new THREE.ConeGeometry(0.62, 0.95, 10), hoodMat, [0, 2.02, -0.02]);
      addMesh(body, new THREE.ConeGeometry(0.72, 1.25, 10), hoodMat, [0, 1.02, -0.04]);
    } else if (characters[kind].build === "alien") {
      for (const side of [-1, 0, 1]) {
        addRealisticEye(side * 0.14, 1.98 + (side === 0 ? 0.14 : 0), 0.36, 0.075, "#9c4dff");
      }
      for (const side of [-1, 1]) {
        addMesh(body, new THREE.CylinderGeometry(0.03, 0.04, 0.34, 8), mainMat, [side * 0.18, 2.38, 0]);
        addMesh(body, new THREE.SphereGeometry(0.085, 10, 8), trimMat, [side * 0.18, 2.56, 0]);
      }
    } else if (characters[kind].build === "cartoon") {
      const gloveMat = material("#ffffff", 0.3, 0.05);
      for (const side of [-1, 1]) {
        addMesh(body, new THREE.SphereGeometry(0.2, 12, 10), gloveMat, [side * 0.64, 0.78, 0.05]);
        addMesh(body, new THREE.SphereGeometry(0.22, 12, 10), gloveMat, [side * 0.22, 0.13, 0.12], [1.25, 0.62, 1.35]);
        addRealisticEye(side * 0.14, 1.96, 0.36, 0.11, "#111118");
      }
    } else if (characters[kind].build === "apple") {
      body.clear();
      const stemMat = material("#593215", 0.75, 0.05);
      const leafMat = material("#64d147", 0.45, 0.05);
      addMesh(body, new THREE.SphereGeometry(0.64, 22, 18), mainMat, [0, 1.28, 0], [1.06, 0.96, 1.02]);
      addMesh(body, new THREE.CylinderGeometry(0.05, 0.07, 0.34, 8), stemMat, [0, 1.98, 0]);
      const leaf = addMesh(body, new THREE.SphereGeometry(0.18, 10, 8), leafMat, [0.16, 2.02, 0.02], [1.2, 0.45, 0.6]);
      leaf.rotation.z = 0.4;
      for (const side of [-1, 1]) {
        addRealisticEye(side * 0.18, 1.42, 0.56, 0.11, "#2f80ed");
        animatedLimbs.push(createLimb(body, palette, side * 0.64, 1.18, 0, 0.38, 0.11, side * -0.2));
        animatedLimbs.push(createLimb(body, palette, side * 0.22, 0.42, 0, 0.34, 0.12, side * 0.04));
      }
    } else if (characters[kind].build === "teeth") {
      body.clear();
      const toothMat = material("#ffffff", 0.18, 0.05);
      const gumMat = material(palette.primary, 0.42, 0.06);
      // Lower & upper jaw gums (walking pair of teeth with legs!)
      addMesh(body, new THREE.SphereGeometry(0.56, 18, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), gumMat, [0, 1.16, 0], [1.1, 0.78, 1.05]);
      const upperJaw = addMesh(body, new THREE.SphereGeometry(0.56, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), gumMat, [0, 1.42, -0.04], [1.1, 0.78, 1.05]);
      upperJaw.rotation.x = -0.18;
      addMesh(body, new THREE.BoxGeometry(0.75, 0.14, 0.55), darkMat, [0, 1.24, 0.04]);
      for (const tx of [-0.34, -0.17, 0, 0.17, 0.34]) {
        addMesh(body, new THREE.BoxGeometry(0.13, 0.19, 0.12), toothMat, [tx, 1.19, 0.45]);
        addMesh(body, new THREE.BoxGeometry(0.13, 0.19, 0.12), toothMat, [tx, 1.38, 0.44]);
      }
      for (const side of [-1, 1]) {
        animatedLimbs.push(createLimb(body, { primary: palette.trim, trim: palette.accent, accent: palette.accent }, side * 0.24, 0.42, 0, 0.44, 0.14, side * 0.04));
        addMesh(body, new THREE.BoxGeometry(0.32, 0.16, 0.44), darkMat, [side * 0.24, 0.11, 0.1]);
      }
    }

    if (characters[kind].accessory === "cap") {
      addMesh(body, new THREE.SphereGeometry(0.41, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), trimMat, [0, 2.0, 0]);
      addMesh(body, new THREE.BoxGeometry(0.48, 0.06, 0.34), trimMat, [0, 2.04, 0.32]);
    } else if (characters[kind].accessory === "visor") {
      addMesh(body, new THREE.BoxGeometry(0.58, 0.14, 0.1), trimMat, [0, 1.95, 0.4]);
    } else if (characters[kind].accessory === "spiky") {
      for (const side of [-0.18, 0, 0.18]) {
        addMesh(body, new THREE.ConeGeometry(0.12, 0.36, 5), trimMat, [side, 2.38, 0]);
      }
    } else if (characters[kind].accessory === "bow") {
      for (const side of [-1, 1]) {
        addMesh(body, new THREE.ConeGeometry(0.14, 0.24, 5), trimMat, [side * 0.18, 2.34, 0]).rotation.z = side * Math.PI / 2;
      }
    } else if (characters[kind].accessory === "crown") {
      addMesh(body, new THREE.CylinderGeometry(0.24, 0.2, 0.22, 6), trimMat, [0, 2.36, 0]);
    }
  }

  if (kind === "entity") root.scale.setScalar(1.4 * FIGHTER_SCALE);
  else root.scale.setScalar(FIGHTER_SCALE);
  root.userData.baseScale = root.scale.clone();

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

// World-space size of the floating speech bubble sprite (canvas is 768x256)
const SPEECH_BUBBLE_WIDTH = 4.2;
const SPEECH_BUBBLE_HEIGHT = 1.4;
function createSpeechBubble(fighter, text) {
  if (fighter.speechBubble) {
    fighter.visual.remove(fighter.speechBubble);
    fighter.speechBubble.material.map.dispose();
    fighter.speechBubble.material.dispose();
  }
  const bubbleCanvas = document.createElement("canvas");
  bubbleCanvas.width = 768;
  bubbleCanvas.height = 256;
  const context = bubbleCanvas.getContext("2d");
  if (!context) throw new Error("Could not draw a fighter speech bubble.");
  context.fillStyle = "#fffdf7";
  context.strokeStyle = "#17152b";
  context.lineWidth = 12;
  context.beginPath();
  context.roundRect(18, 14, 732, 176, 48);
  context.fill();
  context.stroke();
  context.strokeStyle = characters[fighter.kind].palette.trim;
  context.lineWidth = 6;
  context.stroke();
  context.fillStyle = "#fffdf7";
  context.beginPath();
  context.moveTo(340, 186);
  context.lineTo(384, 244);
  context.lineTo(428, 186);
  context.closePath();
  context.fill();
  context.strokeStyle = "#17152b";
  context.lineWidth = 8;
  context.stroke();
  context.fillStyle = "#141126";
  context.font = "800 52px Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 384, 102, 680);
  const texture = new THREE.CanvasTexture(bubbleCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  bubble.scale.set(SPEECH_BUBBLE_WIDTH, SPEECH_BUBBLE_HEIGHT, 1);
  bubble.position.set(0, 3.25, 0);
  bubble.renderOrder = 15;
  fighter.visual.add(bubble);
  fighter.speechBubble = bubble;
  fighter.speechTimer = 4.8;
}

function updateSpeechBubble(fighter, delta, elapsed) {
  if (!fighter.speechBubble) return;
  fighter.speechTimer = Math.max(0, fighter.speechTimer - delta);
  if (fighter.speechTimer === 0) {
    fighter.visual.remove(fighter.speechBubble);
    fighter.speechBubble.material.map.dispose();
    fighter.speechBubble.material.dispose();
    fighter.speechBubble = null;
    return;
  }
  const scaleX = Math.max(0.2, fighter.visual.scale.x || 1);
  const scaleY = Math.max(0.2, fighter.visual.scale.y || 1);
  fighter.speechBubble.scale.set(SPEECH_BUBBLE_WIDTH / scaleX, SPEECH_BUBBLE_HEIGHT / scaleY, 1);
  fighter.speechBubble.position.y = (3.15 + Math.sin(elapsed * 3 + fighter.cpuThinkTime) * 0.08) / scaleY;
  fighter.speechBubble.material.opacity = Math.min(1, fighter.speechTimer / 0.4);
}

function updateFighterPreview(kind) {
  if (fighterPreview) {
    disposeObject(fighterPreview);
    arena.remove(fighterPreview);
  }
  fighterPreview = createFighterVisual(kind);
  const stand = new THREE.Group();
  addMesh(stand, new THREE.CylinderGeometry(0.85, 0.95, 0.12, 48), material("#1d2146", 0.35, 0.55), [0, 0.02, 0]);
  addMesh(stand, new THREE.TorusGeometry(0.86, 0.035, 8, 64), new THREE.MeshBasicMaterial({ color: "#8df8ff" }), [0, 0.09, 0]).rotation.x = Math.PI / 2;
  fighterPreview.add(stand);
  const compact = window.innerWidth <= 900;
  fighterPreview.scale.multiplyScalar(kind === "entity" ? 1.2 : compact ? 1.48 : 1.55);
  // Stand the selected fighter in the middle of the arena floor, which sits at about y=0.035
  fighterPreview.position.set(0, 0.04, 0);
  fighterPreview.userData.baseY = fighterPreview.position.y;
  fighterPreview.userData.preview = true;
  arena.add(fighterPreview);
  animateBlink(fighterPreview, clock.elapsedTime);
  const description = document.querySelector(`[data-fighter="${kind}"] .fighter-card-copy small`).textContent;
  document.querySelector("#preview-note").textContent = `${characters[kind].name} · ${description} · Special: ${characters[kind].specialName} — ${characters[kind].specialDescription}`;
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

function spawnRosterReinforcements() {
  const rosterPool = [
    ...regularCharacterIds.filter((kind) => kind !== selectedFighter && kind !== "entity" && isFighterUnlocked(kind)),
    ...starterCharacterIds.filter((kind) => kind !== selectedFighter && kind !== "entity")
  ];
  const roster = [...new Set(rosterPool)].slice(0, 4);
  for (const kind of roster) {
    const reinforcement = makeFighter(kind, fighters.length);
    reinforcement.stocks = 2;
    fighters.push(reinforcement);
  }
  hudDirty = true;
  updateHud();
}

function cpuLevelFor(fighter) {
  return fighter.kind === "entity" ? difficultyLevels.nightmare : difficultyLevels[cpuDifficulty];
}

function attachSword(visual, tier) {
  const sword = new THREE.Group();
  sword.position.set(0.62, 1.0, 0.12);
  sword.rotation.set(0.5, 0, -0.35);
  const bladeMat = new THREE.MeshStandardMaterial({ color: tier.color, emissive: tier.color, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.2 });
  addMesh(sword, new THREE.BoxGeometry(0.07, 1.1, 0.035), bladeMat, [0, 0.55, 0]);
  addMesh(sword, new THREE.BoxGeometry(0.3, 0.06, 0.06), material("#2a2233", 0.5, 0.3), [0, 0.02, 0]);
  visual.add(sword);
  return sword;
}

const fighterSpawns = [[-3.4, 1.1], [3.4, -0.6], [-3.4, -2.2], [3.4, 2.4], [-1.3, -3.9], [1.3, 3.9]];

function makeFighter(kind, index, spawnIndex = index) {
  const visual = createFighterVisual(kind);
  if (kind === "dinosaur") visual.scale.setScalar(1.12);
  const powerAura = addMesh(visual, new THREE.TorusGeometry(0.9, 0.045, 8, 24), new THREE.MeshBasicMaterial({ color: "#ffe57c", transparent: true, opacity: 0.9 }), [0, 1.18, 0], [1.35, 1, 1.35]);
  powerAura.rotation.x = Math.PI / 2;
  powerAura.visible = false;
  visual.userData.powerAura = powerAura;
  const palette = characters[kind].palette;
  if (kind === "galaxydragon") {
    const wingMat = material(palette.accent, 0.4, 0.1, { emissive: palette.accent, emissiveIntensity: 0.25 });
    for (const side of [-1, 1]) {
      const wing = addMesh(visual, new THREE.ConeGeometry(0.85, 1.5, 3), wingMat, [side * 0.55, 1.45, -0.25]);
      wing.rotation.z = side * 0.5;
    }
    const tail = addMesh(visual, new THREE.ConeGeometry(0.18, 1.2, 8), material(palette.primary, 0.36, 0.12), [0, 0.45, -0.85]);
    tail.rotation.x = Math.PI / 2;
  }
  const [x, z] = fighterSpawns[spawnIndex % fighterSpawns.length];
  visual.position.set(x, 0.08, z);
  arena.add(visual);
  // Swords are single-player only: online matches never equip one
  const swordTier = index === 0 && battleMode === "cpu" && isSignedIn() ? swordForWins(currentAccount().wins) : null;
  if (swordTier) attachSword(visual, swordTier);
  return {
    kind, visual, x, y: 0.08, z, swordTier, spawnIndex,
    vx: 0, vy: 0, vz: 0, facing: x < 0 ? 1 : -1,
    hp: 100, damage: 0, stocks: kind === "entity" ? 4 : 3, grounded: true, cooldown: 0, specialCooldown: 0,
    invulnerable: index === 0 && secretChallengeActive ? 2.5 : 0,
    attackPose: 0, kickPose: 0, poseTimer: 0, crouching: false, hitFlash: 0, slipTimer: 0, powerBoost: 0, respawn: 0, falling: false, eliminated: false,
    cpuThinkTime: Math.random() * 0.25, cpuStuckTime: 0, cpuDodgeTime: 0, cpuDodgeDir: 1, cpuLastX: x, cpuLastZ: z,
    speechBubble: null, speechTimer: 0
  };
}

function clearFighters() {
  clearExplore();
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
    { panel: "#player-four-panel", name: "#player-four-name", damage: "#player-four-damage", hp: "#player-four-hp", stocks: "#player-four-stocks" },
    { panel: "#player-five-panel", name: "#player-five-name", damage: "#player-five-damage", hp: "#player-five-hp", stocks: "#player-five-stocks" },
    { panel: "#player-six-panel", name: "#player-six-name", damage: "#player-six-damage", hp: "#player-six-hp", stocks: "#player-six-stocks" }
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
    const stocks = THREE.MathUtils.clamp(fighter.stocks, 0, maxStocks);
    document.querySelector(selectors.stocks).textContent = `${"● ".repeat(stocks)}${"○ ".repeat(maxStocks - stocks)}`.trim();
    document.querySelector(selectors.stocks).setAttribute("aria-label", `${stocks} stocks remaining`);
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
  const specialKeys = ["K", "Shift", "U", "Numpad 2"];
  const localFighters = fighters.length
    ? fighters.map((fighter) => fighter.kind)
    : [selectedFighter, ...regularCharacterIds.filter((kind) => kind !== selectedFighter).slice(0, 3)];
  const localSpecials = localFighters.map((kind, index) => {
    return `P${index + 1} ${characters[kind].specialName} (${specialKeys[index]})`;
  }).join(" · ");
  const controls = battleMode === "explore"
    ? "Flight: A/D or ←/→ turn · Q/E strafe · W/↑ thrust · S/↓ reverse · R/F pitch · Space rise · C descend · Shift or K boost · J fire · Alt+A/D orbit camera · Alt+W/S zoom · Drag mouse to orbit · Wheel to zoom · Touch: joystick to turn/thrust, buttons to rise, fire, boost or descend · find Entity.exe on the minimap"
    : battleMode === "split"
      ? "Split-screen 1v1: P1 WASD move · Space jump · J fight · K special | P2 Arrows move · Right Ctrl jump · Enter fight · Right Shift special"
      : battleMode === "cpu"
        ? `Solo vs. 5 CPUs: WASD move · Space jump · J fight · K: ${characters[selectedFighter].specialName}`
        : `Local 4-player: P1 WASD/J · P2 Arrows/Enter · P3 TFGH/Y · P4 Numpad · Crouch: C / R-Ctrl / B / Num3 · Specials: ${localSpecials}`;
  document.querySelector("#controls-hint").textContent = controls;
  document.querySelector("#match-control-hint").textContent = controls;
}

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

function setExploreTouchControls(active) {
  const labels = [
    ["Space", "ASCEND", "Ascend", "JUMP", "Jump"],
    ["KeyJ", "FIRE", "Fire", "FIGHT", "Fight / strike"],
    ["KeyK", "BOOST", "Boost", "SPECIAL", "Special attack"],
    ["KeyC", "DESCEND", "Descend", "CROUCH", "Crouch"]
  ];
  for (const [key, exploreLabel, exploreAria, battleLabel, battleAria] of labels) {
    const button = document.querySelector(`.touch-controls button[data-key="${key}"]`);
    button.textContent = active ? exploreLabel : battleLabel;
    button.setAttribute("aria-label", active ? exploreAria : battleAria);
  }
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
  if (battleMode === "explore") {
    clearInputState();
    startExplore();
    return;
  }
  if (randomizeArena && !hiddenRealmActive) {
    arenaIndex = Math.floor(Math.random() * arenaCount);
    createArena(arenaIndex);
    updateArenaLabel();
  }
  clearInputState();
  clearFighters();
  const opponentPool = regularCharacterIds.filter((kind) => kind !== selectedFighter && isFighterUnlocked(kind));
  const fallbackPool = starterCharacterIds.filter((kind) => kind !== selectedFighter);
  const activePool = opponentPool.length >= 5 ? opponentPool : [...opponentPool, ...fallbackPool];
  const remotes = battleMode === "online" ? onlineRemotes : [];
  const fighterCount = remotes.length
    ? remotes.length + 1
    : secretChallengeActive || battleMode === "split" || battleMode === "online" ? 2 : battleMode === "cpu" ? 6 : 4;
  fighters.push(makeFighter(selectedFighter, 0, battleMode === "online" ? onlineSlot : 0));
  for (let index = 1; index < fighterCount; index += 1) {
    const remote = remotes[index - 1];
    const kind = remote
      ? (characters[remote.kind] ? remote.kind : "bumble")
      : index === 1 && opponentOverride
        ? opponentOverride
        : activePool[(index - 1) % activePool.length];
    const fighter = makeFighter(kind, index, remote ? remote.slot : index);
    if (remote) {
      fighter.remote = true;
      fighter.remoteSlot = remote.slot;
      fighter.remoteTarget = null;
      applyOnlineSkin(fighter, remote.skin);
    }
    fighters.push(fighter);
  }
  const openingLines = {
    bumble: "Let's buzz!",
    robot: "Systems online!",
    nova: "Catch me!",
    titan: "Stand your ground!",
    glitch: "Victory.exe!",
    tide: "Ride the wave!",
    frog: "Ready to hop!",
    dinosaur: "Raaawr!",
    monkey: "Ooh ooh aah!",
    lizard: "Stay cool!"
  };
  fighters.forEach((fighter) => {
    createSpeechBubble(fighter, openingLines[fighter.kind] || characters[fighter.kind].openingLine || "Let's fight!");
  });
  const portalEntryDuration = 1.45;
  fighters.forEach((fighter, index) => {
    fighter.portalDelay = fighter.spawnIndex * 0.42;
    fighter.portalEntry = portalEntryDuration;
    fighter.portalEntryDuration = portalEntryDuration;
    fighter.portalEntryTarget = { x: fighter.x, z: fighter.z };
    fighter.x = 0;
    fighter.y = 8.4;
    fighter.z = -5.15;
    fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
    fighter.visual.rotation.set(0, 0, 0);
    fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(0.24);
  });
  camera.position.set(0, 7.2, 10.5);
  camera.lookAt(0, 3.6, -4.2);
  portalIntroActive = true;
  matchTime = 180;
  document.querySelector("#match-clock").textContent = "3:00";
  specialCameraFocus = null;
  displayedSecond = -1;
  matchActive = true;
  matchEnded = false;
  arena.visible = true;
  hudDirty = true;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#arena-strip").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#return-through-portal").hidden = true;
  document.querySelector("#battle-hud").hidden = false;
  document.querySelector("#touch-controls").hidden = !isTouchDevice;
  document.querySelector("#battle-hud").classList.remove("explore-hud");
  setExploreTouchControls(false);
  updateArenaLabel();
  document.querySelector(".battle-hud").classList.toggle("six-fighter-hud", fighters.length > 4);
  for (let index = 1; index < 6; index += 1) {
    const slot = ["one", "two", "three", "four", "five", "six"][index];
    document.querySelector(`#player-${slot}-panel`).hidden = index >= fighters.length;
    document.querySelector(`#player-${slot}-label`).textContent =
      remotes[index - 1] ? remotes[index - 1].username : battleMode === "cpu" ? `CPU ${index}` : `PLAYER ${index + 1}`;
  }
  document.querySelector("#battle-status").textContent = "PORTAL ARRIVAL!";
  document.querySelector("#special-status").hidden = false;
  updateControlsHint();
  updateHud();
  document.querySelector("#screen-reader-status").textContent =
    `The portal opens. ${fighters.map((fighter) => `${characters[fighter.kind].name} enters the arena`).join(". ")}.`;
  setMusicScene("battle", fighters[1]?.kind || null);
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
  leaveMatch();
  onlineRemotes = [];
  const enteringFromTitle = titleScreenActive;
  titleScreenActive = false;
  selectionScreenActive = true;
  titlePlanets.visible = true;
  clearInputState();
  restoreFromSecretRealm();
  if (enteringFromTitle) createArena(arenaIndex);
  arena.position.set(0, 0, 0);
  matchActive = false;
  document.querySelector("#battle-hud").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = false;
  document.querySelector("#arena-strip").hidden = false;
  clearFighters();
  updateFighterPreview(selectedFighter);
  setMusicScene("select");
}

function showPortal() {
  titleScreenActive = true;
  selectionScreenActive = false;
  titlePlanets.visible = true;
  clearInputState();
  restoreFromSecretRealm();
  arena.visible = false;
  // The title camera orbits the arena's origin, so a leftover galaxy platform offset would push it away from the planets
  arena.position.set(0, 0, 0);
  matchActive = false;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#arena-strip").hidden = true;
  document.querySelector("#battle-hud").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#portal-screen").hidden = false;
  clearFighters();
  setMusicScene("title");
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
      refreshUnlockUI();
      unlockMessage = saved
        ? " Entity.exe skin unlocked!"
        : " Entity.exe skin unlocked for this visit; embedded storage is blocked, so it will not persist after reload.";
    }
  } else {
    const bonusMultiplier = winner === fighters[0] ? 1.5 : 0.45;
    const dropped = rollRareUnlock(bonusMultiplier);
    if (dropped) {
      unlockMessage = ` RARE UNLOCK! ${characters[dropped].name} (${characters[dropped].rarity}) joined your roster!`;
    }
  }
  document.querySelector("#winner-title").textContent = winner ? `${characters[winner.kind].name.toUpperCase()} WINS` : "TIME!";
  document.querySelector("#winner-message").textContent = winner
    ? `${characters[winner.kind].name} takes the arena. ${reason}${unlockMessage}`
    : reason;
  document.querySelector("#match-end").hidden = false;
  if (battleMode === "online") reportOnlineResult(winner === fighters[0]);
  document.querySelector("#screen-reader-status").textContent = document.querySelector("#winner-message").textContent;
}

function createProjectileVisual({ color, emissive, radius, shape, hazard }, position) {
  const geometry = shape === "star"
    ? new THREE.OctahedronGeometry(radius, 1)
    : shape === "wave"
      ? new THREE.TorusGeometry(radius * 1.2, radius * 0.24, 8, 24)
      : shape === "banana"
        ? new THREE.TorusGeometry(radius * 1.05, radius * 0.32, 8, 16, Math.PI * 1.15)
        : new THREE.SphereGeometry(radius, 16, 12);
  const projectile = addMesh(arena, geometry, new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: hazard ? 0.55 : 2.3, roughness: 0.2
  }), position);
  if (!hazard) {
    const halo = addMesh(projectile, new THREE.TorusGeometry(radius * 1.45, 0.025, 8, 24), new THREE.MeshBasicMaterial({ color }), [0, 0, 0]);
    halo.rotation.x = Math.PI / 2;
  } else {
    projectile.rotation.x = Math.PI / 2;
  }
  projectile.userData.spin = 4;
  return projectile;
}

function launchProjectile(fighter, options = {}) {
  const {
    color = "#ffe36f", emissive = "#ff9d35", radius = 0.27, speed = 13,
    life = 1.5, damage = 9, force = 4.2, vy = null, vz = 0, offsetZ = 0,
    shape = "sphere", hazard = false, boomerang = false, homing = false
  } = options;
  const startY = hazard ? fighter.y + 0.85 : fighter.y + 1.35;
  const projectile = createProjectileVisual({ color, emissive, radius, shape, hazard },
    [fighter.x + fighter.facing * 0.8, startY, fighter.z + offsetZ]);
  const velocityY = vy !== null ? vy : (hazard ? 4.2 : 0);
  projectiles.push({
    mesh: projectile,
    owner: fighter,
    speed,
    vx: fighter.facing * speed,
    vy: velocityY,
    vz,
    life,
    damage,
    force,
    hitRadius: radius + 0.55,
    hazard,
    boomerang,
    homing,
    armTimer: hazard ? 0.45 : 0,
    power: characters[fighter.kind].power * (fighter.powerBoost > 0 ? 1.7 : 1)
  });
  if (battleMode === "online" && !fighter.remote) {
    sendOnlineProjectile({
      x: projectile.position.x, y: projectile.position.y, z: projectile.position.z,
      vx: fighter.facing * speed, vy: velocityY, vz, speed, life, radius, shape, color, emissive, hazard, boomerang, homing
    });
  }
}

function spawnRemoteProjectile(fighter, data) {
  const mesh = createProjectileVisual(data, [data.x, data.y, data.z]);
  projectiles.push({
    mesh, owner: fighter, vx: data.vx, vy: data.vy, vz: data.vz, speed: data.speed, life: data.life,
    hazard: data.hazard, boomerang: data.boomerang, homing: data.homing,
    armTimer: 0, visualOnly: true
  });
}

const collisionCenter = new THREE.Vector3();
const projectileStart = new THREE.Vector3();

function spawnAbilityRing(fighter, color, duration = 0.45) {
  const effect = new THREE.Group();
  effect.position.set(fighter.x, fighter.y + 0.12, fighter.z);
  const ring = addMesh(effect, new THREE.TorusGeometry(0.55, 0.09, 8, 24), new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.9, depthWrite: false
  }), [0, 0, 0]);
  ring.rotation.x = Math.PI / 2;
  ring.userData.abilityRing = true;
  arena.add(effect);
  effect.userData.duration = duration;
  effect.userData.remaining = duration;
  hitEffects.push(effect);
  cameraShake = Math.max(cameraShake, 0.24);
}

function applyAreaAbility(fighter, { radius, damage, force, color, pull = false }) {
  const boost = fighter.powerBoost > 0 ? 1.7 : 1;
  spawnAbilityRing(fighter, color);
  for (const target of fighters) {
    if (target === fighter || target.eliminated || target.respawn > 0) continue;
    const dx = target.x - fighter.x;
    const dz = target.z - fighter.z;
    if (Math.hypot(dx, dz) > radius || Math.abs(target.y - fighter.y) > 2.2) continue;
    if (!hitTarget(fighter, target, damage * characters[fighter.kind].power * boost, force) || target.remote) continue;
    const toward = pull ? -1 : 1;
    target.vx += Math.sign(dx || fighter.facing) * force * 0.45 * toward;
    target.vz += Math.sign(dz || 1) * force * 0.35 * toward;
  }
}

function spawnTongueEffect(fighter, target) {
  const start = new THREE.Vector3(fighter.x + fighter.facing * 0.6, fighter.y + 1.35, fighter.z);
  const end = new THREE.Vector3(target.x, target.y + 1.3, target.z);
  const direction = end.clone().sub(start);
  const effect = new THREE.Group();
  const tongue = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, direction.length(), 8),
    new THREE.MeshBasicMaterial({ color: "#ff6d99", transparent: true, opacity: 0.95 })
  );
  tongue.position.copy(start).add(end).multiplyScalar(0.5);
  tongue.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  tongue.userData.fade = true;
  effect.add(tongue);
  arena.add(effect);
  effect.userData.duration = 0.24;
  effect.userData.remaining = 0.24;
  hitEffects.push(effect);
}

function spawnFireBreath(fighter) {
  const effect = new THREE.Group();
  const sign = fighter.facing;
  effect.position.set(fighter.x + sign * 2.15, fighter.y + 1.35, fighter.z);
  const outerFlame = addMesh(effect, new THREE.ConeGeometry(1.05, 3.8, 14), new THREE.MeshBasicMaterial({
    color: "#ff6338", transparent: true, opacity: 0.78, depthWrite: false
  }), [0, 0, 0]);
  outerFlame.rotation.z = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
  outerFlame.userData.fade = true;
  const innerFlame = addMesh(effect, new THREE.ConeGeometry(0.52, 2.8, 12), new THREE.MeshBasicMaterial({
    color: "#ffd166", transparent: true, opacity: 0.9, depthWrite: false
  }), [sign * 0.12, 0, 0]);
  innerFlame.rotation.z = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
  innerFlame.userData.fade = true;
  arena.add(effect);
  effect.userData.duration = 0.42;
  effect.userData.remaining = 0.42;
  hitEffects.push(effect);
  cameraShake = Math.max(cameraShake, 0.2);

  const boost = fighter.powerBoost > 0 ? 1.7 : 1;
  for (const target of fighters) {
    if (target === fighter || target.eliminated || target.respawn > 0) continue;
    const dx = target.x - fighter.x;
    const distance = dx * sign;
    const width = 0.55 + Math.max(0, distance) * 0.3;
    if (distance <= 0.35 || distance > 4.5 || Math.abs(target.z - fighter.z) > width || Math.abs(target.y - fighter.y) > 1.8 * FIGHTER_SCALE) continue;
    hitTarget(fighter, target, 11 * characters[fighter.kind].power * boost, 5.8);
  }
}

function spawnSkyUppercut(fighter, color, damage, force, lift = 10) {
  fighter.vy = lift;
  fighter.vx = fighter.facing * 5.2;
  fighter.grounded = false;
  spawnAbilityRing(fighter, color, 0.38);
  const target = nearestOpponent(fighter);
  if (target && Math.hypot(target.x - fighter.x, target.z - fighter.z) < 2.9 && Math.abs(target.y - fighter.y) < 2.6) {
    hitTarget(fighter, target, damage, force);
    target.vy = Math.max(target.vy, lift * 0.92);
    target.grounded = false;
  }
}

function spawnShieldBurst(fighter, color, healAmount, radius, damage, force) {
  fighter.invulnerable = Math.max(fighter.invulnerable, 1.35);
  fighter.hp = Math.min(100, fighter.hp + healAmount);
  fighter.damage = Math.max(0, fighter.damage - healAmount * 0.6);
  hudDirty = true;
  applyAreaAbility(fighter, { radius, damage, force, color });
}

function spawnMeteorDrop(fighter, color, damage, force) {
  fighter.vy = 11;
  fighter.vx = fighter.facing * 7.2;
  fighter.grounded = false;
  launchProjectile(fighter, {
    shape: "star",
    color,
    emissive: color,
    radius: 0.46,
    speed: 9.5,
    vy: -4.2,
    life: 1.4,
    damage,
    force
  });
  spawnAbilityRing(fighter, color, 0.4);
}

function launchProjectileAt(fighter, pose, options) {
  launchProjectile({ ...fighter, ...pose }, options);
  projectiles[projectiles.length - 1].owner = fighter;
}

function spawnAnvilDrop(fighter, color, damage, force) {
  const target = nearestOpponent(fighter) || fighter;
  launchProjectileAt(fighter, { x: target.x, y: target.y + 0.9, z: target.z }, { shape: "star", color, emissive: color, radius: 0.5, speed: 0, vy: -6, life: 0.6, damage, force });
  spawnAbilityRing(fighter, color, 0.35);
}

function spawnBoulderRoll(fighter, color, damage, force) {
  launchProjectile(fighter, { shape: "sphere", color, emissive: color, radius: 0.72, speed: 5.2, life: 3, damage, force });
  spawnAbilityRing(fighter, color, 0.4);
}

function spawnGroundPound(fighter, color, damage, force) {
  fighter.vy = 7;
  fighter.grounded = false;
  [-1, 1].forEach((side) => launchProjectileAt(fighter, { facing: side }, { shape: "wave", color, emissive: color, radius: 0.46, speed: 9, life: 1.3, damage, force }));
  spawnAbilityRing(fighter, color, 0.4);
}

function spawnStarShower(fighter, color, damage, force) {
  const target = nearestOpponent(fighter) || fighter;
  [-1.2, -0.6, 0, 0.6, 1.2].forEach((offset) => launchProjectileAt(fighter, { x: target.x, y: target.y + 2.2, z: target.z + offset }, { shape: "star", color, emissive: color, radius: 0.26, speed: 0, vy: -6, life: 0.6, damage, force }));
  spawnAbilityRing(fighter, color, 0.35);
}

function spawnVoltChain(fighter, color, damage, force) {
  spawnAbilityRing(fighter, color, 0.3);
  const first = nearestOpponent(fighter);
  if (!first || Math.hypot(first.x - fighter.x, first.z - fighter.z) > 5) return;
  hitTarget(fighter, first, damage, force);
  let second = null;
  let bestDistance = 4.5;
  for (const target of fighters) {
    if (target === fighter || target === first || target.eliminated || target.respawn > 0) continue;
    const distance = Math.hypot(target.x - first.x, target.z - first.z);
    if (distance < bestDistance) {
      bestDistance = distance;
      second = target;
    }
  }
  if (second) {
    spawnAbilityRing(second, color, 0.3);
    hitTarget(fighter, second, damage * 0.7, force);
  }
}

function spawnChargeDash(fighter, color, damage, force, speed) {
  fighter.vx = fighter.facing * speed;
  fighter.invulnerable = Math.max(fighter.invulnerable, 0.7);
  spawnAbilityRing(fighter, color, 0.34);
  const target = nearestOpponent(fighter);
  if (target && Math.hypot(target.x - fighter.x, target.z - fighter.z) < 3.6) hitTarget(fighter, target, damage, force);
}

function spawnFlameRing(fighter, color, damage, force) {
  [-1, -0.5, 0, 0.5, 1].forEach((s) => launchProjectile(fighter, { shape: "sphere", color, emissive: "#ff7a1a", radius: 0.22, speed: 7.5, life: 1.1, damage, force, vz: s * 5 }));
  spawnAbilityRing(fighter, color, 0.4);
}

function spawnRepairPulse(fighter, color, healAmount) {
  fighter.invulnerable = Math.max(fighter.invulnerable, 1.6);
  fighter.hp = Math.min(100, fighter.hp + healAmount);
  fighter.damage = Math.max(0, fighter.damage - healAmount);
  hudDirty = true;
  spawnAbilityRing(fighter, color, 0.5);
  for (const target of fighters) {
    if (target === fighter || target.eliminated || target.respawn > 0) continue;
    if (Math.hypot(target.x - fighter.x, target.z - fighter.z) > 3.2) continue;
    target.vx += (Math.sign(target.x - fighter.x) || 1) * 6;
    target.vy = Math.max(target.vy, 3);
    target.grounded = false;
  }
}

function spawnWallWave(fighter, color, damage, force) {
  [-1.2, -0.6, 0, 0.6, 1.2].forEach((offsetZ) => launchProjectile(fighter, { shape: "wave", color, emissive: color, radius: 0.5, speed: 6, life: 2.6, damage, force, offsetZ }));
  spawnAbilityRing(fighter, color, 0.35);
}

function spawnPogoBounce(fighter, color, damage, force) {
  fighter.vy = 13;
  fighter.grounded = false;
  fighter.invulnerable = Math.max(fighter.invulnerable, 0.8);
  applyAreaAbility(fighter, { radius: 2.6, damage, force, color });
}

function spawnHookGrab(fighter, color, damage, force) {
  spawnAbilityRing(fighter, color, 0.3);
  const target = nearestOpponent(fighter);
  if (!target || Math.hypot(target.x - fighter.x, target.z - fighter.z) > 6) return;
  target.x = THREE.MathUtils.clamp(fighter.x + fighter.facing * 1.6, -floorRadius + 1, floorRadius - 1);
  target.visual.position.set(target.x, target.y, target.z);
  hitTarget(fighter, target, damage, force);
}

function spawnJellySplash(fighter, color, damage, force) {
  fighter.vy = 6;
  fighter.grounded = false;
  applyAreaAbility(fighter, { radius: 4.5, damage, force, color });
}

const uniqueSpecialMechanics = {
  bumble: (f) => launchProjectile(f, { color: "#ffe36f", emissive: "#ff9d35", speed: 15, damage: 10, force: 4.8 }),
  robot: (f, b, p) => {
    f.vx = f.facing * 14.5;
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 3.4) hitTarget(f, t, 13 * p * b, 6.8);
    spawnAbilityRing(f, "#53e9f4", 0.32);
  },
  nova: (f) => [-1, 0, 1].forEach((s) => launchProjectile(f, { shape: "star", color: "#ff9fea", emissive: "#bf5aff", radius: 0.22, speed: 11, life: 1.35, damage: 6.5, force: 3.6, vz: s * 2.8, offsetZ: s * 0.13 })),
  titan: (f) => applyAreaAbility(f, { radius: 3.9, damage: 14.5, force: 7.5, color: "#ff8b4c" }),
  glitch: (f, b, p) => {
    const t = nearestOpponent(f);
    spawnAbilityRing(f, "#ff5dcc", 0.3);
    if (t) {
      f.x = THREE.MathUtils.clamp(t.x - t.facing * 1.2, -floorRadius + 1, floorRadius - 1);
      f.z = THREE.MathUtils.clamp(t.z, -floorRadius + 1, floorRadius - 1);
      f.facing = Math.sign(t.x - f.x) || f.facing;
      f.visual.position.set(f.x, f.y, f.z);
      spawnAbilityRing(f, "#ff5dcc", 0.3);
      if (Math.hypot(t.x - f.x, t.z - f.z) < 2.2) hitTarget(f, t, 13 * p * b, 5.7);
    } else f.vx = f.facing * 9;
  },
  tide: (f) => launchProjectile(f, { shape: "wave", color: "#80f8e6", emissive: "#38c9ff", radius: 0.62, speed: 8.5, life: 1.7, damage: 13, force: 7.4 }),
  frog: (f, b, p) => {
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 5.6) {
      spawnTongueEffect(f, t);
      hitTarget(f, t, 10 * p * b, 3.6);
      t.vx += Math.sign(f.x - t.x) * 4.4;
    }
  },
  dinosaur: (f) => spawnFireBreath(f),
  monkey: (f) => launchProjectile(f, { shape: "banana", color: "#ffe135", emissive: "#b89600", radius: 0.34, speed: 6.4, life: 7, damage: 6, force: 4.5, hazard: true }),
  lizard: (f, b, p) => {
    const t = nearestOpponent(f);
    f.vx = f.facing * 6;
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 5.8) {
      spawnTongueEffect(f, t);
      hitTarget(f, t, 11.5 * p * b, 4.8);
    }
  },
  ghost: (f) => {
    f.invulnerable = Math.max(f.invulnerable, 1.1);
    f.vy = 6.5;
    applyAreaAbility(f, { radius: 3.6, damage: 11, force: 5.2, color: "#7ff7ff" });
  },
  mrstar: (f) => [-2, -1, 0, 1, 2].forEach((s) => launchProjectile(f, { shape: "star", color: "#ffd646", emissive: "#ff9b3d", radius: 0.2, speed: 12, life: 1.4, damage: 5.5, force: 3.2, vz: s * 1.9 })),
  stubby: (f, b, p) => spawnPogoBounce(f, "#ff9642", 9 * p * b, 4.6),
  stickman: (f) => launchProjectile(f, { color: "#72e8ff", emissive: "#ffcf66", radius: 0.24, speed: 13.5, life: 1.9, damage: 10.5, force: 4.5, boomerang: true }),
  larry: (f, b, p) => {
    f.vx = f.facing * 13;
    f.vy = 4.2;
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 3.2) hitTarget(f, t, 12.5 * p * b, 6.2);
    spawnAbilityRing(f, "#74d4ff", 0.32);
  },
  bob: (f) => { f.vy = 7.5; applyAreaAbility(f, { radius: 4.2, damage: 15, force: 7.8, color: "#ffaa44" }); },
  michael: (f) => launchProjectile(f, { color: "#8ef0ff", emissive: "#ff5c8d", radius: 0.2, speed: 19, life: 1.1, damage: 12, force: 5.6 }),
  rand: (f) => [-1, 0, 1].forEach((s) => launchProjectile(f, { color: "#ff4d6d", emissive: "#ffd166", radius: 0.26, speed: 10.5, vy: 2.2, vz: s * 3.1, life: 1.4, damage: 7.5, force: 4.2 })),
  robert: (f, b, p) => spawnRepairPulse(f, "#d4e6ff", 18 * p * b),
  bopper: (f) => spawnMeteorDrop(f, "#ffe28a", 14, 7.0),
  pewstickman: (f) => [0, 0.18].forEach((oz, i) => launchProjectile(f, { color: "#4cf2ff", emissive: "#ff59b8", radius: 0.18, speed: 18 + i * 3, life: 1.2, damage: 7.5, force: 4.0, offsetZ: oz })),
  liz: (f, b, p) => spawnStarShower(f, "#ffe0f4", 11.5 * p * b, 5.8),
  cindy: (f) => launchProjectile(f, { shape: "star", color: "#fff0a8", emissive: "#ff7ad9", radius: 0.3, speed: 9.5, life: 2.2, damage: 11.5, force: 5.0, homing: true }),
  munchy: (f, b, p) => {
    f.hp = Math.min(100, f.hp + 12);
    hudDirty = true;
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 5.2) {
      spawnTongueEffect(f, t);
      hitTarget(f, t, 12 * p * b, 4.2);
    }
  },
  cryptokin: (f) => applyAreaAbility(f, { radius: 4.8, damage: 13.5, force: 6.0, color: "#b774ff", pull: true }),
  fred: (f, b, p) => {
    f.vx = f.facing * 11;
    spawnAbilityRing(f, "#63b3ff", 0.35);
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 3.2) hitTarget(f, t, 14 * p * b, 6.4);
  },
  alieny: (f) => launchProjectile(f, { color: "#c7ff9c", emissive: "#7d5cff", radius: 0.34, speed: 8.8, life: 2.4, damage: 12, force: 5.5, homing: true }),
  dops: (f) => launchProjectile(f, { shape: "wave", color: "#d4fff8", emissive: "#4cd9c4", radius: 0.56, speed: 10.5, life: 1.6, damage: 12.5, force: 6.8 }),
  cartoonguy: (f) => spawnAnvilDrop(f, "#ffffff", 12, 7.5),
  lostapple: (f) => spawnMeteorDrop(f, "#e03131", 13.5, 6.8),
  jim: (f) => launchProjectile(f, { shape: "wave", color: "#93c5fd", emissive: "#3b82f6", radius: 0.52, speed: 9.2, life: 1.8, damage: 11.5, force: 6.2 }),
  immy: (f, b, p) => {
    f.vy = 7.8;
    f.vx = f.facing * 11.5;
    spawnAbilityRing(f, "#5ff2ff", 0.34);
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 3.2) hitTarget(f, t, 12 * p * b, 5.6);
  },
  pixelpal: (f) => [0, 1].forEach((i) => launchProjectile(f, { color: i ? "#ff6ec7" : "#7cf7ff", emissive: "#7c5cff", radius: 0.24, speed: 13 + i * 2, life: 1.4, damage: 7, force: 3.8, offsetZ: (i - 0.5) * 0.4 })),
  flameknight: (f, b, p) => spawnFlameRing(f, "#ffb347", 9 * p * b, 5.0),
  frostbite: (f) => {
    launchProjectile(f, { shape: "wave", color: "#e6fbff", emissive: "#38b6ff", radius: 0.58, speed: 8.2, life: 1.8, damage: 11, force: 5.2 });
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 4.2) t.slipTimer = 0.65;
  },
  shadowcat: (f, b, p) => {
    const t = nearestOpponent(f);
    if (t) {
      f.x = THREE.MathUtils.clamp(t.x - t.facing * 1.1, -floorRadius + 1, floorRadius - 1);
      f.z = THREE.MathUtils.clamp(t.z, -floorRadius + 1, floorRadius - 1);
      f.visual.position.set(f.x, f.y, f.z);
      hitTarget(f, t, 14 * p * b, 6.2);
    }
    spawnAbilityRing(f, "#c77dff", 0.3);
  },
  thunderbolt: (f) => {
    f.vx = f.facing * 16.5;
    spawnAbilityRing(f, "#ffd43b", 0.28);
    applyAreaAbility(f, { radius: 3.2, damage: 11.5, force: 5.8, color: "#4dabf7" });
  },
  captainclaw: (f, b, p) => spawnHookGrab(f, "#ff8c42", 15 * p * b, 7.0),
  astroduck: (f) => [-1, 1].forEach((s) => launchProjectile(f, { shape: "star", color: "#ffd95e", emissive: "#ff8533", radius: 0.28, speed: 11.5, life: 1.7, damage: 8.5, force: 4.5, vz: s * 2.2, boomerang: true })),
  cyberninja: (f) => launchProjectile(f, { shape: "star", color: "#38f2af", emissive: "#ff477e", radius: 0.26, speed: 17, life: 1.3, damage: 13, force: 5.8 }),
  slimeking: (f) => { f.vy = 9.5; applyAreaAbility(f, { radius: 4.4, damage: 13.5, force: 7.2, color: "#4cd964" }); },
  rocketpup: (f) => launchProjectile(f, { color: "#ff595e", emissive: "#fff0d6", radius: 0.3, speed: 12, life: 2.2, damage: 12, force: 5.8, homing: true }),
  magmaorb: (f) => spawnMeteorDrop(f, "#ff5722", 12, 6.4),
  clockwork: (f) => launchProjectile(f, { shape: "wave", color: "#fff0bd", emissive: "#d49b4b", radius: 0.35, speed: 12.5, life: 2.0, damage: 11.5, force: 5.2, boomerang: true }),
  cosmicowl: (f) => [-1, 0, 1].forEach((s) => launchProjectile(f, { shape: "star", color: "#ffe28a", emissive: "#7c65b8", radius: 0.24, speed: 10.5, life: 2.0, damage: 7.5, force: 4.0, vz: s * 2.1, homing: s === 0 })),
  neonpanda: (f, b, p) => spawnShieldBurst(f, "#5bf2ff", 14, 4.0, 13 * p * b, 7.0),
  piratebones: (f, b, p) => {
    f.vx = f.facing * 12;
    spawnAbilityRing(f, "#ff4d6d", 0.35);
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 3.4) hitTarget(f, t, 14.5 * p * b, 6.8);
  },
  cactusjack: (f) => [-1, 0, 1].forEach((s) => launchProjectile(f, { color: "#d8f3dc", emissive: "#3da35d", radius: 0.2, speed: 15, life: 1.2, damage: 7.5, force: 4.2, vz: s * 2.4 })),
  bubblepop: (f) => launchProjectile(f, { color: "#74e8ff", emissive: "#ff8ef2", radius: 0.48, speed: 7.5, life: 2.4, damage: 11.5, force: 6.5, homing: true }),
  laserbear: (f) => launchProjectile(f, { color: "#ff5252", emissive: "#ffe066", radius: 0.32, speed: 20, life: 1.0, damage: 15, force: 7.2 }),
  turbosnail: (f) => launchProjectile(f, { shape: "wave", color: "#ff9e5e", emissive: "#66e4ee", radius: 0.42, speed: 14, life: 1.9, damage: 12, force: 6.0, boomerang: true }),
  voltbunny: (f, b, p) => spawnVoltChain(f, "#5cf2ff", 12 * p * b, 5.8),
  goldenknight: (f, b, p) => spawnChargeDash(f, "#ffd43b", 14.5 * p * b, 7.4, 13),
  cheesewizard: (f) => spawnBoulderRoll(f, "#ffd93b", 11, 6.8),
  discoagent: (f) => [-2, 0, 2].forEach((s) => launchProjectile(f, { shape: "star", color: "#d966ff", emissive: "#5cf2ff", radius: 0.25, speed: 12, life: 1.6, damage: 8, force: 4.4, vz: s * 1.8 })),
  ironbeaver: (f, b, p) => spawnGroundPound(f, "#e6ccb2", 13 * p * b, 6.2),
  starjelly: (f) => spawnJellySplash(f, "#7cf2ff", 12.5, 6.0),
  cometkid: (f) => spawnMeteorDrop(f, "#ff884d", 14.5, 7.2),
  spookybat: (f, b, p) => {
    f.vy = 8.0;
    f.vx = f.facing * 12;
    spawnAbilityRing(f, "#ff5c8a", 0.32);
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 3.4) hitTarget(f, t, 12.5 * p * b, 5.5);
  },
  megatoad: (f, b, p) => {
    f.vy = 8.5;
    const t = nearestOpponent(f);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 6.2) {
      spawnTongueEffect(f, t);
      hitTarget(f, t, 13 * p * b, 5.2);
      t.vx += Math.sign(f.x - t.x) * 5.0;
    }
  },
  galaxydragon: (f, b, p) => {
    spawnFireBreath(f);
    [-1, 0, 1].forEach((s) => launchProjectile(f, { color: "#ff7a1a", emissive: "#ffd166", radius: 0.3, speed: 9, life: 1.4, damage: 7 * p * b, force: 5, vz: s * 1.5 }));
  },
  omegabot: (f) => {
    applyAreaAbility(f, { radius: 4.6, damage: 12, force: 5.5, color: "#66e4ee", pull: true });
    launchProjectile(f, { color: "#ff3b30", emissive: "#66e4ee", radius: 0.34, speed: 18, life: 1.3, damage: 14, force: 6.8 });
  },
  sandpiper: (f, b, p) => applyAreaAbility(f, { radius: 3.4, damage: 9 * p * b, force: 4.6, color: "#f5c76a", pull: true }),
  frostling: (f, b, p) => applyAreaAbility(f, { radius: 3.6, damage: 10 * p * b, force: 6.0, color: "#9fe8ff" }),
  wraith: (f, b, p) => {
    const t = nearestOpponent(f);
    f.invulnerable = Math.max(f.invulnerable, 0.6);
    f.vx = (t ? Math.sign(t.x - f.x) || f.facing : f.facing) * 13;
    spawnAbilityRing(f, "#ff4fa3", 0.3);
    if (t && Math.hypot(t.x - f.x, t.z - f.z) < 2.6) hitTarget(f, t, 12 * p * b, 6);
  },
  pinwheel: (f) => [-1, 0, 1].forEach((s) => launchProjectile(f, { shape: "star", color: "#ffb347", emissive: "#ff5e8a", radius: 0.26, speed: 10, life: 1.6, damage: 8, force: 4.6, vz: s * 1.6, boomerang: true })),
  shellbeetle: (f, b, p) => spawnWallWave(f, "#ffd166", 12 * p * b, 6.2),
  gusty: (f) => [-1, 1].forEach((s) => launchProjectile(f, { shape: "wave", color: "#d4c4ff", emissive: "#ffe066", radius: 0.5, speed: 10, life: 1.5, damage: 10, force: 6.2, offsetZ: s * 0.5 })),
  entity: (f) => applyAreaAbility(f, { radius: 5.0, damage: 15, force: 6.5, color: "#b774ff", pull: true })
};

function useSpecialAbility(fighter) {
  const character = characters[fighter.kind];
  createSpeechBubble(fighter, `${character.specialName}!`);
  fighter.poseTimer = 0.72;
  specialCameraFocus = { fighter, timer: specialCameraDuration };
  const boost = fighter.powerBoost > 0 ? 1.7 : 1;
  const handler = uniqueSpecialMechanics[fighter.kind];
  if (!handler) throw new Error(`Unknown special ability for ${character.name}.`);
  handler(fighter, boost, character.power);
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
  effect.userData.duration = 0.3;
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
  if (target.eliminated || target.portalEntry > 0 || target.respawn > 0 || target.invulnerable > 0) return false;
  if (target.remote) {
    // The opponent's client owns that fighter's HP and knockback, so relay the hit and only show the impact here
    sendOnlineHit(target.remoteSlot, damage, force);
    target.hitFlash = 0.24;
    spawnImpact(target, damage >= 10);
    document.querySelector("#battle-status").textContent = `${characters[attacker.kind].name} landed a hit!`;
    return true;
  }
  if (battleMode === "cpu" && target === fighters[0] && fighters.indexOf(attacker) > 0) {
    damage *= cpuLevelFor(attacker).damage;
  }
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
  return true;
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
  if (special) {
    fighter.cooldown = 0.55;
    fighter.attackPose = 0.55;
    fighter.specialCooldown = 4;
    useSpecialAbility(fighter);
    return;
  }

  fighter.cooldown = 0.42;
  fighter.attackPose = 0.34;
  fighter.kickPose = 0.36;

  if (!target) {
    const reach = 2.15 * FIGHTER_SCALE;
    target = fighters
      .filter((opponent) => opponent !== fighter && !opponent.eliminated && opponent.respawn <= 0)
      .filter((opponent) => {
        const dx = opponent.x - fighter.x;
        const dz = opponent.z - fighter.z;
        return Math.hypot(dx, dz) < reach && Math.abs(dz) < 1.75 * FIGHTER_SCALE && dx * fighter.facing > -0.65 && Math.abs(opponent.y - fighter.y) < 1.5 * FIGHTER_SCALE;
      })
      .sort((a, b) => (a.x - fighter.x) ** 2 + (a.z - fighter.z) ** 2 - (b.x - fighter.x) ** 2 - (b.z - fighter.z) ** 2)[0]
      || nearestOpponent(fighter);
  }
  if (!target) {
    tryActivateSecretSeal(fighter);
    return;
  }
  const dx = target.x - fighter.x;
  const dz = target.z - fighter.z;
  const inReach = Math.hypot(dx, dz) < 2.15 * FIGHTER_SCALE;
  const inFront = dx * fighter.facing > -0.65;
  const inHeight = Math.abs(target.y - fighter.y) < 1.5 * FIGHTER_SCALE;
  if (inReach && Math.abs(dz) < 1.75 * FIGHTER_SCALE && inFront && inHeight) {
    const boost = fighter.powerBoost > 0 ? 1.7 : 1;
    const damage = fighter.swordTier ? fighter.swordTier.damage : 7 * characters[fighter.kind].power * boost;
    hitTarget(fighter, target, damage, 4.4);
  }
  tryActivateSecretSeal(fighter);
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
    if (battleMode === "online" && fighter === fighters[0]) {
      sendOnlineState({ snapshot: onlineSnapshot(fighter) });
    }
    const remaining = fighters.map((item, fighterIndex) => ({ item, fighterIndex })).filter(({ item }) => !item.eliminated);
    hudDirty = true;
    if (remaining.length === 1) {
      finishMatch(remaining[0].fighterIndex, "Last fighter standing.");
    } else {
      document.querySelector("#battle-status").textContent = `${characters[fighter.kind].name} is out!`;
      const nextRival = fighters.find((item, fighterIndex) => fighterIndex > 0 && !item.eliminated);
      if (nextRival) setMusicScene("battle", nextRival.kind);
    }
    updateHud();
    return;
  }
  [fighter.x, fighter.z] = fighterSpawns[fighter.spawnIndex % fighterSpawns.length];
  fighter.y = 0.08;
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

const difficultyLevels = {
  easy: { label: "Easy", speed: 0.85, thinkMin: 0.5, thinkRange: 0.4, strikeRange: 2.0, specialChance: 0.08, jumpChance: 0.05, damage: 0.7, edgeCaution: 2 },
  normal: { label: "Normal", speed: 1, thinkMin: 0.35, thinkRange: 0.35, strikeRange: 2.2, specialChance: 0.18, jumpChance: 0.1, damage: 1, edgeCaution: 0.9 },
  hard: { label: "Hard", speed: 1.12, thinkMin: 0.2, thinkRange: 0.15, strikeRange: 2.35, specialChance: 0.3, jumpChance: 0.18, damage: 1.2, edgeCaution: 0.86 },
  nightmare: { label: "Nightmare", speed: 1.25, thinkMin: 0.1, thinkRange: 0.1, strikeRange: 2.5, specialChance: 0.45, jumpChance: 0.28, damage: 1.4, edgeCaution: 0.8 }
};
let cpuDifficulty = "normal";

const PLAYER_CONTROLS = [
  { horizontal: ["KeyA", "KeyD"], depth: ["KeyW", "KeyS"], jump: "Space", strike: "KeyJ", special: "KeyK", crouch: "KeyC" },
  { horizontal: ["ArrowLeft", "ArrowRight"], depth: ["ArrowUp", "ArrowDown"], jump: "ArrowUp", strike: "Enter", special: "ShiftRight", crouch: "ControlRight" },
  { horizontal: ["KeyF", "KeyH"], depth: ["KeyT", "KeyG"], jump: "KeyR", strike: "KeyY", special: "KeyU", crouch: "KeyB" },
  { horizontal: ["Numpad4", "Numpad6"], depth: ["Numpad8", "Numpad5"], jump: "Numpad0", strike: "Numpad1", special: "Numpad2", crouch: "Numpad3" }
];

function readInput(fighter, index, delta) {
  const isCpu = index > 0 && battleMode === "cpu";
  const pressed = (...codes) => codes.some((code) => keys.has(code) || virtualKeys.has(code));
  const tapped = (...codes) => codes.some((code) => justPressed.has(code));
  const playerControls = PLAYER_CONTROLS[index];
  // Online, your own fighter answers to every control set, so any keys work on your machine
  const anyControls = battleMode === "online" && index === 0 ? PLAYER_CONTROLS : [playerControls];
  const pick = (field) => anyControls.flatMap(field);
  let horizontal = 0;
  let depth = 0;
  let jump = false;
  let strike = false;
  let special = false;
  let crouchHeld = false;

  if (!isCpu) {
    const arrowAliases = index === 0 && battleMode === "cpu";
    const left = [...pick((c) => c.horizontal[0]), ...(arrowAliases ? ["ArrowLeft"] : [])];
    const right = [...pick((c) => c.horizontal[1]), ...(arrowAliases ? ["ArrowRight"] : [])];
    const back = [...pick((c) => c.depth[0]), ...(arrowAliases ? ["ArrowUp"] : [])];
    const forward = [...pick((c) => c.depth[1]), ...(arrowAliases ? ["ArrowDown"] : [])];
    const jumpKeys = [...pick((c) => c.jump), ...(arrowAliases ? ["ArrowUp"] : [])];
    horizontal = Number(pressed(...right)) - Number(pressed(...left));
    depth = Number(pressed(...forward)) - Number(pressed(...back));
    jump = pressed(...jumpKeys) && tapped(...jumpKeys);
    strike = tapped(...pick((c) => c.strike), ...(arrowAliases ? ["Enter"] : []));
    special = tapped(...pick((c) => c.special), ...(arrowAliases ? ["ShiftRight"] : []));
    crouchHeld = pressed(...pick((c) => c.crouch));
  } else {
    const level = cpuLevelFor(fighter);
    const target = nearestOpponent(fighter);
    if (!target) return;
    const dx = target.x - fighter.x;
    const dz = target.z - fighter.z;
    const distance = Math.hypot(dx, dz);
    const nearRim = Math.hypot(fighter.x, fighter.z) > floorRadius * level.edgeCaution;
    // Always turn toward the target so attacks land where the fighter is actually facing
    if (Math.abs(dx) > 0.3) fighter.facing = Math.sign(dx);
    horizontal = Math.abs(dx) > 1.7 ? Math.sign(dx) : 0;
    depth = Math.abs(dz) > 1.1 ? Math.sign(dz) : 0;
    if (nearRim) {
      horizontal = -Math.sign(fighter.x) * (Math.abs(fighter.x) > 0.5 ? 1 : 0);
      depth = -Math.sign(fighter.z) * (Math.abs(fighter.z) > 0.5 ? 1 : 0);
    }
    // If the fighter is pushing against a pillar or wall without making progress, sidestep around it and hop
    const moved = Math.hypot(fighter.x - fighter.cpuLastX, fighter.z - fighter.cpuLastZ);
    fighter.cpuLastX = fighter.x;
    fighter.cpuLastZ = fighter.z;
    if ((horizontal || depth) && moved < 0.2 * delta * characters[fighter.kind].speed * 1.5 * level.speed) {
      fighter.cpuStuckTime += delta;
    } else {
      fighter.cpuStuckTime = Math.max(0, fighter.cpuStuckTime - delta * 2);
    }
    if (fighter.cpuStuckTime > 0.35 && fighter.cpuDodgeTime <= 0) {
      fighter.cpuDodgeTime = 0.7;
      fighter.cpuDodgeDir = Math.random() < 0.5 ? -1 : 1;
      fighter.cpuStuckTime = 0;
      if (fighter.grounded) fighter.vy = 9.2;
      fighter.grounded = false;
    }
    if (fighter.cpuDodgeTime > 0 && !nearRim) {
      fighter.cpuDodgeTime -= delta;
      const side = fighter.cpuDodgeDir;
      horizontal = Math.abs(dz) > 0.001 ? -Math.sign(dz) * side : 0;
      depth = Math.abs(dx) > 0.001 ? Math.sign(dx) * side : 0;
    }
    fighter.cpuThinkTime -= delta;
    if (fighter.cpuThinkTime <= 0) {
      fighter.cpuThinkTime = level.thinkMin + Math.random() * level.thinkRange;
      const facingTarget = Math.abs(dx) < 0.6 || Math.sign(dx) === fighter.facing;
      strike = !nearRim && distance < level.strikeRange && facingTarget && Math.abs(dz) < 1.6;
      special = !nearRim && distance < 4 && facingTarget && Math.random() < level.specialChance;
      jump = fighter.grounded && !nearRim && Math.random() < level.jumpChance;
    }
  }

  if (crouchHeld && fighter.grounded) {
    horizontal = 0;
    depth = 0;
  }
  const speed = characters[fighter.kind].speed * (battleMode === "local" ? 0.5 : 1) * 1.5 * (isCpu ? cpuLevelFor(fighter).speed : 1);
  fighter.vx = (fighter.vx + horizontal * speed * delta * 8) * Math.exp(-(horizontal ? 3.2 : 7) * delta);
  fighter.vz = (fighter.vz + depth * speed * delta * 6) * Math.exp(-(depth ? 3.8 : 7) * delta);
  fighter.vx = THREE.MathUtils.clamp(fighter.vx, -speed, speed);
  fighter.vz = THREE.MathUtils.clamp(fighter.vz, -speed * 0.7, speed * 0.7);
  if (Math.abs(fighter.vx) < 0.035) fighter.vx = 0;
  if (Math.abs(fighter.vz) < 0.035) fighter.vz = 0;

  if (horizontal) fighter.facing = Math.sign(horizontal);
  fighter.crouching = fighter.grounded && (crouchHeld || (depth > 0.35 && Math.abs(horizontal) < 0.25));
  if (jump && fighter.grounded) {
    fighter.vy = 9.2;
    fighter.grounded = false;
    fighter.crouching = false;
  }
  if (strike) attack(fighter);
  if (special) attack(fighter, null, true);
}

// Round surfaces (cylinder tables) use an elliptical check matching their visible rim; box surfaces (stairs, landings) use axis checks.
function isOverSurface(surface, x, z, margin) {
  if (surface.round) {
    return Math.hypot((x - surface.x) / (surface.halfWidth * 0.92 + margin), (z - surface.z) / (surface.halfDepth * 0.92 + margin)) <= 1;
  }
  return Math.abs(x - surface.x) <= surface.halfWidth + margin && Math.abs(z - surface.z) <= surface.halfDepth + margin;
}

function updateFighter(fighter, index, delta, elapsed) {
  if (fighter.eliminated) return;
  updateSpeechBubble(fighter, delta, elapsed);
  if (fighter.remote && fighter.portalEntry <= 0) {
    updateRemoteFighter(fighter, delta, elapsed);
    return;
  }
  fighter.cooldown = Math.max(0, fighter.cooldown - delta);
  fighter.specialCooldown = Math.max(0, fighter.specialCooldown - delta);
  fighter.invulnerable = Math.max(0, fighter.invulnerable - delta);
  fighter.attackPose = Math.max(0, fighter.attackPose - delta);
  fighter.kickPose = Math.max(0, fighter.kickPose - delta);
  fighter.poseTimer = Math.max(0, fighter.poseTimer - delta);
  fighter.hitFlash = Math.max(0, fighter.hitFlash - delta);
  fighter.slipTimer = Math.max(0, fighter.slipTimer - delta);
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
    if (fighter.portalDelay > 0) {
      fighter.portalDelay = Math.max(0, fighter.portalDelay - delta);
      return;
    }
    fighter.portalEntry = Math.max(0, fighter.portalEntry - delta);
    const progress = 1 - fighter.portalEntry / fighter.portalEntryDuration;
    const eased = 1 - (1 - progress) ** 3;
    const skyDrop = (1 - progress) ** 2;
    const target = fighter.portalEntryTarget;
    fighter.x = target.x * eased;
    fighter.y = THREE.MathUtils.lerp(0.08, 8.4, skyDrop) + Math.sin(progress * Math.PI) * 1.1;
    fighter.z = THREE.MathUtils.lerp(-5.15, target.z, eased);
    fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
    fighter.visual.rotation.y = (fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2) + (1 - eased) * Math.PI * 2;
    fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(0.24 + eased * 0.76);
    if (fighter.portalEntry === 0) {
      fighter.x = target.x;
      fighter.y = 0.08;
      fighter.z = target.z;
      fighter.grounded = true;
      fighter.poseTimer = 0.65;
      fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
      fighter.visual.rotation.y = fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
      fighter.visual.scale.copy(fighter.visual.userData.baseScale);
      spawnAbilityRing(fighter, characters[fighter.kind].palette.trim, 0.42);
      spawnImpact(fighter, true);
    }
    return;
  }

  if (!portalIntroActive && fighter.slipTimer <= 0) readInput(fighter, index, delta);
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
    spawnRosterReinforcements();
    document.querySelector("#battle-status").textContent = "SECRET CRYSTAL! Your roster fighters join the arena!";
    document.querySelector("#screen-reader-status").textContent = "Secret crystal collected. Roster fighters have entered the arena.";
  }

  const fighterBodyRadius = 0.42 * FIGHTER_SCALE;
  const fighterHeight = 1.85 * FIGHTER_SCALE;
  fighter.grounded = false;

  // Step up stairs smoothly while grounded
  if (wasGrounded) {
    const steppedSurface = arenaSurfaces.reduce((best, surface) =>
      surface.stair && surface.top > previousY && surface.top <= previousY + 0.25 &&
      isOverSurface(surface, fighter.x, fighter.z, 0.18) && (!best || surface.top > best.top)
        ? surface : best, null);
    if (steppedSurface) {
      fighter.y = steppedSurface.top;
      fighter.vy = 0;
      fighter.grounded = true;
    }
  }

  // Land on top of solid platforms/stairs (no clipping through from above)
  if (fighter.vy <= 0) {
    const landedSurface = arenaSurfaces.reduce((best, surface) =>
      previousY >= surface.top - 0.14 && fighter.y <= surface.top &&
      isOverSurface(surface, fighter.x, fighter.z, 0.26) && (!best || surface.top > best.top)
        ? surface : best, null);
    if (landedSurface) {
      fighter.y = landedSurface.top;
      fighter.vy = 0;
      fighter.grounded = true;
    }
  }

  // Solid side-wall & underside hitboxes on raised surfaces so fighters cannot clip through blocks or platforms
  const resolveSolidSurfaces = () => {
    for (const surface of arenaSurfaces) {
      if (!surface.solid) continue;
      const offsetX = fighter.x - surface.x;
      const offsetZ = fighter.z - surface.z;
      // The 8-sided rim's flat faces sit at ~0.92 of its radius; add the body radius so fighters stop at the visible edge
      const reachX = (surface.round ? surface.halfWidth * 0.92 : surface.halfWidth) + fighterBodyRadius;
      const reachZ = (surface.round ? surface.halfDepth * 0.92 : surface.halfDepth) + fighterBodyRadius;
      const normalized = Math.hypot(offsetX / reachX, offsetZ / reachZ);
      const insideFootprint = surface.round ? normalized < 1 : Math.abs(offsetX) < reachX && Math.abs(offsetZ) < reachZ;
      if (!insideFootprint) continue;

      if (fighter.vy > 0 && previousY + fighterHeight <= surface.bottom + 0.08 && fighter.y + fighterHeight > surface.bottom) {
        fighter.y = surface.bottom - fighterHeight;
        fighter.vy = 0;
        continue;
      }

      if (fighter.y >= surface.top - 0.05 || fighter.y + fighterHeight <= surface.bottom + 0.05) continue;

      if (surface.round) {
        // Project onto the ellipse edge along the radial direction; this matches the cylinder's visible rim.
        let ox = offsetX;
        let oz = offsetZ;
        let distance = normalized;
        if (distance < 0.001) {
          ox = reachX;
          oz = 0;
          distance = 1;
        }
        const newX = ox / distance;
        const newZ = oz / distance;
        const pushX = newX - offsetX;
        const pushZ = newZ - offsetZ;
        fighter.x = surface.x + newX;
        fighter.z = surface.z + newZ;
        if (fighter.vx * pushX < 0) fighter.vx = 0;
        if (fighter.vz * pushZ < 0) fighter.vz = 0;
      } else {
        const overlapX = reachX - Math.abs(offsetX);
        const overlapZ = reachZ - Math.abs(offsetZ);
        if (overlapX < overlapZ) {
          const pushDir = offsetX >= 0 ? 1 : -1;
          fighter.x = surface.x + pushDir * reachX;
          if (fighter.vx * pushDir < 0) fighter.vx = 0;
        } else {
          const pushDir = offsetZ >= 0 ? 1 : -1;
          fighter.z = surface.z + pushDir * reachZ;
          if (fighter.vz * pushDir < 0) fighter.vz = 0;
        }
      }
    }
  };
  resolveSolidSurfaces();

  // Solid main arena floor hitbox (cannot fall/clip through ground)
  const edgeDistance = Math.hypot(fighter.x, fighter.z);
  if (edgeDistance <= floorRadius && fighter.y <= 0.08 && previousY >= -0.45) {
    fighter.y = 0.08;
    fighter.vy = Math.max(0, fighter.vy);
    fighter.grounded = true;
  }

  if (edgeDistance > floorRadius * 0.88) {
    const pushStrength = (edgeDistance - floorRadius * 0.88) * 2.4;
    if (edgeDistance > 0.1) {
      fighter.vx -= (fighter.x / edgeDistance) * pushStrength;
      fighter.vz -= (fighter.z / edgeDistance) * pushStrength;
    }
  }

  // Fighter-to-fighter solid body separation hitbox
  for (const other of fighters) {
    if (other === fighter || other.eliminated || other.respawn > 0 || other.portalEntry > 0) continue;
    if (Math.abs(fighter.y - other.y) > 1.45) continue;
    const dx = fighter.x - other.x;
    const dz = fighter.z - other.z;
    const dist = Math.hypot(dx, dz);
    const minSep = 0.86 * FIGHTER_SCALE;
    if (dist < minSep) {
      const directionX = dist > 0.001 ? dx / dist : (fighter.spawnIndex < other.spawnIndex ? -1 : 1);
      const directionZ = dist > 0.001 ? dz / dist : 0;
      const push = (minSep - dist) * (other.remote ? 1 : 0.5);
      fighter.x += directionX * push;
      fighter.z += directionZ * push;
      // A remote fighter's own client pushes it out of this fighter, so only move local bodies here
      if (!other.remote) {
        other.x -= directionX * push;
        other.z -= directionZ * push;
      }
    }
  }
  resolveSolidSurfaces();

  // Past the arena edge there is no floor, so fighters fall and lose a stock when they drop out of the air
  if (fighter.y < -2.8) {
    beginKnockout(fighter, "falls off the edge!");
    return;
  }

  fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
  fighter.visual.rotation.y = fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
  fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(1 + fighter.hitFlash * 0.7);
  if (fighter.visual.userData.powerAura) {
    fighter.visual.userData.powerAura.visible = fighter.powerBoost > 0;
    fighter.visual.userData.powerAura.rotation.z += delta * 1.8;
  }
  animateFighterBody(fighter, elapsed);
}

function animateFighterBody(fighter, elapsed) {
  const body = fighter.visual.userData.body;
  const movement = Math.min(1, Math.hypot(fighter.vx, fighter.vz) / characters[fighter.kind].speed);
  const swing = fighter.attackPose > 0 ? Math.sin((fighter.attackPose / 0.55) * Math.PI) : 0;
  const kick = fighter.kickPose > 0 ? Math.sin((fighter.kickPose / 0.36) * Math.PI) : 0;
  const pose = fighter.poseTimer > 0 ? Math.sin((fighter.poseTimer / 0.72) * Math.PI) : 0;
  const crouchDrop = fighter.crouching ? -0.34 : 0;
  const idleBreath = Math.sin(elapsed * 3.1 + fighter.cpuThinkTime) * 0.03 * (1 - movement);
  body.position.y = (fighter.grounded ? Math.abs(Math.sin(elapsed * 12)) * 0.07 * movement + idleBreath : 0) + crouchDrop + pose * 0.14;
  body.scale.set(fighter.crouching ? 1.08 : 1, fighter.crouching ? 0.78 : 1, fighter.crouching ? 1.06 : 1);
  if (fighter.slipTimer > 0) {
    body.rotation.z = fighter.facing * 1.15;
    body.rotation.x = -0.55;
  } else {
    body.rotation.z = swing * -fighter.facing * 0.25 - fighter.vx * 0.015 + kick * fighter.facing * 0.16;
    // Stalking forward lean when moving, ducking lean when crouching, heroic tilt during poses
    body.rotation.x = fighter.grounded
      ? (fighter.crouching ? 0.28 : movement * 0.18 + Math.sin(elapsed * 2.2 + fighter.cpuThinkTime) * 0.03 * (1 - movement) - pose * 0.14)
      : -0.14;
  }
  fighter.visual.userData.animatedLimbs.forEach((limb, limbIndex) => {
    const gaitPhase = (limb.userData.side < 0 ? 0 : Math.PI) + (limb.userData.limbType === "arm" ? Math.PI : 0);
    const isFrontLeg = limb.userData.limbType === "leg" && limb.userData.side === fighter.facing;
    const isArm = limb.userData.limbType === "arm";
    const kickOffset = isFrontLeg ? kick * -fighter.facing * 1.18 : 0;
    const poseOffset = isArm ? pose * -limb.userData.side * 0.95 : 0;
    const crouchOffset = fighter.crouching && isArm ? -limb.userData.side * 0.45 : 0;
    limb.rotation.z = limb.userData.restRotationZ
      + Math.sin(elapsed * 11 + gaitPhase) * 0.56 * movement
      + Math.cos(elapsed * 18) * swing * -fighter.facing * 0.34
      + kickOffset + poseOffset + crouchOffset;
  });
  body.rotation.y = Math.sin(elapsed * 5.5 + fighter.cpuThinkTime) * 0.1 * movement
    + swing * fighter.facing * 0.18 + pose * fighter.facing * 0.22;
  animateBlink(fighter.visual, elapsed);
  fighter.visual.visible = fighter.invulnerable <= 0 || Math.floor(elapsed * 12) % 2 === 0;
}

// Remote fighters are driven by snapshots from the opponent's client; their owner decides hits, knockouts, and stocks.
function updateRemoteFighter(fighter, delta, elapsed) {
  const snapshot = fighter.remoteTarget;
  if (!snapshot) return;
  // Project the last snapshot forward by its age so motion stays smooth between network updates
  const age = THREE.MathUtils.clamp((performance.now() - (fighter.remoteReceivedAt || 0)) / 1000, 0, 0.15);
  const targetX = snapshot.x + (snapshot.falling ? 0 : snapshot.vx * age);
  const targetY = snapshot.y + (snapshot.falling ? 0 : snapshot.vy * age);
  const targetZ = snapshot.z + (snapshot.falling ? 0 : snapshot.vz * age);
  const gap = Math.hypot(targetX - fighter.x, targetY - fighter.y, targetZ - fighter.z);
  if (gap > 4) {
    fighter.x = targetX;
    fighter.y = targetY;
    fighter.z = targetZ;
  } else {
    const follow = 1 - Math.exp(-26 * delta);
    fighter.x += (targetX - fighter.x) * follow;
    fighter.y += (targetY - fighter.y) * follow;
    fighter.z += (targetZ - fighter.z) * follow;
  }
  Object.assign(fighter, {
    vx: snapshot.vx, vy: snapshot.vy, vz: snapshot.vz, facing: snapshot.facing,
    grounded: snapshot.grounded, crouching: snapshot.crouching, hp: snapshot.hp, damage: snapshot.damage,
    stocks: snapshot.stocks, invulnerable: snapshot.invulnerable, respawn: snapshot.respawn,
    attackPose: snapshot.attackPose, kickPose: snapshot.kickPose, poseTimer: snapshot.poseTimer,
    hitFlash: snapshot.hitFlash, powerBoost: snapshot.powerBoost
  });
  if (snapshot.falling && !fighter.falling) {
    fighter.falling = true;
    fighter.knockoutElapsed = 0;
    fighter.knockoutEffect = createKnockoutBlackHole(fighter);
  } else if (!snapshot.falling && fighter.falling) {
    fighter.falling = false;
    removeKnockoutBlackHole(fighter);
  }
  if (fighter.falling) {
    fighter.knockoutElapsed += delta;
    updateKnockoutBlackHole(fighter, delta, THREE.MathUtils.clamp(fighter.knockoutElapsed / 1.35, 0, 1));
  }
  if (snapshot.eliminated && !fighter.eliminated) {
    fighter.eliminated = true;
    fighter.falling = false;
    removeKnockoutBlackHole(fighter);
    fighter.visual.visible = false;
    hudDirty = true;
    if (matchActive && !matchEnded) checkLastStanding();
    return;
  }
  fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
  fighter.visual.rotation.y = fighter.facing > 0 ? Math.PI / 2 : -Math.PI / 2;
  fighter.visual.scale.copy(fighter.visual.userData.baseScale).multiplyScalar(1 + fighter.hitFlash * 0.7);
  if (fighter.visual.userData.powerAura) {
    fighter.visual.userData.powerAura.visible = fighter.powerBoost > 0;
    fighter.visual.userData.powerAura.rotation.z += delta * 1.8;
  }
  animateFighterBody(fighter, elapsed);
}

function updateProjectiles(delta) {
  const fighterCount = fighters.length;
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.life -= delta;
    if (projectile.hazard) {
      projectile.armTimer = Math.max(0, projectile.armTimer - delta);
      const groundLevel = arenaSurfaces.reduce((highest, surface) => {
        if (isOverSurface(surface, projectile.mesh.position.x, projectile.mesh.position.z, 0)) {
          return Math.max(highest, surface.top + 0.1);
        }
        return highest;
      }, 0.16);
      if (projectile.mesh.position.y > groundLevel) {
        projectile.vy -= 18 * delta;
        projectile.mesh.position.x += projectile.vx * delta;
        projectile.mesh.position.y = Math.max(groundLevel, projectile.mesh.position.y + projectile.vy * delta);
        projectile.mesh.position.z += projectile.vz * delta;
      } else {
        projectile.vx *= Math.exp(-8 * delta);
        projectile.mesh.position.x += projectile.vx * delta;
      }
      projectile.mesh.rotation.z += delta * 2.2;
      if (!projectile.visualOnly) {
        for (let j = 0; j < fighterCount; j += 1) {
          const target = fighters[j];
          if (target.eliminated || target.portalEntry > 0 || target.respawn > 0 || target.invulnerable > 0) continue;
          if (target === projectile.owner && projectile.armTimer > 0) continue;
          const dx = projectile.mesh.position.x - target.x;
          const dy = projectile.mesh.position.y - (target.y + 0.3);
          const dz = projectile.mesh.position.z - target.z;
          if (dx * dx + dy * dy + dz * dz < projectile.hitRadius * projectile.hitRadius) {
            target.slipTimer = 0.85;
            target.vy = 5.4;
            target.grounded = false;
            target.vx = (Math.abs(target.vx) > 0.5 ? Math.sign(target.vx) : target.facing) * 3.8;
            if (target === projectile.owner) {
              target.damage += 4;
              target.hp = Math.max(0, target.hp - 4);
              target.hitFlash = 0.25;
              hudDirty = true;
              spawnImpact(target, false);
              document.querySelector("#battle-status").textContent = `${characters[target.kind].name} slipped on his own banana peel!`;
              if (target.hp <= 0) beginKnockout(target, "was knocked out at 0 HP!");
            } else {
              hitTarget(projectile.owner, target, projectile.damage * projectile.power, projectile.force);
              document.querySelector("#battle-status").textContent = `${characters[target.kind].name} slipped on a banana peel!`;
            }
            projectile.life = 0;
            break;
          }
        }
      }
    } else {
      projectileStart.copy(projectile.mesh.position);
      if (projectile.boomerang) {
        projectile.vx -= Math.sign(projectile.owner.facing || 1) * 18 * delta;
      }
      if (projectile.homing) {
        const target = nearestOpponent(projectile.owner);
        if (target) {
          const dx = target.x - projectile.mesh.position.x;
          const dz = target.z - projectile.mesh.position.z;
          const d = Math.hypot(dx, dz) || 1;
          projectile.vx = THREE.MathUtils.lerp(projectile.vx, (dx / d) * projectile.speed, delta * 4);
          projectile.vz = THREE.MathUtils.lerp(projectile.vz, (dz / d) * projectile.speed, delta * 4);
        }
      }
      projectile.mesh.position.x += projectile.vx * delta;
      projectile.mesh.position.y += (projectile.vy || 0) * delta;
      projectile.mesh.position.z += projectile.vz * delta;
      projectile.mesh.rotation.y += delta * 4;
      const hitWall = arenaSurfaces.some((surface) =>
        surface.solid
        && projectile.mesh.position.y >= surface.bottom
        && projectile.mesh.position.y <= surface.top
        && isOverSurface(surface, projectile.mesh.position.x, projectile.mesh.position.z, 0)
      );
      if (hitWall || projectile.mesh.position.y <= 0.1) {
        projectile.life = 0;
      }
      let closestTarget = null;
      let closestTime = Infinity;
      for (const target of projectile.visualOnly || hitWall || projectile.mesh.position.y <= 0.1 ? [] : fighters) {
        if (target === projectile.owner || target.eliminated || target.respawn > 0) continue;
        collisionCenter.set(target.x, target.y + 1.3 * FIGHTER_SCALE, target.z);
        const time = segmentSphereHitTime(projectileStart, projectile.mesh.position, collisionCenter, projectile.hitRadius);
        if (time !== null && time < closestTime) {
          closestTime = time;
          closestTarget = target;
        }
      }
      if (closestTarget) {
        hitTarget(projectile.owner, closestTarget, projectile.damage * projectile.power, projectile.force);
        projectile.life = 0;
      }
    }
    if (projectile.life <= 0 || Math.hypot(projectile.mesh.position.x, projectile.mesh.position.z) > floorRadius + 10) {
      arena.remove(projectile.mesh);
      disposeObject(projectile.mesh);
      projectiles.splice(i, 1);
    }
  }
}

function updateHitEffects(delta) {
  for (let i = hitEffects.length - 1; i >= 0; i -= 1) {
    const effect = hitEffects[i];
    effect.userData.remaining -= delta;
    const progress = 1 - effect.userData.remaining / (effect.userData.duration || 0.3);
    effect.children.forEach((child) => {
      if (child.userData.impactRing || child.userData.abilityRing) {
        child.scale.setScalar(1 + progress * (child.userData.abilityRing ? 4.8 : 2.2));
        child.material.opacity = Math.max(0, 1 - progress);
      } else if (child.userData.velocity) {
        child.position.addScaledVector(child.userData.velocity, delta);
        child.userData.velocity.y -= 9 * delta;
        child.material.opacity = Math.max(0, 1 - progress);
      } else if (child.userData.fade) {
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

const cameraRig = {
  focus: new THREE.Vector3(0, 1.35, 0),
  position: new THREE.Vector3(0, 7.6, 25.5)
};
// Alt + arrow keys orbit and zoom the camera; Alt + 0 resets it. Dragging the scene with the mouse also orbits, and the wheel zooms.
const cameraOrbit = { yaw: 0, zoom: 1, targetZoom: 1, idle: 0 };
const cameraDrag = { pointerId: null, lastX: 0 };
// Pointer position in -1..1 screen space, used to drift the menu camera
const menuPointer = { x: 0, y: 0 };
renderer.domElement.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.button !== 2) return;
  cameraDrag.pointerId = event.pointerId;
  cameraDrag.lastX = event.clientX;
  cameraOrbit.idle = 0;
});
const endCameraDrag = (event) => {
  if (event.pointerId === cameraDrag.pointerId) cameraDrag.pointerId = null;
};
window.addEventListener("pointerup", endCameraDrag);
window.addEventListener("pointercancel", endCameraDrag);
renderer.domElement.addEventListener("wheel", (event) => {
  event.preventDefault();
  cameraOrbit.idle = 0;
  cameraOrbit.targetZoom = THREE.MathUtils.clamp(cameraOrbit.targetZoom + event.deltaY * 0.001, 0.6, 1.8);
}, { passive: false });
window.addEventListener("pointermove", (event) => {
  menuPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  menuPointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  if (event.pointerId === cameraDrag.pointerId) {
    cameraOrbit.yaw -= (event.clientX - cameraDrag.lastX) * 0.008;
    cameraDrag.lastX = event.clientX;
    cameraOrbit.idle = 0;
  }
});

function updateCameraOrbit(delta) {
  const altHeld = keys.has("AltLeft") || keys.has("AltRight");
  if (altHeld) {
    cameraOrbit.idle = 0;
    // Arrow and WASD keys double as gameplay controls, so hide them from gameplay while orbiting
    const orbitLeft = keys.has("ArrowLeft") || keys.has("KeyA");
    const orbitRight = keys.has("ArrowRight") || keys.has("KeyD");
    const zoomIn = keys.has("ArrowUp") || keys.has("KeyW");
    const zoomOut = keys.has("ArrowDown") || keys.has("KeyS");
    for (const code of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]) keys.delete(code);
    if (orbitLeft) cameraOrbit.yaw -= delta * 1.6;
    if (orbitRight) cameraOrbit.yaw += delta * 1.6;
    if (zoomIn) cameraOrbit.targetZoom = Math.max(0.6, cameraOrbit.targetZoom - delta * 0.8);
    if (zoomOut) cameraOrbit.targetZoom = Math.min(1.8, cameraOrbit.targetZoom + delta * 0.8);
    if (keys.has("Digit0")) {
      cameraOrbit.yaw = 0;
      cameraOrbit.targetZoom = 1;
      keys.delete("Digit0");
    }
  }
  cameraOrbit.idle += delta;
  // Flight camera keeps a player-chosen orbit angle, and only drifts back behind the ship after a few idle seconds
  if (explore && !altHeld && cameraDrag.pointerId === null && cameraOrbit.idle > 1.2) {
    cameraOrbit.yaw = THREE.MathUtils.lerp(cameraOrbit.yaw, 0, 1 - Math.exp(-1.5 * delta));
  }
  cameraOrbit.zoom = THREE.MathUtils.lerp(cameraOrbit.zoom, cameraOrbit.targetZoom, 1 - Math.exp(-6 * delta));
}

function placeCameraWithOrbit(focusX, focusZ, lookY, baseX, baseY, baseZ, cam = camera) {
  const dx = baseX - focusX;
  const dz = baseZ - focusZ;
  const cos = Math.cos(cameraOrbit.yaw);
  const sin = Math.sin(cameraOrbit.yaw);
  const arenaPos = arena.position;
  cam.position.set(
    arenaPos.x + focusX + (dx * cos - dz * sin) * cameraOrbit.zoom,
    arenaPos.y + baseY,
    arenaPos.z + focusZ + (dx * sin + dz * cos) * cameraOrbit.zoom
  );
  cam.lookAt(arenaPos.x + focusX, arenaPos.y + lookY, arenaPos.z + focusZ);
}

// Split-screen player 2 gets its own rig and camera; player 1 keeps the main camera
const splitRig = {
  focus: new THREE.Vector3(0, 1.35, 0),
  position: new THREE.Vector3()
};
const splitCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);

function followFighterCamera(rig, cam, subject, delta) {
  cam.clearViewOffset();
  rig.focus.x = THREE.MathUtils.damp(rig.focus.x, subject.x, 6, delta);
  rig.focus.z = THREE.MathUtils.damp(rig.focus.z, subject.z, 6, delta);
  rig.focus.y = THREE.MathUtils.damp(rig.focus.y, Math.max(1.35, subject.y + 1.35), 4, delta);
  const distance = Math.max(22, floorRadius * 0.45);
  placeCameraWithOrbit(
    rig.focus.x,
    rig.focus.z,
    rig.focus.y,
    rig.focus.x,
    Math.max(7.6, rig.focus.y + 6.2),
    rig.focus.z + distance,
    cam
  );
}

function renderSplitScreen() {
  const width = renderer.domElement.width;
  const height = renderer.domElement.height;
  const half = Math.floor(width / 2);
  const views = [
    { cam: camera, x: 0, w: half },
    { cam: splitCamera, x: half, w: width - half }
  ];
  renderer.setScissorTest(true);
  for (const view of views) {
    renderer.setViewport(view.x, 0, view.w, height);
    renderer.setScissor(view.x, 0, view.w, height);
    view.cam.aspect = view.w / height;
    view.cam.updateProjectionMatrix();
    renderer.render(scene, view.cam);
  }
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function updateCamera(delta) {
  camera.clearViewOffset();
  const arenaCameraDistance = Math.max(22, floorRadius * 0.45);
  if (portalIntroActive && fighters.length) {
    // Frame the whole roster so every entering fighter is on screen, pulling back as they spread out
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, minY = Infinity, maxY = -Infinity;
    fighters.forEach((item) => {
      minX = Math.min(minX, item.x); maxX = Math.max(maxX, item.x);
      minZ = Math.min(minZ, item.z); maxZ = Math.max(maxZ, item.z);
      minY = Math.min(minY, item.y); maxY = Math.max(maxY, item.y);
    });
    const groupX = (minX + maxX) / 2;
    const groupY = (minY + maxY) / 2;
    const groupZ = (minZ + maxZ) / 2;
    const spread = Math.max(maxX - minX, maxZ - minZ, 2);
    const targetCamX = THREE.MathUtils.clamp(groupX, -9, 9);
    const targetCamY = Math.max(7, groupY + 4 + spread * 0.45);
    const targetCamZ = groupZ + 6 + spread * 0.9;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.2, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 2.8, delta);
    camera.lookAt(groupX, groupY + 1.2, groupZ);
    return;
  }
  const activeFighters = fighters.filter((fighter) => !fighter.eliminated);
  const centerX = activeFighters.length
    ? activeFighters.reduce((total, fighter) => total + fighter.x, 0) / activeFighters.length
    : 0;
  // The camera always follows the human player; only fall back to the group when the player is out
  const player = fighters[0];
  const playerAlive = player && !player.eliminated;
  // A special's cutscene frames its caster for a moment, then the camera eases straight back to the player
  let subject = playerAlive ? player : null;
  if (specialCameraFocus) {
    specialCameraFocus.timer -= delta;
    if (specialCameraFocus.timer <= 0 || specialCameraFocus.fighter.eliminated) specialCameraFocus = null;
    else subject = specialCameraFocus.fighter;
  }
  const followX = subject ? subject.x : centerX;
  const followZ = subject ? subject.z : 0;
  // No clamp: the subject must stay in view even when walking or falling past the rim
  const focusX = followX;
  const focusZ = followZ;
  const followY = subject ? Math.max(1.35, subject.y + 1.35) : 1.35;
  // Focus and camera share one damping rate and a fixed offset, so the camera rides with the player instead of drifting on its own
  cameraRig.focus.x = THREE.MathUtils.damp(cameraRig.focus.x, focusX, 6, delta);
  cameraRig.focus.z = THREE.MathUtils.damp(cameraRig.focus.z, focusZ, 6, delta);
  // Rise and drop with the player so a fall off the edge stays on screen
  cameraRig.focus.y = THREE.MathUtils.damp(cameraRig.focus.y, followY, 4, delta);
  cameraRig.position.x = cameraRig.focus.x;
  cameraRig.position.y = Math.max(7.6, cameraRig.focus.y + 6.2);
  cameraRig.position.z = cameraRig.focus.z + arenaCameraDistance;
  // Shake is a slow, small offset applied after smoothing so hits nudge the view without vibrating it
  const shakeAmount = Math.min(cameraShake, 0.3) * 0.3;
  const shakeTime = performance.now() * 0.001;
  const shakeX = Math.sin(shakeTime * 6.3) * shakeAmount;
  const shakeY = Math.cos(shakeTime * 4.1) * shakeAmount * 0.7;
  placeCameraWithOrbit(
    cameraRig.focus.x,
    cameraRig.focus.z,
    cameraRig.focus.y,
    cameraRig.position.x + shakeX,
    cameraRig.position.y + shakeY,
    cameraRig.position.z
  );
}

function animatePortal(elapsed, delta) {
  starField.rotation.y += delta * 0.0014;
  galaxyBackdrop.rotation.z += delta * 0.014;
  galaxyBackdrop.rotation.x = -0.18 + Math.sin(elapsed * 0.16) * 0.025;
  galaxyBackdrop.children[0].material.opacity = 0.62 + Math.sin(elapsed * 1.1) * 0.12;
  animateSpaceBattle(elapsed);
  const onMenuScreen = titleScreenActive || selectionScreenActive;
  spaceBattle.visible = titleScreenActive;
  titlePlanets.visible = titleScreenActive;
  starField.visible = explore && !onMenuScreen;
  galaxyBackdrop.visible = explore && !onMenuScreen;
  if (titlePlanets.visible) {
    titlePlanets.children.forEach((planet) => {
      const { basePosition, phase } = planet.userData;
      planet.position.x = basePosition.x + Math.sin(elapsed * 0.18 + phase) * 1.1;
      planet.position.y = basePosition.y + Math.sin(elapsed * 0.24 + phase) * 0.24;
      planet.rotation.z = Math.sin(elapsed * 0.12 + phase) * 0.035;
      planet.children.forEach((part) => {
        if (part.userData.spin) part.rotation.y += delta * part.userData.spin;
        if (part.userData.orbitSpeed) part.position.applyAxisAngle(yAxis, delta * part.userData.orbitSpeed);
      });
    });
  }
  if (arena.visible) {
    arenaPlanets.forEach((planet) => {
      planet.group.visible = !selectionScreenActive;
      planet.orbitAngle += delta * planet.orbitSpeed;
      planet.group.position.x = planet.x + Math.sin(planet.orbitAngle) * planet.orbitRadius;
      planet.group.position.y = planet.y + Math.sin(elapsed * planet.drift + planet.phase) * 0.42;
      planet.surface.rotation.y += delta * planet.spin;
      planet.ring.rotation.z += delta * planet.spin * 0.35;
      planet.moon.position.applyAxisAngle(yAxis, delta * planet.orbitSpeed * 1.8);
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

// Explore mode: a free-flight ship climbs a floating platform course to Entity.exe
const EXPLORE_ENTITY_BASE = new THREE.Vector3(0, 86, 0);
const EXPLORE_ENTITY_MAX_HP = 90;
const EXPLORE_ITEM_COUNT = 8;
let explore = null;

// Builds a spaceship that flies along +z, so the nose lines up with lookAt
function buildSpaceshipVisual(colors, scale) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(scale);
  root.add(body);
  const hullMat = material(colors.body, 0.32, 0.45);
  const trimMat = material(colors.trim, 0.3, 0.3, { emissive: colors.trim, emissiveIntensity: 0.7 });
  const darkMat = material(colors.dark, 0.5, 0.35);
  const glassMat = material("#9ff3ff", 0.1, 0.2, { emissive: "#4ce9ff", emissiveIntensity: 0.6, transparent: true, opacity: 0.85 });

  addMesh(body, new THREE.CapsuleGeometry(0.42, 1.5, 6, 14), hullMat, [0, 0, 0]).rotation.x = Math.PI / 2;
  addMesh(body, new THREE.ConeGeometry(0.42, 1.2, 14), hullMat, [0, 0, 1.75]).rotation.x = Math.PI / 2;
  addMesh(body, new THREE.BoxGeometry(3, 0.09, 0.9), darkMat, [0, -0.05, 0.1]);
  for (const side of [-1, 1]) {
    addMesh(body, new THREE.BoxGeometry(0.08, 0.6, 0.9), trimMat, [side * 1.5, 0.25, 0.1]);
    addMesh(body, new THREE.CylinderGeometry(0.2, 0.26, 0.6, 12), darkMat, [side * 0.55, -0.05, -1.1]).rotation.x = Math.PI / 2;
  }
  addMesh(body, new THREE.SphereGeometry(0.3, 14, 10), glassMat, [0, 0.36, 0.7], [1, 0.6, 1.5]);
  addMesh(body, new THREE.BoxGeometry(0.1, 0.1, 2.1), trimMat, [0, 0.42, -0.1]);
  return root;
}

function createLabelSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(8, 6, 20, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 64px monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(6, 1.5, 1);
  return sprite;
}

const RIVAL_COUNT = 6;
const RIVAL_MAX_HP = 3;
const RIVAL_BOLT_COLOR = "#ff9a3c";

// Rival ships reuse the fighter palettes, so every spaceship in the sky looks like a different fighter
function createRivals(group) {
  const paletteNames = Object.keys(characters);
  return Array.from({ length: RIVAL_COUNT }, (_, index) => {
    const palette = characters[paletteNames[index % paletteNames.length]].palette;
    const mesh = new THREE.Group();
    mesh.add(buildSpaceshipVisual({ body: palette.primary, trim: palette.trim, dark: palette.dark }, 1.1));
    mesh.visible = false;
    group.add(mesh);
    return {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      color: palette.trim,
      hp: RIVAL_MAX_HP,
      alive: false,
      respawn: index * 0.8,
      fireTimer: 1 + Math.random() * 1.5,
      seed: Math.random() * 10
    };
  });
}

function createExploreWorld() {
  const group = new THREE.Group();
  scene.add(group);

  const ship = new THREE.Group();
  group.add(ship);
  const palette = characters[selectedFighter].palette;
  ship.add(buildSpaceshipVisual({ body: palette.primary, trim: palette.trim, dark: palette.dark }, 1));
  const thruster = addMesh(ship, new THREE.SphereGeometry(0.32, 10, 8), material("#4ce9ff", 0.2, 0, { emissive: "#4ce9ff", emissiveIntensity: 1.6 }), [0, 0, -1.9]);
  const exhaust = addMesh(ship, new THREE.ConeGeometry(0.3, 3, 8), new THREE.MeshBasicMaterial({
    color: "#4ce9ff", transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending
  }), [0, 0, -3.4]);
  exhaust.rotation.x = -Math.PI / 2;

  const planetPalette = ["#ff8fb1", "#7fd8ff", "#ffd166", "#b8a2ff", "#72e0a2"];
  const atmosphereGeometry = new THREE.SphereGeometry(1, 16, 12);
  const atmospheres = planetPalette.map((color) => new THREE.MeshBasicMaterial({
    color, side: THREE.BackSide, transparent: true, opacity: 0.13, depthWrite: false
  }));
  const planets = [];
  for (let index = 0; index < 14; index += 1) {
    const radius = index === 0 ? 6 : 3.4 + (index % 3) * 1.1;
    const angle = index * 0.9;
    const ring = 28 + (index % 3) * 7;
    const center = index === 0
      ? new THREE.Vector3(0, -radius, 0)
      : new THREE.Vector3(Math.cos(angle) * ring, 4 + index * 5.4, Math.sin(angle) * ring);
    const color = planetPalette[index % planetPalette.length];
    const planetMesh = addMesh(group, new THREE.SphereGeometry(radius, 20, 14), material(color, 0.65, 0.1, { emissive: color, emissiveIntensity: 0.1 }), center.toArray());
    if (index % 2 === 0) {
      addMesh(planetMesh, atmosphereGeometry, atmospheres[index % atmospheres.length], [0, 0, 0], [radius * 1.12, radius * 1.12, radius * 1.12]);
    }
    if (index % 2 === 0) {
      addMesh(planetMesh, new THREE.TorusGeometry(radius * 1.6, 0.16, 6, 36), material("#fff1c9", 0.4, 0.2), [0, 0, 0]).rotation.x = 1.1;
    }
    planets.push({ center, radius });
  }

  const planetColors = ["#ff8fb1", "#7fd8ff", "#ffd166", "#b8a2ff", "#72e0a2"];
  for (let index = 0; index < 14; index += 1) {
    const radius = 12 + Math.random() * 30;
    addMesh(
      group,
      new THREE.SphereGeometry(radius, 24, 16),
      material(planetColors[index % planetColors.length], 0.7, 0.05, { emissive: planetColors[index % planetColors.length], emissiveIntensity: 0.08 }),
      [(Math.random() - 0.5) * 520, (Math.random() - 0.5) * 220, -120 - Math.random() * 300]
    );
  }

  // Rocks sit beside each planet-to-planet hop; every other hop has a gate to fly through
  const rockMat = material("#6b6f86", 0.9, 0.05);
  const rockGeometry = new THREE.DodecahedronGeometry(1.8, 0);
  const gateMat = material("#4ce9ff", 0.3, 0.2, { emissive: "#4ce9ff", emissiveIntensity: 0.9 });
  const obstacles = [];
  const gates = [];
  for (let index = 0; index < planets.length - 1; index += 1) {
    const from = planets[index].center;
    const to = planets[index + 1].center;
    const mid = from.clone().lerp(to, 0.5);
    const side = new THREE.Vector3(to.z - from.z, 0, from.x - to.x).normalize().multiplyScalar(5 + (index % 2) * 3);
    const rock = addMesh(group, rockGeometry, rockMat, mid.clone().add(side).toArray());
    obstacles.push({ mesh: rock, radius: 2.2, spin: 0.6 + (index % 3) * 0.3 });
    if (index % 2 === 0) {
      const gate = addMesh(group, new THREE.TorusGeometry(3.2, 0.25, 8, 28), gateMat, mid.clone().sub(side.clone().multiplyScalar(0.4)).toArray());
      gate.lookAt(to);
      gates.push({ mesh: gate, center: gate.position.clone(), normal: to.clone().sub(gate.position).normalize(), passed: false });
    }
  }

  for (let index = 0; index < 12; index += 1) {
    const angle = index * 2.4;
    const distance = 80 + (index % 4) * 38;
    const radius = 4 + (index % 3) * 2;
    const center = new THREE.Vector3(Math.cos(angle) * distance, -20 + (index % 6) * 20, Math.sin(angle) * distance);
    const color = planetPalette[index % planetPalette.length];
    addMesh(group, new THREE.SphereGeometry(radius, 16, 12), material(color, 0.75, 0.08), center.toArray());
    planets.push({ center, radius });
  }

  const itemMat = material("#ffd166", 0.2, 0.3, { emissive: "#ffb000", emissiveIntensity: 1.2 });
  const itemGeometry = new THREE.OctahedronGeometry(0.9, 0);
  const items = [];
  for (let index = 0; index < EXPLORE_ITEM_COUNT; index += 1) {
    const angle = index * 0.9 + 0.4;
    const radius = 30 + (index % 3) * 10;
    const position = new THREE.Vector3(Math.cos(angle) * radius, 4 + (index % 4) * 5, Math.sin(angle) * radius);
    const mesh = addMesh(group, itemGeometry, itemMat, position.toArray());
    items.push({ mesh, base: position, taken: false });
  }

  const battlePlatforms = [];
  const platformMat = material("#4ce9ff", 0.4, 0.2, { emissive: "#4ce9ff", emissiveIntensity: 0.8 });
  const platformGeometry = new THREE.BoxGeometry(3.5, 0.3, 3.5);
  for (let arenaIdx = 0; arenaIdx < 20; arenaIdx += 1) {
    const pos = getGalaxyBattlePlatformPosition(arenaIdx);
    const platform = addMesh(group, platformGeometry, platformMat, [pos.x, pos.y, pos.z]);
    platform.scale.set(1.2, 1, 1.2);
    platform.visible = false;
    battlePlatforms.push({ mesh: platform, arenaIndex: arenaIdx, center: new THREE.Vector3(pos.x, pos.y, pos.z), radius: 2.5 });
  }

  const observerShips = [];
  const buildObserverShip = (pos) => {
    const ship = new THREE.Group();
    ship.position.copy(pos);
    ship.position.y += 3;
    const fuselage = addMesh(ship, new THREE.BoxGeometry(0.4, 0.3, 1.2), material("#888899", 0.3, 0.2), [0, 0, 0]);
    const wing1 = addMesh(ship, new THREE.BoxGeometry(1.2, 0.08, 0.3), material("#666677", 0.3, 0.2), [-0.6, 0, 0]);
    const wing2 = addMesh(ship, new THREE.BoxGeometry(1.2, 0.08, 0.3), material("#666677", 0.3, 0.2), [0.6, 0, 0]);
    const cockpit = addMesh(ship, new THREE.SphereGeometry(0.15, 4, 4), material("#4ce9ff", 0.5, 0.3, { emissive: "#4ce9ff", emissiveIntensity: 0.4 }), [0, 0.1, 0.4]);
    group.add(ship);
    return ship;
  };
  
  for (let arenaIdx = 0; arenaIdx < 20; arenaIdx += 1) {
    const pos = getGalaxyBattlePlatformPosition(arenaIdx);
    observerShips.push(buildObserverShip(pos));
  }
  
  const blackHoles = [];
  const blackHoleCore = new THREE.MeshBasicMaterial({ color: "#000000" });
  const blackHoleHalo = new THREE.MeshBasicMaterial({ color: "#8a5cff", transparent: true, opacity: 0.22, side: THREE.BackSide, depthWrite: false });
  const blackHoleDiskMaterial = new THREE.MeshBasicMaterial({ color: "#ff9a3c", transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const blackHoleCoreGeometry = new THREE.SphereGeometry(2.2, 24, 16);
  const blackHoleHaloGeometry = new THREE.SphereGeometry(3.4, 24, 16);
  const blackHoleDiskGeometry = new THREE.RingGeometry(3.4, 8.5, 64);
  for (let index = 2; index < planets.length; index += 4) {
    const host = planets[index];
    const offset = new THREE.Vector3(Math.cos(index * 1.7), 0.35, Math.sin(index * 1.7)).normalize().multiplyScalar(host.radius + 14);
    const center = host.center.clone().add(offset);
    const destination = planets[(index + 7) % planets.length];
    const hole = new THREE.Group();
    hole.position.copy(center);
    addMesh(hole, blackHoleCoreGeometry, blackHoleCore, [0, 0, 0]);
    addMesh(hole, blackHoleHaloGeometry, blackHoleHalo, [0, 0, 0]);
    const disk = addMesh(hole, blackHoleDiskGeometry, blackHoleDiskMaterial, [0, 0, 0]);
    disk.rotation.x = Math.PI / 2.6;
    group.add(hole);
    blackHoles.push({
      group: hole,
      disk,
      center,
      pullRadius: 16,
      eventRadius: 2.2,
      exit: destination.center.clone().add(new THREE.Vector3(0, destination.radius + 6, 0))
    });
  }

  const rivals = createRivals(group);

  const entityMesh = new THREE.Group();
  entityMesh.position.copy(EXPLORE_ENTITY_BASE);
  group.add(entityMesh);
  entityMesh.add(buildSpaceshipVisual({ body: "#2b0f24", trim: "#ff3a7a", dark: "#120811" }, 2.2));
  const label = createLabelSprite("ENTITY.EXE", "#ff9ac0");
  label.position.set(0, 3.4, 0);
  entityMesh.add(label);

  return {
    group,
    ship,
    thruster,
    exhaust,
    position: new THREE.Vector3(0, 24, 0),
    previousPosition: new THREE.Vector3(),
    camPos: new THREE.Vector3(0, 28, 10),
    velocity: new THREE.Vector3(),
    forward: new THREE.Vector3(0, 0, -1),
    up: new THREE.Vector3(0, 1, 0),
    yaw: 0,
    turnRate: 0,
    bank: 0,
    pitch: 0,
    hull: 100,
    fireCooldown: 0,
    hurtTimer: 0,
    planets,
    items,
    itemsFound: 0,
    obstacles,
    gates,
    blackHoles,
    blackHoleCooldown: 0,
    battlePlatforms,
    observerShips,
    bolts: [],
    boltGeometry: new THREE.SphereGeometry(0.35, 8, 6),
    playerBoltMat: new THREE.MeshBasicMaterial({ color: "#4ce9ff" }),
    entityBoltMat: new THREE.MeshBasicMaterial({ color: "#ff4fd8" }),
    rivalBoltMat: new THREE.MeshBasicMaterial({ color: RIVAL_BOLT_COLOR }),
    blastGeometry: new THREE.SphereGeometry(1, 12, 10),
    blasts: [],
    rivals,
    kills: 0,
    entityMesh,
    entityAnchor: EXPLORE_ENTITY_BASE.clone(),
    entityHp: EXPLORE_ENTITY_MAX_HP,
    entityFireTimer: 1.5,
    teleportTimer: 5,
    glitch: 0,
    time: 0,
    status: "",
    minimapTimer: 0,
    over: false
  };
}

function startExplore() {
  selectionScreenActive = false;
  titlePlanets.visible = false;
  clearInputState();
  clearFighters();
  explore = createExploreWorld();
  explore.arenaWasVisible = arena.visible;
  explore.backgroundColor = scene.background.clone();
  explore.fogColor = scene.fog.color.clone();
  scene.background.set("#02030a");
  scene.fog.color.copy(scene.background);
  arena.visible = false;
  matchActive = false;
  document.querySelector("#portal-screen").hidden = true;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#arena-strip").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#return-through-portal").hidden = true;
  document.querySelector("#battle-hud").hidden = false;
  document.querySelector("#battle-hud").classList.add("explore-hud");
  document.querySelector("#touch-controls").hidden = !isTouchDevice;
  setExploreTouchControls(true);
  document.querySelectorAll('[id^="player-"][id$="-panel"]').forEach((panel) => {
    panel.hidden = true;
  });
  document.querySelector("#battle-arena-name").textContent = "GALAXY EXPLORE";
  document.querySelector("#match-clock").textContent = "∞";
  document.querySelector("#special-status").hidden = true;
  document.querySelector("#explore-minimap").hidden = false;
  updateControlsHint();
  renderer.domElement.focus();
  setMusicScene("battle");
}

function clearExplore() {
  if (!explore) return;
  disposeExploreWorld(explore);
  explore = null;
}

function disposeExploreWorld(world) {
  scene.remove(world.group);
  disposeObject(world.group);
  world.boltGeometry.dispose();
  world.playerBoltMat.dispose();
  world.entityBoltMat.dispose();
  world.rivalBoltMat.dispose();
  world.blastGeometry.dispose();
  arena.visible = world.arenaWasVisible;
  scene.background.copy(world.backgroundColor);
  scene.fog.color.copy(world.fogColor);
  starField.position.set(0, 0, 0);
  galaxyBackdrop.position.set(-3, 10, -43);
  camera.up.set(0, 1, 0);
  document.querySelector("#explore-minimap").hidden = true;
}

function updateExploreObstacles(world, delta) {
  world.obstacles.forEach((rock) => {
    rock.mesh.rotation.y += delta * rock.spin;
    const offset = world.position.clone().sub(rock.mesh.position);
    const distance = offset.length();
    if (distance < rock.radius + 1 && world.hurtTimer <= 0) {
      const normal = distance > 0.001 ? offset.normalize() : new THREE.Vector3(0, 1, 0);
      world.position.copy(rock.mesh.position).addScaledVector(normal, rock.radius + 1.1);
      world.velocity.reflect(normal).multiplyScalar(0.5);
      world.hull = Math.max(0, world.hull - 8);
      world.hurtTimer = 0.4;
    }
  });
  world.gates.forEach((gate) => {
    if (gate.passed || !segmentCrossesGate(world.previousPosition, world.position, gate.center, gate.normal, 2)) return;
    gate.passed = true;
    gate.mesh.scale.setScalar(1.25);
    world.hull = Math.min(100, world.hull + 6);
  });
}

function updateExploreBlackHoles(world, delta) {
  world.blackHoleCooldown = Math.max(0, world.blackHoleCooldown - delta);
  world.blackHoles.forEach((hole) => {
    hole.disk.rotation.z += delta * 0.8;
    const toCenter = hole.center.clone().sub(world.position);
    const distance = toCenter.length();
    if (distance > hole.pullRadius) return;
    if (world.blackHoleCooldown <= 0 && distance < hole.eventRadius + 1) {
      world.previousPosition.copy(hole.exit);
      world.position.copy(hole.exit);
      world.velocity.set(0, 0, 0);
      world.blackHoleCooldown = 2;
      world.hull = Math.min(100, world.hull + 4);
      return;
    }
    const pull = (1 - distance / hole.pullRadius) * 14 * delta;
    world.velocity.addScaledVector(toCenter.normalize(), pull);
  });
}

function updateExploreItems(world, delta) {
  world.items.forEach((item) => {
    if (item.taken) return;
    item.mesh.rotation.y += delta * 2;
    item.mesh.position.y = item.base.y + Math.sin(world.time * 2 + item.base.x) * 0.4;
  });
}

function collectExploreItems(world) {
  world.items.forEach((item) => {
    if (item.taken || world.position.distanceTo(item.mesh.position) > 2.6) return;
    item.taken = true;
    item.mesh.visible = false;
    world.itemsFound += 1;
    world.hull = Math.min(100, world.hull + 10);
  });
}

function updateExploreObserverShips(world, delta) {
  if (!world.observerShips) return;
  
  world.observerShips.forEach((ship, idx) => {
    const time = world.time * 0.3 + idx;
    ship.rotation.y += delta * 0.2;
    ship.position.y += Math.sin(time * 1.5) * delta * 0.5;
  });
}

function endExplore(won) {
  explore.over = true;
  clearInputState();
  document.querySelector("#battle-status").textContent = won ? "ENTITY.EXE DELETED" : "HULL FAILURE";
  document.querySelector("#match-end-status").textContent = "EXPLORE COMPLETE";
  document.querySelector("#winner-title").textContent = won ? "ENTITY.EXE DELETED" : "ENTITY.EXE WINS";
  document.querySelector("#winner-message").textContent = won
    ? `You deleted Entity.exe after ${Math.floor(explore.time)}s and ${explore.kills} rival kills.`
    : `Your ship was destroyed after ${Math.floor(explore.time)}s with ${explore.kills} rival kills. Try again and survive longer.`;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#return-through-portal").hidden = true;
  document.querySelector("#match-end").hidden = false;
  document.querySelector("#screen-reader-status").textContent = document.querySelector("#winner-message").textContent;
}

function spawnExploreBolt(world, origin, direction, owner, shooter = null) {
  const material = owner === "player" ? world.playerBoltMat : owner === "rival" ? world.rivalBoltMat : world.entityBoltMat;
  const speed = owner === "player" ? 60 : owner === "rival" ? 30 : 24;
  const mesh = new THREE.Mesh(world.boltGeometry, material);
  mesh.position.copy(origin);
  world.group.add(mesh);
  world.bolts.push({ mesh, velocity: direction.clone().multiplyScalar(speed), life: 2.2, owner, shooter });
}

function resolveExplorePlanets(world) {
  for (const planet of world.planets) {
    const offset = world.position.clone().sub(planet.center);
    const distance = offset.length();
    const minimum = planet.radius + EXPLORE_PLANET_CLEARANCE;
    if (distance >= minimum) continue;
    const normal = distance > 0.001 ? offset.normalize() : new THREE.Vector3(0, 1, 0);
    world.position.copy(planet.center).addScaledVector(normal, minimum);
    const inward = world.velocity.dot(normal);
    if (inward < 0) world.velocity.addScaledVector(normal, -inward * 1.4);
    if (world.hurtTimer <= 0) {
      world.hull = Math.max(0, world.hull - 4);
      world.hurtTimer = 0.4;
    }
  }
}

const EXPLORE_PLANET_CLEARANCE = 2.2;

const EXPLORE_BOUNDS = 260;

function resolveExploreBounds(world) {
  const limits = { x: [-EXPLORE_BOUNDS, EXPLORE_BOUNDS], y: [-100, 180], z: [-EXPLORE_BOUNDS, EXPLORE_BOUNDS] };
  for (const axis of ["x", "y", "z"]) {
    const [min, max] = limits[axis];
    if (world.position[axis] > max) {
      world.position[axis] = max;
      world.velocity[axis] = -Math.abs(world.velocity[axis]) * 0.5;
    } else if (world.position[axis] < min) {
      world.position[axis] = min;
      world.velocity[axis] = Math.abs(world.velocity[axis]) * 0.5;
    }
  }
}

const MINIMAP_RANGE = 70;

function drawExploreMinimap(world) {
  const canvas = document.querySelector("#explore-minimap");
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const half = size / 2;
  const scale = half / MINIMAP_RANGE;
  const toMap = (x, z) => [half + (x - world.position.x) * scale, half + (z - world.position.z) * scale];

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(6, 10, 26, 0.78)";
  ctx.beginPath();
  ctx.arc(half, half, half - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(76, 233, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(half, half, half - 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#7fd8ff";
  world.planets.forEach((planet) => {
    const [x, y] = toMap(planet.center.x, planet.center.z);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2.5, planet.radius * scale), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#ffd166";
  world.items.forEach((item) => {
    if (item.taken) return;
    const [x, y] = toMap(item.base.x, item.base.z);
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  });

  ctx.fillStyle = RIVAL_BOLT_COLOR;
  world.rivals.forEach((rival) => {
    if (!rival.alive) return;
    const [x, y] = toMap(rival.position.x, rival.position.z);
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  });

  const entityPosition = world.entityMesh.position;
  const [ex, ey] = toMap(entityPosition.x, entityPosition.z);
  const edge = half - 14;
  const dx = ex - half;
  const dy = ey - half;
  const outside = Math.hypot(dx, dy) > edge;
  const blink = Math.floor(world.time * 4) % 2 === 0;
  if (!outside || blink) {
    const clamp = outside ? edge / Math.hypot(dx, dy) : 1;
    ctx.fillStyle = "#ff4fd8";
    ctx.beginPath();
    ctx.arc(half + dx * clamp, half + dy * clamp, outside ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const [sx, sy] = toMap(world.position.x, world.position.z);
  const heading = Math.atan2(world.forward.z, world.forward.x);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(heading + Math.PI / 2);
  ctx.fillStyle = "#4ce9ff";
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(5, 5);
  ctx.lineTo(-5, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();

  const distance = Math.round(world.position.distanceTo(entityPosition));
  const altitude = Math.round(entityPosition.y - world.position.y);
  ctx.fillStyle = "#ffe0f0";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`ENTITY ${distance}m`, half, size - 22);
  ctx.fillText(`${altitude >= 0 ? "▲" : "▼"} ${Math.abs(altitude)}m alt`, half, size - 8);
}


function updateExploreEntity(world, delta) {
  const entity = world.entityMesh;
  world.teleportTimer -= delta;
  if (world.teleportTimer <= 0) {
    world.teleportTimer = 5 + Math.random() * 2;
    world.entityAnchor.set(
      EXPLORE_ENTITY_BASE.x + (Math.random() - 0.5) * 24,
      EXPLORE_ENTITY_BASE.y + (Math.random() - 0.5) * 6,
      EXPLORE_ENTITY_BASE.z + (Math.random() - 0.5) * 24
    );
    world.glitch = 0.6;
  }
  const t = world.time;
  const goalX = world.entityAnchor.x + Math.cos(t * 0.7) * 5;
  const goalY = world.entityAnchor.y + Math.sin(t * 1.3) * 1.2;
  const goalZ = world.entityAnchor.z + Math.sin(t * 0.7) * 5;
  const blend = 1 - Math.exp(-delta * 2.5);
  entity.position.x += (goalX - entity.position.x) * blend;
  entity.position.y += (goalY - entity.position.y) * blend;
  entity.position.z += (goalZ - entity.position.z) * blend;
  entity.lookAt(world.position);
  world.glitch = Math.max(0, world.glitch - delta);
  entity.visible = world.glitch <= 0 || Math.floor(t * 24) % 2 === 0;

  world.entityFireTimer -= delta;
  if (world.entityFireTimer <= 0) {
    const healthRatio = world.entityHp / EXPLORE_ENTITY_MAX_HP;
    world.entityFireTimer = 1.5 - (1 - healthRatio) * 0.7;
    const direction = world.position.clone().sub(entity.position).normalize();
    spawnExploreBolt(world, entity.position, direction, "entity");
  }
}

function updateExploreBolts(world, delta) {
  for (let index = world.bolts.length - 1; index >= 0; index -= 1) {
    const bolt = world.bolts[index];
    projectileStart.copy(bolt.mesh.position);
    bolt.mesh.position.addScaledVector(bolt.velocity, delta);
    bolt.life -= delta;
    let remove = bolt.life <= 0;
    if (!remove) {
      let closest = null;
      let closestTime = Infinity;
      const consider = (type, object, center, radius) => {
        const time = segmentSphereHitTime(projectileStart, bolt.mesh.position, center, radius);
        if (time !== null && time < closestTime) {
          closestTime = time;
          closest = { type, object };
        }
      };
      for (const planet of world.planets) consider("planet", planet, planet.center, planet.radius + 0.35);
      if (bolt.owner === "player") {
        consider("entity", world.entityMesh, world.entityMesh.position, 3);
      } else if (world.hurtTimer <= 0) {
        consider("player", world.ship, world.position, 1.3);
      }
      for (const rival of world.rivals) {
        if (rival.alive && rival !== bolt.shooter) consider("rival", rival, rival.position, 2.4);
      }
      if (closest) {
        if (closest.type === "battle") {
          if (closest.object.calm <= 0) world.hull = Math.min(100, world.hull + 4);
          closest.object.calm = 6;
        } else if (closest.type === "rival") {
          damageRival(world, closest.object, 1, bolt.owner === "player");
        } else if (closest.type === "entity") {
          world.entityHp = Math.max(0, world.entityHp - 4);
          world.glitch = 0.15;
        } else if (closest.type === "player") {
          world.hull = Math.max(0, world.hull - (bolt.owner === "entity" ? 6 : 5));
          world.hurtTimer = 0.4;
        }
        remove = true;
      }
    }
    if (remove) {
      world.group.remove(bolt.mesh);
      world.bolts.splice(index, 1);
    }
  }
}

function spawnRival(world, rival) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 60 + Math.random() * 30;
  rival.position.set(
    world.position.x + Math.cos(angle) * distance,
    THREE.MathUtils.clamp(world.position.y + (Math.random() - 0.5) * 30, -40, 110),
    world.position.z + Math.sin(angle) * distance
  );
  rival.velocity.set(Math.random() - 0.5, 0, Math.random() - 0.5).multiplyScalar(10);
  rival.hp = RIVAL_MAX_HP;
  rival.alive = true;
  rival.mesh.visible = true;
  rival.fireTimer = 1 + Math.random() * 1.5;
}

function spawnBlast(world, position, color, size = 3) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false });
  const mesh = new THREE.Mesh(world.blastGeometry, material);
  mesh.position.copy(position);
  world.group.add(mesh);
  world.blasts.push({ mesh, life: 0.9, total: 0.9, size });
}

function damageRival(world, rival, amount, byPlayer) {
  rival.hp -= amount;
  if (rival.hp > 0) return;
  rival.alive = false;
  rival.mesh.visible = false;
  rival.respawn = 5 + Math.random() * 2;
  spawnBlast(world, rival.position, rival.color);
  if (byPlayer) world.kills += 1;
}

function updateRivals(world, delta) {
  for (const rival of world.rivals) {
    if (!rival.alive) {
      rival.respawn -= delta;
      if (rival.respawn <= 0) spawnRival(world, rival);
      continue;
    }

    // Chase the nearest enemy, which may be the player or another rival
    let target = world.position;
    let best = rival.position.distanceTo(world.position);
    for (const other of world.rivals) {
      if (other === rival || !other.alive) continue;
      const distance = rival.position.distanceTo(other.position);
      if (distance < best) {
        best = distance;
        target = other.position;
      }
    }
    if (best > 200) {
      rival.alive = false;
      rival.mesh.visible = false;
      rival.respawn = 0.5;
      continue;
    }

    const toTarget = target.clone().sub(rival.position);
    const distance = toTarget.length();
    const dir = distance > 0.001 ? toTarget.divideScalar(distance) : new THREE.Vector3(0, 0, 1);
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    const approach = distance > 24 ? 1 : distance < 12 ? -0.6 : 0.3;
    const desired = dir.clone().multiplyScalar(14 * approach).addScaledVector(side, Math.sin(world.time * 0.9 + rival.seed) * 9);
    desired.y += Math.sin(world.time * 0.6 + rival.seed * 2) * 3;
    rival.velocity.lerp(desired, 1 - Math.exp(-1.6 * delta));
    rival.position.addScaledVector(rival.velocity, delta);
    rival.mesh.position.copy(rival.position);
    if (rival.velocity.lengthSq() > 0.01) rival.mesh.lookAt(rival.position.clone().add(rival.velocity));

    rival.fireTimer -= delta;
    if (rival.fireTimer <= 0) {
      rival.fireTimer = 1.4 + Math.random() * 1.2;
      const aimed = rival.velocity.lengthSq() > 0.01 && rival.velocity.clone().normalize().dot(dir) > 0.3;
      if (aimed && distance < 60) spawnExploreBolt(world, rival.position, dir, "rival", rival);
    }

    // Flying into a ship destroys the rival and damages the player
    if (world.position.distanceTo(rival.position) < 2.6) {
      damageRival(world, rival, RIVAL_MAX_HP, true);
      world.hull = Math.max(0, world.hull - 12);
      world.hurtTimer = 0.4;
    }
  }
}

function updateExploreBlasts(world, delta) {
  for (let index = world.blasts.length - 1; index >= 0; index -= 1) {
    const blast = world.blasts[index];
    blast.life -= delta;
    const progress = 1 - Math.max(0, blast.life) / blast.total;
    blast.mesh.scale.setScalar(blast.size * (0.3 + progress * 1.2));
    blast.mesh.material.opacity = Math.max(0, blast.life / blast.total) * 0.9;
    if (blast.life <= 0) {
      world.group.remove(blast.mesh);
      world.blasts.splice(index, 1);
    }
  }
}

function checkBattlePlatformEntry(world) {
  if (!world.battlePlatforms) return;
  
  for (const platform of world.battlePlatforms) {
    const dist = world.position.distanceTo(platform.center);
    if (dist < platform.radius + 1.5) {
      enterBattleFromExploration(platform.arenaIndex);
      break;
    }
  }
}

function enterBattleFromExploration(arenaIdx) {
  if (!explore || explore.over) return;
  
  explore.over = true;
  clearInputState();
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#explore-minimap").hidden = true;
  
  titleScreenActive = true;
  arenaIndex = arenaIdx;
  createArena(arenaIndex);
  
  startMatch();
  
  titleScreenActive = false;
  clearExplore();
}

const CAMERA_PLANET_MARGIN = 1;
const CAMERA_MIN_SHIP_DISTANCE = 4;

// Chase camera target: behind the ship along its full 3D heading (so it tilts with pitch), rotated by the orbit yaw
function exploreChaseTarget(world) {
  const back = world.forward.clone().negate().applyAxisAngle(world.up, cameraOrbit.yaw);
  return world.position.clone().addScaledVector(back, 10 * cameraOrbit.zoom).addScaledVector(world.up, 4);
}

// Pulls the camera toward the ship when a planet sits between them, so the rocket is never hidden
function pullCameraOutOfPlanets(camPos, shipPos, planets) {
  const seg = camPos.clone().sub(shipPos);
  const len = seg.length();
  if (len < 0.001) return;
  const dir = seg.divideScalar(len);
  let limit = len;
  for (const planet of planets) {
    const toCenter = planet.center.clone().sub(shipPos);
    const along = toCenter.dot(dir);
    if (along <= 0) continue;
    const radius = planet.radius + CAMERA_PLANET_MARGIN;
    const perpSq = toCenter.lengthSq() - along * along;
    if (perpSq >= radius * radius) continue;
    const hit = Math.max(CAMERA_MIN_SHIP_DISTANCE, along - Math.sqrt(radius * radius - perpSq));
    if (hit < limit) limit = hit;
  }
  if (limit < len) camPos.copy(shipPos).addScaledVector(dir, limit);
}

function updateExplore(delta) {
  const world = explore;
  world.time += delta;

  const input = readFlightInput(keys, virtualKeys);
  const turn = input.turn;
  world.turnRate = THREE.MathUtils.lerp(world.turnRate, turn * 2.2, 1 - Math.exp(-8 * delta));
  world.yaw += world.turnRate * delta;
  world.bank = THREE.MathUtils.lerp(world.bank, turn * 0.5, 1 - Math.exp(-6 * delta));

  const pitchInput = input.pitch;
  world.pitch = THREE.MathUtils.clamp(world.pitch + pitchInput * delta * 1.2, -1.2, 1.2);
  const cosPitch = Math.cos(world.pitch);
  world.forward.set(-Math.sin(world.yaw) * cosPitch, Math.sin(world.pitch), -Math.cos(world.yaw) * cosPitch);
  const right = world.forward.clone().cross(world.up).normalize();

  const boost = input.boosting ? 1.9 : 1;
  const forwardInput = input.forward;
  const speed = 18 * boost;
  const target = world.forward.clone().multiplyScalar(forwardInput * speed);
  target.addScaledVector(right, input.strafe * speed * 0.6);
  target.y += input.rise * speed * 0.6;
  world.velocity.lerp(target, 1 - Math.exp(-2.5 * delta));
  world.previousPosition.copy(world.position);
  world.position.addScaledVector(world.velocity, delta);
  resolveExploreBounds(world);
  resolveExplorePlanets(world);
  updateExploreObstacles(world, delta);
  updateExploreBlackHoles(world, delta);
  world.ship.position.copy(world.position);
  starField.position.copy(world.position);
  galaxyBackdrop.position.set(world.position.x - 3, world.position.y + 10, world.position.z - 100);
  world.ship.lookAt(world.position.clone().add(world.forward));
  world.ship.rotateZ(world.bank);
  const flare = forwardInput > 0 ? (boost > 1 ? 2.6 : 1.4) : 0.6;
  world.thruster.scale.set(1, 1, flare + Math.sin(world.time * 24) * 0.15);
  world.exhaust.scale.y = forwardInput > 0 ? (boost > 1 ? 1.6 : 1) : 0.25;
  world.exhaust.material.opacity = forwardInput > 0 ? 0.45 : 0.18;

  world.fireCooldown = Math.max(0, world.fireCooldown - delta);
  if (input.firing && world.fireCooldown <= 0) {
    world.fireCooldown = 0.22;
    const nose = world.position.clone().addScaledVector(world.forward, 1.6);
    spawnExploreBolt(world, nose, world.forward, "player");
  }

  updateExploreEntity(world, delta);
  updateExploreBolts(world, delta);
  updateRivals(world, delta);
  updateExploreBlasts(world, delta);
  updateExploreItems(world, delta);
  updateExploreObserverShips(world, delta);
  collectExploreItems(world);
  checkBattlePlatformEntry(world);
  world.hurtTimer = Math.max(0, world.hurtTimer - delta);
  if (world.position.distanceTo(world.entityMesh.position) < 3.6) {
    world.hull = Math.max(0, world.hull - 20 * delta);
  }

  if (world.hull <= 0) {
    endExplore(false);
  } else if (world.entityHp <= 0) {
    endExplore(true);
  }

  world.camPos.lerp(exploreChaseTarget(world), 1 - Math.exp(-8 * delta));
  pullCameraOutOfPlanets(world.camPos, world.position, world.planets);
  camera.clearViewOffset();
  camera.up.copy(world.up);
  camera.position.copy(world.camPos);
  camera.lookAt(world.position.clone().addScaledVector(world.forward, 1.5));
  const rivalsAlive = world.rivals.filter((rival) => rival.alive).length;
  const status = `ENTITY.EXE ${Math.ceil(world.entityHp)}/${EXPLORE_ENTITY_MAX_HP} · HULL ${Math.ceil(world.hull)}% · ITEMS ${world.itemsFound}/${EXPLORE_ITEM_COUNT} · RIVALS ${rivalsAlive} · KILLS ${world.kills} · SURVIVED ${Math.floor(world.time)}s`;
  world.minimapTimer -= delta;
  if (world.minimapTimer <= 0) {
    world.minimapTimer = 0.2;
    drawExploreMinimap(world);
  }
  if (status !== world.status) {
    world.status = status;
    document.querySelector("#battle-status").textContent = status;
  }
}

function frame(timestamp = 0) {
  if (document.hidden) {
    keys.clear();
    return;
  }
  const frameElapsed = timestamp - lastFrameTime;
  if (frameInterval > 0 && frameElapsed < frameInterval - 0.5) {
    animationFrame = requestAnimationFrame(frame);
    return;
  }
  lastFrameTime = frameInterval > 0 ? timestamp - Math.max(0, frameElapsed % frameInterval) : timestamp;
  const delta = Math.min(clock.getDelta(), 1 / 30);
  const elapsed = clock.elapsedTime;
  animatePortal(elapsed, delta);
  updateCameraOrbit(delta);
  if (explore) {
    if (!explore.over && !graphicsContextLost) updateExplore(delta);
  } else if (matchActive) {
    if (!portalIntroActive) updateClock(delta);
    for (let index = 0; index < fighters.length; index += 1) {
      updateFighter(fighters[index], index, delta, elapsed);
    }
    if (battleMode === "online" && fighters[0]) {
      onlineSendTimer -= delta;
      if (onlineSendTimer <= 0) {
        onlineSendTimer = 0.05;
        sendOnlineState({ snapshot: onlineSnapshot(fighters[0]) });
      }
    }
    if (portalIntroActive && fighters.every((fighter) => fighter.eliminated || fighter.portalEntry === 0)) {
      portalIntroActive = false;
      document.querySelector("#battle-status").textContent = "FIGHT!";
      document.querySelector("#screen-reader-status").textContent = "All fighters have entered the arena. Fight!";
    }
    if (secretPortalPending) beginSecretChallenge();
    updateProjectiles(delta);
    updateHitEffects(delta);
    if (battleMode === "split" && fighters.length === 2) {
      followFighterCamera(cameraRig, camera, fighters[0], delta);
      followFighterCamera(splitRig, splitCamera, fighters[1], delta);
    } else {
      updateCamera(delta);
    }
    if (hudDirty) updateHud();
    if (fighters[0]) {
      const cooldown = fighters[0].specialCooldown;
      const status = cooldown > 0
        ? `${characters[fighters[0].kind].specialName}: ${cooldown.toFixed(1)}s`
        : `${characters[fighters[0].kind].specialName}: READY`;
      const specialStatus = document.querySelector("#special-status");
      if (specialStatus.textContent !== status) specialStatus.textContent = status;
    }
  } else if (fighters.length === 0) {
    // On the select screen the camera drifts toward the cursor but always aims at the fighter
    const menuX = selectionScreenActive ? menuPointer.x * 2.5 : 0;
    const menuY = selectionScreenActive ? 10.8 - menuPointer.y * 1.2 : 10.8;
    cameraRig.position.x = THREE.MathUtils.damp(cameraRig.position.x, menuX, 2.5, delta);
    cameraRig.position.y = THREE.MathUtils.damp(cameraRig.position.y, menuY, 2.5, delta);
    cameraRig.position.z = THREE.MathUtils.damp(cameraRig.position.z, 25.5, 0.6, delta);
    placeCameraWithOrbit(0, 0, selectionScreenActive && window.innerWidth <= 900 ? -2.2 : 1.4, cameraRig.position.x, cameraRig.position.y, cameraRig.position.z);
    // On desktop the fighter select panel covers the left side, so shift the projection to keep the fighter in the open area on the right
    if (selectionScreenActive && window.innerWidth > 900) {
      camera.setViewOffset(window.innerWidth, window.innerHeight, -window.innerWidth * 0.33, 0, window.innerWidth, window.innerHeight);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
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
  realmBackdrop.rotation.y += delta * 0.01;
  updateArenaStreaming();
  if (!graphicsContextLost) {
    if (battleMode === "split" && fighters.length === 2 && !explore) renderSplitScreen();
    else renderer.render(scene, camera);
  }
  animationFrame = requestAnimationFrame(frame);
}

function isFighterUnlocked(kind) {
  if (kind === "entity") return entityUnlocked;
  if (characters[kind]?.custom) return true;
  return starterCharacterIds.includes(kind) || unlockedFighters.has(kind);
}

function refreshUnlockUI() {
  const totalCount = regularCharacterIds.length + 1;
  const unlockedCount = starterCharacterIds.length + unlockedFighters.size + customFighters.length + (entityUnlocked ? 1 : 0);
  document.querySelector("#fighter-count").textContent = `${unlockedCount} FIGHTERS`;
  document.querySelector("#unlock-progress").textContent = `${unlockedCount} / ${totalCount} UNLOCKED`;
  document.querySelectorAll(".fighter-card").forEach((card) => {
    const kind = card.dataset.fighter;
    if (kind === "entity") {
      card.hidden = !entityUnlocked;
      return;
    }
    const unlocked = isFighterUnlocked(kind);
    card.classList.toggle("locked", !unlocked);
    const indicator = card.querySelector(".pick-indicator");
    if (indicator) indicator.textContent = unlocked ? "✓" : "🔒";
  });
}

function rollRareUnlock(multiplier = 1) {
  const locked = unlockableCharacterIds.filter((kind) => !unlockedFighters.has(kind));
  if (locked.length === 0) return null;
  const weighted = locked.map((kind) => ({
    kind,
    chance: Math.min(0.95, (characters[kind].dropChance || 0.1) * multiplier)
  }));
  // Shuffle order so rarer or common characters each get a fair shot
  const candidate = weighted[Math.floor(Math.random() * weighted.length)];
  if (Math.random() <= candidate.chance) {
    unlockedFighters.add(candidate.kind);
    saveUnlockedFighters();
    refreshUnlockUI();
    return candidate.kind;
  }
  return null;
}

const fighterGrid = document.querySelector("#fighter-grid");
const entityCard = fighterGrid.querySelector('[data-fighter="entity"]');
const customFighterStorageKey = "universeCrazyCustomFighters";
const customBuildPresets = {
  quick: { speed: 7.2, power: 0.9 },
  balanced: { speed: 6.2, power: 1.1 },
  heavy: { speed: 4.9, power: 1.36 }
};

function readCustomFighters() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(customFighterStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomFighters() {
  try {
    window.localStorage.setItem(customFighterStorageKey, JSON.stringify(customFighters));
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
  }
}

function appendFighterCard(kind) {
  const info = characters[kind];
  const button = document.createElement("button");
  button.className = "fighter-card";
  button.type = "button";
  button.dataset.fighter = kind;
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = `
    <span class="fighter-art custom-art" data-icon="${info.icon}" aria-hidden="true"><i></i></span>
    <span class="fighter-card-copy">
      <span class="fighter-type">${info.rarity.toUpperCase()}</span>
      <strong>${info.name}</strong>
      <small>${info.tagline}</small>
      <small class="ability-note">Special: ${info.specialName}</small>
    </span>
    <span class="pick-indicator" aria-hidden="true">${info.custom ? "✦" : "🔒"}</span>
  `;
  fighterGrid.insertBefore(button, entityCard);
  return button;
}

function registerCustomFighter(entry) {
  const kind = `custom-${entry.id}`;
  const base = characters[entry.ability];
  const preset = customBuildPresets[entry.build] || customBuildPresets.balanced;
  characters[kind] = {
    name: entry.name,
    palette: { primary: entry.primary, dark: "#1b1630", trim: entry.trim, accent: entry.trim },
    speed: preset.speed,
    power: preset.power,
    special: base.special,
    specialName: base.specialName,
    specialDescription: base.specialDescription,
    icon: base.icon || "✦",
    tagline: `Custom · ${entry.build} build`,
    rarity: "custom",
    dropChance: 0,
    custom: true
  };
  bodyShapeByKind[kind] = entry.shape;
  uniqueSpecialMechanics[kind] = uniqueSpecialMechanics[entry.ability];
  regularCharacterIds.push(kind);
  appendFighterCard(kind);
  return kind;
}

unlockableCharacterIds.forEach(appendFighterCard);
let customFighters = readCustomFighters();
customFighters.forEach(registerCustomFighter);

createUniverseBackdrop();
createStars();
createArena(arenaIndex);
updateArenaLabel();
refreshUnlockUI();
updateControlsHint();

const adminModal = document.querySelector("#admin-modal");
const adminGate = document.querySelector("#admin-gate");
const adminTools = document.querySelector("#admin-tools");
const adminCodeInput = document.querySelector("#admin-code-input");
const adminStatus = document.querySelector("#admin-status");
let adminAuthorized = false;

function tryUnlockAdmin() {
  if (adminCodeInput.value.trim() === "2015") {
    adminAuthorized = true;
    adminGate.hidden = true;
    adminTools.hidden = false;
    adminStatus.textContent = "";
  } else {
    adminStatus.textContent = "Incorrect admin code.";
  }
}

document.querySelector("#open-admin").addEventListener("click", () => {
  adminModal.hidden = false;
  adminGate.hidden = adminAuthorized;
  adminTools.hidden = !adminAuthorized;
  adminStatus.textContent = "";
  if (!adminAuthorized) {
    adminCodeInput.value = "";
    adminCodeInput.focus();
  }
});
document.querySelector("#close-admin").addEventListener("click", () => {
  adminModal.hidden = true;
});
document.querySelector("#unlock-admin").addEventListener("click", tryUnlockAdmin);
adminCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") tryUnlockAdmin();
});
document.querySelector("#admin-unlock-all").addEventListener("click", () => {
  unlockableCharacterIds.forEach((kind) => unlockedFighters.add(kind));
  entityUnlocked = true;
  saveUnlockedFighters();
  saveEntityUnlock();
  refreshUnlockUI();
  document.querySelector("#preview-note").textContent = `🔓 Admin unlocked all ${regularCharacterIds.length + 1} fighters!`;
  adminModal.hidden = true;
});
document.querySelector("#admin-boss-fight").addEventListener("click", () => {
  adminModal.hidden = true;
  beginSecretChallenge();
});
document.querySelector("#admin-next-track").addEventListener("click", nextMusicTrack);
document.querySelector("#admin-reset-unlocks").addEventListener("click", () => {
  unlockedFighters.clear();
  entityUnlocked = false;
  saveUnlockedFighters();
  try {
    window.localStorage.removeItem("universeCrazyEntitySkin");
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
  }
  if (!isFighterUnlocked(selectedFighter)) {
    selectedFighter = "bumble";
    document.querySelector('[data-fighter="bumble"]')?.click();
  }
  refreshUnlockUI();
  document.querySelector("#preview-note").textContent = "🔒 Unlocks reset to the 10 starter fighters.";
  adminModal.hidden = true;
});

function fillSelect(select, options) {
  select.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
}

const adminDifficulty = document.querySelector("#admin-difficulty");
fillSelect(adminDifficulty, Object.entries(difficultyLevels).map(([key, level]) => [key, level.label]));
adminDifficulty.value = cpuDifficulty;
adminDifficulty.addEventListener("change", () => {
  cpuDifficulty = adminDifficulty.value;
  document.querySelector("#difficulty-status").textContent = `CPU difficulty set to ${difficultyLevels[cpuDifficulty].label}.`;
});

fillSelect(document.querySelector("#custom-shape"), [
  ["standard", "Standard"], ["broad", "Broad"], ["round", "Round"], ["lanky", "Lanky"],
  ["petite", "Petite"], ["hourglass", "Hourglass"], ["pear", "Pear"]
]);
fillSelect(
  document.querySelector("#custom-ability"),
  Object.keys(uniqueSpecialMechanics)
    .filter((kind) => characters[kind] && !characters[kind].custom)
    .map((kind) => [kind, `${characters[kind].specialName} (${characters[kind].name})`])
);

document.querySelector("#custom-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("#custom-status");
  const name = document.querySelector("#custom-name").value.trim();
  if (!name) {
    status.textContent = "Give your character a name first.";
    return;
  }
  if (customFighters.length >= 20) {
    status.textContent = "Custom character limit reached (20).";
    return;
  }
  const entry = {
    id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`,
    name,
    shape: document.querySelector("#custom-shape").value,
    ability: document.querySelector("#custom-ability").value,
    primary: document.querySelector("#custom-primary").value,
    trim: document.querySelector("#custom-trim").value,
    build: document.querySelector("#custom-build").value
  };
  customFighters.push(entry);
  saveCustomFighters();
  const kind = registerCustomFighter(entry);
  bindFighterCard(document.querySelector(`[data-fighter="${kind}"]`));
  refreshUnlockUI();
  document.querySelector("#custom-name").value = "";
  status.textContent = `✓ ${name} created. Find them in the fighter grid.`;
});

document.querySelector("#enter-portal").addEventListener("click", () => {
  showSelection();
  startMusic().catch(handleMusicError);
});
document.querySelector("#back-to-portal").addEventListener("click", showPortal);
document.querySelector("#start-match").addEventListener("click", () => {
  if (battleMode === "online") {
    beginOnlineSearch();
    return;
  }
  startMatch();
});
document.querySelector("#leave-battle").addEventListener("click", showSelection);
document.querySelector("#rematch").addEventListener("click", () => {
  if (battleMode === "online") {
    showSelection();
    beginOnlineSearch();
    return;
  }
  startMatch(secretChallengeActive ? "entity" : null);
});
document.querySelector("#return-to-select").addEventListener("click", showSelection);
document.querySelector("#return-through-portal").addEventListener("click", showSelection);
const battleModeCycle = [
  { id: "explore", label: "Adventure: Entity.exe hunt", short: "ADVENTURE" },
  { id: "cpu", label: "Solo vs. 5 CPUs", short: "SOLO VS CPUS" },
  { id: "local", label: "Local 4-player", short: "LOCAL 4-PLAYER" },
  { id: "split", label: "Split-screen 1v1", short: "SPLIT-SCREEN 1V1" },
  { id: "online", label: "Online lobby: 2–6 players", short: "ONLINE LOBBY" }
];
function cycleBattleMode() {
  const currentIndex = battleModeCycle.findIndex((mode) => mode.id === battleMode);
  battleMode = battleModeCycle[(currentIndex + 1) % battleModeCycle.length].id;
  syncBattleModeUi();
}
function syncBattleModeUi() {
  const current = battleModeCycle.find((mode) => mode.id === battleMode);
  document.querySelector("#mode-label").textContent = current.label;
  updateControlsHint();
}
document.querySelector("#toggle-mode").addEventListener("click", cycleBattleMode);
syncBattleModeUi();

function onlineSnapshot(fighter) {
  return {
    kind: fighter.kind, x: fighter.x, y: fighter.y, z: fighter.z,
    vx: fighter.vx, vy: fighter.vy, vz: fighter.vz, facing: fighter.facing,
    grounded: fighter.grounded, crouching: fighter.crouching, hp: fighter.hp, damage: fighter.damage,
    stocks: fighter.stocks, invulnerable: fighter.invulnerable, respawn: fighter.respawn,
    attackPose: fighter.attackPose, kickPose: fighter.kickPose, poseTimer: fighter.poseTimer,
    hitFlash: fighter.hitFlash, powerBoost: fighter.powerBoost,
    falling: fighter.falling, eliminated: fighter.eliminated
  };
}

function applyOnlineSkin(fighter, skinId) {
  const skin = skinById(skinId);
  if (!skin.tint) return;
  fighter.visual.traverse((child) => {
    if (!child.isMesh || !child.material || !child.material.color) return;
    child.material = child.material.clone();
    child.material.color.lerp(new THREE.Color(skin.tint), 0.45);
    if (child.material.emissive) child.material.emissive.set(skin.emissive);
  });
}

function beginOnlineSearch() {
  if (!isSignedIn()) {
    openAccountFor("Sign up or log in to host or join an online match.");
    return;
  }
  hostOrJoinMatch(selectedFighter);
}

function fighterBySlot(slot) {
  return fighters.find((fighter) => fighter.remote && fighter.remoteSlot === slot) || null;
}

function checkLastStanding() {
  if (!matchActive || matchEnded) return;
  const standing = fighters.filter((fighter) => !fighter.eliminated);
  if (standing.length === 0) finishMatch(null, "Everyone was knocked out.");
  else if (standing.length === 1) finishMatch(fighters.indexOf(standing[0]), "Last fighter standing.");
}

setOnlineListeners({
  onAccountChanged(account) {
    if (account) adminAuthorized = true;
  },
  getFighterKind: () => selectedFighter,
  onMatchStart(message) {
    const { slot, arenaSeed, players } = message;
    onlineSlot = slot;
    clearExplore();
    if (Number.isFinite(arenaSeed) && !hiddenRealmActive) {
      arenaIndex = Math.floor(arenaSeed * arenaCount) % arenaCount;
      createArena(arenaIndex);
      updateArenaLabel();
    }
    onlineRemotes = players
      .filter((player) => player.slot !== slot)
      .sort((a, b) => a.slot - b.slot);
    battleMode = "online";
    syncBattleModeUi();
    startMatch();
    if (fighters[0]) applyOnlineSkin(fighters[0], currentSkinId());
  },
  onState(message) {
    const remote = fighterBySlot(message.slot);
    if (remote && message.snapshot) {
      if (remote.hp !== message.snapshot.hp || remote.damage !== message.snapshot.damage || remote.stocks !== message.snapshot.stocks) {
        hudDirty = true;
      }
      remote.remoteTarget = message.snapshot;
      remote.remoteReceivedAt = performance.now();
    }
  },
  onHit(message) {
    if (!matchActive || matchEnded) return;
    const attacker = fighterBySlot(message.from) || fighters[0];
    hitTarget(attacker, fighters[0], message.damage, message.force);
  },
  onProjectile(message) {
    const remote = fighterBySlot(message.slot);
    if (remote && matchActive && !matchEnded) spawnRemoteProjectile(remote, message.projectile);
  },
  onPlayerLeft(slot) {
    const remote = fighterBySlot(slot);
    if (!remote || remote.eliminated || !matchActive || matchEnded) return;
    remote.eliminated = true;
    remote.falling = false;
    removeKnockoutBlackHole(remote);
    remote.visual.visible = false;
    hudDirty = true;
    checkLastStanding();
  },
  onDisconnected() {
    if (matchActive && !matchEnded) finishMatch(null, "Connection to the server was lost.");
  },
  onProtocolError(error) {
    document.querySelector("#battle-status").textContent = error;
    document.querySelector("#screen-reader-status").textContent = error;
  },
  onResultSaved(result) {
    document.querySelector("#match-end-status").textContent = `Online record: ${result.wins} wins, ${result.matches} matches`;
  }
});
initOnlineUi();
restoreSession();

document.querySelector("#resolution-select").addEventListener("change", (event) => {
  setRenderQuality(Number(event.target.value), renderQuality.fps);
});
document.querySelector("#fps-select").addEventListener("change", (event) => {
  setRenderQuality(renderQuality.height, Number(event.target.value));
});
setRenderQuality(renderQuality.height, renderQuality.fps);
document.querySelector("#arena-previous").addEventListener("click", () => changeArena(-1));
document.querySelector("#arena-next").addEventListener("click", () => changeArena(1));
document.querySelector("#arena-random").addEventListener("click", () => changeArena(1 + Math.floor(Math.random() * (arenaCount - 1))));

function bindFighterCard(card) {
  card.addEventListener("click", () => {
    const kind = card.dataset.fighter;
    if (!isFighterUnlocked(kind)) {
      const info = characters[kind];
      const chancePct = Math.round((info.dropChance || 0.1) * 1000) / 10;
      document.querySelector("#preview-note").textContent = `🔒 ${info.name} is ${info.rarity} (${chancePct}% rare drop). Win matches to unlock!`;
      return;
    }
    selectedFighter = kind;
    updateFighterPreview(selectedFighter);
    updateControlsHint();
    document.querySelectorAll(".fighter-card").forEach((item) => {
      const selected = item === card;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
  });
}

document.querySelectorAll(".fighter-card").forEach(bindFighterCard);

window.addEventListener("keydown", (event) => {
  const supported = [
    "KeyA", "KeyD", "KeyW", "KeyS", "KeyQ", "KeyE", "Space", "KeyJ", "KeyK",
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", "ShiftRight",
    "KeyF", "KeyH", "KeyT", "KeyG", "KeyR", "KeyY", "KeyU", "KeyC", "KeyB", "ControlRight",
    "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad8",
    "AltLeft", "AltRight", "Digit0", "ShiftLeft"
  ];
  if (event.altKey && event.code.startsWith("Arrow")) event.preventDefault();
  if (!supported.includes(event.code)) return;
  if (matchActive || explore) event.preventDefault();
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
  applyRenderQuality();
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
