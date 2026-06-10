"""Foundational video classifier.

Reads scraped video metadata for a coach (output of `yt-dlp --playlist-end 250
--print "%(id)s|%(title)s|%(duration)s|%(view_count)s|%(upload_date)s"`),
sorts by view count, takes top 200, enriches with rank percentile, builds a
prompt with per-coach context, calls Claude, parses the 5-pick JSON output.

Usage:
    python3 foundational_picks.py --input /tmp/coach-research/nippard-deep.txt \\
        --coach nippard --output /tmp/coach-research/nippard-picks.json

Picks all 4 coaches at once:
    python3 foundational_picks.py --all
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# Load .env so ANTHROPIC_API_KEY is available without manual export.
def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        # Strip surrounding quotes if present (common .env formatting)
        val = val.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in ("'", '"'):
            val = val[1:-1]
        if key not in os.environ:
            os.environ[key] = val


_REPO_ROOT = Path(__file__).resolve().parents[3]
_load_dotenv(_REPO_ROOT / ".env")


@dataclass
class CoachContext:
    slug: str
    name: str
    category: str
    known_for: str
    overview: str


COACHES: dict[str, CoachContext] = {
    "catalyst-athletics": CoachContext(
        slug="catalyst-athletics",
        name="Catalyst Athletics (Greg Everett)",
        category="Olympic weightlifting · technique-driven snatch + clean & jerk programming",
        known_for=(
            "Snatch and clean & jerk technique progressions, the three-pull model, "
            "skill-level-gated programming (Level 0 → Level 5), coach-prescribed loads "
            "before percentage work, four strength qualities (absolute / speed-strength "
            "/ explosive-strength / strength endurance), Explosive Strength Deficit "
            "diagnosis"
        ),
        overview=(
            "Catalyst Athletics is Greg Everett's Olympic weightlifting system, built "
            "around the snatch and clean & jerk as the primary training tools — with "
            "squats, pulls, and pressing as support. Programs scale by skill level: "
            "beginners learn the competition lifts with coach-prescribed loads and lots "
            "of technique work; advanced athletes layer in higher volume, more "
            "variations, and percentage-based loading. Built for competitive Olympic "
            "weightlifting performance or athletes who need transferable triple-extension "
            "power for sport."
        ),
    ),
    "dylan-shannon": CoachContext(
        slug="dylan-shannon",
        name="Dylan Shannon (POWERJACKED)",
        category="Hybrid performance · power + physique 6-day system",
        known_for=(
            "The POWERJACKED 6-day hybrid system, four lower-body pillars "
            "(sprint maximally / jump high & far / move weight violently / "
            "squat + hinge heavy), velocity-first session ordering (sprints + plyos + "
            "Olympic + heavy compounds when CNS fresh; bodybuilding accessories after), "
            "density work (14-min squat clocks, EMOM deadlifts), look like a bodybuilder + "
            "perform like an athlete"
        ),
        overview=(
            "POWERJACKED is Dylan Shannon's 6-day hybrid system that builds an explosive "
            "lower body and a jacked upper body in parallel. Each week stacks sprints, "
            "jumps, Olympic lifts, and heavy compounds when the nervous system is fresh, "
            "then layers high-volume bodybuilding accessories over the top. Built for "
            "field-sport athletes and intermediate-to-advanced lifters who want size and "
            "speed at the same time."
        ),
    ),
    "nippard": CoachContext(
        slug="nippard",
        name="Jeff Nippard",
        category="Science-based hypertrophy + strength",
        known_for=(
            "RIR-based progression, volume landmarks (MEV / MAV / MRV) per muscle, "
            "evidence-based exercise selection ranked by EMG and stretch-mediated "
            "hypertrophy data, lengthened-position bias, the Push/Pull/Legs system, "
            "tier-list exercise rankings, citation-driven explainers"
        ),
        overview=(
            "Science-based hypertrophy and strength programming from a natural pro "
            "bodybuilder with a biochem degree. Programming uses RIR-based progression, "
            "exercise selection ranked by EMG and stretch-mediated hypertrophy data, and "
            "volume calibrated between MEV and MRV. Built for intermediate-to-advanced "
            "lifters who want measurable muscle gain backed by the meta-analysis "
            "literature."
        ),
    ),
    "israetel": CoachContext(
        slug="israetel",
        name="Mike Israetel (Renaissance Periodization)",
        category="Hypertrophy science · RP mesocycle programming",
        known_for=(
            "Renaissance Periodization mesocycle structure (4-6 week accumulation blocks "
            "from MEV to MRV, then deload), volume landmarks (MV / MEV / MAV / MRV) per "
            "muscle, junk-volume concept, stimulus-to-fatigue ratio, RIR-based effort "
            "calibration, exercise variation between mesocycles, scientific principles "
            "of hypertrophy training"
        ),
        overview=(
            "Renaissance Periodization codified the volume landmarks (MV / MEV / MAV / "
            "MRV) that every modern hypertrophy programmer references. The system runs "
            "4–6 week mesocycles: weekly volume climbs from MEV toward MRV, then a "
            "deload week resets fatigue before the next cycle begins. Effort is non-"
            "negotiable — most working sets sit at 0–2 RIR by the end of the cycle."
        ),
    ),
}


@dataclass
class Video:
    id: str
    title: str
    duration_s: int
    views: int
    year: str

    @property
    def duration_str(self) -> str:
        m, s = divmod(self.duration_s, 60)
        if m >= 60:
            h, m = divmod(m, 60)
            return f"{h}:{m:02d}:{s:02d}"
        return f"{m}:{s:02d}"

    @property
    def views_str(self) -> str:
        v = self.views
        if v >= 1_000_000:
            return f"{v/1_000_000:.1f}M"
        if v >= 1_000:
            return f"{v/1_000:.0f}K"
        return str(v)


def parse_input(path: Path) -> list[Video]:
    out: list[Video] = []
    for line in path.read_text().splitlines():
        parts = line.split("|", 4)
        if len(parts) != 5:
            continue
        vid, title, dur, views, date = parts
        try:
            dur_i = int(dur) if dur and dur != "NA" else 0
            views_i = int(views) if views and views != "NA" else 0
        except ValueError:
            continue
        year = date[:4] if date and len(date) >= 4 else "—"
        out.append(Video(id=vid, title=title, duration_s=dur_i, views=views_i, year=year))
    return out


def percentile_label(rank: int, total: int) -> str:
    pct = rank / max(total, 1) * 100
    if pct <= 5:
        return "top 5%"
    if pct <= 10:
        return "top 10%"
    if pct <= 25:
        return "top 25%"
    if pct <= 50:
        return "top 50%"
    return "bottom 50%"


def build_prompt(ctx: CoachContext, videos: list[Video]) -> str:
    lines = [
        "You are curating a 'Highlights' section on a coach's profile in a training",
        "marketplace. Pick 5 videos that best introduce a NEW VIEWER to this coach's",
        "methodology.",
        "",
        f"COACH: {ctx.name}",
        f"CATEGORY: {ctx.category}",
        f"KNOWN FOR: {ctx.known_for}",
        f"OVERVIEW: {ctx.overview}",
        "",
        "PICK 5 VIDEOS that meet ALL these criteria:",
        "  1. FOUNDATIONAL — teaches the coach's philosophy, system, or programming",
        "     framework. Not a one-off tip or news take.",
        "  2. INTRODUCTORY — a first-time viewer can watch and understand what this",
        "     coach is about. Not an advanced deep-dive that assumes prior knowledge.",
        "  3. COACH-AUTHORED — the coach's own framing, not a reaction to someone else's",
        "     work or a guest interview.",
        "  4. STANDALONE — doesn't require watching a series first.",
        "",
        "STRONG POSITIVE SIGNALS:",
        "  - 'Explained', 'How To', 'Principles', 'The Science Of', 'System', 'Routine'",
        "  - 10–30 minute duration (sweet spot for explainers)",
        "  - High rank-within-channel (don't overweight — drama gets views too)",
        "",
        "STRONG NEGATIVE SIGNALS:",
        "  - 'Critiques X', 'Reacts to Y', 'vs Z', 'I Tried X' — reaction/entertainment",
        "  - Other coaches' names in the title (likely collab or commentary)",
        "  - Duration <5 min (clip) or >45 min (podcast/livestream)",
        "  - 'Day in My Life', lifestyle vlogs, body-fat reveals",
        "  - Drama / clickbait hooks unless explaining methodology",
        "",
        "VIDEOS (top 200 by view count, ranked):",
        "",
    ]
    for i, v in enumerate(videos, 1):
        label = percentile_label(i, len(videos))
        lines.append(
            f"  {i:>3}. id={v.id} · {v.views_str:>6} views ({label}) · "
            f"{v.duration_str:>6} · {v.year} · {v.title!r}"
        )
    lines += [
        "",
        "OUTPUT: JSON array of exactly 5 picks, ranked best-first.",
        "Each entry: {\"id\": \"<video_id>\", \"rationale\": \"<one-sentence why\"}",
        "",
        "Respond with ONLY the JSON array — no preamble, no markdown fences.",
    ]
    return "\n".join(lines)


def classify(ctx: CoachContext, videos: list[Video]) -> list[dict[str, Any]]:
    import anthropic

    prompt = build_prompt(ctx, videos)
    client = anthropic.Anthropic()
    print(f"[{ctx.slug}] calling Claude with {len(videos)} candidates...", file=sys.stderr)
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()  # type: ignore[union-attr]

    # Strip markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        picks = json.loads(text)
    except json.JSONDecodeError as e:
        print(f"[{ctx.slug}] JSON parse failed: {e}\n---raw---\n{text}", file=sys.stderr)
        return []

    if not isinstance(picks, list) or len(picks) != 5:
        print(f"[{ctx.slug}] expected list of 5, got {type(picks).__name__} len={len(picks) if isinstance(picks, list) else '?'}", file=sys.stderr)
        return picks if isinstance(picks, list) else []

    # Enrich picks with video metadata for downstream use
    by_id = {v.id: v for v in videos}
    enriched = []
    for p in picks:
        vid = p.get("id")
        video = by_id.get(vid)
        if not video:
            print(f"[{ctx.slug}] WARN: picked id={vid} not in input", file=sys.stderr)
            enriched.append({**p, "title": "?", "duration": "?", "views": "?"})
            continue
        enriched.append({
            **p,
            "title": video.title,
            "duration": video.duration_str,
            "views": video.views_str,
            "year": video.year,
            "thumbnail": f"https://i.ytimg.com/vi/{vid}/maxresdefault.jpg",
        })
    return enriched


def run_one(slug: str, input_path: Path, output_path: Path) -> list[dict[str, Any]]:
    ctx = COACHES[slug]
    raw_videos = parse_input(input_path)
    sorted_videos = sorted(raw_videos, key=lambda v: v.views, reverse=True)[:200]
    picks = classify(ctx, sorted_videos)
    output_path.write_text(json.dumps(picks, indent=2))
    print(f"[{slug}] saved → {output_path}", file=sys.stderr)
    return picks


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--coach", choices=list(COACHES.keys()))
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--all", action="store_true",
                       help="Run all 4 coaches from /tmp/coach-research/<slug>-deep.txt")
    args = parser.parse_args()

    if args.all:
        out_dir = Path("/tmp/coach-research")
        slug_to_input = {
            "catalyst-athletics": out_dir / "catalyst-deep.txt",
            "dylan-shannon": out_dir / "dylan-deep.txt",
            "nippard": out_dir / "nippard-deep.txt",
            "israetel": out_dir / "rp-deep.txt",
        }
        results = {}
        for slug, input_path in slug_to_input.items():
            if not input_path.exists():
                print(f"[{slug}] SKIP: {input_path} missing", file=sys.stderr)
                continue
            output_path = out_dir / f"{slug}-picks.json"
            picks = run_one(slug, input_path, output_path)
            results[slug] = picks
            print()
            print(f"=== {slug.upper()} TOP 5 ===")
            for i, p in enumerate(picks, 1):
                print(f"  {i}. [{p.get('views', '?'):>6}] {p.get('duration', '?'):>6}  {p.get('title', '?')[:75]}")
                print(f"      → {p.get('rationale', '')}")
            print()
        return 0

    if not args.coach or not args.input or not args.output:
        parser.error("--coach, --input, --output required when not using --all")
    run_one(args.coach, args.input, args.output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
