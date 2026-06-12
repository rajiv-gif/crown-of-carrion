const VOICE_KEY = 'crown_of_carrion_voice_muted';

const isBrowser = () => typeof window !== 'undefined';
const hasSpeech = () => isBrowser() && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
if (hasSpeech()) window.speechSynthesis.onvoiceschanged = () => voiceList();

const PROFILES = {
  narrator: { rate: 0.9, pitch: 0.78, volume: 0.85, hints: ['Daniel', 'Google UK English Male', 'Microsoft David'] },
  Lucian: { rate: 0.86, pitch: 0.62, volume: 0.95, hints: ['Daniel', 'Google UK English Male', 'Microsoft David', 'Alex'] },
  Sjen: { rate: 0.96, pitch: 1.08, volume: 0.88, hints: ['Serena', 'Google UK English Female', 'Microsoft Hazel', 'Samantha'] },
  Veato: { rate: 1.08, pitch: 0.86, volume: 0.9, hints: ['Daniel', 'Google UK English Male', 'Microsoft George', 'Alex'] },
  Chan: { rate: 1.12, pitch: 0.76, volume: 0.92, hints: ['Microsoft Mark', 'Google US English', 'Alex'] },
  Chibi: { rate: 1.18, pitch: 1.32, volume: 0.82, hints: ['Samantha', 'Google US English', 'Microsoft Zira'] },
  Cocoli: { rate: 0.68, pitch: 1.48, volume: 0.72, hints: ['Samantha', 'Serena', 'Google UK English Female', 'Microsoft Zira'] },
  'The Envoy': { rate: 0.92, pitch: 0.74, volume: 0.88, hints: ['Daniel', 'Microsoft David'] },
  'Elder of Marrowfen': { rate: 0.78, pitch: 0.82, volume: 0.88, hints: ['Alex', 'Daniel', 'Microsoft David'] },
  'The Debt-Bound Knight': { rate: 0.72, pitch: 0.56, volume: 0.95, hints: ['Daniel', 'Microsoft David', 'Google UK English Male'] },
};

function voiceList() {
  if (!hasSpeech()) return [];
  return window.speechSynthesis.getVoices();
}

function chooseVoice(profile) {
  const voices = voiceList();
  if (!voices.length) return null;
  for (const hint of profile.hints || []) {
    const found = voices.find((v) => v.name.includes(hint));
    if (found) return found;
  }
  return voices.find((v) => v.lang?.startsWith('en')) || voices[0];
}

function clean(text) {
  return String(text || '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, ', ')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isVoiceMuted() {
  if (!isBrowser()) return true;
  return localStorage.getItem(VOICE_KEY) !== '0';
}

export function setVoiceMuted(muted) {
  if (!isBrowser()) return;
  localStorage.setItem(VOICE_KEY, muted ? '1' : '0');
  if (muted) stopVoice();
  window.dispatchEvent(new CustomEvent('crown-voice-change', { detail: { muted } }));
}

export function toggleVoiceMuted() {
  const muted = !isVoiceMuted();
  setVoiceMuted(muted);
  if (!muted && hasSpeech()) {
    window.speechSynthesis.resume();
    speakLine('narrator', 'Voice enabled.', { interrupt: true, force: true });
  }
  return muted;
}

export function stopVoice() {
  if (hasSpeech()) window.speechSynthesis.cancel();
}

export function speakLine(speaker, text, options = {}) {
  if (!hasSpeech()) return;
  if (!options.force && isVoiceMuted()) return;
  const spoken = clean(text);
  if (!spoken) return;

  if (options.interrupt !== false) stopVoice();
  const profile = PROFILES[speaker] || PROFILES.narrator;
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = profile.volume;
  utterance.voice = chooseVoice(profile);
  utterance.lang = utterance.voice?.lang || 'en-US';
  window.speechSynthesis.speak(utterance);
}

export function voiceSupported() {
  return hasSpeech();
}
