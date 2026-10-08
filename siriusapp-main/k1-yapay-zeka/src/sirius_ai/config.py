"""Ortak sabitler. Mobil ve backend de aynı değerleri kullanmalı (bkz. docs/mimari.md)."""

from pathlib import Path

# Bir işaret ~1 saniye sürer; kamera ~30 kare/sn. Tahmin 30 karelik pencereyle yapılır.
WINDOW_SIZE = 30

NUM_HANDS = 2
POINTS_PER_HAND = 21
COORDS = 3  # x, y, z
HAND_FEATURES = POINTS_PER_HAND * COORDS  # 63
FEATURES_PER_FRAME = NUM_HANDS * HAND_FEATURES  # 126

# MediaPipe el noktası indeksleri
WRIST = 0
MIDDLE_MCP = 9

AI_ROOT = Path(__file__).resolve().parents[2]
DATA_RAW = AI_ROOT / "data" / "raw"
DATA_PROCESSED = AI_ROOT / "data" / "processed"
MODELS_DIR = AI_ROOT / "models"

HAND_LANDMARKER_PATH = MODELS_DIR / "hand_landmarker.task"
HAND_LANDMARKER_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/latest/hand_landmarker.task"
)
