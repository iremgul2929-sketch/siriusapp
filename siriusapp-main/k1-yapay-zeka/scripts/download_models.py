"""MediaPipe el noktası modelini (hand_landmarker.task) models/ altına indirir.

Kullanım:
    python scripts/download_models.py
"""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from sirius_ai.config import HAND_LANDMARKER_PATH, HAND_LANDMARKER_URL  # noqa: E402


def main() -> None:
    HAND_LANDMARKER_PATH.parent.mkdir(parents=True, exist_ok=True)
    if HAND_LANDMARKER_PATH.exists():
        print(f"Zaten var: {HAND_LANDMARKER_PATH}")
        return
    print(f"İndiriliyor: {HAND_LANDMARKER_URL}")
    urllib.request.urlretrieve(HAND_LANDMARKER_URL, HAND_LANDMARKER_PATH)
    size_mb = HAND_LANDMARKER_PATH.stat().st_size / 1e6
    print(f"Kaydedildi: {HAND_LANDMARKER_PATH} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
