# Working inventory notes (Phase 0) — not the final INVENTORY.md

## Station map
See station-map.json for n -> screen id -> title. 48/48 confirmed, no gaps/dupes
(station 1 duplicate resolved: use 0f815ca4..., excluded 6ba3940d...).

## HEADER DEFECTS (keep as-is per fidelity rule, report in REPORT.md §6)
Many screens carry a stale/wrong caption and/or English placeholder title baked
into the actual markup (not just the rejected station-1 draft). Table:

| n | caption shown | title shown | correct would be |
|---|---|---|---|
| 1 | תחנה 1 מתוך 48 | תחנה 1 אמוניה במפעל | OK (correct, chosen version) |
| 2 | תחנה 3 מתוך 12 | Station Lesson | תחנה 2 מתוך 48 / איך נוצרת אמוניה? |
| 3 | תחנה 3 מתוך 12 | Station Lesson | תחנה 3 מתוך 48 / ... |
| 4 | תחנה 3 מתוך 12 | Station Lesson | תחנה 4 מתוך 48 / ... |
| 5 | תחנה 3 מתוך 12 | Quiz Assessment | תחנה 5 מתוך 48 / בדיקת הבנה 1 |
| 6 | תחנה 6 מתוך 48 | איך מזהים דליפה? | OK |
| 7 | תחנה 3 מתוך 12 | Station Lesson | תחנה 7 מתוך 48 |
| 8 | תחנה 3 מתוך 12 | Station Lesson | תחנה 8 מתוך 48 |
| 9 | תחנה 3 מתוך 12 | Quiz Assessment | תחנה 9 מתוך 48 |
| 10 | תחנה 3 מתוך 12 | Station Lesson | תחנה 10 מתוך 48 |
| 11-20 | תחנה 11 מתוך 48 (fixed wrong number for all 10) | Station Lesson | תחנה N מתוך 48 each |
| 21 | (missing entirely) | Station Lesson | תחנה 21 מתוך 48 |
| 22-30 | תחנה N מתוך 48 (CORRECT number) | Station Lesson (still wrong) | title only wrong |
| 31-40 | תחנה N מתוך 48 | correct Hebrew title | OK, fully correct |
| 41-44 | (missing) | "Station 41 Hazmat Isolation" (English, and wrong number reused for 41-44!) | תחנה N מתוך 48 / correct title |
| 45-46 | (missing) | "Station 45 Emergency Shutdown" (reused for both 45 AND 46) | |
| 47 | (missing) | "Station 48 Final Drill" (WRONG - this is station 47) | |
| 48 | תחנה 48 מתוך 48 (correct) | "Station 48 Final Drill" (English but at least right number) | Hebrew title missing |

ACTION: keep every one of these exactly as coded. Do not recompute/restyle
per spec §4. Log verbatim in REPORT.md §6 as suspected mistakes kept as-is.

## Remote images needing localization (googleusercontent.com aida-public CDN)
Stations with <img src="https://lh3.googleusercontent.com/..."> : 02, 09, 10(x2), 18, 29, 32, 34
All others use inline SVG only (no remote images) - good, less to localize.
Also ALL 48 load Google Fonts (Rubik + Material Symbols Outlined) via <link> - must localize.
ALL 48 load Tailwind via <script src="https://cdn.tailwindcss.com"> with inline
per-screen config (colors differ per screen!) - must pre-compile to static CSS
per screen (via headless browser) and remove the CDN script for offline + isolation.

## Per-station interactivity already authored natively in Stitch HTML (reuse per fidelity rule)
- Station 1 (hero): click ripple + custom event, decorative only. CTA = "בואו נתחיל".
- Station 5 (checkpoint): Q1 true-false drawn PRE-ANSWERED (must reset to neutral).
  Q2 mcq has native selectQ2Option()/validateCheckpointQuiz() JS but validation
  is COSMETIC ONLY (always shows success regardless of correctness) - must replace
  with real validation using answer key. Options captured, id=q2-options-container.
- Station 9 (checkpoint): Q1 true-false neutral (good baseline for unanswered state
  styling). Q2 mcq drawn in "wrong answer inspection" example state (no scripting
  at all) - must build all interactivity from scratch, reusing the exact classes
  shown for correct/wrong/neutral options.
