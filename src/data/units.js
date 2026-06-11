// Unit templates and encounter definitions.
// Stats are plain data; all ability logic lives in combat/engine.js.

export const PARTY = {
  lucian: {
    name: 'Lucian',
    epithet: 'Captain of the Black Tithe',
    sigil: '✠',
    color: 'var(--blood-bright)',
    hp: 104,
    atk: 14,
    speed: 8,
    abilities: ['basic_attack', 'cleave', 'execute', 'blood_command', 'tyrants_grip'],
    passive: 'Feast on Fear — when an enemy dies, Lucian heals 12 HP.',
  },
  sjen: {
    name: 'Sjen',
    epithet: 'Cursed Scholar',
    sigil: '☽',
    color: 'var(--hex)',
    hp: 62,
    atk: 10,
    speed: 6,
    abilities: ['basic_attack', 'rot_hex', 'bone_ward', 'debt_of_flesh', 'summon_wretch', 'whispering_pact'],
    passive: 'Keeps what he learns. Resents who he serves.',
  },
  veato: {
    name: 'Veato',
    epithet: 'Knife of Opportunity',
    sigil: '‡',
    color: 'var(--poison)',
    hp: 70,
    atk: 12,
    speed: 12,
    abilities: ['basic_attack', 'poison_blade', 'backstab', 'smoke_step', 'crippling_cut'],
    passive: 'Hidden Knife — when Lucian strikes, Veato may strike from his shadow.',
  },
};

export const ENEMIES = {
  starved_villager: {
    name: 'Starved Villager',
    sigil: '✕',
    sprite: 'villager',
    hp: 26,
    atk: 8,
    speed: 7,
    abilities: ['desperate_rush', 'rusted_blade', 'claw'],
  },
  infected_guard: {
    name: 'Infected Guard',
    sigil: '✕',
    sprite: 'guard',
    hp: 48,
    atk: 12,
    speed: 6,
    abilities: ['rotten_guard', 'plague_bite', 'rusted_blade'],
  },
  chained_thrall: {
    name: 'Chained Thrall',
    sigil: '✕',
    sprite: 'villager',
    hp: 36,
    atk: 9,
    speed: 9,
    abilities: ['desperate_rush', 'claw'],
  },
  debt_bound_knight: {
    name: 'The Debt-Bound Knight',
    epithet: "Vessik's True Collector",
    sigil: '✥',
    sprite: 'knight',
    boss: true,
    hp: 185,
    atk: 16,
    speed: 8,
    abilities: ['debt_mark', 'collection_swing', 'chain_tax', 'kneel_debtor', 'chain_lash', 'heavy_blow'],
  },
};

export const ENCOUNTERS = {
  marrowfen_mob: {
    name: 'The Starving of Marrowfen',
    opener:
      'Scythes, fence-stakes, and the slow courage of people who have already buried everything. The ledger opens.',
    enemies: ['starved_villager', 'starved_villager', 'infected_guard', 'infected_guard'],
    gold: 18,
    xp: 60,
  },
  debt_bound_knight: {
    name: 'The Debt-Bound Knight',
    opener:
      'Chains threaded through bone. A ledger nailed to a dead man’s back. The Knight does not hurry; debts never run far.',
    enemies: ['debt_bound_knight', 'chained_thrall'],
    gold: 65,
    xp: 110,
  },
};
