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
  mo_bos_ie_eye: { name: 'Mo bos ie EYE!', cd: 6, target: 'enemy', desc: 'Ultimate: Sjenke turns his fist into titanium demon fire and crushes eyes and skull. If the target dies, all other enemies enter Psychosis and lose 1 turn.' },
  // Veato
  backstab: { name: 'Backstab', cd: 2, target: 'enemy', desc: '260% damage to afflicted prey; 130% otherwise. Deceit cuts deeper.' },
  poison_blade: { name: 'Poison Blade', cd: 0, target: 'enemy', desc: '90% damage plus poison each turn. Cunning brews it stronger.' },
  smoke_step: { name: 'Smoke Step', cd: 3, target: 'self', desc: 'The next blow aimed at Veato finds only smoke.' },
  crippling_cut: { name: 'Crippling Cut', cd: 2, target: 'enemy', desc: '80% damage; the target bleeds and deals 30% less. Wrath opens the wound wider.' },
  // Chan
  ledgers_cut: { name: "Ledger's Cut", cd: 1, target: 'enemy', desc: 'Mark and bleed an enemy. Chan invoices the corpse later.' },
  bitter_appraisal: { name: 'Bitter Appraisal', cd: 2, target: 'enemy', desc: 'Insult an enemy into Fear and Cripple. Accuracy through contempt.' },
  paid_in_advance: { name: 'Paid in Advance', cd: 3, target: 'ally', desc: 'Shield an ally, then charge the company gold and tension.' },
  // Chibi
  spite_hex: { name: 'Spite Hex', cd: 0, target: 'enemy', desc: 'Rot damage that bites harder when Sjen is still standing.' },
  needlework: { name: 'Needlework', cd: 2, target: 'enemy', desc: 'A small precise cut. Bleeds, poisons, and embarrasses larger targets.' },
  duo_rite: { name: 'Duo Rite', cd: 3, target: 'none', desc: 'Chibi and Sjen feed the same ugly thought. Enemies rot; everyone else feels unwelcome.' },
  // Enemies
  claw: { name: 'Desperate Claw', cd: 0, target: 'party' },
  rusted_blade: { name: 'Rusted Blade', cd: 0, target: 'party' },
  desperate_rush: { name: 'Desperate Rush', cd: 3, target: 'party' },
  plague_bite: { name: 'Plague Bite', cd: 2, target: 'party' },
  rotten_guard: { name: 'Rotten Guard', cd: 3, target: 'self' },
  heavy_blow: { name: 'Heavy Blow', cd: 0, target: 'party' },
  chain_lash: { name: 'Chain Lash', cd: 2, target: 'party' },
  debt_mark: { name: 'Debt Mark', cd: 2, target: 'party' },
  collection_swing: { name: 'Collection Swing', cd: 1, target: 'party' },
  chain_tax: { name: 'Chain Tax', cd: 3, target: 'none' },
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

