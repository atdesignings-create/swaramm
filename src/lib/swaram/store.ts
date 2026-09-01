/**
 * store.ts — Swaram's Tracker (progress persistence + analytics).
 *
 * WHAT: Reads/writes the learner's profile, session history, stars, streaks
 *       and level mastery to localStorage, and derives coaching insights.
 * WHY:  Progress must survive refreshes without any account or backend.
 * HOW:  A tiny observable store; React subscribes with useSyncExternalStore,
 *       so nothing is read during SSR (server snapshot = defaults).
 */

import { useSyncExternalStore } from "react";
import { MASTERY_THRESHOLD, type ExerciseKind } from "./exercises";
import type { LangCode } from "./i18n";
import type { VoiceType } from "./music";

const KEY = "swaram.state.v1";

export interface SessionRecord {
  /** ISO date (YYYY-MM-DD) of the session. */
  date: string;
  level: number;
  kind: ExerciseKind;
  accuracy: number;
  stars: number;
  seconds: number;
}

export interface Diagnostic {
  lowMidi: number;
  highMidi: number;
  lowName: string;
  highName: string;
  voiceType: VoiceType;
  steadiness: number;
  accuracy: number;
  takenAt: string;
}

export interface SwaramState {
  onboarded: boolean;
  diagnostic: Diagnostic | null;
  sessions: SessionRecord[];
  /** level -> best rolling mastery percentage. */
  mastery: Record<number, number>;
  stars: number;
  streak: number;
  lastPractice: string | null;
  lang: LangCode;
  theme: "pastel" | "dark";
  sensitivity: number;
}

export const DEFAULT_STATE: SwaramState = {
  onboarded: false,
  diagnostic: null,
  sessions: [],
  mastery: {},
  stars: 0,
  streak: 0,
  lastPractice: null,
  lang: "en",
  theme: "pastel",
  sensitivity: 0.015,
};

let state: SwaramState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

/** WHAT: Loads persisted state once, in the browser only. */
function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT_STATE, ...(JSON.parse(raw) as SwaramState) };
  } catch {
    state = DEFAULT_STATE;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — the app still works for this session */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** WHAT: Merge a partial update into state, persist it and notify React. */
export function update(patch: Partial<SwaramState>) {
  ensureLoaded();
  state = { ...state, ...patch };
  persist();
  emit();
}

export function getState(): SwaramState {
  ensureLoaded();
  return state;
}

/** WHAT: React binding. HOW: server snapshot stays default -> no mismatch. */
export function useSwaram(): SwaramState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => getState(),
    () => DEFAULT_STATE,
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

/**
 * WHAT: Records a completed lesson and updates stars, streak and mastery.
 * WHY:  Mastery is what unlocks the next level, so it must be honest:
 *       we keep a rolling average that rewards consistency, not one lucky run.
 */
export function recordSession(rec: Omit<SessionRecord, "date">) {
  ensureLoaded();
  const date = today();
  const sessions = [...state.sessions, { ...rec, date }].slice(-500);

  const prev = state.mastery[rec.level] ?? 0;
  const blended = prev === 0 ? rec.accuracy : Math.round(prev * 0.6 + rec.accuracy * 0.4);
  const mastery = { ...state.mastery, [rec.level]: Math.max(prev === 0 ? 0 : prev - 5, blended) };

  let streak = state.streak;
  if (state.lastPractice !== date) {
    const gap = state.lastPractice ? daysBetween(state.lastPractice, date) : 99;
    streak = gap === 1 ? streak + 1 : 1;
  }

  update({
    sessions,
    mastery,
    stars: state.stars + rec.stars,
    streak,
    lastPractice: date,
  });
}

/** WHAT: Is a level playable yet? HOW: level 1 always; others need mastery. */
export function isLevelUnlocked(level: number, s: SwaramState): boolean {
  if (level <= 1) return true;
  return (s.mastery[level - 1] ?? 0) >= MASTERY_THRESHOLD;
}

/** WHAT: Highest level the learner has access to right now. */
export function currentLevel(s: SwaramState): number {
  let lvl = 1;
  for (let i = 2; i <= 10; i++) if (isLevelUnlocked(i, s)) lvl = i;
  return lvl;
}

export interface DailyPoint {
  date: string;
  accuracy: number;
  minutes: number;
}

/** WHAT: Accuracy per day for the progress chart (last `days` days). */
export function dailySeries(s: SwaramState, days = 14): DailyPoint[] {
  const byDate = new Map<string, { total: number; n: number; secs: number }>();
  for (const sess of s.sessions) {
    const cur = byDate.get(sess.date) ?? { total: 0, n: 0, secs: 0 };
    cur.total += sess.accuracy;
    cur.n += 1;
    cur.secs += sess.seconds;
    byDate.set(sess.date, cur);
  }
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const v = byDate.get(d);
    out.push({
      date: d.slice(5),
      accuracy: v ? Math.round(v.total / v.n) : 0,
      minutes: v ? Math.round(v.secs / 60) : 0,
    });
  }
  return out;
}

/** WHAT: The drill categories where accuracy is lowest — the weak spots. */
export function weakAreas(s: SwaramState): { kind: ExerciseKind; accuracy: number }[] {
  const by = new Map<ExerciseKind, { total: number; n: number }>();
  for (const sess of s.sessions) {
    const cur = by.get(sess.kind) ?? { total: 0, n: 0 };
    cur.total += sess.accuracy;
    cur.n += 1;
    by.set(sess.kind, cur);
  }
  return [...by.entries()]
    .map(([kind, v]) => ({ kind, accuracy: Math.round(v.total / v.n) }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * WHAT: Auto-generates next week's practice timetable.
 * WHY:  Learners stall when they don't know what to do tomorrow.
 * HOW:  Rotates the weakest categories across seven days, always opening
 *       with breath work because everything else rests on it.
 */
export function weeklyPlan(s: SwaramState): { day: string; focus: ExerciseKind; minutes: number }[] {
  const weak = weakAreas(s);
  const rotation: ExerciseKind[] =
    weak.length > 0
      ? weak.slice(0, 3).map((w) => w.kind)
      : ["breath", "pitch-match", "sustain"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    focus: i === 0 ? "breath" : rotation[i % rotation.length],
    minutes: i === 6 ? 20 : 10 + (i % 3) * 5,
  }));
}

/** WHAT: Wipes everything after an explicit confirmation in Settings. */
export function resetAll() {
  state = { ...DEFAULT_STATE };
  persist();
  emit();
}
