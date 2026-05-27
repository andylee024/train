# PLAN · Onboarding Flow (design)

**Status:** superseded — shipped state lives in [`plan-creation-shipped.md`](plan-creation-shipped.md); product-level scope in [`PRD.md`](../../PRD.md). This doc kept as design exploration history.
**Owner:** Andy
**Updated:** 2026-05-25
**Module:** PLAN
**See also:** [`plan-shopping.md`](plan-shopping.md) (the middle of this flow)

The full user journey for creating a new arc, from the moment the athlete decides they need a new plan to the moment SMS execution begins. Shopping is one step within this; the entry and exit moments are described here.

---

## The full journey — 5 moments

```
   ENTRY        →   SHOPPING        →   SYNTHESIS    →   PREVIEW       →   ACTIVATE
   ─────             ────────             ────────           ───────             ────────
   between-arc       narrative +          AI generates       xlsx                live plan,
   prompt on         style cart                              interactive         SMS starts,
   /plan                                                     table               dashboard
                                                                                 updates
   
   DEFAULT:          SEE                  SEPARATE            EXISTING            DEFAULT:
   skip welcome      plan-shopping.md     spec                xlsx format         confirm + 
                                                              (athlete-           next-action
                                                              facing view)        card
```

## 1. Entry — steady-state (between arcs)

Only design target for V1. When the current arc completes, `/plan` shows a prompt at the top:

```
   ┌────────────────────────────────────────────────────────────┐
   │                                                            │
   │   Your last arc (2026 Summer Dunk) completed Sep 5.        │
   │   18 weeks · achieved 2 of 3 goals · 84 sessions logged    │
   │                                                            │
   │   Ready to design your next arc?                           │
   │                                                            │
   │                                          [ Start New Arc ] │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
   
   Past arcs ▾  (collapsed list)
```

Click "Start New Arc" → no welcome card, direct landing on shopping surface.

**Out of scope for V1:**
- First-time arrival (no arc has ever existed) — assumes Andy bootstraps manually
- Mid-arc "start a new arc" (warning + abandon current) — rare; defer
- Mid-arc "edit this plan" — different surface; defer

## 2. Shopping — designed in [`plan-shopping.md`](plan-shopping.md)

User arrives directly. Narrative + style cart + Generate button. Detailed spec.

## 3. Synthesis — AI builds the plan

After Generate clicked:

```
   ┌────────────────────────────────────────────────────────────┐
   │                                                            │
   │   Composing your plan...                                   │
   │                                                            │
   │   ╭─ Reading your narrative ────────╮  ✓                   │
   │   ╭─ Loading 3 style guides ────────╮  ✓                   │
   │   ╭─ Designing arc structure ───────╮  ✓                   │
   │   ╭─ Block 1 — Hypertrophy ────────╮  ✓                   │
   │   ╭─ Block 2 — Strength ───────────╮  ⟳ in progress       │
   │   ╭─ Block 3 — Peak ───────────────╮  …                   │
   │                                                            │
   │   ~45 seconds                                              │
   │                                                            │
   └────────────────────────────────────────────────────────────┘
```

Step-by-step progress (not a generic spinner). User sees what the AI is doing. Synthesis takes 30–60 seconds depending on complexity. If it fails partway, the user sees which step failed and can retry without losing inputs.

## 4. Preview — the xlsx as interactive table

Existing athlete-facing xlsx format renders as an interactive grid on screen. Athlete can:

- Click any cell → see "why this exercise here" (style source + rationale tooltip)
- Edit any cell → adjust the plan inline (AI re-synthesizes affected portions)
- Toggle between views: week-by-week table, block-summary, calendar
- Download .xlsx button (always present)
- "Regenerate" if they want a totally different attempt

This spec isn't deep on preview UX — the xlsx format itself is well-defined (existing `outputs/*.xlsx`). The on-screen renderer is a separate concern.

```
   [ ← back to shopping ]                          [ Download xlsx ] [ Activate ]
```

## 5. Activate — confirm + next-action card

Click "Activate" → the plan becomes the active arc. Behind the scenes:

- xlsx persisted to `athletes/{name}/{new-arc-slug}/outputs/`
- `arc.md`, `blocks/`, `weeks/` generated
- Nutrition cascade triggered
- SMS subscription activated
- Dashboard data starts flowing
- Old arc (if any) archived

What the user sees:

```
   ┌──────────────────────────────────────────────────────────────┐
   │                                                              │
   │   ✓ Your plan is live.                                       │
   │                                                              │
   │   2026 Fall Olympic Cycle · 16 weeks · 5 days/week           │
   │   Starting Mon, Sep 8                                        │
   │                                                              │
   │   Tomorrow at 6:30 AM you'll get your first session via      │
   │   SMS. Text back what you did and the dashboard updates      │
   │   in real time.                                              │
   │                                                              │
   │   ────────────────────────────────────                       │
   │                                                              │
   │   [ See your plan ]   → /plan (Active mode)                  │
   │   [ Download xlsx ]   → ~/Downloads/2026-fall-cycle.xlsx     │
   │   [ Skip first session ]   if you start mid-week             │
   │                                                              │
   │                                              [ Got it ✓ ]    │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

Three concrete next actions. Closes warmly. Click "Got it" → land on `/plan` Active mode showing the new arc.

## Edge cases

| Case | Behavior |
|---|---|
| User clicks "Start New Arc" but their current arc isn't done yet | Modal: "You have 3 weeks left in your current arc. End early?" with Cancel / Continue |
| Synthesis fails (LLM error, timeout) | Error card: "Couldn't compose your plan — usually a temporary issue. [ Retry ]" — narrative + cart preserved |
| User commits then immediately wants to edit | Active mode menu → "Edit Plan" → goes back to shopping with current plan pre-loaded |
| User wants to discard mid-flow (e.g. on preview screen) | "← Back to shopping" stays available; nothing committed until "Activate" clicked |
| User has no current arc but lands on /plan | No "between arcs" prompt — instead show a centered "Design your first arc" CTA |

## What this spec is NOT

- Not designing the **preview UX in depth** — the xlsx format is solved; renderer is a separate concern
- Not designing the **synthesis algorithm** — that's a backend / agent spec
- Not designing **mid-arc adjustments** — different surface, V2

## Open questions

1. **"Start mid-week" behavior** — if athlete clicks this, do we skip days in the bundle? Shift the start date? Re-do day 1 next Mon? Needs a real answer.
2. **Past arcs surface** — the collapsed "Past arcs ▾" on the steady-state entry — what's inside? List of past arcs with quick stats? Link to retros? Defer until first arc completes.
3. **Synthesis transparency** — should the AI explain *each block's rationale* in the preview ("Block 1 is hypertrophy because your narrative mentioned wanting muscle base") or just present the result?
