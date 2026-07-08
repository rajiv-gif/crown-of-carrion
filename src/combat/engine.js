// Turn-based combat engine. Pure data in, new state out.
// Public API: createCombat, playerAct, autoAct, currentUnit, ABILITIES.
// Unit state contains only plain data so structuredClone is safe.
//
// Sin mods (data/sins.js) feed every formula; tension tiers gate all
// party friction: low = banter, medium = arguments, high = sabotage
// and skimming, critical = knives out (once per combat, with warnings).
//
// Alongside the text log, the engine emits structured EVENTS the UI uses
// to animate: cast, hit, dot, status, float, death, flee, bubble, summon.
// Events never change mechanics — they are a read-only feed for the
// battlefield layer.

import { PARTY, ENEMIES, ENCOUNTERS } from '../data/units.js';
import { DIFFICULTIES } from '../data/difficulty.js';
import { abilityUnlocked, deriveMods, tensionTier } from '../data/sins.js';
import { battlefieldFor, terrainAt } from '../data/battlefields.js';
import { progressionAbilities, progressionMods, specializationFor } from '../data/progression.js';

export const ABILITIES = {
  basic_attack: { name: 'Basic Attack', cd: 0, target: 'enemy', desc: 'A plain, ugly strike. Reliable. Unimpressive.' },
  wait_power: { name: 'Wait for Power', cd: 0, target: 'none', desc: 'Skip this turn. Gain Focus and Might. Enemies may punish hesitation.' },
  // Lucian
  cleave: { name: 'Cleave', cd: 0, target: 'enemy', desc: 'A heavy, mutilating blow. 120% damage.' },
  execute: { name: 'Execute', cd: 3, target: 'enemy', desc: '300% damage to enemies below 35% health; 100% otherwise. Pride feeds it.' },
  blood_command: { name: 'Blood Command', cd: 4, target: 'none', desc: 'All allies gain Might for 2 turns. Sjen and Veato bleed 6 HP for the privilege. They will remember.' },
  tyrants_grip: { name: 'Tyrant’s Grip', cd: 3, target: 'enemy', desc: 'Stun an enemy for 1 turn and terrify it. Cruelty lengthens the terror.' },
  // Sjen
  rot_hex: { name: 'Rot Hex', cd: 0, target: 'enemy', desc: '60% damage and a curse that eats per turn. Cunning deepens the rot.' },
  bone_ward: { name: 'Bone Ward', cd: 2, target: 'ally', desc: 'Shield an ally behind 24 points of cursed bone.' },
  debt_of_flesh: { name: 'Debt of Flesh', cd: 3, target: 'enemy', desc: 'Drain 12 HP from the healthiest ally — without asking — to deal 240% damage.' },
  summon_wretch: { name: 'Summon Wretch', cd: 5, target: 'none', desc: 'Drag a small horror up through the floor to soak blades.' },
  whispering_pact: { name: 'Whispering Pact', cd: 3, target: 'none', desc: 'Ask the things below for help. They may answer wrong.' },
  mo_bos_ie_eye: { name: 'Mo bos ie EYE!', cd: 6, target: 'enemy', desc: 'Ultimate: Sjenke turns his fist into titanium demon fire and crushes the target’s eyes and skull. If the target dies, all other enemies enter Psychosis and lose 1 turn.' },
  crown_hex: { name: 'Crown Hex', cd: 2, target: 'enemy', desc: 'Hex Master: a deeper curse that bites hard and spreads panic from already-rotting prey.' },
  demon_invocation: { name: 'Demon Invocation', cd: 5, target: 'none', desc: 'Invoker: Sjen partially changes into a demon, gains brutal power, and tears the elements through every enemy.' },
  // Veato
  bow_shot: { name: 'Mercenary Shot', cd: 0, target: 'enemy', desc: 'Range 5. A reliable shot from Veato’s battered road bow. 105% damage.' },
  venom_arrow: { name: 'Venom Arrow', cd: 1, target: 'enemy', desc: 'Range 5. 85% damage and strong poison. Already-afflicted prey suffers more.' },
  pinning_shot: { name: 'Pinning Shot', cd: 2, target: 'enemy', desc: 'Range 5. Pin the target in place: damage, bleed, and Cripple for 2 turns.' },
  marked_quarry: { name: 'Marked Quarry', cd: 3, target: 'enemy', desc: 'Range 6. Mark one enemy as prey. Veato’s arrows strike it harder and Covering Shot favors it.' },
  backstab: { name: 'Backstab', cd: 2, target: 'enemy', desc: '260% from behind while afflicted. Position or debuffs alone give partial bonuses. No setup: 85%. Deceit is a craft.' },
  poison_blade: { name: 'Poison Blade', cd: 0, target: 'enemy', desc: '90% damage plus poison each turn. Cunning brews it stronger.' },
  nether_bow: { name: 'Bow from the Nether', cd: 1, target: 'enemy', desc: 'Range 6. Loose a poisoned shadow-arrow. Marked or afflicted prey suffers 165% damage.' },
  prowling_pounce: { name: 'Prowling Pounce', cd: 3, target: 'enemy', desc: 'Jaguar Knife: spring onto prey within 4 tiles, close to melee, and strike with both daggers.' },
  smoke_step: { name: 'Smoke Step', cd: 3, target: 'self', desc: 'The next blow aimed at Veato finds only smoke.' },
  crippling_cut: { name: 'Crippling Cut', cd: 2, target: 'enemy', desc: '80% damage; the target bleeds and deals 30% less. Wrath opens the wound wider.' },
  // Chan
  sample_bolt: { name: 'Appraisal Bolt', cd: 0, target: 'enemy', desc: 'Range 5. 90% damage; 125% against a target bearing a Black Writ.' },
  place_lien: { name: 'Black Writ', cd: 2, target: 'enemy', desc: 'Range 5. Condemn an enemy as recoverable property. Its death pays bonus gold.' },
  repossess: { name: 'Confiscate', cd: 3, target: 'enemy', desc: 'Range 4. Strip Might, Zeal, or Shield and convert it into protection for Chan.' },
  cheap_insurance: { name: 'Indemnity', cd: 3, target: 'ally', desc: 'Give an ally 16 shield. Five gold is withheld from the final settlement.' },
  // Chibi
  spite_hex: { name: 'Spite Hex', cd: 0, target: 'enemy', desc: 'Rot damage that bites harder when Sjen is still standing.' },
  needlework: { name: 'Needlework', cd: 2, target: 'enemy', desc: 'A small precise cut. Bleeds, poisons, and embarrasses larger targets.' },
  duo_rite: { name: 'Duo Rite', cd: 3, target: 'none', desc: 'Chibi and Sjen feed the same ugly thought. Enemies rot; everyone else feels unwelcome.' },
  // Enemies
  claw: { name: 'Desperate Claw', cd: 0, target: 'party' },
  rusted_blade: { name: 'Rusted Blade', cd: 0, target: 'party' },
  corpse_feed:   { name: 'Corpse Feed',   cd: 3, target: 'party', desc: '90% damage bite. On a corpse pile: also heals 5 HP.' },
  spade_strike:  { name: 'Spade Strike',  cd: 0, target: 'party', desc: '115% damage. The rusted spade cripples on hit.' },
  exhume:        { name: 'Exhume',        cd: 3, target: 'none',  desc: 'The digger turns the earth. All Flesh Congregants on the field regain 6 HP.' },
  flail_sweep:   { name: 'Flail Sweep',   cd: 2, target: 'party', desc: 'The morning star arcs through two targets. 100% damage to each.' },
  penance_lash:  { name: 'Penance Lash',  cd: 3, target: 'party', desc: '140% damage. The penitent tears 8 HP from itself to fuel the blow, then gains Might.' },
  black_unction: { name: 'Black Unction', cd: 4, target: 'none',  desc: 'The Pope anoints a corpse. It rises Depraved: stronger, faster, immune to fear, and burning itself toward the grave it wants back.' },
  papal_bull:    { name: 'Papal Bull',    cd: 3, target: 'none',  desc: 'A decree nobody living co-signed. All his flock gain Might.' },
  censer_of_marrow: { name: 'Censer of Marrow', cd: 2, target: 'party', desc: '105% damage and a curse that smells of rendered saints.' },
  desperate_rush: { name: 'Desperate Rush', cd: 3, target: 'party' },
  plague_bite: { name: 'Plague Bite', cd: 2, target: 'party' },
  pox_lob: { name: 'Pox Lob', cd: 0, target: 'party' },
  rotten_guard: { name: 'Rotten Guard', cd: 3, target: 'self' },
  heavy_blow: { name: 'Heavy Blow', cd: 0, target: 'party' },
  chain_lash: { name: 'Chain Lash', cd: 2, target: 'party' },
  debt_mark: { name: 'Debt Mark', cd: 2, target: 'party' },
  collection_swing: { name: 'Collection Swing', cd: 1, target: 'party' },
  chain_tax: { name: 'Chain Tax', cd: 3, target: 'none' },
  ledger_hook: { name: 'Ledger Hook', cd: 2, target: 'party' },
  foreclosure: { name: 'Foreclosure', cd: 3, target: 'party' },
  kneel_debtor: { name: 'Kneel, Debtor', cd: 3, target: 'party' },
  final_ledger: { name: 'Final Ledger', cd: 99, target: 'party' },
  penitent_flurry: { name: 'Penitent Flurry', cd: 2, target: 'party' },
  smoke_censer: { name: 'Smoke Censer', cd: 3, target: 'none' },
  cinder_maul: { name: 'Cinder Maul', cd: 2, target: 'party' },
  audit_sin: { name: 'Audit Sin', cd: 2, target: 'party' },
  burning_writ: { name: 'Burning Writ', cd: 2, target: 'party' },
  grave_bloom: { name: 'Grave Bloom', cd: 2, target: 'party' },
  bone_clutch: { name: 'Bone Clutch', cd: 2, target: 'party' },
  sermon_of_teeth: { name: 'Sermon of Teeth', cd: 3, target: 'none' },
  faith_eater: { name: 'Faith Eater', cd: 2, target: 'party' },
  erase_face: { name: 'Erase Face', cd: 3, target: 'party' },
  absolve_screaming: { name: 'Absolve Screaming', cd: 4, target: 'none' },
  martyr_tax: { name: 'Martyr Tax', cd: 3, target: 'none' },
  gnaw: { name: 'Gnaw', cd: 0, target: 'enemy' },
};

const DOTS = { bleed: 'bleeding', poison: 'poison', curse: 'rot' };
const DEBUFFS = ['bleed', 'poison', 'curse', 'stun', 'fear', 'cripple', 'psychosis'];
const BASE_PARTY = ['lucian', 'sjen', 'veato'];
const LOOT_NAMES = {
  demon_tooth: 'Dogma Demon Tooth',
  black_indulgence: 'Black Indulgence Seal',
  ash_crown_splinter: 'Ash-Crown Splinter',
};

// Banter escalates with the hottest pair's tension tier. Low costs nothing;
// critical is a warning the player is meant to read. `who`/`bubble` mark
// lines that also surface as a speech bubble over the speaker.
const BANTER = {
  low: [
    { log: '{a}: “Try not to die in a way that embarrasses the company, {b}.”' },
    { log: '{b} prices {a}’s gear by eye, out of habit.' },
    { log: '{a}: “You fight like you owe someone money.” {b}: “I do. You.”' },
  ],
  medium: [
    { log: '{a} and {b} argue over the split mid-swing. The enemy waits, confused.' },
    { log: '{a}: “Stay out of my line, {b}, or be part of it.”' },
    { log: '{b} stops covering {a}’s flank for exactly three heartbeats. Long enough to be noticed.' },
  ],
  high: [
    { log: '{a} watches {b}’s back. Not protectively. Selecting a spot.' },
    {
      log: '{b}: “One day, {a}, there will be a price on you I can afford.”',
      who: 'b',
      bubble: '“One day, {a}, there will be a price on you I can afford.”',
    },
    { log: 'Orders are acknowledged with silence now. The silence has edges.' },
  ],
  critical: [
    { log: '{b}’s hand keeps drifting toward a knife nobody is supposed to know about.' },
    { log: '{a} has stopped answering {b} directly.' },
    { log: 'They no longer insult each other. That is the worst sign there is.' },
  ],
};

const ENEMY_BARKS = {
  debt_bound_knight: [
    '“Your names were entered before you arrived.”',
    '“Distance is an unpaid privilege.”',
    '“The living always mistake delay for mercy.”',
    '“Every step accrues.”',
  ],
  chained_thrall: ['“Please. Make the chain stop.”', '“He wrote my children beneath my name.”'],
  starved_villager: ['“You ate while we buried ours!”', '“There is nothing left to beg with.”'],
  plague_guard: ['“Hold the line. Hold the rot in.”', '“The uniform still fits.”'],
  carrion_pope: [
    '“Death was a door. I nailed it shut.”',
    '“Every corpse is a congregant who stopped trying.”',
    '“You will serve. Breathing is not a requirement.”',
  ],
  hollow_guard: ['“HOLD.”', '“NO MAN INSIDE.”'],
  pox_slinger: ['“Catch.”', '“Breathe deep, rich man.”'],
  default: ['“You should have stayed on the road.”', '“The dead have more patience than you.”'],
};

const PARTY_RETORTS = {
  lucian: ['“Then write this down.”', '“Come collect it.”', '“You speak too much for a corpse.”'],
  sjen: ['“Hm... your ledger cannot count what owns you.”', '“Hm... chains are only promises made by weak iron.”'],
  veato: ['“Long speech. Large target.”', '“I charge extra for sermons.”', '“Keep talking. It helps the range.”'],
  chan: ['“Your terms are unenforceable.”', '“I have seen better books in latrines.”', '“Your interest rate lacks imagination.”'],
  chibi: ['“Sjen. This one thinks paper is armor.”', '“Big voice. Empty thing.”'],
  default: ['“Enough.”'],
};

