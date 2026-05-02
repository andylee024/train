# {{Style Name}} — Training Style Guide

> **Purpose of this guide.** This document is intended to help coaches — human or AI — design programs using this training style. It should contain all relevant information about the methodology, including text, graphics, and diagrams, so a coach reading it can design programs as effectively as possible. Use whatever formats serve clarity: tables, code blocks, embedded diagrams (`![](diagrams/name.svg)`), worked examples, even hand-drawn images. The bar is "another coach can pick this up and run a program from it."

> **Template instructions** (delete this block in your copy):
> 1. Copy this file to `training-styles/<style-slug>/guide.md`.
> 2. Replace every `{{placeholder}}` with real content.
> 3. Each section has a `> Prompt:` line. Delete it after filling in.
> 4. Sections marked OPTIONAL apply only to certain style types — delete them if they don't fit.
> 5. Sections marked REQUIRED must always be present, even if brief.
> 6. When a section says "common slot lives in …," you're filling in the style-specific instantiation of that shared framework.

---

*One sentence: what this style optimizes for.* (REQUIRED)

> Example: "A power and reactivity-focused style for athletes pursuing maximal vertical jump height."

---

## 1. When to use this style (REQUIRED)

> Prompt: how does the head coach decide whether to recruit this style for an athlete?
> Common slot: `concepts/assessment.md` defines the axes (training age, equipment, time, co-styles, injury). This section instantiates them for this style.

**Goal types this serves:**
- {{e.g., "vertical jump height," "post-ACL return-to-sport," "marathon time PR"}}

**Athlete profile fit:**
- Training age: {{novice | intermediate | advanced | any}}
- Equipment minimum: {{rack + barbell + box + ...}}
- Time required: {{N sessions/week × M minutes}}
- Compatible co-styles: {{e.g., "general strength," "mobility"}}

**Contraindications (do NOT recruit this style if):**
- {{e.g., "active patellar tendinopathy → no high-volume jumps"}}
- {{e.g., "post-surgical phase < 12 weeks"}}

---

## 2. Mechanism — how this style produces results (REQUIRED)

> Prompt: what does the agent need to understand to make good programming decisions in this style?
> Form and depth: scaled to what the methodology actually requires. Some styles need one paragraph (rules are self-evident from the goal). Others need 3+ subsections to cover interlocking mechanisms the agent must reason about (e.g., vertical-jump needs force-velocity + explosive strength deficit + stretch-shortening cycle).
>
> This is not a textbook chapter. It's the operational logic the rules below are derived from. If you can write the rules in §6–§8 without referring back to anything here, you're padding this section.

**Lead** (1–2 sentences, always): {{The compressed thesis — the adaptation being driven and the mechanism that produces it.}}

### {{Mechanism / model / concept 1}}  *(add subsections only if the agent needs each one to reason about edge cases)*
{{Explanation. Use diagrams in `diagrams/` where they help. Reference with `![{{title}}](diagrams/{{file}}.svg)`.}}

### {{Mechanism / model / concept 2}}
{{...}}

### {{Mechanism / model / concept 3}}
{{...}}

---

## 3. Athlete assessment (REQUIRED)

> Prompt: which specific tests does this style use to classify the athlete and identify gaps?
> Common slot: `concepts/assessment.md`.

**Baseline tests** (run at the start of every block in this style):

| Test | Protocol | What it measures |
|---|---|---|
| {{Test name}} | {{1–2 sentence protocol}} | {{Which axis or quality}} |

**Classification rules:**

| Test result | Tier | Programming implication |
|---|---|---|
| {{Range}} | {{Beginner / Intermediate / Advanced / Elite}} | {{What this means for programming}} |

**In-block monitoring** (what to capture each session):
- {{e.g., "top set load," "best plyo height," "RPE on key lift"}}

---

## 4. Session structure (REQUIRED)

> Prompt: what's the template for one session in this style?
> Common slot: `concepts/session-design.md` defines universal principles (CNS demand first, fatigue stacking rules, deload conventions).

