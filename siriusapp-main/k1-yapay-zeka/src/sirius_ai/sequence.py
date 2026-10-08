"""Kare dizileri: sabit uzunluğa getirme ve canlı akış için kayan pencere."""

from __future__ import annotations

from collections import deque

import numpy as np

from .config import FEATURES_PER_FRAME, WINDOW_SIZE


def resample(frames: np.ndarray, length: int = WINDOW_SIZE) -> np.ndarray:
    """(N, F) diziyi doğrusal aralıklı kare seçerek (length, F) yapar.

    Videolar farklı uzunlukta olduğu için eğitimden önce hepsi aynı uzunluğa getirilir.
    """
    frames = np.asarray(frames, dtype=np.float32)
    if frames.ndim != 2:
        raise ValueError(f"Beklenen (N, F), gelen {frames.shape}")
    n = frames.shape[0]
    if n == 0:
        return np.zeros((length, frames.shape[1] or FEATURES_PER_FRAME), dtype=np.float32)
    idx = np.linspace(0, n - 1, num=length).round().astype(int)
    return frames[idx]


def trim_empty(frames: np.ndarray) -> np.ndarray:
    """Başta ve sonda elin görünmediği (tamamen sıfır) kareleri atar."""
    frames = np.asarray(frames)
    nonzero = np.flatnonzero(np.any(frames != 0, axis=1))
    if nonzero.size == 0:
        return frames[:0]
    return frames[nonzero[0] : nonzero[-1] + 1]


class SlidingWindow:
    """Canlı akışta son `size` kareyi tutar."""

    def __init__(self, size: int = WINDOW_SIZE) -> None:
        self.size = size
        self._frames: deque[np.ndarray] = deque(maxlen=size)

    def push(self, features: np.ndarray) -> None:
        self._frames.append(np.asarray(features, dtype=np.float32))

    @property
    def filled(self) -> int:
        return len(self._frames)

    @property
    def ready(self) -> bool:
        return len(self._frames) == self.size

    def array(self) -> np.ndarray:
        return np.stack(list(self._frames)) if self._frames else np.zeros((0, FEATURES_PER_FRAME))

    def clear(self) -> None:
        self._frames.clear()
