// Painted battle art, auto-discovered from src/assets/units/.
//
// Drop a file named "<sprite>.<ext>" for a unit's default look and
// "<sprite>-ascended.<ext>" for its upgraded/ascended look (ext = jpg, jpeg,
// png, or webp). The <sprite> key is the unit's `sprite` field — e.g. lucian,
// sjen, veato, chan, chibi, villager, guard, slinger, knight, saint…
//
// Any unit without a file here simply renders its hand-built SVG silhouette,
// so the game always works; art upgrades it incrementally as files appear.

const files = import.meta.glob('../assets/units/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const ART = {};
for (const path in files) {
  const name = path
    .split('/')
    .pop()
    .replace(/\.(jpg|jpeg|png|webp)$/i, '');
  ART[name] = files[path];
}

// URL for a unit's painted art, or null to fall back to the SVG silhouette.
export function unitArt(sprite, ascended) {
  if (!sprite) return null;
  if (ascended && ART[`${sprite}-ascended`]) return ART[`${sprite}-ascended`];
  return ART[sprite] || null;
}

export const hasUnitArt = (sprite) => !!(ART[sprite] || ART[`${sprite}-ascended`]);