**Ordering rule (and why):**
{{e.g., "Fastest movements first while neurally fresh — heavy compound work creates fatigue that degrades plyometric quality."}}

**Session template:**

1. **{{Component A}}** — {{exercise pool, set×rep range, intent, rest}}
2. **{{Component B}}** — {{...}}
3. **{{Component C}}** — {{...}}
4. **{{Component D}}** — {{...}}

**Typical duration:** {{minutes}}
**Frequency:** {{sessions/week, recovery between}}

---

## 5. Exercise selection (REQUIRED)

> Prompt: which exercises this style uses, why, and what to do when something is unavailable or contraindicated.
> Common slot: master library at `training-styles/exercises.md`. This section filters and annotates that library for this style.

**Primary lifts:**

| Exercise | Purpose in this style | Programming notes |
|---|---|---|
| {{Exercise}} | {{Why it's primary here}} | {{Set/rep/intensity ranges}} |

**Allowed accessories:**
- {{Exercise — what it supports}}

**Substitution map:**

| If unavailable or contraindicated | Substitute | Reason |
|---|---|---|
| {{Original}} | {{Sub}} | {{Why this swap preserves the adaptation}} |

**Disallowed in this style (with reason):**
- {{Exercise — why excluded for this style}}

---

## 6. Periodization (REQUIRED)

> Prompt: how do blocks in this style progress?
> Common slot: `concepts/periodization.md` defines the model vocabulary (linear, undulating, conjugate, block).

**Model used:** {{linear | undulating | conjugate | block | hybrid}}
**Why this model fits this style:** {{1–2 sentences}}

**Block structure:**

| Phase | Duration | Emphasis | {{Quality 1}} | {{Quality 2}} | {{Quality 3}} |
|---|---|---|---|---|---|
| I {{Phase name}} | {{weeks}} | {{focus}} | HIGH | LOW | LOW |
| II {{...}} | | | | | |
| III {{...}} | | | | | |
| IV {{Realize / Test}} | {{1–2 wks}} | {{taper}} | LOW | LOW | LOW |

**Within-block progression rules:**
- When to bump load/intensity: {{criterion}}
- When to hold: {{criterion}}
- When to back off / deload: {{criterion}}

**Between-block progression rules:**
- {{Shift emphasis, swap exercises, change loading scheme, etc.}}

---

## 7. Sample programs (REQUIRED — at least one tier)

> Prompt: worked examples that an agent can use as a starting template, then modify for the athlete.
> Form: code blocks showing actual sets/reps/loads.

### Novice template
> For athletes at {{tier-defining criterion}}.

```
{{Day 1: ...}}
{{Day 2: ...}}
{{...}}
```

### Intermediate template
> For athletes at {{tier-defining criterion}}.

```
{{...}}
```

### Advanced template (OPTIONAL)
```
{{...}}
```

---

## 8. Technique (OPTIONAL)

> Prompt: style-specific execution mechanics that materially affect outcomes.
> Skip if: this style isn't technique-driven (e.g., general hypertrophy, basic conditioning). Keep if: technique adds significant performance (Olympic lifting, sprinting, jump training, gymnastics).

### {{Technical component 1}}
- **Cues:** {{...}}
- **Common errors:** {{...}}
- **Drills:** {{...}}

### {{Technical component 2}}
{{...}}

---

## 9. Recovery & nutrition (REQUIRED)

> Prompt: what does this style demand on top of universal recovery?
> Common slot: `concepts/recovery.md` defines universal floors (sleep, protein, hydration). This section adds style-specific demands.

**Style-specific recovery demands:**
- {{e.g., "≥48h between high-CNS sessions"}}
- {{e.g., "glycogen replenishment within 60 min post-session"}}

**Nutritional priorities for this style:**
- {{e.g., "protein at upper end of range during deficit blocks"}}
- {{e.g., "carb timing around technique sessions"}}

**In-season modifications (OPTIONAL):**
- {{Volume cut, frequency cut, focus shift while sport-in-season}}

---

## 10. Coach's notes (REQUIRED)

> Prompt: useful information not captured by the sections above that will help another coach (or planning agent) design a program in this style. Tacit knowledge, practical tips, conditional rules, edge cases, lessons from your own coaching that don't fit a slot above.
> Form: free-form. Bullets, short paragraphs, anecdotes, mini case studies — whatever serves the next coach. Diagrams and images are encouraged.
> If genuinely nothing to add: state that explicitly so the next coach knows the canonical sections fully cover this style.

- {{Practical tip experienced coaches in this style know but isn't in the sources}}
- {{Edge case: how to handle athletes who don't fit the standard tiers}}
- {{Modifications you've made for specific populations (older lifters, female athletes, post-injury, etc.)}}
- {{Anecdote / mini case study illustrating a non-obvious principle}}
- {{Things the sources got wrong or are out of date on, and what you do instead}}

---

## 11. Programming decision tree (REQUIRED)

> Prompt: the runbook a planning agent follows to design a block in this style. Step by step, decision by decision.
> Common slot: `concepts/decision-framework.md` defines the universal step shape (classify → pick model → build session → set V/I → progression). This section fills in each step's specifics.

### Step 1 — Classify the athlete
- Inputs: {{which fields from athlete profile + assessment results}}
- Decision: {{tier label or branch}}

### Step 2 — Pick the periodization model variant
- Decision rule: {{e.g., "Beginner → linear concurrent; intermediate+ → conjugate sequence"}}

### Step 3 — Build the session template
- {{How to populate the §5 session structure with specific exercises from §6}}

### Step 4 — Set volume and intensity

| Component | Building volume | Maintenance volume |
|---|---|---|
| {{Component}} | {{sets × reps × frequency}} | {{sets × reps × frequency}} |

### Step 5 — Define progression
- Within-block: {{rules — see §7}}
- Between-block: {{rules — see §7}}

---

## 12. Common mistakes (REQUIRED)

> Prompt: anti-patterns to reject. Failure modes you've seen. This section is the highest-leverage part of the guide — encoding mistakes turns the agent from a textbook into a coach.

1. **{{Mistake name}}** — {{What it looks like, why it fails, what to do instead.}}
2. **{{Mistake name}}** — {{...}}
3. **{{...}}**

---

## 13. Style interactions (REQUIRED if combined with other styles)

> Prompt: how does this style coexist with other styles in a multi-style program?
> Common slot: `concepts/style-interactions.md` defines the interaction taxonomy (day-pairing, recovery overlap, calorie conflict, equipment conflict).

**Day-pairing rules:**
- {{e.g., "Heavy squat day must precede jump day by ≥48h"}}

**Recovery overlap:**
- {{e.g., "Shares CNS budget with sprinting — limit to one of these per day"}}

**Calorie / load conflicts:**
- {{e.g., "Adds ~200 kcal training-day demand on top of base"}}

**Equipment / facility conflicts:**
- {{e.g., "Needs platform + open space — schedule around team's gym slot"}}

**Compatible co-styles:** {{named styles + brief why}}
**Incompatible co-styles:** {{named styles + brief why}}

---

## 14. Sources (REQUIRED)

> Prompt: lineage and citations. Helps the agent calibrate confidence and resolve disagreements between sources.

- **{{Source title}}** — {{Author, year}}. {{One-line description of what it covers.}} ({{which sections of this guide it informs}})
- **{{Source title}}** — {{...}}

---

## 15. Resources in this folder (REQUIRED)

> Prompt: inventory every file in this style's folder with a one-line "when to consult."

| File | Purpose | When to consult |
|---|---|---|
| `guide.md` | This file | Start here |
| `exercise-selection.md` | This style's filtered exercise catalog | When picking lifts for a session |
| `diagrams/{{name}}.svg` | {{What it shows}} | {{When the agent needs visual reference}} |
| `sources/{{name}}.pdf` | {{Source title}} | {{When the guide is ambiguous; treat as authoritative for principles}} |
