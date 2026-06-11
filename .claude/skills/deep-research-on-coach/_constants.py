"""Shared constants for the deep-research-on-coach skill.

Bump CURRENT_DOCUMENT_SCHEMA whenever the extraction schema (the shape of
content_text, raw_metadata, or any extractor-produced field) changes in a
backwards-incompatible way. The next run will re-extract every document whose
recorded schema_version is older than this.
"""

CURRENT_DOCUMENT_SCHEMA = 1
"""Document-extraction schema version. Bump = full re-extract semantics."""

DEFAULT_MAX_DISCOVERY_COST = 15.0
"""Soft cap on discover-stage search API spend in USD per run."""

STORAGE_BUCKET = "coach-content"
"""Supabase Storage bucket for binary artifacts (PDFs, audio)."""
