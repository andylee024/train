"""Linq partner-API v2 SMS client.

    POST {api_base_url}/v2/chats
    headers: X-LINQ-INTEGRATION-TOKEN: <token>
    body: {send_from, chat: {phone_numbers}, message: {text}}

Never raises on HTTP / network errors — returns a dict so callers can
fire-and-forget. Mirrors lobs-ai/packages/linq-client.
"""

from __future__ import annotations

from typing import Any

import httpx


async def send_sms(
    *,
    api_base_url: str,
    api_key: str,
    from_number: str,
    to_phone: str,
    text: str,
    timeout: float = 20.0,
) -> dict[str, Any]:
    api_key = (api_key or "").strip()
    from_number = (from_number or "").strip()
    if not api_key or not from_number:
        return {"sent": False, "to_phone": to_phone, "reason": "linq_not_configured"}
    payload = {
        "send_from": from_number,
        "chat": {"phone_numbers": [to_phone]},
        "message": {"text": text},
    }
    headers = {"X-LINQ-INTEGRATION-TOKEN": api_key, "Accept": "application/json"}
    url = f"{api_base_url.rstrip('/')}/v2/chats"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, json=payload, headers=headers)
    except httpx.HTTPError as exc:
        return {"sent": False, "to_phone": to_phone, "error": str(exc)}
    if resp.status_code >= 400:
        return {
            "sent": False,
            "to_phone": to_phone,
            "status": resp.status_code,
            "body": resp.text[:200],
        }
    try:
        data = resp.json()
    except ValueError:
        return {"sent": True, "to_phone": to_phone, "status": resp.status_code}
    message = data.get("message") or data.get("data") or {}
    return {
        "sent": True,
        "to_phone": to_phone,
        "status": resp.status_code,
        "message_id": message.get("id") or data.get("id"),
    }
