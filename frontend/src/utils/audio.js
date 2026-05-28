let audioContext;
const SOUND_KEY = "cloneql.soundEnabled";
const SPEECH_KEY = "cloneql.speechEnabled";

export function isSoundEnabled() {
  return localStorage.getItem(SOUND_KEY) !== "false";
}

export function isSpeechEnabled() {
  return localStorage.getItem(SPEECH_KEY) !== "false";
}

export function setSoundEnabled(value) {
  localStorage.setItem(SOUND_KEY, String(value));
}

export function setSpeechEnabled(value) {
  localStorage.setItem(SPEECH_KEY, String(value));
}

function getContext() {
  audioContext ||= new AudioContext();
  return audioContext;
}

export function playTone(kind = "tap") {
  if (!isSoundEnabled()) return;
  const context = getContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const config = {
    tap: [520, 0.04],
    flip: [360, 0.08],
    correct: [760, 0.12],
    wrong: [160, 0.16],
    match: [920, 0.1]
  }[kind];

  oscillator.type = kind === "wrong" ? "sawtooth" : "sine";
  oscillator.frequency.value = config[0];
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + config[1]);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + config[1] + 0.02);
}

export function speak(text, lang = "en-US", options = {}) {
  if (options.auto && !isSpeechEnabled()) return;
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  playTone("tap");
}
