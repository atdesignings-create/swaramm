/**
 * /settings — language, theme, microphone and progress controls.
 *
 * WHAT: Switches UI language (English / Malayalam), theme (calming pastel or
 *       dark), mic sensitivity, and offers a confirmed progress reset.
 * WHY:  Accessibility is a feature: people practise in different rooms,
 *       at different volumes, in different languages.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/swaram/AppShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LANGUAGES, t, type LangCode } from "@/lib/swaram/i18n";
import { resetAll, update, useSwaram } from "@/lib/swaram/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — language, theme and microphone | Swaram" },
      {
        name: "description",
        content:
          "Switch Swaram between English and Malayalam, choose a calming pastel or dark theme, calibrate microphone sensitivity, or reset your progress.",
      },
      { property: "og:title", content: "Swaram settings" },
      {
        property: "og:description",
        content: "Language, theme, microphone calibration and progress controls.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const state = useSwaram();
  const lang = state.lang;
  const [confirming, setConfirming] = useState(false);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t(lang, "settings")}</h1>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{t(lang, "language")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => update({ lang: l.code as LangCode })}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                l.code === lang
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-secondary"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{t(lang, "theme")}</h2>
        <div className="mt-3 flex gap-2">
          {(["pastel", "dark"] as const).map((th) => (
            <button
              key={th}
              onClick={() => update({ theme: th })}
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                state.theme === th
                  ? "border-primary bg-secondary font-medium"
                  : "border-border bg-background hover:bg-secondary"
              }`}
            >
              {t(lang, th === "pastel" ? "pastel" : "dark")}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{t(lang, "micSensitivity")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Lower it in a quiet room; raise it if background noise is picked up.
        </p>
        <Slider
          className="mt-5"
          min={5}
          max={60}
          step={1}
          value={[Math.round(state.sensitivity * 1000)]}
          onValueChange={([v]) => update({ sensitivity: v / 1000 })}
        />
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {Math.round(state.sensitivity * 1000)}
        </p>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-semibold">{t(lang, "resetProgress")}</h2>
        {confirming ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">{t(lang, "resetConfirm")}</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="rounded-full"
                onClick={() => {
                  resetAll();
                  setConfirming(false);
                }}
              >
                {t(lang, "resetProgress")}
              </Button>
              <Button variant="secondary" className="rounded-full" onClick={() => setConfirming(false)}>
                {t(lang, "skip")}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="mt-3 rounded-full" onClick={() => setConfirming(true)}>
            {t(lang, "resetProgress")}
          </Button>
        )}
      </section>
    </AppShell>
  );
}
