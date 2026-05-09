# Nutrition — Andy Lee

Last updated: 2026-05-02

The system: weekly Costco delivery + 1-hour Sunday prep + always-stocked supplement layer + restaurant fallback menu. Total weekly attention: ~75 minutes.

---

## The picture

- **Bodyweight:** ~192 lb, cutting to 182–185 lb (Goal #5)
- **Protein target:** **190g/day** (1g per lb bodyweight; non-negotiable during cut to protect strength)
- **Cooking:** willing to invest ~1 hr/week on Sunday prep; prefers natural, single-ingredient proteins (no marinades or sauces)
- **Work pattern:** lunch is at the office; vegetables and some carbs available there
- **Acquisition:** semi-automated Costco delivery (Instacart partnership), recurring weekly

The system is built to require almost no in-the-moment decisions. Sunday is the only meaningful attention block; the rest of the week runs on defaults.

---

## Three-layer system

### Layer 1 — Daily protein floor (the supplement, zero prep)

- **AM Fairlife** — 42g
- **AM Greek yogurt** — 20g (optional, brings AM to ~62g)
- **Whey shake (1–2 scoops)** — 25–50g, mid-morning or post-workout

**Recommended whey:** **Naked Whey** — single ingredient (grass-fed whey, US dairies), no flavoring, no sweeteners. ~$80 / 5 lb (76 servings) = ~$30–40/mo at 1–2 scoops/day. Set on Amazon Subscribe & Save, every 2 months.

This layer alone delivers **~80–100g/day** with zero prep effort.

### Layer 2 — Sunday-prepped protein (the engine)

Cooked once on Sunday, lasts 3–4 days. The 1-hour prep template (below) produces this.

| Item | Yield | Use |
|---|---|---|
| Sheet-pan chicken thighs (~3 lb raw → 2 lb cooked) | ~225g protein, 4–5 lunch portions | Lunch at work + dinner |
| Hard-boiled eggs (12) | 72g protein | Snack, gym bag, desk drawer |
| Rice (3 cups dry → 9 cups cooked) | 4 portions | Carb side for lunch/dinner |
| Optional rotation: salmon fillets, ground beef, or pre-marinated steak | ~100–150g protein | Variety for dinner |

### Layer 3 — Always-stocked snacks (friction-zero protein hits)

| Item | Protein | Where it lives |
|---|---|---|
| Greek yogurt (Fage 0% / Two Good) | 20g/cup | Home fridge |
| Cottage cheese (Good Culture 4%) | 25g/cup | Home fridge |
| Biltong (real biltong, not jerky) | ~30g/oz | Gym bag, desk, car |
| Fairlife Core Power | 42g | Home fridge — backup AM or PM shake |
| Wild Planet tuna pouches | 17–22g | Desk drawer (Amazon S&S) |

---

## Menu (cook tiers + vocabulary)

The standing menu, organized by category and cook tier. **This file holds vocabulary + cooking style — not per-food data.** Per-food macros (kcal, protein, carbs, fat), Costco SKU yields, and "usual" restaurant orders live in Supabase `meal_library` when v0b ships. The orchestrator queries Supabase for portion math.

### Cook tier definitions

- **T1 — Zero cook.** Open and eat. The friction floor.
- **T2 — Sheet pan / 1-step.** Set timer, walk away. Single-pan cleanup.
- **T3 — Active cooking.** Stove attention required. ~5–10 min focused.
- **T4 — Multi-step / sauces / braises.** NOT in the standing menu. The "Recipe of the Week" lane (below) is where T3/T4 ambition lives.

The active cook ceiling per block is defined in the active arc's `nutrition.md` file.

### Proteins

| Food | Source | Tier | Prep |
|---|---|---|---|
| Rotisserie chicken | Costco | T1 | None — pre-cooked |
| Hard-boiled eggs | Costco / DIY batch | T1 | Boil 10 min, batch on Sunday |
| Smoked salmon | Costco | T1 | None |
| Cottage cheese (Good Culture 4%) | Costco | T1 | None |
| Greek yogurt (Fage 0%) | Costco | T1 | None |
| Biltong | Amazon S&S | T1 | None |
| Tuna pouches (Wild Planet) | Amazon S&S | T1 | None |
| Fairlife Core Power | Costco | T1 | None |
| Whey shake (Naked Whey) | Amazon S&S | T1 | Shake bottle |
| Chicken thighs (raw) | Costco | T2 | Sheet pan, 25 min @ 400°F |
| Wild salmon fillet | Costco | T2 | Sheet pan, 12 min @ 400°F |
| Ground beef 93/7 | Costco | T2 | Brown in pan, ~10 min |
| Ribeye steak | Costco | T3 | Sear 4 min/side, rest 5 min |
| Other fish (cod, bass) | Costco | T3 | Pan-sear 4 min/side |

### Carbs

| Food | Source | Tier | Prep |
|---|---|---|---|
| Sweet potato | Costco | T2 | Microwave 6 min OR bake 45 min |
| White rice | Costco | T2 | Rice cooker — set + walk away |
| Berries (mixed) | Costco | T1 | None |

### Vegetables

| Food | Source | Tier | Prep |
|---|---|---|---|
| Broccolini | Costco | T2 | Sauté 5 min OR roast 12 min |
| Green beans | Costco | T2 | Sauté 5 min OR roast 12 min |
| Pre-cut salad mix | Costco | T1 | None |

### Allocation principles

How the standing menu allocates across a week. The orchestrator (when built) follows these; for now this is the human-facing pattern.

1. **Honor the active cook ceiling** for the current block (e.g., B1 = T1 + Sunday T2 only)
2. **Layer 1 (T1 supplements) is constant** — daily baseline, no allocation decisions
3. **Solid protein** rotates across allowed-tier sources for variety (e.g., 4 chicken / 3 salmon / 1 ground beef / 6 rotisserie portions across the week)
4. **Sweet potato + rice** are carb defaults; sweet potato preferred (denser micros, easier prep)
5. **Broccolini + green beans** rotate as cooked veg; salad mix is the T1 fallback
6. **Eggs are the leftover-protein safety net** — always at least 6 in the fridge

---

## Recipe of the Week (the cooking-skill lane)

The standing menu above is the friction floor — boring on purpose, automated, no thinking required. Separate from it: **one recipe per week** Andy cooks himself, sourced from trusted sites (Mob, Jalal, etc.).

This lane exists to:
- Build cooking skill gradually without overwhelming the week
- Add variety so the standing menu doesn't burn out
- Make eating feel like a human activity, not just fueling

### How it works

**Saturday review** (alongside the order ritual):
1. Agent asks: "Recipe this week? (Paste a Mob/Jalal link, name a recipe, or skip.)"
2. Andy provides a recipe URL or name
3. Agent fetches the recipe (URL → ingredient list)
4. Agent adds the recipe's ingredients to the Costco order delta (deduped against the standing list)
5. Updated order surfaces for approval

**During the week:**
- Andy cooks the recipe one night of his choosing (no scheduling)
- The recipe replaces one dinner that week
- The standing menu carries the other ~13 home meals

### Rules

- **One recipe maximum per week** — this is a ceiling, not a floor. Skip is fine.
- **Athlete-friendly preference** — single-protein-forward dishes (salmon tray bakes, steak + roast veg, chicken + rice). Pasta-heavy / dessert-heavy recipes count against the kcal phase; flag and decide.
- **No macro accounting** in v0 — the recipe adds variety + ingredients; the standing menu's protein floor + Layer 1 still hits 190g/day. Trust the system.
- **No curated recipe library** in v0 — Andy picks fresh each Saturday. If he wants to track keepers later, that's an `athletes/andy/recipes-made.md` log (out of scope for now).

### Trusted sources

- [Mob (mob.co.uk)](https://www.mob.co.uk/) — fast, single-protein-forward, athlete-friendly
- **Jalal Sameja (Jalalsamfit)** — high-protein meal-prep recipes; cookbook PDFs in [`docs/nutrition-styles/jalal-samfit/sources/`](../../docs/nutrition-styles/jalal-samfit/sources/)
- Add others as Andy finds them

---

## The semi-automated Costco workflow

**Setup (one-time, ~30 min):**
1. Create a Costco account on costco.com
2. Link to Instacart (or use Costco Same-Day delivery)
3. Build the standing list (below)
4. Schedule recurring weekly delivery — Saturday PM or Sunday AM

**Standing weekly list (~$160–220/wk):**

| Category | Items |
|---|---|
| Raw proteins (for prep) | Chicken thighs (~3 lb), wild salmon fillets (1–2 lb), 93/7 ground beef (1 lb) |
| Pre-cooked backup | Rotisserie chicken, Just Bare chicken bites (frozen), Costco hard-boiled eggs (1–2 6-packs), smoked salmon |
| Snacks/staples | Greek yogurt 12-pack, cottage cheese (2–3), Fairlife (18-pack), biltong |
| Carbs/sides | Rice (1 bag), pre-cut broccoli/peppers, sweet potatoes, berries |

Default behavior: **"repeat last week."** Modify only when something changes (rotate steak in, drop salmon out). You edit exceptions, not the whole list.

---

## The 1-hour Sunday prep template

Parallel cooking. Hands-on ~30 min; rest is hands-off.

| Min | Action |
|---|---|
| 0–5 | Preheat oven 400°F. Salt/pepper chicken thighs on sheet pan. Start water boiling for eggs. Start rice cooker (3 cups dry). |
| 5–10 | Chicken into oven (25–30 min). Drop 12 eggs into boiling water, 10-min timer. |
| 10–25 | Hands-off. Pull eggs at 10 min into ice bath. Optional: brown ground beef or sear steak in parallel. |
| 25–35 | Pull chicken, rest 5 min, portion into 4–5 containers. |
| 35–50 | Peel eggs, store in tupperware. Portion rice. Wipe down kitchen. |
| 50–60 | Buffer / optional salmon fillet (sheet pan, 12 min at 400°F). |

**Output:** ~280–330g cooked protein, 12 boiled eggs, 4 portions of rice. Covers 3–4 lunches/dinners with no in-the-moment decisions.

---

## Daily target stack

### Workday (the default)

| Slot | Item | Protein |
|---|---|---|
| AM | Fairlife + Greek yogurt | 62g |
| Mid-morning | Whey shake (1 scoop) | 25g |
| Lunch (work) | Prepped chicken (5oz) + office salad bar | 40g |
| PM snack | Cottage cheese or biltong | 25g |
| Dinner | Prepped chicken/salmon/beef OR fallback restaurant | 40–64g |
| **Total** | | **190–215g** ✓ |

### Weekend / off-pattern

| Slot | Item | Protein |
|---|---|---|
| AM | Fairlife + Greek yogurt | 62g |
| Lunch | **Chipotle: double-chicken bowl** | 64g |
| Snack | Cottage cheese | 25g |
| Dinner | Prepped salmon / rotisserie chicken | 50g |
| **Total** | | **201g** ✓ |

---

## Fallback menu (when prep runs dry mid-week)

Cap: **≤1 fallback day per week.** If you're hitting fallbacks 3x/week, the Costco delivery or prep didn't happen — fix the cadence, not the menu.

| Rank | Spot | Default order | Protein |
|---|---|---|---|
| 1 | **Chipotle** | Double-chicken or double-steak bowl, brown rice, beans, fajita veg | 64–72g |
| 2 | **Sweetgreen** | Harvest Bowl + double chicken | 40–50g |
| 3 | **Cava** | Greens-and-grains bowl, double chicken or lamb | 40–50g |
| 4 | **Costco food court** | Rotisserie chicken or chicken caesar | 50–70g |
| 5 | **Travel / no time** | Biltong + Fairlife + 2 boiled eggs from the bag | 70–80g |

---

## Weekly cadence

| Day/Time | Action | Duration |
|---|---|---|
| Fri/Sat | Review standing Costco list, modify exceptions | 2 min |
| Sat PM **or** Sun AM | Costco delivery arrives | passive |
| Sunday AM (fasted) | Weigh-in → 7-day rolling avg | 10 sec |
| Sunday 4–5pm | 1-hr prep session | 60 min |
| Wed/Thu | Fridge check, plan a fallback day if needed | 30 sec |

**Total weekly attention: ~75 minutes.**

Two non-negotiables: **Costco delivery lands** and **Sunday prep happens.** Everything else flexes.

---

## Macros (first-pass — validate or override)

Estimated maintenance: ~3000 kcal. Cut target: ~2600 kcal (~400 deficit, ~0.75 lb/wk loss).

| Macro | Target | Source |
|---|---|---|
| Protein | **190g** | Whey + prepped chicken + dairy |
| Fat | ~75g | Eggs, salmon, dairy, oil from cooking |
| Carbs | ~285g | Rice, office cafeteria, Chipotle base, fruit |

Carbs sit around training. Fat moderates appetite outside training windows.

---

## Cost estimate

| Line | Monthly |
|---|---|
| Whey protein (Naked, ~50 scoops) | ~$40 |
| Costco delivery (proteins + snacks + carbs/sides) | ~$700–900 |
| Restaurant fallback (~1–2x/wk) | ~$100–160 |
| Instacart fees | ~$40 |
| **Total** | **~$880–1,140/mo** |

Higher than the no-cook baseline because the haul is wider (raw proteins for cooking + pre-cooked backup + carbs/sides). Still cheaper than a full meal subscription model, more flexible, and closer to "athlete eats real food."

---

## Setup checklist (one-time, this week)

- [ ] Create Costco account, link Instacart, build standing list
- [ ] Schedule first recurring delivery (Saturday PM)
- [ ] Order **Naked Whey 5lb** on Amazon Subscribe & Save (every 2 mo)
- [ ] Set up Wild Planet tuna pouches on Amazon S&S
- [ ] Buy a shaker bottle for desk + gym
- [ ] Stock desk drawer: tuna pouches (4–6), biltong, Premier Protein backup
- [ ] Calendar-block recurring: **Sunday 4–5pm prep**
- [ ] Pick a tracking method:
  - **MacroFactor** — best for cuts. Recommended for first 4 weeks until portion sizes calibrate.
  - **MyFitnessPal** — free, more friction.
  - **None** — works only if Layer 1 + prep are locked.
- [ ] Baseline: 7-day morning weight average, front/side photos, current lift PRs

---

## Failure modes and recovery

- **No Sunday prep happened.** → Lean on Layer 1 (~80g locked) + pre-cooked backup from the Costco haul (rotisserie, Just Bare bites) + 1 fallback restaurant day. Don't skip prep two Sundays in a row.
- **Costco delivery missed/cancelled.** → Mid-week mini-run to Trader Joe's (15 min) for pre-cooked chicken + eggs. Doesn't need to be the full haul.
- **Traveling / out of town.** → Whey scoops + Fairlife + biltong in the bag. One restaurant meal/day = double-protein order. Aim for ≥160g, not 190.
- **Social dinner.** → Order protein-forward (steak, chicken, fish — not pasta). Pre-load the day with whey + lunch protein.
- **Fell off for >3 days.** → Don't rebuild from a perfect plan. Reset = next Costco delivery + next Sunday prep. Single-decision recovery.

---

## What this doc is NOT

- Not a meal plan with recipes — too brittle, decays fast.
- Not a calorie-tracking app — if tracking is needed, that's a separate decision (MacroFactor recommended for weeks 1–4).
- Not a stand-in for a registered dietitian — consult one if cut stalls or strength drops noticeably.

This is the **operating system**: weekly Costco delivery + 1-hour Sunday prep + supplement floor + small fallback menu. Read it Sunday morning, don't think the rest of the week.
