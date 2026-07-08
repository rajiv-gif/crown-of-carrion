import React from 'react';
import { useGame } from '../App.jsx';
import { ENEMIES } from '../data/units.js';
import { BATTLEFIELDS } from '../data/battlefields.js';

const TAG_LABEL = { buff: '▲ Favour', debuff: '▼ Curse', mixed: '◆ Mixed' };
const TAG_CLASS = { buff: 'sk-buff', debuff: 'sk-risk', mixed: 'sk-mixed' };
const OMEN_TAG_LABEL = { buff: '▲ Enemy Buff', debuff: '▼ Enemy Curse' };
const OMEN_TAG_CLASS = { buff: 'sk-risk', debuff: 'sk-buff' };

export default function SkirmishSetup() {
  const { g, dispatch } = useGame();
  const cfg = g.skirmishConfig;
  if (!cfg) return null;

  const field = BATTLEFIELDS[cfg.fieldId] || {};
  const card = cfg.partyCard;
  const omen = cfg.omen;

  return (
    <div className="screen skirmish-screen">
      <div className="sk-head">
        <h1 className="sk-title">BLOOD DICE</h1>
        <p className="sk-sub">
          No contract. No choice. The dice have already spoken for both sides.
        </p>
      </div>

      <div className="sk-cols">
        {/* Left: battlefield + enemies */}
        <section className="panel sk-panel">
          <h3 className="panel-title">THE FIELD</h3>
          <div className="sk-field-name">{field.name || cfg.fieldId}</div>
          {field.rules?.length > 0 && (
            <ul className="sk-rules">
              {field.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}

          <h3 className="panel-title" style={{ marginTop: '18px' }}>ENEMIES ROLLED</h3>
          <ul className="sk-enemy-list">
            {cfg.enemies.map((ek, i) => {
              const e = ENEMIES[ek];
              return (
                <li key={i} className="sk-enemy-row">
                  <span className="sk-enemy-sigil">{e?.sigil || '✕'}</span>
                  <span>{e?.name || ek}</span>
                  {e?.transform && (
                    <span className="sk-transform-tag">{'→'} transforms</span>
                  )}
                </li>
              );
            })}
          </ul>

          <h3 className="panel-title" style={{ marginTop: '18px' }}>ENEMY FATE</h3>
          <div className={`sk-omen-card ${omen.tag === 'debuff' ? 'sk-omen-good' : ''}`}>
            {omen.tag && (
              <div className={`sk-card-tag ${OMEN_TAG_CLASS[omen.tag] || 'sk-risk'}`}>
                {OMEN_TAG_LABEL[omen.tag] || '▲ Enemy Buff'}
              </div>
            )}
            <div className="sk-omen-name">{omen.name}</div>
            <div className="sk-omen-effect">{omen.effect}</div>
          </div>
        </section>

        {/* Right: party fate */}
        <section className="panel sk-panel">
          <h3 className="panel-title">YOUR FATE — THE DICE HAVE SPOKEN</h3>
          <p className="sk-card-hint">
            Fortune rolled once. You carry whatever it gave you into the slaughter.
          </p>

          {card && (
            <div className={`sk-fate-card ${TAG_CLASS[card.tag] || ''}`}>
              <div className={`sk-card-tag ${TAG_CLASS[card.tag] || ''}`}>
                {TAG_LABEL[card.tag] || card.tag}
              </div>
              <div className="sk-card-name">{card.name}</div>
              <div className="sk-card-effect">{card.effect}</div>
            </div>
          )}

          <button
            className="btn btn-blood sk-enter-btn"
            onClick={() => dispatch({ type: 'ENTER_SKIRMISH' })}
          >
            {'✠'} Enter the Slaughter
          </button>

          <button
            className="btn sk-back-btn"
            onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'map' })}
          >
            Leave the field {'—'} return to the ledger
          </button>
        </section>
      </div>
    </div>
  );
}