let uidCounter = 0;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const roll = (base) => Math.max(1, Math.round(base * (0.9 + Math.random() * 0.2)));
const isHexAbility = (id) => ['rot_hex', 'spite_hex', 'duo_rite', 'crown_hex', 'debt_of_flesh', 'whispering_pact'].includes(id);
const isUnholy = (u) =>
  ['demon', 'husk', 'saint', 'wretch'].includes(u.sprite) ||
  /demon|husk|saint|reliquary|wretch/i.test(`${u.key} ${u.name}`);

function unitTerrain(s, u) {
  return terrainAt(s.field, u?.tile);
}

// ── Tactics: movement & attack range ────────────────────────
// Chebyshev distance — range 1 means "in an adjacent cell" (incl. diagonal).
const tdist = (a, b) =>
  !a?.tile || !b?.tile ? 99 : Math.max(Math.abs(a.tile.x - b.tile.x), Math.abs(a.tile.y - b.tile.y));

// Per-ability reach. Positional attacks (target enemy/party) default to
// melee (1); self/none/ally abilities are unbounded. Tune here freely.
const ABILITY_RANGE = {
  // short reach
  poison_blade: 2,
  backstab: 1,
  corpse_feed: 1,
  spade_strike: 1,
  crippling_cut: 1,
  prowling_pounce: 4,
  bow_shot: 5,
  venom_arrow: 5,
  pinning_shot: 5,
  marked_quarry: 6,
  nether_bow: 6,
  sample_bolt: 5,
  place_lien: 5,
  tyrants_grip: 2,
  debt_mark: 2,
  kneel_debtor: 2,
  repossess: 4,
  collection_swing: 2,
  // ranged occult / chains / fire
  rot_hex: 3,
  spite_hex: 3,
  crown_hex: 3,
  debt_of_flesh: 3,
  mo_bos_ie_eye: 4,
  chain_lash: 3,
  ledger_hook: 7,
  foreclosure: 4,
  audit_sin: 3,
  burning_writ: 3,
  grave_bloom: 3,
  faith_eater: 3,
  erase_face: 3,
  pox_lob: 3,
  plague_bite: 1,
  // the boss's telegraphed killshot lands wherever the debtor stands
  final_ledger: 99,
};
function abilityReach(id, actor) {
  const A = ABILITIES[id];
  if (!A) return 1;
  if (A.target === 'self' || A.target === 'none' || A.target === 'ally') return 99;
  const bonus = actor?.mods?.bowRange && ['bow_shot', 'venom_arrow', 'pinning_shot', 'marked_quarry', 'nether_bow'].includes(id)
    ? actor.mods.bowRange
    : 0;
  return (ABILITY_RANGE[id] ?? 1) + bonus;
}
function inReach(s, actor, target, id) {
  if (abilityReach(id, actor) >= 99) return true;
  return tdist(actor, target) <= abilityReach(id, actor);
}

// Movement budget from Speed (1–4 tiles): Veato darts, Lucian lumbers.
function moveBudget(u) {
  return Math.max(1, Math.min(4, Math.round((u.speed || 6) / 4)));
}

// BFS the free orthogonal tiles a unit can step to this turn (bodies block).
function reachableTiles(s, u) {
  const cols = s.field?.columns || 8;
  const rows = s.field?.rows || 5;
  const occupied = new Set(
    s.units.filter((x) => x.alive && x.uid !== u.uid).map((x) => `${x.tile?.x},${x.tile?.y}`)
  );
  const start = u.tile || { x: 0, y: 0 };
  const bestCost = new Map([[`${start.x},${start.y}`, 0]]);
  const destinations = new Map();
  const budget = moveBudget(u);
  let frontier = [{ ...start, cost: 0 }];
  while (frontier.length) {
    frontier.sort((a, b) => a.cost - b.cost);
    const t = frontier.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = t.x + dx;
      const ny = t.y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const cost = t.cost + (terrainAt(s.field, { x: nx, y: ny }).moveCost || 1);
      if (cost > budget || occupied.has(key) || cost >= (bestCost.get(key) ?? Infinity)) continue;
      bestCost.set(key, cost);
      const tile = { x: nx, y: ny, cost };
      destinations.set(key, tile);
      frontier.push(tile);
    }
  }
  return [...destinations.values()];
}

// One step from `from` toward `goal` along free tiles (greedy, bodies block).
function stepToward(s, u, goal, budget) {
  const reach = reachableTiles(s, u);
  if (!reach.length || !goal) return null;
  let best = null;
  let bestD = tdist({ tile: u.tile }, { tile: goal });
  for (const t of reach) {
    if (t.cost > budget) continue;
    const d = Math.max(Math.abs(t.x - goal.x), Math.abs(t.y - goal.y));
    if (d < bestD) {
      bestD = d;
      best = { x: t.x, y: t.y };
    }
  }
  return best;
}

// A unit "threatens" the tiles around it if it carries any melee (reach-1)
// attack — those are the foes that punish a retreat.
function meleeThreat(u) {
  return u.abilities.some((id) => {
    const A = ABILITIES[id];
    return A && (A.target === 'enemy' || A.target === 'party') && abilityReach(id, u) === 1;
  });
}

// Best bounded attack reach a unit can use right now (for kiting decisions).
function maxReadyReach(u) {
  let r = 0;
  for (const id of u.abilities) {
    if ((u.cooldowns[id] || 0) > 0) continue;
    const A = ABILITIES[id];
    if (!A || !(A.target === 'enemy' || A.target === 'party')) continue;
    const reach = abilityReach(id, u);
    if (reach < 99) r = Math.max(r, reach);
  }
  return r;
}

// A free reaction strike when prey turns its back and leaves melee.
function opportunityStrike(s, attacker, target) {
  if (!attacker.alive || !target.alive || hasStatus(attacker, 'stun') || hasStatus(attacker, 'psychosis')) return;
  const prev = s.castAbility;
  s.castAbility = 'opportunity';
  evt(s, { k: 'cast', actor: attacker.uid, ability: 'opportunity', target: target.uid });
  log(s, `${target.name} turns to flee — ${attacker.name} seizes the opening.`, 'blood');
  hit(s, attacker, target, 0.85, 'Opportunity');
  s.castAbility = prev;
}

// All in-combat movement routes through here: leaving the reach of an adjacent
// melee threat provokes an opportunity attack — for either side.
function moveUnit(s, u, dest) {
  const from = u.tile ? { ...u.tile } : null;
  const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
  const provokers = from
    ? s.units.filter(
        (x) =>
          x.alive &&
          x.side !== u.side &&
          x.tile &&
          meleeThreat(x) &&
          !hasStatus(x, 'stun') &&
          !hasStatus(x, 'psychosis') &&
          cheb(x.tile.x, x.tile.y, from.x, from.y) === 1 &&
          cheb(x.tile.x, x.tile.y, dest.x, dest.y) > 1
      )
    : [];
  evt(s, { k: 'move', unit: u.uid, from, to: { x: dest.x, y: dest.y } });
  u.tile = { x: dest.x, y: dest.y };
  for (const p of provokers) {
    if (!u.alive) break;
    opportunityStrike(s, p, u);
  }
  if (provokers.length) checkEnd(s);
}

function assignBattlefield(s, enc) {
  const field = battlefieldFor(s.encounterId);
  const enemyStarts = field.placements?.enemies || [];
  const cols = field.columns || 8;
  const rows = field.rows || 5;
  s.field = { ...field, rules: enc.terrainRules || field.rules || [] };
  // No two units may share a tile. Claim the requested cell, or spiral out
  // to the nearest free one — robust no matter how many enemies an
  // encounter fields versus how many placement slots a battlefield defines.
  const taken = new Set();
  const claim = (cx, cy) => {
    const x0 = Math.max(0, Math.min(cols - 1, cx | 0));
    const y0 = Math.max(0, Math.min(rows - 1, cy | 0));
    for (let r = 0; r <= cols + rows; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = x0 + dx;
          const ny = y0 + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const key = `${nx},${ny}`;
          if (!taken.has(key)) {
            taken.add(key);
            return { x: nx, y: ny };
          }
        }
      }
    }
    return { x: x0, y: y0 };
  };
  // Party first (fixed posts), then enemies walk the placement list in order
  // with a single running index — different enemy types no longer collide.
  let ei = 0;
  for (const u of s.units) {
    if (u.side === 'party') {
      const p = field.placements?.party?.[u.key] || [1, 2];
      u.tile = claim(p[0], p[1]);
    } else {
      const p = enemyStarts[ei] || [cols - 1, ei % rows];
      u.tile = claim(p[0], p[1]);
      ei += 1;
    }
  }
  s.takenTiles = taken; // later summons (the Wretch) can avoid stacking
}

function log(s, text, kind = 'info') {
  s.log.push({ id: s.log.length + Math.random(), text, kind });
}
function evt(s, e) {
  s.events.push({ id: s.events.length + Math.random(), ...e });
}
function getUnit(s, uid) {
  return s.units.find((u) => u.uid === uid);
}
function byKey(s, key) {
  return s.units.find((u) => u.key === key && u.alive);
}
function alive(s, side) {
  return s.units.filter((u) => u.alive && u.side === side);
}
function hasStatus(u, t) {
  return u.statuses.some((x) => x.type === t);
}
function getStatus(u, t) {
  return u.statuses.find((x) => x.type === t);
}
function addStatus(s, u, type, turns, power = 0) {
  if (u.immunities?.includes(type)) {
    log(s, `${u.name} is immune to ${type}.`, 'dim');
    evt(s, { k: 'float', unit: u.uid, text: `Immune: ${type}`, type: 'word' });
    return false;
  }
  const ex = getStatus(u, type);
  if (ex) {
    ex.turns = Math.max(ex.turns, turns);
    ex.power = Math.max(ex.power, power);
  } else {
    u.statuses.push({ type, turns, power });
  }
  evt(s, { k: 'status', unit: u.uid, status: type });
  return true;
}

function combatExchange(s, enemy, target) {
  if (!enemy?.alive || s.over || s.lastExchangeRound === s.round || Math.random() > 0.38) return;
  const speaker = target?.alive ? target : pick(alive(s, 'party').filter((u) => u.key !== 'wretch'));
  if (!speaker) return;
  const enemyLine = pick(ENEMY_BARKS[enemy.key] || ENEMY_BARKS.default);
  const reply = pick(PARTY_RETORTS[speaker.key] || PARTY_RETORTS.default);
  s.lastExchangeRound = s.round;
  log(s, `${enemy.name}: ${enemyLine} ${speaker.name}: ${reply}`, 'dim');
  evt(s, { k: 'bubble', unit: enemy.uid, text: enemyLine });
  evt(s, { k: 'bubble', unit: speaker.uid, text: reply });
}
function syncTransformStatus(s, u) {
  if (!u.transformInto || !u.alive) return;
  const ex = getStatus(u, 'ascension');
  if (ex) {
    ex.power = u.transformTimer;
    ex.turns = 99;
  } else {
    addStatus(s, u, 'ascension', 99, u.transformTimer);
  }
}
function removeStatus(u, t) {
  u.statuses = u.statuses.filter((x) => x.type !== t);
}
function effAtk(u) {
  let a = u.atk;
  if (u.mods?.deathHungry) a *= 1.25;
  if (hasStatus(u, 'might')) a *= 1.4;
  if (hasStatus(u, 'focus')) a *= 1.35;
  if (hasStatus(u, 'zeal')) a *= 1.25;
  if (hasStatus(u, 'cripple')) a *= 0.7;
  if (hasStatus(u, 'fear')) a *= 0.75;
  return a;
}
function bumpTension(s, key, v) {
  s.tension[key] = Math.max(0, Math.min(100, (s.tension[key] || 0) + v));
  s.tensionDelta[key] = (s.tensionDelta[key] || 0) + v;
}
function tryFear(s, target, turns) {
  if (!target.alive) return;
  if (target.immunities?.includes('fear')) {
    log(s, `${target.name} has nothing left that fear can reach.`, 'dim');
    evt(s, { k: 'float', unit: target.uid, text: 'Fear Immune', type: 'word' });
    return;
  }
  const resist = target.mods?.fearResist || 0;
  if (resist && Math.random() < resist) {
    log(s, `${target.name} refuses to be afraid.`, 'dim');
    evt(s, { k: 'float', unit: target.uid, text: 'Refused', type: 'word' });
    return;
  }
  addStatus(s, target, 'fear', turns);
  log(s, `Fear takes root in ${target.name}.`, 'hex');
}

function mkUnit(tpl, side, key, mods) {
  const u = {
    uid: `${key}_${uidCounter++}`,
    key,
    side,
    name: tpl.name,
    epithet: tpl.epithet || '',
    sigil: tpl.sigil || '✥',
    sprite: tpl.sprite || key,
    stature: tpl.stature || (tpl.boss ? 'boss' : 'human'),
    immunities: [...(tpl.immunities || [])],
    color: tpl.color || 'var(--rust)',
    boss: !!tpl.boss,
    hp: tpl.hp,
    maxHp: tpl.hp,
    atk: tpl.atk,
    speed: tpl.speed,
    abilities: [...tpl.abilities],
    statuses: [],
    cooldowns: {},
    alive: true,
    fled: false,
    mods: mods || deriveMods({}),
    transformInto: tpl.transform?.into || null,
    transformTimer: tpl.transform?.rounds || null,
  };
  if (u.transformInto) u.statuses.push({ type: 'ascension', turns: 99, power: u.transformTimer });
  return u;
}

