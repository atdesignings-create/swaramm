/**
 * exercises.ts — Swaram's ExerciseDB.
 *
 * WHAT: A generated library of 1000+ categorised exercises (warm-ups, pitch
 *       matching, arpeggios, intervals, scales, agility runs, breath control,
 *       and Carnatic/Malayalam sargam drills).
 * WHY:  Hand-writing a thousand exercises is unmaintainable; templates give
 *       endless variety with a tiny, auditable data structure.
 * HOW:  Each category defines a pattern of semitone offsets plus the levels it
 *       belongs to. Exercises are produced by transposing patterns across
 *       root notes and tempos, with stable deterministic IDs (no Math.random
 *       at module scope — safe on the edge runtime).
 */

import { midiToFreq, midiToName } from "./music";

export type ExerciseKind =
  | "breath"
  | "pitch-match"
  | "scale"
  | "arpeggio"
  | "interval"
  | "agility"
  | "sargam"
  | "sustain";

export interface ExerciseCategory {
  id: ExerciseKind;
  name: string;
  nameMl: string;
  /** Simple, encouraging explanation of the mechanic behind the drill. */
  tip: string;
  tipMl: string;
  /** Semitone patterns (relative to the root note) this category can use. */
  patterns: { label: string; steps: number[] }[];
  /** Which curriculum levels this category appears in. */
  levels: number[];
}

export const CATEGORIES: ExerciseCategory[] = [
  {
    id: "breath",
    name: "Breath control",
    nameMl: "ശ്വാസ നിയന്ത്രണം",
    tip: "Smell the flower, blow out the candle. Slow in through the nose, long and steady out.",
    tipMl: "പൂവ് മണക്കൂ, മെഴുകുതിരി ഊതൂ. മൂക്കിലൂടെ പതുക്കെ ഉള്ളിലേക്ക്, നീണ്ട് സ്ഥിരമായി പുറത്തേക്ക്.",
    patterns: [
      { label: "Single hold", steps: [0] },
      { label: "Two long tones", steps: [0, 0] },
    ],
    levels: [1, 2, 3],
  },
  {
    id: "pitch-match",
    name: "Pitch matching",
    nameMl: "സ്വരം ചേർക്കൽ",
    tip: "Hear the note, then become the note. Sing 'aaa' and let it settle.",
    tipMl: "സ്വരം കേൾക്കൂ, അതേ സ്വരമാകൂ. 'ആ' എന്ന് പാടി സ്ഥിരപ്പെടുത്തൂ.",
    patterns: [
      { label: "Single note", steps: [0] },
      { label: "Note pair", steps: [0, 2] },
      { label: "Three tones", steps: [0, 2, 4] },
    ],
    levels: [1, 2, 3, 4],
  },
  {
    id: "sustain",
    name: "Steady tone",
    nameMl: "സ്ഥിര സ്വരം",
    tip: "Hold one note like a straight line. Wobble is fine — we smooth it out together.",
    tipMl: "ഒരു സ്വരം നേർരേഖ പോലെ പിടിക്കൂ. ചെറിയ ഇളക്കം സാരമില്ല.",
    patterns: [
      { label: "Long hold", steps: [0] },
      { label: "Hold and step", steps: [0, 1] },
    ],
    levels: [2, 3, 4, 5],
  },
  {
    id: "scale",
    name: "Scales",
    nameMl: "സ്കെയിലുകൾ",
    tip: "Climb like stairs — one even step at a time, same volume all the way.",
    tipMl: "പടികൾ കയറുന്നത് പോലെ — ഓരോ ചുവടും ഒരേ ശക്തിയിൽ.",
    patterns: [
      { label: "Major 5-note", steps: [0, 2, 4, 5, 7] },
      { label: "Major up-down", steps: [0, 2, 4, 5, 7, 5, 4, 2, 0] },
      { label: "Natural minor", steps: [0, 2, 3, 5, 7, 8, 10, 12] },
      { label: "Full major octave", steps: [0, 2, 4, 5, 7, 9, 11, 12] },
    ],
    levels: [3, 4, 5, 6],
  },
  {
    id: "arpeggio",
    name: "Arpeggios",
    nameMl: "ആർപെജിയോ",
    tip: "Skip between the strong notes of the chord. Keep the breath flowing under every jump.",
    tipMl: "കോർഡിലെ പ്രധാന സ്വരങ്ങളിലേക്ക് ചാടൂ. ഓരോ ചാട്ടത്തിലും ശ്വാസം ഒഴുകട്ടെ.",
    patterns: [
      { label: "Major triad", steps: [0, 4, 7, 12] },
      { label: "Minor triad", steps: [0, 3, 7, 12] },
      { label: "Triad down", steps: [12, 7, 4, 0] },
      { label: "Dominant 7th", steps: [0, 4, 7, 10, 12] },
    ],
    levels: [4, 5, 6, 7],
  },
  {
    id: "interval",
    name: "Interval jumps",
    nameMl: "സ്വര ചാട്ടങ്ങൾ",
    tip: "Aim for the landing note before you leave. Think it, then sing it.",
    tipMl: "ചാടും മുൻപ് ലക്ഷ്യ സ്വരം മനസ്സിൽ കാണൂ.",
    patterns: [
      { label: "Fourth", steps: [0, 5, 0] },
      { label: "Fifth", steps: [0, 7, 0] },
      { label: "Sixth", steps: [0, 9, 0] },
      { label: "Octave", steps: [0, 12, 0] },
    ],
    levels: [5, 6, 7, 8],
  },
  {
    id: "agility",
    name: "Vocal agility",
    nameMl: "സ്വര ചടുലത",
    tip: "Light and bouncy — like raindrops, not footsteps. Speed comes from relaxing.",
    tipMl: "മഴത്തുള്ളികൾ പോലെ ലഘുവായി. വേഗത വരുന്നത് അയവിൽ നിന്നാണ്.",
    patterns: [
      { label: "Turn", steps: [0, 2, 0, -1, 0] },
      { label: "Fast run", steps: [0, 2, 4, 5, 7, 5, 4, 2, 0] },
      { label: "Trill pairs", steps: [0, 1, 0, 1, 0] },
      { label: "Zig-zag", steps: [0, 4, 2, 7, 5, 9, 7, 12] },
    ],
    levels: [6, 7, 8, 9],
  },
  {
    id: "sargam",
    name: "Sargam & gamaka",
    nameMl: "സരിഗമ & ഗമകം",
    tip: "Sa Ri Ga Ma Pa Dha Ni. Let the notes bend gently into each other — that curve is gamaka.",
    tipMl: "സ രി ഗ മ പ ധ നി. സ്വരങ്ങൾ പതുക്കെ ഒന്നിലേക്ക് ഒന്ന് വളയട്ടെ — അതാണ് ഗമകം.",
    patterns: [
      { label: "Sarali varisai", steps: [0, 2, 4, 5, 7, 9, 11, 12] },
      { label: "Janta varisai", steps: [0, 0, 2, 2, 4, 4, 5, 5] },
      { label: "Descending sargam", steps: [12, 11, 9, 7, 5, 4, 2, 0] },
      { label: "Gamaka curve", steps: [0, 2, 0, 4, 2, 5, 4, 7] },
    ],
    levels: [7, 8, 9, 10],
  },
];

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  level: number;
  title: string;
  titleMl: string;
  tip: string;
  tipMl: string;
  /** Absolute MIDI notes to sing, in order. */
  notes: number[];
  noteNames: string[];
  /** Milliseconds per note for the reference playback. */
  tempoMs: number;
}

