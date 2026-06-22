# Painted battle art

Drop full-body character images here and they appear on the tactical grid
automatically (no code changes). Missing art falls back to the SVG silhouette.

## Naming

`<sprite>.<ext>` — default look · `<sprite>-ascended.<ext>` — upgraded look
(ext: `jpg`, `jpeg`, `png`, or `webp`)

The `<sprite>` key is the unit's `sprite` field in `src/data/units.js`:

| Party | Enemies |
|-------|---------|
| `lucian`, `sjen`, `veato`, `chan`, `chibi` | `villager`, `slinger`, `guard`, `hollow_guard`, `knight`, `flagellant`, `censer`, `taxman`, `husk`, `demon`, `saint` |

Example: `lucian.jpg` (starter) and `lucian-ascended.jpg` (upgraded). A party
member shows its `-ascended` art once it has fed enough sins (3+ ranks total).

## Current art slots

- `sjen.png`: approved transparent full-body Sjen.
- `veato.png`: reserved for Veato's starting outfit with the dirty mercenary bow.
- `veato-ascended.png`: reserved for the Bow from the Nether upgrade.
- `veato-jaguar.png`: reserved for the dual-dagger Jaguar Knife specialization.
- `chan.png`: archived first merchant design.
- `chan_broker.png`: Carrion Factor redesign with cropped field jacket, tally sash, and repeating execution crossbow.
- `guard.png`: weaker Plague Guard, still partly human.
- `hollow_guard.png`: soulless transformed guard.
- `knight.png`: oversized Debt-Bound Knight boss.

## Image guidance

- **Full-body, single figure, centered.** Side- or three-quarter-facing reads
  best; party art faces right, enemy art is mirrored automatically.
- Dark/atmospheric backgrounds are fine — the grid applies a soft elliptical
  edge-mask so the figure emerges from shadow rather than sitting in a box.
- Transparent PNGs look cleanest of all, but are not required.
