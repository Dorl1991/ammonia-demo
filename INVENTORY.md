# INVENTORY — Stitch project "midAmo" → ammonia-demo

Source: Stitch project `projects/11212532714759115136` ("midAmo"), 48 stations.
Station 1 had two candidate screens (`0f815ca4...` and `6ba3940d...`); the user
confirmed `0f815ca4...` (modern, correct "תחנה 1 מתוך 48" caption) as canonical.
See `source/station-map.json` for the full id mapping.

Station type column follows `ammonia-ref/storyboard.md`'s classification
(hero / content / concept / checkpoint / loop / quiz / summary), cross-checked
against each screen's actual markup.

| n | name | Stitch screen id | type | widgets | expansions | interactive controls |
|---|------|-------------------|------|---------|------------|----------------------|
| 1 | אמוניה במפעל | 0f815ca416144471bab5b13e88ecc385 | hero | — | — | CTA "בואו נתחיל" → next |
| 2 | איך נוצרת אמוניה? | e268b8d6a60945e6a66f0ceb464b3efd | content | — | — | nav only |
| 3 | לאן הולכת האמוניה אחרי הייצור? | b83ee83fd9854a23970dbb49700516ba | content | — | — | nav only |
| 4 | לא רק קירור | a99a62a571d944ca89e309030e8b5937 | content | — | — | nav only |
| 5 | בדיקת הבנה 1 | 15f62dfcdfdb41289761902ba9d8f51e | checkpoint | — | Q1 true-false (was pre-answered demo, reset), Q2 mcq | select + submit, real validation |
| 6 | איך מזהים דליפת אמוניה? | a6327203d90a44f884f8897579380532 | content | — | — | nav only |
| 7 | לא מה שהיית מצפה | 889d94f68bd341928fb05644626f639b | content | — | — | nav only |
| 8 | דליפה קטנה, ענן ענק | 734b6c03402b4e1e85775d33c31234b3 | content | — | — | nav only |
| 9 | בדיקת הבנה 2 | 332466f8659f41a2ab191cf9d9b86ce5 | checkpoint | — | Q1 true-false, Q2 mcq (both built from scratch, reused Stitch's demonstrated correct/wrong classes) | select + submit, real validation |
| 10 | שתי שיטות אחסון והובלה | 1758a65d4dc644eab3d7e8dcfafb9a1c | content | compare-slider (fully native, pointer-drag) | drag handle reveals "מכל קר" vs "מכל בטמפ' סביבה" | drag/touch/mouse, untouched |
| 11 | אמוניה ומים | 4a13e1dceee04cc6a23b395e9baa9972 | content | — | — | nav only |
| 12 | תחום הדליקות אינו ערובה | eff9dc3f58284d16a65f05f718763228 | content | — | — | nav only (see render note below) |
| 13 | בדיקת הבנה | aa32b6775c7545169a26337a02679fb2 | checkpoint | — | Q1 mcq (reset), Q2+Q3 true-false (native selectOption) | click + submit, real validation |
| 14 | מספר אחד שמזהה אמוניה: UN 1005 | 51e8097c8ca946339a68040c5fb00cc3 | content | — | — | nav only |
| 15 | שני סיכונים בו-זמנית | 58f85008433a4ccfaef1857b32131d51 | content | — | — | nav only |
| 16 | איך קוראים את הלוחית הכתומה | 0289e7d89d1e4c47b3e1a3ca3de59129 | content | — | — | nav only |
| 17 | בדיקת הבנה | 9a79a722b5ad47409c9ba6a4b349a19d | checkpoint | — | Q1 fill-blank (2 numeric inputs), Q2 true-false (reset) | type + click + submit, real validation |
| 18 | כרטיס 125 במדריך לפעולות חירום | 9f7aa03dda934eae8a8eb5ccaf48ded2 | content | — | — | nav only |
| 19 | אותה אמוניה, שמות וקודים אחרים | d64e253fdcdb47aea88c25ac5f377887 | content | flip-cards (8 cards, fully native toggleFlip) | tap any card to flip; card 6 kept pre-flipped (widget rule = keep drawn state) | tap, untouched |
| 20 | בדיקת הבנה | 39eef6a0df614f5eb741c00176222a38 | checkpoint | memory-match (3 pairs, rebuilt from partial demo) | Q1 memory-match, Q2 mcq (native select) | tap-to-match + submit, real validation |
| 21 | מתי מרגישים, מתי מדווחים | 5e404a8ce4374a74a6a1e1a2b9f38d36 | content | — | — | nav only |
| 22 | IDLH | d88df26a083249548a1f5282122ab785 | concept | — | — | nav only |
| 23 | הריכוז דועך עם המרחק | 1864b8f31fe348cebc9de028b0e73a20 | content | timeline (static, no interactivity needed) | — | nav only |
| 24 | בדיקת הבנה | db0148320118401db20624632e40a9b6 | checkpoint | sequence (native HTML5 dnd, built touch+keyboard fallback) | Q1 sequence, Q2 true-false (reset), Q3 mcq | drag/tap/keyboard + submit |
| 25 | אמוניה מגיבה עם חומצות | 6de3779624b8421b83d100e72d5dd029 | content | — | — | nav only |
| 26 | לא מנקים דליפת אמוניה באקונומיקה | 12da86780c714fe59c7d6f046e6cbceb | content | — | — | nav only |
| 27 | עם מה אמוניה מגיבה בחוזקה | a4ae3b0a4bb041fd8054473476354456 | content | click-reveal (4-item accordion, fully native toggleCard) | tap header expands; card 2 kept pre-expanded (widget rule) | tap, untouched |
| 28 | בדיקת הבנה | 0a812b58c91b49fab22ea332fdf677a1 | checkpoint | drag-classify (6 chips, rebuilt tap-to-place, 3-state cycle) | Q1 drag-classify, Q2 true-false (native select) | tap-to-place + submit, real validation |
| 29 | רואים דליפה - מה עושים? | 4f92091c45f74bcdaf87d629f29e460e | content | — | — | nav only |
| 30 | מים - רק כערפל | cd8d3724d013422c81cae7ebd00279da | content | — | — | nav only |
| 31 | קרח על צנרת - אזהרה | f19fe028f20b46f2b38a844a2bdf505c | content | — | — | nav only |
| 32 | בדיקת שיקול דעת | 0643a705219c4547a03ce00c8e82933c | checkpoint | branching (fully native selectScenario) | Q1 branching (3 paths, outcomes always visible, safe path pre-marked — kept exactly as Stitch drew it), Q2 true-false | click + submit, real validation on Q2 |
| 33 | מי נגר וחשמל | 5c6511cc4cef4da69c54266d9b5f8f5c | content | — | — | nav only |
| 34 | פעולות במערכת - לא לבד | 74a4ee0be17f4ee581283b7724a0a98d | content | — | — | nav only |
| 35 | בדיקת הבנה | feaf6828810143da90ab70f71b8b2ad3 | checkpoint | — | Q1 true-false (reset, instant feedback), Q2 mcq (fully native, `data-correct` already wired — untouched) | click, real validation |
| 36 | איך עובד מעגל הקירור | 4fe57b7d5f2e4773aefa7b3d4b6f75d7 | concept | — | — | nav only |
| 37 | חמשת רכיבי המעגל | e4423b2d4a2944ab804f02e5eda4761d | loop | hotspots (5-node diagram, fully native selectHotspot) | tap a node updates detail card; node 3 kept pre-selected (widget rule) | tap, untouched |
| 38 | שני אזורי לחץ במערכת | 726e571f8cae4f5eb7f3abe6473836af | content | — | — | nav only |
| 39 | בדיקת הבנה | eaf63eabcb414bed8de0fe3faa828561 | checkpoint | sequence (built from scratch, no native JS existed), match-pairs (built from scratch) | Q1 sequence, Q2 match-pairs (5 pairs), Q3 true-false (reset) | drag/tap/keyboard + tap-to-connect + submit |
| 40 | הפסקת חשמל | 18b66f5057b54bb1b113383d08a5177a | content | — | — | nav only |
| 41 | הפסקת חשמל - שני אזורים, שתי תוצאות | eef0503e945447ef9f5ad3e5c1364681 | content | — | — | nav only |
| 42 | בדיקת הבנה | 20ed8beaff0c4976b8a44b81fdacc219 | checkpoint | — | Q1 true-false (reset, instant feedback), Q2 mcq (fully native, `data-correct` wired — untouched) | click, real validation |
| 43 | איפה דולפת אמוניה? | a842ea6baa374d588483f915176326c5 | content | — | — | nav only |
| 44 | למה אמוניה דולפת | a18db942a278468bad9bc4ee7218f4c6 | content | — | — | nav only |
| 45 | הסכנה האמיתית: חשיפה, לא פיצוץ | dcf6616b81c349a98a4c8578ecf71d28 | content | — | — | nav only |
| 46 | בדיקת הבנה | 5f2898d24cfc41d2af17cfe36f0aee6e | checkpoint | — | Q1 mcq (fully native, correct answer wired — untouched), Q2 true-false (reset, instant feedback) | click, real validation |
| 47 | מבחן סיכום | 5918aa268d7d40988170c04e4f391915 | quiz | — | Q1 true-false, Q2 fill-blank, Q3 mcq, Q4 true-false — native answer-tracking/progress kept, added real per-question correct/wrong marking on submit (no separate score screen, none existed in Stitch) | click/type + submit |
| 48 | סיכום השיעור | b1cb209a4aeb479e9b56dd99ddc950bd | summary | confetti (native canvas particle burst, kept) | native script already relabels footer button to "סיום השיעור"; added real navigate-to-station-1 behavior after the confetti plays | tap "סיום השיעור" → returns to station 1 |

## Verification status (Phase 0 gate)

- 48/48 stations confirmed, numbered 1–48, no gaps or duplicates (after
  resolving the station-1 duplicate with the user).
- Every station's full source HTML was read; all hidden/extra content
  (pre-answered demo states, partially-built widgets, native-but-incomplete
  validation scripts) is catalogued above and in `source/notes-inventory.md`.
- No problems blocked continuation once the duplicate was resolved.