/** Root notes the templates are transposed across (C3..C5 area). */
const ROOTS = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72];
const TEMPOS = [900, 700, 550, 420];

/** WHAT: Frequencies for an exercise. WHY: the synth plays these directly. */
export function exerciseFrequencies(ex: Exercise): number[] {
  return ex.notes.map(midiToFreq);
}

/**
 * WHAT: Builds the full exercise catalogue.
 * WHY:  8 categories x patterns x 15 roots x tempos comfortably exceeds 1,000
 *       unique drills while staying perfectly deterministic.
 * HOW:  Tempo count grows with level, so higher levels get the faster drills.
 */
function buildAll(): Exercise[] {
  const out: Exercise[] = [];
  for (const cat of CATEGORIES) {
    for (const level of cat.levels) {
      const tempoCount = Math.min(TEMPOS.length, 1 + Math.floor(level / 3));
      for (let p = 0; p < cat.patterns.length; p++) {
        const pattern = cat.patterns[p]!;
        for (let r = 0; r < ROOTS.length; r++) {
          for (let ti = 0; ti < tempoCount; ti++) {
            const root = ROOTS[r]!;
            const notes = pattern.steps.map((s) => root + s);
            if (notes.some((n) => n < 40 || n > 84)) continue;
            const rootName = midiToName(root);
            out.push({
              id: `${cat.id}-${level}-${p}-${r}-${ti}`,
              kind: cat.id,
              level,
              title: `${pattern.label} on ${rootName}`,
              titleMl: `${pattern.label} — ${rootName}`,
              tip: cat.tip,
              tipMl: cat.tipMl,
              notes,
              noteNames: notes.map(midiToName),
              tempoMs: TEMPOS[ti]!,
            });
          }
        }
      }
    }
  }
  return out;
}