function scaleEnemyTemplate(tpl, diff) {
  return {
    maxHp: Math.max(1, Math.round(tpl.hp * (diff?.enemyHp || 1))),
    atk: Math.max(2, Math.round(tpl.atk * (diff?.enemyAtk || 1))),
  };
}

function transformEnemy(s, u) {
  if (!u.alive || !u.transformInto) return;
  const tpl = ENEMIES[u.transformInto];
  if (!tpl) return;
  s.ascensions = (s.ascensions || 0) + 1;
  const oldName = u.name;
  const hpRatio = Math.max(0.45, u.hp / Math.max(1, u.maxHp));
  const scaled = scaleEnemyTemplate(tpl, s.diff);
  u.key = u.transformInto;
  u.name = tpl.name;
  u.epithet = tpl.epithet || '';
  u.sigil = tpl.sigil || u.sigil;
  u.sprite = tpl.sprite || u.sprite;
  u.stature = tpl.stature || (tpl.boss ? 'boss' : 'human');
  u.immunities = [...(tpl.immunities || [])];
  u.color = tpl.color || u.color;
  u.boss = !!tpl.boss;
  u.maxHp = Math.round(scaled.maxHp * 1.12);
  u.hp = Math.max(1, Math.round(u.maxHp * hpRatio));
  u.atk = Math.round(scaled.atk * 1.12);
  u.speed = Math.max(u.speed, tpl.speed + 1);
  u.abilities = [...tpl.abilities];
  u.cooldowns = {};
  u.transformInto = tpl.transform?.into || null;
  u.transformTimer = tpl.transform?.rounds || null;
  u.statuses = u.statuses.filter((st) => st.type !== 'ascension');
  addStatus(s, u, 'zeal', 3);
  addStatus(s, u, 'might', 1);
  if (u.transformInto) syncTransformStatus(s, u);
  log(s, `${oldName} is not killed quickly enough. Doctrine splits the corpse open: ${u.name} rises stronger.`, 'death');
  evt(s, { k: 'summon', unit: u.uid });
  evt(s, { k: 'float', unit: u.uid, text: 'ASCENDED', type: 'blood-word' });
}

function kill(s, u, attacker) {
  const liened = u.side === 'enemy' && hasStatus(u, 'lien');
  if (u.side === 'enemy' && u.transformInto && u.transformTimer > 0) {
    s.preventedAscensions = (s.preventedAscensions || 0) + 1;
    s.bonusGold = (s.bonusGold || 0) + 10;
    s.bonusXp = (s.bonusXp || 0) + 8;
    log(s, `Doctrine denied — ${u.name} is cut down before it can become worse. +10 gold, +8 XP.`, 'gold');
    evt(s, { k: 'float', unit: u.uid, text: 'DENIED', type: 'word' });
  }
  if (u.side === 'party') s.partyLosses = (s.partyLosses || 0) + 1;
  u.hp = 0;
  u.alive = false;
  u.statuses = [];
  log(
    s,
    u.boss
      ? `${u.name} collapses. Its soul reaches for a road that is no longer there.`
      : `${u.name} dies.`,
    'death'
  );
  evt(s, { k: 'death', unit: u.uid, boss: u.boss, sprite: u.sprite });
  if (u.mods?.corpsePileOnDeath) {
    const nearby = s.units.filter((x) => x.alive && x.key === 'flesh_congregant' && x.tile && u.tile &&
      Math.max(Math.abs(x.tile.x - u.tile.x), Math.abs(x.tile.y - u.tile.y)) <= 2);
    for (const c of nearby) {
      const h = Math.min(8, c.maxHp - c.hp);
      if (h > 0) { c.hp += h; evt(s, { k: 'float', unit: c.uid, text: `+${h} HP`, type: 'word' }); }
    }
    if (nearby.length) log(s, 'The Catacomb Digger falls. What it carried feeds the congregation.', 'hex');
  }
  if (u.side === 'enemy') {
    if (liened) {
      s.bonusGold = (s.bonusGold || 0) + 12;
      log(s, `Closed Account — Chan collects 12 gold from ${u.name}'s remaining value.`, 'gold');
      evt(s, { k: 'float', unit: u.uid, text: '+12 gold', type: 'word' });
    }
    const luc = byKey(s, 'lucian');
    if (luc && (luc.mods.feastHeal || abilityUnlocked('feast_on_fear', s.sins))) {
      const heal = Math.min(luc.mods.feastHeal || 12 + (luc.mods.feastBonus || 0), luc.maxHp - luc.hp);
      if (heal > 0) {
        luc.hp += heal;
        log(s, `Feast on Fear — Lucian drinks the dying moment. +${heal} HP.`, 'gold');
        evt(s, { k: 'float', unit: luc.uid, text: `+${heal}`, type: 'heal' });
      }
      if (luc.mods.butcherReset) luc.cooldowns.cleave = 0;
    }
    if (attacker && attacker.alive && attacker.side === 'party' && attacker.mods.killMomentum) {
      addStatus(s, attacker, 'might', 1);
      log(s, `The kill feeds ${attacker.name}’s fury. Wrath answers wrath.`, 'blood');
    }
  }
}

function hit(s, attacker, target, mult, label) {
  if (!target || !target.alive) return 0;
  const am = attacker.mods || {};
  const tm = target.mods || {};
  if (hasStatus(target, 'dodge')) {
    removeStatus(target, 'dodge');
    log(s, `${label} finds only smoke where ${target.name} stood.`, 'dim');
    evt(s, { k: 'float', unit: target.uid, text: 'Dodged', type: 'dodge' });
    return 0;
  }
  if (tm.dodge && Math.random() < tm.dodge) {
    log(s, `${target.name} slips aside — the blow tastes only air.`, 'dim');
    evt(s, { k: 'float', unit: target.uid, text: 'Dodged', type: 'dodge' });
    return 0;
  }
  let base = effAtk(attacker) * mult;
  const attackerTerrain = unitTerrain(s, attacker);
  const targetTerrain = unitTerrain(s, target);
  if (attackerTerrain.type === 'high_ground') {
    base *= 1.12;
    evt(s, { k: 'float', unit: attacker.uid, text: '+High Ground', type: 'word' });
  }
  if (targetTerrain.type === 'cover') {
    base *= 0.85;
    evt(s, { k: 'float', unit: target.uid, text: 'Cover −15%', type: 'word' });
  }
  if (attackerTerrain.type === 'desecrated_altar' && ['sjen', 'chibi'].includes(attacker.key) && isHexAbility(s.castAbility)) {
    base *= 1.18;
    evt(s, { k: 'float', unit: attacker.uid, text: '+Altar Hex', type: 'word' });
  }
  if (attackerTerrain.type === 'demon_rift' && isUnholy(attacker)) {
    base *= 1.15;
    evt(s, { k: 'float', unit: attacker.uid, text: '+Demon Rift', type: 'word' });
  }
  if (target.boss && am.bossMult > 1) base *= am.bossMult;
  let vicious = false;
  if (am.crit && Math.random() < am.crit) {
    base *= 1.5;
    vicious = true;
  }
  let amount = roll(base);
  if (hasStatus(attacker, 'vulnerable')) amount = Math.round(amount * 1.2);
  const sh = getStatus(target, 'shield');
  if (sh) {
    const abs = Math.min(sh.power, amount);
    sh.power -= abs;
    amount -= abs;
    if (abs > 0) {
      log(s, `Bone ward splinters around ${target.name}, drinking ${abs} damage.`, 'hex');
      evt(s, { k: 'float', unit: target.uid, text: `Warded ${abs}`, type: 'shield' });
    }
    if (sh.power <= 0) removeStatus(target, 'shield');
  }
  if (amount <= 0) return 0;
  target.hp -= amount;
  log(
    s,
    `${attacker.name} — ${label}: ${target.name} suffers ${amount}.${vicious ? ' A vicious blow.' : ''}`,
    target.side === 'enemy' ? 'blood' : 'hurt'
  );
  evt(s, { k: 'hit', unit: target.uid, amount, vicious, ability: s.castAbility });
  if (target.hp <= 0) {
    kill(s, target, attacker);
    return amount;
  }
  if (target.mods?.thornRebuke && attacker.side === 'party' && amount > 0 && attacker.alive) {
    const thornDmg = 3;
    attacker.hp -= thornDmg;
    log(s, `The crown of thorns bites back. ${attacker.name} takes ${thornDmg} bleed.`, 'hurt');
    evt(s, { k: 'float', unit: attacker.uid, text: `-${thornDmg}`, type: 'hurt' });
    if (attacker.hp <= 0) kill(s, attacker, target);
  }
  if (hasStatus(target, 'rotten_guard') && attacker.side === 'party' && target.side === 'enemy' && Math.random() < 0.45) {
    addStatus(s, attacker, 'poison', 3, 5 + (s.diff?.afflictionBonus || 0));
    log(s, `Rotten Guard — ${attacker.name}'s weapon comes away wet with plague.`, 'hex');
  }
  if (am.buffSteal && hasStatus(target, 'might')) {
    removeStatus(target, 'might');
    addStatus(s, attacker, 'might', 2);
    log(s, `Envy — ${attacker.name} tears the strength out of ${target.name}’s blood and wears it.`, 'hex');
  }
  if (am.onHitFear && Math.random() < am.onHitFear) tryFear(s, target, 1);
  return amount;
}

function veatoFollowUp(s, target) {
  if (!target || !target.alive) return;
  const v = byKey(s, 'veato');
  if (v && !hasStatus(v, 'stun') && Math.random() < 0.35) {
    const jaguar = v.specialization === 'jaguar_knife';
    if (jaguar && !inReach(s, v, target, 'backstab')) return;
    if (!jaguar && !inReach(s, v, target, 'bow_shot')) return;
    const id = jaguar ? 'hidden_knife' : 'covering_shot';
    const label = jaguar ? 'Hidden Knife' : 'Covering Shot';
    log(
      s,
      jaguar
        ? 'Hidden Knife — Veato springs from Lucian’s shadow with one dagger already wet.'
        : 'Covering Shot — Veato threads an arrow past Lucian’s shoulder into the same prey.',
      'dim'
    );
    const prev = s.castAbility;
    s.castAbility = id;
    evt(s, { k: 'cast', actor: v.uid, ability: id, target: target.uid });
    hit(s, v, target, 0.6, label);
    s.castAbility = prev;
  }
}

