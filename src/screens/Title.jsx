import React, { useState } from 'react';
import { useGame } from '../App.jsx';
import { SAVE_KEY, migrateSave } from '../state.js';
import { CHAPTERS, CAMPAIGN_TAGLINE, describeLocation } from '../data/chapters.js';
import { DIFFICULTIES } from '../data/difficulty.js';

function readSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return { save: null, corrupt: false };
  try {
    const save = JSON.parse(raw);
    if (save && save.screen) return { save, corrupt: false };
    return { save: null, corrupt: true };
  } catch {
    return { save: null, corrupt: true };
  }
}

function lastSavedLabel(ts) {
  if (!ts) return 'an unmarked hour';
  const d = new Date(ts);
  const today = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return today ? time : `${d.toLocaleDateString()} ${time}`;
}

export default function Title() {
  const { dispatch } = useGame();
  const [confirmNew, setConfirmNew] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const [difficulty, setDifficulty] = useState('merciless');
  const [, setNonce] = useState(0); // re-read storage after erase

  const { save, corrupt } = readSave();
  const hasSave = !!save;
  // Preview through the same migration the load uses, so old saves show
  // their true (inferred) chapter and campaign state.
  const view = hasSave ? migrateSave(save) : null;
  const chapter = hasSave ? CHAPTERS.find((c) => c.id === view.currentChapter) || CHAPTERS[0] : null;
  const selectedDifficulty = DIFFICULTIES[difficulty];

  const erase = () => {
    localStorage.removeItem(SAVE_KEY);
    setConfirmErase(false);
    setConfirmNew(false);
    setNonce((n) => n + 1);
  };
  const newGame = () => {
    if (hasSave && !confirmNew) {
      setConfirmNew(true);
      setConfirmErase(false);
      return;
    }
    dispatch({ type: 'NEW_GAME', difficulty });
  };

  return (
    <div className="screen title-screen">
      <div className="candle-glow" />
      <div className="title-block">
        <div className="title-rule">⸻ ✠ ⸻</div>
        <h1 className="game-title">
          CROWN<span className="title-of">of</span>CARRION
        </h1>
        <p className="game-subtitle">No heroes. Only the next tyrant.</p>
        <div className="title-rule dim">— the ledger of the Black Tithe —</div>

        {hasSave && (
          <div className="save-preview panel">
            <div className="save-preview-title">
              Chapter {chapter.numeral} — {chapter.name}
            </div>
            <div className="save-preview-loc">{describeLocation(save)}</div>
            <div className="save-preview-stats">
              <span>
                <b className="gold-text">{save.gold ?? 0}</b> gold
              </span>
              <span>
                <b className="blood-text">{save.corruption ?? 0}</b> corruption
              </span>
              <span>
                <b className="hex-text">{save.shards ?? 0}</b>/7 slivers
              </span>
              <span>
                <b className="pale-text">{save.deaths ?? 0}</b> returned by Cocoli
              </span>
            </div>
            <div className="save-preview-time">Last entry: {lastSavedLabel(save.lastSavedAt)}</div>
          </div>
        )}
        {corrupt && (
          <div className="save-preview panel">
            <div className="save-preview-loc blood-text">
              The ledger here is illegible — water, or blood, or worse. It cannot be resumed.
            </div>
          </div>
        )}

        <div className="difficulty-picker">
          {Object.values(DIFFICULTIES).map((d) => (
            <button
              key={d.id}
              className={`difficulty-choice ${difficulty === d.id ? 'selected' : ''} ${d.recommended ? 'recommended' : ''}`}
              onClick={() => setDifficulty(d.id)}
              type="button"
            >
              <span className="difficulty-name">{d.name}</span>
              <span className="difficulty-desc">{d.desc}</span>
            </button>
          ))}
        </div>
        <div className="opening-contract panel">
          <div className="opening-contract-head">
            <span>Opening threat: <b>{selectedDifficulty.threat}</b></span>
            <span>Level 1: <b>Unproven</b></span>
          </div>
          <div className="opening-contract-facts">
            {selectedDifficulty.opening.map((fact) => <span key={fact}>{fact}</span>)}
          </div>
          <p>
            The company begins deliberately incomplete. Level 2 chooses each core character’s specialization;
            Level 3 chooses a method; Level 4 earns a capstone. Later levels add health and damage, not more buttons.
            No character carries more than four active skills.
          </p>
        </div>

        {!confirmNew && !confirmErase && (
          <div className="title-actions">
            {hasSave && (
              <button className="btn btn-blood" onClick={() => dispatch({ type: 'LOAD', save })}>
                Resume the Debt
              </button>
            )}
            <button className={`btn ${hasSave ? '' : 'btn-blood'}`} onClick={newGame}>
              {hasSave ? 'New Game' : 'Open the Ledger'}
            </button>
            {(hasSave || corrupt) && (
              <button className="btn btn-erase" onClick={() => setConfirmErase(true)}>
                Erase the Ledger
              </button>
            )}
          </div>
        )}

        {confirmNew && (
          <div className="title-confirm">
            <p className="confirm-text">This will bury the current debt and begin again. Continue?</p>
            <div className="title-actions">
              <button className="btn btn-blood" onClick={() => dispatch({ type: 'NEW_GAME', difficulty })}>
                Bury it
              </button>
              <button className="btn" onClick={() => setConfirmNew(false)}>
                Keep the debt
              </button>
            </div>
          </div>
        )}

        {confirmErase && (
          <div className="title-confirm">
            <p className="confirm-text">
              The ledger will be burned. Every debt, scar, and return — forgotten. Nothing comes back from that.
              Not even through her.
            </p>
            <div className="title-actions">
              <button className="btn btn-erase" onClick={erase}>
                Burn it forever
              </button>
              <button className="btn" onClick={() => setConfirmErase(false)}>
                Keep it
              </button>
            </div>
          </div>
        )}

        <p className="title-campaign">{CAMPAIGN_TAGLINE}</p>
        <p className="title-warning">You will not save this world. You will become the worst thing in it.</p>
      </div>
    </div>
  );
}
