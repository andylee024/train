# Athlete Sheet — Format Spec

> Companion to [`ff-mvp.md`](ff-mvp.md). Defines the **one Google Sheet** every athlete sees. SMS handles every conversation; this Sheet handles every viewable artifact. The athlete touches nothing else.

## Principles

1. **Two surfaces, period: SMS + this Sheet.** No app, no portal, no dashboard, no website past the one-screen signup.
2. **One Sheet per athlete**, at a stable URL. Per-athlete sharing.
3. **Bidirectional, with discipline.** Athlete CAN edit cells in Tab 2 (This Week) directly. All other tabs are read-only — corrections flow through SMS → agent → renderer.
4. **System of record is Supabase.** The Sheet is a live render of the database + the back-of-house bundle. If Sheet and Supabase disagree, Supabase wins. Renderer regenerates from db.
5. **Tabs ordered by athlete frequency.** Home → This Week → Plan → Log → Progress. Most-opened first.

---

## Tab spec

| # | Tab | Job | Read/Write |
|---|---|---|---|
| 1 | **Home** | At-a-glance status — the landing tab | Read-only |
| 2 | **This Week** | Today + the week's sessions; logging surface | **Bidirectional** |
| 3 | **Plan** | The full arc — goals, blocks, tests, constraints | Read-only (coach edits via bundle) |
| 4 | **Log** | Every set ever logged | Read-only (edits via SMS) |
| 5 | **Progress** | Trends, PRs, weekly volume | Read-only (auto-computed) |

### Tab 1 — Home

At-a-glance status. The landing tab. Everything else is one click away.

```
┌─────────────────────────────────────────────────────────────────────┐
│  {athlete name} — {arc name}                          Wk N of {total}│
│  Block X: {block name}                                {D} days to    │
│  ─────────────────────────────────────────────        test day       │
│                                                                      │
│  ▸ TODAY  ({day date})                                               │
│    {session name} — {duration}                        ○ Not started  │
│    {one-line exercise summary}                                       │
│    → Open This Week tab to log, or text your sets                    │
│                                                                      │
│  ▸ THIS WEEK                                                         │
│    Mon  {session}                                     {status}       │
│    Tue  {session}                                     {status}       │
│    Wed  {session}                                     {status}       │
│    Thu  {session}                                     {status}       │
│    Fri  {session}                                     {status}       │
│    Sat  {session}                                     {status}       │
│    Sun  {session}                                     {status}       │
│                                                                      │
│  ▸ RECENT PRs                                                        │
│    {lift}     {load × reps}     {date}                               │
│    ...        (last 3)                                               │
│                                                                      │
│  ▸ BODYWEIGHT (7-day avg)     {x.x} lb     {↑↓} {Δ} vs last wk       │
│                                                                      │
│  ▸ COACH NOTE  ({last sync date})                                    │
│    {most recent Sunday synthesis content, max ~4 lines}              │
└─────────────────────────────────────────────────────────────────────┘
```

### Tab 2 — This Week (logging surface, bidirectional)

One section per day in the active week. Athlete can fill set cells directly OR text in. Both flows write to the same place.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  THIS WEEK — Wk N ({date range})                                             │
│                                                                              │
│  {DAY DATE} — {Session name}                              ○ Not started      │
│  ──────────────────────────────────────────                                  │
│  #   Exercise           Prescribed       S1     S2     S3     S4    Notes    │
│  1   {exercise}         {sets×reps@load} ___    ___    ___    ___            │
│  2a  {exercise}         {sets×reps@load} ___    ___    ___    ___            │
│  ...                                                                         │
│  RPE overall: ___    Bw post-WO: ___    Energy 1-10: ___                     │
│  Session notes: _______________________________________________________      │
│                                                                              │
│  [repeat per day for all 7 days; non-today days collapsed by default]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Bidirectional sync:**
- Cell edit in S1–S4 → Apps Script webhook → agent parses → Supabase `exercise_sets` insert
- Same endpoint that SMS log writes to. Both flows equivalent.
- Status (○/✓) auto-updates when all prescribed sets have entries.

### Tab 3 — Plan