function resolveAbility(s, u, id, targetUid) {
  const A = ABILITIES[id];
  const t = targetUid ? getUnit(s, targetUid) : null;
  const m = u.mods || {};
  if ((A.cd || 0) > 0) {
    const specialCdr = id === 'prowling_pounce' ? m.pounceCdr || 0 : 0;
    u.cooldowns[id] = Math.max(1, A.cd - (m.cdr || 0) - specialCdr);
  }
  s.castAbility = id;
  evt(s, { k: 'cast', actor: u.uid, ability: id, target: t?.uid });

  switch (id) {
    case 'basic_attack':
      hit(s, u, t, 1.0, 'Basic Attack');
      if (u.key === 'lucian') veatoFollowUp(s, t);
      break;
    case 'wait_power':
      addStatus(s, u, 'focus', 2);
      addStatus(s, u, 'might', 1);
      s.enemyFury = (s.enemyFury || 0) + 1;
      log(s, `${u.name} waits, gathering power. The enemy sees the hesitation.`, 'gold');
      evt(s, { k: 'float', unit: u.uid, text: 'Focus', type: 'word' });
      break;
    case 'cleave':
      hit(s, u, t, 1.2 + (m.cleaveBonus || 0), 'Cleave');
      veatoFollowUp(s, t);
      break;
    case 'execute': {
      const low = t.hp < t.maxHp * (m.executeThreshold || 0.35);
      const before = t.alive;
      hit(s, u, t, low ? 3.0 + (m.executeBonus || 0) : 1.0, low ? 'Execute' : 'Execute (the prey still stands strong)');
      if (low && before && !t.alive) evt(s, { k: 'float', unit: t.uid, text: 'EXECUTED', type: 'execute' });
      if (!low && t.alive) {
        const v = byKey(s, 'veato');
        if (v && Math.random() < 0.3) {
          evt(s, { k: 'bubble', unit: v.uid, text: '“Terrifying. Shall I scream now, or wait until you hit something?”' });
          log(s, 'Veato: “Terrifying. Shall I scream now, or wait until you hit something?”', 'dim');
        }
      }
      veatoFollowUp(s, t);
      break;
    }
    case 'blood_command':
      log(s, 'Lucian: “Bleed for me, and be glad it’s only blood.” The Black Tithe surges with terrified strength.', 'blood');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Bleed for me, and be glad it’s only blood.”' });
      for (const a of alive(s, 'party')) {
        addStatus(s, a, 'might', 2);
        if (a.key === 'sjen' || a.key === 'veato') {
          a.hp = Math.max(1, a.hp - 6);
          log(s, `${a.name} bleeds 6 HP for the privilege.`, 'hurt');
          evt(s, { k: 'float', unit: a.uid, text: '−6', type: 'hurt' });
        }
      }
      bumpTension(s, 'lucian_sjen', 3);
      bumpTension(s, 'lucian_veato', 3);
      break;
    case 'tyrants_grip':
      addStatus(s, t, 'stun', 1);
      tryFear(s, t, 2 + (m.gripBonus || 0));
      if (m.dreadSovereign) {
        for (const e of alive(s, 'enemy').filter((x) => x.uid !== t.uid && tdist(t, x) <= 2)) tryFear(s, e, 1);
      }
      log(s, `Tyrant’s Grip — ${t.name} is seized, throttled, and dropped trembling.`, 'hex');
      break;
    case 'rot_hex':
      hit(s, u, t, 0.6, 'Rot Hex');
      if (t.alive) {
        addStatus(s, t, 'curse', 3, 7 + (m.hexPower || 0));
        log(s, `The rot takes root in ${t.name}.`, 'hex');
      }
      break;
    case 'bone_ward':
      addStatus(s, t, 'shield', 99, 24 + (m.wardBonus || 0));
      log(s, `Cursed bone closes over ${t.name}. (${24 + (m.wardBonus || 0)} shield)`, 'hex');
      break;
    case 'debt_of_flesh': {
      const donors = alive(s, 'party').filter((a) => a.uid !== u.uid && a.key !== 'wretch');
      const donor = donors.sort((a, b) => b.hp - a.hp)[0] || u;
      const drain = Math.max(4, 12 + (m.fleshDrain || 0));
      donor.hp = Math.max(1, donor.hp - drain);
      log(s, `Sjen opens a vein in ${donor.name}’s arm without asking. −${drain} HP.`, 'hurt');
      evt(s, { k: 'float', unit: donor.uid, text: `−${drain}`, type: 'drain' });
      if (donor.key === 'lucian') {
        bumpTension(s, 'lucian_sjen', 3);
        evt(s, { k: 'bubble', unit: donor.uid, text: '“Touch my blood again and I’ll take your hands.”' });
        log(s, 'Lucian: “Touch my blood again and I’ll take your hands.”', 'blood');
      }
      if (donor.key === 'veato') bumpTension(s, 'sjen_veato', 3);
      hit(s, u, t, 2.4 + (m.fleshBonus || 0), 'Debt of Flesh');
      break;
    }
    case 'summon_wretch': {
      const w = mkUnit(
        { name: 'The Wretch', sigil: '✣', sprite: 'wretch', color: 'var(--hex)', hp: 26, atk: 4, speed: 5, abilities: ['gnaw'] },
        'party',
        'wretch'
      );
      const sjen = byKey(s, 'sjen');
      const cols = s.field?.columns || 8;
      const rows = s.field?.rows || 5;
      const occupied = new Set(s.units.filter((x) => x.alive).map((x) => `${x.tile?.x},${x.tile?.y}`));
      const want = sjen?.tile ? { x: Math.min(cols - 1, sjen.tile.x + 1), y: sjen.tile.y } : { x: 2, y: 2 };
      // Rise on a free tile — never on top of an ally or enemy.
      let placed = want;
      outer: for (let r = 0; r <= cols + rows; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nx = want.x + dx;
            const ny = want.y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            if (!occupied.has(`${nx},${ny}`)) {
              placed = { x: nx, y: ny };
              break outer;
            }
          }
        }
      }
      w.tile = placed;
      s.units.push(w);
      evt(s, { k: 'summon', unit: w.uid });
      log(s, 'Something small and wrong claws up through the floorboards and stands in front of the blades.', 'hex');
      break;
    }
    case 'whispering_pact': {
      const x = Math.random();
      if (x < 0.35) {
        log(s, 'The things below answer kindly, this once. A black wind scours the enemy line.', 'hex');
        for (const e of alive(s, 'enemy')) hit(s, u, e, 1.6, 'Whispering Pact');
      } else if (x < 0.6) {
        const e = pick(alive(s, 'enemy'));
        hit(s, u, e, 2.2, 'Whispering Pact');
        if (e.alive) addStatus(s, e, 'curse', 3, 7 + (m.hexPower || 0));
      } else if (x < 0.8) {
        u.hp = Math.max(1, u.hp - 15);
        s.corruptionDelta += 2;
        log(s, 'The things below answer with a price. Sjen pays 15 HP — and something less countable.', 'hurt');
        evt(s, { k: 'float', unit: u.uid, text: '−15', type: 'drain' });
      } else {
        const a = pick(alive(s, 'party'));
        addStatus(s, a, 'curse', 2, 6);
        log(s, `The pact sours. ${a.name} is cursed by a voice that sounds almost like Sjen’s.`, 'hex');
        if (a.key === 'lucian') bumpTension(s, 'lucian_sjen', 4);
        if (a.key === 'veato') bumpTension(s, 'sjen_veato', 4);
      }
      break;
    }
    case 'mo_bos_ie_eye': {
      const wasAlive = t?.alive;
      log(s, 'Sjenke: “Mo bos ie EYE!” His fist becomes titanium demon fire — made to crush eyes and skull.', 'death');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Mo bos ie EYE!”' });
      hit(s, u, t, 3.2 + (m.hexPower || 0) * 0.04, 'Mo bos ie EYE!');
      addStatus(s, u, 'stun', 2);
      log(s, 'The demon fire burns back through Sjen. He cannot act for two turns.', 'hex');
      evt(s, { k: 'float', unit: u.uid, text: 'Burned Out', type: 'blood-word' });
      if (wasAlive && t && !t.alive) {
        const witnesses = alive(s, 'enemy');
        if (witnesses.length) {
          log(s, `${t.name}'s eyes and skull collapse under the blow. Every surviving enemy sees what “Mo bos ie EYE!” means. Psychosis takes them.`, 'hex');
          for (const e of witnesses) {
            addStatus(s, e, 'psychosis', 1);
            evt(s, { k: 'float', unit: e.uid, text: 'Psychosis', type: 'blood-word' });
          }
        }
      } else if (t?.alive) {
        addStatus(s, t, 'fear', 1);
        log(s, `${t.name} survives, but not with its thoughts arranged correctly.`, 'hex');
      }
      break;
    }
    case 'crown_hex': {
      const alreadyRotting = hasStatus(t, 'curse');
      hit(s, u, t, alreadyRotting ? 1.75 : 1.25, alreadyRotting ? 'Crown Hex (the wound remembers)' : 'Crown Hex');
      if (t?.alive) {
        addStatus(s, t, 'curse', 4, 11 + (m.hexPower || 0));
        log(s, `Sjen writes a hex where ${t.name}'s future used to be.`, 'hex');
      }
      if (alreadyRotting) {
        for (const e of alive(s, 'enemy').filter((x) => x.uid !== t.uid)) {
          addStatus(s, e, 'curse', 2, 6 + (m.hexPower || 0));
          if (Math.random() < 0.45) addStatus(s, e, 'fear', 1);
        }
        log(s, 'Hex Mastery — the curse learns to travel without walking.', 'hex');
      }
      break;
    }
    case 'demon_invocation': {
      addStatus(s, u, 'might', 1);
      addStatus(s, u, 'focus', 1);
      log(s, 'Sjen lets the borrowed thing unfold under his skin. The air around him remembers fire, salt, and storm — and the memory tears through the enemy line.', 'death');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Only partly. For now.”' });
      for (const e of alive(s, 'enemy')) {
        hit(s, u, e, 0.80, 'Demon Invocation');
        if (e.alive) {
          addStatus(s, e, 'curse', 2, 7 + (m.hexPower || 0));
        }
      }
      s.corruptionDelta += 2;
      break;
    }
    case 'bow_shot':
      hit(s, u, t, hasStatus(t, 'marked') ? 1.3 : 1.05, hasStatus(t, 'marked') ? 'Mercenary Shot — Quarry' : 'Mercenary Shot');
      break;
    case 'venom_arrow': {
      const afflicted = t.statuses.some((x) => DEBUFFS.includes(x.type));
      hit(s, u, t, afflicted ? 1.15 : 0.85, afflicted ? 'Venom Arrow — Open Vein' : 'Venom Arrow');
      if (t.alive) addStatus(s, t, 'poison', 3, 7 + (m.hexPower || 0));
      break;
    }
    case 'pinning_shot':
      hit(s, u, t, 0.9, 'Pinning Shot');
      if (t.alive) {
        addStatus(s, t, 'cripple', 2);
        addStatus(s, t, 'bleed', 2, 4 + (m.bleedPower || 0));
        log(s, `${t.name} is nailed to its own shadow.`, 'hex');
      }
      break;
    case 'marked_quarry':
      hit(s, u, t, 0.65, 'Marked Quarry');
      if (t.alive) {
        addStatus(s, t, 'marked', 3);
        addStatus(s, t, 'fear', 1);
        log(s, `Veato names ${t.name} as quarry. The next arrow already knows the route.`, 'hex');
      }
      break;
    case 'backstab': {
      const weakened = t.statuses.some((x) => DEBUFFS.includes(x.type));
      const flanked = u.tile && t.tile && u.tile.x > t.tile.x;
      let bsMult, bsLabel;
      if (flanked && weakened) {
        bsMult = 2.6 + (m.backstabBonus || 0);
        bsLabel = 'Backstab — In the Dark';
      } else if (flanked) {
        bsMult = 1.5 + (m.backstabBonus || 0);
        bsLabel = 'Backstab — From Behind';
      } else if (weakened) {
        bsMult = 1.8 + (m.backstabBonus || 0);
        bsLabel = 'Backstab — Open Wound';
      } else {
        bsMult = 0.85;
        bsLabel = 'Backstab (frontal, no advantage)';
      }
      if (flanked) evt(s, { k: 'float', unit: u.uid, text: '+Behind', type: 'word' });
      if (weakened) evt(s, { k: 'float', unit: t.uid, text: '+Afflicted', type: 'word' });
      hit(s, u, t, bsMult, bsLabel);
      break;
    }
    case 'poison_blade':
      hit(s, u, t, 0.9, 'Poison Blade');
      if (t.alive) {
        addStatus(s, t, 'poison', 3, 6 + (m.hexPower || 0));
        log(s, `The poison settles into ${t.name}’s blood.`, 'hex');
      }
      break;
    case 'nether_bow': {
      const afflicted = t.statuses.some((x) => DEBUFFS.includes(x.type)) || hasStatus(t, 'marked');
      hit(s, u, t, afflicted ? 1.65 : 1.2, afflicted ? 'Nether Bow — Hunted Soul' : 'Nether Bow');
      if (t.alive) {
        addStatus(s, t, 'poison', 2, 5 + (m.hexPower || 0));
        if (afflicted && Math.random() < 0.4) addStatus(s, t, 'fear', 1);
      }
      log(s, 'Veato draws a bow that exists only between debts. Its string sounds like a door closing underground.', 'hex');
      break;
    }
    case 'prowling_pounce': {
      if (u.tile && t?.tile) {
        const candidates = reachableTiles(s, u)
          .filter((tile) => Math.max(Math.abs(tile.x - t.tile.x), Math.abs(tile.y - t.tile.y)) === 1)
          .sort((a, b) => a.cost - b.cost);
        if (candidates[0]) moveUnit(s, u, candidates[0]);
      }
      const weakened = t.statuses.some((x) => DEBUFFS.includes(x.type));
      hit(s, u, t, weakened ? 2.35 : 1.75, weakened ? 'Prowling Pounce — Throat Found' : 'Prowling Pounce');
      if (t.alive) addStatus(s, t, 'bleed', 2, 5 + (m.bleedPower || 0));
      log(s, 'Veato bows low, then crosses the distance like a black shape remembering claws.', 'blood');
      break;
    }
    case 'smoke_step':
      addStatus(s, u, 'dodge', 99);
      log(s, 'Veato folds himself into the smoke.', 'dim');
      break;
    case 'crippling_cut':
      hit(s, u, t, 0.8, 'Crippling Cut');
      if (t.alive) {
        addStatus(s, t, 'cripple', 2);
        addStatus(s, t, 'bleed', 2, 4 + (m.bleedPower || 0));
        log(s, `${t.name}’s tendons remember the knife.`, 'hex');
      }
      break;
    case 'sample_bolt': {
      const due = hasStatus(t, 'lien');
      hit(s, u, t, due ? 1.25 : 0.9, due ? 'Appraisal Bolt — Condemned' : 'Appraisal Bolt');
      log(s, due ? 'Chan: “Condemned.”' : 'Chan: “Insufficient.”', 'dim');
      break;
    }
    case 'place_lien':
      hit(s, u, t, 0.55, 'Black Writ');
      if (t.alive) {
        addStatus(s, t, 'lien', 3);
        addStatus(s, t, 'cripple', 1);
        log(s, `Chan: “Entered.” A black writ fixes ${t.name}'s value in blood.`, 'gold');
      }
      break;
    case 'repossess': {
      const seized = ['shield', 'might', 'zeal'].find((type) => hasStatus(t, type));
      hit(s, u, t, seized ? 0.85 : 0.55, 'Confiscate');
      if (seized) {
        const stolen = getStatus(t, seized);
        const protection = seized === 'shield' ? Math.max(12, stolen?.power || 0) : 18;
        removeStatus(t, seized);
        addStatus(s, u, 'shield', 99, protection);
        log(s, `Chan: “Forfeit.” ${t.name}'s ${seized} becomes ${protection} shield.`, 'gold');
      } else {
        addStatus(s, t, 'fear', 1);
        log(s, 'Chan: “Nothing worth taking.”', 'dim');
      }
      break;
    }
    case 'cheap_insurance':
      addStatus(s, t, 'shield', 99, 16);
      s.skim += 5;
      log(s, `Chan covers ${t.name}. “Deducted.”`, 'gold');
      break;
    case 'spite_hex': {
      const duo = byKey(s, 'sjen') ? 0.35 : 0;
      hit(s, u, t, 0.7 + duo, 'Spite Hex');
      if (t.alive) addStatus(s, t, 'curse', 3, 6 + (duo ? 3 : 0));
      break;
    }
    case 'needlework':
      hit(s, u, t, t.boss ? 1.35 : 1.1, 'Needlework');
      if (t.alive) {
        addStatus(s, t, 'bleed', 3, 5 + (t.boss ? 2 : 0));
        addStatus(s, t, 'poison', 2, 4);
      }
      break;
    case 'duo_rite': {
      const sjen = byKey(s, 'sjen');
      if (sjen) addStatus(s, sjen, 'might', 1);
      addStatus(s, u, 'dodge', 1);
      log(s, 'Chibi and Sjen share a look. Everyone else becomes less necessary.', 'hex');
      for (const e of alive(s, 'enemy')) {
        addStatus(s, e, 'curse', 2, 7);
        if (Math.random() < 0.45) addStatus(s, e, 'fear', 1);
      }
      bumpTension(s, 'lucian_sjen', 2);
      bumpTension(s, 'sjen_veato', 2);
      break;
    }
    // Enemy abilities
    case 'spade_strike': {
      hit(s, u, t, 1.15, 'Spade Strike');
      if (t?.alive) {
        addStatus(s, t, 'cripple', 2);
        log(s, `The rusted spade tears into ${t.name}. Movement slows. The wound stays open.`, 'hurt');
      }
      break;
    }
    case 'exhume': {
      log(s, 'The Catacomb Digger drives its spade into the earth — what it uncovers should have stayed buried.', 'hex');
      evt(s, { k: 'bubble', unit: u.uid, text: '“——”' });
      const congregants = s.units.filter((x) => x.alive && x.key === 'flesh_congregant');
      for (const c of congregants) {
        const heal = Math.min(6, c.maxHp - c.hp);
        if (heal > 0) {
          c.hp += heal;
          evt(s, { k: 'float', unit: c.uid, text: `+${heal} HP`, type: 'word' });
        }
      }
      if (congregants.length) log(s, `${congregants.length} Flesh Congregant${congregants.length > 1 ? 's feed' : ' feeds'} on what the earth gives up.`, 'hex');
      break;
    }
    case 'corpse_feed': {
      const onPile = unitTerrain(s, u).type === 'corpse_pile';
      hit(s, u, t, 0.9, onPile ? 'Corpse Feed — the pile fuels it' : 'Corpse Feed');
      if (onPile && u.alive) {
        const healed = Math.min(5, u.maxHp - u.hp);
        if (healed > 0) {
          u.hp += healed;
          log(s, `${u.name} feeds from the corpse pile. It regains ${healed} HP.`, 'hex');
          evt(s, { k: 'float', unit: u.uid, text: `+${healed} HP`, type: 'word' });
        }
      }
      if (t?.alive) addStatus(s, t, 'bleed', 2, 3);
      break;
    }
    case 'flail_sweep': {
      const targets = s.units.filter((x) => x.alive && x.side === 'party');
      const primary = t;
      const adjacent = targets.filter((x) => x.uid !== primary?.uid).slice(0, 1);
      hit(s, u, primary, 1.0, 'Flail Sweep');
      for (const x of adjacent) {
        if (x.alive) hit(s, u, x, 1.0, 'Flail Sweep');
      }
      log(s, `The morning star arcs. The chain remembers everyone.`, 'hurt');
      break;
    }
    case 'penance_lash': {
      const selfCost = 8;
      u.hp = Math.max(1, u.hp - selfCost);
      evt(s, { k: 'float', unit: u.uid, text: `-${selfCost}`, type: 'hurt' });
      log(s, `${u.name} tears flesh from itself. The doctrine demands it.`, 'hex');
      hit(s, u, t, 1.4, 'Penance Lash');
      if (u.alive) {
        addStatus(s, u, 'might', 2);
        evt(s, { k: 'float', unit: u.uid, text: 'Martyr', type: 'word' });
      }
      break;
    }
    case 'black_unction': {
      const corpses = s.units.filter(
        (x) => !x.alive && !x.fled && x.side === 'enemy' && !x.unctioned && x.key !== u.key
      );
      if (!corpses.length) break;
      const c = corpses.sort((a, b) => b.maxHp - a.maxHp)[0];
      c.unctioned = true;
      c.alive = true;
      c.hp = Math.max(1, Math.round(c.maxHp * 0.6));
      c.atk = Math.round(c.atk * 1.3);
      c.speed += 2;
      c.name = `Depraved ${c.name}`;
      c.statuses = [];
      c.mods = { ...(c.mods || {}), deathHungry: true };
      if (!c.immunities) c.immunities = [];
      if (!c.immunities.includes('fear')) c.immunities.push('fear');
      // If something now stands on the corpse, the risen thing claws out beside it.
      if (c.tile && s.units.some((x) => x.alive && x !== c && x.tile && x.tile.x === c.tile.x && x.tile.y === c.tile.y)) {
        const cols = s.field?.columns || 8;
        const rows = s.field?.rows || 5;
        outer: for (let r = 1; r <= 3; r++) {
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const nx = c.tile.x + dx;
              const ny = c.tile.y + dy;
              if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
              if (!s.units.some((x) => x.alive && x.tile && x.tile.x === nx && x.tile.y === ny)) {
                c.tile = { x: nx, y: ny };
                break outer;
              }
            }
          }
        }
      }
      log(s, `${u.name} kneels over the corpse and pours the Black Unction into what used to be its mouth.`, 'death');
      log(s, `${c.name} rises. Whatever came back is not what fell. It looks at the living the way the starving look at bread.`, 'death');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Rise. You are not finished being useful.”' });
      evt(s, { k: 'summon', unit: c.uid });
      evt(s, { k: 'float', unit: c.uid, text: 'RISEN WORSE', type: 'blood-word' });
      break;
    }
    case 'papal_bull': {
      log(s, `${u.name} unrolls a decree written on skin nobody donated.`, 'hex');
      for (const ally of s.units.filter((x) => x.alive && x.side === 'enemy' && x.uid !== u.uid)) {
        addStatus(s, ally, 'might', 1);
        evt(s, { k: 'float', unit: ally.uid, text: 'Blessed', type: 'word' });
      }
      break;
    }
    case 'censer_of_marrow': {
      hit(s, u, t, 1.05, 'Censer of Marrow');
      if (t?.alive) addStatus(s, t, 'curse', 2, 4 + (s.diff?.afflictionBonus || 0));
      break;
    }
    case 'claw':
    case 'heavy_blow':
    case 'gnaw':
      hit(s, u, t, 1.0, A.name);
      break;
    case 'rusted_blade':
      hit(s, u, t, 1.0, 'Rusted Blade');
      if (t && t.alive && Math.random() < 0.55) addStatus(s, t, 'bleed', 3, 4 + (s.diff?.afflictionBonus || 0));
      break;
    case 'desperate_rush':
      log(s, `${u.name} throws fear away and rushes twice.`, 'blood');
      hit(s, u, t, 0.75, 'Desperate Rush');
      if (t?.alive) hit(s, u, t, 0.75, 'Desperate Rush');
      u.hp = Math.max(1, u.hp - Math.ceil(u.maxHp * 0.18));
      addStatus(s, u, 'vulnerable', 1);
      evt(s, { k: 'float', unit: u.uid, text: 'Open', type: 'word' });
      break;
    case 'plague_bite':
      hit(s, u, t, 0.7, 'Plague Bite');
      if (t && t.alive) addStatus(s, t, 'poison', 3, 6 + (s.diff?.afflictionBonus || 0));
      break;
    case 'pox_lob':
      hit(s, u, t, 0.8, 'Pox Lob');
      if (t && t.alive) addStatus(s, t, 'poison', 2, 4 + (s.diff?.afflictionBonus || 0));
      break;
    case 'rotten_guard':
      addStatus(s, u, 'rotten_guard', 3);
      log(s, `${u.name} raises a rotten guard. Melee answers will carry poison.`, 'hex');
      break;
    case 'chain_lash':
      hit(s, u, t, 1.1, 'Chain Lash');
      if (t && t.alive) addStatus(s, t, 'bleed', 2, 5);
      break;
    case 'debt_mark': {
      for (const p of alive(s, 'party')) removeStatus(p, 'marked');
      addStatus(s, t, 'marked', 3);
      log(s, `Debt Mark — the Knight writes ${t.name}'s name in the air.`, 'blood');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Named.”' });
      break;
    }
    case 'collection_swing':
      hit(s, u, t, hasStatus(t, 'marked') ? 2.25 : 1.2, hasStatus(t, 'marked') ? 'Collection Swing' : 'Impatient Collection');
      break;
    case 'chain_tax':
      log(s, 'Chain Tax — everyone pays a little, and the company hates each other for it.', 'blood');
      for (const p of alive(s, 'party')) hit(s, u, p, 0.55, 'Chain Tax');
      bumpTension(s, 'lucian_sjen', Math.round(3 * (s.diff?.tensionMult || 1)));
      bumpTension(s, 'lucian_veato', Math.round(3 * (s.diff?.tensionMult || 1)));
      bumpTension(s, 'sjen_veato', Math.round(2 * (s.diff?.tensionMult || 1)));
      break;
    case 'ledger_hook': {
      hit(s, u, t, 0.8, 'Ledger Hook');
      if (t?.alive && u.tile && t.tile) {
        const dragged = stepToward(s, t, u.tile, 2);
        if (dragged) {
          moveUnit(s, t, dragged);
          log(s, `${t.name} is dragged across the ledger stones and torn out of formation.`, 'blood');
          evt(s, { k: 'float', unit: t.uid, text: 'Dragged', type: 'blood-word' });
        }
        addStatus(s, t, 'marked', 2);
      }
      break;
    }
    case 'foreclosure': {
      const clustered = alive(s, 'party').filter((p) => p.tile && t?.tile && tdist(p, t) <= 1);
      log(s, 'Foreclosure — the Knight repossesses the ground beneath the company.', 'death');
      for (const p of clustered) {
        hit(s, u, p, p.uid === t.uid ? 1.25 : 0.8, 'Foreclosure');
        if (p.alive) addStatus(s, p, 'cripple', 1);
      }
      break;
    }
    case 'kneel_debtor':
      hit(s, u, t, 0.65, 'Kneel, Debtor');
      if (t && t.alive) addStatus(s, t, Math.random() < 0.5 ? 'stun' : 'fear', 1);
      break;
    case 'final_ledger':
      hit(s, u, t, hasStatus(t, 'marked') ? 3.35 : 2.25, 'Final Ledger');
      break;
    case 'penitent_flurry':
      hit(s, u, t, 0.72, 'Penitent Flurry');
      if (t?.alive) hit(s, u, t, 0.72, 'Penitent Flurry');
      if (t?.alive) addStatus(s, t, 'bleed', 2, 5 + (s.diff?.afflictionBonus || 0));
      break;
    case 'smoke_censer':
      log(s, `${u.name} swings a censer until the field tastes like burned saints. Doctrine thickens into poison.`, 'hex');
      for (const p of alive(s, 'party')) if (Math.random() < 0.6) addStatus(s, p, 'fear', 1);
      for (const e of alive(s, 'enemy')) addStatus(s, e, 'zeal', 2);
      addStatus(s, u, 'shield', 99, 16);
      break;
    case 'cinder_maul':
      hit(s, u, t, 1.55, 'Cinder Maul');
      if (t?.alive) addStatus(s, t, 'stun', 1);
      break;
    case 'audit_sin':
      hit(s, u, t, 0.85, 'Audit Sin');
      if (t?.alive) {
        addStatus(s, t, 'marked', 2);
        addStatus(s, t, 'fear', 1);
        bumpTension(s, t.key === 'sjen' ? 'lucian_sjen' : t.key === 'veato' ? 'lucian_veato' : 'sjen_veato', 1);
      }
      break;
    case 'burning_writ':
      hit(s, u, t, 1.0, 'Burning Writ');
      if (t?.alive) {
        addStatus(s, t, 'curse', 2, 6 + (s.diff?.afflictionBonus || 0));
        addStatus(s, t, 'bleed', 2, 4);
      }
      break;
    case 'grave_bloom':
      hit(s, u, t, 0.8, 'Grave Bloom');
      if (t?.alive) {
        addStatus(s, t, 'poison', 3, 5 + (s.diff?.afflictionBonus || 0));
        addStatus(s, t, 'curse', 2, 5);
      }
      log(s, 'Dead doctrine flowers in the wound.', 'hex');
      break;
    case 'bone_clutch':
      hit(s, u, t, hasStatus(t, 'fear') || hasStatus(t, 'marked') ? 1.65 : 1.0, 'Bone Clutch');
      if (t?.alive) addStatus(s, t, 'cripple', 2);
      break;
    case 'sermon_of_teeth':
      log(s, `${u.name} preaches with every mouth it has. The sermon bites back.`, 'death');
      for (const p of alive(s, 'party')) {
        hit(s, u, p, hasStatus(p, 'fear') ? 0.85 : 0.55, 'Sermon of Teeth');
        if (p.alive && Math.random() < 0.35) addStatus(s, p, 'fear', 1);
      }
      for (const e of alive(s, 'enemy')) addStatus(s, e, 'zeal', 2);
      break;
    case 'faith_eater':
      hit(s, u, t, 1.3, 'Faith Eater');
      if (t?.alive) {
        if (hasStatus(t, 'might')) removeStatus(t, 'might');
        if (hasStatus(t, 'focus')) removeStatus(t, 'focus');
        addStatus(s, u, 'might', 2);
        log(s, `${u.name} eats the courage out of ${t.name}.`, 'blood');
      }
      break;
    case 'erase_face':
      hit(s, u, t, hasStatus(t, 'marked') ? 2.4 : 1.45, 'Erase Face');
      if (t?.alive) {
        addStatus(s, t, 'fear', 2);
        addStatus(s, t, 'stun', 1);
      }
      break;
    case 'absolve_screaming':
      log(s, 'The Saint offers absolution. It sounds exactly like screaming.', 'death');
      for (const p of alive(s, 'party')) {
        hit(s, u, p, 0.65, 'Absolve Screaming');
        if (p.alive && Math.random() < 0.45) addStatus(s, p, 'fear', 1);
      }
      for (const e of alive(s, 'enemy')) addStatus(s, e, 'zeal', 2);
      break;
    case 'martyr_tax':
      log(s, 'Martyr Tax — every wound becomes doctrine, and doctrine looks for someone to blame.', 'blood');
      for (const p of alive(s, 'party')) hit(s, u, p, 0.45, 'Martyr Tax');
      addStatus(s, u, 'might', 2);
      addStatus(s, u, 'zeal', 2);
      bumpTension(s, 'lucian_sjen', Math.round(2 * (s.diff?.tensionMult || 1)));
      bumpTension(s, 'lucian_veato', Math.round(2 * (s.diff?.tensionMult || 1)));
      bumpTension(s, 'sjen_veato', Math.round(2 * (s.diff?.tensionMult || 1)));
      break;
    default:
      break;
  }
  s.castAbility = null;
  checkEnd(s);
  if (u.side === 'enemy') combatExchange(s, u, t);
}

