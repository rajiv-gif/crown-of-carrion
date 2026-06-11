import React from 'react';

// Hand-built dark silhouettes. All figures face RIGHT; the enemy side is
// mirrored in CSS. Fills stay in the cursed-ledger palette: near-black
// bodies, one rim accent per character, glowing visor/eye slits.

const IRON = '#2a221b';
const IRON_DARK = '#16110d';
const STEEL = '#3a3633';
const BLOOD = '#c0392b';
const HEX = '#8e7bb5';
const POISON = '#8a9a4a';
const BONE = '#cfc3a9';
const RAG = '#241c14';

function Lucian() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-lucian" aria-label="Lucian">
      {/* cloak */}
      <path d="M36 38 Q14 82 22 140 L40 134 Q30 86 46 46 Z" fill="#0c0907" />
      {/* legs */}
      <path d="M44 96 L53 96 L51 140 L40 140 Z" fill={IRON_DARK} />
      <path d="M56 96 L65 96 L68 140 L57 140 Z" fill={IRON_DARK} />
      {/* torso */}
      <path d="M40 46 L70 46 L65 98 L44 98 Z" fill={IRON} />
      <path d="M44 60 L66 58 L65 66 L45 68 Z" fill={IRON_DARK} />
      {/* pauldrons — wide, brutal */}
      <path d="M28 36 L82 36 L75 54 L35 54 Z" fill={IRON_DARK} />
      <path d="M26 34 L42 28 L44 52 L30 54 Z" fill={IRON} />
      <path d="M84 34 L68 28 L66 52 L80 54 Z" fill={IRON} />
      {/* helm */}
      <path d="M46 8 L66 8 L68 26 L63 36 L49 36 L44 26 Z" fill={IRON} />
      <rect x="49" y="20" width="14" height="2.6" fill={BLOOD} opacity="0.95" />
      <path d="M54 2 L58 2 L60 9 L52 9 Z" fill={BLOOD} opacity="0.5" />
      {/* sword arm */}
      <path d="M68 50 L84 60 L79 70 L66 62 Z" fill={IRON} />
      {/* greatsword */}
      <path d="M78 54 L88 50 L106 132 L96 144 Z" fill={STEEL} />
      <path d="M87 52 L90 53 L104 130 L99 134 Z" fill={BLOOD} opacity="0.35" />
      <rect x="72" y="52" width="20" height="5" fill={IRON_DARK} transform="rotate(22 82 54)" />
    </svg>
  );
}

function Sjen() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-sjen" aria-label="Sjen">
      {/* ragged robe */}
      <path
        d="M42 28 L68 28 L80 134 L72 127 L66 137 L58 128 L50 138 L43 128 L35 136 L29 130 Z"
        fill="#161020"
      />
      <path d="M46 30 L64 30 L70 80 L42 82 Z" fill="#1d1528" opacity="0.7" />
      {/* hood */}
      <path d="M43 8 Q55 -2 67 8 L71 32 Q55 40 39 32 Z" fill="#1a1322" />
      {/* void face, one pale eye */}
      <ellipse cx="56" cy="22" rx="8.5" ry="9.5" fill="#060409" />
      <circle cx="54" cy="21" r="1.4" fill={BONE} opacity="0.85" />
      {/* arms raised toward an orb */}
      <path d="M46 46 L26 66 L30 72 L50 56 Z" fill="#1a1322" />
      <path d="M64 44 L86 58 L82 65 L60 54 Z" fill="#1a1322" />
      {/* orb of pale rot */}
      <circle cx="91" cy="54" r="6.5" fill={HEX} opacity="0.45" />
      <circle cx="91" cy="54" r="2.8" fill="#e9e4d6" opacity="0.85" />
      {/* hovering runes (CSS-animated) */}
      <g className="sil-runes" fill={HEX} opacity="0.75">
        <rect x="20" y="46" width="4.5" height="4.5" transform="rotate(45 22 48)" />
        <rect x="96" y="36" width="4" height="4" transform="rotate(45 98 38)" />
        <rect x="84" y="70" width="3.4" height="3.4" transform="rotate(45 86 72)" />
      </g>
      {/* rope belt */}
      <rect x="44" y="66" width="23" height="2.2" fill="#3a3050" />
    </svg>
  );
}

