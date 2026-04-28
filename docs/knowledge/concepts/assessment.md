# Assessment Framework

> How to classify an athlete, identify their gaps, and recommend a training style and periodization approach. This is step 1 of program generation.

## Step 1: Gather Baseline Numbers

Every assessment needs these data points. Some are measured, some are self-reported.

### Required

| Data Point | How to Measure | Why It Matters |
|---|---|---|
| Bodyweight | Morning, fasted, weekly average | Power-to-weight ratio, load calculations |
| Back Squat (1RM or 3RM estimate) | Test day or recent training max | Relative strength classification |
| Body fat % (estimate) | Visual, calipers, or DEXA | Determines if cutting is viable |
| Training age | Years of consistent structured training | Determines novice/intermediate/advanced tier |
| Training frequency | Days per week available | Constrains program design |
| Active injuries | Self-reported | Exercise modification requirements |

### Goal-Specific (Vertical Jump)

| Data Point | How to Measure | Why It Matters |
|---|---|---|
| Standing vertical jump | Vertec or wall mark | Primary outcome metric |
| Approach touch height | Rim/backboard mark | Sport-specific transfer |
| Standing broad jump | 3 attempts, best of 3 | Horizontal power, correlates with VJ |
| Power Clean (if available) | 1RM or 3RM | Rate of force development indicator |

### Goal-Specific (Powerlifting)

| Data Point | How to Measure | Why It Matters |
|---|---|---|
| Squat / Bench / Deadlift | 1RM or 3RM estimate | Competition lifts |
| Wilks or DOTS score | Calculate from totals | Relative strength comparison |
| Weak points | Video analysis, sticking points | Exercise selection for accessories |

## Step 2: Classify Athlete Tier

Tier determines exercise complexity, volume tolerance, and periodization model.

### By Relative Strength (Squat/BW Ratio)

| Ratio | Tier | Implication |
|---|---|---|
| < 1.25× BW | Novice | Build general strength first. Simple programming works. |
| 1.25 - 1.75× BW | Intermediate (strength-deficit) | Still has room for strength gains that will directly transfer. |
| 1.75 - 2.25× BW | Intermediate (balanced or explosive-deficit) | Strong enough that pure strength has diminishing returns. Need power/reactive work. |
| > 2.25× BW | Advanced | Very strong. Focus almost entirely on rate of force development and sport-specific transfer. |

### By Training Age

| Years | Tier | Implication |
|---|---|---|
| 0-1 | Novice | Linear progression works. Keep it simple. |
| 1-3 | Intermediate | Needs periodization. Can handle moderate volume and complexity. |
| 3+ | Advanced | Needs specialized programming. High complexity, careful fatigue management. |

### Combined Classification

Use the LOWER of the two tiers. A 5-year lifter who squats 1.2× BW has programming gaps that need beginner-level strength work before advanced methods.

## Step 3: Identify the Gap

For athletes who want to improve a performance output (vertical jump, sprint speed, sport performance), the gap analysis determines WHERE on the force-velocity curve they need work.

### The Diagnostic Questions

1. **Is the athlete strong enough?** (Squat ≥ 1.75× BW for intermediate jump goals)
   - No → Strength deficit. Prioritize max strength.
   - Yes → Move to question 2.

2. **Can the athlete express strength quickly?** (Power clean ≥ 0.75× squat, or broad jump ≥ 8.5 ft)
   - No → Explosive strength deficit. Prioritize strength-speed (olympic lifts, speed work).
   - Yes → Move to question 3.

3. **Can the athlete use the stretch-shortening cycle?** (Depth jump rebound height close to max vertical)
   - No → Reactive deficit. Prioritize plyometrics and reactive training.
   - Yes → The athlete is well-rounded. Focus on sport-specific skill and maintenance.

### Gap → Training Emphasis

| Gap Identified | Primary Training Quality | Block Emphasis | Example |
|---|---|---|---|
| Strength deficit | max_strength | 70% strength, 20% power, 10% reactive | Novice who can't squat 1.5× BW |
| Explosive deficit | strength_speed | 30% strength, 45% power, 25% reactive | Strong athlete, slow off the ground |
| Reactive deficit | reactive | 20% strength, 30% power, 50% reactive | Fast athlete, poor at absorbing/redirecting force |
| Well-rounded | skill | Maintenance + sport-specific practice | Advanced athlete near their ceiling |

## Step 4: Recommend Training Style

The training style determines which guide to load for program generation.

| Goal | Recommended Style | Guide |
|---|---|---|
| Dunk / increase vertical jump | Vertical Jump | `styles/vertical-jump/guide.md` |
| Peak squat / bench / deadlift | Powerlifting | `styles/powerlifting/guide.md` |
| General athleticism / sport prep | Athletic Performance | `styles/athletic-performance/guide.md` |
| Striking power / flexibility | Combat | `styles/combat/guide.md` |

## Step 5: Select Periodization Model

Based on tier + gap + timeline (see `periodization-models.md` for full details):

| Tier | Gap | Timeline | Model |
|---|---|---|---|
| Novice | Strength | Any | Linear |
| Intermediate | Explosive | 12-16 weeks | Conjugate Sequence |
| Intermediate | Reactive | 8-12 weeks | Block or Conjugate |
| Advanced | Any | Known date | Block → Taper |

## Example Assessment: Andy (April 2026)

- Bodyweight: 192 lb, ~15-16% BF, cutting to 182-185
- Back Squat: ~370 lb → **1.93× BW** → Intermediate (balanced/explosive-deficit)
- Training age: 3+ years → Intermediate
- Combined tier: **Intermediate**
- Approach touch: can grab rim → has raw force but can't convert
- Gap: **Explosive strength deficit** (strong but slow)
- Recommended style: **Vertical Jump**
- Periodization: **Conjugate Sequence** (13 weeks to peak)
- Injuries: Right shoulder (no overhead), Left wrist De Quervain's (straps, snatch-dominant)

This assessment drives every subsequent programming decision — the block sequence, exercise selection, volume prescription, and testing protocol all flow from this classification.
