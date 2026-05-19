"""Linq webhook parsing + in-memory dedup.

Linq is at-least-once on inbound webhooks; we dedup by message id with a
small LRU. One process is fine at prototype scale.
"""

from __future__ import annotations

from collections import OrderedDict
from typing import Any


def _first_text_part(parts: object) -> str:
    if not isinstance(parts, list):
        return ""
    for part in parts:
        if isinstance(part, dict) and part.get("type") == "text":
            value = part.get("value")
            if isinstance(value, str):
                return value
    return ""


def parse_inbound(body: dict[str, Any]) -> dict[str, Any]:
    """Normalize Linq v1/v2 inbound shapes into:
        {kind: "received"|"ignored",
         external_message_id, sender_phone, chat_id, text}
    """
    event = (
        body.get("event") or body.get("type") or body.get("event_type") or ""
    ).lower()
    if event and "receiv" not in event and "incoming" not in event:
        return {"kind": "ignored", "event": event}

    inner = body.get("data") if isinstance(body.get("data"), dict) else body
    chat = inner.get("chat") or body.get("chat") or {}
    message = inner.get("message") if isinstance(inner.get("message"), dict) else inner

    sender_phone = (
        message.get("from")
        or message.get("from_phone")
        or inner.get("from")
        or inner.get("from_phone")
        or chat.get("participant_phone")
        or body.get("from")
        or body.get("from_phone")
        or ""
    )
    text = (
        message.get("text")
        or _first_text_part(message.get("parts"))
        or inner.get("text")
        or body.get("text")
        or ""
    )
    chat_id = (
        chat.get("id")
        or message.get("chat_id")
        or inner.get("chat_id")
        or body.get("chat_id")
        or ""
    )
    message_id = (
        message.get("id")
        or inner.get("message_id")
        or inner.get("id")
        or body.get("message_id")
        or body.get("id")
        or ""
    )

    if not sender_phone or not text:
        return {"kind": "ignored", "event": event or "unknown"}

    return {
        "kind": "received",
        "external_message_id": str(message_id) or f"linq:{chat_id}:{hash(text)}",
        "sender_phone": str(sender_phone),
        "chat_id": str(chat_id),
        "text": str(text).strip(),
    }


class SeenMessageIds:
    """LRU-bounded set for webhook dedup."""

    def __init__(self, capacity: int = 4096) -> None:
        self._cap = capacity
        self._items: OrderedDict[str, None] = OrderedDict()

    def __contains__(self, message_id: str) -> bool:
        return message_id in self._items

    def add(self, message_id: str) -> None:
        if message_id in self._items:
            self._items.move_to_end(message_id)
            return
        self._items[message_id] = None
        while len(self._items) > self._cap:
            self._items.popitem(last=False)