function endTurn(s, u) {
  if (u && u.alive) {
    for (const st of u.statuses) {
      if (st.type !== 'shield' && st.type !== 'dodge') st.turns--;
    }
    u.statuses = u.statuses.filter((st) =>
      st.type === 'shield' ? st.power > 0 : st.type === 'dodge' ? true : st.turns > 0
    );
    for (const k in u.cooldowns) if (u.cooldowns[k] > 0) u.cooldowns[k]--;
  }
  s.auto = null;
  s.moved = false; // the next unit starts with its full move available
}

function checkEnd(s) {
  if (s.over) return true;
  if (!s.units.some((u) => u.alive && u.side === 'enemy')) {
    s.over = 'victory';
    log(s, 'The field belongs to the Black Tithe.', 'gold');
    // Shared victories are the only language they all still speak.
    let eased = false;
    for (const k of ['lucian_sjen', 'lucian_veato', 'sjen_veato']) {
      if (s.tension[k] > 0) {
        bumpTension(s, k, -2);
        eased = true;
      }
    }
    if (eased) log(s, 'A shared kill eases the air between them. The knives sheath — for now.', 'dim');
    // Greed: Veato finds what the others miss.
    const v = s.units.find((u) => u.key === 'veato');
    if (v && v.alive && v.mods.lootChance && Math.random() < v.mods.lootChance) {
      const foundGold = 10 + Math.round(20 * Math.random());
      s.bonusGold += foundGold;
      log(s, `Greed — Veato finds pockets the others missed. +${foundGold} gold.`, 'gold');
    }
    // High tension: the take comes up light.
    if (s.tension.lucian_veato >= 65 && Math.random() < 0.4) {
      s.skim = 15;
      log(s, 'Counting the spoils later, the purse is lighter than the corpses say it should be.', 'dim');
    }
    if (s.hadAscensionThreat && (s.ascensions || 0) === 0) {
      s.bonusGold += 18;
      s.bonusXp += 15;
      log(s, 'Mastery — no corpse was allowed to bloom. +18 gold, +15 XP.', 'gold');
    }
    if (s.round <= 4) {
      s.bonusGold += 12;
      s.bonusXp += 12;
      log(s, `Fast contract — finished by round ${s.round}. +12 gold, +12 XP.`, 'gold');
    }
    if ((s.partyLosses || 0) === 0) {
      s.bonusXp += 10;
      log(s, 'Clean ledger — nobody in the company dropped. +10 XP.', 'gold');
    }
    if (s.hadAscensionThreat && (s.ascensions || 0) > 0) {
      s.cocoliObjective = true;
      s.bonusXp += 30;
      s.corruptionDelta += 3;
      log(s, 'Cocoli watches the ruined bloom you allowed. Her approval feels like snow in the mouth. +30 XP, +3 corruption.', 'hex');
      evt(s, { k: 'float', unit: alive(s, 'party')[0]?.uid, text: 'COCOLI SAW', type: 'word' });
    }
    if (!s.lootItem) {
      if (s.preventedAscensions >= 2) s.lootItem = 'demon_tooth';
      else if (s.hadAscensionThreat && (s.ascensions || 0) === 0) s.lootItem = 'black_indulgence';
      else if (s.round <= 3) s.lootItem = 'ash_crown_splinter';
    }
    if (s.lootItem) {
      log(s, `Rare find — ${LOOT_NAMES[s.lootItem] || s.lootItem.replaceAll('_', ' ')} is pulled from the ruin.`, 'gold');
    }
    return true;
  }
  const luc = s.units.find((u) => u.key === 'lucian');
  if (luc && !luc.alive) {
    s.over = 'defeat';
    log(s, 'Lucian falls. Sjen and Veato do not die for hire. They melt into the smoke and leave him to the crows.', 'death');
    return true;
  }
  if (!s.units.some((u) => u.alive && u.side === 'party')) {
    s.over = 'defeat';
    return true;
  }
  return false;
}

