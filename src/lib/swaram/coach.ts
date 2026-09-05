/**
 * coach.ts — the rule-based "Ask the coach" answer tree.
 *
 * WHAT: Keyword-matched answers to the questions beginners actually ask,
 *       written in the warm voice of a patient teacher, in many languages.
 * WHY:  Most beginner doubts are the same ten questions. Answering them
 *       instantly and offline, in the learner's own language, removes fear.
 * HOW:  answerCoach() scans the question for keywords and returns the best
 *       match, falling back to a generally true, encouraging answer.
 */

export const COACH_LANGUAGES = [
  "English",
  "Malayalam",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Punjabi",
] as const;

export type CoachLanguage = (typeof COACH_LANGUAGES)[number];

interface Rule {
  keys: string[];
  answers: Partial<Record<CoachLanguage, string>>;
}

const RULES: Rule[] = [
  {
    keys: ["crack", "break", "വിറ"],
    answers: {
      English:
        "Cracking means the voice is changing gears too suddenly. Sing the note softly on 'ng' first, keep the air steady, and slide up instead of jumping. A week of Level 6 interval leaps usually smooths it out.",
      Malayalam:
        "ശബ്ദം പൊട്ടുന്നത് പെട്ടെന്ന് ഗിയർ മാറുന്നതുകൊണ്ടാണ്. ആദ്യം 'ങ്' ശബ്ദത്തിൽ മൃദുവായി പാടൂ, ശ്വാസം സ്ഥിരമാക്കൂ, ചാടാതെ വഴുതി കയറൂ.",
      Hindi:
        "आवाज़ टूटना अचानक गियर बदलने जैसा है। पहले 'ङ' पर धीरे गाइए, साँस स्थिर रखिए और कूदने के बजाय फिसलते हुए ऊपर जाइए.",
      Tamil:
        "குரல் உடைவது திடீர் மாற்றத்தால். முதலில் 'ங்' ஒலியில் மெதுவாகப் பாடுங்கள், மூச்சை நிலையாக வைத்து மெல்ல மேலே செல்லுங்கள்.",
    },
  },
  {
    keys: ["breath", "stamina", "air", "ശ്വാസ"],
    answers: {
      English:
        "Smell the flower, blow out the candle. Breathe in through the nose for 4 counts, hiss out for 8, then 12. Ribs stay wide, shoulders stay still.",
      Malayalam:
        "പൂവ് മണക്കൂ, മെഴുകുതിരി ഊതൂ. 4 എണ്ണം മൂക്കിലൂടെ ശ്വാസം എടുക്കൂ, 8 എണ്ണം 'സ്' എന്ന് വിടൂ, പിന്നെ 12.",
      Hindi:
        "फूल सूँघिए, मोमबत्ती बुझाइए। 4 गिनती साँस लीजिए, 8 गिनती 'स' के साथ छोड़िए, फिर 12.",
      Tamil:
        "பூவை முகருங்கள், மெழுகுவர்த்தியை ஊதுங்கள். 4 எண்ணிக்கை மூச்சு இழுத்து, 8 எண்ணிக்கை 'ஸ்' என விடுங்கள்.",
    },
  },
  {
    keys: ["high note", "high", "ഉയർന്ന", "ऊँच"],
    answers: {
      English:
        "High notes need less push, not more. Keep the volume gentle, let the jaw drop, and imagine the note travelling forward rather than up. Warm up with sirens.",
      Malayalam:
        "ഉയർന്ന സ്വരങ്ങൾക്ക് ബലം കുറവാണ് വേണ്ടത്. ശബ്ദം മൃദുവാക്കൂ, താടി അയവുള്ളതാക്കൂ, സ്വരം മുന്നോട്ട് പോകുന്നതായി സങ്കൽപ്പിക്കൂ.",
      Hindi:
        "ऊँचे स्वरों को ज़ोर नहीं, कोमलता चाहिए। आवाज़ धीमी रखें, जबड़ा ढीला छोड़ें और स्वर को ऊपर नहीं, आगे भेजें.",
    },
  },
  {
    keys: ["flat", "off key", "pitch", "apaswaram", "അപസ്വരം"],
    answers: {
      English:
        "Singing flat is almost always a breath problem, not an ear problem. Take a fuller breath, then hold one matched tone from Level 2 until your line sits inside the green band.",
      Malayalam:
        "സ്വരം താഴ്ന്ന് പോകുന്നത് മിക്കപ്പോഴും ശ്വാസത്തിന്റെ പ്രശ്നമാണ്. നന്നായി ശ്വാസം എടുത്ത് ലെവൽ 2-ലെ ഒറ്റ സ്വരം പരിശീലിക്കൂ.",
      Hindi:
        "स्वर नीचे जाना अक्सर साँस की कमी है, कान की नहीं। गहरी साँस लेकर लेवल 2 का एक ही स्वर साधिए.",
    },
  },
  {
    keys: ["gamaka", "carnatic", "ഗമക"],
    answers: {
      English:
        "Gamaka is a controlled bend, not a shake. Start slow — slide Sa to Ri across two full seconds — and speed up only once the curve stays smooth. Level 10 drills exactly this.",
      Malayalam:
        "ഗമകം നിയന്ത്രിത വളവാണ്, വിറയലല്ല. 'സ' മുതൽ 'രി' വരെ രണ്ട് സെക്കൻഡിൽ വഴുതൂ; വളവ് മിനുസമായാൽ മാത്രം വേഗം കൂട്ടൂ.",
      Tamil:
        "கமகம் என்பது கட்டுப்பாட்டுடன் வளைவது, நடுக்கம் அல்ல. 'ஸ' முதல் 'ரி' வரை இரண்டு வினாடிகளில் மெல்ல நகருங்கள்.",
    },
  },
  {
    keys: ["warm up", "warmup", "riyaz", "how long", "practice time"],
    answers: {
      English:
        "Ten focused minutes daily beats one hour a week. Two minutes of breathing, five of scales, three of a song you love.",
      Malayalam:
        "ദിവസവും പത്ത് മിനിറ്റ് ശ്രദ്ധയോടെ പരിശീലിക്കുന്നത് ആഴ്ചയിൽ ഒരു മണിക്കൂറിനേക്കാൾ നല്ലതാണ്.",
      Hindi:
        "रोज़ दस मिनट का ध्यानपूर्वक रियाज़, हफ़्ते में एक घंटे से बेहतर है.",
    },
  },
  {
    keys: ["throat", "pain", "hoarse", "വേദന"],
    answers: {
      English:
        "Singing should never hurt. Stop, sip warm water and rest your voice for a day. When you return, sing at half volume — power comes from breath, never from squeezing.",
      Malayalam:
        "പാടുമ്പോൾ വേദന വരരുത്. നിർത്തി ചൂടുവെള്ളം കുടിക്കൂ, ഒരു ദിവസം വിശ്രമിക്കൂ. പിന്നെ പകുതി ശബ്ദത്തിൽ പാടൂ.",
    },
  },
  {
    keys: ["shy", "nervous", "confidence", "stage", "പേടി"],
    answers: {
      English:
        "Every good singer started exactly where you are. Sing to a wall, then to one friend, then to a room. Your voice is already worth hearing.",
      Malayalam:
        "എല്ലാ നല്ല ഗായകരും നിങ്ങൾ ഇപ്പോൾ നിൽക്കുന്നിടത്ത് നിന്നാണ് തുടങ്ങിയത്. നിങ്ങളുടെ ശബ്ദം കേൾക്കാൻ യോഗ്യമാണ്.",
      Hindi:
        "हर अच्छा गायक वहीं से शुरू हुआ जहाँ आप हैं। पहले दीवार को, फिर एक दोस्त को, फिर सबको सुनाइए.",
    },
  },
];

