// The campaign: five debts. Chapter I is playable; II–V are scaffolded
// here (names, regions, bosses, lock requirements) so content can land
// later without touching the save system or the map again.
//
// Copy rules: `region`, `requires`, and status text are functional —
// short, title-case, no poetry. Flavor lives only in `theme` and `omens`,
// and omens are short fragments, never long italic sentences.

export const CAMPAIGN_TAGLINE =
  'The Carrion Crown is not taken in one night. Five debts must be paid. The first two are playable now.';

export const CHAPTERS = [
  {
    id: 1,
    numeral: 'I',
    name: 'The Butcher’s Debt',
    theme: 'Debt, plague, and the first sliver of crownmetal.',
    factionId: 'plague_barons',
    factionName: 'The Plague Barons',
    boss: 'The Debt-Bound Knight',
    bossEncounter: 'debt_bound_knight',
    region: 'Marrowfen / The Lowlands',
    regionId: 'marrowfen',
    danger: 'Grim',
    omens: 'Plague pits. Starving mobs. A collector who cannot stop collecting.',
    missions: [
      {
        id: 'butchers_debt',
        script: 'butchers_debt',
        name: 'The Butcher’s Debt',
        patron: 'Baron Vessik, Plague Baron',
        desc: 'Collect seven years of tithe from a village that has nothing left but bodies, secrets, and one thing the Baron never mentioned.',
      },
    ],
  },
  {
    id: 2,
    numeral: 'II',
    name: 'The Ashen Tithe',
    theme: 'Religion as poison: purity laws, invented enemies, and hatred sold as absolution.',
    factionId: 'ashen_church',
    factionName: 'The Ashen Church',
    boss: 'The Saint Without a Face',
    region: 'The Ash Roads / Cindershrive',
    regionId: 'ash_roads',
    danger: 'Dire',
    omens: 'Execution fields. Relic processions. Neighbors taught to hate on command. Dead doctrine walking.',
    requires: 'Complete Chapter I',
    unlockedCopy: 'The Ash Roads and Cindershrive are open. The Church has started turning neighbors into enemies.',
    missions: [
      {
        id: 'ashen_tithe',
        script: 'ashen_tithe',
        name: 'The Ashen Tithe',
        patron: 'Chan, Merchant of Necessary Evils',
        desc: 'A cynical merchant offers the route to Cindershrive, a ledger of Church indulgences, and proof that hatred can be itemized.',
      },
      {
        id: 'saint_without_face',
        script: 'saint_without_face',
        name: 'The Saint Without a Face',
        patron: 'No one living',
        desc: 'The Ashen Church keeps a faceless saint under glass. It teaches people to call cruelty clean.',
        requiresMission: 'ashen_tithe',
        requiresText: 'Complete The Ashen Tithe',
      },
    ],
  },
  {
    id: 3,
    numeral: 'III',
    name: 'The Iron Feast',
    theme: 'War for sale, and a guild that never forgets a debt.',
    factionId: 'iron_covenant',
    factionName: 'The Iron Covenant',
    boss: 'The Contract-King',
    region: 'The Iron Marches',
    regionId: 'iron_marches',
    danger: 'Lethal',
    omens: 'Mercenary markets. Corpse auctions. Contracts written in blood.',
    requires: 'Complete Chapter II',
    missions: [],
  },
  {
    id: 4,
    numeral: 'IV',
    name: 'The Hollow Choir',
    theme: 'Voices under the earth, and what Sjen already knows.',
    factionId: 'hollow_choir',
    factionName: 'The Hollow Choir',
    boss: 'The Choir Beneath the Skin',
    region: 'The Bone Wells / The Sunken Monastery',
    regionId: 'bone_wells',
    danger: 'Forbidden',
    omens: 'Tunnels that sing back. Bargains made in Lucian’s name. Sjen, smiling.',
    requires: 'Complete Chapter III',
    missions: [],
  },
  {
    id: 5,
    numeral: 'V',
    name: 'Carrion Ascendant',
    theme: 'The Crown converges. The company fractures.',
    factionId: null,
    factionName: 'All factions, collapsing',
    boss: 'Unwritten',
    region: 'Unknown',
    regionId: 'ascendant',
    danger: 'Absolute',
    omens: 'Seven slivers. Three monsters. One throne of carrion.',
    requires: 'Complete Chapters I–IV',
    missions: [],
  },
];

// What the player may do with a chapter right now.
//   playable  — has missions to run
//   complete  — its debt is paid
//   unlocked  — region open, content still being written (next build)
//   locked    — requirement not met
export function chapterStatus(ch, g) {
  if ((g.completedChapters || []).includes(ch.id)) return 'complete';
  if (ch.id === 1) return 'playable';
  if (ch.id === 2 && (g.completedChapters || []).includes(1)) return ch.missions.length ? 'playable' : 'unlocked';
  if (ch.id === 3 && (g.completedChapters || []).includes(2)) return 'unlocked';
  return 'locked';
}

// Functional status line for chapter cards and the Campaign Ledger.
export function chapterStatusText(status) {
  switch (status) {
    case 'complete':
      return 'Debt paid.';
    case 'playable':
      return 'Playable now.';
    case 'unlocked':
      return 'Road open. Not playable yet.';
    default:
      return 'Locked.';
  }
}

// Title-screen save preview: where the ledger last saw the player.
export function describeLocation(save) {
  switch (save.screen) {
    case 'map':
      return 'The map of Veyrath';
    case 'dialogue':
      return save.scriptId === 'intro' ? 'A burned chapel on the Cinder Road' : 'Marrowfen — The Butcher’s Debt';
    case 'combat':
      return save.encounterId === 'debt_bound_knight' ? 'Facing the Debt-Bound Knight' : 'Blades out in Marrowfen';
    case 'silence':
      return 'The White Silence';
    case 'ascension':
      return 'Mid-ascension — a sin half-fed';
    case 'aftermath':
      return 'The aftermath at Marrowfen';
    case 'ledger':
      return 'Reading the campaign ledger';
    default:
      return 'Somewhere in Veyrath';
  }
}
