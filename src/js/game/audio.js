// Tiny chiptune sound effects built on the Web Audio API.
// No assets needed - everything is synthesized square/triangle waves.

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, { start = 0, duration = 0.08, type = 'square', volume = 0.06, slide = 0 } = {}) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  click() {
    tone(660, { duration: 0.06 });
  },
  drill() {
    tone(180, { duration: 0.1, type: 'sawtooth', slide: 60, volume: 0.05 });
    tone(220, { start: 0.1, duration: 0.1, type: 'sawtooth', slide: 80, volume: 0.05 });
  },
  bucket() {
    tone(330, { duration: 0.06 });
    tone(494, { start: 0.07, duration: 0.08 });
  },
  collect() {
    tone(523, { duration: 0.07 });
    tone(659, { start: 0.08, duration: 0.07 });
    tone(784, { start: 0.16, duration: 0.1 });
  },
  overflow() {
    tone(220, { duration: 0.2, type: 'sawtooth', slide: -120, volume: 0.07 });
  },
  popup() {
    tone(440, { duration: 0.08 });
    tone(587, { start: 0.09, duration: 0.1 });
  },
  chop() {
    tone(150, { duration: 0.1, slide: -70, volume: 0.09 });
    tone(90, { start: 0.04, duration: 0.08, type: 'triangle', volume: 0.1 });
  },
  miss() {
    tone(110, { duration: 0.18, type: 'sawtooth', slide: -40, volume: 0.06 });
  },
  wood() {
    tone(98, { duration: 0.12, type: 'triangle', volume: 0.12 });
    tone(70, { start: 0.05, duration: 0.1, type: 'triangle', volume: 0.1 });
  },
  addSap() {
    tone(392, { duration: 0.08, type: 'triangle', slide: 100, volume: 0.09 });
    tone(523, { start: 0.09, duration: 0.08, type: 'triangle', volume: 0.08 });
  },
  drawOff() {
    tone(523, { duration: 0.08 });
    tone(659, { start: 0.09, duration: 0.08 });
    tone(880, { start: 0.18, duration: 0.14 });
  },
  burn() {
    tone(330, { duration: 0.3, type: 'sawtooth', slide: -260, volume: 0.07 });
    tone(165, { start: 0.15, duration: 0.35, type: 'square', slide: -110, volume: 0.06 });
  },
  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => tone(n, { start: i * 0.12, duration: 0.12 }));
    tone(1319, { start: 0.5, duration: 0.25, volume: 0.07 });
  },
};
