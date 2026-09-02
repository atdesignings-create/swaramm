/**
 * usePitch.ts — React binding for the AudioEngine.
 *
 * WHAT: A hook that turns the mic on/off and exposes the latest pitch reading.
 * WHY:  Every screen (diagnostic, lesson, practice) needs the same live data
 *       without each one re-implementing subscription and cleanup.
 * HOW:  Subscribes to the shared engine inside useEffect (browser-only),
 *       throttling React updates to ~20fps to keep the UI smooth.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getAudioEngine, type PitchSample } from "@/lib/swaram/audio";
import { analyzeFreq, type NoteReading } from "@/lib/swaram/music";

export interface LivePitch {
  reading: NoteReading | null;
  volume: number;
  active: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  /** Rolling history of detected MIDI values, for the canvas curve. */
  historyRef: React.RefObject<number[]>;
}

export function usePitch(sensitivity = 0.015): LivePitch {
  const [reading, setReading] = useState<NoteReading | null>(null);
  const [volume, setVolume] = useState(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<number[]>([]);
  const lastPaint = useRef(0);

  useEffect(() => {
    const engine = getAudioEngine();
    engine.sensitivity = sensitivity;
    const unsub = engine.subscribe((s: PitchSample) => {
      if (s.freq) {
        const r = analyzeFreq(s.freq);
        historyRef.current.push(r.midi);
        if (historyRef.current.length > 240) historyRef.current.shift();
        if (s.timestamp - lastPaint.current > 50) {
          lastPaint.current = s.timestamp;
          setReading(r);
          setVolume(s.volume);
        }
      } else if (s.timestamp - lastPaint.current > 200) {
        lastPaint.current = s.timestamp;
        setReading(null);
        setVolume(s.volume);
      }
    });
    return () => {
      unsub();
    };
  }, [sensitivity]);

  const start = useCallback(async () => {
    try {
      await getAudioEngine().start();
      setError(null);
      setActive(true);
    } catch {
      setError("mic");
      setActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    getAudioEngine().stop();
    setActive(false);
    setReading(null);
  }, []);

  useEffect(() => () => getAudioEngine().stop(), []);

  return { reading, volume, active, error, start, stop, historyRef };
}
