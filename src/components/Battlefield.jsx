import React from 'react';
import BattleUnit from './BattleUnit.jsx';

// Side-view battlefield: party left (Lucian fronting, Sjen at the rear,
// the Wretch ahead of everyone), enemies right and mirrored. Layered fog,
// a dead skyline, and screen-level effects (quake, occult surge).

const PARTY_ORDER = { sjen: 0, veato: 1, lucian: 2, wretch: 3 };
const HEAVY_HITS = ['cleave', 'execute', 'heavy_blow', 'chain_lash', 'collect_the_debt', 'debt_of_flesh'];

export default function Battlefield({ c, fx, cur, isTargetable, onTarget }) {
  const party = c.units
    .filter((u) => u.side === 'party')
    .sort((a, b) => (PARTY_ORDER[a.key] ?? 9) - (PARTY_ORDER[b.key] ?? 9));
  const enemies = c.units.filter((u) => u.side === 'enemy');

  const quake = fx.some(
    (e) => (e.k === 'hit' && HEAVY_HITS.includes(e.ability)) || (e.k === 'death' && e.boss)
  );
  const occult = fx.some((e) => e.k === 'cast' && e.ability === 'whispering_pact');
  const bossDeath = fx.some((e) => e.k === 'death' && e.boss);

  return (
    <div className={`battlefield-stage ${quake ? 'quake' : ''} ${occult ? 'occult-surge' : ''} ${bossDeath ? 'boss-death' : ''}`}>
      <div className="bf-skyline" />
      <div className="bf-fog far" />
      <div className="bf-fog near" />
      <div className="bf-ground" />
      <div className="bf-ranks">
        <div className="bf-side party-side">
          {party.map((u) => (
            <BattleUnit
              key={u.uid}
              u={u}
              fx={fx}
              isCurrent={cur?.uid === u.uid}
              targetable={isTargetable(u)}
              onClick={() => onTarget(u.uid)}
            />
          ))}
        </div>
        <div className="bf-side enemy-side">
          {enemies.map((u) => (
            <BattleUnit
              key={u.uid}
              u={u}
              fx={fx}
              isCurrent={cur?.uid === u.uid}
              targetable={isTargetable(u)}
              onClick={() => onTarget(u.uid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
