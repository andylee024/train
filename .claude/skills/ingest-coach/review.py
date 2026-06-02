#!/usr/bin/env python3
"""Stage 5 — Review: side-by-side diff between draft and committed guide.

Prints a unified diff between `.ingestion-cache/<coach>/draft/` and
`docs/content/training-styles/<coach>/` to stdout. Reviewer reads it,
then decides whether to run `land.py --approve`.

If the committed directory doesn't exist yet (first-time ingestion),
prints the full draft as additions.

Run:
    python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics

    # Just summary, not full diff:
    python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics --summary

    # Highlight citation density per video:
    python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics --citations
"""
from __future__ import annotations

import argparse
import difflib
import json
import sys
from pathlib import Path

from manifest import draft_dir
from synthesize import CITATION_RE


COMMITTED_ROOT = Path("docs/content/training-styles")


def committed_dir(coach_slug: str) -> Path:
    return COMMITTED_ROOT / coach_slug


# ANSI colors (cheap; auto-skip if stdout isn't a tty)
def _c(code: str, s: str) -> str:
    if not sys.stdout.isatty():
        return s
    return f"\033[{code}m{s}\033[0m"


def diff_files(draft_path: Path, committed_path: Path) -> str:
    """Return a unified diff for one file pair."""
    if committed_path.exists():
        committed_lines = committed_path.read_text().splitlines(keepends=True)
        committed_label = f"committed: {committed_path}"
    else:
        committed_lines = []
        committed_label = "(no committed version — first ingestion)"

    draft_lines = draft_path.read_text().splitlines(keepends=True)
    diff = difflib.unified_diff(
        committed_lines,
        draft_lines,
        fromfile=committed_label,
        tofile=f"draft: {draft_path}",
        lineterm="",
    )
    out = []
    for line in diff:
        line = line.rstrip("\n")
        if line.startswith("+++") or line.startswith("---"):
            out.append(_c("1", line))
        elif line.startswith("+"):
            out.append(_c("32", line))
        elif line.startswith("-"):
            out.append(_c("31", line))
        elif line.startswith("@@"):
            out.append(_c("36", line))
        else:
            out.append(line)
    return "\n".join(out)


def summarize(draft_path: Path, committed_path: Path) -> dict:
    draft = draft_path.read_text() if draft_path.exists() else ""
    committed = committed_path.read_text() if committed_path.exists() else ""
    return {
        "file": draft_path.name,
        "draft_chars": len(draft),
        "committed_chars": len(committed),
        "delta_chars": len(draft) - len(committed),
        "draft_lines": draft.count("\n"),
        "committed_lines": committed.count("\n"),
        "draft_citations": len(CITATION_RE.findall(draft)),
        "committed_citations": len(CITATION_RE.findall(committed)),
        "first_ingestion": not committed_path.exists(),
    }


def show_citation_density(coach_slug: str) -> None:
    """Print which videos are cited where in the draft."""
    ddir = draft_dir(coach_slug)
    sources_path = ddir / "sources.json"
    if not sources_path.exists():
        print(f"No sources.json at {sources_path}", file=sys.stderr)
        return
    sources = json.loads(sources_path.read_text())
    print(f"\n{_c('1', 'Citation map:')} {sources['n_citations']} markers across {len(sources['cited_videos'])} videos")
    print()
    rows = []
    for key, meta in sources["cited_videos"].items():
        guide_n = (ddir / "guide.md").read_text().count(f"[^{key}]")
        ex_n = (ddir / "exercise-selection.md").read_text().count(f"[^{key}]")
        rows.append((meta["video_id"], guide_n, ex_n, meta["title"][:60]))
    rows.sort(key=lambda r: -(r[1] + r[2]))
    print(f"  {'video_id':<12s}  {'guide':>5s}  {'exrs':>4s}  title")
    for vid, g, e, title in rows:
        print(f"  {vid:<12s}  {g:>5d}  {e:>4d}  {title}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coach", required=True)
    ap.add_argument("--summary", action="store_true", help="Just print line counts + deltas, no diff")
    ap.add_argument("--citations", action="store_true", help="Print per-video citation density")
    args = ap.parse_args()

    ddir = draft_dir(args.coach)
    cdir = committed_dir(args.coach)

    if not ddir.exists():
        print(f"No draft at {ddir}. Run synthesize.py first.", file=sys.stderr)
        return 2

    files = ["guide.md", "exercise-selection.md", "sources.json"]
    summaries = []
    for fname in files:
        s = summarize(ddir / fname, cdir / fname)
        summaries.append(s)

    print(f"\n{_c('1', f'Review: {args.coach}')}")
    print(f"  draft:      {ddir}/")
    print(f"  committed:  {cdir}/")
    print()
    print(f"  {'file':<24s}  {'draft':>8s}  {'committed':>10s}  {'Δ':>8s}  {'cites':>6s}")
    for s in summaries:
        first = " (NEW)" if s["first_ingestion"] else ""
        delta = f"+{s['delta_chars']}" if s["delta_chars"] >= 0 else str(s["delta_chars"])
        print(f"  {s['file']:<24s}  {s['draft_chars']:>8d}  {s['committed_chars']:>10d}  {delta:>8s}  {s['draft_citations']:>6d}{first}")

    if args.citations:
        show_citation_density(args.coach)

    if args.summary:
        return 0

    print()
    print(_c("1", "--- diffs ---"))
    for fname in files:
        dpath = ddir / fname
        cpath = cdir / fname
        if not dpath.exists():
            continue
        print()
        print(_c("1;36", f"### {fname}"))
        out = diff_files(dpath, cpath)
        if out.strip():
            print(out)
        else:
            print("  (no changes)")

    print()
    print(_c("1", "Next:"))
    print(f"  Approve: python3 .claude/skills/ingest-coach/land.py --coach {args.coach} --approve")
    print(f"  Reject:  edit prompts/ and re-run synthesize.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