function Veato() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-veato" aria-label="Veato">
      {/* back leg */}
      <path d="M34 102 L46 98 L40 122 L46 140 L36 140 L31 120 Z" fill={IRON_DARK} />
      {/* lunged front leg */}
      <path d="M58 100 L68 96 L80 118 L76 140 L66 140 L68 120 Z" fill={IRON_DARK} />
      {/* hunched torso, leaning in */}
      <path d="M38 62 L60 46 L74 62 L56 88 L40 86 Z" fill={RAG} />
      <path d="M42 70 L64 58 L68 66 L48 80 Z" fill={IRON_DARK} opacity="0.8" />
      {/* head low and forward, hooded */}
      <path d="M64 34 L82 38 L84 50 L72 56 L62 48 Z" fill={IRON_DARK} />
      <circle cx="76" cy="45" r="1.3" fill={POISON} opacity="0.9" />
      {/* scarf trailing behind */}
      <path d="M62 50 Q44 60 28 52 L30 60 Q48 66 64 58 Z" fill="#2c3320" />
      {/* arms + daggers */}
      <path d="M70 58 L86 62 L84 70 L68 66 Z" fill={RAG} />
      <path d="M84 60 L102 50 L104 55 L88 68 Z" fill={STEEL} />
      <path d="M99 52 L103 53 L101 56 Z" fill={POISON} opacity="0.7" />
      <path d="M42 80 L26 90 L24 84 L38 74 Z" fill={STEEL} />
    </svg>
  );
}

function Wretch() {
  return (
    <svg viewBox="0 0 90 95" className="sil sil-wretch" aria-label="The Wretch">
      {/* hunched mass */}
      <path d="M22 76 Q14 44 36 32 Q60 22 68 44 Q74 62 64 76 Z" fill="#120d14" />
      {/* spine spikes */}
      <path d="M32 36 L36 24 L41 34 Z" fill="#1d1528" />
      <path d="M44 30 L48 18 L53 30 Z" fill="#1d1528" />
      <path d="M56 32 L60 22 L64 34 Z" fill="#1d1528" />
      {/* long arms ending in claws */}
      <path d="M26 54 L8 78 L13 83 L31 62 Z" fill="#120d14" />
      <path d="M58 56 L78 80 L73 85 L52 64 Z" fill="#120d14" />
      <path d="M8 78 L3 84 M10 81 L6 88" stroke="#1d1528" strokeWidth="2.4" />
      {/* hollow eyes */}
      <circle cx="50" cy="44" r="1.6" fill={BONE} opacity="0.85" />
      <circle cx="58" cy="47" r="1.4" fill={BONE} opacity="0.7" />
    </svg>
  );
}

function Villager() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-villager" aria-label="Starved Villager">
      {/* pitchfork */}
      <rect x="78" y="28" width="3.4" height="104" fill="#2c241c" transform="rotate(6 80 80)" />
      <path d="M74 22 L76 36 M81 20 L82 34 M88 22 L87 36" stroke="#3a3633" strokeWidth="2.6" />
      {/* thin legs */}
      <path d="M46 102 L52 102 L49 140 L43 140 Z" fill={RAG} />
      <path d="M56 102 L62 102 L62 140 L56 140 Z" fill={RAG} />
      {/* ragged tunic */}
      <path d="M42 44 L66 44 L72 104 L64 98 L58 106 L50 98 L42 106 L36 100 Z" fill={RAG} />
      {/* sunken chest line */}
      <path d="M48 56 L62 56 L60 64 L50 64 Z" fill={IRON_DARK} opacity="0.85" />
      {/* bare head, gaunt */}
      <path d="M48 18 Q56 10 62 18 L62 32 Q55 38 48 32 Z" fill="#2a2018" />
      <circle cx="58" cy="25" r="1" fill={BONE} opacity="0.6" />
      {/* arm gripping the haft */}
      <path d="M64 52 L80 58 L78 66 L62 60 Z" fill={RAG} />
    </svg>
  );
}

