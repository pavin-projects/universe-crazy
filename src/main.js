import * as THREE from "three";

function initializeUniverseCrazy() {
const canvasRoot = document.querySelector("#scene");
const graphicsError = document.querySelector("#graphics-error");
const graphicsErrorMessage = document.querySelector("#graphics-error-message");
const knockoutFlash = document.querySelector("#knockout-flash");
const knockoutName = document.querySelector("#knockout-name");
const cutsceneOverlay = document.querySelector("#cutscene-overlay");
const cutsceneEyebrow = document.querySelector("#cutscene-eyebrow");
const cutsceneTitle = document.querySelector("#cutscene-title");
const cutsceneSubtitle = document.querySelector("#cutscene-subtitle");
let cutsceneTimer = 0;

function playCutscene(eyebrow, title, subtitle, duration = 2.1) {
  cutsceneEyebrow.textContent = eyebrow;
  cutsceneTitle.textContent = title;
  cutsceneSubtitle.textContent = subtitle;
  cutsceneOverlay.hidden = false;
  cutsceneTimer = duration;
}

function endCutscene() {
  cutsceneTimer = 0;
  cutsceneOverlay.hidden = true;
}

document.querySelector("#cutscene-skip").addEventListener("click", endCutscene);
const storageNotice = document.querySelector("#storage-notice");
const fullscreenButton = document.querySelector("#toggle-fullscreen");
const fullscreenNotice = document.querySelector("#fullscreen-notice");
document.querySelector("#retry-graphics").addEventListener("click", () => window.location.reload());
const musicButton = document.querySelector("#toggle-music");
const musicButtonLabel = document.querySelector("#music-toggle-label");
const musicTrackButton = document.querySelector("#next-track");
const musicTrackLabel = document.querySelector("#music-track-label");
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
  musicButtonLabel.textContent = `Music: ${musicEnabled ? "On" : "Off"}`;
  musicButton.setAttribute("aria-pressed", String(musicEnabled));
  musicButton.setAttribute("aria-label", musicEnabled ? "Mute music" : "Turn music on");
  musicTrackLabel.textContent = `Track ${currentTrackIndex + 1}/30 · ${track.title}`;
}

function handleMusicError(error) {
  if (!(error instanceof DOMException)
    || !["NotAllowedError", "InvalidStateError"].includes(error.name)) throw error;
  musicStatus.textContent = "Music could not start. Try pressing the music button again.";
}

