"""Ayarlar ortam değişkenlerinden okunur (bkz. .env.example)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]


def _path(name: str, default: str) -> Path:
    p = Path(os.getenv(name, default))
    return p if p.is_absolute() else (BACKEND_ROOT / p).resolve()


@dataclass
class Settings:
    model_path: Path = field(default_factory=lambda: _path("SIRIUS_MODEL_PATH", "models/sirius.tflite"))
    labels_path: Path = field(default_factory=lambda: _path("SIRIUS_LABELS_PATH", "models/labels.json"))
    landmarker_path: Path = field(
        default_factory=lambda: _path("SIRIUS_LANDMARKER_PATH", "../k1-yapay-zeka/models/hand_landmarker.task")
    )
    confidence_threshold: float = field(
        default_factory=lambda: float(os.getenv("SIRIUS_CONFIDENCE_THRESHOLD", "0.80"))
    )
    vote_frames: int = field(default_factory=lambda: int(os.getenv("SIRIUS_VOTE_FRAMES", "3")))
    mock_every: int = field(default_factory=lambda: int(os.getenv("SIRIUS_MOCK_EVERY", "12")))
    # Sözlüğün tek kaynağı repo kökündeki ortak/ klasörüdür.
    words_path: Path = BACKEND_ROOT.parent / "ortak" / "veri" / "words.json"
