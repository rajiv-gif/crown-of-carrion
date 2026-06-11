// Sin-based progression. No Strength. No Intelligence. Only what rots, sharpened.
// Each rank in a sin maps to hidden mechanical stats via deriveMods().

export const SINS = {
  pride: {
    name: 'Pride',
    mech: '+2 damage · +10% fear resistance · Execute strikes 30% harder',
    flavor: {
      lucian: 'Lucian’s presence becomes harder to deny. Men lower their eyes. Beasts hesitate.',
      default: 'The refusal to kneel becomes a weapon in itself.',
    },
  },
  wrath: {
    name: 'Wrath',
    mech: '+8% vicious blows (1.5×) · bleeds cut 2 deeper · rank 2: kills grant Might',
    flavor: {
      lucian: 'The violence stops being a means. Each kill begs for the next.',
      veato: 'Veato’s knives stop being tools. They become appetites.',
      default: 'Rage, banked and fed, until it burns clean.',
    },
  },
  gluttony: {
    name: 'Gluttony',
    mech: '+12 max health · Feast on Fear heals +3 · poison and rot bite 1 less',
    flavor: {
      lucian: 'Lucian drinks the moment of death deeper, and his body holds more than a body should.',
      sjen: 'Sjen consumes what the rituals leave over. He has stopped being delicate about it.',
      default: 'Take more than the body should hold. Hold it anyway.',
    },
  },
  cruelty: {
    name: 'Cruelty',
    mech: 'blows have +10% chance to leave Fear · Tyrant’s Grip terror lasts 1 turn longer',
    flavor: {
      lucian: 'Pain stops being a by-product. It becomes the message.',
      default: 'Suffering, applied deliberately, like a seal in wax.',
    },
  },
  ambition: {
    name: 'Ambition',
    mech: '+15% experience · +1 damage per 25 corruption',
    flavor: {
      lucian: 'The Crown whispers, and something in Lucian leans toward the sound.',
      sjen: 'Sjen no longer studies power. He rehearses for it.',
      default: 'The need to rise, fed until it stops feeling like a need and starts feeling like a right.',
    },
  },
  cunning: {
    name: 'Cunning',
    mech: 'cooldowns shortened (up to −2) · curses and venom eat 1 deeper',
    flavor: {
      sjen: 'Sjen listens longer before speaking. The dead whisper. The living reveal more than they intend.',
      veato: 'Veato learns the pause before the lie that makes the lie land.',
      default: 'Patience with a blade in it.',
    },
  },
  envy: {
    name: 'Envy',
    mech: '+15% damage against bosses and elites · rank 2: tear Might out of enemies',
    flavor: {
      sjen: 'What others wield, Sjen catalogues — and plans to own.',
      veato: 'Every better-paid blade in Veyrath is a personal insult awaiting correction.',
      default: 'Hatred of those above you, refined into reach.',
    },
  },
  deceit: {
    name: 'Deceit',
    mech: '+5% chance to slip any blow · Backstab cuts 25% deeper into the weakened',
    flavor: {
      sjen: 'Sjen’s truths arrive pre-bent.',
      veato: 'Veato exists slightly to the left of wherever you are looking.',
      default: 'Hidden intent, worn like a second skin.',
    },
  },
  greed: {
    name: 'Greed',
    mech: '+15% gold from contracts · +10% chance to find extra loot after battle',
    flavor: {
      veato: 'Veato learns that every corpse has pockets, and every oath has a price.',
      default: 'Hunger with a ledger.',
    },
  },
};

// Which sins each character can feed at ascension.
export const SIN_PATHS = {
  lucian: ['pride', 'wrath', 'gluttony', 'cruelty', 'ambition'],
  sjen: ['cunning', 'envy', 'deceit', 'gluttony', 'ambition'],
  veato: ['greed', 'deceit', 'envy', 'cunning', 'wrath'],
};

// The hidden translation layer: sins → mechanical stats.
export function deriveMods(sins = {}) {
  const r = (k) => sins[k] || 0;
  return {
    atk: 2 * r('pride'),
    maxHp: 12 * r('gluttony'),
    fearResist: 0.1 * r('pride'),
    executeBonus: 0.3 * r('pride'),
    crit: 0.08 * r('wrath'),
    bleedPower: 2 * r('wrath'),
    killMomentum: r('wrath') >= 2,
    feastBonus: 3 * r('gluttony'),
    dotResist: r('gluttony'),
    onHitFear: 0.1 * r('cruelty'),
    gripBonus: r('cruelty'),
    cdr: Math.min(2, r('cunning')),
    hexPower: r('cunning'),
    bossMult: 1 + 0.15 * r('envy'),
    buffSteal: r('envy') >= 2,
    dodge: 0.05 * r('deceit'),
    backstabBonus: 0.25 * r('deceit'),
    goldMult: 1 + 0.15 * r('greed'),
    lootChance: 0.1 * r('greed'),
    xpMult: 1 + 0.15 * r('ambition'),
    corrAtk: r('ambition'), // +1 atk per 25 corruption per rank
  };
}

// Skill locks: the party starts with a basic strike plus one signature
// each. Everything else is corruption becoming practical power — feeding
// the right sin unlocks it. Visible, never hidden.
export const ABILITY_UNLOCKS = {
  // Lucian
  execute: { char: 'lucian', sins: ['wrath', 'pride'] },
  blood_command: { char: 'lucian', sins: ['pride', 'cruelty'] },
  tyrants_grip: { char: 'lucian', sins: ['cruelty', 'ambition'] },
  feast_on_fear: { char: 'lucian', sins: ['gluttony', 'wrath', 'ambition'], passive: 'Feast on Fear' },
  // Sjen
  bone_ward: { char: 'sjen', sins: ['cunning'] },
  debt_of_flesh: { char: 'sjen', sins: ['cruelty', 'gluttony'] },
  summon_wretch: { char: 'sjen', sins: ['ambition', 'envy'] },
  whispering_pact: { char: 'sjen', sins: ['cunning', 'envy', 'ambition'] },
  // Veato
  backstab: { char: 'veato', sins: ['deceit', 'envy'] },
  smoke_step: { char: 'veato', sins: ['deceit', 'cunning'] },
  crippling_cut: { char: 'veato', sins: ['wrath', 'deceit'] },
  hidden_knife: { char: 'veato', sins: ['greed', 'opportunism', 'envy'], passive: 'Hidden Knife' },
};

export function abilityUnlocked(id, sins) {
  const req = ABILITY_UNLOCKS[id];
  if (!req) return true; // basics are always available
  return req.sins.some((s) => (sins?.[req.char]?.[s] || 0) > 0);
}

export function unlockHint(id) {
  const req = ABILITY_UNLOCKS[id];
  if (!req) return '';
  const names = req.sins.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return `Locked — feed ${names.join(' or ')}.`;
}

// Tension tiers gate all escalation. Betrayal is earned, never random noise.
export function tensionTier(t) {
  if (t >= 90) return 'critical';
  if (t >= 65) return 'high';
  if (t >= 40) return 'medium';
  return 'low';
}
