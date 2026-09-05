/**
 * coach.tsx — the "Ask the coach" chat panel.
 *
 * WHAT: A warm, rule-based coaching chat that answers common singing doubts
 *       in Malayalam, English, Hindi, Tamil and more.
 * WHY:  Beginners hesitate to ask "silly" questions out loud; answering them
 *       privately and instantly keeps them practising.
 * HOW:  answerCoach() matches keywords and returns a language-specific reply.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { AppShell } from "@/components/swaram/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/swaram/i18n";
import { useSwaram } from "@/lib/swaram/store";
import {
  COACH_LANGUAGES,
  SUGGESTED_QUESTIONS,
  answerCoach,
  type CoachLanguage,
} from "@/lib/swaram/coach";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Ask the coach — singing answers in your language | Swaram" },
      {
        name: "description",
        content:
          "Warm, instant answers to singing questions — voice cracks, breath support, gamaka and stage nerves — in Malayalam, English, Hindi, Tamil and more.",
      },
      { property: "og:title", content: "Ask the coach | Swaram" },
      {
        property: "og:description",
        content:
          "A patient vocal coach answering beginner singing doubts in your own language.",
      },
    ],
  }),
  component: CoachPage,
});

interface Msg {
  who: "me" | "coach";
  text: string;
}

function CoachPage() {
  const state = useSwaram();
  const lang = state.lang;
  const [coachLang, setCoachLang] = useState<CoachLanguage>(
    lang === "ml" ? "Malayalam" : "English",
  );
  const [chat, setChat] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    setChat((prev) => [
      ...prev,
      { who: "me", text: q },
      { who: "coach", text: answerCoach(q, coachLang) },
    ]);
    setDraft("");
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-semibold">{t(lang, "ask")}</h1>

      <div className="mt-5 rounded-3xl border border-border bg-card p-5">
        <label className="text-sm text-muted-foreground" htmlFor="coachLang">
          {t(lang, "language")}
        </label>
        <select
          id="coachLang"
          value={coachLang}
          onChange={(e) => setCoachLang(e.target.value as CoachLanguage)}
          className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
        >
          {COACH_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <div className="mt-4 flex max-h-[420px] flex-col gap-2 overflow-y-auto">
          {(chat.length
            ? chat
            : [{ who: "coach" as const, text: t(lang, "askIntro") }]
          ).map((m, i) => (
            <p
              key={i}
              className={
                m.who === "me"
                  ? "animate-rise max-w-[85%] self-end rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                  : "animate-rise max-w-[85%] self-start rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground"
              }
            >
              {m.text}
            </p>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask(draft);
            }}
            placeholder={t(lang, "askPlaceholder")}
            className="rounded-full"
          />
          <Button className="rounded-full" onClick={() => ask(draft)}>
            <Send className="size-4" /> {t(lang, "send")}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