async function startMusic() {
  if (!musicEnabled) return;
  if (!window.AudioContext) {
    musicEnabled = false;
    musicStatus.textContent = "Music is not supported by this browser.";
    musicButton.disabled = true;
    musicTrackButton.disabled = true;
    musicButtonLabel.textContent = "Music unavailable";
    musicButton.setAttribute("aria-pressed", "false");
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

musicButton.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  updateMusicButton();
  if (musicEnabled) {
    startMusic().catch(handleMusicError);
  } else {
    pauseMusic();
    musicStatus.textContent = "Music muted.";
  }
});
musicTrackButton.addEventListener("click", nextMusicTrack);
updateMusicButton();
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
const starterCharacterIds = ["bumble", "robot", "nova", "titan", "glitch", "tide", "frog", "dinosaur", "monkey", "lizard"];
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
const frameInterval = 1000 / 60;
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
    special: "phase",
    specialName: "Acro Blink",
    specialDescription: "Blinks behind a rival for a quick hit.",
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
    special: "banana",
    specialName: "Cartoon Gag",
    specialDescription: "Drops a classic slipping banana peel!",
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
    special: "phase",
    specialName: "Hop Warp",
    specialDescription: "Blinks behind a rival in one hop.",
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
    special: "banana",
    specialName: "Slippery Fondue",
    specialDescription: "Drops a slippery gag on the arena.",
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
    special: "bite",
    specialName: "Timber Bite",
    specialDescription: "Chomps forward with iron teeth.",
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
    specialName: "Cosmic Flame",
    specialDescription: "Breathes a devastating cone of starfire.",
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

  if (kind === "entity") root.scale.setScalar(1.4);
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
    attackPose: 0, hitFlash: 0, slipTimer: 0, powerBoost: 0, respawn: 0, falling: false, eliminated: false,
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
  const specialKeys = ["K", "Shift", "U", "Numpad 2"];
  const localFighters = fighters.length
    ? fighters.map((fighter) => fighter.kind)
    : [selectedFighter, ...regularCharacterIds.filter((kind) => kind !== selectedFighter).slice(0, 3)];
  const localSpecials = localFighters.map((kind, index) => {
    return `P${index + 1} ${characters[kind].specialName} (${specialKeys[index]})`;
  }).join(" · ");
  const controls = battleMode === "cpu"
    ? `Solo vs. 3 CPUs: WASD move · Space jump · J fight · K: ${characters[selectedFighter].specialName}`
    : `Local 4-player: P1 WASD/J · P2 Arrows/Enter · P3 TFGH/Y · P4 Numpad · Specials: ${localSpecials}`;
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
  const opponentPool = regularCharacterIds.filter((kind) => kind !== selectedFighter && isFighterUnlocked(kind));
  const fallbackPool = starterCharacterIds.filter((kind) => kind !== selectedFighter);
  const activePool = opponentPool.length >= 3 ? opponentPool : [...opponentPool, ...fallbackPool];
  const fighterCount = secretChallengeActive ? 2 : 4;
  fighters.push(makeFighter(selectedFighter, 0));
  for (let index = 1; index < fighterCount; index += 1) {
    const kind = index === 1 && opponentOverride
      ? opponentOverride
      : activePool[(index - 1) % activePool.length];
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
    dinosaur: "Raaawr!",
    monkey: "Ooh ooh aah!",
    lizard: "Stay cool!"
  };
  fighters.forEach((fighter) => createSpeechBubble(fighter, openingLines[fighter.kind] || characters[fighter.kind].openingLine || "Let's fight!"));
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
  const rivalNames = fighters.slice(1).map((fighter) => characters[fighter.kind].name).join(" • ");
  const arenaTitle = hiddenRealmActive ? secretTheme.name : arenaThemes[Math.floor(arenaIndex / 20) % arenaThemes.length].name;
  playCutscene(
    secretChallengeActive ? "SECRET BOSS CUTSCENE" : "PORTAL CUTSCENE",
    secretChallengeActive ? "ENTITY.EXE AWAKENS" : `ENTERING ${arenaTitle.toUpperCase()}`,
    secretChallengeActive ? "Defeat Entity.exe in The Null Abyss to unlock the secret skin!" : `${characters[fighters[0].kind].name} vs. ${rivalNames}`,
    secretChallengeActive ? 2.6 : 1.9
  );
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
  endCutscene();
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
  matchActive = false;
  document.querySelector("#select-screen").hidden = true;
  document.querySelector("#battle-hud").hidden = true;
  document.querySelector("#match-end").hidden = true;
  document.querySelector("#touch-controls").hidden = true;
  document.querySelector("#portal-screen").hidden = false;
  endCutscene();
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
      playCutscene("RARE UNLOCK!", `${characters[dropped].name.toUpperCase()} UNLOCKED!`, `${characters[dropped].rarity} Fighter · Special: ${characters[dropped].specialName}`, 2.5);
    }
  }
  document.querySelector("#winner-title").textContent = winner ? `${characters[winner.kind].name.toUpperCase()} WINS` : "TIME!";
  document.querySelector("#winner-message").textContent = winner
    ? `${characters[winner.kind].name} takes the arena. ${reason}${unlockMessage}`
    : reason;
  document.querySelector("#match-end").hidden = false;
  document.querySelector("#screen-reader-status").textContent = document.querySelector("#winner-message").textContent;
}

