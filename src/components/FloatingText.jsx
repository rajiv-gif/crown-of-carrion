import React from 'react';

// Floating combat text above a unit: damage, ticks, healing, and words
// ("Stunned", "Dodged", "Sabotage", "EXECUTED"). Driven by engine events.

const STATUS_WORD = {
  bleed: 'Bleeding',
  poison: 'Poisoned',
  curse: 'Cursed',
  stun: 'Stunned',
  fear: 'Feared',
  might: 'Might',
  cripple: 'Crippled',
  dodge: 'Smoke',
  shield: 'Warded',
};

export default function FloatingText({ e, idx }) {
  let text;
  let cls;
  if (e.k === 'hit') {
    text = `−${e.amount}`;
    cls = e.vicious ? 'ft-dmg ft-vicious' : 'ft-dmg';
  } else if (e.k === 'dot') {
    text = `−${e.amount}`;
    cls = `ft-${e.type}`;
  } else if (e.k === 'status') {
    text = STATUS_WORD[e.status] || e.status;
    cls = `ft-word ft-st-${e.status}`;
  } else {
    text = e.text;
    cls = `ft-${e.type || 'word'}`;
  }
  return (
    <span
      className={`ftext ${cls}`}
      style={{ animationDelay: `${idx * 0.14}s`, left: `${24 + ((idx * 17) % 40)}%` }}
    >
      {text}
    </span>
  );
}
