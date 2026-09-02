/**
 * /lessons — the mastery-locked curriculum.
 *
 * WHAT: Ten levels; each shows its mastery ring and a start button. Levels
 *       stay locked until the previous one reaches 85% mastery.
 * WHY:  Locking protects the learner from drills they aren't ready for.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Play } from "lucide-react";
import { AppShell, ProgressRing } from "@/components/swaram/AppShell";
import { LessonPlayer } from "@/components/swaram/LessonPlayer";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/swaram/i18n";
import {
  CURRICULUM,
  exercisesForLevel,
  pickLessonExercises,
  type Exercise,
} from "@/lib/swaram/exercises";
import { isLevelUnlocked, useSwaram } from "@/lib/swaram/store";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons — Swaram vocal levels from breathing to gamaka" },
      {
        name: "description",
        content:
          "Ten mastery-locked vocal levels: breathing, pitch matching, scales, arpeggios, interval leaps, agility, sargam and gamaka.",
      },
      { property: "og:title", content: "Swaram lessons — breathing to gamaka" },
      {
        property: "og:description",
        content: "Mastery-based vocal levels that unlock as your pitch accuracy grows.",
      },
    ],
  }),
  component: LessonsPage,
});

function LessonsPage() {
  const state = useSwaram();
  const lang = state.lang;
  const [active, setActive] = useState<Exercise | null>(null);

  /** WHAT: Starts a fresh drill for a level, varied by the day of the month. */
  const startLevel = (level: number) => {
    const seed = new Date().getDate() * 7 + level;
    const [ex] = pickLessonExercises(level, 1, seed);
    if (ex) setActive(ex);
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t(lang, "levels")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t(lang, "unlockAt")}</p>

      <div className="mt-6 space-y-3">
        {CURRICULUM.map((lvl) => {
          const unlocked = isLevelUnlocked(lvl.level, state);
          const mastery = state.mastery[lvl.level] ?? 0;
          const count = exercisesForLevel(lvl.level).length;
          return (
            <div
              key={lvl.level}
              className={`animate-rise flex items-center gap-4 rounded-3xl border border-border p-4 transition-colors ${
                unlocked ? "bg-card" : "bg-muted/40"
              }`}
            >
              <ProgressRing
                value={mastery}
                size={56}
                label={unlocked ? `${mastery}%` : ""}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Level {lvl.level} · {count} {t(lang, "exercisesIn")}
                </p>
                <p className="truncate font-semibold">
                  {lang === "ml" ? lvl.nameMl : lvl.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {unlocked
                    ? lang === "ml"
                      ? lvl.focusMl
                      : lvl.focus
                    : t(lang, "unlockAt")}
                </p>
              </div>
              {unlocked ? (
                <Button
                  className="rounded-full"
                  size="sm"
                  onClick={() => startLevel(lvl.level)}
                >
                  <Play className="size-4" />
                  {t(lang, "startLesson")}
                </Button>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  {t(lang, "locked")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {active && <LessonPlayer exercise={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}
