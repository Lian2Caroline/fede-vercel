// Professional ambient music — Web Audio API
// Style: corporate/fintech, 95 BPM, energetic but clean

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let scheduledNodes: AudioNode[] = [];
let loopTimeout: ReturnType<typeof setTimeout> | null = null;
let isPlaying = false;
let startPromise: Promise<void> | null = null;

const BPM = 95;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const LOOP_BARS = 8; // 8-bar loop

// Notes (Hz)
const N: Record<string, number> = {
  C2: 65.41, G2: 98.00, A2: 110.00, F2: 87.31,
  C3: 130.81, E3: 164.81, G3: 196.00, A3: 220.00, F3: 174.61, D3: 146.83,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33,
};

// 8-bar chord progression (each bar = 4 beats)
const CHORDS = [
  { root: N.C2, notes: [N.C3, N.E4, N.G4, N.C5] },  // bar 1: Cmaj
  { root: N.C2, notes: [N.C3, N.E4, N.G4, N.B4] },  // bar 2: Cmaj7
  { root: N.A2, notes: [N.A3, N.C4, N.E4, N.A4] },  // bar 3: Am
  { root: N.A2, notes: [N.A3, N.C4, N.E4, N.G4] },  // bar 4: Am7
  { root: N.F2, notes: [N.F3, N.A4, N.C5, N.F4] },  // bar 5: F
  { root: N.F2, notes: [N.F3, N.A4, N.C5, N.D5] },  // bar 6: Fmaj9
  { root: N.G2, notes: [N.G3, N.B4, N.D5, N.G4] },  // bar 7: G
  { root: N.G2, notes: [N.G3, N.D4, N.G4, N.B4] },  // bar 8: Gsus4 → G
];

// Rhythmic bass line pattern (beats within bar, 0-indexed)
const BASS_PATTERN = [0, 0.5, 1.5, 2, 2.75, 3]; // syncopated

// Melodic motif over the 8 bars
const MELODY: Array<{ beat: number; bar: number; freq: number; dur: number }> = [
  { bar: 0, beat: 0, freq: N.C5, dur: 0.9 },
  { bar: 0, beat: 1, freq: N.E4, dur: 0.5 },
  { bar: 0, beat: 2, freq: N.G4, dur: 0.7 },
  { bar: 0, beat: 3, freq: N.B4, dur: 0.9 },
  { bar: 1, beat: 0, freq: N.C5, dur: 1.8 },
  { bar: 1, beat: 2, freq: N.G4, dur: 0.5 },
  { bar: 1, beat: 3, freq: N.E4, dur: 0.7 },
  { bar: 2, beat: 0, freq: N.A4, dur: 0.9 },
  { bar: 2, beat: 1, freq: N.C5, dur: 0.5 },
  { bar: 2, beat: 2, freq: N.E4, dur: 0.7 },
  { bar: 2, beat: 3, freq: N.G4, dur: 0.9 },
  { bar: 3, beat: 0, freq: N.A4, dur: 1.8 },
  { bar: 3, beat: 2, freq: N.C5, dur: 0.5 },
  { bar: 3, beat: 3, freq: N.A4, dur: 0.7 },
  { bar: 4, beat: 0, freq: N.C5, dur: 0.9 },
  { bar: 4, beat: 1, freq: N.A4, dur: 0.5 },
  { bar: 4, beat: 2, freq: N.F4, dur: 0.7 },
  { bar: 4, beat: 3, freq: N.A4, dur: 0.5 },
  { bar: 5, beat: 0, freq: N.C5, dur: 0.9 },
  { bar: 5, beat: 1.5, freq: N.D5, dur: 0.5 },
  { bar: 5, beat: 2, freq: N.C5, dur: 0.7 },
  { bar: 5, beat: 3, freq: N.A4, dur: 0.9 },
  { bar: 6, beat: 0, freq: N.B4, dur: 0.9 },
  { bar: 6, beat: 1, freq: N.D5, dur: 0.5 },
  { bar: 6, beat: 2, freq: N.G4, dur: 0.7 },
  { bar: 6, beat: 3, freq: N.B4, dur: 0.9 },
  { bar: 7, beat: 0, freq: N.G4, dur: 1.2 },
  { bar: 7, beat: 2, freq: N.B4, dur: 0.7 },
  { bar: 7, beat: 3, freq: N.D5, dur: 0.9 },
];

function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function createReverb(ctx: AudioContext, decay = 1.8): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * decay;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let c = 0; c < 2; c++) {
    const ch = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

function createHighpass(ctx: AudioContext, freq: number): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = freq;
  return f;
}

function note(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  t: number,
  dur: number,
  vol: number,
  type: OscillatorType = 'sine',
  attack = 0.04,
  release = 0.12,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + dur - release);
  g.gain.linearRampToValueAtTime(0, t + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.05);
  scheduledNodes.push(osc, g);
}

function kick(ctx: AudioContext, dest: AudioNode, t: number, vol = 0.55) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + 0.2);
  scheduledNodes.push(osc, g);
}

function snare(ctx: AudioContext, dest: AudioNode, t: number, vol = 0.18) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = createHighpass(ctx, 1800);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  src.connect(hp);
  hp.connect(g);
  g.connect(dest);
  src.start(t);
  scheduledNodes.push(src, hp, g);

  // Tonal snare body
  const o = ctx.createOscillator();
  const og = ctx.createGain();
  o.frequency.setValueAtTime(200, t);
  o.frequency.exponentialRampToValueAtTime(120, t + 0.06);
  og.gain.setValueAtTime(vol * 0.6, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o.connect(og); og.connect(dest);
  o.start(t); o.stop(t + 0.1);
  scheduledNodes.push(o, og);
}

