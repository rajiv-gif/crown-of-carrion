import React, { useEffect } from 'react';
import { useGame } from '../App.jsx';
import { COCOLI_LINES, SCARS } from '../data/story.js';
import Cocoli from '../components/Cocoli.jsx';
import { speakLine, stopVoice } from '../voice.js';

export default function WhiteSilence() {
  const { g, dispatch } = useGame();
  const line = COCOLI_LINES[Math.min(g.deaths - 1, COCOLI_LINES.length - 1)];
  const scar = SCARS[Math.min(g.deaths - 1, SCARS.length - 1)];
  const already = g.scars.some((sc) => sc.id === scar.id);

  useEffect(() => {
    const t = setTimeout(() => speakLine('Cocoli', line), 1200);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, [line]);

  const revive = (choice) => {
    stopVoice();
    dispatch({ type: 'REVIVE', choice });
  };

  return (
    <div className="screen silence-screen">
      <div className="silence-inner">
        <p className="silence-narration fade-1">
          There is no ground here, and no sky, and no difference between them. The White Silence.
          The place between the wound and the grave. Something is already watching. Something was
          always already watching.
        </p>
        <div className="cocoli-presence fade-2">
          <Cocoli />
          <div className="cocoli-name">COCOLI</div>
          <div className="cocoli-epithet">the last good god, who watches</div>
        </div>
        <p className="cocoli-line fade-3">“{line}”</p>
        <p className="silence-consequence fade-4">
          {already ? (
            <>
              The Silence keeps another piece of him as toll. <b>+13 corruption.</b>
            </>
          ) : (
            <>
              He returns marked: <b className="scar-name">{scar.name}</b> — {scar.desc}{' '}
              <span className="dim-text">+5 corruption. Sjen and Veato saw him die. They will not forget it, or forgive that he didn’t stay dead.</span>
            </>
          )}
        </p>
        <div className="silence-choices fade-5">
          <button className="btn btn-pale" onClick={() => revive('return')}>
            Return marked
            <span>Take the scar. Pay the usual corruption.</span>
          </button>
          <button className="btn btn-pale" onClick={() => revive('forget')}>
            Make them forget
            <span>Ease party tension. Pay extra corruption. See more of what she is.</span>
          </button>
          <button className="btn btn-pale" onClick={() => revive('vengeance')}>
            Return with teeth
            <span>Next attempt starts with Lucian empowered and enemies afraid. Pay dearly.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
