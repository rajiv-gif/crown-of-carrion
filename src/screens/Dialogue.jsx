import React, { useEffect } from 'react';
import { useGame } from '../App.jsx';
import { SCRIPTS, SPEAKERS } from '../data/story.js';
import Cocoli from '../components/Cocoli.jsx';
import Silhouette from '../components/Silhouettes.jsx';
import { speakLine, stopVoice } from '../voice.js';
import { unitArt } from '../data/unitArt.js';
import lucianPortrait from '../assets/portrait-lucian.jpg';
import sjenPortrait from '../assets/portrait-sjen.jpg';
import veatoPortrait from '../assets/portrait-veato.jpg';
import chibiPortrait from '../assets/portrait-chibi.jpg';
import chanPortrait from '../assets/portrait-chan.jpg';
import chanWagon from '../assets/dialogue-chan-wagon.png';

const SCENE_BY_SCRIPT = {
  intro: 'chapel',
  butchers_debt: 'marrowfen',
  ashen_tithe: 'ashroad',
  saint_without_face: 'cindershrive',
};

const PORTRAITS = {
  Lucian: 'lucian',
  Sjen: 'sjen',
  Veato: 'veato',
  Chan: 'chan_broker',
  Chibi: 'chibi',
  'The Envoy': 'villager',
  'Elder of Marrowfen': 'villager',
  'The Debt-Bound Knight': 'knight',
};

const IMAGE_PORTRAITS = {
  Lucian: lucianPortrait,
  Sjen: sjenPortrait,
  Veato: veatoPortrait,
  Chibi: chibiPortrait,
  Chan: chanPortrait,
};

const CHAN_WAGON_NODES = new Set(['a2', 'a3', 'a4', 'a5']);

function formatDialogueLine(speaker, text) {
  if (speaker !== 'Sjen') return text;
  return /^Hm\.{2,3}/i.test(text) ? text : `Hm... ${text}`;
}

export default function Dialogue() {
  const { g, dispatch } = useGame();
  const script = SCRIPTS[g.scriptId];
  const node = script?.nodes[g.nodeId];
  if (!node) return null;

  const sp = SPEAKERS[node.speaker] || { color: 'var(--bone)', sigil: '·' };
  const isNarrator = node.speaker === 'narrator';
  const scene = SCENE_BY_SCRIPT[g.scriptId] || 'ashroad';
  const portrait = PORTRAITS[node.speaker];
  const imagePortrait = IMAGE_PORTRAITS[node.speaker] || unitArt(portrait);
  const showPortrait = !isNarrator && (imagePortrait || portrait || node.speaker === 'Cocoli');
  const dialogueText = formatDialogueLine(node.speaker, node.text);
  const showChanWagon = g.scriptId === 'ashen_tithe' && CHAN_WAGON_NODES.has(g.nodeId);

  useEffect(() => {
    speakLine(node.speaker, dialogueText);
    return () => stopVoice();
  }, [g.nodeId, node.speaker, dialogueText]);

  const onContinue = () => {
    stopVoice();
    if (node.action) {
      if (node.action.combat) {
        dispatch({ type: 'START_COMBAT', encounterId: node.action.combat, then: node.action.then });
      } else if (node.action.map) {
        dispatch({ type: 'TO_MAP' });
      } else if (node.action.aftermath) {
        dispatch({ type: 'AFTERMATH' });
      } else if (node.action.missionDone) {
        dispatch({ type: 'MISSION_DONE', mission: node.action.missionDone });
      }
    } else if (node.next) {
      dispatch({ type: 'GOTO_NODE', node: node.next });
    }
  };

  return (
    <div
      className={`screen dialogue-screen scene-${scene} ${showChanWagon ? 'scene-chan-wagon' : ''}`}
      style={showChanWagon ? { '--dialogue-scene-image': `url(${chanWagon})` } : undefined}
    >
      <div className={`dialogue-panel panel ${showPortrait ? 'with-portrait' : 'narrator-panel'}`} key={g.nodeId}>
        {showPortrait && (
          <aside className="dialogue-portrait" style={{ '--portrait-color': sp.color }}>
            <div className="portrait-glow" />
            {imagePortrait ? (
              <img
                className={`dialogue-portrait-img ${node.speaker === 'Chan' ? 'portrait-chan' : ''}`}
                src={imagePortrait}
                alt={`${node.speaker} portrait`}
              />
            ) : node.speaker === 'Cocoli' ? (
              <Cocoli />
            ) : (
              <Silhouette name={portrait} />
            )}
            <div className="portrait-name">{node.speaker}</div>
          </aside>
        )}
        <div className="dialogue-copy">
          {!isNarrator && (
            <div className="speaker" style={{ color: sp.color }}>
              <span className="speaker-sigil">{sp.sigil}</span> {node.speaker}
            </div>
          )}
          <p className={`dialogue-text ${isNarrator ? 'narration' : ''}`}>{dialogueText}</p>

          {node.choices ? (
            <div className="choices">
              {node.choices.map((c, i) => {
                // Tension-locked choices: companions stop offering their plans
                // to a captain they are this close to knifing.
                const locked = c.lock && g.tension[c.lock.pair] >= c.lock.max;
                return (
                  <button
                    key={i}
                    className={`choice-btn ${locked ? 'locked' : ''}`}
                    disabled={locked}
                    onClick={() => {
                      stopVoice();
                      dispatch({ type: 'CHOOSE', effects: c.effects, next: c.next });
                    }}
                  >
                    <span className="choice-num">{['I', 'II', 'III', 'IV', 'V'][i]}.</span> {c.text}
                    {locked && <span className="lock-note">{c.lock.note}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <button className="btn continue-btn" onClick={onContinue}>
              {node.action?.combat ? '⚔ Steel out' : node.action?.aftermath || node.action?.missionDone ? 'Close the entry' : 'Continue ›'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