function Guard() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-guard" aria-label="Infected Guard">
      {/* legs */}
      <path d="M42 98 L51 98 L48 140 L38 140 Z" fill={IRON_DARK} />
      <path d="M56 98 L65 98 L68 140 L58 140 Z" fill={IRON_DARK} />
      {/* hunched mail torso */}
      <path d="M38 46 L68 46 L66 100 L42 100 Z" fill={IRON} />
      <path d="M42 58 L64 58 L63 64 L43 64 Z" fill={IRON_DARK} />
      <path d="M42 72 L64 72 L63 78 L43 78 Z" fill={IRON_DARK} />
      {/* kettle helm */}
      <path d="M40 22 Q54 8 68 22 L68 26 L40 26 Z" fill={IRON_DARK} />
      <path d="M34 26 L74 26 L70 32 L38 32 Z" fill={IRON} />
      <path d="M48 32 L62 32 L60 40 L50 40 Z" fill="#0c0907" />
      {/* weeping plague drips */}
      <circle cx="50" cy="54" r="2" fill={POISON} opacity="0.8" />
      <circle cx="58" cy="68" r="1.6" fill={POISON} opacity="0.65" />
      <circle cx="46" cy="82" r="1.4" fill={POISON} opacity="0.5" />
      {/* round shield */}
      <circle cx="78" cy="74" r="15" fill={IRON_DARK} stroke={STEEL} strokeWidth="2.5" />
      <circle cx="78" cy="74" r="4" fill={STEEL} />
      {/* lowered rusted sword */}
      <path d="M36 64 L28 62 L20 118 L28 124 Z" fill="#4a3a2a" />
    </svg>
  );
}

function Knight() {
  return (
    <svg viewBox="0 0 150 185" className="sil sil-knight" aria-label="The Debt-Bound Knight">
      {/* legs — slabs */}
      <path d="M56 128 L72 128 L68 176 L52 176 Z" fill={IRON_DARK} />
      <path d="M82 128 L98 128 L104 176 L88 176 Z" fill={IRON_DARK} />
      {/* slab torso */}
      <path d="M46 68 L110 68 L104 132 L52 132 Z" fill={IRON} />
      <path d="M52 80 L104 80 L102 88 L54 88 Z" fill={IRON_DARK} />
      {/* enormous pauldrons */}
      <path d="M16 50 L70 40 L72 72 L24 78 Z" fill={IRON_DARK} />
      <path d="M134 50 L84 40 L82 72 L128 78 Z" fill={IRON_DARK} />
      <path d="M14 46 L34 38 L38 70 L20 74 Z" fill={IRON} />
      <path d="M136 46 L118 38 L114 70 L132 74 Z" fill={IRON} />
      {/* great helm */}
      <path d="M60 10 L94 10 L98 40 L90 50 L64 50 L56 40 Z" fill={IRON} />
      <rect x="64" y="28" width="26" height="3.6" fill={BLOOD} opacity="0.95" />
      <path d="M72 4 L82 4 L84 11 L70 11 Z" fill={IRON_DARK} />
      {/* chains threaded through the bone of him */}
      <path d="M26 70 Q78 100 126 66" stroke="#5c5245" strokeWidth="4.5" fill="none" strokeDasharray="7 5" />
      <path d="M34 94 Q80 120 120 90" stroke="#5c5245" strokeWidth="4" fill="none" strokeDasharray="6 5" />
      {/* the nailed ledger, dragged on a chain */}
      <path d="M28 76 Q20 96 24 112" stroke="#5c5245" strokeWidth="3" fill="none" strokeDasharray="5 4" />
      <rect x="14" y="110" width="20" height="26" fill="#1d1409" stroke="#5c5245" strokeWidth="2" />
      <path d="M17 118 L31 118 M17 124 L31 124" stroke="#6e5b4a" strokeWidth="1.4" />
      {/* arm + dreadful cleaver */}
      <path d="M108 70 L126 80 L120 94 L104 84 Z" fill={IRON} />
      <path d="M120 72 L136 64 L148 150 L128 162 Z" fill={STEEL} />
      <path d="M134 66 L138 68 L146 148 L140 152 Z" fill={BLOOD} opacity="0.3" />
      {/* rot at the joints */}
      <circle cx="70" cy="124" r="2.2" fill={POISON} opacity="0.6" />
      <circle cx="96" cy="110" r="1.8" fill={POISON} opacity="0.5" />
    </svg>
  );
}

const SPRITES = {
  lucian: Lucian,
  sjen: Sjen,
  veato: Veato,
  wretch: Wretch,
  villager: Villager,
  guard: Guard,
  knight: Knight,
};

export default function Silhouette({ name }) {
  const Sprite = SPRITES[name] || Villager;
  return <Sprite />;
}
