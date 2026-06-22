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
const GOLD = '#a98c45';
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

function Chan() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-chan" aria-label="Chan">
      {/* compact legs and old polished boots */}
      <path d="M40 91 L51 91 L49 128 L37 128 Z" fill="#262320" />
      <path d="M59 91 L70 91 L73 128 L61 128 Z" fill="#262320" />
      <path d="M34 126 H51 V133 H32 Z M60 126 H77 V133 H59 Z" fill="#171513" />
      {/* cropped oxblood field jacket and charcoal waistcoat */}
      <path d="M35 42 L75 42 L78 88 L32 88 Z" fill="#571c20" />
      <path d="M43 48 L67 48 L69 86 L42 86 Z" fill="#27231f" />
      <path d="M35 45 L27 58 L33 70 L42 58 Z" fill="#595550" />
      <path d="M75 45 L84 58 L78 70 L68 58 Z" fill="#595550" />
      {/* dead-parchment tally sash */}
      <path d="M40 40 L50 39 L71 91 L59 94 Z" fill="#b8aa8d" />
      <path d="M45 48 L51 47 M48 56 L55 54 M52 64 L59 62 M56 73 L63 71 M59 81 L67 79" stroke="#521b1d" strokeWidth="1.2" />
      <circle cx="54" cy="59" r="2" fill="#6e2022" />
      {/* one low iron shoulder */}
      <path d="M70 39 L84 43 L80 54 L68 49 Z" fill="#393735" stroke="#6c6258" strokeWidth="1.1" />
      {/* head, visible and unhooded */}
      <path d="M45 14 Q55 6 66 14 L67 33 L58 40 L47 34 Z" fill="#3a2a20" />
      <path d="M44 14 Q55 4 68 14 L66 20 Q55 14 45 22 Z" fill="#11100f" />
      <path d="M50 28 Q55 29 61 27" fill="none" stroke="#8b7652" strokeWidth="1.1" />
      {/* arms bracing a blackened repeating execution crossbow */}
      <path d="M35 55 L25 68 L33 75 L48 64 Z" fill="#595550" />
      <path d="M73 55 L84 68 L77 75 L61 64 Z" fill="#595550" />
      <path d="M25 63 L92 65 L97 72 L29 74 Z" fill="#31251d" stroke="#77706a" strokeWidth="1.5" />
      <path d="M23 56 L32 69 L23 82 M99 56 L90 69 L99 82" fill="none" stroke="#4b4946" strokeWidth="2.6" />
      <rect x="53" y="57" width="17" height="9" fill="#181716" stroke="#77706a" />
      <path d="M60 70 L60 88" stroke="#77706a" strokeWidth="2" />
      {/* disciplined belt tools: writ cylinders, tags, collapsed scale */}
      <rect x="30" y="87" width="6" height="16" fill="#31251d" stroke="#8b7652" />
      <rect x="38" y="89" width="5" height="14" fill="#31251d" stroke="#8b7652" />
      <path d="M75 86 V101 M68 91 H82 M70 91 L68 99 M80 91 L82 99" stroke="#8b7652" strokeWidth="1.1" />
      <rect x="49" y="88" width="7" height="10" fill="#171513" stroke="#b8aa8d" />
    </svg>
  );
}

