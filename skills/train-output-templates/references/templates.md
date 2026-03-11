# Train Chat Output Templates

Use these templates for formatting chat responses from CLI JSON.

## 1) Plan Today Template

### Concise
```text
Today ({day_label}):
1) {exercise_1}
2) {exercise_2}
3) {exercise_3}
```

### Detailed
```text
Today ({day_label}) from {plan_file}:
1) {exercise}: {sets}x{reps} @ {target_load}
2) {exercise}: {sets}x{reps} @ {target_load}
Notes: {optional_notes}
```

## 2) Log Confirmation Template

### Decision Order

1. Milestone achieved -> use `Milestone Celebration`.
2. No milestone, but PR(s) detected -> use `PR Celebration`.
3. No milestone and no PR -> use `Standard Log`.

### Milestone Celebration (Concise)
```text
You just hit {milestone_label}. {journey_context}
{primary_pr_optional}
Card: {milestone_card_ref}
That's worth sharing 👊
Logged {exercise_count} exercise(s), {set_count} set(s).
```

### Milestone Celebration (Detailed)
```text
You just hit {milestone_label}. {journey_context}
{primary_pr_optional}
Card: {milestone_card_ref}
That's worth sharing 👊

Logged session ({session_date}):
- {exercise}: {set_line_1}; {set_line_2}; {set_line_3}
- {exercise}: {set_line_1}; {set_line_2}
Total volume: {volume_summary}
```

### PR Celebration (Single PR, Concise)
```text
NEW PR. {pr_headline}
Previous best: {previous_best_summary} (+{delta_summary})
Card: {pr_card_ref}
That's worth sharing 👊
Logged {exercise_count} exercise(s), {set_count} set(s).
```

### PR Celebration (Multiple PRs, Concise)
```text
NEW PR. {primary_pr_headline}
Also today: {secondary_pr_1}; {secondary_pr_2}
Card: {pr_card_ref}
That's worth sharing 👊
Logged {exercise_count} exercise(s), {set_count} set(s).
```

### Standard Log (Concise)
```text
Logged {exercise_count} exercise(s), {set_count} set(s).
Top entries:
- {exercise_a}: {summary}
- {exercise_b}: {summary}
```

### Standard Log (Detailed)
```text
Logged session ({session_date}):
- {exercise}: {set_line_1}; {set_line_2}; {set_line_3}
- {exercise}: {set_line_1}; {set_line_2}
Total volume: {volume_summary}
```

## 3) History Template

### Concise
```text
Last {window}:
{date_1}: {exercise_a} {summary}, {exercise_b} {summary}
{date_2}: {exercise_a} {summary}
```

### Detailed
```text
History ({window}):
{date_1}
- {exercise}: set1 {details}, set2 {details}
- {exercise}: set1 {details}
{date_2}
- {exercise}: set1 {details}
```

## 4) Progression Template

### Concise
```text
{exercise} trend:
{point_1} -> {point_2} -> {point_3}
Direction: {up|flat|down}
```

### Detailed
```text
{exercise} progression ({window}):
- Top set range: {min} to {max}
- Recent points: {point_1}, {point_2}, {point_3}, {point_4}
- Change: {abs_change} ({pct_change})
```

## Formatting Notes

- Use one decimal place for kg when needed.
- Keep dates in `YYYY-MM-DD`.
- Use consistent exercise naming from stored data.
- Do not include implementation/tool-call details in user-facing output.
- Lead with achievement language for milestone/PR events.
- Keep share nudges casual and human ("That's worth sharing 👊").
- Do not fabricate card refs; include them only when provided.
- If both milestone and PR exist, lead milestone first and still mention the top PR briefly.
- Never include "no PR today" style copy.

## Celebration Examples

### 1) Weight PR
```text
NEW PR. Back Squat 140 kg x 5.
Previous best: 137.5 kg x 5 (+2.5 kg)
Card: card://pr/back-squat/2026-03-11
That's worth sharing 👊
Logged 3 exercise(s), 12 set(s).
```

### 2) e1RM PR
```text
NEW PR. Deadlift e1RM 191.7 kg from 170 kg x 4.
Previous best: e1RM 188.0 kg (+3.7 kg)
Card: card://pr/deadlift/2026-03-11
That's worth sharing 👊
Logged 2 exercise(s), 8 set(s).
```

### 3) Milestone Hit
```text
You just hit 3 plates on back squat. Up from 120 kg over 14 weeks.
Top PR today: 140 kg x 5.
Card: card://milestone/back-squat/3-plates
That's worth sharing 👊
Logged 4 exercise(s), 15 set(s).
```

### 4) Normal Session (No PR)
```text
Logged 4 exercise(s), 14 set(s).
Top entries:
- Back Squat: 3x5 @ 132.5 kg
- Pause Bench: 4x4 @ 92.5 kg
```
