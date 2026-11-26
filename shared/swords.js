// Swords unlock by online wins on a signed-in account. They cannot be bought or created, and only work in single-player (CPU) matches.
export const SWORD_TIERS = [
  { id: "moonlight", label: "Moonlight Blade", wins: 1, damage: 9, color: "#bfe6ff" },
  { id: "comet", label: "Comet Blade", wins: 5, damage: 14, color: "#ffd166" },
  { id: "nova", label: "Nova Blade", wins: 15, damage: 40, color: "#ff7ad9" },
  { id: "trillion", label: "Trillion Blade", wins: 30, damage: 1e12, color: "#8b5cff" }
];

export function swordForWins(wins) {
  let best = null;
  for (const tier of SWORD_TIERS) {
    if (wins >= tier.wins) best = tier;
  }
  return best;
}

export function nextSwordTier(wins) {
  return SWORD_TIERS.find((tier) => wins < tier.wins) || null;
}
