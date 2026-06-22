import React from 'react';
import { useGame } from '../App.jsx';
import { PARTY } from '../data/units.js';
import {
  PROGRESSION,
  availableTalents,
  branchName,
  ownedTalents,
  progressionAbilities,
  talentNode,
} from '../data/progression.js';
import { ABILITIES } from '../combat/engine.js';

const COPY = {
  lucian: 'Choose what kind of leader survives Veyrath.',
  sjen: 'Choose which forbidden method becomes habit.',
  veato: 'Choose the distance at which Veato becomes dangerous.',
};

export default function Ascension() {
  const { g, dispatch } = useGame();
  const char = g.pendingAscension[0];
  if (!char) return null;
  const party = PARTY[char];
  const owned = ownedTalents(g, char);
  const choices = availableTalents(g, char);
  const tree = PROGRESSION[char];
  const loadout = progressionAbilities(g, char);
  const branch = branchName(char, g);

  return (
    <div className="screen ascension-screen">
      <div className="panel ascension-panel talent-panel" key={`${char}-${owned.length}`}>
        <div className="title-rule dim">— level {g.level} · specialization point —</div>
        <div className="ascension-head">
          <span className="ascension-sigil" style={{ color: party.color }}>{party.sigil}</span>
          <div>
            <h2 className="ascension-title">{party.name}: {branch}</h2>
            <p className="ascension-sub">{COPY[char]}</p>
          </div>
        </div>

        <div className="talent-summary">
          <div>
            <span className="talent-label">Current loadout</span>
            <strong>{loadout.map((id) => ABILITIES[id]?.name).filter(Boolean).join(' · ')}</strong>
          </div>
          <div>
            <span className="talent-label">Active limit</span>
            <strong>{loadout.length}/4</strong>
          </div>
          <div>
            <span className="talent-label">Progress</span>
            <strong>{owned.length}/3 nodes</strong>
          </div>
        </div>

        <div className="talent-tree">
          {[1, 2, 3].map((tier) => (
            <section className="talent-tier" key={tier}>
              <div className="talent-tier-label">
                <span>Tier {tier}</span>
                <small>{tier === 1 ? 'Specialization' : tier === 2 ? 'Method' : 'Capstone'}</small>
              </div>
              <div className="talent-tier-nodes">
                {tree.nodes.filter((n) => n.tier === tier).map((n) => {
                  const learned = owned.includes(n.id);
                  const available = choices.some((x) => x.id === n.id);
                  const locked = !learned && !available;
                  return (
                    <button
                      key={n.id}
                      className={`talent-node ${learned ? 'learned' : ''} ${available ? 'available' : ''}`}
                      disabled={!available}
                      onClick={() => dispatch({ type: 'LEARN_TALENT', char, talent: n.id })}
                    >
                      <span className="talent-node-state">{learned ? 'Learned' : locked ? 'Locked' : 'Choose'}</span>
                      <span className="talent-node-name">{n.name}</span>
                      <span className="talent-node-desc">{n.desc}</span>
                      <span className="talent-node-reward">{n.reward}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {choices.length === 0 && (
          <button
            className="btn btn-blood"
            onClick={() => dispatch({ type: 'COMPLETE_ASCENSION' })}
          >
            Branch complete — continue
          </button>
        )}
      </div>
    </div>
  );
}
