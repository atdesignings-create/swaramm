/**
 * songs.ts — the song-practice library and its line-by-line audit.
 *
 * WHAT: Malayalam-first practice songs stored as synthesised reference
 *       melodies plus lyrics, a paste-your-own-lyrics builder, and an
 *       analyser that turns raw pitch samples into kind, timed feedback.
 * WHY:  Drills build the muscle, but songs are why anyone practises. Storing
 *       melodies as note numbers keeps everything offline and copyright-safe.
 * HOW:  Each line lists MIDI notes; the AudioEngine synthesises them as the
 *       reference track while the learner sings along.
 */

export interface SongLine {
  text: string;
  notes: number[];
}

export interface Song {
  id: string;
  title: string;
  lang: string;
  tradition: string;
  tempoMs: number;
  lines: SongLine[];
}

export const SONGS: Song[] = [
  {
    id: "sarali",
    title: "Sarali Varisai (Sa Ri Ga Ma)",
    lang: "Malayalam / Carnatic",
    tradition: "Classical swaras",
    tempoMs: 800,
    lines: [
      { text: "Sa Ri Ga Ma Pa Dha Ni Sa", notes: [60, 62, 64, 65, 67, 69, 71, 72] },
      { text: "Sa Ni Dha Pa Ma Ga Ri Sa", notes: [72, 71, 69, 67, 65, 64, 62, 60] },
      { text: "Sa Ri Sa Ri · Sa Ri Ga Ma", notes: [60, 62, 60, 62, 60, 62, 64, 65] },
    ],
  },
  {
    id: "folk",
    title: "Nadan Paattu warm-up",
    lang: "Malayalam",
    tradition: "Folk",
    tempoMs: 720,
    lines: [
      { text: "Thanne thaane thannaaro", notes: [62, 64, 65, 67, 65, 64, 62] },
      { text: "Thannaaro thannaaro", notes: [67, 69, 67, 65, 64, 62] },
      { text: "Paadaam nammal onnaayi", notes: [60, 62, 64, 65, 67, 65, 64, 62] },
    ],
  },
  {
    id: "light",
    title: "Light music phrase",
    lang: "Malayalam",
    tradition: "Light music",
    tempoMs: 760,
    lines: [
      { text: "Premam pole ee raagam", notes: [64, 65, 67, 69, 67, 65, 64] },
      { text: "Manassil ninnu paadam", notes: [62, 64, 65, 64, 62, 60] },
      { text: "Ee swaram nithya sundaram", notes: [67, 69, 71, 72, 71, 69, 67, 65] },
    ],
  },
  {
    id: "hindi",
    title: "Sur ka riyaz",
    lang: "Hindi",
    tradition: "Hindustani classical",
    tempoMs: 820,
    lines: [
      { text: "Sa Re Ga Ma Pa Dha Ni Sa", notes: [57, 59, 61, 62, 64, 66, 68, 69] },
      { text: "Sa Ni Dha Pa Ma Ga Re Sa", notes: [69, 68, 66, 64, 62, 61, 59, 57] },
    ],
  },
  {
    id: "tamil",
    title: "Janta varisai",
    lang: "Tamil",
    tradition: "Carnatic",
    tempoMs: 780,
    lines: [
      { text: "Sa Sa Ri Ri Ga Ga Ma Ma", notes: [60, 60, 62, 62, 64, 64, 65, 65] },
      { text: "Pa Pa Dha Dha Ni Ni Sa Sa", notes: [67, 67, 69, 69, 71, 71, 72, 72] },
    ],
  },
  {
    id: "intl",
    title: "Twinkle (international starter)",
    lang: "English",
    tradition: "Beginner classic",
    tempoMs: 700,
    lines: [
      { text: "Twinkle twinkle little star", notes: [60, 60, 67, 67, 69, 69, 67] },
      { text: "How I wonder what you are", notes: [65, 65, 64, 64, 62, 62, 60] },
    ],
  },
];

/** WHAT: Turns pasted lyrics into a singable track on a gentle five-note shape. */
export function songFromLyrics(text: string): Song {
  const shape = [60, 62, 64, 65, 67, 65, 64, 62];
  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
  return {
    id: "custom",
    title: "Your lyrics",
    lang: "Custom",
    tradition: "Pasted",
    tempoMs: 800,
    lines: lines.map((line, i) => {
      const words = line.split(/\s+/).length;
      const count = Math.max(3, Math.min(8, words));
      return { text: line, notes: shape.slice(0, count).map((n) => n + (i % 3)) };
    }),
  };
}

export interface LineTake {
  time: number;
  samples: number[];
}

export interface LineVerdict {
  time: number;
  score: number;
  text: string;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * WHAT: Compares each sung line against its reference notes.
 * WHY:  "You went flat at 0:42 on 'Premam'" teaches far more than a number.
 * HOW:  Median sung pitch vs. mean target pitch, folded into one octave.
 */
export function analyseSong(song: Song, takes: LineTake[]): LineVerdict[] {
  return takes.map((take, i) => {
    const line = song.lines[i];
    const label = line ? line.text : "";
    if (!line || take.samples.length === 0) {
      return {
        time: take.time,
        score: 0,
        text: `At ${fmtTime(take.time)} on "${label}" I heard no voice — take a breath and try that line again.`,
      };
    }
    const sorted = [...take.samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)]!;
    const target = line.notes.reduce((a, b) => a + b, 0) / line.notes.length;
    const diff = median - target;
    const folded = diff - 12 * Math.round(diff / 12);
    const cents = Math.round(folded * 100);
    const score = Math.max(0, Math.round(100 - (Math.abs(cents) / 50) * 100));
    if (Math.abs(cents) < 25) {
      return {
        time: take.time,
        score,
        text: `At ${fmtTime(take.time)} on "${label}" — lovely, right in tune.`,
      };
    }
    if (cents < 0) {
      return {
        time: take.time,
        score,
        text: `At ${fmtTime(take.time)} on "${label}" your pitch went flat by about ${Math.abs(cents)} cents — try holding your breath support longer here.`,
      };
    }
    return {
      time: take.time,
      score,
      text: `At ${fmtTime(take.time)} on "${label}" you sat sharp by about ${cents} cents — relax the jaw and let the note settle.`,
    };
  });
}
