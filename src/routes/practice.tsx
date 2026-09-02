/**
 * /practice — the open exercise library.
 *
 * WHAT: Browse the 1000+ generated drills by category and level, and run any
 *       of them that belongs to an unlocked level.
 * WHY:  Some days you don't want a lesson — you want one specific warm-up.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock, Play } from "lucide-react";
import { AppShell } from "@/components/swaram/AppShell";
import { LessonPlayer } from "@/components/swaram/LessonPlayer";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/swaram/i18n";
import {
  CATEGORIES,
  allExercises,
  exerciseCount,
  type Exercise,
  type ExerciseKind,
} from "@/lib/swaram/exercises";
import { isLevelUnlocked, useSwaram } from "@/lib/swaram/store";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice library — 1000+ vocal warm-ups and drills | Swaram" },
      {
        name: "description",
        content:
          "Browse thousands of generated vocal exercises: breath control, pitch matching, scales, arpeggios, interval leaps, agility runs and sargam.",
      },
      { property: "og:title", content: "Swaram practice library" },
      {
        property: "og:description",
        content: "Thousands of warm-ups and drills with live pitch scoring.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const state = useSwaram();
  const lang = state.lang;
  const [kind, setKind] = useState<ExerciseKind>("breath");
  const [active, setActive] = useState<Exercise | null>(null);

  const category = CATEGORIES.find((c) => c.id === kind)!;
  const list = useMemo(
    () => allExercises().filter((e) => e.kind === kind).slice(0, 60),
    [kind],
  );

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t(lang, "library")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {exerciseCount().toLocaleString()} · {t(lang, "librarySub")}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setKind(c.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              c.id === kind
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {lang === "ml" ? c.nameMl : c.name}
          </button>
        ))}
      </div>

      <p className="mt-4 rounded-2xl bg-secondary/60 p-3 text-sm text-secondary-foreground">
        {lang === "ml" ? category.tipMl : category.tip}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((ex) => {
          const unlocked = isLevelUnlocked(ex.level, state);
          return (
            <div
              key={ex.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  Level {ex.level} · {ex.notes.length} notes
                </p>
                <p className="truncate font-medium">{ex.title}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {ex.noteNames.join(" · ")}
                </p>
              </div>
              <Button
                size="icon"
                variant={unlocked ? "default" : "secondary"}
                className="rounded-full"
                disabled={!unlocked}
                aria-label={unlocked ? t(lang, "startLesson") : t(lang, "locked")}
                onClick={() => setActive(ex)}
              >
                {unlocked ? <Play className="size-4" /> : <Lock className="size-4" />}
              </Button>
            </div>
          );
        })}
      </div>

      {active && <LessonPlayer exercise={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}