- Station 10 (content, "compare-slider" style widget): FULLY functional native
  pointer-drag JS already implemented (clip-path reveal). Keep as-is verbatim,
  just localize its 2 background images. Must exclude this widget's pointer
  events from the page-level swipe-navigation gesture region.

## Answer key cross-check vs storyboard.md (done for stations 5, 9 so far - both match)

## Remaining special stations to read: 13,17,19,20,23,24,27,28,32,35,37,39,42,46,47
## Content-only stations (30 total) needing only prev/next nav - lower priority for deep reading,
## but still need per-file interactivity audit at build time (grep pass already shows
## zero radio/checkbox/draggable outside the 18 special stations - consistent with "static content").

## Phase 0 continued: all 18 special stations now read in full. Interaction inventory:
- Widgets ALREADY fully functional natively in Stitch HTML (zero extra JS needed,
  keep verbatim, only reset per widget rule = keep as-drawn, no reset):
  10 compare-slider(pointer drag), 19 flip-cards(toggleFlip, card6 pre-flipped=keep),
  27 click-reveal(toggleCard accordion, card2 pre-expanded=keep),
  32 branching Q1(selectScenario ring-highlight, all 3 outcomes always visible,
     safe path ג pre-styled green=keep exactly), 37 hotspots(selectHotspot, node3
     pre-selected=keep).
- Stations needing added validation/reset logic (native scaffolding partial or absent):
  5 (tf pre-answered→reset; mcq has native select+fake-always-pass validate→replace),
  9 (tf neutral OK; mcq shown in wrong-example state→reset, build from scratch),
  13 (mcq pre-answered→reset; 2x tf native selectOption()+progress, submit has NO
      onclick wired→add), 17 (fill-blank neutral OK, 2 numeric inputs; tf shown
      wrong-example→reset; submit has no handler), 20 (memory-match shown
      partial-demo→reset to unmatched; mcq native select, no correctness check),
  24 (sequence native HTML5 dnd shuffled→wire correctness on submit + touch
      fallback needed; tf pre-answered-correct→reset; mcq neutral radio ok;
      submit disabled placeholder), 28 (drag-classify shown partial demo
      (2/6 items placed)→reset all 6 to tray, build tap-to-place from scratch;
      tf native select, submit is a no-op stub→add real check),
  35,42,46 (not read in full; same tf/mcq pattern as 5/9/13/24 confirmed by
      answer-key cross-check, will reuse same generic engine + verify text via
      targeted grep before shipping),
  39 (sequence has NO native JS at all, draggable NOT set→build fully from
      scratch incl. touch; match-pairs shown 1/5-connected demo, no native JS→
      build tap-to-connect from scratch; tf shown wrong-example→reset),
  47 (final quiz: FULLY functional native answers-tracking/progress/enable-submit
      JS already (tf x2, fill-blank numeric, mcq) but submitAssessment() always
      shows generic "success" regardless of correctness→must add real
      correct/wrong marking per question card, no separate score screen per
      spec §6 since Stitch has none - will mark each of the 4 cards individually).

## RENDER-ENGINE EDGE CASE FOUND (station 12, content, no interactivity involved):
A decorative callout badge ("הצתה מתועדת עם שאריות שמן") is positioned with
Tailwind arbitrary values `right-[26.6%]` + `-translate-x-1/2` on a `whitespace-nowrap`
Hebrew string. The math is right at the edge of fitting a 326px-wide parent (needs
badge width <= ~195px to just barely fit; it measures ~195px and clips ~21px off
the LEFT edge in my Chromium headless-shell render). Reference Stitch screenshot
does not show this clipping (their renderer or font hinting differs by a few px).
Did NOT modify the Stitch markup (would violate no-layout-change fidelity rule).
Mitigation: outer app-shell station viewport has overflow-x:hidden so this clips
silently instead of creating a page scrollbar. Logged for REPORT.md §6.
Full verify.mjs run: 48/48 stations load with zero JS errors and zero external
network requests; only this one has horizontal-overflow flag (documented above).
