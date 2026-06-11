import React from 'react';

// Cocoli, the last good god, who watches. The visual inverse of everything
// else in Veyrath: light on pale instead of dark on dark. A broken halo
// (a crown refused), a featureless face of light, orbit-rings because she
// observes and does not intervene, open hands that let light fall without
// ever reaching for you, and a hem that dissolves before touching the
// world. She casts no shadow — only a brightness on the ground.

export default function Cocoli() {
  return (
    <svg viewBox="0 0 320 480" className="cocoli-figure" role="img" aria-label="Cocoli">
      <defs>
        <radialGradient id="cocoli-face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#fdf9ee" />
          <stop offset="100%" stopColor="#f3edda" />
        </radialGradient>
        <linearGradient id="cocoli-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f3e7" />
          <stop offset="62%" stopColor="#f1ebd9" />
          <stop offset="88%" stopColor="#ece5d2" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8e1cd" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cocoli-axis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* vertical axis of light */}
      <rect x="158.7" y="10" width="2.6" height="450" fill="url(#cocoli-axis)" />

      {/* orbit-rings — slow procession via CSS */}
      <g className="cocoli-orbits">
        <g stroke="#b3a878" fill="none" opacity="0.5">
          <ellipse cx="160" cy="120" rx="132" ry="32" strokeWidth="1.3" transform="rotate(-16 160 120)" />
          <ellipse cx="160" cy="124" rx="100" ry="23" strokeWidth="0.9" opacity="0.6" transform="rotate(11 160 124)" />
          <circle cx="160" cy="114" r="80" strokeWidth="0.7" opacity="0.45" />
        </g>
        <g fill="#fffdf4" stroke="#b3a878" strokeWidth="0.7">
          <circle cx="38" cy="152" r="3" />
          <circle cx="284" cy="90" r="2.3" />
          <circle cx="238" cy="148" r="1.8" />
        </g>
      </g>

      <g className="cocoli-body">
        {/* broken halo */}
        <g stroke="#b3a878" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M 132 50 A 32 32 0 0 1 153 28" />
          <path d="M 169 27 A 32 32 0 0 1 190 48" />
        </g>

        {/* veil + head */}
        <path d="M 140 64 Q 140 40 160 36 Q 180 40 180 64 L 186 110 Q 160 123 134 110 Z" fill="#f3eedd" />
        <ellipse cx="160" cy="68" rx="17" ry="22" fill="url(#cocoli-face)" />
        <path d="M 152 70 q 3.6 2.4 7.2 0" stroke="#d9d1ba" strokeWidth="1" fill="none" opacity="0.55" />
        <path d="M 163 70 q 3.6 2.4 7.2 0" stroke="#d9d1ba" strokeWidth="1" fill="none" opacity="0.55" />

        {/* robe */}
        <path d="M 134 108 Q 160 121 186 108 L 204 230 L 220 396 Q 160 416 100 396 L 116 230 Z" fill="url(#cocoli-robe)" />
        <g stroke="#e2dac4" strokeWidth="1.8" fill="none" opacity="0.8">
          <path d="M 143 136 Q 137 256 128 372" />
          <path d="M 177 136 Q 184 256 193 372" />
          <path d="M 160 146 Q 160 260 160 352" />
        </g>

        {/* sleeves + open hands */}
        <path d="M 136 128 Q 104 160 94 212 Q 92 225 103 225 Q 115 219 122 195 Q 130 162 141 144 Z" fill="#f1ebd9" />
        <path d="M 184 128 Q 216 160 226 212 Q 228 225 217 225 Q 205 219 198 195 Q 190 162 179 144 Z" fill="#f1ebd9" />
        <ellipse cx="99" cy="226" rx="8" ry="5.4" fill="#fdf9ee" />
        <ellipse cx="221" cy="226" rx="8" ry="5.4" fill="#fdf9ee" />
      </g>

      {/* light-rain from the fingertips */}
      <g className="cocoli-rain" stroke="#fffdf4" strokeWidth="1.8" strokeLinecap="round">
        <line x1="95" y1="240" x2="95" y2="256" opacity="0.85" />
        <line x1="103" y1="248" x2="103" y2="270" opacity="0.6" />
        <line x1="98" y1="280" x2="98" y2="294" opacity="0.35" />
        <line x1="225" y1="240" x2="225" y2="258" opacity="0.85" />
        <line x1="217" y1="250" x2="217" y2="268" opacity="0.6" />
        <line x1="222" y1="280" x2="222" y2="292" opacity="0.35" />
      </g>

      {/* no shadow — a brightness instead */}
      <ellipse cx="160" cy="428" rx="84" ry="9" fill="#ffffff" opacity="0.75" />
      <ellipse cx="160" cy="428" rx="84" ry="9" fill="none" stroke="#cfc6ae" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
