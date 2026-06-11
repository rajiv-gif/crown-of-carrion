# Crown of Carrion

*No heroes. Only the next tyrant.*

A dark turn-based RPG prototype. You play **Lucian**, captain of the Black Tithe — a feared mercenary trio clawing its way up a dying continent toward the Carrion Crown. There are no good choices. There is no good faction. There is only leverage.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`).

Progress auto-saves to `localStorage` after every change; **Ledger Marks** ("The ledger remembers.") flag the checkpoint moments. The title screen shows a save preview — chapter, location, corruption, gold, Cocoli returns, last-saved time — with **Resume the Debt**, a confirmation-guarded **New Game**, and a doubly-guarded **Erase the Ledger**. Saves are versioned (`SAVE_VERSION`) and migrated forward on load, so old saves never break; refreshing mid-combat restores to the start of that fight ("The ledger returns you to the last remembered debt.").

## The campaign

*The Carrion Crown is not taken in one night. Five debts must be paid. The first is payable now.*

| Chapter | Name | Faction | Boss | Status |
|---|---|---|---|---|
| I | The Butcher's Debt | The Plague Barons | The Debt-Bound Knight | **Playable** |
| II | The Ashen Tithe | The Ashen Church | The Saint Without a Face | Region unlocks when Chapter I is complete |
| III | The Iron Feast | The Iron Covenant | The Contract-King | Sealed |
| IV | The Hollow Choir | The Hollow Choir | The Choir Beneath the Skin | Sealed |
| V | Carrion Ascendant | All, collapsing | Unwritten | Finale |

Chapters II–V exist as data scaffolding ([chapters.js](src/data/chapters.js)) — names, regions, themes, bosses, danger levels, lock requirements — shown on the map and in the **Campaign Ledger** (an in-world cursed record of debts, scars, loyalties, sins fed, and choices made). Completing Chapter I turns the page: it marks the Knight defeated, opens the ash roads, and advances the campaign state. Cocoli's mystery, the betrayal arcs, and living-weapon mutations are reserved fields in the save schema, ready for the later chapters.

## The vertical slice

1. **Title screen** → **Story intro**: the Black Tithe takes a contract from Baron Vessik, a Plague Baron (with a first dialogue choice).
2. **World map**: one open contract (*The Butcher's Debt*), three locked future regions, plus party roster, tension meters, faction reputation, and inventory.
3. **Mission**: collect a debt from the plague village of Marrowfen. First combat (villagers + infected guards), then the discovery of crownmetal and a **five-way villain choice**: slaughter, sell to the Baron, betray the Baron, Sjen's forbidden ritual, or Veato's side deal.
4. **Boss**: the Debt-Bound Knight.
5. **Death** drops Lucian into **The White Silence**, where Cocoli returns him — with a permanent scar, corruption, and party tension.
6. **Aftermath**: choice-specific epilogue, party reactions, secret-consequence lines, the Crown's first whisper, and the full ledger of meters.

## Implemented mechanics

- **Animated side-view battlefield** — party left, enemies right (mirrored), every unit a hand-built SVG silhouette over layered fog, a ruined skyline, and a blood-lit ground. The engine emits structured events (`cast`, `hit`, `dot`, `status`, `float`, `death`, `flee`, `bubble`, `summon`) alongside its text log; the combat screen diffs new events per action and turns them into ~1.5s of CSS animation — actor lunges/casts/dashes, target shakes, ability VFX (slash arcs, occult bursts, the Tyrant's Grip shadow-hand, rot sigils, bone-ward flare, smoke puffs), floating damage/status text, screen quake on heavy hits and boss death, brutal collapse animations, and sparse speech bubbles on tension events. Mechanics stay 100% in the engine; events are a read-only feed.
- **Turn-based party combat** — speed-ordered rounds, ability cooldowns, damage variance, simple enemy AI (target selection + conditional specials).
- **Status effects** — bleed, poison, curse (DoTs), stun, fear (skip/weaken), might, cripple, dodge (Smoke Step), shield (Bone Ward).
- **Character kits** — Lucian (Cleave, Execute, Blood Command, Tyrant's Grip, Feast on Fear passive), Sjen (Rot Hex, Bone Ward, Debt of Flesh, Summon Wretch, Whispering Pact), Veato (Backstab, Poison Blade, Smoke Step, Crippling Cut, Hidden Knife passive).
- **Sin-based leveling** — no stat points. On level-up each character "feeds" a sin on a dark ascension screen (Lucian: Pride/Wrath/Gluttony/Cruelty/Ambition; Sjen: Cunning/Envy/Deceit/Gluttony/Ambition; Veato: Greed/Deceit/Envy/Cunning/Wrath). Each rank shows thematic flavor + mechanics and maps to hidden stats in [sins.js](src/data/sins.js): Pride → damage/fear-resist/Execute power, Wrath → vicious blows/bleed/kill momentum, Gluttony → health/sustain/plague resistance, Cruelty → on-hit fear/longer terror, Cunning → cooldown reduction/deeper curses, Envy → anti-boss damage/Might stealing, Deceit → dodge/backstab depth, Greed → gold/loot finds, Ambition → XP/corruption-scaling damage.
- **Tension-gated escalation** — three pairwise meters with four tiers, never pure randomness: **low (<40)** costless cruel banter; **medium (40+)** open arguments that leave marks (small HP loss); **high (65+)** sabotaged orders, skimmed gold, and "accidental" friendly fire; **critical (90+)** lethal betrayal — a companion may knife Lucian mid-fight or walk out of the battle entirely (once per combat). Warning signs come first: tier-colored meters, a pulsing "knife's edge" HUD flag, murderous banter, map-screen warnings ("Veato's hand keeps drifting toward his hidden knife"), and companions locking their dialogue offers at 80+. Tension falls through shared victories, paying a companion's cut at camp, or Lucian violently reasserting control (available only at 90+, costs corruption, frightens the other one); it rises through bullying, Blood Command, Debt of Flesh, deaths, and excluding choices.
- **Corruption, gold, faction reputation** (Ashen Church, Plague Barons, Iron Covenant, Hollow Choir — all evil), **XP**, simple **inventory** with passive bonuses.
- **Death & revival** — Lucian's death ends the fight (the others don't die for hire). Cocoli's lines escalate with death count; scars are permanent and mechanical (Pale Brand, Borrowed Breath, Grave-Light Eyes).
- **Persistent consequences** — choice flags drive the aftermath, secret betrayal seeds (Sjen's hidden name, Veato's unnamed buyer) are planted for future chapters.

## File structure

```
crown-of-carrion/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx            # entry (no StrictMode: combat effects fire once)
    ├── App.jsx             # game context + screen router + autosave
    ├── state.js            # campaign reducer: gold/corruption/rep/tension/flags
    ├── styles.css          # the cursed war-ledger aesthetic
    ├── data/
    │   ├── units.js        # party, enemies, encounters
    │   ├── sins.js         # sin definitions, sin→stat translation, tension tiers
    │   └── story.js        # scripts, factions, items, scars, Cocoli, whispers
    ├── combat/
    │   └── engine.js       # pure turn engine: abilities, statuses, AI, sabotage
    ├── components/
    │   ├── Hud.jsx
    │   ├── Battlefield.jsx # side-view arena: fog, skyline, quake/occult overlays
    │   ├── BattleUnit.jsx  # sprite + nameplate + HP + statuses + anim classes
    │   ├── Silhouettes.jsx # hand-built SVG figures (7 unit types)
    │   ├── StatusIcon.jsx  # SVG status glyphs (shield shows its value)
    │   └── FloatingText.jsx# damage numbers, ticks, words ("EXECUTED", "Sabotage")
    └── screens/
        ├── Title.jsx
        ├── Dialogue.jsx
        ├── MapScreen.jsx
        ├── CombatScreen.jsx
        ├── Ascension.jsx   # "Feed Pride" / "Feed Greed" sin level-up screen
        ├── WhiteSilence.jsx
        └── Aftermath.jsx
```

## Next expansion (suggested order)

1. **Chapter 2 missions** — the three locked regions already on the map, one per faction, each ending in a crownmetal bearer.
2. **Active betrayal events** — at sustained 80+ tension, scripted scenes where Sjen or Veato actually turn (Sjen: occult, long-game; Veato: immediate, transactional), with recruitable replacements.
3. **Corruption thresholds** — at 25/50/75, dialogue options mutate, Lucian's portrait degrades, and the Crown speaks during combat.
4. **Cocoli arc** — death #4+ begins revealing her origin fragments; a corruption-100 path where even she goes quiet.
5. **Camp scenes between missions** — spend gold, lower (or weaponize) tension, let companions take side contracts off-screen with consequences.
6. **Equipment & contracts board** — multiple simultaneous contracts with mutually exclusive employers, so taking one burns another faction.
