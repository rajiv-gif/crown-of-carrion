import React from 'react';
import { useGame } from '../App.jsx';
import { CHAPTERS } from '../data/chapters.js';

export default function Hud() {
  const { g } = useGame();
  const ch = CHAPTERS.find((c) => c.id === g.currentChapter) || CHAPTERS[0];
  return (
    <header className="hud">
      <div className="hud-title">
        CROWN OF CARRION <span className="hud-chapter">· Chapter {ch.numeral}</span>
      </div>
      <div className="hud-stats">
        <span className="hud-stat" title="Gold">
          <b className="gold-text">{g.gold}</b> gold
        </span>
        <span className="hud-stat" title="Corruption — what the Crown has already taken">
          <b className="blood-text">{g.corruption}</b> corruption
        </span>
        <span className="hud-stat" title="Slivers of the Carrion Crown">
          <b className="hex-text">{g.shards}</b>/7 slivers
        </span>
        <span className="hud-stat" title="The Black Tithe's strength">
          level <b>{g.level}</b>
        </span>
        {g.deaths > 0 && (
          <span className="hud-stat" title="Times returned from The White Silence">
            <b className="pale-text">{g.deaths}</b> {g.deaths === 1 ? 'return' : 'returns'}
          </span>
        )}
        {Object.values(g.tension).some((t) => t >= 90) && (
          <span className="hud-stat knife-edge" title="Someone in the party is one bad order from murder">
            ⚠ knife’s edge
          </span>
        )}
      </div>
    </header>
  );
}
