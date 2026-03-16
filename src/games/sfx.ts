// Synthesized sound effects using Web Audio API — no external dependencies

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  slide?: number,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.1) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

/** Short rising blip — eating food, collecting item */
export function sfxEat() {
  playTone(400, 0.1, 'square', 0.12);
  setTimeout(() => playTone(600, 0.1, 'square', 0.12), 50);
}

/** Quick high ping — scoring, clearing a line */
export function sfxScore() {
  playTone(520, 0.08, 'square', 0.1);
  setTimeout(() => playTone(680, 0.08, 'square', 0.1), 60);
  setTimeout(() => playTone(880, 0.12, 'square', 0.1), 120);
}

/** Low descending buzz — death, game over */
export function sfxDie() {
  playTone(300, 0.3, 'sawtooth', 0.15, 80);
  setTimeout(() => playNoise(0.2, 0.08), 150);
}

/** Triumphant arpeggio — winning */
export function sfxWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'square', 0.1), i * 100));
}

/** Short pew — shooting a bullet */
export function sfxShoot() {
  playTone(900, 0.08, 'square', 0.08, 300);
}

/** Thud — ball hitting paddle or wall */
export function sfxHit() {
  playTone(220, 0.06, 'triangle', 0.12);
}

/** Brick break — breaking a brick */
export function sfxBreak() {
  playTone(500, 0.05, 'square', 0.08);
  playNoise(0.05, 0.06);
}

/** Jump sound */
export function sfxJump() {
  playTone(250, 0.15, 'square', 0.1, 500);
}

/** Soft click — placing number, selecting cell */
export function sfxClick() {
  playTone(800, 0.04, 'sine', 0.08);
}

/** Move/drop piece */
export function sfxMove() {
  playTone(150, 0.03, 'triangle', 0.06);
}

/** Hint reveal */
export function sfxHint() {
  playTone(600, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(800, 0.15, 'sine', 0.08), 80);
}
