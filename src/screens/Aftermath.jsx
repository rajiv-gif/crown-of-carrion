import React from 'react';
import { useGame } from '../App.jsx';
import { AFTERMATH_REACTIONS, WHISPERS, FACTIONS, TENSION_PAIRS } from '../data/story.js';

export default function Aftermath() {
  const { g, dispatch } = useGame();
  const r = AFTERMATH_REACTIONS[g.flags.choice] || AFTERMATH_REACTIONS.slaughter;

  return (
    <div className="screen aftermath-screen">
      <div className="panel aftermath-panel">
        <div className="title-rule dim">— entry closed —</div>
        <h2 className="aftermath-title">THE BUTCHER’S DEBT: {r.title}</h2>
        <p className="aftermath-summary">{r.summary}</p>

        <div className="aftermath-reactions">
          <p className="reaction sjen-text">{r.sjen}</p>
          <p className="reaction veato-text">{r.veato}</p>
        </div>

        {g.flags.veato_deal && (
          <p className="secret-line">
            Somewhere down the road, a rider carries word of the Black Tithe’s route to a buyer
            whose name Veato did not share. He was paid for that too.
          </p>
        )}
        {g.flags.sjen_pact && (
          <p className="secret-line">
            At night, Sjen sleeps facing the saint’s reliquary, lips moving. He has not shared the
            second name. He is saving it for something.
          </p>
        )}
        {g.deaths > 0 && (
          <p className="secret-line pale-text">
            And somewhere outside the world, something pale watched Lucian die {g.deaths === 1 ? 'once' : `${g.deaths} times`} — and sent him
            back without explaining why.
          </p>
        )}

        <div className="whisper-block">
          <div className="whisper-label">THE CROWN WHISPERS</div>
          <p className="whisper-text">“{WHISPERS[0]}”</p>
        </div>

        <div className="ledger-grid">
          <div className="ledger-cell">
            <span className="ledger-num gold-text">{g.gold}</span> gold
          </div>
          <div className="ledger-cell">
            <span className="ledger-num blood-text">{g.corruption}</span> corruption
          </div>
          <div className="ledger-cell">
            <span className="ledger-num hex-text">{g.shards}</span>/7 slivers
          </div>
          <div className="ledger-cell">
            <span className="ledger-num">{g.level}</span> level
          </div>
        </div>

        <div className="ledger-grid small">
          {Object.entries(FACTIONS).map(([k, f]) => (
            <div key={k} className="ledger-cell">
              <span className={`ledger-num ${g.reputation[k] < 0 ? 'blood-text' : g.reputation[k] > 0 ? 'gold-text' : ''}`}>
                {g.reputation[k] > 0 ? '+' : ''}
                {g.reputation[k]}
              </span>
              {f.name}
            </div>
          ))}
          {Object.entries(TENSION_PAIRS).map(([k, v]) => (
            <div key={k} className="ledger-cell">
              <span className={`ledger-num ${g.tension[k] >= 70 ? 'blood-text' : ''}`}>{g.tension[k]}</span>
              {v.label}
            </div>
          ))}
        </div>

        <button className="btn btn-blood" onClick={() => dispatch({ type: 'MISSION_DONE', mission: 'butchers_debt' })}>
          Back to the map of Veyrath
        </button>
      </div>
    </div>
  );
}
