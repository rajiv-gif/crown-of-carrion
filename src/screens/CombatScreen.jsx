import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../App.jsx';
import { createCombat, playerAct, autoAct, currentUnit, ABILITIES, usePoultice } from '../combat/engine.js';
import Battlefield from '../components/Battlefield.jsx';
import { TENSION_PAIRS } from '../data/story.js';
import { tensionTier } from '../data/sins.js';

export default function CombatScreen() {
  const { g, dispatch } = useGame();
  const [c, setC] = useState(() => createCombat(g));
  const [fx, setFx] = useState([]); // engine events currently animating
  const [sel, setSel] = useState(null); // ability awaiting a target
  const seen = useRef(c.events.length); // skip animating setup events
  const logRef = useRef(null);

  // Fold a new engine state in and stage its fresh events for animation.
  const apply = (next) => {
    const fresh = next.events.slice(seen.current);
    seen.current = next.events.length;
    setC(next);
    if (fresh.length) {
      setFx((f) => [...f, ...fresh]);
      const ids = new Set(fresh.map((e) => e.id));
      setTimeout(() => setFx((f) => f.filter((x) => !ids.has(x.id))), 1500);
    }
  };

  const cur = currentUnit(c);
  const playerTurn = !c.over && !c.auto && cur && cur.side === 'party';

  // Auto turns: enemies, the Wretch, and sabotaging companions. Slightly
  // slower than before so each action's animation can be read.
  useEffect(() => {
    if (!c.over && c.auto) {
      const t = setTimeout(() => apply(autoAct(c)), 1150);
      return () => clearTimeout(t);
    }
  }, [c]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [c.log.length]);

  const act = (abilityId, targetUid) => {
    setSel(null);
    apply(abilityId === 'poultice' ? usePoultice(c, targetUid) : playerAct(c, abilityId, targetUid));
  };

  const onAbility = (id) => {
    if (id === 'poultice') {
      setSel(sel === id ? null : id);
      return;
    }
    const A = ABILITIES[id];
    if (A.target === 'enemy' || A.target === 'ally') setSel(sel === id ? null : id);
    else if (A.target === 'self') act(id, cur.uid);
    else act(id, null);
  };

  const selTarget = sel === 'poultice' ? 'ally' : sel ? ABILITIES[sel].target : null;
  const isTargetable = (u) =>
    !!(
      playerTurn &&
      sel &&
      u.alive &&
      ((selTarget === 'enemy' && u.side === 'enemy') || (selTarget === 'ally' && u.side === 'party'))
    );

  const finish = () =>
    dispatch({
      type: 'COMBAT_END',
      result: c.over,
      skim: c.skim,
      bonusGold: c.bonusGold,
      tensionDelta: c.tensionDelta,
      corruptionDelta: c.corruptionDelta,
    });

  return (
    <div className="screen combat-screen">
      <div className="combat-header">
        <span className="combat-name">{c.name}</span>
        <div className="mini-tension" title="Party tension — at 65+ they sabotage, at 90+ the knives come out">
          {Object.entries(TENSION_PAIRS).map(([k, v]) => (
            <div key={k} className="mini-bar" title={`${v.label}: ${c.tension[k]}`}>
              <span className="mini-label">
                {v.label.replace('Lucian', 'L').replace('Sjen', 'S').replace('Veato', 'V').replace(' ⟷ ', '·')}
              </span>
              <div className={`meter mini tier-${tensionTier(c.tension[k])}`}>
                <div className="meter-fill" style={{ width: `${c.tension[k]}%` }} />
              </div>
            </div>
          ))}
        </div>
        <span className="combat-round">Round {c.round}</span>
      </div>

      <Battlefield c={c} fx={fx} cur={cur} isTargetable={isTargetable} onTarget={(uid) => act(sel, uid)} />

      <div className="combat-bottom">
        <div className="control-zone">
          <div className="rank-divider">
            {playerTurn && !sel && cur && (
              <span className="turn-banner" style={{ color: cur.color }}>
                {cur.name} acts — choose an ability
              </span>
            )}
            {playerTurn && sel && (
              <span className="turn-banner targeting">
                {sel === 'poultice' ? 'Black Poultice' : ABILITIES[sel].name}: choose a {selTarget === 'enemy' ? 'victim' : 'recipient'}
              </span>
            )}
            {!c.over && c.auto === 'enemy' && <span className="turn-banner dim-text">{cur?.name} moves…</span>}
            {!c.over && c.auto === 'sabotage' && (
              <span className="turn-banner blood-text">{cur?.name} ignores the chain of command…</span>
            )}
            {!c.over && c.auto === 'wretch' && <span className="turn-banner dim-text">The Wretch gnaws…</span>}
            {c.over && <span className="turn-banner dim-text">The ledger closes…</span>}
          </div>
          {playerTurn && (
            <div className="ability-bar">
              {cur.abilities.map((id) => {
                const A = ABILITIES[id];
                const cd = cur.cooldowns[id] || 0;
                return (
                  <button
                    key={id}
                    className={`ability-btn ${sel === id ? 'selected' : ''}`}
                    disabled={cd > 0}
                    title={A.desc}
                    onClick={() => onAbility(id)}
                  >
                    <span className="ability-name">{A.name}</span>
                    <span className="ability-meta">{cd > 0 ? `cooling ${cd}` : A.desc}</span>
                  </button>
                );
              })}
              <button
                className="ability-btn"
                title={ABILITIES.wait_power.desc}
                onClick={() => onAbility('wait_power')}
              >
                <span className="ability-name">{ABILITIES.wait_power.name}</span>
                <span className="ability-meta">{ABILITIES.wait_power.desc}</span>
              </button>
              <button
                className={`ability-btn poultice ${sel === 'poultice' ? 'selected' : ''}`}
                disabled={c.poultices <= 0}
                title="Heals 30% max HP. Costs +2 corruption. Limited per mission."
                onClick={() => onAbility('poultice')}
              >
                <span className="ability-name">Black Poultice x{c.poultices}</span>
                <span className="ability-meta">Heal 30% max HP · +2 corruption</span>
              </button>
            </div>
          )}
        </div>

        <aside className="combat-log panel" ref={logRef}>
          {c.log.map((l) => (
            <div key={l.id} className={`log-line log-${l.kind}`}>
              {l.text}
            </div>
          ))}
        </aside>
      </div>

      {c.over && (
        <div className="overlay">
          <div className={`overlay-card panel ${c.over}`}>
            <h2 className="overlay-title">{c.over === 'victory' ? '✠ THE FIELD IS YOURS' : '✝ LUCIAN FALLS'}</h2>
            <p className="overlay-text">
              {c.over === 'victory'
                ? 'The crows arrive before the silence does. The Black Tithe collects.'
                : 'Blood in the mud. Rage in the mouth. And then — a whiteness with no walls.'}
            </p>
            {c.over === 'victory' && c.skim > 0 && (
              <p className="overlay-skim">
                <span className="coin-flicker">⟡</span> The take is lighter than it should be. Sjen, watching Veato:
                “Your hands move faster near corpses than enemies.”
              </p>
            )}
            <button className="btn btn-blood" onClick={finish}>
              {c.over === 'victory' ? 'Strip the dead' : 'Go where the dead go'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
