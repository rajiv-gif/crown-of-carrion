// Skirmish mode — pick-up fights with random maps, enemy pools, and pre-battle
// dice that auto-roll a fate for the party and an omen for the enemies.
// No narrative, no campaign progress, no choices. Just blood.

export const SKIRMISH_CARDS = [
  // Buffs
  {
    id: 'iron_fist',
    name: 'The Iron Fist',
    effect: 'Party deals +18% damage this fight.',
    tag: 'buff',
  },
  {
    id: 'hex_blooded',
    name: 'Hex-Blooded',
    effect: 'Sjen and Chibi enter with Might and Focus (2 turns).',
    tag: 'buff',
  },
  {
    id: 'hollow_rite',
    name: 'Hollow Rite',
    effect: 'All enemies start the fight Cursed (2 turns).',
    tag: 'buff',
  },
  {
    id: 'blind_terror',
    name: 'Blind Terror',
    effect: 'Enemies enter the fight in Fear (1 turn).',
    tag: 'buff',
  },
  {
    id: 'lucky_break',
    name: 'Lucky Break',
    effect: 'Party starts at 120% max HP — flesh bought on credit.',
    tag: 'buff',
  },
  // Debuffs
  {
    id: 'iron_shackle',
    name: 'Iron Shackle',
    effect: 'Party enters at -2 speed. The chains are invisible. They still drag.',
    tag: 'debuff',
  },
  {
    id: 'tainted_rations',
    name: 'Tainted Rations',
    effect: 'Every party member begins poisoned (2 turns, 4 power).',
    tag: 'debuff',
  },
  {
    id: 'bitter_loss',
    name: 'Bitter Loss',
    effect: 'Party deals -20% damage. Something broke before the fight started.',
    tag: 'debuff',
  },
  // Mixed
  {
    id: 'borrowed_time',
    name: 'Borrowed Time',
    effect: 'Party starts at 70% HP but deals +22% damage.',
    tag: 'mixed',
  },
  {
    id: 'doomed_bargain',
    name: 'Doomed Bargain',
    effect: '+25% party damage; enemies also deal +15% more.',
    tag: 'mixed',
  },
  {
    id: 'cold_contract',
    name: 'Cold Contract',
    effect: '+50% gold reward; party loses 1 speed each.',
    tag: 'mixed',
  },
  {
    id: 'dead_skin',
    name: 'Dead Skin',
    effect: 'Party deals -12% damage but each member starts shielded.',
    tag: 'mixed',
  },
  {
    id: 'the_long_march',
    name: 'The Long March',
    effect: 'Party -2 speed; enemies lose 3 speed.',
    tag: 'mixed',
  },
];

export const ENEMY_OMENS = [
  // Enemy buffs
  {
    id: 'frenzy',
    name: 'FRENZY',
    effect: 'All enemies deal +20% damage.',
    tag: 'buff',
  },
  {
    id: 'ironbones',
    name: 'IRONBONES',
    effect: 'All enemies enter with +25% max HP.',
    tag: 'buff',
  },
  {
    id: 'driven',
    name: 'DRIVEN',
    effect: 'All enemies gain +3 speed.',
    tag: 'buff',
  },
  {
    id: 'hollow_touched',
    name: 'HOLLOW-TOUCHED',
    effect: 'Transforming enemies ascend immediately on round 2.',
    tag: 'buff',
  },
  {
    id: 'fevered',
    name: 'FEVERED',
    effect: 'All enemies begin with Might (1 turn).',
    tag: 'buff',
  },
  {
    id: 'blessed',
    name: 'THE BLESSED',
    effect: 'All enemies begin the fight shielded.',
    tag: 'buff',
  },
  // Enemy debuffs
  {
    id: 'starved',
    name: 'STARVED',
    effect: 'All enemies deal -20% damage. Hunger has hollowed them.',
    tag: 'debuff',
  },
  {
    id: 'hollow_bones',
    name: 'HOLLOW-BONED',
    effect: 'All enemies enter with -20% max HP.',
    tag: 'debuff',
  },
  {
    id: 'lethargic',
    name: 'LETHARGIC',
    effect: 'All enemies lose 2 speed.',
    tag: 'debuff',
  },
];

// Non-boss enemies the skirmish pool can draw from.
const POOL = [
  'starved_villager',
  'pox_slinger',
  'plague_guard',
  'chained_thrall',
  'ashen_flagellant',
  'censer_knight',
  'choir_taxman',
  'hollow_guard',
  'reliquary_husk',
  'dogma_demon',
  'flesh_congregant',
  'catacomb_digger',
  'crowned_penitent',
  'carrion_pope',
];

// Battlefields that work for standalone fights (avoid boss-specific maps).
const FIELDS = ['marrowfen_mob', 'ash_road_ambush', 'cindershrive_gate', 'saint_without_face'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function rollSkirmish(difficulty) {
  const fieldId = pick(FIELDS);
  const count = difficulty === 'story' ? 2 : difficulty === 'grim' ? 3 : 4;
  const enemies = Array.from({ length: count }, () => pick(POOL));

  const baseGold = 22 + count * 9;
  const baseXp = 38 + count * 13;
  const diffMult = difficulty === 'story' ? 0.7 : difficulty === 'grim' ? 0.9 : 1;
  const fakeEnc = {
    name: 'Skirmish',
    enemies,
    gold: Math.round(baseGold * diffMult),
    xp: Math.round(baseXp * diffMult),
  };

  // Both sides roll their fate — no choices.
  const partyCard = pick(SKIRMISH_CARDS);
  const omen = pick(ENEMY_OMENS);

  return { fieldId, enemies, fakeEnc, pickedCard: partyCard.id, partyCard, omen };
}