function hihat(ctx: AudioContext, dest: AudioNode, t: number, open = false, vol = 0.06) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * (open ? 0.18 : 0.04), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = createHighpass(ctx, 7000);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.18 : 0.04));
  src.connect(hp); hp.connect(g); g.connect(dest);
  src.start(t);
  scheduledNodes.push(src, hp, g);
}

function scheduleLoop(startTime: number): void {
  const ctx = getCtx();
  if (!masterGain || !isPlaying) return;

  const reverbNode = createReverb(ctx, 1.6);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.18;
  reverbNode.connect(reverbGain);
  reverbGain.connect(masterGain);

  const dry = ctx.createGain();
  dry.gain.value = 1.0;
  dry.connect(masterGain);
  scheduledNodes.push(reverbNode, reverbGain, dry);

  const loopDur = BAR * LOOP_BARS;

  // ── DRUMS (4/4, loop 8 bars) ──
  for (let bar = 0; bar < LOOP_BARS; bar++) {
    const barT = startTime + bar * BAR;
    // Kick: beat 1 + 3
    kick(ctx, dry, barT);
    kick(ctx, dry, barT + BEAT * 2);
    // Extra kick 16th anticipation on bar 3, 7
    if (bar === 2 || bar === 6) kick(ctx, dry, barT + BEAT * 3.75, 0.35);
    // Snare: beat 2 + 4
    snare(ctx, dry, barT + BEAT);
    snare(ctx, dry, barT + BEAT * 3);
    // Hi-hat: 8th notes
    for (let h = 0; h < 8; h++) {
      hihat(ctx, dry, barT + (BEAT / 2) * h, h === 6, h % 2 === 0 ? 0.07 : 0.045);
    }
  }

  // ── BASS ──
  for (let bar = 0; bar < LOOP_BARS; bar++) {
    const ch = CHORDS[bar];
    const barT = startTime + bar * BAR;
    BASS_PATTERN.forEach(beat => {
      const variation = beat > 2 ? ch.root * 1.0 : ch.root;
      note(ctx, dry, variation, barT + beat * BEAT, BEAT * 0.42, 0.28, 'triangle', 0.01, 0.08);
    });
  }

  // ── PADS (chords) ──
  for (let bar = 0; bar < LOOP_BARS; bar++) {
    const ch = CHORDS[bar];
    const barT = startTime + bar * BAR;
    ch.notes.forEach((freq, i) => {
      note(ctx, reverbNode, freq, barT + i * 0.03, BAR * 0.88, 0.038, 'triangle', 0.25, 0.5);
      note(ctx, dry, freq, barT + i * 0.03, BAR * 0.88, 0.022, 'triangle', 0.25, 0.5);
    });
  }

  // ── MELODY ──
  MELODY.forEach(({ bar, beat, freq, dur }) => {
    const t = startTime + bar * BAR + beat * BEAT;
    note(ctx, dry, freq, t, dur * BEAT, 0.052, 'sine', 0.02, 0.08);
    note(ctx, reverbNode, freq, t, dur * BEAT, 0.032, 'sine', 0.02, 0.1);
  });

  // ── Schedule next loop ──
  const msUntil = Math.max(0, (startTime + loopDur - ctx.currentTime - 0.15) * 1000);
  loopTimeout = setTimeout(() => {
    if (isPlaying) scheduleLoop(startTime + loopDur);
  }, msUntil);
}

export function speakScene(_key: string): void {
  startMusic();
}

export function startMusic(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (isPlaying) return Promise.resolve();
  if (startPromise) return startPromise;
  startPromise = (async () => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch { /**/ }
      }
      if (ctx.state !== 'running') return;
      if (isPlaying) return; // re-check after await
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.68, ctx.currentTime + 0.8);
      masterGain.connect(ctx.destination);
      isPlaying = true;
      scheduleLoop(ctx.currentTime + 0.05);
      notifyPlaying();
    } catch { /**/ }
    finally { startPromise = null; }
  })();
  return startPromise;
}

// ── Listeners so UI can hide the "click to enable sound" overlay ──
type PlayingListener = (playing: boolean) => void;
const playingListeners = new Set<PlayingListener>();
function notifyPlaying() { playingListeners.forEach(l => { try { l(isPlaying); } catch { /**/ } }); }
export function onPlayingChange(cb: PlayingListener): () => void {
  playingListeners.add(cb);
  cb(isPlaying);
  return () => { playingListeners.delete(cb); };
}
export function isMusicPlaying(): boolean { return isPlaying; }

export function stopNarration(): void {
  isPlaying = false;
  startPromise = null;
  notifyPlaying();
  if (loopTimeout !== null) { clearTimeout(loopTimeout); loopTimeout = null; }
  if (masterGain && audioCtx) {
    try { masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4); } catch { /**/ }
  }
  setTimeout(() => {
    scheduledNodes.forEach(n => {
      try { (n as OscillatorNode).stop?.(); } catch { /**/ }
      try { n.disconnect(); } catch { /**/ }
    });
    scheduledNodes = [];
    masterGain = null;
  }, 500);
}

export function setMuted(muted: boolean): void {
  if (muted) stopNarration();
  else startMusic();
}
