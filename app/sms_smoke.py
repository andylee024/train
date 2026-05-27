"""Smoke tests for the SMS automation (V1 backend).

Run locally (no Modal, no network):

    python3 -m app.sms_smoke

Each test exercises a piece of the loop with pure-Python inputs and asserts
the structured output. None of these touch Supabase, Linq, or Anthropic.

These are deliberately tiny — the goal is "imports clean, parsers don't
explode on common inputs" rather than full integration coverage.
"""

from __future__ import annotations

import datetime as _dt
import sys


def _check(label: str, condition: bool, detail: str = "") -> None:
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f"  → {detail}" if detail else ""))
    if not condition:
        sys.exit(1)


def smoke_intent_classifier() -> None:
    from app.sms_inbox import classify_intent

    cases = [
        ("171.4", "bodyweight"),
        ("bw 170", "bodyweight"),
        ("weight 168.5 felt heavy", "bodyweight"),
        ("help", "help"),
        ("5x5 @ 215 bench", "workout_log"),
        ("squat 240x3 250x2 260x1", "workout_log"),
        ("Did some squats today", "workout_log"),  # 'squat' keyword
        ("hello there", "other"),
    ]
    for text, want in cases:
        got = classify_intent(text)
        _check(f"classify_intent({text!r})", got == want, f"got={got} want={want}")


def smoke_session_formatter() -> None:
    from app.bundle_reader import DaySection
    from app.sms_session import format_session_sms

    body = (
        "1. **[DNT]** Muscle Snatch: 6×2 @ 80% (≈115 lb — calibrate)\n"
        "2. **[ARC]** Bench Press: 4×6 @ 175 lb\n"
        "3. **[ARC]** Barbell Row: 4×6 @ 170 lb\n"
        "\n"
        "### Cool-down\n"
        "4. Internal Rotation: 2×10/side\n"
    )
    day = DaySection(
        date=_dt.date(2026, 5, 18),
        title="Upper Horizontal + DNT accessories",
        body=body,
    )
    sms = format_session_sms(day)
    _check("format_session_sms includes title", "Upper Horizontal" in sms, sms[:80])
    _check("format_session_sms strips bold", "**" not in sms)
    _check("format_session_sms keeps main lifts", "Bench Press" in sms)
    _check("format_session_sms stops at ###", "Internal Rotation" not in sms)
    _check("format_session_sms has footer", "Log when done" in sms)


def smoke_bundle_lookup() -> None:
    """Find today's section from the actual current-week.md — soft check.

    Doesn't assert a hit (today might be a rest day or outside the active
    week range); only asserts the function doesn't raise.
    """
    from app.bundle_reader import current_week_path, find_today_session

    section = find_today_session()  # whatever today is
    _check(
        "find_today_session returns DaySection or None",
        section is None or hasattr(section, "title"),
        f"path={current_week_path()} hit={section is not None}",
    )


def smoke_bw_curve() -> None:
    from app.sms_parser import _bw_curve_gap

    # Wk 0 baseline
    target, gap = _bw_curve_gap(192.0, _dt.date(2026, 5, 3))
    _check("bw curve at baseline", target == 192.0 and gap == 0.0, f"t={target} g={gap}")
    # Halfway between Wk 0 (192) and Wk 6 (188) = Wk 3 (~190)
    target, gap = _bw_curve_gap(190.0, _dt.date(2026, 5, 24))
    _check("bw curve mid-block-1", target is not None and 189 < target < 191, f"t={target}")


def smoke_confirmation_format() -> None:
    from app.sms_parser import _format_confirmation

    # uniform sets
    sets = [
        {"exercise_name": "Bench Press", "set_index": i, "reps": 5,
         "weight_value": 215, "weight_unit": "lb"} for i in range(1, 6)
    ]
    out = _format_confirmation(sets)
    _check("confirmation uniform format", "5x5" in out and "Bench Press" in out, out)

    # varied sets
    varied = [
        {"exercise_name": "Back Squat", "set_index": 1, "reps": 3, "weight_value": 240, "weight_unit": "lb"},
        {"exercise_name": "Back Squat", "set_index": 2, "reps": 2, "weight_value": 250, "weight_unit": "lb"},
        {"exercise_name": "Back Squat", "set_index": 3, "reps": 1, "weight_value": 260, "weight_unit": "lb"},
    ]
    out = _format_confirmation(varied)
    _check(
        "confirmation varied format",
        "240x3" in out and "260x1" in out,
        out,
    )


def smoke_imports() -> None:
    """Verify all V1 modules import cleanly."""
    import app.bundle_reader  # noqa: F401
    import app.cron.block_retro  # noqa: F401
    import app.cron.daily_sender  # noqa: F401
    import app.cron.sunday_digest  # noqa: F401
    import app.digest_renderer  # noqa: F401
    import app.sms_inbox  # noqa: F401
    import app.sms_parser  # noqa: F401
    import app.sms_session  # noqa: F401
    import app.supabase_client  # noqa: F401

    _check("all V1 modules importable", True)


def main() -> None:
    smoke_imports()
    smoke_intent_classifier()
    smoke_session_formatter()
    smoke_bundle_lookup()
    smoke_bw_curve()
    smoke_confirmation_format()
    print("\nAll SMS smoke checks passed.")


if __name__ == "__main__":
    main()