function launchProjectile(fighter, options = {}) {
  const {
    color = "#ffe36f",
    emissive = "#ff9d35",
    radius = 0.27,
    speed = 13,
    life = 1.5,
    damage = 9,
    force = 4.2,
    vz = 0,
    offsetZ = 0,
    shape = "sphere",
    hazard = false
  } = options;
  const geometry = shape === "star"
    ? new THREE.OctahedronGeometry(radius, 1)
    : shape === "wave"
      ? new THREE.TorusGeometry(radius * 1.2, radius * 0.24, 8, 24)
      : shape === "banana"
        ? new THREE.TorusGeometry(radius * 1.05, radius * 0.32, 8, 16, Math.PI * 1.15)
        : new THREE.SphereGeometry(radius, 16, 12);
  const startY = hazard ? fighter.y + 0.85 : fighter.y + 1.35;
  const projectile = addMesh(arena, geometry, new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: hazard ? 0.55 : 2.3, roughness: 0.2
  }), [fighter.x + fighter.facing * 0.8, startY, fighter.z + offsetZ]);
  if (!hazard) {
    const halo = addMesh(projectile, new THREE.TorusGeometry(radius * 1.45, 0.025, 8, 24), new THREE.MeshBasicMaterial({ color }), [0, 0, 0]);
    halo.rotation.x = Math.PI / 2;
  } else {
    projectile.rotation.x = Math.PI / 2;
  }
  projectile.userData.spin = 4;
  projectiles.push({
    mesh: projectile,
    owner: fighter,
    vx: fighter.facing * speed,
    vy: hazard ? 4.2 : 0,
    vz,
    life,
    damage,
    force,
    hitRadius: radius + 0.55,
    hazard,
    armTimer: hazard ? 0.45 : 0,
    power: characters[fighter.kind].power * (fighter.powerBoost > 0 ? 1.7 : 1)
  });
}

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
    hitTarget(fighter, target, damage * characters[fighter.kind].power * boost, force);
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
    if (distance <= 0.35 || distance > 4.5 || Math.abs(target.z - fighter.z) > width) continue;
    hitTarget(fighter, target, 11 * characters[fighter.kind].power * boost, 5.8);
  }
}

