# {{Style Name}} — Exercise Selection

> **Template instructions** (delete in your copy):
> 1. Replace `{{Style Name}}` and the count below with real values.
> 2. Filter the master library at `training-styles/exercises.md` for exercises that belong in this style.
> 3. Annotate each exercise with style-specific notes (typical loading, why included, when to use).
> 4. Group by training quality first, then by muscle group within. Keep the schema consistent with the master library.
> 5. If this style needs a column the master library doesn't have (e.g., "ground contact time" for plyometrics), add it.
> 6. End with a "Distribution Summary" so the agent can sanity-check the catalog at a glance.

> **{{N}} exercises** filtered for {{style name}}.
> Source: `training-styles/exercises.md` + style-specific annotations.

## Schema

Each exercise has:

- **training_quality** — position on force-velocity curve: `max_strength`, `strength_speed`, `speed_strength`, `reactive`, `skill`
- **muscle_group** — primary target: `quads`, `hamstrings`, `glutes`, `calves`, `hips`, `chest`, `back`, `shoulders`, `arms`, `core`, `full_body`
- **movement_pattern** — `squat`, `hinge`, `lunge`, `push`, `pull`, `olympic`, `plyometric`, `mobility`
- **intensity_tier** — CNS / joint demand: `low`, `medium`, `high`, `max`
- **bilateral** — true/false
- **equipment** — array of required items
- **notes** — *style-specific:* {{e.g., "use 30% 1RM for jump squats," "swap for floor press if shoulder pain >3"}}

---

## {{Training Quality 1}} ({{count}} exercises)

### {{Muscle Group A}}

| Exercise | Movement | Intensity | Bilateral | Style notes |
|---|---|---|---|---|
| {{Exercise}} | {{pattern}} | {{tier}} | {{✓/✗}} | {{Why included, typical loading, conditional rules}} |

### {{Muscle Group B}}

| Exercise | Movement | Intensity | Bilateral | Style notes |
|---|---|---|---|---|
| {{Exercise}} | {{pattern}} | {{tier}} | {{✓/✗}} | {{...}} |

---

## {{Training Quality 2}} ({{count}} exercises)

{{...repeat by muscle group...}}

---

## Substitution map

| If unavailable / contraindicated | Substitute | Reason |
|---|---|---|
| {{Original}} | {{Sub}} | {{Why this preserves the adaptation}} |

---

## Disallowed in this style

| Exercise | Reason for exclusion |
|---|---|
| {{Exercise}} | {{Why this style doesn't use it — biomechanical mismatch, injury risk, redundancy with primary lifts, etc.}} |

---

## Distribution summary

| Training Quality | Count |
|---|---|
| {{quality}} | {{N}} |

| Muscle Group | Count |
|---|---|
| {{group}} | {{N}} |

| Intensity Tier | Count |
|---|---|
| {{tier}} | {{N}} |