function Chibi() {
  return (
    <svg viewBox="0 0 90 110" className="sil sil-chibi" aria-label="Chibi">
      <path d="M30 72 L38 72 L35 104 L27 104 Z" fill={IRON_DARK} />
      <path d="M46 72 L54 72 L58 104 L50 104 Z" fill={IRON_DARK} />
      <path d="M25 38 L60 38 L64 78 L54 72 L45 82 L34 72 L24 78 Z" fill="#140f1c" />
      <path d="M28 14 Q44 0 60 14 L62 36 Q45 44 26 36 Z" fill="#171024" />
      <ellipse cx="44" cy="27" rx="8" ry="7" fill="#060409" />
      <circle cx="41" cy="26" r="1.4" fill={BONE} />
      <circle cx="48" cy="27" r="1.1" fill={HEX} />
      <path d="M58 48 L76 42 L78 48 L60 58 Z" fill={STEEL} />
      <path d="M28 50 L14 62 L10 58 L24 44 Z" fill={STEEL} />
      <g className="sil-runes" fill={HEX} opacity="0.75">
        <rect x="14" y="25" width="3.5" height="3.5" transform="rotate(45 16 27)" />
        <rect x="70" y="24" width="3.5" height="3.5" transform="rotate(45 72 26)" />
      </g>
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

function Slinger() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-slinger" aria-label="Pox-Slinger">
      {/* thin legs, braced to throw */}
      <path d="M44 104 L50 104 L44 140 L38 140 Z" fill={RAG} />
      <path d="M56 104 L62 104 L64 140 L58 140 Z" fill={RAG} />
      {/* hunched ragged tunic, leaning into the throw */}
      <path d="M40 50 L64 46 L70 106 L62 100 L56 108 L48 100 L40 108 L36 102 Z" fill={RAG} />
      <path d="M46 60 L60 57 L59 65 L48 67 Z" fill={IRON_DARK} opacity="0.85" />
      {/* gaunt head, hooded rag */}
      <path d="M46 20 Q55 12 62 20 L61 34 Q54 39 47 33 Z" fill="#2a2018" />
      <circle cx="57" cy="26" r="1" fill={POISON} opacity="0.7" />
      {/* cocked throwing arm, raised behind the head */}
      <path d="M58 52 L40 36 L34 42 L52 60 Z" fill={RAG} />
      {/* hurled glob of plague-filth, leaving the hand */}
      <circle cx="30" cy="34" r="6" fill="#3a4422" />
      <circle cx="30" cy="34" r="3" fill={POISON} opacity="0.85" />
      <path d="M30 34 L20 30 M30 34 L22 40" stroke={POISON} strokeWidth="1.6" opacity="0.5" />
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

function HollowGuard() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-hollow-guard" aria-label="Hollow Guard">
      {/* legs — stiff, unnaturally straight */}
      <path d="M44 98 L52 98 L51 142 L43 142 Z" fill="#120d10" />
      <path d="M58 98 L66 98 L67 142 L59 142 Z" fill="#120d10" />
      {/* corrupted mail torso, drained of color */}
      <path d="M38 44 L70 44 L67 100 L41 100 Z" fill="#1a141a" />
      <path d="M42 58 L66 58 L65 64 L43 64 Z" fill="#0c080c" />
      <path d="M42 72 L66 72 L65 78 L43 78 Z" fill="#0c080c" />
      {/* bone growths erupting through the armor */}
      <path d="M40 55 L33 49 L41 51 Z" fill={BONE} opacity="0.7" />
      <path d="M68 66 L76 62 L69 64 Z" fill={BONE} opacity="0.7" />
      <path d="M45 88 L40 95 L47 92 Z" fill={BONE} opacity="0.55" />
      {/* same kettle helm shape, blackened */}
      <path d="M40 20 Q54 6 68 20 L68 24 L40 24 Z" fill="#0c080c" />
      <path d="M34 24 L74 24 L70 30 L38 30 Z" fill="#1a141a" />
      {/* hollow void where the face was, glowing cold */}
      <path d="M48 30 L62 30 L60 40 L50 40 Z" fill="#040308" />
      <rect x="48" y="30" width="14" height="10" fill={HEX} opacity="0.12" />
      <circle cx="52.5" cy="35" r="1.9" fill={HEX} opacity="0.95" />
      <circle cx="59.5" cy="35" r="1.9" fill={HEX} opacity="0.95" />
      {/* black ichor weeping from the seams */}
      <path d="M52 40 Q50 49 53 57" stroke="#0a0610" strokeWidth="2" fill="none" />
      <circle cx="44" cy="70" r="1.6" fill="#0a0610" />
      {/* corrupted shield, sigil-marked */}
      <circle cx="80" cy="74" r="15" fill="#0c080c" stroke="#2a2230" strokeWidth="2.5" />
      <path d="M80 66 L80 82 M73 74 L87 74" stroke={HEX} strokeWidth="1.6" opacity="0.7" />
      {/* blade raised and ready, not lowered */}
      <path d="M34 60 L26 40 L33 38 L40 58 Z" fill={STEEL} />
      <path d="M30 44 L34 43 L33 40 Z" fill={HEX} opacity="0.5" />
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

function Flagellant() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-flagellant" aria-label="Ashen Flagellant">
      <path d="M44 98 L52 98 L48 140 L38 140 Z" fill={RAG} />
      <path d="M58 98 L66 98 L70 140 L60 140 Z" fill={RAG} />
      <path d="M36 38 L72 38 L76 104 L66 96 L56 108 L46 96 L34 106 Z" fill="#2a211c" />
      <path d="M46 12 Q56 4 66 14 L64 34 L48 34 Z" fill="#2e251f" />
      <path d="M68 52 L94 36" stroke={BLOOD} strokeWidth="4" />
      <path d="M88 38 L102 48 M92 34 L104 38" stroke="#5c5245" strokeWidth="2.2" />
      <circle cx="57" cy="24" r="1.5" fill={BONE} />
    </svg>
  );
}

