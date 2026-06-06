# Coach Profile — Design Lock

> The design contract for what goes on a coach profile in the marketplace.
> If a future change adds a section, drop a section, or moves the data
> model, update this doc first — it's the source of truth that the code
> in `web/dashboard/app/plan/coaches/[id]/page.tsx` implements.

**Status:** locked 2026-06-06 · superseded sections from the v1 hand-written
marketplace (philosophy paragraphs, principles cards, what-you'll-gain
bullets, testimonials, at-a-glance stat cards).

---

## 1. Who this is designed for

Two consumer types, in priority order:

| Type | What they're doing | What they need |
|---|---|---|
| **Identity shopper** *(primary)* | Browsing coaches, deciding "is this person someone I want to train like?" | Visual identity, sample of the actual work, vibe absorption. Decides in 30-60 seconds whether to add to plan. |
| **Methodology nerd** *(secondary)* | Already interested, now wants to validate the approach | Philosophy, principles, programming theory. Decides after reading. |

The profile front-loads identity shopper content. Methodology nerd content lives below the fold, collapsed by default.

**Out of scope:** the already-committed athlete (returning user). Their surface is the dashboard, not the marketplace.

---

## 2. The section contract

Every section earns its place by answering one specific user question, in user voice. If a section can't be matched to a question, it doesn't ship.

| # | Section | The user is asking… | Default state |
|---|---|---|---|
| 1 | **Hero** | *"Who is this and should I take them seriously?"* | Visible |
| 2 | **Overview** | *"What's the deal with this style of training?"* | Visible |
| 3 | **Equipment** | *"Do I have what I need to do this?"* | Visible |
| 4 | **Sample Week** | *"What would I actually be doing?"* | Visible |
| 5 | **Highlights** | *"What do they sound like? Are they my kind of person?"* | Visible |
| 6 | **Methodology** | *"I'm sold. Show me the depth."* | Collapsed |

---

## 3. Section-by-section spec

### 3.1 Hero

**Answers:** *"Who is this and should I take them seriously?"*

Content:
- Headshot (real photo, 900×900 from YouTube channel — `public/coaches/<id>.jpg`)
- Name
- Handle
- Followers
- **Credentials line** — 1 line, embedded next to the handle (NOT a separate "Credentials" section). Examples:
  - *Catalyst Athletics*: "Greg Everett — 25+ years coaching Olympic-level athletes"
  - *Dylan Shannon*: "Pro athlete · Performance + Physique hybrid coach"
- **Tagline** — visceral 1-liner in the coach's voice, set big as the page H1. Examples:
  - *Dylan*: "Look like a bodybuilder, perform like an athlete."
  - *Catalyst*: TBD — needs to come from Greg Everett's voice (excerpt from §10 coach's notes in `guide.md`)
- Primary CTA: `[Add to plan ▶]` button (existing behavior)

What's NOT here:
- Rating stars (dropped — no rating mechanism)
- Program count (dropped — no clear definition)
- Testimonials (deferred — no real source yet)

### 3.2 Overview

**Answers:** *"What's the deal with this style of training?"*

Three sentences, narrative paragraph. Each sentence does exactly one job:

1. **Style intro** — *"[Style name] is [coach]'s [system type] that [the distinctive thing]."*
2. **Programming approach** — *"How a week is shaped / what the structure does."*
3. **Who it's for** — *"Built for [audience] who want [outcome]."*

Followed by a chip strip for at-a-glance:
- `<days/wk>` · `<session length>` · `<level>`

