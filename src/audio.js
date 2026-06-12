const SOUND_KEY = 'crown_of_carrion_sound_muted';

let ctx = null;
let master = null;

const isBrowser = () => typeof window !== 'undefined';
const now = () => (ctx ? ctx.currentTime : 0);

export function isSoundMuted() {
  if (!isBrowser()) return true;
  return localStorage.getItem(SOUND_KEY) === '1';
}

export function setSoundMuted(muted) {
  if (!isBrowser()) return;
  localStorage.setItem(SOUND_KEY, muted ? '1' : '0');
  window.dispatchEvent(new CustomEvent('crown-sound-change', { detail: { muted } }));
}

export function toggleSoundMuted() {
  const muted = !isSoundMuted();
  setSoundMuted(muted);
  if (!muted) playSound('ui');
  return muted;
}

function ensureAudio() {
  if (!isBrowser() || isSoundMuted()) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type = 'sine', gain = 0.2, start = 0, endFreq = null) {
  if (!ctx || !master) return;
  const t = now() + start;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(24, endFreq), t + duration);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(env);
  env.connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.04);
}

function noise(duration, gain = 0.14, start = 0, filterFreq = 900) {
  if (!ctx || !master) return;
  const t = now() + start;
  const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const env = ctx.createGain();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(filterFreq, t);
  filter.Q.value = 0.9;
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.buffer = buffer;
  src.connect(filter);
  filter.connect(env);
  env.connect(master);
  src.start(t);
  src.stop(t + duration + 0.03);
}

const SOUNDS = {
  ui() {
    tone(420, 0.05, 'triangle', 0.07);
    tone(620, 0.08, 'triangle', 0.045, 0.025);
  },
  cast() {
    tone(180, 0.16, 'sawtooth', 0.08, 0, 90);
    tone(440, 0.12, 'triangle', 0.055, 0.02);
  },
  hex() {
    tone(260, 0.22, 'sine', 0.075, 0, 140);
    tone(520, 0.18, 'triangle', 0.035, 0.04, 300);
  },
  hit() {
    noise(0.08, 0.16, 0, 1200);
    tone(95, 0.08, 'square', 0.07, 0, 55);
  },
  crit() {
    noise(0.11, 0.2, 0, 1700);
    tone(150, 0.11, 'sawtooth', 0.1, 0, 55);
  },
  dot() {
    noise(0.12, 0.09, 0, 520);
    tone(210, 0.08, 'triangle', 0.04, 0.02, 170);
  },
  status() {
    tone(640, 0.08, 'sine', 0.055);
    tone(410, 0.12, 'sine', 0.035, 0.04);
  },
  death() {
    noise(0.18, 0.14, 0, 360);
    tone(160, 0.32, 'sawtooth', 0.11, 0, 45);
  },
  bossDeath() {
    tone(90, 0.55, 'sawtooth', 0.16, 0, 28);
    noise(0.32, 0.18, 0.04, 480);
    tone(260, 0.42, 'triangle', 0.07, 0.15, 120);
  },
  summon() {
    tone(80, 0.4, 'sawtooth', 0.12, 0, 210);
    noise(0.22, 0.13, 0.04, 720);
  },
  reward() {
    tone(620, 0.08, 'triangle', 0.07);
    tone(850, 0.12, 'triangle', 0.06, 0.06);
    tone(1180, 0.16, 'triangle', 0.045, 0.13);
  },
  victory() {
    tone(260, 0.18, 'triangle', 0.08);
    tone(390, 0.18, 'triangle', 0.075, 0.12);
    tone(585, 0.28, 'triangle', 0.075, 0.24);
  },
  defeat() {
    tone(300, 0.35, 'sine', 0.08, 0, 140);
    tone(120, 0.6, 'sawtooth', 0.1, 0.18, 36);
  },
};

export function playSound(name) {
  if (!ensureAudio()) return;
  SOUNDS[name]?.();
}

export function playCombatEvents(events) {
  if (!events?.length || isSoundMuted()) return;
  const picked = [];
  for (const e of events) {
    if (e.k === 'death') picked.push(e.boss ? 'bossDeath' : 'death');
    else if (e.k === 'summon') picked.push('summon');
    else if (e.k === 'hit') picked.push(e.vicious ? 'crit' : 'hit');
    else if (e.k === 'dot') picked.push('dot');
    else if (e.k === 'status') picked.push('status');
    else if (e.k === 'cast') picked.push(['rot_hex', 'whispering_pact', 'debt_of_flesh', 'spite_hex', 'duo_rite'].includes(e.ability) ? 'hex' : 'cast');
    else if (e.k === 'float' && ['DENIED', 'ASCENDED'].includes(e.text)) picked.push(e.text === 'DENIED' ? 'reward' : 'summon');
  }
  [...new Set(picked)].slice(0, 4).forEach((name, i) => setTimeout(() => playSound(name), i * 55));
}