function Censer() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-censer" aria-label="Censer Knight">
      <path d="M42 98 L52 98 L49 140 L38 140 Z" fill={IRON_DARK} />
      <path d="M58 98 L68 98 L72 140 L60 140 Z" fill={IRON_DARK} />
      <path d="M34 44 L76 44 L72 102 L40 102 Z" fill={IRON} />
      <path d="M42 16 Q56 4 70 16 L72 32 L40 32 Z" fill={IRON_DARK} />
      <rect x="46" y="28" width="18" height="3" fill={BLOOD} />
      <path d="M74 60 Q92 72 86 98" stroke="#5c5245" strokeWidth="3" fill="none" strokeDasharray="5 4" />
      <circle cx="84" cy="102" r="10" fill="#1d1409" stroke={STEEL} strokeWidth="2" />
      <circle cx="84" cy="102" r="14" fill={HEX} opacity="0.15" />
    </svg>
  );
}

function Taxman() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-taxman" aria-label="Choir Taxman">
      <path d="M40 98 L50 98 L48 140 L38 140 Z" fill={IRON_DARK} />
      <path d="M58 98 L68 98 L72 140 L62 140 Z" fill={IRON_DARK} />
      <path d="M34 42 L74 42 L78 104 L64 98 L56 108 L44 98 L32 106 Z" fill="#181121" />
      <path d="M44 12 Q56 2 68 12 L70 34 L42 34 Z" fill="#120d18" />
      <rect x="48" y="24" width="16" height="2.5" fill={HEX} />
      <rect x="76" y="54" width="20" height="30" fill="#1d1409" stroke={BONE} strokeWidth="1.5" />
      <path d="M80 62 L92 62 M80 68 L92 68 M80 74 L90 74" stroke={BONE} strokeWidth="1" />
    </svg>
  );
}

function Husk() {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-husk" aria-label="Reliquary Husk">
      <path d="M40 102 L50 98 L48 140 L36 140 Z" fill={IRON_DARK} />
      <path d="M58 100 L68 98 L74 140 L62 140 Z" fill={IRON_DARK} />
      <path d="M34 48 Q56 28 78 50 L72 108 L58 98 L48 112 L36 100 Z" fill="#130f13" />
      <path d="M44 18 Q58 2 70 18 L68 42 L46 42 Z" fill="#1a1318" />
      <rect x="42" y="54" width="30" height="26" fill="#1d1409" stroke={BONE} strokeWidth="1.8" />
      <path d="M48 63 L66 63 M48 70 L66 70" stroke={BONE} strokeWidth="1" opacity="0.7" />
      <circle cx="54" cy="30" r="1.6" fill={HEX} />
      <circle cx="63" cy="31" r="1.3" fill={POISON} />
      <path d="M34 66 L16 92 L24 98 L42 76 Z" fill="#130f13" />
      <path d="M74 66 L94 88 L88 96 L68 76 Z" fill="#130f13" />
      <g className="sil-runes" fill={POISON} opacity="0.65">
        <circle cx="28" cy="46" r="2.8" />
        <circle cx="84" cy="42" r="2.4" />
      </g>
    </svg>
  );
}

function Demon() {
  return (
    <svg viewBox="0 0 140 165" className="sil sil-demon" aria-label="Dogma Demon">
      <path d="M46 112 L60 110 L56 156 L42 156 Z" fill={IRON_DARK} />
      <path d="M78 110 L92 112 L100 156 L84 156 Z" fill={IRON_DARK} />
      <path d="M34 56 Q70 22 106 56 L98 122 L80 108 L68 130 L54 108 L36 124 Z" fill="#100b12" />
      <path d="M48 28 L38 4 L62 24 Z" fill="#100b12" />
      <path d="M90 28 L106 4 L82 24 Z" fill="#100b12" />
      <ellipse cx="70" cy="48" rx="24" ry="19" fill="#1b111c" />
      <circle cx="60" cy="45" r="2" fill={BLOOD} />
      <circle cx="79" cy="45" r="2" fill={BLOOD} />
      <path d="M54 58 Q70 72 88 58" stroke={BONE} strokeWidth="3.2" fill="none" />
      <path d="M32 74 L10 104 L20 112 L44 86 Z" fill="#100b12" />
      <path d="M106 74 L130 104 L120 112 L94 86 Z" fill="#100b12" />
      <path d="M22 106 L12 124 M24 110 L18 128 M118 110 L126 128 M120 106 L132 124" stroke={BONE} strokeWidth="2.2" />
      <g className="sil-runes" fill={HEX} opacity="0.6">
        <rect x="66" y="82" width="8" height="8" transform="rotate(45 70 86)" />
        <circle cx="36" cy="38" r="3" />
        <circle cx="104" cy="38" r="3" />
      </g>
    </svg>
  );
}