function maybeBanter(s) {
  const pairs = [
    ['lucian_sjen', 'Lucian', 'Sjen'],
    ['lucian_veato', 'Lucian', 'Veato'],
    ['sjen_veato', 'Sjen', 'Veato'],
  ].filter(([, a, b]) => byKey(s, a.toLowerCase()) && byKey(s, b.toLowerCase()));
  if (!pairs.length) return;
  const [key, a, b] = pairs.sort((x, y) => s.tension[y[0]] - s.tension[x[0]])[0];
  const tier = tensionTier(s.tension[key]);
  if (Math.random() > (tier === 'critical' ? 0.5 : 0.3)) return;
  const entry = pick(BANTER[tier]);
  const line = entry.log.replaceAll('{a}', a).replaceAll('{b}', b);
  log(s, line, tier === 'low' ? 'dim' : tier === 'medium' ? 'info' : 'blood');
  if (entry.bubble && entry.who) {
    const speaker = byKey(s, (entry.who === 'a' ? a : b).toLowerCase());
    if (speaker) evt(s, { k: 'bubble', unit: speaker.uid, text: entry.bubble.replaceAll('{a}', a).replaceAll('{b}', b) });
  }
  // Medium tier: arguments leave marks. Never worse than that below high tension.
  if (tier === 'medium' && Math.random() < 0.3) {
    for (const name of [a, b]) {
      const u = byKey(s, name.toLowerCase());
      if (u) {
        u.hp = Math.max(1, u.hp - 2);
        evt(s, { k: 'float', unit: u.uid, text: '−2', type: 'hurt' });
      }
    }
    log(s, 'The argument comes with elbows. Both bleed a little.', 'hurt');
  }
}

function advance_(s) {
  for (let guard = 0; guard < 300; guard++) {
    if (checkEnd(s)) return s;
    s.turnIdx++;
    if (s.turnIdx >= s.queue.length) {
      s.round++;
      for (const enemy of alive(s, 'enemy')) {
        if (enemy.transformInto && enemy.transformTimer > 0) {
          enemy.transformTimer -= unitTerrain(s, enemy).type === 'corpse_pile' ? 2 : 1;
          syncTransformStatus(s, enemy);
          if (enemy.transformTimer > 0) {
            log(s, `${enemy.name} convulses. Ascension in ${enemy.transformTimer}.`, enemy.transformTimer === 1 ? 'death' : 'hex');
            evt(s, { k: 'float', unit: enemy.uid, text: `${enemy.transformTimer}`, type: enemy.transformTimer === 1 ? 'blood-word' : 'word' });
          } else {
            transformEnemy(s, enemy);
          }
        }
      }
      s.queue = s.units
        .filter((u) => u.alive)
        .sort((a, b) => b.speed - a.speed)
        .map((u) => u.uid);
      s.turnIdx = 0;
      log(s, `— Round ${s.round} —`, 'round');
      if (s.round >= 2) maybeBanter(s);
    }
    const u = getUnit(s, s.queue[s.turnIdx]);
    if (!u || !u.alive) continue;

    const terrain = unitTerrain(s, u);
    if (terrain.type === 'debtor_seal' && u.side === 'party' && hasStatus(u, 'marked')) {
      const dmg = 7;
      u.hp -= dmg;
      log(s, `The debtor seal recognizes ${u.name}. The ground collects ${dmg} HP.`, 'hurt');
      evt(s, { k: 'dot', unit: u.uid, type: 'curse', amount: dmg });
      if (u.hp <= 0) {
        kill(s, u, null);
        continue;
      }
    }
    if (terrain.type === 'holy_ground' && isUnholy(u)) {
      const dmg = u.boss ? 4 : 7;
      u.hp -= dmg;
      log(s, `${u.name} burns on holy ground.`, 'hurt');
      evt(s, { k: 'dot', unit: u.uid, type: 'holy', amount: dmg });
      if (u.hp <= 0) {
        kill(s, u, null);
        continue;
      }
    }

    // The Depraved burn themselves toward the grave they were denied.
    if (u.mods?.deathHungry) {
      const burn = 3;
      u.hp -= burn;
      log(s, `${u.name} strains against its own borrowed flesh. It loses ${burn} HP hurrying back to death.`, 'hex');
      evt(s, { k: 'dot', unit: u.uid, type: 'curse', amount: burn });
      if (u.hp <= 0) {
        kill(s, u, null);
        continue;
      }
    }
    // Flesh Congregants passively feed from corpse piles each round.
    if (u.mods?.corpsePileRegen && terrain.type === 'corpse_pile' && u.hp < u.maxHp) {
      const regen = 3;
      u.hp = Math.min(u.maxHp, u.hp + regen);
      log(s, `${u.name} draws sustenance from the corpse pile. +${regen} HP.`, 'dim');
      evt(s, { k: 'float', unit: u.uid, text: `+${regen}`, type: 'word' });
    }

    // Damage over time ticks at the start of the unit's turn.
    let died = false;
    for (const st of u.statuses) {
      if (DOTS[st.type]) {
        let dmg = st.power;
        const onBloodSlick = st.type === 'bleed' && terrain.type === 'blood_slick';
        if (onBloodSlick) dmg += 2;
        if (st.type !== 'bleed') dmg = Math.max(1, dmg - (u.mods?.dotResist || 0));
        u.hp -= dmg;
        log(s, `${u.name} suffers ${dmg} ${DOTS[st.type]}${onBloodSlick ? ' — the blood slick deepens the wound' : ''}.`, 'hurt');
        evt(s, { k: 'dot', unit: u.uid, type: st.type, amount: dmg });
        if (u.hp <= 0) {
          kill(s, u, null);
          died = true;
          break;
        }
      }
    }
    if (died) continue;

    if (hasStatus(u, 'stun')) {
      log(s, `${u.name} is stunned — the turn is lost.`, 'dim');
      evt(s, { k: 'float', unit: u.uid, text: 'Stunned', type: 'word' });
      endTurn(s, u);
      continue;
    }
    if (hasStatus(u, 'psychosis')) {
      log(s, `${u.name} claws at its own eyes, trapped in psychosis. The turn is lost.`, 'death');
      evt(s, { k: 'float', unit: u.uid, text: 'Psychosis', type: 'blood-word' });
      endTurn(s, u);
      continue;
    }
    if (hasStatus(u, 'fear') && Math.random() < 0.25) {
      log(s, `${u.name} cowers, mastered by fear.`, 'dim');
      evt(s, { k: 'float', unit: u.uid, text: 'Cowers', type: 'word' });
      endTurn(s, u);
      continue;
    }

    s.auto = null;
    if (u.side === 'enemy') {
      s.auto = 'enemy';
      return s;
    }
    if (u.key === 'wretch') {
      s.auto = 'wretch';
      return s;
    }

    // CRITICAL tension (90+): the knives come out. Once per companion per
    // combat, never below this threshold — betrayal is earned, not random.
    if (u.key === 'sjen' || u.key === 'veato') {
      const tkey = u.key === 'sjen' ? 'lucian_sjen' : 'lucian_veato';
      if (s.tension[tkey] >= 90 && !s.betrayed[u.key] && Math.random() < 0.2) {
        s.betrayed[u.key] = true;
        const luc = byKey(s, 'lucian');
        if (Math.random() < 0.5 && luc) {
          log(
            s,
            u.key === 'veato'
              ? 'Veato’s hidden knife finally finds Lucian’s back.'
              : 'Sjen turns his craft on the man who holds his leash.',
            'death'
          );
          evt(s, {
            k: 'bubble',
            unit: u.uid,
            text: u.key === 'veato' ? '“Nothing personal. Everything priced.”' : '“I was never yours.”',
          });
          s.castAbility = u.key === 'veato' ? 'backstab' : 'rot_hex';
          evt(s, { k: 'cast', actor: u.uid, ability: s.castAbility, target: luc.uid });
          hit(s, u, luc, u.key === 'veato' ? 1.8 : 1.6, u.key === 'veato' ? 'The Hidden Knife' : 'A Saved Curse');
          s.castAbility = null;
          bumpTension(s, tkey, 5);
        } else {
          u.alive = false;
          u.fled = true;
          log(s, `${u.name} weighs the contract against the company — and walks out of the fight.`, 'death');
          evt(s, { k: 'flee', unit: u.uid });
          evt(s, { k: 'float', unit: u.uid, text: 'Gone', type: 'word' });
        }
        endTurn(s, u);
        continue;
      }
      // HIGH tension (65+): sabotage. They act, but not for Lucian.
      if (s.tension[tkey] >= 65 && Math.random() < 0.2) {
        s.auto = 'sabotage';
        const line =
          u.key === 'sjen'
            ? 'Sjen ignores Lucian’s order. “I do not take commands from carrion.”'
            : 'Veato acts on his own account. “Invoice me.”';
        log(s, line, 'blood');
        evt(s, { k: 'bubble', unit: u.uid, text: u.key === 'sjen' ? '“I do not take commands from carrion.”' : '“Invoice me.”' });
        evt(s, { k: 'float', unit: u.uid, text: 'Sabotage', type: 'blood-word' });
        bumpTension(s, tkey, 2);
        return s;
      }
    }
    return s; // A controllable party member is ready.
  }
  return s;
}

