// Global game state: the campaign ledger. Combat has its own engine state;
// results are folded back in here via COMBAT_END.
//
// Saves are versioned. migrateSave() merges any older save onto current
// defaults and infers campaign fields, so adding state never breaks an
// existing ledger. "Ledger Marks" (g.mark) are checkpoint toasts the UI
// shows after major events — the autosave itself runs on every change.

import { SCRIPTS, ITEMS, SCARS } from './data/story.js';
import { ENCOUNTERS, ENEMIES } from './data/units.js';
import { availableTalents, talentNode } from './data/progression.js';

export const SAVE_KEY = 'crown_of_carrion_save';
export const SAVE_VERSION = 4;

export function initialState() {
  const state = {
    version: SAVE_VERSION,
    screen: 'title',
    gold: 40,
    corruption: 0,
    shards: 0, // crownmetal fragments
    deaths: 0, // Cocoli returns
    scars: [],
    level: 1,
    xp: 0,
    difficulty: 'merciless',
    crownWhispers: 0,
    cocoliOriginFragments: 0,
    cocoliDebts: 0,
    reputation: { ashen_church: 0, plague_barons: 0, iron_covenant: 10, hollow_choir: 0 },
    tension: { lucian_sjen: 35, lucian_veato: 30, sjen_veato: 20 },
    // Sin ranks: there are no stats here, only what each of them is becoming.
    sins: {
      lucian: { pride: 0, wrath: 0, gluttony: 0, cruelty: 0, ambition: 0 },
      sjen: { cunning: 0, envy: 0, deceit: 0, gluttony: 0, ambition: 0 },
      veato: { greed: 0, deceit: 0, envy: 0, cunning: 0, wrath: 0 },
    },
    talents: { lucian: [], sjen: [], veato: [] },
    pendingAscension: [],
    ascensionReturn: null,
    inventory: [],
    flags: {},
    // Campaign structure
    currentChapter: 1,
    completedChapters: [],
    unlockedRegions: ['marrowfen'],
    missionsDone: [],
    defeatedBosses: [],
    betrayalStage: { sjen: 0, veato: 0 },
    // Forward-compat placeholders for systems arriving with Chapter II
    weapons: {},
    affliction: null,
    // Flow position
    scriptId: null,
    nodeId: null,
    encounterId: null,
    victoryNode: null,
    // Ledger Mark toast (not persisted meaningfully; refreshed on load)
    mark: null,
    lastSavedAt: null,
  };

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const combat = params.get('combat');
    if (ENCOUNTERS[combat]) {
      return { ...state, screen: 'combat', encounterId: combat };
    }

    const scene = params.get('scene');
    const [scriptId, nodeId] = scene?.split(':') || [];
    if (SCRIPTS[scriptId]?.nodes[nodeId]) {
      return { ...state, screen: 'dialogue', scriptId, nodeId };
    }
  }

  return state;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// One checkpoint message. Quiet by design.
function mark(s, text = 'The ledger remembers.') {
  return { ...s, mark: { id: Date.now() + Math.random(), text } };
}