const FALLBACK: Partial<Record<CoachLanguage, string>> = {
  English:
    "Good question. For almost everything the honest answer is: breathe lower, sing softer, repeat daily. Try today's level drills and ask me again after a week.",
  Malayalam:
    "നല്ല ചോദ്യം. മിക്കതിനും ഉത്തരം ഇതാണ്: ആഴത്തിൽ ശ്വസിക്കൂ, മൃദുവായി പാടൂ, ദിവസവും ആവർത്തിക്കൂ.",
  Hindi:
    "अच्छा सवाल। लगभग हर बात का सच्चा जवाब है: गहरी साँस, कोमल आवाज़, रोज़ अभ्यास.",
};

/** WHAT: Best matching answer for a learner's question in the chosen language. */
export function answerCoach(question: string, lang: CoachLanguage): string {
  const q = question.toLowerCase();
  const hit = RULES.find((r) => r.keys.some((k) => q.includes(k.toLowerCase())));
  const set = hit ? hit.answers : FALLBACK;
  return set[lang] ?? set.English ?? FALLBACK.English!;
}

export const SUGGESTED_QUESTIONS = [
  "How do I stop my voice cracking on high notes?",
  "How do I improve breath support?",
  "How do I sing gamaka?",
  "I feel too shy to sing",
];
