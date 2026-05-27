# PLAN · Shopping Experience (design)

**Status:** superseded — shipped state lives in [`plan-creation-shipped.md`](plan-creation-shipped.md); product-level scope in [`PRD.md`](../../PRD.md). This doc kept as design exploration history.
**Owner:** Andy
**Updated:** 2026-05-25
**Module:** PLAN (the conscience / authoring surface of the OS)

The shopping experience is the entry point to plan authoring. It captures two inputs from the athlete:

1. **A narrative** — goals, baselines, motivations, constraints, context (anything that helps the agent shape the plan)
2. **A style cart** — training methodologies the athlete wants woven into the plan

These two inputs feed the AI synthesis step (separate spec) that produces the structured xlsx artifact.

---

## 1. Page layout — two-pane

```
┌─────────────────────────────────────────────────────────┬─ CART ────────┐
│                                                          │              │
│  TELL US ABOUT YOURSELF                                  │  (empty)     │
│                                                          │              │
│  [ narrative textarea with scaffolded prompts ]          │  Suggested:  │
│                                                          │  (waits for  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │   narrative) │
│                                                          │              │
│  STYLES TO INCORPORATE                                   │  ──────      │
│                                                          │  Add styles  │
│  [ style shelf — grid of style cards ]                   │  from shelf  │
│                                                          │              │
└─────────────────────────────────────────────────────────┴──────────────┘
```

Main content scrolls; cart sidebar stays sticky on the right.

## 2. Narrative input — scaffolded prompts

A single multi-line textarea with placeholder text that pre-fills section headers as a scaffold. User can keep, delete, or ignore.

```
┌──────────────────────────────────────────────────────────────────┐
│  Goals:                                                          │
│  Baselines (current numbers, BW, lifts):                         │
│  Motivations (why this matters now):                             │
│  Constraints (time, injuries, equipment):                        │
│                                                                  │
│  ...or just talk in your own words.                              │
└──────────────────────────────────────────────────────────────────┘

   [ See an example ]    [ Walk me through this ]
```

Two optional aids below the textarea:
- **See an example** — toggle that reveals a model narrative inline
- **Walk me through this** — chatbot that asks the questions one at a time and writes the narrative

Most users will free-write. The scaffold lowers blank-page friction without forcing a form.

## 3. Style shelf — card grid

Grid of cards. Each card is minimal:

```
   ╭─ <Style Name> ─────────────────────╮
   │ <one-line subtitle>                 │
   │                                     │
   │ <length> · <cadence> · <focus>     │
   │                                     │
   │ best for: <tag1>, <tag2>, <tag3>   │
   │                                     │
   │ "<one principle quote>"             │
   │                                     │
   │ [ Read ]            [ + Add ]      │
   ╰─────────────────────────────────────╯
```

Five elements: title · constraints · tags · principle · actions. Nothing else.

- **[ Read ]** — expands the card inline (or opens a slide-over) with the full style summary
- **[ + Add ]** — drops the style into the cart, button switches to "✓ Added"

A special **Custom** card lets the athlete add a style not in the library — paste a URL, book title, or short description; the AI ingests it ad-hoc for this session.

## 4. The cart — lean and opinionated

The cart holds three things:

1. Selected styles (with × to remove)
2. The Suggested-for-you tray (AI-driven, dismissible)
3. The Generate Plan button

```
┌─ CART (3) ─────────────┐
│                        │
│ ● VJ Bible         ×   │
│   18 wk · power        │
│                        │
│ ● Catalyst         ×   │
│   12 wk · technique    │
│                        │
│ ● Tom Merrick      ×   │
│   daily · mobility     │
│                        │
│ ──────                 │
│                        │
│ SUGGESTED              │
│ + Daily Eight (warm)   │
│ + Wendler 5/3/1        │
│ [ dismiss ]            │
│                        │
│ ──────                 │
│                        │
│ [ Generate Plan → ]    │
│                        │
└────────────────────────┘
```

**Deliberately no controls for "how styles combine."** The user picks ingredients; the AI handles the recipe.

## 5. AI recommendations — two layers

Activated once the narrative has content.

**Layer 1 — Re-sort + tag the shelf:**
Cards re-order so the AI's top matches are first. Top matches get a small `matches your goals` badge in the top-right of the card.

**Layer 2 — Suggested cart tray:**
A small "Suggested for you" tray appears in the cart sidebar with 1-3 pre-picked styles. User can `+ accept all` or pick individually. No auto-add to the cart — always opt-in.

Recommendations are transparent (the user sees what was suggested and can ignore) but they make the experience feel intelligent without taking away control.

## 6. Generate Plan — the synthesis step

Click triggers:

1. AI reads the narrative
2. AI reads the selected styles' full guides
3. AI synthesizes an arc structure (blocks, weeks, daily sessions)
4. xlsx is generated as the canonical artifact
5. Preview renders the xlsx as an interactive grid
6. User confirms → activates as the active arc → bundle is generated → dashboard wakes up

**Loading state:** "AI is composing your plan…" with progress indication. Synthesis takes 30–60 seconds. The preview streams as it builds (Block 1 first, then Block 2, etc.) so the experience feels alive.

The preview + confirm flow is a separate spec — this doc ends at the moment of clicking "Generate."

## 7. Edge cases

| Case | Behavior |
|---|---|
| Empty narrative + empty cart | "Generate" disabled; hint: "Tell us about your goals and pick at least one style." |
| Narrative only, no cart | Hint: "Pick at least one style to combine." |
| One style, no narrative | Hint: "Tell us about your goals so the AI can shape the plan." |
| Cart >4 styles | Soft warning: "More than 4 styles is hard to weave coherently. Consider trimming." |
| User adds the same style twice | Idempotent — second add is a no-op, button shows "✓ Added." |
| Custom-style modal | Paste URL / book title / short description; AI summarizes; treats as ad-hoc style for this plan only. |

## 8. What this spec does NOT cover

- **Plan preview & confirm** (Step 2-3 of Create mode) — separate spec
- **xlsx renderer** — separate spec (used by preview AND by Active mode dossier)
- **Active mode dossier** (deepened /plan view with Block deep-dive, Goal progress, etc.) — separate spec
- **Style metadata schema** (what structured data each style guide needs) — separate spec; prerequisite for the AI matching layer

## 9. Open questions

1. **Custom style ingestion** — for v1, should custom styles persist as proper library entries (so other users / future arcs can reuse) or stay ephemeral?
2. **Walk-me-through chatbot** — v1 feature or defer to V2?
3. **Recommendation transparency** — when a style is recommended, do we show *why*? ("Matches your goal: dunking" vs just a badge)
4. **Mobile shape** — sidebar cart becomes a bottom drawer? Or full-page cart accessed from a button?

## 10. Visual primitives needed

To build this, we'd need:

- `<NarrativeTextarea>` — scaffolded prompts + auxiliary buttons
- `<StyleCard>` — the five-element card with read / add actions
- `<StyleShelf>` — grid of `StyleCard`s with re-sort capability
- `<Cart>` — sticky sidebar with items + suggested + generate
- `<SuggestedTray>` — small tray inside the cart
- `<CustomStyleModal>` — paste URL / describe a style

All can fit the existing Stratus aesthetic and the widget engine's design tokens.