function enemyAI(s, u) {
  const party = alive(s, 'party');
  if (!party.length) return;
  const wretch = party.find((p) => p.key === 'wretch');
  const scored = party
    .filter((p) => !(p.key === 'wretch' && Math.random() >= 0.55))
    .map((p) => {
      let score = 0;
      if (p.hp <= Math.max(10, u.atk * 2)) score += 10;   // near kill range
      if (p.hp < p.maxHp * 0.35) score += 8;              // bloodied
      if (p.hp < p.maxHp * 0.2) score += 8;               // near death, finish them
      if (hasStatus(p, 'marked')) score += 7;              // marked prey
      if (hasStatus(p, 'poison') || hasStatus(p, 'bleed')) score += 3; // already rotting
      if (hasStatus(p, 'fear')) score += 2;                // fear them into the grave
      if (hasStatus(p, 'might') || hasStatus(p, 'focus')) score += 4; // shut down their buffs
      if (p.key === 'sjen') score += 3;                    // silence the hex-caster
      if (p.key === 'veato') score += 1;
      if (p.key === 'lucian' && p.hp > p.maxHp * 0.6) score += 2;
      return { p, score: score + Math.random() * 1.5 };
    })
    .sort((a, b) => b.score - a.score);
  let target = scored[0]?.p || wretch || pick(party);

  // Ranged enemies kite: with a melee attacker breathing down their neck, they
  // give ground to a tile that keeps them shooting — paying for it with the
  // opening they hand over by turning away (an opportunity attack).
  let retreated = false;
  if (!u.boss && u.tile) {
    const reach = maxReadyReach(u);
    const threats = s.units.filter((x) => x.alive && x.side !== u.side && x.tile && meleeThreat(x));
    const adjacent = threats.some((x) => tdist(x, u) === 1);
    if (reach >= 2 && adjacent) {
      const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
      let best = null;
      let bestScore = -Infinity;
      for (const sp of reachableTiles(s, u)) {
        const minThreat = threats.length ? Math.min(...threats.map((t) => cheb(sp, t.tile))) : 9;
        if (minThreat < 2) continue; // must actually break contact
        const canShoot = party.some((p) => p.alive && p.tile && cheb(sp, p.tile) <= reach);
        const score = minThreat * 3 + (canShoot ? 6 : 0) - sp.cost * 0.1;
        if (score > bestScore) {
          bestScore = score;
          best = sp;
        }
      }
      if (best) {
        log(s, `${u.name} gives ground, keeping its distance.`, 'dim');
        moveUnit(s, u, best);
        if (s.over || !u.alive) return;
        retreated = true;
        const inRange = party.filter((p) => p.alive && p.tile && tdist({ tile: best }, p) <= reach);
        if (inRange.length) target = inRange.sort((a, b) => a.hp - b.hp)[0];
      }
    }
  }

  // Regular enemies maneuver; the boss is an immovable wall whose chains and
  // ledger already reach the whole field. Close in if nothing ready can hit.
  if (!retreated && !u.boss && target.tile && u.tile) {
    const FREE_AOE = ['sermon_of_teeth', 'smoke_censer', 'absolve_screaming', 'martyr_tax', 'whispering_pact', 'demon_invocation', 'duo_rite', 'chain_tax'];
    const readyReach = u.abilities.filter(
      (id) =>
        (u.cooldowns[id] || 0) <= 0 &&
        (ABILITIES[id].target === 'enemy' || ABILITIES[id].target === 'party') &&
        abilityReach(id, u) < 99
    );
    const hasFreeAoe = u.abilities.some(
      (id) => (u.cooldowns[id] || 0) <= 0 && ABILITIES[id].target === 'none' && FREE_AOE.includes(id)
    );
    if (!hasFreeAoe && !readyReach.some((id) => inReach(s, u, target, id))) {
      const dest = stepToward(s, u, target.tile, moveBudget(u));
      if (dest && (dest.x !== u.tile.x || dest.y !== u.tile.y)) {
        log(s, `${u.name} closes the distance.`, 'dim');
        moveUnit(s, u, dest);
        if (s.over || !u.alive) return;
      }
      if (!readyReach.some((id) => inReach(s, u, target, id))) return; // turn spent advancing
    }
  }

  if (u.boss) {
    const hpRatio = u.hp / u.maxHp;
    if (hpRatio <= 0.5 && !s.bossPhase2) {
      s.bossPhase2 = true;
      u.atk = Math.round(u.atk * 1.18);
      log(s, 'Chains snap from the Knight. Phase II begins: the debt starts collecting itself.', 'death');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Arrears.”' });
    }
    if (hpRatio <= 0.2 && !s.finalLedgerWarned) {
      s.finalLedgerWarned = true;
      s.finalLedgerTarget = (party.find((p) => hasStatus(p, 'marked')) || target).uid;
      const warned = getUnit(s, s.finalLedgerTarget);
      log(s, 'The Knight opens the ledger. A name writes itself in blood.', 'death');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Final entry.”' });
      if (warned) evt(s, { k: 'float', unit: warned.uid, text: 'Final Ledger', type: 'blood-word' });
      endTurn(s, u);
      return;
    }
    if (s.finalLedgerWarned && !s.finalLedgerSpent) {
      s.finalLedgerSpent = true;
      target = getUnit(s, s.finalLedgerTarget) || target;
      resolveAbility(s, u, 'final_ledger', target.uid);
      return;
    }
    if (!party.some((p) => hasStatus(p, 'marked'))) {
      const markTarget = party.find((p) => p.key !== 'wretch') || target;
      resolveAbility(s, u, 'debt_mark', markTarget.uid);
      return;
    }
    if (s.bossPhase2 && (u.cooldowns.chain_tax || 0) <= 0 && Math.random() < 0.55) {
      resolveAbility(s, u, 'chain_tax', null);
      return;
    }
  }

  // Score every available ability and pick the best one for the situation.
  const BASIC_IDS = new Set(['basic_attack', 'rusted_blade', 'claw']);
  const FINISHER_IDS = new Set(['heavy_blow', 'cinder_maul', 'sermon_of_teeth', 'faith_eater', 'grave_bloom', 'bone_clutch', 'penitent_flurry', 'burning_writ', 'desperate_rush']);
  const AOE_IDS = new Set(['smoke_censer', 'chain_tax', 'sermon_of_teeth', 'martyr_tax', 'pox_lob', 'chain_lash']);
  const DOT_IDS = new Set(['plague_bite', 'pox_lob', 'audit_sin', 'burning_writ', 'kneel_debtor']);
  const targetLow = target.hp < target.maxHp * 0.35;
  const targetClean = !DEBUFFS.some((d) => hasStatus(target, d));
  const candidates = [];
  for (const id of u.abilities) {
    const A = ABILITIES[id];
    if ((u.cooldowns[id] || 0) > 0) continue;
    if (id === 'desperate_rush' && u.hp > u.maxHp * 0.4) continue;
    if (id === 'rotten_guard' && hasStatus(u, 'rotten_guard')) continue;
    if (id === 'collection_swing' && !party.some((p) => hasStatus(p, 'marked'))) continue;
    if (id === 'debt_mark' && party.some((p) => hasStatus(p, 'marked'))) continue;
    if (id === 'chain_tax' && !u.boss && party.length < 2) continue;
    if (id === 'black_unction' && !s.units.some((x) => !x.alive && !x.fled && x.side === 'enemy' && !x.unctioned && x.key !== u.key)) continue;
    if (id === 'papal_bull' && !s.units.some((x) => x.alive && x.side === 'enemy' && x.uid !== u.uid)) continue;
    if (!u.boss && (A.target === 'enemy' || A.target === 'party') && !inReach(s, u, target, id)) continue;
    let sc = BASIC_IDS.has(id) ? 0 : 8;           // always prefer specials
    if (FINISHER_IDS.has(id) && targetLow) sc += 12;  // press the kill
    if (AOE_IDS.has(id) && party.length >= 2) sc += 7; // AoE with multiple targets
    if (DOT_IDS.has(id) && targetClean) sc += 5;    // apply first debuff
    if (DOT_IDS.has(id) && !targetClean) sc -= 3;   // don't stack same DoT twice
    if (id === 'desperate_rush') sc += 14;           // only fires when low HP
    if (id === 'black_unction') sc += 16;            // the dead are a resource; spend them
    if (A.target === 'self') sc += 5;
    candidates.push({ id, sc });
  }
  candidates.sort((a, b) => b.sc - a.sc);
  if (candidates.length) {
    const { id } = candidates[0];
    const A = ABILITIES[id];
    resolveAbility(s, u, id, A.target === 'self' ? u.uid : A.target === 'none' ? null : target.uid);
    return;
  }
  // Fallback: last ability in list
  const lastId = u.abilities[u.abilities.length - 1];
  const lastA = ABILITIES[lastId];
  if (!u.boss && lastA && (lastA.target === 'enemy' || lastA.target === 'party') && !inReach(s, u, target, lastId)) return;
  resolveAbility(s, u, lastId, lastA && lastA.target === 'self' ? u.uid : lastA && lastA.target === 'none' ? null : target.uid);
}

// ── Public API ──────────────────────────────────────────────

