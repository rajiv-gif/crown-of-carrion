import React from 'react';
import BattleUnit from './BattleUnit.jsx';
import { TERRAIN } from '../data/battlefields.js';

// Tactical battlefield: units live as small map figures until an action
// makes the actor and victim flare up for a readable combat animation.
const HEAVY_HITS = [
  'cleave',
  'execute',
  'heavy_blow',
  'chain_lash',
  'collect_the_debt',
  'debt_of_flesh',
  'mo_bos_ie_eye',
  'demon_invocation',
  'cinder_maul',
  'erase_face',
];

export default function Battlefield({ c, fx, cur, isTargetable, onTarget, moveTiles = [], onMove }) {
  const field = c.field || { columns: 8, rows: 5, tiles: [], rules: [] };
  const cols = field.columns || 8;
  const rows = field.rows || 5;
  const tileAt = (x, y) => field.tiles?.find((t) => t.x === x && t.y === y)?.type || 'ash';
  const tiles = Array.from({ length: cols * rows }, (_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const type = tileAt(x, y);
    return { x, y, type, info: TERRAIN[type] || TERRAIN.ash };
  });
  const presentTerrain = new Set((field.tiles || []).map((t) => t.type));
  const moveSet = new Set((moveTiles || []).map((t) => `${t.x},${t.y}`));
  const units = [...c.units].sort((a, b) => (a.tile?.y || 0) - (b.tile?.y || 0) || (a.side === 'enemy' ? 1 : -1));
  const spotlight = new Set(
    fx.flatMap((e) => [
      e.k === 'cast' ? e.actor : null,
      ['hit', 'dot', 'status', 'death'].includes(e.k) ? e.unit : null,
      e.target || null,
    ]).filter(Boolean)
  );
  const moving = new Map(fx.filter((e) => e.k === 'move' && e.from && e.to).map((e) => [e.unit, e]));

  const quake = fx.some(
    (e) => (e.k === 'hit' && HEAVY_HITS.includes(e.ability)) || (e.k === 'death' && e.boss)
  );
  const occult = fx.some((e) => e.k === 'cast' && e.ability === 'whispering_pact');
  const ultimate = fx.some((e) => e.k === 'cast' && (e.ability === 'mo_bos_ie_eye' || e.ability === 'demon_invocation'));
  const psychosis = fx.some((e) => e.k === 'status' && e.status === 'psychosis') || c.units.some((u) => u.alive && u.statuses.some((st) => st.type === 'psychosis'));
  const bossDeath = fx.some((e) => e.k === 'death' && e.boss);

  return (
    <div
      className={`battlefield-stage ${quake ? 'quake' : ''} ${occult ? 'occult-surge' : ''} ${
        ultimate ? 'ultimate-surge' : ''
      } ${psychosis ? 'psychosis-field' : ''} ${bossDeath ? 'boss-death' : ''}`}
    >
      <div className="bf-skyline" />
      <div className="bf-fog far" />
      <div className="bf-fog near" />
      <div className="bf-ground" />
      <div className="bf-terrain-title">
        <span>{field.name || c.name}</span>
        <small>{field.rules?.join(' ')}</small>
      </div>
      <div className="bf-tactical-board" style={{ '--cols': cols, '--rows': rows }}>
        {tiles.map((tile) => {
          const movable = moveSet.has(`${tile.x},${tile.y}`);
          return (
            <div
              key={`${tile.x}-${tile.y}`}
              className={`bf-tile terrain-${tile.type} ${movable ? 'is-movable' : ''}`}
              title={movable ? `Move here · ${tile.info.name}` : `${tile.info.name}: ${tile.info.short}`}
              style={{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }}
              onClick={movable && onMove ? () => onMove(tile.x, tile.y) : undefined}
            >
              {tile.type !== 'ash' && <span>{tile.info.name}</span>}
            </div>
          );
        })}
        <div className="bf-grid-lines" />
        {fx
          .filter((e) => e.k === 'move' && e.from)
          .map((e) => (
            <div
              key={`ghost-${e.id}`}
              className="bf-move-ghost"
              style={{ gridColumn: e.from.x + 1, gridRow: e.from.y + 1 }}
            />
          ))}
        {units.map((u) => {
          const mv = moving.get(u.uid);
          const sp = spotlight.has(u.uid);
          return (
            <div
              key={u.uid}
              className={`bf-tactical-unit ${u.side}-tile tile-${u.key} ${sp ? 'is-spotlight' : ''} ${
                mv && !sp ? 'just-moved' : ''
              }`}
              style={{
                gridColumn: (u.tile?.x || 0) + 1,
                gridRow: (u.tile?.y || 0) + 1,
                zIndex: 20 + (u.tile?.y || 0) * 3 + (u.boss ? 2 : 0),
                ...(mv && !sp
                  ? { '--mvdx': Math.sign(mv.from.x - mv.to.x), '--mvdy': Math.sign(mv.from.y - mv.to.y) }
                  : null),
              }}
            >
              <BattleUnit
                u={u}
                fx={fx}
                isCurrent={cur?.uid === u.uid}
                targetable={isTargetable(u)}
                onClick={() => onTarget(u.uid)}
              />
            </div>
          );
        })}
      </div>
      <div className="bf-terrain-legend">
        {Object.entries(TERRAIN)
          .filter(([type]) => type !== 'ash' && presentTerrain.has(type))
          .map(([type, info]) => (
            <span key={type} className={`legend-chip terrain-${type}`}>
              {info.name}
            </span>
          ))}
      </div>
    </div>
  );
}