function AscendedDemon() {
  return (
    <svg viewBox="0 0 160 190" className="sil sil-ascended-demon" aria-label="Ascended Dogma Demon">
      <path d="M48 126 L64 122 L60 180 L42 180 Z" fill="#0b080d" />
      <path d="M92 122 L108 126 L118 180 L98 180 Z" fill="#0b080d" />
      <path d="M28 58 Q80 12 132 58 L118 138 L94 118 L80 148 L62 118 L38 140 Z" fill="#100a12" />
      <path d="M48 38 L34 2 L68 31 Z M112 38 L132 2 L92 31 Z" fill="#130c15" />
      <path d="M68 28 L80 0 L92 28 L86 42 L74 42 Z" fill="#1e111d" />
      <ellipse cx="80" cy="54" rx="29" ry="23" fill="#20121e" />
      <circle cx="66" cy="50" r="2.8" fill={BLOOD} />
      <circle cx="94" cy="50" r="2.8" fill={BLOOD} />
      <path d="M58 66 Q80 86 104 64" stroke={BONE} strokeWidth="4.5" fill="none" />
      <path d="M63 69 L67 77 M73 72 L75 82 M84 72 L84 83 M94 69 L91 78" stroke="#1a0c0e" strokeWidth="2" />
      <path d="M53 86 Q80 102 108 84 M50 98 Q80 114 112 96 M48 110 Q80 126 114 108" stroke="#5a3b42" strokeWidth="3" fill="none" />
      <circle cx="80" cy="102" r="10" fill={BLOOD} opacity="0.32" />
      <circle cx="80" cy="102" r="4" fill="#e9e4d6" opacity="0.9" />
      <path d="M34 76 L6 104 L18 116 L48 88 Z M126 76 L154 104 L142 116 L112 88 Z" fill="#100a12" />
      <path d="M40 92 L14 140 L27 146 L55 104 Z M120 92 L146 140 L133 146 L105 104 Z" fill="#0d090f" />
      <path d="M12 106 L2 126 M17 110 L10 132 M143 110 L150 132 M148 106 L158 126" stroke={BONE} strokeWidth="2.5" />
      <g className="sil-runes" fill={HEX} opacity="0.8">
        <rect x="74" y="132" width="12" height="12" transform="rotate(45 80 138)" />
        <circle cx="28" cy="42" r="4" />
        <circle cx="132" cy="42" r="4" />
        <circle cx="80" cy="22" r="3" />
      </g>
    </svg>
  );
}

function Saint() {
  return (
    <svg viewBox="0 0 150 185" className="sil sil-saint" aria-label="The Saint Without a Face">
      <path d="M50 52 L100 52 L116 170 L98 156 L84 176 L70 156 L52 174 L34 166 Z" fill="#18111b" />
      <path d="M56 18 Q76 -4 96 18 L104 54 Q76 68 48 54 Z" fill="#211726" />
      <ellipse cx="76" cy="40" rx="18" ry="20" fill="#e9e4d6" opacity="0.08" />
      <path d="M64 42 Q76 54 88 42" stroke={BLOOD} strokeWidth="4" fill="none" />
      <path d="M42 70 L18 96 L28 104 L52 80 Z" fill="#18111b" />
      <path d="M102 70 L132 94 L122 104 L94 82 Z" fill="#18111b" />
      <g className="sil-runes" fill={BONE} opacity="0.5">
        <circle cx="34" cy="46" r="3" />
        <circle cx="116" cy="50" r="3" />
        <rect x="72" y="76" width="7" height="7" transform="rotate(45 75 79)" />
      </g>
    </svg>
  );
}

const SPRITES = {
  lucian: Lucian,
  sjen: Sjen,
  veato: Veato,
  chan: Chan,
  chan_broker: Chan,
  chibi: Chibi,
  wretch: Wretch,
  villager: Villager,
  slinger: Slinger,
  guard: Guard,
  hollow_guard: HollowGuard,
  knight: Knight,
  flagellant: Flagellant,
  censer: Censer,
  taxman: Taxman,
  husk: Husk,
  demon: Demon,
  ascended_demon: AscendedDemon,
  saint: Saint,
};

function MissingSprite({ name }) {
  return (
    <svg viewBox="0 0 110 150" className="sil sil-missing" aria-label={`Missing enemy art: ${name}`}>
      <path d="M34 34 L76 34 L84 122 L66 112 L55 138 L44 112 L26 122 Z" fill="#180b0c" stroke={BLOOD} strokeWidth="2" />
      <circle cx="55" cy="24" r="14" fill="#080506" stroke={BLOOD} strokeWidth="2" />
      <path d="M49 18 L61 30 M61 18 L49 30" stroke={BLOOD} strokeWidth="3" />
      <text x="55" y="82" textAnchor="middle" fill={BONE} fontSize="34" fontFamily="serif">?</text>
    </svg>
  );
}

export default function Silhouette({ name }) {
  const Sprite = SPRITES[name];
  return Sprite ? <Sprite /> : <MissingSprite name={name || 'unknown'} />;
}
