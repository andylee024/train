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

### Concise
```text
Logged {exercise_count} exercise(s), {set_count} set(s).
Top entries:
- {exercise_a}: {summary}
- {exercise_b}: {summary}
```

### Detailed
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
