"""Canlı tahmin: el noktalarını pencerede biriktirir, modelden geçirir, kararlı sonucu yayınlar.

İki mod var:
- Gerçek mod: models/sirius.tflite + labels.json varsa.
- Demo modu: model yoksa. Belirli aralıklarla rastgele bir kelime döner (mock=True),
  böylece mobil ekip model hazır olmadan uçtan uca akışı geliştirebilir.
"""

from __future__ import annotations

import json
import logging
import random
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional, Protocol

import numpy as np

from sirius_ai.config import WINDOW_SIZE
from sirius_ai.landmarks import has_hand
from sirius_ai.sequence import SlidingWindow

from ..config import Settings

log = logging.getLogger("sirius.predictor")

# Bu kadar ardışık karede el görünmezse pencere sıfırlanır (aynı kelime tekrar yapılabilsin).
NO_HAND_RESET_FRAMES = 4


class Classifier(Protocol):
    labels: list[str]

    def predict(self, window: np.ndarray) -> np.ndarray:
        """(WINDOW_SIZE, 126) → (sınıf sayısı,) olasılıklar"""


@dataclass
class Prediction:
    word: str
    confidence: float
    mock: bool = False

    def to_message(self) -> dict:
        return {"type": "prediction", "word": self.word, "confidence": round(self.confidence, 3), "mock": self.mock}


class TFLiteClassifier:
    def __init__(self, model_path: Path, labels: list[str]) -> None:
        Interpreter = _load_interpreter()
        self.labels = labels
        self._interp = Interpreter(model_path=str(model_path))
        self._interp.allocate_tensors()
        self._in = self._interp.get_input_details()[0]
        self._out = self._interp.get_output_details()[0]

    def predict(self, window: np.ndarray) -> np.ndarray:
        x = window.astype(np.float32)[None, ...]
        self._interp.set_tensor(self._in["index"], x)
        self._interp.invoke()
        return self._interp.get_tensor(self._out["index"])[0]


def _load_interpreter():
    try:
        from ai_edge_litert.interpreter import Interpreter

        return Interpreter
    except ImportError:
        pass
    try:
        from tflite_runtime.interpreter import Interpreter

        return Interpreter
    except ImportError:
        pass
    import tensorflow as tf  # en ağır seçenek, en sona bırakıldı

    return tf.lite.Interpreter


class Session:
    """Tek bir WebSocket bağlantısının tahmin durumu (gerçek mod)."""

    def __init__(self, classifier: Classifier, threshold: float, vote_frames: int) -> None:
        self.classifier = classifier
        self.threshold = threshold
        self.window = SlidingWindow(WINDOW_SIZE)
        self.votes: deque[Optional[int]] = deque(maxlen=max(1, vote_frames))
        self.no_hand = 0
        self.last_emitted: Optional[int] = None

    def reset(self) -> None:
        self.window.clear()
        self.votes.clear()
        self.no_hand = 0
        self.last_emitted = None

    def push(self, features: np.ndarray) -> Optional[Prediction]:
        if not has_hand(features):
            self.no_hand += 1
            if self.no_hand >= NO_HAND_RESET_FRAMES:
                self.reset()
            return None
        self.no_hand = 0
        self.window.push(features)
        if not self.window.ready:
            return None

        probs = self.classifier.predict(self.window.array())
        top = int(np.argmax(probs))
        conf = float(probs[top])
        self.votes.append(top if conf >= self.threshold else None)

        stable = len(self.votes) == self.votes.maxlen and all(v == top for v in self.votes)
        if stable and top != self.last_emitted:
            self.last_emitted = top
            return Prediction(self.classifier.labels[top], conf)
        return None


class MockSession:
    """Demo modu: her `every` karede bir rastgele kelime."""

    def __init__(self, labels: list[str], every: int, rng: random.Random | None = None) -> None:
        self.labels = labels
        self.every = max(1, every)
        self.count = 0
        self.rng = rng or random.Random()
        self.window = SlidingWindow(WINDOW_SIZE)  # sadece "filled" bilgisi için

    def reset(self) -> None:
        self.count = 0
        self.window.clear()

    def push(self, features: np.ndarray) -> Optional[Prediction]:
        self.count += 1
        self.window.push(features)
        if self.count % self.every == 0:
            return Prediction(self.rng.choice(self.labels), self.rng.uniform(0.86, 0.99), mock=True)
        return None


class Engine:
    """Uygulama başlarken bir kez kurulur; her bağlantı için Session üretir."""

    def __init__(self, settings: Settings, word_ids: list[str]) -> None:
        self.settings = settings
        self.classifier: Optional[Classifier] = None
        self.labels = word_ids
        if settings.model_path.exists() and settings.labels_path.exists():
            try:
                labels = json.loads(settings.labels_path.read_text(encoding="utf-8"))
                self.classifier = TFLiteClassifier(settings.model_path, labels)
                self.labels = labels
                log.info("Gerçek model yüklendi: %s (%d kelime)", settings.model_path, len(labels))
            except Exception:  # noqa: BLE001
                log.exception("Model yüklenemedi, DEMO moduna geçiliyor")
        else:
            log.warning("Model bulunamadı (%s). DEMO modunda çalışılıyor.", settings.model_path)

        self.has_landmarker = settings.landmarker_path.exists()
        if not self.has_landmarker:
            log.warning("El modeli yok (%s); el algılama kapalı.", settings.landmarker_path)
            if self.classifier is not None:
                log.error("Gerçek model var ama el modeli yok: tahmin yapılamaz. "
                          "k1-yapay-zeka/ klasöründe `python scripts/download_models.py` çalıştırın.")

    @property
    def mock(self) -> bool:
        return self.classifier is None

    def new_session(self):
        if self.classifier is None:
            return MockSession(self.labels, self.settings.mock_every)
        return Session(self.classifier, self.settings.confidence_threshold, self.settings.vote_frames)

    def new_extractor(self) -> Optional[Any]:
        """Bağlantı başına bir el noktası çıkarıcı. El modeli yoksa None."""
        if not self.has_landmarker:
            return None
        from sirius_ai.landmarks import HandLandmarkExtractor

        return HandLandmarkExtractor(self.settings.landmarker_path, video_mode=False)
