"""El noktası çıkarma (MediaPipe Tasks) ve normalizasyon.

Not: MediaPipe 0.10.2x sonrası eski `mp.solutions.hands` API'si kaldırıldı.
Burada yeni Tasks API'si (`HandLandmarker`) kullanılıyor; bunun için
`hand_landmarker.task` model dosyası gerekir:

    python scripts/download_models.py

MediaPipe ve OpenCV bu modülde sadece ihtiyaç anında içe aktarılır; böylece
normalizasyon fonksiyonları (ve testleri) bu kütüphaneler olmadan da çalışır.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Sequence

import numpy as np

from .config import (
    FEATURES_PER_FRAME,
    HAND_FEATURES,
    HAND_LANDMARKER_PATH,
    MIDDLE_MCP,
    POINTS_PER_HAND,
    WRIST,
)


def normalize_hand(points: np.ndarray) -> np.ndarray:
    """(21, 3) el noktalarını bileğe göre öteler ve el boyutuna göre ölçekler.

    Böylece el kameraya yakın/uzak ya da kadrajın solunda/sağında olsa da
    aynı işaret aynı sayılara dönüşür.
    """
    points = np.asarray(points, dtype=np.float32)
    if points.shape != (POINTS_PER_HAND, 3):
        raise ValueError(f"Beklenen şekil (21, 3), gelen {points.shape}")
    centered = points - points[WRIST]
    scale = float(np.linalg.norm(centered[MIDDLE_MCP]))
    if scale < 1e-6:
        return centered
    return centered / scale


def features_from_hands(hands: Sequence[tuple[str, np.ndarray]]) -> np.ndarray:
    """[(\"Left\"|\"Right\", (21,3)), ...] listesinden 126'lık özellik vektörü üretir.

    İndeks 0-62 sol el, 63-125 sağ el. Görünmeyen el sıfırla doldurulur.
    """
    out = np.zeros(FEATURES_PER_FRAME, dtype=np.float32)
    for side, pts in hands:
        offset = 0 if side.lower().startswith("l") else HAND_FEATURES
        out[offset : offset + HAND_FEATURES] = normalize_hand(pts).reshape(-1)
    return out


def hands_from_result(result: Any) -> list[tuple[str, np.ndarray]]:
    """MediaPipe HandLandmarkerResult nesnesini [(taraf, (21,3))] listesine çevirir."""
    hands: list[tuple[str, np.ndarray]] = []
    for landmarks, handedness in zip(result.hand_landmarks, result.handedness):
        side = handedness[0].category_name if handedness else "Right"
        pts = np.array([[lm.x, lm.y, lm.z] for lm in landmarks], dtype=np.float32)
        hands.append((side, pts))
    return hands


def has_hand(features: np.ndarray) -> bool:
    return bool(np.any(features))


class HandLandmarkExtractor:
    """BGR kareden (OpenCV formatı) 126'lık özellik vektörü çıkarır.

    video_mode=True: ardışık kareler (video/webcam) için takip kullanır, daha hızlıdır;
    bu modda `extract` çağrısına artan bir `timestamp_ms` verilmelidir.
    """

    def __init__(
        self,
        model_path: str | Path = HAND_LANDMARKER_PATH,
        num_hands: int = 2,
        video_mode: bool = False,
        min_confidence: float = 0.5,
    ) -> None:
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError(
                f"{model_path} bulunamadı. Önce `python scripts/download_models.py` çalıştırın."
            )
        import mediapipe as mp
        from mediapipe.tasks.python import BaseOptions, vision

        self._mp = mp
        self._video_mode = video_mode
        options = vision.HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=str(model_path)),
            running_mode=vision.RunningMode.VIDEO if video_mode else vision.RunningMode.IMAGE,
            num_hands=num_hands,
            min_hand_detection_confidence=min_confidence,
            min_hand_presence_confidence=min_confidence,
            min_tracking_confidence=min_confidence,
        )
        self._landmarker = vision.HandLandmarker.create_from_options(options)
        self.last_hands: list[tuple[str, np.ndarray]] = []

    def extract(self, bgr_frame: np.ndarray, timestamp_ms: int | None = None) -> np.ndarray:
        import cv2

        rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
        image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=rgb)
        if self._video_mode:
            if timestamp_ms is None:
                raise ValueError("video_mode=True iken timestamp_ms zorunlu")
            result = self._landmarker.detect_for_video(image, int(timestamp_ms))
        else:
            result = self._landmarker.detect(image)
        self.last_hands = hands_from_result(result)
        return features_from_hands(self.last_hands)

    def close(self) -> None:
        self._landmarker.close()

    def __enter__(self) -> "HandLandmarkExtractor":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()