let uidCounter = 0;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const roll = (base) => Math.max(1, Math.round(base * (0.9 + Math.random() * 0.2)));

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
  const ex = getStatus(u, type);
  if (ex) {
    ex.turns = Math.max(ex.turns, turns);
    ex.power = Math.max(ex.power, power);
  } else {
    u.statuses.push({ type, turns, power });
  }
  evt(s, { k: 'status', unit: u.uid, status: type });
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
  log(s, u.boss ? `${u.name} collapses — chains, clauses, and all.` : `${u.name} dies.`, 'death');
  evt(s, { k: 'death', unit: u.uid, boss: u.boss });
  if (u.side === 'enemy') {
    const luc = byKey(s, 'lucian');
    if (luc && abilityUnlocked('feast_on_fear', s.sins)) {
      const heal = Math.min(12 + (luc.mods.feastBonus || 0), luc.maxHp - luc.hp);
      if (heal > 0) {
        luc.hp += heal;
        log(s, `Feast on Fear — Lucian drinks the dying moment. +${heal} HP.`, 'gold');
        evt(s, { k: 'float', unit: luc.uid, text: `+${heal}`, type: 'heal' });
      }
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

function hiddenKnife(s, target) {
  if (!target || !target.alive) return;
  const v = byKey(s, 'veato');
  if (v && abilityUnlocked('hidden_knife', s.sins) && !hasStatus(v, 'stun') && Math.random() < 0.35) {
    log(s, 'Hidden Knife — Veato strikes from Lucian’s shadow. His opportunism, for once, is on the right side.', 'dim');
    const prev = s.castAbility;
    s.castAbility = 'hidden_knife';
    evt(s, { k: 'cast', actor: v.uid, ability: 'hidden_knife', target: target.uid });
    hit(s, v, target, 0.6, 'Hidden Knife');
    s.castAbility = prev;
  }
}

function resolveAbility(s, u, id, targetUid) {
  const A = ABILITIES[id];
  const t = targetUid ? getUnit(s, targetUid) : null;
  const m = u.mods || {};
  if ((A.cd || 0) > 0) u.cooldowns[id] = Math.max(1, A.cd - (m.cdr || 0));
  s.castAbility = id;
  evt(s, { k: 'cast', actor: u.uid, ability: id, target: t?.uid });

  switch (id) {
    case 'basic_attack':
      hit(s, u, t, 1.0, 'Basic Attack');
      if (u.key === 'lucian') hiddenKnife(s, t);
      break;
    case 'wait_power':
      addStatus(s, u, 'focus', 2);
      addStatus(s, u, 'might', 1);
      s.enemyFury = (s.enemyFury || 0) + 1;
      log(s, `${u.name} waits, gathering power. The enemy sees the hesitation.`, 'gold');
      evt(s, { k: 'float', unit: u.uid, text: 'Focus', type: 'word' });
      break;
    case 'cleave':
      hit(s, u, t, 1.2, 'Cleave');
      hiddenKnife(s, t);
      break;
    case 'execute': {
      const low = t.hp < t.maxHp * 0.35;
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
      hiddenKnife(s, t);
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
      addStatus(s, t, 'shield', 99, 24);
      log(s, `Cursed bone closes over ${t.name}. (24 shield)`, 'hex');
      break;
    case 'debt_of_flesh': {
      const donors = alive(s, 'party').filter((a) => a.uid !== u.uid && a.key !== 'wretch');
      const donor = donors.sort((a, b) => b.hp - a.hp)[0] || u;
      donor.hp = Math.max(1, donor.hp - 12);
      log(s, `Sjen opens a vein in ${donor.name}’s arm without asking. −12 HP.`, 'hurt');
      evt(s, { k: 'float', unit: donor.uid, text: '−12', type: 'drain' });
      if (donor.key === 'lucian') {
        bumpTension(s, 'lucian_sjen', 3);
        evt(s, { k: 'bubble', unit: donor.uid, text: '“Touch my blood again and I’ll take your hands.”' });
        log(s, 'Lucian: “Touch my blood again and I’ll take your hands.”', 'blood');
      }
      if (donor.key === 'veato') bumpTension(s, 'sjen_veato', 3);
      hit(s, u, t, 2.4, 'Debt of Flesh');
      break;
    }
    case 'summon_wretch': {
      const w = mkUnit(
        { name: 'The Wretch', sigil: '✣', sprite: 'wretch', color: 'var(--hex)', hp: 26, atk: 4, speed: 5, abilities: ['gnaw'] },
        'party',
        'wretch'
      );
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
      log(s, 'Sjenke: “Mo bos ie EYE!” His fist becomes titanium demon fire. The air forgets how to be air.', 'death');
      evt(s, { k: 'bubble', unit: u.uid, text: '“Mo bos ie EYE!”' });
      hit(s, u, t, 4.2 + (m.hexPower || 0) * 0.04, 'Mo bos ie EYE!');
      if (wasAlive && t && !t.alive) {
        const witnesses = alive(s, 'enemy');
        if (witnesses.length) {
          log(s, `The skull gives way. The eye does not. Every surviving enemy sees it anyway. Psychosis takes them.`, 'hex');
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
    case 'backstab': {
      const weakened = t.statuses.some((x) => DEBUFFS.includes(x.type));
      hit(s, u, t, weakened ? 2.6 + (m.backstabBonus || 0) : 1.3, weakened ? 'Backstab' : 'Backstab (unweakened prey)');
      break;
    }
    case 'poison_blade':
      hit(s, u, t, 0.9, 'Poison Blade');
      if (t.alive) {
        addStatus(s, t, 'poison', 3, 6 + (m.hexPower || 0));
        log(s, `The poison settles into ${t.name}’s blood.`, 'hex');
      }
      break;
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
    case 'ledgers_cut':
      hit(s, u, t, 1.05, "Ledger's Cut");
      if (t.alive) {
        addStatus(s, t, 'marked', 2);
        addStatus(s, t, 'bleed', 2, 5);
        log(s, `Chan marks ${t.name} as a depreciating asset.`, 'gold');
      }
      break;
    case 'bitter_appraisal':
      hit(s, u, t, 0.55, 'Bitter Appraisal');
      if (t.alive) {
        addStatus(s, t, 'fear', 2);
        addStatus(s, t, 'cripple', 2);
        log(s, `Chan explains exactly why ${t.name} is overvalued. It hurts because he is right.`, 'dim');
      }
      break;
    case 'paid_in_advance':
      addStatus(s, t, 'shield', 99, 18);
      s.skim += 8;
      bumpTension(s, 'lucian_veato', 2);
      bumpTension(s, 'sjen_veato', 1);
      log(s, `Chan protects ${t.name}. The invoice arrives before the gratitude.`, 'gold');
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
          enemy.transformTimer -= 1;
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

    // Damage over time ticks at the start of the unit's turn.
    let died = false;
    for (const st of u.statuses) {
      if (DOTS[st.type]) {
        let dmg = st.power;
        if (st.type !== 'bleed') dmg = Math.max(1, dmg - (u.mods?.dotResist || 0));
        u.hp -= dmg;
        log(s, `${u.name} suffers ${dmg} ${DOTS[st.type]}.`, 'hurt');
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
      if (p.hp <= Math.max(12, u.atk * 1.8)) score += 6;
      if (p.hp < p.maxHp * 0.4) score += 4;
      if (hasStatus(p, 'marked')) score += 5;
      if (hasStatus(p, 'poison') || hasStatus(p, 'bleed') || hasStatus(p, 'fear')) score += 2;
      if (hasStatus(p, 'might')) score += 3;
      if (p.key === 'sjen' || p.key === 'veato') score += 1;
      if (p.key === 'lucian' && p.hp > p.maxHp * 0.6) score += 2;
      return { p, score: score + Math.random() * 2 };
    })
    .sort((a, b) => b.score - a.score);
  let target = scored[0]?.p || wretch || pick(party);

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

  for (const id of u.abilities) {
    const A = ABILITIES[id];
    if ((u.cooldowns[id] || 0) > 0) continue;
    if (id === 'desperate_rush' && u.hp > u.maxHp * 0.4) continue;
    if (id === 'rotten_guard' && hasStatus(u, 'rotten_guard')) continue;
    if (id === 'collection_swing' && !party.some((p) => hasStatus(p, 'marked'))) continue;
    if (id === 'debt_mark' && party.some((p) => hasStatus(p, 'marked'))) continue;
    if (id === 'chain_tax' && !u.boss && party.length < 2) continue;
    resolveAbility(s, u, id, A.target === 'self' ? u.uid : A.target === 'none' ? null : target.uid);
    return;
  }
  resolveAbility(s, u, u.abilities[u.abilities.length - 1], target.uid);
}

// ── Public API ──────────────────────────────────────────────

export function createCombat(g) {
  const enc = ENCOUNTERS[g.encounterId];
  const diff = DIFFICULTIES[g.difficulty || 'merciless'] || DIFFICULTIES.merciless;
  const units = [];
  const partyKeys = [
    ...BASE_PARTY,
    ...(g.flags?.chan_joined ? ['chan'] : []),
    ...(g.flags?.chibi_joined ? ['chibi'] : []),
  ];
  for (const key of partyKeys) {
    const b = PARTY[key];
    const mods = deriveMods(g.sins?.[key]);
    const u = mkUnit(b, 'party', key, mods);
    u.abilities = u.abilities.filter((id) => abilityUnlocked(id, g.sins));
    u.atk += mods.atk + Math.floor((g.corruption || 0) / 25) * mods.corrAtk;
    u.maxHp += mods.maxHp;
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
    const e = mkUnit(ENEMIES[ek], 'enemy', ek);
    const scaled = scaleEnemyTemplate(ENEMIES[ek], diff);
    e.atk = scaled.atk;
    e.maxHp = scaled.maxHp;
    e.hp = e.maxHp;
    units.push(e);
  }

  const s = {
    encounterId: g.encounterId,
    name: enc.name,
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
  s.hadAscensionThreat = s.units.some((x) => x.side === 'enemy' && x.transformInto);
  log(s, enc.opener || `${enc.name}. The ledger opens.`, 'round');
  if (diff.id === 'merciless') log(s, 'Merciless ledger: skills are scarce, healing is mean, and Cocoli is listening.', 'death');
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
  resolveAbility(s, u, abilityId, targetUid);
  endTurn(s, u);
  return advance_(s);
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
    const t = pick(alive(s, 'enemy'));
    if (t) resolveAbility(s, u, 'gnaw', t.uid);
  } else {
    // Sabotage: they lash out on their own terms — and at high tension,
    // "accidents" happen to whoever stands too close.
    const others = alive(s, 'party').filter((p) => p.uid !== u.uid);
    if (others.length && Math.random() < 0.25) {
      const victim = pick(others);
      s.castAbility = u.key === 'veato' ? 'poison_blade' : 'rot_hex';
      evt(s, { k: 'cast', actor: u.uid, ability: s.castAbility, target: victim.uid });
      hit(s, u, victim, 0.5, 'A Stray Blade');
      s.castAbility = null;
      log(s, `“An accident,” ${u.name} says, not quite quickly enough.`, 'blood');
      evt(s, { k: 'bubble', unit: u.uid, text: '“An accident.”' });
      if (victim.key === 'lucian') bumpTension(s, u.key === 'sjen' ? 'lucian_sjen' : 'lucian_veato', 2);
    } else {
      const t = pick(alive(s, 'enemy'));
      if (t) resolveAbility(s, u, u.key === 'veato' ? 'poison_blade' : 'rot_hex', t.uid);
    }
  }
  endTurn(s, u);
  return advance_(s);
}
