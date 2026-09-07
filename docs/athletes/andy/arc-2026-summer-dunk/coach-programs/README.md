# Coach programs (DNT) — raw source PDFs

The Olympic-lifting coach (DNT Weightlifting Club) issues a new 3-day program roughly every 2 weeks. This folder holds the **raw program PDFs** as received, so every agent using this repo can read the coach's original prescription (not just the re-homed version in the week files).

**Filename convention:** `dnt-wk<NN-NN>_arc-W<NN>-W<NN>.pdf` — coach's DNT week numbers + the arc weeks they map onto. Since the 2026-07-28 DNT renumber, **arc week = DNT week** (see `../training/arc.md`).

| File | DNT weeks | Arc weeks | Dates | Status |
|------|-----------|-----------|-------|--------|
| `dnt-wk11-12_arc-W11-W12.pdf` | wk11–12 | W11–W12 | Jul 26 – Aug 8 | ✅ integrated |
| `dnt-wk13-14_arc-W13-W14.pdf` | wk13–14 *(wk13 = deload)* | W13–W14 | Aug 9 – Aug 22 | ✅ integrated |
| `dnt-wk15-16_arc-W15-W16.pdf` | wk15–16 | W15–W16 | Aug 23 – Sep 5 | ✅ integrated (taper/test retired; coach block run through) |

Earlier program from arc start lives at `../styles/dnt-program-2026-05-17.pdf` (pre-v9).

## How these get used

- **Integration:** the `integrate-dnt-workout` skill re-homes each drop's Olympic lifts onto the fixed v9 Oly days (Tue/Thu/Fri/Sat) by movement pattern (~2/day). See `../training/arc.md` "DNT Integration Model (v9)".
- **DNT overview:** the `dnt-overview` skill outputs a day's coach Oly lifts in the athlete's format.
- The re-homed, day-by-day result is authoritative in `../training/weeks/2026-training-W<NN>.md`.

## Adding the next drop

When a new `*program*.pdf` lands (in `~/Downloads` or `~/Desktop`):
1. Copy it here as `dnt-wk<NN-NN>_arc-W<NN>-W<NN>.pdf`.
2. Add a row to the table above.
3. Run `integrate-dnt-workout` to fold it into the week files.
