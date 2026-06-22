const node = (id, branch, tier, name, desc, reward, extra = {}) => ({
  id,
  branch,
  tier,
  name,
  desc,
  reward,
  ...extra,
});

export const PROGRESSION = {
  lucian: {
    roots: ['lucian_tyrant', 'lucian_butcher'],
    nodes: [
      node('lucian_tyrant', 'tyrant', 1, 'The Dread Captain', 'Control the field through fear and command.', 'Unlock Tyrant’s Grip.', {
        ability: 'tyrants_grip',
        mods: { maxHp: 8 },
      }),
      node('lucian_butcher', 'butcher', 1, 'The Carrion Butcher', 'Turn wounded enemies into momentum and meat.', 'Unlock Execute.', {
        ability: 'execute',
        mods: { atk: 2 },
      }),
      node('lucian_black_order', 'tyrant', 2, 'Black Order', 'His command hurts, but the company obeys.', 'Unlock Blood Command.', {
        ability: 'blood_command',
        requires: ['lucian_tyrant'],
      }),
      node('lucian_iron_presence', 'tyrant', 2, 'Iron Presence', 'Enemies struggle to act beneath his attention.', '+12 max HP and stronger fear.', {
        requires: ['lucian_tyrant'],
        mods: { maxHp: 12, gripBonus: 1, onHitFear: 0.1 },
      }),
      node('lucian_red_momentum', 'butcher', 2, 'Red Momentum', 'A kill makes the next victim easier.', 'Kills grant Might; Cleave hits harder.', {
        requires: ['lucian_butcher'],
        mods: { killMomentum: true, cleaveBonus: 0.25 },
      }),
      node('lucian_executioner', 'butcher', 2, 'Executioner’s Measure', 'He learns exactly how much life remains.', 'Execute threshold rises to 45%.', {
        requires: ['lucian_butcher'],
        mods: { executeThreshold: 0.45, executeBonus: 0.45 },
      }),
      node('lucian_dread_capstone', 'tyrant', 3, 'Sovereign of Dread', 'The battlefield becomes a room in which only Lucian may speak.', 'Tyrant’s Grip terrifies nearby enemies.', {
        requiresAny: ['lucian_black_order', 'lucian_iron_presence'],
        mods: { dreadSovereign: true, atk: 2 },
      }),
      node('lucian_butcher_capstone', 'butcher', 3, 'Feast on the Fallen', 'Every death feeds the body that caused it.', 'Kills heal 18 HP and reset Cleave.', {
        requiresAny: ['lucian_red_momentum', 'lucian_executioner'],
        mods: { feastHeal: 18, butcherReset: true },
      }),
    ],
  },
  sjen: {
    roots: ['sjen_hexwright', 'sjen_flesh_pact'],
    nodes: [
      node('sjen_hexwright', 'hexwright', 1, 'The Hexwright', 'Build curses that control rather than merely wound.', 'Unlock Bone Ward.', {
        ability: 'bone_ward',
        mods: { hexPower: 2 },
      }),
      node('sjen_flesh_pact', 'flesh_pact', 1, 'The Flesh Pact', 'Spend bodies, blood, and trust for immediate power.', 'Unlock Debt of Flesh.', {
        ability: 'debt_of_flesh',
        mods: { atk: 2 },
      }),
      node('sjen_crown_script', 'hexwright', 2, 'Crown Script', 'A curse learns to travel between frightened minds.', 'Unlock Crown Hex.', {
        ability: 'crown_hex',
        requires: ['sjen_hexwright'],
      }),
      node('sjen_grave_geometry', 'hexwright', 2, 'Grave Geometry', 'His wards become architecture.', 'Bone Ward gains +14 shield; rot bites deeper.', {
        requires: ['sjen_hexwright'],
        mods: { wardBonus: 14, hexPower: 2 },
      }),
      node('sjen_wretch_contract', 'flesh_pact', 2, 'Wretch Contract', 'Something small agrees to die first.', 'Unlock Summon Wretch.', {
        ability: 'summon_wretch',
        requires: ['sjen_flesh_pact'],
      }),
      node('sjen_open_vein', 'flesh_pact', 2, 'Open Vein Doctrine', 'Borrowed blood becomes efficient.', 'Debt of Flesh drains less and strikes harder.', {
        requires: ['sjen_flesh_pact'],
        mods: { fleshDrain: -4, fleshBonus: 0.45 },
      }),
      node('sjen_hex_capstone', 'hexwright', 3, 'Mo bos ie EYE!', 'The lesson ends in titanium demon fire.', 'Unlock Sjen’s ultimate.', {
        ability: 'mo_bos_ie_eye',
        requiresAny: ['sjen_crown_script', 'sjen_grave_geometry'],
      }),
      node('sjen_pact_capstone', 'flesh_pact', 3, 'Partial Invocation', 'He lets the thing beneath his skin answer.', 'Unlock Demon Invocation.', {
        ability: 'demon_invocation',
        requiresAny: ['sjen_wretch_contract', 'sjen_open_vein'],
      }),
    ],
  },
  veato: {
    roots: ['veato_nether_archer', 'veato_jaguar_knife'],
    nodes: [
      node('veato_nether_archer', 'nether_archer', 1, 'Nether Archer', 'Own the battlefield from beyond retaliation.', 'Unlock Marked Quarry and the Nether path.', {
        ability: 'marked_quarry',
        specialization: 'nether_archer',
        mods: { atk: 1 },
      }),
      node('veato_jaguar_knife', 'jaguar_knife', 1, 'Jaguar Knife', 'Trade distance for speed, blood, and certainty.', 'Switch to dual daggers and unlock Backstab.', {
        ability: 'backstab',
        specialization: 'jaguar_knife',
        mods: { speed: 2 },
      }),
      node('veato_pinning_line', 'nether_archer', 2, 'Pinning Line', 'Control the route enemies hoped to use.', 'Unlock Pinning Shot.', {
        ability: 'pinning_shot',
        requires: ['veato_nether_archer'],
      }),
      node('veato_smoke_sight', 'nether_archer', 2, 'Sight Through Smoke', 'He vanishes without surrendering the shot.', 'Unlock Smoke Step; +1 bow range.', {
        ability: 'smoke_step',
        requires: ['veato_nether_archer'],
        mods: { bowRange: 1 },
      }),
      node('veato_tendon_price', 'jaguar_knife', 2, 'The Price of Tendons', 'Mobility is removed before life.', 'Unlock Crippling Cut.', {
        ability: 'crippling_cut',
        requires: ['veato_jaguar_knife'],
      }),
      node('veato_smoke_pounce', 'jaguar_knife', 2, 'Smoke Prowler', 'The gap between seen and struck disappears.', 'Unlock Smoke Step; Pounce cooldown reduced.', {
        ability: 'smoke_step',
        requires: ['veato_jaguar_knife'],
        mods: { pounceCdr: 1 },
      }),
      node('veato_nether_capstone', 'nether_archer', 3, 'Bow from the Nether', 'Distance itself becomes hostile.', 'Unlock the Nether Bow.', {
        ability: 'nether_bow',
        requiresAny: ['veato_pinning_line', 'veato_smoke_sight'],
      }),
      node('veato_jaguar_capstone', 'jaguar_knife', 3, 'Prowling Pounce', 'He crosses the map like a thought nobody finished.', 'Unlock Prowling Pounce.', {
        ability: 'prowling_pounce',
        requiresAny: ['veato_tendon_price', 'veato_smoke_pounce'],
      }),
    ],
  },
};

