import React from 'react';
import { useGame } from '../App.jsx';
import { CHAPTERS, chapterStatus } from '../data/chapters.js';
import { FACTIONS, AFTERMATH_REACTIONS } from '../data/story.js';
import { PARTY } from '../data/units.js';

// The Campaign Ledger: a cursed record of everything the Black Tithe has
// done, owed, fed, and survived. In-world bookkeeping, not a settings menu.

function loyaltyLine(key, t) {
  const name = key === 'sjen' ? 'Sjen' : 'Veato';
  let word;
  if (t >= 90) word = 'a knife not yet thrown';
  else if (t >= 65) word = key === 'veato' ? 'priced, and the price is falling' : 'brittle';
  else if (t >= 40) word = 'strained';
  else word = 'held — for now';
  return `${name}’s loyalty: ${word}.`;
}

const BARGAIN_LINES = {
  hard: 'Doubled the Baron’s fee at knifepoint of reputation.',
  clean: 'Took Vessik’s contract at the asking price. Uncharacteristic.',
  fear: 'Crushed the envoy’s rotting hand until the price improved.',
};

export default function Ledger() {
  const { g, dispatch } = useGame();
  const choice = g.flags.choice ? AFTERMATH_REACTIONS[g.flags.choice] : null;

  return (
    <div className="screen ledger-screen">
      <div className="panel ledger-main">
        <div className="title-rule dim">— the campaign ledger —</div>
        <h2 className="ledger-title">THE LEDGER REMEMBERS EVERY DEBT</h2>

        <section className="ledger-section">
          <h3 className="panel-title">THE FIVE DEBTS</h3>
          {CHAPTERS.map((ch) => {
            const st = chapterStatus(ch, g);
            return (
              <div key={ch.id} className={`ledger-chapter ${st}`}>
                <span className="lc-numeral">{ch.numeral}</span>
                <span className="lc-name">{ch.name}</span>
                <span className={`lc-status lc-${st}`}>
                  {st === 'complete'
                    ? '✠ Debt paid'
                    : st === 'playable'
                      ? 'Playable now'
                      : st === 'unlocked'
                        ? 'Open — not playable yet'
                        : `Locked — ${ch.requires}`}
                </span>
              </div>
            );
          })}
        </section>

        <section className="ledger-section">
          <h3 className="panel-title">THE ACCOUNT</h3>
          <div className="ledger-grid">
            <div className="ledger-cell"><span className="ledger-num gold-text">{g.gold}</span> gold</div>
            <div className="ledger-cell"><span className="ledger-num blood-text">{g.corruption}</span> corruption</div>
            <div className="ledger-cell"><span className="ledger-num hex-text">{g.shards}</span>/7 crownmetal</div>
            <div className="ledger-cell"><span className="ledger-num pale-text">{g.deaths}</span> returned by Cocoli</div>
          </div>
          {g.crownWhispers > 0 && (
            <p className="ledger-line hex-text">The Crown has whispered {g.crownWhispers === 1 ? 'once' : `${g.crownWhispers} times`}.</p>
          )}
          {g.cocoliOriginFragments > 0 && (
            <p className="ledger-line pale-text">
              Fragments of what she is, glimpsed in dying: {g.cocoliOriginFragments}.
            </p>
          )}
          {(g.cocoliDebts || 0) > 0 && (
            <p className="ledger-line pale-text">Cocoli is owed {g.cocoliDebts === 1 ? 'one private debt' : `${g.cocoliDebts} private debts`}.</p>
          )}
          {g.flags?.cocoli_ascension_objective && (
            <p className="ledger-line hex-text">Cocoli’s ash-road request was fulfilled: you let doctrine bloom and lived.</p>
          )}
          {g.scars.length > 0 && (
            <p className="ledger-line">
              Lucian’s scars: <b className="pale-text">{g.scars.map((s) => s.name).join(', ')}</b>.
            </p>
          )}
          {g.inventory.length > 0 && (
            <p className="ledger-line">
              Carried: <b className="gold-text">{g.inventory.map((i) => i.name).join(', ')}</b>.
            </p>
          )}
        </section>

        <section className="ledger-section">
          <h3 className="panel-title">THE COMPANY</h3>
          <p className="ledger-line">{loyaltyLine('sjen', g.tension.lucian_sjen)}</p>
          <p className="ledger-line">{loyaltyLine('veato', g.tension.lucian_veato)}</p>
          {Object.entries(PARTY).map(([key, p]) => {
            const fed = Object.entries(g.sins[key] || {}).filter(([, r]) => r > 0);
            if (!fed.length) return null;
            return (
              <p key={key} className="ledger-line">
                <span style={{ color: p.color }}>{p.name}</span> has fed:{' '}
                {fed.map(([sin, r]) => `${sin} ${'●'.repeat(r)}`).join(', ')}.
              </p>
            );
          })}
          <p className="ledger-line dim-text">Level {g.level} · the Black Tithe, {g.deaths > 0 ? 'harder to kill than it should be' : 'still breathing'}.</p>
        </section>

        {(g.flags.bargain || choice) && (
          <section className="ledger-section">
            <h3 className="panel-title">WHAT WAS CHOSEN</h3>
            {g.flags.bargain && <p className="ledger-line">{BARGAIN_LINES[g.flags.bargain]}</p>}
            {choice && (
              <p className="ledger-line">
                Marrowfen: <b className="blood-text">{choice.title}</b>.
              </p>
            )}
            {g.flags.sjen_pact && (
              <p className="ledger-line hex-text">Sjen holds a name he has not shared. The ledger heard it anyway.</p>
            )}
            {g.flags.veato_deal && (
              <p className="ledger-line dim-text">Veato sold something on the road. The buyer is not written here.</p>
            )}
          </section>
        )}

        <section className="ledger-section">
          <h3 className="panel-title">STANDING WITH THE POWERS</h3>
          {Object.entries(FACTIONS).map(([k, f]) => (
            <p key={k} className="ledger-line">
              {f.name}:{' '}
              <b className={g.reputation[k] < 0 ? 'blood-text' : g.reputation[k] > 0 ? 'gold-text' : 'dim-text'}>
                {g.reputation[k] > 0 ? '+' : ''}
                {g.reputation[k]}
              </b>
            </p>
          ))}
        </section>

        <button className="btn btn-blood" onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'map' })}>
          Close the ledger
        </button>
      </div>
    </div>
  );
}
