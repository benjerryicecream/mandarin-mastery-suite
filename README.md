# Mandarin Mastery Suite

A complete, offline, static web app for an absolute beginner learning **Simplified Mandarin**.
200 cards · 10 sets · 5 quiz modes · tone trainer · stroke practice · dialogues · phrasebook · Leitner progress.

## Run it

Open `index.html` in any modern browser (Chrome, Edge, Safari, Firefox) — double-clicking the file is enough.
No server, no build step, no npm, no account, no network calls. Everything is `file://`-safe and also works on any static host (drop the folder on GitHub Pages, Netlify, an S3 bucket…).

On a phone: copy the folder to the device (or host it) and open `index.html`.

## What's inside

```
index.html              app shell + bottom navigation
css/app.css             dark, mobile-first theme
js/data-cards.js        200 cards in 10 sets (hanzi + syllables/tones + English)
js/data-content.js      dialogues, phrasebook, tone models, 20 characters with stroke data
js/core.js              pinyin generation, localStorage store, speech wrapper, UI primitives
js/views.js             Today, Cards, Quiz modes, session engine
js/views2.js            Tone trainer, character writer, dialogues, phrasebook, progress, settings
js/app.js               hash router + boot
```

## Features

- **Flashcards** — 10 sets × 20 cards. Leitner boxes 1–5: correct moves a card up one box, wrong sends it back to box 1. Due cards come first; box 1 is due the same day, then 1, 2, 4 and 8 day gaps.
- **Quiz modes** — multiple choice, character recognition (no pinyin hint), listening, tone identification, pinyin typing (`ni3hao3`, `nǐ hǎo` or `nv3` all accepted). Card-based modes feed the same Leitner boxes.
- **Tone trainer** — pitch-contour diagrams on a 5-to-1 grid, minimal pairs (*mā má mǎ mà ma*, *shī shí shǐ shì*, *shū shú shǔ shù*, *yī yí yǐ yì*, *bāo báo bǎo bào*) and a 65-syllable listen-and-identify drill.
- **Character writer** — 人 大 小 山 水 日 月 木 火 土 王 天 地 上 下 中 国 好 学 生 with numbered strokes, an animated stroke order guide, a printable-character reference overlay, and finger/mouse tracing with a stroke-count check.
- **Dialogues** — 5 scenes, line-by-line audio, pinyin and English toggles.
- **Phrasebook** — 36 survival phrases in six situations (restaurant, directions, shopping, hotel, emergency, basics).
- **Today** — one guided flow: due reviews → up to 5 new cards → a short quiz.
- **Progress** — streak, best streak, mastered count, accuracy per set, box distribution, daily goal ring, review-queue count.

## Design rules honoured

- **Simplified characters only.**
- Every card shows characters, pinyin **with tone marks**, and English.
- **Tone is never colour-only.** Every tone display carries the tone number (1–4, 5 = neutral), the tone name and a shape (`─ ↗ ∨ ↘ •`).
- Large type, 52 px minimum tap targets, dark theme, one task per screen.

## Audio

Speech uses the browser's built-in `speechSynthesis` with a `zh-CN` voice. Tones cannot be faked with an English voice, so if no Chinese voice is present the app says so, explains how to install one (Windows / Android / iOS / macOS) and disables the listening and tone drills instead of pretending to play audio. Everything else keeps working.

## Progress

Stored in `localStorage` under the key `mms.v1` (boxes, due dates, streak, per-set accuracy, daily counters, settings). "Reset all progress" in **More** clears it.

## Honest notes

- The stroke-order guide is a **simplified skeleton** of each stroke, not brush calligraphy: it teaches order, direction and count. The “Reference” button lays the printed character behind it for comparison.
- Pinyin is generated from stored syllable + tone numbers, so a tone mark can never disagree with its tone number.
- 不客气 / 不是 are shown in citation spelling (`bù…`) with a note about the spoken 2nd tone; the typing quiz accepts both.
