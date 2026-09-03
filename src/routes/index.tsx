/**
 * / — Swaram home.
 *
 * WHAT: Welcome + vocal diagnostic for new learners; a warm daily home
 *       screen (streak, stars, next lesson) for returning ones.
 * WHY:  The first screen must remove fear, not add features.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Sparkles, Star, Mic2 } from "lucide-react";
import { AppShell, ProgressRing } from "@/components/swaram/AppShell";
import { Diagnostic } from "@/components/swaram/Diagnostic";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/swaram/i18n";
import { CURRICULUM, exerciseCount } from "@/lib/swaram/exercises";
import { currentLevel, useSwaram } from "@/lib/swaram/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Swaram — Kind, accurate vocal coaching for every voice" },
      {
        name: "description",
        content:
          "Learn to sing with real-time pitch feedback, a 1000+ exercise library, mastery-based levels and Malayalam-first guidance. No judgement, just progress.",
      },
      { property: "og:title", content: "Swaram — vocal coaching for every voice" },
      {
        property: "og:description",
        content:
          "Real-time pitch analysis, gentle coaching and a Malayalam-first learning path for absolute beginners to advanced singers.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const state = useSwaram();
  const lang = state.lang;
  const [showDiag, setShowDiag] = useState(false);
  const level = currentLevel(state);
  const levelInfo = CURRICULUM[level - 1]!;
  const mastery = state.mastery[level] ?? 0;

  return (
    <AppShell>
      {!state.onboarded ? (
        <section className="animate-rise space-y-6">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-secondary/70 to-card p-8 text-center">
            <span className="mx-auto flex size-16 animate-breathe items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mic2 className="size-8" />
            </span>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              {t(lang, "welcomeTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              {t(lang, "welcomeBody")}
            </p>
            <p className="mt-4 text-sm font-medium text-primary">{t(lang, "tagline")}</p>
            {!showDiag && (
              <Button className="mt-6 rounded-full px-8" onClick={() => setShowDiag(true)}>
                {t(lang, "begin")}
              </Button>
            )}
          </div>
          {showDiag && <Diagnostic onDone={() => setShowDiag(false)} />}
        </section>
      ) : (
        <section className="animate-rise space-y-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/60 to-card p-6">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {t(lang, "appName")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t(lang, "tagline")}</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Tile icon={<Flame className="size-4" />} label={t(lang, "streak")} value={`${state.streak}`} />
              <Tile icon={<Star className="size-4" />} label={t(lang, "totalStars")} value={`${state.stars}`} />
              <Tile
                icon={<Sparkles className="size-4" />}
                label={t(lang, "mastery")}
                value={`${mastery}%`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
            <ProgressRing value={mastery} />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Level {level}
              </p>
              <p className="truncate font-semibold">
                {lang === "ml" ? levelInfo.nameMl : levelInfo.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "ml" ? levelInfo.focusMl : levelInfo.focus}
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/lessons">{t(lang, "startLesson")}</Link>
            </Button>
          </div>

          {state.diagnostic && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile label={t(lang, "yourRange")} value={`${state.diagnostic.lowName} – ${state.diagnostic.highName}`} />
              <Tile label={t(lang, "voiceType")} value={state.diagnostic.voiceType} />
              <Tile label={t(lang, "steadiness")} value={`${state.diagnostic.steadiness}%`} />
            </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{t(lang, "library")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(lang, "librarySub")}</p>
            <p className="mt-3 text-3xl font-semibold text-primary">
              {exerciseCount().toLocaleString()}
            </p>
            <Button asChild variant="secondary" className="mt-4 rounded-full">
              <Link to="/practice">{t(lang, "practice")}</Link>
            </Button>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
