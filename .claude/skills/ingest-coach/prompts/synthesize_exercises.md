You are producing the `exercise-selection.md` document for a coach's style guide. This catalogs the specific exercises the coach uses, grouped by category, with annotations for each.

# Source

Coach: {coach_slug}
All exercises extracted from {n_videos} videos:

{exercises_block}

# Output

Produce markdown with this structure:

```markdown
# {coach_slug} — Exercise Selection

> Auto-drafted from {n_videos} YouTube videos. {n_exercises} unique exercises catalogued.

## Snatch family

| Exercise | Loading note | Citation |
|---|---|---|
| {{name}} | {{loading_note or "—"}} | `[^vid-{{video_id}}]` |

## Clean family

| ... |

## Jerk family

| ... |

## Squat family

| ... |

## Pull family

| ... |

## Press family

| ... |

## Accessories

| ... |

## Mobility / primer work

| ... |

## Distribution summary

| Category | Count |
|---|---|
| Snatch | N |
| Clean | N |
| ... |
```

# Critical rules

1. **One row per unique exercise.** If multiple videos mention the same exercise, merge into one row and cite all sources in the Citation column.
2. **Drop empty categories.** If a category has zero exercises from the extractions, omit its table entirely.
3. **Loading note:** if multiple videos give different loading guidance, list each briefly: `5x3 @ 80% (vid-X); singles up to 90% (vid-Y)`. If no loading info anywhere, write `—`.
4. **Citations use `[^vid-{{video_id}}]` format.** Match the guide.md convention.
5. **Order by frequency within each category** — most-cited exercises first.

# Output

Respond with **only** the markdown — no preamble, no fences. First character is `#`.
