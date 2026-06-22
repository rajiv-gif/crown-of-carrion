import React, { useRef, useState } from 'react';
import Battlefield from '../components/Battlefield.jsx';
import { ABILITIES } from '../combat/engine.js';

// A standalone animation previewer, reached at ?lab — no combat, no save.
// It reuses the real Battlefield/BattleUnit, so what you see here is exactly
// what plays in a fight. Buttons are derived from ABILITIES, so new skills
// show up automatically. Edit keyframes in styles.css and they hot-reload.

const base = (o) => ({ statuses: [], alive: true, boss: false, fled: false, ...o });
const ATTACKER = base({ uid: 'lab-attacker', side: 'party', key: 'lucian', name: 'Lucian', sprite: 'lucian', color: 'var(--blood-bright)', hp: 80, maxHp: 104, tile: { x: 2, y: 2 } });
const ALLY = base({ uid: 'lab-ally', side: 'party', key: 'sjen', name: 'Sjen', sprite: 'sjen', color: 'var(--hex)', hp: 44, maxHp: 62, tile: { x: 1, y: 3 } });
const TARGET = base({ uid: 'lab-target', side: 'enemy', key: 'guard', name: 'Plague Guard', sprite: 'guard', color: 'var(--rust)', hp: 30, maxHp: 48, tile: { x: 5, y: 2 } });

// Abilities that should NOT spawn a damage number on the dummy target.
const NON_DAMAGING = new Set([
  'bone_ward', 'smoke_step', 'wait_power', 'blood_command', 'summon_wretch',
  'paid_in_advance', 'rotten_guard', 'compounding_interest', 'cheap_insurance',
  'duo_rite', 'smoke_censer',
]);

export default function AnimationLab() {
  const [fx, setFx] = useState([]);
  const timer = useRef(null);
  const c = { name: 'Animation Lab', round: 1, field: { name: 'Animation Lab', columns: 8, rows: 5, tiles: [], rules: [] }, units: [ALLY, ATTACKER, TARGET] };

  const play = (ability) => {
    clearTimeout(timer.current);
    setFx([]); // clear first so re-clicking the same skill re-fires the CSS animation
    requestAnimationFrame(() => {
      const A = ABILITIES[ability] || {};
      const tgt = A.target === 'self' ? ATTACKER : A.target === 'ally' ? ALLY : TARGET;
      const seed = Date.now();
      const ev = [{ id: seed + 0.1, k: 'cast', actor: ATTACKER.uid, ability, target: tgt.uid }];
      const damages = (A.target === 'enemy' || A.target === 'party') && !NON_DAMAGING.has(ability);
      if (damages) {
        ev.push({ id: seed + 0.2, k: 'hit', unit: TARGET.uid, amount: ability === 'execute' ? 42 : 15, vicious: ability === 'execute', ability });
      }
      setFx(ev);
      timer.current = setTimeout(() => setFx([]), 1700);
    });
  };

  const ids = Object.keys(ABILITIES);

  return (
    <div className="screen lab-screen">
      <div className="lab-head">
        <h2 className="lab-title">⚔ ANIMATION LAB</h2>
        <p className="lab-sub">
          Lucian (center) acts on the Plague Guard (right). Click any skill to play its attack animation —
          no combat, no save. Edit keyframes in <code>src/styles.css</code> and they hot-reload live.
        </p>
      </div>
      <Battlefield c={c} fx={fx} cur={ATTACKER} isTargetable={() => false} onTarget={() => {}} moveTiles={[]} onMove={() => {}} />
      <div className="lab-buttons">
        {ids.map((id) => (
          <button key={id} className="lab-btn" onClick={() => play(id)} title={ABILITIES[id].desc || id}>
            <b>{ABILITIES[id].name}</b>
            <span>{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
