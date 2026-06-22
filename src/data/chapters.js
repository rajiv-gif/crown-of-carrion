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
    theme: 'Debt that survives the body, plague as inheritance, and the first evidence that souls no longer pass cleanly.',
    factionId: 'plague_barons',
    factionName: 'The Plague Barons',
    boss: 'The Debt-Bound Knight',
    bossEncounter: 'debt_bound_knight',
    region: 'Marrowfen / The Lowlands',
    regionId: 'marrowfen',
    danger: 'Grim',
    omens: 'Plague pits. A saint who failed to leave. A collector chained to obligation beyond death.',
    missions: [
      {
        id: 'butchers_debt',
        script: 'butchers_debt',
        name: 'The Butcher’s Debt',
        patron: 'Baron Vessik, Plague Baron',
        desc: 'Collect seven years of tithe from a village whose debts bind bodies, descendants, and the dead saint beneath its chapel.',
      },
    ],
  },
  {
    id: 2,
    numeral: 'II',
    name: 'The Ashen Tithe',
    theme: 'Religion as poison, souls fixed inside relics, and punishment sold as a route to salvation.',
    factionId: 'ashen_church',
    factionName: 'The Ashen Church',
    boss: 'The Saint Without a Face',
    region: 'The Ash Roads / Cindershrive',
    regionId: 'ash_roads',
    danger: 'Dire',
    omens: 'Relic prisons. Confession wounds. Neighbors taught to hate. Dead doctrine failing upward.',
    requires: 'Complete Chapter I',
    unlockedCopy: 'The Ash Roads and Cindershrive are open. The Church has started turning neighbors into enemies.',
    missions: [
      {
        id: 'ashen_tithe',
        script: 'ashen_tithe',
        name: 'The Ashen Tithe',
        patron: 'Chan, Merchant of Necessary Evils',
        desc: 'A cynical merchant offers the route to Cindershrive, a ledger of Church indulgences, and proof that hatred can be itemized. Some faithful must be killed before they ascend.',
        cocoliObjective: 'Cocoli’s request: allow one faithful corpse to ascend, then survive what blooms.',
      },
      {
        id: 'saint_without_face',
        script: 'saint_without_face',
        name: 'The Saint Without a Face',
        patron: 'No one living',
        desc: 'The Ashen Church keeps a faceless soul under glass and calls its inability to leave a miracle.',
        cocoliObjective: 'Cocoli’s request: let doctrine show its true body before you destroy it.',
        requiresMission: 'ashen_tithe',
        requiresText: 'Complete The Ashen Tithe',
      },
    ],
  },
  {
    id: 3,
    numeral: 'III',
    name: 'The Iron Feast',
    theme: 'War for sale, oath-law beyond death, and contracts that spend stolen lifetimes.',
    factionId: 'iron_covenant',
    factionName: 'The Iron Covenant',
    boss: 'The Contract-King',
    region: 'The Iron Marches',
    regionId: 'iron_marches',
    danger: 'Lethal',
    omens: 'Corpse auctions. Oath-dead soldiers. Contracts enforceable in the grave.',
    requires: 'Complete Chapter II',
    missions: [],
  },
  {
    id: 4,
    numeral: 'IV',
    name: 'The Hollow Choir',
    theme: 'The Root-Beneath, dead alphabets, stolen identities, and what Sjen already opened.',
    factionId: 'hollow_choir',
    factionName: 'The Hollow Choir',
    boss: 'The Choir Beneath the Skin',
    region: 'The Bone Wells / The Sunken Monastery',
    regionId: 'bone_wells',
    danger: 'Forbidden',
    omens: 'Buried names. Bodies worn by failed souls. Bargains made in Lucian’s name. Sjen, smiling.',
    requires: 'Complete Chapter III',
    missions: [],
  },
  {
    id: 5,
    numeral: 'V',
    name: 'Carrion Ascendant',
    theme: 'The Crownward Plane opens. The broken cycle acquires an owner.',
    factionId: null,
    factionName: 'All factions, collapsing',
    boss: 'Unwritten',
    region: 'Unknown',
    regionId: 'ascendant',
    danger: 'Absolute',
    omens: 'Seven slivers. The White Silence thinning. One hand closing around every return.',
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
