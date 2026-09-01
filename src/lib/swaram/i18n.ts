/**
 * i18n.ts — Swaram's translation dictionary.
 *
 * WHAT: Every UI string in English and Malayalam (more languages plug in here).
 * WHY:  A Malayalam-first learner should never meet an English-only screen.
 * HOW:  Flat key -> per-language string map; `t(lang, key)` falls back to English.
 */

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ml", label: "മലയാളം" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  appName: "Swaram",
  tagline: "No one judges here — every voice can grow.",
  home: "Home",
  lessons: "Lessons",
  practice: "Practice",
  dashboard: "Progress",
  settings: "Settings",
  begin: "Begin your voice check",
  continue: "Continue",
  skip: "Skip for now",
  welcomeTitle: "Welcome to Swaram",
  welcomeBody:
    "A calm place to learn singing. No auditions, no scores shouted at you — just gentle guidance, one note at a time.",
  step: "Step",
  diagLow: "Sing your most comfortable LOW note",
  diagHigh: "Sing your most comfortable HIGH note",
  diagHold: "Hold one steady note for 5 seconds",
  diagHint: "Use the sound 'aaa'. Breathe first: smell the flower, blow out the candle.",
  listening: "Listening…",
  startMic: "Turn on microphone",
  stopMic: "Stop",
  yourRange: "Your range",
  voiceType: "Voice type",
  steadiness: "Steadiness",
  strengths: "What's already working",
  focus: "Your gentle focus",
  seePlan: "See my learning path",
  levels: "Levels",
  locked: "Locked",
  unlockAt: "Reach 85% on the level before to unlock",
  startLesson: "Start",
  hear: "Hear the note",
  sing: "Now sing it",
  finish: "Finish",
  accuracy: "Accuracy",
  stars: "Stars",
  greatWork: "Beautiful work!",
  closeTry: "So close — a touch higher and it's perfect.",
  streak: "Day streak",
  totalStars: "Stars earned",
  minutes: "Minutes practised",
  todayVsBefore: "Today vs. your average",
  weeklyPlan: "Your week ahead",
  noData: "Practise one lesson and your progress appears here.",
  theme: "Theme",
  pastel: "Calming pastel",
  dark: "Dark",
  language: "Language",
  micSensitivity: "Microphone sensitivity",
  resetProgress: "Reset all progress",
  resetConfirm: "This clears your stars, streak and history. Are you sure?",
  breathTip: "Breath support: smell the flower, blow out the candle.",
  higher: "A little higher",
  lower: "A little lower",
  spotOn: "Spot on!",
  quiet: "I can't hear you yet — sing a little louder.",
  micDenied:
    "Microphone is off. You can still listen to every exercise — turn the mic on any time to get scored.",
  exercisesIn: "exercises in this level",
  mastery: "Mastery",
  category: "Category",
  library: "Exercise library",
  librarySub: "Warm-ups, agility drills and breath work, generated fresh every time.",
};

