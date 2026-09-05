/**
 * songs.tsx — song practice (karaoke) screen.
 *
 * WHAT: A curated Malayalam-first song library plus paste-your-own lyrics,
 *       with synchronised lyric scrolling, live pitch tracking and a
 *       line-by-line report at the end.
 * WHY:  Songs are the reason people practise; feedback tied to a lyric line
 *       ("at 0:42 on 'Premam' you went flat") is what a real coach gives.
 * HOW:  Each line's reference melody is synthesised while the sung pitch is
 *       collected, then analyseSong() turns takes into plain-language notes.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Music2, X } from "lucide-react";
import { AppShell } from "@/components/swaram/AppShell";
import { PitchCanvas } from "@/components/swaram/PitchCanvas";
import { usePitch } from "@/components/swaram/usePitch";
import { starsFor } from "@/components/swaram/LessonPlayer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAudioEngine } from "@/lib/swaram/audio";
import { midiToFreq } from "@/lib/swaram/music";
import { t } from "@/lib/swaram/i18n";
import { currentLevel, recordSession, useSwaram } from "@/lib/swaram/store";
import {
  SONGS,
  analyseSong,
  songFromLyrics,
  type LineTake,
  type LineVerdict,
  type Song,
} from "@/lib/swaram/songs";

export const Route = createFileRoute("/songs")({
  head: () => ({
    meta: [
      { title: "Song practice — Malayalam and international singing tracks | Swaram" },
      {
        name: "description",
        content:
          "Sing along to Malayalam classics, folk, light music and international starters with live pitch tracking and line-by-line feedback.",
      },
      { property: "og:title", content: "Song practice with live pitch feedback | Swaram" },
      {
        property: "og:description",
        content:
          "Karaoke-style practice for Malayalam and international songs, with a gentle line-by-line pitch report.",
      },
    ],
  }),
  component: SongsPage,
});

function SongsPage() {
  const state = useSwaram();
  const lang = state.lang;
  const [song, setSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState("");

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">{t(lang, "songLib")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(lang, "songSub")}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {SONGS.map((s) => (
          <div key={s.id} className="animate-rise rounded-3xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">
              {s.lang} · {s.tradition}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{s.title}</h2>
            <p className="text-sm text-muted-foreground">
              {s.lines.length} {t(lang, "lines")}
            </p>
            <Button className="mt-3 rounded-full" onClick={() => setSong(s)}>
              <Music2 className="size-4" /> {t(lang, "playSong")}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{t(lang, "pasteLyrics")}</h2>
        <Textarea
          rows={5}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="One line per row…"
          className="mt-3 rounded-2xl"
        />
        <Button
          className="mt-3 w-full rounded-full"
          disabled={!lyrics.trim()}
          onClick={() => setSong(songFromLyrics(lyrics))}
        >
          {t(lang, "pasteGo")}
        </Button>
      </div>

      {song && <SongRunner song={song} onClose={() => setSong(null)} />}
    </AppShell>
  );
}

/** WHAT: Runs one song: reference melody, scrolling lyric, live pitch, report. */
function SongRunner({ song, onClose }: { song: Song; onClose: () => void }) {
  const state = useSwaram();
  const lang = state.lang;
  const pitch = usePitch(state.sensitivity);
  const [line, setLine] = useState(-1);
  const [report, setReport] = useState<LineVerdict[] | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const takes = useRef<LineTake[]>([]);
  const elapsed = useRef(0);
  const timer = useRef<number | null>(null);

  // Collect sung pitches into the currently highlighted line.
  useEffect(() => {
    if (line < 0 || !pitch.reading) return;
    takes.current[line]?.samples.push(pitch.reading.midi);
  }, [line, pitch.reading]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const finish = useCallback(() => {
    pitch.stop();
    const verdicts = analyseSong(song, takes.current);
    const acc = verdicts.length
      ? Math.round(verdicts.reduce((a, v) => a + v.score, 0) / verdicts.length)
      : 0;
    setAccuracy(acc);
    setReport(verdicts);
    recordSession({
      level: currentLevel(state),
      kind: "pitch-match",
      accuracy: acc,
      stars: starsFor(acc),
      seconds: Math.round(elapsed.current),
    });
  }, [pitch, song, state]);

  const run = useCallback(async () => {
    takes.current = [];
    elapsed.current = 0;
    if (!pitch.active) await pitch.start();
    let i = 0;
    const step = () => {
      if (i >= song.lines.length) {
        finish();
        return;
      }
      const current = song.lines[i]!;
      takes.current[i] = { time: elapsed.current, samples: [] };
      setLine(i);
      getAudioEngine().playSequence(
        current.notes.map((n) => midiToFreq(n)),
        song.tempoMs,
      );
      const dur = current.notes.length * song.tempoMs;
      elapsed.current += dur / 1000;
      i += 1;
      timer.current = window.setTimeout(step, dur + 300);
    };
    step();
  }, [pitch, song, finish]);

  const stars = starsFor(accuracy);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="animate-rise max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {song.lang} · {song.tradition}
            </p>
            <h2 className="text-xl font-semibold">{song.title}</h2>
          </div>
          <button
            onClick={() => {
              pitch.stop();
              if (timer.current) window.clearTimeout(timer.current);
              onClose();
            }}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        {report ? (
          <div className="animate-rise mt-4">
            <h3 className="text-lg font-semibold">{t(lang, "songReport")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(lang, "accuracy")}:{" "}
              <span className="font-semibold text-foreground">{accuracy}%</span> ·{" "}
              {"★".repeat(stars)}
              {"☆".repeat(3 - stars)}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {report.map((r, i) => (
                <li key={i} className="rounded-2xl bg-secondary/50 p-3">
                  {r.text}
                </li>
              ))}
            </ul>
            <Button className="mt-5 w-full rounded-full" onClick={onClose}>
              {t(lang, "continue")}
            </Button>
          </div>
        ) : (
          <>
            <PitchCanvas
              historyRef={pitch.historyRef}
              targetMidi={line >= 0 ? (song.lines[line]?.notes[0] ?? null) : null}
              className="mt-4 h-32 w-full rounded-2xl border border-border bg-background"
            />
            <div className="mt-4 space-y-1">
              {song.lines.map((l, i) => (
                <p
                  key={i}
                  className={
                    i === line
                      ? "scale-[1.02] rounded-2xl bg-secondary px-3 py-2 font-semibold transition-all"
                      : "rounded-2xl px-3 py-2 text-muted-foreground transition-all"
                  }
                >
                  {l.text}
                </p>
              ))}
            </div>
            <Button
              className="mt-4 w-full rounded-full"
              onClick={run}
              disabled={line >= 0}
            >
              <Mic className="size-4" />
              {line >= 0 ? t(lang, "listening") : t(lang, "playSong")}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {pitch.error ? t(lang, "micDenied") : t(lang, "breathTip")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