// Merge any older (or newer-but-partial) save onto current defaults.
// Never wipes; infers campaign fields from what the old save did record.
export function migrateSave(save) {
  const base = initialState();
  const s = { ...base, ...save };
  s.version = SAVE_VERSION;
  s.reputation = { ...base.reputation, ...(save.reputation || {}) };
  s.tension = { ...base.tension, ...(save.tension || {}) };
  s.sins = {
    lucian: { ...base.sins.lucian, ...(save.sins?.lucian || {}) },
    sjen: { ...base.sins.sjen, ...(save.sins?.sjen || {}) },
    veato: { ...base.sins.veato, ...(save.sins?.veato || {}) },
  };
  s.talents = {
    lucian: [...(save.talents?.lucian || [])],
    sjen: [...(save.talents?.sjen || [])],
    veato: [...(save.talents?.veato || [])],
  };
  s.betrayalStage = { ...base.betrayalStage, ...(save.betrayalStage || {}) };
  s.flags = save.flags || {};
  s.inventory = save.inventory || [];
  s.scars = save.scars || [];
  s.missionsDone = save.missionsDone || [];
  s.pendingAscension = save.pendingAscension || [];
  if (!save.talents && s.level > 1 && s.pendingAscension.length === 0) {
    const owed = Math.min(3, s.level - 1);
    s.pendingAscension = Array.from({ length: owed }, () => ['lucian', 'sjen', 'veato']).flat();
    if (s.pendingAscension.length) {
      s.ascensionReturn = save.screen === 'map' || !save.scriptId ? 'map' : 'dialogue';
      s.screen = 'ascension';
    }
  }
  // Infer chapter progress from pre-campaign saves.
  const ch1Done = s.missionsDone.includes('butchers_debt');
  if (!save.completedChapters) s.completedChapters = ch1Done ? [1] : [];
  if (!save.defeatedBosses) s.defeatedBosses = ch1Done ? ['debt_bound_knight'] : [];
  if (!save.unlockedRegions) s.unlockedRegions = ch1Done ? ['marrowfen', 'ash_roads'] : ['marrowfen'];
  if (!save.currentChapter) s.currentChapter = s.completedChapters.includes(1) ? 2 : 1;
  // Never resume into a dead-end screen.
  if (!s.screen || s.screen === 'title') s.screen = 'map';
  // Mid-combat refreshes restore to the fight's start — the last clean
  // checkpoint. Half-finished combat is never persisted.
  s.mark =
    save.screen === 'combat'
      ? { id: Date.now(), text: 'The ledger returns you to the last remembered debt.' }
      : { id: Date.now(), text: 'The ledger remembers.' };
  return s;
}

export function applyEffects(g, fx) {
  if (!fx) return g;
  const s = {
    ...g,
    reputation: { ...g.reputation },
    tension: { ...g.tension },
    flags: { ...g.flags },
    inventory: [...g.inventory],
    scars: [...g.scars],
  };
  if (fx.gold) s.gold = Math.max(0, s.gold + fx.gold);
  if (fx.corruption) s.corruption = clamp(s.corruption + fx.corruption, 0, 100);
  if (fx.rep) for (const k in fx.rep) s.reputation[k] = clamp((s.reputation[k] || 0) + fx.rep[k], -100, 100);
  if (fx.tension) for (const k in fx.tension) s.tension[k] = clamp((s.tension[k] || 0) + fx.tension[k], 0, 100);
  if (fx.item && !s.inventory.some((i) => i.id === fx.item)) s.inventory.push(ITEMS[fx.item]);
  if (fx.flag) Object.assign(s.flags, fx.flag);
  if (fx.whisper) s.crownWhispers += 1;
  if (fx.shard) s.shards += 1;
  return s;
}

function gotoNode(g, nodeId) {
  let s = { ...g, nodeId };
  const node = SCRIPTS[s.scriptId]?.nodes[nodeId];
  if (node?.effects) s = applyEffects(s, node.effects);
  return s;
}

