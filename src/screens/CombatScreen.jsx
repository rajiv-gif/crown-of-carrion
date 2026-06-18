import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../App.jsx';
import { playCombatEvents, playSound } from '../audio.js';
import {
  createCombat,
  playerAct,
  autoAct,
  currentUnit,
  ABILITIES,
  usePoultice,
  cocoliBargain,
  reachableFor,
  playerMove,
  attackReachable,
} from '../combat/engine.js';
import Battlefield from '../components/Battlefield.jsx';
import { ITEMS, TENSION_PAIRS } from '../data/story.js';
import { tensionTier } from '../data/sins.js';

export default function CombatScreen() {
  const { g, dispatch } = useGame();
  const [c, setC] = useState(() => createCombat(g));
  const [fx, setFx] = useState([]); // engine events currently animating
  const [sel, setSel] = useState(null); // ability awaiting a target
  const seen = useRef(c.events.length); // skip animating setup events
  const logRef = useRef(null);
  const endSound = useRef(null);

  // Fold a new engine state in and stage its fresh events for animation.
  const apply = (next) => {
    const fresh = next.events.slice(seen.current);
    seen.current = next.events.length;
    setC(next);
    if (fresh.length) {
      playCombatEvents(fresh);
      setFx((f) => [...f, ...fresh]);
      const ids = new Set(fresh.map((e) => e.id));
      setTimeout(() => setFx((f) => f.filter((x) => !ids.has(x.id))), 1500);
    }
  };

  const cur = currentUnit(c);
  const playerTurn = !c.over && !c.auto && cur && cur.side === 'party';
  const canBargain =
    playerTurn &&
    !c.cocoliBargainUsed &&
    (c.round >= 2 || c.units.some((u) => u.alive && u.side === 'party' && u.hp <= u.maxHp * 0.45));

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

  useEffect(() => {
    if (c.over && endSound.current !== c.over) {
      endSound.current = c.over;
      playSound(c.over === 'victory' ? 'victory' : 'defeat');
      if (c.over === 'victory' && (c.bonusGold > 0 || c.bonusXp > 0 || c.lootItem)) {
        setTimeout(() => playSound('reward'), 360);
      }
    }
  }, [c.over, c.bonusGold, c.bonusXp, c.lootItem]);

  // Move-then-act, but forgiving: reachable tiles show while no ability is
  // selected. Selecting one hides them to show targets; cancelling
  // (deselecting) before you strike brings movement back. Committing a strike
  // ends the turn, so you still can never move after acting.
  const moveTiles = playerTurn && !sel ? reachableFor(c) : [];
  const onMove = (x, y) => {
    apply(playerMove(c, x, y));
  };

  const act = (abilityId, targetUid) => {
    setSel(null);
    apply(abilityId === 'poultice' ? usePoultice(c, targetUid) : playerAct(c, abilityId, targetUid));
  };
  const bargain = (kind) => {
    setSel(null);
    apply(cocoliBargain(c, kind));
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
  const isTargetable = (u) => {
    if (!playerTurn || !sel || !u.alive) return false;
    const sideOk =
      (selTarget === 'enemy' && u.side === 'enemy') || (selTarget === 'ally' && u.side === 'party');
    if (!sideOk) return false;
    // Poultice and ally buffs reach anywhere; offensive abilities need range.
    return sel === 'poultice' ? true : attackReachable(c, sel, u);
  };
  const anyTarget = !!sel && c.units.some((u) => isTargetable(u));

  const finish = () =>
    dispatch({
      type: 'COMBAT_END',
      result: c.over,
      skim: c.skim,
      bonusGold: c.bonusGold,
      bonusXp: c.bonusXp,
      lootItem: c.lootItem,
      cocoliDebtsDelta: c.cocoliDebtsDelta,
      cocoliObjective: c.cocoliObjective,
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

      <Battlefield
        c={c}
        fx={fx}
        cur={cur}
        isTargetable={isTargetable}
        onTarget={(uid) => act(sel, uid)}
        moveTiles={moveTiles}
        onMove={onMove}
      />

      <div className="combat-bottom">
        <div className="control-zone">
          <div className="rank-divider">
            {playerTurn && !sel && cur && (
              <span className="turn-banner" style={{ color: cur.color }}>
                {cur.name} — {moveTiles.length ? 'step to a marked tile, or ' : ''}choose an ability
                {moveTiles.some((t) => t.provokes) && (
                  <em className="provoke-hint"> — red tiles draw an opportunity attack</em>
                )}
              </span>
            )}
            {playerTurn && sel && (
              <span className="turn-banner targeting">
                {sel === 'poultice' ? 'Black Poultice' : ABILITIES[sel].name}:{' '}
                {anyTarget
                  ? `choose a ${selTarget === 'enemy' ? 'victim' : 'recipient'} in range`
                  : 'no target in range — cancel (pick the ability again) to move or choose another action'}
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
              {canBargain && (
                <div className="cocoli-bargain">
                  <div className="cocoli-bargain-copy">
                    <b>Cocoli leans close.</b>
                    <span>One bargain. One debt. Choose before she gets bored.</span>
                  </div>
                  <button className="ability-btn cocoli-offer" title="Heal all allies. +6 corruption, tension rises." onClick={() => bargain('mercy')}>
                    <span className="ability-name">Mercy</span>
                    <span className="ability-meta">Heal the company · +6 corruption</span>
                  </button>
                  <button className="ability-btn cocoli-offer" title="Damage and frighten all enemies. +8 corruption." onClick={() => bargain('teeth')}>
                    <span className="ability-name">Teeth</span>
                    <span className="ability-meta">Bite every enemy · +8 corruption</span>
                  </button>
                  <button className="ability-btn cocoli-offer" title="Reset ally cooldowns and grant Focus. +5 corruption, tension rises." onClick={() => bargain('hour')}>
                    <span className="ability-name">Still Hour</span>
                    <span className="ability-meta">Reset cooldowns · Focus</span>
                  </button>
                </div>
              )}
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
            {c.over === 'victory' && (c.bonusGold > 0 || c.bonusXp > 0 || c.lootItem || c.preventedAscensions > 0) && (
              <div className="overlay-rewards">
                {c.preventedAscensions > 0 && (
                  <div className="reward-line">
                    <span>Ascensions denied</span>
                    <strong>{c.preventedAscensions}</strong>
                  </div>
                )}
                {c.bonusGold > 0 && (
                  <div className="reward-line">
                    <span>Bonus gold</span>
                    <strong>+{c.bonusGold}</strong>
                  </div>
                )}
                {c.bonusXp > 0 && (
                  <div className="reward-line">
                    <span>Bonus XP</span>
                    <strong>+{c.bonusXp}</strong>
                  </div>
                )}
                {c.lootItem && ITEMS[c.lootItem] && (
                  <div className="reward-line rare">
                    <span>Rare relic</span>
                    <strong>{ITEMS[c.lootItem].name}</strong>
                  </div>
                )}
                {c.cocoliObjective && (
                  <div className="reward-line cocoli">
                    <span>Cocoli’s private objective</span>
                    <strong>fulfilled</strong>
                  </div>
                )}
              </div>
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
