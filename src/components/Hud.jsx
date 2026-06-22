import React, { useEffect, useState } from 'react';
import { useGame } from '../App.jsx';
import { CHAPTERS } from '../data/chapters.js';
import { isSoundMuted, toggleSoundMuted } from '../audio.js';
import { isVoiceMuted, toggleVoiceMuted, voiceSupported } from '../voice.js';

export default function Hud() {
  const { g } = useGame();
  const [muted, setMuted] = useState(isSoundMuted);
  const [voiceMuted, setVoiceMuted] = useState(isVoiceMuted);
  const ch = CHAPTERS.find((c) => c.id === g.currentChapter) || CHAPTERS[0];

  useEffect(() => {
    const onChange = (e) => setMuted(!!e.detail?.muted);
    window.addEventListener('crown-sound-change', onChange);
    return () => window.removeEventListener('crown-sound-change', onChange);
  }, []);

  useEffect(() => {
    const onChange = (e) => setVoiceMuted(!!e.detail?.muted);
    window.addEventListener('crown-voice-change', onChange);
    return () => window.removeEventListener('crown-voice-change', onChange);
  }, []);

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
          level <b>{g.level}</b> · {g.xp}/{g.level * 100} XP
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
        <button
          type="button"
          className={`sound-toggle ${muted ? 'muted' : ''}`}
          title={muted ? 'Sound is muted' : 'Sound is on'}
          aria-label={muted ? 'Turn sound on' : 'Mute sound'}
          onClick={() => setMuted(toggleSoundMuted())}
        >
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
        {voiceSupported() && (
          <button
            type="button"
            className={`sound-toggle ${voiceMuted ? 'muted' : ''}`}
            title={voiceMuted ? 'Voice narration is off' : 'Voice narration is on'}
            aria-label={voiceMuted ? 'Turn voice narration on' : 'Mute voice narration'}
            onClick={() => setVoiceMuted(toggleVoiceMuted())}
          >
            {voiceMuted ? 'VOICE OFF' : 'VOICE ON'}
          </button>
        )}
      </div>
    </header>
  );
}
