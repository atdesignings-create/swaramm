/**
 * audio.ts — Swaram's AudioEngine.
 *
 * WHAT: Microphone capture + real-time pitch detection (autocorrelation),
 *       plus a small synthesiser for reference tones and melodies.
 * WHY:  This is the heart of the coach: without accurate pitch we cannot
 *       score, unlock levels, or give honest-but-kind feedback.
 * HOW:  Browser-only. Every entry point is a function (never module scope),
 *       so importing this file during SSR is completely safe.
 */

export interface PitchSample {
  /** Detected fundamental in Hz, or null when the signal is too quiet/noisy. */
  freq: number | null;
  /** RMS loudness 0..1, used for the "are you singing?" indicator. */
  volume: number;
  /** Detection confidence 0..1 from the autocorrelation peak. */
  clarity: number;
  timestamp: number;
}

/**
 * WHAT: Autocorrelation pitch detector (ACF2+ style).
 * WHY:  Autocorrelation is robust for the human voice — far more reliable
 *       than raw FFT peak-picking, which trips over vocal overtones.
 * HOW:  1) Reject quiet buffers. 2) Trim silence. 3) Correlate the buffer
 *       against shifted copies of itself. 4) Parabolic-interpolate the best
 *       lag for sub-sample precision, then convert lag -> Hz.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  minVolume = 0.01,
): { freq: number | null; volume: number; clarity: number } {
  const size = buffer.length;
  let sumSquares = 0;
  for (let i = 0; i < size; i++) sumSquares += buffer[i]! * buffer[i]!;
  const rms = Math.sqrt(sumSquares / size);
  if (rms < minVolume) return { freq: null, volume: rms, clarity: 0 };

  // Trim leading/trailing near-silence so the correlation window is all voice.
  const threshold = 0.2;
  let start = 0;
  let end = size - 1;
  while (start < size / 2 && Math.abs(buffer[start]!) < threshold) start++;
  while (end > size / 2 && Math.abs(buffer[end]!) < threshold) end--;
  const trimmed = buffer.slice(start, end);
  const n = trimmed.length;
  if (n < 128) return { freq: null, volume: rms, clarity: 0 };

  const correlations = new Float32Array(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += trimmed[i]! * trimmed[i + lag]!;
    correlations[lag] = sum;
  }

  // Walk past the initial downward slope, then find the first strong peak.
  let d = 0;
  while (d < n - 1 && correlations[d]! > correlations[d + 1]!) d++;
  let maxVal = -1;
  let maxLag = -1;
  for (let lag = d; lag < n; lag++) {
    if (correlations[lag]! > maxVal) {
      maxVal = correlations[lag]!;
      maxLag = lag;
    }
  }
  if (maxLag <= 0) return { freq: null, volume: rms, clarity: 0 };

  // Parabolic interpolation around the peak for fractional-lag precision.
  const y1 = correlations[maxLag - 1] ?? 0;
  const y2 = correlations[maxLag] ?? 0;
  const y3 = correlations[maxLag + 1] ?? 0;
  const a = (y1 + y3 - 2 * y2) / 2;
  const b = (y3 - y1) / 2;
  const shift = a !== 0 ? -b / (2 * a) : 0;
  const freq = sampleRate / (maxLag + shift);
  const zero = correlations[0] ?? 0;
  const clarity = zero > 0 ? Math.min(1, maxVal / zero) : 0;


  // Human voice lives roughly between 60 Hz and 1300 Hz — reject the rest.
  if (freq < 60 || freq > 1300 || clarity < 0.45) {
    return { freq: null, volume: rms, clarity };
  }
  return { freq, volume: rms, clarity };
}

/**
 * WHAT: Owns the AudioContext, microphone stream and the analysis loop.
 * WHY:  One shared engine avoids duplicate mic prompts and stuck streams.
 * HOW:  `start()` requests the mic, then rAF-loops pitch detection and
 *       pushes samples to whoever subscribed.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array | null = null;
  private raf = 0;
  private listeners = new Set<(s: PitchSample) => void>();

  /** Mic sensitivity 0.005 (very sensitive) .. 0.06 (only loud singing). */
  sensitivity = 0.015;

  get listening() {
    return this.raf !== 0;
  }

  /** WHAT: Lazily creates the AudioContext (also used by the synth). */
  context(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** WHAT: Requests the microphone and begins emitting pitch samples. */
  async start(): Promise<void> {
    if (this.listening) return;
    const ctx = this.context();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    const source = ctx.createMediaStreamSource(this.stream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    source.connect(this.analyser);
    this.buffer = new Float32Array(this.analyser.fftSize);

    const loop = () => {
      if (!this.analyser || !this.buffer) return;
      this.analyser.getFloatTimeDomainData(this.buffer);
      const result = detectPitch(this.buffer, ctx.sampleRate, this.sensitivity);
      const sample: PitchSample = { ...result, timestamp: performance.now() };
      this.listeners.forEach((fn) => fn(sample));
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** WHAT: Stops analysis and releases the microphone (privacy matters). */
  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.analyser = null;
  }

  /** WHAT: Subscribe to live pitch samples. Returns an unsubscribe function. */
  subscribe(fn: (s: PitchSample) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /**
   * WHAT: Plays a warm reference tone at a given frequency.
   * WHY:  Learners need to hear the target before they sing it.
   * HOW:  Triangle oscillator + gain envelope so it never clicks or startles.
   */
  playTone(freq: number, durationMs = 900, when = 0): void {
    const ctx = this.context();
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000 + 0.05);
  }

  /** WHAT: Plays a sequence of frequencies — the exercise's reference melody. */
  playSequence(freqs: number[], noteMs = 700): void {
    freqs.forEach((f, i) => this.playTone(f, noteMs * 0.9, (i * noteMs) / 1000));
  }
}

/** WHAT: One shared engine instance, created lazily in the browser only. */
let engine: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!engine) engine = new AudioEngine();
  return engine;
}
