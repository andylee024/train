"""Train runtime config."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    linq_api_base_url: str
    linq_api_key: str
    linq_from_number: str
    admin_secret: str
    andy_phone: str
    log_level: str

    @classmethod
    def from_env(cls) -> Config:
        return cls(
            linq_api_base_url=os.getenv(
                "LINQ_API_BASE_URL", "https://api.linqapp.com/api/partner"
            ),
            linq_api_key=os.getenv("LINQ_API_KEY", ""),
            linq_from_number=os.getenv("LINQ_FROM_NUMBER", ""),
            admin_secret=os.getenv("TRAIN_ADMIN_SECRET", ""),
            andy_phone=os.getenv("TRAIN_ANDY_PHONE", ""),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )


CONFIG = Config.from_env()
