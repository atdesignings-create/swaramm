# Swaram — Vocal Coaching Platform

A calm, non-judgmental singing coach with real-time pitch analysis, a mastery-locked curriculum, Malayalam-first song practice, and a coaching dashboard.

Delivered two ways, from one shared design and one shared feature set:
1. A single self-contained `Swaram.html` file you can download and open anywhere (no internet, no build tools).
2. The same app built properly into this project as React routes, so it can keep growing.

## Approach

Build a clean, solid core first, structured so every part expands without rework. Nothing half-finished ships: each phase is complete and error-free before the next starts.

### Phase 1 — Core (built now)
- **Pitch engine**: microphone capture, autocorrelation pitch detection, Hz → note mapping (A4=440), cents deviation, stability/vibrato read-out, live canvas pitch curve.
- **Onboarding + vocal diagnostic**: welcome screen ("No one judges here — every voice can grow"), guided low/high/hold recording, then a report with vocal range, voice type (Bass → Soprano), pitch consistency, strengths, and one gentle focus area.
- **Lessons & level locking**: 10 levels (Breathing & Basics → Gamaks/Microtones). Reference tones are synthesised in-browser; live singing is scored; 1–3 stars awarded. Next level unlocks only at ≥85% mastery of its precursors.
- **Exercise library**: a categorised data structure (category → level → generator template) that produces exercises programmatically — pitch matching, arpeggios, interval jumps, scales, agility runs, breath control — so it scales past 1,000 without hand-writing each one.
- **Dashboard**: streaks, stars, progress rings, accuracy-over-time chart, all saved locally on your device.
- **Settings**: dark / calming-pastel themes, mic sensitivity calibration, reset progress.
- **Language**: English + Malayalam UI throughout.

### Phase 2 — Extensions (after you try Phase 1)
- Song practice mode: curated Malayalam classical swaras, light music and folk, plus international tracks, as synth reference melodies with karaoke-scrolling lyrics; paste-your-own-lyrics engine; post-song timeline analysis ("At 0:42 on 'Premam' you went flat…").
- Ask-the-Coach chat panel with a rule-based answer tree.
- Remaining languages: Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi.
- Weekly auto-generated practice timetable from your recurring weak areas.

Say the word at any point and I can pull Phase 2 items forward or trim them.

## Design

Soothing, modern and mobile-first: soft gradients, generous spacing, rounded cards, gentle motion on every interaction, large touch targets, and readable Malayalam typography. Encouraging copy everywhere — never a red "wrong", always "close — try a touch higher".

## Technical notes

- Single-file build: one `.html` with inline CSS + vanilla JS, namespaced as `SwaramApp = { AudioEngine, ExerciseDB, LessonEngine, SongPractice, Tracker, i18n }`, every module and function carrying a What / Why / How comment header. Saved to your documents for download.
- React build: `src/routes/index.tsx` (onboarding + home), plus `/practice`, `/lessons`, `/dashboard`, `/settings` routes; audio engine and exercise DB as shared modules under `src/lib/swaram/`; design tokens added to `src/styles.css` (no hardcoded colours); per-route SEO metadata.
- Everything runs client-side; progress persists in `localStorage`. No backend needed.
- Microphone access requires user permission and a secure context — handled with a clear, friendly prompt and a fallback listen-only mode if denied.
