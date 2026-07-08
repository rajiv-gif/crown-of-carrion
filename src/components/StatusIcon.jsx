import React from 'react';

// Tiny SVG glyphs for statuses — no emoji, no text-chips. Shield shows
// its remaining value so Bone Ward reads at a glance.

const TITLES = {
  bleed: 'Bleeding — red damage each turn',
  poison: 'Poisoned — green damage each turn',
  curse: 'Cursed — rot damage each turn',
  stun: 'Stunned — the next turn is lost',
  fear: 'Feared — weakened, may cower',
  might: 'Might — +40% damage',
  cripple: 'Crippled — −30% damage',
  dodge: 'Smoke — the next blow misses',
  shield: 'Bone Ward — absorbs damage',
  psychosis: 'Psychosis — the next turn is lost',
  marked: 'Debt Mark — the next collection will hurt',
  lien: 'Black Writ — killing this condemned target pays bonus gold',
  vulnerable: 'Vulnerable — takes harder follow-up blows',
  rotten_guard: 'Rotten Guard — melee attackers risk poison',
  focus: 'Focus — the next strikes hit harder',
  zeal: 'Zeal — doctrine sharpened into damage',
  ascension: 'Ascension — kill this enemy before the count reaches zero',
};

function glyph(type) {
  switch (type) {
    case 'bleed':
      return <path d="M7 1 Q11 7 11 9.5 A4 4 0 1 1 3 9.5 Q3 7 7 1 Z" fill="#c0392b" />;
    case 'poison':
      return <path d="M7 1 Q11 7 11 9.5 A4 4 0 1 1 3 9.5 Q3 7 7 1 Z" fill="#8a9a4a" />;
    case 'curse':
      return (
        <g>
          <rect x="3.2" y="3.2" width="7.6" height="7.6" transform="rotate(45 7 7)" fill="none" stroke="#8e7bb5" strokeWidth="1.6" />
          <circle cx="7" cy="7" r="1.6" fill="#8e7bb5" />
        </g>
      );
    case 'stun':
      return (
        <g stroke="#a98c45" strokeWidth="1.8" fill="none">
          <path d="M2 7 A5 5 0 0 1 10.5 3.4" />
          <path d="M12 7 A5 5 0 0 1 3.5 10.6" />
        </g>
      );
    case 'fear':
      return (
        <g>
          <path d="M1.5 7 Q7 2 12.5 7 Q7 12 1.5 7 Z" fill="none" stroke="#cfc3a9" strokeWidth="1.4" />
          <circle cx="7" cy="7" r="1.8" fill="#cfc3a9" />
        </g>
      );
    case 'might':
      return <path d="M7 1.5 L12 8 L9 8 L9 12.5 L5 12.5 L5 8 L2 8 Z" fill="#c0392b" />;
    case 'cripple':
      return <path d="M3 2 L7 6 L4.5 8 L9 12 L7 7.5 L10 5.5 L5.5 2 Z" fill="#9a6b3f" stroke="#9a6b3f" strokeWidth="0.8" />;
    case 'dodge':
      return (
        <g fill="#8d8270" opacity="0.9">
          <circle cx="4" cy="9" r="2.6" />
          <circle cx="8" cy="6.5" r="2.2" />
          <circle cx="11" cy="4.5" r="1.6" />
        </g>
      );
    case 'shield':
      return <path d="M7 1 L12.5 3.2 L12.5 7 Q12.5 11.6 7 13 Q1.5 11.6 1.5 7 L1.5 3.2 Z" fill="none" stroke="#cfc3a9" strokeWidth="1.6" />;
    case 'lien':
      return (
        <g fill="none" stroke="#a98c45" strokeWidth="1.4">
          <path d="M2 3 H10 L12 5 V12 H2 Z" />
          <circle cx="9.5" cy="5.5" r="1.2" />
          <path d="M4 8 H9 M4 10 H7" />
        </g>
      );
    case 'psychosis':
      return (
        <g>
          <path d="M1.4 7 Q7 2.4 12.6 7 Q7 11.6 1.4 7 Z" fill="none" stroke="#c0392b" strokeWidth="1.35" />
          <circle cx="7" cy="7" r="1.7" fill="#c0392b" />
          <path d="M3.2 3.1 L10.8 10.9 M10.8 3.1 L3.2 10.9" stroke="#e8d9c8" strokeWidth="1.1" />
        </g>
      );
    case 'ascension':
      return (
        <g fill="none" stroke="#c0392b" strokeWidth="1.5">
          <path d="M7 1.5 L8.3 5.2 H12.2 L9.1 7.5 L10.2 11.2 L7 9 L3.8 11.2 L4.9 7.5 L1.8 5.2 H5.7 Z" />
        </g>
      );
    default:
      return <circle cx="7" cy="7" r="3" fill="#8d8270" />;
  }
}

export default function StatusIcon({ st }) {
  return (
    <span className={`sticon sticon-${st.type}`} title={TITLES[st.type] || st.type}>
      <svg viewBox="0 0 14 14" width="13" height="13">{glyph(st.type)}</svg>
      {(st.type === 'shield' || st.type === 'ascension') && <i className="sticon-val">{st.power}</i>}
    </span>
  );
}