function useSpecialAbility(fighter) {
  const character = characters[fighter.kind];
  document.querySelector("#battle-status").textContent = `${character.name} used ${character.specialName}!`;
  const boost = fighter.powerBoost > 0 ? 1.7 : 1;

  switch (character.special) {
    case "sting":
      launchProjectile(fighter, { color: "#ffe36f", emissive: "#ff9d35", damage: 10, force: 4.8 });
      break;
    case "dash": {
      fighter.vx = fighter.facing * 14;
      const target = nearestOpponent(fighter);
      if (target && (target.x - fighter.x) * fighter.facing > -0.5
        && Math.abs(target.z - fighter.z) < 1.9
        && Math.hypot(target.x - fighter.x, target.z - fighter.z) < 3.3) {
        hitTarget(fighter, target, 13 * character.power * boost, 6.8);
      }
      spawnAbilityRing(fighter, "#53e9f4", 0.3);
      break;
    }
    case "starburst":
      [-1, 0, 1].forEach((spread) => launchProjectile(fighter, {
        shape: "star",
        color: "#ff9fea",
        emissive: "#bf5aff",
        radius: 0.22,
        speed: 11,
        life: 1.35,
        damage: 6.5,
        force: 3.6,
        vz: spread * 2.8,
        offsetZ: spread * 0.13
      }));
      break;
    case "quake":
      applyAreaAbility(fighter, { radius: 3.7, damage: 14, force: 7.2, color: "#ff8b4c" });
      break;
    case "phase": {
      const target = nearestOpponent(fighter);
      spawnAbilityRing(fighter, "#ff5dcc", 0.3);
      if (!target) {
        fighter.vx = fighter.facing * 9;
        break;
      }
      fighter.x = THREE.MathUtils.clamp(target.x - target.facing * 1.2, -floorRadius + 1, floorRadius - 1);
      fighter.z = THREE.MathUtils.clamp(target.z, -floorRadius + 1, floorRadius - 1);
      fighter.facing = Math.sign(target.x - fighter.x) || fighter.facing;
      fighter.visual.position.set(fighter.x, fighter.y, fighter.z);
      spawnAbilityRing(fighter, "#ff5dcc", 0.3);
      if (Math.hypot(target.x - fighter.x, target.z - fighter.z) < 2.1) {
        hitTarget(fighter, target, 13 * character.power * boost, 5.7);
      }
      break;
    }
    case "wave":
      launchProjectile(fighter, {
        shape: "wave",
        color: "#80f8e6",
        emissive: "#38c9ff",
        radius: 0.62,
        speed: 8.5,
        life: 1.7,
        damage: 13,
        force: 7.4
      });
      break;
    case "tongue": {
      const target = fighters
        .filter((opponent) => opponent !== fighter && !opponent.eliminated && opponent.respawn <= 0)
        .filter((opponent) => {
          const dx = opponent.x - fighter.x;
          const dz = opponent.z - fighter.z;
          return dx * fighter.facing > 0 && Math.abs(dz) < 1.8 && Math.hypot(dx, dz) < 5.4;
        })
        .sort((a, b) => Math.hypot(a.x - fighter.x, a.z - fighter.z) - Math.hypot(b.x - fighter.x, b.z - fighter.z))[0];
      if (target) {
        spawnTongueEffect(fighter, target);
        hitTarget(fighter, target, 10 * character.power * boost, 3.6);
        target.vx += Math.sign(fighter.x - target.x) * 4.2;
        target.vz += Math.sign(fighter.z - target.z || 1) * 2;
      }
      break;
    }
    case "fire":
      spawnFireBreath(fighter);
      break;
    case "bite": {
      fighter.vx = fighter.facing * 10.5;
      spawnAbilityRing(fighter, "#63b3ff", 0.34);
      const target = nearestOpponent(fighter);
      if (target && (target.x - fighter.x) * fighter.facing > -0.5
        && Math.abs(target.z - fighter.z) < 1.9
        && Math.hypot(target.x - fighter.x, target.z - fighter.z) < 3.1) {
        hitTarget(fighter, target, 13.5 * character.power * boost, 6.2);
      }
      break;
    }
    case "banana":
      launchProjectile(fighter, {
        shape: "banana",
        color: "#ffe135",
        emissive: "#b89600",
        radius: 0.34,
        speed: 6.4,
        life: 7,
        damage: 6,
        force: 4.5,
        hazard: true
      });
      break;
    case "void":
      applyAreaAbility(fighter, { radius: 4.6, damage: 13, force: 5.6, color: "#b774ff", pull: true });
      break;
    default:
      throw new Error(`Unknown special ability "${character.special}" for ${character.name}.`);
  }
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
  if (special) {
    fighter.cooldown = 0.55;
    fighter.attackPose = 0.55;
    fighter.specialCooldown = 4;
    useSpecialAbility(fighter);
    return;
  }

  fighter.cooldown = 0.42;
  fighter.attackPose = 0.34;

  if (!target) {
    const reach = 2.15;
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
  const inReach = Math.hypot(dx, dz) < 2.15;
  const inFront = dx * fighter.facing > -0.65;
  if (inReach && Math.abs(dz) < 1.75 && inFront) {
    const boost = fighter.powerBoost > 0 ? 1.7 : 1;
    hitTarget(fighter, target, 7 * characters[fighter.kind].power * boost, 3.8);
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

  if (fighter.slipTimer <= 0) readInput(fighter, index, delta);
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
  if (fighter.slipTimer > 0) {
    body.rotation.z = fighter.facing * 1.15;
    body.rotation.x = -0.55;
  } else {
    body.rotation.z = swing * -fighter.facing * 0.22 - fighter.vx * 0.012;
    body.rotation.x = fighter.grounded
      ? Math.sin(elapsed * 2.1 + fighter.cpuThinkTime) * 0.025 * (1 - movement)
      : -0.1;
  }
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
    if (projectile.hazard) {
      projectile.armTimer = Math.max(0, projectile.armTimer - delta);
      if (projectile.mesh.position.y > 0.16) {
        projectile.vy -= 18 * delta;
        projectile.mesh.position.x += projectile.vx * delta;
        projectile.mesh.position.y = Math.max(0.16, projectile.mesh.position.y + projectile.vy * delta);
        projectile.mesh.position.z += projectile.vz * delta;
      } else {
        projectile.vx *= Math.exp(-8 * delta);
        projectile.mesh.position.x += projectile.vx * delta;
      }
      projectile.mesh.rotation.z += delta * 2.2;
      for (const target of fighters) {
        if (target.eliminated || target.respawn > 0) continue;
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
          } else {
            hitTarget(projectile.owner, target, projectile.damage * projectile.power, projectile.force);
            document.querySelector("#battle-status").textContent = `${characters[target.kind].name} slipped on a banana peel!`;
          }
          projectile.life = 0;
          break;
        }
      }
    } else {
      projectile.mesh.position.x += projectile.vx * delta;
      projectile.mesh.position.z += projectile.vz * delta;
      projectile.mesh.rotation.y += delta * 4;
      for (const target of fighters) {
        if (target === projectile.owner || target.eliminated || target.respawn > 0) continue;
        const dx = projectile.mesh.position.x - target.x;
        const dy = projectile.mesh.position.y - (target.y + 1.3);
        const dz = projectile.mesh.position.z - target.z;
        if (dx * dx + dy * dy + dz * dz < projectile.hitRadius * projectile.hitRadius) {
          hitTarget(projectile.owner, target, projectile.damage * projectile.power, projectile.force);
          projectile.life = 0;
          break;
        }
      }
    }
    if (projectile.life <= 0 || Math.abs(projectile.mesh.position.x) > 12) {
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
        if (part.userData.orbitSpeed) part.position.applyAxisAngle(yAxis, delta * part.userData.orbitSpeed);
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
  if (cutsceneTimer > 0) {
    cutsceneTimer = Math.max(0, cutsceneTimer - delta);
    if (cutsceneTimer === 0) cutsceneOverlay.hidden = true;
  }
  justPressed.clear();
  if (!graphicsContextLost) renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(frame);
}

function isFighterUnlocked(kind) {
  if (kind === "entity") return entityUnlocked;
  return starterCharacterIds.includes(kind) || unlockedFighters.has(kind);
}

function refreshUnlockUI() {
  const totalCount = regularCharacterIds.length + 1;
  const unlockedCount = starterCharacterIds.length + unlockedFighters.size + (entityUnlocked ? 1 : 0);
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
unlockableCharacterIds.forEach((kind) => {
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
    <span class="pick-indicator" aria-hidden="true">🔒</span>
  `;
  fighterGrid.insertBefore(button, entityCard);
});

createUniverseBackdrop();
createStars();
createArena(arenaIndex);
updateArenaLabel();
refreshUnlockUI();
updateControlsHint();

document.querySelector("#roll-unlock").addEventListener("click", () => {
  const unlocked = rollRareUnlock(1.35);
  if (unlocked) {
    const info = characters[unlocked];
    document.querySelector("#preview-note").textContent = `🎉 UNLOCKED ${info.name} (${info.rarity})! Special: ${info.specialName} — ${info.specialDescription}`;
    document.querySelector(`[data-fighter="${unlocked}"]`)?.click();
  } else {
    const remaining = unlockableCharacterIds.filter((kind) => !unlockedFighters.has(kind)).length;
    document.querySelector("#preview-note").textContent = remaining
      ? `No drop this roll — ${remaining} rare fighters still locked! Keep rolling or win matches!`
      : "All 63 fighters are unlocked!";
  }
});

const adminModal = document.querySelector("#admin-modal");
const adminGate = document.querySelector("#admin-gate");
const adminTools = document.querySelector("#admin-tools");
const adminCodeInput = document.querySelector("#admin-code-input");
const adminStatus = document.querySelector("#admin-status");
let adminAuthorized = false;

function tryUnlockAdmin() {
  if (adminCodeInput.value.trim() === "2058") {
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
  document.querySelector("#preview-note").textContent = "🔓 Admin unlocked all 63 fighters!";
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

document.querySelector("#enter-portal").addEventListener("click", () => {
  showSelection();
  startMusic().catch(handleMusicError);
});
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
    const kind = card.dataset.fighter;
    if (!isFighterUnlocked(kind)) {
      const info = characters[kind];
      const chancePct = Math.round((info.dropChance || 0.1) * 1000) / 10;
      document.querySelector("#preview-note").textContent = `🔒 ${info.name} is ${info.rarity} (${chancePct}% rare drop). Win matches or use Mystery Roll to unlock!`;
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
