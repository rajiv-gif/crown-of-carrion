export const TERRAIN = {
  ash: {
    name: 'Ash',
    short: 'Open ground.',
  },
  cover: {
    name: 'Cover',
    short: 'Reduces incoming damage.',
  },
  high_ground: {
    name: 'High Ground',
    short: 'Attacks hit harder.',
  },
  holy_ground: {
    name: 'Holy Ground',
    short: 'Burns undead and demons.',
  },
  desecrated_altar: {
    name: 'Desecrated Altar',
    short: 'Empowers Sjen and Chibi hexes.',
  },
  corpse_pile: {
    name: 'Corpse Pile',
    short: 'Feeds undead ascension timers.',
  },
  blood_slick: {
    name: 'Blood Slick',
    short: 'Bleeding hurts more here.',
    moveCost: 2,
  },
  demon_rift: {
    name: 'Demon Rift',
    short: 'Strengthens demonic enemies.',
  },
  chain_trench: {
    name: 'Chain Trench',
    short: 'Costs 2 movement. The Knight punishes anyone caught here.',
    moveCost: 2,
  },
  debtor_seal: {
    name: 'Debtor Seal',
    short: 'Marked units standing here suffer at the start of their turn.',
  },
};

const defaultParty = {
  lucian: [1, 2],
  sjen: [0, 1],
  veato: [1, 3],
  chan: [0, 3],
  chibi: [0, 2],
  wretch: [2, 2],
};

const defaultEnemies = [
  [6, 1],
  [6, 3],
  [7, 2],
  [7, 0],
  [7, 4],
];

export const BATTLEFIELDS = {
  marrowfen_mob: {
    name: 'Marrowfen Chapel Yard',
    columns: 8,
    rows: 5,
    rules: ['Broken pews create cover.', 'Holy ground burns things that should have stayed buried.'],
    tiles: [
      { x: 2, y: 1, type: 'cover' },
      { x: 2, y: 3, type: 'cover' },
      { x: 3, y: 2, type: 'holy_ground' },
      { x: 5, y: 1, type: 'corpse_pile' },
      { x: 5, y: 3, type: 'blood_slick' },
    ],
    placements: { party: defaultParty, enemies: defaultEnemies },
  },
  debt_bound_knight: {
    name: 'Ledger Pit',
    columns: 12,
    rows: 8,
    rules: ['Crossing chain trenches costs 2 movement.', 'Debtor seals punish marked prey.', 'The Knight controls the central high ground.'],
    tiles: [
      { x: 2, y: 1, type: 'cover' },
      { x: 2, y: 6, type: 'cover' },
      { x: 4, y: 2, type: 'cover' },
      { x: 4, y: 5, type: 'cover' },
      { x: 5, y: 0, type: 'chain_trench' },
      { x: 5, y: 1, type: 'chain_trench' },
      { x: 5, y: 2, type: 'chain_trench' },
      { x: 5, y: 5, type: 'chain_trench' },
      { x: 5, y: 6, type: 'chain_trench' },
      { x: 5, y: 7, type: 'chain_trench' },
      { x: 6, y: 3, type: 'blood_slick' },
      { x: 6, y: 4, type: 'corpse_pile' },
      { x: 8, y: 1, type: 'debtor_seal' },
      { x: 8, y: 6, type: 'debtor_seal' },
      { x: 9, y: 3, type: 'high_ground' },
      { x: 9, y: 4, type: 'high_ground' },
      { x: 10, y: 3, type: 'desecrated_altar' },
    ],
    placements: {
      party: {
        lucian: [1, 3],
        sjen: [0, 2],
        veato: [1, 5],
        chan: [0, 5],
        chibi: [0, 3],
        wretch: [2, 4],
      },
      enemies: [
        [9, 3],
        [7, 5],
      ],
    },
  },
  ash_road_ambush: {
    name: 'Ash Road Toll Shrine',
    columns: 8,
    rows: 5,
    rules: ['The shrine empowers hexes.', 'Corpse piles hurry undead transformations.'],
    tiles: [
      { x: 2, y: 0, type: 'cover' },
      { x: 2, y: 4, type: 'cover' },
      { x: 3, y: 2, type: 'desecrated_altar' },
      { x: 4, y: 1, type: 'corpse_pile' },
      { x: 4, y: 3, type: 'blood_slick' },
      { x: 6, y: 2, type: 'high_ground' },
    ],
    placements: { party: defaultParty, enemies: defaultEnemies },
  },
  cindershrive_gate: {
    name: 'Cindershrive Gate',
    columns: 8,
    rows: 5,
    rules: ['Gate debris grants cover.', 'Holy ground punishes demons near the gate.'],
    tiles: [
      { x: 1, y: 1, type: 'cover' },
      { x: 2, y: 3, type: 'cover' },
      { x: 3, y: 2, type: 'holy_ground' },
      { x: 5, y: 2, type: 'corpse_pile' },
      { x: 6, y: 1, type: 'high_ground' },
      { x: 6, y: 3, type: 'demon_rift' },
    ],
    placements: { party: defaultParty, enemies: defaultEnemies },
  },
  saint_without_face: {
    name: 'Faceless Reliquary',
    columns: 8,
    rows: 5,
    rules: ['The rift empowers demons.', 'Desecrated altars make hexes crueler.'],
    tiles: [
      { x: 2, y: 2, type: 'desecrated_altar' },
      { x: 3, y: 1, type: 'holy_ground' },
      { x: 3, y: 3, type: 'blood_slick' },
      { x: 5, y: 2, type: 'demon_rift' },
      { x: 6, y: 1, type: 'corpse_pile' },
      { x: 6, y: 3, type: 'high_ground' },
    ],
    placements: {
      party: defaultParty,
      enemies: [
        [6, 2],
        [5, 1],
        [5, 3],
      ],
    },
  },
};

export function battlefieldFor(encounterId) {
  return BATTLEFIELDS[encounterId] || BATTLEFIELDS.ash_road_ambush;
}

export function terrainAt(field, tile) {
  if (!field || !tile) return TERRAIN.ash;
  const found = field.tiles.find((t) => t.x === tile.x && t.y === tile.y);
  return found ? { ...TERRAIN[found.type], type: found.type } : { ...TERRAIN.ash, type: 'ash' };
}
