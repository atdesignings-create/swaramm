/**
 * /dashboard — daily & weekly coaching report.
 *
 * WHAT: Streak, stars, minutes, an accuracy trend chart, the weakest drill
 *       categories, and an auto-generated timetable for next week.
 * WHY:  Progress you can see is progress you keep making.
 */

import { createFileRoute } from "@tanstack/react-router";
import { Flame, Star, Timer } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, ProgressRing } from "@/components/swaram/AppShell";
import { t } from "@/lib/swaram/i18n";
import { CATEGORIES } from "@/lib/swaram/exercises";
import { dailySeries, useSwaram, weakAreas, weeklyPlan } from "@/lib/swaram/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your progress — streaks, accuracy and weekly plan | Swaram" },
      {
        name: "description",
        content:
          "See your pitch accuracy trend, practice streak, stars earned and an automatically generated practice timetable for next week.",
      },
      { property: "og:title", content: "Swaram progress dashboard" },
      {
        property: "og:description",
        content: "Daily accuracy trends and an auto-built weekly practice plan.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const state = useSwaram();
  const lang = state.lang;
  const series = dailySeries(state);
  const weak = weakAreas(state);
  const plan = weeklyPlan(state);
  const minutes = Math.round(
    state.sessions.reduce((a, s) => a + s.seconds, 0) / 60,
  );
  const today = series[series.length - 1]?.accuracy ?? 0;
  const withData = series.filter((p) => p.accuracy > 0);
  const average = withData.length
    ? Math.round(withData.reduce((a, p) => a + p.accuracy, 0) / withData.length)
    : 0;

  const catName = (id: string) => {
    const c = CATEGORIES.find((x) => x.id === id);
    return c ? (lang === "ml" ? c.nameMl : c.name) : id;
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t(lang, "dashboard")}</h1>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric icon={<Flame className="size-4" />} label={t(lang, "streak")} value={`${state.streak}`} />
        <Metric icon={<Star className="size-4" />} label={t(lang, "totalStars")} value={`${state.stars}`} />
        <Metric icon={<Timer className="size-4" />} label={t(lang, "minutes")} value={`${minutes}`} />
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t(lang, "todayVsBefore")}</h2>
            <p className="text-sm text-muted-foreground">
              {today > 0 ? `${today}% today · ${average}% average` : t(lang, "noData")}
            </p>
          </div>
          <ProgressRing value={today} />
        </div>

        <div className="mt-4 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#acc)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {weak.length > 0 && (
        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">{t(lang, "focus")}</h2>
          <ul className="mt-3 space-y-2">
            {weak.slice(0, 4).map((w) => (
              <li key={w.kind} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm">{catName(w.kind)}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${w.accuracy}%` }}
                  />
                </span>
                <span className="w-10 text-right text-sm font-medium">{w.accuracy}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{t(lang, "weeklyPlan")}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {plan.map((d) => (
            <div
              key={d.day}
              className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm"
            >
              <span className="font-semibold">{d.day}</span>
              <span className="truncate px-3 text-muted-foreground">{catName(d.focus)}</span>
              <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                {d.minutes} min
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
