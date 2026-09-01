/**
 * music.ts — Musical note math for Swaram.
 *
 * WHAT: Converts between frequencies (Hz), MIDI numbers and note names,
 *       and classifies a singer's range into a voice type.
 * WHY:  Every other module (pitch detection, tone synthesis, scoring)
 *       needs one shared, exact definition of "what note is this".
 * HOW:  Pure functions, no browser APIs, safe to import anywhere (SSR included).
 */

export const A4 = 440;
export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

/** Indian solfège (sargam) used by the Malayalam / Carnatic practice tracks. */
export const SARGAM = ["Sa", "Ri", "Ga", "Ma", "Pa", "Dha", "Ni"] as const;

/** WHAT: Hz -> fractional MIDI number. WHY: cents accuracy needs decimals. */
export function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / A4);
}

/** WHAT: MIDI number -> Hz. WHY: the tone generator plays reference notes. */
export function midiToFreq(midi: number): number {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

/** WHAT: MIDI -> readable name like "A4". */
export function midiToName(midi: number): string {
  const m = Math.round(midi);
  return `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

/** WHAT: name like "A4" or "C#3" -> MIDI number. */
export function nameToMidi(name: string): number {
  const match = /^([A-G]#?)(-?\d)$/.exec(name.trim());
  if (!match) return 69;
  const idx = NOTE_NAMES.indexOf(match[1] as (typeof NOTE_NAMES)[number]);
  return idx + (Number(match[2]) + 1) * 12;
}

export interface NoteReading {
  freq: number;
  midi: number;
  name: string;
  /** How far off the nearest note, in cents (-50..50). 0 = perfectly in tune. */
  cents: number;
}

/** WHAT: Full reading for a detected frequency. HOW: used by the live meter. */
export function analyzeFreq(freq: number): NoteReading {
  const midi = freqToMidi(freq);
  const nearest = Math.round(midi);
  return {
    freq,
    midi,
    name: midiToName(nearest),
    cents: Math.round((midi - nearest) * 100),
  };
}

/**
 * WHAT: Turns cents-off into a friendly 0-100 accuracy score.
 * WHY:  Swaram never shows "wrong" — it shows "how close you already are".
 * HOW:  0 cents = 100, 50 cents (a quarter tone) = 0, linear in between.
 */
export function centsToScore(cents: number): number {
  return Math.max(0, Math.round(100 - (Math.abs(cents) / 50) * 100));
}

export type VoiceType =
  | "Bass"
  | "Baritone"
  | "Tenor"
  | "Alto"
  | "Mezzo-Soprano"
  | "Soprano";

/**
 * WHAT: Maps a comfortable low/high MIDI pair to a classical voice type.
 * WHY:  Beginners love knowing "I'm a Tenor" — it makes practice personal.
 * HOW:  Classifies on the midpoint of the measured range.
 */
export function classifyVoice(lowMidi: number, highMidi: number): VoiceType {
  const centre = (lowMidi + highMidi) / 2;
  if (centre < 48) return "Bass";
  if (centre < 53) return "Baritone";
  if (centre < 58) return "Tenor";
  if (centre < 62) return "Alto";
  if (centre < 67) return "Mezzo-Soprano";
  return "Soprano";
}

/** WHAT: Whole-number semitone span of a range, for the diagnostic report. */
export function rangeInSemitones(lowMidi: number, highMidi: number): number {
  return Math.max(0, Math.round(highMidi - lowMidi));
}
