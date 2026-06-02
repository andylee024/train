You are extracting structured training-methodology data from a transcript of a coach's YouTube video. The output will be combined with extractions from many other videos to build a curated style guide for an AI athletic planner.

# Source

Coach: {coach_slug}
Video: {video_title}
Video ID: {video_id}
Duration: {duration_seconds} seconds
Transcript ({char_count} chars):

```
{transcript_text}
```

# Your task

Read the transcript carefully. Produce a JSON object that matches the schema below. Every field is described by what it should contain — be specific and concise.

## Schema (version 1)

```json
{
  "schema_version": 1,
  "video": {
    "video_id": "{video_id}",
    "title": "{video_title}"
  },
  "philosophy": [
    {
      "claim": "<one-sentence claim about training principles, beliefs, or athlete management>",
      "citation": { "ts": <seconds, integer>, "quote": "<verbatim substring of transcript supporting the claim>" }
    }
  ],
  "exercises": [
    {
      "name": "<exercise name as the coach uses it>",
      "category": "<one of: snatch | clean | jerk | squat | pull | press | accessory | mobility | primer | other>",
      "loading_note": "<typical loading, sets/reps, or null if unspecified>",
      "citation": { "ts": <seconds, integer>, "quote": "<verbatim substring>" }
    }
  ],
  "programming_rules": [
    {
      "rule": "<concrete rule about program structure>",
      "scope": "<one of: macrocycle | mesocycle | week | session | exercise>",
      "citation": { "ts": <seconds, integer>, "quote": "<verbatim substring>" }
    }
  ],
  "sample_sessions": [
    {
      "context": "<when this session is used, e.g. 'Monday early in a mesocycle'>",
      "exercises": ["<exercise>", "<exercise>"],
      "citation": { "ts": <seconds, integer>, "quote": "<verbatim substring>" }
    }
  ]
}
```

# Critical rules

1. **Every `citation.quote` MUST be a verbatim substring of the transcript text.** Copy it exactly — no paraphrasing, no edits. If a claim can't be supported by a verbatim quote, omit the claim. Aim for quotes 15-60 words long.
2. **`citation.ts` is the approximate timestamp in seconds.** Estimate based on position in transcript (transcript is roughly linear with video duration). Round to integer.
3. **Categories are constrained enums.** Use exactly one of the listed values. If an exercise doesn't fit cleanly, use "other".
4. **Philosophy ≠ programming rules.** Philosophy is *why / what we believe* ("strength should be built before peaking"). Programming rules are *how to structure work* ("squats precede pulls on the same day").
5. **Skip empty content.** If the transcript has no programming rules (e.g. a pure motivational video), emit `"programming_rules": []`. Don't invent.
6. **Skip noise.** If the transcript is < 500 chars/minute density (likely meet footage or low-quality auto-captions), emit empty arrays for all four categories — there's nothing extract-worthy.
7. **No hallucination.** If the coach doesn't explicitly say something, don't infer it. The downstream synthesis stage will combine extractions; it does not need every video to fill every field.

# Output

Respond with **only** the JSON object — no preamble, no markdown fences, no explanation. The first character of your response should be `{`.