The full arc roadmap. Read-only; coach edits the bundle markdown, renderer regenerates this tab.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ARC: {arc name}                                {start} → {end}         │
│                                                                         │
│  PURPOSE                                                                │
│  {1-2 sentence statement of arc's intent}                               │
│                                                                         │
│  GOALS                                                                  │
│  G1  {binary goal}                                  test: {date}        │
│  G2  {binary goal}                                  test: {date}        │
│  G3  {binary goal}                                  test: {date}        │
│                                                                         │
│  BLOCKS                                                                 │
│  ┌────┬───────────────────────────┬─────────┬─────────────────────┐    │
│  │ #  │ Name                      │ Weeks   │ Bet                 │    │
│  ├────┼───────────────────────────┼─────────┼─────────────────────┤    │
│  │ B1 │ {name}                    │ W1–W6   │ {one-line bet}      │    │
│  │    │ ◀ YOU ARE HERE (Wk N)     │         │                     │    │
│  │ B2 │ {name}                    │ W7–W12  │ {one-line bet}      │    │
│  │ B3 │ {name}                    │ W13–W18 │ {one-line bet}      │    │
│  └────┴───────────────────────────┴─────────┴─────────────────────┘    │
│                                                                         │
│  TESTS                                                                  │
│  ┌─────────────────┬─────────────┬──────────────┬─────────────────┐    │
│  │ Metric          │ Baseline    │ Target       │ Test date       │    │
│  ├─────────────────┼─────────────┼──────────────┼─────────────────┤    │
│  │ ...                                                            │    │
│  └─────────────────┴─────────────┴──────────────┴─────────────────┘    │
│                                                                         │
│  CONSTRAINTS                                                            │
│  ⚠ {injury / hard rule / etc}                                           │
│                                                                         │
│  PROFILE                                                                │
│  {days/wk · session length · equipment · age/bw · diagnosis line}       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tab 4 — Log

Every set, all-time. Sorted by date desc. Source: Supabase `exercise_sets` (filtered by `user_id`).

```
┌────────────────────────────────────────────────────────────────────────────┐
│  LOG — every set, all-time            [filter ▾] [sort ▾] [search _______] │
│                                                                            │
│  Date         Session         Exercise          Set  Reps  Load  RPE  Note │
│  ──────────   ─────────────   ────────────────  ───  ────  ────  ───  ──── │
│  {date}       {session}       {exercise}        {n}  {n}   {lb}  {n}  {..} │
│  ...                                                                       │
│                                                                            │
│  Append-only. Edits via SMS: "actually s3 of bench was 235 not 225"        │
│  Agent updates the row; original timestamp preserved.                      │
└────────────────────────────────────────────────────────────────────────────┘
```

### Tab 5 — Progress

Trends + PRs + weekly volume. All derived from Tab 4 Log + `daily_metrics`.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROGRESS                                                                │
│                                                                          │
│  BODYWEIGHT (7-day rolling avg vs target curve)                          │
│  {ascii chart, ~6 weeks visible, target overlay}                         │
│                                                                          │
│  TOP SET — KEY LIFTS (this arc)                                          │
│  ┌──────────────┬──────────┬──────────┬──────────┬──────────┐           │
│  │ Lift         │ Wk 1     │ Wk 2     │ Wk N     │ Trend    │           │
│  └──────────────┴──────────┴──────────┴──────────┴──────────┘           │
│                                                                          │
│  PRs (all-time, auto-computed from Log)                                  │
│  {lift}         {load × reps}     {date}                                 │
│                                                                          │
│  WEEKLY VOLUME — Wk N (sets per movement category, bar chart)            │
│  Squat:    ████████░░ N            Plyo:    ██████░░░░ N                 │
│  Hinge:    ██████░░░░ N            Sprint:  ████░░░░░░ N                 │
│  Press:    ██████████ N            Mobility:████████░░ N                 │
│  Pull:     ██████████ N                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Bidirectional sync rules

| Surface | Writes to | Triggers re-render of |
|---|---|---|
| SMS log (`"3x5 @ 225"`) | Supabase `exercise_sets` | Tab 1 (Today), Tab 4 (Log), Tab 5 (Progress) |
| Sheet Tab 2 cell edit | Supabase `exercise_sets` (Apps Script webhook) | Tab 4, Tab 5 |
| SMS bw (`"188.4"`) | Supabase `daily_metrics` | Tab 1 (BW), Tab 5 (chart) |
| SMS correction (`"s3 was 235 not 225"`) | Supabase `exercise_sets` UPDATE | Tab 4 row, Tab 5 if PR-affected |
| Coach edits bundle markdown | Filesystem | Tab 3 on next push |
| Coach Sunday synthesis | Bundle notes file | Tab 1 Coach Note cell |

**Conflict resolution:** if athlete edits a cell that was already logged via SMS, the cell-edit wins (treated as correction). Original `created_at` preserved on update.

---

## Open / TBD

- **Chart rendering on mobile** — Google Sheets native charts work but need spot-check on iOS/Android.
- **Webhook latency** for Tab 2 cell-edit → Supabase write — target <2s round-trip.
- **Mobile UX of Tab 2** — collapsed-by-default per non-today section needs prototyping.
- **Per-athlete provisioning** — script to copy a template Sheet, share with athlete email, store sheet_id in users table.
- **PR detection logic** — when does a logged set qualify as a PR (estimated 1RM threshold? reps × load? per-rep PRs?).

---

# Worked example — Andy, Block 1, Wk 2 (today is Fri May 15, 2026)

What Andy's Sheet looks like rendered right now. All prescriptions pulled from `docs/athletes/andy/arc-2026-summer-dunk/training/weeks/2026-training-W02.md`. Logged values are illustrative (Supabase doesn't have his actual logs yet).