NOT in chip strip: equipment (that's its own section — see §3.3).

**Examples:**

> **Dylan Shannon:** POWERJACKED is Dylan Shannon's 6-day hybrid system that builds an explosive lower body and a jacked upper body in parallel. Each week stacks sprints, jumps, Olympic lifts, and heavy compounds when the nervous system is fresh, then layers high-volume bodybuilding accessories over the top of every session. Built for field-sport athletes and intermediate-to-advanced lifters who want size and speed at the same time.
>
> `6 d/wk` · `75-90 min` · `intermediate/advanced`

> **Catalyst Athletics:** Catalyst Athletics is Greg Everett's Olympic weightlifting system, built around the snatch and clean & jerk as the primary training tools — with squats, pulls, and pressing as support. The programs scale by skill level: beginners learn the competition lifts with coach-prescribed loads and lots of technique work; advanced athletes layer in higher volume, more variations, and percentage-based loading. Built for athletes pursuing competitive Olympic weightlifting performance, or athletes who need transferable triple-extension power.
>
> `3-6 d/wk` · `60-120 min` · `beginner → advanced`

### 3.3 Equipment

**Answers:** *"Do I have what I need to do this?"*

Short list, 3-5 lines, with category icons. Acts as a fit gate — visitor checks at a glance whether their gym/space supports the style.

**Examples:**

> **Dylan:**
> - 🏋 Full gym (barbell, rack, plates, DBs, cable stack)
> - 🏃 Sprint surface (turf or track)
> - 📦 Plyo boxes + hurdles

> **Catalyst:**
> - 🏋 Barbell + bumper plates
> - 🏗 Lifting platform
> - 🦴 Squat rack + pulling blocks (jerk blocks ideal)

Icons are illustrative; final icon set chosen during implementation.

### 3.4 Sample Week

**Answers:** *"What would I actually be doing?"*

Title: **"Sample Week"** — uniform across all coaches, not personalized as "A week with Dylan" (consistency lets the section header become a recognizable anchor).

Content:
- 7 days, Mon-Sun
- Each day expanded inline (not click-to-expand) — show the actual exercises, sets, reps, time
- Optional 1-line coach voice note per day (e.g. *"Open every week with maximal CNS work. Don't sandbag warmups."*), excerpted/derived from `guide.md` §10 "Coach's notes"
- Rest days marked clearly, not hidden

Source: `coach-profiles.ts → weekStructure[]` (already exists). Truncation bug in existing day-card title needs to be fixed in this rebuild.

### 3.5 Highlights

**Answers:** *"What do they sound like? Are they my kind of person?"*

Title: **"Highlights"** — uniform across all coaches.

Content: horizontal carousel of YouTube videos from the coach's channel.
- Top N (default: 6) by view count
- Each card: thumbnail, title, duration, view count
- Click → opens YouTube in new tab (we don't embed; load-time + tracking cost)

Data: `Coach.videos[]` (field exists in `coach-profiles.ts`, currently empty). Populated via `yt-dlp --flat-playlist --print-json | sort by view_count desc | head -N` per coach.

### 3.6 Methodology *(collapsed, deferred)*

**Answers:** *"I'm sold. Show me the depth."*

Hidden in a `<details>` block by default. Content TBD — see Open Items §5.

---

## 4. Data model implications

| Field | Status | Source |
|---|---|---|
| `headshot: string` | ✓ exists (added 2026-06-06) | Manual: yt-dlp channel avatar |
| `tagline: string` | ✓ exists, role upgraded to H1 | Hand-written from coach voice |
| `stats.followers: string` | ✓ exists | Manual: yt-dlp follower count |
| **`credentials: string`** *(NEW)* | ❌ add | Manual: 1-line from public bio |
| **`overview: string`** *(NEW)* | ❌ add | Hand-written from `guide.md` §1-§2 |
| `tags.equipment: string[]` | ✓ exists, gets its own section | From `guide.md` §1 equipment min |
| `weekStructure: DaySession[]` | ✓ exists, expanded inline | From `guide.md` §7 sample week |
| `videos: SampleVideo[]` | ✓ exists, currently empty — populate | yt-dlp top-N-by-views |
| **`dayNotes: Record<dayIdx, string>`** *(NEW, optional)* | ❌ defer | From `guide.md` §10 |
| `philosophy: string` | ✓ exists, moves to Methodology (collapsed) | No change |
| `principles: Principle[]` | ✓ exists, moves to Methodology | No change |
| `bestFor` / `notFor: string[]` | ✓ exists, moves to Methodology | No change |
| `whatYoullGain: string[]` | ❌ **drop** — overlaps with overview + tagline | Remove entirely |

---

## 5. Open items (deferred)

- **Methodology section content + layout** — what exactly goes in the collapsed block? Just philosophy + principles + best/not-for as today? A structured "for builders" subset of the guide.md? TBD before that section ships.
- **Coach voice day notes** — auto-derive from `guide.md` §10 vs hand-write. Auto is faster, hand is better quality. TBD.
- **Hero tagline for Catalyst** — needs a voice-of-Greg-Everett 1-liner. Current tagline is descriptive ("Olympic weightlifting from Greg Everett…") not visceral. TBD.
- **Highlights data population** — needs yt-dlp top-N-by-views pass per coach.
- **Credentials sourcing at scale** — manual is fine for 2 coaches; needs a process when we reach 12+.
- **Testimonials** — explicitly out of scope until we have a real source. Don't fabricate.

---

## 6. What this design replaces

The pre-2026-06-06 profile (`web/dashboard/app/plan/coaches/[id]/page.tsx`) had 8 sections, 6 of them prose-heavy:

1. Hero (kept, simplified) ✓
2. Philosophy (moved to Methodology, collapsed)
3. What you'll gain (dropped)
4. At-a-glance stat cards (replaced by overview chip strip + Equipment section)
5. Principles (moved to Methodology, collapsed)
6. Sample week (kept, renamed, expanded inline)
7. Videos (kept, renamed to Highlights)
8. Best for / Not for (moved to Methodology, collapsed)
9. Pairs carousel (kept as-is, not part of this redesign)

Net change: 6 visible sections of prose → 4 visible sections + 1 collapsed depth block + pairs carousel unchanged.
