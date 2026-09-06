/**
 * AppShell.tsx — the frame every Swaram screen sits inside.
 *
 * WHAT: Header with the wordmark, bottom (mobile) / top (desktop) navigation,
 *       and the theme class applied from saved settings.
 * WHY:  One consistent, calm chrome so learners never feel lost.
 * HOW:  Theme is applied in useEffect (browser-only) to avoid SSR mismatch.
 */

import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  Home,
  GraduationCap,
  Mic2,
  Music2,
  MessageCircle,
  BarChart3,
  Settings2,
} from "lucide-react";
import { useSwaram } from "@/lib/swaram/store";
import { t } from "@/lib/swaram/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "home", Icon: Home },
  { to: "/lessons", key: "lessons", Icon: GraduationCap },
  { to: "/practice", key: "practice", Icon: Mic2 },
  { to: "/songs", key: "songs", Icon: Music2 },
  { to: "/dashboard", key: "dashboard", Icon: BarChart3 },
  { to: "/coach", key: "coach", Icon: MessageCircle },
  { to: "/settings", key: "settings", Icon: Settings2 },
] as const;


export function AppShell({ children }: { children: ReactNode }) {
  const state = useSwaram();
  const lang = state.lang;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mic2 className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {t(lang, "appName")}
            </span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {NAV.map(({ to, key, Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                <Icon className="size-4" />
                {t(lang, key)}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-md sm:hidden">
        <div className="flex items-stretch justify-around">
          {NAV.map(({ to, key, Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors",
              )}
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <Icon className="size-5" />
              {t(lang, key)}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

/** WHAT: Circular progress ring used for mastery and daily goals. */
export function ProgressRing({
  value,
  size = 64,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6} className="fill-none stroke-secondary" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute text-xs font-semibold">{label ?? `${Math.round(value)}%`}</span>
    </div>
  );
}
