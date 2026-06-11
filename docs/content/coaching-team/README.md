# Team

The AI coaching team. Each role is `domain expertise + objective function + access to the athlete's data`. Roles coordinate through the head coach.

## Structure

```
team/
├── README.md                # This file — explains the team architecture
│
├── head-coach/              # Orchestrator role
│                            #   Synthesizes specialist programming into one
│                            #   coherent plan. Owns arc + block structure.
│                            #   Decides what gets auto-resolved vs escalated.
│
├── specialists/             # Domain experts (one folder per recruited specialist)
│                            #   Strength, Sport, Olympic, Injury/Mobility, Nutrition.
│                            #   Each negotiates with the head coach. Composable —
│                            #   the athlete's goals determine the team.
│
└── operator/                # Chief of staff
                             #   Doesn't plan — reduces friction between plan and
                             #   execution. Handles scheduling, grocery lists, meal
                             #   ordering, appointments, calendar coordination.
```

User-invocable Claude Code skills (e.g., `/training-plan`, `/create-training-style`) live at the repo root under `.claude/skills/`, not here. This folder is for the *role definitions* the agents embody when they run.

## How team relates to training-styles

`team/` is the **agents**. `training-styles/` is what they read.

- A specialist's role definition lives here. The methodology that specialist applies (e.g., vertical-jump training principles) lives in `training-styles/<style>/`.
- The head coach reads multiple style guides + the athlete profile + active plan to synthesize a block.
- The operator reads the athlete's calendar + plan + nutrition prescription to handle logistics.

If two specialists end up writing the same domain knowledge in two role definitions, that knowledge belongs in `training-styles/`, not in either role.

## Adding a new role

The role folders here (`head-coach/`, `specialists/`, `operator/`) are placeholders today — they will be filled in as the multi-agent architecture is built out (M1 → M2 in the roadmap).

When adding a role:

1. Create the role folder (`team/specialists/<name>/` or similar).
2. Write the role's `README.md`: identity, objective function, what knowledge it reads, what it produces.
3. Reference any methodology it uses from `training-styles/<style>/` — don't duplicate.
4. If the role ships as a user-invocable Claude Code skill, add it under `.claude/skills/<name>/` at the repo root.
