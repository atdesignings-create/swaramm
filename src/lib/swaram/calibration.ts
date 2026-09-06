/**
 * calibration.ts — microphone calibration & latency measurement.
 *
 * WHAT: Measures the room's ambient noise floor, derives a sensible mic
 *       sensitivity (gain) threshold and a pitch-stability threshold, and
 *       measures the round-trip audio delay of the device.
 * WHY:  Every room and every phone is different. Without calibration, quiet
 *       singers get ignored and noisy rooms score phantom notes; without
 *       latency compensation the lyric sync and pitch audit blame the singer
 *       for the device's delay.
 * HOW:  Browser-only helpers that subscribe to the shared AudioEngine.
 */

import { getAudioEngine, type PitchSample } from "./audio";

export interface AmbientResult {
  /** Average noise-floor RMS while nobody sings. */
  noise: number;
  /** Peak noise RMS observed. */
  peak: number;
  /** Recommended mic sensitivity (RMS gate) for this room. */
  sensitivity: number;
  /** Recommended pitch-stability threshold in cents (bigger = noisier room). */
  stabilityCents: number;
  /** Plain-language verdict key: quiet | normal | noisy. */
  verdict: "quiet" | "normal" | "noisy";
}

/**
 * WHAT: Listens for `ms` milliseconds and reports the room's noise floor.
 * HOW:  Sensitivity sits comfortably above the noise floor (about 3x, clamped
 *       into the range the settings slider allows) so breath is ignored but
 *       soft singing is not.
 */
export function measureAmbient(ms = 3000): Promise<AmbientResult> {
  return new Promise((resolve) => {
    const engine = getAudioEngine();
    const values: number[] = [];
    const unsub = engine.subscribe((s: PitchSample) => values.push(s.volume));
    window.setTimeout(() => {
      unsub();
      const noise = values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0.004;
      const peak = values.length ? Math.max(...values) : noise;
      const sensitivity = Math.min(0.06, Math.max(0.005, +(noise * 3 + 0.004).toFixed(4)));
      const verdict: AmbientResult["verdict"] =
        noise < 0.006 ? "quiet" : noise < 0.018 ? "normal" : "noisy";
      const stabilityCents = verdict === "quiet" ? 35 : verdict === "normal" ? 45 : 60;
      resolve({ noise, peak, sensitivity, stabilityCents, verdict });
    }, ms);
  });
}

/**
 * WHAT: Measures how long the device takes to get its own sound back to the mic.
 * HOW:  Plays a short reference tone and stops the clock on the first frame
 *       that jumps clearly above the room's noise floor. Repeats and takes the
 *       median so one stray cough cannot skew it.
 */
export async function measureLatency(noiseFloor = 0.01, rounds = 3): Promise<number> {
  const engine = getAudioEngine();
  const results: number[] = [];
  const gate = Math.max(0.02, noiseFloor * 4);

  for (let i = 0; i < rounds; i++) {
    const value = await new Promise<number | null>((resolve) => {
      let t0 = 0;
      let done = false;
      const unsub = engine.subscribe((s: PitchSample) => {
        if (!done && t0 && s.timestamp > t0 && s.volume > gate) {
          done = true;
          unsub();
          resolve(s.timestamp - t0);
        }
      });
      t0 = performance.now();
      engine.playTone(440, 260);
      window.setTimeout(() => {
        if (!done) {
          done = true;
          unsub();
          resolve(null);
        }
      }, 700);
    });
    if (value != null) results.push(value);
    await new Promise((r) => window.setTimeout(r, 250));
  }

  if (results.length === 0) return 0;
  const sorted = results.sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  // Clamp into a believable range: browsers rarely exceed ~400 ms round trip.
  return Math.round(Math.min(400, Math.max(0, median)));
}