## Tab 1 — Home

```
┌─────────────────────────────────────────────────────────────────────┐
│  ANDY LEE — SUMMER 2026 DUNK ARC                       Wk 2 of 18   │
│  Block 1: Power Conversion + Upper Build              113 days to   │
│  ─────────────────────────────────────────────        test day      │
│                                                                     │
│  ▸ TODAY  (Fri May 15)                                              │
│    Upper Vertical — Pull-Up + Dips — 60 min          ○ Not started  │
│    Pull-up +15 • Dips +15 • Row • Landmine • Curl • Tri             │
│    → Open This Week tab to log, or text your sets                   │
│                                                                     │
│  ▸ THIS WEEK                                                        │
│    Sun  Lower Strength (LIGHT) + Posterior            ✓ Done        │
│    Mon  Upper Horizontal — Bench + Row                ✓ Done        │
│    Tue  Speed-Strength B — Olympic + Sprints          ✓ Done        │
│    Wed  Recovery + Deep Flex + Pull-Up Vol            ✓ Done        │
│    Thu  Speed-Strength A — Power Clean + Squat        ✓ Done        │
│    Fri  Upper Vertical — Pull-Up + Dips               ○ Today       │
│    Sat  JUMP LAB — Sprint + Approach + Depth          ○ Tomorrow    │
│                                                                     │
│  ▸ RECENT PRs                                                       │
│    Power Clean       140 × 3     Thu May 14                         │
│    Bench Press       170 × 6     Mon May 11                         │
│    Weighted Pull-Up  +10 × 5     Fri May 08                         │
│                                                                     │
│  ▸ BODYWEIGHT (7-day avg)     192.1 lb     ↓ 0.4 vs last wk         │
│                                                                     │
│  ▸ COACH NOTE  (Sun May 10)                                         │
│    Wk 1 in the books — clean execution all 6 sessions. CMJ baseline │
│    at 28.5", side split −22 cm baseline. Block 1 emphasis is        │
│    closing the reactivity gap, so push intent on speed work and     │
│    don't grind the squat — it's maintenance. Bw down 0.4 on the     │
│    cut, exactly on the curve.                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Tab 2 — This Week

Showing 3 of 7 day sections in detail (Sun completed with logs, Fri = today, Sat preview). Other days collapsed.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  THIS WEEK — Wk 2  (Sun May 10 – Sat May 16, 2026)                           │
│                                                                              │
│  SUN MAY 10 — Lower Strength (LIGHT maintenance) + Posterior   ✓ Done 9:22am │
│  ──────────────────────────────────────────                                  │
│  #   Exercise              Prescribed         S1     S2     S3     S4  Notes │
│  1   Back Squat            1×5 + 2×5 @ 280    280×5  265×5  265×5      smth │
│  2   Stiff-Legged Deadlift 4×5,5,4,3 @ 195    195×5  195×5  195×4 195×3     │
│  3   Bulgarian Split Sq    3×8/leg @ 35       35×8   35×8   35×8            │
│  4   Glute-Ham Raise       3×8 @ BW           BW×8   BW×8   BW×8            │
│  5   Pigeon Stretch        2×60s/side                                       │
│  RPE: 7    Bw post: 192.4    Energy: 7    Notes: SLDL felt heavy on s4      │
│                                                                              │
│  MON MAY 11 — Upper Horizontal — Bench + Row                   ✓ Done       │
│  ──────────────────────────────────────────                                  │
│  [collapsed — tap to expand]                                                 │
│                                                                              │
│  TUE MAY 12 — Speed-Strength B — Olympic + Sprints             ✓ Done       │
│  WED MAY 13 — Recovery + Deep Flex + Pull-Up Vol               ✓ Done       │
│  THU MAY 14 — Speed-Strength A — Power Clean + Squat           ✓ Done       │
│                                                                              │
│  FRI MAY 15 — Upper Vertical — Pull-Up + Dips                  ○ Today      │
│  ──────────────────────────────────────────                                  │
│  #   Exercise              Prescribed         S1     S2     S3     S4  Notes │
│  1   Weighted Pull-Up      4×5 @ +15          ___    ___    ___    ___      │
│  2   Weighted Dips         3×8 @ +15          ___    ___    ___             │
│  3   Chest-Supported Row   4×6-8 @ Mod        ___    ___    ___    ___      │
│  4   Landmine Press        3×10 @ Mod         ___    ___    ___             │
│  5   Incline DB Curl       3×8-10 @ Mod       ___    ___    ___             │
│  6   Tricep Pushdown       3×8-10 @ Mod       ___    ___    ___             │
│  RPE: ___   Bw post: ___   Energy: ___   Shoulder pain (1-10): ___          │
│  Session notes: _______________________________________________________     │
│                                                                              │
│  SAT MAY 16 — JUMP LAB — Sprint + Approach + Depth             ○ Tomorrow   │
│  ──────────────────────────────────────────                                  │
│  #   Exercise              Prescribed         S1     S2     S3     S4  Notes │
│  1   Sprints               3×20yd, 2×30yd @ 95%   ___ ___ ___ ___ ___       │
│  2   Approach Jumps        5×2 @ max          ___ ___ ___ ___ ___           │
│  3   Low-Box Depth Jump    2×5 @ 18 in        ___    ___                    │
│  4   Barbell Jump          4×4 @ 30% (110)    ___    ___    ___    ___      │
│  5   Hang Power Clean      4×3 @ 68% (135)    ___    ___    ___    ___      │
│  Best jump height: ___    Dunk attempts: ___    Makes: ___                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Tab 3 — Plan

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ARC: SUMMER 2026 DUNK                          May 3, 2026 → Sep 5     │
│                                                                         │
│  PURPOSE                                                                │
│  Close the explosive strength deficit so a strength-dominant athlete    │
│  can finally express his force as a dunk. Build real upper body         │
│  strength on the side. Drive the side split as a daily protocol.        │
│                                                                         │
│  GOALS                                                                  │
│  G1  Dunk a women's basketball on a regulation 10' rim    test: Wk 18   │
│  G2  Bench 1RM 260 lb AND weighted pull-up +80 lb × 8     test: Wk 18   │
│  G3  Side split distance reduced ≥ 8 cm from baseline     test: Wk 18   │
│                                                                         │
│  BLOCKS                                                                 │
│  ┌────┬──────────────────────────────┬─────────┬─────────────────────┐ │
│  │ #  │ Name                         │ Weeks   │ Bet                 │ │
│  ├────┼──────────────────────────────┼─────────┼─────────────────────┤ │
│  │ B1 │ Power Conversion +           │ W1–W6   │ Close ESD: jump     │ │
│  │    │ Upper Build                  │         │ squats + Olympic +  │ │
│  │    │ ◀ YOU ARE HERE  (Wk 2 of 6)  │         │ reactive intro      │ │
│  │ B2 │ Reactive + Dunk Window       │ W7–W12  │ Depth jumps enter;  │ │
│  │    │                              │         │ dunk attempts Wk 9  │ │
│  │ B3 │ Peak + Realize + Test        │ W13–W18 │ Taper + PAP complex │ │
│  │    │                              │         │ + test (no cut)     │ │
│  └────┴──────────────────────────────┴─────────┴─────────────────────┘ │
│                                                                         │
│  TESTS                                                                  │
│  ┌─────────────────┬─────────────┬──────────────┬─────────────────┐    │
│  │ Metric          │ Baseline    │ Target       │ Test            │    │
│  ├─────────────────┼─────────────┼──────────────┼─────────────────┤    │
│  │ Standing CMJ    │ 28.5"       │ +4 in        │ Wk 18 (Sep 5)   │    │
│  │ Bounce Depth Jp │ TBD         │ Reactive ✓   │ Wk 18           │    │
│  │ Approach Touch  │ Grab rim    │ DUNK         │ Wk 18           │    │
│  │ Back Squat      │ 370 lb      │ ≥ 360 (held) │ Wk 6/12/18      │    │
│  │ Bench Press     │ 230 lb      │ 260 (1RM)    │ Wk 18           │    │
│  │ Weighted Pull-Up│ +25 × 5     │ +80 × 8      │ Wk 18           │    │
│  │ Side Split      │ −22 cm      │ −8 cm (Δ)    │ Weekly          │    │
│  │ Bodyweight      │ 192 lb      │ 183–186 held │ Daily 7-day avg │    │
│  └─────────────────┴─────────────┴──────────────┴─────────────────┘    │
│                                                                         │
│  CONSTRAINTS                                                            │
│  ⚠ R shoulder: no BB OHP, no behind-neck. Landmine / DB neutral only.   │
│  ⚠ L wrist (De Quervain's): no front rack. Hang variants + hook grip.   │
│  ⚠ Heavy squat ≥48h before jump day (VJ §13). Sun stays LIGHT.          │
│  ⚠ Deep split work Wed ONLY (loaded stretch saps adductor 24-48h).      │
│  ⚠ Block 3 = no cut (VJ §9). Maintenance kcal during peak.              │
│  ⚠ Patellar pain ≥3/10 → drop depth jumps that week.                    │
│                                                                         │
│  PROFILE                                                                │
│  6 days/wk · 60–75 min/session (Sat 45) · LA, full gym · 32yo · 192 lb  │
│  Strength-dominant, reactivity-deficient (VJ §3 dx, squat 1.93× BW)     │
│  ~1.5 yr toward dunk goal · prior fall-off risk = 2-3 wks at complexity │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tab 4 — Log

```
┌────────────────────────────────────────────────────────────────────────────┐
│  LOG — every set, all-time         [filter ▾] [sort ▾] [search _______]    │
│                                                                            │
│  Date        Session            Exercise            Set Reps  Load  RPE No │
│  ─────────   ──────────────     ────────────────    ─── ────  ────  ─── ── │
│  Thu 5/14    Speed-Strength A   Power Clean          1   3    140   7      │
│  Thu 5/14    Speed-Strength A   Power Clean          2   3    140   7      │
│  Thu 5/14    Speed-Strength A   Power Clean          3   3    140   7      │
│  Thu 5/14    Speed-Strength A   Power Clean          4   3    140   8      │
│  Thu 5/14    Speed-Strength A   Power Clean          5   3    140   8  grnd│
│  Thu 5/14    Speed-Strength A   Speed Squat          1   2    215   7      │
│  Thu 5/14    Speed-Strength A   Speed Squat          2   2    215   7      │
│  Thu 5/14    Speed-Strength A   Jump Squat           1   4    90    -  fast│
│  Thu 5/14    Speed-Strength A   RDL                  1   5    195   7      │
│  ...                                                                       │
│  Wed 5/13    Recovery + Flex    Weighted Pull-Up     1   8    +5    6      │
│  Wed 5/13    Recovery + Flex    Wtd Side Split Hold  1   60s  10    -      │
│  ...                                                                       │
│  Tue 5/12    Speed-Strength B   Hang Power Snatch    1   3    110   7      │
│  ...                                                                       │
│  Mon 5/11    Upper Horizontal   Bench Press          1   6    170   7      │
│  Mon 5/11    Upper Horizontal   Bench Press          2   6    170   7      │
│  Mon 5/11    Upper Horizontal   Bench Press          3   5    170   8      │
│  Mon 5/11    Upper Horizontal   Bench Press          4   5    170   8      │
│  ...                                                                       │
│  Sun 5/10    Lower (LIGHT)      Back Squat           1   5    280   7      │
│  Sun 5/10    Lower (LIGHT)      Back Squat           2   5    265   7      │
│  Sun 5/10    Lower (LIGHT)      Back Squat           3   5    265   7      │
│  Sun 5/10    Lower (LIGHT)      Stiff-Legged DL      1   5    195   7      │
│  ...                                                                       │
│                                                                            │
│  Append-only. Edits via SMS: "actually s3 of bench was 175 not 170"        │
│  Agent updates the row; original created_at preserved.                     │
└────────────────────────────────────────────────────────────────────────────┘
```

## Tab 5 — Progress

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROGRESS                                                                │
│                                                                          │
│  BODYWEIGHT (7-day rolling avg, target curve overlaid)                   │
│  194 ┤                                                                   │
│  193 ┤●─●                                                                │
│  192 ┤    ●─●  ← actual                                                  │
│  191 ┤         ─ ─ ─ target trajectory                                   │
│  190 ┤              ─ ─ ─                                                │
│  189 ┤                   ─ ─ ─ ─ B1 end target: 188 (Wk 6)               │
│  188 ┤                                                                   │
│      └──────────────────────────────────────                             │
│        Wk1  Wk2  Wk3  Wk4  Wk5  Wk6 …                                    │
│                                                                          │
│  TOP SET — KEY LIFTS (this arc, prescribed-vs-logged shown when both)    │
│  ┌──────────────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Lift             │ Wk 1     │ Wk 2     │ Wk 3     │ Trend    │       │
│  ├──────────────────┼──────────┼──────────┼──────────┼──────────┤       │
│  │ Back Squat (Sun) │ 280 × 5  │ 280 × 5  │   —      │  → hold  │       │
│  │ Bench Press      │ 165 × 6  │ 170 × 6  │   —      │  ↑ +5    │       │
│  │ Power Clean      │ 135 × 3  │ 140 × 3  │   —      │  ↑ +5    │       │
│  │ Hang Snatch      │ 105 × 3  │ 110 × 3  │   —      │  ↑ +5    │       │
│  │ Weighted Pull-Up │ +10 × 5  │ +15 × 5  │   —      │  ↑ +5    │       │
│  │ Barbell Jump     │ 110 × 4  │ 110 × 4  │   —      │  → hold  │       │
│  │ CMJ              │ 28.5"    │ —        │   —      │  baseline│       │
│  └──────────────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                          │
│  PRs (all-time, from Log)                                                │
│  Back Squat        370 × 1     pre-arc baseline                          │
│  Bench Press       230 × 1     pre-arc baseline                          │
│  Power Clean       140 × 3     Thu May 14, 2026  ← arc PR                │
│  Weighted Pull-Up  +15 × 5     Fri May 08, 2026  ← arc PR (vs +10 Wk 1)  │
│  CMJ               28.5"       Sat May 09, 2026  ← arc baseline          │
│                                                                          │
│  WEEKLY VOLUME — Wk 2 (sets per movement category)                       │
│  Press:    ████████████████░░░░ 16        Plyo:     ███████████░░░░ 11   │
│  Pull:     ██████████████░░░░░░ 14        Sprint:   █████████░░░░░░  9   │
│  Squat:    ████████████░░░░░░░░ 12        Mobility: ███████████░░░░ 11   │
│  Hinge:    ██████████░░░░░░░░░░ 10        Olympic:  █████████░░░░░░  9   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Notes on the worked example

- **Prescriptions are real** — pulled from `weeks/2026-training-W02.md` and `blocks/2026-05-block-01-power-conversion.md` verbatim.
- **Logged values are illustrative** — Supabase has no real `exercise_sets` rows for Andy yet (NanoClaw integration TBD per `CLAUDE.md` build-status table). Once integrated, these populate from db.
- **CMJ baseline of 28.5", side split −22 cm baseline** are placeholders pending actual Wk 1 Sat measurement; `arc.md` lists these as "TBD baseline (measure Wk 1)."
- **Coach Note content is illustrative** — written in the voice the Sunday synthesis would use.
- **Volume bars** are rough counts from the Wk 2 prescription, not actual logged volume.
