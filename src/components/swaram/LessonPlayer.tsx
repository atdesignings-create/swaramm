/**
 * LessonPlayer.tsx — the lesson modal / practice runner.
 *
 * WHAT: Plays an exercise's reference notes, listens while the learner sings
 *       each note, scores accuracy, and awards 1-3 stars at the end.
 * WHY:  This single component is where mastery (and therefore unlocking)
 *       is actually earned, so its scoring must be consistent everywhere.
 * HOW:  Per note: play the reference tone, then sample the sung pitch for a
 *       short window and score the median cents error. Scores average into
 *       the session accuracy, which the Tracker blends into level mastery.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Play, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAudioEngine } from "@/lib/swaram/audio";
import { centsToScore, midiToFreq, midiToName, freqToMidi } from "@/lib/swaram/music";
import type { Exercise } from "@/lib/swaram/exercises";
import { recordSession, useSwaram } from "@/lib/swaram/store";
import { t } from "@/lib/swaram/i18n";
import { usePitch } from "./usePitch";
import { PitchCanvas } from "./PitchCanvas";

type Phase = "intro" | "listen" | "sing" | "done";

/** WHAT: 1-3 stars from an accuracy percentage. */
export function starsFor(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 75) return 2;
  if (accuracy >= 55) return 1;
  return 0;
}

export function LessonPlayer({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const state = useSwaram();
  const lang = state.lang;
  const pitch = usePitch(state.sensitivity);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const startedAt = useRef(Date.now());
  const samples = useRef<number[]>([]);

  const target = exercise.notes[index];

  // Collect sung MIDI values while in the "sing" phase.
  useEffect(() => {
    if (phase !== "sing" || !pitch.reading) return;
    samples.current.push(pitch.reading.midi);
  }, [phase, pitch.reading]);

  /** WHAT: Plays the reference tone for the current note. */
  const hearNote = useCallback(() => {
    getAudioEngine().playTone(midiToFreq(target), Math.max(700, exercise.tempoMs));
    setPhase("listen");
  }, [target, exercise.tempoMs]);

  /** WHAT: Opens a listening window, then scores what was sung. */
  const singNote = useCallback(async () => {
    samples.current = [];
    setPhase("sing");
    if (!pitch.active) await pitch.start();
    window.setTimeout(() => {
      const vals = samples.current;
      let score = 0;
      if (vals.length >= 3) {
        const sorted = [...vals].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        // Octave-forgiving: singing the right note an octave off still counts.
        const diff = median - target;
        const folded = diff - 12 * Math.round(diff / 12);
        score = centsToScore(folded * 100);
      }
      const next = [...scores, score];
      setScores(next);
      if (index + 1 < exercise.notes.length) {
        setIndex(index + 1);
        setPhase("intro");
      } else {
        const accuracy = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        recordSession({
          level: exercise.level,
          kind: exercise.kind,
          accuracy,
          stars: starsFor(accuracy),
          seconds: Math.round((Date.now() - startedAt.current) / 1000),
        });
        setPhase("done");
        pitch.stop();
      }
    }, 2600);
  }, [pitch, target, scores, index, exercise, ]);

  const accuracy =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  const stars = starsFor(accuracy);

  const live = pitch.reading;
  const hint = !live
    ? t(lang, "quiet")
    : Math.abs(freqToMidi(live.freq) - target) < 0.3
      ? t(lang, "spotOn")
      : freqToMidi(live.freq) < target
        ? t(lang, "higher")
        : t(lang, "lower");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="animate-rise w-full max-w-lg rounded-t-3xl border border-border bg-card p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Level {exercise.level}
            </p>
            <h2 className="text-xl font-semibold">
              {lang === "ml" ? exercise.titleMl : exercise.title}
            </h2>
          </div>
          <button
            onClick={() => {
              pitch.stop();
              onClose();
            }}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        {phase !== "done" ? (
          <>
            <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-sm text-secondary-foreground">
              {lang === "ml" ? exercise.tipMl : exercise.tip}
            </p>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t(lang, "step")} {index + 1} / {exercise.notes.length}
              </span>
              <span className="font-mono text-base font-semibold text-primary">
                {midiToName(target)}
              </span>
            </div>

            <PitchCanvas
              historyRef={pitch.historyRef}
              targetMidi={target}
              className="mt-3 h-40 w-full rounded-2xl border border-border bg-background"
            />

            <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
              {phase === "sing" ? hint : t(lang, "breathTip")}
            </p>

            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1 rounded-full" onClick={hearNote}>
                <Play className="size-4" /> {t(lang, "hear")}
              </Button>
              <Button
                className="flex-1 rounded-full"
                onClick={singNote}
                disabled={phase === "sing"}
              >
                <Mic className="size-4" />
                {phase === "sing" ? t(lang, "listening") : t(lang, "sing")}
              </Button>
            </div>

            {pitch.error && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t(lang, "micDenied")}
              </p>
            )}
          </>
        ) : (
          <div className="animate-rise py-6 text-center">
            <Sparkles className="mx-auto size-10 text-primary" />
            <h3 className="mt-3 text-2xl font-semibold">
              {accuracy >= 75 ? t(lang, "greatWork") : t(lang, "closeTry")}
            </h3>
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={
                    s <= stars
                      ? "size-9 fill-accent text-accent"
                      : "size-9 text-muted-foreground/40"
                  }
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t(lang, "accuracy")}: <span className="font-semibold text-foreground">{accuracy}%</span>
            </p>
            <Button className="mt-6 w-full rounded-full" onClick={onClose}>
              {t(lang, "continue")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
