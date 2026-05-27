"""Thin Supabase REST (PostgREST) client.

We don't pull in supabase-py to keep the Modal image lean; httpx +
PostgREST endpoints is enough for our row-shape operations.

All v0 tables have RLS disabled, so SUPABASE_KEY can be either the
anon key or the service_role key.

Env:
    SUPABASE_URL          e.g. https://vtruwlvekfnmfgaundhp.supabase.co
    SUPABASE_KEY          anon or service_role (PostgREST JWT)
"""

from __future__ import annotations

import os
from typing import Any

import httpx


_DEFAULT_TIMEOUT = 20.0


def _config() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
    if not url or not key:
        raise RuntimeError(
            "Supabase not configured: set SUPABASE_URL and SUPABASE_KEY "
            "(anon or service_role)."
        )
    return url, key


def _headers(key: str, *, prefer: str | None = None) -> dict[str, str]:
    h = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if prefer:
        h["Prefer"] = prefer
    return h


async def insert(
    table: str,
    row: dict[str, Any] | list[dict[str, Any]],
    *,
    returning: bool = True,
    on_conflict: str | None = None,
    timeout: float = _DEFAULT_TIMEOUT,
) -> list[dict[str, Any]]:
    """Insert one or many rows. Returns inserted rows (when returning=True).

    on_conflict: if set, becomes an UPSERT on that unique constraint.
    """
    url, key = _config()
    endpoint = f"{url}/rest/v1/{table}"
    params: dict[str, str] = {}
    prefer_parts: list[str] = []
    if returning:
        prefer_parts.append("return=representation")
    if on_conflict:
        prefer_parts.append("resolution=merge-duplicates")
        params["on_conflict"] = on_conflict
    prefer = ",".join(prefer_parts) if prefer_parts else None

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(
            endpoint,
            params=params,
            json=row,
            headers=_headers(key, prefer=prefer),
        )
    if resp.status_code >= 400:
        raise RuntimeError(
            f"supabase insert {table} failed: {resp.status_code} {resp.text[:300]}"
        )
    if returning:
        try:
            data = resp.json()
        except ValueError:
            return []
        return data if isinstance(data, list) else [data]
    return []


async def update(
    table: str,
    patch: dict[str, Any],
    *,
    eq: dict[str, Any] | None = None,
    timeout: float = _DEFAULT_TIMEOUT,
) -> list[dict[str, Any]]:
    url, key = _config()
    endpoint = f"{url}/rest/v1/{table}"
    params: dict[str, str] = {}
    for k, v in (eq or {}).items():
        params[k] = f"eq.{v}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.patch(
            endpoint,
            params=params,
            json=patch,
            headers=_headers(key, prefer="return=representation"),
        )
    if resp.status_code >= 400:
        raise RuntimeError(
            f"supabase update {table} failed: {resp.status_code} {resp.text[:300]}"
        )
    try:
        data = resp.json()
    except ValueError:
        return []
    return data if isinstance(data, list) else [data]


async def select(
    table: str,
    *,
    columns: str = "*",
    eq: dict[str, Any] | None = None,
    order: str | None = None,
    limit: int | None = None,
    gte: dict[str, Any] | None = None,
    lte: dict[str, Any] | None = None,
    timeout: float = _DEFAULT_TIMEOUT,
) -> list[dict[str, Any]]:
    url, key = _config()
    endpoint = f"{url}/rest/v1/{table}"
    params: dict[str, str] = {"select": columns}
    for k, v in (eq or {}).items():
        params[k] = f"eq.{v}"
    for k, v in (gte or {}).items():
        params[k] = f"gte.{v}"
    for k, v in (lte or {}).items():
        params[k] = f"lte.{v}"
    if order:
        params["order"] = order
    if limit is not None:
        params["limit"] = str(limit)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(endpoint, params=params, headers=_headers(key))
    if resp.status_code >= 400:
        raise RuntimeError(
            f"supabase select {table} failed: {resp.status_code} {resp.text[:300]}"
        )
    try:
        data = resp.json()
    except ValueError:
        return []
    return data if isinstance(data, list) else []


async def upsert(
    table: str,
    row: dict[str, Any] | list[dict[str, Any]],
    *,
    on_conflict: str,
    returning: bool = True,
    timeout: float = _DEFAULT_TIMEOUT,
) -> list[dict[str, Any]]:
    return await insert(
        table, row, returning=returning, on_conflict=on_conflict, timeout=timeout
    )


__all__ = ["insert", "update", "select", "upsert"]
