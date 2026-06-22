# Attack animation cheat-sheet

Combat animations are **CSS keyframes** driven by **engine events**. Nothing is
hard-coded per ability in JS beyond two lookup tables. To tune the *feel*, you
almost always just edit numbers in `src/styles.css` — and with `npm run dev`
running, changes hot-reload instantly (no rebuild, no cost).

## See them without playing: the Animation Lab

Open the game with **`?lab`** in the URL (e.g. `http://localhost:5173/?lab`).
Every skill becomes a button; click it to play its animation on a dummy fight.
Buttons are generated from the ability list, so new skills appear automatically.

## How it flows

1. `src/combat/engine.js` emits events: `{k:'cast', actor, ability, target}`,
   `{k:'hit', unit, ability, vicious}`, `{k:'dot'}`, `{k:'death'}`, `{k:'move'}`, …
2. `src/components/BattleUnit.jsx` reads those events and applies CSS classes:
   - the **actor** gets an `act-*` class from the **`ANIM`** map (its lunge/cast/etc.)
   - the **target** gets `is-hit` (recoil) + a **`VFX`** overlay from the **`VFX`** map
3. `src/components/Battlefield.jsx` adds **screen-level** effects from the same
   events: `quake` (heavy hits / boss death), `occult-surge`, `ultimate-surge`,
   `psychosis-field`.

So: **which** animation a skill uses → edit the maps in `BattleUnit.jsx`.
**How** that animation looks → edit the keyframe in `styles.css`.

## Actor motions (`ANIM` map → `act-*` classes)

| Class | Keyframe | Feel | Used by (e.g.) |
|---|---|---|---|
| `act-heavy` | `actHeavy` | big forward lunge + recoil | Cleave, Execute, Heavy Blow, Cinder Maul |
| `act-slash` | `actSlash` | quick short step-in | Poison Blade, Crippling Cut, claw |
| `act-dash` | `actDash` | blur-dash in and back | Backstab, Hidden Knife, Prowling Pounce |
| `act-cast` | `actCast` | rise + occult glow | Rot Hex, bow shots, most casters |
| `act-shout` | `actShout` | scale-up domination pulse | Blood Command, Tyrant's Grip, Wait |
| `act-vanish` | `actVanish` | fade to smoke | Smoke Step |
| `act-ultimate` | `actUltimate` | heaviest, screen-shaking | Mo bos ie EYE, Demon Invocation |
| `is-hit` | `hitShake` | the **target** recoiling | every landed hit |

Tuning a motion: open the keyframe (e.g. `@keyframes actHeavy`) and change the
`translateX/Y` distances (lunge reach), the `%` stops (timing), or the parent
rule's `animation: actHeavy 0.7s ease` **duration**.

## Impact VFX (`VFX` map → `vfx-*` classes)

Format is `vfx-<shape> vfx-<color>`:
- **Shapes:** `vfx-slash` (sweeping arc), `vfx-burst` (radial blast),
  plus specials `vfx-grip`, `vfx-sigil`, `vfx-ward`, `vfx-smoke`,
  `vfx-eyecrush`, and the default `vfx-impact`.
- **Colors:** `vfx-red`, `vfx-green`, `vfx-purple`, `vfx-gold`, `vfx-low`.

Keyframes: `slashSweep` (slashes), `burstOut` (bursts), `gripRise`,
`sigilFlare`/`sigilSpin`, `wardFlare`, `smokePuff`, `eyeCrush`. Change a shape's
size by editing the `.vfx-slash { width/height }` rules; change color by editing
the `--fxc` custom property in each `.vfx-<color>` rule.

## Screen-level effects (in `Battlefield.jsx`)

- `quake` (`@keyframes quake`) — fires on heavy hits and boss death. Edit which
  abilities count via the `HEAVY_HITS` array in `Battlefield.jsx`.
- `occult-surge`, `ultimate-surge`, `psychosis-field` — the stage tint/overlays;
  styled on `.battlefield-stage.*`.

## Recipes

- **Make a hit feel heavier:** longer `actHeavy` lunge distance + add the ability
  to `HEAVY_HITS` (for screen quake) + bump the `vfx-burst`/`vfx-slash` size.
- **Re-skin a skill's effect:** change its entry in the `VFX` map in
  `BattleUnit.jsx` (e.g. `poison_blade: 'vfx-slash vfx-green'`).
- **Add a brand-new motion:** add a `@keyframes` + `.act-foo` rule in
  `styles.css`, then map the ability to `'act-foo'` in `BattleUnit.jsx`'s `ANIM`.

## Cost note

All of the above is CSS — tune it live in the browser for free. Reserve a
Claude/Codex turn only when you need a genuinely new effect built or wired.