const ml: Dict = {
  appName: "സ്വരം",
  tagline: "ഇവിടെ ആരും വിധിക്കില്ല — എല്ലാ ശബ്ദവും വളരും.",
  home: "ഹോം",
  lessons: "പാഠങ്ങൾ",
  practice: "പരിശീലനം",
  dashboard: "പുരോഗതി",
  settings: "ക്രമീകരണങ്ങൾ",
  begin: "നിങ്ങളുടെ ശബ്ദ പരിശോധന തുടങ്ങാം",
  continue: "തുടരുക",
  skip: "ഇപ്പോൾ വേണ്ട",
  welcomeTitle: "സ്വരത്തിലേക്ക് സ്വാഗതം",
  welcomeBody:
    "പാട്ട് പഠിക്കാൻ ഒരു ശാന്തമായ ഇടം. പരീക്ഷയില്ല, കുറ്റപ്പെടുത്തലില്ല — ഓരോ സ്വരവും സാവധാനം.",
  step: "ഘട്ടം",
  diagLow: "നിങ്ങൾക്ക് സുഖമായ ഏറ്റവും താഴ്ന്ന സ്വരം പാടൂ",
  diagHigh: "നിങ്ങൾക്ക് സുഖമായ ഏറ്റവും ഉയർന്ന സ്വരം പാടൂ",
  diagHold: "ഒരു സ്വരം 5 സെക്കൻഡ് സ്ഥിരമായി പിടിക്കൂ",
  diagHint: "'ആ' എന്ന ശബ്ദം ഉപയോഗിക്കൂ. ആദ്യം ശ്വാസം: പൂവ് മണക്കൂ, മെഴുകുതിരി ഊതി കെടുത്തൂ.",
  listening: "കേൾക്കുന്നു…",
  startMic: "മൈക്ക് ഓണാക്കൂ",
  stopMic: "നിർത്തൂ",
  yourRange: "നിങ്ങളുടെ പരിധി",
  voiceType: "ശബ്ദ വിഭാഗം",
  steadiness: "സ്ഥിരത",
  strengths: "ഇപ്പോൾ തന്നെ നന്നായത്",
  focus: "സൗമ്യമായ ശ്രദ്ധ",
  seePlan: "എന്റെ പഠന വഴി കാണൂ",
  levels: "ലെവലുകൾ",
  locked: "പൂട്ടിയിരിക്കുന്നു",
  unlockAt: "മുൻ ലെവലിൽ 85% നേടിയാൽ തുറക്കും",
  startLesson: "തുടങ്ങൂ",
  hear: "സ്വരം കേൾക്കൂ",
  sing: "ഇനി പാടൂ",
  finish: "പൂർത്തിയാക്കൂ",
  accuracy: "കൃത്യത",
  stars: "നക്ഷത്രങ്ങൾ",
  greatWork: "മനോഹരം!",
  closeTry: "വളരെ അടുത്ത് — അൽപ്പം കൂടി ഉയരത്തിൽ.",
  streak: "ദിവസ ശ്രേണി",
  totalStars: "നേടിയ നക്ഷത്രങ്ങൾ",
  minutes: "പരിശീലിച്ച മിനിറ്റ്",
  todayVsBefore: "ഇന്നത്തേത് vs ശരാശരി",
  weeklyPlan: "വരും ആഴ്ച",
  noData: "ഒരു പാഠം പരിശീലിക്കൂ, പുരോഗതി ഇവിടെ കാണാം.",
  theme: "തീം",
  pastel: "ശാന്ത പാസ്റ്റൽ",
  dark: "ഇരുട്ട്",
  language: "ഭാഷ",
  micSensitivity: "മൈക്ക് സംവേദനക്ഷമത",
  resetProgress: "എല്ലാ പുരോഗതിയും മായ്ക്കുക",
  resetConfirm: "ഇത് നക്ഷത്രങ്ങളും ചരിത്രവും മായ്ക്കും. ഉറപ്പാണോ?",
  breathTip: "ശ്വാസ പിന്തുണ: പൂവ് മണക്കൂ, മെഴുകുതിരി ഊതൂ.",
  higher: "അൽപ്പം ഉയരത്തിൽ",
  lower: "അൽപ്പം താഴ്ത്തി",
  spotOn: "കൃത്യം!",
  quiet: "ഇതുവരെ കേൾക്കുന്നില്ല — അൽപ്പം ഉച്ചത്തിൽ പാടൂ.",
  micDenied:
    "മൈക്ക് ഓഫാണ്. എല്ലാ വ്യായാമങ്ങളും കേൾക്കാം — സ്കോർ വേണമെങ്കിൽ മൈക്ക് ഓണാക്കൂ.",
  exercisesIn: "വ്യായാമങ്ങൾ ഈ ലെവലിൽ",
  mastery: "വൈദഗ്ധ്യം",
  category: "വിഭാഗം",
  library: "വ്യായാമ ശേഖരം",
  librarySub: "വാം-അപ്പുകൾ, ചടുലതാ പരിശീലനങ്ങൾ, ശ്വാസ വ്യായാമങ്ങൾ.",
};

export const dictionaries: Record<LangCode, Dict> = { en, ml };

/** WHAT: Look up a UI string. HOW: falls back to English, then to the key. */
export function t(lang: LangCode, key: string): string {
  return dictionaries[lang]?.[key] ?? en[key] ?? key;
}