export function reducer(g, a) {
  switch (a.type) {
    case 'NEW_GAME': {
      const s = { ...initialState(), difficulty: a.difficulty || 'merciless', screen: 'dialogue', scriptId: 'intro' };
      return mark(gotoNode(s, SCRIPTS.intro.start), 'A new debt is opened. The ledger remembers.');
    }
    case 'LOAD':
      return migrateSave(a.save);
    case 'GOTO_SCREEN':
      return { ...g, screen: a.screen };
    case 'GOTO_NODE':
      return gotoNode(g, a.node);
    case 'CHOOSE': {
      let s = applyEffects(g, a.effects);
      return mark(gotoNode(s, a.next));
    }
    case 'TO_MAP':
      return mark({ ...g, screen: 'map', scriptId: null, nodeId: null });
    case 'START_SCRIPT': {
      const s = { ...g, screen: 'dialogue', scriptId: a.scriptId };
      return mark(gotoNode(s, SCRIPTS[a.scriptId].start), 'The contract is entered. The ledger remembers.');
    }
    case 'START_COMBAT':
      return { ...g, screen: 'combat', encounterId: a.encounterId, victoryNode: a.then };
    case 'COMBAT_END': {
      if (a.result === 'victory') {
        const enc = ENCOUNTERS[g.encounterId];
        // Greed fattens the purse; Ambition feeds on the act of rising.
        const greedMult = 1 + 0.15 * (g.sins.veato.greed || 0);
        const ambMult = 1 + 0.15 * (g.sins.lucian.ambition || 0);
        const gold = Math.round((enc.gold || 0) * greedMult) + (a.bonusGold || 0) - (a.skim || 0);
        let s = applyEffects(g, { gold, corruption: a.corruptionDelta || 0, item: a.lootItem });
        s.cocoliDebts = (s.cocoliDebts || 0) + (a.cocoliDebtsDelta || 0) + (a.cocoliObjective ? 1 : 0);
        s.flags = {
          ...s.flags,
          cocoli_vengeance: false,
          ...(a.cocoliObjective ? { cocoli_ascension_objective: true } : {}),
        };
        if (a.tensionDelta) s = applyEffects(s, { tension: a.tensionDelta });
        const bossKilled = enc.enemies.some((e) => ENEMIES[e].boss);
        if (bossKilled && !s.defeatedBosses.includes(g.encounterId)) {
          s.defeatedBosses = [...s.defeatedBosses, g.encounterId];
        }
        s.xp = s.xp + Math.round((enc.xp || 0) * ambMult) + (a.bonusXp || 0);
        let levelsGained = 0;
        while (s.xp >= s.level * 100) {
          s.xp -= s.level * 100;
          s.level += 1;
          levelsGained += 1;
        }
        const talentLevelsGained = Array.from(
          { length: levelsGained },
          (_, i) => s.level - levelsGained + i + 1
        ).filter((level) => level <= 4).length;
        if (talentLevelsGained > 0) {
          // One visible specialization-tree choice per core party member.
          s.pendingAscension = Array.from({ length: talentLevelsGained }, () => ['lucian', 'sjen', 'veato']).flat();
          s.ascensionReturn = 'dialogue';
          s.screen = 'ascension';
          return mark(s, bossKilled ? 'The boss’s debt is crossed out. The ledger remembers.' : undefined);
        }
        s.screen = 'dialogue';
        return mark(gotoNode(s, g.victoryNode), bossKilled ? 'The boss’s debt is crossed out. The ledger remembers.' : undefined);
      }
      // Defeat: Lucian goes somewhere outside death.
      return { ...g, deaths: g.deaths + 1, screen: 'silence' };
    }
    case 'LEARN_TALENT': {
      const allowed = availableTalents(g, a.char).some((n) => n.id === a.talent);
      if (!allowed) return g;
      const picked = talentNode(a.char, a.talent);
      const pending = g.pendingAscension.slice(1);
      const talents = {
        ...g.talents,
        [a.char]: [...(g.talents?.[a.char] || []), a.talent],
      };
      const flags = { ...g.flags };
      if (picked?.specialization && a.char === 'veato') flags.veato_specialization = picked.specialization;
      let s = { ...g, talents, flags, pendingAscension: pending };
      if (pending.length) return s;
      if (s.ascensionReturn === 'map') return mark({ ...s, screen: 'map', ascensionReturn: null }, 'The company’s new methods are entered in the ledger.');
      s = { ...s, screen: 'dialogue', ascensionReturn: null };
      return mark(gotoNode(s, g.victoryNode), 'The company has learned something expensive. The ledger remembers.');
    }
    case 'COMPLETE_ASCENSION': {
      const pending = g.pendingAscension.slice(1);
      if (pending.length) return { ...g, pendingAscension: pending };
      if (g.ascensionReturn === 'map') {
        return mark({ ...g, pendingAscension: [], ascensionReturn: null, screen: 'map' }, 'The branch is complete. Power now comes from surviving.');
      }
      return mark(
        gotoNode({ ...g, pendingAscension: [], ascensionReturn: null, screen: 'dialogue' }, g.victoryNode),
        'The branch is complete. Power now comes from surviving.'
      );
    }
    case 'SPECIALIZE_VEATO':
      return mark(
        {
          ...g,
          flags: { ...g.flags, veato_specialization: a.path },
        },
        a.path === 'jaguar_knife'
          ? 'Veato lowers his stance. The bow goes quiet. Two knives answer.'
          : 'Veato draws the Nether Bow. Distance becomes a kind of ownership.'
      );
    case 'CAMP_ACTION': {
      // Tension management between contracts. Nothing here is free.
      if (a.kind === 'pay') {
        if (g.gold < 25) return g;
        return applyEffects(g, { gold: -25, tension: { [a.pair]: -12 } });
      }
      if (a.kind === 'reassert') {
        // Lucian reminds them, violently, whose company this is.
        const other = a.pair === 'lucian_sjen' ? 'lucian_veato' : 'lucian_sjen';
        let s = applyEffects(g, { corruption: 3, tension: { [a.pair]: -30 } });
        return applyEffects(s, { tension: { [other]: 5 } });
      }
      return g;
    }
    case 'REVIVE': {
      const scarIdx = Math.min(g.deaths - 1, SCARS.length - 1);
      const scar = SCARS[scarIdx];
      const already = g.scars.some((sc) => sc.id === scar.id);
      const choice = a.choice || 'return';
      const baseCorruption = 5 + (already ? 8 : scar.corruption || 0) + (g.difficulty === 'merciless' ? 3 : 0);
      const choiceCorruption = choice === 'forget' ? 4 : choice === 'vengeance' ? 7 : 0;
      const baseTension = choice === 'forget' ? -8 : 4;
      let s = applyEffects(g, {
        corruption: baseCorruption + choiceCorruption,
        tension: { lucian_sjen: baseTension, lucian_veato: baseTension },
        flag: { cocoli_vengeance: choice === 'vengeance' },
      });
      s.cocoliDebts = (s.cocoliDebts || 0) + 1;
      if (!already) s.scars = [...s.scars, scar];
      // Repeated deaths peel back pieces of what Cocoli is.
      if (g.deaths >= 3 || choice === 'forget') s.cocoliOriginFragments = Math.min(5, (g.cocoliOriginFragments || 0) + 1);
      s.screen = 'combat'; // Back into the same fight, marked.
      return mark(s, 'Returned. The ledger remembers even this.');
    }
    case 'AFTERMATH':
      return { ...g, screen: 'aftermath' };
    case 'MISSION_DONE': {
      let s = {
        ...g,
        screen: 'map',
        scriptId: null,
        nodeId: null,
        missionsDone: g.missionsDone.includes(a.mission) ? g.missionsDone : [...g.missionsDone, a.mission],
      };
      // Chapter I completion: the page turns, the ash roads open.
      if (a.mission === 'butchers_debt' && !s.completedChapters.includes(1)) {
        s.completedChapters = [...s.completedChapters, 1];
        s.currentChapter = 2;
        s.unlockedRegions = [...new Set([...s.unlockedRegions, 'ash_roads'])];
        return mark(s, 'The first debt is paid. The ledger turns a page.');
      }
      if (a.mission === 'saint_without_face' && !s.completedChapters.includes(2)) {
        s.completedChapters = [...s.completedChapters, 2];
        s.currentChapter = 3;
        s.unlockedRegions = [...new Set([...s.unlockedRegions, 'iron_marches'])];
        return mark(s, 'The second debt is ash. The next road opens.');
      }
      return mark(s);
    }
    case 'WIPE_SAVE':
      return initialState();
    default:
      return g;
  }
}
