# Section Extraction Cheatsheet

What to look for in the source material when filling each of the 15 sections of the canonical training-style guide. Use this as a checklist while reading sources in Phase 3.

---

## §1 — When to use this style

Look for:
- Stated goals the methodology is designed to produce ("for athletes who want to dunk", "ideal for hypertrophy phases")
- Athlete tier statements ("intermediate to advanced", "this is not for beginners")
- Equipment requirements
- Session frequency expected
- Hard contraindications: "don't do this if...", "skip this for...", "not recommended when..."
- Time investment ("expect 90 minutes per session, 5 days a week")

Output shape: goal types served + athlete profile + contraindications. Three lists.

---

## §2 — Mechanism (how this style produces results)

Look for:
- The "why this works" explanation — usually appears once per source as a thesis statement
- Physiological / biomechanical mechanisms invoked (force-velocity, MPS, mTOR, lactate threshold, tendon stiffness, etc.)
- Models or frameworks the source references (e.g., F-V curve, ESD, SSC for jump training)
- Any equation or relationship stated formally
- Visual diagrams in the source material

Output shape: lead 1–2 sentences (compressed thesis), then subsections per mechanism *only as many as the agent needs to make programming decisions*. Don't include theory that doesn't change downstream choices.

---

## §3 — Athlete assessment

Look for:
- Specific tests with protocols ("squat 1RM", "vertical jump from a box", "AMRAP at 80%")
- Classification rules ("if squat is X then do Y")
- Athlete archetypes the methodology distinguishes ("strength-dominant", "speed-dominant")
- "What to track each session" lists
- Threshold values (e.g., "1.5× BW squat is the qualifying standard")

Output shape: baseline tests table + classification rules table + in-block monitoring list.

---

## §4 — Session structure

Look for:
- The exercise ordering rule ("plyos first", "compound before isolation", "weakest movement first")
- Rest interval prescriptions
- Session length targets
- Frequency per week
- Component sequence (warm-up → primary → accessory → cooldown — and what each contains)
- "Why this order" reasoning

Output shape: ordering rule with reasoning, numbered session template (1–4 components with set/rep ranges), rest table, duration & frequency.

---

## §5 — Exercise selection

Look for:
- Every exercise named, with the role assigned to it (primary, accessory, etc.)
- Loading guidance ("3–5 sets of 1–6 reps", "RPE 7", "15–30% squat max")
- Substitution patterns ("if Y unavailable, do Z", "low-back issues — front squat instead")
- Disallowed/avoided exercises with reasons
- Exercise discovery rules ("find optimal box height by...", "test rep ranges")

Output shape: primaries table + accessories list + substitution map + disallowed table.

Cross-reference: the master library at `docs/training-styles/exercises.md`. Flag exercises mentioned in sources but missing from the library.

---

## §6 — Periodization

Look for:
- Which periodization model is used (linear, undulating, conjugate, block, hybrid)
- Phase structure across a block (foundation → build → intensify → peak)
- Volume curves per phase
- Intensity curves per phase
- Block length
- Deload position and frequency
- Within-block progression rules ("add weight when all sets clean")
- Between-block progression rules ("swap exercises", "shift emphasis")
- Practical periodization tips ("strength phases longer than speed phases", "rule of 60%", etc.)

Output shape: model + why + phase table + within-block rules + between-block rules + practical rules.

---

## §7 — Sample programs

Look for:
- Concrete sample workouts in the source ("Day 1: A: ankle jumps...")
- Program templates labeled by athlete level (novice / intermediate / advanced)
- Wave loading schemes
- Time-bounded programs ("12-week template", "3-week phase")

Output shape: at minimum one tier (novice). If sources support more, add intermediate and advanced. Keep them in code blocks with the actual sets/reps/loads.

---

## §8 — Technique (OPTIONAL)

Skip this section if the methodology isn't technique-driven (e.g., general hypertrophy, basic conditioning). Keep if technique adds significant performance (Olympic lifting, sprinting, jump training, gymnastics).

Look for:
- Cues for specific lifts or movements
- Common errors enumerated
- Drills for technical components
- "How to" breakdowns of complex movements

Output shape: subsections per technical component with cues + common errors + drills.

---

## §9 — Recovery & nutrition

Look for **style-specific demands only** (universal floors live in `docs/training-styles/concepts/recovery.md`):
- CNS recovery requirements ("48h between high-CNS sessions")
- Tendon recovery ("patellar / Achilles need 48–72h")
- Style-specific nutritional priorities (high protein, glycogen timing, etc.)
- In-season modifications

Don't repeat universal advice (sleep ≥7h, protein 0.8–1g/lb). Reference `concepts/recovery.md` for those.

Output shape: style-specific recovery demands list + nutritional priorities list + in-season modifications (optional).

---

## §10 — Coach's notes

Look for tacit knowledge in sources:
- "I usually find that..." passages
- Off-hand observations from coaching experience
- Edge cases the methodology handles differently
- Modifications by population (older lifters, post-injury, female athletes)
- Position changes over time ("I used to think X, now I think Y")
- Things sources got wrong or are out of date on
- Anecdotes / case studies that illustrate non-obvious principles

This is the most leverage-able section because it's where coaching judgment lives, not just textbook content. If sources are sparse here, the section is short — that's fine; don't fabricate.

Output shape: bullet list of practical tips, edge cases, and modifications.

---

## §11 — Programming decision tree

Look for the actual decision logic an agent (or coach) follows:
- Step 1: How to classify the athlete (inputs → output tier)
- Step 2: How to pick the periodization model (decision rules per tier)
- Step 3: How to populate the session template (which exercises by phase)
- Step 4: How to set volume and intensity (building vs maintenance ranges)
- Step 5: How to define progression (within-block + between-block rules)

Output shape: 5-step runbook with explicit inputs and outputs at each step. Include a Building vs Maintenance volume table.

---

## §12 — Common mistakes

Look for every "don't do X" or "the common error is..." statement:
- "Too much variety", "too much volume", "skipping the strength phase", "grinding plyometrics", etc.
- Failure-mode descriptions ("when athletes plateau, they often...")
- Anti-patterns explicitly called out

Output shape: numbered list. Each item: name + 1–2 sentence explanation of what goes wrong.

This section should be punchy. 8–12 items typically. Don't water it down.

---

## §13 — Style interactions

Look for:
- Day-pairing rules ("no heavy squat before jump day")
- Recovery overlap with other styles
- Calorie / load conflicts
- Equipment / facility conflicts
- Compatible co-styles (named, with brief why)
- Incompatible co-styles (named, with why)

Required if this style will combine with others (which is almost always). If sources don't address it directly, infer from the recovery demands and known training principles.

Output shape: 5 categorized lists (day-pairing, recovery overlap, calorie/load, equipment, compatible/incompatible).

---

## §14 — Sources

For each source the user provided:
- Title (book / video / podcast / article)
- Author / channel / host
- Year if available
- Source URL or location
- One-line description of what it covers
- Which sections it informed (§2, §3, etc.)

Output shape: bulleted list. If two sources disagree on something, add a brief paragraph noting which takes precedence and why (e.g., "When VJB and THP disagree, VJB takes precedence for assessment").

---

## §15 — Resources in this folder

Filled in Phase 4 after writing all files. Inventory table:

| File | Purpose | When to consult |
|---|---|---|
| `guide.md` | This file | Start here |
| `exercise-selection.md` | Filtered exercise catalog | When picking lifts |
| `diagrams/<file>` | (per diagram) | (when needed) |
| `sources/<file>` | (per source) | (when guide is ambiguous) |

Every file in the folder gets a row.