/** WHAT: Lazily-built singleton catalogue (never built at module scope). */
let cache: Exercise[] | null = null;
export function allExercises(): Exercise[] {
  if (!cache) cache = buildAll();
  return cache;
}

/** WHAT: Total drill count, shown proudly on the home screen. */
export function exerciseCount(): number {
  return allExercises().length;
}

/** WHAT: Exercises for one curriculum level. */
export function exercisesForLevel(level: number): Exercise[] {
  return allExercises().filter((e) => e.level === level);
}

/**
 * WHAT: Picks a stable set of drills for a lesson session.
 * WHY:  Deterministic selection keeps SSR and the client in sync.
 * HOW:  Evenly samples the level's pool using a seed derived from the day.
 */
export function pickLessonExercises(
  level: number,
  count: number,
  seed: number,
): Exercise[] {
  const pool = exercisesForLevel(level);
  if (pool.length === 0) return [];
  const picked: Exercise[] = [];
  const stride = Math.max(1, Math.floor(pool.length / count));
  for (let i = 0; i < count; i++) {
    picked.push(pool[(seed + i * stride) % pool.length]!);
  }
  return picked;
}

export interface CurriculumLevel {
  level: number;
  name: string;
  nameMl: string;
  focus: string;
  focusMl: string;
}

/** WHAT: The 10-tier learning path, breathing basics up to gamakas. */
export const CURRICULUM: CurriculumLevel[] = [
  {
    level: 1,
    name: "Breathing & first sounds",
    nameMl: "ശ്വാസവും ആദ്യ ശബ്ദങ്ങളും",
    focus: "Find your breath and make one calm, easy tone.",
    focusMl: "ശ്വാസം കണ്ടെത്തി ശാന്തമായ ഒരു സ്വരം ഉണ്ടാക്കൂ.",
  },
  {
    level: 2,
    name: "Matching a note",
    nameMl: "സ്വരം ചേർക്കൽ",
    focus: "Hear a note and sing exactly that note.",
    focusMl: "കേട്ട സ്വരം അതേപടി പാടൂ.",
  },
  {
    level: 3,
    name: "Holding steady",
    nameMl: "സ്ഥിരത",
    focus: "Keep a tone straight and even for several seconds.",
    focusMl: "സ്വരം സെക്കൻഡുകളോളം സ്ഥിരമായി പിടിക്കൂ.",
  },
  {
    level: 4,
    name: "Simple scales",
    nameMl: "ലളിത സ്കെയിലുകൾ",
    focus: "Walk up and down five notes evenly.",
    focusMl: "അഞ്ച് സ്വരങ്ങൾ ഒരുപോലെ കയറി ഇറങ്ങൂ.",
  },
  {
    level: 5,
    name: "Arpeggios",
    nameMl: "ആർപെജിയോ",
    focus: "Move cleanly between the strong notes of a chord.",
    focusMl: "കോർഡിലെ പ്രധാന സ്വരങ്ങൾക്കിടയിൽ വൃത്തിയായി നീങ്ങൂ.",
  },
  {
    level: 6,
    name: "Interval leaps",
    nameMl: "സ്വര ചാട്ടങ്ങൾ",
    focus: "Land big jumps in tune, without pushing.",
    focusMl: "വലിയ ചാട്ടങ്ങൾ ബലം പിടിക്കാതെ കൃത്യമായി.",
  },
  {
    level: 7,
    name: "Agility & runs",
    nameMl: "ചടുലതയും ഓട്ടങ്ങളും",
    focus: "Fast, light passages that stay relaxed.",
    focusMl: "വേഗതയേറിയ, അയവുള്ള ഭാഗങ്ങൾ.",
  },
  {
    level: 8,
    name: "Sargam foundations",
    nameMl: "സരിഗമ അടിസ്ഥാനം",
    focus: "Sarali and janta varisai with clean swara placement.",
    focusMl: "സരളി, ജണ്ട വരിശകൾ വൃത്തിയായി.",
  },
  {
    level: 9,
    name: "Expression & dynamics",
    nameMl: "ഭാവവും ശക്തിയും",
    focus: "Shape phrases softly and strongly on purpose.",
    focusMl: "വാക്യങ്ങൾ മൃദുവായും ശക്തമായും രൂപപ്പെടുത്തൂ.",
  },
  {
    level: 10,
    name: "Gamaka & microtones",
    nameMl: "ഗമകവും സൂക്ഷ്മ സ്വരങ്ങളും",
    focus: "Bend between notes with control — the heart of Indian classical singing.",
    focusMl: "സ്വരങ്ങൾക്കിടയിൽ നിയന്ത്രണത്തോടെ വളയൂ.",
  },
];

/** Mastery threshold (%) a level must reach before the next one unlocks. */
export const MASTERY_THRESHOLD = 85;
