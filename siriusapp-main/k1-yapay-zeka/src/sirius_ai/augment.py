"""Veri çoğaltma: az veriyle daha dayanıklı model (yol haritası H5)."""

from __future__ import annotations

import numpy as np

from .config import COORDS, HAND_FEATURES


def mirror(seq: np.ndarray) -> np.ndarray:
    """Sol ve sağ eli yer değiştirip x eksenini ters çevirir (solak kullanıcılar için)."""
    seq = np.array(seq, dtype=np.float32, copy=True)
    left = seq[:, :HAND_FEATURES].copy()
    right = seq[:, HAND_FEATURES:].copy()
    seq[:, :HAND_FEATURES], seq[:, HAND_FEATURES:] = right, left
    seq[:, 0::COORDS] *= -1  # x koordinatları
    return seq


def jitter(seq: np.ndarray, sigma: float = 0.02, rng: np.random.Generator | None = None) -> np.ndarray:
    """Görünen el noktalarına küçük gürültü ekler; boş (sıfır) eller sıfır kalır."""
    rng = rng or np.random.default_rng()
    seq = np.asarray(seq, dtype=np.float32)
    noise = rng.normal(0, sigma, seq.shape).astype(np.float32)
    return np.where(seq != 0, seq + noise, 0.0).astype(np.float32)


def augment_dataset(X: np.ndarray, y: np.ndarray, rng: np.random.Generator | None = None):
    """Her örneğe ayna ve gürültülü kopya ekler (veri 3 katına çıkar)."""
    rng = rng or np.random.default_rng(42)
    Xs = [X, np.stack([mirror(s) for s in X]), np.stack([jitter(s, rng=rng) for s in X])]
    return np.concatenate(Xs), np.concatenate([y, y, y])
