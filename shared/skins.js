// Online skins shared by the game client and the multiplayer server.
// A skin unlocks after the given number of online wins.
export const ONLINE_SKINS = [
  { id: "none", label: "Standard", wins: 0, tint: null, emissive: null },
  { id: "neon", label: "Neon", wins: 1, tint: "#38f5ff", emissive: "#0a7d8c" },
  { id: "gold", label: "Gold", wins: 3, tint: "#ffd166", emissive: "#7a5200" },
  { id: "chrome", label: "Chrome", wins: 5, tint: "#d8dde8", emissive: "#3a3f4c" },
  { id: "inferno", label: "Inferno", wins: 10, tint: "#ff5a3c", emissive: "#7a1a08" },
  { id: "void", label: "Void", wins: 20, tint: "#8b5cff", emissive: "#2a0f6e" }
];

export function skinById(id) {
  return ONLINE_SKINS.find((skin) => skin.id === id) || ONLINE_SKINS[0];
}

export function unlockedSkins(wins) {
  return ONLINE_SKINS.filter((skin) => wins >= skin.wins);
}