export function createCombat(g) {
  const isSkirmish = g.encounterId === 'skirmish';
  const skirmCfg = g.skirmishConfig;
  const enc = isSkirmish
    ? (skirmCfg?.fakeEnc || { name: 'Skirmish', enemies: [], gold: 30, xp: 50 })
    : ENCOUNTERS[g.encounterId];
  const diff = DIFFICULTIES[g.difficulty || 'merciless'] || DIFFICULTIES.merciless;
  const units = [];
  const partyKeys = [
    ...BASE_PARTY,
    ...(g.flags?.chan_joined ? ['chan'] : []),
    ...(g.flags?.chibi_joined ? ['chibi'] : []),
  ];
  for (const key of partyKeys) {
    const b = PARTY[key];
    const legacyMods = deriveMods(g.sins?.[key]);
    const treeMods = progressionMods(g, key);
    const mods = { ...legacyMods };
    for (const [mod, value] of Object.entries(treeMods)) {
      mods[mod] = typeof value === 'number' ? (mods[mod] || 0) + value : value;
    }
    const u = mkUnit(b, 'party', key, mods);
    const treeAbilities = progressionAbilities(g, key);
    if (treeAbilities.length) u.abilities = treeAbilities;
    else u.abilities = u.abilities.filter((id) => abilityUnlocked(id, g.sins)).slice(0, 4);
    u.ascended = (g.talents?.[key]?.length || 0) >= 3;
    if (key === 'veato') {
      u.specialization = specializationFor(g, key) || g.flags?.veato_specialization || null;
      if (u.specialization === 'nether_archer') {
        u.epithet = 'Nether Archer';
        u.artVariant = 'ascended';
      } else if (u.specialization === 'jaguar_knife') {
        u.epithet = 'Jaguar Knife';
        u.artVariant = 'jaguar';
      } else {
        u.artVariant = false;
      }
    }
    if (key === 'sjen' && g.flags?.sjen_specialization === 'hex_master') {
      u.epithet = 'Hex Master';
      u.atk += 2;
      u.mods.hexPower = (u.mods.hexPower || 0) + 3;
      if (!u.abilities.includes('crown_hex') && u.abilities.length < 4) u.abilities.push('crown_hex');
    }
    if (key === 'sjen' && g.flags?.sjen_specialization === 'invoker') {
      u.epithet = 'Partial Demon Invoker';
      u.atk += 5;
      u.maxHp += 10;
      u.mods.hexPower = (u.mods.hexPower || 0) + 1;
      if (!u.abilities.includes('demon_invocation') && u.abilities.length < 4) u.abilities.push('demon_invocation');
    }
    u.atk += mods.atk + Math.floor((g.corruption || 0) / 25) * mods.corrAtk;
    u.maxHp += mods.maxHp;
    u.speed += mods.speed || 0;
    if (u.side === 'party' && key !== 'wretch') {
      u.atk += Math.floor(Math.max(0, (g.level || 1) - 1) / 2);
      u.maxHp += Math.max(0, (g.level || 1) - 1) * 6;
    }
    if (key === 'lucian') {
      for (const sc of g.scars) {
        u.maxHp += sc.hp || 0;
        u.atk += sc.atk || 0;
        u.speed += sc.speed || 0;
      }
      for (const it of g.inventory) {
        u.atk += it.atk || 0;
        u.maxHp += it.hp || 0;
      }
      u.maxHp = Math.max(40, u.maxHp);
    }
    u.atk = Math.max(4, Math.round(u.atk * diff.partyAtk));
    u.maxHp = Math.max(24, Math.round(u.maxHp * diff.partyHp));
    u.hp = u.maxHp;
    units.push(u);
  }
  for (const ek of enc.enemies) {
    if (!ENEMIES[ek]) continue;
    const e = mkUnit(ENEMIES[ek], 'enemy', ek);
    const scaled = scaleEnemyTemplate(ENEMIES[ek], diff);
    e.atk = scaled.atk;
    e.maxHp = scaled.maxHp;
    e.hp = e.maxHp;
    units.push(e);
  }

  // Apply skirmish card and enemy omen modifiers.
  if (isSkirmish && skirmCfg) {
    const partyUnits = units.filter((u) => u.side === 'party');
    const enemyUnits = units.filter((u) => u.side === 'enemy');
    const cardId = skirmCfg.pickedCard;
    if (cardId) {
      for (const u of partyUnits) {
        if (cardId === 'iron_fist') u.atk = Math.round(u.atk * 1.18);
        else if (cardId === 'borrowed_time') { u.hp = Math.round(u.maxHp * 0.7); u.atk = Math.round(u.atk * 1.22); }
        else if (cardId === 'lucky_break') { u.maxHp = Math.round(u.maxHp * 1.2); u.hp = u.maxHp; }
        else if (cardId === 'cold_contract') u.speed = Math.max(4, u.speed - 1);
        else if (cardId === 'the_long_march') u.speed = Math.max(4, u.speed - 2);
        else if (cardId === 'dead_skin') { u.atk = Math.round(u.atk * 0.88); u.statuses.push({ type: 'shield', turns: 99, power: 12 }); }
        else if (cardId === 'doomed_bargain') u.atk = Math.round(u.atk * 1.25);
        else if (cardId === 'iron_shackle') u.speed = Math.max(3, u.speed - 2);
        else if (cardId === 'tainted_rations') u.statuses.push({ type: 'poison', turns: 2, power: 4 });
        else if (cardId === 'bitter_loss') u.atk = Math.round(u.atk * 0.80);
      }
      if (cardId === 'hex_blooded') {
        for (const u of partyUnits.filter((p) => p.key === 'sjen' || p.key === 'chibi')) {
          u.statuses.push({ type: 'might', turns: 2 });
          u.statuses.push({ type: 'focus', turns: 2 });
        }
      }
      for (const e of enemyUnits) {
        if (cardId === 'hollow_rite') e.statuses.push({ type: 'curse', turns: 2, power: 7 });
        else if (cardId === 'blind_terror') e.statuses.push({ type: 'fear', turns: 1 });
        else if (cardId === 'doomed_bargain') e.atk = Math.round(e.atk * 1.15);
        else if (cardId === 'the_long_march') e.speed = Math.max(4, e.speed - 3);
      }
    }
    if (skirmCfg.omen) {
      const omenId = skirmCfg.omen.id;
      for (const e of enemyUnits) {
        if (omenId === 'frenzy') e.atk = Math.round(e.atk * 1.20);
        else if (omenId === 'ironbones') { e.maxHp = Math.round(e.maxHp * 1.25); e.hp = e.maxHp; }
        else if (omenId === 'driven') e.speed += 3;
        else if (omenId === 'hollow_touched' && e.transformInto) {
          e.transformTimer = 1;
          const asc = e.statuses.find((st) => st.type === 'ascension');
          if (asc) asc.power = 1;
        } else if (omenId === 'fevered') {
          e.statuses.push({ type: 'might', turns: 1 });
        } else if (omenId === 'blessed') {
          e.statuses.push({ type: 'shield', turns: 99, power: 12 });
        } else if (omenId === 'starved') {
          e.atk = Math.round(e.atk * 0.80);
        } else if (omenId === 'hollow_bones') {
          e.maxHp = Math.round(e.maxHp * 0.80); e.hp = e.maxHp;
        } else if (omenId === 'lethargic') {
          e.speed = Math.max(2, e.speed - 2);
        }
      }
    }
  }

  const s = {
    encounterId: isSkirmish ? (skirmCfg?.fieldId || 'ash_road_ambush') : g.encounterId,
    name: enc.name,
    rewardGold: (isSkirmish && skirmCfg?.pickedCard === 'cold_contract') ? Math.round((enc.gold || 0) * 1.5) : (enc.gold || 0),
    rewardXp: enc.xp || 0,
    units,
    round: 0,
    queue: [],
    turnIdx: -1,
    log: [],
    events: [],
    castAbility: null,
    over: null,
    skim: 0,
    bonusGold: 0,
    bonusXp: 0,
    lootItem: null,
    preventedAscensions: 0,
    ascensions: 0,
    partyLosses: 0,
    hadAscensionThreat: false,
    cocoliObjective: false,
    cocoliBargainUsed: false,
    cocoliBargain: null,
    cocoliDebtsDelta: 0,
    auto: null,
    moved: false,
    betrayed: {},
    tension: { ...g.tension },
    tensionDelta: {},
    corruptionDelta: 0,
    poultices: diff.poultices,
    diff,
    sins: g.sins || {},
    bossPhase2: false,
    finalLedgerWarned: false,
    finalLedgerSpent: false,
    finalLedgerTarget: null,
    enemyFury: 0,
  };
  assignBattlefield(s, enc);
  s.hadAscensionThreat = s.units.some((x) => x.side === 'enemy' && x.transformInto);
  log(s, enc.opener || `${enc.name}. The ledger opens.`, 'round');
  if (s.field?.rules?.length) log(s, `Terrain: ${s.field.rules.join(' ')}`, 'dim');
  if (diff.id === 'merciless') log(s, 'Merciless ledger: skills are scarce, healing is mean, and Cocoli is listening.', 'death');
  if ((g.level || 1) === 1) log(s, 'Unproven company: each fighter knows only two defining actions. Survive long enough to specialize.', 'gold');
  if (s.poultices > 0) log(s, `Black Poultice x${s.poultices}: tar, old blood, and something still alive.`, 'dim');
  if (g.flags?.cocoli_vengeance) {
    const luc = byKey(s, 'lucian');
    if (luc) {
      addStatus(s, luc, 'might', 2);
      addStatus(s, luc, 'focus', 2);
      log(s, 'Cocoli returned Lucian with teeth in his shadow. Might and Focus cling to him.', 'hex');
    }
    for (const e of s.units.filter((x) => x.side === 'enemy')) addStatus(s, e, 'fear', 1);
  }
  for (const e of s.units.filter((x) => x.alive && x.side === 'enemy' && x.transformInto)) {
    log(s, `${e.name} carries dead doctrine in its ribs. Kill it before Ascension reaches zero.`, 'hex');
  }
  if (g.scars.some((x) => x.id === 'grave_light')) {
    for (const e of s.units.filter((x) => x.side === 'enemy')) addStatus(s, e, 'fear', 2);
    log(s, 'Grave-Light Eyes — the enemy flinch from something behind Lucian’s gaze.', 'hex');
  }
  return advance_(s);
}

export function currentUnit(s) {
  if (s.over) return null;
  return getUnit(s, s.queue[s.turnIdx]) || null;
}

export function playerAct(state, abilityId, targetUid) {
  const s = structuredClone(state);
  const u = getUnit(s, s.queue[s.turnIdx]);
  if (!u || !u.alive || s.over) return s;
  // Range gate: positional abilities require their target within reach.
  const A = ABILITIES[abilityId];
  if (A && (A.target === 'enemy' || A.target === 'party')) {
    const t = getUnit(s, targetUid);
    if (!t || !t.alive || !inReach(s, u, t, abilityId)) return s;
  }
  resolveAbility(s, u, abilityId, targetUid);
  endTurn(s, u);
  return advance_(s);
}

// Tiles the current player unit may still step to this turn ([] if none).
export function reachableFor(state) {
  const u = currentUnit(state);
  if (!u || state.over || state.auto || u.side !== 'party' || state.moved) return [];
  const tiles = reachableTiles(state, u);
  if (!u.tile) return tiles;
  // Annotate each tile with whether stepping there draws an opportunity attack
  // — same rule moveUnit enforces, so the warning can never drift from reality.
  const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
  const threats = state.units.filter(
    (x) =>
      x.alive &&
      x.side !== u.side &&
      x.tile &&
      meleeThreat(x) &&
      !hasStatus(x, 'stun') &&
      !hasStatus(x, 'psychosis') &&
      cheb(x.tile.x, x.tile.y, u.tile.x, u.tile.y) === 1
  );
  return tiles.map((t) => ({
    ...t,
    provokes: threats.some((x) => cheb(x.tile.x, x.tile.y, t.x, t.y) > 1),
  }));
}

// Move the current player unit onto (x, y) if legal. Does NOT end the turn —
// the unit may still act afterward.
export function playerMove(state, x, y) {
  const s = structuredClone(state);
  const u = currentUnit(s);
  if (!u || s.over || s.auto || u.side !== 'party' || s.moved) return s;
  if (!reachableTiles(s, u).some((t) => t.x === x && t.y === y)) return s;
  s.moved = true;
  moveUnit(s, u, { x, y }); // may provoke opportunity attacks from adjacent enemies
  return s;
}

// UI helper: can the current actor hit `target` with `abilityId` from where
// it stands right now?
export function attackReachable(state, abilityId, target) {
  const u = currentUnit(state);
  if (!u || !target) return false;
  return inReach(state, u, target, abilityId);
}

export function usePoultice(state, targetUid) {
  const s = structuredClone(state);
  const u = getUnit(s, s.queue[s.turnIdx]);
  const target = getUnit(s, targetUid);
  if (!u || !u.alive || s.over || s.auto || u.side !== 'party' || !target || target.side !== 'party' || !target.alive) return s;
  if (s.poultices <= 0) return s;
  s.poultices -= 1;
  const heal = Math.max(1, Math.round(target.maxHp * 0.3));
  target.hp = Math.min(target.maxHp, target.hp + heal);
  s.corruptionDelta += 2;
  log(s, `Black Poultice — ${target.name} heals ${heal}. It smells of tar, old blood, and something still alive. +2 corruption.`, 'hex');
  evt(s, { k: 'float', unit: target.uid, text: `+${heal}`, type: 'heal' });
  endTurn(s, u);
  return advance_(s);
}

export function cocoliBargain(state, kind) {
  const s = structuredClone(state);
  if (s.over || s.auto || s.cocoliBargainUsed) return s;
  const party = alive(s, 'party');
  const enemies = alive(s, 'enemy');
  if (!party.length) return s;
  s.cocoliBargainUsed = true;
  s.cocoliBargain = kind;
  s.cocoliDebtsDelta = (s.cocoliDebtsDelta || 0) + 1;
  const luc = byKey(s, 'lucian') || party[0];

  if (kind === 'mercy') {
    for (const p of party) {
      const heal = Math.max(1, Math.round(p.maxHp * 0.28));
      p.hp = Math.min(p.maxHp, p.hp + heal);
      evt(s, { k: 'float', unit: p.uid, text: `+${heal}`, type: 'heal' });
    }
    s.corruptionDelta += 6;
    bumpTension(s, 'lucian_sjen', 3);
    bumpTension(s, 'lucian_veato', 3);
    log(s, 'Cocoli’s Mercy — every ally is pulled a little farther from death. Nobody believes it was kindness. +6 corruption.', 'hex');
  } else if (kind === 'teeth') {
    for (const e of enemies) {
      const bite = Math.max(8, Math.round(e.maxHp * 0.22));
      e.hp -= bite;
      log(s, `Cocoli’s Teeth close inside ${e.name}. ${bite} damage.`, 'blood');
      evt(s, { k: 'hit', unit: e.uid, amount: bite, vicious: true, ability: 'cocoli_teeth' });
      if (e.hp <= 0) kill(s, e, luc);
      else addStatus(s, e, 'fear', 2);
    }
    s.corruptionDelta += 8;
    log(s, 'Cocoli does not strike from above. She strikes from where mercy used to be. +8 corruption.', 'death');
  } else {
    for (const p of party) {
      p.cooldowns = {};
      addStatus(s, p, 'focus', 2);
    }
    s.corruptionDelta += 5;
    bumpTension(s, 'lucian_sjen', 5);
    bumpTension(s, 'lucian_veato', 5);
    log(s, 'Cocoli’s Still Hour — cooldowns vanish and the company moves inside a stolen second. +5 corruption.', 'hex');
  }

  evt(s, { k: 'summon', unit: luc.uid });
  checkEnd(s);
  return s;
}

export function autoAct(state) {
  const s = structuredClone(state);
  const u = getUnit(s, s.queue[s.turnIdx]);
  if (!u || !u.alive || s.over) return s;
  if (s.auto === 'enemy') {
    enemyAI(s, u);
    if (!s.over && u.alive && s.enemyFury > 0 && Math.random() < 0.45) {
      s.enemyFury -= 1;
      log(s, `${u.name} punishes the hesitation and attacks again.`, 'blood');
      enemyAI(s, u);
    }
  } else if (s.auto === 'wretch') {
    const foes = alive(s, 'enemy');
    const t = foes.sort((a, b) => tdist(u, a) - tdist(u, b))[0];
    if (t) {
      if (!inReach(s, u, t, 'gnaw') && t.tile && u.tile) {
        const dest = stepToward(s, u, t.tile, moveBudget(u));
        if (dest) moveUnit(s, u, dest);
      }
      if (inReach(s, u, t, 'gnaw')) resolveAbility(s, u, 'gnaw', t.uid);
    }
  } else {
    // Sabotage: they lash out on their own terms — and at high tension,
    // "accidents" happen to whoever stands too close.
    const others = alive(s, 'party').filter((p) => p.uid !== u.uid);
    if (others.length && Math.random() < 0.25) {
      const victim = pick(others);
      const veatoAbility = u.specialization === 'jaguar_knife' ? 'poison_blade' : 'bow_shot';
      s.castAbility = u.key === 'veato' ? veatoAbility : 'rot_hex';
      evt(s, { k: 'cast', actor: u.uid, ability: s.castAbility, target: victim.uid });
      hit(s, u, victim, 0.5, 'A Stray Blade');
      s.castAbility = null;
      log(s, `“An accident,” ${u.name} says, not quite quickly enough.`, 'blood');
      evt(s, { k: 'bubble', unit: u.uid, text: '“An accident.”' });
      if (victim.key === 'lucian') bumpTension(s, u.key === 'sjen' ? 'lucian_sjen' : 'lucian_veato', 2);
    } else {
      const t = pick(alive(s, 'enemy'));
      if (t) {
        const veatoAbility = u.specialization === 'jaguar_knife' ? 'poison_blade' : 'bow_shot';
        resolveAbility(s, u, u.key === 'veato' ? veatoAbility : 'rot_hex', t.uid);
      }
    }
  }
  endTurn(s, u);
  return advance_(s);
}
