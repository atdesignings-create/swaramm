# Swaram: Your Vocal Journey

Act as a Principal Full-Stack Engineer and UX Designer. Build a complete, production-grade, single-file HTML/JS/CSS web application named "Swaram" — an ultra-accessible, non-judgmental vocal coaching platform designed for absolute beginners to advanced singers of all ages.

​The application must deliver professional-grade pitch accuracy analysis (\ge 90\% accuracy target vs. real-life human coaches) while explaining complex vocal mechanics in ultra-simple, encouraging terms (e.g., explaining breath support as "Smell the flower, blow out the candle").

​Key Product Additions & Feature Requirements

​Malayalam & Multi-Language Song Library: Dedicated song-learning tracks specifically optimized for Malayalam vocals and regional classic/popular songs alongside standard international practice tracks.

​Massive Exercise & Warm-Up Engine (1000+ Database Structure): A scalable data architecture housing over 1,000 categorized exercises, warm-ups, vocal agility drills, and breath control techniques.

​Strict Mastery-Based Level Progression: Gamified level locks. Higher levels, advanced scales, and complex songs remain locked until the user achieves a high accuracy score (\ge 85\%-90\%) on precursor lessons.

​Gamification & Delight: Earn stars, achievement badges, daily practice streaks, and visual progress rings to make music learning additive and enjoyable.

​Stunning & Calming UI/UX: A modern, clean, mobile-responsive design utilizing smooth animations, micro-interactions, soothing color palettes, and intuitive controls.

​Comprehensive Architecture & Component Breakdown

​1. Real-Time Pitch Analysis (Web Audio API Engine)

​Implement a real-time pitch detection engine using the Web Audio API (getUserMedia + AnalyserNode) and an Autocorrelation Algorithm.

​Calculate exact pitch frequencies (\text{Hz}), map them to musical notes (e.g., \text{A4} = 440\,\text{Hz}), and track pitch stability/vibrato.

​Output live visual feedback using an HTML5 Canvas waveform/pitch-curve display.

​2. Onboarding & Vocal Range Diagnostics

​Welcoming, zero-pressure intake screen ("No one judges here — every voice can grow").

​Guided vocal diagnostic: records the user singing a starter phrase to calculate pitch accuracy, vocal range (lowest to highest note), and voice type (e.g., Soprano, Tenor).

​Generates an instant diagnostic report breaking down strengths, pitch consistency, and weak points, placing the user in a tailored learning path.

​3. Structured Learning Path & 1000+ Exercise Library

​Level Locking: Multi-tier curriculum (Level 1: Breathing & Basics \rightarrow Level 10: Advanced Microtones/Gamaks). Levels stay strictly locked until the user masters prior content with high accuracy.

​Extensible Architecture: Define a global array/object structure pre-populated with diverse warm-ups (pitch matching, arpeggios, interval jumps, breath control) designed to support expanding to over 1,000 unique exercises.

​Lesson Modal: Displays simple instructions, reference audio/tone generator using Web Audio API synthesisers, live singing input, and a victory screen awarding 1-3 Stars upon completion.

​4. Song Practice Mode & Malayalam Specialization

​Custom lyric-pasting engine combined with a curated library of pre-loaded tracks, featuring dedicated Malayalam songs (e.g., Classical Swaras, Light Music, Folk) alongside international tracks.

​Karaoke-style synchronized lyric scrolling paired with live pitch tracking against standard reference note tracks.

​Post-Song Analysis: Provides detailed timeline breakdowns (e.g., "At 0:42 on the word 'Premam', your pitch went flat — try holding your breath support longer here").

​5. Daily/Weekly Coaching Dashboard

​Save historical performance data to localStorage.

​Daily Progress: Graphical comparison of today's pitch accuracy vs. previous sessions.

​Weekly Coach Report: Automatically generates next week’s practice timetable based on persistent weak areas identified during practice sessions.

​6. AI Ask-the-Coach (Chat Panel)

​Interactive coaching panel simulating a warm, world-class vocal instructor.

​Language Selector: Native support for explanations in Malayalam, English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, and more.

​Pre-configured rule-based response tree answering common singing doubts (e.g., "How do I stop my voice from cracking on high notes?").

​7. Settings & Internationalization (i18n)

​Global i18n translation dictionary object controlling all UI labels.

​Switches UI language seamlessly between English, Malayalam, and major Indian/Global languages.

​Options to reset progress, adjust theme colors (Dark Mode / Calming Pastel), and calibrate microphone sensitivity.

Self-Contained Single File: All HTML structure, CSS styling, and JavaScript logic must reside in a single .html file without external build tools or frameworks.

Code Commenting: Add descriptive comment headers for every major class, function, and module explaining What it does, Why it exists, and How it fits into the application.

Clean & Modular JS Structure:

const SwaramApp = {

  AudioEngine:  { /* Web Audio API & Autocorrelation Logic */ },

  ExerciseDB:   { /* Data structure for 1000+ exercises */ },

  LessonEngine: { /* Level lock/unlock, scoring, star calculation */ },

  SongPractice: { /* Karaoke sync & line-by-line pitch audit */ },

  Tracker:      { /* LocalStorage analytics & auto-generated timetables */ },

  i18n:         { /* Translation dictionaries (Malayalam, English, etc.) */ }

};

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://swaramm.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d1b7aff5-c1ed-4344-a04b-b0fcf72bef10).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
