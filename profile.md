# Andy Lee — athlete profile

_Living document. Updated 2026-11-11. The current arc's targets live in `arcs/<arc>/training/arc.md`; this file is what outlives arcs._

## Who
- **33, 6'0", ~189 lb.** Right-handed; **plants off the right leg** to jump.
- **10 years of lifting, 2 years chasing the dunk.** Strength base is advanced (2× BW squat); jump training age is beginner — jumping has rarely been trained on purpose, and never measured before Nov 2026.
- Plays pickup basketball on Saturdays. Wants to be athletic and durable for a long time; trains with structure and chases numbers.

## Long-term (by end of 2027)
- **Clean & jerk 245.** Power clean 240 / C&J 235 are the Jan 2027 step.
- **Bodyweight 185**, held.
- **Dunk a volleyball (Jan 30, 2027), then a basketball.**
- **Back squat 405.** Parked while the jump is the priority; 375–385 held through Jan.

## Numbers (best ever · current · date)

| Lift | Best | Current | Date |
|---|---|---|---|
| Back squat | e1RM 380 (Feb 2026) · 355 single (Sep 21) | 295×8 · 310×6 (e1RM ~374) | Oct 2026 |
| Front squat | e1RM 326 (Jan) · 285×3 | 245×5 (hip-limited) | Oct 2026 |
| Bench | 215×6 (e1RM 258) · 220×4 | same | Oct 2026 |
| Weighted pull-up | +70×4 | +55×6 · +45×10 | Oct 2026 |
| Deadlift (clean / conv.) | 295×3 (e1RM 325) | — | Aug 2026 |
| Power clean | **225** single | 225 | Nov 4, 2026 |
| Power clean & jerk | 205 | 205 | Sep 2026 |
| Muscle snatch / power snatch | 115×2 / 104 | same | Oct 2026 |
| Overhead squat | 115 | 115 | Sep 2026 |
| Jump | tennis-ball dunk (≈ 10'2–10'3" touch, est.) | **ladder baseline W1, Nov 2026** | — |
| Bodyweight | 192 (May) → 189 (Jul 30) | weigh every Sunday | — |

Records per rep range (8s / 6s / 4s): bench 195 / 215 / 220 · pull-up +45 / +55 / +70 · squat 295 / 310 / 325. Source of truth for all of this is Supabase; this table is a snapshot.

## Diagnosis
Strength-dominant, explosive- and reactive-deficient: power clean ÷ squat = 0.60 (threshold 0.75). Force is made slowly; springiness untrained. Position-limited on the right side (below). The lever for the jump is technique, reactive work and freshness — not more strength.

## Injuries and limits → what changes

| Area | Status | What it stops | Substitution / rule |
|---|---|---|---|
| **Right hip** | Pinch in deep flexion + internal rotation since late Oct 2026. **Physio (Nov 17, 2026): fine to train; keep building strength and end range.** | Deep squat depth, full-clean catch | Deep-squat skill 2×/week (Mon, Fri) · depth pain-guided (≤ 3/10) · lower the box as range comes · pain ≥ 3/10 → that position out for the week |
| **Right groin / adductors** | Limited mobility; cleared with the hip | Wide stances, deep lateral work | End-range strength: loaded tailor's pose, horse stance squats, Copenhagen · pain-guided |
| **Left knee** | Sharp pain rising from a *cold* deep squat; fine once warm (Nov 2026) | Cold deep squats | Never squat deep cold: 10 box squats + Spanish-squat holds before the first loaded rep. Knee ≥ 3/10 *during* a session → no depth jumps that week |
| Left foot turns out in squats | Compensation for the right hip / ankle | — | Lifting shoes; knee tracks over 2nd toe; depth only where the pelvis stays level |
| Shoulders | Not a current issue (per Andy, Nov 2026). Right shoulder and left wrist (De Quervain's) healed Jun 2026 | — | Landmine / hang variants only if something returns at ≥ 3/10 |

## Coach
**Coach Zhou, DNT Weightlifting Club** — programs the Olympic lifts in 2-week PDFs ("andy program<N>–<N+1>.pdf") via the WhatsApp group "DNT + Andy 24 weeks", Chinese/English. Three days a week with a fixed shape: a heavy clean day, a clean + pull day, a jerk/overhead day, one snatch session per two weeks; 5–6 sets of 1–3 at 80–90%, deload every third week, max tests in a peak block. Her lifts run as written and land Sun / Thu / Tue / Fri; her back squat is skipped (the wave covers it). Her week number = arc week. Standing asks: heaviest day on Sunday, Tuesday light, peak toward the arc's test date.

## Logistics
- **Gym:** Bay Club El Segundo — full equipment, boxes, bands, rim. Own lifting shoes.
- **Sessions:** 60 min core, 90 when possible. 4 core days (Sun/Mon/Tue/Thu) + 2 bonus (Fri/Sat). Basketball after Saturday's jumps.
- **Measurement:** ball ladder at a rim weekly (no Vertec); bodyweight Sunday; flexibility tests at block ends.
- **Travel:** gym access while travelling; rim access not guaranteed — the ladder moves to whichever day has a rim.
- **Logging:** Telegram bot → Supabase (see `AGENT.md`); Claude for plan changes.

## How he trains (evidence, May–Nov 2026)
- **3.6–3.9 sessions a week in every block, whatever was planned.** Sun/Mon/Tue/Thu happen; Saturday and "optional" days drop first. Plan for four.
- **Complexity spikes precede fall-offs** (Block 1, May 2026: a second program stacked on top → 2.5 weeks lost). Keep ~6 exercises, one structure, loads change not lifts.
- **Unmeasured goals die within three weeks.** Side split, jumps and bodyweight all went unlogged and stopped.
- **What works:** seeing the record to beat (Train Heroic era); a fixed split; waves (every strength PR); the coach's program when it's folded in, not added.
- **Recovery:** ~7 h sleep. Doesn't cook; Sunday batch-prep is the pattern that has worked. Bodyweight target 185, slow.

## How to work with him
- **Propose before changing.** Especially around injuries.
- Show the number to beat; it's the motivation lever.
- Changes to rules go in `.claude/skills/` + the arc's `arc.md`; changes to prescription go in the block file. Never both plans and sets in one place.
- If a week shrinks: Tue → Sun → Mon → Thu. Don't apologise for Fri/Sat.
