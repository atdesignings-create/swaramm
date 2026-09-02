/**
 * Diagnostic.tsx — the zero-pressure vocal check.
 *
 * WHAT: Three guided recordings (low note, high note, steady hold) that
 *       produce a vocal range, voice type, steadiness and accuracy report.
 * WHY:  It personalises the whole learning path — and it's the moment a
 *       nervous beginner discovers their voice is already worth something.
 * HOW:  Uses the live pitch hook, collects samples per step, then summarises
 *       with music.ts helpers and stores the result in the Tracker.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/swaram/i18n";
import {
  classifyVoice,
  midiToName,
  rangeInSemitones,
} from "@/lib/swaram/music";
import { update, useSwaram, type Diagnostic as DiagnosticResult } from "@/lib/swaram/store";
import { usePitch } from "./usePitch";
import { PitchCanvas } from "./PitchCanvas";

const STEPS = ["diagLow", "diagHigh", "diagHold"] as const;

export function Diagnostic({ onDone }: { onDone: () => void }) {
  const state = useSwaram();
  const lang = state.lang;
  const pitch = usePitch(state.sensitivity);
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const collected = useRef<number[][]>([[], [], []]);

  useEffect(() => {
    if (!recording || !pitch.reading) return;
    collected.current[step].push(pitch.reading.midi);
  }, [recording, pitch.reading, step]);

  /** WHAT: Records one step for 5 seconds, then advances or summarises. */
  const record = useCallback(async () => {
    collected.current[step] = [];
    if (!pitch.active) await pitch.start();
    setRecording(true);
    window.setTimeout(() => {
      setRecording(false);
      if (step < 2) {
        setStep(step + 1);
        return;
      }
      const [lows, highs, holds] = collected.current;
      const median = (arr: number[]) => {
        if (!arr.length) return null;
        const s = [...arr].sort((a, b) => a - b);
        return s[Math.floor(s.length / 2)];
      };
      const low = median(lows) ?? 48;
      const high = median(highs) ?? 64;
      const lowMidi = Math.min(low, high);
      const highMidi = Math.max(low, high);
      // Steadiness = how little the held note wandered (in cents).
      const holdMedian = median(holds) ?? lowMidi;
      const drift =
        holds.length > 1
          ? holds.reduce((a, v) => a + Math.abs(v - holdMedian), 0) / holds.length
          : 1;
      const steadiness = Math.max(0, Math.round(100 - drift * 120));
      const nearestCents =
        holds.length > 0
          ? Math.abs(holdMedian - Math.round(holdMedian)) * 100
          : 50;
      const accuracy = Math.max(0, Math.round(100 - (nearestCents / 50) * 100));

      const diag: DiagnosticResult = {
        lowMidi,
        highMidi,
        lowName: midiToName(lowMidi),
        highName: midiToName(highMidi),
        voiceType: classifyVoice(lowMidi, highMidi),
        steadiness,
        accuracy,
        takenAt: new Date().toISOString(),
      };
      setResult(diag);
      update({ diagnostic: diag, onboarded: true });
      pitch.stop();
    }, 5200);
  }, [step, pitch]);

  if (result) {
    const span = rangeInSemitones(result.lowMidi, result.highMidi);
    return (
      <div className="animate-rise rounded-3xl border border-border bg-card p-6 shadow-sm">
        <Sparkles className="size-8 text-primary" />
        <h2 className="mt-3 text-2xl font-semibold">{t(lang, "greatWork")}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label={t(lang, "yourRange")} value={`${result.lowName} – ${result.highName}`} sub={`${span} semitones`} />
          <Stat label={t(lang, "voiceType")} value={result.voiceType} />
          <Stat label={t(lang, "steadiness")} value={`${result.steadiness}%`} />
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <p className="rounded-2xl bg-secondary/60 p-3">
            <strong>{t(lang, "strengths")}:</strong>{" "}
            {result.steadiness > 60
              ? "Your held note stays lovely and calm — that's real breath control."
              : "You found and produced clear pitches. That's the hardest first step, done."}
          </p>
          <p className="rounded-2xl bg-accent/30 p-3">
            <strong>{t(lang, "focus")}:</strong>{" "}
            {span < 12
              ? "We'll gently widen your range with easy five-note walks."
              : "We'll smooth out the wobble with steady-tone and breath drills."}
          </p>
        </div>
        <Button className="mt-6 w-full rounded-full" onClick={onDone}>
          {t(lang, "seePlan")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t(lang, "step")} {step + 1} / 3
      </p>
      <h2 className="mt-2 text-xl font-semibold">{t(lang, STEPS[step])}</h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <Wind className="mt-0.5 size-4 shrink-0" />
        {t(lang, "diagHint")}
      </p>

      <PitchCanvas
        historyRef={pitch.historyRef}
        className="mt-4 h-40 w-full rounded-2xl border border-border bg-background"
      />

      <div className="mt-3 text-center font-mono text-lg font-semibold text-primary">
        {pitch.reading ? pitch.reading.name : "—"}
      </div>

      <Button
        className="mt-4 w-full rounded-full"
        onClick={record}
        disabled={recording}
      >
        <Mic className="size-4" />
        {recording ? t(lang, "listening") : t(lang, "startMic")}
      </Button>
      {pitch.error && (
        <p className="mt-3 text-center text-xs text-muted-foreground">{t(lang, "micDenied")}</p>
      )}
      <button
        onClick={() => {
          update({ onboarded: true });
          onDone();
        }}
        className="mt-3 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        {t(lang, "skip")}
      </button>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