export const BASE_LOADOUTS = {
  lucian: ['basic_attack', 'cleave'],
  sjen: ['basic_attack', 'rot_hex'],
  veato: ['bow_shot', 'venom_arrow'],
};

export function ownedTalents(g, char) {
  return g.talents?.[char] || [];
}

export function talentNode(char, id) {
  return PROGRESSION[char]?.nodes.find((n) => n.id === id) || null;
}

export function availableTalents(g, char) {
  const tree = PROGRESSION[char];
  if (!tree) return [];
  const owned = new Set(ownedTalents(g, char));
  const root = tree.nodes.find((n) => n.tier === 1 && owned.has(n.id));
  return tree.nodes.filter((n) => {
    if (owned.has(n.id)) return false;
    if (!root) return n.tier === 1;
    if (n.branch !== root.branch) return false;
    if (tree.nodes.some((x) => x.tier === n.tier && owned.has(x.id))) return false;
    if (n.requires && !n.requires.every((id) => owned.has(id))) return false;
    if (n.requiresAny && !n.requiresAny.some((id) => owned.has(id))) return false;
    const highestTier = Math.max(...tree.nodes.filter((x) => owned.has(x.id)).map((x) => x.tier), 0);
    return n.tier <= highestTier + 1;
  });
}

export function progressionAbilities(g, char) {
  const owned = ownedTalents(g, char);
  const nodes = owned.map((id) => talentNode(char, id)).filter(Boolean);
  let abilities = [...(BASE_LOADOUTS[char] || [])];
  if (char === 'veato' && nodes.some((n) => n.specialization === 'jaguar_knife')) {
    abilities = ['poison_blade', 'backstab'];
  }
  for (const n of nodes) {
    if (n.ability && !abilities.includes(n.ability)) abilities.push(n.ability);
  }
  const hasCapstone = nodes.some((n) => n.tier === 3 && n.ability);
  if (hasCapstone && abilities.length > 4) {
    const obsolete = abilities.includes('basic_attack')
      ? 'basic_attack'
      : abilities.includes('venom_arrow')
        ? 'venom_arrow'
        : null;
    if (obsolete) abilities = abilities.filter((id) => id !== obsolete);
  }
  return abilities.slice(0, 4);
}

export function progressionMods(g, char) {
  const mods = {};
  for (const id of ownedTalents(g, char)) {
    const node = talentNode(char, id);
    for (const [key, value] of Object.entries(node?.mods || {})) {
      if (typeof value === 'number') mods[key] = (mods[key] || 0) + value;
      else mods[key] = value;
    }
  }
  return mods;
}

export function specializationFor(g, char) {
  return ownedTalents(g, char).map((id) => talentNode(char, id)).find((n) => n?.specialization)?.specialization || null;
}

export function branchName(char, g) {
  const root = PROGRESSION[char]?.nodes.find((n) => n.tier === 1 && ownedTalents(g, char).includes(n.id));
  return root?.name || 'Unspecialized';
}
