You are synthesizing a coach's training-style guide from per-video extractions. The output is markdown that will be committed to `docs/content/training-styles/{coach_slug}/guide.md` and consumed by an AI planning agent (the head coach) to design programs in this style.

# Source

Coach: {coach_slug}
Number of videos ingested: {n_videos}
Date of synthesis: {date}

# All extractions

Each block below is one video's structured extraction (schema v1). The `video_id` is in each block — use it for citations.

{extractions_block}

# Output

Produce a single markdown document with this structure (REQUIRED sections — drop any you have insufficient evidence for, but keep the section headers as `## N. Title — (insufficient evidence)`):

```markdown
# {coach_slug} — Training Style Guide

> Auto-drafted from {n_videos} YouTube videos on {date}. Reviewer should
> spot-check citations before this lands in the curated library.

*One sentence: what this style optimizes for.*

---

## 1. When to use this style

**Goal types this serves:**
- ...

**Athlete profile fit:**
- Training age: novice | intermediate | advanced | any
- Equipment minimum: ...
- Time required: ...
- Compatible co-styles: ...

**Contraindications:**
- ...

---

## 2. Mechanism — how this style produces results

**Lead** (1–2 sentences): The compressed thesis.

### {{Concept the coach emphasizes}}
...

---

## 3. Athlete assessment

What tests / signals does this coach use to classify athletes or decide programming?

---

## 4. Session structure

**Ordering rule:** ...

**Session template:**
1. **{{Component}}** — ...
2. ...

**Typical duration:** ...
**Frequency:** ...

---

## 5. Programming principles

Cross-cycle rules: how the coach structures mesocycles, weeks, and recovery.

---

## 6. Sample sessions

Concrete sessions the coach has described (cite each).
```

# Critical rules

1. **Every claim must be cited inline using `[^vid-{{video_id}}]` markers.** The marker goes immediately after the claim. Example:
   `Exercise selection varies by mesocycle [^vid-XpN5dGyHKqY].`

   Multiple supporting videos: `[^vid-XpN5dGyHKqY][^vid-mzzmZAWxOn4]`.

2. **No claim without a citation.** If you can't find a video that supports a claim, omit the claim entirely. Don't invent claims to fill out the template.

3. **Cite the strongest source.** If multiple videos make a similar claim, prefer the most explicit one. If they contradict, prefer the most recent (`upload_date` field on each video) and surface the contradiction with both citations.

4. **Use the coach's vocabulary.** Don't translate to generic terms ("snatch high pull" stays "snatch high pull", not "first pull variation"). The extractions preserve the coach's terminology — match it.

5. **Be concrete.** Prefer specific examples ("Monday: snatch + pull + squat") over abstractions ("balance the week"). Sample sessions are gold — quote them faithfully.

6. **Sections with insufficient evidence:** keep the section header but write `*(insufficient evidence in current ingestion — re-run after fetching more videos)*` instead of fabricating.

7. **Length:** match content to evidence. 600-1500 words is typical. Don't pad. A short guide based on real evidence is more valuable than a long one filled with hedging.

# Output

Respond with **only** the markdown document — no preamble, no fences. The first character of your response should be `#`.
