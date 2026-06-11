import React from 'react';
import { useGame } from '../App.jsx';
import { ABILITY_UNLOCKS, SINS, SIN_PATHS, abilityUnlocked } from '../data/sins.js';
import { PARTY } from '../data/units.js';
import { ABILITIES } from '../combat/engine.js';

const MONSTROUS = {
  lucian: 'Lucian grows more monstrous. Choose what part of him deepens.',
  sjen: 'Something in Sjen unfolds another joint. Choose what part of him deepens.',
  veato: 'Veato sharpens in the dark. Choose what part of him deepens.',
};

export default function Ascension() {
  const { g, dispatch } = useGame();
  const char = g.pendingAscension[0];
  if (!char) return null;
  const P = PARTY[char];
  const idx = 4 - g.pendingAscension.length; // 1st, 2nd, 3rd of three

  return (
    <div className="screen ascension-screen">
      <div className="panel ascension-panel" key={char}>
        <div className="title-rule dim">
          — ascension · level {g.level} · {idx} of 3 —
        </div>
        <div className="ascension-head">
          <span className="ascension-sigil" style={{ color: P.color }}>
            {P.sigil}
          </span>
          <h2 className="ascension-title">{MONSTROUS[char]}</h2>
        </div>
        <p className="ascension-sub">
          There are no virtues left to train. Only sins, and the question of which one eats first.
        </p>
        <div className="sin-list">
          {SIN_PATHS[char].map((sinId) => {
            const sin = SINS[sinId];
            const rank = g.sins[char][sinId] || 0;
            const unlocks = Object.entries(ABILITY_UNLOCKS)
              .filter(([id, req]) => req.char === char && req.sins.includes(sinId) && !abilityUnlocked(id, g.sins))
              .map(([id, req]) => req.passive || ABILITIES[id]?.name)
              .filter(Boolean);
            return (
              <button
                key={sinId}
                className="sin-card"
                onClick={() => dispatch({ type: 'FEED_SIN', char, sin: sinId })}
              >
                <div className="sin-head">
                  <span className="sin-name">Feed {sin.name}</span>
                  <span className="sin-rank">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span key={i} className={i < rank ? 'sin-dot full' : 'sin-dot'}>
                        ●
                      </span>
                    ))}
                  </span>
                </div>
                <p className="sin-flavor">{sin.flavor[char] || sin.flavor.default}</p>
                <p className="sin-mech">{sin.mech}</p>
                {unlocks.length > 0 && <p className="sin-unlock">Unlocks: {unlocks.join(', ')}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
